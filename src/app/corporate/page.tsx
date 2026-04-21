'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const corporateDesignTokens = {
  colors: {
    navy: {
      900: '#0a1628',
      800: '#0f2744',
      700: '#153661',
      600: '#1a4879',
    },
    gold: {
      500: '#c9a227',
      400: '#d4b442',
      300: '#dfc65d',
    },
    slate: {
      600: '#475569',
      500: '#64748b',
      400: '#94a3b8',
    },
    white: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
    }
  },
  gradients: {
    hero: 'linear-gradient(135deg, #0a1628 0%, #0f2744 50%, #153661 100%)',
    gold: 'linear-gradient(135deg, #c9a227 0%, #d4b442 50%, #c9a227 100%)',
    card: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
  }
};

interface Stat {
  value: string;
  label: string;
}

interface Feature {
  title: string;
  description: string;
  icon: string;
}

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
}

const stats: Stat[] = [
  { value: '500+', label: 'Enterprise Clients' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '24/7', label: 'Support' },
  { value: '50+', label: 'Integrations' },
];

const features: Feature[] = [
  {
    title: 'Property Portfolio Management',
    description: 'Centralize all your properties with real-time tracking, automated valuations, and comprehensive reporting dashboards.',
    icon: '🏢',
  },
  {
    title: 'Financial Intelligence',
    description: 'Automated reconciliation, expense tracking, and predictive analytics to maximize your property ROI.',
    icon: '📊',
  },
  {
    title: 'Tenant Lifecycle Management',
    description: 'End-to-end tenant onboarding, lease management, and communication automation.',
    icon: '👥',
  },
  {
    title: 'Maintenance Orchestration',
    description: 'AI-powered scheduling, vendor management, and preventive maintenance programs.',
    icon: '🔧',
  },
  {
    title: 'Compliance & Risk',
    description: 'Automated regulatory compliance, risk assessments, and audit-ready documentation.',
    icon: '🛡️',
  },
  {
    title: 'Business Intelligence',
    description: 'Custom dashboards, predictive analytics, and actionable insights for strategic decisions.',
    icon: '📈',
  },
];

const testimonials: Testimonial[] = [
  {
    quote: 'Garlaws transformed how we manage our 200+ property portfolio. The automation alone saved us 40 hours per week.',
    author: 'Sarah Mitchell',
    role: 'COO',
    company: 'PropertyCorp International',
  },
  {
    quote: 'The financial reconciliation features are phenomenal. We finally have real-time visibility into our entire portfolio.',
    author: 'James Chen',
    role: 'CFO',
    company: 'Meridian Holdings',
  },
  {
    quote: 'Enterprise-grade security and compliance built right in. Exactly what we needed for our public REIT.',
    author: 'Amanda Roberts',
    role: 'CTO',
    company: 'Sunrise REIT',
  },
];

