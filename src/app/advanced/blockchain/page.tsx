"use client";

import { useState } from "react";

const tokenizedProperties = [
  { id: "PROP-001", name: "Sunset Villa Estate", location: "Cape Town", tokens: 10000, price: "R4.2M", status: "Live" },
  { id: "PROP-002", name: "Harbour View Complex", location: "Durban", tokens: 25000, price: "R12.8M", status: "Live" },
  { id: "PROP-003", name: "Johannesburg Business Hub", location: "Johannesburg", tokens: 50000, price: "R35M", status: "Pending" },
];

export default function BlockchainPage() {
  const [selectedProp, setSelectedProp] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white">
      <div className="bg-gradient-to-r from-[#1f2833] to-[#2d3b2d] py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-[#c5a059] mb-4">Property Tokenization</h1>
          <p className="text-xl text-[#45a29e]">Blockchain-powered fractional ownership for South African properties</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-[#c5a059] mb-2">R52M</div>
            <div className="text-[#45a29e]">Total Tokenized Value</div>
          </div>
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-[#c5a059] mb-2">2</div>
            <div className="text-[#45a29e]">Active Property Pools</div>
          </div>
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-[#c5a059] mb-2">847</div>
            <div className="text-[#45a29e]">Token Holders</div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-[#c5a059] mb-6">Available Property Tokens</h2>
        <div className="space-y-4">
          {tokenizedProperties.map((prop) => (
            <div
              key={prop.id}
              onClick={() => setSelectedProp(prop.id)}
              className={`bg-[#1f2833] p-6 rounded-lg border cursor-pointer transition-all ${
                selectedProp === prop.id ? "border-[#c5a059]" : "border-[#45a29e]/30 hover:border-[#45a29e]"
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-white">{prop.name}</h3>
                  <p className="text-[#45a29e]">{prop.location}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#c5a059]">{prop.price}</div>
                  <span className={`px-3 py-1 rounded text-sm ${prop.status === "Live" ? "bg-green-900 text-green-400" : "bg-yellow-900 text-yellow-400"}`}>
                    {prop.status}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex gap-4 text-sm text-gray-400">
                <span>Tokens: {prop.tokens.toLocaleString()}</span>
                <span>Min. Investment: R500</span>
                <span>Yield: 8.5% p.a.</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-[#2d3b2d] p-6 rounded-lg border border-[#c5a059]/30">
          <h3 className="text-xl font-bold text-[#c5a059] mb-4">How It Works</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#1f2833] rounded-full flex items-center justify-center mx-auto mb-3 text-[#c5a059] font-bold">1</div>
              <p className="text-sm">Select Property</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#1f2833] rounded-full flex items-center justify-center mx-auto mb-3 text-[#c5a059] font-bold">2</div>
              <p className="text-sm">Purchase Tokens</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#1f2833] rounded-full flex items-center justify-center mx-auto mb-3 text-[#c5a059] font-bold">3</div>
              <p className="text-sm">Receive Dividends</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#1f2833] rounded-full flex items-center justify-center mx-auto mb-3 text-[#c5a059] font-bold">4</div>
              <p className="text-sm">Trade on Secondary</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button className="bg-[#c5a059] text-[#0b0c10] px-6 py-3 rounded-lg font-bold hover:bg-[#b8954f] transition-colors">
            Start Investment
          </button>
          <button className="border border-[#45a29e] text-[#45a29e] px-6 py-3 rounded-lg font-bold hover:bg-[#45a29e]/10 transition-colors">
            View Smart Contract
          </button>
        </div>
      </div>
    </div>
  );
}