-- ================================================================
--  3INAYA — Patient App Refactor Migration v3.0
--  Run this in the Supabase SQL Editor AFTER the base schema.
-- ================================================================

-- ── 1. Add full_name_fr to profiles ──────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name_fr TEXT;

-- ── 2. Add other_illnesses to profiles ───────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS other_illnesses TEXT;

-- ── 3. Add is_paid + status to prescriptions ─────────────────────
ALTER TABLE public.prescriptions
  ADD COLUMN IF NOT EXISTS is_paid BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.prescriptions
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'
  CHECK (status IN ('pending', 'active', 'archived'));

-- ── 4. Add destination columns to prescriptions ──────────────────
--    (tracks which pharmacy the patient chose to send to)
ALTER TABLE public.prescriptions
  ADD COLUMN IF NOT EXISTS sent_to_pharmacy_id UUID REFERENCES public.profiles(id);

-- ── 5. Create medication_reminders table ─────────────────────────
CREATE TABLE IF NOT EXISTS public.medication_reminders (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name        TEXT NOT NULL,
    dose        TEXT,
    frequency   TEXT,
    times       JSONB DEFAULT '[]',   -- e.g. ["08:00","14:00","21:00"]
    is_active   BOOLEAN NOT NULL DEFAULT true,
    notes       TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.medication_reminders ENABLE ROW LEVEL SECURITY;

-- Patient: full ownership of own reminders
CREATE POLICY "medication_reminders_patient_owns"
ON public.medication_reminders FOR ALL
USING (auth.uid() = patient_id)
WITH CHECK (auth.uid() = patient_id);

-- ── 6. Add updated_at trigger for medication_reminders ───────────
CREATE TRIGGER trg_medication_reminders_updated_at
    BEFORE UPDATE ON public.medication_reminders
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 7. Tighten profiles RLS (patients see only own profile) ──────
-- Drop the overly-permissive "anyone can view" policy
DROP POLICY IF EXISTS "profiles_anyone_can_view" ON public.profiles;

-- Allow any authenticated user to read profiles of doctors/labs/pharmacies
-- (patients need to browse providers), but patients can only see their own.
CREATE POLICY "profiles_own_or_provider"
ON public.profiles FOR SELECT
USING (
    -- Own profile always readable
    auth.uid() = id
    -- Providers are publicly readable by authenticated users
    OR role IN ('doctor', 'lab', 'pharmacy', 'admin')
);

-- ── 8. Update handle_new_user trigger to include full_name_fr ────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, role, full_name, full_name_fr, phone, verified)
    VALUES (
        new.id,
        CAST(new.raw_user_meta_data ->> 'role' AS public.app_role),
        COALESCE(new.raw_user_meta_data ->> 'full_name', 'مستخدم جديد'),
        new.raw_user_meta_data ->> 'full_name_fr',
        new.raw_user_meta_data ->> 'phone',
        false
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name_fr = EXCLUDED.full_name_fr;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 9. Add archive trigger on prescriptions status update ─────────
-- Automatically sets updated_at when prescriptions are modified
CREATE OR REPLACE FUNCTION public.set_updated_at_prescriptions()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at column to prescriptions if not exists
ALTER TABLE public.prescriptions
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS trg_prescriptions_updated_at ON public.prescriptions;
CREATE TRIGGER trg_prescriptions_updated_at
    BEFORE UPDATE ON public.prescriptions
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_prescriptions();

-- ── 10. Update prescriptions RLS for patient update (for archiving) ──
-- Patient can now UPDATE their own prescriptions (to archive them)
DROP POLICY IF EXISTS "prescriptions_patient_updates" ON public.prescriptions;
CREATE POLICY "prescriptions_patient_updates"
ON public.prescriptions FOR UPDATE
USING (auth.uid() = patient_id);

-- ================================================================
-- ✅ Migration v3.0 COMPLETE
--    Tables modified: profiles, prescriptions
--    Tables created: medication_reminders
--    RLS tightened: profiles
-- ================================================================
