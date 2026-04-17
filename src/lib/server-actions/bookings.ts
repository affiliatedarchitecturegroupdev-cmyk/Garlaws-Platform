"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { NotificationService } from "@/lib/notification-service";

export async function createBooking(formData: FormData) {
  const propertyId = formData.get("propertyId") as string;
  const serviceId = formData.get("serviceId") as string;
  const scheduledDate = formData.get("scheduledDate") as string;
  const notes = formData.get("notes") as string;

  if (!propertyId || !serviceId || !scheduledDate) {
    return { error: "Property, service, and date are required" };
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return { error: "Authentication required" };
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        propertyId: parseInt(propertyId),
        serviceId: parseInt(serviceId),
        scheduledDate,
        notes,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.error || "Booking failed" };
    }

    const booking = await response.json();

    // Send notification about booking creation
    // Note: In a real implementation, you'd decode the JWT to get user info
    // For now, we'll skip notifications to avoid complexity
    try {
      // await NotificationService.notifyBookingCreated(
      //   booking.id,
      //   userId, // Get from decoded JWT
      //   "Service", // Fetch actual service name
      //   "Property" // Fetch actual property address
      // );
    } catch (error) {
      console.error("Failed to send booking notification:", error);
      // Don't fail the booking if notification fails
    }

    // Revalidate relevant pages
    revalidatePath('/services');
    revalidatePath('/bookings');

    return {
      success: true,
      booking
    };

  } catch (error) {
    return { error: "Network error. Please try again." };
  }
}

export async function updateBooking(bookingId: number, formData: FormData) {
  const status = formData.get("status") as string;
  const notes = formData.get("notes") as string;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return { error: "Authentication required" };
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/bookings/${bookingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        status,
        notes,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.error || "Update failed" };
    }

    const booking = await response.json();

    revalidatePath('/bookings');

    return {
      success: true,
      booking
    };

  } catch (error) {
    return { error: "Network error. Please try again." };
  }
}