// Dynamic Pricing Engine for Advanced E-commerce

import { Product, ProductPromotion, PricingRule, PricingCondition } from './product-catalog';

export interface PricingContext {
  customerId?: string;
  customerSegment?: string;
  loyaltyTier?: string;
  location?: {
    country: string;
    region?: string;
    currency: string;
  };
  quantity: number;
  cartTotal?: number;
  productId: string;
  variantId?: string;
  currentPrice: number;
  basePrice: number;
  timestamp: Date;
}

export interface PricingResult {
  finalPrice: number;
  appliedRules: AppliedPricingRule[];
  breakdown: PricingBreakdown;
  currency: string;
  validUntil?: Date;
}

export interface AppliedPricingRule {
  ruleId: string;
  ruleName: string;
  adjustment: number;
  adjustmentType: 'percentage' | 'fixed' | 'fixed_price';
  priority: number;
  reason: string;
}

export interface PricingBreakdown {
  basePrice: number;
  subtotal: number;
  discounts: number;
  taxes: number;
  shipping: number;
  total: number;
}

class DynamicPricingEngine {
  private rules: PricingRule[] = [];
  private promotions: ProductPromotion[] = [];

  constructor() {
    this.initializeDefaultRules();
  }

  private initializeDefaultRules() {
    // Default pricing rules
    this.rules = [
      {
        id: 'loyalty_discount',
        name: 'Loyalty Tier Discount',
        type: 'customer_segment',
        conditions: [
          { field: 'loyaltyTier', operator: 'equals', value: 'gold' }
        ],
        adjustments: [
          { type: 'percentage', value: -10, appliesTo: 'base_price' }
        ],
        priority: 10,
        enabled: true
      },
      {
        id: 'bulk_discount',
        name: 'Bulk Purchase Discount',
        type: 'quantity',
        conditions: [
          { field: 'quantity', operator: 'greater_than', value: 10 }
        ],
        adjustments: [
          { type: 'percentage', value: -15, appliesTo: 'base_price' }
        ],
        priority: 20,
        enabled: true
      },
      {
        id: 'weekend_special',
        name: 'Weekend Special',
        type: 'time_based',
        conditions: [
          { field: 'dayOfWeek', operator: 'contains', value: ['saturday', 'sunday'] }
        ],
        adjustments: [
          { type: 'percentage', value: -5, appliesTo: 'base_price' }
        ],
        priority: 5,
        enabled: true
      }
    ];
  }

  addRule(rule: PricingRule) {
    this.rules.push(rule);
    this.rules.sort((a, b) => b.priority - a.priority); // Higher priority first
  }

  updateRule(ruleId: string, updates: Partial<PricingRule>) {
    const index = this.rules.findIndex(r => r.id === ruleId);
    if (index !== -1) {
      this.rules[index] = { ...this.rules[index], ...updates };
      this.rules.sort((a, b) => b.priority - a.priority);
    }
  }

  removeRule(ruleId: string) {
    this.rules = this.rules.filter(r => r.id !== ruleId);
  }

  addPromotion(promotion: ProductPromotion) {
    this.promotions.push(promotion);
  }

  updatePromotion(promotionId: string, updates: Partial<ProductPromotion>) {
    const index = this.promotions.findIndex(p => p.id === promotionId);
    if (index !== -1) {
      this.promotions[index] = { ...this.promotions[index], ...updates };
    }
  }

  removePromotion(promotionId: string) {
    this.promotions = this.promotions.filter(p => p.id !== promotionId);
  }

  calculatePrice(product: Product, variantId: string | undefined, context: PricingContext): PricingResult {
    const variant = variantId ? product.variants.find(v => v.id === variantId) : product.variants[0];
    if (!variant) {
      throw new Error('Variant not found');
    }

    let price = variant.price;
    const appliedRules: AppliedPricingRule[] = [];
    const breakdown: PricingBreakdown = {
      basePrice: price,
      subtotal: price,
      discounts: 0,
      taxes: 0,
      shipping: 0,
      total: price
    };

    // Apply pricing rules
    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      if (this.evaluateRule(rule, context)) {
        const adjustment = this.calculateAdjustment(rule, price, context);

        if (adjustment !== 0) {
          appliedRules.push({
            ruleId: rule.id,
            ruleName: rule.name,
            adjustment,
            adjustmentType: rule.adjustments[0].type,
            priority: rule.priority,
            reason: this.getRuleReason(rule)
          });

          if (rule.adjustments[0].type === 'percentage') {
            price += (price * adjustment) / 100;
          } else if (rule.adjustments[0].type === 'fixed') {
            price += adjustment;
          } else if (rule.adjustments[0].type === 'fixed_price') {
            price = adjustment;
          }

          breakdown.discounts += adjustment > 0 ? 0 : -adjustment; // Convert negative to positive for display
        }
      }
    }

