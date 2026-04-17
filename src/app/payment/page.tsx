'use client';

import { paymentGateways, transactionHistory } from './payment.types';

export default function PaymentPage() {
  return (
    <main className="min-h-screen bg-garlaws-light text-garlaws-black">
      {/* Header */}
      <header className="bg-garlaws-black py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold text-garlaws-gold mb-2">Payment Methods</h1>
          <p className="text-garlaws-slate">Secure checkout with South African payment gateways</p>
        </div>
      </header>

      {/* Payment Gateways */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
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
        </div>
      </section>

      {/* Transaction History */}
      <section className="py-8 px-6 bg-white mb-12">
        <div className="max-w-4xl mx-auto">
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
        </div>
      </section>

      {/* Security Notice */}
      <section className="py-8 px-6 bg-garlaws-navy text-white mb-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h3 className="text-xl font-bold mb-2">Secure Payments</h3>
          <p className="text-garlaws-slate">
            All transactions are encrypted and processed via PCI-DSS compliant gateways.
            We support 3D Secure for additional protection.
          </p>
        </div>
      </section>

      {/* Back Link */}
      <div className="text-center pb-8">
        <a href="/" className="text-garlaws-slate hover:text-garlaws-gold">← Back to Home</a>
      </div>
    </main>
  );
}