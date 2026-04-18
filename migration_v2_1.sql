-- ================================================================
-- Fix: Allow walk-in prescriptions (no linked request)
-- Run this in Supabase SQL Editor
-- ================================================================

-- Allow request_id to be NULL in prescriptions (for walk-in / clinic patients)
ALTER TABLE public.prescriptions 
  ALTER COLUMN request_id DROP NOT NULL;

-- Add index for faster doctor prescriptions lookup
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor_id 
  ON public.prescriptions(doctor_id);

CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id 
  ON public.prescriptions(patient_id);

-- Add subscription_plan column to profiles if not exists
DO $$ BEGIN
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free';
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT true;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ================================================================
-- ✅ Migration complete
-- ================================================================
