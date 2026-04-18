"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Settings, User, Phone, Mail, Stethoscope, Award, Building2,
  CreditCard, Lock, LogOut, Bell, Shield, BadgeCheck, ChevronRight,
  Globe, Calendar, Save, CheckCircle, AlertCircle, Package
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const SPECIALTIES = [
  "طب عام", "طب الأطفال", "أمراض القلب والأوعية الدموية", "طب الجهاز الهضمي",
  "طب الأعصاب", "طب العيون", "طب الأنف والأذن والحنجرة", "أمراض الجلد",
  "طب العظام والمفاصل", "الطب النفسي", "أمراض النساء والتوليد",
  "طب الطوارئ", "الجراحة العامة", "طب الأسنان", "علم الأشعة",
  "أمراض الكلى", "أمراض الرئة", "الغدد الصماء", "طب الأورام", "أخرى",
];

export default function DoctorSettings() {
  const supabase = createClient();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("profile");

  // Editable fields
  const [fullNameAr, setFullNameAr] = useState("");
  const [fullNameFr, setFullNameFr] = useState("");
  const [phone, setPhone] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [workplaceAddress, setWorkplaceAddress] = useState("");
  const [ccp, setCcp] = useState("");
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUser(user);

      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (prof) {
        setProfile(prof);
        setFullNameAr(prof.full_name || user.user_metadata?.full_name_ar || "");
        setFullNameFr(user.user_metadata?.full_name_fr || "");
        setPhone(prof.phone || "");
        setSpecialty(prof.specialty || user.user_metadata?.specialty || "");
        setLicenseNumber(prof.license_number || user.user_metadata?.license_number || "");
        setWorkplaceAddress(prof.address || user.user_metadata?.workplace_address || "");
        setCcp(user.user_metadata?.ccp || "");
      }
      setLoading(false);
    };
    load();
  }, [supabase]);

  const handleSave = async () => {
    if (!currentUser) return;
    setSaving(true);
    await supabase.from("profiles").update({
      full_name: fullNameAr,
      phone,
      specialty,
      license_number: licenseNumber,
      address: workplaceAddress,
    }).eq("id", currentUser.id);

    await supabase.auth.updateUser({
      data: {
        full_name: fullNameAr,
        full_name_ar: fullNameAr,
        full_name_fr: fullNameFr,
        specialty,
        license_number: licenseNumber,
        workplace_address: workplaceAddress,
        ccp,
      }
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // ── Sidebar sections ─────────────────────────────────────────────────────────
  const sections = [
    { id: "profile", icon: <User className="w-4 h-4" />, label: "الملف الشخصي" },
    { id: "professional", icon: <Stethoscope className="w-4 h-4" />, label: "المعلومات المهنية" },
    { id: "subscription", icon: <Package className="w-4 h-4" />, label: "الاشتراك والباقة" },
    { id: "security", icon: <Shield className="w-4 h-4" />, label: "الأمان والخصوصية" },
    { id: "notifications", icon: <Bell className="w-4 h-4" />, label: "الإشعارات" },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="w-full pb-20" dir="rtl">
      {/* Header */}
      <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-800">الإعدادات</h1>
          <p className="text-xs font-bold text-blue-500">إدارة حسابك وملفك المهني</p>
        </div>
      </motion.header>

      <div className="flex gap-6">
        {/* Left sidebar — navigation */}
        <div className="w-56 flex-shrink-0">
          {/* Doctor card */}
          <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl p-5 mb-4 text-white shadow-xl shadow-blue-500/20">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white font-black text-2xl mb-3 border border-white/30">
              {(fullNameAr || "د")[0]}
            </div>
            <h3 className="font-black text-base leading-tight">{fullNameAr || "الطبيب"}</h3>
            <p className="text-blue-100 text-xs mt-1">{specialty || "طبيب عام"}</p>
            <div className="mt-3 flex items-center gap-1.5">
              <button
                onClick={() => setIsOnline(!isOnline)}
                className={`w-8 h-4 rounded-full transition-colors relative ${isOnline ? "bg-emerald-400" : "bg-white/30"}`}
              >
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all shadow-sm ${isOnline ? "right-0.5" : "left-0.5"}`} />
              </button>
              <span className="text-xs font-bold text-blue-100">
                {isOnline ? "متاح للمرضى" : "خارج الخدمة"}
              </span>
            </div>
          </div>

          {/* Nav */}
          <nav className="space-y-1">
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all text-right ${
                  activeSection === s.id
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {s.icon}
                {s.label}
              </button>
            ))}
          </nav>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="mt-4 w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-rose-600 hover:bg-rose-50 transition-all border border-rose-100"
          >
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
          </button>
        </div>

        {/* Right content */}
        <div className="flex-1">
          {saved && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-2xl mb-5 text-sm font-bold">
              <CheckCircle className="w-5 h-5" />
              تم حفظ التغييرات بنجاح
            </motion.div>
          )}

          {/* ── PROFILE ─────────────────────────────────────────────────────── */}
          {activeSection === "profile" && (
            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-lg shadow-slate-200/40">
              <h2 className="font-black text-slate-800 text-lg mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" /> المعلومات الأساسية
              </h2>
              <div className="space-y-4">
                <FieldGroup label="الاسم الكامل بالعربية" icon={<User className="w-4 h-4" />}>
                  <input value={fullNameAr} onChange={e => setFullNameAr(e.target.value)}
                    className={inputCls} placeholder="د. محمد بن علي" />
                </FieldGroup>
                <FieldGroup label="الاسم الكامل بالفرنسية" icon={<Globe className="w-4 h-4" />}>
                  <input value={fullNameFr} onChange={e => setFullNameFr(e.target.value)}
                    className={inputCls} placeholder="Dr. Mohamed Ben Ali" />
                </FieldGroup>
                <FieldGroup label="رقم الهاتف" icon={<Phone className="w-4 h-4" />}>
                  <input value={phone} onChange={e => setPhone(e.target.value)}
                    className={inputCls} placeholder="+213 6XX XX XX XX" />
                </FieldGroup>
                <FieldGroup label="البريد الإلكتروني" icon={<Mail className="w-4 h-4" />}>
                  <input value={currentUser?.email || ""} readOnly
                    className={`${inputCls} opacity-60 cursor-not-allowed`} />
                </FieldGroup>
              </div>
              <SaveButton saving={saving} onClick={handleSave} />
            </div>
          )}

          {/* ── PROFESSIONAL ────────────────────────────────────────────────── */}
          {activeSection === "professional" && (
            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-lg shadow-slate-200/40">
              <h2 className="font-black text-slate-800 text-lg mb-6 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-blue-600" /> المعلومات المهنية
              </h2>
              <div className="space-y-4">
                <FieldGroup label="التخصص الطبي" icon={<Stethoscope className="w-4 h-4" />}>
                  <select value={specialty} onChange={e => setSpecialty(e.target.value)} className={inputCls}>
                    <option value="">-- اختر التخصص --</option>
                    {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </FieldGroup>
                <FieldGroup label="رقم نقابة الأطباء" icon={<Award className="w-4 h-4" />}>
                  <input value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)}
                    className={inputCls} placeholder="ONMC-XXXXX" />
                </FieldGroup>
                <FieldGroup label="مكان العمل / العيادة" icon={<Building2 className="w-4 h-4" />}>
                  <input value={workplaceAddress} onChange={e => setWorkplaceAddress(e.target.value)}
                    className={inputCls} placeholder="عيادة دكتور...، شارع..." />
                </FieldGroup>
                <FieldGroup label="رقم CCP / بريد موب" icon={<CreditCard className="w-4 h-4" />}>
                  <input value={ccp} onChange={e => setCcp(e.target.value)}
                    className={inputCls} placeholder="رقم CCP أو بريد موب" />
                </FieldGroup>

                {/* Document upload notice */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <p className="text-sm font-bold text-amber-800 mb-2">⚠️ الوثائق المطلوبة</p>
                  <div className="space-y-2">
                    {[
                      { label: "شهادة الدكتوراه في الطب", status: "مطلوبة لتفعيل الوصفة الرقمية" },
                      { label: "شهادة العمل", status: "تُجدَّد كل 6 أشهر" },
                    ].map(doc => (
                      <div key={doc.label} className="flex items-center justify-between bg-white/70 rounded-xl p-3 border border-amber-100">
                        <div>
                          <p className="text-sm font-bold text-slate-700">{doc.label}</p>
                          <p className="text-xs text-amber-600">{doc.status}</p>
                        </div>
                        <button className="text-xs bg-blue-100 text-blue-700 font-bold px-3 py-1.5 rounded-xl hover:bg-blue-200 transition-colors">
                          رفع
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <SaveButton saving={saving} onClick={handleSave} />
            </div>
          )}

          {/* ── SUBSCRIPTION ────────────────────────────────────────────────── */}
          {activeSection === "subscription" && (
            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-lg shadow-slate-200/40">
              <h2 className="font-black text-slate-800 text-lg mb-2 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" /> الاشتراك والباقة
              </h2>
              <p className="text-xs text-slate-500 mb-6">اختر الباقة المناسبة لممارستك الطبية</p>

              <div className="space-y-4">
                {[
                  {
                    name: "المجانية", price: "0 دج", tag: "مجاني",
                    color: "border-slate-200 bg-slate-50",
                    tagColor: "bg-slate-100 text-slate-600",
                    features: ["30 مريض/شهر", "20 وصفة/شهر", "10 تحاليل/شهر", "ذكاء اصطناعي أساسي"],
                    commission: "عمولة 15%",
                    current: profile?.subscription_plan === "free" || !profile?.subscription_plan,
                  },
                  {
                    name: "الأساسية", price: "3,000 دج", tag: "شهرياً",
                    color: "border-blue-200 bg-blue-50",
                    tagColor: "bg-blue-100 text-blue-700",
                    features: ["300 مريض/شهر", "300 وصفة/شهر", "300 تحليل/شهر", "دعم عادي", "أولوية الظهور"],
                    commission: "عمولة 5%",
                    current: profile?.subscription_plan === "basic",
                  },
                  {
                    name: "الاحترافية", price: "8,000 دج", tag: "شهرياً",
                    color: "border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50",
                    tagColor: "bg-purple-100 text-purple-700",
                    features: ["مرضى غير محدودين", "وصفات & تحاليل غير محدودة", "AI متقدم + تقارير", "Gestion de cabinet", "أولوية ظهور قصوى"],
                    commission: "عمولة 1% — ثم 0% بعد شهرين متتاليين",
                    current: profile?.subscription_plan === "pro",
                    recommended: true,
                  },
                ].map(plan => (
                  <div key={plan.name} className={`border-2 rounded-3xl p-5 relative ${plan.color} ${plan.current ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}>
                    {plan.recommended && (
                      <span className="absolute -top-3 right-6 text-xs font-black bg-gradient-to-l from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full shadow-md">
                        ⭐ الأفضل
                      </span>
                    )}
                    {plan.current && (
                      <span className="absolute -top-3 left-6 text-xs font-black bg-emerald-500 text-white px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                        <BadgeCheck className="w-3 h-3" /> باقتك الحالية
                      </span>
                    )}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-black text-slate-800 text-lg">{plan.name}</h3>
                        <p className="text-xs text-rose-600 font-bold mt-0.5">{plan.commission}</p>
                      </div>
                      <div className="text-left">
                        <span className="text-2xl font-black text-slate-900">{plan.price}</span>
                        <div>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${plan.tagColor}`}>{plan.tag}</span>
                        </div>
                      </div>
                    </div>
                    <ul className="space-y-1 mb-4">
                      {plan.features.map(f => (
                        <li key={f} className="text-xs text-slate-700 flex items-center gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    {!plan.current && (
                      <button className="w-full py-2.5 rounded-2xl text-sm font-bold bg-gradient-to-l from-blue-600 to-cyan-500 text-white shadow-md hover:shadow-lg transition-all">
                        الاشتراك في هذه الباقة
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SECURITY ────────────────────────────────────────────────────── */}
          {activeSection === "security" && (
            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-lg shadow-slate-200/40">
              <h2 className="font-black text-slate-800 text-lg mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" /> الأمان والخصوصية
              </h2>
              <div className="space-y-3">
                {[
                  {
                    icon: <Lock className="w-5 h-5 text-slate-600" />,
                    label: "تغيير كلمة المرور",
                    description: "يُنصح بتغييرها كل 3 أشهر",
                    action: "تغيير",
                    color: "text-blue-600",
                  },
                  {
                    icon: <Shield className="w-5 h-5 text-slate-600" />,
                    label: "تشفير البيانات",
                    description: "AES-256 — كل بياناتك مشفرة",
                    action: "فعّال ✅",
                    color: "text-emerald-600",
                  },
                  {
                    icon: <AlertCircle className="w-5 h-5 text-slate-600" />,
                    label: "تجميد الحساب مؤقتاً",
                    description: "يمكن إعادة التفعيل بنفس الحساب",
                    action: "تجميد",
                    color: "text-amber-600",
                  },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{item.label}</p>
                        <p className="text-xs text-slate-500">{item.description}</p>
                      </div>
                    </div>
                    <button className={`text-xs font-black ${item.color} hover:underline`}>
                      {item.action}
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-4">
                <p className="text-sm font-bold text-blue-800 mb-2">🔐 معلومات الأمان</p>
                <div className="space-y-1.5 text-xs text-slate-600">
                  <p>• الخروج التلقائي بعد 10 دقائق من عدم النشاط</p>
                  <p>• الجلسة مقيّدة بجهازين كحد أقصى</p>
                  <p>• كل العمليات مؤرشفة في سجل التدقيق</p>
                  <p>• منصة عناية مشفرة ومحمية وفق معايير HIPAA</p>
                </div>
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS ───────────────────────────────────────────────── */}
          {activeSection === "notifications" && (
            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-lg shadow-slate-200/40">
              <h2 className="font-black text-slate-800 text-lg mb-6 flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" /> تفضيلات الإشعارات
              </h2>
              <div className="space-y-4">
                {[
                  { label: "طلب جديد من مريض", desc: "تنبيه فوري عند وصول طلب", default: true },
                  { label: "نتائج التحاليل", desc: "عند رفع نتائج تحاليل مريضك", default: true },
                  { label: "تجديد الاشتراك", desc: "قبل يومين من انتهاء الشهر", default: true },
                  { label: "تقرير أسبوعي", desc: "ملخص نشاطك الأسبوعي", default: false },
                  { label: "رسائل النظام", desc: "تحديثات المنصة والصيانة", default: true },
                ].map(item => (
                  <NotifToggle key={item.label} label={item.label} desc={item.desc} defaultOn={item.default} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Helper components ──────────────────────────────────────────────────────────
const inputCls = `w-full h-12 px-4 bg-slate-50/80 border border-slate-200 rounded-xl 
  focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all 
  text-right text-slate-800 text-sm`;

function FieldGroup({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 mb-1.5">
        <span className="text-slate-400">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}

function SaveButton({ saving, onClick }: { saving: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="mt-6 flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-l from-blue-600 to-cyan-500 text-white text-sm font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all disabled:opacity-60"
    >
      <Save className="w-4 h-4" />
      {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
    </button>
  );
}

function NotifToggle({ label, desc, defaultOn }: { label: string; desc: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
      <div>
        <p className="font-bold text-slate-800 text-sm">{label}</p>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
      <button
        onClick={() => setOn(!on)}
        className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${on ? "bg-blue-500" : "bg-slate-300"}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${on ? "right-1" : "left-1"}`} />
      </button>
    </div>
  );
}
