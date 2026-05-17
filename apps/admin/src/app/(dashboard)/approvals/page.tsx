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
  doctor: "╪╖╪¿┘è╪¿", lab: "┘à╪«╪¬╪¿╪▒", pharmacy: "╪╡┘è╪»┘ä┘è╪⌐",
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
        actor_name: "┘à╪»┘è╪▒ ╪º┘ä┘å╪╕╪º┘à", target_id: id,
        details: `╪¬┘à ${status === "approved" ? "╪º╪╣╪¬┘à╪º╪»" : "╪▒┘ü╪╢"} ╪º┘ä╪¡╪│╪º╪¿`,
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
        <h1 className="text-2xl font-black text-slate-800 mb-1">╪º╪╣╪¬┘à╪º╪» ╪º┘ä╪¡╪│╪º╪¿╪º╪¬ ╪º┘ä┘à┘ç┘å┘è╪⌐</h1>
        <p className="text-slate-400 text-sm">┘à╪▒╪º╪¼╪╣╪⌐ ┘ê┘é╪¿┘ê┘ä ╪ú┘ê ╪▒┘ü╪╢ ╪╖┘ä╪¿╪º╪¬ ╪ú╪╖╪¿╪º╪í / ┘à╪«╪¬╪¿╪▒╪º╪¬ / ╪╡┘è╪»┘ä┘è╪º╪¬</p>
      </motion.header>

      {/* Status filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {(["pending","approved","rejected","all"] as FilterStatus[]).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-2xl text-sm font-bold border transition-all ${
              filter === f ? "bg-indigo-600 text-white border-transparent shadow-lg" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
            }`}>
            {f === "pending" ? "ΓÅ│ ╪º┘å╪¬╪╕╪º╪▒" : f === "approved" ? "Γ£à ┘à╪╣╪¬┘à╪»" : f === "rejected" ? "Γ¥î ┘à╪▒┘ü┘ê╪╢" : "╪º┘ä┘â┘ä"}
            <span className={`mr-2 text-xs px-2 py-0.5 rounded-full font-black ${filter === f ? "bg-white/20" : "bg-slate-100"}`}>
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {/* Role filter */}
      <div className="flex gap-2 mb-6">
        {["all","doctor","lab","pharmacy"].map(r => (
          <button key={r} onClick={() => setRoleFilter(r)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              roleFilter === r ? `bg-gradient-to-l ${r !== "all" ? ROLE_COLORS[r] : "from-slate-700 to-slate-600"} text-white border-transparent` : "bg-white text-slate-500 border-slate-200"
            }`}>
            {r === "all" ? "┘â┘ä ╪º┘ä╪ú╪»┘ê╪º╪▒" : ROLE_LABELS[r]}
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
          <p className="font-bold text-slate-500">┘ä╪º ╪¬┘ê╪¼╪» ╪¡╪│╪º╪¿╪º╪¬ ┘ü┘è ┘ç╪░┘ç ╪º┘ä┘ü╪ª╪⌐</p>
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
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center bg-gradient-to-br ${ROLE_COLORS[p.role]} text-white shadow-md`}>
                      {p.role === "doctor" ? <Stethoscope className="w-5 h-5" /> :
                       p.role === "lab"    ? <FlaskConical className="w-5 h-5" /> :
                                             <Pill className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-black text-slate-800 text-sm">{p.full_name}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ROLE_BG[p.role]}`}>
                        {ROLE_LABELS[p.role]}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-xl border ${
                    p.approval_status === "approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    p.approval_status === "rejected" ? "bg-rose-50 text-rose-700 border-rose-200" :
                    "bg-amber-50 text-amber-700 border-amber-200"
                  }`}>
                    {p.approval_status === "approved" ? "Γ£à ┘à╪╣╪¬┘à╪»" :
                     p.approval_status === "rejected" ? "Γ¥î ┘à╪▒┘ü┘ê╪╢" : "ΓÅ│ ╪º┘å╪¬╪╕╪º╪▒"}
                  </span>
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
                    ╪¬╪│╪¼┘è┘ä: {new Date(p.created_at).toLocaleDateString("ar-DZ")}
                  </p>
                </div>

                {/* Expandable details */}
                {(p.national_id || p.medical_license) && (
                  <div className="mb-4">
                    <button onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                      className="flex items-center gap-1.5 text-xs text-indigo-600 font-bold hover:underline">
                      <Eye className="w-3.5 h-3.5" />
                      {expanded === p.id ? "╪Ñ╪«┘ü╪º╪í ╪º┘ä╪¬┘ü╪º╪╡┘è┘ä" : "╪╣╪▒╪╢ ╪º┘ä╪¬┘ü╪º╪╡┘è┘ä"}
                      {expanded === p.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    <AnimatePresence>
                      {expanded === p.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden">
                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mt-2 space-y-1.5 text-xs font-mono">
                            {p.national_id && <p><span className="text-slate-500">╪▒┘é┘à ╪º┘ä┘ç┘ê┘è╪⌐:</span> <span className="font-bold text-slate-800">{p.national_id}</span></p>}
                            {p.medical_license && <p><span className="text-slate-500">╪▒┘é┘à ╪º┘ä┘å┘é╪º╪¿╪⌐:</span> <span className="font-bold text-slate-800">{p.medical_license}</span></p>}
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
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold disabled:opacity-50 transition-colors shadow-md shadow-emerald-500/20">
                      <CheckCircle className="w-3.5 h-3.5" />
                      {actioning === p.id ? "..." : "╪º╪╣╪¬┘à╪º╪» ╪º┘ä╪¡╪│╪º╪¿"}
                    </button>
                    <button onClick={() => updateStatus(p.id, "rejected")} disabled={actioning === p.id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold disabled:opacity-50 transition-colors">
                      <XCircle className="w-3.5 h-3.5" />
                      ╪▒┘ü╪╢
                    </button>
                  </div>
                )}
                {p.approval_status === "approved" && (
                  <button onClick={() => updateStatus(p.id, "rejected")} disabled={actioning === p.id}
                    className="w-full py-2.5 rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-50 text-xs font-bold transition-colors">
                    ╪Ñ┘ä╪║╪º╪í ╪º┘ä╪º╪╣╪¬┘à╪º╪»
                  </button>
                )}
                {p.approval_status === "rejected" && (
                  <button onClick={() => updateStatus(p.id, "approved")} disabled={actioning === p.id}
                    className="w-full py-2.5 rounded-xl border border-emerald-200 text-emerald-600 hover:bg-emerald-50 text-xs font-bold transition-colors">
                    ╪º╪╣╪¬┘à╪º╪» ╪º┘ä╪¡╪│╪º╪¿
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
