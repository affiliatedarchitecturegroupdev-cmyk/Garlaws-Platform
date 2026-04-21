'use client';

import React, { useState, useEffect } from 'react';
import { Globe, Languages, Users, Calendar, MapPin, Image, FileText, Settings, CheckCircle, AlertTriangle } from 'lucide-react';

export interface CulturalContent {
  id: string;
  title: string;
  content: string;
  originalLanguage: string;
  translations: Record<string, {
    content: string;
    status: 'draft' | 'translated' | 'reviewed' | 'published';
    lastModified: Date;
    translator?: string;
  }>;
  category: 'marketing' | 'legal' | 'product' | 'support';
  regions: string[];
  culturalNotes: string[];
  images: Array<{
    url: string;
    alt: string;
    cultural: boolean;
  }>;
  publishDate: Date;
  status: 'draft' | 'review' | 'published' | 'archived';
}

export interface CulturalRule {
  id: string;
  region: string;
  language: string;
  rules: {
    dateFormat: string;
    timeFormat: string;
    numberFormat: string;
    currencyFormat: string;
    colorPreferences: string[];
    tabooTopics: string[];
    culturalGreetings: string[];
    businessHours: string;
    holidays: string[];
  };
  lastUpdated: Date;
}

const CULTURAL_CONTENT: CulturalContent[] = [
  {
    id: 'welcome-message',
    title: 'Welcome to Garlaws Platform',
    content: 'Discover our comprehensive property management solutions designed for modern businesses.',
    originalLanguage: 'en',
    translations: {
      es: {
        content: 'Descubre nuestras soluciones integrales de gestión inmobiliaria diseñadas para empresas modernas.',
        status: 'published',
        lastModified: new Date('2024-04-20'),
        translator: 'Maria Garcia'
      },
      fr: {
        content: 'Découvrez nos solutions complètes de gestion immobilière conçues pour les entreprises modernes.',
        status: 'published',
        lastModified: new Date('2024-04-19'),
        translator: 'Pierre Dubois'
      },
      zh: {
        content: '探索我们为现代企业设计的全面物业管理解决方案。',
        status: 'reviewed',
        lastModified: new Date('2024-04-18'),
        translator: 'Li Wei'
      },
      ar: {
        content: 'اكتشف حلولنا الشاملة لإدارة الممتلكات المصممة للشركات الحديثة.',
        status: 'translated',
        lastModified: new Date('2024-04-17'),
        translator: 'Ahmed Hassan'
      }
    },
    category: 'marketing',
    regions: ['US', 'EU', 'CN', 'SA'],
    culturalNotes: [
      'Arabic version uses formal business language',
      'Chinese version emphasizes technological innovation',
      'Spanish version highlights reliability and trust'
    ],
    images: [
      {
        url: '/images/welcome-hero.jpg',
        alt: 'Modern office building',
        cultural: false
      }
    ],
    publishDate: new Date('2024-04-15'),
    status: 'published'
  },
  {
    id: 'terms-of-service',
    title: 'Terms of Service',
    content: 'These terms govern your use of our platform and services.',
    originalLanguage: 'en',
    translations: {
      de: {
        content: 'Diese Bedingungen regeln Ihre Nutzung unserer Plattform und Dienste.',
        status: 'published',
        lastModified: new Date('2024-04-19'),
        translator: 'Anna Schmidt'
      },
      pt: {
        content: 'Estes termos regem o seu uso da nossa plataforma e serviços.',
        status: 'reviewed',
        lastModified: new Date('2024-04-18'),
        translator: 'Carlos Silva'
      }
    },
    category: 'legal',
    regions: ['EU', 'BR'],
    culturalNotes: [
      'German version includes specific GDPR references',
      'Portuguese version adapted for Brazilian legal requirements'
    ],
    images: [],
    publishDate: new Date('2024-04-10'),
    status: 'published'
  }
];

