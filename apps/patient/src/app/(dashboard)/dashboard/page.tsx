"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function PatientDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(prof);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div dir="rtl" className="pb-24">
      {/* ── Soft Curved Green Header ── */}
      <div className="premium-header">
        <div className="header-content">
          <div className="bell-container">
            <span style={{ fontSize: "1.5rem" }}>🔔</span>
            <div className="bell-dot" />
          </div>
          <div className="text-right">
            <p className="hero-greet">مرحباً بك 👋</p>
            <h1 className="hero-name">{loading ? "..." : profile?.full_name?.split(" ")[0] || "مريض"} — عناية</h1>
          </div>
        </div>
        <div className="wave-bottom">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" fill="var(--bg-page)"/>
          </svg>
        </div>
      </div>

      <div className="px-5 mt-[-10px] relative z-10">
        
        {/* ── Yellow Alert Banner ── */}
        <div className="premium-alert">
          <span className="text-xl">⚠️</span>
          <span className="alert-text">
            {loading ? "جاري التحديث..." : "لديك موعد طبي غداً الساعة 10:00 صباحاً"}
          </span>
        </div>

        {/* ── Sticker-style Service Cards ── */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <a href="/requests" className="premium-card service-card">
            <div className="sticker-icon bg-green-100 shadow-green-200/50">
              <span className="text-3xl filter drop-shadow-sm">🩺</span>
            </div>
            <span className="service-label">استشارة</span>
          </a>
          <a href="/requests" className="premium-card service-card">
            <div className="sticker-icon bg-yellow-100 shadow-yellow-200/50">
              <span className="text-3xl filter drop-shadow-sm">📋</span>
            </div>
            <span className="service-label">طلباتي</span>
          </a>
          <a href="/results" className="premium-card service-card">
            <div className="sticker-icon bg-green-100 shadow-green-200/50">
              <span className="text-3xl filter drop-shadow-sm">📅</span>
            </div>
            <span className="service-label">مواعيدي</span>
          </a>
        </div>

        {/* ── Floating Metric Cards ── */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title">مؤشرات الصحة</h2>
          <span className="text-green-600 text-xs font-bold bg-green-100 px-2 py-1 rounded-full">تحديث الان</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="premium-card metric-card">
            <div className="metric-header">
              <span className="text-red-500 font-bold text-lg">78 bpm</span>
              <span className="text-sm text-gray-500 font-semibold">معدل القلب</span>
            </div>
            <div className="sticker-icon bg-red-50 shadow-red-100 self-end mt-2 animate-pulse-slow">
              <span className="text-4xl filter drop-shadow-md">❤️</span>
            </div>
          </div>

          <div className="premium-card metric-card">
            <div className="metric-header">
              <span className="text-yellow-600 font-bold text-lg">جيدة</span>
              <span className="text-sm text-gray-500 font-semibold">الحالة النفسية</span>
            </div>
            <div className="sticker-icon bg-yellow-50 shadow-yellow-100 self-end mt-2 hover:-translate-y-1 transition-transform">
              <span className="text-4xl filter drop-shadow-md">😊</span>
            </div>
          </div>
        </div>

        {/* ── Clean Input / CTA ── */}
        <a href="/requests" className="premium-btn w-full mb-3 shadow-lg shadow-green-600/30">
          <span className="text-white text-lg font-black">🚀 دخول البوابة الطبية</span>
        </a>
        <div className="premium-input-box">
           <span className="text-gray-400 font-semibold text-sm">أو ابحث عن طبيب، عيادة، دواء...</span>
        </div>
      </div>

      {/* ── iOS Style Bottom Nav ── */}
      <div className="premium-bottom-nav">
        <a href="/" className="nav-item active">
          <div className="nav-icon"><span className="text-2xl">🏠</span></div>
        </a>
        <a href="/requests" className="nav-item">
          <div className="nav-icon"><span className="text-2xl">💬</span></div>
        </a>
        <a href="/results" className="nav-item">
          <div className="nav-icon"><span className="text-2xl">💓</span></div>
        </a>
        <a href="/profile" className="nav-item">
          <div className="nav-icon"><span className="text-2xl">👤</span></div>
        </a>
      </div>
    </div>
  );
}
