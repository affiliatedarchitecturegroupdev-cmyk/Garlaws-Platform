// Advanced Product Catalog System for Enterprise E-commerce

export interface ProductAttribute {
  id: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'color' | 'size';
  values?: string[];
  required: boolean;
  searchable: boolean;
  filterable: boolean;
}

export interface ProductVariant {
  id: string;
  sku: string;
  attributes: Record<string, any>;
  price: number;
  compareAtPrice?: number;
  cost: number;
  inventory: {
    tracked: boolean;
    quantity: number;
    policy: 'deny' | 'allow';
    lowStockThreshold?: number;
  };
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'in';
  };
  images: ProductImage[];
  barcode?: string;
  enabled: boolean;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  position: number;
  variantIds?: string[];
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  image?: string;
  attributes: ProductAttribute[];
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  displayOrder: number;
  enabled: boolean;
}

export interface ProductCollection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  rules: CollectionRule[];
  image?: string;
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  published: boolean;
  sortOrder: 'manual' | 'title-asc' | 'title-desc' | 'price-asc' | 'price-desc' | 'created-desc';
}

export interface CollectionRule {
  column: 'title' | 'vendor' | 'product_type' | 'variant_sku' | 'price' | 'compare_at_price' | 'weight' | 'inventory_quantity';
  relation: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'starts_with' | 'ends_with' | 'contains' | 'not_contains';
  condition: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  handle: string;
  productType: string;
  vendor: string;
  tags: string[];
  categories: string[];
  collections: string[];

  variants: ProductVariant[];
  images: ProductImage[];
  attributes: ProductAttribute[];

  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
  };

  pricing: {
    basePrice: number;
    compareAtPrice?: number;
    cost: number;
    profitMargin: number;
  };

  inventory: {
    tracked: boolean;
    quantity: number;
    policy: 'deny' | 'allow';
    lowStockThreshold?: number;
  };

  shipping: {
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
      unit: 'cm' | 'in';
    };
    requiresShipping: boolean;
    freeShipping: boolean;
    shippingClass?: string;
  };

  salesChannels: {
    onlineStore: boolean;
    marketplaces: string[];
    wholesale: boolean;
  };

  status: 'active' | 'draft' | 'archived';
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Advanced features
  reviews: ProductReview[];
  rating: {
    average: number;
    count: number;
  };

  personalization: {
    customizable: boolean;
    options: ProductCustomizationOption[];
  };

  promotions: ProductPromotion[];
  crossSells: string[];
  upSells: string[];
}

export interface ProductReview {
  id: string;
  customerId: string;
  customerName: string;
  rating: number;
  title: string;
  content: string;
  images?: string[];
  verified: boolean;
  helpful: number;
  createdAt: Date;
}

export interface ProductCustomizationOption {
  id: string;
  name: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'file' | 'color';
  required: boolean;
  values?: string[];
  priceModifier?: number;
  maxLength?: number;
}

export interface ProductPromotion {
  id: string;
  name: string;
  type: 'percentage' | 'fixed' | 'buy_x_get_y' | 'bundle';
  value: number;
  conditions: PromotionCondition[];
  usageLimit?: number;
  usageCount: number;
  startsAt: Date;
  endsAt?: Date;
  enabled: boolean;
}

export interface PromotionCondition {
  type: 'min_quantity' | 'min_amount' | 'customer_segment' | 'product_category' | 'specific_products';
  value: any;
}

// Dynamic Pricing Engine
export interface PricingRule {
  id: string;
  name: string;
  type: 'customer_segment' | 'quantity' | 'time_based' | 'location' | 'loyalty' | 'dynamic';
  conditions: PricingCondition[];
  adjustments: PricingAdjustment[];
  priority: number;
  enabled: boolean;
}

export interface PricingCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains';
  value: any;
}

export interface PricingAdjustment {
  type: 'percentage' | 'fixed' | 'fixed_price';
  value: number;
  appliesTo: 'base_price' | 'variant_price' | 'total';
}

// Product Search and Filtering
export interface ProductSearchQuery {
  query?: string;
  filters: ProductFilters;
  sort: ProductSort;
  pagination: {
    page: number;
    limit: number;
  };
}

export interface ProductFilters {
  categories?: string[];
  vendors?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  attributes?: Record<string, any[]>;
  tags?: string[];
  inStock?: boolean;
  onSale?: boolean;
  rating?: {
    min: number;
  };
  collections?: string[];
}

export interface ProductSort {
  field: 'title' | 'price' | 'rating' | 'created' | 'popularity' | 'relevance';
  direction: 'asc' | 'desc';
}

export interface ProductSearchResult {
  products: Product[];
  total: number;
  facets: SearchFacet[];
  suggestions?: string[];
}

export interface SearchFacet {
  field: string;
  type: 'terms' | 'range' | 'rating';
  values: FacetValue[];
}

export interface FacetValue {
  value: string | number;
  label: string;
  count: number;
  selected: boolean;
}