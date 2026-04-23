"use client";

import { useState } from 'react';
import NFTMarketplace from '@/features/nft-marketplace/NFTMarketplace';
import { AdvancedProductDiscovery } from '@/features/advanced-product-discovery';
import { DynamicPricingEngine } from '@/features/dynamic-pricing-engine';
import { MarketplaceAnalytics } from '@/features/marketplace-analytics';
import { AdvancedFulfillment } from '@/features/advanced-fulfillment';
import { GlobalPayments } from '@/features/global-payments';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { ShoppingCart, Coins, Store, TrendingUp, DollarSign, BarChart3, Package, CreditCard } from 'lucide-react';

const products = [
  { id: 1, name: 'Indigenous Fern Bundle', category: 'Plants', price: 450, image: '/api/placeholder/200/150' },
  { id: 2, name: 'Terracotta Planter Large', category: 'Pottery', price: 890, image: '/api/placeholder/200/150' },
  { id: 3, name: 'Electric Pruning Shears', category: 'Equipment', price: 2500, image: '/api/placeholder/200/150' },
  { id: 4, name: 'Garden Tool Set', category: 'Tools', price: 1200, image: '/api/placeholder/200/150' },
  { id: 5, name: 'Aloe Vera Collection', category: 'Plants', price: 350, image: '/api/placeholder/200/150' },
  { id: 6, name: 'Ceramic Pot Medium', category: 'Pottery', price: 450, image: '/api/placeholder/200/150' },
  { id: 7, name: 'Smart Irrigation Kit', category: 'Irrigation', price: 4500, image: '/api/placeholder/200/150' },
  { id: 8, name: 'Indigenous Flower Seeds', category: 'Plants', price: 180, image: '/api/placeholder/200/150' },
];

const categories = ['All', 'Plants', 'Pottery', 'Equipment', 'Tools', 'Irrigation'];

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState<'ecommerce' | 'pricing' | 'analytics' | 'fulfillment' | 'payments' | 'nft'>('ecommerce');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<any[]>([]);

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(product => product.category === selectedCategory);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Store className="h-8 w-8 text-green-600" />
                Garlaws Marketplace
              </h1>
              <p className="text-gray-600 mt-1">Premium products and tokenized assets</p>
            </div>

            {/* Cart Summary */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium">
                  {cart.length} items - R{cartTotal.toLocaleString()}
                </span>
              </div>
              {cart.length > 0 && (
                <Button variant="outline" size="sm">
                  View Cart
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="ecommerce" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Product Discovery
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Dynamic Pricing
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="fulfillment" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Fulfillment
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Global Payments
            </TabsTrigger>
            <TabsTrigger value="nft" className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              NFT Marketplace
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ecommerce" className="space-y-8">
            <AdvancedProductDiscovery />
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <DynamicPricingEngine />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <MarketplaceAnalytics />
          </TabsContent>

          <TabsContent value="fulfillment" className="space-y-6">
            <AdvancedFulfillment />
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <GlobalPayments />
          </TabsContent>

          <TabsContent value="nft" className="space-y-6">
            <NFTMarketplace
              onPurchase={(nft) => console.log('NFT purchased:', nft)}
              onBid={(nft, bid) => console.log('Bid placed:', nft, bid)}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}