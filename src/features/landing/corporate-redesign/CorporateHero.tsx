'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const PRIMARY = '#1a5d1a';
const PRIMARY_LIGHT = '#2d8a2d';
const PRIMARY_DARK = '#0f3d0f';
const GOLD = '#c9a227';
const SLATE = '#3d7a7a';
const NEAR_BLACK = '#0a0e0a';
const DARK_GREEN = '#0d1f0d';
const OFF_WHITE = '#f8faf5';

interface Stat {
  value: string;
  label: string;
}

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface Module {
  id: string;
  title: string;
  icon: string;
  href: string;
  color: string;
}

const stats: Stat[] = [
  { value: '386+', label: 'Source Files' },
  { value: '125K+', label: 'Lines of Code' },
  { value: '130+', label: 'Database Tables' },
  { value: '56+', label: 'Development Phases' },
];

const features: Feature[] = [
  { icon: '⚡', title: 'AI-Powered Automation', description: 'Intelligent workflows that adapt to your business processes' },
  { icon: '🔒', title: 'Enterprise Security', description: 'Bank-grade encryption with SOC 2 Type II compliance' },
  { icon: '📊', title: 'Real-Time Analytics', description: 'Live dashboards with predictive insights' },
  { icon: '🌍', title: 'Global Scalability', description: 'Multi-tenant architecture for enterprise deployments' },
];

const modules: Module[] = [
  { id: 'financial', title: 'Financial', icon: '💰', href: '/financial', color: PRIMARY },
  { id: 'supply', title: 'Supply Chain', icon: '📦', href: '/supply-chain', color: GOLD },
  { id: 'analytics', title: 'BI & Analytics', icon: '📈', href: '/bi', color: SLATE },
  { id: 'crm', title: 'CRM', icon: '👥', href: '/crm', color: PRIMARY },
  { id: 'projects', title: 'Projects', icon: '📋', href: '/projects', color: GOLD },
  { id: 'ai', title: 'AI & ML', icon: '🤖', href: '/ml', color: SLATE },
  { id: 'security', title: 'Security', icon: '🔐', href: '/security', color: PRIMARY },
  { id: 'integrations', title: 'Integrations', icon: '🔗', href: '/integrations', color: GOLD },
];

