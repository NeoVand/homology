// Morphs from the flat square to the six glued surfaces of the gluing workshop.
//
// Conventions (shared with the 2D diagrams): u runs left → right, v bottom → top.
// Edges: left u = 0, right u = 1, bottom v = 0, top v = 1. Edge pair "a" is
// bottom/top (gold), pair "b" is left/right (teal), exactly as in GluingSquare,
// and every word is read counter-clockwise from the bottom-left corner.
//
// Each preset gives P(u, v, t) in 3D: at t = 0 the flat square (in the
// xy-plane, facing the camera), at t = 1 a surface on which glued points
// really coincide (tested in morphs.test.ts). In between, the sheet only
// stretches and bends — never tears.
import type { P3 } from './sheet';

export type PresetId = 'cylinder' | 'mobius' | 'torus' | 'klein' | 'sphere' | 'rp2';

const TAU = Math.PI * 2;
const L = 3; // side of the flat square

function clamp01(x: number) {
	return x < 0 ? 0 : x > 1 ? 1 : x;
}
function ease(x: number) {
	const t = clamp01(x);
	return t * t * (3 - 2 * t);
}
function seg(t: number, a: number, b: number) {
	return ease((t - a) / (b - a));
}
function mix(a: number, b: number, t: number) {
	return a + (b - a) * t;
}
/** x-coordinate of a strip of arc length s bent with curvature k (→ s as k → 0). */
function bendS(k: number, s: number) {
	return Math.abs(k) < 1e-7 ? s : Math.sin(k * s) / k;
}
/** how far a bent strip has curled away from its tangent line (→ 0 as k → 0). */
function bendC(k: number, s: number) {
	if (Math.abs(k * s) < 1e-4) return (k * s * s) / 2;
	return (1 - Math.cos(k * s)) / k;
}
/** mean of bendC over s ∈ [−len/2, len/2]: used to keep a curling strip centred. */
function arcMean(k: number, len: number) {
	const h = (k * len) / 2;
	if (Math.abs(h) < 1e-3) return (k * len * len) / 24;
	return (1 - Math.sin(h) / h) / k;
}

/** Turn the finished shape towards a good viewing angle: about x by rx, then about y by ry. */
function pose(o: P3, rx: number, ry: number) {
	const c1 = Math.cos(rx),
		s1 = Math.sin(rx);
	const y = o.y * c1 - o.z * s1;
	const z = o.y * s1 + o.z * c1;
	const c2 = Math.cos(ry),
		s2 = Math.sin(ry);
	const x = o.x * c2 + z * s2;
	o.z = -o.x * s2 + z * c2;
	o.x = x;
	o.y = y;
}

// ── individual morphs ──────────────────────────────────────────────────────

/** Roll the u-direction toward the camera into a loop (left and right edges meet in front). */
function cylinder(u: number, v: number, t: number, o: P3) {
	const e = seg(t, 0.04, 0.96);
	const R = 0.95;
	const len = mix(L, TAU * R, e);
	const H = mix(L, 2.5, e);
	const k = (e * TAU) / len;
	const s = (u - 0.5) * len;
	o.x = bendS(k, s);
	o.y = (v - 0.5) * H;
	o.z = bendC(k, s) - arcMean(k, len);
	pose(o, -0.42 * e, 0.5 * e);
}

/** As the cylinder, but the cross-section turns through half a turn on the way round. */
function mobius(u: number, v: number, t: number, o: P3) {
	const e = seg(t, 0.04, 0.96);
	const R = 1.25;
	const len = mix(L, TAU * R, e);
	const W = mix(L, 1.15, e);
	const k = (e * TAU) / len;
	const s = (u - 0.5) * len;
	const cx = bendS(k, s);
	const cz = bendC(k, s) - arcMean(k, len);
	// in-plane normal (towards the centre of curvature)
	const nx = -Math.sin(k * s);
	const nz = Math.cos(k * s);
	const tau = e * Math.PI * (s / len);
	const w = (v - 0.5) * W;
	o.x = cx + w * Math.sin(tau) * nx;
	o.y = w * Math.cos(tau);
	o.z = cz + w * Math.sin(tau) * nz;
	pose(o, -0.62 * e, 0.25 * e);
}

/** Shared first stage of torus and Klein bottle: roll u into a vertical tube of radius r. */
function rollTube(u: number, e: number, r: number, out: { cx: number; cz: number }) {
	const len = mix(L, TAU * r, e);
	const k = (e * TAU) / len;
	const s = (u - 0.5) * len;
	out.cx = bendS(k, s);
	out.cz = bendC(k, s) - arcMean(k, len);
}
const _cs = { cx: 0, cz: 0 };

