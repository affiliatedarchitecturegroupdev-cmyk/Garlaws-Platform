'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Tenant {
  id: string;
  name: string;
  domain: string;
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'inactive' | 'suspended';
  users: number;
  storage: string;
  lastActive: string;
  region: string;
}

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rollout: number; // percentage rollout
  tenants: string[]; // specific tenants
}

const tenants: Tenant[] = [
  {
    id: 'tenant_001',
    name: 'ABC Properties',
    domain: 'abc-properties.garlaws.com',
    plan: 'enterprise',
    status: 'active',
    users: 245,
    storage: '2.4TB',
    lastActive: '2026-04-21T14:30:00Z',
    region: 'us-east-1'
  },
  {
    id: 'tenant_002',
    name: 'City Realty Group',
    domain: 'city-realty.garlaws.com',
    plan: 'professional',
    status: 'active',
    users: 89,
    storage: '856GB',
    lastActive: '2026-04-21T14:15:00Z',
    region: 'us-west-2'
  },
  {
    id: 'tenant_003',
    name: 'Metro Properties',
    domain: 'metro-properties.garlaws.com',
    plan: 'starter',
    status: 'active',
    users: 34,
    storage: '234GB',
    lastActive: '2026-04-21T13:45:00Z',
    region: 'eu-west-1'
  },
  {
    id: 'tenant_004',
    name: 'Downtown Realty',
    domain: 'downtown-realty.garlaws.com',
    plan: 'enterprise',
    status: 'suspended',
    users: 156,
    storage: '1.8TB',
    lastActive: '2026-04-20T16:20:00Z',
    region: 'us-east-1'
  }
];

const featureFlags: FeatureFlag[] = [
  {
    id: 'ff_001',
    name: 'Advanced AI Models',
    description: 'Custom ML models and predictive analytics',
    enabled: true,
    rollout: 75,
    tenants: ['tenant_001', 'tenant_002']
  },
  {
    id: 'ff_002',
    name: 'Blockchain Integration',
    description: 'NFT tokenization and smart contracts',
    enabled: false,
    rollout: 0,
    tenants: []
  },
  {
    id: 'ff_003',
    name: 'Multi-Region Deployment',
    description: 'Global data replication and CDN',
    enabled: true,
    rollout: 100,
    tenants: ['tenant_001', 'tenant_002', 'tenant_003']
  },
  {
    id: 'ff_004',
    name: 'Advanced Security',
    description: 'Zero-trust security and threat detection',
    enabled: true,
    rollout: 90,
    tenants: ['tenant_001', 'tenant_004']
  }
];

export default function MultiTenantPlatform() {
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [activeTab, setActiveTab] = useState<'tenants' | 'features' | 'regions'>('tenants');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTenants = tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      case 'professional': return 'bg-blue-100 text-blue-800';
      case 'starter': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">Garlaws</span>
            </Link>

            <div className="flex items-center gap-8">
              <Link href="/tenants" className="text-gray-600 hover:text-gray-900">Tenants</Link>
              <Link href="/features" className="text-gray-600 hover:text-gray-900">Features</Link>
              <Link href="/regions" className="text-gray-600 hover:text-gray-900">Regions</Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Multi-Tenant Platform</h1>
          <p className="text-gray-600">Enterprise-grade multi-tenancy with global scalability</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tenants</p>
                <p className="text-2xl font-bold text-gray-900">{tenants.length}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-sm">🏢</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tenants.reduce((sum, tenant) => sum + tenant.users, 0).toLocaleString()}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-sm">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Regions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(tenants.map(t => t.region)).size}
                </p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-sm">🌍</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Uptime SLA</p>
                <p className="text-2xl font-bold text-gray-900">99.9%</p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 text-sm">⚡</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { id: 'tenants', label: 'Tenant Management' },
                { id: 'features', label: 'Feature Flags' },
                { id: 'regions', label: 'Regional Deployment' }
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
            {activeTab === 'tenants' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Tenant Management</h2>
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      placeholder="Search tenants..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                      Add Tenant
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredTenants.map((tenant) => (
                    <div
                      key={tenant.id}
                      className="p-6 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer"
                      onClick={() => setSelectedTenant(tenant)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{tenant.name}</h3>
                          <p className="text-sm text-gray-600">{tenant.domain}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(tenant.status)}`}>
                            {tenant.status}
                          </span>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getPlanColor(tenant.plan)}`}>
                            {tenant.plan}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Users:</span>
                          <span className="ml-2 font-medium text-gray-900">{tenant.users}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Storage:</span>
                          <span className="ml-2 font-medium text-gray-900">{tenant.storage}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Region:</span>
                          <span className="ml-2 font-medium text-gray-900">{tenant.region}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Last Active:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {new Date(tenant.lastActive).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'features' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Feature Flags</h2>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                    Add Feature Flag
                  </button>
                </div>

                <div className="space-y-4">
                  {featureFlags.map((flag) => (
                    <div key={flag.id} className="p-6 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-medium text-gray-900">{flag.name}</h3>
                          <p className="text-sm text-gray-600">{flag.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            flag.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {flag.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                          <span className="text-sm text-gray-600">{flag.rollout}% rollout</span>
                        </div>
                      </div>

                      {flag.tenants.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Specific Tenants:</p>
                          <div className="flex flex-wrap gap-2">
                            {flag.tenants.map((tenantId) => {
                              const tenant = tenants.find(t => t.id === tenantId);
                              return (
                                <span
                                  key={tenantId}
                                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                >
                                  {tenant?.name}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'regions' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Regional Deployment</h2>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                    Add Region
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1', 'ca-central-1'].map((region) => {
                    const regionTenants = tenants.filter(t => t.region === region);
                    return (
                      <div key={region} className="p-6 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-medium text-gray-900">{region}</h3>
                          <span className="text-sm text-gray-600">{regionTenants.length} tenants</span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Total Users:</span>
                            <span className="text-gray-900">
                              {regionTenants.reduce((sum, t) => sum + t.users, 0)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Storage Used:</span>
                            <span className="text-gray-900">
                              {regionTenants.reduce((sum, t) => sum + parseFloat(t.storage.replace(/[^\d.]/g, '')), 0).toFixed(1)}TB
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Status:</span>
                            <span className="text-green-600">✓ Operational</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {selectedTenant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{selectedTenant.name}</h3>
                  <button
                    onClick={() => setSelectedTenant(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Domain</p>
                    <p className="font-medium text-gray-900">{selectedTenant.domain}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Plan</p>
                    <p className="font-medium text-gray-900 capitalize">{selectedTenant.plan}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-medium text-gray-900 capitalize">{selectedTenant.status}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Users</p>
                      <p className="font-medium text-gray-900">{selectedTenant.users}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Storage</p>
                      <p className="font-medium text-gray-900">{selectedTenant.storage}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700">
                    Manage Tenant
                  </button>
                  <button className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300">
                    View Logs
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}