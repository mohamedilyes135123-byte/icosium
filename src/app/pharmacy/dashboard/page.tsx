"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Pill, CheckCircle2, Clock, AlertTriangle, ScanLine, QrCode, X, Package, User, Phone, Stethoscope, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "انتظار التجهيز",
  PROCESSING: "جاري التجهيز",
  COMPLETED: "جاهز للاستلام",
  CANCELLED: "ملغى",
};

export default function PharmacyDashboard() {
  const supabase = createClient();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"PENDING" | "PROCESSING" | "COMPLETED">("PENDING");
  const [updating, setUpdating] = useState<string | null>(null);
  const [scanModal, setScanModal] = useState(false);
  const [scanInput, setScanInput] = useState("");
  const [scanResult, setScanResult] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user));
  }, [supabase]);

  const fetchOrders = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    const { data } = await supabase
      .from("pharmacy_orders")
      .select(`
        *,
        patient:profiles!pharmacy_orders_patient_id_fkey(full_name, phone),
        prescription:prescriptions(
          medications, doctor_notes, qr_token,
          doctor:profiles!prescriptions_doctor_id_fkey(full_name, specialty)
        )
      `)
      .eq("pharmacy_id", currentUser.id)
      .order("created_at", { ascending: false });
    setOrders(data || []);
    setLoading(false);
  }, [supabase, currentUser]);

  useEffect(() => {
    fetchOrders();
    const channel = supabase
      .channel("pharmacy-orders-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "pharmacy_orders" }, fetchOrders)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase, fetchOrders]);

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(orderId);
    await supabase.from("pharmacy_orders").update({ status }).eq("id", orderId);
    // if delivered, mark prescription as used
    if (status === "COMPLETED") {
      const order = orders.find(o => o.id === orderId);
      if (order?.prescription_id) {
        await supabase.from("prescriptions").update({ is_used: true }).eq("id", order.prescription_id);
      }
    }
    fetchOrders();
    setUpdating(null);
  };

  const handleQrScan = async () => {
    if (!scanInput.trim()) return;
    const { data } = await supabase
      .from("prescriptions")
      .select(`
        *, 
        patient:profiles!prescriptions_patient_id_fkey(full_name, phone),
        doctor:profiles!prescriptions_doctor_id_fkey(full_name, specialty)
      `)
      .eq("qr_token", scanInput.trim())
      .single();
    setScanResult(data || null);
  };

  const filteredOrders = orders.filter(o => o.status === filter);
  const pendingCount = orders.filter(o => o.status === "PENDING").length;
  const processingCount = orders.filter(o => o.status === "PROCESSING").length;
  const completedCount = orders.filter(o => o.status === "COMPLETED").length;

  return (
    <div className="pb-32 w-full" dir="rtl">
      {/* Header */}
      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800">لوحة الصيدلية</h1>
          <p className="text-sm text-slate-500">
            {pendingCount > 0 ? <span className="text-purple-600 font-bold">{pendingCount} وصفة تنتظر التجهيز</span> : "لا توجد وصفات جديدة"}
          </p>
        </div>
        <button onClick={() => { setScanModal(true); setScanInput(""); setScanResult(null); }}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-l from-purple-600 to-fuchsia-500 text-white font-bold shadow-lg shadow-purple-500/30 text-sm">
          <ScanLine className="w-5 h-5" /> مسح QR الوصفة
        </button>
      </motion.header>

      {/* Counts */}
      <div className="grid grid-cols-3 gap-4 mb-7">
        {[
          { key: "PENDING", label: "انتظار", count: pendingCount, color: "from-amber-500 to-orange-400" },
          { key: "PROCESSING", label: "تجهيز", count: processingCount, color: "from-blue-500 to-indigo-400" },
          { key: "COMPLETED", label: "مكتمل", count: completedCount, color: "from-emerald-500 to-teal-400" },
        ].map(t => (
          <button key={t.key} onClick={() => setFilter(t.key as any)}
            className={`rounded-3xl p-5 flex flex-col gap-1 border-2 transition-all ${
              filter === t.key ? `bg-gradient-to-br ${t.color} text-white border-transparent shadow-xl` : "bg-white/80 border-slate-200 text-slate-700 hover:border-purple-300"
            }`}>
            <span className="text-3xl font-black">{t.count}</span>
            <span className="text-xs font-bold">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Orders list */}
      {loading && <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-white/60 rounded-3xl animate-pulse" />)}</div>}

      {!loading && filteredOrders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <Package className="w-16 h-16 text-slate-200 mb-4" />
          <p className="text-slate-500 font-bold">لا توجد طلبات في هذه الحالة</p>
        </div>
      )}

      <div className="space-y-4">
        <AnimatePresence>
          {filteredOrders.map((order, i) => {
            const rx = order.prescription;
            return (
              <motion.div key={order.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white/90 backdrop-blur-xl border border-white rounded-[2rem] p-6 shadow-xl shadow-purple-500/5">

                {/* Order header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center font-black text-purple-700">
                      {order.patient?.full_name?.[0]}
                    </div>
                    <div>
                      <p className="font-black text-slate-800">{order.patient?.full_name}</p>
                      {order.patient?.phone && <p className="text-xs text-slate-400 flex items-center gap-1"><Phone className="w-3 h-3" />{order.patient.phone}</p>}
                    </div>
                  </div>
                  <span className={`text-xs font-black px-3 py-1.5 rounded-xl ${
                    order.status === "PENDING" ? "bg-amber-100 text-amber-700" :
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
                        <div key={idx} className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 text-sm">{med.name}</span>
                          <div className="text-xs text-slate-500 text-left">
                            <span>{med.dose}</span>
                            {med.frequency && <span className="mr-2"> — {med.frequency}</span>}
                            {med.quantity && <span className="mr-2 font-bold text-purple-700">{med.quantity}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                    {rx.doctor_notes && <p className="text-xs text-amber-700 mt-2 pt-2 border-t border-purple-100">⚠️ {rx.doctor_notes}</p>}
                  </div>
                )}

                {/* QR token */}
                {rx?.qr_token && (
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl p-3 mb-4">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=50x50&data=${rx.qr_token}`} alt="QR" className="w-10 h-10 rounded" />
                    <div>
                      <p className="text-xs font-bold text-slate-600 flex items-center gap-1"><QrCode className="w-3 h-3" /> رمز التحقق</p>
                      <p className="text-xs font-mono text-slate-400">{rx.qr_token?.substring(0, 18)}...</p>
                    </div>
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
                    <div className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-500 text-sm font-bold text-center">
                      ✅ تم التسليم
                    </div>
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

      {/* QR Scan Modal */}
      <AnimatePresence>
        {scanModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setScanModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9 }}
              className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-black text-slate-800 text-lg">مسح / إدخال رمز QR</h3>
                <button onClick={() => setScanModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <input value={scanInput} onChange={e => setScanInput(e.target.value)}
                placeholder="أدخل رمز التحقق من الوصفة..."
                className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-400 outline-none text-sm mb-3" />
              <button onClick={handleQrScan}
                className="w-full py-3 rounded-xl bg-gradient-to-l from-purple-600 to-fuchsia-500 text-white font-bold mb-4">
                البحث عن الوصفة
              </button>
              {scanResult && (
                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
                  <p className="font-black text-purple-800 mb-2">✅ وصفة صالحة</p>
                  <p className="text-sm text-slate-700"><span className="font-bold">المريض:</span> {scanResult.patient?.full_name}</p>
                  <p className="text-sm text-slate-700"><span className="font-bold">الطبيب:</span> {scanResult.doctor?.full_name}</p>
                  <p className="text-xs text-slate-500 mt-1">{scanResult.is_used ? "⚠️ هذه الوصفة مستخدمة مسبقاً" : "✅ وصفة جديدة غير مستخدمة"}</p>
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


export default function PharmacyDashboard() {
  return (
    <div className="pb-32 w-full">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex justify-between items-end border-b border-purple-100/50 pb-6"
      >
        <div>
          <h1 className="text-4xl font-extrabold text-slate-800 mb-2 tracking-tight">صيدلية النور</h1>
          <p className="text-slate-500 text-lg">لديك <span className="text-purple-600 font-bold">3 وصفات</span> طبية جديدة بانتظار التجهيز.</p>
        </div>
        <div className="flex gap-4">
           <Button className="gap-2 bg-gradient-to-r from-purple-600 to-fuchsia-500 hover:from-purple-500 hover:to-fuchsia-400 shadow-[0_4px_20px_rgba(168,85,247,0.3)] border border-purple-400/50 rounded-xl h-12 px-6 text-white font-bold transition-all hover:scale-105">
              <ScanLine className="w-5 h-5"/> مسح QR كود الوصفة
           </Button>
        </div>
      </motion.header>

      {/* RBAC Rule Display for Demo */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-rose-50/80 border border-rose-200 rounded-2xl p-4 mb-8 flex items-start gap-4 shadow-sm backdrop-blur-md"
      >
        <div className="bg-white p-2 rounded-full text-rose-500 mt-1 border border-rose-100 shadow-sm">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
           <h4 className="font-bold text-rose-900 text-lg">صلاحيات النظام الصارمة (RBAC: Pharmacy Level)</h4>
           <div className="text-sm text-slate-600 mt-1.5 flex flex-wrap gap-5">
              <span className="flex items-center gap-1.5 font-semibold text-emerald-600"><CheckCircle2 className="w-4 h-4"/> قراءة الوصفات المرسلة والتأكيد</span>
              <span className="flex items-center gap-1.5 text-rose-600 font-bold"><AlertTriangle className="w-4 h-4"/> يمنع النظام تقنياً أي محاولة لتعديل محتوى الوصفة</span>
           </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.2 }}
        >
          <Card className="shadow-xl shadow-purple-500/5 border-white h-[650px] flex flex-col bg-white/60 backdrop-blur-2xl rounded-3xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-100/50 mix-blend-multiply blur-3xl rounded-full"></div>
            <CardHeader className="bg-white/50 border-b border-amber-50 relative z-10">
              <CardTitle className="text-amber-600 flex items-center gap-2 text-xl font-bold">
                <Clock className="w-6 h-6"/>
                وصفات بانتظار التجهيز (3)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 flex-1 overflow-y-auto space-y-5 relative z-10 p-6">
              
              {/* Prescription mock */}
              <div className="bg-white border border-amber-100 rounded-2xl p-6 hover:border-amber-300 hover:shadow-md transition-all group/item shadow-sm">
                <div className="flex justify-between items-start mb-5 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-xl text-slate-800">أحمد بن علي</h3>
                    <p className="text-sm text-slate-500 font-bold mt-1">طبيب معالج: د. يوسف خليل</p>
                  </div>
                  <span className="bg-amber-50 border border-amber-200 text-amber-600 px-3 py-1.5 rounded-lg text-xs font-black shadow-sm">بانتظار التأكيد</span>
                </div>
                
                <div className="bg-slate-50 rounded-xl p-4 space-y-3 mb-6 border border-slate-100 font-mono shadow-inner">
                   <div className="flex justify-between items-end text-sm">
                     <span className="font-bold text-slate-800 text-base">Paracetamol 1000mg</span>
                     <span className="text-slate-500 font-sans">1 قرص / 8 ساعات</span>
                   </div>
                   <div className="flex justify-between items-end text-sm border-t border-slate-200 pt-3">
                     <span className="font-bold text-slate-800 text-base">Amoxicillin 500mg</span>
                     <span className="text-slate-500 font-sans">1 كبسولة / 12 ساعة</span>
                   </div>
                </div>

                <div className="flex gap-3">
                   <Button className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-white font-bold h-12 rounded-xl border border-emerald-500 shadow-md shadow-emerald-500/20">
                     تأكيد توفر الأدوية (تجهيز)
                   </Button>
                   <Button variant="outline" className="w-14 items-center justify-center p-0 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 border-slate-200 rounded-xl h-12 bg-white">
                     <AlertTriangle className="w-5 h-5"/>
                   </Button>
                </div>
              </div>

            </CardContent>
          </Card>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.3 }}
        >
          <Card className="shadow-xl shadow-purple-500/5 h-[650px] flex flex-col bg-white/60 backdrop-blur-2xl rounded-3xl border-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/50 mix-blend-multiply blur-3xl rounded-full"></div>
            <CardHeader className="bg-white/50 border-b border-emerald-50 relative z-10">
              <CardTitle className="flex items-center gap-2 text-emerald-600 text-xl font-bold">
                <CheckCircle2 className="w-6 h-6"/>
                تم التجهيز (بانتظار المريض المجيء)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 flex-1 overflow-y-auto space-y-4 relative z-10 p-6">
              
              <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <h3 className="font-bold text-xl text-slate-800">سمير محمودي</h3>
                    <p className="text-sm text-slate-500 mt-1 font-bold">طبيب معالج: د. سارة بوعلام</p>
                  </div>
                  <span className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-3 py-1.5 rounded-lg text-xs font-black shadow-sm">جاهز للاستلام المباشر</span>
                </div>
                <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200 text-slate-700 font-bold hover:bg-slate-50 hover:text-slate-900 bg-white shadow-sm">التأكيد وتسليم الدواء</Button>
              </div>

            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
