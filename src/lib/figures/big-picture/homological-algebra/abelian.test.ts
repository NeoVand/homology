import { describe, expect, it } from 'vitest';
import {
	group,
	zero,
	equal,
	gcd,
	invariantFactors,
	tensorFG,
	torFG,
	homFG,
	extFG,
	tensor,
	tor,
	hom,
	ext,
	uctHomology,
	uctCohomology,
	kunneth,
	groupTeX,
	homologyOf,
	homologyWith,
	cohomologyWith,
	tensorComplex,
	chainsOf,
	spaces,
	Zc,
	Qc,
	Zn,
	type Coeff,
	type Group
} from './abelian';
import * as ex from '$lib/math/examples';

const Z = (r = 1) => group(r);
const C = (...orders: number[]) => group(0, orders);
const tex = (g: Group) => groupTeX(g);

describe('finitely generated abelian groups', () => {
	it('invariant factors', () => {
		expect(invariantFactors([2, 3])).toEqual([6]);
		expect(invariantFactors([2, 2])).toEqual([2, 2]);
		expect(invariantFactors([4, 6])).toEqual([2, 12]);
		expect(invariantFactors([1, 1, 5])).toEqual([5]);
	});
	it('TeX names', () => {
		expect(tex(group(2, [2]))).toBe('\\Z^{2} \\oplus \\Z/2');
		expect(tex(C(2, 2, 2))).toBe('(\\Z/2)^{3}');
		expect(tex(zero)).toBe('0');
		expect(tex(group(1, [], 'Q'))).toBe('\\Q');
	});
});

describe('tensor, Tor, Hom, Ext', () => {
	it('ℤ/m ⊗ ℤ/n = Tor(ℤ/m, ℤ/n) = Hom(ℤ/m, ℤ/n) = Ext(ℤ/m, ℤ/n) = ℤ/gcd(m, n)', () => {
		for (let m = 2; m <= 12; m++)
			for (let n = 2; n <= 12; n++) {
				const g = C(gcd(m, n));
				expect(equal(tensorFG(C(m), C(n)), g)).toBe(true);
				expect(equal(torFG(C(m), C(n)), g)).toBe(true);
				expect(equal(homFG(C(m), C(n)), g)).toBe(true);
				expect(equal(extFG(C(m), C(n)), g)).toBe(true);
			}
	});
	it('the book’s headline examples', () => {
		expect(tex(tensorFG(C(2), C(3)))).toBe('0'); // ℤ/2 ⊗ ℤ/3 = 0
		expect(tex(torFG(C(4), C(6)))).toBe('\\Z/2');
		expect(tex(homFG(C(5), Z()))).toBe('0'); // Hom(ℤ/n, ℤ) = 0
		expect(tex(extFG(C(5), Z()))).toBe('\\Z/5'); // Ext(ℤ/n, ℤ) = ℤ/n
		expect(tex(extFG(C(2), C(2)))).toBe('\\Z/2');
		expect(tex(extFG(Z(3), C(7)))).toBe('0'); // free groups have no Ext
		expect(tex(torFG(Z(2), C(7)))).toBe('0');
		expect(tex(homFG(Z(2), C(4)))).toBe('(\\Z/4)^{2}');
		expect(tex(tensorFG(group(1, [2]), C(2)))).toBe('(\\Z/2)^{2}');
	});
	it('rational coefficients kill torsion', () => {
		const A = group(2, [2, 4]);
		expect(tex(tensor(A, Qc))).toBe('\\Q^{2}');
		expect(tex(tor(A, Qc))).toBe('0');
		expect(tex(hom(A, Qc))).toBe('\\Q^{2}');
		expect(tex(ext(A, Qc))).toBe('0');
	});
});

