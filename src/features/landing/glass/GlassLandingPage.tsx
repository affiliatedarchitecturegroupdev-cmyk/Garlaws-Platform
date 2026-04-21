'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const PRIMARY = '#1f2937';
const SLATE = '#45a29e';

interface Service {
  id: string;
  title: string;
  description: string;
  href: string;
}

interface ServiceGroup {
  category: string;
  services: Service[];
}

const serviceGroups: ServiceGroup[] = [
  {
    category: 'Financial Operations',
    services: [
      { id: 'financial', title: 'Financial Management', description: 'Complete reconciliation and accounting automation', href: '/financial' },
      { id: 'budgeting', title: 'Budgeting & Planning', description: 'Advanced budget creation and monitoring', href: '/financial' },
    ]
  },
  {
    category: 'Supply & Operations',
    services: [
      { id: 'supply-chain', title: 'Supply Chain', description: 'Inventory and procurement management', href: '/supply-chain' },
      { id: 'logistics', title: 'Logistics', description: 'Shipping and delivery optimization', href: '/logistics' },
    ]
  },
  {
    category: 'Intelligence & CRM',
    services: [
      { id: 'analytics', title: 'Business Intelligence', description: 'Advanced analytics and reporting', href: '/bi' },
      { id: 'crm', title: 'CRM & Marketing', description: 'Customer relationship automation', href: '/crm' },
    ]
  },
  {
    category: 'Projects & Security',
    services: [
      { id: 'projects', title: 'Project Management', description: 'Construction coordination', href: '/projects' },
      { id: 'security', title: 'Security & Compliance', description: 'Enterprise security framework', href: '/security' },
    ]
  },
  {
    category: 'AI & Integration',
    services: [
      { id: 'ai', title: 'AI & Automation', description: 'Machine learning workflows', href: '/ml' },
      { id: 'integrations', title: 'Integrations', description: 'Third-party connectors', href: '/integrations' },
    ]
  },
];

const heroSlides = [
  { title: 'Financial Management', description: 'Automated reconciliation, budget tracking, and tax compliance for enterprise property portfolios.' },
  { title: 'Supply Chain', description: 'End-to-end inventory management, supplier portals, and procurement workflows.' },
  { title: 'Business Intelligence', description: 'Real-time dashboards, predictive analytics, and custom reporting engines.' },
  { title: 'CRM & Marketing', description: 'Customer lifecycle management, campaign automation, and email integration.' },
  { title: 'Project Management', description: 'Kanban boards, Gantt charts, and resource allocation for construction projects.' },
  { title: 'Security & Compliance', description: 'MFA, audit logging, threat detection, and regulatory compliance tools.' },
  { title: 'AI & Automation', description: 'Predictive maintenance, chat assistants, and auto workflows.' },
  { title: 'API Integrations', description: 'Webhooks, API connectors, and data synchronization engine.' },
  { title: 'Enterprise ERP', description: 'Business process automation and cross-system synchronization.' },
  { title: 'E-commerce', description: 'Full marketplace platform with payment processing.' },
];

