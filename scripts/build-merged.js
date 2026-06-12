import fs from 'node:fs';
import path from 'node:path';
import { defaultLexiconFiles, loadLexicon } from '../src/normalize.js';

const root = process.cwd();
const entries = loadLexicon(defaultLexiconFiles(root));
const seen = new Set();
const merged = [];
for (const entry of entries) {
  const key = entry.surface;
  if (seen.has(key)) continue;
  seen.add(key);
  merged.push(entry);
}
merged.sort((a, b) => a.surface.localeCompare(b.surface, 'ja'));
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist', 'merged.json'), JSON.stringify(merged, null, 2) + '\n');
console.log(`merged ${merged.length} entries -> dist/merged.json`);
