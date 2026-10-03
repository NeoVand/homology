// Closed triangulated surfaces (welded: every vertex stored once), their
// angle defects, and the discrete Gauss–Bonnet theorem
//     Σ_v (2π − Σ angles at v) = 2π (V − E + F) = 2π χ.

export interface TriMesh {
	/** xyz per vertex */
	pos: Float64Array;
	/** three vertex indices per triangle, counterclockwise seen from outside */
	tri: Uint32Array;
}

const PHI = (1 + Math.sqrt(5)) / 2;

/** A geodesic sphere: an icosahedron subdivided `level` times, projected to the unit sphere. */
export function icosphere(level: number): TriMesh {
	const v: number[][] = [
		[-1, PHI, 0],
		[1, PHI, 0],
		[-1, -PHI, 0],
		[1, -PHI, 0],
		[0, -1, PHI],
		[0, 1, PHI],
		[0, -1, -PHI],
		[0, 1, -PHI],
		[PHI, 0, -1],
		[PHI, 0, 1],
		[-PHI, 0, -1],
		[-PHI, 0, 1]
	].map(normalize);
	let f: number[][] = [
		[0, 11, 5],
		[0, 5, 1],
		[0, 1, 7],
		[0, 7, 10],
		[0, 10, 11],
		[1, 5, 9],
		[5, 11, 4],
		[11, 10, 2],
		[10, 7, 6],
		[7, 1, 8],
		[3, 9, 4],
		[3, 4, 2],
		[3, 2, 6],
		[3, 6, 8],
		[3, 8, 9],
		[4, 9, 5],
		[2, 4, 11],
		[6, 2, 10],
		[8, 6, 7],
		[9, 8, 1]
	];
	for (let l = 0; l < level; l++) {
		const cache = new Map<string, number>();
		const mid = (a: number, b: number) => {
			const k = a < b ? `${a},${b}` : `${b},${a}`;
			let m = cache.get(k);
			if (m === undefined) {
				m = v.length;
				v.push(normalize([(v[a][0] + v[b][0]) / 2, (v[a][1] + v[b][1]) / 2, (v[a][2] + v[b][2]) / 2]));
				cache.set(k, m);
			}
			return m;
		};
		const nf: number[][] = [];
		for (const [a, b, c] of f) {
			const ab = mid(a, b);
			const bc = mid(b, c);
			const ca = mid(c, a);
			nf.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
		}
		f = nf;
	}
	return { pos: new Float64Array(v.flat()), tri: new Uint32Array(f.flat()) };
}

function normalize(p: number[]): number[] {
	const l = Math.hypot(p[0], p[1], p[2]);
	return [p[0] / l, p[1] / l, p[2] / l];
}

/**
 * A welded grid on the torus: vertex (i, j) ↔ angles (2πi/nu, 2πj/nv).
 * Positions are filled in later by a map (so the same connectivity can be
 * reused for deformed tori).
 */
export function torusGrid(nu: number, nv: number): { tri: Uint32Array; uv: Float64Array } {
	const tri: number[] = [];
	const id = (i: number, j: number) => ((i + nu) % nu) * nv + ((j + nv) % nv);
	for (let i = 0; i < nu; i++)
		for (let j = 0; j < nv; j++) {
			const a = id(i, j);
			const b = id(i + 1, j);
			const c = id(i + 1, j + 1);
			const d = id(i, j + 1);
			tri.push(a, d, c, a, c, b);
		}
	const uv = new Float64Array(nu * nv * 2);
	for (let i = 0; i < nu; i++)
		for (let j = 0; j < nv; j++) {
			uv[2 * id(i, j)] = (2 * Math.PI * i) / nu;
			uv[2 * id(i, j) + 1] = (2 * Math.PI * j) / nv;
		}
	return { tri: new Uint32Array(tri), uv };
}

/** Interior angle at vertex p of the triangle (p, q, r). Robust for thin triangles. */
function angleAt(P: Float64Array, p: number, q: number, r: number): number {
	const ux = P[3 * q] - P[3 * p];
	const uy = P[3 * q + 1] - P[3 * p + 1];
	const uz = P[3 * q + 2] - P[3 * p + 2];
	const vx = P[3 * r] - P[3 * p];
	const vy = P[3 * r + 1] - P[3 * p + 1];
	const vz = P[3 * r + 2] - P[3 * p + 2];
	const cx = uy * vz - uz * vy;
	const cy = uz * vx - ux * vz;
	const cz = ux * vy - uy * vx;
	return Math.atan2(Math.hypot(cx, cy, cz), ux * vx + uy * vy + uz * vz);
}

/** Angle defect 2π − (sum of the angles of the triangles at v), per vertex. */
export function angleDefects(m: TriMesh, out?: Float64Array): Float64Array {
	const nv = m.pos.length / 3;
	const d = out ?? new Float64Array(nv);
	d.fill(2 * Math.PI);
	const T = m.tri;
	for (let t = 0; t < T.length; t += 3) {
		const a = T[t];
		const b = T[t + 1];
		const c = T[t + 2];
		d[a] -= angleAt(m.pos, a, b, c);
		d[b] -= angleAt(m.pos, b, c, a);
		d[c] -= angleAt(m.pos, c, a, b);
	}
	return d;
}

