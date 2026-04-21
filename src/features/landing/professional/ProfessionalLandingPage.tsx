'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ProfessionalLandingPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen font-sans" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <nav className="sticky top-0 z-50 bg-white border-b" style={{ borderColor: '#e5e7eb' }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: '#1f2937' }}
              >
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="text-xl font-semibold" style={{ color: '#1f2937' }}>Garlaws</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <Link href="/financial" className="text-sm" style={{ color: '#6b7280' }}>Financial</Link>
              <Link href="/bi" className="text-sm" style={{ color: '#6b7280' }}>Analytics</Link>
              <Link href="/enterprise" className="text-sm" style={{ color: '#6b7280' }}>Enterprise</Link>
              <Link href="/dashboard" className="text-sm" style={{ color: '#6b7280' }}>Dashboard</Link>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="px-4 py-2 text-sm rounded-lg"
                style={{ color: '#374151', border: '1px solid #d1d5db' }}
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 text-sm font-medium text-white rounded-lg"
                style={{ backgroundColor: '#1f2937' }}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <section className="py-20 md:py-28" style={{ backgroundColor: '#f9fafb' }}>
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p
              className="inline-block px-4 py-1.5 text-sm rounded-full mb-6"
              style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}
            >
              Enterprise Property Lifecycle Platform
            </p>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ color: '#111827' }}>
              Property Lifecycle
              <br />
              <span style={{ color: '#1f2937' }}>Orchestration</span>
            </h1>

            <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10" style={{ color: '#6b7280' }}>
              Transform your property management operations with comprehensive enterprise tools.
              Manage every aspect of your property lifecycle from acquisition through disposition.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-medium text-white rounded-lg"
                style={{ backgroundColor: '#1f2937' }}
              >
                Start Free Trial
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-medium rounded-lg"
                style={{ color: '#374151', border: '1px solid #d1d5db' }}
              >
                Contact Sales
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8" style={{ borderTop: '1px solid #e5e7eb' }}>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1" style={{ color: '#111827' }}>386+</div>
                <div className="text-sm" style={{ color: '#6b7280' }}>Source Files</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1" style={{ color: '#111827' }}>125K+</div>
                <div className="text-sm" style={{ color: '#6b7280' }}>Lines of Code</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1" style={{ color: '#111827' }}>130+</div>
                <div className="text-sm" style={{ color: '#6b7280' }}>Database Tables</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1" style={{ color: '#111827' }}>56+</div>
                <div className="text-sm" style={{ color: '#6b7280' }}>Development Phases</div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4" style={{ color: '#111827' }}>Platform Modules</h2>
              <p className="text-lg" style={{ color: '#6b7280' }}>Comprehensive tools for property management</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Financial Management', href: '/financial' },
                { title: 'Supply Chain', href: '/supply-chain' },
                { title: 'Business Intelligence', href: '/bi' },
                { title: 'CRM & Marketing', href: '/crm' },
                { title: 'Project Management', href: '/projects' },
                { title: 'AI & Automation', href: '/ml' },
                { title: 'Security', href: '/security' },
                { title: 'Integrations', href: '/integrations' },
              ].map((module) => (
                <Link
                  key={module.href}
                  href={module.href}
                  className="p-6 rounded-xl"
                  style={{ 
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <h3 className="text-base font-medium mb-1" style={{ color: '#111827' }}>{module.title}</h3>
                  <p className="text-sm" style={{ color: '#6b7280' }}>View details</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20" style={{ backgroundColor: '#f9fafb' }}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold mb-4" style={{ color: '#111827' }}>Enterprise Platform</h2>
                <p className="text-base mb-6" style={{ color: '#6b7280' }}>
                  Manage every aspect of your property lifecycle with comprehensive tools for financial tracking,
                  operational excellence, and strategic insights.
                </p>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-base font-medium mb-2" style={{ color: '#111827' }}>Security</h4>
                    <p className="text-sm" style={{ color: '#6b7280' }}>Enterprise-grade encryption with compliance certifications</p>
                  </div>
                  <div>
                    <h4 className="text-base font-medium mb-2" style={{ color: '#111827' }}>Analytics</h4>
                    <p className="text-sm" style={{ color: '#6b7280' }}>Real-time dashboards with predictive insights</p>
                  </div>
                  <div>
                    <h4 className="text-base font-medium mb-2" style={{ color: '#111827' }}>Scalability</h4>
                    <p className="text-sm" style={{ color: '#6b7280' }}>Multi-tenant architecture for enterprise deployments</p>
                  </div>
                </div>
              </div>

              <div>
                <div
                  className="p-8 rounded-xl"
                  style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}
                >
                  <div className="mb-6">
                    <div className="text-sm mb-2" style={{ color: '#6b7280' }}>Platform Uptime</div>
                    <div className="text-4xl font-bold" style={{ color: '#111827' }}>99.9%</div>
                  </div>
                  <div className="mb-6">
                    <div className="text-sm mb-2" style={{ color: '#6b7280' }}>Support</div>
                    <div className="text-4xl font-bold" style={{ color: '#111827' }}>24/7</div>
                  </div>
                  <div>
                    <div className="text-sm mb-2" style={{ color: '#6b7280' }}>Response Time</div>
                    <div className="text-4xl font-bold" style={{ color: '#111827' }}>&lt;1s</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-4" style={{ color: '#111827' }}>Ready to Get Started?</h2>
            <p className="text-lg mb-8" style={{ color: '#6b7280' }}>
              Start your free trial today. No credit card required.
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white rounded-lg"
              style={{ backgroundColor: '#1f2937' }}
            >
              Start Free Trial
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t" style={{ borderColor: '#e5e7eb' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6 text-sm" style={{ color: '#6b7280' }}>
              <span>2024 Garlaws</span>
              <Link href="/privacy" className="hover:opacity-70">Privacy</Link>
              <Link href="/terms" className="hover:opacity-70">Terms</Link>
              <Link href="/contact" className="hover:opacity-70">Contact</Link>
            </div>
            <div className="flex items-center gap-2 text-sm" style={{ color: '#6b7280' }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#22c55e' }}></span>
              All systems operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}