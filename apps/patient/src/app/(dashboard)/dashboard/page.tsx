"use client";
export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search } from "lucide-react";

type MetricType = "blood_sugar" | "blood_pressure" | "weight" | "oximetry" | "heart_rate";

interface Vital {
  id: string;
  type: MetricType;
  value1: number;
  value2?: number;
  created_at: string;
}

const METRICS = [
  { id: "heart_rate"     as MetricType, img: "/icon_heart_rate.png",     label: "نبضات القلب",   unit: "bpm",   bg: "#fef2f2", color: "#dc2626", hasSecond: false },
  { id: "blood_pressure" as MetricType, img: "/icon_blood_pressure.png", label: "ضغط الدم",      unit: "mmHg",  bg: "#fff1f2", color: "#e11d48", hasSecond: true  },
  { id: "blood_sugar"    as MetricType, img: "/icon_blood_sugar.png",    label: "مستوى السكر",   unit: "mg/dL", bg: "#fffbeb", color: "#d97706", hasSecond: false },
  { id: "weight"         as MetricType, img: "/icon_weight.png",         label: "الوزن",          unit: "kg",    bg: "#eff6ff", color: "#2563eb", hasSecond: false },
];

function getStatus(type: MetricType, v1: number): "normal" | "high" | "low" {
  if (type === "blood_sugar")    return v1 < 70 ? "low" : v1 > 126 ? "high" : "normal";
  if (type === "blood_pressure") return v1 < 90 ? "low" : v1 > 140 ? "high" : "normal";
  if (type === "heart_rate")     return v1 < 60 ? "low" : v1 > 100 ? "high" : "normal";
  if (type === "oximetry")       return v1 < 95 ? "low" : "normal";
  return "normal";
}

const STATUS_LABEL: Record<string, string> = { normal: "طبيعي", high: "مرتفع", low: "منخفض" };
const STATUS_BG:    Record<string, string> = { normal: "#dcfce7", high: "#fee2e2", low: "#fef9c3" };
const STATUS_CLR:   Record<string, string> = { normal: "#15803d", high: "#dc2626", low: "#92400e" };

export default function PatientDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ requests: 0, prescriptions: 0, labs: 0 });
  const [loading, setLoading] = useState(true);
  const [todayVitals, setTodayVitals] = useState<Record<MetricType, Vital | null>>({
    blood_pressure: null, blood_sugar: null, heart_rate: null, oximetry: null, weight: null,
  });

  useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [{ data: prof }, { data: reqs }, { data: prescriptions }, { data: labs }, { data: vitals }] =
        await Promise.all([
          supabase.from("profiles").select("*").eq("id", user.id).single(),
          supabase.from("medical_requests").select("id").eq("patient_id", user.id),
          supabase.from("prescriptions").select("id").eq("patient_id", user.id),
          supabase.from("lab_results").select("id").eq("patient_id", user.id),
          supabase
            .from("vitals")
            .select("*")
            .eq("patient_id", user.id)
            .gte("created_at", today.toISOString())
            .order("created_at", { ascending: false }),
        ]);

      setProfile(prof);
      setStats({
        requests:      (reqs          || []).length,
        prescriptions: (prescriptions || []).length,
        labs:          (labs          || []).length,
      });

      const map: Record<MetricType, Vital | null> = {
        blood_pressure: null, blood_sugar: null, heart_rate: null, oximetry: null, weight: null,
      };
      (vitals || []).forEach((v: Vital) => {
        if (!map[v.type]) map[v.type] = v;
      });
      setTodayVitals(map);
      setLoading(false);
    };
    load();
  }, []);

  const firstName = loading
    ? "..."
    : profile?.full_name?.split(" ")[0] || "مريض";

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#f4faf6", paddingBottom: 100 }}>

      {/* ═══════════════════════════════
          GREEN WAVE HEADER
      ═══════════════════════════════ */}
      <div style={{
        background: "linear-gradient(180deg, #16a34a 0%, #22c55e 100%)",
        paddingTop: "2.75rem",
        position: "relative",
        color: "white",
        minHeight: 140,
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 1.5rem 3rem 1.5rem",
        }}>
          {/* Bell icon (appears on left in RTL) */}
          <div style={{
            width: 46, height: 46,
            background: "rgba(255,255,255,0.22)",
            borderRadius: "0.875rem",
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative",
            backdropFilter: "blur(8px)",
          }}>
            <span style={{ fontSize: "1.5rem" }}>🔔</span>
            <span style={{
              position: "absolute", top: 8, right: 8,
              width: 10, height: 10,
              background: "#f59e0b", borderRadius: "50%",
              border: "2.5px solid #16a34a",
            }} />
          </div>

          {/* Greeting (appears on right in RTL) */}
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.85)", fontWeight: 600, margin: 0 }}>
              مرحباً بك 👋
            </p>
            <h1 style={{ fontSize: "1.45rem", fontWeight: 900, margin: 0 }}>
              {firstName} — عناية
            </h1>
          </div>
        </div>

        {/* Wave SVG */}
        <div style={{ position: "absolute", bottom: -1, left: 0, width: "100%", overflow: "hidden", lineHeight: 0 }}>
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg"
            style={{ display: "block", width: "calc(100% + 1px)", height: 40 }}>
            <path
              d="M0,40L80,45C160,50,320,60,480,55C640,50,800,30,960,25C1120,20,1280,30,1360,35L1440,40L1440,80L1360,80C1280,80,1120,80,960,80C800,80,640,80,480,80C320,80,160,80,80,80L0,80Z"
              fill="#f4faf6"
            />
          </svg>
        </div>
      </div>

      {/* ═══════════════════════════════
          PAGE CONTENT
      ═══════════════════════════════ */}
      <div style={{ padding: "0.75rem 1.25rem 0" }}>

        {/* ── Yellow Alert Banner ── */}
        <div style={{
          background: "#fef9c3",
          border: "1.5px solid #fde047",
          borderRadius: "1rem",
          padding: "0.9rem 1.1rem",
          display: "flex", alignItems: "center", gap: "0.75rem",
          marginBottom: "1.25rem",
          boxShadow: "0 2px 12px rgba(202,138,4,0.08)",
        }}>
          <span style={{ fontSize: "1.3rem", flexShrink: 0 }}>⚠️</span>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#92400e", flex: 1 }}>
            {loading
              ? "جاري التحميل..."
              : stats.requests > 0
                ? `لديك ${stats.requests} طلب طبي نشط`
                : "لا توجد طلبات طبية معلقة حالياً"}
          </span>
        </div>

        {/* ── Three Service Icons Card ── */}
        <div style={{
          background: "#fff",
          borderRadius: "1.5rem",
          padding: "1.25rem 0.75rem",
          marginBottom: "1.25rem",
          boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
          border: "1px solid rgba(22,163,74,0.06)",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "0.5rem",
        }}>
          {[
            { href: "/ai-chat",      img: "/icon_stethoscope.png", label: "استشارة"  },
            { href: "/requests",     img: "/icon_clipboard.png",   label: "طلباتي"   },
            { href: "/appointments", img: "/icon_calendar.png",    label: "مواعيدي"  },
          ].map(s => (
            <Link key={s.label} href={s.href} prefetch style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: "0.5rem", textDecoration: "none", padding: "0.5rem 0",
            }}>
              <div style={{ width: 72, height: 72, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Image src={s.img} alt={s.label} width={72} height={72} style={{ objectFit: "contain" }} />
              </div>
              <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#166534" }}>{s.label}</span>
            </Link>
          ))}
        </div>

        {/* ── Metric Cards Section with green blob background ── */}
        <div style={{ position: "relative", marginBottom: "1.5rem" }}>

          {/* Soft green blob */}
          <div style={{
            position: "absolute", top: -12, left: -20, right: -20, bottom: -12,
            background: "linear-gradient(160deg, #dcfce7 0%, #f0fdf4 100%)",
            borderRadius: "2rem",
            zIndex: 0,
          }} />

          {/* Doctor icon top-left (matches mockup) */}
          <div style={{ position: "absolute", top: 4, left: 8, zIndex: 1, opacity: 0.45 }}>
            <span style={{ fontSize: "2rem" }}>🧑‍⚕️</span>
          </div>

          {/* Vitals Cards Grid */}
          <div style={{
            position: "relative", zIndex: 2,
            display: "grid", gridTemplateColumns: "repeat(2, 1fr)",
            gap: "0.75rem", paddingTop: "1rem",
          }}>
            {METRICS.map(m => {
              const vital  = todayVitals[m.id];
              const status = vital ? getStatus(m.id, vital.value1) : null;

              return (
                <Link
                  key={m.id}
                  href="/vitals"
                  style={{
                    background: "#fff", borderRadius: "1.25rem",
                    padding: "1.25rem 0.75rem",
                    textDecoration: "none",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
                    minHeight: 120, gap: "0.5rem",
                    transition: "all 0.2s ease",
                    textAlign: "center",
                  }}
                >
                  <Image src={m.img} alt={m.label} width={64} height={64} style={{ objectFit: "contain" }} />

                  {vital ? (
                    <p style={{ margin: 0, fontSize: "1.3rem", fontWeight: 900, color: m.color, lineHeight: 1 }}>
                      {vital.value1}{vital.value2 != null ? `/${vital.value2}` : ""}
                      <span style={{ fontSize: "0.6rem", color: "#9ca3af", marginRight: 3, fontWeight: 600 }}>{m.unit}</span>
                    </p>
                  ) : (
                    <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: 900, color: "#e5e7eb" }}>—</p>
                  )}

                  <p style={{ margin: 0, fontSize: "0.68rem", fontWeight: 700, color: "#6b7280" }}>{m.label}</p>

                  {status && (
                    <span style={{
                      fontSize: "0.58rem", fontWeight: 900, padding: "2px 8px", borderRadius: 999,
                      background: STATUS_BG[status], color: STATUS_CLR[status],
                    }}>
                      {STATUS_LABEL[status]}
                    </span>
                  )}

                  {!vital && (
                    <span style={{
                      fontSize: "0.65rem", fontWeight: 700, color: "#16a34a",
                      background: "#f0fdf4", borderRadius: 999, padding: "3px 0", width: "100%", textAlign: "center",
                    }}>
                      اضغط للتسجيل
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── Green CTA Button ── */}
        <Link href="/requests" style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "linear-gradient(135deg, #22c55e, #16a34a)",
          borderRadius: "999px",
          padding: "1.1rem",
          textDecoration: "none",
          marginBottom: "0.875rem",
          boxShadow: "0 6px 20px rgba(22,163,74,0.3)",
        }}>
          <span style={{ color: "#fff", fontSize: "1rem", fontWeight: 900 }}>
            🚀 دخول البوابة الطبية
          </span>
        </Link>

        {/* ── Search / Secondary Button ── */}
        <div style={{
          display: "flex", alignItems: "center", gap: "0.75rem",
          background: "#fff",
          border: "2px solid #e5e7eb",
          borderRadius: "999px",
          padding: "0.9rem 1.25rem",
          cursor: "pointer",
        }}>
          <Search style={{ width: 18, height: 18, color: "#9ca3af", flexShrink: 0 }} />
          <span style={{ fontSize: "0.85rem", color: "#9ca3af", fontWeight: 600 }}>
            ابحث عن طبيب، عيادة، دواء...
          </span>
        </div>

      </div>
    </div>
  );
}
