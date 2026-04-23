'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, Filter, BarChart3, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Activity, Clock, Users, Zap, Target, GitBranch } from 'lucide-react'

// Types for Process Mining
interface ProcessEvent {
  id: string
  caseId: string
  activity: string
  timestamp: Date
  resource: string
  data: Record<string, any>
  status: 'completed' | 'started' | 'error'
}

interface ProcessFlow {
  source: string
  target: string
  frequency: number
  avgDuration: number
  successRate: number
}

interface ProcessVariant {
  id: string
  path: string[]
  frequency: number
  avgDuration: number
  successRate: number
  cost: number
  efficiency: number
}

interface BottleneckAnalysis {
  activity: string
  avgProcessingTime: number
  queueTime: number
  resourceUtilization: number
  throughput: number
  bottleneckScore: number
}

interface PerformanceMetric {
  activity: string
  avgDuration: number
  minDuration: number
  maxDuration: number
  standardDeviation: number
  frequency: number
  successRate: number
  resourceCost: number
}

interface ProcessDiscovery {
  discoveredModel: {
    activities: string[]
    flows: ProcessFlow[]
    startActivities: string[]
    endActivities: string[]
  }
  qualityMetrics: {
    fitness: number
    precision: number
    generalization: number
    simplicity: number
  }
  conformance: {
    fittingCases: number
    totalCases: number
    avgFitness: number
  }
}

