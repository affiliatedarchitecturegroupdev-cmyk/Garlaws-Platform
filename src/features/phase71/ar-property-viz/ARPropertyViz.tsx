'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, RotateCcw, Maximize, Minimize, Play, Pause, Volume2, VolumeX, Eye, EyeOff, Settings, Zap, Target } from 'lucide-react';

export interface PropertyModel {
  id: string;
  name: string;
  type: 'residential' | 'commercial' | 'industrial' | 'land';
  modelUrl: string;
  thumbnailUrl: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  floors: number;
  rooms: number;
  area: number; // in sq ft
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  features: string[];
  textures: string[];
  animations: string[];
}

export interface ARSession {
  id: string;
  propertyId: string;
  userId: string;
  deviceType: 'mobile' | 'desktop' | 'vr-headset';
  mode: 'ar' | 'vr' | 'mixed';
  startTime: Date;
  endTime?: Date;
  interactions: ARInteraction[];
  performance: {
    fps: number;
    latency: number;
    quality: 'low' | 'medium' | 'high' | 'ultra';
  };
}

export interface ARInteraction {
  id: string;
  type: 'view' | 'touch' | 'gesture' | 'voice' | 'navigation';
  target: string; // object or area interacted with
  timestamp: Date;
  duration?: number;
  data?: any;
}

export interface WalkthroughPath {
  id: string;
  name: string;
  description: string;
  waypoints: Array<{
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    duration: number; // in seconds
    description?: string;
  }>;
  audioGuide?: string;
  duration: number;
  popularity: number;
}

const SAMPLE_PROPERTIES: PropertyModel[] = [
  {
    id: 'property-001',
    name: 'Modern Downtown Loft',
    type: 'residential',
    modelUrl: '/models/loft-3d.glb',
    thumbnailUrl: '/images/loft-thumb.jpg',
    dimensions: { width: 1200, height: 300, depth: 800 },
    floors: 1,
    rooms: 2,
    area: 960,
    location: {
      latitude: 40.7128,
      longitude: -74.0060,
      address: '123 Main St, New York, NY'
    },
    features: ['Open Floor Plan', 'Floor-to-Ceiling Windows', 'Modern Kitchen', 'Rooftop Access'],
    textures: ['concrete', 'glass', 'wood', 'metal'],
    animations: ['door-open', 'window-view', 'lighting-transition']
  },
  {
    id: 'property-002',
    name: 'Tech Campus Building A',
    type: 'commercial',
    modelUrl: '/models/campus-building.glb',
    thumbnailUrl: '/images/campus-thumb.jpg',
    dimensions: { width: 5000, height: 1200, depth: 3000 },
    floors: 6,
    rooms: 120,
    area: 15000,
    location: {
      latitude: 37.7749,
      longitude: -122.4194,
      address: '456 Tech Blvd, San Francisco, CA'
    },
    features: ['Open Office Spaces', 'Conference Rooms', 'Cafeteria', 'Fitness Center', 'Parking Garage'],
    textures: ['glass-facade', 'concrete', 'carpet', 'acoustic-panels'],
    animations: ['elevator-movement', 'door-sequences', 'lighting-scenes']
  }
];

const SAMPLE_WALKTHROUGHS: WalkthroughPath[] = [
  {
    id: 'walkthrough-001',
    name: 'Complete Property Tour',
    description: 'A comprehensive walkthrough of the entire property',
    waypoints: [
      { position: { x: 0, y: 0, z: 5 }, rotation: { x: 0, y: 0, z: 0 }, duration: 3, description: 'Entrance Hall' },
      { position: { x: 3, y: 0, z: 0 }, rotation: { x: 0, y: -90, z: 0 }, duration: 5, description: 'Living Room' },
      { position: { x: 0, y: 0, z: -3 }, rotation: { x: 0, y: 180, z: 0 }, duration: 4, description: 'Kitchen Area' },
      { position: { x: -2, y: 1, z: 0 }, rotation: { x: 15, y: 90, z: 0 }, duration: 3, description: 'Bedroom View' }
    ],
    audioGuide: '/audio/walkthrough-guide.mp3',
    duration: 15,
    popularity: 95
  },
  {
    id: 'walkthrough-002',
    name: 'Key Features Highlight',
    description: 'Focus on the most important features and amenities',
    waypoints: [
      { position: { x: 0, y: 0, z: 3 }, rotation: { x: 0, y: 0, z: 0 }, duration: 2, description: 'Feature Overview' },
      { position: { x: 2, y: 0, z: 1 }, rotation: { x: -10, y: -45, z: 0 }, duration: 4, description: 'Kitchen Island' },
      { position: { x: -1, y: 1.5, z: 2 }, rotation: { x: 20, y: 135, z: 0 }, duration: 3, description: 'City View' }
    ],
    audioGuide: '/audio/features-guide.mp3',
    duration: 9,
    popularity: 87
  }
];

