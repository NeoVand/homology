import { describe, expect, it } from 'vitest';
import { L } from './laurent';
import { diagramOf, mirror } from './diagram';
import { torusKnot, figureEight, unknot, borromean, braidClosure, sampleClosed } from './curves';
import { jones, alexander, determinant, colourings, linkingNumber, seifertGenus } from './invariants';
import { khovanov, eulerCharacteristic } from './khovanov';
import { knots, knotById, tangledUnknot } from './table';
import { untie } from './untie';
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
