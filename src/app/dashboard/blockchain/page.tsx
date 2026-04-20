"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { DashboardLayout } from '@/components/DashboardLayout';
import { MobileCard, MobileCardHeader, MobileCardContent, MobileCardActions } from '@/components/MobileCard';
import { Web3Wallet, useWeb3Wallet } from '@/components/Web3Wallet';
import { blockchainEngine, type PropertyNFT, type BlockchainTransaction } from '@/lib/blockchain-engine';

interface NFTCardProps {
  nft: PropertyNFT;
  onTransfer?: (nftId: string) => void;
  onStake?: (nftId: string) => void;
  onSellShares?: (nftId: string) => void;
}

function NFTCard({ nft, onTransfer, onStake, onSellShares }: NFTCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/20';
      case 'transferred': return 'text-blue-400 bg-blue-500/20';
      case 'burned': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <MobileCard className="border-l-4 border-l-[#c5a059]">
      <MobileCardHeader
        title={nft.metadata.name}
        subtitle={`${nft.metadata.propertyDetails?.address}, ${nft.metadata.propertyDetails?.location?.suburb}`}
        avatar={<span className="text-2xl">🏠</span>}
      />

      <MobileCardContent>
        <div className="space-y-4">
          {/* Property Image */}
          <div className="aspect-video bg-[#0b0c10] rounded-lg overflow-hidden">
            <Image
              src={nft.metadata.image || 'https://via.placeholder.com/400x300?text=Property+Image'}
              alt={nft.metadata.name}
              width={400}
              height={300}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Property+Image';
              }}
            />
          </div>

          {/* Property Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-[#45a29e]">Size</div>
              <div className="text-white font-semibold">{nft.metadata.propertyDetails?.size}m²</div>
            </div>
            <div>
              <div className="text-[#45a29e]">Bedrooms</div>
              <div className="text-white font-semibold">{nft.metadata.propertyDetails?.bedrooms}</div>
            </div>
            <div>
              <div className="text-[#45a29e]">Bathrooms</div>
              <div className="text-white font-semibold">{nft.metadata.propertyDetails?.bathrooms}</div>
            </div>
            <div>
              <div className="text-[#45a29e]">Year Built</div>
              <div className="text-white font-semibold">{nft.metadata.propertyDetails?.yearBuilt}</div>
            </div>
          </div>

          {/* Valuation & Status */}
          <div className="p-3 bg-[#2d3b2d] rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-[#45a29e]">Current Value</div>
                <div className="text-white font-bold text-lg">{formatCurrency(nft.valuation.currentValue)}</div>
              </div>
              <div>
                <div className="text-sm text-[#45a29e]">Status</div>
                <div className={`font-semibold px-2 py-1 rounded text-sm capitalize ${getStatusColor(nft.status)}`}>
                  {nft.status}
                </div>
              </div>
            </div>

            {nft.fractionalOwnership && (
              <div className="mt-3 pt-3 border-t border-[#45a29e]/20">
                <div className="text-sm text-[#45a29e]">Fractional Ownership</div>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="text-xs">
                    <span className="text-[#c5a059]">Available: </span>
                    <span className="text-white">{nft.fractionalOwnership.availableShares}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-[#c5a059]">Share Price: </span>
                    <span className="text-white">{formatCurrency(nft.fractionalOwnership.sharePrice)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Transaction Count */}
          <div className="flex justify-between text-sm">
            <span className="text-[#45a29e]">Transactions</span>
            <span className="text-white font-semibold">{nft.transactionHistory.length}</span>
          </div>
        </div>
      </MobileCardContent>

      <MobileCardActions>
        {nft.fractionalOwnership && nft.fractionalOwnership.availableShares > 0 && (
          <button
            onClick={() => onSellShares?.(nft.id)}
            className="px-3 py-2 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 transition-colors"
          >
            Sell Shares
          </button>
        )}
        <button
          onClick={() => onStake?.(nft.id)}
          className="px-3 py-2 bg-[#45a29e] text-white rounded-lg font-medium text-sm hover:bg-[#3a8a7a] transition-colors"
        >
          Stake
        </button>
        <button
          onClick={() => onTransfer?.(nft.id)}
          className="px-3 py-2 bg-[#c5a059] text-[#0b0c10] rounded-lg font-medium text-sm hover:bg-[#b8954f] transition-colors"
        >
          Transfer
        </button>
      </MobileCardActions>
    </MobileCard>
  );
}

interface TransactionCardProps {
  transaction: BlockchainTransaction;
}

function TransactionCard({ transaction }: TransactionCardProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'mint_nft': return 'text-green-400 bg-green-500/20';
      case 'transfer_nft': return 'text-blue-400 bg-blue-500/20';
      case 'fractional_trade': return 'text-purple-400 bg-purple-500/20';
      case 'staking': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.floor((timestamp.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  return (
    <MobileCard>
      <MobileCardHeader
        title={transaction.type.replace('_', ' ').toUpperCase()}
        subtitle={`Block #${transaction.blockNumber || 'Pending'} • ${formatTimestamp(transaction.timestamp)}`}
        avatar={<span className="text-2xl">🔗</span>}
      />

      <MobileCardContent>
        <div className="space-y-3">
          {/* Transaction Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-[#45a29e]">From</div>
              <div className="text-white font-mono text-xs">{formatAddress(transaction.fromAddress)}</div>
            </div>
            {transaction.toAddress && (
              <div>
                <div className="text-[#45a29e]">To</div>
                <div className="text-white font-mono text-xs">{formatAddress(transaction.toAddress)}</div>
              </div>
            )}
          </div>

          {/* Status & Network */}
          <div className="flex justify-between items-center">
            <div className={`px-2 py-1 rounded text-sm font-semibold ${getTypeColor(transaction.type)}`}>
              {transaction.type.replace('_', ' ')}
            </div>
            <div className={`font-semibold ${getStatusColor(transaction.status)}`}>
              {transaction.status.toUpperCase()}
            </div>
          </div>

          {/* Value & Gas */}
          {transaction.value && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-[#45a29e]">Value</div>
                <div className="text-white">{parseFloat(transaction.value).toFixed(4)} ETH</div>
              </div>
              {transaction.gasUsed && (
                <div>
                  <div className="text-[#45a29e]">Gas Used</div>
                  <div className="text-white">{transaction.gasUsed.toLocaleString()}</div>
                </div>
              )}
            </div>
          )}

          {/* Confirmations */}
          <div className="flex justify-between text-sm">
            <span className="text-[#45a29e]">Confirmations</span>
            <span className="text-white font-semibold">{transaction.confirmations}</span>
          </div>
        </div>
      </MobileCardContent>

      <MobileCardActions>
        <button
          onClick={() => window.open(`https://polygonscan.com/tx/${transaction.hash}`, '_blank')}
          className="px-4 py-2 bg-[#45a29e]/20 border border-[#45a29e]/40 text-[#45a29e] rounded-lg font-medium text-sm"
        >
          View on Explorer
        </button>
      </MobileCardActions>
    </MobileCard>
  );
}

export default function BlockchainDashboard() {
  const { wallet, isConnected, connect, disconnect } = useWeb3Wallet();
  const [nfts, setNfts] = useState<PropertyNFT[]>([]);
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const [marketData, setMarketData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'portfolio' | 'market' | 'transactions'>('portfolio');
  const [loading, setLoading] = useState(false);

  // Load user's NFTs and transactions
  useEffect(() => {
    if (wallet && isConnected) {
      loadUserData();
    }
  }, [wallet, isConnected]);

  const loadUserData = async () => {
    if (!wallet) return;

    setLoading(true);
    try {
      // Load user's NFTs
      const userNFTs = blockchainEngine.getNFTsByOwner(wallet.address);
      setNfts(userNFTs);

      // Load user's transactions
      const userTransactions = blockchainEngine.getTransactionsByAddress(wallet.address);
      setTransactions(userTransactions);

      // Load market data
      const market = await blockchainEngine.getMarketData();
      setMarketData(market);

    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (nftId: string) => {
    const toAddress = prompt('Enter recipient address:');
    if (!toAddress) return;

    try {
      const transaction = await blockchainEngine.transferPropertyNFT(nftId, toAddress);
      alert(`NFT transferred successfully! Transaction: ${transaction.hash}`);
      loadUserData(); // Refresh data
    } catch (error) {
      alert(`Transfer failed: ${error}`);
    }
  };

  const handleStake = async (nftId: string) => {
    alert('Staking functionality will be available in Phase 23.2');
    // TODO: Implement staking interface
  };

  const handleSellShares = async (nftId: string) => {
    const shareAmount = prompt('Enter number of shares to sell:');
    if (!shareAmount) return;

    try {
      const transaction = await blockchainEngine.buyFractionalShares(nftId, parseInt(shareAmount));
      alert(`Shares sold successfully! Transaction: ${transaction.hash}`);
      loadUserData(); // Refresh data
    } catch (error) {
      alert(`Share sale failed: ${error}`);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (!isConnected) {
    return (
      <DashboardLayout activeTab="analytics">
        <div className="p-6 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">Blockchain Dashboard</h1>
            <p className="text-[#45a29e] mb-8">
              Connect your Web3 wallet to access property NFTs and blockchain features
            </p>
          </div>
          <Web3Wallet
            onWalletConnected={() => loadUserData()}
            onError={(error) => alert(`Connection error: ${error}`)}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab="analytics">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Blockchain Dashboard</h1>
          <p className="text-[#45a29e]">
            Manage your property NFTs, fractional ownership, and blockchain transactions
          </p>
        </div>

        {/* Wallet Status */}
        <div className="mb-6">
          <Web3Wallet
            onWalletDisconnected={() => {
              setNfts([]);
              setTransactions([]);
              setMarketData(null);
            }}
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-[#1f2833] rounded-lg p-1">
          {[
            { id: 'portfolio', label: 'My Portfolio', icon: '🏠' },
            { id: 'market', label: 'Market Data', icon: '📊' },
            { id: 'transactions', label: 'Transactions', icon: '🔗' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#c5a059] text-[#0b0c10]'
                  : 'text-[#45a29e] hover:bg-[#45a29e]/10'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-[#1f2833] rounded-xl p-4 border border-[#45a29e]/20 text-center">
                <div className="text-2xl font-bold text-white mb-1">{nfts.length}</div>
                <div className="text-sm text-[#45a29e]">Total NFTs</div>
              </div>
              <div className="bg-[#1f2833] rounded-xl p-4 border border-[#45a29e]/20 text-center">
                <div className="text-2xl font-bold text-[#c5a059] mb-1">
                  {formatCurrency(nfts.reduce((sum, nft) => sum + nft.valuation.currentValue, 0))}
                </div>
                <div className="text-sm text-[#45a29e]">Portfolio Value</div>
              </div>
              <div className="bg-[#1f2833] rounded-xl p-4 border border-[#45a29e]/20 text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">{transactions.length}</div>
                <div className="text-sm text-[#45a29e]">Transactions</div>
              </div>
              <div className="bg-[#1f2833] rounded-xl p-4 border border-[#45a29e]/20 text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {nfts.filter(nft => nft.fractionalOwnership).length}
                </div>
                <div className="text-sm text-[#45a29e]">Fractional Properties</div>
              </div>
            </div>

            <h2 className="text-xl font-bold text-white mb-4">My Property NFTs</h2>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c5a059] mx-auto mb-4"></div>
                <p className="text-[#45a29e]">Loading your NFTs...</p>
              </div>
            ) : nfts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-xl font-bold text-white mb-2">No NFTs Found</h3>
                <p className="text-[#45a29e] mb-6">
                  You haven't tokenized any properties yet. Start by tokenizing your first property!
                </p>
                <button className="px-6 py-3 bg-[#c5a059] text-[#0b0c10] rounded-lg font-bold hover:bg-[#b8954f] transition-colors">
                  Tokenize Property
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {nfts.map((nft) => (
                  <NFTCard
                    key={nft.id}
                    nft={nft}
                    onTransfer={handleTransfer}
                    onStake={handleStake}
                    onSellShares={handleSellShares}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Market Data Tab */}
        {activeTab === 'market' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Market Overview</h2>

            {marketData ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-[#1f2833] rounded-xl p-4 border border-[#45a29e]/20 text-center">
                  <div className="text-2xl font-bold text-white mb-1">
                    {formatCurrency(marketData.totalVolume)}
                  </div>
                  <div className="text-sm text-[#45a29e]">Total Volume</div>
                </div>
                <div className="bg-[#1f2833] rounded-xl p-4 border border-[#45a29e]/20 text-center">
                  <div className="text-2xl font-bold text-[#c5a059] mb-1">{marketData.totalTransactions}</div>
                  <div className="text-sm text-[#45a29e]">Total Transactions</div>
                </div>
                <div className="bg-[#1f2833] rounded-xl p-4 border border-[#45a29e]/20 text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">
                    {formatCurrency(marketData.averagePrice)}
                  </div>
                  <div className="text-sm text-[#45a29e]">Average NFT Price</div>
                </div>
                <div className="bg-[#1f2833] rounded-xl p-4 border border-[#45a29e]/20 text-center">
                  <div className="text-2xl font-bold text-green-400 mb-1">{marketData.topProperties.length}</div>
                  <div className="text-sm text-[#45a29e]">Active Properties</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-[#45a29e]">Loading market data...</p>
              </div>
            )}

            {/* Recent Sales */}
            {marketData?.recentSales?.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Recent Sales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {marketData.recentSales.map((sale: any, index: number) => (
                    <MobileCard key={index}>
                      <MobileCardHeader
                        title={sale.nft.metadata.name}
                        subtitle={`${formatCurrency(sale.price)} • ${sale.timestamp.toLocaleDateString()}`}
                        avatar={<span className="text-2xl">💰</span>}
                      />
                      <MobileCardContent>
                        <p className="text-white text-sm">{sale.nft.metadata.propertyDetails?.address}</p>
                      </MobileCardContent>
                    </MobileCard>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Transaction History</h2>

            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🔗</div>
                <h3 className="text-xl font-bold text-white mb-2">No Transactions</h3>
                <p className="text-[#45a29e]">
                  Your blockchain transactions will appear here once you start using NFT features.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((tx) => (
                  <TransactionCard key={tx.id} transaction={tx} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="bg-[#c5a059] text-[#0b0c10] p-6 rounded-xl hover:opacity-90 transition-all text-center">
            <div className="text-3xl mb-3">🏠</div>
            <h3 className="font-bold mb-2">Tokenize Property</h3>
            <p className="text-sm opacity-80">Create NFT from property ownership</p>
          </button>

          <button className="bg-[#45a29e] text-white p-6 rounded-xl hover:opacity-90 transition-all text-center">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-bold mb-2">Fractional Trading</h3>
            <p className="text-sm opacity-80">Buy/sell property shares</p>
          </button>

          <button className="bg-[#1f2833] border border-[#45a29e]/20 text-[#45a29e] p-6 rounded-xl hover:bg-[#45a29e]/10 transition-all text-center">
            <div className="text-3xl mb-3">🏆</div>
            <h3 className="font-bold mb-2">Staking Rewards</h3>
            <p className="text-sm opacity-80">Earn rewards by staking NFTs</p>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}