// Performance monitoring utilities
import React from 'react';
import { logger, LogCategory } from './logger';

interface TraceSpan {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  parentId?: string;
  tags: Record<string, any>;
  children: TraceSpan[];
}

interface APMMetrics {
  traces: TraceSpan[];
  bottlenecks: Array<{
    operation: string;
    averageDuration: number;
    p95Duration: number;
    callCount: number;
    impact: 'high' | 'medium' | 'low';
  }>;
  throughput: Array<{
    timestamp: number;
    requestsPerSecond: number;
    errorRate: number;
  }>;
}

export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map();
  private static traces: TraceSpan[] = [];
  private static activeSpans: Map<string, TraceSpan> = new Map();
  private static apmMetrics: APMMetrics = {
    traces: [],
    bottlenecks: [],
    throughput: []
  };

  static startTiming(label: string): void {
    if (typeof window !== 'undefined') {
      performance.mark(`${label}-start`);
    }
  }

  static endTiming(label: string): number {
    if (typeof window !== 'undefined') {
      performance.mark(`${label}-end`);
      performance.measure(label, `${label}-start`, `${label}-end`);
      const measure = performance.getEntriesByName(label)[0];
      const duration = measure.duration;

      // Store metric
      if (!this.metrics.has(label)) {
        this.metrics.set(label, []);
      }
      this.metrics.get(label)!.push(duration);

      // Keep only last 100 measurements
      const measurements = this.metrics.get(label)!;
      if (measurements.length > 100) {
        measurements.shift();
      }

      // Log performance metric
      logger.logPerformanceMetric(label, duration, {
        average: this.getAverageTiming(label),
        count: measurements.length
      });

      return duration;
    }
    return 0;
  }

  static getAverageTiming(label: string): number {
    const measurements = this.metrics.get(label);
    if (!measurements || measurements.length === 0) return 0;

    return measurements.reduce((sum, time) => sum + time, 0) / measurements.length;
  }

  static getMetrics(): Record<string, { average: number; count: number; latest: number }> {
    const result: Record<string, { average: number; count: number; latest: number }> = {};

    for (const [label, measurements] of this.metrics.entries()) {
      result[label] = {
        average: this.getAverageTiming(label),
        count: measurements.length,
        latest: measurements[measurements.length - 1] || 0
      };
    }

    return result;
  }

  // APM Tracing Methods
  static startTrace(operation: string, parentId?: string, tags: Record<string, any> = {}): string {
    const spanId = `span_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const span: TraceSpan = {
      id: spanId,
      name: operation,
      startTime: performance.now(),
      parentId,
      tags,
      children: []
    };

    this.activeSpans.set(spanId, span);

    if (parentId && this.activeSpans.has(parentId)) {
      const parentSpan = this.activeSpans.get(parentId)!;
      parentSpan.children.push(span);
    }

    return spanId;
  }

  static endTrace(spanId: string): void {
    const span = this.activeSpans.get(spanId);
    if (!span) return;

    span.endTime = performance.now();
    span.duration = span.endTime - span.startTime;

    // Move to completed traces
    this.traces.push(span);
    this.activeSpans.delete(spanId);

    // Keep only recent traces
    if (this.traces.length > 1000) {
      this.traces.shift();
    }

    // Log performance metric
    logger.logPerformanceMetric(span.name, span.duration, {
      spanId,
      tags: span.tags,
      traceId: span.parentId || spanId
    });

    // Analyze for bottlenecks
    this.analyzeBottlenecks();
  }

  static getTraces(filter?: { operation?: string; duration?: { min: number; max: number } }): TraceSpan[] {
    let filteredTraces = this.traces;

    if (filter) {
      if (filter.operation) {
        filteredTraces = filteredTraces.filter(t => t.name.includes(filter.operation!));
      }
      if (filter.duration) {
        filteredTraces = filteredTraces.filter(t =>
          t.duration! >= filter.duration!.min && t.duration! <= filter.duration!.max
        );
      }
    }

    return filteredTraces.slice(-50); // Return last 50 traces
  }

  private static analyzeBottlenecks(): void {
    const operationStats = new Map<string, { durations: number[]; count: number }>();

    // Group traces by operation
    this.traces.forEach(trace => {
      if (!operationStats.has(trace.name)) {
        operationStats.set(trace.name, { durations: [], count: 0 });
      }
      const stats = operationStats.get(trace.name)!;
      if (trace.duration) {
        stats.durations.push(trace.duration);
        stats.count++;
      }
    });

    // Calculate bottlenecks
    const bottlenecks = Array.from(operationStats.entries())
      .filter(([_, stats]) => stats.count >= 5) // Only consider operations with enough samples
      .map(([operation, stats]) => {
        const sortedDurations = stats.durations.sort((a, b) => a - b);
        const p95Index = Math.floor(sortedDurations.length * 0.95);
        const p95Duration = sortedDurations[p95Index];
        const averageDuration = stats.durations.reduce((sum, d) => sum + d, 0) / stats.durations.length;

        // Determine impact level
        let impact: 'high' | 'medium' | 'low' = 'low';
        if (p95Duration > 5000) impact = 'high'; // > 5 seconds
        else if (p95Duration > 1000) impact = 'medium'; // > 1 second

        return {
          operation,
          averageDuration,
          p95Duration,
          callCount: stats.count,
          impact
        };
      })
      .sort((a, b) => b.p95Duration - a.p95Duration)
      .slice(0, 10); // Top 10 bottlenecks

    this.apmMetrics.bottlenecks = bottlenecks;
  }

  static getBottlenecks(): APMMetrics['bottlenecks'] {
    return [...this.apmMetrics.bottlenecks];
  }

  static getAPMMetrics(): APMMetrics {
    return {
      traces: this.getTraces(),
      bottlenecks: this.getBottlenecks(),
      throughput: this.apmMetrics.throughput
    };
  }

  static recordThroughput(requestsPerSecond: number, errorRate: number): void {
    this.apmMetrics.throughput.push({
      timestamp: Date.now(),
      requestsPerSecond,
      errorRate
    });

    // Keep only last 100 throughput measurements
    if (this.apmMetrics.throughput.length > 100) {
      this.apmMetrics.throughput.shift();
    }
  }

  // React Hook for APM
  static useAPM() {
    const [metrics, setMetrics] = React.useState(this.getAPMMetrics());

    React.useEffect(() => {
      const interval = setInterval(() => {
        setMetrics(this.getAPMMetrics());
      }, 5000); // Update every 5 seconds

      return () => clearInterval(interval);
    }, []);

    const startTrace = React.useCallback((operation: string, tags?: Record<string, any>) => {
      return this.startTrace(operation, undefined, tags);
    }, []);

    const endTrace = React.useCallback((spanId: string) => {
      this.endTrace(spanId);
    }, []);

    return {
      metrics,
      startTrace,
      endTrace,
      traces: metrics.traces,
      bottlenecks: metrics.bottlenecks,
      throughput: metrics.throughput
    };
  }

  static trackWebVitals(): void {
    if (typeof window !== 'undefined') {
      // Track basic navigation timing
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          const metrics = {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            totalTime: navigation.loadEventEnd - navigation.fetchStart,
          };

          logger.logPerformanceMetric('page_load', metrics.totalTime, metrics);
        }
      });
    }
  }
}

// React Hook for APM
export const useAPM = () => {
  const [metrics, setMetrics] = React.useState(PerformanceMonitor.getAPMMetrics());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(PerformanceMonitor.getAPMMetrics());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const startTrace = React.useCallback((operation: string, tags?: Record<string, any>) => {
    return PerformanceMonitor.startTrace(operation, undefined, tags);
  }, []);

  const endTrace = React.useCallback((spanId: string) => {
    PerformanceMonitor.endTrace(spanId);
  }, []);

  return {
    metrics,
    startTrace,
    endTrace,
    traces: metrics.traces,
    bottlenecks: metrics.bottlenecks,
    throughput: metrics.throughput
  };
};

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  PerformanceMonitor.trackWebVitals();
}