import { db } from "@/db";
import { notifications } from "@/db/schema";
import { sql } from "drizzle-orm";

export class NotificationService {
  static async createNotification(
    userId: number,
    type: "booking" | "payment" | "system" | "marketing",
    title: string,
    message: string,
    priority: "low" | "medium" | "high" | "urgent" = "medium",
    data?: any,
    expiresAt?: Date
  ) {
    try {
      await db.insert(notifications).values({
        userId,
        type,
        title,
        message,
        data: data ? JSON.stringify(data) : null,
        priority,
        expiresAt,
      });
    } catch (error) {
      console.error("Failed to create notification:", error);
    }
  }

  static async notifyBookingCreated(bookingId: number, userId: number, serviceName: string, propertyAddress: string) {
    await this.createNotification(
      userId,
      "booking",
      "Booking Confirmed",
      `Your booking for ${serviceName} at ${propertyAddress} has been confirmed.`,
      "medium",
      { bookingId, type: "created" }
    );
  }

  static async notifyBookingStatusChanged(bookingId: number, userId: number, serviceName: string, oldStatus: string, newStatus: string) {
    const statusMessages = {
      confirmed: `Your booking for ${serviceName} has been confirmed.`,
      in_progress: `Work has started on your ${serviceName} booking.`,
      completed: `Your ${serviceName} service has been completed successfully.`,
      cancelled: `Your booking for ${serviceName} has been cancelled.`,
    };

    const message = statusMessages[newStatus as keyof typeof statusMessages] ||
                   `Your booking status has changed from ${oldStatus} to ${newStatus}.`;

    await this.createNotification(
      userId,
      "booking",
      "Booking Status Update",
      message,
      newStatus === "cancelled" ? "high" : "medium",
      { bookingId, oldStatus, newStatus }
    );
  }

  static async notifyPaymentReceived(bookingId: number, userId: number, amount: number, serviceName: string) {
    await this.createNotification(
      userId,
      "payment",
      "Payment Received",
      `Payment of R${amount.toLocaleString()} for ${serviceName} has been received.`,
      "medium",
      { bookingId, amount }
    );
  }

  static async notifyPaymentFailed(bookingId: number, userId: number, amount: number, reason?: string) {
    await this.createNotification(
      userId,
      "payment",
      "Payment Failed",
      `Payment of R${amount.toLocaleString()} failed${reason ? `: ${reason}` : ''}. Please try again.`,
      "high",
      { bookingId, amount, reason }
    );
  }

  static async notifyServiceReminder(bookingId: number, userId: number, serviceName: string, scheduledDate: Date) {
    const daysUntil = Math.ceil((scheduledDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    await this.createNotification(
      userId,
      "booking",
      "Service Reminder",
      `Your ${serviceName} service is scheduled in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}.`,
      daysUntil <= 1 ? "high" : "medium",
      { bookingId, scheduledDate: scheduledDate.toISOString() }
    );
  }

  static async notifySystemMaintenance(message: string, affectedUsers?: number[]) {
    // If no specific users, this would need to be sent to all users
    // For now, we'll create a system-wide notification pattern
    const title = "System Maintenance";
    const notificationData = {
      type: "maintenance",
      message,
      priority: "high" as const,
    };

    // In a real implementation, you'd loop through all users or use a broadcast mechanism
    console.log("System maintenance notification:", notificationData);
  }

  static async cleanupExpiredNotifications() {
    try {
      const result = await db.delete(notifications)
        .where(sql`${notifications.expiresAt} < datetime('now')`);

      console.log(`Cleaned up expired notifications`);
    } catch (error) {
      console.error("Failed to cleanup expired notifications:", error);
    }
  }
}