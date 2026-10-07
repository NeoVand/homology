// The labelled complexes used in chapters 3.3 and 3.4, each with a flat picture.
// Conventions (AUTHORING §4): integer vertex labels, simplices oriented by
// increasing label, ∂[v0,…,vk] = Σ (−1)^i [v0,…,v̂i,…,vk].
import { SimplicialComplex } from '$lib/math/complex';
import { buildFlat, type DV, type FlatLayout, type Pt } from './flat';
import { loopChain, type Chain } from './chains';

export interface NamedCycle {
	name: string;
	/** TeX name, e.g. "a" */
	tex: string;
	k: number;
	chain: Chain;
	color: 'gold' | 'rose' | 'teal' | 'violet' | 'blue' | 'green';
}

export interface Example {
	id: string;
	name: string;
	/** what space it triangulates, in TeX */
	space: string;
	K: SimplicialComplex;
	L: FlatLayout;
	/** a few named cycles worth highlighting */
	cycles?: NamedCycle[];
}

const SQ3 = Math.sqrt(3);

/** equilateral triangle corners: 0 bottom-left, 1 bottom-right, 2 top (counterclockwise) */
const TRI: Pt[] = [
	[-1, -SQ3 / 3],
	[1, -SQ3 / 3],
	[0, (2 * SQ3) / 3]
];

export function point(): Example {
	const K = new SimplicialComplex([[0]]);
	return { id: 'point', name: 'A point', space: '\\{\\ast\\}', K, L: buildFlat(K, { points: [[0, [0, 0]]] }, { pad: 60 }) };
}

export function twoPoints(): Example {
	const K = new SimplicialComplex([[0], [1]]);
	return {
		id: 'two-points',
		name: 'Two points',
		space: 'S^0',
		K,
		L: buildFlat(K, { points: [[0, [-1, 0]], [1, [1, 0]]] }, { pad: 50 })
	};
}

export function interval(): Example {
	const K = new SimplicialComplex([[0, 1]]);
	return { id: 'interval', name: 'An edge', space: 'I', K, L: buildFlat(K, { edges: [[[0, [-1, 0]], [1, [1, 0]]]] }, { pad: 50 }) };
}

export function hollowTriangle(): Example {
	const K = new SimplicialComplex([
		[0, 1],
		[0, 2],
		[1, 2]
	]);
	const v = (i: number): DV => [i, TRI[i]];
	const L = buildFlat(K, {
		edges: [
			[v(0), v(1)],
			[v(1), v(2)],
			[v(0), v(2)]
		]
	});
	return {
		id: 'circle',
		name: 'Hollow triangle',
		space: 'S^1',
		K,
		L,
		cycles: [{ name: 'z', tex: 'z', k: 1, chain: loopChain(K, [0, 1, 2]), color: 'gold' }]
	};
}

export function filledTriangle(): Example {
	const K = new SimplicialComplex([[0, 1, 2]]);
	const v = (i: number): DV => [i, TRI[i]];
	return {
		id: 'disk',
		name: 'Filled triangle',
		space: 'D^2',
		K,
		L: buildFlat(K, { tris: [[v(0), v(1), v(2)]] }),
		cycles: [{ name: 'z', tex: 'z', k: 1, chain: loopChain(K, [0, 1, 2]), color: 'gold' }]
	};
}

/**
 * Hollow tetrahedron, drawn as its net: the central triangle 012 and three
 * flaps whose tips are all the apex 3 (fold them up and they meet).
 */
export function hollowTetrahedron(): Example {
	const K = new SimplicialComplex([
		[0, 1, 2],
		[0, 1, 3],
		[0, 2, 3],
		[1, 2, 3]
	]);
	const P = TRI;
	const tip = (i: number, j: number, k: number): Pt => [P[i][0] + P[j][0] - P[k][0], P[i][1] + P[j][1] - P[k][1]];
	const v = (i: number): DV => [i, P[i]];
	const L = buildFlat(K, {
		tris: [
			[v(0), v(1), v(2)],
			[v(0), v(1), [3, tip(0, 1, 2)]],
			[v(1), v(2), [3, tip(1, 2, 0)]],
			[v(0), v(2), [3, tip(0, 2, 1)]]
		]
	});
	return { id: 'sphere', name: 'Hollow tetrahedron', space: 'S^2', K, L };
}

