// Knots in their most relaxed shapes, after Yu, Schumacher and Crane,
// "Repulsive Curves" (ACM Transactions on Graphics, 2021), and their code
// (github.com/ythea/repulsive-curves, MIT licence), which this follows.
//
// The tangent-point energy of a polygon,
//
//     E = Σ over pairs of edges I, J with no vertex in common of
//         ℓ_I ℓ_J · ¼ Σ_{i ∈ I, j ∈ J} |T_I × (x_i − x_j)|^α / |x_i − x_j|^β,
//
// grows without bound as two strands approach each other and as the curve
// bends sharply, so its low-energy shapes are smooth, evenly spread and far
// from touching themselves: the shapes of a table of knots. We use α = 3,
// β = 6, as their knot examples do.
//
// The descent does not follow the plain gradient, which would need thousands
// of tiny steps, but the gradient for the fractional Sobolev–Slobodeckij inner
// product of order s = (β − 1)/α that matches the energy (their Gram matrix:
// a high-order term on differences of derivatives across pairs of edges,
// weighted by 1/|x − y|^(2s − 1), and a low-order term with a tangent-point
// kernel). Every edge keeps its length and the barycentre stays put: the
// direction is found from the saddle-point system with these constraints,
// the step length by an Armijo line search, and a few Newton steps through the
// same system put the constraints right afterwards. On top of that no point
// may move more than a quarter of the gap between its edges and the nearest
// other strand, so no strand can ever pass through another, and the knot type
// never changes.
import type { V3 } from './diagram';
import { resample, segGap } from './relax';

interface Curve {
	/** positions, x0 y0 z0 x1 … */
	X: Float64Array;
	/** first vertex and vertex count of each component */
	starts: number[];
	counts: number[];
	/** the vertex after each vertex, around its component (edge i runs from i to next[i]) */
	next: Int32Array;
	prev: Int32Array;
}

function curveOf(comps: V3[][]): Curve {
	const N = comps.reduce((a, c) => a + c.length, 0);
	const X = new Float64Array(3 * N);
	const next = new Int32Array(N);
	const prev = new Int32Array(N);
	const starts: number[] = [];
	const counts: number[] = [];
	let p = 0;
	for (const c of comps) {
		starts.push(p);
		counts.push(c.length);
		c.forEach((x, i) => {
			X.set(x, 3 * (p + i));
			next[p + i] = p + ((i + 1) % c.length);
			prev[p + i] = p + ((i - 1 + c.length) % c.length);
		});
		p += c.length;
	}
	return { X, starts, counts, next, prev };
}

function compsOf(C: Curve): V3[][] {
	return C.starts.map((s, k) => Array.from({ length: C.counts[k] }, (_, i) => [C.X[3 * (s + i)], C.X[3 * (s + i) + 1], C.X[3 * (s + i) + 2]] as V3));
}

/** do edges I = (I, next I) and J = (J, next J) share no vertex? */
const disjoint = (C: Curve, I: number, J: number) => I !== J && C.next[I] !== J && C.next[J] !== I;

