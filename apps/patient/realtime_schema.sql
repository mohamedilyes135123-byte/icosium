--  =============================================================
--  3INAYA (عناية) - REAL-TIME & WEBSOCKETS ENABLER
--  =============================================================
--  Instructions: Copy and paste this exact script into your 
--  Supabase SQL Editor and hit "Run". It will enable instant
--  updates across all applications without refreshing the page.
--  =============================================================

-- 1. Enable logical replication for the tables that require Real-Time Updates
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'requests'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.requests;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'prescriptions'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.prescriptions;
    END IF;
END $$;

-- 2. Ensure RLS policies are intact for broad SELECT queries during prototype.
-- (This ensures the dummy bypass users can gracefully load the UI arrays if their UUID is mismatched during dev)
DROP POLICY IF EXISTS "Pharmacies can view pending prescriptions" ON public.prescriptions;
CREATE POLICY "Pharmacies can view pending prescriptions" 
ON public.prescriptions FOR SELECT 
USING (true); -- Opened for the prototype demo so you can view the live feed easily.

DROP POLICY IF EXISTS "Doctors view own requests" ON public.requests;
CREATE POLICY "Doctors view own requests" 
ON public.requests FOR SELECT 
USING (true); -- Opened for the prototype feed.

DROP POLICY IF EXISTS "General Insert allowed for Prototyping" ON public.requests;
CREATE POLICY "General Insert allowed for Prototyping"
ON public.requests FOR INSERT
WITH CHECK (true); -- Allows the bypass user to create requests.

DROP POLICY IF EXISTS "General Insert allowed for Prototyping Rx" ON public.prescriptions;
CREATE POLICY "General Insert allowed for Prototyping Rx"
ON public.prescriptions FOR INSERT
WITH CHECK (true); -- Allows the bypass user to create prescriptions.

-- IMPORTANT: These relaxed RLS rules are strictly for the prototype phase so that 
-- the simplified bypass mock-logins you requested ('admin 123', 'patient 123') 
-- do not get blocked by strict JWT UUID verification constraints.
