'use client'

import { useState, useEffect, useMemo } from 'react'
import { CreditCard, Shield, Globe, DollarSign, AlertTriangle, CheckCircle, XCircle, Clock, TrendingUp, Users, Lock } from 'lucide-react'

// Types for global payments
interface PaymentTransaction {
  id: string
  transactionId: string
  amount: number
  currency: string
  convertedAmount?: number
  baseCurrency: string
  exchangeRate: number
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
  paymentMethod: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'crypto' | 'digital_wallet'
  gateway: string
  customerId: string
  customerName: string
  country: string
  riskScore: number
  fraudFlags: string[]
  createdAt: Date
  processedAt?: Date
}

interface PaymentGateway {
  id: string
  name: string
  type: 'card_processor' | 'digital_wallet' | 'bank_transfer' | 'crypto'
  supportedCurrencies: string[]
  supportedCountries: string[]
  fees: {
    percentage: number
    fixed: number
  }
  processingTime: string
  active: boolean
  reliability: number
}

interface CurrencyExchange {
  from: string
  to: string
  rate: number
  lastUpdated: Date
  spread: number
}

interface FraudAlert {
  id: string
  transactionId: string
  type: 'velocity_check' | 'location_anomaly' | 'amount_spike' | 'device_fingerprint'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  triggeredAt: Date
  resolved: boolean
}

