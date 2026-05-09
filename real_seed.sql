-- ================================================================
--  3INAYA â€” Real Data Seed (Full Workflow Test)
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
  'lab@test.com','pharmacy@test.com','admin@test.com'
);
DELETE FROM auth.users WHERE email IN (
  'patient@test.com','patient2@test.com',
  'doctor@test.com','doctor2@test.com',
  'lab@test.com','pharmacy@test.com','admin@test.com'
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
 '{"role":"patient","full_name":"ÙƒØ±ÙŠÙ… Ø¨ÙˆØ¹Ø²ÙŠØ²","phone":"0551122334"}',
 NOW(), NOW(), '','','',''),

-- Patient 2: Nadia
('00000000-0000-0000-0000-000000000000',
 'aaaa1111-1111-1111-1111-111111111111',
 'authenticated','authenticated','patient2@test.com',
 crypt('123456', gen_salt('bf')),
 NOW(),
 '{"provider":"email","providers":["email"]}',
 '{"role":"patient","full_name":"Ù†Ø§Ø¯ÙŠØ© Ø®Ø§Ù„Ø¯","phone":"0661234567"}',
 NOW(), NOW(), '','','',''),

-- Doctor: Dr. Amine
('00000000-0000-0000-0000-000000000000',
 '22222222-2222-2222-2222-222222222222',
 'authenticated','authenticated','doctor@test.com',
 crypt('123456', gen_salt('bf')),
 NOW(),
 '{"provider":"email","providers":["email"]}',
 '{"role":"doctor","full_name":"Ø¯. Ø£Ù…ÙŠÙ† ØµØ§ÙˆÙŠ","phone":"0770987654"}',
 NOW(), NOW(), '','','',''),

-- Doctor 2: Dr. Sara
('00000000-0000-0000-0000-000000000000',
 'bbbb2222-2222-2222-2222-222222222222',
 'authenticated','authenticated','doctor2@test.com',
 crypt('123456', gen_salt('bf')),
 NOW(),
 '{"provider":"email","providers":["email"]}',
 '{"role":"doctor","full_name":"Ø¯. Ø³Ø§Ø±Ø© Ù…Ù†ØµÙˆØ±ÙŠ","phone":"0550112233"}',
 NOW(), NOW(), '','','',''),

-- Lab: Ibn Sina
('00000000-0000-0000-0000-000000000000',
 '33333333-3333-3333-3333-333333333333',
 'authenticated','authenticated','lab@test.com',
 crypt('123456', gen_salt('bf')),
 NOW(),
 '{"provider":"email","providers":["email"]}',
 '{"role":"lab","full_name":"Ù…Ø®ØªØ¨Ø±Ø§Øª Ø§Ø¨Ù† Ø³ÙŠÙ†Ø§","phone":"0771234567"}',
 NOW(), NOW(), '','','',''),

-- Pharmacy: Al Amal
('00000000-0000-0000-0000-000000000000',
 '44444444-4444-4444-4444-444444444444',
 'authenticated','authenticated','pharmacy@test.com',
 crypt('123456', gen_salt('bf')),
 NOW(),
 '{"provider":"email","providers":["email"]}',
 '{"role":"pharmacy","full_name":"ØµÙŠØ¯Ù„ÙŠØ© Ø§Ù„Ø£Ù…Ù„","phone":"0553456789"}',
 NOW(), NOW(), '','','',''),

