const fs = require('fs');
const path = require('path');

const quizDir = path.join(__dirname, '..', 'quiz');
const files = fs.readdirSync(quizDir).filter(f => f.endsWith('.json') && f !== 'index.json');
fs.writeFileSync(path.join(quizDir, 'index.json'), JSON.stringify(files, null, 2));
console.log('Generated quiz/index.json with', files.length, 'entries');
