"use client";

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { MobileCard, MobileCardHeader, MobileCardContent, MobileCardActions } from '@/components/MobileCard';
import { anomalyDetectionEngine, type PatternAnalysis, type AnomalyPattern } from '@/lib/anomaly-detection-engine';

interface AnomalyCardProps {
  anomaly: AnomalyPattern;
}

function AnomalyCard({ anomaly }: AnomalyCardProps) {
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
      case 'sensor_anomaly': return '📊';
      case 'maintenance_pattern': return '🔧';
      case 'performance_degradation': return '📉';
      case 'usage_anomaly': return '⏰';
      default: return '⚠️';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'immediate': return 'text-red-500';
      case 'scheduled': return 'text-yellow-500';
      case 'monitoring': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <MobileCard className={`${getSeverityColor(anomaly.severity)} border-l-4 ${
      anomaly.severity === 'critical' ? 'border-l-red-500' :
      anomaly.severity === 'high' ? 'border-l-orange-500' :
      anomaly.severity === 'medium' ? 'border-l-yellow-500' :
      'border-l-green-500'
    }`}>
      <MobileCardHeader
        title={`${anomaly.type.replace('_', ' ').toUpperCase()} - ${anomaly.equipmentId}`}
        subtitle={`Detected: ${anomaly.detectedAt.toLocaleDateString()} • Confidence: ${(anomaly.confidence * 100).toFixed(0)}%`}
        avatar={<span className="text-2xl">{getTypeIcon(anomaly.type)}</span>}
      />

      <MobileCardContent>
        <div className="space-y-4">
          <p className="text-white">{anomaly.description}</p>

          {/* Indicators */}
          {anomaly.indicators.length > 0 && (
            <div>
              <h4 className="text-[#c5a059] font-semibold mb-2">Key Indicators:</h4>
              <div className="space-y-1">
                {anomaly.indicators.map((indicator, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-[#45a29e]">{indicator.metric}:</span>
                    <span className="text-white">
                      {indicator.value.toFixed(2)} (dev: {indicator.deviation.toFixed(1)}σ)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Impact Assessment */}
          <div className="p-3 bg-[#1f2833] rounded-lg">
            <h4 className="text-[#c5a059] font-semibold mb-2">Predicted Impact:</h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-sm font-bold text-red-400">
                  {anomaly.predictedImpact.downtime}h
                </div>
                <div className="text-xs text-red-300">Downtime</div>
              </div>
              <div>
                <div className="text-sm font-bold text-orange-400">
                  R{anomaly.predictedImpact.cost.toLocaleString()}
                </div>
                <div className="text-xs text-orange-300">Cost</div>
              </div>
              <div>
                <div className={`text-sm font-bold capitalize ${getUrgencyColor(anomaly.predictedImpact.urgency)}`}>
                  {anomaly.predictedImpact.urgency}
                </div>
                <div className="text-xs opacity-75">Urgency</div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h4 className="text-[#c5a059] font-semibold mb-2">Recommendations:</h4>
            <ul className="text-sm text-[#45a29e] space-y-1">
              {anomaly.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-[#c5a059] mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Historical Context */}
          <div className="p-3 bg-[#2d3b2d] rounded-lg">
            <h4 className="text-[#c5a059] font-semibold mb-2">Historical Context:</h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-sm font-bold text-blue-400">
                  {anomaly.historicalContext.similarIncidents}
                </div>
                <div className="text-xs text-blue-300">Similar Cases</div>
              </div>
              <div>
                <div className="text-sm font-bold text-green-400">
                  {anomaly.historicalContext.averageResolutionTime}d
                </div>
                <div className="text-xs text-green-300">Avg Resolution</div>
              </div>
              <div>
                <div className="text-sm font-bold text-yellow-400">
                  {(anomaly.historicalContext.successRate * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-yellow-300">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </MobileCardContent>

      <MobileCardActions>
        <button className="px-4 py-2 bg-[#c5a059] text-[#0b0c10] rounded-lg font-medium text-sm">
          View Details
        </button>
        {anomaly.severity === 'critical' && (
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium text-sm">
            Emergency Response
          </button>
        )}
      </MobileCardActions>
    </MobileCard>
  );
}

interface TrendCardProps {
  trend: {
    metric: string;
    trend: 'increasing' | 'decreasing' | 'stable' | 'erratic';
    rate: number;
    significance: number;
  };
}

function TrendCard({ trend }: TrendCardProps) {
  const getTrendColor = (trendType: string) => {
    switch (trendType) {
      case 'increasing': return 'text-red-400';
      case 'decreasing': return 'text-green-400';
      case 'erratic': return 'text-yellow-400';
      case 'stable': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getTrendIcon = (trendType: string) => {
    switch (trendType) {
      case 'increasing': return '📈';
      case 'decreasing': return '📉';
      case 'erratic': return '📊';
      case 'stable': return '📊';
      default: return '📊';
    }
  };

  return (
    <MobileCard>
      <MobileCardHeader
        title={trend.metric.toUpperCase()}
        subtitle={`Trend: ${trend.trend} • Significance: ${(trend.significance * 100).toFixed(0)}%`}
        avatar={<span className="text-2xl">{getTrendIcon(trend.trend)}</span>}
      />

      <MobileCardContent>
        <div className="text-center">
          <div className={`text-3xl font-bold mb-2 ${getTrendColor(trend.trend)}`}>
            {trend.rate > 0 ? '+' : ''}{trend.rate.toFixed(3)}
          </div>
          <div className="text-sm text-[#45a29e]">Change per day</div>
        </div>
      </MobileCardContent>
    </MobileCard>
  );
}

export default function AnomalyDetectionPage() {
  const [analysis, setAnalysis] = useState<PatternAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState('demo_equipment');

  // Mock equipment list
  const equipmentList = [
    'demo_equipment',
    'HVAC-001',
    'PUMP-002',
    'GENERATOR-003',
    'BOILER-004'
  ];

  const handleAnalyzeEquipment = async () => {
    setLoading(true);
    try {
      // In real app, this would analyze real sensor data
      // For demo, we'll create mock analysis results
      const mockAnalysis: PatternAnalysis = {
        equipmentId: selectedEquipment,
        analysisPeriod: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: new Date(),
        },
        patterns: [
          {
            id: 'anomaly_1',
            equipmentId: selectedEquipment,
            type: 'sensor_anomaly',
            severity: 'high',
            confidence: 0.85,
            description: 'Temperature readings showing abnormal spikes during peak hours',
            detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            indicators: [{
              metric: 'temperature',
              value: 85,
              threshold: 70,
              deviation: 2.1,
            }],
            recommendations: [
              'Check cooling system efficiency',
              'Inspect temperature sensors',
              'Review peak hour operations'
            ],
            predictedImpact: {
              downtime: 4,
              cost: 2500,
              urgency: 'scheduled',
            },
            historicalContext: {
              similarIncidents: 3,
              averageResolutionTime: 3,
              successRate: 0.9,
            },
          },
          {
            id: 'anomaly_2',
            equipmentId: selectedEquipment,
            type: 'maintenance_pattern',
            severity: 'medium',
            confidence: 0.75,
            description: 'Increasing frequency of filter replacements',
            detectedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            indicators: [{
              metric: 'maintenance_frequency',
              value: 2.5,
              threshold: 1.5,
              deviation: 1.0,
            }],
            recommendations: [
              'Investigate air quality issues',
              'Consider higher quality filters',
              'Review maintenance schedule'
            ],
            predictedImpact: {
              downtime: 2,
              cost: 800,
              urgency: 'monitoring',
            },
            historicalContext: {
              similarIncidents: 1,
              averageResolutionTime: 7,
              successRate: 0.8,
            },
          },
        ],
        trends: [
          {
            metric: 'temperature',
            trend: 'increasing',
            rate: 0.05,
            significance: 0.75,
          },
          {
            metric: 'vibration',
            trend: 'stable',
            rate: 0.001,
            significance: 0.3,
          },
          {
            metric: 'efficiency',
            trend: 'decreasing',
            rate: -0.02,
            significance: 0.65,
          },
        ],
        predictions: [
          {
            type: 'maintenance_due',
            probability: 0.7,
            timeToEvent: 15,
            confidence: 0.8,
          },
          {
            type: 'component_failure',
            probability: 0.3,
            timeToEvent: 45,
            confidence: 0.6,
          },
        ],
        healthScore: 72,
        riskAssessment: 'medium',
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      setAnalysis(mockAnalysis);

    } catch (error) {
      console.error('Failed to analyze equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleAnalyzeEquipment();
  }, [selectedEquipment]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'text-red-500 bg-red-500/20';
      case 'high': return 'text-orange-500 bg-orange-500/20';
      case 'medium': return 'text-yellow-500 bg-yellow-500/20';
      case 'low': return 'text-green-500 bg-green-500/20';
      default: return 'text-gray-500 bg-gray-500/20';
    }
  };

  return (
    <DashboardLayout activeTab="analytics">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Anomaly Detection</h1>
          <p className="text-[#45a29e]">
            AI-powered analysis of equipment patterns and anomaly detection
          </p>
        </div>

        {/* Equipment Selector */}
        <div className="mb-6 bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6">
          <h3 className="text-xl font-bold text-white mb-4">Equipment Analysis</h3>

          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-[#45a29e] text-sm font-medium mb-2">
                Select Equipment
              </label>
              <select
                value={selectedEquipment}
                onChange={(e) => setSelectedEquipment(e.target.value)}
                className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg px-3 py-2 text-white focus:border-[#c5a059] focus:outline-none"
              >
                {equipmentList.map(equipment => (
                  <option key={equipment} value={equipment}>{equipment}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleAnalyzeEquipment}
                disabled={loading}
                className="px-6 py-2 bg-[#c5a059] text-[#0b0c10] rounded-lg hover:bg-[#b8954f] transition-colors font-medium disabled:opacity-50"
              >
                {loading ? '🔍 Analyzing...' : '🔍 Analyze Patterns'}
              </button>
            </div>
          </div>
        </div>

        {/* Overall Health Summary */}
        {analysis && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-[#1f2833] rounded-xl p-4 border border-[#45a29e]/20 text-center">
              <div className="text-2xl font-bold text-white mb-1">{analysis.healthScore}/100</div>
              <div className="text-sm text-[#45a29e]">Health Score</div>
            </div>
            <div className={`rounded-xl p-4 text-center ${getRiskColor(analysis.riskAssessment)}`}>
              <div className="text-2xl font-bold mb-1">
                {analysis.riskAssessment.toUpperCase()}
              </div>
              <div className="text-sm opacity-75">Risk Level</div>
            </div>
            <div className="bg-[#1f2833] rounded-xl p-4 border border-[#45a29e]/20 text-center">
              <div className="text-2xl font-bold text-[#c5a059] mb-1">{analysis.patterns.length}</div>
              <div className="text-sm text-[#45a29e]">Anomalies Found</div>
            </div>
            <div className="bg-[#1f2833] rounded-xl p-4 border border-[#45a29e]/20 text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">{analysis.predictions.length}</div>
              <div className="text-sm text-[#45a29e]">Predictions</div>
            </div>
          </div>
        )}

        {/* Anomalies */}
        {analysis && analysis.patterns.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">🚨 Detected Anomalies</h2>
            <div className="space-y-4">
              {analysis.patterns.map((anomaly) => (
                <AnomalyCard key={anomaly.id} anomaly={anomaly} />
              ))}
            </div>
          </div>
        )}

        {/* Trends */}
        {analysis && analysis.trends.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">📈 Performance Trends</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analysis.trends.map((trend, index) => (
                <TrendCard key={index} trend={trend} />
              ))}
            </div>
          </div>
        )}

        {/* Predictions */}
        {analysis && analysis.predictions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">🔮 Future Predictions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.predictions.map((prediction, index) => (
                <MobileCard key={index}>
                  <MobileCardHeader
                    title={prediction.type.replace('_', ' ').toUpperCase()}
                    subtitle={`Probability: ${(prediction.probability * 100).toFixed(0)}% • Confidence: ${(prediction.confidence * 100).toFixed(0)}%`}
                    avatar={<span className="text-2xl">🔮</span>}
                  />
                  <MobileCardContent>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#c5a059] mb-2">
                        {prediction.timeToEvent} days
                      </div>
                      <div className="text-sm text-[#45a29e]">Estimated time to event</div>
                    </div>
                  </MobileCardContent>
                </MobileCard>
              ))}
            </div>
          </div>
        )}

        {/* AI Insights */}
        {analysis && (
          <div className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6">
            <h3 className="text-xl font-bold text-white mb-4">🧠 AI Analysis Insights</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-[#c5a059] font-semibold mb-2">Analysis Summary</h4>
                <p className="text-sm text-[#45a29e] leading-relaxed">
                  Based on {Math.floor((analysis.analysisPeriod.end.getTime() - analysis.analysisPeriod.start.getTime()) / (1000 * 60 * 60 * 24))} days of data analysis,
                  the system detected {analysis.patterns.length} anomalies and identified {analysis.trends.filter(t => t.significance > 0.5).length} significant trends.
                  The equipment health score of {analysis.healthScore}/100 indicates {analysis.riskAssessment} risk level.
                </p>
              </div>
              <div>
                <h4 className="text-[#c5a059] font-semibold mb-2">Recommendations</h4>
                <ul className="text-sm text-[#45a29e] space-y-1">
                  <li>• {analysis.healthScore < 70 ? 'Schedule comprehensive maintenance inspection' : 'Continue regular monitoring'}</li>
                  <li>• Address {analysis.patterns.filter(p => p.severity === 'critical').length} critical anomalies immediately</li>
                  <li>• Monitor {analysis.trends.filter(t => t.trend === 'decreasing').length} degrading performance metrics</li>
                  <li>• Plan preventive maintenance based on predictions</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}