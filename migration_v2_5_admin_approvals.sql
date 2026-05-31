-- ================================================================
--  3INAYA (عناية) — Migration v2.5 — Admin Profile Approvals
--  Run this in Supabase SQL Editor.
-- ================================================================

-- This migration fixes an issue where Admins could not approve or reject
-- professional accounts because the default RLS policy for `profiles`
-- only allowed users to update their OWN profiles.
-- We add a policy so admins can update any profile (to change approval_status, etc.)

DO $$ BEGIN
    -- Add an RLS policy for admins to update profiles
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = 'profiles' 
          AND policyname = 'profiles_admin_updates_all'
    ) THEN
        CREATE POLICY "profiles_admin_updates_all"
        ON public.profiles FOR UPDATE
        USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Also verify they can view all profiles (the existing profiles_anyone_can_view is FOR SELECT USING (auth.role() = 'authenticated'), which is sufficient)

-- ================================================================
-- ✅ Migration v2.5 complete
-- ================================================================
