// Performance monitoring utilities
export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map();

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

  static trackWebVitals(): void {
    if (typeof window !== 'undefined') {
      // Track basic navigation timing
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          console.log('Page Load Metrics:', {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            totalTime: navigation.loadEventEnd - navigation.fetchStart,
          });
        }
      });
    }
  }
}

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  PerformanceMonitor.trackWebVitals();
}