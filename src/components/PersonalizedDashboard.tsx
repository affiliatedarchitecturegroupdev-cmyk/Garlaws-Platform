'use client';

import { useEffect, useState } from 'react';
import {
  useFinancialData,
  useInventoryData,
  useOrdersData,
  useProjectsData,
  useSystemHealth,
  useNotifications,
  useAppActions
} from '@/lib/store/app-store';

interface DashboardMetric {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: string;
  color: string;
}

interface RecentActivity {
  id: string;
  type: 'order' | 'project' | 'financial' | 'inventory' | 'system';
  title: string;
  description: string;
  timestamp: Date;
  status?: 'success' | 'warning' | 'error';
}

export default function PersonalizedDashboard() {
  const financial = useFinancialData();
  const inventory = useInventoryData();
  const orders = useOrdersData();
  const projects = useProjectsData();
  const systemHealth = useSystemHealth();
  const notifications = useNotifications();
  const { syncAllData } = useAppActions();

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Initial data load
    syncAllData();
  }, [syncAllData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await syncAllData();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Calculate metrics from cross-module data
  const metrics: DashboardMetric[] = [
    {
      title: 'Total Revenue',
      value: financial ? `R${financial.revenue.toLocaleString()}` : 'Loading...',
      change: financial ? '+12.5%' : undefined,
      changeType: 'positive',
      icon: '💰',
      color: 'bg-green-500'
    },
    {
      title: 'Active Orders',
      value: orders ? orders.pendingOrders : 'Loading...',
      change: orders ? '+8.2%' : undefined,
      changeType: 'positive',
      icon: '📦',
      color: 'bg-blue-500'
    },
    {
      title: 'Active Projects',
      value: projects ? projects.activeProjects : 'Loading...',
      change: projects ? '-2.1%' : undefined,
      changeType: 'negative',
      icon: '📋',
      color: 'bg-purple-500'
    },
    {
      title: 'Low Stock Items',
      value: inventory ? inventory.lowStockItems : 'Loading...',
      change: inventory ? '+15.3%' : undefined,
      changeType: 'negative',
      icon: '📉',
      color: 'bg-orange-500'
    },
    {
      title: 'System Health',
      value: systemHealth ? `${Math.round(systemHealth.uptime * 100)}%` : 'Loading...',
      change: systemHealth ? '99.9%' : undefined,
      changeType: 'positive',
      icon: '⚡',
      color: 'bg-green-500'
    },
    {
      title: 'Monthly Profit',
      value: financial ? `R${financial.profit.toLocaleString()}` : 'Loading...',
      change: financial ? '+18.7%' : undefined,
      changeType: 'positive',
      icon: '📈',
      color: 'bg-indigo-500'
    }
  ];

  // Generate recent activities from cross-module data
  const recentActivities: RecentActivity[] = [
    ...(orders ? [{
      id: 'order-1',
      type: 'order' as const,
      title: 'New Order Received',
      description: `Order #${Math.floor(Math.random() * 10000)} for R2,450`,
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      status: 'success' as const
    }] : []),
    ...(projects ? [{
      id: 'project-1',
      type: 'project' as const,
      title: 'Project Milestone Completed',
      description: 'Garden Design Phase 2 completed successfully',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      status: 'success' as const
    }] : []),
    ...(financial ? [{
      id: 'financial-1',
      type: 'financial' as const,
      title: 'Monthly Budget Updated',
      description: 'Maintenance budget increased by 15%',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      status: 'warning' as const
    }] : []),
    ...(inventory ? [{
      id: 'inventory-1',
      type: 'inventory' as const,
      title: 'Low Stock Alert',
      description: 'Terracotta pots running low (5 remaining)',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      status: 'warning' as const
    }] : []),
    ...(systemHealth ? [{
      id: 'system-1',
      type: 'system' as const,
      title: 'System Maintenance',
      description: 'Scheduled maintenance completed successfully',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
      status: 'success' as const
    }] : [])
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 5);

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'order': return '🛒';
      case 'project': return '📋';
      case 'financial': return '💰';
      case 'inventory': return '📦';
      case 'system': return '⚙️';
      default: return '📄';
    }
  };

  const getActivityColor = (status?: RecentActivity['status']) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-orange-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Cross-module insights and key metrics</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                {metric.change && (
                  <p className={`text-sm mt-2 ${
                    metric.changeType === 'positive' ? 'text-green-600' :
                    metric.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {metric.change} from last month
                  </p>
                )}
              </div>
              <div className={`w-12 h-12 ${metric.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                {metric.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <p className="text-sm text-gray-600 mt-1">Latest updates across all modules</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.length > 0 ? recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.timestamp.toLocaleString()}
                    </p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'success' ? 'bg-green-500' :
                    activity.status === 'warning' ? 'bg-orange-500' :
                    activity.status === 'error' ? 'bg-red-500' : 'bg-gray-500'
                  }`} />
                </div>
              )) : (
                <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            <p className="text-sm text-gray-600 mt-1">Frequently used operations</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <span className="text-2xl mb-2">🛒</span>
                <span className="text-sm font-medium text-blue-900">New Order</span>
              </button>
              <button className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <span className="text-2xl mb-2">📋</span>
                <span className="text-sm font-medium text-green-900">New Project</span>
              </button>
              <button className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <span className="text-2xl mb-2">👥</span>
                <span className="text-sm font-medium text-purple-900">Add Customer</span>
              </button>
              <button className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                <span className="text-2xl mb-2">📊</span>
                <span className="text-sm font-medium text-orange-900">View Reports</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            <p className="text-sm text-gray-600 mt-1">Important updates and alerts</p>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {notifications.slice(0, 3).map((notification) => (
                <div key={notification.id} className={`p-4 rounded-lg border ${
                  notification.type === 'error' ? 'bg-red-50 border-red-200' :
                  notification.type === 'warning' ? 'bg-orange-50 border-orange-200' :
                  notification.type === 'success' ? 'bg-green-50 border-green-200' :
                  'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      notification.type === 'error' ? 'bg-red-500' :
                      notification.type === 'warning' ? 'bg-orange-500' :
                      notification.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {notification.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}