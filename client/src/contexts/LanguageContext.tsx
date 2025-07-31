import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, getTranslation, Translations } from '@shared/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Get saved language from localStorage or detect browser language
    const saved = localStorage.getItem('language') as Language;
    if (saved && ['nl', 'de', 'en', 'fr'].includes(saved)) {
      return saved;
    }
    
    // Detect browser language
    const browserLang = navigator.language.split('-')[0];
    if (['nl', 'de', 'en', 'fr'].includes(browserLang)) {
      return browserLang as Language;
    }
    
    // Default to Dutch based on user preference
    return 'nl';
  });

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const t = getTranslation(language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}