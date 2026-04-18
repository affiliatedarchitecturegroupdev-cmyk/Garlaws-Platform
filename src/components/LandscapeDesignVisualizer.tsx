'use client';

import React, { useState, useRef, useEffect } from 'react';
import { LandscapeDesign, DesignElement, DesignZone } from '@/lib/types/property';

interface LandscapeDesignVisualizerProps {
  design: LandscapeDesign;
  viewMode: '2d' | '3d';
  onElementSelect?: (element: DesignElement) => void;
  onZoneSelect?: (zone: DesignZone) => void;
  interactive?: boolean;
  showGrid?: boolean;
  showDimensions?: boolean;
}

export function LandscapeDesignVisualizer({
  design,
  viewMode,
  onElementSelect,
  onZoneSelect,
  interactive = true,
  showGrid = true,
  showDimensions = true
}: LandscapeDesignVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedElement, setSelectedElement] = useState<DesignElement | null>(null);
  const [selectedZone, setSelectedZone] = useState<DesignZone | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const drawDesign = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set up coordinate system
    ctx.save();
    ctx.translate(canvas.width / 2 + pan.x, canvas.height / 2 + pan.y);
    ctx.scale(zoom, zoom);

    if (showGrid) {
      drawGrid(ctx, design);
    }

    // Draw zones first (background)
    design.zones.forEach(zone => {
      drawZone(ctx, zone);
    });

    // Draw elements
    design.elements.forEach(element => {
      drawElement(ctx, element);
    });

    if (showDimensions) {
      drawDimensions(ctx, design);
    }

    ctx.restore();
  };

  useEffect(() => {
    if (canvasRef.current) {
      drawDesign();
    }
  }, [design, viewMode, zoom, pan, showGrid, showDimensions]);

  const drawGrid = (ctx: CanvasRenderingContext2D, design: LandscapeDesign) => {
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;

    const gridSize = 10; // 10 feet/meters grid
    const bounds = calculateDesignBounds(design);

    // Vertical lines
    for (let x = bounds.minX; x <= bounds.maxX; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, bounds.minY);
      ctx.lineTo(x, bounds.maxY);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = bounds.minY; y <= bounds.maxY; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(bounds.minX, y);
      ctx.lineTo(bounds.maxX, y);
      ctx.stroke();
    }
  };

  const drawZone = (ctx: CanvasRenderingContext2D, zone: DesignZone) => {
    if (!zone.position) return;

    const { x, y } = zone.position;
    const radius = Math.sqrt(zone.area / Math.PI); // Approximate circle from area

    // Zone background
    ctx.fillStyle = getZoneColor(zone.type);
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Zone border
    ctx.strokeStyle = getZoneColor(zone.type);
    ctx.lineWidth = 2;
    ctx.stroke();

    // Zone label
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(zone.name, x, y + radius + 15);
  };

  const drawElement = (ctx: CanvasRenderingContext2D, element: DesignElement) => {
    if (!element.position) return;

    const { x, y } = element.position;
    const size = getElementSize(element);

    // Element shape based on category
    ctx.fillStyle = getElementColor(element);
    ctx.strokeStyle = selectedElement?.id === element.id ? '#ff0000' : '#333';
    ctx.lineWidth = selectedElement?.id === element.id ? 3 : 1;

    switch (element.category) {
      case 'softscape':
        drawSoftscapeElement(ctx, element, x, y, size);
        break;
      case 'hardscape':
        drawHardscapeElement(ctx, element, x, y, size);
        break;
      case 'water':
        drawWaterElement(ctx, element, x, y, size);
        break;
      case 'lighting':
        drawLightingElement(ctx, element, x, y, size);
        break;
      default:
        drawDefaultElement(ctx, element, x, y, size);
    }

    // Element label
    if (zoom > 0.5) {
      ctx.fillStyle = '#333';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(element.name, x, y - size - 5);
    }
  };

  const drawSoftscapeElement = (ctx: CanvasRenderingContext2D, element: DesignElement, x: number, y: number, size: number) => {
    // Draw as organic shape
    ctx.beginPath();
    ctx.ellipse(x, y, size, size * 0.7, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  };

  const drawHardscapeElement = (ctx: CanvasRenderingContext2D, element: DesignElement, x: number, y: number, size: number) => {
    // Draw as geometric shape
    ctx.fillRect(x - size/2, y - size/2, size, size);
    ctx.strokeRect(x - size/2, y - size/2, size, size);
  };

  const drawWaterElement = (ctx: CanvasRenderingContext2D, element: DesignElement, x: number, y: number, size: number) => {
    // Draw as blue circle
    ctx.fillStyle = '#4a90e2';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  };

  const drawLightingElement = (ctx: CanvasRenderingContext2D, element: DesignElement, x: number, y: number, size: number) => {
    // Draw as light bulb shape
    ctx.beginPath();
    ctx.arc(x, y - size/4, size/3, 0, Math.PI, true);
    ctx.lineTo(x - size/2, y + size/4);
    ctx.lineTo(x + size/2, y + size/4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  const drawDefaultElement = (ctx: CanvasRenderingContext2D, element: DesignElement, x: number, y: number, size: number) => {
    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  };

  const drawDimensions = (ctx: CanvasRenderingContext2D, design: LandscapeDesign) => {
    const bounds = calculateDesignBounds(design);

    // Draw dimension lines
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    // Width dimension
    ctx.beginPath();
    ctx.moveTo(bounds.minX, bounds.minY - 10);
    ctx.lineTo(bounds.maxX, bounds.minY - 10);
    ctx.stroke();

    // Height dimension
    ctx.beginPath();
    ctx.moveTo(bounds.maxX + 10, bounds.minY);
    ctx.lineTo(bounds.maxX + 10, bounds.maxY);
    ctx.stroke();

    ctx.setLineDash([]);

    // Dimension labels
    ctx.fillStyle = '#666';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${(bounds.maxX - bounds.minX).toFixed(1)} ft`, (bounds.minX + bounds.maxX) / 2, bounds.minY - 15);

    ctx.save();
    ctx.translate(bounds.maxX + 15, (bounds.minY + bounds.maxY) / 2);
    ctx.rotate(Math.PI / 2);
    ctx.fillText(`${(bounds.maxY - bounds.minY).toFixed(1)} ft`, 0, 0);
    ctx.restore();
  };

  const calculateDesignBounds = (design: LandscapeDesign) => {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    design.elements.forEach(element => {
      if (element.position) {
        const size = getElementSize(element);
        minX = Math.min(minX, element.position.x - size);
        maxX = Math.max(maxX, element.position.x + size);
        minY = Math.min(minY, element.position.y - size);
        maxY = Math.max(maxY, element.position.y + size);
      }
    });

    return { minX: minX || -50, maxX: maxX || 50, minY: minY || -50, maxY: maxY || 50 };
  };

  const getElementSize = (element: DesignElement): number => {
    if (element.dimensions?.width && element.dimensions?.height) {
      return Math.max(element.dimensions.width, element.dimensions.height) / 2;
    }
    return 5; // Default size
  };

  const getElementColor = (element: DesignElement): string => {
    switch (element.category) {
      case 'softscape':
        return element.subcategory === 'lawn' ? '#90EE90' : '#228B22';
      case 'hardscape':
        return '#D2B48C';
      case 'water':
        return '#4a90e2';
      case 'lighting':
        return '#FFD700';
      default:
        return '#808080';
    }
  };

  const getZoneColor = (zoneType: string): string => {
    switch (zoneType) {
      case 'entrance':
        return '#FFE4B5';
      case 'living':
        return '#F0E68C';
      case 'private':
        return '#DDA0DD';
      default:
        return '#F5F5F5';
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left - canvas.width / 2 - pan.x) / zoom;
    const y = (event.clientY - rect.top - canvas.height / 2 - pan.y) / zoom;

    // Check for element clicks
    for (const element of design.elements) {
      if (element.position) {
        const distance = Math.sqrt(
          Math.pow(x - element.position.x, 2) + Math.pow(y - element.position.y, 2)
        );
        const size = getElementSize(element);

        if (distance <= size) {
          setSelectedElement(element);
          setSelectedZone(null);
          onElementSelect?.(element);
          return;
        }
      }
    }

    // Check for zone clicks
    for (const zone of design.zones) {
      if (zone.position) {
        const distance = Math.sqrt(
          Math.pow(x - zone.position.x, 2) + Math.pow(y - zone.position.y, 2)
        );
        const radius = Math.sqrt(zone.area / Math.PI);

        if (distance <= radius) {
          setSelectedZone(zone);
          setSelectedElement(null);
          onZoneSelect?.(zone);
          return;
        }
      }
    }

    // Clear selection
    setSelectedElement(null);
    setSelectedZone(null);
  };

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.max(0.1, Math.min(5, prev + delta)));
  };

  const handlePan = (deltaX: number, deltaY: number) => {
    setPan(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
  };

  return (
    <div className="relative w-full h-full bg-white border rounded-lg overflow-hidden">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-full cursor-crosshair"
        onClick={handleCanvasClick}
        style={{ imageRendering: 'crisp-edges' }}
      />

      {/* Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => handleZoom(0.1)}
          className="bg-white border rounded p-1 hover:bg-gray-50"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={() => handleZoom(-0.1)}
          className="bg-white border rounded p-1 hover:bg-gray-50"
          title="Zoom Out"
        >
          -
        </button>
        <button
          onClick={() => setZoom(1)}
          className="bg-white border rounded p-1 hover:bg-gray-50 text-xs"
          title="Reset Zoom"
        >
          1:1
        </button>
      </div>

      {/* Info Panel */}
      {(selectedElement || selectedZone) && (
        <div className="absolute bottom-4 left-4 bg-white border rounded-lg p-3 shadow-lg max-w-xs">
          {selectedElement && (
            <div>
              <h3 className="font-semibold">{selectedElement.name}</h3>
              <p className="text-sm text-gray-600">
                {selectedElement.category} - {selectedElement.subcategory}
              </p>
              {selectedElement.cost && (
                <p className="text-sm">Cost: ${selectedElement.cost.toLocaleString()}</p>
              )}
              {selectedElement.sustainabilityScore && (
                <p className="text-sm">Sustainability: {selectedElement.sustainabilityScore}/10</p>
              )}
            </div>
          )}
          {selectedZone && (
            <div>
              <h3 className="font-semibold">{selectedZone.name}</h3>
              <p className="text-sm text-gray-600">{selectedZone.type}</p>
              <p className="text-sm">Area: {selectedZone.area.toFixed(1)} sq ft</p>
            </div>
          )}
        </div>
      )}

      {/* View Mode Toggle */}
      <div className="absolute top-4 left-4 flex gap-2">
        <button
          onClick={() => {/* Switch to 2D mode */}}
          className={`px-3 py-1 rounded ${viewMode === '2d' ? 'bg-blue-500 text-white' : 'bg-white border'}`}
        >
          2D
        </button>
        <button
          onClick={() => {/* Switch to 3D mode - would need Three.js integration */}}
          className={`px-3 py-1 rounded ${viewMode === '3d' ? 'bg-blue-500 text-white' : 'bg-white border'}`}
          disabled
        >
          3D
        </button>
      </div>
    </div>
  );
}