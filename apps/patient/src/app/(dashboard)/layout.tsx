"use client";
export const dynamic = "force-dynamic";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Home, HeartPulse, User, LogOut, Search, Activity, Sparkles, Thermometer, ClipboardList, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import LanguageToggle from "@/components/ui/LanguageToggle";

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const { t, language } = useTranslation();
  const isRtl = language === 'ar';

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.href = "/login";
      } else {
        setChecking(false);
      }
    });
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const sideNav = [
    { href: "/dashboard", icon: <Home className="w-5 h-5" />,         label: t.sidebar.dashboard },
    { href: "/ai-chat",   icon: <Sparkles className="w-5 h-5" />,     label: t.sidebar.aiChat },
    { href: "/requests",  icon: <Activity className="w-5 h-5" />,      label: t.sidebar.requests },
    { href: "/appointments", icon: <Calendar className="w-5 h-5" />,   label: t.sidebar.appointments },
    { href: "/results",   icon: <ClipboardList className="w-5 h-5" />, label: t.sidebar.results },
    { href: "/vitals",    icon: <Thermometer className="w-5 h-5" />,   label: t.sidebar.vitals },
    { href: "/profile",   icon: <User className="w-5 h-5" />,          label: t.sidebar.profile },
  ];

  const mobileNav = [
    { href: "/dashboard", icon: <Home className="w-6 h-6" />,         label: t.sidebar.dashboard },
    { href: "/requests",  icon: <Activity className="w-6 h-6" />,      label: t.sidebar.requests },
    { href: "/appointments", icon: <Calendar className="w-6 h-6" />,   label: t.sidebar.appointments },
    { href: "/results",   icon: <ClipboardList className="w-6 h-6" />, label: t.sidebar.results },
    { href: "/profile",   icon: <User className="w-6 h-6" />,          label: t.sidebar.profile },
  ];

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from("notifications")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("is_read", false)
          .then(({ count }) => {
            setNotifCount(count || 0);
          });
      }
    });
  }, [pathname]);

  if (checking) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f4faf6" }}>
        <div style={{ width: 40, height: 40, border: "4px solid #2eb567", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100dvh", background: "var(--bg-page)", direction: isRtl ? "rtl" : "ltr", position: "relative" }}>
      
      {/* Daylight Ambient Background (Fixed so glass effect persists on scroll) */}
      <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-daylight">
         <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-emerald-200 rounded-full mix-blend-multiply filter blur-[120px] opacity-60 animate-pulse-soft"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-teal-200 rounded-full mix-blend-multiply filter blur-[120px] opacity-50 animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Shared Layout Structure */}
      <div style={{ flex: 1, display: "flex", position: "relative" }}>
        
        {/* Desktop Sidebar (Green Glass) */}
        <aside className="hidden md:flex" style={{ 
          position: "fixed", top: 0, ...(isRtl ? { right: 0 } : { left: 0 }), height: "100vh", width: 288, 
          flexDirection: "column", zIndex: 40,
          background: "linear-gradient(160deg, rgba(22, 163, 74, 0.90) 0%, rgba(21, 128, 61, 0.95) 45%, rgba(20, 83, 45, 0.98) 100%)",
          backdropFilter: "blur(24px) saturate(150%)",
          borderLeft: isRtl ? "1px solid rgba(255,255,255,0.15)" : "none",
          borderRight: !isRtl ? "1px solid rgba(255,255,255,0.15)" : "none",
          overflow: "hidden"
        }}>
          {/* Floating Stethoscope Background */}
          <div style={{ position: "absolute", top: "20%", left: "-10%", opacity: 0.15, zIndex: 0, animation: "float 4s ease-in-out infinite" }}>
            <span style={{ fontSize: "160px", filter: "drop-shadow(0 10px 10px rgba(0,0,0,0.2))" }}>🩺</span>
          </div>
          <style>{`@keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-15px) rotate(5deg); } }`}</style>

          <div style={{ padding: "24px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid rgba(255,255,255,0.15)", position: "relative", zIndex: 1 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.8)", boxShadow: "0 4px 10px rgba(0,0,0,0.15)" }}>
              <img src="/logo.png" alt="Logo" style={{ width: 32, height: 32, objectFit: "contain", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }} />
            </div>
            <span style={{ fontWeight: 900, fontSize: 22, color: "#ffffff", textShadow: "0 2px 6px rgba(0,0,0,0.4)" }}>{t.sidebar.appTitle}</span>
          </div>

          <nav style={{ flex: 1, padding: "24px 16px", display: "flex", flexDirection: "column", gap: 8, position: "relative", zIndex: 1 }}>
            {sideNav.map(item => {
              const active = isActive(item.href);
              const isApptsOrReqs = item.href === "/requests" || item.href === "/appointments";
              const showBadge = isApptsOrReqs && notifCount > 0;
              return (
                <Link key={item.href} href={item.href} prefetch={true} style={{
                  position: "relative",
                  display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                  borderRadius: 16, fontSize: 16, fontWeight: 900, textDecoration: "none",
                  transition: "color 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  color: active ? "#16a34a" : "#ffffff",
                  textShadow: active ? "none" : "0 2px 4px rgba(0,0,0,0.3)",
                  transform: active ? "scale(1.04)" : "scale(1)",
                  outline: "none",
                }}>
                  {active && (
                    <motion.div
                      layoutId="sidebar-active-bg"
                      initial={false}
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid rgba(255, 255, 255, 1)",
                        boxShadow: "0 8px 20px rgba(0,0,0,0.2), inset 0 1px 0 #fff",
                        borderRadius: 16,
                        zIndex: 0,
                      }}
                    />
                  )}
                  <div style={{ position: "relative", zIndex: 1, filter: active ? "none" : "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>
                    {item.icon}
                  </div>
                  <span style={{ position: "relative", zIndex: 1, flex: 1 }}>{item.label}</span>
                  {showBadge && (
                    <span style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", height: 22, minWidth: 22, padding: "0 6px", borderRadius: 999, background: "#dc2626", color: "#ffffff", fontSize: 11, fontWeight: "bold", boxShadow: "0 2px 8px rgba(220,38,38,0.6), 0 0 0 2px #fff", letterSpacing: 0 }}>
                      {notifCount > 99 ? '99+' : notifCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,0.15)", position: "relative", zIndex: 1 }}>
            <button onClick={handleLogout} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 16px", borderRadius: 999, color: "#fca5a5", fontWeight: 700, fontSize: 14, border: "1px solid rgba(248,113,113,0.3)", background: "rgba(254,226,226,0.1)", cursor: "pointer", transition: "all 0.2s" }}>
              <LogOut className="w-4 h-4" /> {t.sidebar.logout}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className={`flex-1 flex justify-center w-full relative z-10 ${isRtl ? 'md:mr-[288px]' : 'md:ml-[288px]'}`}>
          {/* Universal Language Toggle */}
          <div className={`fixed top-6 md:top-8 z-50 ${isRtl ? 'left-6 md:left-8' : 'right-6 md:right-8'}`}>
            <LanguageToggle />
          </div>
          <main className="w-full pb-28 md:pb-8 pt-20 px-4 md:px-8 max-w-[768px]">
            {children}
          </main>
        </div>

        {/* Mobile Bottom Nav (hidden on desktop) */}
        <nav className="premium-bottom-nav glass-panel md:hidden border-t border-emerald-100">
          {mobileNav.map(item => {
            const active = isActive(item.href);
            const isApptsOrReqs = item.href === "/requests" || item.href === "/appointments";
            const showBadge = isApptsOrReqs && notifCount > 0;
            return (
              <Link key={item.href} href={item.href} prefetch={true} className={`nav-item${active ? " active" : ""}`} style={{ position: "relative" }}>
                <div className="nav-icon" style={{ color: active ? "#16a34a" : "#9ca3af", position: "relative" }}>
                  {item.icon}
                  {showBadge && (
                    <span style={{ position: "absolute", top: -5, right: -5, display: "flex", alignItems: "center", justifyContent: "center", height: 18, minWidth: 18, borderRadius: 999, background: "#dc2626", color: "#ffffff", fontSize: 10, fontWeight: "bold", border: "2px solid #ffffff", boxShadow: "0 2px 6px rgba(220,38,38,0.5)", padding: "0 3px" }}>
                      {notifCount > 99 ? '99+' : notifCount}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: "0.6rem", fontWeight: 700, color: active ? "#16a34a" : "#9ca3af", marginTop: 2 }}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
