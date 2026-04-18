"use client";

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { MobileCard, MobileCardHeader, MobileCardContent, MobileCardActions } from '@/components/MobileCard';
import { riskAssessmentEngine, type RiskAssessment, type RiskFactor } from '@/lib/risk-assessment-engine';

interface RiskFactorCardProps {
  factor: RiskFactor;
}

function RiskFactorCard({ factor }: RiskFactorCardProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'environmental': return '🌍';
      case 'operational': return '⚙️';
      case 'financial': return '💰';
      case 'regulatory': return '📋';
      case 'safety': return '🛡️';
      default: return '⚠️';
    }
  };

  const riskScore = (factor.probability * factor.impact * 100).toFixed(0);

  return (
    <MobileCard className={`${getSeverityColor(factor.severity)} border-l-4 ${
      factor.severity === 'critical' ? 'border-l-red-500' :
      factor.severity === 'high' ? 'border-l-orange-500' :
      factor.severity === 'medium' ? 'border-l-yellow-500' :
      'border-l-green-500'
    }`}>
      <MobileCardHeader
        title={`${factor.name} (${factor.category.toUpperCase()})`}
        subtitle={`Risk Score: ${riskScore}/100 • Weight: ${(factor.weight * 100).toFixed(0)}%`}
        avatar={<span className="text-2xl">{getCategoryIcon(factor.category)}</span>}
      />

      <MobileCardContent>
        <div className="space-y-3">
          <p className="text-white text-sm">{factor.description}</p>

          {/* Risk Metrics */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-[#1f2833] rounded p-2">
              <div className="text-sm font-bold text-blue-400">
                {(factor.probability * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-[#45a29e]">Probability</div>
            </div>
            <div className="bg-[#1f2833] rounded p-2">
              <div className="text-sm font-bold text-yellow-400">
                {(factor.impact * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-[#45a29e]">Impact</div>
            </div>
            <div className="bg-[#1f2833] rounded p-2">
              <div className={`text-sm font-bold capitalize ${
                factor.severity === 'critical' ? 'text-red-400' :
                factor.severity === 'high' ? 'text-orange-400' :
                factor.severity === 'medium' ? 'text-yellow-400' :
                'text-green-400'
              }`}>
                {factor.severity}
              </div>
              <div className="text-xs text-[#45a29e]">Severity</div>
            </div>
          </div>
        </div>
      </MobileCardContent>
    </MobileCard>
  );
}

interface MitigationCardProps {
  mitigation: {
    strategy: string;
    effectiveness: number;
    cost: number;
    timeline: string;
    priority: 'low' | 'medium' | 'high';
  };
}

function MitigationCard({ mitigation }: MitigationCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <MobileCard>
      <MobileCardHeader
        title={mitigation.strategy}
        subtitle={`Effectiveness: ${(mitigation.effectiveness * 100).toFixed(0)}% • Cost: R${mitigation.cost.toLocaleString()}`}
        avatar={<span className="text-2xl">🛠️</span>}
      />

      <MobileCardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-[#45a29e]">Timeline</div>
            <div className="text-white font-semibold">{mitigation.timeline}</div>
          </div>
          <div>
            <div className="text-sm text-[#45a29e]">Priority</div>
            <div className={`font-semibold px-2 py-1 rounded text-sm capitalize ${getPriorityColor(mitigation.priority)}`}>
              {mitigation.priority}
            </div>
          </div>
        </div>
      </MobileCardContent>
    </MobileCard>
  );
}

export default function RiskAssessmentPage() {
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [loading, setLoading] = useState(false);
  const [assessmentType, setAssessmentType] = useState<'property' | 'equipment' | 'operational'>('property');
  const [targetId, setTargetId] = useState('demo_property_001');
  const [assessmentHistory, setAssessmentHistory] = useState<RiskAssessment[]>([]);

  const assessmentTypes = [
    { value: 'property', label: 'Property Assessment', icon: '🏠' },
    { value: 'equipment', label: 'Equipment Assessment', icon: '🔧' },
    { value: 'operational', label: 'Operational Assessment', icon: '📊' }
  ];

  const mockTargets = {
    property: [
      { id: 'demo_property_001', name: 'Office Building A', location: 'Sandton' },
      { id: 'demo_property_002', name: 'Retail Complex B', location: 'Johannesburg CBD' },
      { id: 'demo_property_003', name: 'Residential Tower C', location: 'Cape Town' }
    ],
    equipment: [
      { id: 'demo_equip_001', name: 'HVAC System Alpha', type: 'Heating/Cooling' },
      { id: 'demo_equip_002', name: 'Elevator Beta', type: 'Vertical Transport' },
      { id: 'demo_equip_003', name: 'Generator Gamma', type: 'Power Backup' }
    ],
    operational: [
      { id: 'demo_ops_001', name: 'Building Management', type: 'Facility Operations' },
      { id: 'demo_ops_002', name: 'Maintenance Services', type: 'Service Delivery' },
      { id: 'demo_ops_003', name: 'Compliance Program', type: 'Regulatory' }
    ]
  };

  const handlePerformAssessment = async () => {
    setLoading(true);
    try {
      // Generate mock assessment data based on type
      const mockData = assessmentType === 'property' ? {
        propertyAge: Math.floor(Math.random() * 50) + 5,
        locationRisk: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        lastMaintenance: Math.floor(Math.random() * 365),
        occupancyType: ['residential', 'commercial', 'industrial'][Math.floor(Math.random() * 3)]
      } : assessmentType === 'equipment' ? {
        equipmentAge: Math.floor(Math.random() * 20) + 1,
        usageHours: Math.floor(Math.random() * 10000) + 1000,
        lastMaintenance: Math.floor(Math.random() * 180),
        operatingEnvironment: ['indoor', 'outdoor', 'harsh'][Math.floor(Math.random() * 3)]
      } : {
        complianceScore: Math.floor(Math.random() * 40) + 60,
        financialHealth: ['excellent', 'good', 'fair', 'poor'][Math.floor(Math.random() * 4)],
        marketConditions: ['booming', 'stable', 'declining'][Math.floor(Math.random() * 3)],
        safetyIncidents: Math.floor(Math.random() * 5)
      };

      // In real app, this would call the API
      // const response = await fetch('/api/risk-assessment', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ assessmentType, targetId, assessmentData: mockData })
      // });
      // const result = await response.json();

      // For demo, use the engine directly
      const result = await riskAssessmentEngine.performAssessment(assessmentType, targetId, mockData);

      setAssessment(result);

      // Add to history
      setAssessmentHistory(prev => [result, ...prev.slice(0, 9)]);

    } catch (error) {
      console.error('Failed to perform assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-500 bg-red-500/20';
      case 'high': return 'text-orange-500 bg-orange-500/20';
      case 'medium': return 'text-yellow-500 bg-yellow-500/20';
      case 'low': return 'text-green-500 bg-green-500/20';
      default: return 'text-gray-500 bg-gray-500/20';
    }
  };

  const getRiskLevelIcon = (level: string) => {
    switch (level) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      case 'low': return '✅';
      default: return '❓';
    }
  };

  useEffect(() => {
    // Load initial mock assessment
    handlePerformAssessment();
  }, []);

  return (
    <DashboardLayout activeTab="analytics">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Risk Assessment</h1>
          <p className="text-[#45a29e]">
            Comprehensive risk analysis for properties, equipment, and operations
          </p>
        </div>

        {/* Assessment Controls */}
        <div className="mb-6 bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6">
          <h3 className="text-xl font-bold text-white mb-4">Risk Assessment Parameters</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-[#45a29e] text-sm font-medium mb-2">
                Assessment Type
              </label>
              <select
                value={assessmentType}
                onChange={(e) => {
                  const newType = e.target.value as 'property' | 'equipment' | 'operational';
                  setAssessmentType(newType);
                  setTargetId(mockTargets[newType][0].id);
                }}
                className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg px-3 py-2 text-white focus:border-[#c5a059] focus:outline-none"
              >
                {assessmentTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#45a29e] text-sm font-medium mb-2">
                Target Asset
              </label>
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg px-3 py-2 text-white focus:border-[#c5a059] focus:outline-none"
              >
                {mockTargets[assessmentType].map(target => (
                  <option key={target.id} value={target.id}>
                    {target.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handlePerformAssessment}
                disabled={loading}
                className="w-full px-6 py-2 bg-[#c5a059] text-[#0b0c10] rounded-lg hover:bg-[#b8954f] transition-colors font-bold disabled:opacity-50"
              >
                {loading ? '🔍 Assessing...' : '🔍 Perform Assessment'}
              </button>
            </div>
          </div>
        </div>

        {/* Overall Risk Summary */}
        {assessment && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className={`rounded-xl p-4 text-center ${getRiskLevelColor(assessment.riskLevel)}`}>
              <div className="text-2xl mb-2">{getRiskLevelIcon(assessment.riskLevel)}</div>
              <div className="text-2xl font-bold mb-1 uppercase">
                {assessment.riskLevel}
              </div>
              <div className="text-sm opacity-75">Risk Level</div>
            </div>
            <div className="bg-[#1f2833] rounded-xl p-4 border border-[#45a29e]/20 text-center">
              <div className="text-2xl font-bold text-white mb-1">{assessment.overallRiskScore}/100</div>
              <div className="text-sm text-[#45a29e]">Risk Score</div>
            </div>
            <div className="bg-[#1f2833] rounded-xl p-4 border border-[#45a29e]/20 text-center">
              <div className="text-2xl font-bold text-[#c5a059] mb-1">{assessment.riskFactors.length}</div>
              <div className="text-sm text-[#45a29e]">Risk Factors</div>
            </div>
            <div className="bg-[#1f2833] rounded-xl p-4 border border-[#45a29e]/20 text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">{assessment.mitigationStrategies.length}</div>
              <div className="text-sm text-[#45a29e]">Mitigations</div>
            </div>
          </div>
        )}

        {/* Risk Factors */}
        {assessment && assessment.riskFactors.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">📊 Risk Factors Analysis</h2>
            <div className="space-y-4">
              {assessment.riskFactors.map((factor, index) => (
                <RiskFactorCard key={index} factor={factor} />
              ))}
            </div>
          </div>
        )}

        {/* Mitigation Strategies */}
        {assessment && assessment.mitigationStrategies.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">🛠️ Mitigation Strategies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assessment.mitigationStrategies.map((mitigation, index) => (
                <MitigationCard key={index} mitigation={mitigation} />
              ))}
            </div>
          </div>
        )}

        {/* Insurance Recommendations */}
        {assessment && assessment.insuranceRecommendations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">🛡️ Insurance Recommendations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assessment.insuranceRecommendations.map((rec, index) => (
                <MobileCard key={index}>
                  <MobileCardHeader
                    title={rec.type}
                    subtitle={`Coverage: R${rec.coverage.toLocaleString()} • Premium: R${rec.premium.toLocaleString()}/year`}
                    avatar={<span className="text-2xl">🛡️</span>}
                  />
                  <MobileCardContent>
                    <p className="text-white text-sm">{rec.justification}</p>
                  </MobileCardContent>
                  <MobileCardActions>
                    <button className="px-4 py-2 bg-[#c5a059] text-[#0b0c10] rounded-lg font-medium text-sm">
                      Get Quote
                    </button>
                  </MobileCardActions>
                </MobileCard>
              ))}
            </div>
          </div>
        )}

        {/* Assessment History */}
        {assessmentHistory.length > 1 && (
          <div className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6">
            <h3 className="text-xl font-bold text-white mb-4">📈 Assessment History</h3>
            <div className="space-y-3">
              {assessmentHistory.slice(0, 5).map((hist, index) => (
                <div key={hist.id} className="flex justify-between items-center p-3 bg-[#0b0c10] rounded-lg">
                  <div>
                    <div className="text-white font-semibold">
                      {hist.assessmentType.toUpperCase()} - {hist.targetId}
                    </div>
                    <div className="text-sm text-[#45a29e]">
                      {hist.assessmentDate.toLocaleDateString()} • Score: {hist.overallRiskScore}/100
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskLevelColor(hist.riskLevel)}`}>
                    {hist.riskLevel.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <button className="bg-[#c5a059] text-[#0b0c10] p-6 rounded-xl hover:opacity-90 transition-all text-center">
            <div className="text-3xl mb-3">📄</div>
            <h3 className="font-bold mb-2">Export Report</h3>
            <p className="text-sm opacity-80">Download detailed assessment</p>
          </button>

          <button className="bg-[#45a29e] text-white p-6 rounded-xl hover:opacity-90 transition-all text-center">
            <div className="text-3xl mb-3">📅</div>
            <h3 className="font-bold mb-2">Schedule Review</h3>
            <p className="text-sm opacity-80">Plan mitigation timeline</p>
          </button>

          <button className="bg-[#1f2833] border border-[#45a29e]/20 text-[#45a29e] p-6 rounded-xl hover:bg-[#45a29e]/10 transition-all text-center">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-bold mb-2">Trend Analysis</h3>
            <p className="text-sm opacity-80">View risk trends over time</p>
          </button>

          <button className="bg-[#1f2833] border border-[#45a29e]/20 text-[#45a29e] p-6 rounded-xl hover:bg-[#45a29e]/10 transition-all text-center">
            <div className="text-3xl mb-3">🔄</div>
            <h3 className="font-bold mb-2">Re-assess</h3>
            <p className="text-sm opacity-80">Update with new data</p>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}