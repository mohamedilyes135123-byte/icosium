-- ================================================================
--  3INAYA — Real Data Seed (Full Workflow Test)
--  Covers: Patient, Doctor, Lab, Pharmacy, Admin
--  Password for all: 123456
-- ================================================================

-- CLEAN SLATE
DELETE FROM public.lab_results;
DELETE FROM public.pharmacy_orders;
DELETE FROM public.lab_requests;
DELETE FROM public.prescriptions;
DELETE FROM public.doctor_responses;
DELETE FROM public.medical_requests;
DELETE FROM public.notifications;
DELETE FROM public.audit_logs;
DELETE FROM public.profiles WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  'aaaa1111-1111-1111-1111-111111111111',
  'bbbb2222-2222-2222-2222-222222222222'
);
-- Also delete by email (handles leftover users with different IDs)
DELETE FROM auth.identities WHERE provider_id IN (
  'patient@test.com','patient2@test.com',
  'doctor@test.com','doctor2@test.com',
  'labo@test.com','pharmacie@test.com','admin@test.com'
);
DELETE FROM auth.users WHERE email IN (
  'patient@test.com','patient2@test.com',
  'doctor@test.com','doctor2@test.com',
  'labo@test.com','pharmacie@test.com','admin@test.com'
);
-- Delete by ID (safety)
DELETE FROM auth.identities WHERE user_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  'aaaa1111-1111-1111-1111-111111111111',
  'bbbb2222-2222-2222-2222-222222222222'
);
DELETE FROM auth.users WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  'aaaa1111-1111-1111-1111-111111111111',
  'bbbb2222-2222-2222-2222-222222222222'
);

-- ================================================================
-- 1. AUTH USERS  (password: Test@1234)
-- ================================================================
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES
-- Patient 1: Karim
('00000000-0000-0000-0000-000000000000',
 '11111111-1111-1111-1111-111111111111',
 'authenticated','authenticated','patient@test.com',
 crypt('123456', gen_salt('bf')),
 NOW(),
 '{"provider":"email","providers":["email"]}',
 '{"role":"patient","full_name":"كريم بوعزيز","phone":"0551122334"}',
 NOW(), NOW(), '','','',''),

-- Patient 2: Nadia
('00000000-0000-0000-0000-000000000000',
 'aaaa1111-1111-1111-1111-111111111111',
 'authenticated','authenticated','patient2@test.com',
 crypt('123456', gen_salt('bf')),
 NOW(),
 '{"provider":"email","providers":["email"]}',
 '{"role":"patient","full_name":"نادية خالد","phone":"0661234567"}',
 NOW(), NOW(), '','','',''),

-- Doctor: Dr. Amine
('00000000-0000-0000-0000-000000000000',
 '22222222-2222-2222-2222-222222222222',
 'authenticated','authenticated','doctor@test.com',
 crypt('123456', gen_salt('bf')),
 NOW(),
 '{"provider":"email","providers":["email"]}',
 '{"role":"doctor","full_name":"د. أمين صاوي","phone":"0770987654"}',
 NOW(), NOW(), '','','',''),

-- Doctor 2: Dr. Sara
('00000000-0000-0000-0000-000000000000',
 'bbbb2222-2222-2222-2222-222222222222',
 'authenticated','authenticated','doctor2@test.com',
 crypt('123456', gen_salt('bf')),
 NOW(),
 '{"provider":"email","providers":["email"]}',
 '{"role":"doctor","full_name":"د. سارة منصوري","phone":"0550112233"}',
 NOW(), NOW(), '','','',''),

-- Lab: Ibn Sina
('00000000-0000-0000-0000-000000000000',
 '33333333-3333-3333-3333-333333333333',
 'authenticated','authenticated','labo@test.com',
 crypt('123456', gen_salt('bf')),
 NOW(),
 '{"provider":"email","providers":["email"]}',
 '{"role":"lab","full_name":"مختبرات ابن سينا","phone":"0771234567"}',
 NOW(), NOW(), '','','',''),

