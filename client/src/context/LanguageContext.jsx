import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('nepready_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('nepready_lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  // Translate helper supporting dot notation e.g. t('app.tagline')
  const t = (pathKey, fallback = '') => {
    const keys = pathKey.split('.');
    let current = translations[lang] || translations.en;
    for (const k of keys) {
      if (!current || current[k] === undefined) {
        // Fallback to English if missing in Nepali
        let enCurrent = translations.en;
        for (const ek of keys) {
          if (!enCurrent || enCurrent[ek] === undefined) return fallback || pathKey;
          enCurrent = enCurrent[ek];
        }
        return enCurrent;
      }
      current = current[k];
    }
    return current || fallback || pathKey;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
