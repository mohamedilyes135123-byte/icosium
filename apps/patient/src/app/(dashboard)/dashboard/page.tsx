"use client";
export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import MedicationReminders from "@/components/ui/MedicationReminders";

type MetricType = "blood_sugar" | "blood_pressure";

interface Vital {
  id: string;
  type: MetricType;
  value1: number;
  value2?: number;
  created_at: string;
}

// Only Blood Pressure and Blood Sugar are shown on dashboard (per spec)
const HERO_METRICS = [
  {
    id: "blood_pressure" as MetricType,
    img: "/icon_blood_pressure.png",
    label: "ضغط الدم",
    unit: "mmHg",
    color: "#e11d48",
    bg: "linear-gradient(135deg,#fff1f2,#fce7f3)",
    border: "#fda4af",
    hasSecond: true,
  },
  {
    id: "blood_sugar" as MetricType,
    img: "/icon_blood_sugar.png",
    label: "مستوى السكر",
    unit: "mg/dL",
    color: "#d97706",
    bg: "linear-gradient(135deg,#fffbeb,#fef3c7)",
    border: "#fcd34d",
    hasSecond: false,
  },
];

function getStatus(type: MetricType, v1: number): "normal" | "high" | "low" {
  if (type === "blood_sugar")    return v1 < 70 ? "low" : v1 > 126 ? "high" : "normal";
  if (type === "blood_pressure") return v1 < 90 ? "low" : v1 > 140 ? "high" : "normal";
  return "normal";
}

const STATUS_LABEL: Record<string, string> = { normal: "طبيعي", high: "مرتفع", low: "منخفض" };
const STATUS_BG:    Record<string, string> = { normal: "#dcfce7", high: "#fee2e2", low: "#fef9c3" };
const STATUS_CLR:   Record<string, string> = { normal: "#15803d", high: "#dc2626", low: "#92400e" };

function getFeedbackMessage(type: MetricType, v1: number): string {
  const status = getStatus(type, v1);
  if (status === "normal") return "النتيجة طبيعية وممتازة! استمر في الحفاظ على صحتك.";
  if (status === "high") return "النتيجة أعلى من المعدل الطبيعي. يُنصح بمراقبتها واستشارة الطبيب إذا استمرت.";
  if (status === "low") return "النتيجة أقل من المعدل الطبيعي. يرجى الانتباه واستشارة طبيبك.";
  return "تم التسجيل بنجاح.";
}

function getReferenceText(type: MetricType): string {
  if (type === "blood_pressure") return "المعدل الطبيعي: حوالي 120/80";
  if (type === "blood_sugar") return "المعدل الطبيعي: 70 - 126 mg/dL";
  return "";
}

