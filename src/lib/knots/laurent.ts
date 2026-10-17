// Laurent polynomials with integer coefficients: Σ cₑ xᵉ over whole-number
// exponents e of either sign. The knot polynomials live here.

export type Laurent = Map<number, number>;

export const L = {
	zero: (): Laurent => new Map(),
	one: (): Laurent => new Map([[0, 1]]),
	/** c·xᵉ */
	mono: (e: number, c = 1): Laurent => (c === 0 ? new Map() : new Map([[e, c]])),
	from(coeffs: Record<number, number>): Laurent {
		const p: Laurent = new Map();
		for (const [e, c] of Object.entries(coeffs)) if (c) p.set(+e, c);
		return p;
	},
	add(a: Laurent, b: Laurent): Laurent {
		const p = new Map(a);
		for (const [e, c] of b) {
			const s = (p.get(e) ?? 0) + c;
			if (s) p.set(e, s);
			else p.delete(e);
		}
		return p;
	},
	sub(a: Laurent, b: Laurent): Laurent {
		return L.add(a, L.scale(b, -1));
	},
	scale(a: Laurent, k: number): Laurent {
		const p: Laurent = new Map();
		if (k) for (const [e, c] of a) p.set(e, c * k);
		return p;
	},
	/** multiply by xᵏ */
	shift(a: Laurent, k: number): Laurent {
		const p: Laurent = new Map();
		for (const [e, c] of a) p.set(e + k, c);
		return p;
	},
	mul(a: Laurent, b: Laurent): Laurent {
		const p: Laurent = new Map();
		for (const [e1, c1] of a)
			for (const [e2, c2] of b) {
				const e = e1 + e2;
				const s = (p.get(e) ?? 0) + c1 * c2;
				if (s) p.set(e, s);
				else p.delete(e);
			}
		return p;
	},
	pow(a: Laurent, n: number): Laurent {
		let p = L.one();
		for (let i = 0; i < n; i++) p = L.mul(p, a);
		return p;
	},
	/** x ↦ xᵏ (k may be negative or fractional if the exponents allow it) */
	substitute(a: Laurent, k: number): Laurent {
		const p: Laurent = new Map();
		for (const [e, c] of a) p.set(e * k, c);
		return p;
	},
	evaluate(a: Laurent, x: number): number {
		let s = 0;
		for (const [e, c] of a) s += c * x ** e;
		return s;
	},
	eq(a: Laurent, b: Laurent): boolean {
		return L.sub(a, b).size === 0;
	},
	isZero: (a: Laurent) => a.size === 0,
	minDeg: (a: Laurent) => Math.min(...a.keys()),
	maxDeg: (a: Laurent) => Math.max(...a.keys()),
	/** exponents from low to high, with their coefficients */
	terms(a: Laurent): [number, number][] {
		return [...a].sort((x, y) => x[0] - y[0]);
	},
	/** TeX for the polynomial in the variable `v`, highest power first */
	tex(a: Laurent, v = 't'): string {
		if (a.size === 0) return '0';
		const ts = L.terms(a).reverse();
		let s = '';
		ts.forEach(([e, c], i) => {
			const abs = Math.abs(c);
			const sign = c < 0 ? '-' : i === 0 ? '' : '+';
			const exp = Number.isInteger(e) ? `${e}` : e * 2 === Math.round(e * 2) ? `${Math.round(e * 2)}/2` : `${e}`;
			const pow = e === 0 ? '' : e === 1 ? v : `${v}^{${exp}}`;
			const coef = abs === 1 && e !== 0 ? '' : `${abs}`;
			s += `${i === 0 ? sign : ` ${sign} `}${coef}${pow}`;
		});
		return s;
	}
};

/** the determinant of a square matrix of Laurent polynomials (Laplace for small, else elimination over fractions is avoided by Bareiss on shifted polynomials) */
export function detLaurent(M: Laurent[][]): Laurent {
	const n = M.length;
	if (n === 0) return L.one();
	// clear negative powers row by row, remembering the shift
	let shift = 0;
	const rows = M.map((row) => {
		const lo = Math.min(0, ...row.filter((p) => p.size).map((p) => L.minDeg(p)));
		shift += lo;
		return row.map((p) => L.shift(p, -lo));
	});
	// now every entry is a polynomial: Bareiss fraction-free elimination
	const A = rows.map((r) => r.map((p) => toPoly(p)));
	let sign = 1;
	let prev: number[] = [1];
	for (let k = 0; k < n - 1; k++) {
		if (isZeroP(A[k][k])) {
			const r = A.findIndex((row, i) => i > k && !isZeroP(row[k]));
			if (r < 0) return L.zero();
			[A[k], A[r]] = [A[r], A[k]];
			sign = -sign;
		}
		for (let i = k + 1; i < n; i++)
			for (let j = k + 1; j < n; j++) {
				A[i][j] = divExact(subP(mulP(A[i][j], A[k][k]), mulP(A[i][k], A[k][j])), prev);
			}
		prev = A[k][k];
	}
	const d = A[n - 1][n - 1];
	const out: Laurent = new Map();
	d.forEach((c, e) => c && out.set(e + shift, sign * c));
	return out;
}

// dense polynomials (coefficient arrays, low degree first) for the elimination
type Poly = number[];
function toPoly(p: Laurent): Poly {
	if (!p.size) return [];
	const out: Poly = new Array(L.maxDeg(p) + 1).fill(0);
	for (const [e, c] of p) out[e] = c;
	return out;
}
const trim = (p: Poly) => {
	let n = p.length;
	while (n && p[n - 1] === 0) n--;
	return p.slice(0, n);
};
const isZeroP = (p: Poly) => trim(p).length === 0;
function mulP(a: Poly, b: Poly): Poly {
	if (!a.length || !b.length) return [];
	const out = new Array(a.length + b.length - 1).fill(0);
	for (let i = 0; i < a.length; i++) if (a[i]) for (let j = 0; j < b.length; j++) out[i + j] += a[i] * b[j];
	return trim(out);
}
function subP(a: Poly, b: Poly): Poly {
	const out = new Array(Math.max(a.length, b.length)).fill(0);
	a.forEach((c, i) => (out[i] += c));
	b.forEach((c, i) => (out[i] -= c));
	return trim(out);
}
/** a / b, known to be exact */
function divExact(a: Poly, b: Poly): Poly {
	a = trim(a);
	b = trim(b);
	if (!a.length) return [];
	const out = new Array(Math.max(1, a.length - b.length + 1)).fill(0);
	const r = a.slice();
	const lb = b[b.length - 1];
	for (let i = a.length - b.length; i >= 0; i--) {
		const q = r[i + b.length - 1] / lb;
		if (!Number.isInteger(q)) throw new Error('detLaurent: inexact division');
		out[i] = q;
		for (let j = 0; j < b.length; j++) r[i + j] -= q * b[j];
	}
	if (trim(r).length) throw new Error('detLaurent: inexact division');
	return trim(out);
}
