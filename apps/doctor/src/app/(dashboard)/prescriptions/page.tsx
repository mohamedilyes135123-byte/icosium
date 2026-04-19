"use client";

export const dynamic = 'force-dynamic';


import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  FileSignature, Clock, User, Pill, CheckCircle2, QrCode,
  Calendar, BadgeCheck, Eye, EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DoctorPrescriptions() {
  const supabase = createClient();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [labRequests, setLabRequests] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [tab, setTab] = useState<"rx" | "lab">("rx");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user));
  }, [supabase]);

  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    const [{ data: rx }, { data: lr }] = await Promise.all([
      supabase
        .from("prescriptions")
        .select(`
          *,
          patient:profiles!prescriptions_patient_id_fkey(full_name, phone),
          medical_request:medical_requests(symptoms, created_at)
        `)
        .eq("doctor_id", currentUser.id)
        .order("created_at", { ascending: false }),

      supabase
        .from("lab_requests")
        .select(`
          *,
          patient:profiles!lab_requests_patient_id_fkey(full_name, phone),
          lab:profiles!lab_requests_lab_id_fkey(full_name),
          lab_results(id, result_notes, uploaded_at)
        `)
        .eq("doctor_id", currentUser.id)
        .order("created_at", { ascending: false }),
    ]);

    setPrescriptions(rx || []);
    setLabRequests(lr || []);
  }, [supabase, currentUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const labStatusMap: Record<string, { label: string; color: string }> = {
    PENDING:    { label: "لم يُختر مختبر بعد", color: "bg-slate-100 text-slate-600 border-slate-200" },
    PROCESSING: { label: "جاري التحليل",        color: "bg-blue-100 text-blue-700 border-blue-200" },
    COMPLETED:  { label: "النتائج جاهزة ✅",     color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    CANCELLED:  { label: "ملغى",                 color: "bg-rose-100 text-rose-700 border-rose-200" },
  };

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="w-full pb-32" dir="rtl">

      {/* ── Header ── */}
      <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shadow-sm border border-blue-200">
          <FileSignature className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-800">وصفاتي وتحاليلي</h1>
          <p className="text-xs font-bold text-blue-500">ما أصدرته — للمراجعة فقط</p>
        </div>
      </motion.header>

      {/* ── Tabs ── */}
      <div className="flex gap-2 mb-6 bg-slate-100 p-1.5 rounded-2xl">
        {[
          { key: "rx", label: "الوصفات الطبية", count: prescriptions.length },
          { key: "lab", label: "طلبات التحاليل", count: labRequests.length },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as "rx" | "lab")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
              tab === t.key ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"
            }`}>
            {t.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-black ${
              tab === t.key ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-500"
            }`}>{t.count}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ─── PRESCRIPTIONS ─── */}
        {tab === "rx" && (
          <motion.div key="rx" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-4">
            {prescriptions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FileSignature className="w-16 h-16 text-slate-200 mb-4" />
                <p className="text-slate-400 font-medium">لا توجد وصفات صادرة بعد</p>
              </div>
            )}

            {prescriptions.map((rx, i) => {
              const isExpanded = expandedId === rx.id;
              return (
                <motion.div key={rx.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}
                  className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] p-5 shadow-lg shadow-blue-500/5 relative overflow-hidden">

                  <div className={`absolute top-0 right-0 w-1.5 h-full rounded-r-3xl ${rx.is_used ? "bg-emerald-500" : "bg-blue-400"}`} />

                  <div className="flex justify-between items-start mb-3 mr-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{rx.patient?.full_name}</p>
                        {rx.patient?.phone && <p className="text-xs text-slate-400">{rx.patient.phone}</p>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {rx.is_used ? (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-xl border border-emerald-200 flex items-center gap-1">
                          <BadgeCheck className="w-3.5 h-3.5" /> أُرسلت للصيدلية
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-xl border border-blue-200">
                          بانتظار المريض
                        </span>
                      )}
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(rx.created_at).toLocaleDateString("ar-DZ")}
                      </p>
                    </div>
                  </div>

                  {/* QR */}
                  {rx.qr_token && (
                    <div className="mr-2 mb-3 flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=50x50&data=${rx.qr_token}`}
                        alt="QR" className="w-10 h-10 rounded" />
                      <div>
                        <p className="text-xs font-bold text-slate-600 flex items-center gap-1">
                          <QrCode className="w-3 h-3" /> رمز التحقق
                        </p>
                        <p className="text-xs font-mono text-slate-400">{rx.qr_token?.substring(0, 18)}...</p>
                      </div>
                    </div>
                  )}

                  {/* Medications */}
                  <div className="mr-2">
                    <button onClick={() => setExpandedId(isExpanded ? null : rx.id)}
                      className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline mb-2">
                      {isExpanded ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      {isExpanded ? "إخفاء الأدوية" : "عرض تفاصيل الأدوية"}
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="space-y-2 mb-3">
                            {rx.medications?.map((m: any, idx: number) => (
                              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <Pill className="w-4 h-4 text-blue-500" />
                                  <span className="font-bold text-slate-800">{m.name}</span>
                                  <span className="text-slate-500 text-sm">{m.dose}</span>
                                </div>
                                <p className="text-xs text-slate-500 mr-6">{m.frequency} — {m.duration}</p>
                                {m.notes && (<p className="text-xs text-amber-600 mr-6 mt-0.5">⚠ {m.notes}</p>)}
                              </div>
                            ))}
                          </div>
                          {rx.doctor_notes && (
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                              <p className="text-xs text-blue-800 font-medium">
                                <span className="font-bold">ملاحظاتك: </span>{rx.doctor_notes}
                              </p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* ─── LAB REQUESTS ─── */}
        {tab === "lab" && (
          <motion.div key="lab" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-4">
            {labRequests.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CheckCircle2 className="w-16 h-16 text-slate-200 mb-4" />
                <p className="text-slate-400 font-medium">لا توجد طلبات تحاليل صادرة بعد</p>
              </div>
            )}

            {labRequests.map((lr, i) => {
              const st = labStatusMap[lr.status] || labStatusMap.PENDING;
              const hasResults = lr.lab_results?.length > 0;

              return (
                <motion.div key={lr.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}
                  className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] p-5 shadow-lg shadow-cyan-500/5 relative overflow-hidden">

                  <div className={`absolute top-0 right-0 w-1.5 h-full rounded-r-3xl ${
                    lr.status === "COMPLETED" ? "bg-emerald-500" :
                    lr.status === "PROCESSING" ? "bg-blue-400" : "bg-amber-400"
                  }`} />

                  <div className="flex justify-between items-start mb-3 mr-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-cyan-600" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{lr.patient?.full_name}</p>
                        {lr.patient?.phone && <p className="text-xs text-slate-400">{lr.patient.phone}</p>}
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border ${st.color}`}>
                      {st.label}
                    </span>
                  </div>

                  {/* Lab assigned */}
                  {lr.lab ? (
                    <div className="mr-2 mb-3 text-xs text-slate-600 flex items-center gap-1.5">
                      <span className="font-bold">المختبر: </span>{lr.lab.full_name}
                    </div>
                  ) : (
                    <div className="mr-2 mb-3 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-xl border border-amber-100 font-medium">
                      ⏳ المريض لم يختر مختبراً بعد
                    </div>
                  )}

                  {/* Tests */}
                  <div className="mr-2 flex flex-wrap gap-1.5 mb-3">
                    {lr.tests_list?.map((t: any, idx: number) => (
                      <span key={idx} className="text-xs bg-cyan-50 text-cyan-700 px-2 py-1 rounded-lg font-bold border border-cyan-100">
                        {t.name}
                      </span>
                    ))}
                  </div>

                  {/* Results preview */}
                  {hasResults && (
                    <div className="mr-2 bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                      <p className="text-xs font-bold text-emerald-700 mb-1">📋 النتائج متاحة:</p>
                      <p className="text-xs text-slate-600">{lr.lab_results[0].result_notes || "تم رفع ملف النتائج"}</p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
