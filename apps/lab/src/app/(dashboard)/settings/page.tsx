"use client";

import { Settings } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/LanguageContext";

export default function LabSettings() {
  const { lang, t } = useLanguage();
  return (
    <div className="w-full pb-20" dir={lang === "ar" ? "rtl" : "ltr"}>
      <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-800">{t("settingsTitle")}</h1>
          <p className="text-xs font-bold text-indigo-500">{t("settingsSubtitle")}</p>
        </div>
      </motion.header>

      <div className="glass-panel rounded-3xl p-6 shadow-lg shadow-indigo-500/5 text-center py-20">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-50 mb-6">
          <Settings className="w-10 h-10 text-indigo-300" />
        </div>
        <h2 className="font-black text-slate-800 text-xl mb-3">{t("settingsWip")}</h2>
        <p className="text-slate-500 text-sm font-bold max-w-sm mx-auto">
          {t("settingsWipDesc")}
        </p>
      </div>
    </div>
  );
}
