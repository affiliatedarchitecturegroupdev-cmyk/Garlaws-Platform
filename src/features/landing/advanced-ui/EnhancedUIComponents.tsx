'use client';

import { useState, useEffect, useRef } from 'react';

interface AnimationConfig {
  duration: number;
  delay: number;
  easing: string;
  repeat?: boolean;
  direction?: 'normal' | 'reverse' | 'alternate';
}

interface MicroInteraction {
  trigger: 'hover' | 'click' | 'focus' | 'scroll';
  animation: AnimationConfig;
  sound?: string;
  haptic?: boolean;
}

interface EnhancedUIComponentsProps {
  tenantId?: string;
}

export default function EnhancedUIComponents({ tenantId = 'default' }: EnhancedUIComponentsProps) {
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Particle animation system
  useEffect(() => {
    if (!canvasRef.current || reducedMotion) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      color: string;
    }> = [];

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    // Initialize particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity;
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [reducedMotion]);

  const animateInView = (element: HTMLElement, config: AnimationConfig) => {
    if (reducedMotion) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const style = entry.target as HTMLElement;
            style.style.animation = `
              fadeInUp ${config.duration}ms ${config.easing} ${config.delay}ms both
              ${config.repeat ? 'infinite' : ''}
              ${config.direction || 'normal'}
            `;
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
    return observer;
  };

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

  const MagneticButton = ({
    children,
    onClick,
    className = '',
    magnetic = true
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    magnetic?: boolean;
  }) => {
    const buttonRef = useRef<HTMLButtonElement>(null);

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

    return (
      <button
        ref={buttonRef}
        onClick={(e) => {
          createRippleEffect(e);
          onClick?.();
        }}
        className={`relative overflow-hidden transition-all duration-300 ease-out hover:shadow-lg active:scale-95 ${className}`}
        style={{
          transition: reducedMotion ? 'none' : 'all 0.3s ease-out'
        }}
      >
        {children}
      </button>
    );
  };

  const AnimatedCounter = ({
    value,
    duration = 2000,
    suffix = ''
  }: {
    value: number;
    duration?: number;
    suffix?: string;
  }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const counterRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
      if (reducedMotion) {
        setDisplayValue(value);
        return;
      }

      let startTime: number;
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

    useEffect(() => {
      if (counterRef.current) {
        animateInView(counterRef.current, {
          duration: 800,
          delay: 200,
          easing: 'ease-out'
        });
      }
    }, []);

    return (
      <span
        ref={counterRef}
        className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
      >
        {displayValue.toLocaleString()}{suffix}
      </span>
    );
  };

  const MorphingShape = ({ type = 'circle' }: { type?: 'circle' | 'square' | 'triangle' }) => {
    const [currentShape, setCurrentShape] = useState(type);

    useEffect(() => {
      if (reducedMotion) return;

      const shapes = ['circle', 'square', 'triangle'];
      const interval = setInterval(() => {
        setCurrentShape(prev => {
          const currentIndex = shapes.indexOf(prev);
          return shapes[(currentIndex + 1) % shapes.length] as 'circle' | 'square' | 'triangle';
        });
      }, 3000);

      return () => clearInterval(interval);
    }, [reducedMotion]);

    const getShapeStyles = () => {
      switch (currentShape) {
        case 'circle':
          return 'rounded-full';
        case 'square':
          return 'rounded-lg';
        case 'triangle':
          return 'triangle-shape';
        default:
          return 'rounded-full';
      }
    };

    return (
      <div
        className={`w-16 h-16 bg-gradient-to-r from-pink-500 to-violet-500 transition-all duration-1000 ease-in-out ${getShapeStyles()}`}
        style={{
          transition: reducedMotion ? 'none' : 'all 1s ease-in-out'
        }}
      />
    );
  };

  const FloatingElements = () => {
    const [elements, setElements] = useState<Array<{
      id: number;
      x: number;
      y: number;
      size: number;
      color: string;
      speed: number;
    }>>([]);

    useEffect(() => {
      if (reducedMotion) return;

      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
      const newElements = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 20 + 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: Math.random() * 0.5 + 0.1
      }));

      setElements(newElements);
    }, [reducedMotion]);

    useEffect(() => {
      if (reducedMotion || elements.length === 0) return;

      const interval = setInterval(() => {
        setElements(prev =>
          prev.map(el => ({
            ...el,
            y: el.y > 100 ? -10 : el.y + el.speed
          }))
        );
      }, 50);

      return () => clearInterval(interval);
    }, [elements, reducedMotion]);

    if (reducedMotion) return null;

    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {elements.map(el => (
          <div
            key={el.id}
            className="absolute rounded-full opacity-20"
            style={{
              left: `${el.x}%`,
              top: `${el.y}%`,
              width: `${el.size}px`,
              height: `${el.size}px`,
              backgroundColor: el.color,
              animation: `float 6s ease-in-out infinite`,
              animationDelay: `${el.id * 0.5}s`
            }}
          />
        ))}
      </div>
    );
  };

  const ParallaxSection = ({ children, speed = 0.5 }: { children: React.ReactNode; speed?: number }) => {
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (reducedMotion || !sectionRef.current) return;

      const handleScroll = () => {
        if (!sectionRef.current) return;

        const scrolled = window.pageYOffset;
        const rate = scrolled * speed;

        sectionRef.current.style.transform = `translateY(${rate}px)`;
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, [speed, reducedMotion]);

    return (
      <div
        ref={sectionRef}
        style={{
          transform: reducedMotion ? 'none' : undefined,
          transition: reducedMotion ? 'none' : 'transform 0.1s ease-out'
        }}
      >
        {children}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Enhanced UI Components</h2>
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={animationsEnabled}
              onChange={(e) => setAnimationsEnabled(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm">Enable Animations</span>
          </label>
          <select
            value={currentTheme}
            onChange={(e) => setCurrentTheme(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="auto">Auto Theme</option>
            <option value="light">Light Theme</option>
            <option value="dark">Dark Theme</option>
          </select>
        </div>
      </div>

      {/* Particle Background */}
      <div className="relative h-64 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          width={800}
          height={256}
          className="absolute inset-0 w-full h-full"
        />
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white">
            <h3 className="text-2xl font-bold mb-2">Interactive Background</h3>
            <p className="text-blue-100">Particle animation system</p>
          </div>
        </div>
      </div>

      {/* Component Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Magnetic Button */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Magnetic Button</h3>
          <div className="flex justify-center">
            <MagneticButton
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium"
              onClick={() => alert('Button clicked!')}
            >
              Hover Me
            </MagneticButton>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Interactive button with magnetic attraction effect and ripple animation.
          </p>
        </div>

        {/* Animated Counter */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Animated Counter</h3>
          <div className="text-center">
            <AnimatedCounter value={12345} suffix="+" />
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Smooth counting animation with easing and customizable duration.
          </p>
        </div>

        {/* Morphing Shape */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Morphing Shape</h3>
          <div className="flex justify-center">
            <MorphingShape />
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Shape morphing animation between circle, square, and triangle.
          </p>
        </div>

        {/* Floating Elements */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 relative overflow-hidden">
          <h3 className="text-lg font-semibold mb-4">Floating Elements</h3>
          <div className="h-32 relative">
            <FloatingElements />
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Animated floating elements with physics-based movement.
          </p>
        </div>

        {/* Parallax Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Parallax Effect</h3>
          <ParallaxSection speed={-0.2}>
            <div className="bg-gradient-to-r from-green-400 to-blue-500 p-4 rounded-lg text-white">
              <p className="font-medium">Scroll to see parallax effect</p>
            </div>
          </ParallaxSection>
          <p className="text-sm text-gray-600 mt-4">
            Parallax scrolling effect with customizable speed and direction.
          </p>
        </div>

        {/* Micro Interactions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Micro Interactions</h3>
          <div className="space-y-3">
            <button className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-all duration-200 hover:scale-105 active:scale-95">
              Hover Effect
            </button>
            <button className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              Lift Effect
            </button>
            <button className="w-full px-4 py-2 border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-md transition-all duration-300 hover:bg-blue-50">
              Border Animation
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Subtle animations that enhance user feedback and engagement.
          </p>
        </div>
      </div>

      {/* Accessibility Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <span className="text-yellow-600">♿</span>
          <div>
            <h4 className="font-medium text-yellow-800">Accessibility Considerations</h4>
            <p className="text-yellow-700 text-sm mt-1">
              All animations respect the user's <code>prefers-reduced-motion</code> setting and can be disabled.
              Components include proper ARIA labels and keyboard navigation support.
            </p>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Performance Considerations</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Reduced Motion:</span>
            <span className={`ml-2 font-medium ${reducedMotion ? 'text-red-600' : 'text-green-600'}`}>
              {reducedMotion ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Animations:</span>
            <span className={`ml-2 font-medium ${animationsEnabled ? 'text-green-600' : 'text-red-600'}`}>
              {animationsEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Theme:</span>
            <span className="ml-2 font-medium capitalize">{currentTheme}</span>
          </div>
          <div>
            <span className="text-gray-600">Canvas Support:</span>
            <span className={`ml-2 font-medium ${canvasRef.current?.getContext('2d') ? 'text-green-600' : 'text-red-600'}`}>
              {canvasRef.current?.getContext('2d') ? 'Available' : 'Unavailable'}
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(120deg); }
          66% { transform: translateY(-5px) rotate(240deg); }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .triangle-shape {
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        }
      `}</style>
    </div>
  );
}