function torus(u: number, v: number, t: number, o: P3) {
	const r = 0.6;
	const R = 1.55;
	const eA = seg(t, 0.0, 0.42);
	const eB = seg(t, 0.5, 1.0);
	rollTube(u, eA, r, _cs);
	// the tube's axis (vertical) bends round to the left into a ring in the xy-plane
	const len = mix(L, TAU * R, eB);
	const k = (eB * TAU) / len;
	const s = (v - 0.5) * len;
	const ax = -bendC(k, s) + arcMean(k, len);
	const ay = bendS(k, s);
	const c = Math.cos(k * s);
	const sn = Math.sin(k * s);
	// local x of the cross-section follows the outward normal of the bent axis
	o.x = ax + _cs.cx * c;
	o.y = ay + _cs.cx * sn;
	o.z = _cs.cz;
	pose(o, -0.95 * eB, 0.45 * eA - 0.15 * eB);
}

// The "bottle" immersion of the Klein bottle (as in surfaces.ts kleinBottle and the
// three.js examples) written as a tube: centre line c(U), radius ρ(U), and a
// circular cross-section spanned by e1 = (cos θ, sin θ, 0) and e2 = (0, 0, −1),
// for U ∈ [0, 2π]. Its own gluing rule is f(0, V) = f(2π, π − V).
const KS = 0.2;
function bc(U: number, out: { x: number; y: number }) {
	out.x = 3 * Math.cos(U) * (1 + Math.sin(U)) * KS;
	out.y = (8 * Math.sin(U) - 2) * KS;
}
const bRho = (U: number) => 2 * (1 - Math.cos(U) / 2) * KS;
const bTheta = (U: number) => (U < Math.PI ? U : Math.PI);

// arc length of the centre line, tabulated
const NS = 4096;
const arcTable = (() => {
	const S = new Float64Array(NS + 1);
	const a = { x: 0, y: 0 };
	const b = { x: 0, y: 0 };
	bc(0, a);
	for (let i = 1; i <= NS; i++) {
		bc((TAU * i) / NS, b);
		S[i] = S[i - 1] + Math.hypot(b.x - a.x, b.y - a.y);
		a.x = b.x;
		a.y = b.y;
	}
	return S;
})();
function arcAt(U: number) {
	const f = (Math.min(TAU, Math.max(0, U)) / TAU) * NS;
	const i = Math.min(NS - 1, Math.floor(f));
	return arcTable[i] + (arcTable[i + 1] - arcTable[i]) * (f - i);
}
// direction of the centre line at U = π, walked with U decreasing: (−3, 8)·KS
const KG = Math.PI / 2 - Math.atan2(8, -3); // turn that makes it point straight up
const _c0 = { x: 0, y: 0 };
const _c1 = { x: 0, y: 0 };
bc(Math.PI, _c0);

/**
 * Klein bottle: roll into a tube (glue b), then show a growing piece of the
 * bottle — the part with U in [π − απ, π + απ] — with its centre line zoomed
 * (not its thickness) so that a tiny piece is the straight tube. At α = 1 the
 * piece is the whole bottle and its two end circles meet, one reversed.
 */
let _kt = -1;
let _kZ = 1;
let _kA = 0;
function klein(u: number, v: number, t: number, o: P3) {
	const r = 0.45;
	const H = 3.0;
	const eA = seg(t, 0.0, 0.34);
	const eB = seg(t, 0.4, 1.0);
	rollTube(u, eA, r, _cs);
	if (eB <= 0) {
		o.x = _cs.cx;
		o.y = (v - 0.5) * mix(L, H, eA);
		o.z = _cs.cz;
		pose(o, 0, 0.45 * eA);
		return;
	}
	if (t !== _kt) {
		_kt = t;
		_kA = Math.max(eB, 1e-4);
		const len = arcAt(Math.PI + _kA * Math.PI) - arcAt(Math.PI - _kA * Math.PI);
		_kZ = Math.pow(H / len, 1 - _kA);
	}
	const al = _kA;
	const U = Math.PI - al * Math.PI * (2 * v - 1);
	bc(U, _c1);
	// rotate the piece so that it starts out vertical, easing the turn away as it grows
	const g = KG * (1 - al);
	const cg = Math.cos(g);
	const sg = Math.sin(g);
	const dx = (_c1.x - _c0.x) * _kZ;
	const dy = (_c1.y - _c0.y) * _kZ;
	const ax = dx * cg - dy * sg;
	const ay = dx * sg + dy * cg;
	const rho = mix(r, bRho(U), al * al * (3 - 2 * al));
	const th = bTheta(U);
	const V = TAU * (u - 0.25);
	const cV = Math.cos(V);
	const sV = Math.sin(V);
	o.x = ax + rho * cV * Math.cos(th);
	o.y = ay + rho * cV * Math.sin(th);
	o.z = -rho * sV;
	pose(o, -0.18 * eB, 0.45 * eA + 0.35 * eB);
}

