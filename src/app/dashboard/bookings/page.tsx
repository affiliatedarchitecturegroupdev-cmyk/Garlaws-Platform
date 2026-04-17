"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { VideoCall } from "@/components/VideoCall";

interface Booking {
  id: number;
  serviceName: string;
  propertyAddress: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  amount: number;
  providerName?: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [selectedBookings, setSelectedBookings] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [sortBy, setSortBy] = useState<"date" | "amount" | "status">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [videoCallState, setVideoCallState] = useState<{ isOpen: boolean; roomId: string; bookingId: number } | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      // In a real app, this would fetch from API
      // For now, we'll simulate data
      const mockBookings: Booking[] = [
        {
          id: 1,
          serviceName: "Garden Maintenance",
          propertyAddress: "123 Main Street, Johannesburg",
          date: "2026-04-20",
          time: "10:00",
          status: "confirmed",
          amount: 850.00,
          providerName: "GreenThumb Services"
        },
        {
          id: 2,
          serviceName: "Pool Cleaning",
          propertyAddress: "456 Oak Avenue, Pretoria",
          date: "2026-04-18",
          time: "14:00",
          status: "completed",
          amount: 650.00,
          providerName: "AquaClean Pro"
        },
        {
          id: 3,
          serviceName: "Landscaping Design",
          propertyAddress: "789 Pine Road, Cape Town",
          date: "2026-04-15",
          time: "09:00",
          status: "completed",
          amount: 2200.00,
          providerName: "DesignScape Studios"
        },
        {
          id: 4,
          serviceName: "Electrical Inspection",
          propertyAddress: "321 Elm Street, Durban",
          date: "2026-04-25",
          time: "11:00",
          status: "pending",
          amount: 1200.00,
        },
      ];

