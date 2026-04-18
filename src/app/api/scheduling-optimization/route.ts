import { NextRequest, NextResponse } from "next/server";
import { AuthMiddleware, AuthenticatedRequest } from "@/lib/auth-middleware";
import { schedulingOptimizationEngine } from "@/lib/scheduling-optimization-engine";

export async function POST(request: NextRequest) {
  return AuthMiddleware.requireAuth(request, async (req: AuthenticatedRequest) => {
    try {
      // Only allow admins and service providers to access scheduling optimization
      if (req.user!.role !== 'admin' && req.user!.role !== 'service_provider') {
        return NextResponse.json(
          { error: "Access denied. Only admins and service providers can optimize schedules." },
          { status: 403 }
        );
      }

      const body = await request.json();
      const {
        bookings,
        optimizationCriteria = {}
      } = body;

      if (!bookings || !Array.isArray(bookings)) {
        return NextResponse.json(
          { error: "Bookings array is required" },
          { status: 400 }
        );
      }

      // Validate booking structure
      for (const booking of bookings) {
        if (!booking.id || !booking.serviceType || !booking.location || !booking.estimatedDuration) {
          return NextResponse.json(
            { error: "Each booking must have id, serviceType, location, and estimatedDuration" },
            { status: 400 }
          );
        }
      }

      // Run scheduling optimization
      const result = await schedulingOptimizationEngine.optimizeSchedule(
        bookings,
        optimizationCriteria
      );

      return NextResponse.json(result);
    } catch (error) {
      console.error("Scheduling optimization error:", error);
      return NextResponse.json(
        { error: "Failed to optimize schedule" },
        { status: 500 }
      );
    }
  });
}

// GET endpoint to retrieve current optimization status or mock data
export async function GET(request: NextRequest) {
  return AuthMiddleware.requireAuth(request, async (req: AuthenticatedRequest) => {
    try {
      // Return mock optimization metrics for demonstration
      const mockMetrics = {
        totalBookingsOptimized: 45,
        averageEfficiencyImprovement: 23,
        technicianUtilization: 87,
        customerSatisfaction: 94,
        lastOptimization: new Date().toISOString(),
        upcomingOptimizations: 12
      };

      return NextResponse.json(mockMetrics);
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to fetch optimization data" },
        { status: 500 }
      );
    }
  });
}