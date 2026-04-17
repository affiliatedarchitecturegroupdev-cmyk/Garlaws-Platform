interface PushNotification {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: Array<{ action: string; title: string }>;
}

class PushNotificationService {
  private swRegistration: ServiceWorkerRegistration | null = null;

  async initialize() {
    if (!('serviceWorker' in navigator) || !('Notification' in window)) {
      console.warn('Push notifications not supported');
      return false;
    }

    try {
      // Register service worker if not already registered
      if (!this.swRegistration) {
        this.swRegistration = await navigator.serviceWorker.register('/sw.js');
      }

      // Request permission
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      return false;
    }
  }

  async showNotification(notification: PushNotification) {
    if (Notification.permission !== 'granted') {
      return;
    }

    const options: NotificationOptions = {
      body: notification.body,
      icon: notification.icon || '/favicon.ico',
      badge: notification.badge,
      tag: notification.tag,
      data: notification.data,
      requireInteraction: false,
      silent: false,
    };

    try {
      // Try to use service worker if available
      if (this.swRegistration) {
        await this.swRegistration.showNotification(notification.title, options);
      } else {
        // Fallback to direct notification
        new Notification(notification.title, options);
      }
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }

  // Predefined notification types
  async notifyNewMessage(conversationId: number, senderName: string, message: string) {
    await this.showNotification({
      title: 'New Message',
      body: `${senderName}: ${message}`,
      tag: `conversation-${conversationId}`,
      icon: '/favicon.ico',
      data: { type: 'message', conversationId },
    });
  }

  async notifyBookingUpdate(bookingId: number, status: string, serviceName: string) {
    await this.showNotification({
      title: 'Booking Update',
      body: `Your ${serviceName} booking status changed to: ${status}`,
      tag: `booking-${bookingId}`,
      icon: '/favicon.ico',
      data: { type: 'booking', bookingId },
    });
  }

  async notifyNewBooking(serviceName: string, customerName: string) {
    await this.showNotification({
      title: 'New Booking',
      body: `${customerName} booked ${serviceName}`,
      tag: 'new-booking',
      icon: '/favicon.ico',
      data: { type: 'new_booking' },
    });
  }

  async notifySupportTicketUpdate(ticketId: number, status: string) {
    await this.showNotification({
      title: 'Support Ticket Update',
      body: `Your support ticket status changed to: ${status}`,
      tag: `ticket-${ticketId}`,
      icon: '/favicon.ico',
      data: { type: 'support_ticket', ticketId },
    });
  }

  async notifyVideoCall(roomId: string, callerName: string) {
    await this.showNotification({
      title: 'Incoming Video Call',
      body: `${callerName} is calling you`,
      tag: `video-call-${roomId}`,
      icon: '/favicon.ico',
      data: { type: 'video_call', roomId },
      actions: [
        { action: 'accept', title: 'Accept' },
        { action: 'decline', title: 'Decline' },
      ],
    });
  }
}

export const pushNotificationService = new PushNotificationService();