'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const PRIMARY = '#2d7d2d';
const PRIMARY_LIGHT = '#3d9d3d';
const GOLD = '#c5a059';
const SLATE = '#45a29e';
const BACKGROUND = '#ffffff';
const TEXT_DARK = '#1a1a1a';
const TEXT_MUTED = '#6b7280';

interface Module {
  id: string;
  title: string;
  href: string;
}

const modules: Module[] = [
  { id: 'financial', title: 'Financial Management', href: '/financial' },
  { id: 'supply', title: 'Supply Chain', href: '/supply-chain' },
  { id: 'analytics', title: 'Business Intelligence', href: '/bi' },
  { id: 'crm', title: 'CRM & Marketing', href: '/crm' },
  { id: 'projects', title: 'Project Management', href: '/projects' },
  { id: 'ai', title: 'AI & Automation', href: '/ml' },
  { id: 'security', title: 'Security', href: '/security' },
  { id: 'integrations', title: 'Integrations', href: '/integrations' },
];

const stats = [
  { value: '386+', label: 'Source Files' },
  { value: '125K+', label: 'Lines of Code' },
  { value: '130+', label: 'Database Tables' },
  { value: '56+', label: 'Development Phases' },
];

export default function CleanLandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: BACKGROUND }}>
      <nav className="sticky top-0 z-50 border-b" style={{ borderColor: '#e5e7eb', backgroundColor: BACKGROUND }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SLATE} 100%)` }}
            >
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <span className="text-xl font-semibold" style={{ color: TEXT_DARK }}>Garlaws</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/financial" className="text-sm" style={{ color: TEXT_MUTED }}>Financial</Link>
            <Link href="/bi" className="text-sm" style={{ color: TEXT_MUTED }}>Analytics</Link>
            <Link href="/enterprise" className="text-sm" style={{ color: TEXT_MUTED }}>Enterprise</Link>
            <Link href="/dashboard" className="text-sm" style={{ color: TEXT_MUTED }}>Dashboard</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/signup"
              className="px-5 py-2.5 text-sm font-medium rounded-lg"
              style={{ color: TEXT_DARK, border: '1px solid #d1d5db' }}
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="px-5 py-2.5 text-sm font-medium text-white rounded-lg"
              style={{ backgroundColor: PRIMARY }}
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section className="py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p
            className="inline-block px-4 py-1.5 text-sm font-medium rounded-full mb-8"
            style={{ backgroundColor: '#f3f4f6', color: TEXT_MUTED }}
          >
            Enterprise Property Lifecycle Platform
          </p>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ color: TEXT_DARK }}>
            Property Lifecycle
            <br />
            <span style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SLATE} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Orchestration
            </span>
          </h1>

          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10" style={{ color: TEXT_MUTED }}>
            Transform your property management operations with comprehensive enterprise tools.
            From AI-powered insights to seamless orchestration, manage every aspect of your property lifecycle.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-medium text-white rounded-lg"
              style={{ backgroundColor: PRIMARY }}
            >
              Start Free Trial
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-medium rounded-lg"
              style={{ color: TEXT_DARK, border: '1px solid #d1d5db' }}
            >
              Schedule Demo
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold mb-1" style={{ color: TEXT_DARK }}>{stat.value}</div>
                <div className="text-sm" style={{ color: TEXT_MUTED }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20" style={{ backgroundColor: '#f9fafb' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: TEXT_DARK }}>
              Platform Modules
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: TEXT_MUTED }}>
              Eight interconnected modules for comprehensive property management
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((module) => (
              <Link
                key={module.id}
                href={module.href}
                className="p-6 rounded-xl transition-all duration-200 hover:shadow-lg"
                style={{ 
                  backgroundColor: BACKGROUND,
                  border: '1px solid #e5e7eb',
                }}
              >
                <h3 className="text-base font-medium mb-1" style={{ color: TEXT_DARK }}>{module.title}</h3>
                <p className="text-sm" style={{ color: TEXT_MUTED }}>View details</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="md:col-span-2">
              <h2 className="text-3xl font-bold mb-4" style={{ color: TEXT_DARK }}>
                Built for Enterprise
              </h2>
              <p className="text-lg mb-8" style={{ color: TEXT_MUTED }}>
                From AI-powered insights to seamless orchestration, manage every aspect of your property 
                lifecycle with unparalleled precision and security. Our platform provides comprehensive tools 
                for property management, financial tracking, and operational excellence.
              </p>
              <div className="space-y-6">
                <div>
                  <h4 className="text-base font-medium mb-2" style={{ color: TEXT_DARK }}>Security</h4>
                  <p className="text-sm" style={{ color: TEXT_MUTED }}>
                    Enterprise-grade encryption with SOC 2 Type II compliance
                  </p>
                </div>
                <div>
                  <h4 className="text-base font-medium mb-2" style={{ color: TEXT_DARK }}>Analytics</h4>
                  <p className="text-sm" style={{ color: TEXT_MUTED }}>
                    Real-time dashboards with predictive insights
                  </p>
                </div>
                <div>
                  <h4 className="text-base font-medium mb-2" style={{ color: TEXT_DARK }}>Scalability</h4>
                  <p className="text-sm" style={{ color: TEXT_MUTED }}>
                    Multi-tenant architecture for enterprise deployments
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <div
                className="p-8 rounded-xl text-center"
                style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
              >
                <div className="text-4xl font-bold mb-2" style={{ color: PRIMARY }}>100%</div>
                <p className="text-sm" style={{ color: TEXT_MUTED }}>Platform Uptime</p>
                <div className="mt-6 text-4xl font-bold mb-2" style={{ color: SLATE }}>24/7</div>
                <p className="text-sm" style={{ color: TEXT_MUTED }}>Support Available</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t" style={{ borderColor: '#e5e7eb' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6 text-sm" style={{ color: TEXT_MUTED }}>
              <span>2024 Garlaws</span>
              <Link href="/privacy" className="hover:opacity-70">Privacy</Link>
              <Link href="/terms" className="hover:opacity-70">Terms</Link>
            </div>
            <div className="flex items-center gap-2 text-sm" style={{ color: TEXT_MUTED }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#22c55e' }}></span>
              All systems operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}