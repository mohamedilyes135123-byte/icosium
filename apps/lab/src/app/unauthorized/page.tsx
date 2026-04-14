import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 rounded-[2.5rem] p-8 shadow-2xl border border-rose-500/30 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/20 blur-3xl rounded-full"></div>
        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
           <ShieldAlert className="w-10 h-10 text-rose-500" />
        </div>
        <h1 className="text-2xl font-black text-white mb-2 tracking-wide">الوصول مرفوض (403)</h1>
        <p className="text-slate-400 mb-8 font-medium">نظام RBAC الأمني يمنعك من استخدام هذه المنصة بناءً على هويتك الوظيفية.</p>
        
        <Link href="/login">
           <Button className="w-full bg-rose-600 hover:bg-rose-500 rounded-xl h-12 text-white font-bold shadow-lg shadow-rose-600/20 shadow-inner">العودة لتسجيل الدخول</Button>
        </Link>
      </div>
    </div>
  );
}
