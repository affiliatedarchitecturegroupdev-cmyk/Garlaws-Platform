'use client';

import { useState } from 'react';
import { serviceTypes, type ServiceBooking } from './booking.types';

export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    address: '',
    date: '',
    time: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Service request submitted!\n\nService: ${selectedService}\nAddress: ${formData.address}\nDate: ${formData.date} at ${formData.time}`);
  };

  return (
    <main className="min-h-screen bg-garlaws-light text-garlaws-black">
      {/* Header */}
      <header className="bg-garlaws-black py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold text-garlaws-gold mb-2">Garlaws On-Demand</h1>
          <p className="text-garlaws-slate">Uber-style dispatch • Real-time tracking</p>
        </div>
      </header>

      {/* Service Selection */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Select a Service</h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            {serviceTypes.map((service) => (
              <button
                key={service.id}
                onClick={() => setSelectedService(service.id)}
                className={`p-6 rounded-xl text-left transition-all ${
                  selectedService === service.id
                    ? 'bg-garlaws-olive text-white ring-4 ring-garlaws-gold'
                    : 'bg-white hover:shadow-lg'
                }`}
              >
                <div className="text-4xl mb-3">{service.icon}</div>
                <h3 className="font-semibold">{service.name}</h3>
                <p className="text-sm opacity-80 mt-1">{service.description}</p>
                <p className={`font-bold mt-2 ${selectedService === service.id ? 'text-garlaws-gold' : 'text-garlaws-olive'}`}>
                  R {service.basePrice}
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Form */}
      {selectedService && (
        <section className="py-8 px-6 bg-white mb-12">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Book Your Service</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Property Address</label>
                <input
                  type="text"
                  required
                  className="w-full p-3 border border-garlaws-slate/30 rounded-lg focus:ring-2 focus:ring-garlaws-olive"
                  placeholder="Enter your property address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <input
                    type="date"
                    required
                    className="w-full p-3 border border-garlaws-slate/30 rounded-lg"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Time</label>
                  <select
                    required
                    className="w-full p-3 border border-garlaws-slate/30 rounded-lg"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  >
                    <option value="">Select time</option>
                    <option value="08:00">08:00 - 10:00</option>
                    <option value="10:00">10:00 - 12:00</option>
                    <option value="14:00">14:00 - 16:00</option>
                    <option value="16:00">16:00 - 18:00</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Additional Notes (Optional)</label>
                <textarea
                  className="w-full p-3 border border-garlaws-slate/30 rounded-lg"
                  rows={3}
                  placeholder="Any special instructions..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-garlaws-gold text-garlaws-black font-bold rounded-lg hover:opacity-90 transition-all"
              >
                Confirm Booking
              </button>
            </form>
          </div>
        </section>
      )}

      {/* Crew Status */}
      <section className="py-8 px-6 bg-garlaws-navy text-white mb-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Available Crew</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { name: 'Team Alpha', status: 'Available', rating: 4.9 },
              { name: 'Team Beta', status: 'Available', rating: 4.8 },
              { name: 'Team Gamma', status: 'En Route', rating: 4.7 },
            ].map((crew, i) => (
              <div key={i} className="bg-garlaws-black/50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{crew.name}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    crew.status === 'Available' ? 'bg-green-500' : 'bg-yellow-500'
                  }`}>
                    {crew.status}
                  </span>
                </div>
                <p className="text-sm text-garlaws-slate mt-2">⭐ {crew.rating} rating</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Back Link */}
      <div className="text-center pb-8">
        <a href="/" className="text-garlaws-slate hover:text-garlaws-gold">← Back to Home</a>
      </div>
    </main>
  );
}