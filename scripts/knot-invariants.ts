// The invariants behind the "arms race" figure of §3.7, computed once
// (Khovanov homology of a 10-crossing knot takes seconds) and saved to
// src/lib/knots/invariants.json; knots.test.ts re-checks the small ones.
// Run: npx vite-node scripts/knot-invariants.ts
import { writeFileSync } from 'node:fs';
import { diagramOf, diagramFromPD, mirror, type Diagram, type PD } from '../src/lib/knots/diagram';
import { knotById, roundTrefoil } from '../src/lib/knots/table';
import { torusKnot, unknot } from '../src/lib/knots/curves';
import { alexander, colourings, determinant, jones } from '../src/lib/knots/invariants';
import { khovanov } from '../src/lib/knots/khovanov';
import { L } from '../src/lib/knots/laurent';

// PD codes from KnotInfo (knotinfo.org)
const pd: Record<string, PD[]> = {
	'9_46': [[2, 10, 3, 9], [3, 14, 4, 15], [6, 17, 7, 18], [8, 11, 9, 12], [10, 2, 11, 1], [13, 4, 14, 5], [15, 13, 16, 12], [16, 7, 17, 8], [18, 5, 1, 6]],
	'10_132': [[1, 8, 2, 9], [3, 18, 4, 19], [5, 12, 6, 13], [7, 10, 8, 11], [9, 2, 10, 3], [11, 6, 12, 7], [14, 20, 15, 19], [16, 14, 17, 13], [17, 4, 18, 5], [20, 16, 1, 15]]
};
const rows: [string, string, number, () => Diagram][] = [
	['unknot', '0_1', 0, () => diagramOf(unknot())],
	['3_1', '3_1', 3, () => diagramOf(roundTrefoil())],
	['3_1*', '\\overline{3_1}', 3, () => diagramOf(mirror(roundTrefoil()))],
	['4_1', '4_1', 4, () => diagramOf(knotById.get('4_1')!.flat!())],
	['5_1*', '\\overline{5_1}', 5, () => diagramOf(mirror(torusKnot(2, 5)))],
	['10_132', '10_{132}', 10, () => diagramFromPD(pd['10_132'])],
	['5_2', '5_2', 5, () => diagramOf(knotById.get('5_2')!.flat!())],
	['6_1', '6_1', 6, () => diagramOf(knotById.get('6_1')!.flat!())],
	['9_46', '9_{46}', 9, () => diagramFromPD(pd['9_46'])],
	['granny', '3_1\\#3_1', 6, () => diagramOf(knotById.get('granny')!.build())],
	['square', '3_1\\#\\overline{3_1}', 6, () => diagramOf(knotById.get('square')!.build())]
];
const out = rows.map(([id, name, crossings, make]) => {
	const D = make();
	const t = Date.now();
	const kh = khovanov(D);
	console.log(id, `${Date.now() - t} ms`);
	return {
		id,
		name,
		crossings,
		col3: colourings(D, 3),
		det: determinant(D),
		alexander: L.tex(alexander(D)),
		jones: L.tex(jones(D)),
		kh: Object.fromEntries(kh)
	};
});
writeFileSync(new URL('../src/lib/knots/invariants.json', import.meta.url), JSON.stringify(out, null, 1));
