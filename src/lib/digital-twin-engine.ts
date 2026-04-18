// Advanced Digital Twin Engine for Property Management
export interface DigitalTwin {
  id: string;
  propertyId: string;
  name: string;
  description: string;
  model3D: {
    url: string;
    format: 'gltf' | 'obj' | 'fbx' | 'dae';
    size: number; // file size in bytes
    lastUpdated: Date;
  };
  geometry: {
    floors: Floor[];
    rooms: Room[];
    exterior: ExteriorFeatures;
    boundaries: PropertyBoundary;
  };
  sensors: SensorNetwork;
  systems: BuildingSystems;
  metadata: {
    createdAt: Date;
    lastSync: Date;
    version: string;
    accuracy: number; // 0-1, model accuracy score
    dataSources: string[]; // sensors, scans, blueprints, etc.
  };
  simulationState: {
    currentTime: Date;
    weatherConditions: WeatherData;
    occupancyStatus: OccupancyData;
    systemStates: SystemState[];
  };
  status: 'initializing' | 'active' | 'maintenance' | 'error';
}

export interface Floor {
  id: string;
  name: string;
  level: number; // floor number (0 = ground floor)
  area: number; // square meters
  height: number; // ceiling height in meters
  rooms: string[]; // room IDs on this floor
  geometry: {
    vertices: number[][];
    faces: number[][];
    texture?: string;
  };
}

export interface Room {
  id: string;
  name: string;
  type: 'living' | 'bedroom' | 'bathroom' | 'kitchen' | 'office' | 'storage' | 'other';
  floorId: string;
  area: number;
  volume: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  features: RoomFeature[];
  sensors: Sensor[];
  geometry: {
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
  };
}

export interface RoomFeature {
  id: string;
  type: 'door' | 'window' | 'wall' | 'fixture' | 'appliance';
  position: [number, number, number];
  dimensions: [number, number, number];
  material?: string;
  state?: 'open' | 'closed' | 'on' | 'off';
}

export interface ExteriorFeatures {
  roof: {
    type: 'flat' | 'pitched' | 'mansard' | 'hip';
    material: string;
    area: number;
    slope?: number; // degrees for pitched roofs
  };
  walls: Wall[];
  windows: Window[];
  doors: Door[];
  landscaping: {
    garden: boolean;
    pool: boolean;
    driveway: boolean;
    garage: boolean;
  };
}

