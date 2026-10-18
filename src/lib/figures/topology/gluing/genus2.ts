// From an octagon to a two-holed doughnut, continuously (Figure 2.2.8).
//
// The octagon a₁b₁a₁⁻¹b₁⁻¹a₂b₂a₂⁻¹b₂⁻¹ is cut along the diagonal c into two pentagons. Each pentagon is a
// sheet with coordinates (s, r): s runs once along its edges a, b, a⁻¹, b⁻¹ (a quarter each, at r = 1), and r
// runs out to them from the edge c (r = 0). Four moves take a pentagon to its place on the surface:
//
//   curl  In its own plane, the pentagon bends round a point just beyond its edge c, like a strip bent into
//         a ring: c stays an arc of a circle until it closes up into one, and the pentagon's corners at the
//         two ends of c meet. Then, in polar coordinates about the ring's centre (angles and the logarithms
//         of distances are interpolated, so it never folds over), the ring becomes a rectangle round an oval
//         hole, the corners' meeting point stretching into a slit from the hole to a corner.
//   roll  The rectangle rolls up until b meets b⁻¹: a tube.
//   bend  The tube bends round until a meets a⁻¹: a torus, with the hole on its outer equator.
//   join  The two tori stand side by side with their holes facing, and the rim of each hole is drawn out
//         into half of a neck; the halves meet along the neck's waist, which is c.
//
// The second pentagon is the first turned through half a turn in the octagon's plane, and it moves the same
// way. Everything is a continuous function of the time t ∈ [0, 1]; at t = 1 the edges that are glued lie
// exactly on each other (genus2.test.ts checks this, and that the finished surface does not cross itself).
import * as THREE from 'three';
import type { P3 } from './sheet';
import { arcMean, bendC, bendS, mix, seg } from './morphs';

const TAU = Math.PI * 2;

/** the sizes of things (world units, before the figure frames them) */
export const G2 = {
	/** circumradius of the octagon */
	RO: 3,
	/** the rectangle each pentagon becomes, along a (U) and along b (V), and the hole's half-axes */
	LU: 2.8,
	LV: 5.6,
	aU: 0.56,
	aV: 0.34,
	/** the tori: tube radius, radius of the core circle, and how far each centre is from the middle */
	r: 0.62,
	R: 1.45,
	Dx: 2.17,
	/** the neck: radius of the waist, and how much of the sheet round the hole goes into it (flat units) */
	waist: 0.68,
	collar: 0.22,
	/** how far apart the halves move once cut */
	sep: 4.4,
	/** where the hole's centre ends up in the half's plane, and where each rolled tube lies */
	hK: -1.3,
	tube: 4.2
};

/** the share of the sheet's rows that lie in the collar round the hole (they become the neck) */
const COLLAR_ROWS = 0.35;

export function genus2Stages(t: number) {
	return {
		sep: seg(t, 0.06, 0.14),
		ring: seg(t, 0.14, 0.27),
		curl: seg(t, 0.28, 0.38),
		roll: seg(t, 0.38, 0.58),
		bend: seg(t, 0.58, 0.8),
		/** turning in the plane while it rolls, then into place while it bends */
		turn: seg(t, 0.38, 0.58),
		place: seg(t, 0.58, 0.8),
		join: seg(t, 0.82, 1)
	};
}

/** the octagon's corners V₀ … V₇, anticlockwise from the top */
export const octagonCorner = (k: number): [number, number] => {
	const a = Math.PI / 2 + (k * Math.PI) / 4;
	return [G2.RO * Math.cos(a), G2.RO * Math.sin(a)];
};

/** which edge of a pentagon a value of s lies on (0 a, 1 b, 2 a⁻¹, 3 b⁻¹), and how far along it */
function edgeOf(s: number): [number, number] {
	const k = Math.min(3, Math.max(0, Math.floor(4 * s)));
	return [k, 4 * s - k];
}

// ── the rectangle with its hole, in the coordinates of a flat torus diagram ──────────────────────────

