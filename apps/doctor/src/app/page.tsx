import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Activity, Stethoscope, Users, Pill, TestTube } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen font-sans selection:bg-blue-500/20 overflow-hidden relative">
      {/* Background Animated Blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden bg-slate-50/40">
        <div className="absolute top-[-10%] -left-[10%] w-[600px] h-[600px] bg-blue-200/40 rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-pulse-soft"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-200/30 rounded-full mix-blend-multiply filter blur-[120px] opacity-60 animate-pulse-soft" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center bg-white/40 backdrop-blur-xl sticky top-0 z-50 border-b border-blue-100/50 shadow-sm">
        <div className="flex items-center gap-3 text-blue-600 font-extrabold text-2xl tracking-tighter">
          <div className="w-10 h-10 rounded-xl bg-white border border-blue-100 shadow-md flex items-center justify-center transition-transform hover:scale-105">
            <Activity className="w-6 h-6 text-blue-500" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-l from-blue-600 to-indigo-600">عناية للأطباء</span>
        </div>
        <div className="flex items-center gap-3 rtl:space-x-reverse">
          <Link href="/login">
             <Button variant="ghost" className="text-slate-700 hover:text-blue-600 font-bold hover:bg-blue-50/50 rounded-full px-5 transition-all">دخول الطبيب</Button>
          </Link>
          <Link href="/login">
             <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-full shadow-lg shadow-blue-500/20 px-6 hover:-translate-y-0.5 active:scale-95 transition-all">التسجيل كطبيب</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-24 pb-32 relative z-10">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-blue-100/50 text-blue-800 text-sm font-bold border border-blue-200/60 backdrop-blur-md shadow-sm transition-all hover:bg-blue-100/70">
          <span>💻 منصة وتطبيق الأطباء المتكامل</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black max-w-4xl tracking-tight text-slate-900 leading-tight mb-8 mt-4">
          أدر عيادتك ومرضاك <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-l from-blue-600 to-indigo-500 drop-shadow-sm">
            بكل احترافية وأمان
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mb-12 leading-relaxed font-medium">
          منصة عناية للأطباء توفر لك كل ما تحتاجه لإدارة مواعيدك، كتابة الوصفات الإلكترونية، الاطلاع على تحاليل مرضاك وتقديم استشارات عن بعد.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/login">
            <Button size="lg" className="rounded-full shadow-xl shadow-blue-600/25 hover:shadow-blue-600/40 gap-2 text-lg font-bold px-10 py-7 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:-translate-y-1 active:scale-95 transition-all duration-300">
               دخول العيادة الرقمية <Stethoscope className="w-5 h-5"/>
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <section className="w-full max-w-5xl mt-32 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard 
            title="إدارة المرضى"
            description="الوصول السريع للملفات الطبية والتاريخ الصحي الكامل لمرضاك."
            icon={<Users className="w-8 h-8 text-blue-500" />}
          />
          <FeatureCard 
            title="الوصفات الطبية"
            description="إصدار وصفات إلكترونية آمنة ترسل مباشرة للصيدليات لتجنب الأخطاء."
            icon={<Pill className="w-8 h-8 text-blue-500" />}
          />
          <FeatureCard 
            title="التحاليل المخبرية"
            description="طلب النتائج واستقبالها بشفافية وسرعة من المخابر المعتمدة."
            icon={<TestTube className="w-8 h-8 text-blue-500" />}
          />
          <FeatureCard 
            title="استشارات عن بعد"
            description="تقديم رعاية طبية مستمرة لمرضاك أينما كانوا بكل سهولة."
            icon={<Stethoscope className="w-8 h-8 text-blue-500" />}
          />
        </section>
      </main>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string, description: string, icon: React.ReactNode }) {
  return (
    <div className="group h-full p-6 rounded-3xl transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 border border-white/60 bg-white/60 backdrop-blur-md text-center flex flex-col items-center">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100/60 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-slate-800 group-hover:text-blue-700 transition-colors">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed font-medium">{description}</p>
    </div>
  );
}
