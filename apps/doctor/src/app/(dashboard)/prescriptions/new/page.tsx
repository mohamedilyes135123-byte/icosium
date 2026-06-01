"use client";

export const dynamic = 'force-dynamic';


import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Pill, Plus, Trash2, QrCode, Printer, Send, CheckCircle,
  User, Stethoscope, Calendar, BrainCircuit, AlertTriangle,
  Search, ArrowRight, Save, FileText, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";

// ─── Common durations / frequencies ──────────────────────────────────────────
const FREQUENCIES = ["مرة يومياً", "مرتان يومياً", "3 مرات يومياً", "كل 8 ساعات", "كل 12 ساعة", "عند اللزوم"];
const DURATIONS = ["7 أيام", "10 أيام", "14 يوم", "شهر", "شهرين", "3 أشهر", "6 أشهر", "مستمر"];

// ─── Algerian drug database (subset) ─────────────────────────────────────────
const DRUG_DB = [
  "Amoxicilline 500mg", "Ampicilline", "Azithromycin 500mg",
  "Ciprofloxacine 500mg", "Metronidazole 500mg", "Ceftriaxone 1g",
  "Paracétamol 1g", "Ibuprofène 400mg", "Ibuprofène 600mg",
  "Aspirine 100mg", "Doliprane 500mg",
  "Metformine 850mg", "Metformine 1000mg", "Glibenclamide 5mg", "Gliclazide 80mg",
  "Amlodipine 5mg", "Amlodipine 10mg", "Atenolol 50mg", "Bisoprolol 5mg",
  "Ramipril 5mg", "Enalapril 10mg", "Losartan 50mg", "Valsartan 80mg",
  "Furosémide 40mg", "Spironolactone 25mg",
  "Atorvastatine 10mg", "Rosuvastatine 10mg", "Simvastatine 20mg",
  "Oméprazole 20mg", "Pantoprazole 40mg", "Ranitidine 150mg",
  "Cetirizine 10mg", "Loratadine 10mg",
  "Prednisolone 5mg", "Dexamethasone 0.5mg",
  "Bromazépam 3mg", "Alprazolam 0.5mg",
  "Vitamine C 1g", "Vitamine D3 1000UI", "Acide Folique 5mg",
  "Fer (Fer 33mg/ml)", "Calcium 500mg",
  "Ventoline 100mcg (spray)", "Becotide 250mcg (spray)",
  "Insuline Rapide", "Insuline Lente",
];

// ─── Known interactions (simplified AI-like check) ────────────────────────────
const INTERACTIONS: Record<string, string[]> = {
  "Metformine": ["Furosémide", "Alcohol"],
  "Metformine 850mg": ["Furosémide 40mg"],
  "Metformine 1000mg": ["Furosémide 40mg"],
  "Warfarine": ["Aspirine 100mg", "Ibuprofène 400mg", "Ibuprofène 600mg", "Ciprofloxacine 500mg"],
  "Ramipril 5mg": ["Spironolactone 25mg"],
  "Enalapril 10mg": ["Spironolactone 25mg"],
  "Bromazépam 3mg": ["Alprazolam 0.5mg"],
};

interface Med {
  id: string;
  name: string;
  dose: string;
  frequency: string;
  duration: string;
  quantity: string;
  notes: string;
}

function newMed(): Med {
  return { id: crypto.randomUUID(), name: "", dose: "", frequency: "", duration: "", quantity: "", notes: "" };
}

