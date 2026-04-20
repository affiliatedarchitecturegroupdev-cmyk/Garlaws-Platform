'use client';

import { useState, useEffect, useCallback } from 'react';

interface PushNotification {
  id: string;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: any;
  actions?: NotificationAction[];
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp: string;
  recipientId: string;
  status: 'pending' | 'sent' | 'delivered' | 'clicked' | 'dismissed' | 'failed';
  priority: 'low' | 'normal' | 'high';
  ttl?: number; // Time to live in seconds
}

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

interface UserNotificationPreferences {
  id: string;
  userId: string;
  enabled: boolean;
  categories: {
    system: boolean;
    marketing: boolean;
    security: boolean;
    updates: boolean;
    reminders: boolean;
  };
  schedule: {
    quietHours: {
      enabled: boolean;
      start: string; // HH:MM format
      end: string; // HH:MM format
    };
    daysOfWeek: number[]; // 0-6, Sunday = 0
  };
  deliveryMethods: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  deviceTokens: string[];
}

interface NotificationAnalytics {
  totalSent: number;
  totalDelivered: number;
  totalClicked: number;
  totalDismissed: number;
  deliveryRate: number;
  clickRate: number;
  dismissRate: number;
  averageTimeToClick: number; // in minutes
  topPerformingCategories: Array<{
    category: string;
    sent: number;
    clicked: number;
    rate: number;
  }>;
  deviceBreakdown: Array<{
    device: string;
    count: number;
    percentage: number;
  }>;
}

interface PushNotificationSystemProps {
  tenantId?: string;
}

