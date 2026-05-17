-- ================================================================
--  3INAYA - Virtual Data Seed (3 of each role + Full Workflow)
--  Covers: 3 Patients, 3 Doctors, 3 Labs, 3 Pharmacies
--  Password for all new users: 123456
-- ================================================================

-- ================================================================
-- 1. AUTH USERS (Password: 123456)
-- ================================================================
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES
-- Patients
('00000000-0000-0000-0000-000000000000', '11000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'patient11@test.com', crypt('123456', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"role":"patient","full_name":"مريض افتراضي 1","phone":"0551100011"}', NOW(), NOW(), '','','',''),
('00000000-0000-0000-0000-000000000000', '12000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'patient12@test.com', crypt('123456', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"role":"patient","full_name":"مريض افتراضي 2","phone":"0551200012"}', NOW(), NOW(), '','','',''),
('00000000-0000-0000-0000-000000000000', '13000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'patient13@test.com', crypt('123456', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"role":"patient","full_name":"مريض افتراضي 3","phone":"0551300013"}', NOW(), NOW(), '','','',''),

-- Doctors
('00000000-0000-0000-0000-000000000000', '21000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'doctor11@test.com', crypt('123456', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"role":"doctor","full_name":"د. طبيب افتراضي 1","phone":"0772100021"}', NOW(), NOW(), '','','',''),
('00000000-0000-0000-0000-000000000000', '22000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'doctor12@test.com', crypt('123456', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"role":"doctor","full_name":"د. طبيب افتراضي 2","phone":"0772200022"}', NOW(), NOW(), '','','',''),
('00000000-0000-0000-0000-000000000000', '23000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'doctor13@test.com', crypt('123456', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"role":"doctor","full_name":"د. طبيب افتراضي 3","phone":"0772300023"}', NOW(), NOW(), '','','',''),

-- Labs
('00000000-0000-0000-0000-000000000000', '31000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'lab11@test.com', crypt('123456', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"role":"lab","full_name":"مخبر افتراضي 1","phone":"0553100031"}', NOW(), NOW(), '','','',''),
('00000000-0000-0000-0000-000000000000', '32000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'lab12@test.com', crypt('123456', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"role":"lab","full_name":"مخبر افتراضي 2","phone":"0553200032"}', NOW(), NOW(), '','','',''),
('00000000-0000-0000-0000-000000000000', '33000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'lab13@test.com', crypt('123456', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"role":"lab","full_name":"مخبر افتراضي 3","phone":"0553300033"}', NOW(), NOW(), '','','',''),