-- Admin
('00000000-0000-0000-0000-000000000000',
 '55555555-5555-5555-5555-555555555555',
 'authenticated','authenticated','admin@test.com',
 crypt('123456', gen_salt('bf')),
 NOW(),
 '{"provider":"email","providers":["email"]}',
 '{"role":"admin","full_name":"Ù…Ø¯ÙŠØ± Ø§Ù„Ù†Ø¸Ø§Ù…"}',
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
  format('{"sub":"%s","email":"lab@test.com"}','33333333-3333-3333-3333-333333333333')::jsonb,
  'email','lab@test.com',NOW(),NOW(),NOW()),
 (gen_random_uuid(),'44444444-4444-4444-4444-444444444444',
  format('{"sub":"%s","email":"pharmacy@test.com"}','44444444-4444-4444-4444-444444444444')::jsonb,
  'email','pharmacy@test.com',NOW(),NOW(),NOW()),
 (gen_random_uuid(),'55555555-5555-5555-5555-555555555555',
  format('{"sub":"%s","email":"admin@test.com"}','55555555-5555-5555-5555-555555555555')::jsonb,
  'email','admin@test.com',NOW(),NOW(),NOW())
ON CONFLICT DO NOTHING;

-- ================================================================
-- 3. PROFILES
-- ================================================================
INSERT INTO public.profiles (id, role, full_name, phone, address, specialty, license_number, verified, approval_status)
VALUES
 ('11111111-1111-1111-1111-111111111111','patient','ÙƒØ±ÙŠÙ… Ø¨ÙˆØ¹Ø²ÙŠØ²','0551122334','Ø§Ù„Ø¬Ø²Ø§Ø¦Ø± Ø§Ù„Ø¹Ø§ØµÙ…Ø©ØŒ Ø¨Ù† Ø¹ÙƒÙ†ÙˆÙ†',NULL,NULL,true,'approved'),
 ('aaaa1111-1111-1111-1111-111111111111','patient','Ù†Ø§Ø¯ÙŠØ© Ø®Ø§Ù„Ø¯','0661234567','ÙˆÙ‡Ø±Ø§Ù†ØŒ Ø§Ù„Ù…Ù‚Ø·Ø¹',NULL,NULL,true,'approved'),
 ('22222222-2222-2222-2222-222222222222','doctor','Ø¯. Ø£Ù…ÙŠÙ† ØµØ§ÙˆÙŠ','0770987654','Ø§Ù„Ø¬Ø²Ø§Ø¦Ø± Ø§Ù„Ø¹Ø§ØµÙ…Ø©','Ø·Ø¨ Ø¹Ø§Ù… ÙˆØ£Ù…Ø±Ø§Ø¶ Ø§Ù„Ø¯Ù…','MED-2019-4521',true,'approved'),
 ('bbbb2222-2222-2222-2222-222222222222','doctor','Ø¯. Ø³Ø§Ø±Ø© Ù…Ù†ØµÙˆØ±ÙŠ','0550112233','ÙˆÙ‡Ø±Ø§Ù†','Ø£Ù…Ø±Ø§Ø¶ Ø§Ù„Ù‚Ù„Ø¨ ÙˆØ§Ù„Ø´Ø±Ø§ÙŠÙŠÙ†','MED-2018-3312',true,'approved'),
 ('33333333-3333-3333-3333-333333333333','lab','Ù…Ø®ØªØ¨Ø±Ø§Øª Ø§Ø¨Ù† Ø³ÙŠÙ†Ø§','0771234567','Ø§Ù„Ø¬Ø²Ø§Ø¦Ø± Ø§Ù„Ø¹Ø§ØµÙ…Ø©ØŒ Ø§Ù„Ø£Ø¨ÙŠØ§Ø±',NULL,'LAB-2020-789',true,'approved'),
 ('44444444-4444-4444-4444-444444444444','pharmacy','ØµÙŠØ¯Ù„ÙŠØ© Ø§Ù„Ø£Ù…Ù„','0553456789','Ø§Ù„Ø¬Ø²Ø§Ø¦Ø± Ø§Ù„Ø¹Ø§ØµÙ…Ø©ØŒ Ø¨Ø§Ø¨ Ø§Ù„ÙˆØ§Ø¯',NULL,'PHARM-2017-334',true,'approved'),
 ('55555555-5555-5555-5555-555555555555','admin','Ù…Ø¯ÙŠØ± Ø§Ù„Ù†Ø¸Ø§Ù…',NULL,NULL,NULL,NULL,true,'approved')
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- 4. MEDICAL REQUESTS  (6 scenarios)
-- ================================================================
INSERT INTO public.medical_requests (id, patient_id, doctor_id, type, symptoms, tests_requested, status, priority, patient_notes)
VALUES
-- REQ-1: Karim â†’ Dr.Amine, PRESCRIPTION, APPROVED
('e1111111-1111-1111-1111-111111111111',
 '11111111-1111-1111-1111-111111111111',
 '22222222-2222-2222-2222-222222222222',
 'PRESCRIPTION',
 'Ø£Ø¹Ø§Ù†ÙŠ Ù…Ù† Ø§Ø±ØªÙØ§Ø¹ ÙÙŠ Ø¶ØºØ· Ø§Ù„Ø¯Ù… ÙˆØ¢Ù„Ø§Ù… ÙÙŠ Ø§Ù„Ø±Ø£Ø³ Ù…ØªÙ‚Ø·Ø¹Ø© Ù…Ù†Ø° 3 Ø£Ø³Ø§Ø¨ÙŠØ¹. Ø§Ù„Ø¶ØºØ· ÙŠØµÙ„ Ø£Ø­ÙŠØ§Ù†Ø§Ù‹ Ø¥Ù„Ù‰ 150/95.',
 NULL, 'APPROVED', 'urgent',
 'Ù„Ø¯ÙŠ Ø­Ø³Ø§Ø³ÙŠØ© Ù…Ù† Aspirin ÙˆIbuprofen. Ø£ØªÙ†Ø§ÙˆÙ„ Ø­Ø§Ù„ÙŠØ§Ù‹ Metformin Ù„Ù„Ø³ÙƒØ±ÙŠ.'),