export interface Wall {
  id: string;
  material: string;
  thickness: number;
  insulation: {
    type: string;
    rValue: number; // thermal resistance
  };
  condition: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface Window {
  id: string;
  position: [number, number, number];
  dimensions: [number, number];
  type: 'single' | 'double' | 'triple';
  frameMaterial: string;
  glassType: string;
  operable: boolean;
}

export interface Door {
  id: string;
  position: [number, number, number];
  dimensions: [number, number];
  type: 'entrance' | 'interior' | 'garage' | 'patio';
  material: string;
  lockType?: string;
}

export interface PropertyBoundary {
  perimeter: number[][]; // GPS coordinates forming boundary
  area: number; // square meters
  zoning: string;
  setbacks: {
    front: number;
    back: number;
    sides: number;
  };
}

export interface SensorNetwork {
  sensors: Sensor[];
  hubs: SensorHub[];
  connectivity: {
    protocol: 'wifi' | 'zigbee' | 'bluetooth' | 'cellular';
    signalStrength: number;
    lastConnectivityCheck: Date;
  };
  dataQuality: {
    uptime: number; // percentage
    dataAccuracy: number;
    latency: number; // milliseconds
  };
}

export interface Sensor {
  id: string;
  type: 'temperature' | 'humidity' | 'motion' | 'light' | 'sound' | 'air_quality' | 'energy' | 'water' | 'security';
  location: {
    roomId: string;
    position: [number, number, number];
    mounting: 'wall' | 'ceiling' | 'floor' | 'exterior';
  };
  specifications: {
    model: string;
    manufacturer: string;
    accuracy: number;
    range: [number, number];
    batteryLevel?: number;
    lastMaintenance: Date;
  };
  readings: SensorReading[];
  status: 'active' | 'inactive' | 'maintenance' | 'error';
}

export interface SensorHub {
  id: string;
  location: [number, number, number];
  connectedSensors: string[]; // sensor IDs
  networkInfo: {
    ipAddress: string;
    macAddress: string;
    firmwareVersion: string;
  };
  status: 'online' | 'offline' | 'restarting';
}

export interface SensorReading {
  timestamp: Date;
  value: number;
  unit: string;
  quality: 'good' | 'fair' | 'poor';
  anomalies?: string[]; // detected anomalies
}

export interface BuildingSystems {
  electrical: ElectricalSystem;
  plumbing: PlumbingSystem;
  hvac: HVACSystem;
  security: SecuritySystem;
  fire: FireSafetySystem;
  structural: StructuralSystem;
}

export interface ElectricalSystem {
  mainPanel: {
    location: [number, number, number];
    capacity: number; // amps
    circuits: Circuit[];
  };
  solarPanels?: {
    count: number;
    totalCapacity: number; // watts
    orientation: number; // degrees from north
    tilt: number; // degrees
    efficiency: number;
  };
  backupGenerator?: {
    capacity: number; // watts
    fuelType: string;
    runtimeHours: number;
  };
}

export interface Circuit {
  id: string;
  name: string;
  breakerRating: number;
  load: number; // current load in amps
  rooms: string[]; // rooms this circuit serves
}

export interface PlumbingSystem {
  mainLine: {
    material: string;
    diameter: number;
    pressure: number;
  };
  fixtures: PlumbingFixture[];
  drainage: DrainageSystem;
  waterHeater: {
    type: 'tank' | 'tankless';
    capacity: number;
    efficiency: number;
    location: [number, number, number];
  };
}

export interface PlumbingFixture {
  id: string;
  type: 'sink' | 'toilet' | 'shower' | 'bathtub' | 'faucet';
  location: [number, number, number];
  flowRate: number; // liters per minute
  status: 'operational' | 'leaking' | 'clogged';
}

export interface DrainageSystem {
  pipes: DrainagePipe[];
  sumpPump?: {
    location: [number, number, number];
    capacity: number;
    status: 'operational' | 'failed';
  };
}

export interface DrainagePipe {
  id: string;
  material: string;
  diameter: number;
  length: number;
  slope: number; // percentage
  location: string; // area it drains
}

export interface HVACSystem {
  units: HVACUnit[];
  ductwork: Duct[];
  thermostat: {
    location: [number, number, number];
    model: string;
    smart: boolean;
    zones: number;
  };
  ventilation: {
    type: 'natural' | 'mechanical' | 'hybrid';
    airflowRate: number; // cubic meters per hour
  };
}

export interface HVACUnit {
  id: string;
  type: 'air_conditioner' | 'furnace' | 'heat_pump' | 'ductless';
  location: [number, number, number];
  capacity: number; // BTU or kW
  efficiency: number; // SEER or AFUE rating
  age: number; // years
  maintenanceSchedule: Date[];
}

export interface Duct {
  id: string;
  material: string;
  diameter: number;
  length: number;
  insulation: boolean;
  location: string; // which rooms/zones it serves
}

export interface SecuritySystem {
  cameras: SecurityCamera[];
  alarms: AlarmSystem[];
  accessControl: AccessControlSystem;
  monitoring: {
    centralStation: boolean;
    responseTime: number; // minutes
    contractType: string;
  };
}

export interface SecurityCamera {
  id: string;
  location: [number, number, number];
  type: 'indoor' | 'outdoor' | 'doorbell' | 'ptz';
  resolution: string;
  nightVision: boolean;
  motionDetection: boolean;
  recording: boolean;
}

export interface AlarmSystem {
  id: string;
  type: 'burglar' | 'fire' | 'medical' | 'panic';
  zones: AlarmZone[];
  controlPanel: {
    location: [number, number, number];
    model: string;
  };
}

export interface AlarmZone {
  id: string;
  name: string;
  type: 'entry' | 'interior' | 'perimeter' | 'fire' | 'environmental';
  sensors: string[]; // sensor IDs
}

export interface AccessControlSystem {
  type: 'keypad' | 'card' | 'biometric' | 'smart_lock';
  entryPoints: AccessPoint[];
  authorizedUsers: string[]; // user IDs
}

export interface AccessPoint {
  id: string;
  location: string;
  type: 'door' | 'gate' | 'garage';
  accessMethods: string[];
}

export interface FireSafetySystem {
  smokeDetectors: SmokeDetector[];
  sprinklers: SprinklerSystem;
  extinguishers: FireExtinguisher[];
  emergencyLighting: EmergencyLight[];
}

export interface SmokeDetector {
  id: string;
  location: [number, number, number];
  type: 'ionization' | 'photoelectric' | 'dual_sensor';
  interconnected: boolean;
  lastTest: Date;
}

export interface SprinklerSystem {
  type: 'wet' | 'dry' | 'pre_action' | 'deluge';
  zones: number;
  coverage: string; // percentage of property covered
  lastInspection: Date;
}

export interface FireExtinguisher {
  id: string;
  location: [number, number, number];
  type: string; // ABC, CO2, etc.
  capacity: number;
  lastInspection: Date;
}

export interface EmergencyLight {
  id: string;
  location: [number, number, number];
  type: 'exit_sign' | 'emergency_light';
  batteryBackup: boolean;
  lastTest: Date;
}

export interface StructuralSystem {
  foundation: {
    type: string;
    material: string;
    condition: 'excellent' | 'good' | 'fair' | 'poor';
    lastInspection: Date;
  };
  framing: {
    type: string;
    material: string;
    condition: 'excellent' | 'good' | 'fair' | 'poor';
  };
  roof: {
    structure: string;
    condition: 'excellent' | 'good' | 'fair' | 'poor';
    lastInspection: Date;
  };
  loadBearing: LoadBearingElement[];
}

export interface LoadBearingElement {
  id: string;
  type: 'wall' | 'beam' | 'column' | 'foundation';
  material: string;
  dimensions: [number, number, number];
  loadCapacity: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface WeatherData {
  temperature: number; // Celsius
  humidity: number; // percentage
  windSpeed: number; // km/h
  windDirection: number; // degrees
  precipitation: number; // mm/hour
  pressure: number; // hPa
  uvIndex: number;
  visibility: number; // km
  timestamp: Date;
}

export interface OccupancyData {
  totalOccupants: number;
  roomOccupancy: { [roomId: string]: number };
  movementPatterns: MovementPattern[];
  energyUsage: {
    lighting: number; // watts
    appliances: number; // watts
    hvac: number; // watts
  };
  timestamp: Date;
}

export interface MovementPattern {
  occupantId: string;
  path: [number, number, number][]; // 3D coordinates over time
  timestamp: Date;
  activity: 'walking' | 'running' | 'stationary';
}

export interface SystemState {
  systemId: string;
  component: string;
  status: 'operational' | 'warning' | 'error' | 'maintenance';
  metrics: { [key: string]: number };
  lastUpdated: Date;
}

class DigitalTwinEngine {
  private twins: Map<string, DigitalTwin> = new Map();
  private sensorData: Map<string, SensorReading[]> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Create sample digital twin for demonstration
    this.createDigitalTwin('PROP_001', 'Sample Property Digital Twin');
  }

