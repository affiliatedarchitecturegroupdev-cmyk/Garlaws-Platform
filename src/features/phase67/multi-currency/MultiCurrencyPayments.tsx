'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Euro, Globe, TrendingUp, RefreshCw, Settings } from 'lucide-react';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  exchangeRate: number; // Base rate against USD
  lastUpdated: Date;
  supported: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'bank' | 'wallet' | 'crypto';
  regions: string[];
  currencies: string[];
  fees: {
    percentage: number;
    fixed: number;
  };
  processingTime: string;
  status: 'active' | 'maintenance' | 'disabled';
}

export interface PaymentTransaction {
  id: string;
  amount: number;
  currency: string;
  convertedAmount: number;
  convertedCurrency: string;
  exchangeRate: number;
  method: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  timestamp: Date;
  region: string;
  fees: number;
}

const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', exchangeRate: 1.0, lastUpdated: new Date(), supported: true },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', exchangeRate: 0.85, lastUpdated: new Date(), supported: true },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧', exchangeRate: 0.73, lastUpdated: new Date(), supported: true },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵', exchangeRate: 110.5, lastUpdated: new Date(), supported: true },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳', exchangeRate: 6.45, lastUpdated: new Date(), supported: true },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳', exchangeRate: 75.2, lastUpdated: new Date(), supported: true },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷', exchangeRate: 4.95, lastUpdated: new Date(), supported: true },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦', exchangeRate: 14.8, lastUpdated: new Date(), supported: true },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺', exchangeRate: 1.35, lastUpdated: new Date(), supported: true },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦', exchangeRate: 1.25, lastUpdated: new Date(), supported: true },
];

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'stripe-card',
    name: 'Credit/Debit Card (Stripe)',
    type: 'card',
    regions: ['US', 'EU', 'GB', 'CA', 'AU'],
    currencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
    fees: { percentage: 2.9, fixed: 0.30 },
    processingTime: 'Instant',
    status: 'active'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    type: 'wallet',
    regions: ['US', 'EU', 'GB', 'CA', 'AU', 'JP'],
    currencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'],
    fees: { percentage: 2.9, fixed: 0.49 },
    processingTime: '1-3 business days',
    status: 'active'
  },
  {
    id: 'alipay',
    name: 'Alipay',
    type: 'wallet',
    regions: ['CN'],
    currencies: ['CNY'],
    fees: { percentage: 1.5, fixed: 0.00 },
    processingTime: 'Instant',
    status: 'active'
  },
  {
    id: 'pix',
    name: 'PIX',
    type: 'bank',
    regions: ['BR'],
    currencies: ['BRL'],
    fees: { percentage: 0.0, fixed: 0.00 },
    processingTime: 'Instant',
    status: 'active'
  },
  {
    id: 'paytm',
    name: 'Paytm',
    type: 'wallet',
    regions: ['IN'],
    currencies: ['INR'],
    fees: { percentage: 2.0, fixed: 0.00 },
    processingTime: 'Instant',
    status: 'active'
  },
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    type: 'crypto',
    regions: ['Global'],
    currencies: ['BTC'],
    fees: { percentage: 1.0, fixed: 0.00 },
    processingTime: '10-60 minutes',
    status: 'active'
  },
];

