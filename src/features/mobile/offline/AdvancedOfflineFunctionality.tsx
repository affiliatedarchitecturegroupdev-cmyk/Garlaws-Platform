'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface OfflineData {
  id: string;
  type: 'user' | 'booking' | 'property' | 'message' | 'settings' | 'cache';
  data: any;
  timestamp: string;
  version: number;
  synced: boolean;
  syncAttempts: number;
  lastSyncAttempt?: string;
  checksum: string;
}

interface SyncQueue {
  id: string;
  operation: 'create' | 'update' | 'delete';
  entityType: string;
  entityId: string;
  data: any;
  timestamp: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

interface SyncConflict {
  id: string;
  localData: OfflineData;
  remoteData: any;
  conflictType: 'version' | 'data' | 'deletion';
  resolution: 'local-wins' | 'remote-wins' | 'merge' | 'manual';
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

interface NetworkStatus {
  online: boolean;
  connectionType: 'wifi' | 'cellular' | 'ethernet' | 'bluetooth' | 'none';
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
  downlink: number;
  rtt: number;
  lastChecked: string;
}

interface OfflineFunctionalityProps {
  tenantId?: string;
}

export default function AdvancedOfflineFunctionality({ tenantId = 'default' }: OfflineFunctionalityProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus | null>(null);
  const [offlineData, setOfflineData] = useState<OfflineData[]>([]);
  const [syncQueue, setSyncQueue] = useState<SyncQueue[]>([]);
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 });
  const [cacheStats, setCacheStats] = useState({
    totalSize: 0,
    itemsCount: 0,
    lastCleanup: null as string | null
  });

  const networkCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchOfflineData = useCallback(async () => {
    try {
      const response = await fetch(`/api/mobile?action=offline-data&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setOfflineData(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch offline data:', error);
    }
  }, [tenantId]);

  const fetchSyncQueue = useCallback(async () => {
    try {
      const response = await fetch(`/api/mobile?action=sync-queue&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setSyncQueue(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch sync queue:', error);
    }
  }, [tenantId]);

  const fetchConflicts = useCallback(async () => {
    try {
      const response = await fetch(`/api/mobile?action=sync-conflicts&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setConflicts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch conflicts:', error);
    }
  }, [tenantId]);

  const checkNetworkStatus = useCallback(() => {
    if ('navigator' in window && 'onLine' in navigator) {
      const online = navigator.onLine;
      setIsOnline(online);

      // Get detailed network information if available
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        setNetworkStatus({
          online,
          connectionType: connection?.type || 'none',
          effectiveType: connection?.effectiveType || '4g',
          downlink: connection?.downlink || 0,
          rtt: connection?.rtt || 0,
          lastChecked: new Date().toISOString()
        });
      } else {
        setNetworkStatus({
          online,
          connectionType: 'none' as NetworkStatus['connectionType'],
          effectiveType: '4g',
          downlink: 0,
          rtt: 0,
          lastChecked: new Date().toISOString()
        });
      }
    }
  }, []);

  const fetchCacheStats = useCallback(async () => {
    try {
      const response = await fetch(`/api/mobile?action=cache-stats&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setCacheStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch cache stats:', error);
    }
  }, [tenantId]);

  useEffect(() => {
    // Initial data fetch
    Promise.all([
      fetchOfflineData(),
      fetchSyncQueue(),
      fetchConflicts(),
      fetchCacheStats()
    ]).catch(console.error);

    // Network status monitoring
    checkNetworkStatus();

    // Set up event listeners for online/offline events
    window.addEventListener('online', checkNetworkStatus);
    window.addEventListener('offline', checkNetworkStatus);

    // Set up periodic network checks
    networkCheckIntervalRef.current = setInterval(checkNetworkStatus, 30000); // Check every 30 seconds

    // Set up automatic sync when coming online
    const handleOnline = () => {
      console.log('Connection restored, starting sync...');
      performSync();
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', checkNetworkStatus);
      window.removeEventListener('offline', checkNetworkStatus);
      window.removeEventListener('online', handleOnline);

      if (networkCheckIntervalRef.current) {
        clearInterval(networkCheckIntervalRef.current);
      }
    };
  }, [checkNetworkStatus, fetchOfflineData, fetchSyncQueue, fetchConflicts, fetchCacheStats]);

  // Auto-sync when online and there are pending items
  useEffect(() => {
    if (isOnline && syncQueue.length > 0 && !syncInProgress) {
      const pendingItems = syncQueue.filter(item => item.status === 'pending');
      if (pendingItems.length > 0) {
        performSync();
      }
    }
  }, [isOnline, syncQueue, syncInProgress]);

  const performSync = async () => {
    if (syncInProgress || !isOnline) return;

    setSyncInProgress(true);
    setSyncProgress({ current: 0, total: syncQueue.length });

    try {
      const response = await fetch('/api/mobile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'perform-sync',
          tenantId
        })
      });

      const data = await response.json();
      if (data.success) {
        // Refresh all data
        await Promise.all([
          fetchOfflineData(),
          fetchSyncQueue(),
          fetchConflicts(),
          fetchCacheStats()
        ]);
      }
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncInProgress(false);
      setSyncProgress({ current: 0, total: 0 });
    }
  };

