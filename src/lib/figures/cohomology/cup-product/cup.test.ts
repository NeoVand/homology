import { describe, expect, it } from 'vitest';
import { SimplicialComplex } from '$lib/math/complex';
import * as ex from '$lib/math/examples';
import {
	BIG_PRIME,
	bettiMod,
	cocycleBasis1,
	cup,
	cup11,
	cupForm,
	cupK,
	delta0,
	delta1,
	evaluate,
	fromSimplicial,
	fundamentalCycle,
	mod,
	orientTriangles,
	rankMod,
	signedMod,
	type Delta2
} from './cup';
import { arcCrossings, chord, fenceCochain, genus2Model, squareModel, torusLine, wrapToSquare, type Pt } from './flat';
import { wedgeDelta } from './spaces';

/** normalise −0 to 0 so that exact comparisons are about values only */
const z = (a: number[]) => a.map((x) => x || 0);

const rnd = (seed: number) => () => {
	seed = (seed * 1103515245 + 12345) % 2147483648;
	return (seed % 7) - 3;
};

/** α: vertical fence through column i0, co-oriented to the right (drawn going up). */
const alphaFence = (n: number, i0: number): Pt[][] => [
	[
		[(i0 + 0.5) / n, 0],
		[(i0 + 0.5) / n, 1]
	]
];
/** β: horizontal fence through row j0, co-oriented upwards (drawn going left). */
const betaFence = (n: number, j0: number): Pt[][] => [
	[
		[1, (j0 + 0.5) / n],
		[0, (j0 + 0.5) / n]
	]
];

describe('torus grid (translation-invariant ordering)', () => {
	for (const n of [3, 4, 5]) {
		const M = squareModel('torus', n);
		const D = M.D;
		it(`n=${n}: counts, Betti numbers and fundamental class`, () => {
			expect([D.nV, D.edges.length, D.tris.length]).toEqual([n * n, 3 * n * n, 2 * n * n]);
			expect(bettiMod(D, 2)).toEqual([1, 2, 1]);
			expect(bettiMod(D, BIG_PRIME)).toEqual([1, 2, 1]);
			const T = orientTriangles(D)!;
			expect(T).not.toBeNull();
			// the coherent orientation is the counterclockwise one of the picture: L = +1, U = −1
			expect(T).toEqual(M.triFlatSign);
			expect(T.filter((x) => x === 1).length).toBe(n * n);
		});
		it(`n=${n}: fences α, β are cocycles and α⌣β lives on one triangle`, () => {
			const T = orientTriangles(D)!;
			for (let i0 = 0; i0 < n; i0++)
				for (let j0 = 0; j0 < n; j0++) {
					const a = fenceCochain(M, alphaFence(n, i0));
					const b = fenceCochain(M, betaFence(n, j0));
					expect(delta1(D, a).every((x) => x === 0)).toBe(true);
					expect(delta1(D, b).every((x) => x === 0)).toBe(true);
					// α has 2n nonzero edges (n horizontal + n diagonal), all +1
					expect(a.filter((x) => x !== 0).length).toBe(2 * n);
					expect(a.every((x) => x === 0 || x === 1)).toBe(true);
					const ab = cup11(D, a, b);
					const ba = cup11(D, b, a);
					const L = 2 * (j0 * n + i0);
					expect(ab.map((x, t) => (x ? t : -1)).filter((t) => t >= 0)).toEqual([L]);
					expect(ab[L]).toBe(1);
					expect(ba.map((x, t) => (x ? t : -1)).filter((t) => t >= 0)).toEqual([L + 1]);
					expect(ba[L + 1]).toBe(1);
					expect(cup11(D, a, a).every((x) => x === 0)).toBe(true);
					expect(cup11(D, b, b).every((x) => x === 0)).toBe(true);
					expect(evaluate(ab, T)).toBe(1);
					expect(evaluate(ba, T)).toBe(-1);
				}
		});
	}
	it('moving a fence changes it by a coboundary', () => {
		const n = 4;
		const M = squareModel('torus', n);
		const D = M.D;
		const a0 = fenceCochain(M, alphaFence(n, 0));
		const a2 = fenceCochain(M, alphaFence(n, 2));
		// f = 1 on the vertices of columns 1 and 2 (between the two fences)
		const f = M.vertexPts.map((ps) => {
			const x = Math.round(ps[0][0] * n) % n;
			return x === 1 || x === 2 ? 1 : 0;
		});
		const diff = a0.map((x, e) => x - a2[e]);
		expect(delta0(D, f)).toEqual(diff);
	});
	it('pairing with the two loops: α(a) = 1, α(b) = 0, β(a) = 0, β(b) = 1', () => {
		const n = 3;
		const M = squareModel('torus', n);
		const D = M.D;
		const a = fenceCochain(M, alphaFence(n, 1));
		const b = fenceCochain(M, betaFence(n, 1));
		// loop a: the bottom row of horizontal edges, left to right; loop b: the left column, upwards
		const loopA = D.edges.map((_, e) => (M.edgeSegs[e].some((s) => s.a[1] === 0 && s.b[1] === 0 && s.b[0] > s.a[0]) ? 1 : 0));
		const loopB = D.edges.map((_, e) => (M.edgeSegs[e].some((s) => s.a[0] === 0 && s.b[0] === 0 && s.b[1] > s.a[1]) ? 1 : 0));
		expect(loopA.reduce((x, y) => x + y)).toBe(n);
		expect(loopB.reduce((x, y) => x + y)).toBe(n);
		expect([evaluate(a, loopA), evaluate(a, loopB), evaluate(b, loopA), evaluate(b, loopB)]).toEqual([1, 0, 0, 1]);
	});
});

