import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language } from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (typeof translations)[Language];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Oldindan chizilgan HTML o'zbekcha; tanlangan til hydrate'dan keyin qo'llanadi (mos kelmaslik bo'lmasin)
  const [language, setLanguageState] = useState<Language>('uz');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('chorrom-language');
      if (saved === 'ru' || saved === 'uz') setLanguageState(saved);
    } catch {
      /* localStorage yopiq */
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('chorrom-language', lang);
    } catch {
      /* localStorage yopiq */
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
