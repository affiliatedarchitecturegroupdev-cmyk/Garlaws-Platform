'use client';

import { useState, useEffect, useCallback } from 'react';

interface ThreatIndicator {
  id: string;
  type: 'ip_address' | 'user_agent' | 'request_pattern' | 'geolocation' | 'behavioral';
  value: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  description: string;
  firstSeen: string;
  lastSeen: string;
  occurrences: number;
  blocked: boolean;
  source: string;
  tags: string[];
}

interface SecurityAlert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
  indicators: ThreatIndicator[];
  affectedUsers: number;
  affectedResources: string[];
  detectedAt: string;
  resolvedAt?: string;
  assignedTo?: string;
  notes: string[];
  recommendedActions: string[];
}

interface ThreatDetectionProps {
  tenantId?: string;
}

export default function ThreatDetection({ tenantId = 'default' }: ThreatDetectionProps) {
  const [threats, setThreats] = useState<ThreatIndicator[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null);
  const [selectedThreat, setSelectedThreat] = useState<ThreatIndicator | null>(null);
  const [loading, setLoading] = useState(true);
  const [detectionRules, setDetectionRules] = useState<any[]>([]);
  const [showRuleCreator, setShowRuleCreator] = useState(false);

  const [newRule, setNewRule] = useState({
    name: '',
    type: 'ip_address' as ThreatIndicator['type'],
    pattern: '',
    severity: 'medium' as ThreatIndicator['severity'],
    description: '',
    enabled: true
  });

  useEffect(() => {
    fetchThreatData();
    fetchDetectionRules();
  }, [tenantId]);

  const fetchThreatData = useCallback(async () => {
    try {
      const response = await fetch(`/api/security?action=threat_indicators&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setThreats(data.data.indicators);
        setAlerts(data.data.alerts);
      }
    } catch (error) {
      console.error('Failed to fetch threat data:', error);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  const fetchDetectionRules = useCallback(async () => {
    try {
      const response = await fetch(`/api/security?action=detection_rules&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setDetectionRules(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch detection rules:', error);
    }
  }, [tenantId]);

  const createDetectionRule = async () => {
    if (!newRule.name || !newRule.pattern) return;

    try {
      const response = await fetch('/api/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_detection_rule',
          tenantId,
          ...newRule
        })
      });

      const data = await response.json();
      if (data.success) {
        setDetectionRules([...detectionRules, data.data]);
        setShowRuleCreator(false);
        setNewRule({
          name: '',
          type: 'ip_address',
          pattern: '',
          severity: 'medium',
          description: '',
          enabled: true
        });
      }
    } catch (error) {
      console.error('Failed to create detection rule:', error);
    }
  };

  const blockThreatIndicator = async (indicatorId: string) => {
    try {
      const response = await fetch('/api/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'block_threat_indicator',
          tenantId,
          indicatorId
        })
      });

      const data = await response.json();
      if (data.success) {
        setThreats(threats.map(threat =>
          threat.id === indicatorId ? { ...threat, blocked: true } : threat
        ));
      }
    } catch (error) {
      console.error('Failed to block threat indicator:', error);
    }
  };

  const resolveAlert = async (alertId: string, resolution: string) => {
    try {
      const response = await fetch('/api/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resolve_alert',
          tenantId,
          alertId,
          resolution
        })
      });

      const data = await response.json();
      if (data.success) {
        setAlerts(alerts.map(alert =>
          alert.id === alertId ? {
            ...alert,
            status: 'resolved' as const,
            resolvedAt: new Date().toISOString(),
            notes: [...alert.notes, `Resolved: ${resolution}`]
          } : alert
        ));
      }
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  const runThreatScan = async () => {
    try {
      const response = await fetch('/api/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'run_threat_scan',
          tenantId
        })
      });

      const data = await response.json();
      if (data.success) {
        // Refresh threat data after scan
        fetchThreatData();
      }
    } catch (error) {
      console.error('Failed to run threat scan:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'false_positive': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ip_address': return '🌐';
      case 'user_agent': return '🤖';
      case 'request_pattern': return '🔄';
      case 'geolocation': return '📍';
      case 'behavioral': return '👤';
      default: return '⚠️';
    }
  };

  const activeAlerts = alerts.filter(a => a.status === 'active' || a.status === 'investigating');
  const blockedThreats = threats.filter(t => t.blocked);
  const criticalThreats = threats.filter(t => t.severity === 'critical');

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
        <h2 className="text-2xl font-bold text-gray-900">Advanced Threat Detection</h2>
        <div className="flex space-x-3">
          <button
            onClick={runThreatScan}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Run Threat Scan
          </button>
          <button
            onClick={() => setShowRuleCreator(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Add Detection Rule
          </button>
          <button
            onClick={fetchThreatData}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Threat Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Alerts</p>
              <p className="text-2xl font-bold text-red-600">{activeAlerts.length}</p>
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
              <p className="text-sm font-medium text-gray-600">Threat Indicators</p>
              <p className="text-2xl font-bold text-orange-600">{threats.length}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Blocked Threats</p>
              <p className="text-2xl font-bold text-blue-600">{blockedThreats.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical Threats</p>
              <p className="text-2xl font-bold text-purple-600">{criticalThreats.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Active Security Alerts</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {activeAlerts.map((alert) => (
            <div key={alert.id} className="p-6 hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedAlert(alert)}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-medium text-gray-900">{alert.title}</h4>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(alert.status)}`}>
                      {alert.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{alert.description}</p>
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <span>Affected Users: {alert.affectedUsers}</span>
                    <span>Detected: {new Date(alert.detectedAt).toLocaleString()}</span>
                    <span>Indicators: {alert.indicators.length}</span>
                  </div>
                </div>
                <div className="ml-4 flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      resolveAlert(alert.id, 'Manually resolved');
                    }}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Resolve
                  </button>
                </div>
              </div>
            </div>
          ))}
          {activeAlerts.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No active security alerts
            </div>
          )}
        </div>
      </div>

      {/* Threat Indicators */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Threat Indicators</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Indicator</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Occurrences</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Seen</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {threats.map((threat) => (
                <tr key={threat.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{getTypeIcon(threat.type)}</span>
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {threat.type.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {threat.value.length > 30 ? `${threat.value.substring(0, 30)}...` : threat.value}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(threat.severity)}`}>
                      {threat.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {threat.confidence}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {threat.occurrences}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(threat.lastSeen).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedThreat(threat)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      {!threat.blocked && (
                        <button
                          onClick={() => blockThreatIndicator(threat.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Block
                        </button>
                      )}
                      {threat.blocked && (
                        <span className="text-gray-500">Blocked</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detection Rules */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Detection Rules</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rule Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pattern</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {detectionRules.map((rule) => (
                <tr key={rule.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {rule.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                    {rule.type.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {rule.pattern.length > 30 ? `${rule.pattern.substring(0, 30)}...` : rule.pattern}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(rule.severity)}`}>
                      {rule.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      rule.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {rule.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Rule Modal */}
      {showRuleCreator && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Create Detection Rule</h3>
              <button
                onClick={() => setShowRuleCreator(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name *</label>
                  <input
                    type="text"
                    value={newRule.name}
                    onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Detection Type</label>
                  <select
                    value={newRule.type}
                    onChange={(e) => setNewRule({...newRule, type: e.target.value as ThreatIndicator['type']})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="ip_address">IP Address</option>
                    <option value="user_agent">User Agent</option>
                    <option value="request_pattern">Request Pattern</option>
                    <option value="geolocation">Geolocation</option>
                    <option value="behavioral">Behavioral</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pattern/Match Criteria *</label>
                <input
                  type="text"
                  value={newRule.pattern}
                  onChange={(e) => setNewRule({...newRule, pattern: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 192.168.1.*, suspicious_login_*"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                  <select
                    value={newRule.severity}
                    onChange={(e) => setNewRule({...newRule, severity: e.target.value as ThreatIndicator['severity']})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newRule.enabled}
                    onChange={(e) => setNewRule({...newRule, enabled: e.target.checked})}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">Enable Rule</label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newRule.description}
                  onChange={(e) => setNewRule({...newRule, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Describe what this rule detects and why it's important"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={createDetectionRule}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Create Rule
              </button>
              <button
                onClick={() => setShowRuleCreator(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-4/5 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">{selectedAlert.title}</h3>
              <button
                onClick={() => setSelectedAlert(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold mb-3">Alert Details</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-600">Description</div>
                      <div className="text-sm text-gray-900 mt-1">{selectedAlert.description}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Severity</div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(selectedAlert.severity)}`}>
                          {selectedAlert.severity}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Status</div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedAlert.status)}`}>
                          {selectedAlert.status}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Detected At</div>
                      <div className="text-sm text-gray-900">{new Date(selectedAlert.detectedAt).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Affected Users</div>
                      <div className="text-sm text-gray-900">{selectedAlert.affectedUsers}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-3">Threat Indicators</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedAlert.indicators.map((indicator) => (
                      <div key={indicator.id} className="border border-gray-200 rounded p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getTypeIcon(indicator.type)}</span>
                            <span className="text-sm font-medium">{indicator.description}</span>
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(indicator.severity)}`}>
                            {indicator.severity}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {indicator.value} • Confidence: {indicator.confidence}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-3">Recommended Actions</h4>
                <div className="space-y-2">
                  {selectedAlert.recommendedActions.map((action, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                      </div>
                      <p className="text-sm text-gray-700">{action}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-3">Investigation Notes</h4>
                <div className="space-y-2">
                  {selectedAlert.notes.map((note, index) => (
                    <div key={index} className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      {note}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedAlert(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Threat Detail Modal */}
      {selectedThreat && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Threat Indicator Details</h3>
              <button
                onClick={() => setSelectedThreat(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold mb-3">Indicator Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getTypeIcon(selectedThreat.type)}</span>
                    <div>
                      <div className="text-sm text-gray-600">Type</div>
                      <div className="text-sm font-medium capitalize">{selectedThreat.type.replace('_', ' ')}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">Value</div>
                    <div className="text-sm font-mono bg-gray-100 p-2 rounded mt-1">{selectedThreat.value}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Severity</div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(selectedThreat.severity)}`}>
                        {selectedThreat.severity}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Confidence</div>
                      <div className="text-sm font-medium">{selectedThreat.confidence}%</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">Description</div>
                    <div className="text-sm text-gray-900 mt-1">{selectedThreat.description}</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-3">Activity Timeline</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">First Seen</div>
                      <div className="text-sm text-gray-900">{new Date(selectedThreat.firstSeen).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Last Seen</div>
                      <div className="text-sm text-gray-900">{new Date(selectedThreat.lastSeen).toLocaleString()}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">Occurrences</div>
                    <div className="text-lg font-bold text-blue-600">{selectedThreat.occurrences}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">Status</div>
                    <div className="mt-1">
                      {selectedThreat.blocked ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Blocked
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">Source</div>
                    <div className="text-sm text-gray-900 mt-1">{selectedThreat.source}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">Tags</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedThreat.tags.map(tag => (
                        <span key={tag} className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              {!selectedThreat.blocked && (
                <button
                  onClick={() => blockThreatIndicator(selectedThreat.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Block Threat
                </button>
              )}
              <button
                onClick={() => setSelectedThreat(null)}
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