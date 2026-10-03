import { describe, expect, it } from 'vitest';
import {
	reduce,
	barsOf,
	bettiAt,
	reductionTrace,
	ripsFiltration,
	cechFiltration,
	minEnclosingRadius,
	RipsPH,
	sublevelBars,
	bottleneck,
	presetCloud,
	jiggle,
	type FSimplex,
	type Pt,
	type DgmPt
} from './ph';
import { flipbook } from './flipbook';
import { ripsPersistence, noisyCircle, twoCircles, figureEightCloud, blobCloud } from '$lib/math/persistence';
import { BitVec, rankZ2Columns } from '$lib/math/linalg';

const close = (a: number, b: number, eps = 1e-9) => Math.abs(a - b) < eps;
const fmt = (bars: { dim: number; birth: number; death: number }[]) =>
	bars.map((b) => `H${b.dim}[${b.birth.toFixed(4)},${b.death === Infinity ? 'inf' : b.death.toFixed(4)})`).sort();

const hexagon: Pt[] = Array.from({ length: 6 }, (_, k) => [Math.cos((Math.PI * k) / 3), Math.sin((Math.PI * k) / 3)]);
const triangle: Pt[] = [
	[0, 0],
	[2, 0],
	[1, Math.sqrt(3)]
];
const square: Pt[] = [
	[0, 0],
	[1, 0],
	[1, 1],
	[0, 1]
];

describe('the tiny filtration of the reduction stepper', () => {
	// vertices 0,1,2 at time 0; edges 01 @1, 12 @2, 02 @3; triangle 012 @4
	const tiny: FSimplex[] = [
		{ verts: [0], value: 0 },
		{ verts: [1], value: 0 },
		{ verts: [2], value: 0 },
		{ verts: [0, 1], value: 1 },
		{ verts: [1, 2], value: 2 },
		{ verts: [0, 2], value: 3 },
		{ verts: [0, 1, 2], value: 4 }
	];
	it('pairs: H0 [0,∞), [0,1), [0,2); H1 [3,4)', () => {
		const red = reduce(tiny);
		expect(fmt(barsOf(red))).toEqual(fmt([
			{ dim: 0, birth: 0, death: Infinity },
			{ dim: 0, birth: 0, death: 1 },
			{ dim: 0, birth: 0, death: 2 },
			{ dim: 1, birth: 3, death: 4 }
		]));
		// the birth/death simplices: (1, 01), (2, 12), (02, 012); vertex 0 is essential
		const pairs = red.pairs.filter((p) => p.deathIdx >= 0).map((p) => [p.birthIdx, p.deathIdx]);
		expect(pairs.sort()).toEqual([[1, 3], [2, 4], [5, 6]].sort());
		// column 02 reduces to zero, and V records the cycle 01 + 12 + 02
		expect(red.R[5]).toEqual([]);
		expect(red.V[5]).toEqual([3, 4, 5]);
	});
	it('trace: the steps the stepper shows', () => {
		const steps = reductionTrace(tiny);
		expect(steps.map((s) => `${s.j}:${s.kind}${s.other !== undefined ? '+' + s.other : ''}`)).toEqual([
			'0:vertex',
			'1:vertex',
			'2:vertex',
			'3:pivot',
			'4:pivot',
			'5:clash+4',
			'5:clash+3',
			'5:zero',
			'6:pivot'
		]);
		const last = steps[steps.length - 1];
		expect(last.pairs).toEqual([
			[1, 3],
			[2, 4],
			[5, 6]
		]);
		// after adding column 12 to column 02, the column is {0, 1} (low = vertex 1)
		expect(steps[5].R[5]).toEqual([0, 1]);
	});
});

