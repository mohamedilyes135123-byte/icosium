const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bvhdeqbonkmfxdndwgge.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2aGRlcWJvbmttZnhkbmR3Z2dlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MzYwMTgsImV4cCI6MjA5MTUxMjAxOH0.okxeCTUNdWAiME2vrE93GP3tA0UKBZb2WwuoBUlbVwE'
);

const candidates = [
  { email: 'pharmacie@test.com',    password: '123456' },
  { email: 'pharmacy11@test.com',    password: '123456' },
  { email: 'pharmacy12@test.com',    password: '123456' },
  { email: 'pharmacie@test.com',      password: '123456' },
];

async function tryLogin() {
  for (const cred of candidates) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cred.email,
      password: cred.password,
    });
    if (error) {
      console.log(`❌ ${cred.email}: ${error.message}`);
    } else {
      console.log(`✅ WORKS → ${cred.email}`);
      console.log(`   role: ${data.user?.user_metadata?.role}`);
      await supabase.auth.signOut();
    }
  }
  console.log('Done.');
}

tryLogin();