/** the tangent-point energy E_α^β, and (if G is given) its gradient, added into G */
export function energy(C: Curve, G?: Float64Array, alpha = 3, beta = 6): number {
	const { X, next } = C;
	const N = next.length;
	let E = 0;
	const h = alpha / 2;
	for (let I = 0; I < N; I++) {
		const a = I;
		const b = next[I];
		const ux = X[3 * b] - X[3 * a];
		const uy = X[3 * b + 1] - X[3 * a + 1];
		const uz = X[3 * b + 2] - X[3 * a + 2];
		const uu = ux * ux + uy * uy + uz * uz;
		const lI = Math.sqrt(uu);
		for (let J = 0; J < N; J++) {
			if (!disjoint(C, I, J)) continue;
			const c = J;
			const e = next[J];
			const vx = X[3 * e] - X[3 * c];
			const vy = X[3 * e + 1] - X[3 * c + 1];
			const vz = X[3 * e + 2] - X[3 * c + 2];
			const lJ = Math.sqrt(vx * vx + vy * vy + vz * vz);
			// ℓ_I ℓ_J |T_I × d|^α = A |u × d|^α with A = ℓ_J ℓ_I^(1−α); the ¼ averages the endpoint pairs
			const A = (lJ * Math.pow(lI, 1 - alpha)) / 4;
			let S = 0;
			let gux = 0;
			let guy = 0;
			let guz = 0;
			for (let p = 0; p < 2; p++)
				for (let q = 0; q < 2; q++) {
					const i = p ? b : a;
					const j = q ? e : c;
					const dx = X[3 * i] - X[3 * j];
					const dy = X[3 * i + 1] - X[3 * j + 1];
					const dz = X[3 * i + 2] - X[3 * j + 2];
					const dd = dx * dx + dy * dy + dz * dz;
					const ud = ux * dx + uy * dy + uz * dz;
					// c2 = |u × d|², f = c2^(α/2) |d|^−β
					const c2 = Math.max(0, uu * dd - ud * ud);
					const pw = Math.pow(dd, -beta / 2);
					const ch = Math.pow(c2, h);
					S += ch * pw;
					if (G) {
						const dch = c2 > 0 ? h * Math.pow(c2, h - 1) : 0;
						// ∂f/∂d = (α/2) c2^(α/2 − 1) (2|u|² d − 2(u·d) u) |d|^−β − β c2^(α/2) |d|^(−β−2) d
						const k1 = 2 * dch * uu * pw - (beta * ch * pw) / dd;
						const k2 = -2 * dch * ud * pw;
						const fx = A * (k1 * dx + k2 * ux);
						const fy = A * (k1 * dy + k2 * uy);
						const fz = A * (k1 * dz + k2 * uz);
						G[3 * i] += fx;
						G[3 * i + 1] += fy;
						G[3 * i + 2] += fz;
						G[3 * j] -= fx;
						G[3 * j + 1] -= fy;
						G[3 * j + 2] -= fz;
						// ∂f/∂u = (α/2) c2^(α/2 − 1) (2|d|² u − 2(u·d) d) |d|^−β
						const m = 2 * dch * pw;
						gux += m * (dd * ux - ud * dx);
						guy += m * (dd * uy - ud * dy);
						guz += m * (dd * uz - ud * dz);
					}
				}
			E += A * S;
			if (G) {
				// ∂A/∂u = (1 − α) A u / ℓ_I², ∂A/∂v = A v / ℓ_J²
				const su = ((1 - alpha) * A * S) / uu;
				const tx = A * gux + su * ux;
				const ty = A * guy + su * uy;
				const tz = A * guz + su * uz;
				G[3 * b] += tx;
				G[3 * b + 1] += ty;
				G[3 * b + 2] += tz;
				G[3 * a] -= tx;
				G[3 * a + 1] -= ty;
				G[3 * a + 2] -= tz;
				const sv = (A * S) / (lJ * lJ);
				G[3 * e] += sv * vx;
				G[3 * e + 1] += sv * vy;
				G[3 * e + 2] += sv * vz;
				G[3 * c] -= sv * vx;
				G[3 * c + 1] -= sv * vy;
				G[3 * c + 2] -= sv * vz;
			}
		}
	}
	return E;
}

/**
 * The Gram matrix of the fractional Sobolev–Slobodeckij inner product on functions on the vertices
 * (one copy for each coordinate), as in SobolevCurves::SobolevGramMatrix of the authors' code.
 */
