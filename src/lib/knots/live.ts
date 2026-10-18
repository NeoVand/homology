// A knot relaxing as you watch: the flow of repulse.ts, one step at a time and
// cheap enough to run many steps a second. Instead of holding every edge at
// its length (a constraint for every point, which makes each step cost as
// much as the rest put together), it holds only the barycentre and the length
// of each component, and every few steps it respaces the points evenly along
// the curve. The direction is still the fractional Sobolev gradient of Yu,
// Schumacher and Crane, and no point ever moves more than a quarter of the gap
// round its edges, so no strand passes through another and the knot type never
// changes.
//
// On request it lies down flat: it turns to the view with the fewest crossings,
// then a slab whose walls close in slowly presses it into a drawing, as in
// repulse.ts.
import type { V3 } from './diagram';
import { compsOf, curveOf, energy, gram, lu, Saddle, vertexGaps, type Curve } from './repulse';
import { resample } from './relax';

/** how stiff the slab's walls are (as in repulse.ts) */
const STIFF = 50;

export interface Relaxing {
	/** the tangent-point energy now (without the walls' push, when lying down) */
	E: number;
	/** steps taken */
	steps: number;
	/** no step lowers the energy any more */
	settled: boolean;
}

export class Relaxer {
	private C: Curve;
	private N: number;
	private counts: number[];
	private lengths: number[] = [];
	private bary: [number, number, number] = [0, 0, 0];
	private last = 0;
	private still = 0;
	private cycleE = Infinity;
	private stuck = 0;
	private wall = Infinity;
	private wallGoal = Infinity;
	private mid = 0;
	steps = 0;
	E = Infinity;
	/** with the walls' push, which is what the flow lowers */
	private total = Infinity;
	settled = false;

	/**
	 * `points` in all, shared out by the components' lengths; the curve is scaled so its edges are about 1
	 * long. `maxMove` limits how far any point moves in one step (in edge lengths), to slow the start down
	 * enough to be watched.
	 */
	constructor(
		comps: V3[][],
		private o: { points?: number; alpha?: number; beta?: number; maxMove?: number } = {}
	) {
		const len = (c: V3[]) => c.reduce((L, p, i) => L + Math.hypot(...([0, 1, 2].map((k) => c[(i + 1) % c.length][k] - p[k]) as V3)), 0);
		const L = comps.map(len);
		const total = L.reduce((a, b) => a + b, 0);
		const points = o.points ?? 140;
		this.counts = L.map((l) => Math.max(24, Math.round((points * l) / total)));
		const n = this.counts.reduce((a, b) => a + b, 0);
		const k = n / total;
		this.C = curveOf(comps.map((c, i) => resample(c, this.counts[i]).map((p) => [p[0] * k, p[1] * k, p[2] * k] as V3)));
		this.N = n;
		this.fixTargets();
		this.E = this.total = energy(this.C, undefined, o.alpha ?? 3, o.beta ?? 6);
	}

	private fixTargets() {
		const { X, starts, counts, next } = this.C;
		this.lengths = starts.map((s, c) => {
			let L = 0;
			for (let i = s; i < s + counts[c]; i++) L += dist(X, i, next[i]);
			return L;
		});
		this.bary = [0, 1, 2].map((ax) => {
			let t = 0;
			for (let i = 0; i < this.N; i++) t += X[3 * i + ax];
			return t / this.N;
		}) as [number, number, number];
	}

	/** the rows of the constraints: the barycentre (x, y, z), then each component's length */
	private rows(): Float64Array[] {
		const { X, starts, counts, next, prev } = this.C;
		const N = this.N;
		const rows: Float64Array[] = [];
		for (let ax = 0; ax < 3; ax++) {
			const r = new Float64Array(3 * N);
			for (let i = 0; i < N; i++) r[3 * i + ax] = 1 / N;
			rows.push(r);
		}
		starts.forEach((s, c) => {
			const r = new Float64Array(3 * N);
			for (let i = s; i < s + counts[c]; i++) {
				// d|x_i − x_prev| + d|x_next − x_i| with respect to x_i
				const a = prev[i];
				const b = next[i];
				const la = dist(X, i, a) || 1;
				const lb = dist(X, b, i) || 1;
				for (let k = 0; k < 3; k++) r[3 * i + k] = (X[3 * i + k] - X[3 * a + k]) / la - (X[3 * b + k] - X[3 * i + k]) / lb;
			}
			rows.push(r);
		});
		return rows;
	}

	private violation(): { h: Float64Array; worst: number } {
		const { X, starts, counts, next } = this.C;
		const h = new Float64Array(3 + starts.length);
		for (let ax = 0; ax < 3; ax++) {
			let t = 0;
			for (let i = 0; i < this.N; i++) t += X[3 * i + ax];
			h[ax] = this.bary[ax] - t / this.N;
		}
		starts.forEach((s, c) => {
			let L = 0;
			for (let i = s; i < s + counts[c]; i++) L += dist(X, i, next[i]);
			h[3 + c] = this.lengths[c] - L;
		});
		let worst = 0;
		for (const x of h) worst = Math.max(worst, Math.abs(x));
		return { h, worst };
	}

