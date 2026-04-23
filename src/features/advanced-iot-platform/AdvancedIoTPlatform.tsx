'use client';

import { useState, useEffect, useCallback } from 'react';

interface IoTDevice {
  id: string;
  name: string;
  type: 'sensor' | 'actuator' | 'gateway' | 'edge_device' | 'controller';
  category: 'temperature' | 'humidity' | 'pressure' | 'motion' | 'light' | 'sound' | 'vibration' | 'gas' | 'liquid' | 'other';
  location: {
    building: string;
    floor: string;
    room: string;
    coordinates?: { x: number; y: number; z: number };
  };
  specifications: {
    manufacturer: string;
    model: string;
    firmwareVersion: string;
    batteryLevel?: number;
    powerSource: 'battery' | 'wired' | 'solar' | 'kinetic';
    connectivity: 'wifi' | 'bluetooth' | 'zigbee' | 'lora' | 'cellular' | 'ethernet';
    range?: number; // meters
    samplingRate: number; // Hz
  };
  status: 'online' | 'offline' | 'maintenance' | 'error';
  lastSeen: Date;
  dataStreams: string[];
  alerts: IoTAlert[];
  metadata: Record<string, any>;
}

interface IoTSensorData {
  id: string;
  deviceId: string;
  timestamp: Date;
  sensorType: string;
  value: number | string | boolean;
  unit?: string;
  quality: 'good' | 'fair' | 'poor';
  metadata?: Record<string, any>;
}

interface IoTAlert {
  id: string;
  deviceId: string;
  type: 'threshold' | 'anomaly' | 'offline' | 'battery_low' | 'maintenance' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  resolved: boolean;
  resolution?: string;
}

interface IoTDashboard {
  id: string;
  name: string;
  description: string;
  widgets: IoTWidget[];
  refreshRate: number; // seconds
  permissions: {
    view: string[];
    edit: string[];
  };
  createdBy: string;
  createdAt: Date;
}

interface IoTWidget {
  id: string;
  type: 'gauge' | 'chart' | 'map' | 'table' | 'alert' | 'control';
  title: string;
  config: {
    deviceIds?: string[];
    sensorTypes?: string[];
    timeRange?: number; // minutes
    thresholds?: { min: number; max: number };
    position: { x: number; y: number; width: number; height: number };
  };
}

interface IoTAutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'sensor_value' | 'device_status' | 'time' | 'alert';
    conditions: {
      deviceId?: string;
      sensorType?: string;
      operator: 'gt' | 'lt' | 'eq' | 'ne' | 'between';
      value: any;
    }[];
  };
  actions: {
    type: 'notification' | 'device_control' | 'automation' | 'alert';
    config: Record<string, any>;
  }[];
  enabled: boolean;
  lastTriggered?: Date;
  triggerCount: number;
}

interface AdvancedIoTPlatformProps {
  tenantId?: string;
  onDeviceAlert?: (alert: IoTAlert) => void;
  onSensorData?: (data: IoTSensorData) => void;
  onAutomationTriggered?: (rule: IoTAutomationRule, data: any) => void;
}

