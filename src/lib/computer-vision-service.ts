// Computer Vision Service for Property Inspections and Damage Detection
export interface InspectionImage {
  id: string;
  url: string;
  propertyId: string;
  area: string; // e.g., "kitchen", "roof", "garden"
  timestamp: Date;
  inspector?: string;
}

export interface DetectionResult {
  type: 'damage' | 'maintenance_issue' | 'safety_hazard' | 'normal';
  confidence: number; // 0-1
  location: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string; // e.g., 'cracks', 'water_damage', 'electrical'
  recommendations: string[];
}

export interface InspectionReport {
  imageId: string;
  propertyId: string;
  area: string;
  timestamp: Date;
  detections: DetectionResult[];
  overallScore: number; // 0-100 (health score)
  summary: string;
  priorityActions: string[];
  estimatedCosts: {
    immediate: number;
    shortTerm: number;
    longTerm: number;
  };
}

class ComputerVisionService {
  private readonly API_ENDPOINT = process.env.NEXT_PUBLIC_CV_API_URL || 'https://api.garlaws-cv.com/v1';
  private readonly API_KEY = process.env.NEXT_PUBLIC_CV_API_KEY;

  // Analyze property inspection images for damage and issues
  async analyzeInspectionImage(image: InspectionImage): Promise<InspectionReport> {
    try {
      // In a real implementation, this would send the image to a computer vision API
      // For now, we'll simulate analysis based on image metadata and mock results

      const detections = await this.performImageAnalysis(image);
      const overallScore = this.calculateOverallScore(detections);
      const summary = this.generateSummary(detections, overallScore);
      const priorityActions = this.generatePriorityActions(detections);
      const estimatedCosts = this.estimateRepairCosts(detections);

      return {
        imageId: image.id,
        propertyId: image.propertyId,
        area: image.area,
        timestamp: image.timestamp,
        detections,
        overallScore,
        summary,
        priorityActions,
        estimatedCosts
      };
    } catch (error) {
      console.error('Computer vision analysis failed:', error);
      throw new Error('Failed to analyze inspection image');
    }
  }

  // Batch analyze multiple images
  async analyzeMultipleImages(images: InspectionImage[]): Promise<InspectionReport[]> {
    const promises = images.map(image => this.analyzeInspectionImage(image));
    return Promise.all(promises);
  }

  // Generate comprehensive property health report
  async generatePropertyReport(propertyId: string, images: InspectionImage[]): Promise<{
    propertyId: string;
    overallHealthScore: number;
    areaReports: InspectionReport[];
    criticalIssues: DetectionResult[];
    maintenanceSchedule: Array<{
      area: string;
      priority: string;
      description: string;
      estimatedCost: number;
    }>;
    recommendations: string[];
  }> {
    const areaReports = await this.analyzeMultipleImages(images);

    // Calculate overall property health score
    const overallHealthScore = areaReports.reduce((sum, report) => sum + report.overallScore, 0) / areaReports.length;

    // Identify critical issues
    const criticalIssues = areaReports.flatMap(report =>
      report.detections.filter(detection => detection.severity === 'critical')
    );

    // Generate maintenance schedule
    const maintenanceSchedule = this.createMaintenanceSchedule(areaReports);

    // Generate property-wide recommendations
    const recommendations = this.generatePropertyRecommendations(areaReports, overallHealthScore);

    return {
      propertyId,
      overallHealthScore,
      areaReports,
      criticalIssues,
      maintenanceSchedule,
      recommendations
    };
  }

