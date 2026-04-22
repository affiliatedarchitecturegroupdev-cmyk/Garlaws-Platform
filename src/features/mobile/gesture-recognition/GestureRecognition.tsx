'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

// Gesture types
export type GestureType =
  | 'tap'
  | 'double-tap'
  | 'long-press'
  | 'swipe-left'
  | 'swipe-right'
  | 'swipe-up'
  | 'swipe-down'
  | 'pinch'
  | 'rotate'
  | 'pan';

export interface GestureEvent {
  type: GestureType;
  target: HTMLElement;
  clientX: number;
  clientY: number;
  velocity?: number;
  scale?: number;
  rotation?: number;
  duration?: number;
}

// Haptic feedback patterns
export type HapticPattern =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error'
  | 'selection';

// Gesture recognition hook
export function useGestureRecognition(
  onGesture?: (event: GestureEvent) => void,
  options: {
    enableHaptics?: boolean;
    minSwipeDistance?: number;
    longPressDelay?: number;
    doubleTapDelay?: number;
  } = {}
) {
  const {
    enableHaptics = true,
    minSwipeDistance = 50,
    longPressDelay = 500,
    doubleTapDelay = 300,
  } = options;

  const elementRef = useRef<HTMLElement>(null);
  const [isGestureActive, setIsGestureActive] = useState(false);

  // Touch tracking
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTapRef = useRef<number>(0);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Multi-touch tracking for gestures like pinch and rotate
  const touchesRef = useRef<Map<number, { x: number; y: number }>>(new Map());

  const triggerHaptic = useCallback((pattern: HapticPattern) => {
    if (!enableHaptics || !('vibrate' in navigator)) return;

    switch (pattern) {
      case 'light':
        navigator.vibrate(50);
        break;
      case 'medium':
        navigator.vibrate(100);
        break;
      case 'heavy':
        navigator.vibrate(200);
        break;
      case 'success':
        navigator.vibrate([50, 50, 50]);
        break;
      case 'warning':
        navigator.vibrate([100, 50, 100]);
        break;
      case 'error':
        navigator.vibrate([200, 100, 200, 100, 200]);
        break;
      case 'selection':
        navigator.vibrate(25);
        break;
    }
  }, [enableHaptics]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;

    const startPos = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    touchStartRef.current = startPos;
    setIsGestureActive(true);

    // Track multiple touches for multi-touch gestures
    touchesRef.current.clear();
    for (let i = 0; i < e.touches.length; i++) {
      const t = e.touches[i];
      touchesRef.current.set(t.identifier, { x: t.clientX, y: t.clientY });
    }

    // Set up long press timer
    longPressTimerRef.current = setTimeout(() => {
      triggerHaptic('medium');
      onGesture?.({
        type: 'long-press',
        target: e.target as HTMLElement,
        clientX: touch.clientX,
        clientY: touch.clientY,
        duration: Date.now() - startPos.time,
      });
    }, longPressDelay);
  }, [longPressDelay, triggerHaptic, onGesture]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = e.touches[0];
    if (!touch) return;

    // Clear long press timer if moving
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Handle multi-touch gestures
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];

      // Pinch gesture
      const prevTouches = Array.from(touchesRef.current.values());
      if (prevTouches.length === 2) {
        const prevDist = Math.sqrt(
          Math.pow(prevTouches[0].x - prevTouches[1].x, 2) +
          Math.pow(prevTouches[0].y - prevTouches[1].y, 2)
        );
        const currDist = Math.sqrt(
          Math.pow(touch1.clientX - touch2.clientX, 2) +
          Math.pow(touch1.clientY - touch2.clientY, 2)
        );
        const scale = currDist / prevDist;

        if (Math.abs(scale - 1) > 0.1) {
          triggerHaptic('light');
          onGesture?.({
            type: 'pinch',
            target: e.target as HTMLElement,
            clientX: (touch1.clientX + touch2.clientX) / 2,
            clientY: (touch1.clientY + touch2.clientY) / 2,
            scale,
          });
        }
      }
    }

    // Update touch positions
    touchesRef.current.clear();
    for (let i = 0; i < e.touches.length; i++) {
      const t = e.touches[i];
      touchesRef.current.set(t.identifier, { x: t.clientX, y: t.clientY });
    }
  }, [triggerHaptic, onGesture]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = e.changedTouches[0];
    if (!touch) return;

    const endTime = Date.now();
    const duration = endTime - touchStartRef.current.time;
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = distance / duration;

    // Clear timers
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Handle tap gestures
    if (distance < 10 && duration < 300) {
      const now = Date.now();
      const timeSinceLastTap = now - lastTapRef.current;

      if (timeSinceLastTap < doubleTapDelay) {
        // Double tap
        triggerHaptic('selection');
        onGesture?.({
          type: 'double-tap',
          target: e.target as HTMLElement,
          clientX: touch.clientX,
          clientY: touch.clientY,
          velocity,
        });
        lastTapRef.current = 0;
      } else {
        // Single tap
        triggerHaptic('light');
        onGesture?.({
          type: 'tap',
          target: e.target as HTMLElement,
          clientX: touch.clientX,
          clientY: touch.clientY,
          velocity,
        });
        lastTapRef.current = now;
      }
    }
    // Handle swipe gestures
    else if (distance > minSwipeDistance) {
      let gestureType: GestureType;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        gestureType = deltaX > 0 ? 'swipe-right' : 'swipe-left';
      } else {
        // Vertical swipe
        gestureType = deltaY > 0 ? 'swipe-down' : 'swipe-up';
      }

      triggerHaptic('medium');
      onGesture?.({
        type: gestureType,
        target: e.target as HTMLElement,
        clientX: touch.clientX,
        clientY: touch.clientY,
        velocity,
      });
    }

    touchStartRef.current = null;
    touchesRef.current.clear();
    setIsGestureActive(false);
  }, [doubleTapDelay, minSwipeDistance, triggerHaptic, onGesture]);

  useEffect(() => {
    const element = elementRef.current;
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

  return {
    elementRef,
    isGestureActive,
    triggerHaptic,
  };
}

// Gesture-based component with visual feedback
interface GestureComponentProps {
  children: React.ReactNode;
  onGesture?: (event: GestureEvent) => void;
  className?: string;
  gestureOptions?: Parameters<typeof useGestureRecognition>[1];
  showFeedback?: boolean;
}

export const GestureComponent: React.FC<GestureComponentProps> = ({
  children,
  onGesture,
  className,
  gestureOptions,
  showFeedback = true,
}) => {
  const [feedback, setFeedback] = useState<{ type: GestureType; x: number; y: number } | null>(null);
  const { elementRef, isGestureActive, triggerHaptic } = useGestureRecognition(
    (event) => {
      if (showFeedback) {
        setFeedback({ type: event.type, x: event.clientX, y: event.clientY });
        setTimeout(() => setFeedback(null), 500);
      }
      onGesture?.(event);
    },
    gestureOptions
  );

  const getFeedbackIcon = (type: GestureType) => {
    switch (type) {
      case 'tap': return '👆';
      case 'double-tap': return '⚡';
      case 'long-press': return '⏱️';
      case 'swipe-left': return '⬅️';
      case 'swipe-right': return '➡️';
      case 'swipe-up': return '⬆️';
      case 'swipe-down': return '⬇️';
      case 'pinch': return '🤏';
      default: return '✨';
    }
  };

  return (
    <div
      ref={elementRef as any}
      className={cn(
        'relative select-none',
        isGestureActive && 'scale-105 transition-transform duration-100',
        className
      )}
    >
      {children}

      {/* Gesture feedback overlay */}
      {feedback && (
        <div
          className="fixed z-50 pointer-events-none animate-in zoom-in duration-300"
          style={{
            left: feedback.x - 20,
            top: feedback.y - 20,
          }}
        >
          <div className="bg-black/80 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
            {getFeedbackIcon(feedback.type)}
          </div>
        </div>
      )}

      {/* Gesture activity indicator */}
      {isGestureActive && (
        <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none animate-pulse" />
      )}
    </div>
  );
};

// Motion sensing hook for device orientation and acceleration
export function useMotionSensors() {
  const [orientation, setOrientation] = useState<{
    alpha: number;
    beta: number;
    gamma: number;
  } | null>(null);
  const [acceleration, setAcceleration] = useState<{
    x: number;
    y: number;
    z: number;
  } | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const hasOrientation = 'DeviceOrientationEvent' in window;
    const hasMotion = 'DeviceMotionEvent' in window;
    setIsSupported(hasOrientation || hasMotion);

    if (!hasOrientation && !hasMotion) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      setOrientation({
        alpha: e.alpha || 0,
        beta: e.beta || 0,
        gamma: e.gamma || 0,
      });
    };

    const handleMotion = (e: DeviceMotionEvent) => {
      if (e.accelerationIncludingGravity) {
        setAcceleration({
          x: e.accelerationIncludingGravity.x || 0,
          y: e.accelerationIncludingGravity.y || 0,
          z: e.accelerationIncludingGravity.z || 0,
        });
      }
    };

    if (hasOrientation) {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    if (hasMotion) {
      window.addEventListener('devicemotion', handleMotion);
    }

    return () => {
      if (hasOrientation) {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
      if (hasMotion) {
        window.removeEventListener('devicemotion', handleMotion);
      }
    };
  }, []);

  return {
    orientation,
    acceleration,
    isSupported,
  };
};

// Motion-based interactive component
interface MotionComponentProps {
  children: React.ReactNode;
  onMotion?: (orientation: any, acceleration: any) => void;
  className?: string;
  sensitivity?: number;
}

export const MotionComponent: React.FC<MotionComponentProps> = ({
  children,
  onMotion,
  className,
  sensitivity = 1,
}) => {
  const { orientation, acceleration, isSupported } = useMotionSensors();
  const [transform, setTransform] = useState('');

  useEffect(() => {
    if (orientation && acceleration) {
      const { beta, gamma } = orientation;
      const { x, y, z } = acceleration;

      // Create 3D transform based on device orientation
      const rotateX = Math.min(Math.max(beta * sensitivity, -30), 30);
      const rotateY = Math.min(Math.max(gamma * sensitivity, -30), 30);
      const translateZ = Math.min(Math.max((x + y + z) * sensitivity * 2, -20), 20);

      setTransform(`rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px)`);

      onMotion?.(orientation, acceleration);
    }
  }, [orientation, acceleration, sensitivity, onMotion]);

  if (!isSupported) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={cn('transition-transform duration-100 ease-out', className)}
      style={{
        transform,
        transformStyle: 'preserve-3d',
      }}
    >
      {children}
    </div>
  );
};