export default function GlassLandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const nextSlide = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
      setIsTransitioning(false);
    }, 300);
  }, []);

  const prevSlide = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
      setIsTransitioning(false);
    }, 300);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <div className="min-h-screen" style={{ 
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <nav className="sticky top-0 z-50 backdrop-blur-xl" style={{ 
        background: 'rgba(255, 255, 255, 0.8)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
      }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SLATE} 100%)` }}
              >
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="text-xl font-semibold" style={{ color: PRIMARY }}>Garlaws</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link href="/financial" className="text-sm" style={{ color: '#64748b' }}>Financial</Link>
              <Link href="/bi" className="text-sm" style={{ color: '#64748b' }}>Analytics</Link>
              <Link href="/enterprise" className="text-sm" style={{ color: '#64748b' }}>Enterprise</Link>
              <Link href="/dashboard" className="text-sm" style={{ color: '#64748b' }}>Dashboard</Link>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="px-4 py-2 text-sm rounded-lg backdrop-blur-sm"
                style={{ color: '#374151', background: 'rgba(255, 255, 255, 0.8)', border: '1px solid rgba(0, 0, 0, 0.1)' }}
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 text-sm font-medium text-white rounded-lg shadow-md"
                style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SLATE} 100%)` }}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <p
                  className="inline-block px-4 py-1.5 text-sm rounded-full mb-6 backdrop-blur-sm"
                  style={{ background: 'rgba(255, 255, 255, 0.8)', color: '#64748b', border: '1px solid rgba(0, 0, 0, 0.05)' }}
                >
                  Enterprise Property Lifecycle Platform
                </p>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ color: '#0f172a' }}>
                  Property Lifecycle
                  <br />
                  <span style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SLATE} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    Orchestration
                  </span>
                </h1>

                <p className="text-lg md:text-xl mb-8" style={{ color: '#64748b' }}>
                  Transform your property management operations with comprehensive enterprise tools.
                  Manage every aspect of your property lifecycle from acquisition through disposition.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/auth/signup"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-medium text-white rounded-xl shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SLATE} 100%)` }}
                  >
                    Start Free Trial
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-medium rounded-xl backdrop-blur-sm"
                    style={{ color: '#374151', background: 'rgba(255, 255, 255, 0.8)', border: '1px solid rgba(0, 0, 0, 0.1)' }}
                  >
                    Contact Sales
                  </Link>
                </div>
              </div>

              <div
                className="relative rounded-3xl p-8 backdrop-blur-xl shadow-2xl"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.5)'
                }}
              >
                <div
                  className="absolute top-4 right-4 w-20 h-20 rounded-full blur-3xl"
                  style={{ background: SLATE, opacity: 0.3 }}
                />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-sm font-medium" style={{ color: '#64748b' }}>
                      {currentSlide + 1} / {heroSlides.length}
                    </span>
                    <div className="flex gap-1.5">
                      {heroSlides.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSlide(index)}
                          className="w-2 h-2 rounded-full transition-all"
                          style={{ 
                            background: currentSlide === index ? SLATE : '#cbd5e1',
                            transform: currentSlide === index ? 'scale(1.2)' : 'scale(1)'
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div
                    className="transition-all duration-300"
                    style={{ 
                      opacity: isTransitioning ? 0 : 1,
                      transform: isTransitioning ? 'translateY(10px)' : 'translateY(0)'
                    }}
                  >
                    <h3 className="text-2xl font-bold mb-3" style={{ color: '#0f172a' }}>
                      {heroSlides[currentSlide].title}
                    </h3>
                    <p className="text-base mb-6" style={{ color: '#64748b' }}>
                      {heroSlides[currentSlide].description}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={prevSlide}
                      className="w-10 h-10 rounded-lg flex items-center justify-center backdrop-blur-sm"
                      style={{ background: 'rgba(255, 255, 255, 0.8)', border: '1px solid rgba(0, 0, 0, 0.1)' }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={nextSlide}
                      className="w-10 h-10 rounded-lg flex items-center justify-center backdrop-blur-sm"
                      style={{ background: 'rgba(255, 255, 255, 0.8)', border: '1px solid rgba(0, 0, 0, 0.1)' }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3" style={{ color: '#0f172a' }}>Platform Services</h2>
              <p className="text-lg" style={{ color: '#64748b' }}>Comprehensive tools for property management</p>
            </div>

            {serviceGroups.map((group, groupIndex) => (
              <div key={group.category} className="mb-12">
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#475569' }}>{group.category}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {group.services.map((service) => (
                    <Link
                      key={service.id}
                      href={service.href}
                      className="group p-6 rounded-2xl backdrop-blur-sm transition-all duration-200 hover:shadow-lg"
                      style={{ 
                        background: 'rgba(255, 255, 255, 0.7)',
                        border: '1px solid rgba(0, 0, 0, 0.05)'
                      }}
                    >
                      <h4 className="text-base font-medium mb-2 group-hover:scale-105 transition-transform" style={{ color: '#0f172a' }}>
                        {service.title}
                      </h4>
                      <p className="text-sm" style={{ color: '#64748b' }}>{service.description}</p>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div
              className="rounded-3xl p-12 backdrop-blur-xl"
              style={{ 
                background: 'rgba(255, 255, 255, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.5)'
              }}
            >
              <h2 className="text-3xl font-bold mb-4" style={{ color: '#0f172a' }}>Ready to Get Started?</h2>
              <p className="text-lg mb-8" style={{ color: '#64748b' }}>
                Start your free trial today. No credit card required.
              </p>
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white rounded-xl shadow-lg"
                style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SLATE} 100%)` }}
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 backdrop-blur-xl" style={{ 
        background: 'rgba(255, 255, 255, 0.5)',
        borderTop: '1px solid rgba(0, 0, 0, 0.05)'
      }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col md:flex-row items-center gap-6 text-sm" style={{ color: '#64748b' }}>
              <span>2024 Garlaws</span>
              <div className="flex items-center gap-4">
                <Link href="/privacy" className="hover:opacity-70">Privacy</Link>
                <Link href="/terms" className="hover:opacity-70">Terms</Link>
                <Link href="/contact" className="hover:opacity-70">Contact</Link>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm" style={{ color: '#64748b' }}>
              <span className="w-2 h-2 rounded-full" style={{ background: '#22c55e' }}></span>
              All systems operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}