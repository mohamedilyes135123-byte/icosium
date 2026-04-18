import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Activity, FlaskConical, FileCheck, Search } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center bg-white/70 backdrop-blur-md sticky top-0 z-50 border-b border-cyan-100">
        <div className="flex items-center gap-2 text-cyan-600 font-bold text-2xl tracking-tighter">
          <Activity className="w-8 h-8 text-cyan-500" />
          <span>منصة عناية للمخابر</span>
        </div>
        <div className="space-x-4 rtl:space-x-reverse">
          <Link href="/login">
             <Button variant="ghost">دخول المخبر</Button>
          </Link>
          <Link href="/login">
             <Button className="bg-cyan-600 hover:bg-cyan-700">تسجيل مخبر جديد</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-20 pb-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-50 via-slate-50 to-white opacity-80 h-[600px]"></div>
        
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full bg-cyan-100/50 text-cyan-800 text-sm font-medium border border-cyan-200 backdrop-blur-sm">
          <span>🔬 منصة إدارة التحاليل المخبرية للمنظومة الصحية</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold max-w-4xl tracking-tight text-slate-900 leading-tight mb-6 mt-4">
          اربط مخبرك بشبكة الأطباء <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-l from-cyan-600 to-sky-400">
            بسرعة و أمان
          </span>
        </h1>
        
        <p className="text-lg text-slate-600 max-w-2xl mb-12">
          من خلال منصة عناية للمخابر يمكنك استقبال طلبات التحاليل من الأطباء مباشرة، وإرسال النتائج بشكل آمن وسري للملف الطبي الخاص بالمريض.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/login">
            <Button size="lg" className="rounded-full shadow-lg gap-2 text-lg px-8 bg-cyan-600 hover:bg-cyan-700">
               دخول بوابة المخابر <FlaskConical className="w-5 h-5"/>
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <section className="w-full max-w-5xl mt-32 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard 
            title="استقبال الطلبات"
            description="استقبل طلبات التحليل الموجهة لمخبرك مباشرة من أطباء الشبكة المعتمدين."
            icon={<Search className="w-8 h-8 text-cyan-500" />}
          />
          <FeatureCard 
            title="إرسال النتائج"
            description="ارفع نتائج التحاليل بسرية لتصل لحظياً لملف المريض وطبيبه المعالج."
            icon={<FileCheck className="w-8 h-8 text-cyan-500" />}
          />
          <FeatureCard 
            title="نظام التشفير (E2E)"
            description="جميع البيانات الحساسة مدعومة بتشفير لحفظ سرية المريض."
            icon={<FlaskConical className="w-8 h-8 text-cyan-500" />}
          />
        </section>
      </main>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string, description: string, icon: React.ReactNode }) {
  return (
    <div className="glass h-full p-6 rounded-3xl transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border border-slate-100 bg-white/60 text-center flex flex-col items-center">
      <div className="w-16 h-16 rounded-2xl bg-cyan-50 flex items-center justify-center mb-6 shadow-sm border border-cyan-100">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
  )
}
