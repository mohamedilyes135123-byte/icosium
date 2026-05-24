"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Stethoscope, LogOut, Users, FileText, Calendar, LayoutDashboard, Settings, PlusCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

export default function DoctorLayout({
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
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-800 font-sans selection:bg-blue-500/20 relative">
      
      {/* Daylight Ambient Background */}
      <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-daylight">
         <div className="absolute top-[-10%] -left-[10%] w-[800px] h-[800px] bg-blue-200 rounded-full mix-blend-multiply filter blur-[150px] opacity-60 animate-pulse-soft"></div>
         <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-200 rounded-full mix-blend-multiply filter blur-[150px] opacity-50 animate-pulse-soft" style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* Bright Glass Sidebar (Desktop) */}
      <aside className="hidden md:flex w-72 border-r rtl:border-l rtl:border-r-0 border-blue-100 flex-col z-20 h-screen glass-panel">
        <div className="p-6 flex items-center gap-3 text-slate-800 font-bold text-xl border-b border-blue-100 bg-white/50">
          <img src="/logo.png" alt="Ø¹Ù†Ø§ÙŠØ©" className="w-10 h-10 object-contain" />
          <span className="tracking-wide">Ù…Ù†ØµØ© Ø§Ù„Ø·Ø¨ÙŠØ¨</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 relative">
          <NavItem href="/dashboard" icon={<LayoutDashboard className="w-5 h-5"/>} label="Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…" current={pathname} />
          <NavItem href="/requests" icon={<Calendar className="w-5 h-5"/>} label="Ø·Ù„Ø¨Ø§Øª Ø§Ù„Ù…Ø±Ø¶Ù‰" current={pathname} />
          <NavItem href="/appointments" icon={<Calendar className="w-5 h-5"/>} label="المواعيد" current={pathname} />
          <NavItem href="/prescriptions" icon={<FileText className="w-5 h-5"/>} label="ÙˆØµÙØ§ØªÙŠ ÙˆØªØ­Ø§Ù„ÙŠÙ„ÙŠ" current={pathname} />
          <NavItem href="/patients" icon={<Users className="w-5 h-5"/>} label="Ù…Ù„ÙØ§Øª Ø§Ù„Ù…Ø±Ø¶Ù‰" current={pathname} />
          <NavItem href="/settings" icon={<Settings className="w-5 h-5"/>} label="Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª" current={pathname} />

          {/* Quick action */}
          <div className="pt-3 mt-3 border-t border-blue-100">
            <Link href="/prescriptions/new"
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gradient-to-l from-blue-600 to-cyan-500 text-white font-bold text-sm shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all">
              <PlusCircle className="w-5 h-5 flex-shrink-0" />
              ÙˆØµÙØ© Ø¬Ø¯ÙŠØ¯Ø©
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-blue-100 bg-white/40">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors text-sm font-bold border border-rose-100 bg-white/50 shadow-sm">
            <LogOut className="w-4 h-4"/>
            ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-10 overflow-hidden text-right pb-24 md:pb-0">
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
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full glass-panel border-t border-blue-100 z-50 flex justify-around items-center px-2 py-3" style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom))" }}>
        <MobileNavItem href="/dashboard" icon={<LayoutDashboard className="w-5 h-5"/>} label="Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©" current={pathname} />
        <MobileNavItem href="/requests" icon={<Calendar className="w-5 h-5"/>} label="Ø§Ù„Ø·Ù„Ø¨Ø§Øª" current={pathname} />
        <Link href="/prescriptions/new" className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full text-white shadow-lg shadow-blue-500/30 -mt-8 border-4 border-slate-50">
          <PlusCircle className="w-6 h-6" />
        </Link>
        <MobileNavItem href="/patients" icon={<Users className="w-5 h-5"/>} label="Ø§Ù„Ù…Ø±Ø¶Ù‰" current={pathname} />
        <MobileNavItem href="/settings" icon={<Settings className="w-5 h-5"/>} label="Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª" current={pathname} />
      </nav>
    </div>
  );
}

function MobileNavItem({ href, icon, label, current }: { href: string; icon: React.ReactNode; label: string, current: string }) {
  const isActive = current === href || (href !== '/dashboard' && current.startsWith(href));
  return (
    <Link href={href} prefetch={true} className={`flex flex-col items-center gap-1 min-w-[60px] ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
      <div className={`p-1.5 rounded-xl ${isActive ? 'bg-blue-50' : ''}`}>
        {icon}
      </div>
      <span className="text-[10px] font-bold">{label}</span>
    </Link>
  );
}

function NavItem({ href, icon, label, current }: { href: string; icon: React.ReactNode; label: string, current: string }) {
  const isActive = current === href || (href !== '/dashboard' && current.startsWith(href));
  
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-300 font-bold relative group overflow-hidden ${isActive ? 'text-blue-900' : 'text-slate-500 hover:text-slate-800'}`}
    >
      {isActive && (
        <motion.div 
          layoutId="doctor-active-nav"
          className="absolute inset-0 bg-white/80 border border-white rounded-xl shadow-[0_2px_15px_rgba(37,99,235,0.08)] backdrop-blur-sm"
        />
      )}
      <div className={`relative z-10 transition-transform duration-300 ${isActive ? 'text-blue-600 scale-110 drop-shadow-[0_0_10px_rgba(37,99,235,0.2)]' : 'group-hover:scale-110'}`}>
        {icon}
      </div>
      <span className="relative z-10">{label}</span>
    </Link>
  );
}

