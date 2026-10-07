// Poincaré duality on small surfaces: cap products with the fundamental class,
// dual cell decompositions drawn from the barycentric subdivision, and the
// Betti-number catalogue used in the chapter.
import type { Chain, Cochain, Delta2 } from '../cup-product/cup';
import { triVerts } from '../cup-product/cup';
import { glueFlat, type FlatModel, type Pt } from '../cup-product/flat';

// ── cap products (front face is eaten by the cochain, back face is kept) ──────

/** c ⌢ φ for a 2-chain c and a 1-cochain φ:  [v0,v1,v2] ⌢ φ = φ([v0,v1]) · [v1,v2]. */
export function cap21(D: Delta2, c: Chain, phi: Cochain): Chain {
	const out = new Array<number>(D.edges.length).fill(0);
	D.tris.forEach(([f, b], t) => {
		const x = (c[t] ?? 0) * (phi[f] ?? 0);
		if (x) out[b] += x;
	});
	return out.map((x) => x || 0);
}

/** c ⌢ f for a 2-chain c and a 0-cochain f:  [v0,v1,v2] ⌢ f = f(v0) · [v0,v1,v2]. */
export function cap20(D: Delta2, c: Chain, f: Cochain): Chain {
	return D.tris.map((_, t) => (c[t] ?? 0) * f[triVerts(D, t)[0]] || 0);
}

/** c ⌢ ω for a 2-chain c and a 2-cochain ω:  [v0,v1,v2] ⌢ ω = ω([v0,v1,v2]) · [v2]. */
export function cap22(D: Delta2, c: Chain, w: Cochain): Chain {
	const out = new Array<number>(D.nV).fill(0);
	D.tris.forEach((_, t) => {
		const x = (c[t] ?? 0) * (w[t] ?? 0);
		if (x) out[triVerts(D, t)[2]] += x;
	});
	return out.map((x) => x || 0);
}

// ── dual cells ───────────────────────────────────────────────────────────────

const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
const bary = ([a, b, c]: [Pt, Pt, Pt]): Pt => [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3];
const same = (a: Pt, b: Pt) => Math.abs(a[0] - b[0]) < 1e-9 && Math.abs(a[1] - b[1]) < 1e-9;

export interface DualCells {
	/** dual vertex of triangle t: its barycentre */
	dualVertex: Pt[];
	/** dual edge of edge e, as half-segments [barycentre, midpoint of a flat copy of e] */
	dualEdge: [Pt, Pt][][];
	/** dual face of vertex v, as the kites [v, mid(e₁), barycentre, mid(e₂)] of the barycentric subdivision */
	dualFace: Pt[][][];
	/** midpoints of the flat copies of each edge */
	edgeMid: Pt[][];
}

/**
 * The dual cell decomposition of a flat triangulated surface, built from its
 * barycentric subdivision: the dual cell of a k-simplex σ is the union of the
 * small simplices [σ̂, …] that have the barycentre of σ as their "first" corner.
 */
export function dualCells(M: FlatModel): DualCells {
	const { D, triPts, edgeSegs } = M;
	const dualVertex = triPts.map(bary);
	const dualEdge: [Pt, Pt][][] = D.edges.map(() => []);
	const dualFace: Pt[][][] = Array.from({ length: D.nV }, () => []);
	const edgeMid = edgeSegs.map((segs) => segs.map((s) => mid(s.a, s.b)));
	// which flat segment of edge e is a side of flat triangle t?
	const sideOf = (e: number, P: Pt, Q: Pt) =>
		edgeSegs[e].find((s) => (same(s.a, P) && same(s.b, Q)) || (same(s.a, Q) && same(s.b, P)))!;
	D.tris.forEach(([f, b, l], t) => {
		const [P0, P1, P2] = triPts[t];
		const B = dualVertex[t];
		const m01 = mid(P0, P1);
		const m12 = mid(P1, P2);
		const m02 = mid(P0, P2);
		for (const [e, P, Q] of [
			[f, P0, P1],
			[b, P1, P2],
			[l, P0, P2]
		] as [number, Pt, Pt][]) {
			const s = sideOf(e, P, Q);
			dualEdge[e].push([B, mid(s.a, s.b)]);
		}
		const [v0, v1, v2] = triVerts(D, t);
		dualFace[v0].push([P0, m01, B, m02]);
		dualFace[v1].push([P1, m12, B, m01]);
		dualFace[v2].push([P2, m02, B, m12]);
	});
	return { dualVertex, dualEdge, dualFace, edgeMid };
}

/** A hexagonal patch of the triangular lattice (radius r): an ordinary planar triangulated disk. */
export function hexPatch(r = 2, scale = 1): FlatModel {
	const e1: Pt = [scale, 0];
	const e2: Pt = [scale / 2, (scale * Math.sqrt(3)) / 2];
	const inHex = (a: number, b: number) => Math.max(Math.abs(a), Math.abs(b), Math.abs(a + b)) <= r;
	const P = (a: number, b: number): Pt => [a * e1[0] + b * e2[0], a * e1[1] + b * e2[1]];
	const tris: [Pt, Pt, Pt][] = [];
	for (let a = -r; a <= r; a++)
		for (let b = -r; b <= r; b++) {
			if (inHex(a, b) && inHex(a + 1, b) && inHex(a, b + 1)) tris.push([P(a, b), P(a + 1, b), P(a, b + 1)]);
			if (inHex(a + 1, b) && inHex(a, b + 1) && inHex(a + 1, b + 1)) tris.push([P(a + 1, b), P(a + 1, b + 1), P(a, b + 1)]);
		}
	const corners: Pt[] = [P(r, 0), P(0, r), P(-r, r), P(-r, 0), P(0, -r), P(r, -r)];
	return glueFlat(corners, [], tris, 'sorted');
}

