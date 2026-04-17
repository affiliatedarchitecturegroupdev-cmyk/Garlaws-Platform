import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { AuthUtils } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const allUsers = await db.select().from(users);
    // Exclude password from response
    const usersWithoutPasswords = allUsers.map(({ password, ...user }) => user);
    return NextResponse.json(usersWithoutPasswords);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, phone, password, role } = body;

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: "Email, name, and password are required" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await AuthUtils.hashPassword(password);

    const newUser = await db.insert(users).values({
      email,
      name,
      phone,
      password: hashedPassword,
      role: role || "customer",
    }).returning();

    return NextResponse.json(newUser[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}