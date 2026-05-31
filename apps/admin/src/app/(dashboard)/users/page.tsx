"use client";

export const dynamic = 'force-dynamic';


import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Search, Users, Stethoscope, FlaskConical, Pill, User,
  Ban, CheckCircle, XCircle, ChevronDown, Phone, MapPin,
  Calendar, Shield, RefreshCw, AlertTriangle, Plus, Trash2, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Profile {
  id: string; full_name: string; role: string;
  approval_status: string; created_at: string;
  specialty?: string; address?: string; phone?: string;
  is_banned?: boolean; subscription_plan?: string;
}

const ROLE_CONFIG: Record<string, { label: string; iconSrc: string; color: string; bg: string; border: string }> = {
  doctor:   { label: "طبيب",    iconSrc: "/icon_role_doctor.png",   color: "text-blue-700",    bg: "bg-blue-50",    border: "border-blue-100" },
  lab:      { label: "مختبر",   iconSrc: "/icon_role_lab.png",      color: "text-cyan-700",   bg: "bg-cyan-50",    border: "border-cyan-100" },
  pharmacy: { label: "صيدلية",  iconSrc: "/icon_role_pharmacy.png", color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-100" },
  patient:  { label: "مريض",   iconSrc: "/icon_role_patient.png",  color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100" },
  admin:    { label: "إدارة",   iconSrc: "/icon_role_admin.png",    color: "text-indigo-700", bg: "bg-indigo-50",  border: "border-indigo-100" },
};

const STATUS_CFG: Record<string, { src: string; label: string; style: string }> = {
  approved: { src: "/icon_status_approved.png", label: "معتمد",  style: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  rejected: { src: "/icon_status_rejected.png", label: "مرفوض",  style: "bg-rose-50 text-rose-700 border-rose-200" },
  pending:  { src: "/icon_status_pending.png",  label: "انتظار", style: "bg-amber-50 text-amber-700 border-amber-200" },
};

export default function AdminUsers() {
  const supabase = createClient();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [actioning, setActioning] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Modal and custom state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    address: "",
    specialty: "",
    role: "doctor" as "doctor" | "lab" | "pharmacy"
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("id,full_name,role,approval_status,created_at,specialty,address,phone,is_banned,subscription_plan")
      .order("created_at", { ascending: false });
    setProfiles(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchProfiles(); }, [fetchProfiles]);

  const logAction = async (action: string, targetId: string, details: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("audit_log").insert([{
      action, actor_id: user.id, actor_role: "admin",
      actor_name: "مدير النظام", target_id: targetId,
      details, status: "SUCCESS",
    }]);
  };

  const toggleBan = async (id: string, current: boolean) => {
    setActioning(id);
    await supabase.from("profiles").update({ is_banned: !current }).eq("id", id);
    await logAction(current ? "ACCOUNT_UNBANNED" : "ACCOUNT_BANNED", id, current ? "رُفع الحظر عن الحساب" : "تم حظر الحساب");
    fetchProfiles(); setActioning(null);
  };

  const updateApproval = async (id: string, status: string) => {
    setActioning(id);
    await supabase.from("profiles").update({ approval_status: status }).eq("id", id);
    await logAction(status === "approved" ? "ACCOUNT_APPROVED" : "ACCOUNT_REJECTED", id, `تم ${status === "approved" ? "اعتماد" : "رفض"} الحساب`);
    fetchProfiles(); setActioning(null);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    if (!createForm.email || !createForm.password || !createForm.fullName) {
      setSubmitError("الرجاء ملء الحقول الإجبارية (البريد الإلكتروني، كلمة المرور، الاسم الكامل).");
      setSubmitting(false);
      return;
    }

    const { data, error } = await supabase.rpc("admin_create_user", {
      p_email: createForm.email,
      p_password: createForm.password,
      p_role: createForm.role,
      p_full_name: createForm.fullName,
      p_phone: createForm.phone || null,
      p_address: createForm.address || null,
      p_specialty: createForm.role === "doctor" ? (createForm.specialty || null) : null
    });

    if (error) {
      setSubmitError(`فشل إنشاء الحساب: ${error.message}`);
    } else {
      setSubmitSuccess("تم إنشاء الحساب واعتماده بنجاح.");
      // Log audit action
      await logAction("ACCOUNT_CREATED", data || "", `تم إنشاء حساب ${createForm.fullName} بصلاحية ${ROLE_CONFIG[createForm.role]?.label}`);
      
      // Clear form
      setCreateForm({
        email: "",
        password: "",
        fullName: "",
        phone: "",
        address: "",
        specialty: "",
        role: "doctor"
      });
      
      // Refresh list
      fetchProfiles();
      
      // Wait a moment and close modal
      setTimeout(() => {
        setShowCreateModal(false);
        setSubmitSuccess("");
      }, 1500);
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    setActioning(id);
    const targetProfile = profiles.find(p => p.id === id);
    const { error } = await supabase.rpc("admin_delete_user", { p_user_id: id });
    if (error) {
      alert(`فشل الحذف: ${error.message}`);
    } else {
      await logAction("ACCOUNT_DELETED", id, `تم حذف حساب ${targetProfile?.full_name || id} (${ROLE_CONFIG[targetProfile?.role || '']?.label || ''}) نهائياً`);
      fetchProfiles();
    }
    setActioning(null);
    setShowDeleteConfirm(null);
  };

  const filtered = profiles.filter(p => {
    const matchSearch = !search ||
      p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.phone?.includes(search);
    const matchRole = roleFilter === "all" || p.role === roleFilter;
    return matchSearch && matchRole;
  });

  const roleCounts = (role: string) => profiles.filter(p => p.role === role).length;

  return (
    <div className="pb-32 w-full" dir="rtl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-800 mb-1">إدارة المستخدمين</h1>
            <p className="text-slate-400 text-sm">{profiles.length} مستخدم مسجّل في النظام</p>
          </div>
          <div className="flex gap-2">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-500 hover:from-indigo-700 hover:to-violet-600 text-white shadow-[0_4px_16px_rgba(79,70,229,0.3)] transition-all">
              <Plus className="w-4 h-4" />
              إضافة مستخدم
            </motion.button>
            <motion.button whileHover={{ scale: 1.05, rotate: 15 }} whileTap={{ scale: 0.95 }} onClick={fetchProfiles} disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-2xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-sm">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Role filter tabs */}
      <div className="flex gap-3 mb-5 overflow-x-auto pb-1">
        {[
          { key: "all", label: "الكل", count: profiles.length },
          ...Object.entries(ROLE_CONFIG).map(([key, conf]) => ({ key, label: conf.label, count: roleCounts(key) }))
        ].map(tab => (
          <button key={tab.key} onClick={() => setRoleFilter(tab.key)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold border transition-all ${
              roleFilter === tab.key
                ? "bg-indigo-600 text-white border-transparent shadow-lg"
                : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
            }`}>
            {tab.label}
            <span className={`text-xs px-2 py-0.5 rounded-full font-black ${
              roleFilter === tab.key ? "bg-white/20" : "bg-slate-100"
            }`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute right-4 top-3.5 w-5 h-5 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="بحث بالاسم أو الهاتف..."
          className="w-full h-12 pr-12 pl-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-400 outline-none text-slate-700 text-sm shadow-sm" />
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-white/60 rounded-2xl animate-pulse" />)}
        </div>
      )}

      {/* Users list */}
      <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl overflow-hidden shadow-xl">
        {filtered.length === 0 && !loading && (
          <div className="flex flex-col items-center py-16">
            <Users className="w-12 h-12 text-slate-200 mb-3" />
            <p className="text-slate-500 font-bold">لا يوجد مستخدمون يطابقون البحث</p>
          </div>
        )}

        <div className="divide-y divide-slate-50">
          {filtered.map((p, i) => {
            const conf = ROLE_CONFIG[p.role] || ROLE_CONFIG.patient;
            const isExpanded = expanded === p.id;

            return (
              <motion.div key={p.id}
                initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: i * 0.02 } }}>
                <div className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors cursor-pointer"
                  onClick={() => setExpanded(isExpanded ? null : p.id)}>
                  {/* Avatar */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border ${conf.bg} ${conf.border}`}>
                    <img src={conf.iconSrc} className="w-8 h-8 object-contain" alt={conf.label} />
                  </div>
                  {/* Name & role */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-800 text-sm truncate">{p.full_name}</p>
                      {p.is_banned && (
                        <span className="flex items-center gap-1 text-[10px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full font-black border border-rose-200">
                          <img src="/icon_status_rejected.png" className="w-3.5 h-3.5 object-contain" alt="" /> محظور
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${conf.bg} ${conf.color}`}>{conf.label}</span>
                      {p.specialty && <span className="text-xs text-slate-400 truncate">{p.specialty}</span>}
                    </div>
                  </div>
                  {/* Status */}
                  {(() => { const s = STATUS_CFG[p.approval_status] || STATUS_CFG.pending; return (
                    <span className={`flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-xl border flex-shrink-0 ${s.style}`}>
                      <img src={s.src} className="w-4 h-4 object-contain" alt="" />
                      {s.label}
                    </span>
                  ); })()}
                  <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </div>

                {/* Expanded details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-slate-100">
                      <div className="px-5 py-4 bg-slate-50/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-xs text-slate-600">
                          {p.phone && <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-400" /> {p.phone}</p>}
                          {p.address && <p className="flex items-center gap-2 truncate"><MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" /> {p.address}</p>}
                          <p className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-slate-400" /> تسجيل: {new Date(p.created_at).toLocaleDateString("ar-DZ")}</p>
                          {p.subscription_plan && <p className="flex items-center gap-2"><Shield className="w-3.5 h-3.5 text-slate-400" /> الباقة: <span className="font-bold text-indigo-700">{p.subscription_plan}</span></p>}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {p.role !== "patient" && p.approval_status !== "approved" && (
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => updateApproval(p.id, "approved")} disabled={actioning === p.id}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-600 hover:to-emerald-500 text-white text-xs font-bold disabled:opacity-50 shadow-sm">
                              <img src="/icon_status_approved.png" className="w-4 h-4 object-contain" alt="" /> اعتماد
                            </motion.button>
                          )}
                          {p.role !== "patient" && p.approval_status === "approved" && (
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => updateApproval(p.id, "rejected")} disabled={actioning === p.id}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-amber-200 text-amber-600 text-xs font-bold disabled:opacity-50 hover:bg-amber-50 shadow-sm">
                              <img src="/icon_status_pending.png" className="w-4 h-4 object-contain" alt="" /> إلغاء الاعتماد
                            </motion.button>
                          )}
                          {p.role !== "admin" && (
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => toggleBan(p.id, !!p.is_banned)} disabled={actioning === p.id}
                              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-50 border transition-all shadow-sm ${
                                p.is_banned ? "border-emerald-200 text-emerald-600 hover:bg-emerald-50" : "border-rose-200 text-rose-600 hover:bg-rose-50"
                              }`}>
                              <img src={p.is_banned ? "/icon_status_approved.png" : "/icon_status_rejected.png"} className="w-4 h-4 object-contain" alt="" />
                              {p.is_banned ? "رفع الحظر" : "حظر الحساب"}
                            </motion.button>
                          )}
                          {["doctor", "lab", "pharmacy"].includes(p.role) && (
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowDeleteConfirm(p.id)} disabled={actioning === p.id}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-50 border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all shadow-sm">
                              <Trash2 className="w-3.5 h-3.5" />
                              حذف الحساب
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Create User Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border border-slate-100 rounded-3xl p-6 shadow-2xl w-full max-w-lg overflow-hidden relative"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
                <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-indigo-600" />
                  إضافة مستخدم جديد
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {submitError && (
                <div className="mb-4 p-3.5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {submitSuccess && (
                <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-xs font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{submitSuccess}</span>
                </div>
              )}

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">الاسم الكامل *</label>
                    <input
                      type="text"
                      required
                      value={createForm.fullName}
                      onChange={e => setCreateForm({ ...createForm, fullName: e.target.value })}
                      placeholder="د. محمد علي / صيدلية الأمل"
                      className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 text-xs focus:ring-2 focus:ring-indigo-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">نوع الحساب *</label>
                    <select
                      value={createForm.role}
                      onChange={e => setCreateForm({ ...createForm, role: e.target.value as any })}
                      className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 text-xs focus:ring-2 focus:ring-indigo-400 outline-none"
                    >
                      <option value="doctor">طبيب</option>
                      <option value="lab">مخبري</option>
                      <option value="pharmacy">صيدلية</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">البريد الإلكتروني *</label>
                    <input
                      type="email"
                      required
                      value={createForm.email}
                      onChange={e => setCreateForm({ ...createForm, email: e.target.value })}
                      placeholder="user@example.com"
                      className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 text-xs focus:ring-2 focus:ring-indigo-400 outline-none ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">كلمة المرور *</label>
                    <input
                      type="password"
                      required
                      value={createForm.password}
                      onChange={e => setCreateForm({ ...createForm, password: e.target.value })}
                      placeholder="******"
                      className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 text-xs focus:ring-2 focus:ring-indigo-400 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">الهاتف (اختياري)</label>
                    <input
                      type="text"
                      value={createForm.phone}
                      onChange={e => setCreateForm({ ...createForm, phone: e.target.value })}
                      placeholder="0550000000"
                      className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 text-xs focus:ring-2 focus:ring-indigo-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">العنوان (اختياري)</label>
                    <input
                      type="text"
                      value={createForm.address}
                      onChange={e => setCreateForm({ ...createForm, address: e.target.value })}
                      placeholder="الجزائر العاصمة"
                      className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 text-xs focus:ring-2 focus:ring-indigo-400 outline-none"
                    />
                  </div>
                </div>

                {createForm.role === "doctor" && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">التخصص الطبي</label>
                    <input
                      type="text"
                      value={createForm.specialty}
                      onChange={e => setCreateForm({ ...createForm, specialty: e.target.value })}
                      placeholder="طب عام، أمراض القلب، إلخ."
                      className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 text-xs focus:ring-2 focus:ring-indigo-400 outline-none"
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/15 disabled:opacity-50"
                  >
                    {submitting ? "جاري الإنشاء..." : "إنشاء واعتماد الحساب"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-5 h-11 border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold rounded-2xl text-xs transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border border-slate-100 rounded-3xl p-6 shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="flex flex-col items-center text-center p-2">
                <div className="w-12 h-12 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center text-rose-500 mb-4">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-slate-800 mb-2">تأكيد حذف الحساب</h3>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                  هل أنت متأكد من رغبتك في حذف هذا الحساب نهائياً؟ 
                  <br />
                  <span className="text-rose-500 font-bold">هذا الإجراء لا يمكن التراجع عنه وسيقوم بتنظيف كافة البيانات والطلبات المرتبطة به.</span>
                </p>
                
                <div className="flex w-full gap-3">
                  <button
                    onClick={() => handleDelete(showDeleteConfirm)}
                    disabled={actioning === showDeleteConfirm}
                    className="flex-1 h-11 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/15 disabled:opacity-50"
                  >
                    {actioning === showDeleteConfirm ? "جاري الحذف..." : "تأكيد الحذف النهائي"}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 h-11 border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold rounded-2xl text-xs transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