	private penalty(G?: Float64Array): number {
		if (this.wall === Infinity) return 0;
		let P = 0;
		const X = this.C.X;
		for (let i = 0; i < this.N; i++) {
			const z = X[3 * i + 2] - this.mid;
			const over = Math.abs(z) - this.wall;
			if (over <= 0) continue;
			P += STIFF * over * over;
			if (G) G[3 * i + 2] += 2 * STIFF * over * Math.sign(z);
		}
		return P;
	}

	/**
	 * Lie down flat in a slab |z − mid| ≤ h, h this fraction of the radius of a circle as long as the curve,
	 * after turning so that `rotate` maps the current shape to its view from above (a rotation matrix,
	 * row by row). The walls start out round the whole knot and close in over a few dozen steps.
	 */
	flatten(slab: number, rotate?: number[]) {
		const X = this.C.X;
		if (rotate) {
			for (let i = 0; i < this.N; i++) {
				const [x, y, z] = [X[3 * i], X[3 * i + 1], X[3 * i + 2]];
				for (let r = 0; r < 3; r++) X[3 * i + r] = rotate[3 * r] * x + rotate[3 * r + 1] * y + rotate[3 * r + 2] * z;
			}
			this.fixTargets();
		}
		let high = 0;
		this.mid = this.bary[2];
		for (let i = 0; i < this.N; i++) high = Math.max(high, Math.abs(X[3 * i + 2] - this.mid));
		const total = this.lengths.reduce((a, b) => a + b, 0);
		this.wallGoal = (slab * total) / (2 * Math.PI);
		this.wall = Math.max(this.wallGoal, high);
		this.settled = false;
		this.still = 0;
		this.cycleE = Infinity;
	}

	/** one step of the flow */
	step(): Relaxing {
		if (this.settled) return this;
		const C = this.C;
		const N = this.N;
		// the walls close in, a little each step, but only as fast as the knot can follow them
		if (this.wall < Infinity && this.wall > this.wallGoal) {
			let over = 0;
			for (let i = 0; i < N; i++) over = Math.max(over, Math.abs(C.X[3 * i + 2] - this.mid) - this.wall);
			if (over < 0.05 * this.wall) this.wall = Math.max(this.wallGoal, this.wall * 0.97 - 0.002);
		}
		// every so often, respace the points evenly (the flow lets them drift along the curve); respacing
		// cuts corners and shortens a component a little, so it is then scaled about its own centre back to
		// the length it should have
		// It has settled when a whole cycle between respacings no longer lowers the energy (respacing
		// itself nudges it a little either way), twice running, with the walls (if any) all the way in.
		if (this.steps % 20 === 19) {
			const closing = this.wall < Infinity && this.wall > this.wallGoal;
			this.still = this.cycleE - this.total < 1e-6 * this.total && !closing ? this.still + 1 : 0;
			this.cycleE = this.total;
			if (this.still >= 2) {
				this.settled = true;
				return this;
			}
			const comps = compsOf(C).map((c, i) => resample(c, this.counts[i]));
			comps.forEach((c, k) => {
				const m = [0, 1, 2].map((ax) => c.reduce((a, p) => a + p[ax], 0) / c.length);
				const L = c.reduce((a, p, i) => a + Math.hypot(...([0, 1, 2].map((ax) => c[(i + 1) % c.length][ax] - p[ax]) as V3)), 0);
				const f = this.lengths[k] / L;
				c.forEach((p, i) => C.X.set([0, 1, 2].map((ax) => m[ax] + f * (p[ax] - m[ax])), 3 * (C.starts[k] + i)));
			});
		}
		const G = new Float64Array(3 * N);
		const E = energy(C, G, this.o.alpha ?? 3, this.o.beta ?? 6) + this.penalty(G);
		const A = gram(C, this.o.alpha ?? 3, this.o.beta ?? 6);
		let Az: { A: Float64Array; p: Int32Array } | undefined;
		if (this.wall < Infinity) {
			const B = A.slice();
			for (let i = 0; i < N; i++) if (Math.abs(C.X[3 * i + 2] - this.mid) > this.wall) B[i * N + i] += 2 * STIFF;
			Az = { A: B, p: lu(B, N) };
		}
		const rows = this.rows();
		const sys = new Saddle(N, A, lu(A, N), rows, Az);
		const D = sys.solve(G, new Float64Array(rows.length));
		let dot = 0;
		let dn = 0;
		for (let q = 0; q < 3 * N; q++) {
			dot += G[q] * D[q];
			dn += D[q] * D[q];
		}
		this.steps++;
		if (!(dot > 1e-14)) return this.rest();
		// the step: no point moves more than a quarter of the gap round its edges
		const gv = vertexGaps(C);
		let cap = Infinity;
		for (let i = 0; i < N; i++) {
			const m = Math.hypot(D[3 * i], D[3 * i + 1], D[3 * i + 2]);
			if (m > 0) cap = Math.min(cap, (0.25 * gv[i]) / m, (this.wall < Infinity ? Infinity : (this.o.maxMove ?? Infinity)) / m);
		}
		const dnorm = Math.sqrt(dn);
		let tau = Math.min(cap, this.last > 0 ? this.last * 1.5 : dnorm > 1 ? 1 / dnorm : 1 / Math.sqrt(dnorm));
		const X0 = C.X.slice();
		const zero = new Float64Array(3 * N);
		while (tau > 1e-9) {
			for (let q = 0; q < 3 * N; q++) C.X[q] = X0[q] - tau * D[q];
			for (let it = 0; it < 3; it++) {
				const { h, worst } = this.violation();
				if (worst < 1e-9) break;
				const corr = sys.solve(zero, h);
				for (let q = 0; q < 3 * N; q++) C.X[q] += corr[q];
			}
			const tp = energy(C, undefined, this.o.alpha ?? 3, this.o.beta ?? 6);
			const E1 = tp + this.penalty();
			if (E - E1 >= 0.01 * tau * dot && this.violation().worst < 1e-5) {
				this.last = tau;
				this.E = tp;
				this.total = E1;
				this.stuck = 0;
				return this;
			}
			tau /= 2;
		}
		C.X.set(X0);
		return this.rest();
	}

