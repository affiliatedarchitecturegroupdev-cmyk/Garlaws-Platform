'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-blue-900">Garlaws</h1>
                <p className="text-xs text-gray-600 -mt-1">Property Lifecycle Platform</p>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/services" className="text-gray-700 hover:text-blue-600 font-medium">Services</Link>
              <Link href="/shop" className="text-gray-700 hover:text-blue-600 font-medium">Shop</Link>
              <Link href="/payment" className="text-gray-700 hover:text-blue-600 font-medium">Payments</Link>
              <Link href="/refer" className="text-gray-700 hover:text-blue-600 font-medium">Refer</Link>
              <Link href="/logistics" className="text-gray-700 hover:text-blue-600 font-medium">Logistics</Link>
              <Link href="/enterprise" className="text-gray-700 hover:text-blue-600 font-medium">Enterprise</Link>
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">Dashboard</Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login" className="text-gray-700 hover:text-blue-600 font-medium">Sign In</Link>
              <Link href="/auth/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }}></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Property Lifecycle Maintenance
            <span className="block text-blue-300">Orchestration Ecosystem</span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
            The comprehensive enterprise platform for managing properties, finances, supply chain, 
            customer relationships, and intelligent automation - all in one unified system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup" className="bg-white text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg">
              Start Free Trial
            </Link>
            <Link href="/demo" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-900 transition-colors">
              Schedule Demo
            </Link>
          </div>
        </div>
      </section>

      {/* E-Commerce Integration Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Integrated E-Commerce Platform</h2>
            <p className="text-xl text-gray-600">
              Seamlessly purchase services, manage subscriptions, and access premium features
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Service Cards */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-8">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Property Maintenance Services</h3>
                <p className="text-gray-600 mb-6">Professional maintenance, repairs, and inspections for your properties</p>
                <Link href="/services" className="text-blue-600 font-medium hover:text-blue-700">
                  View Services →
                </Link>
              </div>
            </div>

            {/* Subscription Plans */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg overflow-hidden text-white hover:shadow-xl transition-shadow">
              <div className="p-8">
                <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Enterprise Subscriptions</h3>
                <p className="text-blue-100 mb-6">Scalable plans for businesses of all sizes with full platform access</p>
                <Link href="/enterprise/subscription" className="text-white font-medium hover:text-blue-100 flex items-center">
                  View Plans →
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Marketplace */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-8">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Equipment & Supplies</h3>
                <p className="text-gray-600 mb-6">Quality products, tools, and materials for property management</p>
                <Link href="/shop" className="text-blue-600 font-medium hover:text-blue-700">
                  Visit Shop →
                </Link>
              </div>
            </div>
          </div>

          {/* Payment Integration */}
          <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-6 md:mb-0">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Secure Payment Processing</h3>
                <p className="text-gray-600">Integrated payment gateway supporting cards, bank transfers, and mobile payments</p>
              </div>
              <div className="flex space-x-4">
                <Link href="/payment" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Make Payment
                </Link>
                <Link href="/refer" className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Refer & Earn
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Modules Preview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Complete Ecosystem</h2>
            <p className="text-xl text-gray-600">
              Eight integrated modules covering every aspect of property lifecycle management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Financial', href: '/financial', color: 'blue' },
              { name: 'Supply Chain', href: '/supply-chain', color: 'green' },
              { name: 'Business Intelligence', href: '/bi', color: 'purple' },
              { name: 'CRM', href: '/crm', color: 'yellow' },
              { name: 'Security', href: '/security', color: 'red' },
              { name: 'Projects', href: '/projects', color: 'indigo' },
              { name: 'AI & ML', href: '/ml', color: 'pink' },
              { name: 'Integrations', href: '/integrations', color: 'cyan' },
            ].map((module) => (
              <Link
                key={module.name}
                href={module.href}
                className={`bg-${module.color}-50 border-2 border-${module.color}-200 rounded-lg p-6 hover:border-${module.color}-400 hover:shadow-lg transition-all group`}
              >
                <div className={`w-12 h-12 bg-${module.color}-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <div className={`w-6 h-6 bg-${module.color}-600 rounded`}></div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{module.name}</h3>
                <p className={`text-sm text-${module.color}-600 font-medium`}>Access Module →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Property Management?</h2>
          <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
            Join hundreds of property managers who trust Garlaws to streamline operations, enhance security, and drive growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup" className="bg-white text-blue-900 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Start Free Trial
            </Link>
            <Link href="/contact" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-900 transition-colors">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Garlaws Platform</h3>
              <p className="text-gray-400 text-sm">
                Enterprise Property Lifecycle Maintenance Orchestration Ecosystem for South Africa
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/financial" className="hover:text-white">Financial</Link></li>
                <li><Link href="/supply-chain" className="hover:text-white">Supply Chain</Link></li>
                <li><Link href="/crm" className="hover:text-white">CRM</Link></li>
                <li><Link href="/bi" className="hover:text-white">Business Intelligence</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/help" className="hover:text-white">Documentation</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/status" className="hover:text-white">System Status</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
                <li><Link href="/press" className="hover:text-white">Press</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>© 2024 Garlaws. All rights reserved. | Built with Next.js, TypeScript, and modern enterprise standards</p>
          </div>
        </div>
      </footer>
    </div>
  );
}