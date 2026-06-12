import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeText } from '../src/normalize.js';

const lexicon = [
  { surface: 'Grothendieck宇宙', reading: 'Grothendieck universe' },
  { surface: 'Fiber層', reading: 'fiber sheaf' }
];

test('applies composable technical lexicon entries', () => {
  assert.equal(normalizeText('Grothendieck宇宙 と Fiber層', lexicon), 'Grothendieck universe と fiber sheaf');
});

test('normalizes implication and membership in English reading style', () => {
  assert.equal(normalizeText('I ∈ U ⇒ x ∈ U', []), 'I is in U implies x is in U');
});

test('normalizes a MathJax-like indexed family expression', () => {
  const out = normalizeText('{\\displaystyle \\{x_{\\alpha }\\}_{\\alpha \\in I}} ⇒ \\bigcup _{\\alpha \\in I}x_{\\alpha } ∈ U', []);
  assert.match(out, /alpha/);
  assert.match(out, /implies/);
  assert.match(out, /the union over/);
  assert.match(out, /is in U/);
});
