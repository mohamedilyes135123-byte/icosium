"use client";

export const dynamic = 'force-dynamic';


import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  FlaskConical, CheckCircle2, Clock, UploadCloud, TestTube2,
  TrendingUp, Users, AlertCircle, Activity, ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function LabDashboard() {
  const supabase = createClient();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [stats, setStats] = useState({ pending: 0, processing: 0, completed: 0, total: 0 });
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [labProfile, setLabProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user));
  }, [supabase]);

  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);

    const [{ data: profile }, { data: requests }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", currentUser.id).single(),
      supabase.from("lab_requests")
        .select(`
          *,
          patient:profiles!lab_requests_patient_id_fkey(full_name, phone),
          doctor:profiles!lab_requests_doctor_id_fkey(full_name)
        `)
        .eq("lab_id", currentUser.id)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    setLabProfile(profile);
    const reqs = requests || [];
    setRecentRequests(reqs.slice(0, 5));
    setStats({
      pending:    reqs.filter(r => r.status === "PENDING").length,
      processing: reqs.filter(r => r.status === "PROCESSING").length,
      completed:  reqs.filter(r => r.status === "COMPLETED").length,
      total:      reqs.length,
    });
    setLoading(false);
  }, [supabase, currentUser]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "صباح الخير" : hour < 17 ? "مساء الخير" : "مساء النور";

  return (
    <div className="pb-32 w-full" dir="rtl">

      {/* Header */}
      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-cyan-600 font-semibold text-sm mb-1">{greeting} 👋</p>
            <h1 className="text-2xl font-black text-slate-800">
              {labProfile?.full_name || "مختبر التحاليل"}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {stats.pending > 0
                ? <span className="text-amber-600 font-bold">{stats.pending} طلب بانتظار المعالجة</span>
                : "لا توجد طلبات جديدة حالياً"}
            </p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold border ${
            (labProfile?.approval_status === "approved")
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-amber-50 text-amber-700 border-amber-200"
          }`}>
            <span className={`w-2 h-2 rounded-full ${labProfile?.approval_status === "approved" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
            {labProfile?.approval_status === "approved" ? "معتمد ✅" : "قيد المراجعة"}
          </div>
        </div>
      </motion.header>

      {/* Stats Grid */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "إجمالي الطلبات", value: stats.total, color: "from-cyan-500 to-teal-400", icon: <FlaskConical className="w-6 h-6" /> },
          { label: "بانتظار المعالجة", value: stats.pending, color: "from-amber-500 to-orange-400", icon: <Clock className="w-6 h-6" /> },
          { label: "جاري التحليل", value: stats.processing, color: "from-blue-500 to-indigo-400", icon: <Activity className="w-6 h-6" /> },
          { label: "مكتملة", value: stats.completed, color: "from-emerald-500 to-teal-400", icon: <CheckCircle2 className="w-6 h-6" /> },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            className={`rounded-3xl p-5 bg-gradient-to-br ${s.color} text-white shadow-xl relative overflow-hidden`}>
            <div className="absolute -left-4 -bottom-4 opacity-20">{s.icon}</div>
            <p className="text-3xl font-black mb-1">{loading ? "..." : s.value}</p>
            <p className="text-xs font-bold text-white/80">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent requests preview */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-black text-slate-800 text-lg">آخر الطلبات</h2>
          <Link href="/requests"
            className="flex items-center gap-1.5 text-cyan-600 text-sm font-bold hover:text-cyan-500">
            عرض الكل <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white/60 rounded-2xl animate-pulse" />)}
          </div>
        )}

        {!loading && recentRequests.length === 0 && (
          <div className="glass-panel flex flex-col items-center justify-center py-16 rounded-3xl">
            <FlaskConical className="w-14 h-14 text-cyan-100 mb-3" />
            <p className="text-slate-500 font-bold">لم تصل أي طلبات بعد</p>
            <p className="text-slate-400 text-sm mt-1">ستظهر هنا طلبات المرضى عند إرسالها لمختبركم</p>
          </div>
        )}

        <div className="space-y-3">
          {recentRequests.map((req, i) => (
            <motion.div key={req.id}
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0, transition: { delay: i * 0.05 } }}
              className="glass-panel rounded-2xl p-5 flex items-center gap-4">
              {/* Status dot */}
              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                req.status === "COMPLETED" ? "bg-emerald-500" :
                req.status === "PROCESSING" ? "bg-blue-400 animate-pulse" : "bg-amber-400"
              }`} />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 truncate">{req.patient?.full_name || "مريض"}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {req.doctor?.full_name && `طلب: ${req.doctor.full_name} · `}
                  {new Date(req.created_at).toLocaleString("ar-DZ", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <span className={`text-xs font-black px-3 py-1.5 rounded-xl flex-shrink-0 ${
                req.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" :
                req.status === "PROCESSING" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
              }`}>
                {req.status === "COMPLETED" ? "مكتمل" : req.status === "PROCESSING" ? "جاري" : "انتظار"}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick actions */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="mt-8">
        <h2 className="font-black text-slate-800 text-lg mb-4">إجراءات سريعة</h2>
        <div className="grid grid-cols-2 gap-4">
          <Link href="/requests"
            className="glass-panel flex items-center gap-3 p-5 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-600">
              <TestTube2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">إدارة الطلبات</p>
              <p className="text-xs text-slate-400 mt-0.5">{stats.pending} طلب جديد</p>
            </div>
          </Link>
          <Link href="/results"
            className="glass-panel flex items-center gap-3 p-5 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">النتائج المرفوعة</p>
              <p className="text-xs text-slate-400 mt-0.5">{stats.completed} مكتملة</p>
            </div>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
