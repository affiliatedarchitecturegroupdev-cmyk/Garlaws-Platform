'use client'

import { useState, useEffect, useMemo } from 'react'
import { FileText, BarChart3, TrendingUp, Calendar, Download, Eye, Settings, Zap, Mail, Clock, Users, Target } from 'lucide-react'

// Types for Automated Reporting
interface ReportTemplate {
  id: string
  name: string
  description: string
  category: 'business' | 'operational' | 'financial' | 'compliance' | 'performance'
  dataSources: string[]
  schedule: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'custom'
  recipients: string[]
  format: 'pdf' | 'excel' | 'html' | 'json'
  active: boolean
  lastGenerated?: Date
  nextScheduled?: Date
}

interface ReportInstance {
  id: string
  templateId: string
  templateName: string
  generatedAt: Date
  status: 'generating' | 'completed' | 'failed'
  fileSize?: number
  downloadUrl?: string
  recipients: string[]
  metrics: {
    generationTime: number
    dataPoints: number
    visualizations: number
  }
}

interface ReportSection {
  id: string
  title: string
  type: 'text' | 'chart' | 'table' | 'kpi' | 'metric'
  data: any
  position: number
  config: {
    width?: number
    height?: number
    refresh?: boolean
    filters?: Record<string, any>
  }
}

interface ReportAnalytics {
  totalReports: number
  automatedReports: number
  manualReports: number
  avgGenerationTime: number
  deliverySuccessRate: number
  popularFormats: { format: string; count: number }[]
  topRecipients: { email: string; reports: number }[]
}

