// Data and small computations behind the figures of §2.5 "Simplicial Complexes".
// Everything a figure displays as a fact is computed here and checked in data.test.ts.
import { SimplicialComplex } from '$lib/math/complex';

export type V2 = [number, number];
export type V3 = [number, number, number];

/** Binomial coefficient C(n, k). */
export function binom(n: number, k: number): number {
	if (k < 0 || k > n) return 0;
	let r = 1;
	for (let i = 1; i <= k; i++) r = (r * (n - i + 1)) / i;
	return Math.round(r);
}

/** The n-simplex as a complex on vertices 0..n (all faces included). */
export function simplexComplex(n: number): SimplicialComplex {
	return new SimplicialComplex([Array.from({ length: n + 1 }, (_, i) => i)]);
}

/**
 * Where to draw the vertices of Δⁿ in 3D for the simplex gallery (n = 0..4).
 * Δ⁴ cannot fit in 3D without overlaps; we draw a "shadow": a triangular
 * bipyramid whose two apexes are joined by an edge through the middle.
 */
export function simplexPositions(n: number): V3[] {
	const s3 = Math.sqrt(3);
	switch (n) {
		case 0:
			return [[0, 0, 0]];
		case 1:
			return [
				[-1.25, -0.2, 0.25],
				[1.25, 0.2, -0.25]
			];
		case 2:
			return [
				[-1.3, -0.75, 0.35],
				[1.3, -0.75, 0.35],
				[0, 1.25, -0.25]
			];
		case 3: {
			const r = 1.45;
			const a = r / s3;
			return [
				[a, a, a],
				[a, -a, -a],
				[-a, a, -a],
				[-a, -a, a]
			];
		}
		default: {
			// triangular bipyramid (projection of the regular 4-simplex), tilted so the
			// axis edge is visible
			const R = 1.35;
			const pts: V3[] = [];
			for (let i = 0; i < 3; i++) {
				const t = (i / 3) * Math.PI * 2 + 0.3;
				pts.push([R * Math.cos(t), -0.1, R * Math.sin(t)]);
			}
			pts.push([0.22, 1.45, 0.12], [-0.22, -1.6, -0.12]);
			return pts;
		}
	}
}

// ── the square torus, triangulated by an n × n grid ─────────────────────────

/**
 * Label of the grid point (i, j) on the n × n torus: i + n·j, with both
 * coordinates read modulo n (so the right column repeats the left one and the
 * top row repeats the bottom one).
 */
export function gridLabel(i: number, j: number, n: number): number {
	const a = ((i % n) + n) % n;
	const b = ((j % n) + n) % n;
	return a + n * b;
}

export interface GridSimplex {
	/** grid coordinates of the corners (not reduced mod n) */
	corners: V2[];
	/** vertex labels of the corners */
	labels: number[];
	/** label set as a sorted key, e.g. "0,1,4" */
	key: string;
}

const sortedKey = (ls: number[]) => [...ls].sort((a, b) => a - b).join(',');

/**
 * The edges and triangles of the n × n grid on the square, before gluing:
 * each unit square [i,i+1]×[j,j+1] is cut by the diagonal from (i,j) to (i+1,j+1).
 */
export function gridPieces(n: number): { edges: GridSimplex[]; triangles: GridSimplex[] } {
	const L = (p: V2) => gridLabel(p[0], p[1], n);
	const mk = (corners: V2[]): GridSimplex => {
		const labels = corners.map(L);
		return { corners, labels, key: sortedKey(labels) };
	};
	const edges: GridSimplex[] = [];
	const triangles: GridSimplex[] = [];
	for (let j = 0; j < n; j++)
		for (let i = 0; i < n; i++) {
			// each square owns its bottom edge, its left edge and its diagonal; the top and
			// right edges belong to the neighbouring squares (after gluing)
			edges.push(mk([[i, j], [i + 1, j]]));
			edges.push(mk([[i, j], [i, j + 1]]));
			edges.push(mk([[i, j], [i + 1, j + 1]]));
			triangles.push(mk([[i, j], [i + 1, j], [i + 1, j + 1]]));
			triangles.push(mk([[i, j], [i + 1, j + 1], [i, j + 1]]));
		}
	return { edges, triangles };
}