const CULTURAL_RULES: CulturalRule[] = [
  {
    id: 'us-english',
    region: 'US',
    language: 'en',
    rules: {
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12-hour',
      numberFormat: '1,234.56',
      currencyFormat: '$1,234.56',
      colorPreferences: ['blue', 'green', 'red'],
      tabooTopics: ['politics', 'religion'],
      culturalGreetings: ['Hello', 'Hi there', 'Good morning'],
      businessHours: '9 AM - 5 PM EST',
      holidays: ['Christmas', 'Thanksgiving', 'Independence Day']
    },
    lastUpdated: new Date('2024-04-20')
  },
  {
    id: 'eu-german',
    region: 'EU',
    language: 'de',
    rules: {
      dateFormat: 'DD.MM.YYYY',
      timeFormat: '24-hour',
      numberFormat: '1.234,56',
      currencyFormat: '1.234,56 €',
      colorPreferences: ['blue', 'white', 'black'],
      tabooTopics: ['Nazi references', 'extreme politics'],
      culturalGreetings: ['Guten Tag', 'Hallo', 'Guten Morgen'],
      businessHours: '9:00 - 17:00 CET',
      holidays: ['Christmas', 'Easter', 'National holidays']
    },
    lastUpdated: new Date('2024-04-19')
  },
  {
    id: 'china-chinese',
    region: 'CN',
    language: 'zh',
    rules: {
      dateFormat: 'YYYY-MM-DD',
      timeFormat: '24-hour',
      numberFormat: '1,234.56',
      currencyFormat: '¥1,234.56',
      colorPreferences: ['red', 'gold', 'black'],
      tabooTopics: ['Taiwan independence', 'Tibet', '1989 events'],
      culturalGreetings: ['您好', '早上好', '下午好'],
      businessHours: '9:00 - 18:00 CST',
      holidays: ['Chinese New Year', 'National Day', 'Mid-Autumn Festival']
    },
    lastUpdated: new Date('2024-04-18')
  },
  {
    id: 'sa-arabic',
    region: 'SA',
    language: 'ar',
    rules: {
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '12-hour',
      numberFormat: '1,234.56',
      currencyFormat: 'ريال 1,234.56',
      colorPreferences: ['green', 'white', 'black'],
      tabooTopics: ['alcohol', ' pork', 'Western politics'],
      culturalGreetings: ['السلام عليكم', 'مرحبا', 'صباح الخير'],
      businessHours: '9:00 - 17:00 AST',
      holidays: ['Eid al-Fitr', 'Eid al-Adha', 'Ramadan']
    },
    lastUpdated: new Date('2024-04-17')
  }
];

