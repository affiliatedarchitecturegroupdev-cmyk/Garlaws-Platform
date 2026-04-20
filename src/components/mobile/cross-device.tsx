'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

// Device detection hook
export function useDeviceType() {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;

      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    checkDeviceType();
    window.addEventListener('resize', checkDeviceType);

    return () => window.removeEventListener('resize', checkDeviceType);
  }, []);

  return deviceType;
}

// Responsive container with device-aware behavior
interface ResponsiveContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  mobileClassName?: string;
  tabletClassName?: string;
  desktopClassName?: string;
  breakpoints?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  mobileClassName,
  tabletClassName,
  desktopClassName,
  breakpoints = { mobile: 768, tablet: 1024, desktop: 1024 },
  className,
  ...props
}) => {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const checkBreakpoint = () => {
      const width = window.innerWidth;

      if (width < breakpoints.mobile) {
        setCurrentBreakpoint('mobile');
      } else if (width < breakpoints.tablet) {
        setCurrentBreakpoint('tablet');
      } else {
        setCurrentBreakpoint('desktop');
      }
    };

    checkBreakpoint();
    window.addEventListener('resize', checkBreakpoint);

    return () => window.removeEventListener('resize', checkBreakpoint);
  }, [breakpoints]);

  const getResponsiveClassName = () => {
    switch (currentBreakpoint) {
      case 'mobile':
        return mobileClassName;
      case 'tablet':
        return tabletClassName;
      case 'desktop':
        return desktopClassName;
      default:
        return '';
    }
  };

  return (
    <div
      className={cn(className, getResponsiveClassName())}
      {...props}
    >
      {children}
    </div>
  );
};

// Adaptive text component
interface AdaptiveTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  mobileSize?: string;
  tabletSize?: string;
  desktopSize?: string;
  mobileWeight?: string;
  tabletWeight?: string;
  desktopWeight?: string;
}

const AdaptiveText: React.FC<AdaptiveTextProps> = ({
  children,
  mobileSize = 'text-sm',
  tabletSize = 'text-base',
  desktopSize = 'text-lg',
  mobileWeight,
  tabletWeight,
  desktopWeight,
  className,
  ...props
}) => {
  const deviceType = useDeviceType();

  const getSizeClass = () => {
    switch (deviceType) {
      case 'mobile':
        return mobileSize;
      case 'tablet':
        return tabletSize;
      case 'desktop':
        return desktopSize;
      default:
        return desktopSize;
    }
  };

  const getWeightClass = () => {
    switch (deviceType) {
      case 'mobile':
        return mobileWeight;
      case 'tablet':
        return tabletWeight;
      case 'desktop':
        return desktopWeight;
      default:
        return desktopWeight;
    }
  };

  return (
    <span
      className={cn(getSizeClass(), getWeightClass(), className)}
      {...props}
    >
      {children}
    </span>
  );
};

// Conditional rendering based on device
interface DeviceConditionalProps {
  children: React.ReactNode;
  showOn?: ('mobile' | 'tablet' | 'desktop')[];
  hideOn?: ('mobile' | 'tablet' | 'desktop')[];
}

const DeviceConditional: React.FC<DeviceConditionalProps> = ({
  children,
  showOn,
  hideOn,
}) => {
  const deviceType = useDeviceType();

  if (hideOn && hideOn.includes(deviceType)) {
    return null;
  }

  if (showOn && !showOn.includes(deviceType)) {
    return null;
  }

  return <>{children}</>;
};

// Responsive grid with device-aware columns
interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  mobileCols?: number;
  tabletCols?: number;
  desktopCols?: number;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  mobileCols = 1,
  tabletCols = 2,
  desktopCols = 3,
  gap = 'md',
  className,
  ...props
}) => {
  const deviceType = useDeviceType();

  const getColsClass = () => {
    switch (deviceType) {
      case 'mobile':
        return `grid-cols-${mobileCols}`;
      case 'tablet':
        return `grid-cols-${tabletCols}`;
      case 'desktop':
        return `grid-cols-${desktopCols}`;
      default:
        return `grid-cols-${desktopCols}`;
    }
  };

  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };

  return (
    <div
      className={cn(
        'grid',
        getColsClass(),
        gapClasses[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Touch-friendly interactive elements
interface TouchTargetProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  minSize?: number; // Minimum touch target size in pixels
  feedback?: 'ripple' | 'scale' | 'glow' | 'none';
}

const TouchTarget: React.FC<TouchTargetProps> = ({
  children,
  minSize = 44,
  feedback = 'scale',
  className,
  style,
  ...props
}) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [isPressed, setIsPressed] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPressed(true);

    if (feedback === 'ripple') {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      const newRipple = { id: Date.now(), x, y };
      setRipples(prev => [...prev, newRipple]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
      }, 600);
    }
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
  };

  const feedbackClasses = {
    ripple: 'relative overflow-hidden',
    scale: cn(
      'transition-transform duration-75',
      isPressed && 'scale-95'
    ),
    glow: cn(
      'transition-shadow duration-150',
      isPressed && 'shadow-lg shadow-primary/25'
    ),
    none: '',
  };

  return (
    <button
      className={cn(
        'touch-manipulation select-none',
        feedbackClasses[feedback],
        className
      )}
      style={{
        minWidth: `${minSize}px`,
        minHeight: `${minSize}px`,
        ...style,
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      {...props}
    >
      {children}

      {/* Ripple effects */}
      {feedback === 'ripple' && ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 animate-ping pointer-events-none"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
          }}
        />
      ))}
    </button>
  );
};

