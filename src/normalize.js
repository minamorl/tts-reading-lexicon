import fs from 'node:fs';
import path from 'node:path';

const COMMAND_WORDS = new Map([
  ['alpha', 'alpha'],
  ['beta', 'beta'],
  ['gamma', 'gamma'],
  ['delta', 'delta'],
  ['epsilon', 'epsilon'],
  ['varepsilon', 'epsilon'],
  ['zeta', 'zeta'],
  ['eta', 'eta'],
  ['theta', 'theta'],
  ['vartheta', 'theta'],
  ['iota', 'iota'],
  ['kappa', 'kappa'],
  ['lambda', 'lambda'],
  ['mu', 'mu'],
  ['nu', 'nu'],
  ['xi', 'xi'],
  ['pi', 'pi'],
  ['rho', 'rho'],
  ['sigma', 'sigma'],
  ['tau', 'tau'],
  ['upsilon', 'upsilon'],
  ['phi', 'phi'],
  ['varphi', 'phi'],
  ['chi', 'chi'],
  ['psi', 'psi'],
  ['omega', 'omega'],
  ['Gamma', 'capital gamma'],
  ['Delta', 'capital delta'],
  ['Theta', 'capital theta'],
  ['Lambda', 'capital lambda'],
  ['Xi', 'capital xi'],
  ['Pi', 'capital pi'],
  ['Sigma', 'capital sigma'],
  ['Phi', 'capital phi'],
  ['Psi', 'capital psi'],
  ['Omega', 'capital omega'],
  ['mathbb', ''],
  ['mathrm', ''],
  ['mathbf', ''],
  ['mathcal', ''],
  ['operatorname', ''],
  ['displaystyle', ''],
  ['textstyle', ''],
  ['left', ''],
  ['right', ''],
  [',', ''],
  [';', ''],
  ['quad', ''],
  ['qquad', '']
]);

const INFIX_OPERATORS = new Map([
  ['\\Rightarrow', 'implies'],
  ['\\implies', 'implies'],
  ['⇒', 'implies'],
  ['=>', 'implies'],
  ['\\Leftrightarrow', 'if and only if'],
  ['\\iff', 'if and only if'],
  ['⇔', 'if and only if'],
  ['<=>', 'if and only if'],
  ['\\in', 'is in'],
  ['∈', 'is in'],
  ['\\notin', 'is not in'],
  ['∉', 'is not in'],
  ['\\subset', 'is a subset of'],
  ['⊂', 'is a subset of'],
  ['\\subseteq', 'is a subset of or equal to'],
  ['⊆', 'is a subset of or equal to'],
  ['\\supset', 'is a superset of'],
  ['⊃', 'is a superset of'],
  ['\\supseteq', 'is a superset of or equal to'],
  ['⊇', 'is a superset of or equal to'],
  ['\\cup', 'union'],
  ['∪', 'union'],
  ['\\cap', 'intersection'],
  ['∩', 'intersection'],
  ['\\times', 'times'],
  ['×', 'times'],
  ['\\cdot', 'times'],
  ['·', 'times'],
  ['+', 'plus'],
  ['-', 'minus'],
  ['−', 'minus'],
  ['=', 'equals'],
  ['\\neq', 'is not equal to'],
  ['≠', 'is not equal to'],
  ['\\le', 'is less than or equal to'],
  ['\\leq', 'is less than or equal to'],
  ['≤', 'is less than or equal to'],
  ['\\ge', 'is greater than or equal to'],
  ['\\geq', 'is greater than or equal to'],
  ['≥', 'is greater than or equal to'],
  ['\\to', 'to'],
  ['→', 'to'],
  ['\\mapsto', 'maps to'],
  ['↦', 'maps to'],
  [':', 'such that'],
  ['|', 'such that']
]);

const PREFIX_OPERATORS = new Map([
  ['\\forall', 'for all'],
  ['∀', 'for all'],
  ['\\exists', 'there exists'],
  ['∃', 'there exists'],
  ['\\neg', 'not'],
  ['¬', 'not']
]);

const BIG_OPERATORS = new Map([
  ['\\bigcup', 'the union'],
  ['⋃', 'the union'],
  ['\\bigcap', 'the intersection'],
  ['⋂', 'the intersection'],
  ['\\sum', 'the sum'],
  ['∑', 'the sum'],
  ['\\prod', 'the product'],
  ['∏', 'the product'],
  ['\\int', 'the integral'],
  ['∫', 'the integral']
]);

const DELIMITERS = new Map([
  ['\\{', ''],
  ['\\}', ''],
  ['\\langle', 'angle bracket'],
  ['\\rangle', 'angle bracket'],
  ['(', ''],
  [')', ''],
  ['[', ''],
  [']', '']
]);

export function loadLexicon(files) {
  return files.flatMap((file) => JSON.parse(fs.readFileSync(file, 'utf8')));
}

export function applyLexicon(input, entries) {
  return [...entries]
    .sort((a, b) => b.surface.length - a.surface.length)
    .reduce((text, entry) => text.split(entry.surface).join(entry.reading), input);
}

