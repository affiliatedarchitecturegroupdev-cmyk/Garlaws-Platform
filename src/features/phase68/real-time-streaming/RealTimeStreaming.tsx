'use client';

import React, { useState, useEffect, useRef, useCallback, createContext, useContext, ReactNode } from 'react';
import { Activity, Wifi, WifiOff, Zap, AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';

// Real-time data types
export interface StreamMessage {
  id: string;
  type: 'data' | 'event' | 'notification' | 'error' | 'heartbeat';
  channel: string;
  payload: any;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface StreamChannel {
  id: string;
  name: string;
  type: 'websocket' | 'sse' | 'polling';
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  lastMessage?: Date;
  messageCount: number;
  subscribers: number;
}

export interface RealTimeContextType {
  isConnected: boolean;
  channels: StreamChannel[];
  messages: StreamMessage[];
  subscribe: (channelId: string, callback: (message: StreamMessage) => void) => () => void;
  unsubscribe: (channelId: string, callback?: (message: StreamMessage) => void) => void;
  publish: (channelId: string, message: Omit<StreamMessage, 'id' | 'timestamp'>) => void;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
  latency: number;
}

const RealTimeContext = createContext<RealTimeContextType | undefined>(undefined);

export const useRealTime = () => {
  const context = useContext(RealTimeContext);
  if (!context) {
    throw new Error('useRealTime must be used within a RealTimeProvider');
  }
  return context;
};

interface RealTimeProviderProps {
  children: ReactNode;
  wsUrl?: string;
  sseUrl?: string;
  enableAutoReconnect?: boolean;
  reconnectInterval?: number;
}

export const RealTimeProvider: React.FC<RealTimeProviderProps> = ({
  children,
  wsUrl = 'ws://localhost:3001/realtime',
  sseUrl = '/api/realtime/stream',
  enableAutoReconnect = true,
  reconnectInterval = 5000
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'fair' | 'poor'>('fair');
  const [latency, setLatency] = useState(0);
  const [channels, setChannels] = useState<StreamChannel[]>([
    { id: 'financial', name: 'Financial Data', type: 'websocket', status: 'disconnected', messageCount: 0, subscribers: 0 },
    { id: 'supply-chain', name: 'Supply Chain', type: 'websocket', status: 'disconnected', messageCount: 0, subscribers: 0 },
    { id: 'crm', name: 'CRM Updates', type: 'sse', status: 'disconnected', messageCount: 0, subscribers: 0 },
    { id: 'analytics', name: 'Analytics', type: 'websocket', status: 'disconnected', messageCount: 0, subscribers: 0 },
    { id: 'security', name: 'Security Alerts', type: 'websocket', status: 'disconnected', messageCount: 0, subscribers: 0 },
    { id: 'iot', name: 'IoT Sensors', type: 'sse', status: 'disconnected', messageCount: 0, subscribers: 0 },
  ]);
  const [messages, setMessages] = useState<StreamMessage[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const sseRef = useRef<EventSource | null>(null);
  const subscribersRef = useRef<Map<string, Set<(message: StreamMessage) => void>>>(new Map());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const latencyCheckRef = useRef<NodeJS.Timeout | null>(null);

  // WebSocket connection management
  const connectWebSocket = useCallback(() => {
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        updateChannelStatus('financial', 'connected');
        updateChannelStatus('supply-chain', 'connected');
        updateChannelStatus('analytics', 'connected');
        updateChannelStatus('security', 'connected');

        // Start heartbeat
        heartbeatIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'heartbeat', timestamp: Date.now() }));
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const message: StreamMessage = {
            id: data.id || `msg-${Date.now()}`,
            type: data.type || 'data',
            channel: data.channel || 'unknown',
            payload: data.payload,
            timestamp: new Date(data.timestamp || Date.now()),
            priority: data.priority || 'medium'
          };

          handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        updateChannelStatus('financial', 'disconnected');
        updateChannelStatus('supply-chain', 'disconnected');
        updateChannelStatus('analytics', 'disconnected');
        updateChannelStatus('security', 'disconnected');

        if (enableAutoReconnect) {
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        updateChannelStatus('financial', 'error');
        updateChannelStatus('supply-chain', 'error');
        updateChannelStatus('analytics', 'error');
        updateChannelStatus('security', 'error');
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }, [wsUrl, enableAutoReconnect, reconnectInterval]);

  // Server-Sent Events connection
  const connectSSE = useCallback(() => {
    try {
      const sse = new EventSource(sseUrl);
      sseRef.current = sse;

      sse.onopen = () => {
        console.log('SSE connected');
        updateChannelStatus('crm', 'connected');
        updateChannelStatus('iot', 'connected');
      };

      sse.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const message: StreamMessage = {
            id: data.id || `sse-${Date.now()}`,
            type: data.type || 'data',
            channel: data.channel || 'unknown',
            payload: data.payload,
            timestamp: new Date(data.timestamp || Date.now()),
            priority: data.priority || 'medium'
          };

          handleMessage(message);
        } catch (error) {
          console.error('Failed to parse SSE message:', error);
        }
      };

      sse.onerror = (error) => {
        console.error('SSE error:', error);
        updateChannelStatus('crm', 'error');
        updateChannelStatus('iot', 'error');

        if (enableAutoReconnect) {
          setTimeout(connectSSE, reconnectInterval);
        }
      };
    } catch (error) {
      console.error('Failed to create SSE connection:', error);
    }
  }, [sseUrl, enableAutoReconnect, reconnectInterval]);

  // Message handling
  const handleMessage = useCallback((message: StreamMessage) => {
    setMessages(prev => [message, ...prev.slice(0, 99)]); // Keep last 100 messages

    updateChannelStatus(message.channel, 'connected', new Date());

    // Notify subscribers
    const channelSubscribers = subscribersRef.current.get(message.channel);
    if (channelSubscribers) {
      channelSubscribers.forEach(callback => {
        try {
          callback(message);
        } catch (error) {
          console.error('Error in subscriber callback:', error);
        }
      });
    }
  }, []);

  // Channel status updates
  const updateChannelStatus = useCallback((channelId: string, status: StreamChannel['status'], lastMessage?: Date) => {
    setChannels(prev => prev.map(channel =>
      channel.id === channelId
        ? {
            ...channel,
            status,
            lastMessage: lastMessage || channel.lastMessage,
            messageCount: lastMessage ? channel.messageCount + 1 : channel.messageCount
          }
        : channel
    ));
  }, []);

  // Latency measurement
  const measureLatency = useCallback(() => {
    if (!isConnected) return;

    const start = Date.now();
    // Simulate latency measurement
    setTimeout(() => {
      const measuredLatency = Date.now() - start;
      setLatency(measuredLatency);

      // Update connection quality based on latency
      if (measuredLatency < 50) setConnectionQuality('excellent');
      else if (measuredLatency < 100) setConnectionQuality('good');
      else if (measuredLatency < 200) setConnectionQuality('fair');
      else setConnectionQuality('poor');
    }, Math.random() * 100 + 50);
  }, [isConnected]);

  // Subscription management
  const subscribe = useCallback((channelId: string, callback: (message: StreamMessage) => void) => {
    if (!subscribersRef.current.has(channelId)) {
      subscribersRef.current.set(channelId, new Set());
    }

    const channelSubscribers = subscribersRef.current.get(channelId)!;
    channelSubscribers.add(callback);

    // Update subscriber count
    setChannels(prev => prev.map(channel =>
      channel.id === channelId
        ? { ...channel, subscribers: channelSubscribers.size }
        : channel
    ));

    // Return unsubscribe function
    return () => {
      channelSubscribers.delete(callback);
      setChannels(prev => prev.map(channel =>
        channel.id === channelId
          ? { ...channel, subscribers: channelSubscribers.size }
          : channel
      ));
    };
  }, []);

  const unsubscribe = useCallback((channelId: string, callback?: (message: StreamMessage) => void) => {
    const channelSubscribers = subscribersRef.current.get(channelId);
    if (channelSubscribers) {
      if (callback) {
        channelSubscribers.delete(callback);
      } else {
        channelSubscribers.clear();
      }

      setChannels(prev => prev.map(channel =>
        channel.id === channelId
          ? { ...channel, subscribers: channelSubscribers.size }
          : channel
      ));
    }
  }, []);

  const publish = useCallback((channelId: string, message: Omit<StreamMessage, 'id' | 'timestamp'>) => {
    const fullMessage: StreamMessage = {
      ...message,
      id: `pub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(fullMessage));
    }

    handleMessage(fullMessage);
  }, [handleMessage]);

  // Initialize connections
  useEffect(() => {
    connectWebSocket();
    connectSSE();

    // Start latency measurement
    latencyCheckRef.current = setInterval(measureLatency, 5000);

    return () => {
      // Cleanup
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (sseRef.current) {
        sseRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      if (latencyCheckRef.current) {
        clearInterval(latencyCheckRef.current);
      }
    };
  }, [connectWebSocket, connectSSE, measureLatency]);

  const contextValue: RealTimeContextType = {
    isConnected,
    channels,
    messages,
    subscribe,
    unsubscribe,
    publish,
    connectionQuality,
    latency
  };

  return (
    <RealTimeContext.Provider value={contextValue}>
      {children}
    </RealTimeContext.Provider>
  );
};

// Real-time streaming dashboard component
export const RealTimeStreaming: React.FC = () => {
  const { isConnected, channels, messages, connectionQuality, latency } = useRealTime();
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  const filteredMessages = messages.filter(msg =>
    filterType === 'all' || msg.type === filterType
  );

  const getStatusIcon = (status: StreamChannel['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'connecting':
        return <Activity className="w-4 h-4 text-yellow-500 animate-pulse" />;
      case 'disconnected':
        return <WifiOff className="w-4 h-4 text-gray-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getQualityColor = (quality: typeof connectionQuality) => {
    switch (quality) {
      case 'excellent':
        return 'text-green-600 bg-green-100';
      case 'good':
        return 'text-blue-600 bg-blue-100';
      case 'fair':
        return 'text-yellow-600 bg-yellow-100';
      case 'poor':
        return 'text-red-600 bg-red-100';
    }
  };

  const getPriorityColor = (priority: StreamMessage['priority']) => {
    switch (priority) {
      case 'critical':
        return 'text-red-700 bg-red-100';
      case 'high':
        return 'text-orange-700 bg-orange-100';
      case 'medium':
        return 'text-yellow-700 bg-yellow-100';
      case 'low':
        return 'text-green-700 bg-green-100';
    }
  };

  const totalMessages = channels.reduce((sum, channel) => sum + channel.messageCount, 0);
  const activeChannels = channels.filter(c => c.status === 'connected').length;
  const errorChannels = channels.filter(c => c.status === 'error').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isConnected ? (
              <Wifi className="w-8 h-8 text-green-600" />
            ) : (
              <WifiOff className="w-8 h-8 text-red-600" />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Real-Time Streaming</h1>
              <p className="text-gray-600">Live data streaming with WebSocket and SSE connections</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getQualityColor(connectionQuality)}`}>
                {connectionQuality} ({latency}ms)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Connection Status</p>
              <p className="text-2xl font-bold text-gray-900">
                {isConnected ? 'Connected' : 'Disconnected'}
              </p>
            </div>
            {isConnected ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : (
              <WifiOff className="w-8 h-8 text-red-600" />
            )}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Channels</p>
              <p className="text-2xl font-bold text-gray-900">{activeChannels}/{channels.length}</p>
            </div>
            <Activity className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Messages</p>
              <p className="text-2xl font-bold text-gray-900">{totalMessages}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Error Channels</p>
              <p className="text-2xl font-bold text-gray-900">{errorChannels}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Channels Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Streaming Channels</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Channel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Messages
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subscribers
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Message
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {channels.map((channel) => (
                <tr key={channel.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{channel.name}</div>
                    <div className="text-sm text-gray-500">ID: {channel.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {channel.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(channel.status)}
                      <span className="text-sm text-gray-900 capitalize">{channel.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {channel.messageCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {channel.subscribers}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {channel.lastMessage ? channel.lastMessage.toLocaleTimeString() : 'Never'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Message Stream</h2>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Filter:</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="data">Data</option>
                <option value="event">Events</option>
                <option value="notification">Notifications</option>
                <option value="error">Errors</option>
                <option value="heartbeat">Heartbeats</option>
              </select>
            </div>
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          <div className="divide-y divide-gray-200">
            {filteredMessages.length === 0 ? (
              <div className="px-6 py-4 text-center text-gray-500">
                No messages received yet. Waiting for real-time data...
              </div>
            ) : (
              filteredMessages.slice(0, 50).map((message) => (
                <div key={message.id} className="px-6 py-3 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(message.priority)}`}>
                        {message.priority}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{message.channel}</span>
                      <span className="text-sm text-gray-500">{message.type}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-700">
                    {typeof message.payload === 'object' ? (
                      <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                        {JSON.stringify(message.payload, null, 2)}
                      </pre>
                    ) : (
                      <span>{String(message.payload)}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeStreaming;