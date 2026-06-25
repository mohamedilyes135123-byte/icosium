"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/LanguageContext";
import { Globe, TestTube2, LogOut, ClipboardList, Beaker, LayoutDashboard, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { t, lang, setLang } = useLanguage();

  return (
    <div className="flex h-[100dvh] bg-slate-50 overflow-hidden text-slate-800 font-sans selection:bg-indigo-500/20 relative" dir="rtl">
      
      {/* Daylight Ambient Background */}
      <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-daylight">
         <div className="absolute top-[-10%] -left-[10%] w-[800px] h-[800px] bg-teal-200 rounded-full mix-blend-multiply filter blur-[150px] opacity-60 animate-pulse-soft"></div>
         <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-200 rounded-full mix-blend-multiply filter blur-[150px] opacity-50 animate-pulse-soft" style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* Distinctive Deep Daylight Sidebar */}
      <aside className="w-72 border-l border-cyan-600/30 flex flex-col z-30 h-screen bg-gradient-to-b from-cyan-600 to-sky-700 text-white shadow-2xl overflow-hidden fixed top-0 right-0">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-md pointer-events-none" />
        
        <div className="p-6 flex items-center gap-3 font-bold text-xl border-b border-white/10 relative z-10">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <img src="/logo.png" alt="عناية" className="w-7 h-7 object-contain" />
          </div>
          <span className="tracking-wide text-white drop-shadow-md">{t("platformTitle")}</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 relative z-10">
          <NavItem href="/dashboard" icon={<LayoutDashboard className="w-5 h-5"/>} label={t("dashboard")} current={pathname} />
          <NavItem href="/requests" icon={<ClipboardList className="w-5 h-5"/>} label={t("requests")} current={pathname} />
          <NavItem href="/results" icon={<Beaker className="w-5 h-5"/>} label={lang === "ar" ? "النتائج" : "Résultats"} current={pathname} />
          <NavItem href="/settings" icon={<Settings className="w-5 h-5"/>} label={t("settings")} current={pathname} />
        </nav>

        <div className="p-4 border-t border-white/10 relative z-10">
          {/* Language Switcher */}
          <button 
            onClick={() => setLang(lang === "ar" ? "fr" : "ar")}
            className="w-full mb-2 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white hover:bg-white/10 transition-colors text-sm font-bold border border-white/20 shadow-sm"
          >
            <Globe className="w-4 h-4"/>
            {lang === "ar" ? "Français" : "العربية"}
          </button>

          <button className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-rose-100 hover:bg-rose-500 hover:text-white transition-colors text-sm font-bold border border-white/20 shadow-sm">
            <LogOut className="w-4 h-4"/>
            {t("logout")}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-10 overflow-visible text-right mr-72">
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
    </div>
  );
}

function NavItem({ href, icon, label, current }: { href: string; icon: React.ReactNode; label: string, current: string }) {
  const isActive = current === href || (href !== '/dashboard' && current.startsWith(href));
  
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-300 font-bold relative group overflow-hidden ${isActive ? 'text-cyan-700' : 'text-cyan-50 hover:text-white'}`}
    >
      {isActive && (
        <motion.div 
          layoutId="lab-active-nav"
          className="absolute inset-0 bg-white shadow-lg backdrop-blur-sm rounded-xl"
        />
      )}
      <div className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
        {icon}
      </div>
      <span className="relative z-10">{label}</span>
    </Link>
  );
}
