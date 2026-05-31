const fs = require('fs');

function translateFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Add import if missing
  if (!content.includes('useLanguage')) {
    content = content.replace('import { motion', 'import { useLanguage } from "@/components/LanguageContext";\nimport { motion');
    if (!content.includes('useLanguage')) {
      content = content.replace('import { useState', 'import { useLanguage } from "@/components/LanguageContext";\nimport { useState');
    }
  }

  // Add hook if missing
  if (!content.includes('const { lang, t } = useLanguage();')) {
    content = content.replace(/export default function \w+\(\) \{/, match => `${match}\n  const { lang, t } = useLanguage();`);
  }

  // Replace RTL
  content = content.replace(/dir="rtl"/g, 'dir={lang === "ar" ? "rtl" : "ltr"}');

  // Replace texts
  for (const [ar, fr] of Object.entries(replacements)) {
    const regexTextNode = new RegExp(`>\\s*${ar}\\s*<`, 'g');
    content = content.replace(regexTextNode, `>{lang === "ar" ? "${ar}" : "${fr}"}<`);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Translated ${filePath}`);
}

// Doctor Patients
translateFile('apps/doctor/src/app/(dashboard)/patients/page.tsx', {
  'ملفات مرضاي': 'Dossiers de mes patients',
  'مريض في القاعدة': 'patients dans la base',
  'وصفة': 'Ordonnance',
  'تحليل': 'Analyse',
  'لا توجد نتائج': 'Aucun résultat',
  'لم تصدر وصفات أو تحاليل بعد، أو البحث لا يطابق أي مريض': "Aucune ordonnance ou analyse, ou la recherche ne correspond à aucun patient",
  'الوصفات': 'Ordonnances',
  'التحاليل': 'Analyses',
  'لا توجد وصفات': 'Aucune ordonnance',
  'بانتظار المريض': 'En attente du patient',
  'صُرفت': 'Délivrée',
  'لا توجد طلبات تحاليل': "Aucune demande d'analyse",
  'مكتمل': 'Terminé',
  'جاري': 'En cours',
  'انتظار': 'En attente',
  'النتائج:': 'Résultats :',
  'تم رفع الملف': 'Fichier téléchargé'
});

// Doctor Prescriptions
translateFile('apps/doctor/src/app/(dashboard)/prescriptions/page.tsx', {
  'وصفاتي والتحاليل الموصوفة': 'Mes Ordonnances et Analyses',
  'سجل تاريخي لكل ما تم وصفه': 'Historique de toutes les prescriptions',
  'وصفة جديدة': 'Nouvelle Ordonnance',
  'وصفة طبية': 'Ordonnance médicale',
  'تحليل طبي': 'Analyse médicale',
  'إلى الصيدلية': 'À la pharmacie',
  'إلى المختبر': 'Au laboratoire',
  'لا توجد سجلات حالياً': 'Aucun enregistrement actuel',
  'قم بإنشاء وصفة جديدة لمرضاك': 'Créez une nouvelle ordonnance pour vos patients'
});

// Lab Results
translateFile('apps/lab/src/app/(dashboard)/results/page.tsx', {
  'النتائج المرفوعة': 'Résultats téléchargés',
  'تظهر هنا التحاليل التي قمت برفع نتائجها': 'Les analyses dont vous avez téléchargé les résultats apparaissent ici.',
  'التحاليل المنجزة:': 'Analyses réalisées :',
  'لا توجد نتائج مرفوعة': 'Aucun résultat téléchargé',
  'لم تقم برفع أي نتائج حتى الآن.': "Vous n'avez téléchargé aucun résultat pour le moment.",
  'ملاحظات المختبر:': 'Notes du laboratoire :'
});

// Pharmacy Inventory
translateFile('apps/pharmacy/src/app/(dashboard)/inventory/page.tsx', {
  'إدارة المخزون': 'Gestion des stocks',
  'قم بإدارة مخزون الأدوية والأسعار الخاصة بصيدليتك': 'Gérez le stock de médicaments et les prix de votre pharmacie',
  'لا توجد أدوية في المخزون': 'Aucun médicament en stock',
  'لم تقم بإضافة أي أدوية للمخزون بعد.': "Vous n'avez pas encore ajouté de médicaments au stock.",
  'الكمية المتوفرة:': 'Quantité disponible :'
});

console.log("Translation 2 done.");