-- Pharmacy: Al Amal
('00000000-0000-0000-0000-000000000000',
 '44444444-4444-4444-4444-444444444444',
 'authenticated','authenticated','pharmacie@test.com',
 crypt('123456', gen_salt('bf')),
 NOW(),
 '{"provider":"email","providers":["email"]}',
 '{"role":"pharmacy","full_name":"صيدلية الأمل","phone":"0553456789"}',
 NOW(), NOW(), '','','',''),

-- Admin
('00000000-0000-0000-0000-000000000000',
 '55555555-5555-5555-5555-555555555555',
 'authenticated','authenticated','admin@test.com',
 crypt('123456', gen_salt('bf')),
 NOW(),
 '{"provider":"email","providers":["email"]}',
 '{"role":"admin","full_name":"مدير النظام"}',
 NOW(), NOW(), '','','','')
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- 2. IDENTITIES
-- ================================================================
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES
 (gen_random_uuid(),'11111111-1111-1111-1111-111111111111',
  format('{"sub":"%s","email":"patient@test.com"}','11111111-1111-1111-1111-111111111111')::jsonb,
  'email','patient@test.com',NOW(),NOW(),NOW()),
 (gen_random_uuid(),'aaaa1111-1111-1111-1111-111111111111',
  format('{"sub":"%s","email":"patient2@test.com"}','aaaa1111-1111-1111-1111-111111111111')::jsonb,
  'email','patient2@test.com',NOW(),NOW(),NOW()),
 (gen_random_uuid(),'22222222-2222-2222-2222-222222222222',
  format('{"sub":"%s","email":"doctor@test.com"}','22222222-2222-2222-2222-222222222222')::jsonb,
  'email','doctor@test.com',NOW(),NOW(),NOW()),
 (gen_random_uuid(),'bbbb2222-2222-2222-2222-222222222222',
  format('{"sub":"%s","email":"doctor2@test.com"}','bbbb2222-2222-2222-2222-222222222222')::jsonb,
  'email','doctor2@test.com',NOW(),NOW(),NOW()),
 (gen_random_uuid(),'33333333-3333-3333-3333-333333333333',
  format('{"sub":"%s","email":"labo@test.com"}','33333333-3333-3333-3333-333333333333')::jsonb,
  'email','labo@test.com',NOW(),NOW(),NOW()),
 (gen_random_uuid(),'44444444-4444-4444-4444-444444444444',
  format('{"sub":"%s","email":"pharmacie@test.com"}','44444444-4444-4444-4444-444444444444')::jsonb,
  'email','pharmacie@test.com',NOW(),NOW(),NOW()),
 (gen_random_uuid(),'55555555-5555-5555-5555-555555555555',
  format('{"sub":"%s","email":"admin@test.com"}','55555555-5555-5555-5555-555555555555')::jsonb,
  'email','admin@test.com',NOW(),NOW(),NOW())
ON CONFLICT DO NOTHING;

-- ================================================================
-- 3. PROFILES
-- ================================================================
INSERT INTO public.profiles (id, role, full_name, phone, address, specialty, license_number, verified, approval_status)
VALUES
 ('11111111-1111-1111-1111-111111111111','patient','كريم بوعزيز','0551122334','الجزائر العاصمة، بن عكنون',NULL,NULL,true,'approved'),
 ('aaaa1111-1111-1111-1111-111111111111','patient','نادية خالد','0661234567','وهران، المقطع',NULL,NULL,true,'approved'),
 ('22222222-2222-2222-2222-222222222222','doctor','د. أمين صاوي','0770987654','الجزائر العاصمة','طب عام وأمراض الدم','MED-2019-4521',true,'approved'),
 ('bbbb2222-2222-2222-2222-222222222222','doctor','د. سارة منصوري','0550112233','وهران','أمراض القلب والشرايين','MED-2018-3312',true,'approved'),
 ('33333333-3333-3333-3333-333333333333','lab','مختبرات ابن سينا','0771234567','الجزائر العاصمة، الأبيار',NULL,'LAB-2020-789',true,'approved'),
 ('44444444-4444-4444-4444-444444444444','pharmacy','صيدلية الأمل','0553456789','الجزائر العاصمة، باب الواد',NULL,'PHARM-2017-334',true,'approved'),
 ('55555555-5555-5555-5555-555555555555','admin','مدير النظام',NULL,NULL,NULL,NULL,true,'approved')
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- 4. MEDICAL REQUESTS  (6 scenarios)
-- ================================================================
INSERT INTO public.medical_requests (id, patient_id, doctor_id, type, symptoms, tests_requested, status, priority, patient_notes)
VALUES
-- REQ-1: Karim → Dr.Amine, PRESCRIPTION, APPROVED
('e1111111-1111-1111-1111-111111111111',
 '11111111-1111-1111-1111-111111111111',
 '22222222-2222-2222-2222-222222222222',
 'PRESCRIPTION',
 'أعاني من ارتفاع في ضغط الدم وآلام في الرأس متقطعة منذ 3 أسابيع. الضغط يصل أحياناً إلى 150/95.',
 NULL, 'APPROVED', 'urgent',
 'لدي حساسية من Aspirin وIbuprofen. أتناول حالياً Metformin للسكري.'),

