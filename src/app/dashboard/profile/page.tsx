"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth-context";


interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    // Validation
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setMessage("New passwords do not match");
      setSaving(false);
      return;
    }

    if (formData.newPassword && !formData.currentPassword) {
      setMessage("Please enter your current password to change it");
      setSaving(false);
      return;
    }

    try {
      const formDataObj = new FormData();
      formDataObj.append("name", formData.name);
      formDataObj.append("email", formData.email);
      formDataObj.append("phone", formData.phone);

      if (formData.newPassword) {
        formDataObj.append("currentPassword", formData.currentPassword);
        formDataObj.append("newPassword", formData.newPassword);
      }

      // In a real app, this would call an API endpoint
      // For now, we'll simulate the update
      await new Promise(resolve => setTimeout(resolve, 1000));

      setMessage("Profile updated successfully!");
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

    } catch (error) {
      setMessage("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout activeTab="profile">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-2xl font-bold text-[#c5a059] mb-2">Loading Profile...</h2>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab="profile">
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
          <p className="text-[#45a29e]">
            Manage your account information and preferences
          </p>
        </div>

        {/* Profile Form */}
        <div className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6">
          <h2 className="text-xl font-bold text-white mb-6">Personal Information</h2>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes("success")
                ? "bg-green-900/50 border border-green-500 text-green-400"
                : "bg-red-900/50 border border-red-500 text-red-400"
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[#45a29e] text-sm font-medium mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg p-4 text-white focus:border-[#c5a059] focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-[#45a29e] text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg p-4 text-white focus:border-[#c5a059] focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[#45a29e] text-sm font-medium mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg p-4 text-white focus:border-[#c5a059] focus:outline-none transition-colors"
                placeholder="+27 XX XXX XXXX"
              />
            </div>

            {/* Account Type (Read-only) */}
            <div>
              <label className="block text-[#45a29e] text-sm font-medium mb-2">
                Account Type
              </label>
              <input
                type="text"
                value={user?.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || ""}
                className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg p-4 text-[#45a29e] cursor-not-allowed"
                readOnly
              />
            </div>

            {/* Password Change Section */}
            <div className="border-t border-[#45a29e]/20 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
              <p className="text-[#45a29e] text-sm mb-4">
                Leave blank if you don&apos;t want to change your password
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-[#45a29e] text-sm font-medium mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg p-4 text-white focus:border-[#c5a059] focus:outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#45a29e] text-sm font-medium mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg p-4 text-white focus:border-[#c5a059] focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[#45a29e] text-sm font-medium mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg p-4 text-white focus:border-[#c5a059] focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-[#45a29e]/20">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-[#c5a059] text-[#0b0c10] rounded-lg font-bold hover:bg-[#b8954f] transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* Account Actions */}
        <div className="mt-8 bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6">
          <h2 className="text-xl font-bold text-white mb-6">Account Actions</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#0b0c10] rounded-lg">
              <div>
                <h3 className="text-white font-medium">Export Data</h3>
                <p className="text-[#45a29e] text-sm">Download all your data</p>
              </div>
              <button className="px-4 py-2 bg-[#45a29e]/20 border border-[#45a29e]/40 text-[#45a29e] rounded-lg hover:bg-[#45a29e]/30 transition-colors">
                Export
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#0b0c10] rounded-lg">
              <div>
                <h3 className="text-white font-medium">Delete Account</h3>
                <p className="text-[#45a29e] text-sm">Permanently delete your account and data</p>
              </div>
              <button className="px-4 py-2 bg-red-600/20 border border-red-500/40 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}