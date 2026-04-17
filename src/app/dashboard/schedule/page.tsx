"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth-context";

interface AvailabilitySlot {
  id: number;
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface BookingSlot {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  customerName: string;
  serviceName: string;
  status: string;
}

export default function SchedulePage() {
  const { user } = useAuth();
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [bookings, setBookings] = useState<BookingSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  useEffect(() => {
    if (user?.role === "service_provider") {
      fetchSchedule();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchSchedule = async () => {
    try {
      // In a real app, this would fetch from API
      // For now, we'll simulate data
      const mockAvailability: AvailabilitySlot[] = [
        { id: 1, day: 'Monday', startTime: '08:00', endTime: '17:00', isAvailable: true },
        { id: 2, day: 'Tuesday', startTime: '08:00', endTime: '17:00', isAvailable: true },
        { id: 3, day: 'Wednesday', startTime: '08:00', endTime: '17:00', isAvailable: true },
        { id: 4, day: 'Thursday', startTime: '08:00', endTime: '17:00', isAvailable: true },
        { id: 5, day: 'Friday', startTime: '08:00', endTime: '17:00', isAvailable: true },
        { id: 6, day: 'Saturday', startTime: '09:00', endTime: '15:00', isAvailable: false },
        { id: 7, day: 'Sunday', startTime: '09:00', endTime: '15:00', isAvailable: false },
      ];

      const mockBookings: BookingSlot[] = [
        {
          id: 1,
          date: selectedDate,
          startTime: '10:00',
          endTime: '12:00',
          customerName: 'John Smith',
          serviceName: 'Garden Maintenance',
          status: 'confirmed'
        },
        {
          id: 2,
          date: selectedDate,
          startTime: '14:00',
          endTime: '16:00',
          customerName: 'Sarah Johnson',
          serviceName: 'Pool Cleaning',
          status: 'confirmed'
        },
      ];

      setAvailability(mockAvailability);
      setBookings(mockBookings);
    } catch (error) {
      console.error("Failed to fetch schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = (dayId: number) => {
    setAvailability(prev => prev.map(slot =>
      slot.id === dayId
        ? { ...slot, isAvailable: !slot.isAvailable }
        : slot
    ));
  };

  const updateTimeSlot = (dayId: number, field: 'startTime' | 'endTime', value: string) => {
    setAvailability(prev => prev.map(slot =>
      slot.id === dayId
        ? { ...slot, [field]: value }
        : slot
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (user?.role !== "service_provider") {
    return (
      <DashboardLayout activeTab="schedule">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-6xl mb-4">📅</div>
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
      <DashboardLayout activeTab="schedule">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-2xl font-bold text-[#c5a059] mb-2">Loading Schedule...</h2>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab="schedule">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Schedule Management</h1>
          <p className="text-[#45a29e]">
            Set your availability and manage bookings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Weekly Availability */}
          <div className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6">
            <h2 className="text-xl font-bold text-white mb-6">Weekly Availability</h2>

            <div className="space-y-4">
              {availability.map((slot) => (
                <div key={slot.id} className="flex items-center justify-between p-4 bg-[#0b0c10] rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-20">
                      <span className="text-white font-medium">{slot.day}</span>
                    </div>

                    {slot.isAvailable ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => updateTimeSlot(slot.id, 'startTime', e.target.value)}
                          className="w-24 bg-[#1f2833] border border-[#45a29e]/30 rounded p-1 text-white text-sm focus:border-[#c5a059] focus:outline-none"
                        />
                        <span className="text-[#45a29e]">to</span>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => updateTimeSlot(slot.id, 'endTime', e.target.value)}
                          className="w-24 bg-[#1f2833] border border-[#45a29e]/30 rounded p-1 text-white text-sm focus:border-[#c5a059] focus:outline-none"
                        />
                      </div>
                    ) : (
                      <span className="text-[#45a29e] text-sm">Unavailable</span>
                    )}
                  </div>

                  <button
                    onClick={() => toggleAvailability(slot.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                      slot.isAvailable
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {slot.isAvailable ? 'Available' : 'Unavailable'}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-[#45a29e]/20">
              <button className="w-full px-4 py-3 bg-[#c5a059] text-[#0b0c10] rounded-lg font-bold hover:bg-[#b8954f] transition-colors">
                Save Availability
              </button>
            </div>
          </div>

          {/* Daily Schedule */}
          <div className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Daily Schedule</h2>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg px-3 py-2 text-white focus:border-[#c5a059] focus:outline-none"
              />
            </div>

            <div className="space-y-4">
              {bookings.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📅</div>
                  <p className="text-[#45a29e]">No bookings scheduled for this date</p>
                </div>
              ) : (
                bookings.map((booking) => (
                  <div key={booking.id} className="p-4 bg-[#0b0c10] rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-white font-semibold">{booking.serviceName}</h3>
                        <p className="text-[#45a29e] text-sm">{booking.customerName}</p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-[#45a29e]">
                      <span>🕐 {booking.startTime} - {booking.endTime}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-[#45a29e]/20">
              <button className="w-full px-4 py-3 bg-[#45a29e]/20 border border-[#45a29e]/40 text-[#45a29e] rounded-lg hover:bg-[#45a29e]/30 transition-colors">
                Block Time Slot
              </button>
            </div>
          </div>
        </div>

        {/* Calendar View Placeholder */}
        <div className="mt-8 bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6">
          <h2 className="text-xl font-bold text-white mb-6">Monthly Calendar View</h2>

          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-bold text-white mb-2">Calendar Integration</h3>
            <p className="text-[#45a29e] mb-6">
              Advanced calendar features including Google Calendar sync, recurring availability, and automated scheduling.
            </p>
            <button className="px-6 py-3 bg-[#c5a059] text-[#0b0c10] rounded-lg font-bold hover:bg-[#b8954f] transition-colors">
              Upgrade to Pro
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href="/dashboard/bookings"
            className="bg-[#c5a059] text-[#0b0c10] p-6 rounded-xl hover:opacity-90 transition-all text-center"
          >
            <div className="text-3xl mb-3">📋</div>
            <h3 className="font-bold mb-2">Manage Bookings</h3>
            <p className="text-sm opacity-80">Update booking statuses and details</p>
          </a>

          <div className="bg-[#1f2833] border border-[#45a29e]/20 p-6 rounded-xl text-center">
            <div className="text-3xl mb-3">🔄</div>
            <h3 className="font-bold mb-2 text-white">Recurring Schedules</h3>
            <p className="text-sm text-[#45a29e]">Set up weekly recurring availability</p>
          </div>

          <div className="bg-[#1f2833] border border-[#45a29e]/20 p-6 rounded-xl text-center">
            <div className="text-3xl mb-3">📱</div>
            <h3 className="font-bold mb-2 text-white">Mobile App</h3>
            <p className="text-sm text-[#45a29e]">Manage schedule on the go</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}