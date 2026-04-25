"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, HeartPulse, User, LogOut, Search, Activity, Sparkles, Star, Thermometer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden text-slate-800 font-sans selection:bg-emerald-500/20 relative">
      
      {/* Emerald Green Ambient Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-60">
         <div className="absolute top-[-10%] -left-[10%] w-[800px] h-[800px] bg-emerald-100 rounded-full mix-blend-multiply filter blur-[150px] opacity-40"></div>
         <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-green-100 rounded-full mix-blend-multiply filter blur-[150px] opacity-30"></div>
      </div>

      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-72 border-r rtl:border-l rtl:border-r-0 border-emerald-100 flex-col bg-white/40 backdrop-blur-3xl">
          <div className="p-6 flex items-center gap-3 text-slate-800 font-bold text-xl border-b border-emerald-100">
            <img src="/logo.png" alt="عناية" className="w-10 h-10 object-contain" />
            <span>عناية للمرضى</span>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-2">
            <DesktopNavItem href="/dashboard" icon={<Home className="w-5 h-5"/>} label="الرئيسية" current={pathname} />
            <DesktopNavItem href="/ai-chat" icon={<Sparkles className="w-5 h-5"/>} label="المساعد الذكي" current={pathname} />
            <DesktopNavItem href="/doctors" icon={<Search className="w-5 h-5"/>} label="البحث عن طبيب" current={pathname} />
            <DesktopNavItem href="/requests" icon={<Activity className="w-5 h-5"/>} label="طلباتي الطبية" current={pathname} />
            <DesktopNavItem href="/results" icon={<Star className="w-5 h-5"/>} label="نتائجي وطلباتي" current={pathname} />
            <DesktopNavItem href="/vitals" icon={<Thermometer className="w-5 h-5"/>} label="قياساتي اليومية" current={pathname} />
            <DesktopNavItem href="/profile" icon={<User className="w-5 h-5"/>} label="الملف الصحي" current={pathname} />
          </nav>

          <div className="p-4 border-t border-emerald-100">
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors text-sm font-bold border border-rose-100">
              <LogOut className="w-4 h-4"/>
              تسجيل الخروج
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col relative overflow-hidden text-right">
           <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full overflow-y-auto"
              >
                <div className="p-4 md:p-8 max-w-5xl mx-auto pb-32 md:pb-8">
                  {children}
                </div>
              </motion.div>
            </AnimatePresence>
        </main>
      </div>

      {/* Mobile Navigation (Bottom Bar) — 5 items */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-2xl border-t border-emerald-100 px-2 py-3 flex justify-between items-center z-50">
         <MobileNavItem href="/dashboard" icon={<Home className="w-5 h-5"/>} label="الرئيسية" active={pathname === '/dashboard'} />
         <MobileNavItem href="/vitals" icon={<Thermometer className="w-5 h-5"/>} label="قياسات" active={pathname.startsWith('/vitals')} />
         <MobileNavItem href="/requests" icon={<Activity className="w-5 h-5"/>} label="طلباتي" active={pathname.startsWith('/requests')} />
         <MobileNavItem href="/results" icon={<Star className="w-5 h-5"/>} label="نتائجي" active={pathname.startsWith('/results')} />
         <MobileNavItem href="/profile" icon={<User className="w-5 h-5"/>} label="ملفي" active={pathname === '/profile'} />
      </nav>
    </div>
  );
}

function DesktopNavItem({ href, icon, label, current }: any) {
  const isActive = current === href || (href !== '/dashboard' && current.startsWith(href));
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-bold ${isActive ? 'bg-emerald-100/50 text-emerald-800 border border-emerald-200 shadow-sm' : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50/50'}`}
    >
      <div className={`${isActive ? 'text-emerald-600' : ''}`}>
        {icon}
      </div>
      <span>{label}</span>
    </Link>
  );
}

function MobileNavItem({ href, icon, label, active }: any) {
  return (
    <Link href={href} className="relative flex flex-col items-center gap-0.5 p-1.5 min-w-[52px]">
      <div className={`transition-all duration-300 ${active ? 'text-emerald-600 scale-110' : 'text-slate-400'}`}>
        {icon}
      </div>
      <span className={`text-[9px] font-bold transition-colors ${active ? 'text-emerald-600' : 'text-slate-400'}`}>{label}</span>
      {active && <motion.div layoutId="mobile-nav-dot" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-600 rounded-full" />}
    </Link>
  );
}
