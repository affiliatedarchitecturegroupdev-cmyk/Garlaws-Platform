// Advanced Predictive Analytics Engine
export interface TimeSeriesData {
  timestamp: Date;
  value: number;
  metadata?: Record<string, any>;
}

export interface TrendAnalysis {
  metric: string;
  period: {
    start: Date;
    end: Date;
  };
  trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  slope: number; // Change per day
  confidence: number; // 0-1
  seasonality: boolean;
  seasonalityPeriod?: number; // days
  outliers: Array<{
    timestamp: Date;
    value: number;
    deviation: number;
    zScore: number;
  }>;
  forecast: Array<{
    timestamp: Date;
    predictedValue: number;
    upperBound: number;
    lowerBound: number;
    confidence: number;
  }>;
}

export interface PredictiveModel {
  id: string;
  name: string;
  type: 'linear_regression' | 'time_series' | 'machine_learning' | 'statistical';
  targetVariable: string;
  features: string[];
  accuracy: number; // 0-1
  trainingPeriod: {
    start: Date;
    end: Date;
  };
  lastTrained: Date;
  predictions: Array<{
    timestamp: Date;
    predictedValue: number;
    actualValue?: number;
    error?: number;
  }>;
}

export interface BusinessInsight {
  id: string;
  category: 'performance' | 'risk' | 'opportunity' | 'efficiency' | 'trend';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number; // 0-1
  timeframe: 'immediate' | 'short_term' | 'medium_term' | 'long_term';
  recommendations: string[];
  data: {
    currentValue: number;
    predictedValue: number;
    change: number;
    changePercent: number;
  };
  generatedAt: Date;
}

export interface ScenarioAnalysis {
  scenario: string;
  description: string;
  assumptions: string[];
  probability: number; // 0-1
  impact: {
    financial: number;
    operational: number;
    risk: number;
  };
  timeframe: {
    start: Date;
    end: Date;
  };
  mitigationStrategies: string[];
}

class PredictiveAnalyticsEngine {
  private timeSeriesData: Map<string, TimeSeriesData[]> = new Map();
  private models: Map<string, PredictiveModel> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Generate mock time series data for various metrics
    const metrics = [
      'revenue', 'maintenance_cost', 'occupancy_rate', 'energy_consumption',
      'maintenance_incidents', 'customer_satisfaction', 'response_time'
    ];

    const now = new Date();
    const days = 365;

