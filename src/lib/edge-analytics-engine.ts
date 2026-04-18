// Edge Analytics and Insights Engine
export interface EdgeMetric {
  id: string;
  name: string;
  type: 'performance' | 'efficiency' | 'reliability' | 'security' | 'environmental';
  value: number;
  unit: string;
  timestamp: Date;
  deviceId: string;
  tags: string[];
  metadata: Record<string, any>;
}

export interface AnalyticsInsight {
  id: string;
  title: string;
  description: string;
  category: 'performance' | 'anomaly' | 'optimization' | 'prediction' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-1
  impact: {
    scope: 'device' | 'network' | 'system';
    affectedEntities: string[];
    potentialCost: number;
    riskLevel: number;
  };
  recommendations: Array<{
    action: string;
    priority: 'immediate' | 'short_term' | 'long_term';
    estimatedEffort: 'low' | 'medium' | 'high';
    expectedBenefit: number;
  }>;
  data: {
    metrics: EdgeMetric[];
    trends: Array<{
      metric: string;
      direction: 'increasing' | 'decreasing' | 'stable';
      rate: number;
      significance: number;
    }>;
    correlations: Array<{
      metric1: string;
      metric2: string;
      correlation: number; // -1 to 1
      significance: number;
    }>;
  };
  generatedAt: Date;
  expiresAt: Date;
  status: 'active' | 'expired' | 'actioned';
}

export interface PredictiveModel {
  id: string;
  name: string;
  type: 'regression' | 'classification' | 'time_series' | 'anomaly_detection';
  targetMetric: string;
  features: string[];
  algorithm: string;
  parameters: Record<string, any>;
  performance: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    trainingTime: number;
    lastTrained: Date;
  };
  predictions: Array<{
    timestamp: Date;
    predictedValue: number;
    confidence: number;
    actualValue?: number;
    error?: number;
  }>;
  status: 'training' | 'active' | 'inactive' | 'failed';
}

export interface AnalyticsRule {
  id: string;
  name: string;
  condition: {
    metric: string;
    operator: '>' | '<' | '>=' | '<=' | '==' | '!=' | 'between';
    threshold: number | [number, number];
    duration?: number; // seconds
    consecutiveOccurrences?: number;
  };
  actions: Array<{
    type: 'alert' | 'notification' | 'automation' | 'scaling';
    parameters: Record<string, any>;
    cooldown: number; // seconds
  }>;
  enabled: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  createdAt: Date;
  lastTriggered?: Date;
  triggerCount: number;
}

export interface AnalyticsDashboard {
  id: string;
  name: string;
  description: string;
  widgets: Array<{
    id: string;
    type: 'metric' | 'chart' | 'gauge' | 'heatmap' | 'table';
    title: string;
    dataSource: string;
    configuration: Record<string, any>;
    position: { x: number; y: number; width: number; height: number };
  }>;
  filters: {
    timeRange: { start: Date; end: Date };
    devices?: string[];
    metrics?: string[];
    tags?: string[];
  };
  refreshInterval: number; // seconds
  permissions: {
    read: string[];
    write: string[];
    admin: string[];
  };
  createdAt: Date;
  lastViewed: Date;
}

class EdgeAnalyticsEngine {
  private metrics: Map<string, EdgeMetric[]> = new Map();
  private insights: Map<string, AnalyticsInsight> = new Map();
  private models: Map<string, PredictiveModel> = new Map();
  private rules: Map<string, AnalyticsRule> = new Map();
  private dashboards: Map<string, AnalyticsDashboard> = new Map();

  constructor() {
    this.initializeDefaultRules();
    this.initializeDefaultModels();
    this.startMetricsCollection();
    this.startInsightsGeneration();
    this.startRuleEvaluation();
  }

