'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
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
} from 'recharts';
import {
  MoreVertical,
  RefreshCw,
  Settings,
  Download,
  Maximize2,
  Minimize2,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
} from 'lucide-react';
import { AnimatedButton, AnimatedCard } from '@/components/animations';

// Dashboard Widget Base Interface
export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  description?: string;
  position: { x: number; y: number; w: number; h: number };
  data?: any;
  config?: WidgetConfig;
  isLoading?: boolean;
  lastUpdated?: Date;
  refreshInterval?: number;
}

// Widget Types
export type WidgetType =
  | 'metric'
  | 'line-chart'
  | 'bar-chart'
  | 'area-chart'
  | 'pie-chart'
  | 'scatter-chart'
  | 'radar-chart'
  | 'composed-chart'
  | 'treemap'
  | 'status-indicator'
  | 'alert-panel'
  | 'table'
  | 'kpi-summary';

// Widget Configuration
export interface WidgetConfig {
  colors?: string[];
  showLegend?: boolean;
  showTooltip?: boolean;
  animation?: boolean;
  timeRange?: string;
  filters?: Record<string, any>;
  thresholds?: {
    warning: number;
    critical: number;
  };
}

// Dashboard Grid System
interface GridLayoutProps {
  widgets: DashboardWidget[];
  onWidgetUpdate: (widgetId: string, updates: Partial<DashboardWidget>) => void;
  onWidgetRemove: (widgetId: string) => void;
  isEditing?: boolean;
  className?: string;
}

const GRID_COLS = 12;
const GRID_ROWS = 12;

const GridLayout: React.FC<GridLayoutProps> = ({
  widgets,
  onWidgetUpdate,
  onWidgetRemove,
  isEditing = false,
  className,
}) => {
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleDragStart = useCallback((widgetId: string, event: React.DragEvent) => {
    setDraggedWidget(widgetId);
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedWidget(null);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (!draggedWidget) return;

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const gridRect = rect.getBoundingClientRect();
    const cellWidth = gridRect.width / GRID_COLS;
    const cellHeight = gridRect.height / GRID_ROWS;

    const x = Math.floor((event.clientX - gridRect.left) / cellWidth);
    const y = Math.floor((event.clientY - gridRect.top) / cellHeight);

    const widget = widgets.find(w => w.id === draggedWidget);
    if (widget) {
      onWidgetUpdate(draggedWidget, {
        position: {
          ...widget.position,
          x: Math.max(0, Math.min(GRID_COLS - widget.position.w, x)),
          y: Math.max(0, Math.min(GRID_ROWS - widget.position.h, y)),
        },
      });
    }

    setDraggedWidget(null);
  }, [draggedWidget, widgets, onWidgetUpdate]);

  return (
    <div
      className={cn(
        'relative grid grid-cols-12 grid-rows-12 gap-4 min-h-screen p-4',
        isEditing && 'bg-muted/20 rounded-lg',
        className
      )}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {widgets.map((widget) => (
        <WidgetRenderer
          key={widget.id}
          widget={widget}
          isEditing={isEditing}
          isDragging={draggedWidget === widget.id}
          onUpdate={(updates) => onWidgetUpdate(widget.id, updates)}
          onRemove={() => onWidgetRemove(widget.id)}
          onDragStart={(e) => handleDragStart(widget.id, e)}
          onDragEnd={handleDragEnd}
        />
      ))}
    </div>
  );
};