/** the rectangle's edge at s, from the hole's centre: a along the bottom, b up the right side, … */
function rectEdge(s: number): [number, number] {
	const { LU, LV } = G2;
	const [k, l] = edgeOf(s);
	if (k === 0) return [-LU / 2 + l * LU, -LV / 2];
	if (k === 1) return [LU / 2, -LV / 2 + l * LV];
	if (k === 2) return [LU / 2 - l * LU, LV / 2];
	return [-LU / 2, LV / 2 - l * LV];
}
/** direction of the slit, from the hole to the corner where the rectangle's edges start and end */
const SLIT = Math.atan2(-G2.LV / 2, -G2.LU / 2) + TAU;
/** angle of the rectangle's edge at s, seen from the hole, increasing from SLIT to SLIT + 2π */
function rectAngle(s: number) {
	if (s >= 1) return SLIT + TAU;
	if (s <= 0) return SLIT;
	const [x, y] = rectEdge(s);
	let a = Math.atan2(y, x);
	while (a < SLIT) a += TAU;
	while (a >= SLIT + TAU) a -= TAU;
	return a;
}
/** distance from the hole's centre to its rim (an ellipse), in the direction a */
const holeRadius = (a: number) => 1 / Math.sqrt((Math.cos(a) / G2.aU) ** 2 + (Math.sin(a) / G2.aV) ** 2);

// ── the pentagon, in the plane of the half it is (c along x = 0, the pentagon to its left) ─────────────

function pentEdge(s: number): [number, number] {
	const [k, l] = edgeOf(s);
	const [x0, y0] = octagonCorner(k);
	const [x1, y1] = octagonCorner(k + 1);
	return [x0 + l * (x1 - x0), y0 + l * (y1 - y0)];
}

/** the data of one value of s: how the pentagon and the rectangle each look along it */
interface Column {
	/** the pentagon as a strip along c: how far along c (from its middle), and how far out the edges are */
	sig: number;
	nu: number;
	/** the rectangle, about the hole's centre: angle (from the slit), distance to the rim and to the edges */
	thK: number;
	inK: number;
	outK: number;
	/** how far out the collar reaches (r at its outer edge) */
	rc: number;
}

function column(s: number): Column {
	const [ex, ey] = pentEdge(s);
	const thK = rectAngle(s);
	const [qx, qy] = rectEdge(s);
	const outK = s <= 0 || s >= 1 ? Math.hypot(G2.LU / 2, G2.LV / 2) : Math.hypot(qx, qy);
	const inK = holeRadius(thK);
	return { sig: ey, nu: Math.max(0, -ex), thK: thK - SLIT, inK, outK, rc: Math.min(0.9, G2.collar / (outK - inK)) };
}

/** radius of the ring that c closes up into */
const RC = G2.RO / Math.PI;

/** r for a row g of the sheet (g = j / rows): the first rows fill the collar, the rest the remainder */
export function rowR(g: number, rc: number) {
	return g < COLLAR_ROWS ? (g / COLLAR_ROWS) * rc : rc + ((g - COLLAR_ROWS) / (1 - COLLAR_ROWS)) * (1 - rc);
}

/** the point (s, r) of the finished flat diagram, as torus coordinates (U, V) ∈ [0, 1]² */
export function torusUV(s: number, r: number, c = column(s)): [number, number] {
	const d = c.inK + r * (c.outK - c.inK);
	return [(d * Math.cos(c.thK + SLIT)) / G2.LU + 0.5, (d * Math.sin(c.thK + SLIT)) / G2.LV + 0.5];
}

/** the torus diagram (U, V) rolled (U round a tube) and bent (V round a ring), in the half's own frame */
function torusPoint(U: number, V: number, roll: number, bend: number, o: P3) {
	const { LU, LV, r, R } = G2;
	const lenU = mix(LU, TAU * r, roll);
	const kU = (roll * TAU) / lenU;
	const su = (U - 0.5) * lenU;
	const cx = bendS(kU, su);
	const cz = bendC(kU, su) - arcMean(kU, lenU);
	const lenV = mix(LV, TAU * R, bend);
	const kV = (bend * TAU) / lenV;
	const sv = (V - 0.5) * lenV;
	const ay = bendS(kV, sv);
	const az = bendC(kV, sv) - arcMean(kV, lenV);
	// the cross-section's z follows the ring's inward normal, so U = ½ ends up on the outer equator
	o.x = cx;
	o.y = ay - cz * Math.sin(kV * sv);
	o.z = az + cz * Math.cos(kV * sv);
}

