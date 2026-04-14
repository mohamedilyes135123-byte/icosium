"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FlaskConical, Activity, LogOut, FileText, FlaskRound } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-800 font-sans selection:bg-cyan-500/20 relative">
      
      {/* Light Cyan/Teal Background / Glass Ambient for Labs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-60">
         <div className="absolute top-[-10%] -left-[10%] w-[800px] h-[800px] bg-cyan-200 rounded-full mix-blend-multiply filter blur-[150px] opacity-40"></div>
         <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-teal-200 rounded-full mix-blend-multiply filter blur-[150px] opacity-30"></div>
      </div>

      {/* Bright Glass Sidebar */}
      <aside className="w-72 border-r rtl:border-l rtl:border-r-0 border-white/80 flex flex-col z-20 h-screen bg-white/40 backdrop-blur-3xl shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-6 flex items-center gap-3 text-slate-800 font-bold text-xl border-b border-cyan-100/50 bg-white/50">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-white">
             <FlaskConical className="w-6 h-6 text-white" />
          </div>
          <span>عناية | المخبر</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 relative">
          <NavItem href="/lab/dashboard" icon={<Activity className="w-5 h-5"/>} label="لوحة التحكم" current={pathname} />
          <NavItem href="/lab/requests" icon={<FileText className="w-5 h-5"/>} label="طلبات التحاليل" current={pathname} />
          <NavItem href="/lab/results" icon={<FlaskRound className="w-5 h-5"/>} label="إصدار النتائج" current={pathname} />
        </nav>

        <div className="p-4 border-t border-cyan-100/50 bg-white/40">
          <button className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors text-sm font-bold border border-white bg-white/50 shadow-sm">
            <LogOut className="w-4 h-4"/>
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
         <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full h-full overflow-y-auto"
            >
              <div className="p-8 max-w-[1600px] mx-auto min-h-full">
                {children}
              </div>
            </motion.div>
          </AnimatePresence>
      </main>
    </div>
  );
}

function NavItem({ href, icon, label, current }: { href: string; icon: React.ReactNode; label: string, current: string }) {
  const isActive = current === href || (href !== '/lab/dashboard' && current.includes(href));
  
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-bold relative group overflow-hidden ${isActive ? 'text-cyan-800' : 'text-slate-500 hover:text-slate-800'}`}
    >
      {isActive && (
        <motion.div 
          layoutId="lab-active-nav"
          className="absolute inset-0 bg-white/80 border border-white rounded-xl shadow-[0_2px_15px_rgba(6,182,212,0.08)] backdrop-blur-sm"
        />
      )}
      <div className={`relative z-10 transition-transform duration-300 ${isActive ? 'text-cyan-600 scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.2)]' : 'group-hover:scale-110'}`}>
        {icon}
      </div>
      <span className="relative z-10">{label}</span>
    </Link>
  );
}