/** Envelope: turn the square on its corner, then curl every row into a circle of a sphere. */
function sphere(u: number, v: number, t: number, o: P3) {
	const eA = seg(t, 0, 0.22);
	const eB = seg(t, 0.28, 1.0);
	const Rs = 1.35;
	// flat position, rotated by eA · 45°
	const x0 = (u - 0.5) * L;
	const y0 = (v - 0.5) * L;
	const a = (eA * Math.PI) / 4;
	const xf = x0 * Math.cos(a) - y0 * Math.sin(a);
	const yf = x0 * Math.sin(a) + y0 * Math.cos(a);
	if (eB <= 0) {
		o.x = xf;
		o.y = yf;
		o.z = 0;
		return;
	}
	// diamond coordinates: p along the diagonal (0,0)→(1,1), q across it
	const p = (u + v) / 2;
	const q = u - v;
	const qmax = 2 * Math.min(p, 1 - p);
	const h = (qmax * L) / Math.SQRT2; // half-length of this row in the diamond
	const phi = Math.PI * p;
	const len = mix(2 * h, TAU * Rs * Math.sin(phi), eB);
	const k = len > 1e-9 ? (eB * TAU) / len : 0;
	const s = qmax > 1e-9 ? (q / qmax) * (len / 2) : 0;
	o.x = bendS(k, s);
	o.z = -(bendC(k, s) - arcMean(k, len));
	o.y = mix((2 * p - 1) * (L / Math.SQRT2), -Rs * Math.cos(phi), eB);
	pose(o, -0.3 * eB, 0.62 * eB);
}

/**
 * Boy's surface (Bryant–Kusner), an immersion of the projective plane, as a map
 * of the unit disk w = (wr, wi): opposite points of the rim (w and −w with |w| = 1)
 * land on the same point. Raw output, before any scaling.
 */
export function boyRaw(wr: number, wi: number, out: P3) {
	const s5 = Math.sqrt(5);
	const w2r = wr * wr - wi * wi,
		w2i = 2 * wr * wi;
	const w3r = w2r * wr - w2i * wi,
		w3i = w2r * wi + w2i * wr;
	const w4r = w2r * w2r - w2i * w2i,
		w4i = 2 * w2r * w2i;
	const w6r = w3r * w3r - w3i * w3i,
		w6i = 2 * w3r * w3i;
	const Dr = w6r + s5 * w3r - 1;
	const Di = w6i + s5 * w3i;
	const dd = Dr * Dr + Di * Di;
	if (dd < 1e-18) {
		out.x = out.y = out.z = 0;
		return;
	}
	// n1 = w(1 − w⁴), n2 = w(1 + w⁴), n3 = 1 + w⁶
	const n1r = wr * (1 - w4r) + wi * w4i,
		n1i = wi * (1 - w4r) - wr * w4i;
	const n2r = wr * (1 + w4r) - wi * w4i,
		n2i = wi * (1 + w4r) + wr * w4i;
	const n3r = 1 + w6r,
		n3i = w6i;
	// division by D: (a + bi)/(Dr + Di i)
	const q1i = (n1i * Dr - n1r * Di) / dd;
	const q2r = (n2r * Dr + n2i * Di) / dd;
	const q3i = (n3i * Dr - n3r * Di) / dd;
	const g1 = -1.5 * q1i;
	const g2 = -1.5 * q2r;
	const g3 = q3i - 0.5;
	const g = g1 * g1 + g2 * g2 + g3 * g3;
	// y is the 3-fold symmetry axis
	out.x = g1 / g;
	out.y = g3 / g;
	out.z = g2 / g;
}

