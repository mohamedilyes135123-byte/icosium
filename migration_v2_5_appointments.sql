-- ================================================================
-- Migration v2.5 — Appointments Feature
-- Run this in your Supabase SQL Editor
-- ================================================================

CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED')),
    reason TEXT NOT NULL,
    scheduled_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Patients can view their own appointments
CREATE POLICY "appointments_patient_select" ON public.appointments
    FOR SELECT USING (
        auth.uid() = patient_id
        AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'patient'
    );

-- Patients can insert their own appointments
CREATE POLICY "appointments_patient_insert" ON public.appointments
    FOR INSERT WITH CHECK (
        auth.uid() = patient_id
        AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'patient'
    );

-- Doctors can view appointments assigned to them
CREATE POLICY "appointments_doctor_select" ON public.appointments
    FOR SELECT USING (
        auth.uid() = doctor_id
        AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'doctor'
    );

-- Doctors can update appointments assigned to them (approve/reject/schedule)
CREATE POLICY "appointments_doctor_update" ON public.appointments
    FOR UPDATE USING (
        auth.uid() = doctor_id
        AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'doctor'
    );

-- Enable the moddatetime extension if it's not already enabled
CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA extensions;

-- Trigger to update updated_at on modify
CREATE TRIGGER handle_updated_at_appointments
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION moddatetime(updated_at);

-- ================================================================
-- ✅ Migration complete
-- ================================================================
