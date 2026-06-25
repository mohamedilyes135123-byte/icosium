"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  TestTube, CheckCircle2, FlaskConical, AlertTriangle,
  User, QrCode, Clock, Upload, ShieldAlert
} from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

export default function LabRequests() {
  const { lang, t } = useLanguage();
  const supabase = createClient();
  const [labRequests, setLabRequests] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const STATUS_MAP: Record<string, { label: string; color: string }> = {
    PENDING:    { label: t("reqStatusPending"),    color: "bg-amber-100 text-amber-700 border-amber-200" },
    PROCESSING: { label: t("reqStatusProcessing"), color: "bg-blue-100 text-blue-700 border-blue-200" },
    COMPLETED:  { label: t("reqStatusCompleted"),  color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    CANCELLED:  { label: t("reqStatusCancelled"),  color: "bg-slate-100 text-slate-500 border-slate-200" },
  };

  // Result upload panel
  const [uploadPanel, setUploadPanel] = useState<{ open: boolean; requestId: string; patientId: string } | null>(null);
  const [resultNotes, setResultNotes] = useState("");
  const [resultFileUrl, setResultFileUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user));
  }, [supabase]);

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

  const updateStatus = async (id: string, status: string) => {
    setProcessing(id);
    await supabase.from("lab_requests").update({ status }).eq("id", id);
    setProcessing(null);
  };

  const handleDeleteRequest = async (id: string) => {
    if (!confirm(t("deleteConfirm"))) return;
    setIsDeleting(id);
    const { error } = await supabase.from("lab_requests").delete().eq("id", id);
    if (!error) {
      setLabRequests(prev => prev.filter(req => req.id !== id));
    } else {
      alert(t("deleteError") + error.message);
    }
    setIsDeleting(null);
  };

  const submitResults = async () => {
    if (!uploadPanel || !currentUser) return;
    setUploading(true);
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

  return (
    <div className="pb-32 w-full" dir={lang === "ar" ? "rtl" : "ltr"}>

      {/* Header */}
      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="mb-8 pb-6 border-b border-cyan-100/50">
        <h1 className="text-3xl font-extrabold text-slate-800 mb-2 tracking-tight">
          {t("requestsTitle")}
        </h1>
        <p className="text-slate-500">{t("requestsSubtitle")}</p>
      </motion.header>

      {/* RBAC Notice */}
      <div className="bg-cyan-50/50 border border-cyan-200 rounded-2xl p-4 mb-8 flex items-start gap-4 shadow-sm">
        <div className="bg-white p-2 rounded-full text-cyan-500 border border-cyan-100 shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-cyan-900">{t("rbacNoticeTitle")}</h4>
          <p className="text-sm text-slate-600 mt-1">
            {t("rbacNoticeLine1")}<br />
            {t("rbacNoticeLine2")}<br />
            {t("rbacNoticeLine3")}
          </p>
        </div>
      </div>

      {/* Requests Grid */}
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
                          {req.patient?.full_name || t("patientLabel")}
                        </CardTitle>
                        {req.patient?.phone && (
                          <p className="text-xs text-slate-400 mt-0.5">{req.patient.phone}</p>
                        )}
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(req.created_at).toLocaleString(lang === "ar" ? "ar-DZ" : "fr-DZ")}
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
                        <span className="font-bold text-slate-600">{t("requestedBy")} {req.doctor.full_name}</span>
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
                            <QrCode className="w-3.5 h-3.5" /> {t("verifyCode")}
                          </p>
                          <p className="text-xs font-mono text-cyan-600 break-all">
                            {req.qr_token?.substring(0, 16)}...
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Tests list (READ ONLY) */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-4 flex-1 shadow-inner">
                      <h4 className="text-slate-500 text-xs font-bold mb-2 flex items-center gap-1.5">
                        <TestTube className="w-3.5 h-3.5" /> {t("testsListLabel")}
                      </h4>
                      <div className="space-y-1.5">
                        {req.tests_list?.map((test: any, i: number) => (
                          <div key={i} className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200">
                            <span className="text-xs font-mono text-cyan-600">{test.code}</span>
                            <span className="text-sm font-bold text-slate-700">{test.name}</span>
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
                          <CheckCircle2 className="w-3.5 h-3.5" /> {t("resultsUploaded")}
                        </p>
                        {req.lab_results[0].result_notes && (
                          <p className="text-xs text-slate-600">{req.lab_results[0].result_notes}</p>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    {req.status === "PENDING" && (
                      <Button onClick={() => updateStatus(req.id, "PROCESSING")}
                        disabled={processing === req.id}
                        className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 h-11 rounded-2xl text-white font-bold flex items-center justify-center gap-2 mb-2 shadow-sm">
                        <FlaskConical className="w-4 h-4" />
                        {processing === req.id ? "..." : t("startAnalysis")}
                      </Button>
                    )}

                    {req.status === "PROCESSING" && !hasResults && (
                      <Button
                        onClick={() => setUploadPanel({ open: true, requestId: req.id, patientId: req.patient_id })}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 h-11 rounded-2xl text-white font-bold flex items-center justify-center gap-2 shadow-sm">
                        <Upload className="w-4 h-4" /> {t("uploadResults")}
                      </Button>
                    )}

                    {req.status === "COMPLETED" && (
                      <div className="flex items-center justify-center gap-2 py-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 font-bold text-sm mb-2">
                        <CheckCircle2 className="w-4 h-4" /> {t("resultsSentToPatient")}
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
              <h3 className="text-lg font-bold text-slate-600">{t("noAnalysisRequests")}</h3>
              <p className="text-sm">{t("noAnalysisSubtitle")}</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Upload Results Panel */}
      <AnimatePresence>
        {uploadPanel?.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setUploadPanel(null)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100"
              onClick={e => e.stopPropagation()}>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-lg">{t("uploadModalTitle")}</h3>
                  <p className="text-sm text-slate-500 mt-0.5">{t("uploadModalSubtitle")}</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">{t("resultSummaryLabel")}</label>
                  <textarea value={resultNotes} onChange={e => setResultNotes(e.target.value)}
                    placeholder={t("resultSummaryPlaceholder")}
                    className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-emerald-400 focus:bg-white outline-none resize-none h-28 text-slate-700 font-medium transition-all" />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">{t("resultFileLinkLabel")}</label>
                  <input value={resultFileUrl} onChange={e => setResultFileUrl(e.target.value)}
                    placeholder={t("resultFileLinkPlaceholder")}
                    className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-emerald-400 focus:bg-white outline-none text-slate-700 font-medium transition-all" />
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={submitResults} disabled={uploading || !resultNotes.trim()}
                  className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50">
                  {uploading ? t("uploading") : t("uploadAndSendBtn")}
                </Button>
                <Button onClick={() => setUploadPanel(null)}
                  className="h-12 px-6 rounded-xl border-2 border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all">
                  {t("cancel")}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
