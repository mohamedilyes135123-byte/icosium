"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Activity, Mail, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

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
    if (userRole === "admin") {
      router.push("/dashboard");
    } else {
      setError("هذه البوابة مخصصة لمسؤولي النظام فقط.");
      await supabase.auth.signOut();
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden" dir="rtl">
      {/* Background */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950 to-black" />
      <div className="absolute top-[-10%] -right-[10%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] bg-indigo-600/30 rounded-full blur-[150px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] -left-[10%] w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] bg-violet-600/30 rounded-full blur-[150px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Fix browser autofill: force white bg + black text */}
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0px 1000px #ffffff inset !important;
          -webkit-text-fill-color: #111111 !important;
          caret-color: #111111;
        }
      `}</style>

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/10 relative z-10">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center text-white shadow-[0_0_24px_rgba(99,102,241,0.5)] mb-4">
            <Activity className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white">مركز إدارة النظام</h1>
          <p className="text-indigo-300/70 text-sm mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            الولوج مقتصر على مسؤولي الدعم فقط
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-rose-500/10 text-rose-300 p-3 rounded-xl text-sm font-bold mb-6 text-center border border-rose-500/30">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div className="relative">
            <Mail className="absolute right-4 top-3.5 w-5 h-5 text-gray-500 pointer-events-none z-10" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@test.com"
              autoComplete="email"
              className="w-full h-12 pl-4 pr-12 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900 placeholder:text-gray-400 text-sm font-medium"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute right-4 top-3.5 w-5 h-5 text-gray-500 pointer-events-none z-10" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="كلمة المرور"
              autoComplete="current-password"
              className="w-full h-12 pl-4 pr-12 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900 placeholder:text-gray-400 text-sm font-medium"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl text-base font-bold mt-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 border-none text-white transition-all shadow-[0_4px_20px_rgba(79,70,229,0.4)]"
          >
            {loading ? "جاري التحقق..." : "دخول لوحة الإدارة →"}
          </Button>
        </form>

        <p className="text-center text-xs text-slate-600 mt-8">
          الوصول للمنصات محمي بتشفير Supabase AES-256
        </p>
      </div>
    </div>
  );
}
