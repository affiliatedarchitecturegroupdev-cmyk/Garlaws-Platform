'use client';

import { useState, useEffect, useCallback } from 'react';

interface SyncJob {
  id: string;
  name: string;
  source: string;
  target: string;
  status: 'idle' | 'running' | 'completed' | 'failed' | 'scheduled';
  lastRun?: string;
  nextRun?: string;
  duration?: number;
  recordsProcessed: number;
  recordsFailed: number;
  schedule: 'manual' | 'hourly' | 'daily' | 'weekly';
  entities: string[];
  lastError?: string;
}

interface SyncStats {
  totalJobs: number;
  activeJobs: number;
  completedToday: number;
  failedToday: number;
  totalRecordsSynced: number;
}

interface DataSyncEngineProps {
  tenantId?: string;
}

export default function DataSyncEngine({ tenantId = 'default' }: DataSyncEngineProps) {
  const [syncJobs, setSyncJobs] = useState<SyncJob[]>([]);
  const [stats, setStats] = useState<SyncStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<SyncJob | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newJobName, setNewJobName] = useState('');
  const [newJobSource, setNewJobSource] = useState('');
  const [newJobTarget, setNewJobTarget] = useState('');
  const [newJobSchedule, setNewJobSchedule] = useState<'manual' | 'hourly' | 'daily' | 'weekly'>('daily');
  const [newJobEntities, setNewJobEntities] = useState<string[]>([]);

  const availableSystems = [
    'Garlaws Platform',
    'Salesforce',
    'Microsoft Dynamics',
    'SAP',
    'QuickBooks',
    'Xero',
    'Slack',
    'Microsoft Teams',
    'Google Workspace'
  ];

  const availableEntities = [
    'Users', 'Contacts', 'Accounts', 'Opportunities',
    'Projects', 'Tasks', 'Invoices', 'Payments',
    'Products', 'Inventory', 'Orders', 'Shipments'
  ];

  const fetchSyncJobs = useCallback(async () => {
    try {
      const response = await fetch(`/api/integrations?action=sync-jobs&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setSyncJobs(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch sync jobs:', error);
    }
  }, [tenantId]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`/api/integrations?action=sync-stats&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch sync stats:', error);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchSyncJobs();
    fetchStats();
  }, [fetchSyncJobs, fetchStats]);

  const createSyncJob = async () => {
    if (!newJobName.trim() || !newJobSource || !newJobTarget || newJobEntities.length === 0) return;

    try {
      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-sync-job',
          tenantId,
          name: newJobName,
          source: newJobSource,
          target: newJobTarget,
          schedule: newJobSchedule,
          entities: newJobEntities
        })
      });

      const data = await response.json();
      if (data.success) {
        setSyncJobs([...syncJobs, data.data]);
        setShowCreateForm(false);
        resetForm();
        fetchStats();
      }
    } catch (error) {
      console.error('Failed to create sync job:', error);
    }
  };

  const resetForm = () => {
    setNewJobName('');
    setNewJobSource('');
    setNewJobTarget('');
    setNewJobSchedule('daily');
    setNewJobEntities([]);
  };

  const runSyncJob = async (jobId: string) => {
    try {
      setSyncJobs(syncJobs.map(job =>
        job.id === jobId ? { ...job, status: 'running' } : job
      ));

      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'run-sync-job',
          tenantId,
          jobId
        })
      });

      const data = await response.json();

      setSyncJobs(syncJobs.map(job =>
        job.id === jobId ? {
          ...job,
          status: data.success ? 'completed' : 'failed',
          lastRun: new Date().toISOString(),
          recordsProcessed: data.recordsProcessed || 0,
          recordsFailed: data.recordsFailed || 0,
          lastError: data.error
        } : job
      ));

      fetchStats();
    } catch (error) {
      console.error('Failed to run sync job:', error);
      setSyncJobs(syncJobs.map(job =>
        job.id === jobId ? { ...job, status: 'failed' } : job
      ));
    }
  };

  const deleteSyncJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this sync job?')) return;

    try {
      const response = await fetch('/api/integrations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete-sync-job',
          tenantId,
          jobId
        })
      });

      const data = await response.json();
      if (data.success) {
        setSyncJobs(syncJobs.filter(job => job.id !== jobId));
        fetchStats();
      }
    } catch (error) {
      console.error('Failed to delete sync job:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'scheduled': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScheduleIcon = (schedule: string) => {
    switch (schedule) {
      case 'manual': return '👤';
      case 'hourly': return '⏰';
      case 'daily': return '📅';
      case 'weekly': return '📊';
      default: return '⚙️';
    }
  };

  const handleEntityToggle = (entity: string) => {
    setNewJobEntities(prev =>
      prev.includes(entity)
        ? prev.filter(e => e !== entity)
        : [...prev, entity]
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
        <h2 className="text-2xl font-bold text-gray-900">Data Synchronization Engine</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Create Sync Job
        </button>
      </div>

      {/* Overview Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeJobs}</p>
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
                <p className="text-sm font-medium text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold text-purple-600">{stats.completedToday}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed Today</p>
                <p className="text-2xl font-bold text-red-600">{stats.failedToday}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Records Synced</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.totalRecordsSynced.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-full">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Sync Job Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Create New Sync Job</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Name</label>
              <input
                type="text"
                value={newJobName}
                onChange={(e) => setNewJobName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Customer Data Sync"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source System</label>
              <select
                value={newJobSource}
                onChange={(e) => setNewJobSource(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select source...</option>
                {availableSystems.map((system) => (
                  <option key={system} value={system}>{system}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target System</label>
              <select
                value={newJobTarget}
                onChange={(e) => setNewJobTarget(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select target...</option>
                {availableSystems.filter(s => s !== newJobSource).map((system) => (
                  <option key={system} value={system}>{system}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
              <select
                value={newJobSchedule}
                onChange={(e) => setNewJobSchedule(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="manual">Manual</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Entities to Sync</label>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                {availableEntities.map((entity) => (
                  <label key={entity} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newJobEntities.includes(entity)}
                      onChange={() => handleEntityToggle(entity)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{entity}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={createSyncJob}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Create Sync Job
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

      {/* Sync Jobs List */}
      <div className="grid grid-cols-1 gap-4">
        {syncJobs.map((job) => (
          <div
            key={job.id}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{job.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                  <span className="text-sm text-gray-600">
                    {getScheduleIcon(job.schedule)} {job.schedule}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  <span>{job.source} → {job.target}</span>
                  <span>Entities: {job.entities.join(', ')}</span>
                  <span>Processed: {job.recordsProcessed.toLocaleString()}</span>
                  {job.recordsFailed > 0 && (
                    <span className="text-red-600">Failed: {job.recordsFailed.toLocaleString()}</span>
                  )}
                </div>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  {job.lastRun && <span>Last run: {new Date(job.lastRun).toLocaleString()}</span>}
                  {job.nextRun && <span>Next run: {new Date(job.nextRun).toLocaleString()}</span>}
                  {job.duration && <span>Duration: {job.duration}s</span>}
                </div>
                {job.lastError && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    Last error: {job.lastError}
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => runSyncJob(job.id)}
                disabled={job.status === 'running'}
                className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {job.status === 'running' ? 'Running...' : 'Run Sync'}
              </button>
              <button
                onClick={() => setSelectedJob(job)}
                className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
              >
                Details
              </button>
              <button
                onClick={() => deleteSyncJob(job.id)}
                className="px-3 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {syncJobs.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-6xl mb-4">🔄</div>
            <p className="text-lg">No sync jobs configured</p>
            <p className="text-sm">Create synchronization jobs to keep your data consistent across systems.</p>
          </div>
        )}
      </div>

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{selectedJob.name} - Details</h3>
              <button
                onClick={() => setSelectedJob(null)}
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
                  <h4 className="font-semibold text-gray-900 mb-1">Source</h4>
                  <p className="text-lg font-bold text-gray-900">{selectedJob.source}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">Target</h4>
                  <p className="text-lg font-bold text-gray-900">{selectedJob.target}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">Status</h4>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(selectedJob.status)}`}>
                    {selectedJob.status}
                  </span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">Schedule</h4>
                  <div className="flex items-center space-x-2">
                    <span>{getScheduleIcon(selectedJob.schedule)}</span>
                    <span className="text-sm capitalize">{selectedJob.schedule}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Entities ({selectedJob.entities.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.entities.map((entity, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {entity}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Records Processed</h4>
                  <p className="text-2xl font-bold text-green-600">{selectedJob.recordsProcessed.toLocaleString()}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">Records Failed</h4>
                  <p className="text-2xl font-bold text-red-600">{selectedJob.recordsFailed.toLocaleString()}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Success Rate</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {selectedJob.recordsProcessed + selectedJob.recordsFailed > 0
                      ? Math.round((selectedJob.recordsProcessed / (selectedJob.recordsProcessed + selectedJob.recordsFailed)) * 100)
                      : 0}%
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Last Execution</h4>
                  {selectedJob.lastRun ? (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        {new Date(selectedJob.lastRun).toLocaleString()}
                      </p>
                      {selectedJob.duration && (
                        <p className="text-sm text-gray-600">Duration: {selectedJob.duration} seconds</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Never executed</p>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Next Scheduled Run</h4>
                  {selectedJob.nextRun ? (
                    <p className="text-sm text-gray-600">
                      {new Date(selectedJob.nextRun).toLocaleString()}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">Not scheduled</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}