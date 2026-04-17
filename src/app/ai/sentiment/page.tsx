'use client';

const feedbackData = [
  { id: 1, source: 'Google Review', sentiment: 'positive', text: 'Excellent service! The team was punctual and professional.', score: 95 },
  { id: 2, source: 'WhatsApp', sentiment: 'neutral', text: 'Service was okay, but delivery was slightly late.', score: 65 },
  { id: 3, source: 'Email', sentiment: 'negative', text: 'Disappointed with the quality of plants delivered.', score: 35 },
  { id: 4, source: 'Survey', sentiment: 'positive', text: 'Best landscaping service in KZN! Highly recommend.', score: 98 },
];

export default function SentimentPage() {
  const positiveCount = feedbackData.filter(f => f.sentiment === 'positive').length;
  const negativeCount = feedbackData.filter(f => f.sentiment === 'negative').length;
  const avgScore = Math.round(feedbackData.reduce((a, b) => a + b.score, 0) / feedbackData.length);

  return (
    <main className="min-h-screen bg-garlaws-light text-garlaws-black">
      <header className="bg-garlaws-black py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold text-garlaws-gold mb-2">NLP Sentiment Analysis</h1>
          <p className="text-garlaws-slate">AI-powered customer feedback analysis</p>
        </div>
      </header>

      {/* Stats */}
      <section className="py-8 px-6 bg-garlaws-olive text-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-3xl font-bold">{avgScore}%</p>
            <p className="text-sm opacity-80">Avg Score</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-green-300">{positiveCount}</p>
            <p className="text-sm opacity-80">Positive</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-red-300">{negativeCount}</p>
            <p className="text-sm opacity-80">Negative</p>
          </div>
          <div>
            <p className="text-3xl font-bold">24/7</p>
            <p className="text-sm opacity-80">Analysis Active</p>
          </div>
        </div>
      </section>

      {/* Feedback Analysis */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Recent Feedback Analysis</h2>
          <div className="space-y-4">
            {feedbackData.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-garlaws-slate">{item.source}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        item.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                        item.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.sentiment}
                      </span>
                    </div>
                    <p className="text-garlaws-black">{item.text}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-2xl font-bold text-garlaws-gold">{item.score}</p>
                    <p className="text-xs text-garlaws-slate">score</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Keywords */}
      <section className="py-8 px-6 bg-garlaws-navy text-white mb-12">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl font-bold mb-4">Trending Topics</h3>
          <div className="flex flex-wrap gap-2">
            {['Excellent Service', 'Professional', 'Punctual', 'Quality Plants', 'Delivery Time', 'Pricing'].map((tag, i) => (
              <span key={i} className="px-3 py-1 bg-garlaws-gold/20 text-garlaws-gold rounded-full text-sm">
                {tag}
              </span>
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