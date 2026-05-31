-- ================================================================
--  FIX ENCODING: إصلاح الأسماء المخربشة
--  شغّل هذا في Supabase SQL Editor
-- ================================================================

-- ❶ إصلاح الأسماء في جدول profiles
UPDATE public.profiles SET
  full_name = 'كريم بوعزيز',
  address   = 'الجزائر العاصمة، بن عكنون'
WHERE id = '11111111-1111-1111-1111-111111111111';

UPDATE public.profiles SET
  full_name = 'نادية خالد',
  address   = 'وهران، المقطع'
WHERE id = 'aaaa1111-1111-1111-1111-111111111111';

UPDATE public.profiles SET
  full_name = 'د. أمين ساوي',
  specialty = 'طب عام وأمراض الدم',
  address   = 'الجزائر العاصمة'
WHERE id = '22222222-2222-2222-2222-222222222222';

UPDATE public.profiles SET
  full_name = 'د. سارة منصوري',
  specialty = 'أمراض القلب والشرايين',
  address   = 'وهران'
WHERE id = 'bbbb2222-2222-2222-2222-222222222222';

UPDATE public.profiles SET
  full_name = 'مختبرات ابن سينا',
  address   = 'الجزائر العاصمة، الأبيار'
WHERE id = '33333333-3333-3333-3333-333333333333';

UPDATE public.profiles SET
  full_name = 'صيدلية الأمل',
  address   = 'الجزائر العاصمة، باب الواد'
WHERE id = '44444444-4444-4444-4444-444444444444';

UPDATE public.profiles SET
  full_name = 'مدير النظام'
WHERE id = '55555555-5555-5555-5555-555555555555';

-- ❷ إصلاح الأسماء في auth.users (raw_user_meta_data)
UPDATE auth.users SET
  raw_user_meta_data = raw_user_meta_data
    || '{"full_name":"كريم بوعزيز"}'::jsonb
WHERE id = '11111111-1111-1111-1111-111111111111';

UPDATE auth.users SET
  raw_user_meta_data = raw_user_meta_data
    || '{"full_name":"نادية خالد"}'::jsonb
WHERE id = 'aaaa1111-1111-1111-1111-111111111111';

UPDATE auth.users SET
  raw_user_meta_data = raw_user_meta_data
    || '{"full_name":"د. أمين ساوي"}'::jsonb
WHERE id = '22222222-2222-2222-2222-222222222222';

UPDATE auth.users SET
  raw_user_meta_data = raw_user_meta_data
    || '{"full_name":"د. سارة منصوري"}'::jsonb
WHERE id = 'bbbb2222-2222-2222-2222-222222222222';

UPDATE auth.users SET
  raw_user_meta_data = raw_user_meta_data
    || '{"full_name":"مختبرات ابن سينا"}'::jsonb
WHERE id = '33333333-3333-3333-3333-333333333333';

UPDATE auth.users SET
  raw_user_meta_data = raw_user_meta_data
    || '{"full_name":"صيدلية الأمل"}'::jsonb
WHERE id = '44444444-4444-4444-4444-444444444444';

UPDATE auth.users SET
  raw_user_meta_data = raw_user_meta_data
    || '{"full_name":"مدير النظام"}'::jsonb
WHERE id = '55555555-5555-5555-5555-555555555555';

-- ❸ تحقق من النتيجة
SELECT id, role, full_name, specialty, address FROM public.profiles ORDER BY role;
