import { useState, useEffect, useCallback, useRef } from 'react';

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface MemoryUsage {
  heapUsed: number;
  heapTotal: number;
  heapLimit: number;
  external: number;
  rss?: number;
}

export function useMemoryManagement() {
  const [memoryInfo, setMemoryInfo] = useState<MemoryUsage | null>(null);
  const [isLowMemory, setIsLowMemory] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getMemoryUsage = useCallback((): MemoryUsage | null => {
    if (typeof window === 'undefined') return null;

    // Chrome/Edge performance.memory API
    if ('memory' in performance) {
      const mem = (performance as any).memory;
      return {
        heapUsed: mem.usedJSHeapSize,
        heapTotal: mem.totalJSHeapSize,
        heapLimit: mem.jsHeapSizeLimit,
        external: mem.external || 0,
      };
    }

    // Node.js process.memoryUsage() (for SSR/server components)
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const mem = process.memoryUsage();
      return {
        heapUsed: mem.heapUsed,
        heapTotal: mem.heapTotal,
        heapLimit: 0, // Not available in Node.js
        external: mem.external,
        rss: mem.rss,
      };
    }

    return null;
  }, []);

  const updateMemoryInfo = useCallback(() => {
    const info = getMemoryUsage();
    if (info) {
      setMemoryInfo(info);
      // Consider low memory if heap usage > 80% of limit
      const usageRatio = info.heapLimit > 0 ? info.heapUsed / info.heapLimit : 0;
      setIsLowMemory(usageRatio > 0.8);
    }
  }, [getMemoryUsage]);

  const startMonitoring = useCallback((intervalMs: number = 10000) => {
    updateMemoryInfo();
    intervalRef.current = setInterval(updateMemoryInfo, intervalMs);
  }, [updateMemoryInfo]);

  const stopMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const forceGarbageCollection = useCallback(() => {
    if (typeof window !== 'undefined' && 'gc' in window) {
      (window as any).gc();
      // Update memory info after GC
      setTimeout(updateMemoryInfo, 100);
    }
  }, [updateMemoryInfo]);

  const formatBytes = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  useEffect(() => {
    // Auto-start monitoring in development
    if (process.env.NODE_ENV === 'development') {
      startMonitoring();
    }

    return stopMonitoring;
  }, [startMonitoring, stopMonitoring]);

  return {
    memoryInfo,
    isLowMemory,
    startMonitoring,
    stopMonitoring,
    forceGarbageCollection,
    formatBytes,
    updateMemoryInfo,
  };
}