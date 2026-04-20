'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

// Reduced motion detection hook
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

// GPU-accelerated animation utilities
export const gpuAnimations = {
  // Transform-based animations (GPU accelerated)
  slideIn: {
    from: { transform: 'translate3d(-100%, 0, 0)', opacity: 0 },
    to: { transform: 'translate3d(0, 0, 0)', opacity: 1 },
    config: { duration: 300, easing: 'ease-out' },
  },

  slideOut: {
    from: { transform: 'translate3d(0, 0, 0)', opacity: 1 },
    to: { transform: 'translate3d(100%, 0, 0)', opacity: 0 },
    config: { duration: 300, easing: 'ease-in' },
  },

  scaleIn: {
    from: { transform: 'scale3d(0.8, 0.8, 1)', opacity: 0 },
    to: { transform: 'scale3d(1, 1, 1)', opacity: 1 },
    config: { duration: 200, easing: 'ease-out' },
  },

  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { duration: 300, easing: 'ease-out' },
  },

  bounceIn: {
    from: { transform: 'scale3d(0.3, 0.3, 1)', opacity: 0 },
    to: { transform: 'scale3d(1, 1, 1)', opacity: 1 },
    config: { duration: 500, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' },
  },
};

// Web Animations API utility
export class AnimationController {
  private animations = new Map<string, Animation>();

  animate(
    element: HTMLElement,
    keyframes: Keyframe[] | PropertyIndexedKeyframes,
    options: KeyframeAnimationOptions = {}
  ): Animation {
    const animation = element.animate(keyframes, {
      fill: 'both',
      ...options,
    });

    // Store animation reference for cleanup
    const id = Math.random().toString(36).substr(2, 9);
    this.animations.set(id, animation);

    animation.addEventListener('finish', () => {
      this.animations.delete(id);
    });

    return animation;
  }

  // Batch animations for better performance
  animateBatch(
    animations: Array<{
      element: HTMLElement;
      keyframes: Keyframe[] | PropertyIndexedKeyframes;
      options?: KeyframeAnimationOptions;
    }>
  ): Animation[] {
    return animations.map(({ element, keyframes, options }) =>
      this.animate(element, keyframes, options)
    );
  }

  // Cancel all animations
  cancelAll(): void {
    this.animations.forEach(animation => animation.cancel());
    this.animations.clear();
  }

  // Pause all animations
  pauseAll(): void {
    this.animations.forEach(animation => animation.pause());
  }

  // Resume all animations
  resumeAll(): void {
    this.animations.forEach(animation => animation.play());
  }
}

// Global animation controller instance
export const animationController = new AnimationController();

// Performance-aware animation hook
export function useAnimationController() {
  const prefersReducedMotion = useReducedMotion();

  const animate = useCallback((
    element: HTMLElement,
    keyframes: Keyframe[] | PropertyIndexedKeyframes,
    options: KeyframeAnimationOptions = {}
  ) => {
    if (prefersReducedMotion) {
      // Skip animations for reduced motion preference
      return {
        play: () => {},
        pause: () => {},
        cancel: () => {},
        finish: Promise.resolve(),
      } as Animation;
    }

    return animationController.animate(element, keyframes, options);
  }, [prefersReducedMotion]);

  const animateBatch = useCallback((
    animations: Array<{
      element: HTMLElement;
      keyframes: Keyframe[] | PropertyIndexedKeyframes;
      options?: KeyframeAnimationOptions;
    }>
  ) => {
    if (prefersReducedMotion) {
      return [];
    }

    return animationController.animateBatch(animations);
  }, [prefersReducedMotion]);

  return {
    animate,
    animateBatch,
    cancelAll: animationController.cancelAll.bind(animationController),
    pauseAll: animationController.pauseAll.bind(animationController),
    resumeAll: animationController.resumeAll.bind(animationController),
  };
}

// Optimized transition component
interface OptimizedTransitionProps {
  children: React.ReactNode;
  show: boolean;
  enter: Keyframe[] | PropertyIndexedKeyframes;
  exit?: Keyframe[] | PropertyIndexedKeyframes;
  duration?: number;
  delay?: number;
  className?: string;
}

const OptimizedTransition: React.FC<OptimizedTransitionProps> = ({
  children,
  show,
  enter,
  exit,
  duration = 300,
  delay = 0,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(show);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { animate } = useAnimationController();

  useEffect(() => {
    if (show === isVisible) return;

    setIsAnimating(true);

    const element = containerRef.current;
    if (!element) return;

    const keyframes = show ? enter : (exit || enter);
    const animation = animate(element, keyframes, {
      duration,
      delay,
      fill: 'both',
    });

    animation.addEventListener('finish', () => {
      setIsAnimating(false);
      setIsVisible(show);
    });

    return () => {
      animation.cancel();
    };
  }, [show, enter, exit, duration, delay, animate]);

  if (!isVisible && !isAnimating) return null;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ willChange: 'transform, opacity' }} // GPU hint
    >
      {children}
    </div>
  );
};

// Staggered animation component
interface StaggeredAnimationProps {
  children: React.ReactNode;
  staggerDelay?: number;
  animation: Keyframe[] | PropertyIndexedKeyframes;
  duration?: number;
  className?: string;
}

