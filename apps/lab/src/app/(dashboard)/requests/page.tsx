"use client";

export const dynamic = 'force-dynamic';

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
  PENDING:    { label: "Ù‚ÙŠØ¯ Ø§Ù„Ø§Ù†ØªØ¸Ø§Ø±",  color: "bg-amber-100 text-amber-700 border-amber-200" },
  PROCESSING: { label: "Ø¬Ø§Ø±ÙŠ Ø§Ù„ØªØ­Ù„ÙŠÙ„", color: "bg-blue-100 text-blue-700 border-blue-200" },
  COMPLETED:  { label: "Ø§Ù„Ù†ØªØ§Ø¦Ø¬ Ø¬Ø§Ù‡Ø²Ø©", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  CANCELLED:  { label: "Ù…Ù„ØºÙ‰",          color: "bg-slate-100 text-slate-500 border-slate-200" },
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

  // â”€â”€ Get current user â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user));
  }, [supabase]);

  // â”€â”€ Fetch lab requests (ONLY assigned to THIS lab by patient) â”€â”€
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

  // â”€â”€ Update lab request status â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const updateStatus = async (id: string, status: string) => {
    setProcessing(id);
    // Lab can ONLY update status â€” cannot modify tests_list
    await supabase.from("lab_requests").update({ status }).eq("id", id);
    setProcessing(null);
  };

  // â”€â”€ Upload lab results â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div className="pb-32 w-full" dir="rtl">

      {/* â”€â”€ Header â”€â”€ */}
      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="mb-8 pb-6 border-b border-cyan-100/50">
        <h1 className="text-3xl font-extrabold text-slate-800 mb-2 tracking-tight">
          Ø·Ù„Ø¨Ø§Øª Ø§Ù„ØªØ­Ø§Ù„ÙŠÙ„
        </h1>
        <p className="text-slate-500">
          ØªØ¸Ù‡Ø± Ù‡Ù†Ø§ ÙÙ‚Ø· Ø§Ù„Ø·Ù„Ø¨Ø§Øª Ø§Ù„ØªÙŠ Ø£Ø±Ø³Ù„Ù‡Ø§ Ø§Ù„Ù…Ø±Ø¶Ù‰ Ù…Ø¨Ø§Ø´Ø±Ø© Ø¥Ù„Ù‰ Ù…Ø®ØªØ¨Ø±Ùƒm.
        </p>
      </motion.header>

      {/* â”€â”€ RBAC Notice â”€â”€ */}
      <div className="bg-cyan-50/50 border border-cyan-200 rounded-2xl p-4 mb-8 flex items-start gap-4 shadow-sm">
        <div className="bg-white p-2 rounded-full text-cyan-500 border border-cyan-100 shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-cyan-900">ØµÙ„Ø§Ø­ÙŠØ§ØªÙƒ ÙƒÙ…Ø®ØªØ¨Ø± (RBAC)</h4>
          <p className="text-sm text-slate-600 mt-1">
            âœ… ÙŠÙ…ÙƒÙ†Ùƒ ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø­Ø§Ù„Ø© ÙˆØ±ÙØ¹ Ø§Ù„Ù†ØªØ§Ø¦Ø¬.<br />
            âŒ Ù„Ø§ ÙŠÙ…ÙƒÙ†Ùƒ ØªØ¹Ø¯ÙŠÙ„ Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„ØªØ­Ø§Ù„ÙŠÙ„ Ø§Ù„Ù…Ø·Ù„ÙˆØ¨Ø©.<br />
            ðŸ” Ù„Ø§ ØªØ±Ù‰ Ø·Ù„Ø¨Ø§Øª Ù…Ø®ØªØ¨Ø±Ø§Øª Ø£Ø®Ø±Ù‰ â€” ÙÙ‚Ø· Ù…Ø§ Ø£ÙØ±Ø³Ù„ Ø¥Ù„ÙŠÙƒ Ù…Ø¨Ø§Ø´Ø±Ø©.
          </p>
        </div>
      </div>

      {/* â”€â”€ Requests Grid â”€â”€ */}
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
                          {req.patient?.full_name || "Ù…Ø±ÙŠØ¶"}
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
                        <span className="font-bold text-slate-600">Ø·Ù„Ø¨ Ø¨ÙˆØ§Ø³Ø·Ø©: {req.doctor.full_name}</span>
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
                            <QrCode className="w-3.5 h-3.5" /> Ø±Ù…Ø² Ø§Ù„ØªØ­Ù‚Ù‚
                          </p>
                          <p className="text-xs font-mono text-cyan-600 break-all">
                            {req.qr_token?.substring(0, 16)}...
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Tests list (READ ONLY â€” cannot be modified by lab) */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-4 flex-1 shadow-inner">
                      <h4 className="text-slate-500 text-xs font-bold mb-2 flex items-center gap-1.5">
                        <TestTube className="w-3.5 h-3.5" /> Ø§Ù„ØªØ­Ø§Ù„ÙŠÙ„ Ø§Ù„Ù…Ø·Ù„ÙˆØ¨Ø© (Ù„Ù„Ù‚Ø±Ø§Ø¡Ø© ÙÙ‚Ø·)
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
                          <CheckCircle2 className="w-3.5 h-3.5" /> ØªÙ… Ø±ÙØ¹ Ø§Ù„Ù†ØªØ§Ø¦Ø¬
                        </p>
                        {req.lab_results[0].result_notes && (
                          <p className="text-xs text-slate-600">{req.lab_results[0].result_notes}</p>
                        )}
                      </div>
                    )}

                    {/* â”€â”€ Action Buttons â”€â”€ */}
                    {req.status === "PENDING" && (
                      <Button onClick={() => updateStatus(req.id, "PROCESSING")}
                        disabled={processing === req.id}
                        className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 h-11 rounded-2xl text-white font-bold flex items-center justify-center gap-2 mb-2 shadow-sm">
                        <FlaskConical className="w-4 h-4" />
                        {processing === req.id ? "..." : "Ø¨Ø¯Ø¡ Ø§Ù„ØªØ­Ù„ÙŠÙ„"}
                      </Button>
                    )}

                    {req.status === "PROCESSING" && !hasResults && (
                      <Button
                        onClick={() => setUploadPanel({ open: true, requestId: req.id, patientId: req.patient_id })}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 h-11 rounded-2xl text-white font-bold flex items-center justify-center gap-2 shadow-sm">
                        <Upload className="w-4 h-4" /> Ø±ÙØ¹ Ø§Ù„Ù†ØªØ§Ø¦Ø¬
                      </Button>
                    )}

                    {req.status === "COMPLETED" && (
                      <div className="flex items-center justify-center gap-2 py-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 font-bold text-sm">
                        <CheckCircle2 className="w-4 h-4" /> Ø§Ù„Ù†ØªØ§Ø¦Ø¬ Ø£ÙØ±Ø³Ù„Øª Ù„Ù„Ù…Ø±ÙŠØ¶
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
              <h3 className="text-lg font-bold text-slate-600">Ù„Ø§ ØªÙˆØ¬Ø¯ Ø·Ù„Ø¨Ø§Øª ØªØ­Ø§Ù„ÙŠÙ„ Ø­Ø§Ù„ÙŠØ§Ù‹</h3>
              <p className="text-sm">Ø³ØªØ¸Ù‡Ø± Ù‡Ù†Ø§ Ø§Ù„Ø·Ù„Ø¨Ø§Øª Ø§Ù„ØªÙŠ ÙŠØ±Ø³Ù„Ù‡Ø§ Ø§Ù„Ù…Ø±Ø¶Ù‰ Ø¥Ù„Ù‰ Ù…Ø®ØªØ¨Ø±ÙƒÙ… Ù…Ø¨Ø§Ø´Ø±Ø©.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {/* â”€â”€ Upload Results Panel â”€â”€ */}
      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
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
                  <h3 className="font-black text-slate-800">Ø±ÙØ¹ Ù†ØªØ§Ø¦Ø¬ Ø§Ù„ØªØ­Ù„ÙŠÙ„</h3>
                  <p className="text-xs text-slate-400">Ø³ØªÙØ±Ø³Ù„ Ù„Ù„Ù…Ø±ÙŠØ¶ ÙÙˆØ±Ø§Ù‹ Ø¨Ø¹Ø¯ Ø§Ù„Ø±ÙØ¹</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm font-black text-slate-700 mb-2 block">Ù…Ù„Ø®Øµ Ø§Ù„Ù†ØªØ§Ø¦Ø¬</label>
                  <textarea value={resultNotes} onChange={e => setResultNotes(e.target.value)}
                    placeholder="Ù…Ø«Ø§Ù„: Ø³ÙƒØ± Ø§Ù„Ø¯Ù… Ø§Ù„ØµØ§Ø¦Ù… 110 mg/dL â€” ÙÙŠ Ø§Ù„Ù†Ø·Ø§Ù‚ Ø§Ù„Ø·Ø¨ÙŠØ¹ÙŠ..."
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-emerald-400 outline-none resize-none h-28 text-slate-700 font-medium" />
                </div>
                <div>
                  <label className="text-sm font-black text-slate-700 mb-2 block">Ø±Ø§Ø¨Ø· Ù…Ù„Ù Ø§Ù„Ù†ØªØ§Ø¦Ø¬ (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)</label>
                  <input value={resultFileUrl} onChange={e => setResultFileUrl(e.target.value)}
                    placeholder="https://... (Ø±Ø§Ø¨Ø· PDF Ø£Ùˆ ØµÙˆØ±Ø©)"
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-emerald-400 outline-none text-slate-700 font-medium" />
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={submitResults} disabled={uploading || !resultNotes.trim()}
                  className="flex-1 h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-sm">
                  {uploading ? "Ø¬Ø§Ø±ÙŠ Ø§Ù„Ø±ÙØ¹..." : "âœ… Ø±ÙØ¹ Ø§Ù„Ù†ØªØ§Ø¦Ø¬ ÙˆØ¥Ø±Ø³Ø§Ù„Ù‡Ø§ Ù„Ù„Ù…Ø±ÙŠØ¶"}
                </Button>
                <Button onClick={() => setUploadPanel(null)}
                  className="h-12 px-5 rounded-2xl border border-slate-200 bg-white text-slate-500 font-bold">
                  Ø¥Ù„ØºØ§Ø¡
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
