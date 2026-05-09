"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bell, HeartPulse, Stethoscope, Pill, FlaskConical, Activity, Clock, Sparkles, Search, Smile } from "lucide-react";

export default function PatientDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ requests: 0, prescriptions: 0, labResults: 0, unread: 0 });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [
        { data: prof },
        { data: requests },
        { data: prescriptions },
        { data: labResults },
        { data: notifications },
      ] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("medical_requests").select("id,status,created_at,type,symptoms").eq("patient_id", user.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("prescriptions").select("id,created_at,medications,doctor:profiles!prescriptions_doctor_id_fkey(full_name)").eq("patient_id", user.id).order("created_at", { ascending: false }).limit(3),
        supabase.from("lab_results").select("id,uploaded_at,result_notes").eq("patient_id", user.id).order("uploaded_at", { ascending: false }).limit(3),
        supabase.from("notifications").select("id").eq("user_id", user.id).eq("is_read", false),
      ]);

      setProfile(prof);
      setStats({
        requests: (requests || []).length,
        prescriptions: (prescriptions || []).length,
        labResults: (labResults || []).length,
        unread: (notifications || []).length,
      });

      const activity: any[] = [
        ...(requests || []).map((r: any) => ({ ...r, _kind: "request" })),
        ...(prescriptions || []).map((p: any) => ({ ...p, _kind: "prescription" })),
        ...(labResults || []).map((l: any) => ({ ...l, created_at: l.uploaded_at, _kind: "lab" })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6);

      setRecentActivity(activity);
      setLoading(false);
    };
    load();
  }, []);

  const quickActions = [
    { href: "/ai-chat",  emoji: "🤖", bg: "#e0e7ff", label: "المساعد الذكي" },
    { href: "/requests", emoji: "🩺", bg: "#dcfce7", label: "استشارة طبيب" },
    { href: "/doctors",  emoji: "👨‍⚕️", bg: "#dbeafe", label: "دليل الأطباء" },
  ];

  return (
    <div dir="rtl">
      {/* Green Header */}
      <div className="green-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 10, marginBottom: 4 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", margin: 0 }}>مرحباً بك!</h1>
            <p style={{ color: "#bbf7d0", fontSize: 14, margin: "4px 0 0" }}>
              {loading ? "جاري التحميل..." : `أهلاً ${profile?.full_name?.split(" ")[0] || "مريض"} 👋`}
            </p>
          </div>
          <a href="/requests" style={{ position: "relative", width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
            <Bell className="w-5 h-5" style={{ color: "#fff" }} />
            {stats.unread > 0 && (
              <span style={{ position: "absolute", top: 8, right: 8, width: 16, height: 16, background: "#fbbf24", color: "#78350f", fontSize: 9, fontWeight: 900, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff" }}>
                {stats.unread}
              </span>
            )}
          </a>
        </div>
      </div>

      <div style={{ padding: "0 16px 112px", marginTop: -16 }}>

        {/* Alert Banner */}
        <div className="alert-banner" style={{ marginBottom: 20 }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <span style={{ fontSize: 13 }}>
            {loading ? "جاري تحميل بياناتك..." :
              stats.unread > 0 ? `لديك ${stats.unread} إشعار${stats.unread > 1 ? "ات" : ""} غير مقروء` :
              "ملفك الصحي محدث — كل شيء على ما يرام ✅"}
          </span>
        </div>

        {/* Quick Actions */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
          {quickActions.map(a => (
            <a key={a.href} href={a.href} className="icon-chip">
              <div className="icon-chip-img" style={{ background: a.bg }}>
                <span style={{ fontSize: "1.7rem" }}>{a.emoji}</span>
              </div>
              <span className="icon-chip-label">{a.label}</span>
            </a>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span className="section-title"><span style={{ color: "var(--green-main)" }}>📊</span> إحصائياتي</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { label: "طلباتي",  value: stats.requests,      icon: <Activity className="w-4 h-4" />,     href: "/requests", bg: "#dbeafe", color: "#2563eb" },
            { label: "وصفاتي",  value: stats.prescriptions, icon: <Pill className="w-4 h-4" />,         href: "/results",  bg: "#f3e8ff", color: "#7c3aed" },
            { label: "تحاليلي", value: stats.labResults,    icon: <FlaskConical className="w-4 h-4" />, href: "/results",  bg: "#cffafe", color: "#0891b2" },
          ].map(s => (
            <a key={s.label} href={s.href} style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 16, borderRadius: 20, background: "#fff", border: "1px solid #e8f5ec", cursor: "pointer" }}>
                <div style={{ width: 32, height: 32, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8, background: s.bg, color: s.color }}>
                  {s.icon}
                </div>
                <p style={{ fontSize: 24, fontWeight: 900, margin: 0, color: "var(--text-main)" }}>{loading ? "—" : s.value}</p>
                <p style={{ fontSize: 10, fontWeight: 700, margin: "4px 0 0", color: "var(--text-muted)" }}>{s.label}</p>
              </div>
            </a>
          ))}
        </div>

        {/* CTAs */}
        <a href="/requests" className="btn-pill-green" style={{ width: "100%", marginBottom: 12 }}>ابدأ استشارة جديدة</a>
        <a href="/results" className="btn-pill-outline" style={{ width: "100%" }}>سجل المتابعة</a>

        {/* Recent Activity */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "20px 0 12px" }}>
          <span className="section-title">⏱️ آخر النشاطات</span>
          <a href="/requests" style={{ fontSize: 12, fontWeight: 700, color: "var(--green-main)", background: "var(--green-light)", padding: "4px 12px", borderRadius: 999, textDecoration: "none" }}>عرض الكل</a>
        </div>

        {loading && [1,2,3].map(i => (
          <div key={i} style={{ height: 64, borderRadius: 20, background: "#f0fdf4", marginBottom: 12, animation: "pulse 1.5s infinite" }} />
        ))}

        {!loading && recentActivity.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", borderRadius: 20, background: "#f0fdf4" }}>
            <Activity className="w-12 h-12" style={{ color: "#86efac", margin: "0 auto 12px" }} />
            <p style={{ fontWeight: 700, fontSize: 14, color: "var(--text-muted)" }}>لا يوجد نشاط بعد</p>
            <a href="/requests" className="btn-pill-green" style={{ marginTop: 16, fontSize: 13, padding: "10px 24px", display: "inline-flex" }}>ابدأ بطلب استشارة</a>
          </div>
        )}

        {recentActivity.map(item => (
          <div key={`${item._kind}-${item.id}`} className="health-card" style={{ justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: item._kind === "prescription" ? "#f3e8ff" : item._kind === "lab" ? "#cffafe" : "#dcfce7", color: item._kind === "prescription" ? "#7c3aed" : item._kind === "lab" ? "#0891b2" : "#16a34a" }}>
                {item._kind === "prescription" ? <Pill className="w-5 h-5" /> : item._kind === "lab" ? <FlaskConical className="w-5 h-5" /> : <Stethoscope className="w-5 h-5" />}
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 13, margin: 0, color: "var(--text-main)" }}>
                  {item._kind === "prescription" ? `وصفة — ${(item.doctor as any)?.full_name || "طبيب"}` : item._kind === "lab" ? "نتائج تحاليل جاهزة" : (item.symptoms?.slice(0, 35) || "طلب طبي")}
                </p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "4px 0 0", display: "flex", alignItems: "center", gap: 4 }}>
                  <Clock className="w-3 h-3" />
                  {new Date(item.created_at).toLocaleDateString("ar-DZ", { day: "2-digit", month: "short" })}
                </p>
              </div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 900, padding: "4px 10px", borderRadius: 999, flexShrink: 0, background: item._kind === "lab" ? "#dcfce7" : item._kind === "prescription" ? "#f3e8ff" : item.status === "APPROVED" ? "#dcfce7" : item.status === "REJECTED" ? "#fee2e2" : "#fef9c3", color: item._kind === "lab" ? "#16a34a" : item._kind === "prescription" ? "#7c3aed" : item.status === "APPROVED" ? "#16a34a" : item.status === "REJECTED" ? "#dc2626" : "#92400e" }}>
              {item._kind === "lab" ? "✅ جاهزة" : item._kind === "prescription" ? "💊 وصفة" : item.status === "APPROVED" ? "✅ مقبول" : item.status === "REJECTED" ? "❌ مرفوض" : "⏳ انتظار"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
