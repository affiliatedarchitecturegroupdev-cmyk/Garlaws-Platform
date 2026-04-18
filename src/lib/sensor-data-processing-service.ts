import { IoTSensor, SensorReading, SensorAlert } from '@/lib/iot-sensor-management-engine';
import { PropertyData } from '@/lib/types/property';

export interface SensorDataBatch {
  sensorId: string;
  readings: SensorReading[];
  timestamp: Date;
}

export interface ProcessedSensorData {
  sensorId: string;
  processedReadings: ProcessedReading[];
  anomalies: AnomalyDetection[];
  trends: TrendAnalysis;
  predictions: PredictiveAnalysis;
  alerts: SensorAlert[];
}

export interface ProcessedReading extends SensorReading {
  normalizedValue: number;
  qualityScore: number;
  outlierScore: number;
  processedAt: Date;
}

export interface AnomalyDetection {
  readingId: string;
  anomalyType: 'point' | 'contextual' | 'collective';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  description: string;
  timestamp: Date;
}

export interface TrendAnalysis {
  direction: 'increasing' | 'decreasing' | 'stable' | 'fluctuating';
  slope: number;
  volatility: number;
  seasonality: boolean;
  confidence: number;
  period: string; // 'hourly', 'daily', 'weekly'
}

export interface PredictiveAnalysis {
  nextValue: number;
  confidence: number;
  upperBound: number;
  lowerBound: number;
  predictionHorizon: number; // hours
  modelAccuracy: number;
}

export class SensorDataProcessingService {
  private processingQueue: SensorDataBatch[] = [];
  private processedData: Map<string, ProcessedSensorData> = new Map();

  constructor() {
    this.startProcessingLoop();
  }

  async processSensorData(batch: SensorDataBatch): Promise<ProcessedSensorData> {
    const { sensorId, readings } = batch;

    // Process each reading
    const processedReadings = readings.map(reading => this.processReading(sensorId, reading));

    // Detect anomalies
    const anomalies = this.detectAnomalies(sensorId, processedReadings);

    // Analyze trends
    const trends = this.analyzeTrends(sensorId, processedReadings);

    // Generate predictions
    const predictions = this.generatePredictions(sensorId, processedReadings);

    // Get current alerts
    const alerts = this.getSensorAlerts(sensorId);

    const processedData: ProcessedSensorData = {
      sensorId,
      processedReadings,
      anomalies,
      trends,
      predictions,
      alerts
    };

    // Cache processed data
    this.processedData.set(sensorId, processedData);

    return processedData;
  }

  private processReading(sensorId: string, reading: SensorReading): ProcessedReading {
    const normalizedValue = this.normalizeValue(reading, sensorId);
    const qualityScore = this.calculateQualityScore(reading);
    const outlierScore = this.calculateOutlierScore(sensorId, reading);

    return {
      ...reading,
      normalizedValue,
      qualityScore,
      outlierScore,
      processedAt: new Date()
    };
  }

  private normalizeValue(reading: SensorReading, sensorId: string): number {
    // Get historical data for normalization
    const historicalData = this.getHistoricalData(sensorId, 100);

    if (historicalData.length === 0) return reading.value;

    const values = historicalData.map(r => r.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const std = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);

    // Z-score normalization
    return std > 0 ? (reading.value - mean) / std : 0;
  }

  private calculateQualityScore(reading: SensorReading): number {
    let score = 1.0;

    // Reduce score based on quality indicators
    if (reading.quality === 'poor') score *= 0.6;
    else if (reading.quality === 'moderate') score *= 0.8;

    // Check for missing metadata
    if (!reading.metadata) score *= 0.9;

    // Check timestamp freshness (prefer recent readings)
    const age = Date.now() - reading.timestamp.getTime();
    const agePenalty = Math.max(0, (age - 300000) / 3600000); // Penalty after 5 minutes
    score *= Math.max(0.5, 1 - agePenalty);

    return Math.max(0, Math.min(1, score));
  }

