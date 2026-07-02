import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'ar' | 'fr';

interface I18nState {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      language: 'ar', // default
      setLanguage: (lang) => set({ language: lang }),
      toggleLanguage: () => set((state) => ({ language: state.language === 'ar' ? 'fr' : 'ar' })),
    }),
    {
      name: 'patient-language-storage',
    }
  )
);
