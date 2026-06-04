"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Calendar, Clock, UserRound, Trash2 } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const getStatusConfig = (status: string) => {
  switch (status) {
    case "PENDING":
      return {
        text: "text-amber-600",
        border: "border-amber-200",
        icon: "/icon_pending.png",
      };
    case "APPROVED":
      return {
        text: "text-emerald-600",
        border: "border-emerald-200",
        icon: "/icon_approved.png",
      };
    case "REJECTED":
      return {
        text: "text-rose-600",
        border: "border-rose-200",
        icon: "/icon_rejected.png",
      };
    case "COMPLETED":
      return {
        text: "text-sky-600",
        border: "border-sky-200",
        icon: "/icon_approved.png",
      };
    default:
      return {
        text: "text-slate-600",
        border: "border-slate-200",
        icon: "/icon_pending.png",
      };
  }
};

const getStatusLabel = (status: string, lang: string) => {
  const labels: Record<string, Record<string, string>> = {
    PENDING:   { ar: "قيد الانتظار", fr: "En attente" },
    APPROVED:  { ar: "موافق",        fr: "Approuvé"   },
    REJECTED:  { ar: "مرفوض",        fr: "Refusé"     },
    COMPLETED: { ar: "مكتمل",        fr: "Complété"   },
    CANCELLED: { ar: "ملغى",         fr: "Annulé"     },
  };
  return labels[status]?.[lang] || status;
};

