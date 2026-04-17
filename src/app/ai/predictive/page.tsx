'use client';

const equipmentMetrics = [
  { id: 'EQ-001', name: 'Electric Lawnmower Alpha', type: 'lawnmower', status: 'healthy' as const, lastReading: 98, nextMaintenance: '2026-05-15' },
  { id: 'EQ-002', name: 'Irrigation System Zone A', type: 'irrigation' as const, status: 'warning' as const, lastReading: 72, nextMaintenance: '2026-04-20' },
  { id: 'EQ-003', name: 'Pruning Shears Beta', type: 'pruner' as const, status: 'healthy' as const, lastReading: 94, nextMaintenance: '2026-05-01' },
  { id: 'EQ-004', name: 'Soil Moisture Sensor #5', type: 'sensor' as const, status: 'critical' as const, lastReading: 45, nextMaintenance: 'Immediate' },
];

const predictions = [
  { equipment: 'Irrigation Pump', issue: 'Motor bearing wear', probability: '78%', timeframe: '14 days' },
  { equipment: 'Lawnmower Blades', issue: 'dull blades', probability: '65%', timeframe: '30 days' },
];

export default function PredictivePage() {
  return (
    <main className="min-h-screen bg-garlaws-light text-garlaws-black">
      <header className="bg-garlaws-black py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold text-garlaws-gold mb-2">AI Predictive Maintenance</h1>
          <p className="text-garlaws-slate">Machine learning-powered equipment health monitoring</p>
        </div>
      </header>

      {/* AI Status Banner */}
      <section className="py-6 px-6 bg-garlaws-olive text-white">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🤖</span>
            <div>
              <p className="font-bold">AI Engine Status</p>
              <p className="text-sm opacity-80">Processing real-time data</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">98.5%</p>
            <p className="text-sm opacity-80">Prediction Accuracy</p>
          </div>
        </div>
      </section>

      {/* Equipment Grid */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Equipment Health</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {equipmentMetrics.map((eq) => (
              <div key={eq.id} className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl">
                    {eq.type === 'lawnmower' ? '🚜' : eq.type === 'irrigation' ? '💧' : eq.type === 'pruner' ? '✂️' : '📡'}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    eq.status === 'healthy' ? 'bg-green-100 text-green-800' :
                    eq.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {eq.status}
                  </span>
                </div>
                <h3 className="font-semibold">{eq.name}</h3>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-garlaws-slate">Health Score</span>
                    <span className="font-bold">{eq.lastReading}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div 
                      className={`h-2 rounded-full ${eq.lastReading > 80 ? 'bg-green-500' : eq.lastReading > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${eq.lastReading}%` }}
                    />
                  </div>
                </div>
                <p className="text-xs text-garlaws-slate mt-3">Next service: {eq.nextMaintenance}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Predictions */}
      <section className="py-8 px-6 bg-white mb-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">🔮 AI Predictions</h2>
          <div className="space-y-4">
            {predictions.map((pred, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-garlaws-light rounded-lg">
                <div>
                  <p className="font-semibold">{pred.equipment}</p>
                  <p className="text-garlaws-slate text-sm">Predicted issue: {pred.issue}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-garlaws-olive">{pred.probability}</p>
                  <p className="text-xs text-garlaws-slate">{pred.timeframe}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="text-center pb-8">
        <a href="/" className="text-garlaws-slate hover:text-garlaws-gold">← Back to Home</a>
      </div>
    </main>
  );
}