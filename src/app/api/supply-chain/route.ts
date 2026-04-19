import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo - in production would use database
const suppliers: any[] = [];
const warehouses: any[] = [];
const inventory: any[] = [];
const procurementOrders: any[] = [];
const shipments: any[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const tenantId = searchParams.get('tenantId');

    switch (action) {
      case 'suppliers':
        return NextResponse.json({
          success: true,
          data: suppliers.filter(s => !tenantId || s.tenantId === tenantId)
        });

      case 'warehouses':
        return NextResponse.json({
          success: true,
          data: warehouses.filter(w => !tenantId || w.tenantId === tenantId)
        });

      case 'inventory':
        const warehouseId = searchParams.get('warehouseId');
        let filteredInventory = inventory.filter(i => !tenantId || i.tenantId === tenantId);
        if (warehouseId) {
          filteredInventory = filteredInventory.filter(i => i.warehouseId === warehouseId);
        }
        return NextResponse.json({
          success: true,
          data: filteredInventory
        });

      case 'procurement_orders':
        return NextResponse.json({
          success: true,
          data: procurementOrders.filter(o => !tenantId || o.tenantId === tenantId)
        });

      case 'shipments':
        return NextResponse.json({
          success: true,
          data: shipments.filter(s => !tenantId || s.tenantId === tenantId)
        });

      case 'low_stock_alerts':
        const lowStockItems = inventory.filter(item =>
          item.currentStock <= item.reorderPoint &&
          (!tenantId || item.tenantId === tenantId)
        );
        return NextResponse.json({
          success: true,
          data: lowStockItems
        });

      case 'supply_chain_analytics':
        const analytics = {
          totalSuppliers: suppliers.filter(s => !tenantId || s.tenantId === tenantId).length,
          totalWarehouses: warehouses.filter(w => !tenantId || w.tenantId === tenantId).length,
          totalInventoryValue: inventory
            .filter(i => !tenantId || i.tenantId === tenantId)
            .reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0),
          lowStockItems: inventory.filter(item =>
            item.currentStock <= item.reorderPoint &&
            (!tenantId || item.tenantId === tenantId)
          ).length,
          pendingOrders: procurementOrders.filter(o =>
            o.status === 'pending_approval' &&
            (!tenantId || o.tenantId === tenantId)
          ).length,
          activeShipments: shipments.filter(s =>
            ['preparing', 'shipped', 'in_transit'].includes(s.status) &&
            (!tenantId || s.tenantId === tenantId)
          ).length
        };
        return NextResponse.json({
          success: true,
          data: analytics
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Supply chain API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    switch (action) {
      case 'create_supplier':
        const newSupplier = {
          id: `sup-${Date.now()}`,
          ...body,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        suppliers.push(newSupplier);
        return NextResponse.json({
          success: true,
          data: newSupplier
        }, { status: 201 });

      case 'create_warehouse':
        const newWarehouse = {
          id: `wh-${Date.now()}`,
          ...body,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        warehouses.push(newWarehouse);
        return NextResponse.json({
          success: true,
          data: newWarehouse
        }, { status: 201 });

      case 'add_inventory_item':
        const newItem = {
          id: `inv-${Date.now()}`,
          ...body,
          availableStock: body.currentStock - (body.reservedStock || 0),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        inventory.push(newItem);
        return NextResponse.json({
          success: true,
          data: newItem
        }, { status: 201 });

      case 'create_procurement_order':
        const orderNumber = `PO-${Date.now()}`;
        const newOrder = {
          id: `po-${Date.now()}`,
          orderNumber,
          ...body,
          status: 'draft',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        procurementOrders.push(newOrder);
        return NextResponse.json({
          success: true,
          data: newOrder
        }, { status: 201 });

      case 'create_shipment':
        const shipmentNumber = `SH-${Date.now()}`;
        const newShipment = {
          id: `sh-${Date.now()}`,
          shipmentNumber,
          ...body,
          status: 'preparing',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        shipments.push(newShipment);
        return NextResponse.json({
          success: true,
          data: newShipment
        }, { status: 201 });

      case 'update_inventory':
        const { itemId, quantity, movementType, warehouseId, reason } = body;
        const item = inventory.find(i => i.id === itemId);
        if (!item) {
          return NextResponse.json(
            { error: 'Inventory item not found' },
            { status: 404 }
          );
        }

        const oldStock = item.currentStock;
        if (movementType === 'inbound') {
          item.currentStock += quantity;
        } else if (movementType === 'outbound') {
          if (item.currentStock < quantity) {
            return NextResponse.json(
              { error: 'Insufficient stock' },
              { status: 400 }
            );
          }
          item.currentStock -= quantity;
        }

        item.availableStock = item.currentStock - item.reservedStock;
        item.updatedAt = new Date();

        // Record movement
        const movement = {
          id: `mov-${Date.now()}`,
          inventoryItemId: itemId,
          movementType,
          quantity,
          fromWarehouseId: movementType === 'transfer' ? warehouseId : null,
          reason,
          performedBy: body.performedBy || 'system',
          createdAt: new Date()
        };

        return NextResponse.json({
          success: true,
          data: { item, movement }
        });

      case 'optimize_warehouse':
        // Simple warehouse optimization logic
        const whId = body.warehouseId;
        const warehouseInventory = inventory.filter(i => i.warehouseId === whId);

        const optimization = {
          warehouseId: whId,
          totalItems: warehouseInventory.length,
          totalValue: warehouseInventory.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0),
          lowStockItems: warehouseInventory.filter(item => item.currentStock <= item.reorderPoint).length,
          recommendations: [
            'Reorganize high-demand items to accessible locations',
            'Implement automated inventory counting',
            'Set up automated reorder alerts'
          ],
          generatedAt: new Date()
        };

        return NextResponse.json({
          success: true,
          data: optimization
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Supply chain API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    switch (action) {
      case 'update_procurement_order':
        const order = procurementOrders.find(o => o.id === body.orderId);
        if (!order) {
          return NextResponse.json(
            { error: 'Procurement order not found' },
            { status: 404 }
          );
        }

        Object.assign(order, body.updates, { updatedAt: new Date() });
        return NextResponse.json({
          success: true,
          data: order
        });

      case 'update_shipment_status':
        const shipment = shipments.find(s => s.id === body.shipmentId);
        if (!shipment) {
          return NextResponse.json(
            { error: 'Shipment not found' },
            { status: 404 }
          );
        }

        shipment.status = body.status;
        if (body.status === 'delivered') {
          shipment.actualDeliveryDate = new Date();
        }
        shipment.updatedAt = new Date();

        return NextResponse.json({
          success: true,
          data: shipment
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Supply chain API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}