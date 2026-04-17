import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { eq } from "drizzle-orm";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ [key: string]: string }> }) {
  try {
    const propertyId = parseInt((await params).id);

    if (isNaN(propertyId)) {
      return NextResponse.json(
        { error: "Invalid property ID" },
        { status: 400 }
      );
    }

    const property = await db.select().from(properties).where(eq(properties.id, propertyId)).limit(1);

    if (property.length === 0) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(property[0]);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch property" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ [key: string]: string }> }) {
  try {
    const propertyId = parseInt((await params).id);

    if (isNaN(propertyId)) {
      return NextResponse.json(
        { error: "Invalid property ID" },
        { status: 400 }
      );
    }

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

    const updatedProperty = await db.update(properties)
      .set({
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
        status,
        updatedAt: new Date(),
      })
      .where(eq(properties.id, propertyId))
      .returning();

    if (updatedProperty.length === 0) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedProperty[0]);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update property" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ [key: string]: string }> }) {
  try {
    const propertyId = parseInt((await params).id);

    if (isNaN(propertyId)) {
      return NextResponse.json(
        { error: "Invalid property ID" },
        { status: 400 }
      );
    }

    const deletedProperty = await db.delete(properties)
      .where(eq(properties.id, propertyId))
      .returning();

    if (deletedProperty.length === 0) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Property deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete property" },
      { status: 500 }
    );
  }
}