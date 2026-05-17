const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bvhdeqbonkmfxdndwgge.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2aGRlcWJvbmttZnhkbmR3Z2dlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MzYwMTgsImV4cCI6MjA5MTUxMjAxOH0.okxeCTUNdWAiME2vrE93GP3tA0UKBZb2WwuoBUlbVwE'
);

// Decodes standard Mojibake UTF8-under-ISO-8859-1/Windows-1252 back to correct UTF-8
function decodeMojibake(str) {
  if (!str) return str;
  try {
    // Convert string to bytes assuming ISO-8859-1 / Windows-1252 encoding, then decode as UTF-8
    const bytes = new Uint8Array(str.split('').map(c => c.charCodeAt(0)));
    return new TextDecoder('utf-8').decode(bytes);
  } catch (e) {
    return str;
  }
}

async function fixProfiles() {
  console.log('⏳ Fetching profiles...');
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, approval_status');

  if (error) {
    console.error('❌ Error fetching profiles:', error.message);
    return;
  }

  console.log(`Found ${profiles.length} profiles.`);
  
  for (const p of profiles) {
    // If the name starts with Ø or contains typical mojibake characters
    const needsFix = p.full_name && (p.full_name.includes('Ø') || p.full_name.includes('Ù') || p.full_name.includes('§'));
    
    if (needsFix) {
      const decodedName = decodeMojibake(p.full_name);
      console.log(`🔧 Fixing Profile [${p.role}] [${p.id}]:`);
      console.log(`   Old: "${p.full_name}"`);
      console.log(`   New: "${decodedName}"`);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ full_name: decodedName })
        .eq('id', p.id);

      if (updateError) {
        console.error(`   ❌ Failed to update:`, updateError.message);
      } else {
        console.log(`   ✅ Successfully updated!`);
      }
    } else {
      console.log(`✅ Profile [${p.role}] "${p.full_name}" is already clean.`);
    }
  }
}

fixProfiles();
