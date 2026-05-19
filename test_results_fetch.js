const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bvhdeqbonkmfxdndwgge.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2aGRlcWJvbmttZnhkbmR3Z2dlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MzYwMTgsImV4cCI6MjA5MTUxMjAxOH0.okxeCTUNdWAiME2vrE93GP3tA0UKBZb2WwuoBUlbVwE'
);

async function testFetch() {
  const { data: users } = await supabase.from('profiles').select('*').eq('email', 'patient@test.com').single();
  const currentUser = users;
  console.log("Patient:", currentUser?.id);

  if (!currentUser) return;

  const [{ data: results, error: labErr }, { data: orders, error: ordErr }] = await Promise.all([
    supabase
      .from("lab_results")
      .select(`
        id,
        file_url,
        result_notes,
        uploaded_at,
        lab:lab_id(full_name, address),
        lab_request:lab_request_id(
          tests_list,
          doctor_notes,
          doctor:doctor_id(full_name)
        )
      `)
      .eq("patient_id", currentUser.id)
      .order("uploaded_at", { ascending: false }),

    supabase
      .from("pharmacy_orders")
      .select(`
        id,
        status,
        created_at,
        pharmacy:pharmacy_id(full_name, address, phone),
        prescription:prescription_id(
          medications,
          doctor_notes,
          qr_token,
          doctor:doctor_id(full_name)
        )
      `)
      .eq("patient_id", currentUser.id)
      .order("created_at", { ascending: false }),
  ]);

  if (labErr) console.error("Lab Err:", labErr);
  if (ordErr) console.error("Ord Err:", ordErr);

  console.log("Lab Results:", JSON.stringify(results, null, 2));
  console.log("Pharmacy Orders:", JSON.stringify(orders, null, 2));
}

testFetch();
