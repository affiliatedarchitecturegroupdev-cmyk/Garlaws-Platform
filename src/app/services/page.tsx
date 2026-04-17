'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { createBooking } from '@/lib/server-actions/bookings';
import { getServices } from '@/lib/server-actions/services';

interface Service {
  id: number;
  name: string;
  description: string;
  category: string;
  price?: number;
  duration?: number;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    propertyId: '',
    scheduledDate: '',
    notes: '',
  });

  useEffect(() => {
    const fetchServices = async () => {
      const result = await getServices();
      if (result.success) {
        setServices(result.services);
      } else {
        setError('Failed to load services');
      }
      setLoading(false);
    };

    fetchServices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    setBookingLoading(true);
    setError('');
    setSuccess('');

    try {
      const formDataObj = new FormData();
      formDataObj.append('serviceId', selectedService.toString());
      formDataObj.append('propertyId', formData.propertyId);
      formDataObj.append('scheduledDate', `${formData.scheduledDate}T10:00:00Z`); // Default to 10 AM
      formDataObj.append('notes', formData.notes);

      const result = await createBooking(formDataObj);

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess('Booking created successfully!');
        setFormData({ propertyId: '', scheduledDate: '', notes: '' });
        setSelectedService(null);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-[#c5a059] mb-2">Loading Services...</h2>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
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
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service.id)}
                  className={`p-6 rounded-xl text-left transition-all ${
                    selectedService === service.id
                      ? 'bg-garlaws-olive text-white ring-4 ring-garlaws-gold'
                      : 'bg-white hover:shadow-lg'
                  }`}
                >
                  <div className="text-4xl mb-3">🛠️</div>
                  <h3 className="font-semibold">{service.name}</h3>
                  <p className="text-sm opacity-80 mt-1">{service.description}</p>
                  <p className={`font-bold mt-2 ${selectedService === service.id ? 'text-garlaws-gold' : 'text-garlaws-olive'}`}>
                    R {service.price || 'TBD'}
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

              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Property ID</label>
                  <input
                    type="number"
                    required
                    className="w-full p-3 border border-garlaws-slate/30 rounded-lg focus:ring-2 focus:ring-garlaws-olive"
                    placeholder="Enter your property ID"
                    value={formData.propertyId}
                    onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Scheduled Date</label>
                  <input
                    type="date"
                    required
                    className="w-full p-3 border border-garlaws-slate/30 rounded-lg"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  />
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
                  disabled={bookingLoading}
                  className="w-full py-4 bg-garlaws-gold text-garlaws-black font-bold rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {bookingLoading ? 'Creating Booking...' : 'Confirm Booking'}
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
    </ProtectedRoute>
  );
}