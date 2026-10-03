// Cellular homology engine for §3.6: polygon words (one 2-cell attached along a
// word in edge letters), and the cell ladders of Sⁿ, ℝPⁿ and ℂPⁿ.
// Checked against the simplicial engine in cellular.test.ts.
import { smith } from '$lib/math/linalg';
import type { HomologyGroup } from '$lib/math/homology';

export interface Letter {
	/** the edge name, e.g. "a" or "a1" */
	name: string;
	/** +1 if the edge is traversed along its arrow, −1 if against it */
	exp: 1 | -1;
}

const SUB = '₀₁₂₃₄₅₆₇₈₉';

/**
 * Parse an edge word such as "aba^-1b^-1", "a b a' b'", "aba⁻¹b⁻¹",
 * "a1 b1 a1^-1 b1^-1 a2 …", "a₁b₁a₁⁻¹b₁⁻¹" or "abAB" (a capital letter is an inverse).
 */
export function parseWord(src: string): { letters: Letter[]; error?: string } {
	const s = src.normalize('NFC');
	const letters: Letter[] = [];
	let i = 0;
	while (i < s.length) {
		const c = s[i];
		if (/\s|·|\*|,/.test(c)) {
			i++;
			continue;
		}
		if (!/[A-Za-z]/.test(c)) return { letters, error: `I don't understand “${c}” (position ${i + 1}).` };
		let name = c.toLowerCase();
		let exp: 1 | -1 = c === c.toUpperCase() ? -1 : 1;
		i++;
		// digits / subscript digits / "_" + digits
		let digits = '';
		if (s[i] === '_') i++;
		if (s[i] === '{') {
			const close = s.indexOf('}', i);
			if (close > i) {
				digits = s.slice(i + 1, close).replace(/[^0-9]/g, '');
				i = close + 1;
			}
		}
		while (i < s.length && (/[0-9]/.test(s[i]) || SUB.includes(s[i]))) {
			digits += /[0-9]/.test(s[i]) ? s[i] : String(SUB.indexOf(s[i]));
			i++;
		}
		name += digits;
		// inverse markers
		for (;;) {
			if (s.startsWith('^-1', i)) {
				exp = (exp * -1) as 1 | -1;
				i += 3;
			} else if (s.startsWith('^{-1}', i)) {
				exp = (exp * -1) as 1 | -1;
				i += 5;
			} else if (s.startsWith('⁻¹', i)) {
				exp = (exp * -1) as 1 | -1;
				i += 2;
			} else if (s[i] === "'" || s[i] === '’' || s[i] === '′') {
				exp = (exp * -1) as 1 | -1;
				i += 1;
			} else if (s.startsWith('^1', i) || s.startsWith('¹', i)) {
				i += s.startsWith('^1', i) ? 2 : 1;
			} else break;
		}
		letters.push({ name, exp });
	}
	if (!letters.length) return { letters, error: 'Type a word, for example aba⁻¹b⁻¹.' };
	if (letters.length > 24) return { letters, error: 'Please keep the word to at most 24 letters.' };
	return { letters };
}

export function wordTeX(letters: Letter[]): string {
	return letters
		.map((l) => {
			const m = l.name.match(/^([a-z])(\d*)$/);
			const base = m ? m[1] + (m[2] ? `_{${m[2]}}` : '') : l.name;
			return l.exp === 1 ? base : `${base}^{-1}`;
		})
		.join('');
}

export interface PolygonComplex {
	letters: Letter[];
	/** distinct edge names, in order of first appearance (the 1-cells) */
	edges: string[];
	/** for each corner of the polygon (corner i sits between side i−1 and side i), its vertex class */
	cornerClass: number[];
	/** number of 0-cells */
	nVertices: number;
	/** for each 1-cell: its start and end 0-cell */
	ends: { start: number; end: number }[];
	/** cellular boundary matrices: d1 (V × E), d2 (E × 1) */
	d1: number[][];
	d2: number[][];
	/** how many times each edge occurs in the word */
	occurrences: number[];
}

