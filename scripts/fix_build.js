const fs = require('fs');

try {
  let lab = fs.readFileSync('apps/lab/src/app/(dashboard)/layout.tsx', 'utf8');
  lab = lab.replace(/<\/main>[\r\n\s]+<\/div>[\r\n\s]+<\/div>/, '</main>\n    </div>');
  fs.writeFileSync('apps/lab/src/app/(dashboard)/layout.tsx', lab, 'utf8');
  console.log("Lab layout fixed");
} catch(e) { console.error(e) }

try {
  let rx = fs.readFileSync('apps/pharmacy/src/app/(dashboard)/layout.tsx', 'utf8');
  rx = rx.replace(/<\/main>[\r\n\s]+<\/div>[\r\n\s]+<\/div>/, '</main>\n    </div>');
  fs.writeFileSync('apps/pharmacy/src/app/(dashboard)/layout.tsx', rx, 'utf8');
  console.log("Pharmacy layout fixed");
} catch(e) { console.error(e) }

// Fix login page error
try {
  let login = fs.readFileSync('apps/doctor/src/app/login/page.tsx', 'utf8');
  
  // The line causing error is: setError("فشل تسجيل الدخول. تأكد من البريد و{lang === "ar" ? "كلمة المرور" : "Mot de passe"}.");
  // We will replace it with string interpolation or proper fallback
  // Since there are multiple corrupted replaces, let's just use regex to fix the setError line.
  
  // Actually, I can just replace the whole setError line.
  login = login.replace(/setError\("[^"]+\{lang[^}]+\}[^"]*"\);/g, 'setError(lang === "ar" ? "فشل تسجيل الدخول. تأكد من البريد وكلمة المرور." : "Échec de connexion. Vérifiez l\'e-mail et le mot de passe.");');
  
  // Also, did my other replacements in translate_login.js cause syntax errors?
  // I did: content.replace(/"دخول العيادة الرقمية →"/, 'lang === "ar" ? "دخول العيادة الرقمية →" : "Entrer dans la clinique numérique →"');
  // Which changes: 
  //   {loading ? "جاري التحقق..." : "دخول العيادة الرقمية →"}
  // to:
  //   {loading ? "جاري التحقق..." : lang === "ar" ? "دخول العيادة الرقمية →" : "Entrer dans la clinique numérique →"}
  // This is valid JS syntax.
  
  fs.writeFileSync('apps/doctor/src/app/login/page.tsx', login, 'utf8');
  console.log("Login page fixed");
} catch(e) { console.error(e) }