/** Two hollow triangles sharing vertex 0 (a wedge of two circles). */
export function figureEight(): Example {
	const K = new SimplicialComplex([
		[0, 1],
		[1, 2],
		[0, 2],
		[0, 3],
		[3, 4],
		[0, 4]
	]);
	const pos: Record<number, Pt> = { 0: [0, 0], 1: [-1.75, 0.95], 2: [-1.75, -0.95], 3: [1.75, -0.95], 4: [1.75, 0.95] };
	const v = (i: number): DV => [i, pos[i]];
	const L = buildFlat(K, {
		edges: [
			[v(0), v(1)],
			[v(1), v(2)],
			[v(0), v(2)],
			[v(0), v(3)],
			[v(3), v(4)],
			[v(0), v(4)]
		]
	});
	return {
		id: 'figure-eight',
		name: 'Figure eight',
		space: 'S^1 \\vee S^1',
		K,
		L,
		cycles: [
			{ name: 'z1', tex: 'z_1', k: 1, chain: loopChain(K, [0, 1, 2]), color: 'gold' },
			{ name: 'z2', tex: 'z_2', k: 1, chain: loopChain(K, [0, 3, 4]), color: 'rose' }
		]
	};
}

/** Solid tetrahedron (a 3-ball), drawn in perspective. */
export function solidTetrahedron(): Example {
	const K = new SimplicialComplex([[0, 1, 2, 3]]);
	const pos: Record<number, Pt> = { 0: [-1.25, -0.75], 1: [1.35, -0.95], 2: [0.35, -0.15], 3: [0.05, 1.45] };
	const v = (i: number): DV => [i, pos[i]];
	const L = buildFlat(K, {
		tris: [
			[v(0), v(1), v(3)],
			[v(1), v(2), v(3)],
			[v(0), v(2), v(3)],
			[v(0), v(1), v(2)]
		]
	});
	return { id: 'ball', name: 'Solid tetrahedron', space: 'D^3', K, L };
}

// ── surfaces from a square grid ─────────────────────────────────────────────

/**
 * Label of the grid point (i, j) of the n×n square, j = 0 at the bottom.
 *  - torus: (i, j) ~ (i + n, j) ~ (i, j + n); label (i mod n) + n·(j mod n)
 *  - klein: left/right glued straight, top glued to bottom reversed:
 *           (n, j) ~ (0, j) and (i, n) ~ (n − i, 0)  (edge word a b a b⁻¹)
 */
export function gridLabel(kind: 'torus' | 'klein', n: number, i: number, j: number): number {
	if (kind === 'klein' && j === n) {
		i = n - i;
		j = 0;
	}
	const ii = ((i % n) + n) % n;
	const jj = ((j % n) + n) % n;
	return ii + n * jj;
}

export function gridSpec(kind: 'torus' | 'klein', n = 3) {
	const lab = (i: number, j: number): DV => [gridLabel(kind, n, i, j), [i, j]];
	const tris: [DV, DV, DV][] = [];
	for (let i = 0; i < n; i++)
		for (let j = 0; j < n; j++) {
			const p = lab(i, j);
			const q = lab(i + 1, j);
			const r = lab(i + 1, j + 1);
			const s = lab(i, j + 1);
			tris.push([p, q, r], [p, r, s]);
		}
	return tris;
}

/** The 3×3 torus (9 vertices, 27 edges, 18 triangles). a = bottom row, b = left column. */
export function torusGrid(): Example {
	const tris = gridSpec('torus');
	const K = new SimplicialComplex(tris.map((t) => t.map(([v]) => v)));
	const L = buildFlat(K, { tris }, { scale: 74 });
	return {
		id: 'torus',
		name: 'Torus (3×3 grid)',
		space: 'T^2',
		K,
		L,
		cycles: [
			{ name: 'a', tex: 'a', k: 1, chain: loopChain(K, [0, 1, 2]), color: 'gold' },
			{ name: 'b', tex: 'b', k: 1, chain: loopChain(K, [0, 3, 6]), color: 'rose' }
		]
	};
}

