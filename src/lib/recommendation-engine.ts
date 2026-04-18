// Advanced Recommendation Engine for Services and Providers
export interface UserProfile {
  userId: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    suburb: string;
    city: string;
  };
  preferences: {
    budgetRange: [number, number];
    preferredTimes: string[]; // e.g., ['weekdays', 'weekends', 'mornings']
    servicePriorities: string[]; // e.g., ['quality', 'price', 'speed', 'eco_friendly']
    pastRatings: Array<{
      providerId: string;
      serviceType: string;
      rating: number;
      feedback: string;
    }>;
    bookingHistory: Array<{
      serviceId: string;
      providerId: string;
      date: Date;
      satisfaction: number;
      cost: number;
    }>;
  };
  propertyDetails: {
    type: string; // house, apartment, office
    size: number; // square meters
    age: number; // years
    specialFeatures: string[]; // pool, garden, security, etc.
  };
}

export interface ServiceProvider {
  providerId: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    serviceRadius: number; // km
  };
  services: Array<{
    serviceId: string;
    name: string;
    category: string;
    basePrice: number;
    rating: number;
    reviewCount: number;
    specialties: string[];
    availability: {
      weekdays: boolean;
      weekends: boolean;
      emergency: boolean;
    };
  }>;
  overallRating: number;
  reviewCount: number;
  responseTime: number; // minutes
  completionRate: number; // percentage
  certifications: string[];
  insurance: boolean;
  ecoFriendly: boolean;
  languages: string[];
}

export interface RecommendationRequest {
  userId: string;
  serviceType?: string;
  urgency?: 'low' | 'medium' | 'high' | 'emergency';
  budget?: number;
  preferredDate?: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
  propertyType?: string;
  specialRequirements?: string[];
}

export interface ServiceRecommendation {
  serviceId: string;
  name: string;
  category: string;
  description: string;
  estimatedPrice: {
    min: number;
    max: number;
  };
  estimatedDuration: number; // hours
  confidence: number; // 0-1
  reasoning: string[];
  alternatives: Array<{
    serviceId: string;
    name: string;
    reason: string;
  }>;
}

export interface ProviderRecommendation {
  providerId: string;
  name: string;
  distance: number; // km
  rating: number;
  reviewCount: number;
  estimatedPrice: number;
  estimatedArrival: number; // minutes
  matchScore: number; // 0-1
  strengths: string[];
  specialties: string[];
  availability: {
    soonest: Date;
    options: Date[];
  };
  certifications: string[];
}

export interface RecommendationResult {
  primaryService: ServiceRecommendation;
  recommendedProviders: ProviderRecommendation[];
  alternatives: ServiceRecommendation[];
  estimatedSavings: number;
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
  confidence: number;
  personalizedInsights: string[];
}

class RecommendationEngine {
  private userProfiles: Map<string, UserProfile> = new Map();
  private serviceProviders: ServiceProvider[] = [];
  private serviceHistory: Map<string, any[]> = new Map(); // serviceId -> usage history

