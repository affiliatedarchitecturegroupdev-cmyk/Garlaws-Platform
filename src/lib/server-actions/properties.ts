"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function createProperty(formData: FormData) {
  const address = formData.get("address") as string;
  const city = formData.get("city") as string;
  const province = formData.get("province") as string;
  const postalCode = formData.get("postalCode") as string;
  const propertyType = formData.get("propertyType") as string;
  const size = formData.get("size") as string;
  const bedrooms = formData.get("bedrooms") as string;
  const bathrooms = formData.get("bathrooms") as string;
  const description = formData.get("description") as string;

  if (!address || !city || !province) {
    return { error: "Address, city, and province are required" };
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return { error: "Authentication required" };
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        address,
        city,
        province,
        postalCode,
        propertyType: propertyType || 'residential',
        size: size ? parseFloat(size) : undefined,
        bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
        bathrooms: bathrooms ? parseInt(bathrooms) : undefined,
        description,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.error || "Property creation failed" };
    }

    const property = await response.json();

    revalidatePath('/properties');

    return {
      success: true,
      property
    };

  } catch (error) {
    return { error: "Network error. Please try again." };
  }
}

export async function getProperties() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/properties`, {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.error || "Failed to fetch properties" };
    }

    const properties = await response.json();

    return {
      success: true,
      properties
    };

  } catch (error) {
    return { error: "Network error. Please try again." };
  }
}