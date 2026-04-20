'use client';

import { useState, useEffect, useCallback } from 'react';

interface PerformanceTest {
  id: string;
  name: string;
  description: string;
  type: 'load' | 'stress' | 'spike' | 'volume' | 'endurance';
  status: 'idle' | 'running' | 'completed' | 'failed';
  startTime?: string;
  endTime?: string;
  duration?: number;
  configuration: PerformanceTestConfig;
  results?: PerformanceResults;
  metrics: PerformanceMetric[];
}

interface PerformanceTestConfig {
  duration: number; // seconds
  virtualUsers: number;
  rampUpTime: number; // seconds
  targetUrl: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  payload?: any;
  headers?: Record<string, string>;
  assertions?: PerformanceAssertion[];
}

interface PerformanceAssertion {
  type: 'response_time' | 'error_rate' | 'throughput';
  condition: 'lt' | 'gt' | 'eq' | 'lte' | 'gte';
  value: number;
  target: string;
}

interface PerformanceResults {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  errorRate: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  throughput: number; // requests per second
  dataTransferred: number; // bytes
}

interface PerformanceMetric {
  timestamp: string;
  responseTime: number;
  status: number;
  success: boolean;
  userCount: number;
  errorMessage?: string;
}

interface PerformanceTestingToolsProps {
  tenantId?: string;
}

