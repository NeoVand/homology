// Untying a knot by force. Slide every point of a knot K in a straight line
// towards the matching point of a round circle C: K_s = (1 − s)K + sC. As a
// movie of maps from the circle this is a perfectly good homotopy, and at
// s = 1 the knot is gone. But somewhere on the way the strand must pass
// through itself: we find where, by watching the knot type (its Jones
// polynomial) change.
import { diagramOf, type V3 } from './diagram';
import { jones } from './invariants';
import { L, type Laurent } from './laurent';
import { segGap } from './relax';

export interface Untying {
	/** moments where the strand passes through itself, and where */
	events: { s: number; at: V3 }[];
	/** the knot type on each stretch between events */
	stretches: { from: number; to: number; name: string }[];
}

const named: [string, Laurent][] = [
	['an unknot', L.one()],
	['a trefoil', L.from({ 1: 1, 3: 1, 4: -1 })],
	['a trefoil', L.from({ [-1]: 1, [-3]: 1, [-4]: -1 })],
	['a figure-eight knot', L.from({ 2: 1, 1: -1, 0: 1, [-1]: -1, [-2]: 1 })]
];

export function knotName(V: Laurent): string {
	return named.find(([, p]) => L.eq(p, V))?.[0] ?? 'some other knot';
}

export const between = (K: V3[], C: V3[], s: number): V3[] =>
	K.map((p, i) => [p[0] + (C[i][0] - p[0]) * s, p[1] + (C[i][1] - p[1]) * s, p[2] + (C[i][2] - p[2]) * s]);

export function untie(K: V3[], C: V3[], samples = 120): Untying {
	const key = (s: number) => L.tex(jones(diagramOf([between(K, C, s)])));
	const ss = Array.from({ length: samples + 1 }, (_, i) => i / samples);
	const types = ss.map(key);
	const events: Untying['events'] = [];
	for (let i = 0; i < samples; i++) {
		if (types[i] === types[i + 1]) continue;
		// narrow down the moment, then find where the strand meets itself
		let a = ss[i];
		let b = ss[i + 1];
		for (let k = 0; k < 18; k++) {
			const m = (a + b) / 2;
			if (key(m) === types[i]) a = m;
			else b = m;
		}
		const s = (a + b) / 2;
		const P = between(K, C, s);
		const n = P.length;
		let best = Infinity;
		let at: V3 = P[0];
		for (let p = 0; p < n; p++)
			for (let q = p + 3; q < n; q++) {
				if (p === 0 && q >= n - 2) continue;
				const d = segGap(P[p], P[(p + 1) % n], P[q], P[(q + 1) % n]);
				if (d < best) {
					best = d;
					const A = P[p];
					const B = P[q];
					at = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2, (A[2] + B[2]) / 2];
				}
			}
		events.push({ s, at });
	}
	const cuts = [0, ...events.map((e) => e.s), 1];
	const stretches = cuts.slice(0, -1).map((from, i) => {
		const to = cuts[i + 1];
		return { from, to, name: knotName(jones(diagramOf([between(K, C, (from + to) / 2)]))) };
	});
	return { events, stretches };
}
