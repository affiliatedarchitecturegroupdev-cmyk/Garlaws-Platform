"use client";

const devices = [
  { id: "DEV-001", name: "Garden Sensor Array", type: "Multi-sensor", status: "Online", battery: 87, signal: "Mesh" },
  { id: "DEV-002", name: "Security Gateway", type: "Hub", status: "Online", battery: 100, signal: "WiFi" },
  { id: "DEV-003", name: "Pool Monitor", type: "Water Quality", status: "Online", battery: 62, signal: "Mesh" },
  { id: "DEV-004", name: "Gate Controller", type: "Access", status: "Online", battery: 95, signal: "Zigbee" },
  { id: "DEV-005", name: "Weather Station", type: "Environmental", status: "Offline", battery: 12, signal: "LoRa" },
];

export default function EdgePage() {
  return (
    <div className="min-h-screen bg-[#0b0c10] text-white">
      <div className="bg-gradient-to-r from-[#1f2833] to-[#2d3b2d] py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-[#c5a059] mb-4">Edge Computing</h1>
          <p className="text-xl text-[#45a29e]">IoT mesh networking for low-latency property automation</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-[#c5a059]">24</div>
            <div className="text-[#45a29e]">Active Nodes</div>
          </div>
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-[#c5a059]">12ms</div>
            <div className="text-[#45a29e]">Avg Latency</div>
          </div>
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-[#c5a059]">99.7%</div>
            <div className="text-[#45a29e]">Uptime</div>
          </div>
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-[#c5a059]">4</div>
            <div className="text-[#45a29e]">Protocols</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold text-[#c5a059] mb-4">Network Topology</h2>
            <div className="bg-[#1f2833] rounded-lg border border-[#45a29e]/30 p-6">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="text-6xl mb-4">🌐</div>
                  <p className="text-[#45a29e]">Mesh Network Visualizer</p>
                  <p className="text-sm text-gray-500 mt-2">5 devices, 1 gateway, full mesh</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#c5a059] mb-4">Connected Devices</h2>
            <div className="space-y-3">
              {devices.map((device) => (
                <div key={device.id} className="bg-[#1f2833] p-4 rounded-lg border border-[#45a29e]/30 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white">{device.name}</div>
                    <div className="text-sm text-[#45a29e]">{device.type} • {device.signal}</div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-xs ${device.status === "Online" ? "bg-green-900 text-green-400" : "bg-red-900 text-red-400"}`}>
                      {device.status}
                    </span>
                    <div className="text-xs text-gray-400 mt-1">🔋 {device.battery}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 bg-[#2d3b2d] p-6 rounded-lg border border-[#c5a29e]/30">
          <h3 className="text-xl font-bold text-[#c5a059] mb-4">Supported Protocols</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-[#1f2833] p-4 rounded-lg text-center">
              <div className="text-2xl mb-2">📡</div>
              <div className="font-bold">Zigbee 3.0</div>
              <div className="text-sm text-gray-400">Low power</div>
            </div>
            <div className="bg-[#1f2833] p-4 rounded-lg text-center">
              <div className="text-2xl mb-2">📶</div>
              <div className="font-bold">WiFi 6E</div>
              <div className="text-sm text-gray-400">High bandwidth</div>
            </div>
            <div className="bg-[#1f2833] p-4 rounded-lg text-center">
              <div className="text-2xl mb-2">🔵</div>
              <div className="font-bold">Bluetooth 5.2</div>
              <div className="text-sm text-gray-400">Short range</div>
            </div>
            <div className="bg-[#1f2833] p-4 rounded-lg text-center">
              <div className="text-2xl mb-2">📭</div>
              <div className="font-bold">LoRaWAN</div>
              <div className="text-sm text-gray-400">Long range</div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button className="bg-[#c5a059] text-[#0b0c10] px-6 py-3 rounded-lg font-bold hover:bg-[#b8954f]">
            Add Device
          </button>
          <button className="border border-[#45a29e] text-[#45a29e] px-6 py-3 rounded-lg font-bold hover:bg-[#45a29e]/10">
            Configure Network
          </button>
        </div>
      </div>
    </div>
  );
}