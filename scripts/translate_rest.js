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

// 1. Doctor Requests
translateFile('apps/doctor/src/app/(dashboard)/requests/page.tsx', {
  'طلبات المرضى': 'Demandes des patients',
  'تحتاج لموافقتك': 'Nécessite votre approbation',
  'مريض': 'Patient',
  ' 🩺 وصفة': ' 🩺 Ordonnance',
  ' 🧪 تحليل': ' 🧪 Analyse',
  ' 🔁 روتيني': ' 🔁 Routine',
  ' 🚨 عاجل': ' 🚨 Urgent',
  'بث عام': 'Diffusion générale',
  'التحاليل المطلوبة:': 'Analyses demandées :',
  'ملاحظة المريض: ': 'Note du patient : ',
  ' موافقة': ' Approuver',
  ' تعديل': ' Modifier',
  ' رفض': ' Refuser',
  'لا توجد طلبات في الانتظار': 'Aucune demande en attente',
  'أنت متصل بالشبكة. أي طلب جديد من مريض سيظهر هنا فوراً.': 'Vous êtes en ligne. Toute nouvelle demande apparaîtra ici.',
  'تأكيد الموافقة': "Confirmer l'approbation",
  'تأكيد الرفض': 'Confirmer le refus',
  'تعديل الطلب': 'Modifier la demande',
  'الأدوية الموصوفة': 'Médicaments prescrits',
  'إلغاء': 'Annuler',
  'إضافة دواء آخر': 'Ajouter un médicament',
  'حذف هذا الدواء': 'Supprimer ce médicament'
});

// 2. Doctor Appointments
translateFile('apps/doctor/src/app/(dashboard)/appointments/page.tsx', {
  'إدارة المواعيد': 'Gestion des Rendez-vous',
  'قم بتحديد تواريخ المواعيد والرد على المرضى': 'Définissez les dates de rendez-vous et répondez aux patients',
  'لا توجد طلبات مواعيد': 'Aucune demande de rendez-vous',
  'لم يقم أي مريض بطلب موعد منك حتى الآن.': "Aucun patient n'a demandé de rendez-vous pour le moment.",
  'المواعيد القادمة': 'Rendez-vous à venir'
});

// 3. Lab Requests
translateFile('apps/lab/src/app/(dashboard)/requests/page.tsx', {
  'طلبات التحليل': "Demandes d'analyse",
  'تظهر هنا فقط الطلبات التي أرسلها المرضى مباشرة إلى مختبرك.': 'Seules les demandes envoyées par les patients directement à votre laboratoire apparaissent ici.',
  'صلاحياتك كمختبر \\(RBAC\\)': 'Vos autorisations en tant que laboratoire (RBAC)',
  'يمكنك تحديث الحالة ورفع النتائج.': 'Vous pouvez mettre à jour le statut et télécharger les résultats.',
  'لا يمكنك تعديل قائمة التحاليل المطلوبة.': 'Vous ne pouvez pas modifier la liste des analyses demandées.',
  'لا ترى طلبات مختبرات أخرى — فقط ما أُرسل إليك مباشرة.': 'Vous ne voyez pas les demandes des autres laboratoires — uniquement celles envoyées directement.',
  'لا توجد طلبات تحاليل حالياً': "Aucune demande d'analyse actuellement",
  'ستظهر هنا الطلبات التي يرسلها المرضى إلى مختبركم مباشرة.': 'Les demandes envoyées par les patients apparaîtront ici.'
});

// 4. Pharmacy Requests
translateFile('apps/pharmacy/src/app/(dashboard)/prescriptions/page.tsx', {
  'طلبات الوصفات الطبية': "Demandes d'ordonnances",
  'تظهر هنا الطلبات التي أرسلها المرضى مباشرة إلى صيدليتك.': 'Les demandes envoyées directement à votre pharmacie apparaissent ici.',
  'صلاحياتك كصيدلي \\(RBAC\\)': 'Vos autorisations en tant que pharmacien (RBAC)',
  'يمكنك تحديد توفر الأدوية وتسعيرها.': 'Vous pouvez indiquer la disponibilité des médicaments et leur prix.',
  'لا يمكنك تعديل محتوى الوصفة الطبية.': "Vous ne pouvez pas modifier le contenu de l'ordonnance.",
  'لا ترى طلبات صيدليات أخرى — فقط ما أُرسل إليك مباشرة.': 'Vous ne voyez pas les demandes des autres pharmacies.',
  'لا توجد طلبات حالياً': 'Aucune demande actuellement',
  'ستظهر هنا الطلبات التي يرسلها المرضى إلى صيدليتكم مباشرة.': 'Les demandes envoyées par les patients apparaîtront ici.'
});

console.log("Translation done.");
