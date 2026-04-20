"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth-context";
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
import { logger, LogCategory } from "@/lib/logger";
import { useAPM } from "@/lib/performance-monitor";

interface MetricData {
  timestamp: string;
  value: number;
  category: string;
}

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
}

interface APIMetrics {
  totalRequests: number;
  errorRate: number;
  avgResponseTime: number;
  requestsPerSecond: number;
}

interface BusinessMetrics {
  activeUsers: number;
  revenue: number;
  orders: number;
  conversionRate: number;
}

interface KPIMetrics {
  customerSatisfaction: number;
  churnRate: number;
  lifetimeValue: number;
  acquisitionCost: number;
  netPromoterScore: number;
}

interface SLAMetrics {
  uptime: number;
  responseTime: number;
  errorBudget: number;
  incidentCount: number;
}

export default function MonitoringDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'system' | 'api' | 'business' | 'kpi' | 'logs' | 'apm'>('overview');
  const { traces, bottlenecks, startTrace, endTrace } = useAPM();
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics[]>([]);
  const [apiMetrics, setApiMetrics] = useState<APIMetrics[]>([]);
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics[]>([]);
  const [kpiMetrics, setKpiMetrics] = useState<KPIMetrics[]>([]);
  const [slaMetrics, setSlaMetrics] = useState<SLAMetrics[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    logger.info(LogCategory.USER_INTERACTION, 'Monitoring dashboard accessed', {
      userId: user?.id,
      tab: activeTab
    });

    // Initialize with mock data
    generateMockData();
  }, [activeTab, user?.id]);

  const generateMockData = () => {
    // Generate system metrics
    const systemData = [];
    for (let i = 0; i < 24; i++) {
      systemData.push({
        timestamp: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        disk: Math.random() * 100,
        network: Math.random() * 1000
      });
    }
    setSystemMetrics(systemData);

    // Generate API metrics
    const apiData = [];
    for (let i = 0; i < 24; i++) {
      apiData.push({
        timestamp: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
        totalRequests: Math.floor(Math.random() * 10000),
        errorRate: Math.random() * 5,
        avgResponseTime: Math.random() * 1000,
        requestsPerSecond: Math.random() * 100
      });
    }
    setApiMetrics(apiData);

    // Generate business metrics
    const businessData = [];
    for (let i = 0; i < 24; i++) {
      businessData.push({
        timestamp: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
        activeUsers: Math.floor(Math.random() * 1000),
        revenue: Math.random() * 100000,
        orders: Math.floor(Math.random() * 500),
        conversionRate: Math.random() * 10
      });
    }
    setBusinessMetrics(businessData);

    // Generate KPI metrics
    const kpiData = [];
    for (let i = 0; i < 24; i++) {
      kpiData.push({
        timestamp: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
        customerSatisfaction: Math.random() * 5 + 3, // 3-8 scale
        churnRate: Math.random() * 5, // 0-5%
        lifetimeValue: Math.random() * 5000 + 1000, // $1000-6000
        acquisitionCost: Math.random() * 500 + 100, // $100-600
        netPromoterScore: Math.random() * 100 - 50 // -50 to 50
      });
    }
    setKpiMetrics(kpiData);

    // Generate SLA metrics
    const slaData = [];
    for (let i = 0; i < 24; i++) {
      slaData.push({
        timestamp: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
        uptime: Math.random() * 2 + 98, // 98-100%
        responseTime: Math.random() * 500 + 100, // 100-600ms
        errorBudget: Math.random() * 10, // 0-10%
        incidentCount: Math.floor(Math.random() * 5) // 0-4 incidents
      });
    }
    setSlaMetrics(slaData);

    // Generate sample logs
    const sampleLogs = [
      { level: 'INFO', category: 'API', message: 'Health check passed', timestamp: new Date().toISOString() },
      { level: 'WARN', category: 'AUTH', message: 'Failed login attempt', timestamp: new Date(Date.now() - 300000).toISOString() },
      { level: 'ERROR', category: 'DATABASE', message: 'Connection timeout', timestamp: new Date(Date.now() - 600000).toISOString() },
      { level: 'INFO', category: 'BUSINESS', message: 'New order created', timestamp: new Date(Date.now() - 900000).toISOString() },
    ];
    setLogs(sampleLogs);

    // Generate alerts
    const sampleAlerts = [
      { severity: 'HIGH', message: 'High CPU usage detected', timestamp: new Date().toISOString() },
      { severity: 'MEDIUM', message: 'API response time above threshold', timestamp: new Date(Date.now() - 300000).toISOString() },
      { severity: 'LOW', message: 'Disk space running low', timestamp: new Date(Date.now() - 600000).toISOString() },
    ];
    setAlerts(sampleAlerts);
  };

  const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'text-red-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <DashboardLayout activeTab="monitoring">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Platform Monitoring</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'system'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              System
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'api'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              API
            </button>
            <button
              onClick={() => setActiveTab('business')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'business'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Business
            </button>
            <button
              onClick={() => setActiveTab('kpi')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'kpi'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              KPIs & SLA
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'logs'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Logs & Alerts
            </button>
            <button
              onClick={() => setActiveTab('apm')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'apm'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              APM & Tracing
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">CPU</span>
                  <span className={`text-sm font-semibold ${getStatusColor(systemMetrics[0]?.cpu || 0, { warning: 70, critical: 90 })}`}>
                    {systemMetrics[0]?.cpu.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-600">Memory</span>
                  <span className={`text-sm font-semibold ${getStatusColor(systemMetrics[0]?.memory || 0, { warning: 75, critical: 90 })}`}>
                    {systemMetrics[0]?.memory.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">API Performance</h3>
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg Response</span>
                  <span className={`text-sm font-semibold ${getStatusColor(apiMetrics[0]?.avgResponseTime || 0, { warning: 500, critical: 1000 })}`}>
                    {apiMetrics[0]?.avgResponseTime.toFixed(0)}ms
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-600">Error Rate</span>
                  <span className={`text-sm font-semibold ${getStatusColor(apiMetrics[0]?.errorRate || 0, { warning: 2, critical: 5 })}`}>
                    {apiMetrics[0]?.errorRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">Business Metrics</h3>
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Users</span>
                  <span className="text-sm font-semibold text-green-600">
                    {businessMetrics[0]?.activeUsers}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-600">Revenue</span>
                  <span className="text-sm font-semibold text-green-600">
                    R{businessMetrics[0]?.revenue.toFixed(0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900">Active Alerts</h3>
              <div className="mt-4">
                <div className="text-3xl font-bold text-red-600">{alerts.length}</div>
                <div className="text-sm text-gray-600">Require attention</div>
              </div>
            </div>
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">CPU Usage</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={systemMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tickFormatter={(value) => new Date(value).getHours() + ':00'} />
                    <YAxis />
                    <Tooltip labelFormatter={(value) => new Date(value).toLocaleString()} />
                    <Line type="monotone" dataKey="cpu" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Memory Usage</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={systemMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tickFormatter={(value) => new Date(value).getHours() + ':00'} />
                    <YAxis />
                    <Tooltip labelFormatter={(value) => new Date(value).toLocaleString()} />
                    <Area type="monotone" dataKey="memory" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* API Tab */}
        {activeTab === 'api' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">API Response Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={apiMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tickFormatter={(value) => new Date(value).getHours() + ':00'} />
                    <YAxis />
                    <Tooltip labelFormatter={(value) => new Date(value).toLocaleString()} />
                    <Bar dataKey="avgResponseTime" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Error Rate</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={apiMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tickFormatter={(value) => new Date(value).getHours() + ':00'} />
                    <YAxis />
                    <Tooltip labelFormatter={(value) => new Date(value).toLocaleString()} />
                    <Line type="monotone" dataKey="errorRate" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Business Tab */}
        {activeTab === 'business' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={businessMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tickFormatter={(value) => new Date(value).getHours() + ':00'} />
                    <YAxis tickFormatter={(value) => `R${value}`} />
                    <Tooltip
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Users</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={businessMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tickFormatter={(value) => new Date(value).getHours() + ':00'} />
                    <YAxis />
                    <Tooltip labelFormatter={(value) => new Date(value).toLocaleString()} />
                    <Line type="monotone" dataKey="activeUsers" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Logs & Alerts Tab */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Logs</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {logs.map((log, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        log.level === 'ERROR' ? 'bg-red-100 text-red-800' :
                        log.level === 'WARN' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {log.level}
                      </span>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{log.category}</div>
                        <div className="text-sm text-gray-600">{log.message}</div>
                        <div className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Alerts</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {alerts.map((alert, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 rounded border-l-4 border-red-400">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        alert.severity === 'HIGH' ? 'bg-red-100 text-red-800' :
                        alert.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {alert.severity}
                      </span>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{alert.message}</div>
                        <div className="text-xs text-gray-400">{new Date(alert.timestamp).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* KPI & SLA Tab */}
        {activeTab === 'kpi' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900">Customer Satisfaction</h3>
                <div className="mt-4">
                  <div className="text-3xl font-bold text-blue-600">
                    {kpiMetrics[0]?.customerSatisfaction.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Out of 8.0</div>
                  <div className="mt-2 text-xs text-green-600">↗️ +2.1% from last month</div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900">Churn Rate</h3>
                <div className="mt-4">
                  <div className="text-3xl font-bold text-red-600">
                    {kpiMetrics[0]?.churnRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Monthly churn</div>
                  <div className="mt-2 text-xs text-red-600">↗️ +0.5% from last month</div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900">System Uptime</h3>
                <div className="mt-4">
                  <div className="text-3xl font-bold text-green-600">
                    {slaMetrics[0]?.uptime.toFixed(2)}%
                  </div>
                  <div className="text-sm text-gray-600">99.9% SLA target</div>
                  <div className="mt-2 text-xs text-green-600">↗️ 99.95% this month</div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900">Response Time</h3>
                <div className="mt-4">
                  <div className="text-3xl font-bold text-yellow-600">
                    {slaMetrics[0]?.responseTime.toFixed(0)}ms
                  </div>
                  <div className="text-sm text-gray-600">&lt; 500ms target</div>
                  <div className="mt-2 text-xs text-yellow-600">⚠️ Above target occasionally</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">NPS Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={kpiMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tickFormatter={(value) => new Date(value).getHours() + ':00'} />
                    <YAxis domain={[-50, 50]} />
                    <Tooltip labelFormatter={(value) => new Date(value).toLocaleString()} />
                    <Line type="monotone" dataKey="netPromoterScore" stroke="#8b5cf6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">LTV vs CAC</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={kpiMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tickFormatter={(value) => new Date(value).getHours() + ':00'} />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <Tooltip labelFormatter={(value) => new Date(value).toLocaleString()} />
                    <Bar dataKey="lifetimeValue" fill="#10b981" />
                    <Bar dataKey="acquisitionCost" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">SLA Compliance</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {slaMetrics.filter(m => m.uptime >= 99.9).length}
                  </div>
                  <div className="text-sm text-gray-600">Days meeting uptime SLA</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {slaMetrics.filter(m => m.responseTime <= 500).length}
                  </div>
                  <div className="text-sm text-gray-600">Hours meeting response time SLA</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {slaMetrics.filter(m => m.incidentCount > 0).length}
                  </div>
                  <div className="text-sm text-gray-600">Days with incidents</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* APM Tab */}
        {activeTab === 'apm' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Bottlenecks</h3>
                <div className="space-y-3">
                  {bottlenecks.slice(0, 5).map((bottleneck, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium text-gray-900">{bottleneck.operation}</div>
                        <div className="text-sm text-gray-600">
                          {bottleneck.callCount} calls • P95: {bottleneck.p95Duration.toFixed(0)}ms
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        bottleneck.impact === 'high' ? 'bg-red-100 text-red-800' :
                        bottleneck.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {bottleneck.impact.toUpperCase()}
                      </span>
                    </div>
                  ))}
                  {bottlenecks.length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                      No bottlenecks detected
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Traces</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {traces.slice(0, 10).map((trace, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium text-gray-900">{trace.name}</div>
                        <div className="text-sm text-gray-600">
                          {trace.duration?.toFixed(0)}ms • {new Date(trace.startTime).toLocaleTimeString()}
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        (trace.duration || 0) > 1000 ? 'bg-red-100 text-red-800' :
                        (trace.duration || 0) > 500 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {(trace.duration || 0) > 1000 ? 'SLOW' : (trace.duration || 0) > 500 ? 'MEDIUM' : 'FAST'}
                      </span>
                    </div>
                  ))}
                  {traces.length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                      No traces recorded yet
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Trace Waterfall</h3>
              <div className="space-y-1">
                {traces.slice(0, 20).map((trace, index) => (
                  <div key={index} className="flex items-center space-x-4 p-2 bg-gray-50 rounded">
                    <div className="w-32 text-sm font-mono text-gray-600">
                      {new Date(trace.startTime).toLocaleTimeString()}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{trace.name}</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className={`h-2 rounded-full ${
                            (trace.duration || 0) > 1000 ? 'bg-red-500' :
                            (trace.duration || 0) > 500 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${Math.min((trace.duration || 0) / 10, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {trace.duration?.toFixed(0)}ms
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}