    metrics.forEach(metric => {
      const data: TimeSeriesData[] = [];
      let baseValue = this.getBaseValueForMetric(metric);
      let trend = this.getTrendForMetric(metric);

      for (let i = days; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const noise = (Math.random() - 0.5) * baseValue * 0.1;
        const seasonal = Math.sin(i / 30 * 2 * Math.PI) * baseValue * 0.05;
        const value = Math.max(0, baseValue + trend * i + noise + seasonal);

        data.push({
          timestamp,
          value,
          metadata: { metric }
        });

        // Slight adjustment for trend
        baseValue += trend * 0.01;
      }

      this.timeSeriesData.set(metric, data);
    });
  }

  private getBaseValueForMetric(metric: string): number {
    const baseValues: Record<string, number> = {
      revenue: 50000,
      maintenance_cost: 8000,
      occupancy_rate: 85,
      energy_consumption: 12000,
      maintenance_incidents: 5,
      customer_satisfaction: 4.2,
      response_time: 120
    };
    return baseValues[metric] || 100;
  }

  private getTrendForMetric(metric: string): number {
    const trends: Record<string, number> = {
      revenue: 50, // Increasing
      maintenance_cost: 10, // Slightly increasing
      occupancy_rate: -0.02, // Slightly decreasing
      energy_consumption: 5, // Slowly increasing
      maintenance_incidents: -0.01, // Slightly decreasing
      customer_satisfaction: 0.001, // Stable/improving
      response_time: -0.05 // Improving
    };
    return trends[metric] || 0;
  }

  async analyzeTrend(
    metric: string,
    startDate: Date,
    endDate: Date,
    forecastDays: number = 30
  ): Promise<TrendAnalysis> {
    const data = this.timeSeriesData.get(metric) || [];

    // Filter data by date range
    const filteredData = data.filter(d =>
      d.timestamp >= startDate && d.timestamp <= endDate
    );

    if (filteredData.length < 10) {
      throw new Error('Insufficient data for trend analysis');
    }

    // Calculate trend using linear regression
    const trend = this.calculateLinearTrend(filteredData);

    // Detect seasonality
    const seasonality = this.detectSeasonality(filteredData);

    // Identify outliers
    const outliers = this.identifyOutliers(filteredData);

    // Generate forecast
    const forecast = this.generateForecast(filteredData, forecastDays, trend);

    return {
      metric,
      period: { start: startDate, end: endDate },
      trend: (trend.slope > 0.1 ? 'increasing' :
             trend.slope < -0.1 ? 'decreasing' :
             Math.abs(trend.slope) < 0.01 ? 'stable' : 'volatile') as 'increasing' | 'decreasing' | 'stable' | 'volatile',
      slope: trend.slope,
      confidence: trend.confidence,
      seasonality: seasonality.detected,
      seasonalityPeriod: seasonality.period,
      outliers: outliers as Array<{
        timestamp: Date;
        value: number;
        deviation: number;
        zScore: number;
      }>,
      forecast
    };
  }

  private calculateLinearTrend(data: TimeSeriesData[]): {
    slope: number;
    intercept: number;
    confidence: number;
  } {
    const n = data.length;
    const sumX = data.reduce((sum, d, i) => sum + i, 0);
    const sumY = data.reduce((sum, d) => sum + d.value, 0);
    const sumXY = data.reduce((sum, d, i) => sum + i * d.value, 0);
    const sumXX = data.reduce((sum, d, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R-squared for confidence
    const yMean = sumY / n;
    const ssRes = data.reduce((sum, d, i) => {
      const predicted = slope * i + intercept;
      return sum + Math.pow(d.value - predicted, 2);
    }, 0);
    const ssTot = data.reduce((sum, d) => sum + Math.pow(d.value - yMean, 2), 0);
    const rSquared = 1 - (ssRes / ssTot);

    return {
      slope,
      intercept,
      confidence: Math.max(0, Math.min(1, rSquared))
    };
  }

  private detectSeasonality(data: TimeSeriesData[]): {
    detected: boolean;
    period?: number;
  } {
    // Simple autocorrelation-based seasonality detection
    const values = data.map(d => d.value);
    const n = values.length;

    // Check for weekly seasonality (7 days)
    const weeklyCorr = this.calculateAutocorrelation(values, 7);
    if (Math.abs(weeklyCorr) > 0.3) {
      return { detected: true, period: 7 };
    }

    // Check for monthly seasonality (30 days)
    const monthlyCorr = this.calculateAutocorrelation(values, 30);
    if (Math.abs(monthlyCorr) > 0.3) {
      return { detected: true, period: 30 };
    }

    return { detected: false };
  }

  private calculateAutocorrelation(values: number[], lag: number): number {
    const n = values.length;
    if (lag >= n) return 0;

    const mean = values.reduce((sum, v) => sum + v, 0) / n;
    let numerator = 0;
    let denominator1 = 0;
    let denominator2 = 0;

    for (let i = 0; i < n - lag; i++) {
      const diff1 = values[i] - mean;
      const diff2 = values[i + lag] - mean;
      numerator += diff1 * diff2;
      denominator1 += diff1 * diff1;
      denominator2 += diff2 * diff2;
    }

    const denominator = Math.sqrt(denominator1 * denominator2);
    return denominator === 0 ? 0 : numerator / denominator;
  }

  private identifyOutliers(data: TimeSeriesData[]): Array<{
    timestamp: Date;
    value: number;
    deviation: number;
    zScore: number;
  }> {
    const values = data.map(d => d.value);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
    );

    const outliers: Array<{
      timestamp: Date;
      value: number;
      deviation: number;
      zScore: number;
    }> = [];
    const threshold = 2.5; // Z-score threshold

    data.forEach(d => {
      const zScore = (d.value - mean) / stdDev;
      if (Math.abs(zScore) > threshold) {
        outliers.push({
          timestamp: d.timestamp,
          value: d.value,
          deviation: d.value - mean,
          zScore
        });
      }
    });

    return outliers;
  }

  private generateForecast(
    data: TimeSeriesData[],
    days: number,
    trend: { slope: number; intercept: number; confidence: number }
  ): Array<{
    timestamp: Date;
    predictedValue: number;
    upperBound: number;
    lowerBound: number;
    confidence: number;
  }> {
    const forecast = [];
    const lastDataPoint = data[data.length - 1];
    const baseValue = lastDataPoint.value;

    // Calculate prediction interval (simple approach)
    const values = data.map(d => d.value);
    const stdDev = this.calculateStandardDeviation(values);
    const confidenceInterval = 1.96 * stdDev; // 95% confidence interval

    for (let i = 1; i <= days; i++) {
      const timestamp = new Date(lastDataPoint.timestamp.getTime() + i * 24 * 60 * 60 * 1000);
      const trendAdjustment = trend.slope * (data.length + i);
      const predictedValue = Math.max(0, baseValue + trendAdjustment);

      forecast.push({
        timestamp,
        predictedValue,
        upperBound: predictedValue + confidenceInterval,
        lowerBound: Math.max(0, predictedValue - confidenceInterval),
        confidence: trend.confidence
      });
    }

    return forecast;
  }

  private calculateStandardDeviation(values: number[]): number {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  async generateBusinessInsights(
    metrics: string[],
    timeframe: 'short_term' | 'medium_term' | 'long_term' = 'medium_term'
  ): Promise<BusinessInsight[]> {
    const insights: BusinessInsight[] = [];
    const now = new Date();

    // Define timeframes
    const timeframes = {
      short_term: { start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), days: 30 },
      medium_term: { start: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), days: 90 },
      long_term: { start: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000), days: 365 }
    };

    const { start, days: forecastDays } = timeframes[timeframe];

    for (const metric of metrics) {
      try {
        const trend = await this.analyzeTrend(metric, start, now, forecastDays);

        // Generate insights based on trend analysis
        const insightsForMetric = this.generateInsightsForMetric(metric, trend, timeframe);
        insights.push(...insightsForMetric);
      } catch (error) {
        console.warn(`Failed to analyze trend for ${metric}:`, error);
      }
    }

    // Sort by impact and confidence
    return insights.sort((a, b) => {
      const scoreA = (a.impact === 'high' ? 3 : a.impact === 'medium' ? 2 : 1) * a.confidence;
      const scoreB = (b.impact === 'high' ? 3 : b.impact === 'medium' ? 2 : 1) * b.confidence;
      return scoreB - scoreA;
    });
  }

  private generateInsightsForMetric(
    metric: string,
    trend: TrendAnalysis,
    timeframe: string
  ): BusinessInsight[] {
    const insights: BusinessInsight[] = [];
    const currentValue = trend.forecast[0]?.predictedValue || 0;
    const futureValue = trend.forecast[trend.forecast.length - 1]?.predictedValue || 0;
    const change = futureValue - currentValue;
    const changePercent = currentValue !== 0 ? (change / currentValue) * 100 : 0;

    const insightTemplates = {
      revenue: {
        increasing: {
          category: 'opportunity' as const,
          title: 'Revenue Growth Opportunity',
          description: 'Revenue showing strong upward trend with seasonal patterns',
          impact: 'high' as const,
          recommendations: [
            'Increase marketing investment in high-performing channels',
            'Expand service offerings based on demand patterns',
            'Consider strategic acquisitions in growth markets'
          ]
        },
        decreasing: {
          category: 'risk' as const,
          title: 'Revenue Decline Risk',
          description: 'Revenue trending downward, potential market challenges',
          impact: 'high' as const,
          recommendations: [
            'Conduct customer satisfaction analysis',
            'Review pricing strategy and competitive positioning',
            'Implement cost optimization measures'
          ]
        }
      },
      maintenance_cost: {
        increasing: {
          category: 'efficiency' as const,
          title: 'Rising Maintenance Costs',
          description: 'Maintenance expenses increasing, potential efficiency opportunities',
          impact: 'medium' as const,
          recommendations: [
            'Implement preventive maintenance programs',
            'Review supplier contracts and pricing',
            'Invest in equipment upgrades for cost savings'
          ]
        }
      },
      occupancy_rate: {
        decreasing: {
          category: 'risk' as const,
          title: 'Occupancy Rate Decline',
          description: 'Occupancy rates showing downward trend',
          impact: 'high' as const,
          recommendations: [
            'Enhance marketing and tenant acquisition efforts',
            'Review rental pricing and incentives',
            'Improve property amenities and services'
          ]
        }
      },
      customer_satisfaction: {
        increasing: {
          category: 'performance' as const,
          title: 'Customer Satisfaction Improvement',
          description: 'Customer satisfaction scores trending upward',
          impact: 'medium' as const,
          recommendations: [
            'Continue current service excellence initiatives',
            'Leverage positive reviews in marketing',
            'Identify and replicate best practices'
          ]
        },
        decreasing: {
          category: 'risk' as const,
          title: 'Customer Satisfaction Decline',
          description: 'Customer satisfaction showing concerning downward trend',
          impact: 'high' as const,
          recommendations: [
            'Conduct detailed customer feedback analysis',
            'Review service delivery processes',
            'Implement quality improvement initiatives'
          ]
        }
      }
    };

    const metricInsights = insightTemplates[metric as keyof typeof insightTemplates];
    if (metricInsights) {
      const trendKey = trend.trend === 'increasing' ? 'increasing' :
                      trend.trend === 'decreasing' ? 'decreasing' :
                      trend.trend === 'stable' ? 'stable' : 'volatile';

      const template = (metricInsights as any)[trendKey];
      if (template) {
        insights.push({
          id: `${metric}_${trendKey}_${Date.now()}`,
          category: template.category,
          title: template.title,
          description: template.description,
          impact: template.impact,
          confidence: trend.confidence,
          timeframe: timeframe as any,
          recommendations: template.recommendations,
          data: {
            currentValue,
            predictedValue: futureValue,
            change,
            changePercent
          },
          generatedAt: new Date()
        });
      }
    }

    return insights;
  }

  async performScenarioAnalysis(
    baseMetrics: Record<string, number>,
    scenarios: Array<{
      name: string;
      changes: Record<string, number>; // percentage changes
      probability: number;
    }>
  ): Promise<ScenarioAnalysis[]> {
    const analyses: ScenarioAnalysis[] = [];

    for (const scenario of scenarios) {
      const analysis = await this.analyzeScenario(baseMetrics, scenario);
      analyses.push(analysis);
    }

    return analyses.sort((a, b) => b.probability - a.probability);
  }

  private async analyzeScenario(
    baseMetrics: Record<string, number>,
    scenario: { name: string; changes: Record<string, number>; probability: number }
  ): Promise<ScenarioAnalysis> {
    // Calculate projected metrics
    const projectedMetrics: Record<string, number> = {};
    for (const [metric, baseValue] of Object.entries(baseMetrics)) {
      const change = scenario.changes[metric] || 0;
      projectedMetrics[metric] = baseValue * (1 + change / 100);
    }

    // Estimate financial impact
    const financialImpact = this.calculateFinancialImpact(projectedMetrics);

    // Estimate operational impact
    const operationalImpact = this.calculateOperationalImpact(projectedMetrics);

    // Estimate risk impact
    const riskImpact = this.calculateRiskImpact(projectedMetrics);

    const now = new Date();
    const timeframe = {
      start: now,
      end: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000) // 1 year
    };

    return {
      scenario: scenario.name,
      description: `Analysis of ${scenario.name} scenario with ${scenario.probability * 100}% probability`,
      assumptions: Object.entries(scenario.changes).map(([metric, change]) =>
        `${metric}: ${change > 0 ? '+' : ''}${change}% change`
      ),
      probability: scenario.probability,
      impact: {
        financial: financialImpact,
        operational: operationalImpact,
        risk: riskImpact
      },
      timeframe,
      mitigationStrategies: this.generateMitigationStrategies(scenario.name, projectedMetrics)
    };
  }

  private calculateFinancialImpact(metrics: Record<string, number>): number {
    const revenue = metrics.revenue || 0;
    const costs = metrics.maintenance_cost || 0;
    return revenue - costs;
  }

  private calculateOperationalImpact(metrics: Record<string, number>): number {
    const occupancy = metrics.occupancy_rate || 85;
    const incidents = metrics.maintenance_incidents || 5;
    const responseTime = metrics.response_time || 120;

    // Simplified operational score (higher is better)
    return (occupancy / 100) * (1 / incidents) * (1 / responseTime) * 1000;
  }

  private calculateRiskImpact(metrics: Record<string, number>): number {
    const satisfaction = metrics.customer_satisfaction || 4.2;
    const incidents = metrics.maintenance_incidents || 5;

    // Simplified risk score (lower is better)
    return (5 - satisfaction) + incidents;
  }

  private generateMitigationStrategies(scenario: string, metrics: Record<string, number>): string[] {
    const strategies = [];

    if (scenario.toLowerCase().includes('recession')) {
      strategies.push('Diversify revenue streams', 'Implement cost controls', 'Strengthen customer relationships');
    } else if (scenario.toLowerCase().includes('growth')) {
      strategies.push('Scale operations capacity', 'Invest in technology infrastructure', 'Expand service offerings');
    } else if (scenario.toLowerCase().includes('disaster')) {
      strategies.push('Enhance business continuity plans', 'Increase insurance coverage', 'Develop crisis management protocols');
    } else {
      strategies.push('Monitor key metrics closely', 'Maintain flexible operational capacity', 'Build contingency reserves');
    }

    return strategies;
  }

  // Get historical data for a metric
  getHistoricalData(metric: string, days: number = 365): TimeSeriesData[] {
    const data = this.timeSeriesData.get(metric) || [];
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return data.filter(d => d.timestamp >= cutoff);
  }
}

export const predictiveAnalyticsEngine = new PredictiveAnalyticsEngine();