  async createDigitalTwin(propertyId: string, name: string): Promise<DigitalTwin> {
    const twinId = `twin_${propertyId}_${Date.now()}`;

    // Generate mock 3D model data
    const model3D = {
      url: `https://example.com/models/${propertyId}.gltf`,
      format: 'gltf' as const,
      size: 5242880, // 5MB
      lastUpdated: new Date()
    };

    // Generate mock geometry
    const geometry = this.generateMockGeometry();

    // Generate mock sensors
    const sensors = this.generateMockSensors();

    // Generate mock building systems
    const systems = this.generateMockSystems();

    const twin: DigitalTwin = {
      id: twinId,
      propertyId,
      name,
      description: `Digital twin for property ${propertyId}`,
      model3D,
      geometry,
      sensors,
      systems,
      metadata: {
        createdAt: new Date(),
        lastSync: new Date(),
        version: '1.0.0',
        accuracy: 0.95,
        dataSources: ['laser_scan', 'blueprints', 'iot_sensors', 'manual_measurement']
      },
      simulationState: {
        currentTime: new Date(),
        weatherConditions: this.generateMockWeather(),
        occupancyStatus: this.generateMockOccupancy(),
        systemStates: this.generateMockSystemStates()
      },
      status: 'active'
    };

    this.twins.set(twinId, twin);
    return twin;
  }

