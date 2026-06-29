"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { fetchActivePaymentPlan, createTrialPaymentTransaction, unlockPrescription, autoCreateRemindersFromPrescription } from "@/lib/supabase/actions";
import Image from "next/image";

interface PaymentModalProps {
  prescriptionId: string;
  patientId: string;
  medications: any[];
  doctorName?: string;
  onSuccess: () => void;
  onClose: () => void;
}

export default function PaymentModal({ prescriptionId, patientId, medications, doctorName, onSuccess, onClose }: PaymentModalProps) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fee, setFee] = useState<number | null>(null);
  const [currency, setCurrency] = useState("DZD");
  const [paymentCode, setPaymentCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlan = async () => {
      try {
        const plan = await fetchActivePaymentPlan("patient");
        if (plan) {
          setFee(plan.prescription_fee);
          setCurrency(plan.currency || "DZD");
        } else {
          setFee(300); // fallback
        }
      } catch (err) {
        setFee(300);
      }
      setLoading(false);
    };
    loadPlan();
  }, []);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentCode || paymentCode.length < 8) {
      setError("الرجاء إدخال رقم دفع صحيح (8 أرقام على الأقل)");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // 1. Create Trial Transaction
      await createTrialPaymentTransaction(patientId, prescriptionId, fee || 300, paymentCode);
      
      // 2. Unlock Prescription
      await unlockPrescription(prescriptionId);

      // 3. Auto-create medication reminders
      await autoCreateRemindersFromPrescription(prescriptionId, patientId, medications, doctorName);

      onSuccess();
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء الدفع");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md bg-white rounded-[2rem] overflow-hidden shadow-2xl relative"
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-6 text-center relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          
          <div className="relative z-10 w-16 h-16 mx-auto bg-white rounded-2xl flex items-center justify-center shadow-lg mb-4 rotate-3">
            <span className="text-3xl">💳</span>
          </div>
          <h3 className="text-white font-black text-xl mb-1 relative z-10">دفع مستحقات الوصفة</h3>
          <p className="text-orange-100 text-sm font-bold relative z-10">لفتح الوصفة، يرجى الدفع أولاً</p>
        </div>

        <form onSubmit={handlePay} className="p-6">
          {/* Trial Banner */}
          <div className="mb-6 p-4 bg-amber-50 rounded-2xl border border-amber-200 flex gap-3">
            <span className="text-xl">🧪</span>
            <div>
              <p className="font-black text-amber-800 text-sm">وضع الدفع التجريبي</p>
              <p className="text-amber-700 text-xs mt-1 leading-relaxed">
                أي رقم مكون من 8 أرقام سيتم قبوله فوراً دون اختصام أي مبلغ. (يُستخدم للتجربة فقط).
              </p>
            </div>
          </div>

          {loading ? (
            <div className="h-16 bg-slate-100 animate-pulse rounded-2xl mb-6"></div>
          ) : (
            <div className="mb-6 text-center">
              <p className="text-slate-500 text-sm font-bold mb-1">المبلغ المطلوب</p>
              <p className="text-4xl font-black text-slate-800 font-mono">
                {fee} <span className="text-lg text-slate-400">{currency}</span>
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-bold text-center">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-slate-700 font-bold text-sm mb-2">رقم البطاقة الذهبية / CIB (تجريبي)</label>
            <input
              type="text"
              required
              value={paymentCode}
              onChange={e => setPaymentCode(e.target.value)}
              placeholder="مثال: 12345678"
              className="w-full h-14 px-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-center text-xl font-mono font-bold text-slate-800 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 outline-none transition-all tracking-widest"
              dir="ltr"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting || loading}
              className="flex-1 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white font-black text-lg shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? "جاري الدفع..." : "تأكيد الدفع"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-6 h-14 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
