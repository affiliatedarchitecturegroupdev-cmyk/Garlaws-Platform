'use client'

import { useState, useEffect, useMemo } from 'react'
import { Bot, Brain, Zap, GitBranch, Settings, Play, Pause, Square, RotateCcw, TrendingUp, Activity, Clock, Target } from 'lucide-react'

// Types for Intelligent Automation
interface AutomationWorkflow {
  id: string
  name: string
  description: string
  category: 'business_process' | 'data_processing' | 'customer_service' | 'operations' | 'compliance'
  trigger: AutomationTrigger
  steps: AutomationStep[]
  aiDecisions: AIDecision[]
  status: 'active' | 'inactive' | 'error' | 'maintenance'
  metrics: WorkflowMetrics
  createdAt: Date
  lastExecuted: Date
  version: string
}

interface AutomationTrigger {
  type: 'schedule' | 'event' | 'api' | 'condition' | 'manual'
  config: {
    schedule?: string
    event?: string
    endpoint?: string
    conditions?: TriggerCondition[]
  }
}

interface TriggerCondition {
  field: string
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'regex'
  value: any
  logic?: 'AND' | 'OR'
}

interface AutomationStep {
  id: string
  name: string
  type: 'action' | 'decision' | 'loop' | 'parallel' | 'ai_analysis' | 'integration'
  config: StepConfig
  aiGuidance?: AIGuidance
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  duration?: number
  output?: any
  error?: string
}

interface StepConfig {
  action?: string
  parameters?: Record<string, any>
  timeout?: number
  retry?: {
    enabled: boolean
    maxAttempts: number
    backoff: number
  }
  conditions?: StepCondition[]
}

interface StepCondition {
  type: 'success' | 'failure' | 'timeout' | 'custom'
  nextStep?: string
  actions?: string[]
}

interface AIGuidance {
  enabled: boolean
  model: string
  prompt: string
  context: Record<string, any>
  decisionRules: AIDecisionRule[]
}

interface AIDecisionRule {
  condition: string
  action: string
  confidence: number
  explanation: string
}

interface AIDecision {
  id: string
  stepId: string
  context: Record<string, any>
  options: DecisionOption[]
  selectedOption: string
  confidence: number
  reasoning: string
  timestamp: Date
  outcome: 'success' | 'failure' | 'pending'
}

interface DecisionOption {
  id: string
  label: string
  score: number
  pros: string[]
  cons: string[]
  estimatedImpact: {
    time: number
    cost: number
    quality: number
  }
}

interface WorkflowMetrics {
  executions: number
  successRate: number
  averageDuration: number
  aiDecisions: number
  humanInterventions: number
  costSavings: number
  efficiency: number
  errors: number
}

interface AutomationRule {
  id: string
  name: string
  description: string
  conditions: RuleCondition[]
  actions: RuleAction[]
  aiOptimization: {
    enabled: boolean
    learning: boolean
    adaptation: boolean
  }
  priority: 'low' | 'medium' | 'high' | 'critical'
  active: boolean
  performance: RulePerformance
}

interface RuleCondition {
  field: string
  operator: string
  value: any
  weight: number
}

interface RuleAction {
  type: 'execute_workflow' | 'send_notification' | 'update_data' | 'create_task' | 'escalate'
  config: Record<string, any>
  aiGuidance?: string
}

interface RulePerformance {
  triggered: number
  successful: number
  accuracy: number
  avgResponseTime: number
  falsePositives: number
  falseNegatives: number
}

interface LearningModel {
  id: string
  name: string
  type: 'reinforcement' | 'supervised' | 'unsupervised' | 'semi_supervised'
  target: 'decision_optimization' | 'process_improvement' | 'anomaly_detection' | 'prediction'
  accuracy: number
  improvement: number
  lastTrained: Date
  status: 'learning' | 'ready' | 'inactive'
  metrics: {
    trainingSamples: number
    validationAccuracy: number
    convergenceRate: number
  }
}

