'use client';

export default function ReferPage() {
  const referralCode = 'GARLAWS2026';
  const referralLink = `https://garlaws.co.za/ref/${referralCode}`;

  return (
    <main className="min-h-screen bg-garlaws-light text-garlaws-black">
      {/* Header */}
      <header className="bg-garlaws-black py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold text-garlaws-gold mb-2">Refer & Earn</h1>
          <p className="text-garlaws-slate text-lg">Share Garlaws with friends - you both earn R500 credit!</p>
        </div>
      </header>

      {/* How it Works */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Share Your Link', desc: 'Send your unique referral link to friends' },
              { step: '2', title: 'Friend Signs Up', desc: 'They create an account using your link' },
              { step: '3', title: 'You Both Earn', desc: 'Get R500 credit after their first service' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-garlaws-olive text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-garlaws-slate mt-2">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Referral Code */}
      <section className="py-12 px-6 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Your Referral Code</h2>
          <div className="bg-garlaws-black rounded-xl p-8 text-center">
            <p className="text-garlaws-slate mb-4">Share this code:</p>
            <p className="text-4xl font-bold text-garlaws-gold mb-6 tracking-wider">{referralCode}</p>
            <p className="text-garlaws-slate mb-4">Or share this link:</p>
            <p className="text-garlaws-slate text-sm break-all bg-garlaws-navy p-3 rounded">{referralLink}</p>
            <button 
              onClick={() => navigator.clipboard.writeText(referralLink)}
              className="mt-6 px-6 py-3 bg-garlaws-gold text-garlaws-black font-semibold rounded-lg hover:opacity-90"
            >
              Copy Link
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 bg-garlaws-navy text-white mb-12">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-4xl font-bold text-garlaws-gold">127</p>
            <p className="text-garlaws-slate">Friends Invited</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-garlaws-gold">R 63,500</p>
            <p className="text-garlaws-slate">Total Earned</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-garlaws-gold">89</p>
            <p className="text-garlaws-slate">Successful Referrals</p>
          </div>
        </div>
      </section>

      <div className="text-center pb-8">
        <a href="/" className="text-garlaws-slate hover:text-garlaws-gold">← Back to Home</a>
      </div>
    </main>
  );
}