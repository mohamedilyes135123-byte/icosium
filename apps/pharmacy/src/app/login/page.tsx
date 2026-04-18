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

    // --- QUICK DEBUG CREDENTIALS ---
    if (password === "1" && email === '1') {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: 'pharmacy@3inaya.com',
        password: '123456',
      });
      if (authError) {
         setError("Ù„Ù… ÙŠØªÙ… Ø±ÙØ¹ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª (Seed) Ø¥Ù„Ù‰ Ù‚ÙˆØ§Ø¹Ø¯ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø¨Ø¹Ø¯. Ø¬Ø±Ø¨ Ø¥Ø¯Ø®Ø§Ù„Ù‡Ø§.");
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
        setError("ÙØ´Ù„ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„. ØªØ£ÙƒØ¯ Ù…Ù† Ø§Ù„Ø¨Ø±ÙŠØ¯ ÙˆÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±.");
        setLoading(false);
        return;
      }

      const userRole = data?.user?.user_metadata?.role;
      if (userRole === role) {
        router.push(`/dashboard`);
      } else {
         setError("ÙŠØ±Ø¬Ù‰ Ø§Ù„ØªØ£ÙƒØ¯ Ù…Ù† Ø§Ù„Ø¯Ø®ÙˆÙ„ Ù…Ù† Ø§Ù„Ø¨ÙˆØ§Ø¨Ø© Ø§Ù„Ù…Ø®ØµØµØ© Ù„Ùƒ.");
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
      
      setSuccessMsg("ØªÙ… Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø­Ø³Ø§Ø¨ Ø¨Ù†Ø¬Ø§Ø­! ÙŠÙ…ÙƒÙ†Ùƒ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø§Ù„Ø¢Ù†.");
      setIsLogin(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-100/50 via-slate-50 to-white"></div>
      
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl border border-white relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-orange-500 to-amber-400 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-500/30 mb-4 element-glow">
             <Activity className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-800">{isLogin ? "Ø¨ÙˆØ§Ø¨Ø© Ø§Ù„ØµÙŠØ¯Ù„ÙŠØ§Øª" : "Ø·Ù„Ø¨ Ø§Ù†Ø¶Ù…Ø§Ù… ØµÙŠØ¯Ù„ÙŠØ©"}</h1>
          <p className="text-slate-500 text-sm mt-1">Ù†Ø¸Ø§Ù… ØµØ±Ù Ø§Ù„ÙˆØµÙØ§Øª Ø§Ù„Ù…Ø³ØªÙ‚Ù„</p>
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
                placeholder="Ø§Ø³Ù… Ø§Ù„ØµÙŠØ¯Ù„ÙŠØ©" 
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
              placeholder="Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ Ø£Ùˆ Ø§Ø³Ù… Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ù„Ù„Ø®Ø§Ø¯Ù…" 
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
              placeholder="ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±" 
              className="w-full h-12 pl-4 pr-12 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-left dir-ltr"
              required 
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl text-lg font-bold shadow-lg shadow-brand-500/20 mt-4">
            {loading ? "Ø¬Ø§Ø±ÙŠ Ø§Ù„Ù…Ø¹Ø§Ù„Ø¬Ø©..." : (isLogin ? "ØªØ£ÙƒÙŠØ¯ Ø§Ù„Ø¯Ø®ÙˆÙ„" : "Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø­Ø³Ø§Ø¨")}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => setIsLogin(!isLogin)} type="button" className="text-sm font-bold text-brand-600 hover:text-brand-500 transition-colors">
            {isLogin ? "Ù„ÙŠØ³ Ù„Ø¯ÙŠÙƒ Ø­Ø³Ø§Ø¨ØŸ Ø¥Ù†Ø´Ø§Ø¡ Ø­Ø³Ø§Ø¨ Ø¬Ø¯ÙŠØ¯" : "Ù„Ø¯ÙŠÙƒ Ø­Ø³Ø§Ø¨ Ø¨Ø§Ù„ÙØ¹Ù„ØŸ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„"}
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">Ø§Ù„ÙˆØµÙˆÙ„ Ù„Ù„Ù…Ù†ØµØ§Øª Ù…Ø­Ù…ÙŠ Ø¨ØªØ´ÙÙŠØ± Supabase AES-256</p>
      </div>
    </div>
  );
}
