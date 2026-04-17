"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { NotificationDropdown } from "@/components/NotificationDropdown";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
}

export function DashboardLayout({ children, activeTab }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: "📊" },
    { name: "Profile", href: "/dashboard/profile", icon: "👤" },
    { name: "Bookings", href: "/dashboard/bookings", icon: "📅" },
    { name: "Reviews", href: "/dashboard/reviews", icon: "⭐", roles: ["service_provider"] },
    { name: "Support", href: "/dashboard/support", icon: "🎫" },
    { name: "Properties", href: "/dashboard/properties", icon: "🏠", roles: ["property_owner"] },
    { name: "Services", href: "/dashboard/services", icon: "🛠️", roles: ["service_provider"] },
    { name: "Earnings", href: "/dashboard/earnings", icon: "💰", roles: ["service_provider"] },
    { name: "Schedule", href: "/dashboard/schedule", icon: "📅", roles: ["service_provider"] },
    { name: "Analytics", href: "/dashboard/analytics", icon: "📊" },
    { name: "Reports", href: "/dashboard/reports", icon: "📄" },
    { name: "Chat", href: "/dashboard/chat", icon: "💬" },
    { name: "Notifications", href: "/dashboard/notifications", icon: "🔔" },
    { name: "Settings", href: "/dashboard/settings", icon: "⚙️" },
  ];

  const filteredNavigation = navigation.filter(item =>
    !item.roles || item.roles.includes(user?.role || "")
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0b0c10]">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </div>
        )}

        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1f2833] transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>

          {/* Sidebar header */}
          <div className="flex items-center justify-center h-16 px-4 bg-[#2d3b2d]">
            <span className="text-[#c5a059] font-bold text-lg">Garlaws</span>
          </div>

          {/* Navigation */}
          <nav className="mt-8 px-4">
            <div className="space-y-2">
              {filteredNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.name.toLowerCase()
                      ? 'bg-[#c5a059] text-[#0b0c10] font-semibold'
                      : 'text-[#45a29e] hover:bg-[#45a29e]/10 hover:text-white'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="text-xl mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>

          {/* User info and logout */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#45a29e]/20">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-[#c5a059] rounded-full flex items-center justify-center text-[#0b0c10] font-bold mr-3">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{user?.name}</p>
                <p className="text-[#45a29e] text-sm capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full px-4 py-2 bg-red-600/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64">
          {/* Top bar */}
          <div className="sticky top-0 z-40 bg-[#0b0c10] border-b border-[#45a29e]/20">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-[#45a29e] hover:bg-[#45a29e]/10"
              >
                <span className="sr-only">Open sidebar</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <div className="flex items-center space-x-4">
                <NotificationDropdown />
                <Link
                  href="/services"
                  className="px-4 py-2 bg-[#c5a059] text-[#0b0c10] rounded-lg hover:opacity-90 transition-colors font-medium"
                >
                  Book Services
                </Link>
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}