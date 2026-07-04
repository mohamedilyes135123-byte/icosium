"use client";

import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase/client";

export default function PrintPrescription({ params }: { params: Promise<{ id: string }> }) {
  const { id: resolvedId } = use(params);
  const supabase = createClient();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        // Try to fetch with FK hints (doctor app schema)
        let result = await supabase
          .from("prescriptions")
          .select(`
            *,
            patient:profiles!prescriptions_patient_id_fkey(full_name, date_of_birth, phone),
            doctor:profiles!prescriptions_doctor_id_fkey(full_name, specialty, phone, address, license_number, clinic_name)
          `)
          .eq("id", resolvedId)
          .single();

        if (result.error) {
          // Fallback to simple join if the first one fails
          result = await supabase
            .from("prescriptions")
            .select(`
              *,
              patient:profiles!patient_id(full_name, date_of_birth, phone),
              doctor:profiles!doctor_id(full_name, specialty, phone, address, license_number, clinic_name)
            `)
            .eq("id", resolvedId)
            .single();
        }

        if (result.error) {
           result = await supabase.from("prescriptions").select("*").eq("id", resolvedId).single();
        }

        if (result.error) throw result.error;

        let finalData = result.data;
        if (!finalData.patient && finalData.patient_id) {
          const { data: p } = await supabase.from('profiles').select('*').eq('id', finalData.patient_id).single();
          finalData.patient = p;
        }
        if (!finalData.doctor && finalData.doctor_id) {
          const { data: d } = await supabase.from('profiles').select('*').eq('id', finalData.doctor_id).single();
          finalData.doctor = d;
        }

        setData(finalData);
        setLoading(false);
        if (result.data) {
          setTimeout(() => window.print(), 800);
        }
      } catch (err: any) {
        console.error("Error loading prescription:", err);
        setErrorMsg(err.message || "Erreur de chargement");
        setLoading(false);
      }
    }
    loadData();
  }, [resolvedId]);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "sans-serif", color: "#0056b3" }}>
      <p>Chargement de l'ordonnance...</p>
    </div>
  );
  if (!data) return (
    <div style={{ padding: 40, textAlign: "center", color: "#dc2626", fontFamily: "sans-serif" }}>
      Ordonnance introuvable. <br/><span style={{fontSize: 12}}>{errorMsg}</span>
    </div>
  );

  const patient = Array.isArray(data.patient) ? data.patient[0] : (data.patient || {});
  const doctor = Array.isArray(data.doctor) ? data.doctor[0] : (data.doctor || {});

  const calculateAge = (dob: string | undefined | null): string => {
    if (!dob) return "—";
    const diff = Date.now() - new Date(dob).getTime();
    const age = Math.abs(new Date(diff).getUTCFullYear() - 1970);
    return `${age}`;
  };

  const prescriptionUrl = `${typeof window !== "undefined" ? window.location.origin : "https://enaya.dz"}/print/prescription/${data.id}`;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Segoe+UI:wght@400;600;800&display=swap');
        
        body { font-family: 'Segoe UI', Tahoma, sans-serif; background-color: #f0f4f8; padding: 20px; margin: 0; }
        .page { background: white; width: 210mm; min-height: 297mm; margin: auto; padding: 40px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border-radius: 15px; box-sizing: border-box; position: relative; }
        
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0056b3; padding-bottom: 20px; margin-bottom: 30px; }
        .logo-section img { width: 120px; object-fit: contain; }
        .doctor-info { text-align: right; color: #333; }
        .doctor-info h2 { margin: 0; color: #0056b3; }
        .doctor-info p { margin: 4px 0 0 0; font-size: 14px; }
        
        .title { text-align: center; font-size: 32px; font-weight: 800; color: #0056b3; margin: 20px 0; letter-spacing: 2px; text-transform: uppercase; }
        
        .patient-box { background: #e7f1ff; padding: 20px; border-radius: 10px; border-right: 5px solid #0056b3; margin-bottom: 30px; display: flex; justify-content: space-between; }
        .patient-box span { font-weight: 600; color: #003366; }

        .medicines { margin-top: 20px; min-height: 400px; }
        .medicines ol { font-size: 20px; line-height: 2.5; color: #222; margin: 0; padding-left: 20px; }
        .medicines li { margin-bottom: 10px; }
        
        .footer { margin-top: 50px; font-size: 16px; border-top: 1px solid #0056b3; padding-top: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
        .note { flex: 1; }
        .note p { margin: 0 0 5px 0; }
        .signature { text-align: center; color: #0056b3; font-weight: bold; min-width: 200px; }
        
        .qr-section { margin-top: 10px; text-align: left; }
        .qr-img { width: 80px; height: 80px; }

        @media print {
          @page { margin: 0; size: A4; }
          body { background: white !important; padding: 0 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .page { width: 100vw !important; min-height: 100vh !important; margin: 0 !important; border-radius: 0 !important; box-shadow: none !important; border: none !important; }
          .no-print { display: none !important; }
        }
      `}} />

      <div className="no-print" style={{ maxWidth: "210mm", margin: "0 auto 16px", display: "flex", gap: 10 }}>
        <button onClick={() => window.print()} style={{ background: "#0056b3", color: "white", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontWeight: "bold" }}>🖨️ Imprimer</button>
        <button onClick={() => window.close()} style={{ background: "#e2e8f0", color: "#333", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer" }}>✕ Fermer</button>
      </div>

      <div className="page" dir="ltr">
        <div className="header">
          <div className="logo-section">
            <img src="/logo-enaya.png" alt="شعار عناية" />
          </div>
          <div className="doctor-info">
            <h2><strong>Médecin:</strong> {doctor?.full_name || "................"}</h2>
            <p>Spécialiste en {doctor?.specialty || "................"}</p>
            <p>Tél: {doctor?.phone || "................"} {doctor?.address ? `| Cabinet: ${doctor.address}` : ""}</p>
          </div>
        </div>

        <div className="title">Ordonnance</div>

        <div className="patient-box" style={{ gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
          <span><strong>Patient:</strong> {patient?.full_name || "..........................."}</span>
          <span><strong>Date de prescription:</strong> {new Date(data.created_at).toLocaleDateString("fr-DZ", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
          <span><strong>Âge:</strong> {calculateAge(patient?.date_of_birth)} ans {patient?.date_of_birth ? `(${new Date(patient.date_of_birth).toLocaleDateString("fr-DZ")})` : ""}</span>
        </div>

        <div className="medicines">
          <ol>
            {(data.medications || []).map((med: any, idx: number) => (
              <li key={idx}>
                <strong>{med.name}</strong> {med.dose && `- ${med.dose}`}
                {med.frequency && <span style={{ fontSize: "16px", color: "#555", marginLeft: "10px" }}>({med.frequency} {med.duration && `pendant ${med.duration}`})</span>}
                {med.notes && <div style={{ fontSize: "14px", color: "#d97706", fontStyle: "italic", lineHeight: "1.2", marginTop: "4px" }}>Note: {med.notes}</div>}
              </li>
            ))}
          </ol>
        </div>

        <div className="footer">
          <div className="note">
            <p><strong>Remarque:</strong> {data.doctor_notes || "....................................................."}</p>
            <div className="qr-section">
               <img src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(prescriptionUrl)}`} alt="QR Code" className="qr-img" />
               <div style={{ fontSize: "10px", color: "#666", marginTop: "2px" }}>Signature électronique</div>
            </div>
          </div>
          <div className="signature">
          </div>
        </div>
      </div>
    </>
  );
}
