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
      title={language === 'ar' ? "التبديل إلى الفرنسية" : "Passer à l'arabe"}
    >
      <img 
        src={language === 'ar' ? "/algeria.png" : "/france.png"} 
        alt={language === 'ar' ? "Algeria" : "France"} 
        className="w-5 h-5 rounded-full object-cover shadow-sm" 
      />
      <span>{language === 'ar' ? 'العربية' : 'Français'}</span>
    </button>
  );
}
