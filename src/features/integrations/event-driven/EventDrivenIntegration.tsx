'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';

// Event-Driven Integration Types
export type EventType =
  | 'data-change'
  | 'api-call'
  | 'webhook-received'
  | 'schedule-triggered'
  | 'manual-trigger'
  | 'error-occurred'
  | 'system-health'
  | 'user-action';

export type EventPriority =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

export type ProcessingMode =
  | 'sync'
  | 'async'
  | 'batch'
  | 'stream';

export interface IntegrationEvent {
  id: string;
  type: EventType;
  source: string;
  payload: any;
  metadata: {
    timestamp: string;
    priority: EventPriority;
    correlationId?: string;
    userId?: string;
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
  };
  processing: {
    mode: ProcessingMode;
    retryCount: number;
    maxRetries: number;
    timeout: number;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'retrying';
    startedAt?: string;
    completedAt?: string;
    errorMessage?: string;
  };
  routing: {
    destination: string;
    transformation?: EventTransformation;
    filters?: EventFilter[];
  };
}

export interface EventTransformation {
  id: string;
  type: 'map' | 'filter' | 'enrich' | 'aggregate' | 'split' | 'merge';
  config: {
    mapping?: Record<string, string>;
    enrichment?: Record<string, any>;
    aggregation?: {
      field: string;
      function: 'count' | 'sum' | 'avg' | 'min' | 'max';
      window: number; // in milliseconds
    };
    split?: {
      field: string;
      delimiter?: string;
      maxItems?: number;
    };
  };
}

export interface EventFilter {
  id: string;
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains' | 'regex';
  value: any;
  negate?: boolean;
}

