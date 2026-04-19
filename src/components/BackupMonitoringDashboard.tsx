'use client';

import React, { useState, useEffect } from 'react';

interface BackupJob {
  id: string;
  name: string;
  type: string;
  status: string;
  schedule: any;
  lastRun?: Date;
  nextRun?: Date;
  lastResult?: any;
}

interface BackupResult {
  id: string;
  jobId: string;
  status: string;
  startTime: Date;
  endTime: Date;
  size: number;
  fileCount: number;
  location: string;
}

interface SystemHealth {
  overall: string;
  components: {
    database: { status: string; responseTime: number };
    application: { status: string; responseTime: number };
    storage: { status: string; availableSpace: string };
    network: { status: string; latency: number };
    backup_system: { status: string; lastBackup: Date };
  };
}

export function BackupMonitoringDashboard() {
  const [backupJobs, setBackupJobs] = useState<BackupJob[]>([]);
  const [recentBackups, setRecentBackups] = useState<BackupResult[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'history' | 'health'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    // Refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load backup jobs
      const jobsResponse = await fetch('/api/backup/database?action=jobs');
      const jobsData = await jobsResponse.json();
      if (jobsData.success) {
        setBackupJobs(jobsData.data);
      }

      // Load recent backups
      const backupsResponse = await fetch('/api/backup/database?action=backups');
      const backupsData = await backupsResponse.json();
      if (backupsData.success) {
        setRecentBackups(backupsData.data.slice(0, 10));
      }

      // Load system health
      const healthResponse = await fetch('/api/backup/disaster-recovery?action=system_status');
      const healthData = await healthResponse.json();
      if (healthData.success) {
        setSystemHealth(healthData.data);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const runBackupJob = async (jobId: string) => {
    try {
      const response = await fetch('/api/backup/database?action=execute_backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId })
      });

      if (response.ok) {
        // Refresh data
        loadDashboardData();
      }
    } catch (error) {
      console.error('Error running backup job:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'healthy':
      case 'success':
        return 'bg-green-500';
      case 'running':
        return 'bg-blue-500';
      case 'failed':
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'scheduled':
      case 'pending':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (start: Date, end: Date) => {
    const duration = new Date(end).getTime() - new Date(start).getTime();
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Backup & Recovery Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor backup jobs, system health, and recovery capabilities</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'jobs', label: 'Backup Jobs' },
            { key: 'history', label: 'Backup History' },
            { key: 'health', label: 'System Health' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Backup Jobs Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Backup Jobs</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Jobs:</span>
                <span className="font-medium">{backupJobs.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active:</span>
                <span className="font-medium text-green-600">
                  {backupJobs.filter(job => job.status === 'scheduled').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Failed:</span>
                <span className="font-medium text-red-600">
                  {backupJobs.filter(job => job.lastResult?.status === 'failed').length}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Backups */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Backups</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Last 24h:</span>
                <span className="font-medium">
                  {recentBackups.filter(b => {
                    const age = Date.now() - new Date(b.startTime).getTime();
                    return age < 24 * 60 * 60 * 1000;
                  }).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Success Rate:</span>
                <span className="font-medium text-green-600">
                  {recentBackups.length > 0
                    ? Math.round((recentBackups.filter(b => b.status === 'success').length / recentBackups.length) * 100)
                    : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Size:</span>
                <span className="font-medium">
                  {formatBytes(recentBackups.reduce((sum, b) => sum + b.size, 0))}
                </span>
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
            {systemHealth && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Overall:</span>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${getStatusColor(systemHealth.overall)}`}></div>
                    <span className="font-medium capitalize">{systemHealth.overall}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  Last checked: {new Date(systemHealth.components.backup_system.lastBackup).toLocaleTimeString()}
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={loadDashboardData}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
              >
                Refresh Data
              </button>
              <button
                onClick={() => runBackupJob(backupJobs[0]?.id)}
                disabled={!backupJobs.length}
                className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 text-sm"
              >
                Run Full Backup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backup Jobs Tab */}
      {activeTab === 'jobs' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Backup Jobs</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Run
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Next Run
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {backupJobs.map(job => (
                  <tr key={job.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{job.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 capitalize">{job.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(job.status)}`}></div>
                        <span className="text-sm text-gray-900 capitalize">{job.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {job.lastRun ? new Date(job.lastRun).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {job.nextRun ? new Date(job.nextRun).toLocaleString() : 'Not scheduled'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => runBackupJob(job.id)}
                        disabled={job.status === 'running'}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50 text-xs"
                      >
                        Run Now
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Backup History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Backup History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Backup ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentBackups.map(backup => (
                  <tr key={backup.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{backup.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(backup.status)}`}></div>
                        <span className="text-sm text-gray-900 capitalize">{backup.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(backup.startTime).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDuration(backup.startTime, backup.endTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatBytes(backup.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="max-w-xs truncate" title={backup.location}>
                        {backup.location}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* System Health Tab */}
      {activeTab === 'health' && systemHealth && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Component Status</h3>
            <div className="space-y-4">
              {Object.entries(systemHealth.components).map(([component, status]) => (
                <div key={component} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${getStatusColor(status.status)}`}></div>
                    <span className="text-sm font-medium capitalize">
                      {component.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {component === 'database' || component === 'application'
                      ? `${(status as any).responseTime}ms`
                      : component === 'storage'
                      ? (status as any).availableSpace
                      : component === 'network'
                      ? `${(status as any).latency}ms`
                      : new Date((status as any).lastBackup).toLocaleTimeString()
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Overall Status:</span>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${getStatusColor(systemHealth.overall)}`}></div>
                  <span className="font-medium capitalize">{systemHealth.overall}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Last Checked:</span>
                <span className="text-sm">{new Date().toLocaleTimeString()}</span>
              </div>
              <div className="pt-3 border-t">
                <p className="text-sm text-gray-600">
                  {systemHealth.overall === 'healthy'
                    ? 'All systems are operating normally.'
                    : 'Some systems require attention.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}