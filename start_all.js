const { spawn, exec } = require('child_process');
const http = require('http');
const path = require('path');

// تغيير المسار لمجلد المشروع الرئيسي تلقائياً
process.chdir(__dirname);

console.clear();
console.log('\x1b[36m%s\x1b[0m', '==============================================================');
console.log('\x1b[32m%s\x1b[0m', '      🚀 تشغيل كافة منصات مشروع عناية محلياً (5 منصات)');
console.log('\x1b[36m%s\x1b[0m', '==============================================================');
console.log('⏳ جاري تشغيل السيرفرات، سيتم فتح المتصفح تلقائياً فور جاهزية كل منصة...\n');

const platforms = [
  { id: 'admin',    name: 'إدارة النظام (Admin)',      port: 3000, dir: 'apps/admin',    url: 'http://localhost:3000/login', role: 'admin@test.com' },
  { id: 'doctor',   name: 'بوابة الطبيب (Doctor)',     port: 3001, dir: 'apps/doctor',   url: 'http://localhost:3001/login', role: 'doctor@test.com' },
  { id: 'lab',      name: 'بوابة المخبر (Lab)',         port: 3002, dir: 'apps/lab',      url: 'http://localhost:3002/login', role: 'labo@test.com' },
  { id: 'pharmacy', name: 'بوابة الصيدلية (Pharmacy)',  port: 3003, dir: 'apps/pharmacy', url: 'http://localhost:3003/login', role: 'pharmacie@test.com' },
  { id: 'patient',  name: 'بوابة المريض (Patient)',     port: 3004, dir: 'apps/patient',  url: 'http://localhost:3004/login', role: 'patient@test.com' },
];

const children = [];
const readySet = new Set();

function openBrowser(url) {
  const startCmd = process.platform === 'win32' ? `start "" "${url}"` :
                   process.platform === 'darwin' ? `open "${url}"` :
                   `xdg-open "${url}"`;
  exec(startCmd);
}

function checkHealth(platform) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${platform.port}`, { timeout: 1500 }, (res) => {
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
  });
}

// تشغيل كل منصة
platforms.forEach((p) => {
  console.log(`📡 بدء تشغيل [${p.name}] على المنفذ ${p.port}...`);
  
  const child = spawn('npm.cmd', ['run', 'dev', '-w', p.dir, '--', '-p', String(p.port)], {
    shell: true,
    stdio: 'ignore', // لمنع تداخل السجلات وتشتيت المستخدم
  });

  children.push(child);
});

// مراقبة جاهزية السيرفرات وفتح المتصفح فور استجابة المنفذ
let intervalCount = 0;
const pollInterval = setInterval(async () => {
  intervalCount++;

  for (const p of platforms) {
    if (!readySet.has(p.id)) {
      const isUp = await checkHealth(p);
      if (isUp) {
        readySet.add(p.id);
        console.log(`\x1b[32m✔ [جاهز]\x1b[0m ${p.name} -> \x1b[34m${p.url}\x1b[0m`);
        openBrowser(p.url);
      }
    }
  }

  if (readySet.size === platforms.length || intervalCount > 40) {
    clearInterval(pollInterval);
    if (readySet.size === platforms.length) {
      console.log('\n\x1b[32m%s\x1b[0m', '🎉 تم تشغيل كافة المنصات الخمس بنجاح وفُتحت في المتصفح!');
    } else {
      console.log('\n\x1b[33m%s\x1b[0m', '⚠️ بعض السيرفرات قد تستغرق وقتاً إضافياً في البدء.');
    }
    printSummary();
  }
}, 1500);

function printSummary() {
  console.log('\n\x1b[36m%s\x1b[0m', '==============================================================');
  console.log('📌 جدول الروابط وبيانات الدخول التجريبي للمناقشين:');
  console.log('--------------------------------------------------------------');
  platforms.forEach(p => {
    console.log(`• ${p.name}:`);
    console.log(`  الرابط: ${p.url}`);
    console.log(`  البريد: ${p.role}  |  كلمة المرور: 123456`);
  });
  console.log('--------------------------------------------------------------');
  console.log('\x1b[33m%s\x1b[0m', '🛑 لإيقاف جميع السيرفرات في أي وقت: اضغط Ctrl + C في هذه النافذة');
  console.log('\x1b[36m%s\x1b[0m', '==============================================================\n');
}

// تنظيف السيرفرات عند الإغلاق
function cleanup() {
  console.log('\n🛑 جاري إيقاف جميع السيرفرات...');
  clearInterval(pollInterval);
  children.forEach(c => {
    try {
      if (process.platform === 'win32') {
        exec(`taskkill /pid ${c.pid} /T /F`);
      } else {
        c.kill('SIGINT');
      }
    } catch (e) {}
  });
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

