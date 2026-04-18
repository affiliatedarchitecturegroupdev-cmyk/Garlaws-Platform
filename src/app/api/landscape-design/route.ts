import { NextRequest, NextResponse } from 'next/server';
import { LandscapeDesign } from '@/lib/types/property';

// Mock database - in production, this would be a real database
const designs: LandscapeDesign[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');

    if (!propertyId) {
      return NextResponse.json(
        { error: 'propertyId query parameter is required' },
        { status: 400 }
      );
    }

    // Filter designs by property ID
    const propertyDesigns = designs.filter(design => design.propertyId === propertyId);

    return NextResponse.json({
      success: true,
      data: propertyDesigns
    });

  } catch (error) {
    console.error('Error fetching landscape designs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch landscape designs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: Omit<LandscapeDesign, 'id' | 'createdAt' | 'updatedAt'> = await request.json();

    // Validate required fields
    if (!body.propertyId || !body.name || !body.elements || !body.style) {
      return NextResponse.json(
        { error: 'Missing required fields: propertyId, name, elements, style' },
        { status: 400 }
      );
    }

    // Create new design
    const newDesign: LandscapeDesign = {
      ...body,
      id: `design-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    designs.push(newDesign);

    return NextResponse.json({
      success: true,
      data: newDesign
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating landscape design:', error);
    return NextResponse.json(
      { error: 'Failed to create landscape design' },
      { status: 500 }
    );
  }
}