"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Edit3, Save, X, Plus, Trash2, ToggleLeft, ToggleRight, DollarSign, Users, CheckCircle } from "lucide-react";

interface PaymentPlan {
  id: string;
  name: string;
  target_role: string;
  consultation_fee: number;
  prescription_fee: number;
  lab_fee: number;
  currency: string;
  is_active: boolean;
  notes: string | null;
  created_at: string;
}

const ROLE_LABELS: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  patient:  { label: "مريض",    color: "#166534", bg: "#dcfce7", icon: "🏥" },
  doctor:   { label: "طبيب",    color: "#1e40af", bg: "#dbeafe", icon: "⚕️" },
  lab:      { label: "مختبر",   color: "#7e22ce", bg: "#f3e8ff", icon: "🧪" },
  pharmacy: { label: "صيدلية",  color: "#92400e", bg: "#fef3c7", icon: "💊" },
};

const EMPTY_PLAN: Omit<PaymentPlan, "id" | "created_at"> = {
  name: "",
  target_role: "patient",
  consultation_fee: 500,
  prescription_fee: 300,
  lab_fee: 200,
  currency: "DZD",
  is_active: true,
  notes: "",
};

export default function PaymentPlansPage() {
  const [plans, setPlans]         = useState<PaymentPlan[]>([]);
  const [loading, setLoading]     = useState(true);
  const [editId, setEditId]       = useState<string | null>(null);
  const [editForm, setEditForm]   = useState<Partial<PaymentPlan>>({});
  const [showNew, setShowNew]     = useState(false);
  const [newForm, setNewForm]     = useState({ ...EMPTY_PLAN });
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState<{ msg: string; ok: boolean } | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchPlans = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("payment_plans")
      .select("*")
      .order("created_at", { ascending: true });
    setPlans(data || []);
    setLoading(false);
  }, []);

  const fetchTransactions = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("payment_transactions")
      .select("*, patient:profiles!payment_transactions_patient_id_fkey(full_name)")
      .order("created_at", { ascending: false })
      .limit(20);
    setTransactions(data || []);
  }, []);

  useEffect(() => { fetchPlans(); fetchTransactions(); }, [fetchPlans, fetchTransactions]);

  const startEdit = (plan: PaymentPlan) => {
    setEditId(plan.id);
    setEditForm({ ...plan });
    setShowNew(false);
  };

  const cancelEdit = () => { setEditId(null); setEditForm({}); };

  const saveEdit = async () => {
    if (!editId) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("payment_plans")
      .update({
        name:             editForm.name,
        target_role:      editForm.target_role,
        consultation_fee: editForm.consultation_fee,
        prescription_fee: editForm.prescription_fee,
        lab_fee:          editForm.lab_fee,
        currency:         editForm.currency,
        is_active:        editForm.is_active,
        notes:            editForm.notes,
      })
      .eq("id", editId);
    if (error) showToast("حدث خطأ أثناء الحفظ", false);
    else { showToast("تم حفظ التغييرات بنجاح ✅"); cancelEdit(); fetchPlans(); }
    setSaving(false);
  };

  const createPlan = async () => {
    if (!newForm.name || !newForm.target_role) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("payment_plans").insert([newForm]);
    if (error) showToast("حدث خطأ أثناء الإنشاء", false);
    else { showToast("تم إنشاء الخطة بنجاح ✅"); setShowNew(false); setNewForm({ ...EMPTY_PLAN }); fetchPlans(); }
    setSaving(false);
  };

  const toggleActive = async (plan: PaymentPlan) => {
    const supabase = createClient();
    await supabase.from("payment_plans").update({ is_active: !plan.is_active }).eq("id", plan.id);
    fetchPlans();
    showToast(plan.is_active ? "تم إيقاف الخطة" : "تم تفعيل الخطة");
  };

  const deletePlan = async (id: string) => {
    if (!confirm("هل تريد حذف هذه الخطة؟")) return;
    const supabase = createClient();
    await supabase.from("payment_plans").delete().eq("id", id);
    fetchPlans();
    showToast("تم الحذف");
  };

  const inp = "w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-violet-400";
  const feeInp = "w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-violet-400 text-left font-mono font-bold";

  return (
    <div dir="rtl" className="space-y-8">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl text-white font-bold text-sm shadow-2xl"
            style={{ background: toast.ok ? "linear-gradient(135deg,#22c55e,#16a34a)" : "linear-gradient(135deg,#ef4444,#dc2626)" }}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            خطط الدفع
          </h1>
          <p className="text-slate-500 text-sm mt-1 mr-16">إدارة رسوم الاستشارات والوصفات والتحاليل لكل فئة</p>
        </div>
        <button
          onClick={() => { setShowNew(true); setEditId(null); }}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white font-bold shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" /> خطة جديدة
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "إجمالي الخطط", value: plans.length, icon: "📋", color: "#7c3aed" },
          { label: "خطط نشطة",    value: plans.filter(p => p.is_active).length, icon: "✅", color: "#16a34a" },
          { label: "معاملات اليوم", value: transactions.filter(t => new Date(t.created_at).toDateString() === new Date().toDateString()).length, icon: "💳", color: "#d97706" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
            <span className="text-3xl">{s.icon}</span>
            <div>
              <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-slate-500 font-semibold">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* New Plan Form */}
      <AnimatePresence>
        {showNew && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            className="bg-white rounded-3xl border-2 border-amber-200 shadow-xl p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-slate-800 text-lg flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-500" /> إنشاء خطة دفع جديدة
              </h2>
              <button onClick={() => setShowNew(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <PlanForm form={newForm} onChange={v => setNewForm(p => ({ ...p, ...v }))} inp={inp} feeInp={feeInp} />
            <div className="flex gap-3 mt-5">
              <button onClick={createPlan} disabled={saving || !newForm.name}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed">
                <Save className="w-4 h-4" /> {saving ? "جاري الحفظ..." : "إنشاء الخطة"}
              </button>
              <button onClick={() => setShowNew(false)} className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50">إلغاء</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plans Grid */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[1,2,3,4].map(i => <div key={i} className="h-52 rounded-3xl bg-slate-100 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {plans.map(plan => {
            const role = ROLE_LABELS[plan.target_role] || { label: plan.target_role, color: "#374151", bg: "#f1f5f9", icon: "💼" };
            const isEditing = editId === plan.id;

            return (
              <motion.div key={plan.id} layout
                className={`bg-white rounded-3xl border-2 shadow-sm p-6 transition-all ${isEditing ? "border-violet-300 shadow-violet-100" : plan.is_active ? "border-slate-100" : "border-slate-100 opacity-60"}`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{role.icon}</span>
                    <div>
                      {isEditing
                        ? <input value={editForm.name || ""} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} className={inp + " text-base font-black"} />
                        : <h3 className="font-black text-slate-800 text-lg">{plan.name}</h3>
                      }
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block" style={{ color: role.color, background: role.bg }}>
                        {role.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleActive(plan)} className="p-2 rounded-xl hover:bg-slate-50 transition-colors">
                      {plan.is_active
                        ? <ToggleRight className="w-6 h-6 text-emerald-500" />
                        : <ToggleLeft className="w-6 h-6 text-slate-300" />}
                    </button>
                    {!isEditing && (
                      <button onClick={() => startEdit(plan)} className="p-2 rounded-xl hover:bg-violet-50 text-violet-500 transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => deletePlan(plan.id)} className="p-2 rounded-xl hover:bg-rose-50 text-rose-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Fees */}
                {isEditing ? (
                  <PlanForm form={editForm as any} onChange={v => setEditForm(p => ({ ...p, ...v }))} inp={inp} feeInp={feeInp} />
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "الاستشارة",  value: plan.consultation_fee, icon: "⚕️" },
                      { label: "الوصفة",     value: plan.prescription_fee, icon: "📋" },
                      { label: "التحليل",    value: plan.lab_fee,          icon: "🧪" },
                    ].map(f => (
                      <div key={f.label} className="bg-slate-50 rounded-2xl p-3 text-center border border-slate-100">
                        <p className="text-lg">{f.icon}</p>
                        <p className="font-black text-slate-800 text-base">{f.value.toLocaleString()}</p>
                        <p className="text-xs text-slate-500 font-semibold">{plan.currency}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{f.label}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Notes */}
                {isEditing && (
                  <div className="mt-3">
                    <label className="text-xs font-bold text-slate-500 block mb-1">ملاحظات</label>
                    <textarea
                      value={editForm.notes || ""}
                      onChange={e => setEditForm(p => ({ ...p, notes: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-violet-400 resize-none"
                    />
                  </div>
                )}

                {!isEditing && plan.notes && (
                  <p className="text-xs text-slate-400 mt-3 bg-slate-50 rounded-xl px-3 py-2">{plan.notes}</p>
                )}

                {/* Save/Cancel buttons for editing */}
                {isEditing && (
                  <div className="flex gap-2 mt-4">
                    <button onClick={saveEdit} disabled={saving}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 text-white font-bold text-sm disabled:opacity-50">
                      <Save className="w-3.5 h-3.5" /> {saving ? "حفظ..." : "حفظ التغييرات"}
                    </button>
                    <button onClick={cancelEdit} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50">
                      إلغاء
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}

          {plans.length === 0 && !loading && (
            <div className="col-span-2 text-center py-16 text-slate-400">
              <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-bold">لا توجد خطط دفع — أنشئ أولى</p>
            </div>
          )}
        </div>
      )}

      {/* Recent Transactions */}
      <div>
        <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
          <span className="text-xl">💳</span> آخر المعاملات (وضع تجريبي)
        </h2>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {transactions.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <p className="font-bold text-sm">لا توجد معاملات بعد</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 text-right font-bold text-slate-500">المريض</th>
                  <th className="px-4 py-3 text-right font-bold text-slate-500">المبلغ</th>
                  <th className="px-4 py-3 text-right font-bold text-slate-500">رمز الدفع</th>
                  <th className="px-4 py-3 text-right font-bold text-slate-500">الحالة</th>
                  <th className="px-4 py-3 text-right font-bold text-slate-500">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, i) => {
                  const patient = Array.isArray(tx.patient) ? tx.patient[0] : tx.patient;
                  return (
                    <tr key={tx.id} className={`border-b border-slate-50 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
                      <td className="px-4 py-3 font-semibold text-slate-700">{patient?.full_name || "—"}</td>
                      <td className="px-4 py-3 font-black text-slate-800 font-mono">{tx.amount?.toLocaleString()} {tx.currency}</td>
                      <td className="px-4 py-3 font-mono text-slate-500 text-xs">{tx.payment_code || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${tx.status === "approved" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                          {tx.status === "approved" ? "✅ مقبول" : "❌ مرفوض"}
                          {tx.is_trial && " (تجريبي)"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {new Date(tx.created_at).toLocaleDateString("ar-DZ")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Trial Mode Banner */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-3xl p-5 flex items-center gap-4">
        <span className="text-3xl">🧪</span>
        <div>
          <p className="font-black text-amber-800">وضع الدفع التجريبي مُفعَّل</p>
          <p className="text-sm text-amber-700 mt-0.5">
            المرضى يمكنهم إدخال أي رمز مكوّن من 8 أرقام ويُقبل فوراً دون اختصام أي مبلغ حقيقي.
            سيتم ربط بوابة الدفع الحقيقية (CIB / Baridimob) في المرحلة القادمة.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Shared plan form fields ──────────────────────────────────────
function PlanForm({
  form,
  onChange,
  inp,
  feeInp,
}: {
  form: Partial<PaymentPlan>;
  onChange: (v: Partial<PaymentPlan>) => void;
  inp: string;
  feeInp: string;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">اسم الخطة *</label>
          <input value={form.name || ""} onChange={e => onChange({ name: e.target.value })} placeholder="مثال: الخطة الأساسية" className={inp} />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">الفئة المستهدفة</label>
          <select value={form.target_role || "patient"} onChange={e => onChange({ target_role: e.target.value })} className={inp}>
            <option value="patient">مريض</option>
            <option value="doctor">طبيب</option>
            <option value="lab">مختبر</option>
            <option value="pharmacy">صيدلية</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">⚕️ الاستشارة (DZD)</label>
          <input type="number" value={form.consultation_fee ?? 0} onChange={e => onChange({ consultation_fee: parseFloat(e.target.value) })} className={feeInp} min={0} />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">📋 الوصفة (DZD)</label>
          <input type="number" value={form.prescription_fee ?? 0} onChange={e => onChange({ prescription_fee: parseFloat(e.target.value) })} className={feeInp} min={0} />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">🧪 التحليل (DZD)</label>
          <input type="number" value={form.lab_fee ?? 0} onChange={e => onChange({ lab_fee: parseFloat(e.target.value) })} className={feeInp} min={0} />
        </div>
      </div>
    </div>
  );
}
