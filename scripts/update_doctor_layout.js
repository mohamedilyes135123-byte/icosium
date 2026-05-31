const fs = require('fs');

const path = 'apps/doctor/src/app/(dashboard)/layout.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add imports
content = content.replace(
  'import { createClient } from "@/lib/supabase/client";',
  'import { createClient } from "@/lib/supabase/client";\nimport { useLanguage } from "@/components/LanguageContext";\nimport { Globe } from "lucide-react";'
);

// 2. Consume useLanguage hook
content = content.replace(
  '  const supabase = createClient();',
  '  const supabase = createClient();\n  const { t, lang, setLang } = useLanguage();'
);

// 3. Update Title
content = content.replace(
  '<span className="tracking-wide">منصة الطبيب</span>',
  '<span className="tracking-wide">{t("platformTitle")}</span>'
);
// In case the arabic text is garbled, we fallback to Regex:
content = content.replace(
  /<span className="tracking-wide">[^<]+<\/span>/,
  '<span className="tracking-wide">{t("platformTitle")}</span>'
);

// 4. Update Nav Items
content = content.replace(/label="لوحة التحكم"/g, 'label={t("dashboard")}');
content = content.replace(/label="طلبات المرضى"/g, 'label={t("requests")}');
content = content.replace(/label="المواعيد"/g, 'label={t("appointments")}');
content = content.replace(/label="وصفاتي وتحاليلي"/g, 'label={t("prescriptions")}');
content = content.replace(/label="ملفات المرضى"/g, 'label={t("patients")}');
content = content.replace(/label="الإعدادات"/g, 'label={t("settings")}');

// In case the arabic text is garbled, use regex replacements for NavItem
// we know the order: dashboard, requests, appointments, prescriptions, patients, settings
// Let's replace label="..." with translation calls by matching href:
content = content.replace(/<NavItem href="\/dashboard" icon=\{<LayoutDashboard [^>]+>\} label="[^"]+" current=\{pathname\} \/>/, '<NavItem href="/dashboard" icon={<LayoutDashboard className="w-5 h-5"/>} label={t("dashboard")} current={pathname} />');
content = content.replace(/<NavItem href="\/requests" icon=\{<Calendar [^>]+>\} label="[^"]+" current=\{pathname\} \/>/, '<NavItem href="/requests" icon={<Calendar className="w-5 h-5"/>} label={t("requests")} current={pathname} />');
content = content.replace(/<NavItem href="\/requests" icon=\{<FileText [^>]+>\} label="[^"]+" current=\{pathname\} \/>/, '<NavItem href="/requests" icon={<FileText className="w-5 h-5"/>} label={t("requests")} current={pathname} />');
content = content.replace(/<NavItem href="\/appointments" icon=\{<Calendar [^>]+>\} label="[^"]+" current=\{pathname\} \/>/, '<NavItem href="/appointments" icon={<Calendar className="w-5 h-5"/>} label={t("appointments")} current={pathname} />');
content = content.replace(/<NavItem href="\/prescriptions" icon=\{<FileText [^>]+>\} label="[^"]+" current=\{pathname\} \/>/, '<NavItem href="/prescriptions" icon={<FileText className="w-5 h-5"/>} label={t("prescriptions")} current={pathname} />');
content = content.replace(/<NavItem href="\/patients" icon=\{<Users [^>]+>\} label="[^"]+" current=\{pathname\} \/>/, '<NavItem href="/patients" icon={<Users className="w-5 h-5"/>} label={t("patients")} current={pathname} />');
content = content.replace(/<NavItem href="\/settings" icon=\{<Settings [^>]+>\} label="[^"]+" current=\{pathname\} \/>/, '<NavItem href="/settings" icon={<Settings className="w-5 h-5"/>} label={t("settings")} current={pathname} />');

// 5. Update New Prescription
content = content.replace(
  /وصفة جديدة/,
  '{t("newPrescription")}'
);
content = content.replace(
  /ÙˆØµÙØ© Ø¬Ø¯ÙŠØ¯Ø©/, // Garbled fallback
  '{t("newPrescription")}'
);

// 6. Add Language Switcher before Logout
const languageSwitcher = `
          {/* Language Switcher */}
          <button 
            onClick={() => setLang(lang === "ar" ? "fr" : "ar")}
            className="w-full mb-2 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors text-sm font-bold border border-slate-200 bg-white/50 shadow-sm"
          >
            <Globe className="w-4 h-4"/>
            {lang === "ar" ? "Français" : "العربية"}
          </button>
`;

content = content.replace(
  /<button onClick=\{handleLogout\}/,
  languageSwitcher + '\n          <button onClick={handleLogout}'
);

// 7. Update Logout text
content = content.replace(
  /تسجيل الخروج/,
  '{t("logout")}'
);
content = content.replace(
  /ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬/, // Garbled fallback
  '{t("logout")}'
);

fs.writeFileSync(path, content, 'utf8');
console.log("Updated Doctor Dashboard Layout successfully!");
