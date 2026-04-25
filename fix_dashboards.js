const fs = require('fs');

const phFile = 'apps/pharmacy/src/app/(dashboard)/layout.tsx';
let phContent = fs.readFileSync(phFile, 'utf8');
phContent = phContent.replace(/violet/g, 'teal').replace(/fuchsia/g, 'emerald');
fs.writeFileSync(phFile, phContent, 'utf8');

const labFile = 'apps/lab/src/app/(dashboard)/layout.tsx';
let labContent = fs.readFileSync(labFile, 'utf8');
labContent = labContent.replace(/teal/g, 'indigo').replace(/emerald/g, 'sky');
fs.writeFileSync(labFile, labContent, 'utf8');

console.log('Fixed dashboard layouts for Pharmacy and Lab to match new identities.');
