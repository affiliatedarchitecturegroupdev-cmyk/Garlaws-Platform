'use client';

import { useState } from 'react';

interface ContactForm {
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
    priority: 'medium'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        company: '',
        subject: '',
        message: '',
        priority: 'medium'
      });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const contactMethods = [
    {
      icon: '📧',
      title: 'Email Support',
      description: 'Send us an email for detailed inquiries',
      contact: 'support@garlaws.com',
      availability: '24/7 Response within 2 hours'
    },
    {
      icon: '💬',
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      contact: 'Available 9 AM - 6 PM EST',
      availability: 'Mon-Fri, Instant Response'
    },
    {
      icon: '📞',
      title: 'Phone Support',
      description: 'Speak directly with our experts',
      contact: '+1 (555) 123-GARLAWS',
      availability: 'Mon-Fri, 9 AM - 6 PM EST'
    },
    {
      icon: '📚',
      title: 'Documentation',
      description: 'Browse our comprehensive guides',
      contact: '/help',
      availability: 'Always Available'
    }
  ];

  const officeLocations = [
    {
      city: 'Cape Town',
      country: 'South Africa',
      address: '123 Business District, Cape Town 8001',
      phone: '+27 21 123 4567',
      email: 'capetown@garlaws.com'
    },
    {
      city: 'Johannesburg',
      country: 'South Africa',
      address: '456 Corporate Park, Sandton 2196',
      phone: '+27 11 987 6543',
      email: 'johannesburg@garlaws.com'
    },
    {
      city: 'London',
      country: 'United Kingdom',
      address: '789 Tech Hub, London EC2A 1PQ',
      phone: '+44 20 7123 4567',
      email: 'london@garlaws.com'
    },
    {
      city: 'New York',
      country: 'USA',
      address: '321 Innovation Drive, New York, NY 10001',
      phone: '+1 555 123 4567',
      email: 'newyork@garlaws.com'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get in touch with our team. We're here to help you succeed with Garlaws Platform.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">

          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>

            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Message Sent!</h3>
                <p className="text-gray-600">
                  Thank you for contacting us. We'll get back to you within 2 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="your.email@company.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your company name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Brief description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="low">Low - General inquiry</option>
                      <option value="medium">Medium - Feature request</option>
                      <option value="high">High - Bug report</option>
                      <option value="urgent">Urgent - System down</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe your inquiry in detail..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 px-6 rounded-md font-semibold hover:from-blue-700 hover:to-indigo-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>

          {/* Contact Methods */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Methods</h2>
              <div className="grid grid-cols-1 gap-4">
                {contactMethods.map((method, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-4">
                      <div className="text-3xl">{method.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{method.title}</h3>
                        <p className="text-gray-600 mb-2">{method.description}</p>
                        <div className="text-sm text-gray-900 font-medium">{method.contact}</div>
                        <div className="text-xs text-gray-500 mt-1">{method.availability}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
              <div className="grid grid-cols-2 gap-4">
                <a href="/help" className="text-blue-600 hover:text-blue-700 font-medium">Help Center</a>
                <a href="/status" className="text-blue-600 hover:text-blue-700 font-medium">System Status</a>
                <a href="/careers" className="text-blue-600 hover:text-blue-700 font-medium">Careers</a>
                <a href="/refer" className="text-blue-600 hover:text-blue-700 font-medium">Referral Program</a>
              </div>
            </div>
          </div>
        </div>

        {/* Office Locations */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Our Offices</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {officeLocations.map((office, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{office.city}</h3>
                <p className="text-sm text-gray-600 mb-2">{office.country}</p>
                <p className="text-xs text-gray-500 mb-2">{office.address}</p>
                <p className="text-xs text-gray-500">{office.phone}</p>
                <p className="text-xs text-gray-500">{office.email}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-8 text-white">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-blue-100">
              Quick answers to common questions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">How quickly do you respond to support requests?</h3>
              <p className="text-blue-100">We respond to all support requests within 2 hours during business hours (9 AM - 6 PM EST, Mon-Fri).</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Do you offer phone support?</h3>
              <p className="text-blue-100">Yes, phone support is available for enterprise customers and urgent technical issues.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Can I schedule a demo?</h3>
              <p className="text-blue-100">Absolutely! Contact us to schedule a personalized demo with our solutions architects.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Do you offer training?</h3>
              <p className="text-blue-100">Yes, we provide comprehensive training programs and documentation for all our products.</p>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-blue-100 mb-4">Can't find what you're looking for?</p>
            <a href="/help" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Visit Help Center
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}