// Orientation-aware layout
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const checkOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  return orientation;
}

interface OrientationLayoutProps {
  children: React.ReactNode;
  portrait: React.ReactNode;
  landscape: React.ReactNode;
}

const OrientationLayout: React.FC<OrientationLayoutProps> = ({
  children,
  portrait,
  landscape,
}) => {
  const orientation = useOrientation();

  return (
    <>
      {orientation === 'portrait' ? portrait : landscape}
      {children}
    </>
  );
};

// Safe area handling for mobile devices
interface SafeAreaProviderProps {
  children: React.ReactNode;
  className?: string;
}

const SafeAreaProvider: React.FC<SafeAreaProviderProps> = ({
  children,
  className,
}) => {
  const [safeAreas, setSafeAreas] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  useEffect(() => {
    // Detect iOS safe areas
    const testEl = document.createElement('div');
    testEl.style.cssText = `
      position: fixed;
      top: env(safe-area-inset-top);
      right: env(safe-area-inset-right);
      bottom: env(safe-area-inset-bottom);
      left: env(safe-area-inset-left);
      visibility: hidden;
      pointer-events: none;
    `;
    document.body.appendChild(testEl);

    // Use a small delay to ensure CSS env() values are available
    setTimeout(() => {
      const computedStyle = getComputedStyle(testEl);
      const top = parseInt(computedStyle.top) || 0;
      const right = parseInt(computedStyle.right) || 0;
      const bottom = parseInt(computedStyle.bottom) || 0;
      const left = parseInt(computedStyle.left) || 0;

      setSafeAreas({ top, right, bottom, left });
      document.body.removeChild(testEl);
    }, 100);
  }, []);

  return (
    <div
      className={cn(className)}
      style={{
        paddingTop: `${safeAreas.top}px`,
        paddingRight: `${safeAreas.right}px`,
        paddingBottom: `${safeAreas.bottom}px`,
        paddingLeft: `${safeAreas.left}px`,
      }}
    >
      {children}
    </div>
  );
};

// Cross-device consistent spacing utilities
export const deviceSpacing = {
  // Touch-friendly spacing for mobile
  mobile: {
    xs: 'p-2',    // 8px
    sm: 'p-3',    // 12px
    md: 'p-4',    // 16px
    lg: 'p-6',    // 24px
    xl: 'p-8',    // 32px
  },

  // Balanced spacing for tablet
  tablet: {
    xs: 'p-3',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  },

  // Generous spacing for desktop
  desktop: {
    xs: 'p-4',
    sm: 'p-6',
    md: 'p-8',
    lg: 'p-10',
    xl: 'p-12',
  },
};

// Device-specific component variants
interface DeviceVariantsProps {
  children: (deviceType: 'mobile' | 'tablet' | 'desktop') => React.ReactNode;
}

const DeviceVariants: React.FC<DeviceVariantsProps> = ({ children }) => {
  const deviceType = useDeviceType();
  return <>{children(deviceType)}</>;
};

// Performance-aware image component
interface ResponsiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  sizes?: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
  quality?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  loading?: 'lazy' | 'eager';
}

const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  sizes = {
    mobile: '100vw',
    tablet: '50vw',
    desktop: '33vw',
  },
  quality = {
    mobile: 75,
    tablet: 85,
    desktop: 95,
  },
  loading = 'lazy',
  className,
  ...props
}) => {
  const deviceType = useDeviceType();

  // Generate responsive srcSet
  const generateSrcSet = () => {
    const breakpoints = {
      mobile: 640,
      tablet: 768,
      desktop: 1024,
    };

    const currentQuality = quality[deviceType];

    return Object.entries(breakpoints).map(([device, width]) => {
      // In a real implementation, you'd generate different sized images
      // For now, we'll use the same image with different sizes
      return `${src}?w=${width}&q=${currentQuality} ${width}w`;
    }).join(', ');
  };

  const currentSize = sizes[deviceType];

  return (
    <img
      src={`${src}?q=${quality[deviceType]}`}
      srcSet={generateSrcSet()}
      sizes={currentSize}
      alt={alt}
      loading={loading}
      className={cn('w-full h-auto', className)}
      {...props}
    />
  );
};

export {
  ResponsiveContainer,
  AdaptiveText,
  DeviceConditional,
  ResponsiveGrid,
  TouchTarget,
  OrientationLayout,
  SafeAreaProvider,
  DeviceVariants,
  ResponsiveImage,
  deviceSpacing,
  useDeviceType,
  useOrientation,
};