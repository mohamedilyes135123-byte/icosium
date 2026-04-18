"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  CheckCircle2, FlaskConical, User, Clock, FileText,
  Download, Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LabResultsHistory() {
  const supabase = createClient();
  const [results, setResults] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user));
  }, [supabase]);

  const fetchResults = useCallback(async () => {
    if (!currentUser) return;
    const { data } = await supabase
      .from("lab_results")
      .select(`
        *,
        patient:profiles!lab_results_patient_id_fkey(full_name, phone),
        lab_request:lab_requests(
          tests_list, doctor_notes, qr_token,
          doctor:profiles!lab_requests_doctor_id_fkey(full_name)
        )
      `)
      .eq("lab_id", currentUser.id)
      .order("uploaded_at", { ascending: false });

    setResults(data || []);
    setLoading(false);
  }, [supabase, currentUser]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div className="pb-32 w-full" dir="rtl">

      {/* â”€â”€ Header â”€â”€ */}
      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="mb-8 pb-6 border-b border-purple-100/50">
        <h1 className="text-3xl font-extrabold text-slate-800 mb-2 tracking-tight">
          Ø³Ø¬Ù„ Ø§Ù„Ù†ØªØ§Ø¦Ø¬ Ø§Ù„Ù…Ø±ÙÙˆØ¹Ø©
        </h1>
        <p className="text-slate-500">
          Ø¬Ù…ÙŠØ¹ Ù†ØªØ§Ø¦Ø¬ Ø§Ù„ØªØ­Ø§Ù„ÙŠÙ„ Ø§Ù„ØªÙŠ Ø±ÙØ¹ØªÙ…ÙˆÙ‡Ø§ Ù„Ù„Ù…Ø±Ø¶Ù‰
        </p>
      </motion.header>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {results.map((result, i) => {
            const lr = result.lab_request;
            return (
              <motion.div key={result.id}
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1, transition: { delay: i * 0.04 } }}
                layout
                className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-white shadow-lg shadow-emerald-500/5 overflow-hidden">

                {/* Green top bar */}
                <div className="h-1.5 bg-emerald-500 w-full" />

                <div className="p-5">
                  {/* Patient */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-black text-sm">
                      {result.patient?.full_name?.charAt(0) || "ØŸ"}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{result.patient?.full_name}</p>
                      {result.patient?.phone && (
                        <p className="text-xs text-slate-400">{result.patient.phone}</p>
                      )}
                    </div>
                    <div className="mr-auto">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-xl border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ù…ÙØ±Ø³Ù„Ø©
                      </span>
                    </div>
                  </div>

                  {/* Upload time */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(result.uploaded_at).toLocaleString("ar-DZ")}
                  </div>

                  {/* Doctor */}
                  {lr?.doctor && (
                    <div className="text-xs text-slate-500 mb-3">
                      <span className="font-bold">Ø·Ù„Ø¨ Ø¨ÙˆØ§Ø³Ø·Ø©: </span>{lr.doctor.full_name}
                    </div>
                  )}

                  {/* Tests */}
                  {lr?.tests_list && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {lr.tests_list.map((t: any, idx: number) => (
                        <span key={idx} className="text-xs bg-cyan-50 text-cyan-700 px-2 py-1 rounded-lg font-bold border border-cyan-100 flex items-center gap-1">
                          <FlaskConical className="w-3 h-3" /> {t.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Result notes */}
                  {result.result_notes && (
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 mb-3 shadow-inner">
                      <p className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" /> Ù…Ù„Ø®Øµ Ø§Ù„Ù†ØªØ§Ø¦Ø¬
                      </p>
                      <p className="text-sm text-slate-700 font-medium leading-relaxed line-clamp-3 whitespace-pre-wrap">
                        {result.result_notes}
                      </p>
                    </div>
                  )}

                  {/* File link */}
                  {result.file_url && (
                    <a href={result.file_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 w-full justify-center py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-2xl transition-colors">
                      <Download className="w-4 h-4" /> Ø¹Ø±Ø¶ Ù…Ù„Ù Ø§Ù„Ù†ØªØ§Ø¦Ø¬
                    </a>
                  )}
                </div>
              </motion.div>
            );
          })}

          {!loading && results.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white/40 border border-white rounded-3xl text-slate-400">
              <CheckCircle2 className="w-16 h-16 mb-4 text-emerald-200" />
              <h3 className="text-lg font-bold text-slate-600">Ù„Ù… ØªÙØ±ÙØ¹ Ø£ÙŠ Ù†ØªØ§Ø¦Ø¬ Ø¨Ø¹Ø¯</h3>
              <p className="text-sm">Ø§Ù„Ù†ØªØ§Ø¦Ø¬ Ø§Ù„ØªÙŠ ØªØ±ÙØ¹Ù‡Ø§ Ù„Ù„Ù…Ø±Ø¶Ù‰ Ø³ØªØ¸Ù‡Ø± Ù‡Ù†Ø§</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
