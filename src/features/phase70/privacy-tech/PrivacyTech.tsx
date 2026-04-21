'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Lock, Eye, Shield, Zap, Database, Network, Cpu, TrendingUp, AlertTriangle, CheckCircle, Settings } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

export interface PrivacyTechnique {
  id: string;
  name: string;
  type: 'differential-privacy' | 'federated-learning' | 'homomorphic-encryption' | 'secure-multi-party-computation' | 'zero-knowledge-proofs';
  status: 'enabled' | 'disabled' | 'configuring' | 'error';
  description: string;
  privacyGuarantee: number; // 0-100 scale
  performanceImpact: number; // percentage overhead
  accuracyRetention: number; // percentage of original accuracy retained
  useCases: string[];
  configuration: Record<string, any>;
  lastUpdated: Date;
  metrics: {
    queriesProcessed: number;
    privacyBudgetUsed: number;
    averageLatency: number;
    errorRate: number;
  };
}

export interface FederatedNode {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'inactive' | 'training' | 'error';
  dataSize: number;
  modelVersion: string;
  lastSync: Date;
  contributionScore: number;
  privacyLevel: number;
  networkLatency: number;
}

export interface PrivacyQuery {
  id: string;
  type: 'aggregate' | 'count' | 'statistics' | 'ml-training';
  dataset: string;
  technique: string;
  parameters: Record<string, any>;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  submittedAt: Date;
  completedAt?: Date;
  result?: any;
  privacyBudget: number;
  executionTime?: number;
  accuracy: number;
}

const SAMPLE_TECHNIQUES: PrivacyTechnique[] = [
  {
    id: 'differential-privacy',
    name: 'Differential Privacy',
    type: 'differential-privacy',
    status: 'enabled',
    description: 'Adds controlled noise to query results to protect individual privacy',
    privacyGuarantee: 95,
    performanceImpact: 15,
    accuracyRetention: 92,
    useCases: ['Analytics', 'Statistics', 'Machine Learning'],
    configuration: {
      epsilon: 0.5,
      delta: 1e-6,
      maxQueries: 1000
    },
    lastUpdated: new Date(),
    metrics: {
      queriesProcessed: 15420,
      privacyBudgetUsed: 45.2,
      averageLatency: 245,
      errorRate: 0.02
    }
  },
  {
    id: 'federated-learning',
    name: 'Federated Learning',
    type: 'federated-learning',
    status: 'enabled',
    description: 'Trains ML models across decentralized devices without exchanging raw data',
    privacyGuarantee: 98,
    performanceImpact: 25,
    accuracyRetention: 88,
    useCases: ['Model Training', 'Personalization', 'Anomaly Detection'],
    configuration: {
      rounds: 10,
      clientsPerRound: 50,
      learningRate: 0.01
    },
    lastUpdated: new Date(),
    metrics: {
      queriesProcessed: 8920,
      privacyBudgetUsed: 12.8,
      averageLatency: 1200,
      errorRate: 0.05
    }
  },
  {
    id: 'homomorphic-encryption',
    name: 'Homomorphic Encryption',
    type: 'homomorphic-encryption',
    status: 'configuring',
    description: 'Allows computation on encrypted data without decryption',
    privacyGuarantee: 100,
    performanceImpact: 80,
    accuracyRetention: 100,
    useCases: ['Secure Computation', 'Financial Analysis', 'Medical Research'],
    configuration: {
      scheme: 'CKKS',
      polynomialDegree: 8192,
      securityLevel: 128
    },
    lastUpdated: new Date(),
    metrics: {
      queriesProcessed: 1250,
      privacyBudgetUsed: 0,
      averageLatency: 5000,
      errorRate: 0.1
    }
  },
  {
    id: 'secure-mpc',
    name: 'Secure Multi-Party Computation',
    type: 'secure-multi-party-computation',
    status: 'disabled',
    description: 'Allows multiple parties to jointly compute functions without revealing inputs',
    privacyGuarantee: 100,
    performanceImpact: 60,
    accuracyRetention: 100,
    useCases: ['Joint Analytics', 'Auction Systems', 'Collaborative Filtering'],
    configuration: {
      parties: 3,
      threshold: 2,
      protocol: 'GMW'
    },
    lastUpdated: new Date(Date.now() - 86400000),
    metrics: {
      queriesProcessed: 0,
      privacyBudgetUsed: 0,
      averageLatency: 0,
      errorRate: 0
    }
  }
];