  private generateMockGeometry(): DigitalTwin['geometry'] {
    return {
      floors: [
        {
          id: 'floor_0',
          name: 'Ground Floor',
          level: 0,
          area: 120,
          height: 2.7,
          rooms: ['living_room', 'kitchen', 'bathroom'],
          geometry: {
            vertices: [], // Would contain actual 3D coordinates
            faces: []
          }
        },
        {
          id: 'floor_1',
          name: 'First Floor',
          level: 1,
          area: 100,
          height: 2.7,
          rooms: ['bedroom_1', 'bedroom_2', 'bathroom_2'],
          geometry: {
            vertices: [],
            faces: []
          }
        }
      ],
      rooms: [
        {
          id: 'living_room',
          name: 'Living Room',
          type: 'living',
          floorId: 'floor_0',
          area: 25,
          volume: 67.5,
          dimensions: { length: 5, width: 5, height: 2.7 },
          features: [
            {
              id: 'window_1',
              type: 'window',
              position: [2, 0, 1.5],
              dimensions: [1.5, 1.2, 0.1]
            }
          ],
          sensors: [],
          geometry: {
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: [1, 1, 1]
          }
        }
      ],
      exterior: {
        roof: {
          type: 'pitched',
          material: 'tiles',
          area: 140,
          slope: 30
        },
        walls: [
          {
            id: 'wall_1',
            material: 'brick',
            thickness: 0.22,
            insulation: { type: 'fiberglass', rValue: 3.6 },
            condition: 'good'
          }
        ],
        windows: [
          {
            id: 'window_1',
            position: [2, 0, 1.5],
            dimensions: [1.5, 1.2],
            type: 'double',
            frameMaterial: 'uPVC',
            glassType: 'low_e',
            operable: true
          }
        ],
        doors: [
          {
            id: 'door_1',
            position: [0, 0, 0],
            dimensions: [0.9, 2.1],
            type: 'entrance',
            material: 'wood',
            lockType: 'deadbolt'
          }
        ],
        landscaping: {
          garden: true,
          pool: false,
          driveway: true,
          garage: true
        }
      },
      boundaries: {
        perimeter: [
          [0, 0], [20, 0], [20, 15], [0, 15], [0, 0]
        ],
        area: 300,
        zoning: 'residential',
        setbacks: { front: 3, back: 5, sides: 2 }
      }
    };
  }

  private generateMockSensors(): SensorNetwork {
    return {
      sensors: [
        {
          id: 'temp_living',
          type: 'temperature',
          location: {
            roomId: 'living_room',
            position: [2, 2, 2.5],
            mounting: 'wall'
          },
          specifications: {
            model: 'Nest Temperature Sensor',
            manufacturer: 'Google',
            accuracy: 0.5,
            range: [-10, 50],
            batteryLevel: 85,
            lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          },
          readings: [],
          status: 'active'
        },
        {
          id: 'motion_entrance',
          type: 'motion',
          location: {
            roomId: 'entrance',
            position: [0, 0, 2],
            mounting: 'ceiling'
          },
          specifications: {
            model: 'Ring Motion Sensor',
            manufacturer: 'Ring',
            accuracy: 0.95,
            range: [0, 10],
            batteryLevel: 92,
            lastMaintenance: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
          },
          readings: [],
          status: 'active'
        }
      ],
      hubs: [
        {
          id: 'hub_main',
          location: [1, 1, 2],
          connectedSensors: ['temp_living', 'motion_entrance'],
          networkInfo: {
            ipAddress: '192.168.1.100',
            macAddress: '00:11:22:33:44:55',
            firmwareVersion: '2.1.4'
          },
          status: 'online'
        }
      ],
      connectivity: {
        protocol: 'wifi',
        signalStrength: 85,
        lastConnectivityCheck: new Date()
      },
      dataQuality: {
        uptime: 99.5,
        dataAccuracy: 0.96,
        latency: 45
      }
    };
  }

