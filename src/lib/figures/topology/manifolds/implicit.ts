// Implicit surfaces and a small "surface nets" mesher.
//
// A closed surface of genus g is drawn as the boundary of a smooth union of g
// solid tori placed in a row (a pretzel); genus 0 is a sphere. The scalar field
// F is negative inside and positive outside. `surfaceNets` turns F = 0 into a
// triangle mesh: one vertex per grid cell that the surface crosses, one quad
// per grid edge that the surface crosses. Vertices are then pulled onto the
// true surface with a couple of Newton steps, and normals come from ∇F, so the
// mesh is smooth even at modest resolution.

export type Field = (x: number, y: number, z: number) => number;

/** Polynomial smooth minimum (blends two distance fields with radius k). */
export function smin(a: number, b: number, k: number): number {
	const h = Math.max(k - Math.abs(a - b), 0) / k;
	return Math.min(a, b) - (h * h * k) / 4;
}

/** Signed distance to a torus around the vertical (y) axis through (cx, 0, cz). */
export function torusField(cx: number, cz: number, R: number, r: number): Field {
	return (x, y, z) => {
		const q = Math.hypot(x - cx, z - cz) - R;
		return Math.hypot(q, y) - r;
	};
}

export interface GenusShape {
	g: number;
	f: Field;
	/** x-coordinates of the hole centres (empty for the sphere) */
	centres: number[];
	R: number;
	r: number;
	min: [number, number, number];
	max: [number, number, number];
}

/** A closed orientable surface of genus g (0 ≤ g ≤ 5) as an implicit surface. */
export function genusShape(g: number, o: { R?: number; r?: number; spacing?: number; blend?: number } = {}): GenusShape {
	const R = o.R ?? 1;
	const r = o.r ?? 0.42;
	const d = o.spacing ?? 2 * R + 0.12;
	const k = o.blend ?? 0.45;
	const pad = 0.28;
	if (g <= 0) {
		const rad = 1.25;
		return {
			g: 0,
			f: (x, y, z) => Math.hypot(x, y, z) - rad,
			centres: [],
			R: 0,
			r: rad,
			min: [-rad - pad, -rad - pad, -rad - pad],
			max: [rad + pad, rad + pad, rad + pad]
		};
	}
	const centres = Array.from({ length: g }, (_, i) => (i - (g - 1) / 2) * d);
	const tori = centres.map((c) => torusField(c, 0, R, r));
	const f: Field = (x, y, z) => {
		let v = tori[0](x, y, z);
		for (let i = 1; i < tori.length; i++) v = smin(v, tori[i](x, y, z), k);
		return v;
	};
	const ext = R + r + pad;
	return {
		g,
		f,
		centres,
		R,
		r,
		min: [centres[0] - ext, -r - pad, -ext],
		max: [centres[g - 1] + ext, r + pad, ext]
	};
}

export interface Mesh {
	positions: Float32Array;
	normals: Float32Array;
	indices: Uint32Array;
}

/** Central-difference gradient of f at (x, y, z). */
export function gradient(f: Field, x: number, y: number, z: number, out: [number, number, number], e = 1e-4) {
	out[0] = (f(x + e, y, z) - f(x - e, y, z)) / (2 * e);
	out[1] = (f(x, y + e, z) - f(x, y - e, z)) / (2 * e);
	out[2] = (f(x, y, z + e) - f(x, y, z - e)) / (2 * e);
	return out;
}

/**
 * Newton-project a point onto the surface F = 0 (in place).
 * `maxStep` caps how far one step may move the point.
 */
export function project(f: Field, p: [number, number, number], iters = 3, maxStep = Infinity) {
	const gr: [number, number, number] = [0, 0, 0];
	for (let it = 0; it < iters; it++) {
		const v = f(p[0], p[1], p[2]);
		gradient(f, p[0], p[1], p[2], gr);
		const g2 = gr[0] * gr[0] + gr[1] * gr[1] + gr[2] * gr[2];
		if (g2 < 1e-12) break;
		let s = v / g2;
		const len = Math.abs(s) * Math.sqrt(g2);
		if (len > maxStep) s *= maxStep / len;
		p[0] -= s * gr[0];
		p[1] -= s * gr[1];
		p[2] -= s * gr[2];
	}
	return p;
}

