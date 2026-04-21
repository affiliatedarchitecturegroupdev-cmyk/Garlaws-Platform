'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

// Touch gesture types
export type TouchGesture =
  | 'tap'
  | 'double-tap'
  | 'long-press'
  | 'swipe-left'
  | 'swipe-right'
  | 'swipe-up'
  | 'swipe-down'
  | 'pinch'
  | 'pan';

export interface GestureEvent {
  type: TouchGesture;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  deltaX: number;
  deltaY: number;
  velocity: number;
  duration: number;
  scale?: number;
}

// Touch gesture hook
export function useTouchGesture(
  onGesture: (event: GestureEvent) => void,
  options: {
    minSwipeDistance?: number;
    maxTapDuration?: number;
    longPressDelay?: number;
    enablePinch?: boolean;
  } = {}
) {
  const {
    minSwipeDistance = 50,
    maxTapDuration = 300,
    longPressDelay = 500,
    enablePinch = false,
  } = options;

  const touchRef = useRef<HTMLDivElement>(null);
  const [touchState, setTouchState] = useState({
    startTime: 0,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    isTracking: false,
    tapCount: 0,
    longPressTimer: null as NodeJS.Timeout | null,
    initialDistance: 0,
  });

  const calculateDistance = useCallback((touches: TouchList) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    const now = Date.now();

    setTouchState(prev => {
      const newState = {
        ...prev,
        startTime: now,
        startX: touch.clientX,
        startY: touch.clientY,
        currentX: touch.clientX,
        currentY: touch.clientY,
        isTracking: true,
        initialDistance: enablePinch ? calculateDistance(e.touches) : 0,
      };

      // Set up long press timer
      if (prev.longPressTimer) clearTimeout(prev.longPressTimer);
      newState.longPressTimer = setTimeout(() => {
        onGesture({
          type: 'long-press',
          startX: newState.startX,
          startY: newState.startY,
          endX: newState.currentX,
          endY: newState.currentY,
          deltaX: 0,
          deltaY: 0,
          velocity: 0,
          duration: Date.now() - newState.startTime,
        });
      }, longPressDelay);

      return newState;
    });
  }, [onGesture, longPressDelay, enablePinch, calculateDistance]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];

    setTouchState(prev => {
      if (!prev.isTracking) return prev;

      const newState = {
        ...prev,
        currentX: touch.clientX,
        currentY: touch.clientY,
      };

      // Cancel long press on move
      if (prev.longPressTimer) {
        clearTimeout(prev.longPressTimer);
        newState.longPressTimer = null;
      }

      // Handle pinch gesture
      if (enablePinch && e.touches.length === 2) {
        const currentDistance = calculateDistance(e.touches);
        if (prev.initialDistance > 0) {
          const scale = currentDistance / prev.initialDistance;
          onGesture({
            type: 'pinch',
            startX: prev.startX,
            startY: prev.startY,
            endX: newState.currentX,
            endY: newState.currentY,
            deltaX: newState.currentX - prev.startX,
            deltaY: newState.currentY - prev.startY,
            velocity: 0,
            duration: Date.now() - prev.startTime,
            scale,
          });
        }
      }

      return newState;
    });
  }, [onGesture, enablePinch, calculateDistance]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    setTouchState(prev => {
      if (!prev.isTracking) return prev;

      const duration = Date.now() - prev.startTime;
      const deltaX = prev.currentX - prev.startX;
      const deltaY = prev.currentY - prev.startY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const velocity = distance / duration;

      // Clear long press timer
      if (prev.longPressTimer) {
        clearTimeout(prev.longPressTimer);
      }

      // Determine gesture type
      let gestureType: TouchGesture = 'tap';

      if (distance > minSwipeDistance) {
        // Swipe gesture
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          gestureType = deltaX > 0 ? 'swipe-right' : 'swipe-left';
        } else {
          gestureType = deltaY > 0 ? 'swipe-down' : 'swipe-up';
        }
      } else if (duration < maxTapDuration) {
        // Tap gesture
        setTimeout(() => {
          setTouchState(current => {
            const newTapCount = current.tapCount + 1;

            if (newTapCount === 1) {
              // Single tap - delay to check for double tap
              setTimeout(() => {
                setTouchState(current => {
                  if (current.tapCount === 1) {
                    // Confirmed single tap
                    onGesture({
                      type: 'tap',
                      startX: prev.startX,
                      startY: prev.startY,
                      endX: prev.currentX,
                      endY: prev.currentY,
                      deltaX,
                      deltaY,
                      velocity,
                      duration,
                    });
                  }
                  return { ...current, tapCount: 0 };
                });
              }, 300);
            } else if (newTapCount === 2) {
              // Double tap
              onGesture({
                type: 'double-tap',
                startX: prev.startX,
                startY: prev.startY,
                endX: prev.currentX,
                endY: prev.currentY,
                deltaX,
                deltaY,
                velocity,
                duration,
              });
              return { ...current, tapCount: 0 };
            }

            return { ...current, tapCount: newTapCount };
          });
        }, 0);
      }

      // Trigger swipe gesture
      if (gestureType !== 'tap') {
        onGesture({
          type: gestureType,
          startX: prev.startX,
          startY: prev.startY,
          endX: prev.currentX,
          endY: prev.currentY,
          deltaX,
          deltaY,
          velocity,
          duration,
        });
      }

      return {
        ...prev,
        isTracking: false,
        longPressTimer: null,
      };
    });
  }, [onGesture, minSwipeDistance, maxTapDuration]);

  useEffect(() => {
    const element = touchRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return touchRef;
}

// Swipeable container component
interface SwipeableContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  preventDefault?: boolean;
}