export const ARPropertyViz: React.FC = () => {
  const [properties, setProperties] = useState<PropertyModel[]>(SAMPLE_PROPERTIES);
  const [walkthroughs, setWalkthroughs] = useState<WalkthroughPath[]>(SAMPLE_WALKTHROUGHS);
  const [selectedProperty, setSelectedProperty] = useState<PropertyModel | null>(null);
  const [selectedWalkthrough, setSelectedWalkthrough] = useState<WalkthroughPath | null>(null);
  const [arSession, setArSession] = useState<ARSession | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWaypoint, setCurrentWaypoint] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [quality, setQuality] = useState<'low' | 'medium' | 'high' | 'ultra'>('high');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>();
  const audioRef = useRef<HTMLAudioElement>(null);

  // Initialize AR/VR session
  const startARSession = useCallback(async (property: PropertyModel, mode: 'ar' | 'vr' | 'mixed' = 'ar') => {
    const session: ARSession = {
      id: `ar-session-${Date.now()}`,
      propertyId: property.id,
      userId: 'current-user',
      deviceType: 'desktop', // In real implementation, detect device
      mode,
      startTime: new Date(),
      interactions: [],
      performance: {
        fps: 60,
        latency: 45,
        quality
      }
    };

    setArSession(session);
    setSelectedProperty(property);

    // Initialize WebGL renderer (simplified for demo)
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const gl = canvas.getContext('webgl');
      if (gl) {
        // Initialize 3D scene
        gl.clearColor(0.1, 0.1, 0.1, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        // In real implementation, load and render 3D model
        console.log('AR/VR session started for property:', property.name);
      }
    }
  }, [quality]);

  // Handle walkthrough playback
  const playWalkthrough = useCallback((walkthrough: WalkthroughPath) => {
    if (!selectedProperty) return;

    setSelectedWalkthrough(walkthrough);
    setIsPlaying(true);
    setCurrentWaypoint(0);

    // Start audio guide if available
    if (walkthrough.audioGuide && audioEnabled && audioRef.current) {
      audioRef.current.src = walkthrough.audioGuide;
      audioRef.current.play();
    }

    // Animate through waypoints
    const animateWalkthrough = () => {
      if (currentWaypoint >= walkthrough.waypoints.length) {
        setIsPlaying(false);
        setSelectedWalkthrough(null);
        if (audioRef.current) {
          audioRef.current.pause();
        }
        return;
      }

      const waypoint = walkthrough.waypoints[currentWaypoint];
      console.log('Moving to waypoint:', waypoint.description);

      // In real implementation, smoothly interpolate camera position
      setTimeout(() => {
        setCurrentWaypoint(prev => prev + 1);
        animationRef.current = requestAnimationFrame(animateWalkthrough);
      }, waypoint.duration * 1000);
    };

    animateWalkthrough();
  }, [currentWaypoint, selectedProperty, audioEnabled]);

  // Handle user interactions
  const handleInteraction = useCallback((type: ARInteraction['type'], target: string, data?: any) => {
    if (!arSession) return;

    const interaction: ARInteraction = {
      id: `interaction-${Date.now()}`,
      type,
      target,
      timestamp: new Date(),
      data
    };

    setArSession(prev => prev ? {
      ...prev,
      interactions: [...prev.interactions, interaction]
    } : null);
  }, [arSession]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      canvasRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // End AR session
  const endARSession = useCallback(() => {
    setArSession(prev => prev ? { ...prev, endTime: new Date() } : null);
    setSelectedProperty(null);
    setSelectedWalkthrough(null);
    setIsPlaying(false);
    setCurrentWaypoint(0);

    if (audioRef.current) {
      audioRef.current.pause();
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, []);

  // Performance monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      if (arSession) {
        setArSession(prev => prev ? {
          ...prev,
          performance: {
            ...prev.performance,
            fps: Math.floor(55 + Math.random() * 10),
            latency: Math.floor(40 + Math.random() * 20)
          }
        } : null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [arSession]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Eye className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AR/VR Property Visualization</h1>
              <p className="text-gray-600">Immersive 3D property visualization with interactive walkthroughs</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low Quality</option>
              <option value="medium">Medium Quality</option>
              <option value="high">High Quality</option>
              <option value="ultra">Ultra Quality</option>
            </select>
          </div>
        </div>
      </div>

      {/* AR/VR Canvas */}
      <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : 'h-96'}`}>
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          width={1920}
          height={1080}
        />

        {/* AR Overlay */}
        {arSession && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Crosshair */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Target className="w-8 h-8 text-white opacity-50" />
            </div>

            {/* Session Info */}
            <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-3 rounded-lg">
              <div className="text-sm font-medium">AR Session Active</div>
              <div className="text-xs opacity-75">
                FPS: {arSession.performance.fps} | Latency: {arSession.performance.latency}ms
              </div>
              <div className="text-xs opacity-75">
                Mode: {arSession.mode.toUpperCase()} | Quality: {arSession.performance.quality}
              </div>
            </div>

            {/* Walkthrough Progress */}
            {selectedWalkthrough && (
              <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-3 rounded-lg">
                <div className="text-sm font-medium">{selectedWalkthrough.name}</div>
                <div className="text-xs opacity-75">
                  Step {currentWaypoint + 1} of {selectedWalkthrough.waypoints.length}
                </div>
                <div className="w-32 bg-gray-700 rounded-full h-1 mt-2">
                  <div
                    className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${((currentWaypoint + 1) / selectedWalkthrough.waypoints.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Controls Overlay */}
        {showControls && (
          <div className="absolute bottom-4 left-4 right-4 flex justify-center">
            <div className="bg-black bg-opacity-50 text-white p-3 rounded-lg flex items-center space-x-4">
              <button
                onClick={() => setShowControls(false)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
              >
                <EyeOff className="w-4 h-4" />
              </button>

              {selectedProperty && (
                <>
                  <button
                    onClick={() => selectedWalkthrough && playWalkthrough(selectedWalkthrough)}
                    disabled={!selectedWalkthrough}
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded disabled:opacity-50"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => handleInteraction('gesture', 'reset-view')}
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={toggleFullscreen}
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
                  >
                    {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => setAudioEnabled(!audioEnabled)}
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
                  >
                    {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={endARSession}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                  >
                    End Session
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {!arSession && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <Eye className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">AR/VR Property Visualization</h3>
              <p className="text-gray-300">Select a property to start an immersive experience</p>
            </div>
          </div>
        )}
      </div>

      {/* Property Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Properties</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {properties.map((property) => (
            <div key={property.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Camera className="w-8 h-8 text-gray-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{property.name}</h4>
                  <p className="text-sm text-gray-600">{property.type} • {property.area} sq ft • {property.floors} floors</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {property.features.slice(0, 3).map((feature, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => startARSession(property, 'ar')}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    AR View
                  </button>
                  <button
                    onClick={() => startARSession(property, 'vr')}
                    className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                  >
                    VR View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Walkthroughs */}
      {selectedProperty && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Interactive Walkthroughs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {walkthroughs.map((walkthrough) => (
              <div key={walkthrough.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{walkthrough.name}</h4>
                    <p className="text-sm text-gray-600">{walkthrough.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{Math.floor(walkthrough.duration / 60)}:{(walkthrough.duration % 60).toString().padStart(2, '0')}</div>
                    <div className="text-xs text-gray-500">{walkthrough.waypoints.length} waypoints</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Popularity:</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{ width: `${walkthrough.popularity}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{walkthrough.popularity}%</span>
                    </div>
                  </div>

                  <button
                    onClick={() => playWalkthrough(walkthrough)}
                    disabled={!arSession || isPlaying}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    <Play className="w-4 h-4 inline mr-1" />
                    Start Tour
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Session Analytics */}
      {arSession && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{arSession.interactions.length}</div>
              <div className="text-sm text-gray-600">Interactions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{arSession.performance.fps}</div>
              <div className="text-sm text-gray-600">FPS</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{arSession.performance.latency}ms</div>
              <div className="text-sm text-gray-600">Latency</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.floor((new Date().getTime() - arSession.startTime.getTime()) / 1000 / 60)}m
              </div>
              <div className="text-sm text-gray-600">Duration</div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Audio Element */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
};

export default ARPropertyViz;