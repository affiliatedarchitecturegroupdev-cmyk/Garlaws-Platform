"use client";

import { useState, useEffect } from "react";
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

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [initialized, setInitialized] = useState(false);

  const fetchNotifications = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const result = await getNotifications();
      if (result.success) {
        setNotifications(result.notifications);
        setUnreadCount(result.notifications.filter((n: Notification) => !n.read).length);
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
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleDelete = async (notificationId: number) => {
    const result = await deleteNotification(notificationId);
    if (result.success) {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      const deletedNotification = notifications.find(n => n.id === notificationId);
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    }
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
      case "urgent": return "border-red-500 bg-red-50";
      case "high": return "border-orange-500 bg-orange-50";
      case "medium": return "border-blue-500 bg-blue-50";
      case "low": return "border-gray-500 bg-gray-50";
      default: return "border-gray-500 bg-gray-50";
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-[#45a29e] hover:text-white hover:bg-[#45a29e]/10 rounded-lg transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM15 17H9a6 6 0 01-6-6V9a6 6 0 0110.29-4.12L15 9v8z" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#c5a059] text-[#0b0c10] text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-[#1f2833] border border-[#45a29e]/20 rounded-lg shadow-xl z-20 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-[#45a29e]/20">
              <h3 className="text-white font-semibold">Notifications</h3>
              <p className="text-[#45a29e] text-sm">
                {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
              </p>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-[#45a29e]">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-[#45a29e]">
                  <div className="text-4xl mb-2">🔔</div>
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-[#45a29e]/10 hover:bg-[#2d3b2d]/50 transition-colors ${
                      !notification.read ? 'bg-[#c5a059]/5 border-l-4 border-l-[#c5a059]' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-medium ${notification.read ? 'text-[#45a29e]' : 'text-white'}`}>
                            {notification.title}
                          </h4>
                          <p className="text-[#45a29e] text-sm mt-1">{notification.message}</p>
                          <p className="text-xs text-[#45a29e]/60 mt-2">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-2">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-[#c5a059] hover:text-white text-sm px-2 py-1 rounded"
                          >
                            Mark read
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="text-red-400 hover:text-red-300 text-sm px-2 py-1 rounded"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#45a29e]/20">
              <a
                href="/dashboard/notifications"
                className="text-[#c5a059] hover:text-white text-sm font-medium"
                onClick={() => setIsOpen(false)}
              >
                View all notifications →
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}