'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface SecurityEvent {
  id: string;
  timestamp: string;
  type: 'threat' | 'anomaly' | 'breach' | 'policy';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  description: string;
  status: 'detected' | 'investigating' | 'resolved' | 'false_positive';
  actions: string[];
}

interface ZeroTrustPolicy {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  rules: string[];
  lastUpdated: string;
}

const securityEvents: SecurityEvent[] = [
  {
    id: 'evt_001',
    timestamp: '2026-04-21T14:30:00Z',
    type: 'threat',
    severity: 'high',
    source: 'Network Firewall',
    description: 'Suspicious outbound connection to known malicious IP',
    status: 'investigating',
    actions: ['Block IP', 'Alert Security Team', 'Log Event']
  },
  {
    id: 'evt_002',
    timestamp: '2026-04-21T14:15:00Z',
    type: 'anomaly',
    severity: 'medium',
    source: 'User Behavior Analytics',
    description: 'Unusual login pattern detected for user admin@gowlaws.com',
    status: 'resolved',
    actions: ['Send Notification', 'Log Event']
  },
  {
    id: 'evt_003',
    timestamp: '2026-04-21T14:00:00Z',
    type: 'policy',
    severity: 'low',
    source: 'Compliance Engine',
    description: 'GDPR data retention policy violation detected',
    status: 'resolved',
    actions: ['Auto-remediate', 'Log Compliance']
  }
];

const zeroTrustPolicies: ZeroTrustPolicy[] = [
  {
    id: 'zt_001',
    name: 'Continuous Authentication',
    description: 'Real-time user authentication verification',
    status: 'active',
    rules: ['Device fingerprinting', 'Behavioral analysis', 'Risk scoring'],
    lastUpdated: '2026-04-21'
  },
  {
    id: 'zt_002',
    name: 'Micro-Segmentation',
    description: 'Network segmentation at application level',
    status: 'active',
    rules: ['East-west traffic control', 'Service mesh integration', 'Policy enforcement'],
    lastUpdated: '2026-04-20'
  },
  {
    id: 'zt_003',
    name: 'Just-in-Time Access',
    description: 'Time-limited privileged access',
    status: 'active',
    rules: ['Ephemeral credentials', 'Access approval workflow', 'Auto-revocation'],
    lastUpdated: '2026-04-19'
  }
];

export default function ZeroTrustSecurity() {
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [activeTab, setActiveTab] = useState<'events' | 'policies' | 'threats'>('events');
  const [threatLevel, setThreatLevel] = useState<'low' | 'medium' | 'high' | 'critical'>('low');

  useEffect(() => {
    // Simulate real-time threat level updates
    const interval = setInterval(() => {
      const levels: ('low' | 'medium' | 'high' | 'critical')[] = ['low', 'medium', 'high', 'critical'];
      setThreatLevel(levels[Math.floor(Math.random() * levels.length)]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">Garlaws</span>
            </Link>

            <div className="flex items-center gap-8">
              <Link href="/security" className="text-gray-600 hover:text-gray-900">Security</Link>
              <Link href="/compliance" className="text-gray-600 hover:text-gray-900">Compliance</Link>
              <Link href="/threats" className="text-gray-600 hover:text-gray-900">Threats</Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Zero Trust Security</h1>
          <p className="text-gray-600">Advanced enterprise security with continuous verification</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Threat Level</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">{threatLevel}</p>
              </div>
              <div className={`w-4 h-4 rounded-full ${getThreatLevelColor(threatLevel)}`} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Sessions</p>
                <p className="text-2xl font-bold text-gray-900">1,247</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-sm">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Blocked Threats</p>
                <p className="text-2xl font-bold text-gray-900">89</p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 text-sm">🛡️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Compliance Score</p>
                <p className="text-2xl font-bold text-gray-900">98.7%</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-sm">✅</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { id: 'events', label: 'Security Events' },
                { id: 'policies', label: 'Zero Trust Policies' },
                { id: 'threats', label: 'Threat Intelligence' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'events' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Security Events</h2>
                  <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
                </div>

                {securityEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(event.severity)}`}
                        >
                          {event.severity}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">{event.description}</p>
                          <p className="text-sm text-gray-600">{event.source} • {new Date(event.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          event.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          event.status === 'investigating' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {event.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'policies' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Zero Trust Policies</h2>
                  <button className="text-sm text-blue-600 hover:text-blue-800">Add Policy</button>
                </div>

                {zeroTrustPolicies.map((policy) => (
                  <div key={policy.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{policy.name}</h3>
                        <p className="text-sm text-gray-600">{policy.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          policy.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {policy.status}
                        </span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Rules:</p>
                      <div className="flex flex-wrap gap-2">
                        {policy.rules.map((rule, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {rule}
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-gray-500">Last updated: {policy.lastUpdated}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'threats' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Threat Intelligence</h2>
                  <button className="text-sm text-blue-600 hover:text-blue-800">Update Feeds</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Active Threats</h3>
                    <p className="text-2xl font-bold text-red-600">12</p>
                    <p className="text-sm text-gray-600">Currently monitored</p>
                  </div>

                  <div className="p-6 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Blocked IPs</h3>
                    <p className="text-2xl font-bold text-orange-600">1,847</p>
                    <p className="text-sm text-gray-600">This month</p>
                  </div>

                  <div className="p-6 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Intelligence Sources</h3>
                    <p className="text-2xl font-bold text-blue-600">47</p>
                    <p className="text-sm text-gray-600">Active feeds</p>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-yellow-400">⚠️</span>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">High Risk Alert</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        Increased phishing attempts detected targeting property management credentials.
                        Enhanced monitoring activated.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Event Details</h3>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-medium text-gray-900">{selectedEvent.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Severity</p>
                    <p className={`font-medium ${getSeverityColor(selectedEvent.severity).split(' ')[0]}`}>
                      {selectedEvent.severity}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Description</p>
                    <p className="text-gray-900">{selectedEvent.description}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Actions Taken</p>
                    <ul className="text-sm text-gray-900">
                      {selectedEvent.actions.map((action, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}