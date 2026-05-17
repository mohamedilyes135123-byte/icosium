"use client";
export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

// ── Types ──────────────────────────────────────────────────────────────────────
type MetricType = "blood_sugar" | "blood_pressure" | "weight" | "oximetry" | "heart_rate";
interface Vital { type: MetricType; value1: number; value2?: number; created_at: string; }

const METRICS = [
  { id: "blood_pressure" as MetricType, img: "/icon_blood_pressure.png", label: "ضغط الدم",      unit: "mmHg",  bg: "#fff1f2", color: "#e11d48" },
  { id: "blood_sugar"    as MetricType, img: "/icon_blood_sugar.png",    label: "سكر الدم",      unit: "mg/dL", bg: "#fffbeb", color: "#d97706" },
  { id: "heart_rate"     as MetricType, img: "/icon_weight.png",         label: "نبضات القلب",   unit: "bpm",   bg: "#fef2f2", color: "#dc2626" },
  { id: "oximetry"       as MetricType, img: "/icon_oximetry.png",       label: "تشبع الأكسجين", unit: "%",     bg: "#ecfeff", color: "#0891b2" },
  { id: "weight"         as MetricType, img: "/icon_heart_rate.png",     label: "الوزن",          unit: "kg",    bg: "#eff6ff", color: "#2563eb" },
];

function getStatus(type: MetricType, v1: number): "normal" | "high" | "low" {
  if (type === "blood_sugar")    return v1 < 70 ? "low" : v1 > 126 ? "high" : "normal";
  if (type === "blood_pressure") return v1 < 90 ? "low" : v1 > 140 ? "high" : "normal";
  if (type === "heart_rate")     return v1 < 60 ? "low" : v1 > 100 ? "high" : "normal";
  if (type === "oximetry")       return v1 < 95 ? "low" : "normal";
  return "normal";
}

const STATUS_LABEL: Record<string, string> = { normal: "✅ طبيعي", high: "⬆️ مرتفع", low: "⬇️ منخفض" };
const STATUS_BG:    Record<string, string> = { normal: "#dcfce7",   high: "#fee2e2",   low: "#fef9c3"   };
const STATUS_CLR:   Record<string, string> = { normal: "#15803d",   high: "#dc2626",   low: "#92400e"   };

