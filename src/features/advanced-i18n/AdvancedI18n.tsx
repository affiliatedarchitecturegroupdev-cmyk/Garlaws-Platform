'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';

interface TranslationKey {
  key: string;
  defaultValue: string;
  context?: string;
  variables?: string[];
}

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
  region: string;
  currency: string;
  dateFormat: string;
  numberFormat: {
    decimalSeparator: string;
    thousandsSeparator: string;
  };
}

interface TranslationBundle {
  [key: string]: {
    value: string;
    context?: string;
    lastUpdated: Date;
    translator?: string;
  };
}

interface CulturalContext {
  region: string;
  formality: 'formal' | 'informal' | 'neutral';
  timeOrientation: 'past' | 'present' | 'future' | 'balanced';
  communicationStyle: 'direct' | 'indirect' | 'high-context' | 'low-context';
  powerDistance: 'low' | 'medium' | 'high';
  uncertaintyAvoidance: 'low' | 'medium' | 'high';
  individualism: 'individualistic' | 'collectivistic';
}

interface I18nContextType {
  currentLanguage: Language;
  availableLanguages: Language[];
  translations: Record<string, TranslationBundle>;
  culturalContext: CulturalContext;
  setLanguage: (language: Language) => void;
  t: (key: string, variables?: Record<string, any>) => string;
  formatNumber: (value: number) => string;
  formatCurrency: (value: number, currency?: string) => string;
  formatDate: (date: Date) => string;
  getCulturalAdaptation: (key: string) => any;
}

const I18nContext = createContext<I18nContextType | null>(null);

const SUPPORTED_LANGUAGES: Language[] = [
  {
    code: 'en-US',
    name: 'English (US)',
    nativeName: 'English',
    flag: '🇺🇸',
    rtl: false,
    region: 'North America',
    currency: 'USD',
    dateFormat: 'MM/dd/yyyy',
    numberFormat: { decimalSeparator: '.', thousandsSeparator: ',' }
  },
  {
    code: 'en-GB',
    name: 'English (UK)',
    nativeName: 'English',
    flag: '🇬🇧',
    rtl: false,
    region: 'Europe',
    currency: 'GBP',
    dateFormat: 'dd/MM/yyyy',
    numberFormat: { decimalSeparator: '.', thousandsSeparator: ',' }
  },
  {
    code: 'es-ES',
    name: 'Spanish (Spain)',
    nativeName: 'Español',
    flag: '🇪🇸',
    rtl: false,
    region: 'Europe',
    currency: 'EUR',
    dateFormat: 'dd/mm/yyyy',
    numberFormat: { decimalSeparator: ',', thousandsSeparator: '.' }
  },
  {
    code: 'es-MX',
    name: 'Spanish (Mexico)',
    nativeName: 'Español',
    flag: '🇲🇽',
    rtl: false,
    region: 'North America',
    currency: 'MXN',
    dateFormat: 'dd/mm/yyyy',
    numberFormat: { decimalSeparator: '.', thousandsSeparator: ',' }
  },
  {
    code: 'fr-FR',
    name: 'French (France)',
    nativeName: 'Français',
    flag: '🇫🇷',
    rtl: false,
    region: 'Europe',
    currency: 'EUR',
    dateFormat: 'dd/mm/yyyy',
    numberFormat: { decimalSeparator: ',', thousandsSeparator: ' ' }
  },
  {
    code: 'de-DE',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    rtl: false,
    region: 'Europe',
    currency: 'EUR',
    dateFormat: 'dd.mm.yyyy',
    numberFormat: { decimalSeparator: ',', thousandsSeparator: '.' }
  },
  {
    code: 'ja-JP',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    rtl: false,
    region: 'Asia',
    currency: 'JPY',
    dateFormat: 'yyyy/mm/dd',
    numberFormat: { decimalSeparator: '.', thousandsSeparator: ',' }
  },
  {
    code: 'zh-CN',
    name: 'Chinese (Simplified)',
    nativeName: '中文',
    flag: '🇨🇳',
    rtl: false,
    region: 'Asia',
    currency: 'CNY',
    dateFormat: 'yyyy-mm-dd',
    numberFormat: { decimalSeparator: '.', thousandsSeparator: ',' }
  },
  {
    code: 'ar-SA',
    name: 'Arabic (Saudi Arabia)',
    nativeName: 'العربية',
    flag: '🇸🇦',
    rtl: true,
    region: 'Middle East',
    currency: 'SAR',
    dateFormat: 'dd/mm/yyyy',
    numberFormat: { decimalSeparator: '.', thousandsSeparator: ',' }
  },
  {
    code: 'pt-BR',
    name: 'Portuguese (Brazil)',
    nativeName: 'Português',
    flag: '🇧🇷',
    rtl: false,
    region: 'South America',
    currency: 'BRL',
    dateFormat: 'dd/mm/yyyy',
    numberFormat: { decimalSeparator: ',', thousandsSeparator: '.' }
  },
  {
    code: 'hi-IN',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    rtl: false,
    region: 'Asia',
    currency: 'INR',
    dateFormat: 'dd/mm/yyyy',
    numberFormat: { decimalSeparator: '.', thousandsSeparator: ',' }
  }
];