// Widget Renderer Component
interface WidgetRendererProps {
  widget: DashboardWidget;
  isEditing: boolean;
  isDragging: boolean;
  onUpdate: (updates: Partial<DashboardWidget>) => void;
  onRemove: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

const WidgetRenderer: React.FC<WidgetRendererProps> = ({
  widget,
  isEditing,
  isDragging,
  onUpdate,
  onRemove,
  onDragStart,
  onDragEnd,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const style = {
    gridColumn: `${widget.position.x + 1} / span ${widget.position.w}`,
    gridRow: `${widget.position.y + 1} / span ${widget.position.h}`,
  };

  const handleRefresh = () => {
    onUpdate({ lastUpdated: new Date() });
  };

  return (
    <div
      style={style}
      className={cn(
        'relative group',
        isDragging && 'opacity-50 z-50',
        isEditing && 'cursor-move'
      )}
      draggable={isEditing}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <AnimatedCard
        variant="elevated"
        hover={isEditing ? 'none' : 'lift'}
        className={cn(
          'h-full flex flex-col',
          isExpanded && 'fixed inset-4 z-50'
        )}
      >
        {/* Widget Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{widget.title}</h3>
            {widget.description && (
              <p className="text-sm text-muted-foreground mt-1">{widget.description}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {widget.lastUpdated && (
              <span className="text-xs text-muted-foreground">
                {widget.lastUpdated.toLocaleTimeString()}
              </span>
            )}

            <AnimatedButton
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              animation="spin"
              disabled={widget.isLoading}
            >
              <RefreshCw size={16} className={widget.isLoading ? 'animate-spin' : ''} />
            </AnimatedButton>

            <AnimatedButton
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              animation="scale"
            >
              {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </AnimatedButton>

            {isEditing && (
              <AnimatedButton
                variant="ghost"
                size="icon"
                onClick={onRemove}
                animation="scale"
                className="text-destructive hover:text-destructive"
              >
                <X size={16} />
              </AnimatedButton>
            )}
          </div>
        </div>

        {/* Widget Content */}
        <div className="flex-1 p-4 overflow-hidden">
          <WidgetContent widget={widget} />
        </div>
      </AnimatedCard>
    </div>
  );
};

// Widget Content Renderer
const WidgetContent: React.FC<{ widget: DashboardWidget }> = ({ widget }) => {
  switch (widget.type) {
    case 'metric':
      return <MetricWidget data={widget.data} config={widget.config} />;
    case 'line-chart':
      return <ChartWidget type="line" data={widget.data} config={widget.config} />;
    case 'bar-chart':
      return <ChartWidget type="bar" data={widget.data} config={widget.config} />;
    case 'area-chart':
      return <ChartWidget type="area" data={widget.data} config={widget.config} />;
    case 'pie-chart':
      return <ChartWidget type="pie" data={widget.data} config={widget.config} />;
    case 'scatter-chart':
      return <ChartWidget type="scatter" data={widget.data} config={widget.config} />;
    case 'radar-chart':
      return <ChartWidget type="radar" data={widget.data} config={widget.config} />;
    case 'status-indicator':
      return <StatusIndicatorWidget data={widget.data} config={widget.config} />;
    case 'alert-panel':
      return <AlertPanelWidget data={widget.data} config={widget.config} />;
    default:
      return <div className="flex items-center justify-center h-full text-muted-foreground">
        Widget type not implemented
      </div>;
  }
};

// Metric Widget
const MetricWidget: React.FC<{ data?: any; config?: WidgetConfig }> = ({ data, config }) => {
  if (!data) return <div>No data available</div>;

  const { value, label, trend, trendValue, unit } = data;
  const thresholds = config?.thresholds;

  const getStatusColor = (value: number) => {
    if (!thresholds) return 'text-foreground';
    if (value >= thresholds.critical) return 'text-destructive';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className={cn('text-4xl font-bold', getStatusColor(value))}>
        {value}{unit && ` ${unit}`}
      </div>
      {label && <div className="text-sm text-muted-foreground mt-2">{label}</div>}
      {trend && trendValue && (
        <div className={cn(
          'flex items-center mt-2 text-sm font-medium',
          trend === 'up' && 'text-green-600',
          trend === 'down' && 'text-red-600',
          trend === 'neutral' && 'text-muted-foreground'
        )}>
          {trend === 'up' && <TrendingUp size={16} className="mr-1" />}
          {trend === 'down' && <TrendingDown size={16} className="mr-1" />}
          {trend === 'neutral' && <Minus size={16} className="mr-1" />}
          {Math.abs(trendValue)}%
        </div>
      )}
    </div>
  );
};

// Chart Widget
const ChartWidget: React.FC<{
  type: 'line' | 'bar' | 'area' | 'pie' | 'scatter' | 'radar';
  data?: any[];
  config?: WidgetConfig;
}> = ({ type, data, config }) => {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">
      No chart data available
    </div>;
  }

  const colors = config?.colors || ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            {config?.showLegend && <Legend />}
            <Line
              type="monotone"
              dataKey="value"
              stroke={colors[0]}
              strokeWidth={2}
              dot={{ fill: colors[0] }}
            />
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            {config?.showLegend && <Legend />}
            <Bar dataKey="value" fill={colors[0]} />
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            {config?.showLegend && <Legend />}
            <Area
              type="monotone"
              dataKey="value"
              stroke={colors[0]}
              fill={colors[0]}
              fillOpacity={0.3}
            />
          </AreaChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        );

      default:
        return <div>Chart type not implemented</div>;
    }
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      {renderChart()}
    </ResponsiveContainer>
  );
};

// Status Indicator Widget
const StatusIndicatorWidget: React.FC<{ data?: any; config?: WidgetConfig }> = ({ data, config }) => {
  if (!data) return <div>No status data available</div>;

  const { status, message, details } = data;

  const statusConfig = {
    healthy: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
    warning: { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    error: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
    info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-100' },
  };

  const configItem = statusConfig[status as keyof typeof statusConfig] || statusConfig.info;
  const IconComponent = configItem.icon;

  return (
    <div className="flex items-center space-x-3 p-4">
      <div className={cn('p-2 rounded-full', configItem.bg)}>
        <IconComponent size={24} className={configItem.color} />
      </div>
      <div className="flex-1">
        <div className="font-medium text-foreground">{message}</div>
        {details && <div className="text-sm text-muted-foreground mt-1">{details}</div>}
      </div>
    </div>
  );
};

// Alert Panel Widget
const AlertPanelWidget: React.FC<{ data?: any[]; config?: WidgetConfig }> = ({ data, config }) => {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">
      No alerts
    </div>;
  }

  return (
    <div className="space-y-2 max-h-full overflow-y-auto">
      {data.map((alert, index) => (
        <div
          key={index}
          className={cn(
            'flex items-start space-x-3 p-3 rounded-lg border',
            alert.severity === 'critical' && 'border-red-200 bg-red-50',
            alert.severity === 'high' && 'border-orange-200 bg-orange-50',
            alert.severity === 'medium' && 'border-yellow-200 bg-yellow-50',
            alert.severity === 'low' && 'border-blue-200 bg-blue-50'
          )}
        >
          <div className="flex-shrink-0 mt-0.5">
            {alert.severity === 'critical' && <XCircle size={16} className="text-red-600" />}
            {alert.severity === 'high' && <AlertTriangle size={16} className="text-orange-600" />}
            {alert.severity === 'medium' && <AlertTriangle size={16} className="text-yellow-600" />}
            {alert.severity === 'low' && <Info size={16} className="text-blue-600" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-foreground">{alert.title}</div>
            <div className="text-sm text-muted-foreground mt-1">{alert.message}</div>
            <div className="text-xs text-muted-foreground mt-2">
              {new Date(alert.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export {
  GridLayout,
  type DashboardWidget,
  type WidgetType,
  type WidgetConfig,
};