describe('Čech versus Rips', () => {
	it('smallest enclosing circles', () => {
		expect(close(minEnclosingRadius(triangle), 2 / Math.sqrt(3))).toBe(true);
		// obtuse: half the longest side
		expect(close(minEnclosingRadius([[0, 0], [4, 0], [2, 0.5]]), 2)).toBe(true);
		expect(close(minEnclosingRadius(square), Math.SQRT2 / 2)).toBe(true);
	});
	it('equilateral triangle (side 2): Čech has a hole on [1, 2/√3), Rips never does', () => {
		const cech = barsOf(reduce(cechFiltration(triangle, 2)));
		const rips = barsOf(reduce(ripsFiltration(triangle, 2)));
		const c1 = cech.filter((b) => b.dim === 1);
		expect(c1.length).toBe(1);
		expect(close(c1[0].birth, 1)).toBe(true);
		expect(close(c1[0].death, 2 / Math.sqrt(3))).toBe(true);
		expect(rips.filter((b) => b.dim === 1).length).toBe(0);
		// at r = 1.08: Čech b1 = 1, Rips b1 = 0
		expect(bettiAt(cech, 1.08)).toEqual([1, 1, 0]);
		expect(bettiAt(rips, 1.08)).toEqual([1, 0, 0]);
	});
	it('regular hexagon (circumradius 1): Rips is an octahedron for √3/2 ≤ r < 1', () => {
		const rips = barsOf(reduce(ripsFiltration(hexagon, 3)), 2);
		const cech = barsOf(reduce(cechFiltration(hexagon, 3)), 2);
		expect(fmt(rips.filter((b) => b.dim >= 1))).toEqual(fmt([
			{ dim: 1, birth: 0.5, death: Math.sqrt(3) / 2 },
			{ dim: 2, birth: Math.sqrt(3) / 2, death: 1 }
		]));
		expect(fmt(cech.filter((b) => b.dim >= 1))).toEqual(fmt([{ dim: 1, birth: 0.5, death: 1 }]));
		expect(bettiAt(rips, 0.93)).toEqual([1, 0, 1]);
		expect(bettiAt(cech, 0.93)).toEqual([1, 1, 0]);
	});
	it('Čech ⊆ Rips at every radius (same vertices and edges)', () => {
		const pts = presetCloud('random', 5).slice(0, 7);
		const C = cechFiltration(pts, 2);
		const R = new Map(ripsFiltration(pts, 2).map((s) => [s.verts.join(','), s.value]));
		for (const s of C) {
			const rv = R.get(s.verts.join(','))!;
			expect(rv).toBeLessThanOrEqual(s.value + 1e-12);
			if (s.verts.length <= 2) expect(close(rv, s.value)).toBe(true);
			// and Rips_r ⊆ Čech_{(2/√3) r} in the plane (Jung's theorem)
			expect(s.value).toBeLessThanOrEqual((2 / Math.sqrt(3)) * rv + 1e-9);
		}
	});
});

describe('square (exercise): unit square corners', () => {
	it('H0: [0,∞) + 3×[0,1/2); H1: [1/2, √2/2)', () => {
		const bars = barsOf(reduce(ripsFiltration(square, 3)), 2);
		expect(fmt(bars)).toEqual(fmt([
			{ dim: 0, birth: 0, death: Infinity },
			{ dim: 0, birth: 0, death: 0.5 },
			{ dim: 0, birth: 0, death: 0.5 },
			{ dim: 0, birth: 0, death: 0.5 },
			{ dim: 1, birth: 0.5, death: Math.SQRT2 / 2 }
		]));
		const ph = new RipsPH(square);
		expect(fmt(ph.bars)).toEqual(fmt(bars));
	});
});

describe('the fast Rips engine', () => {
	const clouds: Record<string, Pt[]> = {
		circle: noisyCircle(24, 1, 0.05, 3),
		two: twoCircles(30),
		eight: figureEightCloud(30),
		blob: blobCloud(22),
		pcircle: presetCloud('circle', 2),
		ptwo: presetCloud('two', 3),
		prandom: presetCloud('random', 4)
	};
	for (const [name, pts] of Object.entries(clouds)) {
		it(`agrees with the shared engine and with the generic reduction (${name})`, () => {
			const ph = new RipsPH(pts);
			// shared engine uses the diameter convention: halve
			const shared = ripsPersistence(pts, Infinity).bars.map((b) => ({ dim: b.dim, birth: b.birth / 2, death: b.death / 2 }));
			expect(fmt(ph.bars)).toEqual(fmt(shared.filter((b) => b.death - b.birth > 1e-12)));
			if (pts.length <= 26) {
				const generic = barsOf(reduce(ripsFiltration(pts, 2)), 1);
				expect(fmt(ph.bars)).toEqual(fmt(generic));
			}
		});
	}

	it('representative cycles are cycles born with their bar and dying with it', () => {
		for (const pts of [clouds.circle, clouds.eight, clouds.ptwo, clouds.prandom]) {
			const ph = new RipsPH(pts);
			const n = pts.length;
			for (const bar of ph.bars.filter((b) => b.dim === 1)) {
				const z = ph.cycle(bar);
				// a cycle: every vertex has even degree
				const deg = new Array(n).fill(0);
				for (const [u, v] of z) {
					deg[u]++;
					deg[v]++;
				}
				expect(deg.every((d) => d % 2 === 0)).toBe(true);
				// it contains the creating edge, and all its edges exist at the birth radius
				expect(z.some(([u, v]) => (u === bar.creator[0] && v === bar.creator[1]) || (u === bar.creator[1] && v === bar.creator[0]))).toBe(true);
				for (const [u, v] of z) expect(ph.edgeRadius(u, v)).toBeLessThanOrEqual(bar.birth + 1e-12);
				// it is a boundary at the death radius, but not just before it
				expect(isBoundary(ph, z, bar.death)).toBe(true);
				expect(isBoundary(ph, z, bar.death - 1e-9)).toBe(false);
			}
		}
	});

	it('H0 components: the dying component is a union of whole clusters at its death', () => {
		const ph = new RipsPH(clouds.ptwo);
		for (const bar of ph.bars.filter((b) => b.dim === 0 && b.death < Infinity)) {
			const comp = ph.components.get(bar.id)!;
			expect(comp).toContain(bar.creator[0]);
			// the merging edge joins the component to a vertex outside it
			const [u, v] = bar.destroyer!;
			expect(comp.includes(u) !== comp.includes(v)).toBe(true);
			// the elder (smallest label) of the component is the creator
			expect(Math.min(...comp)).toBe(bar.creator[0]);
		}
	});

	it('Betti numbers of the presets look like the shapes', () => {
		const circle = new RipsPH(presetCloud('circle', 1));
		const long1 = circle.bars.filter((b) => b.dim === 1 && b.death - b.birth > 0.4);
		expect(long1.length).toBe(1);
		const two = new RipsPH(presetCloud('two', 1));
		expect(two.bars.filter((b) => b.dim === 1 && b.death - b.birth > 0.2).length).toBe(2);
		const eight = new RipsPH(presetCloud('eight', 1));
		expect(eight.bars.filter((b) => b.dim === 1 && b.death - b.birth > 0.3).length).toBe(2);
		const blob = new RipsPH(presetCloud('blob', 1));
		expect(blob.bars.filter((b) => b.dim === 1 && b.death - b.birth > 0.15).length).toBe(0);
	});

	it('is fast enough for 64 points', () => {
		const pts = presetCloud('random', 9);
		while (pts.length < 64) pts.push([Math.sin(pts.length) * 2, Math.cos(pts.length * 1.7)]);
		const t0 = performance.now();
		const ph = new RipsPH(pts);
		for (const b of ph.bars) if (b.dim === 1) ph.cycle(b);
		const t = performance.now() - t0;
		expect(t).toBeLessThan(1500);
	});
});

