// Finitely generated abelian groups  ℤ^r ⊕ ℤ/d₁ ⊕ … ⊕ ℤ/d_k  (d₁ | d₂ | …)
// and the four functors of homological algebra on them: ⊗, Tor, Hom, Ext.
// Plus the Universal Coefficient Theorems and the Künneth formula, and —
// as an independent check — direct computations from integer chain complexes.
import { smith, transpose, type Matrix } from '$lib/math/linalg';

/** A group ℤ^free ⊕ ℤ/t₁ ⊕ … (base 'Z'), or a rational vector space ℚ^free (base 'Q'). */
export interface Group {
	free: number;
	/** invariant factors, each > 1, each dividing the next */
	torsion: number[];
	base: 'Z' | 'Q';
}

/** Coefficients for (co)homology: the integers, the integers mod n, or the rationals. */
export type Coeff = { kind: 'Z' } | { kind: 'Zn'; n: number } | { kind: 'Q' };

export const Zc: Coeff = { kind: 'Z' };
export const Qc: Coeff = { kind: 'Q' };
export const Zn = (n: number): Coeff => ({ kind: 'Zn', n });

export function gcd(a: number, b: number): number {
	a = Math.abs(a);
	b = Math.abs(b);
	while (b) [a, b] = [b, a % b];
	return a;
}

/** Bring a list of cyclic orders into invariant-factor form (drops 1s). */
export function invariantFactors(orders: number[]): number[] {
	const o = orders.filter((d) => d > 1);
	if (!o.length) return [];
	const D: Matrix = o.map((d, i) => o.map((_, j) => (i === j ? d : 0)));
	return smith(D).diagonal.filter((d) => d > 1);
}

export function group(free: number, cyclic: number[] = [], base: 'Z' | 'Q' = 'Z'): Group {
	return { free, torsion: base === 'Q' ? [] : invariantFactors(cyclic), base };
}

export const zero: Group = { free: 0, torsion: [], base: 'Z' };

export function isZero(g: Group): boolean {
	return g.free === 0 && g.torsion.length === 0;
}

export function sum(...gs: Group[]): Group {
	const base = gs.some((g) => g.base === 'Q') ? 'Q' : 'Z';
	return group(
		gs.reduce((a, g) => a + g.free, 0),
		gs.flatMap((g) => g.torsion),
		base
	);
}

export function equal(a: Group, b: Group): boolean {
	if (isZero(a) && isZero(b)) return true;
	return a.base === b.base && a.free === b.free && a.torsion.join(',') === b.torsion.join(',');
}

/** The coefficient group itself, as a Group. */
export function coeffGroup(c: Coeff): Group {
	if (c.kind === 'Z') return group(1);
	if (c.kind === 'Q') return group(1, [], 'Q');
	return group(0, [c.n]);
}

/** Cyclic summands: 0 stands for an infinite cyclic ℤ, d > 1 for ℤ/d. */
function summands(g: Group): number[] {
	return [...Array(g.free).fill(0), ...g.torsion];
}

const fromSummands = (orders: number[]) =>
	group(
		orders.filter((d) => d === 0).length,
		orders.filter((d) => d > 1)
	);

// The four functors on cyclic groups (0 = ℤ). `null` means the zero group.
const tensorC = (a: number, b: number) => (a === 0 ? b : b === 0 ? a : gcd(a, b));
const torC = (a: number, b: number) => (a === 0 || b === 0 ? 1 : gcd(a, b));
const homC = (a: number, b: number) => (a === 0 ? b : b === 0 ? 1 : gcd(a, b));
const extC = (a: number, b: number) => (a === 0 ? 1 : b === 0 ? a : gcd(a, b));

function biadditive(op: (a: number, b: number) => number) {
	return (A: Group, B: Group): Group => {
		const out: number[] = [];
		for (const a of summands(A)) for (const b of summands(B)) out.push(op(a, b));
		return fromSummands(out);
	};
}

/** A ⊗ B for finitely generated A, B. */
export const tensorFG = biadditive(tensorC);
/** Tor(A, B). */
export const torFG = biadditive(torC);
/** Hom(A, B). */
export const homFG = biadditive(homC);
/** Ext(A, B) = Ext¹(A, B). */
export const extFG = biadditive(extC);

// ── with coefficients (G may be ℚ, which is not finitely generated) ────────