/** The 3×3 Klein bottle: top row reversed (0 2 1 0). a = bottom row (the twisted seam), b = left column. */
export function kleinGrid(): Example {
	const tris = gridSpec('klein');
	const K = new SimplicialComplex(tris.map((t) => t.map(([v]) => v)));
	const L = buildFlat(K, { tris }, { scale: 74 });
	return {
		id: 'klein',
		name: 'Klein bottle (3×3 grid)',
		space: 'K',
		K,
		L,
		cycles: [
			{ name: 'a', tex: 'a', k: 1, chain: loopChain(K, [0, 1, 2]), color: 'gold' },
			{ name: 'b', tex: 'b', k: 1, chain: loopChain(K, [0, 3, 6]), color: 'rose' }
		]
	};
}

/**
 * Six-vertex real projective plane (the research report's labels 1–6), drawn as
 * a hexagon whose opposite rim points are identified. Rim: 4 5 6 4 5 6;
 * interior triangle 1 2 3. The rim, read once around, is c + c where c = 4→5→6→4.
 */
export const RP2_TRIS = [
	[1, 2, 3],
	[1, 3, 4],
	[1, 4, 5],
	[1, 5, 6],
	[1, 2, 6],
	[2, 3, 5],
	[3, 4, 6],
	[2, 4, 5],
	[3, 5, 6],
	[2, 4, 6]
];

export function projectivePlane(): Example {
	const K = new SimplicialComplex(RP2_TRIS);
	// rim P0..P5 counterclockwise, starting at the top-left
	const R = 2.2;
	const rim: Pt[] = Array.from({ length: 6 }, (_, k) => {
		const ang = (Math.PI * 2 * k) / 6 + (2 * Math.PI) / 3;
		return [R * Math.cos(ang), R * Math.sin(ang)];
	});
	const rimLab = [4, 5, 6, 4, 5, 6];
	const P = (k: number): DV => [rimLab[k], rim[k]];
	// interior: 1 near P1, 2 near P3, 3 near P5
	const r = 0.78;
	const inner = (k: number): Pt => {
		const ang = (Math.PI * 2 * k) / 6 + (2 * Math.PI) / 3;
		return [r * Math.cos(ang), r * Math.sin(ang)];
	};
	const I1: DV = [1, inner(1)];
	const I2: DV = [2, inner(3)];
	const I3: DV = [3, inner(5)];
	const L = buildFlat(
		K,
		{
			tris: [
				[I1, I2, I3],
				[I1, P(0), P(1)],
				[I1, P(1), P(2)],
				[I2, P(2), P(3)],
				[I2, P(3), P(4)],
				[I3, P(4), P(5)],
				[I3, P(5), P(0)],
				[I1, I2, P(2)],
				[I2, I3, P(4)],
				[I3, I1, P(0)]
			]
		},
		{ scale: 78 }
	);
	return {
		id: 'rp2',
		name: 'Projective plane (6 vertices)',
		space: '\\RP^2',
		K,
		L,
		cycles: [{ name: 'c', tex: 'c', k: 1, chain: loopChain(K, [4, 5, 6]), color: 'gold' }]
	};
}

/**
 * Five-vertex Möbius band, triangles {i, i+1, i+2} mod 5, drawn as a strip
 * whose right end is glued to its left end with a half twist.
 */
export function mobiusBand(): Example {
	const tris = [0, 1, 2, 3, 4].map((i) => [i, (i + 1) % 5, (i + 2) % 5]);
	const K = new SimplicialComplex(tris);
	// strip vertices along a zigzag: k = 0..6 with labels k mod 5; even k bottom, odd k top
	const W = 1.15;
	const pt = (k: number): DV => [k % 5, [k * W - 3 * W, k % 2 === 0 ? -0.75 : 0.75]];
	const L = buildFlat(K, { tris: [0, 1, 2, 3, 4].map((k) => [pt(k), pt(k + 1), pt(k + 2)] as [DV, DV, DV]) }, { scale: 66 });
	return {
		id: 'mobius',
		name: 'Möbius band (5 vertices)',
		space: 'M',
		K,
		L,
		cycles: [{ name: 'core', tex: 'm', k: 1, chain: loopChain(K, [0, 1, 2, 3, 4]), color: 'gold' }]
	};
}

