"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import QRCode from "react-qr-code";

export default function PrintPrescriptionPage() {
  const { id } = useParams() as { id: string };
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPrescription() {
      const supabase = createClient();
      
      const { data: pData, error } = await supabase
        .from("prescriptions")
        .select(`
          *,
          doctor:profiles!prescriptions_doctor_id_fkey(full_name, avatar_url, phone),
          patient:profiles!prescriptions_patient_id_fkey(full_name, phone)
        `)
        .eq("id", id)
        .single();

      if (pData) {
        setData(pData);
      }
      setLoading(false);
    }
    loadPrescription();
  }, [id]);

  useEffect(() => {
    if (!loading && data) {
      // Trigger print after a short delay to ensure rendering is complete
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [loading, data]);

  if (loading) {
    return <div style={{ padding: 40, textAlign: "center" }}>جاري التحميل...</div>;
  }

  if (!data) {
    return <div style={{ padding: 40, textAlign: "center" }}>لم يتم العثور على الوصفة</div>;
  }

  // QR Value: This can be a URL to the pharmacy scan page with the qr_token
  // Currently we use a dummy URL or just the token.
  const qrValue = `https://inaya-platform.com/scan?token=${data.qr_token}`;

  return (
    <div style={{ background: "#fff", minHeight: "100vh", padding: "40px" }} dir="ltr">
      {/* Container for print - styled like an A4 paper */}
      <div 
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          background: "#fff",
          color: "#000",
          fontFamily: "Arial, sans-serif",
          boxSizing: "border-box"
        }}
        className="print-container"
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #000", paddingBottom: "20px", marginBottom: "30px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "24px", color: "#166534" }}>Platforme Inaya</h1>
            <p style={{ margin: "5px 0 0", fontSize: "14px", color: "#666" }}>La santé numérique simplifiée</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <h2 style={{ margin: 0, fontSize: "20px" }}>Dr. {data.doctor?.full_name}</h2>
            <p style={{ margin: "5px 0 0", fontSize: "14px" }}>Médecin</p>
          </div>
        </div>

        {/* Patient Info */}
        <div style={{ marginBottom: "40px", display: "flex", justifyContent: "space-between" }}>
          <div>
            <p style={{ margin: "0 0 5px" }}><strong>Patient(e):</strong> {data.patient?.full_name}</p>
            <p style={{ margin: 0 }}><strong>Date:</strong> {new Date(data.created_at).toLocaleDateString("fr-FR")}</p>
          </div>
        </div>

        {/* Prescription Title */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h2 style={{ margin: 0, fontSize: "28px", textTransform: "uppercase", letterSpacing: "2px", borderBottom: "1px solid #000", display: "inline-block", paddingBottom: "5px" }}>
            Ordonnance
          </h2>
        </div>

        {/* Medications */}
        <div style={{ minHeight: "300px" }}>
          <h3 style={{ fontSize: "18px", marginBottom: "20px" }}>Médicaments:</h3>
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {data.medications?.map((med: any, i: number) => (
              <li key={i} style={{ marginBottom: "20px", fontSize: "16px" }}>
                <strong>{i + 1}. {med.name}</strong>
                <div style={{ marginLeft: "20px", marginTop: "5px", color: "#333", fontSize: "15px" }}>
                  {med.dose} — {med.frequency} {med.duration ? `— ${med.duration}` : ""}
                </div>
              </li>
            ))}
          </ul>

          {data.doctor_notes && (
            <div style={{ marginTop: "40px", paddingTop: "20px", borderTop: "1px dashed #ccc" }}>
              <p style={{ margin: 0, fontWeight: "bold" }}>Notes du médecin:</p>
              <p style={{ marginTop: "5px", fontStyle: "italic" }}>{data.doctor_notes}</p>
            </div>
          )}
        </div>

        {/* Footer: Stamp and QR */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "50px", borderTop: "2px solid #000", paddingTop: "20px" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ 
              width: "120px", 
              height: "120px", 
              border: "3px solid #166534", 
              borderRadius: "50%", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              color: "#166534",
              transform: "rotate(-15deg)",
              fontWeight: "bold",
              fontSize: "14px",
              opacity: 0.8
            }}>
              Signature & Cachet<br/>Dr. {data.doctor?.full_name}
            </div>
          </div>
          
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "12px", marginBottom: "10px", color: "#666" }}>Scanner pour la pharmacie</p>
            <QRCode value={qrValue} size={100} />
          </div>
        </div>
      </div>
      
      {/* Hide things when actually printing */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}} />
    </div>
  );
}
