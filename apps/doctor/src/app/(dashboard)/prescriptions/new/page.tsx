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

// â”€â”€â”€ Common durations / frequencies â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const FREQUENCIES = ["Ù…Ø±Ø© ÙŠÙˆÙ…ÙŠØ§Ù‹", "Ù…Ø±ØªØ§Ù† ÙŠÙˆÙ…ÙŠØ§Ù‹", "3 Ù…Ø±Ø§Øª ÙŠÙˆÙ…ÙŠØ§Ù‹", "ÙƒÙ„ 8 Ø³Ø§Ø¹Ø§Øª", "ÙƒÙ„ 12 Ø³Ø§Ø¹Ø©", "Ø¹Ù†Ø¯ Ø§Ù„Ù„Ø²ÙˆÙ…"];
const DURATIONS = ["7 Ø£ÙŠØ§Ù…", "10 Ø£ÙŠØ§Ù…", "14 ÙŠÙˆÙ…", "Ø´Ù‡Ø±", "Ø´Ù‡Ø±ÙŠÙ†", "3 Ø£Ø´Ù‡Ø±", "6 Ø£Ø´Ù‡Ø±", "Ù…Ø³ØªÙ…Ø±"];

// â”€â”€â”€ Algerian drug database (subset) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const DRUG_DB = [
  "Amoxicilline 500mg", "Ampicilline", "Azithromycin 500mg",
  "Ciprofloxacine 500mg", "Metronidazole 500mg", "Ceftriaxone 1g",
  "ParacÃ©tamol 1g", "IbuprofÃ¨ne 400mg", "IbuprofÃ¨ne 600mg",
  "Aspirine 100mg", "Doliprane 500mg",
  "Metformine 850mg", "Metformine 1000mg", "Glibenclamide 5mg", "Gliclazide 80mg",
  "Amlodipine 5mg", "Amlodipine 10mg", "Atenolol 50mg", "Bisoprolol 5mg",
  "Ramipril 5mg", "Enalapril 10mg", "Losartan 50mg", "Valsartan 80mg",
  "FurosÃ©mide 40mg", "Spironolactone 25mg",
  "Atorvastatine 10mg", "Rosuvastatine 10mg", "Simvastatine 20mg",
  "OmÃ©prazole 20mg", "Pantoprazole 40mg", "Ranitidine 150mg",
  "Cetirizine 10mg", "Loratadine 10mg",
  "Prednisolone 5mg", "Dexamethasone 0.5mg",
  "BromazÃ©pam 3mg", "Alprazolam 0.5mg",
  "Vitamine C 1g", "Vitamine D3 1000UI", "Acide Folique 5mg",
  "Fer (Fer 33mg/ml)", "Calcium 500mg",
  "Ventoline 100mcg (spray)", "Becotide 250mcg (spray)",
  "Insuline Rapide", "Insuline Lente",
];

