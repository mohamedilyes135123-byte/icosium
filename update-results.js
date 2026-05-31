const fs = require('fs');
let content = fs.readFileSync('apps/patient/src/app/(dashboard)/results/page.tsx', 'utf8');

// Import Image
content = content.replace(
  'import { createClient } from "@/lib/supabase/client";',
  'import { createClient } from "@/lib/supabase/client";\nimport Image from "next/image";'
);

// ORDER_STATUS
content = content.replace(
  'const ORDER_STATUS: Record<string, { label: string; bg: string; color: string; dot: string }> = {',
  'const ORDER_STATUS: Record<string, { label: string; bg: string; color: string; dot: string; icon?: string }> = {'
);
content = content.replace(
  'PENDING:    { label: "⏳ قيد الانتظار",     bg: "#fef9c3", color: "#92400e", dot: "#fbbf24" },',
  'PENDING:    { label: "قيد الانتظار",     bg: "#fef9c3", color: "#92400e", dot: "#fbbf24", icon: "/icon_pending.png" },'
);
content = content.replace(
  'PROCESSING: { label: "🔄 جاري التحضير",    bg: "#dbeafe", color: "#1e40af", dot: "#60a5fa" },',
  'PROCESSING: { label: "جاري التحضير",    bg: "#dbeafe", color: "#1e40af", dot: "#60a5fa", icon: "/icon_modified.png" },'
);
content = content.replace(
  'COMPLETED:  { label: "✅ جاهز للاستلام",   bg: "#dcfce7", color: "#166534", dot: "#4ade80" },',
  'COMPLETED:  { label: "جاهز للاستلام",   bg: "#dcfce7", color: "#166534", dot: "#4ade80", icon: "/icon_approved.png" },'
);

// Header
content = content.replace(
  '<h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: 0 }}>📋 نتائجي ووصفاتي</h1>',
  '<h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: 0, display: "flex", alignItems: "center", gap: 8 }}><Image src="/icon_results.png" alt="" width={32} height={32} /> نتائجي ووصفاتي</h1>'
);

// Tabs array
content = content.replace(
  '{ key: "lab",      label: "🧪 التحاليل",  count: labResults.length },',
  '{ key: "lab",      label: "التحاليل",  count: labResults.length, icon: "/icon_labs.png" },'
);
content = content.replace(
  '{ key: "pharmacy", label: "💊 الصيدلية", count: pharmacyOrders.length },',
  '{ key: "pharmacy", label: "الصيدلية", count: pharmacyOrders.length, icon: "/icon_pharmacy.png" },'
);

// Tab button rendering
content = content.replace(
  'style={{ flex: 1, padding: "10px 0", borderRadius: 12, border: "none", fontFamily: "inherit", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.15s", background: tab === t.key ? "#fff" : "transparent", color: tab === t.key ? "#2eb567" : "#64748b", boxShadow: tab === t.key ? "0 1px 4px rgba(0,0,0,0.1)" : "none" }}>\n              {t.label}',
  'style={{ flex: 1, padding: "10px 0", borderRadius: 12, border: "none", fontFamily: "inherit", fontWeight: 800, fontSize: 14, cursor: "pointer", transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)", background: tab === t.key ? "linear-gradient(135deg, #22c55e, #16a34a)" : "transparent", color: tab === t.key ? "#fff" : "#64748b", boxShadow: tab === t.key ? "0 4px 14px rgba(22,163,74,0.3)" : "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>\n              <Image src={t.icon} alt="" width={20} height={20} style={{ filter: tab === t.key ? "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" : "grayscale(1) opacity(0.5)" }} /> {t.label}'
);

// Empty states
content = content.replace(
  '<div style={{ fontSize: 64, marginBottom: 12 }}>🧪</div>',
  '<div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}><Image src="/icon_labs.png" alt="" width={80} height={80} /></div>'
);
content = content.replace(
  '<div style={{ fontSize: 64, marginBottom: 12 }}>💊</div>',
  '<div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}><Image src="/icon_pharmacy.png" alt="" width={80} height={80} /></div>'
);

// Lab title
content = content.replace(
  '<span style={{ fontWeight: 900, fontSize: 14, color: "#374151" }}>✅ نتائج التحليل</span>',
  '<span style={{ fontWeight: 900, fontSize: 14, color: "#374151", display: "flex", alignItems: "center", gap: 6 }}><Image src="/icon_approved.png" alt="" width={20} height={20} /> نتائج التحليل</span>'
);

// Lab name
content = content.replace(
  '⚗️ {lab.full_name}',
  '<span style={{display: "inline-flex", alignItems: "center", gap: 6}}><Image src="/icon_labs.png" alt="" width={16} height={16} /> {lab.full_name}</span>'
);

// Tests
content = content.replace(
  '🧪 {typeof t === \\'string\\' ? t : t?.name || ""}',
  '<span style={{display: "inline-flex", alignItems: "center", gap: 4}}><Image src="/icon_labs.png" alt="" width={14} height={14} /> {typeof t === \\'string\\' ? t : t?.name || ""}</span>'
);

// Pharmacy Order Card
content = content.replace(
  '<span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 8, background: cfg.bg, color: cfg.color }}>\n                    {cfg.label}\n                  </span>',
  '<span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 8, background: cfg.bg, color: cfg.color, display: "inline-flex", alignItems: "center", gap: 4 }}>\n                    {cfg.icon && <Image src={cfg.icon} alt="" width={14} height={14} />}\n                    {cfg.label}\n                  </span>'
);

content = content.replace(
  '💊 {pharmacy.full_name}',
  '<span style={{display: "inline-flex", alignItems: "center", gap: 6}}><Image src="/icon_pharmacy.png" alt="" width={18} height={18} /> {pharmacy.full_name}</span>'
);

content = content.replace(
  '<span style={{ fontSize: 20 }}>✅</span>',
  '<Image src="/icon_approved.png" alt="" width={24} height={24} />'
);

content = content.replace(
  '<span style={{ fontSize: 14 }}>💊</span>',
  '<Image src="/icon_pharmacy.png" alt="" width={16} height={16} />'
);

fs.writeFileSync('apps/patient/src/app/(dashboard)/results/page.tsx', content);
console.log("Successfully updated results/page.tsx");