function gram(C: Curve, alpha: number, beta: number): Float64Array {
	const { X, next } = C;
	const N = next.length;
	const A = new Float64Array(N * N);
	const s = (beta - 1) / alpha;
	const sigma = 2 * (s - 1) + 1;
	const lowB = 4 + sigma;
	// per edge: length, midpoint, unit tangent
	const len = new Float64Array(N);
	const mid = new Float64Array(3 * N);
	const tan = new Float64Array(3 * N);
	for (let I = 0; I < N; I++) {
		const b = next[I];
		const ex = X[3 * b] - X[3 * I];
		const ey = X[3 * b + 1] - X[3 * I + 1];
		const ez = X[3 * b + 2] - X[3 * I + 2];
		const l = Math.hypot(ex, ey, ez);
		len[I] = l;
		mid[3 * I] = (X[3 * b] + X[3 * I]) / 2;
		mid[3 * I + 1] = (X[3 * b + 1] + X[3 * I + 1]) / 2;
		mid[3 * I + 2] = (X[3 * b + 2] + X[3 * I + 2]) / 2;
		tan[3 * I] = ex / l;
		tan[3 * I + 1] = ey / l;
		tan[3 * I + 2] = ez / l;
	}
	const ends = [0, 0, 0, 0];
	// a hat function's gradient on an edge is ∓T/ℓ at the edge's start and end, 0 elsewhere: keep the coefficient
	const coef = [0, 0, 0, 0];
	for (let I = 0; I < N; I++)
		for (let J = 0; J < N; J++) {
			if (!disjoint(C, I, J)) continue;
			const dx = mid[3 * I] - mid[3 * J];
			const dy = mid[3 * I + 1] - mid[3 * J + 1];
			const dz = mid[3 * I + 2] - mid[3 * J + 2];
			const dd = dx * dx + dy * dy + dz * dz;
			const r = Math.sqrt(dd);
			const area = len[I] * len[J];
			const high = area / Math.pow(r, sigma);
			// symmetric tangent-point kernel with (a, b) = (2, 4 + σ): ½(|P⊥_I d|² + |P⊥_J d|²) / |d|^b
			const tI = dx * tan[3 * I] + dy * tan[3 * I + 1] + dz * tan[3 * I + 2];
			const tJ = dx * tan[3 * J] + dy * tan[3 * J + 1] + dz * tan[3 * J + 2];
			const low = (area * 0.5 * (dd - tI * tI + dd - tJ * tJ)) / Math.pow(r, lowB);
			// the four vertices: start and end of I, start and end of J
			ends[0] = I;
			ends[1] = next[I];
			ends[2] = J;
			ends[3] = next[J];
			coef[0] = -1 / len[I];
			coef[1] = 1 / len[I];
			coef[2] = -1 / len[J];
			coef[3] = 1 / len[J];
			// T_I · T_J, for the dot products of hat gradients on different edges
			const tt = tan[3 * I] * tan[3 * J] + tan[3 * I + 1] * tan[3 * J + 1] + tan[3 * I + 2] * tan[3 * J + 2];
			for (let p = 0; p < 4; p++)
				for (let q = 0; q < 4; q++) {
					// (ĝ_u|I − ĝ_u|J) · (ĝ_v|I − ĝ_v|J): a vertex of I has no hat gradient on J, and vice versa
					const ui = p < 2 ? coef[p] : 0;
					const uj = p < 2 ? 0 : coef[p];
					const vi = q < 2 ? coef[q] : 0;
					const vj = q < 2 ? 0 : coef[q];
					const numer = ui * vi + uj * vj - (ui * vj + uj * vi) * tt;
					// hat values at the midpoints: ½ on its own edge, 0 on the other
					const hu = p < 2 ? 0.5 : -0.5;
					const hv = q < 2 ? 0.5 : -0.5;
					A[ends[p] * N + ends[q]] += numer * high + hu * hv * low;
				}
		}
	// constants cost nothing (the barycentre constraint takes care of them): a touch on the diagonal, as
	// the authors' diagEps, keeps the matrix invertible for the Schur complement
	let trace = 0;
	for (let i = 0; i < N; i++) trace += A[i * N + i];
	for (let i = 0; i < N; i++) A[i * N + i] += (1e-6 * trace) / N;
	return A;
}

/** LU factorisation with partial pivoting of a dense n × n matrix (in place); returns the pivots */
function lu(M: Float64Array, n: number): Int32Array {
	const piv = new Int32Array(n);
	for (let k = 0; k < n; k++) {
		let p = k;
		for (let r = k + 1; r < n; r++) if (Math.abs(M[r * n + k]) > Math.abs(M[p * n + k])) p = r;
		piv[k] = p;
		if (p !== k)
			for (let j = 0; j < n; j++) {
				const t = M[k * n + j];
				M[k * n + j] = M[p * n + j];
				M[p * n + j] = t;
			}
		const d = M[k * n + k];
		for (let r = k + 1; r < n; r++) {
			const f = (M[r * n + k] /= d);
			if (!f) continue;
			for (let j = k + 1; j < n; j++) M[r * n + j] -= f * M[k * n + j];
		}
	}
	return piv;
}

function luSolve(M: Float64Array, piv: Int32Array, n: number, b: Float64Array): void {
	for (let k = 0; k < n; k++) {
		const p = piv[k];
		if (p !== k) {
			const t = b[k];
			b[k] = b[p];
			b[p] = t;
		}
		for (let r = k + 1; r < n; r++) b[r] -= M[r * n + k] * b[k];
	}
	for (let k = n - 1; k >= 0; k--) {
		let acc = b[k];
		for (let j = k + 1; j < n; j++) acc -= M[k * n + j] * b[j];
		b[k] = acc / M[k * n + k];
	}
}

/**
 * The saddle-point system [A₃ Cᵀ; C 0], with A₃ the Gram matrix for each coordinate and C the
 * derivative of the constraints (barycentre, every edge length), solved by its Schur complement.
 */
