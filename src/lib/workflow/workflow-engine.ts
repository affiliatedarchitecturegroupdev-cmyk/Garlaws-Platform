// Advanced Workflow Execution Engine

import {
  Workflow,
  WorkflowNode,
  WorkflowExecution,
  WorkflowContext,
  NodeExecution,
  ExecutionLog,
  WorkflowEvent,
  ConditionRule
} from './workflow-models';

export class WorkflowEngine {
  private executions: Map<string, WorkflowExecution> = new Map();
  private activeContexts: Map<string, WorkflowContext> = new Map();
  private eventListeners: Set<(event: WorkflowEvent) => void> = new Set();

  // Execute a workflow
  async executeWorkflow(
    workflow: Workflow,
    triggerData?: any,
    variables: Record<string, any> = {}
  ): Promise<WorkflowExecution> {
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const execution: WorkflowExecution = {
      id: executionId,
      workflowId: workflow.id,
      workflowVersion: workflow.version,
      status: 'pending',
      trigger: workflow.triggers[0] || { id: 'manual', type: 'manual', config: {}, enabled: true },
      triggerData,
      startedAt: new Date(),
      nodeExecutions: [],
      variables: { ...workflow.variables.reduce((acc, v) => ({ ...acc, [v.name]: v.defaultValue }), {}), ...variables },
      logs: [],
      performance: {
        totalNodes: workflow.nodes.length,
        executedNodes: 0,
        failedNodes: 0,
        skippedNodes: 0
      }
    };

    this.executions.set(executionId, execution);

    // Create execution context
    const context: WorkflowContext = {
      executionId,
      workflowId: workflow.id,
      variables: execution.variables,
      triggerData,
      executionHistory: [],
      startTime: new Date(),
      timeout: workflow.settings.timeout
    };

    this.activeContexts.set(executionId, context);

    // Emit workflow started event
    this.emitEvent({
      type: 'workflow_started',
      workflowId: workflow.id,
      executionId,
      timestamp: new Date()
    });

    try {
      // Start execution
      execution.status = 'running';
      await this.executeWorkflowNodes(workflow, execution, context);

      execution.status = 'completed';
      execution.completedAt = new Date();
      execution.duration = execution.completedAt.getTime() - execution.startedAt.getTime();

    } catch (error) {
      execution.status = 'failed';
      execution.completedAt = new Date();
      execution.duration = execution.completedAt.getTime() - execution.startedAt.getTime();
      execution.error = {
        message: error instanceof Error ? error.message : 'Unknown error',
        stackTrace: error instanceof Error ? error.stack : undefined
      };
    }

    // Emit completion event
    this.emitEvent({
      type: execution.status === 'completed' ? 'workflow_completed' : 'workflow_failed',
      workflowId: workflow.id,
      executionId,
      data: execution,
      timestamp: new Date()
    });

    return execution;
  }

  // Execute workflow nodes with proper flow control
  private async executeWorkflowNodes(
    workflow: Workflow,
    execution: WorkflowExecution,
    context: WorkflowContext
  ): Promise<void> {
    const executedNodes = new Set<string>();
    const pendingNodes = new Set(workflow.nodes.map(n => n.id));

    // Find starting nodes (nodes with no inputs or trigger nodes)
    const startingNodes = workflow.nodes.filter(node =>
      node.connections.inputs.length === 0 || node.type === 'trigger'
    );

    // Execute nodes in topological order with parallel processing
    await this.executeNodeBatch(workflow, execution, context, startingNodes, executedNodes, pendingNodes);
  }

  // Execute a batch of nodes (supports parallel execution)
  private async executeNodeBatch(
    workflow: Workflow,
    execution: WorkflowExecution,
    context: WorkflowContext,
    nodes: WorkflowNode[],
    executedNodes: Set<string>,
    pendingNodes: Set<string>
  ): Promise<void> {
    const nodePromises = nodes.map(node =>
      this.executeSingleNode(workflow, execution, context, node, executedNodes, pendingNodes)
    );

    await Promise.allSettled(nodePromises);

    // Continue with next batch if there are pending nodes
    if (pendingNodes.size > 0) {
      const nextBatch = workflow.nodes.filter(node =>
        pendingNodes.has(node.id) &&
        node.connections.inputs.every(inputId => executedNodes.has(inputId))
      );

      if (nextBatch.length > 0) {
        await this.executeNodeBatch(workflow, execution, context, nextBatch, executedNodes, pendingNodes);
      }
    }
  }

