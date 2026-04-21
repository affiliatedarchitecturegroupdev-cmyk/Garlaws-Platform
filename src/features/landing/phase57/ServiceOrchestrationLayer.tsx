'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GlassCard } from './GlassMorph';
import { designTokens } from '@/design-system/tokens';

interface ModuleCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
  features: string[];
  status: 'active' | 'coming-soon' | 'beta';
}

const moduleCards: ModuleCard[] = [
  {
    id: 'financial',
    title: 'Financial Management',
    description: 'Complete financial reconciliation and accounting automation',
    icon: '💰',
    href: '/financial',
    color: designTokens.colors.primary[500],
    features: ['Auto Reconciliation', 'Budget Tracking', 'Tax Compliance'],
    status: 'active'
  },
  {
    id: 'supply-chain',
    title: 'Supply Chain',
    description: 'End-to-end inventory and procurement management',
    icon: '📦',
    href: '/supply-chain',
    color: designTokens.colors.secondary[500],
    features: ['Inventory Tracking', 'Supplier Management', 'Procurement'],
    status: 'active'
  },
  {
    id: 'analytics',
    title: 'Business Intelligence',
    description: 'Advanced analytics and reporting platform',
    icon: '📊',
    href: '/bi',
    color: designTokens.colors.accent[500],
    features: ['Interactive Dashboards', 'Predictive Analytics', 'Custom Reports'],
    status: 'active'
  },
  {
    id: 'crm',
    title: 'CRM & Marketing',
    description: 'Customer relationship and marketing automation',
    icon: '👥',
    href: '/crm',
    color: designTokens.colors.primary[500],
    features: ['Lifecycle Management', 'Campaign Automation', 'Email Integration'],
    status: 'active'
  },
  {
    id: 'security',
    title: 'Security & Compliance',
    description: 'Enterprise-grade security and compliance framework',
    icon: '🔒',
    href: '/security',
    color: designTokens.colors.secondary[500],
    features: ['MFA', 'Audit Logging', 'Threat Detection'],
    status: 'active'
  },
  {
    id: 'projects',
    title: 'Project Management',
    description: 'Construction and renovation project coordination',
    icon: '📋',
    href: '/projects',
    color: designTokens.colors.accent[500],
    features: ['Kanban Board', 'Gantt Charts', 'Resource Allocation'],
    status: 'active'
  },
  {
    id: 'ai',
    title: 'AI & Automation',
    description: 'Machine learning and workflow automation',
    icon: '🤖',
    href: '/ml',
    color: designTokens.colors.primary[500],
    features: ['Predictive Maintenance', 'Chat Assistant', 'Auto Workflows'],
    status: 'active'
  },
  {
    id: 'integrations',
    title: 'API Integrations',
    description: 'Third-party integrations and data synchronization',
    icon: '🔗',
    href: '/integrations',
    color: designTokens.colors.secondary[500],
    features: ['Webhooks', 'API Connectors', 'Data Sync'],
    status: 'active'
  }
];

