"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { unlockPrescription, archivePrescription, sendPrescriptionToPharmacy } from "@/lib/supabase/actions";
import { createClient } from "@/lib/supabase/client";
import PaymentModal from "@/components/ui/PaymentModal";

interface Medication {
  name: string;
  dose: string;
  frequency: string;
  duration?: string;
  notes?: string;
}

interface Pharmacy {
  id: string;
  full_name: string;
  address?: string;
  phone?: string;
}

interface PrescriptionCardProps {
  prescriptionId: string;
  isPaid: boolean;
  status: string;
  medications: Medication[];
  doctorNotes: string | null;
  qrToken: string | null;
  doctorName?: string;
  createdAt: string;
  patientId: string;
  /** If true, archiving/redirect is triggered on unmount */
  enableArchiveOnLeave?: boolean;
  onPaymentSuccess?: () => void;
}

export default function PrescriptionCard({
  prescriptionId,
  isPaid,
  status,
  medications,
  doctorNotes,
  qrToken,
  doctorName,
  createdAt,
  patientId,
  enableArchiveOnLeave = false,
  onPaymentSuccess,
}: PrescriptionCardProps) {
  const router = useRouter();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pharmacyModal, setPharmacyModal] = useState(false);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [sending, setSending] = useState(false);
  const archivedRef = useRef(false);

  // Load pharmacies for the send modal
  useEffect(() => {
    if (!pharmacyModal) return;
    const supabase = createClient();
    supabase
      .from("profiles")
      .select("id,full_name,address,phone")
      .eq("role", "pharmacy")
      .eq("approval_status", "approved")
      .then(({ data }) => setPharmacies(data || []));
  }, [pharmacyModal]);

  // Auto-archive on unmount (when navigating away)
  useEffect(() => {
    if (!enableArchiveOnLeave) return;
    return () => {
      if (!archivedRef.current && status !== "archived") {
        archivedRef.current = true;
        archivePrescription(prescriptionId).catch(() => {});
      }
    };
  }, [prescriptionId, status, enableArchiveOnLeave]);

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    onPaymentSuccess?.();
  };

  const handleSendToPharmacy = async (pharmacyId: string) => {
    setSending(true);
    try {
      await sendPrescriptionToPharmacy(prescriptionId, pharmacyId, patientId);
      setPharmacyModal(false);
    } catch { /* silent */ }
    setSending(false);
  };

  const handlePrint = () => {
    router.push(`/print/${prescriptionId}`);
  };

  const handleDownload = () => {
    const content = [
      `وصفة طبية — منصة عناية`,
      `الطبيب: ${doctorName || "—"}`,
      `التاريخ: ${new Date(createdAt).toLocaleDateString("ar-DZ")}`,
      ``,
      `الأدوية:`,
      ...medications.map(m => `• ${m.name} | ${m.dose} | ${m.frequency}${m.duration ? ` | ${m.duration}` : ""}`),
      ``,
      doctorNotes ? `ملاحظات الطبيب: ${doctorNotes}` : "",
    ].filter(Boolean).join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prescription-${prescriptionId.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div dir="rtl" style={{
      background: "#fff",
      borderRadius: "1.5rem",
      border: "1.5px solid #e8f5ec",
      marginBottom: "1rem",
      overflow: "hidden",
      boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
        padding: "1rem 1.25rem",
        borderBottom: "1px solid #bbf7d0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <div>
          <p style={{ margin: 0, fontSize: "0.88rem", fontWeight: 900, color: "#166534" }}>
            📋 وصفة طبية
          </p>
          {doctorName && (
            <p style={{ margin: 0, fontSize: "0.72rem", color: "#4ade80", fontWeight: 600 }}>
              ⚕️ {doctorName}
            </p>
          )}
        </div>
        <div style={{ textAlign: "left" }}>
          <p style={{ margin: 0, fontSize: "0.68rem", color: "#6b7280" }}>
            {new Date(createdAt).toLocaleDateString("ar-DZ")}
          </p>
          <span style={{
            fontSize: "0.65rem",
            fontWeight: 800,
            padding: "2px 8px",
            borderRadius: 999,
            background: isPaid ? "#dcfce7" : "#fef9c3",
            color: isPaid ? "#166534" : "#92400e",
          }}>
            {isPaid ? "✅ مدفوع" : "⏳ في انتظار الدفع"}
          </span>
        </div>
      </div>

      {/* Content — blurred if not paid */}
      <div style={{ padding: "1rem 1.25rem", position: "relative" }}>
        <div style={{
          filter: isPaid ? "none" : "blur(6px)",
          userSelect: isPaid ? "auto" : "none",
          pointerEvents: isPaid ? "auto" : "none",
          transition: "filter 0.4s ease",
        }}>
          {/* Medications */}
          <div style={{ marginBottom: "0.75rem" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 900, color: "#6b7280", marginBottom: 6 }}>الأدوية الموصوفة:</p>
            {medications.map((med, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "0.6rem 0.875rem",
                borderRadius: "0.75rem",
                background: "#fafafa",
                border: "1px solid #f0fdf4",
                marginBottom: 6,
              }}>
                <span style={{ fontSize: "1rem" }}>💊</span>
                <div>
                  <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 800, color: "#1e293b" }}>{med.name}</p>
                  <p style={{ margin: 0, fontSize: "0.72rem", color: "#6b7280" }}>
                    {med.dose} — {med.frequency}{med.duration ? ` — ${med.duration}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Doctor notes */}
          {doctorNotes && (
            <div style={{
              background: "#f0fdf4",
              borderRadius: "0.75rem",
              padding: "0.75rem 1rem",
              border: "1px solid #bbf7d0",
            }}>
              <p style={{ margin: 0, fontSize: "0.72rem", fontWeight: 900, color: "#166534", marginBottom: 4 }}>
                ملاحظات الطبيب:
              </p>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "#374151", lineHeight: 1.6 }}>{doctorNotes}</p>
            </div>
          )}
        </div>

        {/* Pay overlay */}
        {!isPaid && (
          <div style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
          }}>
            <div style={{
              background: "rgba(255,255,255,0.95)",
              borderRadius: "1.25rem",
              padding: "1.25rem 1.75rem",
              textAlign: "center",
              boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
              border: "2px solid #fde047",
            }}>
              <p style={{ fontSize: "1.5rem", margin: "0 0 6px" }}>🔒</p>
              <p style={{ fontSize: "0.88rem", fontWeight: 900, color: "#1e293b", margin: "0 0 4px" }}>
                تظهر بعد الدفع
              </p>
              <p style={{ fontSize: "0.72rem", color: "#6b7280", margin: "0 0 12px" }}>
                ادفع لتتمكن من رؤية وتحميل وصفتك الطبية
              </p>
              <button
                onClick={() => setShowPaymentModal(true)}
                style={{
                  padding: "0.6rem 1.75rem",
                  borderRadius: "999px",
                  border: "none",
                  background: "linear-gradient(135deg,#f59e0b,#d97706)",
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  boxShadow: "0 4px 15px rgba(245,158,11,0.3)",
                }}
              >
                💳 دفع وفتح الوصفة
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3 Action Buttons — only when paid */}
      {isPaid && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "0.75rem",
          padding: "0 1.25rem 1.25rem",
        }}>
          {/* Download */}
          <button
            onClick={handleDownload}
            style={{
              padding: "1rem 0",
              borderRadius: "1.25rem",
              border: "none",
              background: "linear-gradient(135deg, #3b82f6, #1e3a8a)",
              color: "#fff",
              fontWeight: 900,
              fontSize: "0.85rem",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 6px 16px rgba(59,130,246,0.35)",
              transition: "transform 0.2s",
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            {/* Fallback emoji if image is not placed yet */}
            <img src="/download.png" alt="تحميل" style={{ width: 36, height: 36, objectFit: "contain" }} onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling!.style.display='block'; }} />
            <span style={{ fontSize: "1.5rem", display: "none" }}>📥</span>
            تحميل الملف
          </button>

          {/* Send */}
          <button
            onClick={() => setPharmacyModal(true)}
            style={{
              padding: "1rem 0",
              borderRadius: "1.25rem",
              border: "none",
              background: "linear-gradient(135deg, #a855f7, #581c87)",
              color: "#fff",
              fontWeight: 900,
              fontSize: "0.85rem",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 6px 16px rgba(168,85,247,0.35)",
              transition: "transform 0.2s",
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            <img src="/send.png" alt="إرسال" style={{ width: 36, height: 36, objectFit: "contain", transform: "translateX(-2px)" }} onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling!.style.display='block'; }} />
            <span style={{ fontSize: "1.5rem", display: "none" }}>📤</span>
            إرسال
          </button>

          {/* Print */}
          <button
            onClick={handlePrint}
            style={{
              padding: "1rem 0",
              borderRadius: "1.25rem",
              border: "none",
              background: "linear-gradient(135deg, #22c55e, #14532d)",
              color: "#fff",
              fontWeight: 900,
              fontSize: "0.85rem",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 6px 16px rgba(34,197,94,0.35)",
              transition: "transform 0.2s",
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            <img src="/printer.png" alt="طبع" style={{ width: 36, height: 36, objectFit: "contain" }} onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling!.style.display='block'; }} />
            <span style={{ fontSize: "1.5rem", display: "none" }}>🖨️</span>
            طبع
          </button>
        </div>
      )}

      {/* Pharmacy Modal */}
      {pharmacyModal && (
        <div
          onClick={() => setPharmacyModal(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "flex-end",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: "100%",
              background: "#fff",
              borderRadius: "24px 24px 0 0",
              padding: 24,
              maxHeight: "70vh",
              overflowY: "auto",
            }}
          >
            <div style={{ width: 48, height: 4, background: "#e5e7eb", borderRadius: 999, margin: "0 auto 20px" }} />
            <h3 style={{ fontWeight: 900, fontSize: 18, textAlign: "center", marginBottom: 16 }}>
              💊 إرسال إلى صيدلية
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {pharmacies.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleSendToPharmacy(p.id)}
                  disabled={sending}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 16px",
                    borderRadius: 16,
                    border: "2px solid #e5e7eb",
                    background: "#f9fafb",
                    cursor: "pointer",
                    textAlign: "right",
                    fontFamily: "inherit",
                  }}
                >
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, color: "#374151", margin: 0 }}>{p.full_name}</p>
                    {p.address && <p style={{ fontSize: 12, color: "#9ca3af", margin: "2px 0 0" }}>📍 {p.address}</p>}
                  </div>
                  <span style={{ fontSize: 20 }}>←</span>
                </button>
              ))}
              {pharmacies.length === 0 && (
                <p style={{ textAlign: "center", color: "#9ca3af", padding: "24px 0" }}>
                  لا توجد صيدليات متاحة حالياً
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          prescriptionId={prescriptionId}
          patientId={patientId}
          medications={medications}
          doctorName={doctorName}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
}
