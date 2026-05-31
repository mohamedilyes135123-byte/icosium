// delete_all_users.js
// يحذف جميع المستخدمين من Supabase باستخدام Service Role Key

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envFile = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
const SUPABASE_URL = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();

// Service Role Key - مطلوب لحذف المستخدمين
// اذهب إلى: https://supabase.com/dashboard/project/bvhdeqbonkmfxdndwgge/settings/api
// وانسخ "service_role" key
const SERVICE_ROLE_KEY = process.argv[2];

if (!SERVICE_ROLE_KEY) {
  console.error(`
❌ يرجى تشغيل السكريبت مع الـ Service Role Key:

   node delete_all_users.js YOUR_SERVICE_ROLE_KEY

📌 أين تجد الـ Service Role Key؟
   https://supabase.com/dashboard/project/bvhdeqbonkmfxdndwgge/settings/api
   → Project API keys → service_role → Reveal
`);
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function deleteAllUsers() {
  console.log('🔍 جاري جلب قائمة المستخدمين...\n');

  let allUsers = [];
  let page = 1;
  const perPage = 1000;

  // جلب جميع المستخدمين (يدعم pagination)
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) {
      console.error('❌ خطأ في جلب المستخدمين:', error.message);
      process.exit(1);
    }
    allUsers = allUsers.concat(data.users);
    if (data.users.length < perPage) break;
    page++;
  }

  if (allUsers.length === 0) {
    console.log('✅ لا يوجد مستخدمون لحذفهم.');
    return;
  }

  console.log(`📋 تم إيجاد ${allUsers.length} مستخدم:\n`);
  allUsers.forEach((u, i) => {
    console.log(`   ${i + 1}. ${u.email || '(بدون إيميل)'} — ${u.id}`);
  });

  console.log('\n🗑️  جاري الحذف...\n');

  let deleted = 0;
  let failed = 0;

  for (const user of allUsers) {
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) {
      console.error(`   ❌ فشل حذف ${user.email}: ${error.message}`);
      failed++;
    } else {
      console.log(`   ✅ تم حذف: ${user.email || user.id}`);
      deleted++;
    }
  }

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ تم الحذف: ${deleted} مستخدم
❌ فشل:      ${failed} مستخدم
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 الآن يمكنك تشغيل: node supabase_seed.js
   لإعادة إنشاء الحسابات من جديد
`);
}

deleteAllUsers();
