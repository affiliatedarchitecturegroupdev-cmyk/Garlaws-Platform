'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

// Performance metrics interface
interface PerformanceMetrics {
  fps: number;
  frameDrops: number;
  memoryUsage: number;
  domNodes: number;
  jsHeapSize: number;
  networkRequests: number;
  loadTime: number;
  renderTime: number;
  bundleSize: number;
}

// Bundle analysis interface
interface BundleAnalysis {
  totalSize: number;
  chunks: Array<{
    name: string;
    size: number;
    modules: Array<{
      name: string;
      size: number;
    }>;
  }>;
  assets: Array<{
    name: string;
    size: number;
    type: string;
  }>;
}

// Performance monitoring hook
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameDrops: 0,
    memoryUsage: 0,
    domNodes: 0,
    jsHeapSize: 0,
    networkRequests: 0,
    loadTime: 0,
    renderTime: 0,
    bundleSize: 0,
  });

  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    if (!isMonitoring) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let frameDrops = 0;

    const measureFPS = () => {
      const now = performance.now();
      const delta = now - lastTime;

      if (delta >= 1000) {
        const fps = Math.round((frameCount * 1000) / delta);
        frameDrops = Math.max(0, 60 - fps);

        setMetrics(prev => ({
          ...prev,
          fps,
          frameDrops,
        }));

        frameCount = 0;
        lastTime = now;
      }

      frameCount++;
      if (isMonitoring) {
        requestAnimationFrame(measureFPS);
      }
    };

    // Memory usage
    const measureMemory = () => {
      if ('memory' in performance) {
        const mem = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          jsHeapSize: mem.usedJSHeapSize,
          memoryUsage: Math.round(mem.usedJSHeapSize / 1024 / 1024),
        }));
      }
    };

    // DOM nodes count
    const measureDOM = () => {
      const domNodes = document.getElementsByTagName('*').length;
      setMetrics(prev => ({
        ...prev,
        domNodes,
      }));
    };

    // Navigation timing
    const measureLoadTime = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        setMetrics(prev => ({
          ...prev,
          loadTime: navigation.loadEventEnd - navigation.fetchStart,
        }));
      }
    };

    // Start measurements
    measureFPS();
    measureMemory();
    measureDOM();
    measureLoadTime();

    // Set up intervals
    const memoryInterval = setInterval(measureMemory, 5000);
    const domInterval = setInterval(measureDOM, 10000);

    // Measure render time using Performance Observer
    const renderObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure' && entry.name.startsWith('render-')) {
          setMetrics(prev => ({
            ...prev,
            renderTime: entry.duration,
          }));
        }
      }
    });

    renderObserver.observe({ entryTypes: ['measure'] });

    // Network requests count
    const networkObserver = new PerformanceObserver((list) => {
      setMetrics(prev => ({
        ...prev,
        networkRequests: list.getEntries().length,
      }));
    });

    networkObserver.observe({ entryTypes: ['resource'] });

    return () => {
      setIsMonitoring(false);
      clearInterval(memoryInterval);
      clearInterval(domInterval);
      renderObserver.disconnect();
      networkObserver.disconnect();
    };
  }, [isMonitoring]);

  const startMonitoring = useCallback(() => setIsMonitoring(true), []);
  const stopMonitoring = useCallback(() => setIsMonitoring(false), []);

  const measureRenderTime = useCallback((componentName: string) => {
    const startMark = `${componentName}-render-start`;
    const endMark = `${componentName}-render-end`;
    const measureName = `render-${componentName}`;

    performance.mark(startMark);
    return () => {
      performance.mark(endMark);
      performance.measure(measureName, startMark, endMark);
    };
  }, []);

  return {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    measureRenderTime,
  };
}

// Bundle analysis component
interface BundleAnalyzerProps {
  className?: string;
  showDetails?: boolean;
}

