import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or ANON key missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createPharmacyUser() {
  const email = 'pharmacy@test.com';
  const password = '123456';
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role: 'pharmacy' },
    },
  });
  if (error) {
    console.error('Sign‑up error:', error.message);
    process.exit(1);
  }
  console.log('User created successfully:', data.user?.id);
}

createPharmacyUser();
