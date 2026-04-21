'use client';

import Link from 'next/link';
import { GlassCard, GlassButton } from './GlassMorph';
import { designTokens } from '@/design-system/tokens';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const footerSections: FooterSection[] = [
  {
    title: 'Platform Modules',
    links: [
      { label: 'Financial Management', href: '/financial' },
      { label: 'Supply Chain', href: '/supply-chain' },
      { label: 'Business Intelligence', href: '/bi' },
      { label: 'CRM & Marketing', href: '/crm' },
      { label: 'Security & Compliance', href: '/security' }
    ]
  },
  {
    title: 'Services',
    links: [
      { label: 'Project Management', href: '/projects' },
      { label: 'AI & Automation', href: '/ml' },
      { label: 'API Integrations', href: '/integrations' },
      { label: 'E-commerce Marketplace', href: '/marketplace' },
      { label: 'Enterprise Solutions', href: '/enterprise' }
    ]
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
      { label: 'Support', href: '/support' },
      { label: 'Privacy Policy', href: '/privacy' }
    ]
  }
];

const socialLinks = [
  { name: 'LinkedIn', href: '#', icon: 'linkedin' },
  { name: 'Twitter', href: '#', icon: 'twitter' },
  { name: 'YouTube', href: '#', icon: 'youtube' },
  { name: 'GitHub', href: '#', icon: 'github' }
];

export default function ProfessionalFooter() {
  const currentYear = new Date().getFullYear();

  const getSocialIcon = (icon: string) => {
    switch (icon) {
      case 'linkedin':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        );
      case 'twitter':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
        );
      case 'youtube':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        );
      case 'github':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <footer className="relative py-20 overflow-hidden" style={{ backgroundColor: '#0a0a0a' }}>
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-10 left-10 w-64 h-64 rounded-full opacity-5 blur-3xl"
          style={{ background: designTokens.colors.gradients.primary }}
        />
        <div
          className="absolute bottom-10 right-10 w-80 h-80 rounded-full opacity-5 blur-3xl"
          style={{ background: designTokens.colors.gradients.secondary }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-4">
            <div className="flex items-center space-x-4 mb-6">
              <div
                className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-2xl"
                style={{ background: designTokens.colors.gradients.primary }}
              >
                <span className="text-white font-bold text-3xl">G</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-1">Garlaws</h2>
                <p className="text-white/60 text-sm">Enterprise Property Platform</p>
              </div>
            </div>

            <p className="text-white/70 text-base leading-relaxed mb-8">
              The most comprehensive property lifecycle management platform, combining AI-powered insights,
              enterprise-grade security, and seamless orchestration across all property operations.
            </p>

            {/* Newsletter Signup */}
            <div className="mb-8">
              <h4 className="text-white font-semibold mb-4">Stay Updated</h4>
              <div className="flex space-x-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                />
                <GlassButton variant="primary" size="md">
                  Subscribe
                </GlassButton>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all duration-300"
                    aria-label={social.name}
                  >
                    {getSocialIcon(social.icon)}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div key={section.title} className="lg:col-span-2">
              <h4 className="text-lg font-semibold mb-6 text-white">{section.title}</h4>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-white/60 hover:text-white transition-colors flex items-center group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white/40 mr-3 group-hover:bg-white transition-colors"></span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 pt-8 mt-12">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-wrap items-center space-x-6 text-sm text-white/60">
              <span>© {currentYear} Garlaws. All rights reserved.</span>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/cookies" className="hover:text-white transition-colors">
                Cookie Policy
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-white/60">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span>All systems operational</span>
              </div>
              <Link
                href="/status"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                System Status
              </Link>
            </div>
          </div>

          {/* Compliance Badges */}
          <div className="flex flex-wrap items-center justify-center md:justify-start space-x-6 mt-6">
            <div className="flex items-center space-x-2 text-sm text-white/60">
              <span>🔒</span>
              <span>SOC 2 Type II Certified</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-white/60">
              <span>🇿🇦</span>
              <span>POPIA Compliant</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-white/60">
              <span>🛡️</span>
              <span>GDPR Ready</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}