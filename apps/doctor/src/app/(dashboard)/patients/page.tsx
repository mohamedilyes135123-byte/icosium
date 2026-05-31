"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Users, Search, Phone, Calendar, FileText,
  TestTube, ChevronDown, ChevronUp, QrCode, Pill,
  BadgeCheck, Clock, X
} from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

interface PatientSummary {
  id: string;
  full_name: string;
  phone?: string;
  address?: string;
  prescriptionCount: number;
  labCount: number;
  lastVisit: string | null;
  prescriptions: any[];
  labRequests: any[];
}

export default function DoctorPatients() {
  const { lang, t } = useLanguage();
  const supabase = createClient();
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [filtered, setFiltered] = useState<PatientSummary[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"rx" | "lab">("rx");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user));
  }, [supabase]);

  const fetchPatients = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);

    const { data: rxData } = await supabase
      .from("prescriptions")
      .select(`*, patient:profiles!prescriptions_patient_id_fkey(id, full_name, phone, address)`)
      .eq("doctor_id", currentUser.id)
      .order("created_at", { ascending: false });

    const { data: lrData } = await supabase
      .from("lab_requests")
      .select(`*, patient:profiles!lab_requests_patient_id_fkey(id, full_name, phone), lab_results(result_notes, uploaded_at)`)
      .eq("doctor_id", currentUser.id)
      .order("created_at", { ascending: false });

    const patientMap = new Map<string, PatientSummary>();

    (rxData || []).forEach((rx: any) => {
      const p = rx.patient;
      if (!p) return;
      if (!patientMap.has(p.id)) {
        patientMap.set(p.id, { id: p.id, full_name: p.full_name, phone: p.phone, address: p.address, prescriptionCount: 0, labCount: 0, lastVisit: null, prescriptions: [], labRequests: [] });
      }
      const entry = patientMap.get(p.id)!;
      entry.prescriptionCount++;
      entry.prescriptions.push(rx);
      if (!entry.lastVisit || rx.created_at > entry.lastVisit) entry.lastVisit = rx.created_at;
    });

    (lrData || []).forEach((lr: any) => {
      const p = lr.patient;
      if (!p) return;
      if (!patientMap.has(p.id)) {
        patientMap.set(p.id, { id: p.id, full_name: p.full_name, phone: p.phone, address: p.address, prescriptionCount: 0, labCount: 0, lastVisit: null, prescriptions: [], labRequests: [] });
      }
      const entry = patientMap.get(p.id)!;
      entry.labCount++;
      entry.labRequests.push(lr);
      if (!entry.lastVisit || lr.created_at > entry.lastVisit) entry.lastVisit = lr.created_at;
    });

    const list = Array.from(patientMap.values()).sort((a, b) =>
      (b.lastVisit || "") > (a.lastVisit || "") ? 1 : -1
    );
    setPatients(list);
    setFiltered(list);
    setLoading(false);
  }, [supabase, currentUser]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  useEffect(() => {
    const q = search.trim().toLowerCase();
    if (!q) { setFiltered(patients); return; }
    setFiltered(patients.filter(p =>
      p.full_name.toLowerCase().includes(q) ||
      (p.phone && p.phone.includes(q))
    ));
  }, [search, patients]);

  const localeStr = lang === "ar" ? "ar-DZ" : "fr-DZ";

  return (
    <div className="w-full pb-32" dir={lang === "ar" ? "rtl" : "ltr"}>

      {/* Header */}
      <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800">{lang === "ar" ? "ملفات مرضاي" : "Dossiers de mes patients"}</h1>
            <p className="text-xs font-bold text-blue-500">{patients.length} {lang === "ar" ? "مريض في القاعدة" : "patient(s) dans la base"}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="bg-purple-100 text-purple-700 text-xs font-black px-3 py-1.5 rounded-xl border border-purple-200">
            💊 {patients.reduce((s, p) => s + p.prescriptionCount, 0)} {lang === "ar" ? "وصفة" : "ordo."}
          </span>
          <span className="bg-cyan-100 text-cyan-700 text-xs font-black px-3 py-1.5 rounded-xl border border-cyan-200">
            🧪 {patients.reduce((s, p) => s + p.labCount, 0)} {lang === "ar" ? "تحليل" : "analyse(s)"}
          </span>
        </div>
      </motion.header>

      {/* Search */}
      <div className="relative mb-6">
        <Search className={`absolute ${lang === "ar" ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={lang === "ar" ? "بحث بالاسم أو رقم الهاتف..." : "Rechercher par nom ou téléphone..."}
          className={`w-full h-12 ${lang === "ar" ? "pr-11 pl-4" : "pl-11 pr-4"} bg-white/80 backdrop-blur-xl border border-white rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-400 outline-none text-slate-800 font-medium text-sm`}
        />
        {search && (
          <button onClick={() => setSearch("")} className={`absolute ${lang === "ar" ? "left-4" : "right-4"} top-1/2 -translate-y-1/2`}>
            <X className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-white/60 rounded-3xl animate-pulse border border-white" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Users className="w-16 h-16 text-slate-200 mb-4" />
          <h3 className="text-slate-600 font-bold mb-1">{lang === "ar" ? "لا توجد نتائج" : "Aucun résultat"}</h3>
          <p className="text-slate-400 text-sm">{lang === "ar" ? "لم تصدر وصفات أو تحاليل بعد، أو البحث لا يطابق أي مريض" : "Aucune ordonnance ou analyse, ou la recherche ne correspond à aucun patient"}</p>
        </div>
      )}

      {/* Patient Cards */}
      <div className="space-y-4">
        <AnimatePresence>
          {filtered.map((patient, i) => {
            const isOpen = expandedId === patient.id;
            return (
              <motion.div key={patient.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}
                className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] shadow-lg shadow-blue-500/5 overflow-hidden">

                {/* Patient header row */}
                <button
                  onClick={() => setExpandedId(isOpen ? null : patient.id)}
                  className="w-full p-5 flex items-center justify-between text-right"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-white font-black text-lg shadow-sm">
                      {patient.full_name[0]}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800">{patient.full_name}</h3>
                      <div className="flex gap-2 mt-0.5">
                        {patient.phone && (
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <Phone className="w-3 h-3" />{patient.phone}
                          </p>
                        )}
                        {patient.lastVisit && (
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(patient.lastVisit).toLocaleDateString(localeStr)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded-lg border border-purple-100">
                        💊 {patient.prescriptionCount} {lang === "ar" ? "وصفة" : "ordo."}
                      </span>
                      <span className="text-xs font-bold text-cyan-700 bg-cyan-50 px-2 py-1 rounded-lg border border-cyan-100">
                        🧪 {patient.labCount} {lang === "ar" ? "تحليل" : "analyse(s)"}
                      </span>
                    </div>
                    {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </div>
                </button>

                {/* Expanded content */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 border-t border-slate-100">
                        {/* Inner tabs */}
                        <div className="flex gap-2 mt-4 mb-4 bg-slate-100 p-1.5 rounded-2xl">
                          <button
                            onClick={() => setActiveTab("rx")}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "rx" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"}`}
                          >
                            💊 {lang === "ar" ? "الوصفات" : "Ordonnances"} ({patient.prescriptionCount})
                          </button>
                          <button
                            onClick={() => setActiveTab("lab")}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "lab" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"}`}
                          >
                            🧪 {lang === "ar" ? "التحاليل" : "Analyses"} ({patient.labCount})
                          </button>
                        </div>

                        {/* Prescriptions */}
                        {activeTab === "rx" && (
                          <div className="space-y-3">
                            {patient.prescriptions.length === 0 ? (
                              <p className="text-center text-slate-400 text-sm py-4">{lang === "ar" ? "لا توجد وصفات" : "Aucune ordonnance"}</p>
                            ) : patient.prescriptions.map((rx: any) => (
                              <div key={rx.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-xs text-slate-500 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(rx.created_at).toLocaleDateString(localeStr)}
                                  </span>
                                  {rx.is_used ? (
                                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                                      <BadgeCheck className="w-3.5 h-3.5" />{lang === "ar" ? "صُرفت" : "Délivrée"}</span>
                                  ) : (
                                    <span className="text-xs font-bold text-amber-700">{lang === "ar" ? "بانتظار المريض" : "En attente du patient"}</span>
                                  )}
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {rx.medications?.map((m: any, idx: number) => (
                                    <span key={idx} className="text-xs bg-white border border-slate-200 text-slate-700 px-2 py-1 rounded-lg font-medium flex items-center gap-1">
                                      <Pill className="w-3 h-3 text-blue-400" />{m.name} {m.dose}
                                    </span>
                                  ))}
                                </div>
                                {rx.qr_token && (
                                  <div className="mt-2 flex items-center gap-2">
                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=40x40&data=${rx.qr_token}`} alt="QR" className="w-8 h-8 rounded" />
                                    <p className="text-xs text-slate-400 font-mono">{rx.qr_token?.substring(0, 16)}...</p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Lab requests */}
                        {activeTab === "lab" && (
                          <div className="space-y-3">
                            {patient.labRequests.length === 0 ? (
                              <p className="text-center text-slate-400 text-sm py-4">{lang === "ar" ? "لا توجد طلبات تحاليل" : "Aucune demande d'analyse"}</p>
                            ) : patient.labRequests.map((lr: any) => (
                              <div key={lr.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-xs text-slate-500 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(lr.created_at).toLocaleDateString(localeStr)}
                                  </span>
                                  <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                                    lr.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" :
                                    lr.status === "PROCESSING" ? "bg-blue-100 text-blue-700" :
                                    "bg-amber-100 text-amber-700"
                                  }`}>
                                    {lr.status === "COMPLETED" ? `✅ ${lang === "ar" ? "مكتمل" : "Terminé"}` :
                                     lr.status === "PROCESSING" ? `🔬 ${lang === "ar" ? "جاري" : "En cours"}` :
                                     `⏳ ${lang === "ar" ? "انتظار" : "En attente"}`}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                  {lr.tests_list?.map((test: any, idx: number) => (
                                    <span key={idx} className="text-xs bg-cyan-50 border border-cyan-100 text-cyan-700 px-2 py-1 rounded-lg font-bold">
                                      {test.name}
                                    </span>
                                  ))}
                                </div>
                                {lr.lab_results?.length > 0 && (
                                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-2.5">
                                    <p className="text-xs text-emerald-700 font-bold">📋 {lang === "ar" ? "النتائج:" : "Résultats :"}</p>
                                    <p className="text-xs text-slate-600">{lr.lab_results[0].result_notes || (lang === "ar" ? "تم رفع الملف" : "Fichier envoyé")}</p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
