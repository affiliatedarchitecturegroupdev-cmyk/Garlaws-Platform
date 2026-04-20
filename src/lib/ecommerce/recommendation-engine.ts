// Advanced Recommendation Engine with Personalization

import { Product } from './product-catalog';

export interface UserProfile {
  id: string;
  preferences: {
    categories: string[];
    brands: string[];
    priceRange: {
      min: number;
      max: number;
    };
    attributes: Record<string, string[]>;
  };
  behavior: {
    viewedProducts: string[];
    purchasedProducts: string[];
    cartItems: string[];
    searchHistory: string[];
    categoryViews: Record<string, number>;
  };
  demographics: {
    age?: number;
    gender?: 'male' | 'female' | 'other';
    location?: string;
    language: string;
  };
  loyaltyTier?: string;
  createdAt: Date;
  lastActive: Date;
}

export interface ProductRecommendation {
  productId: string;
  score: number;
  reasons: RecommendationReason[];
  type: 'personalized' | 'similar' | 'trending' | 'complementary' | 'seasonal';
  confidence: number; // 0-1
}

export interface RecommendationReason {
  type: 'viewed_similar' | 'purchased_category' | 'price_range' | 'brand_preference' | 'seasonal_trend' | 'complementary';
  description: string;
  weight: number;
}

export interface RecommendationContext {
  userId?: string;
  currentProductId?: string;
  categoryId?: string;
  searchQuery?: string;
  cartItems?: string[];
  viewedProducts?: string[];
  sessionId: string;
  location?: string;
  deviceType?: 'mobile' | 'desktop' | 'tablet';
  timeOfDay?: number; // 0-23
  season?: 'spring' | 'summer' | 'autumn' | 'winter';
}

export interface RecommendationEngineConfig {
  maxRecommendations: number;
  minConfidence: number;
  algorithms: {
    collaborative: boolean;
    contentBased: boolean;
    popularity: boolean;
    seasonal: boolean;
  };
  weights: {
    userHistory: number;
    categoryAffinity: number;
    priceCompatibility: number;
    brandPreference: number;
    seasonalRelevance: number;
    popularity: number;
  };
}

class RecommendationEngine {
  private config: RecommendationEngineConfig;
  private userProfiles: Map<string, UserProfile> = new Map();

  constructor(config: Partial<RecommendationEngineConfig> = {}) {
    this.config = {
      maxRecommendations: 10,
      minConfidence: 0.3,
      algorithms: {
        collaborative: true,
        contentBased: true,
        popularity: true,
        seasonal: true
      },
      weights: {
        userHistory: 0.4,
        categoryAffinity: 0.25,
        priceCompatibility: 0.15,
        brandPreference: 0.1,
        seasonalRelevance: 0.05,
        popularity: 0.05
      },
      ...config
    };
  }

  // Main recommendation method
  async getRecommendations(
    context: RecommendationContext,
    availableProducts: Product[]
  ): Promise<ProductRecommendation[]> {
    const userProfile = context.userId ? this.userProfiles.get(context.userId) : null;

    // Calculate scores for all available products
    const scoredProducts = await Promise.all(
      availableProducts.map(async (product) => {
        const score = await this.calculateRecommendationScore(product, context, userProfile);
        return { product, score };
      })
    );

    // Filter and sort by score
    const recommendations = scoredProducts
      .filter(({ score }) => score.confidence >= this.config.minConfidence)
      .sort((a, b) => b.score.score - a.score.score)
      .slice(0, this.config.maxRecommendations)
      .map(({ product, score }) => ({
        productId: product.id,
        score: score.score,
        reasons: score.reasons,
        type: score.type,
        confidence: score.confidence
      }));

    return recommendations;
  }