  private initializeDefaultRules(): void {
    const rules: AnalyticsRule[] = [
      {
        id: 'high_cpu_usage',
        name: 'High CPU Usage Alert',
        condition: {
          metric: 'cpu_usage',
          operator: '>',
          threshold: 80,
          duration: 300, // 5 minutes
          consecutiveOccurrences: 3
        },
        actions: [
          {
            type: 'alert',
            parameters: { severity: 'high', message: 'High CPU usage detected' },
            cooldown: 1800 // 30 minutes
          },
          {
            type: 'automation',
            parameters: { action: 'scale_up', target: 'cpu_resources' },
            cooldown: 3600 // 1 hour
          }
        ],
        enabled: true,
        priority: 'high',
        tags: ['performance', 'cpu'],
        createdAt: new Date(),
        triggerCount: 0
      },
      {
        id: 'memory_leak',
        name: 'Memory Leak Detection',
        condition: {
          metric: 'memory_usage',
          operator: '>',
          threshold: 90,
          duration: 600, // 10 minutes
          consecutiveOccurrences: 5
        },
        actions: [
          {
            type: 'alert',
            parameters: { severity: 'critical', message: 'Potential memory leak detected' },
            cooldown: 3600
          },
          {
            type: 'notification',
            parameters: { recipients: ['admin'], message: 'Memory leak alert' },
            cooldown: 1800
          }
        ],
        enabled: true,
        priority: 'critical',
        tags: ['memory', 'stability'],
        createdAt: new Date(),
        triggerCount: 0
      },
      {
        id: 'network_anomaly',
        name: 'Network Anomaly Detection',
        condition: {
          metric: 'network_latency',
          operator: '>',
          threshold: 100,
          duration: 60, // 1 minute
          consecutiveOccurrences: 2
        },
        actions: [
          {
            type: 'alert',
            parameters: { severity: 'medium', message: 'Network latency spike detected' },
            cooldown: 900 // 15 minutes
          }
        ],
        enabled: true,
        priority: 'medium',
        tags: ['network', 'connectivity'],
        createdAt: new Date(),
        triggerCount: 0
      },
      {
        id: 'power_efficiency',
        name: 'Power Efficiency Monitoring',
        condition: {
          metric: 'power_consumption',
          operator: '>',
          threshold: 150, // watts
          duration: 3600, // 1 hour
          consecutiveOccurrences: 1
        },
        actions: [
          {
            type: 'notification',
            parameters: { message: 'High power consumption detected' },
            cooldown: 7200 // 2 hours
          }
        ],
        enabled: true,
        priority: 'low',
        tags: ['power', 'efficiency'],
        createdAt: new Date(),
        triggerCount: 0
      }
    ];

    rules.forEach(rule => this.rules.set(rule.id, rule));
  }

  private initializeDefaultModels(): void {
    const models: PredictiveModel[] = [
      {
        id: 'cpu_usage_predictor',
        name: 'CPU Usage Predictor',
        type: 'time_series',
        targetMetric: 'cpu_usage',
        features: ['time_of_day', 'active_tasks', 'memory_usage'],
        algorithm: 'LSTM',
        parameters: {
          sequenceLength: 24,
          hiddenUnits: 64,
          learningRate: 0.001,
          epochs: 100
        },
        performance: {
          accuracy: 0.85,
          precision: 0.82,
          recall: 0.88,
          f1Score: 0.85,
          trainingTime: 1200000, // 20 minutes
          lastTrained: new Date(Date.now() - 86400000) // 1 day ago
        },
        predictions: [],
        status: 'active'
      },
      {
        id: 'failure_predictor',
        name: 'Device Failure Predictor',
        type: 'classification',
        targetMetric: 'device_failure',
        features: ['temperature', 'vibration', 'power_consumption', 'uptime'],
        algorithm: 'Random Forest',
        parameters: {
          nEstimators: 100,
          maxDepth: 10,
          minSamplesSplit: 2
        },
        performance: {
          accuracy: 0.92,
          precision: 0.89,
          recall: 0.95,
          f1Score: 0.92,
          trainingTime: 1800000, // 30 minutes
          lastTrained: new Date(Date.now() - 43200000) // 12 hours ago
        },
        predictions: [],
        status: 'active'
      },
      {
        id: 'anomaly_detector',
        name: 'Real-time Anomaly Detector',
        type: 'anomaly_detection',
        targetMetric: 'system_metrics',
        features: ['cpu_usage', 'memory_usage', 'network_latency', 'power_consumption'],
        algorithm: 'Isolation Forest',
        parameters: {
          nEstimators: 100,
          contamination: 0.1,
          randomState: 42
        },
        performance: {
          accuracy: 0.94,
          precision: 0.91,
          recall: 0.97,
          f1Score: 0.94,
          trainingTime: 900000, // 15 minutes
          lastTrained: new Date(Date.now() - 21600000) // 6 hours ago
        },
        predictions: [],
        status: 'active'
      }
    ];

    models.forEach(model => this.models.set(model.id, model));
  }

