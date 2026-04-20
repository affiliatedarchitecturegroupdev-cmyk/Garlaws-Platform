'use client';

import { useState, useEffect, useCallback } from 'react';

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'draft' | 'error';
  trigger: WorkflowTrigger;
  actions: WorkflowAction[];
  conditions?: WorkflowCondition[];
  executions: WorkflowExecution[];
  createdAt: string;
  lastExecuted?: string;
  successRate: number;
}

interface WorkflowTrigger {
  type: 'schedule' | 'event' | 'manual' | 'api';
  config: any; // Schedule config, event type, etc.
}

interface WorkflowAction {
  id: string;
  type: 'email' | 'notification' | 'api_call' | 'database_update' | 'file_operation';
  config: any;
  order: number;
}

interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

interface WorkflowExecution {
  id: string;
  startedAt: string;
  completedAt?: string;
  status: 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

interface WorkflowAutomationProps {
  tenantId?: string;
}

export default function WorkflowAutomation({ tenantId = 'default' }: WorkflowAutomationProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [newWorkflowDescription, setNewWorkflowDescription] = useState('');
  const [newWorkflowTrigger, setNewWorkflowTrigger] = useState<'schedule' | 'event' | 'manual' | 'api'>('manual');

  const fetchWorkflows = useCallback(async () => {
    try {
      const response = await fetch(`/api/ml?action=workflows&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setWorkflows(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const createWorkflow = async () => {
    if (!newWorkflowName.trim()) return;

    try {
      const response = await fetch('/api/ml', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-workflow',
          tenantId,
          name: newWorkflowName,
          description: newWorkflowDescription,
          trigger: {
            type: newWorkflowTrigger,
            config: getDefaultTriggerConfig(newWorkflowTrigger)
          },
          actions: [],
          conditions: []
        })
      });

      const data = await response.json();
      if (data.success) {
        setWorkflows([...workflows, data.data]);
        setShowCreateForm(false);
        setNewWorkflowName('');
        setNewWorkflowDescription('');
        setNewWorkflowTrigger('manual');
      }
    } catch (error) {
      console.error('Failed to create workflow:', error);
    }
  };

  const getDefaultTriggerConfig = (type: string) => {
    switch (type) {
      case 'schedule':
        return { frequency: 'daily', time: '09:00' };
      case 'event':
        return { eventType: 'user_registration' };
      case 'api':
        return { endpoint: '/api/trigger-workflow' };
      default:
        return {};
    }
  };

  const toggleWorkflowStatus = async (workflowId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    try {
      const response = await fetch('/api/ml', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-workflow-status',
          tenantId,
          workflowId,
          status: newStatus
        })
      });

      const data = await response.json();
      if (data.success) {
        setWorkflows(workflows.map(w => w.id === workflowId ? { ...w, status: newStatus } : w));
      }
    } catch (error) {
      console.error('Failed to update workflow status:', error);
    }
  };

  const executeWorkflow = async (workflowId: string) => {
    try {
      const response = await fetch('/api/ml', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'execute-workflow',
          tenantId,
          workflowId
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Workflow execution started successfully');
        fetchWorkflows(); // Refresh to show execution
      }
    } catch (error) {
      console.error('Failed to execute workflow:', error);
    }
  };

  const deleteWorkflow = async (workflowId: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;

    try {
      const response = await fetch('/api/ml', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete-workflow',
          tenantId,
          workflowId
        })
      });

      const data = await response.json();
      if (data.success) {
        setWorkflows(workflows.filter(w => w.id !== workflowId));
      }
    } catch (error) {
      console.error('Failed to delete workflow:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTriggerTypeIcon = (type: string) => {
    switch (type) {
      case 'schedule': return '⏰';
      case 'event': return '🔔';
      case 'manual': return '👤';
      case 'api': return '🔗';
      default: return '⚙️';
    }
  };

  const getActionTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return '📧';
      case 'notification': return '🔔';
      case 'api_call': return '🔗';
      case 'database_update': return '💾';
      case 'file_operation': return '📁';
      default: return '⚡';
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Workflow Automation</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Create New Workflow
        </button>
      </div>

      {/* Create Workflow Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Create New Workflow</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Workflow Name</label>
              <input
                type="text"
                value={newWorkflowName}
                onChange={(e) => setNewWorkflowName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter workflow name"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={newWorkflowDescription}
                onChange={(e) => setNewWorkflowDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Describe what this workflow does"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trigger Type</label>
              <select
                value={newWorkflowTrigger}
                onChange={(e) => setNewWorkflowTrigger(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="manual">Manual Trigger</option>
                <option value="schedule">Scheduled</option>
                <option value="event">Event-Based</option>
                <option value="api">API Trigger</option>
              </select>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={createWorkflow}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Create Workflow
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Workflows</p>
              <p className="text-2xl font-bold text-gray-900">{workflows.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Workflows</p>
              <p className="text-2xl font-bold text-green-600">
                {workflows.filter(w => w.status === 'active').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Executions Today</p>
              <p className="text-2xl font-bold text-purple-600">
                {workflows.reduce((sum, w) => sum + w.executions.filter(e =>
                  new Date(e.startedAt).toDateString() === new Date().toDateString()
                ).length, 0)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Success Rate</p>
              <p className="text-2xl font-bold text-orange-600">
                {workflows.length > 0
                  ? Math.round(workflows.reduce((sum, w) => sum + w.successRate, 0) / workflows.length)
                  : 0}%
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Workflows Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {workflows.map((workflow) => (
          <div
            key={workflow.id}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{workflow.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(workflow.status)}`}>
                    {workflow.status}
                  </span>
                </div>
                <p className="text-gray-700 mb-3">{workflow.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  <span className="flex items-center space-x-1">
                    <span>{getTriggerTypeIcon(workflow.trigger.type)}</span>
                    <span>{workflow.trigger.type}</span>
                  </span>
                  <span>Actions: {workflow.actions.length}</span>
                  <span>Success: {workflow.successRate}%</span>
                </div>
                <div className="text-xs text-gray-500">
                  Created: {new Date(workflow.createdAt).toLocaleDateString()}
                  {workflow.lastExecuted && (
                    <> • Last executed: {new Date(workflow.lastExecuted).toLocaleDateString()}</>
                  )}
                </div>
              </div>
            </div>

            {/* Actions List Preview */}
            {workflow.actions.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Actions:</h4>
                <div className="space-y-1">
                  {workflow.actions.slice(0, 3).map((action) => (
                    <div key={action.id} className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>{getActionTypeIcon(action.type)}</span>
                      <span>{action.type.replace('_', ' ')}</span>
                    </div>
                  ))}
                  {workflow.actions.length > 3 && (
                    <div className="text-sm text-gray-500">
                      +{workflow.actions.length - 3} more actions
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recent Executions */}
            {workflow.executions.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Executions:</h4>
                <div className="space-y-1">
                  {workflow.executions.slice(0, 3).map((execution) => (
                    <div key={execution.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {new Date(execution.startedAt).toLocaleDateString()}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        execution.status === 'completed' ? 'bg-green-100 text-green-800' :
                        execution.status === 'running' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {execution.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedWorkflow(workflow)}
                className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                View Details
              </button>
              <button
                onClick={() => toggleWorkflowStatus(workflow.id, workflow.status)}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  workflow.status === 'active'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {workflow.status === 'active' ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => executeWorkflow(workflow.id)}
                className="px-3 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors"
                disabled={workflow.status !== 'active'}
              >
                Run
              </button>
              <button
                onClick={() => deleteWorkflow(workflow.id)}
                className="px-3 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {workflows.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">
            <div className="text-6xl mb-4">⚙️</div>
            <p className="text-lg">No workflows configured</p>
            <p className="text-sm">Create automated workflows to streamline your business processes.</p>
          </div>
        )}
      </div>

      {/* Workflow Detail Modal */}
      {selectedWorkflow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{selectedWorkflow.name}</h3>
              <button
                onClick={() => setSelectedWorkflow(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">Status</h4>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(selectedWorkflow.status)}`}>
                    {selectedWorkflow.status}
                  </span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">Trigger</h4>
                  <div className="flex items-center space-x-2">
                    <span>{getTriggerTypeIcon(selectedWorkflow.trigger.type)}</span>
                    <span className="text-sm capitalize">{selectedWorkflow.trigger.type}</span>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">Actions</h4>
                  <p className="text-lg font-bold text-gray-900">{selectedWorkflow.actions.length}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">Success Rate</h4>
                  <p className="text-lg font-bold text-gray-900">{selectedWorkflow.successRate}%</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Description</h4>
                <p className="text-gray-700">{selectedWorkflow.description}</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Actions ({selectedWorkflow.actions.length})</h4>
                <div className="space-y-3">
                  {selectedWorkflow.actions.map((action, index) => (
                    <div key={action.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-lg">{getActionTypeIcon(action.type)}</span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 capitalize">
                          {action.type.replace('_', ' ')}
                        </div>
                        <div className="text-sm text-gray-600">
                          Step {action.order}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {JSON.stringify(action.config)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Recent Executions</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedWorkflow.executions.map((execution) => (
                    <div key={execution.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">
                          {new Date(execution.startedAt).toLocaleString()}
                        </div>
                        {execution.completedAt && (
                          <div className="text-sm text-gray-600">
                            Duration: {Math.round((new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime()) / 1000)}s
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          execution.status === 'completed' ? 'bg-green-100 text-green-800' :
                          execution.status === 'running' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {execution.status}
                        </span>
                        {execution.error && (
                          <div className="text-xs text-red-600 mt-1 max-w-xs truncate">
                            {execution.error}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}