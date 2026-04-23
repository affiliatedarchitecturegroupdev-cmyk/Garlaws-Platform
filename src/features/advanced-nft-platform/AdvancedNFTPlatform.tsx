'use client';

import { useState, useEffect, useCallback } from 'react';

interface NFTAsset {
  id: string;
  name: string;
  description: string;
  image: string;
  creator: string;
  owner: string;
  price: number;
  currency: 'ETH' | 'MATIC' | 'SOL' | 'BTC';
  blockchain: 'ethereum' | 'polygon' | 'solana' | 'bitcoin';
  contractAddress: string;
  tokenId: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  attributes: Record<string, any>;
  createdAt: Date;
  lastSold?: Date;
  lastPrice?: number;
}

interface NFTCollection {
  id: string;
  name: string;
  description: string;
  creator: string;
  contractAddress: string;
  blockchain: 'ethereum' | 'polygon' | 'solana' | 'bitcoin';
  floorPrice: number;
  volume24h: number;
  items: number;
  owners: number;
  verified: boolean;
  bannerImage?: string;
  profileImage?: string;
}

interface TradingHistory {
  id: string;
  nftId: string;
  seller: string;
  buyer: string;
  price: number;
  currency: string;
  timestamp: Date;
  transactionHash: string;
}

interface AdvancedNFTPlatformProps {
  tenantId?: string;
  userWallet?: string;
  onNFTTransaction?: (transaction: TradingHistory) => void;
}

const SAMPLE_NFTS: NFTAsset[] = [
  {
    id: 'nft_001',
    name: 'Digital Property Blueprint #1',
    description: 'Architectural blueprint for a modern residential property',
    image: '/api/placeholder/400/400',
    creator: 'ArchitectStudio',
    owner: 'PropertyInvestor1',
    price: 2.5,
    currency: 'ETH',
    blockchain: 'ethereum',
    contractAddress: '0x1234...abcd',
    tokenId: '1',
    rarity: 'rare',
    attributes: { type: 'blueprint', propertyType: 'residential', rooms: 4 },
    createdAt: new Date('2024-01-15'),
    lastSold: new Date('2024-03-20'),
    lastPrice: 2.2
  },
  {
    id: 'nft_002',
    name: 'Virtual Land Parcel #42',
    description: 'Prime virtual real estate location in downtown district',
    image: '/api/placeholder/400/400',
    creator: 'MetaProperties',
    owner: 'VirtualInvestor',
    price: 15.8,
    currency: 'MATIC',
    blockchain: 'polygon',
    contractAddress: '0x5678...efgh',
    tokenId: '42',
    rarity: 'epic',
    attributes: { location: 'downtown', size: '100x100', zone: 'commercial' },
    createdAt: new Date('2024-02-01'),
    lastSold: new Date('2024-04-10'),
    lastPrice: 14.2
  }
];

const SAMPLE_COLLECTIONS: NFTCollection[] = [
  {
    id: 'col_001',
    name: 'Property Blueprints',
    description: 'Collection of architectural blueprints and property designs',
    creator: 'ArchitectStudio',
    contractAddress: '0x1234...collection',
    blockchain: 'ethereum',
    floorPrice: 1.2,
    volume24h: 45.6,
    items: 500,
    owners: 234,
    verified: true,
    bannerImage: '/api/placeholder/800/200',
    profileImage: '/api/placeholder/100/100'
  },
  {
    id: 'col_002',
    name: 'Virtual Real Estate',
    description: 'Premium virtual land parcels and properties',
    creator: 'MetaProperties',
    contractAddress: '0x5678...vreal',
    blockchain: 'polygon',
    floorPrice: 8.5,
    volume24h: 127.3,
    items: 1000,
    owners: 567,
    verified: true
  }
];

export default function AdvancedNFTPlatform({
  tenantId = 'default',
  userWallet = '0x742d35Cc6634C0532925a3b84d0bE8f5',
  onNFTTransaction
}: AdvancedNFTPlatformProps) {
  const [activeTab, setActiveTab] = useState<'marketplace' | 'portfolio' | 'create' | 'analytics'>('marketplace');
  const [nfts, setNfts] = useState<NFTAsset[]>(SAMPLE_NFTS);
  const [collections, setCollections] = useState<NFTCollection[]>(SAMPLE_COLLECTIONS);
  const [selectedNFT, setSelectedNFT] = useState<NFTAsset | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [tradingHistory, setTradingHistory] = useState<TradingHistory[]>([]);

  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    image: '',
    collection: '',
    attributes: {} as Record<string, any>,
    price: 0,
    currency: 'ETH' as 'ETH' | 'MATIC' | 'SOL' | 'BTC'
  });

  const purchaseNFT = useCallback(async (nft: NFTAsset) => {
    // Simulate blockchain transaction
    const transaction: TradingHistory = {
      id: `tx_${Date.now()}`,
      nftId: nft.id,
      seller: nft.owner,
      buyer: userWallet,
      price: nft.price,
      currency: nft.currency,
      timestamp: new Date(),
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`
    };

    // Update NFT ownership
    setNfts(prev => prev.map(n =>
      n.id === nft.id
        ? { ...n, owner: userWallet, lastSold: new Date(), lastPrice: nft.price }
        : n
    ));

    setTradingHistory(prev => [transaction, ...prev.slice(0, 49)]);
    onNFTTransaction?.(transaction);

    alert(`Successfully purchased ${nft.name} for ${nft.price} ${nft.currency}!`);
  }, [userWallet, onNFTTransaction]);

  const createNFT = useCallback(async () => {
    if (!createForm.name || !createForm.description) return;

    const newNFT: NFTAsset = {
      id: `nft_${Date.now()}`,
      name: createForm.name,
      description: createForm.description,
      image: createForm.image || '/api/placeholder/400/400',
      creator: userWallet,
      owner: userWallet,
      price: createForm.price,
      currency: createForm.currency,
      blockchain: 'ethereum',
      contractAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
      tokenId: Math.floor(Math.random() * 10000).toString(),
      rarity: 'common',
      attributes: createForm.attributes,
      createdAt: new Date()
    };

    setNfts(prev => [newNFT, ...prev]);
    setCreateForm({
      name: '',
      description: '',
      image: '',
      collection: '',
      attributes: {},
      price: 0,
      currency: 'ETH'
    });
    setIsCreating(false);
    setActiveTab('portfolio');
  }, [createForm, userWallet]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#9CA3AF';
      case 'uncommon': return '#10B981';
      case 'rare': return '#3B82F6';
      case 'epic': return '#8B5CF6';
      case 'legendary': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getBlockchainIcon = (blockchain: string) => {
    switch (blockchain) {
      case 'ethereum': return '⟠';
      case 'polygon': return '⬡';
      case 'solana': return '◎';
      case 'bitcoin': return '₿';
      default: return '⧫';
    }
  };

  const userNFTs = nfts.filter(nft => nft.owner === userWallet);
  const totalValue = userNFTs.reduce((sum, nft) => sum + nft.price, 0);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Advanced NFT Platform</h1>
            <p className="text-gray-600">Create, trade, and manage digital property assets</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">Wallet</div>
              <div className="font-mono text-sm">{userWallet.slice(0, 6)}...{userWallet.slice(-4)}</div>
            </div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{userNFTs.length}</div>
            <div className="text-sm text-gray-600">Owned NFTs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{totalValue.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Total Value (ETH)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{collections.length}</div>
            <div className="text-sm text-gray-600">Collections</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{tradingHistory.length}</div>
            <div className="text-sm text-gray-600">Transactions</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { id: 'marketplace', label: 'Marketplace', icon: '🏪' },
              { id: 'portfolio', label: 'Portfolio', icon: '🎒' },
              { id: 'create', label: 'Create NFT', icon: '🎨' },
              { id: 'analytics', label: 'Analytics', icon: '📊' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Marketplace Tab */}
          {activeTab === 'marketplace' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">NFT Marketplace</h2>
                <div className="flex gap-2">
                  <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option>All Collections</option>
                    <option>Property Blueprints</option>
                    <option>Virtual Real Estate</option>
                  </select>
                  <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option>All Prices</option>
                    <option>Under 1 ETH</option>
                    <option>1-10 ETH</option>
                    <option>10+ ETH</option>
                  </select>
                </div>
              </div>

              {/* NFT Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {nfts.map((nft) => (
                  <div
                    key={nft.id}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedNFT(nft)}
                  >
                    <div className="aspect-square bg-gray-100 flex items-center justify-center">
                      <img
                        src={nft.image}
                        alt={nft.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/api/placeholder/400/400';
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900 truncate">{nft.name}</h3>
                        <span className="text-xs px-2 py-1 rounded-full text-white" style={{ backgroundColor: getRarityColor(nft.rarity) }}>
                          {nft.rarity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{nft.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="text-lg">{getBlockchainIcon(nft.blockchain)}</span>
                          <span className="font-bold text-gray-900">{nft.price} {nft.currency}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            purchaseNFT(nft);
                          }}
                          disabled={nft.owner === userWallet}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {nft.owner === userWallet ? 'Owned' : 'Buy'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Portfolio Tab */}
          {activeTab === 'portfolio' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">My NFT Portfolio</h2>
              {userNFTs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-2">🎨</div>
                  <div>You don't own any NFTs yet</div>
                  <button
                    onClick={() => setActiveTab('marketplace')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Browse Marketplace
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userNFTs.map((nft) => (
                    <div key={nft.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <div className="aspect-square bg-gray-100 flex items-center justify-center">
                        <img
                          src={nft.image}
                          alt={nft.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/api/placeholder/400/400';
                          }}
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 mb-2">{nft.name}</h3>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Price: {nft.price} {nft.currency}</span>
                          <span>Rarity: {nft.rarity}</span>
                        </div>
                        <div className="mt-3 text-xs text-gray-500">
                          Created: {nft.createdAt.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Create NFT Tab */}
          {activeTab === 'create' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Create New NFT</h2>
              <div className="max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">NFT Name</label>
                    <input
                      type="text"
                      value={createForm.name}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter NFT name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={createForm.price}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                      <select
                        value={createForm.currency}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, currency: e.target.value as any }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="ETH">ETH</option>
                        <option value="MATIC">MATIC</option>
                        <option value="SOL">SOL</option>
                        <option value="BTC">BTC</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe your NFT"
                  />
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image URL (optional)</label>
                  <input
                    type="url"
                    value={createForm.image}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, image: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/image.png"
                  />
                </div>

                <div className="mt-6 flex gap-4">
                  <button
                    onClick={createNFT}
                    disabled={!createForm.name || !createForm.description}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create NFT
                  </button>
                  <button
                    onClick={() => setCreateForm({
                      name: '',
                      description: '',
                      image: '',
                      collection: '',
                      attributes: {},
                      price: 0,
                      currency: 'ETH'
                    })}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">NFT Analytics</h2>

              {/* Trading History */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-medium mb-4">Recent Transactions</h3>
                {tradingHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No transactions yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tradingHistory.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div>
                          <div className="font-medium">NFT #{tx.nftId}</div>
                          <div className="text-sm text-gray-600">
                            {tx.buyer.slice(0, 6)}...{tx.buyer.slice(-4)} bought from {tx.seller.slice(0, 6)}...{tx.seller.slice(-4)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{tx.price} {tx.currency}</div>
                          <div className="text-sm text-gray-600">{tx.timestamp.toLocaleDateString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Market Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="font-medium mb-2">Total Volume</h3>
                  <div className="text-2xl font-bold text-blue-600">127.4 ETH</div>
                  <div className="text-sm text-gray-600">24h volume</div>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="font-medium mb-2">Floor Price</h3>
                  <div className="text-2xl font-bold text-green-600">1.2 ETH</div>
                  <div className="text-sm text-gray-600">Lowest ask</div>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="font-medium mb-2">Active Traders</h3>
                  <div className="text-2xl font-bold text-purple-600">1,247</div>
                  <div className="text-sm text-gray-600">Last 24h</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* NFT Detail Modal */}
      {selectedNFT && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{selectedNFT.name}</h2>
                <button
                  onClick={() => setSelectedNFT(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <img
                    src={selectedNFT.image}
                    alt={selectedNFT.name}
                    className="w-full aspect-square object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = '/api/placeholder/400/400';
                    }}
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Description</h3>
                    <p className="text-gray-600">{selectedNFT.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Price</div>
                      <div className="font-bold text-lg">{selectedNFT.price} {selectedNFT.currency}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Rarity</div>
                      <span className="px-2 py-1 rounded-full text-white text-sm" style={{ backgroundColor: getRarityColor(selectedNFT.rarity) }}>
                        {selectedNFT.rarity}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500 mb-2">Attributes</div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(selectedNFT.attributes).map(([key, value]) => (
                        <span key={key} className="px-2 py-1 bg-gray-100 rounded text-sm">
                          {key}: {String(value)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => purchaseNFT(selectedNFT)}
                      disabled={selectedNFT.owner === userWallet}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {selectedNFT.owner === userWallet ? 'Owned' : `Buy for ${selectedNFT.price} ${selectedNFT.currency}`}
                    </button>
                    <button
                      onClick={() => setSelectedNFT(null)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}