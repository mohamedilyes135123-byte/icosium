-- ================================================================
-- Migration v2.3 — Profile enhancements + audit_log alias
-- Run this in Supabase SQL Editor
-- ================================================================

-- ─── Profile enhancements ──────────────────────────────────────
-- NOTE: The column is called "approval_status" NOT "approved_status"
DO $$ BEGIN
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_banned        BOOLEAN DEFAULT false;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS national_id      TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS medical_license  TEXT;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free';
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_online        BOOLEAN DEFAULT false;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen        TIMESTAMPTZ;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ─── Create audit_log table (separate from audit_logs) ─────────
-- audit_logs = automatic row-level log (existing)
-- audit_log  = admin manual action log (new, used by admin UI)
CREATE TABLE IF NOT EXISTS public.audit_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action       TEXT NOT NULL,
  actor_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_role   TEXT,
  actor_name   TEXT,
  target_id    UUID,
  details      TEXT,
  ip_address   TEXT,
  status       TEXT DEFAULT 'SUCCESS'
               CHECK (status IN ('SUCCESS','BLOCKED','WARNING','ENCRYPTED')),
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_created  ON public.audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor_id ON public.audit_log(actor_id);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Admin can read all entries
DROP POLICY IF EXISTS "admin_read_audit_log" ON public.audit_log;
CREATE POLICY "admin_read_audit_log" ON public.audit_log
  FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Any authenticated user can insert
DROP POLICY IF EXISTS "insert_audit_log" ON public.audit_log;
CREATE POLICY "insert_audit_log" ON public.audit_log
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ─── Trigger: ban → set approval_status = rejected ─────────────
-- Uses the CORRECT column name: approval_status
CREATE OR REPLACE FUNCTION public.handle_ban_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_banned = true THEN
    NEW.approval_status := 'rejected';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_ban_change ON public.profiles;
CREATE TRIGGER on_ban_change
  BEFORE UPDATE OF is_banned ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_ban_change();

-- ─── Indexes for fast admin queries ───────────────────────────
CREATE INDEX IF NOT EXISTS idx_profiles_approval_status ON public.profiles(approval_status);
CREATE INDEX IF NOT EXISTS idx_profiles_role            ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_banned       ON public.profiles(is_banned);

-- ================================================================
-- ✅ Migration v2.3 complete
-- ================================================================