class Saddle {
	private Z: Float64Array; // A₃⁻¹ Cᵀ, column by column (m columns of length 3N)
	private K: Float64Array; // C A₃⁻¹ Cᵀ, factorised
	private Kp: Int32Array;
	constructor(
		private N: number,
		private A: Float64Array,
		private Ap: Int32Array,
		private rows: Float64Array[]
	) {
		const m = rows.length;
		this.Z = new Float64Array(m * 3 * N);
		for (let r = 0; r < m; r++) this.Z.set(this.solveA(rows[r]), r * 3 * N);
		this.K = new Float64Array(m * m);
		for (let r = 0; r < m; r++)
			for (let c = 0; c < m; c++) {
				let t = 0;
				const row = rows[r];
				const off = c * 3 * N;
				for (let q = 0; q < 3 * N; q++) if (row[q]) t += row[q] * this.Z[off + q];
				this.K[r * m + c] = t;
			}
		this.Kp = lu(this.K, m);
	}
	/** A₃⁻¹ g, coordinate by coordinate */
	solveA(g: Float64Array): Float64Array {
		const N = this.N;
		const out = new Float64Array(3 * N);
		const b = new Float64Array(N);
		for (let ax = 0; ax < 3; ax++) {
			for (let i = 0; i < N; i++) b[i] = g[3 * i + ax];
			luSolve(this.A, this.Ap, N, b);
			for (let i = 0; i < N; i++) out[3 * i + ax] = b[i];
		}
		return out;
	}
	/** x with A₃ x + Cᵀ λ = g and C x = h */
	solve(g: Float64Array, h: Float64Array): Float64Array {
		const N = this.N;
		const m = this.rows.length;
		const y = this.solveA(g);
		const lam = new Float64Array(m);
		for (let r = 0; r < m; r++) {
			let t = -h[r];
			const row = this.rows[r];
			for (let q = 0; q < 3 * N; q++) if (row[q]) t += row[q] * y[q];
			lam[r] = t;
		}
		luSolve(this.K, this.Kp, m, lam);
		for (let r = 0; r < m; r++) {
			const off = r * 3 * N;
			for (let q = 0; q < 3 * N; q++) y[q] -= this.Z[off + q] * lam[r];
		}
		return y;
	}
}

const edgeLength = (C: Curve, i: number) => {
	const { X, next } = C;
	const j = next[i];
	return Math.hypot(X[3 * j] - X[3 * i], X[3 * j + 1] - X[3 * i + 1], X[3 * j + 2] - X[3 * i + 2]);
};

/** the derivative of the constraints at the current positions: barycentre (weighted by dual lengths), then edge lengths */
function constraintRows(C: Curve): Float64Array[] {
	const { X, next, prev } = C;
	const N = next.length;
	let total = 0;
	for (let i = 0; i < N; i++) total += edgeLength(C, i);
	const rows: Float64Array[] = [];
	for (let ax = 0; ax < 3; ax++) {
		const row = new Float64Array(3 * N);
		for (let i = 0; i < N; i++) row[3 * i + ax] = (edgeLength(C, i) + edgeLength(C, prev[i])) / 2 / total;
		rows.push(row);
	}
	for (let I = 0; I < N; I++) {
		const b = next[I];
		const l = edgeLength(C, I);
		const row = new Float64Array(3 * N);
		for (let k = 0; k < 3; k++) {
			const t = (X[3 * b + k] - X[3 * I + k]) / l;
			row[3 * b + k] = t;
			row[3 * I + k] = -t;
		}
		rows.push(row);
	}
	return rows;
}

/** the constraints' values: barycentre, then edge lengths */
function constraintValues(C: Curve): Float64Array {
	const { X, next, prev } = C;
	const N = next.length;
	let total = 0;
	for (let i = 0; i < N; i++) total += edgeLength(C, i);
	const out = new Float64Array(3 + N);
	for (let i = 0; i < N; i++) {
		const w = (edgeLength(C, i) + edgeLength(C, prev[i])) / 2 / total;
		for (let ax = 0; ax < 3; ax++) out[ax] += w * X[3 * i + ax];
	}
	for (let I = 0; I < N; I++) out[3 + I] = edgeLength(C, I);
	return out;
}

