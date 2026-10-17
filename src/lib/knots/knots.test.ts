import { describe, expect, it } from 'vitest';
import { L } from './laurent';
import { diagramOf, mirror } from './diagram';
import { torusKnot, figureEight, unknot, borromean, braidClosure, sampleClosed, plat } from './curves';
import { jones, alexander, determinant, colourings, linkingNumber, seifertGenus, loopsOf } from './invariants';
import { khovanov, eulerCharacteristic } from './khovanov';
import { knots, knotById, tangledUnknot, roundTrefoil } from './table';
import { untie } from './untie';
import { draw } from './draw';
import { bestView } from './view';
import { colouringEquations, isColouring, nullspaceMod } from './colour';
import { smoothDrawing, joins, loopsOfState } from './smooth';
import { meridianAt, pushOff } from './framing';
import invariantsTable from './invariants.json';
import { relax, resample } from './relax';

const poly = L.from;

describe('the knot engine, on knots everyone knows', () => {
	const tref = diagramOf(torusKnot(2, 3));

	it('sees three right-handed crossings on the (2,3) torus knot', () => {
		expect(tref.pd.length).toBe(3);
		expect(tref.signs).toEqual([1, 1, 1]);
	});

	it('the unknot', () => {
		const D = diagramOf(unknot());
		expect(D.pd.length).toBe(0);
		expect(L.eq(jones(D), L.one())).toBe(true);
		expect(L.eq(alexander(D), L.one())).toBe(true);
	});

	it('the right-handed trefoil: V = t + t³ − t⁴, Δ = t − 1 + t⁻¹', () => {
		expect(L.tex(jones(tref))).toBe(L.tex(poly({ 1: 1, 3: 1, 4: -1 })));
		expect(L.eq(alexander(tref), poly({ 1: 1, 0: -1, [-1]: 1 }))).toBe(true);
		expect(determinant(tref)).toBe(3);
		expect(colourings(tref, 3)).toBe(9);
		expect(seifertGenus(tref)).toBe(1);
	});

	it('its mirror image has the mirror polynomial', () => {
		const left = diagramOf(mirror(torusKnot(2, 3)));
		expect(L.eq(jones(left), poly({ [-1]: 1, [-3]: 1, [-4]: -1 }))).toBe(true);
	});

	it('the figure-eight knot', () => {
		const D = diagramOf(figureEight());
		expect(D.pd.length).toBe(4);
		expect(L.eq(jones(D), poly({ 2: 1, 1: -1, 0: 1, [-1]: -1, [-2]: 1 }))).toBe(true);
		expect(L.eq(alexander(D), poly({ 1: -1, 0: 3, [-1]: -1 }))).toBe(true);
		expect(colourings(D, 3)).toBe(3);
		expect(colourings(D, 5)).toBe(25);
	});

	it('the cinquefoil, the (2,5) torus knot', () => {
		const D = diagramOf(torusKnot(2, 5));
		expect(L.eq(alexander(D), poly({ 2: 1, 1: -1, 0: 1, [-1]: -1, [-2]: 1 }))).toBe(true);
		expect(determinant(D)).toBe(5);
		expect(seifertGenus(D)).toBe(2);
	});

	it('closed braids: σ₁³ is the trefoil, (σ₁σ₂⁻¹)² the figure-eight', () => {
		expect(L.eq(jones(diagramOf(braidClosure(2, [1, 1, 1]))), jones(tref))).toBe(true);
		const f8 = diagramOf(braidClosure(3, [1, -2, 1, -2]));
		expect(L.eq(jones(f8), jones(diagramOf(figureEight())))).toBe(true);
	});

	it('links: the Hopf link links once, the Borromean rings not at all in pairs', () => {
		const hopf = diagramOf(torusKnot(2, 2));
		expect(hopf.components).toBe(2);
		expect(Math.abs(linkingNumber(hopf, 0, 1))).toBe(1);
		const B = diagramOf(borromean());
		expect(B.components).toBe(3);
		expect(linkingNumber(B, 0, 1)).toBe(0);
		expect(linkingNumber(B, 1, 2)).toBe(0);
		expect(linkingNumber(B, 0, 2)).toBe(0);
		// …yet they are linked: their Jones polynomial is not that of three loose circles
		const three = L.pow(L.from({ 0.5: -1, [-0.5]: -1 }), 2);
		expect(L.eq(jones(B), three)).toBe(false);
	});
});

