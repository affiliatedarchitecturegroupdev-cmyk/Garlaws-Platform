'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Metric {
  name: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  period: string;
}

interface Report {
  id: string;
  name: string;
  type: 'executive' | 'operational' | 'financial' | 'custom';
  lastGenerated: string;
  status: 'ready' | 'generating' | 'scheduled';
  schedule?: string;
}

const metrics: Metric[] = [
  { name: 'Revenue', value: '$2.4M', change: 12.5, trend: 'up', period: 'vs last month' },
  { name: 'Properties Managed', value: '1,247', change: 8.3, trend: 'up', period: 'vs last month' },
  { name: 'Occupancy Rate', value: '94.2%', change: -1.2, trend: 'down', period: 'vs last month' },
  { name: 'Maintenance Cost', value: '$127K', change: 5.7, trend: 'up', period: 'vs last month' },
  { name: 'Customer Satisfaction', value: '4.8/5', change: 0.2, trend: 'up', period: 'vs last month' },
  { name: 'ROI', value: '18.4%', change: 3.1, trend: 'up', period: 'vs last quarter' }
];

const reports: Report[] = [
  { id: 'rpt_001', name: 'Executive Summary', type: 'executive', lastGenerated: '2026-04-21', status: 'ready' },
  { id: 'rpt_002', name: 'Financial Performance', type: 'financial', lastGenerated: '2026-04-20', status: 'ready' },
  { id: 'rpt_003', name: 'Operational Metrics', type: 'operational', lastGenerated: '2026-04-19', status: 'ready' },
  { id: 'rpt_004', name: 'Property Portfolio Analysis', type: 'custom', lastGenerated: '2026-04-18', status: 'ready' },
  { id: 'rpt_005', name: 'Market Intelligence', type: 'custom', lastGenerated: '2026-04-17', status: 'scheduled', schedule: 'Weekly' }
];

export default function AdvancedAnalyticsSuite() {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = async (report: Report) => {
    setIsGenerating(true);
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsGenerating(false);
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      default: return '→';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">Garlaws</span>
            </Link>

            <div className="flex items-center gap-8">
              <Link href="/analytics" className="text-gray-600 hover:text-gray-900">Analytics</Link>
              <Link href="/reports" className="text-gray-600 hover:text-gray-900">Reports</Link>
              <Link href="/bi" className="text-gray-600 hover:text-gray-900">Business Intelligence</Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Advanced Analytics Suite</h1>
          <p className="text-gray-600">Enterprise-grade reporting and business intelligence</p>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <span className="text-sm text-gray-600">Time Period:</span>
          {['7d', '30d', '90d', '1y'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period as any)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                selectedPeriod === period
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {period === '7d' ? '7 Days' :
               period === '30d' ? '30 Days' :
               period === '90d' ? '90 Days' : '1 Year'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {metrics.map((metric) => (
            <div key={metric.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">{metric.name}</h3>
                <span className={`text-sm font-medium ${getTrendColor(metric.trend)}`}>
                  {getTrendIcon(metric.trend)} {Math.abs(metric.change)}%
                </span>
              </div>

              <div className="mb-2">
                <span className="text-3xl font-bold text-gray-900">{metric.value}</span>
              </div>

              <p className="text-xs text-gray-500">{metric.period}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Overview</h2>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Portfolio Performance</span>
                    <span className="text-sm text-green-600">+15.3%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-green-500 h-3 rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Operational Efficiency</span>
                    <span className="text-sm text-blue-600">+8.7%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-blue-500 h-3 rounded-full" style={{ width: '78%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Customer Satisfaction</span>
                    <span className="text-sm text-green-600">+4.2%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-green-500 h-3 rounded-full" style={{ width: '92%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Predictive Insights</h2>

              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-blue-600">🔮</span>
                    <span className="font-medium text-blue-900">Revenue Forecast</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Expected 18% revenue growth next quarter based on current market trends and occupancy rates.
                  </p>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-yellow-600">⚠️</span>
                    <span className="font-medium text-yellow-900">Maintenance Alert</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    3 properties showing increased maintenance costs. Preventive action recommended.
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-green-600">📈</span>
                    <span className="font-medium text-green-900">Market Opportunity</span>
                  </div>
                  <p className="text-sm text-green-700">
                    New market segment identified with 23% higher rental yields.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Automated Reports</h2>

              <div className="space-y-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer"
                    onClick={() => setSelectedReport(report)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900 text-sm">{report.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        report.type === 'executive' ? 'bg-purple-100 text-purple-800' :
                        report.type === 'financial' ? 'bg-green-100 text-green-800' :
                        report.type === 'operational' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {report.type}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>Last generated: {report.lastGenerated}</span>
                      {report.schedule && (
                        <span className="text-blue-600">📅 {report.schedule}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700">
                Generate New Report
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Quality Score</h2>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Completeness</span>
                    <span className="text-gray-900">98.7%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '98.7%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Accuracy</span>
                    <span className="text-gray-900">96.3%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '96.3%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Timeliness</span>
                    <span className="text-gray-900">94.8%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '94.8%' }} />
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  Overall data quality: <span className="font-bold">96.6%</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{selectedReport.name}</h3>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Report Type</p>
                    <p className="font-medium text-gray-900 capitalize">{selectedReport.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Generated</p>
                    <p className="font-medium text-gray-900">{selectedReport.lastGenerated}</p>
                  </div>
                  {selectedReport.schedule && (
                    <div>
                      <p className="text-sm text-gray-600">Schedule</p>
                      <p className="font-medium text-gray-900">{selectedReport.schedule}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => generateReport(selectedReport)}
                    disabled={isGenerating}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? 'Generating...' : 'Generate Report'}
                  </button>
                  <button className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300">
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}