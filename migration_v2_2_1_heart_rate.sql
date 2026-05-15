-- ================================================================
-- Migration v2.2.1 — Add heart_rate type to vitals table
-- Run in Supabase SQL Editor
-- ================================================================

ALTER TABLE public.vitals
  DROP CONSTRAINT IF EXISTS vitals_type_check;

ALTER TABLE public.vitals
  ADD CONSTRAINT vitals_type_check
  CHECK (type IN ('blood_sugar', 'blood_pressure', 'weight', 'oximetry', 'heart_rate'));

-- ================================================================
-- ✅ Migration v2.2.1 complete — heart_rate type added
-- ================================================================