describe('Khovanov homology', () => {
	const chi = (D: ReturnType<typeof diagramOf>) => eulerCharacteristic(khovanov(D));
	const jonesQ = (D: ReturnType<typeof diagramOf>) => L.mul(L.from({ 1: 1, [-1]: 1 }), L.substitute(jones(D), 2));

	it('of the right-handed trefoil sits in four places', () => {
		const kh = khovanov(diagramOf(torusKnot(2, 3)));
		expect(Object.fromEntries(kh)).toEqual({ '0,1': 1, '0,3': 1, '2,5': 1, '3,9': 1 });
	});

	it('of the unknot is two copies of the field, in quantum degrees ±1', () => {
		expect(Object.fromEntries(khovanov(diagramOf(unknot())))).toEqual({ '0,1': 1, '0,-1': 1 });
	});

	it('has the Jones polynomial as its graded Euler characteristic', () => {
		for (const c of [torusKnot(2, 3), mirror(torusKnot(2, 3)), figureEight(), torusKnot(2, 5), braidClosure(3, [1, 1, 1, 2, -1, 2])]) {
			const D = diagramOf(c);
			expect(L.tex(chi(D), 'q')).toBe(L.tex(jonesQ(D), 'q'));
		}
	});
});

describe('the table of knots', () => {
	// symmetric Alexander polynomials, Δ(1) = 1 (Rolfsen's table)
	const alex: Record<string, Record<number, number>> = {
		'3_1': { 1: 1, 0: -1, [-1]: 1 },
		'4_1': { 1: -1, 0: 3, [-1]: -1 },
		'5_1': { 2: 1, 1: -1, 0: 1, [-1]: -1, [-2]: 1 },
		'5_2': { 1: 2, 0: -3, [-1]: 2 },
		'6_1': { 1: -2, 0: 5, [-1]: -2 },
		'6_2': { 2: -1, 1: 3, 0: -3, [-1]: 3, [-2]: -1 },
		'6_3': { 2: 1, 1: -3, 0: 5, [-1]: -3, [-2]: 1 },
		'7_1': { 3: 1, 2: -1, 1: 1, 0: -1, [-1]: 1, [-2]: -1, [-3]: 1 }
	};
	const dets: Record<string, number> = { '3_1': 3, '4_1': 5, '5_1': 5, '5_2': 7, '6_1': 9, '6_2': 11, '6_3': 13, '7_1': 7, granny: 9, square: 9 };

	it('every knot built in space has the right Alexander polynomial and determinant', () => {
		for (const k of knots) {
			if (k.components !== 1 || k.id === 'unknot') continue;
			const D = diagramOf(k.build());
			if (alex[k.id]) expect(L.tex(alexander(D)), k.id).toBe(L.tex(poly(alex[k.id])));
			expect(determinant(D), k.id).toBe(dets[k.id]);
		}
	});

	it('the braid and the curve agree, and so does the relaxed shape', () => {
		for (const k of knots) {
			if (!k.braid) continue;
			const fromBraid = jones(diagramOf(braidClosure(...k.braid)));
			expect(L.tex(jones(diagramOf(k.build()))), k.id).toBe(L.tex(fromBraid));
		}
	});

	it('leaves room for a tube round every knot: no strand runs into another, no bend folds the tube', () => {
		// the gallery scales each knot to reach 1.75 from its centre and draws a tube of radius 0.085 with a
		// dark rim of 1.9 radii; two parts of the curve that are not neighbours along it must stay at least
		// three radii apart, or the tubes touch and a crossing reads as an intersection
		for (const k of knots) {
			if (k.id === 'borromean') continue; // drawn from ellipses in the gallery, checked by its own test
			const comps = k.build();
			let R = 0;
			for (const c of comps) for (const p of c) R = Math.max(R, Math.hypot(...p));
			const s = 1.75 / R;
			const pts = comps.flatMap((c, ci) => {
				let along = 0;
				return c.map((p, i) => {
					if (i) along += s * Math.hypot(p[0] - c[i - 1][0], p[1] - c[i - 1][1], p[2] - c[i - 1][2]);
					return { p: p.map((x) => x * s), ci, along, n: c.length };
				});
			});
			const length = new Map<number, number>();
			for (const q of pts) length.set(q.ci, Math.max(length.get(q.ci) ?? 0, q.along));
			let gap = Infinity;
			for (let a = 0; a < pts.length; a++)
				for (let b = a + 1; b < pts.length; b++) {
					const A = pts[a];
					const B = pts[b];
					if (A.ci === B.ci) {
						const d = Math.abs(A.along - B.along);
						if (Math.min(d, length.get(A.ci)! - d) < 0.9) continue;
					}
					gap = Math.min(gap, Math.hypot(A.p[0] - B.p[0], A.p[1] - B.p[1], A.p[2] - B.p[2]));
				}
			expect(gap / 0.085, k.id).toBeGreaterThan(3);
			// and no bend is tighter than the tube, or the tube folds through itself: the circle through
			// three consecutive points has radius |a||b||a + b| / (2|a × b|), for the steps a and b
			let tightest = Infinity;
			for (const c of comps)
				for (let i = 0; i < c.length; i++) {
					const p = c[(i + c.length - 1) % c.length].map((x) => x * s);
					const q = c[i].map((x) => x * s);
					const r = c[(i + 1) % c.length].map((x) => x * s);
					const a = [q[0] - p[0], q[1] - p[1], q[2] - p[2]];
					const b = [r[0] - q[0], r[1] - q[1], r[2] - q[2]];
					const cr = Math.hypot(a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]);
					if (cr < 1e-12) continue;
					const rad = (Math.hypot(...a) * Math.hypot(...b) * Math.hypot(a[0] + b[0], a[1] + b[1], a[2] + b[2])) / (2 * cr);
					tightest = Math.min(tightest, rad);
				}
			expect(tightest / 0.085, `${k.id}: tightest bend`).toBeGreaterThan(1.5);
		}
	});

	it('a closed braid has one crossing per letter, however finely it is sampled', () => {
		// the strands cross halfway through a letter; were a sample there (an even number per
		// letter, sampled from the start), rounding could make diagramOf count the crossing twice
		for (const k of knots) {
			if (!k.braid) continue;
			const V = L.tex(jones(diagramOf(braidClosure(...k.braid))));
			for (const per of [11, 25, 28]) {
				const D = diagramOf(braidClosure(...k.braid, { R0: 0.9, per }));
				// (the braids of 5₂ and 6₁ have one letter more than the knots have crossings)
				expect(D.pd.length, `${k.id}, ${per} per letter`).toBe(k.braid[1].length);
				expect(L.tex(jones(D)), `${k.id}, ${per} per letter`).toBe(V);
			}
		}
		// and the same for plats
		for (const per of [4, 5, 6, 7, 20]) {
			expect(diagramOf(plat([2, 2, -1, 2], { gap: 0.7, per })).pd.length, `4_1, ${per} per letter`).toBe(4);
			expect(diagramOf(plat([2, 2, 2, 2, -1, 2], { gap: 0.7, per })).pd.length, `6_1, ${per} per letter`).toBe(6);
		}
	});

	it('settling a knot into a rounder shape never lets a strand pass through another', { timeout: 60000 }, () => {
		const before = jones(diagramOf(braidClosure(3, [1, 1, 1, 2, -1, 2])));
		const after = jones(diagramOf(relax(braidClosure(3, [1, 1, 1, 2, -1, 2]), { steps: 300 })));
		expect(L.tex(after)).toBe(L.tex(before));
	});

	it('the granny and square knots share an Alexander polynomial, but not a Jones polynomial', () => {
		const g = diagramOf(knotById.get('granny')!.build());
		const s = diagramOf(knotById.get('square')!.build());
		expect(L.eq(alexander(g), alexander(s))).toBe(true);
		expect(L.eq(jones(g), jones(s))).toBe(false);
	});
});

