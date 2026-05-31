-- ================================================================
-- Add Appointments Table
-- Run this in your Supabase SQL Editor
-- ================================================================

CREATE TABLE IF NOT EXISTS public.appointments (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id      UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    doctor_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    reason          TEXT NOT NULL,
    status          TEXT DEFAULT 'PENDING',
    scheduled_at    TIMESTAMPTZ,
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Patient can read their own appointments
CREATE POLICY "appointments_patient_reads"
ON public.appointments FOR SELECT
USING (auth.uid() = patient_id);

-- Patient can insert their own appointments
CREATE POLICY "appointments_patient_inserts"
ON public.appointments FOR INSERT
WITH CHECK (auth.uid() = patient_id);

-- Doctor can read appointments assigned to them
CREATE POLICY "appointments_doctor_reads"
ON public.appointments FOR SELECT
USING (auth.uid() = doctor_id);

-- Doctor can update appointments assigned to them (to approve/reject/reschedule)
CREATE POLICY "appointments_doctor_updates"
ON public.appointments FOR UPDATE
USING (auth.uid() = doctor_id);

-- Admin can read everything
CREATE POLICY "appointments_admin_reads"
ON public.appointments FOR SELECT
USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

-- Add updated_at trigger
DROP TRIGGER IF EXISTS trg_appointments_updated_at ON public.appointments;
CREATE TRIGGER trg_appointments_updated_at
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Add Notification Trigger for new appointment
CREATE OR REPLACE FUNCTION public.fn_notify_doctor_new_appointment()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.notifications (user_id, title, body, type, reference_id, reference_type)
    VALUES (
        NEW.doctor_id,
        'طلب حجز موعد جديد 📅',
        'مريض يطلب حجز موعد. يرجى المراجعة وتحديد الوقت.',
        'new_appointment',
        NEW.id,
        'appointment'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_doctor_new_appointment ON public.appointments;
CREATE TRIGGER trg_notify_doctor_new_appointment
    AFTER INSERT ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION public.fn_notify_doctor_new_appointment();

-- Add Notification Trigger for patient when doctor responds
CREATE OR REPLACE FUNCTION public.fn_notify_patient_appointment_response()
RETURNS trigger AS $$
DECLARE
    v_title TEXT;
BEGIN
    IF NEW.status != OLD.status THEN
        v_title := CASE NEW.status
            WHEN 'APPROVED' THEN 'تم تأكيد موعدك ✅'
            WHEN 'REJECTED' THEN 'تم رفض الموعد ❌'
            ELSE 'تحديث على حالة موعدك'
        END;

        INSERT INTO public.notifications (user_id, title, body, type, reference_id, reference_type)
        VALUES (
            NEW.patient_id,
            v_title,
            COALESCE(NEW.notes, 'يرجى مراجعة تفاصيل الموعد'),
            'appointment_response',
            NEW.id,
            'appointment'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_patient_appointment_response ON public.appointments;
CREATE TRIGGER trg_notify_patient_appointment_response
    AFTER UPDATE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION public.fn_notify_patient_appointment_response();
