'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  description?: string;
  category: 'core' | 'business' | 'enterprise' | 'support';
  requiresAuth?: boolean;
  badge?: string;
  children?: NavigationItem[];
}

interface UnifiedNavigationProps {
  tenantId?: string;
  userRole?: 'guest' | 'user' | 'admin' | 'enterprise';
}

export default function UnifiedNavigation({ tenantId = 'default', userRole = 'user' }: UnifiedNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  // Simulate navigation loading state
  const handleNavigation = (href: string) => {
    setIsLoading(true);
    setIsOpen(false);
    // Simulate loading delay
    setTimeout(() => setIsLoading(false), 500);
  };

  // Comprehensive navigation structure
  const navigationItems: NavigationItem[] = [
    // Core Platform
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      icon: '📊',
      description: 'Overview and analytics',
      category: 'core',
      requiresAuth: true
    },
    {
      id: 'services',
      label: 'Services',
      href: '/services',
      icon: '🛠️',
      description: 'Service management and booking',
      category: 'core',
      requiresAuth: true
    },

    // Business Modules
    {
      id: 'shop',
      label: 'E-commerce',
      href: '/shop',
      icon: '🛒',
      description: 'Online marketplace and shopping',
      category: 'business',
      badge: 'Flagship'
    },
    {
      id: 'financial',
      label: 'Financial',
      href: '/financial',
      icon: '💰',
      description: 'Financial management and accounting',
      category: 'business',
      requiresAuth: true
    },
    {
      id: 'supply-chain',
      label: 'Supply Chain',
      href: '/supply-chain',
      icon: '🚚',
      description: 'Supply chain and logistics',
      category: 'business',
      requiresAuth: true
    },
    {
      id: 'crm',
      label: 'CRM',
      href: '/crm',
      icon: '👥',
      description: 'Customer relationship management',
      category: 'business',
      requiresAuth: true
    },
    {
      id: 'projects',
      label: 'Projects',
      href: '/projects',
      icon: '📋',
      description: 'Project management and collaboration',
      category: 'business',
      requiresAuth: true
    },
    {
      id: 'logistics',
      label: 'Logistics',
      href: '/logistics',
      icon: '📦',
      description: 'Transportation and delivery',
      category: 'business',
      requiresAuth: true
    },

    // Enterprise Modules
    {
      id: 'erp',
      label: 'ERP',
      href: '/erp',
      icon: '🏢',
      description: 'Enterprise resource planning',
      category: 'enterprise',
      requiresAuth: true
    },
    {
      id: 'bi',
      label: 'Business Intelligence',
      href: '/bi',
      icon: '📈',
      description: 'Analytics and reporting',
      category: 'enterprise',
      requiresAuth: true
    },
    {
      id: 'ml',
      label: 'AI/ML',
      href: '/ml',
      icon: '🤖',
      description: 'Machine learning and AI',
      category: 'enterprise',
      requiresAuth: true
    },
    {
      id: 'security',
      label: 'Security',
      href: '/security',
      icon: '🔒',
      description: 'Security and compliance',
      category: 'enterprise',
      requiresAuth: true
    },
    {
      id: 'qa',
      label: 'Quality Assurance',
      href: '/qa',
      icon: '✅',
      description: 'Testing and quality control',
      category: 'enterprise',
      requiresAuth: true
    },
    {
      id: 'integrations',
      label: 'Integrations',
      href: '/integrations',
      icon: '🔗',
      description: 'Third-party integrations',
      category: 'enterprise',
      requiresAuth: true
    },

    // Mobile & PWA
    {
      id: 'mobile',
      label: 'Mobile',
      href: '/mobile',
      icon: '📱',
      description: 'Mobile and PWA features',
      category: 'core'
    },

    // Support & Help
    {
      id: 'help',
      label: 'Help & Documentation',
      href: '/help',
      icon: '📚',
      description: 'Documentation and guides',
      category: 'support'
    },
    {
      id: 'contact',
      label: 'Contact Us',
      href: '/contact',
      icon: '📞',
      description: 'Get in touch with our team',
      category: 'support'
    },
    {
      id: 'status',
      label: 'System Status',
      href: '/status',
      icon: '⚡',
      description: 'Platform status and uptime',
      category: 'support'
    },
    {
      id: 'careers',
      label: 'Careers',
      href: '/careers',
      icon: '💼',
      description: 'Join our team',
      category: 'support'
    }
  ];

  const categories = [
    { id: 'all', label: 'All', icon: '🌐' },
    { id: 'core', label: 'Core Platform', icon: '⭐' },
    { id: 'business', label: 'Business Modules', icon: '🏢' },
    { id: 'enterprise', label: 'Enterprise', icon: '🚀' },
    { id: 'support', label: 'Support', icon: '🆘' }
  ];

  const filteredItems = navigationItems.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = !searchTerm ||
      item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const hasAccess = !item.requiresAuth || userRole !== 'guest';

    return matchesCategory && matchesSearch && hasAccess;
  });

  const groupedItems = categories.reduce((acc, category) => {
    acc[category.id] = filteredItems.filter(item => category.id === 'all' || item.category === category.id);
    return acc;
  }, {} as Record<string, NavigationItem[]>);

  // Simulate notification count
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(Math.floor(Math.random() * 5));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Global Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-10 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-4 shadow-lg flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-700">Loading...</span>
          </div>
        </div>
      )}

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-lg shadow-lg"
        aria-label="Toggle navigation menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsOpen(false)} />
      )}

      {/* Navigation Panel */}
      <nav className={`
        fixed lg:static top-0 left-0 h-full lg:h-auto w-80 lg:w-auto bg-white lg:bg-transparent
        shadow-2xl lg:shadow-none z-40 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        overflow-y-auto lg:overflow-visible
      `}>

        {/* Header */}
        <div className="p-6 border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                Garlaws
              </span>
              {isLoading && (
                <div className="ml-2 w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Search navigation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex space-x-1 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === category.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.label}</span>
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                  {groupedItems[category.id]?.length || 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto">
          {categories.map((category) => {
            const items = groupedItems[category.id];
            if (items.length === 0 && activeCategory !== 'all') return null;

            return (
              <div key={category.id} className={activeCategory !== 'all' && activeCategory !== category.id ? 'hidden' : ''}>
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    {category.label}
                  </h3>
                </div>

                <div className="space-y-1">
                  {items.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => handleNavigation(item.href)}
                      className={`flex items-center space-x-3 px-4 py-3 transition-colors group ${
                        pathname === item.href
                          ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                      }`}
                    >
                      <span className="text-lg group-hover:scale-110 transition-transform">
                        {item.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium truncate">{item.label}</span>
                          {item.badge && (
                            <span className="px-2 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs rounded-full font-medium">
                              {item.badge}
                            </span>
                          )}
                          {item.id === 'shop' && (
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Flagship Service"></span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-500 truncate">{item.description}</p>
                        )}
                      </div>
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Platform Status: 🟢 Online</span>
            {notifications > 0 && (
              <span className="flex items-center space-x-1 text-blue-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.868 12.683A17.925 17.925 0 0112 21c7.962 0 12-1.21 12-2.683m-12 2.683a17.925 17.925 0 01-7.132-8.317M12 21V9m0 0a3 3 0 110-6 3 3 0 010 6z" />
                </svg>
                <span>{notifications}</span>
              </span>
            )}
          </div>
        </div>
      </nav>

      {/* Quick Access Bar */}
      <div className="fixed bottom-4 left-4 z-30 lg:hidden">
        <div className="flex space-x-2">
          <button
            onClick={() => setIsOpen(true)}
            className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
            aria-label="Open navigation"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <Link
            href="/shop"
            onClick={() => handleNavigation('/shop')}
            className="bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-colors"
            aria-label="Go to shop"
          >
            <span className="text-lg">🛒</span>
          </Link>

          <Link
            href="/dashboard"
            onClick={() => handleNavigation('/dashboard')}
            className="bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
            aria-label="Go to dashboard"
          >
            <span className="text-lg">📊</span>
          </Link>
        </div>
      </div>
    </>
  );
}