import { NextRequest, NextResponse } from 'next/server';
import { iotSensorManagementEngine } from '@/lib/iot-sensor-management-engine';
import { IoTSensor, SensorReading, SafetyData } from '@/lib/iot-sensor-management-engine';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');

    if (!propertyId) {
      return NextResponse.json(
        { error: 'propertyId query parameter is required' },
        { status: 400 }
      );
    }

    // Get safety sensors for the property
    const sensors = iotSensorManagementEngine.getSensors(propertyId)
      .filter(sensor => sensor.type === 'safety');

    // Get latest readings for each sensor
    const sensorData = sensors.map(sensor => {
      const latestReading = sensor.lastReading;
      const readings = iotSensorManagementEngine.getSensorReadings(sensor.id, 24 * 60); // Last 24 hours

      return {
        sensor: {
          id: sensor.id,
          name: sensor.name,
          location: sensor.location,
          status: sensor.status,
          batteryLevel: sensor.batteryLevel,
          signalStrength: sensor.signalStrength
        },
        latestReading,
        readings: readings.slice(-10), // Last 10 readings
        alerts: iotSensorManagementEngine.getAlerts(sensor.propertyId, false)
          .filter(alert => alert.sensorId === sensor.id)
          .slice(0, 5) // Last 5 unacknowledged alerts
      };
    });

    // Aggregate safety data for overview
    const safetyOverview = calculateSafetyOverview(sensorData);

    return NextResponse.json({
      success: true,
      data: {
        sensors: sensorData,
        overview: safetyOverview,
        activeAlerts: iotSensorManagementEngine.getAlerts(propertyId, false)
          .filter(alert => alert.type === 'critical' || alert.type === 'warning')
          .slice(0, 10), // Top 10 active safety alerts
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Error fetching safety monitoring data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch safety monitoring data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.sensorId && body.alertType) {
      // Emergency alert trigger
      const alertReading: SensorReading = {
        value: 1,
        unit: '',
        quality: 'good',
        timestamp: new Date(),
        metadata: {
          alertType: body.alertType,
          description: body.description || 'Emergency alert triggered',
          severity: body.severity || 'high'
        }
      };

      const success = await iotSensorManagementEngine.recordReading(body.sensorId, alertReading);

      return NextResponse.json({
        success,
        data: {
          sensorId: body.sensorId,
          alertType: body.alertType,
          timestamp: new Date()
        }
      });
    }

    if (body.sensorId && body.readings) {
      // Bulk reading submission
      const results = [];
      for (const reading of body.readings) {
        const success = await iotSensorManagementEngine.recordReading(body.sensorId, reading);
        results.push({ reading, success });
      }

      return NextResponse.json({
        success: true,
        data: results
      });
    }

    if (body.sensorId && body.value !== undefined) {
      // Single reading submission
      const reading: SensorReading = {
        value: body.value,
        unit: body.unit || getDefaultSafetyUnit(body.metric),
        quality: body.quality || 'good',
        timestamp: new Date(),
        metadata: body.metadata || {}
      };

      const success = await iotSensorManagementEngine.recordReading(body.sensorId, reading);

      return NextResponse.json({
        success,
        data: { sensorId: body.sensorId, reading }
      });
    }

    return NextResponse.json(
      { error: 'Invalid request format. Provide sensorId with alertType for emergency alerts, readings array, or single reading data.' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error recording safety monitoring data:', error);
    return NextResponse.json(
      { error: 'Failed to record safety monitoring data' },
      { status: 500 }
    );
  }
}

function calculateSafetyOverview(sensorData: any[]): any {
  const safetyMetrics: Record<string, { values: number[], unit: string, alerts: number }> = {
    gasLevel: { values: [], unit: 'ppm', alerts: 0 },
    noiseLevel: { values: [], unit: 'dB', alerts: 0 },
    vibrationLevel: { values: [], unit: '', alerts: 0 },
    motionEvents: { values: [], unit: 'count', alerts: 0 },
    smokeEvents: { values: [], unit: 'count', alerts: 0 }
  };

  sensorData.forEach(sensor => {
    if (sensor.latestReading) {
      const metric = getSafetyMetricFromSensor(sensor.sensor);
      if (metric && safetyMetrics[metric]) {
        safetyMetrics[metric].values.push(sensor.latestReading.value);
      }
    }

    // Count alerts
    sensor.alerts.forEach((alert: any) => {
      const metric = getSafetyMetricFromSensor(sensor.sensor);
      if (metric && safetyMetrics[metric]) {
        safetyMetrics[metric].alerts++;
      }
    });
  });

  // Calculate status overview
  const overview: Record<string, any> = {};
  Object.keys(safetyMetrics).forEach(metric => {
    const data = safetyMetrics[metric];
    if (data.values.length > 0) {
      const avgValue = data.values.reduce((a: number, b: number) => a + b, 0) / data.values.length;
      overview[metric] = {
        average: avgValue,
        max: Math.max(...data.values),
        count: data.values.length,
        unit: data.unit,
        alerts: data.alerts,
        status: getSafetyStatus(metric, avgValue, data.alerts)
      };
    }
  });

  return overview;
}

function getSafetyMetricFromSensor(sensor: any): string | null {
  const subtype = sensor.subtype?.toLowerCase();
  switch (subtype) {
    case 'gas':
      return 'gasLevel';
    case 'noise':
      return 'noiseLevel';
    case 'vibration':
      return 'vibrationLevel';
    case 'motion':
      return 'motionEvents';
    case 'smoke':
      return 'smokeEvents';
    default:
      return null;
  }
}

function getDefaultSafetyUnit(metric: string): string {
  switch (metric) {
    case 'gasLevel':
      return 'ppm';
    case 'noiseLevel':
      return 'dB';
    case 'motionEvents':
    case 'smokeEvents':
      return 'count';
    default:
      return '';
  }
}

function getSafetyStatus(metric: string, value: number, alertCount: number): 'safe' | 'warning' | 'danger' {
  // Check for active alerts first
  if (alertCount > 0) return 'danger';

  switch (metric) {
    case 'gasLevel':
      if (value > 100) return 'danger';
      if (value > 50) return 'warning';
      return 'safe';
    case 'noiseLevel':
      if (value > 85) return 'danger';
      if (value > 70) return 'warning';
      return 'safe';
    case 'vibrationLevel':
      if (value > 10) return 'warning';
      return 'safe';
    case 'motionEvents':
      if (value > 100) return 'warning'; // High activity
      return 'safe';
    case 'smokeEvents':
      if (value > 0) return 'danger';
      return 'safe';
    default:
      return 'safe';
  }
}