"use client";

export const dynamic = 'force-dynamic';


import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  FileSignature, Clock, User, Pill, CheckCircle2, QrCode,
  Calendar, BadgeCheck, Eye, EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
                    </div>
                  ) : (
                    <div className="mr-2 mb-3 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-xl border border-amber-100 font-medium">
                      ⏳ المريض لم يختر مختبراً بعد
                    </div>
                  )}

                  {/* Tests */}
                  <div className="mr-2 flex flex-wrap gap-1.5 mb-3">
                    {lr.tests_list?.map((t: any, idx: number) => (
                      <span key={idx} className="text-xs bg-cyan-50 text-cyan-700 px-2 py-1 rounded-lg font-bold border border-cyan-100">
                        {t.name}
                      </span>
                    ))}
                  </div>

                  {/* Results preview */}
                  {hasResults && (
                    <div className="mr-2 bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                      <p className="text-xs font-bold text-emerald-700 mb-1">📋 النتائج متاحة:</p>
                      <p className="text-xs text-slate-600">{lr.lab_results[0].result_notes || "تم رفع ملف النتائج"}</p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
