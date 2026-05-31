"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, LogOut, Users, ClipboardList, Calendar, Settings, PlusCircle, Globe, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/components/LanguageContext";

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { t, lang, setLang } = useLanguage();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const [reqCount, setReqCount] = useState(0);
  const [apptCount, setApptCount] = useState(0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from("medical_requests")
          .select("id", { count: "exact", head: true })
          .or(`doctor_id.eq.${user.id},doctor_id.is.null`)
          .eq("status", "PENDING")
          .then(({ count }) => { setReqCount(count || 0); });
          
        supabase
          .from("appointments")
          .select("id", { count: "exact", head: true })
          .eq("doctor_id", user.id)
          .eq("status", "PENDING")
          .then(({ count }) => { setApptCount(count || 0); });
      }
    });
  }, [pathname, supabase]);

  return (
    <div key={lang} className="flex h-screen bg-slate-50 overflow-hidden text-slate-800 font-sans selection:bg-blue-500/20 relative" dir={lang === "ar" ? "rtl" : "ltr"}>
      
      {/* Daylight Ambient Background */}
      <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-daylight">
         <div className="absolute top-[-10%] -left-[10%] w-[800px] h-[800px] bg-blue-200 rounded-full mix-blend-multiply filter blur-[150px] opacity-60 animate-pulse-soft"></div>
         <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-200 rounded-full mix-blend-multiply filter blur-[150px] opacity-50 animate-pulse-soft" style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* ─── Premium Blue Gradient Sidebar ─── */}
      <aside className="hidden md:flex w-72 flex-col z-20 h-screen relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #1d4ed8 0%, #0369a1 45%, #06b6d4 100%)", boxShadow: "4px 0 40px 0 rgba(59,130,246,0.35), 8px 0 80px 0 rgba(6,182,212,0.15)" }}>

        {/* Animated Stethoscope Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <motion.div
            animate={{ y: [0, -18, 0], rotate: [0, 4, -4, 0], scale: [1, 1.04, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-10 -right-10 text-white/5 text-[260px] leading-none"
            style={{ fontFamily: "sans-serif" }}
          >
            🩺
          </motion.div>
          <motion.div
            animate={{ y: [0, 12, 0], rotate: [0, -3, 3, 0] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-1/3 -left-16 text-white/5 text-[180px] leading-none"
          >
            🩺
          </motion.div>
        </div>

        {/* Decorative blobs inside sidebar */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-x-16 -translate-y-16 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-cyan-300/20 rounded-full blur-3xl -translate-x-10 translate-y-10 pointer-events-none" />

        {/* Logo Header */}
        <div className="relative z-10 p-6 flex items-center gap-3 border-b border-white/20">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-black/20">
            <img src="/logo.png" alt={t("platformTitle")} className="w-8 h-8 object-contain" />
          </div>
          <span className="text-white font-black text-xl tracking-wide drop-shadow-sm">{t("platformTitle")}</span>
        </div>
        
        {/* Nav Items */}
        <nav className="flex-1 px-4 py-6 space-y-2 relative z-10">
          <NavItem href="/dashboard" icon={<Home className="w-5 h-5"/>} label={t("dashboard")} current={pathname} />
          <NavItem href="/requests" icon={<Activity className="w-5 h-5"/>} label={t("requests")} current={pathname} badge={reqCount > 0 ? reqCount : undefined} />
          <NavItem href="/appointments" icon={<Calendar className="w-5 h-5"/>} label={t("appointments")} current={pathname} badge={apptCount > 0 ? apptCount : undefined} />
          <NavItem href="/prescriptions" icon={<ClipboardList className="w-5 h-5"/>} label={t("prescriptions")} current={pathname} />
          <NavItem href="/patients" icon={<Users className="w-5 h-5"/>} label={t("patients")} current={pathname} />
          <NavItem href="/settings" icon={<Settings className="w-5 h-5"/>} label={t("settings")} current={pathname} />

          {/* Quick action */}
          <div className="pt-4 mt-4 border-t border-white/20">
            <Link href="/prescriptions/new"
              className="flex items-center gap-3 px-4 py-4 rounded-2xl bg-white text-blue-700 font-black text-sm shadow-xl shadow-black/20 hover:shadow-black/30 hover:-translate-y-0.5 transition-all border border-white/80">
              <PlusCircle className="w-5 h-5 flex-shrink-0" />
              {t("newPrescription")}
            </Link>
          </div>
        </nav>

        {/* Footer */}
        <div className="relative z-10 p-4 border-t border-white/20 space-y-2">
          <button 
            onClick={() => setLang(lang === "ar" ? "fr" : "ar")}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white/90 hover:bg-white/15 transition-colors text-sm font-bold border border-white/20"
          >
            <Globe className="w-4 h-4"/>
            {lang === "ar" ? "Français" : "العربية"}
          </button>

          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-white/90 hover:bg-white/15 transition-colors text-sm font-bold border border-white/20">
            <LogOut className="w-4 h-4"/>
            {t("logout")}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col relative z-10 overflow-hidden pb-24 md:pb-0 ${lang === "ar" ? "text-right" : "text-left"}`}>
         <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full h-full overflow-y-auto"
            >
              <div className="p-8 max-w-[1700px] mx-auto min-h-full">
                {children}
              </div>
            </motion.div>
          </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full glass-panel border-t border-blue-100 z-50 flex justify-around items-center px-2 py-3" style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom))" }}>
        <MobileNavItem href="/dashboard" icon={<Home className="w-5 h-5"/>} label={t("dashboard")} current={pathname} />
        <MobileNavItem href="/requests" icon={<Activity className="w-5 h-5"/>} label={t("requests")} current={pathname} badge={reqCount > 0 ? reqCount : undefined} />
        <Link href="/prescriptions/new" className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full text-white shadow-lg shadow-blue-500/30 -mt-8 border-4 border-slate-50">
          <PlusCircle className="w-6 h-6" />
        </Link>
        <MobileNavItem href="/appointments" icon={<Calendar className="w-5 h-5"/>} label={t("appointments")} current={pathname} badge={apptCount > 0 ? apptCount : undefined} />
        <MobileNavItem href="/patients" icon={<Users className="w-5 h-5"/>} label={t("patients")} current={pathname} />
        <MobileNavItem href="/settings" icon={<Settings className="w-5 h-5"/>} label={t("settings")} current={pathname} />
      </nav>
    </div>
  );
}

function MobileNavItem({ href, icon, label, current, badge }: { href: string; icon: React.ReactNode; label: string, current: string, badge?: number }) {
  const isActive = current === href || (href !== '/dashboard' && current.startsWith(href));
  return (
    <Link href={href} prefetch={true} className={`flex flex-col items-center gap-1 min-w-[60px] ${isActive ? 'text-blue-600' : 'text-slate-400'} relative`}>
      <div className={`p-1.5 rounded-xl ${isActive ? 'bg-blue-50' : ''} relative`}>
        {icon}
        {badge !== undefined && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </div>
      <span className="text-[10px] font-bold">{label}</span>
    </Link>
  );
}

function NavItem({ href, icon, label, current, badge }: { href: string; icon: React.ReactNode; label: string, current: string, badge?: number }) {
  const isActive = current === href || (href !== '/dashboard' && current.startsWith(href));
  
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold relative group overflow-hidden ${isActive ? 'text-blue-800' : 'text-white/80 hover:text-white'}`}
    >
      {isActive && (
        <motion.div 
          layoutId="doctor-active-nav"
          className="absolute inset-0 bg-white rounded-2xl shadow-xl shadow-black/20"
        />
      )}
      {!isActive && (
        <div className="absolute inset-0 rounded-2xl bg-white/0 group-hover:bg-white/10 transition-colors duration-200" />
      )}
      <div className={`relative z-10 transition-transform duration-300 ${isActive ? 'text-blue-600 scale-110' : 'group-hover:scale-110'}`}>
        {icon}
      </div>
      <span className={`relative z-10 flex-1 text-base ${isActive ? 'text-blue-800 font-black' : 'font-bold'}`}>{label}</span>
      {badge !== undefined && (
        <span className="relative z-10 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white shadow-sm">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
}
