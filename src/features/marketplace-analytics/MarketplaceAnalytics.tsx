'use client'

import { useState, useEffect, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'
import { TrendingUp, TrendingDown, Users, ShoppingCart, DollarSign, Target, Eye, Activity, Calendar, Filter } from 'lucide-react'

// Types for analytics
interface SalesMetric {
  period: string
  revenue: number
  orders: number
  customers: number
  averageOrderValue: number
}

interface VendorPerformance {
  vendorId: string
  name: string
  revenue: number
  orders: number
  rating: number
  growth: number
  marketShare: number
}

interface MarketInsight {
  id: string
  type: 'trend' | 'opportunity' | 'risk' | 'recommendation'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  confidence: number
}

interface CategoryPerformance {
  category: string
  revenue: number
  growth: number
  marketShare: number
  trend: 'up' | 'down' | 'stable'
}

export default function MarketplaceAnalytics() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Sample sales data
  const [salesData] = useState<SalesMetric[]>([
    { period: 'Jan', revenue: 45000, orders: 450, customers: 380, averageOrderValue: 100 },
    { period: 'Feb', revenue: 52000, orders: 520, customers: 420, averageOrderValue: 100 },
    { period: 'Mar', revenue: 48000, orders: 480, customers: 400, averageOrderValue: 100 },
    { period: 'Apr', revenue: 61000, orders: 610, customers: 500, averageOrderValue: 100 },
    { period: 'May', revenue: 55000, orders: 550, customers: 450, averageOrderValue: 100 },
    { period: 'Jun', revenue: 67000, orders: 670, customers: 550, averageOrderValue: 100 },
    { period: 'Jul', revenue: 72000, orders: 720, customers: 580, averageOrderValue: 100 },
    { period: 'Aug', revenue: 69000, orders: 690, customers: 560, averageOrderValue: 100 },
    { period: 'Sep', revenue: 78000, orders: 780, customers: 620, averageOrderValue: 100 },
    { period: 'Oct', revenue: 82000, orders: 820, customers: 650, averageOrderValue: 100 },
    { period: 'Nov', revenue: 95000, orders: 950, customers: 750, averageOrderValue: 100 },
    { period: 'Dec', revenue: 110000, orders: 1100, customers: 850, averageOrderValue: 100 }
  ])

  // Sample vendor performance data
  const [vendorData] = useState<VendorPerformance[]>([
    { vendorId: '1', name: 'TechCorp Solutions', revenue: 125000, orders: 1250, rating: 4.8, growth: 15.2, marketShare: 25.5 },
    { vendorId: '2', name: 'DataFlow Systems', revenue: 98000, orders: 980, rating: 4.6, growth: 8.7, marketShare: 19.8 },
    { vendorId: '3', name: 'CloudSecure Inc', revenue: 87000, orders: 870, rating: 4.9, growth: 22.1, marketShare: 17.6 },
    { vendorId: '4', name: 'AISmart Analytics', revenue: 76000, orders: 760, rating: 4.7, growth: -2.3, marketShare: 15.4 },
    { vendorId: '5', name: 'SecureNet Pro', revenue: 65000, orders: 650, rating: 4.5, growth: 5.8, marketShare: 13.2 }
  ])

  // Sample market insights
  const [marketInsights] = useState<MarketInsight[]>([
    {
      id: '1',
      type: 'trend',
      title: 'AI Software Demand Surge',
      description: 'AI-powered software products showing 45% YoY growth with enterprise customers',
      impact: 'high',
      confidence: 92
    },
    {
      id: '2',
      type: 'opportunity',
      title: 'Security Category Expansion',
      description: 'Growing demand for cloud security solutions presents 30% market opportunity',
      impact: 'high',
      confidence: 88
    },
    {
      id: '3',
      type: 'risk',
      title: 'Supply Chain Disruptions',
      description: 'Hardware category affected by global supply chain issues, 15% revenue impact',
      impact: 'medium',
      confidence: 76
    },
    {
      id: '4',
      type: 'recommendation',
      title: 'Dynamic Pricing Implementation',
      description: 'Implement AI-driven pricing could increase margins by 12-18%',
      impact: 'high',
      confidence: 95
    }
  ])

  // Category performance data
  const [categoryData] = useState<CategoryPerformance[]>([
    { category: 'Software', revenue: 285000, growth: 28.5, marketShare: 45.2, trend: 'up' },
    { category: 'Hardware', revenue: 165000, growth: 12.3, marketShare: 26.2, trend: 'up' },
    { category: 'Security', revenue: 125000, growth: 35.7, marketShare: 19.8, trend: 'up' },
    { category: 'Services', revenue: 45000, growth: -5.2, marketShare: 7.1, trend: 'down' },
    { category: 'Consulting', revenue: 15000, growth: 8.9, marketShare: 2.4, trend: 'stable' }
  ])

  // Calculate key metrics
  const keyMetrics = useMemo(() => {
    const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0)
    const totalOrders = salesData.reduce((sum, item) => sum + item.orders, 0)
    const totalCustomers = salesData.reduce((sum, item) => sum + item.customers, 0)
    const avgOrderValue = totalRevenue / totalOrders

    const lastMonth = salesData[salesData.length - 1]
    const prevMonth = salesData[salesData.length - 2]
    const revenueGrowth = ((lastMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100
    const orderGrowth = ((lastMonth.orders - prevMonth.orders) / prevMonth.orders) * 100

    return {
      totalRevenue,
      totalOrders,
      totalCustomers,
      avgOrderValue,
      revenueGrowth,
      orderGrowth
    }
  }, [salesData])

  // Chart colors
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8" />
            <div>
              <h1 className="text-3xl font-bold">Marketplace Analytics</h1>
              <p className="text-lg opacity-90">
                Comprehensive insights into sales performance, vendor analytics, and market trends
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-6 h-6 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${keyMetrics.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-green-600 font-medium">+{keyMetrics.revenueGrowth.toFixed(1)}%</span>
            <span className="text-gray-600">vs last month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{keyMetrics.totalOrders.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-green-600 font-medium">+{keyMetrics.orderGrowth.toFixed(1)}%</span>
            <span className="text-gray-600">vs last month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Active Customers</p>
              <p className="text-2xl font-bold text-gray-900">{keyMetrics.totalCustomers.toLocaleString()}</p>
            </div>
          </div>
          <div className="text-sm text-gray-600">Unique buyers</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900">${keyMetrics.avgOrderValue.toFixed(0)}</p>
            </div>
          </div>
          <div className="text-sm text-gray-600">Per transaction</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Performance */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, marketShare }) => `${category} ${marketShare}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="revenue"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vendor Performance Table */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Vendor Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Vendor</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Revenue</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Orders</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">Rating</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Growth</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Market Share</th>
              </tr>
            </thead>
            <tbody>
              {vendorData.map(vendor => (
                <tr key={vendor.vendorId} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{vendor.name}</div>
                  </td>
                  <td className="py-3 px-4 text-right">${vendor.revenue.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">{vendor.orders}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="font-medium">{vendor.rating}</span>
                      <span className="text-yellow-500">★</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className={`flex items-center justify-end gap-1 ${
                      vendor.growth >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {vendor.growth >= 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      {vendor.growth > 0 ? '+' : ''}{vendor.growth.toFixed(1)}%
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">{vendor.marketShare}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Market Insights */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Market Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {marketInsights.map(insight => (
            <div key={insight.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-3 h-3 rounded-full ${
                  insight.type === 'trend' ? 'bg-blue-400' :
                  insight.type === 'opportunity' ? 'bg-green-400' :
                  insight.type === 'risk' ? 'bg-red-400' : 'bg-purple-400'
                }`}></div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    insight.impact === 'high' ? 'bg-red-100 text-red-800' :
                    insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {insight.impact} impact
                  </span>
                  <span className="text-xs text-gray-500">{insight.confidence}% confidence</span>
                </div>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">{insight.title}</h4>
              <p className="text-sm text-gray-600">{insight.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Category Growth Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Growth Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip formatter={(value) => [`${value}%`, 'Growth']} />
            <Bar dataKey="growth" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}