  private async performImageAnalysis(image: InspectionImage): Promise<DetectionResult[]> {
    // Simulate computer vision analysis
    // In real implementation, this would call a CV API like Google Vision AI, AWS Rekognition, etc.

    const mockDetections: DetectionResult[] = [];

    // Area-specific analysis
    switch (image.area.toLowerCase()) {
      case 'roof':
        mockDetections.push(
          {
            type: 'damage',
            confidence: 0.87,
            location: { x: 150, y: 200, width: 100, height: 80 },
            description: 'Cracks detected in roofing tiles',
            severity: 'medium',
            category: 'structural',
            recommendations: ['Schedule roof inspection', 'Replace damaged tiles']
          },
          {
            type: 'maintenance_issue',
            confidence: 0.92,
            location: { x: 300, y: 150, width: 60, height: 40 },
            description: 'Moss growth on roof surface',
            severity: 'low',
            category: 'cosmetic',
            recommendations: ['Apply moss remover', 'Improve ventilation']
          }
        );
        break;

      case 'kitchen':
        mockDetections.push(
          {
            type: 'damage',
            confidence: 0.78,
            location: { x: 200, y: 250, width: 120, height: 90 },
            description: 'Water damage around sink area',
            severity: 'high',
            category: 'water_damage',
            recommendations: ['Fix plumbing leak immediately', 'Replace damaged cabinets']
          }
        );
        break;

      case 'electrical':
        mockDetections.push(
          {
            type: 'safety_hazard',
            confidence: 0.95,
            location: { x: 180, y: 220, width: 80, height: 60 },
            description: 'Exposed electrical wiring',
            severity: 'critical',
            category: 'electrical',
            recommendations: ['Call licensed electrician immediately', 'Turn off power to area']
          }
        );
        break;

      case 'garden':
        mockDetections.push(
          {
            type: 'maintenance_issue',
            confidence: 0.65,
            location: { x: 250, y: 300, width: 150, height: 100 },
            description: 'Overgrown vegetation blocking pathways',
            severity: 'medium',
            category: 'landscaping',
            recommendations: ['Trim overgrown plants', 'Clear pathways regularly']
          }
        );
        break;

      default:
        // Generic analysis for other areas
        if (Math.random() > 0.7) {
          mockDetections.push({
            type: 'normal',
            confidence: 0.85,
            location: { x: 100, y: 100, width: 200, height: 150 },
            description: 'Area appears normal',
            severity: 'low',
            category: 'general',
            recommendations: ['Continue regular maintenance']
          });
        }
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    return mockDetections;
  }

  private calculateOverallScore(detections: DetectionResult[]): number {
    if (detections.length === 0) return 100;

    // Weight detections by severity and confidence
    const severityWeights = {
      critical: 0.4,
      high: 0.3,
      medium: 0.2,
      low: 0.1
    };

    let totalImpact = 0;
    let totalWeight = 0;

    detections.forEach(detection => {
      const severityWeight = severityWeights[detection.severity];
      const confidenceWeight = detection.confidence;
      const combinedWeight = severityWeight * confidenceWeight;

      totalImpact += combinedWeight;
      totalWeight += severityWeight;
    });

    // Convert to 0-100 score (higher is better)
    const impactScore = totalWeight > 0 ? (totalImpact / totalWeight) * 100 : 100;
    return Math.max(0, Math.min(100, 100 - impactScore));
  }

  private generateSummary(detections: DetectionResult[], overallScore: number): string {
    const criticalCount = detections.filter(d => d.severity === 'critical').length;
    const highCount = detections.filter(d => d.severity === 'high').length;
    const mediumCount = detections.filter(d => d.severity === 'medium').length;

    let summary = `Inspection completed with overall health score of ${overallScore.toFixed(1)}/100. `;

    if (criticalCount > 0) {
      summary += `Found ${criticalCount} critical issue${criticalCount > 1 ? 's' : ''} requiring immediate attention. `;
    }

    if (highCount > 0) {
      summary += `${highCount} high-priority issue${highCount > 1 ? 's' : ''} identified. `;
    }

    if (mediumCount > 0) {
      summary += `${mediumCount} medium-priority item${mediumCount > 1 ? 's' : ''} noted. `;
    }

    if (criticalCount === 0 && highCount === 0 && mediumCount === 0) {
      summary += 'No significant issues detected. Property appears well-maintained.';
    }

    return summary;
  }

  private generatePriorityActions(detections: DetectionResult[]): string[] {
    const actions: string[] = [];

    // Sort by severity and confidence
    const sortedDetections = detections.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const aScore = severityOrder[a.severity] * a.confidence;
      const bScore = severityOrder[b.severity] * b.confidence;
      return bScore - aScore;
    });