// ── where each half sits ──────────────────────────────────────────────────────────────────────────────

const Z = new THREE.Vector3(0, 0, 1);
const Y = new THREE.Vector3(0, 1, 0);
const rotZ = (a: number) => new THREE.Quaternion().setFromAxisAngle(Z, a);
const rotY = (a: number) => new THREE.Quaternion().setFromAxisAngle(Y, a);
/** the rings are tipped towards the viewer (about x, so that the waist stays in the plane x = 0) */
const TILT = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.55);
// The frame of each half's torus diagram (U along x, V along y, the seam of the roll towards +z) at three
// moments: as the curl leaves it (the slit pointing at the other half); rolled, lying along the x-axis with
// the seam facing the viewer, so that the bend curls it towards the viewer into a level ring; and finished,
// turned a quarter about the vertical so that the hole (at the back) faces the other torus, and tipped.
// Half 2 is half 1 turned half a turn in the octagon's plane throughout.
const FRAMES = [0, 1].map((h) => {
	const flip = rotZ(h * Math.PI);
	return {
		start: flip.clone().multiply(rotZ(-SLIT)),
		rolled: flip.clone().multiply(rotZ(Math.PI / 2)),
		final: TILT.clone().multiply(rotY(h ? Math.PI / 2 : -Math.PI / 2)).multiply(flip).multiply(rotZ(Math.PI / 2))
	};
});

/** The surface at a moment: positions of the two halves' points (s, g), and of their edges. */
export class Genus2 {
	private t = -1;
	private st = genus2Stages(0);
	private cols = new Map<number, Column>();
	private necks = [new Map<number, Neck>(), new Map<number, Neck>()];
	private q = [new THREE.Quaternion(), new THREE.Quaternion()];
	private T = [new THREE.Vector3(), new THREE.Vector3()];
	private v = new THREE.Vector3();
	private p: P3 = { x: 0, y: 0, z: 0 };

	setTime(t: number) {
		if (t === this.t) return;
		this.t = t;
		this.st = genus2Stages(t);
		this.necks[0].clear();
		this.necks[1].clear();
		const { turn, place } = this.st;
		for (const h of [0, 1]) {
			const F = FRAMES[h];
			const sgn = h ? -1 : 1;
			const T0 = new THREE.Vector3(sgn * (G2.hK - G2.sep), 0, 0);
			const T1 = new THREE.Vector3(-sgn * G2.tube, 0, 0);
			const T2 = new THREE.Vector3(-sgn * G2.Dx, 0, 0);
			if (place <= 0) {
				this.q[h].slerpQuaternions(F.start, F.rolled, turn);
				this.T[h].lerpVectors(T0, T1, turn);
			} else {
				this.q[h].slerpQuaternions(F.rolled, F.final, place);
				this.T[h].lerpVectors(T1, T2, place);
			}
		}
	}

	private col(s: number) {
		let c = this.cols.get(s);
		if (!c) {
			c = column(s);
			if (this.cols.size > 4000) this.cols.clear();
			this.cols.set(s, c);
		}
		return c;
	}

