const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://bvhdeqbonkmfxdndwgge.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2aGRlcWJvbmttZnhkbmR3Z2dlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MzYwMTgsImV4cCI6MjA5MTUxMjAxOH0.okxeCTUNdWAiME2vrE93GP3tA0UKBZb2WwuoBUlbVwE'
);

async function testLogin() {
  console.log("Trying to login...");
  const { data, error } = await supabase.auth.signInWithPassword({ email: 'patient@test.com', password: '123456' });
  console.log("Error:", error);
  console.log("Data:", JSON.stringify(data, null, 2));
}

testLogin();
