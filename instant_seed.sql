-- ================================================================
--  3INAYA — Patient-Centric Seed v2.0
--  Simulates a complete real-world workflow:
--  Patient → Doctor → Patient → Pharmacy/Lab
-- ================================================================
--  Paste this in Supabase SQL Editor AFTER running supabase_schema.sql
--  All passwords: 123456
-- ================================================================


-- ================================================================
-- 1. USERS (auth.users)
-- ================================================================
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES
    -- 👤 Patient: Ahmed
    (
        '00000000-0000-0000-0000-000000000000',
        '11111111-1111-1111-1111-111111111111',
        'authenticated', 'authenticated',
        'patient@test.com',
        crypt('123456', gen_salt('bf')),
        NOW(), NULL, NULL,
        '{"provider":"email","providers":["email"]}',
        '{"role":"patient","full_name":"أحمد بن علي","phone":"0551234567"}',
        NOW(), NOW(), '', '', '', ''
    ),
    -- 👨‍⚕️ Doctor: Dr. Youssef
    (
        '00000000-0000-0000-0000-000000000000',
        '22222222-2222-2222-2222-222222222222',
        'authenticated', 'authenticated',
        'doctor@test.com',
        crypt('123456', gen_salt('bf')),
        NOW(), NULL, NULL,
        '{"provider":"email","providers":["email"]}',
        '{"role":"doctor","full_name":"د. يوسف خليل","phone":"0662345678"}',
        NOW(), NOW(), '', '', '', ''
    ),
    -- 🔬 Lab: Al-Shifa Labs
    (
        '00000000-0000-0000-0000-000000000000',
        '33333333-3333-3333-3333-333333333333',
        'authenticated', 'authenticated',
        'labo@test.com',
        crypt('123456', gen_salt('bf')),
        NOW(), NULL, NULL,
        '{"provider":"email","providers":["email"]}',
        '{"role":"lab","full_name":"مختبرات الشفاء","phone":"0773456789"}',
        NOW(), NOW(), '', '', '', ''
    ),
    -- 💊 Pharmacy: Al-Nour Pharmacy
    (
        '00000000-0000-0000-0000-000000000000',
        '44444444-4444-4444-4444-444444444444',
        'authenticated', 'authenticated',
        'pharmacie@test.com',
        crypt('123456', gen_salt('bf')),
        NOW(), NULL, NULL,
        '{"provider":"email","providers":["email"]}',
        '{"role":"pharmacy","full_name":"صيدلية النور","phone":"0554567890"}',
        NOW(), NOW(), '', '', '', ''
    ),
    -- 🛡️ Admin
    (
        '00000000-0000-0000-0000-000000000000',
        '55555555-5555-5555-5555-555555555555',
        'authenticated', 'authenticated',
        'admin@test.com',
        crypt('123456', gen_salt('bf')),
        NOW(), NULL, NULL,
        '{"provider":"email","providers":["email"]}',
        '{"role":"admin","full_name":"مدير النظام"}',
        NOW(), NOW(), '', '', '', ''
    )
ON CONFLICT (id) DO NOTHING;


-- ================================================================
-- 2. AUTH IDENTITIES
-- ================================================================
INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id,
    last_sign_in_at, created_at, updated_at
) VALUES
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
     format('{"sub":"%s","email":"%s"}', '11111111-1111-1111-1111-111111111111', 'patient@test.com')::jsonb,
     'email', 'patient@test.com', NOW(), NOW(), NOW()),
    (gen_random_uuid(), '22222222-2222-2222-2222-222222222222',
     format('{"sub":"%s","email":"%s"}', '22222222-2222-2222-2222-222222222222', 'doctor@test.com')::jsonb,
     'email', 'doctor@test.com', NOW(), NOW(), NOW()),
    (gen_random_uuid(), '33333333-3333-3333-3333-333333333333',
     format('{"sub":"%s","email":"%s"}', '33333333-3333-3333-3333-333333333333', 'labo@test.com')::jsonb,
     'email', 'labo@test.com', NOW(), NOW(), NOW()),
    (gen_random_uuid(), '44444444-4444-4444-4444-444444444444',
     format('{"sub":"%s","email":"%s"}', '44444444-4444-4444-4444-444444444444', 'pharmacie@test.com')::jsonb,
     'email', 'pharmacie@test.com', NOW(), NOW(), NOW()),
    (gen_random_uuid(), '55555555-5555-5555-5555-555555555555',
     format('{"sub":"%s","email":"%s"}', '55555555-5555-5555-5555-555555555555', 'admin@test.com')::jsonb,
     'email', 'admin@test.com', NOW(), NOW(), NOW())
ON CONFLICT DO NOTHING;


-- ================================================================
-- 3. PROFILES (manually inserted to avoid trigger dependency order)
-- ================================================================
INSERT INTO public.profiles (id, role, full_name, phone, address, specialty, verified, approval_status)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'patient',  'أحمد بن علي',     '0551234567', 'الجزائر العاصمة', NULL,              true, 'approved'),
    ('22222222-2222-2222-2222-222222222222', 'doctor',   'د. يوسف خليل',    '0662345678', 'وهران',           'طب عام',          true, 'approved'),
    ('33333333-3333-3333-3333-333333333333', 'lab',      'مختبرات الشفاء',  '0773456789', 'عنابة',           NULL,              true, 'approved'),
    ('44444444-4444-4444-4444-444444444444', 'pharmacy', 'صيدلية النور',     '0554567890', 'قسنطينة',         NULL,              true, 'approved'),
    ('55555555-5555-5555-5555-555555555555', 'admin',    'مدير النظام',      NULL,          NULL,              NULL,              true, 'approved')
