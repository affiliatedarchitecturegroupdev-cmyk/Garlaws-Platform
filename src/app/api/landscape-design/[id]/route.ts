import { NextRequest, NextResponse } from 'next/server';
import { LandscapeDesign } from '@/lib/types/property';

// Mock database - in production, this would be a real database
const designs: LandscapeDesign[] = [];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const designId = params.id;

    const design = designs.find(d => d.id === designId);

    if (!design) {
      return NextResponse.json(
        { error: 'Landscape design not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: design
    });

  } catch (error) {
    console.error('Error fetching landscape design:', error);
    return NextResponse.json(
      { error: 'Failed to fetch landscape design' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const designId = params.id;
    const body: Partial<LandscapeDesign> = await request.json();

    const designIndex = designs.findIndex(d => d.id === designId);

    if (designIndex === -1) {
      return NextResponse.json(
        { error: 'Landscape design not found' },
        { status: 404 }
      );
    }

    // Update design
    const updatedDesign: LandscapeDesign = {
      ...designs[designIndex],
      ...body,
      id: designId, // Ensure ID doesn't change
      updatedAt: new Date()
    };

    designs[designIndex] = updatedDesign;

    return NextResponse.json({
      success: true,
      data: updatedDesign
    });

  } catch (error) {
    console.error('Error updating landscape design:', error);
    return NextResponse.json(
      { error: 'Failed to update landscape design' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const designId = params.id;

    const designIndex = designs.findIndex(d => d.id === designId);

    if (designIndex === -1) {
      return NextResponse.json(
        { error: 'Landscape design not found' },
        { status: 404 }
      );
    }

    // Remove design
    const deletedDesign = designs.splice(designIndex, 1)[0];

    return NextResponse.json({
      success: true,
      data: deletedDesign
    });

  } catch (error) {
    console.error('Error deleting landscape design:', error);
    return NextResponse.json(
      { error: 'Failed to delete landscape design' },
      { status: 500 }
    );
  }
}