  const queueOperation = async (
    operation: SyncQueue['operation'],
    entityType: string,
    entityId: string,
    data: any,
    priority: SyncQueue['priority'] = 'medium'
  ) => {
    try {
      const response = await fetch('/api/mobile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'queue-operation',
          tenantId,
          operation,
          entityType,
          entityId,
          data,
          priority
        })
      });

      const result = await response.json();
      if (result.success) {
        setSyncQueue(prev => [...prev, result.data]);
        // If offline, store locally
        if (!isOnline) {
          storeOfflineData(entityType, entityId, data);
        }
      }
    } catch (error) {
      console.error('Failed to queue operation:', error);
      // Store locally if API fails
      if (!isOnline) {
        storeOfflineData(entityType, entityId, data);
      }
    }
  };

  const storeOfflineData = (type: string, id: string, data: any) => {
    const offlineItem: OfflineData = {
      id: `${type}_${id}`,
      type: type as OfflineData['type'],
      data,
      timestamp: new Date().toISOString(),
      version: 1,
      synced: false,
      syncAttempts: 0,
      checksum: generateChecksum(data)
    };

    setOfflineData(prev => {
      const existing = prev.find(item => item.id === offlineItem.id);
      if (existing) {
        return prev.map(item =>
          item.id === offlineItem.id
            ? { ...item, data, timestamp: offlineItem.timestamp, version: item.version + 1 }
            : item
        );
      }
      return [...prev, offlineItem];
    });
  };

  const resolveConflict = async (conflictId: string, resolution: SyncConflict['resolution']) => {
    try {
      const response = await fetch('/api/mobile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resolve-conflict',
          tenantId,
          conflictId,
          resolution
        })
      });

      const data = await response.json();
      if (data.success) {
        setConflicts(prev => prev.filter(c => c.id !== conflictId));
      }
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
    }
  };

  const clearCache = async (type?: OfflineData['type']) => {
    try {
      const response = await fetch('/api/mobile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: type ? 'clear-cache-type' : 'clear-cache',
          tenantId,
          type
        })
      });

      const data = await response.json();
      if (data.success) {
        if (type) {
          setOfflineData(prev => prev.filter(item => item.type !== type));
        } else {
          setOfflineData([]);
        }
        fetchCacheStats();
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  const generateChecksum = (data: any): string => {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  };

  const getDataTypeIcon = (type: string) => {
    switch (type) {
      case 'user': return '👤';
      case 'booking': return '📅';
      case 'property': return '🏠';
      case 'message': return '💬';
      case 'settings': return '⚙️';
      case 'cache': return '💾';
      default: return '📄';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSyncStatusColor = (synced: boolean, attempts: number) => {
    if (synced) return 'bg-green-100 text-green-800';
    if (attempts > 3) return 'bg-red-100 text-red-800';
    if (attempts > 0) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const pendingSyncItems = syncQueue.filter(item => item.status === 'pending').length;
  const offlineDataCount = offlineData.filter(item => !item.synced).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Advanced Offline Functionality</h2>
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
            isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>
          <button
            onClick={performSync}
            disabled={!isOnline || syncInProgress || (pendingSyncItems === 0 && offlineDataCount === 0)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {syncInProgress ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      </div>

      {/* Network Status & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{pendingSyncItems}</div>
          <div className="text-sm text-gray-600">Pending Sync</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{offlineDataCount}</div>
          <div className="text-sm text-gray-600">Offline Changes</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-red-600">{conflicts.length}</div>
          <div className="text-sm text-gray-600">Sync Conflicts</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{formatFileSize(cacheStats.totalSize)}</div>
          <div className="text-sm text-gray-600">Cache Size</div>
        </div>
      </div>

      {/* Network Information */}
      {networkStatus && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-3">Network Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Connection:</span>
              <div className="font-medium capitalize">{networkStatus.connectionType}</div>
            </div>
            <div>
              <span className="text-gray-600">Effective Type:</span>
              <div className="font-medium uppercase">{networkStatus.effectiveType}</div>
            </div>
            <div>
              <span className="text-gray-600">Downlink:</span>
              <div className="font-medium">{networkStatus.downlink} Mbps</div>
            </div>
            <div>
              <span className="text-gray-600">RTT:</span>
              <div className="font-medium">{networkStatus.rtt} ms</div>
            </div>
          </div>
        </div>
      )}

      {/* Sync Progress */}
      {syncInProgress && syncProgress.total > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-3">Sync Progress</h3>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(syncProgress.current / syncProgress.total) * 100}%` }}
            ></div>
          </div>
          <div className="text-sm text-gray-600">
            {syncProgress.current} of {syncProgress.total} items processed
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          <button className="py-2 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-sm">
            Offline Data ({offlineData.length})
          </button>
          <button className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm">
            Sync Queue ({syncQueue.length})
          </button>
          <button className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm">
            Conflicts ({conflicts.length})
          </button>
          <button className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm">
            Cache Management
          </button>
        </nav>
      </div>

      {/* Offline Data */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Offline Data</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => clearCache()}
              className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
            >
              Clear All Cache
            </button>
            <button
              onClick={fetchOfflineData}
              className="px-3 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {offlineData.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getDataTypeIcon(item.type)}</span>
                  <div>
                    <div className="font-medium text-gray-900">{item.id}</div>
                    <div className="text-sm text-gray-600">{item.type}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getSyncStatusColor(item.synced, item.syncAttempts)}`}>
                    {item.synced ? 'Synced' : item.syncAttempts > 3 ? 'Failed' : 'Pending'}
                  </span>
                  <span className="text-xs text-gray-500">v{item.version}</span>
                </div>
              </div>

              <div className="text-sm text-gray-600 mb-2">
                Last modified: {new Date(item.timestamp).toLocaleString()}
              </div>

              {!item.synced && (
                <div className="text-sm text-orange-600 mb-2">
                  Sync attempts: {item.syncAttempts}
                  {item.lastSyncAttempt && ` • Last attempt: ${new Date(item.lastSyncAttempt).toLocaleString()}`}
                </div>
              )}

              <div className="text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded">
                Checksum: {item.checksum}
              </div>
            </div>
          ))}

          {offlineData.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-6xl mb-4">💾</div>
              <p className="text-lg">No offline data cached</p>
              <p className="text-sm">Data will be cached automatically when working offline.</p>
            </div>
          )}
        </div>
      </div>

      {/* Sync Conflicts */}
      {conflicts.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-red-200">
          <h3 className="text-lg font-semibold text-red-900 mb-4">Sync Conflicts</h3>
          <div className="space-y-4">
            {conflicts.map((conflict) => (
              <div key={conflict.id} className="border border-red-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{conflict.localData.id}</h4>
                    <p className="text-sm text-gray-600">Conflict type: {conflict.conflictType}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => resolveConflict(conflict.id, 'local-wins')}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      Keep Local
                    </button>
                    <button
                      onClick={() => resolveConflict(conflict.id, 'remote-wins')}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                    >
                      Use Remote
                    </button>
                    <button
                      onClick={() => resolveConflict(conflict.id, 'manual')}
                      className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                    >
                      Manual Review
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-red-50 p-3 rounded">
                    <div className="font-medium text-red-900 mb-1">Local Version</div>
                    <pre className="text-xs text-red-800 overflow-x-auto">
                      {JSON.stringify(conflict.localData.data, null, 2)}
                    </pre>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <div className="font-medium text-green-900 mb-1">Remote Version</div>
                    <pre className="text-xs text-green-800 overflow-x-auto">
                      {JSON.stringify(conflict.remoteData, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}