/**
 * Genus-2 surface: two 3×3 tori, each with the triangle {0,1,4} removed,
 * sewn together along the rims of the two triangular holes. The second torus
 * keeps the labels 0, 1, 4 and renames 2,3,5,6,7,8 to 9,…,14.
 */
const G2_RENAME: Record<number, number> = { 0: 0, 1: 1, 4: 4, 2: 9, 3: 10, 5: 11, 6: 12, 7: 13, 8: 14 };
export function genus2(): Example {
	const left = gridSpec('torus');
	const keep = (t: [DV, DV, DV]) => t.map(([v]) => v).sort((a, b) => a - b).join(',') !== '0,1,4';
	const A = left.filter(keep);
	const shift = 4.6;
	const B = left.filter(keep).map((t) => t.map(([v, [x, y]]) => [G2_RENAME[v], [x + shift, y]] as DV) as [DV, DV, DV]);
	const K = new SimplicialComplex([...A, ...B].map((t) => t.map(([v]) => v)));
	const L = buildFlat(K, { tris: [...A, ...B] }, { scale: 52 });
	return {
		id: 'genus2',
		name: 'Genus-2 surface',
		space: '\\Sigma_2',
		K,
		L,
		// loops that stay away from the sewn-up hole: the top row and the right column of each torus
		cycles: [
			{ name: 'a1', tex: 'a_1', k: 1, chain: loopChain(K, [6, 7, 8]), color: 'gold' },
			{ name: 'b1', tex: 'b_1', k: 1, chain: loopChain(K, [2, 5, 8]), color: 'rose' },
			{ name: 'a2', tex: 'a_2', k: 1, chain: loopChain(K, [12, 13, 14]), color: 'gold' },
			{ name: 'b2', tex: 'b_2', k: 1, chain: loopChain(K, [9, 11, 14]), color: 'rose' }
		]
	};
}

/**
 * Annulus with three rings of 8 vertices (inner 0–7, middle 8–15, outer 16–23);
 * each ring is rotated half a step from the one inside it.
 */
export const ANNULUS_N = 8;
export const ANNULUS_RADII = [1.25, 2.25, 3.25];
export function annulusAngle(label: number): number {
	const ring = Math.floor(label / ANNULUS_N);
	const i = label % ANNULUS_N;
	return ((i + ring / 2) * 2 * Math.PI) / ANNULUS_N + Math.PI / 2;
}
export function annulus(): Example {
	const N = ANNULUS_N;
	const lab = (ring: number, i: number) => ring * N + (((i % N) + N) % N);
	const P = (l: number): DV => {
		const ring = Math.floor(l / N);
		const a = annulusAngle(l);
		return [l, [ANNULUS_RADII[ring] * Math.cos(a), ANNULUS_RADII[ring] * Math.sin(a)]];
	};
	const tris: [DV, DV, DV][] = [];
	for (let ring = 0; ring < 2; ring++)
		for (let i = 0; i < N; i++) {
			const A0 = lab(ring, i);
			const A1 = lab(ring, i + 1);
			const B0 = lab(ring + 1, i);
			const B1 = lab(ring + 1, i + 1);
			tris.push([P(A0), P(A1), P(B0)], [P(B0), P(A1), P(B1)]);
		}
	const K = new SimplicialComplex(tris.map((t) => t.map(([v]) => v)));
	const L = buildFlat(K, { tris }, { scale: 62 });
	const ring = (r: number) => loopChain(K, Array.from({ length: N }, (_, i) => lab(r, i)));
	return {
		id: 'annulus',
		name: 'Annulus',
		space: 'S^1 \\times I',
		K,
		L,
		cycles: [
			{ name: 'inner', tex: '\\gamma_0', k: 1, chain: ring(0), color: 'gold' },
			{ name: 'middle', tex: '\\gamma_1', k: 1, chain: ring(1), color: 'gold' },
			{ name: 'outer', tex: '\\gamma_2', k: 1, chain: ring(2), color: 'gold' }
		]
	};
}

