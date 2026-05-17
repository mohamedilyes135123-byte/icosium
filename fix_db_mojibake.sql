-- ================================================================
-- 3INAYA - DATABASE MOJIBAKE CLEANUP SCRIPT
-- ================================================================
-- This script fixes Arabic text that was corrupted during registration/seeding
-- due to Windows-1252 encoding. It converts the corrupted text back to clean UTF-8.
-- Run this in your Supabase SQL Editor.
-- ================================================================

-- Helper function to safely decode Mojibake
CREATE OR REPLACE FUNCTION public.decode_mojibake(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  IF input_text IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- If it contains typical mojibake characters, decode it
  IF input_text ~ '[ØÙ§åæìíîïðñòóôõö÷øùúûüýþÿ]' THEN
    BEGIN
      RETURN convert_from(convert_to(input_text, 'latin1'), 'utf8');
    EXCEPTION WHEN OTHERS THEN
      -- If decoding fails for any reason, return the original text safely
      RETURN input_text;
    END;
  END IF;
  
  RETURN input_text;
END;
$$ LANGUAGE plpgsql;

-- 1. Fix profiles table (full_name, specialty, address)
UPDATE public.profiles
SET 
  full_name = public.decode_mojibake(full_name),
  specialty = public.decode_mojibake(specialty),
  address = public.decode_mojibake(address)
WHERE 
  full_name ~ '[ØÙ§åæìíîïðñòóôõö÷øùúûüýþÿ]'
  OR specialty ~ '[ØÙ§åæìíîïðñòóôõö÷øùúûüýþÿ]'
  OR address ~ '[ØÙ§åæìíîïðñòóôõö÷øùúûüýþÿ]';

-- 2. Fix medical_requests table (symptoms, patient_notes)
UPDATE public.medical_requests
SET 
  symptoms = public.decode_mojibake(symptoms),
  patient_notes = public.decode_mojibake(patient_notes)
WHERE 
  symptoms ~ '[ØÙ§åæìíîïðñòóôõö÷øùúûüýþÿ]'
  OR patient_notes ~ '[ØÙ§åæìíîïðñòóôõö÷øùúûüýþÿ]';

-- 3. Clean up helper function
DROP FUNCTION IF EXISTS public.decode_mojibake(TEXT);

ANALYZE public.profiles;
ANALYZE public.medical_requests;
