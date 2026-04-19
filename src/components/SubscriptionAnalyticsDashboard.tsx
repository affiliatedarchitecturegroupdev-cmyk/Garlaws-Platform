'use client';

import React, { useState, useEffect } from 'react';

interface SubscriptionMetrics {
  totalSubscriptions: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  canceledSubscriptions: number;
  newSubscriptions: number;
  churnRate: number;
  revenue: {
    monthlyRecurringRevenue: number;
    annualRecurringRevenue: number;
    averageRevenuePerUser: number;
  };
  planDistribution: Record<string, number>;
  growthRate: number;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

export function SubscriptionAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<SubscriptionMetrics | null>(null);
  const [timeframe, setTimeframe] = useState<'month' | 'quarter' | 'year'>('month');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'subscriptions' | 'plans'>('overview');

  useEffect(() => {
    loadAnalytics();
  }, [timeframe]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/usage?action=analytics&timeframe=${timeframe}`);
      const result = await response.json();

      if (result.success) {
        setMetrics(result.data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center text-gray-500 py-8">
        Failed to load analytics data
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Subscription Analytics</h1>
        <p className="text-gray-600 mt-2">Revenue metrics and subscription insights</p>
      </div>

      {/* Timeframe Selector */}
      <div className="mb-6">
        <div className="flex space-x-2">
          {[
            { key: 'month', label: 'Last Month' },
            { key: 'quarter', label: 'Last Quarter' },
            { key: 'year', label: 'Last Year' }
          ].map(option => (
            <button
              key={option.key}
              onClick={() => setTimeframe(option.key as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeframe === option.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'revenue', label: 'Revenue' },
            { key: 'subscriptions', label: 'Subscriptions' },
            { key: 'plans', label: 'Plans' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Key Metrics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Total Revenue</h3>
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(metrics.revenue.monthlyRecurringRevenue)}
            </div>
            <p className="text-sm text-gray-600 mt-1">Monthly Recurring Revenue</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Subscriptions</h3>
            <div className="text-3xl font-bold text-blue-600">
              {metrics.activeSubscriptions}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {formatPercentage(metrics.activeSubscriptions / Math.max(metrics.totalSubscriptions, 1))} of total
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Churn Rate</h3>
            <div className={`text-3xl font-bold ${metrics.churnRate > 0.1 ? 'text-red-600' : 'text-green-600'}`}>
              {formatPercentage(metrics.churnRate)}
            </div>
            <p className="text-sm text-gray-600 mt-1">Subscription cancellations</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Growth Rate</h3>
            <div className={`text-3xl font-bold ${metrics.growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercentage(metrics.growthRate)}
            </div>
            <p className="text-sm text-gray-600 mt-1">New subscriptions</p>
          </div>
        </div>
      )}

      {/* Revenue Tab */}
      {activeTab === 'revenue' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-gray-700">Monthly Recurring Revenue</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(metrics.revenue.monthlyRecurringRevenue)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-gray-700">Annual Recurring Revenue</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(metrics.revenue.annualRecurringRevenue)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-gray-700">Average Revenue Per User</span>
                <span className="font-semibold text-blue-600">
                  {formatCurrency(metrics.revenue.averageRevenuePerUser)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h3>
            <div className="text-center text-gray-500 py-8">
              <p>Revenue trend visualization would go here</p>
              <p className="text-sm mt-2">Charts showing revenue growth over time</p>
            </div>
          </div>
        </div>
      )}

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Subscriptions</span>
                <span className="font-medium">{metrics.totalSubscriptions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active</span>
                <span className="font-medium text-green-600">{metrics.activeSubscriptions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Trial</span>
                <span className="font-medium text-blue-600">{metrics.trialSubscriptions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Canceled</span>
                <span className="font-medium text-red-600">{metrics.canceledSubscriptions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">New This Period</span>
                <span className="font-medium text-green-600">{metrics.newSubscriptions}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Lifecycle</h3>
            <div className="text-center text-gray-500 py-8">
              <p>Subscription lifecycle visualization would go here</p>
              <p className="text-sm mt-2">Funnel showing trial to paid conversion</p>
            </div>
          </div>
        </div>
      )}

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Plan Distribution</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(metrics.planDistribution).map(([plan, count]) => (
                <div key={plan} className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 capitalize mb-2">{plan} Plan</h3>
                  <div className="text-2xl font-bold text-blue-600 mb-1">{count}</div>
                  <div className="text-sm text-gray-600">
                    {formatPercentage(count / Math.max(metrics.totalSubscriptions, 1))} of total subscriptions
                  </div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(count / Math.max(metrics.totalSubscriptions, 1)) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="font-medium text-gray-900 mb-4">Plan Performance</h3>
              <div className="text-center text-gray-500 py-8">
                <p>Plan performance metrics would go here</p>
                <p className="text-sm mt-2">Revenue per plan, churn rates, upgrade patterns</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Options */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Data</h3>
        <div className="flex space-x-4">
          <button
            onClick={() => {/* Export to CSV */}}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
          >
            Export to CSV
          </button>
          <button
            onClick={() => {/* Export to PDF */}}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm"
          >
            Export Report
          </button>
          <button
            onClick={() => {/* Schedule report */}}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 text-sm"
          >
            Schedule Report
          </button>
        </div>
      </div>
    </div>
  );
}