export function tensor(A: Group, G: Coeff): Group {
	if (G.kind === 'Q') return group(A.free, [], 'Q');
	return tensorFG(A, coeffGroup(G));
}
export function tor(A: Group, G: Coeff): Group {
	if (G.kind === 'Q') return zero; // ℚ is torsion-free, hence "flat"
	return torFG(A, coeffGroup(G));
}
export function hom(A: Group, G: Coeff): Group {
	if (G.kind === 'Q') return group(A.free, [], 'Q');
	return homFG(A, coeffGroup(G));
}
export function ext(A: Group, G: Coeff): Group {
	if (G.kind === 'Q') return zero; // ℚ is divisible: ℚ/dℚ = 0
	return extFG(A, coeffGroup(G));
}

// ── the theorems ───────────────────────────────────────────────────────────

export interface UctTerm {
	/** H_n(X) ⊗ G (homology) or Hom(H_n(X), G) (cohomology) */
	main: Group;
	/** Tor(H_{n−1}(X), G) (homology) or Ext(H_{n−1}(X), G) (cohomology) */
	shifted: Group;
	total: Group;
}

/** H_n(X; G) ≅ H_n(X) ⊗ G ⊕ Tor(H_{n−1}(X), G). */
export function uctHomology(H: Group[], G: Coeff): UctTerm[] {
	return H.map((h, n) => {
		const main = tensor(h, G);
		const shifted = n > 0 ? tor(H[n - 1], G) : zero;
		return { main, shifted, total: sum(main, shifted) };
	});
}

/** H^n(X; G) ≅ Hom(H_n(X), G) ⊕ Ext(H_{n−1}(X), G). */
export function uctCohomology(H: Group[], G: Coeff): UctTerm[] {
	return H.map((h, n) => {
		const main = hom(h, G);
		const shifted = n > 0 ? ext(H[n - 1], G) : zero;
		return { main, shifted, total: sum(main, shifted) };
	});
}

/**
 * Künneth: H_n(X × Y) ≅ ⊕_{i+j=n} H_i(X) ⊗ H_j(Y)  ⊕  ⊕_{i+j=n−1} Tor(H_i(X), H_j(Y)).
 */
export function kunneth(HX: Group[], HY: Group[]): { tensorPart: Group; torPart: Group; total: Group }[] {
	const top = HX.length - 1 + HY.length - 1;
	const out = [];
	for (let n = 0; n <= top; n++) {
		const t: Group[] = [];
		const s: Group[] = [];
		for (let i = 0; i < HX.length; i++) {
			const j = n - i;
			if (j >= 0 && j < HY.length) t.push(tensorFG(HX[i], HY[j]));
			const j2 = n - 1 - i;
			if (j2 >= 0 && j2 < HY.length) s.push(torFG(HX[i], HY[j2]));
		}
		const tensorPart = t.length ? sum(...t) : zero;
		const torPart = s.length ? sum(...s) : zero;
		out.push({ tensorPart, torPart, total: sum(tensorPart, torPart) });
	}
	return out;
}

// ── TeX ────────────────────────────────────────────────────────────────────

/** TeX for a group, e.g. "\Z^2 \oplus \Z/2", "(\Z/2)^3", "\Q", "0". */
export function groupTeX(g: Group): string {
	if (isZero(g)) return '0';
	const parts: string[] = [];
	const b = g.base === 'Q' ? '\\Q' : '\\Z';
	if (g.free === 1) parts.push(b);
	else if (g.free > 1) parts.push(`${b}^{${g.free}}`);
	// group equal torsion orders into powers
	let i = 0;
	while (i < g.torsion.length) {
		let j = i;
		while (j < g.torsion.length && g.torsion[j] === g.torsion[i]) j++;
		const k = j - i;
		parts.push(k === 1 ? `\\Z/${g.torsion[i]}` : `(\\Z/${g.torsion[i]})^{${k}}`);
		i = j;
	}
	return parts.join(' \\oplus ');
}

export function coeffTeX(c: Coeff): string {
	return c.kind === 'Z' ? '\\Z' : c.kind === 'Q' ? '\\Q' : `\\Z/${c.n}`;
}

/** TeX for one cyclic summand (0 = ℤ). */
export function cyclicTeX(d: number): string {
	return d === 0 ? '\\Z' : d === 1 ? '0' : `\\Z/${d}`;
}

export { summands };

// ── chain complexes of free abelian groups (an independent check) ──────────

/**
 * A chain complex C_0 ← C_1 ← … of free abelian groups. dims[k] = rank of C_k;
 * d[k] is the matrix of ∂_k : C_k → C_{k−1} (dims[k−1] rows × dims[k] columns);
 * d[0] is unused.
 */
