"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function getNotifications(unreadOnly = false) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return { error: "Authentication required" };
    }

    const url = unreadOnly
      ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/notifications?unread=true`
      : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/notifications`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.error || "Failed to fetch notifications" };
    }

    const notifications = await response.json();

    return {
      success: true,
      notifications
    };

  } catch (error) {
    return { error: "Network error. Please try again." };
  }
}

export async function markNotificationAsRead(notificationId: number) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return { error: "Authentication required" };
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/notifications/${notificationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ read: true }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.error || "Failed to mark notification as read" };
    }

    const notification = await response.json();

    return {
      success: true,
      notification
    };

  } catch (error) {
    return { error: "Network error. Please try again." };
  }
}

export async function deleteNotification(notificationId: number) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return { error: "Authentication required" };
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.error || "Failed to delete notification" };
    }

    return {
      success: true,
      message: "Notification deleted"
    };

  } catch (error) {
    return { error: "Network error. Please try again." };
  }
}

export async function createNotification(formData: FormData) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return { error: "Authentication required" };
    }

    const notificationData = {
      type: formData.get("type") as string,
      title: formData.get("title") as string,
      message: formData.get("message") as string,
      priority: formData.get("priority") as string || "medium",
    };

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(notificationData),
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.error || "Failed to create notification" };
    }

    const notification = await response.json();

    revalidatePath('/dashboard');

    return {
      success: true,
      notification
    };

  } catch (error) {
    return { error: "Network error. Please try again." };
  }
}