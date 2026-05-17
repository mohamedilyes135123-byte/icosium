"use client";

export const dynamic = 'force-dynamic';


import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  User, Phone, MapPin, Calendar, Heart, Shield,
  AlertTriangle, CheckCircle, Edit3, Save, X,
  Droplets, Pill, Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function PatientProfile() {
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});

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
          <h1 className="text-xl font-black text-slate-800">┘à┘ä┘ü┘è ╪º┘ä╪╡╪¡┘è</h1>
          <p className="text-xs text-slate-400">╪¿┘è╪º┘å╪º╪¬┘â ╪º┘ä╪┤╪«╪╡┘è╪⌐ ┘ê╪º┘ä╪╖╪¿┘è╪⌐</p>
        </div>
        {!editing ? (
          <button onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-emerald-200 text-emerald-700 bg-emerald-50 text-sm font-bold hover:bg-emerald-100 transition-colors">
            <Edit3 className="w-4 h-4" /> ╪¬╪╣╪»┘è┘ä
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={save} disabled={saving}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500 text-white text-sm font-bold disabled:opacity-50">
              <Save className="w-4 h-4" /> {saving ? "╪¡┘ü╪╕..." : "╪¡┘ü╪╕"}
            </button>
            <button onClick={() => { setEditing(false); setForm(profile); }}
              className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-600 text-sm font-bold">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </motion.div>

      {/* Avatar + name */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="flex items-center gap-5 mb-7 bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-sm">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-emerald-500/30 flex-shrink-0">
          {profile?.full_name?.[0] || "╪ƒ"}
        </div>
        <div className="flex-1 min-w-0">
          {editing ? (
            <input value={form.full_name || ""} onChange={e => setForm({ ...form, full_name: e.target.value })}
              className="w-full font-black text-slate-800 text-lg bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 mb-2 outline-none focus:ring-2 focus:ring-emerald-400" />
          ) : (
            <p className="font-black text-slate-800 text-xl mb-1 truncate">{profile?.full_name}</p>
          )}
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
            ┘à╪▒┘è╪╢ ΓÇö ┘à┘å╪╡╪⌐ ╪╣┘å╪º┘è╪⌐
          </span>
        </div>
      </motion.div>

      {/* Personal info */}
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-6 mb-5 shadow-sm">
        <h2 className="font-black text-slate-700 text-sm mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-500" /> ╪º┘ä╪¿┘è╪º┘å╪º╪¬ ╪º┘ä╪┤╪«╪╡┘è╪⌐
        </h2>
        <div className="space-y-4">
          <Field label="╪▒┘é┘à ╪º┘ä┘ç╪º╪¬┘ü" icon={<Phone className="w-4 h-4" />}
            value={form.phone} editing={editing}
            onChange={v => setForm({ ...form, phone: v })} />
          <Field label="╪º┘ä╪╣┘å┘ê╪º┘å ╪º┘ä╪│┘â┘å┘è" icon={<MapPin className="w-4 h-4" />}
            value={form.address} editing={editing}
            onChange={v => setForm({ ...form, address: v })} />
        </div>
      </motion.section>

      {/* Medical info */}
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-6 mb-5 shadow-sm">
        <h2 className="font-black text-slate-700 text-sm mb-4 flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-500" /> ╪º┘ä╪│╪¼┘ä ╪º┘ä╪╖╪¿┘è
        </h2>

        {/* Blood type */}
        <div className="mb-4">
          <label className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-rose-400" /> ┘ü╪╡┘è┘ä╪⌐ ╪º┘ä╪»┘à
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
              {medical.blood_type || <span className="text-slate-300 font-normal text-sm">╪║┘è╪▒ ┘à╪¡╪»╪»</span>}
            </p>
          )}
        </div>

        <MedicalTextarea
          label="╪º┘ä╪ú┘à╪▒╪º╪╢ ╪º┘ä┘à╪▓┘à┘å╪⌐" icon={<AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
          value={form.chronic_diseases ?? medical.chronic_diseases}
          editing={editing}
          placeholder="┘à╪½╪º┘ä: ╪º┘ä╪│┘â╪▒┘è ┘à┘å ╪º┘ä┘å┘ê╪╣ ╪º┘ä╪½╪º┘å┘è╪î ╪╢╪║╪╖ ╪º┘ä╪»┘à ╪º┘ä┘à╪▒╪¬┘ü╪╣..."
          onChange={v => setForm({ ...form, chronic_diseases: v })} />

        <MedicalTextarea
          label="╪º┘ä╪¡╪│╪º╪│┘è╪⌐" icon={<AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
          value={form.allergies ?? medical.allergies}
          editing={editing}
          placeholder="┘à╪½╪º┘ä: ╪¡╪│╪º╪│┘è╪⌐ ┘à┘å ╪º┘ä╪¿┘å╪│┘ä┘è┘å╪î ╪º┘ä╪║╪¿╪º╪▒..."
          onChange={v => setForm({ ...form, allergies: v })} />

        <MedicalTextarea
          label="╪º┘ä╪ú╪»┘ê┘è╪⌐ ╪º┘ä╪¡╪º┘ä┘è╪⌐" icon={<Pill className="w-3.5 h-3.5 text-purple-500" />}
          value={form.current_meds ?? medical.current_meds}
          editing={editing}
          placeholder="┘à╪½╪º┘ä: Metformin 500mg ┘à╪▒╪¬┘è┘å ┘è┘ê┘à┘è╪º┘ï..."
          onChange={v => setForm({ ...form, current_meds: v })} />
      </motion.section>

      {/* Emergency contact */}
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-6 mb-5 shadow-sm">
        <h2 className="font-black text-slate-700 text-sm mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-500" /> ╪¼┘ç╪⌐ ╪º┘ä╪º╪¬╪╡╪º┘ä ┘ä┘ä╪╖┘ê╪º╪▒╪ª
        </h2>
        <div className="space-y-4">
          <Field label="╪º┘ä╪º╪│┘à" icon={<User className="w-4 h-4" />}
            value={form.emergency_contact ?? medical.emergency_contact}
            editing={editing}
            onChange={v => setForm({ ...form, emergency_contact: v })} />
          <Field label="╪▒┘é┘à ╪º┘ä┘ç╪º╪¬┘ü" icon={<Phone className="w-4 h-4" />}
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
          ╪¿┘è╪º┘å╪º╪¬┘â ╪º┘ä╪╖╪¿┘è╪⌐ ┘à╪┤┘ü┘æ╪▒╪⌐ ┘ê┘ä╪º ┘è╪╖┘æ┘ä╪╣ ╪╣┘ä┘è┘ç╪º ╪Ñ┘ä╪º ╪╖╪¿┘è╪¿┘â ╪º┘ä┘à╪╣╪º┘ä╪¼ ┘ü┘é╪╖.
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
          {value || <span className="text-slate-300">ΓÇö</span>}
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
          {value || <span className="text-slate-300">ΓÇö</span>}
        </p>
      )}
    </div>
  );
}
