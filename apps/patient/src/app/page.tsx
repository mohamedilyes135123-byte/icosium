import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Activity, UserRound, Calendar, Pill, FileBox, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen font-sans selection:bg-emerald-500/20 overflow-hidden relative">
      {/* Background Animated Blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden bg-slate-50/40">
        <div className="absolute top-[-10%] -left-[10%] w-[600px] h-[600px] bg-emerald-200/40 rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-pulse-soft"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-200/30 rounded-full mix-blend-multiply filter blur-[120px] opacity-60 animate-pulse-soft" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center bg-white/40 backdrop-blur-xl sticky top-0 z-50 border-b border-emerald-100/50 shadow-sm">
        <div className="flex items-center gap-3 text-emerald-600 font-extrabold text-2xl tracking-tighter">
          <div className="w-10 h-10 rounded-xl bg-white border border-emerald-100 shadow-md flex items-center justify-center transition-transform hover:scale-105">
            <img src="/logo.png" alt="عناية" className="w-8 h-8 object-contain" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-l from-emerald-600 to-teal-600">عناية للمرضى</span>
        </div>
        <div className="flex items-center gap-3 rtl:space-x-reverse">
          <Link href="/login">
             <Button variant="ghost" className="text-slate-700 hover:text-emerald-600 font-bold hover:bg-emerald-50/50 rounded-full px-5 transition-all">تسجيل الدخول</Button>
          </Link>
          <Link href="/login">
             <Button className="bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 text-white font-bold rounded-full shadow-lg shadow-emerald-500/20 px-6 hover:-translate-y-0.5 active:scale-95 transition-all">انضم إلينا</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-24 pb-32 relative z-10">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-emerald-100/50 text-emerald-800 text-sm font-bold border border-emerald-200/60 backdrop-blur-md shadow-sm transition-all hover:bg-emerald-100/70">
          <span>📱 تطبيق الهاتف الذكي للمرضى</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black max-w-4xl tracking-tight text-slate-900 leading-tight mb-8 mt-4">
          صحتك في جيبك <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-l from-emerald-600 to-teal-500 drop-shadow-sm">
            أينما كنت، وفي أي وقت
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mb-12 leading-relaxed font-medium">
          تابع حالتك الصحية، احجز مواعيدك، استشر طبيبك، واستلم وصفاتك الطبية مباشرة عبر تطبيق عناية.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/login">
            <Button size="lg" className="rounded-full shadow-xl shadow-emerald-600/25 hover:shadow-emerald-600/40 gap-2 text-lg font-bold px-10 py-7 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 hover:-translate-y-1 active:scale-95 transition-all duration-300">
               الدخول لملفي الطبي <UserRound className="w-5 h-5"/>
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <section className="w-full max-w-5xl mt-32 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            title="حجز المواعيد"
            description="احصل على موعد مع طبيبك المفضل بسهولة دون عناء الانتظار."
            icon={<Calendar className="w-8 h-8 text-emerald-500" />}
          />
          <FeatureCard 
            title="الوصفات الإلكترونية"
            description="استلم وصفاتك الطبية مباشرة واصرفها من الصيدلية الأقرب إليك بسلاسة."
            icon={<Pill className="w-8 h-8 text-emerald-500" />}
          />
          <FeatureCard 
            title="نتائج التحاليل"
            description="استعرض نتائج تحاليلك المخبرية فور صدورها بأمان وسرية تامة."
            icon={<FileBox className="w-8 h-8 text-emerald-500" />}
          />
        </section>
      </main>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string, description: string, icon: React.ReactNode }) {
  return (
    <div className="group h-full p-8 rounded-3xl transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-2 border border-white/60 bg-white/60 backdrop-blur-md text-center flex flex-col items-center">
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100/60 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-3 text-slate-800 group-hover:text-emerald-700 transition-colors">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed font-medium">{description}</p>
    </div>
  );
}
