'use client';

import { useEffect, useState } from 'react';
import { useI18nStore } from '@/lib/i18n/store';

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { language } = useI18nStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.lang = language;
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    }
  }, [language, mounted]);

  // Prevent hydration mismatch on body classes or direction by rendering after mount,
  // but since we want SEO and fast load, we just update the DOM and let children render.
  return <>{children}</>;
}
