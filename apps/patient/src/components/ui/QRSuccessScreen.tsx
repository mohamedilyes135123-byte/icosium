"use client";

import { useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";

interface QRSuccessScreenProps {
  userId: string;
  fullNameAr: string;
  fullNameFr: string;
  onContinue: () => void;
}

export default function QRSuccessScreen({ userId, fullNameAr, fullNameFr, onContinue }: QRSuccessScreenProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  const downloadQR = () => {
    const svg = canvasRef.current?.querySelector("svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);
      const a = document.createElement("a");
      a.download = `qr-${fullNameFr.replace(/\s+/g, "-")}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div
      dir="rtl"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.5rem",
        padding: "2rem 1rem",
        textAlign: "center",
      }}
    >
      {/* Success animation */}
      <div style={{
        width: 80, height: 80,
        borderRadius: "50%",
        background: "linear-gradient(135deg,#22c55e,#16a34a)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 8px 30px rgba(22,163,74,0.35)",
        fontSize: "2rem",
        animation: "bounceIn 0.6s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        ✅
      </div>
      <style>{`
        @keyframes bounceIn {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 900, color: "#166534", margin: 0 }}>
          🎉 تم إنشاء ملفك الطبي!
        </h2>
        <p style={{ fontSize: "0.85rem", color: "#6b7280", marginTop: 6 }}>
          {fullNameAr} — {fullNameFr}
        </p>
        <p style={{ fontSize: "0.78rem", color: "#9ca3af", marginTop: 4 }}>
          تحقق من بريدك الإلكتروني لتفعيل الحساب
        </p>
      </div>

      {/* QR Code */}
      <div style={{
        background: "#fff",
        borderRadius: "1.5rem",
        padding: "1.5rem",
        border: "2px solid #bbf7d0",
        boxShadow: "0 8px 30px rgba(22,163,74,0.12)",
      }}>
        <p style={{ fontSize: "0.75rem", fontWeight: 800, color: "#6b7280", marginBottom: "1rem" }}>
          رمز QR الطبي الخاص بك
        </p>
        <div ref={canvasRef}>
          <QRCodeSVG
            value={`3inaya:patient:${userId}`}
            size={200}
            level="H"
            fgColor="#15803d"
            bgColor="#ffffff"
            style={{ borderRadius: 8 }}
          />
        </div>
        <p style={{ fontSize: "0.65rem", color: "#9ca3af", marginTop: "0.75rem", fontFamily: "monospace" }}>
          {userId.slice(0, 8).toUpperCase()}...
        </p>
      </div>

      {/* Info */}
      <div style={{
        background: "#f0fdf4",
        borderRadius: "1rem",
        padding: "0.875rem 1.25rem",
        border: "1px solid #bbf7d0",
        width: "100%",
      }}>
        <p style={{ fontSize: "0.78rem", color: "#166534", fontWeight: 700, margin: 0 }}>
          📱 احتفظ بهذا الرمز — يمكن للطبيب مسحه للوصول لملفك الطبي فورياً
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "0.75rem", width: "100%" }}>
        <button
          onClick={downloadQR}
          style={{
            flex: 1,
            height: 48,
            borderRadius: "0.875rem",
            border: "2px solid #22c55e",
            background: "#f0fdf4",
            color: "#16a34a",
            fontWeight: 900,
            fontSize: "0.88rem",
            cursor: "pointer",
          }}
        >
          📥 تحميل QR
        </button>
        <button
          onClick={onContinue}
          style={{
            flex: 1,
            height: 48,
            borderRadius: "0.875rem",
            border: "none",
            background: "linear-gradient(135deg,#22c55e,#16a34a)",
            color: "#fff",
            fontWeight: 900,
            fontSize: "0.88rem",
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(22,163,74,0.3)",
          }}
        >
          تسجيل الدخول →
        </button>
      </div>
    </div>
  );
}
