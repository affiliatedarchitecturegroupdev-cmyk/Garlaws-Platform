'use client';

import React, { useState, useEffect } from 'react';
import { Globe, Server, Zap, Clock, Shield, BarChart3, Settings, RefreshCw } from 'lucide-react';

export interface CDNEndpoint {
  id: string;
  region: string;
  location: string;
  status: 'active' | 'maintenance' | 'offline';
  latency: number; // in ms
  uptime: number; // percentage
  requests: number;
  bandwidth: number; // in GB
  cacheHitRate: number; // percentage
}

export interface EdgeFunction {
  id: string;
  name: string;
  runtime: 'nodejs' | 'python' | 'rust';
  status: 'deployed' | 'deploying' | 'failed';
  invocations: number;
  avgExecutionTime: number; // in ms
  lastDeployed: Date;
  regions: string[];
}

export interface CDNConfig {
  cacheTTL: number;
  compressionEnabled: boolean;
  edgeFunctionsEnabled: boolean;
  geoRoutingEnabled: boolean;
  securityHeadersEnabled: boolean;
  imageOptimizationEnabled: boolean;
}

const CDN_ENDPOINTS: CDNEndpoint[] = [
  { id: 'us-east-1', region: 'US East', location: 'Virginia, USA', status: 'active', latency: 12, uptime: 99.9, requests: 1250000, bandwidth: 450, cacheHitRate: 87 },
  { id: 'eu-west-1', region: 'EU West', location: 'Ireland', status: 'active', latency: 18, uptime: 99.8, requests: 980000, bandwidth: 320, cacheHitRate: 92 },
  { id: 'ap-southeast-1', region: 'Asia Pacific', location: 'Singapore', status: 'active', latency: 45, uptime: 99.7, requests: 750000, bandwidth: 280, cacheHitRate: 89 },
  { id: 'sa-east-1', region: 'South America', location: 'São Paulo, Brazil', status: 'maintenance', latency: 120, uptime: 98.5, requests: 320000, bandwidth: 95, cacheHitRate: 78 },
  { id: 'af-south-1', region: 'Africa', location: 'Cape Town, South Africa', status: 'active', latency: 95, uptime: 99.6, requests: 180000, bandwidth: 65, cacheHitRate: 85 },
];

const EDGE_FUNCTIONS: EdgeFunction[] = [
  {
    id: 'auth-middleware',
    name: 'Authentication Middleware',
    runtime: 'nodejs',
    status: 'deployed',
    invocations: 2450000,
    avgExecutionTime: 8,
    lastDeployed: new Date('2024-04-20'),
    regions: ['us-east-1', 'eu-west-1', 'ap-southeast-1']
  },
  {
    id: 'geo-redirect',
    name: 'Geographic Redirect',
    runtime: 'nodejs',
    status: 'deployed',
    invocations: 890000,
    avgExecutionTime: 5,
    lastDeployed: new Date('2024-04-19'),
    regions: ['us-east-1', 'eu-west-1', 'ap-southeast-1', 'sa-east-1']
  },
  {
    id: 'image-optimizer',
    name: 'Image Optimization',
    runtime: 'rust',
    status: 'deploying',
    invocations: 0,
    avgExecutionTime: 0,
    lastDeployed: new Date(),
    regions: ['us-east-1', 'eu-west-1']
  },
  {
    id: 'rate-limiter',
    name: 'Rate Limiter',
    runtime: 'nodejs',
    status: 'deployed',
    invocations: 1560000,
    avgExecutionTime: 3,
    lastDeployed: new Date('2024-04-18'),
    regions: ['us-east-1', 'eu-west-1', 'ap-southeast-1', 'sa-east-1', 'af-south-1']
  },
];

