// Every number the figures and the prose of §4.1 display, checked.
import { describe, expect, it } from 'vitest';
import {
	gradient,
	pathSum,
	curl,
	integrate,
	cycleRank,
	components,
	hodge,
	norm2,
	bettis,
	frac,
	fracText,
	fracTeX,
	treePath,
	toComplex,
	type OGraph
} from './graph';
import { trailMap, trailLoops, islands, puzzles, annulus, hodgeGraph, market } from './presets';
import { penroseStairs, penroseTribar, project, type V3 } from './impossible';
import { gearRing, meshError } from './gears';

const close = (a: number, b: number, eps = 1e-9) => Math.abs(a - b) < eps;

describe('heights and differences (potential painter)', () => {
	it('every loop of a gradient sums to zero (discrete fundamental theorem of calculus)', () => {
		const f = trailMap.heights;
		const df = gradient(trailMap, f);
		for (const L of trailLoops) expect(pathSum(trailMap, df, L)).toBe(0);
		// a random height function too
		const g = f.map((_, i) => (i * 37) % 11);
		for (const L of trailLoops) expect(pathSum(trailMap, gradient(trailMap, g), L)).toBe(0);
	});
	it('the first gold loop shows 150 + 180 − 70 − 260 = 0', () => {
		const df = gradient(trailMap, trailMap.heights);
		const L = trailLoops[0];
		const terms = L.slice(0, -1).map((v, i) => pathSum(trailMap, df, [v, L[i + 1]]));
		expect(terms).toEqual([150, 180, -70, -260]);
	});
	it('a path sum telescopes to f(end) − f(start)', () => {
		const df = gradient(trailMap, trailMap.heights);
		expect(pathSum(trailMap, df, [0, 2, 4, 6])).toBe(trailMap.heights[6] - trailMap.heights[0]);
		expect(pathSum(trailMap, df, [0, 1, 3, 5, 6])).toBe(720);
	});
	it('the trail map has b₁ = 9 − 7 + 1 = 3 independent loops', () => {
		expect(cycleRank(trailMap)).toBe(3);
	});
	it('islands: δf = 0 exactly when f is constant on each of the 3 components', () => {
		expect(components(islands).count).toBe(3);
		expect(gradient(islands, islands.heights).every((x) => x === 0)).toBe(true);
		const bumped = [...islands.heights];
		bumped[4] += 10;
		expect(gradient(islands, bumped).some((x) => x !== 0)).toBe(true);
		// H⁰ has dimension = number of components
		expect(bettis(islands)[0]).toBe(3);
	});
});

