'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface ChartData {
  labels: string[];
  datasets: {
    name: string;
    data: number[];
    color?: string;
  }[];
}

interface InteractiveChartProps {
  title: string;
  data: ChartData;
  chartType: 'line' | 'area' | 'bar' | 'pie' | 'doughnut';
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  interactive?: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function InteractiveChart({
  title,
  data,
  chartType,
  height = 300,
  showLegend = true,
  showGrid = true,
  interactive = true
}: InteractiveChartProps) {
  const [selectedDataPoint, setSelectedDataPoint] = useState<any>(null);
  const [hoveredData, setHoveredData] = useState<any>(null);

  // Transform data for Recharts
  const transformedData = data.labels.map((label, index) => {
    const dataPoint: any = { name: label };
    data.datasets.forEach(dataset => {
      dataPoint[dataset.name] = dataset.data[index];
    });
    return dataPoint;
  });

  const handleMouseEnter = (data: any, index: number) => {
    if (interactive) {
      setHoveredData({ data, index });
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoveredData(null);
    }
  };

  const handleClick = (data: any) => {
    if (interactive) {
      setSelectedDataPoint(data);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <LineChart data={transformedData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            {data.datasets.map((dataset, index) => (
              <Line
                key={dataset.name}
                type="monotone"
                dataKey={dataset.name}
                stroke={dataset.color || COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart data={transformedData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            {data.datasets.map((dataset, index) => (
              <Area
                key={dataset.name}
                type="monotone"
                dataKey={dataset.name}
                stackId="1"
                stroke={dataset.color || COLORS[index % COLORS.length]}
                fill={dataset.color || COLORS[index % COLORS.length]}
                fillOpacity={0.6}
              />
            ))}
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart data={transformedData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            {data.datasets.map((dataset, index) => (
              <Bar
                key={dataset.name}
                dataKey={dataset.name}
                fill={dataset.color || COLORS[index % COLORS.length]}
                radius={[2, 2, 0, 0]}
              />
            ))}
          </BarChart>
        );

      case 'pie':
      case 'doughnut':
        const pieData = data.labels.map((label, index) => ({
          name: label,
          value: data.datasets[0]?.data[index] || 0
        }));

        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              outerRadius={chartType === 'doughnut' ? 80 : 100}
              innerRadius={chartType === 'doughnut' ? 40 : 0}
              fill="#8884d8"
              dataKey="value"
              onClick={handleClick}
              style={{ cursor: interactive ? 'pointer' : 'default' }}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            {showLegend && <Legend />}
          </PieChart>
        );

      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {interactive && (
          <div className="flex space-x-2">
            <button
              onClick={() => {/* Export chart */}}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Export
            </button>
            <button
              onClick={() => {/* Toggle fullscreen */}}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Fullscreen
            </button>
          </div>
        )}
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {hoveredData && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            <strong>{hoveredData.data.name}:</strong>
            {Object.entries(hoveredData.data).map(([key, value]: [string, any]) => {
              if (key !== 'name') {
                return ` ${key}: ${value}`;
              }
              return null;
            }).filter(Boolean).join(', ')}
          </p>
        </div>
      )}

      {selectedDataPoint && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
          <p className="text-sm text-green-800">
            <strong>Selected:</strong> {selectedDataPoint.name}
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            {Object.entries(selectedDataPoint).map(([key, value]: [string, any]) => {
              if (key !== 'name') {
                return (
                  <div key={key}>
                    <span className="font-medium">{key}:</span> {value}
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}

      {interactive && (
        <div className="mt-4 text-xs text-gray-500">
          Click on data points for details • Hover for quick preview
        </div>
      )}
    </div>
  );
}