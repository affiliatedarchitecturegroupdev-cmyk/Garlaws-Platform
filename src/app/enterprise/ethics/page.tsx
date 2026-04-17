"use client";

const principles = [
  { id: 1, title: "Transparency", desc: "Open AI decision-making processes", status: "Compliant" },
  { id: 2, title: "Fairness", desc: "Bias detection & mitigation", status: "Compliant" },
  { id: 3, title: "Privacy", desc: "Data minimization & consent", status: "Compliant" },
  { id: 4, title: "Accountability", desc: "Human oversight & audit trails", status: "In Review" },
];

export default function EthicsPage() {
  return (
    <div className="min-h-screen bg-[#0b0c10] text-white">
      <div className="bg-gradient-to-r from-[#1f2833] to-[#2d3b2d] py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-[#c5a059] mb-4">Data Ethics & AI Governance</h1>
          <p className="text-xl text-[#45a29e]">Responsible AI framework & compliance</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-green-400">4/4</div>
            <div className="text-[#45a29e]">Principles Active</div>
          </div>
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-[#c5a059]">12</div>
            <div className="text-[#45a29e]">AI Models Deployed</div>
          </div>
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-green-400">100%</div>
            <div className="text-[#45a29e]">Human Oversight</div>
          </div>
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-[#c5a059]">Q2 2026</div>
            <div className="text-[#45a29e]">Next Audit</div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-[#c5a059] mb-4">Ethics Principles</h2>
        <div className="space-y-4 mb-8">
          {principles.map((p) => (
            <div key={p.id} className="bg-[#1f2833] p-4 rounded-lg border border-[#45a29e]/30">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold text-white">{p.title}</div>
                  <div className="text-sm text-gray-400">{p.desc}</div>
                </div>
                <span className={`px-3 py-1 rounded text-sm ${p.status === "Compliant" ? "bg-green-900 text-green-400" : "bg-yellow-900 text-yellow-400"}`}>
                  {p.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#2d3b2d] p-6 rounded-lg border border-[#c5a059]/30">
            <h3 className="text-xl font-bold text-[#c5a059] mb-4">AI Impact Assessments</h3>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-gray-400">Predictive Maintenance</span><span className="text-green-400">✓ Approved</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Sentiment Analysis</span><span className="text-green-400">✓ Approved</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Drone Inspection</span><span className="text-green-400">✓ Approved</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Tokenization</span><span className="text-yellow-400">○ Reviewing</span></div>
            </div>
          </div>
          <div className="bg-[#2d3b2d] p-6 rounded-lg border border-[#c5a059]/30">
            <h3 className="text-xl font-bold text-[#c5a059] mb-4">Compliance Framework</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2"><span className="text-green-400">✓</span> POPIA AI Supplement</div>
              <div className="flex items-center gap-2"><span className="text-green-400">✓</span> EU AI Act Alignment</div>
              <div className="flex items-center gap-2"><span className="text-green-400">✓</span> ISO/IEC 24028 (AI Trust)</div>
              <div className="flex items-center gap-2"><span className="text-green-400">✓</span> NIST AI RMF</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}