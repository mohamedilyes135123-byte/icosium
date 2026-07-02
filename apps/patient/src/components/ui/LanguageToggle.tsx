'use client';

import { useI18nStore } from '@/lib/i18n/store';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';

export default function LanguageToggle() {
  const { language, toggleLanguage } = useI18nStore();

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white backdrop-blur-md border border-slate-200 shadow-sm transition-all hover:shadow-md text-sm font-bold text-slate-700"
      style={{ zIndex: 100 }}
      title="تغيير اللغة / Changer de langue"
    >
      <Globe className="w-4 h-4 text-emerald-600" />
      <span>{language === 'ar' ? 'Français' : 'العربية'}</span>
    </button>
  );
}
