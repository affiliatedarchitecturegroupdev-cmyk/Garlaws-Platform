"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { CreditCard, Wallet, TrendingUp, DollarSign, Bitcoin, Coins, Send, ArrowDown } from 'lucide-react';

interface CryptoWallet {
  id: string;
  address: string;
  network: 'ethereum' | 'polygon' | 'bsc' | 'arbitrum' | 'solana';
  balance: {
    ETH?: number;
    MATIC?: number;
    BNB?: number;
    ARB?: number;
    SOL?: number;
    USDC?: number;
    USDT?: number;
    DAI?: number;
  };
  connected: boolean;
  type: 'metamask' | 'walletconnect' | 'coinbase' | 'phantom';
  lastSync: Date;
}

interface CryptoTransaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  amount: number;
  currency: string;
  network: string;
  type: 'send' | 'receive' | 'swap' | 'bridge';
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
  gasFee?: number;
  gasPrice?: number;
  blockNumber?: number;
  confirmations: number;
  value: number; // USD value
}

interface PaymentRequest {
  id: string;
  amount: number;
  currency: string;
  recipient: string;
  description: string;
  network: string;
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  expiresAt: Date;
  paymentUrl?: string;
  qrCode?: string;
}

interface CryptoPaymentsProps {
  tenantId?: string;
  onPaymentReceived?: (transaction: CryptoTransaction) => void;
  onWalletConnected?: (wallet: CryptoWallet) => void;
}

