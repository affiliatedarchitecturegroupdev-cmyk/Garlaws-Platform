'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { designTokens } from '@/design-system/tokens';

// Container component with responsive max-widths
interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  centered?: boolean;
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = 'lg', centered = true, ...props }, ref) => {
    const sizeClasses = {
      sm: 'max-w-2xl',
      md: 'max-w-4xl',
      lg: 'max-w-6xl',
      xl: 'max-w-7xl',
      '2xl': 'max-w-8xl',
      full: 'max-w-full',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'w-full',
          centered && 'mx-auto',
          sizeClasses[size],
          'px-4 sm:px-6 lg:px-8',
          className
        )}
        {...props}
      />
    );
  }
);

Container.displayName = 'Container';

// Grid system with consistent spacing
interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  gap?: keyof typeof designTokens.spacing;
  responsive?: {
    sm?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    md?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    lg?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    xl?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    '2xl'?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  };
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols = 1, gap = 6, responsive, ...props }, ref) => {
    const responsiveClasses = responsive ? [
      responsive.sm && `sm:grid-cols-${responsive.sm}`,
      responsive.md && `md:grid-cols-${responsive.md}`,
      responsive.lg && `lg:grid-cols-${responsive.lg}`,
      responsive.xl && `xl:grid-cols-${responsive.xl}`,
      responsive['2xl'] && `2xl:grid-cols-${responsive['2xl']}`,
    ].filter(Boolean) : [];

    return (
      <div
        ref={ref}
        className={cn(
          'grid',
          `grid-cols-${cols}`,
          `gap-${gap}`,
          ...responsiveClasses,
          className
        )}
        {...props}
      />
    );
  }
);

Grid.displayName = 'Grid';

// Flex utilities with consistent spacing
interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  gap?: keyof typeof designTokens.spacing;
  wrap?: boolean;
}

const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  ({
    className,
    direction = 'row',
    align,
    justify,
    gap = 4,
    wrap = false,
    ...props
  }, ref) => {
    const directionClasses = {
      row: 'flex-row',
      col: 'flex-col',
      'row-reverse': 'flex-row-reverse',
      'col-reverse': 'flex-col-reverse',
    };

    const alignClasses = align && {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    }[align];

    const justifyClasses = justify && {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    }[justify];

    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          directionClasses[direction],
          alignClasses,
          justifyClasses,
          `gap-${gap}`,
          wrap && 'flex-wrap',
          className
        )}
        {...props}
      />
    );
  }
);

Flex.displayName = 'Flex';

// Stack component for vertical spacing
interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: keyof typeof designTokens.spacing;
  align?: 'start' | 'center' | 'end' | 'stretch';
}

const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ className, spacing = 4, align, ...props }, ref) => {
    const alignClasses = align && {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
    }[align];

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col',
          `space-y-${spacing}`,
          alignClasses,
          className
        )}
        {...props}
      />
    );
  }
);

Stack.displayName = 'Stack';

// Spacer component for flexible spacing
interface SpacerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: keyof typeof designTokens.spacing;
}

const Spacer = React.forwardRef<HTMLDivElement, SpacerProps>(
  ({ className, size = 4, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(size && `h-${size} w-${size}`, className)}
      {...props}
    />
  )
);

Spacer.displayName = 'Spacer';

// Section component with consistent padding
interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  container?: boolean;
  containerSize?: ContainerProps['size'];
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, padding = 'lg', container = false, containerSize, ...props }, ref) => {
    const paddingClasses = {
      none: '',
      sm: 'py-8',
      md: 'py-12',
      lg: 'py-16',
      xl: 'py-24',
    };

    const content = container ? (
      <Container size={containerSize} {...props}>
        {props.children}
      </Container>
    ) : (
      props.children
    );

    return (
      <section
        ref={ref}
        className={cn(paddingClasses[padding], className)}
      >
        {content}
      </section>
    );
  }
);

Section.displayName = 'Section';

// Layout components export
export { Container, Grid, Flex, Stack, Spacer, Section };

// Utility functions for spacing
export const spacing = {
  // Direct access to spacing tokens
  ...designTokens.spacing,

  // Utility functions
  px: (size: keyof typeof designTokens.spacing) => `${designTokens.spacing[size]}px`,
  rem: (size: keyof typeof designTokens.spacing) => designTokens.spacing[size],
};

// Breakpoint utilities
export const breakpoints = designTokens.breakpoints;

// Responsive utilities
export const responsive = {
  hide: {
    sm: 'hidden sm:block',
    md: 'hidden md:block',
    lg: 'hidden lg:block',
    xl: 'hidden xl:block',
    '2xl': 'hidden 2xl:block',
  },
  show: {
    sm: 'block sm:hidden',
    md: 'block md:hidden',
    lg: 'block lg:hidden',
    xl: 'block xl:hidden',
    '2xl': 'block 2xl:hidden',
  },
};