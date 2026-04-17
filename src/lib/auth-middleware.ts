import { NextRequest, NextResponse } from "next/server";
import { AuthUtils, JWTPayload } from "@/lib/auth";

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

export class AuthMiddleware {
  static async authenticate(request: NextRequest): Promise<{ user: JWTPayload } | { error: NextResponse }> {
    const authHeader = request.headers.get('authorization');
    const token = AuthUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      return {
        error: NextResponse.json(
          { error: "No token provided" },
          { status: 401 }
        )
      };
    }

    const decoded = AuthUtils.verifyToken(token);

    if (!decoded) {
      return {
        error: NextResponse.json(
          { error: "Invalid token" },
          { status: 401 }
        )
      };
    }

    return { user: decoded };
  }

  static async requireAuth(
    request: NextRequest,
    handler: (req: AuthenticatedRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    const authResult = await AuthMiddleware.authenticate(request);

    if ('error' in authResult) {
      return authResult.error;
    }

    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = authResult.user;

    return handler(authenticatedRequest);
  }

  static requireRole(roles: string[]) {
    return async (
      request: NextRequest,
      handler: (req: AuthenticatedRequest) => Promise<NextResponse>
    ): Promise<NextResponse> => {
      const authResult = await AuthMiddleware.authenticate(request);

      if ('error' in authResult) {
        return authResult.error;
      }

      if (!roles.includes(authResult.user.role)) {
        return NextResponse.json(
          { error: "Insufficient permissions" },
          { status: 403 }
        );
      }

      const authenticatedRequest = request as AuthenticatedRequest;
      authenticatedRequest.user = authResult.user;

      return handler(authenticatedRequest);
    };
  }
}