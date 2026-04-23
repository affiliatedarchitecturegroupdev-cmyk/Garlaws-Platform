'use client'

import { useState, useEffect, useMemo } from 'react'
import { Brain, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Zap, Target, BarChart3, Lightbulb, Scale, Clock } from 'lucide-react'

// Types for Intelligent Decision Engine
interface DecisionRule {
  id: string
  name: string
  description: string
  category: 'business' | 'operational' | 'strategic' | 'compliance'
  conditions: DecisionCondition[]
  actions: DecisionAction[]
  priority: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
  active: boolean
  performance: {
    triggered: number
    successful: number
    accuracy: number
    avgResponseTime: number
  }
  lastTriggered?: Date
}

interface DecisionCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'between' | 'in'
  value: any
  weight: number
  logic?: 'AND' | 'OR'
}

interface DecisionAction {
  type: 'recommend' | 'alert' | 'execute' | 'escalate' | 'approve' | 'reject'
  target: string
  parameters: Record<string, any>
  priority: 'low' | 'medium' | 'high' | 'critical'
}

interface DecisionContext {
  id: string
  timestamp: Date
  scenario: string
  data: Record<string, any>
  confidence: number
  recommendations: DecisionRecommendation[]
  executedActions: string[]
  outcome?: 'success' | 'failure' | 'pending'
}

interface DecisionRecommendation {
  id: string
  ruleId: string
  title: string
  description: string
  confidence: number
  impact: 'low' | 'medium' | 'high' | 'critical'
  rationale: string
  alternatives: string[]
  expectedOutcome: string
  riskAssessment: {
    risk: 'low' | 'medium' | 'high' | 'critical'
    mitigation: string[]
  }
}

interface AIModel {
  id: string
  name: string
  type: 'classification' | 'regression' | 'clustering' | 'reinforcement'
  accuracy: number
  lastTrained: Date
  features: string[]
  status: 'active' | 'training' | 'inactive'
  version: string
}

