'use client';

const properties = [
  { id: 'DT-001', name: 'Ballito Hills Estate', type: 'Residential', models: 3, sensors: 24, lastUpdate: '2 hours ago' },
  { id: 'DT-002', name: 'Umhlanga Business Park', type: 'Commercial', models: 5, sensors: 156, lastUpdate: '30 min ago' },
];

const metrics = [
  { label: 'Energy Usage', value: '2,450 kWh', trend: '-12%', icon: '⚡' },
  { label: 'Water Consumption', value: '18,200 L', trend: '-8%', icon: '💧' },
  { label: 'Temperature', value: '23.4°C', trend: 'Normal', icon: '🌡️' },
  { label: 'Air Quality', value: 'Good', trend: 'AQI 45', icon: '🌬️' },
];

export default function DigitalTwinPage() {
  return (
    <main className="min-h-screen bg-garlaws-light text-garlaws-black">
      <header className="bg-garlaws-black py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold text-garlaws-gold mb-2">Digital Twin & 3D Mapping</h1>
          <p className="text-garlaws-slate">Real-time virtual property models with IoT integration</p>
        </div>
      </header>

      {/* 3D Viewer Placeholder */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-garlaws-navy rounded-xl p-12 text-center text-white mb-8">
            <div className="text-8xl mb-4">🏗️</div>
            <h2 className="text-2xl font-bold mb-2">Interactive 3D Viewer</h2>
            <p className="text-garlaws-slate">Loading Digital Twin Model...</p>
            <div className="mt-6 flex justify-center gap-2">
              <span className="px-3 py-1 bg-garlaws-gold/20 text-garlaws-gold rounded text-sm">Rotate</span>
              <span className="px-3 py-1 bg-garlaws-gold/20 text-garlaws-gold rounded text-sm">Zoom</span>
              <span className="px-3 py-1 bg-garlaws-gold/20 text-garlaws-gold rounded text-sm">Layers</span>
            </div>
          </div>

          {/* Property Selection */}
          <div className="grid md:grid-cols-2 gap-6">
            {properties.map((prop) => (
              <div key={prop.id} className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{prop.name}</h3>
                    <p className="text-garlaws-slate text-sm">{prop.type}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm">Active</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-garlaws-slate">3D Models</p>
                    <p className="font-bold">{prop.models}</p>
                  </div>
                  <div>
                    <p className="text-garlaws-slate">IoT Sensors</p>
                    <p className="font-bold">{prop.sensors}</p>
                  </div>
                  <div>
                    <p className="text-garlaws-slate">Last Update</p>
                    <p className="font-bold">{prop.lastUpdate}</p>
                  </div>
                  <div>
                    <p className="text-garlaws-slate">Sync Status</p>
                    <p className="font-bold text-green-600">Real-time</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Real-time Metrics */}
      <section className="py-8 px-6 bg-white mb-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Real-time Property Metrics</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {metrics.map((metric, i) => (
              <div key={i} className="bg-garlaws-light p-6 rounded-xl">
                <div className="text-3xl mb-2">{metric.icon}</div>
                <p className="text-garlaws-slate text-sm">{metric.label}</p>
                <p className="text-2xl font-bold mt-1">{metric.value}</p>
                <p className="text-xs text-garlaws-olive mt-1">{metric.trend}</p>
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