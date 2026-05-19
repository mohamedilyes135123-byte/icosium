"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

type Tab = "lab" | "pharmacy";

const ORDER_STATUS: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  PENDING:    { label: "⏳ قيد الانتظار",     bg: "#fef9c3", color: "#92400e", dot: "#fbbf24" },
  PROCESSING: { label: "🔄 جاري التحضير",    bg: "#dbeafe", color: "#1e40af", dot: "#60a5fa" },
  COMPLETED:  { label: "✅ جاهز للاستلام",   bg: "#dcfce7", color: "#166534", dot: "#4ade80" },
  CANCELLED:  { label: "❌ ملغى",            bg: "#f1f5f9", color: "#64748b", dot: "#94a3b8" },
};

export default function PatientResults() {
  const [tab, setTab] = useState<Tab>("lab");
  const [labResults, setLabResults] = useState<any[]>([]);
  const [pharmacyOrders, setPharmacyOrders] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user));
  }, []);

  const ensureAbsoluteUrl = (url: string) => {
    if (!url) return "#";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("mailto:") || url.startsWith("tel:")) {
      return url;
    }
    return `https://${url}`;
  };

  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    const supabase = createClient();
    setLoading(true);
    setError(null);

    const [{ data: results, error: labErr }, { data: orders, error: ordErr }] = await Promise.all([
      supabase
        .from("lab_results")
        .select(`
          id,
          file_url,
          result_notes,
          uploaded_at,
          lab:profiles!lab_results_lab_id_fkey(full_name, address),
          lab_request:lab_requests!lab_results_lab_request_id_fkey(
            tests_list,
            doctor_notes,
            doctor:profiles!lab_requests_doctor_id_fkey(full_name)
          )
        `)
        .eq("patient_id", currentUser.id)
        .order("uploaded_at", { ascending: false }),

      supabase
        .from("pharmacy_orders")
        .select(`
          id,
          status,
          created_at,
          pharmacy:profiles!pharmacy_orders_pharmacy_id_fkey(full_name, address, phone),
          prescription:prescriptions!pharmacy_orders_prescription_id_fkey(
            medications,
            doctor_notes,
            qr_token,
            doctor:profiles!prescriptions_doctor_id_fkey(full_name)
          )
        `)
        .eq("patient_id", currentUser.id)
        .order("created_at", { ascending: false }),
    ]);

    if (labErr) {
      console.error("lab_results fetch error:", labErr.message, labErr.details);
      setError(labErr.message);
    }
    if (ordErr) {
      console.error("pharmacy_orders fetch error:", ordErr.message, ordErr.details);
      setError(ordErr.message);
    }

    setLabResults(results || []);
    setPharmacyOrders(orders || []);
    setLoading(false);
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    fetchData();
    const supabase = createClient();
    const ch = supabase
      .channel("results-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "lab_results", filter: `patient_id=eq.${currentUser.id}` }, fetchData)
      .on("postgres_changes", { event: "*", schema: "public", table: "pharmacy_orders", filter: `patient_id=eq.${currentUser.id}` }, fetchData)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [currentUser, fetchData]);

  return (
    <div dir="rtl" style={{ paddingBottom: 32 }}>
      {/* Header */}
      <div className="green-header">
        <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: 0 }}>📋 نتائجي ووصفاتي</h1>
        <p style={{ color: "#bbf7d0", fontSize: 13, margin: "4px 0 0" }}>كل نتائجك وطلبات صيدليتك في مكان واحد</p>
      </div>

      <div style={{ padding: "16px 16px 0" }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, background: "#f1f5f9", borderRadius: 16, padding: 6, marginBottom: 20 }}>
          {[
            { key: "lab",      label: "🧪 التحاليل",  count: labResults.length },
            { key: "pharmacy", label: "💊 الصيدلية", count: pharmacyOrders.length },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as Tab)}
              style={{ flex: 1, padding: "10px 0", borderRadius: 12, border: "none", fontFamily: "inherit", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.15s", background: tab === t.key ? "#fff" : "transparent", color: tab === t.key ? "#2eb567" : "#64748b", boxShadow: tab === t.key ? "0 1px 4px rgba(0,0,0,0.1)" : "none" }}>
              {t.label} {t.count > 0 && <span style={{ background: tab === t.key ? "#dcfce7" : "#e2e8f0", color: tab === t.key ? "#166534" : "#64748b", borderRadius: 999, padding: "0 6px", fontSize: 12, marginRight: 4 }}>{t.count}</span>}
            </button>
          ))}
        </div>

        {/* Error Banner */}
        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 12, padding: "10px 14px", marginBottom: 16, color: "#991b1b", fontSize: 13, fontWeight: 600 }}>
            ⚠️ خطأ في تحميل البيانات: {error}
          </div>
        )}

        {/* Loading */}
        {loading && [1,2,3].map(i => (
          <div key={i} style={{ height: 100, borderRadius: 20, background: "#f0fdf4", marginBottom: 12, animation: "pulse 1.5s infinite" }} />
        ))}

        {/* Lab Results */}
        {!loading && tab === "lab" && (
          labResults.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 16px" }}>
              <div style={{ fontSize: 64, marginBottom: 12 }}>🧪</div>
              <p style={{ fontWeight: 700, color: "#6b7280" }}>لا توجد نتائج تحاليل بعد</p>
              <p style={{ fontSize: 13, color: "#9ca3af" }}>عندما يرفع المختبر نتائجك ستظهر هنا</p>
            </div>
          ) : labResults.map((result: any) => {
            const lab = Array.isArray(result.lab) ? result.lab[0] : result.lab;
            const labReq = Array.isArray(result.lab_request) ? result.lab_request[0] : result.lab_request;
            const tests = labReq?.tests_list || [];
            
            return (
            <div key={result.id} style={{ background: "#fff", borderRadius: 24, border: "1px solid #e8f5ec", padding: 16, marginBottom: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", borderRight: "4px solid #4ade80" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontWeight: 900, fontSize: 14, color: "#374151" }}>✅ نتائج التحليل</span>
                <span style={{ fontSize: 11, color: "#9ca3af" }}>{result.uploaded_at ? new Date(result.uploaded_at).toLocaleDateString("ar-DZ") : ""}</span>
              </div>

              {lab && (
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0e7490", marginBottom: 8 }}>
                  ⚗️ {lab.full_name} {lab.address && `— ${lab.address}`}
                </div>
              )}

              {tests && Array.isArray(tests) && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                  {tests.map((t: any, i: number) => (
                    <span key={i} style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 8, background: "#cffafe", color: "#0e7490" }}>
                      🧪 {typeof t === 'string' ? t : t?.name || ""}
                    </span>
                  ))}
                </div>
              )}

              {result.result_notes && (
                <div style={{ background: "#f0fdf4", borderRadius: 12, padding: "10px 14px", marginBottom: 10, border: "1px solid #bbf7d0" }}>
                  <p style={{ fontSize: 11, fontWeight: 900, color: "#6b7280", marginBottom: 4 }}>ملخص النتائج:</p>
                  <p style={{ fontSize: 13, color: "#374151", fontWeight: 600, margin: 0, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{String(result.result_notes)}</p>
                </div>
              )}

              {result.file_url && typeof result.file_url === 'string' && (
                <a href={ensureAbsoluteUrl(result.file_url)} target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 999, background: "linear-gradient(135deg,#2eb567,#1e8a4c)", color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
                  📥 تحميل ملف النتائج
                </a>
              )}
            </div>
          )})
        )}

        {/* Pharmacy Orders */}
        {!loading && tab === "pharmacy" && (
          pharmacyOrders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 16px" }}>
              <div style={{ fontSize: 64, marginBottom: 12 }}>💊</div>
              <p style={{ fontWeight: 700, color: "#6b7280" }}>لم تُرسل أي طلب للصيدلية بعد</p>
              <p style={{ fontSize: 13, color: "#9ca3af" }}>بعد الموافقة على وصفتك يمكنك إرسالها لصيدلية</p>
              <a href="/requests" style={{ display: "inline-flex", marginTop: 16, padding: "10px 24px", borderRadius: 999, background: "linear-gradient(135deg,#2eb567,#1e8a4c)", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
                اطلب استشارة طبية
              </a>
            </div>
          ) : pharmacyOrders.map((order: any) => {
            const rx = Array.isArray(order.prescription) ? order.prescription[0] : order.prescription;
            const pharmacy = Array.isArray(order.pharmacy) ? order.pharmacy[0] : order.pharmacy;
            const doctor = rx ? (Array.isArray(rx.doctor) ? rx.doctor[0] : rx.doctor) : null;
            const cfg = ORDER_STATUS[order.status] || ORDER_STATUS.PENDING;

            return (
              <div key={order.id} style={{ background: "#fff", borderRadius: 24, border: "1px solid #e8f5ec", padding: 16, marginBottom: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", borderRight: `4px solid ${cfg.dot}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontWeight: 900, fontSize: 14, color: "#374151" }}>طلب صيدلية</span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 8, background: cfg.bg, color: cfg.color }}>
                    {cfg.label}
                  </span>
                </div>

                {pharmacy && (
                  <div style={{ marginBottom: 8 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#7c3aed", margin: 0 }}>💊 {pharmacy.full_name}</p>
                    {pharmacy.address && <p style={{ fontSize: 12, color: "#9ca3af", margin: "2px 0 0" }}>📍 {pharmacy.address}</p>}
                    {pharmacy.phone && <p style={{ fontSize: 12, color: "#9ca3af", margin: "2px 0 0" }}>📞 {pharmacy.phone}</p>}
                  </div>
                )}

                {doctor && (
                  <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>⚕️ وصفة الطبيب: {doctor.full_name}</p>
                )}

                {rx?.medications && Array.isArray(rx.medications) && rx.medications.length > 0 && (
                  <div style={{ background: "#faf5ff", borderRadius: 12, padding: "10px 14px", marginBottom: 10, border: "1px solid #e9d5ff" }}>
                    <p style={{ fontSize: 11, fontWeight: 900, color: "#7c3aed", marginBottom: 6 }}>الأدوية:</p>
                    {rx.medications.map((med: any, i: number) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 14 }}>💊</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>{med?.name || "دواء"}</span>
                        <span style={{ fontSize: 12, color: "#9ca3af" }}>{med?.dose} — {med?.frequency}</span>
                      </div>
                    ))}
                  </div>
                )}

                {order.status === "COMPLETED" && (
                  <div style={{ padding: "10px 14px", borderRadius: 12, background: "#f0fdf4", border: "1px solid #86efac", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 20 }}>✅</span>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#166534", margin: 0 }}>طلبك جاهز! يمكنك الذهاب للصيدلية.</p>
                  </div>
                )}

                <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 8 }}>
                  📦 الدفع عند الاستلام · {order.created_at ? new Date(order.created_at).toLocaleDateString("ar-DZ") : ""}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
