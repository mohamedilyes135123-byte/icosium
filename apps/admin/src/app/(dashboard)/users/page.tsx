"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Search, Users, Stethoscope, FlaskConical, Pill, User,
  Ban, CheckCircle, XCircle, ChevronDown, Phone, MapPin,
  Calendar, Shield, RefreshCw, AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Profile {
  id: string; full_name: string; role: string;
  approval_status: string; created_at: string;
  specialty?: string; address?: string; phone?: string;
  is_banned?: boolean; subscription_plan?: string;
}

const ROLE_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  doctor:   { label: "Ø·Ø¨ÙŠØ¨",    icon: Stethoscope, color: "text-blue-700",   bg: "bg-blue-100" },
  lab:      { label: "Ù…Ø®ØªØ¨Ø±",   icon: FlaskConical, color: "text-cyan-700",  bg: "bg-cyan-100" },
  pharmacy: { label: "ØµÙŠØ¯Ù„ÙŠØ©",  icon: Pill,         color: "text-purple-700", bg: "bg-purple-100" },
  patient:  { label: "Ù…Ø±ÙŠØ¶",   icon: User,          color: "text-emerald-700", bg: "bg-emerald-100" },
  admin:    { label: "Ø¥Ø¯Ø§Ø±Ø©",   icon: Shield,        color: "text-indigo-700", bg: "bg-indigo-100" },
};

export default function AdminUsers() {
  const supabase = createClient();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [actioning, setActioning] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

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
      actor_name: "Ù…Ø¯ÙŠØ± Ø§Ù„Ù†Ø¸Ø§Ù…", target_id: targetId,
      details, status: "SUCCESS",
    }]);
  };

  const toggleBan = async (id: string, current: boolean) => {
    setActioning(id);
    await supabase.from("profiles").update({ is_banned: !current }).eq("id", id);
    await logAction(current ? "ACCOUNT_UNBANNED" : "ACCOUNT_BANNED", id, current ? "Ø±ÙÙØ¹ Ø§Ù„Ø­Ø¸Ø± Ø¹Ù† Ø§Ù„Ø­Ø³Ø§Ø¨" : "ØªÙ… Ø­Ø¸Ø± Ø§Ù„Ø­Ø³Ø§Ø¨");
    fetchProfiles(); setActioning(null);
  };

  const updateApproval = async (id: string, status: string) => {
    setActioning(id);
    await supabase.from("profiles").update({ approval_status: status }).eq("id", id);
    await logAction(status === "approved" ? "ACCOUNT_APPROVED" : "ACCOUNT_REJECTED", id, `ØªÙ… ${status === "approved" ? "Ø§Ø¹ØªÙ…Ø§Ø¯" : "Ø±ÙØ¶"} Ø§Ù„Ø­Ø³Ø§Ø¨`);
    fetchProfiles(); setActioning(null);
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
            <h1 className="text-2xl font-black text-slate-800 mb-1">Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ†</h1>
            <p className="text-slate-400 text-sm">{profiles.length} Ù…Ø³ØªØ®Ø¯Ù… Ù…Ø³Ø¬Ù‘Ù„ ÙÙŠ Ø§Ù„Ù†Ø¸Ø§Ù…</p>
          </div>
          <button onClick={fetchProfiles} disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-2xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </motion.div>

      {/* Role filter tabs */}
      <div className="flex gap-3 mb-5 overflow-x-auto pb-1">
        {[
          { key: "all", label: "Ø§Ù„ÙƒÙ„", count: profiles.length },
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
          placeholder="Ø¨Ø­Ø« Ø¨Ø§Ù„Ø§Ø³Ù… Ø£Ùˆ Ø§Ù„Ù‡Ø§ØªÙ..."
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
            <p className="text-slate-500 font-bold">Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ù…Ø³ØªØ®Ø¯Ù…ÙˆÙ† ÙŠØ·Ø§Ø¨Ù‚ÙˆÙ† Ø§Ù„Ø¨Ø­Ø«</p>
          </div>
        )}

        <div className="divide-y divide-slate-50">
          {filtered.map((p, i) => {
            const conf = ROLE_CONFIG[p.role] || ROLE_CONFIG.patient;
            const Icon = conf.icon;
            const isExpanded = expanded === p.id;

            return (
              <motion.div key={p.id}
                initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: i * 0.02 } }}>
                <div className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors cursor-pointer"
                  onClick={() => setExpanded(isExpanded ? null : p.id)}>
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${conf.bg}`}>
                    <Icon className={`w-5 h-5 ${conf.color}`} />
                  </div>
                  {/* Name & role */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-800 text-sm truncate">{p.full_name}</p>
                      {p.is_banned && <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-black">ðŸš« Ù…Ø­Ø¸ÙˆØ±</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${conf.bg} ${conf.color}`}>{conf.label}</span>
                      {p.specialty && <span className="text-xs text-slate-400 truncate">{p.specialty}</span>}
                    </div>
                  </div>
                  {/* Status */}
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-xl border flex-shrink-0 ${
                    p.approval_status === "approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    p.approval_status === "rejected" ? "bg-rose-50 text-rose-700 border-rose-200" :
                    "bg-amber-50 text-amber-700 border-amber-200"
                  }`}>
                    {p.approval_status === "approved" ? "âœ…" : p.approval_status === "rejected" ? "âŒ" : "â³"}
                  </span>
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
                          <p className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-slate-400" /> ØªØ³Ø¬ÙŠÙ„: {new Date(p.created_at).toLocaleDateString("ar-DZ")}</p>
                          {p.subscription_plan && <p className="flex items-center gap-2"><Shield className="w-3.5 h-3.5 text-slate-400" /> Ø§Ù„Ø¨Ø§Ù‚Ø©: <span className="font-bold text-indigo-700">{p.subscription_plan}</span></p>}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {p.role !== "patient" && p.approval_status !== "approved" && (
                            <button onClick={() => updateApproval(p.id, "approved")} disabled={actioning === p.id}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold disabled:opacity-50">
                              <CheckCircle className="w-3.5 h-3.5" /> Ø§Ø¹ØªÙ…Ø§Ø¯
                            </button>
                          )}
                          {p.role !== "patient" && p.approval_status === "approved" && (
                            <button onClick={() => updateApproval(p.id, "rejected")} disabled={actioning === p.id}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-amber-200 text-amber-600 text-xs font-bold disabled:opacity-50 hover:bg-amber-50">
                              <XCircle className="w-3.5 h-3.5" /> Ø¥Ù„ØºØ§Ø¡ Ø§Ù„Ø§Ø¹ØªÙ…Ø§Ø¯
                            </button>
                          )}
                          {p.role !== "admin" && (
                            <button onClick={() => toggleBan(p.id, !!p.is_banned)} disabled={actioning === p.id}
                              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-50 border transition-colors ${
                                p.is_banned ? "border-emerald-200 text-emerald-600 hover:bg-emerald-50" : "border-rose-200 text-rose-600 hover:bg-rose-50"
                              }`}>
                              <Ban className="w-3.5 h-3.5" />
                              {p.is_banned ? "Ø±ÙØ¹ Ø§Ù„Ø­Ø¸Ø±" : "Ø­Ø¸Ø± Ø§Ù„Ø­Ø³Ø§Ø¨"}
                            </button>
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
    </div>
  );
}
