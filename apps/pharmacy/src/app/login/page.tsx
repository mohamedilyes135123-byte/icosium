"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Activity, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const role = "pharmacy";
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    // Map shortcut credentials
    let loginEmail = email;
    let loginPassword = password;
    if (password === "1" && email === "1") {
      loginEmail = "pharmacy@test.com";
      loginPassword = "123456";
    }

    if (isLogin) {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (authError) {
        setError(`فشل تسجيل الدخول: ${authError.message}`);
        setLoading(false);
        return;
      }

      // Login succeeded – go to dashboard
      window.location.href = `/dashboard`;
    } else {
      // Signup flow
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: loginEmail,
        password: loginPassword,
        options: {
          data: {
            full_name: fullName,
            role: role,
          }
        }
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      setSuccessMsg("تم إنشاء الحساب بنجاح! يمكنك تسجيل الدخول الآن.");
      setIsLogin(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" dir="rtl">
      {/* Animated Prominent Background */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-slate-50">
        <div className="absolute top-[-10%] -right-[10%] w-[800px] h-[800px] bg-teal-300 rounded-full mix-blend-multiply filter blur-[150px] opacity-70 animate-pulse-soft" />
        <div className="absolute bottom-[-10%] -left-[10%] w-[600px] h-[600px] bg-teal-400 rounded-full mix-blend-multiply filter blur-[150px] opacity-60 animate-pulse-soft" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]" />
      </div>

      {/* Glow keyframes */}
      <style>{`
        @keyframes logoFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes glowPulse { 0%, 100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 0.85; transform: scale(1.15); } }
        @keyframes glowColorShift { 0% { filter: hue-rotate(0deg); } 50% { filter: hue-rotate(40deg); } 100% { filter: hue-rotate(0deg); } }
        .logo-float { animation: logoFloat 4s ease-in-out infinite; }
        .glow-pulse { animation: glowPulse 3s ease-in-out infinite, glowColorShift 6s ease-in-out infinite; }
      `}</style>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl border border-white relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="inline-block relative mb-4">
            <div className="absolute inset-[-8px] z-0 glow-pulse rounded-3xl blur-xl bg-gradient-to-tr from-teal-400 via-teal-300 to-cyan-300 opacity-60" />
            <div className="w-28 h-28 rounded-2xl bg-white border border-teal-100 shadow-xl flex items-center justify-center relative z-10 logo-float">
              <img src="/logo.png" alt="عناية" className="w-24 h-24 object-contain drop-shadow-sm" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-slate-800">{isLogin ? "بوابة الصيدليات" : "طلب انضمام صيدلية"}</h1>
          <p className="text-slate-500 text-sm mt-1">نظام صرف الوصفات المستقل</p>
        </div>

        {successMsg && (
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl text-sm font-bold mb-6 text-center border border-emerald-100">
            {successMsg}
          </div>
        )}

        {error && (
          <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-sm font-bold mb-6 text-center border border-rose-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="اسم الصيدلية" 
                className="w-full h-12 px-4 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-right"
                required={!isLogin} 
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute right-4 top-3.5 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="البريد الإلكتروني أو اسم المستخدم للخادم" 
              className="w-full h-12 pl-4 pr-12 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-left dir-ltr"
              required 
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute right-4 top-3.5 w-5 h-5 text-slate-400" />
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="كلمة المرور" 
              className="w-full h-12 pl-4 pr-12 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-left dir-ltr"
              required 
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl text-lg font-bold shadow-[0_4px_16px_rgba(20,184,166,0.3)] mt-4 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 border-none text-white transition-all">
            {loading ? "جاري المعالجة..." : (isLogin ? "تأكيد الدخول" : "إنشاء الحساب")}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => setIsLogin(!isLogin)} type="button" className="text-sm font-bold text-teal-600 hover:text-teal-500 transition-colors">
            {isLogin ? "ليس لديك حساب؟ إنشاء حساب جديد" : "لديك حساب بالفعل؟ تسجيل الدخول"}
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">الوصول للمنصات محمي بتشفير Supabase AES-256</p>
      </div>
    </div>
  );
}
