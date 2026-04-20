'use client';

import { useState, useEffect, useCallback } from 'react';

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret: string;
  status: 'active' | 'inactive' | 'error';
  createdAt: string;
  lastTriggered?: string;
  successCount: number;
  failureCount: number;
  deliveries: WebhookDelivery[];
}

interface WebhookDelivery {
  id: string;
  timestamp: string;
  status: 'success' | 'failed' | 'pending';
  statusCode?: number;
  responseTime?: number;
  error?: string;
  payload?: any;
}

interface WebhookManagerProps {
  tenantId?: string;
}

export default function WebhookManager({ tenantId = 'default' }: WebhookManagerProps) {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWebhookName, setNewWebhookName] = useState('');
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newWebhookEvents, setNewWebhookEvents] = useState<string[]>([]);
  const [availableEvents] = useState([
    'user.created', 'user.updated', 'user.deleted',
    'project.created', 'project.updated', 'project.completed',
    'task.created', 'task.updated', 'task.completed',
    'maintenance.scheduled', 'maintenance.completed',
    'payment.received', 'payment.failed'
  ]);

  const fetchWebhooks = useCallback(async () => {
    try {
      const response = await fetch(`/api/integrations?action=webhooks&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setWebhooks(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch webhooks:', error);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchWebhooks();
  }, [fetchWebhooks]);

  const createWebhook = async () => {
    if (!newWebhookName.trim() || !newWebhookUrl.trim() || newWebhookEvents.length === 0) return;

    try {
      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-webhook',
          tenantId,
          name: newWebhookName,
          url: newWebhookUrl,
          events: newWebhookEvents
        })
      });

      const data = await response.json();
      if (data.success) {
        setWebhooks([...webhooks, data.data]);
        setShowCreateForm(false);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to create webhook:', error);
    }
  };

  const resetForm = () => {
    setNewWebhookName('');
    setNewWebhookUrl('');
    setNewWebhookEvents([]);
  };

  const toggleWebhookStatus = async (webhookId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    try {
      const response = await fetch('/api/integrations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-webhook-status',
          tenantId,
          webhookId,
          status: newStatus
        })
      });

      const data = await response.json();
      if (data.success) {
        setWebhooks(webhooks.map(w => w.id === webhookId ? { ...w, status: newStatus } : w));
      }
    } catch (error) {
      console.error('Failed to update webhook status:', error);
    }
  };

  const deleteWebhook = async (webhookId: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;

    try {
      const response = await fetch('/api/integrations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete-webhook',
          tenantId,
          webhookId
        })
      });

      const data = await response.json();
      if (data.success) {
        setWebhooks(webhooks.filter(w => w.id !== webhookId));
      }
    } catch (error) {
      console.error('Failed to delete webhook:', error);
    }
  };

  const testWebhook = async (webhookId: string) => {
    try {
      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test-webhook',
          tenantId,
          webhookId
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Webhook test sent successfully!');
        fetchWebhooks(); // Refresh to show new delivery
      }
    } catch (error) {
      console.error('Failed to test webhook:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeliveryStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const handleEventToggle = (event: string) => {
    setNewWebhookEvents(prev =>
      prev.includes(event)
        ? prev.filter(e => e !== event)
        : [...prev, event]
    );
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
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
        <h2 className="text-2xl font-bold text-gray-900">Webhook Management</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Create New Webhook
        </button>
      </div>

      {/* Create Webhook Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Create New Webhook</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Webhook Name</label>
              <input
                type="text"
                value={newWebhookName}
                onChange={(e) => setNewWebhookName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="My Webhook"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint URL</label>
              <input
                type="url"
                value={newWebhookUrl}
                onChange={(e) => setNewWebhookUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://api.example.com/webhooks"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Events to Listen For</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                {availableEvents.map((event) => (
                  <label key={event} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newWebhookEvents.includes(event)}
                      onChange={() => handleEventToggle(event)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{event}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={createWebhook}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Create Webhook
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false);
                resetForm();
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Webhooks Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Webhooks</p>
              <p className="text-2xl font-bold text-gray-900">{webhooks.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Webhooks</p>
              <p className="text-2xl font-bold text-green-600">
                {webhooks.filter(w => w.status === 'active').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
              <p className="text-2xl font-bold text-purple-600">
                {webhooks.reduce((sum, w) => sum + w.successCount + w.failureCount, 0)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-orange-600">
                {webhooks.length > 0
                  ? Math.round(webhooks.reduce((sum, w) => sum + (w.successCount / (w.successCount + w.failureCount || 1)), 0) / webhooks.length * 100)
                  : 0}%
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Webhooks List */}
      <div className="grid grid-cols-1 gap-4">
        {webhooks.map((webhook) => (
          <div
            key={webhook.id}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{webhook.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(webhook.status)}`}>
                    {webhook.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{webhook.url}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Events: {webhook.events.join(', ')}</span>
                  <span>Success: {webhook.successCount}</span>
                  <span>Failures: {webhook.failureCount}</span>
                  {webhook.lastTriggered && (
                    <span>Last triggered: {new Date(webhook.lastTriggered).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Deliveries */}
            {webhook.deliveries.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Deliveries</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {webhook.deliveries.slice(0, 5).map((delivery) => (
                    <div key={delivery.id} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${delivery.status === 'success' ? 'bg-green-500' : delivery.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                        <span className={getDeliveryStatusColor(delivery.status)}>{delivery.status}</span>
                        <span className="text-gray-600">
                          {new Date(delivery.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-right">
                        {delivery.statusCode && <span className="text-gray-600">HTTP {delivery.statusCode}</span>}
                        {delivery.responseTime && <span className="text-gray-600 ml-2">{delivery.responseTime}ms</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedWebhook(webhook)}
                className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                View Details
              </button>
              <button
                onClick={() => testWebhook(webhook.id)}
                className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
              >
                Test
              </button>
              <button
                onClick={() => toggleWebhookStatus(webhook.id, webhook.status)}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  webhook.status === 'active'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {webhook.status === 'active' ? 'Disable' : 'Enable'}
              </button>
              <button
                onClick={() => deleteWebhook(webhook.id)}
                className="px-3 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {webhooks.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-6xl mb-4">🔗</div>
            <p className="text-lg">No webhooks configured</p>
            <p className="text-sm">Create webhooks to receive real-time notifications about platform events.</p>
          </div>
        )}
      </div>

      {/* Webhook Detail Modal */}
      {selectedWebhook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{selectedWebhook.name} - Details</h3>
              <button
                onClick={() => setSelectedWebhook(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">Status</h4>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(selectedWebhook.status)}`}>
                    {selectedWebhook.status}
                  </span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">URL</h4>
                  <p className="text-sm text-gray-900 break-all">{selectedWebhook.url}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">Success Rate</h4>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedWebhook.successCount + selectedWebhook.failureCount > 0
                      ? Math.round((selectedWebhook.successCount / (selectedWebhook.successCount + selectedWebhook.failureCount)) * 100)
                      : 0}%
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">Total Deliveries</h4>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedWebhook.successCount + selectedWebhook.failureCount}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Events</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedWebhook.events.map((event, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {event}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Recent Deliveries ({selectedWebhook.deliveries.length})</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {selectedWebhook.deliveries.map((delivery) => (
                    <div key={delivery.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`w-3 h-3 rounded-full ${delivery.status === 'success' ? 'bg-green-500' : delivery.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                          <span className={`font-medium ${getDeliveryStatusColor(delivery.status)}`}>
                            {delivery.status.toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-600">
                            {new Date(delivery.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-right text-sm text-gray-600">
                          {delivery.statusCode && <div>HTTP {delivery.statusCode}</div>}
                          {delivery.responseTime && <div>{delivery.responseTime}ms</div>}
                        </div>
                      </div>
                      {delivery.error && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                          {delivery.error}
                        </div>
                      )}
                      {delivery.payload && (
                        <details className="mt-2">
                          <summary className="text-sm font-medium text-gray-700 cursor-pointer">View Payload</summary>
                          <pre className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-x-auto">
                            {JSON.stringify(delivery.payload, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}