  private generateMockSystems(): BuildingSystems {
    return {
      electrical: {
        mainPanel: {
          location: [1, 1, 0],
          capacity: 200,
          circuits: [
            {
              id: 'circuit_lighting',
              name: 'Lighting Circuit',
              breakerRating: 15,
              load: 8,
              rooms: ['living_room', 'kitchen']
            }
          ]
        },
        solarPanels: {
          count: 12,
          totalCapacity: 4800,
          orientation: 180,
          tilt: 25,
          efficiency: 0.22
        }
      },
      plumbing: {
        mainLine: {
          material: 'copper',
          diameter: 0.022,
          pressure: 350
        },
        fixtures: [
          {
            id: 'sink_kitchen',
            type: 'sink',
            location: [3, 2, 0.9],
            flowRate: 8.3,
            status: 'operational'
          }
        ],
        drainage: {
          pipes: [
            {
              id: 'drain_main',
              material: 'PVC',
              diameter: 0.1,
              length: 15,
              slope: 2,
              location: 'main drainage'
            }
          ]
        },
        waterHeater: {
          type: 'tank',
          capacity: 200,
          efficiency: 0.95,
          location: [0.5, 0.5, 0]
        }
      },
      hvac: {
        units: [
          {
            id: 'ac_main',
            type: 'air_conditioner',
            location: [2, 15, 0],
            capacity: 12000,
            efficiency: 16,
            age: 3,
            maintenanceSchedule: [new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)]
          }
        ],
        ductwork: [
          {
            id: 'duct_main',
            material: 'flexible',
            diameter: 0.2,
            length: 20,
            insulation: true,
            location: 'living areas'
          }
        ],
        thermostat: {
          location: [2, 0, 1.5],
          model: 'Nest Learning Thermostat',
          smart: true,
          zones: 2
        },
        ventilation: {
          type: 'mechanical',
          airflowRate: 200
        }
      },
      security: {
        cameras: [
          {
            id: 'cam_front',
            location: [2, 0, 3],
            type: 'doorbell',
            resolution: '1080p',
            nightVision: true,
            motionDetection: true,
            recording: true
          }
        ],
        alarms: [
          {
            id: 'alarm_main',
            type: 'burglar',
            zones: [
              {
                id: 'zone_entrance',
                name: 'Front Entrance',
                type: 'entry',
                sensors: ['motion_entrance']
              }
            ],
            controlPanel: {
              location: [1, 0, 1.5],
              model: 'ADT Control Panel'
            }
          }
        ],
        accessControl: {
          type: 'smart_lock',
          entryPoints: [
            {
              id: 'lock_front',
              location: 'front door',
              type: 'door',
              accessMethods: ['keypad', 'app', 'key']
            }
          ],
          authorizedUsers: ['owner', 'tenant']
        },
        monitoring: {
          centralStation: true,
          responseTime: 8,
          contractType: 'gold'
        }
      },
      fire: {
        smokeDetectors: [
          {
            id: 'smoke_living',
            location: [2, 2, 2.5],
            type: 'photoelectric',
            interconnected: true,
            lastTest: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        ],
        sprinklers: {
          type: 'wet',
          zones: 3,
          coverage: '85%',
          lastInspection: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
        },
        extinguishers: [
          {
            id: 'extinguisher_kitchen',
            location: [3, 2, 0.5],
            type: 'ABC',
            capacity: 5,
            lastInspection: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
          }
        ],
        emergencyLighting: [
          {
            id: 'exit_sign_living',
            location: [0, 2, 2.2],
            type: 'exit_sign',
            batteryBackup: true,
            lastTest: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
          }
        ]
      },
      structural: {
        foundation: {
          type: 'slab',
          material: 'concrete',
          condition: 'good',
          lastInspection: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
        },
        framing: {
          type: 'wood',
          material: 'pine',
          condition: 'good'
        },
        roof: {
          structure: 'truss',
          condition: 'excellent',
          lastInspection: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
        },
        loadBearing: [
          {
            id: 'wall_load_1',
            type: 'wall',
            material: 'brick',
            dimensions: [10, 0.22, 2.7],
            loadCapacity: 50000,
            condition: 'good'
          }
        ]
      }
    };
  }

