'use client';

import Link from 'next/link';

export default function Home() {
  const modules = [
    { name: 'Financial Reconciliation', href: '/financial', description: 'Bank reconciliation, invoices, expenses' },
    { name: 'Supply Chain & Logistics', href: '/supply-chain', description: 'Inventory, procurement, warehouses' },
    { name: 'Business Intelligence', href: '/bi', description: 'Dashboards, analytics, reports' },
    { name: 'CRM & Marketing', href: '/crm', description: 'Customers, campaigns, leads' },
    { name: 'Security & Compliance', href: '/security', description: 'Authentication, audit logs, policies' },
    { name: 'Project Management', href: '/projects', description: 'Tasks, teams, documents' },
    { name: 'AI & Automation', href: '/ml', description: 'ML models, experiments, pipelines' },
    { name: 'Integrations', href: '/integrations', description: 'API gateway, webhooks, SSO' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Garlaws Platform</h1>
              <p className="text-gray-600 mt-1">Enterprise Property Lifecycle Maintenance Orchestration Ecosystem</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 text-gray-600 hover:text-gray-900">Login</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Get Started</button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex space-x-6 overflow-x-auto">
            {modules.map((module) => (
              <Link
                key={module.name}
                href={module.href}
                className="text-gray-600 hover:text-blue-600 whitespace-nowrap font-medium"
              >
                {module.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Complete Enterprise Platform
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A fully integrated ecosystem covering financial management, supply chain, CRM, security, project management, AI/ML, and enterprise integrations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((module) => (
            <Link
              key={module.name}
              href={module.href}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 group"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
                {module.name}
              </h3>
              <p className="text-sm text-gray-600">{module.description}</p>
              <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
                Open
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Platform Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-blue-600">90+</p>
              <p className="text-gray-600">Database Tables</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-600">306</p>
              <p className="text-gray-600">Source Files</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-600">120K+</p>
              <p className="text-gray-600">Lines of Code</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-orange-600">40+</p>
              <p className="text-gray-600">Development Phases</p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Ready to explore the platform?</p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/financial"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              View Financial Dashboard
            </Link>
            <Link
              href="/bi"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              Explore BI Dashboard
            </Link>
            <Link
              href="/security"
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
            >
              Security Overview
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-white mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400">Garlaws Platform - Property Lifecycle Maintenance Orchestration</p>
          <p className="text-sm text-gray-500 mt-2">Built with Next.js, TypeScript, and modern enterprise standards</p>
        </div>
      </footer>
    </div>
  );
}