const fs = require('fs');
const path = require('path');

function stripCommentsAndStrings(code) {
    let result = '';
    let inString = false;
    let stringChar = '';
    let inComment = false;
    let inMultiComment = false;
    
    for (let i = 0; i < code.length; i++) {
        const c = code[i];
        const next = code[i+1];
        
        if (inString) {
            if (c === '\\') { i++; continue; }
            if (c === stringChar) inString = false;
            continue;
        }
        if (inComment) {
            if (c === '\n') { inComment = false; result += '\n'; }
            continue;
        }
        if (inMultiComment) {
            if (c === '*' && next === '/') { inMultiComment = false; i++; }
            continue;
        }
        
        if (c === '/' && next === '/') { inComment = true; i++; continue; }
        if (c === '/' && next === '*') { inMultiComment = true; i++; continue; }
        if (c === '"' || c === "'" || c === '`') { inString = true; stringChar = c; continue; }
        
        result += c;
    }
    return result;
}

function findNestedFunctions(filePath) {
    const rawContent = fs.readFileSync(filePath, 'utf-8');
    const content = stripCommentsAndStrings(rawContent);
    const lines = content.split('\n');
    const rawLines = rawContent.split('\n');
    
    let blockDepth = 0;
    let outerFunction = null;
    let outerDepth = -1;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Find function declaration (including arrows)
        const funcMatch = line.match(/(?:function\s+([A-Za-z0-9_]+)|const\s+([A-Za-z0-9_]+)\s*=\s*(?:\([^)]*\)|[A-Za-z0-9_]+)\s*=>)/);
        if (funcMatch) {
            const funcName = funcMatch[1] || funcMatch[2];
            // Capitalized function names only, to find nested React components
            if (funcName && /^[A-Z]/.test(funcName)) {
                if (outerFunction === null) {
                    outerFunction = funcName;
                    outerDepth = blockDepth;
                } else if (blockDepth > outerDepth) {
                    console.log(`NESTED COMPONENT FOUND: ${funcName} inside ${outerFunction} in ${filePath}:${i+1}`);
                    console.log(`  Code: ${rawLines[i].trim()}`);
                }
            }
        }
        
        blockDepth += (line.match(/\{/g) || []).length;
        blockDepth -= (line.match(/\}/g) || []).length;
        
        if (outerFunction && blockDepth <= outerDepth) {
            outerFunction = null;
            outerDepth = -1;
        }
    }
}

function walk(dir) {
    for (const f of fs.readdirSync(dir)) {
        const p = path.join(dir, f);
        if (fs.statSync(p).isDirectory()) walk(p);
        else if (p.endsWith('.jsx')) findNestedFunctions(p);
    }
}

walk('app/components');
walk('app/(app)');
console.log('Done scanning for nested React components.');
