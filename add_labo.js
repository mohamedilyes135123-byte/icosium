const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bvhdeqbonkmfxdndwgge.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2aGRlcWJvbmttZnhkbmR3Z2dlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MzYwMTgsImV4cCI6MjA5MTUxMjAxOH0.okxeCTUNdWAiME2vrE93GP3tA0UKBZb2WwuoBUlbVwE'
);

async function addLabo() {
  const { data, error } = await supabase.auth.signUp({
    email: 'labo@test.com',
    password: '123456',
    options: {
      data: {
        role: 'lab',
        full_name: 'مختبر إيكوسيوم (Labo)',
      }
    }
  });
  console.log("labo@test.com:", error ? error.message : "Success");
  
  const { data: d2, error: e2 } = await supabase.auth.signUp({
    email: 'lab@test.com',
    password: '123456',
    options: {
      data: {
        role: 'lab',
        full_name: 'مختبر إيكوسيوم',
      }
    }
  });
  console.log("lab@test.com:", e2 ? e2.message : "Success");
}

addLabo();
