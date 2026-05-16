"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { Calendar, Clock, Plus, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState<any[]>([]);

  return (
    <div className="w-full pb-32" dir="rtl">
      {/* Header */}
      <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200">
            <ArrowRight className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-800">مواعيدي</h1>
            <p className="text-xs font-bold text-slate-400">إدارة حجوزاتك مع الأطباء</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-l from-emerald-500 to-green-400 text-white text-sm font-bold shadow-lg shadow-emerald-500/30">
          <Plus className="w-4 h-4" /> طلب موعد
        </button>
      </motion.header>

      {/* Appointments List */}
      <div className="flex flex-col items-center justify-center py-16 text-center bg-white/50 backdrop-blur-md rounded-3xl border border-white shadow-sm">
        <Calendar className="w-16 h-16 text-slate-200 mb-4" />
        <p className="text-slate-500 font-bold text-lg mb-2">لا توجد مواعيد قادمة</p>
        <p className="text-slate-400 text-sm mb-6 max-w-[250px]">لم تقم بحجز أي موعد بعد. يمكنك طلب موعد جديد مع طبيبك المفضل.</p>
        
        <button className="px-6 py-3 rounded-xl bg-slate-800 text-white font-bold shadow-lg transition-transform active:scale-95">
          طلب موعد الآن
        </button>
      </div>
    </div>
  );
}
