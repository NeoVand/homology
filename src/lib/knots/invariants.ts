// Knot invariants, computed from a diagram's PD code: the Kauffman bracket and
// the Jones polynomial, the Alexander polynomial (Fox calculus on the
// Wirtinger presentation), Fox colourings and the determinant, linking
// numbers, and the Seifert circles of Seifert's algorithm.
import { L, detLaurent, type Laurent } from './laurent';
import { strands, type Diagram, type PD } from './diagram';

/** union–find on strand labels */
class DSU {
	parent = new Map<number, number>();
	find(x: number): number {
		let p = this.parent.get(x) ?? x;
		if (p !== x) {
			p = this.find(p);
			this.parent.set(x, p);
		}
		return p;
	}
	union(a: number, b: number) {
		const ra = this.find(a);
		const rb = this.find(b);
		if (ra !== rb) this.parent.set(ra, rb);
	}
}

const labels = (pd: PD[]) => [...new Set(pd.flat())];

/** loops after smoothing every crossing: smoothing[c] = 0 joins (i,j),(k,l); 1 joins (i,l),(j,k) */
export function loopsOf(pd: PD[], smoothing: number[]): number {
	const d = new DSU();
	pd.forEach(([i, j, k, l], c) => {
		if (smoothing[c] === 0) {
			d.union(i, j);
			d.union(k, l);
		} else {
			d.union(i, l);
			d.union(j, k);
		}
	});
	return new Set(labels(pd).map((x) => d.find(x))).size;
}

/** −A² − A⁻², the value of one extra loop */
const loopValue = L.from({ 2: -1, [-2]: -1 });

/**
 * The Kauffman bracket ⟨D⟩ in the variable A, normalised so that one round
 * loop has bracket 1: the sum over all 2ⁿ ways of smoothing the crossings of
 * A^(#0-smoothings − #1-smoothings) · (−A² − A⁻²)^(loops − 1).
 */
export function bracket(D: Diagram): Laurent {
	const n = D.pd.length;
	let total = L.zero();
	const s = new Array(n).fill(0);
	for (let m = 0; m < 1 << n; m++) {
		let a = 0;
		for (let c = 0; c < n; c++) {
			s[c] = (m >> c) & 1;
			a += s[c] ? -1 : 1;
		}
		const loops = (n ? loopsOf(D.pd, s) : 0) + D.freeLoops;
		total = L.add(total, L.mul(L.mono(a), L.pow(loopValue, loops - 1)));
	}
	return total;
}

/**
 * The Jones polynomial V(t): (−A³)^(−writhe) ⟨D⟩ with A = t^(−1/4). For a knot
 * the powers of t are whole numbers; for a link with an even number of
 * components they are halves.
 */
export function jones(D: Diagram): Laurent {
	const w = D.writhe;
	const f = L.mul(L.mono(-3 * w, w % 2 === 0 ? 1 : -1), bracket(D));
	return L.substitute(f, -1 / 4);
}

/** the arcs of the diagram (over-strands, broken at undercrossings): arc index of every strand label */
export function arcsOf(D: Diagram): { arcOf: Map<number, number>; count: number } {
	const d = new DSU();
	const all = labels(D.pd);
	// strand pieces join into one arc where they pass *over* a crossing
	D.pd.forEach((x, c) => {
		const { over } = strands(x, D.signs[c]);
		d.union(over[0], over[1]);
	});
	const roots = [...new Set(all.map((x) => d.find(x)))];
	const arcOf = new Map(all.map((x) => [x, roots.indexOf(d.find(x))]));
	return { arcOf, count: roots.length };
}

/**
 * The Alexander polynomial of a knot, normalised to be symmetric (Δ(t⁻¹) = Δ(t))
 * with Δ(1) = 1: the determinant of the Alexander matrix with one row and one
 * column struck out. Row c is the Fox derivative of the Wirtinger relation at
 * crossing c, x_out = x_over^ε x_in x_over^(−ε), with every generator sent to t.
 */
