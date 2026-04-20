// Advanced Checkout System with Fraud Detection

export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  vendorId: string;
  title: string;
  variantTitle?: string;
  sku: string;
  quantity: number;
  price: number;
  total: number;
  image?: string;
  requiresShipping: boolean;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
}

export interface Cart {
  id: string;
  customerId?: string;
  sessionId: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;

  // Applied discounts and promotions
  appliedCoupons: AppliedCoupon[];
  appliedPromotions: AppliedPromotion[];

  // Shipping information
  shippingAddress?: Address;
  shippingMethod?: ShippingMethod;
  estimatedDelivery?: Date;

  // Customer information
  customerEmail?: string;
  customerInfo?: CustomerInfo;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

export interface AppliedCoupon {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  description: string;
}

export interface AppliedPromotion {
  id: string;
  name: string;
  discount: number;
  type: 'percentage' | 'fixed';
  description: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: number;
  carrier: string;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  marketingConsent: boolean;
}

export interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  street: string;
  apartment?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'mobile_money' | 'crypto';
  provider: 'stripe' | 'paypal' | 'payfast' | 'ozow' | 'bank' | 'crypto';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  billingAddress: Address;
}

export interface CheckoutSession {
  id: string;
  cartId: string;
  customerId?: string;
  sessionId: string;

  // Checkout steps
  steps: {
    contact: boolean;
    shipping: boolean;
    payment: boolean;
    review: boolean;
  };

  // Collected information
  contactInfo?: CustomerInfo;
  shippingAddress?: Address;
  billingAddress?: Address;
  shippingMethod?: ShippingMethod;
  paymentMethod?: PaymentMethod;

  // Order summary
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;

  // Status and tracking
  status: 'incomplete' | 'pending_payment' | 'processing' | 'completed' | 'cancelled' | 'failed';
  fraudScore?: number;
  riskAssessment?: RiskAssessment;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  completedAt?: Date;
}

export interface RiskAssessment {
  score: number; // 0-100, higher = higher risk
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: RiskFactor[];
  recommendations: string[];
  requiresReview: boolean;
}

export interface RiskFactor {
  type: 'velocity' | 'geolocation' | 'amount' | 'device' | 'behavior' | 'payment' | 'high_amount' | 'international_shipping';
  severity: 'low' | 'medium' | 'high';
  description: string;
  score: number;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  orderId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  error?: string;
  fraudCheck?: FraudCheckResult;
  metadata?: Record<string, any>;
}

export interface FraudCheckResult {
  passed: boolean;
  score: number;
  checkedBy: string[];
  flags: FraudFlag[];
  recommendedAction: 'approve' | 'review' | 'decline';
}

export interface FraudFlag {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  triggeredBy: string;
}

// Fraud Detection Engine
export class FraudDetectionEngine {
  private rules: FraudRule[] = [];

  constructor() {
    this.initializeDefaultRules();
  }

  private initializeDefaultRules() {
    this.rules = [
      {
        id: 'high_amount',
        name: 'High Order Amount',
        condition: (session: CheckoutSession) => session.total > 50000, // R500
        severity: 'medium',
        score: 30,
        description: 'Order amount exceeds threshold'
      },
      {
        id: 'new_customer_high_value',
        name: 'New Customer High Value',
        condition: (session: CheckoutSession) => !session.customerId && session.total > 10000,
        severity: 'high',
        score: 50,
        description: 'New customer placing high-value order'
      },
      {
        id: 'international_shipping',
        name: 'International Shipping',
        condition: (session: CheckoutSession) => session.shippingAddress?.country !== 'ZA',
        severity: 'low',
        score: 10,
        description: 'Shipping to international address'
      },
      {
        id: 'multiple_payment_attempts',
        name: 'Multiple Payment Attempts',
        condition: (session: CheckoutSession) => false, // Would check payment attempt history
        severity: 'high',
        score: 40,
        description: 'Multiple failed payment attempts detected'
      }
    ];
  }

