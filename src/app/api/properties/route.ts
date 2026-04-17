import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const allProperties = await db.select().from(properties);
    return NextResponse.json(allProperties);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch properties" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      ownerId,
      address,
      city,
      province,
      postalCode,
      propertyType,
      size,
      bedrooms,
      bathrooms,
      description,
      status
    } = body;

    if (!ownerId || !address || !city || !province) {
      return NextResponse.json(
        { error: "Owner ID, address, city, and province are required" },
        { status: 400 }
      );
    }

    const newProperty = await db.insert(properties).values({
      ownerId,
      address,
      city,
      province,
      postalCode,
      propertyType: propertyType || "residential",
      size,
      bedrooms,
      bathrooms,
      description,
      status: status || "active",
    }).returning();

    return NextResponse.json(newProperty[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create property" },
      { status: 500 }
    );
  }
}