const SwipeableContainer: React.FC<SwipeableContainerProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  preventDefault = false,
  className,
  ...props
}) => {
  const handleGesture = useCallback((event: GestureEvent) => {

    switch (event.type) {
      case 'swipe-left':
        if (Math.abs(event.deltaX) > threshold) onSwipeLeft?.();
        break;
      case 'swipe-right':
        if (Math.abs(event.deltaX) > threshold) onSwipeRight?.();
        break;
      case 'swipe-up':
        if (Math.abs(event.deltaY) > threshold) onSwipeUp?.();
        break;
      case 'swipe-down':
        if (Math.abs(event.deltaY) > threshold) onSwipeDown?.();
        break;
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold, preventDefault]);

  const touchRef = useTouchGesture(handleGesture, { minSwipeDistance: threshold });

  return (
    <div
      ref={touchRef}
      className={cn('touch-manipulation', className)}
      {...props}
    >
      {children}
    </div>
  );
};

// Pull-to-refresh component
interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
  className?: string;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  threshold = 80,
  className,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      setStartY(e.touches[0].clientY);
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (startY === 0 || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY);

    if (distance > 0 && containerRef.current?.scrollTop === 0) {
      e.preventDefault();
      setPullDistance(distance);
    }
  }, [startY, isRefreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
    setStartY(0);
  }, [pullDistance, threshold, isRefreshing, onRefresh]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const touchStart = (e: TouchEvent) => handleTouchStart(e);
    const touchMove = (e: TouchEvent) => handleTouchMove(e);
    const touchEnd = () => handleTouchEnd();

    element.addEventListener('touchstart', touchStart, { passive: false });
    element.addEventListener('touchmove', touchMove, { passive: false });
    element.addEventListener('touchend', touchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', touchStart);
      element.removeEventListener('touchmove', touchMove);
      element.removeEventListener('touchend', touchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const pullProgress = Math.min(pullDistance / threshold, 1);
  const rotation = pullProgress * 360;

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Pull indicator */}
      <div
        className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center bg-background/95 backdrop-blur-sm transition-transform duration-200"
        style={{
          transform: `translateY(${Math.max(-100, pullDistance - 60)}px)`,
          height: '60px',
        }}
      >
        <div
          className="transition-transform duration-200"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {isRefreshing ? (
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
          ) : (
            <svg
              className="h-6 w-6 text-muted-foreground transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          )}
        </div>
        <span className="ml-2 text-sm text-muted-foreground">
          {isRefreshing ? 'Refreshing...' : pullDistance > threshold ? 'Release to refresh' : 'Pull to refresh'}
        </span>
      </div>

      {/* Content */}
      <div
        ref={containerRef}
        className="h-full overflow-y-auto"
        style={{
          transform: `translateY(${pullDistance > 0 ? Math.min(pullDistance, threshold) : 0}px)`,
          transition: isRefreshing ? 'none' : 'transform 0.2s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Touch feedback component
interface TouchFeedbackProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  feedbackType?: 'ripple' | 'scale' | 'glow';
  disabled?: boolean;
}

const TouchFeedback: React.FC<TouchFeedbackProps> = ({
  children,
  feedbackType = 'ripple',
  disabled = false,
  className,
  ...props
}) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [isPressed, setIsPressed] = useState(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;

    setIsPressed(true);

    if (feedbackType === 'ripple') {
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
  }, [disabled, feedbackType]);

  const handleTouchEnd = useCallback(() => {
    setIsPressed(false);
  }, []);

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
  };

  return (
    <div
      className={cn(
        'touch-manipulation',
        feedbackClasses[feedbackType],
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      {...props}
    >
      {children}

      {/* Ripple effects */}
      {feedbackType === 'ripple' && ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 animate-ping"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
          }}
        />
      ))}
    </div>
  );
};

// Mobile-optimized button with touch feedback
interface MobileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}

const MobileButton: React.FC<MobileButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled,
  className,
  ...props
}) => {
  const variants = {
    primary: 'bg-primary text-primary-foreground active:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground active:bg-secondary/90',
    outline: 'border border-border bg-background active:bg-accent',
    ghost: 'hover:bg-accent hover:text-accent-foreground active:bg-accent',
  };

  const sizes = {
    sm: 'h-10 px-3 text-sm min-h-[44px]', // iOS minimum touch target
    md: 'h-12 px-4 min-h-[44px]',
    lg: 'h-14 px-6 text-lg min-h-[44px]',
  };

  return (
    <TouchFeedback feedbackType="scale">
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium',
          'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:pointer-events-none disabled:opacity-50',
          'touch-manipulation select-none', // Prevent text selection on mobile
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    </TouchFeedback>
  );
};

export {
  SwipeableContainer,
  PullToRefresh,
  TouchFeedback,
  MobileButton,
};