describe('untying by force', () => {
	const C = sampleClosed((t) => [1.7 * Math.cos(2 * Math.PI * t), 1.7 * Math.sin(2 * Math.PI * t), 0], 200);
	it('the trefoil and the figure-eight must pass through themselves once; the tangled unknot never', () => {
		expect(untie(resample(torusKnot(2, 3)[0], 200), C, 80).events.length).toBe(1);
		expect(untie(resample(figureEight()[0], 200), C, 80).events.length).toBe(1);
		const u = untie(resample(tangledUnknot()[0], 200), C, 80);
		expect(u.events.length).toBe(0);
		expect(L.eq(jones(diagramOf(tangledUnknot())), L.one())).toBe(true);
	});
});

describe('drawing a diagram', () => {
	it('cuts the trefoil into three arcs, each crossing joining an over-arc and two under-arcs', () => {
		const d = draw(torusKnot(2, 3));
		expect(d.arcs.length).toBe(3);
		expect(d.crossings.length).toBe(3);
		for (const c of d.crossings) {
			expect(c.over).toBeGreaterThanOrEqual(0);
			expect(new Set([c.over, c.in, c.out]).size).toBe(3);
		}
	});
	it('draws an unknotted circle whole', () => {
		expect(draw(unknot()).loops.length).toBe(1);
	});
});

