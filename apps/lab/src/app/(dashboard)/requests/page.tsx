"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  TestTube, CheckCircle2, FlaskConical, AlertTriangle,
  User, QrCode, Clock, Upload, Eye, ShieldAlert
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
  const [labRequests, setLabRequests] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  // Result upload panel
  const [uploadPanel, setUploadPanel] = useState<{ open: boolean; requestId: string; patientId: string } | null>(null);
  const [resultNotes, setResultNotes] = useState("");
  const [resultFileUrl, setResultFileUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  // ── Get current user ──────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user));
  }, [supabase]);

  // ── Fetch lab requests (ONLY assigned to THIS lab by patient) ──
  const fetchRequests = useCallback(async () => {
    if (!currentUser) return;
    const { data } = await supabase
      .from("lab_requests")
      .select(`
        *,
        patient:profiles!lab_requests_patient_id_fkey(full_name, phone, address),
        doctor:profiles!lab_requests_doctor_id_fkey(full_name, specialty),
        lab_results(id, result_notes, file_url, uploaded_at)
      `)
      .eq("lab_id", currentUser.id)
      .order("created_at", { ascending: false });

    setLabRequests(data || []);
  }, [supabase, currentUser]);

  useEffect(() => {
    fetchRequests();
    const channel = supabase
      .channel("lab-requests-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "lab_requests" }, fetchRequests)
      .on("postgres_changes", { event: "*", schema: "public", table: "lab_results" }, fetchRequests)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase, fetchRequests]);

  // ── Update lab request status ─────────────────────────────────
  const updateStatus = async (id: string, status: string) => {
    setProcessing(id);
    // Lab can ONLY update status — cannot modify tests_list
    await supabase.from("lab_requests").update({ status }).eq("id", id);
    setProcessing(null);
  };

  // ── Upload lab results ────────────────────────────────────────
  const submitResults = async () => {
    if (!uploadPanel || !currentUser) return;
    setUploading(true);

    // Insert into lab_results (trigger notifies patient automatically)
    const { error } = await supabase.from("lab_results").insert([{
      lab_request_id: uploadPanel.requestId,
      lab_id: currentUser.id,
      patient_id: uploadPanel.patientId,
      result_notes: resultNotes || null,
      file_url: resultFileUrl || null,
    }]);

    if (!error) {
      setUploadPanel(null);
      setResultNotes("");
      setResultFileUrl("");
    }
    setUploading(false);
  };

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="pb-32 w-full" dir="rtl">

      {/* ── Header ── */}
      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="mb-8 pb-6 border-b border-cyan-100/50">
        <h1 className="text-3xl font-extrabold text-slate-800 mb-2 tracking-tight">
          طلبات التحاليل
        </h1>
        <p className="text-slate-500">
          تظهر هنا فقط الطلبات التي أرسلها المرضى مباشرة إلى مختبركm.
        </p>
      </motion.header>

      {/* ── RBAC Notice ── */}
      <div className="bg-cyan-50/50 border border-cyan-200 rounded-2xl p-4 mb-8 flex items-start gap-4 shadow-sm">
        <div className="bg-white p-2 rounded-full text-cyan-500 border border-cyan-100 shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-cyan-900">صلاحياتك كمختبر (RBAC)</h4>
          <p className="text-sm text-slate-600 mt-1">
            ✅ يمكنك تحديث الحالة ورفع النتائج.<br />
            ❌ لا يمكنك تعديل قائمة التحاليل المطلوبة.<br />
            🔐 لا ترى طلبات مختبرات أخرى — فقط ما أُرسل إليك مباشرة.
          </p>
        </div>
      </div>

      {/* ── Requests Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {labRequests.map((req) => {
            const st = STATUS_MAP[req.status] || STATUS_MAP.PENDING;
            const hasResults = req.lab_results && req.lab_results.length > 0;

            return (
              <motion.div key={req.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                layout>
                <Card className="shadow-xl shadow-cyan-500/5 flex flex-col bg-white/70 backdrop-blur-2xl rounded-3xl border-white relative overflow-hidden">

                  {/* Status bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                    req.status === "COMPLETED" ? "bg-emerald-500" :
                    req.status === "PROCESSING" ? "bg-blue-400" : "bg-amber-400"
                  }`} />

                  <CardHeader className="bg-white/50 border-b border-slate-100 pt-5 pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-slate-800 text-base font-bold flex items-center gap-2">
                          <User className="w-4 h-4 text-cyan-500" />
                          {req.patient?.full_name || "مريض"}
                        </CardTitle>
                        {req.patient?.phone && (
                          <p className="text-xs text-slate-400 mt-0.5">{req.patient.phone}</p>
                        )}
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(req.created_at).toLocaleString("ar-DZ")}
                        </p>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border ${st.color}`}>
                        {st.label}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-5 flex-1 flex flex-col">

                    {/* Doctor info */}
                    {req.doctor && (
                      <div className="text-xs text-slate-500 mb-3 flex items-center gap-1.5">
                        <span className="font-bold text-slate-600">طلب بواسطة: {req.doctor.full_name}</span>
                      </div>
                    )}

                    {/* QR Code */}
                    {req.qr_token && (
                      <div className="flex items-center gap-3 bg-cyan-50 border border-cyan-100 rounded-2xl p-3 mb-4">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=${req.qr_token}`}
                          alt="QR"
                          className="w-14 h-14 rounded-xl"
                        />
                        <div>
                          <p className="text-xs font-bold text-cyan-700 mb-1 flex items-center gap-1">
                            <QrCode className="w-3.5 h-3.5" /> رمز التحقق
                          </p>
                          <p className="text-xs font-mono text-cyan-600 break-all">
                            {req.qr_token?.substring(0, 16)}...
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Tests list (READ ONLY — cannot be modified by lab) */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-4 flex-1 shadow-inner">
                      <h4 className="text-slate-500 text-xs font-bold mb-2 flex items-center gap-1.5">
                        <TestTube className="w-3.5 h-3.5" /> التحاليل المطلوبة (للقراءة فقط)
                      </h4>
                      <div className="space-y-1.5">
                        {req.tests_list?.map((t: any, i: number) => (
                          <div key={i} className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200">
                            <span className="text-xs font-mono text-cyan-600">{t.code}</span>
                            <span className="text-sm font-bold text-slate-700">{t.name}</span>
                          </div>
                        ))}
                      </div>

                      {req.doctor_notes && (
                        <div className="mt-3 pt-3 border-t border-slate-200 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-slate-600 font-medium">{req.doctor_notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Uploaded results preview */}
                    {hasResults && (
                      <div className="mb-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-3">
                        <p className="text-xs font-bold text-emerald-700 mb-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> تم رفع النتائج
                        </p>
                        {req.lab_results[0].result_notes && (
                          <p className="text-xs text-slate-600">{req.lab_results[0].result_notes}</p>
                        )}
                      </div>
                    )}

                    {/* ── Action Buttons ── */}
                    {req.status === "PENDING" && (
                      <Button onClick={() => updateStatus(req.id, "PROCESSING")}
                        disabled={processing === req.id}
                        className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 h-11 rounded-2xl text-white font-bold flex items-center justify-center gap-2 mb-2 shadow-sm">
                        <FlaskConical className="w-4 h-4" />
                        {processing === req.id ? "..." : "بدء التحليل"}
                      </Button>
                    )}

                    {req.status === "PROCESSING" && !hasResults && (
                      <Button
                        onClick={() => setUploadPanel({ open: true, requestId: req.id, patientId: req.patient_id })}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 h-11 rounded-2xl text-white font-bold flex items-center justify-center gap-2 shadow-sm">
                        <Upload className="w-4 h-4" /> رفع النتائج
                      </Button>
                    )}

                    {req.status === "COMPLETED" && (
                      <div className="flex items-center justify-center gap-2 py-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 font-bold text-sm">
                        <CheckCircle2 className="w-4 h-4" /> النتائج أُرسلت للمريض
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}

          {labRequests.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white/40 border border-white rounded-3xl shadow-sm text-slate-400">
              <FlaskConical className="w-16 h-16 mb-4 text-cyan-200" />
              <h3 className="text-lg font-bold text-slate-600">لا توجد طلبات تحاليل حالياً</h3>
              <p className="text-sm">ستظهر هنا الطلبات التي يرسلها المرضى إلى مختبركم مباشرة.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ── Upload Results Panel ── */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {uploadPanel?.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
            onClick={() => setUploadPanel(null)}>
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
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
                  <p className="text-xs text-slate-400">ستُرسل للمريض فوراً بعد الرفع</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm font-black text-slate-700 mb-2 block">ملخص النتائج</label>
                  <textarea value={resultNotes} onChange={e => setResultNotes(e.target.value)}
                    placeholder="مثال: سكر الدم الصائم 110 mg/dL — في النطاق الطبيعي..."
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-emerald-400 outline-none resize-none h-28 text-slate-700 font-medium" />
                </div>
                <div>
                  <label className="text-sm font-black text-slate-700 mb-2 block">رابط ملف النتائج (اختياري)</label>
                  <input value={resultFileUrl} onChange={e => setResultFileUrl(e.target.value)}
                    placeholder="https://... (رابط PDF أو صورة)"
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-emerald-400 outline-none text-slate-700 font-medium" />
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={submitResults} disabled={uploading || !resultNotes.trim()}
                  className="flex-1 h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-sm">
                  {uploading ? "جاري الرفع..." : "✅ رفع النتائج وإرسالها للمريض"}
                </Button>
                <Button onClick={() => setUploadPanel(null)}
                  className="h-12 px-5 rounded-2xl border border-slate-200 bg-white text-slate-500 font-bold">
                  إلغاء
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
