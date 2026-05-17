"use client";

export const dynamic = 'force-dynamic';


import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  ShieldCheck, Ban, Users, Activity, Lock, AlertTriangle,
  Fingerprint, CheckCircle, XCircle, Clock, RefreshCw,
  Stethoscope, FlaskConical, Pill, User, Eye, TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Profile {
  id: string; full_name: string; role: string;
  approval_status: string; created_at: string;
  specialty?: string; address?: string; phone?: string;
  is_banned?: boolean;
}

interface AuditEntry {
  id: string; action: string; actor_id: string;
  actor_role: string; actor_name: string;
  target_id?: string; details?: string;
  created_at: string; ip_address?: string;
  status: "SUCCESS" | "BLOCKED" | "ENCRYPTED" | "WARNING";
}

const ROLE_LABELS: Record<string, string> = {
  doctor: "طبيب", lab: "مختبر", pharmacy: "صيدلية", patient: "مريض",
};

const ROLE_ICONS: Record<string, React.ReactNode> = {
  doctor:   <Stethoscope className="w-4 h-4" />,
  lab:      <FlaskConical className="w-4 h-4" />,
  pharmacy: <Pill className="w-4 h-4" />,
  patient:  <User className="w-4 h-4" />,
};

const ROLE_COLORS: Record<string, string> = {
  doctor:   "bg-blue-100 text-blue-700",
  lab:      "bg-cyan-100 text-cyan-700",
  pharmacy: "bg-purple-100 text-purple-700",
  patient:  "bg-emerald-100 text-emerald-700",
};

