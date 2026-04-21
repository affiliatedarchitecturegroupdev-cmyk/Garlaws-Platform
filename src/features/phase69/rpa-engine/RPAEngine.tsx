'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Square, Pause, RotateCcw, Settings, Clock, CheckCircle, AlertTriangle, Activity, Zap, Bot, Workflow, Calendar } from 'lucide-react';

export interface RPAWorkflow {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'recording' | 'playing' | 'paused' | 'completed' | 'error';
  steps: RPAStep[];
  createdAt: Date;
  lastExecuted?: Date;
  executionCount: number;
  averageExecutionTime?: number;
  successRate: number;
  tags: string[];
  schedule?: WorkflowSchedule;
}

export interface RPAStep {
  id: string;
  type: 'click' | 'type' | 'wait' | 'navigate' | 'extract' | 'upload' | 'condition' | 'loop' | 'api' | 'email' | 'file';
  description: string;
  parameters: Record<string, any>;
  timeout?: number;
  screenshot?: string;
  timestamp: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
  error?: string;
  executionTime?: number;
}

export interface WorkflowSchedule {
  id: string;
  enabled: boolean;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'cron' | 'real-time';
  nextRun?: Date;
  lastRun?: Date;
  timezone: string;
  cronExpression?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface RPAExecution {
  id: string;
  workflowId: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  steps: RPAExecutionStep[];
  duration?: number;
  error?: string;
  screenshots: string[];
  performance: {
    averageStepTime: number;
    totalSteps: number;
    successfulSteps: number;
    failedSteps: number;
  };
}

export interface RPAExecutionStep {
  stepId: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed' | 'skipped';
  output?: any;
  error?: string;
  duration?: number;
}

const SAMPLE_WORKFLOWS: RPAWorkflow[] = [
  {
    id: 'invoice-processing',
    name: 'Automated Invoice Processing',
    description: 'Extract data from invoices, validate information, and update financial records',
    status: 'idle',
    steps: [
      {
        id: 'step-1',
        type: 'navigate',
        description: 'Navigate to invoice upload page',
        parameters: { url: '/financial/invoices/upload' },
        timeout: 10000,
        timestamp: new Date('2024-04-20'),
        status: 'pending'
      },
      {
        id: 'step-2',
        type: 'upload',
        description: 'Upload invoice PDF file',
        parameters: { selector: '#invoice-upload', filePath: 'invoice.pdf' },
        timeout: 30000,
        timestamp: new Date('2024-04-20'),
        status: 'pending'
      },
      {
        id: 'step-3',
        type: 'extract',
        description: 'Extract invoice data using OCR',
        parameters: { fields: ['invoiceNumber', 'amount', 'date', 'vendor'] },
        timeout: 45000,
        timestamp: new Date('2024-04-20'),
        status: 'pending'
      },
      {
        id: 'step-4',
        type: 'api',
        description: 'Validate extracted data via API',
        parameters: { endpoint: '/api/financial/validate-invoice', method: 'POST' },
        timeout: 15000,
        timestamp: new Date('2024-04-20'),
        status: 'pending'
      },
      {
        id: 'step-5',
        type: 'api',
        description: 'Update financial records',
        parameters: { endpoint: '/api/financial/invoices', method: 'POST' },
        timeout: 10000,
        timestamp: new Date('2024-04-20'),
        status: 'pending'
      }
    ],
    createdAt: new Date('2024-04-15'),
    lastExecuted: new Date('2024-04-20'),
    executionCount: 145,
    averageExecutionTime: 125000,
    successRate: 96.5,
    tags: ['financial', 'automation', 'invoice'],
    schedule: {
      id: 'schedule-1',
      enabled: true,
      frequency: 'daily',
      nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000),
      lastRun: new Date('2024-04-20'),
      timezone: 'UTC'
    }
  },
  {
    id: 'user-onboarding',
    name: 'New User Onboarding Automation',
    description: 'Automate the complete user onboarding process from registration to activation',
    status: 'idle',
    steps: [
      {
        id: 'step-1',
        type: 'api',
        description: 'Check user registration status',
        parameters: { endpoint: '/api/users/{userId}/status', method: 'GET' },
        timeout: 5000,
        timestamp: new Date('2024-04-19'),
        status: 'pending'
      },
      {
        id: 'step-2',
        type: 'email',
        description: 'Send welcome email',
        parameters: { template: 'welcome-email', recipient: '{userEmail}' },
        timeout: 10000,
        timestamp: new Date('2024-04-19'),
        status: 'pending'
      },
      {
        id: 'step-3',
        type: 'api',
        description: 'Create user profile',
        parameters: { endpoint: '/api/users/{userId}/profile', method: 'POST' },
        timeout: 8000,
        timestamp: new Date('2024-04-19'),
        status: 'pending'
      },
      {
        id: 'step-4',
        type: 'api',
        description: 'Set up default permissions',
        parameters: { endpoint: '/api/users/{userId}/permissions', method: 'POST' },
        timeout: 5000,
        timestamp: new Date('2024-04-19'),
        status: 'pending'
      },
      {
        id: 'step-5',
        type: 'api',
        description: 'Send activation notification',
        parameters: { endpoint: '/api/notifications', method: 'POST' },
        timeout: 3000,
        timestamp: new Date('2024-04-19'),
        status: 'pending'
      }
    ],
    createdAt: new Date('2024-04-10'),
    lastExecuted: new Date('2024-04-20'),
    executionCount: 89,
    averageExecutionTime: 45000,
    successRate: 98.9,
    tags: ['user-management', 'automation', 'onboarding'],
    schedule: {
      id: 'schedule-2',
      enabled: true,
      frequency: 'real-time',
      timezone: 'UTC'
    }
  }
];

