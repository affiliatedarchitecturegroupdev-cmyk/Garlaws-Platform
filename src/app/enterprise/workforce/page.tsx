"use client";

const staff = [
  { id: "EMP-001", name: "S. Mkhize", role: "Field Technician", status: "Active", zone: "Durban Central", tasks: 12 },
  { id: "EMP-002", name: "J. van der Merwe", role: "Team Lead", status: "Active", zone: "Cape Town", tasks: 8 },
  { id: "EMP-003", name: "A. Nkosi", role: "Landscaper", status: "On Leave", zone: "Johannesburg", tasks: 0 },
  { id: "EMP-004", name: "P. Patel", role: "Electrician", status: "Active", zone: "Pretoria", tasks: 15 },
];

export default function WorkforcePage() {
  return (
    <div className="min-h-screen bg-[#0b0c10] text-white">
      <div className="bg-gradient-to-r from-[#1f2833] to-[#2d3b2d] py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-[#c5a059] mb-4">Workforce Management</h1>
          <p className="text-xl text-[#45a29e]">Labour compliance, scheduling & resource allocation</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-[#c5a059]">48</div>
            <div className="text-[#45a29e]">Total Employees</div>
          </div>
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-[#c5a059]">42</div>
            <div className="text-[#45a29e]">Active Staff</div>
          </div>
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-[#c5a059]">6</div>
            <div className="text-[#45a29e]">On Leave</div>
          </div>
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-green-400">100%</div>
            <div className="text-[#45a29e]">UIF Compliant</div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-[#c5a059] mb-4">Staff Directory</h2>
        <div className="space-y-3 mb-8">
          {staff.map((emp) => (
            <div key={emp.id} className="bg-[#1f2833] p-4 rounded-lg border border-[#45a29e]/30 flex justify-between items-center">
              <div>
                <div className="font-bold text-white">{emp.name}</div>
                <div className="text-sm text-[#45a29e]">{emp.role} • {emp.zone}</div>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded text-xs ${emp.status === "Active" ? "bg-green-900 text-green-400" : "bg-blue-900 text-blue-400"}`}>
                  {emp.status}
                </span>
                <div className="text-sm text-gray-400 mt-1">{emp.tasks} tasks assigned</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#2d3b2d] p-6 rounded-lg border border-[#c5a059]/30">
            <h3 className="text-xl font-bold text-[#c5a059] mb-4">Compliance Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-gray-400">UIF Registration</span><span className="text-green-400">✓ Compliant</span></div>
              <div className="flex justify-between"><span className="text-gray-400">COIDA</span><span className="text-green-400">✓ Active</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Skills Development</span><span className="text-yellow-400">○ In Progress</span></div>
              <div className="flex justify-between"><span className="text-gray-400">EE Report</span><span className="text-green-400">✓ Submitted</span></div>
            </div>
          </div>
          <div className="bg-[#2d3b2d] p-6 rounded-lg border border-[#c5a059]/30">
            <h3 className="text-xl font-bold text-[#c5a059] mb-4">Schedule Overview</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-400"><span>Today Shifts</span><span className="text-white">24</span></div>
              <div className="flex justify-between text-gray-400"><span>This Week</span><span className="text-white">156 hrs</span></div>
              <div className="flex justify-between text-gray-400"><span>Overtime</span><span className="text-yellow-400">12 hrs</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}