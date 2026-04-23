'use client'

import { useState, useEffect, useMemo } from 'react'
import { Zap, Play, Pause, Square, Settings, BarChart3, Users, Clock, CheckCircle, AlertTriangle, Activity, Bot, Workflow } from 'lucide-react'

// Types for Enterprise Automation Engine
interface Workflow {
  id: string
  name: string
  description: string
  status: 'active' | 'paused' | 'stopped' | 'error'
  priority: 'low' | 'medium' | 'high' | 'critical'
  trigger: {
    type: 'schedule' | 'event' | 'api' | 'manual'
    schedule?: string
    event?: string
    endpoint?: string
  }
  steps: WorkflowStep[]
  metrics: {
    executions: number
    successRate: number
    avgExecutionTime: number
    lastExecuted?: Date
    errors: number
  }
  createdAt: Date
  updatedAt: Date
}

interface WorkflowStep {
  id: string
  name: string
  type: 'action' | 'condition' | 'loop' | 'parallel' | 'decision'
  config: any
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  executionTime?: number
  output?: any
  error?: string
}

interface AutomationRule {
  id: string
  name: string
  description: string
  conditions: RuleCondition[]
  actions: RuleAction[]
  active: boolean
  priority: number
  metrics: {
    triggered: number
    successful: number
    failed: number
  }
}

interface RuleCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'regex'
  value: any
  logic?: 'AND' | 'OR'
}

interface RuleAction {
  type: 'send_notification' | 'update_record' | 'trigger_workflow' | 'execute_script' | 'send_email'
  config: any
}

interface SystemMetrics {
  activeWorkflows: number
  totalExecutions: number
  successRate: number
  avgExecutionTime: number
  systemLoad: number
  queueLength: number
}

