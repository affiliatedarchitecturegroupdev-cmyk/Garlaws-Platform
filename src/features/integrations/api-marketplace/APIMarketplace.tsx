'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

// API Marketplace Types
export type APICategory =
  | 'financial'
  | 'supply-chain'
  | 'crm'
  | 'project-management'
  | 'ai-ml'
  | 'bi-analytics'
  | 'security'
  | 'erp'
  | 'mobile'
  | 'integration';

export type APIPlan =
  | 'free'
  | 'developer'
  | 'professional'
  | 'enterprise'
  | 'unlimited';

export interface APIEndpoint {
  id: string;
  name: string;
  description: string;
  category: APICategory;
  version: string;
  baseUrl: string;
  endpoints: APIEndpointSpec[];
  authentication: 'oauth2' | 'apikey' | 'bearer' | 'basic';
  pricing: APIPlanPricing;
  documentation: APIDocumentation;
  status: 'active' | 'beta' | 'deprecated';
  tags: string[];
  popularity: number;
  rating: number;
  totalCalls: number;
  responseTime: number;
  uptime: number;
  createdAt: string;
  updatedAt: string;
}

export interface APIEndpointSpec {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  summary: string;
  description?: string;
  parameters?: APIParameter[];
  requestBody?: APIRequestBody;
  responses: APIResponse[];
  tags?: string[];
}

export interface APIParameter {
  name: string;
  in: 'query' | 'header' | 'path' | 'cookie';
  description?: string;
  required: boolean;
  schema: APIParameterSchema;
}

export interface APIParameterSchema {
  type: string;
  format?: string;
  example?: any;
  enum?: string[];
  minimum?: number;
  maximum?: number;
}

export interface APIRequestBody {
  description?: string;
  content: { [contentType: string]: { schema: any } };
  required?: boolean;
}

export interface APIResponse {
  statusCode: number;
  description: string;
  content?: { [contentType: string]: { schema: any } };
}

export interface APIPlanPricing {
  free: {
    price: number;
    currency: string;
    requestsPerMonth: number;
    burstLimit: number;
    features: string[];
  };
  developer: {
    price: number;
    currency: string;
    requestsPerMonth: number;
    burstLimit: number;
    features: string[];
  };
  professional: {
    price: number;
    currency: string;
    requestsPerMonth: number;
    burstLimit: number;
    features: string[];
  };
  enterprise: {
    price: number;
    currency: string;
    requestsPerMonth: number;
    burstLimit: number;
    features: string[];
  };
  unlimited: {
    price: number;
    currency: string;
    requestsPerMonth: number;
    burstLimit: number;
    features: string[];
  };
}

export interface APIDocumentation {
  overview: string;
  gettingStarted: string;
  authentication: string;
  examples: APIExample[];
  changelog: APIChangelogEntry[];
  support: {
    email: string;
    documentation: string;
    community: string;
  };
}

export interface APIExample {
  title: string;
  description: string;
  language: 'curl' | 'javascript' | 'python' | 'java' | 'csharp';
  code: string;
}

export interface APIChangelogEntry {
  version: string;
  date: string;
  changes: string[];
  breaking: boolean;
}

export interface APISubscription {
  id: string;
  apiId: string;
  userId: string;
  plan: APIPlan;
  status: 'active' | 'suspended' | 'cancelled';
  apiKey: string;
  usage: APIUsageStats;
  createdAt: string;
  expiresAt?: string;
}

export interface APIUsageStats {
  totalRequests: number;
  requestsThisMonth: number;
  requestsToday: number;
  averageResponseTime: number;
  errorRate: number;
  lastRequestAt?: string;
}