  async recordMetric(deviceId: string, metric: Omit<EdgeMetric, 'id' | 'timestamp'>): Promise<void> {
    const metricId = `${deviceId}_${metric.name}_${Date.now()}`;
    const fullMetric: EdgeMetric = {
      ...metric,
      id: metricId,
      timestamp: new Date(),
      deviceId
    };

    const deviceMetrics = this.metrics.get(deviceId) || [];
    deviceMetrics.push(fullMetric);

    // Keep only last 1000 metrics per device
    if (deviceMetrics.length > 1000) {
      deviceMetrics.shift();
    }

    this.metrics.set(deviceId, deviceMetrics);

    // Check rules against new metric
    await this.evaluateRules(deviceId, fullMetric);

    // Update predictive models with new data
    await this.updateModels(deviceId, fullMetric);
  }

  private async evaluateRules(deviceId: string, metric: EdgeMetric): Promise<void> {
    for (const rule of this.rules.values()) {
      if (!rule.enabled || rule.condition.metric !== metric.name) continue;

      const isTriggered = this.evaluateCondition(rule.condition, metric.value);

      if (isTriggered) {
        // Check cooldown
        if (rule.lastTriggered) {
          const timeSinceLastTrigger = Date.now() - rule.lastTriggered.getTime();
          if (timeSinceLastTrigger < rule.actions[0]?.cooldown * 1000) continue;
        }

        // Execute actions
        await this.executeRuleActions(rule, deviceId, metric);

        rule.lastTriggered = new Date();
        rule.triggerCount++;
      }
    }
  }

  private evaluateCondition(condition: AnalyticsRule['condition'], value: number): boolean {
    switch (condition.operator) {
      case '>':
        return value > (condition.threshold as number);
      case '<':
        return value < (condition.threshold as number);
      case '>=':
        return value >= (condition.threshold as number);
      case '<=':
        return value <= (condition.threshold as number);
      case '==':
        return value === (condition.threshold as number);
      case '!=':
        return value !== (condition.threshold as number);
      case 'between':
        const [min, max] = condition.threshold as [number, number];
        return value >= min && value <= max;
      default:
        return false;
    }
  }

  private async executeRuleActions(rule: AnalyticsRule, deviceId: string, metric: EdgeMetric): Promise<void> {
    for (const action of rule.actions) {
      switch (action.type) {
        case 'alert':
          console.log(`ALERT [${rule.priority.toUpperCase()}]: ${action.parameters.message} on device ${deviceId}`);
          // In real implementation, this would send alerts to monitoring system
          break;

        case 'notification':
          console.log(`NOTIFICATION: ${action.parameters.message}`);
          // In real implementation, this would send notifications
          break;

        case 'automation':
          console.log(`AUTOMATION: Executing ${action.parameters.action} on ${action.parameters.target}`);
          // In real implementation, this would trigger automated responses
          break;

        case 'scaling':
          console.log(`SCALING: Adjusting resources based on ${metric.name}`);
          // In real implementation, this would trigger scaling actions
          break;
      }
    }
  }

  private async updateModels(deviceId: string, metric: EdgeMetric): Promise<void> {
    // Update relevant predictive models with new data
    for (const model of this.models.values()) {
      if (model.status !== 'active' || !model.features.includes(metric.name)) continue;

      // Add prediction point (simplified)
      const prediction = {
        timestamp: new Date(),
        predictedValue: metric.value + (Math.random() - 0.5) * metric.value * 0.1, // Slight variation
        confidence: 0.8 + Math.random() * 0.2,
        actualValue: metric.value
      };

      model.predictions.push(prediction);

      // Keep only last 100 predictions
      if (model.predictions.length > 100) {
        model.predictions.shift();
      }
    }
  }

