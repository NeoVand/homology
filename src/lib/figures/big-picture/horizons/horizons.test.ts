import { describe, expect, it } from 'vitest';
import { SimplicialComplex } from '$lib/math/complex';
import { hodgeDecompose } from '$lib/math/hodge';
import { homology } from '$lib/math/homology';
import { noisyCircle } from '$lib/math/persistence';
import { annulus, twoHoles } from './complexes';
import { hodgeRank } from './hodgerank';
import { fibrePoint4, fibrePolyline, hopfMap, basePoint, linkingNumber } from './hopf';
import { ripsComplex, betti, generatingCocycle, circularCoordinate, loopData, goodScale } from './circular';

const close = (a: number[], b: number[], eps = 1e-6) => a.every((x, i) => Math.abs(x - b[i]) < eps);
const sq = (v: number[]) => v.reduce((s, x) => s + x * x, 0);

describe('Hodge decomposition (research report §4.3–4.4, recomputed)', () => {
	it('edge flow (3,3,3,2,−2) splits into gradient + curl + harmonic with 35 = 8 + 3 + 24', () => {
		// vertices 1..4 → 0..3; triangle {1,2,3} filled; {1,3,4} left open (a hole)
		const K = new SimplicialComplex([[0, 1, 2], [2, 3], [0, 3]]);
		// engine edge order: [0,1], [0,2], [0,3], [1,2], [2,3]
		const f = [3, 3, -2, 3, 2];
		const h = hodgeDecompose(K, f);
		expect(close(h.gradient, [1, 2, 1, 1, -1])).toBe(true);
		expect(close(h.curl, [1, -1, 0, 1, 0])).toBe(true);
		expect(close(h.harmonic, [1, 2, -3, 1, 3])).toBe(true);
		expect(sq(f)).toBe(35);
		expect(sq(h.gradient)).toBeCloseTo(8);
		expect(sq(h.curl)).toBeCloseTo(3);
		expect(sq(h.harmonic)).toBeCloseTo(24);
		// the potential, up to a constant, is (0, 1, 2, 1)
		const s = h.potential.map((x) => x - h.potential[0]);
		expect(close(s, [0, 1, 2, 1])).toBe(true);
	});
	it('the annulus fence cocycle has harmonic representative 1/3, −1/6, +1/6', () => {
		// a0,a1,a2 = 0,1,2 inner; b0,b1,b2 = 3,4,5 outer
		const K = new SimplicialComplex([
			[0, 1, 4],
			[1, 2, 5],
			[0, 2, 3],
			[0, 3, 4],
			[1, 4, 5],
			[2, 3, 5]
		]);
		const psi = new Array(K.count(1)).fill(0);
		for (const e of [[0, 1], [0, 4], [3, 4]]) psi[K.indexOf(e)] = 1;
		expect(K.coboundary(1, psi).every((x) => x === 0)).toBe(true);
		const h = hodgeDecompose(K, psi).harmonic;
		const want = (e: number[], v: number) => expect(h[K.indexOf(e)]).toBeCloseTo(v, 9);
		want([0, 1], 1 / 3);
		want([1, 2], 1 / 3);
		want([0, 2], -1 / 3);
		want([3, 4], 1 / 3);
		want([4, 5], 1 / 3);
		want([3, 5], -1 / 3);
		for (const e of [[0, 3], [1, 4], [2, 5]]) want(e, -1 / 6);
		for (const e of [[0, 4], [1, 5], [2, 3]]) want(e, 1 / 6);
	});
	it('the harmonic space has dimension b₁ on the figure complexes', () => {
		for (const [P, b1] of [
			[annulus(10), 1],
			[twoHoles(), 2]
		] as const) {
			expect(homology(P.K, 'Q').map((g) => g.rank)).toEqual([1, b1, 0]);
			// harmonic parts of random flows span a b₁-dimensional space
			const rows: number[][] = [];
			for (let k = 0; k < 6; k++) {
				const f = Array.from({ length: P.K.count(1) }, (_, i) => Math.sin(13.1 * i * (k + 1) + k));
				rows.push(hodgeDecompose(P.K, f).harmonic);
			}
			expect(numericRank(rows)).toBe(b1);
		}
	});
});

function numericRank(rows: number[][]): number {
	const A = rows.map((r) => r.slice());
	let rank = 0;
	const n = A[0].length;
	for (let c = 0; c < n && rank < A.length; c++) {
		let best = rank;
		for (let r = rank + 1; r < A.length; r++) if (Math.abs(A[r][c]) > Math.abs(A[best][c])) best = r;
		if (Math.abs(A[best][c]) < 1e-7) continue;
		[A[rank], A[best]] = [A[best], A[rank]];
		for (let r = 0; r < A.length; r++) {
			if (r === rank) continue;
			const f = A[r][c] / A[rank][c];
			for (let j = 0; j < n; j++) A[r][j] -= f * A[rank][j];
		}
		rank++;
	}
	return rank;
}

