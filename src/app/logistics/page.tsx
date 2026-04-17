'use client';

const deliveryStatuses = [
  { id: 'ORD-001', item: 'Indigenous Fern Bundle', status: 'Out for Delivery', eta: '14:30 today' },
  { id: 'ORD-002', item: 'Terracotta Planter', status: 'Processing', eta: 'Tomorrow' },
  { id: 'ORD-003', item: 'Garden Tool Set', status: 'Delivered', eta: 'Yesterday' },
];

export default function LogisticsPage() {
  return (
    <main className="min-h-screen bg-garlaws-light text-garlaws-black">
      <header className="bg-garlaws-black py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold text-garlaws-gold mb-2">Order Tracking</h1>
          <p className="text-garlaws-slate">Real-time delivery tracking for your orders</p>
        </div>
      </header>

      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <input 
              type="text" 
              placeholder="Enter order number (e.g., ORD-001)"
              className="w-full p-4 border border-garlaws-slate/30 rounded-lg text-lg"
            />
          </div>

          <h2 className="text-2xl font-bold mb-6">Active Deliveries</h2>
          <div className="space-y-4">
            {deliveryStatuses.map((order) => (
              <div key={order.id} className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-bold text-lg">{order.item}</p>
                    <p className="text-garlaws-slate text-sm">{order.id}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    order.status === 'Out for Delivery' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
                {order.status !== 'Delivered' && (
                  <div className="flex items-center gap-2 text-garlaws-slate">
                    <span>🕐</span>
                    <span>ETA: {order.eta}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 px-6 bg-garlaws-navy text-white mb-12">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-xl font-bold mb-4">Delivery Partners</h3>
          <p className="text-garlaws-slate">We partner with trusted local couriers for reliable delivery across KwaZulu-Natal</p>
        </div>
      </section>

      <div className="text-center pb-8">
        <a href="/" className="text-garlaws-slate hover:text-garlaws-gold">← Back to Home</a>
      </div>
    </main>
  );
}