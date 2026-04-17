"use client";

const sensors = [
  { id: "SN-001", location: "Garden Bed A", type: "Soil Moisture", status: "Active", reading: "42%", battery: 78 },
  { id: "SN-002", location: "Pool Area", type: "pH Level", status: "Active", reading: "7.2", battery: 92 },
  { id: "SN-003", location: "Main Entrance", type: "Motion/Security", status: "Active", reading: "Clear", battery: 95 },
  { id: "SN-004", location: "Roof Solar", type: "Temperature", status: "Warning", reading: "58°C", battery: 12 },
  { id: "SN-005", location: "Garage", type: "Air Quality", status: "Active", reading: "Good", battery: 88 },
];

export default function SensorsPage() {
  return (
    <div className="min-h-screen bg-[#0b0c10] text-white">
      <div className="bg-gradient-to-r from-[#1f2833] to-[#2d3b2d] py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-[#c5a059] mb-4">IoT Soil & Safety Monitoring</h1>
          <p className="text-xl text-[#45a29e]">Real-time sensor deployment for property health & security</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-[#c5a059]">18</div>
            <div className="text-[#45a29e]">Total Sensors</div>
          </div>
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-[#c5a059]">17</div>
            <div className="text-[#45a29e]">Online</div>
          </div>
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-[#c5a059]">1</div>
            <div className="text-[#45a29e]">Warning</div>
          </div>
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-[#c5a059]">94%</div>
            <div className="text-[#45a29e]">Battery OK</div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-[#c5a059] mb-4">Active Sensors</h2>
        <div className="space-y-3 mb-8">
          {sensors.map((sensor) => (
            <div key={sensor.id} className="bg-[#1f2833] p-4 rounded-lg border border-[#45a29e]/30 flex justify-between items-center">
              <div>
                <div className="font-bold text-white">{sensor.location}</div>
                <div className="text-sm text-[#45a29e]">{sensor.type}</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-[#c5a059]">{sensor.reading}</div>
                <span className={`px-2 py-1 rounded text-xs ${sensor.status === "Active" ? "bg-green-900 text-green-400" : "bg-yellow-900 text-yellow-400"}`}>
                  {sensor.status}
                </span>
                <div className="text-xs text-gray-400 mt-1">🔋 {sensor.battery}%</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#2d3b2d] p-6 rounded-lg border border-[#c5a059]/30">
            <h3 className="text-xl font-bold text-[#c5a059] mb-4">Soil Health</h3>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-gray-400">Moisture Avg</span><span className="text-green-400">45%</span></div>
              <div className="flex justify-between"><span className="text-gray-400">pH Level</span><span className="text-green-400">6.8</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Nutrients</span><span className="text-yellow-400">Moderate</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Temperature</span><span className="text-green-400">24°C</span></div>
            </div>
          </div>
          <div className="bg-[#2d3b2d] p-6 rounded-lg border border-[#c5a059]/30">
            <h3 className="text-xl font-bold text-[#c5a059] mb-4">Security Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-gray-400">Perimeter</span><span className="text-green-400">Secure</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Motion Sensors</span><span className="text-green-400">Active</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Entry Points</span><span className="text-green-400">Monitored</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Fire Detection</span><span className="text-green-400">Ready</span></div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button className="bg-[#c5a059] text-[#0b0c10] px-6 py-3 rounded-lg font-bold hover:bg-[#b8954f]">
            Add Sensor
          </button>
          <button className="border border-[#45a29e] text-[#45a29e] px-6 py-3 rounded-lg font-bold hover:bg-[#45a29e]/10">
            View Alerts
          </button>
        </div>
      </div>
    </div>
  );
}