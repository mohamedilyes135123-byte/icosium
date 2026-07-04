-- ================================================================
--  3INAYA — Migration v4.0
--  Make request_id nullable so walk-in prescriptions and lab requests work
-- ================================================================

ALTER TABLE public.prescriptions ALTER COLUMN request_id DROP NOT NULL;
ALTER TABLE public.lab_requests ALTER COLUMN request_id DROP NOT NULL;
