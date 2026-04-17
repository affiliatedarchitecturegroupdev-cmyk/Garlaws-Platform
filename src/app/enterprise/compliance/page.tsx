"use client";

const metrics = [
  { category: "Ownership", score: 25, target: 25, status: "Target Met" },
  { category: "Management Control", score: 18, target: 19, status: "In Progress" },
  { category: "Skills Development", score: 15, target: 20, status: "In Progress" },
  { category: "Preferential Procurement", score: 22, target: 25, status: "Near Target" },
  { category: "Enterprise Development", score: 12, target: 15, status: "In Progress" },
  { category: "Socio-Economic", score: 8, target: 10, status: "In Progress" },
];

export default function CompliancePage() {
  const totalScore = metrics.reduce((sum, m) => sum + m.score, 0);
  const totalTarget = metrics.reduce((sum, m) => sum + m.target, 0);
  const level = totalScore >= 100 ? "1" : totalScore >= 80 ? "2" : totalScore >= 60 ? "3" : "4";

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white">
      <div className="bg-gradient-to-r from-[#1f2833] to-[#2d3b2d] py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-[#c5a059] mb-4">B-BBEE Compliance Vault</h1>
          <p className="text-xl text-[#45a29e]">Broad-Based Black Economic Empowerment tracking & ESG</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30 text-center">
            <div className="text-4xl font-bold text-[#c5a059]">{totalScore}</div>
            <div className="text-[#45a29e]">Current Score</div>
          </div>
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30 text-center">
            <div className="text-4xl font-bold text-[#c5a059]">Level {level}</div>
            <div className="text-[#45a29e]">B-BBEE Level</div>
          </div>
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30 text-center">
            <div className="text-4xl font-bold text-[#c5a059]">{totalTarget}</div>
            <div className="text-[#45a29e]">Target Score</div>
          </div>
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30 text-center">
            <div className="text-4xl font-bold text-green-400">100%</div>
            <div className="text-[#45a29e]">POPIA Compliant</div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-[#c5a059] mb-4">B-BBEE Scorecard</h2>
        <div className="space-y-4 mb-8">
          {metrics.map((m, i) => (
            <div key={i} className="bg-[#1f2833] p-4 rounded-lg border border-[#45a29e]/30">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-white">{m.category}</span>
                <span className={`px-3 py-1 rounded text-sm ${m.status === "Target Met" ? "bg-green-900 text-green-400" : "bg-yellow-900 text-yellow-400"}`}>
                  {m.status}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-[#0b0c10] rounded-full h-3">
                  <div className="bg-[#c5a059] h-3 rounded-full" style={{ width: `${(m.score / m.target) * 100}%` }}></div>
                </div>
                <span className="text-[#c5a059] font-bold">{m.score}/{m.target}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#2d3b2d] p-6 rounded-lg border border-[#c5a059]/30">
            <h3 className="text-xl font-bold text-[#c5a059] mb-4">ESG Dashboard</h3>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-gray-400">Carbon Footprint</span><span className="text-green-400">-12% YoY</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Diversity Score</span><span className="text-green-400">78%</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Community Investment</span><span className="text-green-400">R2.4M</span></div>
            </div>
          </div>
          <div className="bg-[#2d3b2d] p-6 rounded-lg border border-[#c5a059]/30">
            <h3 className="text-xl font-bold text-[#c5a059] mb-4">Certifications</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2"><span className="text-green-400">✓</span> POPIA Registered</div>
              <div className="flex items-center gap-2"><span className="text-green-400">✓</span> SARS Tax Compliant</div>
              <div className="flex items-center gap-2"><span className="text-green-400">✓</span> NHBRC Enrolled</div>
              <div className="flex items-center gap-2"><span className="text-yellow-400">○</span> CIDB Grade 2 (In Progress)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}