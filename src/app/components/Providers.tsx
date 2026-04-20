'use client';

import { ReactNode } from 'react';
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import { ToastProvider } from "@/components/ToastNotifications";
import { FloatingChatWidget } from "@/components/FloatingChatWidget";
import { PushNotificationInitializer } from "@/components/PushNotificationInitializer";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";
import { WebVitalsTracker } from "@/components/WebVitalsTracker";
import UnifiedNavigation from "@/components/navigation/UnifiedNavigation";
import BreadcrumbNavigation from "@/components/navigation/BreadcrumbNavigation";
import { usePathname } from 'next/navigation';

interface ProvidersProps {
  children: ReactNode;
}

function NavigationWrapper({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  // Don't show unified navigation on landing page or auth pages
  const showUnifiedNav = user && !pathname.startsWith('/auth') && pathname !== '/';

  if (isLoading) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen">
      {showUnifiedNav && <UnifiedNavigation userRole={user.role as any} />}
      <div className={showUnifiedNav ? 'lg:ml-80' : ''}>
        {showUnifiedNav && <BreadcrumbNavigation />}
        {children}
      </div>
    </div>
  );
}

export function Providers({ children }: ProvidersProps) {
  return (
    <GlobalErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <NavigationWrapper>
              {children}
            </NavigationWrapper>
            <WebVitalsTracker />
            <PushNotificationInitializer />
            <FloatingChatWidget />
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </GlobalErrorBoundary>
  );
}