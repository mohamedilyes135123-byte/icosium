"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Search, Settings, Activity, Sparkles, LogOut, FileSignature } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-8 overflow-hidden relative">
      
      {/* Background Ambient Mesh for outside the phone */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-80">
         <div className="absolute top-[-10%] -left-10 w-[500px] h-[500px] bg-blue-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-60"></div>
         <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-200 rounded-full mix-blend-multiply filter blur-[150px] opacity-70"></div>
      </div>

      {/* Android Mobile App Container (Frame) */}
      <div className="w-full max-w-[420px] h-[900px] max-h-[96vh] bg-slate-50 rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)] relative border-[10px] border-slate-900 flex flex-col z-10 ring-4 ring-slate-800">
        
        {/* Android Punch Hole Camera Mock */}
        <div className="absolute top-3 inset-x-0 flex justify-center z-[70] pointer-events-none">
          <div className="w-4 h-4 bg-slate-950 rounded-full border border-slate-800 shadow-inner"></div>
        </div>

        {/* Ambient App Background Gradients (inside phone) */}
        <div className="absolute top-0 w-full h-full pointer-events-none z-0">
           <div className="absolute top-0 right-0 w-full h-96 bg-gradient-to-b from-blue-100/90 to-transparent"></div>
           <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-300 rounded-full mix-blend-multiply filter blur-[80px] opacity-50"></div>
        </div>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative scrollbar-hide z-10 w-full flex flex-col pt-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full h-full flex flex-col"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Android Bottom Navigation Bar - Glassmorphism */}
        <nav className="absolute bottom-0 w-full bg-white/70 backdrop-blur-3xl shadow-[0_-8px_30px_rgba(59,130,246,0.1)] border-t border-white p-3 pt-4 flex justify-between items-center z-[50] rounded-t-3xl pb-6">
          <NavItem href="/doctor/dashboard" icon={<Home className="w-[22px] h-[22px]"/>} label="العيادة" current={pathname} />
          <NavItem href="/doctor/requests" icon={<FileSignature className="w-[22px] h-[22px]"/>} label="الاستشارات" current={pathname} />
          
          {/* Main Floating FAB for New Prescription/Scan */}
          <Link href="/doctor/prescriptions/new" className="relative group -mt-10 mx-1 block outline-none">
            <div className="absolute inset-0 bg-blue-400 opacity-40 blur-xl rounded-full group-hover:opacity-70 transition-opacity duration-300"></div>
            <motion.div 
               whileTap={{ scale: 0.9 }}
               className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-2xl rotate-45 border-[3px] border-white/80 flex items-center justify-center text-white shadow-xl shadow-blue-500/40 relative z-10"
            >
              <div className="-rotate-45 flex items-center justify-center">
                 <FileText className="w-6 h-6" />
              </div>
            </motion.div>
          </Link>
          
          <NavItem href="/doctor/patients" icon={<Search className="w-[22px] h-[22px]"/>} label="مرضاي" current={pathname} />
          <NavItem href="/doctor/settings" icon={<Settings className="w-[22px] h-[22px]"/>} label="حسابي" current={pathname} />
        </nav>

      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

function NavItem({ href, icon, label, current }: { href: string; icon: React.ReactNode; label: string, current: string }) {
  const isActive = current === href || (href !== '/doctor/dashboard' && current.includes(href)); 
  
  return (
    <Link 
      href={href} 
      className="flex flex-col items-center justify-center w-14 gap-1.5 relative group outline-none"
    >
      <div className={`transition-all duration-300 px-4 py-1 rounded-full ${isActive ? 'text-blue-700 bg-blue-100 drop-shadow-sm' : 'text-slate-400 group-hover:text-blue-500'}`}>
        {icon}
      </div>
      <span className={`text-[9px] font-bold transition-all duration-300 ${isActive ? 'text-blue-800' : 'text-slate-500'}`}>
        {label}
      </span>
    </Link>
  );
}
