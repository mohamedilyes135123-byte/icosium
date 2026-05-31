const fs = require('fs');

const path = 'apps/doctor/src/app/(dashboard)/dashboard/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add LanguageContext import
content = content.replace(
  'import Link from "next/link";',
  'import Link from "next/link";\nimport { useLanguage } from "@/components/LanguageContext";'
);

// 2. Consume useLanguage hook
content = content.replace(
  'export default function DoctorDashboardMobile() {',
  'export default function DoctorDashboardMobile() {\n  const { t } = useLanguage();'
);

// 3. Replace Arabic strings with t("key")
// 5 في الانتظار -> 5 {t("waiting")}
content = content.replace(/5 في الانتظار/, '5 {t("waiting")}');
content = content.replace(/حالات الطوارئ/, '{t("emergencyCases")}');
content = content.replace(/عليك مراجعة طلبات الاستشارة عن بعد فوراً\./, '{t("emergencyDesc")}');
content = content.replace(/استعراض الحالات/, '{t("reviewCases")}');
content = content.replace(/نظرة عامة \(اليوم\)/, '{t("overviewToday")}');
content = content.replace(/title="مرضى اليوم"/g, 'title={t("todayPatients")}');
content = content.replace(/مرضى اليوم/g, '{t("todayPatients")}');
content = content.replace(/title="مواعيد قادمة"/g, 'title={t("upcomingAppointments")}');
content = content.replace(/مواعيد قادمة/g, '{t("upcomingAppointments")}');
content = content.replace(/title="وصفات مكتملة"/g, 'title={t("completedPrescriptions")}');
content = content.replace(/وصفات مكتملة/g, '{t("completedPrescriptions")}');
content = content.replace(/title="نتائج تحاليل"/g, 'title={t("labResults")}');
content = content.replace(/نتائج تحاليل/g, '{t("labResults")}');
content = content.replace(/مسح بطاقة الهوية/, '{t("scanId")}');
content = content.replace(/سحب ملف المريض الموحد إلكترونياً/, '{t("scanIdDesc")}');

// 4. Improve contrast in QuickStat cards
// Change text-slate-500 to text-slate-600 or text-slate-700
content = content.replace(/text-slate-500 text-\[10px\]/g, 'text-slate-700 text-[11px]');

fs.writeFileSync(path, content, 'utf8');
console.log("Updated Doctor Dashboard content successfully!");
