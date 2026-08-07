const fs = require('fs');
const path = require('path');

function processDirectory(dirPath) {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
                processDirectory(fullPath);
            }
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            // Regex to replace $ not followed by { (to avoid breaking template literals like ${var})
            const newContent = content.replace(/\$(?!\{)/g, '₹');
            if (content !== newContent) {
                console.log(`Updated ${fullPath}`);
                fs.writeFileSync(fullPath, newContent, 'utf8');
            }
        }
    }
}

processDirectory(path.join(__dirname, 'frontend/src'));
processDirectory(path.join(__dirname, 'backend'));
