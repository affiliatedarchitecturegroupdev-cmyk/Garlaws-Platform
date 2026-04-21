"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { ScatterChart, BarChart3, TrendingUp, RotateCcw, ZoomIn, ZoomOut, Move } from 'lucide-react';

interface MultiDimVizProps {
  data?: any[];
  dimensions?: string[];
  onVisualizationChange?: (config: any) => void;
}

const MultiDimViz: React.FC<MultiDimVizProps> = ({
  data = [],
  dimensions: propDimensions,
  onVisualizationChange
}) => {
  const [activeViz, setActiveViz] = useState('scatter3d');
  const [isProcessing, setIsProcessing] = useState(false);
  const [vizConfig, setVizConfig] = useState({
    rotation: { x: 0, y: 0, z: 0 },
    zoom: 1,
    pan: { x: 0, y: 0 },
    selectedDimensions: [] as string[],
    colorBy: '',
    sizeBy: ''
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Auto-detect numeric dimensions
  const availableDimensions = useMemo(() => {
    if (!data.length) return [];

    const numericColumns = Object.keys(data[0] || {}).filter(key =>
      typeof data[0][key] === 'number' && !isNaN(data[0][key])
    );

    return numericColumns;
  }, [data]);

  const dimensions = propDimensions || availableDimensions.slice(0, 3);

  useEffect(() => {
    if (dimensions.length >= 3 && vizConfig.selectedDimensions.length === 0) {
      setVizConfig(prev => ({
        ...prev,
        selectedDimensions: dimensions.slice(0, 3)
      }));
    }
  }, [dimensions, vizConfig.selectedDimensions.length]);

  // Normalize data for visualization
  const normalizedData = useMemo(() => {
    if (!data.length || !vizConfig.selectedDimensions.length) return [];

    return data.map(row => {
      const normalized: any = {};
      vizConfig.selectedDimensions.forEach(dim => {
        const values = data.map(r => parseFloat(r[dim])).filter(v => !isNaN(v));
        const min = Math.min(...values);
        const max = Math.max(...values);
        const value = parseFloat(row[dim]);

        normalized[dim] = isNaN(value) ? 0 : (value - min) / (max - min);
        normalized[`${dim}_raw`] = value;
      });

      // Add color and size based on configuration
      if (vizConfig.colorBy && availableDimensions.includes(vizConfig.colorBy)) {
        const colorValues = data.map(r => parseFloat(r[vizConfig.colorBy])).filter(v => !isNaN(v));
        const colorMin = Math.min(...colorValues);
        const colorMax = Math.max(...colorValues);
        const colorValue = parseFloat(row[vizConfig.colorBy]);
        normalized.colorValue = isNaN(colorValue) ? 0 : (colorValue - colorMin) / (colorMax - colorMin);
      }

      if (vizConfig.sizeBy && availableDimensions.includes(vizConfig.sizeBy)) {
        const sizeValues = data.map(r => parseFloat(r[vizConfig.sizeBy])).filter(v => !isNaN(v));
        const sizeMin = Math.min(...sizeValues);
        const sizeMax = Math.max(...sizeValues);
        const sizeValue = parseFloat(row[vizConfig.sizeBy]);
        normalized.sizeValue = isNaN(sizeValue) ? 0.5 : (sizeValue - sizeMin) / (sizeMax - sizeMin);
      }

      return normalized;
    });
  }, [data, vizConfig.selectedDimensions, vizConfig.colorBy, vizConfig.sizeBy, availableDimensions]);

  const draw3DScatterPlot = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!normalizedData.length || vizConfig.selectedDimensions.length < 3) return;

    ctx.clearRect(0, 0, width, height);

    // Set up 3D projection
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = Math.min(width, height) * 0.3 * vizConfig.zoom;

    normalizedData.forEach((point, index) => {
      const x = point[vizConfig.selectedDimensions[0]] * scale;
      const y = point[vizConfig.selectedDimensions[1]] * scale;
      const z = point[vizConfig.selectedDimensions[2]] * scale;

      // Simple 3D rotation
      const cosX = Math.cos(vizConfig.rotation.x);
      const sinX = Math.sin(vizConfig.rotation.x);
      const cosY = Math.cos(vizConfig.rotation.y);
      const sinY = Math.sin(vizConfig.rotation.y);

      const rotatedY = y * cosX - z * sinX;
      const rotatedZ = y * sinX + z * cosX;
      const finalX = x * cosY + rotatedZ * sinY;
      const finalY = rotatedY;
      const finalZ = -x * sinY + rotatedZ * cosY;

      // Project to 2D
      const screenX = centerX + finalX + vizConfig.pan.x;
      const screenY = centerY - finalY + vizConfig.pan.y;

      // Calculate point size and color
      const size = 3 + (point.sizeValue || 0.5) * 5;
      const hue = point.colorValue !== undefined ? point.colorValue * 360 : index * 137.5 % 360;

      ctx.beginPath();
      ctx.arc(screenX, screenY, size, 0, 2 * Math.PI);
      ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.stroke();
    });

    // Draw axes labels
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.font = '12px Arial';
    ctx.fillText(vizConfig.selectedDimensions[0], 10, height - 10);
    ctx.fillText(vizConfig.selectedDimensions[1], width - 50, 20);
    ctx.fillText(vizConfig.selectedDimensions[2], width / 2, height / 2 + 100);
  };

  const drawParallelCoordinates = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!normalizedData.length || vizConfig.selectedDimensions.length < 2) return;

    ctx.clearRect(0, 0, width, height);

    const axisSpacing = width / (vizConfig.selectedDimensions.length + 1);
    const margin = 50;

    // Draw axes
    vizConfig.selectedDimensions.forEach((dim, index) => {
      const x = margin + (index + 1) * axisSpacing;

      ctx.beginPath();
      ctx.moveTo(x, margin);
      ctx.lineTo(x, height - margin);
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.stroke();

      // Axis label
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      ctx.font = '12px Arial';
      ctx.save();
      ctx.translate(x, height - 20);
      ctx.rotate(-Math.PI / 4);
      ctx.fillText(dim, 0, 0);
      ctx.restore();
    });

    // Draw lines for each data point
    normalizedData.forEach((point, index) => {
      const hue = point.colorValue !== undefined ? point.colorValue * 360 : index * 137.5 % 360;

      ctx.strokeStyle = `hsl(${hue}, 70%, 50%)`;
      ctx.lineWidth = point.sizeValue ? 1 + point.sizeValue * 2 : 1;
      ctx.beginPath();

      vizConfig.selectedDimensions.forEach((dim, dimIndex) => {
        const x = margin + (dimIndex + 1) * axisSpacing;
        const y = height - margin - (point[dim] * (height - 2 * margin));

        if (dimIndex === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    if (activeViz === 'scatter3d') {
      draw3DScatterPlot(ctx, width, height);
    } else if (activeViz === 'parallel') {
      drawParallelCoordinates(ctx, width, height);
    }

    if (onVisualizationChange) {
      onVisualizationChange(vizConfig);
    }
  }, [normalizedData, vizConfig, activeViz]);

  const handleDimensionChange = (dimension: string, index: number) => {
    const newDimensions = [...vizConfig.selectedDimensions];
    newDimensions[index] = dimension;
    setVizConfig(prev => ({ ...prev, selectedDimensions: newDimensions }));
  };

  const resetView = () => {
    setVizConfig(prev => ({
      ...prev,
      rotation: { x: 0, y: 0, z: 0 },
      zoom: 1,
      pan: { x: 0, y: 0 }
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScatterChart className="h-5 w-5 text-primary" />
            Multi-Dimensional Data Visualization
          </CardTitle>
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Badge variant="secondary">
                {availableDimensions.length} Dimensions Available
              </Badge>
              <Badge variant="secondary">
                {data.length} Data Points
              </Badge>
            </div>
            <Button onClick={resetView} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset View
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Dimension Selection */}
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Selected Dimensions</h4>
            <div className="flex gap-2 flex-wrap">
              {vizConfig.selectedDimensions.map((dim, index) => (
                <select
                  key={index}
                  value={dim}
                  onChange={(e) => handleDimensionChange(e.target.value, index)}
                  className="px-2 py-1 border rounded text-sm"
                >
                  {availableDimensions.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              ))}
              {vizConfig.selectedDimensions.length < availableDimensions.length && (
                <Button
                  onClick={() => {
                    const nextDim = availableDimensions.find(d => !vizConfig.selectedDimensions.includes(d));
                    if (nextDim) {
                      setVizConfig(prev => ({
                        ...prev,
                        selectedDimensions: [...prev.selectedDimensions, nextDim]
                      }));
                    }
                  }}
                  variant="outline"
                  size="sm"
                >
                  Add Dimension
                </Button>
              )}
            </div>
          </div>

          {/* Visualization Controls */}
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Visualization Options</h4>
            <div className="flex gap-4 flex-wrap">
              <div>
                <label className="text-sm text-muted-foreground">Color by:</label>
                <select
                  value={vizConfig.colorBy}
                  onChange={(e) => setVizConfig(prev => ({ ...prev, colorBy: e.target.value }))}
                  className="ml-2 px-2 py-1 border rounded text-sm"
                >
                  <option value="">None</option>
                  {availableDimensions.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Size by:</label>
                <select
                  value={vizConfig.sizeBy}
                  onChange={(e) => setVizConfig(prev => ({ ...prev, sizeBy: e.target.value }))}
                  className="ml-2 px-2 py-1 border rounded text-sm"
                >
                  <option value="">None</option>
                  {availableDimensions.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeViz} onValueChange={setActiveViz}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scatter3d" className="flex items-center gap-2">
            <ScatterChart className="h-4 w-4" />
            3D Scatter Plot
          </TabsTrigger>
          <TabsTrigger value="parallel" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Parallel Coordinates
          </TabsTrigger>
          <TabsTrigger value="interactive" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Interactive Scatter
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scatter3d" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="mb-4 flex gap-2">
                <Button
                  onClick={() => setVizConfig(prev => ({
                    ...prev,
                    rotation: { ...prev.rotation, y: prev.rotation.y + 0.1 }
                  }))}
                  variant="outline"
                  size="sm"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Rotate Y
                </Button>
                <Button
                  onClick={() => setVizConfig(prev => ({
                    ...prev,
                    zoom: Math.max(0.1, prev.zoom - 0.1)
                  }))}
                  variant="outline"
                  size="sm"
                >
                  <ZoomOut className="h-4 w-4 mr-2" />
                  Zoom Out
                </Button>
                <Button
                  onClick={() => setVizConfig(prev => ({
                    ...prev,
                    zoom: Math.min(3, prev.zoom + 0.1)
                  }))}
                  variant="outline"
                  size="sm"
                >
                  <ZoomIn className="h-4 w-4 mr-2" />
                  Zoom In
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={600}
                  className="w-full h-auto bg-white"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </div>

              {vizConfig.selectedDimensions.length < 3 && (
                <Alert className="mt-4">
                  <AlertDescription>
                    3D scatter plot requires at least 3 dimensions. Please select more dimensions above.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parallel" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="border rounded-lg overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={600}
                  className="w-full h-auto bg-white"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </div>

              {vizConfig.selectedDimensions.length < 2 && (
                <Alert className="mt-4">
                  <AlertDescription>
                    Parallel coordinates plot requires at least 2 dimensions.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interactive" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="border rounded-lg overflow-hidden bg-gray-50 p-8">
                <div className="text-center text-muted-foreground">
                  <ScatterChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Interactive scatter plot component would be implemented here</p>
                  <p className="text-sm">This would include brushing, zooming, and detailed tooltips</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {!data.length && (
        <Alert>
          <AlertDescription>
            No data available for multi-dimensional visualization. Please provide a dataset to begin.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default MultiDimViz;