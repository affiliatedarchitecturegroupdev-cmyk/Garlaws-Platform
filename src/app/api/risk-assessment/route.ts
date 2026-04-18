import { NextRequest, NextResponse } from "next/server";
import { AuthMiddleware, AuthenticatedRequest } from "@/lib/auth-middleware";
import { riskAssessmentEngine } from "@/lib/risk-assessment-engine";

export async function POST(request: NextRequest) {
  return AuthMiddleware.requireAuth(request, async (req: AuthenticatedRequest) => {
    try {
      // Only allow admins and property managers to access risk assessment
      if (req.user!.role !== 'admin' && req.user!.role !== 'service_provider') {
        return NextResponse.json(
          { error: "Access denied. Only admins and service providers can perform risk assessments." },
          { status: 403 }
        );
      }

      const body = await request.json();
      const {
        assessmentType,
        targetId,
        assessmentData,
        criteria = {}
      } = body;

      if (!assessmentType || !targetId) {
        return NextResponse.json(
          { error: "Assessment type and target ID are required" },
          { status: 400 }
        );
      }

      // Validate assessment type
      const validTypes = ['property', 'equipment', 'operational', 'portfolio'];
      if (!validTypes.includes(assessmentType)) {
        return NextResponse.json(
          { error: "Invalid assessment type. Must be: property, equipment, operational, or portfolio" },
          { status: 400 }
        );
      }

      // Perform risk assessment
      const assessment = await riskAssessmentEngine.performAssessment(
        assessmentType,
        targetId,
        assessmentData,
        criteria
      );

      return NextResponse.json(assessment);
    } catch (error) {
      console.error("Risk assessment error:", error);
      return NextResponse.json(
        { error: "Failed to perform risk assessment" },
        { status: 500 }
      );
    }
  });
}

// GET endpoint to retrieve risk assessment history
export async function GET(request: NextRequest) {
  return AuthMiddleware.requireAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const assessmentType = searchParams.get('type');
      const targetId = searchParams.get('targetId');
      const limit = parseInt(searchParams.get('limit') || '10');

      // Get assessment history
      const history = await riskAssessmentEngine.getAssessmentHistory(
        assessmentType,
        targetId,
        limit
      );

      return NextResponse.json(history);
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to fetch risk assessment history" },
        { status: 500 }
      );
    }
  });
}