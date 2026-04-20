'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift

  // Additional metrics
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
  domContentLoaded: number;
  loadComplete: number;

  // Resource metrics
  totalResources: number;
  cachedResources: number;
  failedResources: number;

  // Network metrics
  networkRequests: number;
  averageResponseTime: number;
  totalDataTransferred: number;

  // Device metrics
  deviceMemory?: number;
  hardwareConcurrency: number;
  connectionType?: string;
  effectiveType?: string;

  timestamp: string;
}

interface OptimizationRule {
  id: string;
  name: string;
  description: string;
  category: 'images' | 'bundle' | 'network' | 'rendering' | 'caching';
  enabled: boolean;
  impact: 'high' | 'medium' | 'low';
  status: 'active' | 'inactive' | 'error';
  lastApplied?: string;
  metrics: {
    before: number;
    after: number;
    improvement: number;
  };
}

interface LazyLoadConfig {
  enabled: boolean;
  rootMargin: string;
  threshold: number;
  placeholder: 'blur' | 'fade' | 'none';
}

interface ImageOptimization {
  enabled: boolean;
  formats: ('webp' | 'avif' | 'jpeg' | 'png')[];
  quality: number;
  sizes: string;
  lazyLoading: boolean;
  preloadCritical: boolean;
}

interface BundleOptimization {
  enabled: boolean;
  codeSplitting: boolean;
  treeShaking: boolean;
  compression: 'gzip' | 'brotli' | 'none';
  minification: boolean;
  sourceMaps: boolean;
}

interface NetworkOptimization {
  enabled: boolean;
  prefetching: boolean;
  preloading: boolean;
  serviceWorker: boolean;
  caching: {
    static: boolean;
    dynamic: boolean;
    api: boolean;
  };
  cdn: boolean;
}

interface RenderingOptimization {
  enabled: boolean;
  virtualScrolling: boolean;
  debouncedInputs: boolean;
  memoization: boolean;
  suspenseBoundaries: boolean;
}

interface MobilePerformanceOptimizationProps {
  tenantId?: string;
}

