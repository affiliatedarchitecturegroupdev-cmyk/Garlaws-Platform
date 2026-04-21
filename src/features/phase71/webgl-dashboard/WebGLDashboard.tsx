'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BarChart3, TrendingUp, RotateCcw, ZoomIn, ZoomOut, Move, Settings, Play, Pause, Volume2, VolumeX } from 'lucide-react';

export interface DataPoint3D {
  id: string;
  x: number;
  y: number;
  z: number;
  value: number;
  color: [number, number, number]; // RGB
  label: string;
  category: string;
  metadata?: Record<string, any>;
}

export interface DataSet3D {
  id: string;
  name: string;
  description: string;
  points: DataPoint3D[];
  dimensions: {
    x: { min: number; max: number; label: string };
    y: { min: number; max: number; label: string };
    z: { min: number; max: number; label: string };
  };
  visualization: 'scatter' | 'surface' | 'bars' | 'network' | 'particles';
  colorScheme: 'default' | 'heatmap' | 'categorical' | 'gradient';
  animations: boolean;
  soundEnabled: boolean;
}

export interface DashboardScene {
  id: string;
  name: string;
  datasets: DataSet3D[];
  camera: {
    position: [number, number, number];
    rotation: [number, number, number];
    zoom: number;
  };
  lighting: {
    ambient: number;
    directional: [number, number, number];
  };
  interactions: boolean;
  autoRotate: boolean;
  background: string;
}

const SAMPLE_DATASETS: DataSet3D[] = [
  {
    id: 'sales-performance',
    name: 'Sales Performance 3D',
    description: 'Multi-dimensional sales data visualization',
    points: Array.from({ length: 100 }, (_, i) => ({
      id: `point-${i}`,
      x: Math.random() * 10 - 5,
      y: Math.random() * 10 - 5,
      z: Math.random() * 10 - 5,
      value: Math.random() * 100,
      color: [Math.random(), Math.random(), Math.random()],
      label: `Sale ${i + 1}`,
      category: ['Q1', 'Q2', 'Q3', 'Q4'][Math.floor(Math.random() * 4)],
      metadata: { region: ['North', 'South', 'East', 'West'][Math.floor(Math.random() * 4)] }
    })),
    dimensions: {
      x: { min: -5, max: 5, label: 'Revenue ($)' },
      y: { min: -5, max: 5, label: 'Profit ($)' },
      z: { min: -5, max: 5, label: 'Time' }
    },
    visualization: 'scatter',
    colorScheme: 'heatmap',
    animations: true,
    soundEnabled: false
  },
  {
    id: 'network-traffic',
    name: 'Network Traffic Analysis',
    description: 'Real-time network traffic visualization',
    points: Array.from({ length: 50 }, (_, i) => ({
      id: `traffic-${i}`,
      x: Math.random() * 8 - 4,
      y: Math.random() * 8 - 4,
      z: Math.random() * 8 - 4,
      value: Math.random() * 1000,
      color: [0.2, 0.8, Math.random()],
      label: `Node ${i + 1}`,
      category: 'traffic',
      metadata: { type: ['server', 'client', 'router'][Math.floor(Math.random() * 3)] }
    })),
    dimensions: {
      x: { min: -4, max: 4, label: 'Latency (ms)' },
      y: { min: -4, max: 4, label: 'Throughput (Mbps)' },
      z: { min: -4, max: 4, label: 'Packets/sec' }
    },
    visualization: 'network',
    colorScheme: 'gradient',
    animations: true,
    soundEnabled: true
  }
];

const SAMPLE_SCENES: DashboardScene[] = [
  {
    id: 'business-overview',
    name: 'Business Overview',
    datasets: [SAMPLE_DATASETS[0]],
    camera: {
      position: [5, 5, 5],
      rotation: [0, 0, 0],
      zoom: 1
    },
    lighting: {
      ambient: 0.5,
      directional: [1, 1, 1]
    },
    interactions: true,
    autoRotate: false,
    background: '#f8fafc'
  },
  {
    id: 'technical-monitoring',
    name: 'Technical Monitoring',
    datasets: [SAMPLE_DATASETS[1]],
    camera: {
      position: [3, 3, 3],
      rotation: [0.5, 0.5, 0],
      zoom: 0.8
    },
    lighting: {
      ambient: 0.3,
      directional: [0, 1, 0]
    },
    interactions: true,
    autoRotate: true,
    background: '#1f2937'
  }
];

