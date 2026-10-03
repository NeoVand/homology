// The homology calculator: a gallery of complexes, a parser for complexes the
// reader types in, an automatic picture for those, and everything we compute.
import { SimplicialComplex, isClosedSurface, isOrientable } from '$lib/math/complex';
import { smith, rankZ2 } from '$lib/math/linalg';
import { homology, Z2HomologyBasis, type HomologyGroup } from '$lib/math/homology';
import { mulberry32 } from '$lib/math/persistence';
import * as C from '../homology-groups/complexes';
import { buildFlat, type DV, type FlatLayout, type Pt } from '../homology-groups/flat';
import { bettiModP } from '../homology-groups/chains';
import { wrappedDisk } from './spaces';

export type View3D = 'torus' | 'klein' | 'rp2' | 'mobius' | 'sphere' | 'ball';

export interface CalcEntry {
	id: string;
	label: string;
	make: () => C.Example;
	view3d?: View3D;
}

export const gallery: CalcEntry[] = [
	{ id: 'point', label: 'Point', make: C.point },
	{ id: 'circle', label: 'Circle', make: C.hollowTriangle },
	{ id: 'disk', label: 'Disk', make: C.filledTriangle },
	{ id: 'figure-eight', label: 'Figure eight', make: C.figureEight },
	{ id: 'sphere', label: 'Sphere', make: C.hollowTetrahedron, view3d: 'sphere' },
	{ id: 'torus', label: 'Torus', make: C.torusGrid, view3d: 'torus' },
	{ id: 'klein', label: 'Klein bottle', make: C.kleinGrid, view3d: 'klein' },
	{ id: 'rp2', label: 'ℝP²', make: C.projectivePlane, view3d: 'rp2' },
	{ id: 'mobius', label: 'Möbius band', make: C.mobiusBand, view3d: 'mobius' },
	{ id: 'genus2', label: 'Genus 2', make: C.genus2 },
	{ id: 'ball', label: 'Ball', make: C.solidTetrahedron, view3d: 'ball' },
	{ id: 'wrap3', label: 'Triple wrap', make: () => wrappedDisk(3) }
];

// ── parsing ────────────────────────────────────────────────────────────────

export interface Parsed {
	facets: number[][];
	error?: string;
}

/**
 * Facets separated by commas, semicolons or new lines. A facet is written
 * either as run-together digits ("012" = [0,1,2], single-digit labels only),
 * as numbers separated by spaces ("10 11 12"), or in brackets ("[10,11,12]").
 */
export function parseFacets(text: string, limits = { vertices: 40, simplices: 400, dim: 3 }): Parsed {
	const facets: number[][] = [];
	let rest = text.replace(/\[([^\]]*)\]/g, (_, inner: string) => {
		const nums = inner
			.split(/[\s,;]+/)
			.filter(Boolean)
			.map(Number);
		facets.push(nums);
		return ',';
	});
	rest = rest.replace(/[()]/g, ' ');
	for (const chunk of rest.split(/[,;\n]+/)) {
		const t = chunk.trim();
		if (!t) continue;
		if (/\s/.test(t)) facets.push(t.split(/\s+/).map(Number));
		else if (/^\d+$/.test(t)) facets.push(t.split('').map(Number));
		else return { facets: [], error: `I could not read "${t}". Write facets like 012, 0 1 2 or [10,11,12].` };
	}
	for (const f of facets) {
		if (f.some((x) => !Number.isInteger(x) || x < 0)) return { facets: [], error: 'Vertex labels must be whole numbers 0, 1, 2, …' };
		if (new Set(f).size !== f.length) return { facets: [], error: `A simplex cannot repeat a vertex: [${f.join(',')}].` };
		if (f.length - 1 > limits.dim) return { facets: [], error: `Dimension at most ${limits.dim}, please: [${f.join(',')}] is too big.` };
	}
	const verts = new Set(facets.flat());
	if (verts.size > limits.vertices) return { facets: [], error: `At most ${limits.vertices} vertices, please.` };
	if (!facets.length) return { facets: [], error: 'Type at least one simplex.' };
	return { facets };
}

/** Text form of a complex's maximal simplices, for the editor. */
export function facetsText(K: SimplicialComplex): string {
	const fmt = (s: number[]) => (s.every((v) => v < 10) ? s.join('') : `[${s.join(',')}]`);
	return K.maximal()
		.sort((a, b) => a.length - b.length || a.join().localeCompare(b.join()))
		.map(fmt)
		.join(', ');
}

// ── automatic picture ──────────────────────────────────────────────────────

