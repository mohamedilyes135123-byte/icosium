"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import PrescriptionCard from "@/components/ui/PrescriptionCard";
import { useTranslation } from "@/hooks/useTranslation";


type Tab = "lab" | "pharmacy";

export default function PatientResults() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const isRtl = language === 'ar';

  const ORDER_STATUS: Record<string, { label: string; bg: string; color: string; dot: string; icon?: string }> = {
    PENDING:    { label: t.results.statusPending,  bg: "#fef9c3", color: "#92400e", dot: "#fbbf24", icon: "/icon_pending.png" },
    PROCESSING: { label: t.results.statusProcessing, bg: "#dbeafe", color: "#1e40af", dot: "#60a5fa", icon: "/icon_modified.png" },
    COMPLETED:  { label: t.results.statusCompleted,  bg: "#dcfce7", color: "#166534", dot: "#4ade80", icon: "/icon_approved.png" },
    CANCELLED:  { label: t.results.statusCancelled,  bg: "#f1f5f9", color: "#64748b", dot: "#94a3b8" },
  };

  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as Tab) || "lab";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [labResults, setLabResults] = useState<any[]>([]);
  const [pharmacyOrders, setPharmacyOrders] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

    const dataRes = await Promise.all([
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

      supabase
        .from("prescriptions")
        .select(`
          id, is_paid, status, medications, doctor_notes, qr_token, created_at, request_id,
          doctor:profiles!prescriptions_doctor_id_fkey(full_name)
        `)
        .eq("patient_id", currentUser.id)
        .neq("status", "archived")
        .order("created_at", { ascending: false }),
      supabase
        .from("lab_requests")
        .select("id, request_id, tests_list")
        .eq("patient_id", currentUser.id),
    ]);

    const [{ data: results, error: labErr }, { data: orders, error: ordErr }, { data: rxData }, { data: lrData }] = dataRes;
    if (labErr) { console.error(labErr); setError(labErr.message); }
    if (ordErr) { console.error(ordErr); setError(ordErr.message); }

    // Map lab_requests to prescriptions by request_id
    const rxMapped = (rxData || []).map((rx: any) => {
      const matchingLab = (lrData || []).find((lr: any) => lr.request_id === rx.request_id);
      return {
        ...rx,
        lab_requests: matchingLab ? [matchingLab] : [],
      };
    });

    setLabResults(results || []);
    setPharmacyOrders(orders || []);
    setPrescriptions(rxMapped);
    setLoading(false);
  }, [currentUser]);

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
        if (payload.new?.is_paid === true) {
          setPaidIds(prev => new Set([...prev, payload.new.id]));
        }
        fetchData();
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [currentUser, fetchData]);

  const TABS = [
    { key: "lab", label: isRtl ? "التحاليل" : "Analyses", count: labResults.length, icon: "/icon_labs.png", imgSize: 42, imgTopInactive: -6, imgTopActive: -10, imgScale: 1.15, right: 10 },
    { key: "pharmacy", label: isRtl ? "الوصفات" : "Ordonnances", count: prescriptions.length, icon: "/icon_pharmacy.png", imgSize: 42, imgTopInactive: -6, imgTopActive: -10, imgScale: 1.15, right: 10 },
  ];

  return (
    <div style={{ paddingBottom: 32 }}>
      {/* Header */}
      <div className="green-header" style={{ textAlign: isRtl ? "right" : "left" }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: 0, display: "flex", alignItems: "center", gap: 8, flexDirection: isRtl ? "row" : "row-reverse" }}>
          <Image src="/icon_results.png" alt="" width={40} height={40} /> {t.results.title}
        </h1>
        <p style={{ color: "#bbf7d0", fontSize: 13, margin: "4px 0 0" }}>{t.results.subtitle}</p>
      </div>

      <div style={{ padding: "16px 16px 0" }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, background: "#f1f5f9", borderRadius: 16, padding: "6px 6px", marginBottom: 20, paddingTop: 16, flexDirection: isRtl ? "row" : "row-reverse" }}>
          {TABS.map(tb => (
            <button key={tb.key} onClick={() => setTab(tb.key as Tab)}
              className="btn"
              style={{ position: "relative", flex: 1, padding: "10px 0", borderRadius: 12, border: "none", fontFamily: "inherit", fontWeight: 800, fontSize: 14, cursor: "pointer", transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)", background: tab === tb.key ? "linear-gradient(135deg, #22c55e, #16a34a)" : "transparent", color: tab === tb.key ? "#fff" : "#64748b", boxShadow: tab === tb.key ? "0 4px 14px rgba(22,163,74,0.3)" : "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Image src={tb.icon} alt="" width={tb.imgSize} height={tb.imgSize} style={{ position: "absolute", top: tab === tb.key ? tb.imgTopActive : tb.imgTopInactive, right: isRtl ? tb.right : "auto", left: isRtl ? "auto" : tb.right, transform: tab === tb.key ? `scale(${tb.imgScale})` : "scale(1)", transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)", filter: tab === tb.key ? "drop-shadow(0 4px 8px rgba(0,0,0,0.2))" : "none" }} />
              <span style={{ marginRight: isRtl ? 40 : 0, marginLeft: isRtl ? 0 : 40 }}>{tb.label}</span>
              {tb.count > 0 && <span style={{ background: tab === tb.key ? "#dcfce7" : "#e2e8f0", color: tab === tb.key ? "#166534" : "#64748b", borderRadius: 999, padding: "0 6px", fontSize: 12, position: "absolute", left: isRtl ? 16 : "auto", right: isRtl ? "auto" : 16 }}>{tb.count}</span>}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 12, padding: "10px 14px", marginBottom: 16, color: "#991b1b", fontSize: 13, fontWeight: 600, textAlign: isRtl ? "right" : "left", direction: isRtl ? "rtl" : "ltr" }}>
            {t.results.errorPrefix} {error}
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
              <p style={{ fontWeight: 700, color: "#6b7280" }}>{t.results.noLabs}</p>
              <p style={{ fontSize: 13, color: "#9ca3af" }}>{t.results.noLabsDesc}</p>
            </div>
          ) : labResults.map((result: any) => {
            const lab = Array.isArray(result.lab) ? result.lab[0] : result.lab;
            const labReq = Array.isArray(result.lab_request) ? result.lab_request[0] : result.lab_request;
            const tests = labReq?.tests_list || [];

            return (
              <div key={result.id} style={{ background: "#fff", borderRadius: 24, border: "1px solid #e8f5ec", padding: 16, marginBottom: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", borderRight: isRtl ? "4px solid #4ade80" : "none", borderLeft: !isRtl ? "4px solid #4ade80" : "none", textAlign: isRtl ? "right" : "left" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, flexDirection: isRtl ? "row" : "row-reverse" }}>
                  <span style={{ fontWeight: 900, fontSize: 14, color: "#374151", display: "flex", alignItems: "center", gap: 6, flexDirection: isRtl ? "row" : "row-reverse" }}>
                    <Image src="/icon_approved.png" alt="" width={20} height={20} /> {t.results.labResult}
                  </span>
                  <span style={{ fontSize: 11, color: "#9ca3af" }}>
                    {result.uploaded_at ? new Date(result.uploaded_at).toLocaleDateString(isRtl ? "ar-DZ" : "fr-FR") : ""}
                  </span>
                </div>

                {lab && (
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0e7490", marginBottom: 8, display: "flex", alignItems: "center", gap: 6, flexDirection: isRtl ? "row" : "row-reverse" }}>
                    <Image src="/icon_labs.png" alt="" width={16} height={16} /> {lab.full_name} {lab.address && `— ${lab.address}`}
                  </div>
                )}

                {Array.isArray(tests) && tests.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10, justifyContent: isRtl ? "flex-start" : "flex-end" }}>
                    {tests.map((tItem: any, i: number) => (
                      <span key={i} style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 8, background: "#cffafe", color: "#0e7490" }}>
                        🧪 {typeof tItem === "string" ? tItem : tItem?.name || ""}
                      </span>
                    ))}
                  </div>
                )}

                {result.result_notes && (
                  <div style={{ background: "#f0fdf4", borderRadius: 12, padding: "10px 14px", marginBottom: 10, border: "1px solid #bbf7d0", textAlign: isRtl ? "right" : "left" }}>
                    <p style={{ fontSize: 11, fontWeight: 900, color: "#6b7280", marginBottom: 4 }}>{t.results.resultSummary}</p>
                    <p style={{ fontSize: 13, color: "#374151", fontWeight: 600, margin: 0, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{String(result.result_notes)}</p>
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 12 }}>
                  {result.file_url && (
                    <a href={ensureAbsoluteUrl(result.file_url)} target="_blank" rel="noopener noreferrer"
                      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 0", borderRadius: 12, background: "linear-gradient(135deg,#3b82f6,#1d4ed8)", color: "#fff", fontWeight: 900, fontSize: 12, textDecoration: "none" }}>
                      <span>📥</span> {t.results.download}
                    </a>
                  )}
                  {!result.file_url && (
                    <div style={{ padding: "10px 0", borderRadius: 12, background: "#f1f5f9", color: "#94a3b8", fontWeight: 700, fontSize: 12, textAlign: "center" }}>
                      {t.results.noFile}
                    </div>
                  )}
                  <button
                    onClick={() => window.print()}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 0", borderRadius: 12, background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff", fontWeight: 900, fontSize: 12, border: "none", cursor: "pointer" }}>
                    <span>🖨️</span> {t.results.print}
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
              <p style={{ fontWeight: 700, color: "#6b7280" }}>{t.results.noPrescriptions}</p>
              <p style={{ fontSize: 13, color: "#9ca3af" }}>{t.results.noPrescriptionsDesc}</p>
              <a href="/requests" style={{ display: "inline-flex", marginTop: 16, padding: "10px 24px", borderRadius: 999, background: "linear-gradient(135deg,#2eb567,#1e8a4c)", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
                {t.results.requestConsultation}
              </a>
            </div>
          ) : prescriptions.map((rx: any) => {
            const doctor = Array.isArray(rx.doctor) ? rx.doctor[0] : rx.doctor;
            const isPaid = paidIds.has(rx.id) || rx.is_paid;
            const isSent = pharmacyOrders.some((o: any) => o.prescription?.id === rx.id);

            return (
              <PrescriptionCard
                key={rx.id}
                isSent={isSent}
                prescriptionId={rx.id}
                isPaid={isPaid}
                status={rx.status}
                medications={Array.isArray(rx.medications) ? rx.medications : []}
                labTests={rx.lab_requests?.[0]?.tests_list || []}
                labRequestId={rx.lab_requests?.[0]?.id || null}
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