export default function GlobalPayments() {
  // Sample payment transactions
  const [transactions] = useState<PaymentTransaction[]>([
    {
      id: '1',
      transactionId: 'TXN-2024-001',
      amount: 299.99,
      currency: 'USD',
      convertedAmount: 299.99,
      baseCurrency: 'USD',
      exchangeRate: 1.0,
      status: 'completed',
      paymentMethod: 'credit_card',
      gateway: 'Stripe',
      customerId: 'CUST-001',
      customerName: 'John Enterprise',
      country: 'US',
      riskScore: 15,
      fraudFlags: [],
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      processedAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
    },
    {
      id: '2',
      transactionId: 'TXN-2024-002',
      amount: 149.99,
      currency: 'EUR',
      convertedAmount: 162.49,
      baseCurrency: 'USD',
      exchangeRate: 1.082,
      status: 'processing',
      paymentMethod: 'paypal',
      gateway: 'PayPal',
      customerId: 'CUST-002',
      customerName: 'Marie Dubois',
      country: 'FR',
      riskScore: 25,
      fraudFlags: ['location_anomaly'],
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
      processedAt: new Date(Date.now() - 25 * 60 * 1000)
    },
    {
      id: '3',
      transactionId: 'TXN-2024-003',
      amount: 399.99,
      currency: 'GBP',
      convertedAmount: 503.99,
      baseCurrency: 'USD',
      exchangeRate: 1.26,
      status: 'pending',
      paymentMethod: 'bank_transfer',
      gateway: 'BankTransfer',
      customerId: 'CUST-003',
      customerName: 'David Thompson',
      country: 'GB',
      riskScore: 8,
      fraudFlags: [],
      createdAt: new Date(Date.now() - 15 * 60 * 1000)
    },
    {
      id: '4',
      transactionId: 'TXN-2024-004',
      amount: 199.99,
      currency: 'CAD',
      convertedAmount: 129.99,
      baseCurrency: 'USD',
      exchangeRate: 0.65,
      status: 'failed',
      paymentMethod: 'credit_card',
      gateway: 'Stripe',
      customerId: 'CUST-004',
      customerName: 'Sarah Chen',
      country: 'CA',
      riskScore: 85,
      fraudFlags: ['amount_spike', 'velocity_check'],
      createdAt: new Date(Date.now() - 45 * 60 * 1000),
      processedAt: new Date(Date.now() - 40 * 60 * 1000)
    }
  ])

  // Sample payment gateways
  const [gateways] = useState<PaymentGateway[]>([
    {
      id: 'stripe',
      name: 'Stripe',
      type: 'card_processor',
      supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'],
      supportedCountries: ['US', 'EU', 'GB', 'CA', 'AU', 'JP'],
      fees: { percentage: 2.9, fixed: 0.30 },
      processingTime: 'Instant',
      active: true,
      reliability: 99.9
    },
    {
      id: 'paypal',
      name: 'PayPal',
      type: 'digital_wallet',
      supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
      supportedCountries: ['US', 'EU', 'GB', 'CA', 'AU'],
      fees: { percentage: 2.9, fixed: 0.49 },
      processingTime: 'Instant',
      active: true,
      reliability: 99.5
    },
    {
      id: 'bank-transfer',
      name: 'Bank Transfer',
      type: 'bank_transfer',
      supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'],
      supportedCountries: ['Global'],
      fees: { percentage: 0, fixed: 0 },
      processingTime: '1-3 business days',
      active: true,
      reliability: 99.0
    },
    {
      id: 'crypto',
      name: 'Crypto Payments',
      type: 'crypto',
      supportedCurrencies: ['BTC', 'ETH', 'USDT', 'USDC'],
      supportedCountries: ['Global'],
      fees: { percentage: 1.5, fixed: 0 },
      processingTime: '10-60 minutes',
      active: true,
      reliability: 95.0
    }
  ])

  // Sample currency exchange rates
  const [exchangeRates] = useState<CurrencyExchange[]>([
    { from: 'EUR', to: 'USD', rate: 1.082, lastUpdated: new Date(), spread: 0.002 },
    { from: 'GBP', to: 'USD', rate: 1.26, lastUpdated: new Date(), spread: 0.003 },
    { from: 'CAD', to: 'USD', rate: 0.73, lastUpdated: new Date(), spread: 0.001 },
    { from: 'AUD', to: 'USD', rate: 0.65, lastUpdated: new Date(), spread: 0.002 },
    { from: 'JPY', to: 'USD', rate: 0.0067, lastUpdated: new Date(), spread: 0.0001 }
  ])

  // Sample fraud alerts
  const [fraudAlerts] = useState<FraudAlert[]>([
    {
      id: '1',
      transactionId: 'TXN-2024-004',
      type: 'amount_spike',
      severity: 'high',
      description: 'Unusual transaction amount compared to customer history',
      triggeredAt: new Date(Date.now() - 40 * 60 * 1000),
      resolved: false
    },
    {
      id: '2',
      transactionId: 'TXN-2024-002',
      type: 'location_anomaly',
      severity: 'medium',
      description: 'Transaction from unusual geographic location',
      triggeredAt: new Date(Date.now() - 25 * 60 * 1000),
      resolved: false
    }
  ])

  const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Calculate payment metrics
  const paymentMetrics = useMemo(() => {
    const totalTransactions = transactions.length
    const completedTransactions = transactions.filter(t => t.status === 'completed').length
    const failedTransactions = transactions.filter(t => t.status === 'failed').length
    const successRate = (completedTransactions / totalTransactions) * 100

    const totalVolume = transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + (t.convertedAmount || t.amount), 0)

    const averageTransaction = totalVolume / completedTransactions

    const highRiskTransactions = transactions.filter(t => t.riskScore > 70).length
    const fraudAttempts = fraudAlerts.length

    const currencies = [...new Set(transactions.map(t => t.currency))]
    const countries = [...new Set(transactions.map(t => t.country))]

    return {
      totalTransactions,
      completedTransactions,
      failedTransactions,
      successRate,
      totalVolume,
      averageTransaction,
      highRiskTransactions,
      fraudAttempts,
      currencies,
      countries
    }
  }, [transactions, fraudAlerts])

  const filteredTransactions = useMemo(() => {
    if (filterStatus === 'all') return transactions
    return transactions.filter(transaction => transaction.status === filterStatus)
  }, [transactions, filterStatus])

  const getStatusColor = (status: PaymentTransaction['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'refunded': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityColor = (severity: FraudAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3">
          <Globe className="w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold">Global Payments</h1>
            <p className="text-lg opacity-90">
              Multi-currency payment processing with advanced fraud detection and global gateway support
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-6 h-6 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{paymentMetrics.successRate.toFixed(1)}%</p>
            </div>
          </div>
          <div className="text-sm text-green-600 font-medium">Target: 98%</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-6 h-6 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Total Volume</p>
              <p className="text-2xl font-bold text-gray-900">${paymentMetrics.totalVolume.toLocaleString()}</p>
            </div>
          </div>
          <div className="text-sm text-green-600 font-medium">+15.2% vs last month</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-red-600" />
            <div>
              <p className="text-sm text-gray-600">Fraud Attempts</p>
              <p className="text-2xl font-bold text-gray-900">{paymentMetrics.fraudAttempts}</p>
            </div>
          </div>
          <div className="text-sm text-red-600 font-medium">Blocked automatically</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-6 h-6 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Supported Countries</p>
              <p className="text-2xl font-bold text-gray-900">{paymentMetrics.countries.length}</p>
            </div>
          </div>
          <div className="text-sm text-purple-600 font-medium">Global coverage</div>
        </div>
      </div>

      {/* Transaction Management */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Transaction Management</h2>
          <div className="flex items-center gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredTransactions.map(transaction => (
            <div key={transaction.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-gray-900">{transaction.transactionId}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                    {transaction.riskScore > 70 && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                        <AlertTriangle className="w-3 h-3" />
                        High Risk
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    {transaction.currency} {transaction.amount}
                    {transaction.convertedAmount && transaction.currency !== transaction.baseCurrency && (
                      <div className="text-sm text-gray-600">
                        ≈ {transaction.baseCurrency} {transaction.convertedAmount}
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">{transaction.customerName}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{transaction.country}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Risk: {transaction.riskScore}/100</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {transaction.createdAt.toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{transaction.gateway}</span>
                </div>
              </div>

              {transaction.fraudFlags.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium text-red-700">Fraud Flags:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {transaction.fraudFlags.map(flag => (
                      <span key={flag} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                        {flag.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {transaction.paymentMethod.replace('_', ' ')} • {transaction.currency !== transaction.baseCurrency ? `Exchange rate: ${transaction.exchangeRate}` : 'No conversion'}
                </div>
                <button
                  onClick={() => setSelectedTransaction(transaction)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Gateways & Currency Exchange */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Gateways</h3>
          <div className="space-y-4">
            {gateways.map(gateway => (
              <div key={gateway.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${gateway.active ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                    <div>
                      <h4 className="font-medium text-gray-900">{gateway.name}</h4>
                      <p className="text-sm text-gray-600">{gateway.type.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{gateway.reliability}%</div>
                    <div className="text-sm text-gray-600">uptime</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <div className="text-sm text-gray-600">Fees</div>
                    <div className="font-medium">{gateway.fees.percentage}% + ${gateway.fees.fixed}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Processing</div>
                    <div className="font-medium">{gateway.processingTime}</div>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <div className="mb-1">Currencies: {gateway.supportedCurrencies.join(', ')}</div>
                  <div>Countries: {gateway.supportedCountries.join(', ')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Currency Exchange Rates</h3>
          <div className="space-y-3">
            {exchangeRates.map(rate => (
              <div key={`${rate.from}-${rate.to}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="font-medium text-gray-900">{rate.from} → {rate.to}</div>
                  <div className="text-sm text-gray-600">Spread: {(rate.spread * 100).toFixed(3)}%</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{rate.rate.toFixed(4)}</div>
                  <div className="text-xs text-gray-500">
                    Updated {rate.lastUpdated.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              💱 Exchange rates updated in real-time with competitive spreads for optimal conversion.
            </p>
          </div>
        </div>
      </div>

      {/* Fraud Detection & Alerts */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Fraud Detection & Alerts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Active Alerts</h4>
            <div className="space-y-3">
              {fraudAlerts.map(alert => (
                <div key={alert.id} className="border border-red-200 bg-red-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    <span className="text-xs text-gray-500">
                      {alert.triggeredAt.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="font-medium text-gray-900 mb-1">{alert.type.replace('_', ' ')}</div>
                  <div className="text-sm text-gray-700 mb-2">{alert.description}</div>
                  <div className="text-xs text-gray-600">Transaction: {alert.transactionId}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Security Metrics</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">High Risk Transactions</span>
                <span className="font-semibold text-red-600">{paymentMetrics.highRiskTransactions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Fraud Prevention Rate</span>
                <span className="font-semibold text-green-600">98.7%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">False Positive Rate</span>
                <span className="font-semibold text-blue-600">2.1%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">AI Model Accuracy</span>
                <span className="font-semibold text-purple-600">94.5%</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-800">Advanced Protection Active</span>
              </div>
              <p className="text-sm text-green-700">
                AI-powered fraud detection with real-time monitoring and automated response systems.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Transaction Details</h3>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
                  <p className="text-gray-900 font-mono">{selectedTransaction.transactionId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTransaction.status)}`}>
                    {selectedTransaction.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <p className="text-gray-900 font-semibold">
                    {selectedTransaction.currency} {selectedTransaction.amount}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Converted Amount</label>
                  <p className="text-gray-900">
                    {selectedTransaction.convertedAmount
                      ? `${selectedTransaction.baseCurrency} ${selectedTransaction.convertedAmount}`
                      : 'N/A'
                    }
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                  <p className="text-gray-900">{selectedTransaction.paymentMethod.replace('_', ' ')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gateway</label>
                  <p className="text-gray-900">{selectedTransaction.gateway}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Risk Score</label>
                  <p className="text-gray-900">{selectedTransaction.riskScore}/100</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Country</label>
                  <p className="text-gray-900">{selectedTransaction.country}</p>
                </div>
              </div>

              {selectedTransaction.fraudFlags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fraud Flags</label>
                  <div className="flex flex-wrap gap-1">
                    {selectedTransaction.fraudFlags.map(flag => (
                      <span key={flag} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                        {flag.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created At</label>
                  <p className="text-gray-900">{selectedTransaction.createdAt.toLocaleString()}</p>
                </div>
                {selectedTransaction.processedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Processed At</label>
                    <p className="text-gray-900">{selectedTransaction.processedAt.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}