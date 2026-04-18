"use client";

import { useState, useEffect, useCallback } from 'react';
import { blockchainEngine, type Web3Wallet } from '@/lib/blockchain-engine';

interface Web3WalletProps {
  onWalletConnected?: (wallet: Web3Wallet) => void;
  onWalletDisconnected?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

interface WalletOption {
  id: 'metamask' | 'walletconnect' | 'coinbase' | 'trust' | 'other';
  name: string;
  icon: string;
  description: string;
  supported: boolean;
}

const walletOptions: WalletOption[] = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    description: 'Connect using MetaMask browser extension',
    supported: true
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: '🔗',
    description: 'Connect using WalletConnect protocol',
    supported: true
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '📱',
    description: 'Connect using Coinbase Wallet',
    supported: true
  },
  {
    id: 'trust',
    name: 'Trust Wallet',
    icon: '🔐',
    description: 'Connect using Trust Wallet',
    supported: true
  }
];

export function Web3Wallet({
  onWalletConnected,
  onWalletDisconnected,
  onError,
  className = ""
}: Web3WalletProps) {
  const [connectedWallet, setConnectedWallet] = useState<Web3Wallet | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showWalletSelector, setShowWalletSelector] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<'connected' | 'disconnected' | 'wrong_network'>('disconnected');

  // Check for existing connection on mount
  useEffect(() => {
    const checkExistingConnection = async () => {
      try {
        const wallet = blockchainEngine.getConnectedWallet();
        if (wallet) {
          setConnectedWallet(wallet);
          setNetworkStatus('connected');
          onWalletConnected?.(wallet);
        }
      } catch (error) {
        console.error('Error checking existing connection:', error);
      }
    };

    checkExistingConnection();
  }, [onWalletConnected]);

  const connectWallet = useCallback(async (walletType: Web3Wallet['type']) => {
    setIsConnecting(true);
    setShowWalletSelector(false);

    try {
      const wallet = await blockchainEngine.connectWallet(walletType);

      setConnectedWallet(wallet);
      setNetworkStatus('connected');
      onWalletConnected?.(wallet);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      onError?.(errorMessage);
      console.error('Wallet connection error:', error);
    } finally {
      setIsConnecting(false);
    }
  }, [onWalletConnected, onError]);

  const disconnectWallet = useCallback(async () => {
    try {
      await blockchainEngine.disconnectWallet();
      setConnectedWallet(null);
      setNetworkStatus('disconnected');
      onWalletDisconnected?.();
    } catch (error) {
      console.error('Wallet disconnection error:', error);
      onError?.('Failed to disconnect wallet');
    }
  }, [onWalletDisconnected, onError]);

  const switchNetwork = useCallback(async (network: string) => {
    if (!connectedWallet) return;

    try {
      await blockchainEngine.switchNetwork(network as any);
      setConnectedWallet(prev => prev ? { ...prev, network } : null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to switch network';
      onError?.(errorMessage);
      console.error('Network switch error:', error);
    }
  }, [connectedWallet, onError]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    return num.toFixed(4);
  };

  if (connectedWallet) {
    return (
      <div className={`bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-4 ${className}`}>
        {/* Connected Wallet Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#c5a059] rounded-full flex items-center justify-center text-white font-bold">
              {connectedWallet.type === 'metamask' ? '🦊' :
               connectedWallet.type === 'walletconnect' ? '🔗' :
               connectedWallet.type === 'coinbase' ? '📱' : '🔐'}
            </div>
            <div>
              <div className="text-white font-semibold">
                {connectedWallet.ensName || formatAddress(connectedWallet.address)}
              </div>
              <div className="text-sm text-[#45a29e]">
                {connectedWallet.network.charAt(0).toUpperCase() + connectedWallet.network.slice(1)} Network
              </div>
            </div>
          </div>
          <button
            onClick={disconnectWallet}
            className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
          >
            Disconnect
          </button>
        </div>

        {/* Wallet Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-[#0b0c10] rounded-lg p-3">
            <div className="text-sm text-[#45a29e] mb-1">Balance</div>
            <div className="text-white font-semibold">
              {formatBalance(connectedWallet.balance)} {connectedWallet.network === 'polygon' ? 'MATIC' : 'ETH'}
            </div>
          </div>
          <div className="bg-[#0b0c10] rounded-lg p-3">
            <div className="text-sm text-[#45a29e] mb-1">Status</div>
            <div className="text-green-400 font-semibold">Connected</div>
          </div>
        </div>

        {/* Network Switcher */}
        <div className="mb-4">
          <label className="block text-[#45a29e] text-sm font-medium mb-2">
            Switch Network
          </label>
          <select
            value={connectedWallet.network}
            onChange={(e) => switchNetwork(e.target.value)}
            className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg px-3 py-2 text-white focus:border-[#c5a059] focus:outline-none"
          >
            <option value="ethereum">Ethereum</option>
            <option value="polygon">Polygon</option>
            <option value="bnb">BNB Smart Chain</option>
            <option value="arbitrum">Arbitrum</option>
          </select>
        </div>

        {/* Quick Actions */}
        <div className="flex space-x-2">
          <button
            onClick={() => window.open(`https://polygonscan.com/address/${connectedWallet.address}`, '_blank')}
            className="flex-1 px-3 py-2 bg-[#45a29e]/20 border border-[#45a29e]/40 text-[#45a29e] rounded-lg hover:bg-[#45a29e]/30 transition-colors text-sm"
          >
            View on Explorer
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(connectedWallet.address)}
            className="flex-1 px-3 py-2 bg-[#c5a059] text-[#0b0c10] rounded-lg hover:bg-[#b8954f] transition-colors text-sm"
          >
            Copy Address
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-4 ${className}`}>
      {/* Connect Wallet Header */}
      <div className="text-center mb-6">
        <div className="text-4xl mb-3">🔗</div>
        <h3 className="text-xl font-bold text-white mb-2">Connect Web3 Wallet</h3>
        <p className="text-[#45a29e] text-sm">
          Connect your Web3 wallet to access blockchain features and property NFTs
        </p>
      </div>

      {/* Wallet Selector */}
      {showWalletSelector ? (
        <div className="space-y-3">
          <h4 className="text-white font-semibold mb-3">Choose Wallet</h4>
          {walletOptions.map((wallet) => (
            <button
              key={wallet.id}
              onClick={() => connectWallet(wallet.id)}
              disabled={!wallet.supported || isConnecting}
              className="w-full p-3 bg-[#0b0c10] border border-[#45a29e]/20 rounded-lg hover:border-[#c5a059] transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{wallet.icon}</div>
                <div>
                  <div className="text-white font-semibold">{wallet.name}</div>
                  <div className="text-sm text-[#45a29e]">{wallet.description}</div>
                </div>
              </div>
            </button>
          ))}

          <button
            onClick={() => setShowWalletSelector(false)}
            className="w-full mt-3 px-4 py-2 bg-[#45a29e]/20 border border-[#45a29e]/40 text-[#45a29e] rounded-lg hover:bg-[#45a29e]/30 transition-colors"
          >
            Back
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Connect Button */}
          <button
            onClick={() => setShowWalletSelector(true)}
            disabled={isConnecting}
            className="w-full px-6 py-3 bg-[#c5a059] text-[#0b0c10] rounded-lg hover:bg-[#b8954f] transition-colors font-bold disabled:opacity-50"
          >
            {isConnecting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0b0c10]"></div>
                <span>Connecting...</span>
              </div>
            ) : (
              '🔗 Connect Wallet'
            )}
          </button>

          {/* Features List */}
          <div className="bg-[#0b0c10] rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3">What you can do:</h4>
            <ul className="text-sm text-[#45a29e] space-y-2">
              <li className="flex items-center space-x-2">
                <span className="text-[#c5a059]">•</span>
                <span>Tokenize property ownership as NFTs</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-[#c5a059]">•</span>
                <span>Trade fractional property shares</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-[#c5a059]">•</span>
                <span>Earn staking rewards on properties</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-[#c5a059]">•</span>
                <span>Access decentralized property records</span>
              </li>
            </ul>
          </div>

          {/* Network Info */}
          <div className="text-center">
            <div className="text-xs text-[#45a29e] mb-1">Supported Networks</div>
            <div className="flex justify-center space-x-2 text-sm">
              <span className="px-2 py-1 bg-[#0b0c10] rounded">Ethereum</span>
              <span className="px-2 py-1 bg-[#0b0c10] rounded">Polygon</span>
              <span className="px-2 py-1 bg-[#0b0c10] rounded">Arbitrum</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Hook for using Web3 wallet in components
export function useWeb3Wallet() {
  const [wallet, setWallet] = useState<Web3Wallet | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = useCallback(async (walletType: Web3Wallet['type']) => {
    setIsConnecting(true);
    try {
      const connectedWallet = await blockchainEngine.connectWallet(walletType);
      setWallet(connectedWallet);
      return connectedWallet;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    await blockchainEngine.disconnectWallet();
    setWallet(null);
  }, []);

  // Check for existing connection
  useEffect(() => {
    const existingWallet = blockchainEngine.getConnectedWallet();
    if (existingWallet) {
      setWallet(existingWallet);
    }
  }, []);

  return {
    wallet,
    isConnecting,
    connect,
    disconnect,
    isConnected: !!wallet
  };
}