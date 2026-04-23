'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { Camera, Target, Layers, Eye, Scan, Zap, MapPin, Info, Settings, Play, Pause, RotateCcw } from 'lucide-react'

// Types for AR Experiences
interface ARExperience {
  id: string
  name: string
  description: string
  type: 'marker' | 'location' | 'object' | 'face' | 'gesture' | 'spatial'
  category: 'education' | 'entertainment' | 'productivity' | 'retail' | 'training' | 'social'
  thumbnail: string
  scenes: ARScene[]
  triggers: ARTrigger[]
  interactions: ARInteraction[]
  settings: {
    tracking: 'marker' | 'slam' | 'image' | 'face' | 'location'
    lighting: 'auto' | 'manual'
    audio: 'spatial' | 'ambient' | 'off'
    quality: 'low' | 'medium' | 'high'
  }
  targetDevices: string[]
  createdAt: Date
  lastUsed?: Date
  usageCount: number
}

interface ARScene {
  id: string
  name: string
  type: 'static' | 'dynamic' | 'interactive'
  objects: ARObject[]
  overlays: AROverlay[]
  animations: ARAnimation[]
  conditions: ARCondition[]
}

interface ARObject {
  id: string
  name: string
  type: '3d_model' | 'text' | 'image' | 'video' | 'particle' | 'ui'
  source: string
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
  scale: { x: number; y: number; z: number }
  anchor: 'marker' | 'location' | 'object' | 'face' | 'hand'
  anchorId?: string
  visible: boolean
  opacity: number
}

interface AROverlay {
  id: string
  type: 'info' | 'navigation' | 'interactive' | 'decorative'
  content: string | ARContent
  position: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'floating'
  size: { width: number; height: number }
  style: {
    backgroundColor: string
    textColor: string
    borderRadius: number
    shadow: boolean
  }
  animations?: ARAnimation[]
}

interface ARContent {
  type: 'text' | 'image' | 'video' | 'model' | 'button' | 'form'
  data: any
  interactive?: boolean
  actions?: ARAction[]
}

interface ARAnimation {
  id: string
  type: 'fade' | 'slide' | 'scale' | 'rotate' | 'bounce' | 'pulse'
  duration: number
  delay: number
  loop: boolean
  easing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out'
  keyframes: any[]
}

interface ARTrigger {
  id: string
  type: 'tap' | 'gesture' | 'proximity' | 'voice' | 'timer' | 'location' | 'object_detected'
  condition: any
  actions: ARAction[]
  cooldown?: number
  enabled: boolean
}

interface ARAction {
  type: 'show' | 'hide' | 'animate' | 'play_sound' | 'vibrate' | 'navigate' | 'share' | 'capture'
  target: string
  parameters: Record<string, any>
  delay?: number
}

interface ARInteraction {
  id: string
  type: 'touch' | 'drag' | 'pinch' | 'rotate' | 'voice' | 'gesture'
  gesture?: string
  sensitivity: number
  actions: ARAction[]
  feedback: {
    haptic: boolean
    audio: boolean
    visual: boolean
  }
}

interface ARCondition {
  id: string
  type: 'time' | 'location' | 'weather' | 'device' | 'user' | 'context'
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'in_range'
  value: any
  logic?: 'AND' | 'OR'
}

interface ARSession {
  id: string
  userId: string
  experienceId: string
  startTime: Date
  endTime?: Date
  duration: number
  interactions: number
  objectsTracked: number
  performance: {
    fps: number
    trackingStability: number
    batteryDrain: number
  }
  events: AREvent[]
}

interface AREvent {
  timestamp: Date
  type: 'object_detected' | 'interaction' | 'trigger_activated' | 'error' | 'performance'
  data: Record<string, any>
}

