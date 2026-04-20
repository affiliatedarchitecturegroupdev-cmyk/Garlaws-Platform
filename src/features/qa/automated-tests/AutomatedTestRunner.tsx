'use client';

import { useState, useEffect, useCallback } from 'react';

interface TestSuite {
  id: string;
  name: string;
  description: string;
  type: 'unit' | 'integration' | 'e2e' | 'api' | 'performance';
  status: 'idle' | 'running' | 'passed' | 'failed' | 'error';
  lastRun?: string;
  duration?: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  coverage?: number;
  testResults: TestResult[];
}

interface TestResult {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'skipped' | 'error';
  duration: number;
  error?: string;
  stackTrace?: string;
  screenshots?: string[];
}

interface AutomatedTestRunnerProps {
  tenantId?: string;
}

export default function AutomatedTestRunner({ tenantId = 'default' }: AutomatedTestRunnerProps) {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSuite, setSelectedSuite] = useState<TestSuite | null>(null);
  const [runningSuites, setRunningSuites] = useState<Set<string>>(new Set());
  const [ciStatus, setCiStatus] = useState<'idle' | 'running' | 'passed' | 'failed'>('idle');
  const [testFilters, setTestFilters] = useState({
    type: 'all' as 'all' | 'unit' | 'integration' | 'e2e' | 'api' | 'performance',
    status: 'all' as 'all' | 'idle' | 'running' | 'passed' | 'failed' | 'error'
  });

  const fetchTestSuites = useCallback(async () => {
    try {
      const response = await fetch(`/api/qa?action=test-suites&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setTestSuites(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch test suites:', error);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchTestSuites();
  }, [fetchTestSuites]);

  const runTestSuite = async (suiteId: string) => {
    setRunningSuites(prev => new Set(prev).add(suiteId));

    try {
      const response = await fetch('/api/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'run-test-suite',
          tenantId,
          suiteId
        })
      });

      const data = await response.json();
      if (data.success) {
        // Update suite status
        setTestSuites(prev => prev.map(suite =>
          suite.id === suiteId
            ? { ...suite, status: 'running' as const }
            : suite
        ));

        // Poll for completion
        pollTestSuiteStatus(suiteId);
      }
    } catch (error) {
      console.error('Failed to run test suite:', error);
      setRunningSuites(prev => {
        const newSet = new Set(prev);
        newSet.delete(suiteId);
        return newSet;
      });
    }
  };

  const pollTestSuiteStatus = (suiteId: string) => {
    const poll = async () => {
      try {
        const response = await fetch(`/api/qa?action=test-suite-status&suiteId=${suiteId}&tenantId=${tenantId}`);
        const data = await response.json();
        if (data.success) {
          const updatedSuite = data.data;
          setTestSuites(prev => prev.map(suite =>
            suite.id === suiteId ? updatedSuite : suite
          ));

          if (updatedSuite.status !== 'running') {
            setRunningSuites(prev => {
              const newSet = new Set(prev);
              newSet.delete(suiteId);
              return newSet;
            });
          } else {
            // Continue polling
            setTimeout(poll, 2000);
          }
        }
      } catch (error) {
        console.error('Failed to poll test suite status:', error);
      }
    };

    setTimeout(poll, 2000);
  };

  const runAllTestSuites = async () => {
    const filteredSuites = getFilteredSuites();
    setCiStatus('running');

    try {
      const response = await fetch('/api/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'run-all-test-suites',
          tenantId,
          suiteIds: filteredSuites.map(s => s.id)
        })
      });

      const data = await response.json();
      if (data.success) {
        // Start polling all suites
        filteredSuites.forEach(suite => {
          setRunningSuites(prev => new Set(prev).add(suite.id));
          setTestSuites(prev => prev.map(s =>
            s.id === suite.id ? { ...s, status: 'running' as const } : s
          ));
          pollTestSuiteStatus(suite.id);
        });
      }
    } catch (error) {
      console.error('Failed to run all test suites:', error);
      setCiStatus('failed');
    }
  };

  const getFilteredSuites = () => {
    return testSuites.filter(suite => {
      const typeMatch = testFilters.type === 'all' || suite.type === testFilters.type;
      const statusMatch = testFilters.status === 'all' || suite.status === testFilters.status;
      return typeMatch && statusMatch;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'error': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'unit': return '🧪';
      case 'integration': return '🔗';
      case 'e2e': return '🌐';
      case 'api': return '📡';
      case 'performance': return '⚡';
      default: return '❓';
    }
  };

  const calculateOverallStats = () => {
    const total = testSuites.length;
    const running = testSuites.filter(s => s.status === 'running').length;
    const passed = testSuites.filter(s => s.status === 'passed').length;
    const failed = testSuites.filter(s => s.status === 'failed').length;
    const idle = testSuites.filter(s => s.status === 'idle').length;

    return { total, running, passed, failed, idle };
  };

  const stats = calculateOverallStats();

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <h2 className="text-2xl font-bold text-gray-900">Automated Test Suite Runner</h2>
        <div className="flex space-x-3">
          <button
            onClick={runAllTestSuites}
            disabled={ciStatus === 'running' || stats.running > 0}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
          >
            {ciStatus === 'running' ? 'CI Running...' : 'Run All Tests'}
          </button>
          <button
            onClick={fetchTestSuites}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Suites</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{stats.running}</div>
          <div className="text-sm text-gray-600">Running</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{stats.passed}</div>
          <div className="text-sm text-gray-600">Passed</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          <div className="text-sm text-gray-600">Failed</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-gray-600">{stats.idle}</div>
          <div className="text-sm text-gray-600">Idle</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">
            {stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0}%
          </div>
          <div className="text-sm text-gray-600">Success Rate</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-3">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Test Type</label>
            <select
              value={testFilters.type}
              onChange={(e) => setTestFilters(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="unit">Unit Tests</option>
              <option value="integration">Integration Tests</option>
              <option value="e2e">E2E Tests</option>
              <option value="api">API Tests</option>
              <option value="performance">Performance Tests</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={testFilters.status}
              onChange={(e) => setTestFilters(prev => ({ ...prev, status: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="idle">Idle</option>
              <option value="running">Running</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>
      </div>

      {/* Test Suites List */}
      <div className="grid grid-cols-1 gap-4">
        {getFilteredSuites().map((suite) => (
          <div
            key={suite.id}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">{getTypeIcon(suite.type)}</span>
                  <h3 className="text-lg font-semibold text-gray-900">{suite.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(suite.status)}`}>
                    {suite.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{suite.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Last run: {suite.lastRun ? new Date(suite.lastRun).toLocaleString() : 'Never'}</span>
                  <span>Duration: {suite.duration ? `${suite.duration}s` : 'N/A'}</span>
                  <span>Coverage: {suite.coverage ? `${suite.coverage}%` : 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Test Results Summary */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{suite.totalTests}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{suite.passedTests}</div>
                <div className="text-sm text-gray-600">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{suite.failedTests}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{suite.skippedTests}</div>
                <div className="text-sm text-gray-600">Skipped</div>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => runTestSuite(suite.id)}
                disabled={runningSuites.has(suite.id) || suite.status === 'running'}
                className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                {runningSuites.has(suite.id) ? 'Running...' : 'Run Tests'}
              </button>
              <button
                onClick={() => setSelectedSuite(suite)}
                className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                View Details
              </button>
            </div>
          </div>
        ))}

        {getFilteredSuites().length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-6xl mb-4">🧪</div>
            <p className="text-lg">No test suites found</p>
            <p className="text-sm">Create test suites to get started with automated testing.</p>
          </div>
        )}
      </div>

      {/* Test Suite Detail Modal */}
      {selectedSuite && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {selectedSuite.name} - Test Results
              </h3>
              <button
                onClick={() => setSelectedSuite(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Suite Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">Status</h4>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(selectedSuite.status)}`}>
                    {selectedSuite.status}
                  </span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">Total Tests</h4>
                  <p className="text-lg font-bold text-gray-900">{selectedSuite.totalTests}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">Success Rate</h4>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedSuite.totalTests > 0
                      ? Math.round((selectedSuite.passedTests / selectedSuite.totalTests) * 100)
                      : 0}%
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">Duration</h4>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedSuite.duration ? `${selectedSuite.duration}s` : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Test Results */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Test Results ({selectedSuite.testResults.length})</h4>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {selectedSuite.testResults.map((result) => (
                    <div key={result.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`w-3 h-3 rounded-full ${
                            result.status === 'passed' ? 'bg-green-500' :
                            result.status === 'failed' ? 'bg-red-500' :
                            result.status === 'skipped' ? 'bg-gray-500' : 'bg-orange-500'
                          }`}></span>
                          <span className={`font-medium ${
                            result.status === 'passed' ? 'text-green-700' :
                            result.status === 'failed' ? 'text-red-700' :
                            result.status === 'skipped' ? 'text-gray-700' : 'text-orange-700'
                          }`}>
                            {result.status.toUpperCase()}
                          </span>
                          <span className="text-gray-900">{result.name}</span>
                        </div>
                        <span className="text-sm text-gray-600">{result.duration}ms</span>
                      </div>
                      {result.error && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                          {result.error}
                        </div>
                      )}
                      {result.stackTrace && (
                        <details className="mt-2">
                          <summary className="text-sm font-medium text-gray-700 cursor-pointer">Stack Trace</summary>
                          <pre className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-x-auto">
                            {result.stackTrace}
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