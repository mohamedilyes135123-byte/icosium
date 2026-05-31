const fs = require('fs');

function updateFile(path) {
  let content = fs.readFileSync(path, 'utf8');
  
  // Remove mixBlendMode entirely
  content = content.replace(/mixBlendMode:\s*"multiply",?\s*/g, '');
  content = content.replace(/style={{ mixBlendMode: "multiply" }}/g, '');
  
  // Remove grayscale and opacity so they are completely clear
  content = content.replace(/grayscale\(0\.8\)\s*opacity\(0\.6\)/g, 'none');
  content = content.replace(/grayscale\(1\)\s*opacity\(0\.5\)/g, 'none');
  
  // Increase sizes
  // Tabs: width 60 -> 72
  content = content.replace(/width={60} height={60}/g, 'width={76} height={76}');
  // Type: width 72 -> 90
  content = content.replace(/width={72} height={72}/g, 'width={96} height={96}');
  // Results empty states: width 120 -> 140
  content = content.replace(/width={120} height={120}/g, 'width={140} height={140}');
  
  // Increase negative margins to pop out more for larger sizes
  // top: tab === t.key ? -30 : -20 -> top: tab === t.key ? -40 : -24
  content = content.replace(/top: tab === t\.key \? -30 : -20/g, 'top: tab === t.key ? -40 : -24');
  // top: priority === p.v ? -30 : -20 -> top: priority === p.v ? -40 : -24
  content = content.replace(/top: priority === p\.v \? -30 : -20/g, 'top: priority === p.v ? -40 : -24');
  // top: -36 -> top: -48
  content = content.replace(/top: -36/g, 'top: -48');
  
  fs.writeFileSync(path, content);
}

updateFile('apps/patient/src/app/(dashboard)/requests/page.tsx');
updateFile('apps/patient/src/app/(dashboard)/results/page.tsx');
console.log("Images made fully opaque and larger.");
