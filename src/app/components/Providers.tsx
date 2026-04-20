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
import { useAppStore } from "@/lib/store/app-store";
import { apiGateway } from "@/lib/api-gateway";
import { useRealtimeSync } from "@/lib/realtime-sync";
import { useAutoAnalytics } from "@/lib/analytics-feedback";
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

// Store initializer component
function StoreInitializer({ children }: { children: ReactNode }) {
  const { user, setUser, setAuthenticated, syncAllData } = useAppStore();
  const { isConnected } = useRealtimeSync();

  useEffect(() => {
    // Initialize store with user data from auth context
    const initializeStore = async () => {
      try {
        // Load initial data for all modules
        await syncAllData();

        // Set up periodic sync (every 5 minutes) as fallback for real-time sync
        const syncInterval = setInterval(async () => {
          if (!isConnected) {
            await syncAllData();
          }
        }, 5 * 60 * 1000);

        return () => clearInterval(syncInterval);
      } catch (error) {
        console.error('Failed to initialize store:', error);
      }
    };

    initializeStore();
  }, [syncAllData, isConnected]);

  return <>{children}</>;
}

function NavigationWrapper({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  // Initialize analytics for authenticated users
  useAutoAnalytics(user?.id?.toString());

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
            <StoreInitializer>
              <NavigationWrapper>
                {children}
              </NavigationWrapper>
            </StoreInitializer>
            <WebVitalsTracker />
            <PushNotificationInitializer />
            <FloatingChatWidget />
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </GlobalErrorBoundary>
  );
}