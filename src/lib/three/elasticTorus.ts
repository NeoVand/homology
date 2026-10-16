// An elastic torus surface, simulated with XPBD (extended position-based
// dynamics; Macklin, Müller & Chentanez 2016, run as "small steps": many
// substeps, one constraint pass each; Macklin et al. 2019).
//
// The surface is a grid of particles over the torus's (u, v) parameters. Three
// kinds of distance constraint make it a rubber sheet (stretch along u and v,
// shear along the diagonals, bending across two cells), and every particle is
// tied to its rest position by a soft zero-length spring, like a sheet bonded to
// an elastic core. A grab pins a small patch to the pointer. How wide the bulge
// spreads, how fast it springs back and how much it overshoots all follow from
// these material constants; nothing is animated by hand.
//
// Only the deformation is simulated, in the torus's own frame; turning the
// torus as a whole is done outside, as a rigid rotation.

const TAU = Math.PI * 2;

export interface ElasticOptions {
	/** ring and tube radii */
	R: number;
	r: number;
	/** particles around the ring and around the tube */
	nu?: number;
	nv?: number;
	/** compliances (inverse stiffness, per unit mass): sheet, bending, rest anchor */
	stretchCompliance?: number;
	bendCompliance?: number;
	anchorCompliance?: number;
	/** viscous damping of particle velocities, per second */
	damping?: number;
	/** substeps per frame */
	substeps?: number;
}

export class ElasticTorus {
	readonly nu: number;
	readonly nv: number;
	readonly n: number;
	/** rest positions and rest normals (object space) */
	readonly rest: Float32Array;
	readonly restN: Float32Array;
	/** current positions and velocities */
	readonly x: Float32Array;
	readonly v: Float32Array;
	private prev: Float32Array;
	private ci: Int32Array;
	private cj: Int32Array;
	private cl: Float32Array;
	private ca: Float32Array;
	private anchorA: number;
	private damping: number;
	private substeps: number;
	/** pinned particles: index, and its offset from the grab point at rest */
	private pins: { i: number; ox: number; oy: number; oz: number; w: number }[] = [];
	private target = [0, 0, 0];
	/** true once the sheet has come to rest and stopped simulating */
	asleep = true;

	constructor(o: ElasticOptions) {
		this.nu = o.nu ?? 48;
		this.nv = o.nv ?? 18;
		this.n = this.nu * this.nv;
		// a firm rubber: released, it is half-way home in 0.05 s, dips ~5% past rest once,
		// and is still within 0.3 s (see elasticTorus.test.ts)
		this.anchorA = o.anchorCompliance ?? 1 / 240;
		this.damping = o.damping ?? 30;
		this.substeps = o.substeps ?? 6;
		this.rest = new Float32Array(this.n * 3);
		this.restN = new Float32Array(this.n * 3);
		for (let j = 0; j < this.nv; j++)
			for (let i = 0; i < this.nu; i++) {
				const k = this.idx(i, j) * 3;
				const th = (TAU * i) / this.nu;
				const ph = (TAU * j) / this.nv;
				const w = o.R + o.r * Math.cos(ph);
				this.rest[k] = w * Math.cos(th);
				this.rest[k + 1] = o.r * Math.sin(ph);
				this.rest[k + 2] = w * Math.sin(th);
				this.restN[k] = Math.cos(ph) * Math.cos(th);
				this.restN[k + 1] = Math.sin(ph);
				this.restN[k + 2] = Math.cos(ph) * Math.sin(th);
			}
		this.x = this.rest.slice();
		this.v = new Float32Array(this.n * 3);
		this.prev = new Float32Array(this.n * 3);

		const sA = o.stretchCompliance ?? 1 / 4800;
		const bA = o.bendCompliance ?? 1 / 900;
		const I: number[] = [];
		const J: number[] = [];
		const A: number[] = [];
		const link = (a: number, b: number, alpha: number) => {
			I.push(a);
			J.push(b);
			A.push(alpha);
		};
		for (let j = 0; j < this.nv; j++)
			for (let i = 0; i < this.nu; i++) {
				const a = this.idx(i, j);
				link(a, this.idx(i + 1, j), sA); // stretch
				link(a, this.idx(i, j + 1), sA);
				link(a, this.idx(i + 1, j + 1), sA); // shear
				link(a, this.idx(i + 1, j - 1), sA);
				link(a, this.idx(i + 2, j), bA); // bending
				link(a, this.idx(i, j + 2), bA);
			}
		this.ci = Int32Array.from(I);
		this.cj = Int32Array.from(J);
		this.ca = Float32Array.from(A);
		this.cl = new Float32Array(I.length);
		for (let c = 0; c < I.length; c++) this.cl[c] = this.dist(this.rest, I[c], J[c]);
	}

