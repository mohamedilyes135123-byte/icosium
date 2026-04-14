"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pill, CheckCircle2, Clock, ShieldAlert, BadgeCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PharmacyPrescriptions() {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const supabase = createClient();
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    const fetchRx = async () => {
      const { data } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (data) setPrescriptions(data);
    };

    fetchRx();

    const channel = supabase
      .channel('public:pharmacy-rx')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prescriptions' }, () => {
         fetchRx();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const markAsReady = async (id: string) => {
     setClaiming(id);
     await supabase.from('prescriptions').update({ status: 'ready' }).eq('id', id);
     setClaiming(null);
  }

  return (
    <div className="pb-32 w-full">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 border-b border-purple-100/50 pb-6"
      >
        <h1 className="text-4xl font-extrabold text-slate-800 mb-2 tracking-tight">الوصفات الإلكترونية الحية</h1>
        <p className="text-slate-500 text-lg">بث مباشر وموثق ومشفر للوصفات الصادرة من الأطباء، جاهزة للتحضير.</p>
      </motion.header>

      <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 mb-8 flex items-start gap-4 shadow-sm backdrop-blur-md">
        <div className="bg-white p-2 rounded-full text-amber-500 border border-amber-100">
           <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
           <h4 className="font-bold text-amber-900 text-lg">التحقق الذكي (RBAC Pharmacy Mode)</h4>
           <p className="text-sm text-slate-600 mt-1">أنت تتلقى الوصفات من الشبكة مباشرة. كصيدلي، نظام RBAC يسمح لك بالقراءة (Select) وتعديل حالة الطلب (Update Status)، لكن لا يسمح بتعديل مكونات الوصفة إطلاقا.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         <AnimatePresence>
            {prescriptions.map((rx) => (
               <motion.div
                  key={rx.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  layout
               >
                  <Card className="shadow-xl shadow-purple-500/5 h-full flex flex-col bg-white/60 backdrop-blur-2xl rounded-3xl border-white relative overflow-hidden group">
                     {/* Glass visual element */}
                     <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-100/50 mix-blend-multiply blur-2xl rounded-full"></div>
                     
                     <CardHeader className="bg-white/50 border-b border-slate-100 relative z-10 pb-4">
                        <div className="flex justify-between items-start">
                           <div>
                              <CardTitle className="text-slate-800 text-lg font-bold">معرف: {rx.id.substring(0,8)}</CardTitle>
                              <p className="text-xs text-slate-400 font-bold mt-1">الزمن: {new Date(rx.created_at).toLocaleTimeString()}</p>
                           </div>
                           <span className="bg-purple-100 text-purple-700 font-black text-xs px-2 py-1 rounded-md animate-pulse">جديد (Live)</span>
                        </div>
                     </CardHeader>
                     
                     <CardContent className="pt-5 flex-1 flex flex-col relative z-10">
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-5 flex-1 relative font-mono shadow-inner">
                           <BadgeCheck className="absolute top-3 right-3 w-5 h-5 text-emerald-400 opacity-50" />
                           <h4 className="text-slate-500 font-sans text-xs mb-2">محتوى الوصفة (مشفرة):</h4>
                           <p className="text-slate-800 font-bold leading-relaxed whitespace-pre-wrap">{rx.medications?.raw_text || "لا توجد تفاصيل"}</p>
                        </div>
                        
                        <Button 
                           onClick={() => markAsReady(rx.id)}
                           disabled={claiming === rx.id}
                           className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-500 hover:from-purple-500 hover:to-fuchsia-400 h-14 rounded-xl text-white font-bold shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                        >
                           {claiming === rx.id ? "جاري التوثيق..." : (
                              <>تأكيد التجهيز <CheckCircle2 className="w-5 h-5"/></>
                           )}
                        </Button>
                     </CardContent>
                  </Card>
               </motion.div>
            ))}

            {prescriptions.length === 0 && (
               <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white/40 border border-white rounded-3xl shadow-sm text-slate-400">
                  <Pill className="w-16 h-16 mb-4 text-purple-200" />
                  <h3 className="text-lg font-bold text-slate-600">لا توجد وصفات قيد الانتظار</h3>
                  <p className="text-sm">الشبكة متصلة وبانتظار أطباء المنصة لإصدار وصفات حية.</p>
               </div>
            )}
         </AnimatePresence>
      </div>
    </div>
  );
}
