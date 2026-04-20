'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { GridLayout, DashboardWidget, WidgetType } from '@/components/dashboard';
import { AnimatedButton } from '@/components/animations';
import {
  Plus,
  Settings,
  Download,
  Share,
  Edit3,
  Eye,
  BarChart3,
  PieChart,
  TrendingUp,
  Activity,
  AlertCircle,
  Users,
  DollarSign,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Predefined widget templates
const WIDGET_TEMPLATES: Record<string, Omit<DashboardWidget, 'id' | 'position'>> = {
  'revenue-metric': {
    type: 'metric',
    title: 'Total Revenue',
    description: 'Monthly recurring revenue',
    data: { value: 125430, unit: 'ZAR', label: 'This month', trend: 'up', trendValue: 12.5 },
    refreshInterval: 30000,
  },
  'users-metric': {
    type: 'metric',
    title: 'Active Users',
    description: 'Currently online users',
    data: { value: 2847, label: 'Active now', trend: 'up', trendValue: 8.2 },
    refreshInterval: 15000,
  },
  'conversion-chart': {
    type: 'line-chart',
    title: 'Conversion Funnel',
    description: 'User journey conversion rates',
    data: [
      { name: 'Visits', value: 12000 },
      { name: 'Signups', value: 2400 },
      { name: 'Trials', value: 1800 },
      { name: 'Conversions', value: 720 },
    ],
    config: { colors: ['#3b82f6'], showLegend: false },
    refreshInterval: 60000,
  },
  'revenue-trend': {
    type: 'area-chart',
    title: 'Revenue Trend',
    description: 'Monthly revenue over time',
    data: [
      { name: 'Jan', value: 95000 },
      { name: 'Feb', value: 102000 },
      { name: 'Mar', value: 118000 },
      { name: 'Apr', value: 125430 },
    ],
    config: { colors: ['#10b981'], showLegend: false },
    refreshInterval: 300000,
  },
  'status-overview': {
    type: 'status-indicator',
    title: 'System Status',
    data: { status: 'healthy', message: 'All systems operational', details: '99.9% uptime this month' },
    refreshInterval: 30000,
  },
  'alerts-panel': {
    type: 'alert-panel',
    title: 'Active Alerts',
    data: [
      {
        severity: 'high',
        title: 'High CPU Usage',
        message: 'Server CPU usage above 85% for 5 minutes',
        timestamp: new Date(Date.now() - 300000).toISOString(),
      },
      {
        severity: 'medium',
        title: 'Slow API Response',
        message: 'API response time increased by 25%',
        timestamp: new Date(Date.now() - 900000).toISOString(),
      },
    ],
    refreshInterval: 30000,
  },
};

interface DashboardProps {
  title?: string;
  description?: string;
  initialWidgets?: DashboardWidget[];
  onSave?: (widgets: DashboardWidget[]) => void;
  onExport?: (widgets: DashboardWidget[]) => void;
  className?: string;
}

const RealtimeDashboard: React.FC<DashboardProps> = ({
  title = 'Dashboard',
  description,
  initialWidgets = [],
  onSave,
  onExport,
  className,
}) => {
  const [widgets, setWidgets] = useState<DashboardWidget[]>(initialWidgets);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  // Initialize with default widgets if none provided
  useEffect(() => {
    if (initialWidgets.length === 0) {
      const defaultWidgets: DashboardWidget[] = [
        {
          id: 'revenue-1',
          ...WIDGET_TEMPLATES['revenue-metric'],
          position: { x: 0, y: 0, w: 3, h: 2 },
        },
        {
          id: 'users-1',
          ...WIDGET_TEMPLATES['users-metric'],
          position: { x: 3, y: 0, w: 3, h: 2 },
        },
        {
          id: 'conversion-1',
          ...WIDGET_TEMPLATES['conversion-chart'],
          position: { x: 6, y: 0, w: 6, h: 4 },
        },
        {
          id: 'status-1',
          ...WIDGET_TEMPLATES['status-overview'],
          position: { x: 0, y: 2, w: 6, h: 2 },
        },
        {
          id: 'alerts-1',
          ...WIDGET_TEMPLATES['alerts-panel'],
          position: { x: 6, y: 4, w: 6, h: 4 },
        },
      ];
      setWidgets(defaultWidgets);
    }
  }, [initialWidgets]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setWidgets(currentWidgets =>
        currentWidgets.map(widget => {
          if (widget.refreshInterval && Date.now() - (widget.lastUpdated?.getTime() || 0) > widget.refreshInterval) {
            // Simulate data updates
            if (widget.type === 'metric' && widget.data) {
              const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
              return {
                ...widget,
                data: {
                  ...widget.data,
                  value: Math.round(widget.data.value * (1 + variation)),
                },
                lastUpdated: new Date(),
              };
            }
          }
          return widget;
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleWidgetUpdate = useCallback((widgetId: string, updates: Partial<DashboardWidget>) => {
    setWidgets(current =>
      current.map(widget =>
        widget.id === widgetId ? { ...widget, ...updates } : widget
      )
    );
  }, []);

  const handleWidgetRemove = useCallback((widgetId: string) => {
    setWidgets(current => current.filter(widget => widget.id !== widgetId));
  }, []);

  const handleAddWidget = useCallback(() => {
    if (!selectedTemplate) return;

    const template = WIDGET_TEMPLATES[selectedTemplate];
    if (!template) return;

    const newWidget: DashboardWidget = {
      id: `${selectedTemplate}-${Date.now()}`,
      ...template,
      position: { x: 0, y: 0, w: 4, h: 3 }, // Default position
    };

    setWidgets(current => [...current, newWidget]);
    setSelectedTemplate('');
  }, [selectedTemplate]);

  const handleExport = useCallback(() => {
    const dashboardData = {
      title,
      description,
      widgets,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };

    const blob = new Blob([JSON.stringify(dashboardData, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-dashboard.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    onExport?.(widgets);
  }, [widgets, title, description, onExport]);

  const templateOptions = Object.entries(WIDGET_TEMPLATES).map(([key, template]) => ({
    value: key,
    label: template.title,
    icon: getWidgetIcon(template.type),
  }));

  return (
    <div className={cn('space-y-6', className)}>
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {/* Add Widget */}
          <div className="flex items-center space-x-2">
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Add Widget...</option>
              {templateOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </option>
              ))}
            </select>
            <AnimatedButton
              onClick={handleAddWidget}
              disabled={!selectedTemplate}
              animation="scale"
            >
              <Plus size={16} className="mr-2" />
              Add
            </AnimatedButton>
          </div>

          {/* Actions */}
          <AnimatedButton
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
            animation="scale"
          >
            {isEditing ? <Eye size={16} className="mr-2" /> : <Edit3 size={16} className="mr-2" />}
            {isEditing ? 'Preview' : 'Edit'}
          </AnimatedButton>

          <AnimatedButton
            variant="outline"
            onClick={handleExport}
            animation="scale"
          >
            <Download size={16} className="mr-2" />
            Export
          </AnimatedButton>

          <AnimatedButton
            variant="outline"
            onClick={() => onSave?.(widgets)}
            animation="scale"
          >
            <Settings size={16} className="mr-2" />
            Save
          </AnimatedButton>
        </div>
      </div>

      {/* Edit Mode Indicator */}
      {isEditing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-blue-700">
            <Edit3 size={16} />
            <span className="font-medium">Edit Mode</span>
            <span className="text-sm text-blue-600">
              Drag widgets to reposition, use the X button to remove widgets
            </span>
          </div>
        </div>
      )}

      {/* Dashboard Grid */}
      <GridLayout
        widgets={widgets}
        onWidgetUpdate={handleWidgetUpdate}
        onWidgetRemove={handleWidgetRemove}
        isEditing={isEditing}
        className="min-h-screen"
      />
    </div>
  );
};

// Utility function to get widget icons
function getWidgetIcon(type: WidgetType): string {
  switch (type) {
    case 'metric': return '📊';
    case 'line-chart': return '📈';
    case 'bar-chart': return '📊';
    case 'area-chart': return '📊';
    case 'pie-chart': return '🥧';
    case 'scatter-chart': return '📍';
    case 'radar-chart': return '🕸️';
    case 'status-indicator': return '🟢';
    case 'alert-panel': return '🚨';
    case 'table': return '📋';
    case 'kpi-summary': return '📈';
    default: return '📊';
  }
}

// Dashboard statistics component
interface DashboardStatsProps {
  widgets: DashboardWidget[];
  className?: string;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ widgets, className }) => {
  const stats = {
    totalWidgets: widgets.length,
    chartWidgets: widgets.filter(w => w.type.includes('chart')).length,
    metricWidgets: widgets.filter(w => w.type === 'metric').length,
    alertWidgets: widgets.filter(w => w.type === 'alert-panel').length,
  };

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-4', className)}>
      <div className="bg-card p-4 rounded-lg border border-border">
        <div className="flex items-center space-x-2">
          <Activity size={20} className="text-blue-500" />
          <div>
            <div className="text-2xl font-bold">{stats.totalWidgets}</div>
            <div className="text-sm text-muted-foreground">Total Widgets</div>
          </div>
        </div>
      </div>

      <div className="bg-card p-4 rounded-lg border border-border">
        <div className="flex items-center space-x-2">
          <BarChart3 size={20} className="text-green-500" />
          <div>
            <div className="text-2xl font-bold">{stats.chartWidgets}</div>
            <div className="text-sm text-muted-foreground">Charts</div>
          </div>
        </div>
      </div>

      <div className="bg-card p-4 rounded-lg border border-border">
        <div className="flex items-center space-x-2">
          <TrendingUp size={20} className="text-purple-500" />
          <div>
            <div className="text-2xl font-bold">{stats.metricWidgets}</div>
            <div className="text-sm text-muted-foreground">Metrics</div>
          </div>
        </div>
      </div>

      <div className="bg-card p-4 rounded-lg border border-border">
        <div className="flex items-center space-x-2">
          <AlertCircle size={20} className="text-red-500" />
          <div>
            <div className="text-2xl font-bold">{stats.alertWidgets}</div>
            <div className="text-sm text-muted-foreground">Alerts</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { RealtimeDashboard, DashboardStats };
export default RealtimeDashboard;