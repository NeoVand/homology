import { it } from 'vitest';
import { flipbook } from './flipbook';
import { cechFiltration, reduce, barsOf, ringWithStraggler, presetCloud, RipsPH, sublevelBars } from './ph';

it('prints', () => {
	const fb = flipbook();
	for (const s of fb.steps) console.log(s.kind, s.title, s.r.toFixed(3));
	const pts = ringWithStraggler();
	console.log('n pts', pts.length);
	const bars = barsOf(reduce(cechFiltration(pts, 2)), 1);
	for (const b of bars) if (b.death - b.birth > 1e-9) console.log('ball bar', b.dim, b.birth.toFixed(3), b.death.toFixed(3));
});
