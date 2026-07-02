"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";
import { uploadLabFile } from "@/lib/supabase/actions";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

type RequestType = "APPOINTMENT" | "PRESCRIPTION" | "LAB";
type DocType = "prescription" | "lab" | "ecg";

export default function PatientRequests() {
  const { t, language } = useTranslation();
  const isRtl = language === 'ar';

  const STATUS: Record<string, { label: string; bg: string; color: string; icon?: string }> = {
    PENDING:  { label: t.requests.statusPending, bg: "#fef9c3", color: "#92400e", icon: "/icon_pending.png" },
    APPROVED: { label: t.requests.statusApproved, bg: "#dcfce7", color: "#166534", icon: "/icon_approved.png" },
    REJECTED: { label: t.requests.statusRejected, bg: "#fee2e2", color: "#991b1b" },
    MODIFIED: { label: t.requests.statusModified, bg: "#dbeafe", color: "#1e40af", icon: "/icon_modified.png" },
  };

  const DOC_CONFIGS: Record<RequestType, {
    docTypes: { value: DocType; label: string; icon: string; desc: string }[];
    uploadLabel: string;
    color: string;
    borderColor: string;
    bgColor: string;
  }> = {
    APPOINTMENT: {
      docTypes: [
        { value: "prescription", label: t.requests.oldPrescription, icon: "💊", desc: t.requests.oldPrescriptionDescAppt },
        { value: "lab",          label: t.requests.oldLab,          icon: "🧪", desc: t.requests.oldLabDesc },
        { value: "ecg",          label: t.requests.ecg,             icon: "💓", desc: t.requests.ecgDesc },
      ],
      uploadLabel: t.requests.uploadAppt,
      color: "#7e22ce",
      borderColor: "#a855f7",
      bgColor: "#faf5ff",
    },
    PRESCRIPTION: {
      docTypes: [
        { value: "prescription", label: t.requests.oldPrescription, icon: "💊", desc: t.requests.oldPrescriptionDescRenew },
        { value: "lab",          label: t.requests.oldLab,          icon: "🧪", desc: t.requests.oldLabDescRenew },
      ],
      uploadLabel: t.requests.uploadRenew,
      color: "#7e22ce",
      borderColor: "#a855f7",
      bgColor: "#faf5ff",
    },
    LAB: {
      docTypes: [
        { value: "lab",          label: t.requests.oldLab,          icon: "🧪", desc: t.requests.oldLabDesc },
        { value: "prescription", label: t.requests.prescriptionToLab, icon: "💊", desc: t.requests.prescriptionToLabDesc },
        { value: "ecg",          label: t.requests.ecg,             icon: "💓", desc: t.requests.ecgDesc },
      ],
      uploadLabel: t.requests.uploadLab,
      color: "#0e7490",
      borderColor: "#06b6d4",
      bgColor: "#ecfeff",
    },
  };

  const [tab, setTab] = useState<"list" | "new">("list");
  const [requests, setRequests] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [labs, setLabs] = useState<any[]>([]);
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal] = useState<{ type: "lab" | "pharmacy"; labReqId?: string; prescriptionId?: string } | null>(null);

  const [reqType, setReqType] = useState<RequestType>("APPOINTMENT");
  const [doctorId, setDoctorId] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [priority, setPriority] = useState("normal");

  const [docFiles, setDocFiles] = useState<File[]>([]);
  const [docFileUrls, setDocFileUrls] = useState<string[]>([]);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiAnalyses, setAiAnalyses] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const docInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    setDocFiles([]);
    setDocFileUrls([]);
    setAiAnalyses([]);
  }, [reqType]);

  const handleDocFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !currentUser) return;

    setDocFiles(prev => [...prev, ...files]);
    setUploading(true);
    setAiAnalyzing(true);

    try {
      for (const file of files) {
        const url = await uploadLabFile(currentUser.id, file);
        setDocFileUrls(prev => [...prev, url]);

        const formData = new FormData();
        formData.append("file", file);
        const docType = reqType === "LAB" ? "lab" : "prescription";
        formData.append("docType", docType);
        
        const res = await fetch("/api/analyze-prescription", { method: "POST", body: formData });
        const data = await res.json();

        if (data.success && data.analysis) {
          setAiAnalyses(prev => [...prev, data.analysis]);
        } else {
          alert(`${t.requests.aiError} ${data.message || t.requests.tryAgain}`);
        }
      }
    } catch (err) {
      console.error("Analysis failed:", err);
    }

    setUploading(false);
    setAiAnalyzing(false);
    
    if (docInputRef.current) docInputRef.current.value = '';
  };

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSubmitting(true);
    const supabase = createClient();

    const mappedType = reqType === "APPOINTMENT" ? "PRESCRIPTION" : reqType;
    const payload: any = {
      patient_id: currentUser.id,
      doctor_id: doctorId || null,
      type: mappedType,
      priority,
    };

    if (reqType === "APPOINTMENT") {
      payload.symptoms = `${t.requests.apptPrefix} ${symptoms}`;
      if (docFileUrls.length > 0) {
        payload.uploaded_prescription_url = docFileUrls.join(',');
        payload.ai_analysis = aiAnalyses.join('\n\n━━━━━━━━━━━━━━━━━━━━━━━━\n\n');
      }
    } else if (reqType === "PRESCRIPTION") {
      payload.symptoms = `${t.requests.renewPrefix} ${symptoms}`;
      if (docFileUrls.length > 0) {
        payload.uploaded_prescription_url = docFileUrls.join(',');
        payload.ai_analysis = aiAnalyses.join('\n\n━━━━━━━━━━━━━━━━━━━━━━━━\n\n');
      }
    } else {
      payload.tests_requested = [{ name: t.requests.labTest, code: "LAB" }];
      if (symptoms) payload.patient_notes = symptoms;
      if (docFileUrls.length > 0) {
        payload.uploaded_prescription_url = docFileUrls.join(',');
        payload.ai_analysis = aiAnalyses.join('\n\n━━━━━━━━━━━━━━━━━━━━━━━━\n\n');
      }
    }

    await supabase.from("medical_requests").insert([payload]);
    setSymptoms(""); setDoctorId(""); setTab("list");
    setDocFiles([]); setDocFileUrls([]);
    setAiAnalyses([]); setSubmitting(false);
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

  const REQUEST_TYPES = [
    {
      v: "APPOINTMENT" as RequestType,
      label: t.requests.typeAppt,
      icon: "/icon_calendar.png",
      grad: "linear-gradient(135deg, #16a34a, #15803d)",
      shadow: "rgba(22,163,74,0.3)",
      desc: t.requests.typeApptDesc,
    },
    {
      v: "PRESCRIPTION" as RequestType,
      label: t.requests.typeRenew,
      icon: "/icon_pharmacy.png",
      grad: "linear-gradient(135deg, #a855f7, #7e22ce)",
      shadow: "rgba(168,85,247,0.3)",
      desc: t.requests.typeRenewDesc,
    },
    {
      v: "LAB" as RequestType,
      label: t.requests.typeLab,
      icon: "/icon_labs.png",
      grad: "linear-gradient(135deg, #06b6d4, #0e7490)",
      shadow: "rgba(6,182,212,0.3)",
      desc: t.requests.typeLabDesc,
    },
  ];

  return (
    <div style={{ paddingBottom: 120 }}>
      {/* Header */}
      <div className="green-header" style={{ marginBottom: 0, textAlign: isRtl ? "right" : "left" }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: 0 }}>{t.requests.title}</h1>
        <p style={{ color: "#bbf7d0", fontSize: 13, margin: "4px 0 0" }}>{t.requests.subtitle}</p>
      </div>

      <div style={{ padding: "16px 16px 0" }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, background: "#f1f5f9", borderRadius: 16, padding: "6px 6px", marginBottom: 20, paddingTop: 20, flexDirection: isRtl ? "row" : "row-reverse" }}>
          {[
            { key: "list", label: t.requests.tabList, icon: "/icon_results.png" },
            { key: "new", label: t.requests.tabNew, icon: "/icon_new_request.png" },
          ].map(tb => (
            <button key={tb.key} onClick={() => setTab(tb.key as any)}
              className="btn"
              style={{ position: "relative", flex: 1, padding: "10px 0", borderRadius: 12, border: "none", fontFamily: "inherit", fontWeight: 800, fontSize: 14, cursor: "pointer", transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)", background: tab === tb.key ? "linear-gradient(135deg, #22c55e, #16a34a)" : "transparent", color: tab === tb.key ? "#fff" : "#64748b", boxShadow: tab === tb.key ? "0 4px 14px rgba(22,163,74,0.3)" : "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Image src={tb.icon} alt="" width={60} height={60} style={{ position: "absolute", top: tab === tb.key ? -40 : -24, right: isRtl ? 16 : "auto", left: isRtl ? "auto" : 16, transform: tab === tb.key ? "scale(1.2)" : "scale(1)", transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)", filter: tab === tb.key ? "drop-shadow(0 4px 8px rgba(0,0,0,0.2))" : "none" }} />
              <span style={{ marginRight: isRtl ? 40 : 0, marginLeft: isRtl ? 0 : 40 }}>{tb.label}</span>
            </button>
          ))}
        </div>

        {/* ══ New Request Form ══ */}
        {tab === "new" && (
          <form onSubmit={submitRequest} style={{ background: "#fff", borderRadius: 24, padding: 20, border: "1px solid #e8f5ec", display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Type */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 900, color: "#374151", display: "block", marginBottom: 8, textAlign: isRtl ? "right" : "left" }}>{t.requests.reqType}</label>
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
              <label style={{ fontSize: 13, fontWeight: 900, color: "#374151", display: "block", marginBottom: 6, textAlign: isRtl ? "right" : "left" }}>{t.requests.doctor}</label>
              <select value={doctorId} onChange={e => setDoctorId(e.target.value)}
                style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #e5e7eb", fontFamily: "inherit", fontSize: 14, background: "#f9fafb", color: "#374151", outline: "none", direction: isRtl ? "rtl" : "ltr" }}>
                <option value="">{t.requests.anyDoctor}</option>
                {doctors.map(d => <option key={d.id} value={d.id}>{d.full_name}{d.specialty ? ` (${d.specialty})` : ""}</option>)}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 900, color: "#374151", display: "block", marginBottom: 6, textAlign: isRtl ? "right" : "left" }}>{t.requests.priority}</label>
              <div style={{ display: "flex", gap: 8, flexDirection: isRtl ? "row" : "row-reverse" }}>
                {[
                  { v: "normal", label: t.requests.normal, grad: "linear-gradient(135deg, #64748b, #334155)", shadow: "rgba(100,116,139,0.3)" },
                  { v: "urgent", label: t.requests.urgent, grad: "linear-gradient(135deg, #ef4444, #b91c1c)", shadow: "rgba(239,68,68,0.3)" },
                ].map(p => (
                  <button key={p.v} type="button" onClick={() => setPriority(p.v)}
                    style={{ flex: 1, padding: "10px 0", borderRadius: 12, border: priority === p.v ? "2px solid transparent" : "2px solid #e5e7eb", background: priority === p.v ? p.grad : "#fff", color: priority === p.v ? "#fff" : "#6b7280", boxShadow: priority === p.v ? `0 4px 14px ${p.shadow}` : "none", fontFamily: "inherit", fontWeight: 800, fontSize: 14, cursor: "pointer", transition: "all 0.2s" }}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* DOCUMENT UPLOAD */}
            <div style={{
              background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
              border: `2px solid #cbd5e1`,
              borderRadius: 20,
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexDirection: isRtl ? "row" : "row-reverse" }}>
                <span style={{ fontSize: 20 }}>📎</span>
                <div style={{ textAlign: isRtl ? "right" : "left" }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 900, color: "#1e293b" }}>
                    {t.requests.attachmentsTitle}
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>
                    {t.requests.attachmentsDesc}
                  </p>
                </div>
              </div>

              <input
                ref={docInputRef}
                type="file"
                accept="image/*,application/pdf"
                multiple
                onChange={handleDocFileChange}
                style={{ display: "none" }}
              />
              <button
                type="button"
                onClick={() => docInputRef.current?.click()}
                disabled={aiAnalyzing || uploading}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: 14,
                  border: `2px dashed #94a3b8`,
                  background: docFiles.length > 0 ? "#e2e8f0" : "#fff",
                  color: "#475569",
                  fontFamily: "inherit",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: (aiAnalyzing || uploading) ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {aiAnalyzing || uploading
                  ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Loader2 className="animate-spin" size={20} />
                        <span>{t.requests.uploading}</span>
                      </div>
                    )
                  : docFiles.length > 0
                    ? t.requests.filesAttached.replace('{count}', docFiles.length.toString())
                    : t.requests.chooseFiles
                }
              </button>

              {docFiles.length > 0 && (
                <div style={{
                  background: "#fff",
                  border: `1.5px solid #cbd5e1`,
                  borderRadius: 14,
                  padding: 14,
                  position: "relative",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexDirection: isRtl ? "row" : "row-reverse" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexDirection: isRtl ? "row" : "row-reverse" }}>
                      <span style={{ fontSize: 16 }}>✅</span>
                      <span style={{ fontSize: 13, fontWeight: 900, color: "#475569" }}>
                        {t.requests.attachedFiles}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setDocFiles([]); setDocFileUrls([]); setAiAnalyses([]); }}
                      style={{ background: "none", border: "none", color: "#ef4444", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                    >
                      {t.requests.deleteAll}
                    </button>
                  </div>
                  <ul style={{ margin: 0, padding: "0 20px", fontSize: 12, color: "#374151", textAlign: isRtl ? "right" : "left", direction: "ltr" }}>
                    {docFiles.map((f, idx) => (
                      <li key={idx} style={{ marginBottom: 4 }}>{f.name}</li>
                    ))}
                  </ul>
                  <p style={{ margin: "8px 0 0", fontSize: 11, color: "#64748b", display: "flex", alignItems: "center", gap: 4, flexDirection: isRtl ? "row" : "row-reverse", textAlign: isRtl ? "right" : "left" }}>
                    <span>📤</span> {t.requests.filesWillBeSent}
                  </p>
                </div>
              )}
            </div>

            {/* Symptoms / Notes */}
            {(reqType === "APPOINTMENT" || reqType === "PRESCRIPTION") && (
              <div>
                <label style={{ fontSize: 13, fontWeight: 900, color: "#374151", display: "block", marginBottom: 6, textAlign: isRtl ? "right" : "left" }}>
                  {reqType === "APPOINTMENT" ? t.requests.symptomsAppt : t.requests.symptomsRenew}
                </label>
                <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)}
                  required={docFiles.length === 0}
                  placeholder={reqType === "APPOINTMENT"
                    ? t.requests.symptomsApptPlace
                    : t.requests.symptomsRenewPlace}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #e5e7eb", fontFamily: "inherit", fontSize: 14, resize: "vertical", minHeight: 100, outline: "none", background: "#f9fafb", color: "#374151", boxSizing: "border-box", direction: isRtl ? "rtl" : "ltr" }} />
              </div>
            )}

            {reqType === "LAB" && (
              <div>
                <label style={{ fontSize: 13, fontWeight: 900, color: "#374151", display: "block", marginBottom: 6, textAlign: isRtl ? "right" : "left" }}>{t.requests.notesLab}</label>
                <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)}
                  placeholder={t.requests.notesLabPlace}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #e5e7eb", fontFamily: "inherit", fontSize: 14, resize: "none", height: 80, outline: "none", background: "#f9fafb", color: "#374151", boxSizing: "border-box", direction: isRtl ? "rtl" : "ltr" }} />
              </div>
            )}

            <button type="submit" disabled={submitting || uploading || aiAnalyzing}
              style={{ width: "100%", padding: "14px 0", borderRadius: 999, border: "none", background: "linear-gradient(135deg,#2eb567,#1e8a4c)", color: "#fff", fontFamily: "inherit", fontWeight: 700, fontSize: 16, cursor: (submitting || uploading || aiAnalyzing) ? "not-allowed" : "pointer", boxShadow: "0 4px 15px rgba(46,181,103,0.35)", opacity: (submitting || uploading || aiAnalyzing) ? 0.7 : 1 }}>
              {submitting ? t.requests.submitting : t.requests.sendRequest}
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
                <p style={{ fontWeight: 700, color: "#6b7280", marginBottom: 8 }}>{t.requests.noRequests}</p>
                <button onClick={() => setTab("new")} className="btn-pill-green" style={{ marginTop: 8, fontSize: 14 }}>
                  {t.requests.startNewRequest}
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
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexDirection: isRtl ? "row" : "row-reverse" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, padding: "6px 14px", borderRadius: 999, background: cfg.bg, color: cfg.color, display: "inline-flex", alignItems: "center", gap: 6, flexDirection: isRtl ? "row" : "row-reverse" }}>
                        {cfg.icon && <Image src={cfg.icon} alt="" width={20} height={20} />}
                        {cfg.label}
                      </span>
                      {req.priority === "urgent" && (
                        <span style={{ fontSize: 12, fontWeight: 800, padding: "4px 10px", borderRadius: 999, background: "#fee2e2", color: "#991b1b", display: "inline-flex", alignItems: "center", gap: 6, animation: "pulse 1.5s infinite", flexDirection: isRtl ? "row" : "row-reverse" }}>
                          {t.requests.urgent}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, padding: "6px 14px", borderRadius: 999, background: req.type === "PRESCRIPTION" ? "#f3e8ff" : "#cffafe", color: req.type === "PRESCRIPTION" ? "#7c3aed" : "#0891b2", display: "inline-flex", alignItems: "center", gap: 6, flexDirection: isRtl ? "row" : "row-reverse" }}>
                      <Image src={req.type === "PRESCRIPTION" ? "/icon_pharmacy.png" : "/icon_labs.png"} alt="" width={20} height={20} />
                      {req.type === "PRESCRIPTION" ? t.requests.prescriptionOrAppt : t.requests.labType}
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexDirection: isRtl ? "row" : "row-reverse" }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af", margin: 0 }}>
                      🗓️ {new Date(req.created_at).toLocaleDateString(isRtl ? "ar-DZ" : "fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
                    </p>
                    {req.doctor && (
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#166534", background: "#dcfce7", padding: "4px 10px", borderRadius: 8 }}>
                        ⚕️ {req.doctor.full_name}
                      </div>
                    )}
                  </div>

                  {req.ai_analysis && (
                    <div style={{ background: "linear-gradient(135deg, #f0f4ff, #f5f0ff)", border: "1px solid #c4b5fd", borderRadius: 12, padding: "10px 14px", marginBottom: 12, display: "flex", alignItems: "flex-start", gap: 8, flexDirection: isRtl ? "row" : "row-reverse" }}>
                      <span style={{ fontSize: 16, flexShrink: 0 }}>🤖</span>
                      <div style={{ textAlign: isRtl ? "right" : "left" }}>
                        <p style={{ margin: 0, fontSize: 12, fontWeight: 900, color: "#5b21b6" }}>{t.requests.aiAnalyzed}</p>
                        <p style={{ margin: "2px 0 0", fontSize: 11, color: "#7c3aed" }}>{t.requests.aiAnalyzedDesc}</p>
                      </div>
                    </div>
                  )}

                  {req.symptoms && (
                    <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: isRtl ? "16px 4px 16px 16px" : "4px 16px 16px 16px", padding: "12px 16px", marginBottom: 12 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#475569", margin: 0, textAlign: isRtl ? "right" : "left" }}>{req.symptoms}</p>
                    </div>
                  )}

                  {response && (
                    <div style={{ padding: "14px 16px", borderRadius: 16, background: response.action === "APPROVE" ? "#f0fdf4" : response.action === "REJECT" ? "#fef2f2" : "#eff6ff", borderRight: isRtl ? `5px solid ${response.action === "APPROVE" ? "#22c55e" : response.action === "REJECT" ? "#ef4444" : "#3b82f6"}` : "none", borderLeft: !isRtl ? `5px solid ${response.action === "APPROVE" ? "#22c55e" : response.action === "REJECT" ? "#ef4444" : "#3b82f6"}` : "none", marginBottom: 16, textAlign: isRtl ? "right" : "left" }}>
                      <p style={{ fontSize: 12, fontWeight: 900, color: response.action === "APPROVE" ? "#166534" : response.action === "REJECT" ? "#991b1b" : "#1e40af", marginBottom: 6, margin: 0, display: "flex", alignItems: "center", gap: 6, flexDirection: isRtl ? "row" : "row-reverse" }}>
                        <span style={{ fontSize: 16 }}>{response.action === "APPROVE" ? "✅" : response.action === "REJECT" ? "❌" : "ℹ️"}</span>
                        {t.requests.doctorResponse}
                      </p>
                      <p style={{ fontSize: 14, fontWeight: 800, color: "#374151", margin: 0 }}>{response.notes}</p>
                    </div>
                  )}

                  {isApproved && prescription && !prescription.is_used && (
                    <button onClick={() => setModal({ type: "pharmacy", prescriptionId: prescription.id })}
                      className="btn"
                      style={{ position: "relative", width: "100%", padding: "14px 0", borderRadius: 16, border: "none", background: "linear-gradient(135deg, #a855f7, #7e22ce)", color: "#fff", fontFamily: "inherit", fontWeight: 900, fontSize: 15, cursor: "pointer", marginBottom: 8, boxShadow: "0 6px 20px rgba(168,85,247,0.35)" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, flexDirection: isRtl ? "row" : "row-reverse" }}>
                        <Image src="/icon_pharmacy.png" alt="" width={28} height={28} />
                        {t.requests.choosePharmacy}
                      </div>
                    </button>
                  )}
                  {isApproved && prescription?.is_used && (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 800, color: "#7c3aed", background: "#faf5ff", padding: "12px 16px", borderRadius: 12, marginBottom: 8, border: "1px dashed #e9d5ff", flexDirection: isRtl ? "row" : "row-reverse" }}>
                      <Image src="/icon_approved.png" alt="" width={20} height={20} /> {t.requests.sentToPharmacy}
                    </div>
                  )}

                  {isApproved && labReq && !labReq.lab_id && (
                    <button onClick={() => setModal({ type: "lab", labReqId: labReq.id })}
                      className="btn"
                      style={{ position: "relative", width: "100%", padding: "14px 0", borderRadius: 16, border: "none", background: "linear-gradient(135deg, #06b6d4, #0e7490)", color: "#fff", fontFamily: "inherit", fontWeight: 900, fontSize: 15, cursor: "pointer", boxShadow: "0 6px 20px rgba(6,182,212,0.35)" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, flexDirection: isRtl ? "row" : "row-reverse" }}>
                        <Image src="/icon_labs.png" alt="" width={28} height={28} />
                        {t.requests.chooseLab}
                      </div>
                    </button>
                  )}
                  {isApproved && labReq?.lab_id && (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 800, color: "#0e7490", background: "#ecfeff", padding: "12px 16px", borderRadius: 12, border: "1px dashed #cffafe", flexDirection: isRtl ? "row" : "row-reverse" }}>
                      <Image src="/icon_approved.png" alt="" width={20} height={20} /> {t.requests.sentToLab}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modal && typeof window !== "undefined" && createPortal(
        <div onClick={() => setModal(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 999, display: "flex", alignItems: "flex-end" }}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", background: "#fff", borderRadius: "24px 24px 0 0", padding: 24, maxHeight: "70vh", overflowY: "auto", direction: isRtl ? "rtl" : "ltr" }}>
            <div style={{ width: 48, height: 4, background: "#e5e7eb", borderRadius: 999, margin: "0 auto 20px" }} />
            <h3 style={{ fontWeight: 900, fontSize: 18, textAlign: "center", marginBottom: 6 }}>
              {modal.type === "pharmacy" ? t.requests.modalPharmacyTitle : t.requests.modalLabTitle}
            </h3>
            <p style={{ fontSize: 13, color: "#6b7280", textAlign: "center", marginBottom: 20 }}>
              {modal.type === "pharmacy" ? t.requests.willSendPrescription : t.requests.willSendLab}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(modal.type === "pharmacy" ? pharmacies : labs).map(p => (
                <button key={p.id}
                  onClick={() => modal.type === "pharmacy" ? sendToPharmacy(p.id, modal.prescriptionId!) : sendToLab(p.id, modal.labReqId!)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 16, border: "2px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", fontFamily: "inherit", textAlign: isRtl ? "right" : "left", flexDirection: isRtl ? "row" : "row-reverse" }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, color: "#374151", margin: 0 }}>{p.full_name}</p>
                    {p.address && <p style={{ fontSize: 12, color: "#9ca3af", margin: "2px 0 0" }}>📍 {p.address}</p>}
                  </div>
                  <span style={{ fontSize: 20 }}>{isRtl ? "←" : "→"}</span>
                </button>
              ))}
              {(modal.type === "pharmacy" ? pharmacies : labs).length === 0 && (
                <p style={{ textAlign: "center", color: "#9ca3af", padding: "32px 0" }}>
                  {modal.type === "pharmacy" ? t.requests.noPharmacies : t.requests.noLabs}
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
