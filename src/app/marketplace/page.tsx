"use client";

import { useState } from 'react';
import NFTMarketplace from '@/features/nft-marketplace/NFTMarketplace';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { ShoppingCart, Coins, Store, TrendingUp } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'ecommerce' | 'nft'>('ecommerce');
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
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="ecommerce" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              E-commerce Store
            </TabsTrigger>
            <TabsTrigger value="nft" className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              NFT Marketplace
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ecommerce" className="space-y-8">
            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                const cartItem = cart.find(item => item.id === product.id);
                return (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-w-4 aspect-h-3 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">{product.category}</span>
                    </div>
                    <CardContent className="p-4">
                      <div className="mb-3">
                        <h3 className="font-semibold text-lg text-gray-900">{product.name}</h3>
                        <Badge variant="outline" className="mt-1">
                          {product.category}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl font-bold text-green-600">
                          R{product.price.toLocaleString()}
                        </span>
                        {cartItem && (
                          <Badge variant="secondary">
                            {cartItem.quantity} in cart
                          </Badge>
                        )}
                      </div>

                      <Button
                        onClick={() => addToCart(product)}
                        className="w-full"
                        variant={cartItem ? "secondary" : "default"}
                      >
                        {cartItem ? `Add Another (${cartItem.quantity})` : 'Add to Cart'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Featured Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Featured Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: 'Plants', count: 3, color: 'bg-green-100 text-green-800' },
                    { name: 'Equipment', count: 2, color: 'bg-blue-100 text-blue-800' },
                    { name: 'Tools', count: 1, color: 'bg-orange-100 text-orange-800' },
                    { name: 'Irrigation', count: 1, color: 'bg-cyan-100 text-cyan-800' }
                  ].map((category) => (
                    <div
                      key={category.name}
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedCategory(category.name)}
                    >
                      <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${category.color} mb-2`}>
                        {category.name}
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{category.count}</p>
                      <p className="text-sm text-gray-600">products</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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