"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  Activity, Mail, Lock, User, Phone, Calendar, FileText,
  Stethoscope, Award, ChevronLeft, ChevronRight, CreditCard,
  CheckCircle, BadgeCheck, Globe, Building2, Upload, X
} from "lucide-react";
import { Button } from "@/components/ui/Button";

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type Step = 1 | 2 | 3;

interface SignupFormData {
  // Step 1 â€” Required
  fullNameAr: string;
  fullNameFr: string;
  email: string;
  password: string;
  phone: string;
  // Step 2 â€” Optional / Professional
  dateOfBirth: string;
  nationalId: string;
  specialty: string;
  licenseNumber: string;
  workplaceAddress: string;
  yearsOfExperience: string;
  // Step 3 â€” Optional / Payment & Agreements
  ccp: string;
  acceptTerms: boolean;
  acceptPlatformRules: boolean;
}

const SPECIALTIES = [
  "Ø·Ø¨ Ø¹Ø§Ù…",
  "Ø·Ø¨ Ø§Ù„Ø£Ø·ÙØ§Ù„",
  "Ø£Ù…Ø±Ø§Ø¶ Ø§Ù„Ù‚Ù„Ø¨ ÙˆØ§Ù„Ø£ÙˆØ¹ÙŠØ© Ø§Ù„Ø¯Ù…ÙˆÙŠØ©",
  "Ø·Ø¨ Ø§Ù„Ø¬Ù‡Ø§Ø² Ø§Ù„Ù‡Ø¶Ù…ÙŠ",
  "Ø·Ø¨ Ø§Ù„Ø£Ø¹ØµØ§Ø¨",
  "Ø·Ø¨ Ø§Ù„Ø¹ÙŠÙˆÙ†",
  "Ø·Ø¨ Ø§Ù„Ø£Ù†Ù ÙˆØ§Ù„Ø£Ø°Ù† ÙˆØ§Ù„Ø­Ù†Ø¬Ø±Ø©",
  "Ø£Ù…Ø±Ø§Ø¶ Ø§Ù„Ø¬Ù„Ø¯",
  "Ø·Ø¨ Ø§Ù„Ø¹Ø¸Ø§Ù… ÙˆØ§Ù„Ù…ÙØ§ØµÙ„",
  "Ø§Ù„Ø·Ø¨ Ø§Ù„Ù†ÙØ³ÙŠ",
  "Ø£Ù…Ø±Ø§Ø¶ Ø§Ù„Ù†Ø³Ø§Ø¡ ÙˆØ§Ù„ØªÙˆÙ„ÙŠØ¯",
  "Ø·Ø¨ Ø§Ù„Ø·ÙˆØ§Ø±Ø¦",
  "Ø§Ù„Ø¬Ø±Ø§Ø­Ø© Ø§Ù„Ø¹Ø§Ù…Ø©",
  "Ø·Ø¨ Ø§Ù„Ø£Ø³Ù†Ø§Ù†",
  "Ø¹Ù„Ù… Ø§Ù„Ø£Ø´Ø¹Ø©",
  "Ø£Ù…Ø±Ø§Ø¶ Ø§Ù„ÙƒÙ„Ù‰",
  "Ø£Ù…Ø±Ø§Ø¶ Ø§Ù„Ø±Ø¦Ø©",
  "Ø§Ù„ØºØ¯Ø¯ Ø§Ù„ØµÙ…Ø§Ø¡",
  "Ø·Ø¨ Ø§Ù„Ø£ÙˆØ±Ø§Ù…",
  "Ø£Ø®Ø±Ù‰",
];