function isBoundary(ph: RipsPH, z: [number, number][], r: number): boolean {
	// is the edge set z in the image of ∂₂ restricted to the triangles present at radius r?
	const n = ph.n;
	const key = (u: number, v: number) => (u < v ? u * n + v : v * n + u);
	const rows = new Map<number, number>();
	const row = (u: number, v: number) => {
		const k = key(u, v);
		if (!rows.has(k)) rows.set(k, rows.size);
		return rows.get(k)!;
	};
	const T = ph.trianglesAt(r);
	const cols: number[][] = [];
	for (let t = 0; t < T; t++) {
		const a = ph.tA[t];
		const b = ph.tB[t];
		const c = ph.tC[t];
		cols.push([row(a, b), row(a, c), row(b, c)]);
	}
	const zc = z.map(([u, v]) => row(u, v));
	const N = rows.size;
	const toBits = (c: number[]) => BitVec.from(N, c);
	const base = rankZ2Columns(cols.map(toBits));
	const withZ = rankZ2Columns([...cols.map(toBits), toBits(zc)]);
	return base === withZ;
}

describe('the flip-book pentagon', () => {
	it('tells the intended story, simplex by simplex', () => {
		const { simplices, steps } = flipbook();
		const story = steps.map((s) => (s.added < 0 ? s.kind : `${s.kind}:${simplices[s.added].verts.join('')}`));
		expect(story).toEqual([
			'start',
			'merge:01',
			'merge:12',
			'merge:34',
			'merge:23',
			'loop:04',
			'instant-loop:02',
			'instant-fill:012',
			'instant-loop:03',
			'instant-fill:023',
			'fill:034'
		]);
		// the elder rule: 34 makes vertex 4 die; 23 then makes vertex 3 die
		expect(steps[3].ring).toBe(4);
		expect(steps[4].ring).toBe(3);
		// no other triangles or diagonals sneak in before the film stops
		expect(simplices.length).toBe(15);
	});
});