  private async calculateRecommendationScore(
    product: Product,
    context: RecommendationContext,
    userProfile?: UserProfile | null
  ): Promise<{
    score: number;
    confidence: number;
    reasons: RecommendationReason[];
    type: ProductRecommendation['type'];
  }> {
    let totalScore = 0;
    const reasons: RecommendationReason[] = [];
    let type: ProductRecommendation['type'] = 'personalized';

    // User history-based scoring
    if (userProfile && this.config.algorithms.contentBased) {
      const historyScore = this.calculateUserHistoryScore(product, userProfile, context);
      totalScore += historyScore.score * this.config.weights.userHistory;
      reasons.push(...historyScore.reasons);
    }

    // Category affinity scoring
    if (userProfile) {
      const categoryScore = this.calculateCategoryAffinityScore(product, userProfile);
      totalScore += categoryScore.score * this.config.weights.categoryAffinity;
      reasons.push(...categoryScore.reasons);
    }

    // Price compatibility scoring
    if (userProfile) {
      const priceScore = this.calculatePriceCompatibilityScore(product, userProfile);
      totalScore += priceScore.score * this.config.weights.priceCompatibility;
      reasons.push(...priceScore.reasons);
    }

    // Brand preference scoring
    if (userProfile) {
      const brandScore = this.calculateBrandPreferenceScore(product, userProfile);
      totalScore += brandScore.score * this.config.weights.brandPreference;
      reasons.push(...brandScore.reasons);
    }

    // Seasonal relevance scoring
    if (this.config.algorithms.seasonal) {
      const seasonalScore = this.calculateSeasonalRelevanceScore(product, context);
      totalScore += seasonalScore.score * this.config.weights.seasonalRelevance;
      reasons.push(...seasonalScore.reasons);
    }

    // Popularity scoring
    if (this.config.algorithms.popularity) {
      const popularityScore = this.calculatePopularityScore(product);
      totalScore += popularityScore.score * this.config.weights.popularity;
      reasons.push(...popularityScore.reasons);
    }

    // Collaborative filtering (simplified)
    if (this.config.algorithms.collaborative && context.userId) {
      const collaborativeScore = await this.calculateCollaborativeScore(product, context);
      totalScore += collaborativeScore.score * 0.2; // Additional weight
      reasons.push(...collaborativeScore.reasons);
    }

    // Determine recommendation type based on primary reason
    if (context.currentProductId) {
      type = 'similar';
    } else if (reasons.some(r => r.type === 'seasonal_trend')) {
      type = 'seasonal';
    } else if (context.cartItems && context.cartItems.length > 0) {
      type = 'complementary';
    }

    const confidence = Math.min(totalScore / 100, 1); // Normalize to 0-1

    return {
      score: totalScore,
      confidence,
      reasons,
      type
    };
  }

  private calculateUserHistoryScore(
    product: Product,
    userProfile: UserProfile,
    context: RecommendationContext
  ): { score: number; reasons: RecommendationReason[] } {
    let score = 0;
    const reasons: RecommendationReason[] = [];

    // Check if user viewed similar products
    const viewedSimilar = userProfile.behavior.viewedProducts.some(viewedId =>
      this.areProductsSimilar(product.id, viewedId)
    );
    if (viewedSimilar) {
      score += 30;
      reasons.push({
        type: 'viewed_similar',
        description: 'Based on products you\'ve viewed',
        weight: 0.8
      });
    }

    // Check purchase history
    const purchasedCategory = userProfile.behavior.purchasedProducts.some(purchasedId =>
      this.shareCategory(product.id, purchasedId)
    );
    if (purchasedCategory) {
      score += 40;
      reasons.push({
        type: 'purchased_category',
        description: 'Similar to products you\'ve purchased',
        weight: 0.9
      });
    }

    // Recency weighting (more recent interactions = higher score)
    const recentViews = userProfile.behavior.viewedProducts.slice(-10); // Last 10 views
    if (recentViews.includes(product.id)) {
      score += 20;
    }

    return { score, reasons };
  }

  private calculateCategoryAffinityScore(
    product: Product,
    userProfile: UserProfile
  ): { score: number; reasons: RecommendationReason[] } {
    let score = 0;
    const reasons: RecommendationReason[] = [];

    const userCategories = userProfile.preferences.categories;
    const productCategories = product.categories;

    const matchingCategories = userCategories.filter(cat => productCategories.includes(cat));

    if (matchingCategories.length > 0) {
      score += matchingCategories.length * 25;
      reasons.push({
        type: 'purchased_category',
        description: `Matches your interest in ${matchingCategories.join(', ')}`,
        weight: 0.7
      });
    }

    return { score, reasons };
  }

  private calculatePriceCompatibilityScore(
    product: Product,
    userProfile: UserProfile
  ): { score: number; reasons: RecommendationReason[] } {
    let score = 0;
    const reasons: RecommendationReason[] = [];

    const userPriceRange = userProfile.preferences.priceRange;
    const productPrice = product.pricing.basePrice;

    if (productPrice >= userPriceRange.min && productPrice <= userPriceRange.max) {
      score += 30;
      reasons.push({
        type: 'price_range',
        description: 'Within your preferred price range',
        weight: 0.6
      });
    } else if (productPrice > userPriceRange.max) {
      score += 10; // Still show premium options occasionally
    }

    return { score, reasons };
  }