  assessRisk(session: CheckoutSession): RiskAssessment {
    let totalScore = 0;
    const factors: RiskFactor[] = [];

    for (const rule of this.rules) {
      if (rule.condition(session)) {
        totalScore += rule.score;
        factors.push({
          type: rule.id as RiskFactor['type'],
          severity: rule.severity,
          description: rule.description,
          score: rule.score
        });
      }
    }

    // Additional behavioral analysis would go here
    const behavioralScore = this.analyzeBehavioralRisk(session);
    totalScore += behavioralScore;

    const level = this.calculateRiskLevel(totalScore);
    const recommendations = this.generateRecommendations(level, factors);

    return {
      score: Math.min(totalScore, 100),
      level,
      factors,
      recommendations,
      requiresReview: level === 'high' || level === 'critical'
    };
  }

  private analyzeBehavioralRisk(session: CheckoutSession): number {
    let score = 0;

    // Analyze session behavior
    // This would include checking for:
    // - Time spent on checkout
    // - Number of field edits
    // - Browser fingerprinting
    // - IP address analysis
    // - Device fingerprinting

    return score;
  }

  private calculateRiskLevel(score: number): RiskAssessment['level'] {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }

  private generateRecommendations(level: RiskAssessment['level'], factors: RiskFactor[]): string[] {
    const recommendations: string[] = [];

    switch (level) {
      case 'critical':
        recommendations.push('Require manual review before processing');
        recommendations.push('Request additional verification documents');
        break;
      case 'high':
        recommendations.push('Require additional authentication (2FA)');
        recommendations.push('Limit payment methods to verified options');
        break;
      case 'medium':
        recommendations.push('Send additional verification email');
        recommendations.push('Monitor order closely after completion');
        break;
      case 'low':
        recommendations.push('Process normally with standard monitoring');
        break;
    }

    // Factor-specific recommendations
    for (const factor of factors) {
      switch (factor.type) {
        case 'high_amount':
          recommendations.push('Verify payment method ownership');
          break;
        case 'international_shipping':
          recommendations.push('Check shipping address validity');
          break;
      }
    }

    return [...new Set(recommendations)]; // Remove duplicates
  }
}

export interface FraudRule {
  id: string;
  name: string;
  condition: (session: CheckoutSession) => boolean;
  severity: 'low' | 'medium' | 'high';
  score: number;
  description: string;
}

// Payment Processing Engine
export class PaymentProcessor {
  private fraudEngine = new FraudDetectionEngine();

  async processPayment(
    session: CheckoutSession,
    paymentMethod: PaymentMethod
  ): Promise<PaymentResult> {
    // Step 1: Fraud assessment
    const riskAssessment = this.fraudEngine.assessRisk(session);
    session.riskAssessment = riskAssessment;
    session.fraudScore = riskAssessment.score;

    // Step 2: Fraud check
    const fraudCheck = await this.performFraudCheck(session, paymentMethod);

    // Step 3: Process payment based on risk
    if (riskAssessment.level === 'critical' || !fraudCheck.passed) {
      return {
        success: false,
        amount: session.total,
        currency: session.currency || 'ZAR',
        status: 'failed',
        error: 'Payment declined due to risk assessment',
        fraudCheck
      };
    }

    // Step 4: Route to appropriate payment provider
    const result = await this.routeToPaymentProvider(session, paymentMethod, fraudCheck);

    return result;
  }

  private async performFraudCheck(session: CheckoutSession, paymentMethod: PaymentMethod): Promise<FraudCheckResult> {
    // Integration with fraud detection services would go here
    // For now, simulate a basic check

    const score = session.fraudScore || 0;
    const passed = score < 70; // Allow scores below 70

    return {
      passed,
      score,
      checkedBy: ['internal_engine'],
      flags: [],
      recommendedAction: passed ? 'approve' : 'decline'
    };
  }

