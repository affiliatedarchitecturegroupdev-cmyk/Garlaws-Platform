'use client';

import { useState, useEffect, useRef } from 'react';
import { designTokens } from '@/design-system/tokens';

interface ParticleBackgroundProps {
  particleCount?: number;
  colors?: string[];
  speed?: number;
  size?: { min: number; max: number };
  className?: string;
}

export function ParticleBackground({
  particleCount = 50,
  colors = [designTokens.colors.primary[400], designTokens.colors.secondary[400], designTokens.colors.accent[400]],
  speed = 0.5,
  size = { min: 2, max: 6 },
  className = ''
}: ParticleBackgroundProps) {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    opacity: number;
  }>>([]);
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
    if (reducedMotion) return;

    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      size: Math.random() * (size.max - size.min) + size.min,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * 0.6 + 0.2
    }));

    setParticles(newParticles);
  }, [particleCount, colors, speed, size, reducedMotion]);

  useEffect(() => {
    if (reducedMotion || particles.length === 0) return;

    const interval = setInterval(() => {
      setParticles(prev =>
        prev.map(particle => {
          let newX = particle.x + particle.vx;
          let newY = particle.y + particle.vy;

          // Wrap around edges
          if (newX > 100) newX = 0;
          if (newX < 0) newX = 100;
          if (newY > 100) newY = 0;
          if (newY < 0) newY = 100;

          return {
            ...particle,
            x: newX,
            y: newY
          };
        })
      );
    }, 50);

    return () => clearInterval(interval);
  }, [particles, reducedMotion]);

  if (reducedMotion) return null;

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden z-0 ${className}`}>
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full blur-sm"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            opacity: particle.opacity,
            animation: `float 8s ease-in-out infinite`,
            animationDelay: `${particle.id * 0.2}s`,
            filter: 'blur(0.5px)'
          }}
        />
      ))}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg) scale(1);
          }
          33% {
            transform: translateY(-20px) rotate(120deg) scale(1.2);
          }
          66% {
            transform: translateY(-10px) rotate(240deg) scale(0.8);
          }
        }
      `}</style>
    </div>
  );
}

interface MorphingShapeProps {
  type?: 'circle' | 'square' | 'triangle' | 'hexagon';
  size?: number;
  colors?: string[];
  morphInterval?: number;
  className?: string;
}

export function MorphingShape({
  type = 'circle',
  size = 80,
  colors = [designTokens.colors.primary[500], designTokens.colors.secondary[500], designTokens.colors.accent[500]],
  morphInterval = 4000,
  className = ''
}: MorphingShapeProps) {
  const [currentShape, setCurrentShape] = useState(type);
  const [currentColor, setCurrentColor] = useState(colors[0]);
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
    if (reducedMotion) return;

    const shapes = ['circle', 'square', 'triangle', 'hexagon'];
    const interval = setInterval(() => {
      setCurrentShape(prev => {
        const currentIndex = shapes.indexOf(prev);
        return shapes[(currentIndex + 1) % shapes.length] as 'circle' | 'square' | 'triangle' | 'hexagon';
      });
      setCurrentColor(colors[Math.floor(Math.random() * colors.length)]);
    }, morphInterval);

    return () => clearInterval(interval);
  }, [colors, morphInterval, reducedMotion]);

  const getShapeStyles = () => {
    switch (currentShape) {
      case 'circle':
        return 'rounded-full';
      case 'square':
        return 'rounded-lg';
      case 'triangle':
        return 'triangle-shape';
      case 'hexagon':
        return 'hexagon-shape';
      default:
        return 'rounded-full';
    }
  };

  if (reducedMotion) {
    return (
      <div
        className={`rounded-full ${className}`}
        style={{
          width: size,
          height: size,
          backgroundColor: colors[0],
          opacity: 0.8
        }}
      />
    );
  }

  return (
    <>
      <div
        className={`transition-all duration-1000 ease-in-out ${getShapeStyles()} ${className}`}
        style={{
          width: size,
          height: size,
          backgroundColor: currentColor,
          boxShadow: `0 0 40px ${currentColor}40`,
          animation: 'pulse-glow 3s ease-in-out infinite'
        }}
      />
      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px ${currentColor}30;
          }
          50% {
            box-shadow: 0 0 60px ${currentColor}60;
          }
        }

        .triangle-shape {
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        }

        .hexagon-shape {
          clip-path: polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%);
        }
      `}</style>
    </>
  );
}

interface FloatingElementsProps {
  count?: number;
  size?: number;
  speed?: number;
  colors?: string[];
  className?: string;
}

export function FloatingElements({
  count = 8,
  size = 20,
  speed = 1,
  colors = [designTokens.colors.primary[400], designTokens.colors.secondary[400], designTokens.colors.accent[400]],
  className = ''
}: FloatingElementsProps) {
  const [elements, setElements] = useState<Array<{
    id: number;
    x: number;
    y: number;
    rotation: number;
    scale: number;
  }>>([]);
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
    if (reducedMotion) return;

    const newElements = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      rotation: Math.random() * 360,
      scale: Math.random() * 0.5 + 0.5
    }));

    setElements(newElements);
  }, [count, reducedMotion]);

  useEffect(() => {
    if (reducedMotion || elements.length === 0) return;

    const interval = setInterval(() => {
      setElements(prev =>
        prev.map(el => ({
          ...el,
          y: el.y > 100 ? -10 : el.y + speed * 0.5,
          rotation: el.rotation + speed * 2,
          scale: el.scale + Math.sin(Date.now() * 0.001 + el.id) * 0.1
        }))
      );
    }, 50);

    return () => clearInterval(interval);
  }, [elements, speed, reducedMotion]);

  if (reducedMotion) return null;

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
      {elements.map(el => (
        <div
          key={el.id}
          className="absolute"
          style={{
            left: `${el.x}%`,
            top: `${el.y}%`,
            transform: `rotate(${el.rotation}deg) scale(${el.scale})`,
            width: size,
            height: size
          }}
        >
          <MorphingShape
            size={size}
            colors={colors}
            morphInterval={3000 + el.id * 500}
          />
        </div>
      ))}
    </div>
  );
}

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  suffix?: string;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 2000,
  suffix = '',
  className = ''
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
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
    if (reducedMotion) {
      setDisplayValue(value);
      return;
    }

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.floor(value * easeOutQuart));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration, reducedMotion]);

  return (
    <span className={`font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ${className}`}>
      {displayValue.toLocaleString()}{suffix}
    </span>
  );
}