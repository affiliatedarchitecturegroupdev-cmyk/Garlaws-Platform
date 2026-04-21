'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { designTokens } from '@/design-system/tokens';
import FloatingElements from '@/features/landing/advanced-ui/FloatingElements';
import MagneticButton from '@/features/landing/advanced-ui/MagneticButton';
import UserOnboardingFlows from '@/features/landing/onboarding/UserOnboardingFlows';
import AccessibilityImprovements from '@/features/landing/accessibility/AccessibilityImprovements';
import LandingPageAnalytics from '@/features/landing/analytics/LandingPageAnalytics';

export default function ProfessionalLandingPage() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll('[data-section]');
    sections.forEach(section => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  // Auto-show onboarding for new users
  useEffect(() => {
    const hasVisited = localStorage.getItem('garlaws_visited');
    if (!hasVisited) {
      setTimeout(() => setShowOnboarding(true), 3000);
      localStorage.setItem('garlaws_visited', 'true');
    }
  }, []);

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: designTokens.colors.primary[50] }}>
      {/* Glass Morphism Background Overlay */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at 20% 50%, ${designTokens.colors.primary[100]} 0%, transparent 50%), radial-gradient(circle at 80% 20%, ${designTokens.colors.secondary[100]} 0%, transparent 50%), radial-gradient(circle at 40% 80%, ${designTokens.colors.accent[100]} 0%, transparent 50%)`
          }}
        ></div>
      </div>

      {/* Floating Elements Background */}
      <FloatingElements />
      {/* Professional Glass Morphism Navigation */}
      <nav
        className="fixed top-0 w-full z-50 transition-all duration-300"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            {/* Enhanced Brand Identity */}
            <div className="flex items-center space-x-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110"
                style={{
                  background: designTokens.colors.gradients.primary,
                  boxShadow: `0 8px 32px ${designTokens.colors.primaryAlpha[20]}`
                }}
              >
                <span className="text-white font-bold text-2xl">G</span>
              </div>
              <div>
                <h1
                  className="text-3xl font-bold bg-clip-text text-transparent hover:scale-105 transition-transform duration-300 cursor-pointer"
                  style={{ background: designTokens.colors.gradients.primary }}
                >
                  Garlaws
                </h1>
                <p
                  className="text-sm font-medium -mt-1"
                  style={{ color: designTokens.colors.primary[600] }}
                >
                  Enterprise Property Platform
                </p>
              </div>
            </div>

            {/* Responsive Navigation Menu */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link
                href="/services"
                className="relative font-semibold transition-all duration-300 hover:scale-105 group"
                style={{ color: designTokens.colors.primary[700] }}
              >
                Services
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link
                href="/shop"
                className="relative font-semibold transition-all duration-300 hover:scale-105 group"
                style={{ color: designTokens.colors.primary[700] }}
              >
                Marketplace
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link
                href="/payment"
                className="relative font-semibold transition-all duration-300 hover:scale-105 group"
                style={{ color: designTokens.colors.primary[700] }}
              >
                Payments
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link
                href="/enterprise"
                className="relative font-semibold transition-all duration-300 hover:scale-105 group"
                style={{ color: designTokens.colors.primary[700] }}
              >
                Enterprise
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link
                href="/dashboard"
                className="relative font-semibold transition-all duration-300 hover:scale-105 group"
                style={{ color: designTokens.colors.primary[700] }}
              >
                Dashboard
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </div>

            {/* Enhanced CTA Buttons */}
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="hidden sm:block px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                style={{
                  color: designTokens.colors.primary[700],
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-8 py-3 rounded-xl font-bold text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
                style={{ background: designTokens.colors.gradients.primary }}
              >
                Get Started
              </Link>

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-white/20 transition-colors"
                style={{ color: designTokens.colors.primary[700] }}
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Professional Hero Section with Service Carousel */}
      <section className="relative pt-32 pb-32 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Glass Morphism Hero Container */}
          <div
            className="relative rounded-3xl p-12 md:p-16 shadow-2xl animate-in fade-in duration-1000"
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
              className="inline-flex items-center px-6 py-3 rounded-full text-sm font-semibold mb-8 mx-auto animate-in slide-in-from-top duration-1000 delay-200"
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
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-center mb-8 leading-tight animate-in slide-in-from-bottom duration-1000 delay-400">
              Property Lifecycle
              <br />
              <span
                className="animate-in slide-in-from-bottom duration-1000 delay-600"
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
              className="text-xl md:text-2xl text-center mb-12 max-w-4xl mx-auto leading-relaxed animate-in fade-in duration-1000 delay-800"
              style={{ color: designTokens.colors.primary[700] }}
            >
              Transform your property management operations with our comprehensive enterprise platform.
              From AI-powered insights to seamless orchestration, manage every aspect of your property lifecycle with unparalleled precision.
            </p>

            {/* Enhanced CTA Section */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 animate-in fade-in duration-1000 delay-1000">
              <MagneticButton
                className="group px-10 py-5 font-bold text-xl animate-in zoom-in duration-1000 delay-1200"
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
                className="group px-10 py-5 font-bold text-xl animate-in zoom-in duration-1000 delay-1400"
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto animate-in slide-in-from-bottom duration-1000 delay-1200">
              <div
                className="text-center p-6 rounded-2xl animate-in zoom-in duration-1000 delay-1400"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${designTokens.colors.primary[200]}`
                }}
              >
                <div className="text-3xl font-bold mb-2" style={{ color: designTokens.colors.primary[800] }}>
                  386+
                </div>
                <div className="text-sm font-medium" style={{ color: designTokens.colors.primary[600] }}>
                  Source Files
                </div>
              </div>
              <div
                className="text-center p-6 rounded-2xl animate-in zoom-in duration-1000 delay-1600"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${designTokens.colors.secondary[200]}`
                }}
              >
                <div className="text-3xl font-bold mb-2" style={{ color: designTokens.colors.secondary[700] }}>
                  125K+
                </div>
                <div className="text-sm font-medium" style={{ color: designTokens.colors.secondary[600] }}>
                  Lines of Code
                </div>
              </div>
              <div
                className="text-center p-6 rounded-2xl animate-in zoom-in duration-1000 delay-1800"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${designTokens.colors.accent[200]}`
                }}
              >
                <div className="text-3xl font-bold mb-2" style={{ color: designTokens.colors.accent[700] }}>
                  130+
                </div>
                <div className="text-sm font-medium" style={{ color: designTokens.colors.accent[600] }}>
                  Database Tables
                </div>
              </div>
              <div
                className="text-center p-6 rounded-2xl animate-in zoom-in duration-1000 delay-2000"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${designTokens.colors.primary[200]}`
                }}
              >
                <div className="text-3xl font-bold mb-2" style={{ color: designTokens.colors.primary[800] }}>
                  56+
                </div>
                <div className="text-sm font-medium" style={{ color: designTokens.colors.primary[600] }}>
                  Development Phases
                </div>
              </div>
            </div>
          </div>

          {/* Service Carousel Section Below Hero */}
          <div className="mt-20">
            <div className="text-center mb-12">
              <h2
                className="text-4xl font-bold mb-4 animate-in fade-in duration-1000"
                style={{ color: designTokens.colors.primary[800] }}
              >
                Comprehensive Service Ecosystem
              </h2>
              <p
                className="text-xl animate-in fade-in duration-1000 delay-200"
                style={{ color: designTokens.colors.primary[600] }}
              >
                Explore our 8 core modules powering enterprise property management
              </p>
            </div>

            {/* Service Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  title: 'Property Assessment',
                  description: 'AI-powered valuation and analysis',
                  icon: '🏠',
                  href: '/assessment',
                  color: designTokens.colors.primary
                },
                {
                  title: 'Maintenance Scheduling',
                  description: 'Automated service orchestration',
                  icon: '🔧',
                  href: '/maintenance',
                  color: designTokens.colors.secondary
                },
                {
                  title: 'Financial Reconciliation',
                  description: 'Advanced accounting integration',
                  icon: '💰',
                  href: '/financial',
                  color: designTokens.colors.accent
                },
                {
                  title: 'Supplier Management',
                  description: 'Vendor network optimization',
                  icon: '🤝',
                  href: '/suppliers',
                  color: designTokens.colors.primary
                },
                {
                  title: 'Inventory Tracking',
                  description: 'Real-time stock management',
                  icon: '📦',
                  href: '/inventory',
                  color: designTokens.colors.secondary
                },
                {
                  title: 'Project Management',
                  description: 'Construction oversight tools',
                  icon: '📋',
                  href: '/projects',
                  color: designTokens.colors.accent
                },
                {
                  title: 'Analytics & Reporting',
                  description: 'Business intelligence dashboard',
                  icon: '📊',
                  href: '/analytics',
                  color: designTokens.colors.primary
                },
                {
                  title: 'E-commerce Marketplace',
                  description: 'Equipment and service procurement',
                  icon: '🛒',
                  href: '/marketplace',
                  color: designTokens.colors.secondary
                }
              ].map((service, index) => (
                <Link
                  key={service.title}
                  href={service.href}
                  className="group block animate-in slide-in-from-bottom duration-1000"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div
                    className="h-full p-8 rounded-3xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(15px)',
                      WebkitBackdropFilter: 'blur(15px)',
                      border: `1px solid ${service.color[200]}`
                    }}
                  >
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg group-hover:scale-110 transition-transform"
                      style={{ background: `linear-gradient(135deg, ${service.color[400]}, ${service.color[600]})` }}
                    >
                      <span className="text-2xl">{service.icon}</span>
                    </div>
                    <h3
                      className="text-xl font-bold text-center mb-3 group-hover:scale-105 transition-transform"
                      style={{ color: service.color[800] }}
                    >
                      {service.title}
                    </h3>
                    <p
                      className="text-center leading-relaxed group-hover:scale-105 transition-transform"
                      style={{ color: service.color[700] }}
                    >
                      {service.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Platform Overview Section */}
      <section
        className="py-32 relative"
        style={{ backgroundColor: designTokens.colors.primary[50] }}
      >
        <div className="absolute inset-0">
          <div
            className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-20 blur-3xl"
            style={{ backgroundColor: designTokens.colors.secondary[300] }}
          ></div>
          <div
            className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-20 blur-3xl"
            style={{ backgroundColor: designTokens.colors.accent[300] }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2
              className="text-5xl font-bold mb-6 animate-in slide-in-from-bottom duration-1000"
              style={{ color: designTokens.colors.primary[800] }}
            >
              Enterprise Platform Architecture
            </h2>
            <p
              className="text-xl max-w-4xl mx-auto animate-in fade-in duration-1000 delay-200"
              style={{ color: designTokens.colors.primary[600] }}
            >
              Eight interconnected modules working in perfect harmony to deliver comprehensive property lifecycle management
              with enterprise-grade security, scalability, and intelligence.
            </p>
          </div>

          {/* Interactive Platform Architecture Visualization */}
          <div className="relative mb-20">
            <div
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto"
            >
              {[
                { name: 'Financial', icon: '💰', desc: 'Reconciliation & Accounting', delay: 0 },
                { name: 'Supply Chain', icon: '📦', desc: 'Inventory & Procurement', delay: 100 },
                { name: 'Analytics', icon: '📊', desc: 'BI & Reporting', delay: 200 },
                { name: 'CRM', icon: '👥', desc: 'Customer Management', delay: 300 },
                { name: 'Security', icon: '🔒', desc: 'Compliance & Audit', delay: 400 },
                { name: 'Projects', icon: '📋', desc: 'Task Management', delay: 500 },
                { name: 'AI/ML', icon: '🤖', desc: 'Predictive Analytics', delay: 600 },
                { name: 'Integrations', icon: '🔗', desc: 'API Ecosystem', delay: 700 }
              ].map((module, index) => (
                <div
                  key={module.name}
                  className="group animate-in zoom-in duration-1000"
                  style={{ animationDelay: `${module.delay}ms` }}
                >
                  <div
                    className="aspect-square rounded-3xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-4 transition-all duration-500 cursor-pointer"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: `1px solid ${designTokens.colors.primary[200]}`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '2rem'
                    }}
                  >
                    <div
                      className="text-4xl mb-4 group-hover:scale-125 transition-transform duration-300"
                    >
                      {module.icon}
                    </div>
                    <h3
                      className="text-lg font-bold text-center mb-2 group-hover:scale-105 transition-transform"
                      style={{ color: designTokens.colors.primary[800] }}
                    >
                      {module.name}
                    </h3>
                    <p
                      className="text-sm text-center group-hover:scale-105 transition-transform"
                      style={{ color: designTokens.colors.primary[600] }}
                    >
                      {module.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Central Orchestration Hub */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-in zoom-in duration-1000 delay-800">
              <div
                className="w-24 h-24 rounded-full shadow-2xl flex items-center justify-center animate-pulse"
                style={{
                  background: designTokens.colors.gradients.primary,
                  boxShadow: `0 0 50px ${designTokens.colors.primaryAlpha[30]}`
                }}
              >
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div
                className="text-center mt-4 text-sm font-semibold animate-in fade-in duration-1000 delay-1000"
                style={{ color: designTokens.colors.primary[700] }}
              >
                Orchestration Layer
              </div>
            </div>
          </div>

          {/* Professional Trust Indicators */}
          <div
            className="rounded-3xl p-12 text-center animate-in slide-in-from-bottom duration-1000 delay-400"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: `1px solid ${designTokens.colors.primary[200]}`,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
            }}
          >
            <h3
              className="text-3xl font-bold mb-8 animate-in fade-in duration-1000 delay-600"
              style={{ color: designTokens.colors.primary[800] }}
            >
              Enterprise-Grade Assurance
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center animate-in zoom-in duration-1000 delay-800">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
                  style={{ background: designTokens.colors.gradients.primary }}
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold mb-2" style={{ color: designTokens.colors.primary[800] }}>
                  Bank-Level Security
                </h4>
                <p style={{ color: designTokens.colors.primary[600] }}>
                  Enterprise-grade encryption with compliance certifications
                </p>
              </div>

              <div className="flex flex-col items-center animate-in zoom-in duration-1000 delay-1000">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
                  style={{ background: designTokens.colors.gradients.secondary }}
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold mb-2" style={{ color: designTokens.colors.secondary[800] }}>
                  AI-Powered Intelligence
                </h4>
                <p style={{ color: designTokens.colors.secondary[700] }}>
                  Advanced machine learning for predictive analytics and automation
                </p>
              </div>

              <div className="flex flex-col items-center animate-in zoom-in duration-1000 delay-1200">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
                  style={{ background: designTokens.colors.gradients.surface }}
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold mb-2" style={{ color: designTokens.colors.accent[800] }}>
                  Global Scalability
                </h4>
                <p style={{ color: designTokens.colors.accent[700] }}>
                  Multi-tenant architecture supporting enterprise deployments worldwide
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Enterprise Showcase */}
      <section
        className="py-32 relative overflow-hidden"
        style={{ backgroundColor: designTokens.colors.primary[900] }}
      >
        <div className="absolute inset-0">
          <div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
            style={{ background: designTokens.colors.gradients.primary }}
          ></div>
          <div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl"
            style={{ background: designTokens.colors.gradients.secondary }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2
              className="text-5xl font-bold mb-6 text-white animate-in slide-in-from-bottom duration-1000"
            >
              Built for Enterprise Excellence
            </h2>
            <p
              className="text-xl max-w-4xl mx-auto text-white/80 animate-in fade-in duration-1000 delay-200"
            >
              From Fortune 500 companies to growing property management firms, Garlaws delivers
              the reliability, security, and intelligence that enterprises demand.
            </p>
          </div>

          {/* Enterprise Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: '99.9% Uptime SLA',
                description: 'Enterprise-grade reliability with guaranteed uptime and disaster recovery',
                icon: '⚡',
                gradient: designTokens.colors.gradients.primary
              },
              {
                title: 'Bank-Level Security',
                description: 'GDPR, POPIA, and SOC 2 compliance with end-to-end encryption',
                icon: '🔐',
                gradient: designTokens.colors.gradients.secondary
              },
              {
                title: '24/7 Enterprise Support',
                description: 'Dedicated technical account managers and priority support channels',
                icon: '🎯',
                gradient: designTokens.colors.gradients.surface
              },
              {
                title: 'Multi-Tenant Architecture',
                description: 'Isolated environments with advanced data segregation and compliance',
                icon: '🏢',
                gradient: designTokens.colors.gradients.primary
              },
              {
                title: 'Advanced AI Integration',
                description: 'Machine learning models trained on millions of property transactions',
                icon: '🧠',
                gradient: designTokens.colors.gradients.secondary
              },
              {
                title: 'Global Scalability',
                description: 'Deploy anywhere with automatic scaling and edge computing optimization',
                icon: '🌍',
                gradient: designTokens.colors.gradients.surface
              }
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="group animate-in slide-in-from-bottom duration-1000"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div
                  className="h-full p-8 rounded-3xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-4 transition-all duration-500"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform"
                    style={{ background: feature.gradient }}
                  >
                    <span className="text-3xl">{feature.icon}</span>
                  </div>
                  <h3
                    className="text-xl font-bold mb-4 text-white group-hover:scale-105 transition-transform"
                  >
                    {feature.title}
                  </h3>
                  <p
                    className="text-white/80 leading-relaxed group-hover:scale-105 transition-transform"
                  >
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Enterprise CTA Section */}
          <div
            className="mt-20 text-center rounded-3xl p-12 animate-in slide-in-from-bottom duration-1000 delay-800"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <h3
              className="text-4xl font-bold mb-6 text-white animate-in fade-in duration-1000 delay-1000"
            >
              Ready to Transform Your Enterprise?
            </h3>
            <p
              className="text-xl mb-8 text-white/80 max-w-3xl mx-auto animate-in fade-in duration-1000 delay-1200"
            >
              Join industry leaders who trust Garlaws for mission-critical property management operations.
              Schedule a personalized enterprise consultation today.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center animate-in fade-in duration-1000 delay-1400">
              <MagneticButton
                className="group px-10 py-5 font-bold shadow-2xl animate-in zoom-in duration-1000 delay-800"
                variant="primary"
                onClick={() => window.location.href = '/enterprise/demo'}
              >
                <span className="flex items-center justify-center">
                  Schedule Enterprise Demo
                  <svg className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </MagneticButton>
              <MagneticButton
                className="group px-10 py-5 font-bold shadow-xl animate-in zoom-in duration-1000 delay-1000"
                variant="glass"
                onClick={() => window.location.href = '/enterprise/contact'}
              >
                Contact Enterprise Sales
              </MagneticButton>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Call to Action with Onboarding Integration */}
      <section
        className="py-24 relative overflow-hidden animate-in slide-in-from-bottom duration-1000"
        style={{ background: designTokens.colors.gradients.primary }}
      >
        <div className="absolute inset-0">
          <div
            className="absolute top-20 left-10 w-96 h-96 rounded-full opacity-10 animate-pulse"
            style={{ backgroundColor: designTokens.colors.secondary[400] }}
          ></div>
          <div
            className="absolute bottom-20 right-10 w-80 h-80 rounded-full opacity-10 animate-pulse"
            style={{ backgroundColor: designTokens.colors.accent[400], animationDelay: '1s' }}
          ></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 text-white animate-in fade-in duration-1000 delay-200">
            Ready to Transform Your Property Management?
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-4xl mx-auto animate-in fade-in duration-1000 delay-400">
            Join hundreds of property managers who trust Garlaws to streamline operations,
            enhance security, and drive growth through intelligent automation and advanced AI.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 animate-in fade-in duration-1000 delay-600">
            <Link
              href="/auth/signup"
              className="group px-12 py-5 rounded-2xl font-bold text-xl text-white shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-300 animate-in zoom-in duration-1000 delay-800"
              style={{ backgroundColor: designTokens.colors.secondary[500] }}
            >
              <span className="flex items-center justify-center">
                Start Free Trial Today
                <svg className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
            <Link
              href="/contact"
              className="group px-12 py-5 rounded-2xl font-bold text-xl border-2 border-white text-white hover:bg-white hover:text-gray-900 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 animate-in zoom-in duration-1000 delay-1000"
            >
              Contact Our Team
            </Link>
          </div>

          {/* Enhanced Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-white/80 animate-in fade-in duration-1000 delay-800">
            <div className="flex items-center space-x-3 bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Enterprise Security</span>
            </div>
            <div className="flex items-center space-x-3 bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">24/7 AI Support</span>
            </div>
            <div className="flex items-center space-x-3 bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">GDPR Compliant</span>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Enterprise Footer */}
      <footer
        className="py-20 relative overflow-hidden animate-in fade-in duration-1000 delay-200"
        style={{ backgroundColor: '#0a0a0a' }}
      >
        <div className="absolute inset-0">
          <div
            className="absolute top-10 left-10 w-64 h-64 rounded-full opacity-5 blur-3xl"
            style={{ background: designTokens.colors.gradients.primary }}
          ></div>
          <div
            className="absolute bottom-10 right-10 w-80 h-80 rounded-full opacity-5 blur-3xl"
            style={{ background: designTokens.colors.gradients.secondary }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12">
            {/* Brand Section */}
            <div className="lg:col-span-4">
              <div className="flex items-center space-x-4 mb-6">
                <div
                  className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-2xl"
                  style={{ background: designTokens.colors.gradients.primary }}
                >
                  <span className="text-white font-bold text-3xl">G</span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-1">Garlaws</h2>
                  <p className="text-white/60 text-sm">Enterprise Property Platform</p>
                </div>
              </div>

              <p className="text-white/70 text-base leading-relaxed mb-8">
                The most comprehensive property lifecycle management platform, combining AI-powered insights,
                enterprise-grade security, and seamless orchestration across all property operations.
              </p>

              {/* Social Links */}
              <div className="flex space-x-4 mb-8">
                <a
                  href="#"
                  className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all duration-300"
                  aria-label="LinkedIn"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all duration-300"
                  aria-label="Twitter"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all duration-300"
                  aria-label="YouTube"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>

              <AccessibilityImprovements />
            </div>

            {/* Platform Links */}
            <div className="lg:col-span-2">
              <h4 className="text-lg font-semibold mb-6 text-white">Platform Modules</h4>
              <ul className="space-y-4">
                <li>
                  <Link href="/financial" className="text-white/60 hover:text-white transition-colors flex items-center group">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40 mr-3 group-hover:bg-white transition-colors"></span>
                    Financial Management
                  </Link>
                </li>
                <li>
                  <Link href="/supply-chain" className="text-white/60 hover:text-white transition-colors flex items-center group">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40 mr-3 group-hover:bg-white transition-colors"></span>
                    Supply Chain
                  </Link>
                </li>
                <li>
                  <Link href="/bi" className="text-white/60 hover:text-white transition-colors flex items-center group">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40 mr-3 group-hover:bg-white transition-colors"></span>
                    Business Intelligence
                  </Link>
                </li>
                <li>
                  <Link href="/crm" className="text-white/60 hover:text-white transition-colors flex items-center group">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40 mr-3 group-hover:bg-white transition-colors"></span>
                    CRM & Marketing
                  </Link>
                </li>
                <li>
                  <Link href="/security" className="text-white/60 hover:text-white transition-colors flex items-center group">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40 mr-3 group-hover:bg-white transition-colors"></span>
                    Security & Compliance
                  </Link>
                </li>
              </ul>
            </div>

            {/* Services Links */}
            <div className="lg:col-span-2">
              <h4 className="text-lg font-semibold mb-6 text-white">Services</h4>
              <ul className="space-y-4">
                <li>
                  <Link href="/projects" className="text-white/60 hover:text-white transition-colors flex items-center group">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40 mr-3 group-hover:bg-white transition-colors"></span>
                    Project Management
                  </Link>
                </li>
                <li>
                  <Link href="/ml" className="text-white/60 hover:text-white transition-colors flex items-center group">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40 mr-3 group-hover:bg-white transition-colors"></span>
                    AI & Automation
                  </Link>
                </li>
                <li>
                  <Link href="/integrations" className="text-white/60 hover:text-white transition-colors flex items-center group">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40 mr-3 group-hover:bg-white transition-colors"></span>
                    API Integrations
                  </Link>
                </li>
                <li>
                  <Link href="/marketplace" className="text-white/60 hover:text-white transition-colors flex items-center group">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40 mr-3 group-hover:bg-white transition-colors"></span>
                    E-commerce Marketplace
                  </Link>
                </li>
                <li>
                  <Link href="/enterprise" className="text-white/60 hover:text-white transition-colors flex items-center group">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40 mr-3 group-hover:bg-white transition-colors"></span>
                    Enterprise Solutions
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support & Company */}
            <div className="lg:col-span-2">
              <h4 className="text-lg font-semibold mb-6 text-white">Company</h4>
              <ul className="space-y-4">
                <li>
                  <Link href="/about" className="text-white/60 hover:text-white transition-colors flex items-center group">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40 mr-3 group-hover:bg-white transition-colors"></span>
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="text-white/60 hover:text-white transition-colors flex items-center group">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40 mr-3 group-hover:bg-white transition-colors"></span>
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-white/60 hover:text-white transition-colors flex items-center group">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40 mr-3 group-hover:bg-white transition-colors"></span>
                    Contact Sales
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="text-white/60 hover:text-white transition-colors flex items-center group">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40 mr-3 group-hover:bg-white transition-colors"></span>
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/status" className="text-white/60 hover:text-white transition-colors flex items-center group">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40 mr-3 group-hover:bg-white transition-colors"></span>
                    System Status
                  </Link>
                </li>
              </ul>
            </div>

            {/* Newsletter Signup */}
            <div className="lg:col-span-2">
              <h4 className="text-lg font-semibold mb-6 text-white">Stay Updated</h4>
              <p className="text-white/70 mb-6">
                Get the latest updates on new features, industry insights, and platform enhancements.
              </p>
              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                />
                <button
                  className="w-full py-3 rounded-2xl font-semibold text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
                  style={{ background: designTokens.colors.gradients.primary }}
                >
                  Subscribe to Updates
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div
            className="border-t pt-8"
            style={{ borderColor: designTokens.colors.primary[800] }}
          >
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-white/50 text-sm mb-4 md:mb-0">
                © 2026 Garlaws Platform. All rights reserved. | Enterprise-grade property lifecycle management
              </p>
              <div className="flex items-center space-x-6">
                <Link href="/privacy" className="text-white/50 hover:text-white text-sm transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-white/50 hover:text-white text-sm transition-colors">
                  Terms of Service
                </Link>
                <Link href="/compliance" className="text-white/50 hover:text-white text-sm transition-colors">
                  Compliance
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>




    </div>
  );
}