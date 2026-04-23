'use client'

import { useState, useEffect, useMemo } from 'react'
import { Cpu, Zap, Network, BarChart3, Settings, Play, Pause, Square, RotateCcw, TrendingUp, Activity, Database, Cloud, Server } from 'lucide-react'

// Types for AI Training Infrastructure
interface TrainingPipeline {
  id: string
  name: string
  description: string
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed'
  stages: PipelineStage[]
  configuration: PipelineConfig
  metrics: PipelineMetrics
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  duration?: number
}

interface PipelineStage {
  id: string
  name: string
  type: 'data_preparation' | 'model_training' | 'validation' | 'deployment' | 'monitoring'
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  dependencies: string[] // Stage IDs this stage depends on
  resources: ResourceRequirements
  config: Record<string, any>
  logs: string[]
  metrics: {
    duration?: number
    cpuUsage?: number
    memoryUsage?: number
    gpuUsage?: number
    dataProcessed?: number
  }
  startedAt?: Date
  completedAt?: Date
}

interface PipelineConfig {
  framework: 'tensorflow' | 'pytorch' | 'jax' | 'mxnet'
  distributed: boolean
  numWorkers: number
  batchSize: number
  epochs: number
  learningRate: number
  optimizer: 'adam' | 'adamw' | 'sgd' | 'rmsprop' | 'adagrad'
  lossFunction: string
  metrics: string[]
  earlyStopping: {
    enabled: boolean
    patience: number
    minDelta: number
  }
  checkpointing: {
    enabled: boolean
    frequency: number
    saveBestOnly: boolean
  }
}

interface ResourceRequirements {
  cpu: number // CPU cores
  memory: number // GB
  gpu: number // GPU count
  storage: number // GB
  networkBandwidth?: number // Mbps
}

interface PipelineMetrics {
  totalStages: number
  completedStages: number
  failedStages: number
  averageStageDuration: number
  totalDataProcessed: number
  peakCpuUsage: number
  peakMemoryUsage: number
  peakGpuUsage: number
  cost: number
}

interface ComputeCluster {
  id: string
  name: string
  type: 'kubernetes' | 'slurm' | 'ray' | 'spark'
  status: 'active' | 'inactive' | 'maintenance'
  nodes: ClusterNode[]
  totalResources: {
    cpu: number
    memory: number
    gpu: number
    storage: number
  }
  availableResources: {
    cpu: number
    memory: number
    gpu: number
    storage: number
  }
  utilization: number
  costPerHour: number
}

interface ClusterNode {
  id: string
  name: string
  type: 'cpu' | 'gpu' | 'memory' | 'storage'
  status: 'online' | 'offline' | 'maintenance'
  resources: {
    cpu: number
    memory: number
    gpu: number
    storage: number
  }
  currentLoad: {
    cpu: number
    memory: number
    gpu: number
    network: number
  }
  uptime: number
  temperature?: number
  powerConsumption?: number
}

interface TrainingJob {
  id: string
  pipelineId: string
  modelName: string
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignedNode?: string
  progress: number
  currentEpoch: number
  totalEpochs: number
  metrics: {
    loss: number[]
    accuracy: number[]
    validationLoss?: number[]
    validationAccuracy?: number[]
    learningRate: number[]
  }
  resources: {
    allocatedCpu: number
    allocatedMemory: number
    allocatedGpu: number
    usedCpu: number
    usedMemory: number
    usedGpu: number
  }
  startedAt?: Date
  estimatedCompletion?: Date
  actualCompletion?: Date
}

interface OptimizationProfile {
  id: string
  name: string
  description: string
  techniques: OptimizationTechnique[]
  targetHardware: string[]
  performanceGain: number
  memoryReduction: number
  compatibilityScore: number
  applied: boolean
}

interface OptimizationTechnique {
  id: string
  name: string
  type: 'quantization' | 'pruning' | 'distillation' | 'architecture' | 'compilation'
  description: string
  parameters: Record<string, any>
  impact: {
    performance: number
    memory: number
    accuracy: number
  }
}

