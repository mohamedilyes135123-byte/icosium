"use client";

export const dynamic = 'force-dynamic';

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
  "Ø·Ø¨ Ø¹Ø§Ù…", "Ø·Ø¨ Ø§Ù„Ø£Ø·ÙØ§Ù„", "Ø£Ù…Ø±Ø§Ø¶ Ø§Ù„Ù‚Ù„Ø¨ ÙˆØ§Ù„Ø£ÙˆØ¹ÙŠØ© Ø§Ù„Ø¯Ù…ÙˆÙŠØ©", "Ø·Ø¨ Ø§Ù„Ø¬Ù‡Ø§Ø² Ø§Ù„Ù‡Ø¶Ù…ÙŠ",
  "Ø·Ø¨ Ø§Ù„Ø£Ø¹ØµØ§Ø¨", "Ø·Ø¨ Ø§Ù„Ø¹ÙŠÙˆÙ†", "Ø·Ø¨ Ø§Ù„Ø£Ù†Ù ÙˆØ§Ù„Ø£Ø°Ù† ÙˆØ§Ù„Ø­Ù†Ø¬Ø±Ø©", "Ø£Ù…Ø±Ø§Ø¶ Ø§Ù„Ø¬Ù„Ø¯",
  "Ø·Ø¨ Ø§Ù„Ø¹Ø¸Ø§Ù… ÙˆØ§Ù„Ù…ÙØ§ØµÙ„", "Ø§Ù„Ø·Ø¨ Ø§Ù„Ù†ÙØ³ÙŠ", "Ø£Ù…Ø±Ø§Ø¶ Ø§Ù„Ù†Ø³Ø§Ø¡ ÙˆØ§Ù„ØªÙˆÙ„ÙŠØ¯",
  "Ø·Ø¨ Ø§Ù„Ø·ÙˆØ§Ø±Ø¦", "Ø§Ù„Ø¬Ø±Ø§Ø­Ø© Ø§Ù„Ø¹Ø§Ù…Ø©", "Ø·Ø¨ Ø§Ù„Ø£Ø³Ù†Ø§Ù†", "Ø¹Ù„Ù… Ø§Ù„Ø£Ø´Ø¹Ø©",
  "Ø£Ù…Ø±Ø§Ø¶ Ø§Ù„ÙƒÙ„Ù‰", "Ø£Ù…Ø±Ø§Ø¶ Ø§Ù„Ø±Ø¦Ø©", "Ø§Ù„ØºØ¯Ø¯ Ø§Ù„ØµÙ…Ø§Ø¡", "Ø·Ø¨ Ø§Ù„Ø£ÙˆØ±Ø§Ù…", "Ø£Ø®Ø±Ù‰",
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

  // â”€â”€ Sidebar sections â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const sections = [
    { id: "profile", icon: <User className="w-4 h-4" />, label: "Ø§Ù„Ù…Ù„Ù Ø§Ù„Ø´Ø®ØµÙŠ" },
    { id: "professional", icon: <Stethoscope className="w-4 h-4" />, label: "Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ù…Ù‡Ù†ÙŠØ©" },
    { id: "subscription", icon: <Package className="w-4 h-4" />, label: "Ø§Ù„Ø§Ø´ØªØ±Ø§Ùƒ ÙˆØ§Ù„Ø¨Ø§Ù‚Ø©" },
    { id: "security", icon: <Shield className="w-4 h-4" />, label: "Ø§Ù„Ø£Ù…Ø§Ù† ÙˆØ§Ù„Ø®ØµÙˆØµÙŠØ©" },
    { id: "notifications", icon: <Bell className="w-4 h-4" />, label: "Ø§Ù„Ø¥Ø´Ø¹Ø§Ø±Ø§Øª" },
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
          <h1 className="text-xl font-black text-slate-800">Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª</h1>
          <p className="text-xs font-bold text-blue-500">Ø¥Ø¯Ø§Ø±Ø© Ø­Ø³Ø§Ø¨Ùƒ ÙˆÙ…Ù„ÙÙƒ Ø§Ù„Ù…Ù‡Ù†ÙŠ</p>
        </div>
      </motion.header>

      <div className="flex gap-6">
        {/* Left sidebar â€” navigation */}
        <div className="w-56 flex-shrink-0">
          {/* Doctor card */}
          <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl p-5 mb-4 text-white shadow-xl shadow-blue-500/20">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white font-black text-2xl mb-3 border border-white/30">
              {(fullNameAr || "Ø¯")[0]}
            </div>
            <h3 className="font-black text-base leading-tight">{fullNameAr || "Ø§Ù„Ø·Ø¨ÙŠØ¨"}</h3>
            <p className="text-blue-100 text-xs mt-1">{specialty || "Ø·Ø¨ÙŠØ¨ Ø¹Ø§Ù…"}</p>
            <div className="mt-3 flex items-center gap-1.5">
              <button
                onClick={() => setIsOnline(!isOnline)}
                className={`w-8 h-4 rounded-full transition-colors relative ${isOnline ? "bg-emerald-400" : "bg-white/30"}`}
              >
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all shadow-sm ${isOnline ? "right-0.5" : "left-0.5"}`} />
              </button>
              <span className="text-xs font-bold text-blue-100">
                {isOnline ? "Ù…ØªØ§Ø­ Ù„Ù„Ù…Ø±Ø¶Ù‰" : "Ø®Ø§Ø±Ø¬ Ø§Ù„Ø®Ø¯Ù…Ø©"}
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
            ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬
          </button>
        </div>

        {/* Right content */}
        <div className="flex-1">
          {saved && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-2xl mb-5 text-sm font-bold">
              <CheckCircle className="w-5 h-5" />
              ØªÙ… Ø­ÙØ¸ Ø§Ù„ØªØºÙŠÙŠØ±Ø§Øª Ø¨Ù†Ø¬Ø§Ø­
            </motion.div>
          )}

          {/* â”€â”€ PROFILE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          {activeSection === "profile" && (
            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-lg shadow-slate-200/40">
              <h2 className="font-black text-slate-800 text-lg mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" /> Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ø£Ø³Ø§Ø³ÙŠØ©
              </h2>
              <div className="space-y-4">
                <FieldGroup label="Ø§Ù„Ø§Ø³Ù… Ø§Ù„ÙƒØ§Ù…Ù„ Ø¨Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©" icon={<User className="w-4 h-4" />}>
                  <input value={fullNameAr} onChange={e => setFullNameAr(e.target.value)}
                    className={inputCls} placeholder="Ø¯. Ù…Ø­Ù…Ø¯ Ø¨Ù† Ø¹Ù„ÙŠ" />
                </FieldGroup>
                <FieldGroup label="Ø§Ù„Ø§Ø³Ù… Ø§Ù„ÙƒØ§Ù…Ù„ Ø¨Ø§Ù„ÙØ±Ù†Ø³ÙŠØ©" icon={<Globe className="w-4 h-4" />}>
                  <input value={fullNameFr} onChange={e => setFullNameFr(e.target.value)}
                    className={inputCls} placeholder="Dr. Mohamed Ben Ali" />
                </FieldGroup>
                <FieldGroup label="Ø±Ù‚Ù… Ø§Ù„Ù‡Ø§ØªÙ" icon={<Phone className="w-4 h-4" />}>
                  <input value={phone} onChange={e => setPhone(e.target.value)}
                    className={inputCls} placeholder="+213 6XX XX XX XX" />
                </FieldGroup>
                <FieldGroup label="Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ" icon={<Mail className="w-4 h-4" />}>
                  <input value={currentUser?.email || ""} readOnly
                    className={`${inputCls} opacity-60 cursor-not-allowed`} />
                </FieldGroup>
              </div>
              <SaveButton saving={saving} onClick={handleSave} />
            </div>
          )}

          {/* â”€â”€ PROFESSIONAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          {activeSection === "professional" && (
            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-lg shadow-slate-200/40">
              <h2 className="font-black text-slate-800 text-lg mb-6 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-blue-600" /> Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ù…Ù‡Ù†ÙŠØ©
              </h2>
              <div className="space-y-4">
                <FieldGroup label="Ø§Ù„ØªØ®ØµØµ Ø§Ù„Ø·Ø¨ÙŠ" icon={<Stethoscope className="w-4 h-4" />}>
                  <select value={specialty} onChange={e => setSpecialty(e.target.value)} className={inputCls}>
                    <option value="">-- Ø§Ø®ØªØ± Ø§Ù„ØªØ®ØµØµ --</option>
                    {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </FieldGroup>
                <FieldGroup label="Ø±Ù‚Ù… Ù†Ù‚Ø§Ø¨Ø© Ø§Ù„Ø£Ø·Ø¨Ø§Ø¡" icon={<Award className="w-4 h-4" />}>
                  <input value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)}
                    className={inputCls} placeholder="ONMC-XXXXX" />
                </FieldGroup>
                <FieldGroup label="Ù…ÙƒØ§Ù† Ø§Ù„Ø¹Ù…Ù„ / Ø§Ù„Ø¹ÙŠØ§Ø¯Ø©" icon={<Building2 className="w-4 h-4" />}>
                  <input value={workplaceAddress} onChange={e => setWorkplaceAddress(e.target.value)}
                    className={inputCls} placeholder="Ø¹ÙŠØ§Ø¯Ø© Ø¯ÙƒØªÙˆØ±...ØŒ Ø´Ø§Ø±Ø¹..." />
                </FieldGroup>
                <FieldGroup label="Ø±Ù‚Ù… CCP / Ø¨Ø±ÙŠØ¯ Ù…ÙˆØ¨" icon={<CreditCard className="w-4 h-4" />}>
                  <input value={ccp} onChange={e => setCcp(e.target.value)}
                    className={inputCls} placeholder="Ø±Ù‚Ù… CCP Ø£Ùˆ Ø¨Ø±ÙŠØ¯ Ù…ÙˆØ¨" />
                </FieldGroup>

                {/* Document upload notice */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <p className="text-sm font-bold text-amber-800 mb-2">âš ï¸ Ø§Ù„ÙˆØ«Ø§Ø¦Ù‚ Ø§Ù„Ù…Ø·Ù„ÙˆØ¨Ø©</p>
                  <div className="space-y-2">
                    {[
                      { label: "Ø´Ù‡Ø§Ø¯Ø© Ø§Ù„Ø¯ÙƒØªÙˆØ±Ø§Ù‡ ÙÙŠ Ø§Ù„Ø·Ø¨", status: "Ù…Ø·Ù„ÙˆØ¨Ø© Ù„ØªÙØ¹ÙŠÙ„ Ø§Ù„ÙˆØµÙØ© Ø§Ù„Ø±Ù‚Ù…ÙŠØ©" },
                      { label: "Ø´Ù‡Ø§Ø¯Ø© Ø§Ù„Ø¹Ù…Ù„", status: "ØªÙØ¬Ø¯ÙŽÙ‘Ø¯ ÙƒÙ„ 6 Ø£Ø´Ù‡Ø±" },
                    ].map(doc => (
                      <div key={doc.label} className="flex items-center justify-between bg-white/70 rounded-xl p-3 border border-amber-100">
                        <div>
                          <p className="text-sm font-bold text-slate-700">{doc.label}</p>
                          <p className="text-xs text-amber-600">{doc.status}</p>
                        </div>
                        <button className="text-xs bg-blue-100 text-blue-700 font-bold px-3 py-1.5 rounded-xl hover:bg-blue-200 transition-colors">
                          Ø±ÙØ¹
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <SaveButton saving={saving} onClick={handleSave} />
            </div>
          )}

          {/* â”€â”€ SUBSCRIPTION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          {activeSection === "subscription" && (
            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-lg shadow-slate-200/40">
              <h2 className="font-black text-slate-800 text-lg mb-2 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" /> Ø§Ù„Ø§Ø´ØªØ±Ø§Ùƒ ÙˆØ§Ù„Ø¨Ø§Ù‚Ø©
              </h2>
              <p className="text-xs text-slate-500 mb-6">Ø§Ø®ØªØ± Ø§Ù„Ø¨Ø§Ù‚Ø© Ø§Ù„Ù…Ù†Ø§Ø³Ø¨Ø© Ù„Ù…Ù…Ø§Ø±Ø³ØªÙƒ Ø§Ù„Ø·Ø¨ÙŠØ©</p>

              <div className="space-y-4">
                {[
                  {
                    name: "Ø§Ù„Ù…Ø¬Ø§Ù†ÙŠØ©", price: "0 Ø¯Ø¬", tag: "Ù…Ø¬Ø§Ù†ÙŠ",
                    color: "border-slate-200 bg-slate-50",
                    tagColor: "bg-slate-100 text-slate-600",
                    features: ["30 Ù…Ø±ÙŠØ¶/Ø´Ù‡Ø±", "20 ÙˆØµÙØ©/Ø´Ù‡Ø±", "10 ØªØ­Ø§Ù„ÙŠÙ„/Ø´Ù‡Ø±", "Ø°ÙƒØ§Ø¡ Ø§ØµØ·Ù†Ø§Ø¹ÙŠ Ø£Ø³Ø§Ø³ÙŠ"],
                    commission: "Ø¹Ù…ÙˆÙ„Ø© 15%",
                    current: profile?.subscription_plan === "free" || !profile?.subscription_plan,
                  },
                  {
                    name: "Ø§Ù„Ø£Ø³Ø§Ø³ÙŠØ©", price: "3,000 Ø¯Ø¬", tag: "Ø´Ù‡Ø±ÙŠØ§Ù‹",
                    color: "border-blue-200 bg-blue-50",
                    tagColor: "bg-blue-100 text-blue-700",
                    features: ["300 Ù…Ø±ÙŠØ¶/Ø´Ù‡Ø±", "300 ÙˆØµÙØ©/Ø´Ù‡Ø±", "300 ØªØ­Ù„ÙŠÙ„/Ø´Ù‡Ø±", "Ø¯Ø¹Ù… Ø¹Ø§Ø¯ÙŠ", "Ø£ÙˆÙ„ÙˆÙŠØ© Ø§Ù„Ø¸Ù‡ÙˆØ±"],
                    commission: "Ø¹Ù…ÙˆÙ„Ø© 5%",
                    current: profile?.subscription_plan === "basic",
                  },
                  {
                    name: "Ø§Ù„Ø§Ø­ØªØ±Ø§ÙÙŠØ©", price: "8,000 Ø¯Ø¬", tag: "Ø´Ù‡Ø±ÙŠØ§Ù‹",
                    color: "border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50",
                    tagColor: "bg-purple-100 text-purple-700",
                    features: ["Ù…Ø±Ø¶Ù‰ ØºÙŠØ± Ù…Ø­Ø¯ÙˆØ¯ÙŠÙ†", "ÙˆØµÙØ§Øª & ØªØ­Ø§Ù„ÙŠÙ„ ØºÙŠØ± Ù…Ø­Ø¯ÙˆØ¯Ø©", "AI Ù…ØªÙ‚Ø¯Ù… + ØªÙ‚Ø§Ø±ÙŠØ±", "Gestion de cabinet", "Ø£ÙˆÙ„ÙˆÙŠØ© Ø¸Ù‡ÙˆØ± Ù‚ØµÙˆÙ‰"],
                    commission: "Ø¹Ù…ÙˆÙ„Ø© 1% â€” Ø«Ù… 0% Ø¨Ø¹Ø¯ Ø´Ù‡Ø±ÙŠÙ† Ù…ØªØªØ§Ù„ÙŠÙŠÙ†",
                    current: profile?.subscription_plan === "pro",
                    recommended: true,
                  },
                ].map(plan => (
                  <div key={plan.name} className={`border-2 rounded-3xl p-5 relative ${plan.color} ${plan.current ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}>
                    {plan.recommended && (
                      <span className="absolute -top-3 right-6 text-xs font-black bg-gradient-to-l from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full shadow-md">
                        â­ Ø§Ù„Ø£ÙØ¶Ù„
                      </span>
                    )}
                    {plan.current && (
                      <span className="absolute -top-3 left-6 text-xs font-black bg-emerald-500 text-white px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                        <BadgeCheck className="w-3 h-3" /> Ø¨Ø§Ù‚ØªÙƒ Ø§Ù„Ø­Ø§Ù„ÙŠØ©
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
                        Ø§Ù„Ø§Ø´ØªØ±Ø§Ùƒ ÙÙŠ Ù‡Ø°Ù‡ Ø§Ù„Ø¨Ø§Ù‚Ø©
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* â”€â”€ SECURITY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          {activeSection === "security" && (
            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-lg shadow-slate-200/40">
              <h2 className="font-black text-slate-800 text-lg mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" /> Ø§Ù„Ø£Ù…Ø§Ù† ÙˆØ§Ù„Ø®ØµÙˆØµÙŠØ©
              </h2>
              <div className="space-y-3">
                {[
                  {
                    icon: <Lock className="w-5 h-5 text-slate-600" />,
                    label: "ØªØºÙŠÙŠØ± ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±",
                    description: "ÙŠÙÙ†ØµØ­ Ø¨ØªØºÙŠÙŠØ±Ù‡Ø§ ÙƒÙ„ 3 Ø£Ø´Ù‡Ø±",
                    action: "ØªØºÙŠÙŠØ±",
                    color: "text-blue-600",
                  },
                  {
                    icon: <Shield className="w-5 h-5 text-slate-600" />,
                    label: "ØªØ´ÙÙŠØ± Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª",
                    description: "AES-256 â€” ÙƒÙ„ Ø¨ÙŠØ§Ù†Ø§ØªÙƒ Ù…Ø´ÙØ±Ø©",
                    action: "ÙØ¹Ù‘Ø§Ù„ âœ…",
                    color: "text-emerald-600",
                  },
                  {
                    icon: <AlertCircle className="w-5 h-5 text-slate-600" />,
                    label: "ØªØ¬Ù…ÙŠØ¯ Ø§Ù„Ø­Ø³Ø§Ø¨ Ù…Ø¤Ù‚ØªØ§Ù‹",
                    description: "ÙŠÙ…ÙƒÙ† Ø¥Ø¹Ø§Ø¯Ø© Ø§Ù„ØªÙØ¹ÙŠÙ„ Ø¨Ù†ÙØ³ Ø§Ù„Ø­Ø³Ø§Ø¨",
                    action: "ØªØ¬Ù…ÙŠØ¯",
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
                <p className="text-sm font-bold text-blue-800 mb-2">ðŸ” Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ø£Ù…Ø§Ù†</p>
                <div className="space-y-1.5 text-xs text-slate-600">
                  <p>â€¢ Ø§Ù„Ø®Ø±ÙˆØ¬ Ø§Ù„ØªÙ„Ù‚Ø§Ø¦ÙŠ Ø¨Ø¹Ø¯ 10 Ø¯Ù‚Ø§Ø¦Ù‚ Ù…Ù† Ø¹Ø¯Ù… Ø§Ù„Ù†Ø´Ø§Ø·</p>
                  <p>â€¢ Ø§Ù„Ø¬Ù„Ø³Ø© Ù…Ù‚ÙŠÙ‘Ø¯Ø© Ø¨Ø¬Ù‡Ø§Ø²ÙŠÙ† ÙƒØ­Ø¯ Ø£Ù‚ØµÙ‰</p>
                  <p>â€¢ ÙƒÙ„ Ø§Ù„Ø¹Ù…Ù„ÙŠØ§Øª Ù…Ø¤Ø±Ø´ÙØ© ÙÙŠ Ø³Ø¬Ù„ Ø§Ù„ØªØ¯Ù‚ÙŠÙ‚</p>
                  <p>â€¢ Ù…Ù†ØµØ© Ø¹Ù†Ø§ÙŠØ© Ù…Ø´ÙØ±Ø© ÙˆÙ…Ø­Ù…ÙŠØ© ÙˆÙÙ‚ Ù…Ø¹Ø§ÙŠÙŠØ± HIPAA</p>
                </div>
              </div>
            </div>
          )}

          {/* â”€â”€ NOTIFICATIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          {activeSection === "notifications" && (
            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-lg shadow-slate-200/40">
              <h2 className="font-black text-slate-800 text-lg mb-6 flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" /> ØªÙØ¶ÙŠÙ„Ø§Øª Ø§Ù„Ø¥Ø´Ø¹Ø§Ø±Ø§Øª
              </h2>
              <div className="space-y-4">
                {[
                  { label: "Ø·Ù„Ø¨ Ø¬Ø¯ÙŠØ¯ Ù…Ù† Ù…Ø±ÙŠØ¶", desc: "ØªÙ†Ø¨ÙŠÙ‡ ÙÙˆØ±ÙŠ Ø¹Ù†Ø¯ ÙˆØµÙˆÙ„ Ø·Ù„Ø¨", default: true },
                  { label: "Ù†ØªØ§Ø¦Ø¬ Ø§Ù„ØªØ­Ø§Ù„ÙŠÙ„", desc: "Ø¹Ù†Ø¯ Ø±ÙØ¹ Ù†ØªØ§Ø¦Ø¬ ØªØ­Ø§Ù„ÙŠÙ„ Ù…Ø±ÙŠØ¶Ùƒ", default: true },
                  { label: "ØªØ¬Ø¯ÙŠØ¯ Ø§Ù„Ø§Ø´ØªØ±Ø§Ùƒ", desc: "Ù‚Ø¨Ù„ ÙŠÙˆÙ…ÙŠÙ† Ù…Ù† Ø§Ù†ØªÙ‡Ø§Ø¡ Ø§Ù„Ø´Ù‡Ø±", default: true },
                  { label: "ØªÙ‚Ø±ÙŠØ± Ø£Ø³Ø¨ÙˆØ¹ÙŠ", desc: "Ù…Ù„Ø®Øµ Ù†Ø´Ø§Ø·Ùƒ Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹ÙŠ", default: false },
                  { label: "Ø±Ø³Ø§Ø¦Ù„ Ø§Ù„Ù†Ø¸Ø§Ù…", desc: "ØªØ­Ø¯ÙŠØ«Ø§Øª Ø§Ù„Ù…Ù†ØµØ© ÙˆØ§Ù„ØµÙŠØ§Ù†Ø©", default: true },
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

// â”€â”€ Helper components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
      {saving ? "Ø¬Ø§Ø±ÙŠ Ø§Ù„Ø­ÙØ¸..." : "Ø­ÙØ¸ Ø§Ù„ØªØºÙŠÙŠØ±Ø§Øª"}
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