export default function ARExperiences() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Sample AR experiences
  const [arExperiences] = useState<ARExperience[]>([
    {
      id: 'ar-001',
      name: 'Product Information Overlay',
      description: 'Scan products to see detailed information and reviews',
      type: 'object',
      category: 'retail',
      thumbnail: '/api/placeholder/300/200',
      scenes: [],
      triggers: [],
      interactions: [],
      settings: {
        tracking: 'image',
        lighting: 'auto',
        audio: 'spatial',
        quality: 'high'
      },
      targetDevices: ['mobile', 'tablet'],
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
      usageCount: 1250
    },
    {
      id: 'ar-002',
      name: 'Interactive Museum Guide',
      description: 'Enhanced museum experience with historical context and audio',
      type: 'marker',
      category: 'education',
      thumbnail: '/api/placeholder/300/200',
      scenes: [],
      triggers: [],
      interactions: [],
      settings: {
        tracking: 'marker',
        lighting: 'manual',
        audio: 'spatial',
        quality: 'ultra'
      },
      targetDevices: ['mobile', 'tablet'],
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      usageCount: 890
    },
    {
      id: 'ar-003',
      name: 'AR Training Simulator',
      description: 'Hands-on training with virtual equipment and scenarios',
      type: 'spatial',
      category: 'training',
      thumbnail: '/api/placeholder/300/200',
      scenes: [],
      triggers: [],
      interactions: [],
      settings: {
        tracking: 'slam',
        lighting: 'auto',
        audio: 'ambient',
        quality: 'high'
      },
      targetDevices: ['mobile', 'tablet', 'hmd'],
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      lastUsed: new Date(Date.now() - 3 * 60 * 60 * 1000),
      usageCount: 567
    },
    {
      id: 'ar-004',
      name: 'Location-Based AR',
      description: 'Contextual information and navigation overlays for locations',
      type: 'location',
      category: 'productivity',
      thumbnail: '/api/placeholder/300/200',
      scenes: [],
      triggers: [],
      interactions: [],
      settings: {
        tracking: 'location',
        lighting: 'auto',
        audio: 'off',
        quality: 'medium'
      },
      targetDevices: ['mobile'],
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      lastUsed: new Date(Date.now() - 6 * 60 * 60 * 1000),
      usageCount: 432
    }
  ])

  // Sample AR sessions
  const [arSessions] = useState<ARSession[]>([
    {
      id: 'session-001',
      userId: 'user-001',
      experienceId: 'ar-001',
      startTime: new Date(Date.now() - 30 * 60 * 1000),
      endTime: new Date(Date.now() - 25 * 60 * 1000),
      duration: 300,
      interactions: 12,
      objectsTracked: 8,
      performance: {
        fps: 30,
        trackingStability: 0.85,
        batteryDrain: 15
      },
      events: [
        { timestamp: new Date(Date.now() - 29 * 60 * 1000), type: 'object_detected', data: { objectId: 'product-001' } },
        { timestamp: new Date(Date.now() - 28 * 60 * 1000), type: 'interaction', data: { type: 'tap', target: 'info-overlay' } }
      ]
    },
    {
      id: 'session-002',
      userId: 'user-002',
      experienceId: 'ar-002',
      startTime: new Date(Date.now() - 45 * 60 * 1000),
      endTime: new Date(Date.now() - 35 * 60 * 1000),
      duration: 600,
      interactions: 25,
      objectsTracked: 15,
      performance: {
        fps: 25,
        trackingStability: 0.92,
        batteryDrain: 22
      },
      events: [
        { timestamp: new Date(Date.now() - 42 * 60 * 1000), type: 'trigger_activated', data: { triggerId: 'marker-001' } },
        { timestamp: new Date(Date.now() - 40 * 60 * 1000), type: 'interaction', data: { type: 'voice', command: 'play_audio' } }
      ]
    }
  ])

  const [selectedExperience, setSelectedExperience] = useState<ARExperience | null>(null)
  const [isARMode, setIsARMode] = useState(false)
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'pending'>('pending')
  const [trackingStatus, setTrackingStatus] = useState<'initializing' | 'tracking' | 'lost' | 'error'>('initializing')

  // Calculate AR metrics
  const arMetrics = useMemo(() => {
    const totalSessions = arSessions.length
    const totalDuration = arSessions.reduce((sum, session) => sum + session.duration, 0)
    const avgSessionDuration = totalDuration / totalSessions
    const totalInteractions = arSessions.reduce((sum, session) => sum + session.interactions, 0)
    const totalObjectsTracked = arSessions.reduce((sum, session) => sum + session.objectsTracked, 0)
    const avgFPS = arSessions.reduce((sum, session) => sum + session.performance.fps, 0) / totalSessions
    const avgStability = arSessions.reduce((sum, session) => sum + session.performance.trackingStability, 0) / totalSessions

    const experienceUsage = arExperiences.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.usageCount
      return acc
    }, {} as Record<string, number>)

    return {
      totalSessions,
      avgSessionDuration,
      totalInteractions,
      totalObjectsTracked,
      avgFPS,
      avgStability,
      experienceUsage
    }
  }, [arSessions, arExperiences])

  // Initialize camera for AR preview
  useEffect(() => {
    if (isARMode && cameraPermission === 'granted') {
      const startCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
          })
          if (videoRef.current) {
            videoRef.current.srcObject = stream
            videoRef.current.play()
          }
        } catch (error) {
          console.error('Camera access failed:', error)
        }
      }
      startCamera()
    }

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [isARMode, cameraPermission])

  // Request camera permission
  const requestCameraPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName })
      setCameraPermission(result.state as 'granted' | 'denied' | 'pending')

      if (result.state === 'prompt') {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        stream.getTracks().forEach(track => track.stop())
        setCameraPermission('granted')
      }
    } catch (error) {
      setCameraPermission('denied')
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Scan className="w-8 h-8" />
            <div>
              <h1 className="text-3xl font-bold">AR Experiences Platform</h1>
              <p className="text-lg opacity-90">
                Augmented reality interactions with object recognition and real-world overlays
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                trackingStatus === 'tracking' ? 'bg-green-400' :
                trackingStatus === 'initializing' ? 'bg-yellow-400' : 'bg-red-400'
              }`}></div>
              <span className="text-sm capitalize">{trackingStatus}</span>
            </div>
            <button
              onClick={() => setIsARMode(!isARMode)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isARMode
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isARMode ? 'Exit AR' : 'Start AR'}
            </button>
          </div>
        </div>
      </div>

      {/* AR Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Eye className="w-6 h-6 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{arMetrics.totalSessions}</p>
            </div>
          </div>
          <div className="text-sm text-blue-600 font-medium">This week</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Objects Tracked</p>
              <p className="text-2xl font-bold text-gray-900">{arMetrics.totalObjectsTracked}</p>
            </div>
          </div>
          <div className="text-sm text-green-600 font-medium">Recognition accuracy</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Avg FPS</p>
              <p className="text-2xl font-bold text-gray-900">{arMetrics.avgFPS.toFixed(0)}</p>
            </div>
          </div>
          <div className="text-sm text-purple-600 font-medium">Smooth performance</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Layers className="w-6 h-6 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Tracking Stability</p>
              <p className="text-2xl font-bold text-gray-900">{(arMetrics.avgStability * 100).toFixed(1)}%</p>
            </div>
          </div>
          <div className="text-sm text-orange-600 font-medium">Reliable tracking</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AR Experiences */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AR Experiences</h3>
          <div className="space-y-3">
            {arExperiences.map(experience => (
              <div
                key={experience.id}
                onClick={() => setSelectedExperience(experience)}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedExperience?.id === experience.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src={experience.thumbnail}
                    alt={experience.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">{experience.name}</h4>
                    <p className="text-sm text-gray-600">{experience.category}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{experience.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Used {experience.usageCount} times</span>
                  <span className={`px-2 py-1 rounded-full ${
                    experience.type === 'marker' ? 'bg-blue-100 text-blue-800' :
                    experience.type === 'location' ? 'bg-green-100 text-green-800' :
                    experience.type === 'object' ? 'bg-purple-100 text-purple-800' :
                    experience.type === 'face' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {experience.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AR Preview */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">AR Preview</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={requestCameraPermission}
                className={`p-1 hover:bg-gray-100 rounded ${
                  cameraPermission === 'granted' ? 'text-green-600' : 'text-gray-600'
                }`}
              >
                <Camera className="w-4 h-4" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded">
                <Play className="w-4 h-4 text-green-600" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded">
                <Pause className="w-4 h-4 text-yellow-600" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded">
                <RotateCcw className="w-4 h-4 text-blue-600" />
              </button>
            </div>
          </div>

          <div className="relative border border-gray-200 rounded-lg overflow-hidden mb-4">
            {isARMode ? (
              <video
                ref={videoRef}
                className="w-full h-64 object-cover"
                playsInline
                muted
              />
            ) : (
              <canvas
                ref={canvasRef}
                width={400}
                height={256}
                className="w-full h-64 bg-gray-100"
              />
            )}

            {isARMode && selectedExperience && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Simulated AR overlays */}
                <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg">
                  <div className="text-sm font-medium">{selectedExperience.name}</div>
                  <div className="text-xs opacity-75">Object detected</div>
                </div>

                <div className="absolute bottom-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-lg">
                  <div className="text-sm">Tap to interact</div>
                </div>

                {/* Targeting reticle */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-8 h-8 border-2 border-white rounded-full opacity-75">
                    <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {cameraPermission !== 'granted' && isARMode && (
            <div className="text-center py-4">
              <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">Camera access required for AR</p>
              <button
                onClick={requestCameraPermission}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
              >
                Grant Permission
              </button>
            </div>
          )}

          {isARMode && selectedExperience && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Tracking:</span>
                  <div className="font-medium capitalize">{selectedExperience.settings.tracking}</div>
                </div>
                <div>
                  <span className="text-gray-600">Quality:</span>
                  <div className="font-medium capitalize">{selectedExperience.settings.quality}</div>
                </div>
                <div>
                  <span className="text-gray-600">Lighting:</span>
                  <div className="font-medium capitalize">{selectedExperience.settings.lighting}</div>
                </div>
                <div>
                  <span className="text-gray-600">Audio:</span>
                  <div className="font-medium capitalize">{selectedExperience.settings.audio}</div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <button className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2">
                  <Scan className="w-4 h-4" />
                  Start Scanning
                </button>
              </div>
            </div>
          )}

          {!isARMode && (
            <div className="text-center py-8">
              <Scan className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Enable AR mode to start scanning</p>
            </div>
          )}
        </div>

        {/* Experience Details */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedExperience ? 'Experience Details' : 'Device Status'}
          </h3>

          {selectedExperience ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                <div className="font-medium text-gray-900">{selectedExperience.name}</div>
                <div className="text-sm text-gray-600">{selectedExperience.description}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Devices</label>
                <div className="flex flex-wrap gap-1">
                  {selectedExperience.targetDevices.map(device => (
                    <span key={device} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      {device}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Scenes</label>
                <div className="text-sm text-gray-600">{selectedExperience.scenes.length} scenes configured</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Triggers</label>
                <div className="text-sm text-gray-600">{selectedExperience.triggers.length} triggers active</div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm">
                  Edit Experience
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    cameraPermission === 'granted' ? 'bg-green-400' :
                    cameraPermission === 'denied' ? 'bg-red-400' : 'bg-yellow-400'
                  }`}></div>
                  <span className="text-sm font-medium">Camera</span>
                </div>
                <span className="text-xs text-gray-600 capitalize">{cameraPermission}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    trackingStatus === 'tracking' ? 'bg-green-400' :
                    trackingStatus === 'lost' ? 'bg-yellow-400' : 'bg-red-400'
                  }`}></div>
                  <span className="text-sm font-medium">Tracking</span>
                </div>
                <span className="text-xs text-gray-600 capitalize">{trackingStatus}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-sm font-medium">GPS</span>
                </div>
                <span className="text-xs text-gray-600">Available</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm font-medium">Sensors</span>
                </div>
                <span className="text-xs text-gray-600">Active</span>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm">
                  Calibrate Device
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AR Sessions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent AR Sessions</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Session</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Experience</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Duration</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Interactions</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">Performance</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">Events</th>
              </tr>
            </thead>
            <tbody>
              {arSessions.map(session => {
                const experience = arExperiences.find(e => e.id === session.experienceId)
                return (
                  <tr key={session.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{session.id.split('-')[1]}</div>
                      <div className="text-sm text-gray-600">
                        {session.startTime.toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{experience?.name}</div>
                      <div className="text-sm text-gray-600">{experience?.type}</div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {Math.floor(session.duration / 60)}m {session.duration % 60}s
                    </td>
                    <td className="py-3 px-4 text-right">{session.interactions}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="text-sm">
                        <div className="font-medium">{session.performance.fps} FPS</div>
                        <div className="text-gray-500">{(session.performance.trackingStability * 100).toFixed(0)}% stable</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="text-sm font-medium">{session.events.length}</div>
                      <div className="text-xs text-gray-500">events logged</div>
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