  async generateInsights(deviceId: string, timeRange: { start: Date; end: Date }): Promise<AnalyticsInsight[]> {
    const deviceMetrics = this.metrics.get(deviceId) || [];
    const relevantMetrics = deviceMetrics.filter(
      m => m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
    );

    const insights: AnalyticsInsight[] = [];

    if (relevantMetrics.length < 10) {
      return insights; // Need minimum data for insights
    }

    // Performance insights
    const performanceInsight = await this.analyzePerformance(relevantMetrics, deviceId);
    if (performanceInsight) insights.push(performanceInsight);

    // Anomaly insights
    const anomalyInsights = await this.detectAnomalies(relevantMetrics, deviceId);
    insights.push(...anomalyInsights);

    // Optimization insights
    const optimizationInsight = await this.generateOptimizationRecommendations(relevantMetrics, deviceId);
    if (optimizationInsight) insights.push(optimizationInsight);

    // Predictive insights
    const predictiveInsights = await this.generatePredictions(deviceId, timeRange);
    insights.push(...predictiveInsights);

    // Security insights
    const securityInsight = await this.analyzeSecurity(relevantMetrics, deviceId);
    if (securityInsight) insights.push(securityInsight);

    return insights.sort((a, b) => b.confidence - a.confidence);
  }

  private async analyzePerformance(metrics: EdgeMetric[], deviceId: string): Promise<AnalyticsInsight | null> {
    const cpuMetrics = metrics.filter(m => m.name === 'cpu_usage');
    const memoryMetrics = metrics.filter(m => m.name === 'memory_usage');

    if (cpuMetrics.length === 0) return null;

    const avgCpu = cpuMetrics.reduce((sum, m) => sum + m.value, 0) / cpuMetrics.length;
    const maxCpu = Math.max(...cpuMetrics.map(m => m.value));
    const avgMemory = memoryMetrics.length > 0
      ? memoryMetrics.reduce((sum, m) => sum + m.value, 0) / memoryMetrics.length
      : 0;

    let category: AnalyticsInsight['category'] = 'performance';
    let severity: AnalyticsInsight['severity'] = 'low';
    let title = 'System Performance Analysis';
    let description = `Average CPU usage: ${avgCpu.toFixed(1)}%, Peak CPU: ${maxCpu.toFixed(1)}%`;

    if (avgCpu > 80) {
      severity = 'high';
      title = 'High CPU Utilization Detected';
      description = `System is experiencing high CPU load (${avgCpu.toFixed(1)}% average). Consider optimization or scaling.`;
    } else if (avgCpu > 60) {
      severity = 'medium';
      title = 'Elevated CPU Usage';
      description = `CPU usage is elevated (${avgCpu.toFixed(1)}% average). Monitor for potential issues.`;
    }

    const insight: AnalyticsInsight = {
      id: `perf_${deviceId}_${Date.now()}`,
      title,
      description,
      category,
      severity,
      confidence: 0.85,
      impact: {
        scope: 'device',
        affectedEntities: [deviceId],
        potentialCost: avgCpu > 80 ? 1000 : 0,
        riskLevel: avgCpu > 80 ? 7 : 3
      },
      recommendations: [
        {
          action: 'Monitor system resources closely',
          priority: 'immediate',
          estimatedEffort: 'low',
          expectedBenefit: 20
        },
        {
          action: 'Optimize running processes',
          priority: 'short_term',
          estimatedEffort: 'medium',
          expectedBenefit: 40
        },
        {
          action: 'Consider hardware upgrade if utilization remains high',
          priority: 'long_term',
          estimatedEffort: 'high',
          expectedBenefit: 80
        }
      ],
      data: {
        metrics: cpuMetrics.slice(-10),
        trends: [{
          metric: 'cpu_usage',
          direction: avgCpu > 70 ? 'increasing' : 'stable',
          rate: 0.5,
          significance: 0.7
        }],
        correlations: []
      },
      generatedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      status: 'active'
    };

    return insight;
  }

