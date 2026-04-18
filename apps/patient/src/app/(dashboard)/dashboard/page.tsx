"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Stethoscope, Pill, FlaskConical, Bell, HeartPulse,
  ChevronRight, Activity, Clock, CheckCircle, AlertCircle,
  TrendingUp, Thermometer, ArrowLeft
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function PatientDashboard() {
  const supabase = createClient();
  const [profile, setProfile]     = useState<any>(null);
  const [stats, setStats]         = useState({ requests: 0, prescriptions: 0, labResults: 0, unread: 0 });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [latestVital, setLatestVital]       = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [
      { data: prof },
      { data: requests },
      { data: prescriptions },
      { data: labResults },
      { data: notifications },
      { data: vitals },
    ] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("medical_requests").select("id,status,created_at,type,symptoms")
        .eq("patient_id", user.id).order("created_at", { ascending: false }).limit(5),
      supabase.from("prescriptions").select("id,created_at,medications,doctor:profiles!prescriptions_doctor_id_fkey(full_name)")
        .eq("patient_id", user.id).order("created_at", { ascending: false }).limit(3),
      supabase.from("lab_results").select("id,uploaded_at,result_notes")
        .eq("patient_id", user.id).order("uploaded_at", { ascending: false }).limit(3),
      supabase.from("notifications").select("id,is_read").eq("user_id", user.id).eq("is_read", false),
      supabase.from("vitals").select("*").eq("patient_id", user.id)
        .order("created_at", { ascending: false }).limit(1),
    ]);

    setProfile(prof);
    setStats({
      requests:      (requests || []).length,
      prescriptions: (prescriptions || []).length,
      labResults:    (labResults || []).length,
      unread:        (notifications || []).length,
    });

    // Build activity feed
    const activity: any[] = [
      ...(requests || []).map((r: any) => ({ ...r, _kind: "request" })),
      ...(prescriptions || []).map((p: any) => ({ ...p, created_at: p.created_at, _kind: "prescription" })),
      ...(labResults || []).map((l: any) => ({ ...l, created_at: l.uploaded_at, _kind: "lab" })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6);

    setRecentActivity(activity);
    setLatestVital((vitals || [])[0] || null);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "صباح الخير ☀️" : hour < 17 ? "مساء الخير 🌤️" : "مساء النور 🌙";
  const firstName = profile?.full_name?.split(" ")[0] || "مريض";

  const vitalLabel: Record<string, string> = {
    blood_sugar: "سكر الدم", blood_pressure: "ضغط الدم",
    weight: "الوزن", oximetry: "تشبع O₂",
  };
  const vitalUnit: Record<string, string> = {
    blood_sugar: "mg/dL", blood_pressure: "mmHg", weight: "kg", oximetry: "%",
  };

  return (
    <div className="w-full pb-32" dir="rtl">

      {/* ── Header ── */}
      <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="flex justify-between items-center mb-7">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[2px] shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-emerald-600 font-bold text-lg">
              {firstName[0]}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-emerald-600/80 mb-0.5">{greeting}</p>
            <h1 className="text-xl font-bold text-slate-800 leading-none">{firstName}</h1>
          </div>
        </div>
        <Link href="/notifications" className="w-10 h-10 bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center text-slate-600 shadow-sm border border-white/80 relative">
          <Bell className="w-5 h-5" />
          {stats.unread > 0 && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white" />
          )}
        </Link>
      </motion.header>

      {/* ── Hero Card ── */}
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="relative rounded-3xl mb-7 overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white shadow-2xl shadow-emerald-500/20">
        <div className="absolute -left-4 -bottom-4 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
        <HeartPulse className="absolute -right-4 -bottom-4 w-28 h-28 text-emerald-400/10" strokeWidth={1} />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-emerald-200">منصة عناية — رعايتك في يدك</span>
          </div>
          <h2 className="text-xl font-black mb-1">ملفك الصحي محمي وآمن</h2>
          <p className="text-sm text-emerald-100/80 mb-5 leading-snug">
            كل طلباتك، وصفاتك، ونتائج تحاليلك في مكان واحد.
          </p>
          <Link href="/requests"
            className="inline-flex items-center gap-2 text-sm font-bold bg-white/15 hover:bg-white/25 transition-all px-5 py-2.5 rounded-2xl border border-white/20">
            طلب استشارة طبية
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>
      </motion.div>

      {/* ── Stats row ── */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-3 gap-3 mb-7">
        {[
          { label: "طلباتي", value: stats.requests, icon: <Activity className="w-5 h-5" />, href: "/requests", color: "text-blue-600 bg-blue-50" },
          { label: "وصفاتي", value: stats.prescriptions, icon: <Pill className="w-5 h-5" />, href: "/results", color: "text-purple-600 bg-purple-50" },
          { label: "تحاليلي", value: stats.labResults, icon: <FlaskConical className="w-5 h-5" />, href: "/results", color: "text-cyan-600 bg-cyan-50" },
        ].map((s, i) => (
          <Link key={s.label} href={s.href}>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.25 + i * 0.05 } }}
              className="bg-white/80 backdrop-blur-xl border border-white rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-all">
              <div className={`w-9 h-9 mx-auto rounded-xl flex items-center justify-center mb-2 ${s.color}`}>
                {s.icon}
              </div>
              <p className="text-2xl font-black text-slate-800">{loading ? "—" : s.value}</p>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">{s.label}</p>
            </motion.div>
          </Link>
        ))}
      </motion.div>

      {/* ── Latest vital reading ── */}
      {latestVital && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <Link href="/vitals">
            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-2xl p-5 mb-7 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0">
                <Thermometer className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-400 mb-0.5">آخر قياس — {vitalLabel[latestVital.type]}</p>
                <p className="text-2xl font-black text-slate-800">
                  {latestVital.value1}
                  {latestVital.value2 && <span className="text-slate-400 text-lg"> / {latestVital.value2}</span>}
                  <span className="text-sm font-normal text-slate-400 mr-1">{vitalUnit[latestVital.type]}</span>
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 rtl:rotate-180 flex-shrink-0" />
            </div>
          </Link>
        </motion.div>
      )}

      {/* ── Recent Activity ── */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black text-slate-800">آخر النشاطات</h3>
          <Link href="/requests" className="text-emerald-600 text-xs font-bold bg-emerald-50 px-3 py-1 rounded-lg">
            عرض الكل
          </Link>
        </div>

        {loading && (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-white/60 rounded-2xl animate-pulse" />)}
          </div>
        )}

        {!loading && recentActivity.length === 0 && (
          <div className="flex flex-col items-center py-12 bg-white/60 border border-white rounded-2xl">
            <Activity className="w-12 h-12 text-slate-200 mb-3" />
            <p className="text-slate-500 font-bold text-sm">لا يوجد نشاط بعد</p>
            <Link href="/requests"
              className="mt-3 px-5 py-2 bg-emerald-500 text-white text-xs font-bold rounded-xl">
              ابدأ بطلب استشارة
            </Link>
          </div>
        )}

        <div className="space-y-3">
          {recentActivity.map((item, i) => (
            <motion.div key={`${item._kind}-${item.id}`}
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0, transition: { delay: i * 0.04 } }}
              className="bg-white/80 backdrop-blur-xl border border-white rounded-2xl p-4 flex items-center gap-4 shadow-sm">

              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                item._kind === "prescription" ? "bg-purple-100 text-purple-600" :
                item._kind === "lab"         ? "bg-cyan-100 text-cyan-600" :
                                               "bg-blue-100 text-blue-600"
              }`}>
                {item._kind === "prescription" ? <Pill className="w-5 h-5" /> :
                 item._kind === "lab"          ? <FlaskConical className="w-5 h-5" /> :
                                                 <Stethoscope className="w-5 h-5" />}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 text-sm truncate">
                  {item._kind === "prescription"
                    ? `وصفة — ${item.doctor?.full_name || "طبيب"}`
                    : item._kind === "lab"
                    ? "نتائج تحاليل جاهزة"
                    : item.symptoms?.slice(0, 40) || "طلب طبي جديد"}
                </p>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" />
                  {new Date(item.created_at).toLocaleDateString("ar-DZ", { day:"2-digit", month:"short" })}
                </p>
              </div>

              <span className={`text-[10px] font-black px-2.5 py-1 rounded-xl flex-shrink-0 ${
                item._kind === "lab" ? "bg-emerald-100 text-emerald-700" :
                item.status === "APPROVED" || item.status === "MODIFIED"
                  ? "bg-emerald-100 text-emerald-700"
                  : item.status === "REJECTED"
                  ? "bg-rose-100 text-rose-700"
                  : "bg-amber-100 text-amber-700"
              }`}>
                {item._kind === "lab" ? "✅ جاهزة" :
                 item._kind === "prescription" ? "💊 وصفة" :
                 item.status === "APPROVED" ? "✅ مقبول" :
                 item.status === "REJECTED" ? "❌ مرفوض" : "⏳ انتظار"}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