export default function IntelligentDecisionEngine() {
  // Sample decision rules
  const [decisionRules] = useState<DecisionRule[]>([
    {
      id: 'rule-001',
      name: 'High-Value Customer Retention',
      description: 'Identify and prioritize retention efforts for high-value customers showing churn indicators',
      category: 'business',
      conditions: [
        { field: 'customer.value', operator: 'greater_than', value: 10000, weight: 0.3 },
        { field: 'engagement.score', operator: 'less_than', value: 30, weight: 0.4 },
        { field: 'complaints.last30days', operator: 'greater_than', value: 2, weight: 0.3 }
      ],
      actions: [
        {
          type: 'recommend',
          target: 'customer_success_team',
          parameters: { action: 'immediate_outreach', priority: 'high' },
          priority: 'high'
        },
        {
          type: 'alert',
          target: 'management',
          parameters: { channel: 'slack', message: 'High-value customer at risk' },
          priority: 'medium'
        }
      ],
      priority: 'high',
      confidence: 0.89,
      active: true,
      performance: {
        triggered: 47,
        successful: 41,
        accuracy: 87.2,
        avgResponseTime: 12.5
      },
      lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: 'rule-002',
      name: 'Inventory Optimization',
      description: 'Optimize inventory levels based on demand forecasting and supply chain metrics',
      category: 'operational',
      conditions: [
        { field: 'demand.forecast', operator: 'greater_than', value: 1000, weight: 0.4 },
        { field: 'inventory.level', operator: 'less_than', value: 200, weight: 0.3 },
        { field: 'supplier.lead_time', operator: 'greater_than', value: 14, weight: 0.3 }
      ],
      actions: [
        {
          type: 'execute',
          target: 'inventory_system',
          parameters: { action: 'increase_reorder_point', percentage: 25 },
          priority: 'medium'
        },
        {
          type: 'recommend',
          target: 'procurement_team',
          parameters: { action: 'review_supplier_contracts' },
          priority: 'low'
        }
      ],
      priority: 'medium',
      confidence: 0.76,
      active: true,
      performance: {
        triggered: 156,
        successful: 142,
        accuracy: 91.0,
        avgResponseTime: 8.3
      },
      lastTriggered: new Date(Date.now() - 45 * 60 * 1000)
    },
    {
      id: 'rule-003',
      name: 'Fraud Detection',
      description: 'Detect potential fraudulent transactions using behavioral analysis',
      category: 'compliance',
      conditions: [
        { field: 'transaction.amount', operator: 'greater_than', value: 5000, weight: 0.2 },
        { field: 'location.unusual', operator: 'equals', value: true, weight: 0.3 },
        { field: 'device.fingerprint.new', operator: 'equals', value: true, weight: 0.3 },
        { field: 'velocity.transactions_per_hour', operator: 'greater_than', value: 10, weight: 0.2 }
      ],
      actions: [
        {
          type: 'alert',
          target: 'security_team',
          parameters: { channel: 'email', priority: 'critical', escalate: true },
          priority: 'critical'
        },
        {
          type: 'execute',
          target: 'payment_system',
          parameters: { action: 'hold_transaction', duration: 24 },
          priority: 'high'
        }
      ],
      priority: 'critical',
      confidence: 0.94,
      active: true,
      performance: {
        triggered: 23,
        successful: 22,
        accuracy: 95.7,
        avgResponseTime: 2.1
      },
      lastTriggered: new Date(Date.now() - 6 * 60 * 60 * 1000)
    }
  ])

  // Sample decision contexts
  const [decisionContexts] = useState<DecisionContext[]>([
    {
      id: 'ctx-001',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      scenario: 'Customer Churn Prediction',
      data: {
        customerId: 'CUST-12345',
        value: 15000,
        engagement: 25,
        complaints: 3,
        lastPurchase: '2024-01-15'
      },
      confidence: 0.87,
      recommendations: [
        {
          id: 'rec-001',
          ruleId: 'rule-001',
          title: 'Implement Retention Strategy',
          description: 'Execute personalized retention campaign for high-value customer',
          confidence: 0.89,
          impact: 'high',
          rationale: 'Customer shows multiple churn indicators with high lifetime value',
          alternatives: ['Offer discount', 'Schedule call', 'Send personalized email'],
          expectedOutcome: '65% chance of retention',
          riskAssessment: {
            risk: 'low',
            mitigation: ['Monitor response', 'Have backup offers ready']
          }
        }
      ],
      executedActions: ['send_personalized_email'],
      outcome: 'pending'
    },
    {
      id: 'ctx-002',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      scenario: 'Inventory Replenishment',
      data: {
        productId: 'PROD-67890',
        forecast: 1200,
        currentStock: 150,
        leadTime: 18,
        supplier: 'Supplier A'
      },
      confidence: 0.78,
      recommendations: [
        {
          id: 'rec-002',
          ruleId: 'rule-002',
          title: 'Increase Safety Stock',
          description: 'Raise reorder point by 25% to prevent stockouts',
          confidence: 0.76,
          impact: 'medium',
          rationale: 'Demand forecast indicates potential shortage before replenishment',
          alternatives: ['Expedite current order', 'Switch suppliers', 'Reduce forecast'],
          expectedOutcome: '90% reduction in stockout risk',
          riskAssessment: {
            risk: 'low',
            mitigation: ['Monitor actual demand', 'Adjust based on new data']
          }
        }
      ],
      executedActions: ['increase_reorder_point', 'notify_procurement'],
      outcome: 'success'
    }
  ])

  // Sample AI models
  const [aiModels] = useState<AIModel[]>([
    {
      id: 'model-001',
      name: 'Customer Churn Predictor',
      type: 'classification',
      accuracy: 89.5,
      lastTrained: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      features: ['engagement_score', 'purchase_frequency', 'complaint_history', 'contract_value'],
      status: 'active',
      version: 'v2.1.3'
    },
    {
      id: 'model-002',
      name: 'Demand Forecaster',
      type: 'regression',
      accuracy: 94.2,
      lastTrained: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      features: ['historical_sales', 'seasonality', 'market_trends', 'economic_indicators'],
      status: 'active',
      version: 'v1.8.2'
    },
    {
      id: 'model-003',
      name: 'Fraud Detection Engine',
      type: 'classification',
      accuracy: 96.1,
      lastTrained: new Date(Date.now() - 24 * 60 * 60 * 1000),
      features: ['transaction_amount', 'location', 'device_fingerprint', 'velocity'],
      status: 'active',
      version: 'v3.0.1'
    }
  ])

  const [selectedContext, setSelectedContext] = useState<DecisionContext | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')

  // Filtered rules
  const filteredRules = useMemo(() => {
    if (filterCategory === 'all') return decisionRules
    return decisionRules.filter(rule => rule.category === filterCategory)
  }, [decisionRules, filterCategory])

  // Calculate system metrics
  const systemMetrics = useMemo(() => {
    const totalRules = decisionRules.length
    const activeRules = decisionRules.filter(r => r.active).length
    const totalTriggers = decisionRules.reduce((sum, rule) => sum + rule.performance.triggered, 0)
    const successfulDecisions = decisionRules.reduce((sum, rule) => sum + rule.performance.successful, 0)
    const overallAccuracy = decisionRules.reduce((sum, rule) => sum + rule.performance.accuracy, 0) / totalRules
    const avgResponseTime = decisionRules.reduce((sum, rule) => sum + rule.performance.avgResponseTime, 0) / totalRules

    return {
      totalRules,
      activeRules,
      totalTriggers,
      successfulDecisions,
      overallAccuracy,
      avgResponseTime
    }
  }, [decisionRules])

  const getCategoryColor = (category: DecisionRule['category']) => {
    switch (category) {
      case 'business': return 'bg-blue-100 text-blue-800'
      case 'operational': return 'bg-green-100 text-green-800'
      case 'strategic': return 'bg-purple-100 text-purple-800'
      case 'compliance': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getImpactColor = (impact: DecisionRecommendation['impact']) => {
    switch (impact) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskColor = (risk: DecisionRecommendation['riskAssessment']['risk']) => {
    switch (risk) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold">Intelligent Decision Engine</h1>
            <p className="text-lg opacity-90">
              AI-powered decision systems with automated recommendations and intelligent analysis
            </p>
          </div>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Active Rules</p>
              <p className="text-2xl font-bold text-gray-900">{systemMetrics.activeRules}/{systemMetrics.totalRules}</p>
            </div>
          </div>
          <div className="text-sm text-blue-600 font-medium">
            {Math.round((systemMetrics.activeRules / systemMetrics.totalRules) * 100)}% utilization
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{systemMetrics.overallAccuracy.toFixed(1)}%</p>
            </div>
          </div>
          <div className="text-sm text-green-600 font-medium">Decision accuracy</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Avg Response</p>
              <p className="text-2xl font-bold text-gray-900">{systemMetrics.avgResponseTime.toFixed(1)}s</p>
            </div>
          </div>
          <div className="text-sm text-purple-600 font-medium">Real-time decisions</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-6 h-6 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Total Triggers</p>
              <p className="text-2xl font-bold text-gray-900">{systemMetrics.totalTriggers.toLocaleString()}</p>
            </div>
          </div>
          <div className="text-sm text-orange-600 font-medium">This month</div>
        </div>
      </div>

      {/* Decision Rules */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Decision Rules</h2>
          <div className="flex items-center gap-4">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="business">Business</option>
              <option value="operational">Operational</option>
              <option value="strategic">Strategic</option>
              <option value="compliance">Compliance</option>
            </select>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Brain className="w-4 h-4" />
              New Rule
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredRules.map(rule => (
            <div key={rule.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${rule.active ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                  <div>
                    <h3 className="font-medium text-gray-900">{rule.name}</h3>
                    <p className="text-sm text-gray-600">{rule.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(rule.category)}`}>
                    {rule.category}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Confidence</div>
                  <div className="font-semibold text-gray-900">{(rule.confidence * 100).toFixed(0)}%</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Conditions</div>
                  <div className="font-medium">{rule.conditions.length} rules</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Actions</div>
                  <div className="font-medium">{rule.actions.length} actions</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Performance</div>
                  <div className="font-medium text-green-600">
                    {rule.performance.accuracy.toFixed(1)}% accuracy
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Triggers</div>
                  <div className="font-medium">{rule.performance.triggered}</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{rule.performance.avgResponseTime.toFixed(1)}s avg response</span>
                  </div>
                  {rule.lastTriggered && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                      <span>Last triggered {rule.lastTriggered.toLocaleString()}</span>
                    </div>
                  )}
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
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Configure
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Models */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Models</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {aiModels.map(model => (
            <div key={model.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">{model.name}</h4>
                    <p className="text-sm text-gray-600">{model.type}</p>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  model.status === 'active' ? 'bg-green-400' :
                  model.status === 'training' ? 'bg-yellow-400' : 'bg-gray-300'
                }`}></div>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Accuracy:</span>
                  <span className="font-medium">{model.accuracy}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Version:</span>
                  <span className="font-medium">{model.version}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Trained:</span>
                  <span className="font-medium">{model.lastTrained.toLocaleDateString()}</span>
                </div>
              </div>

              <div className="text-xs text-gray-600">
                Features: {model.features.slice(0, 3).join(', ')}
                {model.features.length > 3 && ` +${model.features.length - 3} more`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Decision Contexts */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Decision Contexts</h2>
        <div className="space-y-4">
          {decisionContexts.map(context => (
            <div key={context.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    <span className="font-medium text-gray-900">{context.scenario}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    context.outcome === 'success' ? 'bg-green-100 text-green-800' :
                    context.outcome === 'failure' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {context.outcome || 'pending'}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Confidence</div>
                  <div className="font-semibold text-gray-900">{(context.confidence * 100).toFixed(0)}%</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Key Data Points</div>
                  <div className="text-sm font-medium">{Object.keys(context.data).length} variables</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Recommendations</div>
                  <div className="text-sm font-medium">{context.recommendations.length} generated</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Actions Executed</div>
                  <div className="text-sm font-medium">{context.executedActions.length} automated</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {context.timestamp.toLocaleString()}
                </div>
                <button
                  onClick={() => setSelectedContext(context)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Decision Context Details Modal */}
      {selectedContext && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{selectedContext.scenario}</h3>
                <button
                  onClick={() => setSelectedContext(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                  <p className="text-gray-900">{selectedContext.timestamp.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confidence</label>
                  <p className="text-gray-900">{(selectedContext.confidence * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Outcome</label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedContext.outcome === 'success' ? 'bg-green-100 text-green-800' :
                    selectedContext.outcome === 'failure' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedContext.outcome || 'pending'}
                  </span>
                </div>
              </div>

              {/* Context Data */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Context Data</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-800 overflow-x-auto">
                    {JSON.stringify(selectedContext.data, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">AI Recommendations</h4>
                <div className="space-y-4">
                  {selectedContext.recommendations.map(recommendation => (
                    <div key={recommendation.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h5 className="font-medium text-gray-900">{recommendation.title}</h5>
                          <p className="text-sm text-gray-600 mt-1">{recommendation.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(recommendation.impact)}`}>
                            {recommendation.impact} impact
                          </span>
                          <span className="text-sm text-gray-600">{(recommendation.confidence * 100).toFixed(0)}% confidence</span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="text-sm font-medium text-gray-700 mb-1">Rationale</div>
                        <p className="text-sm text-gray-600">{recommendation.rationale}</p>
                      </div>

                      <div className="mb-3">
                        <div className="text-sm font-medium text-gray-700 mb-1">Expected Outcome</div>
                        <p className="text-sm text-gray-600">{recommendation.expectedOutcome}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-2">Alternatives</div>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {recommendation.alternatives.map((alt, index) => (
                              <li key={index} className="flex items-center gap-1">
                                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                {alt}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-2">Risk Assessment</div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(recommendation.riskAssessment.risk)}`}>
                              {recommendation.riskAssessment.risk} risk
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            <div className="font-medium mb-1">Mitigation:</div>
                            <ul className="space-y-1">
                              {recommendation.riskAssessment.mitigation.map((mitigation, index) => (
                                <li key={index} className="flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3 text-green-500" />
                                  {mitigation}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Executed Actions */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Executed Actions</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedContext.executedActions.map((action, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {action.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}