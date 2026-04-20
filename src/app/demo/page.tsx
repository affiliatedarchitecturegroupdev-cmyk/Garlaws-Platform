'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DemoPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const demoSteps = [
    {
      title: 'Welcome to Garlaws Platform',
      description: 'Experience our comprehensive enterprise ecosystem',
      content: (
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🚀</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Enterprise-Grade Solutions</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Discover how Garlaws Platform transforms business operations with cutting-edge technology
            and seamless integration across all enterprise functions.
          </p>
        </div>
      )
    },
    {
      title: 'Comprehensive Module Suite',
      description: '13 core business modules working together',
      content: (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '🛒', name: 'E-commerce', desc: 'Flagship marketplace' },
            { icon: '💰', name: 'Financial', desc: 'Accounting & finance' },
            { icon: '🏭', name: 'ERP', desc: 'Resource planning' },
            { icon: '📊', name: 'Analytics', desc: 'Business intelligence' },
            { icon: '🔒', name: 'Security', desc: 'Enterprise security' },
            { icon: '🤖', name: 'AI/ML', desc: 'Intelligent automation' },
            { icon: '📱', name: 'Mobile', desc: 'PWA experience' },
            { icon: '✅', name: 'QA', desc: 'Quality assurance' }
          ].map((module, index) => (
            <div key={index} className="text-center p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="text-2xl mb-2">{module.icon}</div>
              <div className="font-semibold text-gray-900">{module.name}</div>
              <div className="text-sm text-gray-600">{module.desc}</div>
            </div>
          ))}
        </div>
      )
    },
    {
      title: 'Advanced Features',
      description: 'Cutting-edge capabilities for modern enterprises',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-3xl mb-4">⚡</div>
            <h4 className="text-lg font-semibold mb-2">Real-time Processing</h4>
            <p className="text-gray-600">Live data synchronization and instant updates across all modules</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-3xl mb-4">🔗</div>
            <h4 className="text-lg font-semibold mb-2">Seamless Integration</h4>
            <p className="text-gray-600">Zero-friction data flow between systems and applications</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-3xl mb-4">📱</div>
            <h4 className="text-lg font-semibold mb-2">Mobile-First Design</h4>
            <p className="text-gray-600">Progressive Web App with offline capabilities and native features</p>
          </div>
        </div>
      )
    },
    {
      title: 'Security & Compliance',
      description: 'Enterprise-grade security and regulatory compliance',
      content: (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-8 rounded-lg">
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Bank-Level Security</h3>
            <p className="text-gray-700 max-w-2xl mx-auto">
              Your data is protected with enterprise-grade security measures, including
              end-to-end encryption, multi-factor authentication, and compliance with
              international standards.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['GDPR', 'HIPAA', 'PCI DSS', 'SOX'].map((standard, index) => (
              <div key={index} className="text-center">
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                  <span className="font-semibold text-gray-900">{standard}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: 'Ready to Get Started?',
      description: 'Join thousands of businesses using Garlaws Platform',
      content: (
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">✅</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Experience the Future of Enterprise Software</h3>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Garlaws Platform combines the power of modern technology with enterprise reliability
            to deliver solutions that scale with your business.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-indigo-800 transition-all shadow-lg hover:shadow-xl"
            >
              Start Free Trial
            </Link>
            <Link
              href="/contact"
              className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg hover:border-blue-500 hover:text-blue-600 transition-all"
            >
              Schedule Demo
            </Link>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < demoSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentStep(0); // Loop back to start
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      setCurrentStep(demoSteps.length - 1); // Go to last step
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      nextStep();
    }, 5000); // Change step every 5 seconds

    return () => clearInterval(interval);
  }, [isPlaying, currentStep]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Platform Demo</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the power and capabilities of Garlaws Platform through our interactive demonstration
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2">
            {demoSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => goToStep(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentStep ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Demo Content */}
        <div className="bg-white rounded-xl shadow-xl p-8 mb-8 min-h-[500px] flex items-center justify-center">
          {demoSteps[currentStep].content}
        </div>

        {/* Step Info */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {demoSteps[currentStep].title}
          </h2>
          <p className="text-gray-600">
            {demoSteps[currentStep].description}
          </p>
        </div>

        {/* Controls */}
        <div className="flex justify-center items-center space-x-6 mb-8">
          <button
            onClick={prevStep}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isPlaying ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
              }`}
            >
              {isPlaying ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6M9 14h6" />
                  </svg>
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h6M9 14h6" />
                  </svg>
                  <span>Auto Play</span>
                </>
              )}
            </button>

            <span className="text-sm text-gray-500">
              {currentStep + 1} of {demoSteps.length}
            </span>
          </div>

          <button
            onClick={nextStep}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span>{currentStep === demoSteps.length - 1 ? 'Restart' : 'Next'}</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Key Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="text-4xl mb-4">🏗️</div>
            <h3 className="text-lg font-semibold mb-2">Modular Architecture</h3>
            <p className="text-gray-600">Scalable, maintainable codebase with 55+ feature implementations</p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-lg font-semibold mb-2">Real-time Sync</h3>
            <p className="text-gray-600">Instant data synchronization across all platform modules</p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">Analytics-Driven</h3>
            <p className="text-gray-600">Comprehensive tracking and optimization for continuous improvement</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Business?</h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Join thousands of businesses already using Garlaws Platform to streamline operations,
            boost productivity, and drive growth.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
            >
              Start Your Free Trial
            </Link>
            <Link
              href="/contact"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-blue-600 transition-all"
            >
              Schedule a Demo
            </Link>
          </div>

          <p className="text-sm text-blue-200 mt-6">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}