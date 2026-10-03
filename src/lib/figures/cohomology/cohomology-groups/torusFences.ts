// Fences and loops on the torus, in parameter coordinates (u, v) ∈ [0,1)²:
// u goes around the hole, v around the tube. A fence is a closed curve; its
// "measurement" of a closed loop is the number of crossings counted with sign.

export type FenceKind = 'alpha' | 'beta' | 'small';
export type LoopKind = 'p1q0' | 'p0q1' | 'p1q1' | 'p2q1' | 'small';

export interface FenceSpec {
	kind: FenceKind;
	/** wiggle amplitude (alpha, beta) in parameter units, at most MAX_WIGGLE in the figure */
	A: number;
}

export const MAX_WIGGLE = 0.11;

/** The loop as a path t ∈ [0,1] ↦ (u, v) (unwrapped). */
export function loopPathOf(kind: LoopKind): (t: number) => [number, number] {
	const u1 = 0.08;
	const v1 = 0.15;
	switch (kind) {
		case 'p1q0':
			return (t) => [u1 + t, v1];
		case 'p0q1':
			return (t) => [0.37, v1 + t];
		case 'p1q1':
			return (t) => [u1 + t, v1 + t];
		case 'p2q1':
			return (t) => [u1 + 2 * t, v1 + t];
		case 'small':
			return (t) => [0.78 + 0.06 * Math.cos(2 * Math.PI * t), 0.16 + 0.1 * Math.sin(2 * Math.PI * t)];
	}
}

/** (p, q): how many times the loop goes around the hole and around the tube. */
export function windings(kind: LoopKind): [number, number] {
	return kind === 'p1q0' ? [1, 0] : kind === 'p0q1' ? [0, 1] : kind === 'p1q1' ? [1, 1] : kind === 'p2q1' ? [2, 1] : [0, 0];
}

/** The fence as a path s ∈ [0,1] ↦ (u, v) (unwrapped). */
const ALPHA_U = 0.3;
const BETA_V = 0.24;
const SMALL = { u: 0.6, v: 0.2, ru: 0.1, rv: 0.13 };

export function fencePathOf(f: FenceSpec): (s: number) => [number, number] {
	const m = 2;
	if (f.kind === 'alpha') return (s) => [ALPHA_U + f.A * Math.sin(2 * Math.PI * m * s), s];
	if (f.kind === 'beta') return (s) => [s, BETA_V + f.A * Math.sin(2 * Math.PI * m * s)];
	return (s) => [SMALL.u + SMALL.ru * Math.cos(2 * Math.PI * s), SMALL.v + SMALL.rv * Math.sin(2 * Math.PI * s)];
}

/**
 * A function g on the torus whose sign changes mark the fence. For alpha/beta it is the
 * unwrapped offset (crossings = integers passed); for the small fence it is distance − radius.
 */
function level(f: FenceSpec, u: number, v: number): number {
	const m = 2;
	if (f.kind === 'alpha') return u - (ALPHA_U + f.A * Math.sin(2 * Math.PI * m * v));
	if (f.kind === 'beta') return v - (BETA_V + f.A * Math.sin(2 * Math.PI * m * u));
	// the small fence is an ellipse, using the nearest copy of its centre on the torus
	const du = ((((u - SMALL.u + 0.5) % 1) + 1) % 1) - 0.5;
	const dv = ((((v - SMALL.v + 0.5) % 1) + 1) % 1) - 0.5;
	return Math.hypot(du / SMALL.ru, dv / SMALL.rv) - 1;
}

/** Signed crossings of a loop with a fence, with the loop parameter t of each crossing. */
export function crossings(f: FenceSpec, loop: LoopKind, samples = 6000): { t: number; sign: 1 | -1 }[] {
	const path = loopPathOf(loop);
	const out: { t: number; sign: 1 | -1 }[] = [];
	if (f.kind === 'small') {
		// count entries (+1) and exits (−1) of the region inside the small fence
		let prev = level(f, ...path(0)) < 0;
		for (let i = 1; i <= samples; i++) {
			const t = i / samples;
			const inside = level(f, ...path(t)) < 0;
			if (inside !== prev) out.push({ t: t - 0.5 / samples, sign: inside ? 1 : -1 });
			prev = inside;
		}
		return out;
	}
	let prev = Math.floor(level(f, ...path(0)));
	for (let i = 1; i <= samples; i++) {
		const t = i / samples;
		const cur = Math.floor(level(f, ...path(t)));
		if (cur !== prev) {
			const step = cur > prev ? 1 : -1;
			for (let k = prev; k !== cur; k += step) out.push({ t: t - 0.5 / samples, sign: step as 1 | -1 });
			prev = cur;
		}
	}
	return out;
}
