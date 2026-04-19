'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function ProfessionalLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md shadow-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                  Garlaws
                </span>
                <div className="text-xs text-gray-500 -mt-1">Property Lifecycle Platform</div>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="/services" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Services
              </Link>
              <Link href="/shop" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Marketplace
              </Link>
              <Link href="/payment" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Payments
              </Link>
              <Link href="/enterprise" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Enterprise
              </Link>
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Dashboard
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/auth/login" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Sign In
              </Link>
              <Link href="/auth/signup" className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-800 transition-all shadow-lg hover:shadow-xl">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-100 rounded-full opacity-20 blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-8">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Enterprise-Grade Property Management Platform
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent leading-tight">
              Property Lifecycle
              <br />
              <span className="text-blue-600">Orchestration</span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Transform your property management operations with our comprehensive enterprise platform.
              From financial reconciliation to AI-powered insights, manage every aspect of your property lifecycle.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/auth/signup" className="group bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-800 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
                <span className="flex items-center justify-center">
                  Start Free Trial
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              <Link href="/demo" className="group border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-blue-500 hover:text-blue-600 transition-all shadow-lg hover:shadow-xl">
                <span className="flex items-center justify-center">
                  Schedule Demo
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </span>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">300+</div>
                <div className="text-sm text-gray-600">Source Files</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">140K+</div>
                <div className="text-sm text-gray-600">Lines of Code</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">120+</div>
                <div className="text-sm text-gray-600">Database Tables</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">42+</div>
                <div className="text-sm text-gray-600">Development Phases</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* E-Commerce Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Integrated E-Commerce Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional property maintenance services, premium equipment, and subscription plans
              delivered through our enterprise marketplace.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Service Marketplace */}
            <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Property Services</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Professional maintenance, repairs, and inspections from certified service providers.
                Book, track, and pay for services seamlessly.
              </p>
              <Link href="/services" className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 group-hover:translate-x-1 transition-transform">
                Explore Services →
              </Link>
            </div>

            {/* Equipment Marketplace */}
            <div className="group bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-100 hover:border-green-300 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Equipment & Supplies</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Quality tools, materials, and equipment for property management professionals.
                Competitive pricing with fast delivery.
              </p>
              <Link href="/shop" className="inline-flex items-center text-green-600 font-semibold hover:text-green-700 group-hover:translate-x-1 transition-transform">
                Visit Marketplace →
              </Link>
            </div>

            {/* Subscription Plans */}
            <div className="group bg-gradient-to-br from-purple-50 to-indigo-50 p-8 rounded-2xl border border-purple-100 hover:border-purple-300 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Enterprise Subscriptions</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Scalable subscription plans with full platform access, advanced features,
                and priority support for growing businesses.
              </p>
              <Link href="/enterprise/subscription" className="inline-flex items-center text-purple-600 font-semibold hover:text-purple-700 group-hover:translate-x-1 transition-transform">
                View Plans →
              </Link>
            </div>
          </div>

          {/* Payment Integration Showcase */}
          <div className="mt-16 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 border border-gray-200">
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <div className="mb-6 lg:mb-0">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Secure Payment Processing</h3>
                <p className="text-gray-600 text-lg max-w-xl">
                  Integrated payment gateway supporting multiple methods including cards, EFT, and mobile payments.
                  Bank-grade security with real-time processing.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/payment" className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl">
                  Make Payment
                </Link>
                <Link href="/refer" className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:border-blue-500 hover:text-blue-600 transition-all">
                  Refer & Earn
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Modules Grid */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Complete Enterprise Ecosystem
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Eight integrated modules covering every aspect of property lifecycle management,
              from operations to analytics and beyond.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: 'Financial Management',
                href: '/financial',
                icon: '💰',
                description: 'Reconciliation, invoicing, expense tracking',
                color: 'blue'
              },
              {
                name: 'Supply Chain',
                href: '/supply-chain',
                icon: '📦',
                description: 'Inventory, procurement, logistics',
                color: 'green'
              },
              {
                name: 'Business Intelligence',
                href: '/bi',
                icon: '📊',
                description: 'Analytics, reporting, dashboards',
                color: 'purple'
              },
              {
                name: 'CRM & Marketing',
                href: '/crm',
                icon: '👥',
                description: 'Customers, campaigns, lead management',
                color: 'pink'
              },
              {
                name: 'Security & Compliance',
                href: '/security',
                icon: '🔒',
                description: 'Authentication, audit, regulations',
                color: 'red'
              },
              {
                name: 'Project Management',
                href: '/projects',
                icon: '📋',
                description: 'Tasks, teams, collaboration tools',
                color: 'indigo'
              },
              {
                name: 'AI & Automation',
                href: '/ml',
                icon: '🤖',
                description: 'ML models, predictive analytics',
                color: 'cyan'
              },
              {
                name: 'Integrations',
                href: '/integrations',
                icon: '🔗',
                description: 'APIs, webhooks, third-party systems',
                color: 'orange'
              }
            ].map((module, index) => (
              <Link
                key={module.name}
                href={module.href}
                className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-gray-200 hover:-translate-y-2"
              >
                <div className={`w-14 h-14 bg-${module.color}-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md`}>
                  <span className="text-2xl">{module.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {module.name}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {module.description}
                </p>
                <div className="flex items-center text-blue-600 font-semibold group-hover:text-blue-700">
                  <span>Access Module</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Property Management?
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join hundreds of property managers who trust Garlaws to streamline operations,
            enhance security, and drive growth through intelligent automation.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/auth/signup" className="bg-white text-blue-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
              Start Free Trial Today
            </Link>
            <Link href="/contact" className="border-2 border-white text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-blue-600 transition-all">
              Contact Our Team
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-80">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Enterprise Security</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">24/7 Support</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">GDPR Compliant</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">G</span>
                </div>
                <div>
                  <span className="text-2xl font-bold">Garlaws</span>
                  <div className="text-gray-400 text-sm">Property Lifecycle Platform</div>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-md">
                Enterprise-grade property lifecycle management orchestration ecosystem for South Africa.
                Built with modern technologies and enterprise standards.
              </p>
              <div className="flex space-x-4 mt-6">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/financial" className="text-gray-400 hover:text-white transition-colors">Financial</Link></li>
                <li><Link href="/supply-chain" className="text-gray-400 hover:text-white transition-colors">Supply Chain</Link></li>
                <li><Link href="/crm" className="text-gray-400 hover:text-white transition-colors">CRM</Link></li>
                <li><Link href="/bi" className="text-gray-400 hover:text-white transition-colors">Analytics</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/help" className="text-gray-400 hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/status" className="text-gray-400 hover:text-white transition-colors">System Status</Link></li>
                <li><Link href="/careers" className="text-gray-400 hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2026 Garlaws Platform. All rights reserved. | Built with Next.js, TypeScript, and enterprise-grade architecture
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}