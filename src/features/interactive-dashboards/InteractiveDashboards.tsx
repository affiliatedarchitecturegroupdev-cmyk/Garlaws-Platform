'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { BarChart3, LineChart, PieChart, Activity, TrendingUp, TrendingDown, Eye, Settings, Plus, Minus, Move, RotateCcw, Download, Share, Zap } from 'lucide-react'

// Types for Interactive Dashboards
interface Dashboard {
  id: string
  name: string
  description: string
  category: 'business' | 'technical' | 'operational' | 'executive' | 'custom'
  widgets: DashboardWidget[]
  layout: DashboardLayout
  permissions: {
    view: string[]
    edit: string[]
    share: string[]
  }
  settings: {
    refreshInterval: number
    theme: 'light' | 'dark' | 'auto'
    autoSave: boolean
    realTimeUpdates: boolean
  }
  createdAt: Date
  lastModified: Date
  usage: {
    views: number
    interactions: number
    avgLoadTime: number
  }
}

interface DashboardWidget {
  id: string
  type: 'chart' | 'metric' | 'table' | 'text' | 'image' | 'map' | 'gauge' | 'progress'
  title: string
  position: { x: number; y: number; width: number; height: number }
  data: WidgetData
  config: WidgetConfig
  interactions: WidgetInteraction[]
  realTime: boolean
  refreshRate?: number
}

interface WidgetData {
  source: string
  query: string
  parameters: Record<string, any>
  transformation?: string
  cache?: {
    enabled: boolean
    ttl: number
    lastUpdated?: Date
  }
}

interface WidgetConfig {
  chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter'
  colors?: string[]
  showLegend?: boolean
  showGrid?: boolean
  animations?: boolean
  responsive?: boolean
  thresholds?: Array<{
    value: number
    color: string
    label: string
  }>
}

interface WidgetInteraction {
  type: 'click' | 'hover' | 'drag' | 'zoom' | 'filter'
  action: 'drilldown' | 'filter' | 'navigate' | 'export' | 'share'
  target?: string
  parameters?: Record<string, any>
}

interface DashboardLayout {
  columns: number
  rows: number
  gap: number
  responsive: boolean
  breakpoints: Record<string, { columns: number; gap: number }>
}

interface DataStream {
  id: string
  name: string
  type: 'realtime' | 'batch' | 'event'
  source: string
  frequency: number
  lastUpdate: Date
  status: 'active' | 'inactive' | 'error'
  metrics: {
    eventsPerSecond: number
    dataPoints: number
    latency: number
  }
}

interface VisualizationTemplate {
  id: string
  name: string
  category: string
  thumbnail: string
  widgets: Omit<DashboardWidget, 'id' | 'position'>[]
  description: string
  tags: string[]
  usage: number
}

