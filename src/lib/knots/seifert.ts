// Seifert's algorithm on a closed braid, built in space. A closed braid seen
// from above is the most transparent diagram there is for the algorithm:
// smoothing every crossing the way the strands run leaves one circle per
// strand (concentric rings round the axis), so s = n; each circle bounds a
// disk; the disks are stacked, one above the next, and every crossing becomes
// a band with a half twist joining two neighbouring disks.
//
// One family of curves does both pictures. At λ = 0 slot k is a ring of radius
// R0 + gap·k lying flat (the diagram, with the same handedness as braidClosure:
// for σᵢ the strand moving outwards passes on top). As λ grows the rings move
// to a common radius R and to heights one above the other, the innermost on
// top; at λ = 1 they are the rims of n stacked disks. Near a crossing the two
// strands that swap are the two long edges of a band, so at λ = 1 the knot is
// exactly the boundary of disks ∪ bands. Nothing passes through anything on the
// way (the slots stay in a line in the (r, z) half-plane and the two crossing
// strands always keep apart), so every stage is the same knot.
import type { V3 } from './diagram';

const TAU = Math.PI * 2;

export interface ClosedBraid {
	n: number;
	/** +i is σᵢ, −i is σᵢ⁻¹ (as in braidClosure) */
	word: number[];
	/** flat diagram: slot k is a ring of radius R0 + gap·k */
	R0: number;
	gap: number;
	/** stacked: every disk has radius R, and neighbouring disks are d apart */
	R: number;
	d: number;
	/** how far a band's waist reaches out from its centre line (and how high a crossing bumps in the flat diagram) */
	w: number;
	/** half the angle a crossing (a band) spans */
	delta: number;
}

export function closedBraid(
	n: number,
	word: number[],
	o: Partial<Omit<ClosedBraid, 'n' | 'word'>> = {}
): ClosedBraid {
	const c = Math.max(1, word.length);
	return {
		n,
		word,
		R0: o.R0 ?? 0.85,
		gap: o.gap ?? 0.5,
		R: o.R ?? 1.5,
		d: o.d ?? 0.7,
		w: o.w ?? 0.26,
		// wide enough to read and to bend gently, never reaching the next crossing
		delta: o.delta ?? Math.min(0.6, (0.55 * Math.PI) / c)
	};
}

// smooth to second order at both ends, so a strand leaves its circle for a band without an elbow
const smooth = (s: number) => s * s * s * (10 + s * (6 * s - 15));
/** how far the band reaches across its centre line: 0 at the disks, most at the waist */
const reach = (s: number) => Math.sin(Math.PI * s) ** 2;

/** where slot k sits in the half-plane (r, z) at stage λ */
export function slotAt(B: ClosedBraid, k: number, lambda: number): [number, number] {
	const flatR = B.R0 + B.gap * k;
	return [(1 - lambda) * flatR + lambda * B.R, lambda * ((B.n - 1) / 2 - k) * B.d];
}

/** the angle at the middle of the m-th letter (its crossing, its band) */
export function crossingAngle(B: ClosedBraid, m: number): number {
	return (TAU * (m + 0.5)) / Math.max(1, B.word.length);
}

const cyl = (r: number, th: number, z: number): V3 => [r * Math.cos(th), r * Math.sin(th), z];

/**
 * A point of the band at the m-th letter σᵢ^±1, joining circle i (s = 0) to
 * circle i + 1 (s = 1), with u ∈ [−1, 1] across it. At s = 0 the band runs
 * along an arc of circle i, at s = 1 along an arc of circle i + 1 (the other
 * way round: a half twist); its edges u = −1 and u = +1 are the two strands of
 * the crossing. Which way it twists is the crossing's sign.
 */
export function bandPoint(B: ClosedBraid, m: number, s: number, u: number, lambda = 1): V3 {
	const g = B.word[m];
	const i = Math.abs(g) - 1;
	const [ri, zi] = slotAt(B, i, lambda);
	const [rj, zj] = slotAt(B, i + 1, lambda);
	const dr = rj - ri;
	const dz = zj - zi;
	const len = Math.hypot(dr, dz);
	// J = the direction at right angles to the line of slots (up in the flat diagram, outwards when stacked)
	const Jr = -dz / len;
	const Jz = dr / len;
	const e = smooth(s);
	const off = -Math.sign(g) * u * B.w * reach(s);
	return cyl(ri + dr * e + off * Jr, crossingAngle(B, m) + u * B.delta * (1 - 2 * s), zi + dz * e + off * Jz);
}

