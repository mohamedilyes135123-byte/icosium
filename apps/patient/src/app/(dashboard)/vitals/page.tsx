"use client";

export const dynamic = 'force-dynamic';


import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Activity, Droplets, Heart, Plus, TrendingUp,
  TrendingDown, Minus, Clock, ChevronDown, AlertTriangle, CheckCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type MetricType = "blood_sugar" | "blood_pressure" | "weight" | "oximetry";
type MealContext = "fasting" | "post_meal" | "before_sleep" | "any";

interface Measurement {
  id: string;
  type: MetricType;
  value1: number;   // primary (sugar / systolic / weight / spo2)
  value2?: number;  // secondary (diastolic)
  meal_context?: MealContext;
  notes?: string;
  created_at: string;
}

const NORMAL_RANGES: Record<MetricType, { min: number; max: number; unit: string; min2?: number; max2?: number }> = {
  blood_sugar:    { min: 70, max: 126, unit: "mg/dL" },
  blood_pressure: { min: 90, max: 140, unit: "mmHg", min2: 60, max2: 90 },
  weight:         { min: 40, max: 200, unit: "kg" },
  oximetry:       { min: 95, max: 100, unit: "%" },
};

const METRICS = [
  { id: "blood_sugar" as MetricType, label: "╪│┘â╪▒ ╪º┘ä╪»┘à", emoji: "≡ƒì¼", color: "from-amber-500 to-orange-400", bg: "amber" },
  { id: "blood_pressure" as MetricType, label: "╪╢╪║╪╖ ╪º┘ä╪»┘à", emoji: "≡ƒÆô", color: "from-rose-500 to-pink-400", bg: "rose" },
  { id: "weight" as MetricType, label: "╪º┘ä┘ê╪▓┘å", emoji: "ΓÜû∩╕Å", color: "from-blue-500 to-indigo-400", bg: "blue" },
  { id: "oximetry" as MetricType, label: "╪¬╪┤╪¿╪╣ ╪º┘ä╪ú┘â╪│╪¼┘è┘å", emoji: "≡ƒÆ¿", color: "from-cyan-500 to-teal-400", bg: "cyan" },
];

const MEAL_CONTEXT_LABELS: Record<MealContext, string> = {
  fasting: "╪╡╪º╪ª┘à",
  post_meal: "╪¿╪╣╪» ╪º┘ä╪ú┘â┘ä",
  before_sleep: "┘é╪¿┘ä ╪º┘ä┘å┘ê┘à",
  any: "╪ú┘è ┘ê┘é╪¬",
};

// Simple mini histogram bars
function MiniChart({ data, color }: { data: number[]; color: string }) {
  if (!data.length) return null;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  return (
    <div className="flex items-end gap-0.5 h-10 mt-1">
      {data.slice(-12).map((v, i) => (
        <div key={i} className={`flex-1 rounded-sm bg-gradient-to-t ${color} opacity-70`}
          style={{ height: `${((v - min) / range) * 100 + 10}%` }} />
      ))}
    </div>
  );
}

function getStatus(type: MetricType, v1: number, v2?: number): "normal" | "low" | "high" {
  const r = NORMAL_RANGES[type];
  if (v1 < r.min) return "low";
  if (v1 > r.max) return "high";
  if (v2 !== undefined && r.min2 && r.max2) {
    if (v2 < r.min2) return "low";
    if (v2 > r.max2) return "high";
  }
  return "normal";
}