describe('cup product = signed count of crossings (torus)', () => {
	const pairs: [number, number][] = [
		[1, 0],
		[0, 1],
		[1, 1],
		[1, -1],
		[2, 1],
		[1, 2],
		[3, 1],
		[-1, 2],
		[2, 3],
		[3, -2],
		[2, 0],
		[0, -1]
	];
	const M = squareModel('torus', 7);
	const D = M.D;
	const T = orientTriangles(D)!;
	it('for straight (p,q)-curves: ⟨PD F ⌣ PD G, [T]⟩ = Σ crossing signs = p₁q₂ − p₂q₁', () => {
		for (const [p1, q1] of pairs)
			for (const [p2, q2] of pairs) {
				const F = torusLine(p1, q1, 0.137, 0.291);
				const G = torusLine(p2, q2, 0.613, 0.457);
				const f = fenceCochain(M, F);
				const g = fenceCochain(M, G);
				expect(delta1(D, f).every((x) => x === 0)).toBe(true);
				const det = p1 * q2 - p2 * q1 || 0;
				const crossings = arcCrossings(F, G);
				expect(crossings.reduce((s, c) => s + c.sign, 0)).toBe(det);
				expect(evaluate(cup11(D, f, g), T)).toBe(det);
				if (det === 0 && p1 === p2 && q1 === q2) expect(crossings.length).toBe(0);
				expect(crossings.length).toBe(Math.abs(det));
			}
	});
	it('pairing: ⟨PD F, γ⟩ = γ · F for the loops a = (1,0) and b = (0,1)', () => {
		for (const [p, q] of pairs) {
			const f = fenceCochain(M, torusLine(p, q));
			const loopA = D.edges.map((_, e) => (M.edgeSegs[e].some((s) => s.a[1] === 0 && s.b[1] === 0 && s.b[0] > s.a[0]) ? 1 : 0));
			const loopB = D.edges.map((_, e) => (M.edgeSegs[e].some((s) => s.a[0] === 0 && s.b[0] === 0 && s.b[1] > s.a[1]) ? 1 : 0));
			// a·F = det[(1,0),(p,q)] = q ; b·F = det[(0,1),(p,q)] = −p
			expect(evaluate(f, loopA)).toBe(q);
			expect(evaluate(f, loopB)).toBe(-p || 0);
		}
	});
	it('a wiggly fence that doubles back still crosses a straight one +1 in total', () => {
		const snake = (A: number, B: number) => {
			const pts: Pt[] = [];
			for (let i = 0; i <= 400; i++) {
				const t = i / 400;
				pts.push([0.31 - B * Math.sin(4 * Math.PI * t), 0.07 + t + (A / (4 * Math.PI)) * Math.sin(4 * Math.PI * t)]);
			}
			return pts;
		};
		for (const A of [0, 0.5, 1.6, 2.4])
			for (const yb of [0.2, 0.43, 0.58, 0.81]) {
				const F = wrapToSquare(snake(A, 0.08 + 0.02 * A));
				const G: Pt[][] = [
					[
						[1, yb],
						[0, yb]
					]
				];
				const f = fenceCochain(M, F);
				const g = fenceCochain(M, G);
				expect(delta1(D, f).every((x) => x === 0)).toBe(true);
				const cr = arcCrossings(F, G);
				expect(cr.reduce((s, c) => s + c.sign, 0)).toBe(1);
				expect(evaluate(cup11(D, f, g), T)).toBe(1);
				if (A > 1.2) expect(cr.length).toBeGreaterThanOrEqual(1);
			}
	});
});

