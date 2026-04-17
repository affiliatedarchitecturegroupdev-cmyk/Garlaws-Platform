export interface EquipmentMetric {
  id: string;
  name: string;
  type: 'lawnmower' | 'irrigation' | 'pruner' | 'sensor';
  status: 'healthy' | 'warning' | 'critical';
  lastReading: number;
  predictedFailure: string | null;
  confidence: number;
  nextMaintenance: string;
}

export const equipmentMetrics: EquipmentMetric[] = [
  { id: 'EQ-001', name: 'Electric Lawnmower Alpha', type: 'lawnmower', status: 'healthy', lastReading: 98, predictedFailure: null, confidence: 95, nextMaintenance: '2026-05-15' },
  { id: 'EQ-002', name: 'Irrigation System Zone A', type: 'irrigation', status: 'warning', lastReading: 72, predictedFailure: '2026-04-25', confidence: 82, nextMaintenance: '2026-04-20' },
  { id: 'EQ-003', name: 'Pruning Shears Beta', type: 'pruner', status: 'healthy', lastReading: 94, predictedFailure: null, confidence: 91, nextMaintenance: '2026-05-01' },
  { id: 'EQ-004', name: 'Soil Moisture Sensor #5', type: 'sensor', status: 'critical', lastReading: 45, predictedFailure: '2026-04-18', confidence: 88, nextMaintenance: 'Immediate' },
];

export const predictions = [
  { equipment: 'Irrigation Pump', issue: 'Motor bearing wear', probability: '78%', timeframe: '14 days' },
  { equipment: 'Lawnmower Blades', issue: ' dull blades', probability: '65%', timeframe: '30 days' },
];