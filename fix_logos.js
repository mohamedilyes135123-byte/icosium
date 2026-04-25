const fs = require('fs');
const files = [
  'apps/patient/src/app/login/page.tsx',
  'apps/doctor/src/app/login/page.tsx',
  'apps/admin/src/app/login/page.tsx',
  'apps/pharmacy/src/app/login/page.tsx',
  'apps/lab/src/app/login/page.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Patient, Admin, Pharmacy, Lab, Doctor
  
  // Replace the inner container (rounded-3xl bg-white/90) with the new rounded-2xl bg-white container
  content = content.replace(
    /<div className="w-28 h-28 rounded-3xl bg-white\/90 border border-(emerald|blue|indigo|amber|purple)-100 shadow-xl shadow-\1-500\/10 flex items-center justify-center relative z-10 logo-float backdrop-blur-sm">/g,
    '<div className="w-28 h-28 rounded-2xl bg-white border border--100 shadow-xl flex items-center justify-center relative z-10 logo-float">'
  );
  
  // Fix the img size to w-24 h-24
  content = content.replace(
    /className="w-20 h-20 object-contain drop-shadow-md"/g,
    'className="w-24 h-24 object-contain drop-shadow-sm"'
  );

  // Replace the glow (rounded-full -> rounded-3xl, inset-[-12px] -> inset-[-8px], opacity-60)
  content = content.replace(
    /<div className="absolute inset-\[-12px\] z-0 glow-pulse rounded-full blur-2xl (bg-gradient-to-tr from-(emerald|blue|indigo|orange|purple)-400 via-(teal|cyan|blue|amber|pink)-400 to-(green|sky|cyan|yellow|fuchsia)-300)" \/>/g,
    '<div className="absolute inset-[-8px] z-0 glow-pulse rounded-3xl blur-xl  opacity-60" />'
  );
  
  // Reorder the glow to be BEHIND the container by moving it before the container in the DOM
  // We need to swap them.
  // The structure is:
  // <div class="w-28...">...</div>
  // <div class="absolute inset-[-8px]..."></div>
  // Let's use regex to swap
  const swapRegex = /(<div className="w-28 h-28 rounded-2xl[^>]+>[\s\S]*?<\/div>)\s*(<div className="absolute inset-\[-8px\] z-0 glow-pulse rounded-3xl blur-xl bg-gradient-to-tr[^>]+" \/>)/g;
  content = content.replace(swapRegex, '\n            ');

  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed ' + file);
});
