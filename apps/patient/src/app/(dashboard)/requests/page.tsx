"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";
import { uploadLabFile } from "@/lib/supabase/actions";
import Image from "next/image";

// Strictly 3 request types per spec
type RequestType = "APPOINTMENT" | "PRESCRIPTION" | "LAB";

const STATUS: Record<string, { label: string; bg: string; color: string; icon?: string }> = {
  PENDING:  { label: "قيد الانتظار", bg: "#fef9c3", color: "#92400e", icon: "/icon_pending.png" },
  APPROVED: { label: "موافق",        bg: "#dcfce7", color: "#166534", icon: "/icon_approved.png" },
  REJECTED: { label: "❌ مرفوض",     bg: "#fee2e2", color: "#991b1b" },
  MODIFIED: { label: "معدّل",        bg: "#dbeafe", color: "#1e40af", icon: "/icon_modified.png" },
};

export default function PatientRequests() {
  const [tab, setTab] = useState<"list" | "new">("list");
  const [requests, setRequests] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [labs, setLabs] = useState<any[]>([]);
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal] = useState<{ type: "lab" | "pharmacy"; labReqId?: string; prescriptionId?: string } | null>(null);

  // Form state — strictly 3 types
  const [reqType, setReqType] = useState<RequestType>("APPOINTMENT");
  const [doctorId, setDoctorId] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [priority, setPriority] = useState("normal");
  // Lab file upload
  const [labFile, setLabFile] = useState<File | null>(null);
  const [labFileUrl, setLabFileUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Prescription Analysis
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [oldPrescriptionUrl, setOldPrescriptionUrl] = useState<string>("");
  const aiInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user));
  }, []);

  const fetchAll = useCallback(async () => {
    if (!currentUser) return;
    const supabase = createClient();
    setLoading(true);

    const [{ data: reqs }, { data: docs }, { data: labList }, { data: pharmList }] = await Promise.all([
      supabase.from("medical_requests").select(`
        *,
        doctor:profiles!medical_requests_doctor_id_fkey(full_name,specialty),
        doctor_responses(*),
        prescriptions(id,qr_token,medications,is_used,is_paid),
        lab_requests(id,qr_token,tests_list,status,lab_id)
      `).eq("patient_id", currentUser.id).order("created_at", { ascending: false }),
      supabase.from("profiles").select("id,full_name,specialty,address").eq("role", "doctor").eq("approval_status", "approved").neq("is_banned", true),
      supabase.from("profiles").select("id,full_name,address").eq("role", "lab").eq("approval_status", "approved").neq("is_banned", true),
      supabase.from("profiles").select("id,full_name,address").eq("role", "pharmacy").eq("approval_status", "approved").neq("is_banned", true),
    ]);

    setRequests(reqs || []);
    setDoctors(docs || []);
    setLabs(labList || []);
    setPharmacies(pharmList || []);
    setLoading(false);
  }, [currentUser]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleLabFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    setLabFile(file);
    setUploading(true);
    try {
      const url = await uploadLabFile(currentUser.id, file);
      setLabFileUrl(url);
    } catch (err) {
      console.error("Upload failed:", err);
    }
    setUploading(false);
  };

  const handleOldPrescriptionChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    setAiAnalyzing(true);
    try {
      // Upload to Supabase first so doctor can see original image
      const url = await uploadLabFile(currentUser.id, file);
      setOldPrescriptionUrl(url);

      // Send to AI for analysis
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/analyze-prescription", { method: "POST", body: formData });
      const data = await res.json();
      
      if (data.success && data.analysis) {
        setSymptoms((prev) => prev ? prev + "\n\n" + data.analysis : data.analysis);
      } else {
        alert(data.message || "فشل تحليل الوصفة");
      }
    } catch (err) {
      console.error("AI Analysis failed:", err);
      alert("حدث خطأ أثناء تحليل الوصفة");
    }
    setAiAnalyzing(false);
  };

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSubmitting(true);
    const supabase = createClient();

    // APPOINTMENT type maps to a special note in symptoms
    const mappedType = reqType === "APPOINTMENT" ? "PRESCRIPTION" : reqType;
    const payload: any = {
      patient_id: currentUser.id,
      doctor_id: doctorId || null,
      type: mappedType,
      priority,
    };

    if (reqType === "APPOINTMENT") {
      payload.symptoms = `[موعد طبيب] ${symptoms}`;
      if (oldPrescriptionUrl) {
        payload.uploaded_prescription_url = oldPrescriptionUrl;
        payload.ai_analysis = symptoms; // Symptoms holds the combined text
      }
    } else if (reqType === "PRESCRIPTION") {
      payload.symptoms = `[تجديد وصفة] ${symptoms}`;
    } else {
      // LAB — include uploaded file reference in tests_requested
      payload.tests_requested = labFileUrl
        ? [{ name: "تحليل مرفق", code: "UPLOADED", file_url: labFileUrl }]
        : [{ name: "تحليل طبي", code: "LAB" }];
      if (symptoms) payload.patient_notes = symptoms;
    }

    await supabase.from("medical_requests").insert([payload]);
    setSymptoms(""); setDoctorId(""); setTab("list");
    setLabFile(null); setLabFileUrl("");
    setOldPrescriptionUrl("");
    setSubmitting(false);
    fetchAll();
  };

  const sendToPharmacy = async (pharmacyId: string, prescriptionId: string) => {
    if (!currentUser) return;
    const supabase = createClient();
    await supabase.from("pharmacy_orders").insert([{ prescription_id: prescriptionId, patient_id: currentUser.id, pharmacy_id: pharmacyId }]);
    await supabase.from("prescriptions").update({ is_used: true }).eq("id", prescriptionId);
    setModal(null); fetchAll();
  };

  const sendToLab = async (labId: string, labReqId: string) => {
    const supabase = createClient();
    await supabase.from("lab_requests").update({ lab_id: labId }).eq("id", labReqId);
    setModal(null); fetchAll();
  };

  const statusCfg = (s: string) => STATUS[s] || STATUS.PENDING;

  // The 3 allowed request types
  const REQUEST_TYPES = [
    {
      v: "APPOINTMENT" as RequestType,
      label: "موعد طبيب",
      icon: "/icon_calendar.png",
      grad: "linear-gradient(135deg, #16a34a, #15803d)",
      shadow: "rgba(22,163,74,0.3)",
      desc: "احجز موعداً مع طبيبك",
    },
    {
      v: "PRESCRIPTION" as RequestType,
      label: "تجديد",
      icon: "/icon_pharmacy.png",
      grad: "linear-gradient(135deg, #a855f7, #7e22ce)",
      shadow: "rgba(168,85,247,0.3)",
      desc: "تجديد وصفة طبية",
    },
    {
      v: "LAB" as RequestType,
      label: "تحليل",
      icon: "/icon_labs.png",
      grad: "linear-gradient(135deg, #06b6d4, #0e7490)",
      shadow: "rgba(6,182,212,0.3)",
      desc: "طلب تحليل مخبري",
    },
  ];

  return (
    <div dir="rtl" style={{ paddingBottom: 120 }}>
      {/* Header */}
      <div className="green-header" style={{ marginBottom: 0 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: 0 }}>🩺 طلباتي الطبية</h1>
        <p style={{ color: "#bbf7d0", fontSize: 13, margin: "4px 0 0" }}>أرسل طلباتك الطبية وتابع حالتها</p>
      </div>

      <div style={{ padding: "16px 16px 0" }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, background: "#f1f5f9", borderRadius: 16, padding: "6px 6px", marginBottom: 20, paddingTop: 20 }}>
          {[
            { key: "list", label: "طلباتي", icon: "/icon_results.png" },
            { key: "new", label: "طلب جديد", icon: "/icon_new_request.png" },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className="btn"
              style={{ position: "relative", flex: 1, padding: "10px 0", borderRadius: 12, border: "none", fontFamily: "inherit", fontWeight: 800, fontSize: 14, cursor: "pointer", transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)", background: tab === t.key ? "linear-gradient(135deg, #22c55e, #16a34a)" : "transparent", color: tab === t.key ? "#fff" : "#64748b", boxShadow: tab === t.key ? "0 4px 14px rgba(22,163,74,0.3)" : "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Image src={t.icon} alt="" width={60} height={60} style={{ position: "absolute", top: tab === t.key ? -40 : -24, right: 16, transform: tab === t.key ? "scale(1.2)" : "scale(1)", transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)", filter: tab === t.key ? "drop-shadow(0 4px 8px rgba(0,0,0,0.2))" : "none" }} />
              <span style={{ marginRight: 40 }}>{t.label}</span>
            </button>
          ))}
        </div>

        {/* ══ New Request Form ══ */}
        {tab === "new" && (
          <form onSubmit={submitRequest} style={{ background: "#fff", borderRadius: 24, padding: 20, border: "1px solid #e8f5ec", display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Type — exactly 3 buttons */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 900, color: "#374151", display: "block", marginBottom: 8 }}>نوع الطلب</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, paddingTop: 56 }}>
                {REQUEST_TYPES.map(o => (
                  <button key={o.v} type="button" onClick={() => setReqType(o.v)}
                    className="btn"
                    style={{ position: "relative", padding: "12px 8px 8px", borderRadius: 16, border: reqType === o.v ? "2px solid transparent" : "2px solid #e5e7eb", background: reqType === o.v ? o.grad : "#fff", color: reqType === o.v ? "#fff" : "#6b7280", boxShadow: reqType === o.v ? `0 4px 14px ${o.shadow}` : "none", fontFamily: "inherit", fontWeight: 800, fontSize: 13, cursor: "pointer", textAlign: "center", transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
                    <div style={{ position: "absolute", top: -52, left: "50%", transform: "translateX(-50%)" }}>
                      <Image src={o.icon} alt="" width={72} height={72} style={{ filter: reqType === o.v ? "drop-shadow(0 6px 12px rgba(0,0,0,0.3))" : "none", transform: reqType === o.v ? "scale(1.1)" : "scale(0.9)", transition: "all 0.3s" }} />
                    </div>
                    <div style={{ marginTop: 8 }}>{o.label}</div>
                    <div style={{ fontSize: 10, opacity: 0.8, marginTop: 2 }}>{o.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Doctor */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 900, color: "#374151", display: "block", marginBottom: 6 }}>الطبيب</label>
              <select value={doctorId} onChange={e => setDoctorId(e.target.value)}
                style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #e5e7eb", fontFamily: "inherit", fontSize: 14, background: "#f9fafb", color: "#374151", outline: "none" }}>
                <option value="">بث عام — أي طبيب متاح</option>
                {doctors.map(d => <option key={d.id} value={d.id}>{d.full_name}{d.specialty ? ` (${d.specialty})` : ""}</option>)}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 900, color: "#374151", display: "block", marginBottom: 6 }}>الأولوية</label>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { v: "normal", label: "عادي", grad: "linear-gradient(135deg, #64748b, #334155)", shadow: "rgba(100,116,139,0.3)" },
                  { v: "urgent", label: "عاجل 🚨", grad: "linear-gradient(135deg, #ef4444, #b91c1c)", shadow: "rgba(239,68,68,0.3)" },
                ].map(p => (
                  <button key={p.v} type="button" onClick={() => setPriority(p.v)}
                    style={{ flex: 1, padding: "10px 0", borderRadius: 12, border: priority === p.v ? "2px solid transparent" : "2px solid #e5e7eb", background: priority === p.v ? p.grad : "#fff", color: priority === p.v ? "#fff" : "#6b7280", boxShadow: priority === p.v ? `0 4px 14px ${p.shadow}` : "none", fontFamily: "inherit", fontWeight: 800, fontSize: 14, cursor: "pointer", transition: "all 0.2s" }}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Symptoms / Notes */}
            {(reqType === "APPOINTMENT" || reqType === "PRESCRIPTION") && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {reqType === "APPOINTMENT" && (
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 900, color: "#374151", display: "block", marginBottom: 6 }}>
                      🤖 هل لديك وصفة قديمة؟ (تحليل بالذكاء الاصطناعي)
                    </label>
                    <input
                      ref={aiInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleOldPrescriptionChange}
                      style={{ display: "none" }}
                    />
                    <button
                      type="button"
                      onClick={() => aiInputRef.current?.click()}
                      disabled={aiAnalyzing}
                      style={{
                        width: "100%", padding: "14px", borderRadius: 12, border: "2px dashed #a855f7",
                        background: oldPrescriptionUrl ? "#faf5ff" : "#fff", color: "#7e22ce", fontFamily: "inherit",
                        fontWeight: 700, fontSize: 14, cursor: aiAnalyzing ? "not-allowed" : "pointer", transition: "all 0.2s",
                      }}
                    >
                      {aiAnalyzing ? "✨ جاري قراءة الوصفة بالذكاء الاصطناعي..." : oldPrescriptionUrl ? "✅ تمت القراءة بنجاح" : "📄 ارفع الوصفة القديمة لنسخ محتواها"}
                    </button>
                    {oldPrescriptionUrl && (
                      <p style={{ fontSize: 11, color: "#7e22ce", marginTop: 4, fontWeight: 600 }}>
                        سيتم إرسال صورة الوصفة مع التحليل للطبيب
                      </p>
                    )}
                  </div>
                )}
                <div>
                  <label style={{ fontSize: 13, fontWeight: 900, color: "#374151", display: "block", marginBottom: 6 }}>
                    {reqType === "APPOINTMENT" ? "سبب الموعد / الأدوية *" : "الأعراض والشكوى *"}
                  </label>
                  <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)} required
                    placeholder={reqType === "APPOINTMENT" ? "مثال: مراجعة دورية، أو قم برفع وصفتك القديمة وسيتم كتابتها هنا..." : "مثال: أحتاج لتجديد وصفة Metformin..."}
                    style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #e5e7eb", fontFamily: "inherit", fontSize: 14, resize: "vertical", minHeight: 120, outline: "none", background: "#f9fafb", color: "#374151", boxSizing: "border-box" }} />
                </div>
              </div>
            )}

            {/* Lab — file upload + notes */}
            {reqType === "LAB" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 900, color: "#374151", display: "block", marginBottom: 6 }}>
                    📎 إرفاق وصفة أو ملف قديم (اختياري)
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleLabFileChange}
                    style={{ display: "none" }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      width: "100%",
                      padding: "14px",
                      borderRadius: 12,
                      border: "2px dashed #06b6d4",
                      background: labFile ? "#ecfeff" : "#f0fdf4",
                      color: "#0e7490",
                      fontFamily: "inherit",
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {uploading ? "⏳ جاري الرفع..." : labFile ? `✅ ${labFile.name}` : "📁 اختر ملفاً أو صورة"}
                  </button>
                  {labFileUrl && (
                    <p style={{ fontSize: 11, color: "#0e7490", marginTop: 4, fontWeight: 600 }}>
                      ✓ تم رفع الملف بنجاح
                    </p>
                  )}
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 900, color: "#374151", display: "block", marginBottom: 6 }}>ملاحظات للطبيب (اختياري)</label>
                  <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)}
                    placeholder="مثال: أحتاج تحليل HBA1C ووظائف الكلى..."
                    style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #e5e7eb", fontFamily: "inherit", fontSize: 14, resize: "none", height: 80, outline: "none", background: "#f9fafb", color: "#374151", boxSizing: "border-box" }} />
                </div>
              </div>
            )}

            <button type="submit" disabled={submitting || uploading}
              style={{ width: "100%", padding: "14px 0", borderRadius: 999, border: "none", background: "linear-gradient(135deg,#2eb567,#1e8a4c)", color: "#fff", fontFamily: "inherit", fontWeight: 700, fontSize: 16, cursor: submitting || uploading ? "not-allowed" : "pointer", boxShadow: "0 4px 15px rgba(46,181,103,0.35)", opacity: submitting || uploading ? 0.7 : 1 }}>
              {submitting ? "جاري الإرسال..." : "📤 إرسال الطلب للطبيب"}
            </button>
          </form>
        )}

        {/* ══ Requests List ══ */}
        {tab === "list" && (
          <div>
            {loading && [1, 2, 3].map(i => (
              <div key={i} style={{ height: 96, borderRadius: 20, background: "#f0fdf4", marginBottom: 12, animation: "pulse 1.5s infinite" }} />
            ))}

            {!loading && requests.length === 0 && (
              <div style={{ textAlign: "center", padding: "64px 16px" }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>🩺</div>
                <p style={{ fontWeight: 700, color: "#6b7280", marginBottom: 8 }}>لا توجد طلبات بعد</p>
                <button onClick={() => setTab("new")} className="btn-pill-green" style={{ marginTop: 8, fontSize: 14 }}>
                  ابدأ بطلب جديد
                </button>
              </div>
            )}

            {requests.map(req => {
              const cfg = statusCfg(req.status);
              const response = req.doctor_responses?.[0];
              const prescription = req.prescriptions?.[0];
              const labReq = req.lab_requests?.[0];
              const isApproved = req.status === "APPROVED";
              const isPending = req.status === "PENDING";

              const cardBorder = isApproved ? "2px solid rgba(134, 239, 172, 0.5)" : isPending ? "2px solid rgba(254, 240, 138, 0.5)" : "2px solid rgba(147, 197, 253, 0.5)";
              const cardBg = isApproved ? "linear-gradient(to bottom, #f0fdf4, #ffffff)" : isPending ? "linear-gradient(to bottom, #fefce8, #ffffff)" : "linear-gradient(to bottom, #eff6ff, #ffffff)";

              return (
                <div key={req.id} style={{ background: cardBg, borderRadius: 24, border: cardBorder, padding: 20, marginBottom: 16, boxShadow: "0 8px 24px rgba(0,0,0,0.04)", transition: "transform 0.2s ease" }}>
                  {/* Status + Type */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, padding: "6px 14px", borderRadius: 999, background: cfg.bg, color: cfg.color, display: "inline-flex", alignItems: "center", gap: 6 }}>
                        {cfg.icon && <Image src={cfg.icon} alt="" width={20} height={20} />}
                        {cfg.label}
                      </span>
                      {req.priority === "urgent" && (
                        <span style={{ fontSize: 12, fontWeight: 800, padding: "4px 10px", borderRadius: 999, background: "#fee2e2", color: "#991b1b", display: "inline-flex", alignItems: "center", gap: 6, animation: "pulse 1.5s infinite" }}>
                          🚨 عاجل
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, padding: "6px 14px", borderRadius: 999, background: req.type === "PRESCRIPTION" ? "#f3e8ff" : "#cffafe", color: req.type === "PRESCRIPTION" ? "#7c3aed" : "#0891b2", display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <Image src={req.type === "PRESCRIPTION" ? "/icon_pharmacy.png" : "/icon_labs.png"} alt="" width={20} height={20} />
                      {req.type === "PRESCRIPTION" ? "وصفة / موعد" : "تحليل"}
                    </span>
                  </div>

                  {/* Date & Doctor */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af", margin: 0 }}>
                      🗓️ {new Date(req.created_at).toLocaleDateString("ar-DZ", { day: "2-digit", month: "long", year: "numeric" })}
                    </p>
                    {req.doctor && (
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#166534", background: "#dcfce7", padding: "4px 10px", borderRadius: 8 }}>
                        ⚕️ {req.doctor.full_name}
                      </div>
                    )}
                  </div>

                  {/* Symptoms/Notes */}
                  {req.symptoms && (
                    <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "16px 4px 16px 16px", padding: "12px 16px", marginBottom: 12 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#475569", margin: 0 }}>{req.symptoms}</p>
                    </div>
                  )}

                  {/* Doctor response */}
                  {response && (
                    <div style={{ padding: "14px 16px", borderRadius: 16, background: response.action === "APPROVE" ? "#f0fdf4" : response.action === "REJECT" ? "#fef2f2" : "#eff6ff", borderRight: `5px solid ${response.action === "APPROVE" ? "#22c55e" : response.action === "REJECT" ? "#ef4444" : "#3b82f6"}`, marginBottom: 16 }}>
                      <p style={{ fontSize: 12, fontWeight: 900, color: response.action === "APPROVE" ? "#166534" : response.action === "REJECT" ? "#991b1b" : "#1e40af", marginBottom: 6, margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 16 }}>{response.action === "APPROVE" ? "✅" : response.action === "REJECT" ? "❌" : "ℹ️"}</span>
                        رد الطبيب:
                      </p>
                      <p style={{ fontSize: 14, fontWeight: 800, color: "#374151", margin: 0 }}>{response.notes}</p>
                    </div>
                  )}

                  {/* Send to Pharmacy */}
                  {isApproved && prescription && !prescription.is_used && (
                    <button onClick={() => setModal({ type: "pharmacy", prescriptionId: prescription.id })}
                      className="btn"
                      style={{ position: "relative", width: "100%", padding: "14px 0", borderRadius: 16, border: "none", background: "linear-gradient(135deg, #a855f7, #7e22ce)", color: "#fff", fontFamily: "inherit", fontWeight: 900, fontSize: 15, cursor: "pointer", marginBottom: 8, boxShadow: "0 6px 20px rgba(168,85,247,0.35)" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                        <Image src="/icon_pharmacy.png" alt="" width={28} height={28} />
                        اختر صيدلية وأرسل الوصفة
                      </div>
                    </button>
                  )}
                  {isApproved && prescription?.is_used && (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 800, color: "#7c3aed", background: "#faf5ff", padding: "12px 16px", borderRadius: 12, marginBottom: 8, border: "1px dashed #e9d5ff" }}>
                      <Image src="/icon_approved.png" alt="" width={20} height={20} /> تم إرسال الوصفة للصيدلية
                    </div>
                  )}

                  {/* Send to Lab */}
                  {isApproved && labReq && !labReq.lab_id && (
                    <button onClick={() => setModal({ type: "lab", labReqId: labReq.id })}
                      className="btn"
                      style={{ position: "relative", width: "100%", padding: "14px 0", borderRadius: 16, border: "none", background: "linear-gradient(135deg, #06b6d4, #0e7490)", color: "#fff", fontFamily: "inherit", fontWeight: 900, fontSize: 15, cursor: "pointer", boxShadow: "0 6px 20px rgba(6,182,212,0.35)" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                        <Image src="/icon_labs.png" alt="" width={28} height={28} />
                        اختر مختبراً وأرسل طلب التحليل
                      </div>
                    </button>
                  )}
                  {isApproved && labReq?.lab_id && (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 800, color: "#0e7490", background: "#ecfeff", padding: "12px 16px", borderRadius: 12, border: "1px dashed #cffafe" }}>
                      <Image src="/icon_approved.png" alt="" width={20} height={20} /> تم إرسال طلب التحليل للمختبر
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Provider Modal */}
      {modal && typeof window !== "undefined" && createPortal(
        <div onClick={() => setModal(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 999, display: "flex", alignItems: "flex-end" }}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", background: "#fff", borderRadius: "24px 24px 0 0", padding: 24, maxHeight: "70vh", overflowY: "auto" }}>
            <div style={{ width: 48, height: 4, background: "#e5e7eb", borderRadius: 999, margin: "0 auto 20px" }} />
            <h3 style={{ fontWeight: 900, fontSize: 18, textAlign: "center", marginBottom: 6 }}>
              {modal.type === "pharmacy" ? "💊 اختر الصيدلية" : "🧪 اختر المختبر"}
            </h3>
            <p style={{ fontSize: 13, color: "#6b7280", textAlign: "center", marginBottom: 20 }}>
              سيتم إرسال {modal.type === "pharmacy" ? "وصفتك" : "طلب التحليل"} مباشرة
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(modal.type === "pharmacy" ? pharmacies : labs).map(p => (
                <button key={p.id}
                  onClick={() => modal.type === "pharmacy" ? sendToPharmacy(p.id, modal.prescriptionId!) : sendToLab(p.id, modal.labReqId!)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 16, border: "2px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", fontFamily: "inherit", textAlign: "right" }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, color: "#374151", margin: 0 }}>{p.full_name}</p>
                    {p.address && <p style={{ fontSize: 12, color: "#9ca3af", margin: "2px 0 0" }}>📍 {p.address}</p>}
                  </div>
                  <span style={{ fontSize: 20 }}>←</span>
                </button>
              ))}
              {(modal.type === "pharmacy" ? pharmacies : labs).length === 0 && (
                <p style={{ textAlign: "center", color: "#9ca3af", padding: "32px 0" }}>
                  لا يوجد {modal.type === "pharmacy" ? "صيدليات" : "مختبرات"} متاحة حالياً
                </p>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