  private calculateOutlierScore(sensorId: string, reading: SensorReading): number {
    const historicalData = this.getHistoricalData(sensorId, 50);

    if (historicalData.length < 10) return 0; // Not enough data for outlier detection

    const values = historicalData.map(r => r.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const std = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);

    if (std === 0) return 0;

    const zScore = Math.abs((reading.value - mean) / std);

    // Convert z-score to outlier score (0-1, where 1 is most outlier-like)
    return Math.min(1, zScore / 3); // Z-score of 3+ is very outlier-like
  }

  private detectAnomalies(sensorId: string, readings: ProcessedReading[]): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = [];

    // Point anomalies (individual readings that are outliers)
    readings.forEach(reading => {
      if (reading.outlierScore > 0.7) { // High outlier score
        anomalies.push({
          readingId: `${sensorId}-${reading.timestamp.getTime()}`,
          anomalyType: 'point',
          severity: reading.outlierScore > 0.9 ? 'critical' : 'high',
          confidence: reading.outlierScore,
          description: `Outlier reading detected: ${reading.value}${reading.unit}`,
          timestamp: reading.timestamp
        });
      }
    });

    // Contextual anomalies (unusual patterns)
    const contextualAnomalies = this.detectContextualAnomalies(sensorId, readings);
    anomalies.push(...contextualAnomalies);

    // Collective anomalies (unusual group behavior)
    const collectiveAnomalies = this.detectCollectiveAnomalies(sensorId, readings);
    anomalies.push(...collectiveAnomalies);

