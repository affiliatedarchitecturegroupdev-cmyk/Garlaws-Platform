// Advanced Analytics & Business Intelligence Platform

export interface AnalyticsMetric {
  id: string;
  name: string;
  value: number | string;
  previousValue?: number | string;
  change?: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  format: 'number' | 'currency' | 'percentage' | 'duration' | 'text';
  category: 'financial' | 'operational' | 'customer' | 'product' | 'system';
  trend: 'up' | 'down' | 'stable';
  lastUpdated: Date;
}

export interface AnalyticsTimeSeries {
  metric: string;
  data: Array<{
    timestamp: Date;
    value: number;
    label?: string;
  }>;
  period: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
  aggregation: 'sum' | 'avg' | 'min' | 'max' | 'count';
}

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'map' | 'funnel' | 'heatmap';
  title: string;
  description?: string;
  size: 'small' | 'medium' | 'large' | 'xlarge';
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  config: WidgetConfig;
  data: any;
  refreshInterval: number; // seconds
  lastUpdated: Date;
}

export interface WidgetConfig {
  // Chart-specific config
  chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'radar';
  xAxis?: string;
  yAxis?: string[];
  groupBy?: string;
  filters?: Record<string, any>;

  // Metric-specific config
  metric?: string;
  comparison?: 'previous_period' | 'previous_year' | 'benchmark';
  showTrend?: boolean;

  // Table-specific config
  columns?: Array<{
    key: string;
    label: string;
    type: 'text' | 'number' | 'currency' | 'percentage' | 'date';
    sortable?: boolean;
  }>;
  pagination?: {
    pageSize: number;
    showSizeChanger: boolean;
  };
}

export interface AnalyticsDashboard {
  id: string;
  name: string;
  description?: string;
  category: 'executive' | 'operational' | 'financial' | 'marketing' | 'product' | 'custom';
  widgets: DashboardWidget[];
  layout: 'grid' | 'masonry' | 'flex';
  isPublic: boolean;
  ownerId: string;
  permissions: {
    view: string[];
    edit: string[];
    delete: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalyticsReport {
  id: string;
  title: string;
  description?: string;
  type: 'scheduled' | 'on_demand' | 'alert';
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    time: string; // HH:MM format
    timezone: string;
  };
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv' | 'html';
  sections: ReportSection[];
  filters: Record<string, any>;
  createdAt: Date;
  lastGenerated?: Date;
}

export interface ReportSection {
  id: string;
  title: string;
  type: 'text' | 'metric' | 'chart' | 'table' | 'kpi';
  content: any;
  order: number;
}

export interface PredictiveInsight {
  id: string;
  title: string;
  description: string;
  type: 'trend' | 'anomaly' | 'forecast' | 'correlation' | 'recommendation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-1
  impact: 'revenue' | 'cost' | 'efficiency' | 'risk' | 'growth';
  affectedMetrics: string[];
  predictedChange: {
    metric: string;
    currentValue: number;
    predictedValue: number;
    timeframe: string;
    confidence: number;
  };
  recommendations: string[];
  data: any;
  createdAt: Date;
  expiresAt?: Date;
}

export interface AnalyticsQuery {
  id: string;
  name: string;
  description?: string;
  dataSource: 'financial' | 'orders' | 'customers' | 'products' | 'system' | 'cross_module';
  query: {
    dimensions: string[];
    metrics: string[];
    filters: Record<string, any>;
    dateRange: {
      start: Date;
      end: Date;
    };
    groupBy?: string[];
    orderBy?: Array<{
      field: string;
      direction: 'asc' | 'desc';
    }>;
    limit?: number;
  };
  cache?: {
    enabled: boolean;
    ttl: number; // seconds
    lastUpdated?: Date;
  };
  createdAt: Date;
  lastExecuted?: Date;
}

export interface AnalyticsEvent {
  id: string;
  type: 'page_view' | 'user_action' | 'api_call' | 'error' | 'conversion' | 'engagement';
  userId?: string;
  sessionId: string;
  timestamp: Date;
  properties: Record<string, any>;
  context: {
    url?: string;
    referrer?: string;
    userAgent?: string;
    ip?: string;
    location?: {
      country: string;
      region?: string;
      city?: string;
    };
    device?: {
      type: 'mobile' | 'desktop' | 'tablet';
      os?: string;
      browser?: string;
    };
  };
}

export interface AnalyticsFunnel {
  id: string;
  name: string;
  description?: string;
  steps: Array<{
    id: string;
    name: string;
    event: string;
    filters?: Record<string, any>;
  }>;
  dateRange: {
    start: Date;
    end: Date;
  };
  results: Array<{
    stepId: string;
    users: number;
    conversion: number;
    dropoff: number;
  }>;
  overallConversion: number;
  createdAt: Date;
}

export interface AnalyticsSegment {
  id: string;
  name: string;
  description?: string;
  type: 'behavioral' | 'demographic' | 'technographic' | 'firmographic';
  conditions: Array<{
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'between';
    value: any;
  }>;
  size: number;
  createdAt: Date;
  lastCalculated: Date;
}

export interface AnalyticsAlert {
  id: string;
  name: string;
  description?: string;
  type: 'metric_threshold' | 'anomaly' | 'trend' | 'custom';
  condition: {
    metric: string;
    operator: 'above' | 'below' | 'equals' | 'changes_by';
    threshold: number;
    timeframe: string; // e.g., '1h', '24h', '7d'
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  notifications: {
    email: string[];
    slack?: string;
    webhook?: string;
  };
  cooldown: number; // minutes
  lastTriggered?: Date;
  createdAt: Date;
}

export interface AnalyticsExport {
  id: string;
  name: string;
  description?: string;
  query: AnalyticsQuery;
  format: 'csv' | 'json' | 'xlsx' | 'pdf';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  fileUrl?: string;
  fileSize?: number;
  expiresAt: Date;
  requestedBy: string;
  createdAt: Date;
  completedAt?: Date;
}