	/** particle index of grid cell (i, j), wrapping both ways */
	idx(i: number, j: number) {
		const a = ((i % this.nu) + this.nu) % this.nu;
		const b = ((j % this.nv) + this.nv) % this.nv;
		return b * this.nu + a;
	}

	private dist(p: Float32Array, a: number, b: number) {
		const dx = p[b * 3] - p[a * 3];
		const dy = p[b * 3 + 1] - p[a * 3 + 1];
		const dz = p[b * 3 + 2] - p[a * 3 + 2];
		return Math.hypot(dx, dy, dz);
	}

	/**
	 * Pin the patch around parameter (u, v) to the pointer, like a fingertip
	 * pressed into the rubber.
	 */
	grab(u: number, v: number) {
		const gi = Math.round(u * this.nu);
		const gj = Math.round(v * this.nv);
		const c = this.idx(gi, gj) * 3;
		this.pins = [];
		// a round fingertip two cells wide, held firmly at the centre and softly at the rim
		for (let dj = -2; dj <= 2; dj++)
			for (let di = -2; di <= 2; di++) {
				const d2 = di * di + dj * dj;
				if (d2 > 5) continue;
				const i = this.idx(gi + di, gj + dj);
				this.pins.push({
					i,
					ox: this.rest[i * 3] - this.rest[c],
					oy: this.rest[i * 3 + 1] - this.rest[c + 1],
					oz: this.rest[i * 3 + 2] - this.rest[c + 2],
					w: Math.exp(-d2 / 2.2)
				});
			}
		// hold it where it is now (it may still be moving from an earlier pull)
		this.target = [this.x[c], this.x[c + 1], this.x[c + 2]];
		this.asleep = false;
		return [this.rest[c], this.rest[c + 1], this.rest[c + 2]] as const;
	}

	/** where the grabbed point should be (object space) */
	moveTo(x: number, y: number, z: number) {
		this.target = [x, y, z];
	}

	release() {
		this.pins = [];
	}

	get holding() {
		return this.pins.length > 0;
	}

	/** advance by dt seconds; returns true while anything moves */
	step(dt: number): boolean {
		if (this.asleep) return false;
		const { x, v, prev, ci, cj, cl, ca, rest } = this;
		const h = dt / this.substeps;
		const h2 = h * h;
		const damp = Math.exp(-this.damping * h);
		const anchor = 1 / (1 + this.anchorA / h2);
		for (let s = 0; s < this.substeps; s++) {
			// predict
			for (let k = 0; k < x.length; k++) {
				v[k] *= damp;
				prev[k] = x[k];
				x[k] += v[k] * h;
			}
			// rest anchors (zero-length springs): C = |x − x₀|
			for (let k = 0; k < x.length; k++) x[k] += (rest[k] - x[k]) * anchor;
			// sheet: stretch, shear, bending
			for (let c = 0; c < ci.length; c++) {
				const a = ci[c] * 3;
				const b = cj[c] * 3;
				const dx = x[b] - x[a];
				const dy = x[b + 1] - x[a + 1];
				const dz = x[b + 2] - x[a + 2];
				const L = Math.sqrt(dx * dx + dy * dy + dz * dz);
				if (L < 1e-9) continue;
				// two unit masses: Δλ = −C / (w₁ + w₂ + α/h²)
				const corr = -(L - cl[c]) / (2 + ca[c] / h2) / L;
				x[a] -= dx * corr;
				x[a + 1] -= dy * corr;
				x[a + 2] -= dz * corr;
				x[b] += dx * corr;
				x[b + 1] += dy * corr;
				x[b + 2] += dz * corr;
			}
			// the fingertip
			for (const p of this.pins) {
				const k = p.i * 3;
				x[k] += (this.target[0] + p.ox - x[k]) * p.w;
				x[k + 1] += (this.target[1] + p.oy - x[k + 1]) * p.w;
				x[k + 2] += (this.target[2] + p.oz - x[k + 2]) * p.w;
			}
			for (let k = 0; k < x.length; k++) v[k] = (x[k] - prev[k]) / h;
		}
		// asleep once released and still
		if (!this.pins.length) {
			let maxD = 0;
			let maxV = 0;
			for (let k = 0; k < x.length; k++) {
				maxD = Math.max(maxD, Math.abs(x[k] - rest[k]));
				maxV = Math.max(maxV, Math.abs(v[k]));
			}
			if (maxD < 2e-4 && maxV < 2e-3) {
				x.set(rest);
				v.fill(0);
				this.asleep = true;
			}
		}
		return true;
	}

