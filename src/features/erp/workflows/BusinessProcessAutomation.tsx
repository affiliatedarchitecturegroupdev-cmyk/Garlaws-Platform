'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface WorkflowStep {
  id: string;
  name: string;
  type: 'start' | 'task' | 'decision' | 'approval' | 'notification' | 'integration' | 'end';
  position: { x: number; y: number };
  config: {
    assignee?: string;
    department?: string;
    duration?: number;
    conditions?: string[];
    integrations?: string[];
    notifications?: string[];
    approvalRequired?: boolean;
    parallelExecution?: boolean;
  };
  connections: string[]; // IDs of connected steps
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  category: 'procurement' | 'sales' | 'inventory' | 'finance' | 'hr' | 'operations';
  status: 'draft' | 'active' | 'inactive' | 'archived';
  version: number;
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  variables: WorkflowVariable[];
  createdAt: string;
  updatedAt: string;
  lastExecuted?: string;
  executionCount: number;
  averageDuration: number;
}

interface WorkflowTrigger {
  id: string;
  type: 'manual' | 'scheduled' | 'event' | 'api' | 'webhook';
  config: {
    schedule?: string;
    eventType?: string;
    apiEndpoint?: string;
    webhookUrl?: string;
    conditions?: string[];
  };
}

interface WorkflowVariable {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object';
  defaultValue?: any;
  required: boolean;
  description?: string;
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  startedAt: string;
  completedAt?: string;
  currentStep?: string;
  variables: Record<string, any>;
  steps: WorkflowExecutionStep[];
  error?: string;
}

interface WorkflowExecutionStep {
  stepId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startedAt?: string;
  completedAt?: string;
  output?: any;
  error?: string;
}

interface BusinessProcessAutomationProps {
  tenantId?: string;
}

