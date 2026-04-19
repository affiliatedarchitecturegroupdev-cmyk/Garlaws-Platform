import { PropertyData } from '@/lib/types/property';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  tier: 'starter' | 'professional' | 'enterprise' | 'custom';
  pricing: {
    monthly: number;
    yearly: number;
    currency: string;
  };
  features: PlanFeature[];
  limits: PlanLimits;
  metadata: {
    popular?: boolean;
    recommended?: boolean;
    enterpriseOnly?: boolean;
  };
  status: 'active' | 'deprecated' | 'coming_soon';
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanFeature {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'advanced' | 'premium' | 'enterprise';
  included: boolean;
  limit?: number;
  unit?: string;
}

export interface PlanLimits {
  properties: number;
  users: number;
  storage: number; // GB
  apiCalls: number; // per month
  aiQueries: number; // per month
  iotSensors: number;
  backups: number;
  support: 'email' | 'chat' | 'phone' | 'dedicated';
}

export interface Subscription {
  id: string;
  tenantId: string;
  planId: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete';
  billingCycle: 'monthly' | 'yearly';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialEnd?: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  usage: SubscriptionUsage;
  paymentMethod?: PaymentMethod;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionUsage {
  properties: number;
  users: number;
  storageUsed: number; // GB
  apiCallsUsed: number;
  aiQueriesUsed: number;
  iotSensorsUsed: number;
  backupsUsed: number;
  lastUpdated: Date;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'paypal';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  tenantId: string;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  billingPeriod: {
    start: Date;
    end: Date;
  };
  lineItems: InvoiceLineItem[];
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAt?: Date;
  dueDate: Date;
  pdfUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  amount: number;
  quantity: number;
  period: {
    start: Date;
    end: Date;
  };
  metadata?: Record<string, any>;
}

export interface Tenant {
  id: string;
  name: string;
  domain?: string;
  ownerId: string;
  subscriptionId?: string;
  status: 'active' | 'suspended' | 'trial' | 'expired';
  settings: TenantSettings;
  usage: TenantUsage;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantSettings {
  theme: 'light' | 'dark' | 'auto';
  timezone: string;
  locale: string;
  features: Record<string, boolean>;
  customizations: Record<string, any>;
}

export interface TenantUsage {
  current: SubscriptionUsage;
  history: UsageSnapshot[];
  alerts: UsageAlert[];
}

export interface UsageSnapshot {
  date: Date;
  usage: SubscriptionUsage;
  costs: {
    base: number;
    overage: number;
    total: number;
  };
}

export interface UsageAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  metric: keyof SubscriptionUsage;
  threshold: number;
  currentValue: number;
  message: string;
  triggeredAt: Date;
  acknowledged: boolean;
}

export interface Trial {
  id: string;
  tenantId: string;
  planId: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired' | 'converted' | 'canceled';
  conversionRate?: number;
  features: string[];
  onboardingSteps: OnboardingStep[];
  createdAt: Date;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  completedAt?: Date;
  order: number;
}

export class SubscriptionManagementEngine {
  private plans: Map<string, SubscriptionPlan> = new Map();
  private subscriptions: Map<string, Subscription> = new Map();
  private tenants: Map<string, Tenant> = new Map();
  private invoices: Map<string, Invoice> = new Map();
  private trials: Map<string, Trial> = new Map();

  constructor() {
    this.initializeDefaultPlans();
  }

