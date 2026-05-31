export const translations = {
  ar: {
    // Sidebar navigation
    dashboard: "لوحة التحكم",
    requests: "طلبات التحليل",
    results: "النتائج",
    settings: "الإعدادات",
    logout: "تسجيل الخروج",
    platformTitle: "نظام المختبر",

    // Dashboard content
    allRequests: "إجمالي الطلبات",
    pendingRequests: "بانتظار المعالجة",
    processingRequests: "جاري التحليل",
    completedRequests: "مكتملة",
    recentRequests: "آخر الطلبات",
    viewAll: "عرض الكل",
    noRequests: "لم تصل أي طلبات بعد",
    noRequestsDesc: "ستظهر هنا طلبات المرضى عند إرسالها لمختبركم",
    quickActions: "إجراءات سريعة",
    manageRequests: "إدارة الطلبات",
    newRequests: "طلب جديد",
    uploadedResults: "النتائج المرفوعة",
    completed: "مكتملة",
    
    // Status labels
    statusCompleted: "مكتمل",
    statusProcessing: "جاري",
    statusPending: "انتظار",
    
    // Greetings
    morning: "صباح الخير",
    afternoon: "مساء الخير",
    evening: "مساء النور",
    
    // Approval status
    approved: "معتمد ✅",
    underReview: "قيد المراجعة",
    waitingProcessing: "طلب بانتظار المعالجة",
    noNewRequests: "لا توجد طلبات جديدة حالياً",

    // Dashboard
    myLab: "مختبر التحاليل",
    requestBy: "طلب:",

    // Requests page
    requestsTitle: "طلبات التحاليل",
    requestsSubtitle: "تظهر هنا فقط الطلبات التي أرسلها المرضى مباشرة إلى مختبركم.",
    rbacNoticeTitle: "صلاحياتك كمختبر (RBAC)",
    rbacNoticeLine1: "✅ يمكنك تحديث الحالة ورفع النتائج.",
    rbacNoticeLine2: "❌ لا يمكنك تعديل قائمة التحاليل المطلوبة.",
    rbacNoticeLine3: "🔐 لا ترى طلبات مختبرات أخرى — فقط ما أُرسل إليك مباشرة.",
    reqStatusPending: "قيد الانتظار",
    reqStatusProcessing: "جاري التحليل",
    reqStatusCompleted: "النتائج جاهزة",
    reqStatusCancelled: "ملغى",
    testsListLabel: "التحاليل المطلوبة (للقراءة فقط)",
    requestedBy: "طلب بواسطة:",
    verifyCode: "رمز التحقق",
    resultsUploaded: "تم رفع النتائج",
    startAnalysis: "بدء التحليل",
    uploadResults: "رفع النتائج",
    resultsSentToPatient: "النتائج أُرسلت للمريض",
    noAnalysisRequests: "لا توجد طلبات تحاليل حالياً",
    noAnalysisSubtitle: "ستظهر هنا الطلبات التي يرسلها المرضى إلى مختبركم مباشرة.",
    patientLabel: "مريض",
    deleteConfirm: "هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.",
    deleteError: "حدث خطأ أثناء الحذف: ",

    // Upload modal
    uploadModalTitle: "رفع نتائج التحليل",
    uploadModalSubtitle: "ستُرسل للمريض فوراً بعد الرفع",
    resultSummaryLabel: "ملخص النتائج",
    resultSummaryPlaceholder: "مثال: سكر الدم الصائم 110 mg/dL — في النطاق الطبيعي...",
    resultFileLinkLabel: "رابط ملف النتائج (اختياري)",
    resultFileLinkPlaceholder: "https://... (رابط PDF أو صورة)",
    uploadAndSendBtn: "✅ رفع النتائج وإرسالها للمريض",
    uploading: "جاري الرفع...",
    cancel: "إلغاء",

    // Results history page
    resultsTitle: "سجل النتائج المرفوعة",
    resultsSubtitle: "جميع نتائج التحاليل التي رفعتموها للمرضى",
    resultSent: "مُرسلة",
    requestedByLabel: "طلب بواسطة: ",
    resultSummary: "ملخص النتائج",
    viewResultFile: "عرض ملف النتائج",
    noResultsYet: "لم تُرفع أي نتائج بعد",
    noResultsSubtitle: "النتائج التي ترفعها للمرضى ستظهر هنا",

    // Settings page
    settingsTitle: "الإعدادات",
    settingsSubtitle: "إدارة حساب المختبر",
    settingsWip: "الإعدادات قيد التطوير",
    settingsWipDesc: "عذراً، صفحة الإعدادات للمختبر لا تزال قيد التطوير في هذه النسخة. سيتم إضافة جميع خيارات التحكم قريباً.",
  },
  fr: {
    // Sidebar navigation
    dashboard: "Tableau de bord",
    requests: "Demandes d'analyses",
    results: "Résultats",
    settings: "Paramètres",
    logout: "Déconnexion",
    platformTitle: "Système de Laboratoire",

    // Dashboard content
    allRequests: "Total des demandes",
    pendingRequests: "En attente",
    processingRequests: "En cours d'analyse",
    completedRequests: "Terminées",
    recentRequests: "Dernières demandes",
    viewAll: "Voir tout",
    noRequests: "Aucune demande reçue",
    noRequestsDesc: "Les demandes des patients apparaîtront ici",
    quickActions: "Actions rapides",
    manageRequests: "Gérer les demandes",
    newRequests: "Nouvelle demande",
    uploadedResults: "Résultats envoyés",
    completed: "Terminées",
    
    // Status labels
    statusCompleted: "Terminé",
    statusProcessing: "En cours",
    statusPending: "En attente",
    
    // Greetings
    morning: "Bonjour",
    afternoon: "Bon après-midi",
    evening: "Bonsoir",
    
    // Approval status
    approved: "Approuvé ✅",
    underReview: "En cours de révision",
    waitingProcessing: "demande(s) en attente",
    noNewRequests: "Aucune nouvelle demande",

    // Dashboard
    myLab: "Laboratoire d'analyses",
    requestBy: "Demande :",

    // Requests page
    requestsTitle: "Demandes d'analyses",
    requestsSubtitle: "Seules les demandes envoyées directement à votre laboratoire sont affichées ici.",
    rbacNoticeTitle: "Vos autorisations en tant que laboratoire (RBAC)",
    rbacNoticeLine1: "✅ Vous pouvez mettre à jour le statut et envoyer les résultats.",
    rbacNoticeLine2: "❌ Vous ne pouvez pas modifier la liste des analyses demandées.",
    rbacNoticeLine3: "🔐 Vous ne voyez que les demandes qui vous sont destinées.",
    reqStatusPending: "En attente",
    reqStatusProcessing: "En cours d'analyse",
    reqStatusCompleted: "Résultats prêts",
    reqStatusCancelled: "Annulé",
    testsListLabel: "Analyses demandées (lecture seule)",
    requestedBy: "Demandé par :",
    verifyCode: "Code de vérification",
    resultsUploaded: "Résultats envoyés",
    startAnalysis: "Commencer l'analyse",
    uploadResults: "Envoyer les résultats",
    resultsSentToPatient: "Résultats envoyés au patient",
    noAnalysisRequests: "Aucune demande d'analyse actuellement",
    noAnalysisSubtitle: "Les demandes envoyées par les patients apparaîtront ici.",
    patientLabel: "Patient",
    deleteConfirm: "Êtes-vous sûr de vouloir supprimer cette demande ? Cette action est irréversible.",
    deleteError: "Une erreur s'est produite lors de la suppression : ",

    // Upload modal
    uploadModalTitle: "Envoyer les résultats d'analyse",
    uploadModalSubtitle: "Ils seront envoyés au patient immédiatement",
    resultSummaryLabel: "Résumé des résultats",
    resultSummaryPlaceholder: "Ex : Glycémie à jeun 110 mg/dL — dans les valeurs normales...",
    resultFileLinkLabel: "Lien vers le fichier de résultats (optionnel)",
    resultFileLinkPlaceholder: "https://... (lien PDF ou image)",
    uploadAndSendBtn: "✅ Envoyer les résultats au patient",
    uploading: "Envoi en cours...",
    cancel: "Annuler",

    // Results history page
    resultsTitle: "Historique des résultats",
    resultsSubtitle: "Tous les résultats d'analyses envoyés aux patients",
    resultSent: "Envoyé",
    requestedByLabel: "Demandé par : ",
    resultSummary: "Résumé des résultats",
    viewResultFile: "Voir le fichier de résultats",
    noResultsYet: "Aucun résultat envoyé pour l'instant",
    noResultsSubtitle: "Les résultats que vous envoyez aux patients apparaîtront ici",

    // Settings page
    settingsTitle: "Paramètres",
    settingsSubtitle: "Gestion du compte laboratoire",
    settingsWip: "Paramètres en cours de développement",
    settingsWipDesc: "Désolé, la page des paramètres du laboratoire est encore en cours de développement. Toutes les options de gestion seront ajoutées prochainement.",
  }
};

export type TranslationKey = keyof typeof translations.ar;