-- REQ-2: Karim â†’ Dr.Amine, LAB, APPROVED
('e2222222-2222-2222-2222-222222222222',
 '11111111-1111-1111-1111-111111111111',
 '22222222-2222-2222-2222-222222222222',
 'LAB',
 NULL,
 '[{"name":"ØµÙˆØ±Ø© Ø§Ù„Ø¯Ù… Ø§Ù„ÙƒØ§Ù…Ù„Ø©","code":"CBC"},{"name":"Ø³ÙƒØ± Ø§Ù„Ø¯Ù… Ø§Ù„ØµØ§Ø¦Ù…","code":"FBG"},{"name":"Ø§Ù„Ù‡ÙŠÙ…ÙˆØºÙ„ÙˆØ¨ÙŠÙ† Ø§Ù„Ø³ÙƒØ±ÙŠ HbA1c","code":"HBA1C"},{"name":"ÙˆØ¸Ø§Ø¦Ù Ø§Ù„ÙƒÙ„Ù‰","code":"RENAL"},{"name":"Ø§Ù„ÙƒÙˆÙ„ÙŠØ³ØªØ±ÙˆÙ„ Ø§Ù„ÙƒÙ„ÙŠ","code":"CHOL"}]',
 'APPROVED', 'urgent',
 'ØªØ­Ø§Ù„ÙŠÙ„ Ø¯ÙˆØ±ÙŠØ© Ù„Ù…ØªØ§Ø¨Ø¹Ø© Ù…Ø±Ø¶ Ø§Ù„Ø³ÙƒØ±ÙŠ ÙˆØ¶ØºØ· Ø§Ù„Ø¯Ù…'),

