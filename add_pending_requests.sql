-- ================================================================
-- إضافة طلبات معلقة جديدة (للطبيب، للمخبر، وللصيدلية)
-- تستخدم UUIDs الفعلية من جدول profiles
-- ================================================================

-- أولاً: نحصل على UUIDs الفعلية من جدول profiles
-- الطبيب 1: doctor11@test.com -> UUID = 21000000-0000-0000-0000-000000000000
-- المريض 1: patient11@test.com -> UUID = 11000000-0000-0000-0000-000000000000
-- المريض 2: patient12@test.com -> UUID = 12000000-0000-0000-0000-000000000000
-- المريض 3: patient13@test.com -> UUID = 13000000-0000-0000-0000-000000000000
-- المخبر 1: lab11@test.com -> UUID = 31000000-0000-0000-0000-000000000000
-- الصيدلية 1: pharmacy11@test.com -> UUID = 41000000-0000-0000-0000-000000000000

-- *** نجلب UUIDs الفعلية من auth.users بالإيميل ***
DO $$
DECLARE
  v_doctor_id   uuid;
  v_patient1_id uuid;
  v_patient2_id uuid;
  v_patient3_id uuid;
  v_lab_id      uuid;
  v_pharmacy_id uuid;
BEGIN
  SELECT id INTO v_doctor_id   FROM auth.users WHERE email = 'doctor11@test.com'  LIMIT 1;
  SELECT id INTO v_patient1_id FROM auth.users WHERE email = 'patient11@test.com' LIMIT 1;
  SELECT id INTO v_patient2_id FROM auth.users WHERE email = 'patient12@test.com' LIMIT 1;
  SELECT id INTO v_patient3_id FROM auth.users WHERE email = 'patient13@test.com' LIMIT 1;
  SELECT id INTO v_lab_id      FROM auth.users WHERE email = 'lab11@test.com'     LIMIT 1;
  SELECT id INTO v_pharmacy_id FROM auth.users WHERE email = 'pharmacy11@test.com' LIMIT 1;

  -- ================================================================
  -- 1. طلب طبي معلق عند الطبيب (من المريض 1)
  -- ================================================================
  INSERT INTO public.medical_requests (id, patient_id, doctor_id, type, symptoms, tests_requested, status, priority, patient_notes)
  VALUES (
    'A0000000-0000-0000-0000-000000000001',
    v_patient1_id,
    v_doctor_id,
    'PRESCRIPTION',
    'أعاني من سعال جاف مستمر وحمى خفيفة منذ 3 أيام',
    NULL,
    'PENDING',
    'normal',
    'أحتاج استشارة ووصفة طبية مناسبة'
  )
  ON CONFLICT (id) DO UPDATE SET status = 'PENDING';

  -- ================================================================
  -- 2. طلب مخبري معلق عند المخبر (من المريض 2 عبر الطبيب)
  -- ================================================================
  -- أولاً: الطلب الطبي الأصلي (يجب أن يكون APPROVED)
  INSERT INTO public.medical_requests (id, patient_id, doctor_id, type, symptoms, status, priority)
  VALUES (
    'A0000000-0000-0000-0000-000000000002',
    v_patient2_id,
    v_doctor_id,
    'LAB',
    'إرهاق عام وفقر دم مشتبه به',
    'APPROVED',
    'normal'
  )
  ON CONFLICT (id) DO UPDATE SET status = 'APPROVED';

  -- ثانياً: الطلب المخبري المعلق
  INSERT INTO public.lab_requests (id, request_id, patient_id, doctor_id, lab_id, tests_list, doctor_notes, status)
  VALUES (
    'A0000000-0000-0000-0000-000000000010',
    'A0000000-0000-0000-0000-000000000002',
    v_patient2_id,
    v_doctor_id,
    v_lab_id,
    '[{"name":"تحليل دم شامل","code":"CBC"},{"name":"تحليل الحديد","code":"FE"}]',
    'يرجى إجراء التحاليل في أقرب وقت - المريض يعاني من إرهاق',
    'PENDING'
  )
  ON CONFLICT (id) DO UPDATE SET status = 'PENDING';

  -- ================================================================
  -- 3. طلب صيدلية معلق عند الصيدلية (من المريض 3)
  -- ================================================================
  -- الطلب الطبي
  INSERT INTO public.medical_requests (id, patient_id, doctor_id, type, status)
  VALUES (
    'A0000000-0000-0000-0000-000000000003',
    v_patient3_id,
    v_doctor_id,
    'PRESCRIPTION',
    'APPROVED'
  )
  ON CONFLICT (id) DO UPDATE SET status = 'APPROVED';

  -- رد الطبيب
  INSERT INTO public.doctor_responses (id, request_id, doctor_id, action, notes)
  VALUES (
    'A0000000-0000-0000-0000-000000000020',
    'A0000000-0000-0000-0000-000000000003',
    v_doctor_id,
    'APPROVE',
    'تم وصف مضاد حيوي للمريض'
  )
  ON CONFLICT (id) DO NOTHING;

  -- الوصفة الطبية
  INSERT INTO public.prescriptions (id, request_id, response_id, patient_id, doctor_id, medications, doctor_notes)
  VALUES (
    'A0000000-0000-0000-0000-000000000030',
    'A0000000-0000-0000-0000-000000000003',
    'A0000000-0000-0000-0000-000000000020',
    v_patient3_id,
    v_doctor_id,
    '[{"name":"Amoxicillin 500mg","dose":"500mg","frequency":"مرتين يومياً","duration":"7 أيام","notes":"بعد الأكل"},{"name":"Paracétamol 1g","dose":"1g","frequency":"عند اللزوم","duration":"5 أيام","notes":"لا تتجاوز 3 حبات يومياً"}]',
    'الالتزام بالجرعة الكاملة وعدم الإيقاف المبكر'
  )
  ON CONFLICT (id) DO NOTHING;

  -- طلب الصيدلية المعلق
  INSERT INTO public.pharmacy_orders (id, prescription_id, patient_id, pharmacy_id, status, payment_status, pharmacy_notes)
  VALUES (
    'A0000000-0000-0000-0000-000000000040',
    'A0000000-0000-0000-0000-000000000030',
    v_patient3_id,
    v_pharmacy_id,
    'PENDING',
    'pending',
    ''
  )
  ON CONFLICT (id) DO UPDATE SET status = 'PENDING';

  RAISE NOTICE 'تم إدراج الطلبات المعلقة بنجاح!';
  RAISE NOTICE 'doctor_id = %', v_doctor_id;
  RAISE NOTICE 'lab_id    = %', v_lab_id;
  RAISE NOTICE 'pharmacy_id = %', v_pharmacy_id;
END $$;
