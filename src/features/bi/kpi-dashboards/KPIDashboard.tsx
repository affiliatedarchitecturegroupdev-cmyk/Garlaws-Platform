'use client';

import { useState, useEffect, useCallback } from 'react';
import InteractiveChart from '../visualization/InteractiveChart';

interface KPI {
  id: string;
  name: string;
  description: string;
  category: 'financial' | 'operational' | 'customer' | 'quality' | 'growth';
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  lastUpdated: string;
  dataSource: string;
  calculation: string;
  alerts: {
    enabled: boolean;
    threshold: number;
    condition: 'above' | 'below' | 'equals';
    notificationType: 'email' | 'dashboard' | 'both';
  };
}

interface KPIDashboardProps {
  tenantId?: string;
}

export default function KPIDashboard({ tenantId = 'default' }: KPIDashboardProps) {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [filteredKpis, setFilteredKpis] = useState<KPI[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showKPICreator, setShowKPICreator] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState<KPI | null>(null);
  const [kpiHistory, setKpiHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [newKPI, setNewKPI] = useState({
    name: '',
    description: '',
    category: 'financial' as KPI['category'],
    target: 0,
    unit: '',
    dataSource: '',
    calculation: '',
    alerts: {
      enabled: false,
      threshold: 0,
      condition: 'below' as 'above' | 'below' | 'equals',
      notificationType: 'dashboard' as 'email' | 'dashboard' | 'both'
    }
  });

  useEffect(() => {
    fetchKPIs();
  }, [tenantId]);

  useEffect(() => {
    applyFilters();
  }, [kpis, selectedCategory]);

  const fetchKPIs = useCallback(async () => {
    try {
      const response = await fetch(`/api/bi?action=kpis&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setKpis(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch KPIs:', error);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  const refreshKPIValues = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('/api/bi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'refresh_kpis',
          tenantId
        })
      });

      const data = await response.json();
      if (data.success) {
        setKpis(data.data);
      }
    } catch (error) {
      console.error('Failed to refresh KPIs:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const createKPI = async () => {
    if (!newKPI.name || !newKPI.dataSource) return;

    try {
      const response = await fetch('/api/bi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_kpi',
          tenantId,
          ...newKPI
        })
      });

      const data = await response.json();
      if (data.success) {
        setKpis([...kpis, data.data]);
        setShowKPICreator(false);
        setNewKPI({
          name: '',
          description: '',
          category: 'financial',
          target: 0,
          unit: '',
          dataSource: '',
          calculation: '',
          alerts: {
            enabled: false,
            threshold: 0,
            condition: 'below',
            notificationType: 'dashboard'
          }
        });
      }
    } catch (error) {
      console.error('Failed to create KPI:', error);
    }
  };

  const fetchKPIHistory = async (kpiId: string) => {
    try {
      const response = await fetch(`/api/bi?action=kpi_history&kpiId=${kpiId}&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setKpiHistory(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch KPI history:', error);
    }
  };

  const updateKPIAlerts = async (kpiId: string, alerts: KPI['alerts']) => {
    try {
      const response = await fetch('/api/bi', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_kpi_alerts',
          tenantId,
          kpiId,
          alerts
        })
      });

      const data = await response.json();
      if (data.success) {
        setKpis(kpis.map(kpi => kpi.id === kpiId ? data.data : kpi));
      }
    } catch (error) {
      console.error('Failed to update KPI alerts:', error);
    }
  };

  const applyFilters = useCallback(() => {
    if (selectedCategory === 'all') {
      setFilteredKpis(kpis);
    } else {
      setFilteredKpis(kpis.filter(kpi => kpi.category === selectedCategory));
    }
  }, [kpis, selectedCategory]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'financial': return 'bg-green-100 text-green-800';
      case 'operational': return 'bg-blue-100 text-blue-800';
      case 'customer': return 'bg-purple-100 text-purple-800';
      case 'quality': return 'bg-yellow-100 text-yellow-800';
      case 'growth': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      default: return '→';
    }
  };

  const getProgressColor = (value: number, target: number) => {
    const percentage = (value / target) * 100;
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getAlertStatus = (kpi: KPI) => {
    if (!kpi.alerts.enabled) return null;

    const { threshold, condition } = kpi.alerts;
    const currentValue = kpi.value;

    let isTriggered = false;
    switch (condition) {
      case 'above':
        isTriggered = currentValue > threshold;
        break;
      case 'below':
        isTriggered = currentValue < threshold;
        break;
      case 'equals':
        isTriggered = Math.abs(currentValue - threshold) < 0.01;
        break;
    }

    return isTriggered ? 'alert' : 'normal';
  };

  // Prepare chart data for KPI trends
  const getKPIChartData = (history: any[]) => {
    return {
      labels: history.map(h => new Date(h.timestamp).toLocaleDateString()),
      datasets: [{
        name: 'KPI Value',
        data: history.map(h => h.value),
        color: '#3B82F6'
      }]
    };
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">KPI Monitoring Dashboard</h2>
        <div className="flex space-x-3">
          <button
            onClick={refreshKPIValues}
            disabled={refreshing}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
          >
            {refreshing ? 'Refreshing...' : 'Refresh KPIs'}
          </button>
          <button
            onClick={() => setShowKPICreator(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create KPI
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'All KPIs' },
            { value: 'financial', label: 'Financial' },
            { value: 'operational', label: 'Operational' },
            { value: 'customer', label: 'Customer' },
            { value: 'quality', label: 'Quality' },
            { value: 'growth', label: 'Growth' }
          ].map(category => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedCategory === category.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredKpis.map((kpi) => (
          <div
            key={kpi.id}
            className={`bg-white p-6 rounded-lg shadow-sm border cursor-pointer transition-all hover:shadow-md ${
              getAlertStatus(kpi) === 'alert' ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200'
            }`}
            onClick={() => {
              setSelectedKPI(kpi);
              fetchKPIHistory(kpi.id);
            }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{kpi.name}</h3>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(kpi.category)}`}>
                  {kpi.category}
                </span>
              </div>
              {getAlertStatus(kpi) === 'alert' && (
                <div className="text-red-500">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-gray-900">
                  {kpi.value.toLocaleString()} {kpi.unit}
                </span>
                <span className="text-sm text-gray-500">
                  {getTrendIcon(kpi.trend)} {Math.abs(kpi.trendValue)}%
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Target:</span>
                  <span className="font-medium">{kpi.target.toLocaleString()} {kpi.unit}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getProgressColor(kpi.value, kpi.target)}`}
                    style={{ width: `${Math.min((kpi.value / kpi.target) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 text-right">
                  {((kpi.value / kpi.target) * 100).toFixed(1)}% of target
                </div>
              </div>

              <div className="text-xs text-gray-500">
                Updated: {new Date(kpi.lastUpdated).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* KPI Detail Modal */}
      {selectedKPI && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-4/5 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">{selectedKPI.name}</h3>
              <button
                onClick={() => {
                  setSelectedKPI(null);
                  setKpiHistory([]);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-lg font-semibold mb-3">KPI Details</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Current Value</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {selectedKPI.value.toLocaleString()} {selectedKPI.unit}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Target</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedKPI.target.toLocaleString()} {selectedKPI.unit}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">Progress to Target</div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${getProgressColor(selectedKPI.value, selectedKPI.target)}`}
                        style={{ width: `${Math.min((selectedKPI.value / selectedKPI.target) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {((selectedKPI.value / selectedKPI.target) * 100).toFixed(1)}% achieved
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Trend</div>
                      <div className="text-lg">
                        {getTrendIcon(selectedKPI.trend)} {Math.abs(selectedKPI.trendValue)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Category</div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(selectedKPI.category)}`}>
                        {selectedKPI.category}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">Description</div>
                    <div className="text-sm text-gray-900 mt-1">{selectedKPI.description}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">Data Source</div>
                    <div className="text-sm text-gray-900 mt-1 font-mono bg-gray-100 p-2 rounded">
                      {selectedKPI.dataSource}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">Calculation</div>
                    <div className="text-sm text-gray-900 mt-1 font-mono bg-gray-100 p-2 rounded">
                      {selectedKPI.calculation}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-3">Alert Configuration</h4>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedKPI.alerts.enabled}
                      onChange={(e) => updateKPIAlerts(selectedKPI.id, {
                        ...selectedKPI.alerts,
                        enabled: e.target.checked
                      })}
                      className="mr-3"
                    />
                    <label className="text-sm font-medium text-gray-700">Enable Alerts</label>
                  </div>

                  {selectedKPI.alerts.enabled && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Threshold</label>
                        <input
                          type="number"
                          value={selectedKPI.alerts.threshold}
                          onChange={(e) => updateKPIAlerts(selectedKPI.id, {
                            ...selectedKPI.alerts,
                            threshold: Number(e.target.value)
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                        <select
                          value={selectedKPI.alerts.condition}
                          onChange={(e) => updateKPIAlerts(selectedKPI.id, {
                            ...selectedKPI.alerts,
                            condition: e.target.value as any
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="above">Above threshold</option>
                          <option value="below">Below threshold</option>
                          <option value="equals">Equals threshold</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notification Type</label>
                        <select
                          value={selectedKPI.alerts.notificationType}
                          onChange={(e) => updateKPIAlerts(selectedKPI.id, {
                            ...selectedKPI.alerts,
                            notificationType: e.target.value as any
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="dashboard">Dashboard only</option>
                          <option value="email">Email only</option>
                          <option value="both">Email and Dashboard</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* KPI History Chart */}
            {kpiHistory.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold mb-3">Historical Trend</h4>
                <InteractiveChart
                  title={`${selectedKPI.name} - Last 30 Days`}
                  data={getKPIChartData(kpiHistory)}
                  chartType="line"
                  height={300}
                />
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setSelectedKPI(null);
                  setKpiHistory([]);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create KPI Form */}
      {showKPICreator && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Create New KPI</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">KPI Name *</label>
              <input
                type="text"
                value={newKPI.name}
                onChange={(e) => setNewKPI({...newKPI, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={newKPI.category}
                onChange={(e) => setNewKPI({...newKPI, category: e.target.value as KPI['category']})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="financial">Financial</option>
                <option value="operational">Operational</option>
                <option value="customer">Customer</option>
                <option value="quality">Quality</option>
                <option value="growth">Growth</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={newKPI.description}
                onChange={(e) => setNewKPI({...newKPI, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Value</label>
              <input
                type="number"
                value={newKPI.target}
                onChange={(e) => setNewKPI({...newKPI, target: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <input
                type="text"
                value={newKPI.unit}
                onChange={(e) => setNewKPI({...newKPI, unit: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="%, R, units, etc."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Source *</label>
              <input
                type="text"
                value={newKPI.dataSource}
                onChange={(e) => setNewKPI({...newKPI, dataSource: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="API endpoint or data query"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Calculation Logic</label>
              <textarea
                value={newKPI.calculation}
                onChange={(e) => setNewKPI({...newKPI, calculation: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Describe how this KPI is calculated"
              />
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-md font-semibold mb-3">Alert Configuration</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Threshold</label>
                <input
                  type="number"
                  value={newKPI.alerts.threshold}
                  onChange={(e) => setNewKPI({...newKPI, alerts: {...newKPI.alerts, threshold: Number(e.target.value)}})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                <select
                  value={newKPI.alerts.condition}
                  onChange={(e) => setNewKPI({...newKPI, alerts: {...newKPI.alerts, condition: e.target.value as any}})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="above">Above</option>
                  <option value="below">Below</option>
                  <option value="equals">Equals</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notification</label>
                <select
                  value={newKPI.alerts.notificationType}
                  onChange={(e) => setNewKPI({...newKPI, alerts: {...newKPI.alerts, notificationType: e.target.value as any}})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="dashboard">Dashboard</option>
                  <option value="email">Email</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 flex space-x-3">
            <button
              onClick={createKPI}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Create KPI
            </button>
            <button
              onClick={() => setShowKPICreator(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}