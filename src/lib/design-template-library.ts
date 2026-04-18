import { DesignElement, DesignTemplate, LandscapeDesign, DesignZone } from '@/lib/types/property';

interface LocalDesignTemplate {
  id: string;
  name: string;
  description: string;
  style: 'modern' | 'traditional' | 'minimalist' | 'tropical' | 'desert' | 'mediterranean';
  category: 'full_design' | 'zone_template' | 'element_group';
  elements: DesignElement[];
  zones?: any[];
  estimatedCost: number;
  maintenanceLevel: 'low' | 'medium' | 'high';
  suitability: {
    climate: string[];
    soilType: string[];
    propertySize: {
      min: number;
      max: number;
    };
  };
  tags: string[];
  thumbnail?: string;
}

export class DesignTemplateLibrary {
  private templates: Map<string, DesignTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  getTemplates(filters?: {
    style?: string;
    category?: string;
    maintenanceLevel?: string;
    maxCost?: number;
    climate?: string;
    soilType?: string;
  }): DesignTemplate[] {
    let filteredTemplates = Array.from(this.templates.values());

    if (filters) {
      filteredTemplates = filteredTemplates.filter(template => {
        if (filters.style && template.style !== filters.style) return false;
        if (filters.category && template.category !== filters.category) return false;
        if (filters.maintenanceLevel && template.maintenanceLevel !== filters.maintenanceLevel) return false;
        if (filters.maxCost && template.estimatedCost > filters.maxCost) return false;
        if (filters.climate && !template.suitability.climate.includes(filters.climate)) return false;
        if (filters.soilType && !template.suitability.soilType.includes(filters.soilType)) return false;
        return true;
      });
    }

    return filteredTemplates;
  }

  getTemplate(templateId: string): DesignTemplate | null {
    return this.templates.get(templateId) || null;
  }

  applyTemplate(templateId: string, propertyData: any, customization?: any): LandscapeDesign | null {
    const template = this.getTemplate(templateId);
    if (!template) return null;

    // Adapt template to property
    const adaptedElements = this.adaptElementsToProperty(template.elements, propertyData, customization);
    const adaptedZones = template.zones ? this.adaptZonesToProperty(template.zones, propertyData) : [];

    const design: LandscapeDesign = {
      id: `design-${Date.now()}`,
      name: `${template.name} Design`,
      propertyId: propertyData.id,
      elements: adaptedElements,
      zones: adaptedZones,
      style: template.style,
      estimatedCost: this.calculateAdaptedCost(adaptedElements),
      maintenanceLevel: template.maintenanceLevel,
      createdAt: new Date(),
      updatedAt: new Date(),
      description: template.description
    };

    return design;
  }

  private adaptElementsToProperty(
    elements: DesignElement[],
    propertyData: any,
    customization?: any
  ): DesignElement[] {
    return elements.map((element, index) => {
      const adaptedElement = { ...element };

      // Scale position based on property size
      if (adaptedElement.position) {
        const scaleFactor = Math.sqrt(propertyData.size / 5000); // Assuming base size of 5000 sq ft
        adaptedElement.position.x *= scaleFactor;
        adaptedElement.position.y *= scaleFactor;
      }

      // Apply customizations
      if (customization) {
        if (customization.colorScheme && adaptedElement.category === 'softscape') {
          adaptedElement.name = `${customization.colorScheme} ${adaptedElement.name}`;
        }
        if (customization.sizeMultiplier) {
          adaptedElement.dimensions = adaptedElement.dimensions ? {
            ...adaptedElement.dimensions,
            width: adaptedElement.dimensions.width * customization.sizeMultiplier,
            height: adaptedElement.dimensions.height * customization.sizeMultiplier
          } : undefined;
        }
      }

      // Generate unique ID
      adaptedElement.id = `${element.id}-${Date.now()}-${index}`;

      return adaptedElement;
    });
  }