export const RPAEngine: React.FC = () => {
  const [workflows, setWorkflows] = useState<RPAWorkflow[]>(SAMPLE_WORKFLOWS);
  const [executions, setExecutions] = useState<RPAExecution[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSteps, setRecordingSteps] = useState<RPAStep[]>([]);
  const [selectedTab, setSelectedTab] = useState<'workflows' | 'executions' | 'schedules'>('workflows');

  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Simulate workflow execution
  const executeWorkflow = useCallback(async (workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (!workflow) return;

    setWorkflows(prev => prev.map(w =>
      w.id === workflowId ? { ...w, status: 'playing' } : w
    ));

    const execution: RPAExecution = {
      id: `exec-${Date.now()}`,
      workflowId,
      startTime: new Date(),
      status: 'running',
      steps: [],
      screenshots: [],
      performance: {
        averageStepTime: 0,
        totalSteps: workflow.steps.length,
        successfulSteps: 0,
        failedSteps: 0
      }
    };

    setExecutions(prev => [execution, ...prev]);

    // Simulate step-by-step execution
    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      const stepStartTime = Date.now();

      // Update execution with running step
      setExecutions(prev => prev.map(exec =>
        exec.id === execution.id
          ? {
              ...exec,
              steps: [
                ...exec.steps,
                {
                  stepId: step.id,
                  startTime: new Date(stepStartTime),
                  status: 'running'
                }
              ]
            }
          : exec
      ));

      // Simulate step execution time (random between 1-5 seconds)
      await new Promise(resolve => setTimeout(resolve, Math.random() * 4000 + 1000));

      const stepEndTime = Date.now();
      const stepDuration = stepEndTime - stepStartTime;
      const stepSuccess = Math.random() > 0.1; // 90% success rate

      // Update execution with completed step
      setExecutions(prev => prev.map(exec =>
        exec.id === execution.id
          ? {
              ...exec,
              steps: exec.steps.map(s =>
                s.stepId === step.id
                  ? {
                      ...s,
                      endTime: new Date(stepEndTime),
                      status: stepSuccess ? 'completed' : 'failed',
                      duration: stepDuration,
                      error: stepSuccess ? undefined : 'Simulated error occurred'
                    }
                  : s
              ),
              performance: {
                ...exec.performance,
                successfulSteps: exec.performance.successfulSteps + (stepSuccess ? 1 : 0),
                failedSteps: exec.performance.failedSteps + (stepSuccess ? 0 : 1)
              }
            }
          : exec
      ));

      if (!stepSuccess) {
        // Stop execution on failure
        setExecutions(prev => prev.map(exec =>
          exec.id === execution.id
            ? {
                ...exec,
                status: 'failed',
                endTime: new Date(),
                duration: Date.now() - exec.startTime.getTime(),
                error: 'Workflow failed at step ' + step.description
              }
            : exec
        ));
        break;
      }
    }

    // Complete execution
    setExecutions(prev => prev.map(exec =>
      exec.id === execution.id && exec.status === 'running'
        ? {
            ...exec,
            status: 'completed',
            endTime: new Date(),
            duration: Date.now() - exec.startTime.getTime(),
            performance: {
              ...exec.performance,
              averageStepTime: exec.performance.totalSteps > 0
                ? (Date.now() - exec.startTime.getTime()) / exec.performance.totalSteps
                : 0
            }
          }
        : exec
    ));

    // Update workflow statistics
    setWorkflows(prev => prev.map(w =>
      w.id === workflowId
        ? {
            ...w,
            status: 'completed',
            lastExecuted: new Date(),
            executionCount: w.executionCount + 1,
            averageExecutionTime: w.averageExecutionTime
              ? (w.averageExecutionTime + (Date.now() - execution.startTime.getTime())) / 2
              : Date.now() - execution.startTime.getTime()
          }
        : w
    ));
  }, [workflows]);

  // Start workflow recording
  const startRecording = useCallback(() => {
    setIsRecording(true);
    setRecordingSteps([]);

    // Simulate recording by adding steps over time
    let stepCount = 0;
    const addStep = () => {
      const stepTypes = ['click', 'type', 'wait', 'navigate', 'extract'];
      const descriptions = [
        'Clicked on login button',
        'Typed username in input field',
        'Waited for page to load',
        'Navigated to dashboard',
        'Extracted user data'
      ];

      const newStep: RPAStep = {
        id: `recorded-${Date.now()}-${stepCount}`,
        type: stepTypes[Math.floor(Math.random() * stepTypes.length)] as any,
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        parameters: { selector: '#element-' + stepCount },
        timeout: 10000,
        timestamp: new Date(),
        status: 'pending'
      };

      setRecordingSteps(prev => [...prev, newStep]);
      stepCount++;

      if (stepCount < 5) {
        recordingTimeoutRef.current = setTimeout(addStep, Math.random() * 3000 + 1000);
      } else {
        setTimeout(() => setIsRecording(false), 1000);
      }
    };

    addStep();
  }, []);

  // Stop recording and create workflow
  const stopRecording = useCallback(() => {
    setIsRecording(false);
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
    }

    if (recordingSteps.length > 0) {
      const newWorkflow: RPAWorkflow = {
        id: `workflow-${Date.now()}`,
        name: 'Recorded Workflow',
        description: 'Automatically recorded workflow',
        status: 'idle',
        steps: recordingSteps,
        createdAt: new Date(),
        executionCount: 0,
        successRate: 0,
        tags: ['recorded']
      };

      setWorkflows(prev => [newWorkflow, ...prev]);
      setRecordingSteps([]);
    }
  }, [recordingSteps]);

  // Pause/resume workflow execution
  const toggleWorkflowExecution = useCallback((workflowId: string) => {
    setWorkflows(prev => prev.map(w =>
      w.id === workflowId
        ? {
            ...w,
            status: w.status === 'playing' ? 'paused' : 'playing'
          }
        : w
    ));
  }, []);

  // Get workflow statistics
  const getWorkflowStats = () => {
    const totalWorkflows = workflows.length;
    const activeWorkflows = workflows.filter(w => w.status === 'playing').length;
    const completedExecutions = executions.filter(e => e.status === 'completed').length;
    const failedExecutions = executions.filter(e => e.status === 'failed').length;
    const avgExecutionTime = executions
      .filter(e => e.duration)
      .reduce((sum, e) => sum + e.duration!, 0) / executions.filter(e => e.duration).length || 0;

    return {
      totalWorkflows,
      activeWorkflows,
      completedExecutions,
      failedExecutions,
      avgExecutionTime,
      successRate: completedExecutions / (completedExecutions + failedExecutions) * 100 || 100
    };
  };

  const stats = getWorkflowStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bot className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">RPA Engine</h1>
              <p className="text-gray-600">Robotic Process Automation with workflow recording and scheduling</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={startRecording}
              disabled={isRecording}
              className={`px-4 py-2 rounded-md flex items-center space-x-2 ${
                isRecording
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              <Activity className={`w-4 h-4 ${isRecording ? 'animate-pulse' : ''}`} />
              <span>{isRecording ? 'Recording...' : 'Start Recording'}</span>
            </button>
            {isRecording && (
              <button
                onClick={stopRecording}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Stop Recording
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Recording Status */}
      {isRecording && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Activity className="w-5 h-5 text-blue-600 animate-pulse" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">Recording in Progress</h4>
              <p className="text-sm text-blue-700">
                Recording {recordingSteps.length} steps... Click "Stop Recording" when finished.
              </p>
            </div>
          </div>
          {recordingSteps.length > 0 && (
            <div className="mt-3 space-y-2">
              {recordingSteps.map((step, index) => (
                <div key={step.id} className="text-xs text-blue-800 bg-blue-100 px-2 py-1 rounded">
                  Step {index + 1}: {step.description}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Workflows</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalWorkflows}</p>
            </div>
            <Workflow className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Workflows</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeWorkflows}</p>
            </div>
            <Activity className="w-8 h-8 text-green-600" />
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
              onClick={() => setSelectedTab('executions')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedTab === 'executions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Executions
            </button>
            <button
              onClick={() => setSelectedTab('schedules')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedTab === 'schedules'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Schedules
            </button>
          </nav>
        </div>

        <div className="p-6">
          {selectedTab === 'workflows' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">RPA Workflows</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Create Workflow
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {workflows.map((workflow) => (
                  <div key={workflow.id} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          workflow.status === 'playing' ? 'bg-green-500 animate-pulse' :
                          workflow.status === 'paused' ? 'bg-yellow-500' :
                          workflow.status === 'completed' ? 'bg-blue-500' :
                          workflow.status === 'error' ? 'bg-red-500' : 'bg-gray-500'
                        }`}></div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{workflow.name}</h4>
                          <p className="text-sm text-gray-600">{workflow.description}</p>
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        workflow.status === 'playing' ? 'bg-green-100 text-green-800' :
                        workflow.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                        workflow.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        workflow.status === 'error' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {workflow.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-gray-600">Executions:</span>
                        <span className="ml-2 font-medium">{workflow.executionCount}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Success Rate:</span>
                        <span className="ml-2 font-medium">{workflow.successRate.toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Avg Time:</span>
                        <span className="ml-2 font-medium">
                          {workflow.averageExecutionTime ? (workflow.averageExecutionTime / 1000).toFixed(1) + 's' : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Steps:</span>
                        <span className="ml-2 font-medium">{workflow.steps.length}</span>
                      </div>
                    </div>

                    {workflow.tags.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {workflow.tags.map((tag, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => executeWorkflow(workflow.id)}
                          disabled={workflow.status === 'playing'}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
                        >
                          <Play className="w-4 h-4 inline mr-1" />
                          Run
                        </button>
                        {workflow.status === 'playing' && (
                          <button
                            onClick={() => toggleWorkflowExecution(workflow.id)}
                            className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700"
                          >
                            <Pause className="w-4 h-4 inline mr-1" />
                            Pause
                          </button>
                        )}
                        <button className="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700">
                          <Settings className="w-4 h-4 inline mr-1" />
                          Edit
                        </button>
                      </div>
                      <span className="text-xs text-gray-500">
                        Created {workflow.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'executions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Workflow Executions</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Export Report
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Execution
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Workflow
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Start Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Success Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {executions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                          No executions yet. Run a workflow to see execution history.
                        </td>
                      </tr>
                    ) : (
                      executions.map((execution) => {
                        const workflow = workflows.find(w => w.id === execution.workflowId);
                        const successRate = execution.performance.totalSteps > 0
                          ? (execution.performance.successfulSteps / execution.performance.totalSteps) * 100
                          : 0;

                        return (
                          <tr key={execution.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {execution.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {workflow?.name || 'Unknown'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                execution.status === 'completed' ? 'bg-green-100 text-green-800' :
                                execution.status === 'running' ? 'bg-blue-100 text-blue-800' :
                                execution.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {execution.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {execution.startTime.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {execution.duration ? `${(execution.duration / 1000).toFixed(1)}s` : 'Running...'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {successRate.toFixed(1)}%
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

          {selectedTab === 'schedules' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Workflow Schedules</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Add Schedule
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {workflows.filter(w => w.schedule).map((workflow) => (
                  <div key={workflow.id} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{workflow.name}</h4>
                        <p className="text-sm text-gray-600">Scheduled workflow</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          workflow.schedule?.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {workflow.schedule?.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                    </div>

                    {workflow.schedule && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Frequency:</span>
                            <span className="ml-2 font-medium capitalize">{workflow.schedule.frequency}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Timezone:</span>
                            <span className="ml-2 font-medium">{workflow.schedule.timezone}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Next Run:</span>
                            <span className="ml-2 font-medium">
                              {workflow.schedule.nextRun?.toLocaleString() || 'Not scheduled'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Last Run:</span>
                            <span className="ml-2 font-medium">
                              {workflow.schedule.lastRun?.toLocaleString() || 'Never'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                          <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
                            Edit Schedule
                          </button>
                          <button className={`px-3 py-1 text-sm rounded-md ${
                            workflow.schedule.enabled
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}>
                            {workflow.schedule.enabled ? 'Disable' : 'Enable'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RPAEngine;