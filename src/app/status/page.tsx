'use client';

import { useState, useEffect } from 'react';

interface SystemStatus {
  overall: 'operational' | 'degraded' | 'major-outage' | 'maintenance';
  uptime: {
    '24h': number;
    '7d': number;
    '30d': number;
  };
  services: {
    name: string;
    status: 'operational' | 'degraded' | 'outage' | 'maintenance';
    description: string;
    lastIncident?: string;
  }[];
  incidents: {
    id: string;
    title: string;
    status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
    impact: 'none' | 'minor' | 'major' | 'critical';
    created: string;
    updated: string;
    description: string;
  }[];
}

export default function StatusPage() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const mockStatus: SystemStatus = {
      overall: 'operational',
      uptime: {
        '24h': 99.9,
        '7d': 99.8,
        '30d': 99.95
      },
      services: [
        {
          name: 'Web Platform',
          status: 'operational',
          description: 'Main application and user interface'
        },
        {
          name: 'API Services',
          status: 'operational',
          description: 'REST and GraphQL API endpoints'
        },
        {
          name: 'Database',
          status: 'operational',
          description: 'Primary data storage and retrieval'
        },
        {
          name: 'File Storage',
          status: 'operational',
          description: 'Document and media file storage'
        },
        {
          name: 'Email Service',
          status: 'degraded',
          description: 'Email delivery and notifications',
          lastIncident: 'Minor delay in email delivery (5-10 minutes)'
        },
        {
          name: 'Payment Processing',
          status: 'operational',
          description: 'Payment gateway and transaction processing'
        },
        {
          name: 'Analytics',
          status: 'operational',
          description: 'Usage analytics and reporting'
        },
        {
          name: 'Backup Systems',
          status: 'operational',
          description: 'Automated backup and disaster recovery'
        }
      ],
      incidents: [
        {
          id: 'INC-2024-001',
          title: 'Email Delivery Delay',
          status: 'monitoring',
          impact: 'minor',
          created: '2024-01-15T10:30:00Z',
          updated: '2024-01-15T14:45:00Z',
          description: 'We are experiencing a minor delay in email delivery (5-10 minutes). Our team is monitoring the situation and working on a resolution.'
        },
        {
          id: 'INC-2024-002',
          title: 'Scheduled Maintenance',
          status: 'resolved',
          impact: 'none',
          created: '2024-01-10T02:00:00Z',
          updated: '2024-01-10T04:30:00Z',
          description: 'Completed scheduled maintenance on our database systems. No impact on service availability.'
        }
      ]
    };

    setTimeout(() => {
      setStatus(mockStatus);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800';
      case 'degraded': return 'bg-yellow-100 text-yellow-800';
      case 'outage':
      case 'major-outage': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return '✅';
      case 'degraded': return '⚠️';
      case 'outage':
      case 'major-outage': return '❌';
      case 'maintenance': return '🔧';
      default: return '❓';
    }
  };

  const getIncidentStatusColor = (status: string) => {
    switch (status) {
      case 'investigating': return 'bg-red-100 text-red-800';
      case 'identified': return 'bg-orange-100 text-orange-800';
      case 'monitoring': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'none': return 'bg-gray-100 text-gray-800';
      case 'minor': return 'bg-blue-100 text-blue-800';
      case 'major': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking system status...</p>
        </div>
      </div>
    );
  }

  if (!status) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="text-4xl">{getStatusIcon(status.overall)}</span>
            <h1 className="text-4xl font-bold text-gray-900">System Status</h1>
          </div>
          <p className="text-xl text-gray-600">
            Current status of Garlaws Platform services
          </p>
        </div>

        {/* Overall Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="text-center">
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-medium mb-4 ${getStatusColor(status.overall)}`}>
              <span className="mr-2">{getStatusIcon(status.overall)}</span>
              All Systems {status.overall.charAt(0).toUpperCase() + status.overall.slice(1).replace('-', ' ')}
            </div>
            <p className="text-gray-600 mb-6">
              Last updated: {new Date().toLocaleString()}
            </p>
          </div>

          {/* Uptime Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{status.uptime['24h']}%</div>
              <div className="text-sm text-gray-600">Last 24 Hours</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{status.uptime['7d']}%</div>
              <div className="text-sm text-gray-600">Last 7 Days</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{status.uptime['30d']}%</div>
              <div className="text-sm text-gray-600">Last 30 Days</div>
            </div>
          </div>
        </div>

        {/* Services Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Service Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {status.services.map((service, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{service.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(service.status)}`}>
                    {service.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                {service.lastIncident && (
                  <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                    {service.lastIncident}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Active Incidents */}
        {status.incidents.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Active Incidents</h2>
            <div className="space-y-4">
              {status.incidents.map((incident) => (
                <div key={incident.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getIncidentStatusColor(incident.status)}`}>
                          {incident.status}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getImpactColor(incident.impact)}`}>
                          {incident.impact} impact
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{incident.title}</h3>
                      <p className="text-gray-700 mb-4">{incident.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Started: {new Date(incident.created).toLocaleString()}</span>
                    <span>Updated: {new Date(incident.updated).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Incident History */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Incident History</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Incident</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Impact</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Started</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Duration</th>
                </tr>
              </thead>
              <tbody>
                {status.incidents.map((incident) => (
                  <tr key={incident.id} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{incident.title}</div>
                      <div className="text-sm text-gray-600">#{incident.id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getIncidentStatusColor(incident.status)}`}>
                        {incident.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getImpactColor(incident.impact)}`}>
                        {incident.impact}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(incident.created).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {incident.status === 'resolved'
                        ? `${Math.round((new Date(incident.updated).getTime() - new Date(incident.created).getTime()) / (1000 * 60))}m`
                        : 'Ongoing'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Subscribe to Updates */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Informed</h2>
          <p className="text-xl mb-6 text-blue-100">
            Get notified about system updates and maintenance schedules
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-300"
            />
            <button className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Subscribe
            </button>
          </div>
          <p className="text-sm text-blue-200 mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </div>
  );
}