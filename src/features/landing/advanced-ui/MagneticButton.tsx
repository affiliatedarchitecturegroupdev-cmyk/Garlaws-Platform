'use client';

import { useState, useRef, useEffect } from 'react';

interface MagneticButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  magnetic?: boolean;
  variant?: 'primary' | 'secondary' | 'glass';
}

export default function MagneticButton({
  children,
  onClick,
  className = '',
  magnetic = true,
  variant = 'primary'
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (!magnetic || reducedMotion || !buttonRef.current) return;

    const button = buttonRef.current;
    let isHovering = false;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isHovering) return;

      const rect = button.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxDistance = 50;

      if (distance < maxDistance) {
        const strength = (maxDistance - distance) / maxDistance;
        const moveX = deltaX * strength * 0.3;
        const moveY = deltaY * strength * 0.3;

        button.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
      } else {
        button.style.transform = '';
      }
    };

    const handleMouseEnter = () => {
      isHovering = true;
      document.addEventListener('mousemove', handleMouseMove);
    };

    const handleMouseLeave = () => {
      isHovering = false;
      document.removeEventListener('mousemove', handleMouseMove);
      button.style.transform = '';
    };

    button.addEventListener('mouseenter', handleMouseEnter);
    button.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      button.removeEventListener('mouseenter', handleMouseEnter);
      button.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [magnetic, reducedMotion]);

  const createRippleEffect = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
    `;

    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: 'linear-gradient(135deg, #2d7d2d 0%, #45a29e 100%)',
          color: 'white',
          boxShadow: '0 8px 32px rgba(45, 125, 45, 0.3)'
        };
      case 'secondary':
        return {
          background: 'linear-gradient(135deg, #e6b83a 0%, #c5a059 100%)',
          color: '#0b0c10',
          boxShadow: '0 8px 32px rgba(230, 184, 58, 0.3)'
        };
      case 'glass':
        return {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          color: 'white',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        };
      default:
        return {};
    }
  };

  return (
    <button
      ref={buttonRef}
      onClick={(e) => {
        createRippleEffect(e);
        onClick?.();
      }}
      className={`relative overflow-hidden transition-all duration-300 ease-out hover:shadow-lg active:scale-95 rounded-xl font-semibold ${className}`}
      style={{
        ...getVariantStyles(),
        transition: reducedMotion ? 'none' : 'all 0.3s ease-out'
      }}
    >
      {children}
      <style jsx>{`
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `}</style>
    </button>
  );
}