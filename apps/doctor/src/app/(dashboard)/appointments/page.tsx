"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Calendar, CheckCircle, XCircle, Clock, FileText, UserRound } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const STATUS: Record<string, { bg: string; color: string; icon?: string }> = {
  PENDING: { bg: "#fef9c3", color: "#92400e", icon: "/icon_pending.png" },
  APPROVED: { bg: "#dcfce7", color: "#166534", icon: "/icon_approved.png" },
  REJECTED: { bg: "#fee2e2", color: "#991b1b" },
  COMPLETED: { bg: "#dbeafe", color: "#1e40af" },
  CANCELLED: { bg: "#f3f4f6", color: "#374151" },
};

const getStatusLabel = (status: string, lang: string) => {
  const labels: Record<string, Record<string, string>> = {
    PENDING: { ar: "قيد الانتظار", fr: "En attente" },
    APPROVED: { ar: "موافق", fr: "Approuvé" },
    REJECTED: { ar: "مرفوض", fr: "Refusé" },
    COMPLETED: { ar: "مكتمل", fr: "Complété" },
    CANCELLED: { ar: "ملغى", fr: "Annulé" },
  };
  return labels[status]?.[lang] || status;
};

export default function DoctorAppointments() {
  const { lang, t } = useLanguage();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedAppt, setSelectedAppt] = useState<any>(null);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user));
  }, []);

  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    if (!currentUser) return;
    const supabase = createClient();
    setLoading(true);
    setFetchError(null);

    const { data, error } = await supabase.from("appointments").select(`
      *,
      patient:profiles!patient_id(full_name, phone)
    `).eq("doctor_id", currentUser.id).order("created_at", { ascending: false });

    if (error) {
      setFetchError(error.message);
    }
    
    setAppointments(data || []);
    setLoading(false);
  }, [currentUser]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleAction = async (appt: any, action: "APPROVED" | "REJECTED") => {
    if (action === "REJECTED") {
       if (!confirm(lang === "ar" ? "هل أنت متأكد من رفض هذا الموعد؟" : "Êtes-vous sûr de vouloir refuser ce rendez-vous ?")) return;
       const supabase = createClient();
       await supabase.from("appointments").update({ status: "REJECTED" }).eq("id", appt.id);
       fetchAppointments();
       return;
    }
    
    // For APPROVE, open modal to set date/time
    setSelectedAppt(appt);
    setScheduledDate("");
    setScheduledTime("");
    setNotes("");
  };

  const submitApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppt || !scheduledDate || !scheduledTime) return;
    
    setSubmitting(true);
    try {
      const supabase = createClient();
      const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
      
      const { error } = await supabase.from("appointments").update({
        status: "APPROVED",
        scheduled_at: scheduledAt,
        notes: notes
      }).eq("id", selectedAppt.id);

      if (!error) {
        setSelectedAppt(null);
        await fetchAppointments();
      } else {
        alert((lang === "ar" ? "حدث خطأ أثناء حفظ الموعد: " : "Erreur: ") + error.message);
      }
    } catch (err: any) {
      alert((lang === "ar" ? "خطأ تقني: " : "Erreur technique: ") + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getPatientName = (p: any) => p?.full_name || t("patientUnknown");

  return (
    <div key={lang} className="p-4 sm:p-8 max-w-6xl mx-auto pb-32" dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">{t("apptManagement")}</h1>
          <p className="text-slate-500 font-medium mt-1">{t("apptManagementDesc")}</p>
        </div>
      </header>

      {/* List */}
      {fetchError && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 mb-6 font-bold text-sm" dir="ltr">
          <p>Error fetching appointments:</p>
          <code className="block mt-2 text-xs">{fetchError}</code>
        </div>
      )}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : appointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white/70 backdrop-blur-md rounded-3xl border border-blue-100 shadow-sm">
          <Calendar className="w-20 h-20 text-blue-200 mb-4" />
          <p className="text-blue-800 font-bold text-xl mb-2">{t("noApptRequests")}</p>
          <p className="text-slate-500 text-sm max-w-[250px]">{t("noApptRequestsDesc")}</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {appointments.map((appt) => {
            const st = STATUS[appt.status] || STATUS.PENDING;
            const labelText = getStatusLabel(appt.status, lang);
            return (
              <motion.div key={appt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col relative overflow-hidden border-2 border-slate-200 hover:border-blue-300">
                
                <div className="flex justify-between items-start mb-5">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <UserRound className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 text-xl leading-tight mb-1">{getPatientName(appt.patient)}</h3>
                      <p className="text-sm font-semibold text-slate-400">{appt.patient?.phone || t("noPhoneNumber")}</p>
                    </div>
                  </div>
                  
                  <div className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-black border ${
                    appt.status === "PENDING" ? "bg-amber-50/50 text-amber-600 border-amber-100/50" :
                    appt.status === "APPROVED" ? "bg-emerald-50/50 text-emerald-600 border-emerald-100/50" :
                    appt.status === "REJECTED" ? "bg-rose-50/50 text-rose-600 border-rose-100/50" :
                    "bg-slate-50 text-slate-500 border-slate-100"
                  }`}>
                    {st.icon && <Image src={st.icon} alt={labelText} width={14} height={14} className="shrink-0" />}
                    <span>{labelText}</span>
                  </div>
                </div>

                <hr className="border-slate-50 mb-5" />

                {/* Visit Reason Box */}
                <div className="mb-5">
                   <div className="flex items-center gap-2 mb-2">
                     <FileText className="w-5 h-5 text-slate-300"/>
                     <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">{t("visitReasonLabel")}</p>
                   </div>
                   <p className="text-base font-semibold text-slate-700 leading-relaxed pl-7">{appt.reason}</p>
                </div>

                {/* Scheduled Time (If Approved) */}
                {appt.status === "APPROVED" && appt.scheduled_at && (
                  <div className="bg-blue-50/50 rounded-2xl p-5 flex items-center gap-4 mb-5 border border-blue-100/50">
                     <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm border border-blue-100">
                        <Clock className="w-5 h-5 text-blue-600"/>
                     </div>
                     <div>
                        <p className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">{t("scheduledApptLabel")}</p>
                        <p className="font-black text-base text-blue-800">
                          {new Date(appt.scheduled_at).toLocaleDateString(lang === "ar" ? "ar-DZ" : "fr-DZ", { weekday: "long", day: "numeric", month: "long" })}
                          {" - "}
                          {new Date(appt.scheduled_at).toLocaleTimeString(lang === "ar" ? "ar-DZ" : "fr-DZ", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                     </div>
                  </div>
                )}
                
                {/* Doctor Notes */}
                {appt.notes && (
                  <div className="bg-slate-50/80 rounded-2xl p-5 mb-5 border border-slate-100/80">
                    <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">{t("doctorNotesLabel")}</p>
                    <p className="text-base font-medium text-slate-600 italic">"{appt.notes}"</p>
                  </div>
                )}

                {/* Actions */}
                {appt.status === "PENDING" && (
                  <div className="mt-auto flex gap-3 pt-3">
                    <button onClick={() => handleAction(appt, "REJECTED")}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white text-slate-500 font-bold hover:bg-rose-50 hover:text-rose-600 transition-colors text-base border border-slate-200 hover:border-rose-200">
                      <XCircle className="w-5 h-5"/> {t("rejectBtn")}
                    </button>
                    <button onClick={() => handleAction(appt, "APPROVED")}
                      className="flex-[2] flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all text-base">
                      <CheckCircle className="w-5 h-5"/> {t("fixApptBtn")}
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Approval Modal (Set Date/Time) */}
      <AnimatePresence>
        {selectedAppt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-lg rounded-3xl p-7 shadow-2xl overflow-hidden relative">
              <h2 className="text-2xl font-black text-slate-800 mb-1">{t("scheduledApptTitle")}</h2>
              <p className="text-sm text-slate-500 mb-6">{lang === "ar" ? "المريض:" : "Patient :"} <span className="font-bold text-slate-700">{getPatientName(selectedAppt.patient)}</span></p>
              
              <form onSubmit={submitApproval} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">{t("apptDateLabel")}</label>
                    <input type="date" required value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:ring-2 focus:ring-blue-400 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">{t("apptTimeLabel")}</label>
                    <input type="time" required value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:ring-2 focus:ring-blue-400 outline-none" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">{t("remarksForPatientOptional")}</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                    placeholder={t("remarksPlaceholderEx")}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-400 outline-none resize-none" />
                </div>

                <div className="flex gap-3 pt-4 mt-6 border-t border-slate-100">
                  <button type="button" onClick={() => setSelectedAppt(null)}
                    className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors">
                    {t("cancelBtn")}
                  </button>
                  <button type="submit" disabled={submitting}
                    className="flex-[2] py-3 rounded-2xl bg-gradient-to-l from-blue-600 to-cyan-500 text-white font-bold shadow-lg disabled:opacity-50 transition-transform active:scale-95">
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
