const fs = require('fs');

// 1. Fix Doctor
let docFile = 'apps/doctor/src/app/login/page.tsx';
let docContent = fs.readFileSync(docFile, 'utf8');
// Fix missing border color
docContent = docContent.replace('border border--100', 'border border-blue-100');
// Fix missing gradient
docContent = docContent.replace('blur-xl  opacity-60', 'blur-xl bg-gradient-to-tr from-blue-400 via-cyan-400 to-sky-300 opacity-60');
// Swap order so glow is before the white container
let match = docContent.match(/(<div className="w-28 h-28 rounded-2xl bg-white[^>]+>[\s\S]*?<\/div>)\s*(<div className="absolute inset-\[-8px\] z-0 glow-pulse[^>]+" \/>)/);
if (match) {
    docContent = docContent.replace(match[0], match[2] + '\n            ' + match[1]);
}
fs.writeFileSync(docFile, docContent, 'utf8');

// 2. Fix Pharmacy colors
let phFile = 'apps/pharmacy/src/app/login/page.tsx';
let phContent = fs.readFileSync(phFile, 'utf8');
phContent = phContent.replace('from-orange-400 via-amber-400 to-yellow-300', 'from-teal-400 via-cyan-400 to-emerald-300');
fs.writeFileSync(phFile, phContent, 'utf8');

// 3. Fix Lab colors
let labFile = 'apps/lab/src/app/login/page.tsx';
let labContent = fs.readFileSync(labFile, 'utf8');
labContent = labContent.replace('from-purple-400 via-pink-400 to-fuchsia-300', 'from-indigo-400 via-sky-400 to-blue-300');
fs.writeFileSync(labFile, labContent, 'utf8');

console.log('Fixed Doctor, Pharmacy, and Lab colors');