-- REQ-2: Karim → Dr.Amine, LAB, APPROVED
('e2222222-2222-2222-2222-222222222222',
 '11111111-1111-1111-1111-111111111111',
 '22222222-2222-2222-2222-222222222222',
 'LAB',
 NULL,
 '[{"name":"صورة الدم الكاملة","code":"CBC"},{"name":"سكر الدم الصائم","code":"FBG"},{"name":"الهيموغلوبين السكري HbA1c","code":"HBA1C"},{"name":"وظائف الكلى","code":"RENAL"},{"name":"الكوليسترول الكلي","code":"CHOL"}]',
 'APPROVED', 'urgent',
 'تحاليل دورية لمتابعة مرض السكري وضغط الدم'),

-- REQ-3: Nadia → Dr.Sara, PRESCRIPTION, APPROVED
('e3333333-3333-3333-3333-333333333333',
 'aaaa1111-1111-1111-1111-111111111111',
 'bbbb2222-2222-2222-2222-222222222222',
 'PRESCRIPTION',
 'خفقان في القلب وإجهاد سريع عند بذل أي مجهود. أعاني من ضيق في التنفس عند صعود الدرج.',
 NULL, 'APPROVED', 'urgent',
 'تاريخ عائلي بأمراض القلب. أبي أُجريت له عملية قلب مفتوح.'),

-- REQ-4: Nadia → Dr.Sara, LAB, APPROVED
('e4444444-4444-4444-4444-444444444444',
 'aaaa1111-1111-1111-1111-111111111111',
 'bbbb2222-2222-2222-2222-222222222222',
 'LAB',
 NULL,
 '[{"name":"تخطيط كهربائية القلب ECG","code":"ECG"},{"name":"إنزيمات القلب Troponin","code":"TROP"},{"name":"صورة الدم الكاملة","code":"CBC"},{"name":"الدهون الثلاثية","code":"TG"}]',
 'APPROVED', 'urgent', NULL),

-- REQ-5: Karim → Broadcast (PENDING - no doctor)
('e5555555-5555-5555-5555-555555555555',
 '11111111-1111-1111-1111-111111111111',
 NULL,
 'PRESCRIPTION',
 'طفح جلدي على الذراعين والصدر منذ يومين مع حكة شديدة. لا أعرف سببه.',
 NULL, 'PENDING', 'normal', NULL),

-- REQ-6: Nadia → Broadcast (PENDING)
('e6666666-6666-6666-6666-666666666666',
 'aaaa1111-1111-1111-1111-111111111111',
 NULL,
 'ROUTINE_LAB',
 NULL,
 '[{"name":"فيتامين D","code":"VIT-D"},{"name":"فيتامين B12","code":"VIT-B12"},{"name":"الحديد وفيريتين","code":"FERR"}]',
 'PENDING', 'normal', 'فحص دوري سنوي')
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- 5. DOCTOR RESPONSES
-- ================================================================
INSERT INTO public.doctor_responses (id, request_id, doctor_id, action, notes)
VALUES
-- Dr.Amine → REQ-1 (APPROVE)
('de111111-1111-1111-1111-111111111111',
 'e1111111-1111-1111-1111-111111111111',
 '22222222-2222-2222-2222-222222222222',
 'APPROVE',
 'تمت الموافقة. تم وصف Amlodipine لتنظيم ضغط الدم بدلاً من Aspirin نظراً للحساسية. يرجى قياس الضغط يومياً وتسجيل النتائج.'),

