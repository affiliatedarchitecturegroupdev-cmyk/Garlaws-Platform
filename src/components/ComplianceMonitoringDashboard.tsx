'use client';

import React, { useState, useEffect } from 'react';
import { AuditLogEntry, ComplianceRule } from '@/lib/compliance-audit-engine';

interface ComplianceDashboardProps {
  propertyId?: string;
}

export function ComplianceMonitoringDashboard({ propertyId }: ComplianceDashboardProps) {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [complianceRules, setComplianceRules] = useState<ComplianceRule[]>([]);
  const [complianceStatus, setComplianceStatus] = useState<any>(null);
  const [qaStatus, setQaStatus] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'audit' | 'compliance' | 'quality' | 'reports'>('audit');
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    riskLevel: '',
    regulation: ''
  });

  useEffect(() => {
    loadDashboardData();
  }, [activeTab, filters]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      if (activeTab === 'audit') {
        await loadAuditData();
      } else if (activeTab === 'compliance') {
        await loadComplianceData();
      } else if (activeTab === 'quality') {
        await loadQualityData();
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAuditData = async () => {
    const params = new URLSearchParams({
      action: 'audit_logs',
      startDate: filters.startDate,
      endDate: filters.endDate,
      ...(filters.riskLevel && { riskLevel: filters.riskLevel })
    });

    const response = await fetch(`/api/compliance-audit?${params}`);
    const result = await response.json();
    if (result.success) {
      setAuditLogs(result.data);
    }
  };

  const loadComplianceData = async () => {
    // Load compliance rules
    const rulesResponse = await fetch('/api/compliance-audit?action=compliance_rules');
    const rulesResult = await rulesResponse.json();
    if (rulesResult.success) {
      setComplianceRules(rulesResult.data);
    }

    // Load compliance status
    const statusResponse = await fetch('/api/compliance-audit?action=compliance_status');
    const statusResult = await statusResponse.json();
    if (statusResult.success) {
      setComplianceStatus(statusResult.data);
    }
  };

  const loadQualityData = async () => {
    const qaResponse = await fetch('/api/quality-assurance?action=qa_status');
    const qaResult = await qaResponse.json();
    if (qaResult.success) {
      setQaStatus(qaResult.data);
    }
  };

  const generateComplianceReport = async (regulation: string) => {
    try {
      const response = await fetch('/api/compliance-audit?action=generate_report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          regulation,
          startDate: filters.startDate,
          endDate: filters.endDate
        })
      });

      if (response.ok) {
        alert('Compliance report generated successfully');
        loadComplianceData();
      }
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const runComplianceChecks = async (regulation?: string) => {
    try {
      const response = await fetch(`/api/quality-assurance?action=run_compliance_checks${regulation ? `&regulation=${regulation}` : ''}`);
      const result = await response.json();
      if (result.success) {
        alert('Compliance checks completed');
        loadComplianceData();
      }
    } catch (error) {
      console.error('Error running compliance checks:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'compliant':
      case 'passed':
      case 'healthy':
        return 'bg-green-500';
      case 'non_compliant':
      case 'failed':
      case 'critical':
        return 'bg-red-500';
      case 'requires_review':
      case 'warning':
        return 'bg-yellow-500';
      case 'requires_attention':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
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
        <h1 className="text-3xl font-bold text-gray-900">Compliance & Audit Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor compliance, audit logs, and quality assurance</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { key: 'audit', label: 'Audit Logs' },
            { key: 'compliance', label: 'Compliance' },
            { key: 'quality', label: 'Quality Assurance' },
            { key: 'reports', label: 'Reports' }
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

      {/* Filters */}
      {(activeTab === 'audit' || activeTab === 'compliance') && (
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-3">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
              <select
                value={filters.riskLevel}
                onChange={(e) => setFilters(prev => ({ ...prev, riskLevel: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">All</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Regulation</label>
              <select
                value={filters.regulation}
                onChange={(e) => setFilters(prev => ({ ...prev, regulation: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">All</option>
                <option value="POPIA">POPIA</option>
                <option value="B-BBEE">B-BBEE</option>
                <option value="NHBRC">NHBRC</option>
                <option value="CIDB">CIDB</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Audit Logs ({auditLogs.length})</h2>
            <button
              onClick={loadAuditData}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
            >
              Refresh
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Violations
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auditLogs.slice(0, 50).map(log => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{log.action}</div>
                      <div className="text-sm text-gray-500">{log.method} {log.endpoint}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.resource}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRiskColor(log.riskLevel)}`}>
                        {log.riskLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        log.statusCode < 400 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {log.statusCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.complianceFlags.length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Compliance Tab */}
      {activeTab === 'compliance' && complianceStatus && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Overview</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Overall Status:</span>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${getStatusColor(complianceStatus.overall)}`}></div>
                  <span className="font-medium capitalize">{complianceStatus.overall.replace('_', ' ')}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Active Rules:</span>
                <span className="font-medium">{complianceStatus.activeRules}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Violations (30 days):</span>
                <span className="font-medium text-red-600">{complianceStatus.violationsLast30Days}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Critical Violations:</span>
                <span className="font-medium text-red-600">{complianceStatus.criticalViolations}</span>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-medium mb-3">By Regulation</h4>
              <div className="space-y-2">
                {Object.entries(complianceStatus.regulations).map(([reg, data]: [string, any]) => (
                  <div key={reg} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">{reg}</span>
                    <div className="flex items-center">
                      <span className={`text-xs px-2 py-1 rounded mr-2 ${getStatusColor(data.status)} text-white`}>
                        {data.compliance}%
                      </span>
                      <span className="text-xs text-gray-600">({data.violations} violations)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => runComplianceChecks()}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
              >
                Run All Compliance Checks
              </button>
              <button
                onClick={() => generateComplianceReport('POPIA')}
                className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm"
              >
                Generate POPIA Report
              </button>
              <button
                onClick={() => generateComplianceReport('B-BBEE')}
                className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 text-sm"
              >
                Generate B-BBEE Report
              </button>
            </div>

            <div className="mt-6">
              <h4 className="font-medium mb-3">Compliance Rules ({complianceRules.length})</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {complianceRules.slice(0, 10).map(rule => (
                  <div key={rule.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                    <span>{rule.ruleName}</span>
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${rule.enabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        rule.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        rule.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {rule.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quality Assurance Tab */}
      {activeTab === 'quality' && qaStatus && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Results</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Tests:</span>
                <span className="font-medium">{qaStatus.tests.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Passed:</span>
                <span className="font-medium text-green-600">{qaStatus.tests.passed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Failed:</span>
                <span className="font-medium text-red-600">{qaStatus.tests.failed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Running:</span>
                <span className="font-medium text-blue-600">{qaStatus.tests.running}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Gates</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Gates:</span>
                <span className="font-medium">{qaStatus.gates.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Enabled:</span>
                <span className="font-medium text-green-600">{qaStatus.gates.enabled}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Blocking:</span>
                <span className="font-medium text-orange-600">{qaStatus.gates.blocking}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Checks</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Checks:</span>
                <span className="font-medium">{qaStatus.compliance.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Compliant:</span>
                <span className="font-medium text-green-600">{qaStatus.compliance.compliant}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Needs Remediation:</span>
                <span className="font-medium text-red-600">{qaStatus.compliance.requiringRemediation}</span>
              </div>
              <div className="flex justify-between mt-4">
                <span className="text-gray-600">Overall Health:</span>
                <span className={`font-medium px-2 py-1 rounded text-sm ${
                  qaStatus.overallHealth === 'healthy' ? 'bg-green-100 text-green-800' :
                  qaStatus.overallHealth === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {qaStatus.overallHealth}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Compliance Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-3">Generate New Report</h3>
              <div className="space-y-3">
                <button
                  onClick={() => generateComplianceReport('POPIA')}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
                >
                  POPIA Compliance Report
                </button>
                <button
                  onClick={() => generateComplianceReport('B-BBEE')}
                  className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm"
                >
                  B-BBEE Compliance Report
                </button>
                <button
                  onClick={() => generateComplianceReport('NHBRC')}
                  className="w-full bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 text-sm"
                >
                  NHBRC Compliance Report
                </button>
                <button
                  onClick={() => generateComplianceReport('CIDB')}
                  className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 text-sm"
                >
                  CIDB Compliance Report
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Report History</h3>
              <div className="text-sm text-gray-600">
                <p>Report generation and history tracking would be displayed here.</p>
                <p className="mt-2">Features include:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Automated report scheduling</li>
                  <li>Historical report archive</li>
                  <li>Report distribution to stakeholders</li>
                  <li>Compliance trend analysis</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}