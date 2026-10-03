import { describe, expect, it } from 'vitest';
import { SimplicialComplex } from '$lib/math/complex';
import { homology, groupName, type HomologyGroup } from '$lib/math/homology';
import { smith } from '$lib/math/linalg';
import * as ex from '$lib/math/examples';
import { gridSurface } from '$lib/math/examples';
import { chainComplexHomology, identifySurface, kerCoker, ladder, ladderHomology, parseWord, polygonComplex, polygonHomology, wordTeX } from './cellular';

const names = (H: HomologyGroup[]) => H.map((g) => groupName(g));
const word = (s: string) => {
	const r = parseWord(s);
	if (r.error) throw new Error(r.error);
	return polygonComplex(r.letters);
};

describe('parsing edge words', () => {
	it('accepts the usual spellings of inverses and subscripts', () => {
		const a = parseWord('aba^-1b^-1').letters;
		const b = parseWord("a b a' b'").letters;
		const c = parseWord('aba⁻¹b⁻¹').letters;
		const d = parseWord('abAB').letters;
		const e = parseWord('a^{-1}').letters;
		expect(a).toEqual(b);
		expect(a).toEqual(c);
		expect(a).toEqual(d);
		expect(e).toEqual([{ name: 'a', exp: -1 }]);
		expect(parseWord('a₁b₁a₁⁻¹b₁⁻¹').letters).toEqual(parseWord('a1 b1 a1^-1 b1^-1').letters);
		expect(parseWord('a_2').letters[0].name).toBe('a2');
		expect(wordTeX(parseWord('a1b1a1^-1').letters)).toBe('a_{1}b_{1}a_{1}^{-1}');
	});
	it('reports errors', () => {
		expect(parseWord('').error).toBeTruthy();
		expect(parseWord('a+b').error).toBeTruthy();
	});
});

describe('cellular homology of polygon words', () => {
	it('closed surfaces', () => {
		expect(names(polygonHomology(word('aba^-1b^-1')))).toEqual(['ℤ', 'ℤ²', 'ℤ']);
		expect(names(polygonHomology(word('abab^-1')))).toEqual(['ℤ', 'ℤ ⊕ ℤ/2', '0']);
		expect(names(polygonHomology(word('aabb')))).toEqual(['ℤ', 'ℤ ⊕ ℤ/2', '0']);
		expect(names(polygonHomology(word('aa')))).toEqual(['ℤ', 'ℤ/2', '0']);
		expect(names(polygonHomology(word('abab')))).toEqual(['ℤ', 'ℤ/2', '0']);
		expect(names(polygonHomology(word('abcabc')))).toEqual(['ℤ', 'ℤ/2', '0']);
		expect(names(polygonHomology(word('aa^-1')))).toEqual(['ℤ', '0', 'ℤ']);
		expect(names(polygonHomology(word('abb^-1a^-1')))).toEqual(['ℤ', '0', 'ℤ']);
		expect(names(polygonHomology(word('a1b1a1^-1b1^-1a2b2a2^-1b2^-1')))).toEqual(['ℤ', 'ℤ⁴', 'ℤ']);
		expect(names(polygonHomology(word('aabbcc')))).toEqual(['ℤ', 'ℤ² ⊕ ℤ/2', '0']);
	});
	it('vertex classes: the projective-plane square abab has two corners classes, the torus one', () => {
		expect(word('abab').nVertices).toBe(2);
		expect(word('aba^-1b^-1').nVertices).toBe(1);
		expect(word('aa^-1').nVertices).toBe(2);
		expect(word('abcabc').nVertices).toBe(3);
	});
	it('exponent sums give ∂₂', () => {
		expect(word('abab^-1').d2).toEqual([[2], [0]]);
		expect(word('aa').d2).toEqual([[2]]);
		expect(word('aba^-1b^-1').d2).toEqual([[0], [0]]);
	});
	it('spaces with free edges and the dunce cap', () => {
		expect(names(polygonHomology(word('a')))).toEqual(['ℤ', '0', '0']); // a disk
		expect(names(polygonHomology(word('abc')))).toEqual(['ℤ', '0', '0']); // a disk
		expect(names(polygonHomology(word('aaa^-1')))).toEqual(['ℤ', '0', '0']); // dunce cap
		expect(names(polygonHomology(word('aaa')))).toEqual(['ℤ', 'ℤ/3', '0']); // pseudo-projective plane
		// Möbius band: square, left and right sides glued with a flip, top and bottom free
		expect(names(polygonHomology(word('abcb')))).toEqual(['ℤ', 'ℤ', '0']);
		// cylinder
		expect(names(polygonHomology(word('abcb^-1')))).toEqual(['ℤ', 'ℤ', '0']);
	});
	it('surface identification', () => {
		expect(identifySurface(word('aba^-1b^-1')).name).toBe('the torus');
		expect(identifySurface(word('abab^-1')).name).toBe('the Klein bottle');
		expect(identifySurface(word('aa')).name).toBe('the projective plane');
		expect(identifySurface(word('aa^-1')).name).toBe('the sphere');
		expect(identifySurface(word('a1b1a1^-1b1^-1a2b2a2^-1b2^-1')).tex).toBe('\\Sigma_{2}');
		expect(identifySurface(word('aabbcc')).tex).toBe('N_{3}');
		expect(identifySurface(word('abc')).closed).toBe(false);
	});
	it('agrees with simplicial homology of triangulations of the same surfaces', () => {
		const same = (w: string, K: SimplicialComplex) => expect(names(polygonHomology(word(w)))).toEqual(names(homology(K)));
		same('aba^-1b^-1', ex.torus7());
		same('abab^-1', ex.kleinGrid(3, 3));
		same('aa', ex.projectivePlane6());
		same('aa^-1', ex.sphereOcta());
		same('a1b1a1^-1b1^-1a2b2a2^-1b2^-1', ex.genus2());
		same('abcb', ex.mobius5());
	});
});

