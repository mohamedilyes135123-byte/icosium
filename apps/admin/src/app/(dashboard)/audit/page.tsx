"use client";

export const dynamic = 'force-dynamic';


import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Activity, RefreshCw, Filter, X, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type AuditStatus = "SUCCESS" | "BLOCKED" | "WARNING" | "ENCRYPTED";

interface AuditEntry {
  id: string; action: string;
  actor_name: string; actor_role: string;
  target_id?: string; details?: string;
  ip_address?: string; status: AuditStatus;
  created_at: string;
}

const STATUS_STYLE: Record<AuditStatus, string> = {
  SUCCESS:   "text-emerald-400 border-emerald-700 bg-emerald-900/30",
  BLOCKED:   "text-rose-400 border-rose-700 bg-rose-900/30",
  WARNING:   "text-amber-400 border-amber-700 bg-amber-900/30",
  ENCRYPTED: "text-indigo-400 border-indigo-700 bg-indigo-900/30",
};

const ACTION_CATEGORIES: Record<string, string[]> = {
  "╪¡╪│╪º╪¿╪º╪¬":     ["ACCOUNT_APPROVED","ACCOUNT_REJECTED","ACCOUNT_BANNED","ACCOUNT_UNBANNED"],
  "╪»╪«┘ê┘ä":       ["USER_LOGIN","USER_LOGOUT","LOGIN_FAILED","MFA_VERIFIED"],
  "┘ê╪╡┘ü╪º╪¬":      ["PRESCRIPTION_CREATED","PRESCRIPTION_VIEWED","PRESCRIPTION_USED"],
  "╪¬╪¡╪º┘ä┘è┘ä":     ["LAB_RESULT_UPLOADED","LAB_REQUEST_RECEIVED"],
  "╪ú┘à╪º┘å":       ["UNAUTHORIZED_ACCESS_ATTEMPT","RATE_LIMIT_EXCEEDED","SUSPICIOUS_ACTIVITY"],
};

