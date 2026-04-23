'use client'

import { useState, useEffect, useMemo } from 'react'
import { TrendingUp, TrendingDown, DollarSign, Settings, Clock, Users, Target, Zap } from 'lucide-react'

// Types for pricing engine
interface PricingRule {
  id: string
  name: string
  type: 'discount' | 'markup' | 'dynamic'
  condition: {
    metric: 'time' | 'demand' | 'inventory' | 'competition' | 'customer_segment'
    operator: '>' | '<' | '=' | '>=' | '<='
    value: number | string
  }
  action: {
    adjustmentType: 'percentage' | 'fixed'
    value: number
    maxAdjustment?: number
    minAdjustment?: number
  }
  active: boolean
  priority: number
}

interface Product {
  id: string
  name: string
  basePrice: number
  currentPrice: number
  category: string
  demand: 'low' | 'medium' | 'high'
  inventory: number
  competitorPrice?: number
  customerSegment: string
  lastUpdated: Date
}

interface PricingMetrics {
  totalRevenue: number
  averageMargin: number
  priceElasticity: number
  conversionRate: number
  competitorIndex: number
}

export default function DynamicPricingEngine() {
  // Sample pricing rules
  const [pricingRules] = useState<PricingRule[]>([
    {
      id: '1',
      name: 'High Demand Surge',
      type: 'dynamic',
      condition: { metric: 'demand', operator: '>', value: 'medium' },
      action: { adjustmentType: 'percentage', value: 15, maxAdjustment: 50 },
      active: true,
      priority: 1
    },
    {
      id: '2',
      name: 'Low Inventory Premium',
      type: 'markup',
      condition: { metric: 'inventory', operator: '<', value: 10 },
      action: { adjustmentType: 'percentage', value: 25, maxAdjustment: 100 },
      active: true,
      priority: 2
    },
    {
      id: '3',
      name: 'Competitor Matching',
      type: 'dynamic',
      condition: { metric: 'competition', operator: '>', value: 0 },
      action: { adjustmentType: 'percentage', value: -5, minAdjustment: -20 },
      active: true,
      priority: 3
    },
    {
      id: '4',
      name: 'Time-based Discount',
      type: 'discount',
      condition: { metric: 'time', operator: '=', value: 'off-peak' },
      action: { adjustmentType: 'percentage', value: -10, maxAdjustment: -30 },
      active: false,
      priority: 4
    }
  ])

  // Sample products with pricing data
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'Smart Property Management Suite',
      basePrice: 299.99,
      currentPrice: 299.99,
      category: 'Software',
      demand: 'high',
      inventory: 50,
      competitorPrice: 279.99,
      customerSegment: 'enterprise',
      lastUpdated: new Date()
    },
    {
      id: '2',
      name: 'IoT Sensor Network Kit',
      basePrice: 149.99,
      currentPrice: 149.99,
      category: 'Hardware',
      demand: 'medium',
      inventory: 25,
      competitorPrice: 159.99,
      customerSegment: 'smb',
      lastUpdated: new Date()
    },
    {
      id: '3',
      name: 'Enterprise Analytics Dashboard',
      basePrice: 499.99,
      currentPrice: 499.99,
      category: 'Software',
      demand: 'high',
      inventory: 5,
      competitorPrice: 479.99,
      customerSegment: 'enterprise',
      lastUpdated: new Date()
    },
    {
      id: '4',
      name: 'Cloud Security Platform',
      basePrice: 399.99,
      currentPrice: 399.99,
      category: 'Security',
      demand: 'medium',
      inventory: 15,
      competitorPrice: 389.99,
      customerSegment: 'enterprise',
      lastUpdated: new Date()
    }
  ])

  const [pricingMetrics] = useState<PricingMetrics>({
    totalRevenue: 125000,
    averageMargin: 35.2,
    priceElasticity: -1.8,
    conversionRate: 12.5,
    competitorIndex: 98.5
  })

  const [selectedRule, setSelectedRule] = useState<PricingRule | null>(null)
  const [isAutoPricingEnabled, setIsAutoPricingEnabled] = useState(true)

  // Simulate real-time price adjustments
  useEffect(() => {
    if (!isAutoPricingEnabled) return

    const interval = setInterval(() => {
      setProducts(prevProducts =>
        prevProducts.map(product => {
          let newPrice = product.basePrice
          let appliedRules: string[] = []

          // Apply active pricing rules in priority order
          pricingRules
            .filter(rule => rule.active)
            .sort((a, b) => a.priority - b.priority)
            .forEach(rule => {
              let conditionMet = false

              switch (rule.condition.metric) {
                case 'demand':
                  conditionMet = product.demand === rule.condition.value ||
                    (rule.condition.operator === '>' && product.demand === 'high') ||
                    (rule.condition.operator === '<' && product.demand === 'low')
                  break
                case 'inventory':
                  const inventoryValue = product.inventory
                  const conditionValue = rule.condition.value as number
                  switch (rule.condition.operator) {
                    case '>': conditionMet = inventoryValue > conditionValue; break
                    case '<': conditionMet = inventoryValue < conditionValue; break
                    case '=': conditionMet = inventoryValue === conditionValue; break
                  }
                  break
                case 'competition':
                  if (product.competitorPrice) {
                    conditionMet = product.competitorPrice > product.basePrice
                  }
                  break
              }

              if (conditionMet) {
                if (rule.action.adjustmentType === 'percentage') {
                  const adjustment = (product.basePrice * rule.action.value) / 100
                  const clampedAdjustment = Math.max(
                    rule.action.minAdjustment || -Infinity,
                    Math.min(rule.action.maxAdjustment || Infinity, adjustment)
                  )
                  newPrice += clampedAdjustment
                } else {
                  newPrice += rule.action.value
                }
                appliedRules.push(rule.name)
              }
            })

          // Ensure price doesn't go below cost (assuming 60% of base price is cost)
          newPrice = Math.max(newPrice, product.basePrice * 0.6)

          return {
            ...product,
            currentPrice: Math.round(newPrice * 100) / 100,
            lastUpdated: new Date()
          }
        })
      )
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [pricingRules, isAutoPricingEnabled])

  // Calculate price changes and margins
  const priceAnalysis = useMemo(() => {
    return products.map(product => ({
      ...product,
      priceChange: ((product.currentPrice - product.basePrice) / product.basePrice) * 100,
      margin: ((product.currentPrice - product.basePrice * 0.6) / product.currentPrice) * 100,
      competitorGap: product.competitorPrice
        ? ((product.currentPrice - product.competitorPrice) / product.competitorPrice) * 100
        : 0
    }))
  }, [products])

  const toggleRule = (ruleId: string) => {
    // In real app, this would update the backend
    console.log(`Toggling rule ${ruleId}`)
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8" />
            <div>
              <h1 className="text-3xl font-bold">Dynamic Pricing Engine</h1>
              <p className="text-lg opacity-90">
                AI-powered pricing optimization with real-time adjustments
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isAutoPricingEnabled ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-sm">{isAutoPricingEnabled ? 'Auto-Pricing Active' : 'Manual Mode'}</span>
            </div>
            <button
              onClick={() => setIsAutoPricingEnabled(!isAutoPricingEnabled)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isAutoPricingEnabled
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {isAutoPricingEnabled ? 'Disable Auto' : 'Enable Auto'}
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${pricingMetrics.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
          <div className="text-sm text-green-600 font-medium">+12.5% from last month</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Average Margin</p>
              <p className="text-2xl font-bold text-gray-900">{pricingMetrics.averageMargin}%</p>
            </div>
          </div>
          <div className="text-sm text-blue-600 font-medium">Target: 35%</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{pricingMetrics.conversionRate}%</p>
            </div>
          </div>
          <div className="text-sm text-purple-600 font-medium">+2.1% from last week</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Price Elasticity</p>
              <p className="text-2xl font-bold text-gray-900">{pricingMetrics.priceElasticity}</p>
            </div>
          </div>
          <div className="text-sm text-orange-600 font-medium">Elastic market</div>
        </div>
      </div>

      {/* Pricing Rules */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Pricing Rules</h2>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Add Rule
          </button>
        </div>

        <div className="space-y-4">
          {pricingRules.map(rule => (
            <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    rule.active ? 'bg-green-400' : 'bg-gray-300'
                  }`}></div>
                  <h3 className="font-medium text-gray-900">{rule.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    rule.type === 'discount' ? 'bg-red-100 text-red-800' :
                    rule.type === 'markup' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {rule.type}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Priority: {rule.priority}</span>
                  <button
                    onClick={() => toggleRule(rule.id)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      rule.active
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {rule.active ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <span className="font-medium">Condition:</span> {rule.condition.metric} {rule.condition.operator} {rule.condition.value}
                <span className="mx-2">→</span>
                <span className="font-medium">Action:</span> {rule.action.adjustmentType === 'percentage' ? `${rule.action.value}%` : `$${rule.action.value}`}
                {rule.action.maxAdjustment && ` (max: ${rule.action.maxAdjustment}${rule.action.adjustmentType === 'percentage' ? '%' : ''})`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product Pricing Table */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Product Pricing Analysis</h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Product</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Base Price</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Current Price</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Change</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Margin</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">vs Competitor</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {priceAnalysis.map(product => (
                <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-600">{product.category}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">${product.basePrice}</td>
                  <td className="py-3 px-4 text-right font-medium">${product.currentPrice}</td>
                  <td className="py-3 px-4 text-right">
                    <div className={`flex items-center justify-end gap-1 ${
                      product.priceChange >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {product.priceChange >= 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      {Math.abs(product.priceChange).toFixed(1)}%
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">{product.margin.toFixed(1)}%</td>
                  <td className="py-3 px-4 text-right">
                    {product.competitorGap !== 0 ? (
                      <span className={product.competitorGap > 0 ? 'text-green-600' : 'text-red-600'}>
                        {product.competitorGap > 0 ? '+' : ''}{product.competitorGap.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-gray-600">
                    <div className="flex items-center justify-end gap-1">
                      <Clock className="w-3 h-3" />
                      {product.lastUpdated.toLocaleTimeString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real-time Price Simulation */}
      <div className="bg-gray-900 rounded-xl p-6 text-white">
        <h2 className="text-xl font-semibold mb-4">Real-time Price Simulation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-3">Market Conditions</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Demand Level:</span>
                <span className="text-green-400">High</span>
              </div>
              <div className="flex justify-between">
                <span>Inventory Pressure:</span>
                <span className="text-yellow-400">Medium</span>
              </div>
              <div className="flex justify-between">
                <span>Competitor Activity:</span>
                <span className="text-blue-400">Active</span>
              </div>
              <div className="flex justify-between">
                <span>Time Period:</span>
                <span className="text-purple-400">Peak Hours</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-3">Active Rules</h3>
            <div className="space-y-2 text-sm">
              {pricingRules.filter(r => r.active).map(rule => (
                <div key={rule.id} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>{rule.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-300">
            🔄 Prices update automatically every 5 seconds based on real-time market conditions and active pricing rules.
            Current simulation shows dynamic pricing in action.
          </p>
        </div>
      </div>
    </div>
  )
}