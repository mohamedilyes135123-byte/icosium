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
import { useLanguage } from "@/components/LanguageContext";

export default function PharmacyDashboard() {
  const { t, lang } = useLanguage();
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
  const greet = hour < 12 ? t("morning") : hour < 17 ? t("afternoon") : t("evening");
  const pharmacyName = profile?.full_name || t("myPharmacy");

  return (
    <div className="pb-32 w-full" dir={lang === "ar" ? "rtl" : "ltr"}>

      {/* ── Header ── */}
      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8">
        <div>
          <p className="text-purple-600 text-sm font-semibold mb-0.5">{greet}</p>
          <h1 className="text-2xl font-black text-slate-800">{pharmacyName}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-2 h-2 rounded-full ${profile?.approval_status === "approved" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
            <span className={`text-xs font-bold ${profile?.approval_status === "approved" ? "text-emerald-600" : "text-amber-600"}`}>
              {profile?.approval_status === "approved" ? t("approved") : t("underReview")}
            </span>
          </div>
        </div>
        <button onClick={() => { setScanModal(true); setScanInput(""); setScanResult(null); setScanSearched(false); }}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-l from-purple-600 to-fuchsia-500 text-white font-bold shadow-xl shadow-purple-500/30 text-sm">
          <ScanLine className="w-5 h-5" /> {t("scanQRBtn")}
        </button>
      </motion.header>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: t("total"),      value: stats.total,      icon: <Package className="w-6 h-6" />,      color: "from-slate-600 to-slate-500" },
          { label: t("pending"),    value: stats.pending,    icon: <Clock className="w-6 h-6" />,         color: "from-amber-500 to-orange-400" },
          { label: t("processing"), value: stats.processing, icon: <Activity className="w-6 h-6" />,      color: "from-blue-500 to-indigo-400" },
          { label: t("delivered"),  value: stats.completed,  icon: <CheckCircle2 className="w-6 h-6" />, color: "from-emerald-500 to-teal-400" },
        ].map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1, transition: { delay: 0.1 + i * 0.05 } }}
            className={`rounded-3xl p-5 bg-gradient-to-br ${s.color} text-white shadow-lg overflow-hidden relative`}>
            <div className="absolute -left-3 -bottom-3 opacity-20">{s.icon}</div>
            <p className="text-3xl font-black mb-0.5">{loading ? "—" : s.value}</p>
            <p className="text-xs font-bold text-white/80">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Hero promo card ── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="rounded-3xl bg-gradient-to-br from-purple-700 to-fuchsia-600 p-6 text-white mb-8 shadow-2xl shadow-purple-500/20 relative overflow-hidden">
        <div className="absolute -left-4 -bottom-4 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-purple-300" />
            <span className="text-xs font-bold text-purple-200">RBAC — {t("pharmacyPermissions")}</span>
          </div>
          <h3 className="text-lg font-black mb-1">{t("rbacTitle")}</h3>
          <p className="text-sm text-purple-100/80 leading-snug">
            {t("rbacDesc")}
          </p>
        </div>
      </motion.div>

      {/* ── Recent orders ── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-black text-slate-800">{t("recentOrders")}</h2>
          <Link href="/prescriptions"
            className="flex items-center gap-1 text-purple-600 text-sm font-bold hover:text-purple-500">
            {t("viewAll")} <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>

        {loading && <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-18 bg-white/60 rounded-2xl animate-pulse" />)}</div>}

        {!loading && recentOrders.length === 0 && (
          <div className="flex flex-col items-center py-14 bg-white/60 border border-white rounded-3xl">
            <Pill className="w-14 h-14 text-purple-100 mb-3" />
            <p className="text-slate-500 font-bold">{t("noOrders")}</p>
            <p className="text-xs text-slate-400 mt-1">{t("noOrdersDesc")}</p>
          </div>
        )}

        <div className="space-y-3">
          {recentOrders.map((order, i) => (
            <motion.div key={order.id}
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0, transition: { delay: i * 0.04 } }}
              className="bg-white/90 backdrop-blur-xl border border-white rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm">
              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                order.status === "COMPLETED" ? "bg-emerald-500" :
                order.status === "PROCESSING" ? "bg-blue-400 animate-pulse" : "bg-amber-400"
              }`} />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 text-sm truncate">{order.patient?.full_name}</p>
                <p className="text-xs text-slate-400">
                  {order.prescription?.medications?.length || "—"} {t("medicinesCount")}
                  {order.prescription?.doctor?.full_name && ` · ${order.prescription.doctor.full_name}`}
                </p>
              </div>

              {order.status === "PENDING" && (
                <button onClick={() => updateStatus(order.id, "PROCESSING")}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 flex-shrink-0">
                  {t("startPrep")}
                </button>
              )}
              {order.status === "PROCESSING" && (
                <button onClick={() => updateStatus(order.id, "COMPLETED")}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200 flex-shrink-0">
                  {t("deliver")}
                </button>
              )}
              {order.status === "COMPLETED" && (
                <span className="text-xs font-black px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 flex-shrink-0">{t("done")}</span>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Quick links ── */}
      <div className="grid grid-cols-2 gap-4 mt-8">
        <Link href="/prescriptions"
          className="flex items-center gap-3 p-5 bg-white/80 backdrop-blur-xl border border-white rounded-2xl shadow-sm hover:border-purple-200 transition-all">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm">{t("prescriptionsLink")}</p>
            <p className="text-xs text-slate-400">{stats.pending} {t("pending")}</p>
          </div>
        </Link>
        <Link href="/inventory"
          className="flex items-center gap-3 p-5 bg-white/80 backdrop-blur-xl border border-white rounded-2xl shadow-sm hover:border-amber-200 transition-all">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm">{t("inventoryLink")}</p>
            <p className="text-xs text-slate-400">{t("manageMedicines")}</p>
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
                    <h3 className="font-black text-slate-800">{t("verifyPrescription")}</h3>
                    <p className="text-xs text-slate-400">{t("qrEnterCode")}</p>
                  </div>
                </div>
                <button onClick={() => setScanModal(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <input value={scanInput} onChange={e => setScanInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleScan()}
                placeholder={t("searchCode")}
                className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl mb-3 text-sm focus:ring-2 focus:ring-purple-400 outline-none" />
              <button onClick={handleScan}
                className="w-full py-3 rounded-xl bg-gradient-to-l from-purple-600 to-fuchsia-500 text-white font-bold mb-4 text-sm">
                {t("verifyBtn")}
              </button>

              {scanSearched && !scanResult && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-bold">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {t("notFound")}
                </div>
              )}
              {scanResult && (
                <div className={`rounded-2xl p-4 border ${scanResult.is_used ? "bg-rose-50 border-rose-200" : "bg-emerald-50 border-emerald-200"}`}>
                  <p className={`font-black text-sm mb-2 flex items-center gap-1.5 ${scanResult.is_used ? "text-rose-700" : "text-emerald-700"}`}>
                    {scanResult.is_used ? <><AlertTriangle className="w-4 h-4" /> {t("prescriptionUsed")}</> : <><CheckCircle2 className="w-4 h-4" /> {t("prescriptionValid")}</>}
                  </p>
                  <p className="text-xs text-slate-700"><span className="font-bold">{t("patient")}:</span> {scanResult.patient?.full_name}</p>
                  <p className="text-xs text-slate-700"><span className="font-bold">{t("doctor")}:</span> {scanResult.doctor?.full_name}</p>
                  <p className="text-xs text-slate-700"><span className="font-bold">{t("medicinesCount")}:</span> {scanResult.medications?.length}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
