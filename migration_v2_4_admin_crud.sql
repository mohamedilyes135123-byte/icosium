-- ================================================================
-- Migration v2.4 — Admin CRUD operations for Doctor, Lab, Pharmacy
-- Run this in your Supabase SQL Editor
-- ================================================================

-- ─── 1. RPC: admin_create_user ──────────────────────────────────
-- Allows creating a user in auth.users without changing the admin's local session.
-- Only executable by admins.
CREATE OR REPLACE FUNCTION public.admin_create_user(
    p_email TEXT,
    p_password TEXT,
    p_role public.app_role,
    p_full_name TEXT,
    p_phone TEXT DEFAULT NULL,
    p_address TEXT DEFAULT NULL,
    p_specialty TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Security check: only admins can execute
    IF (auth.jwt() -> 'user_metadata' ->> 'role') != 'admin' THEN
        RAISE EXCEPTION 'غير مصرح به. يجب أن تكون مديراً للنظام.';
    END IF;

    -- Validate role (only allow doctor, lab, pharmacy)
    IF p_role NOT IN ('doctor', 'lab', 'pharmacy') THEN
        RAISE EXCEPTION 'دور غير صالح. يُسمح فقط بإنشاء طبيب، مختبر، أو صيدلية.';
    END IF;

    -- Generate a new UUID for the user
    v_user_id := gen_random_uuid();
    
    -- Insert into auth.users
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        v_user_id,
        'authenticated',
        'authenticated',
        p_email,
        crypt(p_password, gen_salt('bf')),
        NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        json_build_object('role', p_role::text, 'full_name', p_full_name, 'phone', p_phone)::jsonb,
        NOW(),
        NOW()
    );

    -- Insert into auth.identities to make it fully login-able
    INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        v_user_id,
        json_build_object('sub', v_user_id::text, 'email', p_email)::jsonb,
        'email',
        p_email,
        NOW(),
        NOW(),
        NOW()
    );

    -- Update the profile created by trigger handle_new_user to set the extra fields
    UPDATE public.profiles
    SET 
        phone = p_phone,
        address = p_address,
        specialty = p_specialty,
        verified = true,
        approval_status = 'approved'
    WHERE id = v_user_id;

    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE EXECUTE ON FUNCTION public.admin_create_user FROM public;
GRANT EXECUTE ON FUNCTION public.admin_create_user TO authenticated;


-- ─── 2. RPC: admin_delete_user ──────────────────────────────────
-- Safely deletes a user and cascades through all references.
-- Only executable by admins.
CREATE OR REPLACE FUNCTION public.admin_delete_user(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Security check: only admins can execute
    IF (auth.jwt() -> 'user_metadata' ->> 'role') != 'admin' THEN
        RAISE EXCEPTION 'غير مصرح به. يجب أن تكون مديراً للنظام.';
    END IF;

    -- Prevent deleting yourself (admin)
    IF auth.uid() = p_user_id THEN
        RAISE EXCEPTION 'لا يمكنك حذف حسابك الخاص كمدير للنظام.';
    END IF;

    -- Clean up dependencies in public schema before deleting user
    
    -- 1. medical_requests where this user is the doctor
    UPDATE public.medical_requests
    SET doctor_id = NULL
    WHERE doctor_id = p_user_id;

    -- 2. doctor_responses
    DELETE FROM public.doctor_responses
    WHERE doctor_id = p_user_id;

    -- 3. prescriptions
    DELETE FROM public.prescriptions
    WHERE doctor_id = p_user_id OR patient_id = p_user_id;

    -- 4. lab_requests
    UPDATE public.lab_requests
    SET lab_id = NULL
    WHERE lab_id = p_user_id;
    
    DELETE FROM public.lab_requests
    WHERE doctor_id = p_user_id OR patient_id = p_user_id;

    -- 5. lab_results
    DELETE FROM public.lab_results
    WHERE lab_id = p_user_id OR patient_id = p_user_id;

    -- 6. pharmacy_orders
    DELETE FROM public.pharmacy_orders
    WHERE pharmacy_id = p_user_id OR patient_id = p_user_id;

    -- 7. notifications
    DELETE FROM public.notifications
    WHERE user_id = p_user_id;

    -- 8. audit_log
    DELETE FROM public.audit_log
    WHERE actor_id = p_user_id OR target_id = p_user_id;

    -- 9. audit_logs
    DELETE FROM public.audit_logs
    WHERE actor_id = p_user_id;

    -- 10. Delete the profile explicitly
    DELETE FROM public.profiles
    WHERE id = p_user_id;

    -- 11. Delete the user from auth.users (triggers profile delete anyway, but this is the primary)
    DELETE FROM auth.users
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE EXECUTE ON FUNCTION public.admin_delete_user FROM public;
GRANT EXECUTE ON FUNCTION public.admin_delete_user TO authenticated;


-- ─── 3. RLS: admin update policy on profiles ────────────────────
-- Ensure the admin can update profiles (needed for ban/unban/approval changes)
DROP POLICY IF EXISTS "profiles_admin_updates_all" ON public.profiles;
CREATE POLICY "profiles_admin_updates_all"
ON public.profiles FOR UPDATE
USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- ================================================================
-- ✅ Migration complete
-- ================================================================