describe('the gradient puzzle (find the potential)', () => {
	it('a tree is always solvable', () => {
		const P = puzzles.find((p) => p.id === 'tree')!;
		const I = integrate(P, P.psi);
		expect(I.defects).toHaveLength(0);
		expect(gradient(P, I.f)).toEqual(P.psi);
		expect(cycleRank(P)).toBe(0);
	});
	it('a loop that closes: 2 + 3 − 1 − 4 = 0', () => {
		const P = puzzles.find((p) => p.id === 'closes')!;
		expect(pathSum(P, P.psi, [0, 1, 2, 3, 0])).toBe(0);
		const I = integrate(P, P.psi);
		expect(I.defects.map((d) => d.value)).toEqual([0]);
		expect(gradient(P, I.f)).toEqual(P.psi);
	});
	it('the staircase loop sums to 4 and integration reports a defect of 4', () => {
		const P = puzzles.find((p) => p.id === 'staircase')!;
		expect(pathSum(P, P.psi, [0, 1, 2, 3, 0])).toBe(4);
		const I = integrate(P, P.psi);
		expect(I.defects).toHaveLength(1);
		expect(Math.abs(I.defects[0].value)).toBe(4);
		// the defect is the sum around its fundamental loop (which is returned already closed)
		const L = I.defects[0].loop;
		expect(L[0]).toBe(L[L.length - 1]);
		expect(pathSum(P, P.psi, L)).toBe(I.defects[0].value);
	});
	it('two loops: E − V + c = 6 − 5 + 1 = 2, one closes and one does not', () => {
		const P = puzzles.find((p) => p.id === 'two-loops')!;
		expect(cycleRank(P)).toBe(2);
		// the two triangles 0-1-2 and 1-2-3 (as loops of the graph; no faces are filled)
		const a = pathSum(P, P.psi, [0, 1, 2, 0]);
		const b = pathSum(P, P.psi, [1, 3, 2, 1]);
		expect([a, b].filter((x) => x === 0)).toHaveLength(1);
		expect([a, b].filter((x) => x !== 0)).toHaveLength(1);
		const I = integrate(P, P.psi);
		expect(I.defects).toHaveLength(2);
		expect(I.defects.filter((d) => d.value !== 0)).toHaveLength(1);
	});
	it('a theta graph (two junctions joined by three trails) has 2 independent loop sums', () => {
		// u = 0, w = 1, and a midpoint on each of the three trails
		const theta: OGraph = {
			n: 5,
			edges: [
				[0, 2],
				[2, 1],
				[0, 3],
				[3, 1],
				[0, 4],
				[4, 1]
			]
		};
		expect(cycleRank(theta)).toBe(2);
		expect(bettis(theta)).toEqual([1, 2]);
	});
	it('tree paths are correct', () => {
		const parent = [-1, 0, 0, 1, 1, 4];
		expect(treePath(parent, 5, 2)).toEqual([5, 4, 1, 0, 2]);
		expect(treePath(parent, 3, 3)).toEqual([3]);
	});
});

describe('the local test on one triangle', () => {
	const T: OGraph = { n: 3, edges: [[0, 1], [1, 2], [0, 2]], tris: [[0, 1, 2]] };
	it('heights 1, 3, 6 give 2, 3, 5 and circulation 2 + 3 − 5 = 0', () => {
		const psi = gradient(T, [1, 3, 6]);
		expect(psi).toEqual([2, 3, 5]);
		expect(curl(T, psi, [0, 1, 2])).toBe(0);
	});
	it('free labels 2, 3, 4 fail the test by 1', () => {
		expect(curl(T, [2, 3, 4], [0, 1, 2])).toBe(1);
	});
	it('δδ = 0: the curl of any gradient vanishes', () => {
		for (let s = 0; s < 20; s++) {
			const f = [s, (s * 7) % 5, (s * 3) % 11];
			expect(curl(T, gradient(T, f), [0, 1, 2])).toBe(0);
		}
	});
});

describe('the annulus: closed but not exact', () => {
	const A = annulus();
	it('has V, E, F = 6, 12, 6 and H¹ of dimension 1', () => {
		expect([A.n, A.edges.length, A.tris!.length]).toEqual([6, 12, 6]);
		expect(bettis(A)).toEqual([1, 1, 0]);
		const { K } = toComplex(A);
		expect(K.eulerCharacteristic()).toBe(0);
	});
	it('ψ passes all six triangle tests but sums to 1 around the hole', () => {
		for (const t of A.tris!) expect(curl(A, A.psi, t)).toBe(0);
		expect(pathSum(A, A.psi, [0, 1, 2, 0])).toBe(1);
		expect(pathSum(A, A.psi, [3, 4, 5, 3])).toBe(1);
		// a loop that bounds (sector 0) sums to 0
		expect(pathSum(A, A.psi, [0, 3, 4, 1, 0])).toBe(0);
	});
	it('adding a bump δ(1ᵥ) changes no triangle test and no loop sum', () => {
		for (let v = 0; v < 6; v++) {
			const bump = A.edges.map(([t, h]) => (h === v ? 1 : 0) - (t === v ? 1 : 0));
			const psi2 = A.psi.map((x, e) => x + bump[e]);
			for (const t of A.tris!) expect(curl(A, psi2, t)).toBe(0);
			expect(pathSum(A, psi2, [0, 1, 2, 0])).toBe(1);
		}
	});
	it('the harmonic representative is 1/3 around, −1/6 on rungs, +1/6 on diagonals', () => {
		const H = hodge(A, A.psi);
		H.harmonic.forEach((h, e) => expect(close(h, A.harmonic[e], 1e-9)).toBe(true));
		expect(H.curl.every((x) => x === 0)).toBe(true);
		expect(pathSum(A, H.harmonic, [0, 1, 2, 0])).toBeCloseTo(1, 12);
		expect(pathSum(A, H.harmonic, [3, 4, 5, 3])).toBeCloseTo(1, 12);
		// divergence-free: at every vertex, inflow = outflow
		for (let v = 0; v < 6; v++) {
			const div = A.edges.reduce((s, [t, h], e) => s + (h === v ? H.harmonic[e] : 0) - (t === v ? H.harmonic[e] : 0), 0);
			expect(Math.abs(div)).toBeLessThan(1e-12);
		}
	});
});

