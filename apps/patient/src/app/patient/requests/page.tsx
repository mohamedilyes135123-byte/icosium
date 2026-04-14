"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Stethoscope, AlertCircle, Clock, CheckCircle2, Send, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PatientRequests() {
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const supabase = createClient();

  // Fetch Existing Requests and Subscribe to Real-Time Updates
  useEffect(() => {
    const fetchRequests = async () => {
      const { data } = await supabase
        .from('requests')
        .select('*')
        // Using a dummy hardcoded ID since the user is in bypass mode
        .eq('patient_id', '00000000-0000-0000-0000-000000000000') 
        .order('created_at', { ascending: false });
      
      if (data) setRequests(data);
    };

    fetchRequests();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('public:requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, payload => {
         // Reload data on any change
         fetchRequests();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) return;
    
    setLoading(true);

    const { error } = await supabase
      .from('requests')
      .insert([
        { 
          patient_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID for bypass mode
          symptoms: symptoms,
          status: 'pending',
          ai_summary: `تحليل أولي: المريض يعاني من أعراض تتعلق بـ (${symptoms.substring(0, 15)}...). ينصح بمراجعته سريعاً.`
        }
      ]);

    if (!error) {
       setSymptoms("");
    }
    setLoading(false);
  };

  return (
    <div className="w-full px-5 pt-8 pb-32 min-h-full">
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-4 mb-8"
      >
        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-200">
           <Stethoscope className="w-6 h-6" />
        </div>
        <div>
           <h1 className="text-xl font-black text-slate-800">طلب استشارة عاجلة</h1>
           <p className="text-xs font-bold text-slate-400">سيتم إرسالها للأطباء بالزمن الفعلي</p>
        </div>
      </motion.header>

      {/* Form Card */}
      <motion.div
         initial={{ scale: 0.95, opacity: 0 }}
         animate={{ scale: 1, opacity: 1 }}
         transition={{ delay: 0.1 }}
         className="bg-white/80 backdrop-blur-xl border border-white shadow-xl shadow-emerald-500/10 rounded-[2rem] p-6 mb-8 relative overflow-hidden"
      >
         <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-100/50 mix-blend-multiply blur-2xl rounded-full -translate-x-10 -translate-y-10"></div>
         
         <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-4">
            <label className="text-sm font-bold text-slate-700">ما هي الأعراض التي تعاني منها؟</label>
            <textarea 
               value={symptoms}
               onChange={(e) => setSymptoms(e.target.value)}
               placeholder="مثال: أشعر بصداع شديد وارتفاع في درجة الحرارة منذ يومين..."
               className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none h-32 text-slate-700 transition-all font-medium"
               required
            ></textarea>
            <Button 
               type="submit" 
               disabled={loading}
               className="w-full h-14 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-white font-bold shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
            >
               {loading ? "جاري الإرسال..." : (
                  <> إرسال الطلب الآني <Send className="w-5 h-5 rtl:-scale-x-100" /> </>
               )}
            </Button>
         </form>
      </motion.div>

      {/* Real-time List */}
      <div className="mb-4">
         <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
            سجل الاستشارات 
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
         </h3>
      </div>

      <div className="space-y-4">
         <AnimatePresence>
            {requests.map((req, i) => (
               <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/70 backdrop-blur-md border border-white rounded-2xl p-5 shadow-sm relative overflow-hidden"
               >
                  {req.status === 'pending' && <div className="absolute top-0 right-0 w-1.5 h-full bg-amber-400"></div>}
                  {req.status === 'completed' && <div className="absolute top-0 right-0 w-1.5 h-full bg-emerald-500"></div>}
                  
                  <div className="flex justify-between items-start mb-2">
                     <p className="text-xs text-slate-400 font-bold bg-slate-100 px-2 py-1 rounded-md">
                        {new Date(req.created_at).toLocaleTimeString('ar-DZ')}
                     </p>
                     {req.status === 'pending' ? (
                        <span className="flex items-center gap-1 text-xs font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-100"><Clock className="w-3.5 h-3.5"/> قيد الانتظار</span>
                     ) : (
                        <span className="flex items-center gap-1 text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100"><CheckCircle2 className="w-3.5 h-3.5"/> اكتمل (يوجد وصفة)</span>
                     )}
                  </div>
                  <h4 className="text-slate-800 font-bold text-sm mb-1 line-clamp-2">{req.symptoms}</h4>
               </motion.div>
            ))}

            {requests.length === 0 && (
               <p className="text-center text-slate-400 text-sm mt-8 font-bold border-2 border-dashed border-slate-200 rounded-2xl p-8">لا توجد طلبات سابقة. أرسل استشارة جديدة ليظهر التحديث هنا وفي شاشة الطبيب الموازية.</p>
            )}
         </AnimatePresence>
      </div>
    </div>
  );
}
