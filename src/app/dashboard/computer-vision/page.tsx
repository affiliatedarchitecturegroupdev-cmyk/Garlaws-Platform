"use client";

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { MobileCard, MobileCardHeader, MobileCardContent, MobileCardActions } from '@/components/MobileCard';
import { computerVisionService, type InspectionImage, type InspectionReport, type DetectionResult } from '@/lib/computer-vision-service';

interface DetectionBadgeProps {
  detection: DetectionResult;
}

function DetectionBadge({ detection }: DetectionBadgeProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'damage': return '💥';
      case 'maintenance_issue': return '🔧';
      case 'safety_hazard': return '⚠️';
      case 'normal': return '✅';
      default: return '🔍';
    }
  };

  return (
    <div className={`p-3 rounded-lg border ${getSeverityColor(detection.severity)} mb-3`}>
      <div className="flex items-start gap-3">
        <span className="text-lg">{getTypeIcon(detection.type)}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold capitalize">{detection.category.replace('_', ' ')}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-current/20 text-current">
              {detection.severity.toUpperCase()}
            </span>
            <span className="text-xs opacity-75">
              {(detection.confidence * 100).toFixed(0)}%
            </span>
          </div>
          <p className="text-sm opacity-90">{detection.description}</p>
          {detection.recommendations.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-semibold opacity-75 mb-1">Recommendations:</p>
              <ul className="text-xs opacity-75 space-y-0.5">
                {detection.recommendations.slice(0, 2).map((rec, index) => (
                  <li key={index}>• {rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface InspectionCardProps {
  report: InspectionReport;
  image: InspectionImage;
}

function InspectionCard({ report, image }: InspectionCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 border-green-500/30';
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/30';
    if (score >= 40) return 'bg-orange-500/20 border-orange-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  const criticalCount = report.detections.filter(d => d.severity === 'critical').length;
  const highCount = report.detections.filter(d => d.severity === 'high').length;

  return (
    <MobileCard className={`${getScoreBg(report.overallScore)} border-l-4 ${
      report.overallScore >= 80 ? 'border-green-500' :
      report.overallScore >= 60 ? 'border-yellow-500' :
      report.overallScore >= 40 ? 'border-orange-500' :
      'border-red-500'
    }`}>
      <MobileCardHeader
        title={`${image.area.charAt(0).toUpperCase() + image.area.slice(1)} Inspection`}
        subtitle={`${report.detections.length} issue${report.detections.length !== 1 ? 's' : ''} detected • ${report.timestamp.toLocaleDateString()}`}
        avatar={<span className="text-2xl">📷</span>}
      />

      <MobileCardContent>
        <div className="space-y-4">
          {/* Health Score */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#45a29e]">Health Score:</span>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-bold ${getScoreColor(report.overallScore)}`}>
                {report.overallScore.toFixed(0)}/100
              </span>
              <div className="w-16 h-2 bg-[#2d3b2d] rounded-full overflow-hidden">
                <div
                  className={`h-full ${report.overallScore >= 80 ? 'bg-green-500' :
                    report.overallScore >= 60 ? 'bg-yellow-500' :
                    report.overallScore >= 40 ? 'bg-orange-500' : 'bg-red-500'}`}
                  style={{ width: `${report.overallScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Issue Summary */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <div className="text-lg font-bold text-red-400">{criticalCount}</div>
              <div className="text-xs text-red-300">Critical</div>
            </div>
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <div className="text-lg font-bold text-orange-400">{highCount}</div>
              <div className="text-xs text-orange-300">High</div>
            </div>
            <div className="p-2 bg-[#2d3b2d] rounded-lg">
              <div className="text-lg font-bold text-[#45a29e]">{report.detections.length}</div>
              <div className="text-xs text-[#45a29e]">Total</div>
            </div>
          </div>

          {/* Cost Estimates */}
          <div className="p-3 bg-[#1f2833] rounded-lg">
            <h4 className="text-sm font-semibold text-[#c5a059] mb-2">Estimated Repair Costs</h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-sm font-bold text-red-400">
                  R{report.estimatedCosts.immediate.toLocaleString()}
                </div>
                <div className="text-xs text-red-300">Immediate</div>
              </div>
              <div>
                <div className="text-sm font-bold text-yellow-400">
                  R{report.estimatedCosts.shortTerm.toLocaleString()}
                </div>
                <div className="text-xs text-yellow-300">Short-term</div>
              </div>
              <div>
                <div className="text-sm font-bold text-green-400">
                  R{report.estimatedCosts.longTerm.toLocaleString()}
                </div>
                <div className="text-xs text-green-300">Long-term</div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <p className="text-sm text-[#45a29e] leading-relaxed">{report.summary}</p>

          {/* Priority Actions */}
          {report.priorityActions.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-[#c5a059] mb-2">Priority Actions:</h4>
              <ul className="text-sm text-[#45a29e] space-y-1">
                {report.priorityActions.slice(0, 3).map((action, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-[#c5a059] mt-1">•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Detection Details Toggle */}
          {report.detections.length > 0 && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full text-center text-sm text-[#45a29e] hover:text-[#c5a059] transition-colors py-2 border-t border-[#45a29e]/20"
            >
              {showDetails ? 'Hide Details' : `Show ${report.detections.length} Detection${report.detections.length !== 1 ? 's' : ''}`}
            </button>
          )}
        </div>

        {/* Detection Details */}
        {showDetails && report.detections.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#45a29e]/20">
            <h4 className="text-sm font-semibold text-[#c5a059] mb-3">Detected Issues:</h4>
            <div className="space-y-2">
              {report.detections.map((detection, index) => (
                <DetectionBadge key={index} detection={detection} />
              ))}
            </div>
          </div>
        )}
      </MobileCardContent>

      <MobileCardActions>
        <button className="px-4 py-2 bg-[#c5a059] text-[#0b0c10] rounded-lg font-medium text-sm">
          View Full Report
        </button>
        <button className="px-4 py-2 bg-[#45a29e] text-white rounded-lg font-medium text-sm">
          Schedule Repair
        </button>
      </MobileCardActions>
    </MobileCard>
  );
}

export default function ComputerVisionPage() {
  const [inspections, setInspections] = useState<InspectionImage[]>([]);
  const [reports, setReports] = useState<InspectionReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    loadInspectionData();
  }, []);

  const loadInspectionData = async () => {
    try {
      setLoading(true);

      // Mock inspection images - in real app, this would come from API
      const mockInspections: InspectionImage[] = [
        {
          id: 'inspection-001',
          url: '/images/property-kitchen.jpg',
          propertyId: 'property-001',
          area: 'kitchen',
          timestamp: new Date('2024-12-15T10:00:00Z'),
          inspector: 'John Smith'
        },
        {
          id: 'inspection-002',
          url: '/images/property-roof.jpg',
          propertyId: 'property-001',
          area: 'roof',
          timestamp: new Date('2024-12-15T11:00:00Z'),
          inspector: 'John Smith'
        },
        {
          id: 'inspection-003',
          url: '/images/property-electrical.jpg',
          propertyId: 'property-001',
          area: 'electrical',
          timestamp: new Date('2024-12-15T12:00:00Z'),
          inspector: 'John Smith'
        },
        {
          id: 'inspection-004',
          url: '/images/property-garden.jpg',
          propertyId: 'property-001',
          area: 'garden',
          timestamp: new Date('2024-12-15T13:00:00Z'),
          inspector: 'John Smith'
        }
      ];

      setInspections(mockInspections);

      // Analyze all images
      await analyzeAllImages(mockInspections);

    } catch (error) {
      console.error('Failed to load inspection data:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeAllImages = async (images: InspectionImage[]) => {
    setAnalyzing(true);
    try {
      const analysisPromises = images.map(image => computerVisionService.analyzeInspectionImage(image));
      const results = await Promise.all(analysisPromises);
      setReports(results);
    } catch (error) {
      console.error('Failed to analyze images:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const getOverallStats = () => {
    const totalInspections = reports.length;
    const averageScore = reports.length > 0
      ? reports.reduce((sum, report) => sum + report.overallScore, 0) / reports.length
      : 0;

    const criticalIssues = reports.flatMap(r => r.detections).filter(d => d.severity === 'critical').length;
    const totalDetections = reports.flatMap(r => r.detections).length;

    const totalEstimatedCost = reports.reduce((sum, report) =>
      sum + report.estimatedCosts.immediate + report.estimatedCosts.shortTerm + report.estimatedCosts.longTerm, 0);

    return {
      totalInspections,
      averageScore,
      criticalIssues,
      totalDetections,
      totalEstimatedCost
    };
  };

  if (loading) {
    return (
      <DashboardLayout activeTab="analytics">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-[#c5a059] mb-2">Loading Computer Vision Analysis...</h2>
            <p className="text-[#45a29e]">AI is analyzing property inspection images</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const stats = getOverallStats();

  return (
    <DashboardLayout activeTab="analytics">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Computer Vision Inspections</h1>
          <p className="text-[#45a29e]">
            AI-powered property inspection analysis and damage detection
          </p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-[#1f2833] rounded-xl p-4 border border-[#45a29e]/20 text-center">
            <div className="text-2xl font-bold text-[#c5a059] mb-1">{stats.totalInspections}</div>
            <div className="text-sm text-[#45a29e]">Inspections</div>
          </div>
          <div className="bg-[#1f2833] rounded-xl p-4 border border-[#45a29e]/20 text-center">
            <div className="text-2xl font-bold text-white mb-1">{stats.averageScore.toFixed(1)}%</div>
            <div className="text-sm text-[#45a29e]">Avg Health</div>
          </div>
          <div className="bg-[#1f2833] rounded-xl p-4 border border-[#45a29e]/20 text-center">
            <div className="text-2xl font-bold text-red-400 mb-1">{stats.criticalIssues}</div>
            <div className="text-sm text-[#45a29e]">Critical Issues</div>
          </div>
          <div className="bg-[#1f2833] rounded-xl p-4 border border-[#45a29e]/20 text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">{stats.totalDetections}</div>
            <div className="text-sm text-[#45a29e]">Detections</div>
          </div>
          <div className="bg-[#1f2833] rounded-xl p-4 border border-[#45a29e]/20 text-center">
            <div className="text-2xl font-bold text-orange-400 mb-1">
              R{(stats.totalEstimatedCost / 1000).toFixed(0)}K
            </div>
            <div className="text-sm text-[#45a29e]">Est. Cost</div>
          </div>
        </div>

        {/* Analysis Status */}
        {analyzing && (
          <div className="mb-6 bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-4">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#c5a059] border-t-transparent"></div>
              <span className="text-[#45a29e]">AI analyzing inspection images...</span>
            </div>
          </div>
        )}

        {/* Inspection Reports */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white mb-4">Inspection Reports</h2>

          {reports.length === 0 ? (
            <div className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-12 text-center">
              <div className="text-6xl mb-4">📷</div>
              <h3 className="text-xl font-bold text-white mb-2">No inspections found</h3>
              <p className="text-[#45a29e] mb-6">
                Upload property inspection photos to get AI-powered analysis and damage detection.
              </p>
              <button
                onClick={() => analyzeAllImages(inspections)}
                disabled={analyzing}
                className="px-6 py-3 bg-[#c5a059] text-[#0b0c10] rounded-lg hover:bg-[#b8954f] transition-colors font-medium disabled:opacity-50"
              >
                {analyzing ? 'Analyzing...' : 'Run Analysis'}
              </button>
            </div>
          ) : (
            reports.map((report) => {
              const image = inspections.find(img => img.id === report.imageId);
              if (!image) return null;

              return (
                <InspectionCard
                  key={report.imageId}
                  report={report}
                  image={image}
                />
              );
            })
          )}
        </div>

        {/* AI Insights */}
        {reports.length > 0 && (
          <div className="mt-8 bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6">
            <h3 className="text-xl font-bold text-white mb-4">AI Property Insights</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-[#c5a059] font-semibold mb-2">Property Health Overview</h4>
                <p className="text-sm text-[#45a29e] leading-relaxed">
                  Based on {stats.totalInspections} inspection areas analyzed, your property has an overall health score of {stats.averageScore.toFixed(1)}%.
                  {stats.criticalIssues > 0 && ` There are ${stats.criticalIssues} critical issues requiring immediate attention.`}
                  {stats.averageScore > 80 && ' The property is in excellent condition with minimal maintenance needs.'}
                  {stats.averageScore < 60 && ' Consider scheduling comprehensive maintenance to prevent further deterioration.'}
                </p>
              </div>
              <div>
                <h4 className="text-[#c5a059] font-semibold mb-2">Recommended Actions</h4>
                <ul className="text-sm text-[#45a29e] space-y-1">
                  <li>• Schedule professional inspection for critical areas</li>
                  <li>• Address water damage issues immediately</li>
                  <li>• Regular maintenance prevents costly repairs</li>
                  <li>• Document all repairs for insurance purposes</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}