/**
 * The CW complex obtained from a polygon whose sides, read counterclockwise from
 * corner 0, spell the word. Side i runs from corner i to corner i+1.
 */
export function polygonComplex(letters: Letter[]): PolygonComplex {
	const m = letters.length;
	const edges: string[] = [];
	for (const l of letters) if (!edges.includes(l.name)) edges.push(l.name);
	// union–find on corners
	const parent = Array.from({ length: m }, (_, i) => i);
	const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])));
	const union = (a: number, b: number) => {
		const ra = find(a);
		const rb = find(b);
		if (ra !== rb) parent[Math.max(ra, rb)] = Math.min(ra, rb);
	};
	// tail and head corner of each occurrence, in the edge's own direction
	const occ = edges.map(() => [] as { tail: number; head: number }[]);
	letters.forEach((l, i) => {
		const from = i;
		const to = (i + 1) % m;
		const e = edges.indexOf(l.name);
		occ[e].push(l.exp === 1 ? { tail: from, head: to } : { tail: to, head: from });
	});
	for (const list of occ)
		for (let k = 1; k < list.length; k++) {
			union(list[0].tail, list[k].tail);
			union(list[0].head, list[k].head);
		}
	// number the classes in order of first corner
	const classOfRoot = new Map<number, number>();
	const cornerClass = Array.from({ length: m }, (_, i) => {
		const r = find(i);
		if (!classOfRoot.has(r)) classOfRoot.set(r, classOfRoot.size);
		return classOfRoot.get(r)!;
	});
	const nVertices = classOfRoot.size;
	const ends = occ.map((list) => ({ start: cornerClass[list[0].tail], end: cornerClass[list[0].head] }));
	const d1 = Array.from({ length: nVertices }, () => new Array<number>(edges.length).fill(0));
	ends.forEach(({ start, end }, e) => {
		d1[end][e] += 1;
		d1[start][e] -= 1;
	});
	const d2 = edges.map((name) => [letters.filter((l) => l.name === name).reduce((s, l) => s + l.exp, 0)]);
	return { letters, edges, cornerClass, nVertices, ends, d1, d2, occurrences: occ.map((l) => l.length) };
}

/**
 * Homology of a chain complex 0 → C_top → … → C_1 → C_0 → 0 given the ranks
 * dims[k] of C_k and matrices d[k] : C_k → C_{k−1} (d[0] unused).
 *   rank H_k = dims[k] − rank d_k − rank d_{k+1},  torsion of H_k = invariant factors > 1 of d_{k+1}.
 */
export function chainComplexHomology(dims: number[], d: (number[][] | null)[]): HomologyGroup[] {
	const top = dims.length - 1;
	const sm = (k: number) => {
		const M = d[k];
		if (!M || k <= 0 || k > top || !dims[k] || !dims[k - 1]) return { rank: 0, diagonal: [] as number[] };
		return smith(M);
	};
	const out: HomologyGroup[] = [];
	for (let k = 0; k <= top; k++) {
		const rk = sm(k).rank;
		const s1 = sm(k + 1);
		out.push({ rank: dims[k] - rk - s1.rank, torsion: s1.diagonal.filter((x) => x > 1) });
	}
	return out;
}

export function polygonHomology(P: PolygonComplex): HomologyGroup[] {
	return chainComplexHomology([P.nVertices, P.edges.length, 1], [null, P.d1, P.d2]);
}

export interface SurfaceInfo {
	chi: number;
	closed: boolean;
	orientable: boolean | null;
	/** plain-text name, e.g. "torus" */
	name: string;
	/** TeX symbol, e.g. "T^2" */
	tex: string;
}