// API Marketplace Hook
export function useAPIMarketplace() {
  const [apis, setApis] = useState<APIEndpoint[]>([]);
  const [subscriptions, setSubscriptions] = useState<APISubscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<APICategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'name' | 'recent'>('popularity');

  // Mock API data - in real implementation, this would come from backend
  const mockAPIs: APIEndpoint[] = [
    {
      id: 'garlaws-financial-v2',
      name: 'Garlaws Financial API',
      description: 'Comprehensive financial management and reconciliation API',
      category: 'financial',
      version: '2.1.0',
      baseUrl: 'https://api.garlaws.com/financial/v2',
      endpoints: [
        {
          path: '/reconciliation',
          method: 'GET',
          summary: 'Get reconciliation data',
          responses: [{ statusCode: 200, description: 'Success' }]
        },
        {
          path: '/transactions',
          method: 'POST',
          summary: 'Create new transaction',
          responses: [{ statusCode: 201, description: 'Created' }]
        }
      ],
      authentication: 'oauth2',
      pricing: {
        free: { price: 0, currency: 'USD', requestsPerMonth: 1000, burstLimit: 10, features: ['Basic endpoints'] },
        developer: { price: 49, currency: 'USD', requestsPerMonth: 10000, burstLimit: 50, features: ['All endpoints', 'Email support'] },
        professional: { price: 199, currency: 'USD', requestsPerMonth: 100000, burstLimit: 200, features: ['All endpoints', 'Priority support', 'Analytics'] },
        enterprise: { price: 999, currency: 'USD', requestsPerMonth: 1000000, burstLimit: 1000, features: ['All endpoints', 'Dedicated support', 'Custom integrations'] },
        unlimited: { price: 4999, currency: 'USD', requestsPerMonth: -1, burstLimit: 5000, features: ['Everything unlimited', 'White-label options'] }
      },
      documentation: {
        overview: 'The Garlaws Financial API provides comprehensive financial management capabilities...',
        gettingStarted: 'To get started, create an account and subscribe to a plan...',
        authentication: 'Use OAuth 2.0 for authentication...',
        examples: [],
        changelog: [],
        support: {
          email: 'api-support@garlaws.com',
          documentation: 'https://docs.garlaws.com/financial-api',
          community: 'https://community.garlaws.com/financial'
        }
      },
      status: 'active',
      tags: ['finance', 'reconciliation', 'transactions'],
      popularity: 95,
      rating: 4.8,
      totalCalls: 2500000,
      responseTime: 45,
      uptime: 99.98,
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2026-04-22T00:00:00Z'
    },
    {
      id: 'garlaws-supply-chain-v3',
      name: 'Garlaws Supply Chain API',
      description: 'Advanced supply chain management and logistics API',
      category: 'supply-chain',
      version: '3.0.1',
      baseUrl: 'https://api.garlaws.com/supply-chain/v3',
      endpoints: [],
      authentication: 'apikey',
      pricing: {
        free: { price: 0, currency: 'USD', requestsPerMonth: 500, burstLimit: 5, features: ['Inventory endpoints'] },
        developer: { price: 79, currency: 'USD', requestsPerMonth: 25000, burstLimit: 100, features: ['All endpoints', 'Real-time updates'] },
        professional: { price: 299, currency: 'USD', requestsPerMonth: 250000, burstLimit: 500, features: ['All endpoints', 'Analytics', 'Webhooks'] },
        enterprise: { price: 1499, currency: 'USD', requestsPerMonth: 2500000, burstLimit: 2000, features: ['All endpoints', 'Custom integrations', 'Dedicated infra'] },
        unlimited: { price: 7499, currency: 'USD', requestsPerMonth: -1, burstLimit: 10000, features: ['Everything unlimited', 'Global CDN'] }
      },
      documentation: {
        overview: 'Manage your entire supply chain with our comprehensive API...',
        gettingStarted: 'Start by setting up your inventory and supplier connections...',
        authentication: 'API keys are required for all requests...',
        examples: [],
        changelog: [],
        support: {
          email: 'supply-api@garlaws.com',
          documentation: 'https://docs.garlaws.com/supply-chain-api',
          community: 'https://community.garlaws.com/supply-chain'
        }
      },
      status: 'active',
      tags: ['supply-chain', 'inventory', 'logistics'],
      popularity: 87,
      rating: 4.6,
      totalCalls: 1800000,
      responseTime: 52,
      uptime: 99.95,
      createdAt: '2024-03-20T00:00:00Z',
      updatedAt: '2026-04-22T00:00:00Z'
    }
  ];

  const loadAPIs = useCallback(async () => {
    setLoading(true);
    try {
      // In real implementation, fetch from backend
      await new Promise(resolve => setTimeout(resolve, 500));
      setApis(mockAPIs);
    } catch (error) {
      console.error('Failed to load APIs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSubscriptions = useCallback(async () => {
    try {
      // In real implementation, fetch user subscriptions
      const mockSubscriptions: APISubscription[] = [];
      setSubscriptions(mockSubscriptions);
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
    }
  }, []);

  useEffect(() => {
    loadAPIs();
    loadSubscriptions();
  }, [loadAPIs, loadSubscriptions]);

  const filteredAPIs = apis.filter(api => {
    const matchesCategory = selectedCategory === 'all' || api.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      api.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      api.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      api.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'popularity':
        return b.popularity - a.popularity;
      case 'rating':
        return b.rating - a.rating;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'recent':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      default:
        return 0;
    }
  });

  const subscribeToAPI = useCallback(async (apiId: string, plan: APIPlan) => {
    try {
      // In real implementation, call backend API
      console.log(`Subscribing to ${apiId} with ${plan} plan`);
      await loadSubscriptions();
    } catch (error) {
      console.error('Failed to subscribe:', error);
    }
  }, [loadSubscriptions]);

  const getCategoryIcon = (category: APICategory) => {
    const icons: Record<APICategory, string> = {
      financial: '💰',
      'supply-chain': '📦',
      crm: '👥',
      'project-management': '📋',
      'ai-ml': '🤖',
      'bi-analytics': '📊',
      security: '🔒',
      erp: '🏢',
      mobile: '📱',
      integration: '🔗'
    };
    return icons[category];
  };

  return {
    apis: filteredAPIs,
    subscriptions,
    loading,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    subscribeToAPI,
    getCategoryIcon,
    refreshAPIs: loadAPIs,
    refreshSubscriptions: loadSubscriptions,
  };
}

// API Marketplace Component
interface APIMarketplaceProps {
  className?: string;
  showSubscriptions?: boolean;
}

export const APIMarketplace: React.FC<APIMarketplaceProps> = ({
  className,
  showSubscriptions = true,
}) => {
  const {
    apis,
    subscriptions,
    loading,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    subscribeToAPI,
    getCategoryIcon,
  } = useAPIMarketplace();

  const [selectedAPI, setSelectedAPI] = useState<APIEndpoint | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<APIPlan>('developer');

  const categories: (APICategory | 'all')[] = [
    'all', 'financial', 'supply-chain', 'crm', 'project-management',
    'ai-ml', 'bi-analytics', 'security', 'erp', 'mobile', 'integration'
  ];

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return 'Free';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  };

  const getPlanColor = (plan: APIPlan) => {
    const colors = {
      free: 'bg-gray-100 text-gray-800',
      developer: 'bg-blue-100 text-blue-800',
      professional: 'bg-green-100 text-green-800',
      enterprise: 'bg-purple-100 text-purple-800',
      unlimited: 'bg-gold-100 text-gold-800'
    };
    return colors[plan];
  };

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold">Loading API Marketplace</h3>
          <p className="text-sm text-muted-foreground mt-2">Discovering available APIs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">API Marketplace</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Discover, subscribe, and integrate with powerful APIs
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            {apis.length} APIs available
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search APIs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as APICategory | 'all')}
            className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none"
          >
            <option value="popularity">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="name">Name (A-Z)</option>
            <option value="recent">Recently Updated</option>
          </select>
        </div>
      </div>

      {/* API Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apis.map(api => (
          <div
            key={api.id}
            className="bg-white border border-border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedAPI(api)}
          >
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">{getCategoryIcon(api.category)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">{api.name}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-muted-foreground">v{api.version}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    api.status === 'active' ? 'bg-green-100 text-green-800' :
                    api.status === 'beta' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {api.status}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {api.description}
            </p>

            <div className="flex items-center justify-between text-sm mb-4">
              <div className="flex items-center space-x-1">
                <span className="text-yellow-500">⭐</span>
                <span>{api.rating}</span>
              </div>
              <div className="text-muted-foreground">
                {api.totalCalls.toLocaleString()} calls
              </div>
              <div className="text-muted-foreground">
                {api.responseTime}ms avg
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mb-4">
              {api.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-muted rounded text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
              {api.tags.length > 3 && (
                <span className="px-2 py-1 bg-muted rounded text-xs font-medium">
                  +{api.tags.length - 3}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className="font-medium">
                  {formatPrice(api.pricing['developer'].price, api.pricing['developer'].currency)}
                </span>
                <span className="text-muted-foreground">/mo</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedAPI(api);
                }}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* API Detail Modal */}
      {selectedAPI && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-3xl">{getCategoryIcon(selectedAPI.category)}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedAPI.name}</h2>
                    <p className="text-muted-foreground mt-1">{selectedAPI.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-sm">v{selectedAPI.version}</span>
                      <span className="text-sm">⭐ {selectedAPI.rating}</span>
                      <span className="text-sm">{selectedAPI.totalCalls.toLocaleString()} calls</span>
                      <span className="text-sm">{selectedAPI.uptime}% uptime</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAPI(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Pricing Plans */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Pricing Plans</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {Object.entries(selectedAPI.pricing).map(([plan, pricing]) => (
                    <div
                      key={plan}
                      className={cn(
                        'border rounded-lg p-4 cursor-pointer transition-all',
                        selectedPlan === plan
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      )}
                      onClick={() => setSelectedPlan(plan as APIPlan)}
                    >
                      <div className="text-center">
                        <div className={cn('px-2 py-1 rounded text-xs font-medium mb-2', getPlanColor(plan as APIPlan))}>
                          {plan.charAt(0).toUpperCase() + plan.slice(1)}
                        </div>
                        <div className="text-2xl font-bold">
                          {formatPrice(pricing.price, pricing.currency)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {pricing.requestsPerMonth === -1 ? 'Unlimited' : pricing.requestsPerMonth.toLocaleString()} requests/mo
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subscribe Button */}
              <div className="flex justify-center">
                <button
                  onClick={() => subscribeToAPI(selectedAPI.id, selectedPlan)}
                  className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
                >
                  Subscribe to {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {apis.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold">No APIs found</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
};