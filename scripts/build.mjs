'import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const rootDir = process.cwd();
const outDir = resolve(rootDir, 'dist');
const filesToCopy = ['index.html', 'docs.html', 'flow.css', 'flow.js'];

if (existsSync(outDir)) {
  rmSync(outDir, { recursive: true, force: true });
}

mkdirSync(outDir, { recursive: true });

for (const file of filesToCopy) {
  cpSync(resolve(rootDir, file), resolve(outDir, file));
}

console.log(`Built site into ${outDir}`);
