"use client";
export const dynamic = "force-dynamic";




import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Activity, Droplets, Heart, Plus, TrendingUp,
  TrendingDown, Minus, Clock, ChevronDown, AlertTriangle, CheckCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type MetricType = "blood_sugar" | "blood_pressure" | "weight" | "oximetry" | "heart_rate";
type MealContext = "fasting" | "post_meal" | "before_sleep" | "any";

interface Measurement {
  id: string;
  type: MetricType;
  value1: number;   // primary (sugar / systolic / weight / spo2)
  value2?: number;  // secondary (diastolic)
  meal_context?: MealContext;
                      placeholder="80"
                      className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-400 outline-none text-center text-xl font-black" />
                  </div>
                )}
              </div>

              {/* Meal context (for blood sugar) */}
              {activeMetric === "blood_sugar" && (
                <div className="mb-4">
                  <label className="text-xs font-bold text-slate-500 mb-2 block">سياق القياس</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(MEAL_CONTEXT_LABELS) as MealContext[]).map(ctx => (
                      <button key={ctx} type="button" onClick={() => setMealCtx(ctx)}
                        className={`py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                          mealCtx === ctx ? "border-amber-500 bg-amber-50 text-amber-700" : "border-slate-200 text-slate-500"
                        }`}>
                        {MEAL_CONTEXT_LABELS[ctx]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="mb-6">
                <label className="text-xs font-bold text-slate-500 mb-1 block">ملاحظات (اختياري)</label>
                <input value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="مثال: بعد المجهود الرياضي..."
                  className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-400 outline-none text-sm" />
              </div>

              </div>

              {/* ── Sticky action buttons — always visible ── */}
              <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-white"
                   style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))", flexShrink: 0 }}>
                <button onClick={saveMeasurement} disabled={saving || !val1}
                  className="flex-1 h-14 rounded-2xl bg-gradient-to-l from-emerald-500 to-green-400 text-white font-black text-base shadow-lg shadow-emerald-500/30 disabled:opacity-50 transition-transform active:scale-95">
                  {saving ? "جاري الحفظ..." : "✅ تسجيل القياس"}
                </button>
                <button onClick={() => setShowAddForm(false)}
                  className="h-14 px-6 rounded-2xl border-2 border-slate-200 bg-white text-slate-600 font-bold transition-transform active:scale-95">
                  إلغاء
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

