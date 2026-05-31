"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/LanguageContext";
import { Globe, Pill, LogOut, PackageSearch, FileSearch, LayoutDashboard, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PharmacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { t, lang, setLang } = useLanguage();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-800 font-sans selection:bg-teal-500/20 relative">
      
      {/* Daylight Ambient Background */}
      <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-daylight">
         <div className="absolute top-[-10%] -left-[10%] w-[800px] h-[800px] bg-emerald-200 rounded-full mix-blend-multiply filter blur-[150px] opacity-60 animate-pulse-soft"></div>
         <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-green-200 rounded-full mix-blend-multiply filter blur-[150px] opacity-50 animate-pulse-soft" style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* Distinctive Deep Daylight Sidebar */}
      <aside className="w-72 border-r rtl:border-l rtl:border-r-0 border-teal-600/30 flex flex-col z-20 h-screen bg-gradient-to-b from-teal-600 to-teal-700 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-md pointer-events-none" />
        
        <div className="p-6 flex items-center gap-3 font-bold text-xl border-b border-white/10 relative z-10">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <img src="/logo.png" alt="عناية" className="w-7 h-7 object-contain" />
          </div>
          <span className="tracking-wide text-white drop-shadow-md">{t("platformTitle")}</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 relative z-10">
          <NavItem href="/dashboard" icon={<LayoutDashboard className="w-5 h-5"/>} label={t("dashboard")} current={pathname} />
          <NavItem href="/prescriptions" icon={<FileSearch className="w-5 h-5"/>} label={lang === "ar" ? "الوصفات الطبية" : "Ordonnances médicales"} current={pathname} />
          <NavItem href="/inventory" icon={<PackageSearch className="w-5 h-5"/>} label={lang === "ar" ? "المخزون والطلبات" : "Inventaire et commandes"} current={pathname} />
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
      <main className="flex-1 flex flex-col relative z-10 overflow-hidden text-right">
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
      className={`flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-300 font-bold relative group overflow-hidden ${isActive ? 'text-teal-700' : 'text-teal-50 hover:text-white'}`}
    >
      {isActive && (
        <motion.div 
          layoutId="pharmacy-active-nav"
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
