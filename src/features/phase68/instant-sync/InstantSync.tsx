'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, AlertTriangle, CheckCircle, Clock, Users, Database, Zap, GitBranch } from 'lucide-react';

export interface SyncEntity {
  id: string;
  type: 'user' | 'project' | 'financial' | 'inventory' | 'crm' | 'analytics';
  module: string;
  data: any;
  version: number;
  lastModified: Date;
  modifiedBy: string;
  checksum: string;
}

export interface SyncConflict {
  id: string;
  entityId: string;
  entityType: string;
  conflictingVersions: Array<{
    version: number;
    data: any;
    modifiedBy: string;
    timestamp: Date;
    source: string;
  }>;
  status: 'pending' | 'resolved' | 'auto-resolved';
  resolution?: 'local' | 'remote' | 'merge' | 'custom';
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface SyncSession {
  id: string;
  modules: string[];
  status: 'syncing' | 'completed' | 'failed' | 'paused';
  startTime: Date;
  endTime?: Date;
  entitiesSynced: number;
  conflictsFound: number;
  conflictsResolved: number;
  progress: number;
  errors: string[];
}

export interface SyncRule {
  id: string;
  name: string;
  sourceModule: string;
  targetModule: string;
  entityTypes: string[];
  syncFrequency: 'real-time' | 'hourly' | 'daily' | 'manual';
  conflictResolution: 'auto-merge' | 'last-wins' | 'manual' | 'custom';
  isActive: boolean;
  lastSync?: Date;
  successRate: number;
}

const SYNC_RULES: SyncRule[] = [
  {
    id: 'user-profile-sync',
    name: 'User Profile Synchronization',
    sourceModule: 'authentication',
    targetModule: 'crm',
    entityTypes: ['user'],
    syncFrequency: 'real-time',
    conflictResolution: 'last-wins',
    isActive: true,
    lastSync: new Date(),
    successRate: 99.8
  },
  {
    id: 'financial-inventory-sync',
    name: 'Financial Inventory Sync',
    sourceModule: 'financial',
    targetModule: 'inventory',
    entityTypes: ['product', 'transaction'],
    syncFrequency: 'real-time',
    conflictResolution: 'auto-merge',
    isActive: true,
    lastSync: new Date(),
    successRate: 97.5
  },
  {
    id: 'project-analytics-sync',
    name: 'Project Analytics Sync',
    sourceModule: 'projects',
    targetModule: 'analytics',
    entityTypes: ['project', 'task', 'metric'],
    syncFrequency: 'hourly',
    conflictResolution: 'manual',
    isActive: true,
    lastSync: new Date(Date.now() - 3600000),
    successRate: 95.2
  },
  {
    id: 'crm-marketing-sync',
    name: 'CRM Marketing Automation',
    sourceModule: 'crm',
    targetModule: 'marketing',
    entityTypes: ['contact', 'campaign', 'lead'],
    syncFrequency: 'daily',
    conflictResolution: 'custom',
    isActive: false,
    successRate: 0
  },
];

export const InstantSync: React.FC = () => {
  const [rules, setRules] = useState<SyncRule[]>(SYNC_RULES);
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const [sessions, setSessions] = useState<SyncSession[]>([]);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'rules' | 'conflicts' | 'sessions'>('overview');
  const [isSyncing, setIsSyncing] = useState(false);

  // Simulate sync conflicts
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance of conflict
        const conflict: SyncConflict = {
          id: `conflict-${Date.now()}`,
          entityId: `entity-${Math.floor(Math.random() * 1000)}`,
          entityType: ['user', 'project', 'financial'][Math.floor(Math.random() * 3)],
          conflictingVersions: [
            {
              version: 1,
              data: { name: 'Original Data', value: Math.random() },
              modifiedBy: 'user1',
              timestamp: new Date(Date.now() - 300000),
              source: 'web-client'
            },
            {
              version: 2,
              data: { name: 'Modified Data', value: Math.random() },
              modifiedBy: 'user2',
              timestamp: new Date(),
              source: 'mobile-app'
            }
          ],
          status: 'pending'
        };
        setConflicts(prev => [conflict, ...prev.slice(0, 9)]); // Keep last 10 conflicts
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const startSync = useCallback(async () => {
    setIsSyncing(true);

    const session: SyncSession = {
      id: `sync-${Date.now()}`,
      modules: ['authentication', 'financial', 'inventory', 'crm', 'projects', 'analytics'],
      status: 'syncing',
      startTime: new Date(),
      entitiesSynced: 0,
      conflictsFound: 0,
      conflictsResolved: 0,
      progress: 0,
      errors: []
    };

    setSessions(prev => [session, ...prev]);

    // Simulate sync progress
    const progressInterval = setInterval(() => {
      setSessions(prev => prev.map(s =>
        s.id === session.id
          ? {
              ...s,
              progress: Math.min(100, s.progress + Math.random() * 15),
              entitiesSynced: Math.floor(s.progress * 10),
              conflictsFound: Math.floor(s.progress * 0.1),
              conflictsResolved: Math.floor(s.progress * 0.08)
            }
          : s
      ));
    }, 1000);

    setTimeout(() => {
      clearInterval(progressInterval);
      setSessions(prev => prev.map(s =>
        s.id === session.id
          ? {
              ...s,
              status: 'completed',
              endTime: new Date(),
              progress: 100
            }
          : s
      ));
      setIsSyncing(false);
    }, 8000);
  }, []);

  const resolveConflict = useCallback((conflictId: string, resolution: SyncConflict['resolution']) => {
    setConflicts(prev => prev.map(conflict =>
      conflict.id === conflictId
        ? {
            ...conflict,
            status: 'resolved',
            resolution,
            resolvedAt: new Date(),
            resolvedBy: 'admin'
          }
        : conflict
    ));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
      case 'resolved':
        return 'text-green-600 bg-green-100';
      case 'syncing':
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'inactive':
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'paused':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'syncing':
      case 'pending':
        return <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'inactive':
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const activeRules = rules.filter(r => r.isActive).length;
  const pendingConflicts = conflicts.filter(c => c.status === 'pending').length;
  const totalEntitiesSynced = sessions.reduce((sum, s) => sum + s.entitiesSynced, 0);
  const syncSuccessRate = rules.filter(r => r.isActive).reduce((sum, r) => sum + r.successRate, 0) / activeRules;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <RefreshCw className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Instant Synchronization</h1>
              <p className="text-gray-600">Real-time data sync across all platform modules</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={startSync}
              disabled={isSyncing}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Start Sync'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Rules</p>
              <p className="text-2xl font-bold text-gray-900">{activeRules}/{rules.length}</p>
            </div>
            <GitBranch className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Entities Synced</p>
              <p className="text-2xl font-bold text-gray-900">{totalEntitiesSynced.toLocaleString()}</p>
            </div>
            <Database className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Conflicts</p>
              <p className="text-2xl font-bold text-gray-900">{pendingConflicts}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{syncSuccessRate.toFixed(1)}%</p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setSelectedTab('overview')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setSelectedTab('rules')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedTab === 'rules'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Sync Rules
            </button>
            <button
              onClick={() => setSelectedTab('conflicts')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedTab === 'conflicts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Conflicts
            </button>
            <button
              onClick={() => setSelectedTab('sessions')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedTab === 'sessions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Sync Sessions
            </button>
          </nav>
        </div>

        <div className="p-6">
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Sync Health</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Connections</span>
                      <span className="text-sm font-medium text-green-600">{activeRules} modules</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Data Flow Rate</span>
                      <span className="text-sm font-medium text-blue-600">{(totalEntitiesSynced / 60).toFixed(0)} entities/min</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Conflict Resolution Rate</span>
                      <span className="text-sm font-medium text-purple-600">98.5%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average Latency</span>
                      <span className="text-sm font-medium text-yellow-600">45ms</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Module Connectivity</h3>
                  <div className="space-y-3">
                    {rules.map(rule => (
                      <div key={rule.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(rule.isActive ? 'active' : 'inactive')}
                          <span className="text-sm text-gray-900">{rule.sourceModule} → {rule.targetModule}</span>
                        </div>
                        <span className="text-xs text-gray-500">{rule.successRate.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {isSyncing && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">Synchronization in Progress</h4>
                      <p className="text-sm text-blue-700">Syncing data across all modules...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedTab === 'rules' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Synchronization Rules</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Create Rule
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rule
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Modules
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Frequency
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Success Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rules.map((rule) => (
                      <tr key={rule.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{rule.name}</div>
                            <div className="text-sm text-gray-500">{rule.entityTypes.join(', ')}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {rule.sourceModule} ↔ {rule.targetModule}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {rule.syncFrequency}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(rule.isActive ? 'active' : 'inactive')}`}>
                            {getStatusIcon(rule.isActive ? 'active' : 'inactive')}
                            <span className="ml-1">{rule.isActive ? 'Active' : 'Inactive'}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {rule.successRate.toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">
                            Edit
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            {rule.isActive ? 'Disable' : 'Enable'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedTab === 'conflicts' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Sync Conflicts</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Auto-resolve:</span>
                  <input type="checkbox" className="rounded" />
                </div>
              </div>

              {conflicts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <GitBranch className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No conflicts detected. All data is synchronized.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {conflicts.map((conflict) => (
                    <div key={conflict.id} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <AlertTriangle className="w-5 h-5 text-yellow-500" />
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">
                              Conflict in {conflict.entityType} #{conflict.entityId}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {conflict.conflictingVersions.length} conflicting versions
                            </p>
                          </div>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(conflict.status)}`}>
                          {conflict.status}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {conflict.conflictingVersions.map((version, index) => (
                          <div key={index} className="bg-gray-50 rounded-md p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-900">
                                Version {version.version} by {version.modifiedBy}
                              </span>
                              <span className="text-xs text-gray-500">
                                {version.timestamp.toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">Source: {version.source}</p>
                            <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
                              {JSON.stringify(version.data, null, 2)}
                            </pre>
                          </div>
                        ))}
                      </div>

                      {conflict.status === 'pending' && (
                        <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-200">
                          <span className="text-sm text-gray-600">Resolve with:</span>
                          {['local', 'remote', 'merge'].map((resolution) => (
                            <button
                              key={resolution}
                              onClick={() => resolveConflict(conflict.id, resolution as any)}
                              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 capitalize"
                            >
                              {resolution}
                            </button>
                          ))}
                        </div>
                      )}

                      {conflict.resolution && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-sm text-green-600">
                            Resolved with: {conflict.resolution} by {conflict.resolvedBy} at {conflict.resolvedAt?.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedTab === 'sessions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Sync Sessions</h3>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                  Export History
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Session
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Modules
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Entities
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Conflicts
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sessions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                          No sync sessions yet. Start a synchronization to see session history.
                        </td>
                      </tr>
                    ) : (
                      sessions.map((session) => (
                        <tr key={session.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {session.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {session.modules.length} modules
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${session.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-900">{session.progress.toFixed(0)}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(session.status)}`}>
                              {session.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {session.entitiesSynced}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {session.conflictsFound} ({session.conflictsResolved} resolved)
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {session.endTime
                              ? `${((session.endTime.getTime() - session.startTime.getTime()) / 1000).toFixed(1)}s`
                              : 'Running...'
                            }
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstantSync;