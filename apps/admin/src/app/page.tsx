import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { CopyPlus, Activity, UserRound, Pill, Stethoscope, FlaskConical } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center bg-white/70 backdrop-blur-md sticky top-0 z-50 border-b border-emerald-100">
        <div className="flex items-center gap-2 text-brand-600 font-bold text-2xl tracking-tighter">
          <Activity className="w-8 h-8 text-brand-500" />
          <span>منصة عناية</span>
        </div>
        <div className="space-x-4 rtl:space-x-reverse">
          <Link href="/login">
             <Button variant="ghost">تسجيل الدخول</Button>
          </Link>
          <Link href="/login">
             <Button>انضم إلينا</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-20 pb-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-50 via-slate-50 to-white opacity-80 h-[600px]"></div>
        
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full bg-teal-100/50 text-teal-800 text-sm font-medium border border-teal-200 backdrop-blur-sm">
          <span>🚀 النظام الصحي الرقمي الأول في الجزائر</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold max-w-4xl tracking-tight text-slate-900 leading-tight mb-6 mt-4">
          صحتك، وطبيبك، وصيدليتك <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-l from-brand-600 to-teal-400">
            في مكان واحد متكامل
          </span>
        </h1>
        
        <p className="text-lg text-slate-600 max-w-2xl mb-12">
          منصة عناية تربط بين المرضى، الأطباء، والمرافق الصحية في بيئة آمنة ومدعومة بالذكاء الاصطناعي لتقديم أفضل رعاية صحية لك ولعائلتك.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/login">
            <Button size="lg" className="rounded-full shadow-lg gap-2 text-lg px-8">
               سجل الآن <UserRound className="w-5 h-5"/>
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="rounded-full gap-2 text-lg px-8 bg-white/50 backdrop-blur-sm border-teal-200">
               دخول المهنيين <Stethoscope className="w-5 h-5"/>
            </Button>
          </Link>
        </div>

        {/* Portals Grid */}
        <section className="w-full max-w-7xl mt-32 grid md:grid-cols-2 lg:grid-cols-5 gap-6">
          <PortalCard 
            title="بوابة المرضى"
            description="حجز مواعيد، طلب استشارات، ملف طبي إلكتروني"
            icon={<UserRound className="w-10 h-10 text-teal-500" />}
            href="/patient/dashboard"
          />
          <PortalCard 
            title="بوابة الأطباء"
            description="إدارة العيادة، وصفات طبية إلكترونية، طلب تحاليل"
            icon={<Stethoscope className="w-10 h-10 text-blue-500" />}
            href="/doctor/dashboard"
          />
          <PortalCard 
            title="بوابة الصيدليات"
            description="استقبال وصفات، تجهيز طلبات الدواء"
            icon={<Pill className="w-10 h-10 text-green-500" />}
            href="/pharmacy/dashboard"
          />
          <PortalCard 
            title="مخبر التحاليل"
            description="استقبال العينات وإرسال نتائج التحليل المشفرة"
            icon={<FlaskConical className="w-10 h-10 text-cyan-500" />}
            href="/lab/dashboard"
          />
          <PortalCard 
            title="الإدارة المركزية"
            description="مراقبة النظام وإدارة المستخدمين بسجلات تدقيق كاملة"
            icon={<CopyPlus className="w-10 h-10 text-red-500" />}
            href="/admin/dashboard"
          />
        </section>
      </main>
    </div>
  );
}

function PortalCard({ title, description, icon, href }: { title: string, description: string, icon: React.ReactNode, href: string }) {
  return (
    <Link href={href} className="group block">
      <div className="glass h-full p-8 rounded-3xl transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border border-slate-100 hover:border-brand-200 bg-white/60">
        <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-slate-100 element-glow">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-3 text-slate-800">{title}</h3>
        <p className="text-slate-500">{description}</p>
      </div>
    </Link>
  )
}
