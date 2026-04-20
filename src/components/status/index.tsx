'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { AnimatedButton, AnimatedCard } from '@/components/animations';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle as AlertIcon,
  Bell,
  BellOff,
  Settings,
  X,
  ExternalLink,
} from 'lucide-react';

export interface StatusItem {
  id: string;
  title: string;
  status: 'healthy' | 'warning' | 'error' | 'info' | 'unknown';
  message: string;
  details?: string;
  timestamp: Date;
  duration?: number;
  trend?: 'up' | 'down' | 'stable';
  value?: number;
  unit?: string;
  threshold?: {
    warning: number;
    critical: number;
  };
  actions?: StatusAction[];
  metadata?: Record<string, any>;
}

export interface StatusAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: React.ReactNode;
}

export interface AlertItem {
  id: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'system' | 'security' | 'performance' | 'business' | 'user';
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedAt?: Date;
  source: string;
  tags?: string[];
  actions?: StatusAction[];
  escalation?: {
    level: number;
    nextEscalation: Date;
    recipients: string[];
  };
}

// Status Indicator Component
interface StatusIndicatorProps {
  item: StatusItem;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  interactive?: boolean;
  className?: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  item,
  size = 'md',
  showDetails = true,
  interactive = true,
  className,
}) => {
  const [expanded, setExpanded] = useState(false);

  const statusConfig = {
    healthy: {
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-100',
      border: 'border-green-200',
      label: 'Healthy',
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
      border: 'border-yellow-200',
      label: 'Warning',
    },
    error: {
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-100',
      border: 'border-red-200',
      label: 'Error',
    },
    info: {
      icon: Info,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      border: 'border-blue-200',
      label: 'Info',
    },
    unknown: {
      icon: Clock,
      color: 'text-gray-600',
      bg: 'bg-gray-100',
      border: 'border-gray-200',
      label: 'Unknown',
    },
  };

  const config = statusConfig[item.status];
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'p-2 text-sm',
    md: 'p-3',
    lg: 'p-4 text-lg',
  };

  const getTrendIcon = () => {
    switch (item.trend) {
      case 'up': return <TrendingUp size={14} className="text-green-500" />;
      case 'down': return <TrendingDown size={14} className="text-red-500" />;
      case 'stable': return <Minus size={14} className="text-gray-500" />;
      default: return null;
    }
  };

  return (
    <AnimatedCard
      variant="outlined"
      hover={interactive ? 'lift' : 'none'}
      className={cn(
        'transition-all duration-200 cursor-pointer',
        interactive && 'hover:shadow-md',
        className
      )}
      onClick={interactive ? () => setExpanded(!expanded) : undefined}
    >
      <div className={sizeClasses[size]}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className={cn('p-1 rounded-full flex-shrink-0', config.bg)}>
              <IconComponent size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} className={config.color} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-foreground truncate">{item.title}</h4>
                {item.trend && getTrendIcon()}
              </div>

              <p className="text-sm text-muted-foreground mt-1">{item.message}</p>

              {showDetails && (
                <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                  {item.value !== undefined && (
                    <span>
                      {item.value}{item.unit && ` ${item.unit}`}
                    </span>
                  )}

                  <span>
                    {item.timestamp.toLocaleTimeString()}
                  </span>

                  {item.duration && (
                    <span>
                      Duration: {Math.round(item.duration / 1000)}s
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {interactive && (
            <div className="flex-shrink-0 ml-2">
              <ChevronDown
                size={16}
                className={cn(
                  'text-muted-foreground transition-transform duration-200',
                  expanded && 'rotate-180'
                )}
              />
            </div>
          )}
        </div>

        {/* Expanded Details */}
        {expanded && showDetails && (
          <div className="mt-4 pt-4 border-t border-border">
            {item.details && (
              <p className="text-sm text-muted-foreground mb-3">{item.details}</p>
            )}

            {/* Thresholds */}
            {item.threshold && (
              <div className="mb-3">
                <div className="text-xs text-muted-foreground mb-2">Thresholds</div>
                <div className="flex space-x-4 text-xs">
                  <span className="text-yellow-600">Warning: {item.threshold.warning}</span>
                  <span className="text-red-600">Critical: {item.threshold.critical}</span>
                </div>
              </div>
            )}

            {/* Actions */}
            {item.actions && item.actions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {item.actions.map((action, index) => (
                  <AnimatedButton
                    key={index}
                    variant={action.variant === 'danger' ? 'destructive' : action.variant || 'default'}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      action.onClick();
                    }}
                    animation="scale"
                  >
                    {action.icon && <span className="mr-1">{action.icon}</span>}
                    {action.label}
                  </AnimatedButton>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AnimatedCard>
  );
};

// Status Grid Component
interface StatusGridProps {
  items: StatusItem[];
  columns?: 1 | 2 | 3 | 4;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const StatusGrid: React.FC<StatusGridProps> = ({
  items,
  columns = 2,
  size = 'md',
  className,
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {items.map((item) => (
        <StatusIndicator
          key={item.id}
          item={item}
          size={size}
        />
      ))}
    </div>
  );
};

// Alert Panel Component
interface AlertPanelProps {
  alerts: AlertItem[];
  onAcknowledge?: (alertId: string) => void;
  onResolve?: (alertId: string) => void;
  onDismiss?: (alertId: string) => void;
  showFilters?: boolean;
  maxHeight?: string;
  className?: string;
}

const AlertPanel: React.FC<AlertPanelProps> = ({
  alerts,
  onAcknowledge,
  onResolve,
  onDismiss,
  showFilters = true,
  maxHeight = '400px',
  className,
}) => {
  const [filter, setFilter] = useState<'all' | 'unacknowledged' | 'acknowledged' | 'resolved'>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'unacknowledged' && alert.acknowledged) return false;
    if (filter === 'acknowledged' && (!alert.acknowledged || alert.resolved)) return false;
    if (filter === 'resolved' && !alert.resolved) return false;
    if (severityFilter !== 'all' && alert.severity !== severityFilter) return false;
    return true;
  });

  const severityConfig = {
    low: { color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' },
    medium: { color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-200' },
    high: { color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-200' },
    critical: { color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' },
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle size={16} className="text-red-600" />;
      case 'high': return <AlertTriangle size={16} className="text-orange-600" />;
      case 'medium': return <AlertTriangle size={16} className="text-yellow-600" />;
      case 'low': return <Info size={16} className="text-blue-600" />;
      default: return <Info size={16} className="text-gray-600" />;
    }
  };

  return (
    <div className={cn('bg-card border border-border rounded-lg', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <Bell size={20} className="text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Alerts</h3>
          <span className="bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs">
            {filteredAlerts.length}
          </span>
        </div>

        {showFilters && (
          <div className="flex items-center space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-2 py-1 text-sm bg-background border border-border rounded"
            >
              <option value="all">All</option>
              <option value="unacknowledged">Unacknowledged</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="resolved">Resolved</option>
            </select>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as any)}
              className="px-2 py-1 text-sm bg-background border border-border rounded"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        )}
      </div>

      {/* Alert List */}
      <div
        className="overflow-y-auto"
        style={{ maxHeight }}
      >
        {filteredAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BellOff size={48} className="text-muted-foreground mb-4" />
            <h4 className="font-medium text-muted-foreground mb-2">No alerts</h4>
            <p className="text-sm text-muted-foreground">
              All systems are running smoothly
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredAlerts.map((alert) => {
              const severity = severityConfig[alert.severity];

              return (
                <div
                  key={alert.id}
                  className={cn(
                    'p-4 hover:bg-muted/50 transition-colors',
                    alert.acknowledged && 'opacity-75'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={cn('p-1 rounded-full', severity.bg)}>
                        {getSeverityIcon(alert.severity)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-foreground">{alert.title}</h4>
                          <span className={cn(
                            'px-2 py-1 text-xs font-medium rounded-full',
                            severity.color,
                            severity.bg
                          )}>
                            {alert.severity.toUpperCase()}
                          </span>
                          {alert.acknowledged && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                              ACKNOWLEDGED
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>

                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>{alert.category}</span>
                          <span>{alert.source}</span>
                          <span>{alert.timestamp.toLocaleString()}</span>
                          {alert.acknowledgedBy && (
                            <span>Ack by {alert.acknowledgedBy}</span>
                          )}
                        </div>

                        {alert.tags && alert.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {alert.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-1 ml-4">
                      {!alert.acknowledged && onAcknowledge && (
                        <AnimatedButton
                          variant="ghost"
                          size="sm"
                          onClick={() => onAcknowledge(alert.id)}
                          animation="scale"
                        >
                          <CheckCircle size={14} />
                        </AnimatedButton>
                      )}

                      {!alert.resolved && onResolve && (
                        <AnimatedButton
                          variant="ghost"
                          size="sm"
                          onClick={() => onResolve(alert.id)}
                          animation="scale"
                        >
                          <CheckCircle size={14} className="text-green-600" />
                        </AnimatedButton>
                      )}

                      {onDismiss && (
                        <AnimatedButton
                          variant="ghost"
                          size="sm"
                          onClick={() => onDismiss(alert.id)}
                          animation="scale"
                        >
                          <X size={14} />
                        </AnimatedButton>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Status Summary Component
interface StatusSummaryProps {
  items: StatusItem[];
  className?: string;
}

const StatusSummary: React.FC<StatusSummaryProps> = ({ items, className }) => {
  const summary = {
    healthy: items.filter(item => item.status === 'healthy').length,
    warning: items.filter(item => item.status === 'warning').length,
    error: items.filter(item => item.status === 'error').length,
    info: items.filter(item => item.status === 'info').length,
    unknown: items.filter(item => item.status === 'unknown').length,
  };

  const total = items.length;
  const healthyPercent = total > 0 ? Math.round((summary.healthy / total) * 100) : 0;

  return (
    <AnimatedCard className={cn('p-6', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">System Status</h3>
        <div className="flex items-center space-x-2">
          <div className={cn(
            'px-3 py-1 rounded-full text-sm font-medium',
            healthyPercent === 100 ? 'bg-green-100 text-green-700' :
            healthyPercent >= 80 ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          )}>
            {healthyPercent}% Healthy
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{summary.healthy}</div>
          <div className="text-sm text-muted-foreground">Healthy</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{summary.warning}</div>
          <div className="text-sm text-muted-foreground">Warnings</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{summary.error}</div>
          <div className="text-sm text-muted-foreground">Errors</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{summary.info}</div>
          <div className="text-sm text-muted-foreground">Info</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-600">{summary.unknown}</div>
          <div className="text-sm text-muted-foreground">Unknown</div>
        </div>
      </div>
    </AnimatedCard>
  );
};

// Import ChevronDown for the StatusIndicator component
import { ChevronDown } from 'lucide-react';

export {
  StatusIndicator,
  StatusGrid,
  AlertPanel,
  StatusSummary,
  type StatusItem,
  type AlertItem,
  type StatusAction,
};