/** Identify the space (a closed surface when every edge occurs exactly twice). */
export function identifySurface(P: PolygonComplex): SurfaceInfo {
	const chi = P.nVertices - P.edges.length + 1;
	const closed = P.occurrences.every((c) => c === 2);
	if (!closed) {
		const H = polygonHomology(P);
		const contractible = H[0].rank === 1 && H[1].rank === 0 && !H[1].torsion.length && H[2].rank === 0;
		return {
			chi,
			closed,
			orientable: null,
			name: contractible ? 'a space with the homology of a point (e.g. a disk)' : 'a 2-complex that is not a closed surface',
			tex: ''
		};
	}
	const orientable = P.edges.every((name) => P.letters.filter((l) => l.name === name).reduce((s, l) => s + l.exp, 0) === 0);
	if (orientable) {
		const g = (2 - chi) / 2;
		if (g === 0) return { chi, closed, orientable, name: 'the sphere', tex: 'S^2' };
		if (g === 1) return { chi, closed, orientable, name: 'the torus', tex: 'T^2' };
		return { chi, closed, orientable, name: `the genus-${g} surface`, tex: `\\Sigma_{${g}}` };
	}
	const k = 2 - chi;
	if (k === 1) return { chi, closed, orientable, name: 'the projective plane', tex: '\\RP^2' };
	if (k === 2) return { chi, closed, orientable, name: 'the Klein bottle', tex: 'K' };
	return { chi, closed, orientable, name: `the connected sum of ${k} projective planes`, tex: `N_{${k}}` };
}

// ── cell ladders: Sⁿ, ℝPⁿ, ℂPⁿ ────────────────────────────────────────────

export type LadderSpace = 'S' | 'RP' | 'CP';

export interface Ladder {
	/** number of cells in each dimension 0 … top */
	cells: number[];
	/** for each k ≥ 1 with a cell in dims k and k−1: the degree d_k (else null) */
	degrees: (number | null)[];
	top: number;
}

/**
 * Cell structures: Sⁿ = e⁰ ∪ eⁿ; ℝPⁿ = e⁰ ∪ e¹ ∪ … ∪ eⁿ with d_k = 1 + (−1)^k;
 * ℂPⁿ = e⁰ ∪ e² ∪ … ∪ e²ⁿ (real dimension 2n).
 */
export function ladder(space: LadderSpace, n: number): Ladder {
	const top = space === 'CP' ? 2 * n : n;
	const cells = new Array<number>(top + 1).fill(0);
	if (space === 'S') {
		cells[0] = 1;
		cells[n] += 1;
	} else if (space === 'RP') cells.fill(1);
	else for (let k = 0; k <= n; k++) cells[2 * k] = 1;
	const degrees = cells.map((c, k) => {
		if (k === 0 || !c || !cells[k - 1]) return null;
		if (space === 'RP') return 1 + (k % 2 === 0 ? 1 : -1);
		if (space === 'S') return 0; // only n = 1: the 1-cell's two ends are the same 0-cell
		return 0;
	});
	return { cells, degrees, top };
}

export function ladderHomology(L: Ladder, mod2 = false): HomologyGroup[] {
	const d = L.degrees.map((x) => (x === null ? null : [[mod2 ? ((x % 2) + 2) % 2 : x]]));
	const H = chainComplexHomology(L.cells, d);
	// with ℤ/2 coefficients there is no torsion to report: ranks are dimensions over ℤ/2
	return mod2 ? H.map((g) => ({ rank: g.rank, torsion: [] })) : H;
}

// ── small helpers for Mayer–Vietoris bookkeeping ───────────────────────────

/** Kernel rank and cokernel structure of an integer matrix A : ℤ^cols → ℤ^rows. */
export function kerCoker(A: number[][], rows: number, cols: number): { kerRank: number; coker: HomologyGroup } {
	if (!rows || !cols) return { kerRank: cols, coker: { rank: rows, torsion: [] } };
	const s = smith(A);
	return { kerRank: cols - s.rank, coker: { rank: rows - s.rank, torsion: s.diagonal.filter((x) => x > 1) } };
}