-- Pharmacies
('00000000-0000-0000-0000-000000000000', '41000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'pharmacy11@test.com', crypt('123456', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"role":"pharmacy","full_name":"صيدلية افتراضية 1","phone":"0664100041"}', NOW(), NOW(), '','','',''),
('00000000-0000-0000-0000-000000000000', '42000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'pharmacy12@test.com', crypt('123456', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"role":"pharmacy","full_name":"صيدلية افتراضية 2","phone":"0664200042"}', NOW(), NOW(), '','','',''),
('00000000-0000-0000-0000-000000000000', '43000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'pharmacy13@test.com', crypt('123456', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"role":"pharmacy","full_name":"صيدلية افتراضية 3","phone":"0664300043"}', NOW(), NOW(), '','','','')
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- 2. IDENTITIES
-- ================================================================
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES
 (gen_random_uuid(), '11000000-0000-0000-0000-000000000000', format('{"sub":"%s","email":"patient11@test.com"}','11000000-0000-0000-0000-000000000000')::jsonb, 'email', 'patient11@test.com', NOW(), NOW(), NOW()),
 (gen_random_uuid(), '12000000-0000-0000-0000-000000000000', format('{"sub":"%s","email":"patient12@test.com"}','12000000-0000-0000-0000-000000000000')::jsonb, 'email', 'patient12@test.com', NOW(), NOW(), NOW()),
 (gen_random_uuid(), '13000000-0000-0000-0000-000000000000', format('{"sub":"%s","email":"patient13@test.com"}','13000000-0000-0000-0000-000000000000')::jsonb, 'email', 'patient13@test.com', NOW(), NOW(), NOW()),
 
 (gen_random_uuid(), '21000000-0000-0000-0000-000000000000', format('{"sub":"%s","email":"doctor11@test.com"}','21000000-0000-0000-0000-000000000000')::jsonb, 'email', 'doctor11@test.com', NOW(), NOW(), NOW()),
 (gen_random_uuid(), '22000000-0000-0000-0000-000000000000', format('{"sub":"%s","email":"doctor12@test.com"}','22000000-0000-0000-0000-000000000000')::jsonb, 'email', 'doctor12@test.com', NOW(), NOW(), NOW()),
 (gen_random_uuid(), '23000000-0000-0000-0000-000000000000', format('{"sub":"%s","email":"doctor13@test.com"}','23000000-0000-0000-0000-000000000000')::jsonb, 'email', 'doctor13@test.com', NOW(), NOW(), NOW()),
 
 (gen_random_uuid(), '31000000-0000-0000-0000-000000000000', format('{"sub":"%s","email":"lab11@test.com"}','31000000-0000-0000-0000-000000000000')::jsonb, 'email', 'lab11@test.com', NOW(), NOW(), NOW()),
 (gen_random_uuid(), '32000000-0000-0000-0000-000000000000', format('{"sub":"%s","email":"lab12@test.com"}','32000000-0000-0000-0000-000000000000')::jsonb, 'email', 'lab12@test.com', NOW(), NOW(), NOW()),
 (gen_random_uuid(), '33000000-0000-0000-0000-000000000000', format('{"sub":"%s","email":"lab13@test.com"}','33000000-0000-0000-0000-000000000000')::jsonb, 'email', 'lab13@test.com', NOW(), NOW(), NOW()),
 
 (gen_random_uuid(), '41000000-0000-0000-0000-000000000000', format('{"sub":"%s","email":"pharmacy11@test.com"}','41000000-0000-0000-0000-000000000000')::jsonb, 'email', 'pharmacy11@test.com', NOW(), NOW(), NOW()),
 (gen_random_uuid(), '42000000-0000-0000-0000-000000000000', format('{"sub":"%s","email":"pharmacy12@test.com"}','42000000-0000-0000-0000-000000000000')::jsonb, 'email', 'pharmacy12@test.com', NOW(), NOW(), NOW()),
 (gen_random_uuid(), '43000000-0000-0000-0000-000000000000', format('{"sub":"%s","email":"pharmacy13@test.com"}','43000000-0000-0000-0000-000000000000')::jsonb, 'email', 'pharmacy13@test.com', NOW(), NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ================================================================
-- 3. PROFILES (Note: Trigger 'handle_new_user' might already insert some data, 
-- we use UPSERT/ON CONFLICT DO UPDATE to ensure fields are fully populated)
-- ================================================================
INSERT INTO public.profiles (id, role, full_name, phone, address, specialty, license_number, verified, approval_status)
VALUES
 ('11000000-0000-0000-0000-000000000000', 'patient', 'مريض افتراضي 1', '0551100011', 'عنوان المريض 1', NULL, NULL, true, 'approved'),
 ('12000000-0000-0000-0000-000000000000', 'patient', 'مريض افتراضي 2', '0551200012', 'عنوان المريض 2', NULL, NULL, true, 'approved'),
 ('13000000-0000-0000-0000-000000000000', 'patient', 'مريض افتراضي 3', '0551300013', 'عنوان المريض 3', NULL, NULL, true, 'approved'),
 
 ('21000000-0000-0000-0000-000000000000', 'doctor', 'د. طبيب افتراضي 1', '0772100021', 'عيادة 1', 'طب عام', 'MED-001', true, 'approved'),
 ('22000000-0000-0000-0000-000000000000', 'doctor', 'د. طبيب افتراضي 2', '0772200022', 'عيادة 2', 'طب أطفال', 'MED-002', true, 'approved'),
 ('23000000-0000-0000-0000-000000000000', 'doctor', 'د. طبيب افتراضي 3', '0772300023', 'عيادة 3', 'أمراض القلب', 'MED-003', true, 'approved'),
 
 ('31000000-0000-0000-0000-000000000000', 'lab', 'مخبر افتراضي 1', '0553100031', 'مخبر 1', NULL, 'LAB-001', true, 'approved'),
 ('32000000-0000-0000-0000-000000000000', 'lab', 'مخبر افتراضي 2', '0553200032', 'مخبر 2', NULL, 'LAB-002', true, 'approved'),
 ('33000000-0000-0000-0000-000000000000', 'lab', 'مخبر افتراضي 3', '0553300033', 'مخبر 3', NULL, 'LAB-003', true, 'approved'),
 
 ('41000000-0000-0000-0000-000000000000', 'pharmacy', 'صيدلية افتراضية 1', '0664100041', 'صيدلية 1', NULL, 'PHA-001', true, 'approved'),
 ('42000000-0000-0000-0000-000000000000', 'pharmacy', 'صيدلية افتراضية 2', '0664200042', 'صيدلية 2', NULL, 'PHA-002', true, 'approved'),
 ('43000000-0000-0000-0000-000000000000', 'pharmacy', 'صيدلية افتراضية 3', '0664300043', 'صيدلية 3', NULL, 'PHA-003', true, 'approved')
ON CONFLICT (id) DO UPDATE SET 
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  specialty = EXCLUDED.specialty,
  license_number = EXCLUDED.license_number,
  verified = EXCLUDED.verified,
  approval_status = EXCLUDED.approval_status;

-- ================================================================
-- 4. MEDICAL REQUESTS (Operations)
-- ================================================================
INSERT INTO public.medical_requests (id, patient_id, doctor_id, type, symptoms, tests_requested, status, priority, patient_notes)
VALUES
-- Req 1: Patient 1 -> Doctor 1 (Prescription) - APPROVED
('10000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000000', '21000000-0000-0000-0000-000000000000', 'PRESCRIPTION', 'أعاني من صداع وحمى', NULL, 'APPROVED', 'normal', 'بدأ منذ يومين'),

-- Req 2: Patient 2 -> Doctor 2 (Lab) - APPROVED
('10000000-0000-0000-0000-000000000002', '12000000-0000-0000-0000-000000000000', '22000000-0000-0000-0000-000000000000', 'LAB', NULL, '[{"name":"تحليل السكر","code":"GLU"}]', 'APPROVED', 'normal', ''),

-- Req 3: Patient 3 -> Doctor 3 (Prescription) - PENDING
('10000000-0000-0000-0000-000000000003', '13000000-0000-0000-0000-000000000000', '23000000-0000-0000-0000-000000000000', 'PRESCRIPTION', 'ألم في الصدر', NULL, 'PENDING', 'urgent', 'أرجو الرد سريعا')
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- 5. DOCTOR RESPONSES
-- ================================================================
INSERT INTO public.doctor_responses (id, request_id, doctor_id, action, notes)
VALUES
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '21000000-0000-0000-0000-000000000000', 'APPROVE', 'تم وصف دواء للصداع'),
('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '22000000-0000-0000-0000-000000000000', 'APPROVE', 'يرجى إجراء التحليل صائما')
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- 6. PRESCRIPTIONS
-- ================================================================
INSERT INTO public.prescriptions (id, request_id, response_id, patient_id, doctor_id, medications, doctor_notes)
VALUES
('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000000', '21000000-0000-0000-0000-000000000000', '[{"name":"Paracetamol","dose":"500mg","frequency":"3 مرات يوميا","duration":"5 أيام","notes":"بعد الأكل"}]', 'الراحة التامة')
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- 7. LAB REQUESTS (Patient assigns Lab)
-- ================================================================
INSERT INTO public.lab_requests (id, request_id, patient_id, doctor_id, lab_id, tests_list, doctor_notes, status)
VALUES
('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', '12000000-0000-0000-0000-000000000000', '22000000-0000-0000-0000-000000000000', '31000000-0000-0000-0000-000000000000', '[{"name":"تحليل السكر","code":"GLU"}]', 'صائم 8 ساعات', 'COMPLETED')
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- 8. LAB RESULTS
-- ================================================================
INSERT INTO public.lab_results (id, lab_request_id, lab_id, patient_id, result_notes)
VALUES
('50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '31000000-0000-0000-0000-000000000000', '12000000-0000-0000-0000-000000000000', 'النتيجة 95 mg/dL - طبيعي')
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- 9. PHARMACY ORDERS
-- ================================================================
INSERT INTO public.pharmacy_orders (id, prescription_id, patient_id, pharmacy_id, status, payment_status, pharmacy_notes)
VALUES
('60000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000000', '41000000-0000-0000-0000-000000000000', 'COMPLETED', 'offline', 'تم صرف الدواء بالكامل')
ON CONFLICT (id) DO NOTHING;
