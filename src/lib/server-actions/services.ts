"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function getServices() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/services`, {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.error || "Failed to fetch services" };
    }

    const services = await response.json();

    return {
      success: true,
      services
    };

  } catch (error) {
    return { error: "Network error. Please try again." };
  }
}

export async function createService(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const price = formData.get("price") as string;
  const duration = formData.get("duration") as string;

  if (!name || !category) {
    return { error: "Service name and category are required" };
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return { error: "Authentication required" };
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        description,
        category,
        price: price ? parseFloat(price) : undefined,
        duration: duration ? parseInt(duration) : undefined,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.error || "Service creation failed" };
    }

    const service = await response.json();

    revalidatePath('/services');

    return {
      success: true,
      service
    };

  } catch (error) {
    return { error: "Network error. Please try again." };
  }
}