export default function ServiceOrchestrationLayer() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('orchestration');
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="orchestration"
      className="py-32 relative"
      style={{ backgroundColor: designTokens.colors.primary[50] }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: designTokens.colors.secondary[300] }}
        />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: designTokens.colors.accent[300] }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className={`text-center mb-20 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h2
            className="text-5xl font-bold mb-6"
            style={{ color: designTokens.colors.primary[800] }}
          >
            Enterprise Platform Architecture
          </h2>
          <p
            className="text-xl max-w-4xl mx-auto leading-relaxed"
            style={{ color: designTokens.colors.primary[600] }}
          >
            Eight interconnected modules working in perfect harmony to deliver comprehensive property lifecycle management
            with enterprise-grade security, scalability, and intelligence.
          </p>
        </div>

        {/* Interactive Platform Architecture Visualization */}
        <div className={`relative mb-20 transition-all duration-1000 delay-200 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {moduleCards.map((module, index) => (
              <div
                key={module.id}
                className={`group transition-all duration-1000 delay-${300 + index * 100} ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                onMouseEnter={() => setHoveredCard(module.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <Link href={module.href}>
                  <GlassCard
                    className="h-full p-8 cursor-pointer transition-all duration-300 hover:scale-105"
                    blur={20}
                    opacity={0.1}
                    borderOpacity={0.2}
                    interactive
                  >
                    <div className="text-center">
                      {/* Icon */}
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300"
                        style={{ backgroundColor: `${module.color}20` }}
                      >
                        <span className="text-3xl">{module.icon}</span>
                      </div>

                      {/* Title */}
                      <h3
                        className="text-xl font-bold mb-3 group-hover:scale-105 transition-transform"
                        style={{ color: module.color }}
                      >
                        {module.title}
                      </h3>

                      {/* Description */}
                      <p
                        className="text-sm leading-relaxed mb-4 group-hover:scale-105 transition-transform"
                        style={{ color: designTokens.colors.primary[600] }}
                      >
                        {module.description}
                      </p>

                      {/* Features */}
                      <div className="space-y-2 mb-4">
                        {module.features.slice(0, 2).map((feature, featureIndex) => (
                          <div
                            key={featureIndex}
                            className={`flex items-center justify-center space-x-2 text-xs transition-all duration-300 ${
                              hoveredCard === module.id ? 'opacity-100 translate-y-0' : 'opacity-70 translate-y-1'
                            }`}
                            style={{ color: designTokens.colors.primary[500] }}
                          >
                            <div
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: module.color }}
                            />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* Status Badge */}
                      <div className="flex justify-center">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-300 ${
                            module.status === 'active' ? 'bg-green-100 text-green-800' :
                            module.status === 'beta' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {module.status === 'active' ? '✓ Active' :
                           module.status === 'beta' ? 'β Beta' :
                           'Coming Soon'}
                        </span>
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              </div>
            ))}
          </div>

          {/* Central Orchestration Hub */}
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 delay-800 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}>
            <div
              className="w-24 h-24 rounded-full shadow-2xl flex items-center justify-center animate-pulse"
              style={{
                background: designTokens.colors.gradients.primary,
                boxShadow: `0 0 50px ${designTokens.colors.primaryAlpha[30]}`
              }}
            >
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div
              className="text-center mt-4 text-sm font-semibold"
              style={{ color: designTokens.colors.primary[700] }}
            >
              Orchestration Layer
            </div>
          </div>
        </div>

        {/* Professional Trust Indicators */}
        <div className={`transition-all duration-1000 delay-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <GlassCard
            className="max-w-4xl mx-auto p-12 text-center"
            blur={20}
            opacity={0.1}
            borderOpacity={0.2}
          >
            <h3
              className="text-3xl font-bold mb-8"
              style={{ color: designTokens.colors.primary[800] }}
            >
              Enterprise-Grade Assurance
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: '🔒',
                  title: 'Bank-Level Security',
                  description: 'Enterprise-grade encryption with compliance certifications',
                  color: designTokens.colors.primary
                },
                {
                  icon: '🧠',
                  title: 'AI-Powered Intelligence',
                  description: 'Advanced machine learning for predictive analytics and automation',
                  color: designTokens.colors.secondary
                },
                {
                  icon: '🌍',
                  title: 'Global Scalability',
                  description: 'Multi-tenant architecture supporting enterprise deployments worldwide',
                  color: designTokens.colors.accent
                }
              ].map((item, index) => (
                <div
                  key={item.title}
                  className={`flex flex-col items-center transition-all duration-1000 delay-${1200 + index * 200} ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${item.color[400]}, ${item.color[600]})` }}
                  >
                    <span className="text-3xl">{item.icon}</span>
                  </div>
                  <h4
                    className="text-xl font-semibold mb-2"
                    style={{ color: item.color[800] }}
                  >
                    {item.title}
                  </h4>
                  <p style={{ color: designTokens.colors.primary[600] }}>
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}