const BundleAnalyzer: React.FC<BundleAnalyzerProps> = ({
  className,
  showDetails = true,
}) => {
  const [bundleData, setBundleData] = useState<BundleAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const analyzeBundle = useCallback(async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would fetch bundle analysis data
      // For now, we'll simulate the data
      const mockData: BundleAnalysis = {
        totalSize: 2450000, // 2.45MB
        chunks: [
          {
            name: 'main',
            size: 1200000,
            modules: [
              { name: 'react', size: 150000 },
              { name: 'next', size: 200000 },
              { name: 'dashboard', size: 350000 },
            ],
          },
          {
            name: 'vendor',
            size: 850000,
            modules: [
              { name: 'lodash', size: 100000 },
              { name: 'axios', size: 80000 },
              { name: 'recharts', size: 120000 },
            ],
          },
        ],
        assets: [
          { name: 'main.js', size: 1200000, type: 'javascript' },
          { name: 'vendor.js', size: 850000, type: 'javascript' },
          { name: 'styles.css', size: 400000, type: 'stylesheet' },
        ],
      };

      setBundleData(mockData);
    } catch (error) {
      console.error('Failed to analyze bundle:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    analyzeBundle();
  }, [analyzeBundle]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getSizeColor = (size: number, maxSize: number) => {
    const percentage = (size / maxSize) * 100;
    if (percentage > 80) return 'text-red-600';
    if (percentage > 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (isLoading) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className="h-32 bg-muted rounded"></div>
      </div>
    );
  }

  if (!bundleData) {
    return (
      <div className={cn('text-center py-8', className)}>
        <p className="text-muted-foreground">Failed to load bundle analysis</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="text-2xl font-bold text-primary">
            {formatBytes(bundleData.totalSize)}
          </div>
          <div className="text-sm text-muted-foreground">Total Bundle Size</div>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="text-2xl font-bold text-blue-600">
            {bundleData.chunks.length}
          </div>
          <div className="text-sm text-muted-foreground">Code Chunks</div>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="text-2xl font-bold text-green-600">
            {bundleData.assets.length}
          </div>
          <div className="text-sm text-muted-foreground">Assets</div>
        </div>
      </div>

      {/* Chunks Analysis */}
      {showDetails && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Bundle Chunks</h3>

          <div className="space-y-3">
            {bundleData.chunks.map((chunk, index) => (
              <div key={index} className="bg-card p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{chunk.name}</h4>
                  <span className={cn(
                    'font-medium',
                    getSizeColor(chunk.size, bundleData.totalSize)
                  )}>
                    {formatBytes(chunk.size)}
                  </span>
                </div>

                <div className="w-full bg-muted rounded-full h-2 mb-3">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(chunk.size / bundleData.totalSize) * 100}%` }}
                  />
                </div>

                <div className="text-sm text-muted-foreground">
                  {chunk.modules.length} modules
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assets Breakdown */}
      {showDetails && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Assets</h3>

          <div className="space-y-2">
            {bundleData.assets.map((asset, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="font-medium">{asset.name}</span>
                  <span className="text-xs text-muted-foreground uppercase">
                    {asset.type}
                  </span>
                </div>
                <span className="font-medium">
                  {formatBytes(asset.size)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Performance dashboard component
interface PerformanceDashboardProps {
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  className,
  autoRefresh = true,
  refreshInterval = 5000,
}) => {
  const {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
  } = usePerformanceMonitor();

  const [history, setHistory] = useState<PerformanceMetrics[]>([]);

  useEffect(() => {
    if (isMonitoring) {
      setHistory(prev => [...prev.slice(-19), metrics]); // Keep last 20 readings
    }
  }, [metrics, isMonitoring]);

  useEffect(() => {
    if (autoRefresh && !isMonitoring) {
      startMonitoring();
    }

    const interval = setInterval(() => {
      if (autoRefresh && isMonitoring) {
        // Force a re-measurement
        setHistory(prev => [...prev]);
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, isMonitoring, refreshInterval, startMonitoring]);

  const getStatusColor = (value: number, thresholds: { good: number; warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'text-red-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatBytes = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Performance Monitor</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            className={cn(
              'px-3 py-1 rounded text-sm font-medium',
              isMonitoring
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            )}
          >
            {isMonitoring ? 'Stop' : 'Start'} Monitoring
          </button>
        </div>
      </div>

      {/* Current Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-card p-4 rounded-lg border border-border text-center">
          <div className={cn(
            'text-2xl font-bold',
            getStatusColor(metrics.fps, { good: 50, warning: 30, critical: 15 })
          )}>
            {metrics.fps}
          </div>
          <div className="text-sm text-muted-foreground">FPS</div>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border text-center">
          <div className={cn(
            'text-2xl font-bold',
            getStatusColor(metrics.frameDrops, { good: 5, warning: 15, critical: 30 })
          )}>
            {metrics.frameDrops}
          </div>
          <div className="text-sm text-muted-foreground">Frame Drops</div>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border text-center">
          <div className={cn(
            'text-2xl font-bold',
            getStatusColor(metrics.memoryUsage, { good: 50, warning: 100, critical: 200 })
          )}>
            {metrics.memoryUsage}
          </div>
          <div className="text-sm text-muted-foreground">Memory (MB)</div>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border text-center">
          <div className="text-2xl font-bold text-blue-600">
            {metrics.domNodes.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">DOM Nodes</div>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border text-center">
          <div className="text-2xl font-bold text-purple-600">
            {metrics.networkRequests}
          </div>
          <div className="text-sm text-muted-foreground">Network Requests</div>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border text-center">
          <div className="text-2xl font-bold text-green-600">
            {metrics.loadTime.toFixed(0)}ms
          </div>
          <div className="text-sm text-muted-foreground">Load Time</div>
        </div>
      </div>

      {/* Performance History */}
      {history.length > 1 && (
        <div className="bg-card p-4 rounded-lg border border-border">
          <h3 className="text-lg font-semibold mb-4">Performance History</h3>
          <div className="h-32 flex items-end space-x-1">
            {history.slice(-20).map((metric, index) => (
              <div
                key={index}
                className="bg-primary rounded-t flex-1 transition-all duration-200"
                style={{
                  height: `${(metric.fps / 60) * 100}%`,
                  minHeight: '4px',
                }}
                title={`FPS: ${metric.fps}, Memory: ${metric.memoryUsage}MB`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>20 readings ago</span>
            <span>Now</span>
          </div>
        </div>
      )}

      {/* Bundle Analysis */}
      <div className="bg-card p-4 rounded-lg border border-border">
        <h3 className="text-lg font-semibold mb-4">Bundle Analysis</h3>
        <BundleAnalyzer />
      </div>
    </div>
  );
};

// Memory leak detector
export function useMemoryLeakDetector() {
  const [leaks, setLeaks] = useState<Array<{
    component: string;
    memoryIncrease: number;
    timestamp: number;
  }>>([]);

  const detectLeaks = useCallback((componentName: string) => {
    if ('memory' in performance) {
      const mem = (performance as any).memory;
      const currentUsage = mem.usedJSHeapSize;

      // Store previous measurement
      const prevUsage = sessionStorage.getItem(`memory-${componentName}`);
      if (prevUsage) {
        const increase = currentUsage - parseInt(prevUsage);
        if (increase > 1024 * 1024) { // 1MB increase
          setLeaks(prev => [...prev, {
            component: componentName,
            memoryIncrease: increase,
            timestamp: Date.now(),
          }]);
        }
      }

      sessionStorage.setItem(`memory-${componentName}`, currentUsage.toString());
    }
  }, []);

  return { leaks, detectLeaks };
}

// Performance budget checker
export function usePerformanceBudget() {
  const [budgetStatus, setBudgetStatus] = useState<{
    bundleSize: 'good' | 'warning' | 'critical';
    loadTime: 'good' | 'warning' | 'critical';
    memoryUsage: 'good' | 'warning' | 'critical';
  }>({
    bundleSize: 'good',
    loadTime: 'good',
    memoryUsage: 'good',
  });

  const checkBudget = useCallback((metrics: PerformanceMetrics) => {
    const newStatus = { ...budgetStatus };

    // Bundle size budget (5MB limit)
    if (metrics.bundleSize > 5 * 1024 * 1024) {
      newStatus.bundleSize = 'critical';
    } else if (metrics.bundleSize > 3 * 1024 * 1024) {
      newStatus.bundleSize = 'warning';
    } else {
      newStatus.bundleSize = 'good';
    }

    // Load time budget (3s limit)
    if (metrics.loadTime > 3000) {
      newStatus.loadTime = 'critical';
    } else if (metrics.loadTime > 2000) {
      newStatus.loadTime = 'warning';
    } else {
      newStatus.loadTime = 'good';
    }

    // Memory usage budget (200MB limit)
    if (metrics.memoryUsage > 200) {
      newStatus.memoryUsage = 'critical';
    } else if (metrics.memoryUsage > 100) {
      newStatus.memoryUsage = 'warning';
    } else {
      newStatus.memoryUsage = 'good';
    }

    setBudgetStatus(newStatus);
  }, [budgetStatus]);

  return { budgetStatus, checkBudget };
}

export {
  BundleAnalyzer,
  PerformanceDashboard,
};