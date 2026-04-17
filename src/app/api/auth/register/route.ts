import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { AuthUtils } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, password, phone, role } = body;

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: "Email, name, and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await AuthUtils.hashPassword(password);

    // Create new user
    const newUser = await db.insert(users).values({
      email,
      name,
      phone,
      password: hashedPassword,
      role: role || "customer",
    }).returning();

    // Generate JWT token
    const token = AuthUtils.generateToken({
      userId: newUser[0].id,
      email: newUser[0].email,
      role: newUser[0].role || "customer",
    });

    // Return user data and token (exclude password)
    const { password: _, ...userWithoutPassword } = newUser[0];

    return NextResponse.json({
      user: userWithoutPassword,
      token,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}