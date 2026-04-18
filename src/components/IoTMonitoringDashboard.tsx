'use client';

import React, { useState, useEffect } from 'react';
import { IoTSensor, SensorAlert } from '@/lib/iot-sensor-management-engine';

interface IoTMonitoringDashboardProps {
  propertyId: string;
}

interface SensorStatus {
  sensor: IoTSensor;
  lastReading?: any;
  status: 'online' | 'offline' | 'warning' | 'error';
  alerts: SensorAlert[];
}

export function IoTMonitoringDashboard({ propertyId }: IoTMonitoringDashboardProps) {
  const [sensors, setSensors] = useState<SensorStatus[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<IoTSensor | null>(null);
  const [activeTab, setActiveTab] = useState<'soil' | 'safety' | 'environmental'>('soil');
  const [realTimeData, setRealTimeData] = useState<Record<string, any>>({});
  const [alerts, setAlerts] = useState<SensorAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSensorData();
    // Set up real-time updates
    const interval = setInterval(loadRealTimeData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [propertyId, activeTab]);

  const loadSensorData = async () => {
    try {
      setIsLoading(true);
      const endpoint = activeTab === 'safety' ? '/api/iot/safety' : '/api/iot/soil';
      const response = await fetch(`${endpoint}?propertyId=${propertyId}`);
      const result = await response.json();

      if (result.success) {
        const sensorStatuses: SensorStatus[] = result.data.sensors.map((sensorData: any) => ({
          sensor: sensorData.sensor,
          lastReading: sensorData.latestReading,
          status: determineSensorStatus(sensorData.sensor, sensorData.latestReading),
          alerts: sensorData.alerts
        }));

        setSensors(sensorStatuses);
        setAlerts(result.data.activeAlerts || []);
      }
    } catch (error) {
      console.error('Error loading sensor data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRealTimeData = async () => {
    try {
      const endpoint = activeTab === 'safety' ? '/api/iot/safety' : '/api/iot/soil';
      const response = await fetch(`${endpoint}?propertyId=${propertyId}`);
      const result = await response.json();

      if (result.success) {
        setRealTimeData(result.data.overview || {});
      }
    } catch (error) {
      console.error('Error loading real-time data:', error);
    }
  };

  const determineSensorStatus = (sensor: IoTSensor, lastReading?: any): SensorStatus['status'] => {
    if (sensor.status === 'error') return 'error';
    if (!lastReading) return 'offline';

    const timeSinceLastReading = Date.now() - new Date(lastReading.timestamp).getTime();
    if (timeSinceLastReading > 300000) return 'offline'; // 5 minutes



    return 'online';
  };

  const getStatusColor = (status: SensorStatus['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getSensorTypeIcon = (type: string, subtype: string) => {
    switch (subtype.toLowerCase()) {
      case 'moisture': return '💧';
      case 'ph': return '🧪';
      case 'temperature': return '🌡️';
      case 'gas': return '☢️';
      case 'motion': return '📹';
      case 'smoke': return '🔥';
      default: return '📡';
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch('/api/iot/alerts/acknowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, userId: 'user-123' }) // Replace with actual user ID
      });

      if (response.ok) {
        // Refresh alerts
        loadSensorData();
      }
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const filteredSensors = sensors.filter(sensor =>
    sensor.sensor.type === activeTab ||
    (activeTab === 'environmental' && sensor.sensor.type === 'environmental')
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">IoT Monitoring</h2>
          <p className="text-sm text-gray-600">Property: {propertyId}</p>
        </div>

        {/* Tab Navigation */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex space-x-1">
            {[
              { key: 'soil', label: 'Soil Sensors', count: sensors.filter(s => s.sensor.type === 'soil').length },
              { key: 'safety', label: 'Safety Sensors', count: sensors.filter(s => s.sensor.type === 'safety').length },
              { key: 'environmental', label: 'Environmental', count: sensors.filter(s => s.sensor.type === 'environmental').length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                  activeTab === tab.key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
                <span className="ml-1 text-xs">({tab.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sensor List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading sensors...</div>
          ) : (
            <div className="p-4 space-y-2">
              {filteredSensors.map(sensorStatus => (
                <div
                  key={sensorStatus.sensor.id}
                  onClick={() => setSelectedSensor(sensorStatus.sensor)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedSensor?.id === sensorStatus.sensor.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getSensorTypeIcon(sensorStatus.sensor.type, sensorStatus.sensor.subtype)}</span>
                      <div>
                        <h4 className="font-medium text-sm">{sensorStatus.sensor.name}</h4>
                        <p className="text-xs text-gray-600">{sensorStatus.sensor.subtype}</p>
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(sensorStatus.status)}`} />
                  </div>

                  {sensorStatus.lastReading && (
                    <div className="mt-2 text-xs text-gray-600">
                      {sensorStatus.lastReading.value}{sensorStatus.lastReading.unit} •
                      {new Date(sensorStatus.lastReading.timestamp).toLocaleTimeString()}
                    </div>
                  )}

                  {sensorStatus.alerts.length > 0 && (
                    <div className="mt-1 text-xs text-red-600">
                      {sensorStatus.alerts.length} alert{sensorStatus.alerts.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              ))}

              {filteredSensors.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No {activeTab} sensors found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Alerts Summary */}
        {alerts.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <h3 className="font-medium text-sm mb-2">Active Alerts ({alerts.length})</h3>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {alerts.slice(0, 5).map(alert => (
                <div key={alert.id} className="text-xs p-2 bg-red-50 border border-red-200 rounded">
                  <div className="font-medium">{alert.type.toUpperCase()}</div>
                  <div>{alert.message}</div>
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="mt-1 text-blue-600 hover:text-blue-800"
                  >
                    Acknowledge
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <h1 className="text-xl font-semibold capitalize">{activeTab} Monitoring Dashboard</h1>
          <p className="text-sm text-gray-600">
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>

        {/* Real-time Overview */}
        <div className="p-4 bg-white border-b border-gray-200">
          <h3 className="font-medium mb-3">Real-time Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(realTimeData).map(([metric, data]: [string, any]) => (
              <div key={metric} className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 capitalize">{metric.replace(/([A-Z])/g, ' $1')}</div>
                <div className="text-lg font-semibold">
                  {data.average?.toFixed(1) ?? 'N/A'} {data.unit ?? ''}
                </div>
                <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                  data.status === 'optimal' ? 'bg-green-100 text-green-800' :
                  data.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {data.status || 'unknown'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sensor Details */}
        <div className="flex-1 p-4">
          {selectedSensor ? (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{selectedSensor.name}</h2>
                <div className={`px-3 py-1 rounded-full text-sm ${
                  selectedSensor.status === 'active' ? 'bg-green-100 text-green-800' :
                  selectedSensor.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {selectedSensor.status}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Sensor Details</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">Type:</span> {selectedSensor.type}</div>
                    <div><span className="text-gray-600">Subtype:</span> {selectedSensor.subtype}</div>
                    <div><span className="text-gray-600">Location:</span> {selectedSensor.location.description || 'Not specified'}</div>
                    <div><span className="text-gray-600">Battery:</span> {selectedSensor.batteryLevel ? `${selectedSensor.batteryLevel}%` : 'N/A'}</div>
                    <div><span className="text-gray-600">Signal:</span> {selectedSensor.signalStrength ? `${selectedSensor.signalStrength}%` : 'N/A'}</div>
                    <div><span className="text-gray-600">Installed:</span> {new Date(selectedSensor.installedAt).toLocaleDateString()}</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Thresholds</h3>
                  <div className="space-y-2 text-sm">
                    {selectedSensor.thresholds.min !== undefined && (
                      <div><span className="text-gray-600">Min:</span> {selectedSensor.thresholds.min}</div>
                    )}
                    {selectedSensor.thresholds.max !== undefined && (
                      <div><span className="text-gray-600">Max:</span> {selectedSensor.thresholds.max}</div>
                    )}
                    {selectedSensor.thresholds.warningMin !== undefined && (
                      <div><span className="text-gray-600">Warning Min:</span> {selectedSensor.thresholds.warningMin}</div>
                    )}
                    {selectedSensor.thresholds.warningMax !== undefined && (
                      <div><span className="text-gray-600">Warning Max:</span> {selectedSensor.thresholds.warningMax}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Placeholder for charts/graphs */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-gray-600">Sensor data visualization would go here</p>
                <p className="text-sm text-gray-500 mt-1">Charts and graphs for historical data</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="text-gray-400 text-4xl mb-4">📡</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Sensor</h3>
              <p className="text-gray-600">Choose a sensor from the sidebar to view detailed information and controls.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}