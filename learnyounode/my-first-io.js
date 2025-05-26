const fs = require('fs');

let file = fs.readFileSync(process.argv[2]);

// fs.readFileSync(process.argv[2], 'utf8') directly returns a string

const str = file.toString();

let lines = str.split('\n');

console.log(lines.length-1);









