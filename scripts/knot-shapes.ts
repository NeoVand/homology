// Settle the knots and links of the table into their low-energy shapes, once, and save them
// (src/lib/knots/shapes.json); knots.test.ts checks that each saved shape is still the knot it claims
// to be, and that tubes drawn round it never touch. Run: npx vite-node scripts/knot-shapes.ts
//
// Each starts as the closure of its braid and flows down the tangent-point energy with the fractional
// Sobolev gradient of Yu, Schumacher and Crane (src/lib/knots/repulse.ts) until it settles; then it is
// turned so that the view down the z-axis is its most legible shadow, the one a table of knots would show.
import { writeFileSync } from 'node:fs';
import { knots } from '../src/lib/knots/table';
import { braidClosure } from '../src/lib/knots/curves';
import { relax } from '../src/lib/knots/relax';
import { repulse } from '../src/lib/knots/repulse';
import { bestView } from '../src/lib/knots/view';
import type { V3 } from '../src/lib/knots/diagram';

const round = (comps: V3[][]) => comps.map((c) => c.map((p) => p.map((x) => Math.round(x * 1e4) / 1e4)));
const out: Record<string, number[][][]> = {};
const only = process.argv[2]?.split(',');
for (const k of knots) {
	if (!k.braid || k.id === 'borromean' || (only && !only.includes(k.id))) continue;
	const t = Date.now();
	let steps = 0;
	const comps = repulse(braidClosure(...k.braid), { points: 40 + 24 * k.crossings, steps: 600, log: (s) => (steps = s + 1) });
	out[k.id] = round(bestView(comps, { tries: 2000 }));
	console.log(k.id, comps.map((c) => c.length).join('+'), `${steps} steps`, `${((Date.now() - t) / 1000).toFixed(0)} s`);
}
// a loop that looks tangled but is an unknot (it comes undone without passing through itself): it must
// stay tangled, so it only relaxes a little, as before
{
	const comps = relax(relax(braidClosure(3, [1, -2, -1, 2]), { per: 150, steps: 900, size: 1.8 }), { per: 150, steps: 600, size: 1.8, thickness: 0.2 });
	out['unknot-tangled'] = round(comps);
}
writeFileSync(new URL('../src/lib/knots/shapes.json', import.meta.url), JSON.stringify(out));
