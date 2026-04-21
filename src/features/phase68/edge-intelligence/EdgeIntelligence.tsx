'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Cpu, Brain, Zap, Network, Activity, Server, Cloud, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

export interface EdgeNode {
  id: string;
  location: string;
  region: string;
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  cpuUsage: number;
  memoryUsage: number;
  networkLatency: number;
  activeTasks: number;
  totalTasks: number;
  lastHeartbeat: Date;
  capabilities: string[];
}

export interface AIModel {
  id: string;
  name: string;
  type: 'classification' | 'regression' | 'nlp' | 'computer-vision' | 'anomaly-detection';
  version: string;
  size: number; // in MB
  accuracy: number;
  latency: number; // in ms
  deployedNodes: string[];
  status: 'deployed' | 'deploying' | 'training' | 'failed';
  lastUpdated: Date;
}

export interface EdgeTask {
  id: string;
  type: 'inference' | 'training' | 'preprocessing' | 'optimization';
  modelId?: string;
  nodeId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
  result?: any;
  error?: string;
}

export interface EdgeAnalytics {
  totalNodes: number;
  activeNodes: number;
  totalTasksProcessed: number;
  avgResponseTime: number;
  modelsDeployed: number;
  dataProcessedGB: number;
  uptimePercentage: number;
  costSavings: number;
}

const EDGE_NODES: EdgeNode[] = [
  {
    id: 'edge-us-east-1',
    location: 'New York, USA',
    region: 'US East',
    status: 'active',
    cpuUsage: 65,
    memoryUsage: 72,
    networkLatency: 12,
    activeTasks: 8,
    totalTasks: 1247,
    lastHeartbeat: new Date(),
    capabilities: ['inference', 'preprocessing', 'optimization']
  },
  {
    id: 'edge-eu-west-1',
    location: 'London, UK',
    region: 'EU West',
    status: 'active',
    cpuUsage: 58,
    memoryUsage: 68,
    networkLatency: 18,
    activeTasks: 6,
    totalTasks: 892,
    lastHeartbeat: new Date(),
    capabilities: ['inference', 'training', 'nlp']
  },
  {
    id: 'edge-ap-southeast-1',
    location: 'Singapore',
    region: 'Asia Pacific',
    status: 'active',
    cpuUsage: 71,
    memoryUsage: 75,
    networkLatency: 45,
    activeTasks: 12,
    totalTasks: 1567,
    lastHeartbeat: new Date(),
    capabilities: ['inference', 'computer-vision', 'anomaly-detection']
  },
  {
    id: 'edge-sa-east-1',
    location: 'São Paulo, Brazil',
    region: 'South America',
    status: 'maintenance',
    cpuUsage: 0,
    memoryUsage: 0,
    networkLatency: 120,
    activeTasks: 0,
    totalTasks: 234,
    lastHeartbeat: new Date(Date.now() - 3600000),
    capabilities: ['inference', 'preprocessing']
  },
];

const AI_MODELS: AIModel[] = [
  {
    id: 'financial-anomaly-detector',
    name: 'Financial Anomaly Detector',
    type: 'anomaly-detection',
    version: '2.1.0',
    size: 45,
    accuracy: 96.7,
    latency: 8,
    deployedNodes: ['edge-us-east-1', 'edge-eu-west-1'],
    status: 'deployed',
    lastUpdated: new Date('2024-04-20')
  },
  {
    id: 'sentiment-analyzer',
    name: 'Sentiment Analyzer',
    type: 'nlp',
    version: '1.8.2',
    size: 78,
    accuracy: 92.4,
    latency: 15,
    deployedNodes: ['edge-us-east-1', 'edge-eu-west-1', 'edge-ap-southeast-1'],
    status: 'deployed',
    lastUpdated: new Date('2024-04-19')
  },
  {
    id: 'image-classifier',
    name: 'Image Classifier',
    type: 'computer-vision',
    version: '3.2.1',
    size: 156,
    accuracy: 94.8,
    latency: 25,
    deployedNodes: ['edge-ap-southeast-1'],
    status: 'deploying',
    lastUpdated: new Date()
  },
  {
    id: 'predictive-maintenance',
    name: 'Predictive Maintenance',
    type: 'regression',
    version: '1.5.0',
    size: 62,
    accuracy: 89.3,
    latency: 12,
    deployedNodes: ['edge-us-east-1', 'edge-eu-west-1'],
    status: 'deployed',
    lastUpdated: new Date('2024-04-18')
  },
];