const CULTURAL_CONTEXTS: Record<string, CulturalContext> = {
  'en-US': {
    region: 'North America',
    formality: 'neutral',
    timeOrientation: 'balanced',
    communicationStyle: 'direct',
    powerDistance: 'low',
    uncertaintyAvoidance: 'medium',
    individualism: 'individualistic'
  },
  'ja-JP': {
    region: 'Asia',
    formality: 'formal',
    timeOrientation: 'balanced',
    communicationStyle: 'indirect',
    powerDistance: 'high',
    uncertaintyAvoidance: 'high',
    individualism: 'collectivistic'
  },
  'ar-SA': {
    region: 'Middle East',
    formality: 'formal',
    timeOrientation: 'balanced',
    communicationStyle: 'high-context',
    powerDistance: 'high',
    uncertaintyAvoidance: 'high',
    individualism: 'collectivistic'
  },
  'de-DE': {
    region: 'Europe',
    formality: 'formal',
    timeOrientation: 'balanced',
    communicationStyle: 'direct',
    powerDistance: 'medium',
    uncertaintyAvoidance: 'high',
    individualism: 'individualistic'
  }
};

// Mock translation data - in real implementation, this would come from external files
const MOCK_TRANSLATIONS: Record<string, TranslationBundle> = {
  'en-US': {
    'welcome.message': { value: 'Welcome to Garlaws Platform', lastUpdated: new Date() },
    'nav.dashboard': { value: 'Dashboard', lastUpdated: new Date() },
    'nav.financial': { value: 'Financial', lastUpdated: new Date() },
    'nav.settings': { value: 'Settings', lastUpdated: new Date() },
    'button.save': { value: 'Save', lastUpdated: new Date() },
    'button.cancel': { value: 'Cancel', lastUpdated: new Date() },
    'validation.required': { value: 'This field is required', lastUpdated: new Date() },
    'error.network': { value: 'Network error occurred', lastUpdated: new Date() }
  },
  'es-ES': {
    'welcome.message': { value: 'Bienvenido a la Plataforma Garlaws', lastUpdated: new Date() },
    'nav.dashboard': { value: 'Panel de Control', lastUpdated: new Date() },
    'nav.financial': { value: 'Financiero', lastUpdated: new Date() },
    'nav.settings': { value: 'Configuración', lastUpdated: new Date() },
    'button.save': { value: 'Guardar', lastUpdated: new Date() },
    'button.cancel': { value: 'Cancelar', lastUpdated: new Date() },
    'validation.required': { value: 'Este campo es obligatorio', lastUpdated: new Date() },
    'error.network': { value: 'Ocurrió un error de red', lastUpdated: new Date() }
  },
  'fr-FR': {
    'welcome.message': { value: 'Bienvenue sur la Plateforme Garlaws', lastUpdated: new Date() },
    'nav.dashboard': { value: 'Tableau de Bord', lastUpdated: new Date() },
    'nav.financial': { value: 'Financier', lastUpdated: new Date() },
    'nav.settings': { value: 'Paramètres', lastUpdated: new Date() },
    'button.save': { value: 'Enregistrer', lastUpdated: new Date() },
    'button.cancel': { value: 'Annuler', lastUpdated: new Date() },
    'validation.required': { value: 'Ce champ est obligatoire', lastUpdated: new Date() },
    'error.network': { value: 'Une erreur réseau s\'est produite', lastUpdated: new Date() }
  },
  'de-DE': {
    'welcome.message': { value: 'Willkommen auf der Garlaws-Plattform', lastUpdated: new Date() },
    'nav.dashboard': { value: 'Dashboard', lastUpdated: new Date() },
    'nav.financial': { value: 'Finanziell', lastUpdated: new Date() },
    'nav.settings': { value: 'Einstellungen', lastUpdated: new Date() },
    'button.save': { value: 'Speichern', lastUpdated: new Date() },
    'button.cancel': { value: 'Abbrechen', lastUpdated: new Date() },
    'validation.required': { value: 'Dieses Feld ist erforderlich', lastUpdated: new Date() },
    'error.network': { value: 'Netzwerkfehler aufgetreten', lastUpdated: new Date() }
  },
  'ja-JP': {
    'welcome.message': { value: 'Garlawsプラットフォームへようこそ', lastUpdated: new Date() },
    'nav.dashboard': { value: 'ダッシュボード', lastUpdated: new Date() },
    'nav.financial': { value: '財務', lastUpdated: new Date() },
    'nav.settings': { value: '設定', lastUpdated: new Date() },
    'button.save': { value: '保存', lastUpdated: new Date() },
    'button.cancel': { value: 'キャンセル', lastUpdated: new Date() },
    'validation.required': { value: 'このフィールドは必須です', lastUpdated: new Date() },
    'error.network': { value: 'ネットワークエラーが発生しました', lastUpdated: new Date() }
  }
};

