// Advanced AI Service for Predictive Maintenance and Analytics
export interface EquipmentData {
  equipmentId: string;
  type: string;
  readings: Array<{
    timestamp: Date;
    temperature?: number;
    vibration?: number;
    pressure?: number;
    current?: number;
    voltage?: number;
    noise?: number;
    customMetrics?: Record<string, number>;
  }>;
  location: string;
  installationDate: Date;
  lastMaintenance: Date;
  maintenanceHistory: Array<{
    date: Date;
    type: string;
    cost: number;
    duration: number;
    parts: string[];
  }>;
}

export interface PredictionResult {
  equipmentId: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  probability: number; // 0-1
  predictedFailureDate?: Date;
  recommendedAction: string;
  urgency: 'immediate' | 'scheduled' | 'monitoring';
  confidence: number; // 0-1
  factors: Array<{
    factor: string;
    impact: number;
    description: string;
  }>;
}

interface MaintenanceSchedule {
  equipmentId: string;
  scheduledDate: Date;
  maintenanceType: string;
  estimatedCost: number;
  estimatedDuration: number;
  priority: number;
  reasoning: string;
}

class PredictiveMaintenanceAI {
  private equipmentModels: Map<string, any> = new Map();
  private baselineMetrics: Map<string, any> = new Map();

  // Train models on historical equipment data
  async trainModel(equipmentType: string, historicalData: EquipmentData[]): Promise<void> {
    // In a real implementation, this would use TensorFlow.js or similar
    // For now, we'll implement a simplified statistical model

    const baseline = this.calculateBaselineMetrics(historicalData);
    this.baselineMetrics.set(equipmentType, baseline);

    // Create prediction model based on equipment type
    const model = this.createPredictionModel(equipmentType, baseline);
    this.equipmentModels.set(equipmentType, model);

    console.log(`Trained predictive model for ${equipmentType}`);
  }

  // Analyze current equipment readings and predict maintenance needs
  async analyzeEquipment(equipment: EquipmentData): Promise<PredictionResult> {
    const model = this.equipmentModels.get(equipment.type);
    const baseline = this.baselineMetrics.get(equipment.type);

    if (!model || !baseline) {
      return {
        equipmentId: equipment.equipmentId,
        riskLevel: 'medium',
        probability: 0.5,
        recommendedAction: 'Schedule regular inspection',
        urgency: 'scheduled',
        confidence: 0.3,
        factors: [{
          factor: 'insufficient_data',
          impact: 0.5,
          description: 'Not enough historical data for accurate prediction'
        }]
      };
    }

    const analysis = this.performAnalysis(equipment, baseline);
    return this.generatePredictionResult(equipment, analysis);
  }

  // Generate maintenance schedule based on predictions
  async generateMaintenanceSchedule(equipment: EquipmentData[]): Promise<MaintenanceSchedule[]> {
    const schedules: MaintenanceSchedule[] = [];

    for (const eq of equipment) {
      const prediction = await this.analyzeEquipment(eq);

      if (prediction.urgency !== 'monitoring') {
        const schedule = this.createMaintenanceSchedule(eq, prediction);
        schedules.push(schedule);
      }
    }

    // Optimize schedule to minimize downtime and costs
    return this.optimizeSchedule(schedules);
  }

