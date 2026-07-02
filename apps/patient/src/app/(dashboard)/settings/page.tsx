"use client";

import { Settings, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import LanguageToggle from "@/components/ui/LanguageToggle";

export default function PatientSettings() {
  const { t } = useTranslation();

  return (
    <div className="w-full pb-20">
      <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800">{t.settings.title}</h1>
            <p className="text-xs font-bold text-emerald-500">إدارة حساب المريض</p>
          </div>
        </div>
      </motion.header>

      {/* Language Settings Card */}
      <div className="glass-panel rounded-3xl p-6 shadow-lg shadow-emerald-500/5 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">{t.settings.language}</h2>
              <p className="text-xs text-slate-500 mt-1">{t.settings.languageDesc}</p>
            </div>
          </div>
          <LanguageToggle />
        </div>
      </div>

      <div className="glass-panel rounded-3xl p-6 shadow-lg shadow-emerald-500/5 text-center py-20">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 mb-6">
          <Settings className="w-10 h-10 text-emerald-300" />
        </div>
        <h2 className="font-black text-slate-800 text-xl mb-3">{t.settings.underDevelopment}</h2>
        <p className="text-slate-500 text-sm font-bold max-w-sm mx-auto">
          {t.settings.underDevDesc}
        </p>
      </div>
    </div>
  );
}
