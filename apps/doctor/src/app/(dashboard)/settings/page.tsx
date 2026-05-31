"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Settings, User, Phone, Mail, Stethoscope, Award, Building2,
  CreditCard, Lock, LogOut, Bell, Shield, BadgeCheck,
  Save, CheckCircle, AlertCircle, Package, Globe
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/LanguageContext";

const SPECIALTIES = [
  "طب عام", "طب الأطفال", "أمراض القلب والأوعية الدموية", "طب الجهاز الهضمي",
  "طب الأعصاب", "طب العيون", "طب الأنف والأذن والحنجرة", "أمراض الجلد",
  "طب العظام والمفاصل", "الطب النفسي", "أمراض النساء والتوليد",
  "طب الطوارئ", "الجراحة العامة", "طب الأسنان", "علم الأشعة",
  "أمراض الكلى", "أمراض الرئة", "الغدد الصماء", "طب الأورام", "أخرى",
];

const SPECIALTIES_FR = [
  "Médecine générale", "Pédiatrie", "Cardiologie", "Gastro-entérologie",
  "Neurologie", "Ophtalmologie", "Otorhinolaryngologie (ORL)", "Dermatologie",
  "Orthopédie", "Psychiatrie", "Gynécologie-obstétrique",
  "Médecine d'urgence", "Chirurgie générale", "Dentisterie", "Radiologie",
  "Néphrologie", "Pneumologie", "Endocrinologie", "Oncologie", "Autre",
];