export default function BusinessProcessAutomation({ tenantId = 'default' }: BusinessProcessAutomationProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'workflows' | 'designer' | 'executions'>('workflows');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState<Partial<Workflow>>({
    name: '',
    description: '',
    category: 'operations',
    status: 'draft',
    steps: [],
    triggers: [],
    variables: []
  });
  const [draggedStep, setDraggedStep] = useState<WorkflowStep | null>(null);
  const [connectingSteps, setConnectingSteps] = useState<{ from: string; to: string } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const fetchWorkflows = useCallback(async () => {
    try {
      const response = await fetch(`/api/erp?action=workflows&tenantId=${tenantId}`);
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
    if (!newWorkflow.name) return;

    try {
      const response = await fetch('/api/erp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-workflow',
          tenantId,
          workflow: {
            ...newWorkflow,
            version: 1,
            executionCount: 0,
            averageDuration: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        setWorkflows([...workflows, data.data]);
        setShowCreateForm(false);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to create workflow:', error);
    }
  };

  const resetForm = () => {
    setNewWorkflow({
      name: '',
      description: '',
      category: 'operations',
      status: 'draft',
      steps: [],
      triggers: [],
      variables: []
    });
  };

  const executeWorkflow = async (workflowId: string, variables: Record<string, any> = {}) => {
    try {
      const response = await fetch('/api/erp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'execute-workflow',
          tenantId,
          workflowId,
          variables
        })
      });

      const data = await response.json();
      if (data.success) {
        // Refresh executions
        fetchExecutions(workflowId);
      }
    } catch (error) {
      console.error('Failed to execute workflow:', error);
    }
  };

  const fetchExecutions = async (workflowId?: string) => {
    try {
      const url = workflowId
        ? `/api/erp?action=workflow-executions&workflowId=${workflowId}&tenantId=${tenantId}`
        : `/api/erp?action=workflow-executions&tenantId=${tenantId}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setExecutions(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch executions:', error);
    }
  };

  const addStepToWorkflow = (stepType: WorkflowStep['type'], position: { x: number; y: number }) => {
    if (!selectedWorkflow) return;

    const newStep: WorkflowStep = {
      id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${stepType.charAt(0).toUpperCase() + stepType.slice(1)} Step`,
      type: stepType,
      position,
      config: {},
      connections: []
    };

    const updatedWorkflow = {
      ...selectedWorkflow,
      steps: [...selectedWorkflow.steps, newStep],
      updatedAt: new Date().toISOString()
    };

    setSelectedWorkflow(updatedWorkflow);
    updateWorkflow(updatedWorkflow);
  };

  const updateWorkflow = async (workflow: Workflow) => {
    try {
      const response = await fetch('/api/erp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-workflow',
          tenantId,
          workflowId: workflow.id,
          updates: workflow
        })
      });

      const data = await response.json();
      if (data.success) {
        setWorkflows(workflows.map(w => w.id === workflow.id ? workflow : w));
      }
    } catch (error) {
      console.error('Failed to update workflow:', error);
    }
  };

  const deleteWorkflow = async (workflowId: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;

    try {
      const response = await fetch('/api/erp', {
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
        if (selectedWorkflow?.id === workflowId) {
          setSelectedWorkflow(null);
        }
      }
    } catch (error) {
      console.error('Failed to delete workflow:', error);
    }
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'start': return '🎯';
      case 'task': return '📋';
      case 'decision': return '🔀';
      case 'approval': return '✅';
      case 'notification': return '📧';
      case 'integration': return '🔗';
      case 'end': return '🏁';
      default: return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'archived': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getExecutionStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stepTemplates = [
    { type: 'start' as const, name: 'Start Event', description: 'Workflow initiation point' },
    { type: 'task' as const, name: 'Task', description: 'Manual or automated task' },
    { type: 'decision' as const, name: 'Decision', description: 'Conditional branching' },
    { type: 'approval' as const, name: 'Approval', description: 'Requires approval' },
    { type: 'notification' as const, name: 'Notification', description: 'Send notifications' },
    { type: 'integration' as const, name: 'Integration', description: 'External system integration' },
    { type: 'end' as const, name: 'End Event', description: 'Workflow completion' }
  ];

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <h2 className="text-2xl font-bold text-gray-900">Business Process Automation</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Workflow
          </button>
          <button
            onClick={() => setActiveTab('executions')}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            View Executions
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('workflows')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'workflows'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Workflows ({workflows.length})
          </button>
          {selectedWorkflow && (
            <button
              onClick={() => setActiveTab('designer')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'designer'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Designer
            </button>
          )}
          <button
            onClick={() => {
              setActiveTab('executions');
              fetchExecutions();
            }}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'executions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Executions ({executions.length})
          </button>
        </nav>
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
                value={newWorkflow.name || ''}
                onChange={(e) => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Purchase Order Approval Workflow"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={newWorkflow.description || ''}
                onChange={(e) => setNewWorkflow(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Automated workflow for purchase order processing and approval"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={newWorkflow.category || 'operations'}
                onChange={(e) => setNewWorkflow(prev => ({ ...prev, category: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="procurement">Procurement</option>
                <option value="sales">Sales</option>
                <option value="inventory">Inventory</option>
                <option value="finance">Finance</option>
                <option value="hr">Human Resources</option>
                <option value="operations">Operations</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={newWorkflow.status || 'draft'}
                onChange={(e) => setNewWorkflow(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
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
              onClick={() => {
                setShowCreateForm(false);
                resetForm();
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Workflows Tab */}
      {activeTab === 'workflows' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows.map((workflow) => (
            <div
              key={workflow.id}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{workflow.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{workflow.description}</p>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(workflow.status)}`}>
                      {workflow.status}
                    </span>
                    <span className="text-xs text-gray-500">{workflow.category}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-600">Steps:</span>
                  <span className="ml-1 font-medium">{workflow.steps.length}</span>
                </div>
                <div>
                  <span className="text-gray-600">Executions:</span>
                  <span className="ml-1 font-medium">{workflow.executionCount}</span>
                </div>
                <div>
                  <span className="text-gray-600">Avg Duration:</span>
                  <span className="ml-1 font-medium">{workflow.averageDuration.toFixed(1)}s</span>
                </div>
                <div>
                  <span className="text-gray-600">Version:</span>
                  <span className="ml-1 font-medium">v{workflow.version}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedWorkflow(workflow);
                    setActiveTab('designer');
                  }}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  Design
                </button>
                <button
                  onClick={() => executeWorkflow(workflow.id)}
                  disabled={workflow.status !== 'active'}
                  className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  Run
                </button>
                <button
                  onClick={() => deleteWorkflow(workflow.id)}
                  className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {workflows.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">
              <div className="text-6xl mb-4">🔄</div>
              <p className="text-lg">No workflows configured</p>
              <p className="text-sm">Create automated business processes to streamline operations.</p>
            </div>
          )}
        </div>
      )}

      {/* Designer Tab */}
      {activeTab === 'designer' && selectedWorkflow && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">{selectedWorkflow.name}</h3>
                <p className="text-sm text-gray-600">{selectedWorkflow.description}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('workflows')}
                  className="px-3 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
                >
                  Back to Workflows
                </button>
                <button
                  onClick={() => updateWorkflow(selectedWorkflow)}
                  className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>

          <div className="flex h-96">
            {/* Step Palette */}
            <div className="w-64 border-r border-gray-200 p-4 bg-gray-50">
              <h4 className="font-semibold mb-4">Step Types</h4>
              <div className="space-y-2">
                {stepTemplates.map((template) => (
                  <div
                    key={template.type}
                    draggable
                    onDragStart={() => setDraggedStep({
                      id: '',
                      name: template.name,
                      type: template.type,
                      position: { x: 0, y: 0 },
                      config: {},
                      connections: []
                    })}
                    className="p-3 bg-white border border-gray-200 rounded cursor-move hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getStepIcon(template.type)}</span>
                      <div>
                        <div className="font-medium text-sm">{template.name}</div>
                        <div className="text-xs text-gray-600">{template.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Canvas */}
            <div
              ref={canvasRef}
              className="flex-1 relative bg-gray-50 overflow-auto"
              onDrop={(e) => {
                e.preventDefault();
                if (draggedStep && canvasRef.current) {
                  const rect = canvasRef.current.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  addStepToWorkflow(draggedStep.type, { x, y });
                }
                setDraggedStep(null);
              }}
              onDragOver={(e) => e.preventDefault()}
            >
              {/* Grid Background */}
              <div className="absolute inset-0 opacity-20">
                <svg width="100%" height="100%">
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              {/* Workflow Steps */}
              {selectedWorkflow.steps.map((step) => (
                <div
                  key={step.id}
                  className="absolute bg-white border-2 border-gray-300 rounded-lg p-3 shadow-sm cursor-move hover:border-blue-500 transition-colors"
                  style={{
                    left: step.position.x,
                    top: step.position.y,
                    minWidth: '120px'
                  }}
                  onClick={() => {/* Open step configuration */}}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">{getStepIcon(step.type)}</span>
                    <span className="font-medium text-sm">{step.name}</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {step.type.charAt(0).toUpperCase() + step.type.slice(1)}
                  </div>

                  {/* Connection Points */}
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white cursor-crosshair"
                       onClick={() => setConnectingSteps({ from: step.id, to: '' })}></div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white cursor-crosshair"></div>
                </div>
              ))}

              {/* Empty State */}
              {selectedWorkflow.steps.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🎯</div>
                    <p>Drag steps from the palette to start building your workflow</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Executions Tab */}
      {activeTab === 'executions' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Workflow Executions</h3>
            <button
              onClick={() => fetchExecutions()}
              className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>

          <div className="space-y-4">
            {executions.map((execution) => (
              <div key={execution.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getExecutionStatusColor(execution.status)}`}>
                        {execution.status}
                      </span>
                      <span className="text-sm font-medium">
                        {workflows.find(w => w.id === execution.workflowId)?.name || 'Unknown Workflow'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Started: {new Date(execution.startedAt).toLocaleString()}
                      {execution.completedAt && ` • Completed: ${new Date(execution.completedAt).toLocaleString()}`}
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    Duration: {execution.completedAt
                      ? `${((new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime()) / 1000).toFixed(1)}s`
                      : 'Running...'}
                  </div>
                </div>

                {/* Execution Steps */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {execution.steps.map((step) => (
                    <div key={step.stepId} className="border border-gray-200 rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {selectedWorkflow?.steps.find(s => s.id === step.stepId)?.name || step.stepId}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          step.status === 'completed' ? 'bg-green-100 text-green-800' :
                          step.status === 'running' ? 'bg-blue-100 text-blue-800' :
                          step.status === 'failed' ? 'bg-red-100 text-red-800' :
                          step.status === 'skipped' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {step.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        {step.startedAt && `Started: ${new Date(step.startedAt).toLocaleString()}`}
                        {step.completedAt && ` • Completed: ${new Date(step.completedAt).toLocaleString()}`}
                      </div>
                      {step.error && (
                        <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                          {step.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {execution.error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                    <div className="text-sm font-medium text-red-800 mb-1">Execution Error:</div>
                    <div className="text-sm text-red-700">{execution.error}</div>
                  </div>
                )}
              </div>
            ))}

            {executions.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-2">▶️</div>
                <p>No workflow executions found</p>
                <p className="text-sm">Execute workflows to see execution history and performance metrics.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}