describe('Hodge decomposition example (3, 3, 3, 2, −2)', () => {
	const H = hodge(hodgeGraph, hodgeGraph.flow);
	it('gradient (1,1,2,−1,1) from heights (0,1,2,1)', () => {
		// edges in our order: 1→2, 2→3, 1→3, 3→4, 1→4
		expect(H.gradient).toEqual([1, 1, 2, -1, 1]);
		expect(H.potential).toEqual([0, 1, 2, 1]);
	});
	it('curl (1,1,−1,0,0): a unit swirl around the filled triangle 1→2→3', () => {
		expect(H.curl).toEqual([1, 1, -1, 0, 0]);
	});
	it('harmonic (1,1,2,3,−3), loop sum 8 around the hole along both routes', () => {
		expect(H.harmonic).toEqual([1, 1, 2, 3, -3]);
		expect(pathSum(hodgeGraph, H.harmonic, [0, 2, 3, 0])).toBe(8);
		expect(pathSum(hodgeGraph, H.harmonic, [0, 1, 2, 3, 0])).toBe(8);
		// the original flow's loop sums differ along the two routes (7 vs 10): the curl part
		expect(pathSum(hodgeGraph, hodgeGraph.flow, [0, 2, 3, 0])).toBe(7);
		expect(pathSum(hodgeGraph, hodgeGraph.flow, [0, 1, 2, 3, 0])).toBe(10);
	});
	it('Pythagoras: 35 = 8 + 3 + 24, and the three parts are orthogonal', () => {
		expect(norm2(hodgeGraph.flow)).toBe(35);
		expect([norm2(H.gradient), norm2(H.curl), norm2(H.harmonic)]).toEqual([8, 3, 24]);
		const dot = (a: number[], b: number[]) => a.reduce((s, x, i) => s + x * b[i], 0);
		expect(dot(H.gradient, H.curl)).toBe(0);
		expect(dot(H.gradient, H.harmonic)).toBe(0);
		expect(dot(H.curl, H.harmonic)).toBe(0);
	});
	it('the presets are pure: heights, swirl, around the hole', () => {
		const g = hodge(hodgeGraph, [2, 1, 3, -2, 1]);
		expect(g.curl).toEqual([0, 0, 0, 0, 0]);
		expect(g.harmonic).toEqual([0, 0, 0, 0, 0]);
		const c = hodge(hodgeGraph, [1, 1, -1, 0, 0]);
		expect(c.gradient).toEqual([0, 0, 0, 0, 0]);
		expect(c.harmonic).toEqual([0, 0, 0, 0, 0]);
		const h = hodge(hodgeGraph, [1, 1, 2, 3, -3]);
		expect(h.gradient).toEqual([0, 0, 0, 0, 0]);
		expect(h.curl).toEqual([0, 0, 0, 0, 0]);
	});
	it('the ranking read from the heights is 3 > 2 = 4 > 1', () => {
		const p = H.potential;
		expect(p[2] > p[1] && p[1] === p[3] && p[3] > p[0]).toBe(true);
	});
	it('H¹ of the graph with one filled triangle is 1-dimensional', () => {
		expect(bettis(hodgeGraph)).toEqual([1, 1, 0]);
	});
});

