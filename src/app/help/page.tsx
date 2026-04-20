'use client';

import Link from 'next/link';
import { useState } from 'react';

interface HelpArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  lastUpdated: string;
}

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const helpArticles: HelpArticle[] = [
    {
      id: 'getting-started',
      title: 'Getting Started with Garlaws Platform',
      category: 'basics',
      content: `
        Welcome to Garlaws Platform! This comprehensive guide will help you get started with our enterprise-grade ecosystem.

        ## First Steps
        1. **Create your account** - Sign up for a free trial
        2. **Set up your profile** - Add your company information
        3. **Choose your modules** - Select the business modules you need
        4. **Invite your team** - Add colleagues and set permissions

        ## Navigation
        Use the unified navigation panel to access all platform features. The navigation is organized by:
        - **Core Platform**: Dashboard, services, mobile features
        - **Business Modules**: E-commerce, financial, supply chain, CRM, projects
        - **Enterprise**: ERP, analytics, AI/ML, security, QA, integrations

        ## Quick Tips
        - Use the search function to quickly find features
        - Check notifications for important updates
        - Access help anytime using the ? button
      `,
      tags: ['onboarding', 'basics', 'navigation'],
      lastUpdated: '2024-01-15'
    },
    {
      id: 'ecommerce-setup',
      title: 'Setting Up Your E-commerce Store',
      category: 'ecommerce',
      content: `
        Transform your business with our flagship e-commerce platform.

        ## Store Configuration
        1. **Store Settings** - Configure your store name, domain, and branding
        2. **Product Catalog** - Add products with variants, pricing, and inventory
        3. **Payment Integration** - Connect payment gateways (Stripe, PayPal, EFT)
        4. **Shipping Setup** - Configure shipping zones and rates

        ## Advanced Features
        - **AI-Powered Recommendations** - Personalized product suggestions
        - **Real-time Inventory** - Automatic stock updates
        - **Multi-channel Selling** - Sell across web, mobile, and marketplaces
        - **Analytics Dashboard** - Track sales, customers, and performance

        ## Best Practices
        - Use high-quality product images
        - Write detailed product descriptions
        - Set competitive pricing
        - Offer multiple payment options
      `,
      tags: ['ecommerce', 'setup', 'products', 'payments'],
      lastUpdated: '2024-01-20'
    },
    {
      id: 'erp-integration',
      title: 'ERP System Integration Guide',
      category: 'enterprise',
      content: `
        Learn how to integrate and automate your business processes with our ERP system.

        ## Module Overview
        - **Business Process Automation** - Design and execute automated workflows
        - **Cross-System Synchronization** - Sync data between different platforms
        - **Industry-Specific Modules** - Pre-built solutions for your industry
        - **Automation Engine** - Rule-based process automation

        ## Getting Started
        1. **Assess your needs** - Identify processes to automate
        2. **Map your workflows** - Document current business processes
        3. **Design automation** - Use our visual workflow designer
        4. **Test and deploy** - Thoroughly test before going live

        ## Common Use Cases
        - Purchase order approval workflows
        - Invoice processing automation
        - Customer onboarding sequences
        - Inventory replenishment alerts
      `,
      tags: ['erp', 'automation', 'workflows', 'integration'],
      lastUpdated: '2024-01-25'
    },
    {
      id: 'mobile-features',
      title: 'Mobile and PWA Features',
      category: 'mobile',
      content: `
        Experience our platform on any device with advanced mobile capabilities.

        ## PWA Features
        - **Installable** - Add to home screen on mobile devices
        - **Offline Support** - Continue working without internet
        - **Push Notifications** - Real-time updates and alerts
        - **Native Performance** - Fast loading and smooth interactions

        ## Device Integration
        - **Camera Access** - Take photos and scan documents
        - **GPS Tracking** - Location-based services
        - **Biometric Auth** - Fingerprint and face recognition
        - **Device Sensors** - Accelerometer, gyroscope, and more

        ## Mobile Optimization
        - **Touch-Friendly UI** - Optimized for touch interactions
        - **Responsive Design** - Adapts to any screen size
        - **Gesture Support** - Swipe, pinch, and multi-touch gestures
        - **Performance Monitoring** - Real-time performance metrics
      `,
      tags: ['mobile', 'pwa', 'offline', 'device-integration'],
      lastUpdated: '2024-01-30'
    },
    {
      id: 'security-compliance',
      title: 'Security and Compliance',
      category: 'security',
      content: `
        Enterprise-grade security and compliance features.

        ## Security Features
        - **Multi-Factor Authentication** - Enhanced account security
        - **Role-Based Access Control** - Granular permissions
        - **Audit Logging** - Complete activity tracking
        - **Data Encryption** - End-to-end encryption

        ## Compliance Standards
        - **GDPR** - European data protection regulations
        - **HIPAA** - Healthcare data privacy
        - **PCI DSS** - Payment card industry standards
        - **SOX** - Sarbanes-Oxley financial reporting

        ## Best Practices
        - Use strong, unique passwords
        - Enable two-factor authentication
        - Regularly review access permissions
        - Keep software updated
        - Monitor security alerts
      `,
      tags: ['security', 'compliance', 'gdpr', 'hipaa'],
      lastUpdated: '2024-02-01'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Topics', count: helpArticles.length },
    { id: 'basics', label: 'Getting Started', count: helpArticles.filter(a => a.category === 'basics').length },
    { id: 'ecommerce', label: 'E-commerce', count: helpArticles.filter(a => a.category === 'ecommerce').length },
    { id: 'enterprise', label: 'Enterprise', count: helpArticles.filter(a => a.category === 'enterprise').length },
    { id: 'mobile', label: 'Mobile & PWA', count: helpArticles.filter(a => a.category === 'mobile').length },
    { id: 'security', label: 'Security', count: helpArticles.filter(a => a.category === 'security').length }
  ];

  const filteredArticles = helpArticles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = !searchTerm ||
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help & Documentation</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive guides, tutorials, and documentation to help you make the most of Garlaws Platform.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search help articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div className="flex space-x-2 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.label} ({category.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">FAQ</h3>
            <p className="text-sm text-gray-600">Frequently asked questions</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Video Tutorials</h3>
            <p className="text-sm text-gray-600">Step-by-step video guides</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Live Chat</h3>
            <p className="text-sm text-gray-600">Get instant help from our team</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Contact Support</h3>
            <p className="text-sm text-gray-600">Submit a support ticket</p>
          </div>
        </div>

        {/* Articles */}
        <div className="space-y-6">
          {filteredArticles.map((article) => (
            <article key={article.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        article.category === 'basics' ? 'bg-blue-100 text-blue-800' :
                        article.category === 'ecommerce' ? 'bg-green-100 text-green-800' :
                        article.category === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                        article.category === 'mobile' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {article.category}
                      </span>
                      <h2 className="text-xl font-semibold text-gray-900">{article.title}</h2>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {article.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 ml-4">
                    Updated {new Date(article.lastUpdated).toLocaleDateString()}
                  </div>
                </div>

                <div className="prose prose-sm max-w-none">
                  {article.content.split('\n').map((line, index) => {
                    if (line.startsWith('## ')) {
                      return <h3 key={index} className="text-lg font-semibold text-gray-900 mt-6 mb-3">{line.replace('## ', '')}</h3>;
                    } else if (line.startsWith('### ')) {
                      return <h4 key={index} className="text-md font-semibold text-gray-900 mt-4 mb-2">{line.replace('### ', '')}</h4>;
                    } else if (line.trim() === '') {
                      return <br key={index} />;
                    } else if (line.startsWith('- ')) {
                      return <li key={index} className="ml-4">{line.replace('- ', '')}</li>;
                    } else if (line.match(/^\d+\./)) {
                      return <li key={index} className="ml-4 list-decimal">{line.replace(/^\d+\.\s*/, '')}</li>;
                    } else if (line.includes('**') && line.includes('**')) {
                      const parts = line.split('**');
                      return (
                        <p key={index}>
                          {parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}
                        </p>
                      );
                    } else {
                      return <p key={index} className="mb-2">{line}</p>;
                    }
                  })}
                </div>
              </div>
            </article>
          ))}

          {filteredArticles.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-lg">No articles found</p>
              <p className="text-sm">Try adjusting your search terms or category filter.</p>
            </div>
          )}
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Still Need Help?</h2>
          <p className="text-xl mb-6 text-blue-100">
            Our support team is here to help you succeed with Garlaws Platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Contact Support
            </Link>
            <Link
              href="/status"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Check System Status
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}