	/** the largest distance of any particle from its rest position */
	maxDisplacement() {
		let m = 0;
		for (let k = 0; k < this.n; k++)
			m = Math.max(m, Math.hypot(this.x[k * 3] - this.rest[k * 3], this.x[k * 3 + 1] - this.rest[k * 3 + 1], this.x[k * 3 + 2] - this.rest[k * 3 + 2]));
		return m;
	}

	/**
	 * Fill displacement and normal-change fields, one texel per particle
	 * (RGBA, row-major in (i, j)): what the shader adds to each vertex.
	 */
	fields(disp: Float32Array, dn: Float32Array) {
		const { x, rest, restN, nu, nv } = this;
		const e1 = [0, 0, 0];
		const e2 = [0, 0, 0];
		for (let j = 0; j < nv; j++)
			for (let i = 0; i < nu; i++) {
				const k = this.idx(i, j);
				const a = this.idx(i + 1, j) * 3;
				const b = this.idx(i - 1, j) * 3;
				const c = this.idx(i, j + 1) * 3;
				const d = this.idx(i, j - 1) * 3;
				for (let q = 0; q < 3; q++) {
					e1[q] = x[a + q] - x[b + q];
					e2[q] = x[c + q] - x[d + q];
				}
				let nx = e1[1] * e2[2] - e1[2] * e2[1];
				let ny = e1[2] * e2[0] - e1[0] * e2[2];
				let nz = e1[0] * e2[1] - e1[1] * e2[0];
				const len = Math.hypot(nx, ny, nz) || 1;
				nx /= len;
				ny /= len;
				nz /= len;
				// face the same way as the rest normal
				if (nx * restN[k * 3] + ny * restN[k * 3 + 1] + nz * restN[k * 3 + 2] < 0) [nx, ny, nz] = [-nx, -ny, -nz];
				const t = k * 4;
				disp[t] = x[k * 3] - rest[k * 3];
				disp[t + 1] = x[k * 3 + 1] - rest[k * 3 + 1];
				disp[t + 2] = x[k * 3 + 2] - rest[k * 3 + 2];
				dn[t] = nx - restN[k * 3];
				dn[t + 1] = ny - restN[k * 3 + 1];
				dn[t + 2] = nz - restN[k * 3 + 2];
			}
	}

	/** bilinear sample of a field at (u, v), exactly as the GPU filters it */
	sample(field: Float32Array, u: number, v: number, out: [number, number, number]) {
		const fu = (((u % 1) + 1) % 1) * this.nu;
		const fv = (((v % 1) + 1) % 1) * this.nv;
		const i0 = Math.floor(fu);
		const j0 = Math.floor(fv);
		const a = fu - i0;
		const b = fv - j0;
		const k00 = this.idx(i0, j0) * 4;
		const k10 = this.idx(i0 + 1, j0) * 4;
		const k01 = this.idx(i0, j0 + 1) * 4;
		const k11 = this.idx(i0 + 1, j0 + 1) * 4;
		for (let q = 0; q < 3; q++)
			out[q] =
				(1 - a) * (1 - b) * field[k00 + q] + a * (1 - b) * field[k10 + q] + (1 - a) * b * field[k01 + q] + a * b * field[k11 + q];
		return out;
	}
}