/** for each vertex, the smallest distance from its two edges to an edge they share no point with */
function vertexGaps(C: Curve): Float64Array {
	const { X, next } = C;
	const N = next.length;
	const P = (i: number): V3 => [X[3 * i], X[3 * i + 1], X[3 * i + 2]];
	const edge = new Float64Array(N).fill(Infinity);
	for (let I = 0; I < N; I++)
		for (let J = I + 1; J < N; J++) {
			if (!disjoint(C, I, J)) continue;
			const g = segGap(P(I), P(next[I]), P(J), P(next[J]));
			if (g < edge[I]) edge[I] = g;
			if (g < edge[J]) edge[J] = g;
		}
	const gv = new Float64Array(N);
	for (let I = 0; I < N; I++) gv[I] = Math.min(edge[I], edge[C.prev[I]]);
	return gv;
}

/** turn the curve so that it spreads most along x, then y, and is flattest along z (a proper rotation) */
function principalAxes(comps: V3[][]): V3[][] {
	const pts = comps.flat();
	const c = [0, 0, 0];
	for (const p of pts) for (let k = 0; k < 3; k++) c[k] += p[k] / pts.length;
	const A = [
		[0, 0, 0],
		[0, 0, 0],
		[0, 0, 0]
	];
	for (const p of pts) for (let r = 0; r < 3; r++) for (let s = 0; s < 3; s++) A[r][s] += (p[r] - c[r]) * (p[s] - c[s]);
	// Jacobi eigenvalue iteration on the 3×3 covariance
	const V = [
		[1, 0, 0],
		[0, 1, 0],
		[0, 0, 1]
	];
	for (let sweep = 0; sweep < 50; sweep++)
		for (const [p, q] of [
			[0, 1],
			[0, 2],
			[1, 2]
		]) {
			if (Math.abs(A[p][q]) < 1e-14) continue;
			const th = 0.5 * Math.atan2(2 * A[p][q], A[q][q] - A[p][p]);
			const cs = Math.cos(th);
			const sn = Math.sin(th);
			for (let k = 0; k < 3; k++) {
				const akp = A[k][p];
				const akq = A[k][q];
				A[k][p] = cs * akp - sn * akq;
				A[k][q] = sn * akp + cs * akq;
			}
			for (let k = 0; k < 3; k++) {
				const apk = A[p][k];
				const aqk = A[q][k];
				A[p][k] = cs * apk - sn * aqk;
				A[q][k] = sn * apk + cs * aqk;
			}
			for (let k = 0; k < 3; k++) {
				const vkp = V[k][p];
				const vkq = V[k][q];
				V[k][p] = cs * vkp - sn * vkq;
				V[k][q] = sn * vkp + cs * vkq;
			}
		}
	const order = [0, 1, 2].sort((i, j) => A[j][j] - A[i][i]);
	const axes = order.map((i) => [V[0][i], V[1][i], V[2][i]]);
	// keep it a rotation, not a reflection, so a knot never turns into its mirror image
	const [e0, e1] = axes;
	axes[2] = [e0[1] * e1[2] - e0[2] * e1[1], e0[2] * e1[0] - e0[0] * e1[2], e0[0] * e1[1] - e0[1] * e1[0]];
	return comps.map((cc) =>
		cc.map((p) => {
			const d = [p[0] - c[0], p[1] - c[1], p[2] - c[2]];
			return axes.map((a) => a[0] * d[0] + a[1] * d[1] + a[2] * d[2]) as V3;
		})
	);
}

export interface RepulseOptions {
	/** points in all, shared out in proportion to the components' lengths (default 160) */
	points?: number;
	/** most descent steps (default 600) */
	steps?: number;
	/** the energy's exponents (default 3 and 6) */
	alpha?: number;
	beta?: number;
	/** largest distance from the centre in the result (default 1.8) */
	size?: number;
	/** how far to nudge the start, in edge lengths, to break its symmetry (default 0.02; 0 keeps a
	 *  symmetric start symmetric, so that it settles to the best shape with that symmetry) */
	nudge?: number;
	/** called after every step with the step number, the energy and the step length */
	log?: (step: number, E: number, tau: number) => void;
}

/**
 * Let a knot or link settle into a low-energy shape for the tangent-point energy. The result is
 * centred, turned to its principal axes (flattest along z) and scaled to the given size.
 */