// Boy's surface, framed so that the tiny cap around w = 0 starts out as a flat
// disk facing the camera (matching the flat square), then grows and turns up.
const _b0 = { x: 0, y: 0, z: 0 };
const _b1 = { x: 0, y: 0, z: 0 };
const boyFrame = (() => {
	const h = 1e-5;
	boyRaw(0, 0, _b0);
	boyRaw(h, 0, _b1);
	const e1 = [(_b1.x - _b0.x) / h, (_b1.y - _b0.y) / h, (_b1.z - _b0.z) / h];
	boyRaw(0, h, _b1);
	const e2 = [(_b1.x - _b0.x) / h, (_b1.y - _b0.y) / h, (_b1.z - _b0.z) / h];
	const lam = Math.hypot(e1[0], e1[1], e1[2]);
	const n1 = e1.map((c) => c / lam);
	const d = e2[0] * n1[0] + e2[1] * n1[1] + e2[2] * n1[2];
	const p2 = e2.map((c, i) => c - d * n1[i]);
	const l2 = Math.hypot(p2[0], p2[1], p2[2]);
	const n2 = p2.map((c) => c / l2);
	const n3 = [n1[1] * n2[2] - n1[2] * n2[1], n1[2] * n2[0] - n1[0] * n2[2], n1[0] * n2[1] - n1[1] * n2[0]];
	return { origin: { ..._b0 }, lam, n1, n2, n3 };
})();

/** Square → round disk → a disk growing into Boy's surface (rim points w, −w meet at the end). */
function rp2(u: number, v: number, t: number, o: P3) {
	const eA = seg(t, 0, 0.24);
	const eB = seg(t, 0.3, 1.0);
	const x = 2 * u - 1;
	const y = 2 * v - 1;
	const m = Math.max(Math.abs(x), Math.abs(y));
	const n = Math.hypot(x, y);
	const f = n > 1e-12 ? m / n : 0;
	const Rd = 1.6;
	// stage A: square → disk of radius Rd (a radial squash; opposite points stay opposite)
	const dx = mix((x * L) / 2, x * f * Rd, eA);
	const dy = mix((y * L) / 2, y * f * Rd, eA);
	if (eB <= 0) {
		o.x = dx;
		o.y = dy;
		o.z = 0;
		return;
	}
	// stage B: show the part |w| ≤ ρ of Boy's surface, rescaled by 1/ρ
	const rho = mix(0.004, 1, eB * eB * (0.6 + 0.4 * eB));
	const wr = x * f * rho;
	const wi = y * f * rho;
	boyRaw(wr, wi, _b1);
	const F = boyFrame;
	const qx = _b1.x - F.origin.x,
		qy = _b1.y - F.origin.y,
		qz = _b1.z - F.origin.z;
	const sc = Rd / (F.lam * rho);
	// coordinates in the frame of the cap at w = 0 (the cap faces the camera)
	const X = (qx * F.n1[0] + qy * F.n1[1] + qz * F.n1[2]) * sc;
	const Y = (qx * F.n2[0] + qy * F.n2[1] + qz * F.n2[2]) * sc;
	const Z = (qx * F.n3[0] + qy * F.n3[1] + qz * F.n3[2]) * sc;
	// turn it as it grows so that we end up looking at it from the side
	const al = BOY_TILT * eB;
	const ca = Math.cos(al);
	const sa = Math.sin(al);
	o.x = X;
	o.y = Y * ca - Z * sa;
	o.z = Y * sa + Z * ca;
}
const BOY_TILT = -1.2;

// ── preset metadata ────────────────────────────────────────────────────────

export interface SideSpec {
	label?: string;
	dir?: 1 | -1 | 0;
	marks?: 1 | 2;
	color?: string;
	free?: boolean;
}

export interface GluePreset {
	id: PresetId;
	label: string;
	/** TeX for the surface's name */
	name: string;
	/** TeX: the gluing rule as an equivalence relation */
	rule: string;
	/** TeX: the edge word read counter-clockwise from the bottom-left corner (closed surfaces only) */
	word: string | null;
	/** sides for GluingSquare */
	sides: { bottom: SideSpec; right: SideSpec; top: SideSpec; left: SideSpec };
	/** corner classes for BL, BR, TR, TL */
	corners: [number, number, number, number];
	/** can it sit in ordinary 3D space without passing through itself? */
	embeds: boolean;
	/** labelled milestones of the morph */
	stages: { at: number; label: string }[];
	f: (u: number, v: number, t: number, o: P3) => void;
}

const gold = 'var(--gold-bright)';
const teal = 'var(--teal)';
const A = (dir: 1 | -1): SideSpec => ({ label: 'a', dir, marks: 1, color: gold });
const B = (dir: 1 | -1): SideSpec => ({ label: 'b', dir, marks: 2, color: teal });
const FREE: SideSpec = { free: true };