  // Plan Management
  async createPlan(plan: Omit<SubscriptionPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<SubscriptionPlan> {
    const newPlan: SubscriptionPlan = {
      ...plan,
      id: `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.plans.set(newPlan.id, newPlan);
    return newPlan;
  }

  getPlans(tier?: string): SubscriptionPlan[] {
    const allPlans = Array.from(this.plans.values());
    return tier ? allPlans.filter(p => p.tier === tier) : allPlans;
  }

  getPlan(planId: string): SubscriptionPlan | null {
    return this.plans.get(planId) || null;
  }

  // Subscription Management
  async createSubscription(subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<Subscription> {
    const newSubscription: Subscription = {
      ...subscription,
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.subscriptions.set(newSubscription.id, newSubscription);

    // Update tenant with subscription
    const tenant = this.tenants.get(subscription.tenantId);
    if (tenant) {
      tenant.subscriptionId = newSubscription.id;
      tenant.status = newSubscription.status === 'trialing' ? 'trial' : 'active';
    }

    return newSubscription;
  }

  async updateSubscription(subscriptionId: string, updates: Partial<Subscription>): Promise<Subscription | null> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return null;

    const updatedSubscription = { ...subscription, ...updates, updatedAt: new Date() };
    this.subscriptions.set(subscriptionId, updatedSubscription);

    // Handle plan changes
    if (updates.planId && updates.planId !== subscription.planId) {
      await this.handlePlanChange(updatedSubscription, subscription.planId, updates.planId);
    }

    return updatedSubscription;
  }

  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true): Promise<boolean> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return false;

    if (cancelAtPeriodEnd) {
      subscription.cancelAtPeriodEnd = true;
    } else {
      subscription.status = 'canceled';
      subscription.canceledAt = new Date();

      // Update tenant status
      const tenant = this.tenants.get(subscription.tenantId);
      if (tenant) {
        tenant.status = 'expired';
      }
    }

    subscription.updatedAt = new Date();
    return true;
  }

  getSubscriptions(tenantId?: string): Subscription[] {
    const allSubscriptions = Array.from(this.subscriptions.values());
    return tenantId ? allSubscriptions.filter(s => s.tenantId === tenantId) : allSubscriptions;
  }

  getSubscription(subscriptionId: string): Subscription | null {
    return this.subscriptions.get(subscriptionId) || null;
  }

  // Tenant Management
  async createTenant(tenant: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tenant> {
    const newTenant: Tenant = {
      ...tenant,
      id: `tenant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.tenants.set(newTenant.id, newTenant);
    return newTenant;
  }

  getTenants(): Tenant[] {
    return Array.from(this.tenants.values());
  }

  getTenant(tenantId: string): Tenant | null {
    return this.tenants.get(tenantId) || null;
  }

  // Usage Tracking
  async recordUsage(tenantId: string, metric: keyof SubscriptionUsage, value: number): Promise<void> {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) return;

    // Update current usage
    (tenant.usage.current as any)[metric] = value;
    tenant.usage.current.lastUpdated = new Date();

    // Check limits and create alerts
    await this.checkUsageLimits(tenant);

    // Create usage snapshot (daily)
    const today = new Date().toISOString().split('T')[0];
    const existingSnapshot = tenant.usage.history.find(h => h.date.toISOString().split('T')[0] === today);

    if (!existingSnapshot) {
      tenant.usage.history.push({
        date: new Date(),
        usage: { ...tenant.usage.current },
        costs: this.calculateUsageCosts(tenant)
      });
    }

    tenant.updatedAt = new Date();
  }

  // Billing and Invoicing
  async generateInvoice(subscriptionId: string, billingPeriod: { start: Date; end: Date }): Promise<Invoice> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const plan = this.plans.get(subscription.planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    // Calculate base amount
    const baseAmount = subscription.billingCycle === 'yearly'
      ? plan.pricing.yearly
      : plan.pricing.monthly;

    // Calculate overage charges
    const overageAmount = this.calculateOverageCharges(subscription, plan);

    const totalAmount = baseAmount + overageAmount;

    const invoice: Invoice = {
      id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      subscriptionId,
      tenantId: subscription.tenantId,
      amount: baseAmount,
      currency: plan.pricing.currency,
      status: 'draft',
      billingPeriod,
      lineItems: [
        {
          id: `li-${Date.now()}-base`,
          description: `${plan.name} - ${subscription.billingCycle}`,
          amount: baseAmount,
          quantity: 1,
          period: billingPeriod
        }
      ],
      taxAmount: 0, // Would calculate based on region
      discountAmount: 0,
      totalAmount,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add overage line items
    if (overageAmount > 0) {
      invoice.lineItems.push({
        id: `li-${Date.now()}-overage`,
        description: 'Overage charges',
        amount: overageAmount,
        quantity: 1,
        period: billingPeriod
      });
    }

    this.invoices.set(invoice.id, invoice);
    return invoice;
  }

  async processPayment(invoiceId: string, paymentMethod: PaymentMethod): Promise<boolean> {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) return false;

    // Mock payment processing
    const paymentSuccess = Math.random() > 0.05; // 95% success rate

    if (paymentSuccess) {
      invoice.status = 'paid';
      invoice.paidAt = new Date();
      invoice.updatedAt = new Date();
    } else {
      invoice.status = 'uncollectible';
      invoice.updatedAt = new Date();
    }

    return paymentSuccess;
  }

  // Trial Management
  async createTrial(trial: Omit<Trial, 'id' | 'createdAt'>): Promise<Trial> {
    const newTrial: Trial = {
      ...trial,
      id: `trial-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };

    this.trials.set(newTrial.id, newTrial);
    return newTrial;
  }

  async convertTrial(trialId: string, subscriptionId: string): Promise<boolean> {
    const trial = this.trials.get(trialId);
    if (!trial) return false;

    trial.status = 'converted';
    trial.conversionRate = 1; // Would calculate based on metrics

    // Link trial to subscription
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.metadata.trialId = trialId;
    }

    return true;
  }

  // Analytics and Reporting
  getSubscriptionAnalytics(timeframe: 'month' | 'quarter' | 'year' = 'month'): any {
    const subscriptions = Array.from(this.subscriptions.values());
    const now = new Date();
    const startDate = new Date(now);

    switch (timeframe) {
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const periodSubscriptions = subscriptions.filter(s => s.createdAt >= startDate);

    return {
      totalSubscriptions: subscriptions.length,
      activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
      trialSubscriptions: subscriptions.filter(s => s.status === 'trialing').length,
      canceledSubscriptions: subscriptions.filter(s => s.status === 'canceled').length,
      newSubscriptions: periodSubscriptions.length,
      churnRate: this.calculateChurnRate(subscriptions, timeframe),
      revenue: this.calculateRevenueMetrics(subscriptions, timeframe),
      planDistribution: this.calculatePlanDistribution(subscriptions),
      growthRate: this.calculateGrowthRate(subscriptions, timeframe)
    };
  }

  // Private Helper Methods
  private async handlePlanChange(subscription: Subscription, oldPlanId: string, newPlanId: string): Promise<void> {
    const oldPlan = this.plans.get(oldPlanId);
    const newPlan = this.plans.get(newPlanId);

    if (!oldPlan || !newPlan) return;

    // Prorate billing if necessary
    // Update tenant features based on new plan
    const tenant = this.tenants.get(subscription.tenantId);
    if (tenant) {
      tenant.settings.features = this.getPlanFeatures(newPlan);
      tenant.updatedAt = new Date();
    }

    subscription.updatedAt = new Date();
  }

  private async checkUsageLimits(tenant: Tenant): Promise<void> {
    const subscription = tenant.subscriptionId ? this.subscriptions.get(tenant.subscriptionId) : null;
    if (!subscription) return;

    const plan = this.plans.get(subscription.planId);
    if (!plan) return;

    const alerts: UsageAlert[] = [];
    const usage = tenant.usage.current;
    const limits = plan.limits;

    // Check each metric
    Object.keys(limits).forEach(key => {
      const limit = (limits as any)[key];
      const current = (usage as any)[key];
      const threshold = limit * 0.8; // 80% warning threshold
      const criticalThreshold = limit * 0.95; // 95% critical threshold

      if (current >= criticalThreshold) {
        alerts.push({
          id: `alert-${Date.now()}-${key}`,
          type: 'critical',
          metric: key as keyof SubscriptionUsage,
          threshold: limit,
          currentValue: current,
          message: `${key} usage is at ${((current / limit) * 100).toFixed(1)}% of limit`,
          triggeredAt: new Date(),
          acknowledged: false
        });
      } else if (current >= threshold) {
        alerts.push({
          id: `alert-${Date.now()}-${key}`,
          type: 'warning',
          metric: key as keyof SubscriptionUsage,
          threshold: limit,
          currentValue: current,
          message: `${key} usage is at ${((current / limit) * 100).toFixed(1)}% of limit`,
          triggeredAt: new Date(),
          acknowledged: false
        });
      }
    });

    tenant.usage.alerts = alerts;
    tenant.updatedAt = new Date();
  }

  private calculateUsageCosts(tenant: Tenant): { base: number; overage: number; total: number } {
    const subscription = tenant.subscriptionId ? this.subscriptions.get(tenant.subscriptionId) : null;
    if (!subscription) return { base: 0, overage: 0, total: 0 };

    const plan = this.plans.get(subscription.planId);
    if (!plan) return { base: 0, overage: 0, total: 0 };

    const baseAmount = subscription.billingCycle === 'yearly' ? plan.pricing.yearly : plan.pricing.monthly;
    const overageAmount = this.calculateOverageCharges(subscription, plan);

    return {
      base: baseAmount,
      overage: overageAmount,
      total: baseAmount + overageAmount
    };
  }

  private calculateOverageCharges(subscription: Subscription, plan: SubscriptionPlan): number {
    let overageTotal = 0;
    const usage = subscription.usage;
    const limits = plan.limits;

    // Calculate overage for each metric (simplified pricing)
    const overageRates: Record<string, number> = {
      properties: 50,
      users: 20,
      storage: 1, // per GB
      apiCalls: 0.001, // per call
      aiQueries: 0.01, // per query
      iotSensors: 25,
      backups: 10
    };

    Object.keys(limits).forEach(key => {
      const limit = (limits as any)[key];
      const current = (usage as any)[key];
      const overage = Math.max(0, current - limit);

      if (overage > 0 && overageRates[key]) {
        overageTotal += overage * overageRates[key];
      }
    });

    return overageTotal;
  }

  private getPlanFeatures(plan: SubscriptionPlan): Record<string, boolean> {
    const features: Record<string, boolean> = {};

    plan.features.forEach(feature => {
      features[feature.id] = feature.included;
    });

    return features;
  }

  private calculateChurnRate(subscriptions: Subscription[], timeframe: string): number {
    const active = subscriptions.filter(s => s.status === 'active').length;
    const canceled = subscriptions.filter(s => s.status === 'canceled').length;

    return canceled / Math.max(active + canceled, 1);
  }

  private calculateRevenueMetrics(subscriptions: Subscription[], timeframe: string): any {
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
    const monthlyRevenue = activeSubscriptions.reduce((sum, sub) => {
      const plan = this.plans.get(sub.planId);
      return sum + (plan ? (sub.billingCycle === 'yearly' ? plan.pricing.yearly / 12 : plan.pricing.monthly) : 0);
    }, 0);

    return {
      monthlyRecurringRevenue: monthlyRevenue,
      annualRecurringRevenue: monthlyRevenue * 12,
      averageRevenuePerUser: monthlyRevenue / Math.max(activeSubscriptions.length, 1)
    };
  }

  private calculatePlanDistribution(subscriptions: Subscription[]): Record<string, number> {
    const distribution: Record<string, number> = {};

    subscriptions.forEach(sub => {
      const plan = this.plans.get(sub.planId);
      if (plan) {
        distribution[plan.tier] = (distribution[plan.tier] || 0) + 1;
      }
    });

    return distribution;
  }

  private calculateGrowthRate(subscriptions: Subscription[], timeframe: string): number {
    // Simplified growth rate calculation
    const total = subscriptions.length;
    const recent = subscriptions.filter(s => {
      const daysSinceCreation = (Date.now() - s.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceCreation <= 30;
    }).length;

    return total > 0 ? (recent / total) * 100 : 0;
  }

  private initializeDefaultPlans(): void {
    // Starter Plan
    this.createPlan({
      name: 'Starter',
      description: 'Perfect for small property owners getting started',
      tier: 'starter',
      pricing: {
        monthly: 49,
        yearly: 490,
        currency: 'USD'
      },
      features: [
        { id: 'basic_properties', name: 'Property Management', description: 'Basic property tracking', category: 'core', included: true },
        { id: 'basic_users', name: 'User Management', description: 'Up to 5 users', category: 'core', included: true, limit: 5 },
        { id: 'email_support', name: 'Email Support', description: 'Email support only', category: 'core', included: true }
      ],
      limits: {
        properties: 10,
        users: 5,
        storage: 10,
        apiCalls: 10000,
        aiQueries: 100,
        iotSensors: 5,
        backups: 5,
        support: 'email'
      },
      metadata: {},
      status: 'active'
    });

    // Professional Plan
    this.createPlan({
      name: 'Professional',
      description: 'Advanced features for growing property management businesses',
      tier: 'professional',
      pricing: {
        monthly: 149,
        yearly: 1490,
        currency: 'USD'
      },
      features: [
        { id: 'advanced_properties', name: 'Advanced Property Management', description: 'Full property lifecycle management', category: 'core', included: true },
        { id: 'advanced_users', name: 'Advanced User Management', description: 'Up to 25 users', category: 'core', included: true, limit: 25 },
        { id: 'ai_features', name: 'AI Features', description: 'AI-powered insights and automation', category: 'advanced', included: true },
        { id: 'iot_integration', name: 'IoT Integration', description: 'Sensor monitoring and alerts', category: 'advanced', included: true },
        { id: 'chat_support', name: 'Chat Support', description: 'Live chat support', category: 'core', included: true }
      ],
      limits: {
        properties: 100,
        users: 25,
        storage: 100,
        apiCalls: 100000,
        aiQueries: 1000,
        iotSensors: 50,
        backups: 20,
        support: 'chat'
      },
      metadata: { popular: true },
      status: 'active'
    });

    // Enterprise Plan
    this.createPlan({
      name: 'Enterprise',
      description: 'Full-featured platform for large-scale property management',
      tier: 'enterprise',
      pricing: {
        monthly: 499,
        yearly: 4990,
        currency: 'USD'
      },
      features: [
        { id: 'enterprise_properties', name: 'Enterprise Property Management', description: 'Unlimited properties with advanced analytics', category: 'core', included: true },
        { id: 'enterprise_users', name: 'Enterprise User Management', description: 'Unlimited users', category: 'core', included: true },
        { id: 'advanced_ai', name: 'Advanced AI', description: 'Full AI suite with custom models', category: 'premium', included: true },
        { id: 'blockchain', name: 'Blockchain Integration', description: 'Property tokenization and smart contracts', category: 'premium', included: true },
        { id: 'digital_twins', name: 'Digital Twins', description: '3D property modeling and simulation', category: 'premium', included: true },
        { id: 'dedicated_support', name: 'Dedicated Support', description: 'Dedicated account manager', category: 'enterprise', included: true },
        { id: 'custom_integrations', name: 'Custom Integrations', description: 'API access and custom integrations', category: 'enterprise', included: true }
      ],
      limits: {
        properties: -1, // Unlimited
        users: -1,
        storage: 1000,
        apiCalls: -1,
        aiQueries: -1,
        iotSensors: -1,
        backups: -1,
        support: 'dedicated'
      },
      metadata: { enterpriseOnly: true },
      status: 'active'
    });
  }
}

export const subscriptionManagementEngine = new SubscriptionManagementEngine();