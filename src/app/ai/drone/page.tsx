'use client';

const inspections = [
  { id: 'INS-001', location: 'Ballito Hills Estate', date: '2026-04-17', status: 'Analyzed', issues: 3, drone: 'DJI Mavic 3' },
  { id: 'INS-002', location: 'Tinley Manor Complex', date: '2026-04-16', status: 'Processing', issues: 0, drone: 'DJI Phantom 4' },
  { id: 'INS-003', location: 'Umhlanga Business Park', date: '2026-04-15', status: 'Complete', issues: 7, drone: 'DJI Mavic 3' },
];

const detectedIssues = [
  { type: 'Crack', location: 'Building A - North Wall', severity: 'high', image: '📷' },
  { type: 'Water Damage', location: 'Roof Section B', severity: 'medium', image: '💧' },
  { type: ' Vegetation Overgrowth', location: 'Parking Lot C', severity: 'low', image: '🌿' },
];

export default function DronePage() {
  return (
    <main className="min-h-screen bg-garlaws-light text-garlaws-black">
      <header className="bg-garlaws-black py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold text-garlaws-gold mb-2">Computer Vision Drone Inspection</h1>
          <p className="text-garlaws-slate">AI-powered aerial site analysis and defect detection</p>
        </div>
      </header>

      {/* Drone Fleet */}
      <section className="py-8 px-6 bg-garlaws-olive text-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-bold mb-4">🚁 Active Drone Fleet</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { name: 'DJI Mavic 3', status: 'Ready', missions: 45 },
              { name: 'DJI Phantom 4', status: 'In Flight', missions: 32 },
              { name: 'DJI Mini 3', status: 'Charging', missions: 18 },
            ].map((drone, i) => (
              <div key={i} className="bg-garlaws-black/50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="font-semibold">{drone.name}</span>
                  <span className={`text-sm ${drone.status === 'Ready' ? 'text-green-400' : drone.status === 'In Flight' ? 'text-yellow-400' : 'text-gray-400'}`}>
                    {drone.status}
                  </span>
                </div>
                <p className="text-sm text-garlaws-slate mt-1">{drone.missions} missions completed</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Inspections */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Recent Inspections</h2>
          <div className="space-y-4 mb-8">
            {inspections.map((ins) => (
              <div key={ins.id} className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between">
                <div>
                  <p className="font-semibold text-lg">{ins.location}</p>
                  <p className="text-garlaws-slate text-sm">{ins.id} • {ins.date} • {ins.drone}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded text-sm ${
                    ins.status === 'Complete' ? 'bg-green-100 text-green-800' :
                    ins.status === 'Analyzed' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {ins.status}
                  </span>
                  <p className="text-sm text-garlaws-slate mt-1">{ins.issues} issues found</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detected Issues */}
      <section className="py-8 px-6 bg-white mb-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">🔍 AI-Detected Issues</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {detectedIssues.map((issue, i) => (
              <div key={i} className="border border-garlaws-slate/20 rounded-xl p-4">
                <div className="text-3xl mb-2">{issue.image}</div>
                <h3 className="font-semibold">{issue.type}</h3>
                <p className="text-sm text-garlaws-slate mt-1">{issue.location}</p>
                <span className={`inline-block mt-2 px-2 py-1 rounded text-xs ${
                  issue.severity === 'high' ? 'bg-red-100 text-red-800' :
                  issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {issue.severity} severity
                </span>
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