export default function CorporateLandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);
    
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: corporateDesignTokens.colors.navy[900] }}>
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50" style={{ 
        background: 'rgba(10, 22, 40, 0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: corporateDesignTokens.gradients.gold }}
              >
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <div>
                <span className="text-white font-bold text-xl">Garlaws</span>
                <span className="text-white/40 text-sm ml-2">Enterprise</span>
              </div>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              {['Solutions', 'Platform', 'Pricing', 'Resources'].map((item) => (
                <a 
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-white/70 hover:text-white transition-colors text-sm font-medium"
                >
                  {item}
                </a>
              ))}
            </div>

            {/* CTA */}
            <div className="flex items-center space-x-4">
              <Link 
                href="/auth/login"
                className="text-white/70 hover:text-white text-sm font-medium hidden sm:block"
              >
                Sign In
              </Link>
              <button
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-navy-900 transition-all hover:scale-105"
                style={{ background: corporateDesignTokens.gradients.gold }}
              >
                Request Demo
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-32 pb-24 lg:pt-48 lg:pb-40 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{ 
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Gradient Orbs */}
        <div className="absolute top-20 left-0 w-[600px] h-[600px] rounded-full opacity-30 blur-[120px]" 
             style={{ background: 'radial-gradient(circle, #c9a227 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-20 blur-[100px]" 
             style={{ background: 'radial-gradient(circle, #153661 0%, transparent 70%)' }} />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="inline-flex items-center px-4 py-2 rounded-full mb-8" 
                   style={{ background: 'rgba(201, 162, 39, 0.1)', border: '1px solid rgba(201, 162, 39, 0.3)' }}>
                <span className="w-2 h-2 rounded-full mr-3 animate-pulse" 
                      style={{ background: corporateDesignTokens.colors.gold[500] }} />
                <span className="text-sm" style={{ color: corporateDesignTokens.colors.gold[400] }}>
                  Trusted by Fortune 500 Companies
                </span>
              </div>

              <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6">
                The Enterprise
                <br />
                <span style={{ 
                  background: corporateDesignTokens.gradients.gold,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  Property Platform
                </span>
              </h1>

              <p className="text-lg text-white/60 mb-8 max-w-xl leading-relaxed">
                Orchestrate your entire property lifecycle with AI-powered intelligence. 
                From portfolio optimization to tenant satisfaction, Garlaws delivers 
                enterprise-grade solutions at scale.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button 
                  className="px-8 py-4 rounded-xl font-semibold text-navy-900 transition-all hover:scale-105 hover:shadow-xl"
                  style={{ background: corporateDesignTokens.gradients.gold }}
                >
                  Start Free Trial
                </button>
                <button 
                  className="px-8 py-4 rounded-xl font-semibold text-white border border-white/20 hover:bg-white/5 transition-all"
                >
                  Watch Platform Tour
                </button>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center space-x-8">
                {['SOC 2', 'ISO 27001', 'GDPR', 'POPIA'].map((cert) => (
                  <div key={cert} className="text-white/40 text-xs font-medium uppercase tracking-wider">
                    {cert} Certified
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Feature Showcase */}
            <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="relative">
                {/* Main Card */}
                <div className="rounded-2xl p-8" 
                     style={{ 
                       background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                       border: '1px solid rgba(255,255,255,0.1)',
                       backdropFilter: 'blur(20px)'
                     }}>
                  {/* Feature Tabs */}
                  <div className="flex space-x-2 mb-8">
                    {features.slice(0, 4).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveFeature(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${activeFeature === idx ? 'w-8' : ''}`}
                        style={{ 
                          background: activeFeature === idx ? corporateDesignTokens.colors.gold[500] : 'rgba(255,255,255,0.2)'
                        }}
                      />
                    ))}
                  </div>

                  {/* Feature Content */}
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                         style={{ background: 'rgba(201, 162, 39, 0.1)' }}>
                      {features[activeFeature].icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {features[activeFeature].title}
                      </h3>
                      <p className="text-white/50 text-sm leading-relaxed">
                        {features[activeFeature].description}
                      </p>
                    </div>
                  </div>

                  {/* Mock Dashboard */}
                  <div className="grid grid-cols-3 gap-4 mt-8">
                    {[
                      { label: 'Total Properties', value: '247' },
                      { label: 'Occupancy Rate', value: '94.2%' },
                      { label: 'Revenue', value: '$2.4M' },
                    ].map((item) => (
                      <div key={item.label} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <div className="text-white/40 text-xs mb-1">{item.label}</div>
                        <div className="text-white font-semibold">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-2xl flex items-center justify-center"
                     style={{ background: 'rgba(201, 162, 39, 0.2)', backdropFilter: 'blur(10px)' }}>
                  <span className="text-3xl">📊</span>
                </div>
                <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-xl flex items-center justify-center"
                     style={{ background: 'rgba(21, 54, 97, 0.8)', backdropFilter: 'blur(10px)' }}>
                  <span className="text-xl">🔒</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold mb-2" 
                     style={{ 
                       background: corporateDesignTokens.gradients.gold,
                       WebkitBackgroundClip: 'text',
                       WebkitTextFillColor: 'transparent',
                     }}>
                  {stat.value}
                </div>
                <div className="text-white/50 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="solutions" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Enterprise Property Solutions
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto">
              A comprehensive platform built for large-scale property portfolios. 
              Every feature designed with enterprise requirements in mind.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div 
                key={feature.title}
                className="group p-8 rounded-2xl transition-all duration-300 hover:-translate-y-1"
                style={{ 
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}
              >
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-6 transition-transform group-hover:scale-110"
                     style={{ background: 'rgba(201, 162, 39, 0.1)' }}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 relative" style={{ background: 'rgba(15, 39, 68, 0.5)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Trusted by Industry Leaders
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div 
                key={idx}
                className="p-8 rounded-2xl"
                style={{ 
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <div className="text-4xl mb-4" style={{ color: corporateDesignTokens.colors.gold[500] }}>"</div>
                <p className="text-white/70 leading-relaxed mb-6">{testimonial.quote}</p>
                <div>
                  <div className="font-semibold text-white">{testimonial.author}</div>
                  <div className="text-sm" style={{ color: corporateDesignTokens.colors.gold[400] }}>
                    {testimonial.role}, {testimonial.company}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[120px]"
               style={{ background: 'radial-gradient(circle, #c9a227 0%, transparent 70%)' }} />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Property Portfolio?
          </h2>
          <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto">
            Join 500+ enterprise companies already using Garlaws to optimize 
            their property operations and maximize ROI.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="px-10 py-4 rounded-xl font-semibold text-navy-900 transition-all hover:scale-105 hover:shadow-xl"
              style={{ background: corporateDesignTokens.gradients.gold }}
            >
              Request Enterprise Demo
            </button>
            <button 
              className="px-10 py-4 rounded-xl font-semibold text-white border border-white/20 hover:bg-white/5 transition-all"
            >
              Contact Sales
            </button>
          </div>

          <p className="text-white/40 text-sm mt-8">
            No credit card required • 14-day free trial • Dedicated onboarding support
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                     style={{ background: corporateDesignTokens.gradients.gold }}>
                  <span className="text-white font-bold text-lg">G</span>
                </div>
                <span className="text-white font-bold text-xl">Garlaws</span>
              </div>
              <p className="text-white/50 text-sm leading-relaxed">
                Enterprise-grade property lifecycle orchestration platform trusted by Fortune 500 companies worldwide.
              </p>
            </div>

            {/* Links */}
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Integrations', 'Security'] },
              { title: 'Company', links: ['About', 'Careers', 'Press', 'Partners'] },
              { title: 'Resources', links: ['Documentation', 'API Reference', 'Blog', 'Support'] },
            ].map((section) => (
              <div key={section.title}>
                <h4 className="text-white font-semibold mb-4">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-white/50 hover:text-white text-sm transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 flex flex-col md:flex-row items-center justify-between" 
               style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-white/40 text-sm">
              © 2026 Garlaws Enterprise. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              {['Privacy Policy', 'Terms of Service', 'Cookie Settings'].map((link) => (
                <a key={link} href="#" className="text-white/40 hover:text-white text-sm transition-colors">
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}