export default function AdminDashboard() {
  const supabase = createClient();
  const [pendingProfiles, setPendingProfiles] = useState<Profile[]>([]);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0, approvedDoctors: 0, approvedPharmacies: 0,
    approvedLabs: 0, pendingApprovals: 0, totalPatients: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "all" | "audit">("pending");
  const [filterRole, setFilterRole] = useState("all");
  const auditRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [{ data: profiles }, { data: audit }] = await Promise.all([
      supabase.from("profiles")
        .select("id,full_name,role,approval_status,created_at,specialty,address,phone,is_banned")
        .order("created_at", { ascending: false }),
      supabase.from("audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    const p = profiles || [];
    setPendingProfiles(p.filter(x => x.approval_status === "pending" && x.role !== "patient"));
    setAllProfiles(p);
    setAuditLog(audit || []);

    setStats({
      totalUsers:       p.length,
      approvedDoctors:  p.filter(x => x.role === "doctor"   && x.approval_status === "approved").length,
      approvedPharmacies: p.filter(x => x.role === "pharmacy" && x.approval_status === "approved").length,
      approvedLabs:     p.filter(x => x.role === "lab"      && x.approval_status === "approved").length,
      pendingApprovals: p.filter(x => x.approval_status === "pending" && x.role !== "patient").length,
      totalPatients:    p.filter(x => x.role === "patient").length,
    });
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
    const channel = supabase.channel("admin-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, fetchData)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase, fetchData]);

  const approve = async (id: string) => {
    setActioning(id);
    await supabase.from("profiles").update({ approval_status: "approved" }).eq("id", id);
    await logAudit("ACCOUNT_APPROVED", id, "تم اعتماد الحساب");
    fetchData(); setActioning(null);
  };

  const reject = async (id: string) => {
    setActioning(id);
    await supabase.from("profiles").update({ approval_status: "rejected" }).eq("id", id);
    await logAudit("ACCOUNT_REJECTED", id, "تم رفض الحساب");
    fetchData(); setActioning(null);
  };

  const toggleBan = async (id: string, currentBan: boolean) => {
    setActioning(id);
    await supabase.from("profiles").update({ is_banned: !currentBan }).eq("id", id);
    await logAudit(currentBan ? "ACCOUNT_UNBANNED" : "ACCOUNT_BANNED", id, currentBan ? "رُفع الحظر" : "تم حظر الحساب");
    fetchData(); setActioning(null);
  };

  const logAudit = async (action: string, targetId: string, details: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("audit_log").insert([{
      action, actor_id: user.id, actor_role: "admin",
      actor_name: "مدير النظام", target_id: targetId,
      details, status: "SUCCESS",
    }]);
  };

  const filteredProfiles = filterRole === "all"
    ? allProfiles
    : allProfiles.filter(p => p.role === filterRole);

  const statusColor = (s: string) =>
    s === "approved" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
    s === "rejected" ? "bg-rose-100 text-rose-700 border-rose-200" :
    "bg-amber-100 text-amber-700 border-amber-200";

  const auditStatusStyle = (s: string) =>
    s === "BLOCKED"   ? "bg-rose-100 text-rose-700 border-rose-200" :
    s === "WARNING"   ? "bg-amber-100 text-amber-700 border-amber-200" :
    s === "ENCRYPTED" ? "bg-indigo-100 text-indigo-700 border-indigo-200" :
    "bg-emerald-100 text-emerald-700 border-emerald-200";

  return (
    <div className="pb-32 w-full" dir="rtl">

      {/* ── Header ── */}
      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-black text-slate-800">مركز الإدارة والمراقبة</h1>
            <span className="flex items-center gap-1.5 bg-indigo-100 text-indigo-600 text-xs font-black px-3 py-1 rounded-full border border-indigo-200">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
              LIVE
            </span>
          </div>
          <p className="text-slate-400 text-sm">منصة عناية — إدارة شاملة بصلاحيات كاملة</p>
        </div>
        <button onClick={fetchData} disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-600 border border-slate-200 rounded-2xl bg-white hover:bg-slate-50 transition-all">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-500" : ""}`} />
          تحديث
        </button>
      </motion.header>

      {/* ── Stats ── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: "إجمالي المستخدمين", value: stats.totalUsers,       color: "from-slate-600 to-slate-500",     icon: <Users /> },
          { label: "المرضى",            value: stats.totalPatients,    color: "from-emerald-500 to-teal-400",    icon: <User /> },
          { label: "أطباء معتمدون",     value: stats.approvedDoctors,  color: "from-blue-500 to-indigo-400",     icon: <Stethoscope /> },
          { label: "صيدليات معتمدة",    value: stats.approvedPharmacies, color: "from-purple-500 to-fuchsia-400", icon: <Pill /> },
          { label: "مختبرات معتمدة",    value: stats.approvedLabs,     color: "from-cyan-500 to-teal-400",       icon: <FlaskConical /> },
          { label: "بانتظار الاعتماد",  value: stats.pendingApprovals, color: "from-amber-500 to-orange-400",    icon: <Clock /> },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.04 }}
            className={`rounded-3xl p-4 bg-gradient-to-br ${s.color} text-white shadow-lg relative overflow-hidden`}>
            <div className="absolute -right-3 -top-3 opacity-20 w-12 h-12">{s.icon}</div>
            <p className="text-2xl font-black mb-1">{loading ? "—" : s.value}</p>
            <p className="text-[10px] font-bold text-white/80 leading-tight">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Tabs ── */}
      <div className="flex gap-2 mb-6 bg-slate-100/80 p-1.5 rounded-2xl w-fit">
        {[
          { key: "pending", label: "طلبات الاعتماد", count: stats.pendingApprovals },
          { key: "all",     label: "جميع المستخدمين", count: stats.totalUsers },
          { key: "audit",   label: "سجل التدقيق",    count: auditLog.length },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key as any)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === t.key ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}>
            {t.label}
            {t.count > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-black ${
                activeTab === t.key ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-500"
              }`}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════ */}
      {/* TAB: Pending approvals */}
      {/* ══════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        {activeTab === "pending" && (
          <motion.div key="pending" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {!loading && pendingProfiles.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 bg-white/60 border border-white rounded-3xl">
                <CheckCircle className="w-16 h-16 text-emerald-200 mb-4" />
                <p className="font-bold text-slate-500">لا توجد طلبات بانتظار الاعتماد</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {pendingProfiles.map((p, i) => (
                <motion.div key={p.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
                  className="bg-white/90 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-xl shadow-indigo-500/5">

                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${ROLE_COLORS[p.role] || "bg-slate-100"}`}>
                        {ROLE_ICONS[p.role] || <User className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-black text-slate-800">{p.full_name}</p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ROLE_COLORS[p.role]}`}>
                          {ROLE_LABELS[p.role] || p.role}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(p.created_at).toLocaleDateString("ar-DZ")}
                    </span>
                  </div>

                  {p.specialty && (
                    <p className="text-sm text-slate-600 mb-2"><span className="font-bold">التخصص:</span> {p.specialty}</p>
                  )}
                  {p.address && (
                    <p className="text-xs text-slate-400 mb-3">📍 {p.address}</p>
                  )}

                  <div className="flex gap-2 mt-4">
                    <button onClick={() => approve(p.id)} disabled={actioning === p.id}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold disabled:opacity-50 transition-colors">
                      <CheckCircle className="w-4 h-4" />
                      {actioning === p.id ? "..." : "اعتماد"}
                    </button>
                    <button onClick={() => reject(p.id)} disabled={actioning === p.id}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-sm font-bold disabled:opacity-50 transition-colors">
                      <XCircle className="w-4 h-4" />
                      رفض
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════ */}
        {/* TAB: All users */}
        {/* ══════════════════════════════════════════════ */}
        {activeTab === "all" && (
          <motion.div key="all" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Role filter */}
            <div className="flex gap-2 mb-5 flex-wrap">
              {["all", "doctor", "pharmacy", "lab", "patient"].map(role => (
                <button key={role} onClick={() => setFilterRole(role)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    filterRole === role ? "bg-indigo-600 text-white border-transparent" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                  }`}>
                  {role === "all" ? "الكل" : ROLE_LABELS[role]}
                </button>
              ))}
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl overflow-hidden shadow-xl">
              {/* Table header */}
              <div className="grid grid-cols-12 px-5 py-3 bg-slate-50 border-b border-slate-100 text-xs font-black text-slate-500 gap-3">
                <div className="col-span-4">المستخدم</div>
                <div className="col-span-2">الدور</div>
                <div className="col-span-3">الحالة</div>
                <div className="col-span-3">إجراء</div>
              </div>
              <div className="divide-y divide-slate-50">
                {filteredProfiles.slice(0, 30).map(p => (
                  <div key={p.id} className="grid grid-cols-12 px-5 py-4 items-center gap-3 hover:bg-slate-50/50 transition-colors">
                    <div className="col-span-4">
                      <p className="font-bold text-slate-800 text-sm truncate">{p.full_name}</p>
                      {p.specialty && <p className="text-xs text-slate-400 truncate">{p.specialty}</p>}
                    </div>
                    <div className="col-span-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${ROLE_COLORS[p.role] || "bg-slate-100 text-slate-600"}`}>
                        {ROLE_LABELS[p.role] || p.role}
                      </span>
                    </div>
                    <div className="col-span-3">
                      {p.is_banned ? (
                        <span className="text-xs font-black px-2 py-1 rounded-lg bg-rose-100 text-rose-700 border border-rose-200">🚫 محظور</span>
                      ) : (
                        <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${statusColor(p.approval_status)}`}>
                          {p.approval_status === "approved" ? "✅ معتمد" :
                           p.approval_status === "rejected" ? "❌ مرفوض" : "⏳ انتظار"}
                        </span>
                      )}
                    </div>
                    <div className="col-span-3 flex gap-2">
                      {p.role !== "patient" && p.approval_status === "pending" && (
                        <button onClick={() => approve(p.id)} disabled={actioning === p.id}
                          className="text-xs px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 font-bold hover:bg-emerald-200 transition-colors">
                          اعتماد
                        </button>
                      )}
                      {p.role !== "patient" && (
                        <button onClick={() => toggleBan(p.id, !!p.is_banned)} disabled={actioning === p.id}
                          className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors ${
                            p.is_banned ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-rose-100 text-rose-700 hover:bg-rose-200"
                          }`}>
                          {p.is_banned ? "رفع الحظر" : "حظر"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════ */}
        {/* TAB: Audit log */}
        {/* ══════════════════════════════════════════════ */}
        {activeTab === "audit" && (
          <motion.div key="audit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            ref={auditRef}>

            {auditLog.length === 0 && (
              <div className="bg-slate-900 rounded-3xl p-8 font-mono text-emerald-400 text-sm">
                <p className="opacity-60">// No audit entries yet</p>
                <p className="opacity-60">// Actions will be logged here in real time</p>
                <span className="animate-pulse">_</span>
              </div>
            )}

            <div className="bg-slate-900 rounded-3xl p-6 space-y-3 font-mono max-h-[600px] overflow-y-auto">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-700">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-400 text-xs font-bold">AUDIT TERMINAL — LIVE</span>
              </div>

              {auditLog.map((entry, i) => (
                <motion.div key={entry.id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0, transition: { delay: i * 0.02 } }}
                  className={`flex items-start justify-between p-4 rounded-2xl border ${
                    entry.status === "BLOCKED" ? "bg-rose-950/50 border-rose-800" :
                    entry.status === "WARNING" ? "bg-amber-950/40 border-amber-800/50" :
                    "bg-slate-800/50 border-slate-700/50"
                  }`}>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold mb-1 ${
                      entry.status === "BLOCKED" ? "text-rose-400" :
                      entry.status === "WARNING" ? "text-amber-400" : "text-emerald-400"
                    }`}>
                      {entry.action}
                    </p>
                    <div className="flex gap-3 text-xs text-slate-400">
                      <span>{entry.actor_name}</span>
                      {entry.ip_address && <><span className="opacity-40">|</span><span>{entry.ip_address}</span></>}
                      {entry.details && <><span className="opacity-40">|</span><span className="text-slate-300">{entry.details}</span></>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 ml-4 flex-shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-black border ${auditStatusStyle(entry.status)}`}>
                      {entry.status}
                    </span>
                    <p className="text-[10px] text-slate-500">
                      {new Date(entry.created_at).toLocaleTimeString("ar-DZ")}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
