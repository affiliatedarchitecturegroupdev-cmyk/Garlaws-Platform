// Advanced IoT Sensor Integration System
export interface IoTDevice {
  id: string;
  name: string;
  type: 'sensor' | 'actuator' | 'gateway' | 'controller';
  category: 'environmental' | 'security' | 'energy' | 'structural' | 'occupancy';
  protocol: 'mqtt' | 'coap' | 'websocket' | 'http' | 'zigbee' | 'bluetooth' | 'wifi';
  model: string;
  manufacturer: string;
  firmwareVersion: string;
  location: {
    propertyId: string;
    roomId?: string;
    position: [number, number, number]; // x, y, z coordinates
    mounting: 'wall' | 'ceiling' | 'floor' | 'exterior' | 'embedded';
  };
  capabilities: string[]; // e.g., ['temperature', 'humidity', 'motion']
  specifications: {
    powerSource: 'battery' | 'wired' | 'solar' | 'energy_harvesting';
    batteryLevel?: number; // 0-100
    updateInterval: number; // seconds
    dataRetention: number; // days
    accuracy: { [capability: string]: number }; // accuracy percentage per capability
    range: { [capability: string]: [number, number] }; // min/max values per capability
  };
  status: 'online' | 'offline' | 'maintenance' | 'error';
  lastSeen: Date;
  registeredAt: Date;
}

export interface SensorReading {
  deviceId: string;
  timestamp: Date;
  readings: { [capability: string]: number };
  quality: {
    signalStrength: number; // dBm
    dataIntegrity: number; // 0-1
    anomalies: string[]; // detected anomalies
  };
  metadata: {
    protocol: string;
    packetId?: string;
    gatewayId?: string;
    rawData?: any;
  };
}

export interface IoTGateway {
  id: string;
  name: string;
  location: [number, number, number];
  protocol: string;
  connectedDevices: string[]; // device IDs
  networkConfig: {
    ipAddress: string;
    subnet: string;
    gateway: string;
    dns: string[];
  };
  security: {
    encryption: 'none' | 'tls' | 'dtls';
    authentication: 'none' | 'basic' | 'certificate' | 'token';
    firewall: boolean;
  };
  status: 'online' | 'offline' | 'restarting';
  lastHeartbeat: Date;
  uptime: number; // seconds
  throughput: {
    messagesPerSecond: number;
    dataRate: number; // bytes/second
  };
}

export interface IoTNetwork {
  id: string;
  name: string;
  type: 'mesh' | 'star' | 'tree' | 'point_to_point';
  protocol: string;
  frequency: number; // MHz
  bandwidth: number; // kbps
  range: number; // meters
  devices: string[]; // device IDs
  gateways: string[]; // gateway IDs
  topology: any; // network topology data
  performance: {
    latency: number; // ms
    packetLoss: number; // percentage
    throughput: number; // bytes/second
    uptime: number; // percentage
  };
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: {
    deviceId: string;
    capability: string;
    condition: 'above' | 'below' | 'equals' | 'between' | 'changes';
    threshold: number | [number, number];
    duration?: number; // seconds to maintain condition
  };
  actions: Array<{
    deviceId: string;
    capability: string;
    value: number | boolean;
    delay?: number; // seconds
  }>;
  enabled: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  cooldown: number; // seconds between triggers
  lastTriggered?: Date;
  successRate: number; // 0-1
}

export interface DataStream {
  id: string;
  name: string;
  deviceId: string;
  capability: string;
  format: 'json' | 'csv' | 'binary' | 'protobuf';
  endpoint: string;
  authentication: {
    type: 'none' | 'basic' | 'bearer' | 'api_key';
    credentials?: any;
  };
  filters: {
    timeRange?: [Date, Date];
    valueRange?: [number, number];
    samplingRate?: number; // Hz
  };
  subscribers: string[]; // subscriber IDs
  status: 'active' | 'paused' | 'error';
  metrics: {
    messagesSent: number;
    bytesTransferred: number;
    lastMessage: Date;
    averageLatency: number;
  };
}

class IoTSensorIntegration {
  private devices: Map<string, IoTDevice> = new Map();
  private gateways: Map<string, IoTGateway> = new Map();
  private networks: Map<string, IoTNetwork> = new Map();
  private readings: Map<string, SensorReading[]> = new Map();
  private automationRules: Map<string, AutomationRule> = new Map();
  private dataStreams: Map<string, DataStream> = new Map();

