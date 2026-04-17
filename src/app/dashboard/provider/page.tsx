"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth-context";

interface ServiceProviderStats {
  totalBookings: number;
  activeBookings: number;
  completedBookings: number;
  totalEarnings: number;
  monthlyEarnings: number;
  averageRating: number;
  totalServices: number;
}

interface RecentBooking {
  id: number;
  customerName: string;
  serviceName: string;
  date: string;
  status: string;
  amount: number;
  location: string;
}

export default function ProviderDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ServiceProviderStats>({
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    totalEarnings: 0,
    monthlyEarnings: 0,
    averageRating: 0,
    totalServices: 0,
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === "service_provider") {
      fetchProviderStats();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProviderStats = async () => {
    try {
      // In a real app, this would fetch from API
      // For now, we'll simulate data
      setStats({
        totalBookings: 47,
        activeBookings: 8,
        completedBookings: 39,
        totalEarnings: 87500.00,
        monthlyEarnings: 12450.00,
        averageRating: 4.8,
        totalServices: 5,
      });

      setRecentBookings([
        {
          id: 1,
          customerName: "John Smith",
          serviceName: "Garden Maintenance",
          date: "2026-04-20",
          status: "confirmed",
          amount: 850.00,
          location: "123 Main Street, Johannesburg"
        },
        {
          id: 2,
          customerName: "Sarah Johnson",
          serviceName: "Pool Cleaning",
          date: "2026-04-18",
          status: "in_progress",
          amount: 650.00,
          location: "456 Oak Avenue, Pretoria"
        },
        {
          id: 3,
          customerName: "Mike Wilson",
          serviceName: "Landscaping Design",
          date: "2026-04-15",
          status: "completed",
          amount: 2200.00,
          location: "789 Pine Road, Cape Town"
        },
      ]);
    } catch (error) {
      console.error("Failed to fetch provider stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== "service_provider") {
    return (
      <DashboardLayout activeTab="dashboard">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-6xl mb-4">🔧</div>
            <h2 className="text-2xl font-bold text-[#c5a059] mb-2">Access Restricted</h2>
            <p className="text-[#45a29e]">
              This dashboard is only available for service providers.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout activeTab="dashboard">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-2xl font-bold text-[#c5a059] mb-2">Loading Dashboard...</h2>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab="dashboard">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Provider Dashboard 👋
          </h1>
          <p className="text-[#45a29e]">
            Welcome back! Here&apos;s your business overview.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1f2833] rounded-xl p-6 border border-[#45a29e]/20">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[#45a29e] text-sm font-medium">Total Bookings</div>
              <div className="text-2xl">📅</div>
            </div>
            <div className="text-3xl font-bold text-white">{stats.totalBookings}</div>
            <div className="text-xs text-[#45a29e] mt-1">All time</div>
          </div>

          <div className="bg-[#1f2833] rounded-xl p-6 border border-[#45a29e]/20">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[#45a29e] text-sm font-medium">Active Jobs</div>
              <div className="text-2xl">🔄</div>
            </div>
            <div className="text-3xl font-bold text-[#c5a059]">{stats.activeBookings}</div>
            <div className="text-xs text-[#45a29e] mt-1">In progress</div>
          </div>

          <div className="bg-[#1f2833] rounded-xl p-6 border border-[#45a29e]/20">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[#45a29e] text-sm font-medium">Monthly Earnings</div>
              <div className="text-2xl">💰</div>
            </div>
            <div className="text-3xl font-bold text-green-400">
              R{stats.monthlyEarnings.toLocaleString()}
            </div>
            <div className="text-xs text-[#45a29e] mt-1">This month</div>
          </div>

          <div className="bg-[#1f2833] rounded-xl p-6 border border-[#45a29e]/20">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[#45a29e] text-sm font-medium">Rating</div>
              <div className="text-2xl">⭐</div>
            </div>
            <div className="text-3xl font-bold text-yellow-400">{stats.averageRating}</div>
            <div className="text-xs text-[#45a29e] mt-1">Average rating</div>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#1f2833] rounded-xl p-6 border border-[#45a29e]/20">
            <h3 className="text-lg font-semibold text-white mb-4">Total Earnings</h3>
            <div className="text-4xl font-bold text-white mb-2">
              R{stats.totalEarnings.toLocaleString()}
            </div>
            <div className="text-sm text-[#45a29e]">Lifetime earnings</div>
          </div>

          <div className="bg-[#1f2833] rounded-xl p-6 border border-[#45a29e]/20">
            <h3 className="text-lg font-semibold text-white mb-4">Services Offered</h3>
            <div className="text-4xl font-bold text-[#c5a059] mb-2">{stats.totalServices}</div>
            <div className="text-sm text-[#45a29e]">Active services</div>
          </div>

          <div className="bg-[#1f2833] rounded-xl p-6 border border-[#45a29e]/20">
            <h3 className="text-lg font-semibold text-white mb-4">Completion Rate</h3>
            <div className="text-4xl font-bold text-green-400 mb-2">
              {Math.round((stats.completedBookings / stats.totalBookings) * 100)}%
            </div>
            <div className="text-sm text-[#45a29e]">Job completion rate</div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 overflow-hidden">
          <div className="p-6 border-b border-[#45a29e]/20">
            <h2 className="text-xl font-bold text-white">Recent Bookings</h2>
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
                    Location
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
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-[#2d3b2d]/20">
                    <td className="px-6 py-4 whitespace-nowrap text-white font-medium">
                      {booking.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#45a29e]">
                      {booking.serviceName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#45a29e]">
                      {new Date(booking.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-[#45a29e] max-w-xs truncate">
                      {booking.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        booking.status === 'confirmed'
                          ? 'bg-blue-100 text-blue-800'
                          : booking.status === 'in_progress'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {booking.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-white font-medium">
                      R{booking.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-6 border-t border-[#45a29e]/20">
            <a
              href="/dashboard/bookings"
              className="text-[#c5a059] hover:text-white transition-colors font-medium"
            >
              View all bookings →
            </a>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href="/dashboard/services"
            className="bg-[#c5a059] text-[#0b0c10] p-6 rounded-xl hover:opacity-90 transition-all text-center"
          >
            <div className="text-3xl mb-3">🛠️</div>
            <h3 className="font-bold mb-2">Manage Services</h3>
            <p className="text-sm opacity-80">Update your service offerings</p>
          </a>

          <a
            href="/dashboard/schedule"
            className="bg-[#1f2833] border border-[#45a29e]/20 p-6 rounded-xl hover:border-[#45a29e]/40 transition-all text-center"
          >
            <div className="text-3xl mb-3">📅</div>
            <h3 className="font-bold mb-2 text-white">Schedule Management</h3>
            <p className="text-sm text-[#45a29e]">Set availability and manage time</p>
          </a>

          <a
            href="/dashboard/earnings"
            className="bg-[#1f2833] border border-[#45a29e]/20 p-6 rounded-xl hover:border-[#45a29e]/40 transition-all text-center"
          >
            <div className="text-3xl mb-3">💰</div>
            <h3 className="font-bold mb-2 text-white">View Earnings</h3>
            <p className="text-sm text-[#45a29e]">Track income and payments</p>
          </a>
        </div>
      </div>
    </DashboardLayout>
  );
}