'use client';

import { useState, useEffect, useCallback } from 'react';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  reorderPoint: number;
  maxStock: number;
  unitCost: number;
  unitPrice: number;
  warehouseId: string;
  warehouseName: string;
  supplierId: string;
  supplierName: string;
  lastRestocked: string;
  expiryDate?: string;
  location: string;
  status: 'active' | 'discontinued' | 'low_stock' | 'out_of_stock';
}

interface InventoryFilters {
  category: string;
  warehouse: string;
  status: string;
  supplier: string;
  search: string;
}

interface InventoryManagerProps {
  tenantId?: string;
}

export default function InventoryManager({ tenantId = 'default' }: InventoryManagerProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [filters, setFilters] = useState<InventoryFilters>({
    category: '',
    warehouse: '',
    status: '',
    supplier: '',
    search: ''
  });
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  const [newItem, setNewItem] = useState({
    sku: '',
    name: '',
    description: '',
    category: '',
    currentStock: 0,
    reorderPoint: 10,
    maxStock: 100,
    unitCost: 0,
    unitPrice: 0,
    warehouseId: '',
    supplierId: '',
    location: '',
    expiryDate: ''
  });

  useEffect(() => {
    fetchInventory();
    fetchWarehouses();
    fetchSuppliers();
  }, [tenantId]);

  useEffect(() => {
    applyFilters();
  }, [inventory, filters]);

  const fetchInventory = useCallback(async () => {
    try {
      const response = await fetch(`/api/supply-chain?action=inventory&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        const itemsWithStatus = data.data.map((item: any) => ({
          ...item,
          status: getItemStatus(item),
          availableStock: item.currentStock - (item.reservedStock || 0)
        }));
        setInventory(itemsWithStatus);
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  const fetchWarehouses = useCallback(async () => {
    try {
      const response = await fetch(`/api/supply-chain?action=warehouses&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setWarehouses(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch warehouses:', error);
    }
  }, [tenantId]);

  const fetchSuppliers = useCallback(async () => {
    try {
      const response = await fetch(`/api/supply-chain?action=suppliers&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setSuppliers(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    }
  }, [tenantId]);

  const getItemStatus = (item: any): 'active' | 'discontinued' | 'low_stock' | 'out_of_stock' => {
    if (item.currentStock === 0) return 'out_of_stock';
    if (item.currentStock <= item.reorderPoint) return 'low_stock';
    return 'active';
  };

  const applyFilters = useCallback(() => {
    let filtered = [...inventory];

    if (filters.category) {
      filtered = filtered.filter(item => item.category === filters.category);
    }
    if (filters.warehouse) {
      filtered = filtered.filter(item => item.warehouseId === filters.warehouse);
    }
    if (filters.status) {
      filtered = filtered.filter(item => item.status === filters.status);
    }
    if (filters.supplier) {
      filtered = filtered.filter(item => item.supplierId === filters.supplier);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchLower) ||
        item.sku.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower)
      );
    }

    setFilteredInventory(filtered);
  }, [inventory, filters]);

  const addInventoryItem = async () => {
    if (!newItem.sku || !newItem.name || !newItem.warehouseId || !newItem.supplierId) return;

    try {
      const response = await fetch('/api/supply-chain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_inventory_item',
          tenantId,
          ...newItem
        })
      });

      const data = await response.json();
      if (data.success) {
        setInventory([...inventory, data.data]);
        setShowAddForm(false);
        setNewItem({
          sku: '',
          name: '',
          description: '',
          category: '',
          currentStock: 0,
          reorderPoint: 10,
          maxStock: 100,
          unitCost: 0,
          unitPrice: 0,
          warehouseId: '',
          supplierId: '',
          location: '',
          expiryDate: ''
        });
      }
    } catch (error) {
      console.error('Failed to add inventory item:', error);
    }
  };

  const updateStock = async (itemId: string, quantity: number, movementType: 'inbound' | 'outbound') => {
    try {
      const response = await fetch('/api/supply-chain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_inventory',
          tenantId,
          itemId,
          quantity,
          movementType,
          reason: 'Manual adjustment',
          performedBy: 'admin'
        })
      });

      const data = await response.json();
      if (data.success) {
        fetchInventory(); // Refresh inventory
      }
    } catch (error) {
      console.error('Failed to update stock:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'low_stock': return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
        <h2 className="text-2xl font-bold text-gray-900">Advanced Inventory Management</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Add New Item
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Search items..."
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <select
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="tools">Tools</option>
            <option value="raw_materials">Raw Materials</option>
          </select>
          <select
            value={filters.warehouse}
            onChange={(e) => setFilters({...filters, warehouse: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Warehouses</option>
            {warehouses.map(wh => (
              <option key={wh.id} value={wh.id}>{wh.name}</option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
          <select
            value={filters.supplier}
            onChange={(e) => setFilters({...filters, supplier: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Suppliers</option>
            {suppliers.map(supp => (
              <option key={supp.id} value={supp.id}>{supp.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Add Item Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Add New Inventory Item</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
              <input
                type="text"
                value={newItem.sku}
                onChange={(e) => setNewItem({...newItem, sku: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={newItem.name}
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Category</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="tools">Tools</option>
                <option value="raw_materials">Raw Materials</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse *</label>
              <select
                value={newItem.warehouseId}
                onChange={(e) => setNewItem({...newItem, warehouseId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Warehouse</option>
                {warehouses.map(wh => (
                  <option key={wh.id} value={wh.id}>{wh.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
              <select
                value={newItem.supplierId}
                onChange={(e) => setNewItem({...newItem, supplierId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Supplier</option>
                {suppliers.map(supp => (
                  <option key={supp.id} value={supp.id}>{supp.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={newItem.location}
                onChange={(e) => setNewItem({...newItem, location: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Aisle 5, Shelf B"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock</label>
              <input
                type="number"
                value={newItem.currentStock}
                onChange={(e) => setNewItem({...newItem, currentStock: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Point</label>
              <input
                type="number"
                value={newItem.reorderPoint}
                onChange={(e) => setNewItem({...newItem, reorderPoint: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Stock</label>
              <input
                type="number"
                value={newItem.maxStock}
                onChange={(e) => setNewItem({...newItem, maxStock: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost (R)</label>
              <input
                type="number"
                value={newItem.unitCost}
                onChange={(e) => setNewItem({...newItem, unitCost: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (R)</label>
              <input
                type="number"
                value={newItem.unitPrice}
                onChange={(e) => setNewItem({...newItem, unitPrice: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <div className="mt-4 flex space-x-3">
            <button
              onClick={addInventoryItem}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Add Item
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

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500">{item.sku}</div>
                      <div className="text-xs text-gray-400">{item.category}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.currentStock} / {item.maxStock}
                    </div>
                    <div className="text-xs text-gray-500">
                      Available: {item.availableStock}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.warehouseName}
                    <br />
                    <span className="text-xs text-gray-500">{item.location}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    R{(item.currentStock * item.unitCost).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateStock(item.id, 1, 'inbound')}
                        className="text-green-600 hover:text-green-900"
                      >
                        + Stock
                      </button>
                      <button
                        onClick={() => updateStock(item.id, 1, 'outbound')}
                        className="text-red-600 hover:text-red-900"
                        disabled={item.currentStock === 0}
                      >
                        - Stock
                      </button>
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{selectedItem.name}</h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>SKU:</strong> {selectedItem.sku}
              </div>
              <div>
                <strong>Category:</strong> {selectedItem.category}
              </div>
              <div>
                <strong>Current Stock:</strong> {selectedItem.currentStock}
              </div>
              <div>
                <strong>Available Stock:</strong> {selectedItem.availableStock}
              </div>
              <div>
                <strong>Reorder Point:</strong> {selectedItem.reorderPoint}
              </div>
              <div>
                <strong>Max Stock:</strong> {selectedItem.maxStock}
              </div>
              <div>
                <strong>Unit Cost:</strong> R{selectedItem.unitCost}
              </div>
              <div>
                <strong>Unit Price:</strong> R{selectedItem.unitPrice}
              </div>
              <div>
                <strong>Warehouse:</strong> {selectedItem.warehouseName}
              </div>
              <div>
                <strong>Location:</strong> {selectedItem.location}
              </div>
              <div>
                <strong>Supplier:</strong> {selectedItem.supplierName}
              </div>
              <div>
                <strong>Last Restocked:</strong> {new Date(selectedItem.lastRestocked).toLocaleDateString()}
              </div>
            </div>

            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedItem(null)}
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