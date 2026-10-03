import { describe, expect, it } from 'vitest';
import katex from 'katex';
import { katexOptions } from '$lib/katex/macros.js';
import { buildTeX, formulas } from './formulas';
import { machines, rules } from './negations';
import { greek, symbols } from './symbols';

const render = (s: string) => katex.renderToString(s, { ...katexOptions, throwOnError: true });

/** all \( … \) fragments inside a prose string */
function inlineMath(s: string): string[] {
	return [...s.matchAll(/\\\((.+?)\\\)/g)].map((m) => m[1]);
}

describe('formula decoder data', () => {
	it('every template uses each token exactly once', () => {
		for (const f of formulas) {
			const used = [...f.template.matchAll(/@(\d+)/g)].map((m) => Number(m[1])).sort((a, b) => a - b);
			expect(used).toEqual(f.tokens.map((_, i) => i));
		}
	});
	it('every formula renders, with any token highlighted', () => {
		for (const f of formulas) {
			expect(() => render(buildTeX(f, null))).not.toThrow();
			f.tokens.forEach((_, i) => expect(() => render(buildTeX(f, i))).not.toThrow());
			for (const t of f.tokens) for (const m of inlineMath(t.mean)) expect(() => render(m)).not.toThrow();
			for (const m of inlineMath(f.gloss)) expect(() => render(m)).not.toThrow();
		}
	});
});

describe('negation machine data', () => {
	it('every step and rule renders', () => {
		for (const r of rules) expect(() => render(r.tex)).not.toThrow();
		for (const m of machines) {
			for (const s of m.steps) {
				expect(() => render(s.tex)).not.toThrow();
				for (const x of inlineMath(s.note)) expect(() => render(x)).not.toThrow();
				expect(s.rule).toBeLessThan(rules.length);
			}
			for (const x of inlineMath(m.english)) expect(() => render(x)).not.toThrow();
		}
	});
	it('the final line of each machine has no ¬ left (it was pushed all the way in)', () => {
		for (const m of machines) {
			const last = m.steps[m.steps.length - 1].tex;
			if (m.id === 'loops') continue; // ends at a basic fact we leave in words
			expect(last.includes('\\neg')).toBe(false);
		}
	});
});

describe('symbol dictionary data', () => {
	it('every symbol and Greek letter renders', () => {
		for (const s of symbols) {
			expect(() => render(s.tex)).not.toThrow();
			for (const x of inlineMath(s.mean)) expect(() => render(x)).not.toThrow();
		}
		for (const g of greek) {
			expect(() => render(g.lower)).not.toThrow();
			const upper = g.upper;
			if (upper) expect(() => render(upper)).not.toThrow();
			for (const x of inlineMath(g.role)) expect(() => render(x)).not.toThrow();
		}
	});
});

describe('the logic in the chapter', () => {
	const implies = (p: boolean, q: boolean) => !p || q;
	const rows = [
		[true, true],
		[true, false],
		[false, true],
		[false, false]
	] as const;
	it('an implication is false only when P is true and Q is false', () => {
		expect(rows.map(([p, q]) => implies(p, q))).toEqual([true, false, true, true]);
	});
	it('the contrapositive always agrees with the implication; the converse does not', () => {
		for (const [p, q] of rows) expect(implies(!q, !p)).toBe(implies(p, q));
		expect(rows.some(([p, q]) => implies(q, p) !== implies(p, q))).toBe(true);
	});
	it('¬(P ⇒ Q) is P ∧ ¬Q, and De Morgan holds', () => {
		for (const [p, q] of rows) {
			expect(!implies(p, q)).toBe(p && !q);
			expect(!(p && q)).toBe(!p || !q);
			expect(!(p || q)).toBe(!p && !q);
		}
	});
	it('1 + 3 + … + (2n − 1) = n²', () => {
		for (let n = 1; n <= 50; n++) {
			let s = 0;
			for (let k = 1; k <= n; k++) s += 2 * k - 1;
			expect(s).toBe(n * n);
		}
	});
	it('∀x∃y (x + y = 0) holds on a finite window of ℤ, ∃y∀x fails', () => {
		const Z = Array.from({ length: 21 }, (_, i) => i - 10);
		expect(Z.every((x) => Z.some((y) => x + y === 0))).toBe(true);
		expect(Z.some((y) => Z.every((x) => x + y === 0))).toBe(false);
	});
});