	/** the point (s, r) of half h before the neck is drawn out */
	private base(h: number, s: number, r: number, o: P3, c = this.col(s)) {
		const { sep, ring, curl, roll, bend } = this.st;
		if (roll <= 0) {
			// cut, bend into a ring, reshape, all in the plane of the octagon
			let x: number;
			let y: number;
			if (curl <= 0) {
				const k = (ring * Math.PI) / G2.RO;
				const nu = r * c.nu;
				x = bendC(k, c.sig) - nu * Math.cos(k * c.sig);
				y = bendS(k, c.sig) + nu * Math.sin(k * c.sig);
			} else {
				const th = mix(Math.PI - (Math.PI * c.sig) / G2.RO, c.thK, curl);
				const din = Math.exp(mix(Math.log(RC), Math.log(c.inK), curl));
				const dout = Math.exp(mix(Math.log(RC + c.nu), Math.log(c.outK), curl));
				const d = din + r * (dout - din);
				x = mix(RC, G2.hK, curl) + d * Math.cos(th);
				y = d * Math.sin(th);
			}
			x -= sep * G2.sep;
			o.x = h ? -x : x;
			o.y = h ? -y : y;
			o.z = 0;
			return o;
		}
		const [U, V] = torusUV(s, r, c);
		torusPoint(U, V, roll, bend, o);
		this.v.set(o.x, o.y, o.z).applyQuaternion(this.q[h]).add(this.T[h]);
		o.x = this.v.x;
		o.y = this.v.y;
		o.z = this.v.z;
		return o;
	}

	/** the point (s, r) of half h: s ∈ [0, 1] along its edges, r ∈ [0, 1] from c out to them */
	point(h: number, s: number, r: number, o: P3) {
		const c = this.col(s);
		this.base(h, s, r, o, c);
		const { join } = this.st;
		if (join <= 0 || r >= c.rc) return o;
		const n = this.neck(h, s, c);
		const tau = 1 - r / c.rc;
		const h00 = 2 * tau ** 3 - 3 * tau ** 2 + 1;
		const h10 = tau ** 3 - 2 * tau ** 2 + tau;
		const h01 = -2 * tau ** 3 + 3 * tau ** 2;
		const h11 = tau ** 3 - tau ** 2;
		o.x = mix(o.x, h00 * n.J[0] + h10 * n.m0[0] + h01 * n.W[0] + h11 * n.m1[0], join);
		o.y = mix(o.y, h00 * n.J[1] + h10 * n.m0[1] + h01 * n.W[1] + h11 * n.m1[1], join);
		o.z = mix(o.z, h00 * n.J[2] + h10 * n.m0[2] + h01 * n.W[2] + h11 * n.m1[2], join);
		return o;
	}

	/** the point of a sheet's grid: g is the row's place (rows crowd into the collar, which becomes the neck) */
	gridPoint(h: number, s: number, g: number, o: P3) {
		return this.point(h, s, rowR(g, this.col(s).rc), o);
	}

	/** the torus coordinates (U, V) of a sheet's grid point, for drawing grid lines along */
	gridUV(s: number, g: number): [number, number] {
		const c = this.col(s);
		return torusUV(s, rowR(g, c.rc), c);
	}

	/** the half-neck from the collar's outer edge at s to the waist: a Hermite curve, leaving the torus along it */
	private neck(h: number, s: number, c: Column): Neck {
		let n = this.necks[h].get(s);
		if (n) return n;
		const p = this.p;
		this.base(h, s, c.rc, p, c);
		const J = [p.x, p.y, p.z];
		const e = 1e-4;
		this.base(h, s, c.rc - e, p, c);
		const d = [p.x - J[0], p.y - J[1], p.z - J[2]];
		const dl = Math.hypot(d[0], d[1], d[2]) || 1;
		// the waist: a circle in the plane x = 0, its point for this s halfway (in angle round the x-axis)
		// between the rims of the two holes at the points that are glued together
		const lam = h ? 1 - s : s;
		this.base(0, lam, 0, p);
		const a1 = Math.atan2(p.z, p.y);
		this.base(1, 1 - lam, 0, p);
		const a2 = Math.atan2(p.z, p.y);
		let da = a2 - a1;
		while (da > Math.PI) da -= TAU;
		while (da < -Math.PI) da += TAU;
		const w = a1 + da / 2;
		const W = [0, G2.waist * Math.cos(w), G2.waist * Math.sin(w)];
		const L = Math.hypot(W[0] - J[0], W[1] - J[1], W[2] - J[2]);
		n = {
			J,
			W,
			m0: d.map((x) => (x / dl) * L),
			m1: [(h ? -1 : 1) * L, 0, 0]
		};
		this.necks[h].set(s, n);
		return n;
	}
}

interface Neck {
	J: number[];
	W: number[];
	m0: number[];
	m1: number[];
}