function tokenize(input) {
  const tokens = [];
  let i = 0;
  while (i < input.length) {
    const ch = input[i];
    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }
    if (ch === '\\') {
      const rest = input.slice(i);
      const escapedDelimiter = rest.match(/^\\[{}]/);
      if (escapedDelimiter) {
        tokens.push({ type: 'symbol', value: escapedDelimiter[0] });
        i += escapedDelimiter[0].length;
        continue;
      }
      const command = rest.match(/^\\[A-Za-z]+|^\\[,;]/);
      if (command) {
        tokens.push({ type: 'command', value: command[0] });
        i += command[0].length;
        continue;
      }
      tokens.push({ type: 'text', value: ch });
      i += 1;
      continue;
    }
    const two = input.slice(i, i + 2);
    const three = input.slice(i, i + 3);
    if (INFIX_OPERATORS.has(three)) {
      tokens.push({ type: 'symbol', value: three });
      i += 3;
      continue;
    }
    if (INFIX_OPERATORS.has(two)) {
      tokens.push({ type: 'symbol', value: two });
      i += 2;
      continue;
    }
    if ('{}_^'.includes(ch)) {
      tokens.push({ type: ch, value: ch });
      i += 1;
      continue;
    }
    if (INFIX_OPERATORS.has(ch) || PREFIX_OPERATORS.has(ch) || BIG_OPERATORS.has(ch) || DELIMITERS.has(ch)) {
      tokens.push({ type: 'symbol', value: ch });
      i += 1;
      continue;
    }
    const word = input.slice(i).match(/^[A-Za-z0-9]+(?:\.[A-Za-z0-9]+)?|^[\u3040-\u30ff\u3400-\u9fffー]+/u);
    if (word) {
      tokens.push({ type: 'text', value: word[0] });
      i += word[0].length;
      continue;
    }
    tokens.push({ type: 'symbol', value: ch });
    i += 1;
  }
  return tokens;
}

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
  }

  peek(offset = 0) {
    return this.tokens[this.pos + offset];
  }

  consume(type, value) {
    const token = this.peek();
    if (!token) return undefined;
    if (type && token.type !== type) return undefined;
    if (value && token.value !== value) return undefined;
    this.pos += 1;
    return token;
  }

  parseUntil(stopType) {
    const parts = [];
    while (this.peek() && this.peek().type !== stopType) {
      parts.push(this.parseAtomWithScripts());
    }
    return compact(parts.join(' '));
  }

  parseGroupOrAtom() {
    if (this.consume('{')) {
      const body = this.parseUntil('}');
      this.consume('}');
      return body;
    }
    return this.parseAtomWithScripts();
  }

  parseAtomWithScripts() {
    let base = this.parseAtom();
    while (this.peek()?.type === '_' || this.peek()?.type === '^') {
      const marker = this.consume().type;
      const script = this.parseGroupOrAtom();
      if (!script) continue;
      base = marker === '_' ? `${base} sub ${script}` : `${base} to the power of ${script}`;
    }
    return compact(base);
  }

  parseAtom() {
    const token = this.consume();
    if (!token) return '';

    if (token.type === '{') {
      const body = this.parseUntil('}');
      this.consume('}');
      return maybeFamilyReading(body);
    }

    if (token.type === 'text') return token.value;

    if (token.type === 'command') {
      return this.parseCommand(token.value.slice(1));
    }

    if (token.type === 'symbol') {
      if (BIG_OPERATORS.has(token.value)) return this.parseBigOperator(token.value);
      if (PREFIX_OPERATORS.has(token.value)) return PREFIX_OPERATORS.get(token.value);
      if (INFIX_OPERATORS.has(token.value)) return INFIX_OPERATORS.get(token.value);
      if (DELIMITERS.has(token.value)) return DELIMITERS.get(token.value);
      return token.value;
    }

    if (token.type === '}') return '';
    return token.value;
  }

  parseCommand(name) {
    const command = `\\${name}`;
    if (command === '\\frac') {
      const numerator = this.parseGroupOrAtom();
      const denominator = this.parseGroupOrAtom();
      return compact(`fraction with numerator ${numerator} and denominator ${denominator}`);
    }
    if (command === '\\sqrt') {
      const radicand = this.parseGroupOrAtom();
      return compact(`square root of ${radicand}`);
    }
    if (BIG_OPERATORS.has(command)) return this.parseBigOperator(command);
    if (PREFIX_OPERATORS.has(command)) return PREFIX_OPERATORS.get(command);
    if (INFIX_OPERATORS.has(command)) return INFIX_OPERATORS.get(command);
    if (DELIMITERS.has(command)) return DELIMITERS.get(command);
    if (COMMAND_WORDS.has(name)) {
      const word = COMMAND_WORDS.get(name);
      if (word === '') return '';
      return word;
    }
    return name.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  parseBigOperator(command) {
    let reading = BIG_OPERATORS.get(command);
    if (this.peek()?.type === '_') {
      this.consume('_');
      const lower = this.parseGroupOrAtom();
      if (lower) reading += ` over ${lower}`;
    }
    if (this.peek()?.type === '^') {
      this.consume('^');
      const upper = this.parseGroupOrAtom();
      if (upper) reading += ` up to ${upper}`;
    }
    return reading;
  }
}

function maybeFamilyReading(text) {
  const match = text.match(/^(.+) sub (.+)$/);
  if (!match) return text;
  const [, family, index] = match;
  if (!family.includes(' sub ')) return text;
  return compact(`the family ${family} indexed by ${index}`);
}

export function normalizeLatex(input) {
  const normalized = input
    .replace(/\$\$/g, ' ')
    .replace(/\$/g, ' ')
    .replace(/\\\[/g, ' ')
    .replace(/\\\]/g, ' ')
    .replace(/\\\(/g, ' ')
    .replace(/\\\)/g, ' ');
  const parser = new Parser(tokenize(normalized));
  return compact(parser.parseUntil());
}

export function normalizeText(input, entries = []) {
  const withLexicon = applyLexicon(input, entries);
  return normalizeLatex(withLexicon);
}

export function compact(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:])/g, '$1')
    .replace(/\s+'\s+/g, "'")
    .trim();
}

export function defaultLexiconFiles(root = process.cwd()) {
  const dataDir = path.join(root, 'data');
  return ['math.json', 'physics.json', 'chemistry.json'].map((name) => path.join(dataDir, name));
}

export const __internal = { tokenize };