export const presets: Record<PresetId, GluePreset> = {
	cylinder: {
		id: 'cylinder',
		label: 'Cylinder',
		name: 'S^1 \\times I',
		rule: '(0,y)\\sim(1,y)',
		word: null,
		sides: { bottom: FREE, top: FREE, left: B(1), right: B(1) },
		corners: [0, 0, 1, 1],
		embeds: true,
		stages: [
			{ at: 0, label: 'The flat square' },
			{ at: 0.03, label: 'Roll it up: the two b-edges come together' },
			{ at: 0.97, label: 'Glued: a cylinder, with two boundary circles' }
		],
		f: cylinder
	},
	mobius: {
		id: 'mobius',
		label: 'Möbius band',
		name: '\\text{Möbius band}',
		rule: '(0,y)\\sim(1,1-y)',
		word: null,
		sides: { bottom: FREE, top: FREE, left: B(1), right: B(-1) },
		corners: [0, 1, 0, 1],
		embeds: true,
		stages: [
			{ at: 0, label: 'The flat square' },
			{ at: 0.03, label: 'Roll it up with a half twist (stretching is allowed)' },
			{ at: 0.97, label: 'Glued: a Möbius band, with one boundary circle' }
		],
		f: mobius
	},
	torus: {
		id: 'torus',
		label: 'Torus',
		name: 'T^2',
		rule: '(x,0)\\sim(x,1),\\ (0,y)\\sim(1,y)',
		word: 'aba^{-1}b^{-1}',
		sides: { bottom: A(1), top: A(1), left: B(1), right: B(1) },
		corners: [0, 0, 0, 0],
		embeds: true,
		stages: [
			{ at: 0, label: 'The flat square' },
			{ at: 0.02, label: 'Roll: the b-edges come together — a tube' },
			{ at: 0.48, label: 'Bend: the tube’s two end circles (a) come together' },
			{ at: 0.98, label: 'Glued: a torus' }
		],
		f: torus
	},
	klein: {
		id: 'klein',
		label: 'Klein bottle',
		name: 'K',
		rule: '(x,0)\\sim(1-x,1),\\ (0,y)\\sim(1,y)',
		word: 'abab^{-1}',
		sides: { bottom: A(1), top: A(-1), left: B(1), right: B(1) },
		corners: [0, 0, 0, 0],
		embeds: false,
		stages: [
			{ at: 0, label: 'The flat square' },
			{ at: 0.02, label: 'Roll: the b-edges come together — a tube' },
			{ at: 0.4, label: 'Bend the tube over…' },
			{ at: 0.68, label: '…and push its end through the wall, to meet the other end from inside' },
			{ at: 0.98, label: 'Glued (crossing itself): a Klein bottle' }
		],
		f: klein
	},
	sphere: {
		id: 'sphere',
		label: 'Sphere',
		name: 'S^2',
		rule: '(x,0)\\sim(0,x),\\ (x,1)\\sim(1,x)',
		word: 'abb^{-1}a^{-1}',
		sides: { bottom: A(1), left: A(1), top: B(1), right: B(1) },
		corners: [0, 1, 2, 1],
		embeds: true,
		stages: [
			{ at: 0, label: 'The flat square' },
			{ at: 0.02, label: 'Stand the square on a corner' },
			{ at: 0.26, label: 'Fold along the diagonal and zip the edges together' },
			{ at: 0.98, label: 'Glued: a sphere' }
		],
		f: sphere
	},
	rp2: {
		id: 'rp2',
		label: 'Projective plane',
		name: '\\RP^2',
		rule: '(x,0)\\sim(1-x,1),\\ (0,y)\\sim(1,1-y)',
		word: 'abab',
		sides: { bottom: A(1), top: A(-1), left: B(-1), right: B(1) },
		corners: [0, 1, 0, 1],
		embeds: false,
		stages: [
			{ at: 0, label: 'The flat square' },
			{ at: 0.02, label: 'Round the square into a disk' },
			{ at: 0.28, label: 'Grow it, letting it pass through itself…' },
			{ at: 0.98, label: '…until opposite rim points meet: Boy’s surface' }
		],
		f: rp2
	}
};

export const presetOrder: PresetId[] = ['cylinder', 'mobius', 'torus', 'klein', 'sphere', 'rp2'];

/** Edge specs for the 3D sheet material, in the order left, right, bottom, top. */
export function edgeSpecs(p: GluePreset) {
	const conv = (s: SideSpec) => ({
		on: s.free ? -1 : s.label ? 1 : 0,
		dir: (s.dir === -1 ? -1 : 1) as 1 | -1,
		color: s.label === 'a' ? ('gold' as const) : ('teal' as const),
		marks: (s.marks ?? 1) as 1 | 2
	});
	return [conv(p.sides.left), conv(p.sides.right), conv(p.sides.bottom), conv(p.sides.top)] as const;
}
