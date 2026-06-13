import fs from 'fs';
import path from 'path';

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      results.push(filePath);
    }
  });
  return results;
};

const srcDir = path.join(process.cwd(), 'frontend', 'src');
const files = walk(srcDir);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  if (content.includes('import { RootState } from')) {
    content = content.replace(/import\s*\{\s*RootState\s*\}\s*from/g, 'import type { RootState } from');
    changed = true;
  }
  if (content.includes("import { useSelector, useDispatch } from 'react-redux';\nimport { RootState } from")) {
    content = content.replace(/import\s*\{\s*RootState\s*\}\s*from/g, 'import type { RootState } from');
    changed = true;
  }
  content = content.replace(/import\s*\{\s*([^}]*?)RootState([^}]*?)\}\s*from\s*(['"].*?['"])/g, (match, p1, p2, p3) => {
    if (p1.trim() === '' && p2.trim() === '') {
      return `import type { RootState } from ${p3}`;
    }
    return match;
  });

  if (file.endsWith('authSlice.ts')) {
    content = content.replace(/import\s*\{\s*createSlice,\s*PayloadAction\s*\}\s*from\s*'@reduxjs\/toolkit'/g, 
      "import { createSlice } from '@reduxjs/toolkit';\nimport type { PayloadAction } from '@reduxjs/toolkit'");
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed', file);
  }
});
