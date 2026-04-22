'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';

// Advanced Orchestration Types
export type OrchestrationType =
  | 'api-composition'
  | 'workflow-automation'
  | 'data-pipeline'
  | 'event-orchestration'
  | 'service-mesh';

export type NodeType =
  | 'api-call'
  | 'data-transform'
  | 'condition'
  | 'loop'
  | 'delay'
  | 'parallel'
  | 'webhook'
  | 'database'
  | 'cache'
  | 'ai-model';

export type ConnectionType =
  | 'success'
  | 'failure'
  | 'timeout'
  | 'conditional';

export interface OrchestrationNode {
  id: string;
  type: NodeType;
  label: string;
  position: { x: number; y: number };
  config: NodeConfig;
  inputs: string[];
  outputs: string[];
  status: 'idle' | 'running' | 'completed' | 'failed' | 'timeout';
  executionTime?: number;
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
}

export interface NodeConfig {
  // API Call config
  url?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;

  // Data Transform config
  transformType?: 'map' | 'filter' | 'reduce' | 'join' | 'aggregate';
  transformFunction?: string;
  inputSchema?: any;
  outputSchema?: any;

  // Condition config
  condition?: string;
  truePath?: string;
  falsePath?: string;

  // Loop config
  loopType?: 'count' | 'condition' | 'collection';
  loopCount?: number;
  loopCondition?: string;
  collectionPath?: string;

  // Delay config
  delayMs?: number;

  // Parallel config
  parallelTasks?: OrchestrationNode[];

  // Webhook config
  webhookUrl?: string;
  webhookMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  webhookHeaders?: Record<string, string>;
  webhookBody?: any;

  // Database config
  query?: string;
  connectionString?: string;

  // Cache config
  cacheKey?: string;
  cacheTtl?: number;
  cacheOperation?: 'get' | 'set' | 'delete';

  // AI Model config
  modelId?: string;
  modelInput?: any;
  modelOutput?: any;
}

export interface OrchestrationConnection {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceOutput: string;
  targetInput: string;
  type: ConnectionType;
  condition?: string;
  dataMapping?: Record<string, string>;
}

export interface OrchestrationWorkflow {
  id: string;
  name: string;
  description: string;
  type: OrchestrationType;
  nodes: OrchestrationNode[];
  connections: OrchestrationConnection[];
  variables: Record<string, any>;
  triggers: WorkflowTrigger[];
  status: 'draft' | 'active' | 'paused' | 'archived';
  version: number;
  createdAt: string;
  updatedAt: string;
  executionStats: {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageExecutionTime: number;
    lastExecutionAt?: string;
  };
}

export interface WorkflowTrigger {
  id: string;
  type: 'http' | 'webhook' | 'schedule' | 'event' | 'manual';
  config: {
    url?: string;
    method?: string;
    schedule?: string;
    eventType?: string;
  };
}

export interface ExecutionContext {
  workflowId: string;
  executionId: string;
  variables: Record<string, any>;
  nodeResults: Map<string, any>;
  startTime: Date;
  currentNodeId?: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
}

