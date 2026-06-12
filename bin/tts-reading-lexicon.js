#!/usr/bin/env node
import fs from 'node:fs';
import { defaultLexiconFiles, loadLexicon, normalizeText } from '../src/normalize.js';

const text = process.argv.slice(2).join(' ') || fs.readFileSync(0, 'utf8');
const entries = loadLexicon(defaultLexiconFiles(process.cwd()));
console.log(normalizeText(text, entries));
