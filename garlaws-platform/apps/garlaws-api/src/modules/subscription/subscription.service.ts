import { Injectable } from '@nestjs/common';

export interface Subscription {
  id: string;
  customerId: string;
  plan: 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired';
  startDate: Date;
  endDate: Date;
  monthlyPrice: number;
}

@Injectable()
export class SubscriptionService {
  private subscriptions: Subscription[] = [
    {
      id: 'sub_1',
      customerId: 'cust_1',
      plan: 'premium',
      status: 'active',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2027-01-01'),
      monthlyPrice: 2499,
    },
  ];

  async getPlans() {
    return [
      { id: 'basic', name: 'Basic', price: 999, features: ['Dashboard', 'Basic Reports', 'Monthly Health'] },
      { id: 'premium', name: 'Premium', price: 2499, features: ['IoT Monitoring', 'Priority Booking', 'Advanced Analytics'] },
      { id: 'enterprise', name: 'Enterprise', price: 7999, features: ['Dedicated Manager', 'Custom IoT', 'AI Insights', 'API Access'] },
    ];
  }

  async getCustomerSubscription(customerId: string): Promise<Subscription | undefined> {
    return this.subscriptions.find(s => s.customerId === customerId && s.status === 'active');
  }

  async createSubscription(data: { customerId: string; plan: string }): Promise<Subscription> {
    const prices: Record<string, number> = { basic: 999, premium: 2499, enterprise: 7999 };
    const sub: Subscription = {
      id: `sub_${Date.now()}`,
      customerId: data.customerId,
      plan: data.plan as any,
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      monthlyPrice: prices[data.plan] || 999,
    };
    this.subscriptions.push(sub);
    return sub;
  }
}