// Advanced Risk Assessment Engine
export interface RiskFactor {
  id: string;
  name: string;
  category: 'environmental' | 'operational' | 'financial' | 'regulatory' | 'safety';
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number; // 0-1
  impact: number; // 0-1
  weight: number; // 0-1
  description: string;
}

export interface RiskAssessment {
  id: string;
  assessmentType: 'property' | 'equipment' | 'operational' | 'portfolio';
  targetId: string;
  overallRiskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: RiskFactor[];
  mitigationStrategies: Array<{
    strategy: string;
    effectiveness: number; // 0-1
    cost: number;
    timeline: string;
    priority: 'low' | 'medium' | 'high';
  }>;
  insuranceRecommendations: Array<{
    type: string;
    coverage: number;
    premium: number;
    justification: string;
  }>;
  assessmentDate: Date;
  validUntil: Date;
  assessor: string;
  confidence: number; // 0-1
}

export interface AssessmentCriteria {
  timeHorizon?: number; // months
  riskTolerance?: 'conservative' | 'moderate' | 'aggressive';
  industryStandards?: boolean;
  customWeights?: Record<string, number>;
}

class RiskAssessmentEngine {
  private assessments: Map<string, RiskAssessment> = new Map();

  // Risk factor databases by category
  private propertyRiskFactors: RiskFactor[] = [
    {
      id: 'prop_location',
      name: 'Geographic Location Risk',
      category: 'environmental',
      severity: 'medium',
      probability: 0.3,
      impact: 0.7,
      weight: 0.25,
      description: 'Location-based risks including flood zones, seismic activity, and crime rates'
    },
    {
      id: 'prop_age',
      name: 'Property Age',
      category: 'operational',
      severity: 'medium',
      probability: 0.4,
      impact: 0.6,
      weight: 0.20,
      description: 'Age-related deterioration of building systems and materials'
    },
    {
      id: 'prop_maintenance',
      name: 'Maintenance History',
      category: 'operational',
      severity: 'high',
      probability: 0.6,
      impact: 0.8,
      weight: 0.30,
      description: 'Quality and frequency of maintenance activities'
    },
    {
      id: 'prop_occupancy',
      name: 'Occupancy Type',
      category: 'operational',
      severity: 'low',
      probability: 0.2,
      impact: 0.4,
      weight: 0.15,
      description: 'Risk factors based on property use and occupancy patterns'
    },
    {
      id: 'prop_utilities',
      name: 'Utility Systems',
      category: 'operational',
      severity: 'medium',
      probability: 0.5,
      impact: 0.7,
      weight: 0.25,
      description: 'Electrical, plumbing, HVAC, and other utility system risks'
    }
  ];

  private equipmentRiskFactors: RiskFactor[] = [
    {
      id: 'equip_age',
      name: 'Equipment Age',
      category: 'operational',
      severity: 'high',
      probability: 0.7,
      impact: 0.8,
      weight: 0.30,
      description: 'Age-related failure probability and maintenance requirements'
    },
    {
      id: 'equip_usage',
      name: 'Usage Intensity',
      category: 'operational',
      severity: 'medium',
      probability: 0.5,
      impact: 0.6,
      weight: 0.25,
      description: 'Operating hours, load factors, and usage patterns'
    },
    {
      id: 'equip_maintenance',
      name: 'Maintenance Compliance',
      category: 'operational',
      severity: 'high',
      probability: 0.6,
      impact: 0.9,
      weight: 0.35,
      description: 'Adherence to manufacturer maintenance schedules and procedures'
    },
    {
      id: 'equip_environment',
      name: 'Operating Environment',
      category: 'environmental',
      severity: 'medium',
      probability: 0.4,
      impact: 0.5,
      weight: 0.20,
      description: 'Temperature, humidity, dust, and other environmental factors'
    }
  ];

  private operationalRiskFactors: RiskFactor[] = [
    {
      id: 'op_compliance',
      name: 'Regulatory Compliance',
      category: 'regulatory',
      severity: 'critical',
      probability: 0.3,
      impact: 0.9,
      weight: 0.40,
      description: 'Compliance with building codes, safety standards, and regulations'
    },
    {
      id: 'op_financial',
      name: 'Financial Stability',
      category: 'financial',
      severity: 'high',
      probability: 0.4,
      impact: 0.8,
      weight: 0.30,
      description: 'Cash flow, debt levels, and financial health indicators'
    },
    {
      id: 'op_market',
      name: 'Market Conditions',
      category: 'financial',
      severity: 'medium',
      probability: 0.6,
      impact: 0.5,
      weight: 0.20,
      description: 'Local market conditions, vacancy rates, and economic factors'
    },
    {
      id: 'op_safety',
      name: 'Safety Record',
      category: 'safety',
      severity: 'high',
      probability: 0.2,
      impact: 0.9,
      weight: 0.35,
      description: 'Incident history, safety protocols, and emergency preparedness'
    }
  ];