export default function CorporateHero() {
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % features.length);
    }, 3000);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = [];
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.3 + 0.1,
      });
    }
    
    let animationId: number;
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(45, 125, 45, ${p.alpha})`;
        ctx.fill();
        
        particles.forEach((p2, j) => {
          if (i === j) return;
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(45, 125, 45, ${0.1 * (1 - dist / 150)})`;
            ctx.stroke();
          }
        });
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => cancelAnimationFrame(animationId);
  }, []);

  if (!mounted) return null;

  return (
    <section className="relative min-h-screen overflow-hidden" style={{ backgroundColor: NEAR_BLACK }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-40"
        style={{ pointerEvents: 'none' }}
      />

      <div
        className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px]"
        style={{ background: PRIMARY, opacity: 0.15, transform: `translateY(${scrollY * 0.3}px)` }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[100px]"
        style={{ background: GOLD, opacity: 0.1, transform: `translateY(${-scrollY * 0.2}px)` }}
      />

      <nav className="relative z-10 px-8 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-4 group">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105"
            style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SLATE} 100%)` }}
          >
            <span className="text-white font-bold text-xl">G</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Garlaws</h1>
            <p className="text-xs text-white/50 -mt-1">Enterprise Platform</p>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          <Link href="/services" className="text-sm text-white/70 hover:text-white transition-colors">Services</Link>
          <Link href="/financial" className="text-sm text-white/70 hover:text-white transition-colors">Financial</Link>
          <Link href="/bi" className="text-sm text-white/70 hover:text-white transition-colors">Analytics</Link>
          <Link href="/enterprise" className="text-sm text-white/70 hover:text-white transition-colors">Enterprise</Link>
          <Link href="/dashboard" className="text-sm text-white/70 hover:text-white transition-colors">Dashboard</Link>
        </div>

        <div className="flex items-center gap-4">
          <button
            className="hidden md:block px-5 py-2.5 text-sm text-white/80 hover:text-white transition-colors border border-white/20 rounded-lg hover:border-white/40"
          >
            Sign In
          </button>
          <button
            className="px-5 py-2.5 text-sm text-white font-medium rounded-lg transition-all hover:scale-105 shadow-lg"
            style={{ background: PRIMARY }}
          >
            Get Started
          </button>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32">
        <div className="max-w-4xl">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm text-white/90 mb-8"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#22c55e' }} />
            Enterprise-Grade Property Management
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.1] mb-8">
            <span style={{ color: OFF_WHITE }}>Property</span>
            <br />
            <span style={{ background: `linear-gradient(135deg, ${PRIMARY_LIGHT} 0%, ${SLATE} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Lifecycle
            </span>
            <br />
            <span style={{ color: GOLD }}>Platform</span>
          </h1>

          <p className="text-xl text-white/60 max-w-2xl leading-relaxed mb-12">
            Transform your property operations with AI-powered automation, enterprise security, and real-time analytics. 
            Manage every aspect of your property lifecycle with unprecedented precision.
          </p>

          <div className="flex flex-wrap gap-4 mb-20">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white rounded-xl transition-all hover:scale-105 shadow-xl"
              style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_DARK} 100%)` }}
            >
              Start Free Trial
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold rounded-xl transition-all hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Watch Demo
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-white/50">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="relative z-10 -mt-32 pt-32"
        style={{ background: `linear-gradient(to top, ${DARK_GREEN} 0%, transparent 100%)` }}
      >
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Enterprise Platform Modules
            </h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              Eight interconnected modules working in perfect harmony
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {modules.map((module) => (
              <Link
                key={module.id}
                href={module.href}
                className="group p-6 rounded-2xl transition-all duration-300 hover:scale-105"
                style={{ 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-2xl"
                  style={{ background: `${module.color}20` }}
                >
                  {module.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-1 group-hover:opacity-80">{module.title}</h3>
                <p className="text-xs text-white/40">View Details →</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 py-32" style={{ backgroundColor: DARK_GREEN }}>
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Built for <span style={{ color: GOLD }}>Enterprise</span>
              </h2>
              <p className="text-lg text-white/50 mb-8 leading-relaxed">
                From AI-powered insights to seamless orchestration, manage every aspect of your property lifecycle 
                with unparalleled precision and security.
              </p>
              <div className="space-y-6">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-xl transition-all duration-300"
                    style={{ 
                      background: activeFeature === index ? 'rgba(255,255,255,0.05)' : 'transparent',
                      border: `1px solid ${activeFeature === index ? 'rgba(255,255,255,0.1)' : 'transparent'}`,
                    }}
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ background: `${PRIMARY}30` }}>
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-1">{feature.title}</h4>
                      <p className="text-sm text-white/50">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="relative rounded-3xl p-8 overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px]" style={{ background: PRIMARY, opacity: 0.2 }} />
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: '#eab308' }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: '#22c55e' }} />
                </div>
                <pre className="text-sm font-mono text-white/70 overflow-x-auto">
                  <code>{`// Garlaws API Example
const platform = await garlaws.init({
  apiKey: process.env.API_KEY,
  region: 'us-east-1',
});

const property = await platform.properties.create({
  address: "123 Main St",
  type: "residential",
  features: ["pool", "garage"],
});

const analytics = await platform.analytics.predict({
  propertyId: property.id,
  metrics: ["roi", "occupancy"],
});`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="relative z-10 py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-6 text-sm text-white/50">
              <span>© 2024 Garlaws</span>
              <Link href="/privacy" className="hover:text-white/70">Privacy</Link>
              <Link href="/terms" className="hover:text-white/70">Terms</Link>
            </div>
            <div className="flex items-center gap-4 text-sm text-white/50">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: '#22c55e' }} />
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </footer>
    </section>
  );
}