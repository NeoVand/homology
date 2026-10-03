import { describe, expect, it } from 'vitest';
import { D3, byKey, compose, inverse, cayleyTable, sign, matrixOf, apply, slot, partialMove, det, mul } from './d3';
import {
	mod,
	gcd,
	lcm,
	orderIn,
	cycleOf,
	generators,
	subgroups,
	homImages,
	homKernel,
	homImage,
	isHom
} from './zn';
import { candidates } from './axioms';

const id = (k: keyof typeof byKey) => byKey[k].id;

describe('D3, the symmetries of a triangle', () => {
	it('the matrices move the slots exactly as the permutations say', () => {
		for (const g of D3) {
			const M = matrixOf(g.id);
			for (let i = 0; i < 3; i++) {
				const [x, y] = apply(M, slot(i));
				const [X, Y] = slot(g.perm[i]);
				expect(x).toBeCloseTo(X, 9);
				expect(y).toBeCloseTo(Y, 9);
			}
		}
	});
	it('partial moves start at the identity and end at the move', () => {
		for (const g of D3) {
			const A = partialMove(g.id, 0);
			const B = partialMove(g.id, 1);
			const M = matrixOf(g.id);
			[1, 0, 0, 1].forEach((v, i) => expect(A[i]).toBeCloseTo(v, 9));
			M.forEach((v, i) => expect(B[i]).toBeCloseTo(v, 9));
		}
	});
	it('composition matches matrix multiplication (first h, then g)', () => {
		for (const g of D3)
			for (const h of D3) {
				const P = mul(matrixOf(g.id), matrixOf(h.id));
				const Q = matrixOf(compose(g.id, h.id));
				P.forEach((v, i) => expect(v).toBeCloseTo(Q[i], 9));
			}
	});
	it('r∘f₁ = f₃ but f₁∘r = f₂: the group is not abelian', () => {
		expect(compose(id('r'), id('f1'))).toBe(id('f3'));
		expect(compose(id('f1'), id('r'))).toBe(id('f2'));
	});
	it('group axioms hold, and the Cayley table is a Latin square', () => {
		const T = cayleyTable();
		for (let a = 0; a < 6; a++) {
			expect(new Set(T[a]).size).toBe(6);
			expect(new Set(T.map((row) => row[a])).size).toBe(6);
			expect(compose(0, a)).toBe(a);
			expect(compose(a, 0)).toBe(a);
			expect(compose(a, inverse(a))).toBe(0);
			for (let b = 0; b < 6; b++)
				for (let c = 0; c < 6; c++) expect(compose(compose(a, b), c)).toBe(compose(a, compose(b, c)));
		}
	});
	it('flips are their own inverses; r and r² undo each other; f r f = r²', () => {
		for (const k of ['f1', 'f2', 'f3'] as const) expect(compose(id(k), id(k))).toBe(0);
		expect(inverse(id('r'))).toBe(id('r2'));
		expect(compose(compose(id('f1'), id('r')), id('f1'))).toBe(id('r2'));
	});
	it('every symmetry is r^k or r^k f₁ (r and f₁ generate D3)', () => {
		const r = id('r');
		const f = id('f1');
		const words = [0, r, compose(r, r), f, compose(r, f), compose(compose(r, r), f)];
		expect(new Set(words).size).toBe(6);
		expect(compose(r, f)).toBe(id('f3'));
		expect(compose(compose(r, r), f)).toBe(id('f2'));
	});
	it('the sign (face up / face down) is a homomorphism D3 → {±1} with kernel the rotations', () => {
		for (let a = 0; a < 6; a++) for (let b = 0; b < 6; b++) expect(sign(compose(a, b))).toBe(sign(a) * sign(b));
		for (let a = 0; a < 6; a++) expect(Math.sign(det(matrixOf(a)))).toBe(sign(a));
		expect(D3.filter((g) => sign(g.id) === 1).map((g) => g.key)).toEqual(['e', 'r', 'r2']);
	});
	it('the subgroups of D3 are the six we list in the text', () => {
		// brute force over all subsets containing e
		const subs: string[] = [];
		for (let mask = 1; mask < 64; mask++) {
			if (!(mask & 1)) continue;
			const S = D3.filter((g) => mask & (1 << g.id)).map((g) => g.id);
			const closed = S.every((a) => S.every((b) => S.includes(compose(a, b))));
			if (closed) subs.push(S.map((x) => D3[x].key).join(','));
		}
		expect(subs.sort()).toEqual(['e', 'e,f1', 'e,f2', 'e,f3', 'e,r,r2', 'e,r,r2,f1,f2,f3'].sort());
	});
});

