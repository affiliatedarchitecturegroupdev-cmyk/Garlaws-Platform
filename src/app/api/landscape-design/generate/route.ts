import { NextRequest, NextResponse } from 'next/server';
import { generativeLandscapeDesignEngine } from '@/lib/generative-landscape-design-engine';
import { GenerativeDesignParams } from '@/lib/types/property';

export async function POST(request: NextRequest) {
  try {
    const body: GenerativeDesignParams = await request.json();

    // Validate required fields
    if (!body.propertyId || !body.propertyData || !body.environmentalFactors || !body.designPreferences) {
      return NextResponse.json(
        { error: 'Missing required fields: propertyId, propertyData, environmentalFactors, designPreferences' },
        { status: 400 }
      );
    }

    // Generate landscape design
    const result = await generativeLandscapeDesignEngine.generateDesign(body);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error generating landscape design:', error);
    return NextResponse.json(
      { error: 'Failed to generate landscape design' },
      { status: 500 }
    );
  }
}