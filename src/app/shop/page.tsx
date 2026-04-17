export default function ShopPage() {
  const products = [
    { id: 1, name: 'Indigenous Fern Bundle', category: 'Plants', price: 450 },
    { id: 2, name: 'Terracotta Planter Large', category: 'Pottery', price: 890 },
    { id: 3, name: 'Electric Pruning Shears', category: 'Equipment', price: 2500 },
    { id: 4, name: 'Garden Tool Set', category: 'Tools', price: 1200 },
    { id: 5, name: 'Aloe Vera Collection', category: 'Plants', price: 350 },
    { id: 6, name: 'Ceramic Pot Medium', category: 'Pottery', price: 450 },
    { id: 7, name: 'Smart Irrigation Kit', category: 'Irrigation', price: 4500 },
    { id: 8, name: 'Indigenous Flower Seeds', category: 'Plants', price: 180 },
  ];

  const categories = ['All', 'Plants', 'Pottery', 'Equipment', 'Tools', 'Irrigation'];

  return (
    <main className="min-h-screen bg-garlaws-light text-garlaws-black">
      {/* Header */}
      <header className="bg-garlaws-black py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold text-garlaws-gold mb-2">Garlaws Store</h1>
          <p className="text-garlaws-slate">Premium Gardening & Landscaping Products</p>
        </div>
      </header>

      {/* Categories */}
      <nav className="bg-white shadow-sm py-4">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap gap-2 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`px-4 py-2 rounded-lg transition-all ${
                cat === 'All'
                  ? 'bg-garlaws-olive text-white'
                  : 'border border-garlaws-slate text-garlaws-slate hover:bg-garlaws-slate/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </nav>

      {/* Products Grid */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="h-40 bg-garlaws-navy flex items-center justify-center">
                  <span className="text-garlaws-slate/60 text-sm">{product.category}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-garlaws-black mb-2">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-garlaws-gold">
                      R {product.price.toLocaleString()}
                    </span>
                    <button className="px-4 py-2 bg-garlaws-olive text-white rounded-lg hover:bg-garlaws-black transition-colors text-sm">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Back to Home */}
      <div className="text-center py-8">
        <a
          href="/"
          className="inline-block px-6 py-3 border border-garlaws-slate text-garlaws-slate rounded-lg hover:bg-garlaws-slate/10 transition-colors"
        >
          ← Back to Home
        </a>
      </div>
    </main>
  );
}