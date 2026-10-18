// The relaxing knot of Figure 3.7.2, off the page's main thread: it tangles a knot from the table,
// lets it relax a step at a time (about one step for each frame drawn, so that it can be watched),
// lays it flat on request, and when it has settled says which knot it is, from its Jones polynomial.
import type { V3 } from './diagram';
import { diagramOf } from './diagram';
import { Relaxer, tangle } from './live';
import { knotById } from './table';
import { unknot } from './curves';
import { bestTurn, bestView } from './view';
import { resample } from './relax';
import { alexander, jones, normaliseAlexander } from './invariants';
import type { Laurent } from './laurent';

export type ToWorker =
	| { type: 'tangle'; id: string; seed: number }
	| { type: 'run' }
	| { type: 'pause' }
	| { type: 'flatten' };

export type FromWorker =
	| { type: 'shape'; comps: Float32Array[]; E: number; steps: number; settled: boolean; flat: boolean }
	| { type: 'named'; id: string; mirror: boolean; crossings: number };

let R: Relaxer | null = null;
let running = false;
let flat = false;
let named = false;
let timer: ReturnType<typeof setTimeout> | null = null;
let id = 'unknot';

const post = (m: FromWorker, transfer: Transferable[] = []) => (self as unknown as Worker).postMessage(m, transfer);

function send() {
	if (!R) return;
	const comps = R.shape().map((c) => Float32Array.from(c.flat()));
	post({ type: 'shape', comps, E: R.E, steps: R.steps, settled: R.settled, flat }, comps.map((c) => c.buffer));
}

/** the knots it may be, with their Jones polynomials (computed once, from their simplest drawings) */
const candidates = ['unknot', '3_1', '4_1', '5_1', '5_2', '6_1', '6_2', '6_3', '7_1', 'granny', 'square'];
let table: { id: string; J: Laurent; A: string }[] | null = null;
const key = (p: Laurent) => [...p].sort((a, b) => a[0] - b[0]).map(([e, c]) => `${e}:${c}`).join(' ');
const mirrorOf = (p: Laurent): Laurent => new Map([...p].map(([e, c]) => [-e, c]));
const shapeOf = (k: string): V3[][] => (k === 'unknot' ? unknot() : (knotById.get(k)!.flat?.() ?? knotById.get(k)!.build()));
const viewOf = (comps: V3[][]) => diagramOf(bestView(comps.map((c) => resample(c, 160)), { tries: 300 }));

function identify() {
	if (!R) return;
	table ??= candidates.map((k) => {
		const D = diagramOf(shapeOf(k));
		return { id: k, J: jones(D), A: key(normaliseAlexander(alexander(D))) };
	});
	const D = viewOf(R.shape());
	const c = D.pd.length;
	// the Jones polynomial needs 2^c states: fine for the few crossings of a settled knot
	if (c <= 12) {
		const J = jones(D);
		for (const t of table) {
			if (key(t.J) === key(J)) return post({ type: 'named', id: t.id, mirror: false, crossings: c });
			if (key(t.J) === key(mirrorOf(J))) return post({ type: 'named', id: t.id, mirror: true, crossings: c });
		}
	}
	const A = key(normaliseAlexander(alexander(D)));
	const t = table.find((x) => x.A === A);
	post({ type: 'named', id: t?.id ?? 'unknown', mirror: false, crossings: c });
}

function loop() {
	timer = null;
	if (!R || !running) return;
	const t0 = performance.now();
	R.step();
	send();
	if (R.settled) {
		running = false;
		if (!named) {
			named = true;
			identify();
		}
		return;
	}
	// about one step for each frame: slow enough to watch, never faster than the page can draw
	timer = setTimeout(loop, Math.max(0, 16 - (performance.now() - t0)));
}

self.onmessage = (e: MessageEvent<ToWorker>) => {
	const m = e.data;
	if (m.type === 'tangle') {
		running = false;
		if (timer) clearTimeout(timer);
		id = m.id;
		const base = shapeOf(id);
		const A = key(normaliseAlexander(alexander(viewOf(base))));
		// the swirls never change the knot, but the tangle is drawn with finitely many points: check, and
		// stir more gently if a strand slipped through
		let T = tangle(base, m.seed);
		for (let k = 1; k < 4 && key(normaliseAlexander(alexander(viewOf(T)))) !== A; k++) T = tangle(base, m.seed + k, { strength: 2.6 - 0.5 * k });
		R = new Relaxer(T, { points: 110 + 10 * (knotById.get(id)?.crossings ?? 0), maxMove: 0.12 });
		flat = false;
		named = false;
		send();
	} else if (m.type === 'run') {
		if (!R || running || R.settled) return;
		running = true;
		loop();
	} else if (m.type === 'pause') {
		running = false;
	} else if (m.type === 'flatten') {
		if (!R || flat) return;
		flat = true;
		R.flatten(0.07, bestTurn(R.shape().map((c) => resample(c, 160)), { tries: 300 }));
		named = true;
		running = true;
		if (!timer) loop();
	}
};