-- REQ-3: Nadia â†’ Dr.Sara, PRESCRIPTION, APPROVED
('e3333333-3333-3333-3333-333333333333',
 'aaaa1111-1111-1111-1111-111111111111',
 'bbbb2222-2222-2222-2222-222222222222',
 'PRESCRIPTION',
 'Ø®ÙÙ‚Ø§Ù† ÙÙŠ Ø§Ù„Ù‚Ù„Ø¨ ÙˆØ¥Ø¬Ù‡Ø§Ø¯ Ø³Ø±ÙŠØ¹ Ø¹Ù†Ø¯ Ø¨Ø°Ù„ Ø£ÙŠ Ù…Ø¬Ù‡ÙˆØ¯. Ø£Ø¹Ø§Ù†ÙŠ Ù…Ù† Ø¶ÙŠÙ‚ ÙÙŠ Ø§Ù„ØªÙ†ÙØ³ Ø¹Ù†Ø¯ ØµØ¹ÙˆØ¯ Ø§Ù„Ø¯Ø±Ø¬.',
 NULL, 'APPROVED', 'urgent',
 'ØªØ§Ø±ÙŠØ® Ø¹Ø§Ø¦Ù„ÙŠ Ø¨Ø£Ù…Ø±Ø§Ø¶ Ø§Ù„Ù‚Ù„Ø¨. Ø£Ø¨ÙŠ Ø£ÙØ¬Ø±ÙŠØª Ù„Ù‡ Ø¹Ù…Ù„ÙŠØ© Ù‚Ù„Ø¨ Ù…ÙØªÙˆØ­.'),

-- REQ-4: Nadia â†’ Dr.Sara, LAB, APPROVED
('e4444444-4444-4444-4444-444444444444',
 'aaaa1111-1111-1111-1111-111111111111',
 'bbbb2222-2222-2222-2222-222222222222',
 'LAB',
 NULL,
 '[{"name":"ØªØ®Ø·ÙŠØ· ÙƒÙ‡Ø±Ø¨Ø§Ø¦ÙŠØ© Ø§Ù„Ù‚Ù„Ø¨ ECG","code":"ECG"},{"name":"Ø¥Ù†Ø²ÙŠÙ…Ø§Øª Ø§Ù„Ù‚Ù„Ø¨ Troponin","code":"TROP"},{"name":"ØµÙˆØ±Ø© Ø§Ù„Ø¯Ù… Ø§Ù„ÙƒØ§Ù…Ù„Ø©","code":"CBC"},{"name":"Ø§Ù„Ø¯Ù‡ÙˆÙ† Ø§Ù„Ø«Ù„Ø§Ø«ÙŠØ©","code":"TG"}]',
 'APPROVED', 'urgent', NULL),

-- REQ-5: Karim â†’ Broadcast (PENDING - no doctor)
('e5555555-5555-5555-5555-555555555555',
 '11111111-1111-1111-1111-111111111111',
 NULL,
 'PRESCRIPTION',
 'Ø·ÙØ­ Ø¬Ù„Ø¯ÙŠ Ø¹Ù„Ù‰ Ø§Ù„Ø°Ø±Ø§Ø¹ÙŠÙ† ÙˆØ§Ù„ØµØ¯Ø± Ù…Ù†Ø° ÙŠÙˆÙ…ÙŠÙ† Ù…Ø¹ Ø­ÙƒØ© Ø´Ø¯ÙŠØ¯Ø©. Ù„Ø§ Ø£Ø¹Ø±Ù Ø³Ø¨Ø¨Ù‡.',
 NULL, 'PENDING', 'normal', NULL),