export default function MobilePerformanceOptimization({ tenantId = 'default' }: MobilePerformanceOptimizationProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [optimizationRules, setOptimizationRules] = useState<OptimizationRule[]>([]);
  const [lazyLoadConfig, setLazyLoadConfig] = useState<LazyLoadConfig>({
    enabled: true,
    rootMargin: '50px',
    threshold: 0.1,
    placeholder: 'blur'
  });
  const [imageOptimization, setImageOptimization] = useState<ImageOptimization>({
    enabled: true,
    formats: ['webp', 'avif', 'jpeg'],
    quality: 80,
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    lazyLoading: true,
    preloadCritical: true
  });
  const [bundleOptimization, setBundleOptimization] = useState<BundleOptimization>({
    enabled: true,
    codeSplitting: true,
    treeShaking: true,
    compression: 'gzip',
    minification: true,
    sourceMaps: false
  });
  const [networkOptimization, setNetworkOptimization] = useState<NetworkOptimization>({
    enabled: true,
    prefetching: true,
    preloading: true,
    serviceWorker: true,
    caching: {
      static: true,
      dynamic: true,
      api: true
    },
    cdn: true
  });
  const [renderingOptimization, setRenderingOptimization] = useState<RenderingOptimization>({
    enabled: true,
    virtualScrolling: true,
    debouncedInputs: true,
    memoization: true,
    suspenseBoundaries: true
  });

  const [activeTab, setActiveTab] = useState<'metrics' | 'images' | 'bundle' | 'network' | 'rendering'>('metrics');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const monitoringIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Performance monitoring functions
  const measureCoreWebVitals = useCallback(() => {
    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      setMetrics(prev => prev ? { ...prev, lcp: lastEntry.startTime } : null);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      setMetrics(prev => prev ? { ...prev, fid: lastEntry.processingStart - lastEntry.startTime } : null);
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    new PerformanceObserver((list) => {
      let clsValue = 0;
      const entries = list.getEntries() as any[];
      for (const entry of entries) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      setMetrics(prev => prev ? { ...prev, cls: clsValue } : null);
    }).observe({ entryTypes: ['layout-shift'] });
  }, []);

  const collectPerformanceMetrics = useCallback(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

    const metrics: PerformanceMetrics = {
      lcp: 0, // Will be set by observer
      fid: 0, // Will be set by observer
      cls: 0, // Will be set by observer
      fcp: 0,
      ttfb: navigation.responseStart - navigation.requestStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      totalResources: resources.length,
      cachedResources: resources.filter(r => r.transferSize === 0).length,
      failedResources: resources.filter(r => r.transferSize === 0 && r.decodedBodySize === 0).length,
      networkRequests: resources.length,
      averageResponseTime: resources.reduce((sum, r) => sum + (r.responseEnd - r.requestStart), 0) / resources.length || 0,
      totalDataTransferred: resources.reduce((sum, r) => sum + r.transferSize, 0),
      hardwareConcurrency: navigator.hardwareConcurrency || 1,
      timestamp: new Date().toISOString()
    };

    // Get First Contentful Paint
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint') as PerformanceEntry;
    if (fcpEntry) {
      metrics.fcp = fcpEntry.startTime;
    }

    // Get device memory if available
    if ('deviceMemory' in navigator) {
      metrics.deviceMemory = (navigator as any).deviceMemory;
    }

    // Get network information
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      metrics.connectionType = connection?.type;
      metrics.effectiveType = connection?.effectiveType;
    }

    setMetrics(metrics);
  }, []);

  const startMonitoring = () => {
    setIsMonitoring(true);
    measureCoreWebVitals();
    collectPerformanceMetrics();

    // Monitor continuously
    monitoringIntervalRef.current = setInterval(() => {
      collectPerformanceMetrics();
    }, 30000); // Update every 30 seconds
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
    }
  };

  const fetchOptimizationRules = useCallback(async () => {
    try {
      const response = await fetch(`/api/mobile?action=optimization-rules&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setOptimizationRules(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch optimization rules:', error);
    }
  }, [tenantId]);

  const updateOptimizationRule = async (ruleId: string, enabled: boolean) => {
    try {
      const response = await fetch('/api/mobile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-optimization-rule',
          tenantId,
          ruleId,
          enabled
        })
      });

      const data = await response.json();
      if (data.success) {
        setOptimizationRules(rules => rules.map(rule =>
          rule.id === ruleId ? { ...rule, enabled, lastApplied: new Date().toISOString() } : rule
        ));
      }
    } catch (error) {
      console.error('Failed to update optimization rule:', error);
    }
  };

  const runOptimizationAnalysis = async () => {
    try {
      const response = await fetch('/api/mobile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'run-optimization-analysis',
          tenantId
        })
      });

      const data = await response.json();
      if (data.success) {
        setOptimizationRules(data.rules);
        alert('Optimization analysis completed!');
      }
    } catch (error) {
      console.error('Failed to run optimization analysis:', error);
    }
  };

  const applyOptimizationSettings = async () => {
    try {
      const response = await fetch('/api/mobile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'apply-optimization-settings',
          tenantId,
          settings: {
            lazyLoad: lazyLoadConfig,
            images: imageOptimization,
            bundle: bundleOptimization,
            network: networkOptimization,
            rendering: renderingOptimization
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Optimization settings applied successfully!');
      }
    } catch (error) {
      console.error('Failed to apply optimization settings:', error);
    }
  };

  const getMetricColor = (value: number, good: number, poor: number) => {
    if (value <= good) return 'text-green-600';
    if (value <= poor) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    fetchOptimizationRules();
    // Start monitoring on component mount
    startMonitoring();

    return () => {
      stopMonitoring();
    };
  }, [fetchOptimizationRules]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Mobile Performance Optimization</h2>
        <div className="flex space-x-3">
          <button
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            className={`px-4 py-2 rounded-md transition-colors ${
              isMonitoring
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </button>
          <button
            onClick={runOptimizationAnalysis}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Analyze Performance
          </button>
          <button
            onClick={applyOptimizationSettings}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Apply Settings
          </button>
        </div>
      </div>

      {/* Core Web Vitals */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">LCP (Largest Contentful Paint)</span>
              <span className={`text-lg font-bold ${getMetricColor(metrics.lcp, 2500, 4000)}`}>
                {metrics.lcp.toFixed(0)}ms
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${metrics.lcp <= 2500 ? 'bg-green-500' : metrics.lcp <= 4000 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min((metrics.lcp / 4000) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">Target: &lt; 2.5s</div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">FID (First Input Delay)</span>
              <span className={`text-lg font-bold ${getMetricColor(metrics.fid, 100, 300)}`}>
                {metrics.fid.toFixed(0)}ms
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${metrics.fid <= 100 ? 'bg-green-500' : metrics.fid <= 300 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min((metrics.fid / 300) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">Target: &lt; 100ms</div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">CLS (Cumulative Layout Shift)</span>
              <span className={`text-lg font-bold ${getMetricColor(metrics.cls, 0.1, 0.25)}`}>
                {metrics.cls.toFixed(3)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${metrics.cls <= 0.1 ? 'bg-green-500' : metrics.cls <= 0.25 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min((metrics.cls / 0.25) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">Target: &lt; 0.1</div>
          </div>
        </div>
      )}

      {/* Detailed Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{metrics.fcp.toFixed(0)}ms</div>
            <div className="text-sm text-gray-600">First Contentful Paint</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{metrics.ttfb.toFixed(0)}ms</div>
            <div className="text-sm text-gray-600">Time to First Byte</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-purple-600">{(metrics.totalDataTransferred / 1024 / 1024).toFixed(2)}MB</div>
            <div className="text-sm text-gray-600">Data Transferred</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-orange-600">{metrics.hardwareConcurrency}</div>
            <div className="text-sm text-gray-600">CPU Cores</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'metrics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Performance Metrics
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'images'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Image Optimization
          </button>
          <button
            onClick={() => setActiveTab('bundle')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'bundle'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Bundle Optimization
          </button>
          <button
            onClick={() => setActiveTab('network')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'network'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Network Optimization
          </button>
          <button
            onClick={() => setActiveTab('rendering')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'rendering'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Rendering Optimization
          </button>
        </nav>
      </div>

      {/* Metrics Tab */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          {/* Resource Metrics */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Resource Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{metrics?.totalResources || 0}</div>
                <div className="text-sm text-gray-600">Total Resources</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{metrics?.cachedResources || 0}</div>
                <div className="text-sm text-gray-600">Cached Resources</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{metrics?.failedResources || 0}</div>
                <div className="text-sm text-gray-600">Failed Resources</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{metrics?.averageResponseTime.toFixed(0) || 0}ms</div>
                <div className="text-sm text-gray-600">Avg Response Time</div>
              </div>
            </div>
          </div>

          {/* Network Information */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Network Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Connection:</span>
                <div className="font-medium capitalize">{metrics?.connectionType || 'Unknown'}</div>
              </div>
              <div>
                <span className="text-gray-600">Effective Type:</span>
                <div className="font-medium uppercase">{metrics?.effectiveType || 'Unknown'}</div>
              </div>
              <div>
                <span className="text-gray-600">Device Memory:</span>
                <div className="font-medium">{metrics?.deviceMemory ? `${metrics.deviceMemory}GB` : 'Unknown'}</div>
              </div>
              <div>
                <span className="text-gray-600">CPU Cores:</span>
                <div className="font-medium">{metrics?.hardwareConcurrency || 'Unknown'}</div>
              </div>
            </div>
          </div>

          {/* Optimization Rules */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Optimization Rules ({optimizationRules.length})</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {optimizationRules.map((rule) => (
                <div key={rule.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getImpactColor(rule.impact)}`}>
                          {rule.impact} impact
                        </span>
                        <span className="text-sm font-medium text-gray-900">{rule.name}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Category: {rule.category}</span>
                        {rule.lastApplied && (
                          <span>Last applied: {new Date(rule.lastApplied).toLocaleString()}</span>
                        )}
                        {rule.metrics.improvement > 0 && (
                          <span className="text-green-600">
                            Improvement: {rule.metrics.improvement.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rule.enabled}
                          onChange={(e) => updateOptimizationRule(rule.id, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              ))}

              {optimizationRules.length === 0 && (
                <div className="p-8 text-center text-gray-400">
                  <div className="text-4xl mb-2">⚡</div>
                  <p>No optimization rules configured</p>
                  <p className="text-sm">Run performance analysis to generate optimization recommendations.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Optimization Tab */}
      {activeTab === 'images' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Image Optimization Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image Formats</label>
                <div className="space-y-2">
                  {['webp', 'avif', 'jpeg', 'png'].map(format => (
                    <label key={format} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={imageOptimization.formats.includes(format as any)}
                        onChange={(e) => {
                          const newFormats = e.target.checked
                            ? [...imageOptimization.formats, format as any]
                            : imageOptimization.formats.filter(f => f !== format);
                          setImageOptimization(prev => ({ ...prev, formats: newFormats }));
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm uppercase">{format}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quality</label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={imageOptimization.quality}
                  onChange={(e) => setImageOptimization(prev => ({ ...prev, quality: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <div className="text-sm text-gray-600 mt-1">{imageOptimization.quality}%</div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={imageOptimization.lazyLoading}
                  onChange={(e) => setImageOptimization(prev => ({ ...prev, lazyLoading: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm">Enable lazy loading</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={imageOptimization.preloadCritical}
                  onChange={(e) => setImageOptimization(prev => ({ ...prev, preloadCritical: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm">Preload critical images</span>
              </label>
            </div>
          </div>

          {/* Lazy Load Configuration */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Lazy Loading Configuration</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Root Margin</label>
                <input
                  type="text"
                  value={lazyLoadConfig.rootMargin}
                  onChange={(e) => setLazyLoadConfig(prev => ({ ...prev, rootMargin: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="50px"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Threshold</label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={lazyLoadConfig.threshold}
                  onChange={(e) => setLazyLoadConfig(prev => ({ ...prev, threshold: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Placeholder</label>
                <select
                  value={lazyLoadConfig.placeholder}
                  onChange={(e) => setLazyLoadConfig(prev => ({ ...prev, placeholder: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="blur">Blur</option>
                  <option value="fade">Fade</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bundle Optimization Tab */}
      {activeTab === 'bundle' && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Bundle Optimization Settings</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={bundleOptimization.codeSplitting}
                  onChange={(e) => setBundleOptimization(prev => ({ ...prev, codeSplitting: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm">Enable code splitting</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={bundleOptimization.treeShaking}
                  onChange={(e) => setBundleOptimization(prev => ({ ...prev, treeShaking: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm">Enable tree shaking</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={bundleOptimization.minification}
                  onChange={(e) => setBundleOptimization(prev => ({ ...prev, minification: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm">Enable minification</span>
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Compression</label>
                <select
                  value={bundleOptimization.compression}
                  onChange={(e) => setBundleOptimization(prev => ({ ...prev, compression: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="gzip">GZIP</option>
                  <option value="brotli">Brotli</option>
                  <option value="none">None</option>
                </select>
              </div>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={bundleOptimization.sourceMaps}
                  onChange={(e) => setBundleOptimization(prev => ({ ...prev, sourceMaps: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm">Generate source maps</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Network Optimization Tab */}
      {activeTab === 'network' && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Network Optimization Settings</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={networkOptimization.prefetching}
                  onChange={(e) => setNetworkOptimization(prev => ({ ...prev, prefetching: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm">Enable resource prefetching</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={networkOptimization.preloading}
                  onChange={(e) => setNetworkOptimization(prev => ({ ...prev, preloading: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm">Enable resource preloading</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={networkOptimization.serviceWorker}
                  onChange={(e) => setNetworkOptimization(prev => ({ ...prev, serviceWorker: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm">Enable service worker caching</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={networkOptimization.cdn}
                  onChange={(e) => setNetworkOptimization(prev => ({ ...prev, cdn: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm">Use CDN for static assets</span>
              </label>
            </div>

            <div>
              <h4 className="font-medium mb-3">Caching Strategy</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={networkOptimization.caching.static}
                    onChange={(e) => setNetworkOptimization(prev => ({
                      ...prev,
                      caching: { ...prev.caching, static: e.target.checked }
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm">Cache static resources</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={networkOptimization.caching.dynamic}
                    onChange={(e) => setNetworkOptimization(prev => ({
                      ...prev,
                      caching: { ...prev.caching, dynamic: e.target.checked }
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm">Cache dynamic content</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={networkOptimization.caching.api}
                    onChange={(e) => setNetworkOptimization(prev => ({
                      ...prev,
                      caching: { ...prev.caching, api: e.target.checked }
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm">Cache API responses</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rendering Optimization Tab */}
      {activeTab === 'rendering' && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Rendering Optimization Settings</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={renderingOptimization.virtualScrolling}
                  onChange={(e) => setRenderingOptimization(prev => ({ ...prev, virtualScrolling: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm">Enable virtual scrolling for large lists</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={renderingOptimization.debouncedInputs}
                  onChange={(e) => setRenderingOptimization(prev => ({ ...prev, debouncedInputs: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm">Debounce input handlers</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={renderingOptimization.memoization}
                  onChange={(e) => setRenderingOptimization(prev => ({ ...prev, memoization: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm">Use React.memo and useMemo for expensive operations</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={renderingOptimization.suspenseBoundaries}
                  onChange={(e) => setRenderingOptimization(prev => ({ ...prev, suspenseBoundaries: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm">Use Suspense boundaries for code splitting</span>
              </label>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Performance Recommendations</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Use React.lazy for code splitting</li>
                <li>• Implement virtual scrolling for large datasets</li>
                <li>• Debounce rapid user interactions</li>
                <li>• Memoize expensive calculations</li>
                <li>• Use CSS containment for complex layouts</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}