export const MultiCurrencyPayments: React.FC = () => {
  const [currencies, setCurrencies] = useState<Currency[]>(SUPPORTED_CURRENCIES);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(PAYMENT_METHODS);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [selectedTab, setSelectedTab] = useState<'currencies' | 'methods' | 'transactions'>('currencies');
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [amount, setAmount] = useState<string>('100');
  const [targetCurrency, setTargetCurrency] = useState<string>('EUR');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
      case 'processing':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
      case 'disabled':
        return 'text-red-600 bg-red-100';
      case 'maintenance':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'card':
        return <CreditCard className="w-4 h-4" />;
      case 'bank':
        return <DollarSign className="w-4 h-4" />;
      case 'wallet':
        return <Globe className="w-4 h-4" />;
      case 'crypto':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const convertCurrency = (amount: number, from: string, to: string): number => {
    const fromRate = currencies.find(c => c.code === from)?.exchangeRate || 1;
    const toRate = currencies.find(c => c.code === to)?.exchangeRate || 1;
    return (amount / fromRate) * toRate;
  };

  const refreshExchangeRates = async () => {
    // Simulate API call to refresh exchange rates
    setCurrencies(prev => prev.map(currency => ({
      ...currency,
      exchangeRate: currency.exchangeRate * (0.98 + Math.random() * 0.04), // Random variation
      lastUpdated: new Date()
    })));
  };

  const processPayment = async (amount: number, currency: string, methodId: string) => {
    const method = paymentMethods.find(m => m.id === methodId);
    if (!method) return;

    const exchangeRate = currencies.find(c => c.code === currency)?.exchangeRate || 1;
    const convertedAmount = amount;
    const fees = (amount * method.fees.percentage / 100) + method.fees.fixed;

    const transaction: PaymentTransaction = {
      id: `txn-${Date.now()}`,
      amount,
      currency,
      convertedAmount,
      convertedCurrency: currency,
      exchangeRate,
      method: method.name,
      status: 'pending',
      timestamp: new Date(),
      region: method.regions[0],
      fees
    };

    setTransactions(prev => [transaction, ...prev]);

    // Simulate processing
    setTimeout(() => {
      setTransactions(prev => prev.map(t =>
        t.id === transaction.id
          ? { ...t, status: Math.random() > 0.1 ? 'completed' : 'failed' }
          : t
      ));
    }, 2000);
  };

  const baseCurrencyData = currencies.find(c => c.code === baseCurrency);
  const targetCurrencyData = currencies.find(c => c.code === targetCurrency);
  const convertedAmount = amount ? convertCurrency(parseFloat(amount), baseCurrency, targetCurrency) : 0;

  const totalVolume = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const successRate = transactions.length > 0
    ? (transactions.filter(t => t.status === 'completed').length / transactions.length) * 100
    : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Multi-Currency Payments</h1>
              <p className="text-gray-600">Real-time exchange rates and regional payment processing</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={refreshExchangeRates}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Rates</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Volume (30d)</p>
              <p className="text-2xl font-bold text-gray-900">${totalVolume.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Supported Currencies</p>
              <p className="text-2xl font-bold text-gray-900">{currencies.filter(c => c.supported).length}</p>
            </div>
            <Globe className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{successRate.toFixed(1)}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Currency Converter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Currency Converter</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Currency</label>
            <select
              value={baseCurrency}
              onChange={(e) => setBaseCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {currencies.filter(c => c.supported).map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.flag} {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter amount"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Currency</label>
            <select
              value={targetCurrency}
              onChange={(e) => setTargetCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {currencies.filter(c => c.supported).map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.flag} {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-600">Converted Amount:</span>
              <span className="text-lg font-semibold text-gray-900 ml-2">
                {targetCurrencyData?.symbol}{convertedAmount.toFixed(2)} {targetCurrency}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Exchange Rate: 1 {baseCurrency} = {(targetCurrencyData?.exchangeRate || 1) / (baseCurrencyData?.exchangeRate || 1)} {targetCurrency}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setSelectedTab('currencies')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedTab === 'currencies'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Currencies
            </button>
            <button
              onClick={() => setSelectedTab('methods')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedTab === 'methods'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Payment Methods
            </button>
            <button
              onClick={() => setSelectedTab('transactions')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedTab === 'transactions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Transactions
            </button>
          </nav>
        </div>

        <div className="p-6">
          {selectedTab === 'currencies' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Supported Currencies</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Add Currency
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currencies.map((currency) => (
                  <div key={currency.code} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{currency.flag}</span>
                        <div>
                          <span className="font-medium text-gray-900">{currency.code}</span>
                          <span className="text-sm text-gray-500 ml-1">{currency.symbol}</span>
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        currency.supported ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {currency.supported ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="text-gray-900">{currency.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rate (USD):</span>
                        <span className="text-gray-900">{currency.exchangeRate.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Updated:</span>
                        <span className="text-gray-900">{currency.lastUpdated.toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'methods' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Add Method
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Regions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fees
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Processing
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paymentMethods.map((method) => (
                      <tr key={method.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            {getTypeIcon(method.type)}
                            <div>
                              <div className="text-sm font-medium text-gray-900">{method.name}</div>
                              <div className="text-sm text-gray-500">{method.currencies.join(', ')}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                            {method.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {method.regions.join(', ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {method.fees.percentage}% + {method.fees.fixed}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {method.processingTime}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(method.status)}`}>
                            {method.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => processPayment(100, 'USD', method.id)}
                            disabled={method.status !== 'active'}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                          >
                            Test Payment
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedTab === 'transactions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Export Report
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transaction
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Region
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                          No transactions yet. Test a payment method to see transactions here.
                        </td>
                      </tr>
                    ) : (
                      transactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {transaction.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {currencies.find(c => c.code === transaction.currency)?.symbol}
                            {transaction.amount.toFixed(2)} {transaction.currency}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transaction.method}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                              {transaction.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transaction.region}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {transaction.timestamp.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultiCurrencyPayments;