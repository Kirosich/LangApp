import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);
const STORAGE_KEY = 'langapp_language';

// One global active language for the whole app -- no more "Все"/mixed
// view anywhere, and no more per-page language toggles. Every screen
// reads this instead of its own local state or a ?language= URL param,
// so switching it at the top actually changes everything at once.
export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'kz' || stored === 'en' ? stored : 'kz';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
