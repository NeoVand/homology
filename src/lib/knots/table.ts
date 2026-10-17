// The knots and links the book draws, each with a way to build it in space.
// Braid words follow KnotInfo (σᵢ written i, σᵢ⁻¹ written −i). The known
// values are the ones the tests check our computations against.
import type { V3 } from './diagram';
import { borromean, braidClosure, figureEight, torusKnot, unknot } from './curves';
import shapes from './shapes.json';

/** a shape settled once from the braid by scripts/knot-shapes.ts */
const settled = (id: string) => (shapes as Record<string, V3[][]>)[id];

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
	/** draw it from the braid but let it settle into a rounder shape */
	relaxed?: boolean;
}

export const knots: TableKnot[] = [
	{ id: 'unknot', name: '0_1', common: 'the unknot', crossings: 0, components: 1, build: () => unknot() },
	{ id: '3_1', name: '3_1', common: 'the trefoil', crossings: 3, components: 1, build: () => torusKnot(2, 3), braid: [2, [1, 1, 1]] },
	{ id: '4_1', name: '4_1', common: 'the figure-eight knot', crossings: 4, components: 1, build: () => figureEight(), braid: [3, [1, -2, 1, -2]] },
	{ id: '5_1', name: '5_1', common: 'the cinquefoil', crossings: 5, components: 1, build: () => torusKnot(2, 5), braid: [2, [1, 1, 1, 1, 1]] },
	{ id: '5_2', name: '5_2', common: 'the three-twist knot', crossings: 5, components: 1, build: () => settled('5_2'), braid: [3, [1, 1, 1, 2, -1, 2]], relaxed: true },
	{ id: '6_1', name: '6_1', common: 'the stevedore knot', crossings: 6, components: 1, build: () => settled('6_1'), braid: [4, [1, 1, 2, -1, -3, 2, -3]], relaxed: true },
	{ id: '6_2', name: '6_2', crossings: 6, components: 1, build: () => settled('6_2'), braid: [3, [1, 1, 1, -2, 1, -2]], relaxed: true },
	{ id: '6_3', name: '6_3', crossings: 6, components: 1, build: () => settled('6_3'), braid: [3, [1, 1, -2, 1, -2, -2]], relaxed: true },
	{ id: '7_1', name: '7_1', common: 'the septafoil', crossings: 7, components: 1, build: () => torusKnot(2, 7), braid: [2, [1, 1, 1, 1, 1, 1, 1]] },
	{ id: 'granny', name: '3_1\\#3_1', common: 'the granny knot', crossings: 6, components: 1, build: () => settled('granny'), braid: [3, [1, 1, 1, 2, 2, 2]], relaxed: true },
	{ id: 'square', name: '3_1\\#\\overline{3_1}', common: 'the square knot', crossings: 6, components: 1, build: () => settled('square'), braid: [3, [1, 1, 1, -2, -2, -2]], relaxed: true },
	{ id: 'hopf', name: 'L2a1', common: 'the Hopf link', crossings: 2, components: 2, build: () => torusKnot(2, 2), braid: [2, [1, 1]] },
	{ id: 'solomon', name: 'L4a1', common: 'Solomon’s knot', crossings: 4, components: 2, build: () => torusKnot(2, 4), braid: [2, [1, 1, 1, 1]] },
	{ id: 'whitehead', name: 'L5a1', common: 'the Whitehead link', crossings: 5, components: 2, build: () => settled('whitehead'), braid: [3, [1, 1, -2, 1, -2]], relaxed: true },
	{ id: 'borromean', name: 'L6a4', common: 'the Borromean rings', crossings: 6, components: 3, build: () => borromean(), braid: [3, [1, -2, 1, -2, 1, -2]] }
];

export const knotById = new Map(knots.map((k) => [k.id, k]));

/** a loop that looks tangled but is an unknot: the closure of σ₁σ₂⁻¹σ₁⁻¹σ₂, settled */
export const tangledUnknot = () => settled('unknot-tangled');