-- REQ-6: Nadia â†’ Broadcast (PENDING)
('e6666666-6666-6666-6666-666666666666',
 'aaaa1111-1111-1111-1111-111111111111',
 NULL,
 'ROUTINE_LAB',
 NULL,
 '[{"name":"ÙÙŠØªØ§Ù…ÙŠÙ† D","code":"VIT-D"},{"name":"ÙÙŠØªØ§Ù…ÙŠÙ† B12","code":"VIT-B12"},{"name":"Ø§Ù„Ø­Ø¯ÙŠØ¯ ÙˆÙÙŠØ±ÙŠØªÙŠÙ†","code":"FERR"}]',
 'PENDING', 'normal', 'ÙØ­Øµ Ø¯ÙˆØ±ÙŠ Ø³Ù†ÙˆÙŠ')
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- 5. DOCTOR RESPONSES
-- ================================================================
INSERT INTO public.doctor_responses (id, request_id, doctor_id, action, notes)
VALUES
-- Dr.Amine â†’ REQ-1 (APPROVE)
('de111111-1111-1111-1111-111111111111',
 'e1111111-1111-1111-1111-111111111111',
 '22222222-2222-2222-2222-222222222222',
 'APPROVE',
 'ØªÙ…Øª Ø§Ù„Ù…ÙˆØ§ÙÙ‚Ø©. ØªÙ… ÙˆØµÙ Amlodipine Ù„ØªÙ†Ø¸ÙŠÙ… Ø¶ØºØ· Ø§Ù„Ø¯Ù… Ø¨Ø¯Ù„Ø§Ù‹ Ù…Ù† Aspirin Ù†Ø¸Ø±Ø§Ù‹ Ù„Ù„Ø­Ø³Ø§Ø³ÙŠØ©. ÙŠØ±Ø¬Ù‰ Ù‚ÙŠØ§Ø³ Ø§Ù„Ø¶ØºØ· ÙŠÙˆÙ…ÙŠØ§Ù‹ ÙˆØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ù†ØªØ§Ø¦Ø¬.'),

-- Dr.Amine â†’ REQ-2 (APPROVE)
('de222222-2222-2222-2222-222222222222',
 'e2222222-2222-2222-2222-222222222222',
 '22222222-2222-2222-2222-222222222222',
 'APPROVE',
 'ØªØ­Ø§Ù„ÙŠÙ„ Ø±ÙˆØªÙŠÙ†ÙŠØ© Ø¶Ø±ÙˆØ±ÙŠØ©. ÙŠØ±Ø¬Ù‰ Ø§Ù„Ù…Ø¬ÙŠØ¡ ØµØ§Ø¦Ù…Ø§Ù‹ 10 Ø³Ø§Ø¹Ø§Øª Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„. Ù„Ø§ ØªØ´Ø±Ø¨ Ø³ÙˆÙ‰ Ø§Ù„Ù…Ø§Ø¡.'),

-- Dr.Sara â†’ REQ-3 (APPROVE)
('de333333-3333-3333-3333-333333333333',
 'e3333333-3333-3333-3333-333333333333',
 'bbbb2222-2222-2222-2222-222222222222',
 'APPROVE',
 'Ø§Ù„Ø£Ø¹Ø±Ø§Ø¶ ØªØ³ØªÙˆØ¬Ø¨ Ø§Ù„Ù…ØªØ§Ø¨Ø¹Ø© Ø§Ù„Ø¯Ù‚ÙŠÙ‚Ø©. ØªÙ… ÙˆØµÙ Beta-blocker Ù„ØªÙ†Ø¸ÙŠÙ… Ø¶Ø±Ø¨Ø§Øª Ø§Ù„Ù‚Ù„Ø¨. Ù…Ø±Ø§Ø¬Ø¹Ø© Ø¹Ø§Ø¬Ù„Ø© Ø®Ù„Ø§Ù„ Ø£Ø³Ø¨ÙˆØ¹.'),