  // Execute a single node
  private async executeSingleNode(
    workflow: Workflow,
    execution: WorkflowExecution,
    context: WorkflowContext,
    node: WorkflowNode,
    executedNodes: Set<string>,
    pendingNodes: Set<string>
  ): Promise<void> {
    const nodeExecution: NodeExecution = {
      nodeId: node.id,
      status: 'running',
      startedAt: new Date(),
      retries: 0
    };

    execution.nodeExecutions.push(nodeExecution);
    context.currentNode = node;

    try {
      // Emit node started event
      this.emitEvent({
        type: 'node_started',
        workflowId: workflow.id,
        executionId: execution.id,
        nodeId: node.id,
        timestamp: new Date()
      });

      // Execute node based on type
      const result = await this.executeNodeLogic(node, context, execution);

      nodeExecution.status = 'completed';
      nodeExecution.completedAt = new Date();
      nodeExecution.duration = nodeExecution.completedAt.getTime() - nodeExecution.startedAt.getTime();
      nodeExecution.outputData = result;

      executedNodes.add(node.id);
      pendingNodes.delete(node.id);
      execution.performance.executedNodes++;

      // Update node status
      node.status = 'completed';
      node.executionData = result;
      node.executedAt = new Date();

      // Log successful execution
      this.addExecutionLog(execution, 'info', `Node ${node.name} completed successfully`, node.id);

      // Emit node completed event
      this.emitEvent({
        type: 'node_completed',
        workflowId: workflow.id,
        executionId: execution.id,
        nodeId: node.id,
        data: result,
        timestamp: new Date()
      });

    } catch (error) {
      nodeExecution.status = 'failed';
      nodeExecution.completedAt = new Date();
      nodeExecution.duration = nodeExecution.completedAt.getTime() - nodeExecution.startedAt.getTime();
      nodeExecution.error = error instanceof Error ? error.message : 'Unknown error';

      execution.performance.failedNodes++;

      // Update node status
      node.status = 'failed';
      node.errorMessage = nodeExecution.error;

      // Log error
      this.addExecutionLog(execution, 'error', `Node ${node.name} failed: ${nodeExecution.error}`, node.id);

      // Emit node failed event
      this.emitEvent({
        type: 'node_failed',
        workflowId: workflow.id,
        executionId: execution.id,
        nodeId: node.id,
        data: { error: nodeExecution.error },
        timestamp: new Date()
      });

      // Check error handling strategy
      if (workflow.settings.errorHandling === 'stop') {
        throw error;
      }
      // For 'continue' strategy, mark downstream nodes as skipped
      this.skipDownstreamNodes(workflow, node.id, executedNodes, pendingNodes, execution);
    }
  }

