'use client';

import React, { useState, useEffect } from 'react';

interface FinancialMetrics {
  overview: {
    revenue: number;
    expenses: number;
    profit: number;
    profitMargin: number;
    timeframe: string;
  };
  trends: {
    revenueByMonth: Record<string, number>;
    expensesByMonth: Record<string, number>;
  };
  breakdown: {
    topRevenueSources: Array<{ category: string; amount: number }>;
    topExpenseCategories: Array<{ category: string; amount: number }>;
    revenueByCategory: Record<string, number>;
    expensesByCategory: Record<string, number>;
  };
  cashFlow: {
    netCashFlow: number;
    operatingCashFlow: number;
    investingCashFlow: number;
    financingCashFlow: number;
  };
  reconciliation: {
    rate: number;
    unreconciledCount: number;
  };
  insights: string[];
}

export function FinancialAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [timeframe, setTimeframe] = useState<'month' | 'quarter' | 'year'>('month');
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState('default'); // In production, get from context

  useEffect(() => {
    loadAnalytics();
  }, [timeframe, tenantId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/financial?action=analytics&tenantId=${tenantId}&timeframe=${timeframe}`);
      const result = await response.json();

      if (result.success) {
        setMetrics(result.data);
      }
    } catch (error) {
      console.error('Error loading financial analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'text-green-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const generateReport = async (reportType: string) => {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate);

      switch (timeframe) {
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      const response = await fetch('/api/financial?action=generate_report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          reportType,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          currency: 'ZAR'
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Report generated: ${result.data.id}`);
        // In production, would download or display the report
      }
    } catch (error) {
      console.error('Error generating report:', error);
    }
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
        Failed to load financial analytics
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Financial Analytics</h1>
        <p className="text-gray-600 mt-2">Comprehensive financial insights and reporting</p>
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

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Total Revenue</h3>
          <div className="text-3xl font-bold text-green-600">
            {formatCurrency(metrics.overview.revenue)}
          </div>
          <p className="text-sm text-gray-600 mt-1">{timeframe} total</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Total Expenses</h3>
          <div className="text-3xl font-bold text-red-600">
            {formatCurrency(metrics.overview.expenses)}
          </div>
          <p className="text-sm text-gray-600 mt-1">{timeframe} total</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Net Profit</h3>
          <div className={`text-3xl font-bold ${metrics.overview.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(metrics.overview.profit)}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {formatPercentage(metrics.overview.profitMargin)} margin
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Reconciliation Rate</h3>
          <div className={`text-3xl font-bold ${getStatusColor(metrics.reconciliation.rate, { good: 90, warning: 70 })}`}>
            {formatPercentage(metrics.reconciliation.rate / 100)}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {metrics.reconciliation.unreconciledCount} unreconciled
          </p>
        </div>
      </div>

      {/* Revenue vs Expenses Chart Placeholder */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue vs Expenses Trend</h2>
        <div className="text-center text-gray-500 py-8">
          <p>Revenue and expense trend visualization would go here</p>
          <p className="text-sm mt-2">Line charts showing monthly trends over the selected timeframe</p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Category</h3>
          <div className="space-y-3">
            {Object.entries(metrics.breakdown.revenueByCategory).map(([category, amount]) => (
              <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="text-sm font-medium capitalize">{category.replace('_', ' ')}</span>
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 mr-2">{formatCurrency(amount)}</span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${(amount / metrics.overview.revenue) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses by Category</h3>
          <div className="space-y-3">
            {Object.entries(metrics.breakdown.expensesByCategory).map(([category, amount]) => (
              <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="text-sm font-medium capitalize">{category.replace('_', ' ')}</span>
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 mr-2">{formatCurrency(amount)}</span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{
                        width: `${(amount / metrics.overview.expenses) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cash Flow Analysis */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Cash Flow Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 border border-gray-200 rounded">
            <div className={`text-2xl font-bold ${metrics.cashFlow.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(metrics.cashFlow.netCashFlow)}
            </div>
            <div className="text-sm text-gray-600">Net Cash Flow</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(metrics.cashFlow.operatingCashFlow)}
            </div>
            <div className="text-sm text-gray-600">Operating Cash Flow</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded">
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(metrics.cashFlow.investingCashFlow)}
            </div>
            <div className="text-sm text-gray-600">Investing Cash Flow</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded">
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(metrics.cashFlow.financingCashFlow)}
            </div>
            <div className="text-sm text-gray-600">Financing Cash Flow</div>
          </div>
        </div>
      </div>

      {/* Top Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Revenue Sources</h3>
          <div className="space-y-2">
            {metrics.breakdown.topRevenueSources.slice(0, 5).map((source, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                <span className="text-sm font-medium capitalize">{source.category.replace('_', ' ')}</span>
                <span className="text-sm font-semibold text-green-600">{formatCurrency(source.amount)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Expense Categories</h3>
          <div className="space-y-2">
            {metrics.breakdown.topExpenseCategories.slice(0, 5).map((category, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded">
                <span className="text-sm font-medium capitalize">{category.category.replace('_', ' ')}</span>
                <span className="text-sm font-semibold text-red-600">{formatCurrency(category.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Financial Insights */}
      {metrics.insights.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Insights</h2>
          <div className="space-y-3">
            {metrics.insights.map((insight, index) => (
              <div key={index} className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                <p className="text-sm text-blue-800">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report Generation */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Generate Financial Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => generateReport('profit_loss')}
            className="bg-blue-500 text-white px-4 py-3 rounded hover:bg-blue-600 text-sm font-medium"
          >
            Profit & Loss Report
          </button>
          <button
            onClick={() => generateReport('balance_sheet')}
            className="bg-green-500 text-white px-4 py-3 rounded hover:bg-green-600 text-sm font-medium"
          >
            Balance Sheet Report
          </button>
          <button
            onClick={() => generateReport('cash_flow')}
            className="bg-purple-500 text-white px-4 py-3 rounded hover:bg-purple-600 text-sm font-medium"
          >
            Cash Flow Report
          </button>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Reports will be generated for the selected timeframe and downloaded automatically.
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Financial Data</h3>
        <div className="flex space-x-4">
          <button
            onClick={() => {/* Export to Excel */}}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
          >
            Export to Excel
          </button>
          <button
            onClick={() => {/* Export to PDF */}}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm"
          >
            Export to PDF
          </button>
          <button
            onClick={() => {/* Export to QuickBooks */}}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 text-sm"
          >
            Export to QuickBooks
          </button>
        </div>
      </div>
    </div>
  );
}