const fs = require('fs');
const path = require('path');

function checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    let inComponent = false;
    let blockLevel = 0;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        if (line.match(/(?:function\s+[A-Z]\w*|const\s+[A-Z]\w*\s*=\s*(?:\([^)]*\)|[a-zA-Z0-9_]+)\s*=>)/)) {
            inComponent = true;
            blockLevel = 0;
        }
        
        if (inComponent) {
            if (line.includes('{')) blockLevel += (line.match(/\{/g) || []).length;
            if (line.includes('}')) blockLevel -= (line.match(/\}/g) || []).length;
            
            if (blockLevel === 1 && line.match(/^\s*if\s*\([^)]+\)\s*return/)) {
                console.log(`Early return found in ${filePath}:${i + 1} -> ${line.trim()}`);
            }
            if (blockLevel === 1 && line.match(/^\s*return/) && !line.match(/=>/)) {
                // If it's a return, check if it's the last return in the function
                let isLast = true;
                for (let j = i + 1; j < lines.length; j++) {
                    const nextLine = lines[j];
                    if (nextLine.match(/^\s*\}/) && j === i + 1) {
                        break;
                    }
                    if (nextLine.trim() !== '' && !nextLine.match(/^\s*\}/)) {
                        isLast = false;
                        break;
                    }
                }
                if (!isLast && !line.match(/</)) { // Ignore if it's returning JSX (rough heuristic)
                     console.log(`Early return block found in ${filePath}:${i + 1} -> ${line.trim()}`);
                }
            }
            
            if (blockLevel <= 0) {
                inComponent = false;
            }
        }
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            checkFile(fullPath);
        }
    }
}

walkDir('app/components');
