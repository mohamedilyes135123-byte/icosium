"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, FileText, Activity, User, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#022c22] flex items-center justify-center p-4 sm:p-8 overflow-hidden relative">
      
      {/* Background Ambient Mesh for outside the phone */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-50">
         <div className="absolute top-[-10%] -left-10 w-[500px] h-[500px] bg-emerald-500 rounded-full mix-blend-screen filter blur-[120px] opacity-40 animate-pulse"></div>
         <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-teal-400 rounded-full mix-blend-screen filter blur-[150px] opacity-30"></div>
      </div>

      {/* Mobile App Container (Frame) */}
      <div className="w-full max-w-[420px] h-[900px] max-h-[96vh] bg-slate-50/90 rounded-[3.5rem] overflow-hidden shadow-2xl relative border-[12px] border-black flex flex-col ring-[1px] ring-white/10 z-10">
        
        {/* Dynamic Island / Notch Mock */}
        <div className="absolute top-0 inset-x-0 h-8 flex justify-center z-[60]">
          <div className="w-36 h-8 bg-black rounded-b-3xl"></div>
        </div>

        {/* Ambient App Background Gradients (inside phone) */}
        <div className="absolute top-0 w-full h-full pointer-events-none z-0">
           <div className="absolute top-0 right-0 w-full h-96 bg-gradient-to-b from-emerald-100/80 to-transparent"></div>
           <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-300 rounded-full mix-blend-multiply filter blur-[80px] opacity-70"></div>
           <div className="absolute top-48 -left-24 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-[80px] opacity-50"></div>
        </div>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative scrollbar-hide z-10 w-full flex flex-col items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full h-full flex flex-col"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Navigation Bar - Ultimate Glassmorphism */}
        <nav className="absolute bottom-5 left-4 right-4 bg-white/40 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white/60 p-2 flex justify-between items-center z-[50]">
          <NavItem href="/patient/dashboard" icon={<Home className="w-5 h-5"/>} label="الرئيسية" current={pathname} />
          <NavItem href="/patient/doctors" icon={<Search className="w-5 h-5"/>} label="بحث" current={pathname} />
          
          {/* Main Floating FAB for AI Chat */}
          <Link href="/patient/ai-chat" className="relative group -mt-10 mx-2 block outline-none">
            <div className="absolute inset-0 bg-emerald-400 opacity-50 blur-xl rounded-full group-hover:opacity-80 transition-opacity duration-500"></div>
            <motion.div 
               whileTap={{ scale: 0.9 }}
               whileHover={{ scale: 1.05 }}
               className="w-16 h-16 bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 rounded-full border-[3px] border-white/80 flex flex-col items-center justify-center text-white shadow-xl shadow-emerald-500/30 relative z-10"
            >
              <Sparkles className="w-7 h-7 absolute top-2 right-2 opacity-50 animate-pulse" strokeWidth={1.5} />
              <Activity className="w-7 h-7" />
            </motion.div>
          </Link>
          
          <NavItem href="/patient/requests" icon={<FileText className="w-5 h-5"/>} label="طلباتي" current={pathname} />
          <NavItem href="/patient/profile" icon={<User className="w-5 h-5"/>} label="حسابي" current={pathname} />
        </nav>

        {/* Home Indicator line */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-black/20 rounded-full z-[60]"></div>
      </div>

      <style>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        /* Hide scrollbar for IE, Edge and Firefox */
        .scrollbar-hide {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </div>
  );
}

function NavItem({ href, icon, label, current }: { href: string; icon: React.ReactNode; label: string, current: string }) {
  const isActive = current === href; 
  
  return (
    <Link 
      href={href} 
      className="flex flex-col items-center justify-center w-14 h-12 gap-1.5 relative group outline-none"
    >
      <div className={`transition-all duration-300 ${isActive ? 'text-emerald-600 scale-110 drop-shadow-md' : 'text-slate-400 group-hover:text-emerald-500'}`}>
        {icon}
      </div>
      <span className={`text-[9px] font-bold transition-all duration-300 ${isActive ? 'text-emerald-700 opacity-100' : 'text-slate-400 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0'}`}>
        {label}
      </span>
      {isActive && (
        <motion.div 
          layoutId="navIndicator"
          className="absolute -top-1.5 w-1 h-1 bg-emerald-500 rounded-full"
        />
      )}
    </Link>
  );
}
