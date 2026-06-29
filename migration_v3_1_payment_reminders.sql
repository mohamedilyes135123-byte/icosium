-- ================================================================
--  3INAYA — Migration v3.1 — Payment & Reminders
--  Run this AFTER migration_v3_patient_refactor.sql
-- ================================================================

-- ── 1. Payment Plans (Admin-configurable) ────────────────────────
CREATE TABLE IF NOT EXISTS public.payment_plans (
    id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name              TEXT NOT NULL,
    target_role       TEXT NOT NULL CHECK (target_role IN ('patient','doctor','lab','pharmacy')),
    consultation_fee  NUMERIC(10,2) NOT NULL DEFAULT 500,
    prescription_fee  NUMERIC(10,2) NOT NULL DEFAULT 300,
    lab_fee           NUMERIC(10,2) NOT NULL DEFAULT 200,
    currency          TEXT NOT NULL DEFAULT 'DZD',
    is_active         BOOLEAN NOT NULL DEFAULT true,
    notes             TEXT,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payment_plans ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read plans (patient needs to see the fee)
CREATE POLICY "payment_plans_authenticated_read"
ON public.payment_plans FOR SELECT
USING (auth.role() = 'authenticated');

-- Only admin can modify (via service_role in admin app or direct Supabase Dashboard)
-- No INSERT/UPDATE/DELETE policy for patients

-- Insert default patient plan
INSERT INTO public.payment_plans (name, target_role, consultation_fee, prescription_fee, lab_fee)
VALUES ('الخطة الأساسية للمرضى', 'patient', 500, 300, 200)
ON CONFLICT DO NOTHING;

-- ── 2. Payment Transactions (Trial Mode) ─────────────────────────
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id        UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    prescription_id   UUID REFERENCES public.prescriptions(id) ON DELETE SET NULL,
    plan_id           UUID REFERENCES public.payment_plans(id) ON DELETE SET NULL,
    amount            NUMERIC(10,2) NOT NULL,
    currency          TEXT NOT NULL DEFAULT 'DZD',
    payment_code      TEXT,            -- الرقم الذي أدخله المريض (تجريبي)
    status            TEXT NOT NULL DEFAULT 'approved'
                      CHECK (status IN ('approved','rejected','pending')),
    is_trial          BOOLEAN NOT NULL DEFAULT true, -- true = وضع تجريبي، أي رقم مقبول
    notes             TEXT,
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transactions_patient_owns"
ON public.payment_transactions FOR ALL
USING (auth.uid() = patient_id)
WITH CHECK (auth.uid() = patient_id);

-- ── 3. Add source_prescription_id to medication_reminders ────────
-- Tracks which prescription created this reminder
ALTER TABLE public.medication_reminders
  ADD COLUMN IF NOT EXISTS source_prescription_id UUID REFERENCES public.prescriptions(id) ON DELETE CASCADE;

ALTER TABLE public.medication_reminders
  ADD COLUMN IF NOT EXISTS doctor_name TEXT;

ALTER TABLE public.medication_reminders
  ADD COLUMN IF NOT EXISTS duration TEXT;

ALTER TABLE public.medication_reminders
  ADD COLUMN IF NOT EXISTS auto_created BOOLEAN NOT NULL DEFAULT false;

-- ── 4. Add prescription analysis column ──────────────────────────
-- Stores the AI-reformatted prescription text when patient uploads old prescription
ALTER TABLE public.medical_requests
  ADD COLUMN IF NOT EXISTS ai_analysis TEXT;

ALTER TABLE public.medical_requests
  ADD COLUMN IF NOT EXISTS uploaded_prescription_url TEXT;

-- ================================================================
-- ✅ Migration v3.1 COMPLETE
--    Created: payment_plans, payment_transactions
--    Modified: medication_reminders (source tracking)
--    Modified: medical_requests (AI analysis columns)
-- ================================================================
