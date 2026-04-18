import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Activity, ShieldCheck, Fingerprint, Lock } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center bg-white/70 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-2xl tracking-tighter">
          <Activity className="w-8 h-8 text-indigo-600" />
          <span>إدارة نظام عناية</span>
        </div>
        <div className="space-x-4 rtl:space-x-reverse">
          <Link href="/login">
             <Button variant="ghost" className="text-slate-600">الدخول كمسؤول</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-20 pb-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-white to-white opacity-80 h-[600px]"></div>
        
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full bg-indigo-50 text-indigo-800 text-sm font-medium border border-indigo-100 backdrop-blur-sm">
          <span>🛡️ البوابة الإدارية المركزية</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold max-w-4xl tracking-tight text-slate-900 leading-tight mb-6 mt-4">
          نافذتك لإدارة وضمان جودة <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-l from-slate-800 to-indigo-600">
            النظام الصحي الرقمي
          </span>
        </h1>
        
        <p className="text-lg text-slate-600 max-w-2xl mb-12">
          هذه المنصة مخصصة لمسؤولي نظام عناية لمراقبة الأداء، اعتماد الحسابات الطبية، وتدقيق العمليات الحية داخل المنصة (Audit Logs).
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/login">
            <Button size="lg" className="rounded-full shadow-lg gap-2 text-lg px-8 bg-slate-800 hover:bg-slate-900">
               دخول لوحة التحكم <ShieldCheck className="w-5 h-5"/>
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <section className="w-full max-w-5xl mt-32 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    <div className="glass h-full p-6 rounded-3xl transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border border-slate-100 bg-white/60 text-center flex flex-col items-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 shadow-sm border border-slate-200">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500">{description}</p>
    </div>

  )
}
