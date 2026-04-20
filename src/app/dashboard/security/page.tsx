"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth-context";
import { logger, LogCategory } from "@/lib/logger";

interface SecurityEvent {
  id: string;
  timestamp: string;
  type: 'threat' | 'anomaly' | 'breach' | 'suspicious' | 'normal';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  description: string;
  ipAddress?: string;
  userId?: string;
  metadata: Record<string, any>;
}

interface ThreatMetrics {
  totalEvents: number;
  criticalEvents: number;
  activeThreats: number;
  blockedIPs: number;
  responseTime: number;
}

interface AnomalyDetection {
  isAnomaly: boolean;
  confidence: number;
  anomalyType: string;
  baselineValue: number;
  actualValue: number;
  threshold: number;
}

export default function SecurityMonitoringDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'threats' | 'anomalies' | 'events' | 'reports'>('overview');
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [threatMetrics, setThreatMetrics] = useState<ThreatMetrics>({
    totalEvents: 0,
    criticalEvents: 0,
    activeThreats: 0,
    blockedIPs: 0,
    responseTime: 0
  });
  const [anomalies, setAnomalies] = useState<AnomalyDetection[]>([]);

  useEffect(() => {
    logger.info(LogCategory.SECURITY, 'Security monitoring dashboard accessed', {
      userId: user?.id
    });

    generateMockSecurityData();
  }, [user?.id]);

  const generateMockSecurityData = () => {
    // Generate security events
    const events: SecurityEvent[] = [];
    const eventTypes = ['threat', 'anomaly', 'breach', 'suspicious', 'normal'];
    const severities = ['low', 'medium', 'high', 'critical'];
    const sources = ['API Gateway', 'Authentication', 'Database', 'File System', 'Network'];

    for (let i = 0; i < 50; i++) {
      events.push({
        id: `event_${i}`,
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        type: eventTypes[Math.floor(Math.random() * eventTypes.length)] as any,
        severity: severities[Math.floor(Math.random() * severities.length)] as any,
        source: sources[Math.floor(Math.random() * sources.length)],
        description: generateEventDescription(),
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        userId: Math.random() > 0.5 ? `user_${Math.floor(Math.random() * 1000)}` : undefined,
        metadata: {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          endpoint: `/api/${['users', 'auth', 'data', 'files'][Math.floor(Math.random() * 4)]}`,
          responseCode: [200, 401, 403, 404, 500][Math.floor(Math.random() * 5)]
        }
      });
    }

    setSecurityEvents(events);

    // Generate threat metrics
    setThreatMetrics({
      totalEvents: events.length,
      criticalEvents: events.filter(e => e.severity === 'critical').length,
      activeThreats: Math.floor(Math.random() * 10),
      blockedIPs: Math.floor(Math.random() * 50),
      responseTime: Math.random() * 500 + 100
    });

    // Generate anomalies
    const anomalyTypes = ['unusual_login_pattern', 'high_error_rate', 'suspicious_traffic', 'data_exfiltration'];
    const mockAnomalies: AnomalyDetection[] = [];

    for (let i = 0; i < 5; i++) {
      mockAnomalies.push({
        isAnomaly: Math.random() > 0.5,
        confidence: Math.random(),
        anomalyType: anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)],
        baselineValue: Math.random() * 100,
        actualValue: Math.random() * 200,
        threshold: Math.random() * 150 + 50
      });
    }

    setAnomalies(mockAnomalies);
  };

  const generateEventDescription = (): string => {
    const descriptions = [
      'Failed login attempt from unknown IP',
      'SQL injection attempt detected',
      'Unusual data access pattern',
      'Multiple authentication failures',
      'Suspicious file upload attempt',
      'Rate limit exceeded',
      'Invalid API key usage',
      'Unauthorized access attempt',
      'Malicious payload detected',
      'Brute force attack detected'
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'threat': return 'bg-red-500';
      case 'breach': return 'bg-purple-500';
      case 'anomaly': return 'bg-yellow-500';
      case 'suspicious': return 'bg-orange-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <DashboardLayout activeTab="security">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Security Monitoring</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('threats')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'threats'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Threats
            </button>
            <button
              onClick={() => setActiveTab('anomalies')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'anomalies'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Anomalies
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'events'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Events
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'reports'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Reports
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">Total Events</h3>
              <div className="mt-4">
                <div className="text-3xl font-bold text-blue-600">{threatMetrics.totalEvents}</div>
                <div className="text-sm text-gray-600">Last 24 hours</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">Critical Events</h3>
              <div className="mt-4">
                <div className="text-3xl font-bold text-red-600">{threatMetrics.criticalEvents}</div>
                <div className="text-sm text-gray-600">Require immediate attention</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">Active Threats</h3>
              <div className="mt-4">
                <div className="text-3xl font-bold text-orange-600">{threatMetrics.activeThreats}</div>
                <div className="text-sm text-gray-600">Currently monitored</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">Response Time</h3>
              <div className="mt-4">
                <div className="text-3xl font-bold text-green-600">{threatMetrics.responseTime.toFixed(0)}ms</div>
                <div className="text-sm text-gray-600">Average incident response</div>
              </div>
            </div>
          </div>
        )}

        {/* Threats Tab */}
        {activeTab === 'threats' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Threat Distribution</h3>
                <div className="space-y-3">
                  {['threat', 'breach', 'anomaly', 'suspicious', 'normal'].map((type) => {
                    const count = securityEvents.filter(e => e.type === type).length;
                    const percentage = (count / securityEvents.length) * 100;
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getTypeColor(type)}`}></div>
                          <span className="capitalize text-sm font-medium">{type}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {count} ({percentage.toFixed(1)}%)
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Severity Breakdown</h3>
                <div className="space-y-3">
                  {['critical', 'high', 'medium', 'low'].map((severity) => {
                    const count = securityEvents.filter(e => e.severity === severity).length;
                    return (
                      <div key={severity} className="flex items-center justify-between">
                        <span className={`px-2 py-1 text-xs font-semibold rounded border capitalize ${getSeverityColor(severity)}`}>
                          {severity}
                        </span>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Anomalies Tab */}
        {activeTab === 'anomalies' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Anomaly Detection</h3>
              <div className="space-y-4">
                {anomalies.map((anomaly, index) => (
                  <div key={index} className={`p-4 rounded-lg border-l-4 ${
                    anomaly.isAnomaly ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 capitalize">
                          {anomaly.anomalyType.replace('_', ' ')}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Baseline: {anomaly.baselineValue.toFixed(1)} |
                          Actual: {anomaly.actualValue.toFixed(1)} |
                          Threshold: {anomaly.threshold.toFixed(1)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-semibold ${
                          anomaly.isAnomaly ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {anomaly.isAnomaly ? 'ANOMALY' : 'NORMAL'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {anomaly.confidence.toFixed(2)} confidence
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Security Events</h3>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {securityEvents.slice(0, 20).map((event) => (
                <div key={event.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${getTypeColor(event.type)}`}></div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{event.description}</div>
                        <div className="text-xs text-gray-500">
                          {event.source} • {event.ipAddress} • {new Date(event.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded border capitalize ${getSeverityColor(event.severity)}`}>
                      {event.severity}
                    </span>
                  </div>
                  {event.userId && (
                    <div className="mt-2 text-xs text-gray-600">
                      User: {event.userId}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Report</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Events</span>
                    <span className="text-sm font-medium">{securityEvents.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Threat Events</span>
                    <span className="text-sm font-medium text-red-600">
                      {securityEvents.filter(e => e.type === 'threat').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Blocked IPs</span>
                    <span className="text-sm font-medium text-orange-600">{threatMetrics.blockedIPs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg Response Time</span>
                    <span className="text-sm font-medium text-blue-600">{threatMetrics.responseTime.toFixed(0)}ms</span>
                  </div>
                </div>
                <div className="mt-6">
                  <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    Generate Full Report
                  </button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Status</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">GDPR Compliance</span>
                    <span className="text-sm font-medium text-green-600">✓ Compliant</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">POPIA Compliance</span>
                    <span className="text-sm font-medium text-green-600">✓ Compliant</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Security Audits</span>
                    <span className="text-sm font-medium text-yellow-600">⚠ Review Due</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Data Encryption</span>
                    <span className="text-sm font-medium text-green-600">✓ Enabled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}