  private generateMockWeather(): WeatherData {
    return {
      temperature: 22,
      humidity: 65,
      windSpeed: 15,
      windDirection: 180,
      precipitation: 0,
      pressure: 1013,
      uvIndex: 6,
      visibility: 10,
      timestamp: new Date()
    };
  }

  private generateMockOccupancy(): OccupancyData {
    return {
      totalOccupants: 2,
      roomOccupancy: {
        'living_room': 2,
        'kitchen': 1,
        'bedroom_1': 0
      },
      movementPatterns: [
        {
          occupantId: 'person_1',
          path: [[2, 2, 0], [3, 2, 0], [3, 3, 0]],
          timestamp: new Date(),
          activity: 'walking'
        }
      ],
      energyUsage: {
        lighting: 120,
        appliances: 800,
        hvac: 1500
      },
      timestamp: new Date()
    };
  }

  private generateMockSystemStates(): SystemState[] {
    return [
      {
        systemId: 'hvac_main',
        component: 'air_conditioner',
        status: 'operational',
        metrics: { temperature: 22, humidity: 65, power_usage: 1200 },
        lastUpdated: new Date()
      },
      {
        systemId: 'electrical_main',
        component: 'main_panel',
        status: 'operational',
        metrics: { voltage: 240, load_percentage: 45 },
        lastUpdated: new Date()
      }
    ];
  }

  // Public API methods
  getDigitalTwin(twinId: string): DigitalTwin | undefined {
    return this.twins.get(twinId);
  }

  getDigitalTwinByProperty(propertyId: string): DigitalTwin | undefined {
    for (const twin of this.twins.values()) {
      if (twin.propertyId === propertyId) {
        return twin;
      }
    }
    return undefined;
  }

  getAllDigitalTwins(): DigitalTwin[] {
    return Array.from(this.twins.values());
  }

  async updateSensorData(sensorId: string, reading: SensorReading): Promise<void> {
    const readings = this.sensorData.get(sensorId) || [];
    readings.push(reading);

    // Keep only last 1000 readings
    if (readings.length > 1000) {
      readings.shift();
    }

    this.sensorData.set(sensorId, readings);

    // Update twin's simulation state
    for (const twin of this.twins.values()) {
      const sensor = twin.sensors.sensors.find(s => s.id === sensorId);
      if (sensor) {
        sensor.readings = readings.slice(-50); // Keep last 50 readings in twin
        twin.metadata.lastSync = new Date();
        break;
      }
    }
  }

