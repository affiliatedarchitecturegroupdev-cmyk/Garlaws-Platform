'use client';

import { useState, useEffect, useCallback } from 'react';
import ModelInterpretability from '@/features/data-science/model-interpretability/ModelInterpretability';

interface Equipment {
  id: string;
  name: string;
  type: string;
  location: string;
  status: 'healthy' | 'warning' | 'critical' | 'maintenance';
  lastMaintenance: string;
  nextMaintenance: string;
  healthScore: number; // 0-100
  predictedFailure: string | null;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  sensors: Sensor[];
}

interface Sensor {
  id: string;
  name: string;
  value: number;
  unit: string;
  threshold: {
    warning: number;
    critical: number;
  };
  trend: 'stable' | 'increasing' | 'decreasing';
}

interface MaintenancePrediction {
  equipmentId: string;
  predictedFailureDate: string;
  confidence: number;
  riskFactors: string[];
  recommendedActions: string[];
  estimatedCost: number;
}

interface PredictiveMaintenanceProps {
  tenantId?: string;
}

export default function PredictiveMaintenance({ tenantId = 'default' }: PredictiveMaintenanceProps) {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [predictions, setPredictions] = useState<MaintenancePrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [showPredictions, setShowPredictions] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'interpretability'>('overview');

  const fetchEquipment = useCallback(async () => {
    try {
      const response = await fetch(`/api/ml?action=equipment&tenantId=${tenantId}&timeRange=${timeRange}`);
      const data = await response.json();
      if (data.success) {
        setEquipment(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
    }
  }, [tenantId, timeRange]);

  const fetchPredictions = useCallback(async () => {
    try {
      const response = await fetch(`/api/ml?action=predictions&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setPredictions(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch predictions:', error);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchEquipment();
    fetchPredictions();
  }, [fetchEquipment, fetchPredictions]);

  const getEquipmentPrediction = (equipmentId: string) => {
    return predictions.find(p => p.equipmentId === equipmentId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const scheduleMaintenance = async (equipmentId: string) => {
    try {
      const response = await fetch('/api/ml', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'schedule-maintenance',
          tenantId,
          equipmentId
        })
      });

      const data = await response.json();
      if (data.success) {
        fetchEquipment();
        alert('Maintenance scheduled successfully');
      }
    } catch (error) {
      console.error('Failed to schedule maintenance:', error);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Predictive Maintenance</h2>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button
            onClick={() => setShowPredictions(!showPredictions)}
            className={`px-4 py-2 rounded-md transition-colors ${
              showPredictions ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {showPredictions ? 'Hide Predictions' : 'Show Predictions'}
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Equipment</p>
              <p className="text-2xl font-bold text-gray-900">{equipment.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Healthy Equipment</p>
              <p className="text-2xl font-bold text-green-600">
                {equipment.filter(e => e.status === 'healthy').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical Equipment</p>
              <p className="text-2xl font-bold text-red-600">
                {equipment.filter(e => e.status === 'critical').length}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Predictions</p>
              <p className="text-2xl font-bold text-purple-600">{predictions.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'details'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Equipment Details
          </button>
          <button
            onClick={() => setActiveTab('interpretability')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'interpretability'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Model Interpretability
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'interpretability' ? (
        <ModelInterpretability
          modelResults={{
            prediction: 0.85,
            modelType: 'predictive_maintenance',
            accuracy: 0.92
          }}
          featureData={equipment.flatMap(eq => eq.sensors.map(sensor => ({
            equipmentId: eq.id,
            sensorName: sensor.name,
            value: sensor.value,
            unit: sensor.unit,
            trend: sensor.trend
          })))}
          onInterpretationComplete={(interpretation) => console.log('Maintenance model interpretation:', interpretation)}
        />
      ) : (
        <div className="space-y-6">
          {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipment.map((item) => {
          const prediction = getEquipmentPrediction(item.id);
          return (
            <div
              key={item.id}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-600">{item.type} • {item.location}</p>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                  {item.status.toUpperCase()}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Health Score:</span>
                  <span className={`font-semibold ${getHealthScoreColor(item.healthScore)}`}>
                    {item.healthScore}%
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      item.healthScore >= 80 ? 'bg-green-500' :
                      item.healthScore >= 60 ? 'bg-yellow-500' :
                      item.healthScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${item.healthScore}%` }}
                  ></div>
                </div>

                {prediction && showPredictions && (
                  <div className="border border-orange-200 rounded-lg p-3 bg-orange-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-orange-800">Predicted Failure</span>
                      <span className={`text-xs font-medium ${getRiskColor(prediction.riskFactors.includes('high') ? 'high' : 'medium')}`}>
                        {Math.round(prediction.confidence * 100)}% confidence
                      </span>
                    </div>
                    <p className="text-sm text-orange-700 mb-2">
                      {new Date(prediction.predictedFailureDate).toLocaleDateString()}
                    </p>
                    <div className="space-y-1">
                      <p className="text-xs text-orange-600">Recommended Actions:</p>
                      <ul className="text-xs text-orange-600 space-y-1">
                        {prediction.recommendedActions.slice(0, 2).map((action, index) => (
                          <li key={index}>• {action}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <div className="flex justify-between text-xs text-gray-500">
                  <span>Last: {new Date(item.lastMaintenance).toLocaleDateString()}</span>
                  <span>Next: {new Date(item.nextMaintenance).toLocaleDateString()}</span>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedEquipment(item)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </button>
                  {item.status !== 'healthy' && (
                    <button
                      onClick={() => scheduleMaintenance(item.id)}
                      className="px-3 py-2 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700 transition-colors"
                    >
                      Schedule
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Equipment Detail Modal */}
      {selectedEquipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {selectedEquipment.name} - Sensor Data
              </h3>
              <button
                onClick={() => setSelectedEquipment(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">Health Score</h4>
                  <p className={`text-2xl font-bold ${getHealthScoreColor(selectedEquipment.healthScore)}`}>
                    {selectedEquipment.healthScore}%
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">Status</h4>
                  <p className={`text-lg font-semibold ${getStatusColor(selectedEquipment.status)} px-2 py-1 rounded text-center`}>
                    {selectedEquipment.status}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">Last Maintenance</h4>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(selectedEquipment.lastMaintenance).toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">Next Maintenance</h4>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(selectedEquipment.nextMaintenance).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Sensor Readings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedEquipment.sensors.map((sensor) => (
                    <div key={sensor.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="font-medium text-gray-900">{sensor.name}</h5>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm ${
                            sensor.value > sensor.threshold.critical ? 'text-red-600' :
                            sensor.value > sensor.threshold.warning ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {sensor.trend === 'increasing' ? '↗' :
                             sensor.trend === 'decreasing' ? '↘' : '→'}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-gray-900">
                          {sensor.value} {sensor.unit}
                        </span>
                        <div className="text-right text-sm text-gray-600">
                          <div>Warning: {sensor.threshold.warning}</div>
                          <div>Critical: {sensor.threshold.critical}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => scheduleMaintenance(selectedEquipment.id)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Schedule Maintenance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      )}
    </div>
  );
}