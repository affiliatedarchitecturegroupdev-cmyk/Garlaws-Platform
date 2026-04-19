'use client';

import React, { useState, useEffect } from 'react';

interface WorkforceAnalytics {
  overview: {
    totalEmployees: number;
    activeEmployees: number;
    newHires: number;
    terminations: number;
    turnoverRate: number;
  };
  demographics: {
    departmentDistribution: Record<string, number>;
    employmentTypeDistribution: Record<string, number>;
    tenureDistribution: Record<string, number>;
    averageTenure: number;
  };
  attendance: {
    averageHoursWorked: number;
    absenteeismRate: number;
    overtimeHours: number;
  };
  leave: {
    annualLeaveUtilization: number;
    sickLeaveUtilization: number;
    averageLeaveDays: number;
    leaveRequestsPending: number;
  };
  performance: {
    averagePerformanceRating: number;
    completedReviews: number;
  };
}

export function WorkforceAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<WorkforceAnalytics | null>(null);
  const [timeframe, setTimeframe] = useState<'month' | 'quarter' | 'year'>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [timeframe]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/workforce/analytics?timeframe=${timeframe}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAnalytics(result.data);
        }
      }
    } catch (error) {
      console.error('Error loading workforce analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'text-green-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center text-gray-500 py-8">
        Failed to load workforce analytics
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Workforce Analytics</h1>
        <p className="text-gray-600 mt-2">Comprehensive insights into workforce performance and metrics</p>
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

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Workforce Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Employees:</span>
              <span className="font-medium">{analytics.overview.totalEmployees}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active:</span>
              <span className="font-medium text-green-600">{analytics.overview.activeEmployees}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">New Hires:</span>
              <span className="font-medium text-blue-600">{analytics.overview.newHires}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Terminations:</span>
              <span className="font-medium text-red-600">{analytics.overview.terminations}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Turnover & Retention</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Turnover Rate:</span>
              <span className={`font-medium ${getStatusColor(analytics.overview.turnoverRate, { good: 0.05, warning: 0.10 })}`}>
                {formatPercentage(analytics.overview.turnoverRate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg. Tenure:</span>
              <span className="font-medium">{analytics.demographics.averageTenure.toFixed(1)} years</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Retention Rate:</span>
              <span className="font-medium text-green-600">
                {formatPercentage(1 - analytics.overview.turnoverRate)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance & Time</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Avg. Hours:</span>
              <span className="font-medium">{analytics.attendance.averageHoursWorked.toFixed(1)}/week</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Absenteeism:</span>
              <span className={`font-medium ${getStatusColor(1 - analytics.attendance.absenteeismRate, { good: 0.95, warning: 0.90 })}`}>
                {formatPercentage(analytics.attendance.absenteeismRate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Overtime Hours:</span>
              <span className="font-medium">{analytics.attendance.overtimeHours}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Avg. Rating:</span>
              <span className="font-medium">{analytics.performance.averagePerformanceRating.toFixed(1)}/5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Reviews Completed:</span>
              <span className="font-medium">{analytics.performance.completedReviews}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Leave Utilization:</span>
              <span className="font-medium">{analytics.leave.annualLeaveUtilization.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Department Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Department Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(analytics.demographics.departmentDistribution).map(([dept, count]) => (
            <div key={dept} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-sm font-medium capitalize">{dept.replace('_', ' ')}</span>
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-2">{count}</span>
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${(count / analytics.overview.totalEmployees) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Employment Type Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Employment Type Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(analytics.demographics.employmentTypeDistribution).map(([type, count]) => (
            <div key={type} className="text-center p-4 border border-gray-200 rounded">
              <div className="text-2xl font-bold text-blue-600">{count}</div>
              <div className="text-sm text-gray-600 capitalize">{type.replace('_', ' ')}</div>
              <div className="text-xs text-gray-500 mt-1">
                {formatPercentage(count / analytics.overview.totalEmployees)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tenure Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Employee Tenure Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(analytics.demographics.tenureDistribution).map(([range, count]) => (
            <div key={range} className="text-center p-4 bg-gray-50 rounded">
              <div className="text-xl font-bold text-green-600">{count}</div>
              <div className="text-sm text-gray-600">{range} years</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${(count / analytics.overview.activeEmployees) * 100}%`
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leave Management Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Leave Management Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 border border-gray-200 rounded">
            <div className="text-2xl font-bold text-blue-600">{analytics.leave.annualLeaveUtilization.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Annual Leave Utilization</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded">
            <div className="text-2xl font-bold text-yellow-600">{analytics.leave.sickLeaveUtilization.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Sick Leave Utilization</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded">
            <div className="text-2xl font-bold text-purple-600">{analytics.leave.averageLeaveDays}</div>
            <div className="text-sm text-gray-600">Avg. Leave Days</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded">
            <div className="text-2xl font-bold text-orange-600">{analytics.leave.leaveRequestsPending}</div>
            <div className="text-sm text-gray-600">Pending Requests</div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Analytics</h3>
        <div className="flex space-x-4">
          <button
            onClick={() => {/* Export to PDF */}}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
          >
            Export Report
          </button>
          <button
            onClick={() => {/* Export to CSV */}}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm"
          >
            Export Data
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