/** Mesh the zero set of f inside the box [min, max] with grid spacing h. */
export function surfaceNets(f: Field, min: [number, number, number], max: [number, number, number], h: number): Mesh {
	const nx = Math.ceil((max[0] - min[0]) / h);
	const ny = Math.ceil((max[1] - min[1]) / h);
	const nz = Math.ceil((max[2] - min[2]) / h);
	const sx = nx + 1;
	const sy = ny + 1;
	// sample the field at grid points
	const val = new Float32Array(sx * sy * (nz + 1));
	const P = (i: number, j: number, k: number) => i + sx * (j + sy * k);
	for (let k = 0; k <= nz; k++) {
		const z = min[2] + k * h;
		for (let j = 0; j <= ny; j++) {
			const y = min[1] + j * h;
			for (let i = 0; i <= nx; i++) val[P(i, j, k)] = f(min[0] + i * h, y, z);
		}
	}
	// one vertex per crossed cell
	const C = (i: number, j: number, k: number) => i + nx * (j + ny * k);
	const cellVert = new Int32Array(nx * ny * nz).fill(-1);
	const pos: number[] = [];
	const corner = [
		[0, 0, 0],
		[1, 0, 0],
		[0, 1, 0],
		[1, 1, 0],
		[0, 0, 1],
		[1, 0, 1],
		[0, 1, 1],
		[1, 1, 1]
	];
	const edges = [
		[0, 1],
		[2, 3],
		[4, 5],
		[6, 7],
		[0, 2],
		[1, 3],
		[4, 6],
		[5, 7],
		[0, 4],
		[1, 5],
		[2, 6],
		[3, 7]
	];
	const cv = new Float64Array(8);
	for (let k = 0; k < nz; k++)
		for (let j = 0; j < ny; j++)
			for (let i = 0; i < nx; i++) {
				let neg = 0;
				for (let c = 0; c < 8; c++) {
					cv[c] = val[P(i + corner[c][0], j + corner[c][1], k + corner[c][2])];
					if (cv[c] < 0) neg++;
				}
				if (neg === 0 || neg === 8) continue;
				let ax = 0;
				let ay = 0;
				let az = 0;
				let n = 0;
				for (const [a, b] of edges) {
					const va = cv[a];
					const vb = cv[b];
					if (va < 0 === vb < 0) continue;
					const t = va / (va - vb);
					ax += corner[a][0] + (corner[b][0] - corner[a][0]) * t;
					ay += corner[a][1] + (corner[b][1] - corner[a][1]) * t;
					az += corner[a][2] + (corner[b][2] - corner[a][2]) * t;
					n++;
				}
				cellVert[C(i, j, k)] = pos.length / 3;
				pos.push(min[0] + (i + ax / n) * h, min[1] + (j + ay / n) * h, min[2] + (k + az / n) * h);
			}
	// one quad per crossed grid edge (interior edges only)
	const idx: number[] = [];
	const quad = (a: number, b: number, c: number, d: number, flip: boolean) => {
		if (a < 0 || b < 0 || c < 0 || d < 0) return;
		if (flip) idx.push(a, c, b, a, d, c);
		else idx.push(a, b, c, a, c, d);
	};
	for (let k = 0; k <= nz; k++)
		for (let j = 0; j <= ny; j++)
			for (let i = 0; i <= nx; i++) {
				const v0 = val[P(i, j, k)] < 0;
				// x-edge
				if (i < nx && j > 0 && k > 0 && j < ny && k < nz) {
					const v1 = val[P(i + 1, j, k)] < 0;
					if (v0 !== v1)
						quad(cellVert[C(i, j - 1, k - 1)], cellVert[C(i, j, k - 1)], cellVert[C(i, j, k)], cellVert[C(i, j - 1, k)], !v0);
				}
				// y-edge
				if (j < ny && i > 0 && k > 0 && i < nx && k < nz) {
					const v1 = val[P(i, j + 1, k)] < 0;
					if (v0 !== v1)
						quad(cellVert[C(i - 1, j, k - 1)], cellVert[C(i - 1, j, k)], cellVert[C(i, j, k)], cellVert[C(i, j, k - 1)], !v0);
				}
				// z-edge
				if (k < nz && i > 0 && j > 0 && i < nx && j < ny) {
					const v1 = val[P(i, j, k + 1)] < 0;
					if (v0 !== v1)
						quad(cellVert[C(i - 1, j - 1, k)], cellVert[C(i, j - 1, k)], cellVert[C(i, j, k)], cellVert[C(i - 1, j, k)], !v0);
				}
			}
	// pull vertices onto the surface; normals from the gradient
	const positions = new Float32Array(pos.length);
	const normals = new Float32Array(pos.length);
	const p: [number, number, number] = [0, 0, 0];
	const gr: [number, number, number] = [0, 0, 0];
	for (let v = 0; v < pos.length / 3; v++) {
		p[0] = pos[v * 3];
		p[1] = pos[v * 3 + 1];
		p[2] = pos[v * 3 + 2];
		project(f, p, 3, h * 0.75);
		positions[v * 3] = p[0];
		positions[v * 3 + 1] = p[1];
		positions[v * 3 + 2] = p[2];
		gradient(f, p[0], p[1], p[2], gr);
		const L = Math.hypot(gr[0], gr[1], gr[2]) || 1;
		normals[v * 3] = gr[0] / L;
		normals[v * 3 + 1] = gr[1] / L;
		normals[v * 3 + 2] = gr[2] / L;
	}
	return { positions, normals, indices: Uint32Array.from(idx) };
}

