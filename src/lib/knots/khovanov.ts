// Khovanov homology, from the cube of resolutions (Khovanov 2000, in the form
// of Bar-Natan 2002). Every crossing is smoothed in two ways; each of the 2ⁿ
// smoothings is a set of circles; each circle carries a two-dimensional space
// spanned by 1 and x; adjacent smoothings are joined by merging two circles
// or splitting one. The result is a chain complex graded by a homological
// degree r and a quantum degree j, and its homology is a knot invariant whose
// graded Euler characteristic is (q + q⁻¹) times the Jones polynomial at t = q².
// Ranks are computed over a large prime field, which agrees with ℚ for every
// knot this book draws.
import type { Diagram, PD } from './diagram';
import { L, type Laurent } from './laurent';

const P = 1000003;

interface State {
	/** circle index of every strand label */
	circle: Map<number, number>;
	circles: number;
}

function smooth(pd: PD[], s: number, free: number): State {
	const parent = new Map<number, number>();
	const find = (x: number): number => {
		let p = parent.get(x) ?? x;
		if (p !== x) {
			p = find(p);
			parent.set(x, p);
		}
		return p;
	};
	const union = (a: number, b: number) => {
		const ra = find(a);
		const rb = find(b);
		if (ra !== rb) parent.set(ra, rb);
	};
	pd.forEach(([i, j, k, l], c) => {
		if (((s >> c) & 1) === 0) {
			union(i, j);
			union(k, l);
		} else {
			union(i, l);
			union(j, k);
		}
	});
	const roots: number[] = [];
	const circle = new Map<number, number>();
	for (const x of new Set(pd.flat())) {
		const r = find(x);
		let idx = roots.indexOf(r);
		if (idx < 0) idx = roots.push(r) - 1;
		circle.set(x, idx);
	}
	return { circle, circles: roots.length + free };
}

const popcount = (x: number) => {
	let n = 0;
	while (x) {
		n += x & 1;
		x >>= 1;
	}
	return n;
};