export default function PushNotificationSystem({ tenantId = 'default' }: PushNotificationSystemProps) {
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserNotificationPreferences | null>(null);
  const [analytics, setAnalytics] = useState<NotificationAnalytics | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [newNotification, setNewNotification] = useState<Partial<PushNotification>>({
    title: '',
    body: '',
    priority: 'normal',
    requireInteraction: false,
    silent: false
  });
  const [loading, setLoading] = useState(true);

  const checkNotificationSupport = useCallback(() => {
    return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
  }, []);

  const requestNotificationPermission = async () => {
    if (!checkNotificationSupport()) {
      alert('Push notifications are not supported in this browser.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        await registerServiceWorker();
        await subscribeToPush();
      } else {
        alert('Notification permission denied.');
      }
    } catch (error) {
      console.error('Failed to request notification permission:', error);
    }
  };

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

  const subscribeToPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BKxQzBJ1JgY4zqQX8vP8vQX8vP8vQX8vP8vQX8vP8vQX8vP8vQX8vP8vQX8vP8vQX8vP8vQX8vP8vQX8vP8vQX8vP8v'; // Replace with actual key

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      setSubscription(subscription);
      setIsSubscribed(true);

      // Send subscription to server
      await fetch('/api/mobile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register-device-token',
          tenantId,
          token: JSON.stringify(subscription),
          platform: 'web'
        })
      });

      console.log('Push subscription successful:', subscription);
    } catch (error) {
      console.error('Push subscription failed:', error);
    }
  };

  const unsubscribeFromPush = async () => {
    try {
      if (subscription) {
        await subscription.unsubscribe();
        setSubscription(null);
        setIsSubscribed(false);

        // Remove subscription from server
        await fetch('/api/mobile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'unregister-device-token',
            tenantId,
            token: JSON.stringify(subscription)
          })
        });
      }
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
    }
  };

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch(`/api/mobile?action=notifications&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, [tenantId]);

  const fetchUserPreferences = useCallback(async () => {
    try {
      const response = await fetch(`/api/mobile?action=notification-preferences&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setUserPreferences(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch user preferences:', error);
    }
  }, [tenantId]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch(`/api/mobile?action=notification-analytics&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  }, [tenantId]);

  const sendNotification = async () => {
    if (!newNotification.title || !newNotification.body) return;

    try {
      const response = await fetch('/api/mobile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send-notification',
          tenantId,
          notification: {
            ...newNotification,
            id: `notif_${Date.now()}`,
            timestamp: new Date().toISOString(),
            recipientId: 'all', // or specific user
            status: 'pending'
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        setNotifications(prev => [data.data, ...prev]);
        resetNotificationForm();
        alert('Notification sent successfully!');
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };

  const resetNotificationForm = () => {
    setNewNotification({
      title: '',
      body: '',
      priority: 'normal',
      requireInteraction: false,
      silent: false
    });
  };

  const updateUserPreferences = async (preferences: Partial<UserNotificationPreferences>) => {
    try {
      const response = await fetch('/api/mobile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-notification-preferences',
          tenantId,
          preferences
        })
      });

      const data = await response.json();
      if (data.success) {
        setUserPreferences(prev => prev ? { ...prev, ...preferences } : null);
      }
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  const testNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Test Notification', {
        body: 'This is a test notification from Garlaws Platform',
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    }
  };

  const getNotificationStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'clicked': return 'bg-blue-100 text-blue-800';
      case 'sent': return 'bg-yellow-100 text-yellow-800';
      case 'dismissed': return 'bg-gray-100 text-gray-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  useEffect(() => {
    // Check if already subscribed
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        registration.pushManager.getSubscription().then(existingSubscription => {
          setIsSubscribed(!!existingSubscription);
          setSubscription(existingSubscription);
        });
      });
    }

    // Fetch data
    Promise.all([
      fetchNotifications(),
      fetchUserPreferences(),
      fetchAnalytics()
    ]).finally(() => setLoading(false));
  }, [fetchNotifications, fetchUserPreferences, fetchAnalytics]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Push Notification System</h2>
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
            isSubscribed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isSubscribed ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{isSubscribed ? 'Subscribed' : 'Not Subscribed'}</span>
          </div>
          {!isSubscribed ? (
            <button
              onClick={requestNotificationPermission}
              disabled={!checkNotificationSupport()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              Enable Notifications
            </button>
          ) : (
            <button
              onClick={unsubscribeFromPush}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Unsubscribe
            </button>
          )}
        </div>
      </div>

      {/* Notification Support Check */}
      {!checkNotificationSupport() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-yellow-600">⚠️</span>
            <span className="text-yellow-800 font-medium">Push notifications are not supported in this browser</span>
          </div>
          <p className="text-yellow-700 text-sm mt-1">
            Please use a modern browser like Chrome, Firefox, or Safari for the best experience.
          </p>
        </div>
      )}

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{analytics.totalSent.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Sent</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{analytics.deliveryRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Delivery Rate</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-purple-600">{analytics.clickRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Click Rate</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-orange-600">{analytics.averageTimeToClick.toFixed(1)}m</div>
            <div className="text-sm text-gray-600">Avg Time to Click</div>
          </div>
        </div>
      )}

      {/* Create Notification */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Send Notification</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={newNotification.title || ''}
              onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Notification title"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              value={newNotification.body || ''}
              onChange={(e) => setNewNotification(prev => ({ ...prev, body: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Notification message"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={newNotification.priority || 'normal'}
              onChange={(e) => setNewNotification(prev => ({ ...prev, priority: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">TTL (seconds)</label>
            <input
              type="number"
              value={newNotification.ttl || ''}
              onChange={(e) => setNewNotification(prev => ({ ...prev, ttl: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="86400"
            />
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={newNotification.requireInteraction || false}
                onChange={(e) => setNewNotification(prev => ({ ...prev, requireInteraction: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Require Interaction</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={newNotification.silent || false}
                onChange={(e) => setNewNotification(prev => ({ ...prev, silent: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Silent</span>
            </label>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={sendNotification}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Send Notification
          </button>
          <button
            onClick={testNotification}
            disabled={!isSubscribed}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            Test Notification
          </button>
          <button
            onClick={resetNotificationForm}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* User Preferences */}
      {userPreferences && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Categories */}
            <div>
              <h4 className="font-medium mb-3">Categories</h4>
              <div className="space-y-2">
                {Object.entries(userPreferences.categories).map(([category, enabled]) => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => updateUserPreferences({
                        categories: { ...userPreferences.categories, [category]: e.target.checked }
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm capitalize">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Delivery Methods */}
            <div>
              <h4 className="font-medium mb-3">Delivery Methods</h4>
              <div className="space-y-2">
                {Object.entries(userPreferences.deliveryMethods).map(([method, enabled]) => (
                  <label key={method} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => updateUserPreferences({
                        deliveryMethods: { ...userPreferences.deliveryMethods, [method]: e.target.checked }
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm capitalize">{method}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Quiet Hours */}
          <div className="mt-6">
            <h4 className="font-medium mb-3">Quiet Hours</h4>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={userPreferences.schedule.quietHours.enabled}
                  onChange={(e) => updateUserPreferences({
                    schedule: {
                      ...userPreferences.schedule,
                      quietHours: { ...userPreferences.schedule.quietHours, enabled: e.target.checked }
                    }
                  })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm">Enable quiet hours</span>
              </label>
              {userPreferences.schedule.quietHours.enabled && (
                <>
                  <input
                    type="time"
                    value={userPreferences.schedule.quietHours.start}
                    onChange={(e) => updateUserPreferences({
                      schedule: {
                        ...userPreferences.schedule,
                        quietHours: { ...userPreferences.schedule.quietHours, start: e.target.value }
                      }
                    })}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <span className="text-sm text-gray-600">to</span>
                  <input
                    type="time"
                    value={userPreferences.schedule.quietHours.end}
                    onChange={(e) => updateUserPreferences({
                      schedule: {
                        ...userPreferences.schedule,
                        quietHours: { ...userPreferences.schedule.quietHours, end: e.target.value }
                      }
                    })}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Notifications */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Recent Notifications</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {notifications.slice(0, 10).map((notification) => (
            <div key={notification.id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getNotificationStatusColor(notification.status)}`}>
                      {notification.status}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                      {notification.priority}
                    </span>
                    <span className="text-sm text-gray-600">
                      {new Date(notification.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900">{notification.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{notification.body}</p>
                  {notification.actions && notification.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {notification.actions.map((action, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                          {action.title}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              <div className="text-4xl mb-2">🔔</div>
              <p>No notifications sent yet</p>
              <p className="text-sm">Send your first push notification to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}