-- Dr.Sara â†’ REQ-4 (APPROVE)
('de444444-4444-4444-4444-444444444444',
 'e4444444-4444-4444-4444-444444444444',
 'bbbb2222-2222-2222-2222-222222222222',
 'APPROVE',
 'ØªØ­Ø§Ù„ÙŠÙ„ Ù‚Ù„Ø¨ÙŠØ© Ø¹Ø§Ø¬Ù„Ø©. ÙŠØ±Ø¬Ù‰ Ø¥Ø¬Ø±Ø§Ø¤Ù‡Ø§ Ø§Ù„ÙŠÙˆÙ… Ø¥Ù† Ø£Ù…ÙƒÙ†.')
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
   {"name":"Amlodipine","dose":"5mg","frequency":"Ù…Ø±Ø© ÙŠÙˆÙ…ÙŠØ§Ù‹ ØµØ¨Ø§Ø­Ø§Ù‹","duration":"Ø´Ù‡Ø± ÙˆØ§Ø­Ø¯","notes":"Ù…Ø¹ Ø§Ù„Ø£ÙƒÙ„ Ø£Ùˆ Ø¨Ø¯ÙˆÙ†Ù‡"},
   {"name":"Candesartan","dose":"8mg","frequency":"Ù…Ø±Ø© ÙŠÙˆÙ…ÙŠØ§Ù‹ Ù…Ø³Ø§Ø¡Ù‹","duration":"Ø´Ù‡Ø± ÙˆØ§Ø­Ø¯","notes":"Ø±Ø§Ù‚Ø¨ Ø¶ØºØ· Ø§Ù„Ø¯Ù…"},
   {"name":"Metformin","dose":"1000mg","frequency":"Ù…Ø±ØªØ§Ù† ÙŠÙˆÙ…ÙŠØ§Ù‹","duration":"Ù…Ø³ØªÙ…Ø±","notes":"Ù…Ø¹ Ø§Ù„ÙˆØ¬Ø¨Ø§Øª Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©"}
 ]',
 'ØªØ¬Ù†Ø¨ Ø§Ù„Ù…Ù„Ø­ ÙˆØ§Ù„Ø¯Ù‡ÙˆÙ† Ø§Ù„Ù…Ø´Ø¨Ø¹Ø©. Ù…Ù…Ø§Ø±Ø³Ø© Ø§Ù„Ù…Ø´ÙŠ 30 Ø¯Ù‚ÙŠÙ‚Ø© ÙŠÙˆÙ…ÙŠØ§Ù‹. Ù…Ø±Ø§Ø¬Ø¹Ø© Ø¨Ø¹Ø¯ Ø´Ù‡Ø± Ù…Ø¹ Ù†ØªØ§Ø¦Ø¬ Ø§Ù„ØªØ­Ø§Ù„ÙŠÙ„.'),