export default function EnterpriseAutomationEngine() {
  // Sample workflows
  const [workflows] = useState<Workflow[]>([
    {
      id: 'wf-001',
      name: 'Customer Onboarding Process',
      description: 'Automated customer onboarding with verification and setup',
      status: 'active',
      priority: 'high',
      trigger: {
        type: 'event',
        event: 'customer_registered'
      },
      steps: [
        { id: 'step-1', name: 'Email Verification', type: 'action', config: { template: 'verification' }, status: 'completed' },
        { id: 'step-2', name: 'Profile Setup', type: 'action', config: { autoPopulate: true }, status: 'running' },
        { id: 'step-3', name: 'Welcome Email', type: 'action', config: { template: 'welcome' }, status: 'pending' }
      ],
      metrics: {
        executions: 1247,
        successRate: 96.5,
        avgExecutionTime: 45,
        lastExecuted: new Date(Date.now() - 5 * 60 * 1000),
        errors: 12
      },
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: 'wf-002',
      name: 'Invoice Processing Pipeline',
      description: 'Automated invoice processing and approval workflow',
      status: 'active',
      priority: 'critical',
      trigger: {
        type: 'schedule',
        schedule: '0 */4 * * *' // Every 4 hours
      },
      steps: [
        { id: 'step-1', name: 'Extract Invoice Data', type: 'action', config: { ocr: true }, status: 'completed' },
        { id: 'step-2', name: 'Validate Amounts', type: 'condition', config: { threshold: 10000 }, status: 'completed' },
        { id: 'step-3', name: 'Approval Routing', type: 'decision', config: { approvers: ['manager', 'finance'] }, status: 'running' }
      ],
      metrics: {
        executions: 892,
        successRate: 98.2,
        avgExecutionTime: 120,
        lastExecuted: new Date(Date.now() - 15 * 60 * 1000),
        errors: 5
      },
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 30 * 60 * 1000)
    },
    {
      id: 'wf-003',
      name: 'System Health Monitoring',
      description: 'Continuous system health checks and automated remediation',
      status: 'active',
      priority: 'high',
      trigger: {
        type: 'schedule',
        schedule: '*/5 * * * *' // Every 5 minutes
      },
      steps: [
        { id: 'step-1', name: 'Check System Metrics', type: 'action', config: { metrics: ['cpu', 'memory', 'disk'] }, status: 'completed' },
        { id: 'step-2', name: 'Threshold Check', type: 'condition', config: { cpu: 80, memory: 85, disk: 90 }, status: 'completed' },
        { id: 'step-3', name: 'Send Alert', type: 'action', config: { channels: ['email', 'slack'] }, status: 'pending' }
      ],
      metrics: {
        executions: 3456,
        successRate: 99.1,
        avgExecutionTime: 8,
        lastExecuted: new Date(Date.now() - 30 * 1000),
        errors: 2
      },
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 5 * 60 * 1000)
    }
  ])

  // Sample automation rules
  const [automationRules] = useState<AutomationRule[]>([
    {
      id: 'rule-001',
      name: 'High-Value Order Alert',
      description: 'Send notification for orders over $10,000',
      conditions: [
        { field: 'order.total', operator: 'greater_than', value: 10000 }
      ],
      actions: [
        { type: 'send_notification', config: { channel: 'slack', priority: 'high' } },
        { type: 'send_email', config: { template: 'high_value_order', recipients: ['sales@company.com'] } }
      ],
      active: true,
      priority: 1,
      metrics: { triggered: 45, successful: 44, failed: 1 }
    },
    {
      id: 'rule-002',
      name: 'Failed Login Attempts',
      description: 'Block IP after 5 failed login attempts',
      conditions: [
        { field: 'login.failed_attempts', operator: 'greater_than', value: 5 },
        { field: 'user.status', operator: 'equals', value: 'active' }
      ],
      actions: [
        { type: 'update_record', config: { table: 'users', field: 'status', value: 'blocked' } },
        { type: 'send_notification', config: { channel: 'security', priority: 'critical' } }
      ],
      active: true,
      priority: 2,
      metrics: { triggered: 12, successful: 12, failed: 0 }
    }
  ])

  const [systemMetrics] = useState<SystemMetrics>({
    activeWorkflows: 15,
    totalExecutions: 15632,
    successRate: 97.3,
    avgExecutionTime: 42,
    systemLoad: 68,
    queueLength: 8
  })

  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Filtered workflows
  const filteredWorkflows = useMemo(() => {
    if (filterStatus === 'all') return workflows
    return workflows.filter(workflow => workflow.status === filterStatus)
  }, [workflows, filterStatus])

  const getStatusColor = (status: Workflow['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'stopped': return 'bg-gray-100 text-gray-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: Workflow['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStepTypeIcon = (type: WorkflowStep['type']) => {
    switch (type) {
      case 'action': return '⚡'
      case 'condition': return '🔍'
      case 'decision': return '🎯'
      case 'loop': return '🔄'
      case 'parallel': return '⚖️'
      default: return '📝'
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3">
          <Bot className="w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold">Enterprise Automation Engine</h1>
            <p className="text-lg opacity-90">
              Intelligent workflow automation, process orchestration, and automated decision systems
            </p>
          </div>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-6 h-6 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Active Workflows</p>
              <p className="text-2xl font-bold text-gray-900">{systemMetrics.activeWorkflows}</p>
            </div>
          </div>
          <div className="text-sm text-blue-600 font-medium">Running smoothly</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{systemMetrics.successRate}%</p>
            </div>
          </div>
          <div className="text-sm text-green-600 font-medium">Excellent performance</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Avg Execution Time</p>
              <p className="text-2xl font-bold text-gray-900">{systemMetrics.avgExecutionTime}s</p>
            </div>
          </div>
          <div className="text-sm text-orange-600 font-medium">Within target</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-6 h-6 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Queue Length</p>
              <p className="text-2xl font-bold text-gray-900">{systemMetrics.queueLength}</p>
            </div>
          </div>
          <div className="text-sm text-purple-600 font-medium">Processing efficiently</div>
        </div>
      </div>

      {/* Workflow Management */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Workflow Management</h2>
          <div className="flex items-center gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="stopped">Stopped</option>
              <option value="error">Error</option>
            </select>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Zap className="w-4 h-4" />
              New Workflow
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredWorkflows.map(workflow => (
            <div key={workflow.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Workflow className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-gray-900">{workflow.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workflow.status)}`}>
                      {workflow.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(workflow.priority)}`}>
                      {workflow.priority}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Play className="w-4 h-4 text-green-600" />
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Pause className="w-4 h-4 text-yellow-600" />
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Square className="w-4 h-4 text-red-600" />
                  </button>
                  <button
                    onClick={() => setSelectedWorkflow(workflow)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-600">Trigger</div>
                  <div className="font-medium capitalize">{workflow.trigger.type}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Executions</div>
                  <div className="font-medium">{workflow.metrics.executions}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                  <div className="font-medium text-green-600">{workflow.metrics.successRate}%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Avg Time</div>
                  <div className="font-medium">{workflow.metrics.avgExecutionTime}s</div>
                </div>
              </div>

              {/* Workflow Steps */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-700">Steps:</span>
                  <span className="text-sm text-gray-600">{workflow.steps.length} steps</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto">
                  {workflow.steps.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-2 min-w-max">
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        step.status === 'completed' ? 'bg-green-100 text-green-800' :
                        step.status === 'running' ? 'bg-blue-100 text-blue-800' :
                        step.status === 'failed' ? 'bg-red-100 text-red-800' :
                        step.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        <span>{getStepTypeIcon(step.type)}</span>
                        <span>{step.name}</span>
                      </div>
                      {index < workflow.steps.length - 1 && (
                        <div className="w-4 h-px bg-gray-300"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Automation Rules */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Automation Rules</h2>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Settings className="w-4 h-4" />
            New Rule
          </button>
        </div>

        <div className="space-y-4">
          {automationRules.map(rule => (
            <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${rule.active ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                  <div>
                    <h4 className="font-medium text-gray-900">{rule.name}</h4>
                    <p className="text-sm text-gray-600">{rule.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Priority: {rule.priority}</span>
                  <button className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    rule.active
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}>
                    {rule.active ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Conditions</div>
                  <div className="text-sm font-medium">{rule.conditions.length} conditions</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Actions</div>
                  <div className="text-sm font-medium">{rule.actions.length} actions</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Performance</div>
                  <div className="text-sm">
                    <span className="font-medium text-green-600">{rule.metrics.successful}</span>
                    <span className="text-gray-500">/{rule.metrics.triggered} triggered</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{rule.metrics.successful} successful</span>
                </div>
                <div className="flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span>{rule.metrics.failed} failed</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Workflow Details Modal */}
      {selectedWorkflow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedWorkflow.name}</h3>
                  <p className="text-sm text-gray-600">{selectedWorkflow.description}</p>
                </div>
                <button
                  onClick={() => setSelectedWorkflow(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedWorkflow.status)}`}>
                    {selectedWorkflow.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedWorkflow.priority)}`}>
                    {selectedWorkflow.priority}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Trigger Type</label>
                  <span className="text-sm font-medium capitalize">{selectedWorkflow.trigger.type}</span>
                </div>
              </div>

              {/* Workflow Steps Detail */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Workflow Steps</h4>
                <div className="space-y-3">
                  {selectedWorkflow.steps.map((step, index) => (
                    <div key={step.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{getStepTypeIcon(step.type)}</span>
                          <div>
                            <div className="font-medium text-gray-900">{step.name}</div>
                            <div className="text-sm text-gray-600 capitalize">{step.type}</div>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          step.status === 'completed' ? 'bg-green-100 text-green-800' :
                          step.status === 'running' ? 'bg-blue-100 text-blue-800' :
                          step.status === 'failed' ? 'bg-red-100 text-red-800' :
                          step.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {step.status}
                        </span>
                      </div>
                      {step.executionTime && (
                        <div className="text-sm text-gray-600">
                          Execution time: {step.executionTime}s
                        </div>
                      )}
                      {step.error && (
                        <div className="text-sm text-red-600 mt-1">
                          Error: {step.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Performance Metrics</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{selectedWorkflow.metrics.executions}</div>
                    <div className="text-sm text-gray-600">Total Executions</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{selectedWorkflow.metrics.successRate}%</div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{selectedWorkflow.metrics.avgExecutionTime}s</div>
                    <div className="text-sm text-gray-600">Avg Execution Time</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{selectedWorkflow.metrics.errors}</div>
                    <div className="text-sm text-gray-600">Errors</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}