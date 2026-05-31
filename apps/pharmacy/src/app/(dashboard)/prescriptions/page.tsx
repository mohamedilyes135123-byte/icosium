"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Pill, CheckCircle2, Clock, BadgeCheck, ShieldAlert,
  QrCode, Package, User
} from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

export default function PharmacyPrescriptions() {
  const { lang, t } = useLanguage();
  const supabase = createClient();
  const [orders, setOrders] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Status map using translation keys
  const STATUS_MAP: Record<string, { label: string; color: string }> = {
    PENDING:    { label: t("statusPending"),    color: "bg-amber-100 text-amber-700 border-amber-200" },
    PROCESSING: { label: t("statusProcessing"), color: "bg-blue-100 text-blue-700 border-blue-200" },
    COMPLETED:  { label: t("statusCompleted"),  color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    CANCELLED:  { label: t("statusCancelled"),  color: "bg-slate-100 text-slate-500 border-slate-200" },
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user));
  }, [supabase]);

  const fetchOrders = useCallback(async () => {
    if (!currentUser) return;
    const { data } = await supabase
      .from("pharmacy_orders")
      .select(`
        *,
        patient:profiles!pharmacy_orders_patient_id_fkey(full_name, phone, address),
        prescription:prescriptions(
          id, medications, doctor_notes, qr_token,
          doctor:profiles!prescriptions_doctor_id_fkey(full_name, specialty)
        )
      `)
      .eq("pharmacy_id", currentUser.id)
      .order("created_at", { ascending: false });

    setOrders(data || []);
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
    setUpdatingId(orderId);
    await supabase.from("pharmacy_orders").update({ status }).eq("id", orderId);
    setUpdatingId(null);
  };

  return (
    <div className="pb-32 w-full" dir={lang === "ar" ? "rtl" : "ltr"}>

      {/* ── Header ── */}
      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="mb-8 pb-6 border-b border-purple-100/50">
        <h1 className="text-3xl font-extrabold text-slate-800 mb-2 tracking-tight">
          {t("prescriptionsTitle")}
        </h1>
        <p className="text-slate-500">
          {t("prescriptionsSubtitle")}
        </p>
      </motion.header>

      {/* ── RBAC Notice ── */}
      <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 mb-8 flex items-start gap-4 shadow-sm">
        <div className="bg-white p-2 rounded-full text-amber-500 border border-amber-100 shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-amber-900">{t("rbacNoticeTitle")}</h4>
          <p className="text-sm text-slate-600 mt-1">
            {t("rbacNoticeLine1")}<br />
            {t("rbacNoticeLine2")}<br />
            {t("rbacNoticeLine3")}
          </p>
        </div>
      </div>

      {/* ── Orders Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {orders.map((order) => {
            const rx = order.prescription;
            const st = STATUS_MAP[order.status] || STATUS_MAP.PENDING;
            const isExpanded = expandedId === order.id;

            return (
              <motion.div key={order.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                layout>
                <Card className="shadow-xl shadow-purple-500/5 flex flex-col bg-white/70 backdrop-blur-2xl rounded-3xl border-white relative overflow-hidden">

                  {/* Status bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                    order.status === "COMPLETED" ? "bg-emerald-500" :
                    order.status === "PROCESSING" ? "bg-blue-400" :
                    order.status === "CANCELLED" ? "bg-slate-300" : "bg-amber-400"
                  }`} />

                  <CardHeader className="bg-white/50 border-b border-slate-100 pt-5 pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-slate-800 text-base font-bold flex items-center gap-2">
                          <User className="w-4 h-4 text-purple-500" />
                          {order.patient?.full_name || t("patient")}
                        </CardTitle>
                        {order.patient?.phone && (
                          <p className="text-xs text-slate-400 mt-0.5">{order.patient.phone}</p>
                        )}
                        <p className="text-xs text-slate-400 font-medium mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(order.created_at).toLocaleString(lang === "ar" ? "ar-DZ" : "fr-DZ")}
                        </p>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border ${st.color}`}>
                        {st.label}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-5 flex-1 flex flex-col">

                    {/* Doctor info */}
                    {rx?.doctor && (
                      <div className="text-xs text-slate-500 mb-4 flex items-center gap-1.5">
                        <BadgeCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="font-bold text-slate-600">{rx.doctor.full_name}</span>
                        {rx.doctor.specialty && <span>({rx.doctor.specialty})</span>}
                      </div>
                    )}

                    {/* QR Code */}
                    {rx?.qr_token && (
                      <div className="flex items-center gap-3 bg-purple-50 border border-purple-100 rounded-2xl p-3 mb-4">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${rx.qr_token}`}
                          alt="QR"
                          className="w-16 h-16 rounded-xl"
                        />
                        <div>
                          <p className="text-xs font-bold text-purple-700 mb-1 flex items-center gap-1">
                            <QrCode className="w-3.5 h-3.5" /> {t("verifyCode")}
                          </p>
                          <p className="text-xs font-mono text-purple-600 break-all leading-relaxed">
                            {rx.qr_token?.substring(0, 20)}...
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Medications (READ ONLY) */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-4 flex-1 shadow-inner">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-slate-500 text-xs font-bold">{t("prescriptionContentLabel")}</h4>
                        <button onClick={() => setExpandedId(isExpanded ? null : order.id)}
                          className="text-xs text-purple-600 font-bold hover:underline">
                          {isExpanded ? t("hide") : t("showAll")}
                        </button>
                      </div>

                      {rx?.medications && (
                        <div className="space-y-2">
                          {(isExpanded ? rx.medications : rx.medications.slice(0, 2)).map((med: any, i: number) => (
                            <div key={i} className="bg-white rounded-xl p-2.5 border border-slate-200">
                              <p className="font-bold text-slate-800 text-sm">{med.name} <span className="text-slate-500 font-medium">{med.dose}</span></p>
                              <p className="text-xs text-slate-500 mt-0.5">{med.frequency} — {med.duration}</p>
                              {med.notes && <p className="text-xs text-amber-600 mt-0.5">⚠️ {med.notes}</p>}
                            </div>
                          ))}
                          {!isExpanded && rx.medications.length > 2 && (
                            <p className="text-xs text-center text-slate-400 font-medium">
                              + {rx.medications.length - 2} {t("moreItems")}
                            </p>
                          )}
                        </div>
                      )}

                      {rx?.doctor_notes && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <p className="text-xs text-slate-500">
                            <span className="font-bold">{t("doctorNote")}: </span>{rx.doctor_notes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Status Actions */}
                    {order.status === "PENDING" && (
                      <Button
                        onClick={() => updateStatus(order.id, "PROCESSING")}
                        disabled={updatingId === order.id}
                        className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 h-11 rounded-2xl text-white font-bold shadow-sm flex items-center justify-center gap-2 mb-2">
                        <Package className="w-4 h-4" />
                        {updatingId === order.id ? "..." : t("startPreparation")}
                      </Button>
                    )}
                    {order.status === "PROCESSING" && (
                      <Button
                        onClick={() => updateStatus(order.id, "COMPLETED")}
                        disabled={updatingId === order.id}
                        className="w-full bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-600 hover:to-green-500 h-11 rounded-2xl text-white font-bold shadow-sm flex items-center justify-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4" />
                        {updatingId === order.id ? "..." : t("readyForPickup")}
                      </Button>
                    )}
                    {order.status === "COMPLETED" && (
                      <div className="flex items-center justify-center gap-2 py-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 font-bold text-sm">
                        <CheckCircle2 className="w-4 h-4" /> {t("deliveredSuccess")}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}

          {orders.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white/40 border border-white rounded-3xl shadow-sm text-slate-400">
              <Pill className="w-16 h-16 mb-4 text-purple-200" />
              <h3 className="text-lg font-bold text-slate-600">{t("noRequestsNow")}</h3>
              <p className="text-sm">{t("noRequestsSubtitle")}</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