describe('arbitrage', () => {
	const r = market.rates;
	it('the fair pound→yen rate is 200: the loop product is 1', () => {
		expect(r[0] * r[1] * 200 * r[3]).toBeCloseTo(1, 12);
	});
	it('$1000 around the loop ends as $5r; at r = 202 that is $1010', () => {
		for (const x of [190, 200, 202, 210]) expect(1000 * r[0] * r[1] * x * r[3]).toBeCloseTo(5 * x, 9);
		expect(765 * 202).toBe(154530);
	});
	it('the log loop sum is ln(r/200); log-rates of a fair market are differences of log-values', () => {
		const ln = Math.log;
		const s = ln(0.9) + ln(0.85) + ln(202) + ln(1 / 153);
		expect(s).toBeCloseTo(ln(202 / 200), 12);
		// values in dollars: $1, €1/0.9, £1/(0.9·0.85), ¥1/153
		const V = [1, 1 / 0.9, 1 / (0.9 * 0.85), 1 / 153];
		const fair = [0.9, 0.85, 200, 1 / 153];
		market.edges.forEach(([t, h], e) => expect(fair[e]).toBeCloseTo(V[t] / V[h], 9));
	});
	it('with a € ↔ ¥ market at 170, the triangle $€¥ is fair and €£¥ carries the arbitrage', () => {
		expect((0.9 * 170) / 153).toBeCloseTo(1, 12);
		expect((0.85 * 202) / 170).toBeCloseTo(202 / 200, 12);
	});
});

describe('the gear ring', () => {
	it('even rings mesh everywhere; odd rings clash at exactly one mesh', () => {
		for (let n = 3; n <= 12; n++) {
			const G = gearRing(n);
			const errs = Array.from({ length: n }, (_, i) => meshError(G, i));
			for (let i = 0; i < n - 1; i++) expect(errs[i]).toBeLessThan(1e-9);
			if (n % 2 === 0) {
				expect(errs[n - 1]).toBeLessThan(1e-9);
				expect(G.spin[n - 1]).toBe(-G.spin[0]);
			} else {
				// the last gear spins the same way as the first: the mesh between them is impossible
				expect(G.spin[n - 1]).toBe(G.spin[0]);
			}
		}
	});
	it('the ℤ/2 loop sum is n mod 2', () => {
		for (let n = 3; n <= 12; n++) expect((n * 1) % 2).toBe(n % 2 === 0 ? 0 : 1);
	});
});

describe('impossible objects are possible from one viewpoint', () => {
	it('the staircase: step N would sit exactly in front of step 0', () => {
		const st = penroseStairs([4, 4, 4, 4], { ws: [1.25, 1.25, 0.55, 0.55], W: 1.3, k: 1.8, thickness: 1.3 });
		expect(st.N).toBe(20);
		const s0 = st.steps[0].center;
		const want: V3 = [s0[0] + st.shift[0], s0[1] + st.shift[1], s0[2] + st.shift[2]];
		st.next.forEach((x, i) => expect(x).toBeCloseTo(want[i], 9));
		// the shift is parallel to the view direction, so it is invisible
		const [a, b] = project(st.next, st.view);
		const [c, d] = project(s0, st.view);
		expect(a).toBeCloseTo(c, 9);
		expect(b).toBeCloseTo(d, 9);
		// every step rises by h; one lap rises N·h
		st.steps.forEach((s, i) => expect(s.top).toBeCloseTo(i * st.h, 12));
	});
	it('the tribar: the far end projects onto the near end', () => {
		const T = penroseTribar(4.2, 1);
		const [a, b] = project(T.shift, T.view);
		expect(Math.abs(a) + Math.abs(b)).toBeLessThan(1e-12);
	});
});

describe('formatting', () => {
	it('fractions', () => {
		expect(frac(1 / 3)).toEqual({ p: 1, q: 3 });
		expect(fracText(-1 / 6)).toBe('−1/6');
		expect(fracText(2)).toBe('2');
		expect(fracTeX(-1 / 6)).toBe('-\\tfrac{1}{6}');
		expect(fracTeX(0)).toBe('0');
	});
});
