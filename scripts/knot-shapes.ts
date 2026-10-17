// Settle the knots that are built from braids into rounder shapes, once, and
// save them (src/lib/knots/shapes.json); knots.test.ts checks each saved shape
// is still the knot it claims to be. Run: npx vite-node scripts/knot-shapes.ts
import { writeFileSync } from 'node:fs';
import { knots } from '../src/lib/knots/table';
import { braidClosure } from '../src/lib/knots/curves';
import { relax } from '../src/lib/knots/relax';
import type { V3 } from '../src/lib/knots/diagram';

// first let the knot spread out into a round shape, then give the rope a thickness: strands that ended
// up too close for the tubes the figures draw are eased apart, so no tube ever runs into another
const settle = (comps: V3[][]) => relax(relax(comps, { per: 150, steps: 900, size: 1.8 }), { per: 150, steps: 600, size: 1.8, thickness: 0.2 });

const out: Record<string, number[][][]> = {};
for (const k of knots) {
	if (!k.relaxed || !k.braid) continue;
	const t = Date.now();
	const comps = settle(braidClosure(...k.braid));
	out[k.id] = comps.map((c) => c.map((p) => p.map((x) => Math.round(x * 1000) / 1000)));
	console.log(k.id, comps.map((c) => c.length).join('+'), `${Date.now() - t} ms`);
}
// a loop that looks tangled but is an unknot (it comes undone without passing through itself)
{
	const comps = settle(braidClosure(3, [1, -2, -1, 2]));
	out['unknot-tangled'] = comps.map((c) => c.map((p) => p.map((x) => Math.round(x * 1000) / 1000)));
	console.log('unknot-tangled', comps[0].length);
}
writeFileSync(new URL('../src/lib/knots/shapes.json', import.meta.url), JSON.stringify(out));
