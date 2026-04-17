// Removed NextWebVitalsMetric import since we're using basic performance tracking

class MonitoringService {
  private metrics: Map<string, any[]> = new Map();
  private errors: Error[] = [];
  private maxStoredMetrics = 1000;
  private maxStoredErrors = 100;

  // Performance monitoring
  trackPerformanceMetric(name: string, value: number, additionalData?: any) {
    const metricData = {
      name,
      value,
      timestamp: Date.now(),
      pathname: typeof window !== 'undefined' ? window.location.pathname : '',
      ...additionalData,
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metrics = this.metrics.get(name)!;
    metrics.push(metricData);

    // Keep only recent metrics
    if (metrics.length > this.maxStoredMetrics) {
      metrics.shift();
    }

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService('performance_metric', metricData);
    }

    console.log(`Performance Metric ${name}:`, value);
  }

  // Error tracking
  trackError(error: Error, context?: any) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
      context,
    };

    this.errors.push(error);

    // Keep only recent errors
    if (this.errors.length > this.maxStoredErrors) {
      this.errors.shift();
    }

    // Send to error reporting service
    this.sendToErrorReporting(errorData);

    console.error('Tracked Error:', errorData);
  }

  // User interaction tracking
  trackEvent(eventName: string, properties?: Record<string, any>) {
    const eventData = {
      name: eventName,
      properties,
      timestamp: Date.now(),
      sessionId: this.getSessionId(),
      userId: this.getUserId(),
    };

    // Send to analytics service
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(eventData);
    }

    console.log('Tracked Event:', eventData);
  }

  // API monitoring
  trackApiCall(endpoint: string, method: string, duration: number, status: number) {
    const apiData = {
      endpoint,
      method,
      duration,
      status,
      timestamp: Date.now(),
    };

    // Send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService('api_call', apiData);
    }

    console.log(`API Call ${method} ${endpoint}:`, { duration, status });
  }

  // Page view tracking
  trackPageView(pathname: string) {
    this.trackEvent('page_view', { pathname });
  }

  // Get metrics for debugging
  getMetrics() {
    return Object.fromEntries(this.metrics);
  }

  getErrors() {
    return this.errors;
  }

  // Private methods
  private getSessionId(): string {
    if (typeof window === 'undefined') return '';

    let sessionId = localStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }

  private getUserId(): string | undefined {
    // Get from auth context or local storage
    if (typeof window === 'undefined') return undefined;

    return localStorage.getItem('user_id') || undefined;
  }

  private sendToMonitoringService(type: string, data: any) {
    // Send to your monitoring service (DataDog, New Relic, etc.)
    // Example: fetch('/api/monitoring', { method: 'POST', body: JSON.stringify({ type, data }) });
  }

  private sendToErrorReporting(errorData: any) {
    // Send to error reporting service (Sentry, Rollbar, etc.)
    // Example: Sentry.captureException(new Error(errorData.message), { extra: errorData });
  }

  private sendToAnalytics(eventData: any) {
    // Send to analytics service (Google Analytics, Mixpanel, etc.)
    // Example: gtag('event', eventData.name, eventData.properties);
  }
}

export const monitoringService = new MonitoringService();