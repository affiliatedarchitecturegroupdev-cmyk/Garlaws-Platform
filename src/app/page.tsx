'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { designTokens } from '@/design-system/tokens';
import EnhancedUIComponents from '@/features/landing/advanced-ui/EnhancedUIComponents';
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
    <div className="min-h-screen" style={{ backgroundColor: designTokens.colors.primary[50] }}>
      {/* Enhanced Background with Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 animate-pulse"
          style={{ backgroundColor: designTokens.colors.primary[400], animationDelay: '0s' }}
        ></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-20 animate-pulse"
          style={{ backgroundColor: designTokens.colors.secondary[400], animationDelay: '2s' }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 animate-pulse"
          style={{ backgroundColor: designTokens.colors.accent[400], animationDelay: '4s' }}
        ></div>
      </div>

      {/* Enhanced UI Components Integration */}
      <EnhancedUIComponents />
      {/* Enhanced Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b" style={{ backgroundColor: `${designTokens.colors.primary[50]}cc`, backdropFilter: 'blur(12px)', borderColor: designTokens.colors.primary[100] }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: designTokens.colors.gradients.primary }}
              >
                <span className="text-white font-bold text-xl">G</span>
              </div>
              <div>
                <span
                  className="text-3xl font-bold bg-clip-text text-transparent"
                  style={{ background: designTokens.colors.gradients.primary }}
                >
                  Garlaws
                </span>
                <div className="text-xs -mt-1" style={{ color: designTokens.colors.primary[600] }}>
                  Property Lifecycle Platform
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/services"
                className="font-medium transition-all hover:scale-105"
                style={{ color: designTokens.colors.primary[700] }}
              >
                Services
              </Link>
              <Link
                href="/shop"
                className="font-medium transition-all hover:scale-105"
                style={{ color: designTokens.colors.primary[700] }}
              >
                Marketplace
              </Link>
              <Link
                href="/payment"
                className="font-medium transition-all hover:scale-105"
                style={{ color: designTokens.colors.primary[700] }}
              >
                Payments
              </Link>
              <Link
                href="/enterprise"
                className="font-medium transition-all hover:scale-105"
                style={{ color: designTokens.colors.primary[700] }}
              >
                Enterprise
              </Link>
              <Link
                href="/dashboard"
                className="font-medium transition-all hover:scale-105"
                style={{ color: designTokens.colors.primary[700] }}
              >
                Dashboard
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="font-medium transition-all hover:scale-105"
                style={{ color: designTokens.colors.primary[700] }}
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-6 py-3 rounded-xl font-semibold text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all"
                style={{ background: designTokens.colors.gradients.primary }}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Enhanced Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Enhanced Badge with Animation */}
            <div
              className="inline-flex items-center px-6 py-3 rounded-full text-sm font-medium mb-8 shadow-lg animate-in fade-in duration-1000"
              style={{
                backgroundColor: designTokens.colors.primaryAlpha[10],
                color: designTokens.colors.primary[700],
                border: `1px solid ${designTokens.colors.primary[200]}`
              }}
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Enterprise-Grade Property Management Platform
            </div>

            {/* Enhanced Main Heading */}
            <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight animate-in slide-in-from-bottom duration-1000 delay-200">
              Property Lifecycle
              <br />
              <span
                className="animate-in slide-in-from-bottom duration-1000 delay-400"
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

            {/* Enhanced Subheading */}
            <p
              className="text-xl md:text-2xl mb-12 max-w-5xl mx-auto leading-relaxed animate-in fade-in duration-1000 delay-600"
              style={{ color: designTokens.colors.primary[600] }}
            >
              Transform your property management operations with our comprehensive enterprise platform.
              From financial reconciliation to AI-powered insights, manage every aspect of your property lifecycle.
            </p>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 animate-in fade-in duration-1000 delay-800">
              <Link
                href="/auth/signup"
                className="group px-10 py-5 rounded-2xl font-bold text-xl text-white shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-300 animate-in zoom-in duration-1000 delay-1000"
                style={{ background: designTokens.colors.gradients.primary }}
              >
                <span className="flex items-center justify-center">
                  Start Free Trial
                  <svg className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              <Link
                href="/demo"
                className="group px-10 py-5 rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 animate-in zoom-in duration-1000 delay-1200"
                style={{
                  border: `2px solid ${designTokens.colors.primary[300]}`,
                  color: designTokens.colors.primary[700],
                  backgroundColor: designTokens.colors.primary[50]
                }}
              >
                <span className="flex items-center justify-center">
                  Schedule Demo
                  <svg className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </span>
              </Link>
            </div>

            {/* Enhanced Stats with Animated Counters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto animate-in fade-in duration-1000 delay-1000">
              <div className="text-center p-6 rounded-2xl" style={{ backgroundColor: designTokens.colors.primaryAlpha[5] }}>
                <div className="text-4xl font-bold mb-2 animate-in zoom-in duration-1000 delay-1200" style={{ color: designTokens.colors.primary[700] }}>
                  386+
                </div>
                <div className="text-sm font-medium" style={{ color: designTokens.colors.primary[600] }}>Source Files</div>
              </div>
              <div className="text-center p-6 rounded-2xl" style={{ backgroundColor: designTokens.colors.primaryAlpha[5] }}>
                <div className="text-4xl font-bold mb-2 animate-in zoom-in duration-1000 delay-1400" style={{ color: designTokens.colors.primary[700] }}>
                  125K+
                </div>
                <div className="text-sm font-medium" style={{ color: designTokens.colors.primary[600] }}>Lines of Code</div>
              </div>
              <div className="text-center p-6 rounded-2xl" style={{ backgroundColor: designTokens.colors.primaryAlpha[5] }}>
                <div className="text-4xl font-bold mb-2 animate-in zoom-in duration-1000 delay-1600" style={{ color: designTokens.colors.primary[700] }}>
                  130+
                </div>
                <div className="text-sm font-medium" style={{ color: designTokens.colors.primary[600] }}>Database Tables</div>
              </div>
              <div className="text-center p-6 rounded-2xl" style={{ backgroundColor: designTokens.colors.primaryAlpha[5] }}>
                <div className="text-4xl font-bold mb-2 animate-in zoom-in duration-1000 delay-1800" style={{ color: designTokens.colors.primary[700] }}>
                  56+
                </div>
                <div className="text-sm font-medium" style={{ color: designTokens.colors.primary[600] }}>Development Phases</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Services Section with Interactive Components */}
      <section
        className="py-24"
        style={{ backgroundColor: designTokens.colors.primary[50] }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2
              className="text-5xl font-bold mb-6 animate-in slide-in-from-bottom duration-1000"
              style={{ color: designTokens.colors.primary[800] }}
            >
              Integrated Enterprise Platform
            </h2>
            <p
              className="text-xl max-w-4xl mx-auto animate-in fade-in duration-1000 delay-200"
              style={{ color: designTokens.colors.primary[600] }}
            >
              Professional property maintenance services, premium equipment, and subscription plans
              delivered through our comprehensive enterprise ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Enhanced Service Marketplace */}
            <div
              className="group p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-in slide-in-from-left duration-1000 delay-300"
              style={{
                backgroundColor: designTokens.colors.primary[50],
                border: `1px solid ${designTokens.colors.primary[200]}`
              }}
            >
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-xl animate-in zoom-in duration-1000 delay-500"
                style={{ background: designTokens.colors.gradients.primary }}
              >
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3
                className="text-2xl font-bold mb-4 animate-in fade-in duration-1000 delay-700"
                style={{ color: designTokens.colors.primary[800] }}
              >
                Property Services
              </h3>
              <p
                className="mb-6 leading-relaxed animate-in fade-in duration-1000 delay-900"
                style={{ color: designTokens.colors.primary[600] }}
              >
                Professional maintenance, repairs, and inspections from certified service providers.
                Book, track, and pay for services seamlessly with AI-powered matching.
              </p>
              <Link
                href="/services"
                className="inline-flex items-center font-semibold hover:scale-105 transition-all animate-in fade-in duration-1000 delay-1100"
                style={{ color: designTokens.colors.primary[700] }}
              >
                Explore Services →
              </Link>
            </div>

            {/* Enhanced Equipment Marketplace */}
            <div
              className="group p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-in slide-in-from-bottom duration-1000 delay-400"
              style={{
                backgroundColor: designTokens.colors.secondary[50],
                border: `1px solid ${designTokens.colors.secondary[200]}`
              }}
            >
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-xl animate-in zoom-in duration-1000 delay-600"
                style={{ background: designTokens.colors.gradients.secondary }}
              >
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3
                className="text-2xl font-bold mb-4 animate-in fade-in duration-1000 delay-800"
                style={{ color: designTokens.colors.secondary[800] }}
              >
                Equipment & Supplies
              </h3>
              <p
                className="mb-6 leading-relaxed animate-in fade-in duration-1000 delay-1000"
                style={{ color: designTokens.colors.secondary[700] }}
              >
                Quality tools, materials, and equipment for property management professionals.
                AI-powered recommendations with competitive pricing and fast delivery.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center font-semibold hover:scale-105 transition-all animate-in fade-in duration-1000 delay-1200"
                style={{ color: designTokens.colors.secondary[700] }}
              >
                Visit Marketplace →
              </Link>
            </div>

            {/* Enhanced Subscription Plans */}
            <div
              className="group p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-in slide-in-from-right duration-1000 delay-500"
              style={{
                backgroundColor: designTokens.colors.accent[50],
                border: `1px solid ${designTokens.colors.accent[200]}`
              }}
            >
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-xl animate-in zoom-in duration-1000 delay-700"
                style={{ background: designTokens.colors.gradients.surface }}
              >
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3
                className="text-2xl font-bold mb-4 animate-in fade-in duration-1000 delay-900"
                style={{ color: designTokens.colors.accent[800] }}
              >
                Enterprise Subscriptions
              </h3>
              <p
                className="mb-6 leading-relaxed animate-in fade-in duration-1000 delay-1100"
                style={{ color: designTokens.colors.accent[700] }}
              >
                Scalable subscription plans with full platform access, advanced AI features,
                and priority support for growing property management businesses.
              </p>
              <Link
                href="/enterprise/subscription"
                className="inline-flex items-center font-semibold hover:scale-105 transition-all animate-in fade-in duration-1000 delay-1300"
                style={{ color: designTokens.colors.accent[700] }}
              >
                View Plans →
              </Link>
            </div>
          </div>

          {/* Enhanced Payment Integration */}
          <div
            className="rounded-3xl p-10 shadow-2xl animate-in slide-in-from-bottom duration-1000 delay-600"
            style={{
              background: designTokens.colors.gradients.surface,
              border: `1px solid ${designTokens.colors.primary[200]}`
            }}
          >
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <div className="mb-8 lg:mb-0">
                <h3
                  className="text-3xl font-bold mb-4 animate-in fade-in duration-1000 delay-800"
                  style={{ color: designTokens.colors.primary[800] }}
                >
                  Secure Payment Processing
                </h3>
                <p
                  className="text-lg max-w-xl animate-in fade-in duration-1000 delay-1000"
                  style={{ color: designTokens.colors.primary[600] }}
                >
                  Integrated payment gateway supporting multiple methods including cards, EFT, and mobile payments.
                  Bank-grade security with real-time processing and AI-powered fraud detection.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in duration-1000 delay-1200">
                <Link
                  href="/payment"
                  className="px-8 py-4 rounded-2xl font-semibold text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all"
                  style={{ background: designTokens.colors.gradients.primary }}
                >
                  Make Payment
                </Link>
                <Link
                  href="/refer"
                  className="px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
                  style={{
                    border: `2px solid ${designTokens.colors.primary[300]}`,
                    color: designTokens.colors.primary[700],
                    backgroundColor: 'rgba(255, 255, 255, 0.9)'
                  }}
                >
                  Refer & Earn
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Platform Modules with Interactive Components */}
      <section
        className="py-24"
        style={{ backgroundColor: designTokens.colors.primary[100] }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2
              className="text-5xl font-bold mb-6 animate-in slide-in-from-bottom duration-1000"
              style={{ color: designTokens.colors.primary[800] }}
            >
              Complete Enterprise Ecosystem
            </h2>
            <p
              className="text-xl max-w-4xl mx-auto animate-in fade-in duration-1000 delay-200"
              style={{ color: designTokens.colors.primary[600] }}
            >
              Eight integrated modules covering every aspect of property lifecycle management,
              from operations to AI-powered analytics and enterprise automation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: 'Financial Management',
                href: '/financial',
                icon: '💰',
                description: 'Advanced reconciliation, invoicing, expense tracking with AI insights',
                gradient: designTokens.colors.gradients.primary,
                bgColor: designTokens.colors.primary[50],
                borderColor: designTokens.colors.primary[200]
              },
              {
                name: 'Supply Chain',
                href: '/supply-chain',
                icon: '📦',
                description: 'Intelligent inventory, procurement, and logistics optimization',
                gradient: designTokens.colors.gradients.secondary,
                bgColor: designTokens.colors.secondary[50],
                borderColor: designTokens.colors.secondary[200]
              },
              {
                name: 'Business Intelligence',
                href: '/bi',
                icon: '📊',
                description: 'Real-time analytics, reporting, and predictive dashboards',
                gradient: designTokens.colors.gradients.surface,
                bgColor: designTokens.colors.accent[50],
                borderColor: designTokens.colors.accent[200]
              },
              {
                name: 'CRM & Marketing',
                href: '/crm',
                icon: '👥',
                description: 'Customer lifecycle management with automated marketing campaigns',
                gradient: designTokens.colors.gradients.primary,
                bgColor: designTokens.colors.primary[50],
                borderColor: designTokens.colors.primary[200]
              },
              {
                name: 'Security & Compliance',
                href: '/security',
                icon: '🔒',
                description: 'Enterprise security with MFA, audit trails, and compliance monitoring',
                gradient: designTokens.colors.gradients.secondary,
                bgColor: designTokens.colors.secondary[50],
                borderColor: designTokens.colors.secondary[200]
              },
              {
                name: 'Project Management',
                href: '/projects',
                icon: '📋',
                description: 'Kanban boards, Gantt charts, and collaborative team workflows',
                gradient: designTokens.colors.gradients.surface,
                bgColor: designTokens.colors.accent[50],
                borderColor: designTokens.colors.accent[200]
              },
              {
                name: 'AI & Automation',
                href: '/ml',
                icon: '🤖',
                description: 'Machine learning models with predictive maintenance and recommendations',
                gradient: designTokens.colors.gradients.primary,
                bgColor: designTokens.colors.primary[50],
                borderColor: designTokens.colors.primary[200]
              },
              {
                name: 'Integrations',
                href: '/integrations',
                icon: '🔗',
                description: 'REST APIs, webhooks, and seamless third-party system integration',
                gradient: designTokens.colors.gradients.secondary,
                bgColor: designTokens.colors.secondary[50],
                borderColor: designTokens.colors.secondary[200]
              }
            ].map((module, index) => (
              <Link
                key={module.name}
                href={module.href}
                className="group rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 animate-in slide-in-from-bottom duration-1000"
                style={{
                  backgroundColor: module.bgColor,
                  border: `1px solid ${module.borderColor}`,
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform animate-in zoom-in duration-1000"
                  style={{ background: module.gradient }}
                >
                  <span className="text-3xl">{module.icon}</span>
                </div>
                <h3
                  className="text-xl font-bold mb-4 group-hover:scale-105 transition-transform animate-in fade-in duration-1000 delay-200"
                  style={{ color: designTokens.colors.primary[800] }}
                >
                  {module.name}
                </h3>
                <p
                  className="text-sm leading-relaxed mb-6 animate-in fade-in duration-1000 delay-400"
                  style={{ color: designTokens.colors.primary[600] }}
                >
                  {module.description}
                </p>
                <div
                  className="flex items-center font-semibold group-hover:translate-x-2 transition-transform animate-in fade-in duration-1000 delay-600"
                  style={{ color: designTokens.colors.primary[700] }}
                >
                  <span>Access Module</span>
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
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

      {/* Enhanced Footer with Accessibility */}
      <footer
        className="py-16 animate-in fade-in duration-1000 delay-200"
        style={{ backgroundColor: designTokens.colors.primary[900] }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-4 mb-6">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ background: designTokens.colors.gradients.primary }}
                >
                  <span className="text-white font-bold text-2xl">G</span>
                </div>
                <div>
                  <span className="text-3xl font-bold text-white">Garlaws</span>
                  <div className="text-white/60 text-sm">Property Lifecycle Platform</div>
                </div>
              </div>
              <p className="text-white/70 text-sm leading-relaxed max-w-md mb-6">
                Enterprise-grade property lifecycle management orchestration ecosystem for South Africa.
                Built with modern technologies, advanced AI, and enterprise-grade security.
              </p>
              <AccessibilityImprovements />
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Platform</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/financial" className="text-white/60 hover:text-white transition-colors">Financial</Link></li>
                <li><Link href="/supply-chain" className="text-white/60 hover:text-white transition-colors">Supply Chain</Link></li>
                <li><Link href="/crm" className="text-white/60 hover:text-white transition-colors">CRM</Link></li>
                <li><Link href="/bi" className="text-white/60 hover:text-white transition-colors">Analytics</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Support</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/help" className="text-white/60 hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/contact" className="text-white/60 hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/status" className="text-white/60 hover:text-white transition-colors">System Status</Link></li>
                <li><Link href="/careers" className="text-white/60 hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>
          </div>

          <div
            className="border-t pt-8 text-center"
            style={{ borderColor: designTokens.colors.primary[700] }}
          >
            <p className="text-white/50 text-sm">
              © 2026 Garlaws Platform. All rights reserved. | Built with Next.js, TypeScript, and enterprise-grade architecture
            </p>
          </div>
        </div>
      </footer>

      {/* User Onboarding Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in duration-500"
            style={{ backgroundColor: designTokens.colors.primary[50] }}
          >
            <div
              className="flex justify-between items-center p-8 border-b"
              style={{ borderColor: designTokens.colors.primary[200] }}
            >
              <h3
                className="text-3xl font-bold"
                style={{ color: designTokens.colors.primary[800] }}
              >
                Welcome to Garlaws Platform
              </h3>
              <button
                onClick={() => setShowOnboarding(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
                aria-label="Close onboarding"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <UserOnboardingFlows />
            </div>
          </div>
        </div>
      )}

      {/* Landing Page Analytics (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 z-40 animate-in slide-in-from-left duration-500">
          <details className="bg-white rounded-2xl shadow-xl border" style={{ borderColor: designTokens.colors.primary[200] }}>
            <summary className="p-4 cursor-pointer hover:bg-gray-50 rounded-2xl font-medium" style={{ color: designTokens.colors.primary[700] }}>
              📊 Landing Analytics
            </summary>
            <div className="p-6 border-t" style={{ borderColor: designTokens.colors.primary[100] }}>
              <LandingPageAnalytics />
            </div>
          </details>
        </div>
      )}

      {/* Accessibility Panel */}
      <div className="fixed bottom-4 right-4 z-40 animate-in slide-in-from-right duration-500">
        <button
          className="p-4 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all"
          style={{
            background: designTokens.colors.gradients.primary,
            color: 'white'
          }}
          aria-label="Accessibility Options"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
          </svg>
        </button>
      </div>


    </div>
  );
}