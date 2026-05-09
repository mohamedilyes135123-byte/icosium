"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

type RequestType = "PRESCRIPTION" | "LAB" | "ROUTINE_LAB";

const ROUTINE_TESTS = [
  { name: "صورة الدم الكاملة CBC", code: "CBC" },
  { name: "سكر الدم الصائم", code: "FBG" },
  { name: "سكر بعد الأكل", code: "PPBG" },
  { name: "وظائف الكبد", code: "LFT" },
  { name: "وظائف الكلى", code: "RFT" },
  { name: "صورة دهنيات الدم", code: "LIPID" },
  { name: "فيتامين D", code: "VIT_D" },
  { name: "هرمون الغدة الدرقية TSH", code: "TSH" },
  { name: "تحليل البول", code: "UA" },
];

const STATUS: Record<string, { label: string; bg: string; color: string }> = {
  PENDING:  { label: "⏳ قيد الانتظار", bg: "#fef9c3", color: "#92400e" },
  APPROVED: { label: "✅ موافق",         bg: "#dcfce7", color: "#166534" },
  REJECTED: { label: "❌ مرفوض",        bg: "#fee2e2", color: "#991b1b" },
  MODIFIED: { label: "✏️ معدّل",        bg: "#dbeafe", color: "#1e40af" },
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

  // Form state
  const [reqType, setReqType] = useState<RequestType>("PRESCRIPTION");
  const [doctorId, setDoctorId] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [priority, setPriority] = useState("normal");

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
        prescriptions(id,qr_token,medications,is_used),
        lab_requests(id,qr_token,tests_list,status,lab_id)
      `).eq("patient_id", currentUser.id).order("created_at", { ascending: false }),
      supabase.from("profiles").select("id,full_name,specialty,address").eq("role", "doctor").eq("approval_status", "approved"),
      supabase.from("profiles").select("id,full_name,address").eq("role", "lab").eq("approval_status", "approved"),
      supabase.from("profiles").select("id,full_name,address").eq("role", "pharmacy").eq("approval_status", "approved"),
    ]);

    setRequests(reqs || []);
    setDoctors(docs || []);
    setLabs(labList || []);
    setPharmacies(pharmList || []);
    setLoading(false);
  }, [currentUser]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSubmitting(true);
    const supabase = createClient();
    const payload: any = {
      patient_id: currentUser.id,
      doctor_id: doctorId || null,
      type: reqType,
      priority,
    };
    if (reqType === "PRESCRIPTION") {
      payload.symptoms = symptoms;
    } else {
      payload.tests_requested = selectedTests.map(code =>
        ROUTINE_TESTS.find(t => t.code === code) || { name: code, code }
      );
    }
    await supabase.from("medical_requests").insert([payload]);
    setSymptoms(""); setSelectedTests([]); setDoctorId(""); setTab("list");
    setSubmitting(false);
    fetchAll();
  };

  const sendToPharmacy = async (pharmacyId: string, prescriptionId: string) => {
    if (!currentUser) return;
    const supabase = createClient();
    await supabase.from("pharmacy_orders").insert([{ prescription_id: prescriptionId, patient_id: currentUser.id, pharmacy_id: pharmacyId }]);
    // Mark prescription as used so the button disappears and results page is accurate
    await supabase.from("prescriptions").update({ is_used: true }).eq("id", prescriptionId);
    setModal(null); fetchAll();
  };

  const sendToLab = async (labId: string, labReqId: string) => {
    const supabase = createClient();
    await supabase.from("lab_requests").update({ lab_id: labId }).eq("id", labReqId);
    setModal(null); fetchAll();
  };

  const toggleTest = (code: string) =>
    setSelectedTests(prev => prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]);

  const statusCfg = (s: string) => STATUS[s] || STATUS.PENDING;

  return (
    <div dir="rtl" style={{ paddingBottom: 32 }}>
      {/* Header */}
      <div className="green-header" style={{ marginBottom: 0 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: 0 }}>🩺 طلباتي الطبية</h1>
        <p style={{ color: "#bbf7d0", fontSize: 13, margin: "4px 0 0" }}>أرسل طلباتك الطبية وتابع حالتها</p>
      </div>

      <div style={{ padding: "16px 16px 0" }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, background: "#f1f5f9", borderRadius: 16, padding: 6, marginBottom: 20 }}>
          {[
            { key: "list", label: "📋 طلباتي" },
            { key: "new",  label: "➕ طلب جديد" },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              style={{ flex: 1, padding: "10px 0", borderRadius: 12, border: "none", fontFamily: "inherit", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.15s", background: tab === t.key ? "#fff" : "transparent", color: tab === t.key ? "#2eb567" : "#64748b", boxShadow: tab === t.key ? "0 1px 4px rgba(0,0,0,0.1)" : "none" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* New Request Form */}
        {tab === "new" && (
          <form onSubmit={submitRequest} style={{ background: "#fff", borderRadius: 24, padding: 20, border: "1px solid #e8f5ec", display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Type */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 900, color: "#374151", display: "block", marginBottom: 8 }}>نوع الطلب</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                {[
                  { v: "PRESCRIPTION", label: "وصفة طبية", emoji: "💊" },
                  { v: "LAB",          label: "تحاليل",    emoji: "🧪" },
                  { v: "ROUTINE_LAB",  label: "روتينية",   emoji: "🔁" },
                ].map(o => (
                  <button key={o.v} type="button" onClick={() => setReqType(o.v as RequestType)}
                    style={{ padding: "10px 8px", borderRadius: 12, border: `2px solid ${reqType === o.v ? "#2eb567" : "#e5e7eb"}`, background: reqType === o.v ? "#f0fdf4" : "#fff", color: reqType === o.v ? "#166534" : "#6b7280", fontFamily: "inherit", fontWeight: 700, fontSize: 12, cursor: "pointer", textAlign: "center" }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{o.emoji}</div>
                    {o.label}
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
                {[{ v: "normal", label: "عادي" }, { v: "urgent", label: "🚨 عاجل" }].map(p => (
                  <button key={p.v} type="button" onClick={() => setPriority(p.v)}
                    style={{ flex: 1, padding: "10px 0", borderRadius: 12, border: `2px solid ${priority === p.v ? (p.v === "urgent" ? "#ef4444" : "#2eb567") : "#e5e7eb"}`, background: priority === p.v ? (p.v === "urgent" ? "#fee2e2" : "#f0fdf4") : "#fff", color: priority === p.v ? (p.v === "urgent" ? "#991b1b" : "#166534") : "#6b7280", fontFamily: "inherit", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Symptoms */}
            {reqType === "PRESCRIPTION" && (
              <div>
                <label style={{ fontSize: 13, fontWeight: 900, color: "#374151", display: "block", marginBottom: 6 }}>الأعراض والشكوى *</label>
                <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)} required
                  placeholder="مثال: أشعر بصداع شديد منذ 3 أيام، مع ارتفاع في الحرارة..."
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #e5e7eb", fontFamily: "inherit", fontSize: 14, resize: "none", height: 120, outline: "none", background: "#f9fafb", color: "#374151", boxSizing: "border-box" }} />
              </div>
            )}

            {/* Tests */}
            {reqType !== "PRESCRIPTION" && (
              <div>
                <label style={{ fontSize: 13, fontWeight: 900, color: "#374151", display: "block", marginBottom: 8 }}>
                  اختر التحاليل {selectedTests.length > 0 && <span style={{ background: "#dcfce7", color: "#166534", borderRadius: 999, padding: "2px 8px", fontSize: 11 }}>{selectedTests.length} محدد</span>}
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {ROUTINE_TESTS.map(t => (
                    <button key={t.code} type="button" onClick={() => toggleTest(t.code)}
                      style={{ padding: "10px 12px", borderRadius: 12, border: `2px solid ${selectedTests.includes(t.code) ? "#2eb567" : "#e5e7eb"}`, background: selectedTests.includes(t.code) ? "#f0fdf4" : "#fff", color: selectedTests.includes(t.code) ? "#166534" : "#6b7280", fontFamily: "inherit", fontWeight: 700, fontSize: 12, cursor: "pointer", textAlign: "right" }}>
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button type="submit" disabled={submitting}
              style={{ width: "100%", padding: "14px 0", borderRadius: 999, border: "none", background: "linear-gradient(135deg,#2eb567,#1e8a4c)", color: "#fff", fontFamily: "inherit", fontWeight: 700, fontSize: 16, cursor: "pointer", boxShadow: "0 4px 15px rgba(46,181,103,0.35)", opacity: submitting ? 0.7 : 1 }}>
              {submitting ? "جاري الإرسال..." : "📨 إرسال الطلب للطبيب"}
            </button>
          </form>
        )}

        {/* Requests List */}
        {tab === "list" && (
          <div>
            {loading && [1,2,3].map(i => (
              <div key={i} style={{ height: 96, borderRadius: 20, background: "#f0fdf4", marginBottom: 12, animation: "pulse 1.5s infinite" }} />
            ))}

            {!loading && requests.length === 0 && (
              <div style={{ textAlign: "center", padding: "64px 16px" }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>🩺</div>
                <p style={{ fontWeight: 700, color: "#6b7280", marginBottom: 8 }}>لا توجد طلبات بعد</p>
                <button onClick={() => setTab("new")} className="btn-pill-green" style={{ marginTop: 8, fontSize: 14 }}>
                  ابدأ بطلب استشارة
                </button>
              </div>
            )}

            {requests.map(req => {
              const cfg = statusCfg(req.status);
              const response = req.doctor_responses?.[0];
              const prescription = req.prescriptions?.[0];
              const labReq = req.lab_requests?.[0];
              const isApproved = req.status === "APPROVED";

              return (
                <div key={req.id} style={{ background: "#fff", borderRadius: 24, border: "1px solid #e8f5ec", padding: 16, marginBottom: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                  {/* Status + Type */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 8, background: cfg.bg, color: cfg.color, display: "inline-block" }}>
                        {cfg.label}
                      </span>
                      {req.priority === "urgent" && (
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: "#fee2e2", color: "#991b1b", display: "inline-block", animation: "pulse 1.5s infinite" }}>
                          🚨 عاجل
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 8, background: req.type === "PRESCRIPTION" ? "#f3e8ff" : "#cffafe", color: req.type === "PRESCRIPTION" ? "#7c3aed" : "#0891b2" }}>
                      {req.type === "PRESCRIPTION" ? "💊 وصفة" : req.type === "LAB" ? "🧪 تحليل" : "🔁 روتيني"}
                    </span>
                  </div>

                  {/* Doctor */}
                  {req.doctor && (
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 8 }}>
                      ⚕️ {req.doctor.full_name} {req.doctor.specialty ? `(${req.doctor.specialty})` : ""}
                    </div>
                  )}

                  {/* Symptoms */}
                  {req.symptoms && (
                    <p style={{ fontSize: 13, color: "#6b7280", background: "#f9fafb", borderRadius: 10, padding: "8px 12px", marginBottom: 8 }}>
                      {req.symptoms}
                    </p>
                  )}

                  {/* Date */}
                  <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 8 }}>
                    {new Date(req.created_at).toLocaleDateString("ar-DZ", { day: "2-digit", month: "long", year: "numeric" })}
                  </p>

                  {/* Doctor Response */}
                  {response && (
                    <div style={{ padding: "10px 12px", borderRadius: 12, background: response.action === "APPROVE" ? "#f0fdf4" : response.action === "REJECT" ? "#fef2f2" : "#eff6ff", border: `1px solid ${response.action === "APPROVE" ? "#86efac" : response.action === "REJECT" ? "#fca5a5" : "#93c5fd"}`, marginBottom: 8 }}>
                      <p style={{ fontSize: 11, fontWeight: 900, color: "#6b7280", marginBottom: 4 }}>رد الطبيب:</p>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#374151", margin: 0 }}>{response.notes}</p>
                    </div>
                  )}

                  {/* Send to Pharmacy */}
                  {isApproved && prescription && !prescription.is_used && (
                    <button onClick={() => setModal({ type: "pharmacy", prescriptionId: prescription.id })}
                      style={{ width: "100%", padding: "12px 0", borderRadius: 12, border: "2px solid #a855f7", background: "#faf5ff", color: "#7c3aed", fontFamily: "inherit", fontWeight: 700, fontSize: 14, cursor: "pointer", marginBottom: 8 }}>
                      💊 اختر صيدلية وأرسل الوصفة
                    </button>
                  )}
                  {isApproved && prescription?.is_used && (
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#7c3aed", background: "#faf5ff", padding: "8px 12px", borderRadius: 10, marginBottom: 8 }}>
                      ✅ تم إرسال الوصفة للصيدلية
                    </div>
                  )}

                  {/* Send to Lab */}
                  {isApproved && labReq && !labReq.lab_id && (
                    <button onClick={() => setModal({ type: "lab", labReqId: labReq.id })}
                      style={{ width: "100%", padding: "12px 0", borderRadius: 12, border: "2px solid #06b6d4", background: "#ecfeff", color: "#0e7490", fontFamily: "inherit", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                      🧪 اختر مختبراً وأرسل طلب التحليل
                    </button>
                  )}
                  {isApproved && labReq?.lab_id && (
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0e7490", background: "#ecfeff", padding: "8px 12px", borderRadius: 10 }}>
                      ✅ تم إرسال طلب التحليل للمختبر
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Provider Modal */}
      {modal && (
        <div onClick={() => setModal(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 50, display: "flex", alignItems: "flex-end" }}>
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
        </div>
      )}
    </div>
  );
}
