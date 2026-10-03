import { describe, expect, it } from 'vitest';
import { SimplicialComplex } from '$lib/math/complex';
import { groupName } from '$lib/math/homology';
import { gallery, parseFacets, facetsText, autoLayout, summarize } from './calculator';

describe('parser', () => {
	it('reads the three notations', () => {
		expect(parseFacets('012, 34; [10,11,12]\n5').facets).toEqual([[10, 11, 12], [0, 1, 2], [3, 4], [5]]);
		expect(parseFacets('10 11 12, 0 1').facets).toEqual([
			[10, 11, 12],
			[0, 1]
		]);
		expect(parseFacets('0x1').error).toBeTruthy();
		expect(parseFacets('011').error).toBeTruthy();
		expect(parseFacets('01234').error).toBeTruthy();
		expect(parseFacets('').error).toBeTruthy();
	});
	it('round-trips through facetsText', () => {
		for (const g of gallery) {
			const K = g.make().K;
			const again = new SimplicialComplex(parseFacets(facetsText(K)).facets);
			expect(again.fVector).toEqual(K.fVector);
		}
	});
});

describe('the suggested experiments', () => {
	const H = (txt: string) => summarize(new SimplicialComplex(parseFacets(txt).facets)).Z.map((g) => groupName(g));
	it('three faces of a tetrahedron, then the fourth', () => {
		expect(H('012, 023, 013')).toEqual(['ℤ', '0', '0']);
		expect(H('012, 023, 013, 123')).toEqual(['ℤ', '0', 'ℤ']);
	});
	it('Möbius band, then coned off: the projective plane', () => {
		expect(H('012, 123, 234, 340, 401')).toEqual(['ℤ', 'ℤ', '0']);
		expect(H('012, 123, 234, 340, 401, 025, 135, 245, 035, 145')).toEqual(['ℤ', 'ℤ/2', '0']);
	});
});

describe('gallery summaries', () => {
	const want: Record<string, string[]> = {
		point: ['ℤ'],
		circle: ['ℤ', 'ℤ'],
		disk: ['ℤ', '0', '0'],
		'figure-eight': ['ℤ', 'ℤ²'],
		sphere: ['ℤ', '0', 'ℤ'],
		torus: ['ℤ', 'ℤ²', 'ℤ'],
		klein: ['ℤ', 'ℤ ⊕ ℤ/2', '0'],
		rp2: ['ℤ', 'ℤ/2', '0'],
		mobius: ['ℤ', 'ℤ', '0'],
		genus2: ['ℤ', 'ℤ⁴', 'ℤ'],
		ball: ['ℤ', '0', '0', '0'],
		wrap3: ['ℤ', 'ℤ/3', '0']
	};
	for (const g of gallery)
		it(g.id, () => {
			const ex = g.make();
			const pref = ex.cycles?.filter((c) => c.k === 1).map((c) => c.chain.flatMap((x, i) => (x ? [i] : []))) ?? [];
			const S = summarize(ex.K, pref);
			expect(S.Z.map((z) => groupName(z))).toEqual(want[g.id]);
			// the mod-2 generators really are as many as the mod-2 Betti numbers
			S.gens.forEach((list, k) => k > 0 && expect(list.length).toBe(S.Z2[k]));
			expect(S.chi).toBe(S.f.reduce((a, n, k) => a + (k % 2 ? -n : n), 0));
		});
	it('orientability flags', () => {
		const flag = (id: string) => summarize(gallery.find((g) => g.id === id)!.make().K).orientable;
		expect(flag('torus')).toBe(true);
		expect(flag('sphere')).toBe(true);
		expect(flag('genus2')).toBe(true);
		expect(flag('klein')).toBe(false);
		expect(flag('rp2')).toBe(false);
		expect(flag('mobius')).toBe(null);
	});
	it('invariant factors of the Klein bottle and ℝP²', () => {
		const inv = (id: string) => summarize(gallery.find((g) => g.id === id)!.make().K).invariant;
		expect(inv('klein')).toEqual([
			{ ones: 8, others: [] },
			{ ones: 17, others: [2] }
		]);
		expect(inv('rp2')).toEqual([
			{ ones: 5, others: [] },
			{ ones: 9, others: [2] }
		]);
	});
});

describe('auto layout', () => {
	it('places every simplex of a typed complex', () => {
		const K = new SimplicialComplex(parseFacets('012, 123, 234, 340, 401, 56').facets);
		const L = autoLayout(K);
		expect(new Set(L.tris.map((t) => t.t)).size).toBe(K.count(2));
		expect(new Set(L.edges.map((e) => e.e)).size).toBe(K.count(1));
		expect(L.verts.length).toBe(K.count(0));
		expect(L.verts.every((v) => Number.isFinite(v.p[0]) && Number.isFinite(v.p[1]))).toBe(true);
	});
});
