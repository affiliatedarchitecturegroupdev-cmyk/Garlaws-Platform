'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Deployment {
  id: string;
  environment: 'production' | 'staging' | 'development';
  status: 'success' | 'failed' | 'running' | 'queued';
  branch: string;
  commit: string;
  startedAt: string;
  duration?: number;
  url?: string;
}

interface Pipeline {
  id: string;
  name: string;
  status: 'passing' | 'failing' | 'running' | 'unknown';
  lastRun: string;
  duration: number;
  stages: string[];
  trigger: 'push' | 'manual' | 'schedule';
}

interface Infrastructure {
  id: string;
  name: string;
  type: 'web' | 'api' | 'database' | 'cache' | 'cdn';
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  region: string;
  uptime: string;
  cpu: number;
  memory: number;
  requests: number;
}

const deployments: Deployment[] = [
  {
    id: 'dep_001',
    environment: 'production',
    status: 'success',
    branch: 'main',
    commit: 'a1b2c3d4',
    startedAt: '2026-04-21T14:00:00Z',
    duration: 420,
    url: 'https://garlaws.com'
  },
  {
    id: 'dep_002',
    environment: 'staging',
    status: 'running',
    branch: 'feature/ai-models',
    commit: 'e5f6g7h8',
    startedAt: '2026-04-21T14:15:00Z'
  },
  {
    id: 'dep_003',
    environment: 'development',
    status: 'failed',
    branch: 'bugfix/auth',
    commit: 'i9j0k1l2',
    startedAt: '2026-04-21T13:45:00Z',
    duration: 180
  }
];

const pipelines: Pipeline[] = [
  {
    id: 'pipe_001',
    name: 'Frontend CI/CD',
    status: 'passing',
    lastRun: '2026-04-21T14:00:00Z',
    duration: 420,
    stages: ['build', 'test', 'lint', 'deploy'],
    trigger: 'push'
  },
  {
    id: 'pipe_002',
    name: 'Backend API Tests',
    status: 'failing',
    lastRun: '2026-04-21T13:30:00Z',
    duration: 180,
    stages: ['unit-tests', 'integration-tests', 'security-scan'],
    trigger: 'push'
  },
  {
    id: 'pipe_003',
    name: 'Database Migrations',
    status: 'passing',
    lastRun: '2026-04-21T12:00:00Z',
    duration: 60,
    stages: ['validate', 'backup', 'migrate', 'verify'],
    trigger: 'manual'
  }
];

const infrastructure: Infrastructure[] = [
  {
    id: 'inf_001',
    name: 'Web Server (US East)',
    type: 'web',
    status: 'healthy',
    region: 'us-east-1',
    uptime: '99.9%',
    cpu: 45,
    memory: 67,
    requests: 1250
  },
  {
    id: 'inf_002',
    name: 'API Gateway (EU West)',
    type: 'api',
    status: 'healthy',
    region: 'eu-west-1',
    uptime: '99.8%',
    cpu: 32,
    memory: 54,
    requests: 890
  },
  {
    id: 'inf_003',
    name: 'Database Cluster',
    type: 'database',
    status: 'warning',
    region: 'us-east-1',
    uptime: '99.5%',
    cpu: 78,
    memory: 82,
    requests: 2100
  },
  {
    id: 'inf_004',
    name: 'Redis Cache',
    type: 'cache',
    status: 'healthy',
    region: 'us-west-2',
    uptime: '99.9%',
    cpu: 23,
    memory: 34,
    requests: 5600
  }
];