// â”€â”€â”€ Known interactions (simplified AI-like check) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const INTERACTIONS: Record<string, string[]> = {
  "Metformine": ["FurosÃ©mide", "Alcohol"],
  "Metformine 850mg": ["FurosÃ©mide 40mg"],
  "Metformine 1000mg": ["FurosÃ©mide 40mg"],
  "Warfarine": ["Aspirine 100mg", "IbuprofÃ¨ne 400mg", "IbuprofÃ¨ne 600mg", "Ciprofloxacine 500mg"],
  "Ramipril 5mg": ["Spironolactone 25mg"],
  "Enalapril 10mg": ["Spironolactone 25mg"],
  "BromazÃ©pam 3mg": ["Alprazolam 0.5mg"],
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

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function NewPrescriptionPage() {
  const supabase = createClient();
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [doctorProfile, setDoctorProfile] = useState<any>(null);

  // Patient search
  const [patientQuery, setPatientQuery] = useState("");
  const [patientResults, setPatientResults] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

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
  const [saved, setSaved] = useState<{ rx: any; qr: string } | null>(null);
  const [step, setStep] = useState<"form" | "preview">("form");

  // Load doctor
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUser(user);
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setDoctorProfile(prof);
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
        .limit(5);
      setPatientResults(data || []);
    }, 300);
    return () => clearTimeout(timeout);
  }, [patientQuery, supabase]);

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
        warnings.push(`âš ï¸ ØªØ¯Ø§Ø®Ù„ Ù…Ø­ØªÙ…Ù„ Ø¨ÙŠÙ† ${drug} Ùˆ${conflict}`);
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

    if (error || !rx) { setSaving(false); alert("Ø®Ø·Ø£ ÙÙŠ Ø§Ù„Ø­ÙØ¸: " + error?.message); return; }
    setSaved({ rx, qr: rx.qr_token });
    setStep("preview");
    setSaving(false);
  };

  const handlePrint = () => {
    window.print();
  };

  // â”€â”€ FORM VIEW â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
            <h1 className="text-xl font-black text-slate-800">ÙˆØµÙØ© Ø·Ø¨ÙŠØ© Ø¬Ø¯ÙŠØ¯Ø©</h1>
            <p className="text-xs text-blue-500 font-bold">Ø¥Ù†Ø´Ø§Ø¡ ÙˆØµÙØ© Ù„Ù…Ø±ÙŠØ¶ Ø­Ø¶ÙˆØ±ÙŠ Ø£Ùˆ Ø¨Ø¹ÙŠØ¯</p>
          </div>
        </div>
        <button onClick={() => setStep("preview")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-l from-blue-600 to-cyan-500 text-white text-sm font-bold shadow-lg">
          <FileText className="w-4 h-4" /> Ù…Ø¹Ø§ÙŠÙ†Ø©
        </button>
      </motion.header>

      {/* AI Warnings */}
      <AnimatePresence>
        {aiWarnings.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-4 mb-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <BrainCircuit className="w-5 h-5 text-amber-600" />
              <p className="font-black text-amber-800 text-sm">ØªÙ†Ø¨ÙŠÙ‡ Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ</p>
            </div>
            {aiWarnings.map((w, i) => (
              <p key={i} className="text-xs text-amber-700 font-medium mt-1">{w}</p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-5">
        {/* Patient selection */}
        <Section title="Ø§Ù„Ù…Ø±ÙŠØ¶" icon={<User className="w-5 h-5 text-blue-600" />}>
          {!selectedPatient ? (
            <div className="relative">
              <Search className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
              <input
                value={patientQuery}
                onChange={e => setPatientQuery(e.target.value)}
                placeholder="Ø§Ø¨Ø­Ø« Ø¹Ù† Ø§Ù„Ù…Ø±ÙŠØ¶ Ø¨Ø§Ù„Ø§Ø³Ù…..."
                className={`w-full h-11 pr-9 pl-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-sm`}
              />
              {patientResults.length > 0 && (
                <div className="absolute top-12 right-0 left-0 bg-white border border-slate-200 rounded-2xl shadow-xl z-10 overflow-hidden">
                  {patientResults.map(p => (
                    <button key={p.id} onClick={() => { setSelectedPatient(p); setPatientQuery(""); setPatientResults([]); }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-blue-50 transition-colors text-right border-b border-slate-100 last:border-0">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-black text-sm">
                        {p.full_name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{p.full_name}</p>
                        {p.phone && <p className="text-xs text-slate-400">{p.phone}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {patientQuery.length >= 2 && patientResults.length === 0 && (
                <div className="absolute top-12 right-0 left-0 bg-white border border-slate-100 rounded-2xl shadow-md z-10 p-4 text-center">
                  <p className="text-xs text-slate-400">Ù„Ø§ ØªÙˆØ¬Ø¯ Ù†ØªØ§Ø¦Ø¬ â€” ØªØ£ÙƒØ¯ Ø£Ù† Ø§Ù„Ù…Ø±ÙŠØ¶ Ù…Ø³Ø¬Ù„ ÙÙŠ Ø§Ù„Ù…Ù†ØµØ©</p>
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
        <Section title="Ø§Ù„ØªØ´Ø®ÙŠØµ / Ø§Ù„Ø£Ø¹Ø±Ø§Ø¶" icon={<Stethoscope className="w-5 h-5 text-blue-600" />}>
          <textarea
            value={diagnose}
            onChange={e => setDiagnose(e.target.value)}
            placeholder="ÙˆØµÙ Ø§Ù„Ø­Ø§Ù„Ø© ÙˆØ§Ù„ØªØ´Ø®ÙŠØµ..."
            className="w-full h-20 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none resize-none text-sm text-slate-700"
          />
        </Section>

        {/* Medications */}
        <Section title="Ø§Ù„Ø£Ø¯ÙˆÙŠØ© Ø§Ù„Ù…ÙˆØµÙˆÙØ©" icon={<Pill className="w-5 h-5 text-blue-600" />}
          action={
            <button onClick={() => setMeds(prev => [...prev, newMed()])}
              className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-xl transition-colors border border-blue-200">
              <Plus className="w-3.5 h-3.5" /> Ø¥Ø¶Ø§ÙØ© Ø¯ÙˆØ§Ø¡
            </button>
          }
        >
          <div className="space-y-4">
            {meds.map((med, idx) => (
              <div key={med.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 relative">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">Ø§Ù„Ø¯ÙˆØ§Ø¡ #{idx + 1}</span>
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
                    placeholder="Ø§Ø³Ù… Ø§Ù„Ø¯ÙˆØ§Ø¡ â€” Ø§Ø¨Ø¯Ø£ Ø¨Ø§Ù„ÙƒØªØ§Ø¨Ø©..."
                    className="w-full h-10 px-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-sm font-medium"
                  />
                  {(suggestions[med.id] || []).length > 0 && (
                    <div className="absolute top-11 right-0 left-0 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 overflow-hidden">
                      {suggestions[med.id].map(drug => (
                        <button key={drug} onClick={() => selectDrug(med.id, drug)}
                          className="w-full px-4 py-2.5 text-right text-sm font-medium text-slate-700 hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-0">
                          ðŸ’Š {drug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 font-bold mb-1 block">ØªÙˆØ§ØªØ± Ø§Ù„Ø¬Ø±Ø¹Ø©</label>
                    <select value={med.frequency} onChange={e => updateMed(med.id, "frequency", e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-400">
                      <option value="">-- Ø§Ù„ØªÙƒØ±Ø§Ø± --</option>
                      {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-bold mb-1 block">Ù…Ø¯Ø© Ø§Ù„Ø¹Ù„Ø§Ø¬</label>
                    <select value={med.duration} onChange={e => updateMed(med.id, "duration", e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-400">
                      <option value="">-- Ø§Ù„Ù…Ø¯Ø© --</option>
                      {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-bold mb-1 block">Ø§Ù„ÙƒÙ…ÙŠØ© (Ø¹Ù„Ø¨)</label>
                    <input value={med.quantity} onChange={e => updateMed(med.id, "quantity", e.target.value)}
                      placeholder="Ù…Ø«Ø§Ù„: 2 Ø¹Ù„Ø¨Ø©"
                      className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-bold mb-1 block">Ù…Ù„Ø§Ø­Ø¸Ø§Øª Ø®Ø§ØµØ©</label>
                    <input value={med.notes} onChange={e => updateMed(med.id, "notes", e.target.value)}
                      placeholder="Ù…Ø¹ Ø§Ù„Ø£ÙƒÙ„ØŒ Ù…Ø¹ Ø§Ù„Ù…Ø§Ø¡..."
                      className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Doctor notes */}
        <Section title="Ù…Ù„Ø§Ø­Ø¸Ø§Øª Ø§Ù„Ø·Ø¨ÙŠØ¨" icon={<FileText className="w-5 h-5 text-blue-600" />}>
          <textarea
            value={doctorNotes}
            onChange={e => setDoctorNotes(e.target.value)}
            placeholder="ØªÙˆØµÙŠØ§Øª Ø¥Ø¶Ø§ÙÙŠØ© Ù„Ù„Ù…Ø±ÙŠØ¶..."
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
            {saving ? "Ø¬Ø§Ø±ÙŠ Ø§Ù„Ø­ÙØ¸..." : "Ø­ÙØ¸ ÙˆØ¥ØµØ¯Ø§Ø± Ø§Ù„ÙˆØµÙØ©"}
          </button>
          <button onClick={() => router.back()}
            className="h-14 px-6 rounded-3xl border border-slate-200 bg-white text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">
            Ø¥Ù„ØºØ§Ø¡
          </button>
        </div>
      </div>
    </div>
  );

  // â”€â”€ PRESCRIPTION PREVIEW / PRINT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div className="w-full" dir="rtl">
      {/* Action bar */}
      <div className="flex gap-3 mb-6 print:hidden">
        <button onClick={() => setStep("form")}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-slate-200 bg-white text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">
          <ArrowRight className="w-4 h-4" /> ØªØ¹Ø¯ÙŠÙ„
        </button>
        <button onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-l from-blue-600 to-cyan-500 text-white font-bold text-sm shadow-lg">
          <Printer className="w-4 h-4" /> Ø·Ø¨Ø§Ø¹Ø©
        </button>
        <button className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 text-white font-bold text-sm shadow-lg">
          <Send className="w-4 h-4" /> Ø¥Ø±Ø³Ø§Ù„ Ù„Ù„Ù…Ø±ÙŠØ¶
        </button>
      </div>

      {/* â”€â”€ PRINTABLE PRESCRIPTION â”€â”€ */}
      <div ref={printRef} className="bg-white rounded-3xl shadow-2xl shadow-slate-200/60 border border-slate-200 overflow-hidden print:shadow-none print:border-0 print:rounded-none">
        
        {/* Header bar */}
        <div className="bg-gradient-to-l from-blue-700 to-cyan-600 px-8 py-5 flex justify-between items-center">
          <div className="text-white">
            <div className="flex items-center gap-2 mb-1">
              <Stethoscope className="w-5 h-5 text-blue-200" />
              <span className="font-black text-xl">
                {doctorProfile?.full_name || currentUser?.user_metadata?.full_name || "Ø§Ù„Ø·Ø¨ÙŠØ¨"}
              </span>
            </div>
            <p className="text-blue-100 text-sm">
              {doctorProfile?.specialty || currentUser?.user_metadata?.specialty || "Ø·Ø¨ÙŠØ¨ Ø¹Ø§Ù…"}
            </p>
            {doctorProfile?.license_number && (
              <p className="text-blue-200 text-xs mt-0.5">ONMC: {doctorProfile.license_number}</p>
            )}
            {doctorProfile?.address && (
              <p className="text-blue-200 text-xs">{doctorProfile.address}</p>
            )}
          </div>
          <div className="text-right text-white">
            <p className="font-black text-2xl">ÙˆØµÙØ© Ø·Ø¨ÙŠØ©</p>
            <p className="text-blue-100 text-sm mt-1">
              {new Date().toLocaleDateString("ar-DZ", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>

        <div className="p-8">
          {/* Patient info */}
          <div className="flex justify-between items-start mb-6 pb-5 border-b-2 border-dashed border-slate-200">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Ø§Ù„Ù…Ø±ÙŠØ¶</p>
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
                alt="QR MÃ©decin"
                className="w-20 h-20 rounded-xl border-2 border-blue-100"
              />
              <p className="text-xs text-slate-400 mt-1 font-bold">QR Ø§Ù„Ø·Ø¨ÙŠØ¨</p>
            </div>
          </div>

          {/* Diagnosis */}
          {diagnose && (
            <div className="mb-5 bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <p className="text-xs font-bold text-blue-600 mb-1">Ø§Ù„ØªØ´Ø®ÙŠØµ</p>
              <p className="text-slate-700 font-medium text-sm">{diagnose}</p>
            </div>
          )}

          {/* Medications table */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Pill className="w-5 h-5 text-blue-600" />
              <h3 className="font-black text-slate-800">Ø§Ù„Ø£Ø¯ÙˆÙŠØ© Ø§Ù„Ù…ÙˆØµÙˆÙØ©</h3>
            </div>
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-right px-4 py-3 font-black text-slate-600 text-xs">Ø§Ù„Ø¯ÙˆØ§Ø¡</th>
                    <th className="text-right px-4 py-3 font-black text-slate-600 text-xs">Ø§Ù„ØªÙƒØ±Ø§Ø±</th>
                    <th className="text-right px-4 py-3 font-black text-slate-600 text-xs">Ø§Ù„Ù…Ø¯Ø©</th>
                    <th className="text-right px-4 py-3 font-black text-slate-600 text-xs">Ø§Ù„ÙƒÙ…ÙŠØ©</th>
                    <th className="text-right px-4 py-3 font-black text-slate-600 text-xs">Ù…Ù„Ø§Ø­Ø¸Ø§Øª</th>
                  </tr>
                </thead>
                <tbody>
                  {meds.filter(m => m.name).map((med, i) => (
                    <tr key={med.id} className={`border-b border-slate-100 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
                      <td className="px-4 py-3 font-bold text-slate-800">ðŸ’Š {med.name}</td>
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
              <p className="text-xs font-bold text-amber-700 mb-1">ØªÙˆØµÙŠØ§Øª Ø§Ù„Ø·Ø¨ÙŠØ¨</p>
              <p className="text-slate-700 text-sm">{doctorNotes}</p>
            </div>
          )}

          {/* AI warning */}
          {aiWarnings.length > 0 && (
            <div className="mb-6 bg-rose-50 border border-rose-200 rounded-2xl p-4 print:hidden">
              <p className="text-xs font-bold text-rose-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> ØªÙ†Ø¨ÙŠÙ‡Ø§Øª AI (ØºÙŠØ± Ù…Ø·Ø¨ÙˆØ¹Ø©)
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
                    alt="QR VÃ©rification"
                    className="w-24 h-24 rounded-2xl border-2 border-slate-200 shadow-sm"
                  />
                  <p className="text-xs text-slate-400 mt-1 font-bold">QR Ø§Ù„ØªØ­Ù‚Ù‚</p>
                  <p className="text-xs font-mono text-slate-300">{saved.qr.substring(0, 12)}...</p>
                </div>
              )}
            </div>
            {/* Signature area */}
            <div className="text-center min-w-[160px]">
              <div className="border-t-2 border-slate-800 pt-2 mt-8">
                <p className="text-sm font-black text-slate-800">
                  {doctorProfile?.full_name || "Ø§Ù„ØªÙˆÙ‚ÙŠØ¹"}
                </p>
                <p className="text-xs text-slate-500">{doctorProfile?.specialty || ""}</p>
              </div>
            </div>
          </div>

          {/* Platform footer */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 text-xs text-slate-400 bg-slate-50 border border-slate-100 px-4 py-2 rounded-full">
              <Stethoscope className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-bold">Ù…Ù†ØµØ© Ø¹Ù†Ø§ÙŠØ©</span>
              <span>â€” Ø·Ø¨ÙŠØ¨Ùƒ ÙÙŠ Ø¨ÙŠØªÙƒ â€”</span>
              <span className="text-blue-400">Ù„ØªÙ‚Ø±ÙŠØ¨ÙƒÙ… Ù…Ù† Ø§Ù„Ø±Ø¹Ø§ÙŠØ© Ø§Ù„ØµØ­ÙŠØ©</span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Ù…Ù†ØµØ© ØªÙˆØ§ØµÙ„ Ø·Ø¨ÙŠ Ù…Ø±Ø®ØµØ© Ù…Ù† ÙˆØ²Ø§Ø±Ø© Ø§Ù„ØµØ­Ø© | Ù„Ø§ ØªÙØ¹ÙˆÙ‘Ø¶ Ø§Ù„Ø·Ø¨ÙŠØ¨ ÙÙŠ Ù‚Ø±Ø§Ø±Ø§ØªÙ‡ Ø§Ù„Ø·Ø¨ÙŠØ©
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// â”€â”€ Helper Section wrapper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
