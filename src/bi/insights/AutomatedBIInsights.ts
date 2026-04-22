// Automated Business Intelligence Insights Generation
export class AutomatedBIInsights {
  private static readonly INSIGHT_TYPES = {
    TREND: 'trend',
    ANOMALY: 'anomaly',
    CORRELATION: 'correlation',
    PREDICTION: 'prediction',
    COMPARISON: 'comparison',
    DISTRIBUTION: 'distribution',
    SEGMENTATION: 'segmentation',
  };

  private static readonly INSIGHT_PRIORITIES = {
    CRITICAL: 1.0,
    HIGH: 0.8,
    MEDIUM: 0.6,
    LOW: 0.4,
  };

  // Insight generation templates
  private static insightTemplates: Record<string, InsightTemplate> = {
    [this.INSIGHT_TYPES.TREND]: {
      title: 'Trend Detected: {metric} {direction}',
      description: '{metric} shows a {direction} trend of {magnitude}% over {period}',
      impact: 'high',
      category: 'performance',
    },
    [this.INSIGHT_TYPES.ANOMALY]: {
      title: 'Anomaly Detected in {metric}',
      description: 'Unusual {severity} anomaly detected in {metric} with {confidence}% confidence',
      impact: 'critical',
      category: 'alert',
    },
    [this.INSIGHT_TYPES.CORRELATION]: {
      title: 'Strong Correlation Found',
      description: '{metric1} and {metric2} show {strength} correlation ({correlation})',
      impact: 'medium',
      category: 'relationship',
    },
    [this.INSIGHT_TYPES.PREDICTION]: {
      title: 'Prediction: {metric} to {direction}',
      description: 'Based on current trends, {metric} is predicted to {direction} by {percentage}%',
      impact: 'high',
      category: 'forecast',
    },
  };