export const WebGLDashboard: React.FC = () => {
  const [scenes, setScenes] = useState<DashboardScene[]>(SAMPLE_SCENES);
  const [currentScene, setCurrentScene] = useState<DashboardScene | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [cameraMode, setCameraMode] = useState<'orbit' | 'fly' | 'first-person'>('orbit');
  const [showControls, setShowControls] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<DataPoint3D | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint3D | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize WebGL scene
  const initializeWebGL = useCallback((scene: DashboardScene) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl');

    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    // Set clear color based on scene background
    const bgColor = scene.background === '#1f2937' ? [0.12, 0.15, 0.22, 1.0] : [0.97, 0.98, 0.99, 1.0];
    gl.clearColor(bgColor[0], bgColor[1], bgColor[2], bgColor[3]);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Enable depth testing
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    // In a real implementation, this would set up:
    // - Shader programs
    // - Vertex buffers
    // - Camera matrices
    // - Lighting
    // - Data point rendering

    console.log('WebGL scene initialized for:', scene.name);
  }, []);

  // Load scene
  const loadScene = useCallback((scene: DashboardScene) => {
    setCurrentScene(scene);
    setTimeout(() => initializeWebGL(scene), 100);

    if (scene.autoRotate) {
      setIsPlaying(true);
    }
  }, [initializeWebGL]);

  // Animation loop
  const animate = useCallback(() => {
    if (!currentScene) return;

    // In real implementation, this would:
    // - Update camera matrices
    // - Render 3D objects
    // - Handle animations
    // - Update lighting

    animationRef.current = requestAnimationFrame(animate);
  }, [currentScene]);

  // Handle mouse interactions
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !currentScene?.interactions) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // In real implementation, this would perform raycasting
    // to detect intersections with 3D objects

    // Simulate hovering over a point
    if (Math.random() < 0.1) {
      const randomPoint = currentScene.datasets[0]?.points[Math.floor(Math.random() * currentScene.datasets[0].points.length)];
      setHoveredPoint(randomPoint || null);
    }
  }, [currentScene]);

  const handleClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (hoveredPoint) {
      setSelectedPoint(hoveredPoint);
      // Generate audio feedback if enabled
      if (audioEnabled && audioContextRef.current) {
        const oscillator = audioContextRef.current.createOscillator();
        oscillator.frequency.setValueAtTime(440, audioContextRef.current.currentTime);
        oscillator.connect(audioContextRef.current.destination);
        oscillator.start();
        oscillator.stop(audioContextRef.current.currentTime + 0.1);
      }
    }
  }, [hoveredPoint, audioEnabled]);

  // Camera controls
  const resetCamera = useCallback(() => {
    if (!currentScene) return;
    // Reset to scene's default camera position
    console.log('Camera reset to:', currentScene.camera);
  }, [currentScene]);

  const zoomIn = useCallback(() => {
    setScenes(prev => prev.map(scene =>
      scene.id === currentScene?.id
        ? { ...scene, camera: { ...scene.camera, zoom: Math.min(scene.camera.zoom * 1.2, 5) } }
        : scene
    ));
  }, [currentScene]);

  const zoomOut = useCallback(() => {
    setScenes(prev => prev.map(scene =>
      scene.id === currentScene?.id
        ? { ...scene, camera: { ...scene.camera, zoom: Math.max(scene.camera.zoom / 1.2, 0.1) } }
        : scene
    ));
  }, [currentScene]);

  // Initialize audio context
  useEffect(() => {
    if (audioEnabled && !audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
  }, [audioEnabled]);

  // Start animation when scene is loaded
  useEffect(() => {
    if (currentScene && isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentScene, isPlaying, animate]);

  // Performance metrics
  const [fps, setFps] = useState(60);
  const [renderTime, setRenderTime] = useState(16);

  useEffect(() => {
    const interval = setInterval(() => {
      setFps(Math.floor(55 + Math.random() * 10));
      setRenderTime(Math.floor(12 + Math.random() * 8));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">WebGL Interactive Dashboard</h1>
              <p className="text-gray-600">3D data visualization with immersive analytics</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              FPS: <span className="font-medium text-green-600">{fps}</span> |
              Render: <span className="font-medium text-blue-600">{renderTime}ms</span>
            </div>
            <select
              value={cameraMode}
              onChange={(e) => setCameraMode(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="orbit">Orbit Camera</option>
              <option value="fly">Fly Camera</option>
              <option value="first-person">First Person</option>
            </select>
          </div>
        </div>
      </div>

      {/* Scene Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dashboard Scenes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scenes.map((scene) => (
            <div key={scene.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{scene.name}</h4>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    scene.autoRotate ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {scene.autoRotate ? 'Auto' : 'Manual'}
                  </span>
                  <button
                    onClick={() => loadScene(scene)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Load Scene
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">Datasets: {scene.datasets.length}</p>
              <div className="flex flex-wrap gap-1">
                {scene.datasets.map((dataset, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                    {dataset.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ height: '600px' }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair"
          width={1920}
          height={1080}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
        />

        {/* Scene Info Overlay */}
        {currentScene && (
          <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-3 rounded-lg">
            <div className="text-sm font-medium">{currentScene.name}</div>
            <div className="text-xs opacity-75">
              Camera: {cameraMode} | Zoom: {currentScene.camera.zoom.toFixed(1)}x
            </div>
            <div className="text-xs opacity-75">
              Datasets: {currentScene.datasets.length} | Points: {currentScene.datasets.reduce((sum, ds) => sum + ds.points.length, 0)}
            </div>
          </div>
        )}

        {/* Point Information */}
        {(selectedPoint || hoveredPoint) && (
          <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-3 rounded-lg max-w-xs">
            <div className="text-sm font-medium">
              {selectedPoint ? 'Selected' : 'Hovered'}: {selectedPoint?.label || hoveredPoint?.label}
            </div>
            <div className="text-xs opacity-75 mt-1">
              Value: {selectedPoint?.value || hoveredPoint?.value}
            </div>
            <div className="text-xs opacity-75">
              Position: ({(selectedPoint?.x || hoveredPoint?.x)?.toFixed(2)}, {(selectedPoint?.y || hoveredPoint?.y)?.toFixed(2)}, {(selectedPoint?.z || hoveredPoint?.z)?.toFixed(2)})
            </div>
            {(selectedPoint?.metadata || hoveredPoint?.metadata) && (
              <div className="text-xs opacity-75 mt-1">
                {Object.entries(selectedPoint?.metadata || hoveredPoint?.metadata || {}).map(([key, value]) => (
                  <div key={key}>{key}: {String(value)}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Controls Overlay */}
        {showControls && currentScene && (
          <div className="absolute bottom-4 left-4 right-4 flex justify-center">
            <div className="bg-black bg-opacity-50 text-white p-3 rounded-lg flex items-center space-x-4">
              <button
                onClick={() => setShowControls(false)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
              >
                ×
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              <button
                onClick={resetCamera}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={zoomIn}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                onClick={zoomOut}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`p-2 rounded ${audioEnabled ? 'bg-green-600' : 'hover:bg-white hover:bg-opacity-20'}`}
              >
                {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <div className="text-xs">
                Mode: <span className="font-medium">{cameraMode}</span>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {!currentScene && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">WebGL Interactive Dashboard</h3>
              <p className="text-gray-300">Select a scene to explore 3D data visualizations</p>
            </div>
          </div>
        )}
      </div>

      {/* Dataset Information */}
      {currentScene && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Datasets</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentScene.datasets.map((dataset) => (
              <div key={dataset.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{dataset.name}</h4>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    dataset.visualization === 'scatter' ? 'bg-blue-100 text-blue-800' :
                    dataset.visualization === 'network' ? 'bg-purple-100 text-purple-800' :
                    dataset.visualization === 'bars' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {dataset.visualization}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-3">{dataset.description}</p>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Points:</span>
                    <span className="ml-2 font-medium">{dataset.points.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Color Scheme:</span>
                    <span className="ml-2 font-medium capitalize">{dataset.colorScheme}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Animations:</span>
                    <span className={`ml-2 font-medium ${dataset.animations ? 'text-green-600' : 'text-gray-600'}`}>
                      {dataset.animations ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>

                <div className="mt-3">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Dimensions:</h5>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-gray-600">X:</span>
                      <span className="ml-1">{dataset.dimensions.x.label}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Y:</span>
                      <span className="ml-1">{dataset.dimensions.y.label}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Z:</span>
                      <span className="ml-1">{dataset.dimensions.z.label}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Visualization Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{scenes.length}</div>
            <div className="text-sm text-gray-600">Total Scenes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {scenes.reduce((sum, scene) => sum + scene.datasets.length, 0)}
            </div>
            <div className="text-sm text-gray-600">Active Datasets</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {scenes.reduce((sum, scene) => sum + scene.datasets.reduce((dsSum, ds) => dsSum + ds.points.length, 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Data Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{fps}</div>
            <div className="text-sm text-gray-600">Avg FPS</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebGLDashboard;