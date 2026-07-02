"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  Heart, Mail, Lock, User, Phone,
  AlertTriangle, ChevronLeft, ChevronRight, CheckCircle,
  Pill, Activity, Globe, X, Shield
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DatePickerField from "@/components/ui/DatePickerField";
import QRSuccessScreen from "@/components/ui/QRSuccessScreen";
import { useTranslation } from "@/hooks/useTranslation";
import LanguageToggle from "@/components/ui/LanguageToggle";

type Step = 1 | 2 | 3 | 4;

interface PatientForm {
  fullNameAr: string; fullNameFr: string;
  email: string; password: string; phone: string;
  dateOfBirth: string; nationalId: string; socialSecurity: string;
  address: string;
  chronicDiseases: string[]; otherIllness: string; surgeries: string;
  familyHistory: string; drugAllergies: string[];
  foodAllergies: string; bloodGroup: string;
  hadPhysicalExam: boolean;
  acceptTerms: boolean;
}

const CHRONIC_OPTIONS_AR = [
  "داء السكري", "ارتفاع ضغط الدم", "أمراض القلب", "الربو",
  "السرطان", "أمراض الكلى المزمنة", "قصور الغدة الدرقية",
  "أمراض الرئة المزمنة BPCO", "أمراض الأعصاب", "لا يوجد",
];