export default function PatientVitals() {
  const supabase = createClient();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState<MetricType>("blood_sugar");
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [val1, setVal1] = useState("");
  const [val2, setVal2] = useState("");
  const [mealCtx, setMealCtx] = useState<MealContext>("any");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user));
  }, [supabase]);

  const fetchMeasurements = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    const { data } = await supabase
      .from("vitals")
      .select("*")
      .eq("patient_id", currentUser.id)
      .order("created_at", { ascending: false })
      .limit(100);
    setMeasurements(data || []);
    setLoading(false);
  }, [supabase, currentUser]);

  useEffect(() => { fetchMeasurements(); }, [fetchMeasurements]);

  const saveMeasurement = async () => {
    if (!currentUser || !val1) return;
    setSaving(true);
    await supabase.from("vitals").insert([{
      patient_id: currentUser.id,
      type: activeMetric,
      value1: parseFloat(val1),
      value2: val2 ? parseFloat(val2) : null,
      meal_context: mealCtx,
      notes: notes || null,
    }]);
    setVal1(""); setVal2(""); setNotes(""); setMealCtx("any");
    setShowAddForm(false);
    fetchMeasurements();
    setSaving(false);
  };

  // Filter for active metric
  const currentMeasurements = measurements.filter(m => m.type === activeMetric);
  const latest = currentMeasurements[0];
  const latestStatus = latest ? getStatus(activeMetric, latest.value1, latest.value2) : null;
  const currentMetaInfo = METRICS.find(m => m.id === activeMetric)!;
  const range = NORMAL_RANGES[activeMetric];

  // Calculate trend
  const trend = currentMeasurements.length >= 2
    ? currentMeasurements[0].value1 - currentMeasurements[1].value1
    : null;

  return (
    <div className="w-full pb-32" dir="rtl">

      {/* Header */}
      <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center border border-rose-200">
            <Activity className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800">┘é┘è╪º╪│╪º╪¬┘è ╪º┘ä┘è┘ê┘à┘è╪⌐</h1>
            <p className="text-xs font-bold text-slate-400">╪¬╪¬╪¿╪╣ ╪╡╪¡╪¬┘â ┘ü┘è ╪º┘ä┘ê┘é╪¬ ╪º┘ä┘ü╪╣┘ä┘è</p>
          </div>
        </div>
        <button onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-l from-rose-500 to-pink-400 text-white text-sm font-bold shadow-lg shadow-rose-500/30">
          <Plus className="w-4 h-4" /> ╪Ñ╪╢╪º┘ü╪⌐ ┘é┘è╪º╪│
        </button>
      </motion.header>

      {/* Metric selector tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
        {METRICS.map(m => (
          <button key={m.id} onClick={() => setActiveMetric(m.id)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all ${
              activeMetric === m.id
                ? `bg-gradient-to-l ${m.color} text-white shadow-lg`
                : "bg-white/80 text-slate-600 border border-slate-200 hover:border-slate-300"
            }`}>
            <span>{m.emoji}</span> {m.label}
          </button>
        ))}
      </div>

      {/* Latest reading card */}
      {latest && (
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className={`relative rounded-3xl p-6 mb-6 overflow-hidden text-white shadow-xl bg-gradient-to-br ${currentMetaInfo.color}`}>
          <div className="absolute left-0 top-0 w-40 h-40 bg-white/10 rounded-full -translate-x-12 -translate-y-12 blur-2xl" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-bold text-white/70">╪ó╪«╪▒ ┘é┘è╪º╪│</p>
                <p className="text-xs text-white/50 mt-0.5">{new Date(latest.created_at).toLocaleString("ar-DZ")}</p>
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black ${
                latestStatus === "normal" ? "bg-emerald-500/30 text-emerald-100" :
                latestStatus === "high" ? "bg-rose-500/50 text-white animate-pulse" :
                "bg-amber-500/40 text-yellow-100"
              }`}>
                {latestStatus === "normal" ? <><CheckCircle className="w-3.5 h-3.5" /> ╪╖╪¿┘è╪╣┘è</> :
                 latestStatus === "high" ? <><AlertTriangle className="w-3.5 h-3.5" /> ┘à╪▒╪¬┘ü╪╣</> :
                 <><AlertTriangle className="w-3.5 h-3.5" /> ┘à┘å╪«┘ü╪╢</>}
              </div>
            </div>

            <div className="flex items-end gap-3 mb-4">
              <span className="text-5xl font-black">{latest.value1}</span>
              {latest.value2 && <span className="text-2xl font-black text-white/70">/ {latest.value2}</span>}
              <span className="text-sm font-bold text-white/60 mb-2">{range.unit}</span>
              {trend !== null && trend !== 0 && (
                <div className={`flex items-center gap-1 text-sm font-bold mb-2 ${trend > 0 ? "text-rose-200" : "text-emerald-200"}`}>
                  {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {Math.abs(trend).toFixed(1)}
                </div>
              )}
            </div>

            {latest.meal_context && latest.meal_context !== "any" && (
              <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-bold">
                {MEAL_CONTEXT_LABELS[latest.meal_context]}
              </span>
            )}

            {/* Mini chart */}
            <MiniChart data={currentMeasurements.slice(0, 12).map(m => m.value1).reverse()} color={currentMetaInfo.color} />
          </div>
        </motion.div>
      )}

      {/* Normal range reminder */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6">
        <p className="text-xs font-bold text-slate-600 mb-1">╪º┘ä┘å╪╖╪º┘é ╪º┘ä╪╖╪¿┘è╪╣┘è:</p>
        <p className="text-sm font-black text-slate-800">
          {range.min} ΓÇö {range.max} {range.unit}
          {range.min2 && range.max2 && ` / ${range.min2} ΓÇö ${range.max2} ${range.unit}`}
        </p>
        {activeMetric === "blood_sugar" && (
          <p className="text-xs text-slate-400 mt-1">╪ú┘é┘ä ┘à┘å 100 ╪╡╪º╪ª┘à / ╪ú┘é┘ä ┘à┘å 140 ╪¿╪╣╪» ╪º┘ä╪ú┘â┘ä</p>
        )}
      </div>

      {/* Measurements history */}
      <h3 className="font-black text-slate-800 mb-4">╪¬╪º╪▒┘è╪« ╪º┘ä┘é┘è╪º╪│╪º╪¬</h3>
      {loading && (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-white/60 rounded-2xl animate-pulse border border-white" />)}
        </div>
      )}
      {!loading && currentMeasurements.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Activity className="w-16 h-16 text-slate-200 mb-4" />
          <p className="text-slate-500 font-bold">┘ä┘à ╪¬┘Å╪»╪«┘ä ╪ú┘è ┘é┘è╪º╪│ ╪¿╪╣╪»</p>
          <p className="text-slate-400 text-sm mt-1">╪º╪¿╪»╪ú ╪¿╪¬╪│╪¼┘è┘ä ┘é┘è╪º╪│┘â ╪º┘ä╪ú┘ê┘ä ╪º┘ä┘è┘ê┘à</p>
          <button onClick={() => setShowAddForm(true)}
            className="mt-4 px-5 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-bold">
            + ╪Ñ╪╢╪º┘ü╪⌐ ┘é┘è╪º╪│
          </button>
        </div>
      )}
      <div className="space-y-3">
        {currentMeasurements.slice(0, 30).map((m, i) => {
          const s = getStatus(m.type, m.value1, m.value2);
          return (
            <motion.div key={m.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.03 } }}
              className="bg-white/80 backdrop-blur-xl border border-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-8 rounded-full ${s === "normal" ? "bg-emerald-500" : s === "high" ? "bg-rose-500" : "bg-amber-400"}`} />
                <div>
                  <p className="font-black text-slate-800 text-base">
                    {m.value1} {m.value2 ? `/ ${m.value2}` : ""} <span className="text-xs text-slate-400 font-medium">{range.unit}</span>
                  </p>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {new Date(m.created_at).toLocaleString("ar-DZ", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}
                    {m.meal_context && m.meal_context !== "any" && (
                      <span className="mr-2 bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">{MEAL_CONTEXT_LABELS[m.meal_context]}</span>
                    )}
                  </p>
                  {m.notes && <p className="text-xs text-slate-500 mt-0.5 italic">{m.notes}</p>}
                </div>
              </div>
              <div className={`text-xs font-black px-2.5 py-1 rounded-xl ${
                s === "normal" ? "bg-emerald-50 text-emerald-700" :
                s === "high" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"
              }`}>
                {s === "normal" ? "╪╖╪¿┘è╪╣┘è" : s === "high" ? "┘à╪▒╪¬┘ü╪╣" : "┘à┘å╪«┘ü╪╢"}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ΓöÇΓöÇ Add Measurement Bottom Sheet ΓöÇΓöÇ */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
            onClick={() => setShowAddForm(false)}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="w-full bg-white rounded-t-[2rem] p-6 max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}>

              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-5" />
              <h3 className="font-black text-slate-800 text-lg mb-5 text-center">
                ╪¬╪│╪¼┘è┘ä ┘é┘è╪º╪│ ΓÇö {currentMetaInfo.emoji} {currentMetaInfo.label}
              </h3>

              {/* Value inputs */}
              <div className={`grid ${activeMetric === "blood_pressure" ? "grid-cols-2" : "grid-cols-1"} gap-3 mb-4`}>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">
                    {activeMetric === "blood_pressure" ? "╪º┘ä╪╢╪║╪╖ ╪º┘ä╪º┘å┘é╪¿╪º╪╢┘è (Systolic)" : "╪º┘ä┘é┘è┘à╪⌐"} ΓÇö {range.unit}
                  </label>
                  <input type="number" value={val1} onChange={e => setVal1(e.target.value)}
                    placeholder={activeMetric === "blood_pressure" ? "120" : activeMetric === "blood_sugar" ? "95" : activeMetric === "oximetry" ? "98" : "70"}
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-400 outline-none text-center text-xl font-black" />
                </div>
                {activeMetric === "blood_pressure" && (
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">╪º┘ä╪╢╪║╪╖ ╪º┘ä╪º┘å╪¿╪│╪º╪╖┘è (Diastolic)</label>
                    <input type="number" value={val2} onChange={e => setVal2(e.target.value)}
                      placeholder="80"
                      className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-400 outline-none text-center text-xl font-black" />
                  </div>
                )}
              </div>

              {/* Meal context (for blood sugar) */}
              {activeMetric === "blood_sugar" && (
                <div className="mb-4">
                  <label className="text-xs font-bold text-slate-500 mb-2 block">╪│┘è╪º┘é ╪º┘ä┘é┘è╪º╪│</label>
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
                <label className="text-xs font-bold text-slate-500 mb-1 block">┘à┘ä╪º╪¡╪╕╪º╪¬ (╪º╪«╪¬┘è╪º╪▒┘è)</label>
                <input value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="┘à╪½╪º┘ä: ╪¿╪╣╪» ╪º┘ä┘à╪¼┘ç┘ê╪» ╪º┘ä╪▒┘è╪º╪╢┘è..."
                  className="w-full h-10 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-400 outline-none text-sm" />
              </div>

              <div className="flex gap-3">
                <button onClick={saveMeasurement} disabled={saving || !val1}
                  className="flex-1 h-12 rounded-2xl bg-gradient-to-l from-rose-500 to-pink-400 text-white font-bold shadow-lg disabled:opacity-50">
                  {saving ? "╪¼╪º╪▒┘è ╪º┘ä╪¡┘ü╪╕..." : "Γ£à ╪¬╪│╪¼┘è┘ä ╪º┘ä┘é┘è╪º╪│"}
                </button>
                <button onClick={() => setShowAddForm(false)}
                  className="h-12 px-5 rounded-2xl border border-slate-200 bg-white text-slate-600 font-bold">
                  ╪Ñ┘ä╪║╪º╪í
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
