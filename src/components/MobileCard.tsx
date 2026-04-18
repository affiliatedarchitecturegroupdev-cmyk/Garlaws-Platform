"use client";

import { useState } from 'react';

interface MobileCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  interactive?: boolean;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'sm' | 'md' | 'lg';
}

export function MobileCard({
  children,
  onClick,
  className = '',
  interactive = false,
  variant = 'default',
  padding = 'md'
}: MobileCardProps) {
  const [isPressed, setIsPressed] = useState(false);

  const baseClasses = 'rounded-xl transition-all duration-200';

  const variantClasses = {
    default: 'bg-[#1f2833] border border-[#45a29e]/20',
    elevated: 'bg-[#1f2833] border border-[#45a29e]/30 shadow-lg',
    outlined: 'bg-transparent border-2 border-[#45a29e]/40',
  };

  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const interactiveClasses = interactive
    ? 'cursor-pointer active:scale-95 hover:shadow-lg hover:border-[#45a29e]/60'
    : '';

  const pressedClasses = isPressed ? 'scale-95 shadow-inner' : '';

  const handleTouchStart = () => {
    if (interactive) setIsPressed(true);
  };

  const handleTouchEnd = () => {
    if (interactive) setIsPressed(false);
  };

  const handleClick = () => {
    if (interactive && onClick) {
      onClick();
    }
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${interactiveClasses} ${pressedClasses} ${className}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={(e) => {
        if (interactive && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {children}
    </div>
  );
}

interface MobileCardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  avatar?: React.ReactNode;
}

export function MobileCardHeader({ title, subtitle, action, avatar }: MobileCardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {avatar && (
          <div className="flex-shrink-0">
            {avatar}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold truncate">{title}</h3>
          {subtitle && (
            <p className="text-[#45a29e] text-sm truncate">{subtitle}</p>
          )}
        </div>
      </div>

      {action && (
        <div className="flex-shrink-0 ml-3">
          {action}
        </div>
      )}
    </div>
  );
}

interface MobileCardContentProps {
  children: React.ReactNode;
}

export function MobileCardContent({ children }: MobileCardContentProps) {
  return (
    <div className="text-[#45a29e]">
      {children}
    </div>
  );
}

interface MobileCardActionsProps {
  children: React.ReactNode;
  justify?: 'start' | 'center' | 'end' | 'between';
}

export function MobileCardActions({ children, justify = 'end' }: MobileCardActionsProps) {
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
  };

  return (
    <div className={`flex items-center gap-2 mt-4 pt-3 border-t border-[#45a29e]/10 ${justifyClasses[justify]}`}>
      {children}
    </div>
  );
}