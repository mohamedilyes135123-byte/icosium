"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Mail, Lock } from "lucide-react";
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

    // --- QUICK DEBUG CREDENTIALS ---
    if (password === "1" && email === '1') {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: 'pharmacy@3inaya.com',
        password: '123456',
      });
      if (authError) {
         setError("لم يتم رفع البيانات (Seed) إلى قواعد البيانات بعد. جرب إدخالها.");
         setLoading(false);
         return;
      }
      document.cookie = `testing_bypass=pharmacy; path=/; max-age=86400`;
      window.location.href = `/dashboard`;
      return;
    }
    // -------------------------------
    
    if (isLogin) {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError("فشل تسجيل الدخول. تأكد من البريد وكلمة المرور.");
        setLoading(false);
        return;
      }

      const userRole = data?.user?.user_metadata?.role;
      if (userRole === role) {
        router.push(`/dashboard`);
      } else {
         setError("يرجى التأكد من الدخول من البوابة المخصصة لك.");
         setLoading(false);
      }
    } else {
      // Signup flow
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-teal-200/40 rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-cyan-200/30 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-teal-50/30 to-white" />
      </div>
      
      {/* Glow keyframes */}
      <style>{`
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.15); }
        }
        @keyframes glowColorShift {
          0% { filter: hue-rotate(0deg); }
          50% { filter: hue-rotate(40deg); }
          100% { filter: hue-rotate(0deg); }
        }
        .logo-float { animation: logoFloat 4s ease-in-out infinite; }
        .glow-pulse { animation: glowPulse 3s ease-in-out infinite, glowColorShift 6s ease-in-out infinite; }
      `}</style>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl border border-white relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="absolute inset-[-8px] z-0 glow-pulse rounded-3xl blur-xl bg-gradient-to-tr from-teal-400 via-cyan-400 to-emerald-300 opacity-60" />
            <div className="w-28 h-28 rounded-2xl bg-white border border-amber-100 shadow-xl flex items-center justify-center relative z-10 logo-float">
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

          <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl text-lg font-bold shadow-lg shadow-brand-500/20 mt-4">
            {loading ? "جاري المعالجة..." : (isLogin ? "تأكيد الدخول" : "إنشاء الحساب")}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => setIsLogin(!isLogin)} type="button" className="text-sm font-bold text-brand-600 hover:text-brand-500 transition-colors">
            {isLogin ? "ليس لديك حساب؟ إنشاء حساب جديد" : "لديك حساب بالفعل؟ تسجيل الدخول"}
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">الوصول للمنصات محمي بتشفير Supabase AES-256</p>
      </div>
    </div>
  );
}