/**
 * What goes wrong (if anything) when the n × n grid is glued into a torus:
 * pairs of different edges with the same two endpoints, and different triangles
 * with the same three corners, plus "edges" whose two ends are the same vertex.
 */
export function gridDefects(n: number) {
	const { edges, triangles } = gridPieces(n);
	const group = (xs: GridSimplex[]) => {
		const m = new Map<string, number[]>();
		xs.forEach((x, i) => m.set(x.key, [...(m.get(x.key) ?? []), i]));
		return [...m.values()].filter((v) => v.length > 1);
	};
	const loops = edges.map((e, i) => (e.labels[0] === e.labels[1] ? i : -1)).filter((i) => i >= 0);
	const degenerateTriangles = triangles
		.map((t, i) => (new Set(t.labels).size < 3 ? i : -1))
		.filter((i) => i >= 0);
	return {
		vertices: n * n,
		edgeCount: edges.length,
		triangleCount: triangles.length,
		/** groups of (indices of) different edges that join the same two vertices */
		duplicateEdges: group(edges),
		/** groups of (indices of) different triangles with the same three corners */
		duplicateTriangles: group(triangles),
		loops,
		degenerateTriangles,
		/** how many distinct vertex pairs / triples are even available */
		availablePairs: binom(n * n, 2),
		availableTriples: binom(n * n, 3)
	};
}

/** The glued n × n grid as a simplicial complex (valid for n ≥ 3). */
export function gridTorus(n: number): SimplicialComplex {
	return new SimplicialComplex(gridPieces(n).triangles.map((t) => t.labels));
}

// ── the 7-vertex (Möbius) torus ─────────────────────────────────────────────

/** Triangles of the 7-vertex torus: {i, i+1, i+3} and {i, i+2, i+3} mod 7. */
export function torus7Triangles(): number[][] {
	const t: number[][] = [];
	for (let i = 0; i < 7; i++) {
		t.push([i, (i + 1) % 7, (i + 3) % 7]);
		t.push([i, (i + 2) % 7, (i + 3) % 7]);
	}
	return t;
}

/** Label of the triangular-lattice point a·e₁ + b·e₂: (a + 3b) mod 7. */
export function latticeLabel(a: number, b: number): number {
	return (((a + 3 * b) % 7) + 7) % 7;
}

/** Position in the plane of the lattice point a·e₁ + b·e₂ (unit edge length). */
export function latticePoint(a: number, b: number): V2 {
	return [a + b / 2, (b * Math.sqrt(3)) / 2];
}

/**
 * Coordinates (u, v) (read modulo 1) on the standard torus for the lattice point (a, b).
 * The lattice of repeats is spanned by (1, 2) and (−3, 1) (determinant 7); the
 * linear map M = (1/7)[[1, 3], [3, 2]] (determinant −1/7) sends it onto ℤ², so the
 * triangulated plane wraps exactly onto the torus. Among such maps this one makes
 * the three edge directions most nearly equal in length on a torus with R = 2r.
 */
export function latticeUV(a: number, b: number): V2 {
	return [(a + 3 * b) / 7, (3 * a + 2 * b) / 7];
}

/**
 * Császár's polyhedron: an embedding of the 7-vertex torus in space with flat
 * triangles and straight edges. Coordinates and triangles as given by
 * F. H. Lutz, "Enumeration and random realization of triangulated surfaces"
 * (arXiv math/0506316), Figure 5, with Lutz's labels 1..7.
 */
export const CSASZAR = {
	coords: [
		[3, -3, 0],
		[-3, 3, 0],
		[-3, -3, 1],
		[3, 3, 1],
		[-1, -2, 3],
		[1, 2, 3],
		[0, 0, 15]
	] as V3[],
	triangles: '123 145 156 345 167 467 247 124 236 256 346 257 357 137'
		.split(' ')
		.map((s) => s.split('').map(Number)),
	/** Lutz label L (1..7) ↦ our label toTorus7[L − 1] (an isomorphism onto torus7Triangles) */
	toTorus7: [0, 1, 5, 3, 2, 6, 4]
};

/** Császár coordinates indexed by our torus7 labels 0..6. */
export function csaszarByLabel(): V3[] {
	const out: V3[] = new Array(7);
	CSASZAR.coords.forEach((c, i) => (out[CSASZAR.toTorus7[i]] = c));
	return out;
}

