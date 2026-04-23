'use client'

import { useState, useEffect, useMemo } from 'react'
import { Globe, Zap, BarChart3, Activity, Settings, Play, Pause, RotateCcw, TrendingUp, TrendingDown, Clock, Cpu, Database } from 'lucide-react'

// Types for ML Model Serving
interface ModelEndpoint {
  id: string
  modelId: string
  modelName: string
  version: string
  endpoint: string
  status: 'active' | 'inactive' | 'scaling' | 'error' | 'maintenance'
  framework: 'tensorflow' | 'pytorch' | 'onnx' | 'tensorflow-js' | 'tflite'
  runtime: 'cpu' | 'gpu' | 'tpu' | 'webgpu'
  instances: ServingInstance[]
  configuration: EndpointConfig
  metrics: EndpointMetrics
  createdAt: Date
  lastDeployed: Date
}

interface ServingInstance {
  id: string
  instanceId: string
  status: 'healthy' | 'unhealthy' | 'starting' | 'stopping'
  host: string
  port: number
  resources: {
    cpu: number
    memory: number
    gpu?: number
  }
  load: {
    requestsPerSecond: number
    averageLatency: number
    errorRate: number
    activeConnections: number
  }
  uptime: number
  lastHealthCheck: Date
}

interface EndpointConfig {
  autoScaling: {
    enabled: boolean
    minInstances: number
    maxInstances: number
    targetCpuUtilization: number
    targetLatency: number
  }
  loadBalancing: {
    algorithm: 'round_robin' | 'least_connections' | 'weighted' | 'ip_hash'
    stickySessions: boolean
  }
  caching: {
    enabled: boolean
    ttl: number
    maxSize: number
  }
  rateLimiting: {
    enabled: boolean
    requestsPerSecond: number
    burstLimit: number
  }
  monitoring: {
    enabled: boolean
    metricsInterval: number
    logLevel: 'debug' | 'info' | 'warn' | 'error'
  }
}

interface EndpointMetrics {
  totalRequests: number
  totalErrors: number
  averageLatency: number
  p95Latency: number
  p99Latency: number
  throughput: number
  uptime: number
  cost: number
  timeSeries: {
    timestamp: Date
    requests: number
    latency: number
    errors: number
  }[]
}

interface InferenceRequest {
  id: string
  endpointId: string
  timestamp: Date
  input: any
  output?: any
  latency: number
  status: 'success' | 'error' | 'timeout'
  instanceId: string
  clientIp: string
  userAgent: string
  error?: string
}

interface PerformanceOptimization {
  id: string
  name: string
  description: string
  type: 'quantization' | 'caching' | 'batch_processing' | 'model_optimization' | 'hardware_acceleration'
  applied: boolean
  impact: {
    latencyReduction: number
    throughputIncrease: number
    memoryReduction: number
    costSavings: number
  }
  configuration: Record<string, any>
  compatibility: string[]
}

interface ABTest {
  id: string
  name: string
  description: string
  status: 'running' | 'completed' | 'stopped'
  variants: TestVariant[]
  trafficSplit: Record<string, number>
  metrics: TestMetric[]
  startDate: Date
  endDate?: Date
  winner?: string
  confidence: number
}

interface TestVariant {
  id: string
  name: string
  modelId: string
  version: string
  weight: number
  metrics: {
    requests: number
    conversions: number
    latency: number
    errors: number
  }
}

interface TestMetric {
  name: string
  baseline: number
  variants: Record<string, number>
  improvement: Record<string, number>
  significance: Record<string, number>
}

