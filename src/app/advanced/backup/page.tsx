"use client";

const backups = [
  { id: "BK-001", name: "Property Database", size: "24.5 GB", status: "Completed", lastRun: "2 hours ago", location: "AWS Cape Town" },
  { id: "BK-002", name: "User Documents", size: "8.2 GB", status: "Completed", lastRun: "4 hours ago", location: "AWS Cape Town" },
  { id: "BK-003", name: "IoT Sensor Data", size: "156 GB", status: "In Progress", lastRun: "In progress", location: "Cold Archive" },
  { id: "BK-004", name: "System Config", size: "1.2 GB", status: "Completed", lastRun: "6 hours ago", location: "Local + Cloud" },
];

export default function BackupPage() {
  return (
    <div className="min-h-screen bg-[#0b0c10] text-white">
      <div className="bg-gradient-to-r from-[#1f2833] to-[#2d3b2d] py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-[#c5a059] mb-4">Data Backup & Disaster Recovery</h1>
          <p className="text-xl text-[#45a29e]">Enterprise-grade redundancy for business continuity</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-[#c5a059]">190 GB</div>
            <div className="text-[#45a29e]">Total Backup Size</div>
          </div>
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-[#c5a059]">99.9%</div>
            <div className="text-[#45a29e]">Backup Success</div>
          </div>
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-[#c5a059]">15 min</div>
            <div className="text-[#45a29e]">RPO</div>
          </div>
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-[#c5a059]">4 hrs</div>
            <div className="text-[#45a29e]">RTO</div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-[#c5a059] mb-4">Backup Jobs</h2>
        <div className="space-y-3 mb-8">
          {backups.map((backup) => (
            <div key={backup.id} className="bg-[#1f2833] p-4 rounded-lg border border-[#45a29e]/30 flex justify-between items-center">
              <div>
                <div className="font-bold text-white">{backup.name}</div>
                <div className="text-sm text-[#45a29e]">{backup.location}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-[#c5a059]">{backup.size}</div>
                <span className={`px-2 py-1 rounded text-xs ${backup.status === "Completed" ? "bg-green-900 text-green-400" : "bg-blue-900 text-blue-400"}`}>
                  {backup.status}
                </span>
                <div className="text-xs text-gray-400 mt-1">{backup.lastRun}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#2d3b2d] p-6 rounded-lg border border-[#c5a059]/30">
            <h3 className="text-xl font-bold text-[#c5a059] mb-4">Recovery Point Objective (RPO)</h3>
            <div className="text-4xl font-bold text-white mb-2">15 min</div>
            <p className="text-sm text-gray-400">Maximum data loss acceptable</p>
          </div>
          <div className="bg-[#2d3b2d] p-6 rounded-lg border border-[#c5a059]/30">
            <h3 className="text-xl font-bold text-[#c5a059] mb-4">Recovery Time Objective (RTO)</h3>
            <div className="text-4xl font-bold text-white mb-2">4 hours</div>
            <p className="text-sm text-gray-400">Maximum downtime acceptable</p>
          </div>
        </div>

        <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
          <h3 className="text-xl font-bold text-[#c5a059] mb-4">Backup Strategy</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-[#0b0c10] rounded-lg">
              <div className="text-2xl mb-2">💾</div>
              <div className="font-bold">Incremental</div>
              <div className="text-sm text-gray-400">Every 15 min</div>
            </div>
            <div className="text-center p-4 bg-[#0b0c10] rounded-lg">
              <div className="text-2xl mb-2">📅</div>
              <div className="font-bold">Daily Full</div>
              <div className="text-sm text-gray-400">Midnight</div>
            </div>
            <div className="text-center p-4 bg-[#0b0c10] rounded-lg">
              <div className="text-2xl mb-2">🏔️</div>
              <div className="font-bold">Weekly Archive</div>
              <div className="text-sm text-gray-400">Cold storage</div>
            </div>
            <div className="text-center p-4 bg-[#0b0c10] rounded-lg">
              <div className="text-2xl mb-2">🌍</div>
              <div className="font-bold">Geo-Replication</div>
              <div className="text-sm text-gray-400">Cross-region</div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button className="bg-[#c5a059] text-[#0b0c10] px-6 py-3 rounded-lg font-bold hover:bg-[#b8954f]">
            Test Restore
          </button>
          <button className="border border-[#45a29e] text-[#45a29e] px-6 py-3 rounded-lg font-bold hover:bg-[#45a29e]/10">
            Configure Schedule
          </button>
        </div>
      </div>
    </div>
  );
}