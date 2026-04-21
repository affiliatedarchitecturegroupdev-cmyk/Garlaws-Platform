'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GlassCard, GlassButton } from './GlassMorph';

interface NavItem {
  label: string;
  href: string;
  icon?: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: 'Services', href: '/services', icon: '⚡' },
  { label: 'Marketplace', href: '/shop', icon: '🛒' },
  { label: 'Payments', href: '/payment', icon: '💳' },
  { label: 'Enterprise', href: '/enterprise', icon: '🏢' },
  { label: 'Dashboard', href: '/dashboard', icon: '📊' }
];

export default function ProfessionalNavigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.5
    });

    // Observe sections
    const sections = document.querySelectorAll('[data-section]');
    sections.forEach(section => observer.observe(section));

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled ? 'py-2' : 'py-6'
      }`}
      style={{
        background: isScrolled ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: isScrolled ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
        boxShadow: isScrolled ? '0 8px 32px rgba(0, 0, 0, 0.1)' : 'none'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Enhanced Brand Identity */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-4 group">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 ${
                  isScrolled ? 'w-12 h-12' : ''
                }`}
                style={{
                  background: 'linear-gradient(135deg, #2d7d2d 0%, #45a29e 100%)',
                  boxShadow: '0 8px 32px rgba(45, 125, 45, 0.3)'
                }}
              >
                <span className="text-white font-bold text-2xl">G</span>
              </div>
              <div className={`transition-all duration-300 ${isScrolled ? 'scale-90' : ''}`}>
                <h1
                  className={`font-bold bg-clip-text text-transparent hover:scale-105 transition-transform duration-300 cursor-pointer ${
                    isScrolled ? 'text-2xl' : 'text-3xl'
                  }`}
                  style={{ background: 'linear-gradient(135deg, #2d7d2d 0%, #45a29e 100%)' }}
                >
                  Garlaws
                </h1>
                <p
                  className={`-mt-1 font-medium ${
                    isScrolled ? 'text-xs opacity-80' : 'text-sm'
                  }`}
                  style={{ color: '#2d7d2d' }}
                >
                  Enterprise Property Platform
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Menu */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`relative px-4 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 group ${
                  activeSection === item.href.slice(1) ? 'text-primary-700' : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                <span className="flex items-center space-x-2">
                  {item.icon && <span>{item.icon}</span>}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-1 text-xs bg-primary-500 text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <GlassButton variant="neutral" size="sm">
              Sign In
            </GlassButton>
            <GlassButton variant="primary" size="md">
              Get Started
            </GlassButton>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors"
              style={{ color: '#2d7d2d' }}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4">
            <GlassCard className="p-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon && <span>{item.icon}</span>}
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-1 text-xs bg-primary-500 text-white rounded-full ml-auto">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
              <div className="border-t border-white/20 pt-4 mt-4 space-y-2">
                <GlassButton variant="neutral" size="sm" className="w-full justify-center">
                  Sign In
                </GlassButton>
                <GlassButton variant="primary" size="md" className="w-full justify-center">
                  Get Started
                </GlassButton>
              </div>
            </GlassCard>
          </div>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white/20">
        <div
          className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
          style={{
            width: activeSection ? '100%' : '0%'
          }}
        />
      </div>
    </nav>
  );
}