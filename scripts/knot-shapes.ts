// Settle the knots that are built from braids into rounder shapes, once, and
// save them (src/lib/knots/shapes.json); knots.test.ts checks each saved shape
// is still the knot it claims to be. Run: npx vite-node scripts/knot-shapes.ts
import { writeFileSync } from 'node:fs';
import { knots } from '../src/lib/knots/table';
import { braidClosure } from '../src/lib/knots/curves';
import { relax } from '../src/lib/knots/relax';

const out: Record<string, number[][][]> = {};
for (const k of knots) {
	if (!k.relaxed || !k.braid) continue;
	const t = Date.now();
	const comps = relax(braidClosure(...k.braid), { per: 150, steps: 900, size: 1.8 });
	out[k.id] = comps.map((c) => c.map((p) => p.map((x) => Math.round(x * 1000) / 1000)));
	console.log(k.id, comps.map((c) => c.length).join('+'), `${Date.now() - t} ms`);
}
// a loop that looks tangled but is an unknot (it comes undone without passing through itself)
{
	const comps = relax(braidClosure(3, [1, -2, -1, 2]), { per: 150, steps: 900, size: 1.8 });
	out['unknot-tangled'] = comps.map((c) => c.map((p) => p.map((x) => Math.round(x * 1000) / 1000)));
	console.log('unknot-tangled', comps[0].length);
}
writeFileSync(new URL('../src/lib/knots/shapes.json', import.meta.url), JSON.stringify(out));
