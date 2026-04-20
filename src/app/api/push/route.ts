import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for push notifications
const subscriptions: any[] = [];
const pushNotifications: any[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');

    switch (action) {
      case 'subscriptions':
        return NextResponse.json({
          success: true,
          data: subscriptions.filter(s => !userId || s.userId === userId)
        });

      case 'push_notifications':
        const limit = parseInt(searchParams.get('limit') || '50');
        const notifications = pushNotifications
          .filter(n => !userId || n.userId === userId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, limit);
        return NextResponse.json({
          success: true,
          data: notifications
        });

      case 'notification_stats':
        const stats = {
          totalSubscriptions: subscriptions.length,
          totalNotifications: pushNotifications.length,
          sentToday: pushNotifications.filter(n =>
            new Date(n.createdAt).toDateString() === new Date().toDateString()
          ).length,
          byType: pushNotifications.reduce((acc, n) => {
            acc[n.type] = (acc[n.type] || 0) + 1;
            return acc;
          }, {}),
          activeSubscriptions: subscriptions.filter(s => s.isActive).length
        };
        return NextResponse.json({ success: true, data: stats });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Push notification API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    switch (action) {
      case 'subscribe':
        const subscription = {
          id: `sub-${Date.now()}`,
          userId: body.userId,
          endpoint: body.endpoint,
          keys: body.keys,
          userAgent: body.userAgent,
          deviceType: detectDeviceType(body.userAgent),
          isActive: true,
          createdAt: new Date(),
          lastUsed: new Date()
        };
        subscriptions.push(subscription);
        return NextResponse.json({ success: true, data: subscription }, { status: 201 });

      case 'send_notification':
        const notification = {
          id: `push-${Date.now()}`,
          userId: body.userId,
          title: body.title,
          body: body.body,
          icon: body.icon || '/icons/icon-192x192.png',
          badge: body.badge || '/icons/icon-72x72.png',
          tag: body.tag,
          requireInteraction: body.requireInteraction || false,
          data: body.data || {},
          type: body.type || 'general',
          priority: body.priority || 'normal',
          sent: false,
          delivered: false,
          clicked: false,
          createdAt: new Date()
        };
        pushNotifications.push(notification);

        // Simulate sending to service worker (in production, use FCM/VAPID)
        await simulateServiceWorkerNotification(notification);

        return NextResponse.json({ success: true, data: notification }, { status: 201 });

      case 'send_bulk_notifications':
        const bulkNotifications = body.notifications.map((notif: any) => ({
          id: `push-${Date.now()}-${Math.random()}`,
          ...notif,
          sent: false,
          delivered: false,
          clicked: false,
          createdAt: new Date()
        }));

        pushNotifications.push(...bulkNotifications);

        // Send bulk to service workers
        await Promise.all(bulkNotifications.map(simulateServiceWorkerNotification));

        return NextResponse.json({
          success: true,
          data: bulkNotifications,
          count: bulkNotifications.length
        }, { status: 201 });

      case 'mark_interaction':
        const notif = pushNotifications.find(n => n.id === body.notificationId);
        if (notif) {
          if (body.action === 'clicked') {
            notif.clicked = true;
            notif.clickedAt = new Date();
          } else if (body.action === 'dismissed') {
            notif.dismissed = true;
            notif.dismissedAt = new Date();
          }
          return NextResponse.json({ success: true, data: notif });
        }
        return NextResponse.json({ error: 'Notification not found' }, { status: 404 });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Push notification API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    switch (action) {
      case 'update_subscription':
        const subscription = subscriptions.find(s => s.id === body.subscriptionId);
        if (subscription) {
          Object.assign(subscription, body.updates, { lastUsed: new Date() });
          return NextResponse.json({ success: true, data: subscription });
        }
        return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });

      case 'unsubscribe':
        const subIndex = subscriptions.findIndex(s => s.id === body.subscriptionId);
        if (subIndex !== -1) {
          subscriptions.splice(subIndex, 1);
          return NextResponse.json({ success: true });
        }
        return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Push notification API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper functions
function detectDeviceType(userAgent: string): string {
  if (!userAgent) return 'unknown';

  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return 'mobile';
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    return 'tablet';
  } else {
    return 'desktop';
  }
}

async function simulateServiceWorkerNotification(notification: any) {
  try {
    // In production, this would use FCM, VAPID, or other push services
    // For now, simulate the notification delivery
    console.log('Simulating push notification delivery:', notification);

    // Mark as sent
    notification.sent = true;
    notification.sentAt = new Date();

    // Simulate delivery with some delay
    setTimeout(() => {
      notification.delivered = true;
      notification.deliveredAt = new Date();
      console.log('Push notification delivered:', notification.id);
    }, Math.random() * 2000 + 500); // 500ms to 2.5s delay

  } catch (error) {
    console.error('Failed to simulate service worker notification:', error);
  }
}