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

test('normalizes subset and superset symbols in English reading style', () => {
  assert.equal(normalizeText('A ⊂ B ⇒ B ⊃ A', []), 'A is a subset of B implies B is a superset of A');
});

test('normalizes fractions, square roots, superscripts, and subscripts', () => {
  assert.equal(
    normalizeText('\\frac{x_{\\alpha}}{y^2} + \\sqrt{z}', []),
    'fraction with numerator x sub alpha and denominator y to the power of 2 plus square root of z'
  );
});

test('normalizes a MathJax-like indexed family expression', () => {
  const input = '{\\displaystyle \\{x_{\\alpha }\\}_{\\alpha \\in I}} が U の元の族で I ∈ U ⇒ {\\displaystyle \\bigcup _{\\alpha \\in I}x_{\\alpha }} ∈ U';
  const out = normalizeText(input, []);
  assert.match(out, /the family x sub alpha indexed by alpha is in I/);
  assert.match(out, /I is in U implies/);
  assert.match(out, /the union over alpha is in I x sub alpha is in U/);
});

test('normalizes quantifiers and bounded sums', () => {
  assert.equal(
    normalizeText('\\forall x \\in X, \\exists y \\in Y: \\sum_{i=1}^{n} a_i', []),
    'for all x is in X, there exists y is in Y such that the sum over i equals 1 up to n a sub i'
  );
});
