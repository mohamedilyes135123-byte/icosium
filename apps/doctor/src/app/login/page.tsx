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

// ─── Types ────────────────────────────────────────────────────────────────────
type Step = 1 | 2 | 3;

interface SignupFormData {
  // Step 1 — Required
  fullNameAr: string;
  fullNameFr: string;
  email: string;
  password: string;
  phone: string;
  // Step 2 — Optional / Professional
  dateOfBirth: string;
  nationalId: string;
  specialty: string;
  licenseNumber: string;
  workplaceAddress: string;
  yearsOfExperience: string;
  // Step 3 — Optional / Payment & Agreements
  ccp: string;
  acceptTerms: boolean;
  acceptPlatformRules: boolean;
}

const SPECIALTIES = [
  "طب عام",
  "طب الأطفال",
  "أمراض القلب والأوعية الدموية",
  "طب الجهاز الهضمي",
  "طب الأعصاب",
  "طب العيون",
  "طب الأنف والأذن والحنجرة",
  "أمراض الجلد",
  "طب العظام والمفاصل",
  "الطب النفسي",
  "أمراض النساء والتوليد",
  "طب الطوارئ",
  "الجراحة العامة",
  "طب الأسنان",
  "علم الأشعة",
  "أمراض الكلى",
  "أمراض الرئة",
  "الغدد الصماء",
  "طب الأورام",
  "أخرى",
];