describe('ℤ/n', () => {
	it('mod, gcd, lcm', () => {
		expect(mod(-1, 12)).toBe(11);
		expect(mod(15, 12)).toBe(3);
		expect(gcd(12, 18)).toBe(6);
		expect(lcm(4, 6)).toBe(12);
		expect(lcm(2, 3)).toBe(6);
	});
	it('orders of elements of ℤ/12 and the generators', () => {
		expect([...Array(12).keys()].map((k) => orderIn(k, 12))).toEqual([1, 12, 6, 4, 3, 12, 2, 12, 3, 4, 6, 12]);
		expect(generators(12)).toEqual([1, 5, 7, 11]);
		expect(generators(7)).toEqual([1, 2, 3, 4, 5, 6]);
		expect(cycleOf(4, 12)).toEqual([0, 4, 8]);
		expect(cycleOf(5, 12)).toEqual([0, 5, 10, 3, 8, 1, 6, 11, 4, 9, 2, 7]);
	});
	it('subgroups of ℤ/6', () => {
		expect(subgroups(6).map((s) => s.elements)).toEqual([[0, 1, 2, 3, 4, 5], [0, 2, 4], [0, 3], [0]]);
	});
	it('homomorphisms ℤ/m → ℤ/n are x ↦ kx with mk ≡ 0, and |ker|·|im| = m', () => {
		for (let m = 1; m <= 12; m++)
			for (let n = 1; n <= 12; n++) {
				const ks = homImages(m, n);
				expect(ks.length).toBe(gcd(m, n));
				for (const k of ks) {
					expect(isHom(m, n, (x) => (k * x) % n)).toBe(true);
					expect(homKernel(m, n, k).length * homImage(m, n, k).length).toBe(m);
				}
				// a k that violates mk ≡ 0 is not well defined (for m ≥ 2; ℤ/1 has only 0)
				if (m >= 2) for (let k = 0; k < n; k++) if (!ks.includes(k)) expect(isHom(m, n, (x) => (k * x) % n)).toBe(false);
			}
	});
	it('the doubling map on ℤ/6 has kernel {0,3} and image {0,2,4}', () => {
		expect(homKernel(6, 6, 2)).toEqual([0, 3]);
		expect(homImage(6, 6, 2)).toEqual([0, 2, 4]);
	});
	it('reduction ℤ/12 → ℤ/4 has kernel {0,4,8}', () => {
		expect(homKernel(12, 4, 1)).toEqual([0, 4, 8]);
	});
});

describe('the axiom-checker verdicts', () => {
	const finite = ['pm1', 'Z6+', 'Z6x', 'Z5x', 'sq', 'D3'];
	it('agree with brute force on the finite candidates', () => {
		for (const c of candidates.filter((c) => finite.includes(c.id))) {
			const S = c.sample;
			const closed = S.every((a) => S.every((b) => c.inSet(c.apply(a, b))));
			expect(closed, c.id + ' closure').toBe(c.closure.ok);
			const ids = S.filter((e) => S.every((a) => c.apply(e, a) === a && c.apply(a, e) === a));
			expect(ids.length > 0, c.id + ' identity').toBe(c.identity.ok);
			if (ids.length) {
				const e = ids[0];
				const inv = S.every((a) => S.some((b) => c.apply(a, b) === e && c.apply(b, a) === e));
				expect(inv, c.id + ' inverses').toBe(c.inverses.ok);
			}
			const comm = S.every((a) => S.every((b) => c.apply(a, b) === c.apply(b, a)));
			if (c.closure.ok && c.identity.ok && c.inverses.ok) expect(comm, c.id + ' abelian').toBe(c.abelian);
		}
	});
	it('the counterexamples quoted in the text are real', () => {
		const get = (id: string) => candidates.find((c) => c.id === id)!;
		expect(get('Z-').apply(get('Z-').apply(5, 3), 1)).toBe(1);
		expect(get('Z-').apply(5, get('Z-').apply(3, 1))).toBe(3);
		expect(get('odd+').inSet(get('odd+').apply(3, 5))).toBe(false);
		expect(get('Z6x').apply(2, 3)).toBe(0);
		expect([0, 1, 2, 3, 4, 5].map((x) => get('Z6x').apply(2, x))).not.toContain(1);
		expect(get('Z5x').apply(2, 3)).toBe(1);
		expect(get('Z5x').apply(4, 4)).toBe(1);
	});
});