  // Detect anomalies in equipment readings
  detectAnomalies(readings: EquipmentData['readings'], baseline: any): Array<{
    timestamp: Date;
    anomalyType: string;
    severity: number;
    description: string;
  }> {
    const anomalies = [];

    for (const reading of readings) {
      // Check temperature anomalies
      if (reading.temperature && baseline.temperature) {
        const tempDeviation = Math.abs(reading.temperature - baseline.temperature.mean) / baseline.temperature.std;
        if (tempDeviation > 3) {
          anomalies.push({
            timestamp: reading.timestamp,
            anomalyType: 'temperature_spike',
            severity: Math.min(tempDeviation / 5, 1),
            description: `Temperature ${reading.temperature}°C is ${tempDeviation.toFixed(1)} standard deviations from normal`
          });
        }
      }

      // Check vibration anomalies
      if (reading.vibration && baseline.vibration) {
        const vibDeviation = Math.abs(reading.vibration - baseline.vibration.mean) / baseline.vibration.std;
        if (vibDeviation > 2.5) {
          anomalies.push({
            timestamp: reading.timestamp,
            anomalyType: 'excessive_vibration',
            severity: Math.min(vibDeviation / 4, 1),
            description: `Vibration level ${reading.vibration} is unusually high`
          });
        }
      }

      // Check current anomalies (indicates motor issues)
      if (reading.current && baseline.current) {
        const currentDeviation = Math.abs(reading.current - baseline.current.mean) / baseline.current.std;
        if (currentDeviation > 2) {
          anomalies.push({
            timestamp: reading.timestamp,
            anomalyType: 'current_fluctuation',
            severity: Math.min(currentDeviation / 3, 1),
            description: `Current draw ${reading.current}A shows abnormal patterns`
          });
        }
      }
    }

    return anomalies;
  }

  private calculateBaselineMetrics(historicalData: EquipmentData[]): Record<string, { values: number[]; mean: number; std: number }> {
    const metrics: Record<string, { values: number[]; mean: number; std: number }> = {
      temperature: { values: [], mean: 0, std: 0 },
      vibration: { values: [], mean: 0, std: 0 },
      pressure: { values: [], mean: 0, std: 0 },
      current: { values: [], mean: 0, std: 0 },
      voltage: { values: [], mean: 0, std: 0 },
      noise: { values: [], mean: 0, std: 0 }
    };

    // Collect all readings
    for (const equipment of historicalData) {
      for (const reading of equipment.readings) {
        if (reading.temperature !== undefined) metrics.temperature.values.push(reading.temperature);
        if (reading.vibration !== undefined) metrics.vibration.values.push(reading.vibration);
        if (reading.pressure !== undefined) metrics.pressure.values.push(reading.pressure);
        if (reading.current !== undefined) metrics.current.values.push(reading.current);
        if (reading.voltage !== undefined) metrics.voltage.values.push(reading.voltage);
        if (reading.noise !== undefined) metrics.noise.values.push(reading.noise);
      }
    }

    // Calculate means and standard deviations
    Object.keys(metrics).forEach(key => {
      const values = metrics[key].values;
      if (values.length > 0) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
        const std = Math.sqrt(variance);

        metrics[key].mean = mean;
        metrics[key].std = std;
      }
    });