export interface EventSubscription {
  id: string;
  name: string;
  description: string;
  eventTypes: EventType[];
  filters: EventFilter[];
  transformation?: EventTransformation;
  destinations: EventDestination[];
  status: 'active' | 'inactive' | 'paused';
  metrics: {
    eventsProcessed: number;
    eventsFiltered: number;
    eventsFailed: number;
    averageProcessingTime: number;
    lastProcessedAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EventDestination {
  id: string;
  type: 'webhook' | 'api' | 'queue' | 'stream' | 'database' | 'file';
  config: {
    url?: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    auth?: {
      type: 'basic' | 'bearer' | 'api-key';
      credentials: any;
    };
    queueName?: string;
    streamName?: string;
    tableName?: string;
    filePath?: string;
  };
  retryPolicy: {
    maxRetries: number;
    backoffMultiplier: number;
    initialDelay: number;
  };
}

export interface EventStream {
  id: string;
  name: string;
  description: string;
  source: string;
  eventTypes: EventType[];
  processingMode: ProcessingMode;
  batchConfig?: {
    size: number;
    timeout: number;
    compression?: 'gzip' | 'none';
  };
  status: 'active' | 'inactive' | 'error';
  metrics: {
    eventsPerSecond: number;
    totalEvents: number;
    bytesPerSecond: number;
    averageLatency: number;
    errorRate: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface RealTimeSyncRule {
  id: string;
  name: string;
  description: string;
  source: {
    type: 'database' | 'api' | 'stream' | 'file';
    config: any;
  };
  destination: {
    type: 'database' | 'api' | 'stream' | 'file';
    config: any;
  };
  mapping: {
    sourceField: string;
    destField: string;
    transformation?: string;
  }[];
  trigger: {
    type: 'polling' | 'webhook' | 'cdc' | 'schedule';
    config: any;
  };
  conflictResolution: 'source-wins' | 'dest-wins' | 'manual' | 'merge';
  status: 'active' | 'inactive';
  lastSyncAt?: string;
  syncMetrics: {
    totalRecords: number;
    recordsSynced: number;
    conflictsResolved: number;
    errors: number;
  };
}

// Event-Driven Integration Hook
export function useEventDrivenIntegration() {
  const [events, setEvents] = useState<IntegrationEvent[]>([]);
  const [subscriptions, setSubscriptions] = useState<EventSubscription[]>([]);
  const [streams, setStreams] = useState<EventStream[]>([]);
  const [syncRules, setSyncRules] = useState<RealTimeSyncRule[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [processingQueue, setProcessingQueue] = useState<IntegrationEvent[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mock data
  const mockSubscriptions: EventSubscription[] = [
    {
      id: 'financial-data-sync',
      name: 'Financial Data Synchronization',
      description: 'Sync financial transactions across systems in real-time',
      eventTypes: ['data-change', 'api-call'],
      filters: [
        {
          id: 'financial-events',
          field: 'source',
          operator: 'eq',
          value: 'financial-system'
        }
      ],
      destinations: [
        {
          id: 'accounting-db',
          type: 'database',
          config: {
            tableName: 'transactions'
          },
          retryPolicy: {
            maxRetries: 3,
            backoffMultiplier: 2,
            initialDelay: 1000
          }
        },
        {
          id: 'reporting-webhook',
          type: 'webhook',
          config: {
            url: 'https://reporting.garlaws.com/webhook/financial',
            method: 'POST'
          },
          retryPolicy: {
            maxRetries: 5,
            backoffMultiplier: 1.5,
            initialDelay: 500
          }
        }
      ],
      status: 'active',
      metrics: {
        eventsProcessed: 15420,
        eventsFiltered: 2340,
        eventsFailed: 45,
        averageProcessingTime: 25,
        lastProcessedAt: '2026-04-22T15:30:00Z'
      },
      createdAt: '2026-03-01T00:00:00Z',
      updatedAt: '2026-04-22T15:30:00Z'
    }
  ];

  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      // In real implementation, connect to actual WebSocket endpoint
      const ws = new WebSocket('ws://localhost:8080/events');

      ws.onopen = () => {
        console.log('Event integration WebSocket connected');
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const integrationEvent: IntegrationEvent = JSON.parse(event.data);
          handleIncomingEvent(integrationEvent);
        } catch (error) {
          console.error('Failed to parse event:', error);
        }
      };

      ws.onclose = () => {
        console.log('Event integration WebSocket disconnected');
        setIsConnected(false);
        // Reconnect after delay
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }, []);

  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    setIsConnected(false);
  }, []);

  const handleIncomingEvent = useCallback((event: IntegrationEvent) => {
    setEvents(prev => [event, ...prev.slice(0, 999)]); // Keep last 1000 events

    // Add to processing queue
    setProcessingQueue(prev => [...prev, event]);

    // Process event based on subscriptions
    processEventWithSubscriptions(event);
  }, []);

  const processEventWithSubscriptions = useCallback(async (event: IntegrationEvent) => {
    const matchingSubscriptions = subscriptions.filter(sub =>
      sub.status === 'active' &&
      sub.eventTypes.includes(event.type) &&
      sub.filters.every(filter => matchesFilter(event, filter))
    );

    for (const subscription of matchingSubscriptions) {
      try {
        await processSubscription(event, subscription);
      } catch (error) {
        console.error(`Failed to process subscription ${subscription.id}:`, error);
      }
    }
  }, [subscriptions]);

  const matchesFilter = (event: IntegrationEvent, filter: EventFilter): boolean => {
    const value = getNestedValue(event, filter.field);
    let matches = false;

    switch (filter.operator) {
      case 'eq':
        matches = value === filter.value;
        break;
      case 'ne':
        matches = value !== filter.value;
        break;
      case 'gt':
        matches = value > filter.value;
        break;
      case 'gte':
        matches = value >= filter.value;
        break;
      case 'lt':
        matches = value < filter.value;
        break;
      case 'lte':
        matches = value <= filter.value;
        break;
      case 'in':
        matches = Array.isArray(filter.value) && filter.value.includes(value);
        break;
      case 'contains':
        matches = String(value).includes(String(filter.value));
        break;
      case 'regex':
        matches = new RegExp(filter.value).test(String(value));
        break;
    }

    return filter.negate ? !matches : matches;
  };

  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const processSubscription = async (event: IntegrationEvent, subscription: EventSubscription) => {
    // Apply transformation if specified
    let transformedPayload = event.payload;
    if (subscription.transformation) {
      transformedPayload = applyTransformation(event.payload, subscription.transformation);
    }

    // Send to all destinations
    const destinationPromises = subscription.destinations.map(destination =>
      sendToDestination(transformedPayload, destination)
    );

    await Promise.allSettled(destinationPromises);
  };

  const applyTransformation = (payload: any, transformation: EventTransformation): any => {
    switch (transformation.type) {
      case 'map':
        if (transformation.config.mapping) {
          const result: any = {};
          for (const [source, dest] of Object.entries(transformation.config.mapping)) {
            result[dest] = getNestedValue(payload, source);
          }
          return result;
        }
        break;
      case 'filter':
        // Filter logic would be implemented here
        return payload;
      case 'enrich':
        return { ...payload, ...transformation.config.enrichment };
      // Other transformation types...
    }
    return payload;
  };

  const sendToDestination = async (payload: any, destination: EventDestination): Promise<void> => {
    const config = destination.config;

    switch (destination.type) {
      case 'webhook':
        await fetch(config.url!, {
          method: config.method || 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...config.headers
          },
          body: JSON.stringify(payload)
        });
        break;
      case 'api':
        // Similar to webhook but with auth
        break;
      case 'database':
        // Database insertion logic
        console.log(`Inserting into ${config.tableName}:`, payload);
        break;
      // Other destination types...
    }
  };

  const publishEvent = useCallback((eventData: { type: EventType; source: string; payload: any; routing: { destination: string; transformation?: EventTransformation; filters?: EventFilter[] } }) => {
    const fullEvent: IntegrationEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: eventData.type,
      source: eventData.source,
      payload: eventData.payload,
      metadata: {
        timestamp: new Date().toISOString(),
        priority: 'medium'
      },
      processing: {
        mode: 'async',
        retryCount: 0,
        maxRetries: 3,
        timeout: 30000,
        status: 'pending'
      },
      routing: eventData.routing
    };

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(fullEvent));
    } else {
      // Store for later sending
      console.log('WebSocket not connected, queuing event:', fullEvent);
    }

