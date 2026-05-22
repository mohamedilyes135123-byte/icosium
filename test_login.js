const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bvhdeqbonkmfxdndwgge.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2aGRlcWJvbmttZnhkbmR3Z2dlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MzYwMTgsImV4cCI6MjA5MTUxMjAxOH0.okxeCTUNdWAiME2vrE93GP3tA0UKBZb2WwuoBUlbVwE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'pharmacy@test.com',
    password: '123456',
  });

  if (error) {
    console.error('Login error:', error.message);
  } else {
    console.log('Login success:', data.user.email);
  }
}

testLogin();