export function alexander(D: Diagram): Laurent {
	if (D.components !== 1) throw new Error('alexander: knots only');
	if (D.pd.length === 0) return L.one();
	const { arcOf, count } = arcsOf(D);
	const M: Laurent[][] = D.pd.map(() => Array.from({ length: count }, () => L.zero()));
	D.pd.forEach((x, c) => {
		const { under, over } = strands(x, D.signs[c]);
		const o = arcOf.get(over[0])!;
		const a = arcOf.get(under[0])!;
		const b = arcOf.get(under[1])!;
		const row = M[c];
		const put = (col: number, p: Laurent) => (row[col] = L.add(row[col], p));
		if (D.signs[c] > 0) {
			put(o, L.from({ 0: 1, 1: -1 })); // 1 − t
			put(a, L.mono(1)); // t
			put(b, L.mono(0, -1)); // −1
		} else {
			put(o, L.from({ 1: 1, 0: -1 })); // t − 1
			put(a, L.mono(0)); // 1
			put(b, L.mono(1, -1)); // −t
		}
	});
	const minor = M.slice(0, -1).map((r) => r.slice(0, -1));
	return normaliseAlexander(detLaurent(minor));
}

export function normaliseAlexander(p: Laurent): Laurent {
	if (L.isZero(p)) return p;
	const lo = L.minDeg(p);
	const hi = L.maxDeg(p);
	let q = L.shift(p, -(lo + hi) / 2);
	if (L.evaluate(q, 1) < 0) q = L.scale(q, -1);
	return q;
}

/** the determinant |Δ(−1)| */
export function determinant(D: Diagram): number {
	return Math.abs(Math.round(L.evaluate(alexander(D), -1)));
}

/** the number of Fox p-colourings (p prime), counting the p one-colour ones */
export function colourings(D: Diagram, p: number): number {
	const { arcOf, count } = arcsOf(D);
	const rows = D.pd.map((x, c) => {
		const { under, over } = strands(x, D.signs[c]);
		const r = new Array(count).fill(0);
		r[arcOf.get(over[0])!] += 2;
		r[arcOf.get(under[0])!] -= 1;
		r[arcOf.get(under[1])!] -= 1;
		return r.map((v) => ((v % p) + p) % p);
	});
	// a loop with no undercrossing is one more arc, free to take any colour
	return p ** (count - rankMod(rows, p) + D.freeLoops);
}

export function rankMod(rows: number[][], p: number): number {
	const A = rows.map((r) => r.slice());
	const m = A.length;
	const n = m ? A[0].length : 0;
	let rank = 0;
	const inv = (a: number) => {
		let [t, nt, r, nr] = [0, 1, p, a % p];
		while (nr) {
			const q = Math.floor(r / nr);
			[t, nt] = [nt, t - q * nt];
			[r, nr] = [nr, r - q * nr];
		}
		return ((t % p) + p) % p;
	};
	for (let col = 0; col < n && rank < m; col++) {
		const piv = A.findIndex((row, i) => i >= rank && row[col] % p !== 0);
		if (piv < 0) continue;
		[A[rank], A[piv]] = [A[piv], A[rank]];
		const iv = inv(A[rank][col]);
		A[rank] = A[rank].map((v) => (v * iv) % p);
		for (let i = 0; i < m; i++)
			if (i !== rank && A[i][col]) {
				const f = A[i][col];
				A[i] = A[i].map((v, j) => (((v - f * A[rank][j]) % p) + p) % p);
			}
		rank++;
	}
	return rank;
}

/** linking number of components a and b: half the sum of the signs where they cross */
export function linkingNumber(D: Diagram, a: number, b: number): number {
	let s = 0;
	D.crossComps.forEach(([x, y], c) => {
		if ((x === a && y === b) || (x === b && y === a)) s += D.signs[c];
	});
	return s / 2;
}

/** the circles of Seifert's algorithm: smooth every crossing the way the strands run */
export function seifertCircles(D: Diagram): number {
	const d = new DSU();
	D.pd.forEach((x, c) => {
		const { under, over } = strands(x, D.signs[c]);
		d.union(under[0], over[1]); // in under → out over
		d.union(over[0], under[1]); // in over → out under
	});
	return new Set(labels(D.pd).map((x) => d.find(x))).size + D.freeLoops;
}

/** genus of the surface Seifert's algorithm builds on this diagram of a knot: (1 − s + c)/2 */
export function seifertGenus(D: Diagram): number {
	return (1 - seifertCircles(D) + D.pd.length) / 2;
}
