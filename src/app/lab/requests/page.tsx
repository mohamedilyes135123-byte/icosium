"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  TestTube, CheckCircle2, FlaskConical, AlertTriangle,
  User, QrCode, Clock, Upload, ShieldAlert, Package
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING:    { label: "قيد الانتظار",  color: "bg-amber-100 text-amber-700 border-amber-200" },
  PROCESSING: { label: "جاري التحليل", color: "bg-blue-100 text-blue-700 border-blue-200" },
  COMPLETED:  { label: "النتائج جاهزة", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  CANCELLED:  { label: "ملغى",          color: "bg-slate-100 text-slate-500 border-slate-200" },
};

export default function LabRequests() {
  const supabase = createClient();
  const [user, setUser]             = useState<any>(null);
  const [requests, setRequests]     = useState<any[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);
  const [loading, setLoading]       = useState(true);
  const [uploadPanel, setUploadPanel] = useState<{ open: boolean; requestId: string; patientId: string } | null>(null);
  const [resultNotes, setResultNotes] = useState("");
  const [resultFileUrl, setResultFileUrl] = useState("");
  const [uploading, setUploading]   = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, [supabase]);

  const fetchRequests = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("lab_requests")
      .select(`*, 
        patient:profiles!lab_requests_patient_id_fkey(full_name, phone, address),
        doctor:profiles!lab_requests_doctor_id_fkey(full_name, specialty),
        lab_results(id, result_notes, file_url, uploaded_at)`)
      .eq("lab_id", user.id)
      .order("created_at", { ascending: false });
    setRequests(data || []);
    setLoading(false);
  }, [supabase, user]);

  useEffect(() => {
    fetchRequests();
    const ch = supabase.channel("lab-requests-mono")
      .on("postgres_changes", { event: "*", schema: "public", table: "lab_requests" }, fetchRequests)
      .on("postgres_changes", { event: "*", schema: "public", table: "lab_results" }, fetchRequests)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [supabase, fetchRequests]);

  const updateStatus = async (id: string, status: string) => {
    setProcessing(id);
    await supabase.from("lab_requests").update({ status }).eq("id", id);
    setProcessing(null);
  };

  const submitResults = async () => {
    if (!uploadPanel || !user) return;
    setUploading(true);
    await supabase.from("lab_results").insert([{
      lab_request_id: uploadPanel.requestId,
      lab_id:         user.id,
      patient_id:     uploadPanel.patientId,
      result_notes:   resultNotes || null,
      file_url:       resultFileUrl || null,
    }]);
    setUploadPanel(null); setResultNotes(""); setResultFileUrl("");
    setUploading(false);
  };

  return (
    <div className="pb-32 w-full" dir="rtl">

      {/* Header */}
      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-black text-slate-800 mb-1">طلبات التحاليل</h1>
        <p className="text-slate-400 text-sm">الطلبات المُرسلة إليكم مباشرة من المرضى</p>
      </motion.header>

      {/* RBAC notice */}
      <div className="bg-cyan-50/80 border border-cyan-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-cyan-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-slate-600">
          ✅ يمكنك تحديث الحالة ورفع النتائج. &nbsp;
          ❌ لا يمكنك تعديل قائمة التحاليل المطلوبة. &nbsp;
          🔐 لا ترى طلبات مختبرات أخرى.
        </p>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1,2,3,4].map(i => <div key={i} className="h-48 bg-white/60 rounded-3xl animate-pulse" />)}
        </div>
      )}

      {!loading && requests.length === 0 && (
        <div className="flex flex-col items-center py-20 bg-white/60 border border-white rounded-3xl">
          <FlaskConical className="w-16 h-16 text-cyan-100 mb-4" />
          <p className="font-bold text-slate-500">لا توجد طلبات حالياً</p>
          <p className="text-sm text-slate-400 mt-1">ستظهر هنا طلبات المرضى عند إرسالها لمختبركم</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AnimatePresence>
          {requests.map((req, i) => {
            const st = STATUS_MAP[req.status] || STATUS_MAP.PENDING;
            const hasResults = req.lab_results?.length > 0;
            return (
              <motion.div key={req.id}
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1, transition: { delay: i * 0.04 } }}
                className="bg-white/90 backdrop-blur-xl border border-white rounded-3xl shadow-xl shadow-cyan-500/5 overflow-hidden">

                {/* Status top bar */}
                <div className={`h-1.5 w-full ${req.status === "COMPLETED" ? "bg-emerald-500" : req.status === "PROCESSING" ? "bg-blue-400" : "bg-amber-400"}`} />

                <div className="p-5">
                  {/* Patient + status */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-cyan-100 flex items-center justify-center font-black text-cyan-700 text-sm">
                        {req.patient?.full_name?.[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{req.patient?.full_name}</p>
                        {req.patient?.phone && <p className="text-xs text-slate-400">{req.patient.phone}</p>}
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-xl border ${st.color}`}>{st.label}</span>
                  </div>

                  {/* Doctor + date */}
                  {req.doctor && (
                    <p className="text-xs text-slate-500 mb-3">
                      <span className="font-bold">طلب بواسطة:</span> {req.doctor.full_name}
                    </p>
                  )}
                  <p className="text-xs text-slate-400 flex items-center gap-1 mb-3">
                    <Clock className="w-3 h-3" />
                    {new Date(req.created_at).toLocaleString("ar-DZ")}
                  </p>

                  {/* Tests (read-only) */}
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 mb-4">
                    <p className="text-xs font-black text-slate-500 mb-2 flex items-center gap-1">
                      <TestTube className="w-3.5 h-3.5" /> التحاليل (قراءة فقط)
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {req.tests_list?.map((t: any, idx: number) => (
                        <span key={idx} className="text-xs bg-cyan-50 text-cyan-700 px-2 py-1 rounded-lg font-bold border border-cyan-100">
                          {t.name}
                        </span>
                      ))}
                    </div>
                    {req.doctor_notes && (
                      <p className="text-xs text-amber-600 mt-2 pt-2 border-t border-slate-200 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> {req.doctor_notes}
                      </p>
                    )}
                  </div>

                  {/* Uploaded results preview */}
                  {hasResults && (
                    <div className="mb-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-3">
                      <p className="text-xs font-bold text-emerald-700 flex items-center gap-1 mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> تم رفع النتائج
                      </p>
                      {req.lab_results[0].result_notes && (
                        <p className="text-xs text-slate-600 line-clamp-2">{req.lab_results[0].result_notes}</p>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  {req.status === "PENDING" && (
                    <button onClick={() => updateStatus(req.id, "PROCESSING")} disabled={processing === req.id}
                      className="w-full py-2.5 rounded-2xl bg-blue-500 text-white text-sm font-bold disabled:opacity-50 mb-2">
                      {processing === req.id ? "..." : "🔬 بدء التحليل"}
                    </button>
                  )}
                  {req.status === "PROCESSING" && !hasResults && (
                    <button onClick={() => setUploadPanel({ open: true, requestId: req.id, patientId: req.patient_id })}
                      className="w-full py-2.5 rounded-2xl bg-emerald-500 text-white text-sm font-bold flex items-center justify-center gap-2">
                      <Upload className="w-4 h-4" /> رفع النتائج
                    </button>
                  )}
                  {req.status === "COMPLETED" && (
                    <div className="flex items-center justify-center gap-2 py-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 font-bold text-sm">
                      <CheckCircle2 className="w-4 h-4" /> أُرسلت للمريض
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Upload Results Bottom Sheet */}
      <AnimatePresence>
        {uploadPanel?.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
            onClick={() => setUploadPanel(null)}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 22 }}
              className="w-full bg-white rounded-t-[2rem] p-6"
              onClick={e => e.stopPropagation()}>
              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-6" />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800">رفع نتائج التحليل</h3>
                  <p className="text-xs text-slate-400">ستُرسل للمريض فوراً</p>
                </div>
              </div>
              <div className="space-y-4 mb-6">
                <textarea value={resultNotes} onChange={e => setResultNotes(e.target.value)}
                  placeholder="ملخص النتائج (إلزامي)..."
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-emerald-400 outline-none resize-none h-28 text-slate-700 text-sm" />
                <input value={resultFileUrl} onChange={e => setResultFileUrl(e.target.value)}
                  placeholder="رابط ملف النتائج (اختياري) — PDF أو صورة"
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-emerald-400 outline-none text-sm text-slate-700" />
              </div>
              <div className="flex gap-3">
                <button onClick={submitResults} disabled={uploading || !resultNotes.trim()}
                  className="flex-1 h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold disabled:opacity-50">
                  {uploading ? "جاري الرفع..." : "✅ رفع وإرسال للمريض"}
                </button>
                <button onClick={() => setUploadPanel(null)}
                  className="h-12 px-5 rounded-2xl border border-slate-200 bg-white text-slate-500 font-bold">
                  إلغاء
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