export function repulse(comps: V3[][], opts: RepulseOptions = {}): V3[][] {
	const alpha = opts.alpha ?? 3;
	const beta = opts.beta ?? 6;
	const points = opts.points ?? 160;
	const lens = comps.map((c) => c.reduce((L, p, i) => L + Math.hypot(...([0, 1, 2].map((k) => c[(i + 1) % c.length][k] - p[k]) as V3)), 0));
	const total = lens.reduce((a, b) => a + b, 0);
	const counts = lens.map((L) => Math.max(24, Math.round((points * L) / total)));
	// evenly spaced points, scaled so that the spacing is about 1
	const C = curveOf(comps.map((c, k) => resample(c, counts[k])));
	const N = C.next.length;
	{
		let mean = 0;
		for (let I = 0; I < N; I++) mean += edgeLength(C, I) / N;
		for (let q = 0; q < 3 * N; q++) C.X[q] /= mean;
		// a nudge of a hundredth of an edge (the same every time): a perfectly symmetric start, such as a
		// closed braid, would otherwise keep its symmetry and can come to rest at a symmetric saddle
		let seed = 12345;
		const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648) - 0.5;
		const nudge = opts.nudge ?? 0.02;
		for (let q = 0; q < 3 * N; q++) C.X[q] += nudge * rnd();
	}
	// the constraints' targets: the barycentre where it is, and every edge the mean length
	const target = constraintValues(C);
	{
		let mean = 0;
		for (let I = 0; I < N; I++) mean += target[3 + I] / N;
		for (let I = 0; I < N; I++) target[3 + I] = mean;
	}
	const violation = () => {
		const v = constraintValues(C);
		const h = new Float64Array(v.length);
		let worst = 0;
		for (let r = 0; r < v.length; r++) {
			h[r] = target[r] - v[r];
			worst = Math.max(worst, Math.abs(h[r]));
		}
		return { h, worst };
	};
	const zero = new Float64Array(3 * N);
	let last = 0;
	let still = 0;
	for (let step = 0; step < (opts.steps ?? 600); step++) {
		const G = new Float64Array(3 * N);
		const E = energy(C, G, alpha, beta);
		const A = gram(C, alpha, beta);
		const Ap = lu(A, N);
		const sys = new Saddle(N, A, Ap, constraintRows(C));
		// the Sobolev gradient, tangent to the constraints
		const D = sys.solve(G, new Float64Array(3 + N));
		let dot = 0;
		let dn = 0;
		for (let q = 0; q < 3 * N; q++) {
			dot += G[q] * D[q];
			dn += D[q] * D[q];
		}
		if (dot <= 1e-14) break;
		// line search along −D (Armijo), starting from the last step, never moving a point further than a
		// quarter of the gap round its own edges
		const gv = vertexGaps(C);
		let cap = Infinity;
		for (let i = 0; i < N; i++) {
			const m = Math.hypot(D[3 * i], D[3 * i + 1], D[3 * i + 2]);
			if (m > 0) cap = Math.min(cap, (0.25 * gv[i]) / m);
		}
		const dnorm = Math.sqrt(dn);
		let tau = Math.min(cap, last > 0 ? last * 1.5 : dnorm > 1 ? 1 / dnorm : 1 / Math.sqrt(dnorm));
		const X0 = C.X.slice();
		let accepted = 0;
		let E1 = E;
		while (tau > 1e-10) {
			for (let q = 0; q < 3 * N; q++) C.X[q] = X0[q] - tau * D[q];
			// put the constraints right with a few Newton steps through the same system
			for (let it = 0; it < 3; it++) {
				const { h, worst } = violation();
				if (worst < 1e-9) break;
				const corr = sys.solve(zero, h);
				for (let q = 0; q < 3 * N; q++) C.X[q] += corr[q];
			}
			E1 = energy(C, undefined, alpha, beta);
			if (E - E1 >= 0.01 * tau * dot && violation().worst < 1e-5) {
				accepted = tau;
				break;
			}
			tau /= 2;
		}
		if (!accepted) {
			C.X.set(X0);
			break;
		}
		opts.log?.(step, E1, accepted);
		last = accepted;
		// stop once the energy has hardly moved for a while (near a saddle it creeps before it runs)
		still = (E - E1) / E < 1e-9 ? still + 1 : 0;
		if (still > 40) break;
	}
	// centre, turn to the principal axes, scale to size
	const out = principalAxes(compsOf(C));
	let reach = 0;
	for (const c of out) for (const p of c) reach = Math.max(reach, Math.hypot(p[0], p[1], p[2]));
	const k = (opts.size ?? 1.8) / reach;
	return out.map((c) => c.map((p) => [p[0] * k, p[1] * k, p[2] * k] as V3));
}

export const _internal = { curveOf, gram, constraintValues };
