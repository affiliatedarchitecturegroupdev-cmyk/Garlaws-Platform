"use client";

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { MobileCard, MobileCardHeader, MobileCardContent, MobileCardActions } from '@/components/MobileCard';
import { Property3DViewer } from '@/components/Property3DViewer';
import { digitalTwinEngine, type DigitalTwin, type Room, type Sensor, type SystemState } from '@/lib/digital-twin-engine';

interface SensorCardProps {
  sensor: Sensor;
  latestReading?: any;
}

function SensorCard({ sensor, latestReading }: SensorCardProps) {
  const getSensorIcon = (type: string) => {
    const icons = {
      temperature: '🌡️',
      humidity: '💧',
      motion: '👤',
      light: '💡',
      sound: '🔊',
      air_quality: '🌬️',
      energy: '⚡',
      water: '🚰',
      security: '🔒'
    };
    return icons[type as keyof typeof icons] || '📊';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/20';
      case 'inactive': return 'text-gray-400 bg-gray-500/20';
      case 'maintenance': return 'text-yellow-400 bg-yellow-500/20';
      case 'error': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === 'temperature') return `${value.toFixed(1)}°C`;
    if (unit === 'humidity') return `${value.toFixed(0)}%`;
    if (unit === 'energy') return `${value.toFixed(0)}W`;
    if (unit === 'water') return `${value.toFixed(1)}L/min`;
    return `${value.toFixed(2)} ${unit}`;
  };

  return (
    <MobileCard className="border-l-4 border-l-[#c5a059]">
      <MobileCardHeader
        title={`${sensor.type.replace('_', ' ').toUpperCase()} Sensor`}
        subtitle={`${sensor.location.roomId} • ${sensor.specifications.model}`}
        avatar={<span className="text-2xl">{getSensorIcon(sensor.type)}</span>}
      />

      <MobileCardContent>
        <div className="space-y-3">
          {/* Current Reading */}
          {latestReading ? (
            <div className="bg-[#0b0c10] rounded-lg p-3">
              <div className="text-sm text-[#45a29e] mb-1">Current Reading</div>
              <div className="text-white text-lg font-bold">
                {formatValue(latestReading.value, sensor.type)}
              </div>
              <div className="text-xs text-[#45a29e]">
                {new Date(latestReading.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ) : (
            <div className="bg-[#0b0c10] rounded-lg p-3 text-center">
              <div className="text-[#45a29e]">No recent readings</div>
            </div>
          )}

          {/* Sensor Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-[#45a29e]">Range</div>
              <div className="text-white">
                {sensor.specifications.range[0]} - {sensor.specifications.range[1]}
              </div>
            </div>
            <div>
              <div className="text-[#45a29e]">Accuracy</div>
              <div className="text-white">{(sensor.specifications.accuracy * 100).toFixed(1)}%</div>
            </div>
            {sensor.specifications.batteryLevel && (
              <div>
                <div className="text-[#45a29e]">Battery</div>
                <div className="text-white">{sensor.specifications.batteryLevel}%</div>
              </div>
            )}
            <div>
              <div className="text-[#45a29e]">Status</div>
              <div className={`font-semibold px-2 py-1 rounded text-xs capitalize ${getStatusColor(sensor.status)}`}>
                {sensor.status}
              </div>
            </div>
          </div>
        </div>
      </MobileCardContent>

      <MobileCardActions>
        <button className="px-3 py-2 bg-[#45a29e]/20 border border-[#45a29e]/40 text-[#45a29e] rounded-lg font-medium text-sm">
          View History
        </button>
        <button className="px-3 py-2 bg-[#c5a059] text-[#0b0c10] rounded-lg font-medium text-sm">
          Configure
        </button>
      </MobileCardActions>
    </MobileCard>
  );
}

interface SystemStatusCardProps {
  systemState: SystemState;
}

function SystemStatusCard({ systemState }: SystemStatusCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-400 bg-green-500/20';
      case 'warning': return 'text-yellow-400 bg-yellow-500/20';
      case 'error': return 'text-red-400 bg-red-500/20';
      case 'maintenance': return 'text-blue-400 bg-blue-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getSystemIcon = (systemId: string) => {
    if (systemId.includes('hvac')) return '❄️';
    if (systemId.includes('electrical')) return '⚡';
    if (systemId.includes('security')) return '🔒';
    if (systemId.includes('plumbing')) return '🚰';
    return '🔧';
  };

  return (
    <MobileCard>
      <MobileCardHeader
        title={systemState.component.toUpperCase()}
        subtitle={systemState.systemId.replace('_', ' ')}
        avatar={<span className="text-2xl">{getSystemIcon(systemState.systemId)}</span>}
      />

      <MobileCardContent>
        <div className="space-y-3">
          {/* Status */}
          <div className="flex justify-between items-center">
            <span className="text-[#45a29e]">Status</span>
            <div className={`px-2 py-1 rounded text-sm font-semibold capitalize ${getStatusColor(systemState.status)}`}>
              {systemState.status}
            </div>
          </div>

          {/* Metrics */}
          <div className="space-y-2">
            {Object.entries(systemState.metrics).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-[#45a29e] capitalize">{key.replace('_', ' ')}</span>
                <span className="text-white">
                  {typeof value === 'number' ? value.toFixed(1) : value}
                </span>
              </div>
            ))}
          </div>

          {/* Last Updated */}
          <div className="text-xs text-[#45a29e] pt-2 border-t border-[#45a29e]/20">
            Updated: {systemState.lastUpdated.toLocaleTimeString()}
          </div>
        </div>
      </MobileCardContent>

      <MobileCardActions>
        <button className="px-3 py-2 bg-[#c5a059] text-[#0b0c10] rounded-lg font-medium text-sm">
          View Details
        </button>
      </MobileCardActions>
    </MobileCard>
  );
}

