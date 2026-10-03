// Persistent homology of Vietoris–Rips filtrations (dimensions 0 and 1),
// by the standard column reduction over ℤ/2 with the "clearing" optimisation.
import { BitVec } from './linalg';

export type Point = [number, number] | [number, number, number];

export interface Bar {
	dim: number;
	birth: number;
	/** Infinity for classes that never die */
	death: number;
	/** index (in `simplices`) of the simplex that created the class */
	creator: number;
	/** index of the simplex that killed it, or −1 */
	destroyer: number;
}

export interface RipsFiltration {
	points: Point[];
	/** simplices sorted by filtration value (vertices, then edges, then triangles at ties) */
	simplices: { verts: number[]; value: number }[];
	bars: Bar[];
}

function dist(a: Point, b: Point): number {
	let s = 0;
	for (let i = 0; i < a.length; i++) s += (a[i] - (b[i] ?? 0)) ** 2;
	return Math.sqrt(s);
}

/**
 * Vietoris–Rips filtration up to triangles, with edges of length ≤ maxScale.
 * An edge appears at its length; a triangle at its longest edge.
 */
export function ripsPersistence(points: Point[], maxScale: number): RipsFiltration {
	const n = points.length;
	const D: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0));
	for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) D[i][j] = D[j][i] = dist(points[i], points[j]);

	type S = { verts: number[]; value: number; dim: number };
	const simp: S[] = [];
	for (let i = 0; i < n; i++) simp.push({ verts: [i], value: 0, dim: 0 });
	const nbr: boolean[][] = Array.from({ length: n }, () => new Array<boolean>(n).fill(false));
	for (let i = 0; i < n; i++)
		for (let j = i + 1; j < n; j++)
			if (D[i][j] <= maxScale) {
				simp.push({ verts: [i, j], value: D[i][j], dim: 1 });
				nbr[i][j] = nbr[j][i] = true;
			}
	for (let i = 0; i < n; i++)
		for (let j = i + 1; j < n; j++) {
			if (!nbr[i][j]) continue;
			for (let k = j + 1; k < n; k++)
				if (nbr[i][k] && nbr[j][k]) simp.push({ verts: [i, j, k], value: Math.max(D[i][j], D[i][k], D[j][k]), dim: 2 });
		}
	simp.sort((a, b) => a.value - b.value || a.dim - b.dim);

	const index = new Map<string, number>();
	simp.forEach((s, i) => index.set(s.verts.join(','), i));
	const N = simp.length;

	// boundary columns
	const cols: (BitVec | null)[] = simp.map((s) => {
		if (s.dim === 0) return null;
		const b = new BitVec(N);
		for (let r = 0; r < s.verts.length; r++) {
			const face = s.verts.filter((_, q) => q !== r).join(',');
			b.flip(index.get(face)!);
		}
		return b;
	});

	const lowToCol = new Map<number, number>();
	const cleared = new Set<number>();
	const bars: Bar[] = [];
	const paired = new Set<number>();

	// reduce by dimension, highest first, so we can clear (twist) columns
	for (const dim of [2, 1]) {
		for (let j = 0; j < N; j++) {
			if (simp[j].dim !== dim || cleared.has(j)) continue;
			const c = cols[j]!;
			let low = c.high();
			while (low !== -1 && lowToCol.has(low)) {
				c.xor(cols[lowToCol.get(low)!]!);
				low = c.high();
			}
			if (low !== -1) {
				lowToCol.set(low, j);
				cleared.add(low); // the column of `low` is a cycle that will reduce to zero
				paired.add(low);
				paired.add(j);
				const birth = simp[low].value;
				const death = simp[j].value;
				if (death > birth) bars.push({ dim: dim - 1, birth, death, creator: low, destroyer: j });
			}
		}
	}
	// unpaired simplices create essential classes
	for (let j = 0; j < N; j++) {
		if (paired.has(j)) continue;
		const d = simp[j].dim;
		if (d === 2) continue; // no H2 tracking
		// edges that are unpaired are cycles: they would be killed by triangles beyond maxScale
		bars.push({ dim: d, birth: simp[j].value, death: Infinity, creator: j, destroyer: -1 });
	}
	bars.sort((a, b) => a.dim - b.dim || a.birth - b.birth || b.death - a.death);
	return { points, simplices: simp.map(({ verts, value }) => ({ verts, value })), bars };
}

/** The simplices present at scale ε. */
export function ripsAt(f: RipsFiltration, eps: number) {
	const edges: [number, number][] = [];
	const triangles: [number, number, number][] = [];
	for (const s of f.simplices) {
		if (s.value > eps) break;
		if (s.verts.length === 2) edges.push([s.verts[0], s.verts[1]]);
		else if (s.verts.length === 3) triangles.push([s.verts[0], s.verts[1], s.verts[2]]);
	}
	return { edges, triangles };
}

/** Betti numbers β0, β1 at scale ε, read off the barcode. */
export function bettiAt(f: RipsFiltration, eps: number): [number, number] {
	let b0 = 0;
	let b1 = 0;
	for (const b of f.bars) {
		if (b.birth <= eps && eps < b.death) {
			if (b.dim === 0) b0++;
			else if (b.dim === 1) b1++;
		}
	}
	return [b0, b1];
}

// ── sample point clouds ────────────────────────────────────────────────────

export function mulberry32(seed: number) {
	return () => {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

function gauss(rand: () => number) {
	const u = Math.max(1e-12, rand());
	const v = rand();
	return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function noisyCircle(n = 24, r = 1, noise = 0.08, seed = 7, cx = 0, cy = 0): [number, number][] {
	const rand = mulberry32(seed);
	return Array.from({ length: n }, (_, i) => {
		const t = (i / n) * Math.PI * 2 + (rand() - 0.5) * 0.25;
		return [cx + r * Math.cos(t) + gauss(rand) * noise, cy + r * Math.sin(t) + gauss(rand) * noise];
	});
}

export function twoCircles(n = 34, seed = 11): [number, number][] {
	return [
		...noisyCircle(Math.ceil(n * 0.6), 1, 0.07, seed, -1.15, 0),
		...noisyCircle(Math.floor(n * 0.4), 0.62, 0.05, seed + 1, 1.15, 0.1)
	];
}

export function figureEightCloud(n = 34, seed = 5): [number, number][] {
	const rand = mulberry32(seed);
	return Array.from({ length: n }, (_, i) => {
		const t = (i / n) * Math.PI * 2;
		const x = Math.sin(t) * 1.6;
		const y = Math.sin(t) * Math.cos(t) * 1.6;
		return [x + gauss(rand) * 0.06, y + gauss(rand) * 0.06];
	});
}

export function blobCloud(n = 26, seed = 3): [number, number][] {
	const rand = mulberry32(seed);
	return Array.from({ length: n }, () => [gauss(rand) * 0.7, gauss(rand) * 0.7]);
}
