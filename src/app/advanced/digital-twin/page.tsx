"use client";

import { useState } from "react";

const properties = [
  { id: 1, name: "Sunset Villa", address: "45 Ocean Drive, Cape Town", sqft: 4500, floors: 3, lastUpdate: "2 mins ago" },
  { id: 2, name: "Harbour Complex", address: "12 Marina Walk, Durban", sqft: 12000, floors: 5, lastUpdate: "5 mins ago" },
  { id: 3, name: "Business Hub", address: "88 Sandton Central", sqft: 25000, floors: 12, lastUpdate: "1 min ago" },
];

export default function DigitalTwinPage() {
  const [selectedProp, setSelectedProp] = useState<number | null>(1);

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white">
      <div className="bg-gradient-to-r from-[#1f2833] to-[#2d3b2d] py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-[#c5a059] mb-4">Digital Twin Platform</h1>
          <p className="text-xl text-[#45a29e]">3D property visualization with real-time sensor integration</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1f2833] p-4 rounded-lg border border-[#45a29e]/30">
            <div className="text-2xl font-bold text-[#c5a059]">3</div>
            <div className="text-sm text-[#45a29e]">Active Twins</div>
          </div>
          <div className="bg-[#1f2833] p-4 rounded-lg border border-[#45a29e]/30">
            <div className="text-2xl font-bold text-[#c5a059]">12.4K</div>
            <div className="text-sm text-[#45a29e]">3D Points</div>
          </div>
          <div className="bg-[#1f2833] p-4 rounded-lg border border-[#45a29e]/30">
            <div className="text-2xl font-bold text-[#c5a059]">24/7</div>
            <div className="text-sm text-[#45a29e]">Live Sync</div>
          </div>
          <div className="bg-[#1f2833] p-4 rounded-lg border border-[#45a29e]/30">
            <div className="text-2xl font-bold text-[#c5a059]">98.2%</div>
            <div className="text-sm text-[#45a29e]">Accuracy</div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-[#1f2833] rounded-lg border border-[#45a29e]/30 overflow-hidden">
            <div className="bg-[#2d3b2d] p-4 border-b border-[#45a29e]/30">
              <h3 className="font-bold text-[#c5a059]">3D View - Interactive</h3>
            </div>
            <div className="h-96 flex items-center justify-center bg-gradient-to-br from-[#0b0c10] to-[#1f2833]">
              <div className="text-center">
                <div className="text-6xl mb-4">🏢</div>
                <p className="text-[#45a29e]">Digital Twin Renderer</p>
                <p className="text-sm text-gray-500 mt-2">Click property to explore</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-[#c5a059]">Properties</h3>
            {properties.map((prop) => (
              <div
                key={prop.id}
                onClick={() => setSelectedProp(prop.id)}
                className={`p-4 rounded-lg cursor-pointer transition-all ${
                  selectedProp === prop.id ? "bg-[#2d3b2d] border border-[#c5a059]" : "bg-[#1f2833] border border-[#45a29e]/30"
                }`}
              >
                <div className="font-bold text-white">{prop.name}</div>
                <div className="text-sm text-[#45a29e]">{prop.address}</div>
                <div className="flex gap-4 mt-2 text-xs text-gray-400">
                  <span>{prop.sqft.toLocaleString()} sqft</span>
                  <span>{prop.floors} floors</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="bg-[#1f2833] p-4 rounded-lg border border-[#45a29e]/30">
            <h4 className="font-bold text-[#c5a059] mb-2">Real-time Metrics</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Temperature</span><span className="text-green-400">22.4°C</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Humidity</span><span className="text-green-400">45%</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Energy</span><span className="text-green-400">12.4 kWh</span></div>
            </div>
          </div>
          <div className="bg-[#1f2833] p-4 rounded-lg border border-[#45a29e]/30">
            <h4 className="font-bold text-[#c5a059] mb-2">Maintenance Alerts</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">HVAC</span><span className="text-yellow-400">Service due</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Elevator</span><span className="text-green-400">OK</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Fire Sys</span><span className="text-green-400">OK</span></div>
            </div>
          </div>
          <div className="bg-[#1f2833] p-4 rounded-lg border border-[#45a29e]/30">
            <h4 className="font-bold text-[#c5a059] mb-2">Simulation</h4>
            <div className="space-y-2 text-sm">
              <div className="text-gray-400">Energy Load: 78%</div>
              <div className="text-gray-400">Occupancy: 62%</div>
              <div className="text-gray-400">Solar: +4.2 kW</div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button className="bg-[#c5a059] text-[#0b0c10] px-6 py-3 rounded-lg font-bold hover:bg-[#b8954f]">
            Create New Twin
          </button>
          <button className="border border-[#45a29e] text-[#45a29e] px-6 py-3 rounded-lg font-bold hover:bg-[#45a29e]/10">
            Export Model
          </button>
        </div>
      </div>
    </div>
  );
}