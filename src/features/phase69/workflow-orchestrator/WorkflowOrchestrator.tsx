'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { GitBranch, Play, Pause, RotateCcw, Settings, Zap, CheckCircle, AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export interface WorkflowNode {
  id: string;
  type: 'start' | 'task' | 'decision' | 'parallel' | 'join' | 'end';
  label: string;
  position: { x: number; y: number };
  data: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  condition?: string;
  label?: string;
}

export interface WorkflowInstance {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  startTime: Date;
  endTime?: Date;
  currentNode?: string;
  variables: Record<string, any>;
  executionPath: string[];
  performance: {
    totalNodes: number;
    completedNodes: number;
    failedNodes: number;
    averageNodeTime: number;
    totalExecutionTime?: number;
  };
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'business' | 'technical' | 'approval' | 'integration';
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables: Array<{
    name: string;
    type: 'string' | 'number' | 'boolean' | 'object';
    defaultValue?: any;
    required: boolean;
  }>;
  triggers: Array<{
    type: 'manual' | 'schedule' | 'event' | 'api';
    config: Record<string, any>;
  }>;
  createdAt: Date;
  lastModified: Date;
  executions: number;
  successRate: number;
}

const SAMPLE_WORKFLOWS: WorkflowTemplate[] = [
  {
    id: 'approval-workflow',
    name: 'Purchase Approval Workflow',
    description: 'Multi-level approval process for purchase requests',
    category: 'business',
    nodes: [
      {
        id: 'start',
        type: 'start',
        label: 'Purchase Request Submitted',
        position: { x: 100, y: 100 },
        data: {},
        status: 'completed'
      },
      {
        id: 'manager-approval',
        type: 'decision',
        label: 'Manager Approval Required?',
        position: { x: 300, y: 100 },
        data: { condition: 'amount > 1000' },
        status: 'completed'
      },
      {
        id: 'manager-approve',
        type: 'task',
        label: 'Manager Approval',
        position: { x: 500, y: 50 },
        data: { assignee: 'manager', timeout: 24 },
        status: 'completed'
      },
      {
        id: 'director-approve',
        type: 'task',
        label: 'Director Approval',
        position: { x: 500, y: 150 },
        data: { assignee: 'director', timeout: 48 },
        status: 'running'
      },
      {
        id: 'approved',
        type: 'end',
        label: 'Purchase Approved',
        position: { x: 700, y: 100 },
        data: {},
        status: 'pending'
      }
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'manager-approval' },
      { id: 'e2', source: 'manager-approval', target: 'manager-approve', condition: 'amount > 1000' },
      { id: 'e3', source: 'manager-approval', target: 'director-approve', condition: 'amount > 5000' },
      { id: 'e4', source: 'manager-approve', target: 'approved' },
      { id: 'e5', source: 'director-approve', target: 'approved' }
    ],
    variables: [
      { name: 'amount', type: 'number', required: true },
      { name: 'department', type: 'string', required: true },
      { name: 'description', type: 'string', required: true }
    ],
    triggers: [
      { type: 'manual', config: {} },
      { type: 'api', config: { endpoint: '/api/workflows/purchase-approval' } }
    ],
    createdAt: new Date('2024-04-15'),
    lastModified: new Date('2024-04-20'),
    executions: 245,
    successRate: 94.7
  },
  {
    id: 'data-processing',
    name: 'Data Processing Pipeline',
    description: 'Automated data ingestion, validation, and processing workflow',
    category: 'technical',
    nodes: [
      {
        id: 'data-ingest',
        type: 'start',
        label: 'Data Ingestion',
        position: { x: 100, y: 100 },
        data: { source: 'api' },
        status: 'completed'
      },
      {
        id: 'validation',
        type: 'task',
        label: 'Data Validation',
        position: { x: 300, y: 100 },
        data: { rules: ['required_fields', 'data_types'] },
        status: 'completed'
      },
      {
        id: 'processing',
        type: 'parallel',
        label: 'Parallel Processing',
        position: { x: 500, y: 100 },
        data: { branches: 3 },
        status: 'running'
      },
      {
        id: 'aggregation',
        type: 'join',
        label: 'Result Aggregation',
        position: { x: 700, y: 100 },
        data: {},
        status: 'pending'
      },
      {
        id: 'storage',
        type: 'task',
        label: 'Data Storage',
        position: { x: 900, y: 100 },
        data: { destination: 'database' },
        status: 'pending'
      }
    ],
    edges: [
      { id: 'e1', source: 'data-ingest', target: 'validation' },
      { id: 'e2', source: 'validation', target: 'processing' },
      { id: 'e3', source: 'processing', target: 'aggregation' },
      { id: 'e4', source: 'aggregation', target: 'storage' }
    ],
    variables: [
      { name: 'dataSource', type: 'string', required: true },
      { name: 'batchSize', type: 'number', defaultValue: 1000, required: false },
      { name: 'validationRules', type: 'object', required: false }
    ],
    triggers: [
      { type: 'schedule', config: { cron: '0 */6 * * *' } },
      { type: 'event', config: { eventType: 'data_available' } }
    ],
    createdAt: new Date('2024-04-10'),
    lastModified: new Date('2024-04-19'),
    executions: 892,
    successRate: 97.3
  }
];

