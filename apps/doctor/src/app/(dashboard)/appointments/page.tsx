"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Calendar, CheckCircle, XCircle, Clock, FileText, UserRound } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const STATUS: Record<string, { label: string; bg: string; color: string; icon?: string }> = {
  PENDING: { label: "قيد الانتظار", bg: "#fef9c3", color: "#92400e", icon: "/icon_pending.png" },
  APPROVED: { label: "موافق", bg: "#dcfce7", color: "#166534", icon: "/icon_approved.png" },
  REJECTED: { label: "مرفوض", bg: "#fee2e2", color: "#991b1b" },
  COMPLETED: { label: "مكتمل", bg: "#dbeafe", color: "#1e40af" },
  CANCELLED: { label: "ملغى", bg: "#f3f4f6", color: "#374151" },
};

export default function DoctorAppointments() {
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

  const fetchAppointments = useCallback(async () => {
    if (!currentUser) return;
    const supabase = createClient();
    setLoading(true);

    const { data } = await supabase.from("appointments").select(`
      *,
      patient:profiles!appointments_patient_id_fkey(full_name, full_name_ar, phone, date_of_birth, blood_group)
    `).eq("doctor_id", currentUser.id).order("created_at", { ascending: false });

    setAppointments(data || []);
    setLoading(false);
  }, [currentUser]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleAction = async (appt: any, action: "APPROVED" | "REJECTED") => {
    if (action === "REJECTED") {
       if (!confirm("هل أنت متأكد من رفض هذا الموعد؟")) return;
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
    const supabase = createClient();
    const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
    
    const { error } = await supabase.from("appointments").update({
      status: "APPROVED",
      scheduled_at: scheduledAt,
      notes: notes
    }).eq("id", selectedAppt.id);

    if (!error) {
      setSelectedAppt(null);
      fetchAppointments();
    } else {
      alert("حدث خطأ أثناء حفظ الموعد");
    }
    setSubmitting(false);
  };

  const getPatientName = (p: any) => p?.full_name_ar || p?.full_name || "مريض غير معروف";

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto pb-32" dir="rtl">
      {/* Header */}
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">إدارة المواعيد</h1>
          <p className="text-slate-500 font-medium mt-1">قم بتحديد تواريخ المواعيد والرد على المرضى</p>
        </div>
      </header>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : appointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white/70 backdrop-blur-md rounded-3xl border border-blue-100 shadow-sm">
          <Calendar className="w-20 h-20 text-blue-200 mb-4" />
          <p className="text-blue-800 font-bold text-xl mb-2">لا توجد طلبات مواعيد</p>
          <p className="text-slate-500 text-sm max-w-[250px]">لم يقم أي مريض بطلب موعد منك حتى الآن.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {appointments.map((appt) => {
            const st = STATUS[appt.status] || STATUS.PENDING;
            return (
              <motion.div key={appt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-md border border-slate-100 shadow-sm hover:shadow-md transition-all rounded-3xl p-6 flex flex-col relative overflow-hidden">
                
                {/* Background Gradient based on status */}
                {appt.status === "APPROVED" && <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/20 rounded-full blur-3xl -z-10" />}
                {appt.status === "PENDING" && <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full blur-3xl -z-10" />}
                {appt.status === "REJECTED" && <div className="absolute top-0 right-0 w-32 h-32 bg-rose-200/20 rounded-full blur-3xl -z-10" />}

                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex flex-col items-center justify-center border border-slate-200 shrink-0">
                      <UserRound className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 text-lg mb-0.5">{getPatientName(appt.patient)}</h3>
                      <p className="text-sm font-semibold text-slate-500">{appt.patient?.phone || "لا يوجد رقم هاتف"}</p>
                    </div>
                  </div>
                  
                  <div style={{ background: st.bg, color: st.color }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black shadow-sm border border-black/5">
                    {st.icon && <Image src={st.icon} alt={st.label} width={16} height={16} className="shrink-0" style={{ transform: "scale(1.2)" }} />}
                    <span>{st.label}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 relative mb-4">
                   <div className="absolute top-4 left-4 text-slate-300"><FileText className="w-5 h-5"/></div>
                   <p className="text-xs font-bold text-slate-400 mb-1">سبب الزيارة أو الأعراض:</p>
                   <p className="text-sm font-medium text-slate-700 leading-relaxed">{appt.reason}</p>
                </div>

                {appt.status === "APPROVED" && appt.scheduled_at && (
                  <div className="bg-gradient-to-l from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-200 flex items-center gap-4 mb-4">
                     <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex flex-col items-center justify-center text-green-600 shrink-0 border border-green-100">
                        <Clock className="w-5 h-5 mb-0.5"/>
                     </div>
                     <div>
                        <p className="text-xs font-bold text-green-700 mb-0.5">الموعد المحدد</p>
                        <p className="text-green-900 font-black text-lg">
                          {new Date(appt.scheduled_at).toLocaleDateString("ar-DZ", { weekday: "long", day: "numeric", month: "long" })}
                          {" - "}
                          {new Date(appt.scheduled_at).toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                     </div>
                  </div>
                )}
                
                {appt.notes && (
                  <div className="bg-blue-50/50 p-4 rounded-2xl border-l-4 border-l-blue-400 border border-blue-100 mb-4">
                    <p className="text-xs font-bold text-blue-800 mb-1">ملاحظة للطبيب:</p>
                    <p className="text-sm text-blue-900">{appt.notes}</p>
                  </div>
                )}

                {appt.status === "PENDING" && (
                  <div className="mt-auto flex gap-3 pt-4 border-t border-slate-100">
                    <button onClick={() => handleAction(appt, "REJECTED")}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-50 text-rose-600 font-bold hover:bg-rose-100 transition-colors text-sm border border-rose-200">
                      <XCircle className="w-4 h-4"/> رفض
                    </button>
                    <button onClick={() => handleAction(appt, "APPROVED")}
                      className="flex-[2] flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-l from-blue-600 to-cyan-500 text-white font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all text-sm">
                      <CheckCircle className="w-4 h-4"/> تحديد الموعد
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
              <h2 className="text-2xl font-black text-slate-800 mb-1">تحديد الموعد</h2>
              <p className="text-sm text-slate-500 mb-6">المريض: <span className="font-bold text-slate-700">{getPatientName(selectedAppt.patient)}</span></p>
              
              <form onSubmit={submitApproval} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">تاريخ الموعد</label>
                    <input type="date" required value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:ring-2 focus:ring-blue-400 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">وقت الموعد</label>
                    <input type="time" required value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:ring-2 focus:ring-blue-400 outline-none" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">ملاحظات للمريض (اختياري)</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                    placeholder="مثال: يرجى إحضار التحاليل السابقة، الصيام قبل الموعد..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-400 outline-none resize-none" />
                </div>

                <div className="flex gap-3 pt-4 mt-6 border-t border-slate-100">
                  <button type="button" onClick={() => setSelectedAppt(null)}
                    className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors">
                    إلغاء
                  </button>
                  <button type="submit" disabled={submitting}
                    className="flex-[2] py-3 rounded-2xl bg-gradient-to-l from-blue-600 to-cyan-500 text-white font-bold shadow-lg disabled:opacity-50 transition-transform active:scale-95">
                    {submitting ? "جاري الحفظ..." : "تأكيد الموعد"}
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