  private async detectAnomalies(metrics: EdgeMetric[], deviceId: string): Promise<AnalyticsInsight[]> {
    const insights: AnalyticsInsight[] = [];
    const anomalies: Array<{
      metric: string;
      count: number;
      latestValue: number;
      threshold: number;
    }> = [];

    // Simple anomaly detection based on standard deviation
    for (const metric of ['cpu_usage', 'memory_usage', 'network_latency']) {
      const metricData = metrics.filter(m => m.name === metric);
      if (metricData.length < 5) continue;

      const values = metricData.map(m => m.value);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const stdDev = Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length);

      const threshold = mean + 2 * stdDev; // 2 standard deviations
      const recentAnomalies = metricData.filter(m => m.value > threshold);

      if (recentAnomalies.length > 0) {
        anomalies.push({
          metric,
          count: recentAnomalies.length,
          latestValue: recentAnomalies[recentAnomalies.length - 1].value,
          threshold
        });
      }
    }

    if (anomalies.length > 0) {
      const insight: AnalyticsInsight = {
        id: `anomaly_${deviceId}_${Date.now()}`,
        title: 'Anomalous System Behavior Detected',
        description: `Detected ${anomalies.length} anomalous patterns in system metrics. ${anomalies.map(a => `${a.metric}: ${a.count} occurrences`).join(', ')}`,
        category: 'anomaly',
        severity: 'high',
        confidence: 0.9,
        impact: {
          scope: 'device',
          affectedEntities: [deviceId],
          potentialCost: 500,
          riskLevel: 8
        },
        recommendations: [
          {
            action: 'Investigate anomalous metrics immediately',
            priority: 'immediate',
            estimatedEffort: 'medium',
            expectedBenefit: 60
          },
          {
            action: 'Review system logs for error patterns',
            priority: 'immediate',
            estimatedEffort: 'low',
            expectedBenefit: 30
          },
          {
            action: 'Implement enhanced monitoring rules',
            priority: 'short_term',
            estimatedEffort: 'medium',
            expectedBenefit: 50
          }
        ],
        data: {
          metrics: metrics.filter(m => anomalies.some(a => a.metric === m.name)).slice(-20),
          trends: anomalies.map(a => ({
            metric: a.metric,
            direction: 'increasing' as const, // Using 'increasing' as approximation for volatile
            rate: 0,
            significance: 0.9
          })),
          correlations: []
        },
        generatedAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        status: 'active'
      };

      insights.push(insight);
    }