export default function DoctorSettings() {
  const { lang, t } = useLanguage();
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
        const fixEnc = (s: string) => { try { return s ? decodeURIComponent(escape(s)) : s; } catch { return s; } };
        setFullNameAr(fixEnc(prof.full_name) || fixEnc(user.user_metadata?.full_name_ar) || "");
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

  const sections = [
    { id: "profile", icon: <User className="w-4 h-4" />, label: t("profileTab") },
    { id: "professional", icon: <Stethoscope className="w-4 h-4" />, label: t("professionalTab") },
    { id: "subscription", icon: <Package className="w-4 h-4" />, label: t("subscriptionTab") },
    { id: "security", icon: <Shield className="w-4 h-4" />, label: t("securityTab") },
    { id: "notifications", icon: <Bell className="w-4 h-4" />, label: t("notificationsTab") },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div key={lang} className="w-full pb-20" dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* Header */}
      <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-800">{t("settingsTitle")}</h1>
          <p className="text-xs font-bold text-blue-500">{t("settingsDesc")}</p>
        </div>
      </motion.header>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left sidebar — navigation */}
        <div className="w-full lg:w-64 flex-shrink-0">
          {/* Doctor card */}
          <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl p-5 mb-4 text-white shadow-xl shadow-blue-500/20">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white font-black text-2xl mb-3 border border-white/30">
              {(fullNameAr || "د")[0]}
            </div>
            <h3 className="font-black text-base leading-tight">{fullNameAr || (lang === "ar" ? "الطبيب" : "Médecin")}</h3>
            <p className="text-blue-100 text-xs mt-1">{specialty || (lang === "ar" ? "طبيب عام" : "Généraliste")}</p>
            <div className="mt-3 flex items-center gap-1.5">
              <button
                onClick={() => setIsOnline(!isOnline)}
                className={`w-8 h-4 rounded-full transition-colors relative ${isOnline ? "bg-emerald-400" : "bg-white/30"}`}
              >
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all shadow-sm ${isOnline ? (lang === "ar" ? "right-0.5" : "left-0.5") : (lang === "ar" ? "left-0.5" : "right-0.5")}`} />
              </button>
              <span className="text-xs font-bold text-blue-100">
                {isOnline ? t("onlineStatus") : t("offlineStatus")}
              </span>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 hide-scrollbar">
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex-shrink-0 lg:w-full flex items-center justify-center lg:justify-start gap-2 lg:gap-3 px-4 py-3 rounded-2xl text-xs lg:text-sm font-bold transition-all ${
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
            {t("logout")}
          </button>
        </div>

        {/* Right content */}
        <div className="flex-1">
          {saved && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-2xl mb-5 text-sm font-bold">
              <CheckCircle className="w-5 h-5" />
              {t("saveSuccess")}
            </motion.div>
          )}

          {/* ── PROFILE ─────────────────────────────────────────────────────── */}
          {activeSection === "profile" && (
            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-lg shadow-slate-200/40">
              <h2 className="font-black text-slate-800 text-lg mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" /> {t("basicInfo")}
              </h2>
              <div className="space-y-4">
                <FieldGroup label={t("fullNameArLabel")} icon={<User className="w-4 h-4" />}>
                  <input value={fullNameAr} onChange={e => setFullNameAr(e.target.value)}
                    className={inputCls} placeholder="د. محمد بن علي" />
                </FieldGroup>
                <FieldGroup label={t("fullNameFrLabel")} icon={<Globe className="w-4 h-4" />}>
                  <input value={fullNameFr} onChange={e => setFullNameFr(e.target.value)}
                    className={inputCls} placeholder="Dr. Mohamed Ben Ali" />
                </FieldGroup>
                <FieldGroup label={t("phoneLabel")} icon={<Phone className="w-4 h-4" />}>
                  <input value={phone} onChange={e => setPhone(e.target.value)}
                    className={inputCls} placeholder="+213 6XX XX XX XX" />
                </FieldGroup>
                <FieldGroup label={t("emailLabel")} icon={<Mail className="w-4 h-4" />}>
                  <input value={currentUser?.email || ""} readOnly
                    className={`${inputCls} opacity-60 cursor-not-allowed`} />
                </FieldGroup>
              </div>
              <SaveButton saving={saving} onClick={handleSave} lang={lang} t={t} />
            </div>
          )}
          {activeSection === "professional" && (
            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-lg shadow-slate-200/40">
              <h2 className="font-black text-slate-800 text-lg mb-6 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-blue-600" /> {t("professionalTab")}
              </h2>
              <div className="space-y-4">
                <FieldGroup label={t("specialtyLabel")} icon={<Stethoscope className="w-4 h-4" />}>
                  <select value={specialty} onChange={e => setSpecialty(e.target.value)} className={inputCls}>
                    <option value="">{t("selectSpecialty")}</option>
                    {SPECIALTIES.map((s, idx) => (
                      <option key={s} value={s}>
                        {lang === "ar" ? s : SPECIALTIES_FR[idx]}
                      </option>
                    ))}
                  </select>
                </FieldGroup>
                <FieldGroup label={t("licenseNumberLabel")} icon={<Award className="w-4 h-4" />}>
                  <input value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)}
                    className={inputCls} placeholder="ONMC-XXXXX" />
                </FieldGroup>
                <FieldGroup label={t("workplaceLabel")} icon={<Building2 className="w-4 h-4" />}>
                  <input value={workplaceAddress} onChange={e => setWorkplaceAddress(e.target.value)}
                    className={inputCls} placeholder={lang === "ar" ? "عيادة دكتور...، شارع..." : "Cabinet Dr..., Rue..."} />
                </FieldGroup>
                <FieldGroup label={t("ccpLabel")} icon={<CreditCard className="w-4 h-4" />}>
                  <input value={ccp} onChange={e => setCcp(e.target.value)}
                    className={inputCls} placeholder={lang === "ar" ? "رقم CCP أو بريد موب" : "Numéro CCP ou BaridiMob"} />
                </FieldGroup>

                {/* Document upload notice */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <p className="text-sm font-bold text-amber-800 mb-2">⚠️ {t("requiredDocs")}</p>
                  <div className="space-y-2">
                    {[
                      {
                        label: t("phdDoc"),
                        status: t("phdDocDesc")
                      },
                      {
                        label: t("workDoc"),
                        status: t("workDocDesc")
                      },
                    ].map(doc => (
                      <div key={doc.label} className="flex items-center justify-between bg-white/70 rounded-xl p-3 border border-amber-100">
                        <div className={lang === "ar" ? "text-right" : "text-left"}>
                          <p className="text-sm font-bold text-slate-700">{doc.label}</p>
                          <p className="text-xs text-amber-600">{doc.status}</p>
                        </div>
                        <button className="text-xs bg-blue-100 text-blue-700 font-bold px-3 py-1.5 rounded-xl hover:bg-blue-200 transition-colors">
                          {t("upload")}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <SaveButton saving={saving} onClick={handleSave} lang={lang} t={t} />
            </div>
          )}

          {/* ── SUBSCRIPTION ────────────────────────────────────────────────── */}
          {activeSection === "subscription" && (
            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-lg shadow-slate-200/40">
              <h2 className="font-black text-slate-800 text-lg mb-2 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" /> {t("subscriptionTitle")}
              </h2>
              <p className="text-xs text-slate-500 mb-6">{t("subscriptionDesc")}</p>
 
              <div className="space-y-4">
                {[
                  {
                    name: t("freePlan"),
                    price: lang === "ar" ? "0 دج" : "0 DA",
                    tag: t("freeTag"),
                    color: "border-slate-200 bg-slate-50",
                    tagColor: "bg-slate-100 text-slate-600",
                    features: lang === "ar"
                      ? ["30 مريض/شهر", "20 وصفة/شهر", "10 تحاليل/شهر", "ذكاء اصطناعي أساسي"]
                      : ["30 patients/mois", "20 ordonnances/mois", "10 analyses/mois", "IA de base"],
                    commission: lang === "ar" ? "عمولة 15%" : "Commission 15%",
                    current: profile?.subscription_plan === "free" || !profile?.subscription_plan,
                  },
                  {
                    name: t("basicPlan"),
                    price: lang === "ar" ? "3,000 دج" : "3 000 DA",
                    tag: lang === "ar" ? "شهرياً" : "/mois",
                    color: "border-blue-200 bg-blue-50",
                    tagColor: "bg-blue-100 text-blue-700",
                    features: lang === "ar"
                      ? ["300 مريض/شهر", "300 وصفة/شهر", "300 تحليل/شهر", "دعم عادي", "أولوية الظهور"]
                      : ["300 patients/mois", "300 ordonnances/mois", "300 analyses/mois", "Support standard", "Affichage prioritaire"],
                    commission: lang === "ar" ? "عمولة 5%" : "Commission 5%",
                    current: profile?.subscription_plan === "basic",
                  },
                  {
                    name: t("proPlan"),
                    price: lang === "ar" ? "8,000 دج" : "8 000 DA",
                    tag: lang === "ar" ? "شهرياً" : "/mois",
                    color: "border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50",
                    tagColor: "bg-purple-100 text-purple-700",
                    features: lang === "ar"
                      ? ["مرضى غير محدودين", "وصفات & تحاليل غير محدودة", "AI متقدم + تقارير", "Gestion de cabinet", "أولوية ظهور قصوى"]
                      : ["Patients illimités", "Ordonnances/analyses illimitées", "IA avancée + rapports", "Gestion de cabinet", "Affichage prioritaire max"],
                    commission: lang === "ar" ? "عمولة 1% — ثم 0% بعد شهرين متتاليين" : "Commission 1% — puis 0% après 2 mois consécutifs",
                    current: profile?.subscription_plan === "pro",
                    recommended: true,
                  },
                ].map(plan => (
                  <div key={plan.name} className={`border-2 rounded-3xl p-5 relative ${plan.color} ${plan.current ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}>
                    {plan.recommended && (
                      <span className={`absolute -top-3 ${lang === "ar" ? "right-6" : "left-6"} text-xs font-black bg-gradient-to-l from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full shadow-md`}>
                        {t("bestChoice")}
                      </span>
                    )}
                    {plan.current && (
                      <span className={`absolute -top-3 ${lang === "ar" ? "left-6" : "right-6"} text-xs font-black bg-emerald-500 text-white px-3 py-1 rounded-full shadow-md flex items-center gap-1`}>
                        <BadgeCheck className="w-3 h-3" /> {t("currentPlan")}
                      </span>
                    )}
                    <div className="flex justify-between items-start mb-3">
                      <div className={lang === "ar" ? "text-right" : "text-left"}>
                        <h3 className="font-black text-slate-800 text-lg">{plan.name}</h3>
                        <p className="text-xs text-rose-600 font-bold mt-0.5">{plan.commission}</p>
                      </div>
                      <div className={lang === "ar" ? "text-left" : "text-right"}>
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
                        {t("subscribeToPlan")}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}            {/* ── SECURITY ────────────────────────────────────────────────────── */}
          {activeSection === "security" && (
            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-lg shadow-slate-200/40">
              <h2 className="font-black text-slate-800 text-lg mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" /> {t("securityTitle")}
              </h2>
              <div className="space-y-3">
                {[
                  {
                    icon: <Lock className="w-5 h-5 text-slate-600" />,
                    label: t("changePassword"),
                    description: t("passwordDesc"),
                    action: t("changeAction"),
                    color: "text-blue-600",
                  },
                  {
                    icon: <Shield className="w-5 h-5 text-slate-600" />,
                    label: t("dataEncryption"),
                    description: t("dataEncryptionDesc"),
                    action: t("encryptionAction"),
                    color: "text-emerald-600",
                  },
                  {
                    icon: <AlertCircle className="w-5 h-5 text-slate-600" />,
                    label: t("deactivateAccount"),
                    description: t("deactivateDesc"),
                    action: t("deactivateAction"),
                    color: "text-amber-600",
                  },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <div className={lang === "ar" ? "text-right" : "text-left"}>
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
                <p className="text-sm font-bold text-blue-800 mb-2">🔐 {t("securityInfo")}</p>
                <div className="space-y-1.5 text-xs text-slate-600">
                  <p>• {t("securityInfoRule1")}</p>
                  <p>• {t("securityInfoRule2")}</p>
                  <p>• {t("securityInfoRule3")}</p>
                  <p>• {t("securityInfoRule4")}</p>
                </div>
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS ───────────────────────────────────────────────── */}
          {activeSection === "notifications" && (
            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-lg shadow-slate-200/40">
              <h2 className="font-black text-slate-800 text-lg mb-6 flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" /> {t("notificationTitle")}
              </h2>
              <div className="space-y-4">
                {[
                  {
                    label: t("newRequestNotif"),
                    desc: t("newRequestNotifDesc"),
                    default: true
                  },
                  {
                    label: t("labResultsNotif"),
                    desc: t("labResultsNotifDesc"),
                    default: true
                  },
                  {
                    label: t("subRenewalNotif"),
                    desc: t("subRenewalNotifDesc"),
                    default: true
                  },
                  {
                    label: t("weeklyReportNotif"),
                    desc: t("weeklyReportNotifDesc"),
                    default: false
                  },
                  {
                    label: t("systemMessagesNotif"),
                    desc: t("systemMessagesNotifDesc"),
                    default: true
                  },
                ].map(item => (
                  <NotifToggle key={item.label} label={item.label} desc={item.desc} defaultOn={item.default} lang={lang} />
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
  text-slate-800 text-sm`;

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

function SaveButton({ saving, onClick, lang, t }: { saving: boolean; onClick: () => void; lang: string; t: any }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className={`mt-6 flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-l from-blue-600 to-cyan-500 text-white text-sm font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all disabled:opacity-60`}
    >
      <Save className="w-4 h-4" />
      {saving ? t("saving") : t("saveChanges")}
    </button>
  );
}

function NotifToggle({ label, desc, defaultOn, lang }: { label: string; desc: string; defaultOn: boolean; lang: string }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
      <div className={lang === "ar" ? "text-right" : "text-left"}>
        <p className="font-bold text-slate-800 text-sm">{label}</p>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
      <button
        onClick={() => setOn(!on)}
        className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${on ? "bg-blue-500" : "bg-slate-300"}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${on ? (lang === "ar" ? "right-1" : "left-1") : (lang === "ar" ? "left-1" : "right-1")}`} />
      </button>
    </div>
  );
}
