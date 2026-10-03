// The spectral sequence of a filtered chain complex, over a field.
//
// A filtered complex is given by generators, each with a dimension n, a
// filtration stage p (the stage at which it is added) and a boundary. On the
// grid we place a generator at (p, q) with q = n − p. The pages E^r are computed
// from the persistence pairing of the filtration: when the column reduction
// pairs a generator `lo` (killed) with a generator `hi` (killer), their dots
// live on the pages E^1 … E^len, where len = stage(hi) − stage(lo), and the
// differential d^len joins them (from hi to lo; slope (−r, r − 1)).
// Unpaired generators survive to E^∞, which spells out the homology.

export interface Gen {
	name: string;
	/** TeX label */
	tex: string;
	dim: number;
	/** filtration stage p */
	filt: number;
	/** boundary: name → coefficient */
	bd?: Record<string, number>;
}

export interface Filtered {
	id: string;
	title: string;
	gens: Gen[];
}

export interface Pair {
	lo: number;
	hi: number;
	len: number;
}

export interface Spectral {
	pairs: Pair[];
	survivors: number[];
	/** E^∞ = E^{last} (the first page after which nothing changes) */
	last: number;
}

/** A large prime: arithmetic mod LARGE_P behaves like ℚ for the small integer examples here. */
export const LARGE_P = 1000003;

const mod = (a: number, p: number) => ((a % p) + p) % p;
function inv(a: number, p: number): number {
	let r = 1;
	let b = mod(a, p);
	let e = p - 2;
	while (e > 0) {
		if (e & 1) r = (r * b) % p;
		b = (b * b) % p;
		e = Math.floor(e / 2);
	}
	return r;
}

/** Generators sorted compatibly with the filtration (stage, then dimension). */
export function filtrationOrder(F: Filtered): number[] {
	return F.gens.map((_, i) => i).sort((a, b) => F.gens[a].filt - F.gens[b].filt || F.gens[a].dim - F.gens[b].dim || a - b);
}

/** Persistence pairing over 𝔽_p (p prime; use 2 for ℤ/2, LARGE_P for ℚ). */
export function spectral(F: Filtered, p = LARGE_P): Spectral {
	const order = filtrationOrder(F);
	const posOf = new Map<string, number>();
	order.forEach((g, k) => posOf.set(F.gens[g].name, k));
	// columns: sparse maps row position → coefficient
	const cols: Map<number, number>[] = order.map((g) => {
		const m = new Map<number, number>();
		for (const [name, c] of Object.entries(F.gens[g].bd ?? {})) {
			const v = mod(c, p);
			if (v) m.set(posOf.get(name)!, v);
		}
		return m;
	});
	const low = (m: Map<number, number>) => (m.size ? Math.max(...m.keys()) : -1);
	const lowToCol = new Map<number, number>();
	const pairs: Pair[] = [];
	const paired = new Set<number>();
	for (let j = 0; j < cols.length; j++) {
		const c = cols[j];
		let l = low(c);
		while (l !== -1 && lowToCol.has(l)) {
			const k = lowToCol.get(l)!;
			const ck = cols[k];
			const f = (c.get(l)! * inv(ck.get(l)!, p)) % p;
			for (const [r, v] of ck) {
				const nv = mod((c.get(r) ?? 0) - f * v, p);
				if (nv) c.set(r, nv);
				else c.delete(r);
			}
			l = low(c);
		}
		if (l !== -1) {
			lowToCol.set(l, j);
			const lo = order[l];
			const hi = order[j];
			pairs.push({ lo, hi, len: F.gens[hi].filt - F.gens[lo].filt });
			paired.add(lo);
			paired.add(hi);
		}
	}
	const survivors = F.gens.map((_, i) => i).filter((i) => !paired.has(i));
	const last = Math.max(1, ...pairs.map((q) => q.len + 1));
	return { pairs, survivors, last };
}

/** Generators whose dots are visible on page E^r (r ≥ 1; r = 0 shows every generator). */
export function aliveOn(F: Filtered, S: Spectral, r: number): Set<number> {
	if (r === 0) return new Set(F.gens.map((_, i) => i));
	const s = new Set(S.survivors);
	for (const q of S.pairs) if (q.len >= r) (s.add(q.lo), s.add(q.hi));
	return s;
}

/** The nonzero differentials d^r on page r, as (from = killer, to = killed). */
export function differentialsOn(S: Spectral, r: number): { from: number; to: number }[] {
	return S.pairs.filter((q) => q.len === r && r >= 1).map((q) => ({ from: q.hi, to: q.lo }));
}

export const gridPos = (g: Gen): [number, number] => [g.filt, g.dim - g.filt];

/** dim E^r_{p,q} for every occupied (p, q). */
export function pageDims(F: Filtered, S: Spectral, r: number): Map<string, number> {
	const m = new Map<string, number>();
	for (const i of aliveOn(F, S, r)) {
		const [p, q] = gridPos(F.gens[i]);
		m.set(`${p},${q}`, (m.get(`${p},${q}`) ?? 0) + 1);
	}
	return m;
}

// ── the toy examples of §5.2 ───────────────────────────────────────────────

