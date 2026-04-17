"use client";

const audits = [
  { id: "AUD-001", area: "Property Services", date: "2026-04-15", score: 94, status: "Passed" },
  { id: "AUD-002", area: "E-Commerce", date: "2026-04-10", score: 97, status: "Passed" },
  { id: "AUD-003", area: "Security", date: "2026-04-05", score: 88, status: "Action Required" },
  { id: "AUD-004", area: "Compliance", date: "2026-03-28", score: 100, status: "Passed" },
];

export default function QualityPage() {
  return (
    <div className="min-h-screen bg-[#0b0c10] text-white">
      <div className="bg-gradient-to-r from-[#1f2833] to-[#2d3b2d] py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-[#c5a059] mb-4">Quality Assurance</h1>
          <p className="text-xl text-[#45a29e]">Auditing framework & continuous improvement</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-green-400">95%</div>
            <div className="text-[#45a29e]">Avg Audit Score</div>
          </div>
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-[#c5a059]">24</div>
            <div className="text-[#45a29e]">Audits This Year</div>
          </div>
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-green-400">0</div>
            <div className="text-[#45a29e]">Critical Issues</div>
          </div>
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-[#c5a059]">ISO 9001</div>
            <div className="text-[#45a29e]">Certified</div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-[#c5a059] mb-4">Recent Audits</h2>
        <div className="space-y-3 mb-8">
          {audits.map((audit) => (
            <div key={audit.id} className="bg-[#1f2833] p-4 rounded-lg border border-[#45a29e]/30 flex justify-between items-center">
              <div>
                <div className="font-bold text-white">{audit.area}</div>
                <div className="text-sm text-gray-400">{audit.date}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[#c5a059]">{audit.score}%</div>
                <span className={`px-2 py-1 rounded text-xs ${audit.status === "Passed" ? "bg-green-900 text-green-400" : "bg-yellow-900 text-yellow-400"}`}>
                  {audit.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#2d3b2d] p-6 rounded-lg border border-[#c5a059]/30">
          <h3 className="text-xl font-bold text-[#c5a059] mb-4">Compliance Standards</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-[#1f2833] rounded-lg">
              <div className="text-2xl font-bold text-green-400">✓</div>
              <div className="font-bold">ISO 9001</div>
              <div className="text-sm text-gray-400">Quality Management</div>
            </div>
            <div className="text-center p-4 bg-[#1f2833] rounded-lg">
              <div className="text-2xl font-bold text-green-400">✓</div>
              <div className="font-bold">ISO 27001</div>
              <div className="text-sm text-gray-400">Information Security</div>
            </div>
            <div className="text-center p-4 bg-[#1f2833] rounded-lg">
              <div className="text-2xl font-bold text-green-400">✓</div>
              <div className="font-bold">ISO 14001</div>
              <div className="text-sm text-gray-400">Environmental</div>
            </div>
            <div className="text-center p-4 bg-[#1f2833] rounded-lg">
              <div className="text-2xl font-bold text-green-400">✓</div>
              <div className="font-bold">POPIA</div>
              <div className="text-sm text-gray-400">Data Privacy</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}