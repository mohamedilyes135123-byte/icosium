"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  FlaskConical, CheckCircle2, Clock, UploadCloud,
  TestTube2, Activity, Package, TrendingUp, ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function LabDashboard() {
  const supabase = createClient();
  const [user, setUser]       = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats]     = useState({ pending: 0, processing: 0, completed: 0, total: 0 });
  const [recent, setRecent]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, [supabase]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const [{ data: prof }, { data: reqs }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("lab_requests")
        .select(`id, status, created_at, tests_list,
          patient:profiles!lab_requests_patient_id_fkey(full_name),
          doctor:profiles!lab_requests_doctor_id_fkey(full_name)`)
        .eq("lab_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30),
    ]);

    setProfile(prof);
    const r = reqs || [];
    setStats({
      pending:    r.filter(x => x.status === "PENDING").length,
      processing: r.filter(x => x.status === "PROCESSING").length,
      completed:  r.filter(x => x.status === "COMPLETED").length,
      total:      r.length,
    });
    setRecent(r.slice(0, 5));
    setLoading(false);
  }, [supabase, user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "صباح الخير" : hour < 17 ? "مساء الخير" : "مساء النور";

  return (
    <div className="pb-32 w-full" dir="rtl">

      {/* Header */}
      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-start mb-8">
        <div>
          <p className="text-cyan-600 text-sm font-semibold mb-1">{greeting} 👋</p>
          <h1 className="text-2xl font-black text-slate-800">
            {loading ? "..." : profile?.full_name || "مختبر التحاليل"}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {stats.pending > 0
              ? <span className="text-amber-600 font-bold">{stats.pending} طلب بانتظار المعالجة</span>
              : "لا توجد طلبات جديدة"}
          </p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold border ${
          profile?.approval_status === "approved"
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : "bg-amber-50 text-amber-700 border-amber-200"
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            profile?.approval_status === "approved" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
          }`} />
          {profile?.approval_status === "approved" ? "معتمد ✅" : "قيد المراجعة"}
        </div>
      </motion.header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "الإجمالي",        value: stats.total,      color: "from-cyan-500 to-teal-400",     icon: <FlaskConical className="w-6 h-6" /> },
          { label: "انتظار",          value: stats.pending,    color: "from-amber-500 to-orange-400",  icon: <Clock className="w-6 h-6" /> },
          { label: "جاري التحليل",    value: stats.processing, color: "from-blue-500 to-indigo-400",   icon: <Activity className="w-6 h-6" /> },
          { label: "مكتملة",          value: stats.completed,  color: "from-emerald-500 to-teal-400",  icon: <CheckCircle2 className="w-6 h-6" /> },
        ].map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1, transition: { delay: 0.1 + i * 0.05 } }}
            className={`rounded-3xl p-5 bg-gradient-to-br ${s.color} text-white shadow-xl relative overflow-hidden`}>
            <div className="absolute -left-3 -bottom-3 opacity-20 w-12 h-12">{s.icon}</div>
            <p className="text-3xl font-black mb-1">{loading ? "—" : s.value}</p>
            <p className="text-xs font-bold text-white/80">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent requests */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-black text-slate-800">آخر الطلبات</h2>
          <Link href="/lab/requests"
            className="flex items-center gap-1 text-cyan-600 text-sm font-bold hover:text-cyan-500">
            عرض الكل <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>

        {loading && <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-white/60 rounded-2xl animate-pulse" />)}</div>}

        {!loading && recent.length === 0 && (
          <div className="flex flex-col items-center py-16 bg-white/60 backdrop-blur-xl border border-white rounded-3xl">
            <FlaskConical className="w-14 h-14 text-cyan-100 mb-3" />
            <p className="text-slate-500 font-bold">لا توجد طلبات بعد</p>
          </div>
        )}

        <div className="space-y-3">
          {recent.map((req, i) => (
            <motion.div key={req.id}
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0, transition: { delay: i * 0.05 } }}
              className="bg-white/80 backdrop-blur-xl border border-white rounded-2xl p-5 flex items-center gap-4 shadow-sm">
              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                req.status === "COMPLETED"  ? "bg-emerald-500" :
                req.status === "PROCESSING" ? "bg-blue-400 animate-pulse" : "bg-amber-400"
              }`} />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 truncate">{req.patient?.full_name}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {req.tests_list?.length} تحليل
                  {req.doctor?.full_name && ` · ${req.doctor.full_name}`}
                </p>
              </div>
              <span className={`text-xs font-black px-3 py-1.5 rounded-xl flex-shrink-0 ${
                req.status === "COMPLETED"  ? "bg-emerald-100 text-emerald-700" :
                req.status === "PROCESSING" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
              }`}>
                {req.status === "COMPLETED" ? "مكتمل" : req.status === "PROCESSING" ? "جاري" : "انتظار"}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick actions */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        className="mt-8 grid grid-cols-2 gap-4">
        <Link href="/lab/requests"
          className="flex items-center gap-3 p-5 bg-white/80 backdrop-blur-xl border border-white rounded-2xl shadow-sm hover:border-cyan-200 transition-all">
          <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-600">
            <TestTube2 className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm">الطلبات</p>
            <p className="text-xs text-slate-400">{stats.pending} جديد</p>
          </div>
        </Link>
        <Link href="/lab/results"
          className="flex items-center gap-3 p-5 bg-white/80 backdrop-blur-xl border border-white rounded-2xl shadow-sm hover:border-emerald-200 transition-all">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm">النتائج</p>
            <p className="text-xs text-slate-400">{stats.completed} مكتملة</p>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}
