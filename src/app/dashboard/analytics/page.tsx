"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth-context";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalBookings: number;
    averageRating: number;
    growthRate: number;
  };
  monthlyRevenue: Array<{ month: string; revenue: number; bookings: number }>;
  servicePerformance: Array<{ name: string; value: number; color: string }>;
  bookingTrends: Array<{ date: string; bookings: number; completed: number }>;
  customerSatisfaction: Array<{ rating: number; count: number }>;
  topServices: Array<{ name: string; bookings: number; revenue: number }>;
}

const COLORS = ['#c5a059', '#2d3b2d', '#45a29e', '#0b0c10', '#b8954f'];

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("6months");

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Simulate API call with comprehensive analytics data
      const mockData: AnalyticsData = {
        overview: {
          totalRevenue: 145230.00,
          totalBookings: 287,
          averageRating: 4.7,
          growthRate: 23.5,
        },
        monthlyRevenue: [
          { month: 'Oct', revenue: 18500, bookings: 32 },
          { month: 'Nov', revenue: 22100, bookings: 41 },
          { month: 'Dec', revenue: 19800, bookings: 38 },
          { month: 'Jan', revenue: 25600, bookings: 48 },
          { month: 'Feb', revenue: 28900, bookings: 52 },
          { month: 'Mar', revenue: 31330, bookings: 76 },
        ],
        servicePerformance: [
          { name: 'Garden Maintenance', value: 35, color: '#c5a059' },
          { name: 'Pool Cleaning', value: 25, color: '#2d3b2d' },
          { name: 'Landscaping', value: 20, color: '#45a29e' },
          { name: 'Electrical Work', value: 12, color: '#0b0c10' },
          { name: 'Plumbing', value: 8, color: '#b8954f' },
        ],
        bookingTrends: [
          { date: '2026-10-01', bookings: 8, completed: 7 },
          { date: '2026-10-08', bookings: 12, completed: 10 },
          { date: '2026-10-15', bookings: 15, completed: 13 },
          { date: '2026-10-22', bookings: 9, completed: 8 },
          { date: '2026-10-29', bookings: 11, completed: 9 },
          { date: '2026-11-05', bookings: 14, completed: 12 },
        ],
        customerSatisfaction: [
          { rating: 5, count: 145 },
          { rating: 4, count: 89 },
          { rating: 3, count: 34 },
          { rating: 2, count: 12 },
          { rating: 1, count: 7 },
        ],
        topServices: [
          { name: 'Garden Maintenance', bookings: 101, revenue: 50500 },
          { name: 'Pool Cleaning', bookings: 72, revenue: 36000 },
          { name: 'Landscaping Design', bookings: 57, revenue: 39900 },
          { name: 'Electrical Inspection', bookings: 35, revenue: 17500 },
          { name: 'Plumbing Services', bookings: 22, revenue: 11000 },
        ],
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error("Failed to fetch analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout activeTab="analytics">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-[#c5a059] mb-2">Loading Analytics...</h2>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!analyticsData) {
    return (
      <DashboardLayout activeTab="analytics">
        <div className="p-6">
          <div className="text-center text-[#45a29e]">
            Unable to load analytics data. Please try again later.
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab="analytics">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
            <p className="text-[#45a29e]">
              Comprehensive insights into your business performance
            </p>
          </div>

          <div className="mt-4 sm:mt-0 flex gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-[#1f2833] border border-[#45a29e]/30 rounded-lg px-4 py-2 text-white focus:border-[#c5a059] focus:outline-none"
            >
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>
            <button className="px-4 py-2 bg-[#c5a059] text-[#0b0c10] rounded-lg hover:bg-[#b8954f] transition-colors font-medium">
              Export Report
            </button>
          </div>
        </div>

        {/* KPI Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1f2833] rounded-xl p-6 border border-[#45a29e]/20">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[#45a29e] text-sm font-medium">Total Revenue</div>
              <div className="text-2xl">💰</div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              R{analyticsData.overview.totalRevenue.toLocaleString()}
            </div>
            <div className="text-xs text-green-400">+{analyticsData.overview.growthRate}% from last period</div>
          </div>

          <div className="bg-[#1f2833] rounded-xl p-6 border border-[#45a29e]/20">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[#45a29e] text-sm font-medium">Total Bookings</div>
              <div className="text-2xl">📅</div>
            </div>
            <div className="text-3xl font-bold text-[#c5a059] mb-1">
              {analyticsData.overview.totalBookings}
            </div>
            <div className="text-xs text-[#45a29e]">Completed services</div>
          </div>

          <div className="bg-[#1f2833] rounded-xl p-6 border border-[#45a29e]/20">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[#45a29e] text-sm font-medium">Average Rating</div>
              <div className="text-2xl">⭐</div>
            </div>
            <div className="text-3xl font-bold text-yellow-400 mb-1">
              {analyticsData.overview.averageRating}
            </div>
            <div className="text-xs text-[#45a29e]">Customer satisfaction</div>
          </div>

          <div className="bg-[#1f2833] rounded-xl p-6 border border-[#45a29e]/20">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[#45a29e] text-sm font-medium">Conversion Rate</div>
              <div className="text-2xl">📈</div>
            </div>
            <div className="text-3xl font-bold text-green-400 mb-1">87%</div>
            <div className="text-xs text-[#45a29e]">Quote to booking</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Trend */}
          <div className="bg-[#1f2833] rounded-xl p-6 border border-[#45a29e]/20">
            <h3 className="text-xl font-bold text-white mb-6">Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#45a29e20" />
                <XAxis dataKey="month" stroke="#45a29e" />
                <YAxis stroke="#45a29e" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2833',
                    border: '1px solid #45a29e40',
                    borderRadius: '8px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#c5a059"
                  fill="#c5a05940"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Service Performance */}
          <div className="bg-[#1f2833] rounded-xl p-6 border border-[#45a29e]/20">
            <h3 className="text-xl font-bold text-white mb-6">Service Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.servicePerformance}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {analyticsData.servicePerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2833',
                    border: '1px solid #45a29e40',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Booking Trends */}
          <div className="bg-[#1f2833] rounded-xl p-6 border border-[#45a29e]/20">
            <h3 className="text-xl font-bold text-white mb-6">Booking Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.bookingTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#45a29e20" />
                <XAxis dataKey="date" stroke="#45a29e" />
                <YAxis stroke="#45a29e" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2833',
                    border: '1px solid #45a29e40',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="bookings"
                  stroke="#c5a059"
                  strokeWidth={2}
                  name="Total Bookings"
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#2d3b2d"
                  strokeWidth={2}
                  name="Completed"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Customer Satisfaction */}
          <div className="bg-[#1f2833] rounded-xl p-6 border border-[#45a29e]/20">
            <h3 className="text-xl font-bold text-white mb-6">Customer Satisfaction</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.customerSatisfaction}>
                <CartesianGrid strokeDasharray="3 3" stroke="#45a29e20" />
                <XAxis dataKey="rating" stroke="#45a29e" />
                <YAxis stroke="#45a29e" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2833',
                    border: '1px solid #45a29e40',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" fill="#c5a059" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Services Table */}
        <div className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 overflow-hidden">
          <div className="p-6 border-b border-[#45a29e]/20">
            <h2 className="text-xl font-bold text-white">Top Performing Services</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#2d3b2d]/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#45a29e] uppercase tracking-wider">
                    Service Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#45a29e] uppercase tracking-wider">
                    Bookings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#45a29e] uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#45a29e] uppercase tracking-wider">
                    Avg. Rating
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#45a29e]/10">
                {analyticsData.topServices.map((service, index) => (
                  <tr key={index} className="hover:bg-[#2d3b2d]/20">
                    <td className="px-6 py-4 whitespace-nowrap text-white font-medium">
                      {service.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#45a29e]">
                      {service.bookings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-white font-medium">
                      R{service.revenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-yellow-400 mr-2">⭐</span>
                        <span className="text-white">
                          {(4.5 + Math.random() * 0.5).toFixed(1)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Insights & Recommendations */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#1f2833] rounded-xl p-6 border border-[#45a29e]/20">
            <h3 className="text-lg font-semibold text-white mb-4">💡 Key Insights</h3>
            <ul className="space-y-2 text-sm text-[#45a29e]">
              <li>• Revenue grew 23.5% compared to last period</li>
              <li>• Garden Maintenance is your top service (35% of bookings)</li>
              <li>• Customer satisfaction rating: 4.7/5 stars</li>
              <li>• Peak booking month: March (76 bookings)</li>
            </ul>
          </div>

          <div className="bg-[#1f2833] rounded-xl p-6 border border-[#45a29e]/20">
            <h3 className="text-lg font-semibold text-white mb-4">🎯 Recommendations</h3>
            <ul className="space-y-2 text-sm text-[#45a29e]">
              <li>• Consider expanding Pool Cleaning services</li>
              <li>• Focus marketing on high-margin landscaping</li>
              <li>• Implement customer loyalty program</li>
              <li>• Optimize scheduling for peak demand</li>
            </ul>
          </div>

          <div className="bg-[#1f2833] rounded-xl p-6 border border-[#45a29e]/20">
            <h3 className="text-lg font-semibold text-white mb-4">📊 Performance Goals</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#45a29e]">Monthly Revenue</span>
                  <span className="text-white">R31,330 / R35,000</span>
                </div>
                <div className="w-full bg-[#0b0c10] rounded-full h-2">
                  <div className="bg-[#c5a059] h-2 rounded-full" style={{ width: '89%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#45a29e]">Customer Satisfaction</span>
                  <span className="text-white">4.7 / 5.0</span>
                </div>
                <div className="w-full bg-[#0b0c10] rounded-full h-2">
                  <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '94%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}