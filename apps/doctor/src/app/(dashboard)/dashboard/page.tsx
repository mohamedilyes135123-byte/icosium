"use client";

export const dynamic = 'force-dynamic';

import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Users, AlertCircle, FileText, Activity, Calendar, Bell, ScanBarcode, PlusCircle } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageContext";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function DoctorDashboardMobile() {
  const { t, lang } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayPatients: 0,
    upcomingAppts: 0,
    prescriptions: 0,
    labResults: 0,
  });

  useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      setProfile(prof);

      // Fetch dynamic stats
      const today = new Date().toISOString().split('T')[0];
      
      const [
        { count: todayPatients },
        { count: upcomingAppts },
        { count: prescriptions },
        { count: labResults },
        { count: emergencyCases }
      ] = await Promise.all([
        // Patients with appointments today
        supabase.from("appointments").select("id", { count: "exact", head: true })
          .eq("doctor_id", user.id)
          .eq("status", "APPROVED")
          .gte("scheduled_at", `${today}T00:00:00`)
          .lte("scheduled_at", `${today}T23:59:59`),
          
        // Upcoming approved appointments
        supabase.from("appointments").select("id", { count: "exact", head: true })
          .eq("doctor_id", user.id)
          .eq("status", "APPROVED")
          .gte("scheduled_at", new Date().toISOString()),
          
        // Total prescriptions written by this doctor
        supabase.from("prescriptions").select("id", { count: "exact", head: true })
          .eq("doctor_id", user.id),
          
        // Lab results ready for this doctor
        supabase.from("lab_requests").select("id", { count: "exact", head: true })
          .eq("doctor_id", user.id)
          .eq("status", "COMPLETED"),
          
        // Emergency/Pending medical requests
        supabase.from("medical_requests").select("id", { count: "exact", head: true })
          .eq("doctor_id", user.id)
          .eq("status", "PENDING")
      ]);

      setStats({
        todayPatients: todayPatients || 0,
        upcomingAppts: upcomingAppts || 0,
        prescriptions: prescriptions || 0,
        labResults: labResults || 0,
      });
      
      setLoading(false);
    };
    load();
  }, []);

  const doctorName = loading ? "..." : (profile?.full_name || (lang === "ar" ? "طبيب" : "Médecin"));
  const avatarLetter = loading ? "🩺" : (profile?.full_name?.replace(/^(د\.\s*|dr\.\s*)/i, "").trim()?.[0] || "🩺");

  return (
    <div key={lang} className="w-full px-2 sm:px-4 pt-4 sm:pt-6 pb-28 min-h-full" dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* Top Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex justify-between items-center mb-8 glass-panel p-3 rounded-2xl"
      >
        <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-[18px] bg-gradient-to-tr from-blue-500 to-cyan-400 p-[2px] shadow-sm">
              <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center text-blue-600 font-bold text-lg">
                {avatarLetter}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-blue-600/80 mb-0.5">{t("loggedInAs")}</p>
              <h1 className="text-sm font-black text-slate-800 leading-none">{doctorName}</h1>
            </div>
        </div>
        <div className="flex gap-2">
            <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-600 shadow-sm border border-slate-100 relative">
                <Bell className="w-5 h-5 text-blue-600" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
            </button>
        </div>
      </motion.header>

      {/* Main Glass Card (Welcome & Quick Action) */}
      <motion.div 
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
        className="relative rounded-3xl mb-6 p-5 sm:p-6 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 shadow-xl shadow-blue-500/20 overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/20 blur-2xl rounded-full translate-x-10 -translate-y-10"></div>
        <div className="absolute left-0 bottom-0 w-24 h-24 bg-cyan-400/40 blur-xl rounded-full -translate-x-5 translate-y-5"></div>
        
        <div className="relative z-10 flex flex-col text-white">
          <h3 className="text-xl sm:text-2xl font-black mb-4 drop-shadow-md leading-snug">{t("welcomeDashboard")}</h3>
          
          <div className="flex gap-3">
             <Link href="/requests" className="flex-1">
                <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 rounded-xl h-11 text-sm font-black shadow-md">{t("reviewCases")}</Button>
             </Link>
          </div>
        </div>
      </motion.div>

      {/* Grid Menu Stats */}
      <div className="flex justify-between items-end mb-3 px-1">
        <h3 className="font-black text-slate-800 text-base sm:text-lg">{t("overviewToday")}</h3>
      </div>
      <motion.div 
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6"
      >
        <QuickStat href="/patients" icon={<Users />} title={t("todayPatients")} value={loading ? "..." : stats.todayPatients} color="from-[#1a6ff5] to-[#0ea5e9]" />
        <QuickStat href="/appointments" icon={<Calendar />} title={t("upcomingAppointments")} value={loading ? "..." : stats.upcomingAppts} color="from-[#06b6d4] to-[#10b981]" />
        <QuickStat href="/prescriptions/new" icon={<PlusCircle />} title={lang === "ar" ? "إنشاء وصفة جديدة" : "Nouvelle ordonnance"} value="+" color="from-[#8b5cf6] to-[#6366f1]" />
        <QuickStat href="/dashboard" icon={<Activity />} title={t("labResults")} value={loading ? "..." : stats.labResults} color="from-[#f43f5e] to-[#f97316]" notification={stats.labResults > 0} />
      </motion.div>

      {/* Action Scan */}
      <motion.div
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-6"
      >
         <div className="w-full bg-white shadow-sm hover:shadow-md rounded-2xl p-4 flex items-center justify-between group cursor-pointer border border-slate-100 transition-all hover:border-blue-200">
            <div className="flex items-center gap-3.5">
               <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100/50 group-hover:scale-105 transition-transform flex-shrink-0">
                  <ScanBarcode className="w-5 h-5" />
               </div>
               <div>
                  <h4 className="font-black text-slate-800 text-xs sm:text-sm mb-0.5">{t("scanId")}</h4>
                  <p className="text-[11px] text-slate-500 font-bold">{t("scanIdDesc")}</p>
               </div>
            </div>
         </div>
      </motion.div>
    </div>
  );
}

function QuickStat({ title, icon, value, color, notification, href }: any) {
  return (
    <Link href={href || "#"} className="block h-full">
      <motion.div 
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={`cursor-pointer rounded-2xl sm:rounded-3xl p-4 sm:p-5 bg-gradient-to-br ${color} text-white shadow-md hover:shadow-lg transition-all relative overflow-hidden flex flex-col justify-between h-36 sm:h-40 w-full`}
      >
        {notification && (
          <span className="absolute top-3 left-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white z-20 animate-pulse shadow-sm" />
        )}
        
        {/* Top Section: Icon badge & Large Count */}
        <div className="flex items-center justify-between w-full">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center backdrop-blur-md shadow-inner text-white flex-shrink-0 [&>svg]:w-5 [&>svg]:h-5 sm:[&>svg]:w-6 sm:[&>svg]:h-6">
            {icon}
          </div>
          <span className="text-3xl sm:text-4xl font-black drop-shadow-sm leading-none tracking-tight">{value}</span>
        </div>
        
        {/* Bottom Section: Label */}
        <div className="mt-2">
          <h5 className="font-extrabold text-white/95 text-xs sm:text-sm leading-snug drop-shadow-sm line-clamp-2">
            {title}
          </h5>
        </div>
      </motion.div>
    </Link>
  );
}

