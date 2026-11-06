import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language, LevelData } from '../types/isotope';
import fr from './locales/fr.json';
import en from './locales/en.json';
import es from './locales/es.json';
import zh from './locales/zh.json';

export type TranslationKey = keyof typeof fr;

const DICTS: Record<Language, Record<TranslationKey, string>> = {
  fr,
  en,
  es,
  zh,
};

export const LANGUAGES: { code: Language; label: string; name: string }[] = [
  { code: 'fr', label: 'FR', name: 'Français' },
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'es', label: 'ES', name: 'Español' },
  { code: 'zh', label: '中文', name: '中文' },
];

function detectInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'fr';
  const saved = localStorage.getItem('isotope_lang') as Language | null;
  if (saved && saved in DICTS) return saved;
  const nav = (navigator.language || 'fr').toLowerCase();
  if (nav.startsWith('fr')) return 'fr';
  if (nav.startsWith('es')) return 'es';
  if (nav.startsWith('zh')) return 'zh';
  if (nav.startsWith('en')) return 'en';
  return 'fr';
}

interface I18nContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  getLevelTitle: (level: LevelData) => string;
  getLevelDescription: (level: LevelData) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(detectInitialLanguage);

  const setLang = useCallback((next: Language) => {
    setLangState(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('isotope_lang', next);
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>): string => {
      let str = DICTS[lang]?.[key] ?? DICTS.fr[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        }
      }
      return str;
    },
    [lang]
  );

  const getLevelTitle = useCallback(
    (level: LevelData): string => {
      if (lang === 'fr') return level.title;
      return level.i18n?.[lang]?.title || level.title;
    },
    [lang]
  );

  const getLevelDescription = useCallback(
    (level: LevelData): string => {
      if (lang === 'fr') return level.description;
      return level.i18n?.[lang]?.description || level.description;
    },
    [lang]
  );

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = DICTS[lang]?.appTitle || DICTS.fr.appTitle;
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t, getLevelTitle, getLevelDescription }}>
      {children}
    </I18nContext.Provider>
  );
};

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return ctx;
}

