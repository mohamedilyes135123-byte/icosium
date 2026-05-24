"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  FileSignature, Clock, User, Pill, CheckCircle2, QrCode,
  Calendar, BadgeCheck, Eye, EyeOff, TestTube, FlaskConical,
  Link as LinkIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────
interface Prescription {
  id: string;
  created_at: string;
  medications: { name: string; dose?: string; frequency?: string; duration?: string; notes?: string }[];
  doctor_notes: string | null;
  qr_token: string | null;
  is_used: boolean;
  patient: { full_name: string; phone?: string } | null;
  lab_requests: {
    id: string;
    tests_list: { name: string; code?: string }[];
    status: string;
    lab_id: string | null;
    lab_results: { id: string; result_notes: string | null; file_url: string | null }[];
  }[];
}

// ─────────────────────────────────────────────────────────────────
export default function DoctorPrescriptions() {
  const supabase = createClient();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // ── Auth ───────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user));
  }, [supabase]);

  // ── Fetch ──────────────────────────────────────────────────────
  const fetchPrescriptions = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);

    const { data } = await supabase
      .from("prescriptions")
      .select(`
        id, created_at, medications, doctor_notes, qr_token, is_used,
        patient:profiles!prescriptions_patient_id_fkey(full_name, phone),
        lab_requests(
          id, tests_list, status, lab_id,
          lab_results(id, result_notes, file_url)
        )
      `)
      .eq("doctor_id", currentUser.id)
      .order("created_at", { ascending: false });

    setPrescriptions((data as any) || []);
    setLoading(false);
  }, [supabase, currentUser]);

  useEffect(() => { fetchPrescriptions(); }, [fetchPrescriptions]);

  // ── Helpers ────────────────────────────────────────────────────
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("ar-DZ", { day: "2-digit", month: "long", year: "numeric" });

  const ensureUrl = (url: string) =>
    url.startsWith("http") ? url : `https://${url}`;

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="w-full pb-32" dir="rtl">

      {/* ── Header ── */}
      <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="flex justify-between items-center mb-8 bg-white/40 backdrop-blur-lg p-4 rounded-[2rem] border border-white/60 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <FileSignature className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 leading-none mb-1">وصفاتي الطبية</h1>
            <p className="text-xs font-bold text-blue-500">كل الوصفات التي أصدرتها</p>
          </div>
        </div>
        <span className="bg-blue-100 text-blue-700 font-black text-sm px-3 py-1.5 rounded-xl border border-blue-200">
          {prescriptions.length} وصفة
        </span>
      </motion.header>

      {/* ── Loading skeletons ── */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 rounded-[2rem] bg-white/60 animate-pulse" />
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && prescriptions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-white/40 backdrop-blur-sm rounded-[2rem] border border-white/60 shadow-inner text-center px-6">
          <FileSignature className="w-14 h-14 text-slate-300 mb-4" />
          <h3 className="font-black text-slate-600 mb-1">لا توجد وصفات بعد</h3>
          <p className="text-slate-400 text-sm">
            الوصفات التي تُصدرها عند الموافقة على الطلبات أو مباشرة ستظهر هنا.
          </p>
        </div>
      )}

      {/* ── Prescriptions List ── */}
      <div className="space-y-4">
        <AnimatePresence>
          {prescriptions.map((rx, i) => {
            const patient = Array.isArray(rx.patient) ? rx.patient[0] : rx.patient;
            const isExpanded = expandedId === rx.id;
            const hasLab = rx.lab_requests && rx.lab_requests.length > 0;
            const labReq = hasLab ? rx.lab_requests[0] : null;
            const hasResults = labReq && labReq.lab_results && labReq.lab_results.length > 0;

            return (
              <motion.div key={rx.id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1, transition: { delay: i * 0.04 } }}
                exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] shadow-xl shadow-blue-500/5 overflow-hidden">

                {/* Card Header */}
                <div className="p-5 pb-4">
                  <div className="flex justify-between items-start mb-3">
                    {/* Patient */}
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-sm leading-tight">
                          {patient?.full_name || "مريض"}
                        </p>
                        {patient?.phone && (
                          <p className="text-xs text-slate-400">{patient.phone}</p>
                        )}
                      </div>
                    </div>

                    {/* Right badges */}
                    <div className="flex flex-col items-end gap-1.5">
                      {/* Used badge */}
                      {rx.is_used ? (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> أُرسلت للصيدلية
                        </span>
                      ) : (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                          ⏳ لم تُستخدم بعد
                        </span>
                      )}

                      {/* Date */}
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(rx.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Medications summary */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {(rx.medications || []).slice(0, 3).map((med, idx) => (
                      <span key={idx}
                        className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg font-bold border border-blue-100 flex items-center gap-1">
                        <Pill className="w-3 h-3" />
                        {med.name}
                        {med.dose ? ` — ${med.dose}` : ""}
                      </span>
                    ))}
                    {(rx.medications || []).length > 3 && (
                      <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-lg font-bold">
                        +{(rx.medications || []).length - 3} أخرى
                      </span>
                    )}
                  </div>

                  {/* Lab request status */}
                  {hasLab && labReq && (
                    <div className="mb-3">
                      {labReq.lab_id ? (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-700 bg-cyan-50 px-3 py-1.5 rounded-xl border border-cyan-100">
                          <FlaskConical className="w-3.5 h-3.5" />
                          طلب التحليل أُرسل للمختبر
                          {hasResults && (
                            <span className="mr-auto text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> النتائج متاحة
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">
                          <TestTube className="w-3.5 h-3.5" />
                          ⏳ المريض لم يختر مختبراً بعد
                        </div>
                      )}
                    </div>
                  )}

                  {/* Expand / Collapse button */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : rx.id)}
                    className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
                    {isExpanded
                      ? <><EyeOff className="w-3.5 h-3.5" /> إخفاء التفاصيل</>
                      : <><Eye className="w-3.5 h-3.5" /> عرض التفاصيل</>
                    }
                  </button>
                </div>

                {/* Expanded details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-slate-100 bg-slate-50/60">
                      <div className="p-5 space-y-4">

                        {/* All medications */}
                        <div>
                          <p className="text-xs font-black text-slate-500 mb-2 flex items-center gap-1">
                            <Pill className="w-3.5 h-3.5" /> الأدوية الموصوفة
                          </p>
                          <div className="space-y-2">
                            {(rx.medications || []).map((med, idx) => (
                              <div key={idx}
                                className="bg-white rounded-2xl p-3 border border-slate-200 flex items-start gap-3">
                                <span className="text-lg shrink-0">💊</span>
                                <div>
                                  <p className="font-bold text-slate-800 text-sm">{med.name} {med.dose && <span className="text-slate-500 font-medium">— {med.dose}</span>}</p>
                                  {(med.frequency || med.duration) && (
                                    <p className="text-xs text-slate-500 mt-0.5">
                                      {med.frequency}{med.frequency && med.duration && " · "}{med.duration}
                                    </p>
                                  )}
                                  {med.notes && (
                                    <p className="text-xs text-amber-600 mt-0.5">⚠️ {med.notes}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Doctor notes */}
                        {rx.doctor_notes && (
                          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3">
                            <p className="text-xs font-black text-amber-700 mb-1">ملاحظات للمريض:</p>
                            <p className="text-sm text-slate-700 font-medium">{rx.doctor_notes}</p>
                          </div>
                        )}

                        {/* Lab tests */}
                        {hasLab && labReq && labReq.tests_list && labReq.tests_list.length > 0 && (
                          <div>
                            <p className="text-xs font-black text-slate-500 mb-2 flex items-center gap-1">
                              <TestTube className="w-3.5 h-3.5" /> التحاليل المطلوبة
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {labReq.tests_list.map((t, idx) => (
                                <span key={idx}
                                  className="text-xs bg-cyan-50 text-cyan-700 px-2.5 py-1 rounded-lg font-bold border border-cyan-100">
                                  {t.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Lab results */}
                        {hasResults && labReq && (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3">
                            <p className="text-xs font-black text-emerald-700 mb-2 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> النتائج متاحة:
                            </p>
                            {labReq.lab_results[0].result_notes && (
                              <p className="text-xs text-slate-700 mb-2 font-medium leading-relaxed">
                                {labReq.lab_results[0].result_notes}
                              </p>
                            )}
                            {labReq.lab_results[0].file_url && (
                              <a
                                href={ensureUrl(labReq.lab_results[0].file_url)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline">
                                <LinkIcon className="w-3 h-3" /> عرض ملف النتائج
                              </a>
                            )}
                          </div>
                        )}

                        {/* QR */}
                        {rx.qr_token && (
                          <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl p-3">
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${rx.qr_token}`}
                              alt="QR"
                              className="w-14 h-14 rounded-xl"
                            />
                            <div>
                              <p className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-0.5">
                                <QrCode className="w-3 h-3" /> رمز التحقق
                              </p>
                              <p className="text-xs font-mono text-slate-400">
                                {rx.qr_token.substring(0, 16)}...
                              </p>
                            </div>
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
