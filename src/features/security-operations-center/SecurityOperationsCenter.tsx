'use client';

import { useState, useEffect, useCallback } from 'react';

interface SecurityEvent {
  id: string;
  timestamp: Date;
  source: string;
  type: 'authentication' | 'authorization' | 'data_access' | 'network' | 'system' | 'application' | 'user_behavior' | 'external';
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'brute_force' | 'suspicious_login' | 'unauthorized_access' | 'data_exfiltration' | 'malware' | 'ddos' | 'privilege_escalation' | 'policy_violation' | 'other';
  description: string;
  affectedResources: string[];
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  status: 'detected' | 'investigating' | 'resolved' | 'false_positive';
  assignedTo?: string;
  tags: string[];
  rawData?: any;
}

interface SecurityAlert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved' | 'suppressed';
  source: string;
  detectionRule: string;
  affectedSystems: string[];
  firstSeen: Date;
  lastSeen: Date;
  occurrenceCount: number;
  mitigationSteps: string[];
  assignedTo?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  resolution?: string;
  impact: {
    confidentiality: 'none' | 'low' | 'medium' | 'high';
    integrity: 'none' | 'low' | 'medium' | 'high';
    availability: 'none' | 'low' | 'medium' | 'high';
  };
  riskScore: number;
}

interface SecurityMetrics {
  totalEvents: number;
  criticalAlerts: number;
  activeIncidents: number;
  resolvedToday: number;
  meanTimeToDetect: number; // minutes
  meanTimeToRespond: number; // minutes
  falsePositiveRate: number;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  systemHealth: 'healthy' | 'degraded' | 'compromised';
}

interface SecurityDashboard {
  id: string;
  name: string;
  widgets: SecurityWidget[];
  filters: {
    timeRange: '1h' | '24h' | '7d' | '30d';
    severity: SecurityEvent['severity'][];
    categories: SecurityEvent['category'][];
    sources: string[];
  };
  permissions: {
    view: string[];
    edit: string[];
    manage: string[];
  };
}

interface SecurityWidget {
  id: string;
  type: 'events_chart' | 'alerts_table' | 'metrics_cards' | 'threat_map' | 'timeline' | 'severity_distribution';
  title: string;
  position: { x: number; y: number; width: number; height: number };
  config: Record<string, any>;
}

interface SecurityOperationsCenterProps {
  tenantId?: string;
  onAlertTriggered?: (alert: SecurityAlert) => void;
  onIncidentCreated?: (incident: SecurityAlert) => void;
  onSecurityEvent?: (event: SecurityEvent) => void;
}

const SAMPLE_SECURITY_EVENTS: SecurityEvent[] = [
  {
    id: 'evt_001',
    timestamp: new Date(Date.now() - 300000),
    source: 'Authentication Service',
    type: 'authentication',
    severity: 'high',
    category: 'brute_force',
    description: 'Multiple failed login attempts detected from IP 192.168.1.100',
    affectedResources: ['authentication-api', 'user-database'],
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    status: 'investigating',
    assignedTo: 'security_team',
    tags: ['brute_force', 'authentication', 'external_ip']
  },
  {
    id: 'evt_002',
    timestamp: new Date(Date.now() - 600000),
    source: 'File System Monitor',
    type: 'data_access',
    severity: 'critical',
    category: 'data_exfiltration',
    description: 'Large data transfer detected to external IP address',
    affectedResources: ['file-server', 'customer-data'],
    userId: 'user_456',
    ipAddress: '203.0.113.1',
    status: 'detected',
    tags: ['data_exfiltration', 'large_transfer', 'external_ip']
  },
  {
    id: 'evt_003',
    timestamp: new Date(Date.now() - 900000),
    source: 'Network IDS',
    type: 'network',
    severity: 'medium',
    category: 'suspicious_login',
    description: 'Login from unusual geographic location (user normally logs in from US, now from Russia)',
    affectedResources: ['vpn-gateway', 'user_sessions'],
    userId: 'user_123',
    ipAddress: '185.125.45.78',
    status: 'investigating',
    assignedTo: 'security_team',
    tags: ['geographic_anomaly', 'unusual_location', 'vpn']
  },
  {
    id: 'evt_004',
    timestamp: new Date(Date.now() - 1200000),
    source: 'Application Firewall',
    type: 'application',
    severity: 'low',
    category: 'policy_violation',
    description: 'Attempted access to restricted API endpoint',
    affectedResources: ['api-gateway', 'admin-panel'],
    userId: 'user_789',
    ipAddress: '10.0.1.50',
    status: 'resolved',
    tags: ['api_violation', 'restricted_access', 'internal_ip']
  }
];

