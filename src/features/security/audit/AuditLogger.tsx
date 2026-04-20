'use client';

import { useState, useEffect, useCallback } from 'react';

interface AuditEvent {
  id: string;
  timestamp: string;
  userId: string;
  userEmail?: string;
  action: string;
  resource: string;
  resourceId?: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  ipAddress: string;
  userAgent: string;
  statusCode: number;
  responseTime: number;
  location?: string;
  deviceInfo?: {
    browser: string;
    os: string;
    device: string;
  };
  changes?: {
    before: any;
    after: any;
  };
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  category: 'authentication' | 'authorization' | 'data_access' | 'data_modification' | 'security' | 'compliance' | 'system';
}

interface AuditFilters {
  userId: string;
  category: string;
  riskLevel: string;
  action: string;
  dateFrom: string;
  dateTo: string;
  statusCode: string;
}

interface AuditLoggerProps {
  tenantId?: string;
}

export default function AuditLogger({ tenantId = 'default' }: AuditLoggerProps) {
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const eventsPerPage = 50;

  const [filters, setFilters] = useState<AuditFilters>({
    userId: '',
    category: '',
    riskLevel: '',
    action: '',
    dateFrom: '',
    dateTo: '',
    statusCode: ''
  });

  useEffect(() => {
    fetchAuditEvents();
  }, [tenantId, currentPage, filters]);

  useEffect(() => {
    applyFilters();
  }, [auditEvents, filters]);

  const fetchAuditEvents = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        tenantId,
        page: currentPage.toString(),
        limit: eventsPerPage.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        )
      });

      const response = await fetch(`/api/security?action=audit_events&${queryParams}`);
      const data = await response.json();
      if (data.success) {
        setAuditEvents(data.data.events);
        setTotalEvents(data.data.total);
      }
    } catch (error) {
      console.error('Failed to fetch audit events:', error);
    } finally {
      setLoading(false);
    }
  }, [tenantId, currentPage, filters]);

  const applyFilters = useCallback(() => {
    let filtered = [...auditEvents];

    // Additional client-side filtering if needed
    setFilteredEvents(filtered);
  }, [auditEvents]);

  const exportAuditLog = async (format: 'csv' | 'json' | 'pdf') => {
    try {
      const response = await fetch('/api/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'export_audit_log',
          tenantId,
          filters,
          format
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-log-${new Date().toISOString().split('T')[0]}.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export audit log:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'authentication': return 'bg-blue-100 text-blue-800';
      case 'authorization': return 'bg-green-100 text-green-800';
      case 'data_access': return 'bg-purple-100 text-purple-800';
      case 'data_modification': return 'bg-yellow-100 text-yellow-800';
      case 'security': return 'bg-red-100 text-red-800';
      case 'compliance': return 'bg-indigo-100 text-indigo-800';
      case 'system': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return 'text-green-600';
    if (statusCode >= 400 && statusCode < 500) return 'text-yellow-600';
    if (statusCode >= 500) return 'text-red-600';
    return 'text-gray-600';
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-blue-100 text-blue-800';
      case 'POST': return 'bg-green-100 text-green-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const totalPages = Math.ceil(totalEvents / eventsPerPage);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Comprehensive Audit Logging</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => exportAuditLog('csv')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Export CSV
          </button>
          <button
            onClick={() => exportAuditLog('json')}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Export JSON
          </button>
          <button
            onClick={fetchAuditEvents}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Audit Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-blue-600">{totalEvents.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Risk Events</p>
              <p className="text-2xl font-bold text-red-600">
                {auditEvents.filter(e => e.riskLevel === 'high' || e.riskLevel === 'critical').length}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Failed Requests</p>
              <p className="text-2xl font-bold text-orange-600">
                {auditEvents.filter(e => e.statusCode >= 400).length}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold text-green-600">
                {auditEvents.length > 0
                  ? formatDuration(auditEvents.reduce((sum, e) => sum + e.responseTime, 0) / auditEvents.length)
                  : '0ms'
                }
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <input
            type="text"
            placeholder="User ID"
            value={filters.userId}
            onChange={(e) => setFilters({...filters, userId: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <select
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Categories</option>
            <option value="authentication">Authentication</option>
            <option value="authorization">Authorization</option>
            <option value="data_access">Data Access</option>
            <option value="data_modification">Data Modification</option>
            <option value="security">Security</option>
            <option value="compliance">Compliance</option>
            <option value="system">System</option>
          </select>
          <select
            value={filters.riskLevel}
            onChange={(e) => setFilters({...filters, riskLevel: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Risk Levels</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <input
            type="text"
            placeholder="Action"
            value={filters.action}
            onChange={(e) => setFilters({...filters, action: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="date"
            placeholder="From Date"
            value={filters.dateFrom}
            onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="date"
            placeholder="To Date"
            value={filters.dateTo}
            onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={() => {
              setFilters({
                userId: '',
                category: '',
                riskLevel: '',
                action: '',
                dateFrom: '',
                dateTo: '',
                statusCode: ''
              });
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Audit Events Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(event.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {event.userEmail || event.userId}
                      </div>
                      <div className="text-sm text-gray-500">{event.ipAddress}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{event.action}</div>
                      <div className="text-sm text-gray-500">{event.resource}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(event.category)}`}>
                      {event.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(event.riskLevel)}`}>
                      {event.riskLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getStatusColor(event.statusCode)}`}>
                      {event.statusCode}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDuration(event.responseTime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * eventsPerPage) + 1} to {Math.min(currentPage * eventsPerPage, totalEvents)} of {totalEvents} events
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-4/5 shadow-lg rounded-md bg-white max-h-screen overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Audit Event Details</h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold mb-3">Event Information</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Event ID</div>
                      <div className="text-sm font-mono text-gray-900">{selectedEvent.id}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Timestamp</div>
                      <div className="text-sm text-gray-900">{new Date(selectedEvent.timestamp).toLocaleString()}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">User</div>
                    <div className="text-sm text-gray-900">
                      {selectedEvent.userEmail || selectedEvent.userId}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Action</div>
                      <div className="text-sm font-medium text-gray-900">{selectedEvent.action}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Method</div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMethodColor(selectedEvent.method)}`}>
                        {selectedEvent.method}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Category</div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(selectedEvent.category)}`}>
                        {selectedEvent.category.replace('_', ' ')}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Risk Level</div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(selectedEvent.riskLevel)}`}>
                        {selectedEvent.riskLevel}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Status Code</div>
                      <span className={`text-sm font-medium ${getStatusColor(selectedEvent.statusCode)}`}>
                        {selectedEvent.statusCode}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Response Time</div>
                      <div className="text-sm text-gray-900">{formatDuration(selectedEvent.responseTime)}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-3">Technical Details</h4>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600">Resource</div>
                    <div className="text-sm font-mono text-gray-900 bg-gray-100 p-2 rounded">
                      {selectedEvent.resource}
                      {selectedEvent.resourceId && ` (${selectedEvent.resourceId})`}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">IP Address</div>
                    <div className="text-sm font-mono text-gray-900">{selectedEvent.ipAddress}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">User Agent</div>
                    <div className="text-sm text-gray-900 truncate" title={selectedEvent.userAgent}>
                      {selectedEvent.userAgent}
                    </div>
                  </div>

                  {selectedEvent.location && (
                    <div>
                      <div className="text-sm text-gray-600">Location</div>
                      <div className="text-sm text-gray-900">{selectedEvent.location}</div>
                    </div>
                  )}

                  {selectedEvent.deviceInfo && (
                    <div>
                      <div className="text-sm text-gray-600">Device Info</div>
                      <div className="text-sm text-gray-900">
                        {selectedEvent.deviceInfo.browser} on {selectedEvent.deviceInfo.os} ({selectedEvent.deviceInfo.device})
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Changes Diff */}
            {selectedEvent.changes && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-3">Changes Made</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Before</h5>
                    <pre className="text-xs bg-red-50 p-3 rounded border overflow-x-auto">
                      {JSON.stringify(selectedEvent.changes.before, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">After</h5>
                    <pre className="text-xs bg-green-50 p-3 rounded border overflow-x-auto">
                      {JSON.stringify(selectedEvent.changes.after, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}