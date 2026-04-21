'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, TrendingUp, Activity, Zap, AlertTriangle, CheckCircle, Clock, Database, Cpu, HardDrive } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';

export interface StreamingMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  timestamp: Date;
  category: 'performance' | 'throughput' | 'latency' | 'errors' | 'resources';
}

export interface DataStream {
  id: string;
  name: string;
  source: string;
  status: 'active' | 'inactive' | 'error' | 'maintenance';
  recordsPerSecond: number;
  totalRecords: number;
  lastProcessed: Date;
  processingLatency: number;
  errorRate: number;
  schema: string[];
}

export interface RealTimeInsight {
  id: string;
  title: string;
  description: string;
  type: 'anomaly' | 'trend' | 'prediction' | 'alert' | 'optimization';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  timestamp: Date;
  data: any;
  recommendation?: string;
}

export interface AnalyticsPipeline {
  id: string;
  name: string;
  stages: string[];
  status: 'running' | 'stopped' | 'error' | 'maintenance';
  throughput: number; // records/second
  latency: number; // ms
  errorRate: number;
  lastExecution: Date;
  owner: string;
}

const SAMPLE_METRICS: StreamingMetric[] = [
  { id: 'throughput', name: 'Data Throughput', value: 1250, unit: 'records/sec', trend: 'up', changePercent: 8.5, timestamp: new Date(), category: 'throughput' },
  { id: 'latency', name: 'Processing Latency', value: 45, unit: 'ms', trend: 'down', changePercent: -12.3, timestamp: new Date(), category: 'latency' },
  { id: 'cpu-usage', name: 'CPU Usage', value: 68, unit: '%', trend: 'stable', changePercent: 2.1, timestamp: new Date(), category: 'resources' },
  { id: 'memory-usage', name: 'Memory Usage', value: 72, unit: '%', trend: 'up', changePercent: 5.7, timestamp: new Date(), category: 'resources' },
  { id: 'error-rate', name: 'Error Rate', value: 0.02, unit: '%', trend: 'down', changePercent: -25.0, timestamp: new Date(), category: 'errors' },
  { id: 'active-connections', name: 'Active Connections', value: 1250, unit: 'connections', trend: 'up', changePercent: 15.2, timestamp: new Date(), category: 'performance' },
];

const SAMPLE_STREAMS: DataStream[] = [
  {
    id: 'user-events',
    name: 'User Events Stream',
    source: 'Web Application',
    status: 'active',
    recordsPerSecond: 850,
    totalRecords: 1250000,
    lastProcessed: new Date(),
    processingLatency: 25,
    errorRate: 0.01,
    schema: ['userId', 'eventType', 'timestamp', 'properties']
  },
  {
    id: 'sensor-data',
    name: 'IoT Sensor Data',
    source: 'Sensor Network',
    status: 'active',
    recordsPerSecond: 2500,
    totalRecords: 5000000,
    lastProcessed: new Date(),
    processingLatency: 15,
    errorRate: 0.05,
    schema: ['sensorId', 'value', 'unit', 'location', 'timestamp']
  },
  {
    id: 'transaction-log',
    name: 'Transaction Logs',
    source: 'Payment Gateway',
    status: 'active',
    recordsPerSecond: 125,
    totalRecords: 75000,
    lastProcessed: new Date(),
    processingLatency: 35,
    errorRate: 0.02,
    schema: ['transactionId', 'amount', 'currency', 'status', 'timestamp']
  },
];

const SAMPLE_INSIGHTS: RealTimeInsight[] = [
  {
    id: 'anomaly-1',
    title: 'Unusual Traffic Spike Detected',
    description: 'User events increased by 300% in the last 5 minutes',
    type: 'anomaly',
    severity: 'high',
    confidence: 95,
    timestamp: new Date(Date.now() - 300000),
    data: { increase: 300, timeframe: '5 minutes' },
    recommendation: 'Investigate potential DDoS attack or viral content'
  },
  {
    id: 'trend-1',
    title: 'Positive Revenue Trend',
    description: 'Transaction volume trending upward by 12% week-over-week',
    type: 'trend',
    severity: 'low',
    confidence: 87,
    timestamp: new Date(Date.now() - 600000),
    data: { growth: 12, period: 'week-over-week' }
  },
  {
    id: 'prediction-1',
    title: 'Resource Usage Forecast',
    description: 'CPU usage expected to reach 85% in 2 hours',
    type: 'prediction',
    severity: 'medium',
    confidence: 78,
    timestamp: new Date(Date.now() - 900000),
    data: { predictedUsage: 85, timeframe: '2 hours' },
    recommendation: 'Consider scaling resources or optimizing queries'
  },
];

