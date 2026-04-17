"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { getNotifications, markNotificationAsRead, deleteNotification } from "@/lib/server-actions/notifications";

interface Notification {
  id: number;
  type: "booking" | "payment" | "system" | "marketing";
  title: string;
  message: string;
  read: boolean;
  priority: "low" | "medium" | "high" | "urgent";
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [selectedNotifications, setSelectedNotifications] = useState<Set<number>>(new Set());
  const [initialized, setInitialized] = useState(false);

  const fetchNotifications = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const result = await getNotifications();
      if (result.success) {
        setNotifications(result.notifications);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialized) {
      fetchNotifications();
      setInitialized(true);
    }
  }, [initialized]);

  const handleMarkAsRead = async (notificationId: number) => {
    const result = await markNotificationAsRead(notificationId);
    if (result.success) {
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    }
  };

  const handleDelete = async (notificationId: number) => {
    const result = await deleteNotification(notificationId);
    if (result.success) {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setSelectedNotifications(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const handleBulkMarkAsRead = async () => {
    for (const id of selectedNotifications) {
      await markNotificationAsRead(id);
    }
    setNotifications(prev =>
      prev.map(n => selectedNotifications.has(n.id) ? { ...n, read: true } : n)
    );
    setSelectedNotifications(new Set());
  };

  const handleBulkDelete = async () => {
    for (const id of selectedNotifications) {
      await deleteNotification(id);
    }
    setNotifications(prev => prev.filter(n => !selectedNotifications.has(n.id)));
    setSelectedNotifications(new Set());
  };

  const handleSelectAll = () => {
    if (selectedNotifications.size === filteredNotifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(filteredNotifications.map(n => n.id)));
    }
  };

  const handleSelectNotification = (id: number) => {
    setSelectedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "booking": return "📅";
      case "payment": return "💳";
      case "system": return "⚙️";
      case "marketing": return "📢";
      default: return "🔔";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "text-red-400 border-red-500";
      case "high": return "text-orange-400 border-orange-500";
      case "medium": return "text-blue-400 border-blue-500";
      case "low": return "text-gray-400 border-gray-500";
      default: return "text-gray-400 border-gray-500";
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.read;
    return notification.type === filter;
  });

  if (loading) {
    return (
      <DashboardLayout activeTab="notifications">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-2xl font-bold text-[#c5a059] mb-2">Loading Notifications...</h2>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab="notifications">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Notification Center</h1>
          <p className="text-[#45a29e]">
            Manage all your notifications and alerts
          </p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {[
              { value: "all", label: "All", count: notifications.length },
              { value: "unread", label: "Unread", count: notifications.filter(n => !n.read).length },
              { value: "booking", label: "Bookings", count: notifications.filter(n => n.type === "booking").length },
              { value: "payment", label: "Payments", count: notifications.filter(n => n.type === "payment").length },
              { value: "system", label: "System", count: notifications.filter(n => n.type === "system").length },
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

          {selectedNotifications.size > 0 && (
            <div className="flex gap-2">
              <button
                onClick={handleBulkMarkAsRead}
                className="px-4 py-2 bg-[#45a29e]/20 border border-[#45a29e]/40 text-[#45a29e] rounded-lg hover:bg-[#45a29e]/30 transition-colors"
              >
                Mark Selected as Read
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600/20 border border-red-500/40 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
              >
                Delete Selected
              </button>
            </div>
          )}
        </div>

        {/* Select All */}
        {filteredNotifications.length > 0 && (
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              checked={selectedNotifications.size === filteredNotifications.length && filteredNotifications.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 text-[#c5a059] bg-[#1f2833] border-[#45a29e]/30 rounded focus:ring-[#c5a059] focus:ring-2"
            />
            <label className="ml-2 text-[#45a29e] text-sm">
              Select all ({filteredNotifications.length})
            </label>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-12 text-center">
              <div className="text-6xl mb-4">🔔</div>
              <h3 className="text-xl font-bold text-white mb-2">No notifications found</h3>
              <p className="text-[#45a29e]">
                {filter === "all"
                  ? "You don't have any notifications yet."
                  : `No ${filter} notifications found.`
                }
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6 transition-all ${
                  !notification.read ? 'border-l-4 border-l-[#c5a059]' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.has(notification.id)}
                    onChange={() => handleSelectNotification(notification.id)}
                    className="mt-1 w-4 h-4 text-[#c5a059] bg-[#0b0c10] border-[#45a29e]/30 rounded focus:ring-[#c5a059] focus:ring-2"
                  />

                  <div className="text-3xl">{getNotificationIcon(notification.type)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className={`font-bold ${notification.read ? 'text-[#45a29e]' : 'text-white'}`}>
                        {notification.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded border ${getPriorityColor(notification.priority)}`}>
                          {notification.priority.toUpperCase()}
                        </span>
                        {!notification.read && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#c5a059] text-[#0b0c10]">
                            NEW
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-[#45a29e] mb-3">{notification.message}</p>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-[#45a29e]/60">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>

                      <div className="flex space-x-2">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-[#c5a059] hover:text-white text-sm px-3 py-1 rounded transition-colors"
                          >
                            Mark as Read
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="text-red-400 hover:text-red-300 text-sm px-3 py-1 rounded transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}