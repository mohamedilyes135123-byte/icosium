"use client";

export const dynamic = 'force-dynamic';


import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Pill, ScanLine, CheckCircle2, Clock, Package,
  TrendingUp, Bell, ArrowRight, X, QrCode,
  Activity, AlertTriangle, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function PharmacyDashboard() {
  const supabase = createClient();
  const [user, setUser]       = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats]     = useState({ pending: 0, processing: 0, completed: 0, total: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanModal, setScanModal]     = useState(false);
  const [scanInput, setScanInput]     = useState("");
  const [scanResult, setScanResult]   = useState<any>(null);
  const [scanSearched, setScanSearched] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, [supabase]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [{ data: prof }, { data: orders }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("pharmacy_orders")
        .select(`*, patient:profiles!pharmacy_orders_patient_id_fkey(full_name),
          prescription:prescriptions(medications, doctor:profiles!prescriptions_doctor_id_fkey(full_name))`)
        .eq("pharmacy_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);
    setProfile(prof);
    const o = orders || [];
    setStats({
      pending:    o.filter(x => x.status === "PENDING").length,
      processing: o.filter(x => x.status === "PROCESSING").length,
      completed:  o.filter(x => x.status === "COMPLETED").length,
      total:      o.length,
    });
    setRecentOrders(o.slice(0, 5));
    setLoading(false);
  }, [supabase, user]);

  useEffect(() => {
    fetchData();
    const ch = supabase.channel("pharmacy-dash-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "pharmacy_orders" }, fetchData)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [supabase, fetchData]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("pharmacy_orders").update({ status }).eq("id", id);
  };

  const handleScan = async () => {
    setScanSearched(true);
    setScanResult(null);
    const { data } = await supabase
      .from("prescriptions")
      .select(`*, patient:profiles!prescriptions_patient_id_fkey(full_name, phone),
        doctor:profiles!prescriptions_doctor_id_fkey(full_name, specialty)`)
      .eq("qr_token", scanInput.trim())
      .single();
    setScanResult(data || null);
  };

  const hour  = new Date().getHours();
  const greet = hour < 12 ? "صباح الخير ☀️" : hour < 17 ? "مساء الخير 🌤️" : "مساء النور 🌙";
  const pharmacyName = profile?.full_name || "صيدليتي";

  return (
    <div className="pb-32 w-full" dir="rtl">

      {/* ── Header ── */}
      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8">
        <div>
          <p className="text-purple-600 text-sm font-semibold mb-0.5">{greet}</p>
          <h1 className="text-2xl font-black text-slate-800">{pharmacyName}</h1>
          <div className="flex items-center gap-2 mt-1">
          </div>
        </Link>
      </div>

      {/* ── QR Scan Modal ── */}
      <AnimatePresence>
        {scanModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setScanModal(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800">التحقق من الوصفة</h3>
                    <p className="text-xs text-slate-400">أدخل رمز QR للتحقق</p>
                  </div>
                </div>
                <button onClick={() => setScanModal(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <input value={scanInput} onChange={e => setScanInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleScan()}
                placeholder="رمز التحقق من الوصفة..."
                className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl mb-3 text-sm focus:ring-2 focus:ring-purple-400 outline-none" />
              <button onClick={handleScan}
                className="w-full py-3 rounded-xl bg-gradient-to-l from-purple-600 to-fuchsia-500 text-white font-bold mb-4 text-sm">
                🔍 التحقق من الوصفة
              </button>

              {scanSearched && !scanResult && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-bold">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  لم يُعثر على وصفة بهذا الرمز
                </div>
              )}
              {scanResult && (
                <div className={`rounded-2xl p-4 border ${scanResult.is_used ? "bg-rose-50 border-rose-200" : "bg-emerald-50 border-emerald-200"}`}>
                  <p className={`font-black text-sm mb-2 flex items-center gap-1.5 ${scanResult.is_used ? "text-rose-700" : "text-emerald-700"}`}>
                    {scanResult.is_used ? <><AlertTriangle className="w-4 h-4" /> وصفة مستخدمة مسبقاً</> : <><CheckCircle2 className="w-4 h-4" /> وصفة صالحة</>}
                  </p>
                  <p className="text-xs text-slate-700"><span className="font-bold">المريض:</span> {scanResult.patient?.full_name}</p>
                  <p className="text-xs text-slate-700"><span className="font-bold">الطبيب:</span> {scanResult.doctor?.full_name}</p>
                  <p className="text-xs text-slate-700"><span className="font-bold">عدد الأدوية:</span> {scanResult.medications?.length}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
