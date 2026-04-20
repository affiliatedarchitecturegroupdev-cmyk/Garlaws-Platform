'use client';

import { useState, useEffect, useCallback } from 'react';

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  paymentTerms: string;
  creditLimit: number;
  currentBalance: number;
  status: 'active' | 'inactive' | 'blacklisted';
  categories: string[];
  rating: number;
  leadTime: number; // in days
  lastOrderDate: string;
  totalOrders: number;
  totalOrderValue: number;
  onTimeDelivery: number; // percentage
  qualityRating: number; // percentage
}

interface SupplierManagerProps {
  tenantId?: string;
}

export default function SupplierManager({ tenantId = 'default' }: SupplierManagerProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'South Africa',
    paymentTerms: '30 days',
    creditLimit: 50000,
    categories: [] as string[],
    leadTime: 7
  });

  useEffect(() => {
    fetchSuppliers();
  }, [tenantId]);

  useEffect(() => {
    applyFilters();
  }, [suppliers, searchTerm, statusFilter, categoryFilter]);

  const fetchSuppliers = useCallback(async () => {
    try {
      const response = await fetch(`/api/supply-chain?action=suppliers&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        // Enhance suppliers with calculated metrics
        const enhancedSuppliers = data.data.map((supplier: any) => ({
          ...supplier,
          rating: calculateSupplierRating(supplier),
          onTimeDelivery: supplier.onTimeDelivery || 95,
          qualityRating: supplier.qualityRating || 90
        }));
        setSuppliers(enhancedSuppliers);
      }
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  const calculateSupplierRating = (supplier: any): number => {
    const deliveryScore = supplier.onTimeDelivery || 95;
    const qualityScore = supplier.qualityRating || 90;
    const totalOrders = supplier.totalOrders || 1;
    const recentActivity = supplier.lastOrderDate ?
      (new Date().getTime() - new Date(supplier.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24) < 30 : false;

    let rating = (deliveryScore + qualityScore) / 2;
    if (totalOrders > 10) rating += 5;
    if (recentActivity) rating += 5;
    if (supplier.status === 'active') rating += 5;

    return Math.min(Math.max(rating, 0), 100);
  };

  const applyFilters = useCallback(() => {
    let filtered = [...suppliers];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(supplier =>
        supplier.name.toLowerCase().includes(searchLower) ||
        supplier.contactPerson.toLowerCase().includes(searchLower) ||
        supplier.email.toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(supplier => supplier.status === statusFilter);
    }

    if (categoryFilter) {
      filtered = filtered.filter(supplier =>
        supplier.categories.includes(categoryFilter)
      );
    }

    setFilteredSuppliers(filtered);
  }, [suppliers, searchTerm, statusFilter, categoryFilter]);

  const addSupplier = async () => {
    if (!newSupplier.name || !newSupplier.email || !newSupplier.contactPerson) return;

    try {
      const response = await fetch('/api/supply-chain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_supplier',
          tenantId,
          ...newSupplier
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuppliers([...suppliers, data.data]);
        setShowAddForm(false);
        setNewSupplier({
          name: '',
          contactPerson: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          country: 'South Africa',
          paymentTerms: '30 days',
          creditLimit: 50000,
          categories: [],
          leadTime: 7
        });
      }
    } catch (error) {
      console.error('Failed to add supplier:', error);
    }
  };

  const updateSupplierStatus = async (supplierId: string, status: 'active' | 'inactive' | 'blacklisted') => {
    try {
      const response = await fetch('/api/supply-chain', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_supplier',
          tenantId,
          supplierId,
          updates: { status }
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuppliers(suppliers.map(s => s.id === supplierId ? data.data : s));
      }
    } catch (error) {
      console.error('Failed to update supplier status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'blacklisted': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 90) return 'text-green-600';
    if (rating >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Supplier Management Portal</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Add New Supplier
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="blacklisted">Blacklisted</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="tools">Tools</option>
            <option value="raw_materials">Raw Materials</option>
            <option value="packaging">Packaging</option>
          </select>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
              setCategoryFilter('');
            }}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Add Supplier Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Add New Supplier</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
              <input
                type="text"
                value={newSupplier.name}
                onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
              <input
                type="text"
                value={newSupplier.contactPerson}
                onChange={(e) => setNewSupplier({...newSupplier, contactPerson: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={newSupplier.email}
                onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={newSupplier.phone}
                onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={newSupplier.address}
                onChange={(e) => setNewSupplier({...newSupplier, address: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={newSupplier.city}
                onChange={(e) => setNewSupplier({...newSupplier, city: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input
                type="text"
                value={newSupplier.country}
                onChange={(e) => setNewSupplier({...newSupplier, country: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
              <select
                value={newSupplier.paymentTerms}
                onChange={(e) => setNewSupplier({...newSupplier, paymentTerms: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7 days">7 days</option>
                <option value="15 days">15 days</option>
                <option value="30 days">30 days</option>
                <option value="60 days">60 days</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Credit Limit (R)</label>
              <input
                type="number"
                value={newSupplier.creditLimit}
                onChange={(e) => setNewSupplier({...newSupplier, creditLimit: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lead Time (days)</label>
              <input
                type="number"
                value={newSupplier.leadTime}
                onChange={(e) => setNewSupplier({...newSupplier, leadTime: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                min="1"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Categories</label>
              <div className="flex flex-wrap gap-2">
                {['electronics', 'clothing', 'tools', 'raw_materials', 'packaging'].map(category => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newSupplier.categories.includes(category)}
                      onChange={(e) => {
                        const updatedCategories = e.target.checked
                          ? [...newSupplier.categories, category]
                          : newSupplier.categories.filter(c => c !== category);
                        setNewSupplier({...newSupplier, categories: updatedCategories});
                      }}
                      className="mr-2"
                    />
                    {category.replace('_', ' ')}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 flex space-x-3">
            <button
              onClick={addSupplier}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Add Supplier
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map((supplier) => (
          <div
            key={supplier.id}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedSupplier(supplier)}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{supplier.name}</h3>
                <p className="text-sm text-gray-600">{supplier.contactPerson}</p>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(supplier.status)}`}>
                {supplier.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Email:</span>
                <span className="text-gray-900">{supplier.email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Phone:</span>
                <span className="text-gray-900">{supplier.phone}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Rating:</span>
                <span className={`font-medium ${getRatingColor(supplier.rating)}`}>
                  {supplier.rating.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Lead Time:</span>
                <span className="text-gray-900">{supplier.leadTime} days</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSupplier(supplier);
                }}
                className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                View Details
              </button>
              <select
                value={supplier.status}
                onChange={(e) => updateSupplierStatus(supplier.id, e.target.value as any)}
                className="px-2 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="blacklisted">Blacklist</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* Supplier Details Modal */}
      {selectedSupplier && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">{selectedSupplier.name}</h3>
              <button
                onClick={() => setSelectedSupplier(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold mb-3">Contact Information</h4>
                <div className="space-y-2">
                  <div><strong>Contact:</strong> {selectedSupplier.contactPerson}</div>
                  <div><strong>Email:</strong> {selectedSupplier.email}</div>
                  <div><strong>Phone:</strong> {selectedSupplier.phone}</div>
                  <div><strong>Address:</strong> {selectedSupplier.address}, {selectedSupplier.city}, {selectedSupplier.country}</div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-3">Business Details</h4>
                <div className="space-y-2">
                  <div><strong>Payment Terms:</strong> {selectedSupplier.paymentTerms}</div>
                  <div><strong>Credit Limit:</strong> R{selectedSupplier.creditLimit.toLocaleString()}</div>
                  <div><strong>Current Balance:</strong> R{selectedSupplier.currentBalance?.toLocaleString() || '0'}</div>
                  <div><strong>Lead Time:</strong> {selectedSupplier.leadTime} days</div>
                  <div><strong>Categories:</strong> {selectedSupplier.categories.join(', ')}</div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-3">Performance Metrics</h4>
                <div className="space-y-2">
                  <div><strong>Rating:</strong> <span className={getRatingColor(selectedSupplier.rating)}>{selectedSupplier.rating.toFixed(1)}%</span></div>
                  <div><strong>On-Time Delivery:</strong> {selectedSupplier.onTimeDelivery}%</div>
                  <div><strong>Quality Rating:</strong> {selectedSupplier.qualityRating}%</div>
                  <div><strong>Total Orders:</strong> {selectedSupplier.totalOrders || 0}</div>
                  <div><strong>Total Value:</strong> R{(selectedSupplier.totalOrderValue || 0).toLocaleString()}</div>
                  <div><strong>Last Order:</strong> {selectedSupplier.lastOrderDate ? new Date(selectedSupplier.lastOrderDate).toLocaleDateString() : 'Never'}</div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <button className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                    Create Purchase Order
                  </button>
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    View Order History
                  </button>
                  <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                    Update Performance
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedSupplier(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}