-- Nadia's prescription (Req-3)
('ac222222-2222-2222-2222-222222222222',
 'e3333333-3333-3333-3333-333333333333',
 'de333333-3333-3333-3333-333333333333',
 'aaaa1111-1111-1111-1111-111111111111',
 'bbbb2222-2222-2222-2222-222222222222',
 '[
   {"name":"Bisoprolol","dose":"2.5mg","frequency":"Ù…Ø±Ø© ÙŠÙˆÙ…ÙŠØ§Ù‹ ØµØ¨Ø§Ø­Ø§Ù‹","duration":"Ø´Ù‡Ø± ÙˆØ§Ø­Ø¯","notes":"Ù„Ø§ ØªØªÙˆÙ‚Ù Ø¹Ù† Ø§Ù„Ø£Ø®Ø° ÙØ¬Ø£Ø©"},
   {"name":"Aspirin","dose":"100mg","frequency":"Ù…Ø±Ø© ÙŠÙˆÙ…ÙŠØ§Ù‹ Ù…Ø³Ø§Ø¡Ù‹","duration":"Ù…Ø³ØªÙ…Ø±","notes":"Ø¨Ø¹Ø¯ Ø§Ù„Ø£ÙƒÙ„ Ù…Ø¨Ø§Ø´Ø±Ø©"},
   {"name":"Rosuvastatin","dose":"10mg","frequency":"Ù…Ø±Ø© ÙŠÙˆÙ…ÙŠØ§Ù‹ Ù„ÙŠÙ„Ø§Ù‹","duration":"3 Ø£Ø´Ù‡Ø±","notes":"ÙØ­Øµ ÙˆØ¸Ø§Ø¦Ù Ø§Ù„ÙƒØ¨Ø¯ Ø¨Ø¹Ø¯ 3 Ø£Ø´Ù‡Ø±"}
 ]',
 'ØªØ¬Ù†Ø¨ Ø§Ù„Ù…Ø¬Ù‡ÙˆØ¯ Ø§Ù„Ø´Ø¯ÙŠØ¯. Ø­Ø¶ÙˆØ± Ø£ÙŠ Ø£Ù„Ù… ÙÙŠ Ø§Ù„ØµØ¯Ø± Ø£Ùˆ Ø¶ÙŠÙ‚ ØªÙ†ÙØ³ Ù…ÙØ§Ø¬Ø¦ ÙŠØ³ØªÙˆØ¬Ø¨ Ø§Ù„ØªÙˆØ¬Ù‡ Ù„Ù„Ø·ÙˆØ§Ø±Ø¦ ÙÙˆØ±Ø§Ù‹.')
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- 7. LAB REQUESTS (patient assigned lab)
-- ================================================================
INSERT INTO public.lab_requests (id, request_id, patient_id, doctor_id, lab_id, tests_list, doctor_notes, status)
VALUES
-- Karim's lab (Req-2) â†’ Ibn Sina, PROCESSING
('ab111111-1111-1111-1111-111111111111',
 'e2222222-2222-2222-2222-222222222222',
 '11111111-1111-1111-1111-111111111111',
 '22222222-2222-2222-2222-222222222222',
 '33333333-3333-3333-3333-333333333333',
 '[
   {"name":"ØµÙˆØ±Ø© Ø§Ù„Ø¯Ù… Ø§Ù„ÙƒØ§Ù…Ù„Ø©","code":"CBC"},
   {"name":"Ø³ÙƒØ± Ø§Ù„Ø¯Ù… Ø§Ù„ØµØ§Ø¦Ù…","code":"FBG"},
   {"name":"Ø§Ù„Ù‡ÙŠÙ…ÙˆØºÙ„ÙˆØ¨ÙŠÙ† Ø§Ù„Ø³ÙƒØ±ÙŠ HbA1c","code":"HBA1C"},
   {"name":"ÙˆØ¸Ø§Ø¦Ù Ø§Ù„ÙƒÙ„Ù‰","code":"RENAL"},
   {"name":"Ø§Ù„ÙƒÙˆÙ„ÙŠØ³ØªØ±ÙˆÙ„ Ø§Ù„ÙƒÙ„ÙŠ","code":"CHOL"}
 ]',
 'Ø§Ù„Ù…Ø±ÙŠØ¶ ØµØ§Ø¦Ù…. Ø¹Ø§Ø¬Ù„. ÙŠØ±Ø¬Ù‰ Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ù†ØªØ§Ø¦Ø¬ ÙÙŠ Ù†ÙØ³ Ø§Ù„ÙŠÙˆÙ….',
 'PROCESSING'),

