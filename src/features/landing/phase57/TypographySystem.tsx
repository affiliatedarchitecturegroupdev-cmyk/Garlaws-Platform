'use client';

import { ReactNode } from 'react';
import { designTokens } from '@/design-system/tokens';

interface TypographyProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

// Simplified Typography System
export function DisplayHeading({
  children,
  gradient = false,
  className = '',
  ...props
}: { gradient?: boolean } & TypographyProps) {
  const gradientStyle = gradient ? {
    background: designTokens.colors.gradients.primary,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  } : {};

  return (
    <h1
      className={`text-5xl md:text-7xl lg:text-8xl font-bold leading-tight ${className}`}
      style={{
        ...gradientStyle,
        ...props.style
      }}
      {...props}
    >
      {children}
    </h1>
  );
}

export function SectionHeading({
  children,
  gradient = false,
  className = '',
  ...props
}: { gradient?: boolean } & TypographyProps) {
  const gradientStyle = gradient ? {
    background: designTokens.colors.gradients.secondary,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  } : {};

  return (
    <h2
      className={`text-4xl md:text-5xl font-bold ${className}`}
      style={{
        color: designTokens.colors.primary[800],
        ...gradientStyle,
        ...props.style
      }}
      {...props}
    >
      {children}
    </h2>
  );
}

export function CardHeading({
  children,
  color,
  className = '',
  ...props
}: { color?: string } & TypographyProps) {
  return (
    <h3
      className={`text-xl font-bold ${className}`}
      style={{
        color: color || designTokens.colors.primary[800],
        ...props.style
      }}
      {...props}
    >
      {children}
    </h3>
  );
}

export function BodyText({
  children,
  className = '',
  ...props
}: TypographyProps) {
  return (
    <p
      className={`text-base leading-relaxed ${className}`}
      style={{
        color: designTokens.colors.primary[600],
        ...props.style
      }}
      {...props}
    >
      {children}
    </p>
  );
}

export function LeadText({
  children,
  gradient = false,
  className = '',
  ...props
}: { gradient?: boolean } & TypographyProps) {
  const gradientStyle = gradient ? {
    background: designTokens.colors.gradients.accent,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  } : {};

  return (
    <p
      className={`text-xl leading-relaxed ${className}`}
      style={{
        color: designTokens.colors.primary[700],
        ...gradientStyle,
        ...props.style
      }}
      {...props}
    >
      {children}
    </p>
  );
}

export function GradientText({
  children,
  gradient = 'primary',
  className = '',
  ...props
}: { gradient?: 'primary' | 'secondary' | 'accent' | 'gold' } & TypographyProps) {
  const gradients = {
    primary: designTokens.colors.gradients.primary,
    secondary: designTokens.colors.gradients.secondary,
    accent: designTokens.colors.gradients.accent,
    gold: designTokens.colors.gradients.gold
  };

  return (
    <span
      className={className}
      style={{
        background: gradients[gradient],
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        ...props.style
      }}
      {...props}
    >
      {children}
    </span>
  );
}

export function AccentText({
  children,
  color = designTokens.colors.secondary[500],
  className = '',
  ...props
}: { color?: string } & TypographyProps) {
  return (
    <span
      className={className}
      style={{
        color,
        ...props.style
      }}
      {...props}
    >
      {children}
    </span>
  );
}

export function CaptionText({
  children,
  className = '',
  ...props
}: TypographyProps) {
  return (
    <span
      className={`text-xs font-medium uppercase tracking-wide ${className}`}
      style={{
        color: designTokens.colors.primary[500],
        letterSpacing: '0.05em',
        ...props.style
      }}
      {...props}
    >
      {children}
    </span>
  );
}

export function LabelText({
  children,
  className = '',
  ...props
}: TypographyProps) {
  return (
    <span
      className={`text-sm font-medium ${className}`}
      style={{
        color: designTokens.colors.primary[600],
        ...props.style
      }}
      {...props}
    >
      {children}
    </span>
  );
}

export function LinkText({
  children,
  href,
  className = '',
  ...props
}: TypographyProps & { href?: string }) {
  const content = (
    <span
      className={`transition-all duration-300 hover:scale-105 cursor-pointer ${className}`}
      style={{
        color: designTokens.colors.primary[600],
        ...props.style
      }}
      {...props}
    >
      {children}
    </span>
  );

  if (href) {
    return (
      <a href={href} className="no-underline">
        {content}
      </a>
    );
  }

  return content;
}

export function TextBlock({
  title,
  subtitle,
  children,
  className = ''
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      {title && <SectionHeading>{title}</SectionHeading>}
      {subtitle && <LeadText>{subtitle}</LeadText>}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}