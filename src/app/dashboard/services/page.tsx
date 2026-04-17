"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth-context";

interface Service {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  duration: number;
  isActive: boolean;
  createdAt: string;
}

export default function ServicesPage() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "maintenance",
    price: "",
    duration: "",
  });

  useEffect(() => {
    if (user?.role === "service_provider") {
      fetchServices();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchServices = async () => {
    try {
      // In a real app, this would fetch from API
      // For now, we'll simulate data
      const mockServices: Service[] = [
        {
          id: 1,
          name: "Garden Maintenance",
          description: "Complete garden care including mowing, trimming, and weeding",
          category: "maintenance",
          price: 850.00,
          duration: 120,
          isActive: true,
          createdAt: "2026-01-15",
        },
        {
          id: 2,
          name: "Pool Cleaning",
          description: "Professional pool cleaning and chemical balancing",
          category: "cleaning",
          price: 650.00,
          duration: 90,
          isActive: true,
          createdAt: "2026-01-20",
        },
        {
          id: 3,
          name: "Landscaping Design",
          description: "Custom landscape design and planning services",
          category: "landscaping",
          price: 2200.00,
          duration: 240,
          isActive: false,
          createdAt: "2026-02-01",
        },
      ];

      setServices(mockServices);
    } catch (error) {
      console.error("Failed to fetch services:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // In a real app, this would call the API
      const newService: Service = {
        id: Date.now(), // Temporary ID
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0],
      };

      setServices(prev => [...prev, newService]);
      setFormData({
        name: "",
        description: "",
        category: "maintenance",
        price: "",
        duration: "",
      });
      setShowAddForm(false);

    } catch (error) {
      console.error("Failed to add service:", error);
    }
  };

  const toggleServiceStatus = (serviceId: number) => {
    setServices(prev => prev.map(service =>
      service.id === serviceId
        ? { ...service, isActive: !service.isActive }
        : service
    ));
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "maintenance": return "bg-blue-100 text-blue-800";
      case "repair": return "bg-red-100 text-red-800";
      case "cleaning": return "bg-green-100 text-green-800";
      case "landscaping": return "bg-yellow-100 text-yellow-800";
      case "security": return "bg-purple-100 text-purple-800";
      case "utilities": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (user?.role !== "service_provider") {
    return (
      <DashboardLayout activeTab="services">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-6xl mb-4">🔧</div>
            <h2 className="text-2xl font-bold text-[#c5a059] mb-2">Access Restricted</h2>
            <p className="text-[#45a29e]">
              This section is only available for service providers.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout activeTab="services">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-2xl font-bold text-[#c5a059] mb-2">Loading Services...</h2>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab="services">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Services</h1>
            <p className="text-[#45a29e]">
              Manage your service offerings and pricing
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="mt-4 sm:mt-0 px-6 py-3 bg-[#c5a059] text-[#0b0c10] rounded-lg font-bold hover:bg-[#b8954f] transition-colors"
          >
            {showAddForm ? "Cancel" : "+ Add Service"}
          </button>
        </div>

        {/* Add Service Form */}
        {showAddForm && (
          <div className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-6">Add New Service</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[#45a29e] text-sm font-medium mb-2">
                    Service Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg p-4 text-white focus:border-[#c5a059] focus:outline-none transition-colors"
                    placeholder="e.g., Garden Maintenance"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#45a29e] text-sm font-medium mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg p-4 text-white focus:border-[#c5a059] focus:outline-none transition-colors"
                  >
                    <option value="maintenance">Maintenance</option>
                    <option value="repair">Repair</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="landscaping">Landscaping</option>
                    <option value="security">Security</option>
                    <option value="utilities">Utilities</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#45a29e] text-sm font-medium mb-2">
                    Price (ZAR)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg p-4 text-white focus:border-[#c5a059] focus:outline-none transition-colors"
                    placeholder="850.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#45a29e] text-sm font-medium mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg p-4 text-white focus:border-[#c5a059] focus:outline-none transition-colors"
                    placeholder="120"
                    min="15"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[#45a29e] text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg p-4 text-white focus:border-[#c5a059] focus:outline-none transition-colors"
                    rows={3}
                    placeholder="Describe what this service includes..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-3 border border-[#45a29e]/40 text-[#45a29e] rounded-lg hover:bg-[#45a29e]/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#c5a059] text-[#0b0c10] rounded-lg font-bold hover:bg-[#b8954f] transition-colors"
                >
                  Add Service
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Services Grid */}
        {services.length === 0 ? (
          <div className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-12 text-center">
            <div className="text-6xl mb-4">🛠️</div>
            <h3 className="text-xl font-bold text-white mb-2">No services yet</h3>
            <p className="text-[#45a29e] mb-6">
              Add your first service to start accepting bookings.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-[#c5a059] text-[#0b0c10] rounded-lg font-bold hover:bg-[#b8954f] transition-colors"
            >
              Add Your First Service
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {services.map((service) => (
              <div key={service.id} className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-white">{service.name}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(service.category)}`}>
                        {service.category}
                      </span>
                    </div>
                    <p className="text-[#45a29e] text-sm mb-3">{service.description}</p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-[#45a29e]">Price:</span>
                        <span className="text-white ml-2 font-semibold">
                          R{service.price.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#45a29e]">Duration:</span>
                        <span className="text-white ml-2 font-semibold">
                          {Math.floor(service.duration / 60)}h {service.duration % 60}m
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="ml-4">
                    <button
                      onClick={() => toggleServiceStatus(service.id)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                        service.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {service.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-[#45a29e]/20 border border-[#45a29e]/40 text-[#45a29e] rounded-lg hover:bg-[#45a29e]/30 transition-colors text-sm">
                    Edit
                  </button>
                  <button className="flex-1 px-4 py-2 bg-[#c5a059] text-[#0b0c10] rounded-lg hover:bg-[#b8954f] transition-colors text-sm font-medium">
                    View Bookings
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}