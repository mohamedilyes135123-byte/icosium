
-- Allow standalone walk-in prescriptions to not have a request_id
ALTER TABLE public.prescriptions ALTER COLUMN request_id DROP NOT NULL;

