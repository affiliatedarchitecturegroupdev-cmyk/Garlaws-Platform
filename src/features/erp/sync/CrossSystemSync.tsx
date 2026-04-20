'use client';

import { useState, useEffect, useCallback } from 'react';

interface SyncMapping {
  id: string;
  name: string;
  sourceSystem: string;
  targetSystem: string;
  entityType: string;
  fieldMappings: FieldMapping[];
  syncSchedule: 'manual' | 'real-time' | 'hourly' | 'daily' | 'weekly';
  conflictResolution: 'source-wins' | 'target-wins' | 'manual' | 'latest-wins';
  filters?: SyncFilter[];
  transformations?: DataTransformation[];
  status: 'active' | 'inactive' | 'error';
  lastSync?: string;
  syncCount: number;
  errorCount: number;
  createdAt: string;
}

interface FieldMapping {
  sourceField: string;
  targetField: string;
  dataType: 'string' | 'number' | 'boolean' | 'date' | 'object';
  required: boolean;
  defaultValue?: any;
  transformation?: string;
}

interface SyncFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
}

interface DataTransformation {
  field: string;
  type: 'map' | 'concat' | 'split' | 'format' | 'calculate' | 'lookup';
  config: Record<string, any>;
}

interface SyncJob {
  id: string;
  mappingId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsFailed: number;
  errors: SyncError[];
  duration: number;
}

interface SyncError {
  recordId: string;
  error: string;
  field?: string;
  value?: any;
  timestamp: string;
}

interface SyncConnection {
  id: string;
  name: string;
  system: string;
  type: 'database' | 'api' | 'webhook' | 'file';
  config: {
    host?: string;
    port?: number;
    database?: string;
    username?: string;
    password?: string; // encrypted
    apiUrl?: string;
    apiKey?: string;
    filePath?: string;
    webhookUrl?: string;
  };
  status: 'connected' | 'disconnected' | 'error';
  lastTested: string;
  createdAt: string;
}

interface CrossSystemSyncProps {
  tenantId?: string;
}

