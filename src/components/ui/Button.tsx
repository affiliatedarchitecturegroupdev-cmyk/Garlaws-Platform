'use client';

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { designTokens } from '@/design-system/tokens';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        gradient: 'bg-gradient-to-r from-primary to-accent text-white hover:from-primary/90 hover:to-accent/90 shadow-lg',
        glass: 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        xl: 'h-12 rounded-lg px-10 text-base',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12',
      },
      shape: {
        default: 'rounded-md',
        round: 'rounded-full',
        square: 'rounded-none',
        pill: 'rounded-full px-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      shape: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    shape,
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled,
    children,
    ...props
  }, ref) => {
    return (
      <button
        className={cn(
          buttonVariants({ variant, size, shape }),
          fullWidth && 'w-full',
          className
        )}
        ref={ref}
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
        <span className={cn(loading && 'opacity-70')}>{children}</span>
        {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Compound component for button groups
interface ButtonGroupProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline';
  size?: 'sm' | 'default' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  variant = 'default',
  size = 'default',
  orientation = 'horizontal',
  className,
}) => {
  const orientationClasses = orientation === 'horizontal'
    ? 'flex flex-row'
    : 'flex flex-col';

  return (
    <div
      className={cn(
        'inline-flex rounded-md shadow-sm divide-x divide-border',
        orientationClasses,
        orientation === 'vertical' && 'divide-y divide-x-0',
        className
      )}
      role="group"
    >
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          const isFirst = index === 0;
          const isLast = index === React.Children.count(children) - 1;

          let roundedClasses = '';
          if (orientation === 'horizontal') {
            if (isFirst) roundedClasses = 'rounded-r-none';
            else if (isLast) roundedClasses = 'rounded-l-none';
            else roundedClasses = 'rounded-none';
          } else {
            if (isFirst) roundedClasses = 'rounded-b-none';
            else if (isLast) roundedClasses = 'rounded-t-none';
            else roundedClasses = 'rounded-none';
          }

          return (
            <div className={roundedClasses}>
              {React.cloneElement(child, {
                variant: variant === 'outline' ? 'outline' : (child.props as any).variant || 'default',
                size: size,
                className: cn((child.props as any).className, 'border-0 shadow-none'),
              } as any)}
            </div>
          );
        }
        return child;
      })}
    </div>
  );
};

// Floating Action Button variant
interface FABProps extends Omit<ButtonProps, 'size' | 'shape'> {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'sm' | 'default' | 'lg';
}

const FAB = forwardRef<HTMLButtonElement, FABProps>(
  ({ className, position = 'bottom-right', size = 'default', ...props }, ref) => {
    const positionClasses = {
      'bottom-right': 'fixed bottom-6 right-6',
      'bottom-left': 'fixed bottom-6 left-6',
      'top-right': 'fixed top-6 right-6',
      'top-left': 'fixed top-6 left-6',
    };

    const sizeClasses = {
      sm: 'h-12 w-12',
      default: 'h-14 w-14',
      lg: 'h-16 w-16',
    };

    return (
      <Button
        ref={ref}
        className={cn(
          positionClasses[position],
          sizeClasses[size],
          'rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-200 z-50',
          className
        )}
        shape="round"
        size="icon"
        {...props}
      />
    );
  }
);

FAB.displayName = 'FAB';

export { Button, ButtonGroup, FAB, buttonVariants };