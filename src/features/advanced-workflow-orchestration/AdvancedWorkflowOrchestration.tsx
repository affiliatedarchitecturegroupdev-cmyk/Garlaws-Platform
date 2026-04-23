'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface WorkflowNode {
  id: string;
  type: 'start' | 'task' | 'decision' | 'parallel' | 'join' | 'end' | 'api' | 'human' | 'ai';
  label: string;
  position: { x: number; y: number };
  config: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'waiting';
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  condition?: string;
  label?: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  status: 'draft' | 'active' | 'paused' | 'completed' | 'error';
  createdAt: Date;
  lastExecuted?: Date;
  executionCount: number;
  averageExecutionTime: number;
  successRate: number;
}

interface ExecutionInstance {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  startTime: Date;
  endTime?: Date;
  currentNode?: string;
  variables: Record<string, any>;
  history: Array<{
    nodeId: string;
    timestamp: Date;
    status: string;
    output?: any;
  }>;
}

interface DecisionRule {
  id: string;
  name: string;
  condition: string;
  actions: string[];
  priority: number;
  enabled: boolean;
}

interface AdvancedWorkflowOrchestrationProps {
  tenantId?: string;
  onWorkflowExecution?: (execution: ExecutionInstance) => void;
  onDecisionMade?: (decision: DecisionRule, context: any) => void;
}

const SAMPLE_WORKFLOWS: Workflow[] = [
  {
    id: 'wf_invoice_approval',
    name: 'Invoice Approval Workflow',
    description: 'Automated invoice processing with multi-level approval routing',
    status: 'active',
    createdAt: new Date('2024-01-15'),
    lastExecuted: new Date('2024-04-20'),
    executionCount: 1456,
    averageExecutionTime: 8.5,
    successRate: 0.94,
    nodes: [
      {
        id: 'start',
        type: 'start',
        label: 'Invoice Received',
        position: { x: 100, y: 100 },
        config: {},
        status: 'completed'
      },
      {
        id: 'extract_data',
        type: 'ai',
        label: 'Extract Invoice Data',
        position: { x: 250, y: 100 },
        config: { model: 'invoice-extractor', fields: ['amount', 'vendor', 'date'] },
        status: 'completed'
      },
      {
        id: 'amount_check',
        type: 'decision',
        label: 'Amount < $5000?',
        position: { x: 400, y: 100 },
        config: { condition: 'amount < 5000' },
        status: 'completed'
      },
      {
        id: 'auto_approve',
        type: 'task',
        label: 'Auto Approve',
        position: { x: 550, y: 50 },
        config: { action: 'approve_invoice' },
        status: 'completed'
      },
      {
        id: 'manager_approval',
        type: 'human',
        label: 'Manager Approval',
        position: { x: 550, y: 150 },
        config: { approver: 'manager', timeout: '24h' },
        status: 'waiting'
      },
      {
        id: 'payment',
        type: 'api',
        label: 'Process Payment',
        position: { x: 700, y: 100 },
        config: { endpoint: '/api/payments/process', method: 'POST' },
        status: 'pending'
      },
      {
        id: 'end',
        type: 'end',
        label: 'Workflow Complete',
        position: { x: 850, y: 100 },
        config: {},
        status: 'pending'
      }
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'extract_data' },
      { id: 'e2', source: 'extract_data', target: 'amount_check' },
      { id: 'e3', source: 'amount_check', target: 'auto_approve', condition: 'amount < 5000' },
      { id: 'e4', source: 'amount_check', target: 'manager_approval', condition: 'amount >= 5000' },
      { id: 'e5', source: 'auto_approve', target: 'payment' },
      { id: 'e6', source: 'manager_approval', target: 'payment' },
      { id: 'e7', source: 'payment', target: 'end' }
    ]
  },
  {
    id: 'wf_customer_onboarding',
    name: 'Customer Onboarding Workflow',
    description: 'Comprehensive customer onboarding with automated document processing',
    status: 'active',
    createdAt: new Date('2024-02-01'),
    lastExecuted: new Date('2024-04-22'),
    executionCount: 892,
    averageExecutionTime: 25.3,
    successRate: 0.87,
    nodes: [],
    edges: []
  }
];