const SAMPLE_SECURITY_ALERTS: SecurityAlert[] = [
  {
    id: 'alert_001',
    title: 'Brute Force Attack Detected',
    description: 'Multiple failed authentication attempts from single IP address',
    severity: 'high',
    status: 'active',
    source: 'Authentication Service',
    detectionRule: 'brute_force_detection',
    affectedSystems: ['authentication-api', 'load-balancer'],
    firstSeen: new Date(Date.now() - 1800000),
    lastSeen: new Date(Date.now() - 300000),
    occurrenceCount: 45,
    mitigationSteps: [
      'Block IP address 192.168.1.100',
      'Enable rate limiting',
      'Notify security team',
      'Review authentication logs'
    ],
    assignedTo: 'security_team',
    impact: {
      confidentiality: 'low',
      integrity: 'low',
      availability: 'medium'
    },
    riskScore: 7.5
  },
  {
    id: 'alert_002',
    title: 'Potential Data Exfiltration',
    description: 'Unusual large file transfer to external destination',
    severity: 'critical',
    status: 'active',
    source: 'Data Loss Prevention',
    detectionRule: 'data_exfiltration_detection',
    affectedSystems: ['file-server', 'network-gateway'],
    firstSeen: new Date(Date.now() - 900000),
    lastSeen: new Date(Date.now() - 600000),
    occurrenceCount: 1,
    mitigationSteps: [
      'Isolate affected system',
      'Preserve forensic evidence',
      'Notify incident response team',
      'Block data transfer',
      'Conduct immediate investigation'
    ],
    assignedTo: 'incident_response',
    impact: {
      confidentiality: 'high',
      integrity: 'high',
      availability: 'low'
    },
    riskScore: 9.2
  }
];