export default function MLModelServing() {
  // Sample model endpoints
  const [endpoints] = useState<ModelEndpoint[]>([
    {
      id: 'endpoint-001',
      modelId: 'model-001',
      modelName: 'Customer Churn Predictor',
      version: 'v2.1.3',
      endpoint: 'https://api.company.com/v1/models/churn-predictor',
      status: 'active',
      framework: 'tensorflow',
      runtime: 'gpu',
      instances: [
        {
          id: 'inst-001',
          instanceId: 'gpu-instance-01',
          status: 'healthy',
          host: '10.0.1.100',
          port: 8501,
          resources: { cpu: 4, memory: 16, gpu: 1 },
          load: { requestsPerSecond: 45, averageLatency: 45, errorRate: 0.02, activeConnections: 12 },
          uptime: 168,
          lastHealthCheck: new Date(Date.now() - 30 * 1000)
        },
        {
          id: 'inst-002',
          instanceId: 'gpu-instance-02',
          status: 'healthy',
          host: '10.0.1.101',
          port: 8501,
          resources: { cpu: 4, memory: 16, gpu: 1 },
          load: { requestsPerSecond: 38, averageLatency: 52, errorRate: 0.01, activeConnections: 8 },
          uptime: 156,
          lastHealthCheck: new Date(Date.now() - 25 * 1000)
        }
      ],
      configuration: {
        autoScaling: { enabled: true, minInstances: 1, maxInstances: 5, targetCpuUtilization: 70, targetLatency: 100 },
        loadBalancing: { algorithm: 'round_robin', stickySessions: false },
        caching: { enabled: true, ttl: 300, maxSize: 1000 },
        rateLimiting: { enabled: true, requestsPerSecond: 100, burstLimit: 200 },
        monitoring: { enabled: true, metricsInterval: 60, logLevel: 'info' }
      },
      metrics: {
        totalRequests: 125000,
        totalErrors: 250,
        averageLatency: 48,
        p95Latency: 85,
        p99Latency: 120,
        throughput: 83,
        uptime: 99.7,
        cost: 45.20,
        timeSeries: []
      },
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      lastDeployed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'endpoint-002',
      modelId: 'model-002',
      modelName: 'Demand Forecaster',
      version: 'v1.8.5',
      endpoint: 'https://api.company.com/v1/models/demand-forecaster',
      status: 'active',
      framework: 'pytorch',
      runtime: 'cpu',
      instances: [
        {
          id: 'inst-003',
          instanceId: 'cpu-instance-01',
          status: 'healthy',
          host: '10.0.2.100',
          port: 8080,
          resources: { cpu: 8, memory: 32 },
          load: { requestsPerSecond: 25, averageLatency: 67, errorRate: 0.005, activeConnections: 5 },
          uptime: 240,
          lastHealthCheck: new Date(Date.now() - 45 * 1000)
        }
      ],
      configuration: {
        autoScaling: { enabled: false, minInstances: 1, maxInstances: 1, targetCpuUtilization: 80, targetLatency: 200 },
        loadBalancing: { algorithm: 'round_robin', stickySessions: false },
        caching: { enabled: false, ttl: 0, maxSize: 0 },
        rateLimiting: { enabled: true, requestsPerSecond: 50, burstLimit: 100 },
        monitoring: { enabled: true, metricsInterval: 60, logLevel: 'info' }
      },
      metrics: {
        totalRequests: 45000,
        totalErrors: 75,
        averageLatency: 67,
        p95Latency: 95,
        p99Latency: 140,
        throughput: 25,
        uptime: 99.9,
        cost: 12.80,
        timeSeries: []
      },
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      lastDeployed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  ])

  // Sample inference requests
  const [inferenceRequests] = useState<InferenceRequest[]>([
    {
      id: 'req-001',
      endpointId: 'endpoint-001',
      timestamp: new Date(Date.now() - 30 * 1000),
      input: { features: [0.8, 0.6, 0.9, 0.7, 0.5] },
      output: { prediction: 0.23, probability: 0.77 },
      latency: 45,
      status: 'success',
      instanceId: 'gpu-instance-01',
      clientIp: '192.168.1.100',
      userAgent: 'Python/3.9 aiohttp/3.8.1'
    },
    {
      id: 'req-002',
      endpointId: 'endpoint-001',
      timestamp: new Date(Date.now() - 25 * 1000),
      input: { features: [0.3, 0.8, 0.2, 0.9, 0.1] },
      output: { prediction: 0.85, probability: 0.15 },
      latency: 42,
      status: 'success',
      instanceId: 'gpu-instance-02',
      clientIp: '192.168.1.101',
      userAgent: 'curl/7.68.0'
    },
    {
      id: 'req-003',
      endpointId: 'endpoint-002',
      timestamp: new Date(Date.now() - 60 * 1000),
      input: { time_series: [100, 120, 95, 110, 130, 125] },
      output: { forecast: [135, 142, 138, 145, 152] },
      latency: 67,
      status: 'success',
      instanceId: 'cpu-instance-01',
      clientIp: '10.0.0.50',
      userAgent: 'Node.js/16 axios/0.24.0'
    }
  ])

  // Sample performance optimizations
  const [optimizations] = useState<PerformanceOptimization[]>([
    {
      id: 'opt-001',
      name: 'TensorRT Optimization',
      description: 'GPU-accelerated inference with TensorRT optimization',
      type: 'hardware_acceleration',
      applied: true,
      impact: {
        latencyReduction: 0.65,
        throughputIncrease: 2.8,
        memoryReduction: 0.9,
        costSavings: 0.3
      },
      configuration: { precision: 'fp16', max_batch_size: 32 },
      compatibility: ['nvidia-gpu', 'tensorflow', 'pytorch']
    },
    {
      id: 'opt-002',
      name: 'Model Quantization',
      description: '8-bit quantization for reduced latency and memory usage',
      type: 'quantization',
      applied: true,
      impact: {
        latencyReduction: 0.4,
        throughputIncrease: 1.6,
        memoryReduction: 0.75,
        costSavings: 0.25
      },
      configuration: { method: 'dynamic', bits: 8 },
      compatibility: ['cpu', 'gpu', 'tensorflow', 'pytorch']
    },
    {
      id: 'opt-003',
      name: 'Response Caching',
      description: 'Intelligent caching of frequent inference requests',
      type: 'caching',
      applied: false,
      impact: {
        latencyReduction: 0.8,
        throughputIncrease: 3.2,
        memoryReduction: 0.95,
        costSavings: 0.4
      },
      configuration: { ttl: 300, max_entries: 10000, strategy: 'lru' },
      compatibility: ['all']
    }
  ])

  // Sample A/B tests
  const [abTests] = useState<ABTest[]>([
    {
      id: 'ab-001',
      name: 'Churn Model A/B Test',
      description: 'Comparing v2.1.3 vs v2.1.4 of churn prediction model',
      status: 'running',
      variants: [
        {
          id: 'variant-a',
          name: 'Current Model',
          modelId: 'model-001',
          version: 'v2.1.3',
          weight: 50,
          metrics: { requests: 1250, conversions: 187, latency: 45, errors: 3 }
        },
        {
          id: 'variant-b',
          name: 'New Model',
          modelId: 'model-001',
          version: 'v2.1.4',
          weight: 50,
          metrics: { requests: 1180, conversions: 206, latency: 42, errors: 2 }
        }
      ],
      trafficSplit: { 'variant-a': 50, 'variant-b': 50 },
      metrics: [
        {
          name: 'Conversion Rate',
          baseline: 0.149,
          variants: { 'variant-a': 0.150, 'variant-b': 0.174 },
          improvement: { 'variant-a': 0.6, 'variant-b': 16.8 },
          significance: { 'variant-a': 0.05, 'variant-b': 0.98 }
        }
      ],
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      confidence: 0.95
    }
  ])

  const [selectedEndpoint, setSelectedEndpoint] = useState<ModelEndpoint | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<InferenceRequest | null>(null)

  // Calculate serving metrics
  const servingMetrics = useMemo(() => {
    const totalEndpoints = endpoints.length
    const activeEndpoints = endpoints.filter(e => e.status === 'active').length
    const totalInstances = endpoints.reduce((sum, e) => sum + e.instances.length, 0)
    const healthyInstances = endpoints.reduce((sum, e) => sum + e.instances.filter(i => i.status === 'healthy').length, 0)

    const totalRequests = endpoints.reduce((sum, e) => sum + e.metrics.totalRequests, 0)
    const totalErrors = endpoints.reduce((sum, e) => sum + e.metrics.totalErrors, 0)
    const avgLatency = endpoints.reduce((sum, e) => sum + e.metrics.averageLatency, 0) / totalEndpoints
    const totalCost = endpoints.reduce((sum, e) => sum + e.metrics.cost, 0)

    const errorRate = totalErrors / totalRequests
    const uptime = endpoints.reduce((sum, e) => sum + e.metrics.uptime, 0) / totalEndpoints

    return {
      totalEndpoints,
      activeEndpoints,
      totalInstances,
      healthyInstances,
      totalRequests,
      errorRate,
      avgLatency,
      uptime,
      totalCost
    }
  }, [endpoints])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'healthy': return 'bg-green-100 text-green-800'
      case 'inactive': case 'unhealthy': return 'bg-red-100 text-red-800'
      case 'scaling': case 'starting': return 'bg-blue-100 text-blue-800'
      case 'maintenance': case 'stopping': return 'bg-yellow-100 text-yellow-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getFrameworkColor = (framework: ModelEndpoint['framework']) => {
    switch (framework) {
      case 'tensorflow': return 'bg-orange-100 text-orange-800'
      case 'pytorch': return 'bg-red-100 text-red-800'
      case 'onnx': return 'bg-blue-100 text-blue-800'
      case 'tensorflow-js': return 'bg-yellow-100 text-yellow-800'
      case 'tflite': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatLatency = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3">
          <Globe className="w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold">ML Model Serving Platform</h1>
            <p className="text-lg opacity-90">
              High-performance inference APIs with auto-scaling, load balancing, and real-time monitoring
            </p>
          </div>
        </div>
      </div>

      {/* Serving Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-6 h-6 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Active Endpoints</p>
              <p className="text-2xl font-bold text-gray-900">{servingMetrics.activeEndpoints}/{servingMetrics.totalEndpoints}</p>
            </div>
          </div>
          <div className="text-sm text-blue-600 font-medium">Serving live models</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-6 h-6 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{servingMetrics.totalRequests.toLocaleString()}</p>
            </div>
          </div>
          <div className="text-sm text-green-600 font-medium">Processed this month</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Avg Latency</p>
              <p className="text-2xl font-bold text-gray-900">{formatLatency(servingMetrics.avgLatency)}</p>
            </div>
          </div>
          <div className="text-sm text-purple-600 font-medium">Response time</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Uptime</p>
              <p className="text-2xl font-bold text-gray-900">{servingMetrics.uptime.toFixed(1)}%</p>
            </div>
          </div>
          <div className="text-sm text-orange-600 font-medium">Service reliability</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model Endpoints */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Endpoints</h3>

          <div className="space-y-3">
            {endpoints.map(endpoint => (
              <div
                key={endpoint.id}
                onClick={() => setSelectedEndpoint(endpoint)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedEndpoint?.id === endpoint.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">{endpoint.modelName}</div>
                      <div className="text-sm text-gray-600">{endpoint.version}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(endpoint.status)}`}>
                    {endpoint.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-gray-600">Framework:</span>
                    <span className={`ml-1 px-2 py-1 rounded text-xs font-medium ${getFrameworkColor(endpoint.framework)}`}>
                      {endpoint.framework}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Runtime:</span>
                    <span className="font-medium ml-1 capitalize">{endpoint.runtime}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Instances:</span>
                    <span className="font-medium ml-1">{endpoint.instances.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Throughput:</span>
                    <span className="font-medium ml-1">{endpoint.metrics.throughput}/s</span>
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  Endpoint: {endpoint.endpoint.split('/').pop()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Endpoint Details */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedEndpoint ? 'Endpoint Details' : 'Endpoint Information'}
          </h3>

          {selectedEndpoint ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint URL</label>
                  <div className="text-sm font-mono text-gray-900 break-all">{selectedEndpoint.endpoint}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedEndpoint.status)}`}>
                    {selectedEndpoint.status}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Performance Metrics</label>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Requests:</span>
                    <span className="font-medium ml-1">{selectedEndpoint.metrics.totalRequests.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Avg Latency:</span>
                    <span className="font-medium ml-1">{formatLatency(selectedEndpoint.metrics.averageLatency)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">P95 Latency:</span>
                    <span className="font-medium ml-1">{formatLatency(selectedEndpoint.metrics.p95Latency)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Error Rate:</span>
                    <span className="font-medium ml-1">{(selectedEndpoint.metrics.totalErrors / selectedEndpoint.metrics.totalRequests * 100).toFixed(2)}%</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Auto Scaling</label>
                <div className="text-sm text-gray-600">
                  {selectedEndpoint.configuration.autoScaling.enabled ? (
                    <span>Enabled • Min: {selectedEndpoint.configuration.autoScaling.minInstances} • Max: {selectedEndpoint.configuration.autoScaling.maxInstances}</span>
                  ) : (
                    <span>Disabled</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Serving Instances</label>
                <div className="space-y-2">
                  {selectedEndpoint.instances.map(instance => (
                    <div key={instance.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          instance.status === 'healthy' ? 'bg-green-400' : 'bg-red-400'
                        }`}></span>
                        <span className="font-medium">{instance.instanceId}</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        {instance.load.requestsPerSecond} req/s • {formatLatency(instance.load.averageLatency)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Select an endpoint to view details</p>
            </div>
          )}
        </div>

        {/* Inference Requests */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Inference Requests</h3>

          <div className="space-y-3">
            {inferenceRequests.map(request => (
              <div
                key={request.id}
                onClick={() => setSelectedRequest(request)}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedRequest?.id === request.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Zap className={`w-4 h-4 ${
                      request.status === 'success' ? 'text-green-600' :
                      request.status === 'error' ? 'text-red-600' : 'text-yellow-600'
                    }`} />
                    <span className="font-medium text-gray-900">
                      {endpoints.find(e => e.id === request.endpointId)?.modelName || 'Unknown Model'}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{request.instanceId}</span>
                  <span>{formatLatency(request.latency)}</span>
                </div>

                <div className="text-xs text-gray-500 mt-1">
                  {request.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>

          {/* Performance Optimizations */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Performance Optimizations</h4>
            <div className="space-y-2">
              {optimizations.map(optimization => (
                <div key={optimization.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${optimization.applied ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                    <span className="text-gray-900">{optimization.name}</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {optimization.applied ? 'Applied' : 'Available'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* A/B Testing */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">A/B Testing</h3>

        <div className="space-y-4">
          {abTests.map(test => (
            <div key={test.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium text-gray-900">{test.name}</h4>
                  <p className="text-sm text-gray-600">{test.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(test.status)}`}>
                    {test.status}
                  </span>
                  <span className="text-sm text-gray-600">Confidence: {(test.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Variants</h5>
                  <div className="space-y-2">
                    {test.variants.map(variant => (
                      <div key={variant.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-900">{variant.name}</span>
                        <div className="text-xs text-gray-600">
                          {variant.weight}% traffic • {variant.metrics.requests} requests
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Key Metrics</h5>
                  <div className="space-y-2">
                    {test.metrics.map(metric => (
                      <div key={metric.name} className="text-sm">
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600">{metric.name}</span>
                          <span className="font-medium">Baseline: {(metric.baseline * 100).toFixed(1)}%</span>
                        </div>
                        <div className="space-y-1">
                          {Object.entries(metric.variants).map(([variantId, value]) => {
                            const variant = test.variants.find(v => v.id === variantId)
                            const improvement = metric.improvement[variantId]
                            return (
                              <div key={variantId} className="flex justify-between text-xs">
                                <span>{variant?.name}: {(value * 100).toFixed(1)}%</span>
                                <span className={improvement > 0 ? 'text-green-600' : 'text-red-600'}>
                                  {improvement > 0 ? '+' : ''}{(improvement * 100).toFixed(1)}%
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Started: {test.startDate.toLocaleDateString()}
                  {test.endDate && ` • Ended: ${test.endDate.toLocaleDateString()}`}
                </span>
                {test.winner && (
                  <span className="font-medium text-green-600">Winner: {test.variants.find(v => v.id === test.winner)?.name}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}