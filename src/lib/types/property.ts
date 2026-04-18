export interface PropertyData {
  id: string;
  size: number;
  dimensions?: {
    length: number;
    width: number;
  };
  elevation?: number;
  location: {
    latitude: number;
    longitude: number;
  };
  address: string;
  ownerId: string;
  type: 'residential' | 'commercial' | 'industrial';
}

export interface EnvironmentalFactors {
  climate: string;
  soilType: string;
  sunlightHours: number;
  rainfall: number;
  temperature: {
    average: number;
    min: number;
    max: number;
  };
  humidity: number;
  windSpeed: number;
  existingVegetation: string[];
  waterFeatures: boolean;
  airQuality: 'good' | 'moderate' | 'poor';
}

export interface DesignElement {
  id: string;
  name: string;
  category: 'hardscape' | 'softscape' | 'water' | 'lighting';
  subcategory: string;
  position?: {
    x: number;
    y: number;
  };
  dimensions?: {
    width: number;
    height: number;
    depth?: number;
  };
  materials?: string[];
  cost?: number;
  maintenanceLevel?: 'low' | 'medium' | 'high';
  sunlightRequirement?: 'full' | 'partial' | 'shade';
  soilPreference?: string[];
  waterConservation?: boolean;
  sustainabilityScore?: number;
  sustainabilityFocus?: boolean;
  alternatives?: DesignElement[];
}

export interface LandscapeDesign {
  id: string;
  name: string;
  propertyId: string;
  elements: DesignElement[];
  zones: DesignZone[];
  style: 'modern' | 'traditional' | 'minimalist' | 'tropical' | 'desert' | 'mediterranean';
  estimatedCost: number;
  maintenanceLevel: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
  thumbnail?: string;
  description?: string;
}

export interface DesignZone {
  name: string;
  type: string;
  elements: DesignElement[];
  area: number;
  purpose: string;
  position?: {
    x: number;
    y: number;
  };
}

export interface DesignOptimizationCriteria {
  budget: number;
  maintenancePreference: 'low' | 'medium' | 'high';
  sustainabilityPriority: number; // 1-10
  waterConservation: boolean;
  biodiversity: boolean;
  aesthetics: number; // 1-10
}

export interface DesignTemplate {
  id: string;
  name: string;
  description: string;
  style: 'modern' | 'traditional' | 'minimalist' | 'tropical' | 'desert' | 'mediterranean';
  category: 'full_design' | 'zone_template' | 'element_group';
  elements: DesignElement[];
  zones?: DesignZone[];
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

export interface GenerativeDesignParams {
  propertyId: string;
  propertyData: PropertyData;
  environmentalFactors: EnvironmentalFactors;
  designPreferences: {
    style: 'modern' | 'traditional' | 'minimalist' | 'tropical' | 'desert' | 'mediterranean';
    budget: number;
    maintenanceLevel: 'low' | 'medium' | 'high';
    sustainabilityFocus: boolean;
    waterConservation: boolean;
  };
  constraints: {
    maxArea?: number;
    existingFeatures?: DesignElement[];
    soilType?: string;
    sunlightHours?: number;
  };
}

export interface DesignGenerationResult {
  designs: LandscapeDesign[];
  optimizationMetrics: {
    cost: number;
    maintenanceCost: number;
    waterUsage: number;
    carbonFootprint: number;
    biodiversityScore: number;
  };
  confidence: number;
}