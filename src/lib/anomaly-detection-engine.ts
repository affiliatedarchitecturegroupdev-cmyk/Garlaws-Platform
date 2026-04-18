// Advanced Anomaly Detection System for Maintenance Patterns
export interface SensorReading {
  timestamp: Date;
  equipmentId: string;
  sensorType: string; // temperature, vibration, pressure, current, etc.
  value: number;
  unit: string;
  metadata?: Record<string, any>;
}

export interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  date: Date;
  type: string;
  description: string;
  cost: number;
  duration: number;
  parts: string[];
  technician: string;
  outcome: 'successful' | 'partial' | 'failed';
}

export interface AnomalyPattern {
  id: string;
  equipmentId: string;
  type: 'sensor_anomaly' | 'maintenance_pattern' | 'performance_degradation' | 'usage_anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-1
  description: string;
  detectedAt: Date;
  indicators: Array<{
    metric: string;
    value: number;
    threshold: number;
    deviation: number;
  }>;
  recommendations: string[];
  predictedImpact: {
    downtime: number; // hours
    cost: number;
    urgency: 'immediate' | 'scheduled' | 'monitoring';
  };
  historicalContext: {
    similarIncidents: number;
    averageResolutionTime: number;
    successRate: number;
  };
}

export interface PatternAnalysis {
  equipmentId: string;
  analysisPeriod: {
    start: Date;
    end: Date;
  };
  patterns: AnomalyPattern[];
  trends: Array<{
    metric: string;
    trend: 'increasing' | 'decreasing' | 'stable' | 'erratic';
    rate: number; // change per day
    significance: number; // 0-1
  }>;
  predictions: Array<{
    type: string;
    probability: number;
    timeToEvent: number; // days
    confidence: number;
  }>;
  healthScore: number; // 0-100
  riskAssessment: 'low' | 'medium' | 'high' | 'critical';
}

class AnomalyDetectionEngine {
  private sensorData: Map<string, SensorReading[]> = new Map();
  private maintenanceRecords: Map<string, MaintenanceRecord[]> = new Map();
  private baselineModels: Map<string, any> = new Map();

  // Statistical thresholds for anomaly detection
  private readonly THRESHOLDS = {
    z_score: 3, // Standard deviations for outlier detection
    trend_significance: 0.7, // Minimum correlation for trend detection
    pattern_confidence: 0.8, // Minimum confidence for pattern recognition
    degradation_threshold: 0.15, // 15% performance degradation
  };

  // Add sensor reading to analysis pipeline
  addSensorReading(reading: SensorReading): void {
    if (!this.sensorData.has(reading.equipmentId)) {
      this.sensorData.set(reading.equipmentId, []);
    }

    const readings = this.sensorData.get(reading.equipmentId)!;
    readings.push(reading);

    // Keep only last 1000 readings per equipment (rolling window)
    if (readings.length > 1000) {
      readings.shift();
    }

    // Trigger real-time analysis if critical thresholds are approached
    this.checkRealTimeAnomalies(reading);
  }

  // Add maintenance record for pattern analysis
  addMaintenanceRecord(record: MaintenanceRecord): void {
    if (!this.maintenanceRecords.has(record.equipmentId)) {
      this.maintenanceRecords.set(record.equipmentId, []);
    }

    this.maintenanceRecords.get(record.equipmentId)!.push(record);
  }

