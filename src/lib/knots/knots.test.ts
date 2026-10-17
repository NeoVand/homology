import { describe, expect, it } from 'vitest';
import { L } from './laurent';
import { diagramOf, mirror } from './diagram';
import { torusKnot, figureEight, unknot, borromean, braidClosure } from './curves';
import { jones, alexander, determinant, colourings, linkingNumber, seifertGenus } from './invariants';
import { khovanov, eulerCharacteristic } from './khovanov';

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
