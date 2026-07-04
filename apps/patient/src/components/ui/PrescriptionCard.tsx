"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { unlockPrescription, archivePrescription, sendPrescriptionToPharmacy } from "@/lib/supabase/actions";
import { createClient } from "@/lib/supabase/client";
import PaymentModal from "@/components/ui/PaymentModal";
import { useTranslation } from "@/hooks/useTranslation";

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
  labTests?: any[];
  labRequestId?: string | null;
  isSent?: boolean;
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
  labTests = [],
  labRequestId = null,
  isSent = false,
}: PrescriptionCardProps) {
  const router = useRouter();
  const { t, language } = useTranslation();
  const pcKeys = t.results.prescriptionCard;
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pharmacyModal, setPharmacyModal] = useState(false);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [sending, setSending] = useState(false);
  const [isSentLocal, setIsSentLocal] = useState(isSent);
  const archivedRef = useRef(false);

  // Load pharmacies or labs for the send modal
  useEffect(() => {
    if (!pharmacyModal) return;
    const isLab = labTests && labTests.length > 0;
    const supabase = createClient();
    supabase
      .from("profiles")
      .select("id,full_name,address,phone")
      .eq("role", isLab ? "lab" : "pharmacy")
      .eq("approval_status", "approved")
      .then(({ data }) => setPharmacies(data || []));
  }, [pharmacyModal, labTests]);

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
      const isLab = labTests && labTests.length > 0;
      if (isLab && labRequestId) {
        await sendPrescriptionToPharmacy(prescriptionId, pharmacyId, patientId); // Just mark as used and keep record
        // Send to Lab instead (the function we already have `sendLabRequestToLab`)
        // But since we want the actual function `sendLabRequestToLab` 
        const { sendLabRequestToLab } = await import("@/lib/supabase/actions");
        await sendLabRequestToLab(labRequestId, pharmacyId);
      } else {
        await sendPrescriptionToPharmacy(prescriptionId, pharmacyId, patientId);
      }
      setIsSentLocal(true);
      alert(language === "ar" ? "تم إرسال طلبك بنجاح!" : "Votre demande a été envoyée avec succès !");
      setPharmacyModal(false);
    } catch { /* silent */ }
    setSending(false);
  };

  const handlePrint = () => {
    const isLab = labTests && labTests.length > 0;
    if (isLab && labRequestId) {
      window.open(`/print/lab/${labRequestId}`, '_blank');
    } else {
      window.open(`/print/prescription/${prescriptionId}`, '_blank');
    }
  };

  const handleDownload = () => {
    handlePrint();
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
            {labTests && labTests.length > 0 ? "🧪" : "📝"}
          </p>
          <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 900, color: "#064e3b" }}>
            {labTests && labTests.length > 0 
              ? (language === "ar" ? "طلب تحاليل طبية" : "Demande d'analyses médicales") 
              : (language === "ar" ? "وصفة طبية" : "Ordonnance médicale")}
          </h3>
          {doctorName && (
            <p style={{ margin: 0, fontSize: "0.72rem", color: "#4ade80", fontWeight: 600 }}>
              ⚕️ {doctorName}
            </p>
          )}
        </div>
        <div style={{ textAlign: "left" }}>
          <p style={{ margin: 0, fontSize: "0.68rem", color: "#6b7280" }}>
            {new Date(createdAt).toLocaleDateString()}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end", marginTop: 4 }}>
            <span style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: "0.65rem",
              fontWeight: 800,
              padding: "4px 10px",
              borderRadius: "0.5rem",
              background: isPaid ? "#dcfce7" : "#fef9c3",
              color: isPaid ? "#166534" : "#92400e",
            }}>
              {isPaid ? <><img src="/check.png" alt="Paid" style={{ width: 12, height: 12 }} /> {pcKeys.isPaid}</> : pcKeys.isPending}
            </span>
            {isSentLocal && (
              <span style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: "0.65rem",
                fontWeight: 800,
                padding: "4px 10px",
                borderRadius: "0.5rem",
                background: "#dbeafe",
                color: "#1e40af",
              }}>
                <img src="/check.png" alt="Sent" style={{ width: 12, height: 12, filter: "hue-rotate(180deg) saturate(2)" }} />
                {language === "ar" 
                  ? (labTests && labTests.length > 0 ? "تم الإرسال للمخبر" : "تم الإرسال للصيدلية") 
                  : (labTests && labTests.length > 0 ? "Envoyé au labo" : "Envoyé à la pharmacie")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content — blurred if not paid */}
      <div style={{ padding: "1rem 1.25rem", position: "relative", minHeight: "180px" }}>
        <div style={{
          filter: isPaid ? "none" : "blur(6px)",
          userSelect: isPaid ? "auto" : "none",
          pointerEvents: isPaid ? "auto" : "none",
          transition: "filter 0.4s ease",
        }}>
          {/* Medications or Lab Tests */}
          <div style={{ marginBottom: "0.75rem" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 900, color: "#6b7280", marginBottom: 6 }}>
              {labTests && labTests.length > 0 
                ? (language === "ar" ? "التحاليل المطلوبة:" : "Analyses prescrites :") 
                : (language === "ar" ? "الأدوية الموصوفة:" : "Médicaments prescrits :")}
            </p>
            {labTests && labTests.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {labTests.map((tItem: any, i: number) => (
                  <span key={i} style={{ fontSize: 13, fontWeight: 700, padding: "5px 12px", borderRadius: 8, background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" }}>
                    ☑ {typeof tItem === "string" ? tItem : tItem?.name || ""}
                  </span>
                ))}
              </div>
            ) : (
              medications.map((med, i) => (
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
              ))
            )}
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
                {language === "ar" ? "ملاحظات الطبيب:" : "Notes du médecin :"}
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
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
          }}>
            <div style={{
              background: "#ffffff",
              borderRadius: "1rem",
              padding: "1.5rem 1rem",
              textAlign: "center",
              boxShadow: "0 15px 40px rgba(0,0,0,0.15)",
              border: "2px solid #eab308",
              maxWidth: "320px",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.85rem",
            }}>
              <div style={{ background: "#fef9c3", width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(253,224,71,0.4)" }}>
                <span style={{ fontSize: "1.4rem" }}>🔒</span>
              </div>
              <p style={{ fontSize: "1rem", fontWeight: 800, color: "#1e293b", margin: 0 }}>
                {pcKeys.payToView}
              </p>
              <button
                onClick={() => setShowPaymentModal(true)}
                style={{
                  background: "#eab308",
                  color: "white",
                  border: "none",
                  padding: "0.6rem 1rem",
                  borderRadius: "0.5rem",
                  fontSize: "0.9rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  width: "100%",
                  boxShadow: "0 4px 10px rgba(234, 179, 8, 0.3)",
                  transition: "transform 0.2s",
                }}
                onMouseOver={e => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}
              >
                💳 {pcKeys.payWithCard}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3 Action Buttons — only when paid */}
      {isPaid && (
        <div style={{
          display: "flex",
          gap: "0.5rem",
          padding: "0 1.25rem 1.25rem",
        }}>
          <button
            onClick={() => {
              if (!isPaid) {
                alert(pcKeys.pleasePayFirst);
                return;
              }
              const url = labTests && labTests.length > 0 
                ? `/print/lab/${labRequestId}`
                : `/print/prescription/${prescriptionId}`;
              window.open(url, "_blank");
            }}
            style={{
              flex: 1,
              background: "linear-gradient(180deg, #1e40af, #3b82f6)",
              color: "white",
              border: "none",
              padding: "0.85rem 0",
              borderRadius: "0.5rem",
              fontSize: "0.95rem",
              fontWeight: 800,
              cursor: "pointer",
              transition: "transform 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              boxShadow: "0 4px 10px rgba(37, 99, 235, 0.2)",
            }}
            onMouseOver={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            <img src="/printer.png" alt="Print" style={{ width: 18, height: 18 }} />
            {labTests && labTests.length > 0 ? pcKeys.printAnalysis : pcKeys.printPrescription}
          </button>
          
          <button
            onClick={() => setPharmacyModal(true)}
            style={{
              flex: 1,
              background: "linear-gradient(180deg, #065f46, #10b981)",
              color: "white",
              border: "none",
              padding: "0.85rem 0",
              borderRadius: "0.5rem",
              fontSize: "0.95rem",
              fontWeight: 800,
              cursor: "pointer",
              transition: "transform 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              boxShadow: "0 4px 10px rgba(16, 185, 129, 0.2)",
            }}
            onMouseOver={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            <img src="/paper-plane.png" alt="Send" style={{ width: 18, height: 18 }} />
            {labTests && labTests.length > 0 ? pcKeys.sendToLab : pcKeys.sendToPharmacy}
          </button>
        </div>
      )}

      {/* Pharmacy/Lab selection modal */}
      {pharmacyModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)"
        }}>
          <div style={{ background: "white", padding: "1.5rem", borderRadius: "1.5rem", width: "90%", maxWidth: 400, boxShadow: "0 10px 40px rgba(0,0,0,0.15)", position: "relative" }}>
            <h3 style={{ margin: "0 0 1rem", color: "#1e293b", fontSize: "1.2rem", fontWeight: 800, textAlign: "center" }}>
              {labTests && labTests.length > 0 ? pcKeys.sendToLab : pcKeys.sendToPharmacy}
            </h3>
            <p style={{ margin: "0 0 1rem", fontSize: "0.85rem", color: "#64748b", textAlign: "center" }}>
              {labTests && labTests.length > 0 
                ? "Choisissez un laboratoire partenaire pour envoyer votre demande d'analyses."
                : "Choisissez une pharmacie partenaire pour préparer vos médicaments."}
            </p>
            
            <div style={{ maxHeight: 300, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, marginBottom: "1rem" }}>
              {pharmacies.length === 0 ? (
                <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "0.85rem", padding: "1rem 0" }}>
                  {labTests && labTests.length > 0 ? "Aucun laboratoire disponible." : "Aucune pharmacie disponible."}
                </p>
              ) : pharmacies.map(ph => (
                <div key={ph.id} style={{
                  padding: "0.8rem 1rem", border: "1px solid #e2e8f0", borderRadius: "0.75rem", background: "#f8fafc",
                  display: "flex", justifyContent: "space-between", alignItems: "center"
                }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: "0.9rem", color: "#334155" }}>{ph.full_name}</p>
                    <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#64748b" }}>{ph.address || "Adresse non disponible"}</p>
                  </div>
                  <button
                    onClick={() => sending ? null : handleSendToPharmacy(ph.id)}
                    style={{
                      width: "100%", background: sending ? "#ccc" : "#2563eb", color: "white", padding: "0.85rem",
                      borderRadius: "0.75rem", border: "none", fontWeight: 800, cursor: sending ? "default" : "pointer"
                    }}
                  >
                    {sending ? "..." : (language === "ar" ? "إرسال" : "Envoyer")}
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setPharmacyModal(false)}
              style={{
                width: "100%", padding: "0.8rem", background: "#f1f5f9", border: "none", color: "#475569",
                borderRadius: "0.75rem", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer"
              }}
            >
              Annuler
            </button>
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
