'use client';

import { useState, useEffect, useCallback } from 'react';

interface Shipment {
  id: string;
  shipmentNumber: string;
  orderId: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  destination: string;
  items: ShipmentItem[];
  status: 'preparing' | 'ready' | 'shipped' | 'in_transit' | 'delivered' | 'delayed' | 'cancelled';
  carrier: string;
  trackingNumber: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  shippingCost: number;
  weight: number;
  dimensions: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface ShipmentItem {
  id: string;
  itemName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
}

interface LogisticsOptimizationProps {
  tenantId?: string;
}

export default function LogisticsOptimization({ tenantId = 'default' }: LogisticsOptimizationProps) {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [filteredShipments, setFilteredShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [optimizationResults, setOptimizationResults] = useState<any>(null);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const [newShipment, setNewShipment] = useState({
    orderId: '',
    supplierId: '',
    destination: '',
    carrier: '',
    estimatedDelivery: '',
    shippingCost: 0,
    weight: 0,
    dimensions: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    notes: '',
    items: [] as ShipmentItem[]
  });

  useEffect(() => {
    fetchShipments();
    fetchSuppliers();
    fetchWarehouses();
  }, [tenantId]);

  useEffect(() => {
    applyFilters();
  }, [shipments, statusFilter, priorityFilter]);

  const fetchShipments = useCallback(async () => {
    try {
      const response = await fetch(`/api/supply-chain?action=shipments&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setShipments(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch shipments:', error);
    } finally {
      setLoading(false);
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

  const applyFilters = useCallback(() => {
    let filtered = [...shipments];

    if (statusFilter) {
      filtered = filtered.filter(shipment => shipment.status === statusFilter);
    }

    if (priorityFilter) {
      filtered = filtered.filter(shipment => shipment.priority === priorityFilter);
    }

    setFilteredShipments(filtered);
  }, [shipments, statusFilter, priorityFilter]);

  const createShipment = async () => {
    if (!newShipment.orderId || !newShipment.supplierId || !newShipment.destination) return;

    try {
      const response = await fetch('/api/supply-chain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_shipment',
          tenantId,
          ...newShipment
        })
      });

      const data = await response.json();
      if (data.success) {
        setShipments([...shipments, data.data]);
        setShowCreateForm(false);
        setNewShipment({
          orderId: '',
          supplierId: '',
          destination: '',
          carrier: '',
          estimatedDelivery: '',
          shippingCost: 0,
          weight: 0,
          dimensions: '',
          priority: 'medium',
          notes: '',
          items: []
        });
      }
    } catch (error) {
      console.error('Failed to create shipment:', error);
    }
  };

  const updateShipmentStatus = async (shipmentId: string, status: string, updates: any = {}) => {
    try {
      const response = await fetch('/api/supply-chain', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_shipment_status',
          tenantId,
          shipmentId,
          status,
          ...updates
        })
      });

      const data = await response.json();
      if (data.success) {
        setShipments(shipments.map(s => s.id === shipmentId ? data.data : s));
      }
    } catch (error) {
      console.error('Failed to update shipment status:', error);
    }
  };

  const optimizeLogistics = async () => {
    try {
      // Get warehouse optimization data
      const optimizationPromises = warehouses.map(async (warehouse) => {
        const response = await fetch('/api/supply-chain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'optimize_warehouse',
            tenantId,
            warehouseId: warehouse.id
          })
        });
        const data = await response.json();
        return { warehouse: warehouse.name, ...data.data };
      });

      const results = await Promise.all(optimizationPromises);
      setOptimizationResults({
        timestamp: new Date(),
        warehouses: results,
        summary: {
          totalWarehouses: results.length,
          averageOptimizationScore: results.reduce((sum, r) => sum + (r.totalItems > 0 ? 85 : 100), 0) / results.length,
          recommendationsCount: results.reduce((sum, r) => sum + r.recommendations.length, 0)
        }
      });
    } catch (error) {
      console.error('Failed to optimize logistics:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparing': return 'bg-gray-100 text-gray-800';
      case 'ready': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'in_transit': return 'bg-yellow-100 text-yellow-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
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
        <h2 className="text-2xl font-bold text-gray-900">Logistics Optimization & Shipment Management</h2>
        <div className="flex space-x-3">
          <button
            onClick={optimizeLogistics}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Optimize Logistics
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Shipment
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="shipped">Shipped</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="delayed">Delayed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button
            onClick={() => {
              setStatusFilter('');
              setPriorityFilter('');
            }}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Optimization Results */}
      {optimizationResults && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Logistics Optimization Results</h3>
            <button
              onClick={() => setOptimizationResults(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{optimizationResults.summary.totalWarehouses}</div>
              <div className="text-sm text-gray-600">Warehouses Optimized</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{optimizationResults.summary.averageOptimizationScore.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Average Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{optimizationResults.summary.recommendationsCount}</div>
              <div className="text-sm text-gray-600">Recommendations</div>
            </div>
          </div>

          <div className="space-y-4">
            {optimizationResults.warehouses.map((result: any, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{result.warehouse}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <div className="text-sm text-gray-600">Items</div>
                    <div className="font-medium">{result.totalItems}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Value</div>
                    <div className="font-medium">R{result.totalValue.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Low Stock</div>
                    <div className="font-medium text-red-600">{result.lowStockItems}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Efficiency</div>
                    <div className="font-medium text-green-600">85%</div>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Recommendations:</div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {result.recommendations.map((rec: string, i: number) => (
                      <li key={i} className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Shipment Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Create New Shipment</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
              <select
                value={newShipment.supplierId}
                onChange={(e) => setNewShipment({...newShipment, supplierId: e.target.value})}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination *</label>
              <select
                value={newShipment.destination}
                onChange={(e) => setNewShipment({...newShipment, destination: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Destination</option>
                {warehouses.map(wh => (
                  <option key={wh.id} value={wh.id}>{wh.name} - {wh.address}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Carrier</label>
              <select
                value={newShipment.carrier}
                onChange={(e) => setNewShipment({...newShipment, carrier: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Carrier</option>
                <option value="dhl">DHL</option>
                <option value="fedex">FedEx</option>
                <option value="ups">UPS</option>
                <option value="aramex">Aramex</option>
                <option value="local_courier">Local Courier</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={newShipment.priority}
                onChange={(e) => setNewShipment({...newShipment, priority: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Delivery</label>
              <input
                type="datetime-local"
                value={newShipment.estimatedDelivery}
                onChange={(e) => setNewShipment({...newShipment, estimatedDelivery: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Cost (R)</label>
              <input
                type="number"
                value={newShipment.shippingCost}
                onChange={(e) => setNewShipment({...newShipment, shippingCost: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
              <input
                type="number"
                value={newShipment.weight}
                onChange={(e) => setNewShipment({...newShipment, weight: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                min="0"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dimensions (L×W×H cm)</label>
              <input
                type="text"
                value={newShipment.dimensions}
                onChange={(e) => setNewShipment({...newShipment, dimensions: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="30×20×15"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={newShipment.notes}
                onChange={(e) => setNewShipment({...newShipment, notes: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>
          </div>
          <div className="mt-4 flex space-x-3">
            <button
              onClick={createShipment}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              disabled={!newShipment.supplierId || !newShipment.destination}
            >
              Create Shipment
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Shipments List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shipment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carrier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredShipments.map((shipment) => (
                <tr key={shipment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{shipment.shipmentNumber}</div>
                      <div className="text-sm text-gray-500">{shipment.supplierName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {shipment.destination}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(shipment.status)}`}>
                      {shipment.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(shipment.priority)}`}>
                      {shipment.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {shipment.carrier || 'Not assigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(shipment.estimatedDelivery).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedShipment(shipment)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      {shipment.status === 'preparing' && (
                        <button
                          onClick={() => updateShipmentStatus(shipment.id, 'ready')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Ready
                        </button>
                      )}
                      {shipment.status === 'ready' && (
                        <button
                          onClick={() => updateShipmentStatus(shipment.id, 'shipped')}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          Ship
                        </button>
                      )}
                      {shipment.status === 'shipped' && (
                        <button
                          onClick={() => updateShipmentStatus(shipment.id, 'in_transit')}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          In Transit
                        </button>
                      )}
                      {(shipment.status === 'in_transit' || shipment.status === 'shipped') && (
                        <button
                          onClick={() => updateShipmentStatus(shipment.id, 'delivered', { actualDelivery: new Date().toISOString() })}
                          className="text-green-600 hover:text-green-900"
                        >
                          Delivered
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shipment Details Modal */}
      {selectedShipment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-4/5 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Shipment {selectedShipment.shipmentNumber}</h3>
              <button
                onClick={() => setSelectedShipment(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-lg font-semibold mb-3">Shipment Details</h4>
                <div className="space-y-2">
                  <div><strong>Status:</strong> <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedShipment.status)}`}>
                    {selectedShipment.status.replace('_', ' ')}
                  </span></div>
                  <div><strong>Priority:</strong> <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedShipment.priority)}`}>
                    {selectedShipment.priority}
                  </span></div>
                  <div><strong>Supplier:</strong> {selectedShipment.supplierName}</div>
                  <div><strong>Destination:</strong> {selectedShipment.destination}</div>
                  <div><strong>Carrier:</strong> {selectedShipment.carrier || 'Not assigned'}</div>
                  <div><strong>Tracking:</strong> {selectedShipment.trackingNumber || 'Not available'}</div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-3">Shipping Information</h4>
                <div className="space-y-2">
                  <div><strong>Estimated Delivery:</strong> {new Date(selectedShipment.estimatedDelivery).toLocaleString()}</div>
                  {selectedShipment.actualDelivery && (
                    <div><strong>Actual Delivery:</strong> {new Date(selectedShipment.actualDelivery).toLocaleString()}</div>
                  )}
                  <div><strong>Shipping Cost:</strong> R{selectedShipment.shippingCost.toLocaleString()}</div>
                  <div><strong>Weight:</strong> {selectedShipment.weight} kg</div>
                  <div><strong>Dimensions:</strong> {selectedShipment.dimensions || 'Not specified'}</div>
                  <div><strong>Created:</strong> {new Date(selectedShipment.createdAt).toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-3">Shipment Items</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Value</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedShipment.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-2 text-sm">
                          <div>
                            <div className="font-medium">{item.itemName}</div>
                            <div className="text-gray-500">{item.sku}</div>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-sm">{item.quantity}</td>
                        <td className="px-4 py-2 text-sm">R{item.unitPrice}</td>
                        <td className="px-4 py-2 text-sm">R{item.totalValue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedShipment.notes && (
              <div className="mt-4">
                <h4 className="text-lg font-semibold mb-2">Notes</h4>
                <p className="text-gray-700 bg-gray-50 p-3 rounded">{selectedShipment.notes}</p>
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedShipment(null)}
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