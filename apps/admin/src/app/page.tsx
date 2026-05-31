import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Activity, ShieldCheck, Fingerprint, Lock } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen font-sans bg-slate-50 selection:bg-indigo-500/20 overflow-hidden relative">
      {/* Background Animated Blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden bg-slate-50/40">
        <div className="absolute top-[-10%] -left-[10%] w-[600px] h-[600px] bg-indigo-200/50 rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-pulse-soft"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-200/40 rounded-full mix-blend-multiply filter blur-[120px] opacity-60 animate-pulse-soft" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center bg-white/40 backdrop-blur-xl sticky top-0 z-50 border-b border-indigo-100/50 shadow-sm">
        <div className="flex items-center gap-3 text-indigo-700 font-extrabold text-2xl tracking-tighter">
          <div className="w-10 h-10 rounded-xl bg-white border border-indigo-100 shadow-md flex items-center justify-center transition-transform hover:scale-105">
            <Activity className="w-6 h-6 text-indigo-600" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-l from-indigo-700 to-violet-600">إدارة نظام عناية</span>
        </div>
        <div className="flex items-center gap-3 rtl:space-x-reverse">
          <Link href="/login">
             <Button variant="ghost" className="text-slate-700 hover:text-indigo-700 font-bold hover:bg-indigo-50/50 rounded-full px-5 transition-all">الرئيسية</Button>
          </Link>
          <Link href="/login">
             <Button className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-full shadow-lg shadow-indigo-500/20 px-6 hover:-translate-y-0.5 active:scale-95 transition-all">الدخول كمسؤول</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-24 pb-32 relative z-10">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-indigo-100/50 text-indigo-800 text-sm font-bold border border-indigo-200/60 backdrop-blur-md shadow-sm transition-all hover:bg-indigo-100/70">
          <span>🛡️ البوابة الإدارية المركزية</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black max-w-4xl tracking-tight text-slate-900 leading-tight mb-8 mt-4">
          نافذتك لإدارة وضمان جودة <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-l from-indigo-600 to-violet-500 drop-shadow-sm">
            النظام الصحي الرقمي
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mb-12 leading-relaxed font-medium">
          هذه المنصة مخصصة لمسؤولي نظام عناية لمراقبة الأداء، اعتماد الحسابات الطبية، وتدقيق العمليات الحية داخل المنصة (Audit Logs).
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/login">
            <Button size="lg" className="rounded-full shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/40 gap-2 text-lg font-bold px-10 py-7 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 hover:-translate-y-1 active:scale-95 transition-all duration-300 text-white">
               دخول لوحة التحكم <ShieldCheck className="w-5 h-5"/>
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <section className="w-full max-w-5xl mt-32 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            title="اعتماد الحسابات"
            description="التحقق من هويات المهنيين والأطباء لاعتمادهم بالموافقة للعمل على التطبيقات."
            icon={<Fingerprint className="w-8 h-8 text-indigo-600" />}
          />
          <FeatureCard 
            title="مراقبة العمليات (Audit)"
            description="تتبع جميع العمليات التي تحدث عبر المنصة بشكل مفصل وحفظ سجل تاريخي شفاف."
            icon={<Activity className="w-8 h-8 text-indigo-600" />}
          />
          <FeatureCard 
            title="إدارة الصلاحيات (RBAC)"
            description="التحكم الكامل والآمن في الصلاحيات لضمان أمن النظام الطبي وحفظ السرية."
            icon={<Lock className="w-8 h-8 text-indigo-600" />}
          />
        </section>
      </main>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string, description: string, icon: React.ReactNode }) {
  return (
    <div className="group h-full p-8 rounded-3xl transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 border border-white/60 bg-white/60 backdrop-blur-md text-center flex flex-col items-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100/60 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-3 text-slate-800 group-hover:text-indigo-700 transition-colors">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed font-medium">{description}</p>
    </div>
  );
}
