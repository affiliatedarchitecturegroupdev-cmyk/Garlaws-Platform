'use client';

import { useState, useEffect } from 'react';
import InteractiveChart from '@/features/bi/visualization/InteractiveChart';
import CustomReportBuilder from '@/features/bi/reports/CustomReportBuilder';
import KPIDashboard from '@/features/bi/kpi-dashboards/KPIDashboard';
import AnalyticsEngine from '@/features/bi/analytics-engine/AnalyticsEngine';
import StatisticalAnalysis from '@/features/data-science/statistical-modeling/StatisticalAnalysis';
import MultiDimViz from '@/features/data-science/multi-dim-viz/MultiDimViz';
import DataMining from '@/features/data-science/data-mining/DataMining';
import ModelInterpretability from '@/features/data-science/model-interpretability/ModelInterpretability';
import AdvancedForecasting from '@/features/data-science/advanced-forecasting/AdvancedForecasting';

interface DashboardWidget {
  id: string;
  widgetType: 'metric' | 'chart' | 'table';
  title: string;
  data: any;
}

export default function BIDashboard() {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDashboard, setSelectedDashboard] = useState<string>('default');
  const [activeTab, setActiveTab] = useState<'overview' | 'visualization' | 'reports' | 'kpis' | 'analytics' | 'data-science'>('overview');
  const [dataScienceTab, setDataScienceTab] = useState<'overview' | 'statistical' | 'multidim' | 'mining' | 'interpretability' | 'forecasting'>('overview');

  useEffect(() => {
    fetchDashboardData();
  }, [selectedDashboard]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`/api/bi?action=dashboard_data&dashboardId=${selectedDashboard}&tenantId=default`);
      const data = await response.json();
      if (data.success) {
        setWidgets(data.data.widgets || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderWidget = (widget: DashboardWidget) => {
    switch (widget.widgetType) {
      case 'metric':
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{widget.title}</h3>
            <div className="text-3xl font-bold text-blue-600">
              {widget.data?.value?.toLocaleString() || '0'}
            </div>
            {widget.data?.trend && (
              <div className={`text-sm mt-2 ${widget.data.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {widget.data.trend === 'up' ? '↗️ Trending up' : '↘️ Trending down'}
              </div>
            )}
          </div>
        );

      case 'chart':
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{widget.title}</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <p className="text-gray-600">Chart visualization would render here</p>
                <p className="text-sm text-gray-500 mt-2">
                  Data points: {widget.data?.data?.length || 0}
                </p>
              </div>
            </div>
          </div>
        );

      case 'table':
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{widget.title}</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {widget.data?.headers?.map((header: string, index: number) => (
                      <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {widget.data?.rows?.slice(0, 5).map((row: any[], rowIndex: number) => (
                    <tr key={rowIndex}>
                      {row.map((cell: any, cellIndex: number) => (
                        <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {widget.data?.rows?.length > 5 && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Showing 5 of {widget.data.rows.length} rows
                </p>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{widget.title}</h3>
            <p className="text-gray-600">Widget type: {widget.widgetType}</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Advanced Business Intelligence</h1>
          {activeTab === 'overview' && (
            <div className="flex space-x-4">
              <select
                value={selectedDashboard}
                onChange={(e) => setSelectedDashboard(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="default">Default Dashboard</option>
                <option value="financial">Financial Overview</option>
                <option value="operational">Operational Metrics</option>
                <option value="customer">Customer Analytics</option>
              </select>
              <button
                onClick={fetchDashboardData}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Refresh
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Add Widget
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard Overview
            </button>
            <button
              onClick={() => setActiveTab('visualization')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'visualization'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Data Visualization
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'reports'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Custom Reports
            </button>
            <button
              onClick={() => setActiveTab('kpis')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'kpis'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              KPI Monitoring
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analytics Engine
            </button>
            <button
              onClick={() => setActiveTab('data-science')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'data-science'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Data Science
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {widgets.map((widget) => (
            <div key={widget.id}>
              {renderWidget(widget)}
            </div>
          ))}
        </div>

        {/* Predictive Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Predictive Analytics</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Revenue Forecast (Next Month)</span>
                <span className="text-lg font-semibold text-green-600">R 245,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Customer Churn Risk</span>
                <span className="text-lg font-semibold text-yellow-600">Low (12%)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Inventory Optimization</span>
                <span className="text-lg font-semibold text-blue-600">Suggested: +15 items</span>
              </div>
            </div>
            <button className="mt-4 w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
              Run Predictive Model
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Real-time KPIs</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Users</span>
                <span className="text-lg font-semibold text-blue-600">1,247</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">System Performance</span>
                <span className="text-lg font-semibold text-green-600">99.8%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Error Rate</span>
                <span className="text-lg font-semibold text-red-600">0.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Response Time</span>
                <span className="text-lg font-semibold text-green-600">245ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reports Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Financial Report
            </button>
            <button className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Operational Report
            </button>
            <button className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Customer Report
            </button>
            <button className="flex items-center justify-center px-4 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Compliance Report
            </button>
          </div>
        </div>
          </>
        ) : activeTab === 'visualization' ? (
          <InteractiveChart
            title="Business Intelligence Dashboard"
            data={{
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              datasets: [
                {
                  name: 'Revenue',
                  data: [4000, 3000, 2000, 2780, 1890, 2390],
                  color: '#8884d8'
                },
                {
                  name: 'Expenses',
                  data: [2400, 1398, 9800, 3908, 4800, 3800],
                  color: '#82ca9d'
                }
              ]
            }}
            chartType="line"
            height={400}
            showLegend={true}
            showGrid={true}
            interactive={true}
          />
        ) : activeTab === 'reports' ? (
          <CustomReportBuilder />
        ) : activeTab === 'kpis' ? (
          <KPIDashboard />
        ) : activeTab === 'analytics' ? (
          <AnalyticsEngine />
        ) : activeTab === 'data-science' ? (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced Data Science Platform</h2>
              <p className="text-gray-600 mb-6">
                Leverage statistical modeling, machine learning interpretability, and advanced analytics
                to gain deeper insights from your business data.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Statistical Analysis</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Hypothesis testing, regression analysis, and correlation studies
                  </p>
                  <button
                    onClick={() => setDataScienceTab('statistical')}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Explore Statistics
                  </button>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Multi-Dimensional Viz</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    3D scatter plots, parallel coordinates, and advanced visualizations
                  </p>
                  <button
                    onClick={() => setDataScienceTab('multidim')}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    Explore Visualizations
                  </button>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Data Mining</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Clustering algorithms, association rules, and anomaly detection
                  </p>
                  <button
                    onClick={() => setDataScienceTab('mining')}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Explore Mining
                  </button>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Model Interpretability</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Feature importance, SHAP values, and decision tree explanations
                  </p>
                  <button
                    onClick={() => setDataScienceTab('interpretability')}
                    className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                  >
                    Explore Interpretability
                  </button>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border border-red-200">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Advanced Forecasting</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Time series forecasting with seasonal decomposition and confidence intervals
                  </p>
                  <button
                    onClick={() => setDataScienceTab('forecasting')}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Explore Forecasting
                  </button>
                </div>
              </div>
            </div>

            {dataScienceTab === 'statistical' && (
              <StatisticalAnalysis
                data={[]} // Would be populated with actual data
                onAnalysisComplete={(results) => console.log('Statistical analysis complete:', results)}
              />
            )}

            {dataScienceTab === 'multidim' && (
              <MultiDimViz
                data={[]} // Would be populated with actual data
                onVisualizationChange={(config) => console.log('Visualization config changed:', config)}
              />
            )}

            {dataScienceTab === 'mining' && (
              <DataMining
                data={[]} // Would be populated with actual data
                onPatternsFound={(patterns) => console.log('Patterns found:', patterns)}
              />
            )}

            {dataScienceTab === 'interpretability' && (
              <ModelInterpretability
                modelResults={{}} // Would be populated with actual model results
                featureData={[]} // Would be populated with actual feature data
                onInterpretationComplete={(interpretation) => console.log('Interpretation complete:', interpretation)}
              />
            )}

            {dataScienceTab === 'forecasting' && (
              <AdvancedForecasting
                timeSeriesData={[]} // Would be populated with actual time series data
                targetColumn="value" // Would be configured based on data
                onForecastComplete={(forecast) => console.log('Forecast complete:', forecast)}
              />
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}