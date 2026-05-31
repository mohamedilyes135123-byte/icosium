"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import {
  CheckCircle, XCircle, Edit3, AlertCircle,
  Clock, Pill, TestTube, User
} from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────
type DoctorAction = "APPROVE" | "REJECT" | "MODIFY";

interface ActionPanelState {
  open: boolean;
  requestId: string;
  patientId: string;
  requestType: string;
  action: DoctorAction | null;
  testsRequested: any[];
}

// ─────────────────────────────────────────────────────────────────
export default function DoctorRequests() {
  const { lang, t } = useLanguage();
  const supabase = createClient();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [panel, setPanel] = useState<ActionPanelState | null>(null);

  // Form state for the action panel
  const [medications, setMedications] = useState<{ name: string; dose: string; frequency: string; duration: string; notes: string }[]>([
    { name: "", dose: "", frequency: "", duration: "", notes: "" }
  ]);
  const [doctorNotes, setDoctorNotes] = useState("");
  const [modifiedSymptoms, setModifiedSymptoms] = useState("");

  // ── Get current user ──────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user));
  }, [supabase]);

  // ── Fetch requests assigned to this doctor or open ────────────
  const fetchRequests = useCallback(async () => {
    if (!currentUser) return;
    const { data } = await supabase
      .from("medical_requests")
      .select(`
        *,
        patient:profiles!medical_requests_patient_id_fkey(full_name, phone, address),
        doctor_responses(id, action, created_at)
      `)
      .or(`doctor_id.eq.${currentUser.id},doctor_id.is.null`)
      .eq("status", "PENDING")
      .order("created_at", { ascending: false });

    setRequests(data || []);
  }, [supabase, currentUser]);

  useEffect(() => {
    fetchRequests();
    const channel = supabase
      .channel("doctor-requests-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "medical_requests" }, fetchRequests)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase, fetchRequests]);

  // ── Open Action Panel ─────────────────────────────────────────
  const openPanel = (req: any, action: DoctorAction) => {
    setPanel({
      open: true,
      requestId: req.id,
      patientId: req.patient_id,
      requestType: req.type,
      action,
      testsRequested: req.tests_requested || [],
    });
    setMedications([{ name: "", dose: "", frequency: "", duration: "", notes: "" }]);
    setDoctorNotes("");
    setModifiedSymptoms(req.symptoms || "");
  };

  // ── Confirm Doctor Action ─────────────────────────────────────
  const confirmAction = async () => {
    if (!panel || !currentUser) return;
    setLoading(true);

    // 1. Insert doctor_response (trigger auto-updates medical_request.status)
    const { data: response, error: respErr } = await supabase
      .from("doctor_responses")
      .insert([{
        request_id: panel.requestId,
        doctor_id: currentUser.id,
        action: panel.action,
        notes: doctorNotes || null,
        modified_symptoms: panel.action === "MODIFY" ? modifiedSymptoms : null,
      }])
      .select()
      .single();

    if (respErr || !response) { setLoading(false); return; }

    // 2. If APPROVE + PRESCRIPTION → create prescription
    if (panel.action === "APPROVE" && panel.requestType === "PRESCRIPTION") {
      const validMeds = medications.filter(m => m.name.trim());
      if (validMeds.length > 0) {
        await supabase.from("prescriptions").insert([{
          request_id: panel.requestId,
          response_id: response.id,
          patient_id: panel.patientId,
          doctor_id: currentUser.id,
          medications: validMeds,
          doctor_notes: doctorNotes || null,
        }]);
      }
    }

    // 3. If APPROVE + LAB → create lab_request
    if (panel.action === "APPROVE" && (panel.requestType === "LAB" || panel.requestType === "ROUTINE_LAB")) {
      const tests = panel.testsRequested.length > 0
        ? panel.testsRequested
        : [{ name: lang === "ar" ? "تحليل روتيني عام" : "Analyse de routine générale", code: "GENERAL" }];

      await supabase.from("lab_requests").insert([{
        request_id: panel.requestId,
        patient_id: panel.patientId,
        doctor_id: currentUser.id,
        tests_list: tests,
        doctor_notes: doctorNotes || null,
      }]);
    }

    setPanel(null);
    fetchRequests();
    setLoading(false);
  };

  // ── Add / Remove medication row ───────────────────────────────
  const addMed = () => setMedications(m => [...m, { name: "", dose: "", frequency: "", duration: "", notes: "" }]);
  const removeMed = (i: number) => setMedications(m => m.filter((_, idx) => idx !== i));
  const updateMed = (i: number, field: string, val: string) =>
    setMedications(m => m.map((med, idx) => idx === i ? { ...med, [field]: val } : med));

  // ─────────────────────────────────────────────────────────────
  return (
    <div key={lang} className="w-full pb-32" dir={lang === "ar" ? "rtl" : "ltr"}>

      {/* ── Header ── */}
      <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="flex justify-between items-center mb-8 bg-white/40 backdrop-blur-lg p-4 rounded-[2rem] border border-white/60 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 leading-none mb-1">{t("medicalRequests")}</h1>
            <p className="text-xs font-bold text-blue-500">{t("reqRequiresAppr")}</p>
          </div>
        </div>
        <span className="bg-rose-100 text-rose-700 font-black text-sm px-3 py-1.5 rounded-xl border border-rose-200">
          {requests.length} {t("demands")}
        </span>
      </motion.header>

      {/* ── Requests List ── */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {requests.map((req, i) => (
            <motion.div key={req.id}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1, transition: { delay: i * 0.05 } }}
              exit={{ opacity: 0, height: 0, overflow: "hidden" }}
              className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all flex flex-col relative overflow-hidden border-2 border-slate-200 hover:border-blue-300">

              {/* ── Request header ── */}
              <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-xl leading-tight mb-1">{req.patient?.full_name || t("patientNamePlaceholder")}</h3>
                    <p className="text-sm font-semibold text-slate-400">{req.patient?.phone || t("noPhoneNumber")}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className={`text-xs font-black px-3.5 py-2 rounded-full border ${
                    req.type === "PRESCRIPTION" ? "bg-purple-50/50 text-purple-600 border-purple-100" :
                    req.type === "LAB" ? "bg-cyan-50/50 text-cyan-600 border-cyan-100" : "bg-teal-50/50 text-teal-600 border-teal-100"
                  }`}>
                    {req.type === "PRESCRIPTION" ? (lang === "ar" ? "🩺 وصفة" : "🩺 Ordonnance") : req.type === "LAB" ? (lang === "ar" ? "🧪 تحليل" : "🧪 Analyse") : (lang === "ar" ? "🔁 روتيني" : "🔁 Routine")}
                  </span>
                  {req.priority === "urgent" && (
                    <span className="text-xs font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 animate-pulse">{t("urgentTag")}</span>
                  )}
                  {!req.doctor_id && (
                    <span className="text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100 font-bold">{t("diffusionGeneral")}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 mb-5 text-sm text-slate-400 font-medium">
                 <Clock className="w-4 h-4" /> {new Date(req.created_at).toLocaleString(lang === "ar" ? "ar-DZ" : "fr-DZ")}
              </div>

              <hr className="border-slate-50 mb-5" />

              {/* ── Symptoms / Tests ── */}
              <div className="mb-5 flex-grow">
                {req.symptoms && (
                  <p className="text-slate-700 font-medium text-base leading-relaxed mb-4">{req.symptoms}</p>
                )}
                {req.tests_requested && req.tests_requested.length > 0 && (
                  <div className="mb-5">
                    <p className="text-sm font-bold text-slate-400 mb-2.5 uppercase tracking-wide">{lang === "ar" ? "التحاليل المطلوبة:" : "Analyses demandées :"}</p>
                    <div className="flex flex-wrap gap-2">
                      {req.tests_requested.map((t: any, idx: number) => (
                        <span key={idx} className="text-sm bg-cyan-50 border border-cyan-100 text-cyan-700 px-3 py-1.5 rounded-xl font-bold">
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {req.patient_notes && (
                  <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100/80 mt-3">
                    <p className="text-xs text-slate-400 font-bold mb-2 uppercase tracking-wide">{lang === "ar" ? "ملاحظة المريض: " : "Note du patient : "}</p>
                    <p className="text-base font-medium text-slate-600 italic">"{req.patient_notes}"</p>
                  </div>
                )}
              </div>

              {/* ── Action Buttons ── */}
              <div className="mt-auto grid grid-cols-3 gap-3 pt-3">
                <Button onClick={() => openPanel(req, "REJECT")}
                  className="flex flex-col items-center justify-center gap-1.5 py-4 h-auto bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl font-bold text-sm border border-slate-200 hover:border-rose-200 transition-colors shadow-none">
                  <XCircle className="w-5 h-5" />{t("rejectBtn")}</Button>
                <Button onClick={() => openPanel(req, "MODIFY")}
                  className="flex flex-col items-center justify-center gap-1.5 py-4 h-auto bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-xl font-bold text-sm border border-slate-200 hover:border-blue-200 transition-colors shadow-none">
                  <Edit3 className="w-5 h-5" />{t("modifyBtn")}</Button>
                <Button onClick={() => openPanel(req, "APPROVE")}
                  className="flex flex-col items-center justify-center gap-1.5 py-4 h-auto bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-xl font-black text-sm shadow-md shadow-blue-500/20 transition-all border-none">
                  <CheckCircle className="w-5 h-5" />{t("approveBtn")}</Button>
              </div>
            </motion.div>
          ))}

          {requests.length === 0 && (
            <div className="flex flex-col items-center justify-center p-10 bg-white/40 backdrop-blur-sm rounded-[2rem] border border-white/60 shadow-inner">
              <CheckCircle className="w-12 h-12 text-slate-300 mb-4" />
              <h4 className="text-slate-600 font-bold mb-1">{t("noPendingRequests")}</h4>
              <p className="text-slate-400 text-sm text-center">{t("onlinePatientQueueDesc")}</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Action Panel (Bottom Sheet) ── */}
      {typeof window !== "undefined" && createPortal(
        <AnimatePresence>
          {panel?.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[999] flex items-center justify-center p-4"
            onClick={() => setPanel(null)}>
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="w-full max-w-2xl bg-gradient-to-br from-blue-600 to-cyan-500 rounded-[2rem] p-8 shadow-2xl border border-blue-400 text-white relative overflow-hidden"
              onClick={e => e.stopPropagation()}>

              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 blur-2xl rounded-full translate-x-10 -translate-y-10"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-cyan-400/20 blur-2xl rounded-full -translate-x-10 translate-y-10"></div>

              <div className="relative z-10">
                {/* Panel Header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-black/10">
                     {panel.action === "APPROVE" && <img src="/icon_confirm_action.png" alt="" className="w-8 h-8 object-contain" />}
                     {panel.action === "REJECT"  && <XCircle className="w-8 h-8 text-rose-600" />}
                     {panel.action === "MODIFY"  && <Edit3 className="w-8 h-8 text-blue-600" />}
                  </div>
                  <div>
                    <h3 className="font-black text-2xl text-white">
                      {panel.action === "APPROVE" ? t("confirmApprove") :
                       panel.action === "REJECT"  ? t("confirmReject") :
                       t("modifyRequest")}
                    </h3>
                    <p className="text-sm font-bold text-blue-100">
                      {panel.action === "APPROVE" && panel.requestType === "PRESCRIPTION" ? t("enterMedsDesc") :
                       panel.action === "APPROVE" ? t("sendLabDesc") :
                       panel.action === "REJECT"  ? t("enterReasonRejectDesc") :
                       t("editCaseDesc")}
                    </p>
                  </div>
                </div>

                {/* Prescription form (APPROVE + PRESCRIPTION) */}
                {panel.action === "APPROVE" && panel.requestType === "PRESCRIPTION" && (
                  <div className="mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                    <label className="text-sm font-black text-white mb-3 block flex items-center gap-2">
                      <img src="/icon_prescription.png" className="w-6 h-6 object-contain filter drop-shadow-md" /> {t("prescribedMeds")}
                    </label>
                    {medications.map((med, i) => (
                      <div key={i} className="bg-white rounded-2xl p-5 mb-4 shadow-xl shadow-black/10 border border-white">
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <input value={med.name} onChange={e => updateMed(i, "name", e.target.value)}
                            placeholder={t("medNamePlaceholder")} className="p-3.5 rounded-xl border-2 border-slate-100 text-sm font-black text-slate-800 placeholder-slate-400 bg-slate-50 focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-300/30 outline-none transition-all" />
                          <input value={med.dose} onChange={e => updateMed(i, "dose", e.target.value)}
                            placeholder={t("dosagePlaceholder")} className="p-3.5 rounded-xl border-2 border-slate-100 text-sm font-black text-slate-800 placeholder-slate-400 bg-slate-50 focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-300/30 outline-none transition-all" />
                          <input value={med.frequency} onChange={e => updateMed(i, "frequency", e.target.value)}
                            placeholder={t("frequencyPlaceholder")} className="p-3.5 rounded-xl border-2 border-slate-100 text-sm font-black text-slate-800 placeholder-slate-400 bg-slate-50 focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-300/30 outline-none transition-all" />
                          <input value={med.duration} onChange={e => updateMed(i, "duration", e.target.value)}
                            placeholder={t("durationPlaceholder")} className="p-3.5 rounded-xl border-2 border-slate-100 text-sm font-black text-slate-800 placeholder-slate-400 bg-slate-50 focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-300/30 outline-none transition-all" />
                        </div>
                        <input value={med.notes} onChange={e => updateMed(i, "notes", e.target.value)}
                          placeholder={t("addNotesPlaceholder")} className="w-full p-3.5 rounded-xl border-2 border-slate-100 text-sm font-black text-slate-800 placeholder-slate-400 bg-slate-50 focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-300/30 outline-none transition-all" />
                        {medications.length > 1 && (
                          <button onClick={() => removeMed(i)} className="mt-3 text-sm text-rose-500 font-bold hover:text-rose-600 transition-colors">
                            ✕ {t("deleteMedRow")}
                          </button>
                        )}
                      </div>
                    ))}
                    <button onClick={addMed} className="text-sm text-white font-bold flex items-center gap-1.5 hover:text-cyan-100 transition-colors bg-white/10 px-4 py-2 rounded-xl">
                      + {t("addAnotherMed")}
                    </button>
                  </div>
                )}

                {/* Lab tests confirmation (APPROVE + LAB) */}
                {panel.action === "APPROVE" && panel.requestType !== "PRESCRIPTION" && panel.testsRequested.length > 0 && (
                  <div className="mb-6 bg-white rounded-2xl p-5 shadow-xl shadow-black/10 border border-white">
                    <p className="text-base font-black text-slate-800 mb-4 flex items-center gap-2">
                      <img src="/icon_lab_test.png" className="w-6 h-6 object-contain" /> {t("labTestsRequestedWarning")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {panel.testsRequested.map((t: any, i: number) => (
                        <span key={i} className="text-sm bg-blue-50 border border-blue-100 text-blue-700 px-3 py-1.5 rounded-xl font-black shadow-sm">
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Modify: edit symptoms */}
                {panel.action === "MODIFY" && (
                  <div className="mb-6">
                    <label className="text-sm font-black text-white mb-2 block">{t("modifyCaseDescription")}</label>
                    <textarea value={modifiedSymptoms} onChange={e => setModifiedSymptoms(e.target.value)}
                      className="w-full p-4 rounded-2xl bg-white border-2 border-slate-100 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/30 outline-none resize-none h-28 text-slate-800 font-bold placeholder-slate-400 shadow-xl shadow-black/5" />
                  </div>
                )}

                {/* Doctor notes */}
                <div className="mb-8">
                  <label className="text-sm font-black text-white mb-2 block">
                    {panel.action === "REJECT" ? t("rejectionReasonLabelRequired") : t("patientNotesOptional")}
                  </label>
                  <textarea value={doctorNotes} onChange={e => setDoctorNotes(e.target.value)}
                    placeholder={panel.action === "REJECT" ? t("rejectionReasonPlaceholder") : t("patientNotesPlaceholderEx")}
                    className="w-full p-4 rounded-2xl bg-white border-2 border-slate-100 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/30 outline-none resize-none h-28 text-slate-800 font-bold placeholder-slate-400 shadow-xl shadow-black/5" />
                </div>

                <div className="flex gap-4">
                  <Button onClick={confirmAction} disabled={loading || (panel.action === "REJECT" && !doctorNotes.trim())}
                    className="flex-1 h-14 rounded-2xl bg-white text-blue-600 hover:bg-cyan-50 font-black text-base shadow-lg shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
                    {loading ? t("saving") : (
                      panel.action === "APPROVE" ? <><img src="/icon_confirm_action.png" className="w-5 h-5 object-contain" /> {t("confirmApprove")}</> :
                      panel.action === "REJECT"  ? <><XCircle className="w-5 h-5" /> {t("confirmReject")}</> :
                      <><Edit3 className="w-5 h-5" /> {t("modifyRequest")}</>
                    )}
                  </Button>
                  <Button onClick={() => setPanel(null)}
                    className="h-14 px-6 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-base border border-white/20 transition-all">{t("cancelBtn")}</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
