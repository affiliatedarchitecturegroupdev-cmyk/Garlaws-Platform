'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CacheEntry {
  key: string;
  size: string;
  hits: number;
  misses: number;
  lastAccessed: string;
  ttl: number;
  status: 'active' | 'expired' | 'evicted';
}

interface CDNNode {
  id: string;
  region: string;
  status: 'online' | 'offline' | 'degraded';
  bandwidth: string;
  requests: number;
  cacheHitRate: number;
  latency: number;
}

interface OptimizationMetric {
  name: string;
  value: string;
  target: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

const cacheEntries: CacheEntry[] = [
  {
    key: 'api/v1/properties',
    size: '2.4MB',
    hits: 15420,
    misses: 2340,
    lastAccessed: '2026-04-21T14:30:00Z',
    ttl: 3600,
    status: 'active'
  },
  {
    key: 'api/v1/analytics/dashboard',
    size: '856KB',
    hits: 8920,
    misses: 1240,
    lastAccessed: '2026-04-21T14:25:00Z',
    ttl: 1800,
    status: 'active'
  },
  {
    key: 'api/v1/reports/monthly',
    size: '3.2MB',
    hits: 5670,
    misses: 890,
    lastAccessed: '2026-04-21T14:15:00Z',
    ttl: 7200,
    status: 'active'
  }
];

const cdnNodes: CDNNode[] = [
  { id: 'cdn-us-east-1', region: 'US East', status: 'online', bandwidth: '2.4Gbps', requests: 45670, cacheHitRate: 94.2, latency: 23 },
  { id: 'cdn-us-west-2', region: 'US West', status: 'online', bandwidth: '1.8Gbps', requests: 32890, cacheHitRate: 91.8, latency: 45 },
  { id: 'cdn-eu-west-1', region: 'EU West', status: 'online', bandwidth: '3.2Gbps', requests: 52340, cacheHitRate: 96.1, latency: 12 },
  { id: 'cdn-ap-southeast-1', region: 'Asia Pacific', status: 'degraded', bandwidth: '2.1Gbps', requests: 28940, cacheHitRate: 88.7, latency: 156 }
];

const optimizationMetrics: OptimizationMetric[] = [
  { name: 'Bundle Size', value: '2.4MB', target: '<3MB', status: 'good', trend: 'stable' },
  { name: 'First Contentful Paint', value: '1.2s', target: '<2s', status: 'good', trend: 'down' },
  { name: 'Time to Interactive', value: '2.8s', target: '<3s', status: 'good', trend: 'down' },
  { name: 'Lighthouse Score', value: '92', target: '>90', status: 'good', trend: 'up' },
  { name: 'API Response Time', value: '145ms', target: '<200ms', status: 'good', trend: 'down' },
  { name: 'Cache Hit Rate', value: '94.2%', target: '>90%', status: 'good', trend: 'up' }
];

export default function PerformanceOptimization() {
  const [selectedTab, setSelectedTab] = useState<'metrics' | 'cache' | 'cdn' | 'optimization'>('metrics');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);