describe('views and colourings', () => {
	it('finds a shadow with the fewest crossings for every knot and link in the table', () => {
		for (const k of knots) expect(diagramOf(bestView(k.build().map((c) => resample(c, 160)))).pd.length, k.id).toBe(k.crossings);
	}, 30000);
	it('stores every settled shape lying flat, its shadow from above a drawing with the fewest crossings', () => {
		for (const k of knots) if (k.id !== 'borromean') expect(diagramOf(k.build().map((c) => resample(c, 160))).pd.length, k.id).toBe(k.crossings);
	});
	it('counts colourings from the drawing the same way as from the PD code', () => {
		for (const id of ['3_1', '4_1', '5_1', '5_2', '6_1']) {
			const comps = bestView(knotById.get(id)!.build().map((c) => resample(c, 160)));
			const d = draw(comps);
			for (const p of [3, 5, 7]) {
				const basis = nullspaceMod(colouringEquations(d, p), p);
				expect(p ** basis.length, `${id} mod ${p}`).toBe(colourings(d.diagram, p));
				for (const b of basis) expect(isColouring(d, p, b)).toBe(true);
			}
		}
	});
});

describe('flat drawings', () => {
	it('are the same knots as the shapes in space, with the same handedness and the fewest crossings', () => {
		for (const k of knots) {
			if (!k.flat) continue;
			const D = diagramOf(k.flat());
			expect(D.pd.length, k.id).toBe(k.crossings);
			expect(L.tex(jones(D)), k.id).toBe(L.tex(jones(diagramOf(k.build()))));
		}
	});
});

describe('smoothings, drawn', () => {
	it('count the same loops as the bracket, and every crossing has its four ends', () => {
		for (const comps of [roundTrefoil(), figureEight(), torusKnot(2, 2), plat([2, 2, 2, -1, 2])]) {
			const sd = smoothDrawing(comps);
			const n = sd.diagram.pd.length;
			for (let st = 0; st < 1 << n; st++) {
				const bits = Array.from({ length: n }, (_, c) => (st >> c) & 1);
				expect(loopsOfState(sd, st).count).toBe(loopsOf(sd.diagram.pd, bits) + sd.diagram.freeLoops);
				for (let c = 0; c < n; c++) for (const [a, b] of joins(sd, c, bits[c])) expect(a && b).toBeTruthy();
			}
		}
	});
});

describe('meridian and longitude', () => {
	it('the meridian links the knot once; the right number of twists gives a longitude that does not link it', async () => {
		const { linkingNumber: lk } = await import('$lib/figures/cohomology/poincare-duality/knots');
		for (const comps of [roundTrefoil(), figureEight()]) {
			const K = resample(comps[0], 300);
			expect(Math.round(Math.abs(lk(K, meridianAt(K, 40, 0.15))))).toBe(1);
			const base = Math.round(lk(K, pushOff(K, 0.15, 0)));
			expect(Math.abs(Math.round(lk(K, pushOff(K, 0.15, -base))))).toBe(0);
		}
	});
});

describe('the arms race table', () => {
	it('matches fresh computations for the small knots, and separates the famous pairs', () => {
		const rows = Object.fromEntries((invariantsTable as unknown as { id: string; col3: number; det: number; alexander: string; jones: string; kh: Record<string, number> }[]).map((r) => [r.id, r]));
		expect(rows['unknot'].col3).toBe(3);
		expect(rows['3_1'].jones).toBe(L.tex(jones(diagramOf(roundTrefoil()))));
		expect(rows['3_1'].alexander).toBe(rows['3_1*'].alexander);
		expect(rows['3_1'].jones).not.toBe(rows['3_1*'].jones);
		expect(rows['6_1'].alexander).toBe(rows['9_46'].alexander);
		expect(rows['6_1'].col3).not.toBe(rows['9_46'].col3);
		expect(rows['5_1*'].jones).toBe(rows['10_132'].jones);
		expect(JSON.stringify(rows['5_1*'].kh)).not.toBe(JSON.stringify(rows['10_132'].kh));
		expect(rows['granny'].alexander).toBe(rows['square'].alexander);
		expect(rows['granny'].jones).not.toBe(rows['square'].jones);
	});
});