    sortedDetections.slice(0, 5).forEach(detection => {
      actions.push(...detection.recommendations);
    });

    return [...new Set(actions)]; // Remove duplicates
  }

  private estimateRepairCosts(detections: DetectionResult[]): InspectionReport['estimatedCosts'] {
    let immediate = 0;
    let shortTerm = 0;
    let longTerm = 0;

    const costEstimates: Record<string, { immediate: number; shortTerm: number; longTerm: number }> = {
      structural: { immediate: 5000, shortTerm: 2000, longTerm: 1000 },
      water_damage: { immediate: 3000, shortTerm: 1500, longTerm: 500 },
      electrical: { immediate: 2500, shortTerm: 1000, longTerm: 300 },
      cosmetic: { immediate: 500, shortTerm: 2000, longTerm: 1000 },
      landscaping: { immediate: 1000, shortTerm: 2000, longTerm: 1500 },
      general: { immediate: 500, shortTerm: 1000, longTerm: 500 }
    };

    detections.forEach(detection => {
      const costs = costEstimates[detection.category] || costEstimates.general;

      switch (detection.severity) {
        case 'critical':
          immediate += costs.immediate;
          break;
        case 'high':
          immediate += costs.immediate * 0.7;
          shortTerm += costs.shortTerm * 0.3;
          break;
        case 'medium':
          shortTerm += costs.shortTerm;
          longTerm += costs.longTerm * 0.5;
          break;
        case 'low':
          longTerm += costs.longTerm;
          break;
      }
    });

    return {
      immediate: Math.round(immediate),
      shortTerm: Math.round(shortTerm),
      longTerm: Math.round(longTerm)
    };
  }

  private createMaintenanceSchedule(reports: InspectionReport[]): Array<{
    area: string;
    priority: string;
    description: string;
    estimatedCost: number;
  }> {
    const schedule: Array<{
      area: string;
      priority: string;
      description: string;
      estimatedCost: number;
    }> = [];

    reports.forEach(report => {
      if (report.priorityActions.length > 0) {
        schedule.push({
          area: report.area,
          priority: report.detections.some(d => d.severity === 'critical') ? 'immediate' :
                   report.detections.some(d => d.severity === 'high') ? 'high' : 'medium',
          description: report.priorityActions[0],
          estimatedCost: report.estimatedCosts.immediate + report.estimatedCosts.shortTerm
        });
      }
    });

    return schedule.sort((a, b) => {
      const priorityOrder = { immediate: 3, high: 2, medium: 1 };
      return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
    });
  }

  private generatePropertyRecommendations(reports: InspectionReport[], overallScore: number): string[] {
    const recommendations: string[] = [];

    if (overallScore < 70) {
      recommendations.push('Schedule comprehensive property inspection');
      recommendations.push('Address critical issues immediately to prevent further damage');
    }

    const criticalAreas = reports.filter(r => r.detections.some(d => d.severity === 'critical')).length;
    if (criticalAreas > 0) {
      recommendations.push(`Address ${criticalAreas} area${criticalAreas > 1 ? 's' : ''} with critical issues`);
    }

    const waterDamageCount = reports.flatMap(r => r.detections).filter(d => d.category === 'water_damage').length;
    if (waterDamageCount > 0) {
      recommendations.push('Investigate potential water ingress issues across property');
    }

    const electricalIssues = reports.flatMap(r => r.detections).filter(d => d.category === 'electrical').length;
    if (electricalIssues > 0) {
      recommendations.push('Have electrical system professionally inspected');
    }

    if (overallScore > 85) {
      recommendations.push('Continue current maintenance schedule - property in excellent condition');
    }

    return recommendations;
  }

  // Utility method to check if an image needs re-analysis
  shouldReanalyzeImage(image: InspectionImage, lastAnalysis?: Date): boolean {
    if (!lastAnalysis) return true;

    const daysSinceAnalysis = (Date.now() - lastAnalysis.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceAnalysis > 30; // Re-analyze every 30 days
  }
}

export const computerVisionService = new ComputerVisionService();