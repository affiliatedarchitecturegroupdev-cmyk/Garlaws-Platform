'use client';

const iotDevices = [
  { id: 'IOT-001', name: 'Soil Sensor Array A', type: 'Soil Moisture', status: 'online', battery: 92, lastPing: '2 min ago' },
  { id: 'IOT-002', name: 'Weather Station B', type: 'Weather', status: 'online', battery: 78, lastPing: '5 min ago' },
  { id: 'IOT-003', name: 'Gate Controller C', type: 'Security', status: 'online', battery: 100, lastPing: '1 min ago' },
  { id: 'IOT-004', name: 'Sprinkler Valve D', type: 'Irrigation', status: 'offline', battery: 0, lastPing: '2 hours ago' },
];

const meshStatus = {
  totalNodes: 156,
  online: 148,
  offline: 8,
  dataRate: '2.4 Mbps',
  latency: '12ms',
};

export default function EdgePage() {
  return (
    <main className="min-h-screen bg-garlaws-light text-garlaws-black">
      <header className="bg-garlaws-black py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold text-garlaws-gold mb-2">Edge Computing & IoT Mesh</h1>
          <p className="text-garlaws-slate">Distributed sensor network with local processing</p>
        </div>
      </header>

      {/* Mesh Network Status */}
      <section className="py-8 px-6 bg-garlaws-olive text-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-5 gap-6 text-center">
          <div>
            <p className="text-3xl font-bold">{meshStatus.totalNodes}</p>
            <p className="text-sm opacity-80">Total Nodes</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-green-300">{meshStatus.online}</p>
            <p className="text-sm opacity-80">Online</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-red-300">{meshStatus.offline}</p>
            <p className="text-sm opacity-80">Offline</p>
          </div>
          <div>
            <p className="text-3xl font-bold">{meshStatus.dataRate}</p>
            <p className="text-sm opacity-80">Data Rate</p>
          </div>
          <div>
            <p className="text-3xl font-bold">{meshStatus.latency}</p>
            <p className="text-sm opacity-80">Latency</p>
          </div>
        </div>
      </section>

      {/* IoT Devices */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Active IoT Devices</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {iotDevices.map((device) => (
              <div key={device.id} className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl">
                    {device.type === 'Soil Moisture' ? '🌱' : 
                     device.type === 'Weather' ? '🌤️' : 
                     device.type === 'Security' ? '🔐' : '💧'}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${device.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {device.status}
                  </span>
                </div>
                <h3 className="font-semibold">{device.name}</h3>
                <p className="text-sm text-garlaws-slate">{device.type}</p>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-garlaws-slate">Battery</span>
                    <span className="font-bold">{device.battery}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div 
                      className={`h-2 rounded-full ${device.battery > 50 ? 'bg-green-500' : device.battery > 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${device.battery}%` }}
                    />
                  </div>
                </div>
                <p className="text-xs text-garlaws-slate mt-3">Last ping: {device.lastPing}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Edge Processing */}
      <section className="py-8 px-6 bg-garlaws-navy text-white mb-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Edge Computing Capabilities</h2>
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <div className="bg-garlaws-black/50 p-6 rounded-xl">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-semibold">Local Processing</h3>
              <p className="text-sm text-garlaws-slate mt-2">Process sensor data locally without cloud</p>
            </div>
            <div className="bg-garlaws-black/50 p-6 rounded-xl">
              <div className="text-3xl mb-2">🔄</div>
              <h3 className="font-semibold">Offline Mode</h3>
              <p className="text-sm text-garlaws-slate mt-2">Continue operating during connectivity loss</p>
            </div>
            <div className="bg-garlaws-black/50 p-6 rounded-xl">
              <div className="text-3xl mb-2">📡</div>
              <h3 className="font-semibold">Mesh Network</h3>
              <p className="text-sm text-garlaws-slate mt-2">Devices communicate directly</p>
            </div>
          </div>
        </div>
      </section>

      <div className="text-center pb-8">
        <a href="/" className="text-garlaws-slate hover:text-garlaws-gold">← Back to Home</a>
      </div>
    </main>
  );
}