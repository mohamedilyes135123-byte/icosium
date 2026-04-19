const fs = require('fs');
const paths = [
  "apps/admin/src/app/(dashboard)/approvals/page.tsx",
  "apps/admin/src/app/(dashboard)/audit/page.tsx",
  "apps/admin/src/app/(dashboard)/dashboard/page.tsx",
  "apps/admin/src/app/(dashboard)/users/page.tsx",
  "apps/admin/src/app/login/page.tsx",

  "apps/doctor/src/app/(dashboard)/dashboard/page.tsx",
  "apps/doctor/src/app/(dashboard)/patients/page.tsx",
  "apps/doctor/src/app/(dashboard)/prescriptions/new/page.tsx",
  "apps/doctor/src/app/(dashboard)/prescriptions/page.tsx",
  "apps/doctor/src/app/(dashboard)/requests/page.tsx",
  "apps/doctor/src/app/(dashboard)/settings/page.tsx",
  "apps/doctor/src/app/login/page.tsx",

  "apps/lab/src/app/(dashboard)/dashboard/page.tsx",
  "apps/lab/src/app/(dashboard)/requests/page.tsx",
  "apps/lab/src/app/(dashboard)/results/page.tsx",
  "apps/lab/src/app/login/page.tsx",

  "apps/patient/src/app/(dashboard)/dashboard/page.tsx",
  "apps/patient/src/app/(dashboard)/doctors/page.tsx",
  "apps/patient/src/app/(dashboard)/profile/page.tsx",
  "apps/patient/src/app/(dashboard)/requests/page.tsx",
  "apps/patient/src/app/(dashboard)/results/page.tsx",
  "apps/patient/src/app/(dashboard)/vitals/page.tsx",
  "apps/patient/src/app/login/page.tsx",

  "apps/pharmacy/src/app/(dashboard)/dashboard/page.tsx",
  "apps/pharmacy/src/app/(dashboard)/inventory/page.tsx",
  "apps/pharmacy/src/app/(dashboard)/prescriptions/page.tsx",
  "apps/pharmacy/src/app/login/page.tsx"
];

let updatedFiles = 0;
for (const p of paths) {
   let content = fs.readFileSync(p, 'utf8');
   
   // Apply force-dynamic if not present
   if (!content.includes('export const dynamic')) {
       // Insert after "use client";
       content = content.replace(/"use client";\r?\n/, '"use client";\n\nexport const dynamic = \'force-dynamic\';\n\n');
   }
   
   // Replace JSX.Element -> React.ReactNode (usually in STATUS_CONFIG objects in requests pages)
   if (content.includes('JSX.Element')) {
       content = content.replace(/JSX\.Element/g, 'React.ReactNode');
       if (!content.includes('import React')) {
           content = content.replace(/"use client";\r?\n/, '"use client";\nimport React from \'react\';\n');
       }
   }

   fs.writeFileSync(p, content, 'utf8');
   updatedFiles++;
}
console.log('Fixed ' + updatedFiles + ' files via Node.js (UTF-8 safe)');