describe('cell ladders', () => {
	it('ℝPⁿ: H_k = ℤ (k = 0, or k = n odd), ℤ/2 (k odd < n), 0 otherwise', () => {
		for (let n = 1; n <= 8; n++) {
			const H = ladderHomology(ladder('RP', n));
			H.forEach((g, k) => {
				const expected = k === 0 || (k === n && n % 2 === 1) ? 'ℤ' : k % 2 === 1 && k < n ? 'ℤ/2' : '0';
				expect(groupName(g)).toBe(expected);
			});
			// mod 2: every degree is ℤ/2
			expect(ladderHomology(ladder('RP', n), true).every((g) => g.rank === 1)).toBe(true);
		}
		// RP² agrees with the 6-vertex triangulation
		expect(names(ladderHomology(ladder('RP', 2)))).toEqual(names(homology(ex.projectivePlane6())));
		expect(names(ladderHomology(ladder('RP', 3)))).toEqual(['ℤ', 'ℤ/2', '0', 'ℤ']);
	});
	it('ℂPⁿ and Sⁿ', () => {
		expect(names(ladderHomology(ladder('CP', 2)))).toEqual(['ℤ', '0', 'ℤ', '0', 'ℤ']);
		expect(names(ladderHomology(ladder('S', 1)))).toEqual(['ℤ', 'ℤ']);
		expect(names(ladderHomology(ladder('S', 3)))).toEqual(['ℤ', '0', '0', 'ℤ']);
		expect(names(ladderHomology(ladder('S', 3)))).toEqual(names(homology(new SimplicialComplex([[0, 1, 2, 3], [0, 1, 2, 4], [0, 1, 3, 4], [0, 2, 3, 4], [1, 2, 3, 4]]))));
	});
	it('chain complex homology of 0 → ℤ →×2 ℤ → 0', () => {
		expect(names(chainComplexHomology([1, 1], [null, [[2]]]))).toEqual(['ℤ/2', '0']);
	});
});

// ── Mayer–Vietoris on honest subcomplexes ─────────────────────────────────

/** H₁ coefficient m with c ~ m·z in H₁(A; ℚ) (A has H₁ ≅ ℤ, generated by z). */
function coefficientIn(A: SimplicialComplex, c: [number[], number][], z: [number[], number][]): number {
	const vec = (ch: [number[], number][]) => {
		const v = new Array<number>(A.count(1)).fill(0);
		for (const [s, x] of ch) {
			const i = A.indexOf(s);
			if (i < 0) throw new Error('edge not in A: ' + s);
			v[i] += (s[0] < s[1] ? 1 : -1) * x;
		}
		return v;
	};
	const cv = vec(c);
	const zv = vec(z);
	const B = A.boundaryMatrix(2);
	const rB = smith(B).rank;
	for (let m = -4; m <= 4; m++) {
		const d = cv.map((x, i) => x - m * zv[i]);
		const aug = B.map((row, i) => [...row, d[i]]);
		if (smith(aug).rank === rB) return m;
	}
	throw new Error('no small coefficient');
}

/** a closed walk through the given vertices, as oriented edges */
const walk = (vs: number[]): [number[], number][] => vs.map((v, i) => [[v, vs[(i + 1) % vs.length]], 1]);

