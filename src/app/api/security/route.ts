import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo
const userRoles: any[] = [];
const permissions: any[] = [];
const securityEvents: any[] = [];
const securityIncidents: any[] = [];
const complianceRecords: any[] = [];
const securityPolicies: any[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const tenantId = searchParams.get('tenantId');

    switch (action) {
      case 'user_roles':
        return NextResponse.json({
          success: true,
          data: userRoles.filter(r => !tenantId || r.tenantId === tenantId)
        });

      case 'permissions':
        return NextResponse.json({
          success: true,
          data: permissions
        });

      case 'security_events':
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');
        let events = securityEvents.filter(e => !tenantId || e.tenantId === tenantId);
        events = events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return NextResponse.json({
          success: true,
          data: events.slice(offset, offset + limit),
          total: events.length
        });

      case 'security_incidents':
        return NextResponse.json({
          success: true,
          data: securityIncidents.filter(i => !tenantId || i.tenantId === tenantId)
        });

      case 'compliance_records':
        return NextResponse.json({
          success: true,
          data: complianceRecords.filter(c => !tenantId || c.tenantId === tenantId)
        });

      case 'security_policies':
        return NextResponse.json({
          success: true,
          data: securityPolicies.filter(p => !tenantId || p.tenantId === tenantId)
        });

      case 'security_analytics':
        const analytics = {
          totalUsers: 150, // Mock
          activeUsers: 89, // Mock
          failedLogins: securityEvents.filter(e => e.eventType === 'failed_login').length,
          securityIncidents: securityIncidents.length,
          complianceScore: 94.2, // Mock
          activePolicies: securityPolicies.filter(p => p.isActive).length,
          recentEvents: securityEvents.slice(0, 10),
          threatLevel: 'low', // Mock
          lastSecurityScan: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          encryptionStatus: 'healthy' // Mock
        };
        return NextResponse.json({
          success: true,
          data: analytics
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Security API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    switch (action) {
      case 'create_role':
        const newRole = {
          id: `role-${Date.now()}`,
          ...body,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        userRoles.push(newRole);
        return NextResponse.json({ success: true, data: newRole }, { status: 201 });

      case 'assign_role':
        const assignment = {
          id: `assign-${Date.now()}`,
          ...body,
          assignedAt: new Date(),
          isActive: true
        };
        // In real implementation, save to user_role_assignments table
        return NextResponse.json({ success: true, data: assignment }, { status: 201 });

      case 'log_security_event':
        const event = {
          id: `event-${Date.now()}`,
          ...body,
          createdAt: new Date()
        };
        securityEvents.push(event);
        return NextResponse.json({ success: true, data: event }, { status: 201 });

      case 'create_incident':
        const incident = {
          id: `incident-${Date.now()}`,
          ...body,
          status: 'detected',
          detectedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        securityIncidents.push(incident);
        return NextResponse.json({ success: true, data: incident }, { status: 201 });

      case 'create_policy':
        const policy = {
          id: `policy-${Date.now()}`,
          ...body,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        securityPolicies.push(policy);
        return NextResponse.json({ success: true, data: policy }, { status: 201 });

      case 'run_security_scan':
        // Simulate security scan
        const scanResults = {
          scanId: `scan-${Date.now()}`,
          timestamp: new Date(),
          status: 'completed',
          vulnerabilities: {
            critical: 0,
            high: 2,
            medium: 5,
            low: 12
          },
          compliance: {
            POPIA: 'compliant',
            'B-BBEE': 'compliant',
            NHBRC: 'compliant',
            CIDB: 'compliant'
          },
          recommendations: [
            'Update password policy to require special characters',
            'Enable two-factor authentication for admin accounts',
            'Review user access permissions quarterly'
          ]
        };
        return NextResponse.json({ success: true, data: scanResults });

      case 'encrypt_data':
        // Simulate data encryption
        const encrypted = {
          originalData: body.data,
          encryptedData: `encrypted_${btoa(body.data)}`,
          keyId: body.keyId || 'default-key',
          algorithm: 'AES-256',
          timestamp: new Date()
        };
        return NextResponse.json({ success: true, data: encrypted });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Security API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    switch (action) {
      case 'update_incident':
        const incident = securityIncidents.find(i => i.id === body.incidentId);
        if (!incident) {
          return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
        }
        Object.assign(incident, body.updates, { updatedAt: new Date() });
        return NextResponse.json({ success: true, data: incident });

      case 'update_policy':
        const policy = securityPolicies.find(p => p.id === body.policyId);
        if (!policy) {
          return NextResponse.json({ error: 'Policy not found' }, { status: 404 });
        }
        Object.assign(policy, body.updates, { updatedAt: new Date() });
        return NextResponse.json({ success: true, data: policy });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Security API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}