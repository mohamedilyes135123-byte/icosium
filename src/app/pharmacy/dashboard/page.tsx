"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pill, CheckCircle2, Clock, AlertTriangle, ScanLine } from "lucide-react";
import { motion } from "framer-motion";

export default function PharmacyDashboard() {
  return (
    <div className="pb-32 w-full">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex justify-between items-end border-b border-purple-100/50 pb-6"
      >
        <div>
          <h1 className="text-4xl font-extrabold text-slate-800 mb-2 tracking-tight">صيدلية النور</h1>
          <p className="text-slate-500 text-lg">لديك <span className="text-purple-600 font-bold">3 وصفات</span> طبية جديدة بانتظار التجهيز.</p>
        </div>
        <div className="flex gap-4">
           <Button className="gap-2 bg-gradient-to-r from-purple-600 to-fuchsia-500 hover:from-purple-500 hover:to-fuchsia-400 shadow-[0_4px_20px_rgba(168,85,247,0.3)] border border-purple-400/50 rounded-xl h-12 px-6 text-white font-bold transition-all hover:scale-105">
              <ScanLine className="w-5 h-5"/> مسح QR كود الوصفة
           </Button>
        </div>
      </motion.header>

      {/* RBAC Rule Display for Demo */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-rose-50/80 border border-rose-200 rounded-2xl p-4 mb-8 flex items-start gap-4 shadow-sm backdrop-blur-md"
      >
        <div className="bg-white p-2 rounded-full text-rose-500 mt-1 border border-rose-100 shadow-sm">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
           <h4 className="font-bold text-rose-900 text-lg">صلاحيات النظام الصارمة (RBAC: Pharmacy Level)</h4>
           <div className="text-sm text-slate-600 mt-1.5 flex flex-wrap gap-5">
              <span className="flex items-center gap-1.5 font-semibold text-emerald-600"><CheckCircle2 className="w-4 h-4"/> قراءة الوصفات المرسلة والتأكيد</span>
              <span className="flex items-center gap-1.5 text-rose-600 font-bold"><AlertTriangle className="w-4 h-4"/> يمنع النظام تقنياً أي محاولة لتعديل محتوى الوصفة</span>
           </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.2 }}
        >
          <Card className="shadow-xl shadow-purple-500/5 border-white h-[650px] flex flex-col bg-white/60 backdrop-blur-2xl rounded-3xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-100/50 mix-blend-multiply blur-3xl rounded-full"></div>
            <CardHeader className="bg-white/50 border-b border-amber-50 relative z-10">
              <CardTitle className="text-amber-600 flex items-center gap-2 text-xl font-bold">
                <Clock className="w-6 h-6"/>
                وصفات بانتظار التجهيز (3)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 flex-1 overflow-y-auto space-y-5 relative z-10 p-6">
              
              {/* Prescription mock */}
              <div className="bg-white border border-amber-100 rounded-2xl p-6 hover:border-amber-300 hover:shadow-md transition-all group/item shadow-sm">
                <div className="flex justify-between items-start mb-5 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-xl text-slate-800">أحمد بن علي</h3>
                    <p className="text-sm text-slate-500 font-bold mt-1">طبيب معالج: د. يوسف خليل</p>
                  </div>
                  <span className="bg-amber-50 border border-amber-200 text-amber-600 px-3 py-1.5 rounded-lg text-xs font-black shadow-sm">بانتظار التأكيد</span>
                </div>
                
                <div className="bg-slate-50 rounded-xl p-4 space-y-3 mb-6 border border-slate-100 font-mono shadow-inner">
                   <div className="flex justify-between items-end text-sm">
                     <span className="font-bold text-slate-800 text-base">Paracetamol 1000mg</span>
                     <span className="text-slate-500 font-sans">1 قرص / 8 ساعات</span>
                   </div>
                   <div className="flex justify-between items-end text-sm border-t border-slate-200 pt-3">
                     <span className="font-bold text-slate-800 text-base">Amoxicillin 500mg</span>
                     <span className="text-slate-500 font-sans">1 كبسولة / 12 ساعة</span>
                   </div>
                </div>

                <div className="flex gap-3">
                   <Button className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-white font-bold h-12 rounded-xl border border-emerald-500 shadow-md shadow-emerald-500/20">
                     تأكيد توفر الأدوية (تجهيز)
                   </Button>
                   <Button variant="outline" className="w-14 items-center justify-center p-0 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 border-slate-200 rounded-xl h-12 bg-white">
                     <AlertTriangle className="w-5 h-5"/>
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
          <Card className="shadow-xl shadow-purple-500/5 h-[650px] flex flex-col bg-white/60 backdrop-blur-2xl rounded-3xl border-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/50 mix-blend-multiply blur-3xl rounded-full"></div>
            <CardHeader className="bg-white/50 border-b border-emerald-50 relative z-10">
              <CardTitle className="flex items-center gap-2 text-emerald-600 text-xl font-bold">
                <CheckCircle2 className="w-6 h-6"/>
                تم التجهيز (بانتظار المريض المجيء)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 flex-1 overflow-y-auto space-y-4 relative z-10 p-6">
              
              <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <h3 className="font-bold text-xl text-slate-800">سمير محمودي</h3>
                    <p className="text-sm text-slate-500 mt-1 font-bold">طبيب معالج: د. سارة بوعلام</p>
                  </div>
                  <span className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-3 py-1.5 rounded-lg text-xs font-black shadow-sm">جاهز للاستلام المباشر</span>
                </div>
                <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200 text-slate-700 font-bold hover:bg-slate-50 hover:text-slate-900 bg-white shadow-sm">التأكيد وتسليم الدواء</Button>
              </div>

            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
