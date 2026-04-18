-- ================================================================
-- Migration v2.2 — Patient Vitals tracking table
-- Run in Supabase SQL Editor
-- ================================================================

-- Create vitals table for patient daily measurements
CREATE TABLE IF NOT EXISTS public.vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('blood_sugar', 'blood_pressure', 'weight', 'oximetry')),
  value1 NUMERIC(8,2) NOT NULL,          -- primary value (sugar mg/dL, systolic, weight kg, SpO2 %)
  value2 NUMERIC(8,2) DEFAULT NULL,      -- secondary (diastolic mmHg for blood pressure)
  meal_context TEXT DEFAULT 'any' CHECK (meal_context IN ('fasting','post_meal','before_sleep','any')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for fast patient queries
CREATE INDEX IF NOT EXISTS idx_vitals_patient_id ON public.vitals(patient_id);
CREATE INDEX IF NOT EXISTS idx_vitals_type ON public.vitals(type);
CREATE INDEX IF NOT EXISTS idx_vitals_created_at ON public.vitals(created_at DESC);

-- Row Level Security
ALTER TABLE public.vitals ENABLE ROW LEVEL SECURITY;

-- Policy: patients can read/write their own vitals
CREATE POLICY "patient_own_vitals" ON public.vitals
  FOR ALL
  USING (patient_id = auth.uid());

-- Policy: doctors can read their patients' vitals (patients they have prescriptions for)
CREATE POLICY "doctor_read_patient_vitals" ON public.vitals
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.prescriptions p
      WHERE p.patient_id = vitals.patient_id
        AND p.doctor_id = auth.uid()
    )
  );

-- ================================================================
-- ✅ Migration v2.2 complete
-- ================================================================
