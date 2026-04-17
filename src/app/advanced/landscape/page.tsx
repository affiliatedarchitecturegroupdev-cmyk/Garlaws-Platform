"use client";

import { useState } from "react";

const designs = [
  { id: 1, name: "Modern Minimalist", style: "Contemporary", rooms: 4, image: "🪴" },
  { id: 2, name: "African Safari", style: "Organic", rooms: 3, image: "🌿" },
  { id: 3, name: "Mediterranean", style: "Classic", rooms: 5, image: "🌻" },
];

export default function LandscapePage() {
  const [selectedDesign, setSelectedDesign] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white">
      <div className="bg-gradient-to-r from-[#1f2833] to-[#2d3b2d] py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-[#c5a059] mb-4">Generative Landscape Design</h1>
          <p className="text-xl text-[#45a29e]">AI-powered garden design with 3D visualization</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-[#c5a059]">156</div>
            <div className="text-[#45a29e]">Designs Generated</div>
          </div>
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-[#c5a059]">98%</div>
            <div className="text-[#45a29e]">Client Satisfaction</div>
          </div>
          <div className="bg-[#1f2833] p-6 rounded-lg border border-[#45a29e]/30">
            <div className="text-3xl font-bold text-[#c5a059]">2.4K</div>
            <div className="text-[#45a29e]">Plants in Library</div>
          </div>
        </div>

        <div className="bg-[#1f2833] rounded-lg border border-[#45a29e]/30 p-6 mb-8">
          <h2 className="text-2xl font-bold text-[#c5a059] mb-4">Design Generator</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[#45a29e] mb-2">Property Size</label>
              <select className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg p-3 text-white">
                <option>Small (under 500m²)</option>
                <option>Medium (500-1500m²)</option>
                <option>Large (1500m²+)</option>
              </select>
            </div>
            <div>
              <label className="block text-[#45a29e] mb-2">Climate Zone</label>
              <select className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg p-3 text-white">
                <option>Mediterranean (Cape)</option>
                <option>Subtropical (Durban)</option>
                <option>Highland (Johannesburg)</option>
              </select>
            </div>
            <div>
              <label className="block text-[#45a29e] mb-2">Design Style</label>
              <select className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg p-3 text-white">
                <option>Modern Minimalist</option>
                <option>African Safari</option>
                <option>Mediterranean</option>
                <option>Japanese Zen</option>
              </select>
            </div>
            <div>
              <label className="block text-[#45a29e] mb-2">Budget Range</label>
              <select className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg p-3 text-white">
                <option>R50,000 - R100,000</option>
                <option>R100,000 - R250,000</option>
                <option>R250,000+</option>
              </select>
            </div>
          </div>
          <button className="mt-6 bg-[#c5a059] text-[#0b0c10] px-8 py-3 rounded-lg font-bold hover:bg-[#b8954f]">
            Generate Design
          </button>
        </div>

        <h3 className="text-xl font-bold text-[#c5a059] mb-4">Recent Designs</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {designs.map((design) => (
            <div
              key={design.id}
              onClick={() => setSelectedDesign(design.id)}
              className={`bg-[#1f2833] rounded-lg border overflow-hidden cursor-pointer transition-all ${
                selectedDesign === design.id ? "border-[#c5a059]" : "border-[#45a29e]/30 hover:border-[#45a29e]"
              }`}
            >
              <div className="h-48 bg-gradient-to-br from-[#2d3b2d] to-[#1f2833] flex items-center justify-center text-6xl">
                {design.image}
              </div>
              <div className="p-4">
                <div className="font-bold text-white">{design.name}</div>
                <div className="text-sm text-[#45a29e]">{design.style} • {design.rooms} zones</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-[#2d3b2d] p-6 rounded-lg border border-[#c5a059]/30">
          <h3 className="text-xl font-bold text-[#c5a059] mb-4">Features</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl mb-2">🎨</div>
              <div className="font-bold">Style Transfer</div>
              <div className="text-sm text-gray-400">Apply any aesthetic</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🌱</div>
              <div className="font-bold">Plant Recommendations</div>
              <div className="text-sm text-gray-400">SA-native species</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">💰</div>
              <div className="font-bold">Cost Estimation</div>
              <div className="text-sm text-gray-400">Material & labor</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}