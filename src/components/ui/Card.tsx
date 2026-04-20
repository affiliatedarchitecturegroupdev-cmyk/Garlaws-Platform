'use client';

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  'rounded-lg border bg-card text-card-foreground shadow-sm',
  {
    variants: {
      variant: {
        default: '',
        elevated: 'shadow-lg border-0',
        outlined: 'border-2 shadow-none',
        filled: 'border-0 bg-muted/50',
        glass: 'border border-white/20 bg-white/10 backdrop-blur-md shadow-2xl',
      },
      size: {
        default: 'p-6',
        sm: 'p-4',
        lg: 'p-8',
        xl: 'p-10',
      },
      hover: {
        default: '',
        lift: 'hover:shadow-lg hover:-translate-y-1 transition-all duration-200',
        glow: 'hover:shadow-lg hover:shadow-primary/25 transition-all duration-200',
        scale: 'hover:scale-105 transition-transform duration-200',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      hover: 'default',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, hover, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, size, hover }), className)}
      {...props}
    />
  )
);

Card.displayName = 'Card';

const CardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6 pt-0', className)}
    {...props}
  />
));

CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-2xl font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
));

CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));

CardDescription.displayName = 'CardDescription';

const CardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));

CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));

CardFooter.displayName = 'CardFooter';

// Enhanced Card variants

interface MetricCardProps extends CardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    label: string;
    trend: 'up' | 'down' | 'neutral';
  };
  icon?: React.ReactNode;
  loading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon,
  loading = false,
  className,
  ...props
}) => (
  <Card className={cn('relative overflow-hidden', className)} {...props}>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline space-x-2">
            {loading ? (
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            ) : (
              <p className="text-3xl font-bold tracking-tight">{value}</p>
            )}
            {change && (
              <div className={cn(
                'flex items-center text-sm font-medium',
                change.trend === 'up' && 'text-green-600',
                change.trend === 'down' && 'text-red-600',
                change.trend === 'neutral' && 'text-muted-foreground'
              )}>
                {change.trend === 'up' && '↗'}
                {change.trend === 'down' && '↘'}
                {change.trend === 'neutral' && '→'}
                <span className="ml-1">
                  {change.value > 0 ? '+' : ''}{change.value}% {change.label}
                </span>
              </div>
            )}
          </div>
        </div>
        {icon && (
          <div className="text-muted-foreground">
            {icon}
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

interface FeatureCardProps extends CardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  badge?: string;
  disabled?: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  action,
  badge,
  disabled = false,
  className,
  ...props
}) => (
  <Card
    className={cn(
      'relative transition-all duration-200',
      disabled && 'opacity-50 pointer-events-none',
      !disabled && 'hover:shadow-md hover:-translate-y-1',
      className
    )}
    {...props}
  >
    {badge && (
      <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
        {badge}
      </div>
    )}
    <CardContent className="p-6">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            {icon}
          </div>
        </div>
        <div className="flex-1 space-y-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-muted-foreground text-sm">{description}</p>
          {action && (
            <div className="pt-2">
              {action}
            </div>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

interface StatsCardProps extends CardProps {
  stats: Array<{
    label: string;
    value: string | number;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: number;
  }>;
  title?: string;
  layout?: 'grid' | 'list';
}

const StatsCard: React.FC<StatsCardProps> = ({
  stats,
  title,
  layout = 'grid',
  className,
  ...props
}) => (
  <Card className={className} {...props}>
    {title && (
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
    )}
    <CardContent>
      <div className={cn(
        layout === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'space-y-4'
      )}>
        {stats.map((stat, index) => (
          <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
            {stat.trend && stat.trendValue && (
              <div className={cn(
                'flex items-center text-sm font-medium px-2 py-1 rounded',
                stat.trend === 'up' && 'text-green-600 bg-green-100',
                stat.trend === 'down' && 'text-red-600 bg-red-100',
                stat.trend === 'neutral' && 'text-gray-600 bg-gray-100'
              )}>
                {stat.trend === 'up' && '↗'}
                {stat.trend === 'down' && '↘'}
                {stat.trend === 'neutral' && '→'}
                <span className="ml-1">{stat.trendValue}%</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  MetricCard,
  FeatureCard,
  StatsCard,
  cardVariants
};