export default function InteractiveDashboards() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Sample dashboards
  const [dashboards] = useState<Dashboard[]>([
    {
      id: 'dashboard-001',
      name: 'Executive Overview',
      description: 'High-level business metrics and KPIs for executive decision making',
      category: 'executive',
      widgets: [],
      layout: {
        columns: 4,
        rows: 3,
        gap: 16,
        responsive: true,
        breakpoints: {
          mobile: { columns: 2, gap: 8 },
          tablet: { columns: 3, gap: 12 }
        }
      },
      permissions: {
        view: ['executives', 'managers'],
        edit: ['admin'],
        share: ['executives']
      },
      settings: {
        refreshInterval: 300,
        theme: 'light',
        autoSave: true,
        realTimeUpdates: true
      },
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      lastModified: new Date(Date.now() - 2 * 60 * 60 * 1000),
      usage: {
        views: 1250,
        interactions: 890,
        avgLoadTime: 1.2
      }
    },
    {
      id: 'dashboard-002',
      name: 'Technical Performance',
      description: 'System performance metrics, uptime, and technical KPIs',
      category: 'technical',
      widgets: [],
      layout: {
        columns: 3,
        rows: 4,
        gap: 20,
        responsive: true,
        breakpoints: {
          mobile: { columns: 1, gap: 10 },
          tablet: { columns: 2, gap: 15 }
        }
      },
      permissions: {
        view: ['developers', 'devops', 'managers'],
        edit: ['devops'],
        share: ['managers']
      },
      settings: {
        refreshInterval: 60,
        theme: 'dark',
        autoSave: true,
        realTimeUpdates: true
      },
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      lastModified: new Date(Date.now() - 30 * 60 * 1000),
      usage: {
        views: 2100,
        interactions: 1450,
        avgLoadTime: 0.8
      }
    },
    {
      id: 'dashboard-003',
      name: 'Sales Analytics',
      description: 'Comprehensive sales performance and revenue analytics',
      category: 'business',
      widgets: [],
      layout: {
        columns: 4,
        rows: 2,
        gap: 18,
        responsive: true,
        breakpoints: {
          mobile: { columns: 2, gap: 12 },
          tablet: { columns: 3, gap: 15 }
        }
      },
      permissions: {
        view: ['sales', 'marketing', 'executives'],
        edit: ['sales_managers'],
        share: ['sales', 'executives']
      },
      settings: {
        refreshInterval: 600,
        theme: 'light',
        autoSave: true,
        realTimeUpdates: false
      },
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      lastModified: new Date(Date.now() - 4 * 60 * 60 * 1000),
      usage: {
        views: 890,
        interactions: 567,
        avgLoadTime: 1.5
      }
    }
  ])

  // Sample widgets
  const [availableWidgets] = useState<DashboardWidget[]>([
    {
      id: 'widget-001',
      type: 'metric',
      title: 'Total Revenue',
      position: { x: 0, y: 0, width: 1, height: 1 },
      data: {
        source: 'sales_db',
        query: 'SELECT SUM(amount) FROM transactions WHERE date >= ?',
        parameters: { date: '2024-01-01' }
      },
      config: {
        thresholds: [
          { value: 100000, color: 'green', label: 'Excellent' },
          { value: 50000, color: 'yellow', label: 'Good' },
          { value: 0, color: 'red', label: 'Poor' }
        ]
      },
      interactions: [
        { type: 'click', action: 'drilldown', target: 'revenue-details' }
      ],
      realTime: true,
      refreshRate: 300
    },
    {
      id: 'widget-002',
      type: 'chart',
      title: 'Sales Trend',
      position: { x: 1, y: 0, width: 2, height: 1 },
      data: {
        source: 'sales_db',
        query: 'SELECT date, SUM(amount) FROM transactions GROUP BY date ORDER BY date',
        parameters: {}
      },
      config: {
        chartType: 'line',
        colors: ['#3B82F6', '#10B981'],
        showLegend: true,
        showGrid: true,
        animations: true
      },
      interactions: [
        { type: 'hover', action: 'filter', parameters: { field: 'date' } },
        { type: 'zoom', action: 'drilldown' }
      ],
      realTime: false
    },
    {
      id: 'widget-003',
      type: 'table',
      title: 'Top Products',
      position: { x: 0, y: 1, width: 2, height: 1 },
      data: {
        source: 'products_db',
        query: 'SELECT name, sales, revenue FROM products ORDER BY revenue DESC LIMIT 10',
        parameters: {}
      },
      config: {
        responsive: true
      },
      interactions: [
        { type: 'click', action: 'navigate', target: 'product-details' }
      ],
      realTime: true,
      refreshRate: 600
    },
    {
      id: 'widget-004',
      type: 'gauge',
      title: 'System Uptime',
      position: { x: 3, y: 0, width: 1, height: 1 },
      data: {
        source: 'monitoring_system',
        query: 'SELECT uptime_percentage FROM system_metrics ORDER BY timestamp DESC LIMIT 1',
        parameters: {}
      },
      config: {
        colors: ['#EF4444', '#F59E0B', '#10B981'],
        thresholds: [
          { value: 99.9, color: 'green', label: 'Excellent' },
          { value: 99.0, color: 'yellow', label: 'Good' },
          { value: 95.0, color: 'red', label: 'Poor' }
        ]
      },
      interactions: [
        { type: 'click', action: 'drilldown', target: 'system-details' }
      ],
      realTime: true,
      refreshRate: 60
    }
  ])

  // Sample data streams
  const [dataStreams] = useState<DataStream[]>([
    {
      id: 'stream-001',
      name: 'Real-time Sales',
      type: 'realtime',
      source: 'sales_api',
      frequency: 10,
      lastUpdate: new Date(Date.now() - 5 * 1000),
      status: 'active',
      metrics: {
        eventsPerSecond: 25,
        dataPoints: 150000,
        latency: 45
      }
    },
    {
      id: 'stream-002',
      name: 'System Metrics',
      type: 'realtime',
      source: 'monitoring_api',
      frequency: 5,
      lastUpdate: new Date(Date.now() - 2 * 1000),
      status: 'active',
      metrics: {
        eventsPerSecond: 50,
        dataPoints: 300000,
        latency: 12
      }
    },
    {
      id: 'stream-003',
      name: 'User Analytics',
      type: 'batch',
      source: 'analytics_db',
      frequency: 3600,
      lastUpdate: new Date(Date.now() - 30 * 60 * 1000),
      status: 'active',
      metrics: {
        eventsPerSecond: 0,
        dataPoints: 5000000,
        latency: 300
      }
    }
  ])

  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>([])
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null)

  // Calculate dashboard metrics
  const dashboardMetrics = useMemo(() => {
    const totalDashboards = dashboards.length
    const activeDashboards = dashboards.filter(d => d.settings.realTimeUpdates).length
    const totalViews = dashboards.reduce((sum, d) => sum + d.usage.views, 0)
    const totalInteractions = dashboards.reduce((sum, d) => sum + d.usage.interactions, 0)
    const avgLoadTime = dashboards.reduce((sum, d) => sum + d.usage.avgLoadTime, 0) / totalDashboards

    const categoryUsage = dashboards.reduce((acc, d) => {
      acc[d.category] = (acc[d.category] || 0) + d.usage.views
      return acc
    }, {} as Record<string, number>)

    return {
      totalDashboards,
      activeDashboards,
      totalViews,
      totalInteractions,
      avgLoadTime,
      categoryUsage
    }
  }, [dashboards])

  // Canvas rendering for dashboard preview
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !selectedDashboard) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw dashboard grid
    const gridSize = 50
    ctx.strokeStyle = '#E5E7EB'
    ctx.lineWidth = 1

    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }

    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Draw widgets
    availableWidgets.forEach(widget => {
      const x = widget.position.x * gridSize + 10
      const y = widget.position.y * gridSize + 10
      const width = widget.position.width * gridSize - 20
      const height = widget.position.height * gridSize - 20

      // Widget background
      ctx.fillStyle = selectedWidgets.includes(widget.id) ? '#DBEAFE' : '#F9FAFB'
      ctx.fillRect(x, y, width, height)

      // Widget border
      ctx.strokeStyle = selectedWidgets.includes(widget.id) ? '#3B82F6' : '#D1D5DB'
      ctx.lineWidth = selectedWidgets.includes(widget.id) ? 2 : 1
      ctx.strokeRect(x, y, width, height)

      // Widget title
      ctx.fillStyle = '#111827'
      ctx.font = '12px Arial'
      ctx.fillText(widget.title, x + 10, y + 25)

      // Widget type icon
      const icon = getWidgetIcon(widget.type)
      ctx.fillStyle = '#6B7280'
      ctx.font = '16px Arial'
      ctx.fillText(icon, x + width - 30, y + 25)
    })
  }, [selectedDashboard, availableWidgets, selectedWidgets])

  const getWidgetIcon = (type: DashboardWidget['type']) => {
    switch (type) {
      case 'chart': return '📊'
      case 'metric': return '📈'
      case 'table': return '📋'
      case 'gauge': return '🎯'
      case 'progress': return '📊'
      case 'text': return '📝'
      case 'image': return '🖼️'
      case 'map': return '🗺️'
      default: return '📦'
    }
  }

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEditMode || !selectedDashboard) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (event.clientX - rect.left) / zoom
    const y = (event.clientY - rect.top) / zoom

    const gridSize = 50
    const gridX = Math.floor(x / gridSize)
    const gridY = Math.floor(y / gridSize)

    // Check if clicked on a widget
    const clickedWidget = availableWidgets.find(widget =>
      gridX >= widget.position.x && gridX < widget.position.x + widget.position.width &&
      gridY >= widget.position.y && gridY < widget.position.y + widget.position.height
    )

    if (clickedWidget) {
      setSelectedWidgets(prev =>
        prev.includes(clickedWidget.id)
          ? prev.filter(id => id !== clickedWidget.id)
          : [...prev, clickedWidget.id]
      )
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8" />
            <div>
              <h1 className="text-3xl font-bold">Interactive Dashboards</h1>
              <p className="text-lg opacity-90">
                Advanced data visualization with real-time interactions and customizable layouts
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isEditMode ? 'bg-green-400' : 'bg-gray-400'}`}></div>
              <span className="text-sm">{isEditMode ? 'Edit Mode' : 'View Mode'}</span>
            </div>
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isEditMode
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isEditMode ? 'Exit Edit' : 'Edit Dashboard'}
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Eye className="w-6 h-6 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Dashboards</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardMetrics.totalDashboards}</p>
            </div>
          </div>
          <div className="text-sm text-blue-600 font-medium">Active and configured</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-6 h-6 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardMetrics.totalViews.toLocaleString()}</p>
            </div>
          </div>
          <div className="text-sm text-green-600 font-medium">This month</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Avg Load Time</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardMetrics.avgLoadTime.toFixed(1)}s</p>
            </div>
          </div>
          <div className="text-sm text-purple-600 font-medium">Performance optimized</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Real-time Dashboards</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardMetrics.activeDashboards}</p>
            </div>
          </div>
          <div className="text-sm text-orange-600 font-medium">Live data enabled</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dashboard List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Dashboards</h3>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1">
              <Plus className="w-3 h-3" />
              New
            </button>
          </div>

          <div className="space-y-3">
            {dashboards.map(dashboard => (
              <div
                key={dashboard.id}
                onClick={() => setSelectedDashboard(dashboard)}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedDashboard?.id === dashboard.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{dashboard.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    dashboard.category === 'executive' ? 'bg-purple-100 text-purple-800' :
                    dashboard.category === 'technical' ? 'bg-blue-100 text-blue-800' :
                    dashboard.category === 'business' ? 'bg-green-100 text-green-800' :
                    dashboard.category === 'operational' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {dashboard.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{dashboard.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{dashboard.usage.views} views</span>
                  <span>{dashboard.widgets.length} widgets</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard Canvas */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedDashboard ? selectedDashboard.name : 'Dashboard Canvas'}
            </h3>
            {isEditMode && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoom(Math.min(zoom + 0.1, 2))}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium">{Math.round(zoom * 100)}%</span>
                <button
                  onClick={() => setZoom(Math.max(zoom - 0.1, 0.5))}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {selectedDashboard ? (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <canvas
                ref={canvasRef}
                width={600}
                height={400}
                className="w-full h-64 bg-gray-50"
                onClick={handleCanvasClick}
                style={{ cursor: isEditMode ? 'crosshair' : 'default' }}
              />
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg flex items-center justify-center h-64 bg-gray-50">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Select a dashboard to view</p>
              </div>
            </div>
          )}

          {isEditMode && selectedDashboard && (
            <div className="mt-4 flex items-center gap-4">
              <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm flex items-center gap-2">
                <Download className="w-3 h-3" />
                Export
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm flex items-center gap-2">
                <Share className="w-3 h-3" />
                Share
              </button>
              <button className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm flex items-center gap-2">
                <Settings className="w-3 h-3" />
                Settings
              </button>
            </div>
          )}
        </div>

        {/* Widget Library */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Widget Library</h3>

          <div className="space-y-3">
            {availableWidgets.map(widget => (
              <div
                key={widget.id}
                className={`p-3 border rounded-lg transition-colors ${
                  selectedWidgets.includes(widget.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg">{getWidgetIcon(widget.type)}</span>
                  <div>
                    <div className="font-medium text-gray-900">{widget.title}</div>
                    <div className="text-sm text-gray-600 capitalize">{widget.type}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <span>Size: {widget.position.width}x{widget.position.height}</span>
                  {widget.realTime && <span className="text-green-600">• Real-time</span>}
                </div>

                {isEditMode && (
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs">
                    Add to Dashboard
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Data Streams */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Data Streams</h4>
            <div className="space-y-2">
              {dataStreams.map(stream => (
                <div key={stream.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      stream.status === 'active' ? 'bg-green-400' :
                      stream.status === 'inactive' ? 'bg-gray-400' : 'bg-red-400'
                    }`}></div>
                    <span className="text-gray-900">{stream.name}</span>
                  </div>
                  <span className="text-gray-500">{stream.metrics.eventsPerSecond}/s</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Performance */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dashboard Performance</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Category Usage</h4>
            <div className="space-y-2">
              {Object.entries(dashboardMetrics.categoryUsage).map(([category, views]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-gray-600 capitalize">{category}</span>
                  <span className="font-medium">{views.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Top Performing Dashboards</h4>
            <div className="space-y-2">
              {dashboards
                .sort((a, b) => b.usage.views - a.usage.views)
                .slice(0, 3)
                .map(dashboard => (
                  <div key={dashboard.id} className="flex items-center justify-between">
                    <span className="text-gray-600 truncate">{dashboard.name}</span>
                    <span className="font-medium">{dashboard.usage.views}</span>
                  </div>
                ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Real-time Metrics</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Active Streams</span>
                <span className="font-medium text-green-600">
                  {dataStreams.filter(s => s.status === 'active').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Events/sec</span>
                <span className="font-medium">
                  {dataStreams.reduce((sum, s) => sum + s.metrics.eventsPerSecond, 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Avg Latency</span>
                <span className="font-medium">
                  {Math.round(dataStreams.reduce((sum, s) => sum + s.metrics.latency, 0) / dataStreams.length)}ms
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}