import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo
const customers: any[] = [];
const leads: any[] = [];
const campaigns: any[] = [];
const communications: any[] = [];
const loyaltyPrograms: any[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const tenantId = searchParams.get('tenantId');

    switch (action) {
      case 'customers':
        const segmentId = searchParams.get('segmentId');
        let filteredCustomers = customers.filter(c => !tenantId || c.tenantId === tenantId);
        if (segmentId) {
          filteredCustomers = filteredCustomers.filter(c => c.segmentId === segmentId);
        }
        return NextResponse.json({
          success: true,
          data: filteredCustomers
        });

      case 'leads':
        return NextResponse.json({
          success: true,
          data: leads.filter(l => !tenantId || l.tenantId === tenantId)
        });

      case 'campaigns':
        return NextResponse.json({
          success: true,
          data: campaigns.filter(c => !tenantId || c.tenantId === tenantId)
        });

      case 'communications':
        const customerId = searchParams.get('customerId');
        let filteredComms = communications.filter(c => !tenantId || c.tenantId === tenantId);
        if (customerId) {
          filteredComms = filteredComms.filter(c => c.customerId === customerId);
        }
        return NextResponse.json({
          success: true,
          data: filteredComms
        });

      case 'crm_analytics':
        const analytics = {
          totalCustomers: customers.filter(c => !tenantId || c.tenantId === tenantId).length,
          totalLeads: leads.filter(l => !tenantId || l.tenantId === tenantId).length,
          activeCampaigns: campaigns.filter(c => c.status === 'running' && (!tenantId || c.tenantId === tenantId)).length,
          customerSatisfaction: 4.2, // Mock
          conversionRate: 0.15, // Mock
          churnRate: 0.05, // Mock
          avgLifetimeValue: 25000, // Mock
          recentCommunications: communications.filter(c => !tenantId || c.tenantId === tenantId).length
        };
        return NextResponse.json({
          success: true,
          data: analytics
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('CRM API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    switch (action) {
      case 'create_customer':
        const customerNumber = `CUST-${Date.now()}`;
        const newCustomer = {
          id: `cust-${Date.now()}`,
          customerNumber,
          ...body,
          totalSpent: 0,
          totalOrders: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        customers.push(newCustomer);
        return NextResponse.json({ success: true, data: newCustomer }, { status: 201 });

      case 'create_lead':
        const leadNumber = `LEAD-${Date.now()}`;
        const newLead = {
          id: `lead-${Date.now()}`,
          leadNumber,
          ...body,
          score: 0,
          probability: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        leads.push(newLead);
        return NextResponse.json({ success: true, data: newLead }, { status: 201 });

      case 'create_campaign':
        const newCampaign = {
          id: `camp-${Date.now()}`,
          ...body,
          status: 'draft',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        campaigns.push(newCampaign);
        return NextResponse.json({ success: true, data: newCampaign }, { status: 201 });

      case 'send_communication':
        const newComm = {
          id: `comm-${Date.now()}`,
          ...body,
          status: 'sent',
          sentAt: new Date(),
          createdAt: new Date()
        };
        communications.push(newComm);
        return NextResponse.json({ success: true, data: newComm }, { status: 201 });

      case 'convert_lead':
        const lead = leads.find(l => l.id === body.leadId);
        if (!lead) {
          return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
        }

        lead.status = 'closed_won';
        lead.convertedAt = new Date();

        const customer = {
          id: `cust-${Date.now()}`,
          customerNumber: `CUST-${Date.now()}`,
          firstName: lead.firstName,
          lastName: lead.lastName,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          tenantId: lead.tenantId,
          status: 'active',
          source: 'lead_conversion',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        customers.push(customer);

        lead.convertedCustomerId = customer.id;

        return NextResponse.json({
          success: true,
          data: { lead, customer }
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('CRM API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}