"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AnalyticsSummary } from "@/components/AnalyticsSummary";
import { useAuth } from "@/lib/auth-context";

interface DashboardStats {
  totalBookings: number;
  upcomingBookings: number;
  completedBookings: number;
  totalSpent: number;
}

interface RecentBooking {
  id: number;
  serviceName: string;
  date: string;
  status: string;
  amount: number;
}

export default function DashboardPage() {
  const { user } = useAuth();

  // Redirect service providers to their specific dashboard
  if (user?.role === "service_provider") {
    // In a real app, this would redirect
    // For now, we'll show the provider dashboard content
    return <ProviderDashboardContent />;
  }

  // Show property owner/customer dashboard
  return <CustomerDashboardContent />;
}

function ProviderDashboardContent() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
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
    fetchProviderStats();
  }, []);

  const fetchProviderStats = async () => {
    try {
      // Simulate provider stats
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
          serviceName: "Garden Maintenance",
          date: "2026-04-20",
          status: "confirmed",
          amount: 850.00
        },
        {
          id: 2,
          serviceName: "Pool Cleaning",
          date: "2026-04-18",
          status: "completed",
          amount: 650.00
        },
        {
          id: 3,
          serviceName: "Landscaping Design",
          date: "2026-04-15",
          status: "completed",
          amount: 2200.00
        },
      ]);
    } catch (error) {
      console.error("Failed to fetch provider stats:", error);
    } finally {
      setLoading(false);
    }
  };

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Provider Dashboard 👋
          </h1>
          <p className="text-[#45a29e]">
            Welcome back! Here&apos;s your business overview.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1f2833] rounded-xl p-6 border border-[#45a29e]/20">
            <div className="text-[#45a29e] text-sm font-medium mb-4">Total Bookings</div>
            <div className="text-3xl font-bold text-white">{stats.totalBookings}</div>
          </div>

          <div className="bg-[#1f2833] rounded-xl p-6 border border-[#45a29e]/20">
            <div className="text-[#45a29e] text-sm font-medium mb-4">Active Jobs</div>
            <div className="text-3xl font-bold text-[#c5a059]">{stats.activeBookings}</div>
          </div>

          <div className="bg-[#1f2833] rounded-xl p-6 border border-[#45a29e]/20">
            <div className="text-[#45a29e] text-sm font-medium mb-4">Monthly Earnings</div>
            <div className="text-3xl font-bold text-green-400">
              R{stats.monthlyEarnings.toLocaleString()}
            </div>
          </div>

          <div className="bg-[#1f2833] rounded-xl p-6 border border-[#45a29e]/20">
            <div className="text-[#45a29e] text-sm font-medium mb-4">Rating</div>
            <div className="text-3xl font-bold text-yellow-400">{stats.averageRating}</div>
          </div>
        </div>

        <div className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6">
          <h2 className="text-xl font-bold text-white mb-6">Recent Bookings</h2>
          <div className="space-y-4">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="flex justify-between items-center p-4 bg-[#0b0c10] rounded-lg">
                <div>
                  <h3 className="text-white font-semibold">{booking.serviceName}</h3>
                  <p className="text-[#45a29e] text-sm">{new Date(booking.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">R{booking.amount.toLocaleString()}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                    booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function CustomerDashboardContent() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    upcomingBookings: 0,
    completedBookings: 0,
    totalSpent: 0,
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // In a real app, these would be API calls
      // For now, we'll simulate data
      setStats({
        totalBookings: 12,
        upcomingBookings: 3,
        completedBookings: 9,
        totalSpent: 15450.00,
      });

      setRecentBookings([
        {
          id: 1,
          serviceName: "Garden Maintenance",
          date: "2026-04-20",
          status: "confirmed",
          amount: 850.00,
        },
        {
          id: 2,
          serviceName: "Pool Cleaning",
          date: "2026-04-18",
          status: "completed",
          amount: 650.00,
        },
        {
          id: 3,
          serviceName: "Landscaping Design",
          date: "2026-04-15",
          status: "completed",
          amount: 2200.00,
        },
      ]);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

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
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-[#45a29e]">
            Here&apos;s an overview of your property maintenance activities
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
          </div>

          <div className="bg-[#1f2833] rounded-xl p-6 border border-[#45a29e]/20">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[#45a29e] text-sm font-medium">Upcoming</div>
              <div className="text-2xl">⏰</div>
            </div>
            <div className="text-3xl font-bold text-[#c5a059]">{stats.upcomingBookings}</div>
          </div>

          <div className="bg-[#1f2833] rounded-xl p-6 border border-[#45a29e]/20">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[#45a29e] text-sm font-medium">Completed</div>
              <div className="text-2xl">✅</div>
            </div>
            <div className="text-3xl font-bold text-green-400">{stats.completedBookings}</div>
          </div>

          <div className="bg-[#1f2833] rounded-xl p-6 border border-[#45a29e]/20">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[#45a29e] text-sm font-medium">Total Spent</div>
              <div className="text-2xl">💰</div>
            </div>
            <div className="text-3xl font-bold text-white">
              R{stats.totalSpent.toLocaleString()}
            </div>
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
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#45a29e] uppercase tracking-wider">
                    Date
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
                      {booking.serviceName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#45a29e]">
                      {new Date(booking.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        booking.status === 'confirmed'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {booking.status}
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

        {/* Analytics Summary */}
        <div className="mt-8">
          <AnalyticsSummary />
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href="/services"
            className="bg-[#c5a059] text-[#0b0c10] p-6 rounded-xl hover:opacity-90 transition-all text-center"
          >
            <div className="text-3xl mb-3">🛠️</div>
            <h3 className="font-bold mb-2">Book New Service</h3>
            <p className="text-sm opacity-80">Schedule maintenance or repairs</p>
          </a>

          <a
            href="/dashboard/properties"
            className="bg-[#1f2833] border border-[#45a29e]/20 p-6 rounded-xl hover:border-[#45a29e]/40 transition-all text-center"
          >
            <div className="text-3xl mb-3">🏠</div>
            <h3 className="font-bold mb-2 text-white">Manage Properties</h3>
            <p className="text-sm text-[#45a29e]">Add or update your properties</p>
          </a>

          <a
            href="/dashboard/profile"
            className="bg-[#1f2833] border border-[#45a29e]/20 p-6 rounded-xl hover:border-[#45a29e]/40 transition-all text-center"
          >
            <div className="text-3xl mb-3">👤</div>
            <h3 className="font-bold mb-2 text-white">Update Profile</h3>
            <p className="text-sm text-[#45a29e]">Manage your account settings</p>
          </a>
        </div>
      </div>
    </DashboardLayout>
  );
}