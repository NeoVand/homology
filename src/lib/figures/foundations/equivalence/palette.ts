// Colours for equivalence classes. The first six follow the book's semantic
// palette; the rest are harmonious extras so that up to 12 classes stay distinct.
// Colour is never the only cue: every class also carries a label.

export const classColors = [
	'#f2d08f', // gold
	'#5fd6cf', // teal
	'#a493ff', // violet
	'#f28db6', // rose
	'#74a9ff', // blue
	'#84d9a2', // green
	'#f4b55f', // amber
	'#ff9e8a', // coral
	'#d2c2ff', // lilac
	'#9be3ff', // sky
	'#e3df8f', // lime
	'#e7a8e9' // orchid
];

export function classColor(k: number): string {
	return classColors[((k % classColors.length) + classColors.length) % classColors.length];
}

const ramp: [number, number, number][] = [
	[242, 208, 143], // gold
	[95, 214, 207], // teal
	[164, 147, 255], // violet
	[242, 141, 182] // rose
];

/** A sequential colour for t ∈ [0, 1] (gold → teal → violet → rose), for ordered classes. */
export function rampColor(t: number): string {
	const x = Math.min(1, Math.max(0, t)) * (ramp.length - 1);
	const i = Math.min(ramp.length - 2, Math.floor(x));
	const f = x - i;
	const c = ramp[i].map((v, j) => Math.round(v + (ramp[i + 1][j] - v) * f));
	return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

/** Deterministic pseudo-random numbers (mulberry32), so that SSR and the browser agree. */
export function rng(seed: number) {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** Scatter k points in a box with a minimum spacing (deterministic). */
export function scatter(k: number, box: [number, number, number, number], minDist: number, seed = 7): [number, number][] {
	const [x0, y0, x1, y1] = box;
	const r = rng(seed);
	const pts: [number, number][] = [];
	let d = minDist;
	let fails = 0;
	while (pts.length < k) {
		const p: [number, number] = [x0 + r() * (x1 - x0), y0 + r() * (y1 - y0)];
		if (pts.every((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) >= d)) {
			pts.push(p);
			fails = 0;
		} else if (++fails > 2000) {
			d *= 0.9; // too crowded: relax the spacing a little
			fails = 0;
		}
	}
	return pts;
}