export default function SecurityOperationsCenter({
  tenantId = 'default',
  onAlertTriggered,
  onIncidentCreated,
  onSecurityEvent
}: SecurityOperationsCenterProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'events' | 'alerts' | 'investigation' | 'reports'>('dashboard');
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>(SAMPLE_SECURITY_EVENTS);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>(SAMPLE_SECURITY_ALERTS);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEvents: 12547,
    criticalAlerts: 3,
    activeIncidents: 2,
    resolvedToday: 8,
    meanTimeToDetect: 12.5,
    meanTimeToRespond: 45.2,
    falsePositiveRate: 0.023,
    threatLevel: 'medium',
    systemHealth: 'healthy'
  });

  // Simulate real-time security events
  useEffect(() => {
    const interval = setInterval(() => {
      // Generate random security events
      const eventTypes = ['authentication', 'authorization', 'data_access', 'network', 'system', 'application'];
      const categories = ['brute_force', 'suspicious_login', 'unauthorized_access', 'policy_violation', 'other'];
      const severities: SecurityEvent['severity'][] = ['low', 'medium', 'high', 'critical'];

      const randomEvent: SecurityEvent = {
        id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        source: ['Authentication Service', 'Network IDS', 'Application Firewall', 'File Monitor'][Math.floor(Math.random() * 4)],
        type: eventTypes[Math.floor(Math.random() * eventTypes.length)] as SecurityEvent['type'],
        severity: severities[Math.floor(Math.random() * severities.length)],
        category: categories[Math.floor(Math.random() * categories.length)] as SecurityEvent['category'],
        description: 'Automated security event detection',
        affectedResources: ['system_' + Math.floor(Math.random() * 10)],
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        status: 'detected',
        tags: ['automated', 'real-time']
      };

      setSecurityEvents(prev => [randomEvent, ...prev.slice(0, 499)]); // Keep last 500 events
      onSecurityEvent?.(randomEvent);

      // Occasionally trigger alerts
      if (Math.random() > 0.95) {
        const alert: SecurityAlert = {
          id: `alert_${Date.now()}`,
          title: 'Automated Security Alert',
          description: `Security anomaly detected: ${randomEvent.description}`,
          severity: randomEvent.severity,
          status: 'active',
          source: randomEvent.source,
          detectionRule: 'automated_detection',
          affectedSystems: randomEvent.affectedResources,
          firstSeen: new Date(),
          lastSeen: new Date(),
          occurrenceCount: 1,
          mitigationSteps: ['Investigate', 'Document', 'Mitigate'],
          impact: {
            confidentiality: Math.random() > 0.7 ? 'high' : 'low',
            integrity: Math.random() > 0.8 ? 'medium' : 'low',
            availability: Math.random() > 0.9 ? 'high' : 'low'
          },
          riskScore: Math.random() * 10
        };

        setSecurityAlerts(prev => [alert, ...prev.slice(0, 99)]);
        onAlertTriggered?.(alert);
      }
    }, 10000); // Generate event every 10 seconds

    return () => clearInterval(interval);
  }, [onSecurityEvent, onAlertTriggered]);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setSecurityAlerts(prev => prev.map(alert =>
      alert.id === alertId
        ? {
            ...alert,
            status: 'acknowledged',
            acknowledgedBy: 'security_operator',
            acknowledgedAt: new Date()
          }
        : alert
    ));
  }, []);

  const resolveAlert = useCallback((alertId: string, resolution: string) => {
    setSecurityAlerts(prev => prev.map(alert =>
      alert.id === alertId
        ? {
            ...alert,
            status: 'resolved',
            resolvedAt: new Date(),
            resolution
          }
        : alert
    ));
  }, []);

  const assignAlert = useCallback((alertId: string, assignee: string) => {
    setSecurityAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, assignedTo: assignee } : alert
    ));
  }, []);

  const generateSecurityReport = useCallback(async () => {
    setIsGeneratingReport(true);

    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 3000));

    const report = {
      title: 'Security Operations Report',
      period: `${new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString()} - ${new Date().toLocaleDateString()}`,
      summary: {
        totalEvents: securityEvents.length,
        criticalAlerts: securityAlerts.filter(a => a.severity === 'critical').length,
        resolvedIncidents: securityAlerts.filter(a => a.status === 'resolved').length,
        threatLevel: metrics.threatLevel
      },
      recommendations: [
        'Implement multi-factor authentication for all admin accounts',
        'Regular security awareness training for employees',
        'Update firewall rules to block suspicious IP ranges',
        'Implement automated log analysis and correlation'
      ]
    };

    // In a real implementation, this would generate a PDF or detailed report
    console.log('Security Report Generated:', report);

    setIsGeneratingReport(false);
    return report;
  }, [securityEvents, securityAlerts, metrics]);

  const getSeverityColor = (severity: SecurityEvent['severity'] | SecurityAlert['severity']) => {
    switch (severity) {
      case 'low': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'high': return '#EF4444';
      case 'critical': return '#7C2D12';
      default: return '#6B7280';
    }
  };

  const getStatusColor = (status: SecurityEvent['status'] | SecurityAlert['status']) => {
    switch (status) {
      case 'detected':
      case 'active': return '#EF4444';
      case 'investigating':
      case 'acknowledged': return '#F59E0B';
      case 'resolved': return '#10B981';
      case 'false_positive':
      case 'suppressed': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getEventTypeIcon = (type: SecurityEvent['type']) => {
    switch (type) {
      case 'authentication': return '🔐';
      case 'authorization': return '🛡️';
      case 'data_access': return '📊';
      case 'network': return '🌐';
      case 'system': return '⚙️';
      case 'application': return '📱';
      case 'user_behavior': return '👤';
      case 'external': return '🌍';
      default: return '⚠️';
    }
  };

  const recentEvents = securityEvents.slice(0, 10);
  const activeAlerts = securityAlerts.filter(a => a.status === 'active' || a.status === 'acknowledged');
  const criticalAlerts = securityAlerts.filter(a => a.severity === 'critical');

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Security Operations Center</h1>
            <p className="text-gray-600">24/7 security monitoring and incident response</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">System Status</div>
              <div className={`font-medium ${metrics.systemHealth === 'healthy' ? 'text-green-600' : metrics.systemHealth === 'degraded' ? 'text-yellow-600' : 'text-red-600'}`}>
                {metrics.systemHealth.toUpperCase()}
              </div>
            </div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{metrics.totalEvents.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Events</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{criticalAlerts.length}</div>
            <div className="text-sm text-gray-600">Critical Alerts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{activeAlerts.length}</div>
            <div className="text-sm text-gray-600">Active Alerts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{metrics.threatLevel}</div>
            <div className="text-sm text-gray-600">Threat Level</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'events', label: 'Security Events', icon: '📋' },
              { id: 'alerts', label: 'Active Alerts', icon: '🚨' },
              { id: 'investigation', label: 'Investigation', icon: '🔍' },
              { id: 'reports', label: 'Reports', icon: '📄' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Security Metrics Overview */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-medium mb-4">Security Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mean Time to Detect:</span>
                      <span className="font-medium">{metrics.meanTimeToDetect} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mean Time to Respond:</span>
                      <span className="font-medium">{metrics.meanTimeToRespond} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">False Positive Rate:</span>
                      <span className="font-medium">{(metrics.falsePositiveRate * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Incidents Resolved Today:</span>
                      <span className="font-medium">{metrics.resolvedToday}</span>
                    </div>
                  </div>
                </div>

                {/* Threat Level Indicator */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-medium mb-4">Threat Level Assessment</h3>
                  <div className="text-center">
                    <div className={`text-6xl mb-4 ${
                      metrics.threatLevel === 'low' ? 'text-green-500' :
                      metrics.threatLevel === 'medium' ? 'text-yellow-500' :
                      metrics.threatLevel === 'high' ? 'text-orange-500' :
                      'text-red-500'
                    }`}>
                      {metrics.threatLevel === 'low' ? '🟢' :
                       metrics.threatLevel === 'medium' ? '🟡' :
                       metrics.threatLevel === 'high' ? '🟠' : '🔴'}
                    </div>
                    <div className="text-2xl font-bold capitalize mb-2">{metrics.threatLevel}</div>
                    <div className="text-sm text-gray-600">
                      Based on current security events and threat intelligence
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Events Feed */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium mb-4">Recent Security Events</h3>
                <div className="space-y-3">
                  {recentEvents.map((event) => (
                    <div key={event.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                      <span className="text-lg">{getEventTypeIcon(event.type)}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{event.source}</span>
                          <span
                            className="px-2 py-1 text-xs rounded"
                            style={{ backgroundColor: getSeverityColor(event.severity) }}
                          >
                            {event.severity}
                          </span>
                          <span
                            className="px-2 py-1 text-xs rounded"
                            style={{ backgroundColor: getStatusColor(event.status) }}
                          >
                            {event.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{event.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>{event.timestamp.toLocaleString()}</span>
                          {event.ipAddress && <span>IP: {event.ipAddress}</span>}
                          {event.userId && <span>User: {event.userId}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Alerts Summary */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium mb-4">Active Security Alerts</h3>
                {activeAlerts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">✅</div>
                    <div>No active alerts</div>
                    <div className="text-sm">All systems operating normally</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeAlerts.slice(0, 5).map((alert) => (
                      <div key={alert.id} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getSeverityColor(alert.severity) }}
                          ></div>
                          <div>
                            <h4 className="font-medium">{alert.title}</h4>
                            <p className="text-sm text-gray-600">{alert.source}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            {alert.occurrenceCount} occurrences
                          </span>
                          <button
                            onClick={() => setSelectedAlert(alert)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Security Events</h2>
                <div className="flex gap-2">
                  <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option>Last 1 hour</option>
                    <option>Last 24 hours</option>
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                  </select>
                  <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option>All Severities</option>
                    <option>Critical</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Export Events
                  </button>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-3 px-4">Time</th>
                        <th className="text-left py-3 px-4">Source</th>
                        <th className="text-left py-3 px-4">Type</th>
                        <th className="text-left py-3 px-4">Severity</th>
                        <th className="text-left py-3 px-4">Description</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {securityEvents.map((event) => (
                        <tr key={event.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{event.timestamp.toLocaleString()}</td>
                          <td className="py-3 px-4 font-medium">{event.source}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span>{getEventTypeIcon(event.type)}</span>
                              <span className="capitalize">{event.type.replace('_', ' ')}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className="px-2 py-1 text-xs text-white rounded"
                              style={{ backgroundColor: getSeverityColor(event.severity) }}
                            >
                              {event.severity}
                            </span>
                          </td>
                          <td className="py-3 px-4 max-w-xs truncate">{event.description}</td>
                          <td className="py-3 px-4">
                            <span
                              className="px-2 py-1 text-xs rounded"
                              style={{ backgroundColor: getStatusColor(event.status) }}
                            >
                              {event.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => setSelectedEvent(event)}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Active Security Alerts</h2>
                <div className="text-sm text-gray-600">
                  {activeAlerts.length} active • {criticalAlerts.length} critical
                </div>
              </div>

              {activeAlerts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-2">✅</div>
                  <div>No active alerts</div>
                  <div className="text-sm">All security issues have been addressed</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`border rounded-lg p-6 ${
                        alert.severity === 'critical' ? 'border-red-200 bg-red-50' :
                        alert.severity === 'high' ? 'border-orange-200 bg-orange-50' :
                        alert.severity === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                        'border-green-200 bg-green-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                          <div
                            className="w-4 h-4 rounded-full mt-1"
                            style={{ backgroundColor: getSeverityColor(alert.severity) }}
                          ></div>
                          <div>
                            <h3 className="font-medium text-gray-900">{alert.title}</h3>
                            <p className="text-sm text-gray-600">{alert.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>Source: {alert.source}</span>
                              <span>Occurrences: {alert.occurrenceCount}</span>
                              <span>Risk Score: {alert.riskScore.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 text-sm rounded-full text-white ${
                              alert.status === 'active' ? 'bg-red-600' :
                              alert.status === 'acknowledged' ? 'bg-yellow-600' :
                              'bg-green-600'
                            }`}
                          >
                            {alert.status}
                          </span>
                          {alert.assignedTo && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              Assigned: {alert.assignedTo}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Impact Assessment */}
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Impact Assessment</h4>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Confidentiality:</span>
                            <span className="ml-2 capitalize">{alert.impact.confidentiality}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Integrity:</span>
                            <span className="ml-2 capitalize">{alert.impact.integrity}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Availability:</span>
                            <span className="ml-2 capitalize">{alert.impact.availability}</span>
                          </div>
                        </div>
                      </div>

                      {/* Mitigation Steps */}
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Recommended Actions</h4>
                        <ul className="text-sm text-gray-700 space-y-1">
                          {alert.mitigationSteps.map((step, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-green-500 mt-1">•</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex gap-3">
                        {!alert.acknowledgedBy && alert.status === 'active' && (
                          <button
                            onClick={() => acknowledgeAlert(alert.id)}
                            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                          >
                            Acknowledge
                          </button>
                        )}
                        {alert.status !== 'resolved' && (
                          <button
                            onClick={() => resolveAlert(alert.id, 'Issue resolved by security team')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            Resolve
                          </button>
                        )}
                        <button
                          onClick={() => assignAlert(alert.id, 'security_team')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Assign to Team
                        </button>
                        <button
                          onClick={() => setSelectedAlert(alert)}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                          Full Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Investigation Tab */}
          {activeTab === 'investigation' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Security Investigation Tools</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Investigation Tools */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-medium mb-4">Investigation Tools</h3>
                  <div className="space-y-3">
                    <button className="w-full text-left p-3 border border-gray-200 rounded hover:bg-gray-50">
                      <div className="font-medium">Log Correlation Analysis</div>
                      <div className="text-sm text-gray-600">Correlate security events across multiple sources</div>
                    </button>
                    <button className="w-full text-left p-3 border border-gray-200 rounded hover:bg-gray-50">
                      <div className="font-medium">IP Address Investigation</div>
                      <div className="text-sm text-gray-600">Investigate suspicious IP addresses and geolocation</div>
                    </button>
                    <button className="w-full text-left p-3 border border-gray-200 rounded hover:bg-gray-50">
                      <div className="font-medium">User Behavior Analysis</div>
                      <div className="text-sm text-gray-600">Analyze user behavior patterns and anomalies</div>
                    </button>
                    <button className="w-full text-left p-3 border border-gray-200 rounded hover:bg-gray-50">
                      <div className="font-medium">Threat Intelligence Lookup</div>
                      <div className="text-sm text-gray-600">Query external threat intelligence databases</div>
                    </button>
                  </div>
                </div>

                {/* Investigation Timeline */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-medium mb-4">Investigation Timeline</h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mt-2"></div>
                      <div>
                        <div className="font-medium">Alert Detected</div>
                        <div className="text-sm text-gray-600">Brute force attempt from 192.168.1.100</div>
                        <div className="text-xs text-gray-400">2 hours ago</div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mt-2"></div>
                      <div>
                        <div className="font-medium">Investigation Started</div>
                        <div className="text-sm text-gray-600">Security team assigned to investigate</div>
                        <div className="text-xs text-gray-400">1.5 hours ago</div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-500 mt-2"></div>
                      <div>
                        <div className="font-medium">Evidence Collected</div>
                        <div className="text-sm text-gray-600">IP blocked and logs preserved</div>
                        <div className="text-xs text-gray-400">30 minutes ago</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Investigation Workspace */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium mb-4">Investigation Workspace</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Evidence</h4>
                    <div className="space-y-2 text-sm">
                      <div className="p-2 bg-gray-50 rounded">📄 Authentication logs (45 entries)</div>
                      <div className="p-2 bg-gray-50 rounded">🌐 Network traffic analysis</div>
                      <div className="p-2 bg-gray-50 rounded">👤 User session data</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Findings</h4>
                    <div className="space-y-2 text-sm">
                      <div className="p-2 bg-red-50 rounded text-red-800">🚨 47 failed login attempts</div>
                      <div className="p-2 bg-yellow-50 rounded text-yellow-800">⚠️ IP from known malicious range</div>
                      <div className="p-2 bg-green-50 rounded text-green-800">✅ No data exfiltration detected</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Actions Taken</h4>
                    <div className="space-y-2 text-sm">
                      <div className="p-2 bg-blue-50 rounded text-blue-800">🔒 IP address blocked</div>
                      <div className="p-2 bg-blue-50 rounded text-blue-800">📧 Security team notified</div>
                      <div className="p-2 bg-blue-50 rounded text-blue-800">📋 Incident report created</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Security Reports</h2>
                <button
                  onClick={generateSecurityReport}
                  disabled={isGeneratingReport}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isGeneratingReport ? 'Generating...' : 'Generate Report'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Report Templates */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-medium mb-4">Report Templates</h3>
                  <div className="space-y-3">
                    <div className="p-3 border border-gray-200 rounded">
                      <h4 className="font-medium">Daily Security Summary</h4>
                      <p className="text-sm text-gray-600">Overview of security events and alerts for the past 24 hours</p>
                      <button className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                        Generate
                      </button>
                    </div>
                    <div className="p-3 border border-gray-200 rounded">
                      <h4 className="font-medium">Threat Analysis Report</h4>
                      <p className="text-sm text-gray-600">Detailed analysis of detected threats and mitigation strategies</p>
                      <button className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                        Generate
                      </button>
                    </div>
                    <div className="p-3 border border-gray-200 rounded">
                      <h4 className="font-medium">Compliance Audit Report</h4>
                      <p className="text-sm text-gray-600">Assessment of security compliance across all systems</p>
                      <button className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                        Generate
                      </button>
                    </div>
                  </div>
                </div>

                {/* Report History */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-medium mb-4">Recent Reports</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <h4 className="font-medium">Weekly Security Report</h4>
                        <p className="text-sm text-gray-600">Generated on April 22, 2026</p>
                      </div>
                      <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                        Download
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <h4 className="font-medium">Incident Response Report</h4>
                        <p className="text-sm text-gray-600">Generated on April 20, 2026</p>
                      </div>
                      <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                        Download
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <h4 className="font-medium">Compliance Assessment</h4>
                        <p className="text-sm text-gray-600">Generated on April 18, 2026</p>
                      </div>
                      <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Security Event Details</h2>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">Event ID:</span>
                    <span className="ml-2 font-mono text-sm">{selectedEvent.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Timestamp:</span>
                    <span className="ml-2">{selectedEvent.timestamp.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Source:</span>
                    <span className="ml-2">{selectedEvent.source}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Type:</span>
                    <span className="ml-2 capitalize">{selectedEvent.type.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Severity:</span>
                    <span className="ml-2">
                      <span
                        className="px-2 py-1 text-xs text-white rounded"
                        style={{ backgroundColor: getSeverityColor(selectedEvent.severity) }}
                      >
                        {selectedEvent.severity}
                      </span>
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className="ml-2 capitalize">{selectedEvent.status.replace('_', ' ')}</span>
                  </div>
                </div>

                <div>
                  <span className="text-gray-600">Description:</span>
                  <p className="mt-1 p-3 bg-gray-50 rounded">{selectedEvent.description}</p>
                </div>

                {selectedEvent.ipAddress && (
                  <div>
                    <span className="text-gray-600">IP Address:</span>
                    <span className="ml-2 font-mono">{selectedEvent.ipAddress}</span>
                  </div>
                )}

                {selectedEvent.userId && (
                  <div>
                    <span className="text-gray-600">User ID:</span>
                    <span className="ml-2">{selectedEvent.userId}</span>
                  </div>
                )}

                {selectedEvent.affectedResources.length > 0 && (
                  <div>
                    <span className="text-gray-600">Affected Resources:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {selectedEvent.affectedResources.map((resource, idx) => (
                        <span key={idx} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                          {resource}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-gray-600">Tags:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {selectedEvent.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Create Incident
                  </button>
                  <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                    Export Details
                  </button>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alert Details Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{selectedAlert.title}</h2>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">Alert ID:</span>
                    <span className="ml-2 font-mono text-sm">{selectedAlert.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Severity:</span>
                    <span className="ml-2">
                      <span
                        className="px-2 py-1 text-xs text-white rounded"
                        style={{ backgroundColor: getSeverityColor(selectedAlert.severity) }}
                      >
                        {selectedAlert.severity}
                      </span>
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className="ml-2 capitalize">{selectedAlert.status}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Risk Score:</span>
                    <span className="ml-2 font-bold">{selectedAlert.riskScore.toFixed(1)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">First Seen:</span>
                    <span className="ml-2">{selectedAlert.firstSeen.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Last Seen:</span>
                    <span className="ml-2">{selectedAlert.lastSeen.toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <span className="text-gray-600">Description:</span>
                  <p className="mt-1 p-3 bg-gray-50 rounded">{selectedAlert.description}</p>
                </div>

                <div>
                  <span className="text-gray-600">Source:</span>
                  <span className="ml-2">{selectedAlert.source}</span>
                </div>

                <div>
                  <span className="text-gray-600">Detection Rule:</span>
                  <span className="ml-2 font-mono text-sm">{selectedAlert.detectionRule}</span>
                </div>

                <div>
                  <span className="text-gray-600">Affected Systems:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {selectedAlert.affectedSystems.map((system, idx) => (
                      <span key={idx} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                        {system}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  {!selectedAlert.acknowledgedBy && selectedAlert.status === 'active' && (
                    <button
                      onClick={() => acknowledgeAlert(selectedAlert.id)}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                    >
                      Acknowledge
                    </button>
                  )}
                  {selectedAlert.status !== 'resolved' && (
                    <button
                      onClick={() => resolveAlert(selectedAlert.id, 'Resolved by security team')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Resolve
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedAlert(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}