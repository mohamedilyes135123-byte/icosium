import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Activity, Stethoscope, Users, Pill, TestTube } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center bg-white/70 backdrop-blur-md sticky top-0 z-50 border-b border-blue-100">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-2xl tracking-tighter">
          <Activity className="w-8 h-8 text-blue-500" />
          <span>عناية للأطباء</span>
        </div>
        <div className="space-x-4 rtl:space-x-reverse">
          <Link href="/login">
             <Button variant="ghost">دخول الطبيب</Button>
          </Link>
          <Link href="/login">
             <Button className="bg-blue-600 hover:bg-blue-700">التسجيل كطبيب</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-20 pb-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-slate-50 to-white opacity-80 h-[600px]"></div>
        
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full bg-blue-100/50 text-blue-800 text-sm font-medium border border-blue-200 backdrop-blur-sm">
          <span>💻 منصة وتطبيق الأطباء المتكامل</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold max-w-4xl tracking-tight text-slate-900 leading-tight mb-6 mt-4">
          أدر عيادتك ومرضاك <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-l from-blue-600 to-cyan-400">
            بكل احترافية وأمان
          </span>
        </h1>
        
        <p className="text-lg text-slate-600 max-w-2xl mb-12">
          منصة عناية للأطباء توفر لك كل ما تحتاجه لإدارة مواعيدك، كتابة الوصفات الإلكترونية، الاطلاع على تحاليل مرضاك وتقديم استشارات عن بعد.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/login">
            <Button size="lg" className="rounded-full shadow-lg gap-2 text-lg px-8 bg-blue-600 hover:bg-blue-700">
               دخول العيادة الرقمية <Stethoscope className="w-5 h-5"/>
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <section className="w-full max-w-5xl mt-32 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard 
            title="إدارة المرضى"
            description="الوصول السريع للملفات الطبية والتاريخ الصحي الكامل."
            icon={<Users className="w-8 h-8 text-blue-500" />}
          />
          <FeatureCard 
            title="الوصفات الطبية"
            description="إصدار وصفات إلكترونية آمنة ترسل مباشرة للصيدلية."
            icon={<Pill className="w-8 h-8 text-blue-500" />}
          />
          <FeatureCard 
            title="التحاليل المخبرية"
            description="طلب النتائج واستقبالها بشفافية وسرعة من المخابر."
            icon={<TestTube className="w-8 h-8 text-blue-500" />}
          />
          <FeatureCard 
            title="استشارات عن بعد"
            description="تقديم رعاية طبية مستمرة عبر نظام محادثات مدعوم بالذكاء الاصطناعي."
            icon={<Stethoscope className="w-8 h-8 text-blue-500" />}
          />
        </section>
      </main>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string, description: string, icon: React.ReactNode }) {
  return (
    <div className="glass h-full p-6 rounded-3xl transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border border-slate-100 bg-white/60 text-center flex flex-col items-center">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 shadow-sm border border-blue-100">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
  )
}
