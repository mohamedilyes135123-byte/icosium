"use client";

export const dynamic = 'force-dynamic';


import { useState } from "react";
import {
  Package, Search, Plus, AlertTriangle, TrendingDown,
  BarChart3, Edit3, Save, X, CheckCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const INITIAL = [
  { id: "1",  name: "Paracetamol 1000mg",  category: "مسكنات",       stock: 245, min: 50,  unit: "علبة", price: 180 },
  { id: "2",  name: "Amoxicillin 500mg",    category: "مضادات حيوية", stock: 12,  min: 30,  unit: "علبة", price: 320 },
  { id: "3",  name: "Metformin 500mg",      category: "سكري",         stock: 89,  min: 40,  unit: "علبة", price: 95  },
  { id: "4",  name: "Amlodipine 5mg",       category: "ضغط الدم",     stock: 0,   min: 20,  unit: "علبة", price: 210 },
  { id: "5",  name: "Omeprazole 20mg",      category: "هضمي",         stock: 156, min: 30,  unit: "علبة", price: 145 },
  { id: "6",  name: "Ibuprofen 400mg",      category: "مسكنات",       stock: 8,   min: 25,  unit: "علبة", price: 120 },
  { id: "7",  name: "Atorvastatin 10mg",    category: "قلب وأوعية",   stock: 67,  min: 20,  unit: "علبة", price: 280 },
  { id: "8",  name: "Losartan 50mg",        category: "ضغط الدم",     stock: 44,  min: 20,  unit: "علبة", price: 195 },
  { id: "9",  name: "Azithromycin 500mg",   category: "مضادات حيوية", stock: 33,  min: 15,  unit: "علبة", price: 420 },
  { id: "10", name: "Vitamin D3 1000IU",    category: "مكملات",       stock: 0,   min: 20,  unit: "علبة", price: 350 },
];

type Item = typeof INITIAL[0];

export default function PharmacyInventory() {
  const [inventory, setInventory] = useState<Item[]>(INITIAL);
  const [search, setSearch]   = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [editing, setEditing] = useState<string | null>(null);
  const [editQty, setEditQty] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", category: "", stock: "", min: "", unit: "علبة", price: "" });

  const cats = ["all", ...Array.from(new Set(inventory.map(i => i.category)))];
  const filtered = inventory.filter(i =>
    (catFilter === "all" || i.category === catFilter) &&
    (!search || i.name.toLowerCase().includes(search.toLowerCase()))
  );

  const outStock = inventory.filter(i => i.stock === 0).length;
  const lowStock = inventory.filter(i => i.stock > 0 && i.stock < i.min).length;

  const saveQty = (id: string) => {
    setInventory(inv => inv.map(i => i.id === id ? { ...i, stock: parseInt(editQty) || 0 } : i));
    setEditing(null); setEditQty("");
  };

  const addItem = () => {
    if (!newItem.name) return;
    setInventory(inv => [...inv, {
      id: Date.now().toString(), name: newItem.name,
      category: newItem.category || "أخرى",
      stock: parseInt(newItem.stock) || 0,
      min: parseInt(newItem.min) || 10,
      unit: newItem.unit, price: parseInt(newItem.price) || 0,
    }]);
    setNewItem({ name: "", category: "", stock: "", min: "", unit: "علبة", price: "" });
    setShowAdd(false);
  };

  return (
    <div className="pb-32 w-full" dir="rtl">

      {/* Header */}
      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800">إدارة المخزون</h1>
          <p className="text-slate-400 text-sm">تتبع مستويات الأدوية ونبّهات النفاد</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-l from-purple-600 to-fuchsia-500 text-white font-bold text-sm shadow-lg shadow-purple-500/25">
          <Plus className="w-4 h-4" /> إضافة دواء
        </button>
      </motion.header>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-7">
        {[
          { label: "إجمالي الأصناف", value: inventory.length, color: "from-purple-500 to-fuchsia-400", icon: <BarChart3 className="w-5 h-5" /> },
          { label: "نفاد المخزون",    value: outStock,         color: "from-rose-500 to-pink-400",      icon: <AlertTriangle className="w-5 h-5" /> },
          { label: "مخزون منخفض",    value: lowStock,         color: "from-amber-500 to-orange-400",   icon: <TrendingDown className="w-5 h-5" /> },
        ].map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1, transition: { delay: 0.1 + i * 0.05 } }}
            className={`rounded-3xl p-4 bg-gradient-to-br ${s.color} text-white shadow-lg`}>
            <div className="opacity-70 mb-2">{s.icon}</div>
            <p className="text-2xl font-black">{s.value}</p>
            <p className="text-xs font-bold text-white/80 mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Alerts */}
      {(outStock > 0 || lowStock > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-800 font-semibold">
            {outStock > 0 && <span className="text-rose-700 font-black">{outStock} صنف نفد تماماً </span>}
            {lowStock > 0 && <span className="text-amber-700 font-black">{lowStock} صنف بمخزون منخفض</span>}
            &nbsp;— يُنصح بإعادة الطلب
          </p>
        </div>
      )}

      {/* Search + category */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="بحث عن دواء..."
            className="w-full h-10 pr-10 pl-4 bg-white/80 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-400 outline-none" />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className="h-10 px-3 bg-white/80 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-purple-400 outline-none">
          {cats.map(c => <option key={c} value={c}>{c === "all" ? "الكل" : c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl overflow-hidden shadow-xl">
        <div className="grid grid-cols-12 px-5 py-3 bg-slate-50 border-b border-slate-100 text-xs font-black text-slate-500 gap-2">
          <p className="col-span-5">الدواء</p>
          <p className="col-span-2 text-center">المخزون</p>
          <p className="col-span-2 text-center">الأدنى</p>
          <p className="col-span-3 text-center">الحالة</p>
        </div>

        <div className="divide-y divide-slate-50/80">
          {filtered.map((item, i) => (
            <motion.div key={item.id}
              initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: i * 0.02 } }}
              className={`grid grid-cols-12 px-5 py-4 items-center gap-2 border-r-4 ${
                item.stock === 0 ? "border-r-rose-500 bg-rose-50/20" :
                item.stock < item.min ? "border-r-amber-400 bg-amber-50/20" : "border-r-emerald-400"
              }`}>

              <div className="col-span-5 min-w-0">
                <p className="font-bold text-slate-800 text-sm truncate">{item.name}</p>
                <p className="text-xs text-slate-400">{item.category}</p>
              </div>

              <div className="col-span-2 text-center">
                {editing === item.id ? (
                  <input type="number" value={editQty} onChange={e => setEditQty(e.target.value)}
                    autoFocus className="w-full text-center h-9 border-2 border-purple-400 rounded-xl text-sm font-black outline-none bg-purple-50" />
                ) : (
                  <p className={`text-lg font-black ${
                    item.stock === 0 ? "text-rose-600" :
                    item.stock < item.min ? "text-amber-600" : "text-emerald-600"
                  }`}>{item.stock}</p>
                )}
                <p className="text-[10px] text-slate-400">{item.unit}</p>
              </div>

              <div className="col-span-2 text-center">
                <p className="text-sm font-bold text-slate-400">{item.min}</p>
              </div>

              <div className="col-span-3 flex items-center justify-center gap-1.5">
                {editing === item.id ? (
                  <>
                    <button onClick={() => saveQty(item.id)}
                      className="p-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors">
                      <Save className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setEditing(null)}
                      className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${
                      item.stock === 0 ? "bg-rose-100 text-rose-700" :
                      item.stock < item.min ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                    }`}>
                      {item.stock === 0 ? "نفد" : item.stock < item.min ? "منخفض" : "متوفر"}
                    </span>
                    <button onClick={() => { setEditing(item.id); setEditQty(String(item.stock)); }}
                      className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-colors">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
            onClick={() => setShowAdd(false)}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="w-full bg-white rounded-t-[2rem] p-6 shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-5" />
              <h3 className="font-black text-slate-800 text-lg mb-5 text-center">إضافة دواء للمخزون</h3>
              <div className="space-y-3 mb-5">
                <input value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})}
                  placeholder="✏️ اسم الدواء والجرعة (مثال: Paracetamol 500mg)"
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-400 outline-none" />
                <div className="grid grid-cols-2 gap-3">
                  <input value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}
                    placeholder="الفئة العلاجية"
                    className="h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-400 outline-none" />
                  <input value={newItem.unit} onChange={e => setNewItem({...newItem, unit: e.target.value})}
                    placeholder="الوحدة (علبة، أمبول...)"
                    className="h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-400 outline-none" />
                  <input type="number" value={newItem.stock} onChange={e => setNewItem({...newItem, stock: e.target.value})}
                    placeholder="الكمية الحالية"
                    className="h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-400 outline-none" />
                  <input type="number" value={newItem.min} onChange={e => setNewItem({...newItem, min: e.target.value})}
                    placeholder="الحد الأدنى للتنبيه"
                    className="h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-400 outline-none" />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={addItem} disabled={!newItem.name}
                  className="flex-1 h-12 rounded-2xl bg-purple-500 text-white font-bold disabled:opacity-40">
                  <CheckCircle className="w-4 h-4 inline mr-2" /> إضافة للمخزون
                </button>
                <button onClick={() => setShowAdd(false)}
                  className="h-12 px-5 rounded-2xl border border-slate-200 text-slate-600 font-bold">
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