  // Protocol handlers
  private protocolHandlers = {
    mqtt: this.handleMQTT.bind(this),
    coap: this.handleCoAP.bind(this),
    websocket: this.handleWebSocket.bind(this),
    zigbee: this.handleZigbee.bind(this)
  };

  constructor() {
    this.initializeMockData();
    this.startDataCollection();
  }

  private initializeMockData() {
    // Create mock devices
    this.registerDevice({
      id: 'sensor_temp_001',
      name: 'Living Room Temperature Sensor',
      type: 'sensor',
      category: 'environmental',
      protocol: 'mqtt',
      model: 'Nest Temperature Sensor',
      manufacturer: 'Google',
      firmwareVersion: '2.1.4',
      location: {
        propertyId: 'PROP_001',
        roomId: 'living_room',
        position: [2, 2, 2.5],
        mounting: 'wall'
      },
      capabilities: ['temperature', 'humidity'],
      specifications: {
        powerSource: 'battery',
        batteryLevel: 85,
        updateInterval: 300, // 5 minutes
        dataRetention: 30, // 30 days
        accuracy: { temperature: 0.5, humidity: 2 },
        range: { temperature: [-10, 50], humidity: [0, 100] }
      },
      status: 'online',
      lastSeen: new Date(),
      registeredAt: new Date(Date.now() - 86400000) // 1 day ago
    });

    this.registerDevice({
      id: 'sensor_motion_001',
      name: 'Front Door Motion Sensor',
      type: 'sensor',
      category: 'security',
      protocol: 'zigbee',
      model: 'Ring Motion Detector',
      manufacturer: 'Ring',
      firmwareVersion: '1.8.2',
      location: {
        propertyId: 'PROP_001',
        position: [0, 0, 2],
        mounting: 'wall'
      },
      capabilities: ['motion', 'illuminance'],
      specifications: {
        powerSource: 'battery',
        batteryLevel: 92,
        updateInterval: 60, // 1 minute
        dataRetention: 7, // 7 days
        accuracy: { motion: 0.95, illuminance: 10 },
        range: { motion: [0, 1], illuminance: [0, 10000] }
      },
      status: 'online',
      lastSeen: new Date(),
      registeredAt: new Date(Date.now() - 86400000)
    });

    // Create mock gateway
    this.registerGateway({
      id: 'gateway_main',
      name: 'Main Property Gateway',
      location: [1, 1, 2],
      protocol: 'mqtt',
      connectedDevices: ['sensor_temp_001', 'sensor_motion_001'],
      networkConfig: {
        ipAddress: '192.168.1.100',
        subnet: '255.255.255.0',
        gateway: '192.168.1.1',
        dns: ['8.8.8.8', '1.1.1.1']
      },
      security: {
        encryption: 'tls',
        authentication: 'certificate',
        firewall: true
      },
      status: 'online',
      lastHeartbeat: new Date(),
      uptime: 86400, // 1 day
      throughput: {
        messagesPerSecond: 10,
        dataRate: 2048 // 2KB/s
      }
    });

    // Create automation rule
    this.createAutomationRule({
      id: 'rule_temp_control',
      name: 'Temperature Control',
      description: 'Adjust HVAC when temperature goes above 25°C',
      trigger: {
        deviceId: 'sensor_temp_001',
        capability: 'temperature',
        condition: 'above',
        threshold: 25,
        duration: 300 // 5 minutes
      },
      actions: [{
        deviceId: 'hvac_unit_001',
        capability: 'setpoint',
        value: 22
      }],
      enabled: true,
      priority: 'medium',
      cooldown: 1800, // 30 minutes
      successRate: 0.95
    });
  }

  async registerDevice(device: IoTDevice): Promise<void> {
    this.devices.set(device.id, device);
    this.readings.set(device.id, []);
  }

  async registerGateway(gateway: IoTGateway): Promise<void> {
    this.gateways.set(gateway.id, gateway);
  }

  async registerNetwork(network: IoTNetwork): Promise<void> {
    this.networks.set(network.id, network);
  }

  async unregisterDevice(deviceId: string): Promise<void> {
    this.devices.delete(deviceId);
    this.readings.delete(deviceId);
  }

  getDevice(deviceId: string): IoTDevice | undefined {
    return this.devices.get(deviceId);
  }

  getAllDevices(): IoTDevice[] {
    return Array.from(this.devices.values());
  }

