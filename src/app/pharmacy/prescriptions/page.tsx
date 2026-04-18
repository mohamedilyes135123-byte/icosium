"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Pill, CheckCircle2, Clock, ScanLine, QrCode,
  X, Stethoscope, Phone, Package, AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_LABELS: Record<string, string> = {
  PENDING:    "انتظار التجهيز",
  PROCESSING: "جاري التجهيز",
  COMPLETED:  "جاهز / مُسلَّم",
  CANCELLED:  "ملغى",
};

export default function PharmacyPrescriptions() {
  const supabase = createClient();
  const [user, setUser]       = useState<any>(null);
  const [orders, setOrders]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("PENDING");
  const [updating, setUpdating] = useState<string | null>(null);
  const [scanModal, setScanModal] = useState(false);
  const [scanInput, setScanInput] = useState("");
  const [scanResult, setScanResult] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, [supabase]);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("pharmacy_orders")
      .select(`*,
        patient:profiles!pharmacy_orders_patient_id_fkey(full_name, phone),
        prescription:prescriptions(
          medications, doctor_notes, qr_token, is_used,
          doctor:profiles!prescriptions_doctor_id_fkey(full_name, specialty)
        )`)
      .eq("pharmacy_id", user.id)
      .order("created_at", { ascending: false });
    setOrders(data || []);
    setLoading(false);
  }, [supabase, user]);

  useEffect(() => {
    fetchOrders();
    const ch = supabase.channel("pharmacy-orders-mono")
      .on("postgres_changes", { event: "*", schema: "public", table: "pharmacy_orders" }, fetchOrders)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [supabase, fetchOrders]);

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(orderId);
    await supabase.from("pharmacy_orders").update({ status }).eq("id", orderId);
    if (status === "COMPLETED") {
      const o = orders.find(x => x.id === orderId);
      if (o?.prescription_id) {
        await supabase.from("prescriptions").update({ is_used: true }).eq("id", o.prescription_id);
      }
    }
    fetchOrders();
    setUpdating(null);
  };

  const handleScan = async () => {
    if (!scanInput.trim()) return;
    const { data } = await supabase
      .from("prescriptions")
      .select(`*, 
        patient:profiles!prescriptions_patient_id_fkey(full_name, phone),
        doctor:profiles!prescriptions_doctor_id_fkey(full_name, specialty)`)
      .eq("qr_token", scanInput.trim())
      .single();
    setScanResult(data || null);
  };

  const pending    = orders.filter(o => o.status === "PENDING").length;
  const processing = orders.filter(o => o.status === "PROCESSING").length;
  const completed  = orders.filter(o => o.status === "COMPLETED").length;
  const filtered   = orders.filter(o => o.status === filter);

  return (
    <div className="pb-32 w-full" dir="rtl">

      {/* Header */}
      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800">الوصفات والطلبات</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {pending > 0 ? <span className="text-amber-600 font-bold">{pending} وصفة بانتظار التجهيز</span> : "لا توجد وصفات جديدة"}
          </p>
        </div>
        <button onClick={() => { setScanModal(true); setScanInput(""); setScanResult(null); }}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-l from-purple-600 to-fuchsia-500 text-white font-bold shadow-lg shadow-purple-500/30 text-sm">
          <ScanLine className="w-5 h-5" /> مسح QR
        </button>
      </motion.header>

      {/* Filter tabs */}
      <div className="grid grid-cols-3 gap-3 mb-7">
        {[
          { key: "PENDING",    label: "انتظار",  count: pending,    color: "from-amber-500 to-orange-400" },
          { key: "PROCESSING", label: "تجهيز",   count: processing, color: "from-blue-500 to-indigo-400" },
          { key: "COMPLETED",  label: "مكتمل",   count: completed,  color: "from-emerald-500 to-teal-400" },
        ].map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            className={`rounded-3xl p-4 flex flex-col gap-1 border-2 transition-all ${
              filter === t.key ? `bg-gradient-to-br ${t.color} text-white border-transparent shadow-xl` : "bg-white/80 border-slate-200 text-slate-700 hover:border-purple-300"
            }`}>
            <span className="text-2xl font-black">{t.count}</span>
            <span className="text-xs font-bold">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Orders */}
      {loading && <div className="space-y-4">{[1,2].map(i => <div key={i} className="h-32 bg-white/60 rounded-3xl animate-pulse" />)}</div>}

      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center py-20 bg-white/60 border border-white rounded-3xl">
          <Package className="w-16 h-16 text-slate-200 mb-4" />
          <p className="text-slate-500 font-bold">لا توجد طلبات في هذه الحالة</p>
        </div>
      )}

      <div className="space-y-4">
        <AnimatePresence>
          {filtered.map((order, i) => {
            const rx = order.prescription;
            return (
              <motion.div key={order.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white/90 backdrop-blur-xl border border-white rounded-[2rem] p-6 shadow-xl shadow-purple-500/5">

                {/* Patient */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center font-black text-purple-700">
                      {order.patient?.full_name?.[0]}
                    </div>
                    <div>
                      <p className="font-black text-slate-800">{order.patient?.full_name}</p>
                      {order.patient?.phone && (
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <Phone className="w-3 h-3" />{order.patient.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs font-black px-3 py-1.5 rounded-xl ${
                    order.status === "PENDING"    ? "bg-amber-100 text-amber-700" :
                    order.status === "PROCESSING" ? "bg-blue-100 text-blue-700" :
                    "bg-emerald-100 text-emerald-700"
                  }`}>{STATUS_LABELS[order.status]}</span>
                </div>

                {/* Doctor */}
                {rx?.doctor && (
                  <div className="flex items-center gap-2 mb-3 text-xs text-slate-500">
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span className="font-bold">{rx.doctor.full_name}</span>
                    {rx.doctor.specialty && <span>({rx.doctor.specialty})</span>}
                  </div>
                )}

                {/* Medications */}
                {rx?.medications && (
                  <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 mb-4">
                    <p className="text-xs font-black text-purple-800 mb-2 flex items-center gap-1.5">
                      <Pill className="w-3.5 h-3.5" /> الأدوية الموصوفة
                    </p>
                    <div className="space-y-1.5">
                      {rx.medications.map((med: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="font-bold text-slate-800">{med.name}</span>
                          <span className="text-xs text-slate-500">
                            {med.dose}{med.frequency && ` — ${med.frequency}`}
                            {med.quantity && <span className="mr-2 font-bold text-purple-700"> {med.quantity}</span>}
                          </span>
                        </div>
                      ))}
                    </div>
                    {rx.doctor_notes && <p className="text-xs text-amber-700 mt-2 pt-2 border-t border-purple-100">⚠️ {rx.doctor_notes}</p>}
                  </div>
                )}

                {/* QR */}
                {rx?.qr_token && (
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl p-3 mb-4">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=50x50&data=${rx.qr_token}`} alt="QR" className="w-10 h-10 rounded" />
                    <div>
                      <p className="text-xs font-bold text-slate-600 flex items-center gap-1"><QrCode className="w-3 h-3" /> رمز التحقق</p>
                      <p className="text-xs font-mono text-slate-400">{String(rx.qr_token).substring(0, 18)}...</p>
                    </div>
                    {rx.is_used && <span className="mr-auto text-xs font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">مستخدمة</span>}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {order.status === "PENDING" && (
                    <button onClick={() => updateStatus(order.id, "PROCESSING")} disabled={!!updating}
                      className="flex-1 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-bold disabled:opacity-50">
                      {updating === order.id ? "..." : "🔄 بدء التجهيز"}
                    </button>
                  )}
                  {order.status === "PROCESSING" && (
                    <button onClick={() => updateStatus(order.id, "COMPLETED")} disabled={!!updating}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold disabled:opacity-50">
                      {updating === order.id ? "..." : "✅ جاهز للاستلام"}
                    </button>
                  )}
                  {order.status === "COMPLETED" && (
                    <div className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-500 text-sm font-bold text-center">✅ تم التسليم</div>
                  )}
                  <button onClick={() => updateStatus(order.id, "CANCELLED")} disabled={!!updating}
                    className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-500 text-sm font-bold hover:bg-rose-50">
                    رفض
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* QR Modal */}
      <AnimatePresence>
        {scanModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setScanModal(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-black text-slate-800 text-lg">مسح / إدخال رمز QR</h3>
                <button onClick={() => setScanModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <input value={scanInput} onChange={e => setScanInput(e.target.value)}
                placeholder="أدخل رمز التحقق من الوصفة..."
                className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-400 outline-none text-sm mb-3" />
              <button onClick={handleScan}
                className="w-full py-3 rounded-xl bg-gradient-to-l from-purple-600 to-fuchsia-500 text-white font-bold mb-4">
                البحث عن الوصفة
              </button>
              {scanResult && (
                <div className={`rounded-2xl p-4 border ${scanResult.is_used ? "bg-rose-50 border-rose-200" : "bg-purple-50 border-purple-200"}`}>
                  <p className={`font-black mb-2 ${scanResult.is_used ? "text-rose-700" : "text-purple-800"}`}>
                    {scanResult.is_used ? "⚠️ وصفة مستخدمة مسبقاً" : "✅ وصفة صالحة"}
                  </p>
                  <p className="text-sm text-slate-700"><span className="font-bold">المريض:</span> {scanResult.patient?.full_name}</p>
                  <p className="text-sm text-slate-700"><span className="font-bold">الطبيب:</span> {scanResult.doctor?.full_name}</p>
                </div>
              )}
              {scanInput && !scanResult && (
                <p className="text-center text-rose-500 text-sm font-bold">لم يُعثر على وصفة بهذا الرمز</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
