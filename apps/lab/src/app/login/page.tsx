"use client";

export const dynamic = 'force-dynamic';


import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Activity, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const role = "lab";
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
        email: 'lab@3inaya.com',
        password: '123456',
      });
      if (authError) {
         setError("┘ä┘à ┘è╪¬┘à ╪▒┘ü╪╣ ╪º┘ä╪¿┘è╪º┘å╪º╪¬ (Seed) ╪Ñ┘ä┘ë ┘é┘ê╪º╪╣╪» ╪º┘ä╪¿┘è╪º┘å╪º╪¬ ╪¿╪╣╪». ╪¼╪▒╪¿ ╪Ñ╪»╪«╪º┘ä┘ç╪º.");
         setLoading(false);
         return;
      }
      document.cookie = `testing_bypass=lab; path=/; max-age=86400`;
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
        setError("┘ü╪┤┘ä ╪¬╪│╪¼┘è┘ä ╪º┘ä╪»╪«┘ê┘ä. ╪¬╪ú┘â╪» ┘à┘å ╪º┘ä╪¿╪▒┘è╪» ┘ê┘â┘ä┘à╪⌐ ╪º┘ä┘à╪▒┘ê╪▒.");
        setLoading(false);
        return;
      }

      const userRole = data?.user?.user_metadata?.role;
      if (userRole === role) {
        router.push(`/dashboard`);
      } else {
         setError("┘è╪▒╪¼┘ë ╪º┘ä╪¬╪ú┘â╪» ┘à┘å ╪º┘ä╪»╪«┘ê┘ä ┘à┘å ╪º┘ä╪¿┘ê╪º╪¿╪⌐ ╪º┘ä┘à╪«╪╡╪╡╪⌐ ┘ä┘â.");
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
      
      setSuccessMsg("╪¬┘à ╪Ñ┘å╪┤╪º╪í ╪º┘ä╪¡╪│╪º╪¿ ╪¿┘å╪¼╪º╪¡! ┘è┘à┘â┘å┘â ╪¬╪│╪¼┘è┘ä ╪º┘ä╪»╪«┘ê┘ä ╪º┘ä╪ó┘å.");
      setIsLogin(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-100/50 via-slate-50 to-white"></div>
      
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl border border-white relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-purple-500 to-pink-400 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-purple-500/30 mb-4 element-glow">
             <Activity className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-800">{isLogin ? "╪¿┘ê╪º╪¿╪⌐ ╪º┘ä┘à╪«╪¬╪¿╪▒╪º╪¬" : "╪╖┘ä╪¿ ╪º┘å╪╢┘à╪º┘à ┘à╪«╪¬╪¿╪▒"}</h1>
          <p className="text-slate-500 text-sm mt-1">┘å╪╕╪º┘à ╪Ñ╪»╪º╪▒╪⌐ ╪º┘ä╪¬╪¡╪º┘ä┘è┘ä ╪º┘ä┘à╪│╪¬┘é┘ä</p>
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
                placeholder="╪º┘ä╪º╪│┘à ╪º┘ä┘â╪º┘à┘ä" 
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
              placeholder="╪º┘ä╪¿╪▒┘è╪» ╪º┘ä╪Ñ┘ä┘â╪¬╪▒┘ê┘å┘è ╪ú┘ê ╪º╪│┘à ╪º┘ä┘à╪│╪¬╪«╪»┘à ┘ä┘ä╪«╪º╪»┘à" 
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
              placeholder="┘â┘ä┘à╪⌐ ╪º┘ä┘à╪▒┘ê╪▒" 
              className="w-full h-12 pl-4 pr-12 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-left dir-ltr"
              required 
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl text-lg font-bold shadow-lg shadow-brand-500/20 mt-4">
            {loading ? "╪¼╪º╪▒┘è ╪º┘ä┘à╪╣╪º┘ä╪¼╪⌐..." : (isLogin ? "╪¬╪ú┘â┘è╪» ╪º┘ä╪»╪«┘ê┘ä" : "╪Ñ┘å╪┤╪º╪í ╪º┘ä╪¡╪│╪º╪¿")}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => setIsLogin(!isLogin)} type="button" className="text-sm font-bold text-brand-600 hover:text-brand-500 transition-colors">
            {isLogin ? "┘ä┘è╪│ ┘ä╪»┘è┘â ╪¡╪│╪º╪¿╪ƒ ╪Ñ┘å╪┤╪º╪í ╪¡╪│╪º╪¿ ╪¼╪»┘è╪»" : "┘ä╪»┘è┘â ╪¡╪│╪º╪¿ ╪¿╪º┘ä┘ü╪╣┘ä╪ƒ ╪¬╪│╪¼┘è┘ä ╪º┘ä╪»╪«┘ê┘ä"}
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">╪º┘ä┘ê╪╡┘ê┘ä ┘ä┘ä┘à┘å╪╡╪º╪¬ ┘à╪¡┘à┘è ╪¿╪¬╪┤┘ü┘è╪▒ Supabase AES-256</p>
      </div>
    </div>
  );
}
