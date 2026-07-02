"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Calendar, Clock, Plus, ArrowRight, UserRound, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useTranslation } from "@/hooks/useTranslation";

export default function PatientAppointments() {
  const { t, language } = useTranslation();
  const isRtl = language === 'ar';

  const STATUS: Record<string, { label: string; bg: string; color: string; icon?: string }> = {
    PENDING: { label: t.appointments.statusPending, bg: "#fef9c3", color: "#92400e", icon: "/icon_pending.png" },
    APPROVED: { label: t.appointments.statusApproved, bg: "#dcfce7", color: "#166534", icon: "/icon_approved.png" },
    REJECTED: { label: t.appointments.statusRejected, bg: "#fee2e2", color: "#991b1b" },
    COMPLETED: { label: t.appointments.statusCompleted, bg: "#dbeafe", color: "#1e40af" },
    CANCELLED: { label: t.appointments.statusCancelled, bg: "#f3f4f6", color: "#374151" },
  };

  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [doctorId, setDoctorId] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user));
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const supabase = createClient();
    supabase
      .from("profiles")
      .select("id,full_name,specialty,address")
      .eq("role", "doctor")
      .then(({ data, error }) => {
        if (error) console.error("[appointments] doctors error:", error.message);
        setDoctors(data || []);
      });
  }, [currentUser]);

  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!currentUser) return;
    const supabase = createClient();
    setLoading(true);
    setFetchError(null);

    const { data: appts, error } = await supabase
      .from("appointments")
      .select(`
        *,
        doctor:profiles!doctor_id(full_name, specialty)
      `)
      .eq("patient_id", currentUser.id)
      .order("created_at", { ascending: false });

    if (error) {
      setFetchError(error.message);
    }

    setAppointments(appts || []);
    setLoading(false);
  }, [currentUser]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId || !reason.trim() || !currentUser) return;
    
    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.from("appointments").insert({
      patient_id: currentUser.id,
      doctor_id: doctorId,
      reason: reason,
      status: "PENDING",
    });

    if (!error) {
      setDoctorId("");
      setReason("");
      setShowModal(false);
      fetchAll();
    } else {
      alert(t.appointments.errorSubmitting);
    }
    setSubmitting(false);
  };

  const getDoctorName = (doc: any) => doc?.full_name_ar || doc?.full_name || t.appointments.unknownDoctor;

  return (
    <div className="w-full pb-32" style={{ direction: isRtl ? "rtl" : "ltr" }}>
      {/* Header */}
      <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200">
            <ArrowRight className={`w-5 h-5 text-slate-600 ${isRtl ? "" : "rotate-185"}`} />
          </Link>
          <div className={isRtl ? "text-right" : "text-left"}>
            <h1 className="text-xl font-black text-slate-800">{t.appointments.title}</h1>
            <p className="text-xs font-bold text-slate-400">{t.appointments.subtitle}</p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-l from-emerald-500 to-green-400 text-white text-sm font-bold shadow-lg shadow-emerald-500/30">
          <Plus className="w-4 h-4" /> {t.appointments.requestAppointment}
        </button>
      </motion.header>

      {/* List */}
      {fetchError && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 mb-6 font-bold text-sm" dir="ltr">
          <p>Error fetching appointments:</p>
          <code className="block mt-2 text-xs">{fetchError}</code>
        </div>
      )}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : appointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white/50 backdrop-blur-md rounded-3xl border border-white shadow-sm">
          <Calendar className="w-16 h-16 text-slate-200 mb-4" />
          <p className="text-slate-500 font-bold text-lg mb-2">{t.appointments.noAppointments}</p>
          <p className="text-slate-400 text-sm mb-6 max-w-[250px]">{t.appointments.noAppointmentsDesc}</p>
          <button onClick={() => setShowModal(true)} className="px-6 py-3 rounded-xl bg-slate-800 text-white font-bold shadow-lg transition-transform active:scale-95">
            {t.appointments.requestAppointmentNow}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => {
            const st = STATUS[appt.status] || STATUS.PENDING;
            return (
              <motion.div key={appt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white/90 backdrop-blur-md border border-white shadow-md rounded-3xl p-5 flex flex-col gap-4 relative overflow-hidden">
                
                {appt.status === "APPROVED" && <div className={`absolute top-0 ${isRtl ? "right-0" : "left-0"} w-32 h-32 bg-green-200/40 rounded-full blur-3xl -z-10`} />}
                {appt.status === "PENDING" && <div className={`absolute top-0 ${isRtl ? "right-0" : "left-0"} w-32 h-32 bg-yellow-200/40 rounded-full blur-3xl -z-10`} />}

                <div className={`flex justify-between items-start ${isRtl ? "flex-row" : "flex-row-reverse"}`}>
                  <div className={`flex items-start gap-4 ${isRtl ? "flex-row" : "flex-row-reverse"}`}>
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-200 shrink-0 shadow-sm">
                      <Image src="/icon_calendar.png" alt="Calendar" width={32} height={32} style={{ mixBlendMode: "multiply" }} />
                    </div>
                    <div className={isRtl ? "text-right" : "text-left"}>
                      <h3 className="font-black text-slate-900 text-lg mb-0.5">{language === 'ar' ? `الدكتور ${getDoctorName(appt.doctor)}` : `Dr. ${getDoctorName(appt.doctor)}`}</h3>
                      <p className={`text-sm font-bold text-slate-600 flex items-center gap-1 ${isRtl ? "flex-row" : "flex-row-reverse"}`}>
                         <UserRound className="w-3.5 h-3.5"/> {appt.doctor?.specialty || t.appointments.general}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ background: st.bg, color: st.color }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black shadow-sm border border-black/5 ${isRtl ? "flex-row" : "flex-row-reverse"}`}>
                    {st.icon && <Image src={st.icon} alt={st.label} width={16} height={16} className="shrink-0" style={{ transform: "scale(1.2)" }} />}
                    <span>{st.label}</span>
                  </div>
                </div>

                <div className={`bg-slate-50 p-4 rounded-2xl border border-slate-200 relative ${isRtl ? "text-right" : "text-left"}`}>
                   <div className={`absolute top-4 ${isRtl ? "left-4" : "right-4"} text-slate-400`}><FileText className="w-5 h-5"/></div>
                   <p className={`text-sm font-black text-slate-800 mb-1 ${isRtl ? "pr-7" : "pl-7"}`}>{t.appointments.reasonForVisit}</p>
                   <p className={`text-sm font-medium text-slate-900 leading-relaxed ${isRtl ? "pr-7" : "pl-7"}`}>{appt.reason}</p>
                </div>

                {appt.status === "APPROVED" && appt.scheduled_at && (
                  <div className={`bg-gradient-to-l from-emerald-50 to-green-50 p-4 rounded-2xl border border-emerald-200 flex items-center gap-4 shadow-sm ${isRtl ? "flex-row" : "flex-row-reverse"}`}>
                     <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex flex-col items-center justify-center text-emerald-600 shrink-0 border border-emerald-100">
                        <Clock className="w-5 h-5 mb-0.5"/>
                     </div>
                     <div className={isRtl ? "text-right" : "text-left"}>
                        <p className="text-xs font-bold text-emerald-700 mb-0.5">{t.appointments.scheduledDate}</p>
                        <p className="text-emerald-950 font-black text-lg">
                          {new Date(appt.scheduled_at).toLocaleDateString(isRtl ? "ar-DZ" : "fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                          {" — "}
                          {new Date(appt.scheduled_at).toLocaleTimeString(isRtl ? "ar-DZ" : "fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                     </div>
                  </div>
                )}
                
                {appt.notes && (
                  <div className={`bg-emerald-50/80 p-4 rounded-2xl border border-emerald-100 shadow-sm ${isRtl ? "border-r-4 border-r-emerald-500 text-right" : "border-l-4 border-l-emerald-500 text-left"}`}>
                    <p className="text-xs font-black text-emerald-800 mb-1">{t.appointments.doctorNotes}</p>
                    <p className="text-sm font-medium text-emerald-950">{appt.notes}</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* New Appointment Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl overflow-hidden relative">
              <h2 className={`text-xl font-black text-slate-800 mb-6 ${isRtl ? "text-right" : "text-left"}`}>{t.appointments.newRequestTitle}</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className={isRtl ? "text-right" : "text-left"}>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">{t.appointments.selectDoctor}</label>
                  <select required value={doctorId} onChange={(e) => setDoctorId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-400 outline-none" style={{ direction: isRtl ? "rtl" : "ltr" }}>
                    <option value="">{t.appointments.chooseDoctorPlaceholder}</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>
                        {getDoctorName(d)} {d.specialty ? `(${d.specialty})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className={isRtl ? "text-right" : "text-left"}>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">{t.appointments.reasonLabel}</label>
                  <textarea required value={reason} onChange={(e) => setReason(e.target.value)} rows={4}
                    placeholder={t.appointments.reasonPlaceholder}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-700 focus:ring-2 focus:ring-emerald-400 outline-none resize-none" style={{ direction: isRtl ? "rtl" : "ltr" }} />
                </div>

                <div className={`flex gap-3 pt-4 mt-6 border-t border-slate-100 ${isRtl ? "flex-row" : "flex-row-reverse"}`}>
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors">
                    {t.common?.cancel || "إلغاء"}
                  </button>
                  <button type="submit" disabled={submitting}
                    className="flex-[2] py-3 rounded-2xl bg-gradient-to-l from-emerald-600 to-green-500 text-white font-bold shadow-lg disabled:opacity-50 transition-transform active:scale-95">
                    {submitting ? t.appointments.submitting : t.appointments.sendRequest}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
