// Real-time Analytics Dashboard Engine

import {
  AnalyticsMetric,
  AnalyticsTimeSeries,
  DashboardWidget,
  AnalyticsDashboard,
  PredictiveInsight,
  AnalyticsEvent
} from './analytics-models';

export class RealtimeAnalyticsDashboard {
  private dashboards: Map<string, AnalyticsDashboard> = new Map();
  private metrics: Map<string, AnalyticsMetric> = new Map();
  private timeSeries: Map<string, AnalyticsTimeSeries> = new Map();
  private insights: PredictiveInsight[] = [];
  private events: AnalyticsEvent[] = [];

  private updateCallbacks: Map<string, Set<(data: any) => void>> = new Map();
  private refreshIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.initializeDefaultDashboards();
    this.startDataCollection();
  }

  private initializeDefaultDashboards() {
    // Executive Dashboard
    const executiveDashboard: AnalyticsDashboard = {
      id: 'executive-overview',
      name: 'Executive Overview',
      description: 'High-level business metrics and KPIs',
      category: 'executive',
      widgets: [
        {
          id: 'revenue-metric',
          type: 'metric',
          title: 'Total Revenue',
          size: 'medium',
          position: { x: 0, y: 0, width: 2, height: 1 },
          config: {
            metric: 'total_revenue',
            comparison: 'previous_period',
            showTrend: true
          },
          data: null,
          refreshInterval: 30,
          lastUpdated: new Date()
        },
        {
          id: 'orders-chart',
          type: 'chart',
          title: 'Orders Over Time',
          size: 'large',
          position: { x: 2, y: 0, width: 4, height: 2 },
          config: {
            chartType: 'line',
            xAxis: 'timestamp',
            yAxis: ['order_count', 'order_value'],
            groupBy: 'day'
          },
          data: null,
          refreshInterval: 60,
          lastUpdated: new Date()
        },
        {
          id: 'top-products',
          type: 'table',
          title: 'Top Performing Products',
          size: 'medium',
          position: { x: 0, y: 1, width: 2, height: 2 },
          config: {
            columns: [
              { key: 'name', label: 'Product', type: 'text' },
              { key: 'revenue', label: 'Revenue', type: 'currency', sortable: true },
              { key: 'orders', label: 'Orders', type: 'number', sortable: true },
              { key: 'conversion', label: 'Conversion', type: 'percentage', sortable: true }
            ],
            pagination: { pageSize: 10, showSizeChanger: true }
          },
          data: null,
          refreshInterval: 300,
          lastUpdated: new Date()
        },
        {
          id: 'customer-satisfaction',
          type: 'metric',
          title: 'Customer Satisfaction',
          size: 'small',
          position: { x: 6, y: 0, width: 1, height: 1 },
          config: {
            metric: 'customer_satisfaction',
            comparison: 'previous_period',
            showTrend: true
          },
          data: null,
          refreshInterval: 300,
          lastUpdated: new Date()
        }
      ],
      layout: 'grid',
      isPublic: false,
      ownerId: 'system',
      permissions: {
        view: ['admin', 'manager'],
        edit: ['admin'],
        delete: ['admin']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Operational Dashboard
    const operationalDashboard: AnalyticsDashboard = {
      id: 'operational-view',
      name: 'Operational View',
      description: 'Real-time operational metrics and system health',
      category: 'operational',
      widgets: [
        {
          id: 'system-health',
          type: 'metric',
          title: 'System Health',
          size: 'small',
          position: { x: 0, y: 0, width: 1, height: 1 },
          config: {
            metric: 'system_uptime',
            showTrend: true
          },
          data: null,
          refreshInterval: 30,
          lastUpdated: new Date()
        },
        {
          id: 'active-users',
          type: 'metric',
          title: 'Active Users',
          size: 'small',
          position: { x: 1, y: 0, width: 1, height: 1 },
          config: {
            metric: 'active_users',
            comparison: 'previous_period'
          },
          data: null,
          refreshInterval: 10,
          lastUpdated: new Date()
        },
        {
          id: 'error-rate',
          type: 'chart',
          title: 'Error Rate Trend',
          size: 'medium',
          position: { x: 2, y: 0, width: 3, height: 2 },
          config: {
            chartType: 'area',
            xAxis: 'timestamp',
            yAxis: ['error_rate'],
            groupBy: 'hour'
          },
          data: null,
          refreshInterval: 60,
          lastUpdated: new Date()
        },
        {
          id: 'performance-heatmap',
          type: 'heatmap',
          title: 'Performance by Region',
          size: 'large',
          position: { x: 0, y: 1, width: 5, height: 2 },
          config: {
            filters: { metric: 'response_time' }
          },
          data: null,
          refreshInterval: 300,
          lastUpdated: new Date()
        }
      ],
      layout: 'grid',
      isPublic: false,
      ownerId: 'system',
      permissions: {
        view: ['admin', 'manager', 'developer'],
        edit: ['admin', 'developer'],
        delete: ['admin']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.dashboards.set(executiveDashboard.id, executiveDashboard);
    this.dashboards.set(operationalDashboard.id, operationalDashboard);
  }

  private startDataCollection() {
    // Simulate real-time data collection
    this.collectRealtimeMetrics();
    this.generateTimeSeriesData();
    this.detectAnomalies();
  }

  private async collectRealtimeMetrics() {
    // Collect metrics from various sources
    const metrics: AnalyticsMetric[] = [
      {
        id: 'total_revenue',
        name: 'Total Revenue',
        value: 125430.50,
        previousValue: 118920.75,
        change: 5.5,
        changeType: 'increase',
        format: 'currency',
        category: 'financial',
        trend: 'up',
        lastUpdated: new Date()
      },
      {
        id: 'active_users',
        name: 'Active Users',
        value: 1247,
        previousValue: 1189,
        change: 4.9,
        changeType: 'increase',
        format: 'number',
        category: 'customer',
        trend: 'up',
        lastUpdated: new Date()
      },
      {
        id: 'system_uptime',
        name: 'System Uptime',
        value: '99.9%',
        changeType: 'neutral',
        format: 'percentage',
        category: 'system',
        trend: 'stable',
        lastUpdated: new Date()
      },
      {
        id: 'customer_satisfaction',
        name: 'Customer Satisfaction',
        value: 4.7,
        previousValue: 4.6,
        change: 2.2,
        changeType: 'increase',
        format: 'number',
        category: 'customer',
        trend: 'up',
        lastUpdated: new Date()
      }
    ];

    metrics.forEach(metric => {
      this.metrics.set(metric.id, metric);
      this.notifySubscribers(`metric:${metric.id}`, metric);
    });
  }

  private generateTimeSeriesData() {
    const now = new Date();
    const series: AnalyticsTimeSeries[] = [
      {
        metric: 'order_count',
        data: Array.from({ length: 24 }, (_, i) => ({
          timestamp: new Date(now.getTime() - (23 - i) * 60 * 60 * 1000),
          value: Math.floor(Math.random() * 50) + 20,
          label: `${i}:00`
        })),
        period: 'hour',
        aggregation: 'sum'
      },
      {
        metric: 'order_value',
        data: Array.from({ length: 24 }, (_, i) => ({
          timestamp: new Date(now.getTime() - (23 - i) * 60 * 60 * 1000),
          value: Math.floor(Math.random() * 5000) + 2000
        })),
        period: 'hour',
        aggregation: 'sum'
      },
      {
        metric: 'error_rate',
        data: Array.from({ length: 24 }, (_, i) => ({
          timestamp: new Date(now.getTime() - (23 - i) * 60 * 60 * 1000),
          value: Math.random() * 0.05 // 0-5% error rate
        })),
        period: 'hour',
        aggregation: 'avg'
      }
    ];

    series.forEach(s => {
      this.timeSeries.set(s.metric, s);
      this.notifySubscribers(`timeseries:${s.metric}`, s);
    });
  }

  private detectAnomalies() {
    // Simple anomaly detection
    const insights: PredictiveInsight[] = [
      {
        id: 'revenue_anomaly',
        title: 'Unusual Revenue Spike Detected',
        description: 'Revenue increased by 45% compared to the 7-day average',
        type: 'anomaly',
        severity: 'medium',
        confidence: 0.85,
        impact: 'revenue',
        affectedMetrics: ['total_revenue'],
        predictedChange: {
          metric: 'total_revenue',
          currentValue: 125430.50,
          predictedValue: 140000,
          timeframe: 'next_24h',
          confidence: 0.75
        },
        recommendations: [
          'Monitor marketing campaigns for unusual activity',
          'Check for potential data quality issues',
          'Prepare additional resources if trend continues'
        ],
        data: { spike_percentage: 45, baseline_period: '7_days' },
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      },
      {
        id: 'user_engagement_trend',
        title: 'User Engagement Trending Upward',
        description: 'Daily active users increased by 15% over the past week',
        type: 'trend',
        severity: 'low',
        confidence: 0.92,
        impact: 'growth',
        affectedMetrics: ['active_users', 'session_duration'],
        predictedChange: {
          metric: 'active_users',
          currentValue: 1247,
          predictedValue: 1350,
          timeframe: 'next_week',
          confidence: 0.78
        },
        recommendations: [
          'Continue current marketing strategies',
          'Monitor for sustainability of growth',
          'Consider increasing server capacity'
        ],
        data: { growth_rate: 15, trend_direction: 'increasing' },
        createdAt: new Date()
      }
    ];

    this.insights = insights;
    this.notifySubscribers('insights', insights);
  }

  // Public API methods
  getDashboard(dashboardId: string): AnalyticsDashboard | undefined {
    return this.dashboards.get(dashboardId);
  }

  getAllDashboards(): AnalyticsDashboard[] {
    return Array.from(this.dashboards.values());
  }

  getMetric(metricId: string): AnalyticsMetric | undefined {
    return this.metrics.get(metricId);
  }

  getTimeSeries(metricId: string): AnalyticsTimeSeries | undefined {
    return this.timeSeries.get(metricId);
  }

  getInsights(): PredictiveInsight[] {
    return this.insights;
  }

  subscribe(event: string, callback: (data: any) => void): () => void {
    if (!this.updateCallbacks.has(event)) {
      this.updateCallbacks.set(event, new Set());
    }
    this.updateCallbacks.get(event)!.add(callback);

    return () => {
      const callbacks = this.updateCallbacks.get(event);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  private notifySubscribers(event: string, data: any) {
    const callbacks = this.updateCallbacks.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in analytics subscriber:', error);
        }
      });
    }
  }

  // Dashboard management
  createDashboard(dashboard: Omit<AnalyticsDashboard, 'id' | 'createdAt' | 'updatedAt'>): string {
    const id = `dashboard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newDashboard: AnalyticsDashboard = {
      ...dashboard,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.dashboards.set(id, newDashboard);
    return id;
  }

  updateDashboard(id: string, updates: Partial<AnalyticsDashboard>): boolean {
    const dashboard = this.dashboards.get(id);
    if (dashboard) {
      this.dashboards.set(id, { ...dashboard, ...updates, updatedAt: new Date() });
      return true;
    }
    return false;
  }

  deleteDashboard(id: string): boolean {
    return this.dashboards.delete(id);
  }

  // Widget management
  addWidget(dashboardId: string, widget: Omit<DashboardWidget, 'id' | 'lastUpdated'>): string | null {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) return null;

    const widgetId = `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newWidget: DashboardWidget = {
      ...widget,
      id: widgetId,
      lastUpdated: new Date()
    };

    dashboard.widgets.push(newWidget);
    dashboard.updatedAt = new Date();

    return widgetId;
  }

  updateWidget(dashboardId: string, widgetId: string, updates: Partial<DashboardWidget>): boolean {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) return false;

    const widgetIndex = dashboard.widgets.findIndex(w => w.id === widgetId);
    if (widgetIndex === -1) return false;

    dashboard.widgets[widgetIndex] = {
      ...dashboard.widgets[widgetIndex],
      ...updates,
      lastUpdated: new Date()
    };
    dashboard.updatedAt = new Date();

    return true;
  }

  removeWidget(dashboardId: string, widgetId: string): boolean {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) return false;

    const widgetIndex = dashboard.widgets.findIndex(w => w.id === widgetId);
    if (widgetIndex === -1) return false;

    dashboard.widgets.splice(widgetIndex, 1);
    dashboard.updatedAt = new Date();

    return true;
  }

  // Export functionality
  async exportDashboard(dashboardId: string, format: 'pdf' | 'excel' | 'png'): Promise<string> {
    // Simulate export process
    console.log(`Exporting dashboard ${dashboardId} as ${format}`);
    return `export_${Date.now()}.${format}`;
  }

  // Cleanup
  destroy() {
    this.refreshIntervals.forEach(interval => clearInterval(interval));
    this.refreshIntervals.clear();
    this.updateCallbacks.clear();
  }
}

// Singleton instance
export const analyticsDashboard = new RealtimeAnalyticsDashboard();