export const WorkflowOrchestrator: React.FC = () => {
  const [workflows, setWorkflows] = useState<WorkflowTemplate[]>(SAMPLE_WORKFLOWS);
  const [instances, setInstances] = useState<WorkflowInstance[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'workflows' | 'instances' | 'analytics'>('workflows');

  // Simulate workflow execution
  const executeWorkflow = useCallback(async (workflowId: string, variables: Record<string, any> = {}) => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (!workflow) return;

    const instance: WorkflowInstance = {
      id: `instance-${Date.now()}`,
      workflowId,
      status: 'running',
      startTime: new Date(),
      variables,
      executionPath: ['start'],
      performance: {
        totalNodes: workflow.nodes.length,
        completedNodes: 0,
        failedNodes: 0,
        averageNodeTime: 0
      }
    };

    setInstances(prev => [instance, ...prev]);

    // Simulate node-by-node execution
    const executeNode = async (nodeId: string, path: string[]) => {
      const node = workflow.nodes.find(n => n.id === nodeId);
      if (!node) return;

      // Update instance with current node
      setInstances(prev => prev.map(inst =>
        inst.id === instance.id
          ? { ...inst, currentNode: nodeId, executionPath: path }
          : inst
      ));

      // Simulate node execution time
      const executionTime = Math.random() * 3000 + 1000;
      await new Promise(resolve => setTimeout(resolve, executionTime));

      const nodeSuccess = Math.random() > 0.1; // 90% success rate

      // Update node status
      setWorkflows(prev => prev.map(wf =>
        wf.id === workflowId
          ? {
              ...wf,
              nodes: wf.nodes.map(n =>
                n.id === nodeId
                  ? { ...n, status: nodeSuccess ? 'completed' : 'failed' }
                  : n
              )
            }
          : wf
      ));

      // Update instance performance
      setInstances(prev => prev.map(inst =>
        inst.id === instance.id
          ? {
              ...inst,
              performance: {
                ...inst.performance,
                completedNodes: inst.performance.completedNodes + (nodeSuccess ? 1 : 0),
                failedNodes: inst.performance.failedNodes + (nodeSuccess ? 0 : 1)
              }
            }
          : inst
      ));

      if (!nodeSuccess) {
        // Mark instance as failed
        setInstances(prev => prev.map(inst =>
          inst.id === instance.id
            ? {
                ...inst,
                status: 'failed',
                endTime: new Date()
              }
            : inst
        ));
        return;
      }

      // Determine next node based on type and conditions
      const nextEdges = workflow.edges.filter(e => e.source === nodeId);
      if (nextEdges.length === 0) {
        // End of workflow
        setInstances(prev => prev.map(inst =>
          inst.id === instance.id
            ? {
                ...inst,
                status: 'completed',
                endTime: new Date(),
                performance: {
                  ...inst.performance,
                  totalExecutionTime: Date.now() - inst.startTime.getTime()
                }
              }
            : inst
        ));
        return;
      }

      // For simplicity, take the first edge (in real implementation, evaluate conditions)
      const nextNodeId = nextEdges[0].target;
      const newPath = [...path, nextNodeId];

      // Continue execution
      setTimeout(() => executeNode(nextNodeId, newPath), 500);
    };

    // Start execution from the start node
    const startNode = workflow.nodes.find(n => n.type === 'start');
    if (startNode) {
      executeNode(startNode.id, [startNode.id]);
    }
  }, [workflows]);

  // Get workflow statistics
  const getWorkflowStats = () => {
    const totalWorkflows = workflows.length;
    const activeInstances = instances.filter(i => i.status === 'running').length;
    const completedInstances = instances.filter(i => i.status === 'completed').length;
    const failedInstances = instances.filter(i => i.status === 'failed').length;
    const avgExecutionTime = instances
      .filter(i => i.performance.totalExecutionTime)
      .reduce((sum, i) => sum + i.performance.totalExecutionTime!, 0) /
      instances.filter(i => i.performance.totalExecutionTime).length || 0;

    return {
      totalWorkflows,
      activeInstances,
      completedInstances,
      failedInstances,
      avgExecutionTime,
      successRate: (completedInstances / (completedInstances + failedInstances)) * 100 || 100
    };
  };

  const stats = getWorkflowStats();

  // Generate performance chart data
  const performanceData = [
    { time: '00:00', executions: 12, avgTime: 2450 },
    { time: '04:00', executions: 8, avgTime: 2100 },
    { time: '08:00', executions: 25, avgTime: 2800 },
    { time: '12:00', executions: 35, avgTime: 3200 },
    { time: '16:00', executions: 28, avgTime: 2900 },
    { time: '20:00', executions: 18, avgTime: 2600 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <GitBranch className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Workflow Orchestrator</h1>
              <p className="text-gray-600">Intelligent workflow orchestration with conditional logic and dynamic routing</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Workflows</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalWorkflows}</p>
            </div>
            <GitBranch className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Instances</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeInstances}</p>
            </div>
            <Play className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.successRate.toFixed(1)}%</p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Execution Time</p>
              <p className="text-2xl font-bold text-gray-900">{(stats.avgExecutionTime / 1000).toFixed(1)}s</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflow Performance (Last 24 Hours)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Bar yAxisId="left" dataKey="executions" fill="#3b82f6" name="Executions" />
            <Line yAxisId="right" type="monotone" dataKey="avgTime" stroke="#ef4444" strokeWidth={2} name="Avg Time (ms)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setSelectedTab('workflows')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedTab === 'workflows'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Workflows
            </button>
            <button
              onClick={() => setSelectedTab('instances')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedTab === 'instances'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Instances
            </button>
            <button
              onClick={() => setSelectedTab('analytics')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>

        <div className="p-6">
          {selectedTab === 'workflows' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Workflow Templates</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Create Workflow
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {workflows.map((workflow) => (
                  <div key={workflow.id} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <GitBranch className="w-6 h-6 text-blue-600" />
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{workflow.name}</h4>
                          <p className="text-sm text-gray-600">{workflow.description}</p>
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        workflow.category === 'business' ? 'bg-green-100 text-green-800' :
                        workflow.category === 'technical' ? 'bg-blue-100 text-blue-800' :
                        workflow.category === 'approval' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {workflow.category}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-gray-600">Nodes:</span>
                        <span className="ml-2 font-medium">{workflow.nodes.length}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Executions:</span>
                        <span className="ml-2 font-medium">{workflow.executions}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Success Rate:</span>
                        <span className="ml-2 font-medium">{workflow.successRate.toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Variables:</span>
                        <span className="ml-2 font-medium">{workflow.variables.length}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Workflow Triggers:</h5>
                      <div className="flex flex-wrap gap-1">
                        {workflow.triggers.map((trigger, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded capitalize">
                            {trigger.type}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Simple workflow visualization */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center space-x-4 overflow-x-auto">
                        {workflow.nodes.slice(0, 6).map((node, index) => (
                          <React.Fragment key={node.id}>
                            <div className={`flex flex-col items-center space-y-1 min-w-0 ${
                              node.status === 'completed' ? 'text-green-600' :
                              node.status === 'running' ? 'text-blue-600' :
                              'text-gray-400'
                            }`}>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                node.type === 'start' ? 'bg-green-500' :
                                node.type === 'end' ? 'bg-red-500' :
                                node.type === 'decision' ? 'bg-yellow-500' :
                                node.type === 'task' ? 'bg-blue-500' : 'bg-gray-500'
                              }`}>
                                <span className="text-white text-xs font-bold">
                                  {node.type === 'start' ? 'S' :
                                   node.type === 'end' ? 'E' :
                                   node.type === 'decision' ? 'D' :
                                   node.type === 'task' ? 'T' : '?'}
                                </span>
                              </div>
                              <span className="text-xs text-center leading-tight max-w-16 truncate">
                                {node.label}
                              </span>
                            </div>
                            {index < workflow.nodes.slice(0, 6).length - 1 && (
                              <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => executeWorkflow(workflow.id)}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                      >
                        <Play className="w-4 h-4 inline mr-1" />
                        Execute
                      </button>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700">
                          <Settings className="w-4 h-4 inline mr-1" />
                          Edit
                        </button>
                        <span className="text-xs text-gray-500">
                          Modified {workflow.lastModified.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'instances' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Workflow Instances</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Start New Instance
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Instance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Workflow
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Node
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Start Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {instances.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                          No workflow instances running. Execute a workflow to see instances here.
                        </td>
                      </tr>
                    ) : (
                      instances.map((instance) => {
                        const workflow = workflows.find(w => w.id === instance.workflowId);
                        const progress = (instance.performance.completedNodes / instance.performance.totalNodes) * 100;

                        return (
                          <tr key={instance.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {instance.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {workflow?.name || 'Unknown'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                instance.status === 'running' ? 'bg-blue-100 text-blue-800' :
                                instance.status === 'completed' ? 'bg-green-100 text-green-800' :
                                instance.status === 'failed' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {instance.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {instance.currentNode || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-900">{progress.toFixed(0)}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {instance.startTime.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button className="text-blue-600 hover:text-blue-900">
                                  View Details
                                </button>
                                {instance.status === 'running' && (
                                  <button className="text-yellow-600 hover:text-yellow-900">
                                    Pause
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Workflow Analytics</h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Workflow Performance by Category</h4>
                  <div className="space-y-3">
                    {['business', 'technical', 'approval', 'integration'].map(category => {
                      const categoryWorkflows = workflows.filter(w => w.category === category);
                      const avgSuccess = categoryWorkflows.reduce((sum, w) => sum + w.successRate, 0) / categoryWorkflows.length || 0;

                      return (
                        <div key={category} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 capitalize">{category}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">{avgSuccess.toFixed(1)}%</span>
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${avgSuccess}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Execution Trends</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="executions" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Node Type Performance</h4>
                  <div className="space-y-3">
                    {['start', 'task', 'decision', 'parallel', 'join', 'end'].map(nodeType => {
                      const avgTime = Math.random() * 2000 + 500; // Simulated data
                      return (
                        <div key={nodeType} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 capitalize">{nodeType}</span>
                          <span className="text-sm font-medium">{(avgTime / 1000).toFixed(1)}s avg</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">System Health</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Workflows</span>
                      <span className="text-sm font-medium text-green-600">{stats.activeInstances}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Queue Depth</span>
                      <span className="text-sm font-medium text-blue-600">3</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Error Rate</span>
                      <span className="text-sm font-medium text-red-600">2.1%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Avg Throughput</span>
                      <span className="text-sm font-medium text-purple-600">24.5/min</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowOrchestrator;