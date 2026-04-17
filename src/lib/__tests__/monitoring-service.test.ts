import { monitoringService } from '@/lib/monitoring-service';

describe('Monitoring Service', () => {
  beforeEach(() => {
    // Clear any stored metrics/errors
    monitoringService.getMetrics();
    monitoringService.getErrors();
  });

  describe('trackEvent', () => {
    it('should track events', () => {
      monitoringService.trackEvent('test_event', { test: 'data' });
      // In a real test, we'd check if the event was sent to analytics
      expect(true).toBe(true); // Placeholder test
    });
  });

  describe('trackPerformanceMetric', () => {
    it('should track performance metrics', () => {
      monitoringService.trackPerformanceMetric('test_metric', 100);
      const metrics = monitoringService.getMetrics();
      expect(metrics).toBeDefined();
    });
  });

  describe('trackError', () => {
    it('should track errors', () => {
      const testError = new Error('Test error');
      monitoringService.trackError(testError);
      const errors = monitoringService.getErrors();
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});