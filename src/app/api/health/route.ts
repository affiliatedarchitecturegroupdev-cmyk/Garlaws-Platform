import { NextResponse } from "next/server";
import { logger, LogCategory } from "@/lib/logger";

export async function GET() {
  const startTime = Date.now();

  try {
    logger.info(LogCategory.API, 'Health check requested');

    // Basic health check - check if database is accessible
    const dbHealth = await checkDatabaseHealth();

    // Check memory usage
    const memUsage = process.memoryUsage();
    const memoryHealth = memUsage.heapUsed / memUsage.heapTotal < 0.9; // Less than 90%

    // Overall health status
    const isHealthy = dbHealth && memoryHealth;

    const healthData = {
      status: isHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "development",
      checks: {
        database: dbHealth ? "healthy" : "unhealthy",
        memory: memoryHealth ? "healthy" : "unhealthy",
      },
      metrics: {
        memory: {
          used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
          total: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
          usage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100), // %
        },
        uptime: Math.round(process.uptime()), // seconds
      }
    };

    const duration = Date.now() - startTime;
    logger.logApiCall('/api/health', 'GET', isHealthy ? 200 : 503, duration);

    return NextResponse.json(healthData, {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.logApiCall('/api/health', 'GET', 503, duration);
    logger.error(LogCategory.API, 'Health check failed', error as Error);

    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: "Health check failed",
      },
      { status: 503 }
    );
  }
}

async function checkDatabaseHealth(): Promise<boolean> {
  try {
    // Import database client and schema
    const { db } = await import("@/db");
    const { users } = await import("@/db/schema");

    // Simple query to check database connectivity - count users (limited to 1)
    await db.select({ count: users.id }).from(users).limit(1);

    return true;
  } catch (error) {
    console.error("Database health check failed:", error);
    return false;
  }
}