const SAMPLE_PIPELINES: AnalyticsPipeline[] = [
  {
    id: 'realtime-dashboard',
    name: 'Real-time Dashboard Pipeline',
    stages: ['Ingestion', 'Validation', 'Aggregation', 'Visualization'],
    status: 'running',
    throughput: 1200,
    latency: 45,
    errorRate: 0.02,
    lastExecution: new Date(),
    owner: 'analytics-team'
  },
  {
    id: 'anomaly-detection',
    name: 'Anomaly Detection Pipeline',
    stages: ['Data Collection', 'Feature Extraction', 'Model Inference', 'Alert Generation'],
    status: 'running',
    throughput: 800,
    latency: 120,
    errorRate: 0.05,
    lastExecution: new Date(),
    owner: 'ml-team'
  },
  {
    id: 'business-intelligence',
    name: 'Business Intelligence Pipeline',
    stages: ['ETL', 'Data Warehousing', 'Report Generation', 'Distribution'],
    status: 'maintenance',
    throughput: 0,
    latency: 0,
    errorRate: 0,
    lastExecution: new Date(Date.now() - 3600000),
    owner: 'bi-team'
  },
];

export const StreamingAnalytics: React.FC = () => {
  const [metrics, setMetrics] = useState<StreamingMetric[]>(SAMPLE_METRICS);
  const [streams, setStreams] = useState<DataStream[]>(SAMPLE_STREAMS);
  const [insights, setInsights] = useState<RealTimeInsight[]>(SAMPLE_INSIGHTS);
  const [pipelines, setPipelines] = useState<AnalyticsPipeline[]>(SAMPLE_PIPELINES);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'streams' | 'insights' | 'pipelines'>('overview');
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('1h');

  // Generate sample chart data
  const generateChartData = useCallback((hours: number) => {
    const data = [];
    const now = new Date();
    for (let i = hours; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        time: time.toLocaleTimeString(),
        throughput: Math.floor(Math.random() * 1000) + 500,
        latency: Math.floor(Math.random() * 50) + 20,
        errors: Math.floor(Math.random() * 10),
        cpu: Math.floor(Math.random() * 30) + 50,
      });
    }
    return data;
  }, []);

  const chartData = generateChartData(timeRange === '1h' ? 1 : timeRange === '6h' ? 6 : timeRange === '24h' ? 24 : 168);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.value + (Math.random() - 0.5) * metric.value * 0.1,
        changePercent: (Math.random() - 0.5) * 10,
        timestamp: new Date()
      })));

      setStreams(prev => prev.map(stream => ({
        ...stream,
        recordsPerSecond: Math.max(0, stream.recordsPerSecond + (Math.random() - 0.5) * 100),
        processingLatency: Math.max(5, stream.processingLatency + (Math.random() - 0.5) * 10),
        lastProcessed: new Date()
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'running':
        return 'text-green-600 bg-green-100';
      case 'inactive':
      case 'stopped':
        return 'text-gray-600 bg-gray-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      case 'maintenance':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-700 bg-red-100';
      case 'high':
        return 'text-orange-700 bg-orange-100';
      case 'medium':
        return 'text-yellow-700 bg-yellow-100';
      case 'low':
        return 'text-green-700 bg-green-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const totalThroughput = streams.reduce((sum, stream) => sum + stream.recordsPerSecond, 0);
  const avgLatency = streams.filter(s => s.status === 'active').reduce((sum, s) => sum + s.processingLatency, 0) / streams.filter(s => s.status === 'active').length;
  const activeStreams = streams.filter(s => s.status === 'active').length;
  const criticalInsights = insights.filter(i => i.severity === 'critical' || i.severity === 'high').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Streaming Analytics</h1>
              <p className="text-gray-600">Real-time data processing and insights generation</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1h">Last Hour</option>
              <option value="6h">Last 6 Hours</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Throughput</p>
              <p className="text-2xl font-bold text-gray-900">{totalThroughput.toLocaleString()}/sec</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Latency</p>
              <p className="text-2xl font-bold text-gray-900">{avgLatency.toFixed(0)}ms</p>
            </div>
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Streams</p>
              <p className="text-2xl font-bold text-gray-900">{activeStreams}/{streams.length}</p>
            </div>
            <Activity className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical Insights</p>
              <p className="text-2xl font-bold text-gray-900">{criticalInsights}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Real-time Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Throughput Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="throughput" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Latency Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="latency" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setSelectedTab('overview')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setSelectedTab('streams')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedTab === 'streams'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Data Streams
            </button>
            <button
              onClick={() => setSelectedTab('insights')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedTab === 'insights'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Real-Time Insights
            </button>
            <button
              onClick={() => setSelectedTab('pipelines')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedTab === 'pipelines'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Analytics Pipelines
            </button>
          </nav>
        </div>

        <div className="p-6">
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {metrics.map((metric) => (
                  <div key={metric.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">{metric.name}</h4>
                      {getTrendIcon(metric.trend)}
                    </div>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {metric.value.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-600">{metric.unit}</span>
                    </div>
                    <div className={`text-xs ${metric.changePercent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.changePercent > 0 ? '+' : ''}{metric.changePercent.toFixed(1)}% from last hour
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">System Resources</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600">CPU Usage</span>
                        <span className="text-sm font-medium">68%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600">Memory Usage</span>
                        <span className="text-sm font-medium">72%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '72%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600">Storage Usage</span>
                        <span className="text-sm font-medium">45%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Insights</h4>
                  <div className="space-y-3">
                    {insights.slice(0, 3).map((insight) => (
                      <div key={insight.id} className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          insight.severity === 'critical' ? 'bg-red-500' :
                          insight.severity === 'high' ? 'bg-orange-500' :
                          insight.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{insight.title}</p>
                          <p className="text-xs text-gray-600">{insight.timestamp.toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'streams' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Data Streams</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Add Stream
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stream
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Throughput
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Latency
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Error Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Records
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {streams.map((stream) => (
                      <tr key={stream.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{stream.name}</div>
                            <div className="text-sm text-gray-500">Source: {stream.source}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(stream.status)}`}>
                            {stream.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {stream.recordsPerSecond.toLocaleString()}/sec
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {stream.processingLatency}ms
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {stream.errorRate.toFixed(2)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {stream.totalRecords.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedTab === 'insights' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Real-Time Insights</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Auto-refresh:</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
              </div>

              <div className="space-y-4">
                {insights.map((insight) => (
                  <div key={insight.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3">
                        <div className={`w-3 h-3 rounded-full mt-1 ${
                          insight.severity === 'critical' ? 'bg-red-500' :
                          insight.severity === 'high' ? 'bg-orange-500' :
                          insight.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{insight.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(insight.severity)}`}>
                          {insight.severity}
                        </span>
                        <span className="text-xs text-gray-500">{insight.confidence}% confidence</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Type: {insight.type}</span>
                      <span>{insight.timestamp.toLocaleString()}</span>
                    </div>

                    {insight.recommendation && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-md">
                        <p className="text-sm text-blue-800">
                          <strong>Recommendation:</strong> {insight.recommendation}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'pipelines' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Analytics Pipelines</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Create Pipeline
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pipelines.map((pipeline) => (
                  <div key={pipeline.id} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{pipeline.name}</h4>
                        <p className="text-sm text-gray-600">Owner: {pipeline.owner}</p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(pipeline.status)}`}>
                        {pipeline.status}
                      </span>
                    </div>

                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Pipeline Stages:</h5>
                      <div className="flex flex-wrap gap-1">
                        {pipeline.stages.map((stage, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                            {stage}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Throughput:</span>
                        <span className="ml-2 font-medium">{pipeline.throughput}/sec</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Latency:</span>
                        <span className="ml-2 font-medium">{pipeline.latency}ms</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Error Rate:</span>
                        <span className="ml-2 font-medium">{pipeline.errorRate.toFixed(2)}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Last Run:</span>
                        <span className="ml-2 font-medium">{pipeline.lastExecution.toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StreamingAnalytics;