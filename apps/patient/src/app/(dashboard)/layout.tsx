"use client";
export const dynamic = "force-dynamic";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Home, HeartPulse, User, LogOut, Search, Activity, Sparkles, Thermometer, ClipboardList } from "lucide-react";

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.href = "/login";
      } else if (data.user.user_metadata?.role !== "patient") {
        window.location.href = "/unauthorized";
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
    { href: "/dashboard", icon: <Home className="w-5 h-5" />,         label: "الرئيسية" },
    { href: "/ai-chat",   icon: <Sparkles className="w-5 h-5" />,     label: "المساعد الذكي" },
    { href: "/doctors",   icon: <Search className="w-5 h-5" />,        label: "البحث عن طبيب" },
    { href: "/requests",  icon: <Activity className="w-5 h-5" />,      label: "طلباتي الطبية" },
    { href: "/results",   icon: <ClipboardList className="w-5 h-5" />, label: "نتائجي ووصفاتي" },
    { href: "/vitals",    icon: <Thermometer className="w-5 h-5" />,   label: "قياساتي اليومية" },
    { href: "/profile",   icon: <User className="w-5 h-5" />,          label: "الملف الصحي" },
  ];

  const mobileNav = [
    { href: "/dashboard", icon: <Home className="w-5 h-5" />,      label: "الرئيسية" },
    { href: "/ai-chat",   icon: <Sparkles className="w-5 h-5" />,  label: "المساعد" },
    { href: "/requests",  icon: <Activity className="w-5 h-5" />,   label: "طلباتي" },
    { href: "/vitals",    icon: <HeartPulse className="w-5 h-5" />, label: "قياساتي" },
    { href: "/profile",   icon: <User className="w-5 h-5" />,       label: "ملفي" },
  ];

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  if (checking) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f4faf6" }}>
        <div style={{ width: 40, height: 40, border: "4px solid #2eb567", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg-page)", direction: "rtl" }}>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <aside style={{ position: "fixed", top: 0, right: 0, height: "100vh", width: 288, background: "#fff", borderLeft: "1px solid #d1fae5", display: "flex", flexDirection: "column", zIndex: 40, boxShadow: "0 0 20px rgba(0,0,0,0.05)" }}>
          <div style={{ padding: "24px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #f0fdf4" }}>
            <div style={{ width: 40, height: 40, borderRadius: 14, background: "linear-gradient(135deg,#2eb567,#1e8a4c)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <span style={{ fontWeight: 900, fontSize: 18, color: "var(--text-main)" }}>عناية للمرضى</span>
          </div>

          <nav style={{ flex: 1, padding: "24px 16px", display: "flex", flexDirection: "column", gap: 4 }}>
            {sideNav.map(item => (
              <Link key={item.href} href={item.href} prefetch={true} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                borderRadius: 999, fontSize: 14, fontWeight: 700, textDecoration: "none",
                transition: "all 0.15s",
                background: isActive(item.href) ? "linear-gradient(135deg,#2eb567,#1e8a4c)" : "transparent",
                color: isActive(item.href) ? "#fff" : "#6b7280",
              }}>
                {item.icon}<span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div style={{ padding: 16, borderTop: "1px solid #f0fdf4" }}>
            <button onClick={handleLogout} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 16px", borderRadius: 999, color: "#ef4444", fontWeight: 700, fontSize: 14, border: "1px solid #fecaca", background: "transparent", cursor: "pointer" }}>
              <LogOut className="w-4 h-4" /> تسجيل الخروج
            </button>
          </div>
        </aside>

        <div style={{ marginRight: 288, flex: 1, minHeight: "100vh" }}>
          <div style={{ maxWidth: 768, margin: "0 auto", padding: "32px 24px 64px" }}>
            {children}
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, paddingBottom: 96 }}>
          {children}
        </div>

        <nav className="bottom-nav">
          {mobileNav.map(item => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href} prefetch={true} className={`bottom-nav-item${active ? " active" : ""}`}>
                <span className="nav-icon-wrap">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