describe('HodgeRank', () => {
	it('a perfectly consistent season is all gradient, and recovers the strengths', () => {
		const strength = [3, 1, 0, -2, 2];
		const pairs = [[0, 1], [1, 2], [0, 2], [2, 3], [3, 4], [0, 4]];
		const games = pairs.map(([a, b]) => ({ a, b, sa: 10 + strength[a], sb: 10 + strength[b] }));
		const R = hodgeRank(5, games);
		const mean = strength.reduce((x, y) => x + y) / 5;
		expect(close(R.ratings, strength.map((s) => s - mean))).toBe(true);
		expect(R.energy.curl + R.energy.harmonic).toBeLessThan(1e-9);
	});
	it('rock–paper–scissors is pure curl; a cycle around an unfilled square is pure harmonic', () => {
		const rps = hodgeRank(3, [
			{ a: 0, b: 1, sa: 1, sb: 0 },
			{ a: 1, b: 2, sa: 1, sb: 0 },
			{ a: 2, b: 0, sa: 1, sb: 0 }
		]);
		expect(rps.energy.curl).toBeCloseTo(rps.energy.total);
		const ring = hodgeRank(4, [
			{ a: 0, b: 1, sa: 1, sb: 0 },
			{ a: 1, b: 2, sa: 1, sb: 0 },
			{ a: 2, b: 3, sa: 1, sb: 0 },
			{ a: 3, b: 0, sa: 1, sb: 0 }
		]);
		expect(ring.energy.harmonic).toBeCloseTo(ring.energy.total);
	});
});

describe('Hopf fibration', () => {
	it('every point of a fibre maps to the same point of S²', () => {
		for (const [theta, phi] of [
			[0.4, 1.1],
			[1.3, -2],
			[2.2, 0.5]
		]) {
			const b = basePoint(theta, phi);
			for (let k = 0; k < 12; k++) {
				const q = fibrePoint4(theta, phi, (k / 12) * 2 * Math.PI);
				expect(Math.hypot(...q)).toBeCloseTo(1, 12);
				expect(close(hopfMap(q), b, 1e-12)).toBe(true);
			}
		}
	});
	it('any two fibres are linked exactly once', () => {
		const A = fibrePolyline(0.5, 0.3, 240);
		const B = fibrePolyline(1.4, 2.1, 240);
		const C = fibrePolyline(1.9, -1.2, 240);
		expect(Math.abs(linkingNumber(A, B))).toBeCloseTo(1, 2);
		expect(Math.abs(linkingNumber(A, C))).toBeCloseTo(1, 2);
		expect(Math.abs(linkingNumber(B, C))).toBeCloseTo(1, 2);
	});
});

describe('circular coordinates', () => {
	it('a noisy circle gets a coordinate that winds exactly once', () => {
		const pts = noisyCircle(48, 1, 0.06, 17);
		const K = ripsComplex(pts, 0.22);
		expect(betti(K)).toEqual([1, 1]);
		const alpha = generatingCocycle(K)!;
		expect(alpha).not.toBeNull();
		const { theta, bar } = circularCoordinate(K, alpha);
		// ᾱ is divergence-free (δᵀ ᾱ = 0) and still a cocycle
		const div = K.boundary(1, bar);
		expect(Math.max(...div.map(Math.abs))).toBeLessThan(1e-6);
		// walk around the circle in angular order: θ changes by a total of ±1
		const order = pts.map((p, i) => ({ i, a: Math.atan2(p[1], p[0]) })).sort((x, y) => x.a - y.a);
		let total = 0;
		for (let k = 0; k < order.length; k++) {
			const d = theta[order[(k + 1) % order.length].i] - theta[order[k].i];
			total += d - Math.round(d);
		}
		expect(Math.abs(total)).toBeCloseTo(1, 6);
	});
	it('the figure picks a scale with exactly one loop, for several data sets', () => {
		for (const seed of [17, 18, 19, 20, 21]) {
			const pts = loopData(seed);
			const r = goodScale(pts);
			expect(r).not.toBeNull();
			const K = ripsComplex(pts, r!);
			expect(betti(K)).toEqual([1, 1]);
			const { theta } = circularCoordinate(K, generatingCocycle(K)!);
			const order = pts.map((p, i) => ({ i, a: Math.atan2(p[1], p[0]) })).sort((x, y) => x.a - y.a);
			let total = 0;
			for (let k = 0; k < order.length; k++) {
				const d = theta[order[(k + 1) % order.length].i] - theta[order[k].i];
				total += d - Math.round(d);
			}
			expect(Math.abs(total)).toBeCloseTo(1, 6);
		}
	});
	it('different spanning trees give the same coordinate up to rotation', () => {
		const pts = noisyCircle(40, 1, 0.05, 3);
		const K = ripsComplex(pts, 0.25);
		const t1 = circularCoordinate(K, generatingCocycle(K, 0)!).theta;
		const t2 = circularCoordinate(K, generatingCocycle(K, 17)!).theta;
		// θ₂ − θ₁ is constant mod 1 (or θ₂ + θ₁ if the generator flipped sign)
		const diffs = t1.map((x, i) => (((t2[i] - x) % 1) + 1) % 1);
		const sums = t1.map((x, i) => (((t2[i] + x) % 1) + 1) % 1);
		const spread = (v: number[]) => {
			const c = v[0];
			return Math.max(...v.map((x) => Math.abs(x - c - Math.round(x - c))));
		};
		expect(Math.min(spread(diffs), spread(sums))).toBeLessThan(1e-6);
	});
});
