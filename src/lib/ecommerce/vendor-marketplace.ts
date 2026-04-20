// Multi-Vendor Marketplace System

export interface Vendor {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  email: string;
  phone?: string;
  website?: string;

  // Business information
  businessType: 'individual' | 'company' | 'partnership';
  registrationNumber?: string;
  taxId?: string;
  vatNumber?: string;

  // Address
  address: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };

  // Contact person
  contactPerson: {
    name: string;
    email: string;
    phone: string;
    position?: string;
  };

  // Financial information
  commission: {
    rate: number; // Percentage (e.g., 15.0 for 15%)
    type: 'percentage' | 'fixed';
    minimumPayout: number;
    payoutFrequency: 'weekly' | 'monthly' | 'quarterly';
    paymentMethod: 'bank_transfer' | 'paypal' | 'stripe';
    bankDetails?: {
      bankName: string;
      accountNumber: string;
      accountHolder: string;
      branchCode: string;
    };
  };

  // Performance metrics
  rating: {
    average: number;
    count: number;
  };
  totalSales: number;
  totalOrders: number;

  // Store settings
  storeSettings: {
    theme: 'default' | 'premium' | 'custom';
    customDomain?: string;
    shipping: {
      freeShippingThreshold?: number;
      handlingFee: number;
      insurance: boolean;
    };
    policies: {
      returnPolicy: string;
      shippingPolicy: string;
      termsOfService: string;
    };
  };

  // Status and verification
  status: 'pending' | 'active' | 'suspended' | 'terminated';
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  verifiedAt?: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface VendorProduct {
  id: string;
  vendorId: string;
  productId: string;
  vendorSku: string;
  vendorPrice: number;
  vendorCost: number;
  quantity: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VendorOrder {
  id: string;
  vendorId: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;

  items: VendorOrderItem[];
  subtotal: number;
  commission: number;
  vendorEarnings: number;

  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  trackingNumber?: string;
  carrier?: string;

  shippingAddress: Address;
  billingAddress: Address;

  createdAt: Date;
  updatedAt: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
}

export interface VendorOrderItem {
  id: string;
  productId: string;
  variantId: string;
  vendorProductId: string;
  title: string;
  variantTitle?: string;
  sku: string;
  quantity: number;
  price: number;
  total: number;
  commission: number;
  vendorEarnings: number;
}

export interface VendorPayout {
  id: string;
  vendorId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  method: 'bank_transfer' | 'paypal' | 'stripe';

  // Period covered
  periodStart: Date;
  periodEnd: Date;

  // Breakdown
  ordersCount: number;
  totalSales: number;
  totalCommission: number;
  fees: number;
  netAmount: number;

  // Transaction details
  transactionId?: string;
  reference?: string;
  notes?: string;

  // Timestamps
  requestedAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
}

export interface VendorAnalytics {
  vendorId: string;
  period: {
    start: Date;
    end: Date;
  };

  // Sales metrics
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  conversionRate: number;

  // Product performance
  topProducts: Array<{
    productId: string;
    title: string;
    sales: number;
    revenue: number;
  }>;

  // Customer metrics
  newCustomers: number;
  returningCustomers: number;
  customerRetentionRate: number;

  // Financial metrics
  totalCommission: number;
  netEarnings: number;
  pendingPayouts: number;

  // Operational metrics
  averageFulfillmentTime: number;
  returnRate: number;
  customerSatisfaction: number;
}

export interface VendorDashboard {
  vendor: Vendor;
  analytics: VendorAnalytics;
  recentOrders: VendorOrder[];
  pendingOrders: VendorOrder[];
  lowStockProducts: VendorProduct[];
  pendingProducts: VendorProduct[];
  upcomingPayouts: VendorPayout[];
  notifications: VendorNotification[];
}

export interface VendorNotification {
  id: string;
  vendorId: string;
  type: 'order' | 'product' | 'payout' | 'system' | 'review';
  title: string;
  message: string;
  actionUrl?: string;
  read: boolean;
  createdAt: Date;
}

export interface Address {
  name: string;
  company?: string;
  street: string;
  apartment?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  phone?: string;
}

// Commission calculation engine
export class CommissionEngine {
  calculateCommission(orderItem: VendorOrderItem, vendor: Vendor): number {
    const { commission } = vendor;

    if (commission.type === 'percentage') {
      return (orderItem.total * commission.rate) / 100;
    } else {
      // Fixed commission per item
      return Math.min(commission.rate, orderItem.total); // Don't charge more than item total
    }
  }

  calculateVendorEarnings(orderItem: VendorOrderItem, vendor: Vendor): number {
    const commission = this.calculateCommission(orderItem, vendor);
    return orderItem.total - commission;
  }

  calculateBulkCommission(orderItems: VendorOrderItem[], vendor: Vendor): {
    totalSales: number;
    totalCommission: number;
    vendorEarnings: number;
  } {
    const totalSales = orderItems.reduce((sum, item) => sum + item.total, 0);
    const totalCommission = orderItems.reduce((sum, item) => sum + this.calculateCommission(item, vendor), 0);
    const vendorEarnings = totalSales - totalCommission;

    return {
      totalSales,
      totalCommission,
      vendorEarnings
    };
  }
}

// Vendor management service
export class VendorService {
  private commissionEngine = new CommissionEngine();

  async createVendor(vendorData: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vendor> {
    // Implementation for creating a vendor
    const vendor: Vendor = {
      ...vendorData,
      id: `vendor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      verificationStatus: 'unverified',
      rating: { average: 0, count: 0 },
      totalSales: 0,
      totalOrders: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // In a real implementation, this would save to database
    console.log('Vendor created:', vendor);
    return vendor;
  }

  async updateVendor(vendorId: string, updates: Partial<Vendor>): Promise<Vendor> {
    // Implementation for updating vendor
    console.log('Updating vendor:', vendorId, updates);
    return {} as Vendor; // Placeholder
  }

  async getVendorDashboard(vendorId: string): Promise<VendorDashboard> {
    // Implementation for getting vendor dashboard data
    console.log('Getting dashboard for vendor:', vendorId);
    return {} as VendorDashboard; // Placeholder
  }

  async processOrderForVendor(orderId: string, vendorId: string): Promise<VendorOrder> {
    // Implementation for processing an order for a vendor
    console.log('Processing order for vendor:', orderId, vendorId);
    return {} as VendorOrder; // Placeholder
  }

  async calculatePayout(vendorId: string, periodStart: Date, periodEnd: Date): Promise<VendorPayout> {
    // Implementation for calculating vendor payout
    console.log('Calculating payout for vendor:', vendorId, periodStart, periodEnd);
    return {} as VendorPayout; // Placeholder
  }

  async getVendorAnalytics(vendorId: string, period: { start: Date; end: Date }): Promise<VendorAnalytics> {
    // Implementation for getting vendor analytics
    console.log('Getting analytics for vendor:', vendorId, period);
    return {} as VendorAnalytics; // Placeholder
  }

  getCommissionEngine(): CommissionEngine {
    return this.commissionEngine;
  }
}

// Singleton instance
export const vendorService = new VendorService();
export const commissionEngine = new CommissionEngine();