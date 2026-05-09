"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, ChevronRight, ChevronLeft, Plus, Pill, Check,
  Layers, ArrowRight
} from "lucide-react";
import { MEDICATION_CATALOG, MedCategory, MedSubcategory } from "@/lib/medications-catalog";

interface MedicationPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (drugName: string) => void;
  /** Allow adding a custom drug not in the list */
  onAddCustom?: (drugName: string) => void;
}

type View = "categories" | "subcategories" | "drugs";

export default function MedicationPicker({ open, onClose, onSelect, onAddCustom }: MedicationPickerProps) {
  const [view, setView] = useState<View>("categories");
  const [selectedCat, setSelectedCat] = useState<MedCategory | null>(null);
  const [selectedSub, setSelectedSub] = useState<MedSubcategory | null>(null);
  const [search, setSearch] = useState("");
  const [customDrug, setCustomDrug] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setView("categories");
      setSelectedCat(null);
      setSelectedSub(null);
      setSearch("");
      setShowCustom(false);
      setCustomDrug("");
    }
  }, [open]);

  // Focus search on open
  useEffect(() => {
    if (open && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 200);
    }
  }, [open]);

  // Flat search across all drugs
  const searchResults = useMemo(() => {
    if (search.length < 2) return [];
    const q = search.toLowerCase();
    const results: { drug: string; cat: string; sub: string; catColor: string }[] = [];
    MEDICATION_CATALOG.forEach(cat => {
      cat.subcategories.forEach(sub => {
        sub.drugs.forEach(drug => {
          if (drug.toLowerCase().includes(q)) {
            results.push({ drug, cat: cat.name, sub: sub.name, catColor: cat.color });
          }
        });
      });
    });
    return results.slice(0, 20);
  }, [search]);

  const isSearching = search.length >= 2;

  const handleSelectCat = (cat: MedCategory) => {
    setSelectedCat(cat);
    // If only 1 subcategory, skip to drugs
    if (cat.subcategories.length === 1) {
      setSelectedSub(cat.subcategories[0]);
      setView("drugs");
    } else {
      setView("subcategories");
    }
  };

  const handleSelectSub = (sub: MedSubcategory) => {
    setSelectedSub(sub);
    setView("drugs");
  };

  const handleBack = () => {
    if (view === "drugs") {
      if (selectedCat && selectedCat.subcategories.length === 1) {
        setView("categories");
        setSelectedCat(null);
        setSelectedSub(null);
      } else {
        setView("subcategories");
        setSelectedSub(null);
      }
    } else if (view === "subcategories") {
      setView("categories");
      setSelectedCat(null);
    }
  };

  const handleDrugSelect = (drug: string) => {
    onSelect(drug);
    onClose();
  };

  const handleAddCustom = () => {
    if (customDrug.trim()) {
      if (onAddCustom) onAddCustom(customDrug.trim());
      else onSelect(customDrug.trim());
      onClose();
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            dir="rtl"
          >
            {/* Header */}
            <div className="flex-shrink-0 bg-gradient-to-l from-blue-700 to-cyan-600 px-6 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {view !== "categories" && !isSearching && (
                    <button onClick={handleBack}
                      className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                      <ArrowRight className="w-4 h-4 text-white" />
                    </button>
                  )}
                  <div>
                    <h2 className="text-lg font-black text-white flex items-center gap-2">
                      <Pill className="w-5 h-5" />
                      {isSearching ? "نتائج البحث" :
                       view === "categories" ? "اختر فئة الدواء" :
                       view === "subcategories" ? selectedCat?.name :
                       selectedSub?.name}
                    </h2>
                    {!isSearching && view !== "categories" && (
                      <p className="text-blue-100 text-xs mt-0.5">
                        {view === "subcategories" ? `${selectedCat?.icon} ${selectedCat?.code}` : `${selectedCat?.icon} ${selectedCat?.name}`}
                      </p>
                    )}
                  </div>
                </div>
                <button onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute right-3 top-2.5 w-4 h-4 text-white/50" />
                <input
                  ref={searchRef}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="ابحث عن دواء بالاسم..."
                  className="w-full h-9 pr-9 pl-4 bg-white/15 border border-white/20 rounded-xl text-sm text-white placeholder-white/50 outline-none focus:bg-white/25 transition-colors"
                />
                {search && (
                  <button onClick={() => setSearch("")}
                    className="absolute left-3 top-2.5 text-white/50 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: "calc(85vh - 140px)" }}>
              <AnimatePresence mode="wait">
                {/* ── Search Results ── */}
                {isSearching && (
                  <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {searchResults.length > 0 ? (
                      <div className="space-y-1.5">
                        {searchResults.map((r, i) => (
                          <button key={`${r.drug}-${i}`} onClick={() => handleDrugSelect(r.drug)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-blue-50 transition-colors text-right group">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                              style={{ backgroundColor: r.catColor }}>
                              💊
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-slate-800 text-sm truncate">{r.drug}</p>
                              <p className="text-xs text-slate-400 truncate">{r.cat} → {r.sub}</p>
                            </div>
                            <Check className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <Search className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-400 text-sm font-bold">لا توجد نتائج لـ &quot;{search}&quot;</p>
                        <button onClick={() => { setShowCustom(true); setCustomDrug(search); }}
                          className="mt-3 flex items-center gap-2 mx-auto px-4 py-2 rounded-xl bg-blue-50 text-blue-600 text-sm font-bold hover:bg-blue-100 transition-colors">
                          <Plus className="w-4 h-4" /> إضافة كدواء جديد
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ── Categories Grid ── */}
                {!isSearching && view === "categories" && (
                  <motion.div key="cats" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                    <div className="grid grid-cols-2 gap-2.5">
                      {MEDICATION_CATALOG.map(cat => (
                        <button key={cat.id} onClick={() => handleSelectCat(cat)}
                          className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all text-right group"
                        >
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                            style={{ backgroundColor: `${cat.color}15` }}>
                            {cat.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-slate-700 text-xs leading-tight truncate">{cat.name}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{cat.code} • {cat.subcategories.length} أقسام</p>
                          </div>
                          <ChevronLeft className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* ── Subcategories ── */}
                {!isSearching && view === "subcategories" && selectedCat && (
                  <motion.div key="subs" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                    <div className="space-y-2">
                      {selectedCat.subcategories.map(sub => (
                        <button key={sub.id} onClick={() => handleSelectSub(sub)}
                          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all text-right group"
                        >
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
                            style={{ backgroundColor: `${selectedCat.color}15`, color: selectedCat.color }}>
                            {sub.letter}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-700 text-sm">{sub.name}</p>
                            <p className="text-xs text-slate-400">{sub.drugs.length} دواء</p>
                          </div>
                          <ChevronLeft className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* ── Drug List ── */}
                {!isSearching && view === "drugs" && selectedSub && (
                  <motion.div key="drugs" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                    <div className="space-y-1.5">
                      {selectedSub.drugs.map(drug => (
                        <button key={drug} onClick={() => handleDrugSelect(drug)}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-blue-50 transition-colors text-right group"
                        >
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                            style={{ backgroundColor: selectedCat?.color || "#3b82f6" }}>
                            💊
                          </div>
                          <p className="flex-1 font-bold text-slate-700 text-sm">{drug}</p>
                          <Check className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer — Add custom drug */}
            <div className="flex-shrink-0 border-t border-slate-100 px-5 py-3 bg-slate-50">
              {!showCustom ? (
                <button onClick={() => setShowCustom(true)}
                  className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                  <Plus className="w-4 h-4" /> إضافة دواء غير موجود في القائمة
                </button>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={customDrug}
                    onChange={e => setCustomDrug(e.target.value)}
                    placeholder="اسم الدواء الجديد..."
                    autoFocus
                    onKeyDown={e => e.key === "Enter" && handleAddCustom()}
                    className="flex-1 h-10 px-4 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button onClick={handleAddCustom} disabled={!customDrug.trim()}
                    className="px-4 h-10 rounded-xl bg-blue-600 text-white text-sm font-bold disabled:opacity-50 hover:bg-blue-700 transition-colors">
                    إضافة
                  </button>
                  <button onClick={() => { setShowCustom(false); setCustomDrug(""); }}
                    className="px-3 h-10 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
