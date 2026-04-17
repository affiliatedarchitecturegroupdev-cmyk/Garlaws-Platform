"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { monitoringService } from '@/lib/monitoring-service';

export function WebVitalsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Track page views
    monitoringService.trackPageView(pathname);
  }, [pathname]);

  useEffect(() => {
    // Basic performance tracking
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Track page load time
      window.addEventListener('load', () => {
        const loadTime = performance.now();
        monitoringService.trackPerformanceMetric('page_load_time', loadTime);
      });

      // Track navigation timing
      if ('getEntriesByType' in performance) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          monitoringService.trackPerformanceMetric('dom_content_loaded',
            navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
          monitoringService.trackPerformanceMetric('load_complete',
            navigation.loadEventEnd - navigation.loadEventStart);
        }
      }
    }
  }, []);

  // Global error handler
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      monitoringService.trackError(event.error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      monitoringService.trackError(new Error(event.reason), {
        type: 'unhandledrejection',
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
}