export const GlobalCDN: React.FC = () => {
  const [endpoints, setEndpoints] = useState<CDNEndpoint[]>(CDN_ENDPOINTS);
  const [edgeFunctions, setEdgeFunctions] = useState<EdgeFunction[]>(EDGE_FUNCTIONS);
  const [config, setConfig] = useState<CDNConfig>({
    cacheTTL: 3600,
    compressionEnabled: true,
    edgeFunctionsEnabled: true,
    geoRoutingEnabled: true,
    securityHeadersEnabled: true,
    imageOptimizationEnabled: true,
  });
  const [selectedTab, setSelectedTab] = useState<'endpoints' | 'functions' | 'config'>('endpoints');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'deployed':
        return 'text-green-600 bg-green-100';
      case 'maintenance':
      case 'deploying':
        return 'text-yellow-600 bg-yellow-100';
      case 'offline':
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'deployed':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      case 'maintenance':
      case 'deploying':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>;
      case 'offline':
      case 'failed':
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>;
    }
  };

  const purgeCache = async (endpointId?: string) => {
    // Simulate cache purge
    console.log(`Purging cache for ${endpointId || 'all endpoints'}`);
    // In real implementation, this would call the CDN API
  };

  const deployEdgeFunction = async (functionId: string) => {
    setEdgeFunctions(prev => prev.map(fn =>
      fn.id === functionId
        ? { ...fn, status: 'deploying' as const }
        : fn
    ));

    // Simulate deployment
    setTimeout(() => {
      setEdgeFunctions(prev => prev.map(fn =>
        fn.id === functionId
          ? { ...fn, status: 'deployed' as const, lastDeployed: new Date() }
          : fn
      ));
    }, 3000);
  };

  const totalRequests = endpoints.reduce((sum, ep) => sum + ep.requests, 0);
  const totalBandwidth = endpoints.reduce((sum, ep) => sum + ep.bandwidth, 0);
  const avgCacheHitRate = endpoints.reduce((sum, ep) => sum + ep.cacheHitRate, 0) / endpoints.length;
  const avgUptime = endpoints.reduce((sum, ep) => sum + ep.uptime, 0) / endpoints.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Globe className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Global CDN Management</h1>
              <p className="text-gray-600">Content delivery optimization with edge computing</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => purgeCache()}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Purge All Cache</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{(totalRequests / 1000000).toFixed(1)}M</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bandwidth</p>
              <p className="text-2xl font-bold text-gray-900">{totalBandwidth.toFixed(0)} GB</p>
            </div>
            <Zap className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cache Hit Rate</p>
              <p className="text-2xl font-bold text-gray-900">{avgCacheHitRate.toFixed(1)}%</p>
            </div>
            <Server className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Uptime</p>
              <p className="text-2xl font-bold text-gray-900">{avgUptime.toFixed(2)}%</p>
            </div>
            <Shield className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setSelectedTab('endpoints')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedTab === 'endpoints'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              CDN Endpoints
            </button>
            <button
              onClick={() => setSelectedTab('functions')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedTab === 'functions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Edge Functions
            </button>
            <button
              onClick={() => setSelectedTab('config')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedTab === 'config'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Configuration
            </button>
          </nav>
        </div>

        <div className="p-6">
          {selectedTab === 'endpoints' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">CDN Endpoints</h3>
                <button
                  onClick={() => purgeCache()}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Refresh Data
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {endpoints.map((endpoint) => (
                  <div key={endpoint.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(endpoint.status)}
                        <span className="font-medium text-gray-900">{endpoint.region}</span>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(endpoint.status)}`}>
                        {endpoint.status}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span className="text-gray-900">{endpoint.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Latency:</span>
                        <span className="text-gray-900">{endpoint.latency}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Uptime:</span>
                        <span className="text-gray-900">{endpoint.uptime}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Requests:</span>
                        <span className="text-gray-900">{(endpoint.requests / 1000).toFixed(0)}K</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cache Hit Rate:</span>
                        <span className="text-gray-900">{endpoint.cacheHitRate}%</span>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => purgeCache(endpoint.id)}
                        className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                      >
                        Purge Cache
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'functions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Edge Functions</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Deploy New Function
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Function
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Runtime
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invocations
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Regions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {edgeFunctions.map((func) => (
                      <tr key={func.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{func.name}</div>
                            <div className="text-sm text-gray-500">ID: {func.id}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {func.runtime}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(func.status)}`}>
                            {getStatusIcon(func.status)}
                            <span className="ml-1 capitalize">{func.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {(func.invocations / 1000000).toFixed(1)}M
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {func.avgExecutionTime}ms
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {func.regions.length} regions
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {func.status === 'deployed' ? (
                            <button className="text-blue-600 hover:text-blue-900">
                              Redeploy
                            </button>
                          ) : func.status === 'failed' ? (
                            <button
                              onClick={() => deployEdgeFunction(func.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Retry
                            </button>
                          ) : (
                            <span className="text-gray-500">Deploying...</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedTab === 'config' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">CDN Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cache TTL (seconds)
                    </label>
                    <input
                      type="number"
                      value={config.cacheTTL}
                      onChange={(e) => setConfig(prev => ({ ...prev, cacheTTL: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="compression"
                      checked={config.compressionEnabled}
                      onChange={(e) => setConfig(prev => ({ ...prev, compressionEnabled: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="compression" className="ml-2 block text-sm text-gray-900">
                      Enable Compression
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="edgeFunctions"
                      checked={config.edgeFunctionsEnabled}
                      onChange={(e) => setConfig(prev => ({ ...prev, edgeFunctionsEnabled: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="edgeFunctions" className="ml-2 block text-sm text-gray-900">
                      Enable Edge Functions
                    </label>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="geoRouting"
                      checked={config.geoRoutingEnabled}
                      onChange={(e) => setConfig(prev => ({ ...prev, geoRoutingEnabled: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="geoRouting" className="ml-2 block text-sm text-gray-900">
                      Enable Geographic Routing
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="securityHeaders"
                      checked={config.securityHeadersEnabled}
                      onChange={(e) => setConfig(prev => ({ ...prev, securityHeadersEnabled: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="securityHeaders" className="ml-2 block text-sm text-gray-900">
                      Enable Security Headers
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="imageOptimization"
                      checked={config.imageOptimizationEnabled}
                      onChange={(e) => setConfig(prev => ({ ...prev, imageOptimizationEnabled: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="imageOptimization" className="ml-2 block text-sm text-gray-900">
                      Enable Image Optimization
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Save Configuration
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalCDN;