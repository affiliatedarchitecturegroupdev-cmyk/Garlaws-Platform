'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { Eye, Headphones, Move3D, Globe, Users, Settings, Play, Pause, RotateCcw, Zap, Camera, Volume2 } from 'lucide-react'

// Types for VR Integration
interface VREnvironment {
  id: string
  name: string
  description: string
  type: 'showroom' | 'meeting' | 'training' | 'entertainment' | 'productivity'
  thumbnail: string
  scenes: VRScene[]
  settings: {
    lighting: 'natural' | 'studio' | 'dramatic' | 'ambient'
    audio: 'spatial' | 'stereo' | 'mono'
    interaction: 'hand' | 'controller' | 'gesture' | 'voice'
    quality: 'low' | 'medium' | 'high' | 'ultra'
  }
  maxUsers: number
  duration?: number
  createdAt: Date
  lastAccessed?: Date
}

interface VRScene {
  id: string
  name: string
  type: 'static' | 'interactive' | 'dynamic'
  objects: VRObject[]
  lighting: VRLighting[]
  audio: VRAudio[]
  triggers: VRTrigger[]
}

interface VRObject {
  id: string
  name: string
  type: 'model' | 'text' | 'video' | 'interactive' | 'particle'
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
  scale: { x: number; y: number; z: number }
  material: VRMaterial
  animations?: VRAnimation[]
  interactions?: VRInteraction[]
}

interface VRMaterial {
  type: 'standard' | 'glass' | 'metal' | 'fabric' | 'glow'
  color: string
  texture?: string
  roughness: number
  metalness: number
  emissive?: string
}

interface VRAnimation {
  id: string
  type: 'rotate' | 'move' | 'scale' | 'color' | 'morph'
  duration: number
  loop: boolean
  keyframes: any[]
}

interface VRInteraction {
  id: string
  type: 'click' | 'hover' | 'grab' | 'voice' | 'gesture'
  action: 'play' | 'stop' | 'show' | 'hide' | 'teleport' | 'emit'
  target?: string
  parameters: Record<string, any>
}

interface VRLighting {
  id: string
  type: 'directional' | 'point' | 'spot' | 'ambient' | 'area'
  position: { x: number; y: number; z: number }
  color: string
  intensity: number
  castShadow: boolean
}

interface VRAudio {
  id: string
  type: 'ambient' | 'positional' | 'voice' | 'effect'
  source: string
  position?: { x: number; y: number; z: number }
  volume: number
  loop: boolean
  spatial: boolean
}

interface VRTrigger {
  id: string
  type: 'proximity' | 'timer' | 'event' | 'condition'
  condition: any
  actions: VRAction[]
}

interface VRAction {
  type: 'spawn' | 'destroy' | 'animate' | 'sound' | 'teleport' | 'message'
  target: string
  parameters: Record<string, any>
}

interface VRDevice {
  id: string
  name: string
  type: 'hmd' | 'controller' | 'tracker' | 'audio'
  manufacturer: string
  model: string
  status: 'connected' | 'disconnected' | 'error'
  battery?: number
  firmware?: string
}

interface VRSession {
  id: string
  userId: string
  environmentId: string
  startTime: Date
  endTime?: Date
  duration: number
  interactions: number
  quality: {
    fps: number
    latency: number
    resolution: { width: number; height: number }
  }
  feedback?: {
    comfort: number
    immersion: number
    usability: number
    comments?: string
  }
}

export default function VRIntegration() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Sample VR environments
  const [vrEnvironments] = useState<VREnvironment[]>([
    {
      id: 'env-001',
      name: 'Product Showroom',
      description: 'Immersive 3D product showcase with interactive demonstrations',
      type: 'showroom',
      thumbnail: '/api/placeholder/300/200',
      scenes: [],
      settings: {
        lighting: 'studio',
        audio: 'spatial',
        interaction: 'hand',
        quality: 'high'
      },
      maxUsers: 20,
      duration: 30,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      lastAccessed: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: 'env-002',
      name: 'Virtual Meeting Room',
      description: 'Collaborative workspace with whiteboards and presentations',
      type: 'meeting',
      thumbnail: '/api/placeholder/300/200',
      scenes: [],
      settings: {
        lighting: 'natural',
        audio: 'spatial',
        interaction: 'controller',
        quality: 'ultra'
      },
      maxUsers: 12,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      lastAccessed: new Date(Date.now() - 30 * 60 * 1000)
    },
    {
      id: 'env-003',
      name: 'Training Simulation',
      description: 'Interactive training scenarios with realistic environments',
      type: 'training',
      thumbnail: '/api/placeholder/300/200',
      scenes: [],
      settings: {
        lighting: 'ambient',
        audio: 'spatial',
        interaction: 'gesture',
        quality: 'high'
      },
      maxUsers: 1,
      duration: 45,
      createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      lastAccessed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'env-004',
      name: 'Virtual Concert Hall',
      description: 'Immersive music experience with 360° audio',
      type: 'entertainment',
      thumbnail: '/api/placeholder/300/200',
      scenes: [],
      settings: {
        lighting: 'dramatic',
        audio: 'spatial',
        interaction: 'voice',
        quality: 'ultra'
      },
      maxUsers: 100,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      lastAccessed: new Date(Date.now() - 12 * 60 * 60 * 1000)
    }
  ])

  // Sample VR devices
  const [vrDevices] = useState<VRDevice[]>([
    {
      id: 'device-001',
      name: 'Meta Quest Pro',
      type: 'hmd',
      manufacturer: 'Meta',
      model: 'Quest Pro',
      status: 'connected',
      battery: 85,
      firmware: 'v1.2.3'
    },
    {
      id: 'device-002',
      name: 'Touch Controllers',
      type: 'controller',
      manufacturer: 'Meta',
      model: 'Touch Pro',
      status: 'connected',
      battery: 92
    },
    {
      id: 'device-003',
      name: 'Base Station',
      type: 'tracker',
      manufacturer: 'Meta',
      model: 'Guardian',
      status: 'connected'
    },
    {
      id: 'device-004',
      name: 'Spatial Audio Headset',
      type: 'audio',
      manufacturer: 'Sony',
      model: 'WH-1000XM5',
      status: 'connected',
      battery: 78
    }
  ])

  // Sample VR sessions
  const [vrSessions] = useState<VRSession[]>([
    {
      id: 'session-001',
      userId: 'user-001',
      environmentId: 'env-001',
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
      duration: 3600,
      interactions: 45,
      quality: {
        fps: 90,
        latency: 12,
        resolution: { width: 1832, height: 1920 }
      },
      feedback: {
        comfort: 4.5,
        immersion: 4.8,
        usability: 4.2,
        comments: 'Great experience, very immersive!'
      }
    },
    {
      id: 'session-002',
      userId: 'user-002',
      environmentId: 'env-002',
      startTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
      duration: 2700,
      interactions: 67,
      quality: {
        fps: 85,
        latency: 15,
        resolution: { width: 1832, height: 1920 }
      }
    }
  ])

  const [selectedEnvironment, setSelectedEnvironment] = useState<VREnvironment | null>(null)
  const [isVRMode, setIsVRMode] = useState(false)
  const [currentScene, setCurrentScene] = useState<VRScene | null>(null)

  // Calculate VR metrics
  const vrMetrics = useMemo(() => {
    const totalSessions = vrSessions.length
    const totalDuration = vrSessions.reduce((sum, session) => sum + session.duration, 0)
    const avgSessionDuration = totalDuration / totalSessions
    const avgFPS = vrSessions.reduce((sum, session) => sum + session.quality.fps, 0) / totalSessions
    const avgLatency = vrSessions.reduce((sum, session) => sum + session.quality.latency, 0) / totalSessions
    const totalInteractions = vrSessions.reduce((sum, session) => sum + session.interactions, 0)

    const deviceHealth = vrDevices.reduce((acc, device) => {
      acc.total++
      if (device.status === 'connected') acc.connected++
      if (device.battery && device.battery < 20) acc.lowBattery++
      return acc
    }, { total: 0, connected: 0, lowBattery: 0 })

    return {
      totalSessions,
      avgSessionDuration,
      avgFPS,
      avgLatency,
      totalInteractions,
      deviceHealth
    }
  }, [vrSessions, vrDevices])

  // Canvas rendering for VR preview
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !isVRMode) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw VR preview (simplified 3D representation)
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw simple 3D scene representation
    ctx.fillStyle = '#16213e'
    ctx.fillRect(50, 50, 300, 200)

    // Draw objects
    ctx.fillStyle = '#0f3460'
    ctx.fillRect(100, 100, 50, 50) // Cube
    ctx.fillRect(200, 120, 30, 80) // Rectangle
    ctx.fillRect(280, 150, 40, 40) // Square

    // Draw text
    ctx.fillStyle = '#e94560'
    ctx.font = '16px Arial'
    ctx.fillText('VR Environment Preview', 60, 80)
    ctx.fillText('Interactive 3D Objects', 60, 270)

    if (selectedEnvironment) {
      ctx.fillText(`Environment: ${selectedEnvironment.name}`, 60, 290)
    }
  }, [isVRMode, selectedEnvironment])

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Move3D className="w-8 h-8" />
            <div>
              <h1 className="text-3xl font-bold">VR Integration System</h1>
              <p className="text-lg opacity-90">
                Immersive virtual reality experiences with 3D environments and interactive objects
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isVRMode ? 'bg-green-400' : 'bg-gray-400'}`}></div>
              <span className="text-sm">{isVRMode ? 'VR Mode Active' : 'VR Mode Inactive'}</span>
            </div>
            <button
              onClick={() => setIsVRMode(!isVRMode)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isVRMode
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isVRMode ? 'Exit VR' : 'Enter VR'}
            </button>
          </div>
        </div>
      </div>

      {/* VR Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{vrMetrics.totalSessions}</p>
            </div>
          </div>
          <div className="text-sm text-blue-600 font-medium">This month</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Avg FPS</p>
              <p className="text-2xl font-bold text-gray-900">{vrMetrics.avgFPS.toFixed(0)}</p>
            </div>
          </div>
          <div className="text-sm text-green-600 font-medium">Smooth performance</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-6 h-6 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Avg Latency</p>
              <p className="text-2xl font-bold text-gray-900">{vrMetrics.avgLatency.toFixed(0)}ms</p>
            </div>
          </div>
          <div className="text-sm text-purple-600 font-medium">Low latency</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-6 h-6 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Devices Connected</p>
              <p className="text-2xl font-bold text-gray-900">{vrMetrics.deviceHealth.connected}/{vrMetrics.deviceHealth.total}</p>
            </div>
          </div>
          <div className="text-sm text-orange-600 font-medium">All systems operational</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* VR Environments */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">VR Environments</h3>
          <div className="space-y-3">
            {vrEnvironments.map(environment => (
              <div
                key={environment.id}
                onClick={() => setSelectedEnvironment(environment)}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedEnvironment?.id === environment.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src={environment.thumbnail}
                    alt={environment.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">{environment.name}</h4>
                    <p className="text-sm text-gray-600">{environment.type}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{environment.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Max {environment.maxUsers} users</span>
                  {environment.lastAccessed && (
                    <span>Last accessed {environment.lastAccessed.toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* VR Preview */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">VR Preview</h3>
            <div className="flex items-center gap-2">
              <button className="p-1 hover:bg-gray-100 rounded">
                <Play className="w-4 h-4 text-green-600" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded">
                <Pause className="w-4 h-4 text-yellow-600" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded">
                <RotateCcw className="w-4 h-4 text-blue-600" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded">
                <Camera className="w-4 h-4 text-purple-600" />
              </button>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
            <canvas
              ref={canvasRef}
              width={400}
              height={300}
              className="w-full h-64 bg-gray-900"
            />
          </div>

          {isVRMode && selectedEnvironment && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Environment:</span>
                  <div className="font-medium">{selectedEnvironment.name}</div>
                </div>
                <div>
                  <span className="text-gray-600">Lighting:</span>
                  <div className="font-medium capitalize">{selectedEnvironment.settings.lighting}</div>
                </div>
                <div>
                  <span className="text-gray-600">Audio:</span>
                  <div className="font-medium capitalize">{selectedEnvironment.settings.audio}</div>
                </div>
                <div>
                  <span className="text-gray-600">Quality:</span>
                  <div className="font-medium capitalize">{selectedEnvironment.settings.quality}</div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2">
                  <Eye className="w-4 h-4" />
                  Enter VR Environment
                </button>
              </div>
            </div>
          )}

          {!isVRMode && (
            <div className="text-center py-8">
              <Eye className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Enter VR mode to preview environments</p>
            </div>
          )}
        </div>

        {/* Device Status */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">VR Devices</h3>
          <div className="space-y-3">
            {vrDevices.map(device => (
              <div key={device.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      device.status === 'connected' ? 'bg-green-400' :
                      device.status === 'disconnected' ? 'bg-red-400' : 'bg-yellow-400'
                    }`}></div>
                    <div>
                      <div className="font-medium text-gray-900">{device.name}</div>
                      <div className="text-sm text-gray-600">{device.manufacturer} {device.model}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    device.type === 'hmd' ? 'bg-blue-100 text-blue-800' :
                    device.type === 'controller' ? 'bg-green-100 text-green-800' :
                    device.type === 'tracker' ? 'bg-purple-100 text-purple-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {device.type.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className={`ml-1 font-medium ${
                      device.status === 'connected' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {device.status}
                    </span>
                  </div>
                  {device.battery !== undefined && (
                    <div>
                      <span className="text-gray-600">Battery:</span>
                      <span className={`ml-1 font-medium ${
                        device.battery > 50 ? 'text-green-600' :
                        device.battery > 20 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {device.battery}%
                      </span>
                    </div>
                  )}
                </div>

                {device.firmware && (
                  <div className="mt-2 text-xs text-gray-500">
                    Firmware: {device.firmware}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Volume2 className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800 text-sm">Audio Settings</span>
            </div>
            <p className="text-xs text-blue-700">
              Spatial audio enabled. Adjust volume and balance for optimal VR experience.
            </p>
          </div>
        </div>
      </div>

      {/* VR Sessions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent VR Sessions</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Session</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Environment</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Duration</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Interactions</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">Quality</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">Feedback</th>
              </tr>
            </thead>
            <tbody>
              {vrSessions.map(session => {
                const environment = vrEnvironments.find(e => e.id === session.environmentId)
                return (
                  <tr key={session.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{session.id.split('-')[1]}</div>
                      <div className="text-sm text-gray-600">
                        {session.startTime.toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{environment?.name}</div>
                      <div className="text-sm text-gray-600">{environment?.type}</div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {Math.floor(session.duration / 60)}m {session.duration % 60}s
                    </td>
                    <td className="py-3 px-4 text-right">{session.interactions}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="text-sm">
                        <div className="font-medium">{session.quality.fps} FPS</div>
                        <div className="text-gray-500">{session.quality.latency}ms</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {session.feedback ? (
                        <div className="text-sm">
                          <div className="font-medium">{session.feedback.comfort}/5</div>
                          <div className="text-gray-500">comfort</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}