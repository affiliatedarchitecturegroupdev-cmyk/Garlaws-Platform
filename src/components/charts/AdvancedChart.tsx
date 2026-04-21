'use client';

import React, { useState, useRef, useCallback } from 'react';
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
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Treemap,
  Sankey,
  Brush,
  ReferenceLine,
} from 'recharts';
import { cn } from '@/lib/utils';
import { AnimatedButton } from '@/components/animations';
import {
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Settings,
  Filter,
  Eye,
  EyeOff,
  Maximize2,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Activity,
} from 'lucide-react';

// Advanced chart configuration
interface ChartConfig {
  type: 'line' | 'area' | 'bar' | 'pie' | 'scatter' | 'radar' | 'composed' | 'treemap' | 'sankey';
  data: any[];
  xAxis?: string;
  yAxis?: string[];
  colors?: string[];
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  showBrush?: boolean;
  animation?: boolean;
  height?: number;
  title?: string;
  description?: string;
}

interface AdvancedChartProps {
  config: ChartConfig;
  className?: string;
  interactive?: boolean;
  exportable?: boolean;
  zoomable?: boolean;
  filterable?: boolean;
}

const AdvancedChart: React.FC<AdvancedChartProps> = ({
  config,
  className,
  interactive = true,
  exportable = true,
  zoomable = true,
  filterable = true,
}) => {
  const colors = config.colors || [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
    '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'
  ];

  const [zoomed, setZoomed] = useState(false);
  const [visibleSeries, setVisibleSeries] = useState<Set<string>>(
    new Set(config.yAxis || [])
  );
  const [filters, setFilters] = useState<Record<string, any>>({});
  const chartRef = useRef<HTMLDivElement>(null);

  // Initialize visible series
  React.useEffect(() => {
    if (config.yAxis) {
      setVisibleSeries(new Set(config.yAxis));
    }
  }, [config.yAxis]);

  const toggleSeries = useCallback((seriesName: string) => {
    setVisibleSeries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(seriesName)) {
        newSet.delete(seriesName);
      } else {
        newSet.add(seriesName);
      }
      return newSet;
    });
  }, []);

  const handleExport = useCallback(async (format: 'png' | 'svg' | 'csv' | 'json') => {
    if (!chartRef.current) return;

    switch (format) {
      case 'png':
        // Use html2canvas or similar for PNG export
        console.log('Exporting as PNG...');
        break;
      case 'svg':
        // Export SVG content
        console.log('Exporting as SVG...');
        break;
      case 'csv':
        // Convert data to CSV
        const csvContent = [
          Object.keys(config.data[0] || {}).join(','),
          ...config.data.map(row => Object.values(row).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${config.title || 'chart'}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        break;
      case 'json':
        const jsonContent = JSON.stringify(config.data, null, 2);
        const jsonBlob = new Blob([jsonContent], { type: 'application/json' });
        const jsonUrl = URL.createObjectURL(jsonBlob);
        const jsonA = document.createElement('a');
        jsonA.href = jsonUrl;
        jsonA.download = `${config.title || 'chart'}.json`;
        document.body.appendChild(jsonA);
        jsonA.click();
        document.body.removeChild(jsonA);
        URL.revokeObjectURL(jsonUrl);
        break;
    }
  }, [config]);

  const renderChart = () => {
    const commonProps = {
      data: config.data,
      margin: { top: 20, right: 30, left: 20, bottom: 5 },
    };

    switch (config.type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={config.xAxis || 'name'} />
            <YAxis />
            {config.showTooltip && <Tooltip />}
            {config.showLegend && <Legend />}
            {config.showBrush && <Brush />}
            {config.yAxis?.map((axis, index) =>
              visibleSeries.has(axis) && (
                <Line
                  key={axis}
                  type="monotone"
                  dataKey={axis}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={{ fill: colors[index % colors.length], strokeWidth: 2 }}
                  activeDot={{ r: 6, stroke: colors[index % colors.length], strokeWidth: 2 }}
                />
              )
            )}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={config.xAxis || 'name'} />
            <YAxis />
            {config.showTooltip && <Tooltip />}
            {config.showLegend && <Legend />}
            {config.showBrush && <Brush />}
            {config.yAxis?.map((axis, index) =>
              visibleSeries.has(axis) && (
                <Area
                  key={axis}
                  type="monotone"
                  dataKey={axis}
                  stackId="1"
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                  fillOpacity={0.6}
                />
              )
            )}
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={config.xAxis || 'name'} />
            <YAxis />
            {config.showTooltip && <Tooltip />}
            {config.showLegend && <Legend />}
            {config.showBrush && <Brush />}
            {config.yAxis?.map((axis, index) =>
              visibleSeries.has(axis) && (
                <Bar
                  key={axis}
                  dataKey={axis}
                  fill={colors[index % colors.length]}
                  radius={[2, 2, 0, 0]}
                />
              )
            )}
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={config.data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey={config.yAxis?.[0] || 'value'}
            >
              {config.data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            {config.showTooltip && <Tooltip />}
            {config.showLegend && <Legend />}
          </PieChart>
        );

      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={config.xAxis || 'x'} type="number" />
            <YAxis dataKey={config.yAxis?.[0] || 'y'} type="number" />
            {config.showTooltip && <Tooltip />}
            {config.showLegend && <Legend />}
            <Scatter
              name={config.yAxis?.[0] || 'Data'}
              data={config.data}
              fill={colors[0]}
            />
          </ScatterChart>
        );

      case 'radar':
        return (
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={config.data}>
            <PolarGrid />
            <PolarAngleAxis dataKey={config.xAxis || 'subject'} />
            <PolarRadiusAxis />
            {config.yAxis?.map((axis, index) =>
              visibleSeries.has(axis) && (
                <Radar
                  key={axis}
                  name={axis}
                  dataKey={axis}
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                  fillOpacity={0.3}
                />
              )
            )}
            {config.showTooltip && <Tooltip />}
            {config.showLegend && <Legend />}
          </RadarChart>
        );

      case 'composed':
        return (
          <ComposedChart {...commonProps}>
            {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={config.xAxis || 'name'} />
            <YAxis />
            {config.showTooltip && <Tooltip />}
            {config.showLegend && <Legend />}
            {config.showBrush && <Brush />}
            {/* Mix of different chart types */}
            <Bar dataKey={config.yAxis?.[0] || 'bar'} fill={colors[0]} />
            <Line
              type="monotone"
              dataKey={config.yAxis?.[1] || 'line'}
              stroke={colors[1]}
              strokeWidth={2}
            />
          </ComposedChart>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Chart type "{config.type}" not implemented
          </div>
        );
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Chart Header */}
      {(config.title || config.description || interactive) && (
        <div className="flex items-center justify-between">
          <div>
            {config.title && <h3 className="text-lg font-semibold">{config.title}</h3>}
            {config.description && (
              <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
            )}
          </div>

          {/* Interactive Controls */}
          {interactive && (
            <div className="flex items-center space-x-2">
              {/* Series Toggle */}
              {filterable && config.yAxis && config.yAxis.length > 1 && (
                <div className="flex items-center space-x-1">
                  {config.yAxis.map((axis, index) => (
                    <button
                      key={axis}
                      onClick={() => toggleSeries(axis)}
                      className={cn(
                        'flex items-center space-x-1 px-2 py-1 text-xs rounded-md transition-colors',
                        visibleSeries.has(axis)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      )}
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: visibleSeries.has(axis) ? colors[index % colors.length] : '#9ca3af' }}
                      />
                      <span>{axis}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Zoom Controls */}
              {zoomable && (
                <div className="flex items-center space-x-1">
                  <AnimatedButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setZoomed(!zoomed)}
                    animation="scale"
                  >
                    <Maximize2 size={14} />
                  </AnimatedButton>
                </div>
              )}

              {/* Export Options */}
              {exportable && (
                <div className="flex items-center space-x-1">
                  <AnimatedButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleExport('png')}
                    animation="scale"
                  >
                    <Download size={14} />
                  </AnimatedButton>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Chart Container */}
      <div
        ref={chartRef}
        className={cn(
          'bg-card border border-border rounded-lg p-4',
          zoomed && 'fixed inset-4 z-50 bg-background'
        )}
        style={{ height: config.height || 400 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>

        {/* Zoom Overlay */}
        {zoomed && (
          <div className="absolute top-4 right-4">
            <AnimatedButton
              variant="secondary"
              size="sm"
              onClick={() => setZoomed(false)}
              animation="scale"
            >
              <RotateCcw size={14} className="mr-1" />
              Exit Fullscreen
            </AnimatedButton>
          </div>
        )}
      </div>

      {/* Chart Insights */}
      {interactive && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <TrendingUp size={16} className="text-green-500" />
              <span className="font-medium">Peak Value</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {Math.max(...config.data.map(d => d[config.yAxis?.[0] || 'value'] || 0))}
            </div>
          </div>

          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <Activity size={16} className="text-blue-500" />
              <span className="font-medium">Average</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {Math.round(
                config.data.reduce((sum, d) => sum + (d[config.yAxis?.[0] || 'value'] || 0), 0) / config.data.length
              )}
            </div>
          </div>

          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <BarChart3 size={16} className="text-purple-500" />
              <span className="font-medium">Data Points</span>
            </div>
            <div className="text-2xl font-bold mt-1">{config.data.length}</div>
          </div>
        </div>
      )}
    </div>
  );
};

// Chart preset configurations
export const chartPresets = {
  salesTrend: {
    type: 'area' as const,
    title: 'Sales Trend',
    description: 'Monthly sales performance over time',
    xAxis: 'month',
    yAxis: ['sales', 'target'],
    colors: ['#10b981', '#ef4444'],
    showGrid: true,
    showLegend: true,
    showTooltip: true,
    showBrush: true,
    height: 400,
  },

  userEngagement: {
    type: 'composed' as const,
    title: 'User Engagement',
    description: 'User activity and conversion metrics',
    xAxis: 'date',
    yAxis: ['activeUsers', 'conversions'],
    colors: ['#3b82f6', '#f59e0b'],
    showGrid: true,
    showLegend: true,
    showTooltip: true,
    height: 400,
  },

  marketShare: {
    type: 'pie' as const,
    title: 'Market Share',
    description: 'Competitive market position',
    yAxis: ['share'],
    colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
    showLegend: true,
    showTooltip: true,
    height: 400,
  },

  performanceMetrics: {
    type: 'radar' as const,
    title: 'Performance Metrics',
    description: 'Multi-dimensional performance analysis',
    xAxis: 'metric',
    yAxis: ['current', 'target', 'benchmark'],
    colors: ['#3b82f6', '#10b981', '#f59e0b'],
    showLegend: true,
    showTooltip: true,
    height: 400,
  },

  correlationAnalysis: {
    type: 'scatter' as const,
    title: 'Correlation Analysis',
    description: 'Relationship between variables',
    xAxis: 'x',
    yAxis: ['y'],
    colors: ['#3b82f6'],
    showGrid: true,
    showTooltip: true,
    height: 400,
  },
};

// Utility function to generate sample data
export const generateSampleData = (type: keyof typeof chartPresets, count = 12) => {
  const preset = chartPresets[type];

  switch (type) {
    case 'salesTrend':
      return Array.from({ length: count }, (_, i) => ({
        month: `Month ${i + 1}`,
        sales: Math.floor(Math.random() * 50000) + 30000,
        target: 45000,
      }));

    case 'userEngagement':
      return Array.from({ length: count }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
        activeUsers: Math.floor(Math.random() * 5000) + 2000,
        conversions: Math.floor(Math.random() * 500) + 100,
      }));

    case 'marketShare':
      return [
        { name: 'Product A', share: 35 },
        { name: 'Product B', share: 28 },
        { name: 'Product C', share: 20 },
        { name: 'Product D', share: 12 },
        { name: 'Others', share: 5 },
      ];

    case 'performanceMetrics':
      return [
        { metric: 'Speed', current: 85, target: 90, benchmark: 80 },
        { metric: 'Quality', current: 92, target: 95, benchmark: 88 },
        { metric: 'Efficiency', current: 78, target: 85, benchmark: 82 },
        { metric: 'Reliability', current: 96, target: 98, benchmark: 94 },
        { metric: 'Usability', current: 88, target: 92, benchmark: 85 },
      ];

    case 'correlationAnalysis':
      return Array.from({ length: count }, (_, i) => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
      }));

    default:
      return [];
  }
};

export { AdvancedChart, type ChartConfig };
export default AdvancedChart;