    handleIncomingEvent(fullEvent);
  }, [handleIncomingEvent]);

  const createSubscription = useCallback((subscription: Omit<EventSubscription, 'id' | 'createdAt' | 'updatedAt' | 'metrics'>) => {
    const newSubscription: EventSubscription = {
      ...subscription,
      id: `sub_${Date.now()}`,
      metrics: {
        eventsProcessed: 0,
        eventsFiltered: 0,
        eventsFailed: 0,
        averageProcessingTime: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setSubscriptions(prev => [...prev, newSubscription]);
    return newSubscription.id;
  }, []);

  const createSyncRule = useCallback((rule: Omit<RealTimeSyncRule, 'id' | 'lastSyncAt' | 'syncMetrics'>) => {
    const newRule: RealTimeSyncRule = {
      ...rule,
      id: `sync_${Date.now()}`,
      syncMetrics: {
        totalRecords: 0,
        recordsSynced: 0,
        conflictsResolved: 0,
        errors: 0
      }
    };

    setSyncRules(prev => [...prev, newRule]);
    return newRule.id;
  }, []);

  useEffect(() => {
    // Load mock data
    setSubscriptions(mockSubscriptions);

    // Connect WebSocket
    connectWebSocket();

    return () => {
      disconnectWebSocket();
    };
  }, [connectWebSocket, disconnectWebSocket]);

  return {
    events,
    subscriptions,
    streams,
    syncRules,
    isConnected,
    processingQueue,
    publishEvent,
    createSubscription,
    createSyncRule,
    connectWebSocket,
    disconnectWebSocket,
  };
}

// Event-Driven Integration Dashboard Component
interface EventDrivenIntegrationDashboardProps {
  className?: string;
}

export const EventDrivenIntegrationDashboard: React.FC<EventDrivenIntegrationDashboardProps> = ({
  className
}) => {
  const {
    events,
    subscriptions,
    syncRules,
    isConnected,
    processingQueue,
    publishEvent,
    createSubscription,
    createSyncRule
  } = useEventDrivenIntegration();

  const [activeTab, setActiveTab] = useState<'events' | 'subscriptions' | 'sync' | 'streams'>('events');
  const [selectedEvent, setSelectedEvent] = useState<IntegrationEvent | null>(null);

  const publishTestEvent = () => {
    publishEvent({
      type: 'data-change',
      source: 'test-system',
      payload: {
        entity: 'user',
        operation: 'update',
        data: { id: 123, name: 'John Doe', email: 'john@example.com' }
      },
      routing: {
        destination: 'all-subscribers'
      }
    });
  };

  const getEventTypeIcon = (type: EventType) => {
    const icons: Record<EventType, string> = {
      'data-change': '📊',
      'api-call': '🔗',
      'webhook-received': '🪝',
      'schedule-triggered': '⏰',
      'manual-trigger': '👆',
      'error-occurred': '❌',
      'system-health': '❤️',
      'user-action': '👤'
    };
    return icons[type] || '📢';
  };

  const getPriorityColor = (priority: EventPriority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[priority];
  };

  const getProcessingStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      retrying: 'bg-orange-100 text-orange-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Event-Driven Integration</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time data synchronization and event processing
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
            isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          <button
            onClick={publishTestEvent}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Publish Test Event
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{events.length}</div>
          <div className="text-sm text-gray-600">Events Processed</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">{subscriptions.length}</div>
          <div className="text-sm text-gray-600">Active Subscriptions</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-orange-600">{processingQueue.length}</div>
          <div className="text-sm text-gray-600">In Queue</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">{syncRules.length}</div>
          <div className="text-sm text-gray-600">Sync Rules</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
          {[
            { id: 'events', name: 'Events', icon: '📢' },
            { id: 'subscriptions', name: 'Subscriptions', icon: '📡' },
            { id: 'sync', name: 'Sync Rules', icon: '🔄' },
            { id: 'streams', name: 'Streams', icon: '🌊' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'events' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Recent Events</h3>
              <div className="text-sm text-muted-foreground">
                Real-time event stream
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {events.map(event => (
                <div
                  key={event.id}
                  className={cn(
                    'p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow',
                    selectedEvent?.id === event.id ? 'border-primary bg-primary/5' : 'border-border'
                  )}
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getEventTypeIcon(event.type)}</span>
                      <div>
                        <div className="font-medium">{event.type.replace('-', ' ')}</div>
                        <div className="text-sm text-muted-foreground">from {event.source}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={cn('px-2 py-1 rounded text-xs font-medium', getPriorityColor(event.metadata.priority))}>
                        {event.metadata.priority}
                      </span>
                      <span className={cn('px-2 py-1 rounded text-xs font-medium', getProcessingStatusColor(event.processing.status))}>
                        {event.processing.status}
                      </span>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground mb-2">
                    {new Date(event.metadata.timestamp).toLocaleString()}
                  </div>

                  <div className="text-sm bg-gray-50 p-2 rounded font-mono">
                    {JSON.stringify(event.payload, null, 2).substring(0, 200)}
                    {JSON.stringify(event.payload, null, 2).length > 200 && '...'}
                  </div>

                  {event.processing.errorMessage && (
                    <div className="text-sm text-red-600 bg-red-50 p-2 rounded mt-2">
                      Error: {event.processing.errorMessage}
                    </div>
                  )}
                </div>
              ))}

              {events.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📢</div>
                  <h3 className="text-lg font-semibold">No Events Yet</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Events will appear here as they are processed in real-time
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'subscriptions' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Event Subscriptions</h3>
              <button
                onClick={() => createSubscription({
                  name: 'New Subscription',
                  description: 'Description',
                  eventTypes: ['data-change'],
                  filters: [],
                  destinations: [],
                  status: 'active'
                })}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Create Subscription
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {subscriptions.map(subscription => (
                <div key={subscription.id} className="bg-white p-6 rounded-lg border">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📡</span>
                    </div>
                    <span className={cn(
                      'px-2 py-1 rounded text-xs font-medium',
                      subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                      subscription.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    )}>
                      {subscription.status}
                    </span>
                  </div>

                  <h4 className="font-semibold text-lg mb-2">{subscription.name}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{subscription.description}</p>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Event Types:</span>
                      <span>{subscription.eventTypes.join(', ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Destinations:</span>
                      <span>{subscription.destinations.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Events Processed:</span>
                      <span>{subscription.metrics.eventsProcessed.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Processing Time:</span>
                      <span>{subscription.metrics.averageProcessingTime}ms</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'sync' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Real-Time Sync Rules</h3>
              <button
                onClick={() => createSyncRule({
                  name: 'New Sync Rule',
                  description: 'Description',
                  source: { type: 'database', config: {} },
                  destination: { type: 'api', config: {} },
                  mapping: [],
                  trigger: { type: 'polling', config: {} },
                  conflictResolution: 'source-wins',
                  status: 'active'
                })}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Create Sync Rule
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {syncRules.map(rule => (
                <div key={rule.id} className="bg-white p-6 rounded-lg border">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🔄</span>
                    </div>
                    <span className={cn(
                      'px-2 py-1 rounded text-xs font-medium',
                      rule.status === 'active' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    )}>
                      {rule.status}
                    </span>
                  </div>

                  <h4 className="font-semibold text-lg mb-2">{rule.name}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{rule.description}</p>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Source:</span>
                      <span>{rule.source.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Destination:</span>
                      <span>{rule.destination.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Trigger:</span>
                      <span>{rule.trigger.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Records Synced:</span>
                      <span>{rule.syncMetrics.recordsSynced.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}

              {syncRules.length === 0 && (
                <div className="text-center py-12 col-span-2">
                  <div className="text-6xl mb-4">🔄</div>
                  <h3 className="text-lg font-semibold">No Sync Rules</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Create sync rules to automatically synchronize data between systems
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'streams' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🌊</div>
            <h3 className="text-lg font-semibold">Event Streams</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Advanced event streaming capabilities coming soon
            </p>
          </div>
        )}
      </div>
    </div>
  );
};