'use client';

import { useState, useEffect, useCallback } from 'react';

interface APIConnector {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  status: 'connected' | 'disconnected' | 'configuring' | 'error';
  lastSync?: string;
  syncStatus: 'idle' | 'syncing' | 'success' | 'failed';
  config: ConnectorConfig;
  capabilities: string[];
  webhooks?: string[];
  rateLimits?: {
    requests: number;
    period: string;
  };
}

interface ConnectorConfig {
  apiKey?: string;
  apiSecret?: string;
  baseUrl?: string;
  webhookUrl?: string;
  additionalSettings?: Record<string, any>;
  [key: string]: any;
}

interface APIConnectorLibraryProps {
  tenantId?: string;
}

export default function APIConnectorLibrary({ tenantId = 'default' }: APIConnectorLibraryProps) {
  const [connectors, setConnectors] = useState<APIConnector[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConnector, setSelectedConnector] = useState<APIConnector | null>(null);
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');

  const availableConnectors = [
    {
      id: 'slack',
      name: 'Slack',
      description: 'Send notifications and receive messages from Slack channels',
      category: 'communication',
      icon: '💬',
      capabilities: ['notifications', 'webhooks', 'user-sync'],
      rateLimits: { requests: 1000, period: 'minute' }
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Connect with 3000+ apps through automated workflows',
      category: 'automation',
      icon: '⚡',
      capabilities: ['webhooks', 'data-sync', 'automation'],
      rateLimits: { requests: 100, period: 'hour' }
    },
    {
      id: 'google-workspace',
      name: 'Google Workspace',
      description: 'Sync users, calendar events, and documents',
      category: 'productivity',
      icon: '📅',
      capabilities: ['user-sync', 'calendar', 'documents', 'email'],
      rateLimits: { requests: 10000, period: 'day' }
    },
    {
      id: 'microsoft-365',
      name: 'Microsoft 365',
      description: 'Integrate with Outlook, Teams, and SharePoint',
      category: 'productivity',
      icon: '🏢',
      capabilities: ['email', 'calendar', 'documents', 'teams'],
      rateLimits: { requests: 10000, period: 'day' }
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      description: 'Sync customer data and sales opportunities',
      category: 'crm',
      icon: '💼',
      capabilities: ['data-sync', 'leads', 'opportunities', 'contacts'],
      rateLimits: { requests: 5000, period: 'hour' }
    },
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Process payments and manage subscriptions',
      category: 'finance',
      icon: '💳',
      capabilities: ['payments', 'subscriptions', 'webhooks'],
      rateLimits: { requests: 100, period: 'second' }
    },
    {
      id: 'github',
      name: 'GitHub',
      description: 'Monitor repositories and receive webhook notifications',
      category: 'development',
      icon: '🐙',
      capabilities: ['webhooks', 'repositories', 'issues', 'pull-requests'],
      rateLimits: { requests: 5000, period: 'hour' }
    },
    {
      id: 'twilio',
      name: 'Twilio',
      description: 'Send SMS and make voice calls programmatically',
      category: 'communication',
      icon: '📱',
      capabilities: ['sms', 'voice', 'messaging'],
      rateLimits: { requests: 1000, period: 'hour' }
    }
  ];

  const fetchConnectors = useCallback(async () => {
    try {
      const response = await fetch(`/api/integrations?action=connectors&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        // Merge with available connectors
        const merged = availableConnectors.map(available => {
          const configured = data.data.find((c: APIConnector) => c.id === available.id);
          return configured || { ...available, status: 'disconnected', syncStatus: 'idle', config: {} };
        });
        setConnectors(merged);
      } else {
        // Use default available connectors
        setConnectors(availableConnectors.map(c => ({
          ...c,
          status: 'disconnected' as const,
          syncStatus: 'idle' as const,
          config: {}
        })));
      }
    } catch (error) {
      console.error('Failed to fetch connectors:', error);
      // Use default available connectors
      setConnectors(availableConnectors.map(c => ({
        ...c,
        status: 'disconnected' as const,
        syncStatus: 'idle' as const,
        config: {}
      })));
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchConnectors();
  }, [fetchConnectors]);

  const connectConnector = async (connectorId: string, config: ConnectorConfig) => {
    try {
      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'connect-connector',
          tenantId,
          connectorId,
          config
        })
      });

      const data = await response.json();
      if (data.success) {
        setConnectors(connectors.map(c =>
          c.id === connectorId ? { ...c, status: 'connected', config: data.data.config } : c
        ));
        setShowConfigForm(false);
        setSelectedConnector(null);
      } else {
        alert(`Failed to connect: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to connect connector:', error);
      alert('Failed to connect. Please check your credentials.');
    }
  };

  const disconnectConnector = async (connectorId: string) => {
    if (!confirm('Are you sure you want to disconnect this connector?')) return;

    try {
      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'disconnect-connector',
          tenantId,
          connectorId
        })
      });

      const data = await response.json();
      if (data.success) {
        setConnectors(connectors.map(c =>
          c.id === connectorId ? { ...c, status: 'disconnected', config: {} } : c
        ));
      }
    } catch (error) {
      console.error('Failed to disconnect connector:', error);
    }
  };

  const syncConnector = async (connectorId: string) => {
    try {
      setConnectors(connectors.map(c =>
        c.id === connectorId ? { ...c, syncStatus: 'syncing' } : c
      ));

      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync-connector',
          tenantId,
          connectorId
        })
      });

      const data = await response.json();
      setConnectors(connectors.map(c =>
        c.id === connectorId ? {
          ...c,
          syncStatus: data.success ? 'success' : 'failed',
          lastSync: new Date().toISOString()
        } : c
      ));
    } catch (error) {
      console.error('Failed to sync connector:', error);
      setConnectors(connectors.map(c =>
        c.id === connectorId ? { ...c, syncStatus: 'failed' } : c
      ));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'disconnected': return 'bg-gray-100 text-gray-800';
      case 'configuring': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'syncing': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const filteredConnectors = filterCategory === 'all'
    ? connectors
    : connectors.filter(c => c.category === filterCategory);

  const categories = ['all', ...Array.from(new Set(connectors.map(c => c.category)))];

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">API Connector Library</h2>
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Category:</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Connectors</p>
              <p className="text-2xl font-bold text-gray-900">{connectors.length}</p>
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
              <p className="text-sm font-medium text-gray-600">Connected</p>
              <p className="text-2xl font-bold text-green-600">
                {connectors.filter(c => c.status === 'connected').length}
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
              <p className="text-sm font-medium text-gray-600">Syncing</p>
              <p className="text-2xl font-bold text-yellow-600">
                {connectors.filter(c => c.syncStatus === 'syncing').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-purple-600">
                {new Set(connectors.map(c => c.category)).size}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Connectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredConnectors.map((connector) => (
          <div
            key={connector.id}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{connector.icon}</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{connector.name}</h3>
                  <p className="text-sm text-gray-600 capitalize">{connector.category}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(connector.status)}`}>
                {connector.status}
              </span>
            </div>

            <p className="text-gray-700 mb-4 text-sm">{connector.description}</p>

            <div className="space-y-3 mb-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Capabilities:</h4>
                <div className="flex flex-wrap gap-1">
                  {connector.capabilities?.slice(0, 3).map((capability, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {capability}
                    </span>
                  ))}
                  {(connector.capabilities?.length || 0) > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      +{(connector.capabilities?.length || 0) - 3}
                    </span>
                  )}
                </div>
              </div>

              {connector.rateLimits && (
                <div className="text-sm text-gray-600">
                  Rate Limit: {connector.rateLimits.requests} requests/{connector.rateLimits.period}
                </div>
              )}

              {connector.lastSync && (
                <div className="text-sm text-gray-600">
                  Last Sync: {new Date(connector.lastSync).toLocaleDateString()}
                  <span className={`ml-2 ${getSyncStatusColor(connector.syncStatus)}`}>
                    ({connector.syncStatus})
                  </span>
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              {connector.status === 'connected' ? (
                <>
                  <button
                    onClick={() => syncConnector(connector.id)}
                    disabled={connector.syncStatus === 'syncing'}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                  >
                    {connector.syncStatus === 'syncing' ? 'Syncing...' : 'Sync'}
                  </button>
                  <button
                    onClick={() => disconnectConnector(connector.id)}
                    className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                  >
                    Disconnect
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setSelectedConnector(connector);
                      setShowConfigForm(true);
                    }}
                    className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                  >
                    Connect
                  </button>
                  <button
                    onClick={() => setSelectedConnector(connector)}
                    className="px-3 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Details
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Connector Config Modal */}
      {showConfigForm && selectedConnector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Connect {selectedConnector.name}
              </h3>
              <button
                onClick={() => {
                  setShowConfigForm(false);
                  setSelectedConnector(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const config: ConnectorConfig = {};
              formData.forEach((value, key) => {
                if (typeof value === 'string') {
                  config[key as keyof ConnectorConfig] = value;
                }
              });
              connectConnector(selectedConnector.id, config);
            }}>
              <div className="space-y-4">
                {selectedConnector.id === 'slack' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Slack Bot Token
                      </label>
                      <input
                        type="password"
                        name="apiKey"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="xoxb-..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Webhook URL (Optional)
                      </label>
                      <input
                        type="url"
                        name="webhookUrl"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://hooks.slack.com/..."
                      />
                    </div>
                  </>
                )}

                {selectedConnector.id === 'zapier' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Zapier Webhook URL
                    </label>
                    <input
                      type="url"
                      name="webhookUrl"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://hooks.zapier.com/..."
                    />
                  </div>
                )}

                {(selectedConnector.id === 'google-workspace' || selectedConnector.id === 'microsoft-365') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Client ID
                      </label>
                      <input
                        type="text"
                        name="apiKey"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Client Secret
                      </label>
                      <input
                        type="password"
                        name="apiSecret"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </>
                )}

                {(selectedConnector.id === 'salesforce' || selectedConnector.id === 'stripe' || selectedConnector.id === 'github') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        API Key
                      </label>
                      <input
                        type="password"
                        name="apiKey"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    {selectedConnector.id === 'salesforce' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Instance URL
                        </label>
                        <input
                          type="url"
                          name="baseUrl"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="https://yourcompany.my.salesforce.com"
                        />
                      </div>
                    )}
                  </>
                )}

                {selectedConnector.id === 'twilio' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account SID
                      </label>
                      <input
                        type="text"
                        name="apiKey"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Auth Token
                      </label>
                      <input
                        type="password"
                        name="apiSecret"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Connect
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowConfigForm(false);
                    setSelectedConnector(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Connector Details Modal */}
      {selectedConnector && !showConfigForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{selectedConnector.icon}</span>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedConnector.name}</h3>
                  <p className="text-sm text-gray-600 capitalize">{selectedConnector.category}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedConnector(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <p className="text-gray-700">{selectedConnector.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Capabilities</h4>
                  <ul className="space-y-2">
                    {selectedConnector.capabilities?.map((capability, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span className="text-sm text-gray-700 capitalize">{capability.replace('-', ' ')}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {selectedConnector.rateLimits && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Rate Limits</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        {selectedConnector.rateLimits.requests}
                      </div>
                      <div className="text-sm text-gray-600">
                        requests per {selectedConnector.rateLimits.period}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {selectedConnector.webhooks && selectedConnector.webhooks.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Supported Webhooks</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedConnector.webhooks.map((webhook, index) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                        {webhook}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedConnector.status === 'connected' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium text-green-800">Connected</span>
                  </div>
                  {selectedConnector.lastSync && (
                    <p className="text-sm text-green-700">
                      Last synced: {new Date(selectedConnector.lastSync).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}