describe('Klein bottle and projective plane, mod 2', () => {
	it('Klein bottle: same mod-2 groups as the torus, cup form [[0,1],[1,1]]', () => {
		const M = squareModel('klein', 3);
		const D = M.D;
		expect(bettiMod(D, 2)).toEqual([1, 2, 1]);
		expect(bettiMod(D, BIG_PRIME)).toEqual([1, 1, 0]);
		expect(orientTriangles(D)).toBeNull();
		const K = fundamentalCycle(D, 'Z2')!;
		const alpha: Pt[][] = [
			[
				[0.45, 0],
				[0.45, 1]
			]
		];
		const alphaPush: Pt[][] = [
			[
				[0.55, 0],
				[0.55, 1]
			]
		];
		const beta: Pt[][] = [
			[
				[0, 0.42],
				[1, 0.58]
			]
		];
		const betaPush: Pt[][] = [
			[
				[0, 0.62],
				[1, 0.38]
			]
		];
		const a = fenceCochain(M, alpha, false);
		const b = fenceCochain(M, beta, false);
		const a2 = fenceCochain(M, alphaPush, false);
		const b2 = fenceCochain(M, betaPush, false);
		for (const c of [a, b, a2, b2]) expect(delta1(D, c).every((x) => mod(x, 2) === 0)).toBe(true);
		const q = (x: number[], y: number[]) => mod(evaluate(cup11(D, x, y), K), 2);
		expect([
			[q(a, a), q(a, b)],
			[q(b, a), q(b, b)]
		]).toEqual([
			[0, 1],
			[1, 1]
		]);
		expect(q(a, a2)).toBe(0);
		expect(q(b, b2)).toBe(1);
		expect(arcCrossings(alpha, alphaPush).length).toBe(0);
		expect(arcCrossings(beta, betaPush).length).toBe(1);
	});
	it('torus mod 2: cup form [[0,1],[1,0]]', () => {
		const M = squareModel('torus', 3);
		const D = M.D;
		const T2 = fundamentalCycle(D, 'Z2')!;
		const a = fenceCochain(M, alphaFence(3, 1), false);
		const b = fenceCochain(M, betaFence(3, 1), false);
		const q = (x: number[], y: number[]) => mod(evaluate(cup11(D, x, y), T2), 2);
		expect([
			[q(a, a), q(a, b)],
			[q(b, a), q(b, b)]
		]).toEqual([
			[0, 1],
			[1, 0]
		]);
	});
	it('projective plane: x⌣x ≠ 0 mod 2, and H¹ vanishes over a field of odd characteristic', () => {
		const M = squareModel('rp2', 3);
		const D = M.D;
		expect(bettiMod(D, 2)).toEqual([1, 1, 1]);
		expect(bettiMod(D, BIG_PRIME)).toEqual([1, 0, 0]);
		expect(orientTriangles(D)).toBeNull();
		const P = fundamentalCycle(D, 'Z2')!;
		const x: Pt[][] = [
			[
				[0, 0.4],
				[1, 0.6]
			]
		];
		const xPush: Pt[][] = [
			[
				[0, 0.57],
				[1, 0.43]
			]
		];
		const c = fenceCochain(M, x, false);
		const c2 = fenceCochain(M, xPush, false);
		expect(delta1(D, c).every((v) => mod(v, 2) === 0)).toBe(true);
		expect(mod(evaluate(cup11(D, c, c), P), 2)).toBe(1);
		expect(mod(evaluate(cup11(D, c, c2), P), 2)).toBe(1);
		expect(arcCrossings(x, xPush).length).toBe(1);
	});
});

