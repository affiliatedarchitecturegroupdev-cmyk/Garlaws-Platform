import { PropertyData } from '@/lib/types/property';

export interface IoTSensor {
  id: string;
  propertyId: string;
  type: 'soil' | 'safety' | 'environmental' | 'structural';
  subtype: string; // 'moisture', 'ph', 'nutrients', 'gas', 'motion', 'temperature', etc.
  name: string;
  location: {
    latitude: number;
    longitude: number;
    zone?: string;
    description?: string;
  };
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  lastReading?: SensorReading;
  thresholds: SensorThresholds;
  calibration?: SensorCalibration;
  batteryLevel?: number;
  signalStrength?: number;
  installedAt: Date;
  lastMaintenance?: Date;
  firmwareVersion?: string;
}

export interface SensorReading {
  timestamp: Date;
  value: number;
  unit: string;
  quality: 'good' | 'moderate' | 'poor';
  metadata?: Record<string, any>;
}

export interface SensorThresholds {
  min?: number;
  max?: number;
  warningMin?: number;
  warningMax?: number;
  criticalMin?: number;
  criticalMax?: number;
  alertEnabled: boolean;
}

export interface SensorCalibration {
  lastCalibrated: Date;
  calibrationData: Record<string, any>;
  accuracy: number;
  nextCalibrationDue: Date;
}

export interface SensorAlert {
  id: string;
  sensorId: string;
  type: 'warning' | 'critical' | 'maintenance' | 'calibration';
  message: string;
  value?: number;
  threshold?: number;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

export interface SensorNetwork {
  id: string;
  propertyId: string;
  name: string;
  sensors: IoTSensor[];
  gatewayId?: string;
  protocol: 'mqtt' | 'coap' | 'websocket' | 'zigbee' | 'bluetooth';
  status: 'online' | 'offline' | 'degraded';
  lastSeen: Date;
}

export interface SoilData {
  moisture: number; // percentage
  temperature: number; // celsius
  ph: number;
  ec: number; // electrical conductivity
  nitrogen: number; // ppm
  phosphorus: number; // ppm
  potassium: number; // ppm
  organicMatter: number; // percentage
}

export interface SafetyData {
  gasLevel: number; // ppm
  smokeDetected: boolean;
  motionDetected: boolean;
  noiseLevel: number; // dB
  vibrationLevel: number;
  emergencyButtonPressed: boolean;
}

export class IoTSensorManagementEngine {
  private sensors: Map<string, IoTSensor> = new Map();
  private networks: Map<string, SensorNetwork> = new Map();
  private alerts: SensorAlert[] = [];
  private readings: Map<string, SensorReading[]> = new Map();

  constructor() {
    this.initializeDefaultNetworks();
  }

