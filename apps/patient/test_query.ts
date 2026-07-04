import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

async function test() {
  const { data, error } = await supabase
    .from("lab_requests")
    .select(`
      *,
      patient:profiles!lab_requests_patient_id_fkey(full_name, date_of_birth),
      doctor:profiles!lab_requests_doctor_id_fkey(full_name, specialty, phone)
    `)
    .limit(1);
    
  console.log("With FKEY names:", { error: error?.message, data: data?.length });

  const { data: d2, error: e2 } = await supabase
    .from("lab_requests")
    .select(`
      *,
      patient:profiles!patient_id(full_name, date_of_birth),
      doctor:profiles!doctor_id(full_name, specialty, phone)
    `)
    .limit(1);

  console.log("With Column names:", { error: e2?.message, data: d2?.length });
}
test();
