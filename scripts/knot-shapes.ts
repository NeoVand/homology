// Settle the knots and links of the table into their low-energy shapes, once, and save them:
//
//   FLAT=1 npx vite-node scripts/knot-shapes.ts   lying flat, as a table of knots draws them (src/lib/knots/shapes.json)
//   npx vite-node scripts/knot-shapes.ts          free in space (src/lib/knots/shapes-space.json)
//
// knots.test.ts checks that each saved shape is still the knot it claims to be, and that tubes drawn
// round it never touch.
//
// Both flow down the tangent-point energy with the fractional Sobolev gradient of Yu, Schumacher and
// Crane (src/lib/knots/repulse.ts) until they settle. In space each starts as the closure of its braid
// (a (2, q) torus knot or link as the curve on a torus, which is already round) and is then turned so
// that the view down the z-axis is its most legible shadow. Flat, each flows inside a thin slab, so it
// keeps a drawing with the fewest crossings and only spreads it out evenly; since the slab lets the
// flow redraw the knot very little, each starts from every such drawing we have (its flat drawing, its
// closed braid, the shadow of its shape in space) and keeps the one that ends lowest. A torus knot
// starts as its star and keeps its symmetry.
import { readFileSync, writeFileSync } from 'node:fs';
import { knots } from '../src/lib/knots/table';
import { braidClosure, torusKnot } from '../src/lib/knots/curves';
import { relax } from '../src/lib/knots/relax';
import { repulse } from '../src/lib/knots/repulse';
import { bestView } from '../src/lib/knots/view';
import { diagramOf, type V3 } from '../src/lib/knots/diagram';

const round = (comps: V3[][]) => comps.map((c) => c.map((p) => p.map((x) => Math.round(x * 1e4) / 1e4)));
// with a list of ids (npx vite-node scripts/knot-shapes.ts 5_1,7_1) only those are settled again; the
// environment can set the energy (ALPHA, BETA), the most steps (STEPS), the stopping tolerance (TOL)
// and another output file (OUT)
const only = process.argv[2]?.split(',');
const env = (k: string, d: number) => (process.env[k] ? Number(process.env[k]) : d);
const flat = !!process.env.FLAT;
const here = (f: string) => new URL(`../src/lib/knots/${f}`, import.meta.url);
const file = process.env.OUT ? new URL(`file://${process.env.OUT}`) : here(flat ? 'shapes.json' : 'shapes-space.json');
const read = (f: URL) => JSON.parse(readFileSync(f, 'utf8')) as Record<string, V3[][]>;
const space = flat ? read(here('shapes-space.json')) : {};
const out = only ? read(file) : {};
for (const k of knots) {
	if (!k.braid || k.id === 'borromean' || (only && !only.includes(k.id))) continue;
	const t = Date.now();
	const [n, word] = k.braid;
	const torus = n === 2 && word.every((g) => g === 1);
	const turns = flat && torus && k.components === 1 ? word.length : 1;
	const points = Math.round((40 + 24 * k.crossings) / turns) * turns;
	const starts = torus
		? [torusKnot(2, word.length)]
		: flat
			? [k.flat?.(), braidClosure(n, word), space[k.id]].filter((s): s is V3[][] => !!s && diagramOf(s).pd.length === k.crossings)
			: [braidClosure(n, word)];
	let best: V3[][] = [];
	let lowest = Infinity;
	const tried: string[] = [];
	for (const start of starts) {
		let E = Infinity;
		let steps = 0;
		const comps = repulse(start, {
			points,
			slab: flat ? 0.07 : undefined,
			turns,
			steps: env('STEPS', flat ? 4000 : 6000),
			alpha: env('ALPHA', 3),
			beta: env('BETA', 6),
			// in space, run until no step lowers the energy any further
			tolerance: env('TOL', flat ? 1e-10 : 0),
			// a torus knot keeps the symmetry of its torus curve: the best shape with q-fold symmetry is the
			// star a table of knots draws (in space the unrestricted flow folds 7₁ over on itself instead)
			nudge: torus ? 0 : 0.02,
			log: (s, e) => {
				steps = s + 1;
				E = e;
			}
		});
		tried.push(`${E.toFixed(4)} (${steps} steps)`);
		if (E < lowest) {
			lowest = E;
			best = comps;
		}
	}
	// flat, the view is from above; in space, the most legible shadow
	out[k.id] = round(bestView(best, { tries: flat ? 1 : 2000 }));
	console.log(k.id, best.map((c) => c.length).join('+'), tried.join(', '), `${((Date.now() - t) / 1000).toFixed(0)} s`);
	writeFileSync(file, JSON.stringify(out));
}
// a loop that looks tangled but is an unknot (it comes undone without passing through itself): it must
// stay tangled, so it only relaxes a little
if (!only) {
	const comps = relax(relax(braidClosure(3, [1, -2, -1, 2]), { per: 150, steps: 900, size: 1.8 }), { per: 150, steps: 600, size: 1.8, thickness: 0.2 });
	out['unknot-tangled'] = round(comps);
}
writeFileSync(file, JSON.stringify(out));
