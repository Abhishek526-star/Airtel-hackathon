import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import translations, { SUPPORTED_LANGUAGES } from '../locales/index.js';

const LanguageContext = createContext(null);

const STORAGE_KEY = 'udyam_language_preference';

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && translations[saved]) {
        return saved;
      }
    } catch {
      // ignore localStorage errors
    }
    return 'en';
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language);
      document.documentElement.lang = language;
    } catch {
      // ignore
    }
  }, [language]);

  const changeLanguage = useCallback((newLang) => {
    if (translations[newLang]) {
      setLanguage(newLang);
    }
  }, []);

  // Helper for deep property lookup with fallback and param replacement
  const t = useCallback(
    (keyPath, fallback = '', params = {}) => {
      const getNested = (obj, path) => {
        if (!obj || !path) return undefined;
        return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
      };

      // 1. Try active language
      let val = getNested(translations[language], keyPath);

      // 2. Fall back to English
      if (val === undefined && language !== 'en') {
        val = getNested(translations.en, keyPath);
      }

      // 3. Fall back to supplied fallback or keyPath
      if (val === undefined) {
        val = fallback || keyPath;
      }

      // If string, handle param interpolations e.g. {current}, {total}
      if (typeof val === 'string' && params && typeof params === 'object') {
        Object.entries(params).forEach(([k, v]) => {
          val = val.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        });
      }

      return val;
    },
    [language]
  );

  const currentLanguageInfo = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage: changeLanguage,
      changeLanguage,
      t,
      currentLanguageInfo,
      supportedLanguages: SUPPORTED_LANGUAGES,
    }),
    [language, changeLanguage, t, currentLanguageInfo]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useTranslation = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return ctx;
};

export default LanguageContext;