describe('genus-2 octagon', () => {
	it('cup form is two hyperbolic blocks, matching the crossings', () => {
		const M = genus2Model();
		const D = M.D;
		expect([D.nV, D.edges.length, D.tris.length]).toEqual([2, 12, 8]);
		expect(bettiMod(D, BIG_PRIME)).toEqual([1, 4, 1]);
		expect(bettiMod(D, 2)).toEqual([1, 4, 1]);
		const S = orientTriangles(D)!;
		expect(S).not.toBeNull();
		// orient [Σ] counterclockwise in the picture
		const sgn = S[0] === M.triFlatSign[0] ? 1 : -1;
		const Sigma = S.map((x) => x * sgn);
		expect(Sigma).toEqual(M.triFlatSign);
		const fences = [chord(M, 2, 0.5), chord(M, 3, 0.5), chord(M, 6, 0.5), chord(M, 7, 0.5)].map((c) => [c]);
		const co = fences.map((F) => fenceCochain(M, F));
		for (const c of co) expect(delta1(D, c).every((x) => x === 0)).toBe(true);
		const Q = co.map((a) => co.map((b) => evaluate(cup11(D, a, b), Sigma)));
		const X = fences.map((F) => fences.map((G) => arcCrossings(F, G).reduce((s, c) => s + c.sign, 0)));
		for (let i = 0; i < 4; i++) {
			expect(Q[i][i]).toBe(0);
			for (let j = 0; j < 4; j++) {
				expect(Q[i][j]).toBe(-Q[j][i] || 0);
				if (i !== j) expect(Q[i][j]).toBe(X[i][j]);
			}
		}
		expect(Math.abs(Q[0][1])).toBe(1);
		expect(Math.abs(Q[2][3])).toBe(1);
		expect([Q[0][2], Q[0][3], Q[1][2], Q[1][3]]).toEqual([0, 0, 0, 0]);
	});
});

describe('S¹ ∨ S¹ ∨ S²: the same groups as the torus, but every product vanishes', () => {
	const D = wedgeDelta();
	it('Betti numbers 1, 2, 1', () => {
		expect(bettiMod(D, BIG_PRIME)).toEqual([1, 2, 1]);
		expect(bettiMod(D, 2)).toEqual([1, 2, 1]);
	});
	it('products of degree-1 classes are zero (any representatives)', () => {
		const S = orientTriangles(D)!;
		expect(S).not.toBeNull();
		for (const p of [2, BIG_PRIME]) {
			const reps = cocycleBasis1(D, p);
			expect(reps.length).toBe(2);
			const Q = cupForm(D, reps, S, p);
			expect(Q.flat().every((x) => x === 0)).toBe(true);
		}
		const e = (a: number, b: number) => D.edges.findIndex(([x, y]) => x === a && y === b);
		const alpha = D.edges.map((_, i) => (i === e(1, 2) ? 1 : 0));
		const beta = D.edges.map((_, i) => (i === e(3, 4) ? 1 : 0));
		for (const x of [alpha, beta]) expect(delta1(D, x).every((v) => v === 0)).toBe(true);
		for (const x of [alpha, beta]) for (const y of [alpha, beta]) expect(cup11(D, x, y).every((v) => v === 0)).toBe(true);
	});
});