/** A deterministic spring layout of the 1-skeleton, then a flat picture. */
export function autoLayout(K: SimplicialComplex): FlatLayout {
	const vs = K.vertices;
	const n = vs.length;
	const idx = new Map(vs.map((v, i) => [v, i]));
	const P: Pt[] = vs.map((_, i) => {
		const a = (2 * Math.PI * i) / Math.max(1, n) + 0.3;
		return [2 * Math.cos(a), 2 * Math.sin(a)];
	});
	const rnd = mulberry32(7);
	for (const p of P) {
		p[0] += (rnd() - 0.5) * 0.05;
		p[1] += (rnd() - 0.5) * 0.05;
	}
	const E = (K.simplices[1] ?? []).map(([a, b]) => [idx.get(a)!, idx.get(b)!]);
	const k = 1.3;
	for (let it = 0; it < 400; it++) {
		const temp = 0.25 * (1 - it / 400) + 0.01;
		const D: Pt[] = P.map(() => [0, 0]);
		for (let i = 0; i < n; i++)
			for (let j = i + 1; j < n; j++) {
				const dx = P[i][0] - P[j][0];
				const dy = P[i][1] - P[j][1];
				const d = Math.max(0.05, Math.hypot(dx, dy));
				const f = (k * k) / d;
				D[i][0] += (dx / d) * f;
				D[i][1] += (dy / d) * f;
				D[j][0] -= (dx / d) * f;
				D[j][1] -= (dy / d) * f;
			}
		for (const [i, j] of E) {
			const dx = P[i][0] - P[j][0];
			const dy = P[i][1] - P[j][1];
			const d = Math.max(0.05, Math.hypot(dx, dy));
			const f = (d * d) / k;
			D[i][0] -= (dx / d) * f;
			D[i][1] -= (dy / d) * f;
			D[j][0] += (dx / d) * f;
			D[j][1] += (dy / d) * f;
		}
		for (let i = 0; i < n; i++) {
			const d = Math.hypot(D[i][0], D[i][1]) || 1;
			const step = Math.min(d, temp * 4);
			P[i][0] += (D[i][0] / d) * step;
			P[i][1] += (D[i][1] / d) * step;
		}
	}
	// normalise to a box of half-width 2.4
	const xs = P.map((p) => p[0]);
	const ys = P.map((p) => p[1]);
	const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
	const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
	const s = 2.4 / Math.max(1e-6, Math.max(...xs) - cx, Math.max(...ys) - cy, 0.6);
	const Q: Pt[] = P.map(([x, y]) => [(x - cx) * s, (y - cy) * s]);
	const dv = (v: number): DV => [v, Q[idx.get(v)!]];
	return buildFlat(
		K,
		{
			tris: (K.simplices[2] ?? []).map((t) => t.map(dv) as [DV, DV, DV]),
			edges: (K.simplices[1] ?? []).map((e) => e.map(dv) as [DV, DV]),
			points: vs.map(dv)
		},
		{ scale: 56 }
	);
}

// ── everything we compute ──────────────────────────────────────────────────

export interface Summary {
	f: number[];
	chi: number;
	/** rank of ∂_k over ℚ and over ℤ/2, for k = 1 … dim */
	ranksQ: number[];
	ranksZ2: number[];
	/** invariant factors of ∂_k (k = 1 … dim): count of 1s and the others */
	invariant: { ones: number; others: number[] }[];
	Z: HomologyGroup[];
	Q: number[];
	Z2: number[];
	Z3: number[];
	closed: boolean;
	orientable: boolean | null;
	/** mod-2 generators in each dimension k ≥ 1, as lists of k-simplex indices */
	gens: number[][][];
}

export function summarize(K: SimplicialComplex, preferred: number[][] = []): Summary {
	const dim = K.dim;
	const ranksQ: number[] = [];
	const ranksZ2: number[] = [];
	const invariant: { ones: number; others: number[] }[] = [];
	for (let k = 1; k <= dim; k++) {
		const M = K.boundaryMatrix(k);
		const sm = smith(M);
		ranksQ.push(sm.rank);
		ranksZ2.push(rankZ2(M));
		invariant.push({ ones: sm.diagonal.filter((d) => d === 1).length, others: sm.diagonal.filter((d) => d !== 1) });
	}
	const gens: number[][][] = [[]];
	for (let k = 1; k <= dim; k++) {
		const H = new Z2HomologyBasis(K, k, k === 1 ? preferred : []);
		gens.push(H.generators);
	}
	const closed = dim === 2 && isClosedSurface(K);
	return {
		f: K.fVector,
		chi: K.eulerCharacteristic(),
		ranksQ,
		ranksZ2,
		invariant,
		Z: homology(K, 'Z'),
		Q: homology(K, 'Q').map((g) => g.rank),
		Z2: homology(K, 'Z2').map((g) => g.rank),
		Z3: bettiModP(K, 3),
		closed,
		orientable: closed ? isOrientable(K) : null,
		gens
	};
}