  private async routeToPaymentProvider(
    session: CheckoutSession,
    paymentMethod: PaymentMethod,
    fraudCheck: FraudCheckResult
  ): Promise<PaymentResult> {
    // Route based on payment method type and provider
    switch (paymentMethod.provider) {
      case 'stripe':
        return this.processStripePayment(session, paymentMethod, fraudCheck);
      case 'paypal':
        return this.processPayPalPayment(session, paymentMethod, fraudCheck);
      case 'payfast':
        return this.processPayFastPayment(session, paymentMethod, fraudCheck);
      case 'ozow':
        return this.processOzowPayment(session, paymentMethod, fraudCheck);
      default:
        return this.processBankTransfer(session, paymentMethod, fraudCheck);
    }
  }

  private async processStripePayment(
    session: CheckoutSession,
    paymentMethod: PaymentMethod,
    fraudCheck: FraudCheckResult
  ): Promise<PaymentResult> {
    // Stripe integration would go here
    console.log('Processing Stripe payment:', session.id);

    return {
      success: true,
      transactionId: `stripe_${Date.now()}`,
      orderId: session.id,
      amount: session.total,
      currency: session.currency || 'ZAR',
      status: 'completed',
      fraudCheck
    };
  }

  private async processPayPalPayment(
    session: CheckoutSession,
    paymentMethod: PaymentMethod,
    fraudCheck: FraudCheckResult
  ): Promise<PaymentResult> {
    // PayPal integration would go here
    console.log('Processing PayPal payment:', session.id);

    return {
      success: true,
      transactionId: `paypal_${Date.now()}`,
      orderId: session.id,
      amount: session.total,
      currency: session.currency || 'ZAR',
      status: 'completed',
      fraudCheck
    };
  }

  private async processPayFastPayment(
    session: CheckoutSession,
    paymentMethod: PaymentMethod,
    fraudCheck: FraudCheckResult
  ): Promise<PaymentResult> {
    // PayFast integration would go here (South African payment processor)
    console.log('Processing PayFast payment:', session.id);

    return {
      success: true,
      transactionId: `payfast_${Date.now()}`,
      orderId: session.id,
      amount: session.total,
      currency: session.currency || 'ZAR',
      status: 'pending',
      fraudCheck
    };
  }

  private async processOzowPayment(
    session: CheckoutSession,
    paymentMethod: PaymentMethod,
    fraudCheck: FraudCheckResult
  ): Promise<PaymentResult> {
    // Ozow integration would go here (South African mobile money)
    console.log('Processing Ozow payment:', session.id);

    return {
      success: true,
      transactionId: `ozow_${Date.now()}`,
      orderId: session.id,
      amount: session.total,
      currency: session.currency || 'ZAR',
      status: 'pending',
      fraudCheck
    };
  }

  private async processBankTransfer(
    session: CheckoutSession,
    paymentMethod: PaymentMethod,
    fraudCheck: FraudCheckResult
  ): Promise<PaymentResult> {
    // Bank transfer processing
    console.log('Processing bank transfer:', session.id);

    return {
      success: true,
      transactionId: `bank_${Date.now()}`,
      orderId: session.id,
      amount: session.total,
      currency: session.currency || 'ZAR',
      status: 'pending',
      fraudCheck
    };
  }

  async processRefund(transactionId: string, amount: number, reason: string): Promise<PaymentResult> {
    // Refund processing logic
    console.log('Processing refund:', transactionId, amount, reason);

    return {
      success: true,
      transactionId: `refund_${Date.now()}`,
      amount,
      currency: 'ZAR',
      status: 'completed'
    };
  }

  getFraudEngine(): FraudDetectionEngine {
    return this.fraudEngine;
  }
}

// Singleton instances
export const fraudDetectionEngine = new FraudDetectionEngine();
export const paymentProcessor = new PaymentProcessor();