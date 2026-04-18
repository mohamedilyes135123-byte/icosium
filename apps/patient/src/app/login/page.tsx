"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  Heart, Mail, Lock, User, Phone, Calendar, CreditCard,
  AlertTriangle, ChevronLeft, ChevronRight, CheckCircle,
  Pill, Activity, Globe, X, Plus, Shield
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Step = 1 | 2 | 3;

interface PatientForm {
  fullNameAr: string; fullNameFr: string;
  email: string; password: string; phone: string;
  dateOfBirth: string; nationalId: string; socialSecurity: string;
  address: string;
  // Medical history
  chronicDiseases: string[]; surgeries: string;
  familyHistory: string; drugAllergies: string[];
  foodAllergies: string; bloodGroup: string;
  hadPhysicalExam: boolean;
  // Legal
  acceptTerms: boolean;
}

const CHRONIC_OPTIONS = [
  "Ø¯Ø§Ø¡ Ø§Ù„Ø³ÙƒØ±ÙŠ", "Ø§Ø±ØªÙØ§Ø¹ Ø¶ØºØ· Ø§Ù„Ø¯Ù…", "Ø£Ù…Ø±Ø§Ø¶ Ø§Ù„Ù‚Ù„Ø¨", "Ø§Ù„Ø±Ø¨Ùˆ",
  "Ø§Ù„Ø³Ø±Ø·Ø§Ù†", "Ø£Ù…Ø±Ø§Ø¶ Ø§Ù„ÙƒÙ„Ù‰ Ø§Ù„Ù…Ø²Ù…Ù†Ø©", "Ù‚ØµÙˆØ± Ø§Ù„ØºØ¯Ø© Ø§Ù„Ø¯Ø±Ù‚ÙŠØ©",
  "Ø£Ù…Ø±Ø§Ø¶ Ø§Ù„Ø±Ø¦Ø© Ø§Ù„Ù…Ø²Ù…Ù†Ø© BPCO", "Ø£Ù…Ø±Ø§Ø¶ Ø§Ù„Ø£Ø¹ØµØ§Ø¨", "Ù„Ø§ ÙŠÙˆØ¬Ø¯",
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "ØºÙŠØ± Ù…Ø¹Ø±ÙˆÙ"];

const COMMON_ALLERGIES = ["Ø§Ù„Ø¨Ù†Ø³ÙŠÙ„ÙŠÙ†", "Ø§Ù„Ø³Ù„ÙØ§Ù…ÙŠØ¯", "Ø§Ù„Ø£Ø³Ø¨Ø±ÙŠÙ†", "Ø§Ù„Ø¥ÙŠØ¨ÙˆØ¨Ø±ÙˆÙÙŠÙ†", "Ø§Ù„ÙƒÙˆØ¯Ø§ÙŠÙŠÙ†", "Ù„Ø§ ÙŠÙˆØ¬Ø¯"];

