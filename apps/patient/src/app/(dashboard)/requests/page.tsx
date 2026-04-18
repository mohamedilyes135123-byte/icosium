"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import {
  Stethoscope, FlaskConical, Send, Clock, CheckCircle2,
  XCircle, AlertTriangle, ChevronDown, Pill, TestTube,
  RotateCcw, Building2, ArrowRight, QrCode
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type RequestType = "PRESCRIPTION" | "LAB" | "ROUTINE_LAB";
type TabView = "new" | "my_requests";

const ROUTINE_TESTS = [
  { name: "ØµÙˆØ±Ø© Ø§Ù„Ø¯Ù… Ø§Ù„ÙƒØ§Ù…Ù„Ø© CBC", code: "CBC" },
  { name: "Ø³ÙƒØ± Ø§Ù„Ø¯Ù… Ø§Ù„ØµØ§Ø¦Ù…", code: "FBG" },
  { name: "Ø³ÙƒØ± Ø¨Ø¹Ø¯ Ø§Ù„Ø£ÙƒÙ„", code: "PPBG" },
  { name: "ÙˆØ¸Ø§Ø¦Ù Ø§Ù„ÙƒØ¨Ø¯", code: "LFT" },
  { name: "ÙˆØ¸Ø§Ø¦Ù Ø§Ù„ÙƒÙ„Ù‰", code: "RFT" },
  { name: "ØµÙˆØ±Ø© Ø¯Ù‡Ù†ÙŠØ§Øª Ø§Ù„Ø¯Ù…", code: "LIPID" },
  { name: "ÙÙŠØªØ§Ù…ÙŠÙ† D", code: "VIT_D" },
  { name: "Ù‡Ø±Ù…ÙˆÙ† Ø§Ù„ØºØ¯Ø© Ø§Ù„Ø¯Ø±Ù‚ÙŠØ© TSH", code: "TSH" },
  { name: "ØªØ­Ù„ÙŠÙ„ Ø§Ù„Ø¨ÙˆÙ„", code: "UA" },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: JSX.Element }> = {
  PENDING:  { label: "Ù‚ÙŠØ¯ Ø§Ù„Ø§Ù†ØªØ¸Ø§Ø±",     color: "text-amber-600 bg-amber-50 border-amber-200",  icon: <Clock className="w-3.5 h-3.5" /> },
  APPROVED: { label: "Ù…ÙˆØ§ÙÙ‚",            color: "text-emerald-600 bg-emerald-50 border-emerald-200", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  REJECTED: { label: "Ù…Ø±ÙÙˆØ¶",           color: "text-rose-600 bg-rose-50 border-rose-200",       icon: <XCircle className="w-3.5 h-3.5" /> },
  MODIFIED: { label: "Ù…Ø¹Ø¯Ù‘Ù„ Ù…Ù† Ø§Ù„Ø·Ø¨ÙŠØ¨", color: "text-blue-600 bg-blue-50 border-blue-200",       icon: <AlertTriangle className="w-3.5 h-3.5" /> },
};

// â”€â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€ Fetch current user â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user));
  }, [supabase]);

  // â”€â”€ Fetch doctors, labs, pharmacies â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const fetchProviders = useCallback(async () => {
    const [{ data: docs }, { data: labs }, { data: pharms }] = await Promise.all([
      supabase.from("profiles").select("id,full_name,specialty,address").eq("role", "doctor").eq("approval_status", "approved"),
      supabase.from("profiles").select("id,full_name,address").eq("role", "lab").eq("approval_status", "approved"),
      supabase.from("profiles").select("id,full_name,address").eq("role", "pharmacy").eq("approval_status", "approved"),
    ]);
    setDoctors(docs || []);
    setProviders({ labs: labs || [], pharmacies: pharms || [] });
  }, [supabase]);

  // â”€â”€ Fetch patient requests â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€ Submit new request â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€ Patient sends prescription to pharmacy â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€ Patient assigns lab to lab request â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const sendToLab = async (labId: string, labRequestId: string) => {
    await supabase.from("lab_requests").update({ lab_id: labId }).eq("id", labRequestId);
    setProviderModal(null);
    fetchRequests();
  };

  // â”€â”€ Toggle test selection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const toggleTest = (code: string) => {
    setSelectedTests(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const statusCfg = (s: string) => STATUS_CONFIG[s] || STATUS_CONFIG.PENDING;

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div className="w-full pb-32" dir="rtl">

      {/* â”€â”€ Header â”€â”€ */}
      <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-200">
          <Stethoscope className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-800">Ø·Ù„Ø¨Ø§ØªÙŠ Ø§Ù„Ø·Ø¨ÙŠØ©</h1>
          <p className="text-xs font-bold text-slate-400">Ø£Ù†Øª ØªØªØ­ÙƒÙ… ÙÙŠ ÙƒÙ„ Ø®Ø·ÙˆØ© Ù…Ù† Ø±Ø­Ù„ØªÙƒ Ø§Ù„Ø·Ø¨ÙŠØ©</p>
        </div>
      </motion.header>

      {/* â”€â”€ Tabs â”€â”€ */}
      <div className="flex gap-2 mb-6 bg-slate-100 p-1.5 rounded-2xl">
        {[
          { key: "my_requests", label: "Ø·Ù„Ø¨Ø§ØªÙŠ", icon: <Clock className="w-4 h-4" /> },
          { key: "new", label: "Ø·Ù„Ø¨ Ø¬Ø¯ÙŠØ¯", icon: <Send className="w-4 h-4" /> },
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

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {/* â”€â”€ TAB: New Request â”€â”€ */}
      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <AnimatePresence mode="wait">
        {tab === "new" && (
          <motion.div key="new" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <form onSubmit={handleSubmit}
              className="bg-white/80 backdrop-blur-xl border border-white shadow-xl shadow-emerald-500/10 rounded-[2rem] p-6 flex flex-col gap-5">

              {/* Request Type */}
              <div>
                <label className="text-sm font-black text-slate-700 mb-3 block">Ù†ÙˆØ¹ Ø§Ù„Ø·Ù„Ø¨</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { v: "PRESCRIPTION", label: "ÙˆØµÙØ© Ø·Ø¨ÙŠØ©", icon: <Pill className="w-5 h-5" /> },
                    { v: "LAB", label: "ØªØ­Ø§Ù„ÙŠÙ„ Ø·Ø¨ÙŠØ©", icon: <FlaskConical className="w-5 h-5" /> },
                    { v: "ROUTINE_LAB", label: "ØªØ­Ø§Ù„ÙŠÙ„ Ø±ÙˆØªÙŠÙ†ÙŠØ©", icon: <RotateCcw className="w-5 h-5" /> },
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
                <label className="text-sm font-black text-slate-700 mb-2 block">Ø§Ø®ØªØ± Ø·Ø¨ÙŠØ¨Ùƒ</label>
                <div className="relative">
                  <select value={selectedDoctorId} onChange={e => setSelectedDoctorId(e.target.value)}
                    className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium appearance-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none">
                    <option value="">Ø¨Ø« Ø¹Ø§Ù… â€” Ø£ÙŠ Ø·Ø¨ÙŠØ¨ Ù…ØªØ§Ø­ ÙŠØ³ØªØ¬ÙŠØ¨</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.full_name} {d.specialty ? `(${d.specialty})` : ""}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="text-sm font-black text-slate-700 mb-2 block">Ø§Ù„Ø£ÙˆÙ„ÙˆÙŠØ©</label>
                <div className="flex gap-2">
                  {[{ v: "normal", label: "Ø¹Ø§Ø¯ÙŠ" }, { v: "urgent", label: "ðŸš¨ Ø¹Ø§Ø¬Ù„" }].map(p => (
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
                  <label className="text-sm font-black text-slate-700 mb-2 block">Ø§Ù„Ø£Ø¹Ø±Ø§Ø¶ ÙˆØ§Ù„Ø´ÙƒÙˆÙ‰</label>
                  <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)}
                    placeholder="Ù…Ø«Ø§Ù„: Ø£Ø´Ø¹Ø± Ø¨ØµØ¯Ø§Ø¹ Ø´Ø¯ÙŠØ¯ ÙˆØ§Ø±ØªÙØ§Ø¹ ÙÙŠ Ø§Ù„Ø¶ØºØ· Ù…Ù†Ø° Ø£Ø³Ø¨ÙˆØ¹ÙŠÙ†ØŒ Ø£Ø­ØªØ§Ø¬ ØªØ¬Ø¯ÙŠØ¯ Ø§Ù„ÙˆØµÙØ©..."
                    className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none h-32 text-slate-700 transition-all font-medium"
                    required />
                </div>
              )}

              {/* Tests Selection (LAB / ROUTINE_LAB) */}
              {reqType !== "PRESCRIPTION" && (
                <div>
                  <label className="text-sm font-black text-slate-700 mb-3 block">
                    Ø§Ø®ØªØ± Ø§Ù„ØªØ­Ø§Ù„ÙŠÙ„ Ø§Ù„Ù…Ø·Ù„ÙˆØ¨Ø©
                    {selectedTests.length > 0 && (
                      <span className="mr-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                        {selectedTests.length} Ù…Ø­Ø¯Ø¯
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
                {loading ? "Ø¬Ø§Ø±ÙŠ Ø§Ù„Ø¥Ø±Ø³Ø§Ù„..." : (<>Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø·Ù„Ø¨ Ù„Ù„Ø·Ø¨ÙŠØ¨ <Send className="w-5 h-5 rtl:-scale-x-100" /></>)}
              </Button>
            </form>
          </motion.div>
        )}

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {/* â”€â”€ TAB: My Requests â”€â”€ */}
        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {tab === "my_requests" && (
          <motion.div key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-4">

            {requests.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Stethoscope className="w-16 h-16 text-slate-200 mb-4" />
                <h3 className="font-bold text-slate-500 mb-2">Ù„Ø§ ØªÙˆØ¬Ø¯ Ø·Ù„Ø¨Ø§Øª Ø¨Ø¹Ø¯</h3>
                <p className="text-slate-400 text-sm mb-4">Ø§Ø¨Ø¯Ø£ Ø¨Ø¥Ø±Ø³Ø§Ù„ Ø·Ù„Ø¨Ùƒ Ø§Ù„Ø·Ø¨ÙŠ Ø§Ù„Ø£ÙˆÙ„</p>
                <Button onClick={() => setTab("new")}
                  className="bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl">
                  Ø·Ù„Ø¨ Ø¬Ø¯ÙŠØ¯ +
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
                            ðŸš¨ Ø¹Ø§Ø¬Ù„
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
                      {req.type === "PRESCRIPTION" ? "ðŸ©º ÙˆØµÙØ©" : req.type === "LAB" ? "ðŸ§ª ØªØ­Ù„ÙŠÙ„" : "ðŸ” Ø±ÙˆØªÙŠÙ†ÙŠ"}
                    </span>
                  </div>

                  {/* Doctor */}
                  {req.doctor && (
                    <div className="flex items-center gap-2 mr-2 mb-3">
                      <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs">
                        âš•
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
                      <p className="text-xs font-black text-slate-500 mb-0.5">Ø±Ø¯ Ø§Ù„Ø·Ø¨ÙŠØ¨:</p>
                      <p className="text-sm font-bold text-slate-700">{response.notes}</p>
                    </div>
                  )}

                  {/* â”€â”€ ACTION: Send Prescription to Pharmacy â”€â”€ */}
                  {isApproved && hasPrescription && !prescription.is_used && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      className="mr-2 mt-4 p-4 bg-purple-50 border-2 border-purple-200 rounded-2xl">
                      <div className="flex items-center gap-2 mb-3">
                        <QrCode className="w-5 h-5 text-purple-600" />
                        <span className="font-bold text-purple-800 text-sm">ÙˆØµÙØªÙƒ Ø¬Ø§Ù‡Ø²Ø© â€” Ø§Ø®ØªØ± ØµÙŠØ¯Ù„ÙŠØ©</span>
                      </div>
                      <div className="flex items-center gap-2 mb-3 bg-white rounded-xl p-2 border border-purple-100">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${prescription.qr_token}`}
                          alt="QR"
                          className="w-12 h-12 rounded"
                        />
                        <div className="text-xs text-slate-500">
                          <p className="font-bold text-slate-700 mb-0.5">Ø±Ù‚Ù… Ø§Ù„ØªØ­Ù‚Ù‚</p>
                          <p className="font-mono text-purple-600">{prescription.qr_token?.substring(0, 16)}...</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => setProviderModal({ open: true, type: "pharmacy", requestId: req.id, prescriptionId: prescription.id })}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2">
                        <Building2 className="w-4 h-4" /> Ø§Ø®ØªØ± ØµÙŠØ¯Ù„ÙŠØ© ÙˆØ£Ø±Ø³Ù„ Ø§Ù„ÙˆØµÙØ©
                      </Button>
                    </motion.div>
                  )}

                  {/* â”€â”€ ACTION: Send Lab Request to Lab â”€â”€ */}
                  {isApproved && hasLabReq && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      className="mr-2 mt-4 p-4 bg-cyan-50 border-2 border-cyan-200 rounded-2xl">
                      <div className="flex items-center gap-2 mb-3">
                        <QrCode className="w-5 h-5 text-cyan-600" />
                        <span className="font-bold text-cyan-800 text-sm">Ø·Ù„Ø¨ Ø§Ù„ØªØ­Ù„ÙŠÙ„ Ø¬Ø§Ù‡Ø² â€” Ø§Ø®ØªØ± Ù…Ø®ØªØ¨Ø±Ø§Ù‹</span>
                      </div>
                      <div className="flex items-center gap-2 mb-3 bg-white rounded-xl p-2 border border-cyan-100">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${labReq.qr_token}`}
                          alt="QR"
                          className="w-12 h-12 rounded"
                        />
                        <div className="text-xs text-slate-500">
                          <p className="font-bold text-slate-700 mb-0.5">Ø±Ù…Ø² Ø§Ù„ØªØ­Ù„ÙŠÙ„</p>
                          <p className="font-mono text-cyan-600">{labReq.qr_token?.substring(0, 16)}...</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => setProviderModal({ open: true, type: "lab", requestId: req.id, labRequestId: labReq.id })}
                        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2">
                        <FlaskConical className="w-4 h-4" /> Ø§Ø®ØªØ± Ù…Ø®ØªØ¨Ø±Ø§Ù‹ ÙˆØ£Ø±Ø³Ù„ Ø§Ù„Ø·Ù„Ø¨
                      </Button>
                    </motion.div>
                  )}

                  {/* Already assigned to a lab */}
                  {isApproved && labReq?.lab_id && (
                    <div className="mr-2 mt-3 text-xs text-cyan-700 font-bold flex items-center gap-2 bg-cyan-50 p-2.5 rounded-xl border border-cyan-100">
                      <CheckCircle2 className="w-4 h-4" /> ØªÙ… Ø¥Ø±Ø³Ø§Ù„ Ø·Ù„Ø¨ Ø§Ù„ØªØ­Ù„ÙŠÙ„ Ù„Ù„Ù…Ø®ØªØ¨Ø± â€” Ø¨Ø§Ù†ØªØ¸Ø§Ø± Ø§Ù„Ù†ØªØ§Ø¦Ø¬
                    </div>
                  )}

                  {/* Prescription already used */}
                  {isApproved && prescription?.is_used && (
                    <div className="mr-2 mt-3 text-xs text-purple-700 font-bold flex items-center gap-2 bg-purple-50 p-2.5 rounded-xl border border-purple-100">
                      <CheckCircle2 className="w-4 h-4" /> ØªÙ… Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„ÙˆØµÙØ© Ù„Ù„ØµÙŠØ¯Ù„ÙŠØ©
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {/* â”€â”€ Provider Selection Modal â”€â”€ */}
      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
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
                {providerModal.type === "pharmacy" ? "Ø§Ø®ØªØ± Ø§Ù„ØµÙŠØ¯Ù„ÙŠØ©" : "Ø§Ø®ØªØ± Ø§Ù„Ù…Ø®ØªØ¨Ø±"}
              </h3>
              <p className="text-sm text-slate-400 text-center mb-6">
                {providerModal.type === "pharmacy"
                  ? "Ø³ÙŠØªÙ… Ø¥Ø±Ø³Ø§Ù„ ÙˆØµÙØªÙƒ Ù…Ø¨Ø§Ø´Ø±Ø© Ù„Ù„ØµÙŠØ¯Ù„ÙŠØ© Ø§Ù„ØªÙŠ ØªØ®ØªØ§Ø±Ù‡Ø§"
                  : "Ø³ÙŠØªÙ… Ø¥Ø±Ø³Ø§Ù„ Ø·Ù„Ø¨ Ø§Ù„ØªØ­Ù„ÙŠÙ„ Ù„Ù„Ù…Ø®ØªØ¨Ø± Ø§Ù„Ø°ÙŠ ØªØ®ØªØ§Ø±Ù‡"}
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
                      {p.address && <p className="text-xs text-slate-400 mt-0.5">ðŸ“ {p.address}</p>}
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 rtl:rotate-180" />
                  </button>
                ))}

                {(providerModal.type === "pharmacy" ? providers.pharmacies : providers.labs).length === 0 && (
                  <p className="text-center text-slate-400 py-8 font-medium">
                    Ù„Ø§ ÙŠÙˆØ¬Ø¯ {providerModal.type === "pharmacy" ? "ØµÙŠØ¯Ù„ÙŠØ§Øª" : "Ù…Ø®ØªØ¨Ø±Ø§Øª"} Ù…ØªØ§Ø­Ø© Ø­Ø§Ù„ÙŠØ§Ù‹
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