export default function AITrainingInfrastructure() {
  // Sample training pipelines
  const [pipelines] = useState<TrainingPipeline[]>([
    {
      id: 'pipeline-001',
      name: 'Advanced NLP Model Training',
      description: 'End-to-end training pipeline for transformer-based language models',
      status: 'running',
      stages: [
        {
          id: 'stage-001',
          name: 'Data Preparation',
          type: 'data_preparation',
          status: 'completed',
          dependencies: [],
          resources: { cpu: 4, memory: 16, gpu: 0, storage: 100 },
          config: { dataset: 'wikipedia', preprocessing: 'tokenization' },
          logs: ['Data loading completed', 'Preprocessing finished'],
          metrics: { duration: 1800, cpuUsage: 85, dataProcessed: 5000000 },
          startedAt: new Date(Date.now() - 45 * 60 * 1000),
          completedAt: new Date(Date.now() - 27 * 60 * 1000)
        },
        {
          id: 'stage-002',
          name: 'Model Training',
          type: 'model_training',
          status: 'running',
          dependencies: ['stage-001'],
          resources: { cpu: 8, memory: 64, gpu: 4, storage: 500 },
          config: { model: 'transformer-xl', epochs: 100 },
          logs: ['Training started', 'Epoch 45/100 completed'],
          metrics: { duration: 7200, gpuUsage: 92, dataProcessed: 250000 },
          startedAt: new Date(Date.now() - 27 * 60 * 1000)
        },
        {
          id: 'stage-003',
          name: 'Validation',
          type: 'validation',
          status: 'pending',
          dependencies: ['stage-002'],
          resources: { cpu: 2, memory: 8, gpu: 1, storage: 50 },
          config: { metrics: ['accuracy', 'perplexity'] },
          logs: [],
          metrics: {}
        }
      ],
      configuration: {
        framework: 'pytorch',
        distributed: true,
        numWorkers: 4,
        batchSize: 32,
        epochs: 100,
        learningRate: 0.001,
        optimizer: 'adamw',
        lossFunction: 'cross_entropy',
        metrics: ['accuracy', 'perplexity', 'loss'],
        earlyStopping: { enabled: true, patience: 10, minDelta: 0.001 },
        checkpointing: { enabled: true, frequency: 10, saveBestOnly: true }
      },
      metrics: {
        totalStages: 3,
        completedStages: 1,
        failedStages: 0,
        averageStageDuration: 2700,
        totalDataProcessed: 5250000,
        peakCpuUsage: 85,
        peakMemoryUsage: 64,
        peakGpuUsage: 92,
        cost: 45.80
      },
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      startedAt: new Date(Date.now() - 45 * 60 * 1000)
    },
    {
      id: 'pipeline-002',
      name: 'Computer Vision Pipeline',
      description: 'Training pipeline for image classification models',
      status: 'completed',
      stages: [
        {
          id: 'stage-004',
          name: 'Data Augmentation',
          type: 'data_preparation',
          status: 'completed',
          dependencies: [],
          resources: { cpu: 16, memory: 32, gpu: 2, storage: 200 },
          config: { augmentations: ['rotation', 'flip', 'brightness'] },
          logs: ['Augmentation completed', 'Dataset expanded to 1.2M images'],
          metrics: { duration: 3600, cpuUsage: 78, dataProcessed: 1200000 },
          startedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
          completedAt: new Date(Date.now() - 3.5 * 60 * 60 * 1000)
        },
        {
          id: 'stage-005',
          name: 'Distributed Training',
          type: 'model_training',
          status: 'completed',
          dependencies: ['stage-004'],
          resources: { cpu: 32, memory: 128, gpu: 8, storage: 1000 },
          config: { model: 'efficientnet-v2', distributed: true },
          logs: ['Multi-GPU training started', 'All epochs completed'],
          metrics: { duration: 14400, gpuUsage: 95, dataProcessed: 1200000 },
          startedAt: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
          completedAt: new Date(Date.now() - 30 * 60 * 1000)
        }
      ],
      configuration: {
        framework: 'tensorflow',
        distributed: true,
        numWorkers: 8,
        batchSize: 128,
        epochs: 200,
        learningRate: 0.0001,
        optimizer: 'adam',
        lossFunction: 'categorical_crossentropy',
        metrics: ['accuracy', 'top_5_accuracy'],
        earlyStopping: { enabled: true, patience: 20, minDelta: 0.005 },
        checkpointing: { enabled: true, frequency: 25, saveBestOnly: false }
      },
      metrics: {
        totalStages: 2,
        completedStages: 2,
        failedStages: 0,
        averageStageDuration: 9000,
        totalDataProcessed: 2400000,
        peakCpuUsage: 88,
        peakMemoryUsage: 128,
        peakGpuUsage: 95,
        cost: 127.50
      },
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      startedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 30 * 60 * 1000),
      duration: 29700
    }
  ])

  // Sample compute clusters
  const [clusters] = useState<ComputeCluster[]>([
    {
      id: 'cluster-001',
      name: 'GPU Training Cluster',
      type: 'kubernetes',
      status: 'active',
      nodes: [
        {
          id: 'node-001',
          name: 'gpu-node-01',
          type: 'gpu',
          status: 'online',
          resources: { cpu: 16, memory: 128, gpu: 4, storage: 2000 },
          currentLoad: { cpu: 45, memory: 67, gpu: 89, network: 120 },
          uptime: 168,
          temperature: 68,
          powerConsumption: 850
        },
        {
          id: 'node-002',
          name: 'gpu-node-02',
          type: 'gpu',
          status: 'online',
          resources: { cpu: 16, memory: 128, gpu: 4, storage: 2000 },
          currentLoad: { cpu: 52, memory: 71, gpu: 94, network: 135 },
          uptime: 156,
          temperature: 72,
          powerConsumption: 920
        }
      ],
      totalResources: { cpu: 32, memory: 256, gpu: 8, storage: 4000 },
      availableResources: { cpu: 16, memory: 89, gpu: 2, storage: 3200 },
      utilization: 78,
      costPerHour: 8.50
    },
    {
      id: 'cluster-002',
      name: 'CPU Inference Cluster',
      type: 'kubernetes',
      status: 'active',
      nodes: [
        {
          id: 'node-003',
          name: 'cpu-node-01',
          type: 'cpu',
          status: 'online',
          resources: { cpu: 64, memory: 256, gpu: 0, storage: 1000 },
          currentLoad: { cpu: 67, memory: 45, gpu: 0, network: 89 },
          uptime: 240,
          temperature: 55,
          powerConsumption: 320
        }
      ],
      totalResources: { cpu: 64, memory: 256, gpu: 0, storage: 1000 },
      availableResources: { cpu: 21, memory: 142, gpu: 0, storage: 650 },
      utilization: 58,
      costPerHour: 2.20
    }
  ])

  // Sample optimization profiles
  const [optimizationProfiles] = useState<OptimizationProfile[]>([
    {
      id: 'opt-001',
      name: 'Quantization Aware Training',
      description: '8-bit quantization for reduced memory usage and faster inference',
      techniques: [
        {
          id: 'quant-001',
          name: 'Dynamic Quantization',
          type: 'quantization',
          description: 'Convert weights to 8-bit integers dynamically',
          parameters: { bits: 8, scheme: 'dynamic' },
          impact: { performance: 1.8, memory: 0.75, accuracy: 0.98 }
        }
      ],
      targetHardware: ['cpu', 'gpu'],
      performanceGain: 1.8,
      memoryReduction: 0.75,
      compatibilityScore: 0.95,
      applied: true
    },
    {
      id: 'opt-002',
      name: 'Model Pruning & Distillation',
      description: 'Reduce model size through pruning and knowledge distillation',
      techniques: [
        {
          id: 'prune-001',
          name: 'Magnitude Pruning',
          type: 'pruning',
          description: 'Remove 30% of least important weights',
          parameters: { ratio: 0.3, method: 'magnitude' },
          impact: { performance: 1.3, memory: 0.7, accuracy: 0.96 }
        },
        {
          id: 'distill-001',
          name: 'Knowledge Distillation',
          type: 'distillation',
          description: 'Train smaller model to mimic larger model',
          parameters: { teacher_model: 'bert-large', temperature: 2.0 },
          impact: { performance: 1.1, memory: 0.8, accuracy: 0.92 }
        }
      ],
      targetHardware: ['mobile', 'edge'],
      performanceGain: 1.4,
      memoryReduction: 0.65,
      compatibilityScore: 0.88,
      applied: false
    }
  ])

  const [selectedPipeline, setSelectedPipeline] = useState<TrainingPipeline | null>(null)
  const [selectedCluster, setSelectedCluster] = useState<ComputeCluster | null>(null)

  // Calculate infrastructure metrics
  const infrastructureMetrics = useMemo(() => {
    const totalClusters = clusters.length
    const activeClusters = clusters.filter(c => c.status === 'active').length
    const totalResources = clusters.reduce((acc, cluster) => ({
      cpu: acc.cpu + cluster.totalResources.cpu,
      memory: acc.memory + cluster.totalResources.memory,
      gpu: acc.gpu + cluster.totalResources.gpu,
      storage: acc.storage + cluster.totalResources.storage
    }), { cpu: 0, memory: 0, gpu: 0, storage: 0 })

    const availableResources = clusters.reduce((acc, cluster) => ({
      cpu: acc.cpu + cluster.availableResources.cpu,
      memory: acc.memory + cluster.availableResources.memory,
      gpu: acc.gpu + cluster.availableResources.gpu,
      storage: acc.storage + cluster.availableResources.storage
    }), { cpu: 0, memory: 0, gpu: 0, storage: 0 })

    const utilization = {
      cpu: ((totalResources.cpu - availableResources.cpu) / totalResources.cpu) * 100,
      memory: ((totalResources.memory - availableResources.memory) / totalResources.memory) * 100,
      gpu: ((totalResources.gpu - availableResources.gpu) / totalResources.gpu) * 100,
      storage: ((totalResources.storage - availableResources.storage) / totalResources.storage) * 100
    }

    const runningPipelines = pipelines.filter(p => p.status === 'running').length
    const totalCost = clusters.reduce((sum, c) => sum + (c.costPerHour * 24), 0) // Daily cost

    return {
      totalClusters,
      activeClusters,
      totalResources,
      availableResources,
      utilization,
      runningPipelines,
      totalCost
    }
  }, [clusters, pipelines])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': case 'active': case 'online': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'idle': case 'inactive': case 'offline': return 'bg-gray-100 text-gray-800'
      case 'paused': case 'maintenance': return 'bg-yellow-100 text-yellow-800'
      case 'failed': case 'error': return 'bg-red-100 text-red-800'
      case 'pending': case 'queued': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStageTypeColor = (type: PipelineStage['type']) => {
    switch (type) {
      case 'data_preparation': return 'bg-blue-100 text-blue-800'
      case 'model_training': return 'bg-purple-100 text-purple-800'
      case 'validation': return 'bg-green-100 text-green-800'
      case 'deployment': return 'bg-orange-100 text-orange-800'
      case 'monitoring': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3">
          <Server className="w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold">AI Training Infrastructure</h1>
            <p className="text-lg opacity-90">
              Advanced training pipelines, distributed computing, and optimization infrastructure
            </p>
          </div>
        </div>
      </div>

      {/* Infrastructure Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Server className="w-6 h-6 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Active Clusters</p>
              <p className="text-2xl font-bold text-gray-900">{infrastructureMetrics.activeClusters}/{infrastructureMetrics.totalClusters}</p>
            </div>
          </div>
          <div className="text-sm text-blue-600 font-medium">Compute resources available</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Running Pipelines</p>
              <p className="text-2xl font-bold text-gray-900">{infrastructureMetrics.runningPipelines}</p>
            </div>
          </div>
          <div className="text-sm text-green-600 font-medium">Training in progress</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Cpu className="w-6 h-6 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">GPU Utilization</p>
              <p className="text-2xl font-bold text-gray-900">{infrastructureMetrics.utilization.gpu.toFixed(1)}%</p>
            </div>
          </div>
          <div className="text-sm text-purple-600 font-medium">High-performance computing</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-6 h-6 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Daily Cost</p>
              <p className="text-2xl font-bold text-gray-900">${infrastructureMetrics.totalCost.toFixed(2)}</p>
            </div>
          </div>
          <div className="text-sm text-orange-600 font-medium">Infrastructure costs</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Training Pipelines */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Training Pipelines</h3>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1">
              <Zap className="w-3 h-3" />
              New Pipeline
            </button>
          </div>

          <div className="space-y-3">
            {pipelines.map(pipeline => (
              <div
                key={pipeline.id}
                onClick={() => setSelectedPipeline(pipeline)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedPipeline?.id === pipeline.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{pipeline.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pipeline.status)}`}>
                    {pipeline.status}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-3">{pipeline.description}</p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Stages:</span>
                    <div className="font-medium">{pipeline.metrics.completedStages}/{pipeline.metrics.totalStages}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Duration:</span>
                    <div className="font-medium">
                      {pipeline.duration ? `${Math.floor(pipeline.duration / 3600)}h ${Math.floor((pipeline.duration % 3600) / 60)}m` : 'Running'}
                    </div>
                  </div>
                </div>

                {/* Pipeline Stages */}
                <div className="mt-3 flex items-center gap-1">
                  {pipeline.stages.map((stage, index) => (
                    <div key={stage.id} className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${
                        stage.status === 'completed' ? 'bg-green-500' :
                        stage.status === 'running' ? 'bg-blue-500' :
                        stage.status === 'failed' ? 'bg-red-500' :
                        stage.status === 'pending' ? 'bg-gray-300' : 'bg-yellow-500'
                      }`} title={`${stage.name}: ${stage.status}`}></div>
                      {index < pipeline.stages.length - 1 && (
                        <div className="w-4 h-px bg-gray-300"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline Details */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedPipeline ? 'Pipeline Details' : 'Pipeline Information'}
          </h3>

          {selectedPipeline ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Framework</label>
                  <div className="font-medium capitalize">{selectedPipeline.configuration.framework}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Distributed</label>
                  <div className="font-medium">{selectedPipeline.configuration.distributed ? 'Yes' : 'No'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Workers</label>
                  <div className="font-medium">{selectedPipeline.configuration.numWorkers}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Epochs</label>
                  <div className="font-medium">{selectedPipeline.configuration.epochs}</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pipeline Stages</label>
                <div className="space-y-2">
                  {selectedPipeline.stages.map(stage => (
                    <div key={stage.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStageTypeColor(stage.type)}`}>
                          {stage.type.replace('_', ' ')}
                        </span>
                        <span className="font-medium">{stage.name}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(stage.status)}`}>
                        {stage.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Performance Metrics</label>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Avg Stage Duration:</span>
                    <div className="font-medium">{Math.floor(selectedPipeline.metrics.averageStageDuration / 60)}m</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Peak GPU Usage:</span>
                    <div className="font-medium">{selectedPipeline.metrics.peakGpuUsage}%</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Data Processed:</span>
                    <div className="font-medium">{selectedPipeline.metrics.totalDataProcessed.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Cost:</span>
                    <div className="font-medium">${selectedPipeline.metrics.cost}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Server className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Select a training pipeline to view details</p>
            </div>
          )}
        </div>

        {/* Compute Clusters */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Compute Clusters</h3>

          <div className="space-y-3">
            {clusters.map(cluster => (
              <div
                key={cluster.id}
                onClick={() => setSelectedCluster(cluster)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedCluster?.id === cluster.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Cloud className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">{cluster.name}</div>
                      <div className="text-sm text-gray-600 capitalize">{cluster.type}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cluster.status)}`}>
                    {cluster.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-gray-600">CPU:</span>
                    <span className="font-medium ml-1">{cluster.availableResources.cpu}/{cluster.totalResources.cpu}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">GPU:</span>
                    <span className="font-medium ml-1">{cluster.availableResources.gpu}/{cluster.totalResources.gpu}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Memory:</span>
                    <span className="font-medium ml-1">{cluster.availableResources.memory}/{cluster.totalResources.memory}GB</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Utilization:</span>
                    <span className="font-medium ml-1">{cluster.utilization}%</span>
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  Cost: ${cluster.costPerHour}/hour • {cluster.nodes.length} nodes online
                </div>
              </div>
            ))}
          </div>

          {/* Optimization Profiles */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Optimization Profiles</h4>
            <div className="space-y-2">
              {optimizationProfiles.map(profile => (
                <div key={profile.id} className="flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium text-gray-900">{profile.name}</div>
                    <div className="text-xs text-gray-600">{profile.techniques.length} techniques</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{(profile.performanceGain * 100).toFixed(0)}% faster</div>
                    <div className="text-xs text-gray-600">{(profile.memoryReduction * 100).toFixed(0)}% less memory</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}