  private adaptZonesToProperty(zones: any[], propertyData: any): any[] {
    return zones.map(zone => ({
      ...zone,
      area: zone.area * (propertyData.size / 5000) // Scale area
    }));
  }

  private calculateAdaptedCost(elements: DesignElement[]): number {
    return elements.reduce((total, element) => total + (element.cost || 0), 0);
  }

  private initializeTemplates(): void {
    // Modern Minimalist Design
    this.templates.set('modern-minimalist', {
      id: 'modern-minimalist',
      name: 'Modern Minimalist',
      description: 'Clean lines, geometric shapes, and sustainable materials for contemporary landscapes',
      style: 'modern',
      category: 'full_design',
      estimatedCost: 45000,
      maintenanceLevel: 'low',
      suitability: {
        climate: ['temperate', 'subtropical', 'mediterranean'],
        soilType: ['sandy', 'loamy', 'clay'],
        propertySize: { min: 2000, max: 10000 }
      },
      tags: ['modern', 'sustainable', 'low-maintenance', 'geometric'],
      elements: [
        {
          id: 'modern-lawn',
          name: 'Native Grass Lawn',
          category: 'softscape',
          subcategory: 'lawn',
          position: { x: 0, y: 0 },
          dimensions: { width: 60, height: 40 },
          cost: 8000,
          maintenanceLevel: 'medium',
          sunlightRequirement: 'full',
          soilPreference: ['loamy', 'sandy'],
          sustainabilityScore: 8,
          sustainabilityFocus: true,
          waterConservation: true
        },
        {
          id: 'concrete-path',
          name: 'Concrete Pathway',
          category: 'hardscape',
          subcategory: 'pathway',
          position: { x: 0, y: -20 },
          dimensions: { width: 40, height: 2 },
          cost: 4000,
          maintenanceLevel: 'low',
          sustainabilityScore: 7
        },
        {
          id: 'corten-planters',
          name: 'Corten Steel Planters',
          category: 'hardscape',
          subcategory: 'planter',
          position: { x: -25, y: 10 },
          dimensions: { width: 6, height: 6, depth: 2 },
          cost: 2400,
          maintenanceLevel: 'low',
          sustainabilityScore: 9
        },
        {
          id: 'led-lighting',
          name: 'LED Path Lighting',
          category: 'lighting',
          subcategory: 'path',
          position: { x: 0, y: -20 },
          cost: 1200,
          maintenanceLevel: 'low',
          sustainabilityScore: 10
        }
      ],
      zones: [
        {
          name: 'Main Living Area',
          type: 'living',
          elements: [],
          area: 2000,
          purpose: 'Entertainment and relaxation'
        },
        {
          name: 'Entry Pathway',
          type: 'entrance',
          elements: [],
          area: 400,
          purpose: 'Welcoming entry experience'
        }
      ]
    });

    // Tropical Paradise Design
    this.templates.set('tropical-paradise', {
      id: 'tropical-paradise',
      name: 'Tropical Paradise',
      description: 'Lush greenery, vibrant colors, and exotic plants for a resort-like atmosphere',
      style: 'tropical',
      category: 'full_design',
      estimatedCost: 65000,
      maintenanceLevel: 'high',
      suitability: {
        climate: ['tropical', 'subtropical'],
        soilType: ['loamy', 'clay'],
        propertySize: { min: 3000, max: 15000 }
      },
      tags: ['tropical', 'lush', 'colorful', 'exotic', 'resort-style'],
      elements: [
        {
          id: 'palm-trees',
          name: 'Queen Palm Trees',
          category: 'softscape',
          subcategory: 'tree',
          position: { x: 20, y: 15 },
          dimensions: { width: 8, height: 20 },
          cost: 1800,
          maintenanceLevel: 'medium',
          sunlightRequirement: 'full',
          soilPreference: ['loamy', 'clay'],
          sustainabilityScore: 7
        },
        {
          id: 'hibiscus-shrubs',
          name: 'Hibiscus Shrubs',
          category: 'softscape',
          subcategory: 'shrub',
          position: { x: -15, y: 5 },
          dimensions: { width: 4, height: 4 },
          cost: 600,
          maintenanceLevel: 'medium',
          sunlightRequirement: 'full',
          sustainabilityScore: 6
        },
        {
          id: 'koi-pond',
          name: 'Koi Pond',
          category: 'water',
          subcategory: 'pond',
          position: { x: -20, y: -10 },
          dimensions: { width: 12, height: 8, depth: 3 },
          cost: 8000,
          maintenanceLevel: 'high',
          waterConservation: false,
          sustainabilityScore: 5
        },
        {
          id: 'tiki-torches',
          name: 'Tiki Torches',
          category: 'lighting',
          subcategory: 'ambient',
          position: { x: 0, y: 0 },
          cost: 800,
          maintenanceLevel: 'low',
          sustainabilityScore: 6
        }
      ]
    });

    // Desert Oasis Design
    this.templates.set('desert-oasis', {
      id: 'desert-oasis',
      name: 'Desert Oasis',
      description: 'Drought-tolerant plants, natural stone, and water features for arid climates',
      style: 'desert',
      category: 'full_design',
      estimatedCost: 55000,
      maintenanceLevel: 'low',
      suitability: {
        climate: ['desert', 'arid', 'mediterranean'],
        soilType: ['sandy', 'gravelly'],
        propertySize: { min: 2500, max: 8000 }
      },
      tags: ['desert', 'drought-tolerant', 'natural-stone', 'oasis', 'water-efficient'],
      elements: [
        {
          id: 'xeriscape-lawn',
          name: 'Artificial Turf',
          category: 'softscape',
          subcategory: 'lawn',
          position: { x: 0, y: 0 },
          dimensions: { width: 50, height: 30 },
          cost: 6000,
          maintenanceLevel: 'low',
          waterConservation: true,
          sustainabilityScore: 9
        },
        {
          id: 'agave-plants',
          name: 'Agave Plants',
          category: 'softscape',
          subcategory: 'succulent',
          position: { x: 15, y: 10 },
          dimensions: { width: 3, height: 4 },
          cost: 300,
          maintenanceLevel: 'low',
          sunlightRequirement: 'full',
          soilPreference: ['sandy', 'gravelly'],
          waterConservation: true,
          sustainabilityScore: 10
        },
        {
          id: 'flagstone-path',
          name: 'Flagstone Pathway',
          category: 'hardscape',
          subcategory: 'pathway',
          position: { x: 0, y: -15 },
          dimensions: { width: 35, height: 3 },
          cost: 7000,
          maintenanceLevel: 'low',
          sustainabilityScore: 8
        },
        {
          id: 'bubbling-fountain',
          name: 'Bubbling Fountain',
          category: 'water',
          subcategory: 'fountain',
          position: { x: -18, y: 8 },
          dimensions: { width: 4, height: 4 },
          cost: 2500,
          maintenanceLevel: 'medium',
          waterConservation: true,
          sustainabilityScore: 7
        }
      ]
    });

    // Traditional English Garden
    this.templates.set('english-garden', {
      id: 'english-garden',
      name: 'English Garden',
      description: 'Formal hedges, rose gardens, and structured layouts inspired by classic English design',
      style: 'traditional',
      category: 'full_design',
      estimatedCost: 75000,
      maintenanceLevel: 'high',
      suitability: {
        climate: ['temperate', 'maritime'],
        soilType: ['loamy', 'clay'],
        propertySize: { min: 4000, max: 20000 }
      },
      tags: ['traditional', 'english', 'formal', 'roses', 'structured'],
      elements: [
        {
          id: 'english-lawn',
          name: 'Manicured Lawn',
          category: 'softscape',
          subcategory: 'lawn',
          position: { x: 0, y: 0 },
          dimensions: { width: 80, height: 50 },
          cost: 12000,
          maintenanceLevel: 'high',
          sunlightRequirement: 'full',
          sustainabilityScore: 5
        },
        {
          id: 'boxwood-hedges',
          name: 'Boxwood Hedges',
          category: 'softscape',
          subcategory: 'hedge',
          position: { x: -30, y: 0 },
          dimensions: { width: 2, height: 20 },
          cost: 3200,
          maintenanceLevel: 'high',
          sunlightRequirement: 'partial',
          sustainabilityScore: 6
        },
        {
          id: 'rose-garden',
          name: 'Rose Garden Bed',
          category: 'softscape',
          subcategory: 'flower_bed',
          position: { x: 25, y: 15 },
          dimensions: { width: 15, height: 10 },
          cost: 1800,
          maintenanceLevel: 'high',
          sunlightRequirement: 'full',
          sustainabilityScore: 4
        },
        {
          id: 'brick-path',
          name: 'Brick Pathway',
          category: 'hardscape',
          subcategory: 'pathway',
          position: { x: 0, y: -20 },
          dimensions: { width: 50, height: 3 },
          cost: 8000,
          maintenanceLevel: 'medium',
          sustainabilityScore: 6
        },
        {
          id: 'garden-shed',
          name: 'Garden Shed',
          category: 'hardscape',
          subcategory: 'structure',
          position: { x: -35, y: -20 },
          dimensions: { width: 8, height: 6 },
          cost: 3000,
          maintenanceLevel: 'medium',
          sustainabilityScore: 5
        }
      ]
    });

    // Mediterranean Courtyard
    this.templates.set('mediterranean-courtyard', {
      id: 'mediterranean-courtyard',
      name: 'Mediterranean Courtyard',
      description: 'Terra cotta tiles, olive trees, and herb gardens inspired by Mediterranean villas',
      style: 'mediterranean',
      category: 'zone_template',
      estimatedCost: 35000,
      maintenanceLevel: 'medium',
      suitability: {
        climate: ['mediterranean', 'arid', 'subtropical'],
        soilType: ['sandy', 'loamy'],
        propertySize: { min: 1500, max: 6000 }
      },
      tags: ['mediterranean', 'courtyard', 'terra-cotta', 'olive-trees', 'herbs'],
      elements: [
        {
          id: 'terra-cotta-tiles',
          name: 'Terra Cotta Tile Patio',
          category: 'hardscape',
          subcategory: 'p patio',
          position: { x: 0, y: 0 },
          dimensions: { width: 25, height: 20 },
          cost: 10000,
          maintenanceLevel: 'low',
          sustainabilityScore: 8
        },
        {
          id: 'olive-tree',
          name: 'Olive Tree',
          category: 'softscape',
          subcategory: 'tree',
          position: { x: 8, y: 6 },
          dimensions: { width: 6, height: 12 },
          cost: 250,
          maintenanceLevel: 'low',
          sunlightRequirement: 'full',
          soilPreference: ['sandy', 'loamy'],
          waterConservation: true,
          sustainabilityScore: 9
        },
        {
          id: 'lavender-border',
          name: 'Lavender Border',
          category: 'softscape',
          subcategory: 'herb',
          position: { x: -10, y: 0 },
          dimensions: { width: 2, height: 15 },
          cost: 400,
          maintenanceLevel: 'medium',
          sunlightRequirement: 'full',
          waterConservation: true,
          sustainabilityScore: 8
        },
        {
          id: 'clay-pots',
          name: 'Clay Herb Pots',
          category: 'hardscape',
          subcategory: 'planter',
          position: { x: 0, y: -8 },
          dimensions: { width: 12, height: 2 },
          cost: 800,
          maintenanceLevel: 'low',
          sustainabilityScore: 7
        }
      ]
    });
  }
}

// Export singleton instance
export const designTemplateLibrary = new DesignTemplateLibrary();