export default function DoctorAppointments() {
  const { lang, t } = useLanguage();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAppt, setSelectedAppt] = useState<any>(null);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user));
  }, []);

  const fetchAppointments = useCallback(async () => {
    if (!currentUser) return;
    const supabase = createClient();
    setLoading(true);
    setFetchError(null);
    const { data, error } = await supabase
      .from("appointments")
      .select(`*, patient:profiles!patient_id(full_name, phone)`)
      .eq("doctor_id", currentUser.id)
      .order("created_at", { ascending: false });
    if (error) setFetchError(error.message);
    setAppointments(data || []);
    setLoading(false);
  }, [currentUser]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const handleAction = async (appt: any, action: "APPROVED" | "REJECTED") => {
    if (action === "REJECTED") {
      if (!confirm(lang === "ar" ? "هل أنت متأكد من رفض هذا الموعد؟" : "Êtes-vous sûr de vouloir refuser ce rendez-vous ?")) return;
      const supabase = createClient();
      await supabase.from("appointments").update({ status: "REJECTED" }).eq("id", appt.id);
      fetchAppointments();
      return;
    }
    setSelectedAppt(appt);
    setScheduledDate("");
    setScheduledTime("");
    setNotes("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm(lang === "ar" ? "هل أنت متأكد من حذف هذا الموعد نهائياً؟" : "Êtes-vous sûr de vouloir supprimer ce rendez-vous ?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("appointments").delete().eq("id", id);
    if (error) {
      alert((lang === "ar" ? "حدث خطأ أثناء الحذف: " : "Erreur de suppression: ") + error.message);
    } else {
      await fetchAppointments();
    }
  };

  const submitApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppt || !scheduledDate || !scheduledTime) return;
    setSubmitting(true);
    try {
      const supabase = createClient();
      const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
      const { error } = await supabase.from("appointments").update({
        status: "APPROVED", scheduled_at: scheduledAt, notes,
      }).eq("id", selectedAppt.id);
      if (!error) { setSelectedAppt(null); await fetchAppointments(); }
      else alert((lang === "ar" ? "خطأ: " : "Erreur: ") + error.message);
    } catch (err: any) {
      alert(err.message);
    } finally { setSubmitting(false); }
  };

  const getPatientName = (p: any) => p?.full_name || t("patientUnknown");

  return (
    <div
      key={lang}
      className="min-h-screen p-6 sm:p-8 max-w-6xl mx-auto pb-32"
      style={{ background: "#F8F9FA" }}
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      {/* ── Page Header ── */}
      <header className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t("apptManagement")}</h1>
        <p className="text-slate-500 text-base mt-2 font-semibold">{t("apptManagementDesc")}</p>
      </header>

      {fetchError && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 mb-6 text-sm font-semibold" dir="ltr">
          Error: {fetchError}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Calendar className="w-16 h-16 text-slate-300 mb-4" />
          <p className="text-slate-700 font-black text-xl mb-2">{t("noApptRequests")}</p>
          <p className="text-slate-500 text-base max-w-[300px]">{t("noApptRequestsDesc")}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {appointments.map((appt, i) => {
            const cfg = getStatusConfig(appt.status);
            const label = getStatusLabel(appt.status, lang);
            return (
              <motion.div
                key={appt.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                // Gradient Border Wrapper
                className="relative p-[2px] rounded-2xl bg-gradient-to-br from-blue-600 via-[#0ea5e9] to-blue-500 hover:-translate-y-1.5 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 group flex flex-col"
              >
                {/* Inner White Card */}
                <div className="bg-white rounded-[14px] h-full flex flex-col overflow-hidden relative">
                  
                  {/* ── Card Header (Blue Gradient) ── */}
                  <div className="flex items-center justify-between px-5 py-5 bg-gradient-to-r from-[#1a6ff5] to-[#0ea5e9] relative rounded-t-[14px]">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "16px 16px" }} />
                    <div className="flex items-center gap-4 relative z-10">
                      {/* Avatar */}
                      <div className="w-14 h-14 rounded-full bg-white border-2 border-white/30 shadow-lg flex items-center justify-center shrink-0">
                        <UserRound className="w-7 h-7 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-black text-white text-lg leading-tight drop-shadow-md">
                          {getPatientName(appt.patient)}
                        </h3>
                        <p className="text-sm font-bold text-blue-100 mt-1 drop-shadow-sm">
                          {appt.patient?.phone || t("noPhoneNumber")}
                        </p>
                      </div>
                    </div>

                    {/* Actions & Badge */}
                    <div className="relative z-10 flex items-center gap-2">
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-white shadow-md font-black text-xs ${cfg.text} ${cfg.border}`}>
                        <Image src={cfg.icon} alt={label} width={14} height={14} className="shrink-0" />
                        <span>{label}</span>
                      </div>
                      <button onClick={() => handleDelete(appt.id)} className="p-2 bg-white/10 hover:bg-rose-500 hover:text-white rounded-xl text-white/80 transition-all border border-white/20 hover:border-rose-400" title={lang === "ar" ? "حذف الموعد" : "Supprimer"}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* ── Content ── */}
                  <div className="px-5 pt-6 pb-6 flex flex-col gap-5 flex-1">

                    {/* Visit Reason */}
                    <div>
                      <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        {t("visitReasonLabel")}
                      </p>
                      <p className="text-base font-black text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                        {appt.reason}
                      </p>
                    </div>

                    {/* Scheduled Appointment — nested card */}
                    {appt.status === "APPROVED" && appt.scheduled_at && (
                      <div className="rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-4 flex items-center gap-4 mt-2">
                        <div className="w-10 h-10 rounded-xl bg-white border border-blue-200 flex items-center justify-center shrink-0 shadow-sm">
                          <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-blue-500 uppercase tracking-widest mb-1">
                            {t("scheduledApptLabel")}
                          </p>
                          <p className="text-sm font-black text-slate-900">
                            {new Date(appt.scheduled_at).toLocaleDateString(
                              lang === "ar" ? "ar-DZ" : "fr-DZ",
                              { weekday: "long", day: "numeric", month: "long" }
                            )}
                            {" — "}
                            {new Date(appt.scheduled_at).toLocaleTimeString(
                              lang === "ar" ? "ar-DZ" : "fr-DZ",
                              { hour: "2-digit", minute: "2-digit" }
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Doctor Notes */}
                    {appt.notes && (
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 mt-2">
                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          {t("doctorNotesLabel")}
                        </p>
                        <p className="text-base font-bold text-slate-700 italic">"{appt.notes}"</p>
                      </div>
                    )}

                    {/* ── Action Buttons (PENDING only) ── */}
                    {appt.status === "PENDING" && (
                      <div className="flex gap-3 mt-auto pt-3">
                        <button
                          onClick={() => handleAction(appt, "REJECTED")}
                          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-sm text-white bg-gradient-to-r from-rose-500 to-rose-400 hover:from-rose-600 hover:to-rose-500 shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 hover:-translate-y-1 transition-all duration-300"
                        >
                          <Image src="/icon_rejected.png" alt="رفض" width={16} height={16} />
                          {t("rejectBtn")}
                        </button>
                        <button
                          onClick={() => handleAction(appt, "APPROVED")}
                          className="flex-[2] flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-sm text-white bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-600 hover:to-emerald-500 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-1 transition-all duration-300"
                        >
                          <Image src="/icon_approved.png" alt="موافقة" width={16} height={16} />
                          {t("fixApptBtn")}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Approval Modal ── */}
      <AnimatePresence>
        {selectedAppt && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: "rgba(15,23,42,0.65)", backdropFilter: "blur(8px)" }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-md rounded-[24px] overflow-hidden shadow-2xl relative"
            >
              {/* Modal Gradient Header */}
              <div className="px-6 py-6 bg-gradient-to-r from-[#1a6ff5] to-[#0ea5e9] relative">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "16px 16px" }} />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center">
                    <Image src="/icon_approved.png" alt="" width={24} height={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white drop-shadow-md">{t("scheduledApptTitle")}</h2>
                    <p className="text-sm text-blue-100 font-bold mt-1 drop-shadow-sm">
                      {lang === "ar" ? "المريض:" : "Patient :"}{" "}
                      <span className="text-white font-black">{getPatientName(selectedAppt.patient)}</span>
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={submitApproval} className="px-6 py-6 space-y-5 bg-white">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">
                      {t("apptDateLabel")}
                    </label>
                    <input
                      type="date" required value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-black text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">
                      {t("apptTimeLabel")}
                    </label>
                    <input
                      type="time" required value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-black text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">
                    {t("remarksForPatientOptional")}
                  </label>
                  <textarea
                    value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                    placeholder={t("remarksPlaceholderEx")}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none resize-none transition-all"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button" onClick={() => setSelectedAppt(null)}
                    className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 font-black hover:bg-slate-200 transition-colors text-base"
                  >
                    {t("cancelBtn")}
                  </button>
                  <button
                    type="submit" disabled={submitting}
                    className="flex-[2] flex items-center justify-center gap-2 py-3 rounded-xl text-white font-black shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-1 bg-gradient-to-r from-emerald-500 to-emerald-400 disabled:opacity-50 transition-all active:scale-95 text-base"
                  >
                    <Image src="/icon_approved.png" alt="" width={18} height={18} />
                    {submitting ? t("saving") : t("confirmApptBtn")}
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