/** One third of the area of every triangle at v ("barycentric area"), per vertex. */
export function vertexAreas(m: TriMesh, out?: Float64Array): Float64Array {
	const nv = m.pos.length / 3;
	const A = out ?? new Float64Array(nv);
	A.fill(0);
	const P = m.pos;
	const T = m.tri;
	for (let t = 0; t < T.length; t += 3) {
		const a = T[t];
		const b = T[t + 1];
		const c = T[t + 2];
		const ux = P[3 * b] - P[3 * a];
		const uy = P[3 * b + 1] - P[3 * a + 1];
		const uz = P[3 * b + 2] - P[3 * a + 2];
		const vx = P[3 * c] - P[3 * a];
		const vy = P[3 * c + 1] - P[3 * a + 1];
		const vz = P[3 * c + 2] - P[3 * a + 2];
		const area = 0.5 * Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx);
		A[a] += area / 3;
		A[b] += area / 3;
		A[c] += area / 3;
	}
	return A;
}

/** V − E + F, counting each undirected edge once. */
export function eulerCharacteristic(m: TriMesh): number {
	const edges = new Set<string>();
	const T = m.tri;
	for (let t = 0; t < T.length; t += 3)
		for (let k = 0; k < 3; k++) {
			const a = T[t + k];
			const b = T[t + ((k + 1) % 3)];
			edges.add(a < b ? `${a},${b}` : `${b},${a}`);
		}
	return m.pos.length / 3 - edges.size + T.length / 3;
}

export function sum(a: ArrayLike<number>): number {
	let s = 0;
	for (let i = 0; i < a.length; i++) s += a[i];
	return s;
}

// ── shapes the sculptor can make ───────────────────────────────────────────

export interface Bump {
	/** unit direction (sphere) or (u, v) angles (torus) */
	at: [number, number, number];
	amp: number;
	width: number;
}

/** Deform the unit icosphere radially: r = R (1 + bumps + waves), then squash vertically. */
export function shapeSphere(
	base: Float64Array,
	out: Float64Array,
	o: { R: number; bumps: Bump[]; waves: number; squash: number; twist: number }
) {
	const n = base.length / 3;
	for (let i = 0; i < n; i++) {
		const x = base[3 * i];
		const y = base[3 * i + 1];
		const z = base[3 * i + 2];
		let r = 1;
		for (const b of o.bumps) {
			const c = Math.max(-1, Math.min(1, x * b.at[0] + y * b.at[1] + z * b.at[2]));
			const th = Math.acos(c);
			r += b.amp * Math.exp(-((th / b.width) ** 2));
		}
		if (o.waves) r += o.waves * (0.5 * Math.sin(3 * x + 1.3) * Math.cos(4 * y - 0.4) + 0.5 * Math.sin(5 * z + 2 * x));
		r = Math.max(0.15, r);
		let px = x * r * o.R;
		let py = y * r * o.R * o.squash;
		let pz = z * r * o.R;
		if (o.twist) {
			const a = o.twist * py;
			const ca = Math.cos(a);
			const sa = Math.sin(a);
			[px, pz] = [px * ca - pz * sa, px * sa + pz * ca];
		}
		out[3 * i] = px;
		out[3 * i + 1] = py;
		out[3 * i + 2] = pz;
	}
}

/** A torus of revolution with bumps on the tube radius: r(u, v) = r (1 + bumps + waves). */
export function shapeTorus(
	uv: Float64Array,
	out: Float64Array,
	o: { R: number; r: number; bumps: Bump[]; waves: number; squash: number; twist: number }
) {
	const n = uv.length / 2;
	const wrap = (a: number) => {
		a = (a + Math.PI) % (2 * Math.PI);
		if (a < 0) a += 2 * Math.PI;
		return a - Math.PI;
	};
	for (let i = 0; i < n; i++) {
		const u = uv[2 * i];
		const v = uv[2 * i + 1];
		let s = 1;
		for (const b of o.bumps) {
			const du = wrap(u - b.at[0]) * (o.R / o.r) * 0.5;
			const dv = wrap(v - b.at[1]);
			s += b.amp * Math.exp(-(du * du + dv * dv) / (b.width * b.width * 4));
		}
		if (o.waves) s += o.waves * 1.4 * (0.6 * Math.sin(3 * u + 2 * v) + 0.4 * Math.cos(5 * u - v + 1));
		s = Math.max(0.12, s);
		const rr = o.r * s;
		const w = o.R + rr * Math.cos(v);
		let px = w * Math.cos(u);
		let py = rr * Math.sin(v) * o.squash;
		let pz = w * Math.sin(u);
		if (o.twist) {
			const a = o.twist * py;
			const ca = Math.cos(a);
			const sa = Math.sin(a);
			[px, pz] = [px * ca - pz * sa, px * sa + pz * ca];
		}
		out[3 * i] = px;
		out[3 * i + 1] = py;
		out[3 * i + 2] = pz;
	}
}
