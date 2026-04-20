// Cross-Module Business Intelligence Engine

export interface BusinessReport {
  id: string;
  title: string;
  description?: string;
  type: 'executive_summary' | 'performance_analysis' | 'trend_analysis' | 'comparative_analysis' | 'forecast_report';
  dateRange: {
    start: Date;
    end: Date;
  };
  modules: string[]; // Which business modules this report covers
  sections: ReportSection[];
  generatedAt: Date;
  generatedBy: string;
  format: 'interactive' | 'pdf' | 'excel' | 'powerpoint';
  status: 'draft' | 'published' | 'archived';
}

export interface ReportSection {
  id: string;
  title: string;
  type: 'metrics' | 'chart' | 'table' | 'text' | 'insights';
  data: any;
  position: number;
  config?: {
    visualization?: string;
    filters?: Record<string, any>;
    sorting?: any;
  };
}

export interface BusinessMetric {
  id: string;
  name: string;
  value: number | string;
  unit: string;
  category: 'kpi' | 'performance' | 'financial' | 'operational' | 'customer';
  module: string;
  trend: 'up' | 'down' | 'stable';
  changePercent?: number;
  target?: number;
  benchmark?: number;
  lastUpdated: Date;
}

export interface BusinessInsight {
  id: string;
  title: string;
  description: string;
  type: 'opportunity' | 'risk' | 'trend' | 'anomaly' | 'recommendation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  impact: 'revenue' | 'cost' | 'efficiency' | 'growth' | 'risk';
  affectedModules: string[];
  data: any;
  actions: string[];
  createdAt: Date;
  expiresAt?: Date;
}

export interface ComparativeAnalysis {
  id: string;
  title: string;
  description?: string;
  type: 'period_comparison' | 'segment_comparison' | 'benchmark_comparison';
  dimensions: string[];
  metrics: string[];
  comparisonGroups: ComparisonGroup[];
  insights: string[];
  createdAt: Date;
}

export interface ComparisonGroup {
  id: string;
  name: string;
  filters: Record<string, any>;
  results: Record<string, number | string>;
  rank?: number;
  change?: number;
}

class BusinessIntelligenceEngine {
  private reports: Map<string, BusinessReport> = new Map();
  private metrics: Map<string, BusinessMetric> = new Map();
  private insights: BusinessInsight[] = [];

  constructor() {
    this.initializeDefaultReports();
    this.startMetricCollection();
  }

  private initializeDefaultReports() {
    // Executive Summary Report
    const executiveReport: BusinessReport = {
      id: 'executive-summary',
      title: 'Executive Business Summary',
      description: 'High-level overview of key business metrics across all modules',
      type: 'executive_summary',
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        end: new Date()
      },
      modules: ['financial', 'ecommerce', 'crm', 'projects', 'system'],
      sections: [
        {
          id: 'kpi-overview',
          title: 'Key Performance Indicators',
          type: 'metrics',
          data: {},
          position: 1,
          config: {
            visualization: 'kpi_cards'
          }
        },
        {
          id: 'revenue-trends',
          title: 'Revenue Trends',
          type: 'chart',
          data: {},
          position: 2,
          config: {
            visualization: 'line_chart',
            filters: { metric: 'revenue' }
          }
        },
        {
          id: 'module-performance',
          title: 'Module Performance Comparison',
          type: 'table',
          data: {},
          position: 3,
          config: {
            sorting: { field: 'performance_score', direction: 'desc' }
          }
        },
        {
          id: 'key-insights',
          title: 'Strategic Insights',
          type: 'insights',
          data: {},
          position: 4
        }
      ],
      generatedAt: new Date(),
      generatedBy: 'system',
      format: 'interactive',
      status: 'published'
    };