  async simulatePropertyConditions(twinId: string, durationHours: number): Promise<SystemState[]> {
    const twin = this.twins.get(twinId);
    if (!twin) {
      throw new Error('Digital twin not found');
    }

    const simulationStates: SystemState[] = [];
    const startTime = new Date();

    // Simple simulation logic
    for (let hour = 0; hour < durationHours; hour++) {
      const currentTime = new Date(startTime.getTime() + hour * 60 * 60 * 1000);

      // Simulate system states based on time of day
      const hourOfDay = currentTime.getHours();
      const isNight = hourOfDay < 6 || hourOfDay > 22;

      // HVAC simulation
      const hvacState: SystemState = {
        systemId: 'hvac_simulation',
        component: 'air_conditioner',
        status: isNight ? 'operational' : 'operational',
        metrics: {
          temperature: 22 + (Math.random() - 0.5) * 4,
          humidity: 65 + (Math.random() - 0.5) * 10,
          power_usage: isNight ? 800 : 1200
        },
        lastUpdated: currentTime
      };

      // Electrical simulation
      const electricalState: SystemState = {
        systemId: 'electrical_simulation',
        component: 'main_panel',
        status: 'operational',
        metrics: {
          voltage: 240 + (Math.random() - 0.5) * 2,
          load_percentage: isNight ? 25 : 55 + (Math.random() - 0.5) * 20
        },
        lastUpdated: currentTime
      };

      simulationStates.push(hvacState, electricalState);
    }

    return simulationStates;
  }

  async predictMaintenanceNeeds(twinId: string): Promise<{
    system: string;
    component: string;
    predictedFailure: Date;
    confidence: number;
    recommendedAction: string;
  }[]> {
    const twin = this.twins.get(twinId);
    if (!twin) {
      throw new Error('Digital twin not found');
    }

    const predictions = [];

    // HVAC maintenance prediction based on age and usage
    const hvacUnit = twin.systems.hvac.units[0];
    if (hvacUnit) {
      const daysToFailure = Math.max(30, 365 - (hvacUnit.age * 30)); // Simplified prediction
      predictions.push({
        system: 'HVAC',
        component: 'Air Conditioner',
        predictedFailure: new Date(Date.now() + daysToFailure * 24 * 60 * 60 * 1000),
        confidence: 0.75,
        recommendedAction: 'Schedule annual maintenance inspection'
      });
    }

    // Electrical system prediction
    const electricalLoad = twin.systems.electrical.mainPanel.circuits.reduce((sum, circuit) => sum + circuit.load, 0);
    if (electricalLoad > 150) { // High load
      predictions.push({
        system: 'Electrical',
        component: 'Main Panel',
        predictedFailure: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        confidence: 0.6,
        recommendedAction: 'Consider electrical system upgrade'
      });
    }

    return predictions;
  }

  async runScenarioSimulation(
    twinId: string,
    scenario: {
      name: string;
      changes: {
        occupancyIncrease?: number;
        temperatureChange?: number;
        energyPriceIncrease?: number;
      };
      durationDays: number;
    }
  ): Promise<{
    energyConsumption: number[];
    costProjection: number[];
    systemPerformance: SystemState[][];
  }> {
    const twin = this.twins.get(twinId);
    if (!twin) {
      throw new Error('Digital twin not found');
    }

    const energyConsumption = [];
    const costProjection = [];
    const systemPerformance = [];

    // Simulate scenario over time
    for (let day = 0; day < scenario.durationDays; day++) {
      // Calculate energy consumption with scenario changes
      const baseConsumption = 25; // kWh/day base
      const occupancyMultiplier = 1 + (scenario.changes.occupancyIncrease || 0) / 100;
      const temperatureMultiplier = 1 + Math.abs(scenario.changes.temperatureChange || 0) / 20;
      const dailyConsumption = baseConsumption * occupancyMultiplier * temperatureMultiplier;

      energyConsumption.push(dailyConsumption);

      // Calculate cost with energy price changes
      const basePrice = 2.5; // R/kWh
      const priceMultiplier = 1 + (scenario.changes.energyPriceIncrease || 0) / 100;
      const dailyCost = dailyConsumption * basePrice * priceMultiplier;

      costProjection.push(dailyCost);

      // Generate system performance for this day
      const dayPerformance = await this.simulatePropertyConditions(twinId, 24);
      systemPerformance.push(dayPerformance);
    }

    return {
      energyConsumption,
      costProjection,
      systemPerformance
    };
  }
}

export const digitalTwinEngine = new DigitalTwinEngine();