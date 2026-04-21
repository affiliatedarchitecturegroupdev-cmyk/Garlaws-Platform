'use client';

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        destructive: 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
        success: 'border-green-500/50 text-green-700 dark:border-green-500 dark:text-green-400 [&>svg]:text-green-600',
        warning: 'border-yellow-500/50 text-yellow-700 dark:border-yellow-500 dark:text-yellow-400 [&>svg]:text-yellow-600',
        info: 'border-blue-500/50 text-blue-700 dark:border-blue-500 dark:text-blue-400 [&>svg]:text-blue-600',
      },
      size: {
        default: 'p-4',
        sm: 'p-3',
        lg: 'p-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  icon?: React.ReactNode;
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, size, children, icon, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant, size }), className)}
      {...props}
    >
      {icon && <div className="flex-shrink-0">{icon}</div>}
      {children}
    </div>
  )
);

Alert.displayName = 'Alert';

const AlertTitle = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 font-medium leading-none tracking-tight', className)}
    {...props}
  />
));

AlertTitle.displayName = 'AlertTitle';

const AlertDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm [&_p]:leading-relaxed', className)}
    {...props}
  />
));

AlertDescription.displayName = 'AlertDescription';

// Pre-configured alert variants
const AlertSuccess: React.FC<Omit<AlertProps, 'variant'>> = (props) => (
  <Alert variant="success" {...props}>
    <CheckCircle className="h-4 w-4" />
    {props.children}
  </Alert>
);

const AlertError: React.FC<Omit<AlertProps, 'variant'>> = (props) => (
  <Alert variant="destructive" {...props}>
    <XCircle className="h-4 w-4" />
    {props.children}
  </Alert>
);

const AlertWarning: React.FC<Omit<AlertProps, 'variant'>> = (props) => (
  <Alert variant="warning" {...props}>
    <AlertTriangle className="h-4 w-4" />
    {props.children}
  </Alert>
);

const AlertInfo: React.FC<Omit<AlertProps, 'variant'>> = (props) => (
  <Alert variant="info" {...props}>
    <Info className="h-4 w-4" />
    {props.children}
  </Alert>
);

export {
  Alert,
  AlertTitle,
  AlertDescription,
  AlertSuccess,
  AlertError,
  AlertWarning,
  AlertInfo,
  alertVariants
};