-- Dr.Amine → REQ-2 (APPROVE)
('de222222-2222-2222-2222-222222222222',
 'e2222222-2222-2222-2222-222222222222',
 '22222222-2222-2222-2222-222222222222',
 'APPROVE',
 'تحاليل روتينية ضرورية. يرجى المجيء صائماً 10 ساعات على الأقل. لا تشرب سوى الماء.'),

-- Dr.Sara → REQ-3 (APPROVE)
('de333333-3333-3333-3333-333333333333',
 'e3333333-3333-3333-3333-333333333333',
 'bbbb2222-2222-2222-2222-222222222222',
 'APPROVE',
 'الأعراض تستوجب المتابعة الدقيقة. تم وصف Beta-blocker لتنظيم ضربات القلب. مراجعة عاجلة خلال أسبوع.'),

-- Dr.Sara → REQ-4 (APPROVE)
('de444444-4444-4444-4444-444444444444',
 'e4444444-4444-4444-4444-444444444444',
 'bbbb2222-2222-2222-2222-222222222222',
 'APPROVE',
 'تحاليل قلبية عاجلة. يرجى إجراؤها اليوم إن أمكن.')
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- 6. PRESCRIPTIONS
-- ================================================================
INSERT INTO public.prescriptions (id, request_id, response_id, patient_id, doctor_id, medications, doctor_notes)
VALUES
-- Karim's prescription (Req-1)
('ac111111-1111-1111-1111-111111111111',
 'e1111111-1111-1111-1111-111111111111',
 'de111111-1111-1111-1111-111111111111',
 '11111111-1111-1111-1111-111111111111',
 '22222222-2222-2222-2222-222222222222',
 '[
   {"name":"Amlodipine","dose":"5mg","frequency":"مرة يومياً صباحاً","duration":"شهر واحد","notes":"مع الأكل أو بدونه"},
   {"name":"Candesartan","dose":"8mg","frequency":"مرة يومياً مساءً","duration":"شهر واحد","notes":"راقب ضغط الدم"},
   {"name":"Metformin","dose":"1000mg","frequency":"مرتان يومياً","duration":"مستمر","notes":"مع الوجبات الرئيسية"}
 ]',
 'تجنب الملح والدهون المشبعة. ممارسة المشي 30 دقيقة يومياً. مراجعة بعد شهر مع نتائج التحاليل.'),

-- Nadia's prescription (Req-3)
('ac222222-2222-2222-2222-222222222222',
 'e3333333-3333-3333-3333-333333333333',
 'de333333-3333-3333-3333-333333333333',
 'aaaa1111-1111-1111-1111-111111111111',
 'bbbb2222-2222-2222-2222-222222222222',
 '[
   {"name":"Bisoprolol","dose":"2.5mg","frequency":"مرة يومياً صباحاً","duration":"شهر واحد","notes":"لا تتوقف عن الأخذ فجأة"},
   {"name":"Aspirin","dose":"100mg","frequency":"مرة يومياً مساءً","duration":"مستمر","notes":"بعد الأكل مباشرة"},
   {"name":"Rosuvastatin","dose":"10mg","frequency":"مرة يومياً ليلاً","duration":"3 أشهر","notes":"فحص وظائف الكبد بعد 3 أشهر"}
 ]',
 'تجنب المجهود الشديد. حضور أي ألم في الصدر أو ضيق تنفس مفاجئ يستوجب التوجه للطوارئ فوراً.')
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- 7. LAB REQUESTS (patient assigned lab)
-- ================================================================
INSERT INTO public.lab_requests (id, request_id, patient_id, doctor_id, lab_id, tests_list, doctor_notes, status)
VALUES
-- Karim's lab (Req-2) → Ibn Sina, PROCESSING
('ab111111-1111-1111-1111-111111111111',
 'e2222222-2222-2222-2222-222222222222',
 '11111111-1111-1111-1111-111111111111',
 '22222222-2222-2222-2222-222222222222',
 '33333333-3333-3333-3333-333333333333',
 '[
   {"name":"صورة الدم الكاملة","code":"CBC"},
   {"name":"سكر الدم الصائم","code":"FBG"},
   {"name":"الهيموغلوبين السكري HbA1c","code":"HBA1C"},
   {"name":"وظائف الكلى","code":"RENAL"},
   {"name":"الكوليسترول الكلي","code":"CHOL"}
 ]',
 'المريض صائم. عاجل. يرجى إرسال النتائج في نفس اليوم.',
 'PROCESSING'),

