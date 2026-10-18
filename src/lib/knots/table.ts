// The knots and links the book draws, each with a way to build it in space.
// Braid words follow KnotInfo (σᵢ written i, σᵢ⁻¹ written −i). The known
// values are the ones the tests check our computations against.
import type { V3 } from './diagram';
import { borromean, braidClosure, plat, sampleClosed, unknot } from './curves';
import { mirror } from './diagram';
import shapes from './shapes.json';

/** a shape settled once by scripts/knot-shapes.ts: lying flat, as a table of knots draws it, at low tangent-point energy */
const settled = (id: string) => (shapes as unknown as Record<string, V3[][]>)[id];

export interface TableKnot {
	id: string;
	/** Rolfsen-style name, as TeX */
	name: string;
	/** what people call it */
	common?: string;
	/** crossing number */
	crossings: number;
	components: number;
	build: () => V3[][];
	/** a braid whose closure it is: [strands, word] */
	braid?: [number, number[]];
	/** a clean flat drawing for diagrams (seen from above), when there is one */
	flat?: () => V3[][];
}

const TAU = Math.PI * 2;
/** the classic three-lobed trefoil, right-handed */
export const roundTrefoil = (s = 0.55): V3[][] =>
	mirror([
		sampleClosed((u) => {
			const t = TAU * u;
			return [s * (Math.sin(t) + 2 * Math.sin(2 * t)), s * (Math.cos(t) - 2 * Math.cos(2 * t)), -s * Math.sin(3 * t)];
		}, 480)
	]);

export const knots: TableKnot[] = [
	{ id: 'unknot', name: '0_1', common: 'the unknot', crossings: 0, components: 1, build: () => unknot() },
	{ id: '3_1', name: '3_1', common: 'the trefoil', crossings: 3, components: 1, build: () => settled('3_1'), braid: [2, [1, 1, 1]], flat: () => roundTrefoil() },
	{ id: '4_1', name: '4_1', common: 'the figure-eight knot', crossings: 4, components: 1, build: () => settled('4_1'), braid: [3, [1, -2, 1, -2]], flat: () => plat([2, 2, -1, 2]) },
	{ id: '5_1', name: '5_1', common: 'the cinquefoil', crossings: 5, components: 1, build: () => settled('5_1'), braid: [2, [1, 1, 1, 1, 1]] },
	{ id: '5_2', name: '5_2', common: 'the three-twist knot', crossings: 5, components: 1, build: () => settled('5_2'), braid: [3, [1, 1, 1, 2, -1, 2]], flat: () => mirror(plat([2, 2, 2, -1, 2])) },
	{ id: '6_1', name: '6_1', common: 'the stevedore knot', crossings: 6, components: 1, build: () => settled('6_1'), braid: [4, [1, 1, 2, -1, -3, 2, -3]], flat: () => mirror(plat([2, 2, 2, 2, -1, 2])) },
	{ id: '6_2', name: '6_2', crossings: 6, components: 1, build: () => settled('6_2'), braid: [3, [1, 1, 1, -2, 1, -2]], flat: () => plat([2, 2, 2, -1, 2, 2]) },
	{ id: '6_3', name: '6_3', crossings: 6, components: 1, build: () => settled('6_3'), braid: [3, [1, 1, -2, 1, -2, -2]], flat: () => plat([2, 2, -1, 2, -1, 2]) },
	{ id: '7_1', name: '7_1', common: 'the septafoil', crossings: 7, components: 1, build: () => settled('7_1'), braid: [2, [1, 1, 1, 1, 1, 1, 1]] },
	{ id: 'granny', name: '3_1\\#3_1', common: 'the granny knot', crossings: 6, components: 1, build: () => settled('granny'), braid: [3, [1, 1, 1, 2, 2, 2]] },
	{ id: 'square', name: '3_1\\#\\overline{3_1}', common: 'the square knot', crossings: 6, components: 1, build: () => settled('square'), braid: [3, [1, 1, 1, -2, -2, -2]] },
	{ id: 'hopf', name: 'L2a1', common: 'the Hopf link', crossings: 2, components: 2, build: () => settled('hopf'), braid: [2, [1, 1]] },
	{ id: 'solomon', name: 'L4a1', common: 'Solomon’s knot', crossings: 4, components: 2, build: () => settled('solomon'), braid: [2, [1, 1, 1, 1]] },
	{ id: 'whitehead', name: 'L5a1', common: 'the Whitehead link', crossings: 5, components: 2, build: () => settled('whitehead'), braid: [3, [1, 1, -2, 1, -2]] },
	{ id: 'borromean', name: 'L6a4', common: 'the Borromean rings', crossings: 6, components: 3, build: () => borromean(), braid: [3, [1, -2, 1, -2, 1, -2]] }
];

export const knotById = new Map(knots.map((k) => [k.id, k]));

/** a loop that looks tangled but is an unknot: the closure of σ₁σ₂⁻¹σ₁⁻¹σ₂, settled */
export const tangledUnknot = () => settled('unknot-tangled');
/** the same loop drawn flat, as the closed braid it comes from: four crossings, and still the unknot */
export const tangledUnknotFlat = () => braidClosure(3, [1, -2, -1, 2]);
