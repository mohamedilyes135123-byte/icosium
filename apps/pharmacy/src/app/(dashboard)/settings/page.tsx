"use client";

import { Settings } from "lucide-react";
import { motion } from "framer-motion";

export default function PharmacySettings() {
  return (
    <div className="w-full pb-20" dir="rtl">
      <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-800">الإعدادات</h1>
          <p className="text-xs font-bold text-purple-500">إدارة حساب الصيدلية</p>
        </div>
      </motion.header>

      <div className="glass-panel rounded-3xl p-6 shadow-lg shadow-purple-500/5 text-center py-20">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-50 mb-6">
          <Settings className="w-10 h-10 text-purple-300" />
        </div>
        <h2 className="font-black text-slate-800 text-xl mb-3">الإعدادات قيد التطوير</h2>
        <p className="text-slate-500 text-sm font-bold max-w-sm mx-auto">
          عذراً، صفحة الإعدادات للصيدلية لا تزال قيد التطوير في هذه النسخة. سيتم إضافة خيارات التحكم المتقدمة قريباً.
        </p>
      </div>
    </div>
  );
}
