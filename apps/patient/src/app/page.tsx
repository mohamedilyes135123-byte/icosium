import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Activity, UserRound, Calendar, Pill, FileBox } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center bg-white/70 backdrop-blur-md sticky top-0 z-50 border-b border-emerald-100">
        <div className="flex items-center gap-2 text-brand-600 font-bold text-2xl tracking-tighter">
          <div className="w-10 h-10 rounded-xl bg-white border border-emerald-100 shadow-sm flex items-center justify-center">
            <img src="/logo.png" alt="عناية" className="w-8 h-8 object-contain" />
          </div>
          <span>عناية للمرضى</span>
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
          <span>📱 تطبيق الهاتف الذكي للمرضى</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold max-w-4xl tracking-tight text-slate-900 leading-tight mb-6 mt-4">
          صحتك في جيبك <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-l from-brand-600 to-teal-400">
            أينما كنت، وفي أي وقت
          </span>
        </h1>
        
        <p className="text-lg text-slate-600 max-w-2xl mb-12">
          تابع حالتك الصحية، احجز مواعيدك، استشر طبيبك، واستلم وصفاتك الطبية مباشرة عبر تطبيق عناية.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/login">
            <Button size="lg" className="rounded-full shadow-lg gap-2 text-lg px-8">
               الدخول لملفي الطبي <UserRound className="w-5 h-5"/>
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <section className="w-full max-w-5xl mt-32 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard 
            title="حجز المواعيد"
            description="احصل على موعد مع طبيبك المفضل بسهولة."
            icon={<Calendar className="w-8 h-8 text-brand-500" />}
          />
          <FeatureCard 
            title="الوصفات الإلكترونية"
            description="استلم وصفاتك الطبية مباشرة واصرفها من الصيدلية."
            icon={<Pill className="w-8 h-8 text-brand-500" />}
          />
          <FeatureCard 
            title="نتائج التحاليل"
            description="استعرض نتائج تحاليلك المخبرية بأمان وسرية تامة."
            icon={<FileBox className="w-8 h-8 text-brand-500" />}
          />
        </section>
      </main>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string, description: string, icon: React.ReactNode }) {
  return (
    <div className="glass h-full p-8 rounded-3xl transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border border-slate-100 bg-white/60 text-center flex flex-col items-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 shadow-sm border border-slate-100">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-slate-800">{title}</h3>
      <p className="text-slate-500">{description}</p>
    </div>
  )
}
