'use client';

import { useState } from 'react';
import { paymentGateways, transactionHistory } from './payment.types';
import CryptoPayments from '@/features/crypto-payments/CryptoPayments';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { CreditCard, Bitcoin } from 'lucide-react';

export default function PaymentPage() {
  const [activeTab, setActiveTab] = useState<'traditional' | 'crypto'>('traditional');

  return (
    <main className="min-h-screen bg-garlaws-light text-garlaws-black">
      {/* Header */}
      <header className="bg-garlaws-black py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold text-garlaws-gold mb-2">Payment Methods</h1>
          <p className="text-garlaws-slate">Secure checkout with traditional and cryptocurrency payments</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="traditional" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Traditional Payments
            </TabsTrigger>
            <TabsTrigger value="crypto" className="flex items-center gap-2">
              <Bitcoin className="h-4 w-4" />
              Cryptocurrency
            </TabsTrigger>
          </TabsList>

          <TabsContent value="traditional">
            <div className="space-y-12">
              {/* Payment Gateways */}
              <section>
                <h2 className="text-2xl font-bold mb-6">Available Payment Options</h2>
                <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {paymentGateways.map((gateway) => (
                    <div
                      key={gateway.id}
                      className={`p-6 rounded-xl text-center ${
                        gateway.status === 'active'
                          ? 'bg-white hover:shadow-lg cursor-pointer'
                          : 'bg-gray-100 opacity-60'
                      }`}
                    >
                      <div className="text-4xl mb-3">{gateway.logo}</div>
                      <h3 className="font-semibold">{gateway.name}</h3>
                      <p className="text-xs text-garlaws-slate mt-1 capitalize">{gateway.type}</p>
                      {gateway.status === 'coming_soon' && (
                        <span className="inline-block mt-2 px-2 py-1 bg-garlaws-gold/20 text-garlaws-gold text-xs rounded">
                          Coming Soon
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Transaction History */}
              <section className="bg-white p-8 rounded-lg">
                <h2 className="text-2xl font-bold mb-6">Recent Transactions</h2>
                <div className="space-y-4">
                  {transactionHistory.map((txn) => (
                    <div key={txn.id} className="flex items-center justify-between p-4 border border-garlaws-slate/20 rounded-lg">
                      <div>
                        <p className="font-semibold">R {txn.amount.toLocaleString()}</p>
                        <p className="text-sm text-garlaws-slate">{txn.gateway} • {txn.createdAt}</p>
                      </div>
                      <span className={`px-3 py-1 rounded text-sm ${
                        txn.status === 'completed' ? 'bg-green-100 text-green-800' :
                        txn.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {txn.status}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Security Notice */}
              <section className="bg-garlaws-navy text-white p-8 rounded-lg text-center">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="text-xl font-bold mb-2">Secure Payments</h3>
                <p className="text-garlaws-slate">
                  All transactions are encrypted and processed via PCI-DSS compliant gateways.
                  We support 3D Secure for additional protection.
                </p>
              </section>
            </div>
          </TabsContent>

          <TabsContent value="crypto">
            <CryptoPayments
              onPaymentReceived={(transaction) => console.log('Payment received:', transaction)}
              onWalletConnected={(wallet) => console.log('Wallet connected:', wallet)}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Back Link */}
      <div className="text-center pb-8">
        <a href="/" className="text-garlaws-slate hover:text-garlaws-gold">← Back to Home</a>
      </div>
    </main>
  );
}