export default function IntelligentAutomation() {
  // Sample automation workflows
  const [workflows] = useState<AutomationWorkflow[]>([
    {
      id: 'workflow-001',
      name: 'Intelligent Customer Support',
      description: 'AI-powered customer support workflow with automated routing and resolution',
      category: 'customer_service',
      trigger: {
        type: 'event',
        config: { event: 'customer_query_received' }
      },
      steps: [
        {
          id: 'step-001',
          name: 'Query Analysis',
          type: 'ai_analysis',
          config: { action: 'analyze_sentiment', timeout: 30 },
          aiGuidance: {
            enabled: true,
            model: 'sentiment-analyzer',
            prompt: 'Analyze customer sentiment and urgency',
            context: {},
            decisionRules: [
              {
                condition: 'sentiment.negative && urgency.high',
                action: 'escalate_to_human',
                confidence: 0.95,
                explanation: 'High urgency negative sentiment requires human intervention'
              }
            ]
          },
          status: 'completed'
        },
        {
          id: 'step-002',
          name: 'Automated Response',
          type: 'action',
          config: { action: 'send_auto_response', parameters: { template: 'acknowledgment' } },
          status: 'completed'
        },
        {
          id: 'step-003',
          name: 'Solution Matching',
          type: 'decision',
          config: { conditions: [{ type: 'success', nextStep: 'step-004' }] },
          status: 'running'
        }
      ],
      aiDecisions: [
        {
          id: 'decision-001',
          stepId: 'step-001',
          context: { query: 'My order is delayed', sentiment: 'negative', urgency: 'high' },
          options: [
            {
              id: 'option-1',
              label: 'Escalate to human agent',
              score: 0.85,
              pros: ['Personal touch', 'Complex issue handling'],
              cons: ['Slower response'],
              estimatedImpact: { time: 300, cost: 5, quality: 0.9 }
            },
            {
              id: 'option-2',
              label: 'Provide automated solution',
              score: 0.65,
              pros: ['Faster resolution', 'Cost effective'],
              cons: ['May not fully resolve'],
              estimatedImpact: { time: 60, cost: 0.5, quality: 0.7 }
            }
          ],
          selectedOption: 'option-1',
          confidence: 0.85,
          reasoning: 'High urgency negative sentiment indicates complex issue requiring human expertise',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          outcome: 'success'
        }
      ],
      status: 'active',
      metrics: {
        executions: 1250,
        successRate: 0.92,
        averageDuration: 180,
        aiDecisions: 890,
        humanInterventions: 95,
        costSavings: 12500,
        efficiency: 0.78,
        errors: 12
      },
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      lastExecuted: new Date(Date.now() - 15 * 60 * 1000),
      version: '2.1.3'
    },
    {
      id: 'workflow-002',
      name: 'Intelligent Inventory Management',
      description: 'AI-driven inventory optimization with predictive ordering',
      category: 'operations',
      trigger: {
        type: 'schedule',
        config: { schedule: '0 */6 * * *' } // Every 6 hours
      },
      steps: [
        {
          id: 'step-004',
          name: 'Demand Forecasting',
          type: 'ai_analysis',
          config: { action: 'forecast_demand', timeout: 120 },
          aiGuidance: {
            enabled: true,
            model: 'demand-forecaster',
            prompt: 'Predict demand for next 30 days',
            context: { historicalData: true },
            decisionRules: []
          },
          status: 'completed'
        },
        {
          id: 'step-005',
          name: 'Inventory Analysis',
          type: 'ai_analysis',
          config: { action: 'analyze_inventory_levels', timeout: 60 },
          status: 'completed'
        },
        {
          id: 'step-006',
          name: 'Automated Ordering',
          type: 'decision',
          config: { conditions: [{ type: 'success', actions: ['place_orders'] }] },
          status: 'pending'
        }
      ],
      aiDecisions: [],
      status: 'active',
      metrics: {
        executions: 480,
        successRate: 0.96,
        averageDuration: 420,
        aiDecisions: 480,
        humanInterventions: 8,
        costSavings: 25000,
        efficiency: 0.85,
        errors: 3
      },
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      lastExecuted: new Date(Date.now() - 6 * 60 * 60 * 1000),
      version: '1.8.2'
    }
  ])

  // Sample automation rules
  const [automationRules] = useState<AutomationRule[]>([
    {
      id: 'rule-001',
      name: 'Smart Escalation Rule',
      description: 'Automatically escalate high-priority issues based on AI analysis',
      conditions: [
        { field: 'priority', operator: 'equals', value: 'high', weight: 0.4 },
        { field: 'sentiment', operator: 'equals', value: 'negative', weight: 0.3 },
        { field: 'resolution_time', operator: 'greater_than', value: 3600, weight: 0.3 }
      ],
      actions: [
        {
          type: 'execute_workflow',
          config: { workflowId: 'escalation-workflow', priority: 'urgent' }
        },
        {
          type: 'send_notification',
          config: { channel: 'slack', recipients: ['managers'], message: 'High-priority issue escalated' }
        }
      ],
      aiOptimization: {
        enabled: true,
        learning: true,
        adaptation: true
      },
      priority: 'high',
      active: true,
      performance: {
        triggered: 156,
        successful: 148,
        accuracy: 0.95,
        avgResponseTime: 45,
        falsePositives: 5,
        falseNegatives: 3
      }
    },
    {
      id: 'rule-002',
      name: 'Proactive Maintenance',
      description: 'Predict and prevent equipment failures using AI',
      conditions: [
        { field: 'equipment.health_score', operator: 'less_than', value: 0.7, weight: 0.5 },
        { field: 'prediction.confidence', operator: 'greater_than', value: 0.8, weight: 0.3 },
        { field: 'maintenance_overdue', operator: 'equals', value: true, weight: 0.2 }
      ],
      actions: [
        {
          type: 'create_task',
          config: { title: 'Schedule Maintenance', assignee: 'maintenance_team', priority: 'high' }
        },
        {
          type: 'send_notification',
          config: { channel: 'email', recipients: ['technicians'], urgency: 'high' }
        }
      ],
      aiOptimization: {
        enabled: true,
        learning: true,
        adaptation: true
      },
      priority: 'critical',
      active: true,
      performance: {
        triggered: 89,
        successful: 85,
        accuracy: 0.96,
        avgResponseTime: 120,
        falsePositives: 2,
        falseNegatives: 2
      }
    }
  ])

  // Sample learning models
  const [learningModels] = useState<LearningModel[]>([
    {
      id: 'model-001',
      name: 'Decision Optimization Model',
      type: 'reinforcement',
      target: 'decision_optimization',
      accuracy: 0.87,
      improvement: 0.12,
      lastTrained: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: 'ready',
      metrics: {
        trainingSamples: 50000,
        validationAccuracy: 0.89,
        convergenceRate: 0.95
      }
    },
    {
      id: 'model-002',
      name: 'Process Improvement AI',
      type: 'supervised',
      target: 'process_improvement',
      accuracy: 0.91,
      improvement: 0.18,
      lastTrained: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      status: 'learning',
      metrics: {
        trainingSamples: 75000,
        validationAccuracy: 0.93,
        convergenceRate: 0.88
      }
    }
  ])

  const [selectedWorkflow, setSelectedWorkflow] = useState<AutomationWorkflow | null>(null)
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null)

  // Calculate automation metrics
  const automationMetrics = useMemo(() => {
    const totalWorkflows = workflows.length
    const activeWorkflows = workflows.filter(w => w.status === 'active').length
    const totalExecutions = workflows.reduce((sum, w) => sum + w.metrics.executions, 0)
    const avgSuccessRate = workflows.reduce((sum, w) => sum + w.metrics.successRate, 0) / totalWorkflows
    const totalCostSavings = workflows.reduce((sum, w) => sum + w.metrics.costSavings, 0)
    const avgEfficiency = workflows.reduce((sum, w) => sum + w.metrics.efficiency, 0) / totalWorkflows
    const totalAIDecisions = workflows.reduce((sum, w) => sum + w.metrics.aiDecisions, 0)

    const activeRules = automationRules.filter(r => r.active).length
    const totalTriggers = automationRules.reduce((sum, r) => sum + r.performance.triggered, 0)

    return {
      totalWorkflows,
      activeWorkflows,
      totalExecutions,
      avgSuccessRate,
      totalCostSavings,
      avgEfficiency,
      totalAIDecisions,
      activeRules,
      totalTriggers
    }
  }, [workflows, automationRules])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'completed': return 'bg-green-100 text-green-800'
      case 'running': return 'bg-blue-100 text-blue-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'error': case 'failed': return 'bg-red-100 text-red-800'
      case 'maintenance': case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: AutomationWorkflow['category']) => {
    switch (category) {
      case 'business_process': return 'bg-blue-100 text-blue-800'
      case 'customer_service': return 'bg-green-100 text-green-800'
      case 'operations': return 'bg-orange-100 text-orange-800'
      case 'compliance': return 'bg-red-100 text-red-800'
      case 'data_processing': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3">
          <Bot className="w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold">Intelligent Automation Systems</h1>
            <p className="text-lg opacity-90">
              AI-driven workflows with automated decision-making and intelligent process orchestration
            </p>
          </div>
        </div>
      </div>

      {/* Automation Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <GitBranch className="w-6 h-6 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Active Workflows</p>
              <p className="text-2xl font-bold text-gray-900">{automationMetrics.activeWorkflows}/{automationMetrics.totalWorkflows}</p>
            </div>
          </div>
          <div className="text-sm text-blue-600 font-medium">Intelligent processes running</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">AI Decisions</p>
              <p className="text-2xl font-bold text-gray-900">{automationMetrics.totalAIDecisions.toLocaleString()}</p>
            </div>
          </div>
          <div className="text-sm text-green-600 font-medium">Automated decisions made</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{(automationMetrics.avgSuccessRate * 100).toFixed(1)}%</p>
            </div>
          </div>
          <div className="text-sm text-purple-600 font-medium">Process reliability</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Cost Savings</p>
              <p className="text-2xl font-bold text-gray-900">${automationMetrics.totalCostSavings.toLocaleString()}</p>
            </div>
          </div>
          <div className="text-sm text-orange-600 font-medium">Monthly savings achieved</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Automation Workflows */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Automation Workflows</h3>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1">
              <Zap className="w-3 h-3" />
              New Workflow
            </button>
          </div>

          <div className="space-y-3">
            {workflows.map(workflow => (
              <div
                key={workflow.id}
                onClick={() => setSelectedWorkflow(workflow)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedWorkflow?.id === workflow.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Brain className="w-5 h-5 text-purple-600" />
                    <div>
                      <div className="font-medium text-gray-900">{workflow.name}</div>
                      <div className="text-sm text-gray-600">{workflow.category.replace('_', ' ')}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workflow.status)}`}>
                    {workflow.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-gray-600">Executions:</span>
                    <span className="font-medium ml-1">{workflow.metrics.executions}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">AI Decisions:</span>
                    <span className="font-medium ml-1">{workflow.metrics.aiDecisions}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Success Rate:</span>
                    <span className="font-medium ml-1">{(workflow.metrics.successRate * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Efficiency:</span>
                    <span className="font-medium ml-1">{(workflow.metrics.efficiency * 100).toFixed(1)}%</span>
                  </div>
                </div>

                {/* Workflow steps visualization */}
                <div className="flex items-center gap-1">
                  {workflow.steps.slice(0, 5).map((step, index) => (
                    <div key={step.id} className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${
                        step.status === 'completed' ? 'bg-green-500' :
                        step.status === 'running' ? 'bg-blue-500' :
                        step.status === 'failed' ? 'bg-red-500' :
                        step.status === 'pending' ? 'bg-gray-300' : 'bg-yellow-500'
                      }`} title={`${step.name}: ${step.status}`}></div>
                      {index < Math.min(workflow.steps.length - 1, 4) && (
                        <div className="w-4 h-px bg-gray-300"></div>
                      )}
                    </div>
                  ))}
                  {workflow.steps.length > 5 && (
                    <span className="text-xs text-gray-500 ml-1">+{workflow.steps.length - 5} more</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Workflow Details */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedWorkflow ? 'Workflow Details' : 'Workflow Information'}
          </h3>

          {selectedWorkflow ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedWorkflow.category)}`}>
                    {selectedWorkflow.category.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                  <div className="font-medium text-gray-900">{selectedWorkflow.version}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trigger</label>
                  <div className="font-medium capitalize text-gray-900">{selectedWorkflow.trigger.type}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedWorkflow.status)}`}>
                    {selectedWorkflow.status}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">AI Decisions</label>
                <div className="space-y-2">
                  {selectedWorkflow.aiDecisions.slice(0, 3).map(decision => (
                    <div key={decision.id} className="p-2 bg-blue-50 rounded text-sm">
                      <div className="font-medium text-blue-900">{decision.stepId}</div>
                      <div className="text-blue-700">{decision.reasoning.substring(0, 60)}...</div>
                      <div className="text-xs text-blue-600 mt-1">
                        Confidence: {(decision.confidence * 100).toFixed(0)}% • {decision.outcome}
                      </div>
                    </div>
                  ))}
                  {selectedWorkflow.aiDecisions.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{selectedWorkflow.aiDecisions.length - 3} more AI decisions
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Performance Metrics</label>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Executions:</span>
                    <span className="font-medium ml-1">{selectedWorkflow.metrics.executions}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Avg Duration:</span>
                    <span className="font-medium ml-1">{Math.floor(selectedWorkflow.metrics.averageDuration / 60)}m</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Human Interventions:</span>
                    <span className="font-medium ml-1">{selectedWorkflow.metrics.humanInterventions}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Cost Savings:</span>
                    <span className="font-medium ml-1">${selectedWorkflow.metrics.costSavings}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm">
                    Edit Workflow
                  </button>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm">
                    Run Test
                  </button>
                  <button className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm">
                    View Logs
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Bot className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Select a workflow to view details</p>
            </div>
          )}
        </div>

        {/* Automation Rules */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Automation Rules</h3>
            <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1">
              <Settings className="w-3 h-3" />
              New Rule
            </button>
          </div>

          <div className="space-y-3">
            {automationRules.map(rule => (
              <div
                key={rule.id}
                onClick={() => setSelectedRule(rule)}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedRule?.id === rule.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-orange-600" />
                    <span className="font-medium text-gray-900">{rule.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      rule.priority === 'critical' ? 'bg-red-100 text-red-800' :
                      rule.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      rule.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {rule.priority}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${rule.active ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-2">{rule.description}</p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Triggered:</span>
                    <span className="font-medium ml-1">{rule.performance.triggered}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Accuracy:</span>
                    <span className="font-medium ml-1">{(rule.performance.accuracy * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Response Time:</span>
                    <span className="font-medium ml-1">{rule.performance.avgResponseTime}ms</span>
                  </div>
                  <div>
                    <span className="text-gray-600">AI Learning:</span>
                    <span className={`ml-1 ${rule.aiOptimization.learning ? 'text-green-600' : 'text-gray-600'}`}>
                      {rule.aiOptimization.learning ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Learning Models */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">AI Learning Models</h4>
            <div className="space-y-2">
              {learningModels.map(model => (
                <div key={model.id} className="flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium text-gray-900">{model.name}</div>
                    <div className="text-xs text-gray-600">{model.type} • {model.target.replace('_', ' ')}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{(model.accuracy * 100).toFixed(1)}%</div>
                    <div className={`text-xs ${model.status === 'learning' ? 'text-blue-600' : 'text-green-600'}`}>
                      {model.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}