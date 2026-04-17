"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth-context";

interface NotificationSettings {
  emailBookings: boolean;
  emailReminders: boolean;
  emailMarketing: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
}

interface PrivacySettings {
  profileVisibility: "public" | "private" | "contacts";
  dataSharing: boolean;
  analyticsTracking: boolean;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailBookings: true,
    emailReminders: true,
    emailMarketing: false,
    smsNotifications: true,
    pushNotifications: true,
  });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profileVisibility: "private",
    dataSharing: false,
    analyticsTracking: true,
  });

  const [preferences, setPreferences] = useState({
    language: "en",
    timezone: "Africa/Johannesburg",
    currency: "ZAR",
    dateFormat: "DD/MM/YYYY",
  });

  useEffect(() => {
    // Load user settings (would come from API in real app)
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Simulate loading settings
      await new Promise(resolve => setTimeout(resolve, 500));
      // Settings would be loaded from API here
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (setting: keyof NotificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handlePrivacyChange = (setting: keyof PrivacySettings, value: any) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handlePreferenceChange = (setting: string, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage("");

    try {
      // Simulate saving settings
      await new Promise(resolve => setTimeout(resolve, 1000));

      setMessage("Settings saved successfully!");
    } catch (error) {
      setMessage("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout activeTab="settings">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-2xl font-bold text-[#c5a059] mb-2">Loading Settings...</h2>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab="settings">
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-[#45a29e]">
            Manage your account preferences and privacy settings
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes("success")
              ? "bg-green-900/50 border border-green-500 text-green-400"
              : "bg-red-900/50 border border-red-500 text-red-400"
          }`}>
            {message}
          </div>
        )}

        {/* Notification Settings */}
        <div className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-6">Notifications</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Email - Booking Updates</h3>
                <p className="text-[#45a29e] text-sm">Receive emails about booking confirmations and status changes</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.emailBookings}
                  onChange={() => handleNotificationChange('emailBookings')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#45a29e]/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#45a29e]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c5a059]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Email - Reminders</h3>
                <p className="text-[#45a29e] text-sm">Get reminded about upcoming services and maintenance</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.emailReminders}
                  onChange={() => handleNotificationChange('emailReminders')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#45a29e]/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#45a29e]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c5a059]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Email - Marketing</h3>
                <p className="text-[#45a29e] text-sm">Receive promotional emails and special offers</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.emailMarketing}
                  onChange={() => handleNotificationChange('emailMarketing')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#45a29e]/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#45a29e]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c5a059]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">SMS Notifications</h3>
                <p className="text-[#45a29e] text-sm">Receive SMS updates about your bookings</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.smsNotifications}
                  onChange={() => handleNotificationChange('smsNotifications')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#45a29e]/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#45a29e]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c5a059]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Push Notifications</h3>
                <p className="text-[#45a29e] text-sm">Receive push notifications in your browser</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.pushNotifications}
                  onChange={() => handleNotificationChange('pushNotifications')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#45a29e]/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#45a29e]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c5a059]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-6">Privacy</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-[#45a29e] text-sm font-medium mb-2">
                Profile Visibility
              </label>
              <select
                value={privacySettings.profileVisibility}
                onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg p-4 text-white focus:border-[#c5a059] focus:outline-none transition-colors"
              >
                <option value="private">Private - Only you can see your profile</option>
                <option value="contacts">Contacts - Only approved service providers</option>
                <option value="public">Public - Visible to all verified users</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Data Sharing</h3>
                <p className="text-[#45a29e] text-sm">Allow anonymous usage data to improve our services</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacySettings.dataSharing}
                  onChange={() => handlePrivacyChange('dataSharing', !privacySettings.dataSharing)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#45a29e]/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#45a29e]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c5a059]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Analytics Tracking</h3>
                <p className="text-[#45a29e] text-sm">Help us improve by allowing anonymous analytics</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacySettings.analyticsTracking}
                  onChange={() => handlePrivacyChange('analyticsTracking', !privacySettings.analyticsTracking)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#45a29e]/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#45a29e]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c5a059]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-6">Preferences</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[#45a29e] text-sm font-medium mb-2">
                Language
              </label>
              <select
                value={preferences.language}
                onChange={(e) => handlePreferenceChange('language', e.target.value)}
                className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg p-4 text-white focus:border-[#c5a059] focus:outline-none transition-colors"
              >
                <option value="en">English</option>
                <option value="af">Afrikaans</option>
                <option value="zu">isiZulu</option>
              </select>
            </div>

            <div>
              <label className="block text-[#45a29e] text-sm font-medium mb-2">
                Timezone
              </label>
              <select
                value={preferences.timezone}
                onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg p-4 text-white focus:border-[#c5a059] focus:outline-none transition-colors"
              >
                <option value="Africa/Johannesburg">South Africa (GMT+2)</option>
                <option value="Africa/Cairo">Egypt (GMT+2)</option>
                <option value="Europe/London">United Kingdom (GMT+0)</option>
              </select>
            </div>

            <div>
              <label className="block text-[#45a29e] text-sm font-medium mb-2">
                Currency
              </label>
              <select
                value={preferences.currency}
                onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg p-4 text-white focus:border-[#c5a059] focus:outline-none transition-colors"
              >
                <option value="ZAR">South African Rand (ZAR)</option>
                <option value="USD">US Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
              </select>
            </div>

            <div>
              <label className="block text-[#45a29e] text-sm font-medium mb-2">
                Date Format
              </label>
              <select
                value={preferences.dateFormat}
                onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
                className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg p-4 text-white focus:border-[#c5a059] focus:outline-none transition-colors"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="px-8 py-3 bg-[#c5a059] text-[#0b0c10] rounded-lg font-bold hover:bg-[#b8954f] transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}