export interface ChainComplex {
	dims: number[];
	d: Matrix[];
}

function inv(a: number, p: number): number {
	// modular inverse by Fermat (p prime)
	let r = 1;
	let b = ((a % p) + p) % p;
	let e = p - 2;
	while (e > 0) {
		if (e & 1) r = (r * b) % p;
		b = (b * b) % p;
		e >>= 1;
	}
	return r;
}

/** Rank of an integer matrix after reducing mod a prime p (p < 46000 keeps products exact). */
export function rankModP(M: Matrix, p: number): number {
	const A = M.map((row) => row.map((x) => ((x % p) + p) % p));
	const m = A.length;
	const n = m ? A[0].length : 0;
	let rank = 0;
	for (let c = 0; c < n && rank < m; c++) {
		let piv = -1;
		for (let r = rank; r < m; r++)
			if (A[r][c]) {
				piv = r;
				break;
			}
		if (piv === -1) continue;
		[A[rank], A[piv]] = [A[piv], A[rank]];
		const iv = inv(A[rank][c], p);
		for (let j = c; j < n; j++) A[rank][j] = (A[rank][j] * iv) % p;
		for (let r = 0; r < m; r++) {
			if (r === rank || !A[r][c]) continue;
			const f = A[r][c];
			for (let j = c; j < n; j++) A[r][j] = (((A[r][j] - f * A[rank][j]) % p) + p) % p;
		}
		rank++;
	}
	return rank;
}

const isEmpty = (M: Matrix | undefined) => !M || M.length === 0 || M[0].length === 0;
const rankZ = (M: Matrix | undefined) => (isEmpty(M) ? 0 : smith(M!).rank);
const rankP = (M: Matrix | undefined, p: number) => (isEmpty(M) ? 0 : rankModP(M!, p));
const torsionOf = (M: Matrix | undefined) => (isEmpty(M) ? [] : smith(M!).diagonal.filter((x) => x > 1));
const T = (M: Matrix | undefined) => (isEmpty(M) ? [] : transpose(M!));

/** H_k(C) over ℤ, by Smith normal form of the boundary matrices. */
export function homologyOf(C: ChainComplex): Group[] {
	return C.dims.map((nk, k) =>
		group(nk - (k > 0 ? rankZ(C.d[k]) : 0) - rankZ(C.d[k + 1]), torsionOf(C.d[k + 1]))
	);
}

/**
 * H_k(C; G) computed directly from the chain complex C ⊗ G (G = ℤ, ℚ or ℤ/p with p prime)
 * — without using the Universal Coefficient Theorem.
 */
export function homologyWith(C: ChainComplex, G: Coeff): Group[] {
	if (G.kind === 'Z') return homologyOf(C);
	return C.dims.map((nk, k) => {
		if (G.kind === 'Q') return group(nk - (k > 0 ? rankZ(C.d[k]) : 0) - rankZ(C.d[k + 1]), [], 'Q');
		const p = G.n;
		const dim = nk - (k > 0 ? rankP(C.d[k], p) : 0) - rankP(C.d[k + 1], p);
		return group(0, Array(dim).fill(p));
	});
}

/**
 * H^k(C; G) computed directly from the cochain complex Hom(C, G), whose coboundary
 * δ_k = ∂_{k+1}ᵀ (G = ℤ, ℚ or ℤ/p with p prime) — again without the UCT.
 */
export function cohomologyWith(C: ChainComplex, G: Coeff): Group[] {
	return C.dims.map((nk, k) => {
		const dk = T(C.d[k + 1]); // δ_k : C^k → C^{k+1}
		const dkm1 = k > 0 ? T(C.d[k]) : []; // δ_{k−1} : C^{k−1} → C^k
		if (G.kind === 'Z') return group(nk - rankZ(dk) - rankZ(dkm1), torsionOf(dkm1));
		if (G.kind === 'Q') return group(nk - rankZ(dk) - rankZ(dkm1), [], 'Q');
		const p = G.n;
		const dim = nk - rankP(dk, p) - rankP(dkm1, p);
		return group(0, Array(dim).fill(p));
	});
}

