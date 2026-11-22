import Link from "next/link";
import { Shield, ArrowRight, Lock, UserCheck, Trash2, Mail } from "lucide-react";

export const metadata = {
  title: "سياسة الخصوصية وحماية البيانات | منصة عناية",
  description: "سياسة الخصوصية وشروط الاستخدام وحماية البيانات الشخصية والطبية لمنصة وتطبيق عناية للمرضى.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-10">
        
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-6 mb-8">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">سياسة الخصوصية وحماية البيانات</h1>
            <p className="text-sm text-slate-500 mt-1">تطبيق ومنصة عناية للمرضى (Enaya Patient) - آخر تحديث: نوفمبر 2026</p>
          </div>
        </div>

        <div className="space-y-8 text-slate-700 leading-relaxed text-sm sm:text-base">
          
          {/* المقدمة */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              1. مقدمة والتزام
            </h2>
            <p>
              نحن في مشروع <strong>عناية (Enaya)</strong> نولي سرية وخصوصية بيانات المرضى والمستخدمين أهمية قصوى.
              توضح هذه السياسة كيفية جمع البيانات الطبية والشخصية واستخدامها وتخزينها وحمايتها عند استخدامك لمنصة الويب أو تطبيق الأندرويد.
            </p>
          </section>

          {/* البيانات المجمعة */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              2. نوع البيانات التي نجمعها
            </h2>
            <ul className="list-disc list-inside space-y-2 pr-2 text-slate-600">
              <li><strong>البيانات الشخصية:</strong> الاسم، البريد الإلكتروني، رقم الهاتف، وتاريخ الميلاد.</li>
              <li><strong>البيانات الطبية والصحية:</strong> المواعيد الطبية، الوصفات الدوائية الإلكترونية، نتائج الفحوصات والتحاليل المخبرية، والتاريخ الصحي المسجل.</li>
              <li><strong>البيانات التقنية:</strong> معلومات تسجيل الدخول، معرفات الجلسة الآمنة، وسجلات التفاعل داخل التطبيق لتحسين الأداء.</li>
            </ul>
          </section>

          {/* الغرض من الاستخدام */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              3. الغرض من معالجة البيانات
            </h2>
            <p className="mb-2">تُستخدم البيانات المدخلة حصراً للأغراض الصحية والطبية المباشرة:</p>
            <ul className="list-disc list-inside space-y-2 pr-2 text-slate-600">
              <li>تسهيل حجز وإدارة المواعيد مع الأطباء المعتمدين في النظام.</li>
              <li>تمكين المريض من استعراض ومتابعة وصفاته الطبية ونتائج التحاليل.</li>
              <li>تقديم خدمة المساعد الذكي للإجابة عن الأسئلة الطبية العامة وتوجيه المريض.</li>
              <li><strong>تعهد صارم:</strong> لا نقوم ببيع أو مشاركة أو تأجير أي بيانات طبية أو شخصية لأي طرف ثالث أو لأغراض إعلانية على الإطلاق.</li>
            </ul>
          </section>

          {/* حماية وتشفير البيانات */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Lock className="w-5 h-5 text-emerald-600" />
              4. الأمان وتشفير البيانات
            </h2>
            <p>
              يتم حفظ وتخزين جميع البيانات عبر بروتوكولات تشفير قياسية (HTTPS / SSL / TLS) وقواعد بيانات سحابية مشفرة 
              (Row-Level Security) تضمن عدم وصول أي شخص غير مخول أو طبيب غير معني إلى السجل الصحي للمريض.
            </p>
          </section>

          {/* حقوق المستخدم وحذف الحساب */}
          <section className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-5">
            <h2 className="text-lg font-bold text-emerald-900 flex items-center gap-2 mb-3">
              <Trash2 className="w-5 h-5 text-emerald-700" />
              5. حقوق المستخدم وسياسة حذف الحساب والبيانات (Account Deletion)
            </h2>
            <p className="text-emerald-800 mb-3">
              وفقاً لسياسات متجر Google Play وحقوق حماية البيانات، يحق لأي مستخدم في أي وقت طلب حذف حسابه وجميع بياناته المرتبطة من خوادمنا:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pr-2 text-emerald-900 text-sm">
              <li>يمكنك طلب حذف الحساب مباشرة من داخل التطبيق عبر صفحة <strong>الإعدادات (Settings)</strong>.</li>
              <li>أو عبر إرسال بريد إلكتروني مباشر إلى إدارة النظام على: <span className="font-mono font-bold">contact@3inaya.com</span> أو <span className="font-mono font-bold">admin@test.com</span> متضمناً البريد المسجل به.</li>
              <li>يتم حذف الحساب وكافة السجلات الشخصية بشكل نهائي وغير قابل للاسترجاع خلال 48 ساعة من استلام الطلب.</li>
            </ul>
          </section>

          {/* التواصل */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Mail className="w-5 h-5 text-slate-600" />
              6. معلومات الاتصال والاستفسارات
            </h2>
            <p className="text-slate-600">
              إذا كان لديك أي استفسار أو اقتراح حول سياسة الخصوصية أو بياناتك الطبية، يمكنك مراسلتنا عبر:
              <br />
              مشروع <strong>عناية (Enaya Platform)</strong>
              <br />
              البريد الإلكتروني للدعم الفني: <span className="font-mono text-emerald-700">support@3inaya.com</span>
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 pt-6 mt-10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link 
            href="/login"
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold text-sm"
          >
            <ArrowRight className="w-4 h-4" />
            العودة لصفحة تسجيل الدخول
          </Link>
          <span className="text-xs text-slate-400">© 2026 منصة عناية الطبية. جميع الحقوق محفوظة.</span>
        </div>

      </div>
    </div>
  );
}
