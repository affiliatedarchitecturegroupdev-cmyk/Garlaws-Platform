"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
      return;
    }

    if (!isLoading && user && requiredRole && user.role !== requiredRole) {
      router.push("/unauthorized");
      return;
    }
  }, [user, isLoading, router, requiredRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-[#c5a059] mb-2">Loading...</h2>
          <p className="text-[#45a29e]">Please wait while we verify your access</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  if (requiredRole && user.role !== requiredRole) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}