"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Pill, LogOut, PackageSearch, FileSearch, LayoutDashboard, Settings, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PharmacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-800 font-sans selection:bg-teal-500/20 relative">
      
      {/* Daylight Ambient Background */}
      <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-daylight">
         <div className="absolute top-[-10%] -left-[10%] w-[800px] h-[800px] bg-emerald-200 rounded-full mix-blend-multiply filter blur-[150px] opacity-60 animate-pulse-soft"></div>
         <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-green-200 rounded-full mix-blend-multiply filter blur-[150px] opacity-50 animate-pulse-soft" style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* Glass Sidebar */}
      <aside className="w-72 border-r rtl:border-l rtl:border-r-0 border-teal-100 flex flex-col z-20 h-screen glass-panel">
        <div className="p-6 flex items-center gap-3 text-slate-800 font-bold text-xl border-b border-teal-100 bg-white/50">
          <img src="/logo.png" alt="Ø¹Ù†Ø§ÙŠØ©" className="w-10 h-10 object-contain" />
          <span className="tracking-wide">Ù†Ø¸Ø§Ù… Ø§Ù„ØµÙŠØ¯Ù„ÙŠØ©</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 relative">
          <NavItem href="/dashboard" icon={<LayoutDashboard className="w-5 h-5"/>} label="Ù„ÙˆØ­Ø© Ø§Ù„ØªØ­ÙƒÙ…" current={pathname} />
          <NavItem href="/prescriptions" icon={<FileSearch className="w-5 h-5"/>} label="Ø§Ù„ÙˆØµÙØ§Øª Ø§Ù„Ø·Ø¨ÙŠØ©" current={pathname} />
          <NavItem href="/inventory" icon={<PackageSearch className="w-5 h-5"/>} label="Ø§Ù„Ù…Ø®Ø²ÙˆÙ† ÙˆØ§Ù„Ø·Ù„Ø¨Ø§Øª" current={pathname} />
          <NavItem href="/settings" icon={<Settings className="w-5 h-5"/>} label="Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª" current={pathname} />
        </nav>

        <div className="p-4 border-t border-teal-100 bg-white/40">
          <button className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-teal-600 hover:bg-teal-50 hover:text-teal-700 transition-colors text-sm font-bold border border-teal-100 bg-white/50 shadow-sm">
            <LogOut className="w-4 h-4"/>
            ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬
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
    </div>
  );
}

function NavItem({ href, icon, label, current }: { href: string; icon: React.ReactNode; label: string, current: string }) {
  const isActive = current === href || (href !== '/dashboard' && current.startsWith(href));
  
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-300 font-bold relative group overflow-hidden ${isActive ? 'text-teal-900' : 'text-slate-500 hover:text-slate-800'}`}
    >
      {isActive && (
        <motion.div 
          layoutId="pharmacy-active-nav"
          className="absolute inset-0 bg-white/80 border border-white rounded-xl shadow-[0_2px_15px_rgba(124,58,237,0.08)] backdrop-blur-sm"
        />
      )}
      <div className={`relative z-10 transition-transform duration-300 ${isActive ? 'text-teal-600 scale-110 drop-shadow-[0_0_10px_rgba(124,58,237,0.2)]' : 'group-hover:scale-110'}`}>
        {icon}
      </div>
      <span className="relative z-10">{label}</span>
    </Link>
  );
}

