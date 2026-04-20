'use client';

import { useState, useEffect, useCallback } from 'react';

interface ProcurementOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  items: ProcurementItem[];
  status: 'draft' | 'pending_approval' | 'approved' | 'ordered' | 'partially_received' | 'received' | 'cancelled';
  totalAmount: number;
  currency: string;
  requestedBy: string;
  approvedBy?: string;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface ProcurementItem {
  id: string;
  itemName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  receivedQuantity: number;
  status: 'pending' | 'ordered' | 'received' | 'cancelled';
}

interface ProcurementWorkflowProps {
  tenantId?: string;
}

export default function ProcurementWorkflow({ tenantId = 'default' }: ProcurementWorkflowProps) {
  const [orders, setOrders] = useState<ProcurementOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<ProcurementOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ProcurementOrder | null>(null);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');

  const [newOrder, setNewOrder] = useState({
    supplierId: '',
    items: [] as ProcurementItem[],
    expectedDeliveryDate: '',
    notes: '',
    currency: 'ZAR'
  });

  const [newItem, setNewItem] = useState({
    itemName: '',
    sku: '',
    quantity: 1,
    unitPrice: 0
  });

  useEffect(() => {
    fetchOrders();
    fetchSuppliers();
    fetchInventory();
  }, [tenantId]);

  useEffect(() => {
    applyFilters();
  }, [orders, statusFilter, supplierFilter]);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch(`/api/supply-chain?action=procurement_orders&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch procurement orders:', error);
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

  const fetchInventory = useCallback(async () => {
    try {
      const response = await fetch(`/api/supply-chain?action=inventory&tenantId=${tenantId}`);
      const data = await response.json();
      if (data.success) {
        setInventory(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    }
  }, [tenantId]);

  const applyFilters = useCallback(() => {
    let filtered = [...orders];

    if (statusFilter) {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (supplierFilter) {
      filtered = filtered.filter(order => order.supplierId === supplierFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, statusFilter, supplierFilter]);

  const createOrder = async () => {
    if (!newOrder.supplierId || newOrder.items.length === 0) return;

    const totalAmount = newOrder.items.reduce((sum, item) => sum + item.totalPrice, 0);

    try {
      const response = await fetch('/api/supply-chain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_procurement_order',
          tenantId,
          supplierId: newOrder.supplierId,
          items: newOrder.items,
          totalAmount,
          expectedDeliveryDate: newOrder.expectedDeliveryDate,
          notes: newOrder.notes,
          currency: newOrder.currency,
          requestedBy: 'admin'
        })
      });

      const data = await response.json();
      if (data.success) {
        setOrders([...orders, data.data]);
        setShowCreateForm(false);
        setNewOrder({
          supplierId: '',
          items: [],
          expectedDeliveryDate: '',
          notes: '',
          currency: 'ZAR'
        });
      }
    } catch (error) {
      console.error('Failed to create procurement order:', error);
    }
  };

  const addItemToOrder = () => {
    if (!newItem.itemName || newItem.quantity <= 0 || newItem.unitPrice <= 0) return;

    const item: ProcurementItem = {
      id: `item_${Date.now()}`,
      itemName: newItem.itemName,
      sku: newItem.sku,
      quantity: newItem.quantity,
      unitPrice: newItem.unitPrice,
      totalPrice: newItem.quantity * newItem.unitPrice,
      receivedQuantity: 0,
      status: 'pending'
    };

    setNewOrder({
      ...newOrder,
      items: [...newOrder.items, item]
    });

    setNewItem({
      itemName: '',
      sku: '',
      quantity: 1,
      unitPrice: 0
    });
  };

  const removeItemFromOrder = (itemId: string) => {
    setNewOrder({
      ...newOrder,
      items: newOrder.items.filter(item => item.id !== itemId)
    });
  };

  const updateOrderStatus = async (orderId: string, newStatus: string, updates: any = {}) => {
    try {
      const response = await fetch('/api/supply-chain', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_procurement_order',
          tenantId,
          orderId,
          updates: { status: newStatus, ...updates }
        })
      });

      const data = await response.json();
      if (data.success) {
        setOrders(orders.map(o => o.id === orderId ? data.data : o));
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'ordered': return 'bg-purple-100 text-purple-800';
      case 'partially_received': return 'bg-orange-100 text-orange-800';
      case 'received': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextActions = (order: ProcurementOrder) => {
    switch (order.status) {
      case 'draft': return ['submit_for_approval', 'cancel'];
      case 'pending_approval': return ['approve', 'reject'];
      case 'approved': return ['place_order', 'cancel'];
      case 'ordered': return ['mark_received', 'mark_partially_received'];
      case 'partially_received': return ['mark_received'];
      default: return [];
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
        <h2 className="text-2xl font-bold text-gray-900">Procurement Workflow Management</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Create New Order
        </button>
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
            <option value="draft">Draft</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="ordered">Ordered</option>
            <option value="partially_received">Partially Received</option>
            <option value="received">Received</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Suppliers</option>
            {suppliers.map(supp => (
              <option key={supp.id} value={supp.id}>{supp.name}</option>
            ))}
          </select>
          <button
            onClick={() => {
              setStatusFilter('');
              setSupplierFilter('');
            }}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Create Order Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Create New Procurement Order</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
              <select
                value={newOrder.supplierId}
                onChange={(e) => setNewOrder({...newOrder, supplierId: e.target.value})}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery Date</label>
              <input
                type="date"
                value={newOrder.expectedDeliveryDate}
                onChange={(e) => setNewOrder({...newOrder, expectedDeliveryDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={newOrder.notes}
                onChange={(e) => setNewOrder({...newOrder, notes: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>
          </div>

          {/* Add Items Section */}
          <div className="border-t pt-4 mb-4">
            <h4 className="text-md font-semibold mb-3">Add Items</h4>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
              <input
                type="text"
                placeholder="Item Name"
                value={newItem.itemName}
                onChange={(e) => setNewItem({...newItem, itemName: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="SKU"
                value={newItem.sku}
                onChange={(e) => setNewItem({...newItem, sku: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="number"
                placeholder="Quantity"
                value={newItem.quantity}
                onChange={(e) => setNewItem({...newItem, quantity: Number(e.target.value)})}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                min="1"
              />
              <input
                type="number"
                placeholder="Unit Price"
                value={newItem.unitPrice}
                onChange={(e) => setNewItem({...newItem, unitPrice: Number(e.target.value)})}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                min="0"
                step="0.01"
              />
              <button
                onClick={addItemToOrder}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Add Item
              </button>
            </div>

            {/* Items List */}
            {newOrder.items.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-gray-700">Order Items:</h5>
                {newOrder.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium">{item.itemName}</span>
                      <span className="text-sm text-gray-600 ml-2">({item.sku})</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm">Qty: {item.quantity} × R{item.unitPrice} = R{item.totalPrice}</span>
                      <button
                        onClick={() => removeItemFromOrder(item.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                <div className="text-right font-semibold">
                  Total: R{newOrder.items.reduce((sum, item) => sum + item.totalPrice, 0).toLocaleString()}
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={createOrder}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              disabled={!newOrder.supplierId || newOrder.items.length === 0}
            >
              Create Order
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

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                      <div className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.supplierName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    R{order.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(order.expectedDeliveryDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      {getNextActions(order).map(action => (
                        <button
                          key={action}
                          onClick={() => {
                            switch (action) {
                              case 'submit_for_approval':
                                updateOrderStatus(order.id, 'pending_approval');
                                break;
                              case 'approve':
                                updateOrderStatus(order.id, 'approved', { approvedBy: 'admin' });
                                break;
                              case 'place_order':
                                updateOrderStatus(order.id, 'ordered');
                                break;
                              case 'mark_received':
                                updateOrderStatus(order.id, 'received', { actualDeliveryDate: new Date().toISOString() });
                                break;
                              case 'cancel':
                                updateOrderStatus(order.id, 'cancelled');
                                break;
                            }
                          }}
                          className={`px-2 py-1 text-xs rounded ${
                            action.includes('cancel') ? 'bg-red-100 text-red-700' :
                            action.includes('approve') ? 'bg-green-100 text-green-700' :
                            'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {action.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-4/5 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Order {selectedOrder.orderNumber}</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-lg font-semibold mb-3">Order Details</h4>
                <div className="space-y-2">
                  <div><strong>Status:</strong> <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status.replace('_', ' ')}
                  </span></div>
                  <div><strong>Supplier:</strong> {selectedOrder.supplierName}</div>
                  <div><strong>Requested By:</strong> {selectedOrder.requestedBy}</div>
                  <div><strong>Expected Delivery:</strong> {new Date(selectedOrder.expectedDeliveryDate).toLocaleDateString()}</div>
                  {selectedOrder.actualDeliveryDate && (
                    <div><strong>Actual Delivery:</strong> {new Date(selectedOrder.actualDeliveryDate).toLocaleDateString()}</div>
                  )}
                  <div><strong>Total Amount:</strong> R{selectedOrder.totalAmount.toLocaleString()}</div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-3">Approval & Timeline</h4>
                <div className="space-y-2">
                  <div><strong>Created:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</div>
                  <div><strong>Last Updated:</strong> {new Date(selectedOrder.updatedAt).toLocaleString()}</div>
                  {selectedOrder.approvedBy && (
                    <div><strong>Approved By:</strong> {selectedOrder.approvedBy}</div>
                  )}
                  {selectedOrder.notes && (
                    <div><strong>Notes:</strong> {selectedOrder.notes}</div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-3">Order Items</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Received</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedOrder.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-2 text-sm">
                          <div>
                            <div className="font-medium">{item.itemName}</div>
                            <div className="text-gray-500">{item.sku}</div>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-sm">{item.quantity}</td>
                        <td className="px-4 py-2 text-sm">R{item.unitPrice}</td>
                        <td className="px-4 py-2 text-sm">R{item.totalPrice}</td>
                        <td className="px-4 py-2 text-sm">{item.receivedQuantity} / {item.quantity}</td>
                        <td className="px-4 py-2 text-sm">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedOrder(null)}
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