export default function CrossSystemSync({ tenantId = 'default' }: CrossSystemSyncProps) {
  const [mappings, setMappings] = useState<SyncMapping[]>([]);
  const [connections, setConnections] = useState<SyncConnection[]>([]);
  const [syncJobs, setSyncJobs] = useState<SyncJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMapping, setSelectedMapping] = useState<SyncMapping | null>(null);
  const [activeTab, setActiveTab] = useState<'mappings' | 'connections' | 'jobs'>('mappings');
  const [showCreateMapping, setShowCreateMapping] = useState(false);
  const [showCreateConnection, setShowCreateConnection] = useState(false);

  const [newMapping, setNewMapping] = useState<Partial<SyncMapping>>({
    name: '',
    sourceSystem: '',
    targetSystem: '',
    entityType: '',
    syncSchedule: 'manual',
    conflictResolution: 'source-wins',
    fieldMappings: [],
    status: 'active'
  });

  const [newConnection, setNewConnection] = useState<Partial<SyncConnection>>({
    name: '',
    system: '',
    type: 'database',
    config: {},
    status: 'disconnected'
  });

  const availableSystems = [
    'Garlaws ERP', 'Salesforce', 'SAP', 'Oracle', 'Microsoft Dynamics',
    'QuickBooks', 'Xero', 'FreshBooks', 'Stripe', 'PayPal', 'Custom API'
  ];

  const entityTypes = [
    'customers', 'vendors', 'products', 'orders', 'invoices',
    'inventory', 'employees', 'accounts', 'transactions', 'assets'
  ];

  const fetchMappings = useCallback(async () => {
    try {
      const response = await fetch(`/api/erp?action=sync-mappings&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setMappings(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch sync mappings:', error);
    }
  }, [tenantId]);

  const fetchConnections = useCallback(async () => {
    try {
      const response = await fetch(`/api/erp?action=sync-connections&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setConnections(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch sync connections:', error);
    }
  }, [tenantId]);

  const fetchSyncJobs = useCallback(async (mappingId?: string) => {
    try {
      const url = mappingId
        ? `/api/erp?action=sync-jobs&mappingId=${mappingId}&tenantId=${tenantId}`
        : `/api/erp?action=sync-jobs&tenantId=${tenantId}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setSyncJobs(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch sync jobs:', error);
    }
  }, [tenantId]);

  useEffect(() => {
    Promise.all([fetchMappings(), fetchConnections(), fetchSyncJobs()]).finally(() => {
      setLoading(false);
    });
  }, [fetchMappings, fetchConnections, fetchSyncJobs]);

  const createMapping = async () => {
    if (!newMapping.name || !newMapping.sourceSystem || !newMapping.targetSystem) return;

    try {
      const response = await fetch('/api/erp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-sync-mapping',
          tenantId,
          mapping: {
            ...newMapping,
            syncCount: 0,
            errorCount: 0,
            createdAt: new Date().toISOString()
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        setMappings([...mappings, data.data]);
        setShowCreateMapping(false);
        resetMappingForm();
      }
    } catch (error) {
      console.error('Failed to create sync mapping:', error);
    }
  };

  const createConnection = async () => {
    if (!newConnection.name || !newConnection.system) return;

    try {
      const response = await fetch('/api/erp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-sync-connection',
          tenantId,
          connection: {
            ...newConnection,
            lastTested: new Date().toISOString(),
            createdAt: new Date().toISOString()
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        setConnections([...connections, data.data]);
        setShowCreateConnection(false);
        resetConnectionForm();
      }
    } catch (error) {
      console.error('Failed to create sync connection:', error);
    }
  };

  const resetMappingForm = () => {
    setNewMapping({
      name: '',
      sourceSystem: '',
      targetSystem: '',
      entityType: '',
      syncSchedule: 'manual',
      conflictResolution: 'source-wins',
      fieldMappings: [],
      status: 'active'
    });
  };

  const resetConnectionForm = () => {
    setNewConnection({
      name: '',
      system: '',
      type: 'database',
      config: {},
      status: 'disconnected'
    });
  };

  const runSync = async (mappingId: string) => {
    try {
      const response = await fetch('/api/erp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'run-sync',
          tenantId,
          mappingId
        })
      });

      const data = await response.json();
      if (data.success) {
        // Refresh jobs
        fetchSyncJobs(mappingId);
        // Refresh mappings to update sync count
        fetchMappings();
      }
    } catch (error) {
      console.error('Failed to run sync:', error);
    }
  };

  const testConnection = async (connectionId: string) => {
    try {
      const response = await fetch('/api/erp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test-connection',
          tenantId,
          connectionId
        })
      });

      const data = await response.json();
      if (data.success) {
        setConnections(connections.map(c =>
          c.id === connectionId
            ? { ...c, status: data.status, lastTested: new Date().toISOString() }
            : c
        ));
      }
    } catch (error) {
      console.error('Failed to test connection:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'connected':
      case 'completed': return 'bg-green-100 text-green-800';
      case 'inactive':
      case 'disconnected': return 'bg-gray-100 text-gray-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'failed':
      case 'error': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConnectionIcon = (type: string) => {
    switch (type) {
      case 'database': return '🗄️';
      case 'api': return '🔗';
      case 'webhook': return '🪝';
      case 'file': return '📁';
      default: return '🔗';
    }
  };

  const calculateSyncStats = () => {
    const totalJobs = syncJobs.length;
    const successfulJobs = syncJobs.filter(j => j.status === 'completed').length;
    const failedJobs = syncJobs.filter(j => j.status === 'failed').length;
    const runningJobs = syncJobs.filter(j => j.status === 'running').length;
    const totalRecords = syncJobs.reduce((sum, job) => sum + job.recordsProcessed, 0);
    const avgDuration = syncJobs.length > 0
      ? syncJobs.reduce((sum, job) => sum + job.duration, 0) / syncJobs.length
      : 0;

    return {
      totalJobs,
      successfulJobs,
      failedJobs,
      runningJobs,
      totalRecords,
      avgDuration,
      successRate: totalJobs > 0 ? (successfulJobs / totalJobs) * 100 : 0
    };
  };

  const stats = calculateSyncStats();

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <h2 className="text-2xl font-bold text-gray-900">Cross-System Synchronization</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCreateConnection(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            New Connection
          </button>
          <button
            onClick={() => setShowCreateMapping(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            New Mapping
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{stats.totalJobs}</div>
          <div className="text-sm text-gray-600">Total Sync Jobs</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{stats.successfulJobs}</div>
          <div className="text-sm text-gray-600">Successful</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-red-600">{stats.failedJobs}</div>
          <div className="text-sm text-gray-600">Failed</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">{stats.successRate.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Success Rate</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('mappings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'mappings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Sync Mappings ({mappings.length})
          </button>
          <button
            onClick={() => setActiveTab('connections')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'connections'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Connections ({connections.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('jobs');
              fetchSyncJobs();
            }}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'jobs'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Sync Jobs ({syncJobs.length})
          </button>
        </nav>
      </div>

      {/* Create Mapping Form */}
      {showCreateMapping && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold mb-4">Create Sync Mapping</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mapping Name</label>
              <input
                type="text"
                value={newMapping.name || ''}
                onChange={(e) => setNewMapping(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Customer Data Sync"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source System</label>
              <select
                value={newMapping.sourceSystem || ''}
                onChange={(e) => setNewMapping(prev => ({ ...prev, sourceSystem: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Source</option>
                {availableSystems.map(system => (
                  <option key={system} value={system}>{system}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target System</label>
              <select
                value={newMapping.targetSystem || ''}
                onChange={(e) => setNewMapping(prev => ({ ...prev, targetSystem: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Target</option>
                {availableSystems.map(system => (
                  <option key={system} value={system}>{system}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Entity Type</label>
              <select
                value={newMapping.entityType || ''}
                onChange={(e) => setNewMapping(prev => ({ ...prev, entityType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Entity</option>
                {entityTypes.map(entity => (
                  <option key={entity} value={entity}>{entity}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sync Schedule</label>
              <select
                value={newMapping.syncSchedule || 'manual'}
                onChange={(e) => setNewMapping(prev => ({ ...prev, syncSchedule: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="manual">Manual</option>
                <option value="real-time">Real-time</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Conflict Resolution</label>
              <select
                value={newMapping.conflictResolution || 'source-wins'}
                onChange={(e) => setNewMapping(prev => ({ ...prev, conflictResolution: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="source-wins">Source Wins</option>
                <option value="target-wins">Target Wins</option>
                <option value="manual">Manual Resolution</option>
                <option value="latest-wins">Latest Wins</option>
              </select>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={createMapping}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Create Mapping
            </button>
            <button
              onClick={() => {
                setShowCreateMapping(false);
                resetMappingForm();
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Create Connection Form */}
      {showCreateConnection && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold mb-4">Create Sync Connection</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Connection Name</label>
              <input
                type="text"
                value={newConnection.name || ''}
                onChange={(e) => setNewConnection(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Salesforce Production"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">System</label>
              <select
                value={newConnection.system || ''}
                onChange={(e) => setNewConnection(prev => ({ ...prev, system: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select System</option>
                {availableSystems.map(system => (
                  <option key={system} value={system}>{system}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Connection Type</label>
              <select
                value={newConnection.type || 'database'}
                onChange={(e) => setNewConnection(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="database">Database</option>
                <option value="api">REST API</option>
                <option value="webhook">Webhook</option>
                <option value="file">File System</option>
              </select>
            </div>

            {/* Dynamic config fields based on type */}
            {newConnection.type === 'database' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Host</label>
                  <input
                    type="text"
                    value={newConnection.config?.host || ''}
                    onChange={(e) => setNewConnection(prev => ({
                      ...prev,
                      config: { ...prev.config!, host: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="localhost"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
                  <input
                    type="number"
                    value={newConnection.config?.port || ''}
                    onChange={(e) => setNewConnection(prev => ({
                      ...prev,
                      config: { ...prev.config!, port: parseInt(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="5432"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Database</label>
                  <input
                    type="text"
                    value={newConnection.config?.database || ''}
                    onChange={(e) => setNewConnection(prev => ({
                      ...prev,
                      config: { ...prev.config!, database: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="mydatabase"
                  />
                </div>
              </>
            )}

            {newConnection.type === 'api' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">API URL</label>
                <input
                  type="url"
                  value={newConnection.config?.apiUrl || ''}
                  onChange={(e) => setNewConnection(prev => ({
                    ...prev,
                    config: { ...prev.config!, apiUrl: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://api.example.com"
                />
              </div>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={createConnection}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Create Connection
            </button>
            <button
              onClick={() => {
                setShowCreateConnection(false);
                resetConnectionForm();
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Mappings Tab */}
      {activeTab === 'mappings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mappings.map((mapping) => (
            <div
              key={mapping.id}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{mapping.name}</h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm text-gray-600">{mapping.sourceSystem}</span>
                    <span className="text-sm text-gray-400">→</span>
                    <span className="text-sm text-gray-600">{mapping.targetSystem}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(mapping.status)}`}>
                      {mapping.status}
                    </span>
                    <span className="text-xs text-gray-600">{mapping.entityType}</span>
                    <span className="text-xs text-gray-600">• {mapping.syncSchedule}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-600">Syncs:</span>
                  <span className="ml-1 font-medium">{mapping.syncCount}</span>
                </div>
                <div>
                  <span className="text-gray-600">Errors:</span>
                  <span className="ml-1 font-medium text-red-600">{mapping.errorCount}</span>
                </div>
                <div>
                  <span className="text-gray-600">Mappings:</span>
                  <span className="ml-1 font-medium">{mapping.fieldMappings.length}</span>
                </div>
              </div>

              {mapping.lastSync && (
                <div className="text-xs text-gray-600 mb-4">
                  Last sync: {new Date(mapping.lastSync).toLocaleString()}
                </div>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={() => runSync(mapping.id)}
                  disabled={mapping.status !== 'active'}
                  className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  Run Sync
                </button>
                <button
                  onClick={() => setSelectedMapping(mapping)}
                  className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  Details
                </button>
              </div>
            </div>
          ))}

          {mappings.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">
              <div className="text-6xl mb-4">🔄</div>
              <p className="text-lg">No sync mappings configured</p>
              <p className="text-sm">Create mappings to synchronize data between systems.</p>
            </div>
          )}
        </div>
      )}

      {/* Connections Tab */}
      {activeTab === 'connections' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {connections.map((connection) => (
            <div
              key={connection.id}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getConnectionIcon(connection.type)}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{connection.name}</h3>
                    <p className="text-sm text-gray-600">{connection.system}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(connection.status)}`}>
                  {connection.status}
                </span>
              </div>

              <div className="mb-4 text-sm text-gray-600">
                <div>Type: {connection.type}</div>
                <div>Last tested: {new Date(connection.lastTested).toLocaleString()}</div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => testConnection(connection.id)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  Test Connection
                </button>
                <button
                  onClick={() => {/* Edit connection */}}
                  className="px-3 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}

          {connections.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">
              <div className="text-6xl mb-4">🔗</div>
              <p className="text-lg">No connections configured</p>
              <p className="text-sm">Add connections to external systems for data synchronization.</p>
            </div>
          )}
        </div>
      )}

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Sync Jobs</h3>
            <button
              onClick={() => fetchSyncJobs()}
              className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>

          <div className="space-y-4">
            {syncJobs.map((job) => (
              <div key={job.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                      <span className="text-sm font-medium">
                        {mappings.find(m => m.id === job.mappingId)?.name || 'Unknown Mapping'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Started: {new Date(job.startedAt).toLocaleString()}
                      {job.completedAt && ` • Completed: ${new Date(job.completedAt).toLocaleString()}`}
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    Duration: {job.duration.toFixed(1)}s
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-600">Processed:</span>
                    <span className="ml-1 font-medium">{job.recordsProcessed.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Created:</span>
                    <span className="ml-1 font-medium text-green-600">{job.recordsCreated.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Updated:</span>
                    <span className="ml-1 font-medium text-blue-600">{job.recordsUpdated.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Failed:</span>
                    <span className="ml-1 font-medium text-red-600">{job.recordsFailed.toLocaleString()}</span>
                  </div>
                </div>

                {job.errors.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Errors ({job.errors.length})</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {job.errors.slice(0, 5).map((error, index) => (
                        <div key={index} className="text-xs bg-red-50 border border-red-200 rounded p-2">
                          <div className="font-medium text-red-800">{error.recordId}</div>
                          <div className="text-red-700">{error.error}</div>
                          {error.field && <div className="text-red-600">Field: {error.field}</div>}
                        </div>
                      ))}
                      {job.errors.length > 5 && (
                        <div className="text-xs text-gray-600 text-center">
                          ... and {job.errors.length - 5} more errors
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {syncJobs.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-2">📋</div>
                <p>No sync jobs found</p>
                <p className="text-sm">Run sync operations to see job history and results.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mapping Detail Modal */}
      {selectedMapping && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{selectedMapping.name} - Details</h3>
              <button
                onClick={() => setSelectedMapping(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Mapping Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">Source</h4>
                  <p className="text-sm text-gray-900">{selectedMapping.sourceSystem}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">Target</h4>
                  <p className="text-sm text-gray-900">{selectedMapping.targetSystem}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">Entity</h4>
                  <p className="text-sm text-gray-900">{selectedMapping.entityType}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">Schedule</h4>
                  <p className="text-sm text-gray-900">{selectedMapping.syncSchedule}</p>
                </div>
              </div>

              {/* Field Mappings */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Field Mappings ({selectedMapping.fieldMappings.length})</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedMapping.fieldMappings.map((mapping, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {mapping.sourceField} → {mapping.targetField}
                        </div>
                        <div className="text-xs text-gray-600">
                          {mapping.dataType} {mapping.required && '• Required'}
                          {mapping.transformation && `• Transform: ${mapping.transformation}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filters */}
              {selectedMapping.filters && selectedMapping.filters.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Filters ({selectedMapping.filters.length})</h4>
                  <div className="space-y-2">
                    {selectedMapping.filters.map((filter, index) => (
                      <div key={index} className="text-sm bg-gray-50 p-3 rounded-lg">
                        <code className="text-gray-900">
                          {filter.field} {filter.operator.replace('_', ' ')} {filter.value}
                        </code>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}