    return anomalies;
  }

  private detectContextualAnomalies(sensorId: string, readings: ProcessedReading[]): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = [];
    const sensorType = this.getSensorType(sensorId);

    readings.forEach(reading => {
      let isAnomalous = false;
      let description = '';

      switch (sensorType) {
        case 'soil-moisture':
          if (reading.value < 5) {
            isAnomalous = true;
            description = 'Critically low soil moisture detected';
          } else if (reading.value > 90) {
            isAnomalous = true;
            description = 'Excessive soil moisture detected (possible flooding)';
          }
          break;
        case 'soil-ph':
          if (reading.value < 4 || reading.value > 9) {
            isAnomalous = true;
            description = 'Extreme soil pH detected';
          }
          break;
        case 'gas-sensor':
          if (reading.value > 100) {
            isAnomalous = true;
            description = 'Dangerous gas levels detected';
          }
          break;
      }

      if (isAnomalous) {
        anomalies.push({
          readingId: `${sensorId}-${reading.timestamp.getTime()}`,
          anomalyType: 'contextual',
          severity: 'high',
          confidence: 0.8,
          description,
          timestamp: reading.timestamp
        });
      }
    });

    return anomalies;
  }

  private detectCollectiveAnomalies(sensorId: string, readings: ProcessedReading[]): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = [];

    if (readings.length < 5) return anomalies;

    // Check for sudden spikes or drops
    const values = readings.map(r => r.value);
    const diffs = [];

    for (let i = 1; i < values.length; i++) {
      diffs.push(Math.abs(values[i] - values[i - 1]));
    }

    const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    const maxDiff = Math.max(...diffs);

    if (maxDiff > avgDiff * 3) { // Sudden change 3x greater than average
      anomalies.push({
        readingId: `${sensorId}-${readings[readings.length - 1].timestamp.getTime()}`,
        anomalyType: 'collective',
        severity: 'medium',
        confidence: 0.75,
        description: 'Sudden collective change in sensor readings detected',
        timestamp: readings[readings.length - 1].timestamp
      });
    }

    return anomalies;
  }

  private analyzeTrends(sensorId: string, readings: ProcessedReading[]): TrendAnalysis {
    if (readings.length < 3) {
      return {
        direction: 'stable',
        slope: 0,
        volatility: 0,
        seasonality: false,
        confidence: 0,
        period: 'hourly'
      };
    }

    const values = readings.map(r => r.value);
    const timestamps = readings.map(r => r.timestamp.getTime());

    // Calculate linear regression
    const n = values.length;
    const sumX = timestamps.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = timestamps.reduce((sum, x, i) => sum + x * values[i], 0);
    const sumXX = timestamps.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

    // Determine direction
    let direction: 'increasing' | 'decreasing' | 'stable' | 'fluctuating';
    if (Math.abs(slope) < 0.01) {
      direction = 'stable';
    } else if (slope > 0) {
      direction = 'increasing';
    } else {
      direction = 'decreasing';
    }

    // Calculate volatility (coefficient of variation)
    const mean = sumY / n;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const volatility = mean !== 0 ? Math.sqrt(variance) / Math.abs(mean) : 0;

    // Simple seasonality detection (basic implementation)
    const seasonality = this.detectSeasonality(values);

    return {
      direction,
      slope,
      volatility,
      seasonality,
      confidence: Math.min(1, readings.length / 24), // Confidence based on sample size
      period: 'hourly'
    };
  }

  private detectSeasonality(values: number[]): boolean {
    if (values.length < 12) return false;

    // Simple autocorrelation check for periodicity
    const autocorr = [];
    for (let lag = 1; lag < Math.min(6, values.length / 2); lag++) {
      let sum = 0;
      for (let i = lag; i < values.length; i++) {
        sum += (values[i] - values[i - lag]);
      }
      autocorr.push(Math.abs(sum) / (values.length - lag));
    }

    // If any lag shows strong correlation, consider it seasonal
    return autocorr.some(corr => corr < 0.1);
  }

  private generatePredictions(sensorId: string, readings: ProcessedReading[]): PredictiveAnalysis {
    if (readings.length < 5) {
      return {
        nextValue: readings[readings.length - 1]?.value || 0,
        confidence: 0,
        upperBound: 0,
        lowerBound: 0,
        predictionHorizon: 1,
        modelAccuracy: 0
      };
    }

    const values = readings.map(r => r.value);

    // Simple exponential smoothing prediction
    const alpha = 0.3; // Smoothing factor
    let smoothedValue = values[0];

    for (let i = 1; i < values.length; i++) {
      smoothedValue = alpha * values[i] + (1 - alpha) * smoothedValue;
    }

    // Estimate next value
    const nextValue = alpha * smoothedValue + (1 - alpha) * smoothedValue;

    // Calculate confidence bounds (simple approach)
    const recentStd = this.calculateStd(values.slice(-10));
    const upperBound = nextValue + (2 * recentStd);
    const lowerBound = nextValue - (2 * recentStd);

    return {
      nextValue,
      confidence: Math.min(1, readings.length / 50), // Confidence based on data size
      upperBound,
      lowerBound,
      predictionHorizon: 1, // 1 hour ahead
      modelAccuracy: 0.75 // Placeholder accuracy
    };
  }

  private calculateStd(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private getHistoricalData(sensorId: string, limit: number): SensorReading[] {
    // This would typically fetch from a database
    // For now, return empty array (implement based on your storage solution)
    return [];
  }

  private getSensorType(sensorId: string): string {
    // This would typically look up sensor type from database
    // For now, return a default
    return 'generic';
  }

  private getSensorAlerts(sensorId: string): SensorAlert[] {
    // This would fetch current alerts for the sensor
    return [];
  }

  private startProcessingLoop(): void {
    // Process queued data every 30 seconds
    setInterval(async () => {
      while (this.processingQueue.length > 0) {
        const batch = this.processingQueue.shift();
        if (batch) {
          try {
            await this.processSensorData(batch);
          } catch (error) {
            console.error('Error processing sensor data batch:', error);
          }
        }
      }
    }, 30000);
  }

  async queueDataForProcessing(batch: SensorDataBatch): Promise<void> {
    this.processingQueue.push(batch);
  }

  getProcessedData(sensorId: string): ProcessedSensorData | null {
    return this.processedData.get(sensorId) || null;
  }
}

export const sensorDataProcessingService = new SensorDataProcessingService();