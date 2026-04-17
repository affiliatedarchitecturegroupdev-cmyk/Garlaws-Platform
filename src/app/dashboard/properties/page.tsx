"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth-context";

interface Property {
  id: number;
  address: string;
  city: string;
  province: string;
  propertyType: string;
  size?: number;
  bedrooms?: number;
  bathrooms?: number;
  status: string;
  createdAt: string;
}

export default function PropertiesPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    address: "",
    city: "",
    province: "",
    postalCode: "",
    propertyType: "residential",
    size: "",
    bedrooms: "",
    bathrooms: "",
    description: "",
  });

  useEffect(() => {
    if (user?.role === "property_owner") {
      fetchProperties();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProperties = async () => {
    try {
      // In a real app, this would fetch from API
      // For now, we'll simulate data
      const mockProperties: Property[] = [
        {
          id: 1,
          address: "123 Main Street",
          city: "Johannesburg",
          province: "Gauteng",
          propertyType: "residential",
          size: 250,
          bedrooms: 3,
          bathrooms: 2,
          status: "active",
          createdAt: "2026-01-15",
        },
        {
          id: 2,
          address: "456 Oak Avenue",
          city: "Pretoria",
          province: "Gauteng",
          propertyType: "residential",
          size: 180,
          bedrooms: 2,
          bathrooms: 1,
          status: "active",
          createdAt: "2026-02-20",
        },
      ];

      setProperties(mockProperties);
    } catch (error) {
      console.error("Failed to fetch properties:", error);
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
      const newProperty: Property = {
        id: Date.now(), // Temporary ID
        address: formData.address,
        city: formData.city,
        province: formData.province,
        propertyType: formData.propertyType,
        size: formData.size ? parseFloat(formData.size) : undefined,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : undefined,
        status: "active",
        createdAt: new Date().toISOString().split('T')[0],
      };

      setProperties(prev => [...prev, newProperty]);
      setFormData({
        address: "",
        city: "",
        province: "",
        postalCode: "",
        propertyType: "residential",
        size: "",
        bedrooms: "",
        bathrooms: "",
        description: "",
      });
      setShowAddForm(false);

    } catch (error) {
      console.error("Failed to add property:", error);
    }
  };

  if (user?.role !== "property_owner") {
    return (
      <DashboardLayout activeTab="properties">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-6xl mb-4">🏠</div>
            <h2 className="text-2xl font-bold text-[#c5a059] mb-2">Access Restricted</h2>
            <p className="text-[#45a29e]">
              This section is only available for property owners.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout activeTab="properties">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-2xl font-bold text-[#c5a059] mb-2">Loading Properties...</h2>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab="properties">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Properties</h1>
            <p className="text-[#45a29e]">
              Manage your property portfolio
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="mt-4 sm:mt-0 px-6 py-3 bg-[#c5a059] text-[#0b0c10] rounded-lg font-bold hover:bg-[#b8954f] transition-colors"
          >
            {showAddForm ? "Cancel" : "+ Add Property"}
          </button>
        </div>

        {/* Add Property Form */}
        {showAddForm && (
          <div className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-6">Add New Property</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[#45a29e] text-sm font-medium mb-2">
                    Property Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg p-4 text-white focus:border-[#c5a059] focus:outline-none transition-colors"
                    placeholder="123 Main Street"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#45a29e] text-sm font-medium mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg p-4 text-white focus:border-[#c5a059] focus:outline-none transition-colors"
                    placeholder="Johannesburg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#45a29e] text-sm font-medium mb-2">
                    Province *
                  </label>
                  <select
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg p-4 text-white focus:border-[#c5a059] focus:outline-none transition-colors"
                    required
                  >
                    <option value="">Select Province</option>
                    <option value="Eastern Cape">Eastern Cape</option>
                    <option value="Free State">Free State</option>
                    <option value="Gauteng">Gauteng</option>
                    <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                    <option value="Limpopo">Limpopo</option>
                    <option value="Mpumalanga">Mpumalanga</option>
                    <option value="Northern Cape">Northern Cape</option>
                    <option value="North West">North West</option>
                    <option value="Western Cape">Western Cape</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#45a29e] text-sm font-medium mb-2">
                    Property Type
                  </label>
                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleInputChange}
                    className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg p-4 text-white focus:border-[#c5a059] focus:outline-none transition-colors"
                  >
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="industrial">Industrial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#45a29e] text-sm font-medium mb-2">
                    Size (m²)
                  </label>
                  <input
                    type="number"
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg p-4 text-white focus:border-[#c5a059] focus:outline-none transition-colors"
                    placeholder="250"
                  />
                </div>

                <div>
                  <label className="block text-[#45a29e] text-sm font-medium mb-2">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg p-4 text-white focus:border-[#c5a059] focus:outline-none transition-colors"
                    placeholder="3"
                  />
                </div>

                <div>
                  <label className="block text-[#45a29e] text-sm font-medium mb-2">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg p-4 text-white focus:border-[#c5a059] focus:outline-none transition-colors"
                    placeholder="2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#45a29e] text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg p-4 text-white focus:border-[#c5a059] focus:outline-none transition-colors"
                  rows={3}
                  placeholder="Additional property details..."
                />
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
                  Add Property
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Properties List */}
        {properties.length === 0 ? (
          <div className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-12 text-center">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-bold text-white mb-2">No properties yet</h3>
            <p className="text-[#45a29e] mb-6">
              Add your first property to start booking services.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-[#c5a059] text-[#0b0c10] rounded-lg font-bold hover:bg-[#b8954f] transition-colors"
            >
              Add Your First Property
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {properties.map((property) => (
              <div key={property.id} className="bg-[#1f2833] rounded-xl border border-[#45a29e]/20 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{property.address}</h3>
                    <p className="text-[#45a29e]">{property.city}, {property.province}</p>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    property.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {property.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-[#45a29e]">Type:</span>
                    <span className="text-white ml-2 capitalize">{property.propertyType}</span>
                  </div>
                  {property.size && (
                    <div>
                      <span className="text-[#45a29e]">Size:</span>
                      <span className="text-white ml-2">{property.size} m²</span>
                    </div>
                  )}
                  {property.bedrooms && (
                    <div>
                      <span className="text-[#45a29e]">Bedrooms:</span>
                      <span className="text-white ml-2">{property.bedrooms}</span>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div>
                      <span className="text-[#45a29e]">Bathrooms:</span>
                      <span className="text-white ml-2">{property.bathrooms}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-[#45a29e]/20 border border-[#45a29e]/40 text-[#45a29e] rounded-lg hover:bg-[#45a29e]/30 transition-colors text-sm">
                    Edit
                  </button>
                  <button className="flex-1 px-4 py-2 bg-[#c5a059] text-[#0b0c10] rounded-lg hover:bg-[#b8954f] transition-colors text-sm font-medium">
                    Book Service
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