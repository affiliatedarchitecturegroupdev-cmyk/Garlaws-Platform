"use client";

const transactions = [
  { id: "TXN-001", date: "2026-04-17", description: "Service Payment - Durban", amount: "R12,500", status: "Reconciled" },
  { id: "TXN-002", date: "2026-04-17", description: "Shop Order #4521", amount: "R4,200", status: "Reconciled" },
  { id: "TXN-003", date: "2026-04-16", description: "Subscription - Monthly", amount: "R1,299", status: "Pending" },
  { id: "TXN-004", date: "2026-04-16", description: "Supplier Payment", amount: "-R8,750", status: "Reconciled" },
];

export default function FinancePage() {
  return (
    <div className="min-h-screen bg-[#0b0c10] text-white">
      <div className="bg-gradient-to-r from-[#1f2833] to-[#2d3b2d] py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-[#c5a059] mb-4">Financial Reconciliations</h1>
          <p className="text-xl text-[#45a29e]">SARS tax compliance & automated accounting</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-[#c5a059]">R2.4M</div>
            <div className="text-[#45a29e]">Monthly Revenue</div>
          </div>
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-[#c5a059]">R890K</div>
            <div className="text-[#45a29e]">Tax Collected</div>
          </div>
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-green-400">98%</div>
            <div className="text-[#45a29e]">Reconciled</div>
          </div>
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-[#c5a059]">15%</div>
            <div className="text-[#45a29e]">VAT Rate</div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-[#c5a059] mb-4">Recent Transactions</h2>
        <div className="space-y-3 mb-8">
          {transactions.map((txn) => (
            <div key={txn.id} className="bg-[#1f2833] p-4 rounded-lg border border-[#45a29e]/30 flex justify-between items-center">
              <div>
                <div className="font-bold text-white">{txn.description}</div>
                <div className="text-sm text-[#45a29e]">{txn.date}</div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${txn.amount.startsWith("-") ? "text-red-400" : "text-[#c5a059]"}`}>{txn.amount}</div>
                <span className={`px-2 py-1 rounded text-xs ${txn.status === "Reconciled" ? "bg-green-900 text-green-400" : "bg-yellow-900 text-yellow-400"}`}>
                  {txn.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#2d3b2d] p-6 rounded-lg border border-[#c5a059]/30">
            <h3 className="text-xl font-bold text-[#c5a059] mb-4">SARS Compliance</h3>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-gray-400">VAT Registration</span><span className="text-green-400">✓ Valid</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Tax Clearance</span><span className="text-green-400">✓ Current</span></div>
              <div className="flex justify-between"><span className="text-gray-400">EMP201</span><span className="text-green-400">✓ Submitted</span></div>
              <div className="flex justify-between"><span className="text-gray-400">IRP5 Submissions</span><span className="text-yellow-400">○ Pending</span></div>
            </div>
          </div>
          <div className="bg-[#2d3b2d] p-6 rounded-lg border border-[#c5a059]/30">
            <h3 className="text-xl font-bold text-[#c5a059] mb-4">Next Deadlines</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-400"><span>VAT Return</span><span className="text-white">May 30</span></div>
              <div className="flex justify-between text-gray-400"><span>PAYE</span><span className="text-white">May 7</span></div>
              <div className="flex justify-between text-gray-400"><span>Annual Tax</span><span className="text-white">Sep 30</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}