interface I18nProviderProps {
  tenantId?: string;
  defaultLanguage?: string;
  onLanguageChange?: (language: Language) => void;
  children: React.ReactNode;
}

export function I18nProvider({
  tenantId = 'default',
  defaultLanguage = 'en-US',
  onLanguageChange,
  children
}: I18nProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(
    SUPPORTED_LANGUAGES.find(l => l.code === defaultLanguage) || SUPPORTED_LANGUAGES[0]
  );
  const [translations, setTranslations] = useState<Record<string, TranslationBundle>>(MOCK_TRANSLATIONS);

  const culturalContext = CULTURAL_CONTEXTS[currentLanguage.code] || CULTURAL_CONTEXTS['en-US'];

  const setLanguage = useCallback((language: Language) => {
    setCurrentLanguage(language);
    onLanguageChange?.(language);

    // Persist language preference
    if (typeof window !== 'undefined') {
      localStorage.setItem(`garlaws_i18n_${tenantId}`, language.code);
    }
  }, [tenantId, onLanguageChange]);

  const t = useCallback((key: string, variables?: Record<string, any>): string => {
    const bundle = translations[currentLanguage.code] || translations['en-US'];
    const translation = bundle[key];

    if (!translation) {
      // Fallback to English, then default
      const englishFallback = translations['en-US']?.[key];
      if (englishFallback) return englishFallback.value;

      // Return key with context hint
      return key;
    }

    let value = translation.value;

    // Apply cultural adaptation
    if (culturalContext.formality === 'formal' && translation.context === 'casual') {
      // Apply formal transformation
      value = value.replace(/you/i, 'you');
    }

    // Replace variables
    if (variables) {
      Object.entries(variables).forEach(([varName, varValue]) => {
        value = value.replace(new RegExp(`\\$\\{${varName}\\}`, 'g'), String(varValue));
      });
    }

    return value;
  }, [currentLanguage.code, translations, culturalContext]);

  const formatNumber = useCallback((value: number): string => {
    const { decimalSeparator, thousandsSeparator } = currentLanguage.numberFormat;
    return value.toLocaleString(currentLanguage.code.replace('-', '_'), {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).replace(/[.,]/g, (match) => match === '.' ? decimalSeparator : thousandsSeparator);
  }, [currentLanguage]);

  const formatCurrency = useCallback((value: number, currency?: string): string => {
    const curr = currency || currentLanguage.currency;
    return new Intl.NumberFormat(currentLanguage.code, {
      style: 'currency',
      currency: curr
    }).format(value);
  }, [currentLanguage]);

  const formatDate = useCallback((date: Date): string => {
    const format = currentLanguage.dateFormat;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return format
      .replace('yyyy', String(year))
      .replace('mm', month)
      .replace('dd', day)
      .replace('MM', month);
  }, [currentLanguage]);

  const getCulturalAdaptation = useCallback((key: string): any => {
    // Return cultural-specific adaptations
    switch (key) {
      case 'greeting':
        if (culturalContext.formality === 'formal') return { style: 'formal', honorifics: true };
        return { style: 'casual', honorifics: false };

      case 'color_scheme':
        if (culturalContext.region === 'Middle East') return { primary: '#2d7d2d', secondary: '#e6b83a' };
        if (culturalContext.region === 'Asia') return { primary: '#dc2626', secondary: '#2563eb' };
        return { primary: '#1f2937', secondary: '#3b82f6' };

      case 'layout_direction':
        return currentLanguage.rtl ? 'rtl' : 'ltr';

      case 'date_format':
        return currentLanguage.dateFormat;

      default:
        return null;
    }
  }, [culturalContext, currentLanguage]);

  // Load saved language preference on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`garlaws_i18n_${tenantId}`);
      if (saved) {
        const savedLanguage = SUPPORTED_LANGUAGES.find(l => l.code === saved);
        if (savedLanguage) {
          setCurrentLanguage(savedLanguage);
        }
      }
    }
  }, [tenantId]);

  const contextValue: I18nContextType = {
    currentLanguage,
    availableLanguages: SUPPORTED_LANGUAGES,
    translations,
    culturalContext,
    setLanguage,
    t,
    formatNumber,
    formatCurrency,
    formatDate,
    getCulturalAdaptation
  };

  return (
    <I18nContext.Provider value={contextValue}>
      <div dir={currentLanguage.rtl ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

interface LanguageSelectorProps {
  showFlags?: boolean;
  showNativeNames?: boolean;
  compact?: boolean;
}

export function LanguageSelector({
  showFlags = true,
  showNativeNames = true,
  compact = false
}: LanguageSelectorProps) {
  const { currentLanguage, availableLanguages, setLanguage } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        {showFlags && <span className="text-lg">{currentLanguage.flag}</span>}
        <span className={compact ? 'hidden sm:inline' : ''}>
          {showNativeNames ? currentLanguage.nativeName : currentLanguage.name}
        </span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {availableLanguages.map((language) => (
            <button
              key={language.code}
              onClick={() => {
                setLanguage(language);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 ${
                language.code === currentLanguage.code ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              }`}
            >
              {showFlags && <span className="text-lg">{language.flag}</span>}
              <div className="text-left">
                <div className="font-medium">{language.nativeName}</div>
                {!compact && <div className="text-sm text-gray-600">{language.name}</div>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface AdvancedI18nComponentProps {
  tenantId?: string;
}

export default function AdvancedI18n({ tenantId = 'default' }: AdvancedI18nComponentProps) {
  const { currentLanguage, availableLanguages, translations, t, culturalContext } = useI18n();
  const [activeTab, setActiveTab] = useState<'overview' | 'translations' | 'cultural' | 'analytics'>('overview');

  const [newTranslation, setNewTranslation] = useState({
    key: '',
    language: currentLanguage.code,
    value: '',
    context: ''
  });

  const addTranslation = useCallback(() => {
    if (!newTranslation.key || !newTranslation.value) return;

    // Mock adding translation (in real implementation, this would update the translations state)
    console.log('Adding translation:', newTranslation);

    setNewTranslation({ key: '', language: currentLanguage.code, value: '', context: '' });
  }, [newTranslation, currentLanguage.code]);

  const translationStats = Object.entries(translations).map(([lang, bundle]) => ({
    language: lang,
    total: Object.keys(bundle).length,
    complete: Object.values(bundle).filter(t => t.value && t.value !== '').length,
    percentage: Math.round((Object.values(bundle).filter(t => t.value && t.value !== '').length / Object.keys(bundle).length) * 100)
  }));

  const totalTranslations = Object.values(translations).reduce((sum, bundle) => sum + Object.keys(bundle).length, 0);
  const completedTranslations = Object.values(translations).reduce((sum, bundle) =>
    sum + Object.values(bundle).filter(t => t.value && t.value !== '').length, 0
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Advanced i18n Framework</h1>
            <p className="text-gray-600">Real-time language switching and cultural adaptation</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">Current Language</div>
              <div className="flex items-center gap-2">
                <span className="text-lg">{currentLanguage.flag}</span>
                <span className="font-medium">{currentLanguage.nativeName}</span>
              </div>
            </div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{availableLanguages.length}</div>
            <div className="text-sm text-gray-600">Languages</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{totalTranslations}</div>
            <div className="text-sm text-gray-600">Total Keys</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {totalTranslations > 0 ? Math.round((completedTranslations / totalTranslations) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600">Complete</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{culturalContext.region}</div>
            <div className="text-sm text-gray-600">Cultural Context</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { id: 'overview', label: 'Overview', icon: '🌍' },
              { id: 'translations', label: 'Translations', icon: '📝' },
              { id: 'cultural', label: 'Cultural', icon: '🎭' },
              { id: 'analytics', label: 'Analytics', icon: '📊' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Language Info */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-medium mb-4">Current Language Settings</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Language:</span>
                      <span className="font-medium">{currentLanguage.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Native Name:</span>
                      <span className="font-medium">{currentLanguage.nativeName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Region:</span>
                      <span className="font-medium">{currentLanguage.region}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Currency:</span>
                      <span className="font-medium">{currentLanguage.currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">RTL:</span>
                      <span className="font-medium">{currentLanguage.rtl ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date Format:</span>
                      <span className="font-medium font-mono">{currentLanguage.dateFormat}</span>
                    </div>
                  </div>
                </div>

                {/* Cultural Context */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-medium mb-4">Cultural Context</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Formality:</span>
                      <span className="font-medium capitalize">{culturalContext.formality}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Communication:</span>
                      <span className="font-medium capitalize">{culturalContext.communicationStyle.replace('-', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time Orientation:</span>
                      <span className="font-medium capitalize">{culturalContext.timeOrientation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Individualism:</span>
                      <span className="font-medium capitalize">{culturalContext.individualism}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Power Distance:</span>
                      <span className="font-medium capitalize">{culturalContext.powerDistance}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Uncertainty Avoidance:</span>
                      <span className="font-medium capitalize">{culturalContext.uncertaintyAvoidance}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Language Selector Demo */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium mb-4">Language Selector Demo</h3>
                <div className="flex items-center gap-4">
                  <span className="text-gray-600">Select Language:</span>
                  <LanguageSelector />
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded">
                  <p className="text-blue-800">
                    Sample Translation: "{t('welcome.message')}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Translations Tab */}
          {activeTab === 'translations' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Translation Management</h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Import Translations
                </button>
              </div>

              {/* Add Translation */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-medium mb-4">Add New Translation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Translation key (e.g., button.save)"
                    value={newTranslation.key}
                    onChange={(e) => setNewTranslation(prev => ({ ...prev, key: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={newTranslation.language}
                    onChange={(e) => setNewTranslation(prev => ({ ...prev, language: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {availableLanguages.map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.nativeName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-4">
                  <textarea
                    placeholder="Translation value"
                    value={newTranslation.value}
                    onChange={(e) => setNewTranslation(prev => ({ ...prev, value: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={addTranslation}
                    disabled={!newTranslation.key || !newTranslation.value}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    Add Translation
                  </button>
                  <button
                    onClick={() => setNewTranslation({ key: '', language: currentLanguage.code, value: '', context: '' })}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Translation Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {translationStats.map((stat) => (
                  <div key={stat.language} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-lg">
                        {availableLanguages.find(l => l.code === stat.language)?.flag}
                      </span>
                      <div>
                        <h3 className="font-medium">
                          {availableLanguages.find(l => l.code === stat.language)?.nativeName}
                        </h3>
                        <p className="text-sm text-gray-600">{stat.language}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Total Keys:</span>
                        <span className="font-medium">{stat.total}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Completed:</span>
                        <span className="font-medium">{stat.complete}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Progress:</span>
                        <span className="font-medium">{stat.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${stat.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cultural Tab */}
          {activeTab === 'cultural' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Cultural Adaptation</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cultural Dimensions */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-medium mb-4">Hofstede's Cultural Dimensions</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Power Distance</span>
                        <span>{culturalContext.powerDistance}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            culturalContext.powerDistance === 'high' ? 'bg-red-600 w-3/4' :
                            culturalContext.powerDistance === 'medium' ? 'bg-yellow-600 w-1/2' :
                            'bg-green-600 w-1/4'
                          }`}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Individualism</span>
                        <span>{culturalContext.individualism}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            culturalContext.individualism === 'individualistic' ? 'bg-blue-600 w-3/4' :
                            'bg-purple-600 w-1/4'
                          }`}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Uncertainty Avoidance</span>
                        <span>{culturalContext.uncertaintyAvoidance}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            culturalContext.uncertaintyAvoidance === 'high' ? 'bg-red-600 w-3/4' :
                            culturalContext.uncertaintyAvoidance === 'medium' ? 'bg-yellow-600 w-1/2' :
                            'bg-green-600 w-1/4'
                          }`}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cultural Adaptations */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-medium mb-4">Active Adaptations</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="text-sm">Greeting Style</span>
                      <span className="text-sm font-medium capitalize">{culturalContext.formality}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="text-sm">Communication</span>
                      <span className="text-sm font-medium capitalize">
                        {culturalContext.communicationStyle.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="text-sm">Layout Direction</span>
                      <span className="text-sm font-medium">
                        {currentLanguage.rtl ? 'Right-to-Left' : 'Left-to-Right'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="text-sm">Time Orientation</span>
                      <span className="text-sm font-medium capitalize">{culturalContext.timeOrientation}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cultural Examples */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium mb-4">Cultural Examples</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded">
                    <h4 className="font-medium mb-2">Color Preferences</h4>
                    <div className="flex gap-2">
                      <div className="w-6 h-6 rounded" style={{ backgroundColor: '#2d7d2d' }}></div>
                      <div className="w-6 h-6 rounded" style={{ backgroundColor: '#e6b83a' }}></div>
                      <span className="text-sm">Green & Gold</span>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded">
                    <h4 className="font-medium mb-2">Date Format</h4>
                    <div className="font-mono text-sm">{currentLanguage.dateFormat}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded">
                    <h4 className="font-medium mb-2">Number Format</h4>
                    <div className="font-mono text-sm">
                      1{currentLanguage.numberFormat.thousandsSeparator}234{currentLanguage.numberFormat.decimalSeparator}56
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">i18n Analytics</h2>

              {/* Usage Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="font-medium mb-2">Translation Coverage</h3>
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round((completedTranslations / totalTranslations) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">
                    {completedTranslations} of {totalTranslations} keys
                  </div>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="font-medium mb-2">Active Languages</h3>
                  <div className="text-2xl font-bold text-green-600">{availableLanguages.length}</div>
                  <div className="text-sm text-gray-600">Supported locales</div>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="font-medium mb-2">Cultural Contexts</h3>
                  <div className="text-2xl font-bold text-purple-600">{Object.keys(CULTURAL_CONTEXTS).length}</div>
                  <div className="text-sm text-gray-600">Defined cultures</div>
                </div>
              </div>

              {/* Language Usage */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium mb-4">Language Usage Statistics</h3>
                <div className="space-y-4">
                  {availableLanguages.slice(0, 5).map((language) => {
                    const usage = Math.floor(Math.random() * 100); // Mock data
                    return (
                      <div key={language.code} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{language.flag}</span>
                          <span className="font-medium">{language.nativeName}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${usage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-12">{usage}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium mb-4">Performance Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-gray-900">12ms</div>
                    <div className="text-sm text-gray-600">Avg Load Time</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-gray-900">98.5%</div>
                    <div className="text-sm text-gray-600">Cache Hit Rate</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-gray-900">2.1KB</div>
                    <div className="text-sm text-gray-600">Bundle Size</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-gray-900">95.2%</div>
                    <div className="text-sm text-gray-600">Translation Accuracy</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}