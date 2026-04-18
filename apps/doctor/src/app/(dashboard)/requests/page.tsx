"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import {
  CheckCircle, XCircle, Edit3, AlertCircle, FileSignature,
  FlaskConical, ChevronDown, User, Clock, Pill, TestTube, BrainCircuit
} from "lucide-react";
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
        : [{ name: "تحليل روتيني عام", code: "GENERAL" }];

      await supabase.from("lab_requests").insert([{
        request_id: panel.requestId,
        patient_id: panel.patientId,
        doctor_id: currentUser.id,
        tests_list: tests,
        doctor_notes: doctorNotes || null,
        // lab_id is NULL — patient chooses the lab
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
    <div className="w-full pb-32" dir="rtl">

      {/* ── Header ── */}
      <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="flex justify-between items-center mb-8 bg-white/40 backdrop-blur-lg p-4 rounded-[2rem] border border-white/60 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 leading-none mb-1">طلبات المرضى</h1>
            <p className="text-xs font-bold text-blue-500">تحتاج لموافقتك</p>
          </div>
        </div>
        <span className="bg-rose-100 text-rose-700 font-black text-sm px-3 py-1.5 rounded-xl border border-rose-200">
          {requests.length} طلب
        </span>
      </motion.header>

      {/* ── Requests List ── */}
      <div className="space-y-5">
        <AnimatePresence>
          {requests.map((req, i) => (
            <motion.div key={req.id}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1, transition: { delay: i * 0.05 } }}
              exit={{ opacity: 0, height: 0, overflow: "hidden" }}
              className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] p-6 shadow-xl shadow-blue-500/5 relative">

              {/* ── Request header ── */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{req.patient?.full_name || "مريض"}</h3>
                      {req.patient?.phone && <p className="text-xs text-slate-400">{req.patient.phone}</p>}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {new Date(req.created_at).toLocaleString("ar-DZ")}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                    req.type === "PRESCRIPTION" ? "bg-purple-100 text-purple-700" :
                    req.type === "LAB" ? "bg-cyan-100 text-cyan-700" : "bg-teal-100 text-teal-700"
                  }`}>
                    {req.type === "PRESCRIPTION" ? "🩺 وصفة" : req.type === "LAB" ? "🧪 تحليل" : "🔁 روتيني"}
                  </span>
                  {req.priority === "urgent" && (
                    <span className="text-xs font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200 animate-pulse">
                      🚨 عاجل
                    </span>
                  )}
                  {!req.doctor_id && (
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100 font-bold">
                      بث عام
                    </span>
                  )}
                </div>
              </div>

              {/* ── Symptoms / Tests ── */}
              <div className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100">
                {req.symptoms && (
                  <p className="text-slate-700 font-medium text-sm leading-relaxed">{req.symptoms}</p>
                )}
                {req.tests_requested && req.tests_requested.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-slate-500 mb-2">التحاليل المطلوبة:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {req.tests_requested.map((t: any, idx: number) => (
                        <span key={idx} className="text-xs bg-cyan-100 text-cyan-700 px-2 py-1 rounded-lg font-bold">
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {req.patient_notes && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="text-xs text-slate-500 font-medium">
                      <span className="font-bold">ملاحظة المريض: </span>{req.patient_notes}
                    </p>
                  </div>
                )}
              </div>

              {/* ── Action Buttons ── */}
              <div className="grid grid-cols-3 gap-2">
                <Button onClick={() => openPanel(req, "APPROVE")}
                  className="flex flex-col items-center gap-1.5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold text-sm shadow-md shadow-emerald-500/20">
                  <CheckCircle className="w-5 h-5" /> موافقة
                </Button>
                <Button onClick={() => openPanel(req, "MODIFY")}
                  className="flex flex-col items-center gap-1.5 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-md shadow-blue-500/20">
                  <Edit3 className="w-5 h-5" /> تعديل
                </Button>
                <Button onClick={() => openPanel(req, "REJECT")}
                  className="flex flex-col items-center gap-1.5 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold text-sm shadow-md shadow-rose-500/20">
                  <XCircle className="w-5 h-5" /> رفض
                </Button>
              </div>
            </motion.div>
          ))}

          {requests.length === 0 && (
            <div className="flex flex-col items-center justify-center p-10 bg-white/40 backdrop-blur-sm rounded-[2rem] border border-white/60 shadow-inner">
              <CheckCircle className="w-12 h-12 text-slate-300 mb-4" />
              <h4 className="text-slate-600 font-bold mb-1">لا توجد طلبات في الانتظار</h4>
              <p className="text-slate-400 text-sm text-center">
                أنت متصل بالشبكة. أي طلب جديد من مريض سيظهر هنا فوراً.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ── Action Panel (Bottom Sheet) ── */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {panel?.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
            onClick={() => setPanel(null)}>
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 22 }}
              className="w-full bg-white rounded-t-[2rem] p-6 max-h-[85vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}>

              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-4" />

              {/* Panel Header */}
              <div className={`flex items-center gap-3 mb-6 p-4 rounded-2xl ${
                panel.action === "APPROVE" ? "bg-emerald-50 border border-emerald-200" :
                panel.action === "REJECT"  ? "bg-rose-50 border border-rose-200" :
                "bg-blue-50 border border-blue-200"
              }`}>
                {panel.action === "APPROVE" && <CheckCircle className="w-6 h-6 text-emerald-600" />}
                {panel.action === "REJECT"  && <XCircle className="w-6 h-6 text-rose-600" />}
                {panel.action === "MODIFY"  && <Edit3 className="w-6 h-6 text-blue-600" />}
                <div>
                  <h3 className="font-black text-slate-800">
                    {panel.action === "APPROVE" ? "تأكيد الموافقة" :
                     panel.action === "REJECT"  ? "تأكيد الرفض" : "تعديل الطلب"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {panel.action === "APPROVE" && panel.requestType === "PRESCRIPTION" ? "أدخل الأدوية المناسبة للمريض" :
                     panel.action === "APPROVE" ? "سيتم إرسال طلب التحليل للمريض" :
                     panel.action === "REJECT"  ? "أدخل سبب الرفض" : "عدّل وصف الحالة"}
                  </p>
                </div>
              </div>

              {/* Prescription form (APPROVE + PRESCRIPTION) */}
              {panel.action === "APPROVE" && panel.requestType === "PRESCRIPTION" && (
                <div className="mb-5">
                  <label className="text-sm font-black text-slate-700 mb-3 block flex items-center gap-2">
                    <Pill className="w-4 h-4" /> الأدوية الموصوفة
                  </label>
                  {medications.map((med, i) => (
                    <div key={i} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-3">
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <input value={med.name} onChange={e => updateMed(i, "name", e.target.value)}
                          placeholder="اسم الدواء *" className="p-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:border-blue-400 outline-none" />
                        <input value={med.dose} onChange={e => updateMed(i, "dose", e.target.value)}
                          placeholder="الجرعة (مثال: 500mg)" className="p-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:border-blue-400 outline-none" />
                        <input value={med.frequency} onChange={e => updateMed(i, "frequency", e.target.value)}
                          placeholder="التكرار (مثال: 3x يومياً)" className="p-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:border-blue-400 outline-none" />
                        <input value={med.duration} onChange={e => updateMed(i, "duration", e.target.value)}
                          placeholder="المدة (مثال: 7 أيام)" className="p-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:border-blue-400 outline-none" />
                      </div>
                      <input value={med.notes} onChange={e => updateMed(i, "notes", e.target.value)}
                        placeholder="ملاحظات إضافية (اختياري)" className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:border-blue-400 outline-none" />
                      {medications.length > 1 && (
                        <button onClick={() => removeMed(i)} className="mt-2 text-xs text-rose-500 font-bold">
                          ✕ حذف هذا الدواء
                        </button>
                      )}
                    </div>
                  ))}
                  <button onClick={addMed} className="text-sm text-blue-600 font-bold flex items-center gap-1.5 hover:underline">
                    + إضافة دواء آخر
                  </button>
                </div>
              )}

              {/* Lab tests confirmation (APPROVE + LAB) */}
              {panel.action === "APPROVE" && panel.requestType !== "PRESCRIPTION" && panel.testsRequested.length > 0 && (
                <div className="mb-5 bg-cyan-50 border border-cyan-200 rounded-2xl p-4">
                  <p className="text-sm font-bold text-cyan-800 mb-3 flex items-center gap-2">
                    <TestTube className="w-4 h-4" /> التحاليل المطلوبة (ستُرسل للمختبر بعد أن يختاره المريض)
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {panel.testsRequested.map((t: any, i: number) => (
                      <span key={i} className="text-xs bg-cyan-100 text-cyan-700 px-2.5 py-1.5 rounded-lg font-bold border border-cyan-200">
                        {t.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Modify: edit symptoms */}
              {panel.action === "MODIFY" && (
                <div className="mb-5">
                  <label className="text-sm font-black text-slate-700 mb-2 block">تعديل وصف الحالة</label>
                  <textarea value={modifiedSymptoms} onChange={e => setModifiedSymptoms(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-blue-200 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none h-24 text-slate-700 font-medium" />
                </div>
              )}

              {/* Doctor notes */}
              <div className="mb-6">
                <label className="text-sm font-black text-slate-700 mb-2 block">
                  {panel.action === "REJECT" ? "سبب الرفض (مطلوب)" : "ملاحظات للمريض (اختياري)"}
                </label>
                <textarea value={doctorNotes} onChange={e => setDoctorNotes(e.target.value)}
                  placeholder={panel.action === "REJECT" ? "مثال: الأعراض لا تستدعي هذا الدواء..." : "مثال: تناول الدواء مع الطعام..."}
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none h-24 text-slate-700 font-medium" />
              </div>

              <div className="flex gap-3">
                <Button onClick={confirmAction} disabled={loading || (panel.action === "REJECT" && !doctorNotes.trim())}
                  className={`flex-1 h-12 rounded-2xl text-white font-bold shadow-md ${
                    panel.action === "APPROVE" ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20" :
                    panel.action === "REJECT"  ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20" :
                    "bg-blue-500 hover:bg-blue-600 shadow-blue-500/20"
                  }`}>
                  {loading ? "جاري الحفظ..." : (
                    panel.action === "APPROVE" ? "✅ تأكيد الموافقة" :
                    panel.action === "REJECT"  ? "❌ تأكيد الرفض" : "✏️ تأكيد التعديل"
                  )}
                </Button>
                <Button onClick={() => setPanel(null)}
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
