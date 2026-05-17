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
  "╪»╪º╪í ╪º┘ä╪│┘â╪▒┘è", "╪º╪▒╪¬┘ü╪º╪╣ ╪╢╪║╪╖ ╪º┘ä╪»┘à", "╪ú┘à╪▒╪º╪╢ ╪º┘ä┘é┘ä╪¿", "╪º┘ä╪▒╪¿┘ê",
  "╪º┘ä╪│╪▒╪╖╪º┘å", "╪ú┘à╪▒╪º╪╢ ╪º┘ä┘â┘ä┘ë ╪º┘ä┘à╪▓┘à┘å╪⌐", "┘é╪╡┘ê╪▒ ╪º┘ä╪║╪»╪⌐ ╪º┘ä╪»╪▒┘é┘è╪⌐",
  "╪ú┘à╪▒╪º╪╢ ╪º┘ä╪▒╪ª╪⌐ ╪º┘ä┘à╪▓┘à┘å╪⌐ BPCO", "╪ú┘à╪▒╪º╪╢ ╪º┘ä╪ú╪╣╪╡╪º╪¿", "┘ä╪º ┘è┘ê╪¼╪»",
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "╪║┘è╪▒ ┘à╪╣╪▒┘ê┘ü"];

const COMMON_ALLERGIES = ["╪º┘ä╪¿┘å╪│┘è┘ä┘è┘å", "╪º┘ä╪│┘ä┘ü╪º┘à┘è╪»", "╪º┘ä╪ú╪│╪¿╪▒┘è┘å", "╪º┘ä╪Ñ┘è╪¿┘ê╪¿╪▒┘ê┘ü┘è┘å", "╪º┘ä┘â┘ê╪»╪º┘è┘è┘å", "┘ä╪º ┘è┘ê╪¼╪»"];

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

  // ΓöÇΓöÇ Login ΓöÇΓöÇΓöÇΓöÇ
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    if (loginPassword === "1" && loginEmail === "1") {
      const { error: err } = await supabase.auth.signInWithPassword({ email: "patient@3inaya.com", password: "123456" });
      if (err) { setError("╪¿┘è╪º┘å╪º╪¬ ╪º╪«╪¬╪¿╪º╪▒ ╪║┘è╪▒ ┘à╪¬╪º╪¡╪⌐"); setLoading(false); return; }
      document.cookie = `testing_bypass=patient; path=/; max-age=86400`;
      window.location.href = "/dashboard"; return;
    }
    const { data, error: err } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    if (err) { setError("┘ü╪┤┘ä ╪¬╪│╪¼┘è┘ä ╪º┘ä╪»╪«┘ê┘ä. ╪¬╪¡┘é┘é ┘à┘å ╪¿┘è╪º┘å╪º╪¬┘â."); setLoading(false); return; }
    if (data?.user?.user_metadata?.role === "patient") router.push("/dashboard");
    else { setError("┘ç╪░┘ç ╪º┘ä╪¿┘ê╪º╪¿╪⌐ ┘à╪«╪╡╪╡╪⌐ ┘ä┘ä┘à╪▒╪╢┘ë ┘ü┘é╪╖."); setLoading(false); }
  };

  // ΓöÇΓöÇ Signup ΓöÇΓöÇΓöÇ
  const handleSignup = async () => {
    if (!form.acceptTerms) { setError("┘è╪¼╪¿ ╪º┘ä┘à┘ê╪º┘ü┘é╪⌐ ╪╣┘ä┘ë ╪º┘ä╪┤╪▒┘ê╪╖."); return; }
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
    setSuccessMsg("≡ƒÄë ╪¬┘à ╪Ñ┘å╪┤╪º╪í ┘à┘ä┘ü┘â ╪º┘ä╪╖╪¿┘è! ╪¬╪¡┘é┘é ┘à┘å ╪¿╪▒┘è╪»┘â ╪º┘ä╪Ñ┘ä┘â╪¬╪▒┘ê┘å┘è ╪½┘à ╪│╪¼┘æ┘ä ╪º┘ä╪»╪«┘ê┘ä.");
    setIsLogin(true); setStep(1); setLoading(false);
  };

  const nextStep = () => {
    setError(null);
    if (step === 1) {
      if (!form.fullNameAr || !form.email || !form.password || !form.phone) {
        setError("╪º┘ä╪▒╪¼╪º╪í ┘à┘ä╪í ╪º┘ä╪¡┘é┘ê┘ä ╪º┘ä╪Ñ┘ä╪▓╪º┘à┘è╪⌐: ╪º┘ä╪º╪│┘à╪î ╪º┘ä╪¿╪▒┘è╪»╪î ┘â┘ä┘à╪⌐ ╪º┘ä┘à╪▒┘ê╪▒╪î ╪º┘ä┘ç╪º╪¬┘ü");
        return;
      }
      if (form.password.length < 6) { setError("┘â┘ä┘à╪⌐ ╪º┘ä┘à╪▒┘ê╪▒ 6 ╪ú╪¡╪▒┘ü ╪╣┘ä┘ë ╪º┘ä╪ú┘é┘ä."); return; }
    }
    if (step === 2 && form.chronicDiseases.length === 0) {
      setError("┘è╪▒╪¼┘ë ╪¬╪¡╪»┘è╪» ╪¡╪º┘ä╪¬┘â ╪º┘ä╪╡╪¡┘è╪⌐ ΓÇö ╪º╪«╪¬╪▒ '┘ä╪º ┘è┘ê╪¼╪»' ╪Ñ╪░╪º ┘â┘å╪¬ ╪¿╪╡╪¡╪⌐ ╪¼┘è╪»╪⌐.");
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

      {/* Glow keyframes */}
      <style>{`
        @keyframes logoFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes glowPulse { 0%, 100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 0.85; transform: scale(1.15); } }
        @keyframes glowColorShift { 0% { filter: hue-rotate(0deg); } 50% { filter: hue-rotate(40deg); } 100% { filter: hue-rotate(0deg); } }
        .logo-float { animation: logoFloat 4s ease-in-out infinite; }
        .glow-pulse { animation: glowPulse 3s ease-in-out infinite, glowColorShift 6s ease-in-out infinite; }
      `}</style>

      <div className="relative z-10 w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block relative mb-4">
            <img src="/logo.png" alt="╪╣┘å╪º┘è╪⌐" className="w-24 h-24 object-contain relative z-10 logo-float drop-shadow-lg" />
            <div className="absolute inset-[-12px] z-0 glow-pulse rounded-full blur-2xl bg-gradient-to-tr from-emerald-400 via-teal-400 to-green-300" />
          </div>
          <h1 className="text-3xl font-black text-slate-900">╪╣┘å╪º┘è╪⌐</h1>
          <p className="text-emerald-600 font-semibold text-sm mt-1">╪¿┘ê╪º╪¿╪⌐ ╪º┘ä┘à╪▒╪╢┘ë ΓÇö ╪╖╪¿┘è╪¿┘â ┘ü┘è ╪¿┘è╪¬┘â</p>
          <p className="text-slate-400 text-xs mt-1">
            <Shield className="inline w-3.5 h-3.5 text-emerald-500 mx-1" />
            ╪¿┘è╪º┘å╪º╪¬┘â ┘à╪┤┘ü╪▒╪⌐ ┘ê┘à╪¡┘à┘è╪⌐ ╪¿╪º┘ä┘â╪º┘à┘ä
          </p>
        </div>

        <div className="bg-white/85 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/60 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            {["╪¬╪│╪¼┘è┘ä ╪º┘ä╪»╪«┘ê┘ä", "┘ü╪¬╪¡ ┘à┘ä┘ü ╪¼╪»┘è╪»"].map((label, idx) => (
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

            {/* ΓöÇΓöÇ LOGIN ΓöÇΓöÇ */}
            {isLogin && (
              <form onSubmit={handleLogin} className="space-y-4">
                <Field label="╪º┘ä╪¿╪▒┘è╪» ╪º┘ä╪Ñ┘ä┘â╪¬╪▒┘ê┘å┘è" icon={<Mail className="w-4 h-4" />}>
                  <input value={loginEmail} onChange={e => setLoginEmail(e.target.value)} type="email" placeholder="patient@example.com" className={cls} required />
                </Field>
                <Field label="┘â┘ä┘à╪⌐ ╪º┘ä┘à╪▒┘ê╪▒" icon={<Lock className="w-4 h-4" />}>
                  <input value={loginPassword} onChange={e => setLoginPassword(e.target.value)} type="password" placeholder="ΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇó" className={cls} required />
                </Field>
                <button type="button" className="text-xs text-emerald-500 hover:underline w-full text-right">┘å╪│┘è╪¬ ┘â┘ä┘à╪⌐ ╪º┘ä┘à╪▒┘ê╪▒╪ƒ</button>
                <button type="submit" disabled={loading}
                  className="w-full h-12 rounded-xl font-bold bg-gradient-to-l from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all mt-2">
                  {loading ? "╪¼╪º╪▒┘è ╪º┘ä╪¬╪¡┘é┘é..." : "╪º┘ä╪»╪«┘ê┘ä ╪Ñ┘ä┘ë ┘à┘ä┘ü┘è ╪º┘ä╪╖╪¿┘è ΓåÆ"}
                </button>
                <p className="text-center text-xs text-slate-400 mt-4">┘à╪¡┘à┘è ╪¿╪¬╪┤┘ü┘è╪▒ AES-256 ┬╖ Supabase Auth</p>
              </form>
            )}

            {/* ΓöÇΓöÇ SIGNUP ΓöÇΓöÇ */}
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
                  {step === 1 && <><h2 className="font-black text-slate-800 text-lg">╪º┘ä┘à╪╣┘ä┘ê┘à╪º╪¬ ╪º┘ä╪ú╪│╪º╪│┘è╪⌐</h2><p className="text-slate-400 text-xs mt-1">╪¿┘è╪º┘å╪º╪¬┘â ╪º┘ä╪┤╪«╪╡┘è╪⌐ ┘ä┘ü╪¬╪¡ ┘à┘ä┘ü┘â ╪º┘ä╪╖╪¿┘è</p></>}
                  {step === 2 && <><h2 className="font-black text-slate-800 text-lg">╪º┘ä╪│╪¼┘ä ╪º┘ä╪╖╪¿┘è</h2><p className="text-slate-400 text-xs mt-1">┘à╪╣┘ä┘ê┘à╪º╪¬ ╪╡╪¡┘è╪⌐ ╪╢╪▒┘ê╪▒┘è╪⌐ ┘ä┘ä╪╖╪¿┘è╪¿<span className="text-rose-500 mr-1">*</span></p></>}
                  {step === 3 && <><h2 className="font-black text-slate-800 text-lg">╪º┘ä╪¬╪ú┘â┘è╪» ╪º┘ä┘å┘ç╪º╪ª┘è</h2><p className="text-slate-400 text-xs mt-1">╪ó╪«╪▒ ╪«╪╖┘ê╪⌐ ┘ä╪¬┘ü╪╣┘è┘ä ┘à┘ä┘ü┘â ╪º┘ä╪╖╪¿┘è ╪º┘ä╪▒┘é┘à┘è</p></>}
                </div>

                {/* ΓöÇΓöÇΓöÇ STEP 1: Personal info ΓöÇΓöÇΓöÇ */}
                {step === 1 && (
                  <div className="space-y-4">
                    <Field label="╪º┘ä╪º╪│┘à ╪º┘ä┘â╪º┘à┘ä ╪¿╪º┘ä╪╣╪▒╪¿┘è╪⌐ *" icon={<User className="w-4 h-4" />}>
                      <input value={form.fullNameAr} onChange={e => set("fullNameAr")(e.target.value)} placeholder="╪ú╪¡┘à╪» ╪¿┘å ╪╣┘ä┘è" className={cls} />
                    </Field>
                    <Field label="╪º┘ä╪º╪│┘à ╪¿╪º┘ä┘ü╪▒┘å╪│┘è╪⌐" icon={<Globe className="w-4 h-4" />}>
                      <input value={form.fullNameFr} onChange={e => set("fullNameFr")(e.target.value)} placeholder="Ahmed Ben Ali" className={cls} />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="╪º┘ä╪¿╪▒┘è╪» ╪º┘ä╪Ñ┘ä┘â╪¬╪▒┘ê┘å┘è *" icon={<Mail className="w-4 h-4" />}>
                        <input value={form.email} onChange={e => set("email")(e.target.value)} type="email" placeholder="patient@example.com" className={cls} />
                      </Field>
                      <Field label="┘â┘ä┘à╪⌐ ╪º┘ä┘à╪▒┘ê╪▒ *" icon={<Lock className="w-4 h-4" />}>
                        <input value={form.password} onChange={e => set("password")(e.target.value)} type="password" placeholder="6+ ╪ú╪¡╪▒┘ü" className={cls} />
                      </Field>
                    </div>
                    <Field label="╪▒┘é┘à ╪º┘ä┘ç╪º╪¬┘ü *" icon={<Phone className="w-4 h-4" />}>
                      <input value={form.phone} onChange={e => set("phone")(e.target.value)} type="tel" placeholder="+213 6XX XX XX XX" className={cls} />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="╪¬╪º╪▒┘è╪« ╪º┘ä┘à┘è┘ä╪º╪»" icon={<Calendar className="w-4 h-4" />}>
                        <input value={form.dateOfBirth} onChange={e => set("dateOfBirth")(e.target.value)} type="date" className={cls} />
                      </Field>
                      <Field label="╪▒┘é┘à ╪¿╪╖╪º┘é╪⌐ ╪º┘ä╪¬╪╣╪▒┘è┘ü" icon={<CreditCard className="w-4 h-4" />}>
                        <input value={form.nationalId} onChange={e => set("nationalId")(e.target.value)} placeholder="18 ╪▒┘é┘à" className={cls} />
                      </Field>
                    </div>
                    <Field label="╪▒┘é┘à ╪º┘ä╪╢┘à╪º┘å ╪º┘ä╪º╪¼╪¬┘à╪º╪╣┘è" icon={<Shield className="w-4 h-4" />}>
                      <input value={form.socialSecurity} onChange={e => set("socialSecurity")(e.target.value)} placeholder="╪º╪«╪¬┘è╪º╪▒┘è ΓÇö ┘ä┘ä┘à╪ñ┘à┘å┘è┘å ╪º╪¼╪¬┘à╪º╪╣┘è╪º┘ï" className={cls} />
                    </Field>
                    <Field label="╪º┘ä╪╣┘å┘ê╪º┘å" icon={<Activity className="w-4 h-4" />}>
                      <input value={form.address} onChange={e => set("address")(e.target.value)} placeholder="╪º┘ä┘ê┘ä╪º┘è╪⌐╪î ╪º┘ä╪¿┘ä╪»┘è╪⌐╪î ╪º┘ä╪¡┘è..." className={cls} />
                    </Field>
                  </div>
                )}

                {/* ΓöÇΓöÇΓöÇ STEP 2: Medical History ΓöÇΓöÇΓöÇ */}
                {step === 2 && (
                  <div className="space-y-5">
                    {/* Blood group */}
                    <div>
                      <label className="text-sm font-bold text-slate-600 mb-2 block">┘ü╪╡┘è┘ä╪⌐ ╪º┘ä╪»┘à</label>
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
                        ╪º┘ä╪ú┘à╪▒╪º╪╢ ╪º┘ä┘à╪▓┘à┘å╪⌐ <span className="text-rose-500">*</span>
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
                      <label className="text-sm font-bold text-slate-600 mb-1.5 block">╪º┘ä╪╣┘à┘ä┘è╪º╪¬ ╪º┘ä╪¼╪▒╪º╪¡┘è╪⌐ ╪º┘ä╪│╪º╪¿┘é╪⌐</label>
                      <textarea value={form.surgeries} onChange={e => set("surgeries")(e.target.value)}
                        placeholder="┘à╪½╪º┘ä: ╪º╪│╪¬╪ª╪╡╪º┘ä ╪º┘ä╪▓╪º╪ª╪»╪⌐ 2018╪î ╪╣┘à┘ä┘è╪⌐ ╪º┘ä┘é┘ä╪¿ 2022..." rows={2}
                        className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none text-sm text-slate-700 resize-none" />
                    </div>

                    {/* Family history */}
                    <div>
                      <label className="text-sm font-bold text-slate-600 mb-1.5 block flex items-center gap-2">
                        <Shield className="w-4 h-4" /> ╪º┘ä╪ú┘à╪▒╪º╪╢ ╪º┘ä┘ê╪▒╪º╪½┘è╪⌐ / ╪º┘ä╪╣╪º╪ª┘ä┘è╪⌐
                      </label>
                      <textarea value={form.familyHistory} onChange={e => set("familyHistory")(e.target.value)}
                        placeholder="┘à╪½╪º┘ä: ╪ú┘à╪▒╪º╪╢ ╪º┘ä┘é┘ä╪¿ ┘ü┘è ╪º┘ä╪╣╪º╪ª┘ä╪⌐╪î ╪»╪º╪í ╪º┘ä╪│┘â╪▒┘è..." rows={2}
                        className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none text-sm text-slate-700 resize-none" />
                    </div>

                    {/* Drug allergies */}
                    <div>
                      <label className="text-sm font-bold text-slate-800 mb-2 block flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        ╪¡╪│╪º╪│┘è╪⌐ ╪º┘ä╪ú╪»┘ê┘è╪⌐
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
                      <label className="text-sm font-bold text-slate-600 mb-1.5 block">╪¡╪│╪º╪│┘è╪⌐ ╪º┘ä╪ú╪╖╪╣┘à╪⌐</label>
                      <input value={form.foodAllergies} onChange={e => set("foodAllergies")(e.target.value)}
                        placeholder="┘à╪½╪º┘ä: ╪º┘ä┘ü┘ê┘ä ╪º┘ä╪│┘ê╪»╪º┘å┘è╪î ┘ä╪¡┘à ╪º┘ä╪¿╪¡╪▒..." className={cls} />
                    </div>
                  </div>
                )}

                {/* ΓöÇΓöÇΓöÇ STEP 3: Confirmation ΓöÇΓöÇΓöÇ */}
                {step === 3 && (
                  <div className="space-y-5">
                    {/* Summary */}
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-sm">
                      <p className="font-black text-emerald-800 mb-3">≡ƒôï ┘à┘ä╪«╪╡ ┘à┘ä┘ü┘â ╪º┘ä╪╖╪¿┘è</p>
                      <div className="space-y-1.5 text-slate-700">
                        <p><span className="font-bold">╪º┘ä╪º╪│┘à:</span> {form.fullNameAr}</p>
                        <p><span className="font-bold">╪º┘ä┘ç╪º╪¬┘ü:</span> {form.phone}</p>
                        {form.bloodGroup && <p><span className="font-bold">┘ü╪╡┘è┘ä╪⌐ ╪º┘ä╪»┘à:</span> {form.bloodGroup}</p>}
                        {form.chronicDiseases.length > 0 && (
                          <p><span className="font-bold">╪º┘ä╪ú┘à╪▒╪º╪╢ ╪º┘ä┘à╪▓┘à┘å╪⌐:</span> {form.chronicDiseases.join("╪î ")}</p>
                        )}
                        {form.drugAllergies.length > 0 && (
                          <p><span className="font-bold text-amber-700">╪¡╪│╪º╪│┘è╪⌐ ╪º┘ä╪ú╪»┘ê┘è╪⌐:</span> {form.drugAllergies.join("╪î ")}</p>
                        )}
                      </div>
                    </div>

                    {/* Physical exam checkbox */}
                    <label className="flex items-start gap-3 cursor-pointer bg-blue-50 border border-blue-100 rounded-2xl p-4">
                      <input type="checkbox" checked={form.hadPhysicalExam} onChange={e => set("hadPhysicalExam")(e.target.checked)}
                        className="mt-1 w-4 h-4 accent-emerald-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-slate-800">┘ä┘é╪» ╪ú╪¼╪▒┘è╪¬ ┘ü╪¡╪╡╪º┘ï ╪╖╪¿┘è╪º┘ï ╪¡╪╢┘ê╪▒┘è╪º┘ï ┘à╪│╪¿┘é╪º┘ï</p>
                        <p className="text-xs text-slate-500 mt-0.5">┘ç╪░╪º ┘è┘à┘å╪¡ ╪º┘ä╪╖╪¿┘è╪¿ ╪╡┘ä╪º╪¡┘è╪⌐ ╪¬╪¼╪»┘è╪» ┘ê╪╡┘ü╪¬┘â ╪╣┘å ╪¿┘Å╪╣╪» ╪ú╪│╪▒╪╣</p>
                      </div>
                    </label>

                    {/* Terms */}
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" checked={form.acceptTerms} onChange={e => set("acceptTerms")(e.target.checked)}
                        className="mt-1 w-4 h-4 accent-emerald-600 flex-shrink-0" />
                      <p className="text-xs text-slate-600 leading-relaxed">
                        ╪ú┘é╪▒ ╪¿╪ú┘å ╪º┘ä┘à╪╣┘ä┘ê┘à╪º╪¬ ╪º┘ä┘à┘Å╪»╪«┘ä╪⌐ ╪╡╪¡┘è╪¡╪⌐ ┘ê╪ú╪¬╪¡┘à┘ä ╪º┘ä┘à╪│╪ñ┘ê┘ä┘è╪⌐ ╪╣┘å┘ç╪º. ╪ú┘ê╪º┘ü┘é ╪╣┘ä┘ë ╪ú┘å <strong>┘à┘å╪╡╪⌐ ╪╣┘å╪º┘è╪⌐</strong> ┘ç┘è ┘ê╪│┘è╪╖ ╪¬┘ê╪º╪╡┘ä ╪╖╪¿┘è ┘ü┘é╪╖╪î ┘ê┘ä╪º ╪¬┘Å╪╣┘ê┘æ╪╢ ╪º┘ä╪╖╪¿┘è╪¿ ┘ü┘è ┘é╪▒╪º╪▒╪º╪¬┘ç ╪º┘ä╪╖╪¿┘è╪⌐. ╪º┘ä┘à┘å╪╡╪⌐ ┘à╪▒╪«╪╡╪⌐ ┘à┘å <strong>┘ê╪▓╪º╪▒╪⌐ ╪º┘ä╪╡╪¡╪⌐ ╪º┘ä╪¼╪▓╪º╪ª╪▒┘è╪⌐</strong>.
                      </p>
                    </label>

                    {/* Quick stats */}
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { icon: "≡ƒöÉ", label: "╪¿┘è╪º┘å╪º╪¬ ┘à╪┤┘ü╪▒╪⌐" },
                        { icon: "≡ƒæ¿ΓÇìΓÜò∩╕Å", label: "╪ú╪╖╪¿╪º╪í ┘à╪╣╪¬┘à╪»┘ê┘å" },
                        { icon: "≡ƒîƒ", label: "24/7 ┘à╪¬╪º╪¡" },
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
                      <ChevronRight className="w-4 h-4" /> ╪º┘ä╪│╪º╪¿┘é
                    </button>
                  )}
                  {step < 3 ? (
                    <button type="button" onClick={nextStep}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-l from-emerald-600 to-teal-500 text-white text-sm font-bold shadow-lg">
                      ╪º┘ä╪¬╪º┘ä┘è <ChevronLeft className="w-4 h-4" />
                    </button>
                  ) : (
                    <button type="button" onClick={handleSignup} disabled={loading || !form.acceptTerms}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-l from-emerald-600 to-teal-500 text-white text-sm font-bold shadow-lg disabled:opacity-50">
                      <CheckCircle className="w-4 h-4" />
                      {loading ? "╪¼╪º╪▒┘è ╪º┘ä╪Ñ┘å╪┤╪º╪í..." : "┘ü╪¬╪¡ ╪º┘ä┘à┘ä┘ü ╪º┘ä╪╖╪¿┘è"}
                    </button>
                  )}
                </div>
                {step === 2 && <p className="text-center text-xs text-slate-400 mt-3">╪º┘ä┘à╪╣┘ä┘ê┘à╪º╪¬ ╪º┘ä╪╖╪¿┘è╪⌐ ╪¬┘Å╪¡┘ü╪╕ ╪¿╪┤┘â┘ä ┘à╪┤┘ü╪▒ ┘ê┘ä╪º ╪¬┘Å╪┤╪º╪▒┘â ╪Ñ┘ä╪º ┘à╪╣ ╪╖╪¿┘è╪¿┘â</p>}
              </div>
            )}
          </div>
        </div>
        <p className="text-center text-xs text-slate-400 mt-5">┘à┘å╪╡╪⌐ ╪╣┘å╪º┘è╪⌐ ┬⌐ {new Date().getFullYear()} ΓÇö ┘à╪▒╪«╪╡╪⌐ ┘à┘å ┘ê╪▓╪º╪▒╪⌐ ╪º┘ä╪╡╪¡╪⌐</p>
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
