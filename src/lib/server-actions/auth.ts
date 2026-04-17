"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.error || "Login failed" };
    }

    const data = await response.json();

    // Store auth data in cookies or return to client
    // Since this is server action, we'll return the data to be handled by client
    return {
      success: true,
      user: data.user,
      token: data.token
    };

  } catch (error) {
    return { error: "Network error. Please try again." };
  }
}

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const password = formData.get("password") as string;
  const phone = formData.get("phone") as string;
  const role = formData.get("role") as string || "customer";

  if (!email || !name || !password) {
    return { error: "Email, name, and password are required" };
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, name, password, phone, role }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.error || "Registration failed" };
    }

    const data = await response.json();

    return {
      success: true,
      user: data.user,
      token: data.token
    };

  } catch (error) {
    return { error: "Network error. Please try again." };
  }
}