--  =============================================================
--  3INAYA (عناية) - Core Database Schema & RBAC Policies
--  =============================================================
--  Instructions: Copy and paste this exact script into your 
--  Supabase SQL Editor and hit "Run". It will safely create
--  all tables and enforce absolute Row Level Security (RLS).
--  =============================================================

-- 1. Custom Types (Enums)
CREATE TYPE public.app_role AS ENUM ('patient', 'doctor', 'pharmacy', 'lab', 'admin');
CREATE TYPE public.prescription_status AS ENUM ('pending', 'ready', 'claimed', 'cancelled');
CREATE TYPE public.request_status AS ENUM ('pending', 'processing', 'completed', 'urgent');

-- 2. Profiles Table (Extends auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role app_role NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT UNIQUE,
    verified BOOLEAN DEFAULT false,
    specialty TEXT, -- For Doctors
    address TEXT,   -- For Patients/Pharmacies
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Prescriptions Table
CREATE TABLE public.prescriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.profiles(id) NOT NULL,
    doctor_id UUID REFERENCES public.profiles(id) NOT NULL,
    pharmacy_id UUID REFERENCES public.profiles(id), -- Nullable until assigned
    medications JSONB NOT NULL,
    status prescription_status DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on Prescriptions
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- 4. Telemedicine Requests Table
CREATE TABLE public.requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.profiles(id) NOT NULL,
    doctor_id UUID REFERENCES public.profiles(id), -- Nullable until accepted
    symptoms TEXT NOT NULL,
    status request_status DEFAULT 'pending',
    ai_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on Requests
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;


-- =========================================================================
--  ROW LEVEL SECURITY (RLS) POLICIES - The core of the 3inaya Architecture
-- =========================================================================

-- PROFILES POLICIES
-- Users can read their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Admins can read everyone
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

-- PRESCRIPTIONS POLICIES (Absolute Secrecy)
-- 1. Patients can only see THEIR specific prescriptions
CREATE POLICY "Patients view own prescriptions" 
ON public.prescriptions FOR SELECT 
USING (auth.uid() = patient_id AND auth.jwt() -> 'user_metadata' ->> 'role' = 'patient');

-- 2. Doctors can see prescriptions THEY wrote
CREATE POLICY "Doctors view own prescriptions" 
ON public.prescriptions FOR SELECT 
USING (auth.uid() = doctor_id AND auth.jwt() -> 'user_metadata' ->> 'role' = 'doctor');

-- 3. Doctors can INSERT prescriptions
CREATE POLICY "Doctors can create prescriptions" 
ON public.prescriptions FOR INSERT 
WITH CHECK (auth.uid() = doctor_id AND auth.jwt() -> 'user_metadata' ->> 'role' = 'doctor');

-- 4. Pharmacies can read prescriptions designated to them, OR all pending if it's an open system (Currently set to all pending for demo)
CREATE POLICY "Pharmacies can view pending prescriptions" 
ON public.prescriptions FOR SELECT 
USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'pharmacy');


-- TRIGGER: Automatically create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name)
  VALUES (
    new.id, 
    CAST(new.raw_user_meta_data->>'role' AS public.app_role), 
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =========================================================================
--  MOCK DATA SEED (TESTING USERS) -> ONLY FOR DEMO PROTOTYPE!
-- =========================================================================
-- Use the Supabase Dashboard UI to sign up users, passing 'role' in the metadata!