// â”€â”€â”€ Sub-components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function InputField({
  icon, label, placeholder, value, onChange, type = "text", required = false, children
}: {
  icon?: React.ReactNode;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-slate-600 text-right">
        {label} {required && <span className="text-rose-500">*</span>}
        {!required && <span className="text-slate-400 text-xs font-normal mr-1">(Ø§Ø®ØªÙŠØ§Ø±ÙŠ)</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={`w-full h-12 bg-slate-50/80 border border-slate-200 rounded-xl 
            focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all 
            text-right text-slate-800 placeholder:text-slate-400 text-sm
            ${icon ? "pr-10 pl-4" : "px-4"}`}
        />
        {children}
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, required = false, options }: {
  label: string; value: string; onChange: (v: string) => void; required?: boolean; options: string[]
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-slate-600 text-right">
        {label} {required && <span className="text-rose-500">*</span>}
        {!required && <span className="text-slate-400 text-xs font-normal mr-1">(Ø§Ø®ØªÙŠØ§Ø±ÙŠ)</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full h-12 px-4 bg-slate-50/80 border border-slate-200 rounded-xl 
          focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all 
          text-right text-slate-800 text-sm appearance-none cursor-pointer"
      >
        <option value="">-- Ø§Ø®ØªØ± Ø§Ù„ØªØ®ØµØµ --</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

// â”€â”€â”€ Step Indicators â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function StepIndicator({ step, current }: { step: number; current: Step }) {
  const isCompleted = current > step;
  const isActive = current === step;
  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300
      ${isCompleted ? "bg-blue-600 border-blue-600 text-white" :
        isActive ? "bg-white border-blue-600 text-blue-600 shadow-md shadow-blue-200" :
          "bg-white border-slate-200 text-slate-400"}`}>
      {isCompleted ? <CheckCircle className="w-5 h-5" /> : step}
    </div>
  );
}

// â”€â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup state
  const [form, setForm] = useState<SignupFormData>({
    fullNameAr: "", fullNameFr: "", email: "", password: "", phone: "",
    dateOfBirth: "", nationalId: "", specialty: "", licenseNumber: "",
    workplaceAddress: "", yearsOfExperience: "",
    ccp: "", acceptTerms: false, acceptPlatformRules: false,
  });

  const router = useRouter();
  const supabase = createClient();

  const set = (field: keyof SignupFormData) => (value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // â”€â”€ Login â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Debug bypass
    if (loginPassword === "1" && loginEmail === "1") {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: "doctor@3inaya.com",
        password: "123456",
      });
      if (authError) {
        setError("Ù„Ù… ÙŠØªÙ… Ø±ÙØ¹ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª (Seed). Ø¬Ø±Ø¨ Ø¥Ø¯Ø®Ø§Ù„Ù‡Ø§ ÙŠØ¯ÙˆÙŠØ§Ù‹.");
        setLoading(false);
        return;
      }
      document.cookie = `testing_bypass=doctor; path=/; max-age=86400`;
      window.location.href = `/dashboard`;
      return;
    }

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (authError) {
      setError("ÙØ´Ù„ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„. ØªØ£ÙƒØ¯ Ù…Ù† Ø§Ù„Ø¨Ø±ÙŠØ¯ ÙˆÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±.");
      setLoading(false);
      return;
    }

    const userRole = data?.user?.user_metadata?.role;
    if (userRole === "doctor") {
      router.push("/dashboard");
    } else {
      setError("ÙŠØ±Ø¬Ù‰ Ø§Ù„ØªØ£ÙƒØ¯ Ù…Ù† Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù…Ù† Ø§Ù„Ø¨ÙˆØ§Ø¨Ø© Ø§Ù„Ù…Ø®ØµØµØ© Ù„Ø¯ÙˆØ±Ùƒ.");
      setLoading(false);
    }
  };

  // â”€â”€ Signup final submit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleSignup = async () => {
    if (!form.acceptTerms || !form.acceptPlatformRules) {
      setError("ÙŠØ¬Ø¨ Ø§Ù„Ù…ÙˆØ§ÙÙ‚Ø© Ø¹Ù„Ù‰ Ø§Ù„Ø´Ø±ÙˆØ· Ù„Ø¥ØªÙ…Ø§Ù… Ø§Ù„ØªØ³Ø¬ÙŠÙ„.");
      return;
    }
    setLoading(true);
    setError(null);

    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.fullNameAr || form.fullNameFr,
          full_name_ar: form.fullNameAr,
          full_name_fr: form.fullNameFr,
          role: "doctor",
          phone: form.phone,
          specialty: form.specialty || null,
          license_number: form.licenseNumber || null,
          date_of_birth: form.dateOfBirth || null,
          national_id: form.nationalId || null,
          workplace_address: form.workplaceAddress || null,
          years_of_experience: form.yearsOfExperience || null,
          ccp: form.ccp || null,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setSuccessMsg("ðŸŽ‰ ØªÙ… Ø¥Ù†Ø´Ø§Ø¡ Ø­Ø³Ø§Ø¨Ùƒ Ø¨Ù†Ø¬Ø§Ø­! Ù‚Ù… Ø¨ØªØ£ÙƒÙŠØ¯ Ø¨Ø±ÙŠØ¯Ùƒ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ Ø«Ù… Ø³Ø¬Ù‘Ù„ Ø§Ù„Ø¯Ø®ÙˆÙ„.");
    setIsLogin(true);
    setStep(1);
    setLoading(false);
  };

  // â”€â”€ Step navigation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const nextStep = () => {
    if (step === 1) {
      if (!form.fullNameAr || !form.email || !form.password || !form.phone) {
        setError("ÙŠØ±Ø¬Ù‰ Ù…Ù„Ø¡ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø­Ù‚ÙˆÙ„ Ø§Ù„Ø¥Ù„Ø²Ø§Ù…ÙŠØ© (Ø§Ù„Ø§Ø³Ù…ØŒ Ø§Ù„Ø¥ÙŠÙ…ÙŠÙ„ØŒ ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±ØŒ Ø±Ù‚Ù… Ø§Ù„Ù‡Ø§ØªÙ).");
        return;
      }
      if (form.password.length < 6) {
        setError("ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± ÙŠØ¬Ø¨ Ø£Ù† ØªÙƒÙˆÙ† 6 Ø£Ø­Ø±Ù Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„.");
        return;
      }
    }
    setError(null);
    setStep((prev) => (prev < 3 ? ((prev + 1) as Step) : prev));
  };

  const prevStep = () => {
    setError(null);
    setStep((prev) => (prev > 1 ? ((prev - 1) as Step) : prev));
  };

  // â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" dir="rtl">
      {/* Animated background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-blue-200/40 rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-cyan-200/30 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/40 to-white" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Logo header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-cyan-500 shadow-2xl shadow-blue-500/40 mb-4">
            <Stethoscope className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Ø¹Ù†Ø§ÙŠØ©</h1>
          <p className="text-blue-600 font-semibold text-sm mt-1">Ø·Ø¨ÙŠØ¨Ùƒ ÙÙŠ Ø¨ÙŠØªÙƒ â€” Ø¨ÙˆØ§Ø¨Ø© Ø§Ù„Ø£Ø·Ø¨Ø§Ø¡</p>
          <p className="text-slate-400 text-xs mt-1">
            Ù…Ù†ØµØ© Ù…Ø±Ø®ØµØ© Ù…Ù† ÙˆØ²Ø§Ø±Ø© Ø§Ù„ØµØ­Ø© Ø§Ù„Ø¬Ø²Ø§Ø¦Ø±ÙŠØ©
            <BadgeCheck className="inline-block w-3.5 h-3.5 text-blue-500 mx-1" />
          </p>
        </div>

        {/* â”€â”€ PANEL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-slate-200/60 border border-white/60 overflow-hidden">

          {/* Toggle tabs */}
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => { setIsLogin(true); setError(null); setStep(1); }}
              className={`flex-1 py-4 text-sm font-bold transition-colors ${isLogin ? "text-blue-700 border-b-2 border-blue-600 bg-blue-50/50" : "text-slate-500 hover:text-slate-700"}`}
            >
              ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(null); setStep(1); }}
              className={`flex-1 py-4 text-sm font-bold transition-colors ${!isLogin ? "text-blue-700 border-b-2 border-blue-600 bg-blue-50/50" : "text-slate-500 hover:text-slate-700"}`}
            >
              Ø¥Ù†Ø´Ø§Ø¡ Ø­Ø³Ø§Ø¨ Ø¬Ø¯ÙŠØ¯
            </button>
          </div>

          <div className="p-7">
            {/* Alerts */}
            {successMsg && (
              <div className="flex items-start gap-3 bg-emerald-50 text-emerald-700 p-4 rounded-2xl text-sm font-semibold mb-5 border border-emerald-200">
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}
            {error && (
              <div className="flex items-start gap-3 bg-rose-50 text-rose-700 p-4 rounded-2xl text-sm font-semibold mb-5 border border-rose-200">
                <X className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* â”€â”€ LOGIN FORM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            {isLogin && (
              <form onSubmit={handleLogin} className="space-y-4">
                <InputField
                  icon={<Mail className="w-4 h-4" />}
                  label="Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ"
                  placeholder="doctor@example.com"
                  value={loginEmail}
                  onChange={setLoginEmail}
                  type="email"
                  required
                />
                <InputField
                  icon={<Lock className="w-4 h-4" />}
                  label="ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±"
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  value={loginPassword}
                  onChange={setLoginPassword}
                  type="password"
                  required
                />
                <button type="button" className="text-xs text-blue-500 hover:underline w-full text-right mt-1">
                  Ù†Ø³ÙŠØª ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±ØŸ
                </button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl text-base font-bold bg-gradient-to-l from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-lg shadow-blue-500/30 mt-2"
                >
                  {loading ? "Ø¬Ø§Ø±ÙŠ Ø§Ù„ØªØ­Ù‚Ù‚..." : "Ø¯Ø®ÙˆÙ„ Ø§Ù„Ø¹ÙŠØ§Ø¯Ø© Ø§Ù„Ø±Ù‚Ù…ÙŠØ© â†’"}
                </Button>
                <p className="text-center text-xs text-slate-400 mt-4">
                  Ù…Ø­Ù…ÙŠ Ø¨ØªØ´ÙÙŠØ± AES-256 Â· Supabase Auth
                </p>
              </form>
            )}

            {/* â”€â”€ SIGNUP FLOW â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            {!isLogin && (
              <div>
                {/* Step indicator â€” RTL: Step 1 right, Step 3 left */}
                <div className="flex flex-row-reverse items-center justify-center gap-3 mb-7">
                  <StepIndicator step={1} current={step} />
                  <div className={`h-0.5 w-12 rounded transition-all ${step > 1 ? "bg-blue-500" : "bg-slate-200"}`} />
                  <StepIndicator step={2} current={step} />
                  <div className={`h-0.5 w-12 rounded transition-all ${step > 2 ? "bg-blue-500" : "bg-slate-200"}`} />
                  <StepIndicator step={3} current={step} />
                </div>

                {/* Step titles */}
                <div className="text-center mb-5">
                  {step === 1 && <>
                    <h2 className="font-bold text-slate-800 text-lg">Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ø£Ø³Ø§Ø³ÙŠØ©</h2>
                    <p className="text-slate-500 text-xs mt-1">Ø§Ù„Ø­Ù‚ÙˆÙ„ Ø§Ù„Ù…Ø·Ù„ÙˆØ¨Ø© Ù„Ø¥Ù†Ø´Ø§Ø¡ Ø­Ø³Ø§Ø¨Ùƒ</p>
                  </>}
                  {step === 2 && <>
                    <h2 className="font-bold text-slate-800 text-lg">Ø§Ù„Ù…Ù„Ù Ø§Ù„Ù…Ù‡Ù†ÙŠ</h2>
                    <p className="text-slate-500 text-xs mt-1">Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø¥Ø¶Ø§ÙÙŠØ© Ù„ØªØ¹Ø²ÙŠØ² Ø¸Ù‡ÙˆØ±Ùƒ ÙˆÙ…ØµØ¯Ø§Ù‚ÙŠØªÙƒ <span className="text-blue-500">(Ø§Ø®ØªÙŠØ§Ø±ÙŠØ©)</span></p>
                  </>}
                  {step === 3 && <>
                    <h2 className="font-bold text-slate-800 text-lg">Ø§Ù„ØªØ£ÙƒÙŠØ¯ ÙˆØ§Ù„Ø´Ø±ÙˆØ·</h2>
                    <p className="text-slate-500 text-xs mt-1">Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ø¯ÙØ¹ ÙˆØ§Ù„Ù…ÙˆØ§ÙÙ‚Ø© Ø¹Ù„Ù‰ Ø¨Ù†ÙˆØ¯ Ø§Ù„Ù…Ù†ØµØ©</p>
                  </>}
                </div>

                {/* â”€â”€ STEP 1 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                {step === 1 && (
                  <div className="space-y-4">
                    <InputField
                      icon={<User className="w-4 h-4" />}
                      label="Ø§Ù„Ø§Ø³Ù… Ø§Ù„ÙƒØ§Ù…Ù„ Ø¨Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©"
                      placeholder="Ø¯. Ù…Ø­Ù…Ø¯ Ø¨Ù† Ø¹Ù„ÙŠ"
                      value={form.fullNameAr}
                      onChange={set("fullNameAr")}
                      required
                    />
                    <InputField
                      icon={<Globe className="w-4 h-4" />}
                      label="Ø§Ù„Ø§Ø³Ù… Ø§Ù„ÙƒØ§Ù…Ù„ Ø¨Ø§Ù„ÙØ±Ù†Ø³ÙŠØ©"
                      placeholder="Dr. Mohamed Ben Ali"
                      value={form.fullNameFr}
                      onChange={set("fullNameFr")}
                    />
                    <InputField
                      icon={<Mail className="w-4 h-4" />}
                      label="Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ"
                      placeholder="doctor@example.com"
                      value={form.email}
                      onChange={set("email")}
                      type="email"
                      required
                    />
                    <InputField
                      icon={<Lock className="w-4 h-4" />}
                      label="ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±"
                      placeholder="6 Ø£Ø­Ø±Ù Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„"
                      value={form.password}
                      onChange={set("password")}
                      type="password"
                      required
                    />
                    <InputField
                      icon={<Phone className="w-4 h-4" />}
                      label="Ø±Ù‚Ù… Ø§Ù„Ù‡Ø§ØªÙ"
                      placeholder="+213 6XX XX XX XX"
                      value={form.phone}
                      onChange={set("phone")}
                      type="tel"
                      required
                    />
                  </div>
                )}

                {/* â”€â”€ STEP 2 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                {step === 2 && (
                  <div className="space-y-4">
                    <SelectField
                      label="Ø§Ù„ØªØ®ØµØµ Ø§Ù„Ø·Ø¨ÙŠ"
                      value={form.specialty}
                      onChange={set("specialty")}
                      options={SPECIALTIES}
                    />
                    <InputField
                      icon={<Award className="w-4 h-4" />}
                      label="Ø±Ù‚Ù… Ø§Ù„ØªØ³Ø¬ÙŠÙ„ ÙÙŠ Ù†Ù‚Ø§Ø¨Ø© Ø§Ù„Ø£Ø·Ø¨Ø§Ø¡"
                      placeholder="ONMC-XXXXX"
                      value={form.licenseNumber}
                      onChange={set("licenseNumber")}
                    />
                    <InputField
                      icon={<Calendar className="w-4 h-4" />}
                      label="ØªØ§Ø±ÙŠØ® Ø§Ù„Ù…ÙŠÙ„Ø§Ø¯"
                      placeholder="YYYY-MM-DD"
                      value={form.dateOfBirth}
                      onChange={set("dateOfBirth")}
                      type="date"
                    />
                    <InputField
                      icon={<CreditCard className="w-4 h-4" />}
                      label="Ø±Ù‚Ù… Ø¨Ø·Ø§Ù‚Ø© Ø§Ù„ØªØ¹Ø±ÙŠÙ Ø§Ù„ÙˆØ·Ù†ÙŠØ©"
                      placeholder="XXXXXXXXXX"
                      value={form.nationalId}
                      onChange={set("nationalId")}
                    />
                    <InputField
                      icon={<Building2 className="w-4 h-4" />}
                      label="Ù…ÙƒØ§Ù† Ø§Ù„Ø¹Ù…Ù„ / Ø§Ù„Ø¹ÙŠØ§Ø¯Ø©"
                      placeholder="Ø¹ÙŠØ§Ø¯Ø© Ø¯ÙƒØªÙˆØ± ...ØŒ Ø´Ø§Ø±Ø¹ ..."
                      value={form.workplaceAddress}
                      onChange={set("workplaceAddress")}
                    />
                    <InputField
                      icon={<Stethoscope className="w-4 h-4" />}
                      label="Ø³Ù†ÙˆØ§Øª Ø§Ù„Ø®Ø¨Ø±Ø©"
                      placeholder="Ø¹Ø¯Ø¯ Ø³Ù†ÙˆØ§Øª Ø§Ù„Ø®Ø¨Ø±Ø©"
                      value={form.yearsOfExperience}
                      onChange={set("yearsOfExperience")}
                      type="number"
                    />

                    {/* Document upload hint */}
                    <div className="rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/40 p-4 flex flex-col items-center gap-2 text-center">
                      <Upload className="w-6 h-6 text-blue-400" />
                      <p className="text-xs text-slate-600 font-semibold">Ø±ÙØ¹ Ø´Ù‡Ø§Ø¯Ø© Ø§Ù„Ø¯ÙƒØªÙˆØ±Ø§Ù‡ / Ø´Ù‡Ø§Ø¯Ø© Ø§Ù„Ø¹Ù…Ù„</p>
                      <p className="text-xs text-slate-400">
                        Ø§Ø®ØªÙŠØ§Ø±ÙŠ Ø§Ù„Ø¢Ù† â€” ÙŠÙ…ÙƒÙ† Ø¥Ø¶Ø§ÙØªÙ‡Ø§ Ù„Ø§Ø­Ù‚Ø§Ù‹ Ù…Ù† Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ù„ØªÙØ¹ÙŠÙ„ Ø§Ù„ÙˆØµÙØ© Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠØ© Ø§Ù„ÙƒØ§Ù…Ù„Ø©
                      </p>
                      <button
                        type="button"
                        className="mt-1 text-xs bg-blue-100 text-blue-700 font-bold px-4 py-2 rounded-xl hover:bg-blue-200 transition-colors"
                      >
                        Ø±ÙØ¹ Ø§Ù„Ù…Ù„ÙØ§Øª (Ù‚Ø±ÙŠØ¨Ø§Ù‹)
                      </button>
                    </div>
                  </div>
                )}

                {/* â”€â”€ STEP 3 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                {step === 3 && (
                  <div className="space-y-5">
                    <InputField
                      icon={<CreditCard className="w-4 h-4" />}
                      label="Ø±Ù‚Ù… Ø­Ø³Ø§Ø¨ CCP / Ø¨Ø±ÙŠØ¯ Ù…ÙˆØ¨"
                      placeholder="Ø±Ù‚Ù… CCP Ø£Ùˆ Ø¨Ø±ÙŠØ¯ Ù…ÙˆØ¨ Ù„Ù„Ù…Ø¯ÙÙˆØ¹Ø§Øª"
                      value={form.ccp}
                      onChange={set("ccp")}
                    />

                    {/* Info box */}
                    <div className="bg-blue-50 rounded-2xl p-4 text-xs text-slate-600 text-right space-y-1.5 border border-blue-100">
                      <p className="font-bold text-blue-800 text-sm">â„¹ï¸ ÙƒÙŠÙ ØªØ¹Ù…Ù„ Ø§Ù„Ù…Ù†ØµØ©ØŸ</p>
                      <p>â€¢ Ø§Ù„Ù…Ø±ÙŠØ¶ ÙŠØ¯ÙØ¹ Ù„Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø§Ù„ÙˆØµÙØ© Ø£Ùˆ Ù†ØªØ§Ø¦Ø¬ Ø§Ù„ØªØ­Ø§Ù„ÙŠÙ„</p>
                      <p>â€¢ Ø§Ù„Ù…Ù†ØµØ© ØªØ­ØµÙ„ Ø¹Ù„Ù‰ Ø¹Ù…ÙˆÙ„Ø© Ø­Ø³Ø¨ Ø¨Ø§Ù‚ØªÙƒ</p>
                      <p>â€¢ ÙŠÙØ´ØªØ±Ø· Ø±Ù‚Ù… CCP Ù„Ø§Ø³ØªÙ„Ø§Ù… Ù…Ø¯ÙÙˆØ¹Ø§ØªÙƒ</p>
                      <p className="text-slate-400 mt-2">ÙŠÙ…ÙƒÙ† Ø¥Ø¶Ø§ÙØ© Ø±Ù‚Ù… Ø§Ù„Ø­Ø³Ø§Ø¨ Ù„Ø§Ø­Ù‚Ø§Ù‹ Ù…Ù† Ø¥Ø¹Ø¯Ø§Ø¯Ø§ØªÙƒ</p>
                    </div>

                    {/* Terms checkboxes */}
                    <div className="space-y-3">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={form.acceptTerms}
                          onChange={(e) => set("acceptTerms")(e.target.checked)}
                          className="mt-1 w-4 h-4 rounded accent-blue-600 flex-shrink-0"
                        />
                        <span className="text-xs text-slate-700 leading-relaxed">
                          Ø£Ù†Ø§ <strong>Ø§Ù„Ù…ØµØ±Ø­</strong> Ù…Ø³Ø¤ÙˆÙ„ Ø´Ø®ØµÙŠØ§Ù‹ Ø¹Ù† ØµØ­Ø© Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ù…ÙØ¯Ø®Ù„Ø©ØŒ ÙˆØ£Ù‚Ø±Ù‘ Ø¨Ø£Ù† <strong>Ù…Ù†ØµØ© Ø¹Ù†Ø§ÙŠØ©</strong> Ù‡ÙŠ ÙˆØ³ÙŠØ· ØªÙˆØ§ØµÙ„ Ø·Ø¨ÙŠ ÙˆÙ„Ø§ ØªÙØ¹ÙˆÙ‘Ø¶ Ø§Ù„Ø·Ø¨ÙŠØ¨ ÙÙŠ Ù‚Ø±Ø§Ø±Ø§ØªÙ‡ Ø§Ù„Ø·Ø¨ÙŠØ©.
                        </span>
                      </label>
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={form.acceptPlatformRules}
                          onChange={(e) => set("acceptPlatformRules")(e.target.checked)}
                          className="mt-1 w-4 h-4 rounded accent-blue-600 flex-shrink-0"
                        />
                        <span className="text-xs text-slate-700 leading-relaxed">
                          Ø£ÙˆØ§ÙÙ‚ Ø¹Ù„Ù‰ Ø´Ø±ÙˆØ· ÙˆØ£Ø­ÙƒØ§Ù… Ø§Ù„Ù…Ù†ØµØ© ÙˆØªØ³Ø¹ÙŠØ±Ø§Øª Ø§Ù„Ø®Ø¯Ù…Ø§Øª. Ø£Ù‚Ø±Ù‘ Ø¨Ø£Ù† <strong>Ù…Ù†ØµØ© Ø¹Ù†Ø§ÙŠØ©</strong> Ù…Ø±Ø®ØµØ© Ù…Ù† <strong>ÙˆØ²Ø§Ø±Ø© Ø§Ù„ØµØ­Ø© Ø§Ù„Ø¬Ø²Ø§Ø¦Ø±ÙŠØ©</strong> ÙˆØ£Ø¹Ù…Ù„ ÙÙŠ Ø¥Ø·Ø§Ø±Ù‡Ø§ Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠ.
                        </span>
                      </label>
                    </div>

                    {/* Feature summary */}
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {[
                        { icon: "ðŸ¤–", label: "Ø°ÙƒØ§Ø¡ Ø§ØµØ·Ù†Ø§Ø¹ÙŠ" },
                        { icon: "ðŸ–‹ï¸", label: "ØªÙˆÙ‚ÙŠØ¹ Ø¹Ù† Ø¨ÙØ¹Ø¯" },
                        { icon: "ðŸ“‹", label: "ÙˆØµÙØ© Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠØ©" },
                      ].map(({ icon, label }) => (
                        <div key={label} className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-2.5 text-center border border-blue-100">
                          <div className="text-lg mb-1">{icon}</div>
                          <p className="text-xs font-semibold text-blue-800">{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Navigation buttons */}
                <div className={`flex gap-3 mt-7 ${step === 1 ? "justify-end" : "justify-between"}`}>
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                      Ø§Ù„Ø³Ø§Ø¨Ù‚
                    </button>
                  )}
                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-l from-blue-600 to-cyan-500 text-white text-sm font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all"
                    >
                      Ø§Ù„ØªØ§Ù„ÙŠ
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSignup}
                      disabled={loading || !form.acceptTerms || !form.acceptPlatformRules}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-l from-blue-600 to-cyan-500 text-white text-sm font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Ø¬Ø§Ø±ÙŠ Ø§Ù„Ø¥Ù†Ø´Ø§Ø¡..." : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø­Ø³Ø§Ø¨
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Step 2 skip hint */}
                {step === 2 && (
                  <p className="text-center text-xs text-slate-400 mt-3">
                    ÙŠÙ…ÙƒÙ†Ùƒ ØªØ®Ø·ÙŠ Ù‡Ø°Ù‡ Ø§Ù„Ø®Ø·ÙˆØ© ÙˆØ¥ÙƒÙ…Ø§Ù„Ù‡Ø§ Ù„Ø§Ø­Ù‚Ø§Ù‹ Ù…Ù† Ù…Ù„ÙÙƒ Ø§Ù„Ø´Ø®ØµÙŠ
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-slate-400 mt-5">
          Ù…Ø­Ù…ÙŠ Ø¨ØªØ´ÙÙŠØ± AES-256 Â· Supabase Auth Â· Ù…Ù†ØµØ© Ø¹Ù†Ø§ÙŠØ© Â© {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
