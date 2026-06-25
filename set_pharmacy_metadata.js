const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bvhdeqbonkmfxdndwgge.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2aGRlcWJvbmttZnhkbmR3Z2dlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MzYwMTgsImV4cCI6MjA5MTUxMjAxOH0.okxeCTUNdWAiME2vrE93GP3tA0UKBZb2WwuoBUlbVwE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function setPharmacyMetadata() {
  // Sign in first to get a session (requires existing credentials)
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'pharmacie@test.com',
    password: '123456',
  });

  if (signInError) {
    console.error('Failed to sign in:', signInError.message);
    return;
  }

  const { error: updateError } = await supabase.auth.updateUser({
    data: { role: 'pharmacy' },
  });

  if (updateError) {
    console.error('Failed to update metadata:', updateError.message);
  } else {
    console.log('User metadata updated: role=pharmacy');
  }
}

setPharmacyMetadata();
