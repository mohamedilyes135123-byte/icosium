"use client";

export const dynamic = 'force-dynamic';


import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  ShieldCheck, XCircle, Clock, CheckCircle, User,
  Stethoscope, FlaskConical, Pill, FileText, Eye,
  ChevronDown, ChevronUp, Phone, MapPin, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Profile {
  id: string; full_name: string; role: string;
  approval_status: string; created_at: string;
  specialty?: string; address?: string; phone?: string;
  national_id?: string; medical_license?: string;
  subscription_plan?: string;
}

const ROLE_LABELS: Record<string, string> = {
  doctor: "طبيب", lab: "مختبر", pharmacy: "صيدلية",
};
const ROLE_COLORS: Record<string, string> = {
  doctor:   "from-blue-500 to-indigo-400",
  lab:      "from-cyan-500 to-teal-400",
  pharmacy: "from-purple-500 to-fuchsia-400",
};
const ROLE_BG: Record<string, string> = {
  doctor:   "bg-blue-50 text-blue-700 border-blue-200",
  lab:      "bg-cyan-50 text-cyan-700 border-cyan-200",
  pharmacy: "bg-purple-50 text-purple-700 border-purple-200",
};
const ROLE_ICON_SRC: Record<string, string> = {
  doctor:   "/icon_role_doctor.png",
  lab:      "/icon_role_lab.png",
  pharmacy: "/icon_role_pharmacy.png",
};
const STATUS_ICON_SRC: Record<string, string> = {
  approved: "/icon_status_approved.png",
  rejected: "/icon_status_rejected.png",
  pending:  "/icon_status_pending.png",
};
const STATUS_LABEL: Record<string, string> = {
  approved: "معتمد",
  rejected: "مرفوض",
  pending:  "انتظار",
};
const STATUS_STYLE: Record<string, string> = {
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
  pending:  "bg-amber-50 text-amber-700 border-amber-200",
};

type FilterStatus = "pending" | "approved" | "rejected" | "all";

