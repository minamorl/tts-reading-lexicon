import fs from 'node:fs';
import path from 'node:path';

const SYMBOL_READINGS = [
  [/⇒|=>|\\Rightarrow/g, ' implies '],
  [/⇔|<=>|\\Leftrightarrow/g, ' if and only if '],
  [/∈|\\in/g, ' is in '],
  [/∉|\\notin/g, ' is not in '],
  [/∀|\\forall/g, ' for all '],
  [/∃|\\exists/g, ' there exists '],
  [/⊂|\\subset/g, ' is a subset of '],
  [/⊆|\\subseteq/g, ' is a subset of or equal to '],
  [/∪|\\cup/g, ' union '],
  [/⋃|\\bigcup/g, ' the union over '],
  [/∩|\\cap/g, ' intersection '],
  [/⋂|\\bigcap/g, ' the intersection over '],
  [/≃|\\simeq/g, ' is isomorphic to '],
  [/≅|\\cong/g, ' is congruent to '],
  [/≤|\\leq?/g, ' is less than or equal to '],
  [/≥|\\geq?/g, ' is greater than or equal to '],
  [/≠|\\neq/g, ' is not equal to '],
  [/=/g, ' equals '],
  [/\+/g, ' plus '],
  [/−|-/g, ' minus ']
];

const COMMAND_READINGS = [
  [/\\displaystyle\s*/g, ''],
  [/\\alpha/g, ' alpha '],
  [/\\beta/g, ' beta '],
  [/\\gamma/g, ' gamma '],
  [/\\delta/g, ' delta '],
  [/\\epsilon/g, ' epsilon '],
  [/\\lambda/g, ' lambda '],
  [/\\mu/g, ' mu '],
  [/\\pi/g, ' pi '],
  [/\\to/g, ' to '],
  [/\\mapsto/g, ' maps to ']
];

export function loadLexicon(files) {
  return files.flatMap((file) => JSON.parse(fs.readFileSync(file, 'utf8')));
}

export function applyLexicon(input, entries) {
  return [...entries]
    .sort((a, b) => b.surface.length - a.surface.length)
    .reduce((text, entry) => text.split(entry.surface).join(entry.reading), input);
}

export function normalizeLatex(input) {
  let text = input;
  text = text.replace(/\{\\displaystyle\s*([^}]*)\}/g, '$1');
  text = text.replace(/\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, ' fraction with numerator $1 and denominator $2 ');
  text = text.replace(/\\sqrt\s*\{([^{}]+)\}/g, ' square root of $1 ');
  text = text.replace(/([A-Za-z0-9]+)_\{([^{}]+)\}/g, '$1 sub $2');
  text = text.replace(/([A-Za-z0-9]+)\^\{([^{}]+)\}/g, '$1 to the power of $2');
  text = text.replace(/\{([^{}]+)\}_\{([^{}]+)\}/g, 'the family $1 indexed by $2');
  for (const [pattern, reading] of COMMAND_READINGS) text = text.replace(pattern, reading);
  for (const [pattern, reading] of SYMBOL_READINGS) text = text.replace(pattern, reading);
  text = text.replace(/[{}]/g, ' ');
  text = text.replace(/_/g, ' sub ');
  text = text.replace(/\^/g, ' to the power of ');
  return compact(text);
}

export function normalizeText(input, entries = []) {
  const withLexicon = applyLexicon(input, entries);
  return normalizeLatex(withLexicon);
}

export function compact(text) {
  return text.replace(/\s+/g, ' ').replace(/\s+([,.;:])/g, '$1').trim();
}

export function defaultLexiconFiles(root = process.cwd()) {
  const dataDir = path.join(root, 'data');
  return ['math.json', 'physics.json', 'chemistry.json'].map((name) => path.join(dataDir, name));
}
