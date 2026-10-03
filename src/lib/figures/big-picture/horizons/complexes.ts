// Small planar complexes for the Hodge-theory figures.
import { SimplicialComplex } from '$lib/math/complex';

export interface Planar {
	K: SimplicialComplex;
	/** vertex positions in figure units, indexed by vertex id */
	pos: [number, number][];
	/** centres of the holes (for labels) */
	holes: [number, number][];
}

/**
 * A triangulated annulus: n inner vertices (ids 0…n−1) and n outer vertices
 * (ids n…2n−1), the outer ring rotated by half a step. b₁ = 1.
 */
export function annulus(n = 10, cx = 0, cy = 0, r0 = 0.42, r1 = 1): Planar {
	const pos: [number, number][] = [];
	for (let i = 0; i < n; i++) {
		const a = (2 * Math.PI * i) / n - Math.PI / 2;
		pos.push([cx + r0 * Math.cos(a), cy + r0 * Math.sin(a)]);
	}
	for (let i = 0; i < n; i++) {
		const a = (2 * Math.PI * (i + 0.5)) / n - Math.PI / 2;
		pos.push([cx + r1 * Math.cos(a), cy + r1 * Math.sin(a)]);
	}
	const tris: number[][] = [];
	for (let i = 0; i < n; i++) {
		const j = (i + 1) % n;
		tris.push([i, j, n + i]);
		tris.push([j, n + i, n + j]);
	}
	return { K: new SimplicialComplex(tris), pos, holes: [[cx, cy]] };
}

/**
 * A grid of cols × rows unit squares, each cut into two triangles, with some
 * squares left out (the holes). Vertex (i, j) has id j·(cols+1) + i.
 */
export function gridWithHoles(cols: number, rows: number, holes: [number, number][], s = 1): Planar {
	const id = (i: number, j: number) => j * (cols + 1) + i;
	const pos: [number, number][] = [];
	for (let j = 0; j <= rows; j++) for (let i = 0; i <= cols; i++) pos.push([i * s, j * s]);
	const isHole = (i: number, j: number) => holes.some(([a, b]) => a === i && b === j);
	const tris: number[][] = [];
	const edges: number[][] = [];
	for (let j = 0; j < rows; j++)
		for (let i = 0; i < cols; i++) {
			const a = id(i, j);
			const b = id(i + 1, j);
			const c = id(i + 1, j + 1);
			const d = id(i, j + 1);
			if (isHole(i, j)) {
				edges.push([a, b], [b, c], [c, d], [a, d]);
				continue;
			}
			// alternate the diagonal for a symmetric look
			if ((i + j) % 2 === 0) tris.push([a, b, c], [a, c, d]);
			else tris.push([a, b, d], [b, c, d]);
		}
	return {
		K: new SimplicialComplex([...tris, ...edges]),
		pos,
		holes: holes.map(([i, j]) => [(i + 0.5) * s, (j + 0.5) * s])
	};
}

/** Two square holes in a 6 × 3 grid (b₁ = 2). */
export const twoHoles = () => gridWithHoles(6, 3, [
	[1, 1],
	[4, 1]
]);
