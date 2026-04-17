'use client';

const designs = [
  { name: 'Modern Zen Garden', style: 'Japanese', plants: 12, estimated: 'R 45,000', image: '🎋' },
  { name: 'Indigenous Paradise', style: 'South African', plants: 24, estimated: 'R 68,000', image: '🌿' },
  { name: 'Tropical Oasis', style: 'Tropical', plants: 18, estimated: 'R 55,000', image: '🌴' },
];

const features = [
  { name: 'AI Plant Selection', desc: 'Recommends indigenous species for local climate' },
  { name: 'Cost Estimation', desc: 'Real-time pricing based on materials & labor' },
  { name: '3D Preview', desc: 'View design in AR before implementation' },
  { name: 'Season Planner', desc: 'Optimal planting times for KZN climate' },
];

export default function GenerativeDesignPage() {
  return (
    <main className="min-h-screen bg-garlaws-light text-garlaws-black">
      <header className="bg-garlaws-black py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold text-garlaws-gold mb-2">Generative Landscape Design AI</h1>
          <p className="text-garlaws-slate">AI-powered landscape design with intelligent recommendations</p>
        </div>
      </header>

      {/* AI Design Tools */}
      <section className="py-8 px-6 bg-garlaws-olive text-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-bold mb-6">🎨 AI Design Assistant</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {features.map((feature, i) => (
              <div key={i} className="bg-garlaws-black/50 p-4 rounded-lg text-left">
                <h3 className="font-semibold text-garlaws-gold">{feature.name}</h3>
                <p className="text-sm text-garlaws-slate mt-1">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Design Generator */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Generate Your Dream Garden</h2>
          <div className="bg-white p-8 rounded-xl shadow-md mb-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Plot Size (sq meters)</label>
                <input type="number" className="w-full p-3 border border-garlaws-slate/30 rounded-lg" placeholder="e.g., 500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Budget Range</label>
                <select className="w-full p-3 border border-garlaws-slate/30 rounded-lg">
                  <option>R 20,000 - R 50,000</option>
                  <option>R 50,000 - R 100,000</option>
                  <option>R 100,000 - R 250,000</option>
                  <option>R 250,000+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Style Preference</label>
                <select className="w-full p-3 border border-garlaws-slate/30 rounded-lg">
                  <option>Modern</option>
                  <option>Indigenous</option>
                  <option>Tropical</option>
                  <option>Japanese</option>
                  <option>Mediterranean</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Maintenance Level</label>
                <select className="w-full p-3 border border-garlaws-slate/30 rounded-lg">
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
            </div>
            <button className="w-full mt-6 py-4 bg-garlaws-gold text-garlaws-black font-bold rounded-lg hover:opacity-90">
              Generate AI Design
            </button>
          </div>
        </div>
      </section>

      {/* Generated Designs */}
      <section className="py-8 px-6 bg-white mb-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">AI-Generated Concept Designs</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {designs.map((design, i) => (
              <div key={i} className="border border-garlaws-slate/20 rounded-xl overflow-hidden">
                <div className="bg-garlaws-navy p-12 text-center text-6xl">
                  {design.image}
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-lg">{design.name}</h3>
                  <p className="text-sm text-garlaws-slate">{design.style} • {design.plants} plants</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="font-bold text-garlaws-olive">{design.estimated}</span>
                    <button className="px-4 py-2 bg-garlaws-black text-white rounded-lg text-sm">
                      View Details
                    </button>
                  </div>
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