	/** no step lowered the energy: try again from a short step, and call it settled after a few such tries */
	private rest(): Relaxing {
		this.last = 0;
		this.stuck++;
		const closing = this.wall < Infinity && this.wall > this.wallGoal;
		if (!closing && this.stuck >= 3) this.settled = true;
		return this;
	}

	/** the shape now, in the solver's units (edges about 1 long) */
	shape(): V3[][] {
		return compsOf(this.C);
	}
}

const dist = (X: Float64Array, i: number, j: number) => Math.hypot(X[3 * i] - X[3 * j], X[3 * i + 1] - X[3 * j + 1], X[3 * i + 2] - X[3 * j + 2]);

/**
 * Tangle a knot without changing it: carry it along the flows of a few random swirls (each turns the space
 * near a random centre about a random axis, less and less further out). The flow of a smooth field moves
 * all of space and never tears it, so the knot only gets more tangled, never another knot; `seed` makes
 * the same tangle each time.
 */
export function tangle(comps: V3[][], seed: number, o: { swirls?: number; strength?: number } = {}): V3[][] {
	let s = seed >>> 0 || 1;
	const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
	const pts = comps.map((c) => resample(c, 900));
	const all = pts.flat();
	const c0 = [0, 1, 2].map((k) => all.reduce((a, p) => a + p[k], 0) / all.length);
	const size = Math.max(...all.map((p) => Math.hypot(p[0] - c0[0], p[1] - c0[1], p[2] - c0[2])));
	const swirls = o.swirls ?? 7;
	const strength = o.strength ?? 2.6;
	for (let w = 0; w < swirls; w++) {
		// a centre somewhere in the knot's ball, an axis, a reach and a turn
		const u = rnd() * 2 - 1;
		const ph = rnd() * Math.PI * 2;
		const ax: V3 = [Math.sqrt(1 - u * u) * Math.cos(ph), Math.sqrt(1 - u * u) * Math.sin(ph), u];
		const r = size * (0.15 + 0.55 * rnd());
		const pick = all[Math.floor(rnd() * all.length)];
		const c: V3 = [pick[0] + r * (rnd() - 0.5), pick[1] + r * (rnd() - 0.5), pick[2] + r * (rnd() - 0.5)];
		const sigma = size * (0.35 + 0.35 * rnd());
		const turn = strength * (rnd() < 0.5 ? -1 : 1) * (0.6 + 0.8 * rnd());
		const v = (p: V3): V3 => {
			const d: V3 = [p[0] - c[0], p[1] - c[1], p[2] - c[2]];
			const f = turn * Math.exp(-(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]) / (sigma * sigma));
			return [f * (ax[1] * d[2] - ax[2] * d[1]), f * (ax[2] * d[0] - ax[0] * d[2]), f * (ax[0] * d[1] - ax[1] * d[0])];
		};
		// carry every point along the flow for unit time (midpoint rule, small steps)
		const K = 40;
		for (const comp of pts)
			for (const p of comp)
				for (let k = 0; k < K; k++) {
					const a = v(p);
					const m: V3 = [p[0] + (a[0] * 0.5) / K, p[1] + (a[1] * 0.5) / K, p[2] + (a[2] * 0.5) / K];
					const b = v(m);
					p[0] += b[0] / K;
					p[1] += b[1] / K;
					p[2] += b[2] / K;
				}
	}
	return pts;
}
