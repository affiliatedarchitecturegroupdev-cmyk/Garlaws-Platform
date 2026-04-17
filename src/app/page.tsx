export default function Home() {
  return (
    <main className="min-h-screen bg-garlaws-black text-garlaws-light">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #c5a059 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-garlaws-black/50 to-garlaws-black"></div>
        
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          {/* Logo */}
          <div className="mb-8">
            <span className="text-garlaws-gold text-sm tracking-[0.3em] uppercase">Garlaws (Pty) Ltd</span>
          </div>
          
          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6">
            <span className="gold-gradient">GARLAWS</span>
          </h1>
          
          {/* Tagline */}
          <p className="text-xl md:text-2xl text-garlaws-slate mb-4 font-light">
            Property Lifecycle Maintenance Orchestration Ecosystem
          </p>
          
          {/* DBM Model */}
          <p className="text-lg text-garlaws-olive mb-12">
            Design • Build • Maintain
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="/shop" className="px-8 py-4 bg-garlaws-gold text-garlaws-black font-semibold rounded-lg hover:opacity-90 transition-all animate-pulse-gold text-center">
              Browse Shop
            </a>
            <a href="/services" className="px-8 py-4 border border-garlaws-slate text-garlaws-slate rounded-lg hover:bg-garlaws-slate/10 transition-all text-center">
              Our Services
            </a>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <div className="w-6 h-10 border-2 border-garlaws-gold/50 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-garlaws-gold rounded-full animate-pulse"></div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-24 px-6 bg-garlaws-charcoal">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            <span className="gold-gradient">World-Class Solutions</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'E-Commerce', desc: 'Shop plants, pottery & equipment', icon: '🛒', link: '/shop' },
              { title: 'On-Demand', desc: 'Book immediate services', icon: '🚛', link: '/services' },
              { title: 'Payments', desc: 'Billing & transactions', icon: '💳', link: '/payment' }
            ].map((feature, i) => (
              <a key={i} href={feature.link} className="p-8 bg-garlaws-navy/50 rounded-xl border border-garlaws-slate/20 card-hover gradient-border block">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-garlaws-gold mb-3">{feature.title}</h3>
                <p className="text-garlaws-slate/80">{feature.desc}</p>
              </a>
            ))}
          </div>

          {/* Second Row */}
          <div className="grid md:grid-cols-3 gap-8 mt-8">
            {[
              { title: 'Refer & Earn', desc: 'Invite friends, earn credits', icon: '🎁', link: '/refer' },
              { title: 'Logistics', desc: 'Track your orders', icon: '📦', link: '/logistics' },
              { title: 'Integrations', desc: 'API & third-party tools', icon: '🔗', link: '/integrations' }
            ].map((feature, i) => (
              <a key={i} href={feature.link} className="p-8 bg-garlaws-navy/50 rounded-xl border border-garlaws-slate/20 card-hover gradient-border block">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-garlaws-gold mb-3">{feature.title}</h3>
                <p className="text-garlaws-slate/80">{feature.desc}</p>
              </a>
            ))}
          </div>

          {/* AI Section */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-center mb-8 text-garlaws-gold">🤖 AI & Machine Learning</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: 'Predictive Maintenance', desc: 'AI equipment health monitoring', icon: '🔮', link: '/ai/predictive' },
                { title: 'Sentiment Analysis', desc: 'NLP customer feedback analysis', icon: '💭', link: '/ai/sentiment' },
                { title: 'Drone Inspection', desc: 'Computer vision site analysis', icon: '🚁', link: '/ai/drone' }
              ].map((feature, i) => (
                <a key={i} href={feature.link} className="p-8 bg-garlaws-navy/50 rounded-xl border border-garlaws-slate/20 card-hover gradient-border block">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-garlaws-gold mb-3">{feature.title}</h3>
                  <p className="text-garlaws-slate/80">{feature.desc}</p>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '80%+', label: 'Electric Equipment' },
              { value: 'Level 2', label: 'B-BBEE Status' },
              { value: '15%', label: 'SARS VAT' },
              { value: '100%', label: 'POPIA Compliant' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-garlaws-gold mb-2">{stat.value}</div>
                <div className="text-garlaws-slate/60 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 px-6 border-t border-garlaws-navy">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-garlaws-slate/60 text-sm">
            © 2026 Garlaws (Pty) Ltd • Subsidiary of Affiliated Architecture Group (AAG)
          </p>
          <p className="text-garlaws-slate/40 text-xs mt-2">
            KwaZulu-Natal, South Africa
          </p>
        </div>
      </footer>
    </main>
  );
}