describe('engine complexes (generic cocycle bases)', () => {
	const form = (D: Delta2, p: number, cycle: number[]) => cupForm(D, cocycleBasis1(D, p), cycle, p);
	it('tori: antisymmetric, nondegenerate over ℚ; alternating mod 2', () => {
		for (const K of [ex.torus7(), ex.torusGrid(3, 3), ex.torusGrid(4, 3)]) {
			const D = fromSimplicial(K);
			const T = orientTriangles(D)!;
			const Qp = form(D, BIG_PRIME, T);
			expect(Qp.length).toBe(2);
			expect(rankMod(Qp, BIG_PRIME)).toBe(2);
			for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) expect(mod(Qp[i][j] + Qp[j][i], BIG_PRIME)).toBe(0);
			const Q2 = form(D, 2, fundamentalCycle(D, 'Z2')!);
			expect(rankMod(Q2, 2)).toBe(2);
			expect(Q2[0][0] + Q2[1][1]).toBe(0);
		}
	});
	it('genus 2: rank-4 antisymmetric form over ℚ, alternating mod 2', () => {
		const D = fromSimplicial(ex.genus2());
		const S = orientTriangles(D)!;
		const Qp = form(D, BIG_PRIME, S);
		expect(Qp.length).toBe(4);
		expect(rankMod(Qp, BIG_PRIME)).toBe(4);
		for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) expect(signedMod(Qp[i][j] + Qp[j][i], BIG_PRIME)).toBe(0);
		const Q2 = form(D, 2, fundamentalCycle(D, 'Z2')!);
		expect(rankMod(Q2, 2)).toBe(4);
		expect(Q2.every((row, i) => row[i] === 0)).toBe(true);
	});
	it('Klein bottle (kleinGrid): two of the three nonzero mod-2 classes have nonzero square', () => {
		const D = fromSimplicial(ex.kleinGrid(3, 3));
		expect(orientTriangles(D)).toBeNull();
		const Q2 = form(D, 2, fundamentalCycle(D, 'Z2')!);
		expect(rankMod(Q2, 2)).toBe(2);
		const sq = (x: number[]) => mod(x[0] * x[0] * Q2[0][0] + x[1] * x[1] * Q2[1][1] + x[0] * x[1] * (Q2[0][1] + Q2[1][0]), 2);
		const squares = [
			[1, 0],
			[0, 1],
			[1, 1]
		].map(sq);
		expect(squares.filter((s) => s === 1).length).toBe(2);
	});
	it('projective plane (6 vertices): the square of the generator is nonzero mod 2', () => {
		const D = fromSimplicial(ex.projectivePlane6());
		const Q2 = form(D, 2, fundamentalCycle(D, 'Z2')!);
		expect(Q2).toEqual([[1]]);
		expect(cocycleBasis1(D, BIG_PRIME).length).toBe(0);
	});
	it('sphere: no degree-1 classes', () => {
		expect(cocycleBasis1(fromSimplicial(ex.sphereOcta()), 2).length).toBe(0);
	});
});