describe('exercise: reduction by hand on a square with a diagonal', () => {
	// vertices 0–3 at 0; 01, 12 @1; 23 @2; 03 @3; 02 @4; 012 @4; 023 @5
	const f: FSimplex[] = [
		{ verts: [0], value: 0 },
		{ verts: [1], value: 0 },
		{ verts: [2], value: 0 },
		{ verts: [3], value: 0 },
		{ verts: [0, 1], value: 1 },
		{ verts: [1, 2], value: 1 },
		{ verts: [2, 3], value: 2 },
		{ verts: [0, 3], value: 3 },
		{ verts: [0, 2], value: 4 },
		{ verts: [0, 1, 2], value: 4 },
		{ verts: [0, 2, 3], value: 5 }
	];
	it('H0: [0,∞), [0,1), [0,1), [0,2); H1: [3,5) plus an instant pair (02, 012)', () => {
		const red = reduce(f);
		expect(fmt(barsOf(red))).toEqual(fmt([
			{ dim: 0, birth: 0, death: Infinity },
			{ dim: 0, birth: 0, death: 1 },
			{ dim: 0, birth: 0, death: 1 },
			{ dim: 0, birth: 0, death: 2 },
			{ dim: 1, birth: 3, death: 5 }
		]));
		const pairs = red.pairs.filter((p) => p.deathIdx >= 0).map((p) => [p.birthIdx, p.deathIdx]);
		expect(pairs).toContainEqual([8, 9]); // 02 born and killed at once by 012
		expect(pairs).toContainEqual([7, 10]); // the square loop (born with 03) dies with 023
		// column 023 = {02, 23, 03} → add column 012 → {01, 12, 23, 03}: the square
		expect(red.R[10]).toEqual([4, 5, 6, 7]);
	});
});

describe('exercise: an outlier at the centre of a circle', () => {
	it('shortens the loop’s bar from about 0.87R to R/2', () => {
		const R = 1;
		// 42 evenly spaced points: the inscribed equilateral triangle exists, and the loop dies with it
		const ring: Pt[] = Array.from({ length: 42 }, (_, k) => [R * Math.cos((2 * Math.PI * k) / 42), R * Math.sin((2 * Math.PI * k) / 42)]);
		const without = new RipsPH(ring).bars.filter((b) => b.dim === 1);
		const withC = new RipsPH([...ring, [0, 0]]).bars.filter((b) => b.dim === 1);
		const long = (bs: typeof without) => bs.reduce((m, b) => (b.death - b.birth > m.death - m.birth ? b : m));
		expect(close(long(without).death, Math.sqrt(3) / 2)).toBe(true);
		expect(close(long(withC).death, 0.5)).toBe(true);
		// and the playground's noisy-circle preset (R = 1.15) behaves the same way
		const P = presetCloud('circle', 1);
		const before = long(new RipsPH(P).bars.filter((b) => b.dim === 1));
		const after = long(new RipsPH([...P, [0, 0]]).bars.filter((b) => b.dim === 1));
		expect(before.death).toBeGreaterThan(0.9);
		expect(after.death).toBeLessThan(0.64);
	});
});

describe('water level (sublevel sets) and the elder rule', () => {
	it('exercise landscape: minima 1, 2, 0 and peaks 5, 6', () => {
		const bars = sublevelBars([4, 1, 5, 2, 6, 0, 3]);
		expect(bars.map((b) => [b.birth, b.death])).toEqual([
			[0, Infinity],
			[1, 6],
			[2, 5]
		]);
	});
	it('three valleys', () => {
		// minima at heights 1, 0, 2; peaks 3 (between first two) and 4 (between last two)
		const f = [5, 1, 3, 0, 4, 2, 6];
		const bars = sublevelBars(f);
		expect(bars.map((b) => [b.birth, b.death])).toEqual([
			[0, Infinity],
			[1, 3],
			[2, 4]
		]);
		// the younger valley (min 2) dies at the peak 4, the valley with min 1 at the peak 3
		expect(bars.find((b) => b.birth === 2)!.maxIdx).toBe(4);
	});
});

describe('bottleneck distance and stability', () => {
	it('basic cases', () => {
		expect(bottleneck([[0, 1]], [[0, 1]]).distance).toBe(0);
		expect(close(bottleneck([[0, 1]], []).distance, 0.5)).toBe(true);
		expect(close(bottleneck([[0, 1], [0.2, 0.3]], [[0.1, 1.05]]).distance, 0.1)).toBe(true);
		const m = bottleneck([[0, 1]], [[0.05, 1.1]]);
		expect(m.matching).toEqual([[0, 0]]);
	});
	it('moving every point by at most δ moves the diagram by at most δ (radius convention)', () => {
		for (const [kind, seed] of [['circle', 1], ['two', 2], ['random', 3], ['eight', 4]] as const) {
			const P = presetCloud(kind, seed);
			const A = new RipsPH(P);
			for (const delta of [0.02, 0.05, 0.1, 0.2]) {
				const B = new RipsPH(jiggle(P, delta, seed + 10));
				for (const dim of [0, 1]) {
					const a: DgmPt[] = A.bars.filter((b) => b.dim === dim && b.death < Infinity).map((b) => [b.birth, b.death]);
					const bb: DgmPt[] = B.bars.filter((b) => b.dim === dim && b.death < Infinity).map((b) => [b.birth, b.death]);
					expect(bottleneck(a, bb).distance).toBeLessThanOrEqual(delta + 1e-9);
				}
			}
		}
	});
});