describe('universal coefficient theorems', () => {
	const RP2: Group[] = [Z(), C(2), zero];
	const K: Group[] = [Z(), group(1, [2]), zero];
	it('ℝP²', () => {
		expect(uctHomology(RP2, Zn(2)).map((t) => tex(t.total))).toEqual(['\\Z/2', '\\Z/2', '\\Z/2']);
		expect(uctCohomology(RP2, Zc).map((t) => tex(t.total))).toEqual(['\\Z', '0', '\\Z/2']);
		expect(uctCohomology(RP2, Zn(2)).map((t) => tex(t.total))).toEqual(['\\Z/2', '\\Z/2', '\\Z/2']);
		expect(uctHomology(RP2, Zn(3)).map((t) => tex(t.total))).toEqual(['\\Z/3', '0', '0']);
		expect(uctHomology(RP2, Qc).map((t) => tex(t.total))).toEqual(['\\Q', '0', '0']);
	});
	it('Klein bottle', () => {
		expect(uctHomology(K, Zn(2)).map((t) => tex(t.total))).toEqual(['\\Z/2', '(\\Z/2)^{2}', '\\Z/2']);
		expect(uctCohomology(K, Zc).map((t) => tex(t.total))).toEqual(['\\Z', '\\Z', '\\Z/2']);
		expect(uctHomology(K, Zn(3)).map((t) => tex(t.total))).toEqual(['\\Z/3', '\\Z/3', '0']);
	});

	const coeffs: Coeff[] = [Zc, Zn(2), Zn(3), Zn(5), Qc];
	it('UCT agrees with direct computation on every cellular model', () => {
		for (const S of Object.values(spaces)) {
			const H = homologyOf(S.chains);
			for (const G of coeffs) {
				const uh = uctHomology(H, G).map((t) => t.total);
				const dh = homologyWith(S.chains, G);
				const uc = uctCohomology(H, G).map((t) => t.total);
				const dc = cohomologyWith(S.chains, G);
				uh.forEach((g, n) => expect(equal(g, dh[n]), `${S.id} H_${n}`).toBe(true));
				uc.forEach((g, n) => expect(equal(g, dc[n]), `${S.id} H^${n}`).toBe(true));
			}
		}
	});
	it('UCT agrees with direct computation on the simplicial models of the book', () => {
		const models = [ex.projectivePlane6(), ex.kleinGrid(3, 3), ex.torus7(), ex.sphereTetra(), ex.mobius5()];
		for (const Kx of models) {
			const Cx = chainsOf(Kx);
			const H = homologyOf(Cx);
			for (const G of coeffs) {
				const uh = uctHomology(H, G).map((t) => t.total);
				const dh = homologyWith(Cx, G);
				const uc = uctCohomology(H, G).map((t) => t.total);
				const dc = cohomologyWith(Cx, G);
				uh.forEach((g, n) => expect(equal(g, dh[n])).toBe(true));
				uc.forEach((g, n) => expect(equal(g, dc[n])).toBe(true));
			}
		}
	});
	it('cellular and simplicial models give the same integral homology', () => {
		expect(homologyOf(chainsOf(ex.projectivePlane6())).map(tex)).toEqual(homologyOf(spaces.RP2.chains).map(tex));
		expect(homologyOf(chainsOf(ex.kleinGrid(3, 3))).map(tex)).toEqual(homologyOf(spaces.K.chains).map(tex));
		expect(homologyOf(chainsOf(ex.torus7())).map(tex)).toEqual(homologyOf(spaces.T2.chains).map(tex));
	});
	it('the simplicial ℝP² really has a phantom mod-2 H₂', () => {
		const Cx = chainsOf(ex.projectivePlane6());
		expect(homologyWith(Cx, Zn(2)).map(tex)).toEqual(['\\Z/2', '\\Z/2', '\\Z/2']);
		expect(cohomologyWith(Cx, Zc).map(tex)).toEqual(['\\Z', '0', '\\Z/2']);
	});
});

describe('Künneth', () => {
	it('torus = circle × circle', () => {
		const S1 = homologyOf(spaces.S1.chains);
		expect(kunneth(S1, S1).map((t) => tex(t.total))).toEqual(['\\Z', '\\Z^{2}', '\\Z']);
		expect(homologyOf(tensorComplex(spaces.S1.chains, spaces.S1.chains)).map(tex)).toEqual(['\\Z', '\\Z^{2}', '\\Z']);
	});
	it('ℝP² × ℝP² has a Tor term in degree 3', () => {
		const H = homologyOf(spaces.RP2.chains);
		const k = kunneth(H, H);
		expect(k.map((t) => tex(t.total))).toEqual(['\\Z', '(\\Z/2)^{2}', '\\Z/2', '\\Z/2', '0']);
		expect(tex(k[3].torPart)).toBe('\\Z/2');
		expect(tex(k[3].tensorPart)).toBe('0');
	});
	it('the formula agrees with the homology of the product complex', () => {
		const ids = Object.keys(spaces);
		for (const a of ids)
			for (const b of ids) {
				const A = spaces[a].chains;
				const B = spaces[b].chains;
				const predicted = kunneth(homologyOf(A), homologyOf(B)).map((t) => tex(t.total));
				const direct = homologyOf(tensorComplex(A, B)).map(tex);
				expect(predicted, `${a} × ${b}`).toEqual(direct);
			}
	});
});