// ── the 6-vertex projective plane ───────────────────────────────────────────

/**
 * The standard picture of the 6-vertex ℝP²: a disk whose boundary circle has
 * opposite (antipodal) points glued. Vertex 0 sits in the centre; vertices
 * 1..5 sit on the circle at every other corner of a regular decagon; the
 * corners in between carry copies of the same five labels, so that opposite
 * corners carry the same label.
 *
 * Returns the 11 drawn nodes (node 0 = centre, nodes 1..10 = decagon corners in
 * counter-clockwise order starting at the top) with their labels, the 10 drawn
 * triangles (as node triples) and the triangles as label triples.
 */
export function rp2Picture(R = 1) {
	const nodes: { label: number; pos: V2 }[] = [{ label: 0, pos: [0, 0] }];
	for (let k = 0; k < 10; k++) {
		const ang = Math.PI / 2 + (k * Math.PI) / 5;
		// even k: pentagon vertex 1 + k/2; odd k: apex between pentagon vertices
		// i = 1 + (k−1)/2 and i + 1, labelled with the vertex "opposite" that edge
		const label = k % 2 === 0 ? 1 + k / 2 : ((1 + (k - 1) / 2 + 2) % 5) + 1;
		nodes.push({ label, pos: [R * Math.cos(ang), R * Math.sin(ang)] });
	}
	const tris: [number, number, number][] = [];
	for (let k = 0; k < 10; k += 2) {
		const a = 1 + k; // pentagon vertex node
		const b = 1 + ((k + 2) % 10); // next pentagon vertex node
		const apex = 1 + ((k + 1) % 10);
		tris.push([0, a, b]);
		tris.push([a, apex, b]);
	}
	return {
		nodes,
		triangles: tris,
		labelTriangles: tris.map((t) => t.map((i) => nodes[i].label))
	};
}

// ── barycentric subdivision ─────────────────────────────────────────────────

export interface Subdivided {
	complex: SimplicialComplex;
	/** new vertex id ↦ the simplex of the old complex whose barycentre it is */
	origin: number[][];
	/** new vertex id ↦ position (if positions were given) */
	pos: V2[];
}

function permutations<T>(xs: T[]): T[][] {
	if (xs.length <= 1) return [xs.slice()];
	const out: T[][] = [];
	xs.forEach((x, i) => {
		for (const p of permutations([...xs.slice(0, i), ...xs.slice(i + 1)])) out.push([x, ...p]);
	});
	return out;
}

/**
 * Barycentric subdivision: one new vertex at the barycentre of every simplex,
 * and one new simplex for every chain σ₀ ⊂ σ₁ ⊂ … ⊂ σₖ of faces.
 */
export function barycentricSubdivision(K: SimplicialComplex, pos?: (v: number) => V2): Subdivided {
	const origin: number[][] = [];
	const id = new Map<string, number>();
	for (const dimList of K.simplices)
		for (const s of dimList) {
			id.set(s.join(','), origin.length);
			origin.push(s);
		}
	const top: number[][] = [];
	for (const m of K.maximal()) {
		for (const p of permutations(m)) {
			const chain: number[] = [];
			for (let k = 1; k <= p.length; k++) chain.push(id.get([...p.slice(0, k)].sort((a, b) => a - b).join(','))!);
			top.push(chain);
		}
	}
	const complex = new SimplicialComplex(top);
	const P: V2[] = origin.map((s) => {
		if (!pos) return [0, 0];
		const x = s.reduce((a, v) => a + pos(v)[0], 0) / s.length;
		const y = s.reduce((a, v) => a + pos(v)[1], 0) / s.length;
		return [x, y];
	});
	return { complex, origin, pos: P };
}

// ── orientation ─────────────────────────────────────────────────────────────

/** Number of swaps' parity: 0 for an even arrangement, 1 for an odd one. */
export function permutationParity(order: number[]): 0 | 1 {
	let inv = 0;
	for (let i = 0; i < order.length; i++) for (let j = i + 1; j < order.length; j++) if (order[i] > order[j]) inv++;
	return (inv % 2) as 0 | 1;
}
