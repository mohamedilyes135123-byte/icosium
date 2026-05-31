const fs = require('fs');
let content = fs.readFileSync('apps/doctor/src/app/(dashboard)/layout.tsx', 'utf8');
content = content.replace(/<\/main>[\r\n\s]+<\/div>[\r\n\s]+{\/\* Mobile Bottom Navigation \*\//, '</main>\n      {/* Mobile Bottom Navigation */}');
fs.writeFileSync('apps/doctor/src/app/(dashboard)/layout.tsx', content, 'utf8');