  // Comprehensive pattern analysis for equipment
  async analyzePatterns(equipmentId: string, daysBack: number = 30): Promise<PatternAnalysis> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - daysBack * 24 * 60 * 60 * 1000);

    const sensorReadings = this.getSensorReadingsInRange(equipmentId, startDate, endDate);
    const maintenanceRecords = this.getMaintenanceRecordsInRange(equipmentId, startDate, endDate);

    // Build or update baseline model
    const baselineModel = this.buildBaselineModel(sensorReadings);

    // Detect various types of anomalies
    const anomalies = [
      ...this.detectSensorAnomalies(sensorReadings, baselineModel),
      ...this.detectMaintenancePatterns(maintenanceRecords),
      ...this.detectPerformanceDegradation(sensorReadings, baselineModel),
      ...this.detectUsageAnomalies(sensorReadings, maintenanceRecords),
    ];

    // Analyze trends
    const trends = this.analyzeTrends(sensorReadings);

    // Generate predictions
    const predictions = this.generatePredictions(sensorReadings, maintenanceRecords, anomalies);

    // Calculate overall health score
    const healthScore = this.calculateHealthScore(sensorReadings, maintenanceRecords, anomalies);

    // Assess risk level
    const riskAssessment = this.assessRiskLevel(healthScore, anomalies, predictions);

    return {
      equipmentId,
      analysisPeriod: { start: startDate, end: endDate },
      patterns: anomalies,
      trends,
      predictions,
      healthScore,
      riskAssessment,
    };
  }

  // Real-time anomaly checking for immediate alerts
  private checkRealTimeAnomalies(reading: SensorReading): void {
    const baseline = this.baselineModels.get(reading.equipmentId);
    if (!baseline) return;

    const sensorBaseline = baseline[reading.sensorType];
    if (!sensorBaseline) return;

    // Check for critical deviations
    const zScore = Math.abs((reading.value - sensorBaseline.mean) / sensorBaseline.std);
    if (zScore > this.THRESHOLDS.z_score) {
      const anomaly: AnomalyPattern = {
        id: `anomaly_${Date.now()}`,
        equipmentId: reading.equipmentId,
        type: 'sensor_anomaly',
        severity: zScore > 5 ? 'critical' : zScore > 4 ? 'high' : 'medium',
        confidence: Math.min(zScore / 6, 0.95),
        description: `${reading.sensorType} reading of ${reading.value}${reading.unit} is ${zScore.toFixed(1)} standard deviations from normal`,
        detectedAt: new Date(),
        indicators: [{
          metric: reading.sensorType,
          value: reading.value,
          threshold: sensorBaseline.mean,
          deviation: zScore,
        }],
        recommendations: [
          'Check equipment immediately',
          'Compare with manual readings',
          'Review recent maintenance history',
          'Consider emergency shutdown if critical'
        ],
        predictedImpact: {
          downtime: zScore > 4 ? 8 : 2,
          cost: zScore > 4 ? 5000 : 1000,
          urgency: zScore > 4 ? 'immediate' : 'scheduled',
        },
        historicalContext: {
          similarIncidents: this.countSimilarIncidents(reading.equipmentId, reading.sensorType),
          averageResolutionTime: 4,
          successRate: 0.85,
        },
      };

      // In real app, trigger alert/notification
      console.warn('Real-time anomaly detected:', anomaly);
    }
  }

  // Detect statistical anomalies in sensor data
  private detectSensorAnomalies(readings: SensorReading[], baseline: any): AnomalyPattern[] {
    const anomalies: AnomalyPattern[] = [];
    const sensorGroups = this.groupReadingsBySensor(readings);

    for (const [sensorType, sensorReadings] of sensorGroups) {
      const sensorBaseline = baseline[sensorType];
      if (!sensorBaseline) continue;

      // Check each reading for anomalies
      sensorReadings.forEach(reading => {
        const zScore = Math.abs((reading.value - sensorBaseline.mean) / sensorBaseline.std);

        if (zScore > 2.5) { // Moderate anomaly threshold
          anomalies.push({
            id: `sensor_anomaly_${reading.timestamp.getTime()}`,
            equipmentId: reading.equipmentId,
            type: 'sensor_anomaly',
            severity: zScore > 4 ? 'high' : zScore > 3 ? 'medium' : 'low',
            confidence: Math.min(zScore / 4, 0.9),
            description: `Unusual ${sensorType} reading: ${reading.value}${reading.unit}`,
            detectedAt: reading.timestamp,
            indicators: [{
              metric: sensorType,
              value: reading.value,
              threshold: sensorBaseline.mean,
              deviation: zScore,
            }],
            recommendations: [
              'Monitor closely',
              'Check calibration',
              'Review environmental factors',
              'Schedule inspection if pattern continues'
            ],
            predictedImpact: {
              downtime: zScore > 3 ? 4 : 1,
              cost: zScore > 3 ? 2000 : 500,
              urgency: 'monitoring',
            },
            historicalContext: {
              similarIncidents: this.countSimilarIncidents(reading.equipmentId, sensorType),
              averageResolutionTime: 2,
              successRate: 0.9,
            },
          });
        }
      });
    }

    return anomalies;
  }

  // Detect patterns in maintenance records
  private detectMaintenancePatterns(records: MaintenanceRecord[]): AnomalyPattern[] {
    const anomalies: AnomalyPattern[] = [];

    if (records.length < 3) return anomalies;

    // Check for increasing maintenance frequency
    const maintenanceFrequency = this.calculateMaintenanceFrequency(records);
    if (maintenanceFrequency > 2) { // More than 2 maintenances per month on average
      anomalies.push({
        id: `maintenance_pattern_${Date.now()}`,
        equipmentId: records[0].equipmentId,
        type: 'maintenance_pattern',
        severity: maintenanceFrequency > 4 ? 'high' : 'medium',
        confidence: 0.85,
        description: `High maintenance frequency: ${maintenanceFrequency.toFixed(1)} services per month`,
        detectedAt: new Date(),
        indicators: [{
          metric: 'maintenance_frequency',
          value: maintenanceFrequency,
          threshold: 2,
          deviation: maintenanceFrequency - 2,
        }],
        recommendations: [
          'Review maintenance procedures',
          'Consider equipment replacement',
          'Investigate root cause',
          'Implement preventive maintenance'
        ],
        predictedImpact: {
          downtime: maintenanceFrequency * 2,
          cost: maintenanceFrequency * 1000,
          urgency: 'scheduled',
        },
        historicalContext: {
          similarIncidents: 0,
          averageResolutionTime: 30,
          successRate: 0.7,
        },
      });
    }

    // Check for repeated failure types
    const failurePatterns = this.analyzeFailurePatterns(records);
    if (failurePatterns.repeatedFailures > 2) {
      anomalies.push({
        id: `repeated_failure_${Date.now()}`,
        equipmentId: records[0].equipmentId,
        type: 'maintenance_pattern',
        severity: 'high',
        confidence: 0.9,
        description: `Repeated ${failurePatterns.commonFailure} failures (${failurePatterns.repeatedFailures} incidents)`,
        detectedAt: new Date(),
        indicators: [{
          metric: 'repeated_failures',
          value: failurePatterns.repeatedFailures,
          threshold: 2,
          deviation: failurePatterns.repeatedFailures - 2,
        }],
        recommendations: [
          'Address root cause of repeated failures',
          'Review repair quality',
          'Consider specialized technician',
          'Implement monitoring for this failure type'
        ],
        predictedImpact: {
          downtime: failurePatterns.repeatedFailures * 4,
          cost: failurePatterns.repeatedFailures * 1500,
          urgency: 'immediate',
        },
        historicalContext: {
          similarIncidents: failurePatterns.repeatedFailures,
          averageResolutionTime: 14,
          successRate: 0.6,
        },
      });
    }

    return anomalies;
  }

  // Detect performance degradation over time
  private detectPerformanceDegradation(readings: SensorReading[], baseline: any): AnomalyPattern[] {
    const anomalies: AnomalyPattern[] = [];

    // Group readings by sensor type and time
    const sensorGroups = this.groupReadingsBySensor(readings);

    for (const [sensorType, sensorReadings] of sensorGroups) {
      if (sensorReadings.length < 10) continue;

      // Calculate trend
      const trend = this.calculateTrend(sensorReadings);
      const degradationThreshold = this.THRESHOLDS.degradation_threshold;

      // Check for concerning trends
      if (sensorType === 'efficiency' && trend.slope < -degradationThreshold) {
        anomalies.push({
          id: `degradation_${sensorType}_${Date.now()}`,
          equipmentId: sensorReadings[0].equipmentId,
          type: 'performance_degradation',
          severity: Math.abs(trend.slope) > degradationThreshold * 2 ? 'high' : 'medium',
          confidence: trend.significance,
          description: `${sensorType} performance degrading at ${(Math.abs(trend.slope) * 100).toFixed(1)}% per day`,
          detectedAt: new Date(),
          indicators: [{
            metric: `${sensorType}_trend`,
            value: trend.slope,
            threshold: -degradationThreshold,
            deviation: Math.abs(trend.slope) + degradationThreshold,
          }],
          recommendations: [
            'Monitor performance closely',
            'Schedule efficiency optimization',
            'Check for underlying issues',
            'Consider calibration or tune-up'
          ],
          predictedImpact: {
            downtime: Math.abs(trend.slope) > degradationThreshold * 2 ? 6 : 2,
            cost: Math.abs(trend.slope) > degradationThreshold * 2 ? 3000 : 800,
            urgency: 'scheduled',
          },
          historicalContext: {
            similarIncidents: 0,
            averageResolutionTime: 7,
            successRate: 0.8,
          },
        });
      }
    }

    return anomalies;
  }

  // Detect unusual usage patterns
  private detectUsageAnomalies(sensorReadings: SensorReading[], maintenanceRecords: MaintenanceRecord[]): AnomalyPattern[] {
    const anomalies: AnomalyPattern[] = [];

    // Analyze usage patterns by time of day/week
    const usagePatterns = this.analyzeUsagePatterns(sensorReadings);

    // Check for unusual operating hours
    if (usagePatterns.offHoursUsage > 0.3) { // More than 30% usage outside normal hours
      anomalies.push({
        id: `usage_anomaly_hours_${Date.now()}`,
        equipmentId: sensorReadings[0]?.equipmentId || '',
        type: 'usage_anomaly',
        severity: usagePatterns.offHoursUsage > 0.5 ? 'medium' : 'low',
        confidence: 0.75,
        description: `${(usagePatterns.offHoursUsage * 100).toFixed(0)}% of usage occurs outside normal operating hours`,
        detectedAt: new Date(),
        indicators: [{
          metric: 'off_hours_usage',
          value: usagePatterns.offHoursUsage,
          threshold: 0.3,
          deviation: usagePatterns.offHoursUsage - 0.3,
        }],
        recommendations: [
          'Review usage patterns',
          'Check for unauthorized usage',
          'Consider access controls',
          'Optimize operating schedule'
        ],
        predictedImpact: {
          downtime: 0,
          cost: usagePatterns.offHoursUsage * 500,
          urgency: 'monitoring',
        },
        historicalContext: {
          similarIncidents: 0,
          averageResolutionTime: 3,
          successRate: 0.95,
        },
      });
    }

    // Check for unusual maintenance timing
    if (maintenanceRecords.length > 0) {
      const maintenancePatterns = this.analyzeMaintenanceTiming(maintenanceRecords);
      if (maintenancePatterns.emergencyRate > 0.4) { // More than 40% emergency maintenance
        anomalies.push({
          id: `maintenance_timing_anomaly_${Date.now()}`,
          equipmentId: maintenanceRecords[0].equipmentId,
          type: 'usage_anomaly',
          severity: 'high',
          confidence: 0.85,
          description: `${(maintenancePatterns.emergencyRate * 100).toFixed(0)}% of maintenance is performed as emergencies`,
          detectedAt: new Date(),
          indicators: [{
            metric: 'emergency_maintenance_rate',
            value: maintenancePatterns.emergencyRate,
            threshold: 0.4,
            deviation: maintenancePatterns.emergencyRate - 0.4,
          }],
          recommendations: [
            'Implement preventive maintenance schedule',
            'Improve monitoring and early detection',
            'Review maintenance planning',
            'Consider equipment upgrade'
          ],
          predictedImpact: {
            downtime: maintenancePatterns.emergencyRate * 12,
            cost: maintenancePatterns.emergencyRate * 2000,
            urgency: 'immediate',
          },
          historicalContext: {
            similarIncidents: Math.floor(maintenancePatterns.emergencyRate * 10),
            averageResolutionTime: 21,
            successRate: 0.75,
          },
        });
      }
    }

    return anomalies;
  }

  // Helper methods
  private getSensorReadingsInRange(equipmentId: string, start: Date, end: Date): SensorReading[] {
    const allReadings = this.sensorData.get(equipmentId) || [];
    return allReadings.filter(reading =>
      reading.timestamp >= start && reading.timestamp <= end
    );
  }

  private getMaintenanceRecordsInRange(equipmentId: string, start: Date, end: Date): MaintenanceRecord[] {
    const allRecords = this.maintenanceRecords.get(equipmentId) || [];
    return allRecords.filter(record =>
      record.date >= start && record.date <= end
    );
  }

  private buildBaselineModel(readings: SensorReading[]): any {
    const sensorGroups = this.groupReadingsBySensor(readings);
    const baseline: any = {};

    for (const [sensorType, sensorReadings] of sensorGroups) {
      if (sensorReadings.length < 10) continue; // Need minimum data for baseline

      const values = sensorReadings.map(r => r.value);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
      const std = Math.sqrt(variance);

      baseline[sensorType] = {
        mean,
        std,
        min: Math.min(...values),
        max: Math.max(...values),
        sampleSize: values.length,
        lastUpdated: new Date(),
      };
    }

    return baseline;
  }

  private groupReadingsBySensor(readings: SensorReading[]): Map<string, SensorReading[]> {
    const groups = new Map<string, SensorReading[]>();

    readings.forEach(reading => {
      if (!groups.has(reading.sensorType)) {
        groups.set(reading.sensorType, []);
      }
      groups.get(reading.sensorType)!.push(reading);
    });

    return groups;
  }

  private calculateTrend(readings: SensorReading[]): { slope: number; significance: number; direction: string } {
    if (readings.length < 5) return { slope: 0, significance: 0, direction: 'stable' };

    // Simple linear regression
    const n = readings.length;
    const timestamps = readings.map(r => r.timestamp.getTime());
    const values = readings.map(r => r.value);

    const sumX = timestamps.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = timestamps.reduce((sum, x, i) => sum + x * values[i], 0);
    const sumXX = timestamps.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R-squared for significance
    const yMean = sumY / n;
    const ssRes = values.reduce((sum, y, i) => {
      const predicted = slope * timestamps[i] + intercept;
      return sum + Math.pow(y - predicted, 2);
    }, 0);
    const ssTot = values.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
    const rSquared = 1 - (ssRes / ssTot);

    return {
      slope,
      significance: Math.abs(rSquared),
      direction: slope > 0.01 ? 'increasing' : slope < -0.01 ? 'decreasing' : 'stable'
    };
  }

  private analyzeTrends(readings: SensorReading[]): Array<{
    metric: string;
    trend: 'increasing' | 'decreasing' | 'stable' | 'erratic';
    rate: number;
    significance: number;
  }> {
    const sensorGroups = this.groupReadingsBySensor(readings);
    const trends = [];

    for (const [sensorType, sensorReadings] of sensorGroups) {
      const trend = this.calculateTrend(sensorReadings);

      trends.push({
        metric: sensorType,
        trend: trend.significance > this.THRESHOLDS.trend_significance
          ? (trend.direction as any)
          : 'stable',
        rate: trend.slope,
        significance: trend.significance,
      });
    }

    return trends;
  }

  private generatePredictions(
    readings: SensorReading[],
    maintenance: MaintenanceRecord[],
    anomalies: AnomalyPattern[]
  ): Array<{
    type: string;
    probability: number;
    timeToEvent: number;
    confidence: number;
  }> {
    const predictions = [];

    // Predict maintenance needs based on patterns
    if (maintenance.length > 0) {
      const avgInterval = this.calculateAverageMaintenanceInterval(maintenance);
      const lastMaintenance = maintenance[maintenance.length - 1].date;
      const daysSinceLast = (Date.now() - lastMaintenance.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceLast > avgInterval * 0.8) { // 80% of average interval
        predictions.push({
          type: 'maintenance_due',
          probability: Math.min(daysSinceLast / avgInterval, 0.9),
          timeToEvent: Math.max(0, avgInterval - daysSinceLast),
          confidence: 0.7,
        });
      }
    }

    // Predict failures based on anomaly patterns
    const criticalAnomalies = anomalies.filter(a => a.severity === 'critical').length;
    if (criticalAnomalies > 0) {
      predictions.push({
        type: 'equipment_failure',
        probability: Math.min(criticalAnomalies * 0.3, 0.8),
        timeToEvent: Math.max(1, 30 - criticalAnomalies * 5), // Days
        confidence: 0.6,
      });
    }

    return predictions;
  }

  private calculateHealthScore(
    readings: SensorReading[],
    maintenance: MaintenanceRecord[],
    anomalies: AnomalyPattern[]
  ): number {
    let score = 100;

    // Deduct for anomalies
    const anomalyScore = anomalies.reduce((sum, anomaly) => {
      const severityMultiplier = { low: 2, medium: 5, high: 10, critical: 20 };
      return sum + severityMultiplier[anomaly.severity] * anomaly.confidence;
    }, 0);
    score -= Math.min(anomalyScore, 40);

    // Deduct for frequent maintenance
    if (maintenance.length > 5) {
      const maintenancePenalty = Math.min((maintenance.length - 5) * 3, 20);
      score -= maintenancePenalty;
    }

    // Bonus for consistent readings (low variance)
    const sensorGroups = this.groupReadingsBySensor(readings);
    let consistencyBonus = 0;
    sensorGroups.forEach(readings => {
      if (readings.length > 10) {
        const values = readings.map(r => r.value);
        const variance = this.calculateVariance(values);
        const coefficientOfVariation = Math.sqrt(variance) / (values.reduce((a, b) => a + b, 0) / values.length);
        if (coefficientOfVariation < 0.1) { // Low variation = consistent = good
          consistencyBonus += 5;
        }
      }
    });
    score += Math.min(consistencyBonus, 15);

    return Math.max(0, Math.min(100, score));
  }

  private assessRiskLevel(healthScore: number, anomalies: AnomalyPattern[], predictions: any[]): 'low' | 'medium' | 'high' | 'critical' {
    const criticalAnomalies = anomalies.filter(a => a.severity === 'critical').length;
    const highAnomalies = anomalies.filter(a => a.severity === 'high').length;
    const failurePredictions = predictions.filter(p => p.type === 'equipment_failure' && p.probability > 0.5).length;

    if (healthScore < 30 || criticalAnomalies > 0 || failurePredictions > 0) return 'critical';
    if (healthScore < 50 || highAnomalies > 2) return 'high';
    if (healthScore < 70 || highAnomalies > 0) return 'medium';
    return 'low';
  }

  // Utility methods
  private countSimilarIncidents(equipmentId: string, sensorType: string): number {
    // In real implementation, query historical incident database
    return Math.floor(Math.random() * 5);
  }

  private calculateMaintenanceFrequency(records: MaintenanceRecord[]): number {
    if (records.length < 2) return 0;

    const sortedRecords = records.sort((a, b) => a.date.getTime() - b.date.getTime());
    const totalDays = (sortedRecords[sortedRecords.length - 1].date.getTime() - sortedRecords[0].date.getTime()) / (1000 * 60 * 60 * 24);
    const months = totalDays / 30;

    return records.length / months;
  }

  private analyzeFailurePatterns(records: MaintenanceRecord[]): { commonFailure: string; repeatedFailures: number } {
    const failureTypes = records.map(r => r.type);
    const failureCount: Record<string, number> = {};

    failureTypes.forEach(type => {
      failureCount[type] = (failureCount[type] || 0) + 1;
    });

    const mostCommon = Object.entries(failureCount)
      .sort(([, a], [, b]) => b - a)[0];

    return {
      commonFailure: mostCommon ? mostCommon[0] : 'unknown',
      repeatedFailures: mostCommon ? mostCommon[1] : 0,
    };
  }

  private calculateAverageMaintenanceInterval(records: MaintenanceRecord[]): number {
    if (records.length < 2) return 90; // Default 90 days

    const sortedRecords = records.sort((a, b) => a.date.getTime() - b.date.getTime());
    const intervals = [];

    for (let i = 1; i < sortedRecords.length; i++) {
      const interval = (sortedRecords[i].date.getTime() - sortedRecords[i - 1].date.getTime()) / (1000 * 60 * 60 * 24);
      intervals.push(interval);
    }

    return intervals.reduce((a, b) => a + b, 0) / intervals.length;
  }

  private analyzeUsagePatterns(readings: SensorReading[]): { offHoursUsage: number; peakUsage: string } {
    // Simple analysis - in real implementation, use more sophisticated methods
    const businessHours = readings.filter(r => {
      const hour = r.timestamp.getHours();
      return hour >= 8 && hour <= 17; // 8 AM to 5 PM
    });

    const offHours = readings.filter(r => {
      const hour = r.timestamp.getHours();
      return hour < 8 || hour > 17;
    });

    const totalUsage = readings.length;
    const offHoursUsage = totalUsage > 0 ? offHours.length / totalUsage : 0;

    return {
      offHoursUsage,
      peakUsage: 'business_hours', // Simplified
    };
  }

  private analyzeMaintenanceTiming(records: MaintenanceRecord[]): { emergencyRate: number; avgResponseTime: number } {
    const emergencyCount = records.filter(r => r.description.toLowerCase().includes('emergency')).length;
    const emergencyRate = records.length > 0 ? emergencyCount / records.length : 0;

    // Simplified response time calculation
    const avgResponseTime = records.length > 0
      ? records.reduce((sum, r) => sum + r.duration, 0) / records.length
      : 0;

    return {
      emergencyRate,
      avgResponseTime,
    };
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }
}

export const anomalyDetectionEngine = new AnomalyDetectionEngine();