// ─────────────────────────────────────────────────────────────────────────────
export default function NewPrescriptionPage() {
  const supabase = createClient();
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [doctorProfile, setDoctorProfile] = useState<any>(null);

  // Patient search & creation
  const [patientQuery, setPatientQuery] = useState("");
  const [patientResults, setPatientResults] = useState<any[]>([]);
  const [myPatients, setMyPatients] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [newPatient, setNewPatient] = useState({ full_name: "", phone: "" });
  const [creatingPatient, setCreatingPatient] = useState(false);

  // Medications
  const [meds, setMeds] = useState<Med[]>([newMed()]);
  const [drugSearch, setDrugSearch] = useState<Record<string, string>>({});
  const [suggestions, setSuggestions] = useState<Record<string, string[]>>({});

  // AI
  const [aiWarnings, setAiWarnings] = useState<string[]>([]);
  const [diagnose, setDiagnose] = useState("");
  const [doctorNotes, setDoctorNotes] = useState("");

  // State
  const [saving, setSaving] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [saved, setSaved] = useState<{ rx: any; qr: string } | null>(null);
  const [step, setStep] = useState<"form" | "preview">("form");

  // Load doctor & their patients
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUser(user);
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setDoctorProfile(prof);

      // Fetch my patients
      const [{ data: rxs }, { data: appts }] = await Promise.all([
        supabase.from("prescriptions").select("patient:profiles!prescriptions_patient_id_fkey(id, full_name, phone)").eq("doctor_id", user.id),
        supabase.from("appointments").select("patient:profiles!appointments_patient_id_fkey(id, full_name, phone)").eq("doctor_id", user.id)
      ]);
      const pMap = new Map();
      [...(rxs || []), ...(appts || [])].forEach((row: any) => {
        if (row.patient && row.patient.id) pMap.set(row.patient.id, row.patient);
      });
      setMyPatients(Array.from(pMap.values()));
    };
    load();
  }, [supabase]);

  // Patient search
  useEffect(() => {
    if (patientQuery.length < 2) { setPatientResults([]); return; }
    const timeout = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, phone")
        .eq("role", "patient")
        .ilike("full_name", `%${patientQuery}%`)
        .limit(10);
      setPatientResults(data || []);
    }, 300);
    return () => clearTimeout(timeout);
  }, [patientQuery, supabase]);

  const handleCreateNewPatient = async () => {
    if (!newPatient.full_name) return alert("يرجى إدخال اسم المريض");
    setCreatingPatient(true);
    
    // Create an isolated client so it doesn't log the doctor out
    const { createBrowserClient } = require('@supabase/ssr');
    const adminAuthClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, 
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
    
    const { data, error } = await adminAuthClient.auth.signUp({
      email: `patient_${Date.now()}@offline.icosium.com`,
      password: 'OfflineUser123!',
      options: {
        data: {
          full_name: newPatient.full_name,
          phone: newPatient.phone,
          role: 'patient',
          is_offline: true
        }
      }
    });
    
    setCreatingPatient(false);
    if (error || !data.user) {
      alert("خطأ في إنشاء ملف المريض: " + (error?.message || ""));
      return;
    }
    
    const createdProfile = { id: data.user.id, full_name: newPatient.full_name, phone: newPatient.phone };
    setMyPatients(prev => [createdProfile, ...prev]);
    setSelectedPatient(createdProfile);
    setShowNewPatientModal(false);
    setNewPatient({ full_name: "", phone: "" });
    setPatientQuery("");
  };

  // Drug search autocomplete
  const handleDrugSearch = (medId: string, query: string) => {
    setDrugSearch(prev => ({ ...prev, [medId]: query }));
    if (query.length < 2) { setSuggestions(prev => ({ ...prev, [medId]: [] })); return; }
    const matches = DRUG_DB.filter(d => d.toLowerCase().includes(query.toLowerCase())).slice(0, 6);
    setSuggestions(prev => ({ ...prev, [medId]: matches }));
  };

  const selectDrug = (medId: string, drugName: string) => {
    setMeds(prev => prev.map(m => m.id === medId ? { ...m, name: drugName } : m));
    setDrugSearch(prev => ({ ...prev, [medId]: "" }));
    setSuggestions(prev => ({ ...prev, [medId]: [] }));
    runAiCheck();
  };

  // AI interaction check
  const runAiCheck = () => {
    const names = meds.map(m => m.name).filter(Boolean);
    const warnings: string[] = [];
    names.forEach(drug => {
      const conflicts = INTERACTIONS[drug] || [];
      const found = conflicts.filter(c => names.includes(c));
      found.forEach(conflict => {
        warnings.push(`⚠️ تداخل محتمل بين ${drug} و${conflict}`);
      });
    });
    setAiWarnings([...new Set(warnings)]);
  };

  useEffect(() => { runAiCheck(); }, [meds]);

  const updateMed = (id: string, field: keyof Med, val: string) =>
    setMeds(prev => prev.map(m => m.id === id ? { ...m, [field]: val } : m));

  const removeMed = (id: string) => setMeds(prev => prev.filter(m => m.id !== id));

  // Save prescription
  const handleSave = async () => {
    if (!selectedPatient || !currentUser) return;
    const validMeds = meds.filter(m => m.name.trim());
    if (!validMeds.length) return;
    setSaving(true);

    // Create a standalone prescription (not linked to a request)
    const { data: rx, error } = await supabase.from("prescriptions").insert([{
      patient_id: selectedPatient.id,
      doctor_id: currentUser.id,
      medications: validMeds,
      doctor_notes: doctorNotes || null,
      // request_id will be null for walk-in prescriptions
      request_id: null,
    }]).select().single();

    if (error || !rx) { setSaving(false); alert("خطأ في الحفظ: " + error?.message); return; }
    setSaved({ rx, qr: rx.qr_token });
    setStep("preview");
    setSaving(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendToPatient = async () => {
    if (!saved?.rx || !selectedPatient || !currentUser) return;
    
    // Create a notification for the patient
    await supabase.from("notifications").insert([{
       user_id: selectedPatient.id,
       title: "وصفة طبية جديدة",
       content: `تلقيت وصفة طبية جديدة من د. ${doctorProfile?.full_name || currentUser.user_metadata?.full_name || "الطبيب"}`,
       type: "prescription",
       is_read: false
    }]);
    
    setIsSent(true);
    alert("تم إرسال الوصفة للمريض بنجاح، وتلقى إشعاراً بذلك!");
  };

  // ── FORM VIEW ────────────────────────────────────────────────────────────────
  if (step === "form") return (
    <div className="w-full max-w-3xl mx-auto pb-20" dir="rtl">
      {/* Header */}
      <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
            <ArrowRight className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-800">وصفة طبية جديدة</h1>
            <p className="text-xs text-blue-500 font-bold">إنشاء وصفة لمريض حضوري أو بعيد</p>
          </div>
        </div>
        <button onClick={() => setStep("preview")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-l from-blue-600 to-cyan-500 text-white text-sm font-bold shadow-lg">
          <FileText className="w-4 h-4" /> معاينة
        </button>
      </motion.header>

      {/* AI Warnings */}
      <AnimatePresence>
        {aiWarnings.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-4 mb-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <BrainCircuit className="w-5 h-5 text-amber-600" />
              <p className="font-black text-amber-800 text-sm">تنبيه الذكاء الاصطناعي</p>
            </div>
            {aiWarnings.map((w, i) => (
              <p key={i} className="text-xs text-amber-700 font-medium mt-1">{w}</p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-5">
        {/* Patient selection */}
        <Section title="المريض" icon={<User className="w-5 h-5 text-blue-600" />}>
          {!selectedPatient ? (
              <div className="relative">
              <Search className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
              <input
                value={patientQuery}
                onChange={e => setPatientQuery(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                placeholder="ابحث عن المريض بالاسم، أو اختر من مرضاك السابقين..."
                className={`w-full h-11 pr-9 pl-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-sm`}
              />
              
              {showDropdown && (
                <div className="absolute top-12 right-0 left-0 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 overflow-hidden max-h-72 overflow-y-auto">
                  {patientQuery.length >= 2 ? (
                    patientResults.length > 0 ? (
                      patientResults.map(p => (
                        <button key={p.id} onMouseDown={() => { setSelectedPatient(p); setPatientQuery(""); setPatientResults([]); setShowDropdown(false); }}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-blue-50 transition-colors text-right border-b border-slate-100 last:border-0">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-black text-sm">
                            {p.full_name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{p.full_name}</p>
                            {p.phone && <p className="text-xs text-slate-400">{p.phone}</p>}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center">
                        <p className="text-xs text-slate-400 mb-2">لا توجد نتائج</p>
                        <button onMouseDown={(e) => { e.preventDefault(); setShowNewPatientModal(true); setShowDropdown(false); setNewPatient(prev => ({...prev, full_name: patientQuery})) }} 
                          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1 mx-auto bg-blue-50 px-3 py-1.5 rounded-lg">
                          <UserPlus className="w-3.5 h-3.5" /> إضافة "{patientQuery}" كمريض جديد
                        </button>
                      </div>
                    )
                  ) : (
                    <>
                      <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
                        <span className="text-xs font-bold text-slate-500">مرضاك السابقين</span>
                        <button onMouseDown={(e) => { e.preventDefault(); setShowNewPatientModal(true); setShowDropdown(false); }} 
                          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-white px-2 py-1 rounded shadow-sm border border-slate-200">
                          <UserPlus className="w-3.5 h-3.5" /> مريض جديد
                        </button>
                      </div>
                      {myPatients.length > 0 ? myPatients.map(p => (
                        <button key={p.id} onMouseDown={() => { setSelectedPatient(p); setShowDropdown(false); }}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-blue-50 transition-colors text-right border-b border-slate-100 last:border-0">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-black text-sm">
                            {p.full_name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-700 text-sm">{p.full_name}</p>
                            {p.phone && <p className="text-xs text-slate-400">{p.phone}</p>}
                          </div>
                        </button>
                      )) : (
                        <div className="p-6 text-center">
                          <p className="text-xs text-slate-400 mb-3">لم تقم بمعاينة أي مرضى بعد</p>
                          <button onMouseDown={(e) => { e.preventDefault(); setShowNewPatientModal(true); setShowDropdown(false); }} 
                            className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition-all shadow-md">
                            إنشاء أول ملف طبي
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black">
                  {selectedPatient.full_name[0]}
                </div>
                <div>
                  <p className="font-bold text-slate-800">{selectedPatient.full_name}</p>
                  {selectedPatient.phone && <p className="text-xs text-slate-500">{selectedPatient.phone}</p>}
                </div>
              </div>
              <button onClick={() => setSelectedPatient(null)} className="text-slate-400 hover:text-red-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </Section>

        {/* Diagnosis */}
        <Section title="التشخيص / الأعراض" icon={<Stethoscope className="w-5 h-5 text-blue-600" />}>
          <textarea
            value={diagnose}
            onChange={e => setDiagnose(e.target.value)}
            placeholder="وصف الحالة والتشخيص..."
            className="w-full h-20 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none resize-none text-sm text-slate-700"
          />
        </Section>

        {/* Medications */}
        <Section title="الأدوية الموصوفة" icon={<Pill className="w-5 h-5 text-blue-600" />}
          action={
            <button onClick={() => setMeds(prev => [...prev, newMed()])}
              className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-xl transition-colors border border-blue-200">
              <Plus className="w-3.5 h-3.5" /> إضافة دواء
            </button>
          }
        >
          <div className="space-y-4">
            {meds.map((med, idx) => (
              <div key={med.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 relative">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">الدواء #{idx + 1}</span>
                  {meds.length > 1 && (
                    <button onClick={() => removeMed(med.id)} className="text-rose-400 hover:text-rose-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Drug search */}
                <div className="relative mb-3">
                  <input
                    value={med.name || drugSearch[med.id] || ""}
                    onChange={e => {
                      if (med.name) {
                        updateMed(med.id, "name", "");
                      }
                      handleDrugSearch(med.id, e.target.value);
                    }}
                    onFocus={() => med.name && handleDrugSearch(med.id, med.name)}
                    placeholder="اسم الدواء — ابدأ بالكتابة..."
                    className="w-full h-10 px-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-sm font-medium"
                  />
                  {(suggestions[med.id] || []).length > 0 && (
                    <div className="absolute top-11 right-0 left-0 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 overflow-hidden">
                      {suggestions[med.id].map(drug => (
                        <button key={drug} onClick={() => selectDrug(med.id, drug)}
                          className="w-full px-4 py-2.5 text-right text-sm font-medium text-slate-700 hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-0">
                          💊 {drug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 font-bold mb-1 block">تواتر الجرعة</label>
                    <select value={med.frequency} onChange={e => updateMed(med.id, "frequency", e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-400">
                      <option value="">-- التكرار --</option>
                      {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-bold mb-1 block">مدة العلاج</label>
                    <select value={med.duration} onChange={e => updateMed(med.id, "duration", e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-400">
                      <option value="">-- المدة --</option>
                      {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-bold mb-1 block">الكمية (علب)</label>
                    <input value={med.quantity} onChange={e => updateMed(med.id, "quantity", e.target.value)}
                      placeholder="مثال: 2 علبة"
                      className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-bold mb-1 block">ملاحظات خاصة</label>
                    <input value={med.notes} onChange={e => updateMed(med.id, "notes", e.target.value)}
                      placeholder="مع الأكل، مع الماء..."
                      className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Doctor notes */}
        <Section title="ملاحظات الطبيب" icon={<FileText className="w-5 h-5 text-blue-600" />}>
          <textarea
            value={doctorNotes}
            onChange={e => setDoctorNotes(e.target.value)}
            placeholder="توصيات إضافية للمريض..."
            className="w-full h-16 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none resize-none text-sm text-slate-700"
          />
        </Section>

        {/* Save button */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving || !selectedPatient || meds.filter(m => m.name.trim()).length === 0}
            className="flex-1 flex items-center justify-center gap-2 h-14 rounded-3xl bg-gradient-to-l from-blue-600 to-cyan-500 text-white font-black text-base shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {saving ? "جاري الحفظ..." : "حفظ وإصدار الوصفة"}
          </button>
          <button onClick={() => router.back()}
            className="h-14 px-6 rounded-3xl border border-slate-200 bg-white text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">
            إلغاء
          </button>
        </div>
      </div>

      {/* New Patient Modal */}
      <AnimatePresence>
        {showNewPatientModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 relative">
              <button onClick={() => setShowNewPatientModal(false)} className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-full">
                <X className="w-4 h-4" />
              </button>
              
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                <UserPlus className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-slate-800 mb-1">إضافة مريض جديد</h2>
              <p className="text-sm text-slate-500 mb-6">إنشاء ملف طبي جديد لمريض غير مسجل في المنصة.</p>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">الاسم الكامل <span className="text-red-500">*</span></label>
                  <input value={newPatient.full_name} onChange={e => setNewPatient(prev => ({...prev, full_name: e.target.value}))} 
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-sm" placeholder="اسم المريض الثلاثي..." />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">رقم الهاتف (اختياري)</label>
                  <input value={newPatient.phone} onChange={e => setNewPatient(prev => ({...prev, phone: e.target.value}))} 
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-sm text-left" placeholder="0550... أو 0660..." dir="ltr" />
                </div>
              </div>
              
              <div className="flex gap-3">
                <button onClick={handleCreateNewPatient} disabled={creatingPatient || !newPatient.full_name.trim()}
                  className="flex-1 h-12 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  {creatingPatient ? "جاري الإنشاء..." : "إنشاء الملف"}
                </button>
                <button onClick={() => setShowNewPatientModal(false)}
                  className="h-12 px-6 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                  إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );

  // ── PRESCRIPTION PREVIEW / PRINT ─────────────────────────────────────────────
  return (
    <div className="w-full" dir="rtl">
      {/* Action bar */}
      <div className="flex gap-3 mb-6 print:hidden">
        <button onClick={() => setStep("form")}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-slate-200 bg-white text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">
          <ArrowRight className="w-4 h-4" /> تعديل
        </button>
        <button onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-l from-blue-600 to-cyan-500 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all">
          <Printer className="w-4 h-4" /> طباعة
        </button>
        <button onClick={handleSendToPatient} disabled={isSent}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-white font-bold text-sm shadow-lg transition-all ${isSent ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600'}`}>
          {isSent ? <CheckCircle className="w-4 h-4" /> : <Send className="w-4 h-4" />}
          {isSent ? "تم الإرسال" : "إرسال للمريض"}
        </button>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-section, #print-section * {
            visibility: visible;
          }
          #print-section {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* ── PRINTABLE PRESCRIPTION ── */}
      <div id="print-section" ref={printRef} className="bg-white rounded-3xl shadow-2xl shadow-slate-200/60 border border-slate-200 overflow-hidden print:shadow-none print:border-0 print:rounded-none">
        
        {/* Header bar */}
        <div className="bg-gradient-to-l from-blue-700 to-cyan-600 px-8 py-5 flex justify-between items-center">
          <div className="text-white">
            <div className="flex items-center gap-2 mb-1">
              <Stethoscope className="w-5 h-5 text-blue-200" />
              <span className="font-black text-xl">
                {doctorProfile?.full_name || currentUser?.user_metadata?.full_name || "الطبيب"}
              </span>
            </div>
            <p className="text-blue-100 text-sm">
              {doctorProfile?.specialty || currentUser?.user_metadata?.specialty || "طبيب عام"}
            </p>
            {doctorProfile?.license_number && (
              <p className="text-blue-200 text-xs mt-0.5">ONMC: {doctorProfile.license_number}</p>
            )}
            {doctorProfile?.address && (
              <p className="text-blue-200 text-xs">{doctorProfile.address}</p>
            )}
          </div>
          <div className="text-right text-white">
            <p className="font-black text-2xl">وصفة طبية</p>
            <p className="text-blue-100 text-sm mt-1">
              {new Date().toLocaleDateString("ar-DZ", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>

        <div className="p-8">
          {/* Patient info */}
          <div className="flex justify-between items-start mb-6 pb-5 border-b-2 border-dashed border-slate-200">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">المريض</p>
              <h2 className="text-2xl font-black text-slate-800 mb-0.5">
                {selectedPatient?.full_name}
              </h2>
              {selectedPatient?.phone && (
                <p className="text-sm text-slate-500">{selectedPatient.phone}</p>
              )}
            </div>
            {/* Doctor QR */}
            <div className="text-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=DOCTOR:${currentUser?.id}`}
                alt="QR Médecin"
                className="w-20 h-20 rounded-xl border-2 border-blue-100"
              />
              <p className="text-xs text-slate-400 mt-1 font-bold">QR الطبيب</p>
            </div>
          </div>

          {/* Diagnosis */}
          {diagnose && (
            <div className="mb-5 bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <p className="text-xs font-bold text-blue-600 mb-1">التشخيص</p>
              <p className="text-slate-700 font-medium text-sm">{diagnose}</p>
            </div>
          )}

          {/* Medications table */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Pill className="w-5 h-5 text-blue-600" />
              <h3 className="font-black text-slate-800">الأدوية الموصوفة</h3>
            </div>
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-right px-4 py-3 font-black text-slate-600 text-xs">الدواء</th>
                    <th className="text-right px-4 py-3 font-black text-slate-600 text-xs">التكرار</th>
                    <th className="text-right px-4 py-3 font-black text-slate-600 text-xs">المدة</th>
                    <th className="text-right px-4 py-3 font-black text-slate-600 text-xs">الكمية</th>
                    <th className="text-right px-4 py-3 font-black text-slate-600 text-xs">ملاحظات</th>
                  </tr>
                </thead>
                <tbody>
                  {meds.filter(m => m.name).map((med, i) => (
                    <tr key={med.id} className={`border-b border-slate-100 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
                      <td className="px-4 py-3 font-bold text-slate-800">💊 {med.name}</td>
                      <td className="px-4 py-3 text-slate-600">{med.frequency}</td>
                      <td className="px-4 py-3 text-slate-600">{med.duration}</td>
                      <td className="px-4 py-3 text-slate-600">{med.quantity}</td>
                      <td className="px-4 py-3 text-amber-700 text-xs">{med.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Doctor notes */}
          {doctorNotes && (
            <div className="mb-6 bg-amber-50 border border-amber-100 rounded-2xl p-4">
              <p className="text-xs font-bold text-amber-700 mb-1">توصيات الطبيب</p>
              <p className="text-slate-700 text-sm">{doctorNotes}</p>
            </div>
          )}

          {/* AI warning */}
          {aiWarnings.length > 0 && (
            <div className="mb-6 bg-rose-50 border border-rose-200 rounded-2xl p-4 print:hidden">
              <p className="text-xs font-bold text-rose-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> تنبيهات AI (غير مطبوعة)
              </p>
              {aiWarnings.map((w, i) => <p key={i} className="text-xs text-rose-600 mt-1">{w}</p>)}
            </div>
          )}

          {/* Footer: QR + signature */}
          <div className="flex justify-between items-end pt-5 border-t-2 border-dashed border-slate-200">
            <div className="flex gap-4">
              {/* Patient QR */}
              {saved?.qr && (
                <div className="text-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${saved.qr}`}
                    alt="QR Vérification"
                    className="w-24 h-24 rounded-2xl border-2 border-slate-200 shadow-sm"
                  />
                  <p className="text-xs text-slate-400 mt-1 font-bold">QR التحقق</p>
                  <p className="text-xs font-mono text-slate-300">{saved.qr.substring(0, 12)}...</p>
                </div>
              )}
            </div>
            {/* Signature area */}
            <div className="text-center min-w-[160px]">
              <div className="border-t-2 border-slate-800 pt-2 mt-8">
                <p className="text-sm font-black text-slate-800">
                  {doctorProfile?.full_name || "التوقيع"}
                </p>
                <p className="text-xs text-slate-500">{doctorProfile?.specialty || ""}</p>
              </div>
            </div>
          </div>

          {/* Platform footer */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 text-xs text-slate-400 bg-slate-50 border border-slate-100 px-4 py-2 rounded-full">
              <Stethoscope className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-bold">منصة عناية</span>
              <span>— طبيبك في بيتك —</span>
              <span className="text-blue-400">لتقريبكم من الرعاية الصحية</span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              منصة تواصل طبي مرخصة من وزارة الصحة | لا تُعوّض الطبيب في قراراته الطبية
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Helper Section wrapper ─────────────────────────────────────────────────────
function Section({ title, icon, children, action }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; action?: React.ReactNode
}) {
  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-5 shadow-lg shadow-slate-200/40">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-black text-slate-800">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