    return metrics;
  }

  private createPredictionModel(equipmentType: string, baseline: any): { critical_threshold: number; warning_threshold: number; factors: string[] } {
    // Simplified model based on equipment type
    const models: Record<string, { critical_threshold: number; warning_threshold: number; factors: string[] }> = {
      'HVAC': {
        critical_threshold: 0.8,
        warning_threshold: 0.6,
        factors: ['temperature', 'current', 'pressure']
      },
      'pump': {
        critical_threshold: 0.75,
        warning_threshold: 0.55,
        factors: ['vibration', 'current', 'pressure']
      },
      'motor': {
        critical_threshold: 0.7,
        warning_threshold: 0.5,
        factors: ['current', 'voltage', 'temperature', 'vibration']
      },
      'generator': {
        critical_threshold: 0.85,
        warning_threshold: 0.65,
        factors: ['voltage', 'current', 'temperature', 'noise']
      }
    };

    return models[equipmentType] || {
      critical_threshold: 0.75,
      warning_threshold: 0.5,
      factors: ['temperature', 'vibration', 'current']
    };
  }

  private performAnalysis(equipment: EquipmentData, baseline: any): any {
    const model = this.equipmentModels.get(equipment.type);
    const latestReading = equipment.readings[equipment.readings.length - 1];

    if (!latestReading) return { riskScore: 0 };

    let riskScore = 0;
    const factors: Array<{ factor: string; value: number; deviation: string; risk: number }> = [];

    // Analyze each factor
    model.factors.forEach((factor: string) => {
      if (latestReading[factor as keyof typeof latestReading] !== undefined && baseline[factor]) {
        const value = latestReading[factor as keyof typeof latestReading] as number;
        const mean = baseline[factor].mean;
        const std = baseline[factor].std;

        if (std > 0) {
          const deviation = Math.abs(value - mean) / std;
          const factorRisk = Math.min(deviation / 3, 1); // Normalize to 0-1

          riskScore += factorRisk;

          factors.push({
            factor,
            value,
            deviation: deviation.toFixed(2),
            risk: factorRisk
          });
        }
      }
    });

    // Age factor
    const ageInYears = (Date.now() - equipment.installationDate.getTime()) / (365 * 24 * 60 * 60 * 1000);
    const ageRisk = Math.min(ageInYears / 10, 0.3); // Max 30% risk from age
    riskScore += ageRisk;

    // Maintenance overdue factor
    const daysSinceMaintenance = (Date.now() - equipment.lastMaintenance.getTime()) / (24 * 60 * 60 * 1000);
    const maintenanceRisk = Math.min(daysSinceMaintenance / 365, 0.4); // Max 40% risk if overdue by 1 year
    riskScore += maintenanceRisk;

    return {
      riskScore: Math.min(riskScore, 1),
      factors,
      ageRisk,
      maintenanceRisk
    };
  }

  private generatePredictionResult(equipment: EquipmentData, analysis: any): PredictionResult {
    const { riskScore } = analysis;
    const model = this.equipmentModels.get(equipment.type);

    let riskLevel: PredictionResult['riskLevel'];
    let urgency: PredictionResult['urgency'];
    let recommendedAction: string;

    if (riskScore >= model.critical_threshold) {
      riskLevel = 'critical';
      urgency = 'immediate';
      recommendedAction = 'Immediate maintenance required - shut down equipment if safe';
    } else if (riskScore >= model.warning_threshold) {
      riskLevel = 'high';
      urgency = 'scheduled';
      recommendedAction = 'Schedule maintenance within 1 week';
    } else if (riskScore >= 0.3) {
      riskLevel = 'medium';
      urgency = 'scheduled';
      recommendedAction = 'Schedule maintenance within 1 month';
    } else {
      riskLevel = 'low';
      urgency = 'monitoring';
      recommendedAction = 'Continue monitoring - no action required';
    }

    // Estimate failure date (simplified)
    let predictedFailureDate: Date | undefined;
    if (riskScore > 0.5) {
      const daysToFailure = Math.max(1, Math.floor((1 - riskScore) * 90)); // Up to 90 days
      predictedFailureDate = new Date(Date.now() + daysToFailure * 24 * 60 * 60 * 1000);
    }

    const factors = analysis.factors.map((f: { factor: string; value: number; deviation: string; risk: number }) => ({
      factor: f.factor,
      impact: f.risk,
      description: `${f.factor} reading ${f.value} is ${f.deviation} standard deviations from normal`
    }));

    if (analysis.ageRisk > 0) {
      factors.push({
        factor: 'equipment_age',
        impact: analysis.ageRisk,
        description: `Equipment age contributes to ${Math.round(analysis.ageRisk * 100)}% risk`
      });
    }

    if (analysis.maintenanceRisk > 0) {
      factors.push({
        factor: 'maintenance_overdue',
        impact: analysis.maintenanceRisk,
        description: `Overdue maintenance contributes to ${Math.round(analysis.maintenanceRisk * 100)}% risk`
      });
    }

    return {
      equipmentId: equipment.equipmentId,
      riskLevel,
      probability: riskScore,
      predictedFailureDate,
      recommendedAction,
      urgency,
      confidence: Math.min(0.9, riskScore + 0.1), // Simplified confidence calculation
      factors
    };
  }

  private createMaintenanceSchedule(equipment: EquipmentData, prediction: PredictionResult): MaintenanceSchedule {
    const baseSchedule = {
      equipmentId: equipment.equipmentId,
      maintenanceType: this.determineMaintenanceType(equipment.type, prediction),
      estimatedCost: this.estimateMaintenanceCost(equipment.type, prediction),
      estimatedDuration: this.estimateMaintenanceDuration(equipment.type, prediction),
      priority: this.calculatePriority(prediction),
      reasoning: prediction.recommendedAction
    };

    // Schedule based on urgency
    let scheduledDate: Date;
    switch (prediction.urgency) {
      case 'immediate':
        scheduledDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
        break;
      case 'scheduled':
        scheduledDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Next week
        break;
      default:
        scheduledDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Next month
    }

    return {
      ...baseSchedule,
      scheduledDate
    };
  }

  private optimizeSchedule(schedules: MaintenanceSchedule[]): MaintenanceSchedule[] {
    // Group by date and provider availability
    const optimized: MaintenanceSchedule[] = [];
    const dateGroups = new Map<string, MaintenanceSchedule[]>();

    // Group by week
    schedules.forEach(schedule => {
      const weekKey = `${schedule.scheduledDate.getFullYear()}-${this.getWeekNumber(schedule.scheduledDate)}`;
      if (!dateGroups.has(weekKey)) {
        dateGroups.set(weekKey, []);
      }
      dateGroups.get(weekKey)!.push(schedule);
    });

    // Optimize each group
    dateGroups.forEach(group => {
      if (group.length > 1) {
        // Sort by priority and reschedule lower priority items
        group.sort((a, b) => b.priority - a.priority);

        group.forEach((schedule, index) => {
          if (index > 0) {
            // Delay lower priority items by a few days
            schedule.scheduledDate = new Date(schedule.scheduledDate.getTime() + (index * 2 * 24 * 60 * 60 * 1000));
          }
        });
      }

      optimized.push(...group);
    });

    return optimized.sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());
  }

  private determineMaintenanceType(equipmentType: string, prediction: PredictionResult): string {
    if (prediction.riskLevel === 'critical') return 'Emergency Repair';
    if (prediction.factors.some(f => f.factor === 'temperature')) return 'Cooling System Service';
    if (prediction.factors.some(f => f.factor === 'vibration')) return 'Vibration Analysis & Balancing';
    if (prediction.factors.some(f => f.factor === 'current')) return 'Electrical System Check';
    return 'General Maintenance';
  }

  private estimateMaintenanceCost(equipmentType: string, prediction: PredictionResult): number {
    const baseCosts: Record<string, number> = {
      'HVAC': 2500,
      'pump': 1800,
      'motor': 1200,
      'generator': 3500
    };

    const baseCost = baseCosts[equipmentType] || 1500;

    // Increase cost based on risk level
    const multipliers = {
      'low': 1,
      'medium': 1.2,
      'high': 1.5,
      'critical': 2
    };

    return Math.round(baseCost * multipliers[prediction.riskLevel]);
  }

  private estimateMaintenanceDuration(equipmentType: string, prediction: PredictionResult): number {
    const baseDurations: Record<string, number> = {
      'HVAC': 4,
      'pump': 2,
      'motor': 1,
      'generator': 6
    };

    const baseDuration = baseDurations[equipmentType] || 3;

    // Increase duration based on risk level
    const multipliers = {
      'low': 1,
      'medium': 1.3,
      'high': 1.6,
      'critical': 2
    };

    return Math.round(baseDuration * multipliers[prediction.riskLevel]);
  }

  private calculatePriority(prediction: PredictionResult): number {
    const basePriority: Record<string, number> = {
      'low': 1,
      'medium': 3,
      'high': 7,
      'critical': 10
    };

    return basePriority[prediction.riskLevel];
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }
}

export const predictiveMaintenanceAI = new PredictiveMaintenanceAI();