/** The tensor product of two chain complexes (the cellular chains of a product space). */
export function tensorComplex(A: ChainComplex, B: ChainComplex): ChainComplex {
	const top = A.dims.length - 1 + B.dims.length - 1;
	// basis of (A⊗B)_n: pairs (i, a, j, b) with i + j = n
	const basis: { i: number; a: number; j: number; b: number }[][] = [];
	for (let n = 0; n <= top; n++) {
		const list = [];
		for (let i = 0; i < A.dims.length; i++) {
			const j = n - i;
			if (j < 0 || j >= B.dims.length) continue;
			for (let a = 0; a < A.dims[i]; a++) for (let b = 0; b < B.dims[j]; b++) list.push({ i, a, j, b });
		}
		basis.push(list);
	}
	const index = basis.map((list) => new Map(list.map((e, k) => [`${e.i},${e.a},${e.j},${e.b}`, k])));
	const d: Matrix[] = [[]];
	for (let n = 1; n <= top; n++) {
		const rows = basis[n - 1].length;
		const M: Matrix = Array.from({ length: rows }, () => new Array<number>(basis[n].length).fill(0));
		basis[n].forEach((e, col) => {
			// ∂(a ⊗ b) = ∂a ⊗ b + (−1)^{|a|} a ⊗ ∂b
			if (e.i > 0) {
				const dA = A.d[e.i];
				for (let r = 0; r < A.dims[e.i - 1]; r++) {
					const c = dA[r]?.[e.a] ?? 0;
					if (c) M[index[n - 1].get(`${e.i - 1},${r},${e.j},${e.b}`)!][col] += c;
				}
			}
			if (e.j > 0) {
				const dB = B.d[e.j];
				const sign = e.i % 2 === 0 ? 1 : -1;
				for (let r = 0; r < B.dims[e.j - 1]; r++) {
					const c = dB[r]?.[e.b] ?? 0;
					if (c) M[index[n - 1].get(`${e.i},${e.a},${e.j - 1},${r}`)!][col] += sign * c;
				}
			}
		});
		d.push(M);
	}
	return { dims: basis.map((l) => l.length), d };
}

/** A chain complex from a simplicial complex of the math engine. */
export function chainsOf(K: { dim: number; count(k: number): number; boundaryMatrix(k: number): number[][] }): ChainComplex {
	const dims: number[] = [];
	const d: Matrix[] = [[]];
	for (let k = 0; k <= K.dim; k++) {
		dims.push(K.count(k));
		if (k > 0) d.push(K.boundaryMatrix(k));
	}
	return { dims, d };
}

// ── cellular models of the book's spaces ───────────────────────────────────

export interface SpaceModel {
	id: string;
	/** TeX name */
	tex: string;
	/** plain name */
	name: string;
	/** a one-line description of the cell structure */
	cells: string;
	chains: ChainComplex;
}

const z = (r: number, c: number): Matrix => Array.from({ length: r }, () => new Array<number>(c).fill(0));

export const spaces: Record<string, SpaceModel> = {
	S1: { id: 'S1', tex: 'S^1', name: 'Circle', cells: 'one vertex, one edge', chains: { dims: [1, 1], d: [[], z(1, 1)] } },
	S2: { id: 'S2', tex: 'S^2', name: 'Sphere', cells: 'one vertex, one 2-cell', chains: { dims: [1, 0, 1], d: [[], [], []] } },
	T2: {
		id: 'T2',
		tex: 'T^2',
		name: 'Torus',
		cells: 'word aba⁻¹b⁻¹: ∂(face) = a + b − a − b = 0',
		chains: { dims: [1, 2, 1], d: [[], z(1, 2), z(2, 1)] }
	},
	RP2: {
		id: 'RP2',
		tex: '\\RP^2',
		name: 'Projective plane',
		cells: 'word aa: ∂(face) = 2a',
		chains: { dims: [1, 1, 1], d: [[], z(1, 1), [[2]]] }
	},
	K: {
		id: 'K',
		tex: 'K',
		name: 'Klein bottle',
		cells: 'word abab⁻¹: ∂(face) = 2a',
		chains: { dims: [1, 2, 1], d: [[], z(1, 2), [[2], [0]]] }
	},
	RP3: {
		id: 'RP3',
		tex: '\\RP^3',
		name: 'Projective 3-space',
		cells: 'one cell in each dimension; ∂ = 0, ×2, 0',
		chains: { dims: [1, 1, 1, 1], d: [[], z(1, 1), [[2]], z(1, 1)] }
	},
	L3: {
		id: 'L3',
		tex: 'L(3,1)',
		name: 'Lens space',
		cells: 'one cell in each dimension; ∂ = 0, ×3, 0',
		chains: { dims: [1, 1, 1, 1], d: [[], z(1, 1), [[3]], z(1, 1)] }
	}
};