// Advanced Orchestration Hook
export function useAdvancedOrchestration() {
  const [workflows, setWorkflows] = useState<OrchestrationWorkflow[]>([]);
  const [currentWorkflow, setCurrentWorkflow] = useState<OrchestrationWorkflow | null>(null);
  const [executionContext, setExecutionContext] = useState<ExecutionContext | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const executionTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Mock workflows - in real implementation, this would come from backend
  const mockWorkflows: OrchestrationWorkflow[] = [
    {
      id: 'financial-reconciliation-workflow',
      name: 'Financial Reconciliation Automation',
      description: 'Automated financial data reconciliation with validation and reporting',
      type: 'workflow-automation',
      nodes: [
        {
          id: 'fetch-transactions',
          type: 'api-call',
          label: 'Fetch Transactions',
          position: { x: 100, y: 100 },
          config: {
            url: '/api/financial/transactions',
            method: 'GET',
            timeout: 30000
          },
          inputs: [],
          outputs: ['transactions'],
          status: 'idle',
          retryCount: 0,
          maxRetries: 3
        },
        {
          id: 'validate-data',
          type: 'data-transform',
          label: 'Validate & Clean Data',
          position: { x: 300, y: 100 },
          config: {
            transformType: 'filter',
            transformFunction: 'data.filter(item => item.amount > 0 && item.date)',
          },
          inputs: ['transactions'],
          outputs: ['cleanData'],
          status: 'idle',
          retryCount: 0,
          maxRetries: 2
        },
        {
          id: 'reconcile-accounts',
          type: 'api-call',
          label: 'Reconcile Accounts',
          position: { x: 500, y: 100 },
          config: {
            url: '/api/financial/reconcile',
            method: 'POST',
            timeout: 60000
          },
          inputs: ['cleanData'],
          outputs: ['reconciliationResult'],
          status: 'idle',
          retryCount: 0,
          maxRetries: 3
        },
        {
          id: 'generate-report',
          type: 'api-call',
          label: 'Generate Report',
          position: { x: 700, y: 100 },
          config: {
            url: '/api/reports/financial',
            method: 'POST',
            timeout: 30000
          },
          inputs: ['reconciliationResult'],
          outputs: ['report'],
          status: 'idle',
          retryCount: 0,
          maxRetries: 2
        }
      ],
      connections: [
        {
          id: 'conn1',
          sourceNodeId: 'fetch-transactions',
          targetNodeId: 'validate-data',
          sourceOutput: 'transactions',
          targetInput: 'transactions',
          type: 'success'
        },
        {
          id: 'conn2',
          sourceNodeId: 'validate-data',
          targetNodeId: 'reconcile-accounts',
          sourceOutput: 'cleanData',
          targetInput: 'cleanData',
          type: 'success'
        },
        {
          id: 'conn3',
          sourceNodeId: 'reconcile-accounts',
          targetNodeId: 'generate-report',
          sourceOutput: 'reconciliationResult',
          targetInput: 'reconciliationResult',
          type: 'success'
        }
      ],
      variables: {
        startDate: '{{execution.startDate}}',
        endDate: '{{execution.endDate}}',
        accountIds: '{{execution.accountIds}}'
      },
      triggers: [
        {
          id: 'schedule-trigger',
          type: 'schedule',
          config: {
            schedule: '0 2 * * 1-5' // Monday to Friday at 2 AM
          }
        }
      ],
      status: 'active',
      version: 2,
      createdAt: '2026-01-15T00:00:00Z',
      updatedAt: '2026-04-22T00:00:00Z',
      executionStats: {
        totalExecutions: 245,
        successfulExecutions: 238,
        failedExecutions: 7,
        averageExecutionTime: 45000,
        lastExecutionAt: '2026-04-22T06:00:00Z'
      }
    }
  ];

  const loadWorkflows = useCallback(async () => {
    try {
      // In real implementation, fetch from backend
      await new Promise(resolve => setTimeout(resolve, 300));
      setWorkflows(mockWorkflows);
    } catch (error) {
      console.error('Failed to load workflows:', error);
    }
  }, []);

  const executeWorkflow = useCallback(async (workflowId: string, variables: Record<string, any> = {}) => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    setIsExecuting(true);
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const context: ExecutionContext = {
      workflowId,
      executionId,
      variables: { ...workflow.variables, ...variables },
      nodeResults: new Map(),
      startTime: new Date(),
      status: 'running'
    };

    setExecutionContext(context);

    try {
      // Execute workflow nodes in topological order
      const executedNodes = new Set<string>();
      const nodeQueue = workflow.nodes.filter(node => node.inputs.length === 0);

      while (nodeQueue.length > 0) {
        const node = nodeQueue.shift()!;
        if (executedNodes.has(node.id)) continue;

        // Check if all inputs are satisfied
        const allInputsSatisfied = node.inputs.every(input => {
          const connection = workflow.connections.find(
            conn => conn.targetNodeId === node.id && conn.targetInput === input
          );
          return connection && context.nodeResults.has(connection.sourceNodeId);
        });

        if (!allInputsSatisfied) continue;

        // Execute node
        await executeNode(node, context, workflow);

        executedNodes.add(node.id);

        // Add next nodes to queue
        const nextNodes = workflow.connections
          .filter(conn => conn.sourceNodeId === node.id)
          .map(conn => workflow.nodes.find(n => n.id === conn.targetNodeId))
          .filter(Boolean) as OrchestrationNode[];

        nodeQueue.push(...nextNodes);
      }

      context.status = 'completed';
      setExecutionContext({ ...context });
    } catch (error) {
      console.error('Workflow execution failed:', error);
      context.status = 'failed';
      setExecutionContext({ ...context });
    } finally {
      setIsExecuting(false);
      // Clear timeouts
      executionTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      executionTimeoutsRef.current.clear();
    }
  }, [workflows]);

  const executeNode = async (
    node: OrchestrationNode,
    context: ExecutionContext,
    workflow: OrchestrationWorkflow
  ): Promise<void> => {
    // Update node status
    updateNodeStatus(workflow.id, node.id, 'running');

    const startTime = Date.now();

    try {
      let result: any;

      switch (node.type) {
        case 'api-call':
          result = await executeApiCall(node, context);
          break;
        case 'data-transform':
          result = await executeDataTransform(node, context);
          break;
        case 'condition':
          result = await executeCondition(node, context);
          break;
        case 'delay':
          result = await executeDelay(node, context);
          break;
        case 'webhook':
          result = await executeWebhook(node, context);
          break;
        default:
          result = { status: 'completed', data: null };
      }

      context.nodeResults.set(node.id, result);
      updateNodeStatus(workflow.id, node.id, 'completed', Date.now() - startTime);

    } catch (error: any) {
      console.error(`Node ${node.id} execution failed:`, error);
      updateNodeStatus(workflow.id, node.id, 'failed', Date.now() - startTime, error.message);

      // Retry logic
      if (node.retryCount < node.maxRetries) {
        const timeout = setTimeout(() => {
          const updatedNode = { ...node, retryCount: node.retryCount + 1 };
          executeNode(updatedNode, context, workflow);
        }, Math.pow(2, node.retryCount) * 1000); // Exponential backoff

        executionTimeoutsRef.current.set(node.id, timeout);
      } else {
        throw error;
      }
    }
  };

  const executeApiCall = async (node: OrchestrationNode, context: ExecutionContext) => {
    const config = node.config as any;
    const url = interpolateVariables(config.url, context.variables);
    const headers = interpolateVariables(config.headers || {}, context.variables);
    const body = config.body ? interpolateVariables(config.body, context.variables) : undefined;

    const response = await fetch(url, {
      method: config.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(config.timeout || 30000)
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { status: 'success', data, responseTime: response.headers.get('X-Response-Time') };
  };

  const executeDataTransform = async (node: OrchestrationNode, context: ExecutionContext) => {
    const config = node.config as any;
    const inputData = getNodeInputData(node, context);

    // Simple transform execution (in real implementation, use a proper engine)
    let result: any;
    switch (config.transformType) {
      case 'filter':
        result = inputData.filter((item: any) => eval(config.transformFunction));
        break;
      case 'map':
        result = inputData.map((item: any) => eval(config.transformFunction));
        break;
      default:
        result = inputData;
    }

    return { status: 'success', data: result };
  };

  const executeCondition = async (node: OrchestrationNode, context: ExecutionContext) => {
    const config = node.config as any;
    const condition = interpolateVariables(config.condition, context.variables);

    const result = eval(condition);
    return { status: 'success', condition: result };
  };

  const executeDelay = async (node: OrchestrationNode, context: ExecutionContext) => {
    const config = node.config as any;
    await new Promise(resolve => setTimeout(resolve, config.delayMs || 1000));
    return { status: 'success' };
  };

  const executeWebhook = async (node: OrchestrationNode, context: ExecutionContext) => {
    const config = node.config as any;
    const url = interpolateVariables(config.webhookUrl, context.variables);
    const headers = interpolateVariables(config.webhookHeaders || {}, context.variables);
    const body = config.webhookBody ? interpolateVariables(config.webhookBody, context.variables) : undefined;

    const response = await fetch(url, {
      method: config.webhookMethod || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined
    });

    return { status: response.ok ? 'success' : 'failed', statusCode: response.status };
  };

  const getNodeInputData = (node: OrchestrationNode, context: ExecutionContext) => {
    const inputData: any[] = [];

    node.inputs.forEach(input => {
      const connection = workflows
        .find(w => w.id === context.workflowId)
        ?.connections.find(conn => conn.targetNodeId === node.id && conn.targetInput === input);

      if (connection) {
        const sourceResult = context.nodeResults.get(connection.sourceNodeId);
        if (sourceResult) {
          inputData.push(sourceResult.data);
        }
      }
    });

    return inputData.length === 1 ? inputData[0] : inputData;
  };

  const interpolateVariables = (template: any, variables: Record<string, any>): any => {
    if (typeof template === 'string') {
      return template.replace(/\{\{(\w+)\}\}/g, (match, key) => variables[key] || match);
    } else if (typeof template === 'object' && template !== null) {
      const result: any = Array.isArray(template) ? [] : {};
      for (const [key, value] of Object.entries(template)) {
        result[key] = interpolateVariables(value, variables);
      }
      return result;
    }
    return template;
  };

  const updateNodeStatus = (
    workflowId: string,
    nodeId: string,
    status: OrchestrationNode['status'],
    executionTime?: number,
    errorMessage?: string
  ) => {
    setWorkflows(prevWorkflows =>
      prevWorkflows.map(workflow =>
        workflow.id === workflowId
          ? {
              ...workflow,
              nodes: workflow.nodes.map(node =>
                node.id === nodeId
                  ? { ...node, status, executionTime, errorMessage }
                  : node
              )
            }
          : workflow
      )
    );

    if (currentWorkflow?.id === workflowId) {
      setCurrentWorkflow(prev =>
        prev ? {
          ...prev,
          nodes: prev.nodes.map(node =>
            node.id === nodeId
              ? { ...node, status, executionTime, errorMessage }
              : node
          )
        } : null
      );
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, [loadWorkflows]);

  return {
    workflows,
    currentWorkflow,
    setCurrentWorkflow,
    executionContext,
    isExecuting,
    executeWorkflow,
    loadWorkflows,
  };
}

// Advanced Orchestration Visual Designer Component
interface AdvancedOrchestrationDesignerProps {
  className?: string;
  workflow?: OrchestrationWorkflow;
  onWorkflowChange?: (workflow: OrchestrationWorkflow) => void;
}

export const AdvancedOrchestrationDesigner: React.FC<AdvancedOrchestrationDesignerProps> = ({
  className,
  workflow: initialWorkflow,
  onWorkflowChange,
}) => {
  const [workflow, setWorkflow] = useState<OrchestrationWorkflow | null>(initialWorkflow || null);
  const [selectedNode, setSelectedNode] = useState<OrchestrationNode | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<{ nodeId: string; output: string } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!workflow) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Add new node at click position
    const newNode: OrchestrationNode = {
      id: `node_${Date.now()}`,
      type: 'api-call',
      label: 'New API Call',
      position: { x, y },
      config: {},
      inputs: [],
      outputs: ['result'],
      status: 'idle',
      retryCount: 0,
      maxRetries: 3
    };

    const updatedWorkflow = {
      ...workflow,
      nodes: [...workflow.nodes, newNode]
    };

    setWorkflow(updatedWorkflow);
    onWorkflowChange?.(updatedWorkflow);
  };

  const handleNodeClick = (node: OrchestrationNode) => {
    setSelectedNode(node);
  };

  const updateNode = (nodeId: string, updates: Partial<OrchestrationNode>) => {
    if (!workflow) return;

    const updatedWorkflow = {
      ...workflow,
      nodes: workflow.nodes.map(node =>
        node.id === nodeId ? { ...node, ...updates } : node
      )
    };

    setWorkflow(updatedWorkflow);
    onWorkflowChange?.(updatedWorkflow);
  };

  const deleteNode = (nodeId: string) => {
    if (!workflow) return;

    const updatedWorkflow = {
      ...workflow,
      nodes: workflow.nodes.filter(node => node.id !== nodeId),
      connections: workflow.connections.filter(
        conn => conn.sourceNodeId !== nodeId && conn.targetNodeId !== nodeId
      )
    };

    setWorkflow(updatedWorkflow);
    onWorkflowChange?.(updatedWorkflow);
    setSelectedNode(null);
  };

  if (!workflow) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <div className="text-center">
          <div className="text-6xl mb-4">🔧</div>
          <h3 className="text-lg font-semibold">No Workflow Selected</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Select or create a workflow to start designing
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex h-full', className)}>
      {/* Canvas */}
      <div className="flex-1 relative bg-gray-50 border-r">
        <div
          ref={canvasRef}
          className="w-full h-full relative overflow-hidden cursor-crosshair"
          onClick={handleCanvasClick}
        >
          {/* Grid Background */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}
          />

          {/* Nodes */}
          {workflow.nodes.map(node => (
            <div
              key={node.id}
              className={cn(
                'absolute w-48 h-32 bg-white border-2 rounded-lg shadow-sm cursor-pointer transition-all',
                'hover:shadow-md hover:scale-105',
                selectedNode?.id === node.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300',
                node.status === 'running' && 'ring-2 ring-yellow-400',
                node.status === 'completed' && 'ring-2 ring-green-400',
                node.status === 'failed' && 'ring-2 ring-red-400'
              )}
              style={{
                left: node.position.x,
                top: node.position.y,
                transform: 'translate(-50%, -50%)'
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleNodeClick(node);
              }}
            >
              <div className="p-3 h-full flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600 uppercase">
                    {node.type.replace('-', ' ')}
                  </span>
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    node.status === 'completed' && 'bg-green-500',
                    node.status === 'running' && 'bg-yellow-500',
                    node.status === 'failed' && 'bg-red-500',
                    node.status === 'idle' && 'bg-gray-300'
                  )} />
                </div>
                <div className="text-sm font-medium truncate">{node.label}</div>
                <div className="flex-1 flex items-end">
                  <div className="text-xs text-gray-500">
                    {node.retryCount}/{node.maxRetries} retries
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Connections */}
          <svg className="absolute inset-0 pointer-events-none">
            {workflow.connections.map(connection => {
              const sourceNode = workflow.nodes.find(n => n.id === connection.sourceNodeId);
              const targetNode = workflow.nodes.find(n => n.id === connection.targetNodeId);

              if (!sourceNode || !targetNode) return null;

              const x1 = sourceNode.position.x;
              const y1 = sourceNode.position.y;
              const x2 = targetNode.position.x;
              const y2 = targetNode.position.y;

              const midX = (x1 + x2) / 2;
              const midY = (y1 + y2) / 2;

              return (
                <g key={connection.id}>
                  <path
                    d={`M ${x1} ${y1} Q ${midX} ${y1} ${midX} ${midY} Q ${midX} ${y2} ${x2} ${y2}`}
                    stroke="#6b7280"
                    strokeWidth="2"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                  />
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
                    </marker>
                  </defs>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Properties Panel */}
      <div className="w-80 bg-white border-l p-4">
        {selectedNode ? (
          <div>
            <h3 className="text-lg font-semibold mb-4">Node Properties</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Label</label>
                <input
                  type="text"
                  value={selectedNode.label}
                  onChange={(e) => updateNode(selectedNode.id, { label: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={selectedNode.type}
                  onChange={(e) => updateNode(selectedNode.id, { type: e.target.value as NodeType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="api-call">API Call</option>
                  <option value="data-transform">Data Transform</option>
                  <option value="condition">Condition</option>
                  <option value="delay">Delay</option>
                  <option value="webhook">Webhook</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Max Retries</label>
                <input
                  type="number"
                  value={selectedNode.maxRetries}
                  onChange={(e) => updateNode(selectedNode.id, { maxRetries: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="0"
                  max="10"
                />
              </div>

              <button
                onClick={() => deleteNode(selectedNode.id)}
                className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete Node
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold">Select a Node</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Click on a node to edit its properties
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Advanced Orchestration Dashboard Component
interface AdvancedOrchestrationDashboardProps {
  className?: string;
}

export const AdvancedOrchestrationDashboard: React.FC<AdvancedOrchestrationDashboardProps> = ({
  className
}) => {
  const {
    workflows,
    currentWorkflow,
    setCurrentWorkflow,
    executionContext,
    isExecuting,
    executeWorkflow
  } = useAdvancedOrchestration();

  const [activeTab, setActiveTab] = useState<'workflows' | 'designer' | 'executions'>('workflows');

  const handleExecuteWorkflow = async () => {
    if (!currentWorkflow) return;

    try {
      await executeWorkflow(currentWorkflow.id, {
        startDate: '2026-04-01',
        endDate: '2026-04-22',
        accountIds: ['acc_001', 'acc_002']
      });
    } catch (error) {
      console.error('Failed to execute workflow:', error);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Advanced Orchestration</h2>
          <p className="text-sm text-muted-foreground mt-1">
            API composition, GraphQL federation, and workflow orchestration
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {isExecuting && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              <span>Executing...</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
          {[
            { id: 'workflows', name: 'Workflows', icon: '🔧' },
            { id: 'designer', name: 'Designer', icon: '🎨' },
            { id: 'executions', name: 'Executions', icon: '⚡' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'workflows' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workflows.map(workflow => (
                <div
                  key={workflow.id}
                  className={cn(
                    'p-6 border rounded-lg cursor-pointer transition-all hover:shadow-md',
                    currentWorkflow?.id === workflow.id ? 'border-primary bg-primary/5' : 'border-border'
                  )}
                  onClick={() => setCurrentWorkflow(workflow)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">
                        {workflow.type === 'workflow-automation' ? '🔄' :
                         workflow.type === 'api-composition' ? '🔗' :
                         workflow.type === 'data-pipeline' ? '📊' : '⚙️'}
                      </span>
                    </div>
                    <span className={cn(
                      'px-2 py-1 rounded text-xs font-medium',
                      workflow.status === 'active' ? 'bg-green-100 text-green-800' :
                      workflow.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    )}>
                      {workflow.status}
                    </span>
                  </div>

                  <h3 className="font-semibold text-lg mb-2">{workflow.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {workflow.description}
                  </p>

                  <div className="flex items-center justify-between text-sm mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-muted-foreground">v{workflow.version}</span>
                      <span className="text-muted-foreground">
                        {workflow.nodes.length} nodes
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-600">
                        {workflow.executionStats.successfulExecutions}/{workflow.executionStats.totalExecutions}
                      </div>
                      <div className="text-xs text-muted-foreground">success rate</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {workflow.executionStats.averageExecutionTime}ms avg
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExecuteWorkflow();
                      }}
                      disabled={!currentWorkflow || isExecuting}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 text-sm font-medium"
                    >
                      Execute
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {workflows.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔧</div>
                <h3 className="text-lg font-semibold">No Workflows</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Create your first orchestration workflow to get started
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'designer' && (
          <AdvancedOrchestrationDesigner
            workflow={currentWorkflow || undefined}
            onWorkflowChange={(workflow) => {
              // In real implementation, save to backend
              console.log('Workflow updated:', workflow);
            }}
          />
        )}

        {activeTab === 'executions' && (
          <div className="space-y-6">
            {executionContext ? (
              <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">Current Execution</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <div className="text-sm text-muted-foreground">Workflow</div>
                    <div className="font-medium">{executionContext.workflowId}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Execution ID</div>
                    <div className="font-medium font-mono text-sm">{executionContext.executionId}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Status</div>
                    <div className={cn(
                      'font-medium',
                      executionContext.status === 'running' && 'text-yellow-600',
                      executionContext.status === 'completed' && 'text-green-600',
                      executionContext.status === 'failed' && 'text-red-600'
                    )}>
                      {executionContext.status}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Started</div>
                    <div className="font-medium">{executionContext.startTime.toLocaleTimeString()}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Node Results</h4>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {Array.from(executionContext.nodeResults.entries()).map(([nodeId, result]) => (
                      <div key={nodeId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span className="font-medium">{nodeId}</span>
                        <span className={cn(
                          'px-2 py-1 rounded text-xs font-medium',
                          result.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        )}>
                          {result.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">⚡</div>
                <h3 className="text-lg font-semibold">No Active Execution</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Execute a workflow to see live execution details
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};