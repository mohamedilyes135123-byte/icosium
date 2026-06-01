"use client";

export const dynamic = 'force-dynamic';

import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Users, AlertCircle, FileText, Activity, Calendar, Bell, ScanBarcode } from "lucide-react";
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
    emergencyCases: 0
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
        emergencyCases: emergencyCases || 0
      });
      
      setLoading(false);
    };
    load();
  }, []);

  const doctorName = loading ? "..." : (profile?.full_name || (lang === "ar" ? "طبيب" : "Médecin"));
  const avatarLetter = loading ? "🩺" : (profile?.full_name?.replace(/^(د\.\s*|dr\.\s*)/i, "").trim()?.[0] || "🩺");

  return (
    <div key={lang} className="w-full px-5 pt-8 pb-32 min-h-full" dir={lang === "ar" ? "rtl" : "ltr"}>
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

      {/* Main Glass Card (Pending Stats) */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
        className="relative rounded-[2rem] mb-8 p-6 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 shadow-xl shadow-blue-500/20 overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/20 blur-2xl rounded-full translate-x-10 -translate-y-10"></div>
        <div className="absolute left-0 bottom-0 w-24 h-24 bg-cyan-400/40 blur-xl rounded-full -translate-x-5 translate-y-5"></div>
        
        <div className="relative z-10 flex flex-col text-white">
          <div className="flex items-center gap-2 mb-4 bg-black/10 w-fit px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
            <div className="w-2 h-2 bg-rose-400 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold">{stats.emergencyCases} {t("waiting")}</span>
          </div>
          <h3 className="text-3xl font-black mb-1 drop-shadow-md">{t("emergencyCases")}</h3>
          <p className="text-sm text-blue-50 mb-6 font-medium">{t("emergencyDesc")}</p>
          
          <div className="flex gap-3">
             <Link href="/requests" className="flex-1">
                <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 rounded-xl h-12 font-black shadow-lg">{t("reviewCases")}</Button>
             </Link>
          </div>
        </div>
      </motion.div>

      {/* Grid Menu Stats */}
      <div className="flex justify-between items-end mb-4 px-1">
        <h3 className="font-black text-slate-800 text-lg">{t("overviewToday")}</h3>
      </div>
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 gap-4 mb-8"
      >
        <QuickStat icon={<Users />} title={t("todayPatients")} value={loading ? "..." : stats.todayPatients} color="from-indigo-500 to-blue-400" />
        <QuickStat icon={<Calendar />} title={t("upcomingAppointments")} value={loading ? "..." : stats.upcomingAppts} color="from-teal-500 to-cyan-400" />
        <QuickStat icon={<FileText />} title={t("completedPrescriptions")} value={loading ? "..." : stats.prescriptions} color="from-purple-500 to-fuchsia-400" />
        <QuickStat icon={<Activity />} title={t("labResults")} value={loading ? "..." : stats.labResults} color="from-rose-500 to-orange-400" notification={stats.labResults > 0} />
      </motion.div>

      {/* Action Scan */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
         <div className="w-full glass-panel rounded-3xl p-5 flex items-center justify-between group cursor-pointer transition-colors">
            <div className="flex items-center gap-4">
               <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100/50 group-hover:scale-105 transition-transform">
                  <ScanBarcode className="w-6 h-6" />
               </div>
               <div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">{t("scanId")}</h4>
                  <p className="text-[10px] text-slate-500 font-medium">{t("scanIdDesc")}</p>
               </div>
            </div>
         </div>
      </motion.div>
    </div>
  );
}

function QuickStat({ title, icon, value, color, notification }: any) {
  return (
    <Card className="glass-panel relative overflow-hidden rounded-3xl border-0 min-h-[140px] flex items-center justify-center">
      {notification && <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white z-20 animate-pulse"></span>}
      <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2 relative z-10 w-full">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${color} text-white flex items-center justify-center shadow-md mb-1`}>
          {icon}
        </div>
        <div className="flex flex-col items-center">
           <h4 className="font-black text-slate-800 text-3xl">{value}</h4>
           <h5 className="font-bold text-slate-500 text-xs mt-0.5 leading-tight w-full truncate px-1">{title}</h5>
        </div>
      </CardContent>
    </Card>
  )
}
