'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ServiceSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  ctaText: string;
  ctaHref: string;
  backgroundImage?: string;
  accentColor: string;
  icon: string;
}

interface ServiceCarouselProps {
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

const serviceSlides: ServiceSlide[] = [
  {
    id: 'assessment',
    title: 'Property Assessment & Valuation',
    subtitle: 'AI-Powered Property Intelligence',
    description: 'Transform property assessment with advanced AI algorithms that analyze market data, property conditions, and investment potential to deliver accurate valuations and strategic insights.',
    features: [
      'Real-time market analysis',
      'AI-powered valuation models',
      'Risk assessment algorithms',
      'Investment opportunity identification'
    ],
    ctaText: 'Start Assessment',
    ctaHref: '/assessment',
    accentColor: '#2d7d2d',
    icon: '🏠'
  },
  {
    id: 'maintenance',
    title: 'Maintenance Scheduling & Orchestration',
    subtitle: 'Automated Service Management',
    description: 'Streamline maintenance operations with intelligent scheduling that predicts needs, coordinates teams, and ensures optimal property performance through automated workflows.',
    features: [
      'Predictive maintenance scheduling',
      'Automated technician assignment',
      'Real-time progress tracking',
      'Compliance monitoring'
    ],
    ctaText: 'Schedule Service',
    ctaHref: '/maintenance',
    accentColor: '#45a29e',
    icon: '🔧'
  },
  {
    id: 'financial',
    title: 'Financial Reconciliation & Analytics',
    subtitle: 'Enterprise Financial Intelligence',
    description: 'Comprehensive financial management with automated reconciliation, real-time reporting, and advanced analytics to optimize property investments and operational efficiency.',
    features: [
      'Automated financial reconciliation',
      'Real-time expense tracking',
      'Investment performance analytics',
      'Tax optimization strategies'
    ],
    ctaText: 'View Analytics',
    ctaHref: '/financial',
    accentColor: '#e6b83a',
    icon: '💰'
  },
  {
    id: 'suppliers',
    title: 'Supplier Management & Procurement',
    subtitle: 'Vendor Network Optimization',
    description: 'Build and manage strategic supplier relationships with automated procurement workflows, performance tracking, and cost optimization across your property portfolio.',
    features: [
      'Supplier performance monitoring',
      'Automated procurement workflows',
      'Contract management',
      'Cost optimization analysis'
    ],
    ctaText: 'Manage Suppliers',
    ctaHref: '/suppliers',
    accentColor: '#2d7d2d',
    icon: '🤝'
  },
  {
    id: 'inventory',
    title: 'Inventory Tracking & Management',
    subtitle: 'Real-Time Stock Intelligence',
    description: 'Complete visibility into property inventory with automated tracking, predictive reordering, and intelligent stock optimization for maintenance and operations.',
    features: [
      'Real-time inventory tracking',
      'Predictive reordering',
      'Automated stock alerts',
      'Usage analytics'
    ],
    ctaText: 'Track Inventory',
    ctaHref: '/inventory',
    accentColor: '#45a29e',
    icon: '📦'
  },
  {
    id: 'projects',
    title: 'Project Management & Coordination',
    subtitle: 'Construction Oversight Platform',
    description: 'End-to-end project management with visual planning tools, resource allocation, progress tracking, and collaborative workflows for construction and renovation projects.',
    features: [
      'Visual project planning',
      'Resource allocation tools',
      'Progress tracking dashboards',
      'Team collaboration features'
    ],
    ctaText: 'Manage Projects',
    ctaHref: '/projects',
    accentColor: '#e6b83a',
    icon: '📋'
  },
  {
    id: 'analytics',
    title: 'Business Intelligence & Reporting',
    subtitle: 'Enterprise Analytics Platform',
    description: 'Comprehensive business intelligence with interactive dashboards, predictive analytics, and automated reporting to drive data-informed property management decisions.',
    features: [
      'Interactive analytics dashboards',
      'Predictive modeling',
      'Automated reporting',
      'Performance KPIs'
    ],
    ctaText: 'View Reports',
    ctaHref: '/analytics',
    accentColor: '#2d7d2d',
    icon: '📊'
  },
  {
    id: 'marketplace',
    title: 'E-commerce Marketplace',
    subtitle: 'Equipment & Service Procurement',
    description: 'Integrated marketplace connecting property managers with verified suppliers, equipment vendors, and service providers for streamlined procurement and competitive pricing.',
    features: [
      'Verified supplier network',
      'Competitive pricing',
      'Bulk purchasing options',
      'Quality assurance'
    ],
    ctaText: 'Browse Marketplace',
    ctaHref: '/marketplace',
    accentColor: '#45a29e',
    icon: '🛒'
  }
];

export default function ServiceCarousel({ autoPlay = true, autoPlayInterval = 5000 }: ServiceCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || reducedMotion) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % serviceSlides.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, reducedMotion]);

  const goToSlide = (index: number) => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    setCurrentSlide(index);

    setTimeout(() => setIsTransitioning(false), 500);
  };

  const nextSlide = () => {
    goToSlide((currentSlide + 1) % serviceSlides.length);
  };

  const prevSlide = () => {
    goToSlide(currentSlide === 0 ? serviceSlides.length - 1 : currentSlide - 1);
  };

  const currentService = serviceSlides[currentSlide];

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      {/* Main Carousel Container */}
      <div className="relative overflow-hidden rounded-3xl shadow-2xl">
        <div
          className="relative h-96 md:h-[500px] transition-all duration-500 ease-in-out"
          style={{
            background: `linear-gradient(135deg, ${currentService.accentColor}15 0%, ${currentService.accentColor}05 100%)`,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: `1px solid ${currentService.accentColor}20`
          }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute top-10 left-10 w-32 h-32 rounded-full"
              style={{ backgroundColor: currentService.accentColor }}
            />
            <div
              className="absolute bottom-10 right-10 w-24 h-24 rounded-full"
              style={{ backgroundColor: currentService.accentColor }}
            />
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full opacity-10"
              style={{ backgroundColor: currentService.accentColor }}
            />
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex items-center">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center w-full px-8 md:px-12 py-8">
              {/* Left Content */}
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: `${currentService.accentColor}20` }}
                  >
                    <span className="text-3xl">{currentService.icon}</span>
                  </div>
                  <div>
                    <h3
                      className="text-lg font-semibold"
                      style={{ color: currentService.accentColor }}
                    >
                      {currentService.subtitle}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>0{currentSlide + 1}</span>
                      <span>/</span>
                      <span>0{serviceSlides.length}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    {currentService.title}
                  </h2>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {currentService.description}
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  {currentService.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: currentService.accentColor }}
                      />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <div className="pt-4">
                  <Link
                    href={currentService.ctaHref}
                    className="inline-flex items-center px-8 py-4 rounded-2xl font-bold text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
                    style={{ backgroundColor: currentService.accentColor }}
                  >
                    <span>{currentService.ctaText}</span>
                    <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Right Content - Visual */}
              <div className="hidden lg:flex items-center justify-center">
                <div
                  className="w-80 h-80 rounded-3xl shadow-2xl flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${currentService.accentColor}10 0%, ${currentService.accentColor}05 100%)`,
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: `2px solid ${currentService.accentColor}30`
                  }}
                >
                  <div className="text-center">
                    <div
                      className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                      style={{ backgroundColor: currentService.accentColor }}
                    >
                      <span className="text-5xl text-white">{currentService.icon}</span>
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">
                      {currentService.title.split(' ')[0]}
                    </h4>
                    <p className="text-gray-600">
                      Professional {currentService.title.split(' ')[1]} Solutions
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between mt-8">
        {/* Slide Indicators */}
        <div className="flex space-x-3">
          {serviceSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'scale-125' : 'hover:scale-110'
              }`}
              style={{
                backgroundColor: index === currentSlide ? currentService.accentColor : `${currentService.accentColor}40`
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={prevSlide}
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: `1px solid ${currentService.accentColor}20`
            }}
            aria-label="Previous slide"
          >
            <svg className="w-6 h-6" style={{ color: currentService.accentColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: `1px solid ${currentService.accentColor}20`
            }}
            aria-label="Next slide"
          >
            <svg className="w-6 h-6" style={{ color: currentService.accentColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}