// ── Betti numbers that read the same backwards ──────────────────────────────

export interface BettiEntry {
	id: string;
	name: string;
	/** TeX name */
	tex: string;
	/** dimension of the space (top degree) */
	n: number;
	/** Betti numbers over ℚ */
	b: number[];
	/** Betti numbers over ℤ/2 (when they differ from b) */
	b2?: number[];
	closed: boolean;
	orientable: boolean;
	/** one sentence (may contain \( \) math) */
	note: string;
}

export const bettiCatalogue: BettiEntry[] = [
	{ id: 's2', name: 'Sphere', tex: 'S^2', n: 2, b: [1, 0, 1], closed: true, orientable: true, note: 'One component, no loops, one enclosed void.' },
	{ id: 't2', name: 'Torus', tex: 'T^2', n: 2, b: [1, 2, 1], closed: true, orientable: true, note: 'The middle number is matched with itself: the two loops cross once, so the fence of each one detects the other.' },
	{ id: 'g2', name: 'Genus two', tex: '\\Sigma_2', n: 2, b: [1, 4, 1], closed: true, orientable: true, note: 'In general \\(\\Sigma_g\\) has \\(1, 2g, 1\\): the middle number is matched with itself.' },
	{ id: 'rp2', name: 'Projective plane', tex: '\\RP^2', n: 2, b: [1, 0, 0], b2: [1, 1, 1], closed: true, orientable: false, note: 'Not orientable: over \\(\\Q\\) the mirror fails (\\(1,0,0\\)), but over \\(\\Z/2\\) it holds (\\(1,1,1\\)).' },
	{ id: 'klein', name: 'Klein bottle', tex: 'K', n: 2, b: [1, 1, 0], b2: [1, 2, 1], closed: true, orientable: false, note: 'Over \\(\\Q\\): \\(1,1,0\\) — no mirror. Over \\(\\Z/2\\): \\(1,2,1\\), a perfect palindrome.' },
	{ id: 's3', name: '3-sphere', tex: 'S^3', n: 3, b: [1, 0, 0, 1], closed: true, orientable: true, note: 'Odd dimension: the alternating sum \\(1-0+0-1\\) cancels in pairs.' },
	{ id: 't3', name: '3-torus', tex: 'T^3', n: 3, b: [1, 3, 3, 1], closed: true, orientable: true, note: 'Three loops, three “walls”: \\(b_1 = b_2 = 3\\).' },
	{ id: 's1s2', name: 'S¹ × S²', tex: 'S^1\\times S^2', n: 3, b: [1, 1, 1, 1], closed: true, orientable: true, note: 'The loop \\(S^1\\times\\{pt\\}\\) meets the sphere \\(\\{pt\\}\\times S^2\\) once, so \\(b_1\\) and \\(b_2\\) detect each other.' },
	{ id: 'rp3', name: 'Projective 3-space', tex: '\\RP^3', n: 3, b: [1, 0, 0, 1], b2: [1, 1, 1, 1], closed: true, orientable: true, note: 'Orientable, with torsion \\(H_1 = \\Z/2\\) hiding from the rational Betti numbers.' },
	{ id: 'cp2', name: 'Complex projective plane', tex: '\\CP^2', n: 4, b: [1, 0, 1, 0, 1], closed: true, orientable: true, note: 'One cell in each even dimension. The middle class has self-intersection \\(1\\).' },
	{ id: 's2s2', name: 'S² × S²', tex: 'S^2\\times S^2', n: 4, b: [1, 0, 2, 0, 1], closed: true, orientable: true, note: 'The spheres \\(S^2\\times\\{pt\\}\\) and \\(\\{pt\\}\\times S^2\\) meet once, and each can be pushed off itself: \\(b_2 = 2\\) is matched with itself.' },
	{ id: 't4', name: '4-torus', tex: 'T^4', n: 4, b: [1, 4, 6, 4, 1], closed: true, orientable: true, note: 'Binomial coefficients \\(\\binom{4}{k}\\) — a row of Pascal’s triangle, symmetric by nature.' },
	{ id: 'wedge', name: 'Two spheres touching', tex: 'S^2\\vee S^2', n: 2, b: [1, 0, 2], closed: false, orientable: true, note: 'Not a manifold (the touching point has no disk neighbourhood): \\(1,0,2\\) is no palindrome.' },
	{ id: 'disk', name: 'Disk', tex: 'D^2', n: 2, b: [1, 0, 0], closed: false, orientable: true, note: 'A manifold with boundary: duality needs the boundary taken into account (Lefschetz duality, below).' }
];

export function isPalindrome(b: number[]): boolean {
	return b.every((x, k) => x === b[b.length - 1 - k]);
}

export function euler(b: number[]): number {
	return b.reduce((s, x, k) => s + (k % 2 ? -x : x), 0);
}
