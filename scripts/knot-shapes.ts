// Settle the knots and links of the table into their low-energy shapes, once, and save them
// (src/lib/knots/shapes.json); knots.test.ts checks that each saved shape is still the knot it claims
// to be, and that tubes drawn round it never touch. Run: npx vite-node scripts/knot-shapes.ts
//
// Each starts as the closure of its braid (a (2, q) torus knot or link, as the curve on a torus, which is
// already round and starts it nearer its best shape) and flows down the tangent-point energy with the fractional
// Sobolev gradient of Yu, Schumacher and Crane (src/lib/knots/repulse.ts) until it settles; then it is
// turned so that the view down the z-axis is its most legible shadow, the one a table of knots would show.
import { readFileSync, writeFileSync } from 'node:fs';
import { knots } from '../src/lib/knots/table';
import { braidClosure, torusKnot } from '../src/lib/knots/curves';
import { relax } from '../src/lib/knots/relax';
import { repulse } from '../src/lib/knots/repulse';
import { bestView } from '../src/lib/knots/view';
import type { V3 } from '../src/lib/knots/diagram';

const round = (comps: V3[][]) => comps.map((c) => c.map((p) => p.map((x) => Math.round(x * 1e4) / 1e4)));
// with a list of ids (npx vite-node scripts/knot-shapes.ts 5_1,7_1) only those are settled again; the
// environment can set the energy (ALPHA, BETA), the most steps (STEPS), another output file (OUT), and
// FLAT=1 settles each knot flat, in a slab, as a table of knots draws it
const only = process.argv[2]?.split(',');
const env = (k: string, d: number) => (process.env[k] ? Number(process.env[k]) : d);
const file = process.env.OUT ? new URL(`file://${process.env.OUT}`) : new URL('../src/lib/knots/shapes.json', import.meta.url);
const flat = !!process.env.FLAT;
const out: Record<string, number[][][]> = only ? JSON.parse(readFileSync(file, 'utf8')) : {};
for (const k of knots) {
	if (!k.braid || k.id === 'borromean' || (only && !only.includes(k.id))) continue;
	const t = Date.now();
	let steps = 0;
	const [n, word] = k.braid;
	const torus = n === 2 && word.every((g) => g === 1);
	// flat (FLAT=1), each starts from a drawing with the fewest crossings: a torus knot as its star, kept
	// symmetric; the others from their flat drawing, or the closed braid when that has no extra crossings
	const start = torus ? torusKnot(2, word.length) : flat && k.flat ? k.flat() : braidClosure(n, word);
	const turns = flat && torus && k.components === 1 ? word.length : 1;
	const points = Math.round((40 + 24 * k.crossings) / turns) * turns;
	// a torus knot keeps the symmetry of its torus curve: the best shape with q-fold symmetry is the star a
	// table of knots draws (for 7₁ the unrestricted flow folds the knot over on itself instead)
	// run until no step lowers the energy any further (tolerance 0, or TOL), or STEPS steps
	const comps = repulse(start, {
		points,
		slab: flat ? 0.1 : undefined,
		turns,
		steps: env('STEPS', 6000),
		alpha: env('ALPHA', 3),
		beta: env('BETA', 6),
		tolerance: env('TOL', 0),
		nudge: torus ? 0 : 0.02,
		log: (s, E) => {
			steps = s + 1;
			if (s % 1000 === 0) console.log('  ', k.id, s, E.toFixed(5));
		}
	});
	// flat, the view is from above; in space, the most legible shadow
	out[k.id] = round(bestView(comps, { tries: flat ? 1 : 2000 }));
	console.log(k.id, comps.map((c) => c.length).join('+'), `${steps} steps`, `${((Date.now() - t) / 1000).toFixed(0)} s`);
	writeFileSync(file, JSON.stringify(out));
}
// a loop that looks tangled but is an unknot (it comes undone without passing through itself): it must
// stay tangled, so it only relaxes a little, as before
if (!only) {
	const comps = relax(relax(braidClosure(3, [1, -2, -1, 2]), { per: 150, steps: 900, size: 1.8 }), { per: 150, steps: 600, size: 1.8, thickness: 0.2 });
	out['unknot-tangled'] = round(comps);
}
writeFileSync(file, JSON.stringify(out));
