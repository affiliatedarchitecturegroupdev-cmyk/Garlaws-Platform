'use client';

import { useState, useEffect } from 'react';
import AutomatedTestRunner from '@/features/qa/automated-tests/AutomatedTestRunner';
import PerformanceTestingTools from '@/features/qa/performance/PerformanceTestingTools';
import CodeQualityAnalysis from '@/features/qa/code-quality/CodeQualityAnalysis';
import BugTrackingIntegration from '@/features/qa/bug-tracking/BugTrackingIntegration';

interface QAAnalytics {
  totalTestSuites: number;
  totalTestCases: number;
  automatedTests: number;
  recentTestRuns: any[];
  openBugs: number;
  criticalBugs: number;
  avgCodeQualityScore: number;
  testCoverage: number;
  testExecutionTime: number;
  bugResolutionRate: number;
}

type TabType = 'overview' | 'automated-tests' | 'performance' | 'code-quality' | 'bug-tracking';

export default function QADashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [analytics, setAnalytics] = useState<QAAnalytics | null>(null);
  const [testSuites, setTestSuites] = useState<any[]>([]);
  const [bugs, setBugs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [analyticsRes, suitesRes, bugsRes] = await Promise.all([
        fetch('/api/qa?action=qa_analytics&tenantId=default'),
        fetch('/api/qa?action=test_suites&tenantId=default'),
        fetch('/api/qa?action=bugs&tenantId=default')
      ]);

      const analyticsData = await analyticsRes.json();
      const suitesData = await suitesRes.json();
      const bugsData = await bugsRes.json();

      if (analyticsData.success) setAnalytics(analyticsData.data);
      if (suitesData.success) setTestSuites(suitesData.data);
      if (bugsData.success) setBugs(bugsData.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTestSuite = async () => {
    const response = await fetch('/api/qa?action=create_test_suite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'API Integration Tests',
        description: 'Test suite for API endpoints',
        tenantId: 'default',
        testType: 'api',
        framework: 'postman'
      })
    });
    if (response.ok) {
      fetchData();
      alert('Test suite created successfully!');
    }
  };

  const handleRunTestSuite = async () => {
    if (testSuites.length === 0) return;

    const response = await fetch('/api/qa?action=run_test_suite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        testSuiteId: testSuites[0].id,
        name: `Test Run ${new Date().toLocaleString()}`,
        environment: 'staging'
      })
    });
    if (response.ok) {
      fetchData();
      alert('Test suite execution started!');
    }
  };

  const handleCreateBug = async () => {
    const response = await fetch('/api/qa?action=create_bug', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Login form validation error',
        description: 'Email validation not working properly',
        tenantId: 'default',
        severity: 'medium',
        priority: 'high',
        type: 'bug',
        reportedBy: 'system',
        reproductionSteps: '1. Go to login page\n2. Enter invalid email\n3. Try to submit',
        expectedBehavior: 'Should show validation error',
        actualBehavior: 'Form submits without validation'
      })
    });
    if (response.ok) {
      fetchData();
      alert('Bug reported successfully!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quality Assurance Platform</h1>
          {activeTab === 'overview' && (
            <div className="flex space-x-4">
              <button
                onClick={fetchData}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Refresh
              </button>
              <button
                onClick={handleCreateTestSuite}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                New Test Suite
              </button>
              <button
                onClick={handleRunTestSuite}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Run Tests
              </button>
              <button
                onClick={handleCreateBug}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Report Bug
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('automated-tests')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'automated-tests'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Automated Tests
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'performance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Performance Testing
            </button>
            <button
              onClick={() => setActiveTab('code-quality')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'code-quality'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Code Quality
            </button>
            <button
              onClick={() => setActiveTab('bug-tracking')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'bug-tracking'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Bug Tracking
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Key QA Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Test Suites</p>
                <p className="text-2xl font-bold text-blue-600">{analytics?.totalTestSuites || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Automated Tests</p>
                <p className="text-2xl font-bold text-green-600">{analytics?.automatedTests || 0}</p>
                <p className="text-xs text-gray-500">of {analytics?.totalTestCases || 0} total</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Bugs</p>
                <p className="text-2xl font-bold text-red-600">{analytics?.openBugs || 0}</p>
                <p className="text-xs text-gray-500">{analytics?.criticalBugs || 0} critical</p>
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
                <p className="text-sm font-medium text-gray-600">Code Quality</p>
                <p className="text-2xl font-bold text-purple-600">{analytics?.avgCodeQualityScore?.toFixed(1) || 0}/100</p>
                <p className="text-xs text-gray-500">Average score</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Test Execution & Quality Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Execution Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Test Coverage</span>
                <span className="font-medium">{analytics?.testCoverage?.toFixed(1) || 0}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Execution Time</span>
                <span className="font-medium">{analytics?.testExecutionTime || 0} seconds</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bug Resolution Rate</span>
                <span className="font-medium text-green-600">{analytics?.bugResolutionRate?.toFixed(1) || 0}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Recent Test Runs</span>
                <span className="font-medium">{analytics?.recentTestRuns?.length || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Test Runs</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {analytics?.recentTestRuns?.slice(0, 5).map((run: any) => (
                <div key={run.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{run.name}</p>
                    <p className="text-xs text-gray-600">{new Date(run.startTime).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      run.status === 'completed' ? 'bg-green-100 text-green-800' :
                      run.status === 'running' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {run.status}
                    </span>
                    <p className="text-xs text-gray-600 mt-1">
                      {run.passedTests || 0} / {run.totalTests || 0} passed
                    </p>
                  </div>
                </div>
              )) || <p className="text-gray-500">No recent test runs</p>}
            </div>
          </div>
        </div>

        {/* Test Suites & Bugs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Test Suites</h2>
              <button onClick={handleCreateTestSuite} className="text-blue-600 hover:text-blue-700 text-sm">
                + New Suite
              </button>
            </div>
            <div className="space-y-4">
              {testSuites.length > 0 ? testSuites.map((suite) => (
                <div key={suite.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{suite.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      suite.status === 'active' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {suite.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{suite.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                    <div>Type: {suite.testType}</div>
                    <div>Framework: {suite.framework || 'N/A'}</div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No test suites yet</p>
                  <button onClick={handleCreateTestSuite} className="mt-2 text-blue-600 hover:text-blue-700 text-sm">
                    Create your first test suite
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Active Bugs</h2>
              <button onClick={handleCreateBug} className="text-red-600 hover:text-red-700 text-sm">
                + Report Bug
              </button>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {bugs.filter(b => b.status === 'open').slice(0, 5).map((bug) => (
                <div key={bug.id} className="border border-red-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 text-sm">{bug.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      bug.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      bug.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                      bug.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {bug.severity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{bug.description}</p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Priority: {bug.priority}</span>
                    <span>{new Date(bug.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {bugs.filter(b => b.status === 'open').length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No active bugs</p>
                  <button onClick={handleCreateBug} className="mt-2 text-red-600 hover:text-red-700 text-sm">
                    Report a bug
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quality Actions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quality Assurance Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center px-4 py-3 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors">
              <svg className="w-6 h-6 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-sm font-medium text-blue-600">Code Analysis</span>
            </button>
            <button className="flex flex-col items-center px-4 py-3 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors">
              <svg className="w-6 h-6 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-sm font-medium text-green-600">Performance Test</span>
            </button>
            <button className="flex flex-col items-center px-4 py-3 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 transition-colors">
              <svg className="w-6 h-6 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-sm font-medium text-purple-600">Security Scan</span>
            </button>
            <button className="flex flex-col items-center px-4 py-3 bg-orange-50 border border-orange-200 rounded-md hover:bg-orange-100 transition-colors">
              <svg className="w-6 h-6 text-orange-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-sm font-medium text-orange-600">Quality Reports</span>
            </button>
          </div>
        </div>
          </>
        )}

        {activeTab === 'automated-tests' && <AutomatedTestRunner />}
        {activeTab === 'performance' && <PerformanceTestingTools />}
        {activeTab === 'code-quality' && <CodeQualityAnalysis />}
        {activeTab === 'bug-tracking' && <BugTrackingIntegration />}
      </div>
    </div>
  );
}