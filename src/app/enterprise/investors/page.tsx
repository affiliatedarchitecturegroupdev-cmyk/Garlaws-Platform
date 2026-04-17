"use client";

const metrics = [
  { label: "Revenue Growth", value: "+34%", target: "25%" },
  { label: "EBITDA Margin", value: "18%", target: "15%" },
  { label: "Customer Retention", value: "94%", target: "85%" },
  { label: "B-BBEE Level", value: "Level 2", target: "Level 1" },
];

export default function InvestorsPage() {
  return (
    <div className="min-h-screen bg-[#0b0c10] text-white">
      <div className="bg-gradient-to-r from-[#1f2833] to-[#2d3b2d] py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-[#c5a059] mb-4">Investor Relations</h1>
          <p className="text-xl text-[#45a29e]">Dashboard for stakeholders & ESG reporting</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-[#c5a059]">R28.8M</div>
            <div className="text-[#45a29e]">Annual Revenue</div>
          </div>
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-green-400">+34%</div>
            <div className="text-[#45a29e]">YoY Growth</div>
          </div>
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-[#c5a059]">847</div>
            <div className="text-[#45a29e]">Active Clients</div>
          </div>
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-green-400">R52M</div>
            <div className="text-[#45a29e]">Pipeline Value</div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-[#c5a059] mb-4">Key Performance Indicators</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {metrics.map((m, i) => (
            <div key={i} className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
              <div className="text-sm text-gray-400 mb-2">{m.label}</div>
              <div className="flex justify-between items-center">
                <span className="text-3xl font-bold text-[#c5a059]">{m.value}</span>
                <span className="text-sm text-gray-400">Target: {m.target}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#2d3b2d] p-6 rounded-lg border border-[#c5a059]/30">
          <h3 className="text-xl font-bold text-[#c5a059] mb-4">ESG Scorecard</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">A</div>
              <div className="text-sm text-gray-400">Environmental</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">A</div>
              <div className="text-sm text-gray-400">Social</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">B+</div>
              <div className="text-sm text-gray-400">Governance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">78/100</div>
              <div className="text-sm text-gray-400">Total ESG</div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <h4 className="font-bold text-[#c5a059] mb-3">Recent Announcements</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Q1 2026 Financial Results - April 15</li>
              <li>• New B-BBEE Certification - March 22</li>
              <li>• Phase 5 Launch - March 10</li>
            </ul>
          </div>
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <h4 className="font-bold text-[#c5a059] mb-3">Download Reports</h4>
            <div className="flex gap-3">
              <button className="bg-[#45a29e] text-white px-4 py-2 rounded text-sm">Annual Report</button>
              <button className="border border-[#45a29e] text-[#45a29e] px-4 py-2 rounded text-sm">ESG Report</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}