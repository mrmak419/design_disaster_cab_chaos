const fs = require('fs');
const path = require('path');

// Folders to ignore
const IGNORE_LIST = ['node_modules', '.git', 'dist'];

function printTree(dir, prefix = '') {
  const files = fs.readdirSync(dir);

  files.forEach((file, index) => {
    // Skip ignored directories
    if (IGNORE_LIST.includes(file)) return;

    const filePath = path.join(dir, file);
    const isDirectory = fs.statSync(filePath).isDirectory();
    const isLast = index === files.length - 1;

    // Build the visual tree structure
    const marker = isLast ? '└── ' : '├── ';
    console.log(`${prefix}${marker}${file}`);

    if (isDirectory) {
      const newPrefix = prefix + (isLast ? '    ' : '│   ');
      printTree(filePath, newPrefix);
    }
  });
}

console.log('```text'); // Start Markdown code block
console.log(path.basename(process.cwd())); // Print the root folder name
printTree(process.cwd());
console.log('```'); // End Markdown code block
