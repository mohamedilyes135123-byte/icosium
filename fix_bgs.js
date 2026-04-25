const fs = require('fs');

const adminFile = 'apps/admin/src/app/login/page.tsx';
const pharmacyFile = 'apps/pharmacy/src/app/login/page.tsx';
const labFile = 'apps/lab/src/app/login/page.tsx';

const oldBg = '<div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-100/50 via-slate-50 to-white"></div>';

// Admin
let adminContent = fs.readFileSync(adminFile, 'utf8');
adminContent = adminContent.replace(oldBg,       <div className="absolute inset-0 z-0">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-indigo-200/40 rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-white" />
      </div>);
fs.writeFileSync(adminFile, adminContent, 'utf8');

// Pharmacy
let pharmacyContent = fs.readFileSync(pharmacyFile, 'utf8');
pharmacyContent = pharmacyContent.replace(oldBg,       <div className="absolute inset-0 z-0">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-teal-200/40 rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-cyan-200/30 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-teal-50/30 to-white" />
      </div>);
fs.writeFileSync(pharmacyFile, pharmacyContent, 'utf8');

// Lab
let labContent = fs.readFileSync(labFile, 'utf8');
labContent = labContent.replace(oldBg,       <div className="absolute inset-0 z-0">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-sky-200/40 rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-indigo-200/30 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-sky-50/30 to-white" />
      </div>);
fs.writeFileSync(labFile, labContent, 'utf8');

console.log('Fixed backgrounds for Admin, Pharmacy, and Lab.');
