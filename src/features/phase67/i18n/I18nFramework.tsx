'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';

// Supported locales with their configurations
export const SUPPORTED_LOCALES = [
  { code: 'en', name: 'English', flag: '🇺🇸', rtl: false, region: 'US' },
  { code: 'es', name: 'Español', flag: '🇪🇸', rtl: false, region: 'ES' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', rtl: false, region: 'FR' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', rtl: false, region: 'DE' },
  { code: 'zh', name: '中文', flag: '🇨🇳', rtl: false, region: 'CN' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', rtl: false, region: 'JP' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', rtl: true, region: 'SA' },
  { code: 'pt', name: 'Português', flag: '🇵🇹', rtl: false, region: 'PT' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', rtl: false, region: 'RU' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳', rtl: false, region: 'IN' },
];

export interface I18nContextType {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string, params?: Record<string, any>) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (value: number, currency?: string) => string;
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
  formatTime: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
  formatDateTime: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
  isRTL: boolean;
  direction: 'ltr' | 'rtl';
  supportedLocales: typeof SUPPORTED_LOCALES;
  detectUserLocale: () => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const locale = useLocale();
  const t = useTranslations();
  const [currentLocale, setCurrentLocale] = useState(locale);

  // Detect RTL languages
  const currentLocaleConfig = SUPPORTED_LOCALES.find(l => l.code === currentLocale);
  const isRTL = currentLocaleConfig?.rtl || false;
  const direction = isRTL ? 'rtl' : 'ltr';

  // Apply RTL/LTR direction to document
  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = currentLocale;
  }, [direction, currentLocale]);

  const detectUserLocale = (): string => {
    // Check localStorage first
    const stored = localStorage.getItem('preferred-locale');
    if (stored && SUPPORTED_LOCALES.find(l => l.code === stored)) {
      return stored;
    }

    // Check browser language
    const browserLang = navigator.language.split('-')[0];
    if (SUPPORTED_LOCALES.find(l => l.code === browserLang)) {
      return browserLang;
    }

    // Check for regional variants
    const fullBrowserLang = navigator.language;
    const regionalMatch = SUPPORTED_LOCALES.find(l => fullBrowserLang.startsWith(l.code));
    if (regionalMatch) {
      return regionalMatch.code;
    }

    // Default to English
    return 'en';
  };

  const setLocale = (newLocale: string) => {
    if (SUPPORTED_LOCALES.find(l => l.code === newLocale)) {
      setCurrentLocale(newLocale);
      localStorage.setItem('preferred-locale', newLocale);
      // In a real app, this would trigger a page reload or router.push
      window.location.href = `/${newLocale}`;
    }
  };

  const formatNumber = (value: number, options?: Intl.NumberFormatOptions): string => {
    return new Intl.NumberFormat(currentLocale, options).format(value);
  };

  const formatCurrency = (value: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat(currentLocale, {
      style: 'currency',
      currency,
    }).format(value);
  };

  const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions): string => {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return new Intl.DateTimeFormat(currentLocale, { ...defaultOptions, ...options }).format(date);
  };

  const formatTime = (date: Date, options?: Intl.DateTimeFormatOptions): string => {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    return new Intl.DateTimeFormat(currentLocale, { ...defaultOptions, ...options }).format(date);
  };

  const formatDateTime = (date: Date, options?: Intl.DateTimeFormatOptions): string => {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Intl.DateTimeFormat(currentLocale, { ...defaultOptions, ...options }).format(date);
  };

  const translate = (key: string, params?: Record<string, any>): string => {
    try {
      return t(key, params);
    } catch {
      // Fallback to key if translation not found
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  };

  const contextValue: I18nContextType = {
    locale: currentLocale,
    setLocale,
    t: translate,
    formatNumber,
    formatCurrency,
    formatDate,
    formatTime,
    formatDateTime,
    isRTL,
    direction,
    supportedLocales: SUPPORTED_LOCALES,
    detectUserLocale,
  };

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
};

// Hook for getting translated messages with type safety
export const useTranslation = (namespace?: string) => {
  const { t } = useI18n();

  const translate = (key: string, params?: Record<string, any>) => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    return t(fullKey, params);
  };

  return { t: translate };
};

// Component for locale selector
export const LocaleSelector: React.FC = () => {
  const { locale, setLocale, supportedLocales } = useI18n();

  return (
    <div className="relative">
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value)}
        className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {supportedLocales.map((loc) => (
          <option key={loc.code} value={loc.code}>
            {loc.flag} {loc.name}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

// Component for displaying formatted numbers
export const FormattedNumber: React.FC<{
  value: number;
  options?: Intl.NumberFormatOptions;
  className?: string;
}> = ({ value, options, className }) => {
  const { formatNumber } = useI18n();
  return <span className={className}>{formatNumber(value, options)}</span>;
};

// Component for displaying formatted currency
export const FormattedCurrency: React.FC<{
  value: number;
  currency?: string;
  className?: string;
}> = ({ value, currency, className }) => {
  const { formatCurrency } = useI18n();
  return <span className={className}>{formatCurrency(value, currency)}</span>;
};

// Component for displaying formatted dates
export const FormattedDate: React.FC<{
  date: Date | string;
  options?: Intl.DateTimeFormatOptions;
  className?: string;
}> = ({ date, options, className }) => {
  const { formatDate } = useI18n();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return <span className={className}>{formatDate(dateObj, options)}</span>;
};

// Component for displaying formatted date and time
export const FormattedDateTime: React.FC<{
  date: Date | string;
  options?: Intl.DateTimeFormatOptions;
  className?: string;
}> = ({ date, options, className }) => {
  const { formatDateTime } = useI18n();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return <span className={className}>{formatDateTime(dateObj, options)}</span>;
};

export default I18nProvider;