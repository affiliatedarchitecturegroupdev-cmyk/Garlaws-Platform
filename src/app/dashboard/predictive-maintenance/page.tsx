"use client";

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { MobileCard, MobileCardHeader, MobileCardContent, MobileCardActions } from '@/components/MobileCard';
import { predictiveMaintenanceAI, type EquipmentData, type PredictionResult } from '@/lib/predictive-maintenance-ai';

interface EquipmentStatusProps {
  equipment: EquipmentData;
  prediction: PredictionResult;
}

function EquipmentStatusCard({ equipment, prediction }: EquipmentStatusProps) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getRiskBg = (risk: string) => {
    switch (risk) {
      case 'critical': return 'bg-red-500/20';
      case 'high': return 'bg-orange-500/20';
      case 'medium': return 'bg-yellow-500/20';
      case 'low': return 'bg-green-500/20';
      default: return 'bg-gray-500/20';
    }
  };

  return (
    <MobileCard className={`${getRiskBg(prediction.riskLevel)} border-l-4 ${
      prediction.riskLevel === 'critical' ? 'border-red-500' :
      prediction.riskLevel === 'high' ? 'border-orange-500' :
      prediction.riskLevel === 'medium' ? 'border-yellow-500' :
      'border-green-500'
    }`}>
      <MobileCardHeader
        title={`${equipment.type} - ${equipment.equipmentId}`}
        subtitle={`Location: ${equipment.location}`}
        avatar={<span className="text-2xl">⚙️</span>}
      />

      <MobileCardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#45a29e]">Risk Level:</span>
            <span className={`font-semibold ${getRiskColor(prediction.riskLevel)}`}>
              {prediction.riskLevel.toUpperCase()}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-[#45a29e]">Probability:</span>
            <span className="font-semibold">{(prediction.probability * 100).toFixed(1)}%</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-[#45a29e]">Confidence:</span>
            <span className="font-semibold">{(prediction.confidence * 100).toFixed(1)}%</span>
          </div>

          {prediction.predictedFailureDate && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#45a29e]">Predicted Failure:</span>
              <span className="font-semibold text-red-400">
                {prediction.predictedFailureDate.toLocaleDateString()}
              </span>
            </div>
          )}

          <div className="mt-3 p-3 bg-[#1f2833] rounded-lg">
            <h4 className="text-sm font-semibold text-[#c5a059] mb-2">Recommendation:</h4>
            <p className="text-sm text-white">{prediction.recommendedAction}</p>
          </div>

          {prediction.factors.length > 0 && (
            <div className="mt-3">
              <h4 className="text-sm font-semibold text-[#c5a059] mb-2">Contributing Factors:</h4>
              <div className="space-y-1">
                {prediction.factors.slice(0, 3).map((factor: any, index: number) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span className="text-[#45a29e]">{factor.factor}:</span>
                    <span className="text-white">{factor.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </MobileCardContent>

      <MobileCardActions>
        <button className="px-4 py-2 bg-[#c5a059] text-[#0b0c10] rounded-lg font-medium text-sm">
          View Details
        </button>
        {prediction.urgency === 'immediate' && (
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium text-sm">
            Schedule Emergency
          </button>
        )}
      </MobileCardActions>
    </MobileCard>
  );
}

export default function PredictiveMaintenancePage() {
  const [equipment, setEquipment] = useState<EquipmentData[]>([]);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('all');

  useEffect(() => {
    loadEquipmentData();
  }, []);

  const loadEquipmentData = async () => {
    try {
      setLoading(true);

      // Mock equipment data - in real app, this would come from API
      const mockEquipment: EquipmentData[] = [
        {
          equipmentId: 'HVAC-001',
          type: 'HVAC',
          location: 'Building A - Floor 1',
          readings: [
            { timestamp: new Date(), temperature: 28, current: 12, pressure: 15 },
            { timestamp: new Date(Date.now() - 3600000), temperature: 26, current: 11, pressure: 14 },
          ],
          installationDate: new Date('2020-01-01'),
          lastMaintenance: new Date('2024-01-01'),
          maintenanceHistory: [
            { date: new Date('2024-01-01'), type: 'Annual Service', cost: 1200, duration: 4, parts: ['Filter', 'Belt'] }
          ]
        },
        {
          equipmentId: 'PUMP-002',
          type: 'pump',
          location: 'Water System - Basement',
          readings: [
            { timestamp: new Date(), vibration: 2.1, current: 8, pressure: 45 },
            { timestamp: new Date(Date.now() - 3600000), vibration: 1.8, current: 7.5, pressure: 44 },
          ],
          installationDate: new Date('2019-06-01'),
          lastMaintenance: new Date('2024-02-01'),
          maintenanceHistory: [
            { date: new Date('2024-02-01'), type: 'Bearing Replacement', cost: 800, duration: 2, parts: ['Bearings'] }
          ]
        },
        {
          equipmentId: 'GEN-003',
          type: 'generator',
          location: 'Emergency Power - Roof',
          readings: [
            { timestamp: new Date(), voltage: 415, current: 25, temperature: 85, noise: 75 },
            { timestamp: new Date(Date.now() - 3600000), voltage: 412, current: 24, temperature: 82, noise: 72 },
          ],
          installationDate: new Date('2021-03-01'),
          lastMaintenance: new Date('2024-03-01'),
          maintenanceHistory: [
            { date: new Date('2024-03-01'), type: 'Full Service', cost: 2500, duration: 6, parts: ['Oil', 'Filters'] }
          ]
        }
      ];

      setEquipment(mockEquipment);

      // Generate predictions for all equipment
      const predictionPromises = mockEquipment.map(eq => predictiveMaintenanceAI.analyzeEquipment(eq));
      const results = await Promise.all(predictionPromises);
      setPredictions(results);

    } catch (error) {
      console.error('Failed to load equipment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPredictions = predictions.filter(prediction => {
    if (selectedRiskLevel === 'all') return true;
    return prediction.riskLevel === selectedRiskLevel;
  });

  const getRiskStats = () => {
    const stats = {
      critical: predictions.filter(p => p.riskLevel === 'critical').length,
      high: predictions.filter(p => p.riskLevel === 'high').length,
      medium: predictions.filter(p => p.riskLevel === 'medium').length,
      low: predictions.filter(p => p.riskLevel === 'low').length,
    };
    return stats;
  };

  if (loading) {
    return (
      <DashboardLayout activeTab="analytics">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-6xl mb-4">🤖</div>
            <h2 className="text-2xl font-bold text-[#c5a059] mb-2">Analyzing Equipment...</h2>
            <p className="text-[#45a29e]">AI is processing maintenance predictions</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const stats = getRiskStats();

  return (
    <DashboardLayout activeTab="analytics">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Predictive Maintenance</h1>
          <p className="text-[#45a29e]">
            AI-powered equipment health monitoring and maintenance predictions
          </p>
        </div>

        {/* Risk Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-red-400 mb-1">{stats.critical}</div>
            <div className="text-sm text-red-300">Critical</div>
          </div>
          <div className="bg-orange-500/20 border border-orange-500/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-orange-400 mb-1">{stats.high}</div>
            <div className="text-sm text-orange-300">High Risk</div>
          </div>
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">{stats.medium}</div>
            <div className="text-sm text-yellow-300">Medium Risk</div>
          </div>
          <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">{stats.low}</div>
            <div className="text-sm text-green-300">Low Risk</div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <span className="text-white font-medium mr-2">Filter by Risk:</span>
            {[
              { value: 'all', label: 'All Equipment', color: 'bg-[#45a29e]' },
              { value: 'critical', label: 'Critical', color: 'bg-red-600' },
              { value: 'high', label: 'High Risk', color: 'bg-orange-600' },
              { value: 'medium', label: 'Medium Risk', color: 'bg-yellow-600' },
              { value: 'low', label: 'Low Risk', color: 'bg-green-600' },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setSelectedRiskLevel(filter.value)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedRiskLevel === filter.value
                    ? `${filter.color} text-white`
                    : 'bg-[#2d3b2d] border border-[#45a29e]/20 text-[#45a29e] hover:border-[#45a29e]/40'
                }`}
              >
                {filter.label} ({filter.value === 'all' ? equipment.length : stats[filter.value as keyof typeof stats]})
              </button>
            ))}
          </div>
        </div>

        {/* Equipment List */}
        <div className="space-y-4">
          {filteredPredictions.length === 0 ? (
            <div className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-white mb-2">No equipment found</h3>
              <p className="text-[#45a29e]">
                {selectedRiskLevel === 'all'
                  ? 'No equipment data available.'
                  : `No equipment with ${selectedRiskLevel} risk level found.`
                }
              </p>
            </div>
          ) : (
            filteredPredictions.map((prediction) => {
              const eq = equipment.find(e => e.equipmentId === prediction.equipmentId);
              if (!eq) return null;

              return (
                <EquipmentStatusCard
                  key={prediction.equipmentId}
                  equipment={eq}
                  prediction={prediction}
                />
              );
            })
          )}
        </div>

        {/* AI Insights */}
        <div className="mt-8 bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6">
          <h3 className="text-xl font-bold text-white mb-4">AI Insights</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-[#c5a059] font-semibold mb-2">Maintenance Recommendations</h4>
              <ul className="space-y-1 text-sm text-[#45a29e]">
                <li>• Schedule preventive maintenance for high-risk equipment</li>
                <li>• Monitor temperature fluctuations in HVAC systems</li>
                <li>• Check vibration levels in pumps and motors</li>
                <li>• Regular calibration of sensors and monitoring devices</li>
              </ul>
            </div>
            <div>
              <h4 className="text-[#c5a059] font-semibold mb-2">System Health</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#45a29e]">Overall System Health:</span>
                  <span className="text-green-400 font-semibold">87%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#45a29e]">Equipment Uptime:</span>
                  <span className="text-green-400 font-semibold">94%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#45a29e]">Predictive Accuracy:</span>
                  <span className="text-blue-400 font-semibold">89%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}