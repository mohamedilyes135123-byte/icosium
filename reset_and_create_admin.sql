-- ================================================================
-- 🧹 حذف جميع المستخدمين ما عدا Admin + إصلاح profile الـ Admin
-- ================================================================
-- شغّل هذا في: Supabase → SQL Editor → New Query
-- ================================================================

-- STEP 1: حذف بيانات المستخدمين الآخرين (ليس الأدمن)
-- ================================================================

DELETE FROM public.audit_log     WHERE TRUE;
DELETE FROM public.audit_logs    WHERE TRUE;
DELETE FROM public.notifications WHERE TRUE;
DELETE FROM public.pharmacy_orders   WHERE TRUE;
DELETE FROM public.lab_results       WHERE TRUE;
DELETE FROM public.lab_requests      WHERE TRUE;
DELETE FROM public.prescriptions     WHERE TRUE;
DELETE FROM public.doctor_responses  WHERE TRUE;
DELETE FROM public.medical_requests  WHERE TRUE;
DELETE FROM public.vitals            WHERE TRUE;
DELETE FROM public.appointments      WHERE TRUE;

-- حذف profiles لغير الـ Admin
DELETE FROM public.profiles
WHERE id NOT IN (
  SELECT id FROM auth.users WHERE email = 'admin@3inaya.com'
);

-- STEP 2: حذف جميع auth.users ما عدا الـ Admin
-- ================================================================
DELETE FROM auth.users
WHERE email != 'admin@3inaya.com';

-- STEP 3: تأكد أن الـ Admin profile موجود وصحيح
-- ================================================================
INSERT INTO public.profiles (id, role, full_name, phone, verified, approval_status)
SELECT 
  id,
  'admin'::public.app_role,
  'مسؤول النظام',
  '0555000000',
  true,
  'approved'
FROM auth.users 
WHERE email = 'admin@3inaya.com'
ON CONFLICT (id) DO UPDATE SET
  role            = 'admin',
  full_name       = 'مسؤول النظام',
  verified        = true,
  approval_status = 'approved';

-- STEP 4: تحقق من النتيجة النهائية
-- ================================================================
SELECT 
  u.email,
  p.role,
  p.full_name,
  p.approval_status,
  p.verified,
  u.created_at
FROM auth.users u
JOIN public.profiles p ON p.id = u.id;
