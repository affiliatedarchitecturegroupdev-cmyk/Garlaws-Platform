'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { GlassCard } from './GlassMorph';
import { designTokens } from '@/design-system/tokens';

interface EnterpriseCardProps {
  title: string;
  subtitle?: string;
  description: string;
  icon?: string;
  image?: string;
  features?: string[];
  ctaText?: string;
  ctaHref?: string;
  variant?: 'default' | 'featured' | 'compact';
  color?: string;
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
}

export function EnterpriseCard({
  title,
  subtitle,
  description,
  icon,
  image,
  features = [],
  ctaText,
  ctaHref,
  variant = 'default',
  color = designTokens.colors.primary[500],
  className = '',
  children,
  onClick
}: EnterpriseCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getVariantStyles = () => {
    switch (variant) {
      case 'featured':
        return {
          padding: '2rem',
          minHeight: '400px',
          blur: 25,
          className: 'rounded-3xl'
        };
      case 'compact':
        return {
          padding: '1.5rem',
          minHeight: 'auto',
          blur: 15,
          className: 'rounded-2xl'
        };
      default:
        return {
          padding: '2rem',
          minHeight: '320px',
          blur: 20,
          className: 'rounded-2xl'
        };
    }
  };

  const variantStyles = getVariantStyles();

  const CardContent = () => (
    <div
      className={`h-full flex flex-col ${className}`}
      style={{ minHeight: variantStyles.minHeight }}
    >
      {/* Header */}
      <div className="mb-6">
        {/* Icon/Image */}
        {icon && (
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg transition-all duration-300 ${
              isHovered ? 'scale-110 rotate-3' : ''
            }`}
            style={{
              background: `linear-gradient(135deg, ${color}20, ${color}10)`
            }}
          >
            <span className="text-3xl">{icon}</span>
          </div>
        )}

        {image && (
          <div className={`mb-4 overflow-hidden rounded-xl transition-all duration-300 ${
            isHovered ? 'scale-105' : ''
          }`}>
            <img
              src={image}
              alt={title}
              className="w-full h-32 object-cover"
            />
          </div>
        )}

        {/* Title */}
        <h3
          className={`font-bold mb-2 transition-all duration-300 ${
            isHovered ? 'scale-105' : ''
          } ${
            variant === 'featured' ? 'text-2xl' :
            variant === 'compact' ? 'text-lg' : 'text-xl'
          }`}
          style={{ color: designTokens.colors.primary[800] }}
        >
          {title}
        </h3>

        {/* Subtitle */}
        {subtitle && (
          <p
            className="text-sm font-medium mb-2"
            style={{ color }}
          >
            {subtitle}
          </p>
        )}

        {/* Description */}
        <p
          className={`leading-relaxed transition-all duration-300 ${
            isHovered ? 'scale-105' : ''
          } ${
            variant === 'compact' ? 'text-sm' : 'text-base'
          }`}
          style={{ color: designTokens.colors.primary[600] }}
        >
          {description}
        </p>
      </div>

      {/* Features */}
      {features.length > 0 && (
        <div className="mb-6 flex-grow">
          <div className="space-y-2">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`flex items-center space-x-3 transition-all duration-300 delay-${index * 100} ${
                  isHovered ? 'translate-x-2 opacity-100' : 'translate-x-0 opacity-80'
                }`}
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span
                  className="text-sm"
                  style={{ color: designTokens.colors.primary[700] }}
                >
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Content */}
      {children && (
        <div className="mb-6 flex-grow">
          {children}
        </div>
      )}

      {/* CTA */}
      {ctaText && ctaHref && (
        <div className={`mt-auto transition-all duration-300 ${
          isHovered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-90'
        }`}>
          <div
            className="inline-flex items-center px-6 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${color}, ${color}dd)`
            }}
          >
            <span>{ctaText}</span>
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );

  if (ctaHref && !onClick) {
    return (
      <Link href={ctaHref}>
        <div
          className="cursor-pointer h-full"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <GlassCard
            className={`h-full ${variantStyles.className}`}
            blur={variantStyles.blur}
            opacity={0.1}
            borderOpacity={0.2}
          >
            <div style={{ padding: variantStyles.padding }}>
              <CardContent />
            </div>
          </GlassCard>
        </div>
      </Link>
    );
  }

  return (
    <div
      className={`${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <GlassCard
        className={`h-full ${variantStyles.className}`}
        blur={variantStyles.blur}
        opacity={0.1}
        borderOpacity={0.2}
      >
        <div style={{ padding: variantStyles.padding }}>
          <CardContent />
        </div>
      </GlassCard>
    </div>
  );
}

// Specialized card variants
export function FeatureCard({
  title,
  description,
  icon,
  features,
  ...props
}: Omit<EnterpriseCardProps, 'variant'>) {
  return (
    <EnterpriseCard
      title={title}
      description={description}
      icon={icon}
      features={features}
      variant="featured"
      {...props}
    />
  );
}

export function CompactCard({
  title,
  description,
  features,
  ...props
}: Omit<EnterpriseCardProps, 'variant'>) {
  return (
    <EnterpriseCard
      title={title}
      description={description}
      features={features}
      variant="compact"
      {...props}
    />
  );
}

// Card Grid Component
interface CardGridProps {
  cards: EnterpriseCardProps[];
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CardGrid({
  cards,
  columns = 3,
  gap = 'md',
  className = ''
}: CardGridProps) {
  const getGridClasses = () => {
    const colClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
    };

    const gapClasses = {
      sm: 'gap-4',
      md: 'gap-6',
      lg: 'gap-8'
    };

    return `${colClasses[columns]} ${gapClasses[gap]}`;
  };

  return (
    <div className={`grid ${getGridClasses()} ${className}`}>
      {cards.map((card, index) => (
        <div
          key={index}
          className="animate-in slide-in-from-bottom duration-1000"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <EnterpriseCard {...card} />
        </div>
      ))}
    </div>
  );
}