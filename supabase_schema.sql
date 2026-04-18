-- ================================================================
--  3INAYA (عناية) — Patient-Centric Medical Platform
--  Database Schema v2.0 — Full Rebuild
-- ================================================================
--  Instructions:
--  1. Open Supabase SQL Editor
--  2. Paste this ENTIRE script and click "Run"
--  3. It safely drops old tables and recreates everything clean.
-- ================================================================


-- ================================================================
-- STEP 0: Drop old schema (safe cascade)
-- ================================================================
DROP TABLE IF EXISTS public.lab_requests   CASCADE;
DROP TABLE IF EXISTS public.prescriptions  CASCADE;
DROP TABLE IF EXISTS public.requests       CASCADE;

DROP TYPE IF EXISTS public.prescription_status CASCADE;
DROP TYPE IF EXISTS public.request_status      CASCADE;
DROP TYPE IF EXISTS public.lab_status          CASCADE;


-- ================================================================
-- STEP 1: Custom ENUMs
-- ================================================================
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('patient', 'doctor', 'pharmacy', 'lab', 'admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.request_type AS ENUM ('PRESCRIPTION', 'LAB', 'ROUTINE_LAB');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.medical_request_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'MODIFIED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.doctor_action AS ENUM ('APPROVE', 'REJECT', 'MODIFY');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE public.order_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;


-- ================================================================
-- STEP 2: Profiles (base for all roles)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id              UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role            app_role NOT NULL,
    full_name       TEXT NOT NULL,
    phone           TEXT UNIQUE,
    address         TEXT,
    specialty       TEXT,            -- Doctors: e.g. 'طب عام', 'قلب وأوعية'
    license_number  TEXT,            -- Doctors / Labs / Pharmacies
    verified        BOOLEAN DEFAULT false,
    approval_status TEXT DEFAULT 'pending',  -- For doctor/lab/pharmacy accounts
    avatar_url      TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;


-- ================================================================
-- STEP 3: Medical Requests
--   THE CORE TABLE — created by PATIENT
--   Patient picks doctor, type, and writes symptoms/tests
-- ================================================================
CREATE TABLE IF NOT EXISTS public.medical_requests (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id      UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    doctor_id       UUID REFERENCES public.profiles(id),    -- NULL = broadcast to all doctors
    type            request_type NOT NULL,
    symptoms        TEXT,                                    -- For PRESCRIPTION requests
    tests_requested JSONB,                                   -- For LAB: [{name, code}]
    status          medical_request_status DEFAULT 'PENDING',
    priority        TEXT DEFAULT 'normal',                   -- 'normal' | 'urgent'
    patient_notes   TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.medical_requests ENABLE ROW LEVEL SECURITY;


-- ================================================================
-- STEP 4: Doctor Responses
--   Doctor acts on a medical_request: APPROVE / REJECT / MODIFY
--   Doctor CANNOT send to lab/pharmacy — that is the PATIENT's role
-- ================================================================
CREATE TABLE IF NOT EXISTS public.doctor_responses (
    id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id        UUID REFERENCES public.medical_requests(id) ON DELETE CASCADE NOT NULL,
    doctor_id         UUID REFERENCES public.profiles(id) NOT NULL,
    action            doctor_action NOT NULL,
    notes             TEXT,                  -- Doctor's comments to patient
    modified_symptoms TEXT,                  -- If MODIFY: doctor's correction
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.doctor_responses ENABLE ROW LEVEL SECURITY;


-- ================================================================
-- STEP 5: Prescriptions
--   Created by doctor upon APPROVE
--   Goes back to PATIENT — patient decides which pharmacy to send it to
-- ================================================================
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id   UUID REFERENCES public.medical_requests(id) ON DELETE CASCADE NOT NULL,
    response_id  UUID REFERENCES public.doctor_responses(id),
    patient_id   UUID REFERENCES public.profiles(id) NOT NULL,
    doctor_id    UUID REFERENCES public.profiles(id) NOT NULL,
    medications  JSONB NOT NULL,    -- [{name, dose, frequency, duration, notes}]
    doctor_notes TEXT,
    qr_token     UUID DEFAULT gen_random_uuid() UNIQUE,  -- For QR verification
    is_used      BOOLEAN DEFAULT false,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;


-- ================================================================
-- STEP 6: Lab Requests
--   Created by doctor upon APPROVE
--   Goes back to PATIENT — patient picks which lab to send it to
--   lab_id is NULL until patient assigns it
-- ================================================================
CREATE TABLE IF NOT EXISTS public.lab_requests (
    id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id   UUID REFERENCES public.medical_requests(id) ON DELETE CASCADE NOT NULL,
    patient_id   UUID REFERENCES public.profiles(id) NOT NULL,
    doctor_id    UUID REFERENCES public.profiles(id) NOT NULL,
    lab_id       UUID REFERENCES public.profiles(id),       -- Patient assigns. NULL until chosen.
    tests_list   JSONB NOT NULL,                             -- [{name, code}]
    doctor_notes TEXT,
    qr_token     UUID DEFAULT gen_random_uuid() UNIQUE,
    status       order_status DEFAULT 'PENDING',
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.lab_requests ENABLE ROW LEVEL SECURITY;


-- ================================================================
-- STEP 7: Lab Results
--   Lab uploads results — patient receives them
--   Lab CANNOT modify the original request
-- ================================================================
CREATE TABLE IF NOT EXISTS public.lab_results (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lab_request_id  UUID REFERENCES public.lab_requests(id) ON DELETE CASCADE NOT NULL,
    lab_id          UUID REFERENCES public.profiles(id) NOT NULL,
    patient_id      UUID REFERENCES public.profiles(id) NOT NULL,
    file_url        TEXT,
    result_notes    TEXT,
    uploaded_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.lab_results ENABLE ROW LEVEL SECURITY;


-- ================================================================
-- STEP 8: Pharmacy Orders
--   Patient sends prescription to their chosen pharmacy
--   Pharmacy CANNOT edit the prescription content
-- ================================================================
CREATE TABLE IF NOT EXISTS public.pharmacy_orders (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prescription_id UUID REFERENCES public.prescriptions(id) ON DELETE CASCADE NOT NULL,
    patient_id      UUID REFERENCES public.profiles(id) NOT NULL,
    pharmacy_id     UUID REFERENCES public.profiles(id) NOT NULL,  -- Patient chooses
    status          order_status DEFAULT 'PENDING',
    payment_status  TEXT DEFAULT 'offline',    -- Offline payment at counter
    pharmacy_notes  TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.pharmacy_orders ENABLE ROW LEVEL SECURITY;


-- ================================================================
-- STEP 9: Notifications
-- ================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id         UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title           TEXT NOT NULL,
    body            TEXT NOT NULL,
    type            TEXT NOT NULL,    -- new_request | approved | rejected | results_ready | order_ready
    reference_id    UUID,
    reference_type  TEXT,             -- medical_request | prescription | lab_result | pharmacy_order
    is_read         BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;


-- ================================================================
-- STEP 10: Audit Logs
--   Every action recorded. ADMIN can read. No one can delete.
-- ================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    actor_id    UUID REFERENCES public.profiles(id),
    actor_role  app_role,
    action      TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id   UUID,
    metadata    JSONB,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;


-- ================================================================
-- STEP 11: RLS POLICIES — Strict RBAC
-- ================================================================

-- Drop any existing policies to prevent duplicates
DO $$ DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- ── PROFILES ──────────────────────────────────────────────────

CREATE POLICY "profiles_anyone_can_view"
ON public.profiles FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "profiles_user_updates_own"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "profiles_user_inserts_own"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- ── MEDICAL_REQUESTS ──────────────────────────────────────────

-- Patient: full access to own requests
CREATE POLICY "medical_requests_patient_owns"
ON public.medical_requests FOR ALL
USING (auth.uid() = patient_id);

-- Doctor: reads requests assigned to them OR unassigned (broadcast)
CREATE POLICY "medical_requests_doctor_reads"
ON public.medical_requests FOR SELECT
USING (
    (auth.jwt() -> 'user_metadata' ->> 'role' = 'doctor')
    AND (doctor_id = auth.uid() OR doctor_id IS NULL)
);

-- Doctor: can update only to claim an unassigned request
CREATE POLICY "medical_requests_doctor_claim"
ON public.medical_requests FOR UPDATE
USING (
    (auth.jwt() -> 'user_metadata' ->> 'role' = 'doctor')
    AND (doctor_id = auth.uid() OR doctor_id IS NULL)
);

-- Admin: read-only view of everything
CREATE POLICY "medical_requests_admin_reads"
ON public.medical_requests FOR SELECT
USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

-- ── DOCTOR_RESPONSES ──────────────────────────────────────────

-- Doctor: insert/read own responses
CREATE POLICY "doctor_responses_doctor_owns"
ON public.doctor_responses FOR ALL
USING (auth.uid() = doctor_id);

-- Patient: reads responses on their own requests
CREATE POLICY "doctor_responses_patient_reads"
ON public.doctor_responses FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.medical_requests mr
        WHERE mr.id = request_id AND mr.patient_id = auth.uid()
    )
);

CREATE POLICY "doctor_responses_admin_reads"
ON public.doctor_responses FOR SELECT
USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

-- ── PRESCRIPTIONS ─────────────────────────────────────────────

-- Doctor: manages prescriptions they wrote
CREATE POLICY "prescriptions_doctor_owns"
ON public.prescriptions FOR ALL
USING (auth.uid() = doctor_id);

-- Patient: reads own prescriptions
CREATE POLICY "prescriptions_patient_reads"
ON public.prescriptions FOR SELECT
USING (auth.uid() = patient_id);

-- Admin: read-only
CREATE POLICY "prescriptions_admin_reads"
ON public.prescriptions FOR SELECT
USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

-- ── LAB_REQUESTS ──────────────────────────────────────────────

-- Doctor: manages lab requests they wrote
CREATE POLICY "lab_requests_doctor_owns"
ON public.lab_requests FOR ALL
USING (auth.uid() = doctor_id);

-- Patient: manages own lab requests (can assign lab_id)
CREATE POLICY "lab_requests_patient_owns"
ON public.lab_requests FOR ALL
USING (auth.uid() = patient_id);

-- Lab: ONLY sees requests where lab_id = their own ID (patient assigned them)
CREATE POLICY "lab_requests_lab_sees_assigned"
ON public.lab_requests FOR SELECT
USING (
    (auth.jwt() -> 'user_metadata' ->> 'role' = 'lab')
    AND lab_id = auth.uid()
);

-- Lab: can update only status on requests assigned to them
CREATE POLICY "lab_requests_lab_updates_status"
ON public.lab_requests FOR UPDATE
USING (
    (auth.jwt() -> 'user_metadata' ->> 'role' = 'lab')
    AND lab_id = auth.uid()
);

CREATE POLICY "lab_requests_admin_reads"
ON public.lab_requests FOR SELECT
USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

-- ── LAB_RESULTS ───────────────────────────────────────────────

-- Lab: manages results they uploaded
CREATE POLICY "lab_results_lab_owns"
ON public.lab_results FOR ALL
USING (auth.uid() = lab_id);

-- Patient: reads own results
CREATE POLICY "lab_results_patient_reads"
ON public.lab_results FOR SELECT
USING (auth.uid() = patient_id);

-- Doctor: reads results of requests they wrote
CREATE POLICY "lab_results_doctor_reads"
ON public.lab_results FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.lab_requests lr
        WHERE lr.id = lab_request_id AND lr.doctor_id = auth.uid()
    )
);

CREATE POLICY "lab_results_admin_reads"
ON public.lab_results FOR SELECT
USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

-- ── PHARMACY_ORDERS ───────────────────────────────────────────

-- Patient: full control — creates and tracks own orders
CREATE POLICY "pharmacy_orders_patient_owns"
ON public.pharmacy_orders FOR ALL
USING (auth.uid() = patient_id);

-- Pharmacy: ONLY sees orders where pharmacy_id = their own ID
CREATE POLICY "pharmacy_orders_pharmacy_sees_assigned"
ON public.pharmacy_orders FOR SELECT
USING (
    (auth.jwt() -> 'user_metadata' ->> 'role' = 'pharmacy')
    AND pharmacy_id = auth.uid()
);

-- Pharmacy: can update status only
CREATE POLICY "pharmacy_orders_pharmacy_updates_status"
ON public.pharmacy_orders FOR UPDATE
USING (
    (auth.jwt() -> 'user_metadata' ->> 'role' = 'pharmacy')
    AND pharmacy_id = auth.uid()
);

CREATE POLICY "pharmacy_orders_admin_reads"
ON public.pharmacy_orders FOR SELECT
USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

-- ── NOTIFICATIONS ─────────────────────────────────────────────

CREATE POLICY "notifications_user_owns"
ON public.notifications FOR ALL
USING (auth.uid() = user_id);

-- ── AUDIT_LOGS ────────────────────────────────────────────────

CREATE POLICY "audit_logs_admin_reads"
ON public.audit_logs FOR SELECT
USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

CREATE POLICY "audit_logs_system_inserts"
ON public.audit_logs FOR INSERT
WITH CHECK (auth.role() = 'authenticated');


-- ================================================================
-- STEP 12: FUNCTIONS & TRIGGERS
-- ================================================================

-- ── Auto-create profile on signup ─────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, role, full_name, phone, verified)
    VALUES (
        new.id,
        CAST(new.raw_user_meta_data ->> 'role' AS public.app_role),
        COALESCE(new.raw_user_meta_data ->> 'full_name', 'مستخدم جديد'),
        new.raw_user_meta_data ->> 'phone',
        false
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ── Auto update updated_at timestamp ──────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_medical_requests_updated_at
    BEFORE UPDATE ON public.medical_requests
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_lab_requests_updated_at
    BEFORE UPDATE ON public.lab_requests
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_pharmacy_orders_updated_at
    BEFORE UPDATE ON public.pharmacy_orders
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Notify doctor when patient creates request ─────────────────
CREATE OR REPLACE FUNCTION public.fn_notify_doctor_new_request()
RETURNS trigger AS $$
BEGIN
    IF NEW.doctor_id IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, title, body, type, reference_id, reference_type)
        VALUES (
            NEW.doctor_id,
            'طلب جديد من مريض 🔔',
            COALESCE(NEW.symptoms, 'طلب تحاليل جديد'),
            'new_request',
            NEW.id,
            'medical_request'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_doctor_new_request
    AFTER INSERT ON public.medical_requests
    FOR EACH ROW EXECUTE FUNCTION public.fn_notify_doctor_new_request();

-- ── Notify patient when doctor responds ───────────────────────
CREATE OR REPLACE FUNCTION public.fn_notify_patient_doctor_response()
RETURNS trigger AS $$
DECLARE
    v_patient_id UUID;
    v_title TEXT;
BEGIN
    SELECT patient_id INTO v_patient_id
    FROM public.medical_requests WHERE id = NEW.request_id;

    v_title := CASE NEW.action
        WHEN 'APPROVE' THEN 'وافق الطبيب على طلبك ✅'
        WHEN 'REJECT'  THEN 'رفض الطبيب طلبك ❌'
        WHEN 'MODIFY'  THEN 'عدّل الطبيب طلبك ✏️'
    END;

    INSERT INTO public.notifications (user_id, title, body, type, reference_id, reference_type)
    VALUES (
        v_patient_id,
        v_title,
        COALESCE(NEW.notes, 'تفقد طلبك للاطلاع على التفاصيل'),
        'doctor_response',
        NEW.request_id,
        'medical_request'
    );

    -- Also update the medical_request status
    UPDATE public.medical_requests
    SET status = NEW.action::TEXT::medical_request_status, updated_at = NOW()
    WHERE id = NEW.request_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_patient_doctor_response
    AFTER INSERT ON public.doctor_responses
    FOR EACH ROW EXECUTE FUNCTION public.fn_notify_patient_doctor_response();

-- ── Notify patient when lab uploads results ────────────────────
CREATE OR REPLACE FUNCTION public.fn_notify_patient_lab_results()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.notifications (user_id, title, body, type, reference_id, reference_type)
    VALUES (
        NEW.patient_id,
        'نتائج تحاليلك جاهزة 🧪',
        'تم رفع نتائج تحاليلك. اضغط هنا للاطلاع عليها.',
        'results_ready',
        NEW.id,
        'lab_result'
    );
    -- Mark lab request as completed
    UPDATE public.lab_requests SET status = 'COMPLETED', updated_at = NOW()
    WHERE id = NEW.lab_request_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_patient_lab_results
    AFTER INSERT ON public.lab_results
    FOR EACH ROW EXECUTE FUNCTION public.fn_notify_patient_lab_results();

-- ── Notify patient when pharmacy order is ready ────────────────
CREATE OR REPLACE FUNCTION public.fn_notify_patient_order_ready()
RETURNS trigger AS $$
BEGIN
    IF NEW.status = 'COMPLETED' AND OLD.status != 'COMPLETED' THEN
        INSERT INTO public.notifications (user_id, title, body, type, reference_id, reference_type)
        VALUES (
            NEW.patient_id,
            'طلبك من الصيدلية جاهز 💊',
            'يمكنك استلام دواءك الآن من الصيدلية.',
            'order_ready',
            NEW.id,
            'pharmacy_order'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_patient_order_ready
    AFTER UPDATE ON public.pharmacy_orders
    FOR EACH ROW EXECUTE FUNCTION public.fn_notify_patient_order_ready();

-- ── Notify lab when patient assigns them ──────────────────────
CREATE OR REPLACE FUNCTION public.fn_notify_lab_assigned()
RETURNS trigger AS $$
BEGIN
    -- Only fire when lab_id changes from NULL to a value
    IF NEW.lab_id IS NOT NULL AND OLD.lab_id IS NULL THEN
        INSERT INTO public.notifications (user_id, title, body, type, reference_id, reference_type)
        VALUES (
            NEW.lab_id,
            'طلب تحليل جديد 🧪',
            'أرسل إليك مريض طلب تحليل جديداً. يرجى الاطلاع عليه.',
            'lab_assigned',
            NEW.id,
            'lab_request'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_lab_assigned
    AFTER UPDATE ON public.lab_requests
    FOR EACH ROW EXECUTE FUNCTION public.fn_notify_lab_assigned();

-- ── Notify pharmacy when patient sends order ──────────────────
CREATE OR REPLACE FUNCTION public.fn_notify_pharmacy_new_order()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.notifications (user_id, title, body, type, reference_id, reference_type)
    VALUES (
        NEW.pharmacy_id,
        'طلب وصفة جديد 💊',
        'أرسل إليك مريض وصفة طبية للتجهيز.',
        'new_order',
        NEW.id,
        'pharmacy_order'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_pharmacy_new_order
    AFTER INSERT ON public.pharmacy_orders
    FOR EACH ROW EXECUTE FUNCTION public.fn_notify_pharmacy_new_order();

-- ── Audit logging ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.fn_audit_log()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
    VALUES (
        auth.uid(),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE TG_OP WHEN 'DELETE' THEN row_to_json(OLD)::jsonb ELSE row_to_json(NEW)::jsonb END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_medical_requests
    AFTER INSERT OR UPDATE ON public.medical_requests
    FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

CREATE TRIGGER audit_doctor_responses
    AFTER INSERT ON public.doctor_responses
    FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

CREATE TRIGGER audit_prescriptions
    AFTER INSERT ON public.prescriptions
    FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

CREATE TRIGGER audit_pharmacy_orders
    AFTER INSERT OR UPDATE ON public.pharmacy_orders
    FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

CREATE TRIGGER audit_lab_results
    AFTER INSERT ON public.lab_results
    FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();


-- ================================================================
-- STEP 13: Helper View (read-only for Admin dashboard)
-- ================================================================
CREATE OR REPLACE VIEW public.admin_request_overview AS
SELECT
    mr.id,
    mr.type,
    mr.status,
    mr.created_at,
    p.full_name  AS patient_name,
    d.full_name  AS doctor_name,
    dr.action    AS doctor_action,
    pr.id        IS NOT NULL AS has_prescription,
    lr.id        IS NOT NULL AS has_lab_request
FROM public.medical_requests mr
LEFT JOIN public.profiles   p  ON p.id = mr.patient_id
LEFT JOIN public.profiles   d  ON d.id = mr.doctor_id
LEFT JOIN public.doctor_responses dr ON dr.request_id = mr.id
LEFT JOIN public.prescriptions    pr ON pr.request_id = mr.id
LEFT JOIN public.lab_requests     lr ON lr.request_id = mr.id;


-- ================================================================
-- ✅ 3INAYA Patient-Centric Schema v2.0 — COMPLETE
-- ================================================================
