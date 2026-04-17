import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { services } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const allServices = await db.select().from(services);
    return NextResponse.json(allServices);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      category,
      price,
      duration,
      providerId,
      isActive
    } = body;

    if (!name || !category) {
      return NextResponse.json(
        { error: "Service name and category are required" },
        { status: 400 }
      );
    }

    const newService = await db.insert(services).values({
      name,
      description,
      category,
      price,
      duration,
      providerId,
      isActive: isActive !== undefined ? isActive : true,
    }).returning();

    return NextResponse.json(newService[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    );
  }
}