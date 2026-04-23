'use client'

import { useState, useEffect, useMemo } from 'react'
import { Package, Truck, MapPin, Clock, CheckCircle, AlertTriangle, Warehouse, Route, Barcode, Zap } from 'lucide-react'

// Types for fulfillment system
interface InventoryItem {
  id: string
  sku: string
  name: string
  category: string
  quantity: number
  reserved: number
  available: number
  location: string
  supplier: string
  reorderPoint: number
  unitCost: number
  lastUpdated: Date
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  items: OrderItem[]
  totalValue: number
  shippingAddress: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  createdAt: Date
  estimatedDelivery: Date
  trackingNumber?: string
}

interface OrderItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  location: string
}

interface Warehouse {
  id: string
  name: string
  location: string
  capacity: number
  utilization: number
  zones: WarehouseZone[]
}

interface WarehouseZone {
  id: string
  name: string
  type: 'bulk' | 'picking' | 'packing' | 'shipping'
  capacity: number
  utilization: number
}

interface ShippingRoute {
  id: string
  name: string
  origin: string
  destination: string
  distance: number
  estimatedTime: number
  cost: number
  active: boolean
}

export default function AdvancedFulfillment() {
  // Sample inventory data
  const [inventory] = useState<InventoryItem[]>([
    {
      id: '1',
      sku: 'TECH-001',
      name: 'Smart Property Management Suite',
      category: 'Software',
      quantity: 150,
      reserved: 25,
      available: 125,
      location: 'WH-A1-Z2',
      supplier: 'TechCorp Solutions',
      reorderPoint: 50,
      unitCost: 250,
      lastUpdated: new Date()
    },
    {
      id: '2',
      sku: 'HW-002',
      name: 'IoT Sensor Network Kit',
      category: 'Hardware',
      quantity: 75,
      reserved: 15,
      available: 60,
      location: 'WH-B3-Z1',
      supplier: 'DataFlow Systems',
      reorderPoint: 25,
      unitCost: 120,
      lastUpdated: new Date()
    },
    {
      id: '3',
      sku: 'SEC-003',
      name: 'Cloud Security Platform',
      category: 'Security',
      quantity: 30,
      reserved: 8,
      available: 22,
      location: 'WH-A2-Z3',
      supplier: 'CloudSecure Inc',
      reorderPoint: 15,
      unitCost: 350,
      lastUpdated: new Date()
    }
  ])

  // Sample orders data
  const [orders] = useState<Order[]>([
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      customerName: 'John Enterprise',
      status: 'processing',
      items: [
        { productId: '1', productName: 'Smart Property Management Suite', quantity: 2, unitPrice: 299.99, location: 'WH-A1-Z2' },
        { productId: '2', productName: 'IoT Sensor Network Kit', quantity: 1, unitPrice: 149.99, location: 'WH-B3-Z1' }
      ],
      totalValue: 749.97,
      shippingAddress: '123 Business St, Enterprise City, EC 12345',
      priority: 'high',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      trackingNumber: 'TRK-2024-001'
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      customerName: 'Sarah Tech Corp',
      status: 'shipped',
      items: [
        { productId: '3', productName: 'Cloud Security Platform', quantity: 1, unitPrice: 399.99, location: 'WH-A2-Z3' }
      ],
      totalValue: 399.99,
      shippingAddress: '456 Innovation Ave, Tech Valley, TV 67890',
      priority: 'urgent',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
      trackingNumber: 'TRK-2024-002'
    },
    {
      id: '3',
      orderNumber: 'ORD-2024-003',
      customerName: 'Mike Solutions Ltd',
      status: 'delivered',
      items: [
        { productId: '1', productName: 'Smart Property Management Suite', quantity: 1, unitPrice: 299.99, location: 'WH-A1-Z2' }
      ],
      totalValue: 299.99,
      shippingAddress: '789 Commerce Blvd, Business District, BD 54321',
      priority: 'medium',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      estimatedDelivery: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      trackingNumber: 'TRK-2024-003'
    }
  ])

  // Sample warehouse data
  const [warehouses] = useState<Warehouse[]>([
    {
      id: 'WH-A',
      name: 'Main Distribution Center',
      location: 'Enterprise City, EC',
      capacity: 10000,
      utilization: 78.5,
      zones: [
        { id: 'Z1', name: 'Bulk Storage', type: 'bulk', capacity: 5000, utilization: 85 },
        { id: 'Z2', name: 'Picking Area', type: 'picking', capacity: 3000, utilization: 92 },
        { id: 'Z3', name: 'Packing Station', type: 'packing', capacity: 1500, utilization: 75 },
        { id: 'Z4', name: 'Shipping Dock', type: 'shipping', capacity: 500, utilization: 60 }
      ]
    },
    {
      id: 'WH-B',
      name: 'Regional Hub',
      location: 'Tech Valley, TV',
      capacity: 5000,
      utilization: 65.2,
      zones: [
        { id: 'Z1', name: 'Bulk Storage', type: 'bulk', capacity: 2500, utilization: 70 },
        { id: 'Z2', name: 'Picking Area', type: 'picking', capacity: 1500, utilization: 80 },
        { id: 'Z3', name: 'Packing Station', type: 'packing', capacity: 750, utilization: 55 },
        { id: 'Z4', name: 'Shipping Dock', type: 'shipping', capacity: 250, utilization: 45 }
      ]
    }
  ])

  // Sample shipping routes
  const [shippingRoutes] = useState<ShippingRoute[]>([
    {
      id: 'R1',
      name: 'Express Same-Day',
      origin: 'Enterprise City',
      destination: 'Business District',
      distance: 25,
      estimatedTime: 4,
      cost: 25,
      active: true
    },
    {
      id: 'R2',
      name: 'Standard Ground',
      origin: 'Enterprise City',
      destination: 'Tech Valley',
      distance: 150,
      estimatedTime: 48,
      cost: 15,
      active: true
    },
    {
      id: 'R3',
      name: 'Premium Overnight',
      origin: 'Tech Valley',
      destination: 'Enterprise City',
      distance: 150,
      estimatedTime: 16,
      cost: 35,
      active: true
    }
  ])

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Calculate fulfillment metrics
  const fulfillmentMetrics = useMemo(() => {
    const totalOrders = orders.length
    const pendingOrders = orders.filter(o => o.status === 'pending').length
    const processingOrders = orders.filter(o => o.status === 'processing').length
    const shippedOrders = orders.filter(o => o.status === 'shipped').length
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length

    const totalValue = orders.reduce((sum, order) => sum + order.totalValue, 0)
    const avgOrderValue = totalValue / totalOrders

    const lowStockItems = inventory.filter(item => item.available <= item.reorderPoint).length
    const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0)

    return {
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      totalValue,
      avgOrderValue,
      lowStockItems,
      totalInventoryValue
    }
  }, [orders, inventory])

  const filteredOrders = useMemo(() => {
    if (filterStatus === 'all') return orders
    return orders.filter(order => order.status === filterStatus)
  }, [orders, filterStatus])

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: Order['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3">
          <Package className="w-8 h-8" />
          <div>
            <h1 className="text-3xl font-bold">Advanced Fulfillment System</h1>
            <p className="text-lg opacity-90">
              AI-optimized inventory management, order processing, and shipping operations
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Package className="w-6 h-6 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{fulfillmentMetrics.totalOrders}</p>
            </div>
          </div>
          <div className="text-sm text-gray-600">This month</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Truck className="w-6 h-6 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-gray-900">{fulfillmentMetrics.deliveredOrders}</p>
            </div>
          </div>
          <div className="text-sm text-green-600 font-medium">98.5% success rate</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Warehouse className="w-6 h-6 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-gray-900">{fulfillmentMetrics.lowStockItems}</p>
            </div>
          </div>
          <div className="text-sm text-orange-600 font-medium">Requires attention</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-6 h-6 text-indigo-600" />
            <div>
              <p className="text-sm text-gray-600">Inventory Value</p>
              <p className="text-2xl font-bold text-gray-900">${fulfillmentMetrics.totalInventoryValue.toLocaleString()}</p>
            </div>
          </div>
          <div className="text-sm text-gray-600">Total stock value</div>
        </div>
      </div>

      {/* Order Management */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Order Management</h2>
          <div className="flex items-center gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredOrders.map(order => (
            <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-gray-900">{order.orderNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(order.priority)}`}>
                      {order.priority}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">${order.totalValue}</div>
                  <div className="text-sm text-gray-600">{order.customerName}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{order.shippingAddress.split(',')[0]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Est: {order.estimatedDelivery.toLocaleDateString()}
                  </span>
                </div>
                {order.trackingNumber && (
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{order.trackingNumber}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {order.items.length} item{order.items.length !== 1 ? 's' : ''} • Created {order.createdAt.toLocaleDateString()}
                </div>
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inventory Management */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Inventory Management</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Product</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">SKU</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Available</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Reserved</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">Location</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-600">{item.category}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-sm">{item.sku}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-medium ${
                      item.available <= item.reorderPoint ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {item.available}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-gray-600">{item.reserved}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-mono">{item.location}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {item.available <= item.reorderPoint ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                        <AlertTriangle className="w-3 h-3" />
                        Low Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        <CheckCircle className="w-3 h-3" />
                        In Stock
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Warehouse Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Warehouse Utilization</h3>
          {warehouses.map(warehouse => (
            <div key={warehouse.id} className="mb-6 last:mb-0">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{warehouse.name}</h4>
                  <p className="text-sm text-gray-600">{warehouse.location}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">{warehouse.utilization}%</div>
                  <div className="text-sm text-gray-600">utilized</div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${warehouse.utilization}%` }}
                ></div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {warehouse.zones.map(zone => (
                  <div key={zone.id} className="flex justify-between">
                    <span className="text-gray-600">{zone.name}:</span>
                    <span className="font-medium">{zone.utilization}%</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Routes</h3>
          <div className="space-y-4">
            {shippingRoutes.map(route => (
              <div key={route.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Route className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-gray-900">{route.name}</span>
                    {route.active && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">${route.cost}</div>
                    <div className="text-sm text-gray-600">per shipment</div>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {route.origin} → {route.destination} • {route.distance} miles
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Est. {route.estimatedTime} hours</span>
                  <span>Optimized route</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Order Details</h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Order Number</label>
                  <p className="text-gray-900">{selectedOrder.orderNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer</label>
                  <p className="text-gray-900">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Value</label>
                  <p className="text-gray-900 font-semibold">${selectedOrder.totalValue}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Items</label>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{item.productName}</div>
                        <div className="text-sm text-gray-600">Location: {item.location}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">Qty: {item.quantity}</div>
                        <div className="text-sm text-gray-600">${item.unitPrice} each</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.trackingNumber && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tracking</label>
                  <p className="text-gray-900 font-mono">{selectedOrder.trackingNumber}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}