export const CulturalAdaptation: React.FC = () => {
  const [content, setContent] = useState<CulturalContent[]>(CULTURAL_CONTENT);
  const [rules, setRules] = useState<CulturalRule[]>(CULTURAL_RULES);
  const [selectedTab, setSelectedTab] = useState<'content' | 'rules' | 'analytics'>('content');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'text-green-600 bg-green-100';
      case 'reviewed':
      case 'translated':
        return 'text-blue-600 bg-blue-100';
      case 'draft':
        return 'text-yellow-600 bg-yellow-100';
      case 'archived':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'draft':
      case 'translated':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredContent = content.filter(item => {
    const regionMatch = selectedRegion === 'all' || item.regions.includes(selectedRegion);
    const languageMatch = selectedLanguage === 'all' || item.translations[selectedLanguage];
    return regionMatch && languageMatch;
  });

  const translationStats = {
    total: content.length,
    translated: content.reduce((sum, item) => sum + Object.keys(item.translations).length, 0),
    published: content.reduce((sum, item) =>
      sum + Object.values(item.translations).filter(t => t.status === 'published').length, 0),
    pending: content.reduce((sum, item) =>
      sum + Object.values(item.translations).filter(t => t.status === 'draft' || t.status === 'translated').length, 0)
  };

  const regions = ['all', 'US', 'EU', 'CN', 'SA', 'BR'];
  const languages = ['all', 'en', 'es', 'fr', 'de', 'zh', 'ar', 'pt'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Globe className="w-8 h-8 text-purple-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Cultural Adaptation</h1>
              <p className="text-gray-600">Content translation and regional customization management</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {regions.map(region => (
                <option key={region} value={region}>
                  {region === 'all' ? 'All Regions' : region}
                </option>
              ))}
            </select>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {languages.map(language => (
                <option key={language} value={language}>
                  {language === 'all' ? 'All Languages' : language.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Content</p>
              <p className="text-2xl font-bold text-gray-900">{translationStats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Published Translations</p>
              <p className="text-2xl font-bold text-green-600">{translationStats.published}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Translations</p>
              <p className="text-2xl font-bold text-yellow-600">{translationStats.pending}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Supported Languages</p>
              <p className="text-2xl font-bold text-gray-900">{languages.length - 1}</p>
            </div>
            <Languages className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setSelectedTab('content')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedTab === 'content'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Content Translation
            </button>
            <button
              onClick={() => setSelectedTab('rules')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedTab === 'rules'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Cultural Rules
            </button>
            <button
              onClick={() => setSelectedTab('analytics')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                selectedTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>

        <div className="p-6">
          {selectedTab === 'content' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Content Translation Management</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Add Content
                </button>
              </div>

              {filteredContent.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(item.status)}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{item.title}</h4>
                        <p className="text-sm text-gray-600">Category: {item.category} • Regions: {item.regions.join(', ')}</p>
                      </div>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-700">{item.content}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(item.translations).map(([lang, translation]) => (
                      <div key={lang} className="bg-white rounded-md p-4 border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900 uppercase">{lang}</span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(translation.status)}`}>
                            {translation.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{translation.content}</p>
                        <div className="text-xs text-gray-500">
                          <p>By: {translation.translator}</p>
                          <p>Modified: {translation.lastModified.toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {item.culturalNotes.length > 0 && (
                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Cultural Notes:</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {item.culturalNotes.map((note, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span>•</span>
                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {selectedTab === 'rules' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Cultural Rules & Preferences</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Add Rule
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {rules.map((rule) => (
                  <div key={rule.id} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{rule.region}</h4>
                          <p className="text-sm text-gray-600">{rule.language.toUpperCase()}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        Updated: {rule.lastUpdated.toLocaleDateString()}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Date Format:</span>
                          <p className="text-gray-600">{rule.rules.dateFormat}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Time Format:</span>
                          <p className="text-gray-600">{rule.rules.timeFormat}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Number Format:</span>
                          <p className="text-gray-600">{rule.rules.numberFormat}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Currency Format:</span>
                          <p className="text-gray-600">{rule.rules.currencyFormat}</p>
                        </div>
                      </div>

                      <div>
                        <span className="font-medium text-gray-700 text-sm">Preferred Colors:</span>
                        <div className="flex space-x-2 mt-1">
                          {rule.rules.colorPreferences.map((color, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                              {color}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="font-medium text-gray-700 text-sm">Cultural Greetings:</span>
                        <p className="text-gray-600 text-sm">{rule.rules.culturalGreetings.join(', ')}</p>
                      </div>

                      <div>
                        <span className="font-medium text-gray-700 text-sm">Business Hours:</span>
                        <p className="text-gray-600 text-sm">{rule.rules.businessHours}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Translation Analytics</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Languages className="w-8 h-8 text-blue-600" />
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Translation Coverage</h4>
                      <p className="text-sm text-gray-600">Content translated by language</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {['es', 'fr', 'de', 'zh', 'ar', 'pt'].map(lang => (
                      <div key={lang} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 uppercase">{lang}</span>
                        <span className="text-sm font-medium text-gray-900">
                          {Math.floor(Math.random() * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Users className="w-8 h-8 text-green-600" />
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Regional Usage</h4>
                      <p className="text-sm text-gray-600">Content access by region</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {['US', 'EU', 'CN', 'SA', 'BR'].map(region => (
                      <div key={region} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{region}</span>
                        <span className="text-sm font-medium text-gray-900">
                          {Math.floor(Math.random() * 10000)} views
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Calendar className="w-8 h-8 text-purple-600" />
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Content Updates</h4>
                      <p className="text-sm text-gray-600">Monthly translation updates</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">This Month</span>
                      <span className="text-sm font-medium text-gray-900">24 updates</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Pending Reviews</span>
                      <span className="text-sm font-medium text-yellow-600">8 items</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Published</span>
                      <span className="text-sm font-medium text-green-600">16 items</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CulturalAdaptation;