"use client";

const initiatives = [
  { name: "Solar Installation", impact: "-45 tons CO2", status: "Active", participants: 124 },
  { name: "Native Plant Restoration", impact: "+2.5 hectares", status: "Active", participants: 45 },
  { name: "Water Recycling", impact: "-180K Liters", status: "Planning", participants: 0 },
  { name: "EV Fleet Transition", impact: "-28 tons CO2", status: "In Progress", participants: 12 },
];

export default function EnvironmentalPage() {
  return (
    <div className="min-h-screen bg-[#0b0c10] text-white">
      <div className="bg-gradient-to-r from-[#1f2833] to-[#2d3b2d] py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-[#c5a059] mb-4">Environmental Impact</h1>
          <p className="text-xl text-[#45a29e]">Biodiversity strategy & sustainability tracking</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-green-400">-73</div>
            <div className="text-[#45a29e]">Tons CO2 This Year</div>
          </div>
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-[#c5a059]">2.5ha</div>
            <div className="text-[#45a29e]">Land Restored</div>
          </div>
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-[#c5a059]">180K</div>
            <div className="text-[#45a29e]">Water Saved (L)</div>
          </div>
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-green-400">42%</div>
            <div className="text-[#45a29e]">Renewable Energy</div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-[#c5a059] mb-4">Active Initiatives</h2>
        <div className="space-y-4 mb-8">
          {initiatives.map((init, i) => (
            <div key={i} className="bg-[#1f2833] p-4 rounded-lg border border-[#45a29e]/30 flex justify-between items-center">
              <div>
                <div className="font-bold text-white">{init.name}</div>
                <div className="text-sm text-green-400">{init.impact}</div>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded text-xs ${init.status === "Active" ? "bg-green-900 text-green-400" : init.status === "In Progress" ? "bg-yellow-900 text-yellow-400" : "bg-blue-900 text-blue-400"}`}>
                  {init.status}
                </span>
                <div className="text-sm text-gray-400 mt-1">{init.participants} participants</div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#2d3b2d] p-6 rounded-lg border border-[#c5a059]/30">
          <h3 className="text-xl font-bold text-[#c5a059] mb-4">Biodiversity Score</h3>
          <div className="grid md:grid-cols-5 gap-4 text-center">
            <div className="bg-[#1f2833] p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-400">A</div>
              <div className="text-sm text-gray-400">Habitat</div>
            </div>
            <div className="bg-[#1f2833] p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-400">A-</div>
              <div className="text-sm text-gray-400">Species</div>
            </div>
            <div className="bg-[#1f2833] p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-400">B+</div>
              <div className="text-sm text-gray-400">Water</div>
            </div>
            <div className="bg-[#1f2833] p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-400">A</div>
              <div className="text-sm text-gray-400">Carbon</div>
            </div>
            <div className="bg-[#1f2833] p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-400">A</div>
              <div className="text-sm text-gray-400">Energy</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}