const CryptoPayments: React.FC<CryptoPaymentsProps> = ({
  tenantId = 'default',
  onPaymentReceived,
  onWalletConnected
}) => {
  const [wallets, setWallets] = useState<CryptoWallet[]>([]);
  const [transactions, setTransactions] = useState<CryptoTransaction[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'wallets' | 'payments' | 'transactions'>('wallets');
  const [selectedWallet, setSelectedWallet] = useState<CryptoWallet | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    currency: 'USDC',
    recipient: '',
    network: 'ethereum',
    description: ''
  });

  useEffect(() => {
    fetchWalletData();
  }, [tenantId]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      // Simulate API call to fetch wallet data
      const walletResponse = await new Promise<CryptoWallet[]>(resolve => {
        setTimeout(() => {
          resolve([
            {
              id: '1',
              address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
              network: 'ethereum',
              balance: {
                ETH: 2.45,
                USDC: 15000,
                USDT: 2500,
                DAI: 5000
              },
              connected: true,
              type: 'metamask',
              lastSync: new Date(Date.now() - 300000) // 5 minutes ago
            },
            {
              id: '2',
              address: '0x8ba1f109551bD432803012645Bcc238AC0d5fb6',
              network: 'polygon',
              balance: {
                MATIC: 1500,
                USDC: 25000,
                USDT: 10000
              },
              connected: true,
              type: 'walletconnect',
              lastSync: new Date(Date.now() - 600000) // 10 minutes ago
            }
          ]);
        }, 1000);
      });

      const transactionResponse = await new Promise<CryptoTransaction[]>(resolve => {
        setTimeout(() => {
          resolve([
            {
              id: '1',
              hash: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e742d35Cc6634C0532925a3b844Bc454e4438f44e',
              from: '0x8ba1f109551bD432803012645Bcc238AC0d5fb6',
              to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
              amount: 2.5,
              currency: 'ETH',
              network: 'ethereum',
              type: 'receive',
              status: 'confirmed',
              timestamp: new Date(Date.now() - 86400000),
              gasFee: 0.0021,
              gasPrice: 20,
              blockNumber: 18500000,
              confirmations: 12,
              value: 4250
            },
            {
              id: '2',
              hash: '0x8ba1f109551bD432803012645Bcc238AC0d5fb68ba1f109551bD432803012645Bcc238AC0d5fb6',
              from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
              to: '0x1f9090dE28563b3c14292AF5cAE4b5B9a8f1f1f1',
              amount: 5000,
              currency: 'USDC',
              network: 'polygon',
              type: 'send',
              status: 'confirmed',
              timestamp: new Date(Date.now() - 86400000 * 2),
              gasFee: 0.5,
              gasPrice: 30,
              blockNumber: 35000000,
              confirmations: 8,
              value: 5000
            }
          ]);
        }, 800);
      });

      setWallets(walletResponse);
      setTransactions(transactionResponse);
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = async (walletType: CryptoWallet['type'], network: CryptoWallet['network']) => {
    try {
      // Simulate wallet connection
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newWallet: CryptoWallet = {
        id: Date.now().toString(),
        address: `0x${Math.random().toString(16).substr(2, 40)}`,
        network,
        balance: {},
        connected: true,
        type: walletType,
        lastSync: new Date()
      };

      // Add some initial balance based on network
      switch (network) {
        case 'ethereum':
          newWallet.balance = { ETH: 0.1, USDC: 100 };
          break;
        case 'polygon':
          newWallet.balance = { MATIC: 100, USDC: 200 };
          break;
        case 'bsc':
          newWallet.balance = { BNB: 0.5, USDC: 150 };
          break;
      }

      setWallets(prev => [...prev, newWallet]);

      if (onWalletConnected) {
        onWalletConnected(newWallet);
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  const sendPayment = async () => {
    if (!selectedWallet || !paymentForm.amount || !paymentForm.recipient) return;

    try {
      // Simulate payment transaction
      await new Promise(resolve => setTimeout(resolve, 3000));

      const newTransaction: CryptoTransaction = {
        id: Date.now().toString(),
        hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        from: selectedWallet.address,
        to: paymentForm.recipient,
        amount: parseFloat(paymentForm.amount),
        currency: paymentForm.currency,
        network: paymentForm.network,
        type: 'send',
        status: 'pending',
        timestamp: new Date(),
        gasFee: 0.001,
        gasPrice: 25,
        confirmations: 0,
        value: parseFloat(paymentForm.amount) * 1 // Simplified USD conversion
      };

      setTransactions(prev => [newTransaction, ...prev]);

      // Update wallet balance
      setWallets(prev => prev.map(wallet =>
        wallet.id === selectedWallet.id
          ? {
              ...wallet,
              balance: {
                ...wallet.balance,
                [paymentForm.currency]: (wallet.balance[paymentForm.currency as keyof typeof wallet.balance] || 0) - parseFloat(paymentForm.amount)
              }
            }
          : wallet
      ));

      // Reset form
      setPaymentForm({
        amount: '',
        currency: 'USDC',
        recipient: '',
        network: 'ethereum',
        description: ''
      });

    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  const createPaymentRequest = async () => {
    try {
      // Simulate payment request creation
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newRequest: PaymentRequest = {
        id: Date.now().toString(),
        amount: parseFloat(paymentForm.amount),
        currency: paymentForm.currency,
        recipient: selectedWallet?.address || '',
        description: paymentForm.description,
        network: paymentForm.network,
        status: 'pending',
        expiresAt: new Date(Date.now() + 86400000), // 24 hours
        paymentUrl: `https://pay.garlaws.com/${Date.now()}`,
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...' // Mock QR code
      };

      setPaymentRequests(prev => [...prev, newRequest]);
    } catch (error) {
      console.error('Payment request creation failed:', error);
    }
  };

  const getNetworkColor = (network: string) => {
    switch (network) {
      case 'ethereum': return 'bg-blue-100 text-blue-800';
      case 'polygon': return 'bg-purple-100 text-purple-800';
      case 'bsc': return 'bg-yellow-100 text-yellow-800';
      case 'arbitrum': return 'bg-green-100 text-green-800';
      case 'solana': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getWalletIcon = (type: string) => {
    switch (type) {
      case 'metamask': return '🦊';
      case 'walletconnect': return '🔗';
      case 'coinbase': return '📱';
      case 'phantom': return '👻';
      default: return '👛';
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
            <Bitcoin className="h-6 w-6 text-orange-600" />
            Cryptocurrency Payments
          </h2>
          <p className="text-gray-600 mt-1">Multi-chain cryptocurrency payment processing</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Networks: ETH, Polygon, BSC, Arbitrum
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="wallets" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Wallets
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Send/Receive
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Transactions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wallets" className="space-y-6">
          {/* Wallet Connection Options */}
          <Card>
            <CardHeader>
              <CardTitle>Connect Wallet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { type: 'metamask', name: 'MetaMask', networks: ['ethereum', 'polygon', 'bsc', 'arbitrum'] },
                  { type: 'walletconnect', name: 'WalletConnect', networks: ['ethereum', 'polygon', 'bsc'] },
                  { type: 'coinbase', name: 'Coinbase Wallet', networks: ['ethereum', 'polygon'] },
                  { type: 'phantom', name: 'Phantom', networks: ['solana'] }
                ].map((wallet) => (
                  <div key={wallet.type} className="space-y-2">
                    <Button
                      onClick={() => connectWallet(wallet.type as any, wallet.networks[0] as any)}
                      variant="outline"
                      className="w-full flex items-center gap-2"
                    >
                      <span className="text-lg">{getWalletIcon(wallet.type)}</span>
                      {wallet.name}
                    </Button>
                    <select className="w-full px-2 py-1 text-xs border rounded">
                      {wallet.networks.map(network => (
                        <option key={network} value={network}>{network.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Connected Wallets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {wallets.map((wallet) => (
              <Card key={wallet.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getWalletIcon(wallet.type)}</span>
                      <div>
                        <CardTitle className="text-lg">{wallet.type.toUpperCase()}</CardTitle>
                        <Badge className={getNetworkColor(wallet.network)}>
                          {wallet.network.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${wallet.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm text-gray-600">
                        {wallet.connected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Address</p>
                      <p className="font-mono text-xs bg-gray-100 p-2 rounded break-all">
                        {wallet.address}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-2">Balances</p>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(wallet.balance).map(([currency, amount]) => (
                          <div key={currency} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="font-medium">{currency}</span>
                            <span className="font-mono">{amount?.toFixed(4) || '0'}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => setSelectedWallet(wallet)}
                        className="flex-1"
                        size="sm"
                      >
                        Select for Payments
                      </Button>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {wallets.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No wallets connected</h3>
                <p className="text-gray-600">Connect a cryptocurrency wallet to start making payments.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          {selectedWallet ? (
            <>
              {/* Payment Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Send Payment</CardTitle>
                  <p className="text-sm text-gray-600">
                    Sending from {selectedWallet.type.toUpperCase()} wallet on {selectedWallet.network.toUpperCase()}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={paymentForm.amount}
                            onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                            placeholder="0.00"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <select
                            value={paymentForm.currency}
                            onChange={(e) => setPaymentForm(prev => ({ ...prev, currency: e.target.value }))}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            {Object.keys(selectedWallet.balance).map(currency => (
                              <option key={currency} value={currency}>{currency}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Address</label>
                        <input
                          type="text"
                          value={paymentForm.recipient}
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, recipient: e.target.value }))}
                          placeholder="0x..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Network</label>
                        <select
                          value={paymentForm.network}
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, network: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="ethereum">Ethereum</option>
                          <option value="polygon">Polygon</option>
                          <option value="bsc">BSC</option>
                          <option value="arbitrum">Arbitrum</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                        <textarea
                          value={paymentForm.description}
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Payment description..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-3">Payment Summary</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Amount:</span>
                            <span>{paymentForm.amount || '0'} {paymentForm.currency}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Network Fee:</span>
                            <span>~0.001 ETH</span>
                          </div>
                          <div className="flex justify-between font-medium">
                            <span>Total:</span>
                            <span>{paymentForm.amount || '0'} {paymentForm.currency} + fees</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={sendPayment}
                          disabled={!paymentForm.amount || !paymentForm.recipient}
                          className="flex-1 flex items-center gap-2"
                        >
                          <Send className="h-4 w-4" />
                          Send Payment
                        </Button>
                        <Button
                          onClick={createPaymentRequest}
                          variant="outline"
                          disabled={!paymentForm.amount}
                        >
                          <ArrowDown className="h-4 w-4 mr-2" />
                          Request
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Requests */}
              {paymentRequests.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {paymentRequests.map((request) => (
                        <div key={request.id} className="flex justify-between items-center p-4 border rounded">
                          <div>
                            <p className="font-medium">{request.amount} {request.currency}</p>
                            <p className="text-sm text-gray-600">{request.description}</p>
                            <p className="text-xs text-gray-500">Expires: {request.expiresAt.toLocaleDateString()}</p>
                          </div>
                          <Badge variant={request.status === 'paid' ? 'success' : 'secondary'}>
                            {request.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Wallet</h3>
                <p className="text-gray-600">Choose a connected wallet to send or receive payments.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          {/* Transaction History */}
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <Card key={transaction.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
              {transaction.type === 'receive' ? (
                <ArrowDown className="h-5 w-5 text-green-600" />
              ) : (
                <Send className="h-5 w-5 text-red-600" />
              )}
                      <div>
                        <p className="font-medium capitalize">{transaction.type} {transaction.currency}</p>
                        <p className="text-sm text-gray-600">{transaction.timestamp.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`${getStatusColor(transaction.status)} text-white`}>
                        {transaction.status}
                      </Badge>
                      <Badge className={`${getNetworkColor(transaction.network)} ml-2`}>
                        {transaction.network}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Amount</p>
                      <p className="font-semibold">
                        {transaction.type === 'receive' ? '+' : '-'}{transaction.amount} {transaction.currency}
                      </p>
                      <p className="text-xs text-gray-500">${transaction.value.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">From</p>
                      <p className="font-mono text-xs">{transaction.from.substring(0, 10)}...</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">To</p>
                      <p className="font-mono text-xs">{transaction.to.substring(0, 10)}...</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Confirmations</p>
                      <p className="font-semibold">{transaction.confirmations}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Transaction Hash</p>
                    <p className="font-mono text-xs bg-gray-100 p-2 rounded break-all">
                      {transaction.hash}
                    </p>
                  </div>

                  {transaction.gasFee && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Gas Fee:</span>
                        <span>{transaction.gasFee} {transaction.network === 'ethereum' ? 'ETH' : 'MATIC'}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {transactions.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions yet</h3>
                <p className="text-gray-600">Your transaction history will appear here once you start making payments.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CryptoPayments;