const DECISION_RULES: DecisionRule[] = [
  {
    id: 'rule_invoice_amount',
    name: 'Invoice Amount Threshold',
    condition: 'invoice.amount >= 5000',
    actions: ['require_manager_approval', 'send_notification'],
    priority: 1,
    enabled: true
  },
  {
    id: 'rule_customer_priority',
    name: 'Customer Priority Routing',
    condition: 'customer.tier === "premium"',
    actions: ['fast_track_processing', 'assign_vip_agent'],
    priority: 2,
    enabled: true
  },
  {
    id: 'rule_risk_assessment',
    name: 'Risk Assessment',
    condition: 'transaction.amount > 10000 AND customer.risk_score > 0.7',
    actions: ['require_additional_verification', 'flag_for_review'],
    priority: 3,
    enabled: true
  }
];

export default function AdvancedWorkflowOrchestration({
  tenantId = 'default',
  onWorkflowExecution,
  onDecisionMade
}: AdvancedWorkflowOrchestrationProps) {
  const [activeTab, setActiveTab] = useState<'workflows' | 'designer' | 'executions' | 'decisions'>('workflows');
  const [workflows, setWorkflows] = useState<Workflow[]>(SAMPLE_WORKFLOWS);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [executions, setExecutions] = useState<ExecutionInstance[]>([]);
  const [decisionRules, setDecisionRules] = useState<DecisionRule[]>(DECISION_RULES);
  const [isCreatingWorkflow, setIsCreatingWorkflow] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    nodes: [] as WorkflowNode[],
    edges: [] as WorkflowEdge[]
  });

  const executeWorkflow = useCallback(async (workflow: Workflow) => {
    const execution: ExecutionInstance = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      workflowId: workflow.id,
      status: 'running',
      startTime: new Date(),
      variables: {},
      history: []
    };

    setExecutions(prev => [execution, ...prev]);

    // Simulate workflow execution
    let currentNodeIndex = 0;
    const executionHistory: ExecutionInstance['history'] = [];

    while (currentNodeIndex < workflow.nodes.length) {
      const node = workflow.nodes[currentNodeIndex];

      executionHistory.push({
        nodeId: node.id,
        timestamp: new Date(),
        status: 'running'
      });

      // Simulate node execution time
      const executionTime = 1000 + Math.random() * 3000;
      await new Promise(resolve => setTimeout(resolve, executionTime));

      const success = Math.random() > 0.1; // 90% success rate

      executionHistory[executionHistory.length - 1] = {
        ...executionHistory[executionHistory.length - 1],
        status: success ? 'completed' : 'failed',
        output: success ? { result: 'success' } : { error: 'execution failed' }
      };

      if (!success) break;

      currentNodeIndex++;
    }

    const finalExecution: ExecutionInstance = {
      ...execution,
      status: currentNodeIndex === workflow.nodes.length ? 'completed' : 'failed',
      endTime: new Date(),
      history: executionHistory
    };

    setExecutions(prev => prev.map(e => e.id === execution.id ? finalExecution : e));
    onWorkflowExecution?.(finalExecution);

    // Update workflow metrics
    setWorkflows(prev => prev.map(w =>
      w.id === workflow.id
        ? {
            ...w,
            executionCount: w.executionCount + 1,
            lastExecuted: new Date(),
            successRate: finalExecution.status === 'completed'
              ? (w.successRate * w.executionCount + 1) / (w.executionCount + 1)
              : (w.successRate * w.executionCount) / (w.executionCount + 1)
          }
        : w
    ));
  }, [onWorkflowExecution]);

  const createWorkflow = useCallback(() => {
    if (!newWorkflow.name) return;

    const workflow: Workflow = {
      id: `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newWorkflow.name,
      description: newWorkflow.description,
      nodes: newWorkflow.nodes,
      edges: newWorkflow.edges,
      status: 'draft',
      createdAt: new Date(),
      executionCount: 0,
      averageExecutionTime: 0,
      successRate: 0
    };

    setWorkflows(prev => [workflow, ...prev]);
    setNewWorkflow({ name: '', description: '', nodes: [], edges: [] });
    setIsCreatingWorkflow(false);
    setActiveTab('workflows');
  }, [newWorkflow]);

  const addNodeToWorkflow = useCallback((type: WorkflowNode['type'], position: { x: number; y: number }) => {
    const node: WorkflowNode = {
      id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
      position,
      config: {},
      status: 'pending'
    };

    setNewWorkflow(prev => ({
      ...prev,
      nodes: [...prev.nodes, node]
    }));
  }, []);

  const evaluateDecisionRules = useCallback((context: any) => {
    const matchedRules = decisionRules
      .filter(rule => rule.enabled)
      .sort((a, b) => b.priority - a.priority);

    for (const rule of matchedRules) {
      try {
        // Simple condition evaluation (in real implementation, use a proper expression evaluator)
        const condition = rule.condition;
        let matches = false;

        if (condition.includes('>=') || condition.includes('>') || condition.includes('<') || condition.includes('==')) {
          // Handle numeric comparisons
          const amountMatch = condition.match(/(\w+)\.(\w+)\s*([<>=]+)\s*(\d+)/);
          if (amountMatch) {
            const [, obj, prop, op, value] = amountMatch;
            const actualValue = context[obj]?.[prop];
            const numValue = parseFloat(value);

            switch (op) {
              case '>=': matches = actualValue >= numValue; break;
              case '>': matches = actualValue > numValue; break;
              case '<': matches = actualValue < numValue; break;
              case '==': matches = actualValue == numValue; break;
            }
          }
        } else if (condition.includes('===')) {
          // Handle string equality
          const tierMatch = condition.match(/(\w+)\.(\w+)\s*===\s*['"]([^'"]+)['"]/);
          if (tierMatch) {
            const [, obj, prop, value] = tierMatch;
            matches = context[obj]?.[prop] === value;
          }
        }

        if (matches) {
          onDecisionMade?.(rule, context);
          return rule.actions;
        }
      } catch (error) {
        console.error('Error evaluating decision rule:', error);
      }
    }

    return [];
  }, [decisionRules, onDecisionMade]);

  const getNodeIcon = (type: WorkflowNode['type']) => {
    switch (type) {
      case 'start': return '🎯';
      case 'task': return '⚙️';
      case 'decision': return '🔀';
      case 'parallel': return '🔄';
      case 'join': return '🔗';
      case 'end': return '🏁';
      case 'api': return '🔗';
      case 'human': return '👤';
      case 'ai': return '🤖';
      default: return '⬜';
    }
  };

  const getNodeColor = (type: WorkflowNode['type']) => {
    switch (type) {
      case 'start': return '#10B981';
      case 'task': return '#3B82F6';
      case 'decision': return '#F59E0B';
      case 'parallel': return '#8B5CF6';
      case 'join': return '#EF4444';
      case 'end': return '#6B7280';
      case 'api': return '#06B6D4';
      case 'human': return '#84CC16';
      case 'ai': return '#F97316';
      default: return '#6B7280';
    }
  };

  const getStatusColor = (status: Workflow['status'] | ExecutionInstance['status']) => {
    switch (status) {
      case 'draft': return '#6B7280';
      case 'active': return '#10B981';
      case 'paused': return '#F59E0B';
      case 'completed': return '#3B82F6';
      case 'error': return '#EF4444';
      case 'running': return '#F97316';
      case 'failed': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const totalWorkflows = workflows.length;
  const activeWorkflows = workflows.filter(w => w.status === 'active').length;
  const totalExecutions = executions.length;
  const completedExecutions = executions.filter(e => e.status === 'completed').length;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Advanced Workflow Orchestration</h1>
            <p className="text-gray-600">Complex workflow automation with intelligent decision-making</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">Tenant</div>
              <div className="font-mono text-sm">{tenantId}</div>
            </div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalWorkflows}</div>
            <div className="text-sm text-gray-600">Total Workflows</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{activeWorkflows}</div>
            <div className="text-sm text-gray-600">Active Workflows</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{totalExecutions}</div>
            <div className="text-sm text-gray-600">Total Executions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {totalExecutions > 0 ? ((completedExecutions / totalExecutions) * 100).toFixed(1) : 0}%
            </div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { id: 'workflows', label: 'Workflows', icon: '🔄' },
              { id: 'designer', label: 'Designer', icon: '🎨' },
              { id: 'executions', label: 'Executions', icon: '▶️' },
              { id: 'decisions', label: 'Decisions', icon: '🤔' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Workflows Tab */}
          {activeTab === 'workflows' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Workflow Library</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsCreatingWorkflow(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create Workflow
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {workflows.map((workflow) => (
                  <div
                    key={workflow.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-medium text-gray-900">{workflow.name}</h3>
                        <p className="text-sm text-gray-600">{workflow.description}</p>
                      </div>
                      <span
                        className="px-2 py-1 text-xs rounded-full text-white"
                        style={{ backgroundColor: getStatusColor(workflow.status) }}
                      >
                        {workflow.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <div className="text-gray-500">Nodes</div>
                        <div className="font-medium">{workflow.nodes.length}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Executions</div>
                        <div className="font-medium">{workflow.executionCount}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Success Rate</div>
                        <div className="font-medium">{(workflow.successRate * 100).toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Avg Time</div>
                        <div className="font-medium">{workflow.averageExecutionTime.toFixed(1)}m</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => executeWorkflow(workflow)}
                        disabled={workflow.status !== 'active'}
                        className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        Execute
                      </button>
                      <button
                        onClick={() => setSelectedWorkflow(workflow)}
                        className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Designer Tab */}
          {activeTab === 'designer' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Workflow Designer</h2>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Node Palette */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium mb-4">Node Types</h3>
                  <div className="space-y-2">
                    {[
                      { type: 'start', label: 'Start' },
                      { type: 'task', label: 'Task' },
                      { type: 'decision', label: 'Decision' },
                      { type: 'parallel', label: 'Parallel' },
                      { type: 'join', label: 'Join' },
                      { type: 'api', label: 'API Call' },
                      { type: 'human', label: 'Human Task' },
                      { type: 'ai', label: 'AI Task' },
                      { type: 'end', label: 'End' }
                    ].map((nodeType) => (
                      <div
                        key={nodeType.type}
                        className="flex items-center gap-3 p-2 bg-white rounded cursor-pointer hover:bg-gray-100"
                        onClick={() => addNodeToWorkflow(nodeType.type as WorkflowNode['type'], { x: 100, y: 100 })}
                      >
                        <span className="text-lg">{getNodeIcon(nodeType.type as WorkflowNode['type'])}</span>
                        <span className="text-sm">{nodeType.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Canvas */}
                <div className="lg:col-span-3">
                  <div
                    ref={canvasRef}
                    className="bg-white border-2 border-dashed border-gray-300 rounded-lg h-96 relative overflow-hidden"
                    onClick={(e) => {
                      if (e.target === canvasRef.current) {
                        const rect = canvasRef.current.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        // Could add node creation on canvas click
                      }
                    }}
                  >
                    {newWorkflow.nodes.map((node) => (
                      <div
                        key={node.id}
                        className="absolute w-20 h-12 rounded-lg flex items-center justify-center text-white text-xs font-medium cursor-pointer"
                        style={{
                          left: node.position.x,
                          top: node.position.y,
                          backgroundColor: getNodeColor(node.type)
                        }}
                      >
                        <span className="mr-1">{getNodeIcon(node.type)}</span>
                        {node.label}
                      </div>
                    ))}

                    {newWorkflow.nodes.length === 0 && (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                          <div className="text-4xl mb-2">🎨</div>
                          <div>Click node types to add them to your workflow</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Nodes: {newWorkflow.nodes.length} | Connections: {newWorkflow.edges.length}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setNewWorkflow({ name: '', description: '', nodes: [], edges: [] })}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                      >
                        Clear
                      </button>
                      <button
                        onClick={createWorkflow}
                        disabled={!newWorkflow.name || newWorkflow.nodes.length === 0}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        Save Workflow
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Executions Tab */}
          {activeTab === 'executions' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Workflow Executions</h2>

              {executions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-2">▶️</div>
                  <div>No workflow executions yet</div>
                  <div className="text-sm">Execute a workflow to see execution history</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {executions.map((execution) => (
                    <div key={execution.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            Execution {execution.id.slice(-8)}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Workflow: {workflows.find(w => w.id === execution.workflowId)?.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className="px-3 py-1 text-sm rounded-full text-white"
                            style={{ backgroundColor: getStatusColor(execution.status) }}
                          >
                            {execution.status}
                          </span>
                          <span className="text-sm text-gray-500">
                            {execution.startTime.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-gray-500">Duration</div>
                          <div className="font-medium">
                            {execution.endTime
                              ? `${Math.round((execution.endTime.getTime() - execution.startTime.getTime()) / 1000)}s`
                              : 'Running...'
                            }
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Steps Completed</div>
                          <div className="font-medium">{execution.history.length}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Current Node</div>
                          <div className="font-medium">{execution.currentNode || 'N/A'}</div>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium mb-2">Execution History</div>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {execution.history.map((step, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <span>{step.nodeId}</span>
                              <span className={`px-2 py-1 rounded text-xs ${
                                step.status === 'completed' ? 'bg-green-100 text-green-800' :
                                step.status === 'running' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {step.status}
                              </span>
                              <span className="text-gray-500">{step.timestamp.toLocaleTimeString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Decisions Tab */}
          {activeTab === 'decisions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Decision Rules</h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Add Rule
                </button>
              </div>

              <div className="space-y-4">
                {decisionRules.map((rule) => (
                  <div key={rule.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-medium text-gray-900">{rule.name}</h3>
                        <p className="text-sm text-gray-600">Priority: {rule.priority}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={rule.enabled}
                            onChange={(e) => setDecisionRules(prev => prev.map(r =>
                              r.id === rule.id ? { ...r, enabled: e.target.checked } : r
                            ))}
                          />
                          <span className="text-sm">Enabled</span>
                        </label>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-sm text-gray-500 mb-1">Condition</div>
                      <div className="font-mono text-sm bg-gray-50 p-2 rounded">{rule.condition}</div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500 mb-2">Actions</div>
                      <div className="flex flex-wrap gap-2">
                        {rule.actions.map((action, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                            {action.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Decision Engine Stats */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium mb-4">Decision Engine Performance</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded">
                    <div className="text-lg font-bold text-blue-600">{decisionRules.filter(r => r.enabled).length}</div>
                    <div className="text-sm text-gray-600">Active Rules</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded">
                    <div className="text-lg font-bold text-green-600">2,847</div>
                    <div className="text-sm text-gray-600">Decisions Made</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded">
                    <div className="text-lg font-bold text-purple-600">94.2%</div>
                    <div className="text-sm text-gray-600">Accuracy</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded">
                    <div className="text-lg font-bold text-orange-600">156ms</div>
                    <div className="text-sm text-gray-600">Avg Response</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Workflow Modal */}
      {isCreatingWorkflow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Create New Workflow</h2>
                <button
                  onClick={() => setIsCreatingWorkflow(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Workflow Name</label>
                  <input
                    type="text"
                    value={newWorkflow.name}
                    onChange={(e) => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter workflow name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newWorkflow.description}
                    onChange={(e) => setNewWorkflow(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe the workflow purpose"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={createWorkflow}
                    disabled={!newWorkflow.name}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create Workflow
                  </button>
                  <button
                    onClick={() => setIsCreatingWorkflow(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Details Modal */}
      {selectedWorkflow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{selectedWorkflow.name}</h2>
                <button
                  onClick={() => setSelectedWorkflow(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-gray-600">{selectedWorkflow.description}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-gray-900">{selectedWorkflow.nodes.length}</div>
                    <div className="text-sm text-gray-600">Nodes</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded">
                    <div className="text-lg font-bold text-blue-600">{selectedWorkflow.edges.length}</div>
                    <div className="text-sm text-gray-600">Connections</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded">
                    <div className="text-lg font-bold text-green-600">{selectedWorkflow.executionCount}</div>
                    <div className="text-sm text-gray-600">Executions</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded">
                    <div className="text-lg font-bold text-purple-600">{(selectedWorkflow.successRate * 100).toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                </div>

                {/* Workflow Visualization */}
                <div>
                  <h3 className="font-medium mb-4">Workflow Diagram</h3>
                  <div className="bg-gray-50 rounded-lg p-4 min-h-[300px] relative">
                    {selectedWorkflow.nodes.map((node) => (
                      <div
                        key={node.id}
                        className="absolute w-24 h-16 rounded-lg flex flex-col items-center justify-center text-white text-xs font-medium shadow-md"
                        style={{
                          left: node.position.x,
                          top: node.position.y,
                          backgroundColor: getNodeColor(node.type)
                        }}
                      >
                        <span className="mb-1">{getNodeIcon(node.type)}</span>
                        <span className="text-center leading-tight">{node.label}</span>
                      </div>
                    ))}

                    {/* Draw connections */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      {selectedWorkflow.edges.map((edge) => {
                        const sourceNode = selectedWorkflow.nodes.find(n => n.id === edge.source);
                        const targetNode = selectedWorkflow.nodes.find(n => n.id === edge.target);

                        if (!sourceNode || !targetNode) return null;

                        const x1 = sourceNode.position.x + 48; // Center of source node
                        const y1 = sourceNode.position.y + 32;
                        const x2 = targetNode.position.x + 48; // Center of target node
                        const y2 = targetNode.position.y + 32;

                        return (
                          <line
                            key={edge.id}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="#6B7280"
                            strokeWidth="2"
                            markerEnd="url(#arrowhead)"
                          />
                        );
                      })}
                      <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                          <polygon points="0 0, 10 3.5, 0 7" fill="#6B7280" />
                        </marker>
                      </defs>
                    </svg>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => executeWorkflow(selectedWorkflow)}
                    disabled={selectedWorkflow.status !== 'active'}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Execute Workflow
                  </button>
                  <button
                    onClick={() => setSelectedWorkflow(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}