export const toys: Record<string, Filtered> = {
	disks: {
		id: 'disks',
		title: 'Two disks on a segment',
		gens: [
			{ name: 'v', tex: 'v', dim: 0, filt: 0 },
			{ name: 'w', tex: 'w', dim: 0, filt: 0 },
			{ name: 'c', tex: 'c', dim: 1, filt: 0 },
			{ name: 't', tex: 't', dim: 1, filt: 1, bd: { w: 1, v: -1 } },
			{ name: 'b', tex: 'b', dim: 1, filt: 1 },
			{ name: 'e', tex: 'e', dim: 2, filt: 2, bd: { c: 1 } },
			{ name: 'f', tex: 'f', dim: 2, filt: 2, bd: { b: 1 } }
		]
	},
	torus: {
		id: 'torus',
		title: 'Torus, cell by cell',
		gens: [
			{ name: 'v', tex: 'v', dim: 0, filt: 0 },
			{ name: 'a', tex: 'a', dim: 1, filt: 1 },
			{ name: 'b', tex: 'b', dim: 1, filt: 1 },
			{ name: 's', tex: 's', dim: 2, filt: 2 }
		]
	},
	rp2: {
		id: 'rp2',
		title: 'Projective plane, cell by cell',
		gens: [
			{ name: 'v', tex: 'v', dim: 0, filt: 0 },
			{ name: 'a', tex: 'a', dim: 1, filt: 1 },
			{ name: 's', tex: 's', dim: 2, filt: 2, bd: { a: 2 } }
		]
	}
};

// ── a brute-force check (used by the tests) ────────────────────────────────

function rankRows(rows: number[][], p: number): number {
	const A = rows.map((r) => r.map((x) => mod(x, p)));
	let rank = 0;
	const n = A.length ? A[0].length : 0;
	for (let c = 0; c < n && rank < A.length; c++) {
		let piv = -1;
		for (let r = rank; r < A.length; r++)
			if (A[r][c]) {
				piv = r;
				break;
			}
		if (piv === -1) continue;
		[A[rank], A[piv]] = [A[piv], A[rank]];
		const iv = inv(A[rank][c], p);
		for (let j = 0; j < n; j++) A[rank][j] = (A[rank][j] * iv) % p;
		for (let r = 0; r < A.length; r++) {
			if (r === rank || !A[r][c]) continue;
			const f = A[r][c];
			for (let j = 0; j < n; j++) A[r][j] = mod(A[r][j] - f * A[rank][j], p);
		}
		rank++;
	}
	return rank;
}

/** Basis of the null space of M (rows × cols) over 𝔽_p, as column-space vectors. */
function nullspace(M: number[][], cols: number, p: number): number[][] {
	const A = M.map((r) => r.map((x) => mod(x, p)));
	const pivCols: number[] = [];
	let rank = 0;
	for (let c = 0; c < cols && rank < A.length; c++) {
		let piv = -1;
		for (let r = rank; r < A.length; r++)
			if (A[r][c]) {
				piv = r;
				break;
			}
		if (piv === -1) continue;
		[A[rank], A[piv]] = [A[piv], A[rank]];
		const iv = inv(A[rank][c], p);
		for (let j = 0; j < cols; j++) A[rank][j] = (A[rank][j] * iv) % p;
		for (let r = 0; r < A.length; r++) {
			if (r === rank || !A[r][c]) continue;
			const f = A[r][c];
			for (let j = 0; j < cols; j++) A[r][j] = mod(A[r][j] - f * A[rank][j], p);
		}
		pivCols.push(c);
		rank++;
	}
	const free = [...Array(cols).keys()].filter((c) => !pivCols.includes(c));
	return free.map((fc) => {
		const v = new Array<number>(cols).fill(0);
		v[fc] = 1;
		pivCols.forEach((pc, r) => (v[pc] = mod(-A[r][fc], p)));
		return v;
	});
}

/**
 * dim E^r_{p} in total degree n straight from the definition
 *   E^r_p = Z^r_p / (Z^{r−1}_{p−1} + ∂Z^{r−1}_{p+r−1}),  Z^r_p = { x ∈ F_p : ∂x ∈ F_{p−r} }.
 */
export function bruteForceDim(F: Filtered, r: number, pf: number, n: number, p = LARGE_P): number {
	const gensOf = (k: number) => F.gens.map((g, i) => ({ g, i })).filter(({ g }) => g.dim === k);
	const Cn = gensOf(n);
	const Cp = gensOf(n + 1);
	// ∂ as a matrix from degree k to k−1 (rows: (k−1)-gens, cols: k-gens)
	const bdMatrix = (src: typeof Cn, dst: typeof Cn) =>
		dst.map(({ g: t }) => src.map(({ g: s }) => s.bd?.[t.name] ?? 0));
	// Z^r_s in degree k, as vectors in the coordinates of degree-k generators
	const Z = (rr: number, s: number, k: number) => {
		const src = gensOf(k);
		const dst = gensOf(k - 1);
		const inF = src.map(({ g }) => g.filt <= s);
		const cols = src.length;
		const rows = bdMatrix(src, dst)
			.filter((_, ri) => dst[ri].g.filt > s - rr)
			.map((row) => row.map((x, ci) => (inF[ci] ? x : 0)));
		// also force coordinates outside F_s to vanish
		src.forEach((_, ci) => {
			if (!inF[ci]) {
				const row = new Array<number>(cols).fill(0);
				row[ci] = 1;
				rows.push(row);
			}
		});
		return nullspace(rows, cols, p);
	};
	const zr = Z(r, pf, n);
	const zLow = Z(r - 1, pf - 1, n);
	const zHigh = Z(r - 1, pf + r - 1, n + 1);
	const D = bdMatrix(Cp, Cn);
	const bdry = zHigh.map((y) => Cn.map((_, ri) => y.reduce((acc, yv, ci) => acc + D[ri][ci] * yv, 0)));
	const denom = [...zLow, ...bdry];
	return rankRows(zr, p) - (denom.length ? rankRows(denom, p) : 0);
}
