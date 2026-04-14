"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FlaskConical, CheckCircle2, Clock, UploadCloud, TestTube2 } from "lucide-react";
import { motion } from "framer-motion";

export default function LabDashboard() {
  return (
    <div className="pb-32 w-full">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex justify-between items-end border-b border-cyan-100/50 pb-6"
      >
        <div>
          <h1 className="text-4xl font-extrabold text-slate-800 mb-2 tracking-tight">مخبر التحاليل الطبية المركزية</h1>
          <p className="text-slate-500 text-lg">لديك <span className="text-cyan-600 font-bold">12 طلباً</span> بانتظار سحب العينات وتحليلها.</p>
        </div>
        <div className="flex gap-4">
           <Button className="gap-2 bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 shadow-[0_4px_20px_rgba(6,182,212,0.3)] border border-cyan-400/50 rounded-xl h-12 px-6 text-white font-bold transition-all hover:scale-105">
              <TestTube2 className="w-5 h-5"/> استلام عينة جديدة بالباركود
           </Button>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.2 }}
        >
          <Card className="shadow-xl shadow-cyan-500/5 border-white h-[650px] flex flex-col bg-white/60 backdrop-blur-2xl rounded-3xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-100/50 mix-blend-multiply blur-3xl rounded-full"></div>
            <CardHeader className="bg-white/50 border-b border-amber-50 relative z-10">
              <CardTitle className="text-amber-600 flex items-center gap-2 text-xl font-bold">
                <Clock className="w-6 h-6"/>
                مرضى بانتظار سحب الدم (12)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 flex-1 overflow-y-auto space-y-5 relative z-10 p-6">
              
              {/* Lab Request mock */}
              <div className="bg-white border border-amber-100 rounded-2xl p-6 hover:border-amber-300 hover:shadow-md transition-all group/item shadow-sm">
                <div className="flex justify-between items-start mb-5 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-xl text-slate-800">أحمد بن علي</h3>
                    <p className="text-sm text-slate-500 font-bold mt-1">المحيل: د. يوسف خليل (طبيب عام)</p>
                  </div>
                  <span className="bg-amber-50 border border-amber-200 text-amber-600 px-3 py-1.5 rounded-lg text-xs font-black shadow-sm">في الانتظار (صالة 1)</span>
                </div>
                
                <div className="bg-slate-50 rounded-xl p-4 space-y-3 mb-6 border border-slate-100 font-mono shadow-inner">
                   <div className="flex justify-between items-end text-sm">
                     <span className="font-bold text-slate-800 text-base">FNS (صيغة الدم الكاملة)</span>
                     <span className="text-slate-500 font-sans">أنبوب بنفسجي (EDTA)</span>
                   </div>
                   <div className="flex justify-between items-end text-sm border-t border-slate-200 pt-3">
                     <span className="font-bold text-slate-800 text-base">Glycémie à jeun</span>
                     <span className="text-rose-500 font-bold font-sans">التحقق من الصيام (مهم)</span>
                   </div>
                </div>

                <div className="flex gap-3">
                   <Button className="flex-1 bg-amber-500 hover:bg-amber-400 text-white font-bold h-12 rounded-xl border border-amber-500 shadow-md shadow-amber-500/20">
                     تأكيد سحب العينة (بدء التحليل)
                   </Button>
                </div>
              </div>

            </CardContent>
          </Card>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.3 }}
        >
          <Card className="shadow-xl shadow-cyan-500/5 h-[650px] flex flex-col bg-white/60 backdrop-blur-2xl rounded-3xl border-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-100/50 mix-blend-multiply blur-3xl rounded-full"></div>
            <CardHeader className="bg-white/50 border-b border-cyan-50 relative z-10">
              <CardTitle className="flex items-center gap-2 text-cyan-600 text-xl font-bold">
                <FlaskConical className="w-6 h-6"/>
                تحاليل قيد المعالجة وجاهزة للإصدار
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 flex-1 overflow-y-auto space-y-4 relative z-10 p-6">
              
              <div className="bg-white border border-cyan-100 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-5 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-xl text-slate-800">سميرة خ.</h3>
                    <p className="text-sm text-slate-500 mt-1 font-bold">نوع العينة: دم + بول</p>
                  </div>
                  <span className="bg-cyan-50 border border-cyan-200 text-cyan-700 px-3 py-1.5 rounded-lg text-xs font-black shadow-sm">اكتمل التحليل</span>
                </div>
                <div className="flex bg-cyan-50 rounded-xl p-4 gap-4 items-center mb-5 border border-cyan-100 border-dashed">
                   <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-cyan-500 shadow-sm"><UploadCloud className="w-6 h-6"/></div>
                   <div>
                     <p className="text-sm font-bold text-slate-800 mb-1">رفع وتشفير النتائج للطبيب</p>
                     <p className="text-xs text-slate-500">سيتم ربط النتائج بملف المريض بشكل آمن ولا يراها غيره وطبيبه.</p>
                   </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 h-12 rounded-xl text-white font-bold border border-emerald-500 shadow-md shadow-emerald-500/20">التوقيع الإلكتروني والإرسال للفحص</Button>
              </div>

            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