  getDevicesByCategory(category: IoTDevice['category']): IoTDevice[] {
    return this.getAllDevices().filter(device => device.category === category);
  }

  getDevicesByProperty(propertyId: string): IoTDevice[] {
    return this.getAllDevices().filter(device => device.location.propertyId === propertyId);
  }

  async updateDeviceStatus(deviceId: string, status: IoTDevice['status']): Promise<void> {
    const device = this.devices.get(deviceId);
    if (device) {
      device.status = status;
      device.lastSeen = new Date();
    }
  }

  async receiveSensorReading(deviceId: string, reading: SensorReading): Promise<void> {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error(`Device ${deviceId} not found`);
    }

    // Update device status
    device.status = 'online';
    device.lastSeen = new Date();

    // Store reading
    const deviceReadings = this.readings.get(deviceId) || [];
    deviceReadings.push(reading);

    // Keep only last 1000 readings
    if (deviceReadings.length > 1000) {
      deviceReadings.shift();
    }

    this.readings.set(deviceId, deviceReadings);

    // Check automation rules
    await this.checkAutomationRules(deviceId, reading);

    // Forward to digital twin engine
    if (typeof window !== 'undefined') {
      // In browser environment, could send to API
      // For now, we'll simulate integration
    }
  }

  private async checkAutomationRules(deviceId: string, reading: SensorReading): Promise<void> {
    for (const rule of this.automationRules.values()) {
      if (!rule.enabled || rule.trigger.deviceId !== deviceId) continue;

      const capability = rule.trigger.capability;
      const value = reading.readings[capability];

      if (value === undefined) continue;

      let conditionMet = false;

      switch (rule.trigger.condition) {
        case 'above':
          conditionMet = value > (rule.trigger.threshold as number);
          break;
        case 'below':
          conditionMet = value < (rule.trigger.threshold as number);
          break;
        case 'equals':
          conditionMet = value === (rule.trigger.threshold as number);
          break;
        case 'between':
          const [min, max] = rule.trigger.threshold as [number, number];
          conditionMet = value >= min && value <= max;
          break;
      }

      if (conditionMet) {
        // Check cooldown
        if (rule.lastTriggered) {
          const timeSinceLastTrigger = Date.now() - rule.lastTriggered.getTime();
          if (timeSinceLastTrigger < rule.cooldown * 1000) continue;
        }

        // Execute actions
        await this.executeAutomationActions(rule.actions);
        rule.lastTriggered = new Date();
      }
    }
  }

  private async executeAutomationActions(actions: AutomationRule['actions']): Promise<void> {
    for (const action of actions) {
      // Simulate executing action on device
      console.log(`Executing action: ${action.deviceId}.${action.capability} = ${action.value}`);

      // In real implementation, this would send commands to devices
      // For demo, we'll just log the action
    }
  }

  createAutomationRule(rule: AutomationRule): void {
    this.automationRules.set(rule.id, rule);
  }

  getAutomationRules(): AutomationRule[] {
    return Array.from(this.automationRules.values());
  }

  async createDataStream(stream: DataStream): Promise<void> {
    this.dataStreams.set(stream.id, stream);
  }

  getDataStreams(): DataStream[] {
    return Array.from(this.dataStreams.values());
  }

  getDeviceReadings(deviceId: string, limit: number = 100): SensorReading[] {
    const readings = this.readings.get(deviceId) || [];
    return readings.slice(-limit);
  }

  getLatestReading(deviceId: string): SensorReading | undefined {
    const readings = this.readings.get(deviceId) || [];
    return readings[readings.length - 1];
  }

  // Protocol-specific handlers
  private async handleMQTT(deviceId: string, data: any): Promise<void> {
    // Handle MQTT protocol data
    const reading: SensorReading = {
      deviceId,
      timestamp: new Date(),
      readings: data.payload,
      quality: {
        signalStrength: data.signalStrength || -50,
        dataIntegrity: 0.98,
        anomalies: []
      },
      metadata: {
        protocol: 'mqtt',
        packetId: data.packetId,
        gatewayId: data.gatewayId
      }
    };

    await this.receiveSensorReading(deviceId, reading);
  }

  private async handleCoAP(deviceId: string, data: any): Promise<void> {
    // Handle CoAP protocol data
    const reading: SensorReading = {
      deviceId,
      timestamp: new Date(),
      readings: data.payload,
      quality: {
        signalStrength: data.rssi || -60,
        dataIntegrity: 0.95,
        anomalies: []
      },
      metadata: {
        protocol: 'coap',
        rawData: data
      }
    };

    await this.receiveSensorReading(deviceId, reading);
  }

  private async handleWebSocket(deviceId: string, data: any): Promise<void> {
    // Handle WebSocket protocol data
    const reading: SensorReading = {
      deviceId,
      timestamp: new Date(),
      readings: data,
      quality: {
        signalStrength: 0, // WebSocket doesn't have signal strength
        dataIntegrity: 1.0,
        anomalies: []
      },
      metadata: {
        protocol: 'websocket'
      }
    };

    await this.receiveSensorReading(deviceId, reading);
  }

  private async handleZigbee(deviceId: string, data: any): Promise<void> {
    // Handle Zigbee protocol data
    const reading: SensorReading = {
      deviceId,
      timestamp: new Date(),
      readings: data.payload,
      quality: {
        signalStrength: data.lqi || 200,
        dataIntegrity: 0.92,
        anomalies: []
      },
      metadata: {
        protocol: 'zigbee',
        rawData: data
      }
    };

    await this.receiveSensorReading(deviceId, reading);
  }

  // Network monitoring
  getNetworkStatus(): {
    totalDevices: number;
    onlineDevices: number;
    offlineDevices: number;
    totalGateways: number;
    activeGateways: number;
    protocols: { [protocol: string]: number };
  } {
    const devices = this.getAllDevices();
    const gateways = Array.from(this.gateways.values());

    const protocols: { [key: string]: number } = {};
    devices.forEach(device => {
      protocols[device.protocol] = (protocols[device.protocol] || 0) + 1;
    });

    return {
      totalDevices: devices.length,
      onlineDevices: devices.filter(d => d.status === 'online').length,
      offlineDevices: devices.filter(d => d.status === 'offline').length,
      totalGateways: gateways.length,
      activeGateways: gateways.filter(g => g.status === 'online').length,
      protocols
    };
  }

  // Data collection simulation
  private startDataCollection(): void {
    // Simulate periodic data collection from devices
    setInterval(() => {
      this.generateMockReadings();
    }, 10000); // Every 10 seconds
  }

  private async generateMockReadings(): Promise<void> {
    for (const device of this.devices.values()) {
      if (device.status !== 'online') continue;

      const mockReading: SensorReading = {
        deviceId: device.id,
        timestamp: new Date(),
        readings: {},
        quality: {
          signalStrength: -Math.floor(Math.random() * 40 + 30), // -30 to -70 dBm
          dataIntegrity: 0.95 + Math.random() * 0.05, // 0.95-1.0
          anomalies: []
        },
        metadata: {
          protocol: device.protocol
        }
      };

      // Generate mock values for each capability
      for (const capability of device.capabilities) {
        const range = device.specifications.range[capability];
        if (range) {
          const value = range[0] + Math.random() * (range[1] - range[0]);
          mockReading.readings[capability] = Math.round(value * 100) / 100;
        }
      }

      await this.receiveSensorReading(device.id, mockReading);
    }
  }

  // Analytics and insights
  getDeviceAnalytics(deviceId: string): {
    uptime: number;
    dataQuality: number;
    anomalyRate: number;
    averageReadings: { [capability: string]: number };
  } {
    const readings = this.getDeviceReadings(deviceId, 1000);
    const device = this.getDevice(deviceId);

    if (!device || readings.length === 0) {
      return { uptime: 0, dataQuality: 0, anomalyRate: 0, averageReadings: {} };
    }

    const uptime = readings.filter(r => r.quality.dataIntegrity > 0.9).length / readings.length;
    const dataQuality = readings.reduce((sum, r) => sum + r.quality.dataIntegrity, 0) / readings.length;
    const anomalyRate = readings.reduce((sum, r) => sum + r.quality.anomalies.length, 0) / readings.length;

    const averageReadings: { [key: string]: number } = {};
    for (const capability of device.capabilities) {
      const values = readings.map(r => r.readings[capability]).filter(v => v !== undefined);
      if (values.length > 0) {
        averageReadings[capability] = values.reduce((sum, v) => sum + v, 0) / values.length;
      }
    }

    return {
      uptime,
      dataQuality,
      anomalyRate,
      averageReadings
    };
  }
}

export const iotSensorIntegration = new IoTSensorIntegration();