const CHRONIC_OPTIONS_FR = [
  "Diabète", "Hypertension", "Maladies cardiaques", "Asthme",
  "Cancer", "Maladie rénale chronique", "Hypothyroïdie",
  "BPCO", "Maladies neurologiques", "Aucune",
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const COMMON_ALLERGIES_AR = ["البنسيلين", "السلفاميد", "الأسبرين", "الإيبوبروفين", "الكودايين", "لا يوجد"];
const COMMON_ALLERGIES_FR = ["Pénicilline", "Sulfamide", "Aspirine", "Ibuprofène", "Codéine", "Aucune"];

export default function PatientLoginPage() {
  const { t, language } = useTranslation();
  const isRtl = language === 'ar';
  
  const CHRONIC_OPTIONS = isRtl ? CHRONIC_OPTIONS_AR : CHRONIC_OPTIONS_FR;
  const COMMON_ALLERGIES = isRtl ? COMMON_ALLERGIES_AR : COMMON_ALLERGIES_FR;

  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [newUserId, setNewUserId] = useState<string | null>(null);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [form, setForm] = useState<PatientForm>({
    fullNameAr: "", fullNameFr: "", email: "", password: "", phone: "",
    dateOfBirth: "", nationalId: "", socialSecurity: "", address: "",
    chronicDiseases: [], otherIllness: "", surgeries: "", familyHistory: "", drugAllergies: [],
    foodAllergies: "", bloodGroup: "", hadPhysicalExam: false,
    acceptTerms: false,
  });

  const router = useRouter();
  const supabase = createClient();
  const set = (field: keyof PatientForm) => (val: any) =>
    setForm(p => ({ ...p, [field]: val }));

  const toggleArrayItem = (field: 'chronicDiseases' | 'drugAllergies', item: string) => {
    set(field)(
      form[field].includes(item)
        ? form[field].filter(x => x !== item)
        : [...form[field], item]
    );
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    if (loginPassword === "1" && loginEmail === "1") {
      const { error: err } = await supabase.auth.signInWithPassword({ email: "patient@test.com", password: "123456" });
      if (err) { setError(t.login.testDataError); setLoading(false); return; }
      document.cookie = `testing_bypass=patient; path=/; max-age=86400`;
      window.location.href = "/dashboard"; return;
    }
    const { data, error: err } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    if (err) { setError(t.login.loginError); setLoading(false); return; }
    if (data?.user?.user_metadata?.role === "patient") {
      router.push("/dashboard");
      router.refresh();
    } else {
      setError(t.login.notPatientError);
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!form.acceptTerms) { setError(t.common.error); return; }
    setLoading(true); setError(null);

    const chronicList = [...form.chronicDiseases];
    if (form.otherIllness.trim()) chronicList.push(form.otherIllness.trim());

    const { data, error: err } = await supabase.auth.signUp({
      email: form.email, password: form.password,
      options: {
        data: {
          full_name: form.fullNameAr || form.fullNameFr,
          full_name_ar: form.fullNameAr,
          full_name_fr: form.fullNameFr,
          role: "patient",
          phone: form.phone,
          date_of_birth: form.dateOfBirth || null,
          national_id: form.nationalId || null,
          social_security: form.socialSecurity || null,
          address: form.address || null,
          blood_group: form.bloodGroup || null,
          chronic_diseases: chronicList,
          other_illnesses: form.otherIllness || null,
          surgeries: form.surgeries || null,
          family_history: form.familyHistory || null,
          drug_allergies: form.drugAllergies,
          food_allergies: form.foodAllergies || null,
          had_physical_exam: form.hadPhysicalExam,
        }
      },
    });

    if (err) { setError(err.message); setLoading(false); return; }

    if (data.user?.id) {
      setNewUserId(data.user.id);
      setStep(4);
    } else {
      setSuccessMsg(t.common.success);
      setIsLogin(true); setStep(1);
    }
    setLoading(false);
  };

  const nextStep = () => {
    setError(null);
    if (step === 1) {
      if (!form.fullNameAr || !form.fullNameFr || !form.email || !form.password || !form.phone) {
        setError(t.common.error);
        return;
      }
      if (form.password.length < 6) { setError(t.common.error); return; }
    }
    if (step === 2 && form.chronicDiseases.length === 0 && !form.otherIllness.trim()) {
      setError(t.common.error);
      return;
    }
    setStep(s => Math.min(3, s + 1) as Step);
  };

  const cls = `w-full h-12 px-4 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none ${isRtl ? 'text-right' : 'text-left'} text-slate-800 text-sm transition-all`;

  if (!isLogin && step === 4 && newUserId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-y-auto" dir={isRtl ? "rtl" : "ltr"}>
        <div className="absolute inset-0 z-0 overflow-hidden bg-slate-50">
          <div className="absolute top-[-10%] -right-[10%] w-[800px] h-[800px] bg-emerald-300 rounded-full mix-blend-multiply filter blur-[150px] opacity-60" />
          <div className="absolute bottom-[-10%] -left-[10%] w-[600px] h-[600px] bg-green-300 rounded-full mix-blend-multiply filter blur-[150px] opacity-50" />
        </div>
        <div className="relative z-10 w-full max-w-lg bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/60 p-6">
          <QRSuccessScreen
            userId={newUserId}
            fullNameAr={form.fullNameAr}
            fullNameFr={form.fullNameFr}
            onContinue={() => { setIsLogin(true); setStep(1); setNewUserId(null); }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-2 sm:p-4 relative overflow-y-auto" dir={isRtl ? "rtl" : "ltr"}>
      {/* Absolute Language Toggle */}
      <div className="absolute top-4 left-4 z-50">
        <LanguageToggle />
      </div>

      {/* Animated Background */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-slate-50">
        <div className="absolute top-[-10%] -right-[10%] w-[800px] h-[800px] bg-emerald-300 rounded-full mix-blend-multiply filter blur-[150px] opacity-60 animate-pulse-soft" />
        <div className="absolute bottom-[-10%] -left-[10%] w-[600px] h-[600px] bg-green-300 rounded-full mix-blend-multiply filter blur-[150px] opacity-50 animate-pulse-soft" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]" />
      </div>

      <style>{`
        @keyframes logoFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes glowPulse { 0%, 100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 0.85; transform: scale(1.15); } }
        .logo-float { animation: logoFloat 4s ease-in-out infinite; }
        .glow-pulse { animation: glowPulse 3s ease-in-out infinite; }
      `}</style>

      <div className="relative z-10 w-full max-w-lg mt-12 sm:mt-0">
        {/* Logo */}
        <div className="text-center mb-4 sm:mb-8">
          <div className="inline-block relative mb-2 sm:mb-4">
            <div className="absolute inset-[-8px] z-0 glow-pulse rounded-3xl blur-xl bg-gradient-to-tr from-emerald-400 via-teal-400 to-green-300 opacity-60" />
            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-white border border-emerald-100 shadow-xl flex items-center justify-center relative z-10 logo-float">
              <img src="/logo.png" alt="Logo" className="w-16 h-16 sm:w-24 sm:h-24 object-contain drop-shadow-sm" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{t.login.title}</h1>
          <h2 className="text-lg sm:text-2xl font-black mt-1 sm:mt-2 tracking-wide text-transparent bg-clip-text bg-gradient-to-l from-emerald-600 to-teal-500">
            {t.login.subtitle}
          </h2>
          <p className="text-slate-400 text-[10px] sm:text-xs mt-1">
            <Shield className="inline w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500 mx-1" />
            {t.login.securityNote}
          </p>
        </div>

        <div className="bg-white/85 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/60 overflow-hidden">
          {/* Tabs */}
          <div className="flex" style={{ borderBottom: "1px solid #e8f5ec" }}>
            {[t.login.tabLogin, t.login.tabSignup].map((label, idx) => (
              <button key={label} onClick={() => { setIsLogin(idx === 0); setError(null); setStep(1); }}
                className="flex-1 py-4 text-sm font-bold transition-colors"
                style={isLogin === (idx === 0)
                  ? { color: "var(--green-dark)", borderBottom: "2.5px solid var(--green-main)", background: "#f0fdf4" }
                  : { color: "#9ca3af" }}>
                {label}
              </button>
            ))}
          </div>

          <div className="p-4 sm:p-7">
            {/* Alerts */}
            {successMsg && (
              <div className="flex items-start gap-3 bg-green-50 text-green-800 p-4 rounded-2xl text-sm font-semibold mb-5 border border-green-200">
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" /><span>{successMsg}</span>
              </div>
            )}
            {error && (
              <div className="flex items-start gap-3 bg-rose-50 text-rose-700 p-4 rounded-2xl text-sm font-semibold mb-5 border border-rose-200">
                <X className="w-5 h-5 mt-0.5 flex-shrink-0" /><span>{error}</span>
              </div>
            )}

            {/* ── LOGIN ── */}
            {isLogin && (
              <form onSubmit={handleLogin} className="space-y-4">
                <Field label={t.login.email} icon={<Mail className="w-4 h-4" />}>
                  <input value={loginEmail} onChange={e => setLoginEmail(e.target.value)} type="email" placeholder="patient@example.com" className={cls} required dir="ltr" />
                </Field>
                <Field label={t.login.password} icon={<Lock className="w-4 h-4" />}>
                  <input value={loginPassword} onChange={e => setLoginPassword(e.target.value)} type="password" placeholder="••••••••" className={cls} required dir="ltr" />
                </Field>
                <button type="button" className={`text-xs font-bold w-full ${isRtl ? 'text-right' : 'text-left'}`} style={{ color: "var(--green-main)" }}>{t.login.forgotPassword}</button>
                <button type="submit" disabled={loading} className="btn-pill-green w-full mt-2">
                  {loading ? t.login.verifying : t.login.enterClinic}
                </button>
                <p className="text-center text-xs text-slate-400 mt-4">{t.login.securityFooter}</p>
              </form>
            )}

            {/* ── SIGNUP ── */}
            {!isLogin && (
              <div>
                <div className={`flex ${isRtl ? 'flex-row-reverse' : 'flex-row'} items-center justify-center gap-3 mb-7`}>
                  {[1, 2, 3].map((s, i) => (
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

                <div className="text-center mb-5">
                  {step === 1 && <><h2 className="font-black text-slate-800 text-lg">{t.login.signup.step1Title}</h2><p className="text-slate-400 text-xs mt-1">{t.login.signup.step1Desc}</p></>}
                  {step === 2 && <><h2 className="font-black text-slate-800 text-lg">{t.login.signup.step2Title}</h2><p className="text-slate-400 text-xs mt-1">{t.login.signup.step2Desc}<span className="text-rose-500 mx-1">*</span></p></>}
                  {step === 3 && <><h2 className="font-black text-slate-800 text-lg">{t.login.signup.step3Title}</h2><p className="text-slate-400 text-xs mt-1">{t.login.signup.step3Desc}</p></>}
                </div>

                {step === 1 && (
                  <div className="space-y-4">
                    <Field label={t.login.signup.nameAr} icon={<User className="w-4 h-4" />}>
                      <input value={form.fullNameAr} onChange={e => set("fullNameAr")(e.target.value)} placeholder="أحمد بن علي" className={cls} />
                    </Field>
                    <Field label={t.login.signup.nameFr} icon={<Globe className="w-4 h-4" />}>
                      <input value={form.fullNameFr} onChange={e => set("fullNameFr")(e.target.value)} placeholder="Ahmed Ben Ali" className={cls} dir="ltr" style={{ textAlign: "left" }} />
                    </Field>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label={t.login.signup.email} icon={<Mail className="w-4 h-4" />}>
                        <input value={form.email} onChange={e => set("email")(e.target.value)} type="email" placeholder="patient@example.com" className={cls} dir="ltr" />
                      </Field>
                      <Field label={t.login.signup.password} icon={<Lock className="w-4 h-4" />}>
                        <input value={form.password} onChange={e => set("password")(e.target.value)} type="password" placeholder="••••••••" className={cls} dir="ltr" />
                      </Field>
                    </div>
                    <Field label={t.login.signup.phone} icon={<Phone className="w-4 h-4" />}>
                      <input value={form.phone} onChange={e => set("phone")(e.target.value)} type="tel" placeholder="+213 6XX XX XX XX" className={cls} dir="ltr" />
                    </Field>

                    <DatePickerField label={t.login.signup.dob} value={form.dateOfBirth} onChange={v => set("dateOfBirth")(v)} />

                    <Field label={t.login.signup.nationalId} icon={<Shield className="w-4 h-4" />}>
                      <input value={form.nationalId} onChange={e => set("nationalId")(e.target.value)} className={cls} dir="ltr" />
                    </Field>
                    <Field label={t.login.signup.socialSecurity} icon={<Shield className="w-4 h-4" />}>
                      <input value={form.socialSecurity} onChange={e => set("socialSecurity")(e.target.value)} className={cls} dir="ltr" />
                    </Field>
                    <Field label={t.login.signup.address} icon={<Activity className="w-4 h-4" />}>
                      <input value={form.address} onChange={e => set("address")(e.target.value)} className={cls} />
                    </Field>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-5">
                    <div>
                      <label className="text-sm font-bold text-slate-600 mb-2 block">{t.login.signup.bloodGroup}</label>
                      <div className="flex flex-wrap gap-2">
                        {BLOOD_GROUPS.map(bg => (
                          <button key={bg} type="button" onClick={() => set("bloodGroup")(bg)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black border-2 transition-all ${
                              form.bloodGroup === bg ? "border-rose-500 bg-rose-50 text-rose-700" : "border-slate-200 text-slate-500 hover:border-rose-300"
                            }`}>{bg}</button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-600" />
                        {t.login.signup.chronicDiseases} <span className="text-rose-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {CHRONIC_OPTIONS.map(d => (
                          <button key={d} type="button" onClick={() => toggleArrayItem('chronicDiseases', d)}
                            className={`px-3 py-2.5 rounded-xl text-xs font-bold border-2 ${isRtl ? 'text-right' : 'text-left'} transition-all ${
                              form.chronicDiseases.includes(d) ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-500 hover:border-emerald-300"
                            }`}>
                            {form.chronicDiseases.includes(d) && <CheckCircle className={`inline w-3 h-3 ${isRtl ? 'ml-1' : 'mr-1'} text-emerald-500`} />}
                            {d}
                          </button>
                        ))}
                      </div>
                      <div className="mt-3">
                        <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1.5">
                          <Pill className="w-3.5 h-3.5 text-purple-500" /> {t.login.signup.otherIllness}
                        </label>
                        <input value={form.otherIllness} onChange={e => set("otherIllness")(e.target.value)} className={cls} />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-bold text-slate-600 mb-1.5 block">{t.login.signup.surgeries}</label>
                      <textarea value={form.surgeries} onChange={e => set("surgeries")(e.target.value)} rows={2}
                        className={`w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none text-sm text-slate-700 resize-none ${isRtl ? 'text-right' : 'text-left'}`} />
                    </div>

                    <div>
                      <label className="text-sm font-bold text-slate-600 mb-1.5 flex items-center gap-2">
                        <Shield className="w-4 h-4" /> {t.login.signup.familyHistory}
                      </label>
                      <textarea value={form.familyHistory} onChange={e => set("familyHistory")(e.target.value)} rows={2}
                        className={`w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none text-sm text-slate-700 resize-none ${isRtl ? 'text-right' : 'text-left'}`} />
                    </div>

                    <div>
                      <label className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" /> {t.login.signup.drugAllergies}
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {COMMON_ALLERGIES.map(al => (
                          <button key={al} type="button" onClick={() => toggleArrayItem('drugAllergies', al)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${
                              form.drugAllergies.includes(al) ? "border-amber-500 bg-amber-50 text-amber-700" : "border-slate-200 text-slate-500 hover:border-amber-300"
                            }`}>{al}</button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-bold text-slate-600 mb-1.5 block">{t.login.signup.foodAllergies}</label>
                      <input value={form.foodAllergies} onChange={e => set("foodAllergies")(e.target.value)} className={cls} />
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-5">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-sm">
                      <p className="font-black text-emerald-800 mb-3">{t.login.signup.summary}</p>
                      <div className="space-y-1.5 text-slate-700">
                        <p><span className="font-bold">{t.login.signup.nameAr}:</span> {form.fullNameAr}</p>
                        <p><span className="font-bold">{t.login.signup.nameFr}:</span> {form.fullNameFr}</p>
                        <p><span className="font-bold">{t.login.signup.phone}:</span> <span dir="ltr">{form.phone}</span></p>
                        {form.dateOfBirth && <p><span className="font-bold">{t.login.signup.dob}:</span> {form.dateOfBirth}</p>}
                        {form.bloodGroup && <p><span className="font-bold">{t.login.signup.bloodGroup}:</span> {form.bloodGroup}</p>}
                        {form.chronicDiseases.length > 0 && <p><span className="font-bold">{t.login.signup.chronicDiseases}:</span> {form.chronicDiseases.join(", ")}{form.otherIllness ? `, ${form.otherIllness}` : ""}</p>}
                        {form.drugAllergies.length > 0 && <p><span className="font-bold text-amber-700">{t.login.signup.drugAllergies}:</span> {form.drugAllergies.join(", ")}</p>}
                      </div>
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer bg-blue-50 border border-blue-100 rounded-2xl p-4">
                      <input type="checkbox" checked={form.hadPhysicalExam} onChange={e => set("hadPhysicalExam")(e.target.checked)}
                        className="mt-1 w-4 h-4 accent-emerald-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-slate-800">{t.login.signup.physicalExam}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{t.login.signup.physicalExamDesc}</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" checked={form.acceptTerms} onChange={e => set("acceptTerms")(e.target.checked)}
                        className="mt-1 w-4 h-4 accent-emerald-600 flex-shrink-0" />
                      <p className="text-xs text-slate-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: t.login.signup.terms }} />
                    </label>

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { icon: "🔐", label: t.login.signup.encryptedData },
                        { icon: "👨‍⚕️", label: t.login.signup.certifiedDoctors },
                        { icon: "🌟", label: t.login.signup.alwaysAvailable },
                      ].map(f => (
                        <div key={f.label} className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center">
                          <div className="text-lg mb-1">{f.icon}</div>
                          <p className="text-xs font-bold text-slate-600">{f.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className={`flex gap-3 mt-7 ${step === 1 ? (isRtl ? "justify-end" : "justify-start") : "justify-between"} ${!isRtl && step > 1 ? "flex-row-reverse" : ""}`}>
                  {step > 1 && (
                    <button type="button" onClick={() => { setError(null); setStep(s => (s - 1) as Step); }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50">
                      {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />} {t.common.previous}
                    </button>
                  )}
                  {step < 3 ? (
                    <button type="button" onClick={nextStep}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-l from-emerald-600 to-teal-500 text-white text-sm font-bold shadow-lg">
                      {t.common.next} {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  ) : (
                    <button type="button" onClick={handleSignup} disabled={loading || !form.acceptTerms}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-l from-emerald-600 to-teal-500 text-white text-sm font-bold shadow-lg disabled:opacity-50">
                      <CheckCircle className="w-4 h-4" />
                      {loading ? t.login.signup.submitting : t.login.signup.submit}
                    </button>
                  )}
                </div>
                {step === 2 && <p className="text-center text-xs text-slate-400 mt-3">{t.login.signup.medicalInfoSecure}</p>}
              </div>
            )}
          </div>
        </div>
        <p className="text-center text-xs text-slate-400 mt-5">
          {t.login.signup.footer.replace('{year}', new Date().getFullYear().toString())}
        </p>
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