export default function DevOpsInfrastructure() {
  const [selectedTab, setSelectedTab] = useState<'deployments' | 'pipelines' | 'infrastructure' | 'monitoring'>('deployments');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentProgress, setDeploymentProgress] = useState(0);

  const runDeployment = async () => {
    setIsDeploying(true);
    setDeploymentProgress(0);

    const stages = [
      'Building application...',
      'Running tests...',
      'Creating artifacts...',
      'Deploying to staging...',
      'Running health checks...',
      'Switching traffic...'
    ];

    for (let i = 0; i < stages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setDeploymentProgress(((i + 1) / stages.length) * 100);
    }

    setIsDeploying(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
      case 'passing':
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'failed':
      case 'failing':
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'queued':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
      case 'passing':
      case 'healthy':
        return '✅';
      case 'failed':
      case 'failing':
      case 'critical':
        return '❌';
      case 'running':
        return '🔄';
      case 'warning':
        return '⚠️';
      case 'queued':
        return '⏳';
      default:
        return '❓';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">Garlaws</span>
            </Link>

            <div className="flex items-center gap-8">
              <Link href="/devops" className="text-gray-600 hover:text-gray-900">DevOps</Link>
              <Link href="/deploy" className="text-gray-600 hover:text-gray-900">Deployments</Link>
              <Link href="/infra" className="text-gray-600 hover:text-gray-900">Infrastructure</Link>
              <Link href="/monitoring" className="text-gray-600 hover:text-gray-900">Monitoring</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">DevOps & Infrastructure</h1>
          <p className="text-gray-600">Advanced deployment, monitoring, and CI/CD infrastructure</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Deployments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {deployments.filter(d => d.status === 'running').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-sm">🚀</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pipeline Health</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pipelines.filter(p => p.status === 'passing').length}/{pipelines.length}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-sm">🔧</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Infrastructure Uptime</p>
                <p className="text-2xl font-bold text-gray-900">99.7%</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-sm">🏗️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 text-sm">⚠️</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { id: 'deployments', label: 'Deployments' },
                { id: 'pipelines', label: 'CI/CD Pipelines' },
                { id: 'infrastructure', label: 'Infrastructure' },
                { id: 'monitoring', label: 'Monitoring' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {selectedTab === 'deployments' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Deployment History</h2>
                  <button
                    onClick={runDeployment}
                    disabled={isDeploying}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeploying ? 'Deploying...' : 'New Deployment'}
                  </button>
                </div>

                {isDeploying && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      <span className="text-blue-800 font-medium">Deploying to production...</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${deploymentProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {deployments.map((deployment) => (
                    <div key={deployment.id} className="p-6 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <span className="text-lg">{getStatusIcon(deployment.status)}</span>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {deployment.environment} deployment
                            </h3>
                            <p className="text-sm text-gray-600">
                              {deployment.branch} • {deployment.commit.slice(0, 8)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(deployment.status)}`}>
                            {deployment.status}
                          </span>
                          {deployment.url && (
                            <a
                              href={deployment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              View →
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Started: {new Date(deployment.startedAt).toLocaleString()}</span>
                        {deployment.duration && (
                          <span>Duration: {Math.floor(deployment.duration / 60)}m {deployment.duration % 60}s</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTab === 'pipelines' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">CI/CD Pipelines</h2>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
                    Run All Pipelines
                  </button>
                </div>

                <div className="space-y-4">
                  {pipelines.map((pipeline) => (
                    <div key={pipeline.id} className="p-6 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{getStatusIcon(pipeline.status)}</span>
                          <div>
                            <h3 className="font-medium text-gray-900">{pipeline.name}</h3>
                            <p className="text-sm text-gray-600">
                              Last run: {new Date(pipeline.lastRun).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(pipeline.status)}`}>
                            {pipeline.status}
                          </span>
                          <span className="text-sm text-gray-600">
                            {Math.floor(pipeline.duration / 60)}m {pipeline.duration % 60}s
                          </span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          {pipeline.stages.map((stage, index) => (
                            <div key={stage} className="flex items-center">
                              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                {stage}
                              </span>
                              {index < pipeline.stages.length - 1 && (
                                <span className="mx-2 text-gray-400">→</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Trigger: {pipeline.trigger}</span>
                        <button className="text-blue-600 hover:text-blue-800">Re-run Pipeline</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTab === 'infrastructure' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Infrastructure Status</h2>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                    Scale Resources
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {infrastructure.map((infra) => (
                    <div key={infra.id} className="p-6 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{getStatusIcon(infra.status)}</span>
                          <div>
                            <h3 className="font-medium text-gray-900">{infra.name}</h3>
                            <p className="text-sm text-gray-600">{infra.region} • {infra.type}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(infra.status)}`}>
                          {infra.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">CPU</span>
                            <span className="text-gray-900">{infra.cpu}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${infra.cpu > 80 ? 'bg-red-500' : infra.cpu > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                              style={{ width: `${infra.cpu}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Memory</span>
                            <span className="text-gray-900">{infra.memory}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${infra.memory > 80 ? 'bg-red-500' : infra.memory > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                              style={{ width: `${infra.memory}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Uptime: {infra.uptime}</span>
                        <span>Requests: {infra.requests.toLocaleString()}/min</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTab === 'monitoring' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">System Monitoring</h2>
                  <div className="flex gap-3">
                    <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300">
                      Configure Alerts
                    </button>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                      View Logs
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Error Rate</h3>
                    <p className="text-2xl font-bold text-red-600">0.12%</p>
                    <p className="text-xs text-gray-600">Last 24 hours</p>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                      <div className="bg-red-500 h-1 rounded-full" style={{ width: '12%' }} />
                    </div>
                  </div>

                  <div className="p-6 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Response Time</h3>
                    <p className="text-2xl font-bold text-green-600">245ms</p>
                    <p className="text-xs text-gray-600">Average P95</p>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                      <div className="bg-green-500 h-1 rounded-full" style={{ width: '85%' }} />
                    </div>
                  </div>

                  <div className="p-6 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Throughput</h3>
                    <p className="text-2xl font-bold text-blue-600">1,247</p>
                    <p className="text-xs text-gray-600">Requests/second</p>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                      <div className="bg-blue-500 h-1 rounded-full" style={{ width: '78%' }} />
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-red-400 text-xl">🚨</span>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Active Alerts</h3>
                      <div className="mt-2 text-sm text-red-700 space-y-1">
                        <p>• Database CPU usage above 80% threshold</p>
                        <p>• API response time degraded in EU region</p>
                        <p>• Failed deployment in staging environment</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Logs</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {[
                      { level: 'error', message: 'Database connection timeout', time: '14:32:15' },
                      { level: 'warn', message: 'High memory usage detected', time: '14:31:42' },
                      { level: 'info', message: 'Deployment completed successfully', time: '14:30:18' },
                      { level: 'info', message: 'Cache hit rate improved to 94%', time: '14:29:33' },
                      { level: 'error', message: 'API rate limit exceeded', time: '14:28:51' },
                      { level: 'info', message: 'New user registration processed', time: '14:27:19' }
                    ].map((log, index) => (
                      <div key={index} className="flex items-center gap-3 text-sm">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          log.level === 'error' ? 'bg-red-100 text-red-800' :
                          log.level === 'warn' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {log.level}
                        </span>
                        <span className="text-gray-600">{log.time}</span>
                        <span className="text-gray-900 flex-1">{log.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}