const SAMPLE_DEVICES: IoTDevice[] = [
  {
    id: 'temp_sensor_001',
    name: 'Server Room Temperature Sensor',
    type: 'sensor',
    category: 'temperature',
    location: {
      building: 'Data Center A',
      floor: 'Floor 2',
      room: 'Server Room 1'
    },
    specifications: {
      manufacturer: 'IoT Corp',
      model: 'TempSense Pro',
      firmwareVersion: '2.1.4',
      batteryLevel: 85,
      powerSource: 'battery',
      connectivity: 'wifi',
      range: 50,
      samplingRate: 1
    },
    status: 'online',
    lastSeen: new Date(),
    dataStreams: ['temperature', 'humidity'],
    alerts: [],
    metadata: { installationDate: '2024-01-15', warranty: '2026-01-15' }
  },
  {
    id: 'motion_sensor_002',
    name: 'Office Motion Detector',
    type: 'sensor',
    category: 'motion',
    location: {
      building: 'Headquarters',
      floor: 'Floor 1',
      room: 'Conference Room A'
    },
    specifications: {
      manufacturer: 'SmartHome Inc',
      model: 'MotionGuard X1',
      firmwareVersion: '1.8.2',
      powerSource: 'wired',
      connectivity: 'zigbee',
      range: 10,
      samplingRate: 0.1
    },
    status: 'online',
    lastSeen: new Date(),
    dataStreams: ['motion', 'occupancy'],
    alerts: [],
    metadata: { sensitivity: 'medium', detectionRange: 5 }
  },
  {
    id: 'gateway_003',
    name: 'IoT Gateway Alpha',
    type: 'gateway',
    category: 'other',
    location: {
      building: 'Data Center A',
      floor: 'Floor 1',
      room: 'Network Room'
    },
    specifications: {
      manufacturer: 'NetworkTech',
      model: 'IoT-GW-500',
      firmwareVersion: '3.2.1',
      powerSource: 'wired',
      connectivity: 'ethernet',
      range: 100,
      samplingRate: 0
    },
    status: 'online',
    lastSeen: new Date(),
    dataStreams: [],
    alerts: [],
    metadata: { connectedDevices: 24, networkLoad: 0.65 }
  },
  {
    id: 'vibration_sensor_004',
    name: 'HVAC Vibration Monitor',
    type: 'sensor',
    category: 'vibration',
    location: {
      building: 'Manufacturing Plant',
      floor: 'Ground Floor',
      room: 'HVAC Room'
    },
    specifications: {
      manufacturer: 'Industrial IoT',
      model: 'VibeSense 3000',
      firmwareVersion: '2.4.1',
      batteryLevel: 92,
      powerSource: 'battery',
      connectivity: 'lora',
      range: 2000,
      samplingRate: 10
    },
    status: 'online',
    lastSeen: new Date(),
    dataStreams: ['vibration_x', 'vibration_y', 'vibration_z', 'temperature'],
    alerts: [
      {
        id: 'alert_001',
        deviceId: 'vibration_sensor_004',
        type: 'threshold',
        severity: 'medium',
        message: 'Vibration levels above normal threshold',
        timestamp: new Date(Date.now() - 1800000),
        acknowledged: false,
        resolved: false
      }
    ],
    metadata: { equipmentId: 'HVAC-001', baselineVibration: 0.05 }
  }
];

const SAMPLE_SENSOR_DATA: IoTSensorData[] = [
  {
    id: 'data_001',
    deviceId: 'temp_sensor_001',
    timestamp: new Date(),
    sensorType: 'temperature',
    value: 22.5,
    unit: '°C',
    quality: 'good'
  },
  {
    id: 'data_002',
    deviceId: 'temp_sensor_001',
    timestamp: new Date(),
    sensorType: 'humidity',
    value: 45.2,
    unit: '%',
    quality: 'good'
  },
  {
    id: 'data_003',
    deviceId: 'vibration_sensor_004',
    timestamp: new Date(),
    sensorType: 'vibration_x',
    value: 0.08,
    unit: 'm/s²',
    quality: 'good'
  }
];

