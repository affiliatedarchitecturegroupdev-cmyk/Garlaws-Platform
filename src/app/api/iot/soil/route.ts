import { NextRequest, NextResponse } from 'next/server';
import { iotSensorManagementEngine } from '@/lib/iot-sensor-management-engine';
import { IoTSensor, SensorReading, SoilData } from '@/lib/iot-sensor-management-engine';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const sensorType = searchParams.get('type') || 'soil';

    if (!propertyId) {
      return NextResponse.json(
        { error: 'propertyId query parameter is required' },
        { status: 400 }
      );
    }

    // Get soil sensors for the property
    const sensors = iotSensorManagementEngine.getSensors(propertyId)
      .filter(sensor => sensor.type === sensorType);

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

    // Aggregate soil data for overview
    const soilOverview = calculateSoilOverview(sensorData);

    return NextResponse.json({
      success: true,
      data: {
        sensors: sensorData,
        overview: soilOverview,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Error fetching soil monitoring data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch soil monitoring data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Handle different types of soil data submissions
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
      const reading = {
        value: body.value,
        unit: body.unit || getDefaultUnit(body.metric),
        quality: body.quality || 'good',
        metadata: body.metadata || {}
      };

      const success = await iotSensorManagementEngine.recordReading(body.sensorId, reading);

      return NextResponse.json({
        success,
        data: { sensorId: body.sensorId, reading }
      });
    }

    return NextResponse.json(
      { error: 'Invalid request format. Provide sensorId with readings array or single reading data.' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error recording soil monitoring data:', error);
    return NextResponse.json(
      { error: 'Failed to record soil monitoring data' },
      { status: 500 }
    );
  }
}

function calculateSoilOverview(sensorData: any[]): any {
  const soilMetrics: Record<string, { values: number[], unit: string }> = {
    moisture: { values: [], unit: '%' },
    temperature: { values: [], unit: '°C' },
    ph: { values: [], unit: '' },
    nitrogen: { values: [], unit: 'ppm' },
    phosphorus: { values: [], unit: 'ppm' },
    potassium: { values: [], unit: 'ppm' }
  };

  sensorData.forEach(sensor => {
    if (sensor.latestReading) {
      const metric = getMetricFromSensor(sensor.sensor);
      if (metric && soilMetrics[metric]) {
        soilMetrics[metric].values.push(sensor.latestReading.value);
      }
    }
  });

  // Calculate averages and ranges
  const overview: Record<string, any> = {};
  Object.keys(soilMetrics).forEach(metric => {
    const values = soilMetrics[metric].values;
    if (values.length > 0) {
      overview[metric] = {
        average: values.reduce((a: number, b: number) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length,
        unit: soilMetrics[metric].unit,
        status: getSoilStatus(metric, values.reduce((a: number, b: number) => a + b, 0) / values.length)
      };
    }
  });

  return overview;
}

function getMetricFromSensor(sensor: any): string | null {
  const subtype = sensor.subtype?.toLowerCase();
  switch (subtype) {
    case 'moisture':
      return 'moisture';
    case 'temperature':
      return 'temperature';
    case 'ph':
      return 'ph';
    case 'nitrogen':
      return 'nitrogen';
    case 'phosphorus':
      return 'phosphorus';
    case 'potassium':
      return 'potassium';
    default:
      return null;
  }
}

function getDefaultUnit(metric: string): string {
  switch (metric) {
    case 'moisture':
      return '%';
    case 'temperature':
      return '°C';
    case 'ph':
      return '';
    case 'nitrogen':
    case 'phosphorus':
    case 'potassium':
      return 'ppm';
    default:
      return '';
  }
}

function getSoilStatus(metric: string, value: number): 'optimal' | 'warning' | 'critical' {
  switch (metric) {
    case 'moisture':
      if (value >= 20 && value <= 60) return 'optimal';
      if (value >= 10 && value <= 80) return 'warning';
      return 'critical';
    case 'ph':
      if (value >= 6.0 && value <= 7.5) return 'optimal';
      if (value >= 5.5 && value <= 8.0) return 'warning';
      return 'critical';
    case 'temperature':
      if (value >= 15 && value <= 25) return 'optimal';
      if (value >= 10 && value <= 30) return 'warning';
      return 'critical';
    case 'nitrogen':
      if (value >= 20 && value <= 50) return 'optimal';
      if (value >= 10 && value <= 80) return 'warning';
      return 'critical';
    default:
      return 'optimal';
  }
}