export default function PatientDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ requests: 0, prescriptions: 0, labs: 0 });
  const [loading, setLoading] = useState(true);
  const [todayVitals, setTodayVitals] = useState<Record<MetricType, Vital | null>>({
    blood_pressure: null, blood_sugar: null,
  });
  const [selected, setSelected] = useState<MetricType | null>(null);
  const [val1, setVal1] = useState("");
  const [val2, setVal2] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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
            .in("type", ["blood_pressure", "blood_sugar"])
            .order("created_at", { ascending: false }),
        ]);

      setProfile(prof);
      setStats({
        requests:      (reqs          || []).length,
        prescriptions: (prescriptions || []).length,
        labs:          (labs          || []).length,
      });

      const map: Record<MetricType, Vital | null> = { blood_pressure: null, blood_sugar: null };
      (vitals || []).forEach((v: Vital) => {
        if (!map[v.type]) map[v.type] = v;
      });
      setTodayVitals(map);
      setLoading(false);
    };
    load();
  }, []);

  const firstName = loading ? "..." : profile?.full_name?.split(" ")[0] || "مريض";

  const refreshVitals = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: vitals } = await supabase
      .from("vitals")
      .select("*")
      .eq("patient_id", user.id)
      .in("type", ["blood_pressure", "blood_sugar"])
      .order("created_at", { ascending: false });
    const map: Record<MetricType, Vital | null> = { blood_pressure: null, blood_sugar: null };
    (vitals || []).forEach((v: Vital) => { if (!map[v.type]) map[v.type] = v; });
    setTodayVitals(map);
  };

  const save = async () => {
    if (!selected || !val1) return;
    setSaving(true);
    setMessage(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    const metric = HERO_METRICS.find(m => m.id === selected)!;
    const payload: Record<string, unknown> = {
      patient_id: user.id,
      type: selected,
      value1: parseFloat(val1),
    };
    if (metric.hasSecond && val2) payload.value2 = parseFloat(val2);
    if (note) payload.notes = note;

    const { error } = await supabase.from("vitals").insert(payload);
    if (error) {
      setMessage({ text: "حدث خطأ أثناء الحفظ", ok: false });
    } else {
      const feedback = getFeedbackMessage(selected, parseFloat(val1));
      setMessage({ text: `تم التسجيل بنجاح! ${feedback}`, ok: true });
      setVal1(""); setVal2(""); setNote(""); setSelected(null);
      await refreshVitals();
    }
    setSaving(false);
  };

  return (
    <div dir="rtl" style={{ paddingBottom: 100 }}>

      {/* ═══════ GREEN WAVE HEADER ═══════ */}
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
          {/* Bell */}
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

          {/* Greeting */}
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

      {/* ═══════ PAGE CONTENT ═══════ */}
      <div style={{ padding: "0.75rem 1.25rem 0" }}>

        {/* ── Alert Banner ── */}
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

        {/* ════════════════════════════════════════
            HERO VITALS — Blood Pressure & Blood Sugar
            (Prominent at the top, per spec)
        ════════════════════════════════════════ */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#6b7280" }}>اضغط على الكارت لتسجيل قياس جديد</p>
            <h2 style={{ fontSize: "0.9rem", fontWeight: 900, color: "#166534", margin: 0 }}>📊 قياساتي الحيوية</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.875rem" }}>
            {HERO_METRICS.map(m => {
              const vital = todayVitals[m.id];
              const status = vital ? getStatus(m.id, vital.value1) : null;
              const isSelected = selected === m.id;
              const isAbnormal = status && status !== "normal";

              return (
                <button
                  key={m.id}
                  onClick={() => { setSelected(isSelected ? null : m.id); setVal1(""); setVal2(""); setNote(""); setMessage(null); }}
                  style={{
                    background: m.bg,
                    borderRadius: "1.5rem",
                    padding: "1.5rem 1rem",
                    border: isSelected ? `2.5px solid ${m.color}` : isAbnormal ? `2px solid ${m.color}` : `1.5px solid ${m.border}`,
                    boxShadow: isAbnormal
                      ? `0 0 0 3px ${m.color}20, 0 8px 24px ${m.color}25`
                      : isSelected
                        ? `0 6px 20px ${m.color}30`
                        : "0 4px 16px rgba(0,0,0,0.06)",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    minHeight: 160, gap: "0.5rem", cursor: "pointer",
                    textAlign: "center",
                    transition: "all 0.25s ease",
                    animation: isAbnormal ? "pulse 2s infinite" : "none",
                  }}
                >
                  <Image src={m.img} alt={m.label} width={72} height={72} style={{ objectFit: "contain" }} />

                  {vital ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <p style={{ margin: 0, fontSize: "1.6rem", fontWeight: 900, color: m.color, lineHeight: 1 }}>
                        {vital.value1}{vital.value2 != null ? `/${vital.value2}` : ""}
                      </p>
                      <span style={{ fontSize: "0.62rem", color: "#9ca3af", fontWeight: 600 }}>{m.unit}</span>
                      <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "#9ca3af", marginTop: 2 }}>
                        {new Date(vital.created_at).toDateString() === new Date().toDateString() ? "اليوم" : "آخر قياس"}
                      </span>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <p style={{ margin: 0, fontSize: "1.3rem", fontWeight: 900, color: "#e5e7eb" }}>—</p>
                      <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "#9ca3af", marginTop: 2 }}>غير مسجل</span>
                    </div>
                  )}

                  <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: 800, color: "#4b5563" }}>{m.label}</p>

                  {status && (
                    <span style={{
                      fontSize: "0.62rem", fontWeight: 900, padding: "3px 10px", borderRadius: 999,
                      background: STATUS_BG[status], color: STATUS_CLR[status],
                    }}>
                      {STATUS_LABEL[status]}
                    </span>
                  )}

                  {!vital && (
                    <span style={{
                      fontSize: "0.68rem", fontWeight: 700, color: m.color,
                      background: "rgba(255,255,255,0.7)", borderRadius: 999,
                      padding: "3px 10px", width: "100%", textAlign: "center",
                    }}>
                      اضغط للتسجيل
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Success/error message ── */}
        {message && (
          <div style={{
            background: message.ok ? "#dcfce7" : "#fee2e2",
            border: `1.5px solid ${message.ok ? "#86efac" : "#fca5a5"}`,
            color: message.ok ? "#15803d" : "#dc2626",
            borderRadius: "1rem", padding: "0.75rem 1rem",
            fontSize: "0.85rem", fontWeight: 700,
            marginBottom: "1rem", textAlign: "center",
          }}>
            {message.ok ? "✅" : "❌"} {message.text}
          </div>
        )}

        {/* ── Inline input panel when metric selected ── */}
        {selected && (() => {
          const m = HERO_METRICS.find(mx => mx.id === selected)!;
          return (
            <div className="glass-panel" style={{
              borderRadius: "1.5rem",
              padding: "1.5rem", marginBottom: "1.25rem",
              border: `2px solid ${m.color}30`,
            }}>
              <h3 style={{ fontWeight: 900, color: m.color, fontSize: "1rem", marginBottom: "0.25rem", textAlign: "center" }}>
                تسجيل قياس {m.label}
              </h3>
              <p style={{ textAlign: "center", fontSize: "0.75rem", color: "#6b7280", fontWeight: 600, marginBottom: "1rem" }}>
                {getReferenceText(m.id)}
              </p>

              <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                <input
                  type="number" inputMode="decimal"
                  placeholder={m.hasSecond ? "الانقباضي (مثال: 120)" : `القيمة (${m.unit})`}
                  value={val1} onChange={e => setVal1(e.target.value)}
                  style={{
                    flex: "1 1 120px", height: 52, borderRadius: "0.875rem",
                    border: "2px solid #e5e7eb", padding: "0 1rem",
                    fontSize: "1.2rem", fontWeight: 800, textAlign: "center",
                    outline: "none", direction: "ltr",
                  }}
                />
                {m.hasSecond && (
                  <input
                    type="number" inputMode="decimal"
                    placeholder="الانبساطي (مثال: 80)"
                    value={val2} onChange={e => setVal2(e.target.value)}
                    style={{
                      flex: "1 1 120px", height: 52, borderRadius: "0.875rem",
                      border: "2px solid #e5e7eb", padding: "0 1rem",
                      fontSize: "1.2rem", fontWeight: 800, textAlign: "center",
                      outline: "none", direction: "ltr",
                    }}
                  />
                )}
              </div>

              {/* Quick context tags */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem", justifyContent: "center" }}>
                {["صائم", "بعد الأكل", "بعد مجهود رياضي", "وقت الراحة"].map(n => (
                  <button key={n} onClick={() => setNote(n === note ? "" : n)} style={{
                    padding: "0.5rem 1rem", borderRadius: "999px",
                    fontSize: "0.8rem", fontWeight: 800,
                    background: note === n ? "linear-gradient(135deg, #1f2937, #111827)" : "#f3f4f6",
                    color: note === n ? "#ffffff" : "#4b5563",
                    border: note === n ? "none" : "1px solid #e5e7eb",
                    cursor: "pointer", transition: "all 0.2s",
                  }}>{n}</button>
                ))}
              </div>

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button onClick={save} disabled={saving || !val1} style={{
                  flex: "1 1 150px", height: 52, borderRadius: "0.875rem",
                  background: saving || !val1 ? "#d1d5db" : `linear-gradient(135deg, #22c55e, #16a34a)`,
                  color: "#fff", fontSize: "0.95rem", fontWeight: 900,
                  border: "none", cursor: saving || !val1 ? "not-allowed" : "pointer",
                  boxShadow: val1 ? "0 4px 14px rgba(22,163,74,0.3)" : "none",
                  transition: "all 0.2s",
                }}>
                  {saving ? "جاري الحفظ..." : "تأكيد"}
                </button>
                <button onClick={() => { setSelected(null); setVal1(""); setVal2(""); setNote(""); }} style={{
                  flex: "1 1 100px", height: 52, borderRadius: "0.875rem",
                  background: "linear-gradient(135deg, #ef4444, #dc2626)",
                  color: "#ffffff", fontSize: "0.95rem", fontWeight: 900,
                  border: "none", cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(239, 68, 68, 0.3)",
                  transition: "all 0.2s",
                }}>
                  إلغاء
                </button>
              </div>
            </div>
          );
        })()}

        {/* ════════════════════════════════════════
            MEDICATION REMINDERS (replaces مواعيدي)
        ════════════════════════════════════════ */}
        <MedicationReminders />

        {/* ── Quick-actions row ── */}
        <div className="glass-panel" style={{
          borderRadius: "2rem",
          padding: "1.25rem 0.75rem",
          marginBottom: "1.25rem",
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "0.5rem",
        }}>
          {[
            { href: "/requests", img: "/icon_clipboard.png", label: "طلباتي" },
            { href: "/results",  img: "/icon_results.png",   label: "نتائجي" },
          ].map(s => (
            <Link key={s.label} href={s.href} prefetch style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: "0.5rem", textDecoration: "none", padding: "0.75rem 0",
              borderRadius: "1.5rem", background: "rgba(255,255,255,0.4)",
              border: "1px solid rgba(255,255,255,0.8)",
              transition: "all 0.2s ease",
            }}>
              <div style={{ width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Image src={s.img} alt={s.label} width={64} height={64} style={{ objectFit: "contain" }} />
              </div>
              <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#166534" }}>{s.label}</span>
            </Link>
          ))}
        </div>

        {/* ── CTA ── */}
        <Link href="/requests" className="btn-gradient" style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: "999px",
          padding: "1.1rem",
          textDecoration: "none",
          marginBottom: "0.875rem",
        }}>
          <span style={{ color: "#fff", fontSize: "1rem", fontWeight: 900 }}>
            🚀 دخول البوابة الطبية
          </span>
        </Link>

      </div>
    </div>
  );
}
