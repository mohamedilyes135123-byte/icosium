"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import PrescriptionCard from "@/components/ui/PrescriptionCard";


type Tab = "lab" | "pharmacy";

const ORDER_STATUS: Record<string, { label: string; bg: string; color: string; dot: string; icon?: string }> = {
  PENDING:    { label: "قيد الانتظار",  bg: "#fef9c3", color: "#92400e", dot: "#fbbf24", icon: "/icon_pending.png" },
  PROCESSING: { label: "جاري التحضير", bg: "#dbeafe", color: "#1e40af", dot: "#60a5fa", icon: "/icon_modified.png" },
  COMPLETED:  { label: "جاهز للاستلام", bg: "#dcfce7", color: "#166534", dot: "#4ade80", icon: "/icon_approved.png" },
  CANCELLED:  { label: "❌ ملغى",       bg: "#f1f5f9", color: "#64748b", dot: "#94a3b8" },
};

export default function PatientResults() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("lab");
  const [labResults, setLabResults] = useState<any[]>([]);
  const [pharmacyOrders, setPharmacyOrders] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Track which prescription IDs have been updated (for real-time unlock)
  const [paidIds, setPaidIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user));
  }, []);

  const ensureAbsoluteUrl = (url: string) => {
    if (!url) return "#";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `https://${url}`;
  };

  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    const supabase = createClient();
    setLoading(true);
    setError(null);

    const [{ data: results, error: labErr }, { data: orders, error: ordErr }, { data: rxData, error: rxErr }] = await Promise.all([
      supabase
        .from("lab_results")
        .select(`
          id, file_url, result_notes, uploaded_at,
          lab:profiles!lab_results_lab_id_fkey(full_name, address),
          lab_request:lab_requests!lab_results_lab_request_id_fkey(
            tests_list, doctor_notes,
            doctor:profiles!lab_requests_doctor_id_fkey(full_name)
          )
        `)
        .eq("patient_id", currentUser.id)
        .order("uploaded_at", { ascending: false }),

      supabase
        .from("pharmacy_orders")
        .select(`
          id, status, created_at,
          pharmacy:profiles!pharmacy_orders_pharmacy_id_fkey(full_name, address, phone),
          prescription:prescriptions!pharmacy_orders_prescription_id_fkey(
            id, medications, doctor_notes, qr_token, is_paid, status,
            doctor:profiles!prescriptions_doctor_id_fkey(full_name)
          )
        `)
        .eq("patient_id", currentUser.id)
        .order("created_at", { ascending: false }),

      // Also fetch standalone prescriptions not yet sent to pharmacy
      supabase
        .from("prescriptions")
        .select(`
          id, is_paid, status, medications, doctor_notes, qr_token, created_at,
          doctor:profiles!prescriptions_doctor_id_fkey(full_name)
        `)
        .eq("patient_id", currentUser.id)
        .neq("status", "archived")
        .order("created_at", { ascending: false }),
    ]);

    if (labErr) { console.error(labErr); setError(labErr.message); }
    if (ordErr) { console.error(ordErr); setError(ordErr.message); }

    setLabResults(results || []);
    setPharmacyOrders(orders || []);
    setPrescriptions(rxData || []);
    setLoading(false);
  }, [currentUser]);

  // Subscribe to real-time prescription payment changes
  useEffect(() => {
    if (!currentUser) return;
    fetchData();
    const supabase = createClient();
    const channelName = `results-rt-${currentUser.id}-${Date.now()}`;
    const ch = supabase
      .channel(channelName)
      .on("postgres_changes", { event: "*", schema: "public", table: "lab_results", filter: `patient_id=eq.${currentUser.id}` }, fetchData)
      .on("postgres_changes", { event: "*", schema: "public", table: "pharmacy_orders", filter: `patient_id=eq.${currentUser.id}` }, fetchData)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "prescriptions", filter: `patient_id=eq.${currentUser.id}` }, (payload) => {
        // Real-time unlock: when is_paid flips to true, update local state immediately
        if (payload.new?.is_paid === true) {
          setPaidIds(prev => new Set([...prev, payload.new.id]));
        }
        fetchData();
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [currentUser, fetchData]);

  // Removed handleLabResultBack as lab_results do not have a status column

  return (
    <div dir="rtl" style={{ paddingBottom: 32 }}>
      {/* Header */}
      <div className="green-header">
        <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
          <Image src="/icon_results.png" alt="" width={40} height={40} /> نتائجي والوصفات
        </h1>
        <p style={{ color: "#bbf7d0", fontSize: 13, margin: "4px 0 0" }}>كل نتائجك ووصفاتك في مكان واحد</p>
      </div>

      <div style={{ padding: "16px 16px 0" }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, background: "#f1f5f9", borderRadius: 16, padding: "6px 6px", marginBottom: 20, paddingTop: 16 }}>
          {[
            { key: "lab",      label: "نتائج تحاليلي", count: labResults.length,    icon: "/RESULT.png", imgSize: 64, imgTopActive: -10, imgTopInactive: 0, imgScale: 1.4, right: 8 },
            { key: "pharmacy", label: "وصفاتي",      count: prescriptions.length, icon: "/icon_pharmacy.png", imgSize: 48, imgTopActive: -24, imgTopInactive: -12, imgScale: 1.2, right: 16 },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as Tab)}
              className="btn"
              style={{ position: "relative", flex: 1, padding: "10px 0", borderRadius: 12, border: "none", fontFamily: "inherit", fontWeight: 800, fontSize: 14, cursor: "pointer", transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)", background: tab === t.key ? "linear-gradient(135deg, #22c55e, #16a34a)" : "transparent", color: tab === t.key ? "#fff" : "#64748b", boxShadow: tab === t.key ? "0 4px 14px rgba(22,163,74,0.3)" : "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Image src={t.icon} alt="" width={t.imgSize} height={t.imgSize} style={{ position: "absolute", top: tab === t.key ? t.imgTopActive : t.imgTopInactive, right: t.right, transform: tab === t.key ? `scale(${t.imgScale})` : "scale(1)", transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)", filter: tab === t.key ? "drop-shadow(0 4px 8px rgba(0,0,0,0.2))" : "none" }} />
              <span style={{ marginRight: 40 }}>{t.label}</span>
              {t.count > 0 && <span style={{ background: tab === t.key ? "#dcfce7" : "#e2e8f0", color: tab === t.key ? "#166534" : "#64748b", borderRadius: 999, padding: "0 6px", fontSize: 12, position: "absolute", left: 16 }}>{t.count}</span>}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 12, padding: "10px 14px", marginBottom: 16, color: "#991b1b", fontSize: 13, fontWeight: 600 }}>
            ⚠️ خطأ: {error}
          </div>
        )}

        {/* Loading skeletons */}
        {loading && [1, 2, 3].map(i => (
          <div key={i} style={{ height: 120, borderRadius: 20, background: "#f0fdf4", marginBottom: 12, animation: "pulse 1.5s infinite" }} />
        ))}

        {/* ══ LAB RESULTS TAB ══ */}
        {!loading && tab === "lab" && (
          labResults.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 16px" }}>
              <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}>
                <Image src="/icon_labs.png" alt="" width={120} height={120} style={{ filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.15))" }} />
              </div>
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
                  <span style={{ fontWeight: 900, fontSize: 14, color: "#374151", display: "flex", alignItems: "center", gap: 6 }}>
                    <Image src="/icon_approved.png" alt="" width={20} height={20} /> نتائج التحليل
                  </span>
                  <span style={{ fontSize: 11, color: "#9ca3af" }}>
                    {result.uploaded_at ? new Date(result.uploaded_at).toLocaleDateString("ar-DZ") : ""}
                  </span>
                </div>

                {lab && (
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0e7490", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                    <Image src="/icon_labs.png" alt="" width={16} height={16} /> {lab.full_name} {lab.address && `— ${lab.address}`}
                  </div>
                )}

                {Array.isArray(tests) && tests.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                    {tests.map((t: any, i: number) => (
                      <span key={i} style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 8, background: "#cffafe", color: "#0e7490" }}>
                        🧪 {typeof t === "string" ? t : t?.name || ""}
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

                {/* 3 Action buttons for lab results */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 12 }}>
                  {result.file_url && (
                    <a href={ensureAbsoluteUrl(result.file_url)} target="_blank" rel="noopener noreferrer"
                      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 0", borderRadius: 12, background: "linear-gradient(135deg,#3b82f6,#1d4ed8)", color: "#fff", fontWeight: 900, fontSize: 12, textDecoration: "none" }}>
                      <span>📥</span> تحميل
                    </a>
                  )}
                  {!result.file_url && (
                    <div style={{ padding: "10px 0", borderRadius: 12, background: "#f1f5f9", color: "#94a3b8", fontWeight: 700, fontSize: 12, textAlign: "center" }}>
                      لا يوجد ملف
                    </div>
                  )}
                  <button
                    onClick={() => window.print()}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 0", borderRadius: 12, background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff", fontWeight: 900, fontSize: 12, border: "none", cursor: "pointer" }}>
                    <span>🖨️</span> طبع
                  </button>
                </div>
              </div>
            );
          })
        )}

        {/* ══ PRESCRIPTIONS / PHARMACY TAB ══ */}
        {!loading && tab === "pharmacy" && (
          prescriptions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 16px" }}>
              <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}>
                <Image src="/icon_pharmacy.png" alt="" width={120} height={120} style={{ filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.15))" }} />
              </div>
              <p style={{ fontWeight: 700, color: "#6b7280" }}>لا توجد وصفات بعد</p>
              <p style={{ fontSize: 13, color: "#9ca3af" }}>وصفاتك الطبية ستظهر هنا بعد موافقة الطبيب</p>
              <a href="/requests" style={{ display: "inline-flex", marginTop: 16, padding: "10px 24px", borderRadius: 999, background: "linear-gradient(135deg,#2eb567,#1e8a4c)", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
                اطلب استشارة طبية
              </a>
            </div>
          ) : prescriptions.map((rx: any) => {
            const doctor = Array.isArray(rx.doctor) ? rx.doctor[0] : rx.doctor;
            // Check if paid locally (from real-time event) or from DB
            const isPaid = paidIds.has(rx.id) || rx.is_paid;

            return (
              <PrescriptionCard
                key={rx.id}
                prescriptionId={rx.id}
                isPaid={isPaid}
                status={rx.status}
                medications={Array.isArray(rx.medications) ? rx.medications : []}
                doctorNotes={rx.doctor_notes}
                qrToken={rx.qr_token}
                doctorName={doctor?.full_name}
                createdAt={rx.created_at}
                patientId={currentUser?.id || ""}
                enableArchiveOnLeave={false}
                onPaymentSuccess={() => {
                  setPaidIds(prev => new Set([...prev, rx.id]));
                  fetchData();
                }}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
