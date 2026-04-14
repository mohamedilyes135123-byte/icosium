"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Stethoscope, AlertCircle, FileSignature, CheckCircle, BrainCircuit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DoctorRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [writingRx, setWritingRx] = useState<string | null>(null);
  const [meds, setMeds] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchRequests = async () => {
      const { data } = await supabase
        .from('requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (data) setRequests(data);
    };

    fetchRequests();

    const channel = supabase
      .channel('public:doctor-requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, () => {
         fetchRequests();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const issuePrescription = async (reqId: string, patientId: string) => {
    if (!meds.trim()) return;
    setLoading(true);

    // 1. Create prescription
    await supabase.from('prescriptions').insert([
       {
          patient_id: patientId,
          doctor_id: '11111111-1111-1111-1111-111111111111', // Dummy Doc ID for bypass
          medications: { raw_text: meds },
          status: 'pending'
       }
    ]);

    // 2. Mark request as completed
    await supabase.from('requests').update({ status: 'completed' }).eq('id', reqId);

    setWritingRx(null);
    setMeds("");
    setLoading(false);
  };

  return (
    <div className="w-full px-5 pt-8 pb-32 min-h-full">
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex justify-between items-center mb-8 bg-white/40 backdrop-blur-lg p-4 rounded-[2rem] border border-white/60 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
             <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 leading-none mb-1">الاستشارات الحية</h1>
            <p className="text-xs font-bold text-blue-500">مزامنة تزامنية مع المرضى</p>
          </div>
        </div>
      </motion.header>

      <div className="space-y-5">
         <AnimatePresence>
            {requests.map((req) => (
               <motion.div
                  key={req.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                  className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] p-6 shadow-xl shadow-blue-500/5 relative group"
               >
                  <div className="flex justify-between items-start mb-4">
                     <div>
                        <h3 className="font-bold text-slate-800 text-lg mb-1">مريض (عبر التطبيق)</h3>
                        <p className="text-xs text-slate-400 font-medium">{new Date(req.created_at).toLocaleString()}</p>
                     </div>
                     <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-lg text-xs font-black border border-rose-100 animate-pulse">جديد</span>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100">
                     <p className="text-slate-700 font-medium text-sm leading-relaxed">{req.symptoms}</p>
                  </div>

                  {req.ai_summary && (
                     <div className="bg-cyan-50/50 rounded-xl p-3 mb-4 border border-cyan-100 flex gap-3 items-start">
                        <BrainCircuit className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-cyan-800 font-bold leading-relaxed">{req.ai_summary}</p>
                     </div>
                  )}

                  {writingRx === req.id ? (
                     <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-3">
                        <textarea 
                           value={meds} 
                           onChange={(e) => setMeds(e.target.value)}
                           className="w-full bg-slate-50 border border-blue-200 rounded-xl h-24 p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono"
                           placeholder="اكتب الدواء هنا... (مثال: Amoxicillin 500mg, 1x3)"
                           autoFocus
                        ></textarea>
                        <div className="flex gap-2">
                           <Button onClick={() => issuePrescription(req.id, req.patient_id)} disabled={loading || !meds} className="flex-1 bg-blue-600 hover:bg-blue-700 h-12 rounded-xl text-white font-bold">
                              {loading ? "جاري البث..." : "إصدار الوصفة وتشفيرها للصيدلية"}
                           </Button>
                           <Button variant="outline" onClick={() => setWritingRx(null)} className="h-12 rounded-xl text-slate-500 border-slate-200 bg-white">إلغاء</Button>
                        </div>
                     </motion.div>
                  ) : (
                     <div className="flex gap-3">
                        <Button onClick={() => setWritingRx(req.id)} className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold h-12 shadow-md hover:scale-[1.02] transition-transform">
                           <FileSignature className="w-4 h-4 rtl:ml-2 ltr:mr-2" />
                           كتابة وصفة طبية (Rx)
                        </Button>
                     </div>
                  )}
               </motion.div>
            ))}

            {requests.length === 0 && (
               <div className="flex flex-col items-center justify-center p-10 bg-white/40 backdrop-blur-sm rounded-[2rem] border border-white/60 shadow-inner">
                  <CheckCircle className="w-12 h-12 text-slate-300 mb-4" />
                  <h4 className="text-slate-600 font-bold mb-1">لا توجد حالات في الانتظار</h4>
                  <p className="text-slate-400 text-sm text-center">أنت متصل بالمنظومة المركزية، أي حالة طارئة من تطبيق المريض ستظهر هنا فوراً.</p>
               </div>
            )}
         </AnimatePresence>
      </div>
    </div>
  );
}
