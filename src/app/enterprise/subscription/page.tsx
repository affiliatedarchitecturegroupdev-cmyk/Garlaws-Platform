"use client";

const plans = [
  { name: "Starter", price: "R499", period: "/mo", features: ["5 Properties", "Basic Maintenance", "Email Support"], popular: false },
  { name: "Professional", price: "R1,299", period: "/mo", features: ["25 Properties", "AI Insights", "Priority Support", "Mobile App"], popular: true },
  { name: "Enterprise", price: "R3,499", period: "/mo", features: ["Unlimited Properties", "Full Suite", "Dedicated Manager", "API Access"], popular: false },
];

export default function SubscriptionPage() {
  return (
    <div className="min-h-screen bg-[#0b0c10] text-white">
      <div className="bg-gradient-to-r from-[#1f2833] to-[#2d3b2d] py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-[#c5a059] mb-4">Subscription SaaS</h1>
          <p className="text-xl text-[#45a29e]">Recurring revenue models for property management</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-[#c5a059]">847</div>
            <div className="text-[#45a29e]">Active Subscribers</div>
          </div>
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-[#c5a059]">R1.2M</div>
            <div className="text-[#45a29e]">Monthly Recurring Revenue</div>
          </div>
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-green-400">94%</div>
            <div className="text-[#45a29e]">Retention Rate</div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-[#c5a059] mb-4">Pricing Plans</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => (
            <div key={plan.name} className={`p-6 rounded-lg border ${plan.popular ? "border-[#c5a059] bg-[#2d3b2d]" : "border-[#45a29e]/30 bg-[#1f2833]"}`}>
              {plan.popular && <span className="bg-[#c5a059] text-[#0b0c10] px-2 py-1 rounded text-xs font-bold">POPULAR</span>}
              <h3 className="text-2xl font-bold text-white mt-3">{plan.name}</h3>
              <div className="mt-2">
                <span className="text-4xl font-bold text-[#c5a059]">{plan.price}</span>
                <span className="text-gray-400">{plan.period}</span>
              </div>
              <ul className="mt-4 space-y-2">
                {plan.features.map((f, i) => (
                  <li key={i} className="text-sm text-gray-300">✓ {f}</li>
                ))}
              </ul>
              <button className={`mt-6 w-full py-3 rounded-lg font-bold ${plan.popular ? "bg-[#c5a059] text-[#0b0c10]" : "border border-[#45a29e] text-[#45a29e]"}`}>
                Choose Plan
              </button>
            </div>
          ))}
        </div>

        <div className="bg-[#2d3b2d] p-6 rounded-lg border border-[#c5a059]/30">
          <h3 className="text-xl font-bold text-[#c5a059] mb-4">Revenue Metrics</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">R14.4M</div>
              <div className="text-sm text-gray-400">ARR</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">R1,420</div>
              <div className="text-sm text-gray-400">Avg LTV</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">R285</div>
              <div className="text-sm text-gray-400">CAC</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">5.0x</div>
              <div className="text-sm text-gray-400">LTV:CAC</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}