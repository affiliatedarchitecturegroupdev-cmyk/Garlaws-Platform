'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ServiceCarousel from './ServiceCarousel';
import MagneticButton from '../advanced-ui/MagneticButton';
import { designTokens } from '@/design-system/tokens';

export default function EnterpriseHeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative pt-32 pb-32 overflow-hidden" id="hero">
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Gradient Background */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 20% 50%, ${designTokens.colors.primary[50]} 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, ${designTokens.colors.secondary[50]} 0%, transparent 50%),
                        radial-gradient(circle at 40% 80%, ${designTokens.colors.accent[50]} 0%, transparent 50%)`
          }}
        />

        {/* Animated Background Shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-10 blur-3xl animate-pulse"
             style={{ backgroundColor: designTokens.colors.secondary[300], animationDelay: '0s' }} />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-10 blur-3xl animate-pulse"
             style={{ backgroundColor: designTokens.colors.accent[300], animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full opacity-5 blur-3xl animate-pulse"
             style={{ backgroundColor: designTokens.colors.primary[300], animationDelay: '4s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Glass Morphism Hero Container */}
        <div
          className={`relative rounded-3xl p-12 md:p-16 shadow-2xl transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          {/* Enhanced Badge */}
          <div
            className={`inline-flex items-center px-6 py-3 rounded-full text-sm font-semibold mb-8 mx-auto transition-all duration-1000 delay-200 ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
            style={{
              background: designTokens.colors.gradients.surface,
              color: designTokens.colors.primary[700],
              boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.1)'
            }}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Enterprise-Grade Property Lifecycle Platform
          </div>

          {/* Professional Typography Hierarchy */}
          <div className="text-center mb-12">
            <h1 className={`text-5xl md:text-7xl lg:text-8xl font-bold leading-tight transition-all duration-1000 delay-400 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              Property Lifecycle
              <br />
              <span
                className={`transition-all duration-1000 delay-600 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{
                  background: designTokens.colors.gradients.primary,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                Orchestration
              </span>
            </h1>

            <p
              className={`text-xl md:text-2xl mt-8 max-w-4xl mx-auto leading-relaxed transition-all duration-1000 delay-800 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ color: designTokens.colors.primary[700] }}
            >
              Transform your property management operations with our comprehensive enterprise platform.
              From AI-powered insights to seamless orchestration, manage every aspect of your property lifecycle with unparalleled precision.
            </p>
          </div>

          {/* Enhanced CTA Section */}
          <div className={`flex flex-col sm:flex-row gap-6 justify-center mb-16 transition-all duration-1000 delay-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <MagneticButton
              className="px-10 py-5 font-bold text-xl"
              variant="primary"
              onClick={() => window.location.href = '/auth/signup'}
            >
              <span className="flex items-center justify-center">
                Start Free Trial
                <svg className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </MagneticButton>
            <MagneticButton
              className="px-10 py-5 font-bold text-xl"
              variant="glass"
              onClick={() => window.location.href = '/demo'}
            >
              <span className="flex items-center justify-center">
                Schedule Demo
                <svg className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </span>
            </MagneticButton>
          </div>

          {/* Professional Stats Grid */}
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto transition-all duration-1000 delay-1200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            {[
              { value: '386+', label: 'Source Files', color: designTokens.colors.primary },
              { value: '125K+', label: 'Lines of Code', color: designTokens.colors.secondary },
              { value: '130+', label: 'Database Tables', color: designTokens.colors.accent },
              { value: '56+', label: 'Development Phases', color: designTokens.colors.primary }
            ].map((stat, index) => (
              <div
                key={stat.label}
                className={`text-center p-6 rounded-2xl transition-all duration-1000 delay-${1400 + index * 200} ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: `1px solid ${stat.color[200]}`
                }}
              >
                <div
                  className="text-3xl font-bold mb-2"
                  style={{ color: stat.color[800] }}
                >
                  {stat.value}
                </div>
                <div
                  className="text-sm font-medium"
                  style={{ color: stat.color[600] }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Service Carousel Section */}
        <div className={`mt-20 transition-all duration-1000 delay-1600 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="text-center mb-12">
            <h2
              className="text-4xl font-bold mb-4"
              style={{ color: designTokens.colors.primary[800] }}
            >
              Comprehensive Service Ecosystem
            </h2>
            <p
              className="text-xl"
              style={{ color: designTokens.colors.primary[600] }}
            >
              Explore our 8 core modules powering enterprise property management
            </p>
          </div>

          <ServiceCarousel />
        </div>
      </div>
    </section>
  );
}