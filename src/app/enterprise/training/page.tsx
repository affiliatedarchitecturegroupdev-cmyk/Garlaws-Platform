"use client";

const resources = [
  { title: "Getting Started Guide", type: "Documentation", views: 1245 },
  { title: "Property Management 101", type: "Video Course", views: 892 },
  { title: "API Integration Guide", type: "Documentation", views: 456 },
  { title: "Mobile App Tutorial", type: "Video", views: 723 },
];

export default function TrainingPage() {
  return (
    <div className="min-h-screen bg-[#0b0c10] text-white">
      <div className="bg-gradient-to-r from-[#1f2833] to-[#2d3b2d] py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-[#c5a059] mb-4">User Training & Documentation</h1>
          <p className="text-xl text-[#45a29e]">Knowledge base, support & onboarding resources</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-[#c5a059]">3,456</div>
            <div className="text-[#45a29e]">Total Views</div>
          </div>
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-[#c5a059]">156</div>
            <div className="text-[#45a29e]">Articles</div>
          </div>
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-green-400">4.8/5</div>
            <div className="text-[#45a29e]">User Rating</div>
          </div>
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-[#c5a059]">24/7</div>
            <div className="text-[#45a29e]">Support Available</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[#c5a059] mb-4">Popular Resources</h2>
            <div className="space-y-3">
              {resources.map((r, i) => (
                <div key={i} className="bg-[#1f2833] p-4 rounded-lg border border-[#45a29e]/30 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white">{r.title}</div>
                    <div className="text-sm text-[#45a29e]">{r.type}</div>
                  </div>
                  <div className="text-gray-400">{r.views} views</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[#c5a059] mb-4">Support Channels</h2>
            <div className="space-y-3">
              <div className="bg-[#1f2833] p-4 rounded-lg border border-[#45a29e]/30">
                <div className="font-bold text-white">📧 Email Support</div>
                <div className="text-sm text-gray-400">support@garlaws.co.za</div>
                <div className="text-sm text-green-400">Avg response: 2 hours</div>
              </div>
              <div className="bg-[#1f2833] p-4 rounded-lg border border-[#45a29e]/30">
                <div className="font-bold text-white">💬 Live Chat</div>
                <div className="text-sm text-gray-400">Available 8am-6pm SAST</div>
                <div className="text-sm text-green-400">Avg wait: 3 min</div>
              </div>
              <div className="bg-[#1f2833] p-4 rounded-lg border border-[#45a29e]/30">
                <div className="font-bold text-white">📞 Phone Support</div>
                <div className="text-sm text-gray-400">+27 (0)31 123 4567</div>
                <div className="text-sm text-green-400">Priority for Enterprise</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#2d3b2d] p-6 rounded-lg border border-[#c5a059]/30">
          <h3 className="text-xl font-bold text-[#c5a059] mb-4">Knowledge Base Categories</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-[#1f2833] rounded-lg hover:bg-[#45a29e]/10 cursor-pointer">
              <div className="text-3xl mb-2">🏠</div>
              <div className="font-bold">Property Mgmt</div>
            </div>
            <div className="text-center p-4 bg-[#1f2833] rounded-lg hover:bg-[#45a29e]/10 cursor-pointer">
              <div className="text-3xl mb-2">🛒</div>
              <div className="font-bold">E-Commerce</div>
            </div>
            <div className="text-center p-4 bg-[#1f2833] rounded-lg hover:bg-[#45a29e]/10 cursor-pointer">
              <div className="text-3xl mb-2">💳</div>
              <div className="font-bold">Payments</div>
            </div>
            <div className="text-center p-4 bg-[#1f2833] rounded-lg hover:bg-[#45a29e]/10 cursor-pointer">
              <div className="text-3xl mb-2">🔧</div>
              <div className="font-bold">API Docs</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}