-- Nadia's lab (Req-4) → Ibn Sina, COMPLETED
('ab222222-2222-2222-2222-222222222222',
 'e4444444-4444-4444-4444-444444444444',
 'aaaa1111-1111-1111-1111-111111111111',
 'bbbb2222-2222-2222-2222-222222222222',
 '33333333-3333-3333-3333-333333333333',
 '[
   {"name":"تخطيط كهربائية القلب ECG","code":"ECG"},
   {"name":"إنزيمات القلب Troponin","code":"TROP"},
   {"name":"صورة الدم الكاملة","code":"CBC"},
   {"name":"الدهون الثلاثية","code":"TG"}
 ]',
 'عاجل جداً. الطبيبة تنتظر النتائج.',
 'COMPLETED')
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- 8. LAB RESULTS (for Nadia's completed lab)
-- ================================================================
INSERT INTO public.lab_results (id, lab_request_id, lab_id, patient_id, result_notes)
VALUES
('abe11111-1111-1111-1111-111111111111',
 'ab222222-2222-2222-2222-222222222222',
 '33333333-3333-3333-3333-333333333333',
 'aaaa1111-1111-1111-1111-111111111111',
 'النتائج: CBC - طبيعي (Hb: 12.8 g/dL). Troponin - ضمن الحد الطبيعي (0.01 ng/mL). الدهون الثلاثية مرتفعة قليلاً (TG: 195 mg/dL). ECG يُظهر تسارع خفيف في نبض القلب (HR: 98 bpm). يُنصح بمراجعة الطبيبة لتقييم النتائج.')
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- 9. PHARMACY ORDERS
-- ================================================================
INSERT INTO public.pharmacy_orders (id, prescription_id, patient_id, pharmacy_id, status, payment_status, pharmacy_notes)
VALUES
-- Karim sent his prescription → Al Amal Pharmacy, PROCESSING
('fa111111-1111-1111-1111-111111111111',
 'ac111111-1111-1111-1111-111111111111',
 '11111111-1111-1111-1111-111111111111',
 '44444444-4444-4444-4444-444444444444',
 'PROCESSING', 'offline',
 'جاري تحضير الأدوية. Amlodipine و Candesartan متوفرة. Metformin 1000mg تحت الطلب.'),

-- Nadia sent her prescription → Al Amal Pharmacy, COMPLETED
('fa222222-2222-2222-2222-222222222222',
 'ac222222-2222-2222-2222-222222222222',
 'aaaa1111-1111-1111-1111-111111111111',
 '44444444-4444-4444-4444-444444444444',
 'COMPLETED', 'offline',
 'تم تسليم جميع الأدوية. Bisoprolol, Aspirin, Rosuvastatin. تذكير: لا تتوقف عن Bisoprolol فجأة.')
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- ✅ Real Data Seed Complete!
-- ================================================================
-- ACCOUNTS (password: 123456):
--   Patient   : patient@test.com
--   Patient 2 : patient2@test.com
--   Doctor    : doctor@test.com
--   Doctor 2  : doctor2@test.com
--   Lab       : labo@test.com
--   Pharmacy  : pharmacie@test.com
--   Admin     : admin@test.com
-- ================================================================