export default function AdminApprovals() {
  const supabase = createClient();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filter, setFilter] = useState<FilterStatus>("pending");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [detailModal, setDetailModal] = useState<Profile | null>(null);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("id,full_name,role,approval_status,created_at,specialty,address,phone,national_id,medical_license,subscription_plan")
      .neq("role", "patient")
      .order("created_at", { ascending: false });
    setProfiles(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchProfiles();
    const channel = supabase.channel("approvals-rt")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles" }, fetchProfiles)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase, fetchProfiles]);

  const updateStatus = async (id: string, status: string) => {
    setActioning(id);
    await supabase.from("profiles").update({ approval_status: status }).eq("id", id);
    // Log it
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("audit_log").insert([{
        action: status === "approved" ? "ACCOUNT_APPROVED" : "ACCOUNT_REJECTED",
        actor_id: user.id, actor_role: "admin",
        actor_name: "مدير النظام", target_id: id,
        details: `تم ${status === "approved" ? "اعتماد" : "رفض"} الحساب`,
        status: "SUCCESS",
      }]);
    }
    fetchProfiles();
    setActioning(null);
  };

  const filteredProfiles = profiles.filter(p => {
    const matchStatus = filter === "all" || p.approval_status === filter;
    const matchRole   = roleFilter === "all" || p.role === roleFilter;
    return matchStatus && matchRole;
  });

  const counts = {
    pending:  profiles.filter(p => p.approval_status === "pending").length,
    approved: profiles.filter(p => p.approval_status === "approved").length,
    rejected: profiles.filter(p => p.approval_status === "rejected").length,
    all:      profiles.length,
  };

  return (
    <div className="pb-32 w-full" dir="rtl">

      {/* Header */}
      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-black text-slate-800 mb-1">اعتماد الحسابات المهنية</h1>
        <p className="text-slate-400 text-sm">مراجعة وقبول أو رفض طلبات أطباء / مختبرات / صيدليات</p>
      </motion.header>

      {/* Status filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {(["pending","approved","rejected","all"] as FilterStatus[]).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all ${
              filter === f
                ? "bg-gradient-to-l from-indigo-600 to-violet-600 text-white"
                : "bg-white text-slate-700 border border-slate-300 hover:border-indigo-400"
            }`}>
            {f === "pending" ? (
              <span className="flex items-center gap-1"><img src="/icon_status_pending.png" className="w-4 h-4 object-contain" alt="" /> انتظار</span>
            ) : f === "approved" ? (
              <span className="flex items-center gap-1"><img src="/icon_status_approved.png" className="w-4 h-4 object-contain" alt="" /> معتمد</span>
            ) : f === "rejected" ? (
              <span className="flex items-center gap-1"><img src="/icon_status_rejected.png" className="w-4 h-4 object-contain" alt="" /> مرفوض</span>
            ) : "الكل"}
            <span className={`mr-2 text-xs px-2 py-0.5 rounded-full font-black ${
              filter === f ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
            }`}>
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {/* Role filter */}
      <div className="flex gap-2 mb-6">
        {["all","doctor","lab","pharmacy"].map(r => (
          <button key={r} onClick={() => setRoleFilter(r)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              roleFilter === r
                ? `bg-gradient-to-l ${r !== "all" ? ROLE_COLORS[r] : "from-slate-700 to-slate-600"} text-white`
                : "bg-white text-slate-700 border border-slate-300 hover:border-indigo-400"
            }`}>
            {r === "all" ? "كل الأدوار" : ROLE_LABELS[r]}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3].map(i => <div key={i} className="h-48 bg-white/60 rounded-3xl animate-pulse" />)}
        </div>
      )}

      {/* Empty */}
      {!loading && filteredProfiles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-white/60 border border-white rounded-3xl">
          <ShieldCheck className="w-16 h-16 text-slate-200 mb-4" />
          <p className="font-bold text-slate-500">لا توجد حسابات في هذه الفئة</p>
        </div>
      )}

      {/* Profile cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence>
          {filteredProfiles.map((p, i) => (
            <motion.div key={p.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/90 backdrop-blur-xl border border-white rounded-3xl shadow-xl shadow-indigo-500/5 overflow-hidden">

              {/* Role color top bar */}
              <div className={`h-1.5 w-full bg-gradient-to-l ${ROLE_COLORS[p.role] || "from-slate-400 to-slate-300"}`} />

              <div className="p-6">
                {/* Profile header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white border-2 ${
                      p.role === 'doctor' ? 'border-blue-100' : p.role === 'lab' ? 'border-cyan-100' : 'border-purple-100'
                    } shadow-md`}>
                      <img src={ROLE_ICON_SRC[p.role] || "/icon_role_patient.png"} className="w-8 h-8 object-contain" alt={ROLE_LABELS[p.role]} />
                    </div>
                    <div>
                      <p className="font-black text-slate-800 text-sm">{p.full_name}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ROLE_BG[p.role]}`}>
                        {ROLE_LABELS[p.role]}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-xl border ${STATUS_STYLE[p.approval_status] || STATUS_STYLE.pending}`}>
                      <img src={STATUS_ICON_SRC[p.approval_status] || STATUS_ICON_SRC.pending} className="w-4 h-4 object-contain" alt="" />
                      {STATUS_LABEL[p.approval_status] || "انتظار"}
                    </span>
                    <button onClick={() => setDetailModal(p)}
                      className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg hover:bg-indigo-100 transition-colors">
                      <Eye className="w-3 h-3" /> مراجعة الملف
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-1.5 mb-4">
                  {p.specialty && (
                    <p className="text-xs text-slate-600 flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-slate-400" /> {p.specialty}
                    </p>
                  )}
                  {p.phone && (
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {p.phone}
                    </p>
                  )}
                  {p.address && (
                    <p className="text-xs text-slate-500 flex items-center gap-2 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" /> {p.address}
                    </p>
                  )}
                  <p className="text-xs text-slate-400">
                    تسجيل: {new Date(p.created_at).toLocaleDateString("ar-DZ")}
                  </p>
                </div>

                {/* Expandable details */}
                {(p.national_id || p.medical_license) && (
                  <div className="mb-4">
                    <button onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                      className="flex items-center gap-1.5 text-xs text-indigo-600 font-bold hover:underline">
                      <Eye className="w-3.5 h-3.5" />
                      {expanded === p.id ? "إخفاء التفاصيل" : "عرض التفاصيل"}
                      {expanded === p.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    <AnimatePresence>
                      {expanded === p.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden">
                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mt-2 space-y-1.5 text-xs font-mono">
                            {p.national_id && <p><span className="text-slate-500">رقم الهوية:</span> <span className="font-bold text-slate-800">{p.national_id}</span></p>}
                            {p.medical_license && <p><span className="text-slate-500">رقم النقابة:</span> <span className="font-bold text-slate-800">{p.medical_license}</span></p>}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Actions */}
                {p.approval_status === "pending" && (
                  <div className="flex gap-2">
                    <button onClick={() => updateStatus(p.id, "approved")} disabled={actioning === p.id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-l from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold disabled:opacity-50 transition-all">
                      <img src="/icon_status_approved.png" className="w-4 h-4 object-contain" alt="" />
                      {actioning === p.id ? "..." : "اعتماد الحساب"}
                    </button>
                    <button onClick={() => updateStatus(p.id, "rejected")} disabled={actioning === p.id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white text-rose-600 border-2 border-rose-200 hover:bg-rose-50 text-xs font-bold disabled:opacity-50 transition-all">
                      <img src="/icon_status_rejected.png" className="w-4 h-4 object-contain" alt="" />
                      رفض
                    </button>
                  </div>
                )}
                {p.approval_status === "approved" && (
                  <button onClick={() => updateStatus(p.id, "rejected")} disabled={actioning === p.id}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-l from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white text-xs font-bold disabled:opacity-50 transition-all">
                    إلغاء الاعتماد (رفض)
                  </button>
                )}
                {p.approval_status === "rejected" && (
                  <button onClick={() => updateStatus(p.id, "approved")} disabled={actioning === p.id}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-l from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold disabled:opacity-50 transition-all">
                    اعتماد الحساب
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Profile Detail Modal */}
      <AnimatePresence>
        {detailModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDetailModal(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className={`h-2 w-full bg-gradient-to-l ${ROLE_COLORS[detailModal.role] || "from-slate-400 to-slate-300"}`} />
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-black text-slate-800">{detailModal.full_name}</h3>
                    <p className="text-sm font-bold text-slate-500 mt-1">{ROLE_LABELS[detailModal.role]} {detailModal.specialty ? `— ${detailModal.specialty}` : ""}</p>
                  </div>
                  <button onClick={() => setDetailModal(null)} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-6 text-sm">
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">تاريخ التسجيل</span>
                    <span className="font-bold text-slate-700">{new Date(detailModal.created_at).toLocaleDateString("ar-DZ")}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">رقم الهاتف</span>
                    <span className="font-bold text-slate-700">{detailModal.phone || "غير متوفر"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">العنوان</span>
                    <span className="font-bold text-slate-700 text-left max-w-[200px] truncate">{detailModal.address || "غير متوفر"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">رقم الهوية الوطنية</span>
                    <span className="font-bold text-slate-700">{detailModal.national_id || "غير متوفر"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">الرقم المهني / النقابة</span>
                    <span className="font-bold text-slate-700">{detailModal.medical_license || "غير متوفر"}</span>
                  </div>
                </div>

                {detailModal.approval_status === "pending" && (
                  <div className="flex gap-3">
                    <button onClick={() => { updateStatus(detailModal.id, "approved"); setDetailModal(null); }} disabled={actioning === detailModal.id}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-l from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold disabled:opacity-50 transition-all">
                      <img src="/icon_status_approved.png" className="w-5 h-5 object-contain" alt="" />
                      اعتماد الحساب
                    </button>
                    <button onClick={() => { updateStatus(detailModal.id, "rejected"); setDetailModal(null); }} disabled={actioning === detailModal.id}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-rose-600 border-2 border-rose-200 hover:bg-rose-50 font-bold disabled:opacity-50 transition-all">
                      <img src="/icon_status_rejected.png" className="w-5 h-5 object-contain" alt="" />
                      رفض الحساب
                    </button>
                  </div>
                )}
                {detailModal.approval_status === "approved" && (
                  <button onClick={() => { updateStatus(detailModal.id, "rejected"); setDetailModal(null); }} disabled={actioning === detailModal.id}
                    className="w-full py-3 rounded-xl bg-gradient-to-l from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white font-bold disabled:opacity-50 transition-all">
                    إلغاء الاعتماد (رفض)
                  </button>
                )}
                {detailModal.approval_status === "rejected" && (
                  <button onClick={() => { updateStatus(detailModal.id, "approved"); setDetailModal(null); }} disabled={actioning === detailModal.id}
                    className="w-full py-3 rounded-xl bg-gradient-to-l from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold disabled:opacity-50 transition-all">
                    استعادة الحساب (اعتماد)
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
