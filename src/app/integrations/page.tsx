'use client';

const integrations = [
  { name: 'SendGrid', desc: 'Email notifications & marketing', icon: '📧', status: 'Connected' },
  { name: 'WhatsApp Business', desc: 'Customer messaging & alerts', icon: '💬', status: 'Connected' },
  { name: 'Mux', desc: 'Video streaming for AR/VR', icon: '🎬', status: 'Connected' },
  { name: 'Google Analytics 4', desc: 'Traffic & behavior analytics', icon: '📊', status: 'Connected' },
  { name: 'Twilio', desc: 'SMS notifications', icon: '📱', status: 'Coming Soon' },
  { name: 'Stripe', desc: 'International payments', icon: '💳', status: 'Coming Soon' },
];

export default function IntegrationsPage() {
  return (
    <main className="min-h-screen bg-garlaws-light text-garlaws-black">
      <header className="bg-garlaws-black py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold text-garlaws-gold mb-2">Integrations</h1>
          <p className="text-garlaws-slate">Third-party services powering the Garlaws ecosystem</p>
        </div>
      </header>

      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {integrations.map((integration, i) => (
              <div 
                key={i} 
                className={`p-6 rounded-xl ${
                  integration.status === 'Connected' ? 'bg-white' : 'bg-gray-100 opacity-70'
                }`}
              >
                <div className="text-4xl mb-4">{integration.icon}</div>
                <h3 className="font-semibold text-lg">{integration.name}</h3>
                <p className="text-garlaws-slate text-sm mt-1">{integration.desc}</p>
                <span className={`inline-block mt-4 px-3 py-1 rounded-full text-sm ${
                  integration.status === 'Connected' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-garlaws-gold/20 text-garlaws-gold'
                }`}>
                  {integration.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-6 bg-garlaws-navy text-white mb-12">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4">API Access</h3>
          <p className="text-garlaws-slate mb-6">
            Enterprise clients can access our REST API for custom integrations.
          </p>
          <button className="px-6 py-3 bg-garlaws-gold text-garlaws-black font-semibold rounded-lg">
            Request API Key
          </button>
        </div>
      </section>

      <div className="text-center pb-8">
        <a href="/" className="text-garlaws-slate hover:text-garlaws-gold">← Back to Home</a>
      </div>
    </main>
  );
}