export default function ProcessMining() {
  // Sample process events
  const [processEvents] = useState<ProcessEvent[]>([
    {
      id: '1',
      caseId: 'CASE-001',
      activity: 'Order Received',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      resource: 'System',
      data: { orderId: 'ORD-12345', amount: 299.99 },
      status: 'completed'
    },
    {
      id: '2',
      caseId: 'CASE-001',
      activity: 'Payment Processing',
      timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
      resource: 'Payment Gateway',
      data: { method: 'credit_card', amount: 299.99 },
      status: 'completed'
    },
    {
      id: '3',
      caseId: 'CASE-001',
      activity: 'Inventory Check',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      resource: 'Warehouse System',
      data: { productId: 'PROD-001', available: true },
      status: 'completed'
    },
    {
      id: '4',
      caseId: 'CASE-001',
      activity: 'Order Fulfillment',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      resource: 'Fulfillment Center',
      data: { shippingMethod: 'standard', trackingId: 'TRK-12345' },
      status: 'completed'
    },
    {
      id: '5',
      caseId: 'CASE-001',
      activity: 'Order Shipped',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      resource: 'Shipping System',
      data: { carrier: 'FedEx', trackingId: 'TRK-12345' },
      status: 'completed'
    }
  ])

  // Sample process variants
  const [processVariants] = useState<ProcessVariant[]>([
    {
      id: 'variant-1',
      path: ['Order Received', 'Payment Processing', 'Inventory Check', 'Order Fulfillment', 'Order Shipped'],
      frequency: 65,
      avgDuration: 2.3,
      successRate: 98.5,
      cost: 15.50,
      efficiency: 92.1
    },
    {
      id: 'variant-2',
      path: ['Order Received', 'Payment Processing', 'Inventory Check', 'Backorder Processing', 'Order Fulfillment', 'Order Shipped'],
      frequency: 25,
      avgDuration: 4.1,
      successRate: 89.2,
      cost: 28.75,
      efficiency: 78.4
    },
    {
      id: 'variant-3',
      path: ['Order Received', 'Payment Failed', 'Payment Retry', 'Payment Processing', 'Inventory Check', 'Order Fulfillment', 'Order Shipped'],
      frequency: 10,
      avgDuration: 6.8,
      successRate: 75.0,
      cost: 45.20,
      efficiency: 65.2
    }
  ])

  // Sample bottleneck analysis
  const [bottleneckAnalysis] = useState<BottleneckAnalysis[]>([
    {
      activity: 'Payment Processing',
      avgProcessingTime: 45,
      queueTime: 120,
      resourceUtilization: 85,
      throughput: 180,
      bottleneckScore: 8.2
    },
    {
      activity: 'Inventory Check',
      avgProcessingTime: 30,
      queueTime: 60,
      resourceUtilization: 75,
      throughput: 240,
      bottleneckScore: 6.1
    },
    {
      activity: 'Order Fulfillment',
      avgProcessingTime: 90,
      queueTime: 180,
      resourceUtilization: 92,
      throughput: 120,
      bottleneckScore: 9.8
    },
    {
      activity: 'Quality Control',
      avgProcessingTime: 60,
      queueTime: 45,
      resourceUtilization: 65,
      throughput: 300,
      bottleneckScore: 4.3
    }
  ])

  // Sample performance metrics
  const [performanceMetrics] = useState<PerformanceMetric[]>([
    {
      activity: 'Order Received',
      avgDuration: 15,
      minDuration: 5,
      maxDuration: 45,
      standardDeviation: 8.2,
      frequency: 1000,
      successRate: 99.9,
      resourceCost: 0.50
    },
    {
      activity: 'Payment Processing',
      avgDuration: 45,
      minDuration: 15,
      maxDuration: 180,
      standardDeviation: 25.3,
      frequency: 950,
      successRate: 96.5,
      resourceCost: 2.25
    },
    {
      activity: 'Inventory Check',
      avgDuration: 30,
      minDuration: 10,
      maxDuration: 120,
      standardDeviation: 15.7,
      frequency: 920,
      successRate: 98.2,
      resourceCost: 1.75
    },
    {
      activity: 'Order Fulfillment',
      avgDuration: 90,
      minDuration: 30,
      maxDuration: 240,
      standardDeviation: 35.1,
      frequency: 880,
      successRate: 94.8,
      resourceCost: 8.50
    },
    {
      activity: 'Order Shipped',
      avgDuration: 20,
      minDuration: 5,
      maxDuration: 60,
      standardDeviation: 10.4,
      frequency: 850,
      successRate: 99.5,
      resourceCost: 3.25
    }
  ])

  // Process discovery results
  const [processDiscovery] = useState<ProcessDiscovery>({
    discoveredModel: {
      activities: ['Order Received', 'Payment Processing', 'Inventory Check', 'Order Fulfillment', 'Order Shipped', 'Payment Failed', 'Payment Retry', 'Backorder Processing'],
      flows: [
        { source: 'Order Received', target: 'Payment Processing', frequency: 1000, avgDuration: 25, successRate: 96.5 },
        { source: 'Payment Processing', target: 'Inventory Check', frequency: 950, avgDuration: 35, successRate: 98.2 },
        { source: 'Inventory Check', target: 'Order Fulfillment', frequency: 920, avgDuration: 85, successRate: 94.8 },
        { source: 'Order Fulfillment', target: 'Order Shipped', frequency: 880, avgDuration: 15, successRate: 99.5 }
      ],
      startActivities: ['Order Received'],
      endActivities: ['Order Shipped']
    },
    qualityMetrics: {
      fitness: 0.92,
      precision: 0.88,
      generalization: 0.85,
      simplicity: 0.78
    },
    conformance: {
      fittingCases: 945,
      totalCases: 1000,
      avgFitness: 0.91
    }
  })

  const [selectedView, setSelectedView] = useState<'discovery' | 'analysis' | 'optimization'>('discovery')
  const [selectedCase, setSelectedCase] = useState<string | null>(null)

  // Calculate key metrics
  const keyMetrics = useMemo(() => {
    const totalEvents = processEvents.length
    const uniqueCases = new Set(processEvents.map(e => e.caseId)).size
    const uniqueActivities = new Set(processEvents.map(e => e.activity)).size
    const avgCaseDuration = 2.4 // hours
    const processEfficiency = 87.3 // percentage
    const automationPotential = 34.7 // percentage

    return {
      totalEvents,
      uniqueCases,
      uniqueActivities,
      avgCaseDuration,
      processEfficiency,
      automationPotential
    }
  }, [processEvents])

  // Get case events
  const caseEvents = useMemo(() => {
    if (!selectedCase) return []
    return processEvents
      .filter(e => e.caseId === selectedCase)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  }, [processEvents, selectedCase])

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3">
          <Activity className="w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold">Process Mining & Analysis</h1>
            <p className="text-lg opacity-90">
              Discover, analyze, and optimize business processes through event data mining
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{keyMetrics.totalEvents.toLocaleString()}</p>
            </div>
          </div>
          <div className="text-sm text-blue-600 font-medium">Analyzed this month</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <GitBranch className="w-6 h-6 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Process Variants</p>
              <p className="text-2xl font-bold text-gray-900">{processVariants.length}</p>
            </div>
          </div>
          <div className="text-sm text-green-600 font-medium">Identified patterns</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Efficiency Score</p>
              <p className="text-2xl font-bold text-gray-900">{keyMetrics.processEfficiency}%</p>
            </div>
          </div>
          <div className="text-sm text-purple-600 font-medium">Optimization potential</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Automation Potential</p>
              <p className="text-2xl font-bold text-gray-900">{keyMetrics.automationPotential}%</p>
            </div>
          </div>
          <div className="text-sm text-orange-600 font-medium">Efficiency gain possible</div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setSelectedView('discovery')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedView === 'discovery'
                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Process Discovery
          </button>
          <button
            onClick={() => setSelectedView('analysis')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedView === 'analysis'
                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Performance Analysis
          </button>
          <button
            onClick={() => setSelectedView('optimization')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedView === 'optimization'
                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Optimization Insights
          </button>
        </div>

        {/* Process Discovery View */}
        {selectedView === 'discovery' && (
          <div className="space-y-6">
            {/* Process Model Quality */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{(processDiscovery.qualityMetrics.fitness * 100).toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Fitness</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{(processDiscovery.qualityMetrics.precision * 100).toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Precision</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{(processDiscovery.qualityMetrics.generalization * 100).toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Generalization</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{(processDiscovery.qualityMetrics.simplicity * 100).toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Simplicity</div>
              </div>
            </div>

            {/* Process Flow Visualization */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Discovered Process Model</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mb-2">
                      START
                    </div>
                    <div className="text-sm text-gray-600">Order Received</div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs mb-1">
                      PP
                    </div>
                    <div className="text-xs text-gray-600">Payment Processing</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs mb-1">
                      IC
                    </div>
                    <div className="text-xs text-gray-600">Inventory Check</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs mb-1">
                      OF
                    </div>
                    <div className="text-xs text-gray-600">Order Fulfillment</div>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white font-bold mb-2">
                      END
                    </div>
                    <div className="text-sm text-gray-600">Order Shipped</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Process Variants */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Process Variants</h3>
              <div className="space-y-3">
                {processVariants.map(variant => (
                  <div key={variant.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-900">Variant {variant.id.split('-')[1]}</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {variant.frequency}% frequency
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">{variant.avgDuration}h avg duration</div>
                        <div className="text-sm font-medium text-green-600">{variant.successRate}% success</div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-sm text-gray-600 mb-1">Process Path:</div>
                      <div className="flex items-center gap-1 flex-wrap">
                        {variant.path.map((activity, index) => (
                          <div key={index} className="flex items-center">
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                              {activity}
                            </span>
                            {index < variant.path.length - 1 && (
                              <div className="w-4 h-px bg-gray-400 mx-1"></div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Cost:</span>
                        <span className="font-medium ml-1">${variant.cost}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Efficiency:</span>
                        <span className="font-medium ml-1 text-green-600">{variant.efficiency}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Optimization:</span>
                        <span className="font-medium ml-1 text-blue-600">+{Math.round((variant.efficiency - 70) * 1.5)}% potential</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Performance Analysis View */}
        {selectedView === 'analysis' && (
          <div className="space-y-6">
            {/* Performance Metrics Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Activity</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Avg Duration</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Frequency</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Success Rate</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Cost</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceMetrics.map(metric => (
                    <tr key={metric.activity} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{metric.activity}</td>
                      <td className="py-3 px-4 text-right">{metric.avgDuration}s</td>
                      <td className="py-3 px-4 text-right">{metric.frequency}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-green-600 font-medium">{metric.successRate}%</span>
                      </td>
                      <td className="py-3 px-4 text-right">${metric.resourceCost}</td>
                      <td className="py-3 px-4 text-center">
                        {metric.avgDuration > 60 ? (
                          <AlertTriangle className="w-5 h-5 text-red-500 inline" />
                        ) : metric.successRate < 95 ? (
                          <TrendingDown className="w-5 h-5 text-yellow-500 inline" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-green-500 inline" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottleneck Analysis */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bottleneck Analysis</h3>
              <div className="space-y-4">
                {bottleneckAnalysis
                  .sort((a, b) => b.bottleneckScore - a.bottleneckScore)
                  .map(bottleneck => (
                  <div key={bottleneck.activity} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{bottleneck.activity}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          bottleneck.bottleneckScore > 8 ? 'bg-red-100 text-red-800' :
                          bottleneck.bottleneckScore > 6 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          Score: {bottleneck.bottleneckScore}/10
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Processing Time</div>
                        <div className="font-medium">{bottleneck.avgProcessingTime}s</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Queue Time</div>
                        <div className="font-medium">{bottleneck.queueTime}s</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Utilization</div>
                        <div className="font-medium">{bottleneck.resourceUtilization}%</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Throughput</div>
                        <div className="font-medium">{bottleneck.throughput}/hour</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Optimization Insights View */}
        {selectedView === 'optimization' && (
          <div className="space-y-6">
            {/* Optimization Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h3 className="font-medium text-green-800">Process Optimization</h3>
                </div>
                <div className="space-y-2 text-sm text-green-700">
                  <div>• Parallelize payment processing and inventory checks</div>
                  <div>• Implement automated quality control bypass for low-risk items</div>
                  <div>• Optimize warehouse layout to reduce picking time by 25%</div>
                  <div>• Introduce predictive maintenance for fulfillment equipment</div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="w-6 h-6 text-blue-600" />
                  <h3 className="font-medium text-blue-800">Automation Opportunities</h3>
                </div>
                <div className="space-y-2 text-sm text-blue-700">
                  <div>• Automate 85% of repetitive approval workflows</div>
                  <div>• Implement AI-powered exception handling</div>
                  <div>• Deploy robotic process automation for data entry</div>
                  <div>• Create self-service portals for common requests</div>
                </div>
              </div>
            </div>

            {/* ROI Projections */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Optimization ROI Projections</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">$125K</div>
                  <div className="text-sm text-gray-600">Annual Cost Savings</div>
                  <div className="text-xs text-gray-500 mt-1">Through process optimization</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">35%</div>
                  <div className="text-sm text-gray-600">Efficiency Improvement</div>
                  <div className="text-xs text-gray-500 mt-1">Reduction in processing time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">6 months</div>
                  <div className="text-sm text-gray-600">Payback Period</div>
                  <div className="text-xs text-gray-500 mt-1">ROI on optimization investment</div>
                </div>
              </div>
            </div>

            {/* Process Event Log */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Process Events</h3>
              <div className="space-y-2">
                {processEvents.slice(0, 10).map(event => (
                  <div key={event.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        event.status === 'completed' ? 'bg-green-400' :
                        event.status === 'started' ? 'bg-blue-400' : 'bg-red-400'
                      }`}></span>
                      <span className="font-medium text-gray-900">{event.activity}</span>
                    </div>
                    <div className="text-gray-600">{event.caseId}</div>
                    <div className="text-gray-600">{event.resource}</div>
                    <div className="text-gray-500 ml-auto">{event.timestamp.toLocaleTimeString()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}