  // Initialize with mock data - in real app, load from database
  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock service providers
    this.serviceProviders = [
      {
        providerId: 'prov_001',
        name: 'GreenThumb Gardens',
        location: {
          latitude: -26.2041,
          longitude: 28.0473,
          address: '123 Main St, Johannesburg',
          serviceRadius: 25
        },
        services: [
          {
            serviceId: 'garden_maintenance',
            name: 'Garden Maintenance',
            category: 'landscaping',
            basePrice: 850,
            rating: 4.8,
            reviewCount: 156,
            specialties: ['lawn_care', 'tree_trimming', 'watering_systems'],
            availability: { weekdays: true, weekends: true, emergency: false }
          },
          {
            serviceId: 'landscaping_design',
            name: 'Landscape Design',
            category: 'landscaping',
            basePrice: 2200,
            rating: 4.9,
            reviewCount: 89,
            specialties: ['design', 'installation', 'eco_friendly'],
            availability: { weekdays: true, weekends: false, emergency: false }
          }
        ],
        overallRating: 4.8,
        reviewCount: 245,
        responseTime: 15,
        completionRate: 98,
        certifications: ['Landscape Institute Certified', 'Eco-Friendly Practices'],
        insurance: true,
        ecoFriendly: true,
        languages: ['English', 'Afrikaans']
      },
      {
        providerId: 'prov_002',
        name: 'AquaClean Pools',
        location: {
          latitude: -26.1952,
          longitude: 28.0341,
          address: '456 Pool Ave, Pretoria',
          serviceRadius: 30
        },
        services: [
          {
            serviceId: 'pool_cleaning',
            name: 'Pool Cleaning & Maintenance',
            category: 'pool_services',
            basePrice: 650,
            rating: 4.7,
            reviewCount: 203,
            specialties: ['cleaning', 'chemical_balance', 'repairs'],
            availability: { weekdays: true, weekends: true, emergency: true }
          }
        ],
        overallRating: 4.7,
        reviewCount: 203,
        responseTime: 20,
        completionRate: 96,
        certifications: ['Pool Maintenance Certified'],
        insurance: true,
        ecoFriendly: false,
        languages: ['English']
      },
      {
        providerId: 'prov_003',
        name: 'SparkElectric',
        location: {
          latitude: -26.1852,
          longitude: 28.0241,
          address: '789 Power Rd, Sandton',
          serviceRadius: 20
        },
        services: [
          {
            serviceId: 'electrical_inspection',
            name: 'Electrical Inspection & Safety',
            category: 'electrical',
            basePrice: 1200,
            rating: 4.9,
            reviewCount: 134,
            specialties: ['inspections', 'repairs', 'installations', 'safety'],
            availability: { weekdays: true, weekends: false, emergency: true }
          }
        ],
        overallRating: 4.9,
        reviewCount: 134,
        responseTime: 10,
        completionRate: 99,
        certifications: ['Electrical Safety Certified', 'Licensed Electrician'],
        insurance: true,
        ecoFriendly: false,
        languages: ['English', 'Zulu']
      }
    ];
  }

  // Main recommendation function
  async getRecommendations(request: RecommendationRequest): Promise<RecommendationResult> {
    const userProfile = this.getOrCreateUserProfile(request.userId);

    // Determine best service based on request and user profile
    const serviceRecommendation = await this.recommendService(request, userProfile);

    // Find best providers for the recommended service
    const providerRecommendations = await this.recommendProviders(
      serviceRecommendation.serviceId,
      request,
      userProfile
    );

    // Generate alternatives
    const alternatives = await this.generateAlternatives(serviceRecommendation, request, userProfile);

    // Calculate potential savings
    const estimatedSavings = this.calculateSavings(providerRecommendations);

    // Assess overall urgency
    const urgencyLevel = this.assessUrgency(request, serviceRecommendation);

    // Calculate confidence
    const confidence = this.calculateConfidence(serviceRecommendation, providerRecommendations);

    // Generate personalized insights
    const personalizedInsights = this.generateInsights(userProfile, serviceRecommendation, providerRecommendations);

    return {
      primaryService: serviceRecommendation,
      recommendedProviders: providerRecommendations,
      alternatives,
      estimatedSavings,
      urgencyLevel,
      confidence,
      personalizedInsights
    };
  }

  private getOrCreateUserProfile(userId: string): UserProfile {
    if (!this.userProfiles.has(userId)) {
      // Create default profile - in real app, load from database
      this.userProfiles.set(userId, {
        userId,
        location: {
          latitude: -26.2041,
          longitude: 28.0473,
          address: 'Default Location, Johannesburg',
          suburb: 'CBD',
          city: 'Johannesburg'
        },
        preferences: {
          budgetRange: [500, 5000],
          preferredTimes: ['weekdays', 'mornings'],
          servicePriorities: ['quality', 'reliability'],
          pastRatings: [],
          bookingHistory: []
        },
        propertyDetails: {
          type: 'house',
          size: 200,
          age: 10,
          specialFeatures: ['garden', 'pool']
        }
      });
    }

    return this.userProfiles.get(userId)!;
  }

  private async recommendService(
    request: RecommendationRequest,
    userProfile: UserProfile
  ): Promise<ServiceRecommendation> {
    let serviceType = request.serviceType;

    // If no specific service requested, infer from context
    if (!serviceType) {
      serviceType = this.inferServiceFromContext(request, userProfile);
    }

    // Find all services of this type
    const availableServices = this.serviceProviders.flatMap(provider =>
      provider.services.filter(service => service.category === serviceType)
    );

    if (availableServices.length === 0) {
      // Fallback to general maintenance
      serviceType = 'maintenance';
    }

    // Score services based on user preferences and history
    const scoredServices = availableServices.map(service => ({
      service,
      score: this.scoreService(service, request, userProfile)
    }));

    scoredServices.sort((a, b) => b.score - a.score);
    const bestService = scoredServices[0].service;

    // Generate recommendation
    const recommendation: ServiceRecommendation = {
      serviceId: bestService.serviceId,
      name: bestService.name,
      category: bestService.category,
      description: this.generateServiceDescription(bestService),
      estimatedPrice: {
        min: Math.round(bestService.basePrice * 0.8),
        max: Math.round(bestService.basePrice * 1.5)
      },
      estimatedDuration: this.estimateServiceDuration(bestService),
      confidence: 0.85,
      reasoning: this.generateServiceReasoning(bestService, request, userProfile),
      alternatives: scoredServices.slice(1, 4).map(s => ({
        serviceId: s.service.serviceId,
        name: s.service.name,
        reason: `Alternative option with ${s.score.toFixed(1)} compatibility score`
      }))
    };

    return recommendation;
  }

  private async recommendProviders(
    serviceId: string,
    request: RecommendationRequest,
    userProfile: UserProfile
  ): Promise<ProviderRecommendation[]> {
    // Find providers that offer this service
    const providers = this.serviceProviders.filter(provider =>
      provider.services.some(service => service.serviceId === serviceId)
    );

    // Score providers based on various factors
    const scoredProviders = providers.map(provider => {
      const service = provider.services.find(s => s.serviceId === serviceId)!;
      const score = this.scoreProvider(provider, service, request, userProfile);

      return {
        provider,
        service,
        score
      };
    });

    scoredProviders.sort((a, b) => b.score - a.score);

    // Convert to recommendations
    return scoredProviders.slice(0, 3).map(({ provider, service, score }) => ({
      providerId: provider.providerId,
      name: provider.name,
      distance: this.calculateDistance(
        request.location || userProfile.location,
        provider.location
      ),
      rating: provider.overallRating,
      reviewCount: provider.reviewCount,
      estimatedPrice: service.basePrice,
      estimatedArrival: provider.responseTime,
      matchScore: score,
      strengths: this.getProviderStrengths(provider),
      specialties: service.specialties,
      availability: this.getProviderAvailability(provider, request.preferredDate),
      certifications: provider.certifications
    }));
  }

  private async generateAlternatives(
    primaryService: ServiceRecommendation,
    request: RecommendationRequest,
    userProfile: UserProfile
  ): Promise<ServiceRecommendation[]> {
    // Generate alternative services based on similar needs
    const alternatives: ServiceRecommendation[] = [];

    // Find related services
    const relatedServices = this.findRelatedServices(primaryService.category);

    for (const service of relatedServices.slice(0, 2)) {
      alternatives.push({
        serviceId: service.serviceId,
        name: service.name,
        category: service.category,
        description: `Alternative ${service.category} service`,
        estimatedPrice: {
          min: Math.round(service.basePrice * 0.8),
          max: Math.round(service.basePrice * 1.5)
        },
        estimatedDuration: this.estimateServiceDuration(service),
        confidence: 0.7,
        reasoning: [`Considered as an alternative to ${primaryService.name}`],
        alternatives: []
      });
    }

    return alternatives;
  }

  // Helper methods
  private inferServiceFromContext(request: RecommendationRequest, userProfile: UserProfile): string {
    // Infer service type from property features and request details
    if (userProfile.propertyDetails.specialFeatures.includes('pool')) {
      return 'pool_services';
    }
    if (userProfile.propertyDetails.specialFeatures.includes('garden')) {
      return 'landscaping';
    }
    if (request.urgency === 'emergency') {
      return 'emergency_services';
    }

    return 'maintenance';
  }

  private scoreService(service: any, request: RecommendationRequest, userProfile: UserProfile): number {
    let score = 0.5; // Base score

    // Budget compatibility
    const avgPrice = (service.basePrice * 1.25);
    if (avgPrice >= userProfile.preferences.budgetRange[0] &&
        avgPrice <= userProfile.preferences.budgetRange[1]) {
      score += 0.2;
    }

    // Rating bonus
    score += (service.rating - 3) * 0.1; // 0-0.2 bonus for ratings 3-5

    // Review count bonus
    if (service.reviewCount > 50) score += 0.1;
    if (service.reviewCount > 100) score += 0.1;

    // Specialty matching
    const userNeeds = userProfile.propertyDetails.specialFeatures;
    const matchingSpecialties = service.specialties.filter((s: string) =>
      userNeeds.some(need => s.toLowerCase().includes(need.toLowerCase()))
    );
    score += matchingSpecialties.length * 0.1;

    // Past satisfaction bonus
    const pastBookings = userProfile.preferences.bookingHistory.filter(
      booking => booking.serviceId === service.serviceId
    );
    if (pastBookings.length > 0) {
      const avgSatisfaction = pastBookings.reduce((sum, b) => sum + b.satisfaction, 0) / pastBookings.length;
      score += (avgSatisfaction - 3) * 0.1;
    }

    return Math.min(1, Math.max(0, score));
  }

  private scoreProvider(
    provider: ServiceProvider,
    service: any,
    request: RecommendationRequest,
    userProfile: UserProfile
  ): number {
    let score = 0.5; // Base score

    // Distance factor
    const distance = this.calculateDistance(
      request.location || userProfile.location,
      provider.location
    );
    if (distance <= provider.location.serviceRadius) {
      score += 0.2;
      if (distance <= 10) score += 0.1; // Bonus for very close providers
    } else {
      score -= 0.3; // Penalty for out-of-range providers
    }

    // Rating and reliability
    score += (provider.overallRating - 3) * 0.1;
    score += (provider.completionRate / 100 - 0.9) * 0.2; // Bonus for high completion rates

    // Response time
    if (provider.responseTime <= 30) score += 0.1;
    if (provider.responseTime <= 15) score += 0.1;

    // Certification bonus
    if (provider.certifications.length > 0) score += 0.1;

    // Eco-friendly bonus
    if (userProfile.preferences.servicePriorities.includes('eco_friendly') && provider.ecoFriendly) {
      score += 0.1;
    }

    // Past experience bonus
    const pastExperience = userProfile.preferences.pastRatings.find(
      rating => rating.providerId === provider.providerId
    );
    if (pastExperience) {
      score += (pastExperience.rating - 3) * 0.1;
    }

    return Math.min(1, Math.max(0, score));
  }

  private calculateDistance(from: any, to: any): number {
    // Simplified distance calculation - in real app, use proper geocoding
    const R = 6371; // Earth's radius in km
    const dLat = (to.latitude - from.latitude) * Math.PI / 180;
    const dLon = (to.longitude - from.longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(from.latitude * Math.PI / 180) * Math.cos(to.latitude * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private generateServiceDescription(service: any): string {
    const specialties = service.specialties.slice(0, 2).join(' and ');
    return `${service.name} service specializing in ${specialties}. Rated ${service.rating}/5 by ${service.reviewCount} customers.`;
  }

  private estimateServiceDuration(service: any): number {
    // Estimate based on service type
    const durationMap: Record<string, number> = {
      'pool_cleaning': 2,
      'garden_maintenance': 3,
      'electrical_inspection': 1,
      'landscaping_design': 4,
      'maintenance': 2
    };

    return durationMap[service.category] || 2;
  }

  private generateServiceReasoning(service: any, request: RecommendationRequest, userProfile: UserProfile): string[] {
    const reasoning: string[] = [];

    reasoning.push(`High-rated service with ${service.rating}/5 stars from ${service.reviewCount} reviews`);

    if (service.basePrice <= userProfile.preferences.budgetRange[1]) {
      reasoning.push(`Fits within your budget range (estimated R${service.basePrice})`);
    }

    const matchingFeatures = service.specialties.filter((s: string) =>
      userProfile.propertyDetails.specialFeatures.some((f: string) =>
        s.toLowerCase().includes(f.toLowerCase())
      )
    );

    if (matchingFeatures.length > 0) {
      reasoning.push(`Specializes in ${matchingFeatures.join(', ')} which matches your property features`);
    }

    return reasoning;
  }

  private getProviderStrengths(provider: ServiceProvider): string[] {
    const strengths: string[] = [];

    if (provider.overallRating >= 4.5) strengths.push('Top-rated provider');
    if (provider.responseTime <= 15) strengths.push('Fast response time');
    if (provider.completionRate >= 95) strengths.push('High completion rate');
    if (provider.certifications.length > 0) strengths.push('Certified professionals');
    if (provider.ecoFriendly) strengths.push('Eco-friendly practices');
    if (provider.insurance) strengths.push('Fully insured');

    return strengths;
  }

  private getProviderAvailability(provider: ServiceProvider, preferredDate?: Date): { soonest: Date; options: Date[] } {
    // Simplified availability calculation
    const now = new Date();
    const soonest = new Date(now.getTime() + provider.responseTime * 60 * 1000);

    // Generate some availability options
    const options: Date[] = [];
    for (let i = 0; i < 3; i++) {
      const option = new Date(soonest.getTime() + i * 24 * 60 * 60 * 1000);
      options.push(option);
    }

    return { soonest, options };
  }

  private findRelatedServices(category: string): any[] {
    // Find services in related categories
    const categoryMap: Record<string, string[]> = {
      'landscaping': ['pool_services', 'maintenance'],
      'pool_services': ['landscaping', 'maintenance'],
      'electrical': ['maintenance', 'emergency_services'],
      'maintenance': ['landscaping', 'pool_services', 'electrical']
    };

    const relatedCategories = categoryMap[category] || [];
    return this.serviceProviders.flatMap(provider =>
      provider.services.filter(service => relatedCategories.includes(service.category))
    );
  }

  private calculateSavings(providers: ProviderRecommendation[]): number {
    if (providers.length < 2) return 0;

    const prices = providers.map(p => p.estimatedPrice).sort((a, b) => a - b);
    return prices[prices.length - 1] - prices[0];
  }

  private assessUrgency(request: RecommendationRequest, service: ServiceRecommendation): 'low' | 'medium' | 'high' | 'emergency' {
    if (request.urgency) return request.urgency;

    // Assess based on service type and context
    if (service.category === 'electrical' || service.name.toLowerCase().includes('emergency')) {
      return 'high';
    }

    return 'medium';
  }

  private calculateConfidence(service: ServiceRecommendation, providers: ProviderRecommendation[]): number {
    const serviceConfidence = service.confidence;
    const avgProviderMatch = providers.reduce((sum, p) => sum + p.matchScore, 0) / providers.length;

    return (serviceConfidence + avgProviderMatch) / 2;
  }

  private generateInsights(
    userProfile: UserProfile,
    service: ServiceRecommendation,
    providers: ProviderRecommendation[]
  ): string[] {
    const insights: string[] = [];

    // Budget insights
    const avgPrice = (service.estimatedPrice.min + service.estimatedPrice.max) / 2;
    if (avgPrice < userProfile.preferences.budgetRange[0]) {
      insights.push(`This service is below your typical budget range - great value!`);
    } else if (avgPrice > userProfile.preferences.budgetRange[1]) {
      insights.push(`This service is above your typical budget range. Consider the premium quality.`);
    }

    // Location insights
    const avgDistance = providers.reduce((sum, p) => sum + p.distance, 0) / providers.length;
    if (avgDistance < 5) {
      insights.push(`All recommended providers are within 5km of your location.`);
    }

    // Time preferences
    const bestProvider = providers[0];
    const preferredTimes = userProfile.preferences.preferredTimes;
    if (preferredTimes.includes('mornings') && bestProvider.availability.soonest.getHours() < 12) {
      insights.push(`The top provider can accommodate your preference for morning appointments.`);
    }

    // Past experience insights
    const pastProviders = userProfile.preferences.pastRatings;
    const familiarProviders = providers.filter(p =>
      pastProviders.some(r => r.providerId === p.providerId)
    );

    if (familiarProviders.length > 0) {
      const avgPastRating = pastProviders
        .filter(r => familiarProviders.some(fp => fp.providerId === r.providerId))
        .reduce((sum, r) => sum + r.rating, 0) / familiarProviders.length;

      if (avgPastRating >= 4) {
        insights.push(`You've had excellent experiences with ${familiarProviders.length} of these providers before.`);
      }
    }

    return insights;
  }
}

export const recommendationEngine = new RecommendationEngine();