    // Apply product-specific promotions
    for (const promotion of product.promotions || []) {
      if (!promotion.enabled) continue;
      if (this.isPromotionValid(promotion, context)) {
        const promoAdjustment = this.calculatePromotionAdjustment(promotion, price, context);

        appliedRules.push({
          ruleId: promotion.id,
          ruleName: promotion.name,
          adjustment: promoAdjustment,
          adjustmentType: promotion.type === 'percentage' ? 'percentage' : 'fixed',
          priority: 100, // Promotions have highest priority
          reason: `Promotion: ${promotion.name}`
        });

        if (promotion.type === 'percentage') {
          price += (price * promoAdjustment) / 100;
        } else {
          price += promoAdjustment;
        }

        breakdown.discounts += promoAdjustment > 0 ? 0 : -promoAdjustment;
      }
    }

    // Calculate taxes (basic implementation - can be extended)
    const taxRate = this.getTaxRate(context.location);
    const taxAmount = price * taxRate;
    breakdown.taxes = taxAmount;
    breakdown.total = price + taxAmount;

    return {
      finalPrice: price,
      appliedRules,
      breakdown,
      currency: context.location?.currency || 'ZAR',
      validUntil: this.getPriceValidity(context)
    };
  }

  private evaluateRule(rule: PricingRule, context: PricingContext): boolean {
    for (const condition of rule.conditions) {
      const value = this.getContextValue(condition.field, context);
      if (!this.evaluateCondition(condition, value)) {
        return false;
      }
    }
    return true;
  }

  private getContextValue(field: string, context: PricingContext): any {
    switch (field) {
      case 'loyaltyTier': return context.loyaltyTier;
      case 'customerSegment': return context.customerSegment;
      case 'quantity': return context.quantity;
      case 'cartTotal': return context.cartTotal;
      case 'country': return context.location?.country;
      case 'dayOfWeek': return new Date(context.timestamp).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      default: return context[field as keyof PricingContext];
    }
  }

  private evaluateCondition(condition: PricingCondition, value: any): boolean {
    switch (condition.operator) {
      case 'equals': return value === condition.value;
      case 'not_equals': return value !== condition.value;
      case 'greater_than': return value > condition.value;
      case 'less_than': return value < condition.value;
      case 'contains': return Array.isArray(condition.value) ? condition.value.includes(value) : String(value).includes(condition.value);
      case 'not_contains': return !String(value).includes(condition.value);
      default: return false;
    }
  }

  private calculateAdjustment(rule: PricingRule, currentPrice: number, context: PricingContext): number {
    const adjustment = rule.adjustments[0];
    return adjustment.value;
  }

  private getRuleReason(rule: PricingRule): string {
    return `${rule.type} pricing rule: ${rule.name}`;
  }

  private isPromotionValid(promotion: ProductPromotion, context: PricingContext): boolean {
    if (!promotion.enabled) return false;
    if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) return false;

    const now = new Date();
    if (promotion.startsAt > now) return false;
    if (promotion.endsAt && promotion.endsAt < now) return false;

    // Check conditions
    for (const condition of promotion.conditions) {
      switch (condition.type) {
        case 'min_quantity':
          if (context.quantity < condition.value) return false;
          break;
        case 'min_amount':
          if ((context.cartTotal || 0) < condition.value) return false;
          break;
      }
    }

    return true;
  }

  private calculatePromotionAdjustment(promotion: ProductPromotion, price: number, context: PricingContext): number {
    switch (promotion.type) {
      case 'percentage':
        return -(price * promotion.value / 100);
      case 'fixed':
        return -promotion.value;
      default:
        return 0;
    }
  }

  private getTaxRate(location?: PricingContext['location']): number {
    // Basic tax rate implementation - can be extended with tax service integration
    if (location?.country === 'ZA') {
      return 0.15; // 15% VAT for South Africa
    }
    return 0; // No tax for international (simplified)
  }

  private getPriceValidity(context: PricingContext): Date | undefined {
    // Prices are typically valid for 24 hours, but can be customized
    const validity = new Date(context.timestamp);
    validity.setHours(validity.getHours() + 24);
    return validity;
  }

  // Analytics and reporting
  getPricingAnalytics(startDate: Date, endDate: Date) {
    // Implementation for pricing analytics
    return {
      totalRules: this.rules.length,
      activeRules: this.rules.filter(r => r.enabled).length,
      totalPromotions: this.promotions.length,
      activePromotions: this.promotions.filter(p => p.enabled).length,
      averageDiscount: 0, // Calculate from applied rules
      topRules: [] // Most used rules
    };
  }
}

// Singleton instance
export const pricingEngine = new DynamicPricingEngine();