describe('Mayer–Vietoris, checked on subcomplexes', () => {
	const chi = (K: SimplicialComplex) => K.eulerCharacteristic();
	it('circle from two arcs', () => {
		const X = ex.circle(6);
		const U = X.induced((v) => [0, 1, 2, 3].includes(v));
		const V = X.induced((v) => [3, 4, 5, 0].includes(v));
		const W = X.induced((v) => v === 0 || v === 3);
		expect(names(homology(U))).toEqual(['ℤ', '0']);
		expect(names(homology(V))).toEqual(['ℤ', '0']);
		expect(names(homology(W))).toEqual(['ℤ²']);
		expect(names(homology(X))).toEqual(['ℤ', 'ℤ']);
		// Φ₀ : ℤ² → ℤ², (x, y) ↦ (x + y, −x − y) has kernel ℤ, which is H₁(S¹)
		expect(kerCoker([[1, 1], [-1, -1]], 2, 2).kerRank).toBe(1);
		expect(chi(X)).toBe(chi(U) + chi(V) - chi(W));
	});
	it('sphere from two caps', () => {
		const X = ex.sphereOcta();
		const U = X.induced((v) => v !== 3);
		const V = X.induced((v) => v !== 2);
		const W = X.induced((v) => v !== 2 && v !== 3);
		expect(names(homology(U))).toEqual(['ℤ', '0', '0']);
		expect(names(homology(V))).toEqual(['ℤ', '0', '0']);
		expect(names(homology(W))).toEqual(['ℤ', 'ℤ']);
		expect(chi(X)).toBe(chi(U) + chi(V) - chi(W));
	});
	const strips = (kind: 'torus' | 'klein', n = 4) => {
		const g = gridSurface(kind, n, 4);
		const K = g.complex;
		const row = (v: number) => g.vertexGrid[v][1];
		const U = K.induced((v) => [1, 2, 3].includes(row(v)));
		const V = K.induced((v) => [3, 0, 1].includes(row(v)));
		const W = K.induced((v) => [1, 3].includes(row(v)));
		const vid = (i: number, j: number) => g.vertexGrid.findIndex(([a, b]) => a === i && b === j);
		return { g, K, U, V, W, vid, n };
	};
	it('torus from two cylinders: overlap is two circles; Φ₁(x, y) = (x + y, −x − y)', () => {
		const { K, U, V, W, vid, n } = strips('torus');
		expect(K.simplices[2].length).toBe(U.simplices[2].length + V.simplices[2].length);
		expect(names(homology(U))).toEqual(['ℤ', 'ℤ', '0']);
		expect(names(homology(V))).toEqual(['ℤ', 'ℤ', '0']);
		expect(names(homology(W))).toEqual(['ℤ²', 'ℤ²']);
		expect(names(homology(K))).toEqual(['ℤ', 'ℤ²', 'ℤ']);
		const row = (j: number) => Array.from({ length: n }, (_, i) => vid(i, j));
		// each overlap circle is homologous to the core of each cylinder, once
		expect(Math.abs(coefficientIn(U, walk(row(1)), walk(row(2))))).toBe(1);
		expect(Math.abs(coefficientIn(U, walk(row(3)), walk(row(2))))).toBe(1);
		const k = kerCoker([[1, 1], [-1, -1]], 2, 2);
		expect(k.kerRank).toBe(1); // H₂(T) ≅ ℤ
		expect(groupName(k.coker)).toBe('ℤ'); // coker Φ₁ ≅ ℤ, and ker Φ₀ ≅ ℤ: H₁(T) ≅ ℤ²
		expect(chi(K)).toBe(chi(U) + chi(V) - chi(W));
	});
	it('Klein bottle from two Möbius bands: overlap is one circle that wraps twice (1 ↦ 2)', () => {
		const { K, U, V, W, vid, n } = strips('klein');
		expect(K.simplices[2].length).toBe(U.simplices[2].length + V.simplices[2].length);
		expect(names(homology(U))).toEqual(['ℤ', 'ℤ', '0']);
		expect(names(homology(V))).toEqual(['ℤ', 'ℤ', '0']);
		expect(names(homology(W))).toEqual(['ℤ', 'ℤ']);
		expect(names(homology(K))).toEqual(['ℤ', 'ℤ ⊕ ℤ/2', '0']);
		// the overlap circle: along row 1, across the twisted seam into row 3, and back
		const overlap = [...Array.from({ length: n }, (_, i) => vid(i, 1)), ...Array.from({ length: n }, (_, i) => vid(i, 3))];
		const coreU = Array.from({ length: n }, (_, i) => vid(i, 2));
		const coreV = Array.from({ length: n }, (_, i) => vid(i, 0));
		expect(Math.abs(coefficientIn(U, walk(overlap), walk(coreU)))).toBe(2);
		expect(Math.abs(coefficientIn(V, walk(overlap), walk(coreV)))).toBe(2);
		// Φ₁ = (2, −2): injective, cokernel ℤ ⊕ ℤ/2
		const k = kerCoker([[2], [-2]], 2, 1);
		expect(k.kerRank).toBe(0);
		expect(groupName(k.coker)).toBe('ℤ ⊕ ℤ/2');
		expect(chi(K)).toBe(chi(U) + chi(V) - chi(W));
	});
});
