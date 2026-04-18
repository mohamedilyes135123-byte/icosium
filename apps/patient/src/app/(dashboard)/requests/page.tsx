"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import {
  Stethoscope, FlaskConical, Send, Clock, CheckCircle2,
  XCircle, AlertTriangle, ChevronDown, Pill, TestTube,
  RotateCcw, Building2, ArrowRight, QrCode
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────
type RequestType = "PRESCRIPTION" | "LAB" | "ROUTINE_LAB";
type TabView = "new" | "my_requests";

const ROUTINE_TESTS = [
  { name: "صورة الدم الكاملة CBC", code: "CBC" },
  { name: "سكر الدم الصائم", code: "FBG" },
  { name: "سكر بعد الأكل", code: "PPBG" },
  { name: "وظائف الكبد", code: "LFT" },
  { name: "وظائف الكلى", code: "RFT" },
  { name: "صورة دهنيات الدم", code: "LIPID" },
  { name: "فيتامين D", code: "VIT_D" },
  { name: "هرمون الغدة الدرقية TSH", code: "TSH" },
  { name: "تحليل البول", code: "UA" },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: JSX.Element }> = {
  PENDING:  { label: "قيد الانتظار",     color: "text-amber-600 bg-amber-50 border-amber-200",  icon: <Clock className="w-3.5 h-3.5" /> },
  APPROVED: { label: "موافق",            color: "text-emerald-600 bg-emerald-50 border-emerald-200", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  REJECTED: { label: "مرفوض",           color: "text-rose-600 bg-rose-50 border-rose-200",       icon: <XCircle className="w-3.5 h-3.5" /> },
  MODIFIED: { label: "معدّل من الطبيب", color: "text-blue-600 bg-blue-50 border-blue-200",       icon: <AlertTriangle className="w-3.5 h-3.5" /> },
};

// ─── Main Component ───────────────────────────────────────────────
export default function PatientRequests() {
  const supabase = createClient();
  const [tab, setTab] = useState<TabView>("my_requests");
  const [doctors, setDoctors] = useState<any[]>([]);
  const [providers, setProviders] = useState<{ labs: any[]; pharmacies: any[] }>({ labs: [], pharmacies: [] });
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Form state
  const [reqType, setReqType] = useState<RequestType>("PRESCRIPTION");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [priority, setPriority] = useState("normal");

  // Provider selection modal
  const [providerModal, setProviderModal] = useState<{
    open: boolean;
    type: "lab" | "pharmacy";
    requestId: string;
    prescriptionId?: string;
    labRequestId?: string;
  } | null>(null);

  // ── Fetch current user ─────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user));
  }, [supabase]);

  // ── Fetch doctors, labs, pharmacies ───────────────────────────
  const fetchProviders = useCallback(async () => {
    const [{ data: docs }, { data: labs }, { data: pharms }] = await Promise.all([
      supabase.from("profiles").select("id,full_name,specialty,address").eq("role", "doctor").eq("approval_status", "approved"),
      supabase.from("profiles").select("id,full_name,address").eq("role", "lab").eq("approval_status", "approved"),
      supabase.from("profiles").select("id,full_name,address").eq("role", "pharmacy").eq("approval_status", "approved"),
    ]);
    setDoctors(docs || []);
    setProviders({ labs: labs || [], pharmacies: pharms || [] });
  }, [supabase]);

  // ── Fetch patient requests ─────────────────────────────────────
  const fetchRequests = useCallback(async () => {
    if (!currentUser) return;
    const { data } = await supabase
      .from("medical_requests")
      .select(`
        *,
        doctor:profiles!medical_requests_doctor_id_fkey(full_name, specialty),
        doctor_responses(*),
        prescriptions(id, qr_token, medications, is_used),
        lab_requests(id, qr_token, tests_list, status, lab_id)
      `)
      .eq("patient_id", currentUser.id)
      .order("created_at", { ascending: false });

    setRequests(data || []);
  }, [supabase, currentUser]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  useEffect(() => {
    fetchRequests();
    const channel = supabase
      .channel("patient-requests-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "medical_requests" }, fetchRequests)
      .on("postgres_changes", { event: "*", schema: "public", table: "doctor_responses" }, fetchRequests)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase, fetchRequests]);

  // ── Submit new request ─────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (reqType === "PRESCRIPTION" && !symptoms.trim()) return;
    if (reqType !== "PRESCRIPTION" && selectedTests.length === 0) return;
    setLoading(true);

    const payload: any = {
      patient_id: currentUser.id,
      doctor_id: selectedDoctorId || null,
      type: reqType,
      priority,
    };

    if (reqType === "PRESCRIPTION") {
      payload.symptoms = symptoms;
    } else {
      payload.tests_requested = selectedTests.map(code =>
        ROUTINE_TESTS.find(t => t.code === code) || { name: code, code }
      );
    }

    const { error } = await supabase.from("medical_requests").insert([payload]);

    if (!error) {
      setSymptoms("");
      setSelectedTests([]);
      setSelectedDoctorId("");
      setTab("my_requests");
    }
    setLoading(false);
  };

  // ── Patient sends prescription to pharmacy ─────────────────────
  const sendToPharmacy = async (pharmacyId: string, prescriptionId: string) => {
    if (!currentUser) return;
    await supabase.from("pharmacy_orders").insert([{
      prescription_id: prescriptionId,
      patient_id: currentUser.id,
      pharmacy_id: pharmacyId,
    }]);
    setProviderModal(null);
    fetchRequests();
  };

  // ── Patient assigns lab to lab request ─────────────────────────
  const sendToLab = async (labId: string, labRequestId: string) => {
    await supabase.from("lab_requests").update({ lab_id: labId }).eq("id", labRequestId);
    setProviderModal(null);
    fetchRequests();
  };

  // ── Toggle test selection ──────────────────────────────────────
  const toggleTest = (code: string) => {
    setSelectedTests(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const statusCfg = (s: string) => STATUS_CONFIG[s] || STATUS_CONFIG.PENDING;

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="w-full pb-32" dir="rtl">

      {/* ── Header ── */}
      <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-200">
          <Stethoscope className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-800">طلباتي الطبية</h1>
          <p className="text-xs font-bold text-slate-400">أنت تتحكم في كل خطوة من رحلتك الطبية</p>
        </div>
      </motion.header>

      {/* ── Tabs ── */}
      <div className="flex gap-2 mb-6 bg-slate-100 p-1.5 rounded-2xl">
        {[
          { key: "my_requests", label: "طلباتي", icon: <Clock className="w-4 h-4" /> },
          { key: "new", label: "طلب جديد", icon: <Send className="w-4 h-4" /> },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as TabView)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
              tab === t.key
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════ */}
      {/* ── TAB: New Request ── */}
      {/* ══════════════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        {tab === "new" && (
          <motion.div key="new" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <form onSubmit={handleSubmit}
              className="bg-white/80 backdrop-blur-xl border border-white shadow-xl shadow-emerald-500/10 rounded-[2rem] p-6 flex flex-col gap-5">

              {/* Request Type */}
              <div>
                <label className="text-sm font-black text-slate-700 mb-3 block">نوع الطلب</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { v: "PRESCRIPTION", label: "وصفة طبية", icon: <Pill className="w-5 h-5" /> },
                    { v: "LAB", label: "تحاليل طبية", icon: <FlaskConical className="w-5 h-5" /> },
                    { v: "ROUTINE_LAB", label: "تحاليل روتينية", icon: <RotateCcw className="w-5 h-5" /> },
                  ].map(opt => (
                    <button key={opt.v} type="button" onClick={() => setReqType(opt.v as RequestType)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-bold transition-all ${
                        reqType === opt.v
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 text-slate-500 hover:border-emerald-300"
                      }`}>
                      {opt.icon}
                      <span className="text-center leading-tight">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Doctor Selection */}
              <div>
                <label className="text-sm font-black text-slate-700 mb-2 block">اختر طبيبك</label>
                <div className="relative">
                  <select value={selectedDoctorId} onChange={e => setSelectedDoctorId(e.target.value)}
                    className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium appearance-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none">
                    <option value="">بث عام — أي طبيب متاح يستجيب</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.full_name} {d.specialty ? `(${d.specialty})` : ""}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="text-sm font-black text-slate-700 mb-2 block">الأولوية</label>
                <div className="flex gap-2">
                  {[{ v: "normal", label: "عادي" }, { v: "urgent", label: "🚨 عاجل" }].map(p => (
                    <button key={p.v} type="button" onClick={() => setPriority(p.v)}
                      className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
                        priority === p.v
                          ? p.v === "urgent" ? "border-rose-500 bg-rose-50 text-rose-700" : "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 text-slate-500"
                      }`}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Symptoms (Prescription only) */}
              {reqType === "PRESCRIPTION" && (
                <div>
                  <label className="text-sm font-black text-slate-700 mb-2 block">الأعراض والشكوى</label>
                  <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)}
                    placeholder="مثال: أشعر بصداع شديد وارتفاع في الضغط منذ أسبوعين، أحتاج تجديد الوصفة..."
                    className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none h-32 text-slate-700 transition-all font-medium"
                    required />
                </div>
              )}

              {/* Tests Selection (LAB / ROUTINE_LAB) */}
              {reqType !== "PRESCRIPTION" && (
                <div>
                  <label className="text-sm font-black text-slate-700 mb-3 block">
                    اختر التحاليل المطلوبة
                    {selectedTests.length > 0 && (
                      <span className="mr-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                        {selectedTests.length} محدد
                      </span>
                    )}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {ROUTINE_TESTS.map(test => (
                      <button key={test.code} type="button" onClick={() => toggleTest(test.code)}
                        className={`flex items-center gap-2 p-3 rounded-xl border-2 text-right text-xs font-bold transition-all ${
                          selectedTests.includes(test.code)
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 text-slate-500 hover:border-emerald-300"
                        }`}>
                        <TestTube className={`w-4 h-4 shrink-0 ${selectedTests.includes(test.code) ? "text-emerald-500" : "text-slate-300"}`} />
                        <span className="leading-tight">{test.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Button type="submit" disabled={loading}
                className="w-full h-14 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-white font-bold shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 text-base">
                {loading ? "جاري الإرسال..." : (<>إرسال الطلب للطبيب <Send className="w-5 h-5 rtl:-scale-x-100" /></>)}
              </Button>
            </form>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════ */}
        {/* ── TAB: My Requests ── */}
        {/* ══════════════════════════════════════════════════════ */}
        {tab === "my_requests" && (
          <motion.div key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-4">

            {requests.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Stethoscope className="w-16 h-16 text-slate-200 mb-4" />
                <h3 className="font-bold text-slate-500 mb-2">لا توجد طلبات بعد</h3>
                <p className="text-slate-400 text-sm mb-4">ابدأ بإرسال طلبك الطبي الأول</p>
                <Button onClick={() => setTab("new")}
                  className="bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl">
                  طلب جديد +
                </Button>
              </div>
            )}

            {requests.map((req, i) => {
              const cfg = statusCfg(req.status);
              const response = req.doctor_responses?.[0];
              const prescription = req.prescriptions?.[0];
              const labReq = req.lab_requests?.[0];
              const isApproved = req.status === "APPROVED";
              const hasPrescription = !!prescription;
              const hasLabReq = !!labReq && !labReq.lab_id; // lab not assigned yet

              return (
                <motion.div key={req.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
                  className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] p-5 shadow-lg shadow-slate-200/50 relative overflow-hidden">

                  {/* Status stripe */}
                  <div className={`absolute top-0 right-0 w-1.5 h-full rounded-r-3xl ${
                    req.status === "APPROVED" ? "bg-emerald-500" :
                    req.status === "REJECTED" ? "bg-rose-500" :
                    req.status === "MODIFIED" ? "bg-blue-500" : "bg-amber-400"
                  }`} />

                  {/* Request Header */}
                  <div className="flex justify-between items-start mb-3 mr-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-lg border ${cfg.color}`}>
                          {cfg.icon} {cfg.label}
                        </span>
                        {req.priority === "urgent" && (
                          <span className="text-xs font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200 animate-pulse">
                            🚨 عاجل
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-medium">
                        {new Date(req.created_at).toLocaleString("ar-DZ")}
                      </p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                      req.type === "PRESCRIPTION" ? "bg-purple-100 text-purple-700" :
                      req.type === "LAB" ? "bg-cyan-100 text-cyan-700" : "bg-teal-100 text-teal-700"
                    }`}>
                      {req.type === "PRESCRIPTION" ? "🩺 وصفة" : req.type === "LAB" ? "🧪 تحليل" : "🔁 روتيني"}
                    </span>
                  </div>

                  {/* Doctor */}
                  {req.doctor && (
                    <div className="flex items-center gap-2 mr-2 mb-3">
                      <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs">
                        ⚕
                      </div>
                      <span className="text-sm font-bold text-slate-700">{req.doctor.full_name}</span>
                      {req.doctor.specialty && (
                        <span className="text-xs text-slate-400">({req.doctor.specialty})</span>
                      )}
                    </div>
                  )}

                  {/* Content */}
                  {req.symptoms && (
                    <p className="text-sm text-slate-600 font-medium bg-slate-50 rounded-xl p-3 mr-2 mb-3 leading-relaxed">
                      {req.symptoms}
                    </p>
                  )}

                  {/* Doctor Response */}
                  {response && (
                    <div className={`mr-2 mb-3 p-3 rounded-xl border ${
                      response.action === "APPROVE" ? "bg-emerald-50 border-emerald-200" :
                      response.action === "REJECT" ? "bg-rose-50 border-rose-200" : "bg-blue-50 border-blue-200"
                    }`}>
                      <p className="text-xs font-black text-slate-500 mb-0.5">رد الطبيب:</p>
                      <p className="text-sm font-bold text-slate-700">{response.notes}</p>
                    </div>
                  )}

                  {/* ── ACTION: Send Prescription to Pharmacy ── */}
                  {isApproved && hasPrescription && !prescription.is_used && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      className="mr-2 mt-4 p-4 bg-purple-50 border-2 border-purple-200 rounded-2xl">
                      <div className="flex items-center gap-2 mb-3">
                        <QrCode className="w-5 h-5 text-purple-600" />
                        <span className="font-bold text-purple-800 text-sm">وصفتك جاهزة — اختر صيدلية</span>
                      </div>
                      <div className="flex items-center gap-2 mb-3 bg-white rounded-xl p-2 border border-purple-100">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${prescription.qr_token}`}
                          alt="QR"
                          className="w-12 h-12 rounded"
                        />
                        <div className="text-xs text-slate-500">
                          <p className="font-bold text-slate-700 mb-0.5">رقم التحقق</p>
                          <p className="font-mono text-purple-600">{prescription.qr_token?.substring(0, 16)}...</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => setProviderModal({ open: true, type: "pharmacy", requestId: req.id, prescriptionId: prescription.id })}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2">
                        <Building2 className="w-4 h-4" /> اختر صيدلية وأرسل الوصفة
                      </Button>
                    </motion.div>
                  )}

                  {/* ── ACTION: Send Lab Request to Lab ── */}
                  {isApproved && hasLabReq && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      className="mr-2 mt-4 p-4 bg-cyan-50 border-2 border-cyan-200 rounded-2xl">
                      <div className="flex items-center gap-2 mb-3">
                        <QrCode className="w-5 h-5 text-cyan-600" />
                        <span className="font-bold text-cyan-800 text-sm">طلب التحليل جاهز — اختر مختبراً</span>
                      </div>
                      <div className="flex items-center gap-2 mb-3 bg-white rounded-xl p-2 border border-cyan-100">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${labReq.qr_token}`}
                          alt="QR"
                          className="w-12 h-12 rounded"
                        />
                        <div className="text-xs text-slate-500">
                          <p className="font-bold text-slate-700 mb-0.5">رمز التحليل</p>
                          <p className="font-mono text-cyan-600">{labReq.qr_token?.substring(0, 16)}...</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => setProviderModal({ open: true, type: "lab", requestId: req.id, labRequestId: labReq.id })}
                        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2">
                        <FlaskConical className="w-4 h-4" /> اختر مختبراً وأرسل الطلب
                      </Button>
                    </motion.div>
                  )}

                  {/* Already assigned to a lab */}
                  {isApproved && labReq?.lab_id && (
                    <div className="mr-2 mt-3 text-xs text-cyan-700 font-bold flex items-center gap-2 bg-cyan-50 p-2.5 rounded-xl border border-cyan-100">
                      <CheckCircle2 className="w-4 h-4" /> تم إرسال طلب التحليل للمختبر — بانتظار النتائج
                    </div>
                  )}

                  {/* Prescription already used */}
                  {isApproved && prescription?.is_used && (
                    <div className="mr-2 mt-3 text-xs text-purple-700 font-bold flex items-center gap-2 bg-purple-50 p-2.5 rounded-xl border border-purple-100">
                      <CheckCircle2 className="w-4 h-4" /> تم إرسال الوصفة للصيدلية
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ── Provider Selection Modal ── */}
      {/* ══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {providerModal?.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
            onClick={() => setProviderModal(null)}>
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="w-full bg-white rounded-t-[2rem] p-6 max-h-[70vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}>

              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-6" />

              <h3 className="font-black text-slate-800 text-lg mb-1 text-center">
                {providerModal.type === "pharmacy" ? "اختر الصيدلية" : "اختر المختبر"}
              </h3>
              <p className="text-sm text-slate-400 text-center mb-6">
                {providerModal.type === "pharmacy"
                  ? "سيتم إرسال وصفتك مباشرة للصيدلية التي تختارها"
                  : "سيتم إرسال طلب التحليل للمختبر الذي تختاره"}
              </p>

              <div className="space-y-3">
                {(providerModal.type === "pharmacy" ? providers.pharmacies : providers.labs).map(p => (
                  <button key={p.id}
                    onClick={() => {
                      if (providerModal.type === "pharmacy") {
                        sendToPharmacy(p.id, providerModal.prescriptionId!);
                      } else {
                        sendToLab(p.id, providerModal.labRequestId!);
                      }
                    }}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl hover:border-emerald-400 hover:bg-emerald-50 transition-all group">
                    <div className="text-right">
                      <p className="font-bold text-slate-800 group-hover:text-emerald-700">{p.full_name}</p>
                      {p.address && <p className="text-xs text-slate-400 mt-0.5">📍 {p.address}</p>}
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 rtl:rotate-180" />
                  </button>
                ))}

                {(providerModal.type === "pharmacy" ? providers.pharmacies : providers.labs).length === 0 && (
                  <p className="text-center text-slate-400 py-8 font-medium">
                    لا يوجد {providerModal.type === "pharmacy" ? "صيدليات" : "مختبرات"} متاحة حالياً
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
