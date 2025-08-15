
import React, { createContext, useState, useCallback, useMemo } from 'react';
import { translations, supportedLanguages } from '../locales/translations';

type I18nContextType = {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string) => string;
};

export const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getInitialLanguage = () => {
    const browserLang = navigator.language.split(/[-_]/)[0];
    return supportedLanguages.some(l => l.code === browserLang) ? browserLang : 'en';
  };

  const [language, setLanguage] = useState<string>(getInitialLanguage);

  const t = useCallback((key: string): string => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    t
  }), [language, t]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};