const StaggeredAnimation: React.FC<StaggeredAnimationProps> = ({
  children,
  staggerDelay = 100,
  animation,
  duration = 300,
  className,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { animateBatch } = useAnimationController();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const elements = Array.from(container.children) as HTMLElement[];
    const animations = elements.map((element, index) => ({
      element,
      keyframes: animation,
      options: {
        duration,
        delay: index * staggerDelay,
        fill: 'both',
      },
    }));

    const animationInstances = animateBatch(animations);

    return () => {
      animationInstances.forEach(anim => anim.cancel());
    };
  }, [children, staggerDelay, animation, duration, animateBatch]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

// Morphing animation for shape changes
interface MorphingShapeProps {
  children: React.ReactNode;
  targetShape: 'circle' | 'square' | 'rectangle' | 'triangle';
  duration?: number;
  className?: string;
}

const MorphingShape: React.FC<MorphingShapeProps> = ({
  children,
  targetShape,
  duration = 500,
  className,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { animate } = useAnimationController();

  const morphToShape = useCallback(() => {
    const element = containerRef.current;
    if (!element) return;

    const shapes = {
      circle: { borderRadius: '50%', clipPath: 'circle(50%)' },
      square: { borderRadius: '0', clipPath: 'none' },
      rectangle: { borderRadius: '8px', clipPath: 'none' },
      triangle: { borderRadius: '0', clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' },
    };

    animate(element, shapes[targetShape], { duration, fill: 'both' });
  }, [targetShape, duration, animate]);

  useEffect(() => {
    morphToShape();
  }, [morphToShape]);

  return (
    <div
      ref={containerRef}
      className={cn('transition-all duration-300', className)}
      style={{ willChange: 'border-radius, clip-path' }}
    >
      {children}
    </div>
  );
};

// Performance monitoring for animations
export function useAnimationPerformance() {
  const [metrics, setMetrics] = useState({
    fps: 60,
    frameDrops: 0,
    animationCount: 0,
    memoryUsage: 0,
  });

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let frameDrops = 0;
    let animationCount = 0;

    const measureFPS = () => {
      const now = performance.now();
      const delta = now - lastTime;

      if (delta >= 1000) {
        const fps = Math.round((frameCount * 1000) / delta);
        frameDrops = Math.max(0, 60 - fps); // Assuming 60fps target

        // Count active animations
        animationCount = document.getAnimations().length;

        // Memory usage (if available)
        const mem = (performance as any).memory;
        const memoryUsage = mem ? Math.round(mem.usedJSHeapSize / 1024 / 1024) : 0;

        setMetrics({ fps, frameDrops, animationCount, memoryUsage });

        frameCount = 0;
        lastTime = now;
      }

      frameCount++;
      requestAnimationFrame(measureFPS);
    };

    const animationId = requestAnimationFrame(measureFPS);

    return () => cancelAnimationFrame(animationId);
  }, []);

  return metrics;
}

// CSS containment for performance
interface ContainedElementProps extends React.HTMLAttributes<HTMLDivElement> {
  containment?: 'layout' | 'style' | 'paint' | 'size' | 'all';
}

const ContainedElement: React.FC<ContainedElementProps> = ({
  containment = 'layout',
  style,
  ...props
}) => {
  const containmentValue = containment === 'all'
    ? 'layout style paint size'
    : containment;

  return (
    <div
      style={{
        contain: containmentValue,
        ...style,
      }}
      {...props}
    />
  );
};

// Transform-based animations (GPU accelerated)
const gpuTransformAnimations = {
  'slide-in-left': 'animate-in slide-in-from-left-4 duration-300',
  'slide-in-right': 'animate-in slide-in-from-right-4 duration-300',
  'slide-in-up': 'animate-in slide-in-from-bottom-4 duration-300',
  'slide-in-down': 'animate-in slide-in-from-top-4 duration-300',
  'scale-in': 'animate-in zoom-in-95 duration-200',
  'scale-out': 'animate-out zoom-out-95 duration-200',
  'fade-in': 'animate-in fade-in duration-300',
  'fade-out': 'animate-out fade-out duration-300',
  'bounce-in': 'animate-in bounce-in duration-500',
  'spin': 'animate-spin duration-1000',
  'pulse': 'animate-pulse duration-2000',
};

// Animation presets with performance considerations
export const animationPresets = {
  // Fast animations (200ms)
  fast: {
    slideIn: gpuTransformAnimations['slide-in-right'],
    fadeIn: gpuTransformAnimations['fade-in'],
    scaleIn: gpuTransformAnimations['scale-in'],
    bounceIn: gpuTransformAnimations['bounce-in'],
  },

  // Standard animations (300ms)
  standard: {
    slideIn: gpuTransformAnimations['slide-in-right'],
    fadeIn: gpuTransformAnimations['fade-in'],
    scaleIn: gpuTransformAnimations['scale-in'],
  },

  // Slow animations (500ms)
  slow: {
    slideIn: gpuTransformAnimations['slide-in-right'],
    fadeIn: gpuTransformAnimations['fade-in'],
    scaleIn: gpuTransformAnimations['scale-in'],
  },

  // Reduced motion alternatives
  reduced: {
    slideIn: 'opacity-0 animate-in fade-in duration-200',
    fadeIn: 'opacity-0 animate-in fade-in duration-200',
    scaleIn: 'opacity-0 animate-in fade-in duration-200',
    bounceIn: 'opacity-0 animate-in fade-in duration-200',
  },
};

// Animation timing utilities
export const timing = {
  // Easing functions
  ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',

  // Duration presets
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 700,
};

export {
  OptimizedTransition,
  StaggeredAnimation,
  MorphingShape,
  ContainedElement,
  gpuTransformAnimations,
  animationPresets,
  timing,
};