ON CONFLICT (id) DO NOTHING;


-- ================================================================
-- 4. MEDICAL REQUESTS
--    Scenario A: Patient requests prescription (assigned to doctor)
--    Scenario B: Patient requests lab tests (assigned to doctor)
--    Scenario C: Open broadcast request (no doctor picked yet)
-- ================================================================

-- A: Prescription request — APPROVED by doctor
INSERT INTO public.medical_requests
    (id, patient_id, doctor_id, type, symptoms, status, priority, patient_notes)
VALUES
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        'PRESCRIPTION',
        'أعاني من ارتفاع ضغط الدم والصداع المزمن منذ أسبوعين، أحتاج لتجديد الوصفة.',
        'APPROVED',
        'normal',
        'لدي حساسية من Aspirin'
    )
ON CONFLICT (id) DO NOTHING;

-- B: Lab request — APPROVED by doctor
INSERT INTO public.medical_requests
    (id, patient_id, doctor_id, type, tests_requested, status, priority, patient_notes)
VALUES
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        'LAB',
        '[{"name":"صورة الدم الكاملة CBC","code":"CBC"},{"name":"سكر الدم الصائم","code":"FBG"},{"name":"وظائف الكلى","code":"RENAL"}]',
        'APPROVED',
        'urgent',
        'تحاليل دورية لمرض السكري'
    )
ON CONFLICT (id) DO NOTHING;

-- C: Open request — PENDING (no doctor assigned yet)
INSERT INTO public.medical_requests
    (id, patient_id, doctor_id, type, symptoms, status, priority)
VALUES
    (
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        '11111111-1111-1111-1111-111111111111',
        NULL,
        'PRESCRIPTION',
        'سعال مستمر وصعوبة في التنفس منذ 3 أيام.',
        'PENDING',
        'normal'
    )
ON CONFLICT (id) DO NOTHING;


-- ================================================================
-- 5. DOCTOR RESPONSES
-- ================================================================
INSERT INTO public.doctor_responses (id, request_id, doctor_id, action, notes)
VALUES
    (
        'dddddddd-dddd-dddd-dddd-dddddddddddd',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '22222222-2222-2222-2222-222222222222',
        'APPROVE',
        'تمت الموافقة. تم وصف دواء Amlodipine 5mg لضغط الدم.'
    ),
    (
        'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        '22222222-2222-2222-2222-222222222222',
        'APPROVE',
        'تحاليل روتينية مطلوبة بشكل دوري. يرجى إجراؤها في أقرب وقت.'
    )
ON CONFLICT (id) DO NOTHING;


-- ================================================================
-- 6. PRESCRIPTIONS (linked to request A)
--    Doctor wrote it → now waiting for PATIENT to choose pharmacy
-- ================================================================
INSERT INTO public.prescriptions
    (id, request_id, response_id, patient_id, doctor_id, medications, doctor_notes)
VALUES
    (
        'ffffffff-ffff-ffff-ffff-ffffffffffff',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'dddddddd-dddd-dddd-dddd-dddddddddddd',
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        '[
            {"name":"Amlodipine","dose":"5mg","frequency":"مرة يومياً صباحاً","duration":"شهر واحد","notes":"مع الأكل"},
            {"name":"Aspivrine","dose":"100mg","frequency":"مرة يومياً مساءً","duration":"شهر واحد","notes":"تجنب إذا وجدت حساسية"}
        ]',
        'تجنب الأطعمة المالحة. مراجعة بعد شهر.'
    )
ON CONFLICT (id) DO NOTHING;


-- ================================================================
-- 7. LAB REQUESTS (linked to request B)
--    Doctor wrote it → waiting for PATIENT to choose lab
--    Patient has already chosen مختبرات الشفاء (lab_id assigned)
-- ================================================================
INSERT INTO public.lab_requests
    (id, request_id, patient_id, doctor_id, lab_id, tests_list, doctor_notes, status)
VALUES
    (
        'gggggggg-gggg-gggg-gggg-gggggggggggg',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        '33333333-3333-3333-3333-333333333333',
        '[
            {"name":"صورة الدم الكاملة CBC","code":"CBC"},
            {"name":"سكر الدم الصائم","code":"FBG"},
            {"name":"وظائف الكلى","code":"RENAL"}
        ]',
        'يرجى مجيء المريض صائما (8 ساعات). عاجل.',
        'PROCESSING'
    )
ON CONFLICT (id) DO NOTHING;


-- ================================================================
-- 8. PHARMACY ORDER
--    Patient sent prescription to صيدلية النور
-- ================================================================
INSERT INTO public.pharmacy_orders
    (id, prescription_id, patient_id, pharmacy_id, status, payment_status)
VALUES
    (
        'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh',
        'ffffffff-ffff-ffff-ffff-ffffffffffff',
        '11111111-1111-1111-1111-111111111111',
        '44444444-4444-4444-4444-444444444444',
        'PROCESSING',
        'offline'
    )
ON CONFLICT (id) DO NOTHING;


-- ================================================================
-- ✅ Seed Complete — Full Patient-Centric Workflow Data Loaded
-- ================================================================