  const runOptimization = async () => {
    setIsOptimizing(true);
    setOptimizationProgress(0);

    const steps = [
      'Analyzing bundle size...',
      'Optimizing images...',
      'Compressing assets...',
      'Updating cache strategies...',
      'Deploying optimizations...'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOptimizationProgress(((i + 1) / steps.length) * 100);
    }

    setIsOptimizing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCDNStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">Garlaws</span>
            </Link>

            <div className="flex items-center gap-8">
              <Link href="/performance" className="text-gray-600 hover:text-gray-900">Performance</Link>
              <Link href="/cache" className="text-gray-600 hover:text-gray-900">Cache</Link>
              <Link href="/cdn" className="text-gray-600 hover:text-gray-900">CDN</Link>
              <Link href="/optimization" className="text-gray-600 hover:text-gray-900">Optimization</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Performance Optimization</h1>
          <p className="text-gray-600">Advanced caching, CDN integration, and scalability improvements</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { id: 'metrics', label: 'Performance Metrics' },
                { id: 'cache', label: 'Cache Management' },
                { id: 'cdn', label: 'CDN Network' },
                { id: 'optimization', label: 'Optimization Tools' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    selectedTab === tab.id
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
            {selectedTab === 'metrics' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Performance Metrics</h2>
                  <button
                    onClick={runOptimization}
                    disabled={isOptimizing}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isOptimizing ? 'Optimizing...' : 'Run Optimization'}
                  </button>
                </div>

                {isOptimizing && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      <span className="text-blue-800 font-medium">Running performance optimization...</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${optimizationProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {optimizationMetrics.map((metric) => (
                    <div
                      key={metric.name}
                      className={`p-6 rounded-xl border ${
                        metric.status === 'good' ? 'bg-green-50 border-green-200' :
                        metric.status === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                        'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-600">{metric.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          metric.status === 'good' ? 'bg-green-100 text-green-800' :
                          metric.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {metric.status}
                        </span>
                      </div>

                      <div className="mb-2">
                        <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
                        <span className="text-sm text-gray-600 ml-2">Target: {metric.target}</span>
                      </div>

                      <div className="flex items-center gap-1 text-sm">
                        <span className={`${
                          metric.trend === 'up' ? 'text-green-600' :
                          metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'}
                        </span>
                        <span className="text-gray-600">vs last week</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTab === 'cache' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Cache Management</h2>
                  <div className="flex gap-3">
                    <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300">
                      Clear All
                    </button>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                      Add Entry
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {cacheEntries.map((entry) => (
                    <div key={entry.key} className="p-6 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-medium text-gray-900 font-mono text-sm">{entry.key}</h3>
                          <p className="text-sm text-gray-600">Size: {entry.size} • TTL: {entry.ttl}s</p>
                        </div>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          entry.status === 'active' ? 'bg-green-100 text-green-800' :
                          entry.status === 'expired' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {entry.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Hits:</span>
                          <span className="ml-2 font-medium text-green-600">{entry.hits.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Misses:</span>
                          <span className="ml-2 font-medium text-red-600">{entry.misses.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Hit Rate:</span>
                          <span className="ml-2 font-medium text-blue-600">
                            {((entry.hits / (entry.hits + entry.misses)) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 mt-2">
                        Last accessed: {new Date(entry.lastAccessed).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTab === 'cdn' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">CDN Network Status</h2>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                    Add Node
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {cdnNodes.map((node) => (
                    <div key={node.id} className="p-6 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-medium text-gray-900">{node.region}</h3>
                          <p className="text-sm text-gray-600 font-mono">{node.id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getCDNStatusColor(node.status)}`} />
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            node.status === 'online' ? 'bg-green-100 text-green-800' :
                            node.status === 'degraded' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {node.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-gray-600">Bandwidth:</span>
                          <span className="ml-2 font-medium text-gray-900">{node.bandwidth}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Requests:</span>
                          <span className="ml-2 font-medium text-gray-900">{node.requests.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Cache Hit Rate:</span>
                          <span className="ml-2 font-medium text-green-600">{node.cacheHitRate}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Latency:</span>
                          <span className="ml-2 font-medium text-blue-600">{node.latency}ms</span>
                        </div>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${node.cacheHitRate}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Cache performance</p>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-blue-900 mb-2">CDN Analytics</h3>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">4</div>
                      <div className="text-sm text-blue-700">Active Nodes</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">159.8K</div>
                      <div className="text-sm text-blue-700">Total Requests</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">92.7%</div>
                      <div className="text-sm text-blue-700">Avg Cache Hit Rate</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">59ms</div>
                      <div className="text-sm text-blue-700">Avg Latency</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'optimization' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Optimization Tools</h2>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
                    Run All Optimizations
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 border border-gray-200 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Bundle Optimization</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Code Splitting</span>
                        <span className="text-sm text-green-600">✓ Enabled</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Tree Shaking</span>
                        <span className="text-sm text-green-600">✓ Active</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Minification</span>
                        <span className="text-sm text-green-600">✓ Enabled</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Compression</span>
                        <span className="text-sm text-yellow-600">⚠ Partial</span>
                      </div>
                    </div>
                    <button className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700">
                      Optimize Bundle
                    </button>
                  </div>

                  <div className="p-6 border border-gray-200 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Image Optimization</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">WebP/AVIF Support</span>
                        <span className="text-sm text-green-600">✓ Enabled</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Lazy Loading</span>
                        <span className="text-sm text-green-600">✓ Active</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Responsive Images</span>
                        <span className="text-sm text-green-600">✓ Enabled</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">CDN Integration</span>
                        <span className="text-sm text-green-600">✓ Connected</span>
                      </div>
                    </div>
                    <button className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700">
                      Optimize Images
                    </button>
                  </div>

                  <div className="p-6 border border-gray-200 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Database Optimization</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Connection Pooling</span>
                        <span className="text-sm text-green-600">✓ Active</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Query Caching</span>
                        <span className="text-sm text-green-600">✓ Enabled</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Index Optimization</span>
                        <span className="text-sm text-yellow-600">⚠ Needs Review</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Replication</span>
                        <span className="text-sm text-green-600">✓ Configured</span>
                      </div>
                    </div>
                    <button className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700">
                      Optimize Database
                    </button>
                  </div>

                  <div className="p-6 border border-gray-200 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">API Optimization</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Response Caching</span>
                        <span className="text-sm text-green-600">✓ Enabled</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Gzip Compression</span>
                        <span className="text-sm text-green-600">✓ Active</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Rate Limiting</span>
                        <span className="text-sm text-green-600">✓ Configured</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Load Balancing</span>
                        <span className="text-sm text-green-600">✓ Active</span>
                      </div>
                    </div>
                    <button className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700">
                      Optimize APIs
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}