  private calculateBrandPreferenceScore(
    product: Product,
    userProfile: UserProfile
  ): { score: number; reasons: RecommendationReason[] } {
    let score = 0;
    const reasons: RecommendationReason[] = [];

    if (userProfile.preferences.brands.includes(product.vendor)) {
      score += 25;
      reasons.push({
        type: 'brand_preference',
        description: `From ${product.vendor}, a brand you prefer`,
        weight: 0.5
      });
    }

    return { score, reasons };
  }

  private calculateSeasonalRelevanceScore(
    product: Product,
    context: RecommendationContext
  ): { score: number; reasons: RecommendationReason[] } {
    let score = 0;
    const reasons: RecommendationReason[] = [];

    // Seasonal product detection based on tags and categories
    const seasonalTags = ['spring', 'summer', 'autumn', 'winter', 'seasonal'];
    const hasSeasonalTag = product.tags.some(tag =>
      seasonalTags.includes(tag.toLowerCase())
    );

    if (hasSeasonalTag && context.season) {
      const productSeason = product.tags.find(tag =>
        seasonalTags.includes(tag.toLowerCase())
      );

      if (productSeason === context.season) {
        score += 20;
        reasons.push({
          type: 'seasonal_trend',
          description: `Perfect for ${context.season}`,
          weight: 0.4
        });
      }
    }

    return { score, reasons };
  }

  private calculatePopularityScore(product: Product): { score: number; reasons: RecommendationReason[] } {
    let score = 0;
    const reasons: RecommendationReason[] = [];

    // Simple popularity based on rating and review count
    const ratingScore = (product.rating.average - 3) * 10; // Base score from rating
    const reviewScore = Math.min(product.rating.count / 10, 20); // Up to 20 points for reviews

    score += ratingScore + reviewScore;

    if (product.rating.average >= 4.5) {
      reasons.push({
        type: 'seasonal_trend', // Reusing type for popularity
        description: 'Highly rated by customers',
        weight: 0.3
      });
    }

    return { score, reasons };
  }

  private async calculateCollaborativeScore(
    product: Product,
    context: RecommendationContext
  ): Promise<{ score: number; reasons: RecommendationReason[] }> {
    // Simplified collaborative filtering
    // In a real implementation, this would use matrix factorization or k-NN
    let score = 0;
    const reasons: RecommendationReason[] = [];

    // Simulate collaborative filtering based on similar users
    if (context.userId) {
      // This would query a database for similar user preferences
      score += 15;
      reasons.push({
        type: 'viewed_similar',
        description: 'Popular among users with similar tastes',
        weight: 0.6
      });
    }

    return { score, reasons };
  }

  // Helper methods
  private areProductsSimilar(productId1: string, productId2: string): boolean {
    // Simplified similarity check - would use actual product data
    return productId1 !== productId2;
  }

  private shareCategory(productId1: string, productId2: string): boolean {
    // Simplified category sharing check
    return true; // Would check actual category data
  }

  // User profile management
  updateUserProfile(userId: string, profile: Partial<UserProfile>): void {
    const existing = this.userProfiles.get(userId);
    if (existing) {
      this.userProfiles.set(userId, { ...existing, ...profile });
    } else {
      this.userProfiles.set(userId, profile as UserProfile);
    }
  }

  getUserProfile(userId: string): UserProfile | undefined {
    return this.userProfiles.get(userId);
  }

  // Analytics and reporting
  getRecommendationAnalytics(startDate: Date, endDate: Date) {
    return {
      totalRecommendations: 0,
      averageConfidence: 0,
      topReasons: [],
      conversionRate: 0
    };
  }
}

// Singleton instance
export const recommendationEngine = new RecommendationEngine();

// React hook for recommendations
export function useRecommendations() {
  const getRecommendations = async (
    context: RecommendationContext,
    products: Product[]
  ): Promise<ProductRecommendation[]> => {
    return recommendationEngine.getRecommendations(context, products);
  };

  const updateUserProfile = (userId: string, profile: Partial<UserProfile>) => {
    recommendationEngine.updateUserProfile(userId, profile);
  };

  return {
    getRecommendations,
    updateUserProfile,
    getUserProfile: (userId: string) => recommendationEngine.getUserProfile(userId)
  };
}