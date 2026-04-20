'use client';

import { useState, useEffect } from 'react';
import InteractiveChart from '@/features/bi/visualization/InteractiveChart';

interface DataVisualizationProps {
  tenantId?: string;
}

export default function DataVisualization({ tenantId = 'default' }: DataVisualizationProps) {
  const [sampleData, setSampleData] = useState<any>({});
  const [selectedChart, setSelectedChart] = useState<string>('revenue');

  useEffect(() => {
    // Generate sample data for demonstration
    const generateSampleData = () => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      return {
        revenue: {
          labels: months,
          datasets: [{
            name: 'Revenue',
            data: months.map(() => Math.floor(Math.random() * 100000) + 50000),
            color: '#10B981'
          }]
        },
        expenses: {
          labels: months,
          datasets: [{
            name: 'Operating Expenses',
            data: months.map(() => Math.floor(Math.random() * 50000) + 20000),
            color: '#EF4444'
          }, {
            name: 'Capital Expenses',
            data: months.map(() => Math.floor(Math.random() * 20000) + 5000),
            color: '#F59E0B'
          }]
        },
        users: {
          labels: months,
          datasets: [{
            name: 'Active Users',
            data: months.map(() => Math.floor(Math.random() * 1000) + 500),
            color: '#3B82F6'
          }]
        },
        conversion: {
          labels: ['Website Visits', 'Leads Generated', 'Qualified Leads', 'Proposals Sent', 'Deals Closed'],
          datasets: [{
            name: 'Conversion Funnel',
            data: [10000, 2500, 800, 120, 45],
            color: '#8B5CF6'
          }]
        }
      };
    };

    setSampleData(generateSampleData());
  }, []);

  const getChartConfig = (chartType: string) => {
    switch (chartType) {
      case 'revenue':
        return {
          title: 'Monthly Revenue Trend',
          data: sampleData.revenue,
          chartType: 'area' as const,
          height: 400
        };
      case 'expenses':
        return {
          title: 'Monthly Expense Breakdown',
          data: sampleData.expenses,
          chartType: 'bar' as const,
          height: 400
        };
      case 'users':
        return {
          title: 'User Growth Over Time',
          data: sampleData.users,
          chartType: 'line' as const,
          height: 400
        };
      case 'conversion':
        return {
          title: 'Sales Conversion Funnel',
          data: sampleData.conversion,
          chartType: 'bar' as const,
          height: 400
        };
      default:
        return {
          title: 'Revenue Chart',
          data: sampleData.revenue,
          chartType: 'line' as const,
          height: 400
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Interactive Data Visualization</h2>
        <div className="flex space-x-4">
          <select
            value={selectedChart}
            onChange={(e) => setSelectedChart(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="revenue">Revenue Analysis</option>
            <option value="expenses">Expense Breakdown</option>
            <option value="users">User Analytics</option>
            <option value="conversion">Conversion Funnel</option>
          </select>
          <button
            onClick={() => setSampleData({...sampleData})}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Chart Display */}
      {sampleData && (
        <InteractiveChart
          {...getChartConfig(selectedChart)}
          showLegend={true}
          showGrid={true}
          interactive={true}
        />
      )}

      {/* Chart Type Examples */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Supported Chart Types</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm">Line Charts - Trend analysis over time</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm">Area Charts - Cumulative data visualization</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <span className="text-sm">Bar Charts - Comparative data analysis</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-sm">Pie Charts - Proportion representation</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Interactive Features</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Hover for detailed tooltips</span>
            </div>
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Click data points for focus</span>
            </div>
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Export charts in multiple formats</span>
            </div>
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Responsive design for all devices</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Chart Gallery */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Chart Gallery - Click to Preview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sampleData && Object.entries(sampleData).map(([key, data]: [string, any]) => (
            <button
              key={key}
              onClick={() => setSelectedChart(key)}
              className={`p-4 border-2 rounded-lg transition-all ${
                selectedChart === key
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div className="text-sm font-medium capitalize mb-2">{key.replace('_', ' ')}</div>
                <div className="text-xs text-gray-500">
                  {data.labels.length} data points
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}