      setBookings(mockBookings);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Booking["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === "all") return true;
    return booking.status === filter;
  });

  if (loading) {
    return (
      <DashboardLayout activeTab="bookings">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-2xl font-bold text-[#c5a059] mb-2">Loading Bookings...</h2>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab="bookings">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Bookings</h1>
          <p className="text-[#45a29e]">
            View and manage your service bookings
          </p>
        </div>

        {/* Advanced Filters */}
        <div className="mb-6 bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div>
              <label className="block text-[#45a29e] text-sm font-medium mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by service or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg px-3 py-2 text-white placeholder-[#45a29e]/50 focus:border-[#c5a059] focus:outline-none"
              />
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-[#45a29e] text-sm font-medium mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg px-3 py-2 text-white focus:border-[#c5a059] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#45a29e] text-sm font-medium mb-2">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg px-3 py-2 text-white focus:border-[#c5a059] focus:outline-none"
              />
            </div>

            {/* Sort */}
            <div>
              <label className="block text-[#45a29e] text-sm font-medium mb-2">
                Sort By
              </label>
              <select
                value={`${sortBy}_${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('_');
                  setSortBy(field as any);
                  setSortOrder(order as any);
                }}
                className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg px-3 py-2 text-white focus:border-[#c5a059] focus:outline-none"
              >
                <option value="date_desc">Date (Newest)</option>
                <option value="date_asc">Date (Oldest)</option>
                <option value="amount_desc">Amount (High)</option>
                <option value="amount_asc">Amount (Low)</option>
                <option value="status_desc">Status (A-Z)</option>
                <option value="status_asc">Status (Z-A)</option>
              </select>
            </div>
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-2">
            <span className="text-white font-medium mr-2">Status:</span>
            {[
              { value: "all", label: "All", count: bookings.length },
              { value: "pending", label: "Pending", count: bookings.filter(b => b.status === "pending").length },
              { value: "confirmed", label: "Confirmed", count: bookings.filter(b => b.status === "confirmed").length },
              { value: "in_progress", label: "In Progress", count: bookings.filter(b => b.status === "in_progress").length },
              { value: "completed", label: "Completed", count: bookings.filter(b => b.status === "completed").length },
              { value: "cancelled", label: "Cancelled", count: bookings.filter(b => b.status === "cancelled").length },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  filter === option.value
                    ? "bg-[#c5a059] text-[#0b0c10]"
                    : "bg-[#2d3b2d] border border-[#45a29e]/20 text-[#45a29e] hover:border-[#45a29e]/40"
                }`}
              >
                {option.label} ({option.count})
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.length === 0 ? (
            <div className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-12 text-center">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-bold text-white mb-2">No bookings found</h3>
              <p className="text-[#45a29e] mb-6">
                {filter === "all"
                  ? "You haven't booked any services yet."
                  : `No ${filter.replace('_', ' ')} bookings found.`
                }
              </p>
              <a
                href="/services"
                className="inline-block px-6 py-3 bg-[#c5a059] text-[#0b0c10] rounded-lg font-bold hover:bg-[#b8954f] transition-colors"
              >
                Book a Service
              </a>
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                  <div className="flex-1 mb-4 lg:mb-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-white">{booking.serviceName}</h3>
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm text-[#45a29e]">
                      <p>🏠 {booking.propertyAddress}</p>
                      <p>📅 {new Date(booking.date).toLocaleDateString()} at {booking.time}</p>
                      {booking.providerName && <p>👨‍🔧 {booking.providerName}</p>}
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-3">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">
                        R{booking.amount.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {booking.status === "pending" && (
                        <>
                          <button className="px-4 py-2 bg-red-600/20 border border-red-500/40 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors text-sm">
                            Cancel
                          </button>
                          <button className="px-4 py-2 bg-[#45a29e]/20 border border-[#45a29e]/40 text-[#45a29e] rounded-lg hover:bg-[#45a29e]/30 transition-colors text-sm">
                            Reschedule
                          </button>
                        </>
                      )}

                      {booking.status === "confirmed" && (
                        <>
                          <button
                            onClick={() => setVideoCallState({ isOpen: true, roomId: `booking-${booking.id}`, bookingId: booking.id })}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            Video Call
                          </button>
                          <button className="px-4 py-2 bg-[#c5a059] text-[#0b0c10] rounded-lg hover:bg-[#b8954f] transition-colors text-sm font-medium">
                            Track Service
                          </button>
                        </>
                      )}

                      {booking.status === "in_progress" && (
                        <button
                          onClick={() => setVideoCallState({ isOpen: true, roomId: `booking-${booking.id}`, bookingId: booking.id })}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Join Call
                        </button>
                      )}

                      {booking.status === "completed" && (
                        <>
                          <button className="px-4 py-2 bg-[#45a29e]/20 border border-[#45a29e]/40 text-[#45a29e] rounded-lg hover:bg-[#45a29e]/30 transition-colors text-sm">
                            Leave Review
                          </button>
                          <button className="px-4 py-2 bg-[#c5a059] text-[#0b0c10] rounded-lg hover:bg-[#b8954f] transition-colors text-sm font-medium">
                            Book Again
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[#1f2833] rounded-xl p-6 border border-[#45a29e]/20 text-center">
            <div className="text-3xl font-bold text-white mb-2">{bookings.length}</div>
            <div className="text-[#45a29e] text-sm">Total Bookings</div>
          </div>

          <div className="bg-[#1f2833] rounded-xl p-6 border border-[#45a29e]/20 text-center">
            <div className="text-3xl font-bold text-[#c5a059] mb-2">
              {bookings.filter(b => b.status === "pending" || b.status === "confirmed").length}
            </div>
            <div className="text-[#45a29e] text-sm">Upcoming</div>
          </div>

          <div className="bg-[#1f2833] rounded-xl p-6 border border-[#45a29e]/20 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {bookings.filter(b => b.status === "completed").length}
            </div>
            <div className="text-[#45a29e] text-sm">Completed</div>
          </div>

          <div className="bg-[#1f2833] rounded-xl p-6 border border-[#45a29e]/20 text-center">
            <div className="text-3xl font-bold text-white mb-2">
              R{bookings.reduce((sum, b) => sum + b.amount, 0).toLocaleString()}
            </div>
            <div className="text-[#45a29e] text-sm">Total Spent</div>
          </div>
        </div>

        {/* Video Call Modal */}
        {videoCallState && (
          <VideoCall
            isOpen={videoCallState.isOpen}
            onClose={() => setVideoCallState(null)}
            roomId={videoCallState.roomId}
            isInitiator={true} // Service provider initiates
          />
        )}
      </div>
    </DashboardLayout>
  );
}