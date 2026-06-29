"use client";
export const dynamic = "force-dynamic";




import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  User, Phone, MapPin, Calendar, Heart, Shield,
  AlertTriangle, CheckCircle, Edit3, Save, X,
  Droplets, Pill, Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import QRCode from "react-qr-code";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function PatientProfile() {
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();
      setProfile(prof);
      setForm(prof || {});
      setLoading(false);
    });
  }, [supabase]);

  const save = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    await supabase.from("profiles").update({
      full_name:  form.full_name,
      phone:      form.phone,
      address:    form.address,
    }).eq("id", user.id);

    // Also update auth user_metadata medical history fields
    await supabase.auth.updateUser({
      data: {
        blood_type:       form.blood_type,
        allergies:        form.allergies,
        chronic_diseases: form.chronic_diseases,
        current_meds:     form.current_meds,
        emergency_contact: form.emergency_contact,
        emergency_phone:  form.emergency_phone,
      }
    });

    setProfile({ ...profile, ...form });
    setEditing(false);
    setSaving(false);
  };

  const meta = profile?.raw_user_meta_data || {};

  // Merge profile + user_metadata for medical fields
  const medical = {
    blood_type:        form.blood_type        || meta.blood_type,
    allergies:         form.allergies         || meta.allergies,
    chronic_diseases:  form.chronic_diseases  || meta.chronic_diseases,
    current_meds:      form.current_meds      || meta.current_meds,
    emergency_contact: form.emergency_contact || meta.emergency_contact,
    emergency_phone:   form.emergency_phone   || meta.emergency_phone,
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="w-full pb-32" dir="rtl">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-7">
        <div>
          <h1 className="text-xl font-black text-slate-800">ملفي الصحي</h1>
          <p className="text-xs text-slate-400">بياناتك الشخصية والطبية</p>
        </div>
        {!editing ? (
          <div className="flex gap-2">
            <button onClick={() => setShowQr(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-blue-200 text-blue-700 bg-blue-50 text-sm font-bold hover:bg-blue-100 transition-colors">
              <Activity className="w-4 h-4" /> QR الملف
            </button>
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-emerald-200 text-emerald-700 bg-emerald-50 text-sm font-bold hover:bg-emerald-100 transition-colors">
              <Edit3 className="w-4 h-4" /> تعديل
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button onClick={save} disabled={saving}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500 text-white text-sm font-bold disabled:opacity-50">
              <Save className="w-4 h-4" /> {saving ? "حفظ..." : "حفظ"}
            </button>
            <button onClick={() => { setEditing(false); setForm(profile); }}
              className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-600 text-sm font-bold">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </motion.div>

      {/* QR Modal */}
      <AnimatePresence>
        {showQr && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowQr(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-black text-slate-800 mb-2">QR ملفك الطبي</h3>
              <p className="text-sm text-slate-500 mb-6">يمكن لطبيبك مسح هذا الرمز للوصول لملفك الصحي</p>
              
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex justify-center mb-6">
                <QRCode value={`https://inaya-platform.com/doctor/scan?patient_id=${profile?.id}`} size={200} />
              </div>
              
              <button onClick={() => setShowQr(false)}
                className="w-full py-3.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors">
                إغلاق
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar + name */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="flex items-center gap-5 mb-7 bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-sm">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-emerald-500/30 flex-shrink-0">
          {profile?.full_name?.[0] || "؟"}
        </div>
        <div className="flex-1 min-w-0">
          {editing ? (
            <input value={form.full_name || ""} onChange={e => setForm({ ...form, full_name: e.target.value })}
              className="w-full font-black text-slate-800 text-lg bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 mb-2 outline-none focus:ring-2 focus:ring-emerald-400" />
          ) : (
            <p className="font-black text-slate-800 text-xl mb-1 truncate">{profile?.full_name}</p>
          )}
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
            مريض — منصة عناية
          </span>
        </div>
      </motion.div>

      {/* Personal info */}
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-6 mb-5 shadow-sm">
        <h2 className="font-black text-slate-700 text-sm mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-500" /> البيانات الشخصية
        </h2>
        <div className="space-y-4">
          <Field label="رقم الهاتف" icon={<Phone className="w-4 h-4" />}
            value={form.phone} editing={editing}
            onChange={v => setForm({ ...form, phone: v })} />
          <Field label="العنوان السكني" icon={<MapPin className="w-4 h-4" />}
            value={form.address} editing={editing}
            onChange={v => setForm({ ...form, address: v })} />
        </div>
      </motion.section>

      {/* Medical info */}
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-6 mb-5 shadow-sm">
        <h2 className="font-black text-slate-700 text-sm mb-4 flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-500" /> السجل الطبي
        </h2>

        {/* Blood type */}
        <div className="mb-4">
          <label className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-rose-400" /> فصيلة الدم
          </label>
          {editing ? (
            <div className="flex flex-wrap gap-2">
              {BLOOD_TYPES.map(bt => (
                <button key={bt} onClick={() => setForm({ ...form, blood_type: bt })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${
                    form.blood_type === bt ? "border-rose-500 bg-rose-50 text-rose-700" : "border-slate-200 text-slate-500"
                  }`}>{bt}</button>
              ))}
            </div>
          ) : (
            <p className="font-black text-slate-800 text-lg">
              {medical.blood_type || <span className="text-slate-300 font-normal text-sm">غير محدد</span>}
            </p>
          )}
        </div>

        <MedicalTextarea
          label="الأمراض المزمنة" icon={<AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
          value={form.chronic_diseases ?? medical.chronic_diseases}
          editing={editing}
          placeholder="مثال: السكري من النوع الثاني، ضغط الدم المرتفع..."
          onChange={v => setForm({ ...form, chronic_diseases: v })} />

        <MedicalTextarea
          label="الحساسية" icon={<AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
          value={form.allergies ?? medical.allergies}
          editing={editing}
          placeholder="مثال: حساسية من البنسلين، الغبار..."
          onChange={v => setForm({ ...form, allergies: v })} />

        <MedicalTextarea
          label="الأدوية الحالية" icon={<Pill className="w-3.5 h-3.5 text-purple-500" />}
          value={form.current_meds ?? medical.current_meds}
          editing={editing}
          placeholder="مثال: Metformin 500mg مرتين يومياً..."
          onChange={v => setForm({ ...form, current_meds: v })} />
      </motion.section>

      {/* Emergency contact */}
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-6 mb-5 shadow-sm">
        <h2 className="font-black text-slate-700 text-sm mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-500" /> جهة الاتصال للطوارئ
        </h2>
        <div className="space-y-4">
          <Field label="الاسم" icon={<User className="w-4 h-4" />}
            value={form.emergency_contact ?? medical.emergency_contact}
            editing={editing}
            onChange={v => setForm({ ...form, emergency_contact: v })} />
          <Field label="رقم الهاتف" icon={<Phone className="w-4 h-4" />}
            value={form.emergency_phone ?? medical.emergency_phone}
            editing={editing}
            onChange={v => setForm({ ...form, emergency_phone: v })} />
        </div>
      </motion.section>

      {/* Security badge */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
        <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0" />
        <p className="text-xs text-emerald-700 font-semibold">
          بياناتك الطبية مشفّرة ولا يطّلع عليها إلا طبيبك المعالج فقط.
        </p>
      </motion.div>
    </div>
  );
}

function Field({ label, icon, value, editing, onChange }: any) {
  return (
    <div>
      <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1.5">
        <span className="text-slate-400">{icon}</span> {label}
      </label>
      {editing ? (
        <input value={value || ""} onChange={e => onChange(e.target.value)}
          className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none text-sm text-slate-700" />
      ) : (
        <p className="text-slate-800 font-semibold text-sm py-1">
          {value || <span className="text-slate-300">—</span>}
        </p>
      )}
    </div>
  );
}

function MedicalTextarea({ label, icon, value, editing, placeholder, onChange }: any) {
  return (
    <div className="mb-4">
      <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1.5">
        {icon} {label}
      </label>
      {editing ? (
        <textarea value={value || ""} onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none text-sm text-slate-700 resize-none h-20" />
      ) : (
        <p className="text-slate-700 text-sm leading-relaxed py-1">
          {value || <span className="text-slate-300">—</span>}
        </p>
      )}
    </div>
  );
}

