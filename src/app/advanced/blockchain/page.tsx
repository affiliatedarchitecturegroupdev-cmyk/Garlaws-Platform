'use client';

const properties = [
  { id: ' PROP-001', name: 'Ballito Hills Villa', tokenPrice: 250000, tokens: 100, available: 45 },
  { id: 'PROP-002', name: 'Tinley Manor Estate', tokenPrice: 180000, tokens: 50, available: 12 },
  { id: 'PROP-003', name: 'Umhlanga Penthouse', tokenPrice: 320000, tokens: 75, available: 30 },
];

const transactions = [
  { hash: '0x7a3f...8b2c', type: 'Transfer', from: '0x1a2b...', to: '0x3c4d...', amount: '5 GAR', time: '2 hours ago' },
  { hash: '0x8b4g...9c3d', type: 'Purchase', from: '0x5e6f...', to: 'Contract', amount: '10 GAR', time: '5 hours ago' },
];

export default function BlockchainPage() {
  return (
    <main className="min-h-screen bg-garlaws-light text-garlaws-black">
      <header className="bg-garlaws-black py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold text-garlaws-gold mb-2">Blockchain & Web3</h1>
          <p className="text-garlaws-slate">Property tokenization & smart contracts</p>
        </div>
      </header>

      {/* Blockchain Stats */}
      <section className="py-8 px-6 bg-garlaws-olive text-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-3xl font-bold">3</p>
            <p className="text-sm opacity-80">Properties</p>
          </div>
          <div>
            <p className="text-3xl font-bold">1,247</p>
            <p className="text-sm opacity-80">Token Holders</p>
          </div>
          <div>
            <p className="text-3xl font-bold">R 2.4M</p>
            <p className="text-sm opacity-80">Tokenized Value</p>
          </div>
          <div>
            <p className="text-3xl font-bold">98.7%</p>
            <p className="text-sm opacity-80">Verification Rate</p>
          </div>
        </div>
      </section>

      {/* Property Tokens */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Available Property Tokens</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {properties.map((prop) => (
              <div key={prop.id} className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="font-semibold text-lg mb-2">{prop.name}</h3>
                <p className="text-garlaws-slate text-sm mb-4">{prop.id}</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-garlaws-olive font-bold">R {prop.tokenPrice.toLocaleString()}</span>
                  <span className="text-garlaws-slate text-sm">{prop.tokens} tokens each</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div className="bg-garlaws-olive h-2 rounded-full" style={{ width: `${(prop.available / prop.tokens) * 100}%` }} />
                </div>
                <p className="text-sm text-garlaws-slate">{prop.available} tokens available</p>
                <button className="w-full mt-4 py-2 bg-garlaws-gold text-garlaws-black font-semibold rounded-lg hover:opacity-90">
                  Purchase Tokens
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Transactions */}
      <section className="py-8 px-6 bg-white mb-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Recent Blockchain Transactions</h2>
          <div className="space-y-4">
            {transactions.map((tx, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-garlaws-light rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">🔗</span>
                  <div>
                    <p className="font-semibold">{tx.type}</p>
                    <p className="text-xs text-garlaws-slate">{tx.hash}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-garlaws-olive">{tx.amount}</p>
                  <p className="text-xs text-garlaws-slate">{tx.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="text-center pb-8">
        <a href="/" className="text-garlaws-slate hover:text-garlaws-gold">← Back to Home</a>
      </div>
    </main>
  );
}