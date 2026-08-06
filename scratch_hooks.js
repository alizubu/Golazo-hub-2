const fs = require('fs');
const path = require('path');

function checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    let inFunction = false;
    let funcName = '';
    let hasReturned = false;
    let blockLevel = 0;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Match function start
        if (line.match(/(?:function\s+([A-Z]\w*)|const\s+([A-Z]\w*)\s*=\s*(?:\([^)]*\)|[a-zA-Z0-9_]+)\s*=>)/)) {
            inFunction = true;
            hasReturned = false;
            blockLevel = 0; // rough heuristic
        }
        
        if (inFunction) {
            if (line.includes('{')) blockLevel += (line.match(/\{/g) || []).length;
            if (line.includes('}')) blockLevel -= (line.match(/\}/g) || []).length;
            
            // Check for return at top level of function
            if (blockLevel === 1 && line.match(/^\s*return\b/) && !line.match(/=>\s*return/)) {
                hasReturned = true;
            }
            
            // If we've seen a return and now see a hook
            if (hasReturned && line.match(/\buse(State|Effect|Memo|Callback|Context|Ref)\s*\(/)) {
                console.log(`Hook after return found in ${filePath}:${i + 1} -> ${line.trim()}`);
            }
            
            if (blockLevel <= 0) {
                inFunction = false;
                hasReturned = false;
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
console.log('Done checking for hooks after return.');
