"use client";

export const dynamic = 'force-dynamic';


import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Search, MapPin, Award, ChevronRight, Stethoscope, Phone, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function DoctorDirectory() {
  const supabase = createClient();
  const router = useRouter();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, specialty, address, phone, verified, approval_status")
      .eq("role", "doctor")
      .order("full_name");
    setDoctors(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const filtered = doctors.filter(d =>
    !search ||
    d.full_name?.includes(search) ||
    d.specialty?.includes(search) ||
    d.address?.includes(search)
  );

  // Navigate to new request with pre-selected doctor
  const startRequest = (doctorId: string) => {
    router.push(`/requests?doctor=${doctorId}`);
  };

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="w-full pb-32" dir="rtl">

      {/* ── Header ── */}
      <motion.header initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }}
        className="mb-6 bg-white/60 backdrop-blur-md p-5 rounded-3xl shadow-sm border border-white">
        <h1 className="text-2xl font-black text-slate-800 mb-1">ابحث عن طبيبك</h1>
        <p className="text-slate-500 text-sm mb-4">
          اختر طبيبك وأرسل طلبك مباشرة — أنت من يتحكم في رحلتك الطبية
        </p>

        <div className="relative">
          <input
            type="text"
            placeholder="ابحث باسم الطبيب، التخصص، المنطقة..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-12 pr-4 pl-12 rounded-2xl border border-slate-200 bg-white/80 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all text-sm font-medium text-slate-700"
          />
          <Search className="absolute top-3.5 left-4 text-slate-400 w-5 h-5 pointer-events-none" />
        </div>
      </motion.header>

      {/* ── Doctors List ── */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <AnimatePresence>
            {filtered.map((doc, i) => {
              const initials = doc.full_name
                ?.split(" ").map((n: string) => n[0]).slice(0, 2).join("") || "؟";
              const isApproved = doc.approval_status === "approved" && doc.verified;

              return (
                <motion.div key={doc.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}>
                  <Card className="hover:border-emerald-300 transition-all group bg-white/70 backdrop-blur-lg shadow-sm border-white/60 rounded-3xl overflow-hidden">
                    <CardContent className="p-5">
                      <div className="flex gap-4">

                        {/* Avatar */}
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-100 to-cyan-50 border border-blue-100 flex-shrink-0 flex items-center justify-center shadow-inner">
                          <span className="text-xl font-black text-blue-600">{initials}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <div className="min-w-0">
                              <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight truncate">
                                {doc.full_name}
                              </h3>
                              {doc.specialty && (
                                <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold mt-0.5 bg-emerald-50 w-fit px-2 py-0.5 rounded-md">
                                  <Award className="w-3.5 h-3.5" />
                                  {doc.specialty}
                                </div>
                              )}
                            </div>
                            {isApproved ? (
                              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 shrink-0 mr-2">
                                ✅ معتمد
                              </span>
                            ) : (
                              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 shrink-0 mr-2">
                                ⏳ قيد المراجعة
                              </span>
                            )}
                          </div>

                          {doc.address && (
                            <div className="text-slate-400 text-xs flex items-center gap-1.5 mt-1.5">
                              <MapPin className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{doc.address}</span>
                            </div>
                          )}
                          {doc.phone && (
                            <div className="text-slate-400 text-xs flex items-center gap-1.5 mt-1">
                              <Phone className="w-3.5 h-3.5 shrink-0" />
                              <span>{doc.phone}</span>
                            </div>
                          )}

                          {/* CTA */}
                          <div className="flex items-center justify-end mt-4 pt-3 border-t border-slate-100">
                            <Button
                              onClick={() => startRequest(doc.id)}
                              disabled={!isApproved}
                              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                isApproved
                                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20"
                                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
                              }`}>
                              <Send className="w-4 h-4 rtl:-scale-x-100" />
                              إرسال طلب لهذا الطبيب
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            {filtered.length === 0 && !loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-20 bg-white/40 rounded-3xl border border-slate-200 border-dashed">
                <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">
                  {search ? "لا يوجد أطباء يطابقون بحثك" : "لا يوجد أطباء مسجلون حالياً"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
