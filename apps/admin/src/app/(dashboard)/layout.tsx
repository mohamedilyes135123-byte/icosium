"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShieldAlert, LogOut, Users, FileLock2, ShieldCheck, BarChart3, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    supabase.from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("approval_status", "pending")
      .neq("role", "patient")
      .then(({ count }) => setPendingCount(count || 0));
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden text-slate-800 font-sans selection:bg-violet-500/20 relative" dir="rtl">
      
      {/* Bright Ambient Background */}
      <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden" style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0fdfa 100%)" }}>
        <div className="absolute top-[-10%] -right-[10%] w-[700px] h-[700px] bg-violet-200 rounded-full mix-blend-multiply filter blur-[150px] opacity-50 animate-pulse-soft"></div>
        <div className="absolute bottom-[-20%] -left-[10%] w-[600px] h-[600px] bg-indigo-200 rounded-full mix-blend-multiply filter blur-[150px] opacity-40 animate-pulse-soft" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-[400px] h-[400px] bg-cyan-100 rounded-full mix-blend-multiply filter blur-[120px] opacity-30 animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* ─── Premium Daylight Sidebar ─── */}
      <aside className="w-72 flex-col z-20 h-screen relative overflow-hidden hidden md:flex"
        style={{ 
          background: "linear-gradient(170deg, #4f46e5 0%, #7c3aed 40%, #6d28d9 70%, #4338ca 100%)",
          boxShadow: "4px 0 40px 0 rgba(109,40,217,0.35), 8px 0 80px 0 rgba(79,70,229,0.15)"
        }}>

        {/* Animated floating shield */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-8 -right-8 text-[240px] leading-none opacity-[0.06]"
          >
            🛡️
          </motion.div>
          <motion.div
            animate={{ y: [0, 14, 0], rotate: [0, -4, 4, 0] }}
            transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 3 }}
            className="absolute top-1/4 -left-14 text-[160px] leading-none opacity-[0.04]"
          >
            🔐
          </motion.div>
        </div>

        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-56 h-56 bg-white/10 rounded-full blur-3xl -translate-x-20 -translate-y-20 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-44 h-44 bg-indigo-300/20 rounded-full blur-3xl translate-x-10 translate-y-10 pointer-events-none" />

        {/* Logo Header */}
        <div className="relative z-10 p-6 flex items-center gap-3 border-b border-white/20">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-black/20 shrink-0">
            <img src="/logo.png" alt="إدارة النظام" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <span className="text-white font-black text-lg tracking-wide drop-shadow-sm block leading-tight">إدارة النظام</span>
            <span className="text-violet-200 text-xs font-bold">لوحة التحكم</span>
          </div>
        </div>
        
        {/* Nav Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 relative z-10">
          <NavItem href="/dashboard" icon={<BarChart3 className="w-5 h-5"/>} label="لوحة التحكم" current={pathname} gradient="from-blue-500 to-cyan-400" />

          <div className="relative">
            <NavItem href="/approvals" icon={<ShieldCheck className="w-5 h-5"/>} label="التراخيص" current={pathname} gradient="from-emerald-500 to-teal-400" />
            {pendingCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-gradient-to-br from-rose-500 to-amber-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg border-2 border-white/30 z-20">
                {pendingCount}
              </motion.span>
            )}
          </div>

          <NavItem href="/users" icon={<Users className="w-5 h-5"/>} label="المستخدمين" current={pathname} gradient="from-violet-500 to-purple-400" />
          <NavItem href="/audit" icon={<FileLock2 className="w-5 h-5"/>} label="سجل التدقيق" current={pathname} gradient="from-rose-500 to-pink-400" />
        </nav>

        {/* Footer */}
        <div className="relative z-10 p-4 border-t border-white/20 space-y-2">
          <button onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl bg-white text-violet-700 font-black text-sm shadow-xl shadow-black/20 hover:shadow-black/30 hover:-translate-y-0.5 transition-all border border-white/80">
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
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
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

function NavItem({ href, icon, label, current, gradient }: { href: string; icon: React.ReactNode; label: string; current: string; gradient: string }) {
  const isActive = current === href || (href !== '/dashboard' && current.startsWith(href));
  
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold relative group overflow-hidden ${isActive ? 'text-slate-800' : 'text-white/80 hover:text-white'}`}
    >
      {isActive ? (
        <motion.div 
          layoutId="admin-active-nav"
          className="absolute inset-0 bg-white rounded-2xl shadow-xl shadow-black/20"
        />
      ) : (
        <div className="absolute inset-0 rounded-2xl bg-white/0 group-hover:bg-white/10 transition-colors duration-200" />
      )}

      <div className={`relative z-10 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-110 ${
        isActive 
          ? `bg-gradient-to-br ${gradient} text-white shadow-lg` 
          : 'bg-white/15 text-white'
      }`}>
        {icon}
      </div>
      <span className={`relative z-10 flex-1 text-base ${isActive ? 'text-slate-800 font-black' : 'font-bold'}`}>{label}</span>
    </Link>
  );
}