  // Generate insights from data
  static async generateInsights(
    data: BIData,
    context: BIContext,
    options: InsightOptions = {}
  ): Promise<GeneratedBIInsights> {
    console.log(`Generating BI insights for ${data.metrics.length} metrics`);

    const insights: GeneratedBIInsights = {
      insights: [],
      summary: '',
      confidence: 0,
      generatedAt: new Date(),
      dataCoverage: this.calculateDataCoverage(data),
      insightCategories: {},
    };

    try {
      // Generate different types of insights
      const trendInsights = await this.generateTrendInsights(data, context);
      const anomalyInsights = await this.generateAnomalyInsights(data, context);
      const correlationInsights = await this.generateCorrelationInsights(data, context);
      const predictionInsights = await this.generatePredictionInsights(data, context);

      // Combine all insights
      insights.insights = [
        ...trendInsights,
        ...anomalyInsights,
        ...correlationInsights,
        ...predictionInsights,
      ];

      // Rank and prioritize insights
      insights.insights = this.rankInsights(insights.insights);

      // Limit to top insights if specified
      if (options.maxInsights) {
        insights.insights = insights.insights.slice(0, options.maxInsights);
      }

      // Categorize insights
      insights.insightCategories = this.categorizeInsights(insights.insights);

      // Generate summary
      insights.summary = await this.generateInsightSummary(insights, context);

      // Calculate overall confidence
      insights.confidence = this.calculateOverallConfidence(insights.insights);

      console.log(`Generated ${insights.insights.length} BI insights`);

    } catch (error) {
      console.error('Insight generation failed:', error);
      insights.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return insights;
  }

  // Generate trend insights
  private static async generateTrendInsights(
    data: BIData,
    context: BIContext
  ): Promise<BIInsight[]> {
    const insights: BIInsight[] = [];

    for (const metric of data.metrics) {
      if (metric.values.length < 10) continue;

      const trend = this.analyzeTrend(metric);
      if (Math.abs(trend.slope) > 0.05) { // Significant trend
        const direction = trend.slope > 0 ? 'increasing' : 'decreasing';
        const magnitude = Math.abs(trend.slope * 100);

        const insight: BIInsight = {
          id: `trend-${metric.name}-${Date.now()}`,
          type: this.INSIGHT_TYPES.TREND,
          title: this.fillTemplate(this.insightTemplates.trend.title, {
            metric: metric.name,
            direction,
          }),
          description: this.fillTemplate(this.insightTemplates.trend.description, {
            metric: metric.name,
            direction,
            magnitude: magnitude.toFixed(1),
            period: this.calculatePeriod(data.timeRange),
          }),
          confidence: Math.min(Math.abs(trend.r_squared), 0.95),
          impact: this.insightTemplates.trend.impact,
          category: this.insightTemplates.trend.category,
          data: {
            metric: metric.name,
            direction,
            slope: trend.slope,
            magnitude,
            r_squared: trend.r_squared,
          },
          timestamp: new Date(),
          priority: this.calculatePriority(trend.slope, context),
        };

        insights.push(insight);
      }
    }

    return insights;
  }

  // Generate anomaly insights
  private static async generateAnomalyInsights(
    data: BIData,
    context: BIContext
  ): Promise<BIInsight[]> {
    const insights: BIInsight[] = [];

    for (const metric of data.metrics) {
      const anomalies = this.detectAnomalies(metric);

      for (const anomaly of anomalies) {
        if (anomaly.score > 3) { // Significant anomaly
          const severity = anomaly.score > 5 ? 'critical' : anomaly.score > 4 ? 'high' : 'medium';

          const insight: BIInsight = {
            id: `anomaly-${metric.name}-${anomaly.index}-${Date.now()}`,
            type: this.INSIGHT_TYPES.ANOMALY,
            title: this.fillTemplate(this.insightTemplates.anomaly.title, {
              metric: metric.name,
            }),
            description: this.fillTemplate(this.insightTemplates.anomaly.description, {
              metric: metric.name,
              severity,
              confidence: (anomaly.score * 20).toFixed(0),
            }),
            confidence: Math.min(anomaly.score / 6, 0.95),
            impact: 'critical',
            category: 'alert',
            data: {
              metric: metric.name,
              index: anomaly.index,
              value: anomaly.value,
              expectedValue: anomaly.expectedValue,
              score: anomaly.score,
              severity,
            },
            timestamp: new Date(),
            priority: this.INSIGHT_PRIORITIES.CRITICAL,
          };

          insights.push(insight);
        }
      }
    }

    return insights;
  }

  // Generate correlation insights
  private static async generateCorrelationInsights(
    data: BIData,
    context: BIContext
  ): Promise<BIInsight[]> {
    const insights: BIInsight[] = [];

    const metrics = data.metrics.filter(m => m.values.length > 10);

    for (let i = 0; i < metrics.length; i++) {
      for (let j = i + 1; j < metrics.length; j++) {
        const correlation = this.calculateCorrelation(metrics[i], metrics[j]);

        if (Math.abs(correlation) > 0.7) { // Strong correlation
          const strength = Math.abs(correlation) > 0.9 ? 'very strong' :
                          Math.abs(correlation) > 0.8 ? 'strong' : 'moderate';

          const insight: BIInsight = {
            id: `correlation-${metrics[i].name}-${metrics[j].name}-${Date.now()}`,
            type: this.INSIGHT_TYPES.CORRELATION,
            title: this.fillTemplate(this.insightTemplates.correlation.title, {}),
            description: this.fillTemplate(this.insightTemplates.correlation.description, {
              metric1: metrics[i].name,
              metric2: metrics[j].name,
              strength,
              correlation: correlation.toFixed(3),
            }),
            confidence: Math.abs(correlation),
            impact: 'medium',
            category: 'relationship',
            data: {
              metric1: metrics[i].name,
              metric2: metrics[j].name,
              correlation,
              strength,
              significance: this.calculateCorrelationSignificance(correlation, metrics[i].values.length),
            },
            timestamp: new Date(),
            priority: this.INSIGHT_PRIORITIES.MEDIUM,
          };

          insights.push(insight);
        }
      }
    }

    return insights;
  }

  // Generate prediction insights
  private static async generatePredictionInsights(
    data: BIData,
    context: BIContext
  ): Promise<BIInsight[]> {
    const insights: BIInsight[] = [];

    for (const metric of data.metrics) {
      if (metric.values.length < 20) continue;

      const prediction = this.generatePrediction(metric, context);

      if (prediction.confidence > 0.7) {
        const insight: BIInsight = {
          id: `prediction-${metric.name}-${Date.now()}`,
          type: this.INSIGHT_TYPES.PREDICTION,
          title: this.fillTemplate(this.insightTemplates.prediction.title, {
            metric: metric.name,
            direction: prediction.direction,
          }),
          description: this.fillTemplate(this.insightTemplates.prediction.description, {
            metric: metric.name,
            direction: prediction.direction,
            percentage: prediction.percentage.toFixed(1),
          }),
          confidence: prediction.confidence,
          impact: 'high',
          category: 'forecast',
          data: {
            metric: metric.name,
            direction: prediction.direction,
            percentage: prediction.percentage,
            confidence: prediction.confidence,
            forecastPeriod: prediction.period,
          },
          timestamp: new Date(),
          priority: this.INSIGHT_PRIORITIES.HIGH,
        };

        insights.push(insight);
      }
    }

    return insights;
  }

  // Rank insights by priority and confidence
  private static rankInsights(insights: BIInsight[]): BIInsight[] {
    return insights.sort((a, b) => {
      // First by priority
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }

      // Then by confidence
      if (a.confidence !== b.confidence) {
        return b.confidence - a.confidence;
      }

      // Then by recency
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  }

  // Categorize insights
  private static categorizeInsights(insights: BIInsight[]): Record<string, number> {
    const categories: Record<string, number> = {};

    for (const insight of insights) {
      categories[insight.category] = (categories[insight.category] || 0) + 1;
    }

    return categories;
  }

  // Generate insight summary
  private static async generateInsightSummary(
    insights: GeneratedBIInsights,
    context: BIContext
  ): Promise<string> {
    const totalInsights = insights.insights.length;
    const categories = Object.keys(insights.insightCategories);

    if (totalInsights === 0) {
      return 'No significant insights were found in the analyzed data.';
    }

    const criticalInsights = insights.insights.filter(i => i.priority >= this.INSIGHT_PRIORITIES.CRITICAL).length;
    const topCategory = categories.reduce((a, b) =>
      insights.insightCategories[a] > insights.insightCategories[b] ? a : b
    );

    return `Analysis identified ${totalInsights} key insights, including ${criticalInsights} critical findings. The most common theme was ${topCategory} patterns.`;
  }

  // Calculate overall confidence
  private static calculateOverallConfidence(insights: BIInsight[]): number {
    if (insights.length === 0) return 0;

    const totalConfidence = insights.reduce((sum, insight) => sum + insight.confidence, 0);
    return totalConfidence / insights.length;
  }

  // Helper methods
  private static calculateDataCoverage(data: BIData): number {
    if (data.metrics.length === 0) return 0;

    const totalPoints = data.metrics.reduce((sum, metric) => sum + metric.values.length, 0);
    const averagePoints = totalPoints / data.metrics.length;

    // Coverage based on data completeness and time range
    const timeSpan = data.timeRange.end.getTime() - data.timeRange.start.getTime();
    const expectedPoints = (timeSpan / (24 * 60 * 60 * 1000)) * data.metrics.length; // Daily points

    return Math.min(averagePoints / expectedPoints, 1.0);
  }

  private static analyzeTrend(metric: DataMetric): TrendAnalysis {
    const values = metric.values;
    const n = values.length;

    // Simple linear regression
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, idx) => sum + val * idx, 0);
    const sumXX = values.reduce((sum, val, idx) => sum + idx * idx, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R-squared
    const yMean = sumY / n;
    const ssRes = values.reduce((sum, val, idx) => {
      const predicted = slope * idx + intercept;
      return sum + Math.pow(val - predicted, 2);
    }, 0);
    const ssTot = values.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
    const rSquared = 1 - (ssRes / ssTot);

    return { slope, intercept, r_squared: rSquared };
  }

  private static detectAnomalies(metric: DataMetric): Anomaly[] {
    const values = metric.values;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const std = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);

    const anomalies: Anomaly[] = [];

    for (let i = 0; i < values.length; i++) {
      const zScore = Math.abs((values[i] - mean) / std);
      if (zScore > 3) {
        anomalies.push({
          index: i,
          value: values[i],
          expectedValue: mean,
          score: zScore,
        });
      }
    }

    return anomalies;
  }