    // Performance Analysis Report
    const performanceReport: BusinessReport = {
      id: 'performance-analysis',
      title: 'Detailed Performance Analysis',
      description: 'In-depth analysis of system and business performance',
      type: 'performance_analysis',
      dateRange: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        end: new Date()
      },
      modules: ['system', 'ecommerce', 'crm'],
      sections: [
        {
          id: 'system-metrics',
          title: 'System Performance Metrics',
          type: 'metrics',
          data: {},
          position: 1
        },
        {
          id: 'conversion-funnel',
          title: 'Conversion Funnel Analysis',
          type: 'chart',
          data: {},
          position: 2,
          config: {
            visualization: 'funnel_chart'
          }
        },
        {
          id: 'bottleneck-analysis',
          title: 'Performance Bottlenecks',
          type: 'table',
          data: {},
          position: 3
        }
      ],
      generatedAt: new Date(),
      generatedBy: 'system',
      format: 'interactive',
      status: 'published'
    };

    this.reports.set(executiveReport.id, executiveReport);
    this.reports.set(performanceReport.id, performanceReport);
  }

  private async startMetricCollection() {
    // Collect metrics from all modules
    await this.collectBusinessMetrics();

    // Generate insights
    await this.generateBusinessInsights();

    // Set up periodic updates
    setInterval(async () => {
      await this.collectBusinessMetrics();
      await this.generateBusinessInsights();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  private async collectBusinessMetrics() {
    const metrics: BusinessMetric[] = [
      // Financial Metrics
      {
        id: 'total_revenue',
        name: 'Total Revenue',
        value: 125430.50,
        unit: 'ZAR',
        category: 'financial',
        module: 'financial',
        trend: 'up',
        changePercent: 5.5,
        target: 150000,
        lastUpdated: new Date()
      },
      {
        id: 'monthly_recurring_revenue',
        name: 'Monthly Recurring Revenue',
        value: 45670.25,
        unit: 'ZAR',
        category: 'financial',
        module: 'financial',
        trend: 'up',
        changePercent: 8.2,
        lastUpdated: new Date()
      },

      // E-commerce Metrics
      {
        id: 'total_orders',
        name: 'Total Orders',
        value: 1247,
        unit: 'orders',
        category: 'operational',
        module: 'ecommerce',
        trend: 'up',
        changePercent: 12.3,
        target: 1500,
        lastUpdated: new Date()
      },
      {
        id: 'conversion_rate',
        name: 'Conversion Rate',
        value: 3.2,
        unit: 'percent',
        category: 'performance',
        module: 'ecommerce',
        trend: 'up',
        changePercent: 0.8,
        benchmark: 2.5,
        lastUpdated: new Date()
      },
      {
        id: 'average_order_value',
        name: 'Average Order Value',
        value: 285.50,
        unit: 'ZAR',
        category: 'financial',
        module: 'ecommerce',
        trend: 'stable',
        changePercent: -1.2,
        lastUpdated: new Date()
      },

      // CRM Metrics
      {
        id: 'total_customers',
        name: 'Total Customers',
        value: 5832,
        unit: 'customers',
        category: 'customer',
        module: 'crm',
        trend: 'up',
        changePercent: 4.1,
        lastUpdated: new Date()
      },
      {
        id: 'customer_satisfaction',
        name: 'Customer Satisfaction',
        value: 4.7,
        unit: 'rating',
        category: 'customer',
        module: 'crm',
        trend: 'up',
        changePercent: 2.1,
        target: 4.8,
        lastUpdated: new Date()
      },

      // Project Management Metrics
      {
        id: 'active_projects',
        name: 'Active Projects',
        value: 23,
        unit: 'projects',
        category: 'operational',
        module: 'projects',
        trend: 'stable',
        changePercent: -5.3,
        lastUpdated: new Date()
      },
      {
        id: 'project_completion_rate',
        name: 'Project Completion Rate',
        value: 87.5,
        unit: 'percent',
        category: 'performance',
        module: 'projects',
        trend: 'up',
        changePercent: 3.2,
        target: 90,
        lastUpdated: new Date()
      },

      // System Metrics
      {
        id: 'system_uptime',
        name: 'System Uptime',
        value: 99.9,
        unit: 'percent',
        category: 'operational',
        module: 'system',
        trend: 'stable',
        changePercent: 0.1,
        target: 99.9,
        lastUpdated: new Date()
      },
      {
        id: 'response_time',
        name: 'Average Response Time',
        value: 245,
        unit: 'ms',
        category: 'performance',
        module: 'system',
        trend: 'down',
        changePercent: -8.5,
        benchmark: 300,
        lastUpdated: new Date()
      }
    ];

    metrics.forEach(metric => {
      this.metrics.set(metric.id, metric);
    });
  }

  private async generateBusinessInsights() {
    const insights: BusinessInsight[] = [];

    // Revenue growth insight
    const revenueMetric = this.metrics.get('total_revenue');
    if (revenueMetric && revenueMetric.changePercent && revenueMetric.changePercent > 10) {
      insights.push({
        id: `revenue_growth_${Date.now()}`,
        title: 'Strong Revenue Growth Opportunity',
        description: `Revenue has increased by ${revenueMetric.changePercent}% this month, exceeding targets`,
        type: 'opportunity',
        severity: 'medium',
        confidence: 0.85,
        impact: 'revenue',
        affectedModules: ['financial', 'ecommerce'],
        data: {
          current_revenue: revenueMetric.value,
          growth_rate: revenueMetric.changePercent,
          target: revenueMetric.target
        },
        actions: [
          'Analyze successful marketing campaigns',
          'Scale up high-performing products',
          'Consider expanding sales team',
          'Invest in customer retention programs'
        ],
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });
    }

    // Customer satisfaction insight
    const satisfactionMetric = this.metrics.get('customer_satisfaction');
    if (satisfactionMetric && typeof satisfactionMetric.value === 'number' && satisfactionMetric.value >= 4.5) {
      insights.push({
        id: `satisfaction_high_${Date.now()}`,
        title: 'Excellent Customer Satisfaction',
        description: 'Customer satisfaction rating is consistently high, indicating strong service quality',
        type: 'trend',
        severity: 'low',
        confidence: 0.92,
        impact: 'growth',
        affectedModules: ['crm', 'ecommerce'],
        data: {
          current_rating: satisfactionMetric.value,
          trend: satisfactionMetric.trend
        },
        actions: [
          'Document successful service practices',
          'Share best practices across team',
          'Consider leveraging testimonials in marketing',
          'Maintain current service standards'
        ],
        createdAt: new Date()
      });
    }

    // System performance insight
    const responseTimeMetric = this.metrics.get('response_time');
    if (responseTimeMetric && responseTimeMetric.changePercent && responseTimeMetric.changePercent < -10) {
      insights.push({
        id: `performance_improved_${Date.now()}`,
        title: 'Significant Performance Improvement',
        description: `System response time has improved by ${Math.abs(responseTimeMetric.changePercent)}%`,
        type: 'trend',
        severity: 'low',
        confidence: 0.88,
        impact: 'efficiency',
        affectedModules: ['system'],
        data: {
          current_response_time: responseTimeMetric.value,
          improvement: responseTimeMetric.changePercent
        },
        actions: [
          'Document performance optimization changes',
          'Monitor for continued stability',
          'Consider similar optimizations for other systems'
        ],
        createdAt: new Date()
      });
    }

    // Conversion rate insight
    const conversionMetric = this.metrics.get('conversion_rate');
    if (conversionMetric && conversionMetric.changePercent && conversionMetric.changePercent > 5) {
      insights.push({
        id: `conversion_boost_${Date.now()}`,
        title: 'Conversion Rate Improvement',
        description: `E-commerce conversion rate has increased by ${conversionMetric.changePercent}%`,
        type: 'opportunity',
        severity: 'medium',
        confidence: 0.80,
        impact: 'revenue',
        affectedModules: ['ecommerce'],
        data: {
          current_rate: conversionMetric.value,
          improvement: conversionMetric.changePercent,
          benchmark: conversionMetric.benchmark
        },
        actions: [
          'Analyze successful conversion tactics',
          'Implement A/B testing for checkout flow',
          'Consider expanding successful marketing channels',
          'Monitor for sustained improvement'
        ],
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
      });
    }

    this.insights = insights;
  }

  // Public API methods
  getReport(reportId: string): BusinessReport | undefined {
    return this.reports.get(reportId);
  }

  getAllReports(): BusinessReport[] {
    return Array.from(this.reports.values());
  }

  getMetricsByCategory(category: BusinessMetric['category']): BusinessMetric[] {
    return Array.from(this.metrics.values()).filter(metric => metric.category === category);
  }

  getMetricsByModule(module: string): BusinessMetric[] {
    return Array.from(this.metrics.values()).filter(metric => metric.module === module);
  }

  getBusinessInsights(): BusinessInsight[] {
    return this.insights;
  }

  getKPIOverview(): Record<string, any> {
    const kpis = this.getMetricsByCategory('kpi');
    const financial = this.getMetricsByCategory('financial');
    const operational = this.getMetricsByCategory('operational');

    return {
      totalKPIs: kpis.length,
      onTrackKPIs: kpis.filter(kpi => {
        if (kpi.target && typeof kpi.value === 'number') {
          return kpi.value >= kpi.target;
        }
        return true;
      }).length,
      totalRevenue: financial.find(m => m.id === 'total_revenue')?.value || 0,
      totalOrders: operational.find(m => m.id === 'total_orders')?.value || 0,
      customerSatisfaction: this.metrics.get('customer_satisfaction')?.value || 0,
      systemUptime: this.metrics.get('system_uptime')?.value || 0
    };
  }

  async generateComparativeAnalysis(
    type: ComparativeAnalysis['type'],
    dimensions: string[],
    metrics: string[],
    groups: Array<{ name: string; filters: Record<string, any> }>
  ): Promise<ComparativeAnalysis> {
    // Simulate comparative analysis generation
    const comparisonGroups: ComparisonGroup[] = groups.map((group, index) => ({
      id: `group_${index}`,
      name: group.name,
      filters: group.filters,
      results: {
        revenue: Math.floor(Math.random() * 100000) + 50000,
        orders: Math.floor(Math.random() * 1000) + 500,
        customers: Math.floor(Math.random() * 5000) + 2000,
        conversion_rate: Math.random() * 5 + 1
      },
      rank: index + 1,
      change: Math.random() * 20 - 10 // -10% to +10%
    }));

    // Sort by performance
    comparisonGroups.sort((a, b) => (b.results.revenue as number) - (a.results.revenue as number));
    comparisonGroups.forEach((group, index) => {
      group.rank = index + 1;
    });

    const insights = this.generateComparativeInsights(comparisonGroups, metrics);

    return {
      id: `comparison_${Date.now()}`,
      title: `${type.replace('_', ' ').toUpperCase()} Analysis`,
      type,
      dimensions,
      metrics,
      comparisonGroups,
      insights,
      createdAt: new Date()
    };
  }

  private generateComparativeInsights(groups: ComparisonGroup[], metrics: string[]): string[] {
    const insights: string[] = [];

    if (groups.length < 2) return insights;

    const topPerformer = groups[0];
    const bottomPerformer = groups[groups.length - 1];

    insights.push(`${topPerformer.name} leads with ${(topPerformer.results.revenue as number).toLocaleString()} in revenue`);
    insights.push(`${bottomPerformer.name} shows opportunity for improvement in key metrics`);

    // Find biggest gaps
    const revenueGap = (topPerformer.results.revenue as number) - (bottomPerformer.results.revenue as number);
    if (revenueGap > 10000) {
      insights.push(`Revenue gap of ${revenueGap.toLocaleString()} between top and bottom performers`);
    }

    // Performance trends
    const improvingGroups = groups.filter(g => (g.change as number) > 5);
    if (improvingGroups.length > 0) {
      insights.push(`${improvingGroups.length} segments showing strong growth trends`);
    }

    return insights;
  }

  async createCustomReport(
    title: string,
    description: string,
    sections: ReportSection[],
    modules: string[],
    dateRange: { start: Date; end: Date }
  ): Promise<string> {
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const report: BusinessReport = {
      id: reportId,
      title,
      description,
      type: 'performance_analysis',
      dateRange,
      modules,
      sections,
      generatedAt: new Date(),
      generatedBy: 'user',
      format: 'interactive',
      status: 'draft'
    };

    this.reports.set(reportId, report);
    return reportId;
  }

  async exportReport(reportId: string, format: 'pdf' | 'excel' | 'powerpoint'): Promise<string> {
    // Simulate export process
    console.log(`Exporting report ${reportId} as ${format}`);
    return `export_${Date.now()}.${format}`;
  }

  getPerformanceScorecard(): Record<string, any> {
    const metrics = Array.from(this.metrics.values());

    const scorecard = {
      overallScore: this.calculateOverallScore(metrics),
      categories: {
        financial: this.calculateCategoryScore(metrics.filter(m => m.category === 'financial')),
        operational: this.calculateCategoryScore(metrics.filter(m => m.category === 'operational')),
        customer: this.calculateCategoryScore(metrics.filter(m => m.category === 'customer')),
        performance: this.calculateCategoryScore(metrics.filter(m => m.category === 'performance'))
      },
      topPerformers: metrics
        .filter(m => m.trend === 'up' && m.changePercent && m.changePercent > 5)
        .sort((a, b) => (b.changePercent || 0) - (a.changePercent || 0))
        .slice(0, 5),
      areasForImprovement: metrics
        .filter(m => m.trend === 'down' || (m.target && typeof m.value === 'number' && m.value < m.target))
        .sort((a, b) => {
          const aGap = (a.target && typeof a.value === 'number') ? a.target - a.value : 0;
          const bGap = (b.target && typeof b.value === 'number') ? b.target - b.value : 0;
          return bGap - aGap;
        })
        .slice(0, 5)
    };

    return scorecard;
  }

  private calculateOverallScore(metrics: BusinessMetric[]): number {
    if (metrics.length === 0) return 0;

    const scores = metrics.map(metric => this.calculateMetricScore(metric));
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  private calculateCategoryScore(metrics: BusinessMetric[]): number {
    if (metrics.length === 0) return 0;
    return this.calculateOverallScore(metrics);
  }

  private calculateMetricScore(metric: BusinessMetric): number {
    let score = 50; // Base score

    // Trend bonus/penalty
    if (metric.trend === 'up') score += 20;
    else if (metric.trend === 'down') score -= 20;

    // Target achievement
    if (metric.target && typeof metric.value === 'number') {
      const achievement = metric.value / metric.target;
      if (achievement >= 1) score += 15;
      else if (achievement >= 0.8) score += 5;
      else score -= 10;
    }

    // Benchmark comparison
    if (metric.benchmark && typeof metric.value === 'number') {
      const comparison = metric.value / metric.benchmark;
      if (comparison >= 1.1) score += 10;
      else if (comparison < 0.9) score -= 10;
    }

    return Math.max(0, Math.min(100, score));
  }
}

// Singleton instance
export const businessIntelligence = new BusinessIntelligenceEngine();