const fs = require('fs');

const path = 'apps/lab/src/app/(dashboard)/layout.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add imports
content = content.replace(
  'import { usePathname } from "next/navigation";',
  'import { usePathname } from "next/navigation";\nimport { useLanguage } from "@/components/LanguageContext";\nimport { Globe } from "lucide-react";'
);

// 2. Consume useLanguage hook
content = content.replace(
  '  const pathname = usePathname();',
  '  const pathname = usePathname();\n  const { t, lang, setLang } = useLanguage();'
);

// 3. Update Title
content = content.replace(
  '<span className="tracking-wide">نظام المختبر</span>',
  '<span className="tracking-wide">{t("platformTitle")}</span>'
);
content = content.replace(
  /<span className="tracking-wide">[^<]+<\/span>/,
  '<span className="tracking-wide">{t("platformTitle")}</span>'
);

// 4. Update Nav Items
content = content.replace(/<NavItem href="\/dashboard" icon=\{<LayoutDashboard [^>]+>\} label="[^"]+" current=\{pathname\} \/>/, '<NavItem href="/dashboard" icon={<LayoutDashboard className="w-5 h-5"/>} label={t("dashboard")} current={pathname} />');
content = content.replace(/<NavItem href="\/requests" icon=\{<ClipboardList [^>]+>\} label="[^"]+" current=\{pathname\} \/>/, '<NavItem href="/requests" icon={<ClipboardList className="w-5 h-5"/>} label={t("requests")} current={pathname} />');
content = content.replace(/<NavItem href="\/results" icon=\{<Beaker [^>]+>\} label="[^"]+" current=\{pathname\} \/>/, '<NavItem href="/results" icon={<Beaker className="w-5 h-5"/>} label={t("results")} current={pathname} />');
content = content.replace(/<NavItem href="\/settings" icon=\{<Settings [^>]+>\} label="[^"]+" current=\{pathname\} \/>/, '<NavItem href="/settings" icon={<Settings className="w-5 h-5"/>} label={t("settings")} current={pathname} />');


// 6. Add Language Switcher before Logout
const languageSwitcher = `
          {/* Language Switcher */}
          <button 
            onClick={() => setLang(lang === "ar" ? "fr" : "ar")}
            className="w-full mb-2 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-sm font-bold border border-indigo-100 bg-white/50 shadow-sm"
          >
            <Globe className="w-4 h-4"/>
            {lang === "ar" ? "Français" : "العربية"}
          </button>
`;

content = content.replace(
  /<button className="w-full flex items-center justify-center/,
  languageSwitcher + '\n          <button className="w-full flex items-center justify-center'
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
console.log("Updated Lab Dashboard Layout successfully!");