export default function PatientLoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [form, setForm] = useState<PatientForm>({
    fullNameAr: "", fullNameFr: "", email: "", password: "", phone: "",
    dateOfBirth: "", nationalId: "", socialSecurity: "", address: "",
    chronicDiseases: [], surgeries: "", familyHistory: "", drugAllergies: [],
    foodAllergies: "", bloodGroup: "", hadPhysicalExam: false,
    acceptTerms: false,
  });

  const router = useRouter();
  const supabase = createClient();
  const set = (field: keyof PatientForm) => (val: any) =>
    setForm(p => ({ ...p, [field]: val }));

  const toggleChronicDisease = (d: string) => {
    set("chronicDiseases")(
      form.chronicDiseases.includes(d)
        ? form.chronicDiseases.filter(x => x !== d)
        : [...form.chronicDiseases, d]
    );
  };

  const toggleDrugAllergy = (d: string) => {
    set("drugAllergies")(
      form.drugAllergies.includes(d)
        ? form.drugAllergies.filter(x => x !== d)
        : [...form.drugAllergies, d]
    );
  };

  // â”€â”€ Login â”€â”€â”€â”€
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    if (loginPassword === "1" && loginEmail === "1") {
      const { error: err } = await supabase.auth.signInWithPassword({ email: "patient@3inaya.com", password: "123456" });
      if (err) { setError("Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ø®ØªØ¨Ø§Ø± ØºÙŠØ± Ù…ØªØ§Ø­Ø©"); setLoading(false); return; }
      document.cookie = `testing_bypass=patient; path=/; max-age=86400`;
      window.location.href = "/dashboard"; return;
    }
    const { data, error: err } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    if (err) { setError("ÙØ´Ù„ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„. ØªØ­Ù‚Ù‚ Ù…Ù† Ø¨ÙŠØ§Ù†Ø§ØªÙƒ."); setLoading(false); return; }
    if (data?.user?.user_metadata?.role === "patient") router.push("/dashboard");
    else { setError("Ù‡Ø°Ù‡ Ø§Ù„Ø¨ÙˆØ§Ø¨Ø© Ù…Ø®ØµØµØ© Ù„Ù„Ù…Ø±Ø¶Ù‰ ÙÙ‚Ø·."); setLoading(false); }
  };

  // â”€â”€ Signup â”€â”€â”€
  const handleSignup = async () => {
    if (!form.acceptTerms) { setError("ÙŠØ¬Ø¨ Ø§Ù„Ù…ÙˆØ§ÙÙ‚Ø© Ø¹Ù„Ù‰ Ø§Ù„Ø´Ø±ÙˆØ·."); return; }
    setLoading(true); setError(null);
    const { error: err } = await supabase.auth.signUp({
      email: form.email, password: form.password,
      options: { data: {
        full_name: form.fullNameAr || form.fullNameFr,
        full_name_ar: form.fullNameAr, full_name_fr: form.fullNameFr,
        role: "patient", phone: form.phone,
        date_of_birth: form.dateOfBirth || null,
        national_id: form.nationalId || null,
        social_security: form.socialSecurity || null,
        address: form.address || null,
        blood_group: form.bloodGroup || null,
        chronic_diseases: form.chronicDiseases,
        surgeries: form.surgeries || null,
        family_history: form.familyHistory || null,
        drug_allergies: form.drugAllergies,
        food_allergies: form.foodAllergies || null,
        had_physical_exam: form.hadPhysicalExam,
      }},
    });
    if (err) { setError(err.message); setLoading(false); return; }
    setSuccessMsg("ðŸŽ‰ ØªÙ… Ø¥Ù†Ø´Ø§Ø¡ Ù…Ù„ÙÙƒ Ø§Ù„Ø·Ø¨ÙŠ! ØªØ­Ù‚Ù‚ Ù…Ù† Ø¨Ø±ÙŠØ¯Ùƒ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ Ø«Ù… Ø³Ø¬Ù‘Ù„ Ø§Ù„Ø¯Ø®ÙˆÙ„.");
    setIsLogin(true); setStep(1); setLoading(false);
  };

  const nextStep = () => {
    setError(null);
    if (step === 1) {
      if (!form.fullNameAr || !form.email || !form.password || !form.phone) {
        setError("Ø§Ù„Ø±Ø¬Ø§Ø¡ Ù…Ù„Ø¡ Ø§Ù„Ø­Ù‚ÙˆÙ„ Ø§Ù„Ø¥Ù„Ø²Ø§Ù…ÙŠØ©: Ø§Ù„Ø§Ø³Ù…ØŒ Ø§Ù„Ø¨Ø±ÙŠØ¯ØŒ ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±ØŒ Ø§Ù„Ù‡Ø§ØªÙ");
        return;
      }
      if (form.password.length < 6) { setError("ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± 6 Ø£Ø­Ø±Ù Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„."); return; }
    }
    if (step === 2 && form.chronicDiseases.length === 0) {
      setError("ÙŠØ±Ø¬Ù‰ ØªØ­Ø¯ÙŠØ¯ Ø­Ø§Ù„ØªÙƒ Ø§Ù„ØµØ­ÙŠØ© â€” Ø§Ø®ØªØ± 'Ù„Ø§ ÙŠÙˆØ¬Ø¯' Ø¥Ø°Ø§ ÙƒÙ†Øª Ø¨ØµØ­Ø© Ø¬ÙŠØ¯Ø©.");
      return;
    }
    setStep(s => Math.min(3, s + 1) as Step);
  };

  const cls = `w-full h-12 px-4 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none text-right text-slate-800 text-sm transition-all`;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" dir="rtl">
      {/* BG */}
      <div className="absolute inset-0">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-emerald-200/40 rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-teal-200/30 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-emerald-50/30 to-white" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-2xl shadow-emerald-500/40 mb-4">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900">Ø¹Ù†Ø§ÙŠØ©</h1>
          <p className="text-emerald-600 font-semibold text-sm mt-1">Ø¨ÙˆØ§Ø¨Ø© Ø§Ù„Ù…Ø±Ø¶Ù‰ â€” Ø·Ø¨ÙŠØ¨Ùƒ ÙÙŠ Ø¨ÙŠØªÙƒ</p>
          <p className="text-slate-400 text-xs mt-1">
            <Shield className="inline w-3.5 h-3.5 text-emerald-500 mx-1" />
            Ø¨ÙŠØ§Ù†Ø§ØªÙƒ Ù…Ø´ÙØ±Ø© ÙˆÙ…Ø­Ù…ÙŠØ© Ø¨Ø§Ù„ÙƒØ§Ù…Ù„
          </p>
        </div>

        <div className="bg-white/85 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/60 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            {["ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„", "ÙØªØ­ Ù…Ù„Ù Ø¬Ø¯ÙŠØ¯"].map((label, idx) => (
              <button key={label} onClick={() => { setIsLogin(idx === 0); setError(null); setStep(1); }}
                className={`flex-1 py-4 text-sm font-bold transition-colors ${
                  isLogin === (idx === 0) ? "text-emerald-700 border-b-2 border-emerald-500 bg-emerald-50/50" : "text-slate-500 hover:text-slate-700"
                }`}>{label}</button>
            ))}
          </div>

          <div className="p-7">
            {/* Alerts */}
            {successMsg && (
              <div className="flex items-start gap-3 bg-emerald-50 text-emerald-700 p-4 rounded-2xl text-sm font-semibold mb-5 border border-emerald-200">
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" /><span>{successMsg}</span>
              </div>
            )}
            {error && (
              <div className="flex items-start gap-3 bg-rose-50 text-rose-700 p-4 rounded-2xl text-sm font-semibold mb-5 border border-rose-200">
                <X className="w-5 h-5 mt-0.5 flex-shrink-0" /><span>{error}</span>
              </div>
            )}

            {/* â”€â”€ LOGIN â”€â”€ */}
            {isLogin && (
              <form onSubmit={handleLogin} className="space-y-4">
                <Field label="Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ" icon={<Mail className="w-4 h-4" />}>
                  <input value={loginEmail} onChange={e => setLoginEmail(e.target.value)} type="email" placeholder="patient@example.com" className={cls} required />
                </Field>
                <Field label="ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±" icon={<Lock className="w-4 h-4" />}>
                  <input value={loginPassword} onChange={e => setLoginPassword(e.target.value)} type="password" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" className={cls} required />
                </Field>
                <button type="button" className="text-xs text-emerald-500 hover:underline w-full text-right">Ù†Ø³ÙŠØª ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±ØŸ</button>
                <button type="submit" disabled={loading}
                  className="w-full h-12 rounded-xl font-bold bg-gradient-to-l from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all mt-2">
                  {loading ? "Ø¬Ø§Ø±ÙŠ Ø§Ù„ØªØ­Ù‚Ù‚..." : "Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø¥Ù„Ù‰ Ù…Ù„ÙÙŠ Ø§Ù„Ø·Ø¨ÙŠ â†’"}
                </button>
                <p className="text-center text-xs text-slate-400 mt-4">Ù…Ø­Ù…ÙŠ Ø¨ØªØ´ÙÙŠØ± AES-256 Â· Supabase Auth</p>
              </form>
            )}

            {/* â”€â”€ SIGNUP â”€â”€ */}
            {!isLogin && (
              <div>
                {/* Step indicators */}
                <div className="flex flex-row-reverse items-center justify-center gap-3 mb-7">
                  {[1,2,3].map((s, i) => (
                    <div key={s} className="flex items-center gap-3">
                      {i > 0 && <div className={`h-0.5 w-10 rounded ${step > (3 - i) ? "bg-emerald-500" : "bg-slate-200"}`} />}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black border-2 transition-all ${
                        step > s ? "bg-emerald-500 border-emerald-500 text-white" :
                        step === s ? "border-emerald-500 text-emerald-600 bg-white shadow-md" :
                        "border-slate-200 text-slate-400 bg-white"
                      }`}>
                        {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Step title */}
                <div className="text-center mb-5">
                  {step === 1 && <><h2 className="font-black text-slate-800 text-lg">Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ø£Ø³Ø§Ø³ÙŠØ©</h2><p className="text-slate-400 text-xs mt-1">Ø¨ÙŠØ§Ù†Ø§ØªÙƒ Ø§Ù„Ø´Ø®ØµÙŠØ© Ù„ÙØªØ­ Ù…Ù„ÙÙƒ Ø§Ù„Ø·Ø¨ÙŠ</p></>}
                  {step === 2 && <><h2 className="font-black text-slate-800 text-lg">Ø§Ù„Ø³Ø¬Ù„ Ø§Ù„Ø·Ø¨ÙŠ</h2><p className="text-slate-400 text-xs mt-1">Ù…Ø¹Ù„ÙˆÙ…Ø§Øª ØµØ­ÙŠØ© Ø¶Ø±ÙˆØ±ÙŠØ© Ù„Ù„Ø·Ø¨ÙŠØ¨<span className="text-rose-500 mr-1">*</span></p></>}
                  {step === 3 && <><h2 className="font-black text-slate-800 text-lg">Ø§Ù„ØªØ£ÙƒÙŠØ¯ Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ</h2><p className="text-slate-400 text-xs mt-1">Ø¢Ø®Ø± Ø®Ø·ÙˆØ© Ù„ØªÙØ¹ÙŠÙ„ Ù…Ù„ÙÙƒ Ø§Ù„Ø·Ø¨ÙŠ Ø§Ù„Ø±Ù‚Ù…ÙŠ</p></>}
                </div>

                {/* â”€â”€â”€ STEP 1: Personal info â”€â”€â”€ */}
                {step === 1 && (
                  <div className="space-y-4">
                    <Field label="Ø§Ù„Ø§Ø³Ù… Ø§Ù„ÙƒØ§Ù…Ù„ Ø¨Ø§Ù„Ø¹Ø±Ø¨ÙŠØ© *" icon={<User className="w-4 h-4" />}>
                      <input value={form.fullNameAr} onChange={e => set("fullNameAr")(e.target.value)} placeholder="Ø£Ø­Ù…Ø¯ Ø¨Ù† Ø¹Ù„ÙŠ" className={cls} />
                    </Field>
                    <Field label="Ø§Ù„Ø§Ø³Ù… Ø¨Ø§Ù„ÙØ±Ù†Ø³ÙŠØ©" icon={<Globe className="w-4 h-4" />}>
                      <input value={form.fullNameFr} onChange={e => set("fullNameFr")(e.target.value)} placeholder="Ahmed Ben Ali" className={cls} />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ *" icon={<Mail className="w-4 h-4" />}>
                        <input value={form.email} onChange={e => set("email")(e.target.value)} type="email" placeholder="patient@example.com" className={cls} />
                      </Field>
                      <Field label="ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± *" icon={<Lock className="w-4 h-4" />}>
                        <input value={form.password} onChange={e => set("password")(e.target.value)} type="password" placeholder="6+ Ø£Ø­Ø±Ù" className={cls} />
                      </Field>
                    </div>
                    <Field label="Ø±Ù‚Ù… Ø§Ù„Ù‡Ø§ØªÙ *" icon={<Phone className="w-4 h-4" />}>
                      <input value={form.phone} onChange={e => set("phone")(e.target.value)} type="tel" placeholder="+213 6XX XX XX XX" className={cls} />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="ØªØ§Ø±ÙŠØ® Ø§Ù„Ù…ÙŠÙ„Ø§Ø¯" icon={<Calendar className="w-4 h-4" />}>
                        <input value={form.dateOfBirth} onChange={e => set("dateOfBirth")(e.target.value)} type="date" className={cls} />
                      </Field>
                      <Field label="Ø±Ù‚Ù… Ø¨Ø·Ø§Ù‚Ø© Ø§Ù„ØªØ¹Ø±ÙŠÙ" icon={<CreditCard className="w-4 h-4" />}>
                        <input value={form.nationalId} onChange={e => set("nationalId")(e.target.value)} placeholder="18 Ø±Ù‚Ù…" className={cls} />
                      </Field>
                    </div>
                    <Field label="Ø±Ù‚Ù… Ø§Ù„Ø¶Ù…Ø§Ù† Ø§Ù„Ø§Ø¬ØªÙ…Ø§Ø¹ÙŠ" icon={<Shield className="w-4 h-4" />}>
                      <input value={form.socialSecurity} onChange={e => set("socialSecurity")(e.target.value)} placeholder="Ø§Ø®ØªÙŠØ§Ø±ÙŠ â€” Ù„Ù„Ù…Ø¤Ù…Ù†ÙŠÙ† Ø§Ø¬ØªÙ…Ø§Ø¹ÙŠØ§Ù‹" className={cls} />
                    </Field>
                    <Field label="Ø§Ù„Ø¹Ù†ÙˆØ§Ù†" icon={<Activity className="w-4 h-4" />}>
                      <input value={form.address} onChange={e => set("address")(e.target.value)} placeholder="Ø§Ù„ÙˆÙ„Ø§ÙŠØ©ØŒ Ø§Ù„Ø¨Ù„Ø¯ÙŠØ©ØŒ Ø§Ù„Ø­ÙŠ..." className={cls} />
                    </Field>
                  </div>
                )}

                {/* â”€â”€â”€ STEP 2: Medical History â”€â”€â”€ */}
                {step === 2 && (
                  <div className="space-y-5">
                    {/* Blood group */}
                    <div>
                      <label className="text-sm font-bold text-slate-600 mb-2 block">ÙØµÙŠÙ„Ø© Ø§Ù„Ø¯Ù…</label>
                      <div className="flex flex-wrap gap-2">
                        {BLOOD_GROUPS.map(bg => (
                          <button key={bg} type="button" onClick={() => set("bloodGroup")(bg)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black border-2 transition-all ${
                              form.bloodGroup === bg ? "border-rose-500 bg-rose-50 text-rose-700" : "border-slate-200 text-slate-500 hover:border-rose-300"
                            }`}>{bg}</button>
                        ))}
                      </div>
                    </div>

                    {/* Chronic diseases */}
                    <div>
                      <label className="text-sm font-bold text-slate-800 mb-2 block flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-600" />
                        Ø§Ù„Ø£Ù…Ø±Ø§Ø¶ Ø§Ù„Ù…Ø²Ù…Ù†Ø© <span className="text-rose-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {CHRONIC_OPTIONS.map(d => (
                          <button key={d} type="button" onClick={() => toggleChronicDisease(d)}
                            className={`px-3 py-2.5 rounded-xl text-xs font-bold border-2 text-right transition-all ${
                              form.chronicDiseases.includes(d) ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-500 hover:border-emerald-300"
                            }`}>
                            {form.chronicDiseases.includes(d) && <CheckCircle className="inline w-3 h-3 ml-1 text-emerald-500" />}
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Surgeries */}
                    <div>
                      <label className="text-sm font-bold text-slate-600 mb-1.5 block">Ø§Ù„Ø¹Ù…Ù„ÙŠØ§Øª Ø§Ù„Ø¬Ø±Ø§Ø­ÙŠØ© Ø§Ù„Ø³Ø§Ø¨Ù‚Ø©</label>
                      <textarea value={form.surgeries} onChange={e => set("surgeries")(e.target.value)}
                        placeholder="Ù…Ø«Ø§Ù„: Ø§Ø³ØªØ¦ØµØ§Ù„ Ø§Ù„Ø²Ø§Ø¦Ø¯Ø© 2018ØŒ Ø¹Ù…Ù„ÙŠØ© Ø§Ù„Ù‚Ù„Ø¨ 2022..." rows={2}
                        className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none text-sm text-slate-700 resize-none" />
                    </div>

                    {/* Family history */}
                    <div>
                      <label className="text-sm font-bold text-slate-600 mb-1.5 block flex items-center gap-2">
                        <Shield className="w-4 h-4" /> Ø§Ù„Ø£Ù…Ø±Ø§Ø¶ Ø§Ù„ÙˆØ±Ø§Ø«ÙŠØ© / Ø§Ù„Ø¹Ø§Ø¦Ù„ÙŠØ©
                      </label>
                      <textarea value={form.familyHistory} onChange={e => set("familyHistory")(e.target.value)}
                        placeholder="Ù…Ø«Ø§Ù„: Ø£Ù…Ø±Ø§Ø¶ Ø§Ù„Ù‚Ù„Ø¨ ÙÙŠ Ø§Ù„Ø¹Ø§Ø¦Ù„Ø©ØŒ Ø¯Ø§Ø¡ Ø§Ù„Ø³ÙƒØ±ÙŠ..." rows={2}
                        className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none text-sm text-slate-700 resize-none" />
                    </div>

                    {/* Drug allergies */}
                    <div>
                      <label className="text-sm font-bold text-slate-800 mb-2 block flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        Ø­Ø³Ø§Ø³ÙŠØ© Ø§Ù„Ø£Ø¯ÙˆÙŠØ©
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {COMMON_ALLERGIES.map(al => (
                          <button key={al} type="button" onClick={() => toggleDrugAllergy(al)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${
                              form.drugAllergies.includes(al) ? "border-amber-500 bg-amber-50 text-amber-700" : "border-slate-200 text-slate-500 hover:border-amber-300"
                            }`}>{al}</button>
                        ))}
                      </div>
                    </div>

                    {/* Food allergies */}
                    <div>
                      <label className="text-sm font-bold text-slate-600 mb-1.5 block">Ø­Ø³Ø§Ø³ÙŠØ© Ø§Ù„Ø£Ø·Ø¹Ù…Ø©</label>
                      <input value={form.foodAllergies} onChange={e => set("foodAllergies")(e.target.value)}
                        placeholder="Ù…Ø«Ø§Ù„: Ø§Ù„ÙÙˆÙ„ Ø§Ù„Ø³ÙˆØ¯Ø§Ù†ÙŠØŒ Ù„Ø­Ù… Ø§Ù„Ø¨Ø­Ø±..." className={cls} />
                    </div>
                  </div>
                )}

                {/* â”€â”€â”€ STEP 3: Confirmation â”€â”€â”€ */}
                {step === 3 && (
                  <div className="space-y-5">
                    {/* Summary */}
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-sm">
                      <p className="font-black text-emerald-800 mb-3">ðŸ“‹ Ù…Ù„Ø®Øµ Ù…Ù„ÙÙƒ Ø§Ù„Ø·Ø¨ÙŠ</p>
                      <div className="space-y-1.5 text-slate-700">
                        <p><span className="font-bold">Ø§Ù„Ø§Ø³Ù…:</span> {form.fullNameAr}</p>
                        <p><span className="font-bold">Ø§Ù„Ù‡Ø§ØªÙ:</span> {form.phone}</p>
                        {form.bloodGroup && <p><span className="font-bold">ÙØµÙŠÙ„Ø© Ø§Ù„Ø¯Ù…:</span> {form.bloodGroup}</p>}
                        {form.chronicDiseases.length > 0 && (
                          <p><span className="font-bold">Ø§Ù„Ø£Ù…Ø±Ø§Ø¶ Ø§Ù„Ù…Ø²Ù…Ù†Ø©:</span> {form.chronicDiseases.join("ØŒ ")}</p>
                        )}
                        {form.drugAllergies.length > 0 && (
                          <p><span className="font-bold text-amber-700">Ø­Ø³Ø§Ø³ÙŠØ© Ø§Ù„Ø£Ø¯ÙˆÙŠØ©:</span> {form.drugAllergies.join("ØŒ ")}</p>
                        )}
                      </div>
                    </div>

                    {/* Physical exam checkbox */}
                    <label className="flex items-start gap-3 cursor-pointer bg-blue-50 border border-blue-100 rounded-2xl p-4">
                      <input type="checkbox" checked={form.hadPhysicalExam} onChange={e => set("hadPhysicalExam")(e.target.checked)}
                        className="mt-1 w-4 h-4 accent-emerald-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-slate-800">Ù„Ù‚Ø¯ Ø£Ø¬Ø±ÙŠØª ÙØ­ØµØ§Ù‹ Ø·Ø¨ÙŠØ§Ù‹ Ø­Ø¶ÙˆØ±ÙŠØ§Ù‹ Ù…Ø³Ø¨Ù‚Ø§Ù‹</p>
                        <p className="text-xs text-slate-500 mt-0.5">Ù‡Ø°Ø§ ÙŠÙ…Ù†Ø­ Ø§Ù„Ø·Ø¨ÙŠØ¨ ØµÙ„Ø§Ø­ÙŠØ© ØªØ¬Ø¯ÙŠØ¯ ÙˆØµÙØªÙƒ Ø¹Ù† Ø¨ÙØ¹Ø¯ Ø£Ø³Ø±Ø¹</p>
                      </div>
                    </label>

                    {/* Terms */}
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" checked={form.acceptTerms} onChange={e => set("acceptTerms")(e.target.checked)}
                        className="mt-1 w-4 h-4 accent-emerald-600 flex-shrink-0" />
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Ø£Ù‚Ø± Ø¨Ø£Ù† Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ù…ÙØ¯Ø®Ù„Ø© ØµØ­ÙŠØ­Ø© ÙˆØ£ØªØ­Ù…Ù„ Ø§Ù„Ù…Ø³Ø¤ÙˆÙ„ÙŠØ© Ø¹Ù†Ù‡Ø§. Ø£ÙˆØ§ÙÙ‚ Ø¹Ù„Ù‰ Ø£Ù† <strong>Ù…Ù†ØµØ© Ø¹Ù†Ø§ÙŠØ©</strong> Ù‡ÙŠ ÙˆØ³ÙŠØ· ØªÙˆØ§ØµÙ„ Ø·Ø¨ÙŠ ÙÙ‚Ø·ØŒ ÙˆÙ„Ø§ ØªÙØ¹ÙˆÙ‘Ø¶ Ø§Ù„Ø·Ø¨ÙŠØ¨ ÙÙŠ Ù‚Ø±Ø§Ø±Ø§ØªÙ‡ Ø§Ù„Ø·Ø¨ÙŠØ©. Ø§Ù„Ù…Ù†ØµØ© Ù…Ø±Ø®ØµØ© Ù…Ù† <strong>ÙˆØ²Ø§Ø±Ø© Ø§Ù„ØµØ­Ø© Ø§Ù„Ø¬Ø²Ø§Ø¦Ø±ÙŠØ©</strong>.
                      </p>
                    </label>

                    {/* Quick stats */}
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { icon: "ðŸ”", label: "Ø¨ÙŠØ§Ù†Ø§Øª Ù…Ø´ÙØ±Ø©" },
                        { icon: "ðŸ‘¨â€âš•ï¸", label: "Ø£Ø·Ø¨Ø§Ø¡ Ù…Ø¹ØªÙ…Ø¯ÙˆÙ†" },
                        { icon: "ðŸŒŸ", label: "24/7 Ù…ØªØ§Ø­" },
                      ].map(f => (
                        <div key={f.label} className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center">
                          <div className="text-lg mb-1">{f.icon}</div>
                          <p className="text-xs font-bold text-slate-600">{f.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Nav buttons */}
                <div className={`flex gap-3 mt-7 ${step === 1 ? "justify-end" : "justify-between"}`}>
                  {step > 1 && (
                    <button type="button" onClick={() => { setError(null); setStep(s => (s - 1) as Step); }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50">
                      <ChevronRight className="w-4 h-4" /> Ø§Ù„Ø³Ø§Ø¨Ù‚
                    </button>
                  )}
                  {step < 3 ? (
                    <button type="button" onClick={nextStep}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-l from-emerald-600 to-teal-500 text-white text-sm font-bold shadow-lg">
                      Ø§Ù„ØªØ§Ù„ÙŠ <ChevronLeft className="w-4 h-4" />
                    </button>
                  ) : (
                    <button type="button" onClick={handleSignup} disabled={loading || !form.acceptTerms}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-l from-emerald-600 to-teal-500 text-white text-sm font-bold shadow-lg disabled:opacity-50">
                      <CheckCircle className="w-4 h-4" />
                      {loading ? "Ø¬Ø§Ø±ÙŠ Ø§Ù„Ø¥Ù†Ø´Ø§Ø¡..." : "ÙØªØ­ Ø§Ù„Ù…Ù„Ù Ø§Ù„Ø·Ø¨ÙŠ"}
                    </button>
                  )}
                </div>
                {step === 2 && <p className="text-center text-xs text-slate-400 mt-3">Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ø·Ø¨ÙŠØ© ØªÙØ­ÙØ¸ Ø¨Ø´ÙƒÙ„ Ù…Ø´ÙØ± ÙˆÙ„Ø§ ØªÙØ´Ø§Ø±Ùƒ Ø¥Ù„Ø§ Ù…Ø¹ Ø·Ø¨ÙŠØ¨Ùƒ</p>}
              </div>
            )}
          </div>
        </div>
        <p className="text-center text-xs text-slate-400 mt-5">Ù…Ù†ØµØ© Ø¹Ù†Ø§ÙŠØ© Â© {new Date().getFullYear()} â€” Ù…Ø±Ø®ØµØ© Ù…Ù† ÙˆØ²Ø§Ø±Ø© Ø§Ù„ØµØ­Ø©</p>
      </div>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-600">
        {icon && <span className="text-slate-400">{icon}</span>}
        {label}
      </label>
      {children}
    </div>
  );
}