/** a point of disk k (u around, v from the centre out to the rim) at stage λ */
export function diskPoint(B: ClosedBraid, k: number, u: number, v: number, lambda = 1): V3 {
	const [r, z] = slotAt(B, k, lambda);
	return cyl(r * v, TAU * u, z);
}

/** Seifert circle k at stage λ, as a closed polyline */
export function circleAt(B: ClosedBraid, k: number, lambda: number, m = 160): V3[] {
	const [r, z] = slotAt(B, k, lambda);
	return Array.from({ length: m }, (_, j) => cyl(r, (TAU * j) / m, z));
}

/** where each strand (named by the slot it starts in) ends up after the whole word */
export function permutation(n: number, word: number[]): number[] {
	const pos = Array.from({ length: n }, (_, s) => s);
	for (const g of word) {
		const i = Math.abs(g) - 1;
		const a = pos.indexOf(i);
		const b = pos.indexOf(i + 1);
		pos[a] = i + 1;
		pos[b] = i;
	}
	return pos;
}

/** the components of the closure: cycles of the permutation, as lists of starting slots (as braidClosure orders them) */
export function cyclesOf(perm: number[]): number[][] {
	const seen = new Set<number>();
	const out: number[][] = [];
	for (let s0 = 0; s0 < perm.length; s0++) {
		if (seen.has(s0)) continue;
		const cyc: number[] = [];
		for (let s = s0; !seen.has(s); s = perm[s]) {
			seen.add(s);
			cyc.push(s);
		}
		out.push(cyc);
	}
	return out;
}

/**
 * The closed braid at stage λ: one closed polyline per component, every
 * strand running counterclockwise round the axis (seen from above). `per`
 * sets the sampling: about 2·per points through each crossing.
 */
export function knotAt(B: ClosedBraid, lambda: number, per = 14): V3[][] {
	const { n, word } = B;
	const c = word.length;
	const paths: V3[][] = Array.from({ length: n }, () => []);
	const pos = Array.from({ length: n }, (_, s) => s);
	const slot = Array.from({ length: n }, (_, k) => slotAt(B, k, lambda));
	const put = (s: number, th: number) => {
		const [r, z] = slot[pos[s]];
		paths[s].push(cyl(r, th, z));
	};
	if (c === 0) {
		for (let j = 0; j < 8 * per; j++) for (let s = 0; s < n; s++) put(s, (TAU * j) / (8 * per));
	}
	for (let m = 0; m < c; m++) {
		const g = word[m];
		const i = Math.abs(g) - 1;
		const a = pos.indexOf(i); // moves from slot i to slot i + 1
		const b = pos.indexOf(i + 1);
		const th0 = (TAU * m) / c;
		const th1 = (TAU * (m + 1)) / c;
		const tc = crossingAngle(B, m);
		const lo = tc - B.delta;
		const hi = tc + B.delta;
		// the run before the crossing, the crossing itself (finely), the run after
		const k1 = Math.max(3, Math.round((per * (lo - th0)) / (2 * B.delta)));
		for (let j = 0; j < k1; j++) for (let s = 0; s < n; s++) put(s, th0 + ((lo - th0) * j) / k1);
		const k2 = 2 * per;
		for (let j = 0; j < k2; j++) {
			// sampled half a step off, so that no vertex sits exactly on the crossing (a generic projection)
			const t = (j + 0.5) / k2;
			const th = lo + (hi - lo) * t;
			for (let s = 0; s < n; s++) {
				if (s === a) paths[s].push(bandPoint(B, m, t, -1, lambda));
				else if (s === b) paths[s].push(bandPoint(B, m, 1 - t, 1, lambda));
				else put(s, th);
			}
		}
		pos[a] = i + 1;
		pos[b] = i;
		for (let j = 0; j < k1; j++) for (let s = 0; s < n; s++) put(s, hi + ((th1 - hi) * j) / k1);
	}
	// strand s ends in slot pos[s], where strand pos[s] begins: join the paths into components
	return cyclesOf(pos).map((cyc) => cyc.flatMap((s) => paths[s]));
}

export interface SeifertCounts {
	/** Seifert circles: one per strand */
	s: number;
	/** crossings: one band each */
	c: number;
	/** χ = s − c: s disks, and each band costs one */
	chi: number;
	/** components of the boundary */
	components: number;
	/** genus of the surface, from χ = 2 − 2g − (number of boundary circles) */
	genus: number;
}

export function seifertCounts(n: number, word: number[]): SeifertCounts {
	const s = n;
	const c = word.length;
	const components = cyclesOf(permutation(n, word)).length;
	const chi = s - c;
	return { s, c, chi, components, genus: (2 - components - chi) / 2 };
}
