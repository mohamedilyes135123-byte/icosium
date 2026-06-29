"use client";

interface DatePickerFieldProps {
  value: string;           // YYYY-MM-DD
  onChange: (val: string) => void;
  label?: string;
  required?: boolean;
}

const MONTHS_AR = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

function daysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}

export default function DatePickerField({ value, onChange, label, required }: DatePickerFieldProps) {
  const parts = value ? value.split("-") : ["", "", ""];
  const year  = parts[0] || "";
  const month = parts[1] || "";
  const day   = parts[2] || "";

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const maxDay  = year && month ? daysInMonth(parseInt(month), parseInt(year)) : 31;
  const days    = Array.from({ length: maxDay }, (_, i) => i + 1);

  const update = (y: string, m: string, d: string) => {
    if (y && m && d) {
      const md = daysInMonth(parseInt(m), parseInt(y));
      const safeD = Math.min(parseInt(d), md).toString().padStart(2, "0");
      onChange(`${y}-${m.padStart(2, "0")}-${safeD}`);
    } else {
      onChange("");
    }
  };

  const sel = `
    flex-1 h-12 px-3 bg-white/70 border border-slate-200 rounded-xl
    focus:ring-2 focus:ring-emerald-400 outline-none text-slate-800 text-sm
    appearance-none cursor-pointer
  `;

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-600">
          📅 {label}{required && <span className="text-rose-500">*</span>}
        </label>
      )}
      {/* RTL order: Year → Month → Day */}
      <div className="flex gap-2" dir="rtl">
        {/* Year */}
        <select
          value={year}
          onChange={e => update(e.target.value, month, day)}
          className={sel}
          required={required}
        >
          <option value="">السنة</option>
          {years.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        {/* Month */}
        <select
          value={month}
          onChange={e => update(year, e.target.value, day)}
          className={sel}
          required={required}
        >
          <option value="">الشهر</option>
          {months.map(m => (
            <option key={m} value={m}>{MONTHS_AR[m - 1]}</option>
          ))}
        </select>

        {/* Day */}
        <select
          value={day}
          onChange={e => update(year, month, e.target.value)}
          className={sel}
          required={required}
        >
          <option value="">اليوم</option>
          {days.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {value && (
        <p className="text-xs text-emerald-600 font-semibold">
          ✓ {new Date(value + "T00:00:00").toLocaleDateString("ar-DZ", {
            day: "numeric", month: "long", year: "numeric"
          })}
        </p>
      )}
    </div>
  );
}
