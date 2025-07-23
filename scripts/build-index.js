const fs = require('fs');
const path = require('path');

const quizDir = path.join(__dirname, '..', 'quiz');
const files = [];

function walk(dir, base = '') {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      walk(path.join(dir, entry.name), path.join(base, entry.name));
    } else if (entry.isFile() && entry.name.endsWith('.json') && entry.name !== 'index.json') {
      files.push(path.join(base, entry.name).replace(/\\/g, '/'));
    }
  }
}

walk(quizDir);
fs.writeFileSync(path.join(quizDir, 'index.json'), JSON.stringify(files, null, 2));
console.log('Generated quiz/index.json with', files.length, 'entries');