-- Nadia's lab (Req-4) â†’ Ibn Sina, COMPLETED
('ab222222-2222-2222-2222-222222222222',
 'e4444444-4444-4444-4444-444444444444',
 'aaaa1111-1111-1111-1111-111111111111',
 'bbbb2222-2222-2222-2222-222222222222',
 '33333333-3333-3333-3333-333333333333',
 '[
   {"name":"ØªØ®Ø·ÙŠØ· ÙƒÙ‡Ø±Ø¨Ø§Ø¦ÙŠØ© Ø§Ù„Ù‚Ù„Ø¨ ECG","code":"ECG"},
   {"name":"Ø¥Ù†Ø²ÙŠÙ…Ø§Øª Ø§Ù„Ù‚Ù„Ø¨ Troponin","code":"TROP"},
   {"name":"ØµÙˆØ±Ø© Ø§Ù„Ø¯Ù… Ø§Ù„ÙƒØ§Ù…Ù„Ø©","code":"CBC"},
   {"name":"Ø§Ù„Ø¯Ù‡ÙˆÙ† Ø§Ù„Ø«Ù„Ø§Ø«ÙŠØ©","code":"TG"}
 ]',
 'Ø¹Ø§Ø¬Ù„ Ø¬Ø¯Ø§Ù‹. Ø§Ù„Ø·Ø¨ÙŠØ¨Ø© ØªÙ†ØªØ¸Ø± Ø§Ù„Ù†ØªØ§Ø¦Ø¬.',
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
 'Ø§Ù„Ù†ØªØ§Ø¦Ø¬: CBC - Ø·Ø¨ÙŠØ¹ÙŠ (Hb: 12.8 g/dL). Troponin - Ø¶Ù…Ù† Ø§Ù„Ø­Ø¯ Ø§Ù„Ø·Ø¨ÙŠØ¹ÙŠ (0.01 ng/mL). Ø§Ù„Ø¯Ù‡ÙˆÙ† Ø§Ù„Ø«Ù„Ø§Ø«ÙŠØ© Ù…Ø±ØªÙØ¹Ø© Ù‚Ù„ÙŠÙ„Ø§Ù‹ (TG: 195 mg/dL). ECG ÙŠÙØ¸Ù‡Ø± ØªØ³Ø§Ø±Ø¹ Ø®ÙÙŠÙ ÙÙŠ Ù†Ø¨Ø¶ Ø§Ù„Ù‚Ù„Ø¨ (HR: 98 bpm). ÙŠÙÙ†ØµØ­ Ø¨Ù…Ø±Ø§Ø¬Ø¹Ø© Ø§Ù„Ø·Ø¨ÙŠØ¨Ø© Ù„ØªÙ‚ÙŠÙŠÙ… Ø§Ù„Ù†ØªØ§Ø¦Ø¬.')
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- 9. PHARMACY ORDERS
-- ================================================================
INSERT INTO public.pharmacy_orders (id, prescription_id, patient_id, pharmacy_id, status, payment_status, pharmacy_notes)
VALUES
-- Karim sent his prescription â†’ Al Amal Pharmacy, PROCESSING
('fa111111-1111-1111-1111-111111111111',
 'ac111111-1111-1111-1111-111111111111',
 '11111111-1111-1111-1111-111111111111',
 '44444444-4444-4444-4444-444444444444',
 'PROCESSING', 'offline',
 'Ø¬Ø§Ø±ÙŠ ØªØ­Ø¶ÙŠØ± Ø§Ù„Ø£Ø¯ÙˆÙŠØ©. Amlodipine Ùˆ Candesartan Ù…ØªÙˆÙØ±Ø©. Metformin 1000mg ØªØ­Øª Ø§Ù„Ø·Ù„Ø¨.'),

-- Nadia sent her prescription â†’ Al Amal Pharmacy, COMPLETED
('fa222222-2222-2222-2222-222222222222',
 'ac222222-2222-2222-2222-222222222222',
 'aaaa1111-1111-1111-1111-111111111111',
 '44444444-4444-4444-4444-444444444444',
 'COMPLETED', 'offline',
 'ØªÙ… ØªØ³Ù„ÙŠÙ… Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø£Ø¯ÙˆÙŠØ©. Bisoprolol, Aspirin, Rosuvastatin. ØªØ°ÙƒÙŠØ±: Ù„Ø§ ØªØªÙˆÙ‚Ù Ø¹Ù† Bisoprolol ÙØ¬Ø£Ø©.')
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- âœ… Real Data Seed Complete!
-- ================================================================
-- ACCOUNTS (password: 123456):
--   Patient   : patient@test.com
--   Patient 2 : patient2@test.com
--   Doctor    : doctor@test.com
--   Doctor 2  : doctor2@test.com
--   Lab       : lab@test.com
--   Pharmacy  : pharmacy@test.com
--   Admin     : admin@test.com
-- ================================================================

