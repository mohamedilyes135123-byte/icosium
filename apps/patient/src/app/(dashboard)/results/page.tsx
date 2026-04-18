"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  FlaskConical, FileText, Download, CheckCircle2, Clock,
  Pill, Package, ArrowUpRight, TestTube, Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type ResultTab = "lab" | "pharmacy";

export default function PatientResults() {
  const supabase = createClient();
  const [tab, setTab] = useState<ResultTab>("lab");
  const [labResults, setLabResults] = useState<any[]>([]);
  const [pharmacyOrders, setPharmacyOrders] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user));
  }, [supabase]);

  // ── Fetch lab results ─────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    const [{ data: results }, { data: orders }] = await Promise.all([
      supabase
        .from("lab_results")
        .select(`
          *,
          lab:profiles!lab_results_lab_id_fkey(full_name, address),
          lab_request:lab_requests(
            tests_list, doctor_notes,
            doctor:profiles!lab_requests_doctor_id_fkey(full_name)
          )
        `)
        .eq("patient_id", currentUser.id)
        .order("uploaded_at", { ascending: false }),

      supabase
        .from("pharmacy_orders")
        .select(`
          *,
          pharmacy:profiles!pharmacy_orders_pharmacy_id_fkey(full_name, address, phone),
          prescription:prescriptions(
            medications, doctor_notes, qr_token,
            doctor:profiles!prescriptions_doctor_id_fkey(full_name)
          )
        `)
        .eq("patient_id", currentUser.id)
        .order("created_at", { ascending: false }),
    ]);

    setLabResults(results || []);
    setPharmacyOrders(orders || []);
    setLoading(false);
  }, [supabase, currentUser]);

  useEffect(() => {
    fetchData();
    const channel = supabase
      .channel("patient-results-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "lab_results" }, fetchData)
      .on("postgres_changes", { event: "*", schema: "public", table: "pharmacy_orders" }, fetchData)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase, fetchData]);

  const orderStatusConfig: Record<string, { label: string; color: string; dot: string }> = {
    PENDING:    { label: "قيد الانتظار", color: "text-amber-600 bg-amber-50 border-amber-200", dot: "bg-amber-400" },
    PROCESSING: { label: "جاري التحضير", color: "text-blue-600 bg-blue-50 border-blue-200", dot: "bg-blue-400 animate-pulse" },
    COMPLETED:  { label: "جاهز للاستلام ✅", color: "text-emerald-600 bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
    CANCELLED:  { label: "ملغى", color: "text-slate-500 bg-slate-50 border-slate-200", dot: "bg-slate-300" },
  };

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="w-full pb-32" dir="rtl">

      {/* ── Header ── */}
      <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 shadow-sm border border-teal-200">
          <Star className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-800">نتائجي وطلباتي</h1>
          <p className="text-xs font-bold text-slate-400">كل نتائجك وطلبات صيدليتك في مكان واحد</p>
        </div>
      </motion.header>

      {/* ── Tabs ── */}
      <div className="flex gap-2 mb-6 bg-slate-100 p-1.5 rounded-2xl">
        {[
          { key: "lab", label: "نتائج التحاليل", icon: <FlaskConical className="w-4 h-4" />, count: labResults.length },
          { key: "pharmacy", label: "طلبات الصيدلية", icon: <Pill className="w-4 h-4" />, count: pharmacyOrders.length },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as ResultTab)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all relative ${
              tab === t.key
                ? "bg-white text-teal-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}>
            {t.icon} {t.label}
            {t.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-black ${
                tab === t.key ? "bg-teal-100 text-teal-700" : "bg-slate-200 text-slate-500"
              }`}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════ */}
      {/* ── LAB RESULTS TAB ── */}
      {/* ══════════════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        {tab === "lab" && (
          <motion.div key="lab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-4">
            {loading && (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {!loading && labResults.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FlaskConical className="w-16 h-16 text-slate-200 mb-4" />
                <h3 className="font-bold text-slate-500 mb-2">لا توجد نتائج بعد</h3>
                <p className="text-slate-400 text-sm">عندما يرفع المختبر نتائج تحاليلك ستظهر هنا فوراً</p>
              </div>
            )}

            {labResults.map((result, i) => {
              const labReq = result.lab_request;
              return (
                <motion.div key={result.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
                  className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] p-5 shadow-lg shadow-teal-500/5 relative overflow-hidden">

                  {/* Green accent */}
                  <div className="absolute top-0 right-0 w-1.5 h-full bg-emerald-500 rounded-r-3xl" />

                  <div className="flex justify-between items-start mb-3 mr-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="font-black text-slate-800">نتائج التحليل</span>
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(result.uploaded_at).toLocaleString("ar-DZ")}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                      🧪 جاهزة
                    </span>
                  </div>

                  {/* Lab info */}
                  {result.lab && (
                    <div className="flex items-center gap-2 mr-2 mb-3">
                      <div className="w-7 h-7 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 text-xs">⚗</div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">{result.lab.full_name}</p>
                        {result.lab.address && <p className="text-xs text-slate-400">📍 {result.lab.address}</p>}
                      </div>
                    </div>
                  )}

                  {/* Tests done */}
                  {labReq?.tests_list && (
                    <div className="mr-2 mb-3">
                      <p className="text-xs font-bold text-slate-500 mb-1.5">التحاليل المُجراة:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {labReq.tests_list.map((t: any, idx: number) => (
                          <span key={idx} className="text-xs bg-teal-50 text-teal-700 px-2.5 py-1 rounded-lg font-bold border border-teal-100 flex items-center gap-1">
                            <TestTube className="w-3 h-3" /> {t.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Result notes */}
                  {result.result_notes && (
                    <div className="mr-2 mb-3 bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                      <p className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-emerald-600" /> ملخص النتائج
                      </p>
                      <p className="text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                        {result.result_notes}
                      </p>
                    </div>
                  )}

                  {/* File download */}
                  {result.file_url && (
                    <a href={result.file_url} target="_blank" rel="noopener noreferrer"
                      className="mr-2 flex items-center gap-2 w-fit px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-xl transition-colors">
                      <Download className="w-4 h-4" /> تحميل ملف النتائج
                    </a>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════ */}
        {/* ── PHARMACY ORDERS TAB ── */}
        {/* ══════════════════════════════════════════════════════ */}
        {tab === "pharmacy" && (
          <motion.div key="pharmacy" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-4">
            {!loading && pharmacyOrders.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Pill className="w-16 h-16 text-slate-200 mb-4" />
                <h3 className="font-bold text-slate-500 mb-2">لم تُرسل أي طلب للصيدلية بعد</h3>
                <p className="text-slate-400 text-sm">عند موافقة الطبيب على وصفتك، يمكنك إرسالها لأي صيدلية</p>
              </div>
            )}

            {pharmacyOrders.map((order, i) => {
              const rx = order.prescription;
              const statusCfg = orderStatusConfig[order.status] || orderStatusConfig.PENDING;

              return (
                <motion.div key={order.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
                  className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] p-5 shadow-lg shadow-purple-500/5 relative overflow-hidden">

                  {/* Status stripe */}
                  <div className={`absolute top-0 right-0 w-1.5 h-full rounded-r-3xl ${
                    order.status === "COMPLETED"  ? "bg-emerald-500" :
                    order.status === "PROCESSING" ? "bg-blue-400"    :
                    order.status === "CANCELLED"  ? "bg-slate-300"   : "bg-amber-400"
                  }`} />

                  <div className="flex justify-between items-start mb-3 mr-2">
                    <div>
                      <p className="font-black text-slate-800 mb-0.5">طلب الصيدلية</p>
                      <p className="text-xs text-slate-400">
                        {new Date(order.created_at).toLocaleString("ar-DZ")}
                      </p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 ${statusCfg.color}`}>
                      <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`} />
                      {statusCfg.label}
                    </span>
                  </div>

                  {/* Pharmacy info */}
                  {order.pharmacy && (
                    <div className="flex items-center gap-2 mr-2 mb-3">
                      <div className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-xs">💊</div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">{order.pharmacy.full_name}</p>
                        <div className="flex gap-3 mt-0.5">
                          {order.pharmacy.address && <p className="text-xs text-slate-400">📍 {order.pharmacy.address}</p>}
                          {order.pharmacy.phone && <p className="text-xs text-slate-400">📞 {order.pharmacy.phone}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Doctor & prescription */}
                  {rx?.doctor && (
                    <div className="mr-2 mb-3 text-xs text-slate-500 flex items-center gap-1.5">
                      <span>وصفة الطبيب:</span>
                      <span className="font-bold text-slate-700">{rx.doctor.full_name}</span>
                    </div>
                  )}

                  {/* Medications summary */}
                  {rx?.medications && (
                    <div className="mr-2 mb-3 bg-purple-50 border border-purple-100 rounded-2xl p-3">
                      <p className="text-xs font-bold text-slate-500 mb-2">الأدوية:</p>
                      <div className="space-y-1.5">
                        {rx.medications.map((med: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Pill className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <span className="text-sm font-bold text-slate-700">{med.name}</span>
                            <span className="text-xs text-slate-400">{med.dose} — {med.frequency}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ready notification */}
                  {order.status === "COMPLETED" && (
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                      className="mr-2 mt-2 p-3 bg-emerald-100 border border-emerald-300 rounded-2xl flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <p className="text-sm font-bold text-emerald-800">
                        طلبك جاهز! يمكنك الذهاب لاستلام دوائك من الصيدلية.
                      </p>
                    </motion.div>
                  )}

                  {/* Payment note */}
                  <div className="mr-2 mt-3 text-xs text-slate-400 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" />
                    الدفع عند الاستلام مباشرة في الصيدلية
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
