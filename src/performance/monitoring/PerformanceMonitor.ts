import { NextRequest, NextResponse } from 'next/server';

// Performance Monitoring and APM System
export class PerformanceMonitor {
  private static readonly PERFORMANCE_THRESHOLDS = {
    apiResponseTime: 500,      // 500ms
    pageLoadTime: 2000,        // 2 seconds
    databaseQueryTime: 100,    // 100ms
    cacheHitRatio: 0.8,        // 80%
    errorRate: 0.01,           // 1%
    cpuUsage: 70,              // 70%
    memoryUsage: 80,           // 80%
    concurrentUsers: 10000,    // 10k users
  };

  private static metrics: PerformanceMetrics = {
    responseTimes: [],
    errorRates: [],
    throughput: [],
    resourceUsage: [],
    cachePerformance: [],
    databasePerformance: [],
    userExperience: [],
    timestamp: new Date().toISOString(),
  };

  private static alerts: PerformanceAlert[] = [];
  private static isInitialized = false;

  // Initialize performance monitoring
  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Set up metrics collection
      await this.setupMetricsCollection();

      // Initialize APM tracing
      await this.initializeTracing();

      // Set up automated testing
      await this.setupAutomatedTesting();

      // Start performance monitoring
      this.startMonitoring();

      this.isInitialized = true;
      console.log('Performance monitoring initialized successfully');
    } catch (error) {
      console.error('Performance monitoring initialization failed:', error);
      throw error;
    }
  }

  // Real-time performance tracking
  static async trackRequest(request: NextRequest, response: NextResponse, startTime: number): Promise<void> {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    const statusCode = response.status;
    const url = request.nextUrl.pathname;
    const method = request.method;

    // Track response time
    this.metrics.responseTimes.push({
      timestamp: endTime,
      value: responseTime,
      url,
      method,
      statusCode,
    });

    // Track errors
    if (statusCode >= 400) {
      this.metrics.errorRates.push({
        timestamp: endTime,
        count: 1,
        url,
        statusCode,
      });
    }

    // Check performance thresholds
    await this.checkThresholds(responseTime, url, method);

    // Clean old metrics (keep last 24 hours)
    this.cleanupOldMetrics();
  }

  // Database performance tracking
  static async trackDatabaseQuery(query: string, executionTime: number, rowCount: number): Promise<void> {
    this.metrics.databasePerformance.push({
      timestamp: Date.now(),
      query: query.substring(0, 100), // Truncate for storage
      executionTime,
      rowCount,
    });

    // Alert on slow queries
    if (executionTime > this.PERFORMANCE_THRESHOLDS.databaseQueryTime) {
      await this.createAlert({
        type: 'database_performance',
        severity: 'medium',
        message: `Slow database query detected: ${executionTime}ms`,
        details: { query, executionTime, rowCount },
        timestamp: new Date(),
      });
    }
  }

  // Cache performance tracking
  static async trackCacheOperation(operation: 'hit' | 'miss', key: string, responseTime: number): Promise<void> {
    this.metrics.cachePerformance.push({
      timestamp: Date.now(),
      operation,
      key: key.substring(0, 50), // Truncate for storage
      responseTime,
    });
  }

  // Resource usage tracking
  static async trackResourceUsage(cpu: number, memory: number, disk: number): Promise<void> {
    this.metrics.resourceUsage.push({
      timestamp: Date.now(),
      cpu,
      memory,
      disk,
    });

    // Check resource thresholds
    if (cpu > this.PERFORMANCE_THRESHOLDS.cpuUsage) {
      await this.createAlert({
        type: 'resource_usage',
        severity: 'high',
        message: `High CPU usage detected: ${cpu}%`,
        details: { cpu, memory, disk },
        timestamp: new Date(),
      });
    }

    if (memory > this.PERFORMANCE_THRESHOLDS.memoryUsage) {
      await this.createAlert({
        type: 'resource_usage',
        severity: 'high',
        message: `High memory usage detected: ${memory}%`,
        details: { cpu, memory, disk },
        timestamp: new Date(),
      });
    }
  }

  // User experience tracking
  static async trackUserExperience(metric: string, value: number, userId?: string): Promise<void> {
    this.metrics.userExperience.push({
      timestamp: Date.now(),
      metric,
      value,
      userId,
    });
  }

  // Performance analysis and reporting
  static async generatePerformanceReport(): Promise<PerformanceReport> {
    const report: PerformanceReport = {
      summary: {
        averageResponseTime: this.calculateAverage(this.metrics.responseTimes.map(m => m.value)),
        errorRate: this.calculateErrorRate(),
        cacheHitRatio: this.calculateCacheHitRatio(),
        throughput: this.calculateThroughput(),
        resourceUtilization: this.calculateResourceUtilization(),
      },
      trends: {
        responseTimeTrend: this.calculateTrend(this.metrics.responseTimes.map(m => m.value)),
        errorRateTrend: this.calculateTrend(this.metrics.errorRates.map(m => m.count)),
        throughputTrend: this.calculateTrend(this.metrics.throughput.map(m => m.value)),
      },
      alerts: this.alerts.slice(-10), // Last 10 alerts
      recommendations: await this.generateRecommendations(),
      timestamp: new Date().toISOString(),
    };

    return report;
  }

  // Automated performance testing
  static async runPerformanceTest(testConfig: PerformanceTestConfig): Promise<PerformanceTestResult> {
    console.log(`Running performance test: ${testConfig.name}`);

    const result: PerformanceTestResult = {
      testName: testConfig.name,
      startTime: new Date(),
      endTime: new Date(),
      metrics: {
        responseTime: { min: 0, max: 0, avg: 0, p95: 0, p99: 0 },
        throughput: 0,
        errorRate: 0,
        concurrentUsers: testConfig.concurrentUsers,
      },
      passed: true,
      recommendations: [],
    };

    try {
      // Run load test
      const testResults = await this.executeLoadTest(testConfig);

      // Calculate metrics
      result.metrics = this.calculateTestMetrics(testResults);
      result.endTime = new Date();

      // Check against thresholds
      result.passed = this.validateTestResults(result.metrics, testConfig.thresholds);

      // Generate recommendations
      result.recommendations = this.generateTestRecommendations(result.metrics);

      console.log(`Performance test completed: ${result.passed ? 'PASSED' : 'FAILED'}`);
    } catch (error) {
      console.error(`Performance test failed:`, error);
      result.passed = false;
      result.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return result;
  }

  // Distributed tracing
  static async startTrace(operation: string, userId?: string): Promise<TraceContext> {
    const traceId = this.generateTraceId();
    const spanId = this.generateSpanId();

    const context: TraceContext = {
      traceId,
      spanId,
      operation,
      userId,
      startTime: Date.now(),
      tags: {},
      spans: [],
    };

    // Store trace context (in production, use distributed storage)
    this.activeTraces.set(traceId, context);

    return context;
  }

  static async endTrace(traceId: string): Promise<void> {
    const context = this.activeTraces.get(traceId);
    if (context) {
      context.endTime = Date.now();
      context.duration = context.endTime - context.startTime;

      // Store trace for analysis
      await this.storeTrace(context);

      // Clean up
      this.activeTraces.delete(traceId);
    }
  }

  static async addTraceSpan(traceId: string, span: TraceSpan): Promise<void> {
    const context = this.activeTraces.get(traceId);
    if (context) {
      context.spans.push(span);
    }
  }

  // Alert management
  private static async createAlert(alert: Omit<PerformanceAlert, 'id'>): Promise<void> {
    const newAlert: PerformanceAlert = {
      id: this.generateAlertId(),
      ...alert,
    };

    this.alerts.push(newAlert);

    // Send alert notification (in production, integrate with alerting system)
    console.warn(`🚨 Performance Alert: ${alert.message}`, alert.details);

    // Clean old alerts (keep last 1000)
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(-500);
    }
  }

  // Helper methods
  private static async setupMetricsCollection(): Promise<void> {
    // Set up periodic metrics collection
    setInterval(async () => {
      try {
        await this.collectSystemMetrics();
      } catch (error) {
        console.error('Metrics collection failed:', error);
      }
    }, 60000); // Every minute
  }

  private static async initializeTracing(): Promise<void> {
    // Initialize distributed tracing (in production, integrate with Jaeger, Zipkin, etc.)
    console.log('Distributed tracing initialized');
  }

  private static async setupAutomatedTesting(): Promise<void> {
    // Set up scheduled performance tests
    setInterval(async () => {
      try {
        await this.runScheduledTests();
      } catch (error) {
        console.error('Automated testing failed:', error);
      }
    }, 3600000); // Every hour
  }

  private static startMonitoring(): void {
    console.log('Performance monitoring started');
  }

  private static async checkThresholds(responseTime: number, url: string, method: string): Promise<void> {
    if (responseTime > this.PERFORMANCE_THRESHOLDS.apiResponseTime) {
      await this.createAlert({
        type: 'response_time',
        severity: responseTime > 2000 ? 'high' : 'medium',
        message: `Slow response time: ${responseTime}ms for ${method} ${url}`,
        details: { responseTime, url, method },
        timestamp: new Date(),
      });
    }
  }

  private static cleanupOldMetrics(): void {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago

    this.metrics.responseTimes = this.metrics.responseTimes.filter(m => m.timestamp > cutoffTime);
    this.metrics.errorRates = this.metrics.errorRates.filter(m => m.timestamp > cutoffTime);
    this.metrics.throughput = this.metrics.throughput.filter(m => m.timestamp > cutoffTime);
    this.metrics.resourceUsage = this.metrics.resourceUsage.filter(m => m.timestamp > cutoffTime);
    this.metrics.cachePerformance = this.metrics.cachePerformance.filter(m => m.timestamp > cutoffTime);
    this.metrics.databasePerformance = this.metrics.databasePerformance.filter(m => m.timestamp > cutoffTime);
    this.metrics.userExperience = this.metrics.userExperience.filter(m => m.timestamp > cutoffTime);
  }

  private static calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  private static calculateErrorRate(): number {
    const totalRequests = this.metrics.responseTimes.length;
    const errorRequests = this.metrics.errorRates.reduce((sum, error) => sum + error.count, 0);
    return totalRequests > 0 ? errorRequests / totalRequests : 0;
  }

  private static calculateCacheHitRatio(): number {
    const totalOperations = this.metrics.cachePerformance.length;
    const hits = this.metrics.cachePerformance.filter(m => m.operation === 'hit').length;
    return totalOperations > 0 ? hits / totalOperations : 0;
  }

  private static calculateThroughput(): number {
    // Calculate requests per second over the last minute
    const oneMinuteAgo = Date.now() - 60000;
    const recentRequests = this.metrics.responseTimes.filter(m => m.timestamp > oneMinuteAgo);
    return recentRequests.length / 60; // requests per second
  }

  private static calculateResourceUtilization(): { cpu: number; memory: number; disk: number } {
    if (this.metrics.resourceUsage.length === 0) {
      return { cpu: 0, memory: 0, disk: 0 };
    }

    const latest = this.metrics.resourceUsage[this.metrics.resourceUsage.length - 1];
    return {
      cpu: latest.cpu,
      memory: latest.memory,
      disk: latest.disk,
    };
  }

  private static calculateTrend(values: number[]): 'improving' | 'degrading' | 'stable' {
    if (values.length < 10) return 'stable';

    const recent = values.slice(-5);
    const previous = values.slice(-10, -5);

    const recentAvg = this.calculateAverage(recent);
    const previousAvg = this.calculateAverage(previous);

    const changePercent = ((recentAvg - previousAvg) / previousAvg) * 100;

    if (changePercent > 5) return 'degrading';
    if (changePercent < -5) return 'improving';
    return 'stable';
  }

  private static async generateRecommendations(): Promise<string[]> {
    const recommendations: string[] = [];
    const report = await this.generatePerformanceReport();

    if (report.summary.averageResponseTime > this.PERFORMANCE_THRESHOLDS.apiResponseTime) {
      recommendations.push('Consider implementing caching for frequently accessed endpoints');
      recommendations.push('Review database query optimization and add appropriate indexes');
    }

    if (report.summary.cacheHitRatio < this.PERFORMANCE_THRESHOLDS.cacheHitRatio) {
      recommendations.push('Improve cache hit ratio by adjusting cache TTL and invalidation strategies');
    }

    if (report.summary.errorRate > this.PERFORMANCE_THRESHOLDS.errorRate) {
      recommendations.push('Investigate and fix high error rates to improve user experience');
    }

    return recommendations;
  }

  private static async executeLoadTest(config: PerformanceTestConfig): Promise<TestResult[]> {
    // Simplified load testing implementation
    const results: TestResult[] = [];

    for (let i = 0; i < config.duration; i += 1000) {
      // Simulate concurrent requests
      const batchResults = await Promise.all(
        Array.from({ length: config.concurrentUsers }, async (_, index) => {
          const startTime = Date.now();
          try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
            const responseTime = Date.now() - startTime;
            return { responseTime, success: true };
          } catch (error) {
            const responseTime = Date.now() - startTime;
            return { responseTime, success: false };
          }
        })
      );

      results.push(...batchResults);
    }

    return results;
  }

  private static calculateTestMetrics(results: TestResult[]): TestMetrics {
    const responseTimes = results.map(r => r.responseTime).sort((a, b) => a - b);
    const successfulRequests = results.filter(r => r.success).length;
    const totalRequests = results.length;

    return {
      responseTime: {
        min: Math.min(...responseTimes),
        max: Math.max(...responseTimes),
        avg: this.calculateAverage(responseTimes),
        p95: responseTimes[Math.floor(responseTimes.length * 0.95)],
        p99: responseTimes[Math.floor(responseTimes.length * 0.99)],
      },
      throughput: totalRequests / (results.length > 0 ? results[0].responseTime / 1000 : 1),
      errorRate: 1 - (successfulRequests / totalRequests),
      concurrentUsers: 0, // Would be set from config
    };
  }

  private static validateTestResults(metrics: TestMetrics, thresholds: PerformanceThresholds): boolean {
    return (
      metrics.responseTime.p95 <= thresholds.responseTime &&
      metrics.throughput >= thresholds.throughput &&
      metrics.errorRate <= thresholds.errorRate
    );
  }

  private static generateTestRecommendations(metrics: TestMetrics): string[] {
    const recommendations: string[] = [];

    if (metrics.responseTime.p95 > 1000) {
      recommendations.push('Consider optimizing database queries and adding caching layers');
    }

    if (metrics.errorRate > 0.05) {
      recommendations.push('Investigate error causes and improve error handling');
    }

    if (metrics.throughput < 100) {
      recommendations.push('Consider horizontal scaling or performance optimizations');
    }

    return recommendations;
  }

  private static async collectSystemMetrics(): Promise<void> {
    // In production, collect actual system metrics
    // For demo, generate mock data
    const cpu = Math.random() * 100;
    const memory = Math.random() * 100;
    const disk = Math.random() * 100;

    await this.trackResourceUsage(cpu, memory, disk);
  }

  private static async runScheduledTests(): Promise<void> {
    // Run automated performance tests
    console.log('Running scheduled performance tests');
  }

  private static async storeTrace(context: TraceContext): Promise<void> {
    // Store trace data for analysis (in production, use dedicated storage)
    console.log(`Trace stored: ${context.traceId}, duration: ${context.duration}ms`);
  }

  // ID generation
  private static generateTraceId(): string {
    return `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private static generateSpanId(): string {
    return `span-${Math.random().toString(36).substr(2, 9)}`;
  }

  private static generateAlertId(): string {
    return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private static activeTraces = new Map<string, TraceContext>();
}

// Interface definitions
interface PerformanceMetrics {
  responseTimes: Array<{ timestamp: number; value: number; url: string; method: string; statusCode: number }>;
  errorRates: Array<{ timestamp: number; count: number; url: string; statusCode: number }>;
  throughput: Array<{ timestamp: number; value: number }>;
  resourceUsage: Array<{ timestamp: number; cpu: number; memory: number; disk: number }>;
  cachePerformance: Array<{ timestamp: number; operation: 'hit' | 'miss'; key: string; responseTime: number }>;
  databasePerformance: Array<{ timestamp: number; query: string; executionTime: number; rowCount: number }>;
  userExperience: Array<{ timestamp: number; metric: string; value: number; userId?: string }>;
  timestamp: string;
}

interface PerformanceAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details: Record<string, any>;
  timestamp: Date;
}

interface PerformanceReport {
  summary: {
    averageResponseTime: number;
    errorRate: number;
    cacheHitRatio: number;
    throughput: number;
    resourceUtilization: { cpu: number; memory: number; disk: number };
  };
  trends: {
    responseTimeTrend: 'improving' | 'degrading' | 'stable';
    errorRateTrend: 'improving' | 'degrading' | 'stable';
    throughputTrend: 'improving' | 'degrading' | 'stable';
  };
  alerts: PerformanceAlert[];
  recommendations: string[];
  timestamp: string;
}

interface PerformanceTestConfig {
  name: string;
  duration: number; // in milliseconds
  concurrentUsers: number;
  endpoints: string[];
  thresholds: PerformanceThresholds;
}

interface PerformanceThresholds {
  responseTime: number;
  throughput: number;
  errorRate: number;
}

interface PerformanceTestResult {
  testName: string;
  startTime: Date;
  endTime: Date;
  metrics: TestMetrics;
  passed: boolean;
  recommendations: string[];
  error?: string;
}

interface TestMetrics {
  responseTime: {
    min: number;
    max: number;
    avg: number;
    p95: number;
    p99: number;
  };
  throughput: number;
  errorRate: number;
  concurrentUsers: number;
}

interface TestResult {
  responseTime: number;
  success: boolean;
}

interface TraceContext {
  traceId: string;
  spanId: string;
  operation: string;
  userId?: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  tags: Record<string, any>;
  spans: TraceSpan[];
}

interface TraceSpan {
  spanId: string;
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  tags: Record<string, any>;
}

export default PerformanceMonitor;