export default function AutomatedReporting() {
  // Sample report templates
  const [reportTemplates] = useState<ReportTemplate[]>([
    {
      id: 'template-001',
      name: 'Daily Sales Performance',
      description: 'Comprehensive daily sales metrics and KPIs',
      category: 'business',
      dataSources: ['sales_db', 'customer_crm', 'inventory_system'],
      schedule: 'daily',
      recipients: ['sales@company.com', 'management@company.com'],
      format: 'pdf',
      active: true,
      lastGenerated: new Date(Date.now() - 2 * 60 * 60 * 1000),
      nextScheduled: new Date(Date.now() + 22 * 60 * 60 * 1000)
    },
    {
      id: 'template-002',
      name: 'Weekly Financial Summary',
      description: 'Financial performance metrics and budget analysis',
      category: 'financial',
      dataSources: ['accounting_system', 'budget_db', 'expense_tracker'],
      schedule: 'weekly',
      recipients: ['finance@company.com', 'cfo@company.com'],
      format: 'excel',
      active: true,
      lastGenerated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      nextScheduled: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'template-003',
      name: 'Monthly Operational Dashboard',
      description: 'Operational efficiency metrics and process performance',
      category: 'operational',
      dataSources: ['operations_db', 'quality_system', 'resource_planner'],
      schedule: 'monthly',
      recipients: ['operations@company.com', 'management@company.com'],
      format: 'html',
      active: true,
      lastGenerated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      nextScheduled: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'template-004',
      name: 'Compliance Monitoring Report',
      description: 'Regulatory compliance status and audit trail',
      category: 'compliance',
      dataSources: ['compliance_db', 'audit_logs', 'policy_system'],
      schedule: 'quarterly',
      recipients: ['compliance@company.com', 'legal@company.com'],
      format: 'pdf',
      active: true,
      lastGenerated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      nextScheduled: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'template-005',
      name: 'IT Performance Dashboard',
      description: 'System performance metrics and uptime analysis',
      category: 'performance',
      dataSources: ['monitoring_system', 'logs_db', 'performance_metrics'],
      schedule: 'weekly',
      recipients: ['it@company.com', 'management@company.com'],
      format: 'html',
      active: false,
      lastGenerated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    }
  ])

  // Sample report instances
  const [reportInstances] = useState<ReportInstance[]>([
    {
      id: 'report-001',
      templateId: 'template-001',
      templateName: 'Daily Sales Performance',
      generatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'completed',
      fileSize: 2457600, // 2.4MB
      downloadUrl: '/reports/daily-sales-2024-01-15.pdf',
      recipients: ['sales@company.com', 'management@company.com'],
      metrics: {
        generationTime: 45,
        dataPoints: 12500,
        visualizations: 8
      }
    },
    {
      id: 'report-002',
      templateId: 'template-002',
      templateName: 'Weekly Financial Summary',
      generatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: 'completed',
      fileSize: 1843200, // 1.8MB
      downloadUrl: '/reports/weekly-financial-2024-w03.xlsx',
      recipients: ['finance@company.com', 'cfo@company.com'],
      metrics: {
        generationTime: 120,
        dataPoints: 25000,
        visualizations: 12
      }
    },
    {
      id: 'report-003',
      templateId: 'template-003',
      templateName: 'Monthly Operational Dashboard',
      generatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: 'failed',
      recipients: ['operations@company.com', 'management@company.com'],
      metrics: {
        generationTime: 0,
        dataPoints: 0,
        visualizations: 0
      }
    }
  ])

  // Report analytics
  const [reportAnalytics] = useState<ReportAnalytics>({
    totalReports: 1247,
    automatedReports: 1156,
    manualReports: 91,
    avgGenerationTime: 67,
    deliverySuccessRate: 98.7,
    popularFormats: [
      { format: 'PDF', count: 623 },
      { format: 'HTML', count: 421 },
      { format: 'Excel', count: 203 }
    ],
    topRecipients: [
      { email: 'management@company.com', reports: 892 },
      { email: 'sales@company.com', reports: 654 },
      { email: 'finance@company.com', reports: 423 }
    ]
  })

  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')

  // Filtered templates
  const filteredTemplates = useMemo(() => {
    if (filterCategory === 'all') return reportTemplates
    return reportTemplates.filter(template => template.category === filterCategory)
  }, [reportTemplates, filterCategory])

  const getCategoryColor = (category: ReportTemplate['category']) => {
    switch (category) {
      case 'business': return 'bg-blue-100 text-blue-800'
      case 'operational': return 'bg-green-100 text-green-800'
      case 'financial': return 'bg-purple-100 text-purple-800'
      case 'compliance': return 'bg-red-100 text-red-800'
      case 'performance': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: ReportInstance['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'generating': return 'bg-blue-100 text-blue-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold">Automated Reporting System</h1>
            <p className="text-lg opacity-90">
              Intelligent report generation, scheduling, and automated distribution
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">{reportAnalytics.totalReports.toLocaleString()}</p>
            </div>
          </div>
          <div className="text-sm text-blue-600 font-medium">This month</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Automated</p>
              <p className="text-2xl font-bold text-gray-900">{reportAnalytics.automatedReports}</p>
            </div>
          </div>
          <div className="text-sm text-green-600 font-medium">
            {((reportAnalytics.automatedReports / reportAnalytics.totalReports) * 100).toFixed(1)}% of total
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Avg Generation</p>
              <p className="text-2xl font-bold text-gray-900">{reportAnalytics.avgGenerationTime}s</p>
            </div>
          </div>
          <div className="text-sm text-purple-600 font-medium">Processing time</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Delivery Success</p>
              <p className="text-2xl font-bold text-gray-900">{reportAnalytics.deliverySuccessRate}%</p>
            </div>
          </div>
          <div className="text-sm text-orange-600 font-medium">Reliability</div>
        </div>
      </div>

      {/* Report Templates */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Report Templates</h2>
          <div className="flex items-center gap-4">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="business">Business</option>
              <option value="operational">Operational</option>
              <option value="financial">Financial</option>
              <option value="compliance">Compliance</option>
              <option value="performance">Performance</option>
            </select>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <FileText className="w-4 h-4" />
              New Template
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredTemplates.map(template => (
            <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${template.active ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                  <div>
                    <h3 className="font-medium text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}>
                    {template.category}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    template.schedule === 'daily' ? 'bg-blue-100 text-blue-800' :
                    template.schedule === 'weekly' ? 'bg-green-100 text-green-800' :
                    template.schedule === 'monthly' ? 'bg-purple-100 text-purple-800' :
                    template.schedule === 'quarterly' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {template.schedule}
                  </span>
                  <button
                    onClick={() => setSelectedTemplate(template)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Configure
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Format</div>
                  <div className="font-medium uppercase">{template.format}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Recipients</div>
                  <div className="font-medium">{template.recipients.length}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Data Sources</div>
                  <div className="font-medium">{template.dataSources.length}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Last Generated</div>
                  <div className="font-medium text-sm">
                    {template.lastGenerated?.toLocaleDateString() || 'Never'}
                  </div>
                </div>
              </div>

              {template.nextScheduled && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Next scheduled: {template.nextScheduled.toLocaleString()}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Report Instances</h2>
        <div className="space-y-3">
          {reportInstances.map(instance => (
            <div key={instance.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-gray-900">{instance.templateName}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(instance.status)}`}>
                    {instance.status}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Generated</div>
                  <div className="font-medium">{instance.generatedAt.toLocaleString()}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                <div>
                  <div className="text-sm text-gray-600">File Size</div>
                  <div className="font-medium">{instance.fileSize ? formatFileSize(instance.fileSize) : 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Generation Time</div>
                  <div className="font-medium">{instance.metrics.generationTime}s</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Data Points</div>
                  <div className="font-medium">{instance.metrics.dataPoints.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Recipients</div>
                  <div className="font-medium">{instance.recipients.length}</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <BarChart3 className="w-4 h-4" />
                    <span>{instance.metrics.visualizations} visualizations</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    <span>{instance.recipients.join(', ')}</span>
                  </div>
                </div>
                {instance.downloadUrl && instance.status === 'completed' && (
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    Download
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Formats</h3>
          <div className="space-y-3">
            {reportAnalytics.popularFormats.map((format, index) => (
              <div key={format.format} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-sm font-medium text-blue-800">
                    {index + 1}
                  </div>
                  <span className="font-medium">{format.format}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{format.count}</div>
                  <div className="text-sm text-gray-500">reports</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Recipients</h3>
          <div className="space-y-3">
            {reportAnalytics.topRecipients.map((recipient, index) => (
              <div key={recipient.email} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-sm font-medium text-green-800">
                    {index + 1}
                  </div>
                  <span className="font-medium text-sm">{recipient.email}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{recipient.reports}</div>
                  <div className="text-sm text-gray-500">reports</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Template Configuration Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Template Configuration</h3>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
                  <input
                    type="text"
                    value={selectedTemplate.name}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedTemplate.category}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="business">Business</option>
                    <option value="operational">Operational</option>
                    <option value="financial">Financial</option>
                    <option value="compliance">Compliance</option>
                    <option value="performance">Performance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Schedule</label>
                <select
                  value={selectedTemplate.schedule}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
                <div className="space-y-2">
                  {selectedTemplate.recipients.map((recipient, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{recipient}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Sources</label>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.dataSources.map((source, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      {source}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedTemplate.active}
                    className="rounded"
                  />
                  <label className="text-sm font-medium text-gray-700">Active</label>
                </div>
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">
                    Cancel
                  </button>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}