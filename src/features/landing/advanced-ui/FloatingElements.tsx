'use client';

import { useState, useEffect } from 'react';

interface FloatingElementsProps {
  count?: number;
  colors?: string[];
  speed?: number;
  size?: { min: number; max: number };
}

export default function FloatingElements({
  count = 12,
  colors = ['#2d7d2d', '#e6b83a', '#45a29e', '#3B82F6', '#10B981'],
  speed = 0.5,
  size = { min: 8, max: 24 }
}: FloatingElementsProps) {
  const [elements, setElements] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    color: string;
    speed: number;
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

    const newElements = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * (size.max - size.min) + size.min,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * speed + 0.1,
      opacity: Math.random() * 0.3 + 0.1
    }));

    setElements(newElements);
  }, [count, colors, speed, size, reducedMotion]);

  useEffect(() => {
    if (reducedMotion || elements.length === 0) return;

    const interval = setInterval(() => {
      setElements(prev =>
        prev.map(el => ({
          ...el,
          y: el.y > 100 ? -10 : el.y + el.speed,
          x: el.x + (Math.random() - 0.5) * 0.1
        }))
      );
    }, 50);

    return () => clearInterval(interval);
  }, [elements, reducedMotion]);

  if (reducedMotion) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {elements.map(el => (
        <div
          key={el.id}
          className="absolute rounded-full blur-sm"
          style={{
            left: `${el.x}%`,
            top: `${el.y}%`,
            width: `${el.size}px`,
            height: `${el.size}px`,
            backgroundColor: el.color,
            opacity: el.opacity,
            animation: 'float 6s ease-in-out infinite',
            animationDelay: `${el.id * 0.5}s`,
            filter: 'blur(1px)'
          }}
        />
      ))}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg) scale(1);
          }
          33% {
            transform: translateY(-10px) rotate(120deg) scale(1.1);
          }
          66% {
            transform: translateY(-5px) rotate(240deg) scale(0.9);
          }
        }
      `}</style>
    </div>
  );
}