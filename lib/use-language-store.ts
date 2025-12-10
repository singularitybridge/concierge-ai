'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Language, getTranslations, Translations } from './translations';

interface LanguageState {
  language: Language;
  translations: Translations;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'en',
      translations: getTranslations('en'),
      setLanguage: (lang: Language) => set({
        language: lang,
        translations: getTranslations(lang)
      }),
    }),
    {
      name: 'niseko-language',
    }
  )
);
