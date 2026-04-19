'use client';

import { useState, useEffect } from 'react';

interface IntegrationHealth {
  totalIntegrations: number;
  connected: number;
  errors: number;
  activeWebhooks: number;
  last24hSyncs: number;
}

interface ApiAnalytics {
  totalRequests: number;
  avgResponseTime: number;
  successRate: number;
  errorRate: number;
  topEndpoints: Array<{ endpoint: string; count: number }>;
}

export default function IntegrationsDashboard() {
  const [health, setHealth] = useState<IntegrationHealth | null>(null);
  const [analytics, setAnalytics] = useState<ApiAnalytics | null>(null);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [healthRes, analyticsRes, intRes, whRes] = await Promise.all([
        fetch('/api/integrations?action=integration_health&tenantId=default'),
        fetch('/api/integrations?action=api_analytics&tenantId=default'),
        fetch('/api/integrations?action=integrations&tenantId=default'),
        fetch('/api/integrations?action=webhooks&tenantId=default')
      ]);

      const healthData = await healthRes.json();
      const analyticsData = await analyticsRes.json();
      const intData = await intRes.json();
      const whData = await whRes.json();

      if (healthData.success) setHealth(healthData.data);
      if (analyticsData.success) setAnalytics(analyticsData.data);
      if (intData.success) setIntegrations(intData.data);
      if (whData.success) setWebhooks(whData.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIntegration = async () => {
    const response = await fetch('/api/integrations?action=create_integration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'QuickBooks Integration',
        provider: 'quickbooks',
        type: 'oauth',
        tenantId: 'default',
        createdBy: 'system'
      })
    });
    if (response.ok) {
      fetchData();
      alert('Integration created successfully!');
    }
  };

  const handleCreateWebhook = async () => {
    const response = await fetch('/api/integrations?action=create_webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Order Webhook',
        url: 'https://your-api.com/webhooks/orders',
        events: ['order.created', 'order.updated'],
        tenantId: 'default'
      })
    });
    if (response.ok) {
      fetchData();
      alert('Webhook created successfully!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Integration & API Management</h1>
          <div className="flex space-x-4">
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={handleCreateIntegration}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Integration
            </button>
            <button
              onClick={handleCreateWebhook}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Add Webhook
            </button>
          </div>
        </div>

        {/* Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Integrations</p>
                <p className="text-2xl font-bold text-blue-600">{health?.totalIntegrations || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Connected</p>
                <p className="text-2xl font-bold text-green-600">{health?.connected || 0}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Webhooks</p>
                <p className="text-2xl font-bold text-purple-600">{health?.activeWebhooks || 0}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">API Success Rate</p>
                <p className="text-2xl font-bold text-green-600">{analytics?.successRate?.toFixed(1) || 0}%</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* API Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">API Performance</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Requests</span>
                <span className="font-medium">{analytics?.totalRequests.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Response Time</span>
                <span className="font-medium">{analytics?.avgResponseTime?.toFixed(0) || 0}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Success Rate</span>
                <span className="font-medium text-green-600">{analytics?.successRate?.toFixed(1) || 0}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Error Rate</span>
                <span className="font-medium text-red-600">{analytics?.errorRate?.toFixed(1) || 0}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Endpoints</h2>
            <div className="space-y-3">
              {analytics?.topEndpoints?.map((ep, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 font-mono">{ep.endpoint}</span>
                  <span className="text-sm font-medium text-gray-900">{ep.count} calls</span>
                </div>
              )) || <p className="text-gray-500">No data available</p>}
            </div>
          </div>
        </div>

        {/* Integrations */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">External Integrations</h2>
            <button
              onClick={handleCreateIntegration}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              Add Integration
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {integrations.length > 0 ? integrations.map((int) => (
              <div key={int.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium text-gray-900">{int.name}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    int.status === 'connected' ? 'bg-green-100 text-green-800' :
                    int.status === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {int.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">Provider: {int.provider}</p>
                <p className="text-sm text-gray-600 mb-2">Type: {int.type}</p>
                {int.lastSync && (
                  <p className="text-xs text-gray-500">
                    Last sync: {new Date(int.lastSync).toLocaleString()}
                  </p>
                )}
              </div>
            )) : (
              <div className="col-span-3 text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-500">No integrations configured yet</p>
                <button
                  onClick={handleCreateIntegration}
                  className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Create your first integration
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Webhooks */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Webhooks</h2>
            <button
              onClick={handleCreateWebhook}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
            >
              Add Webhook
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {webhooks.map((wh) => (
              <div key={wh.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium text-gray-900">{wh.name}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    wh.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {wh.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2 font-mono">{wh.url}</p>
                <p className="text-xs text-gray-500">
                  Events: {wh.events.join(', ')}
                </p>
                {wh.lastTriggered && (
                  <p className="text-xs text-gray-500 mt-2">
                    Last triggered: {new Date(wh.lastTriggered).toLocaleString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center px-4 py-3 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors">
              <svg className="w-6 h-6 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-sm font-medium text-blue-600">New API Key</span>
            </button>
            <button className="flex flex-col items-center px-4 py-3 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors">
              <svg className="w-6 h-6 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span className="text-sm font-medium text-green-600">Sync Now</span>
            </button>
            <button className="flex flex-col items-center px-4 py-3 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 transition-colors">
              <svg className="w-6 h-6 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="text-sm font-medium text-purple-600">View Logs</span>
            </button>
            <button className="flex flex-col items-center px-4 py-3 bg-orange-50 border border-orange-200 rounded-md hover:bg-orange-100 transition-colors">
              <svg className="w-6 h-6 text-orange-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium text-orange-600">Configure</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}