export const EdgeIntelligence: React.FC = () => {
  const [nodes, setNodes] = useState<EdgeNode[]>(EDGE_NODES);
  const [models, setModels] = useState<AIModel[]>(AI_MODELS);
  const [tasks, setTasks] = useState<EdgeTask[]>([]);
  const [selectedTab, setSelectedTab] = useState<'nodes' | 'models' | 'tasks' | 'analytics'>('nodes');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setNodes(prev => prev.map(node => ({
        ...node,
        cpuUsage: Math.max(0, Math.min(100, node.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(0, Math.min(100, node.memoryUsage + (Math.random() - 0.5) * 8)),
        networkLatency: Math.max(5, node.networkLatency + (Math.random() - 0.5) * 5),
        lastHeartbeat: new Date()
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const deployModel = useCallback(async (modelId: string, nodeId: string) => {
    setModels(prev => prev.map(model =>
      model.id === modelId
        ? { ...model, status: 'deploying' as const }
        : model
    ));

    // Simulate deployment
    setTimeout(() => {
      setModels(prev => prev.map(model =>
        model.id === modelId
          ? {
              ...model,
              status: 'deployed' as const,
              deployedNodes: [...model.deployedNodes, nodeId],
              lastUpdated: new Date()
            }
          : model
      ));
    }, 3000);
  }, []);

  const runInference = useCallback(async (modelId: string, nodeId: string, data: any) => {
    const task: EdgeTask = {
      id: `task-${Date.now()}`,
      type: 'inference',
      modelId,
      nodeId,
      status: 'queued',
      priority: 'medium',
      startedAt: new Date()
    };

    setTasks(prev => [task, ...prev]);

    // Simulate task execution
    setTimeout(() => {
      setTasks(prev => prev.map(t =>
        t.id === task.id
          ? { ...t, status: 'running' as const }
          : t
      ));
    }, 1000);

    setTimeout(() => {
      setTasks(prev => prev.map(t =>
        t.id === task.id
          ? {
              ...t,
              status: 'completed' as const,
              completedAt: new Date(),
              duration: Date.now() - task.startedAt!.getTime(),
              result: { prediction: Math.random() > 0.5 ? 'anomaly' : 'normal', confidence: Math.random() * 0.3 + 0.7 }
            }
          : t
      ));
    }, 2000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'deployed':
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'inactive':
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'maintenance':
      case 'deploying':
      case 'running':
        return 'text-yellow-600 bg-yellow-100';
      case 'queued':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'deployed':
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'inactive':
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'maintenance':
      case 'deploying':
      case 'running':
        return <Activity className="w-4 h-4 text-yellow-500 animate-pulse" />;
      default:
        return <Server className="w-4 h-4 text-gray-500" />;
    }
  };

  const activeNodes = nodes.filter(n => n.status === 'active').length;
  const totalTasks = nodes.reduce((sum, node) => sum + node.totalTasks, 0);
  const avgCpuUsage = nodes.filter(n => n.status === 'active').reduce((sum, node) => sum + node.cpuUsage, 0) / activeNodes;
  const avgMemoryUsage = nodes.filter(n => n.status === 'active').reduce((sum, node) => sum + node.memoryUsage, 0) / activeNodes;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="w-8 h-8 text-purple-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edge Intelligence</h1>
              <p className="text-gray-600">Distributed computing and AI processing at the edge</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Nodes</p>
              <p className="text-2xl font-bold text-gray-900">{activeNodes}/{nodes.length}</p>
            </div>
            <Server className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg CPU Usage</p>
              <p className="text-2xl font-bold text-gray-900">{avgCpuUsage.toFixed(1)}%</p>
            </div>
            <Cpu className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{totalTasks.toLocaleString()}</p>
            </div>
            <Activity className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Models Deployed</p>
              <p className="text-2xl font-bold text-gray-900">{models.filter(m => m.status === 'deployed').length}</p>
            </div>
            <Brain className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setSelectedTab('nodes')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedTab === 'nodes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Edge Nodes
            </button>
            <button
              onClick={() => setSelectedTab('models')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedTab === 'models'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              AI Models
            </button>
            <button
              onClick={() => setSelectedTab('tasks')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedTab === 'tasks'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Tasks
            </button>
            <button
              onClick={() => setSelectedTab('analytics')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>

        <div className="p-6">
          {selectedTab === 'nodes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Edge Computing Nodes</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Add Node
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {nodes.map((node) => (
                  <div key={node.id} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(node.status)}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{node.location}</h4>
                          <p className="text-sm text-gray-600">{node.region}</p>
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(node.status)}`}>
                        {node.status}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">CPU</span>
                            <span className="text-sm font-medium">{node.cpuUsage.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${node.cpuUsage}%` }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">Memory</span>
                            <span className="text-sm font-medium">{node.memoryUsage.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${node.memoryUsage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Network Latency:</span>
                          <span className="ml-2 text-gray-900">{node.networkLatency}ms</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Active Tasks:</span>
                          <span className="ml-2 text-gray-900">{node.activeTasks}</span>
                        </div>
                      </div>

                      <div>
                        <span className="font-medium text-gray-700 text-sm">Capabilities:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {node.capabilities.map((cap, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                              {cap}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="text-xs text-gray-500">
                        Last heartbeat: {node.lastHeartbeat.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'models' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">AI Models</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Train New Model
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Model
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Performance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Deployed Nodes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {models.map((model) => (
                      <tr key={model.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{model.name}</div>
                            <div className="text-sm text-gray-500">v{model.version} • {model.size}MB</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {model.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>Accuracy: {model.accuracy.toFixed(1)}%</div>
                          <div>Latency: {model.latency}ms</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(model.status)}`}>
                            {getStatusIcon(model.status)}
                            <span className="ml-1 capitalize">{model.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {model.deployedNodes.length} nodes
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => runInference(model.id, model.deployedNodes[0], {})}
                              className="text-blue-600 hover:text-blue-900"
                              disabled={model.status !== 'deployed'}
                            >
                              Run Test
                            </button>
                            <button
                              onClick={() => deployModel(model.id, nodes.find(n => n.status === 'active')?.id || '')}
                              className="text-green-600 hover:text-green-900"
                            >
                              Deploy
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedTab === 'tasks' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Edge Tasks</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Create Task
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Task
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Node
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Result
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tasks.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                          No tasks running. Create a task or run model inference to see activity here.
                        </td>
                      </tr>
                    ) : (
                      tasks.map((task) => (
                        <tr key={task.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {task.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                              {task.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {task.nodeId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {task.duration ? `${task.duration}ms` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {task.result ? (
                              <span className="text-green-600">Success</span>
                            ) : task.error ? (
                              <span className="text-red-600">Error</span>
                            ) : (
                              '-'
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Edge Intelligence Analytics</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Network className="w-8 h-8 text-blue-600" />
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Network Efficiency</h4>
                      <p className="text-sm text-gray-600">Avg latency across all nodes</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {nodes.filter(n => n.status === 'active').reduce((sum, n) => sum + n.networkLatency, 0) / activeNodes}ms
                  </div>
                  <div className="text-sm text-green-600 mt-1">↓ 15% from last month</div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Zap className="w-8 h-8 text-yellow-600" />
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Processing Power</h4>
                      <p className="text-sm text-gray-600">Total edge compute capacity</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {nodes.filter(n => n.status === 'active').length * 100} vCPUs
                  </div>
                  <div className="text-sm text-blue-600 mt-1">↑ 25% utilization</div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Cloud className="w-8 h-8 text-purple-600" />
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Data Processed</h4>
                      <p className="text-sm text-gray-600">Edge data processing volume</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {(totalTasks * 0.1).toFixed(1)} TB
                  </div>
                  <div className="text-sm text-green-600 mt-1">↑ 40% efficiency</div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Cost Savings</h4>
                      <p className="text-sm text-gray-600">Reduced cloud transfer costs</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    $45,230
                  </div>
                  <div className="text-sm text-green-600 mt-1">↑ 35% savings</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Model Performance</h4>
                  <div className="space-y-3">
                    {models.filter(m => m.status === 'deployed').map(model => (
                      <div key={model.id} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{model.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{model.accuracy.toFixed(1)}%</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${model.accuracy}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Node Utilization</h4>
                  <div className="space-y-3">
                    {nodes.filter(n => n.status === 'active').map(node => (
                      <div key={node.id} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{node.location}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{node.cpuUsage.toFixed(0)}%</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${node.cpuUsage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EdgeIntelligence;