  private static calculateCorrelation(metric1: DataMetric, metric2: DataMetric): number {
    const values1 = metric1.values;
    const values2 = metric2.values;
    const n = Math.min(values1.length, values2.length);

    const sum1 = values1.slice(0, n).reduce((sum, val) => sum + val, 0);
    const sum2 = values2.slice(0, n).reduce((sum, val) => sum + val, 0);
    const sum1Sq = values1.slice(0, n).reduce((sum, val) => sum + val * val, 0);
    const sum2Sq = values2.slice(0, n).reduce((sum, val) => sum + val * val, 0);
    const sum12 = values1.slice(0, n).reduce((sum, val, idx) => sum + val * values2[idx], 0);

    const numerator = n * sum12 - sum1 * sum2;
    const denominator = Math.sqrt((n * sum1Sq - sum1 * sum1) * (n * sum2Sq - sum2 * sum2));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  private static calculateCorrelationSignificance(correlation: number, sampleSize: number): boolean {
    // Simplified significance test
    const tStatistic = Math.abs(correlation) * Math.sqrt((sampleSize - 2) / (1 - correlation * correlation));
    const criticalValue = 2.0; // 95% confidence for large samples

    return tStatistic > criticalValue;
  }

  private static generatePrediction(metric: DataMetric, context: BIContext): PredictionData {
    const values = metric.values;
    const recent = values.slice(-10);
    const previous = values.slice(-20, -10);

    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const previousAvg = previous.reduce((sum, val) => sum + val, 0) / previous.length;

    const change = recentAvg - previousAvg;
    const percentage = Math.abs((change / previousAvg) * 100);
    const direction = change > 0 ? 'increase' : 'decrease';
    const confidence = Math.min(percentage / 50, 0.95); // Higher change = higher confidence

    return {
      direction,
      percentage,
      confidence,
      period: 'next_period',
    };
  }

  private static calculatePriority(slope: number, context: BIContext): number {
    const magnitude = Math.abs(slope);

    if (magnitude > 0.2) return this.INSIGHT_PRIORITIES.CRITICAL;
    if (magnitude > 0.1) return this.INSIGHT_PRIORITIES.HIGH;
    if (magnitude > 0.05) return this.INSIGHT_PRIORITIES.MEDIUM;
    return this.INSIGHT_PRIORITIES.LOW;
  }

  private static calculatePeriod(timeRange: TimeRange): string {
    const days = Math.ceil((timeRange.end.getTime() - timeRange.start.getTime()) / (24 * 60 * 60 * 1000));

    if (days <= 7) return 'week';
    if (days <= 30) return 'month';
    if (days <= 90) return 'quarter';
    return 'year';
  }

  private static fillTemplate(template: string, data: Record<string, any>): string {
    let result = template;
    for (const [key, value] of Object.entries(data)) {
      result = result.replace(new RegExp(`{${key}}`, 'g'), String(value));
    }
    return result;
  }
}

// Interface definitions
interface BIData {
  metrics: DataMetric[];
  dimensions: Record<string, any>;
  timeRange: TimeRange;
  filters?: Record<string, any>;
}

interface DataMetric {
  name: string;
  values: number[];
  timestamps: Date[];
  metadata?: Record<string, any>;
}

interface BIContext {
  domain: string;
  userId?: string;
  businessContext: Record<string, any>;
  preferences?: InsightPreferences;
}

interface InsightOptions {
  maxInsights?: number;
  minConfidence?: number;
  includeHistorical?: boolean;
  focusAreas?: string[];
}

interface GeneratedBIInsights {
  insights: BIInsight[];
  summary: string;
  confidence: number;
  generatedAt: Date;
  dataCoverage: number;
  insightCategories: Record<string, number>;
  error?: string;
}

interface BIInsight {
  id: string;
  type: string;
  title: string;
  description: string;
  confidence: number;
  impact: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  data: Record<string, any>;
  timestamp: Date;
  priority: number;
}

interface InsightTemplate {
  title: string;
  description: string;
  impact: 'critical' | 'high' | 'medium' | 'low';
  category: string;
}

interface TrendAnalysis {
  slope: number;
  intercept: number;
  r_squared: number;
}

interface Anomaly {
  index: number;
  value: number;
  expectedValue: number;
  score: number;
}

interface PredictionData {
  direction: string;
  percentage: number;
  confidence: number;
  period: string;
}

interface InsightPreferences {
  priorityThreshold: number;
  categories: string[];
  maxInsightsPerCategory: number;
}

interface TimeRange {
  start: Date;
  end: Date;
}

export default AutomatedBIInsights;