/**
 * A big triangle with each side cut into 4 (15 vertices, 16 small triangles),
 * with one interior up-triangle removed: the middle one of the three in the
 * third row from the top. Lattice point (i, j), j = row from the bottom, has
 * label (number of points in the rows below) + i.
 * cycles: the outer rim (12 edges) and the 3-edge loop hugging the hole, both counterclockwise.
 */
export function holedTriangle(): Example & { hole: [number, number, number]; holeCentre: Pt } {
	const lab = (i: number, j: number) => {
		let n = 0;
		for (let r = 0; r < j; r++) n += 5 - r;
		return n + i;
	};
	const at = (i: number, j: number): DV => [lab(i, j), [i + j / 2 - 2, (j * SQ3) / 2 - (2 * SQ3) / 3]];
	const hole: [number, number, number] = [lab(1, 1), lab(2, 1), lab(1, 2)];
	const tris: [DV, DV, DV][] = [];
	for (let j = 0; j < 4; j++)
		for (let i = 0; i + j < 4; i++) {
			if (!(i === 1 && j === 1)) tris.push([at(i, j), at(i + 1, j), at(i, j + 1)]);
			if (i + j < 3) tris.push([at(i + 1, j), at(i + 1, j + 1), at(i, j + 1)]);
		}
	const K = new SimplicialComplex(tris.map((t) => t.map(([v]) => v)));
	const L = buildFlat(K, { tris }, { scale: 104 });
	const rim: number[] = [];
	for (let i = 0; i < 4; i++) rim.push(lab(i, 0));
	for (let j = 0; j < 4; j++) rim.push(lab(4 - j, j));
	for (let j = 4; j > 0; j--) rim.push(lab(0, j));
	const c = [at(1, 1), at(2, 1), at(1, 2)].map(([, p]) => p);
	return {
		id: 'holed-triangle',
		name: 'Triangle with a hole',
		space: 'S^1 \\times I',
		K,
		L,
		hole,
		holeCentre: [(c[0][0] + c[1][0] + c[2][0]) / 3, (c[0][1] + c[1][1] + c[2][1]) / 3],
		cycles: [
			{ name: 'rim', tex: '\\rho', k: 1, chain: loopChain(K, rim), color: 'gold' },
			{ name: 'hug', tex: '\\eta', k: 1, chain: loopChain(K, hole), color: 'gold' }
		]
	};
}

/**
 * Winding number of an integer 1-cycle around a point of the plane (layout
 * coordinates), from the angles its edges subtend there. Every edge must miss the point.
 */
export function windingAround(L: FlatLayout, z: Chain, centre: Pt): number {
	let total = 0;
	const seen = new Set<number>();
	for (const d of L.edges) {
		if (!z[d.e] || seen.has(d.e)) continue;
		seen.add(d.e);
		const a = L.verts[d.a].q;
		const b = L.verts[d.b].q;
		let th = Math.atan2(b[1] - centre[1], b[0] - centre[0]) - Math.atan2(a[1] - centre[1], a[0] - centre[0]);
		while (th > Math.PI) th -= 2 * Math.PI;
		while (th <= -Math.PI) th += 2 * Math.PI;
		total += z[d.e] * th;
	}
	return Math.round(total / (2 * Math.PI));
}

/**
 * Winding number of an integer 1-cycle on the annulus: signed number of times
 * it crosses a fixed ray from the centre (counterclockwise = +1). This is a
 * cocycle: it vanishes on the boundary of every triangle.
 */
export function annulusWinding(K: SimplicialComplex, z: Chain): number {
	const ray = Math.PI / 2 + (0.25 * 2 * Math.PI) / ANNULUS_N;
	let w = 0;
	K.simplices[1].forEach(([a, b], i) => {
		if (!z[i]) return;
		const ta = annulusAngle(a);
		let d = annulusAngle(b) - ta;
		while (d > Math.PI) d -= 2 * Math.PI;
		while (d <= -Math.PI) d += 2 * Math.PI;
		let r = ray - ta;
		while (r < 0) r += 2 * Math.PI;
		while (r >= 2 * Math.PI) r -= 2 * Math.PI;
		if (d > 0 && r > 0 && r < d) w += z[i];
		if (d < 0 && r > 2 * Math.PI + d && r < 2 * Math.PI) w -= z[i];
	});
	return w;
}
