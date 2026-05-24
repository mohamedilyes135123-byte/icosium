"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Calendar, Clock, Plus, ArrowRight, UserRound, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const STATUS: Record<string, { label: string; bg: string; color: string; icon?: string }> = {
  PENDING: { label: "قيد الانتظار", bg: "#fef9c3", color: "#92400e", icon: "/icon_pending.png" },
  APPROVED: { label: "موافق", bg: "#dcfce7", color: "#166534", icon: "/icon_approved.png" },
  REJECTED: { label: "مرفوض", bg: "#fee2e2", color: "#991b1b" },
  COMPLETED: { label: "مكتمل", bg: "#dbeafe", color: "#1e40af" },
  CANCELLED: { label: "ملغى", bg: "#f3f4f6", color: "#374151" },
};

export default function PatientAppointments() {
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

  const fetchAll = useCallback(async () => {
    if (!currentUser) return;
    const supabase = createClient();
    setLoading(true);

    const [{ data: appts }, { data: docs }] = await Promise.all([
      supabase.from("appointments").select(`
        *,
        doctor:profiles!appointments_doctor_id_fkey(full_name, specialty, full_name_ar)
      `).eq("patient_id", currentUser.id).order("created_at", { ascending: false }),
      supabase.from("profiles").select("id,full_name,full_name_ar,specialty,address").eq("role", "doctor").eq("approval_status", "approved"),
    ]);

    setAppointments(appts || []);
    setDoctors(docs || []);
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
      alert("حدث خطأ أثناء إرسال الطلب.");
    }
    setSubmitting(false);
  };

  const getDoctorName = (doc: any) => doc?.full_name_ar || doc?.full_name || "طبيب غير معروف";

  return (
    <div className="w-full pb-32" dir="rtl">
      {/* Header */}
      <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200">
            <ArrowRight className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-800">مواعيدي</h1>
            <p className="text-xs font-bold text-slate-400">إدارة حجوزاتك مع الأطباء</p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-l from-emerald-500 to-green-400 text-white text-sm font-bold shadow-lg shadow-emerald-500/30">
          <Plus className="w-4 h-4" /> طلب موعد
        </button>
      </motion.header>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : appointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white/50 backdrop-blur-md rounded-3xl border border-white shadow-sm">
          <Calendar className="w-16 h-16 text-slate-200 mb-4" />
          <p className="text-slate-500 font-bold text-lg mb-2">لا توجد مواعيد</p>
          <p className="text-slate-400 text-sm mb-6 max-w-[250px]">لم تقم بحجز أي موعد بعد.</p>
          <button onClick={() => setShowModal(true)} className="px-6 py-3 rounded-xl bg-slate-800 text-white font-bold shadow-lg transition-transform active:scale-95">
            طلب موعد الآن
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => {
            const st = STATUS[appt.status] || STATUS.PENDING;
            return (
              <motion.div key={appt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-md border border-white shadow-sm rounded-3xl p-5 flex flex-col gap-4 relative overflow-hidden">
                
                {/* Background Gradient based on status */}
                {appt.status === "APPROVED" && <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/30 rounded-full blur-3xl -z-10" />}
                {appt.status === "PENDING" && <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-200/30 rounded-full blur-3xl -z-10" />}

                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                      <Image src="/icon_calendar.png" alt="Calendar" width={32} height={32} style={{ mixBlendMode: "multiply" }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg mb-0.5">الدكتور {getDoctorName(appt.doctor)}</h3>
                      <p className="text-sm font-semibold text-slate-500 flex items-center gap-1">
                         <UserRound className="w-3.5 h-3.5"/> {appt.doctor?.specialty || "عام"}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ background: st.bg, color: st.color }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black shadow-sm border border-black/5">
                    {st.icon && <Image src={st.icon} alt={st.label} width={16} height={16} className="shrink-0" style={{ transform: "scale(1.2)" }} />}
                    <span>{st.label}</span>
                  </div>
                </div>

                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 relative">
                   <div className="absolute top-4 right-4 text-slate-300"><FileText className="w-5 h-5"/></div>
                   <p className="text-sm font-bold text-slate-700 mb-1 pr-7">سبب الزيارة:</p>
                   <p className="text-sm text-slate-600 leading-relaxed pr-7">{appt.reason}</p>
                </div>

                {appt.status === "APPROVED" && appt.scheduled_at && (
                  <div className="bg-gradient-to-l from-emerald-50 to-green-50 p-4 rounded-2xl border border-emerald-100 flex items-center gap-4">
                     <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex flex-col items-center justify-center text-emerald-600 shrink-0 border border-emerald-100/50">
                        <Clock className="w-5 h-5 mb-0.5"/>
                     </div>
                     <div>
                        <p className="text-xs font-bold text-emerald-600/80 mb-0.5">الموعد المحدد</p>
                        <p className="text-emerald-900 font-black text-lg">
                          {new Date(appt.scheduled_at).toLocaleDateString("ar-DZ", { weekday: "long", day: "numeric", month: "long" })}
                          {" — "}
                          {new Date(appt.scheduled_at).toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                     </div>
                  </div>
                )}
                
                {appt.notes && (
                  <div className="bg-blue-50/50 p-4 rounded-2xl border-l-4 border-l-blue-400 border border-blue-100">
                    <p className="text-xs font-bold text-blue-800 mb-1">ملاحظة من الطبيب:</p>
                    <p className="text-sm text-blue-900">{appt.notes}</p>
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
              <h2 className="text-xl font-black text-slate-800 mb-6">طلب موعد جديد</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">اختر الطبيب</label>
                  <select required value={doctorId} onChange={(e) => setDoctorId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-400 outline-none">
                    <option value="">-- اختر طبيباً --</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>
                        {getDoctorName(d)} {d.specialty ? `(${d.specialty})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">سبب الزيارة أو الأعراض</label>
                  <textarea required value={reason} onChange={(e) => setReason(e.target.value)} rows={4}
                    placeholder="اشرح باختصار سبب طلب الموعد..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-700 focus:ring-2 focus:ring-emerald-400 outline-none resize-none" />
                </div>

                <div className="flex gap-3 pt-4 mt-6 border-t border-slate-100">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors">
                    إلغاء
                  </button>
                  <button type="submit" disabled={submitting}
                    className="flex-[2] py-3 rounded-2xl bg-gradient-to-l from-emerald-600 to-green-500 text-white font-bold shadow-lg disabled:opacity-50 transition-transform active:scale-95">
                    {submitting ? "جاري الإرسال..." : "إرسال الطلب"}
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
