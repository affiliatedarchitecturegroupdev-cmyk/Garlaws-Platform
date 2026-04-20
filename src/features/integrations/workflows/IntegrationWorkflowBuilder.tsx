'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface WorkflowStep {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay' | 'end';
  name: string;
  config: any;
  position: { x: number; y: number };
  connections: string[]; // IDs of connected steps
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  status: 'draft' | 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

interface IntegrationWorkflowBuilderProps {
  tenantId?: string;
}

export default function IntegrationWorkflowBuilder({ tenantId = 'default' }: IntegrationWorkflowBuilderProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [draggedStep, setDraggedStep] = useState<WorkflowStep | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const availableSteps = [
    { type: 'trigger', name: 'Webhook Trigger', icon: '🎣', color: 'bg-green-500' },
    { type: 'trigger', name: 'Schedule Trigger', icon: '⏰', color: 'bg-blue-500' },
    { type: 'trigger', name: 'Event Trigger', icon: '🔔', color: 'bg-yellow-500' },
    { type: 'action', name: 'API Call', icon: '🔗', color: 'bg-purple-500' },
    { type: 'action', name: 'Send Email', icon: '📧', color: 'bg-red-500' },
    { type: 'action', name: 'Create Record', icon: '📝', color: 'bg-indigo-500' },
    { type: 'action', name: 'Update Record', icon: '✏️', color: 'bg-orange-500' },
    { type: 'condition', name: 'If/Then', icon: '🔀', color: 'bg-pink-500' },
    { type: 'delay', name: 'Wait/Delay', icon: '⏳', color: 'bg-gray-500' },
    { type: 'end', name: 'End Workflow', icon: '🏁', color: 'bg-black' }
  ];

  const fetchWorkflows = useCallback(async () => {
    try {
      const response = await fetch(`/api/integrations?action=integration-workflows&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setWorkflows(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const createNewWorkflow = () => {
    const newWorkflow: Workflow = {
      id: `wf_${Date.now()}`,
      name: 'New Integration Workflow',
      description: 'Build your integration workflow',
      steps: [],
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setSelectedWorkflow(newWorkflow);
    setIsEditing(true);
  };

  const saveWorkflow = async () => {
    if (!selectedWorkflow) return;

    try {
      const method = workflows.find(w => w.id === selectedWorkflow.id) ? 'PUT' : 'POST';
      const response = await fetch('/api/integrations', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: method === 'POST' ? 'create-integration-workflow' : 'update-integration-workflow',
          tenantId,
          workflow: selectedWorkflow
        })
      });

      const data = await response.json();
      if (data.success) {
        setWorkflows(prev => {
          const existing = prev.find(w => w.id === selectedWorkflow.id);
          if (existing) {
            return prev.map(w => w.id === selectedWorkflow.id ? selectedWorkflow : w);
          } else {
            return [...prev, selectedWorkflow];
          }
        });
        setIsEditing(false);
        alert('Workflow saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save workflow:', error);
    }
  };

  const addStepToWorkflow = (stepTemplate: typeof availableSteps[0], position: { x: number; y: number }) => {
    if (!selectedWorkflow) return;

    const newStep: WorkflowStep = {
      id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: stepTemplate.type as any,
      name: stepTemplate.name,
      config: getDefaultConfig(stepTemplate.type),
      position,
      connections: []
    };

    setSelectedWorkflow({
      ...selectedWorkflow,
      steps: [...selectedWorkflow.steps, newStep],
      updatedAt: new Date().toISOString()
    });
  };

  const getDefaultConfig = (type: string) => {
    switch (type) {
      case 'trigger':
        return { url: '', method: 'POST' };
      case 'action':
        return { endpoint: '', method: 'POST', headers: {}, body: {} };
      case 'condition':
        return { field: '', operator: 'equals', value: '' };
      case 'delay':
        return { duration: 5, unit: 'minutes' };
      default:
        return {};
    }
  };

  const updateStepPosition = (stepId: string, position: { x: number; y: number }) => {
    if (!selectedWorkflow) return;

    setSelectedWorkflow({
      ...selectedWorkflow,
      steps: selectedWorkflow.steps.map(step =>
        step.id === stepId ? { ...step, position } : step
      ),
      updatedAt: new Date().toISOString()
    });
  };

  const removeStep = (stepId: string) => {
    if (!selectedWorkflow) return;

    setSelectedWorkflow({
      ...selectedWorkflow,
      steps: selectedWorkflow.steps.filter(step => step.id !== stepId),
      updatedAt: new Date().toISOString()
    });
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const stepData = JSON.parse(e.dataTransfer.getData('application/json'));
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const position = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      addStepToWorkflow(stepData, position);
    }
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const getStepColor = (type: string) => {
    const step = availableSteps.find(s => s.type === type);
    return step?.color || 'bg-gray-500';
  };

  const getStepIcon = (type: string) => {
    const step = availableSteps.find(s => s.type === type);
    return step?.icon || '⚙️';
  };

  if (isEditing && selectedWorkflow) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Editor Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <div>
            <input
              type="text"
              value={selectedWorkflow.name}
              onChange={(e) => setSelectedWorkflow({ ...selectedWorkflow, name: e.target.value })}
              className="text-xl font-semibold border-none focus:ring-0 p-0"
            />
            <input
              type="text"
              value={selectedWorkflow.description}
              onChange={(e) => setSelectedWorkflow({ ...selectedWorkflow, description: e.target.value })}
              className="text-sm text-gray-600 border-none focus:ring-0 p-0 mt-1"
              placeholder="Workflow description..."
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveWorkflow}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Save Workflow
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Available Steps */}
          <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Available Steps</h3>
            <div className="space-y-2">
              {availableSteps.map((step, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/json', JSON.stringify(step));
                  }}
                  className={`p-3 rounded-lg border-2 border-dashed border-gray-300 cursor-move hover:border-gray-400 transition-colors ${step.color} text-white`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{step.icon}</span>
                    <span className="text-sm font-medium">{step.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 relative overflow-hidden">
            <div
              ref={canvasRef}
              className="w-full h-full bg-white relative overflow-auto"
              onDrop={handleCanvasDrop}
              onDragOver={handleCanvasDragOver}
              style={{
                backgroundImage: `
                  radial-gradient(circle, #e5e7eb 1px, transparent 1px),
                  linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                  linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px, 20px 20px, 20px 20px'
              }}
            >
              {/* Render workflow steps */}
              {selectedWorkflow.steps.map((step) => (
                <div
                  key={step.id}
                  className={`absolute w-32 h-20 ${getStepColor(step.type)} rounded-lg shadow-lg cursor-move border-2 border-white`}
                  style={{
                    left: step.position.x - 64, // Center the step
                    top: step.position.y - 40,
                  }}
                  onMouseDown={(e) => {
                    const startX = e.clientX - step.position.x;
                    const startY = e.clientY - step.position.y;

                    const handleMouseMove = (e: MouseEvent) => {
                      updateStepPosition(step.id, {
                        x: e.clientX - startX,
                        y: e.clientY - startY
                      });
                    };

                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };

                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                >
                  <div className="p-2 text-white text-center h-full flex flex-col justify-between">
                    <div className="text-xs">{getStepIcon(step.type)}</div>
                    <div className="text-xs font-medium truncate">{step.name}</div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeStep(step.id);
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}

              {selectedWorkflow.steps.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎨</div>
                    <p className="text-lg">Drag steps here to build your workflow</p>
                    <p className="text-sm">Start with a trigger, then add actions and conditions</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Properties Panel */}
          <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Step Properties</h3>
            <p className="text-sm text-gray-600">
              Select a step on the canvas to configure its properties.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Integration Workflow Builder</h2>
        <button
          onClick={createNewWorkflow}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Create New Workflow
        </button>
      </div>

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
              <p className="text-sm font-medium text-gray-600">Draft Workflows</p>
              <p className="text-2xl font-bold text-yellow-600">
                {workflows.filter(w => w.status === 'draft').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Steps</p>
              <p className="text-2xl font-bold text-purple-600">
                {workflows.reduce((sum, w) => sum + w.steps.length, 0)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Workflows Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workflows.map((workflow) => (
          <div
            key={workflow.id}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{workflow.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{workflow.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    workflow.status === 'active' ? 'bg-green-100 text-green-800' :
                    workflow.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {workflow.status}
                  </span>
                  <span>{workflow.steps.length} steps</span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Updated: {new Date(workflow.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Workflow Preview */}
            <div className="mb-4 bg-gray-50 rounded-lg p-4 min-h-24 relative">
              {workflow.steps.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {workflow.steps.slice(0, 6).map((step, index) => (
                    <div
                      key={step.id}
                      className={`w-8 h-8 ${getStepColor(step.type)} rounded flex items-center justify-center text-white text-xs`}
                      title={step.name}
                    >
                      {getStepIcon(step.type)}
                    </div>
                  ))}
                  {workflow.steps.length > 6 && (
                    <div className="w-8 h-8 bg-gray-400 rounded flex items-center justify-center text-white text-xs">
                      +{workflow.steps.length - 6}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-4">
                  <p className="text-sm">No steps configured</p>
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setSelectedWorkflow(workflow);
                  setIsEditing(true);
                }}
                className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => setSelectedWorkflow(workflow)}
                className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
              >
                View
              </button>
            </div>
          </div>
        ))}

        {workflows.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">
            <div className="text-6xl mb-4">🔄</div>
            <p className="text-lg">No integration workflows</p>
            <p className="text-sm">Create visual workflows to automate your integrations and business processes.</p>
          </div>
        )}
      </div>

      {/* Workflow Detail Modal */}
      {selectedWorkflow && !isEditing && (
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
              <p className="text-gray-700">{selectedWorkflow.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">Status</h4>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    selectedWorkflow.status === 'active' ? 'bg-green-100 text-green-800' :
                    selectedWorkflow.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedWorkflow.status}
                  </span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">Steps</h4>
                  <p className="text-lg font-bold text-gray-900">{selectedWorkflow.steps.length}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">Last Updated</h4>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedWorkflow.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Workflow Steps</h4>
                {selectedWorkflow.steps.length > 0 ? (
                  <div className="space-y-3">
                    {selectedWorkflow.steps.map((step, index) => (
                      <div key={step.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className={`w-10 h-10 ${getStepColor(step.type)} rounded-lg flex items-center justify-center text-white`}>
                          {getStepIcon(step.type)}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{step.name}</h5>
                          <p className="text-sm text-gray-600 capitalize">{step.type}</p>
                        </div>
                        <div className="text-sm text-gray-500">
                          Step {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No steps configured in this workflow.</p>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setSelectedWorkflow(selectedWorkflow);
                    setIsEditing(true);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Edit Workflow
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}