interface MaintenancePredictionCardProps {
  prediction: {
    system: string;
    component: string;
    predictedFailure: Date;
    confidence: number;
    recommendedAction: string;
  };
}

function MaintenancePredictionCard({ prediction }: MaintenancePredictionCardProps) {
  const daysUntilFailure = Math.ceil(
    (prediction.predictedFailure.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const getUrgencyColor = (days: number) => {
    if (days <= 7) return 'text-red-400 bg-red-500/20 border-red-500/30';
    if (days <= 30) return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
    if (days <= 90) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    return 'text-green-400 bg-green-500/20 border-green-500/30';
  };

  return (
    <MobileCard className={`border-l-4 ${getUrgencyColor(daysUntilFailure)}`}>
      <MobileCardHeader
        title={`${prediction.system} Maintenance`}
        subtitle={`${prediction.component} • ${(prediction.confidence * 100).toFixed(0)}% confidence`}
        avatar={<span className="text-2xl">🔧</span>}
      />

      <MobileCardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-[#45a29e]">Days Until Issue</div>
              <div className={`text-lg font-bold ${
                daysUntilFailure <= 7 ? 'text-red-400' :
                daysUntilFailure <= 30 ? 'text-orange-400' :
                daysUntilFailure <= 90 ? 'text-yellow-400' :
                'text-green-400'
              }`}>
                {daysUntilFailure}
              </div>
            </div>
            <div>
              <div className="text-sm text-[#45a29e]">Predicted Date</div>
              <div className="text-white text-sm">
                {prediction.predictedFailure.toLocaleDateString()}
              </div>
            </div>
          </div>

          <div>
            <div className="text-sm text-[#45a29e] mb-1">Recommended Action</div>
            <div className="text-white text-sm">{prediction.recommendedAction}</div>
          </div>
        </div>
      </MobileCardContent>

      <MobileCardActions>
        <button className="px-3 py-2 bg-[#c5a059] text-[#0b0c10] rounded-lg font-medium text-sm">
          Schedule Service
        </button>
        <button className="px-3 py-2 bg-[#45a29e]/20 border border-[#45a29e]/40 text-[#45a29e] rounded-lg font-medium text-sm">
          View Details
        </button>
      </MobileCardActions>
    </MobileCard>
  );
}

export default function DigitalTwinDashboard() {
  const [twin, setTwin] = useState<DigitalTwin | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTwinId, setSelectedTwinId] = useState('twin_PROP_001');
  const [activeTab, setActiveTab] = useState<'overview' | 'sensors' | 'systems' | 'maintenance' | 'simulation'>('overview');
  const [maintenancePredictions, setMaintenancePredictions] = useState<any[]>([]);
  const [simulationResults, setSimulationResults] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Available digital twins
  const availableTwins = [
    { id: 'twin_PROP_001', name: 'Sample Property Twin', location: 'Johannesburg' },
    { id: 'twin_PROP_002', name: 'Office Building Alpha', location: 'Sandton' },
    { id: 'twin_PROP_003', name: 'Residential Complex', location: 'Cape Town' }
  ];

  // Load digital twin data
  useEffect(() => {
    const loadTwin = async () => {
      setLoading(true);
      try {
        const twinData = digitalTwinEngine.getDigitalTwin(selectedTwinId);
        if (twinData) {
          setTwin(twinData);

          // Load maintenance predictions
          const predictions = await digitalTwinEngine.predictMaintenanceNeeds(selectedTwinId);
          setMaintenancePredictions(predictions);
        }
      } catch (error) {
        console.error('Failed to load digital twin:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTwin();
  }, [selectedTwinId]);

  // Run property simulation
  const handleRunSimulation = async () => {
    if (!twin) return;

    setIsSimulating(true);
    try {
      const scenario = {
        name: 'Summer Peak Load',
        changes: {
          occupancyIncrease: 20,
          temperatureChange: 5,
          energyPriceIncrease: 15
        },
        durationDays: 30
      };

      const results = await digitalTwinEngine.runScenarioSimulation(twin.id, scenario);
      setSimulationResults(results);
    } catch (error) {
      console.error('Simulation failed:', error);
    } finally {
      setIsSimulating(false);
    }
  };

  // Handle room selection from 3D viewer
  const handleRoomSelect = (room: Room) => {
    console.log('Selected room:', room);
    // Could navigate to room-specific details or highlight in UI
  };

  // Handle sensor selection from 3D viewer
  const handleSensorSelect = (sensor: Sensor) => {
    console.log('Selected sensor:', sensor);
    // Could show sensor details or navigate to sensor dashboard
  };

  if (loading) {
    return (
      <DashboardLayout activeTab="analytics">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c5a059] mx-auto mb-4"></div>
            <p className="text-[#45a29e]">Loading Digital Twin...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab="analytics">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Digital Twin Dashboard</h1>
          <p className="text-[#45a29e]">
            Real-time property monitoring, predictive maintenance, and intelligent simulation
          </p>
        </div>

        {/* Twin Selector */}
        <div className="mb-6 bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6">
          <h3 className="text-xl font-bold text-white mb-4">Select Digital Twin</h3>
          <div className="flex flex-wrap gap-3">
            {availableTwins.map((twinOption) => (
              <button
                key={twinOption.id}
                onClick={() => setSelectedTwinId(twinOption.id)}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  selectedTwinId === twinOption.id
                    ? 'bg-[#c5a059] text-[#0b0c10]'
                    : 'bg-[#0b0c10] border border-[#45a29e]/30 text-[#45a29e] hover:border-[#c5a059]'
                }`}
              >
                <div className="text-sm">{twinOption.name}</div>
                <div className="text-xs opacity-75">{twinOption.location}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-[#1f2833] rounded-lg p-1 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: '🏠' },
            { id: 'sensors', label: 'Sensors', icon: '📊' },
            { id: 'systems', label: 'Systems', icon: '⚙️' },
            { id: 'maintenance', label: 'Maintenance', icon: '🔧' },
            { id: 'simulation', label: 'Simulation', icon: '🎭' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#c5a059] text-[#0b0c10]'
                  : 'text-[#45a29e] hover:bg-[#45a29e]/10'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && twin && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 3D Viewer */}
            <div className="lg:col-span-2">
              <Property3DViewer
                twinId={twin.id}
                width={600}
                height={400}
                interactive={true}
                showSensors={true}
                showSystems={true}
                onRoomSelect={handleRoomSelect}
                onSensorSelect={handleSensorSelect}
              />
            </div>

            {/* Overview Stats */}
            <div className="space-y-4">
              <MobileCard>
                <MobileCardHeader title="Property Overview" avatar={<span className="text-2xl">📊</span>} />
                <MobileCardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{twin.geometry.floors.length}</div>
                      <div className="text-sm text-[#45a29e]">Floors</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{twin.geometry.rooms.length}</div>
                      <div className="text-sm text-[#45a29e]">Rooms</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{twin.sensors.sensors.length}</div>
                      <div className="text-sm text-[#45a29e]">Sensors</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {(twin.metadata.accuracy * 100).toFixed(0)}%
                      </div>
                      <div className="text-sm text-[#45a29e]">Accuracy</div>
                    </div>
                  </div>
                </MobileCardContent>
              </MobileCard>

              <MobileCard>
                <MobileCardHeader title="System Status" avatar={<span className="text-2xl">⚡</span>} />
                <MobileCardContent>
                  <div className="space-y-2">
                    {twin.simulationState.systemStates.slice(0, 3).map((state, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-[#45a29e] capitalize">
                          {state.component.replace('_', ' ')}
                        </span>
                        <span className={`font-semibold ${
                          state.status === 'operational' ? 'text-green-400' :
                          state.status === 'warning' ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {state.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </MobileCardContent>
              </MobileCard>
            </div>
          </div>
        )}

        {/* Sensors Tab */}
        {activeTab === 'sensors' && twin && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Sensor Network</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {twin.sensors.sensors.map((sensor) => (
                <SensorCard
                  key={sensor.id}
                  sensor={sensor}
                  latestReading={sensor.readings[sensor.readings.length - 1]}
                />
              ))}
            </div>

            {/* Sensor Network Stats */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-[#1f2833] rounded-xl p-4 border border-[#45a29e]/20 text-center">
                <div className="text-2xl font-bold text-white mb-1">{twin.sensors.sensors.length}</div>
                <div className="text-sm text-[#45a29e]">Total Sensors</div>
              </div>
              <div className="bg-[#1f2833] rounded-xl p-4 border border-[#45a29e]/20 text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {twin.sensors.sensors.filter(s => s.status === 'active').length}
                </div>
                <div className="text-sm text-[#45a29e]">Active</div>
              </div>
              <div className="bg-[#1f2833] rounded-xl p-4 border border-[#45a29e]/20 text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">{twin.sensors.dataQuality.uptime.toFixed(1)}%</div>
                <div className="text-sm text-[#45a29e]">Uptime</div>
              </div>
              <div className="bg-[#1f2833] rounded-xl p-4 border border-[#45a29e]/20 text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">{twin.sensors.dataQuality.latency}ms</div>
                <div className="text-sm text-[#45a29e]">Avg Latency</div>
              </div>
            </div>
          </div>
        )}

        {/* Systems Tab */}
        {activeTab === 'systems' && twin && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Building Systems</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {twin.simulationState.systemStates.map((state, index) => (
                <SystemStatusCard key={index} systemState={state} />
              ))}
            </div>
          </div>
        )}

        {/* Maintenance Tab */}
        {activeTab === 'maintenance' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Predictive Maintenance</h2>
            {maintenancePredictions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🔧</div>
                <h3 className="text-xl font-bold text-white mb-2">No Maintenance Predictions</h3>
                <p className="text-[#45a29e]">All systems are operating within normal parameters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {maintenancePredictions.map((prediction, index) => (
                  <MaintenancePredictionCard key={index} prediction={prediction} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Simulation Tab */}
        {activeTab === 'simulation' && twin && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Scenario Simulation</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Simulation Controls */}
              <div className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6">
                <h3 className="text-xl font-bold text-white mb-4">Run Simulation</h3>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-[#45a29e] text-sm font-medium mb-2">
                      Scenario: Summer Peak Load
                    </label>
                    <div className="text-sm text-white bg-[#0b0c10] rounded p-3">
                      <div>• 20% increase in occupancy</div>
                      <div>• 5°C temperature increase</div>
                      <div>• 15% energy price increase</div>
                      <div>• 30-day simulation period</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleRunSimulation}
                  disabled={isSimulating}
                  className="w-full px-6 py-3 bg-[#c5a059] text-[#0b0c10] rounded-lg hover:bg-[#b8954f] transition-colors font-bold disabled:opacity-50"
                >
                  {isSimulating ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0b0c10]"></div>
                      <span>Running Simulation...</span>
                    </div>
                  ) : (
                    '🎭 Run Simulation'
                  )}
                </button>
              </div>

              {/* Simulation Results */}
              {simulationResults && (
                <div className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Simulation Results</h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#0b0c10] rounded p-3">
                        <div className="text-sm text-[#45a29e] mb-1">Avg Daily Consumption</div>
                        <div className="text-white font-bold text-lg">
                          {simulationResults.energyConsumption.reduce((a: number, b: number) => a + b, 0) / simulationResults.energyConsumption.length.toFixed(1)} kWh
                        </div>
                      </div>
                      <div className="bg-[#0b0c10] rounded p-3">
                        <div className="text-sm text-[#45a29e] mb-1">Total Cost Increase</div>
                        <div className="text-red-400 font-bold text-lg">
                          R{(simulationResults.costProjection[simulationResults.costProjection.length - 1] - simulationResults.costProjection[0]).toFixed(0)}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[#c5a059] font-semibold mb-2">Cost Projection (30 days)</h4>
                      <div className="h-32 bg-[#0b0c10] rounded p-2">
                        <div className="text-xs text-[#45a29e] text-center">
                          Chart visualization would show cost trend over time
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <button className="bg-[#c5a059] text-[#0b0c10] p-6 rounded-xl hover:opacity-90 transition-all text-center">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-bold mb-2">Export Data</h3>
            <p className="text-sm opacity-80">Download twin data & reports</p>
          </button>

          <button className="bg-[#45a29e] text-white p-6 rounded-xl hover:opacity-90 transition-all text-center">
            <div className="text-3xl mb-3">🔄</div>
            <h3 className="font-bold mb-2">Sync Data</h3>
            <p className="text-sm opacity-80">Update from IoT sensors</p>
          </button>

          <button className="bg-[#1f2833] border border-[#45a29e]/20 text-[#45a29e] p-6 rounded-xl hover:bg-[#45a29e]/10 transition-all text-center">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-bold mb-2">Custom Scenarios</h3>
            <p className="text-sm opacity-80">Create custom simulations</p>
          </button>

          <button className="bg-[#1f2833] border border-[#45a29e]/20 text-[#45a29e] p-6 rounded-xl hover:bg-[#45a29e]/10 transition-all text-center">
            <div className="text-3xl mb-3">📱</div>
            <h3 className="font-bold mb-2">Mobile Access</h3>
            <p className="text-sm opacity-80">Access twin on mobile devices</p>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}