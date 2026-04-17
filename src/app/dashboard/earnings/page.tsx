"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth-context";

interface EarningsData {
  totalEarnings: number;
  monthlyEarnings: number;
  pendingPayments: number;
  availableBalance: number;
}

interface PaymentRecord {
  id: number;
  bookingId: number;
  customerName: string;
  serviceName: string;
  amount: number;
  status: "completed" | "pending" | "failed";
  date: string;
  paymentMethod: string;
}

export default function EarningsPage() {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState<EarningsData>({
    totalEarnings: 0,
    monthlyEarnings: 0,
    pendingPayments: 0,
    availableBalance: 0,
  });
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (user?.role === "service_provider") {
      fetchEarnings();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchEarnings = async () => {
    try {
      // In a real app, this would fetch from API
      // For now, we'll simulate data
      setEarnings({
        totalEarnings: 87500.00,
        monthlyEarnings: 12450.00,
        pendingPayments: 3250.00,
        availableBalance: 9200.00,
      });

      setPayments([
        {
          id: 1,
          bookingId: 1,
          customerName: "John Smith",
          serviceName: "Garden Maintenance",
          amount: 850.00,
          status: "completed",
          date: "2026-04-18",
          paymentMethod: "Card"
        },
        {
          id: 2,
          bookingId: 2,
          customerName: "Sarah Johnson",
          serviceName: "Pool Cleaning",
          amount: 650.00,
          status: "completed",
          date: "2026-04-16",
          paymentMethod: "Bank Transfer"
        },
        {
          id: 3,
          bookingId: 3,
          customerName: "Mike Wilson",
          serviceName: "Landscaping Design",
          amount: 2200.00,
          status: "pending",
          date: "2026-04-15",
          paymentMethod: "Card"
        },
        {
          id: 4,
          bookingId: 4,
          customerName: "Lisa Brown",
          serviceName: "Electrical Inspection",
          amount: 1200.00,
          status: "completed",
          date: "2026-04-12",
          paymentMethod: "EFT"
        },
      ]);
    } catch (error) {
      console.error("Failed to fetch earnings:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredPayments = payments.filter(payment => {
    if (filter === "all") return true;
    return payment.status === filter;
  });

  if (user?.role !== "service_provider") {
    return (
      <DashboardLayout activeTab="earnings">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-6xl mb-4">💰</div>
            <h2 className="text-2xl font-bold text-[#c5a059] mb-2">Access Restricted</h2>
            <p className="text-[#45a29e]">
              This section is only available for service providers.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout activeTab="earnings">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-2xl font-bold text-[#c5a059] mb-2">Loading Earnings...</h2>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab="earnings">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Earnings & Payments</h1>
          <p className="text-[#45a29e]">
            Track your income and manage payments
          </p>
        </div>

        {/* Earnings Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1f2833] rounded-xl p-6 border border-[#45a29e]/20">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[#45a29e] text-sm font-medium">Total Earnings</div>
              <div className="text-2xl">💰</div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              R{earnings.totalEarnings.toLocaleString()}
            </div>
            <div className="text-xs text-[#45a29e]">Lifetime earnings</div>
          </div>

          <div className="bg-[#1f2833] rounded-xl p-6 border border-[#45a29e]/20">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[#45a29e] text-sm font-medium">This Month</div>
              <div className="text-2xl">📈</div>
            </div>
            <div className="text-3xl font-bold text-green-400 mb-1">
              R{earnings.monthlyEarnings.toLocaleString()}
            </div>
            <div className="text-xs text-[#45a29e]">+12% from last month</div>
          </div>

          <div className="bg-[#1f2833] rounded-xl p-6 border border-[#45a29e]/20">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[#45a29e] text-sm font-medium">Available Balance</div>
              <div className="text-2xl">🏦</div>
            </div>
            <div className="text-3xl font-bold text-[#c5a059] mb-1">
              R{earnings.availableBalance.toLocaleString()}
            </div>
            <div className="text-xs text-[#45a29e]">Ready to withdraw</div>
          </div>

          <div className="bg-[#1f2833] rounded-xl p-6 border border-[#45a29e]/20">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[#45a29e] text-sm font-medium">Pending Payments</div>
              <div className="text-2xl">⏳</div>
            </div>
            <div className="text-3xl font-bold text-yellow-400 mb-1">
              R{earnings.pendingPayments.toLocaleString()}
            </div>
            <div className="text-xs text-[#45a29e]">Processing</div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { value: "all", label: "All Payments", count: payments.length },
              { value: "completed", label: "Completed", count: payments.filter(p => p.status === "completed").length },
              { value: "pending", label: "Pending", count: payments.filter(p => p.status === "pending").length },
              { value: "failed", label: "Failed", count: payments.filter(p => p.status === "failed").length },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === option.value
                    ? "bg-[#c5a059] text-[#0b0c10]"
                    : "bg-[#1f2833] border border-[#45a29e]/20 text-[#45a29e] hover:border-[#45a29e]/40"
                }`}
              >
                {option.label} ({option.count})
              </button>
            ))}
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 overflow-hidden">
          <div className="p-6 border-b border-[#45a29e]/20">
            <h2 className="text-xl font-bold text-white">Payment History</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#2d3b2d]/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#45a29e] uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#45a29e] uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#45a29e] uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#45a29e] uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#45a29e] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#45a29e] uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#45a29e]/10">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-[#2d3b2d]/20">
                    <td className="px-6 py-4 whitespace-nowrap text-white font-medium">
                      {payment.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#45a29e]">
                      {payment.serviceName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#45a29e]">
                      {new Date(payment.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#45a29e]">
                      {payment.paymentMethod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                        {payment.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-white font-medium">
                      R{payment.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-6 border-t border-[#45a29e]/20">
            <div className="flex justify-between items-center">
              <div className="text-sm text-[#45a29e]">
                Showing {filteredPayments.length} of {payments.length} payments
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-[#45a29e]/20 border border-[#45a29e]/40 text-[#45a29e] rounded-lg hover:bg-[#45a29e]/30 transition-colors text-sm">
                  Export CSV
                </button>
                <button className="px-4 py-2 bg-[#c5a059] text-[#0b0c10] rounded-lg hover:bg-[#b8954f] transition-colors text-sm font-medium">
                  Withdraw Funds
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Bank Account Setup</h3>
            <p className="text-[#45a29e] text-sm mb-4">
              Connect your bank account to receive automatic payments for completed services.
            </p>
            <button className="px-4 py-2 bg-[#c5a059] text-[#0b0c10] rounded-lg hover:bg-[#b8954f] transition-colors text-sm font-medium">
              Connect Bank Account
            </button>
          </div>

          <div className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Tax Documents</h3>
            <p className="text-[#45a29e] text-sm mb-4">
              Download tax certificates, invoices, and financial reports for your records.
            </p>
            <button className="px-4 py-2 bg-[#45a29e]/20 border border-[#45a29e]/40 text-[#45a29e] rounded-lg hover:bg-[#45a29e]/30 transition-colors text-sm">
              Download Documents
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}