  // Sensor Management
  async registerSensor(sensor: Omit<IoTSensor, 'id' | 'installedAt'>): Promise<IoTSensor> {
    const newSensor: IoTSensor = {
      ...sensor,
      id: `sensor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      installedAt: new Date()
    };

    this.sensors.set(newSensor.id, newSensor);

    // Add to network if exists
    const network = Array.from(this.networks.values())
      .find(n => n.propertyId === sensor.propertyId);

    if (network) {
      network.sensors.push(newSensor);
    }

    return newSensor;
  }

  async updateSensor(sensorId: string, updates: Partial<IoTSensor>): Promise<IoTSensor | null> {
    const sensor = this.sensors.get(sensorId);
    if (!sensor) return null;

    const updatedSensor = { ...sensor, ...updates };
    this.sensors.set(sensorId, updatedSensor);

    return updatedSensor;
  }

  async removeSensor(sensorId: string): Promise<boolean> {
    const sensor = this.sensors.get(sensorId);
    if (!sensor) return false;

    // Remove from network
    const network = Array.from(this.networks.values())
      .find(n => n.sensors.some(s => s.id === sensorId));

    if (network) {
      network.sensors = network.sensors.filter(s => s.id !== sensorId);
    }

    // Remove readings
    this.readings.delete(sensorId);

    // Remove alerts
    this.alerts = this.alerts.filter(a => a.sensorId !== sensorId);

    return this.sensors.delete(sensorId);
  }

  getSensors(propertyId?: string): IoTSensor[] {
    const allSensors = Array.from(this.sensors.values());
    return propertyId ? allSensors.filter(s => s.propertyId === propertyId) : allSensors;
  }

  getSensor(sensorId: string): IoTSensor | null {
    return this.sensors.get(sensorId) || null;
  }

  // Data Collection
  async recordReading(sensorId: string, reading: Omit<SensorReading, 'timestamp'>): Promise<boolean> {
    const sensor = this.sensors.get(sensorId);
    if (!sensor) return false;

    const newReading: SensorReading = {
      ...reading,
      timestamp: new Date()
    };

    // Update sensor last reading
    sensor.lastReading = newReading;
    sensor.status = 'active';

    // Store reading
    if (!this.readings.has(sensorId)) {
      this.readings.set(sensorId, []);
    }
    this.readings.get(sensorId)!.push(newReading);

    // Keep only last 1000 readings per sensor
    const readings = this.readings.get(sensorId)!;
    if (readings.length > 1000) {
      readings.splice(0, readings.length - 1000);
    }

    // Check thresholds and generate alerts
    await this.checkThresholds(sensor, newReading);

    return true;
  }

  getSensorReadings(sensorId: string, limit: number = 100): SensorReading[] {
    return this.readings.get(sensorId)?.slice(-limit) || [];
  }

  getLatestReadings(propertyId: string): Record<string, SensorReading> {
    const sensors = this.getSensors(propertyId);
    const latest: Record<string, SensorReading> = {};

    sensors.forEach(sensor => {
      if (sensor.lastReading) {
        latest[sensor.id] = sensor.lastReading;
      }
    });

    return latest;
  }

  // Alert System
  async checkThresholds(sensor: IoTSensor, reading: SensorReading): Promise<void> {
    const { thresholds } = sensor;

    if (!thresholds.alertEnabled) return;

    let alertType: 'warning' | 'critical' | null = null;
    let message = '';

    if (thresholds.criticalMin !== undefined && reading.value <= thresholds.criticalMin) {
      alertType = 'critical';
      message = `${sensor.name}: Value ${reading.value}${reading.unit} is critically low (below ${thresholds.criticalMin})`;
    } else if (thresholds.criticalMax !== undefined && reading.value >= thresholds.criticalMax) {
      alertType = 'critical';
      message = `${sensor.name}: Value ${reading.value}${reading.unit} is critically high (above ${thresholds.criticalMax})`;
    } else if (thresholds.warningMin !== undefined && reading.value <= thresholds.warningMin) {
      alertType = 'warning';
      message = `${sensor.name}: Value ${reading.value}${reading.unit} is below warning threshold (${thresholds.warningMin})`;
    } else if (thresholds.warningMax !== undefined && reading.value >= thresholds.warningMax) {
      alertType = 'warning';
      message = `${sensor.name}: Value ${reading.value}${reading.unit} is above warning threshold (${thresholds.warningMax})`;
    }

    if (alertType) {
      const alert: SensorAlert = {
        id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sensorId: sensor.id,
        type: alertType,
        message,
        value: reading.value,
        threshold: alertType === 'critical'
          ? (reading.value <= (thresholds.criticalMin || 0) ? thresholds.criticalMin : thresholds.criticalMax)
          : (reading.value <= (thresholds.warningMin || 0) ? thresholds.warningMin : thresholds.warningMax),
        timestamp: new Date(),
        acknowledged: false
      };

      this.alerts.push(alert);
    }
  }

  getAlerts(propertyId?: string, acknowledged: boolean = false): SensorAlert[] {
    let filteredAlerts = this.alerts.filter(a => a.acknowledged === acknowledged);

    if (propertyId) {
      const sensorIds = this.getSensors(propertyId).map(s => s.id);
      filteredAlerts = filteredAlerts.filter(a => sensorIds.includes(a.sensorId));
    }

    return filteredAlerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async acknowledgeAlert(alertId: string, userId: string): Promise<boolean> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) return false;

    alert.acknowledged = true;
    alert.acknowledgedBy = userId;
    alert.acknowledgedAt = new Date();

    return true;
  }

  // Network Management
  async createNetwork(network: Omit<SensorNetwork, 'id'>): Promise<SensorNetwork> {
    const newNetwork: SensorNetwork = {
      ...network,
      id: `network-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    this.networks.set(newNetwork.id, newNetwork);
    return newNetwork;
  }

  getNetworks(propertyId?: string): SensorNetwork[] {
    const allNetworks = Array.from(this.networks.values());
    return propertyId ? allNetworks.filter(n => n.propertyId === propertyId) : allNetworks;
  }

  // Analytics
  getSensorAnalytics(sensorId: string, hours: number = 24): any {
    const readings = this.getSensorReadings(sensorId, hours * 60); // Assuming 1 reading per minute

    if (readings.length === 0) return null;

    const values = readings.map(r => r.value);
    const timestamps = readings.map(r => r.timestamp.getTime());

    return {
      sensorId,
      period: `${hours} hours`,
      count: readings.length,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      trend: this.calculateTrend(values),
      latest: readings[readings.length - 1],
      timestamps: timestamps,
      values: values
    };
  }

  private calculateTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 2) return 'stable';

    const recent = values.slice(-10); // Last 10 readings
    const earlier = values.slice(-20, -10); // Previous 10 readings

    if (earlier.length === 0) return 'stable';

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;

    const change = (recentAvg - earlierAvg) / earlierAvg;

    if (change > 0.05) return 'increasing';
    if (change < -0.05) return 'decreasing';
    return 'stable';
  }

  // Maintenance
  async scheduleMaintenance(sensorId: string, maintenanceType: string, dueDate: Date): Promise<boolean> {
    const sensor = this.sensors.get(sensorId);
    if (!sensor) return false;

    // Create maintenance alert
    const alert: SensorAlert = {
      id: `maintenance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sensorId,
      type: 'maintenance',
      message: `${sensor.name}: ${maintenanceType} due on ${dueDate.toDateString()}`,
      timestamp: new Date(),
      acknowledged: false
    };

    this.alerts.push(alert);
    return true;
  }

  async calibrateSensor(sensorId: string, calibrationData: Record<string, any>): Promise<boolean> {
    const sensor = this.sensors.get(sensorId);
    if (!sensor) return false;

    sensor.calibration = {
      lastCalibrated: new Date(),
      calibrationData,
      accuracy: 0.95, // Default accuracy
      nextCalibrationDue: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
    };

    return true;
  }

  private initializeDefaultNetworks(): void {
    // Initialize with some default networks
    this.networks.set('default-soil-network', {
      id: 'default-soil-network',
      propertyId: 'default',
      name: 'Default Soil Monitoring Network',
      sensors: [],
      protocol: 'mqtt',
      status: 'online',
      lastSeen: new Date()
    });

    this.networks.set('default-safety-network', {
      id: 'default-safety-network',
      propertyId: 'default',
      name: 'Default Safety Monitoring Network',
      sensors: [],
      protocol: 'mqtt',
      status: 'online',
      lastSeen: new Date()
    });
  }
}

export const iotSensorManagementEngine = new IoTSensorManagementEngine();