export default function AdvancedIoTPlatform({
  tenantId = 'default',
  onDeviceAlert,
  onSensorData,
  onAutomationTriggered
}: AdvancedIoTPlatformProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'devices' | 'data' | 'alerts' | 'automation'>('overview');
  const [devices, setDevices] = useState<IoTDevice[]>(SAMPLE_DEVICES);
  const [sensorData, setSensorData] = useState<IoTSensorData[]>(SAMPLE_SENSOR_DATA);
  const [alerts, setAlerts] = useState<IoTAlert[]>([]);
  const [automationRules, setAutomationRules] = useState<IoTAutomationRule[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<IoTDevice | null>(null);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate new sensor readings
      const newData: IoTSensorData[] = devices
        .filter(d => d.status === 'online' && d.dataStreams.length > 0)
        .flatMap(device =>
          device.dataStreams.map(stream => ({
            id: `data_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            deviceId: device.id,
            timestamp: new Date(),
            sensorType: stream,
            value: generateSensorValue(device.category, stream),
            unit: getSensorUnit(stream),
            quality: 'good' as const
          }))
        );

      setSensorData(prev => [...newData, ...prev.slice(0, 999)]); // Keep last 1000 readings

      // Trigger alerts based on conditions
      newData.forEach(data => {
        const alert = checkAlertConditions(data);
        if (alert) {
          setAlerts(prev => [alert, ...prev.slice(0, 99)]);
          onDeviceAlert?.(alert);
        }
      });

      newData.forEach(data => onSensorData?.(data));
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [devices, onDeviceAlert, onSensorData]);

  const generateSensorValue = (category: IoTDevice['category'], stream: string): number | string | boolean => {
    switch (category) {
      case 'temperature':
        return 20 + Math.random() * 10; // 20-30°C
      case 'humidity':
        return 30 + Math.random() * 40; // 30-70%
      case 'motion':
        return Math.random() > 0.8; // Boolean
      case 'vibration':
        return Math.random() * 0.2; // 0-0.2 m/s²
      case 'light':
        return Math.floor(Math.random() * 1000); // 0-1000 lux
      case 'pressure':
        return 980 + Math.random() * 40; // 980-1020 hPa
      default:
        return Math.random() * 100;
    }
  };

  const getSensorUnit = (stream: string): string | undefined => {
    switch (stream) {
      case 'temperature': return '°C';
      case 'humidity': return '%';
      case 'vibration_x':
      case 'vibration_y':
      case 'vibration_z': return 'm/s²';
      case 'light': return 'lux';
      case 'pressure': return 'hPa';
      default: return undefined;
    }
  };

  const checkAlertConditions = (data: IoTSensorData): IoTAlert | null => {
    // Temperature alert
    if (data.sensorType === 'temperature' && typeof data.value === 'number') {
      if (data.value > 28) {
        return {
          id: `alert_${Date.now()}`,
          deviceId: data.deviceId,
          type: 'threshold',
          severity: 'high',
          message: `High temperature alert: ${data.value}°C`,
          timestamp: new Date(),
          acknowledged: false,
          resolved: false
        };
      }
    }

    // Vibration alert
    if (data.sensorType.startsWith('vibration') && typeof data.value === 'number') {
      if (data.value > 0.15) {
        return {
          id: `alert_${Date.now()}`,
          deviceId: data.deviceId,
          type: 'anomaly',
          severity: 'critical',
          message: `Abnormal vibration detected: ${data.value} m/s²`,
          timestamp: new Date(),
          acknowledged: false,
          resolved: false
        };
      }
    }

    return null;
  };

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  }, []);

  const resolveAlert = useCallback((alertId: string, resolution?: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, resolved: true, resolution } : alert
    ));
  }, []);

  const getDeviceStatusColor = (status: IoTDevice['status']) => {
    switch (status) {
      case 'online': return '#10B981';
      case 'offline': return '#6B7280';
      case 'maintenance': return '#F59E0B';
      case 'error': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getAlertSeverityColor = (severity: IoTAlert['severity']) => {
    switch (severity) {
      case 'low': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'high': return '#EF4444';
      case 'critical': return '#7C2D12';
      default: return '#6B7280';
    }
  };

  const getDeviceTypeIcon = (type: IoTDevice['type']) => {
    switch (type) {
      case 'sensor': return '📡';
      case 'actuator': return '⚙️';
      case 'gateway': return '🌐';
      case 'edge_device': return '💻';
      case 'controller': return '🎛️';
      default: return '📱';
    }
  };

  const onlineDevices = devices.filter(d => d.status === 'online').length;
  const totalAlerts = alerts.length;
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged).length;
  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
  const dataPoints = sensorData.length;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Advanced IoT Platform</h1>
            <p className="text-gray-600">Comprehensive sensor network management and monitoring</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">Tenant</div>
              <div className="font-mono text-sm">{tenantId}</div>
            </div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{onlineDevices}</div>
            <div className="text-sm text-gray-600">Online Devices</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{devices.length}</div>
            <div className="text-sm text-gray-600">Total Devices</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{unacknowledgedAlerts}</div>
            <div className="text-sm text-gray-600">Active Alerts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{dataPoints.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Data Points</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'devices', label: 'Devices', icon: '📡' },
              { id: 'data', label: 'Sensor Data', icon: '📈' },
              { id: 'alerts', label: 'Alerts', icon: '🚨' },
              { id: 'automation', label: 'Automation', icon: '🤖' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Device Status Overview */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-medium mb-4">Device Status Overview</h3>
                  <div className="space-y-3">
                    {['online', 'offline', 'maintenance', 'error'].map((status) => {
                      const count = devices.filter(d => d.status === status).length;
                      const percentage = (count / devices.length) * 100;
                      return (
                        <div key={status} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: getDeviceStatusColor(status as IoTDevice['status']) }}
                            ></div>
                            <span className="capitalize">{status}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full"
                                style={{
                                  width: `${percentage}%`,
                                  backgroundColor: getDeviceStatusColor(status as IoTDevice['status'])
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium w-8">{count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Alert Summary */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-medium mb-4">Alert Summary</h3>
                  <div className="space-y-3">
                    {['critical', 'high', 'medium', 'low'].map((severity) => {
                      const count = alerts.filter(a => a.severity === severity && !a.resolved).length;
                      return (
                        <div key={severity} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: getAlertSeverityColor(severity as IoTAlert['severity']) }}
                            ></div>
                            <span className="capitalize">{severity}</span>
                          </div>
                          <span className="font-medium">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                  {criticalAlerts > 0 && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                      <div className="flex items-center gap-2 text-red-800">
                        <span>⚠️</span>
                        <span className="text-sm font-medium">
                          {criticalAlerts} critical alert{criticalAlerts > 1 ? 's' : ''} require immediate attention
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {[
                    { time: '2 minutes ago', activity: 'Temperature sensor 001 reported 24.5°C', type: 'data' },
                    { time: '5 minutes ago', activity: 'Motion detected in Conference Room A', type: 'alert' },
                    { time: '8 minutes ago', activity: 'Vibration sensor 004 battery at 92%', type: 'device' },
                    { time: '12 minutes ago', activity: 'New device connected: Pressure Sensor 005', type: 'device' },
                    { time: '15 minutes ago', activity: 'Gateway Alpha processed 1,247 data points', type: 'data' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                      <div className={`w-2 h-2 rounded-full ${
                        item.type === 'data' ? 'bg-blue-500' :
                        item.type === 'alert' ? 'bg-red-500' :
                        'bg-green-500'
                      }`}></div>
                      <div className="flex-1 text-sm">{item.activity}</div>
                      <div className="text-xs text-gray-500">{item.time}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab('devices')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Manage Devices
                </button>
                <button
                  onClick={() => setActiveTab('alerts')}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  View Alerts ({unacknowledgedAlerts})
                </button>
                <button
                  onClick={() => setActiveTab('automation')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Automation Rules
                </button>
              </div>
            </div>
          )}

          {/* Devices Tab */}
          {activeTab === 'devices' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">IoT Devices</h2>
                <div className="flex gap-2">
                  <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option>All Types</option>
                    <option>Sensors</option>
                    <option>Actuators</option>
                    <option>Gateways</option>
                    <option>Edge Devices</option>
                  </select>
                  <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option>All Status</option>
                    <option>Online</option>
                    <option>Offline</option>
                    <option>Maintenance</option>
                    <option>Error</option>
                  </select>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Add Device
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {devices.map((device) => (
                  <div
                    key={device.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedDevice(device)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getDeviceTypeIcon(device.type)}</span>
                        <div>
                          <h3 className="font-medium text-gray-900">{device.name}</h3>
                          <p className="text-sm text-gray-600 capitalize">{device.category} {device.type}</p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full text-white ${
                          device.status === 'online' ? 'bg-green-600' :
                          device.status === 'offline' ? 'bg-gray-600' :
                          device.status === 'maintenance' ? 'bg-yellow-600' :
                          'bg-red-600'
                        }`}
                      >
                        {device.status}
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="text-sm text-gray-500 mb-1">Location</div>
                      <div className="text-sm">
                        {device.location.building} • {device.location.floor} • {device.location.room}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-500">Battery</div>
                        <div className="flex items-center gap-2">
                          {device.specifications.batteryLevel !== undefined ? (
                            <>
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-600 h-2 rounded-full"
                                  style={{ width: `${device.specifications.batteryLevel}%` }}
                                ></div>
                              </div>
                              <span className="text-sm">{device.specifications.batteryLevel}%</span>
                            </>
                          ) : (
                            <span className="text-sm text-gray-400">N/A</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Data Streams</div>
                        <div className="text-sm font-medium">{device.dataStreams.length}</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                        Configure
                      </button>
                      <button className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                        Monitor
                      </button>
                      <button className="px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700">
                        Logs
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Tab */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Sensor Data</h2>
                <div className="flex gap-2">
                  <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option>All Devices</option>
                    {devices.map(device => (
                      <option key={device.id} value={device.id}>{device.name}</option>
                    ))}
                  </select>
                  <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option>Last 1 hour</option>
                    <option>Last 24 hours</option>
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                  </select>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Export Data
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-3 px-4">Device</th>
                        <th className="text-left py-3 px-4">Sensor Type</th>
                        <th className="text-left py-3 px-4">Value</th>
                        <th className="text-left py-3 px-4">Unit</th>
                        <th className="text-left py-3 px-4">Quality</th>
                        <th className="text-left py-3 px-4">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sensorData.slice(0, 50).map((data) => {
                        const device = devices.find(d => d.id === data.deviceId);
                        return (
                          <tr key={data.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{device?.name || data.deviceId}</td>
                            <td className="py-3 px-4 capitalize">{data.sensorType.replace('_', ' ')}</td>
                            <td className="py-3 px-4 font-mono">
                              {typeof data.value === 'boolean'
                                ? data.value ? 'True' : 'False'
                                : typeof data.value === 'number'
                                ? data.value.toFixed(2)
                                : data.value
                              }
                            </td>
                            <td className="py-3 px-4">{data.unit || '-'}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 text-xs rounded ${
                                data.quality === 'good' ? 'bg-green-100 text-green-800' :
                                data.quality === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {data.quality}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-500">
                              {data.timestamp.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Data Visualization Placeholder */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium mb-4">Data Visualization</h3>
                <div className="aspect-[16/9] bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="text-4xl mb-2">📊</div>
                    <div>Real-time sensor data visualization</div>
                    <div className="text-sm mt-2">
                      Charts and graphs would render here showing temperature, humidity, vibration, and other sensor data trends
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">IoT Alerts</h2>
                <div className="text-sm text-gray-600">
                  {unacknowledgedAlerts} unacknowledged • {criticalAlerts} critical
                </div>
              </div>

              {alerts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-2">✅</div>
                  <div>No alerts at this time</div>
                  <div className="text-sm">All systems operating normally</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert) => {
                    const device = devices.find(d => d.id === alert.deviceId);
                    return (
                      <div
                        key={alert.id}
                        className={`border rounded-lg p-6 ${
                          alert.severity === 'critical' ? 'border-red-200 bg-red-50' :
                          alert.severity === 'high' ? 'border-orange-200 bg-orange-50' :
                          alert.severity === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                          'border-green-200 bg-green-50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-3 h-3 rounded-full mt-1 ${
                                alert.severity === 'critical' ? 'bg-red-500' :
                                alert.severity === 'high' ? 'bg-orange-500' :
                                alert.severity === 'medium' ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                            ></div>
                            <div>
                              <h3 className="font-medium text-gray-900">{alert.message}</h3>
                              <p className="text-sm text-gray-600">
                                Device: {device?.name || alert.deviceId} • {alert.timestamp.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs rounded-full text-white ${
                              alert.severity === 'critical' ? 'bg-red-600' :
                              alert.severity === 'high' ? 'bg-orange-600' :
                              alert.severity === 'medium' ? 'bg-yellow-600' :
                              'bg-green-600'
                            }`}>
                              {alert.severity}
                            </span>
                            {!alert.acknowledged && (
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                New
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Type: {alert.type.replace('_', ' ')}</span>
                            {alert.resolved && (
                              <span className="text-green-600">✓ Resolved</span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {!alert.acknowledged && (
                              <button
                                onClick={() => acknowledgeAlert(alert.id)}
                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                              >
                                Acknowledge
                              </button>
                            )}
                            {!alert.resolved && (
                              <button
                                onClick={() => resolveAlert(alert.id)}
                                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                              >
                                Resolve
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Automation Tab */}
          {activeTab === 'automation' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Automation Rules</h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Create Rule
                </button>
              </div>

              {automationRules.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-2">🤖</div>
                  <div>No automation rules configured</div>
                  <div className="text-sm">Create rules to automatically respond to sensor data and alerts</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {automationRules.map((rule) => (
                    <div key={rule.id} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-medium text-gray-900">{rule.name}</h3>
                          <p className="text-sm text-gray-600">{rule.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={rule.enabled}
                              onChange={(e) => setAutomationRules(prev => prev.map(r =>
                                r.id === rule.id ? { ...r, enabled: e.target.checked } : r
                              ))}
                            />
                            <span className="text-sm">Enabled</span>
                          </label>
                          <span className="text-sm text-gray-500">
                            Triggered {rule.triggerCount} times
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-2">Trigger Conditions</h4>
                          <div className="text-sm text-gray-600">
                            <div>Type: {rule.trigger.type.replace('_', ' ')}</div>
                            <div>Conditions: {rule.trigger.conditions.length}</div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Actions</h4>
                          <div className="text-sm text-gray-600">
                            <div>Actions: {rule.actions.length}</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {rule.actions.map((action, idx) => (
                                <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                  {action.type}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Device Details Modal */}
      {selectedDevice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{selectedDevice.name}</h2>
                <button
                  onClick={() => setSelectedDevice(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-gray-900">{getDeviceTypeIcon(selectedDevice.type)}</div>
                    <div className="text-sm text-gray-600">Type</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-gray-900 capitalize">{selectedDevice.status}</div>
                    <div className="text-sm text-gray-600">Status</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-gray-900">{selectedDevice.dataStreams.length}</div>
                    <div className="text-sm text-gray-600">Data Streams</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-gray-900">{selectedDevice.alerts.length}</div>
                    <div className="text-sm text-gray-600">Active Alerts</div>
                  </div>
                </div>

                {/* Device Specifications */}
                <div>
                  <h3 className="font-medium mb-3">Device Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Manufacturer:</span>
                        <span className="font-medium">{selectedDevice.specifications.manufacturer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Model:</span>
                        <span className="font-medium">{selectedDevice.specifications.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Firmware:</span>
                        <span className="font-medium">{selectedDevice.specifications.firmwareVersion}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Connectivity:</span>
                        <span className="font-medium capitalize">{selectedDevice.specifications.connectivity}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Power Source:</span>
                        <span className="font-medium capitalize">{selectedDevice.specifications.powerSource}</span>
                      </div>
                      {selectedDevice.specifications.batteryLevel !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Battery:</span>
                          <span className="font-medium">{selectedDevice.specifications.batteryLevel}%</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Range:</span>
                        <span className="font-medium">{selectedDevice.specifications.range || 'N/A'}m</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sampling Rate:</span>
                        <span className="font-medium">{selectedDevice.specifications.samplingRate}Hz</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <h3 className="font-medium mb-3">Location</h3>
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Building:</span>
                        <span className="font-medium ml-2">{selectedDevice.location.building}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Floor:</span>
                        <span className="font-medium ml-2">{selectedDevice.location.floor}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Room:</span>
                        <span className="font-medium ml-2">{selectedDevice.location.room}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Data Streams */}
                <div>
                  <h3 className="font-medium mb-3">Data Streams</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDevice.dataStreams.map((stream, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                        {stream.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Edit Configuration
                  </button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    View Data History
                  </button>
                  <button
                    onClick={() => setSelectedDevice(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}