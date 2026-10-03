// A library of standard simplicial complexes, each verified by tests
// (see examples.test.ts) to have the homology the book claims.
import { SimplicialComplex } from './complex';

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

/** A single point. */
export const point = () => new SimplicialComplex([[0]]);

/** Two points (no edge): two connected components. */
export const twoPoints = () => new SimplicialComplex([[0], [1]]);

/** An edge (interval). */
export const interval = () => new SimplicialComplex([[0, 1]]);

/** Circle as the boundary of an n-gon (default: hollow triangle). */
export const circle = (n = 3) => new SimplicialComplex(range(n).map((i) => [i, (i + 1) % n]));

/** A filled triangle (disk). */
export const disk = () => new SimplicialComplex([[0, 1, 2]]);

/** Wedge of two circles ("figure eight"), sharing vertex 0. */
export const figureEight = () =>
	new SimplicialComplex([
		[0, 1],
		[1, 2],
		[0, 2],
		[0, 3],
		[3, 4],
		[0, 4]
	]);

/** Sphere as the boundary of a tetrahedron. */
export const sphereTetra = () =>
	new SimplicialComplex([
		[0, 1, 2],
		[0, 1, 3],
		[0, 2, 3],
		[1, 2, 3]
	]);

/** Sphere as the boundary of an octahedron (vertices: ±x = 0,1; ±y = 2,3; ±z = 4,5). */
export const sphereOcta = () => {
	const tris: number[][] = [];
	for (const x of [0, 1]) for (const y of [2, 3]) for (const z of [4, 5]) tris.push([x, y, z]);
	return new SimplicialComplex(tris);
};

/** Solid tetrahedron (a 3-ball): contractible. */
export const ball = () => new SimplicialComplex([[0, 1, 2, 3]]);

/**
 * The 7-vertex (Möbius–Kantor / Császár) torus: triangles {i, i+1, i+3} and
 * {i, i+2, i+3} mod 7. Every pair of vertices is joined by an edge.
 */
export const torus7 = () => {
	const t: number[][] = [];
	for (let i = 0; i < 7; i++) {
		t.push([i, (i + 1) % 7, (i + 3) % 7]);
		t.push([i, (i + 2) % 7, (i + 3) % 7]);
	}
	return new SimplicialComplex(t);
};

/**
 * Six-vertex real projective plane (the hemi-icosahedron): 10 triangles,
 * every pair of the 6 vertices is an edge.
 */
export const projectivePlane6 = () =>
	new SimplicialComplex(
		[
			[1, 2, 3],
			[1, 3, 4],
			[1, 4, 5],
			[1, 5, 6],
			[1, 6, 2],
			[2, 3, 5],
			[3, 4, 6],
			[4, 5, 2],
			[5, 6, 3],
			[6, 2, 4]
		].map((t) => t.map((v) => v - 1))
	);

/** Five-vertex Möbius band. Its boundary is a single 5-cycle. */
export const mobius5 = () =>
	new SimplicialComplex([
		[0, 1, 2],
		[1, 2, 3],
		[2, 3, 4],
		[3, 4, 0],
		[4, 0, 1]
	]);

/**
 * A grid triangulation of the square [0,n]×[0,m] with its sides identified.
 *  - kind 'torus':  (n, j) ~ (0, j) and (i, m) ~ (i, 0)
 *  - kind 'klein':  (n, j) ~ (0, m − j) (twisted) and (i, m) ~ (i, 0)
 *  - kind 'cylinder': (n, j) ~ (0, j) only (an annulus)
 *  - kind 'mobius':   (n, j) ~ (0, m − j) only
 * (The projective plane and the sphere are not offered here: folding a coarse
 * grid that way produces degenerate triangles. Use projectivePlane6 / sphereOcta.)
 * Returns the complex plus, for each vertex, its (i, j) grid position (one representative)
 * and the triangle list in grid coordinates (for drawing the flat picture).
 */
export function gridSurface(kind: 'torus' | 'klein' | 'cylinder' | 'mobius', n = 3, m = 3) {
	const id = new Map<string, number>();
	const pos: [number, number][] = [];
	const canon = (i: number, j: number): [number, number] => {
		// apply identifications until in canonical range
		for (let guard = 0; guard < 8; guard++) {
			if (kind === 'torus') {
				i = ((i % n) + n) % n;
				j = ((j % m) + m) % m;
			} else if (kind === 'cylinder') {
				i = ((i % n) + n) % n;
			} else if (kind === 'klein') {
				if (j === m) j = 0;
				if (i === n) {
					i = 0;
					j = (m - j) % m;
				}
			} else if (kind === 'mobius') {
				if (i === n) {
					i = 0;
					j = m - j;
				}
			}
			break;
		}
		return [i, j];
	};
	const vid = (i: number, j: number) => {
		const [a, b] = canon(i, j);
		const k = `${a},${b}`;
		if (!id.has(k)) {
			id.set(k, pos.length);
			pos.push([a, b]);
		}
		return id.get(k)!;
	};
	const tris: number[][] = [];
	const flat: [number, number][][] = [];
	for (let i = 0; i < n; i++)
		for (let j = 0; j < m; j++) {
			const a: [number, number] = [i, j];
			const b: [number, number] = [i + 1, j];
			const c: [number, number] = [i + 1, j + 1];
			const d: [number, number] = [i, j + 1];
			tris.push([vid(...a), vid(...b), vid(...c)]);
			tris.push([vid(...a), vid(...c), vid(...d)]);
			flat.push([a, b, c], [a, c, d]);
		}
	return { complex: new SimplicialComplex(tris), vertexGrid: pos, flatTriangles: flat, triangles: tris };
}

export const torusGrid = (n = 3, m = 3) => gridSurface('torus', n, m).complex;
export const kleinGrid = (n = 3, m = 3) => gridSurface('klein', n, m).complex;

/**
 * Genus-2 surface: connected sum of two 7-vertex tori, removing triangle
 * {0,1,3} from each and gluing along its boundary.
 */
export const genus2 = () => {
	const A: number[][] = [];
	const B: number[][] = [];
	for (let i = 0; i < 7; i++) {
		A.push([i, (i + 1) % 7, (i + 3) % 7]);
		A.push([i, (i + 2) % 7, (i + 3) % 7]);
	}
	const removed = '0,1,3';
	const keep = A.filter((t) => [...t].sort((a, b) => a - b).join(',') !== removed);
	// second copy: vertex v ↦ v + 7, except boundary vertices 0,1,3 are shared
	const map = (v: number) => (v === 0 || v === 1 || v === 3 ? v : v + 7);
	for (const t of keep) B.push(t.map(map));
	return new SimplicialComplex([...keep, ...B]);
};

/** All named examples, for calculators and tests. */
export const examples = {
	point: { name: 'Point', make: point },
	twoPoints: { name: 'Two points', make: twoPoints },
	interval: { name: 'Interval', make: interval },
	circle: { name: 'Circle', make: () => circle(3) },
	disk: { name: 'Disk', make: disk },
	figureEight: { name: 'Figure eight', make: figureEight },
	sphere: { name: 'Sphere', make: sphereTetra },
	ball: { name: 'Solid ball', make: ball },
	torus: { name: 'Torus', make: torus7 },
	klein: { name: 'Klein bottle', make: () => kleinGrid(3, 3) },
	rp2: { name: 'Projective plane', make: projectivePlane6 },
	mobius: { name: 'Möbius band', make: mobius5 },
	genus2: { name: 'Genus-2 surface', make: genus2 }
} as const;
