"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { digitalTwinEngine, type DigitalTwin, type Room, type Sensor } from '@/lib/digital-twin-engine';

interface Property3DViewerProps {
  twinId: string;
  width?: number;
  height?: number;
  interactive?: boolean;
  showSensors?: boolean;
  showSystems?: boolean;
  onRoomSelect?: (room: Room) => void;
  onSensorSelect?: (sensor: Sensor) => void;
  className?: string;
}

interface ViewportState {
  camera: {
    position: [number, number, number];
    rotation: [number, number, number];
    zoom: number;
  };
  selectedRoom?: string;
  selectedSensor?: string;
  showWireframe: boolean;
  showTextures: boolean;
  renderMode: 'solid' | 'wireframe' | 'transparent';
}

interface RenderedElement {
  id: string;
  type: 'room' | 'sensor' | 'system' | 'feature';
  position: [number, number, number];
  dimensions: [number, number, number];
  color: string;
  opacity: number;
  label: string;
  data?: any;
}

export function Property3DViewer({
  twinId,
  width = 800,
  height = 600,
  interactive = true,
  showSensors = true,
  showSystems = true,
  onRoomSelect,
  onSensorSelect,
  className = ""
}: Property3DViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [twin, setTwin] = useState<DigitalTwin | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewport, setViewport] = useState<ViewportState>({
    camera: {
      position: [5, 5, 5],
      rotation: [0, 0, 0],
      zoom: 1
    },
    showWireframe: false,
    showTextures: true,
    renderMode: 'solid'
  });
  const [renderedElements, setRenderedElements] = useState<RenderedElement[]>([]);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  // Load digital twin data
  useEffect(() => {
    const loadTwin = async () => {
      try {
        const twinData = digitalTwinEngine.getDigitalTwin(twinId);
        if (twinData) {
          setTwin(twinData);
          generateRenderedElements(twinData);
        }
      } catch (error) {
        console.error('Failed to load digital twin:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTwin();
  }, [twinId]);

  // Generate elements to render
  const generateRenderedElements = useCallback((twinData: DigitalTwin) => {
    const elements: RenderedElement[] = [];

    // Add rooms
    twinData.geometry.rooms.forEach((room, index) => {
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
      const color = colors[index % colors.length];

      elements.push({
        id: room.id,
        type: 'room',
        position: room.geometry.position,
        dimensions: [room.dimensions.length, room.dimensions.width, room.dimensions.height],
        color,
        opacity: 0.8,
        label: room.name,
        data: room
      });

      // Add room features
      room.features.forEach((feature, featureIndex) => {
        elements.push({
          id: `${room.id}_feature_${featureIndex}`,
          type: 'feature',
          position: feature.position,
          dimensions: feature.dimensions,
          color: '#FFD93D',
          opacity: 0.9,
          label: feature.type,
          data: feature
        });
      });
    });

    // Add sensors
    if (showSensors) {
      twinData.sensors.sensors.forEach((sensor) => {
        const sensorColors = {
          temperature: '#FF6B6B',
          humidity: '#4ECDC4',
          motion: '#FFD93D',
          light: '#FFF176',
          sound: '#BA68C8',
          air_quality: '#81C784',
          energy: '#FFB74D',
          water: '#64B5F6',
          security: '#F06292'
        };

        elements.push({
          id: sensor.id,
          type: 'sensor',
          position: sensor.location.position,
          dimensions: [0.1, 0.1, 0.1], // Small cube for sensors
          color: sensorColors[sensor.type] || '#9E9E9E',
          opacity: 1,
          label: `${sensor.type} sensor`,
          data: sensor
        });
      });
    }

    // Add system components
    if (showSystems) {
      // HVAC units
      twinData.systems.hvac.units.forEach((unit, index) => {
        elements.push({
          id: `hvac_${index}`,
          type: 'system',
          position: unit.location,
          dimensions: [1, 1, 0.5],
          color: '#2196F3',
          opacity: 0.7,
          label: `${unit.type} (${unit.capacity} BTU)`,
          data: unit
        });
      });

      // Electrical panel
      elements.push({
        id: 'electrical_panel',
        type: 'system',
        position: twinData.systems.electrical.mainPanel.location,
        dimensions: [0.6, 0.3, 1.2],
        color: '#FFC107',
        opacity: 0.8,
        label: `Main Panel (${twinData.systems.electrical.mainPanel.capacity}A)`,
        data: twinData.systems.electrical.mainPanel
      });

      // Security cameras
      twinData.systems.security.cameras.forEach((camera, index) => {
        elements.push({
          id: `camera_${index}`,
          type: 'system',
          position: camera.location,
          dimensions: [0.2, 0.2, 0.2],
          color: '#F44336',
          opacity: 0.9,
          label: `${camera.type} camera`,
          data: camera
        });
      });
    }

    setRenderedElements(elements);
  }, [showSensors, showSystems]);

  // Handle mouse interactions
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (!interactive) return;
    setIsDragging(true);
    setLastMousePos({ x: event.clientX, y: event.clientY });
  }, [interactive]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!interactive || !isDragging) return;

    const deltaX = event.clientX - lastMousePos.x;
    const deltaY = event.clientY - lastMousePos.y;

    setViewport(prev => ({
      ...prev,
      camera: {
        ...prev.camera,
        rotation: [
          prev.camera.rotation[0] + deltaY * 0.01,
          prev.camera.rotation[1] + deltaX * 0.01,
          prev.camera.rotation[2]
        ]
      }
    }));

    setLastMousePos({ x: event.clientX, y: event.clientY });
  }, [interactive, isDragging, lastMousePos]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((event: React.WheelEvent) => {
    if (!interactive) return;

    event.preventDefault();
    const zoomDelta = event.deltaY > 0 ? 0.9 : 1.1;

    setViewport(prev => ({
      ...prev,
      camera: {
        ...prev.camera,
        zoom: Math.max(0.1, Math.min(5, prev.camera.zoom * zoomDelta))
      }
    }));
  }, [interactive]);

  // Render 3D scene (simplified representation)
  const renderScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !twin) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set up 3D projection (simplified isometric view)
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = 20 * viewport.camera.zoom;

    // Project 3D coordinates to 2D (simplified isometric projection)
    const project3D = (x: number, y: number, z: number): [number, number] => {
      const isoX = (x - y) * Math.cos(Math.PI / 6) * scale;
      const isoY = ((x + y) * Math.sin(Math.PI / 6) - z) * scale;
      return [centerX + isoX, centerY + isoY];
    };

    // Render elements
    renderedElements.forEach(element => {
      const [screenX, screenY] = project3D(...element.position);

      // Skip elements outside viewport
      if (screenX < -100 || screenX > width + 100 || screenY < -100 || screenY > height + 100) {
        return;
      }

      const [w, h, d] = element.dimensions;
      const width2D = (w + h) * Math.cos(Math.PI / 6) * scale;
      const height2D = ((w + h) * Math.sin(Math.PI / 6) + d) * scale;

      // Draw element
      ctx.save();
      ctx.globalAlpha = element.opacity;

      if (viewport.renderMode === 'wireframe' || viewport.showWireframe) {
        ctx.strokeStyle = element.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(screenX - width2D / 2, screenY - height2D / 2, width2D, height2D);
      } else {
        ctx.fillStyle = element.color;
        ctx.fillRect(screenX - width2D / 2, screenY - height2D / 2, width2D, height2D);

        // Add border
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(screenX - width2D / 2, screenY - height2D / 2, width2D, height2D);
      }

      // Draw label
      if (hoveredElement === element.id || viewport.selectedRoom === element.id || viewport.selectedSensor === element.id) {
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(element.label, screenX, screenY - height2D / 2 - 10);
      }

      ctx.restore();
    });

    // Draw coordinate system
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + 100, centerY);
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX, centerY - 100);
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#666';
    ctx.font = '10px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('X', centerX + 105, centerY + 5);
    ctx.fillText('Y', centerX + 5, centerY - 105);
  }, [twin, viewport, renderedElements, hoveredElement, width, height]);

  // Render loop
  useEffect(() => {
    const animate = () => {
      renderScene();
      requestAnimationFrame(animate);
    };

    if (twin) {
      animate();
    }
  }, [renderScene, twin]);

  // Handle element selection
  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    if (!interactive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Find clicked element (simplified hit detection)
    const clickedElement = renderedElements.find(element => {
      const centerX = width / 2;
      const centerY = height / 2;
      const scale = 20 * viewport.camera.zoom;

      const [screenX, screenY] = [
        centerX + (element.position[0] - element.position[1]) * Math.cos(Math.PI / 6) * scale,
        centerY + ((element.position[0] + element.position[1]) * Math.sin(Math.PI / 6) - element.position[2]) * scale
      ];

      const [w, h] = element.dimensions;
      const width2D = (w + h) * Math.cos(Math.PI / 6) * scale;
      const height2D = ((w + h) * Math.sin(Math.PI / 6) + element.dimensions[2]) * scale;

      return clickX >= screenX - width2D / 2 && clickX <= screenX + width2D / 2 &&
             clickY >= screenY - height2D / 2 && clickY <= screenY + height2D / 2;
    });

    if (clickedElement) {
      if (clickedElement.type === 'room' && onRoomSelect) {
        onRoomSelect(clickedElement.data);
        setViewport(prev => ({ ...prev, selectedRoom: clickedElement.id }));
      } else if (clickedElement.type === 'sensor' && onSensorSelect) {
        onSensorSelect(clickedElement.data);
        setViewport(prev => ({ ...prev, selectedSensor: clickedElement.id }));
      }
    }
  }, [interactive, renderedElements, viewport, width, height, onRoomSelect, onSensorSelect]);

  // Control panel
  const ControlPanel = () => (
    <div className="bg-[#1f2833] rounded-lg p-4 mb-4">
      <h3 className="text-white font-semibold mb-3">3D Viewer Controls</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => setViewport(prev => ({
            ...prev,
            camera: { ...prev.camera, position: [5, 5, 5], rotation: [0, 0, 0], zoom: 1 }
          }))}
          className="px-3 py-2 bg-[#45a29e] text-white rounded text-sm hover:bg-[#3a8a7a] transition-colors"
        >
          Reset View
        </button>

        <button
          onClick={() => setViewport(prev => ({ ...prev, showWireframe: !prev.showWireframe }))}
          className={`px-3 py-2 rounded text-sm transition-colors ${
            viewport.showWireframe
              ? 'bg-[#c5a059] text-[#0b0c10]'
              : 'bg-[#0b0c10] border border-[#45a29e]/30 text-[#45a29e]'
          }`}
        >
          Wireframe
        </button>

        <select
          value={viewport.renderMode}
          onChange={(e) => setViewport(prev => ({ ...prev, renderMode: e.target.value as any }))}
          className="px-3 py-2 bg-[#0b0c10] border border-[#45a29e]/30 rounded text-white text-sm focus:border-[#c5a059] focus:outline-none"
        >
          <option value="solid">Solid</option>
          <option value="wireframe">Wireframe</option>
          <option value="transparent">Transparent</option>
        </select>

        <div className="flex items-center space-x-2">
          <span className="text-[#45a29e] text-sm">Zoom:</span>
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={viewport.camera.zoom}
            onChange={(e) => setViewport(prev => ({
              ...prev,
              camera: { ...prev.camera, zoom: parseFloat(e.target.value) }
            }))}
            className="flex-1"
          />
        </div>
      </div>

      {/* Element counts */}
      <div className="mt-4 grid grid-cols-4 gap-2 text-center">
        <div className="bg-[#0b0c10] rounded p-2">
          <div className="text-white font-semibold">{renderedElements.filter(e => e.type === 'room').length}</div>
          <div className="text-xs text-[#45a29e]">Rooms</div>
        </div>
        <div className="bg-[#0b0c10] rounded p-2">
          <div className="text-white font-semibold">{renderedElements.filter(e => e.type === 'sensor').length}</div>
          <div className="text-xs text-[#45a29e]">Sensors</div>
        </div>
        <div className="bg-[#0b0c10] rounded p-2">
          <div className="text-white font-semibold">{renderedElements.filter(e => e.type === 'system').length}</div>
          <div className="text-xs text-[#45a29e]">Systems</div>
        </div>
        <div className="bg-[#0b0c10] rounded p-2">
          <div className="text-white font-semibold">{renderedElements.filter(e => e.type === 'feature').length}</div>
          <div className="text-xs text-[#45a29e]">Features</div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c5a059] mx-auto mb-4"></div>
          <p className="text-[#45a29e]">Loading 3D Model...</p>
        </div>
      </div>
    );
  }

  if (!twin) {
    return (
      <div className={`flex items-center justify-center bg-[#1f2833] rounded-lg ${className}`} style={{ width, height }}>
        <div className="text-center">
          <div className="text-6xl mb-4">🏠</div>
          <h3 className="text-xl font-bold text-white mb-2">Digital Twin Not Found</h3>
          <p className="text-[#45a29e]">Unable to load 3D model for this property.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#1f2833] rounded-lg overflow-hidden ${className}`}>
      <ControlPanel />

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onClick={handleCanvasClick}
          className={`border border-[#45a29e]/20 ${interactive ? 'cursor-move' : 'cursor-default'}`}
          style={{ display: 'block' }}
        />

        {/* Instructions overlay */}
        {interactive && (
          <div className="absolute top-4 right-4 bg-[#0b0c10]/90 rounded-lg p-3 text-xs text-[#45a29e]">
            <div>🖱️ Drag to rotate</div>
            <div>🔍 Scroll to zoom</div>
            <div>👆 Click to select</div>
          </div>
        )}

        {/* Selected element info */}
        {(viewport.selectedRoom || viewport.selectedSensor) && (
          <div className="absolute bottom-4 left-4 bg-[#0b0c10]/90 rounded-lg p-3 max-w-xs">
            <div className="text-white font-semibold mb-2">
              {viewport.selectedRoom ? 'Selected Room' : 'Selected Sensor'}
            </div>
            <div className="text-sm text-[#45a29e]">
              {renderedElements.find(e => e.id === (viewport.selectedRoom || viewport.selectedSensor))?.label}
            </div>
          </div>
        )}
      </div>

      {/* Property info */}
      <div className="p-4 border-t border-[#45a29e]/20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-white font-semibold">{twin.geometry.floors.length}</div>
            <div className="text-xs text-[#45a29e]">Floors</div>
          </div>
          <div>
            <div className="text-white font-semibold">{twin.geometry.rooms.length}</div>
            <div className="text-xs text-[#45a29e]">Rooms</div>
          </div>
          <div>
            <div className="text-white font-semibold">{twin.sensors.sensors.length}</div>
            <div className="text-xs text-[#45a29e]">Sensors</div>
          </div>
          <div>
            <div className="text-white font-semibold">
              {(twin.metadata.accuracy * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-[#45a29e]">Accuracy</div>
          </div>
        </div>
      </div>
    </div>
  );
}