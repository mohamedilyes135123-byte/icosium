"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

type MetricType = "blood_sugar" | "blood_pressure" | "weight" | "oximetry" | "heart_rate";

interface Vital {
  id: string;
  type: MetricType;
  value1: number;
  value2?: number;
  created_at: string;
}

const METRICS = [
  { id: "blood_pressure" as MetricType, img: "/icon_blood_pressure.png", label: "ضغط الدم",      unit: "mmHg",  bg: "#fff1f2", color: "#e11d48", hasSecond: true  },
  { id: "blood_sugar"    as MetricType, img: "/icon_blood_sugar.png",    label: "سكر الدم",      unit: "mg/dL", bg: "#fffbeb", color: "#d97706", hasSecond: false },
  { id: "heart_rate"     as MetricType, img: "/icon_heart_rate.png",     label: "نبضات القلب",   unit: "bpm",   bg: "#fef2f2", color: "#dc2626", hasSecond: false },
  { id: "oximetry"       as MetricType, img: "/icon_oximetry.png",       label: "تشبع الأكسجين", unit: "%",     bg: "#ecfeff", color: "#0891b2", hasSecond: false },
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

export default function VitalsPage() {
  const [todayVitals, setTodayVitals] = useState<Record<MetricType, Vital | null>>({
    blood_pressure: null, blood_sugar: null, heart_rate: null, oximetry: null, weight: null,
  });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<MetricType | null>(null);
  const [val1, setVal1] = useState("");
  const [val2, setVal2] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const load = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: vitals } = await supabase
      .from("vitals")
      .select("*")
      .eq("patient_id", user.id)
      .gte("created_at", today.toISOString())
      .order("created_at", { ascending: false });

    const map: Record<MetricType, Vital | null> = {
      blood_pressure: null, blood_sugar: null, heart_rate: null, oximetry: null, weight: null,
    };
    (vitals || []).forEach((v: Vital) => {
      if (!map[v.type]) map[v.type] = v;
    });
    setTodayVitals(map);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!selected || !val1) return;
    setSaving(true);
    setMessage(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    const metric = METRICS.find(m => m.id === selected)!;
    const payload: Record<string, unknown> = {
      patient_id: user.id,
      type: selected,
      value1: parseFloat(val1),
    };
    if (metric.hasSecond && val2) payload.value2 = parseFloat(val2);

    const { error } = await supabase.from("vitals").insert(payload);
    if (error) {
      setMessage({ text: "حدث خطأ أثناء الحفظ", ok: false });
    } else {
      setMessage({ text: "تم تسجيل القياس بنجاح!", ok: true });
      setVal1("");
      setVal2("");
      setSelected(null);
      await load();
    }
    setSaving(false);
  };

  const logged = METRICS.filter(m => todayVitals[m.id] !== null).length;

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#f4faf6", paddingBottom: 100 }}>

      {/* Header */}
      <div style={{
        background: "linear-gradient(180deg, #16a34a 0%, #22c55e 100%)",
        padding: "2.5rem 1.5rem 3.5rem",
        position: "relative", color: "white",
      }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 900, margin: 0 }}>قياساتي اليومية</h1>
        <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.8)", margin: "4px 0 0" }}>
          {loading ? "..." : `${logged} / ${METRICS.length} قياسات مسجّلة اليوم`}
        </p>
        <div style={{ position: "absolute", bottom: -1, left: 0, width: "100%", overflow: "hidden" }}>
          <svg viewBox="0 0 1440 40" fill="none" style={{ display: "block", width: "calc(100% + 1px)", height: 30 }}>
            <path d="M0,20L360,30L720,15L1080,25L1440,20L1440,40L0,40Z" fill="#f4faf6"/>
          </svg>
        </div>
      </div>

      <div style={{ padding: "0.5rem 1.25rem 0" }}>

        {/* Progress bar */}
        <div style={{ background: "#fff", borderRadius: "1.25rem", padding: "1rem 1.25rem", marginBottom: "1.25rem", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#16a34a" }}>{logged}/{METRICS.length} مسجّلة</span>
            <span style={{ fontSize: "0.8rem", fontWeight: 900, color: "#374151" }}>قياسات اليوم</span>
          </div>
          <div style={{ height: 8, background: "#f0fdf4", borderRadius: 999, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 999,
              background: "linear-gradient(90deg, #22c55e, #16a34a)",
              width: `${(logged / METRICS.length) * 100}%`,
              transition: "width 0.5s ease",
            }} />
          </div>
        </div>

        {/* Success/error message */}
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

        {/* Metric cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.5rem" }}>
          {METRICS.map(m => {
            const vital  = todayVitals[m.id];
            const status = vital ? getStatus(m.id, vital.value1) : null;
            const isSelected = selected === m.id;

            return (
              <button
                key={m.id}
                onClick={() => { setSelected(isSelected ? null : m.id); setVal1(""); setVal2(""); setMessage(null); }}
                style={{
                  background: "#fff", borderRadius: "1.25rem",
                  padding: "1rem 0.75rem", border: isSelected ? `2px solid ${m.color}` : "2px solid transparent",
                  boxShadow: isSelected ? `0 4px 16px ${m.color}30` : "0 4px 16px rgba(0,0,0,0.05)",
                  display: "flex", flexDirection: "column", alignItems: "center",
                  gap: "0.5rem", cursor: "pointer", transition: "all 0.2s ease",
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
              </button>
            );
          })}
        </div>

        {/* Input form when a metric is selected */}
        {selected && (() => {
          const m = METRICS.find(mx => mx.id === selected)!;
          return (
            <div style={{
              background: "#fff", borderRadius: "1.5rem",
              padding: "1.5rem", marginBottom: "1rem",
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
              border: `2px solid ${m.color}20`,
            }}>
              <h3 style={{ fontWeight: 900, color: m.color, fontSize: "1rem", marginBottom: "1rem", textAlign: "center" }}>
                تسجيل قياس {m.label}
              </h3>

              <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder={m.hasSecond ? "الانقباضي (مثال: 120)" : `القيمة (${m.unit})`}
                  value={val1}
                  onChange={e => setVal1(e.target.value)}
                  style={{
                    flex: 1, height: 52, borderRadius: "0.875rem",
                    border: "2px solid #e5e7eb", padding: "0 1rem",
                    fontSize: "1.2rem", fontWeight: 800, textAlign: "center",
                    outline: "none", direction: "ltr",
                  }}
                />
                {m.hasSecond && (
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="الانبساطي (مثال: 80)"
                    value={val2}
                    onChange={e => setVal2(e.target.value)}
                    style={{
                      flex: 1, height: 52, borderRadius: "0.875rem",
                      border: "2px solid #e5e7eb", padding: "0 1rem",
                      fontSize: "1.2rem", fontWeight: 800, textAlign: "center",
                      outline: "none", direction: "ltr",
                    }}
                  />
                )}
              </div>

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  onClick={save}
                  disabled={saving || !val1}
                  style={{
                    flex: 1, height: 52, borderRadius: "0.875rem",
                    background: saving || !val1 ? "#d1d5db" : `linear-gradient(135deg, #22c55e, #16a34a)`,
                    color: "#fff", fontSize: "0.95rem", fontWeight: 900,
                    border: "none", cursor: saving || !val1 ? "not-allowed" : "pointer",
                    boxShadow: val1 ? "0 4px 14px rgba(22,163,74,0.3)" : "none",
                    transition: "all 0.2s",
                  }}
                >
                  {saving ? "جاري الحفظ..." : "✅ تسجيل"}
                </button>
                <button
                  onClick={() => { setSelected(null); setVal1(""); setVal2(""); }}
                  style={{
                    height: 52, padding: "0 1.25rem", borderRadius: "0.875rem",
                    border: "2px solid #e5e7eb", background: "#fff",
                    color: "#6b7280", fontWeight: 700, cursor: "pointer",
                  }}
                >
                  إلغاء
                </button>
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
}
