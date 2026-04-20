'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Animation utilities
export const animationUtils = {
  // Scale animations
  scale: {
    in: 'animate-in zoom-in-95 duration-200',
    out: 'animate-out zoom-out-95 duration-200',
    hover: 'hover:scale-105 transition-transform duration-200',
    tap: 'active:scale-95 transition-transform duration-75',
  },

  // Fade animations
  fade: {
    in: 'animate-in fade-in duration-300',
    out: 'animate-out fade-out duration-200',
    hover: 'hover:opacity-80 transition-opacity duration-200',
  },

  // Slide animations
  slide: {
    up: 'animate-in slide-in-from-bottom-2 duration-300',
    down: 'animate-in slide-in-from-top-2 duration-300',
    left: 'animate-in slide-in-from-right-2 duration-300',
    right: 'animate-in slide-in-from-left-2 duration-300',
    outUp: 'animate-out slide-out-to-top-2 duration-200',
    outDown: 'animate-out slide-out-to-bottom-2 duration-200',
  },

  // Bounce animations
  bounce: {
    subtle: 'animate-pulse',
    gentle: 'hover:animate-bounce transition-all duration-300',
  },

  // Rotation animations
  spin: {
    slow: 'animate-spin duration-1000',
    fast: 'animate-spin duration-300',
    onHover: 'hover:rotate-12 transition-transform duration-200',
  },

  // Border animations
  border: {
    glow: 'hover:border-primary/50 hover:shadow-lg transition-all duration-300',
    pulse: 'animate-pulse border-2',
  },

  // Background animations
  background: {
    shimmer: 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent',
    gradient: 'bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 bg-[length:200%_100%] animate-gradient',
  },
};

// Micro-interaction variants
const microVariants = cva('', {
  variants: {
    animation: {
      none: '',
    scale: animationUtils.scale.hover,
    fade: animationUtils.fade.hover,
    glow: animationUtils.border.glow,
    bounce: animationUtils.bounce.gentle,
    spin: animationUtils.spin.onHover,
    shimmer: animationUtils.background.shimmer,
    },
    onClick: {
      none: '',
      scale: animationUtils.scale.tap,
      pulse: 'animate-ping',
    },
  },
  defaultVariants: {
    animation: 'none',
    onClick: 'scale',
  },
});

export interface MicroProps extends VariantProps<typeof microVariants> {
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

// Micro-interaction wrapper component
const Micro = React.forwardRef<HTMLElement, MicroProps>(
  ({ children, className, animation, onClick, as = 'div', ...props }, ref) => {
    const Component = as as any;

    return (
      <Component
        ref={ref}
        className={cn(microVariants({ animation, onClick }), className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Micro.displayName = 'Micro';

// Enhanced Button with micro-interactions
interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  animation?: 'scale' | 'glow' | 'shimmer' | 'bounce';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    animation = 'scale',
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props
  }, ref) => {
    const variants = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
      outline: 'border border-border bg-background hover:bg-accent hover:text-accent-foreground',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      gradient: 'bg-gradient-to-r from-primary to-accent text-white shadow-lg',
    };

    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4',
      lg: 'h-12 px-6 text-lg',
    };

    return (
      <Micro animation={animation} as="button">
        <button
          ref={ref}
          className={cn(
            'inline-flex items-center justify-center rounded-md font-medium transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:pointer-events-none disabled:opacity-50',
            variants[variant],
            sizes[size],
            animation === 'glow' && 'hover:shadow-lg hover:shadow-primary/25',
            animation === 'shimmer' && 'relative overflow-hidden',
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

          {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}

          <span className={cn(loading && 'opacity-70')}>
            {children}
          </span>

          {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
        </button>
      </Micro>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';

// Animated Card with hover effects
interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass' | 'bordered';
  animation?: 'lift' | 'glow' | 'scale' | 'none';
  padding?: 'sm' | 'md' | 'lg';
}

const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, variant = 'default', animation = 'lift', padding = 'md', ...props }, ref) => {
    const variants = {
      default: 'bg-card text-card-foreground shadow-sm border',
      elevated: 'bg-card text-card-foreground shadow-lg border-0',
      glass: 'bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl',
      bordered: 'border-2 border-border bg-card text-card-foreground',
    };

    const paddings = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    const animations = {
      lift: 'hover:-translate-y-2 hover:shadow-xl transition-all duration-300',
      glow: 'hover:shadow-lg hover:shadow-primary/25 transition-all duration-300',
      scale: 'hover:scale-105 transition-transform duration-200',
      none: '',
    };

    return (
      <Micro animation={animation === 'none' ? 'none' : 'scale'} as="div">
        <div
          ref={ref}
          className={cn(
            'rounded-lg',
            variants[variant],
            paddings[padding],
            animations[animation],
            className
          )}
          {...props}
        />
      </Micro>
    );
  }
);

AnimatedCard.displayName = 'AnimatedCard';

// Loading skeleton component
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'rectangular', width, height, lines = 1, ...props }, ref) => {
    const baseClasses = 'animate-pulse bg-muted rounded';

    if (variant === 'text') {
      return (
        <div ref={ref} className={cn('space-y-2', className)} {...props}>
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={cn(baseClasses, 'h-4')}
              style={{
                width: i === lines - 1 ? '60%' : '100%',
                height: height || '1rem',
              }}
            />
          ))}
        </div>
      );
    }

    const style = {
      width: width || (variant === 'circular' ? '2.5rem' : '100%'),
      height: height || (variant === 'circular' ? '2.5rem' : '1rem'),
    };

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variant === 'circular' && 'rounded-full',
          className
        )}
        style={style}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

// Toast notification with animations
interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
}

const Toast = ({ message, type = 'info', duration = 4000, onClose }: ToastProps) => {
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: 'bg-green-500 text-white border-green-600',
    error: 'bg-red-500 text-white border-red-600',
    warning: 'bg-yellow-500 text-white border-yellow-600',
    info: 'bg-blue-500 text-white border-blue-600',
  };

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 min-w-64 max-w-sm p-4 rounded-lg border shadow-lg',
        'transform transition-all duration-300',
        visible
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0',
        typeStyles[type]
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{message}</p>
        <button
          onClick={() => {
            setVisible(false);
            setTimeout(onClose, 300);
          }}
          className="ml-4 text-white/70 hover:text-white transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  );
};

// Page transition wrapper
interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

const PageTransition = ({ children, className }: PageTransitionProps) => {
  return (
    <div
      className={cn(
        'animate-in fade-in slide-in-from-bottom-4 duration-500',
        className
      )}
    >
      {children}
    </div>
  );
};

export {
  animationUtils as animations,
  Micro,
  AnimatedButton,
  AnimatedCard,
  Skeleton,
  Toast,
  PageTransition,
  microVariants
};