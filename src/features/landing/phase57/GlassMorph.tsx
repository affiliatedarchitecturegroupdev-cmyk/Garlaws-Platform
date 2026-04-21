'use client';

import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  blur?: number;
  opacity?: number;
  borderOpacity?: number;
  shadow?: boolean;
  interactive?: boolean;
}

interface GlassOverlayProps {
  children?: ReactNode;
  className?: string;
  color?: string;
  blur?: number;
  opacity?: number;
}

interface GlassButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

// Glass Card Component
export function GlassCard({
  children,
  className = '',
  blur = 20,
  opacity = 0.1,
  borderOpacity = 0.2,
  shadow = true,
  interactive = false
}: GlassCardProps) {
  return (
    <div
      className={`relative ${interactive ? 'transition-all duration-300 hover:scale-[1.02] cursor-pointer' : ''} ${className}`}
      style={{
        background: `rgba(255, 255, 255, ${opacity})`,
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        border: `1px solid rgba(255, 255, 255, ${borderOpacity})`,
        boxShadow: shadow ? '0 8px 32px rgba(0, 0, 0, 0.1)' : 'none',
        borderRadius: '16px'
      }}
    >
      {children}
    </div>
  );
}

// Glass Overlay Component
export function GlassOverlay({
  children,
  className = '',
  color = '#2d7d2d',
  blur = 40,
  opacity = 0.1
}: GlassOverlayProps) {
  return (
    <div
      className={`relative ${className}`}
      style={{
        background: `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`
      }}
    >
      {children}
    </div>
  );
}

// Glass Button Component
export function GlassButton({
  children,
  onClick,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false
}: GlassButtonProps) {
  const getVariantStyles = () => {
    const variants = {
      primary: {
        background: 'rgba(45, 125, 45, 0.1)',
        border: '1px solid rgba(45, 125, 45, 0.3)',
        color: '#2d7d2d',
        hoverBackground: 'rgba(45, 125, 45, 0.2)'
      },
      secondary: {
        background: 'rgba(230, 184, 58, 0.1)',
        border: '1px solid rgba(230, 184, 58, 0.3)',
        color: '#e6b83a',
        hoverBackground: 'rgba(230, 184, 58, 0.2)'
      },
      accent: {
        background: 'rgba(69, 162, 158, 0.1)',
        border: '1px solid rgba(69, 162, 158, 0.3)',
        color: '#45a29e',
        hoverBackground: 'rgba(69, 162, 158, 0.2)'
      },
      neutral: {
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        color: '#374151',
        hoverBackground: 'rgba(255, 255, 255, 0.2)'
      }
    };
    return variants[variant];
  };

  const getSizeStyles = () => {
    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg'
    };
    return sizes[size];
  };

  const variantStyles = getVariantStyles();

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative font-semibold rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${getSizeStyles()} ${className}`}
      style={{
        background: variantStyles.background,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: variantStyles.border,
        color: variantStyles.color,
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = variantStyles.hoverBackground;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = variantStyles.background;
      }}
    >
      {children}
    </button>
  );
}

// Glass Input Component
export function GlassInput({
  type = 'text',
  placeholder,
  value,
  onChange,
  className = '',
  ...props
}: {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  [key: string]: any;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        color: '#374151'
      }}
      {...props}
    />
  );
}

// Utility functions for creating glass effects
export const createGlassGradient = (color: string, opacity: number = 0.1) => {
  return `linear-gradient(135deg, ${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')} 0%, ${color}${Math.round(opacity * 0.5 * 255).toString(16).padStart(2, '0')} 100%)`;
};

export const createGlassShadow = (color: string = 'rgba(0, 0, 0, 0.1)') => {
  return `0 8px 32px ${color}`;
};

export const glassMorphClasses = {
  card: 'backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl shadow-glass',
  overlay: 'backdrop-blur-2xl bg-primary/10',
  button: 'backdrop-blur-sm bg-white/10 border border-white/30 hover:bg-white/20 transition-all duration-300'
};