  // Execute node-specific logic
  private async executeNodeLogic(
    node: WorkflowNode,
    context: WorkflowContext,
    execution: WorkflowExecution
  ): Promise<any> {
    switch (node.type) {
      case 'trigger':
        return this.executeTriggerNode(node, context);

      case 'action':
        return this.executeActionNode(node, context);

      case 'condition':
        return this.executeConditionNode(node, context);

      case 'delay':
        return this.executeDelayNode(node, context);

      case 'webhook':
        return this.executeWebhookNode(node, context);

      case 'email':
        return this.executeEmailNode(node, context);

      case 'api_call':
        return this.executeApiCallNode(node, context);

      case 'database':
        return this.executeDatabaseNode(node, context);

      case 'approval':
        return this.executeApprovalNode(node, context);

      case 'notification':
        return this.executeNotificationNode(node, context);

      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }

  private async executeTriggerNode(node: WorkflowNode, context: WorkflowContext): Promise<any> {
    // Trigger nodes typically just pass through trigger data
    return { triggerData: context.triggerData };
  }

  private async executeActionNode(node: WorkflowNode, context: WorkflowContext): Promise<any> {
    const actionType = node.config.actionType;

    switch (actionType) {
      case 'send_email':
        return this.sendEmail(node.config);

      case 'create_record':
        return this.createRecord(node.config);

      case 'update_record':
        return this.updateRecord(node.config);

      case 'api_call':
        return this.makeApiCall(node.config);

      case 'notification':
        return this.sendNotification(node.config);

      default:
        return { action: actionType, executed: true };
    }
  }

  private async executeConditionNode(node: WorkflowNode, context: WorkflowContext): Promise<any> {
    const conditions = node.config.conditionRules || [];
    const results: boolean[] = [];

    for (const condition of conditions) {
      const value = this.evaluateConditionValue(condition.field, context);
      const result = this.evaluateConditionRule(condition, value);
      results.push(result);
    }

    // Combine results based on logic
    const finalResult = results.every(r => r); // AND logic for now

    return {
      conditions: results,
      result: finalResult,
      nextPath: finalResult ? 'true' : 'false'
    };
  }

  private async executeDelayNode(node: WorkflowNode, context: WorkflowContext): Promise<any> {
    const delayType = node.config.delayType;
    const delayValue = node.config.delayValue || 0;

    if (delayType === 'fixed') {
      await new Promise(resolve => setTimeout(resolve, delayValue * 1000));
      return { delayed: true, delaySeconds: delayValue };
    } else if (delayType === 'dynamic') {
      // Dynamic delay based on variables or calculations
      const dynamicDelay = this.calculateDynamicDelay(node.config, context);
      await new Promise(resolve => setTimeout(resolve, dynamicDelay * 1000));
      return { delayed: true, delaySeconds: dynamicDelay };
    }

    return { delayed: false };
  }

  private async executeWebhookNode(node: WorkflowNode, context: WorkflowContext): Promise<any> {
    const { webhookUrl, webhookMethod = 'POST', webhookHeaders = {}, webhookBody } = node.config;

    if (!webhookUrl || typeof webhookUrl !== 'string') {
      throw new Error('Invalid webhook URL configuration');
    }

    try {
      const response = await fetch(webhookUrl, {
        method: webhookMethod,
        headers: {
          'Content-Type': 'application/json',
          ...webhookHeaders
        },
        body: webhookBody ? JSON.stringify(this.interpolateVariables(webhookBody, context)) : undefined
      });

      const responseData = await response.json();

      return {
        success: response.ok,
        status: response.status,
        data: responseData
      };
    } catch (error) {
      throw new Error(`Webhook failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async executeEmailNode(node: WorkflowNode, context: WorkflowContext): Promise<any> {
    const { emailRecipients, emailSubject, emailBody } = node.config;

    // Simulate email sending
    console.log('Sending email:', {
      to: emailRecipients,
      subject: this.interpolateVariables(emailSubject, context),
      body: this.interpolateVariables(emailBody, context)
    });

    return {
      sent: true,
      recipients: emailRecipients,
      timestamp: new Date()
    };
  }

  private async executeApiCallNode(node: WorkflowNode, context: WorkflowContext): Promise<any> {
    const { apiUrl, apiMethod = 'GET', apiHeaders = {}, apiBody, apiAuth } = node.config;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...apiHeaders
    };

    // Add authentication
    if (apiAuth?.type === 'bearer' && apiAuth.credentials?.token) {
      headers['Authorization'] = `Bearer ${apiAuth.credentials.token}`;
    } else if (apiAuth?.type === 'basic' && apiAuth.credentials) {
      const auth = btoa(`${apiAuth.credentials.username}:${apiAuth.credentials.password}`);
      headers['Authorization'] = `Basic ${auth}`;
    }

    try {
      const response = await fetch(this.interpolateVariables(apiUrl, context), {
        method: apiMethod,
        headers,
        body: apiBody ? JSON.stringify(this.interpolateVariables(apiBody, context)) : undefined
      });

      const responseData = await response.json();

      return {
        success: response.ok,
        status: response.status,
        data: responseData
      };
    } catch (error) {
      throw new Error(`API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async executeDatabaseNode(node: WorkflowNode, context: WorkflowContext): Promise<any> {
    const { databaseOperation, tableName, query, parameters } = node.config;

    // Simulate database operations
    console.log('Database operation:', {
      operation: databaseOperation,
      table: tableName,
      query: this.interpolateVariables(query, context),
      params: this.interpolateVariables(parameters, context)
    });

    return {
      operation: databaseOperation,
      table: tableName,
      executed: true,
      timestamp: new Date()
    };
  }

  private async executeApprovalNode(node: WorkflowNode, context: WorkflowContext): Promise<any> {
    const { approvers, approvalType, timeout } = node.config;

    // For now, simulate automatic approval
    // In a real implementation, this would create approval requests and wait for responses
    const approved = true; // Simulate approval

    return {
      approved,
      approvers,
      approvalType,
      timestamp: new Date()
    };
  }

  private async executeNotificationNode(node: WorkflowNode, context: WorkflowContext): Promise<any> {
    const { notificationType, notificationTemplate, notificationRecipients } = node.config;

    // Simulate notification sending
    console.log('Sending notification:', {
      type: notificationType,
      template: notificationTemplate,
      recipients: notificationRecipients
    });

    return {
      sent: true,
      type: notificationType,
      recipients: notificationRecipients,
      timestamp: new Date()
    };
  }

  // Helper methods
  private evaluateConditionValue(field: string, context: WorkflowContext): any {
    // Extract value from context variables or trigger data
    if (field.startsWith('variables.')) {
      const varName = field.substring(10);
      return context.variables[varName];
    }

    if (field.startsWith('trigger.')) {
      const triggerField = field.substring(8);
      return context.triggerData?.[triggerField];
    }

    return context.variables[field] || context.triggerData?.[field];
  }

  private evaluateConditionRule(condition: ConditionRule, value: any): boolean {
    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'not_equals':
        return value !== condition.value;
      case 'greater_than':
        return value > condition.value;
      case 'less_than':
        return value < condition.value;
      case 'contains':
        return String(value).includes(condition.value);
      case 'not_contains':
        return !String(value).includes(condition.value);
      case 'is_empty':
        return !value || (Array.isArray(value) && value.length === 0);
      case 'is_not_empty':
        return value && (!Array.isArray(value) || value.length > 0);
      default:
        return false;
    }
  }

  private calculateDynamicDelay(config: any, context: WorkflowContext): number {
    // Calculate delay based on variables or expressions
    return config.delayValue || 60; // Default 1 minute
  }

  private interpolateVariables(template: any, context: WorkflowContext): any {
    if (typeof template === 'string') {
      return template.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
        return context.variables[varName] || match;
      });
    }

    if (typeof template === 'object' && template !== null) {
      const result: any = Array.isArray(template) ? [] : {};

      for (const [key, value] of Object.entries(template)) {
        result[key] = this.interpolateVariables(value, context);
      }

      return result;
    }

    return template;
  }

  private skipDownstreamNodes(
    workflow: Workflow,
    failedNodeId: string,
    executedNodes: Set<string>,
    pendingNodes: Set<string>,
    execution: WorkflowExecution
  ): void {
    // Find all nodes that depend on the failed node
    const downstreamNodes = workflow.nodes.filter(node =>
      node.connections.inputs.includes(failedNodeId)
    );

    for (const node of downstreamNodes) {
      if (!executedNodes.has(node.id)) {
        node.status = 'waiting';
        pendingNodes.delete(node.id);
        execution.performance.skippedNodes++;

        // Recursively skip downstream nodes
        this.skipDownstreamNodes(workflow, node.id, executedNodes, pendingNodes, execution);
      }
    }
  }

  private addExecutionLog(execution: WorkflowExecution, level: ExecutionLog['level'], message: string, nodeId?: string): void {
    execution.logs.push({
      timestamp: new Date(),
      level,
      message,
      nodeId
    });
  }

  private emitEvent(event: WorkflowEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in workflow event listener:', error);
      }
    });
  }

  // Action implementations (simplified)
  private async sendEmail(config: any): Promise<any> {
    // Implementation would integrate with email service
    return { sent: true };
  }

  private async createRecord(config: any): Promise<any> {
    // Implementation would create records in database
    return { created: true, id: `record_${Date.now()}` };
  }

  private async updateRecord(config: any): Promise<any> {
    // Implementation would update records in database
    return { updated: true };
  }

  private async makeApiCall(config: any): Promise<any> {
    // Implementation would make external API calls
    return { called: true };
  }

  private async sendNotification(config: any): Promise<any> {
    // Implementation would send notifications
    return { sent: true };
  }

  // Public API methods
  getExecution(executionId: string): WorkflowExecution | undefined {
    return this.executions.get(executionId);
  }

  getActiveExecutions(): WorkflowExecution[] {
    return Array.from(this.executions.values()).filter(
      exec => ['pending', 'running'].includes(exec.status)
    );
  }

  cancelExecution(executionId: string): boolean {
    const execution = this.executions.get(executionId);
    if (execution && ['pending', 'running'].includes(execution.status)) {
      execution.status = 'cancelled';
      execution.completedAt = new Date();
      return true;
    }
    return false;
  }

  addEventListener(listener: (event: WorkflowEvent) => void): () => void {
    this.eventListeners.add(listener);
    return () => {
      this.eventListeners.delete(listener);
    };
  }

  getExecutionStats(workflowId: string): any {
    const executions = Array.from(this.executions.values()).filter(
      exec => exec.workflowId === workflowId
    );

    return {
      total: executions.length,
      completed: executions.filter(e => e.status === 'completed').length,
      failed: executions.filter(e => e.status === 'failed').length,
      running: executions.filter(e => e.status === 'running').length,
      averageDuration: executions
        .filter(e => e.duration)
        .reduce((sum, e) => sum + (e.duration || 0), 0) / executions.length
    };
  }
}

// Singleton instance
export const workflowEngine = new WorkflowEngine();