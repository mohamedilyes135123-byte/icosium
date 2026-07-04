import { createClient } from "@supabase/supabase-js";

const supabaseUrl = 'https://bvhdeqbonkmfxdndwgge.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2aGRlcWJvbmttZnhkbmR3Z2dlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MzYwMTgsImV4cCI6MjA5MTUxMjAxOH0.okxeCTUNdWAiME2vrE93GP3tA0UKBZb2WwuoBUlbVwE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const res1 = await supabase.from("lab_requests").select(`
    *,
    patient:profiles!patient_id(full_name),
    doctor:profiles!doctor_id(full_name)
  `).limit(1);

  const res2 = await supabase.from("lab_requests").select(`
    *,
    patient:profiles!lab_requests_patient_id_fkey(full_name),
    doctor:profiles!lab_requests_doctor_id_fkey(full_name)
  `).limit(1);

  console.log("Res1 Error:", res1.error);
  console.log("Res2 Error:", res2.error);
}
run();
