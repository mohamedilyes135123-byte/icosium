// supabase_seed.js
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Simple polyfill to extract ENV directly from .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envFile = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
const SUPABASE_URL = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const SUPABASE_KEY = envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function seed() {
  console.log("🚀 Starting 3inaya Complete Database Seeding...");

  // We will create the 5 core accounts using normal auth.signUp
  const users = [
    { email: 'patient@test.com', pass: '123456', meta: { role: 'patient', full_name: 'أحمد بن علي', phone: '0555000001' } },
    { email: 'doctor@test.com', pass: '123456', meta: { role: 'doctor', full_name: 'د. يوسف خليل', phone: '0555000002' } },
    { email: 'labo@test.com', pass: '123456', meta: { role: 'lab', full_name: 'مختبرات الشفاء', phone: '0555000003' } },
    { email: 'pharmacie@test.com', pass: '123456', meta: { role: 'pharmacy', full_name: 'صيدلية النور', phone: '0555000004' } },
    { email: 'admin@test.com', pass: '123456', meta: { role: 'admin', full_name: 'مسؤول النظام الدائم', phone: '0555000005' } }
  ];

  const createdUsers = {};

  for (const u of users) {
    const { data: { user }, error } = await supabase.auth.signUp({
      email: u.email,
      password: u.pass,
      options: { data: u.meta }
    });

    if (error) {
      if (error.message.includes('already registered')) {
        console.log(`⚠️ User ${u.email} already exists. Logging in...`);
        const { data: { user: existingUser } } = await supabase.auth.signInWithPassword({ email: u.email, password: u.pass });
        createdUsers[u.meta.role] = existingUser;
      } else {
        console.error(`❌ Error creating ${u.email}:`, error);
      }
    } else {
      console.log(`✅ Created User: ${u.email}`);
      createdUsers[u.meta.role] = user;
    }
  }

  // To insert relationships (Requests, Lab, Prescriptions), we need to log in as the DOCTOR to satisfy RLS
  console.log("\n🔗 Inserting interrelated cases...");
  await supabase.auth.signInWithPassword({ email: 'doctor@test.com', password: '123456' });

  const patientId = createdUsers['patient'].id;
  const doctorId = createdUsers['doctor'].id;

  // 1. Telemedicine Request
  const { error: reqError } = await supabase.from('requests').insert([
    { patient_id: patientId, symptoms: 'أعاني من ألم حاد في الصدر مع ضيق في التنفس منذ يومين', status: 'pending', ai_summary: 'احتمالية ذبحة صدرية أو إجهاد عضلي، يتطلب استشارة عاجلة.' }
  ]);
  if (reqError) console.error("❌ Request Error:", reqError);
  else console.log("✅ Case 1: Created urgent patient request for Doctor.");

  // 2. Prescription
  const { error: rxError } = await supabase.from('prescriptions').insert([
    { patient_id: patientId, doctor_id: doctorId, medications: { raw_text: "Aspirin 100mg - 1 per day\nNitroglycerin - PRN" }, status: 'pending', notes: 'يجب صرف الدواء فوراً' }
  ]);
  if (rxError) console.error("❌ Prescription Error:", rxError);
  else console.log("✅ Case 2: Created pending prescription for Pharmacy.");

  // 3. Lab Request
  const { error: labError } = await supabase.from('lab_requests').insert([
    { patient_id: patientId, doctor_id: doctorId, test_type: 'ECG & Troponin Blood Test', status: 'pending', notes: 'مستعجل لتأكيد التشخيص القلبي' }
  ]);
  if (labError) {
      if (labError.message.includes('relation "public.lab_requests" does not exist')) {
          console.error("❌ Lab Error: You MUST run the updated supabase_schema.sql in Supabase Dashboard first!");
      } else {
          console.error("❌ Lab Error:", labError);
      }
  } else {
      console.log("✅ Case 3: Created pending lab request for Laboratory.");
  }

  console.log("\n🎉 Seeding Finished Successfully!");
  console.log(`
  Real test accounts are ready:
  - Patient: patient@test.com / 123456
  - Doctor: doctor@test.com / 123456
  - Lab: labo@test.com / 123456
  - Pharmacy: pharmacie@test.com / 123456
  `);
}

seed();