export default function PatientDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [todayVitals, setTodayVitals] = useState<Record<MetricType, Vital | null>>({
    blood_pressure: null, blood_sugar: null, heart_rate: null, oximetry: null, weight: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [{ data: prof }, { data: vitals }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("vitals")
          .select("*")
          .eq("patient_id", user.id)
          .gte("created_at", today.toISOString())
          .order("created_at", { ascending: false }),
      ]);

      setProfile(prof);

      // Keep only the latest reading per type today
      const map: Record<MetricType, Vital | null> = {
        blood_pressure: null, blood_sugar: null, heart_rate: null, oximetry: null, weight: null,
      };
      (vitals || []).forEach((v: any) => {
        if (!map[v.type as MetricType]) map[v.type as MetricType] = v;
      });
      setTodayVitals(map);
      setLoading(false);
    };
    load();
  }, []);

  const loggedCount = METRICS.filter(m => todayVitals[m.id] !== null).length;
  const allLogged   = loggedCount === METRICS.length;

  return (
    <div dir="rtl" className="pb-24">

      {/* ── Soft Curved Green Header ── */}
      <div className="premium-header">
        <div className="header-content">
          <div className="bell-container">
            <span style={{ fontSize: "1.5rem" }}>🔔</span>
            <div className="bell-dot" />
          </div>
          <div className="text-right">
            <p className="hero-greet">مرحباً بك 👋</p>
            <h1 className="hero-name">
              {loading ? "..." : profile?.full_name?.split(" ")[0] || "مريض"} — عناية
            </h1>
          </div>
        </div>
        <div className="wave-bottom">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" fill="var(--bg-page)"/>
          </svg>
        </div>
      </div>

      <div className="px-5 mt-[-10px] relative z-10">

        {/* ── Banner ── */}
        <div className="premium-alert">
          <span className="text-xl">📊</span>
          <span className="alert-text">
            {loading ? "جاري التحديث..." : allLogged
              ? "✅ رائع! سجّلت جميع قياساتك اليوم"
              : `لم تسجّل بعد ${METRICS.length - loggedCount} قياس لهذا اليوم`}
          </span>
        </div>

        {/* ── Quick Service Icons ── */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { href: "/requests", img: "/icon_stethoscope.png", label: "استشارة", bg: "#dcfce7" },
            { href: "/requests", img: "/icon_clipboard.png",   label: "طلباتي",  bg: "#fef9c3" },
            { href: "/appointments", img: "/icon_calendar.png", label: "مواعيدي", bg: "#dcfce7" },
          ].map(a => (
            <Link key={a.label} href={a.href} prefetch={true} className="premium-card service-card">
              <div className="sticker-icon" style={{ background: a.bg, overflow: "hidden" }}>
                <Image src={a.img} alt={a.label} width={48} height={48} style={{ objectFit: "contain" }} />
              </div>
              <span className="service-label">{a.label}</span>
            </Link>
          ))}
        </div>

        {/* ── Section Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <Link href="/vitals" prefetch={true} style={{
            fontSize: "0.75rem", fontWeight: 700, padding: "4px 14px",
            borderRadius: 999, background: "#dcfce7", color: "#15803d", textDecoration: "none"
          }}>+ تسجيل قياس</Link>
          <h2 className="section-title">📈 قياساتي اليوم</h2>
        </div>

        {/* ── Vitals Grid ── */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {METRICS.map(m => {
            const vital  = todayVitals[m.id];
            const status = vital ? getStatus(m.id, vital.value1) : null;
            return (
              <Link key={m.id} href="/vitals" prefetch={true} className="premium-card"
                 style={{ padding: "1.25rem", textDecoration: "none", border: "none",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(22,163,74,0.10)" }}>
                {/* Top row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Image src={m.img} alt={m.label} width={72} height={72} style={{ objectFit: "contain" }} priority />
                  {status && (
                    <span style={{
                      fontSize: "0.58rem", fontWeight: 900, padding: "2px 7px", borderRadius: 999,
                      background: STATUS_BG[status], color: STATUS_CLR[status],
                    }}>
                      {STATUS_LABEL[status]}
                    </span>
                  )}
                </div>

                {/* Value */}
                <div style={{ marginTop: "0.65rem" }}>
                  {vital ? (
                    <p style={{ margin: 0, lineHeight: 1, fontSize: "1.45rem", fontWeight: 900, color: m.color }}>
                      {vital.value1}{vital.value2 != null ? `/${vital.value2}` : ""}
                      <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "#9ca3af", marginRight: 3 }}>
                        {m.unit}
                      </span>
                    </p>
                  ) : (
                    <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: 900, color: "#e5e7eb" }}>—</p>
                  )}
                  <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#6b7280", marginTop: 4 }}>{m.label}</p>
                </div>

                {/* CTA badge when not logged */}
                {!vital && (
                  <div style={{
                    marginTop: "0.5rem", fontSize: "0.62rem", fontWeight: 700,
                    color: "#16a34a", background: "#f0fdf4",
                    borderRadius: 999, padding: "3px 0", textAlign: "center",
                  }}>
                    اضغط للتسجيل
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* ── Progress Bar ── */}
        <div style={{
          background: "#fff", borderRadius: "1.5rem", padding: "1rem 1.25rem",
          marginBottom: "1.5rem", border: "1px solid #dcfce7",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#16a34a" }}>
              {loggedCount}/{METRICS.length} قياسات مسجّلة
            </span>
            <span style={{ fontSize: "0.75rem", fontWeight: 900, color: "#374151" }}>قياسات اليوم</span>
          </div>
          <div style={{ height: 8, background: "#f0fdf4", borderRadius: 999, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 999,
              background: "linear-gradient(90deg, #22c55e, #16a34a)",
              width: `${(loggedCount / METRICS.length) * 100}%`,
              transition: "width 0.5s ease",
            }} />
          </div>
        </div>

        {/* ── CTA Buttons ── */}
        <Link href="/vitals" prefetch={true} className="premium-btn w-full mb-3 block text-center"
           style={{ marginBottom: "0.75rem", boxShadow: "0 6px 20px rgba(22,163,74,0.3)", textDecoration: "none" }}>
          <span style={{ color: "white", fontSize: "1.05rem", fontWeight: 900 }}>📈 تسجيل القياسات اليومية</span>
        </Link>
        <Link href="/requests" prefetch={true} className="premium-btn w-full block text-center"
           style={{ background: "white", border: "2px solid #16a34a", boxShadow: "none", textDecoration: "none" }}>
          <span style={{ color: "#16a34a", fontSize: "1.05rem", fontWeight: 900 }}>🩺 ابدأ استشارة جديدة</span>
        </Link>

      </div>

      {/* ── Bottom Nav ── */}
      <div className="premium-bottom-nav">
        <Link href="/dashboard" prefetch={true} className="nav-item active"><div className="nav-icon"><span className="text-2xl">🏠</span></div></Link>
        <Link href="/requests" prefetch={true} className="nav-item">      <div className="nav-icon"><span className="text-2xl">💬</span></div></Link>
        <Link href="/vitals" prefetch={true} className="nav-item">      <div className="nav-icon"><span className="text-2xl">💓</span></div></Link>
        <Link href="/profile" prefetch={true} className="nav-item">      <div className="nav-icon"><span className="text-2xl">👤</span></div></Link>
      </div>
    </div>
  );
}
