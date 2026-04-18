'use client';

import React, { useState, useEffect } from 'react';
import { LandscapeDesign, DesignElement, DesignZone } from '@/lib/types/property';
import { LandscapeDesignVisualizer } from '@/components/LandscapeDesignVisualizer';

interface LandscapeDesignDashboardProps {
  propertyId: string;
}

export function LandscapeDesignDashboard({ propertyId }: LandscapeDesignDashboardProps) {
  const [designs, setDesigns] = useState<LandscapeDesign[]>([]);
  const [selectedDesign, setSelectedDesign] = useState<LandscapeDesign | null>(null);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showElementLibrary, setShowElementLibrary] = useState(false);
  const [draggedElement, setDraggedElement] = useState<DesignElement | null>(null);

  useEffect(() => {
    loadDesigns();
  }, [propertyId]);

  const loadDesigns = async () => {
    try {
      const response = await fetch(`/api/landscape-design?propertyId=${propertyId}`);
      const result = await response.json();
      if (result.success) {
        setDesigns(result.data);
        if (result.data.length > 0 && !selectedDesign) {
          setSelectedDesign(result.data[0]);
        }
      }
    } catch (error) {
      console.error('Error loading designs:', error);
    }
  };

  const generateNewDesign = async () => {
    setIsGenerating(true);
    try {
      // Mock property data - in real app, this would come from props or API
      const designParams = {
        propertyId,
        propertyData: {
          id: propertyId,
          size: 5000,
          dimensions: { length: 100, width: 50 },
          elevation: 10,
          location: { latitude: -26.2041, longitude: 28.0473 },
          address: '123 Property Street, Johannesburg',
          ownerId: 'user-123',
          type: 'residential' as const
        },
        environmentalFactors: {
          climate: 'subtropical',
          soilType: 'clay',
          sunlightHours: 8,
          rainfall: 600,
          temperature: { average: 22, min: 10, max: 35 },
          humidity: 65,
          windSpeed: 15,
          existingVegetation: ['grass', 'trees'],
          waterFeatures: false,
          airQuality: 'moderate' as const
        },
        designPreferences: {
          style: 'modern' as const,
          budget: 50000,
          maintenanceLevel: 'medium' as const,
          sustainabilityFocus: true,
          waterConservation: true
        },
        constraints: {
          maxArea: 4000,
          soilType: 'clay',
          sunlightHours: 8
        }
      };

      const response = await fetch('/api/landscape-design/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(designParams)
      });

      const result = await response.json();
      if (result.success) {
        // Save the generated design
        const saveResponse = await fetch('/api/landscape-design', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result.data.designs[0])
        });

        if (saveResponse.ok) {
          await loadDesigns();
        }
      }
    } catch (error) {
      console.error('Error generating design:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleElementSelect = (element: DesignElement) => {
    console.log('Selected element:', element);
  };

  const handleZoneSelect = (zone: DesignZone) => {
    console.log('Selected zone:', zone);
  };

  const handleDragStart = (element: DesignElement) => {
    setDraggedElement(element);
  };

  const handleDragEnd = () => {
    setDraggedElement(null);
  };

  const handleDropOnCanvas = (event: React.DragEvent) => {
    if (!draggedElement || !selectedDesign) return;

    const canvas = event.currentTarget as HTMLElement;
    const rect = canvas.getBoundingClientRect();

    // Calculate position relative to canvas center
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;

    // Add element to design at dropped position
    const newElement: DesignElement = {
      ...draggedElement,
      id: `${draggedElement.id}-${Date.now()}`,
      position: { x, y }
    };

    const updatedDesign: LandscapeDesign = {
      ...selectedDesign,
      elements: [...selectedDesign.elements, newElement],
      updatedAt: new Date()
    };

    updateDesign(updatedDesign);
  };

  const updateDesign = async (design: LandscapeDesign) => {
    try {
      const response = await fetch(`/api/landscape-design/${design.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(design)
      });

      if (response.ok) {
        setSelectedDesign(design);
        setDesigns(prev => prev.map(d => d.id === design.id ? design : d));
      }
    } catch (error) {
      console.error('Error updating design:', error);
    }
  };

  const deleteDesign = async (designId: string) => {
    try {
      const response = await fetch(`/api/landscape-design/${designId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setDesigns(prev => prev.filter(d => d.id !== designId));
        if (selectedDesign?.id === designId) {
          setSelectedDesign(designs.find(d => d.id !== designId) || null);
        }
      }
    } catch (error) {
      console.error('Error deleting design:', error);
    }
  };

  const elementLibrary = [
    {
      id: 'lawn-basic',
      name: 'Basic Lawn',
      category: 'softscape' as const,
      subcategory: 'lawn',
      cost: 2000,
      maintenanceLevel: 'medium' as const,
      sunlightRequirement: 'full' as const,
      sustainabilityScore: 7
    },
    {
      id: 'tree-oak',
      name: 'Oak Tree',
      category: 'softscape' as const,
      subcategory: 'tree',
      cost: 150,
      maintenanceLevel: 'low' as const,
      sunlightRequirement: 'full' as const,
      sustainabilityScore: 9
    },
    {
      id: 'shrub-lavender',
      name: 'Lavender Shrub',
      category: 'softscape' as const,
      subcategory: 'shrub',
      cost: 25,
      maintenanceLevel: 'low' as const,
      sunlightRequirement: 'full' as const,
      waterConservation: true,
      sustainabilityScore: 8
    },
    {
      id: 'path-concrete',
      name: 'Concrete Path',
      category: 'hardscape' as const,
      subcategory: 'pathway',
      cost: 50, // per square foot
      maintenanceLevel: 'low' as const,
      sustainabilityScore: 6
    },
    {
      id: 'pond-small',
      name: 'Small Pond',
      category: 'water' as const,
      subcategory: 'pond',
      cost: 2000,
      maintenanceLevel: 'medium' as const,
      waterConservation: true,
      sustainabilityScore: 7
    },
    {
      id: 'light-solar',
      name: 'Solar Light',
      category: 'lighting' as const,
      subcategory: 'path',
      cost: 75,
      maintenanceLevel: 'low' as const,
      sustainabilityScore: 10
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Landscape Design</h2>
          <p className="text-sm text-gray-600">Property: {propertyId}</p>
        </div>

        {/* Design List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Designs</h3>
              <button
                onClick={generateNewDesign}
                disabled={isGenerating}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
              >
                {isGenerating ? 'Generating...' : 'Generate AI Design'}
              </button>
            </div>

            <div className="space-y-2">
              {designs.map(design => (
                <div
                  key={design.id}
                  onClick={() => setSelectedDesign(design)}
                  className={`p-3 border rounded cursor-pointer ${
                    selectedDesign?.id === design.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h4 className="font-medium">{design.name}</h4>
                  <p className="text-sm text-gray-600">{design.style}</p>
                  <p className="text-sm text-green-600">${design.estimatedCost.toLocaleString()}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDesign(design.id);
                    }}
                    className="text-red-500 text-sm hover:text-red-700 mt-1"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Element Library */}
          <div className="border-t border-gray-200">
            <div className="p-4">
              <button
                onClick={() => setShowElementLibrary(!showElementLibrary)}
                className="flex items-center justify-between w-full text-left"
              >
                <h3 className="font-medium">Element Library</h3>
                <span>{showElementLibrary ? '−' : '+'}</span>
              </button>

              {showElementLibrary && (
                <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                  {elementLibrary.map(element => (
                    <div
                      key={element.id}
                      draggable
                      onDragStart={() => handleDragStart(element)}
                      onDragEnd={handleDragEnd}
                      className="p-2 border border-gray-200 rounded cursor-move hover:border-gray-300 bg-gray-50"
                    >
                      <div className="font-medium text-sm">{element.name}</div>
                      <div className="text-xs text-gray-600">
                        {element.category} • ${element.cost}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">
              {selectedDesign ? selectedDesign.name : 'No Design Selected'}
            </h1>
            {selectedDesign && (
              <span className="text-sm text-gray-600">
                {selectedDesign.elements.length} elements • ${selectedDesign.estimatedCost.toLocaleString()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('2d')}
              className={`px-3 py-1 rounded ${viewMode === '2d' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              2D
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1 rounded ${viewMode === '3d' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              disabled
            >
              3D
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 p-4">
          {selectedDesign ? (
            <div
              className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
              onDrop={handleDropOnCanvas}
              onDragOver={(e) => e.preventDefault()}
            >
              <LandscapeDesignVisualizer
                design={selectedDesign}
                viewMode={viewMode}
                onElementSelect={handleElementSelect}
                onZoneSelect={handleZoneSelect}
                interactive={true}
                showGrid={true}
                showDimensions={true}
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-lg mb-4">No design selected</p>
                <button
                  onClick={generateNewDesign}
                  disabled={isGenerating}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {isGenerating ? 'Generating...' : 'Generate Your First Design'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}