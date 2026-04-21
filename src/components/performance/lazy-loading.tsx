'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';

// Lazy loading components with intersection observer
interface LazyLoadProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
  className?: string;
}

const LazyLoad: React.FC<LazyLoadProps> = ({
  children,
  fallback = <div className="animate-pulse bg-muted rounded h-32 flex items-center justify-center">Loading...</div>,
  rootMargin = '50px',
  threshold = 0.1,
  className,
}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          setHasLoaded(true);
          observer.unobserve(element);
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [rootMargin, threshold]);

  return (
    <div ref={ref} className={className}>
      {hasLoaded ? children : fallback}
    </div>
  );
};

// Virtual scrolling list component
interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
}

function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const { startIndex, endIndex, offsetY } = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const endIndex = Math.min(startIndex + visibleCount + overscan, items.length);

    const offsetStart = Math.max(0, startIndex - overscan);
    const offsetY = offsetStart * itemHeight;

    return {
      startIndex: offsetStart,
      endIndex,
      offsetY,
    };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = items.slice(startIndex, endIndex);
  const totalHeight = items.length * itemHeight;

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ height: itemHeight }}
              className="absolute w-full"
              data-index={startIndex + index}
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Infinite scroll component
interface InfiniteScrollProps {
  children: React.ReactNode;
  hasMore: boolean;
  isLoading: boolean;
  loadMore: () => void;
  threshold?: number;
  loader?: React.ReactNode;
  endMessage?: React.ReactNode;
  className?: string;
}

const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  children,
  hasMore,
  isLoading,
  loadMore,
  threshold = 100,
  loader = <div className="py-4 text-center">Loading more...</div>,
  endMessage = <div className="py-4 text-center text-muted-foreground">No more items to load</div>,
  className,
}) => {
  const [isNearBottom, setIsNearBottom] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const checkScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container || isLoading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    if (distanceFromBottom < threshold) {
      setIsNearBottom(true);
      loadMore();
    } else {
      setIsNearBottom(false);
    }
  }, [threshold, isLoading, hasMore, loadMore]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => checkScroll();

    container.addEventListener('scroll', handleScroll);
    checkScroll(); // Check initial state

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [checkScroll]);

  return (
    <div
      ref={containerRef}
      className={cn('overflow-y-auto', className)}
    >
      {children}
      {isLoading && loader}
      {!hasMore && !isLoading && endMessage}
    </div>
  );
};

// Image lazy loading with progressive loading
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  blurDataURL?: string;
  priority?: boolean;
  quality?: number;
  onLoad?: () => void;
  onError?: () => void;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder,
  blurDataURL,
  priority = false,
  quality = 75,
  onLoad,
  onError,
  className,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority) return;

    const element = imgRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(element);
        }
      },
      { rootMargin: '50px' }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const imageSrc = isInView ? `${src}?q=${quality}` : placeholder || blurDataURL;

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Blur placeholder */}
      {blurDataURL && !isLoaded && (
        <img
          src={blurDataURL}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-sm scale-110"
          aria-hidden="true"
        />
      )}

      {/* Main image */}
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        {...props}
      />

      {/* Loading state */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <div className="text-muted-foreground text-sm">Failed to load image</div>
        </div>
      )}
    </div>
  );
};

// Component lazy loading with error boundaries
interface LazyComponentProps {
  importFunc: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  props?: Record<string, any>;
}

const LazyComponent: React.FC<LazyComponentProps> = ({
  importFunc,
  fallback = <div className="animate-pulse bg-muted rounded h-32 flex items-center justify-center">Loading component...</div>,
  errorFallback = <div className="text-destructive p-4 rounded border border-destructive/20">Failed to load component</div>,
  props = {},
}) => {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    importFunc()
      .then(module => {
        setComponent(() => module.default);
      })
      .catch(err => {
        console.error('Failed to load component:', err);
        setError(err);
      });
  }, [importFunc]);

  if (error) {
    return <>{errorFallback}</>;
  }

  if (!Component) {
    return <>{fallback}</>;
  }

  return <Component {...props} />;
};

// Code splitting utilities
export const lazyComponents = {
  // Dashboard components
  Dashboard: () => import('@/components/dashboard/RealtimeDashboard'),
  DataVisualization: () => import('@/components/charts/AdvancedChart'),

  // Form components - TODO: Create when needed
  // AdvancedForm: () => import('@/components/forms/AdvancedForm'),
  // FileUpload: () => import('@/components/forms/FileUpload'),

  // Modal components - TODO: Create when needed
  // ConfirmDialog: () => import('@/components/modals/ConfirmDialog'),
  // ImageGallery: () => import('@/components/modals/ImageGallery'),

  // Feature components - TODO: Create when needed
  // VideoPlayer: () => import('@/components/media/VideoPlayer'),
  // CodeEditor: () => import('@/components/editors/CodeEditor'),
};

// Bundle splitting hook
export function useBundleSplitting() {
  const [loadedBundles, setLoadedBundles] = useState<Set<string>>(new Set());

  const loadBundle = useCallback(async (bundleName: string, importFunc: () => Promise<any>) => {
    if (loadedBundles.has(bundleName)) return;

    try {
      await importFunc();
      setLoadedBundles(prev => new Set([...prev, bundleName]));
    } catch (error) {
      console.error(`Failed to load bundle: ${bundleName}`, error);
    }
  }, [loadedBundles]);

  const isBundleLoaded = useCallback((bundleName: string) => {
    return loadedBundles.has(bundleName);
  }, [loadedBundles]);

  return { loadBundle, isBundleLoaded };
}

// Memory usage monitoring
export function useMemoryMonitor() {
  const [memoryUsage, setMemoryUsage] = useState<{
    used: number;
    total: number;
    limit: number;
    percentage: number;
  } | null>(null);

  useEffect(() => {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const updateMemoryUsage = () => {
        const mem = (performance as any).memory;
        if (mem) {
          const used = mem.usedJSHeapSize;
          const total = mem.totalJSHeapSize;
          const limit = mem.jsHeapSizeLimit;

          setMemoryUsage({
            used,
            total,
            limit,
            percentage: (used / limit) * 100,
          });
        }
      };

      updateMemoryUsage();
      const interval = setInterval(updateMemoryUsage, 5000);

      return () => clearInterval(interval);
    }
  }, []);

  return memoryUsage;
}

// Component memoization utilities
export const memoizedComponents = {
  // Heavy components that benefit from memoization
  DataTable: React.memo(({ data, columns, ...props }: any) => {
    // Implementation would go here
    return <div>Memoized DataTable</div>;
  }),

  Chart: React.memo(({ config, ...props }: any) => {
    // Implementation would go here
    return <div>Memoized Chart</div>;
  }),
};

// Performance optimization hooks
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef<number>(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => clearTimeout(handler);
  }, [value, limit]);

  return throttledValue;
}

export {
  LazyLoad,
  VirtualList,
  InfiniteScroll,
  LazyImage,
  LazyComponent,
};