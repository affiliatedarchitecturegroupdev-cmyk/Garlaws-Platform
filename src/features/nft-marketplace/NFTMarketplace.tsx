"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Home, Coins, TrendingUp, ShoppingCart, Gavel, Star, Eye, Heart } from 'lucide-react';

interface NFTProperty {
  id: string;
  propertyId: string;
  tokenId: string;
  name: string;
  description: string;
  image: string;
  price: number;
  currency: 'ETH' | 'MATIC' | 'BNB';
  owner: string;
  creator: string;
  attributes: {
    location: string;
    size: number;
    type: string;
    yearBuilt: number;
    zoning: string;
  };
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  listingType: 'fixed' | 'auction';
  auctionEnd?: Date;
  highestBid?: number;
  bidCount?: number;
  liked: boolean;
  views: number;
}

interface NFTMarketplaceProps {
  tenantId?: string;
  onPurchase?: (nft: NFTProperty) => void;
  onBid?: (nft: NFTProperty, bid: number) => void;
}

const NFTMarketplace: React.FC<NFTMarketplaceProps> = ({
  tenantId = 'default',
  onPurchase,
  onBid
}) => {
  const [nfts, setNfts] = useState<NFTProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'marketplace' | 'portfolio' | 'create'>('marketplace');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchNFTs();
  }, [tenantId, selectedCategory, sortBy]);

  const fetchNFTs = async () => {
    try {
      setLoading(true);
      // Simulate API call to fetch NFTs
      const response = await new Promise<NFTProperty[]>(resolve => {
        setTimeout(() => {
          resolve([
            {
              id: '1',
              propertyId: 'PROP-001',
              tokenId: '0x1234...5678',
              name: 'Downtown Office Complex',
              description: 'Premium commercial property in the heart of the city',
              image: '/api/placeholder/400/300',
              price: 2.5,
              currency: 'ETH',
              owner: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
              creator: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
              attributes: {
                location: 'Downtown District',
                size: 50000,
                type: 'Office Building',
                yearBuilt: 2018,
                zoning: 'Commercial'
              },
              rarity: 'rare',
              listingType: 'auction',
              auctionEnd: new Date(Date.now() + 86400000), // 24 hours from now
              highestBid: 2.1,
              bidCount: 15,
              liked: false,
              views: 1247
            },
            {
              id: '2',
              propertyId: 'PROP-002',
              tokenId: '0x9876...1234',
              name: 'Residential Apartment Complex',
              description: 'Modern residential complex with 120 units',
              image: '/api/placeholder/400/300',
              price: 150000,
              currency: 'MATIC',
              owner: '0x8ba1f109551bD432803012645Bcc238AC0d5fb6',
              creator: '0x8ba1f109551bD432803012645Bcc238AC0d5fb6',
              attributes: {
                location: 'Suburban Area',
                size: 25000,
                type: 'Residential',
                yearBuilt: 2020,
                zoning: 'Residential'
              },
              rarity: 'uncommon',
              listingType: 'fixed',
              liked: true,
              views: 892
            },
            {
              id: '3',
              propertyId: 'PROP-003',
              tokenId: '0x4567...8901',
              name: 'Luxury Villa Estate',
              description: 'Exclusive luxury villa with ocean views',
              image: '/api/placeholder/400/300',
              price: 500000,
              currency: 'BNB',
              owner: '0x1f9090dE28563b3c14292AF5cAE4b5B9a8f1f1f1',
              creator: '0x1f9090dE28563b3c14292AF5cAE4b5B9a8f1f1f1',
              attributes: {
                location: 'Oceanfront',
                size: 15000,
                type: 'Luxury Villa',
                yearBuilt: 2022,
                zoning: 'Residential'
              },
              rarity: 'legendary',
              listingType: 'fixed',
              liked: false,
              views: 2156
            }
          ]);
        }, 1000);
      });

      setNfts(response);
    } catch (error) {
      console.error('Failed to fetch NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (nft: NFTProperty) => {
    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (onPurchase) {
        onPurchase(nft);
      }

      // Update NFT status
      setNfts(prev => prev.map(n => n.id === nft.id ? { ...n, owner: 'current-user' } : n));
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  const handleBid = async (nft: NFTProperty, bidAmount: number) => {
    if (onBid) {
      onBid(nft, bidAmount);
    }

    // Update highest bid
    setNfts(prev => prev.map(n =>
      n.id === nft.id ? { ...n, highestBid: bidAmount, bidCount: (n.bidCount || 0) + 1 } : n
    ));
  };

  const toggleLike = (nftId: string) => {
    setNfts(prev => prev.map(n =>
      n.id === nftId ? { ...n, liked: !n.liked } : n
    ));
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'uncommon': return 'bg-green-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredNFTs = nfts.filter(nft => {
    const matchesCategory = selectedCategory === 'all' ||
      (selectedCategory === 'auction' && nft.listingType === 'auction') ||
      (selectedCategory === 'fixed' && nft.listingType === 'fixed') ||
      nft.attributes.type.toLowerCase().includes(selectedCategory.toLowerCase());

    const matchesSearch = searchTerm === '' ||
      nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nft.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nft.attributes.location.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const sortedNFTs = [...filteredNFTs].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'recent':
        return new Date(b.id).getTime() - new Date(a.id).getTime();
      case 'popular':
        return b.views - a.views;
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-96 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Coins className="h-6 w-6 text-purple-600" />
            NFT Property Marketplace
          </h2>
          <p className="text-gray-600 mt-1">Tokenized real estate on the blockchain</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Network: Ethereum Mainnet
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="marketplace" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Marketplace
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            My Portfolio
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            Create NFT
          </TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace" className="space-y-6">
          {/* Filters and Search */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search properties..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="auction">Live Auctions</option>
                  <option value="fixed">Fixed Price</option>
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Industrial">Industrial</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="recent">Recently Added</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* NFT Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedNFTs.map((nft) => (
              <Card key={nft.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge className={`${getRarityColor(nft.rarity)} text-white`}>
                      {nft.rarity.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      onClick={() => toggleLike(nft.id)}
                      className={`p-1 rounded-full ${nft.liked ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600'}`}
                    >
                      <Heart className={`h-4 w-4 ${nft.liked ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="secondary" className="bg-black/70 text-white">
                      <Eye className="h-3 w-3 mr-1" />
                      {nft.views}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{nft.name}</h3>
                    <div className="text-right">
                      <p className="font-bold text-xl">{nft.price} {nft.currency}</p>
                      <p className="text-sm text-gray-500">${(nft.price * 2000).toLocaleString()}</p>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{nft.description}</p>

                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
                    <div>📍 {nft.attributes.location}</div>
                    <div>🏠 {nft.attributes.size.toLocaleString()} sq ft</div>
                    <div>📅 Built {nft.attributes.yearBuilt}</div>
                    <div>🏷️ {nft.attributes.zoning}</div>
                  </div>

                  {nft.listingType === 'auction' && nft.auctionEnd && (
                    <div className="mb-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Highest Bid:</span>
                        <span className="font-semibold">{nft.highestBid} {nft.currency}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Bids:</span>
                        <span>{nft.bidCount}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Ends:</span>
                        <span>{nft.auctionEnd.toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {nft.listingType === 'auction' ? (
                      <Button
                        onClick={() => handleBid(nft, (nft.highestBid || nft.price) + 0.1)}
                        className="flex-1 flex items-center gap-2"
                      >
                        <Gavel className="h-4 w-4" />
                        Place Bid
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handlePurchase(nft)}
                        className="flex-1 flex items-center gap-2"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Buy Now
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Star className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {sortedNFTs.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Coins className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No NFTs found</h3>
                <p className="text-gray-600">Try adjusting your search criteria or check back later for new listings.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">My NFT Portfolio</h3>
              <p className="text-gray-600 mb-4">Connect your wallet to view your owned properties and transaction history.</p>
              <Button>Connect Wallet</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <Coins className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Create NFT Property</h3>
              <p className="text-gray-600 mb-4">Tokenize your property and list it on the marketplace.</p>
              <Button>Create NFT</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NFTMarketplace;