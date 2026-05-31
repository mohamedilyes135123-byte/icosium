const fs = require('fs');

const path = 'apps/doctor/src/app/login/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add imports
content = content.replace(
  'import { useRouter } from "next/navigation";',
  'import { useRouter } from "next/navigation";\nimport { useLanguage } from "@/components/LanguageContext";'
);

// 2. Consume useLanguage hook
content = content.replace(
  'export default function LoginPage() {',
  'export default function LoginPage() {\n  const { t, lang } = useLanguage();'
);

// 3. Replace text
content = content.replace(
  /<p className="text-blue-600 font-semibold text-sm mt-1">[^<]+<\/p>/,
  '<p className="text-blue-600 font-semibold text-sm mt-1">{lang === "ar" ? "طبيبك في بيتك — بوابة الأطباء" : "Votre médecin chez vous — Portail Médecin"}</p>'
);

content = content.replace(
  /منصة مرخصة من وزارة الصحة الجزائرية/,
  '{lang === "ar" ? "منصة مرخصة من وزارة الصحة الجزائرية" : "Plateforme agréée par le Ministère de la Santé"}'
);

content = content.replace(
  />تسجيل الدخول</,
  '>{lang === "ar" ? "تسجيل الدخول" : "Se connecter"}<'
);

content = content.replace(
  />إنشاء حساب جديد</,
  '>{lang === "ar" ? "إنشاء حساب جديد" : "Créer un compte"}<'
);

content = content.replace(
  /نسيت كلمة المرور؟/,
  '{lang === "ar" ? "نسيت كلمة المرور؟" : "Mot de passe oublié ?"}'
);

content = content.replace(
  /"دخول العيادة الرقمية →"/,
  'lang === "ar" ? "دخول العيادة الرقمية →" : "Entrer dans la clinique numérique →"'
);

content = content.replace(
  /البريد الإلكتروني/g,
  '{lang === "ar" ? "البريد الإلكتروني" : "Email"}'
);
content = content.replace(
  /كلمة المرور/g,
  '{lang === "ar" ? "كلمة المرور" : "Mot de passe"}'
);


fs.writeFileSync(path, content, 'utf8');
console.log("Updated Doctor Login Page successfully!");