/** Kh^{r,j} as a map from "r,j" to its dimension (over a field of characteristic zero, in practice) */
export function khovanov(D: Diagram): Map<string, number> {
	const pd = D.pd;
	const n = pd.length;
	const nPlus = D.signs.filter((s) => s > 0).length;
	const nMinus = n - nPlus;
	const states: State[] = [];
	for (let s = 0; s < 1 << n; s++) states.push(smooth(pd, s, D.freeLoops));

	// generators: (state, mask), mask bit = 1 when that circle carries x
	const index = new Map<string, Map<number, number>>(); // "r,j" → (state·2^k + mask key) → position
	const keyOf = (s: number, mask: number) => s * 4096 + mask;
	const gradeOf = (s: number, mask: number) => {
		const k = states[s].circles;
		const minus = popcount(mask);
		const r = popcount(s) - nMinus;
		const j = k - 2 * minus + popcount(s) + nPlus - 2 * nMinus;
		return [r, j];
	};
	for (let s = 0; s < 1 << n; s++) {
		const k = states[s].circles;
		for (let mask = 0; mask < 1 << k; mask++) {
			const [r, j] = gradeOf(s, mask);
			const g = `${r},${j}`;
			if (!index.has(g)) index.set(g, new Map());
			const m = index.get(g)!;
			m.set(keyOf(s, mask), m.size);
		}
	}

	// the differential, as sparse columns: generator → [(target key, coefficient)]
	function image(s: number, mask: number): [number, number][] {
		const out: [number, number][] = [];
		for (let c = 0; c < n; c++) {
			if ((s >> c) & 1) continue;
			const t = s | (1 << c);
			const sign = popcount(s & ((1 << c) - 1)) % 2 ? -1 : 1;
			const A = states[s];
			const B = states[t];
			const [i, j, k, l] = pd[c];
			// circles of s at this crossing: the 0-smoothing joined (i,j) and (k,l)
			const a1 = A.circle.get(i)!;
			const a2 = A.circle.get(k)!;
			// circles of t at this crossing: the 1-smoothing joins (i,l) and (j,k)
			const b1 = B.circle.get(i)!;
			const b2 = B.circle.get(j)!;
			// circles away from the crossing keep their labels: map each circle of s to one of t
			const toB = new Map<number, number>();
			for (const [x, ca] of A.circle) if (ca !== a1 && ca !== a2) toB.set(ca, B.circle.get(x)!);
			const base = (m: number) => {
				let out = 0;
				for (const [ca, cb] of toB) if ((m >> ca) & 1) out |= 1 << cb;
				// free loops keep their positions after the diagram's circles
				const fa = A.circles - D.freeLoops;
				const fb = B.circles - D.freeLoops;
				for (let f = 0; f < D.freeLoops; f++) if ((m >> (fa + f)) & 1) out |= 1 << (fb + f);
				return out;
			};
			const rest = base(mask);
			if (a1 !== a2) {
				// merge: 1·1 = 1, 1·x = x·1 = x, x·x = 0
				const xa = ((mask >> a1) & 1) + ((mask >> a2) & 1);
				if (xa === 2) continue;
				out.push([keyOf(t, rest | (xa ? 1 << b1 : 0)), sign]);
			} else {
				// split: 1 ↦ 1⊗x + x⊗1, x ↦ x⊗x
				if ((mask >> a1) & 1) out.push([keyOf(t, rest | (1 << b1) | (1 << b2)), sign]);
				else {
					out.push([keyOf(t, rest | (1 << b2)), sign]);
					out.push([keyOf(t, rest | (1 << b1)), sign]);
				}
			}
		}
		return out;
	}

	const rank = new Map<string, number>();
	for (const [g, cols] of index) {
		const [r, j] = g.split(',').map(Number);
		const rows = index.get(`${r + 1},${j}`);
		if (!rows) {
			rank.set(g, 0);
			continue;
		}
		const M: number[][] = [];
		for (const [key] of cols) {
			const col = new Array(rows.size).fill(0);
			const s = Math.floor(key / 4096);
			for (const [tk, v] of image(s, key % 4096)) {
				const at = rows.get(tk);
				if (at === undefined) throw new Error('khovanov: grading mismatch');
				col[at] = (((col[at] + v) % P) + P) % P;
			}
			M.push(col);
		}
		rank.set(g, rankModP(M));
	}
	const kh = new Map<string, number>();
	for (const [g, cols] of index) {
		const [r, j] = g.split(',').map(Number);
		const dim = cols.size - (rank.get(g) ?? 0) - (rank.get(`${r - 1},${j}`) ?? 0);
		if (dim) kh.set(g, dim);
	}
	return kh;
}

function rankModP(rows: number[][]): number {
	const A = rows.map((r) => r.slice());
	const m = A.length;
	const n = m ? A[0].length : 0;
	let rank = 0;
	const inv = (a: number) => {
		let [t, nt, r, nr] = [0, 1, P, a];
		while (nr) {
			const q = Math.floor(r / nr);
			[t, nt] = [nt, t - q * nt];
			[r, nr] = [nr, r - q * nr];
		}
		return ((t % P) + P) % P;
	};
	const mulmod = (a: number, b: number) => Number((BigInt(a) * BigInt(b)) % BigInt(P));
	for (let col = 0; col < n && rank < m; col++) {
		let piv = -1;
		for (let i = rank; i < m; i++)
			if (A[i][col]) {
				piv = i;
				break;
			}
		if (piv < 0) continue;
		[A[rank], A[piv]] = [A[piv], A[rank]];
		const iv = inv(A[rank][col]);
		A[rank] = A[rank].map((v) => mulmod(v, iv));
		for (let i = rank + 1; i < m; i++)
			if (A[i][col]) {
				const f = A[i][col];
				const row = A[rank];
				A[i] = A[i].map((v, j) => (((v - mulmod(f, row[j])) % P) + P) % P);
			}
		rank++;
	}
	return rank;
}

/** the graded Euler characteristic Σ (−1)^r q^j dim Kh^{r,j} */
export function eulerCharacteristic(kh: Map<string, number>): Laurent {
	let p = L.zero();
	for (const [g, d] of kh) {
		const [r, j] = g.split(',').map(Number);
		p = L.add(p, L.mono(j, r % 2 ? -d : d));
	}
	return p;
}
