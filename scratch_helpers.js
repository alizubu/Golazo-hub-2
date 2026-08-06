const fs = require('fs');
const path = require('path');

function checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    let currentFunction = null;
    let blockLevel = 0;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        const funcMatch = line.match(/(?:function\s+([A-Za-z0-9_]+)|const\s+([A-Za-z0-9_]+)\s*=\s*(?:\([^)]*\)|[A-Za-z0-9_]+)\s*=>)/);
        if (funcMatch) {
            currentFunction = funcMatch[1] || funcMatch[2];
            blockLevel = 0;
        }
        
        if (currentFunction) {
            if (line.includes('{')) blockLevel += (line.match(/\{/g) || []).length;
            if (line.includes('}')) blockLevel -= (line.match(/\}/g) || []).length;
            
            if (line.match(/\buse(State|Effect|Memo|Callback|Ref|Context|Reducer)\s*\(/)) {
                if (!/^[A-Z]/.test(currentFunction) && !/^use[A-Z]/.test(currentFunction)) {
                    console.log(`Hook found inside non-component/non-hook function '${currentFunction}' in ${filePath}:${i+1}`);
                }
            }
            
            if (blockLevel <= 0) {
                currentFunction = null;
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

walkDir('app');
console.log('Done checking for hooks in regular functions.');