const SAMPLE_NODES: FederatedNode[] = [
  {
    id: 'node-us-east',
    name: 'US East Data Center',
    location: 'Virginia, USA',
    status: 'active',
    dataSize: 2500000,
    modelVersion: 'v2.1.3',
    lastSync: new Date(),
    contributionScore: 95,
    privacyLevel: 92,
    networkLatency: 45
  },
  {
    id: 'node-eu-west',
    name: 'EU West Data Center',
    location: 'Ireland',
    status: 'training',
    dataSize: 1800000,
    modelVersion: 'v2.1.2',
    lastSync: new Date(Date.now() - 300000),
    contributionScore: 87,
    privacyLevel: 96,
    networkLatency: 62
  },
  {
    id: 'node-ap-southeast',
    name: 'Asia Pacific Data Center',
    location: 'Singapore',
    status: 'active',
    dataSize: 3200000,
    modelVersion: 'v2.1.3',
    lastSync: new Date(Date.now() - 120000),
    contributionScore: 91,
    privacyLevel: 89,
    networkLatency: 125
  },
  {
    id: 'node-mobile-clients',
    name: 'Mobile Client Network',
    location: 'Global',
    status: 'active',
    dataSize: 950000,
    modelVersion: 'v2.1.1',
    lastSync: new Date(Date.now() - 600000),
    contributionScore: 78,
    privacyLevel: 94,
    networkLatency: 180
  }
];