export default function PerformanceTestingTools({ tenantId = 'default' }: PerformanceTestingToolsProps) {
  const [tests, setTests] = useState<PerformanceTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<PerformanceTest | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [runningTests, setRunningTests] = useState<Set<string>>(new Set());
  const [newTest, setNewTest] = useState<Partial<PerformanceTest>>({
    name: '',
    description: '',
    type: 'load',
    configuration: {
      duration: 60,
      virtualUsers: 10,
      rampUpTime: 10,
      targetUrl: '',
      method: 'GET'
    }
  });

  const fetchTests = useCallback(async () => {
    try {
      const response = await fetch(`/api/qa?action=performance-tests&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setTests(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch performance tests:', error);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const createTest = async () => {
    if (!newTest.name || !newTest.configuration?.targetUrl) return;

    try {
      const response = await fetch('/api/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-performance-test',
          tenantId,
          test: newTest
        })
      });

      const data = await response.json();
      if (data.success) {
        setTests([...tests, data.data]);
        setShowCreateForm(false);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to create performance test:', error);
    }
  };

  const resetForm = () => {
    setNewTest({
      name: '',
      description: '',
      type: 'load',
      configuration: {
        duration: 60,
        virtualUsers: 10,
        rampUpTime: 10,
        targetUrl: '',
        method: 'GET'
      }
    });
  };

  const runTest = async (testId: string) => {
    setRunningTests(prev => new Set(prev).add(testId));

    try {
      const response = await fetch('/api/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'run-performance-test',
          tenantId,
          testId
        })
      });

      const data = await response.json();
      if (data.success) {
        setTests(tests.map(t => t.id === testId ? { ...t, status: 'running' } : t));
        pollTestStatus(testId);
      }
    } catch (error) {
      console.error('Failed to run performance test:', error);
      setRunningTests(prev => {
        const newSet = new Set(prev);
        newSet.delete(testId);
        return newSet;
      });
    }
  };

  const pollTestStatus = (testId: string) => {
    const poll = async () => {
      try {
        const response = await fetch(`/api/qa?action=performance-test-status&testId=${testId}&tenantId=${tenantId}`);
        const data = await response.json();
        if (data.success) {
          const updatedTest = data.data;
          setTests(prev => prev.map(t => t.id === testId ? updatedTest : t));

          if (updatedTest.status !== 'running') {
            setRunningTests(prev => {
              const newSet = new Set(prev);
              newSet.delete(testId);
              return newSet;
            });
          } else {
            setTimeout(poll, 5000); // Poll every 5 seconds for performance tests
          }
        }
      } catch (error) {
        console.error('Failed to poll test status:', error);
      }
    };

    setTimeout(poll, 5000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'load': return '🏋️';
      case 'stress': return '💪';
      case 'spike': return '⚡';
      case 'volume': return '📊';
      case 'endurance': return '🏃';
      default: return '❓';
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
        <h2 className="text-2xl font-bold text-gray-900">Performance Testing Tools</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Create New Test
        </button>
      </div>

      {/* Create Test Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Create Performance Test</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Test Name</label>
              <input
                type="text"
                value={newTest.name || ''}
                onChange={(e) => setNewTest(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="API Load Test"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={newTest.description || ''}
                onChange={(e) => setNewTest(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Test description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Test Type</label>
              <select
                value={newTest.type || 'load'}
                onChange={(e) => setNewTest(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="load">Load Test</option>
                <option value="stress">Stress Test</option>
                <option value="spike">Spike Test</option>
                <option value="volume">Volume Test</option>
                <option value="endurance">Endurance Test</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target URL</label>
              <input
                type="url"
                value={newTest.configuration?.targetUrl || ''}
                onChange={(e) => setNewTest(prev => ({
                  ...prev,
                  configuration: { ...prev.configuration!, targetUrl: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://api.example.com/endpoint"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">HTTP Method</label>
              <select
                value={newTest.configuration?.method || 'GET'}
                onChange={(e) => setNewTest(prev => ({
                  ...prev,
                  configuration: { ...prev.configuration!, method: e.target.value as any }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Virtual Users</label>
              <input
                type="number"
                value={newTest.configuration?.virtualUsers || 10}
                onChange={(e) => setNewTest(prev => ({
                  ...prev,
                  configuration: { ...prev.configuration!, virtualUsers: parseInt(e.target.value) }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                min="1"
                max="1000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (seconds)</label>
              <input
                type="number"
                value={newTest.configuration?.duration || 60}
                onChange={(e) => setNewTest(prev => ({
                  ...prev,
                  configuration: { ...prev.configuration!, duration: parseInt(e.target.value) }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                min="10"
                max="3600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ramp Up Time (seconds)</label>
              <input
                type="number"
                value={newTest.configuration?.rampUpTime || 10}
                onChange={(e) => setNewTest(prev => ({
                  ...prev,
                  configuration: { ...prev.configuration!, rampUpTime: parseInt(e.target.value) }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                min="0"
                max="300"
              />
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={createTest}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Create Test
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

      {/* Performance Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tests.map((test) => (
          <div
            key={test.id}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getTypeIcon(test.type)}</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{test.name}</h3>
                  <p className="text-sm text-gray-600">{test.description}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(test.status)}`}>
                {test.status}
              </span>
            </div>

            {/* Configuration Summary */}
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <span className="text-gray-600">Target:</span>
                <div className="font-medium text-gray-900 truncate">{test.configuration.targetUrl}</div>
              </div>
              <div>
                <span className="text-gray-600">Users:</span>
                <div className="font-medium text-gray-900">{test.configuration.virtualUsers}</div>
              </div>
              <div>
                <span className="text-gray-600">Duration:</span>
                <div className="font-medium text-gray-900">{formatDuration(test.configuration.duration)}</div>
              </div>
              <div>
                <span className="text-gray-600">Method:</span>
                <div className="font-medium text-gray-900">{test.configuration.method}</div>
              </div>
            </div>

            {/* Results Summary */}
            {test.results && (
              <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg text-sm">
                <div className="text-center">
                  <div className="font-semibold text-gray-900">{test.results.averageResponseTime}ms</div>
                  <div className="text-gray-600">Avg Response</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-600">{test.results.throughput}/s</div>
                  <div className="text-gray-600">Throughput</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-red-600">{test.results.errorRate}%</div>
                  <div className="text-gray-600">Error Rate</div>
                </div>
              </div>
            )}

            {/* Test Timing */}
            {test.startTime && (
              <div className="mb-4 text-sm text-gray-600">
                Started: {new Date(test.startTime).toLocaleString()}
                {test.endTime && ` • Completed: ${new Date(test.endTime).toLocaleString()}`}
              </div>
            )}

            <div className="flex space-x-2">
              <button
                onClick={() => runTest(test.id)}
                disabled={runningTests.has(test.id) || test.status === 'running'}
                className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                {runningTests.has(test.id) ? 'Running...' : 'Run Test'}
              </button>
              <button
                onClick={() => setSelectedTest(test)}
                className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                View Details
              </button>
            </div>
          </div>
        ))}

        {tests.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">
            <div className="text-6xl mb-4">⚡</div>
            <p className="text-lg">No performance tests configured</p>
            <p className="text-sm">Create performance tests to measure system capacity and identify bottlenecks.</p>
          </div>
        )}
      </div>

      {/* Test Detail Modal */}
      {selectedTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {selectedTest.name} - Performance Results
              </h3>
              <button
                onClick={() => setSelectedTest(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Test Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">Status</h4>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(selectedTest.status)}`}>
                    {selectedTest.status}
                  </span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">Type</h4>
                  <p className="text-lg font-bold text-gray-900">{selectedTest.type}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">Duration</h4>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedTest.duration ? formatDuration(selectedTest.duration) : 'N/A'}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">Virtual Users</h4>
                  <p className="text-lg font-bold text-gray-900">{selectedTest.configuration.virtualUsers}</p>
                </div>
              </div>

              {/* Performance Results */}
              {selectedTest.results && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4">Response Times</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Average:</span>
                        <span className="font-medium">{selectedTest.results.averageResponseTime}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Min:</span>
                        <span className="font-medium">{selectedTest.results.minResponseTime}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Max:</span>
                        <span className="font-medium">{selectedTest.results.maxResponseTime}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">95th Percentile:</span>
                        <span className="font-medium">{selectedTest.results.p95ResponseTime}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">99th Percentile:</span>
                        <span className="font-medium">{selectedTest.results.p99ResponseTime}ms</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4">Throughput & Errors</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Requests:</span>
                        <span className="font-medium">{selectedTest.results.totalRequests.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Successful:</span>
                        <span className="font-medium text-green-600">{selectedTest.results.successfulRequests.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Failed:</span>
                        <span className="font-medium text-red-600">{selectedTest.results.failedRequests.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Throughput:</span>
                        <span className="font-medium">{selectedTest.results.throughput}/s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Error Rate:</span>
                        <span className="font-medium text-red-600">{selectedTest.results.errorRate}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4">Data Transfer</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Data Transferred:</span>
                        <span className="font-medium">{(selectedTest.results.dataTransferred / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Configuration Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-4">Test Configuration</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Target URL:</span>
                    <div className="font-medium text-gray-900 break-all">{selectedTest.configuration.targetUrl}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Method:</span>
                    <div className="font-medium text-gray-900">{selectedTest.configuration.method}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Ramp Up Time:</span>
                    <div className="font-medium text-gray-900">{selectedTest.configuration.rampUpTime}s</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Duration:</span>
                    <div className="font-medium text-gray-900">{formatDuration(selectedTest.configuration.duration)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}