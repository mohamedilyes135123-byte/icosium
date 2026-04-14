"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { Stethoscope, Calendar, Pill, FileBox, Bell, HeartPulse, ChevronRight, Activity } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function PatientDashboard() {
  return (
    <div className="w-full px-5 pt-16 pb-28 min-h-full">
      {/* Top Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex justify-between items-center mb-8"
      >
        <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[2px] shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-emerald-600 font-bold text-lg">
                أ
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-600/80 mb-0.5">صباح الخير</p>
              <h1 className="text-xl font-bold text-slate-800 leading-none">أحمد بن علي</h1>
            </div>
        </div>
        <button className="w-10 h-10 bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center text-slate-600 shadow-sm border border-white/80 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
      </motion.header>

      {/* Main Glass Card (AI Mini status) */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
        className="relative rounded-3xl mb-8 p-[1px] bg-gradient-to-br from-emerald-300 via-teal-200 to-emerald-500 shadow-xl shadow-emerald-500/10 overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/20 blur-2xl rounded-full translate-x-10 -translate-y-10"></div>
        <div className="bg-gradient-to-br from-[#0f766e]/95 to-[#064e3b]/95 backdrop-blur-xl w-full h-full rounded-[23px] p-5 relative z-10 flex text-white overflow-hidden">
          {/* Subtle heartbeat background inside the card */}
          <HeartPulse className="absolute -left-4 -bottom-4 w-32 h-32 text-emerald-500/10" strokeWidth={1} />
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]"></div>
              <span className="text-xs font-bold text-emerald-200 tracking-wider">المساعد الطبي الآمن</span>
            </div>
            <h3 className="text-xl font-bold mb-1">حان وقت دوائك</h3>
            <p className="text-sm text-emerald-100/70 mb-4 pr-1 leading-snug">Paracetamol 1000mg بعد الإفطار</p>
            
            <Link href="/patient/ai-chat" className="inline-flex items-center gap-1.5 text-sm font-bold bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              تحدث للمساعد <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
          </div>
          
          <div className="relative">
             <div className="absolute inset-0 bg-emerald-400/30 blur-xl rounded-full"></div>
             <div className="w-20 h-20 bg-gradient-to-tr from-emerald-400 to-teal-300 rounded-2xl rotate-3 flex items-center justify-center shadow-lg border border-white/20 relative z-10">
               <Activity className="w-10 h-10 text-emerald-900" />
             </div>
          </div>
        </div>
      </motion.div>

      {/* Grid Menu */}
      <h3 className="font-bold text-slate-800 mb-4 px-1 text-lg">الخدمات السريعة</h3>
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 gap-4 mb-8"
      >
        <QuickCard icon={<Stethoscope />} title="استشارة عن بعد" color="from-blue-500 to-sky-400" />
        <QuickCard icon={<Calendar />} title="دليل الأطباء" color="from-emerald-500 to-teal-400" />
        <QuickCard icon={<Pill />} title="صيدليتي" color="from-amber-500 to-orange-400" />
        <QuickCard icon={<FileBox />} title="نتائج التحاليل" color="from-purple-500 to-indigo-400" />
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="font-bold text-slate-800 text-lg">نشاطاتي الأخيرة</h3>
          <span className="text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-md">الكل</span>
        </div>
        
        <div className="space-y-3">
          {/* Card Mock */}
          <Card className="bg-white/60 backdrop-blur-md border-white/80 shadow-sm hover:shadow-md transition-shadow">
             <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                   <Stethoscope className="w-6 h-6" />
                </div>
                <div className="flex-1">
                   <h4 className="font-bold text-slate-800 text-sm">متابعة حالة صحية</h4>
                   <p className="text-xs text-slate-500 mt-0.5">د. يوسف خليل • 12 أفريل</p>
                </div>
                <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap">
                  مكتمل
                </div>
             </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}

function QuickCard({ title, icon, color }: { title: string, icon: React.ReactNode, color: string }) {
  return (
    <Card className="border-0 shadow-lg shadow-slate-200/50 hover:scale-105 transition-transform overflow-hidden relative group">
      <div className={`absolute top-0 right-0 w-full h-full bg-gradient-to-br ${color} opacity-[0.03] group-hover:opacity-10 transition-opacity`}></div>
      <CardContent className="p-5 flex flex-col items-center justify-center text-center gap-3">
        <div className={`w-12 h-12 rounded-full bg-gradient-to-tr ${color} text-white flex items-center justify-center shadow-md relative z-10`}>
          {icon}
        </div>
        <h4 className="font-bold text-slate-700 text-xs relative z-10">{title}</h4>
      </CardContent>
    </Card>
  )
}