export default function AuditPage() {
  const supabase = createClient();
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<AuditStatus | "ALL">("ALL");
  const [filterAction, setFilterAction] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const terminalRef = useRef<HTMLDivElement>(null);

  const fetchAudit = useCallback(async () => {
    let query = supabase.from("audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (filterStatus !== "ALL") query = query.eq("status", filterStatus);
    if (filterAction) query = query.ilike("action", `%${filterAction}%`);
    const { data } = await query;
    setEntries(data || []);
    setLoading(false);
  }, [supabase, filterStatus, filterAction]);

  useEffect(() => {
    fetchAudit();
    if (!autoRefresh) return;
    const channel = supabase.channel("audit-terminal-rt")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "audit_log" }, () => fetchAudit())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase, fetchAudit, autoRefresh]);

  const exportCSV = () => {
    const header = "id,action,actor_name,actor_role,details,ip_address,status,created_at\n";
    const rows = entries.map(e =>
      `"${e.id}","${e.action}","${e.actor_name}","${e.actor_role}","${e.details || ""}","${e.ip_address || ""}","${e.status}","${e.created_at}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `audit_log_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const counts = {
    total: entries.length,
    BLOCKED: entries.filter(e => e.status === "BLOCKED").length,
    WARNING: entries.filter(e => e.status === "WARNING").length,
  };

  return (
    <div className="pb-32 w-full" dir="rtl">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-black text-slate-800">╪│╪¼┘ä ╪º┘ä╪¬╪»┘é┘è┘é ╪º┘ä╪ú┘à┘å┘è</h1>
              {autoRefresh && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  LIVE
                </span>
              )}
            </div>
            <p className="text-slate-400 text-sm">
              {counts.total} ╪│╪¼┘ä ┘à╪│╪¼┘æ┘ä ΓÇö
              {counts.BLOCKED > 0 && <span className="text-rose-600 font-bold mr-2"> ≡ƒÜ½ {counts.BLOCKED} ┘à╪¡╪╕┘ê╪▒</span>}
              {counts.WARNING > 0 && <span className="text-amber-600 font-bold mr-2"> ΓÜá∩╕Å {counts.WARNING} ╪¬╪¡╪░┘è╪▒</span>}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setAutoRefresh(r => !r)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-2xl border transition-all ${
                autoRefresh ? "bg-emerald-500 text-white border-transparent" : "bg-white text-slate-600 border-slate-200"
              }`}>
              <Activity className="w-4 h-4" />
              {autoRefresh ? "Live On" : "Live Off"}
            </button>
            <button onClick={fetchAudit} disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-2xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-500" : ""}`} />
            </button>
            <button onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20">
              <Download className="w-4 h-4" /> ╪¬╪╡╪»┘è╪▒ CSV
            </button>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        {["ALL","SUCCESS","BLOCKED","WARNING","ENCRYPTED"].map(s => (
          <button key={s} onClick={() => setFilterStatus(s as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              filterStatus === s ? "bg-slate-800 text-white border-transparent" : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
            }`}>
            {s === "ALL" ? "╪º┘ä┘â┘ä" : s}
          </button>
        ))}
        <div className="relative">
          <input value={filterAction} onChange={e => setFilterAction(e.target.value)}
            placeholder="┘ü┘ä╪¬╪▒╪⌐ ╪¡╪│╪¿ ╪º┘ä╪Ñ╪¼╪▒╪º╪í..."
            className="h-9 px-4 pr-9 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none text-slate-700" />
          {filterAction && (
            <button onClick={() => setFilterAction("")} className="absolute right-2.5 top-2 text-slate-400">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Terminal */}
      <div className="bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
        {/* Terminal top bar */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500" />
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-slate-500 text-xs font-mono mr-3">3inaya-audit-terminal ΓÇö {entries.length} entries</span>
          </div>
          {autoRefresh && <span className="text-emerald-400 text-xs font-mono animate-pulse">ΓùÅ RECORDING</span>}
        </div>

        <div ref={terminalRef} className="p-5 max-h-[70vh] overflow-y-auto font-mono text-sm space-y-2">
          {loading && (
            <div className="flex items-center gap-2 text-slate-500 py-4">
              <Activity className="w-4 h-4 animate-spin" />
              <span>╪¼╪º╪▒┘è ╪¬╪¡┘à┘è┘ä ╪º┘ä╪│╪¼┘ä╪º╪¬...</span>
            </div>
          )}

          {!loading && entries.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-slate-600">// ┘ä╪º ╪¬┘ê╪¼╪» ╪│╪¼┘ä╪º╪¬ ╪¬╪╖╪º╪¿┘é ┘ç╪░╪º ╪º┘ä┘ü┘ä╪¬╪▒</p>
              <span className="text-slate-700 animate-pulse">_</span>
            </div>
          )}

          <AnimatePresence>
            {entries.map((entry, i) => (
              <motion.div key={entry.id}
                initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0, transition: { delay: Math.min(i * 0.01, 0.3) } }}
                className={`flex items-start gap-4 p-3 rounded-xl border ${STATUS_STYLE[entry.status]} group hover:brightness-110 transition-all`}>

                {/* Timestamp */}
                <span className="text-slate-600 text-[10px] flex-shrink-0 mt-0.5 w-20 text-left">
                  {new Date(entry.created_at).toLocaleTimeString("fr-DZ")}
                </span>

                {/* Action */}
                <span className={`font-black text-xs flex-shrink-0 w-52 truncate ${
                  entry.status === "BLOCKED" ? "text-rose-400" :
                  entry.status === "WARNING" ? "text-amber-400" :
                  entry.status === "ENCRYPTED" ? "text-indigo-400" : "text-emerald-400"
                }`}>
                  {entry.action}
                </span>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <span className="text-slate-300 truncate block">
                    {entry.actor_name}
                    {entry.details && <span className="text-slate-500"> ΓÇ║ {entry.details}</span>}
                  </span>
                  {entry.ip_address && (
                    <span className="text-slate-600 text-[10px]">{entry.ip_address}</span>
                  )}
                </div>

                {/* Status badge */}
                <span className={`text-[9px] px-2 py-0.5 rounded-md font-black border flex-shrink-0 ${STATUS_STYLE[entry.status]}`}>
                  {entry.status}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Cursor */}
          <div className="flex items-center gap-2 text-slate-600 text-xs py-2">
            <span className="text-emerald-600">admin@3inaya:~$</span>
            <span className="w-2 h-4 bg-emerald-400 animate-pulse rounded-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