    return insights;
  }

  private async generateOptimizationRecommendations(metrics: EdgeMetric[], deviceId: string): Promise<AnalyticsInsight | null> {
    const avgCpu = metrics.filter(m => m.name === 'cpu_usage').reduce((sum, m) => sum + m.value, 0) /
                   metrics.filter(m => m.name === 'cpu_usage').length;

    if (!avgCpu || avgCpu < 30) return null; // No optimization needed for low utilization

    const insight: AnalyticsInsight = {
      id: `opt_${deviceId}_${Date.now()}`,
      title: 'System Optimization Opportunities',
      description: `Analysis shows potential for performance improvements. Current average CPU utilization: ${avgCpu.toFixed(1)}%`,
      category: 'optimization',
      severity: 'medium',
      confidence: 0.75,
      impact: {
        scope: 'device',
        affectedEntities: [deviceId],
        potentialCost: 200,
        riskLevel: 2
      },
      recommendations: [
        {
          action: 'Implement workload balancing across available resources',
          priority: 'short_term',
          estimatedEffort: 'medium',
          expectedBenefit: 25
        },
        {
          action: 'Configure automated scaling policies',
          priority: 'short_term' as const,
          estimatedEffort: 'high',
          expectedBenefit: 40
        },
        {
          action: 'Optimize application performance and resource usage',
          priority: 'long_term',
          estimatedEffort: 'high',
          expectedBenefit: 60
        }
      ],
      data: {
        metrics: metrics.slice(-50),
        trends: [{
          metric: 'cpu_usage',
          direction: 'stable',
          rate: 0,
          significance: 0.6
        }],
        correlations: []
      },
      generatedAt: new Date(),
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      status: 'active'
    };

    return insight;
  }

  private async generatePredictions(deviceId: string, timeRange: { start: Date; end: Date }): Promise<AnalyticsInsight[]> {
    const insights: AnalyticsInsight[] = [];
    const models = Array.from(this.models.values()).filter(m => m.status === 'active');

    for (const model of models) {
      if (model.predictions.length < 5) continue;

      const recentPredictions = model.predictions.slice(-10);
      const avgAccuracy = recentPredictions
        .filter(p => p.actualValue !== undefined)
        .reduce((sum, p) => sum + (1 - Math.abs((p.predictedValue - (p.actualValue || 0)) / (p.actualValue || 1))), 0) /
        recentPredictions.filter(p => p.actualValue !== undefined).length;

      if (avgAccuracy < 0.7) continue; // Skip models with poor performance

      const insight: AnalyticsInsight = {
        id: `pred_${deviceId}_${model.id}_${Date.now()}`,
        title: `${model.name} Performance Analysis`,
        description: `Predictive model "${model.name}" shows ${avgAccuracy.toFixed(2)} accuracy. ${recentPredictions.length} recent predictions analyzed.`,
        category: 'prediction',
        severity: avgAccuracy < 0.8 ? 'medium' : 'low',
        confidence: avgAccuracy,
        impact: {
          scope: 'device',
          affectedEntities: [deviceId],
          potentialCost: 0,
          riskLevel: avgAccuracy < 0.8 ? 4 : 2
        },
        recommendations: [
          {
            action: avgAccuracy < 0.8 ? 'Retrain model with additional data' : 'Continue monitoring model performance',
            priority: avgAccuracy < 0.8 ? 'short_term' : 'long_term',
            estimatedEffort: avgAccuracy < 0.8 ? 'high' : 'low',
            expectedBenefit: avgAccuracy < 0.8 ? 30 : 10
          }
        ],
        data: {
          metrics: [],
          trends: [],
          correlations: []
        },
        generatedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'active'
      };

      insights.push(insight);
    }

    return insights;
  }

  private async analyzeSecurity(metrics: EdgeMetric[], deviceId: string): Promise<AnalyticsInsight | null> {
    const securityMetrics = metrics.filter(m => m.tags.includes('security'));
    if (securityMetrics.length === 0) return null;

    // Check for security-related anomalies
    const suspiciousActivity = securityMetrics.filter(m =>
      m.name.includes('failed_login') || m.name.includes('unauthorized_access')
    );

    if (suspiciousActivity.length > 0) {
      return {
        id: `sec_${deviceId}_${Date.now()}`,
        title: 'Security Alert Detected',
        description: `Detected ${suspiciousActivity.length} suspicious security events. Immediate review recommended.`,
        category: 'security',
        severity: 'critical',
        confidence: 0.95,
        impact: {
          scope: 'device',
          affectedEntities: [deviceId],
          potentialCost: 2000,
          riskLevel: 9
        },
        recommendations: [
          {
            action: 'Review security logs immediately',
            priority: 'immediate',
            estimatedEffort: 'medium',
            expectedBenefit: 80
          },
          {
            action: 'Implement additional security measures',
            priority: 'immediate',
            estimatedEffort: 'high',
            expectedBenefit: 90
          },
          {
            action: 'Conduct security audit',
            priority: 'short_term',
            estimatedEffort: 'high',
            expectedBenefit: 70
          }
        ],
        data: {
          metrics: securityMetrics.slice(-20),
          trends: [],
          correlations: []
        },
        generatedAt: new Date(),
        expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
        status: 'active'
      };
    }

    return null;
  }

  // Public API methods
  getMetrics(deviceId: string, limit: number = 100): EdgeMetric[] {
    const deviceMetrics = this.metrics.get(deviceId) || [];
    return deviceMetrics.slice(-limit);
  }

  getInsights(deviceId?: string): AnalyticsInsight[] {
    const insights = Array.from(this.insights.values());
    return deviceId ? insights.filter(i => i.impact.affectedEntities.includes(deviceId)) : insights;
  }

  getModels(): PredictiveModel[] {
    return Array.from(this.models.values());
  }

  getRules(): AnalyticsRule[] {
    return Array.from(this.rules.values());
  }

  async createDashboard(dashboard: Omit<AnalyticsDashboard, 'id' | 'createdAt' | 'lastViewed'>): Promise<string> {
    const dashboardId = `dashboard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullDashboard: AnalyticsDashboard = {
      ...dashboard,
      id: dashboardId,
      createdAt: new Date(),
      lastViewed: new Date()
    };

    this.dashboards.set(dashboardId, fullDashboard);
    return dashboardId;
  }

  getDashboard(dashboardId: string): AnalyticsDashboard | undefined {
    return this.dashboards.get(dashboardId);
  }

  // Monitoring and maintenance
  private startMetricsCollection(): void {
    // Simulate metrics collection from edge devices
    setInterval(() => {
      // Generate mock metrics for all devices
      const deviceIds = ['edge_gateway_main', 'edge_sensor_hub_001', 'edge_ai_node_001'];

      deviceIds.forEach(deviceId => {
        const metrics = [
          {
            name: 'cpu_usage',
            type: 'performance',
            value: 20 + Math.random() * 60,
            unit: '%',
            tags: ['performance', 'cpu']
          },
          {
            name: 'memory_usage',
            type: 'performance',
            value: 30 + Math.random() * 50,
            unit: '%',
            tags: ['performance', 'memory']
          },
          {
            name: 'network_latency',
            type: 'performance',
            value: 10 + Math.random() * 50,
            unit: 'ms',
            tags: ['network', 'latency']
          },
          {
            name: 'power_consumption',
            type: 'efficiency',
            value: 50 + Math.random() * 100,
            unit: 'W',
            tags: ['power', 'efficiency']
          }
        ];

        metrics.forEach(metricData => {
          this.recordMetric(deviceId, {
            name: metricData.name,
            type: metricData.type as EdgeMetric['type'],
            value: metricData.value,
            unit: metricData.unit,
            tags: metricData.tags,
            deviceId: deviceId,
            metadata: {}
          });
        });
      });
    }, 60000); // Collect metrics every minute
  }

  private startInsightsGeneration(): void {
    setInterval(async () => {
      // Generate insights for active devices
      const deviceIds = Array.from(this.metrics.keys());

      for (const deviceId of deviceIds.slice(0, 2)) { // Limit to 2 devices per cycle
        const timeRange = {
          start: new Date(Date.now() - 60 * 60 * 1000), // Last hour
          end: new Date()
        };

        try {
          const deviceInsights = await this.generateInsights(deviceId, timeRange);

          deviceInsights.forEach(insight => {
            this.insights.set(insight.id, insight);
          });
        } catch (error) {
          console.error(`Failed to generate insights for ${deviceId}:`, error);
        }
      }

      // Clean up old insights (keep last 100)
      const allInsights = Array.from(this.insights.values());
      if (allInsights.length > 100) {
        const sortedInsights = allInsights.sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());
        const insightsToRemove = sortedInsights.slice(100);
        insightsToRemove.forEach(insight => this.insights.delete(insight.id));
      }
    }, 300000); // Generate insights every 5 minutes
  }

  private startRuleEvaluation(): void {
    // Rules are evaluated in real-time when metrics are recorded
    // This method could be used for periodic rule validation
    setInterval(() => {
      // Validate rule effectiveness and adjust thresholds if needed
      this.rules.forEach(rule => {
        if (rule.triggerCount > 100) {
          // Consider adjusting rule sensitivity
          console.log(`Rule ${rule.id} has high trigger count: ${rule.triggerCount}`);
        }
      });
    }, 3600000); // Check every hour
  }

  // Analytics summary
  getAnalyticsSummary(): {
    totalMetrics: number;
    totalInsights: number;
    activeModels: number;
    activeRules: number;
    alertsGenerated: number;
    averageConfidence: number;
  } {
    const totalMetrics = Array.from(this.metrics.values()).reduce((sum, metrics) => sum + metrics.length, 0);
    const totalInsights = this.insights.size;
    const activeModels = Array.from(this.models.values()).filter(m => m.status === 'active').length;
    const activeRules = Array.from(this.rules.values()).filter(r => r.enabled).length;
    const alertsGenerated = Array.from(this.rules.values()).reduce((sum, rule) => sum + rule.triggerCount, 0);

    const insights = Array.from(this.insights.values());
    const averageConfidence = insights.length > 0
      ? insights.reduce((sum, insight) => sum + insight.confidence, 0) / insights.length
      : 0;

    return {
      totalMetrics,
      totalInsights,
      activeModels,
      activeRules,
      alertsGenerated,
      averageConfidence
    };
  }
}

export const edgeAnalyticsEngine = new EdgeAnalyticsEngine();