"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pill, Printer, Send, Plus, Search, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function PrescriptionWriter() {
  const [meds, setMeds] = useState([{ id: 1, name: '', dose: '', duration: '' }]);

  const addMed = () => setMeds([...meds, { id: Date.now(), name: '', dose: '', duration: '' }]);

  return (
    <div className="p-8 h-screen overflow-y-auto w-full max-w-5xl mx-auto">
      <header className="mb-8 flex justify-between items-end border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">وصفة طبية جديدة</h1>
          <p className="text-slate-500">المريض: أحمد بن علي | العمر: 34 سنة</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="gap-2 bg-white"><Printer className="w-4 h-4"/> طباعة</Button>
          <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20 shadow-lg"><Send className="w-4 h-4"/> إرسال للصيدلية</Button>
        </div>
      </header>

      <div className="space-y-6">
        {/* Verification Alert */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-start gap-4">
          <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 mt-1" />
          <div>
            <h4 className="font-semibold text-blue-800">وصفة إلكترونية آمنة</h4>
            <p className="text-sm text-blue-600 mt-1">بمجرد الإرسال، سيتم تشفير الوصفة ولن يمكن تعديلها من قبل الصيدلية، لضمان أعلى معايير الأمان حسب تصنيفات RBAC.</p>
          </div>
        </div>

        {/* Prescription Form */}
        <Card className="shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-100">
            <CardTitle className="text-lg flex items-center gap-2">
              <Pill className="text-brand-500 w-5 h-5"/>
              قائمة الأدوية
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            
            {meds.map((med, index) => (
              <div key={med.id} className="grid grid-cols-12 gap-4 items-start p-4 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-100 transition-colors">
                <div className="col-span-1 pt-3 font-bold text-slate-400">{index + 1}.</div>
                
                <div className="col-span-5 space-y-2">
                  <label className="text-xs font-semibold text-slate-500">اسم الدواء</label>
                  <div className="relative">
                    <input type="text" className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 outline-none" placeholder="مثال: Paracetamol 1000mg" />
                    <Search className="w-4 h-4 absolute top-3 left-3 rtl:left-auto rtl:right-3 text-slate-300" />
                  </div>
                </div>

                <div className="col-span-3 space-y-2">
                  <label className="text-xs font-semibold text-slate-500">الجرعة / التكرار</label>
                  <input type="text" className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 outline-none" placeholder="1 قرص / 8 ساعات" />
                </div>

                <div className="col-span-3 space-y-2">
                  <label className="text-xs font-semibold text-slate-500">المدة</label>
                  <input type="text" className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-500 outline-none" placeholder="5 أيام" />
                </div>
              </div>
            ))}

            <div className="pt-4 px-4">
               <Button onClick={addMed} variant="outline" className="w-full border-dashed border-2 py-6 text-slate-500 hover:text-brand-600 hover:border-brand-300 hover:bg-brand-50">
                 <Plus className="w-5 h-5 ml-2" />
                 إضافة دواء آخر
               </Button>
            </div>
            
            <div className="pt-8 space-y-2 px-4">
               <label className="font-semibold text-slate-700">ملاحظات للصيدلي (اختياري)</label>
               <textarea className="w-full border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-brand-500 outline-none min-h-[100px]" placeholder="أضف أي تعليمات خاصة..."></textarea>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
