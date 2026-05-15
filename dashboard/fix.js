const fs = require('fs');
const content = fs.readFileSync('src/pages/Landing.tsx', 'utf8');
const lines = content.split('\n');
lines[299] = '            <a';
const fixed = lines.join('\n');
fs.writeFileSync('src/pages/Landing.tsx', fixed);
console.log('Fixed line 300');