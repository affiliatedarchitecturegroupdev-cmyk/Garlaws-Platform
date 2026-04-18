"use client";

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { MobileCard, MobileCardHeader, MobileCardContent, MobileCardActions } from '@/components/MobileCard';
import { edgeComputingEngine, type EdgeDevice, type EdgeNetwork, type EdgeWorkload } from '@/lib/edge-computing-engine';
import { iotMeshNetwork, type MeshNetwork, type MeshNode } from '@/lib/iot-mesh-network';
import { localAIProcessingEngine, type AIModel, type InferenceRequest } from '@/lib/local-ai-engine';

interface DeviceCardProps {
  device: EdgeDevice;
  onConfigure?: (deviceId: string) => void;
  onMonitor?: (deviceId: string) => void;
}

function DeviceCard({ device, onConfigure, onMonitor }: DeviceCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400 bg-green-500/20';
      case 'offline': return 'text-red-400 bg-red-500/20';
      case 'maintenance': return 'text-yellow-400 bg-yellow-500/20';
      case 'error': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getDeviceIcon = (type: string) => {
    const icons = {
      gateway: '🌐',
      sensor_hub: '📡',
      edge_server: '🖥️',
      iot_device: '📱',
      mobile_device: '📱'
    };
    return icons[type as keyof typeof icons] || '🔧';
  };

  const formatUptime = (uptime: number) => {
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    return `${days}d ${hours}h`;
  };

  return (
    <MobileCard className="border-l-4 border-l-[#c5a059]">
      <MobileCardHeader
        title={`${device.name} (${device.type.replace('_', ' ')})`}
        subtitle={`${device.location.propertyId} • ${device.location.zone}`}
        avatar={<span className="text-2xl">{getDeviceIcon(device.type)}</span>}
      />

      <MobileCardContent>
        <div className="space-y-4">
          {/* Status & Performance */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-[#45a29e]">Status</div>
              <div className={`font-semibold px-2 py-1 rounded text-sm capitalize ${getStatusColor(device.status.online ? 'online' : 'offline')}`}>
                {device.status.online ? 'online' : 'offline'}
              </div>
            </div>
            <div>
              <div className="text-sm text-[#45a29e]">Uptime</div>
              <div className="text-white font-semibold">{formatUptime(device.status.uptime * 86400)}</div>
            </div>
          </div>

          {/* Resource Usage */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-[#0b0c10] rounded p-2">
              <div className="text-sm text-[#45a29e]">CPU</div>
              <div className="text-white font-semibold">{device.status.cpuUsage}%</div>
            </div>
            <div className="bg-[#0b0c10] rounded p-2">
              <div className="text-sm text-[#45a29e]">Memory</div>
              <div className="text-white font-semibold">{device.status.memoryUsage}%</div>
            </div>
            <div className="bg-[#0b0c10] rounded p-2">
              <div className="text-sm text-[#45a29e]">Temp</div>
              <div className="text-white font-semibold">{device.status.temperature}°C</div>
            </div>
          </div>

          {/* Workload Info */}
          <div className="flex justify-between text-sm">
            <span className="text-[#45a29e]">Active Tasks</span>
            <span className="text-white font-semibold">{device.workload.activeTasks}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-[#45a29e]">Queue Depth</span>
            <span className="text-white font-semibold">{device.workload.queueDepth}</span>
          </div>

          {/* Capabilities */}
          <div>
            <div className="text-sm text-[#45a29e] mb-1">Capabilities</div>
            <div className="flex flex-wrap gap-1">
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                {device.capabilities.cpu.cores} CPU Cores
              </span>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                {device.capabilities.memory.ram}GB RAM
              </span>
              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                {device.capabilities.computePower} Compute
              </span>
            </div>
          </div>
        </div>
      </MobileCardContent>

      <MobileCardActions>
        <button
          onClick={() => onMonitor?.(device.id)}
          className="px-3 py-2 bg-[#45a29e]/20 border border-[#45a29e]/40 text-[#45a29e] rounded-lg font-medium text-sm"
        >
          Monitor
        </button>
        <button
          onClick={() => onConfigure?.(device.id)}
          className="px-3 py-2 bg-[#c5a059] text-[#0b0c10] rounded-lg font-medium text-sm"
        >
          Configure
        </button>
      </MobileCardActions>
    </MobileCard>
  );
}

interface WorkloadCardProps {
  workload: EdgeWorkload;
  onCancel?: (workloadId: string) => void;
  onViewResult?: (workloadId: string) => void;
}

function WorkloadCard({ workload, onCancel, onViewResult }: WorkloadCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/20';
      case 'processing': return 'text-blue-400 bg-blue-500/20';
      case 'assigned': return 'text-yellow-400 bg-yellow-500/20';
      case 'queued': return 'text-gray-400 bg-gray-500/20';
      case 'failed': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'normal': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getWorkloadIcon = (type: string) => {
    const icons = {
      ai_inference: '🤖',
      data_processing: '📊',
      sensor_aggregation: '📡',
      real_time_analytics: '⚡',
      image_processing: '🖼️'
    };
    return icons[type as keyof typeof icons] || '🔧';
  };

  return (
    <MobileCard>
      <MobileCardHeader
        title={workload.type.replace('_', ' ').toUpperCase()}
        subtitle={`Priority: ${workload.priority} • ${workload.status}`}
        avatar={<span className="text-2xl">{getWorkloadIcon(workload.type)}</span>}
      />

      <MobileCardContent>
        <div className="space-y-3">
          {/* Progress */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[#45a29e]">Progress</span>
              <span className="text-white">{workload.progress}%</span>
            </div>
            <div className="w-full bg-[#0b0c10] rounded-full h-2">
              <div
                className="bg-[#c5a059] h-2 rounded-full transition-all duration-300"
                style={{ width: `${workload.progress}%` }}
              ></div>
            </div>
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-[#45a29e]">Status</div>
              <div className={`font-semibold px-2 py-1 rounded text-sm capitalize ${getStatusColor(workload.status)}`}>
                {workload.status}
              </div>
            </div>
            <div>
              <div className="text-sm text-[#45a29e]">Priority</div>
              <div className={`font-semibold capitalize ${getPriorityColor(workload.priority)}`}>
                {workload.priority}
              </div>
            </div>
          </div>

          {/* Assigned Device */}
          {workload.assignedDevice && (
            <div>
              <div className="text-sm text-[#45a29e]">Assigned Device</div>
              <div className="text-white font-mono text-xs">{workload.assignedDevice}</div>
            </div>
          )}

          {/* Timing */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-[#45a29e]">Created</div>
              <div className="text-white">{workload.createdAt.toLocaleTimeString()}</div>
            </div>
            {workload.startedAt && (
              <div>
                <div className="text-[#45a29e]">Started</div>
                <div className="text-white">{workload.startedAt.toLocaleTimeString()}</div>
              </div>
            )}
          </div>
        </div>
      </MobileCardContent>

      <MobileCardActions>
        {workload.status === 'completed' && (
          <button
            onClick={() => onViewResult?.(workload.id)}
            className="px-3 py-2 bg-[#45a29e] text-white rounded-lg font-medium text-sm"
          >
            View Result
          </button>
        )}
        {(workload.status === 'queued' || workload.status === 'assigned') && (
          <button
            onClick={() => onCancel?.(workload.id)}
            className="px-3 py-2 bg-red-600 text-white rounded-lg font-medium text-sm"
          >
            Cancel
          </button>
        )}
        <button className="px-3 py-2 bg-[#c5a059] text-[#0b0c10] rounded-lg font-medium text-sm">
          Details
        </button>
      </MobileCardActions>
    </MobileCard>
  );
}

interface NetworkCardProps {
  network: MeshNetwork;
  nodes: MeshNode[];
  onOptimize?: (networkId: string) => void;
}

function NetworkCard({ network, nodes, onOptimize }: NetworkCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/20';
      case 'degraded': return 'text-yellow-400 bg-yellow-500/20';
      case 'failed': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const onlineNodes = nodes.filter(n => n.status.online).length;
  const totalNodes = nodes.length;
  const uptime = network.performance.uptime.toFixed(1);

  return (
    <MobileCard className="border-l-4 border-l-[#45a29e]">
      <MobileCardHeader
        title={network.name}
        subtitle={`${network.protocol.toUpperCase()} • ${network.panId}`}
        avatar={<span className="text-2xl">🌐</span>}
      />

      <MobileCardContent>
        <div className="space-y-4">
          {/* Status Overview */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-[#0b0c10] rounded p-3">
              <div className="text-2xl font-bold text-white">{totalNodes}</div>
              <div className="text-xs text-[#45a29e]">Total Nodes</div>
            </div>
            <div className="bg-[#0b0c10] rounded p-3">
              <div className="text-2xl font-bold text-green-400">{onlineNodes}</div>
              <div className="text-xs text-[#45a29e]">Online</div>
            </div>
            <div className="bg-[#0b0c10] rounded p-3">
              <div className={`text-2xl font-bold ${getStatusColor(network.status).split(' ')[0]}`}>
                {uptime}%
              </div>
              <div className="text-xs text-[#45a29e]">Uptime</div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-[#45a29e]">Latency</div>
              <div className="text-white font-semibold">{network.performance.overallLatency}ms</div>
            </div>
            <div>
              <div className="text-[#45a29e]">Throughput</div>
              <div className="text-white font-semibold">{network.performance.throughput} Mbps</div>
            </div>
            <div>
              <div className="text-[#45a29e]">Packet Loss</div>
              <div className="text-white font-semibold">{(network.performance.packetLoss * 100).toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-[#45a29e]">Stability</div>
              <div className="text-white font-semibold">{(network.performance.meshStability * 100).toFixed(0)}%</div>
            </div>
          </div>

          {/* Coverage */}
          <div>
            <div className="text-sm text-[#45a29e] mb-1">Coverage</div>
            <div className="text-white text-sm">
              {network.coverage.area}m² • {network.coverage.floors.length} floors • {network.coverage.zones.length} zones
            </div>
          </div>
        </div>
      </MobileCardContent>

      <MobileCardActions>
        <button
          onClick={() => onOptimize?.(network.id)}
          className="px-3 py-2 bg-[#c5a059] text-[#0b0c10] rounded-lg font-medium text-sm"
        >
          Optimize
        </button>
        <button className="px-3 py-2 bg-[#45a29e]/20 border border-[#45a29e]/40 text-[#45a29e] rounded-lg font-medium text-sm">
          Monitor
        </button>
      </MobileCardActions>
    </MobileCard>
  );
}

export default function EdgeComputingDashboard() {
  const [devices, setDevices] = useState<EdgeDevice[]>([]);
  const [networks, setNetworks] = useState<MeshNetwork[]>([]);
  const [workloads, setWorkloads] = useState<EdgeWorkload[]>([]);
  const [aiModels, setAiModels] = useState<AIModel[]>([]);
  const [inferenceQueue, setInferenceQueue] = useState<InferenceRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'devices' | 'networks' | 'workloads' | 'ai' | 'analytics'>('devices');
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load edge devices
        const edgeDevices = edgeComputingEngine.getDevices();
        setDevices(edgeDevices);

        // Load networks
        const meshNetworks = iotMeshNetwork.getAllNetworks();
        setNetworks(meshNetworks);

        // Load workloads
        const activeWorkloads = edgeComputingEngine.getWorkloads();
        setWorkloads(activeWorkloads);

        // Load AI models
        const models = localAIProcessingEngine.getModels();
        setAiModels(models);

        // Load inference queue
        const queue = localAIProcessingEngine.getInferenceQueue();
        setInferenceQueue(queue);

      } catch (error) {
        console.error('Failed to load edge computing data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Set up periodic updates
    const interval = setInterval(loadData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const handleDeviceConfigure = (deviceId: string) => {
    setSelectedDevice(deviceId);
    // In a real implementation, this would open a configuration modal
    alert(`Configure device: ${deviceId}`);
  };

  const handleDeviceMonitor = (deviceId: string) => {
    setSelectedDevice(deviceId);
    // Navigate to detailed device monitoring
    setActiveTab('analytics');
  };

  const handleWorkloadCancel = async (workloadId: string) => {
    // In real implementation, cancel the workload
    alert(`Cancel workload: ${workloadId}`);
  };

  const handleWorkloadViewResult = (workloadId: string) => {
    // Show workload results
    alert(`View results for workload: ${workloadId}`);
  };

  const handleNetworkOptimize = async (networkId: string) => {
    try {
      const optimizations = await iotMeshNetwork.optimizeNetwork(networkId);
      alert(`Network optimization suggestions generated: ${optimizations.length} recommendations`);
    } catch (error) {
      alert(`Failed to optimize network: ${error}`);
    }
  };

  const handleRunInference = async () => {
    try {
      const requestId = await localAIProcessingEngine.runInference({
        modelId: 'model_anomaly_detection',
        input: { sensor_values: [22, 65, 1500, 45] },
        parameters: {
          confidenceThreshold: 0.8
        },
        priority: 'normal'
      });
      alert(`Inference request submitted: ${requestId}`);
    } catch (error) {
      alert(`Failed to run inference: ${error}`);
    }
  };

  const getNetworkHealth = () => {
    return edgeComputingEngine.getNetworkHealth();
  };

  const getProcessingStats = () => {
    return localAIProcessingEngine.getProcessingStats();
  };

  if (loading) {
    return (
      <DashboardLayout activeTab="analytics">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c5a059] mx-auto mb-4"></div>
            <p className="text-[#45a29e]">Loading Edge Computing Dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const networkHealth = getNetworkHealth();
  const processingStats = getProcessingStats();

  return (
    <DashboardLayout activeTab="analytics">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Edge Computing Dashboard</h1>
          <p className="text-[#45a29e]">
            Distributed processing, IoT mesh networks, and local AI inference management
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-[#1f2833] rounded-xl p-4 border border-[#45a29e]/20 text-center">
            <div className="text-2xl font-bold text-white mb-1">{networkHealth.totalDevices}</div>
            <div className="text-sm text-[#45a29e]">Edge Devices</div>
          </div>
          <div className="bg-[#1f2833] rounded-xl p-4 border border-[#45a29e]/20 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">{networkHealth.onlineDevices}</div>
            <div className="text-sm text-[#45a29e]">Online</div>
          </div>
          <div className="bg-[#1f2833] rounded-xl p-4 border border-[#45a29e]/20 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">{processingStats.activeModels}</div>
            <div className="text-sm text-[#45a29e]">Active AI Models</div>
          </div>
          <div className="bg-[#1f2833] rounded-xl p-4 border border-[#45a29e]/20 text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">{processingStats.queuedRequests}</div>
            <div className="text-sm text-[#45a29e]">Queued Tasks</div>
          </div>
          <div className="bg-[#1f2833] rounded-xl p-4 border border-[#45a29e]/20 text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">{processingStats.averageLatency.toFixed(0)}ms</div>
            <div className="text-sm text-[#45a29e]">Avg Latency</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-[#1f2833] rounded-lg p-1 overflow-x-auto">
          {[
            { id: 'devices', label: 'Edge Devices', icon: '🔧' },
            { id: 'networks', label: 'Mesh Networks', icon: '🌐' },
            { id: 'workloads', label: 'Workloads', icon: '⚙️' },
            { id: 'ai', label: 'AI Processing', icon: '🤖' },
            { id: 'analytics', label: 'Analytics', icon: '📊' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#c5a059] text-[#0b0c10]'
                  : 'text-[#45a29e] hover:bg-[#45a29e]/10'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'devices' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Edge Devices</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {devices.map((device) => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  onConfigure={handleDeviceConfigure}
                  onMonitor={handleDeviceMonitor}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'networks' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Mesh Networks</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {networks.map((network) => {
                const nodes = iotMeshNetwork.getNetworkTopology(network.id)?.nodes || [];
                return (
                  <NetworkCard
                    key={network.id}
                    network={network}
                    nodes={nodes}
                    onOptimize={handleNetworkOptimize}
                  />
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'workloads' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Active Workloads</h2>
            {workloads.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">⚙️</div>
                <h3 className="text-xl font-bold text-white mb-2">No Active Workloads</h3>
                <p className="text-[#45a29e]">All workloads have been processed or are queued.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workloads.map((workload) => (
                  <WorkloadCard
                    key={workload.id}
                    workload={workload}
                    onCancel={handleWorkloadCancel}
                    onViewResult={handleWorkloadViewResult}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'ai' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">AI Processing</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* AI Models */}
              <div className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Available Models</h3>
                <div className="space-y-3">
                  {aiModels.slice(0, 3).map((model) => (
                    <div key={model.id} className="flex justify-between items-center p-3 bg-[#0b0c10] rounded">
                      <div>
                        <div className="text-white font-semibold">{model.name}</div>
                        <div className="text-sm text-[#45a29e]">{model.type} • {model.framework}</div>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-semibold ${
                        model.status === 'loaded' ? 'bg-green-500/20 text-green-400' :
                        model.status === 'loading' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {model.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inference Queue */}
              <div className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Inference Queue</h3>
                <div className="space-y-3">
                  {inferenceQueue.length === 0 ? (
                    <div className="text-center py-4">
                      <div className="text-[#45a29e]">No pending inference requests</div>
                    </div>
                  ) : (
                    inferenceQueue.slice(0, 3).map((request, index) => (
                      <div key={request.id} className="flex justify-between items-center p-3 bg-[#0b0c10] rounded">
                        <div>
                          <div className="text-white font-semibold">{request.modelId}</div>
                          <div className="text-sm text-[#45a29e]">{request.priority} priority</div>
                        </div>
                        <div className="text-right">
                          <div className="text-white text-sm">{request.timestamp.toLocaleTimeString()}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <button
                  onClick={handleRunInference}
                  className="w-full mt-4 px-4 py-3 bg-[#c5a059] text-[#0b0c10] rounded-lg hover:bg-[#b8954f] transition-colors font-bold"
                >
                  Run Inference Test
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Edge Analytics</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-[#1f2833] rounded-xl p-4 border border-[#45a29e]/20 text-center">
                <div className="text-2xl font-bold text-white mb-1">{processingStats.memoryUsage}MB</div>
                <div className="text-sm text-[#45a29e]">Memory Usage</div>
              </div>
              <div className="bg-[#1f2833] rounded-xl p-4 border border-[#45a29e]/20 text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">{processingStats.completedRequests}</div>
                <div className="text-sm text-[#45a29e]">Completed Tasks</div>
              </div>
              <div className="bg-[#1f2833] rounded-xl p-4 border border-[#45a29e]/20 text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">
                {processingStats.completedRequests > 0 ?
                  ((processingStats.queuedRequests / processingStats.completedRequests) * 100).toFixed(1) : '0.0'}%
              </div>
                <div className="text-sm text-[#45a29e]">Error Rate</div>
              </div>
            </div>

            {/* Device-specific analytics would go here */}
            <div className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Device Analytics</h3>
              <p className="text-[#45a29e]">Select a device from the Devices tab to view detailed analytics.</p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <button className="bg-[#c5a059] text-[#0b0c10] p-6 rounded-xl hover:opacity-90 transition-all text-center">
            <div className="text-3xl mb-3">🔧</div>
            <h3 className="font-bold mb-2">Add Device</h3>
            <p className="text-sm opacity-80">Register new edge device</p>
          </button>

          <button className="bg-[#45a29e] text-white p-6 rounded-xl hover:opacity-90 transition-all text-center">
            <div className="text-3xl mb-3">🌐</div>
            <h3 className="font-bold mb-2">Create Network</h3>
            <p className="text-sm opacity-80">Set up new mesh network</p>
          </button>

          <button className="bg-[#1f2833] border border-[#45a29e]/20 text-[#45a29e] p-6 rounded-xl hover:bg-[#45a29e]/10 transition-all text-center">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-bold mb-2">Load Balance</h3>
            <p className="text-sm opacity-80">Optimize workload distribution</p>
          </button>

          <button className="bg-[#1f2833] border border-[#45a29e]/20 text-[#45a29e] p-6 rounded-xl hover:bg-[#45a29e]/10 transition-all text-center">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-bold mb-2">Generate Report</h3>
            <p className="text-sm opacity-80">Export edge analytics</p>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}