export const PrivacyTech: React.FC = () => {
  const [techniques, setTechniques] = useState<PrivacyTechnique[]>(SAMPLE_TECHNIQUES);
  const [nodes, setNodes] = useState<FederatedNode[]>(SAMPLE_NODES);
  const [queries, setQueries] = useState<PrivacyQuery[]>([]);
  const [selectedTab, setSelectedTab] = useState<'techniques' | 'federated' | 'queries' | 'analytics'>('techniques');

  // Simulate real-time metrics updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTechniques(prev => prev.map(tech => ({
        ...tech,
        metrics: {
          ...tech.metrics,
          queriesProcessed: tech.metrics.queriesProcessed + Math.floor(Math.random() * 10),
          averageLatency: tech.metrics.averageLatency + (Math.random() - 0.5) * 20
        }
      })));

      setNodes(prev => prev.map(node => ({
        ...node,
        networkLatency: Math.max(10, node.networkLatency + (Math.random() - 0.5) * 10),
        lastSync: node.status === 'active' ? new Date() : node.lastSync
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const toggleTechnique = useCallback((techniqueId: string) => {
    setTechniques(prev => prev.map(tech =>
      tech.id === techniqueId
        ? {
            ...tech,
            status: tech.status === 'enabled' ? 'disabled' : 'enabled',
            lastUpdated: new Date()
          }
        : tech
    ));
  }, []);

  const runPrivacyQuery = useCallback(async (techniqueId: string, queryType: string) => {
    const technique = techniques.find(t => t.id === techniqueId);
    if (!technique || technique.status !== 'enabled') return;

    const query: PrivacyQuery = {
      id: `query-${Date.now()}`,
      type: queryType as any,
      dataset: 'user-analytics',
      technique: techniqueId,
      parameters: { sampleSize: 1000 },
      status: 'queued',
      submittedAt: new Date(),
      privacyBudget: Math.random() * 0.1,
      accuracy: 95 + Math.random() * 5
    };

    setQueries(prev => [query, ...prev]);

    // Simulate query execution
    setTimeout(() => {
      setQueries(prev => prev.map(q =>
        q.id === query.id
          ? { ...q, status: 'processing' }
          : q
      ));
    }, 1000);

    setTimeout(() => {
      setQueries(prev => prev.map(q =>
        q.id === query.id
          ? {
              ...q,
              status: 'completed',
              completedAt: new Date(),
              executionTime: Date.now() - query.submittedAt.getTime(),
              result: { count: Math.floor(Math.random() * 10000), accuracy: 95 + Math.random() * 5 },
              accuracy: 95 + Math.random() * 5
            }
          : q
      ));
    }, 3000 + Math.random() * 2000);
  }, [techniques]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enabled':
      case 'active':
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'disabled':
      case 'inactive':
        return 'text-gray-600 bg-gray-100';
      case 'configuring':
      case 'training':
      case 'processing':
        return 'text-blue-600 bg-blue-100';
      case 'error':
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'differential-privacy':
        return 'text-blue-700 bg-blue-100';
      case 'federated-learning':
        return 'text-purple-700 bg-purple-100';
      case 'homomorphic-encryption':
        return 'text-green-700 bg-green-100';
      case 'secure-multi-party-computation':
        return 'text-orange-700 bg-orange-100';
      case 'zero-knowledge-proofs':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const activeTechniques = techniques.filter(t => t.status === 'enabled').length;
  const totalQueriesProcessed = techniques.reduce((sum, t) => sum + t.metrics.queriesProcessed, 0);
  const avgPrivacyGuarantee = techniques.filter(t => t.status === 'enabled')
    .reduce((sum, t) => sum + t.privacyGuarantee, 0) / activeTechniques || 0;
  const activeNodes = nodes.filter(n => n.status === 'active').length;

  // Generate sample chart data
  const performanceData = [
    { time: '00:00', throughput: 1250, latency: 245, privacy: 95 },
    { time: '04:00', throughput: 1180, latency: 267, privacy: 94 },
    { time: '08:00', throughput: 1420, latency: 223, privacy: 96 },
    { time: '12:00', throughput: 1380, latency: 235, privacy: 95 },
    { time: '16:00', throughput: 1590, latency: 198, privacy: 97 },
    { time: '20:00', throughput: 1340, latency: 256, privacy: 94 },
  ];

  const techniqueUsageData = techniques.map(tech => ({
    name: tech.name.split(' ')[0],
    queries: tech.metrics.queriesProcessed,
    accuracy: tech.accuracyRetention
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Privacy Technologies</h1>
              <p className="text-gray-600">Differential privacy and federated learning integration</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{avgPrivacyGuarantee.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Avg Privacy Guarantee</div>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Techniques</p>
              <p className="text-2xl font-bold text-gray-900">{activeTechniques}</p>
            </div>
            <Zap className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Queries Processed</p>
              <p className="text-2xl font-bold text-gray-900">{totalQueriesProcessed.toLocaleString()}</p>
            </div>
            <Database className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Federated Nodes</p>
              <p className="text-2xl font-bold text-gray-900">{activeNodes}</p>
            </div>
            <Network className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Data Protected</p>
              <p className="text-2xl font-bold text-gray-900">2.4M</p>
            </div>
            <Lock className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy vs Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Line yAxisId="left" type="monotone" dataKey="throughput" stroke="#3b82f6" name="Throughput" />
              <Line yAxisId="right" type="monotone" dataKey="privacy" stroke="#10b981" name="Privacy %" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Technique Usage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={techniqueUsageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="queries" fill="#8b5cf6" name="Queries Processed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setSelectedTab('techniques')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedTab === 'techniques'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Privacy Techniques
            </button>
            <button
              onClick={() => setSelectedTab('federated')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedTab === 'federated'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Federated Network
            </button>
            <button
              onClick={() => setSelectedTab('queries')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedTab === 'queries'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Privacy Queries
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
          {selectedTab === 'techniques' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Privacy Techniques</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Add Technique
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {techniques.map((technique) => (
                  <div key={technique.id} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          technique.status === 'enabled' ? 'bg-green-500' :
                          technique.status === 'configuring' ? 'bg-blue-500' :
                          technique.status === 'error' ? 'bg-red-500' : 'bg-gray-500'
                        }`}></div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{technique.name}</h4>
                          <p className="text-sm text-gray-600">{technique.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(technique.type)}`}>
                          {technique.type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-gray-600">Privacy Guarantee:</span>
                        <span className="ml-2 font-medium">{technique.privacyGuarantee}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Performance Impact:</span>
                        <span className="ml-2 font-medium">{technique.performanceImpact}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Accuracy Retention:</span>
                        <span className="ml-2 font-medium">{technique.accuracyRetention}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Queries Processed:</span>
                        <span className="ml-2 font-medium">{technique.metrics.queriesProcessed.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Use Cases:</h5>
                      <div className="flex flex-wrap gap-1">
                        {technique.useCases.map((useCase, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                            {useCase}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-gray-600">Status:</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(technique.status)}`}>
                          {technique.status}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleTechnique(technique.id)}
                          className={`px-3 py-1 text-sm rounded-md ${
                            technique.status === 'enabled'
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {technique.status === 'enabled' ? 'Disable' : 'Enable'}
                        </button>
                        <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
                          Configure
                        </button>
                        <button
                          onClick={() => runPrivacyQuery(technique.id, 'aggregate')}
                          disabled={technique.status !== 'enabled'}
                          className="px-3 py-1 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 disabled:opacity-50"
                        >
                          Test Query
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'federated' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Federated Learning Network</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Add Node
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {nodes.map((node) => (
                  <div key={node.id} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          node.status === 'active' ? 'bg-green-500' :
                          node.status === 'training' ? 'bg-blue-500' :
                          node.status === 'error' ? 'bg-red-500' : 'bg-gray-500'
                        }`}></div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{node.name}</h4>
                          <p className="text-sm text-gray-600">{node.location}</p>
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(node.status)}`}>
                        {node.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-gray-600">Data Size:</span>
                        <span className="ml-2 font-medium">{(node.dataSize / 1000000).toFixed(1)}M records</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Model Version:</span>
                        <span className="ml-2 font-medium">{node.modelVersion}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Contribution Score:</span>
                        <span className="ml-2 font-medium">{node.contributionScore}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Privacy Level:</span>
                        <span className="ml-2 font-medium">{node.privacyLevel}%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="text-gray-600">Network Latency:</span>
                        <span className="ml-2 font-medium">{node.networkLatency}ms</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Last Sync:</span>
                        <span className="ml-2 font-medium">{node.lastSync.toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Federated Learning Progress</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Global Model Training</span>
                      <span className="text-sm font-medium">Round 8 of 10</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">94.2%</div>
                      <div className="text-gray-600">Model Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">47</div>
                      <div className="text-gray-600">Active Nodes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">2.1s</div>
                      <div className="text-gray-600">Avg Round Time</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'queries' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Privacy-Preserving Queries</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  New Query
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Query
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Technique
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Execution Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Accuracy
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Privacy Budget
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {queries.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                          No privacy queries executed yet. Run a test query to see results here.
                        </td>
                      </tr>
                    ) : (
                      queries.map((query) => (
                        <tr key={query.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {query.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {query.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {query.technique}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(query.status)}`}>
                              {query.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {query.executionTime ? `${(query.executionTime / 1000).toFixed(1)}s` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {query.accuracy ? `${query.accuracy.toFixed(1)}%` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {query.privacyBudget.toFixed(3)}
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
              <h3 className="text-lg font-semibold text-gray-900">Privacy Technology Analytics</h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Privacy vs Utility Trade-off</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="privacy" stroke="#10b981" strokeWidth={2} name="Privacy Level %" />
                      <Line type="monotone" dataKey="throughput" stroke="#3b82f6" strokeWidth={2} name="Throughput" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Technique Effectiveness</h4>
                  <div className="space-y-4">
                    {techniques.filter(t => t.status === 'enabled').map(technique => (
                      <div key={technique.id} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{technique.name}</span>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-sm font-medium">{technique.privacyGuarantee}%</div>
                            <div className="text-xs text-gray-500">Privacy</div>
                          </div>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${technique.privacyGuarantee}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Federated Network Health</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Network Stability</span>
                      <span className="text-sm font-medium text-green-600">98.7%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average Sync Time</span>
                      <span className="text-sm font-medium text-blue-600">2.3s</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Data Consistency</span>
                      <span className="text-sm font-medium text-purple-600">99.2%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Privacy Preservation</span>
                      <span className="text-sm font-medium text-green-600">96.8%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Query Performance</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Queries</span>
                      <span className="text-sm font-medium">{totalQueriesProcessed.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Avg Response Time</span>
                      <span className="text-sm font-medium">245ms</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Success Rate</span>
                      <span className="text-sm font-medium text-green-600">97.3%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Privacy Budget Used</span>
                      <span className="text-sm font-medium text-yellow-600">23.4%</span>
                    </div>
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

export default PrivacyTech;