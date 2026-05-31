const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../real_seed.sql');
const content = fs.readFileSync(filePath, 'utf-8');

// Convert characters to bytes and decode as UTF-8
const bytes = new Uint8Array(content.split('').map(c => c.charCodeAt(0)));
const decoded = new TextDecoder('utf-8').decode(bytes);

fs.writeFileSync(filePath, decoded, 'utf-8');
console.log('✅ Successfully fixed real_seed.sql encoding!');
