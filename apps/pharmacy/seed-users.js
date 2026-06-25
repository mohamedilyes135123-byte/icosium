const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bvhdeqbonkmfxdndwgge.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2aGRlcWJvbmttZnhkbmR3Z2dlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MzYwMTgsImV4cCI6MjA5MTUxMjAxOH0.okxeCTUNdWAiME2vrE93GP3tA0UKBZb2WwuoBUlbVwE'
);

async function seedUsers() {
  const users = [
    { email: 'admin@test.com', password: '123456', role: 'admin', fullName: 'مدير النظام (Admin)' },
    { email: 'doctor@test.com', password: '123456', role: 'doctor', fullName: 'د. يوسف خليل (طبيب)' },
    { email: 'patient@test.com', password: '123456', role: 'patient', fullName: 'أحمد المريض (Patient)' },
    { email: 'pharmacie@test.com', password: '123456', role: 'pharmacy', fullName: 'صيدلية النور (Pharmacy)' },
    { email: 'labo@test.com', password: '123456', role: 'lab', fullName: 'مخبر التحاليل (Lab)' },
  ];

  console.log('⏳ جاري إنشاء الحسابات في Supabase...');

  for (const u of users) {
    const { data, error } = await supabase.auth.signUp({
      email: u.email,
      password: u.password,
      options: {
        data: {
          full_name: u.fullName,
          role: u.role,
        }
      }
    });

    if (error) {
      console.log(`❌ فشل إنشاء حساب ${u.role}:`, error.message);
    } else {
      console.log(`✅ تم إنشاء حساب: ${u.email} | الصلاحية: ${u.role}`);
    }
  }
}

seedUsers();