  async performAssessment(
    assessmentType: 'property' | 'equipment' | 'operational' | 'portfolio',
    targetId: string,
    assessmentData: any,
    criteria: AssessmentCriteria = {}
  ): Promise<RiskAssessment> {
    const assessmentId = `${assessmentType}_${targetId}_${Date.now()}`;

    // Get relevant risk factors
    const riskFactors = this.getRiskFactorsForType(assessmentType);

    // Calculate risk scores
    const calculatedFactors = this.calculateRiskFactors(riskFactors, assessmentData, criteria);

    // Compute overall risk score
    const overallRiskScore = this.calculateOverallRiskScore(calculatedFactors);

    // Determine risk level
    const riskLevel = this.determineRiskLevel(overallRiskScore);

    // Generate mitigation strategies
    const mitigationStrategies = this.generateMitigationStrategies(calculatedFactors, assessmentType);

    // Generate insurance recommendations
    const insuranceRecommendations = this.generateInsuranceRecommendations(calculatedFactors, assessmentType);

    const assessment: RiskAssessment = {
      id: assessmentId,
      assessmentType,
      targetId,
      overallRiskScore,
      riskLevel,
      riskFactors: calculatedFactors,
      mitigationStrategies,
      insuranceRecommendations,
      assessmentDate: new Date(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year validity
      assessor: 'Garlaws AI Risk Assessment Engine',
      confidence: 0.85
    };

    // Store assessment
    this.assessments.set(assessmentId, assessment);

    return assessment;
  }

  private getRiskFactorsForType(type: string): RiskFactor[] {
    switch (type) {
      case 'property':
        return this.propertyRiskFactors;
      case 'equipment':
        return this.equipmentRiskFactors;
      case 'operational':
        return this.operationalRiskFactors;
      case 'portfolio':
        return [...this.propertyRiskFactors, ...this.operationalRiskFactors];
      default:
        return [];
    }
  }

  private calculateRiskFactors(
    baseFactors: RiskFactor[],
    assessmentData: any,
    criteria: AssessmentCriteria
  ): RiskFactor[] {
    return baseFactors.map(factor => {
      // Adjust probability and impact based on assessment data
      let probability = factor.probability;
      let impact = factor.impact;
      let severity = factor.severity;

      // Apply data-driven adjustments
      if (assessmentData) {
        const adjustments = this.calculateDataAdjustments(factor, assessmentData);
        probability = Math.min(1, Math.max(0, probability + adjustments.probabilityDelta));
        impact = Math.min(1, Math.max(0, impact + adjustments.impactDelta));

        if (adjustments.severityOverride) {
          severity = adjustments.severityOverride;
        }
      }

      // Apply custom weights if specified
      const weight = criteria.customWeights?.[factor.id] ?? factor.weight;

      return {
        ...factor,
        probability,
        impact,
        severity,
        weight
      };
    });
  }

  private calculateDataAdjustments(factor: RiskFactor, data: any): {
    probabilityDelta: number;
    impactDelta: number;
    severityOverride?: 'low' | 'medium' | 'high' | 'critical';
  } {
    // Property-specific adjustments
    if (factor.id === 'prop_age' && data.propertyAge) {
      const age = data.propertyAge;
      if (age > 50) return { probabilityDelta: 0.3, impactDelta: 0.2, severityOverride: 'high' };
      if (age > 30) return { probabilityDelta: 0.2, impactDelta: 0.1, severityOverride: 'medium' };
      if (age > 10) return { probabilityDelta: 0.1, impactDelta: 0.05 };
    }

    if (factor.id === 'prop_location' && data.locationRisk) {
      const riskLevel = data.locationRisk;
      if (riskLevel === 'high') return { probabilityDelta: 0.3, impactDelta: 0.2, severityOverride: 'high' };
      if (riskLevel === 'medium') return { probabilityDelta: 0.15, impactDelta: 0.1 };
    }

    // Equipment-specific adjustments
    if (factor.id === 'equip_age' && data.equipmentAge) {
      const age = data.equipmentAge;
      if (age > 15) return { probabilityDelta: 0.4, impactDelta: 0.3, severityOverride: 'critical' };
      if (age > 10) return { probabilityDelta: 0.25, impactDelta: 0.2, severityOverride: 'high' };
      if (age > 5) return { probabilityDelta: 0.15, impactDelta: 0.1, severityOverride: 'medium' };
    }

    if (factor.id === 'equip_maintenance' && data.lastMaintenance) {
      const daysSinceMaintenance = data.lastMaintenance;
      if (daysSinceMaintenance > 365) return { probabilityDelta: 0.3, impactDelta: 0.2, severityOverride: 'high' };
      if (daysSinceMaintenance > 180) return { probabilityDelta: 0.2, impactDelta: 0.15, severityOverride: 'medium' };
    }

    return { probabilityDelta: 0, impactDelta: 0 };
  }

  private calculateOverallRiskScore(factors: RiskFactor[]): number {
    const weightedScore = factors.reduce((sum, factor) => {
      const riskScore = (factor.probability * factor.impact) * factor.weight;
      return sum + riskScore;
    }, 0);

    // Convert to 0-100 scale
    return Math.round(weightedScore * 100);
  }

  private determineRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 75) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 25) return 'medium';
    return 'low';
  }

  private generateMitigationStrategies(
    factors: RiskFactor[],
    assessmentType: string
  ): Array<{
    strategy: string;
    effectiveness: number;
    cost: number;
    timeline: string;
    priority: 'low' | 'medium' | 'high';
  }> {
    const strategies = [];

    // High-priority mitigation strategies
    const highRiskFactors = factors.filter(f => f.severity === 'high' || f.severity === 'critical');

    for (const factor of highRiskFactors) {
      switch (factor.id) {
        case 'prop_maintenance':
          strategies.push({
            strategy: 'Implement comprehensive maintenance program with quarterly inspections',
            effectiveness: 0.8,
            cost: 5000,
            timeline: '3-6 months',
            priority: 'high' as const
          });
          break;
        case 'equip_maintenance':
          strategies.push({
            strategy: 'Establish preventive maintenance schedule with automated monitoring',
            effectiveness: 0.85,
            cost: 3000,
            timeline: '1-3 months',
            priority: 'high' as const
          });
          break;
        case 'op_compliance':
          strategies.push({
            strategy: 'Conduct comprehensive compliance audit and implement corrective actions',
            effectiveness: 0.9,
            cost: 10000,
            timeline: '2-4 months',
            priority: 'high' as const
          });
          break;
      }
    }

    // Medium-priority strategies for all assessments
    strategies.push({
      strategy: 'Install advanced monitoring systems with real-time alerts',
      effectiveness: 0.7,
      cost: 8000,
      timeline: '3-6 months',
      priority: 'medium' as const
    });

    strategies.push({
      strategy: 'Develop and implement emergency response protocols',
      effectiveness: 0.75,
      cost: 2000,
      timeline: '1-2 months',
      priority: 'medium' as const
    });

    return strategies;
  }

  private generateInsuranceRecommendations(
    factors: RiskFactor[],
    assessmentType: string
  ): Array<{
    type: string;
    coverage: number;
    premium: number;
    justification: string;
  }> {
    const recommendations = [];

    const highImpactFactors = factors.filter(f => f.impact > 0.6);

    for (const factor of highImpactFactors) {
      switch (factor.id) {
        case 'prop_location':
          recommendations.push({
            type: 'Natural Disaster Coverage',
            coverage: 500000,
            premium: 2500,
            justification: 'High environmental risk requires comprehensive natural disaster protection'
          });
          break;
        case 'prop_utilities':
          recommendations.push({
            type: 'Equipment Breakdown Insurance',
            coverage: 100000,
            premium: 1200,
            justification: 'Utility system failures can cause significant operational disruption'
          });
          break;
        case 'op_safety':
          recommendations.push({
            type: 'General Liability Insurance',
            coverage: 2000000,
            premium: 3500,
            justification: 'Enhanced liability coverage for safety and incident risks'
          });
          break;
      }
    }

    // Default recommendations
    if (recommendations.length === 0) {
      recommendations.push({
        type: 'Property Insurance',
        coverage: 1000000,
        premium: 1800,
        justification: 'Standard property protection for basic risk coverage'
      });
    }

    return recommendations;
  }

  async getAssessmentHistory(
    assessmentType?: string | null,
    targetId?: string | null,
    limit: number = 10
  ): Promise<RiskAssessment[]> {
    const assessments = Array.from(this.assessments.values());

    let filtered = assessments;

    if (assessmentType) {
      filtered = filtered.filter(a => a.assessmentType === assessmentType);
    }

    if (targetId) {
      filtered = filtered.filter(a => a.targetId === targetId);
    }

    // Sort by date (newest first) and limit
    return filtered
      .sort((a, b) => b.assessmentDate.getTime() - a.assessmentDate.getTime())
      .slice(0, limit);
  }

  // Generate mock assessment for demonstration
  async generateMockAssessment(type: 'property' | 'equipment' | 'operational' = 'property'): Promise<RiskAssessment> {
    const mockData = type === 'property' ? {
      propertyAge: 25,
      locationRisk: 'medium',
      lastMaintenance: 45,
      occupancyType: 'commercial'
    } : type === 'equipment' ? {
      equipmentAge: 8,
      usageHours: 2000,
      lastMaintenance: 90,
      operatingEnvironment: 'indoor'
    } : {
      complianceScore: 85,
      financialHealth: 'good',
      marketConditions: 'stable',
      safetyIncidents: 0
    };

    return await this.performAssessment(type, `mock_${type}_${Date.now()}`, mockData);
  }
}

export const riskAssessmentEngine = new RiskAssessmentEngine();