/** V − E + F of a triangle mesh (counting each undirected edge once). */
export function eulerCharacteristic(m: Mesh): number {
	const V = m.positions.length / 3;
	const F = m.indices.length / 3;
	const E = new Set<number>();
	const key = (a: number, b: number) => (a < b ? a * 4194304 + b : b * 4194304 + a);
	for (let t = 0; t < F; t++) {
		const a = m.indices[t * 3];
		const b = m.indices[t * 3 + 1];
		const c = m.indices[t * 3 + 2];
		E.add(key(a, b));
		E.add(key(b, c));
		E.add(key(c, a));
	}
	return V - E.size + F;
}

/** Every edge of a closed, consistently oriented mesh is used once in each direction. */
export function isClosedOriented(m: Mesh): boolean {
	const dir = new Map<string, number>();
	const F = m.indices.length / 3;
	for (let t = 0; t < F; t++) {
		const tri = [m.indices[t * 3], m.indices[t * 3 + 1], m.indices[t * 3 + 2]];
		for (let e = 0; e < 3; e++) {
			const a = tri[e];
			const b = tri[(e + 1) % 3];
			const k = `${a},${b}`;
			dir.set(k, (dir.get(k) ?? 0) + 1);
		}
	}
	for (const [k, n] of dir) {
		if (n !== 1) return false;
		const [a, b] = k.split(',');
		if (dir.get(`${b},${a}`) !== 1) return false;
	}
	return true;
}

/** Signed distance to a capsule (a solid tube with round ends) from a to b. */
export function capsuleField(a: [number, number, number], b: [number, number, number], radius: number): Field {
	const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
	const L2 = ab[0] * ab[0] + ab[1] * ab[1] + ab[2] * ab[2];
	return (x, y, z) => {
		const ap = [x - a[0], y - a[1], z - a[2]];
		const t = Math.max(0, Math.min(1, (ap[0] * ab[0] + ap[1] * ab[1] + ap[2] * ab[2]) / L2));
		return Math.hypot(ap[0] - t * ab[0], ap[1] - t * ab[1], ap[2] - t * ab[2]) - radius;
	};
}

/**
 * The stages of the connected sum T² # T²: two separate tori, and the same
 * two tori joined by a tube between the points that face each other.
 */
export function connectedSumShapes(o: { c?: number; R?: number; r?: number; tube?: number } = {}) {
	const c = o.c ?? 2.0;
	const R = o.R ?? 1;
	const r = o.r ?? 0.42;
	const tube = o.tube ?? 0.24;
	const L = torusField(-c, 0, R, r);
	const Rt = torusField(c, 0, R, r);
	const facing = c - R - r; // the facing points are (∓facing, 0, 0)
	const cap = capsuleField([-facing - 0.15, 0, 0], [facing + 0.15, 0, 0], tube);
	const pad = 0.3;
	const min: [number, number, number] = [-c - R - r - pad, -r - pad, -R - r - pad];
	const max: [number, number, number] = [c + R + r + pad, r + pad, R + r + pad];
	return {
		c,
		R,
		r,
		facing,
		apart: { f: ((x, y, z) => Math.min(L(x, y, z), Rt(x, y, z))) as Field, min, max },
		joined: { f: ((x, y, z) => smin(Math.min(L(x, y, z), Rt(x, y, z)), cap(x, y, z), 0.22)) as Field, min, max }
	};
}