describe('algebraic laws', () => {
	const spaces: Delta2[] = [squareModel('torus', 3).D, squareModel('klein', 3).D, fromSimplicial(ex.projectivePlane6()), wedgeDelta()];
	it('Leibniz rule in degrees (0,0), (0,1), (1,0) on 2-complexes', () => {
		const r = rnd(7);
		for (const D of spaces) {
			for (let trial = 0; trial < 5; trial++) {
				const f = Array.from({ length: D.nV }, r);
				const g = Array.from({ length: D.nV }, r);
				const phi = D.edges.map(r);
				// δ(fg) = δf⌣g + f⌣δg
				const lhs0 = delta0(D, cup(D, 0, f, 0, g));
				const rhs0 = cup(D, 1, delta0(D, f), 0, g).map((x, i) => x + cup(D, 0, f, 1, delta0(D, g))[i]);
				expect(z(lhs0)).toEqual(z(rhs0));
				// δ(f⌣φ) = δf⌣φ + f⌣δφ
				const lhs1 = delta1(D, cup(D, 0, f, 1, phi));
				const rhs1 = cup(D, 1, delta0(D, f), 1, phi).map((x, i) => x + cup(D, 0, f, 2, delta1(D, phi))[i]);
				expect(z(lhs1)).toEqual(z(rhs1));
				// δ(φ⌣f) = δφ⌣f − φ⌣δf
				const lhs2 = delta1(D, cup(D, 1, phi, 0, f));
				const rhs2 = cup(D, 2, delta1(D, phi), 0, f).map((x, i) => x - cup(D, 1, phi, 1, delta0(D, f))[i]);
				expect(z(lhs2)).toEqual(z(rhs2));
			}
		}
	});
	it('Leibniz rule δ(φ⌣ψ) = δφ⌣ψ + (−1)^p φ⌣δψ in every degree (3- and 4-simplices, S³)', () => {
		const r = rnd(11);
		const S3 = new SimplicialComplex([
			[0, 1, 2, 3],
			[0, 1, 2, 4],
			[0, 1, 3, 4],
			[0, 2, 3, 4],
			[1, 2, 3, 4]
		]);
		for (const K of [new SimplicialComplex([[0, 1, 2, 3]]), new SimplicialComplex([[0, 1, 2, 3, 4]]), S3]) {
			for (let p = 0; p <= K.dim; p++)
				for (let q = 0; p + q + 1 <= K.dim; q++) {
					const phi = Array.from({ length: K.count(p) }, r);
					const psi = Array.from({ length: K.count(q) }, r);
					const lhs = K.coboundary(p + q, cupK(K, p, phi, q, psi));
					const a = cupK(K, p + 1, K.coboundary(p, phi), q, psi);
					const b = cupK(K, p, phi, q + 1, K.coboundary(q, psi));
					const sign = p % 2 === 0 ? 1 : -1;
					expect(z(lhs)).toEqual(z(a.map((x, i) => x + sign * b[i])));
				}
		}
	});
	it('associativity and the unit', () => {
		const r = rnd(3);
		const K = new SimplicialComplex([[0, 1, 2, 3, 4]]);
		for (const [p, q, s] of [
			[1, 1, 1],
			[0, 1, 2],
			[2, 1, 1],
			[1, 2, 0]
		]) {
			const a = Array.from({ length: K.count(p) }, r);
			const b = Array.from({ length: K.count(q) }, r);
			const c = Array.from({ length: K.count(s) }, r);
			expect(z(cupK(K, p + q, cupK(K, p, a, q, b), s, c))).toEqual(z(cupK(K, p, a, q + s, cupK(K, q, b, s, c))));
		}
		const one = Array.from({ length: K.count(0) }, () => 1);
		const phi = Array.from({ length: K.count(2) }, r);
		expect(cupK(K, 0, one, 2, phi)).toEqual(phi);
		expect(cupK(K, 2, phi, 0, one)).toEqual(phi);
	});
	it('graded commutativity holds for classes, not for cochains (torus)', () => {
		const M = squareModel('torus', 3);
		const D = M.D;
		const T = orientTriangles(D)!;
		const a = fenceCochain(M, alphaFence(3, 0));
		const b = fenceCochain(M, betaFence(3, 2));
		const ab = cup11(D, a, b);
		const ba = cup11(D, b, a);
		expect(ab.some((x, i) => x !== -ba[i])).toBe(true); // not antisymmetric as cochains
		expect(evaluate(ab, T) + evaluate(ba, T)).toBe(0); // but [α][β] = −[β][α]
	});
});
