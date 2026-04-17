// Performance optimizations for the Garlaws Platform

// Dynamic imports for route-based code splitting
export const loadDashboardPage = () => import('@/app/dashboard/page');
export const loadBookingsPage = () => import('@/app/dashboard/bookings/page');
export const loadChatPage = () => import('@/app/dashboard/chat/page');
export const loadAnalyticsPage = () => import('@/app/dashboard/analytics/page');
export const loadReportsPage = () => import('@/app/dashboard/reports/page');

// Preload critical routes
export function preloadCriticalRoutes() {
  if (typeof window !== 'undefined') {
    // Preload dashboard routes on app start
    loadDashboardPage().catch(() => {});
    loadBookingsPage().catch(() => {});
  }
}

// Image lazy loading helper
export function lazyLoadImage(src: string, placeholder: string = '/placeholder-image.jpg') {
  return new Promise<string>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => resolve(placeholder);
    img.src = src;
  });
}

// Cache implementation for API responses
class APICache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number = 300000) { // 5 minutes default TTL
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear() {
    this.cache.clear();
  }

  // Clean up expired items
  cleanup() {
    const now = Date.now();
    for (const [ip, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(ip);
      }
    }
  }
}

export const apiCache = new APICache();

// Clean up cache periodically
if (typeof globalThis !== 'undefined') {
  setInterval(() => apiCache.cleanup(), 60000); // Clean up every minute
}