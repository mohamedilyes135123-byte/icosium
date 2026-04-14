"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldAlert, LogOut, Users, FileLock2, ShieldCheck, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-800 font-sans selection:bg-rose-500/20 relative">
      
      {/* Crimson Light Background / Glass Ambient */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-60">
         <div className="absolute top-[-10%] -left-[10%] w-[800px] h-[800px] bg-rose-200 rounded-full mix-blend-multiply filter blur-[150px] opacity-40"></div>
         <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-red-200 rounded-full mix-blend-multiply filter blur-[150px] opacity-30"></div>
      </div>

      {/* Bright Glass Sidebar */}
      <aside className="w-72 border-r rtl:border-l rtl:border-r-0 border-white/80 flex flex-col z-20 h-screen bg-white/40 backdrop-blur-3xl shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-6 flex items-center gap-3 text-slate-800 font-bold text-xl border-b border-rose-100/50 bg-white/50">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-red-400 flex items-center justify-center shadow-lg shadow-rose-500/20 border border-white">
             <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <span className="tracking-wide">Administration</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 relative">
          <NavItem href="/admin/dashboard" icon={<BarChart3 className="w-5 h-5"/>} label="لوحة التحكم الأمنية" current={pathname} />
          <NavItem href="/admin/approvals" icon={<ShieldCheck className="w-5 h-5"/>} label="التراخيص والصلاحيات" current={pathname} />
          <NavItem href="/admin/users" icon={<Users className="w-5 h-5"/>} label="حظر وإدارة المستخدمين" current={pathname} />
          <NavItem href="/admin/audit" icon={<FileLock2 className="w-5 h-5"/>} label="سجل التدقيق (Audit Logs)" current={pathname} />
        </nav>

        <div className="p-4 border-t border-rose-100/50 bg-white/40">
          <button className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-colors text-sm font-bold border border-rose-100 bg-white/50 shadow-sm">
            <LogOut className="w-4 h-4"/>
            تسجيل الخروج المباشر
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
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
  const isActive = current === href || (href !== '/admin/dashboard' && current.includes(href));
  
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-300 font-bold relative group overflow-hidden ${isActive ? 'text-rose-800' : 'text-slate-500 hover:text-slate-800'}`}
    >
      {isActive && (
        <motion.div 
          layoutId="admin-active-nav"
          className="absolute inset-0 bg-white/80 border border-white rounded-xl shadow-[0_2px_15px_rgba(225,29,72,0.08)] backdrop-blur-sm"
        />
      )}
      <div className={`relative z-10 transition-transform duration-300 ${isActive ? 'text-rose-600 scale-110 drop-shadow-[0_0_10px_rgba(225,29,72,0.2)]' : 'group-hover:scale-110'}`}>
        {icon}
      </div>
      <span className="relative z-10">{label}</span>
    </Link>
  );
}
