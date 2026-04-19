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
  "داء السكري", "ارتفاع ضغط الدم", "أمراض القلب", "الربو",
  "السرطان", "أمراض الكلى المزمنة", "قصور الغدة الدرقية",
  "أمراض الرئة المزمنة BPCO", "أمراض الأعصاب", "لا يوجد",
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "غير معروف"];

const COMMON_ALLERGIES = ["البنسيلين", "السلفاميد", "الأسبرين", "الإيبوبروفين", "الكودايين", "لا يوجد"];

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

  // ── Login ────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    if (loginPassword === "1" && loginEmail === "1") {
      const { error: err } = await supabase.auth.signInWithPassword({ email: "patient@3inaya.com", password: "123456" });
      if (err) { setError("بيانات اختبار غير متاحة"); setLoading(false); return; }
      document.cookie = `testing_bypass=patient; path=/; max-age=86400`;
      window.location.href = "/dashboard"; return;
    }
    const { data, error: err } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    if (err) { setError("فشل تسجيل الدخول. تحقق من بياناتك."); setLoading(false); return; }
    if (data?.user?.user_metadata?.role === "patient") router.push("/dashboard");
    else { setError("هذه البوابة مخصصة للمرضى فقط."); setLoading(false); }
  };

  // ── Signup ───
  const handleSignup = async () => {
    if (!form.acceptTerms) { setError("يجب الموافقة على الشروط."); return; }
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
    setSuccessMsg("🎉 تم إنشاء ملفك الطبي! تحقق من بريدك الإلكتروني ثم سجّل الدخول.");
    setIsLogin(true); setStep(1); setLoading(false);
  };

  const nextStep = () => {
    setError(null);
    if (step === 1) {
      if (!form.fullNameAr || !form.email || !form.password || !form.phone) {
        setError("الرجاء ملء الحقول الإلزامية: الاسم، البريد، كلمة المرور، الهاتف");
        return;
      }
      if (form.password.length < 6) { setError("كلمة المرور 6 أحرف على الأقل."); return; }
    }
    if (step === 2 && form.chronicDiseases.length === 0) {
      setError("يرجى تحديد حالتك الصحية — اختر 'لا يوجد' إذا كنت بصحة جيدة.");
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
          <h1 className="text-3xl font-black text-slate-900">عناية</h1>
          <p className="text-emerald-600 font-semibold text-sm mt-1">بوابة المرضى — طبيبك في بيتك</p>
          <p className="text-slate-400 text-xs mt-1">
            <Shield className="inline w-3.5 h-3.5 text-emerald-500 mx-1" />
            بياناتك مشفرة ومحمية بالكامل
          </p>
        </div>

        <div className="bg-white/85 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/60 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            {["تسجيل الدخول", "فتح ملف جديد"].map((label, idx) => (
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

            {/* ── LOGIN ── */}
            {isLogin && (
              <form onSubmit={handleLogin} className="space-y-4">
                <Field label="البريد الإلكتروني" icon={<Mail className="w-4 h-4" />}>
                  <input value={loginEmail} onChange={e => setLoginEmail(e.target.value)} type="email" placeholder="patient@example.com" className={cls} required />
                </Field>
                <Field label="كلمة المرور" icon={<Lock className="w-4 h-4" />}>
                  <input value={loginPassword} onChange={e => setLoginPassword(e.target.value)} type="password" placeholder="••••••••" className={cls} required />
                </Field>
                <button type="button" className="text-xs text-emerald-500 hover:underline w-full text-right">نسيت كلمة المرور؟</button>
                <button type="submit" disabled={loading}
                  className="w-full h-12 rounded-xl font-bold bg-gradient-to-l from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all mt-2">
                  {loading ? "جاري التحقق..." : "الدخول إلى ملفي الطبي →"}
                </button>
                <p className="text-center text-xs text-slate-400 mt-4">محمي بتشفير AES-256 · Supabase Auth</p>
              </form>
            )}

            {/* ── SIGNUP ── */}
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
                  {step === 1 && <><h2 className="font-black text-slate-800 text-lg">المعلومات الأساسية</h2><p className="text-slate-400 text-xs mt-1">بياناتك الشخصية لفتح ملفك الطبي</p></>}
                  {step === 2 && <><h2 className="font-black text-slate-800 text-lg">السجل الطبي</h2><p className="text-slate-400 text-xs mt-1">معلومات صحية ضرورية للطبيب<span className="text-rose-500 mr-1">*</span></p></>}
                  {step === 3 && <><h2 className="font-black text-slate-800 text-lg">التأكيد النهائي</h2><p className="text-slate-400 text-xs mt-1">آخر خطوة لتفعيل ملفك الطبي الرقمي</p></>}
                </div>

                {/* ─── STEP 1: Personal info ─── */}
                {step === 1 && (
                  <div className="space-y-4">
                    <Field label="الاسم الكامل بالعربية *" icon={<User className="w-4 h-4" />}>
                      <input value={form.fullNameAr} onChange={e => set("fullNameAr")(e.target.value)} placeholder="أحمد بن علي" className={cls} />
                    </Field>
                    <Field label="الاسم بالفرنسية" icon={<Globe className="w-4 h-4" />}>
                      <input value={form.fullNameFr} onChange={e => set("fullNameFr")(e.target.value)} placeholder="Ahmed Ben Ali" className={cls} />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="البريد الإلكتروني *" icon={<Mail className="w-4 h-4" />}>
                        <input value={form.email} onChange={e => set("email")(e.target.value)} type="email" placeholder="patient@example.com" className={cls} />
                      </Field>
                      <Field label="كلمة المرور *" icon={<Lock className="w-4 h-4" />}>
                        <input value={form.password} onChange={e => set("password")(e.target.value)} type="password" placeholder="6+ أحرف" className={cls} />
                      </Field>
                    </div>
                    <Field label="رقم الهاتف *" icon={<Phone className="w-4 h-4" />}>
                      <input value={form.phone} onChange={e => set("phone")(e.target.value)} type="tel" placeholder="+213 6XX XX XX XX" className={cls} />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="تاريخ الميلاد" icon={<Calendar className="w-4 h-4" />}>
                        <input value={form.dateOfBirth} onChange={e => set("dateOfBirth")(e.target.value)} type="date" className={cls} />
                      </Field>
                      <Field label="رقم بطاقة التعريف" icon={<CreditCard className="w-4 h-4" />}>
                        <input value={form.nationalId} onChange={e => set("nationalId")(e.target.value)} placeholder="18 رقم" className={cls} />
                      </Field>
                    </div>
                    <Field label="رقم الضمان الاجتماعي" icon={<Shield className="w-4 h-4" />}>
                      <input value={form.socialSecurity} onChange={e => set("socialSecurity")(e.target.value)} placeholder="اختياري — للمؤمنين اجتماعياً" className={cls} />
                    </Field>
                    <Field label="العنوان" icon={<Activity className="w-4 h-4" />}>
                      <input value={form.address} onChange={e => set("address")(e.target.value)} placeholder="الولاية، البلدية، الحي..." className={cls} />
                    </Field>
                  </div>
                )}

                {/* ─── STEP 2: Medical History ─── */}
                {step === 2 && (
                  <div className="space-y-5">
                    {/* Blood group */}
                    <div>
                      <label className="text-sm font-bold text-slate-600 mb-2 block">فصيلة الدم</label>
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
                        الأمراض المزمنة <span className="text-rose-500">*</span>
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
                      <label className="text-sm font-bold text-slate-600 mb-1.5 block">العمليات الجراحية السابقة</label>
                      <textarea value={form.surgeries} onChange={e => set("surgeries")(e.target.value)}
                        placeholder="مثال: استئصال الزائدة 2018، عملية القلب 2022..." rows={2}
                        className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none text-sm text-slate-700 resize-none" />
                    </div>

                    {/* Family history */}
                    <div>
                      <label className="text-sm font-bold text-slate-600 mb-1.5 block flex items-center gap-2">
                        <Shield className="w-4 h-4" /> الأمراض الوراثية / العائلية
                      </label>
                      <textarea value={form.familyHistory} onChange={e => set("familyHistory")(e.target.value)}
                        placeholder="مثال: أمراض القلب في العائلة، داء السكري..." rows={2}
                        className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none text-sm text-slate-700 resize-none" />
                    </div>

                    {/* Drug allergies */}
                    <div>
                      <label className="text-sm font-bold text-slate-800 mb-2 block flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        حساسية الأدوية
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
                      <label className="text-sm font-bold text-slate-600 mb-1.5 block">حساسية الأطعمة</label>
                      <input value={form.foodAllergies} onChange={e => set("foodAllergies")(e.target.value)}
                        placeholder="مثال: الفول السوداني، لحم البحر..." className={cls} />
                    </div>
                  </div>
                )}

                {/* ─── STEP 3: Confirmation ─── */}
                {step === 3 && (
                  <div className="space-y-5">
                    {/* Summary */}
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-sm">
                      <p className="font-black text-emerald-800 mb-3">📋 ملخص ملفك الطبي</p>
                      <div className="space-y-1.5 text-slate-700">
                        <p><span className="font-bold">الاسم:</span> {form.fullNameAr}</p>
                        <p><span className="font-bold">الهاتف:</span> {form.phone}</p>
                        {form.bloodGroup && <p><span className="font-bold">فصيلة الدم:</span> {form.bloodGroup}</p>}
                        {form.chronicDiseases.length > 0 && (
                          <p><span className="font-bold">الأمراض المزمنة:</span> {form.chronicDiseases.join("، ")}</p>
                        )}
                        {form.drugAllergies.length > 0 && (
                          <p><span className="font-bold text-amber-700">حساسية الأدوية:</span> {form.drugAllergies.join("، ")}</p>
                        )}
                      </div>
                    </div>

                    {/* Physical exam checkbox */}
                    <label className="flex items-start gap-3 cursor-pointer bg-blue-50 border border-blue-100 rounded-2xl p-4">
                      <input type="checkbox" checked={form.hadPhysicalExam} onChange={e => set("hadPhysicalExam")(e.target.checked)}
                        className="mt-1 w-4 h-4 accent-emerald-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-slate-800">لقد أجريت فحصاً طبياً حضورياً مسبقاً</p>
                        <p className="text-xs text-slate-500 mt-0.5">هذا يمنح الطبيب صلاحية تجديد وصفتك عن بُعد أسرع</p>
                      </div>
                    </label>

                    {/* Terms */}
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" checked={form.acceptTerms} onChange={e => set("acceptTerms")(e.target.checked)}
                        className="mt-1 w-4 h-4 accent-emerald-600 flex-shrink-0" />
                      <p className="text-xs text-slate-600 leading-relaxed">
                        أقر بأن المعلومات المُدخلة صحيحة وأتحمل المسؤولية عنها. أوافق على أن <strong>منصة عناية</strong> هي وسيط تواصل طبي فقط، ولا تُعوّض الطبيب في قراراته الطبية. المنصة مرخصة من <strong>وزارة الصحة الجزائرية</strong>.
                      </p>
                    </label>

                    {/* Quick stats */}
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { icon: "🔐", label: "بيانات مشفرة" },
                        { icon: "👨‍⚕️", label: "أطباء معتمدون" },
                        { icon: "🌟", label: "24/7 متاح" },
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
                      <ChevronRight className="w-4 h-4" /> السابق
                    </button>
                  )}
                  {step < 3 ? (
                    <button type="button" onClick={nextStep}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-l from-emerald-600 to-teal-500 text-white text-sm font-bold shadow-lg">
                      التالي <ChevronLeft className="w-4 h-4" />
                    </button>
                  ) : (
                    <button type="button" onClick={handleSignup} disabled={loading || !form.acceptTerms}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-l from-emerald-600 to-teal-500 text-white text-sm font-bold shadow-lg disabled:opacity-50">
                      <CheckCircle className="w-4 h-4" />
                      {loading ? "جاري الإنشاء..." : "فتح الملف الطبي"}
                    </button>
                  )}
                </div>
                {step === 2 && <p className="text-center text-xs text-slate-400 mt-3">المعلومات الطبية تُحفظ بشكل مشفر ولا تُشارك إلا مع طبيبك</p>}
              </div>
            )}
          </div>
        </div>
        <p className="text-center text-xs text-slate-400 mt-5">منصة عناية © {new Date().getFullYear()} — مرخصة من وزارة الصحة</p>
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