// ─── Sub-components ───────────────────────────────────────────────────────────

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
        {!required && <span className="text-slate-400 text-xs font-normal mr-1">(اختياري)</span>}
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
        {!required && <span className="text-slate-400 text-xs font-normal mr-1">(اختياري)</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full h-12 px-4 bg-slate-50/80 border border-slate-200 rounded-xl 
          focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all 
          text-right text-slate-800 text-sm appearance-none cursor-pointer"
      >
        <option value="">-- اختر التخصص --</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

// ─── Step Indicators ──────────────────────────────────────────────────────────
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

// ─── Main Component ───────────────────────────────────────────────────────────
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

  // ── Login ──────────────────────────────────────────────────────────────────
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
        setError("لم يتم رفع البيانات (Seed). جرب إدخالها يدوياً.");
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
      setError("فشل تسجيل الدخول. تأكد من البريد وكلمة المرور.");
      setLoading(false);
      return;
    }

    const userRole = data?.user?.user_metadata?.role;
    if (userRole === "doctor") {
      router.push("/dashboard");
    } else {
      setError("يرجى التأكد من الدخول من البوابة المخصصة لدورك.");
      setLoading(false);
    }
  };

  // ── Signup final submit ────────────────────────────────────────────────────
  const handleSignup = async () => {
    if (!form.acceptTerms || !form.acceptPlatformRules) {
      setError("يجب الموافقة على الشروط لإتمام التسجيل.");
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

    setSuccessMsg("🎉 تم إنشاء حسابك بنجاح! قم بتأكيد بريدك الإلكتروني ثم سجّل الدخول.");
    setIsLogin(true);
    setStep(1);
    setLoading(false);
  };

  // ── Step navigation ────────────────────────────────────────────────────────
  const nextStep = () => {
    if (step === 1) {
      if (!form.fullNameAr || !form.email || !form.password || !form.phone) {
        setError("يرجى ملء جميع الحقول الإلزامية (الاسم، الإيميل، كلمة المرور، رقم الهاتف).");
        return;
      }
      if (form.password.length < 6) {
        setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل.");
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

  // ── Render ─────────────────────────────────────────────────────────────────
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
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">عناية</h1>
          <p className="text-blue-600 font-semibold text-sm mt-1">طبيبك في بيتك — بوابة الأطباء</p>
          <p className="text-slate-400 text-xs mt-1">
            منصة مرخصة من وزارة الصحة الجزائرية
            <BadgeCheck className="inline-block w-3.5 h-3.5 text-blue-500 mx-1" />
          </p>
        </div>

        {/* ── PANEL ─────────────────────────────────────────────────── */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-slate-200/60 border border-white/60 overflow-hidden">

          {/* Toggle tabs */}
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => { setIsLogin(true); setError(null); setStep(1); }}
              className={`flex-1 py-4 text-sm font-bold transition-colors ${isLogin ? "text-blue-700 border-b-2 border-blue-600 bg-blue-50/50" : "text-slate-500 hover:text-slate-700"}`}
            >
              تسجيل الدخول
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(null); setStep(1); }}
              className={`flex-1 py-4 text-sm font-bold transition-colors ${!isLogin ? "text-blue-700 border-b-2 border-blue-600 bg-blue-50/50" : "text-slate-500 hover:text-slate-700"}`}
            >
              إنشاء حساب جديد
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

            {/* ── LOGIN FORM ─────────────────────────────────────────── */}
            {isLogin && (
              <form onSubmit={handleLogin} className="space-y-4">
                <InputField
                  icon={<Mail className="w-4 h-4" />}
                  label="البريد الإلكتروني"
                  placeholder="doctor@example.com"
                  value={loginEmail}
                  onChange={setLoginEmail}
                  type="email"
                  required
                />
                <InputField
                  icon={<Lock className="w-4 h-4" />}
                  label="كلمة المرور"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={setLoginPassword}
                  type="password"
                  required
                />
                <button type="button" className="text-xs text-blue-500 hover:underline w-full text-right mt-1">
                  نسيت كلمة المرور؟
                </button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl text-base font-bold bg-gradient-to-l from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-lg shadow-blue-500/30 mt-2"
                >
                  {loading ? "جاري التحقق..." : "دخول العيادة الرقمية →"}
                </Button>
                <p className="text-center text-xs text-slate-400 mt-4">
                  محمي بتشفير AES-256 · Supabase Auth
                </p>
              </form>
            )}

            {/* ── SIGNUP FLOW ────────────────────────────────────────── */}
            {!isLogin && (
              <div>
                {/* Step indicator — RTL: Step 1 right, Step 3 left */}
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
                    <h2 className="font-bold text-slate-800 text-lg">المعلومات الأساسية</h2>
                    <p className="text-slate-500 text-xs mt-1">الحقول المطلوبة لإنشاء حسابك</p>
                  </>}
                  {step === 2 && <>
                    <h2 className="font-bold text-slate-800 text-lg">الملف المهني</h2>
                    <p className="text-slate-500 text-xs mt-1">معلومات إضافية لتعزيز ظهورك ومصداقيتك <span className="text-blue-500">(اختيارية)</span></p>
                  </>}
                  {step === 3 && <>
                    <h2 className="font-bold text-slate-800 text-lg">التأكيد والشروط</h2>
                    <p className="text-slate-500 text-xs mt-1">معلومات الدفع والموافقة على بنود المنصة</p>
                  </>}
                </div>

                {/* ── STEP 1 ─────────────────────────────────────────── */}
                {step === 1 && (
                  <div className="space-y-4">
                    <InputField
                      icon={<User className="w-4 h-4" />}
                      label="الاسم الكامل بالعربية"
                      placeholder="د. محمد بن علي"
                      value={form.fullNameAr}
                      onChange={set("fullNameAr")}
                      required
                    />
                    <InputField
                      icon={<Globe className="w-4 h-4" />}
                      label="الاسم الكامل بالفرنسية"
                      placeholder="Dr. Mohamed Ben Ali"
                      value={form.fullNameFr}
                      onChange={set("fullNameFr")}
                    />
                    <InputField
                      icon={<Mail className="w-4 h-4" />}
                      label="البريد الإلكتروني"
                      placeholder="doctor@example.com"
                      value={form.email}
                      onChange={set("email")}
                      type="email"
                      required
                    />
                    <InputField
                      icon={<Lock className="w-4 h-4" />}
                      label="كلمة المرور"
                      placeholder="6 أحرف على الأقل"
                      value={form.password}
                      onChange={set("password")}
                      type="password"
                      required
                    />
                    <InputField
                      icon={<Phone className="w-4 h-4" />}
                      label="رقم الهاتف"
                      placeholder="+213 6XX XX XX XX"
                      value={form.phone}
                      onChange={set("phone")}
                      type="tel"
                      required
                    />
                  </div>
                )}

                {/* ── STEP 2 ─────────────────────────────────────────── */}
                {step === 2 && (
                  <div className="space-y-4">
                    <SelectField
                      label="التخصص الطبي"
                      value={form.specialty}
                      onChange={set("specialty")}
                      options={SPECIALTIES}
                    />
                    <InputField
                      icon={<Award className="w-4 h-4" />}
                      label="رقم التسجيل في نقابة الأطباء"
                      placeholder="ONMC-XXXXX"
                      value={form.licenseNumber}
                      onChange={set("licenseNumber")}
                    />
                    <InputField
                      icon={<Calendar className="w-4 h-4" />}
                      label="تاريخ الميلاد"
                      placeholder="YYYY-MM-DD"
                      value={form.dateOfBirth}
                      onChange={set("dateOfBirth")}
                      type="date"
                    />
                    <InputField
                      icon={<CreditCard className="w-4 h-4" />}
                      label="رقم بطاقة التعريف الوطنية"
                      placeholder="XXXXXXXXXX"
                      value={form.nationalId}
                      onChange={set("nationalId")}
                    />
                    <InputField
                      icon={<Building2 className="w-4 h-4" />}
                      label="مكان العمل / العيادة"
                      placeholder="عيادة دكتور ...، شارع ..."
                      value={form.workplaceAddress}
                      onChange={set("workplaceAddress")}
                    />
                    <InputField
                      icon={<Stethoscope className="w-4 h-4" />}
                      label="سنوات الخبرة"
                      placeholder="عدد سنوات الخبرة"
                      value={form.yearsOfExperience}
                      onChange={set("yearsOfExperience")}
                      type="number"
                    />

                    {/* Document upload hint */}
                    <div className="rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/40 p-4 flex flex-col items-center gap-2 text-center">
                      <Upload className="w-6 h-6 text-blue-400" />
                      <p className="text-xs text-slate-600 font-semibold">رفع شهادة الدكتوراه / شهادة العمل</p>
                      <p className="text-xs text-slate-400">
                        اختياري الآن — يمكن إضافتها لاحقاً من الإعدادات لتفعيل الوصفة الإلكترونية الكاملة
                      </p>
                      <button
                        type="button"
                        className="mt-1 text-xs bg-blue-100 text-blue-700 font-bold px-4 py-2 rounded-xl hover:bg-blue-200 transition-colors"
                      >
                        رفع الملفات (قريباً)
                      </button>
                    </div>
                  </div>
                )}

                {/* ── STEP 3 ─────────────────────────────────────────── */}
                {step === 3 && (
                  <div className="space-y-5">
                    <InputField
                      icon={<CreditCard className="w-4 h-4" />}
                      label="رقم حساب CCP / بريد موب"
                      placeholder="رقم CCP أو بريد موب للمدفوعات"
                      value={form.ccp}
                      onChange={set("ccp")}
                    />

                    {/* Info box */}
                    <div className="bg-blue-50 rounded-2xl p-4 text-xs text-slate-600 text-right space-y-1.5 border border-blue-100">
                      <p className="font-bold text-blue-800 text-sm">ℹ️ كيف تعمل المنصة؟</p>
                      <p>• المريض يدفع للحصول على الوصفة أو نتائج التحاليل</p>
                      <p>• المنصة تحصل على عمولة حسب باقتك</p>
                      <p>• يُشترط رقم CCP لاستلام مدفوعاتك</p>
                      <p className="text-slate-400 mt-2">يمكن إضافة رقم الحساب لاحقاً من إعداداتك</p>
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
                          أنا <strong>المصرح</strong> مسؤول شخصياً عن صحة المعلومات المُدخلة، وأقرّ بأن <strong>منصة عناية</strong> هي وسيط تواصل طبي ولا تُعوّض الطبيب في قراراته الطبية.
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
                          أوافق على شروط وأحكام المنصة وتسعيرات الخدمات. أقرّ بأن <strong>منصة عناية</strong> مرخصة من <strong>وزارة الصحة الجزائرية</strong> وأعمل في إطارها القانوني.
                        </span>
                      </label>
                    </div>

                    {/* Feature summary */}
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {[
                        { icon: "🤖", label: "ذكاء اصطناعي" },
                        { icon: "🖋️", label: "توقيع عن بُعد" },
                        { icon: "📋", label: "وصفة إلكترونية" },
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
                      السابق
                    </button>
                  )}
                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-l from-blue-600 to-cyan-500 text-white text-sm font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all"
                    >
                      التالي
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSignup}
                      disabled={loading || !form.acceptTerms || !form.acceptPlatformRules}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-l from-blue-600 to-cyan-500 text-white text-sm font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "جاري الإنشاء..." : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          إنشاء الحساب
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Step 2 skip hint */}
                {step === 2 && (
                  <p className="text-center text-xs text-slate-400 mt-3">
                    يمكنك تخطي هذه الخطوة وإكمالها لاحقاً من ملفك الشخصي
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-slate-400 mt-5">
          محمي بتشفير AES-256 · Supabase Auth · منصة عناية © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
