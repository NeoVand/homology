// Graphs, layouts and starting data for the figures of §4.1.
// Positions are in SVG user units of each figure's viewBox.
import type { OGraph, Pt } from './graph';

export interface Layout extends OGraph {
	pos: Pt[];
	/** optional vertex names */
	names?: string[];
}

/** Put each triangle in counter-clockwise order as seen on screen (SVG y points down). */
export function ccwTris(pos: Pt[], tris: [number, number, number][]): [number, number, number][] {
	return tris.map(([a, b, c]) => {
		const [ax, ay] = pos[a];
		const [bx, by] = pos[b];
		const [cx, cy] = pos[c];
		const cross = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
		// with y down, a negative cross product means counter-clockwise on screen
		return cross < 0 ? [a, b, c] : [a, c, b];
	});
}

// ── a mountain trail map (potential painter) ───────────────────────────────

export const trailMap: Layout & { heights: number[] } = {
	n: 7,
	names: ['Trailhead', 'Meadow', 'Spring', 'Lake', 'Ridge', 'Hut', 'Summit'],
	pos: [
		[62, 292],
		[198, 300],
		[112, 172],
		[258, 196],
		[214, 70],
		[398, 262],
		[404, 96]
	],
	edges: [
		[0, 1],
		[0, 2],
		[1, 3],
		[2, 3],
		[2, 4],
		[3, 4],
		[3, 5],
		[4, 6],
		[5, 6]
	],
	heights: [1200, 1350, 1460, 1530, 1780, 1610, 1920]
};

/** The three loops of the trail map, as closed vertex walks (for the loop-sum readout). */
export const trailLoops: number[][] = [
	[0, 1, 3, 2, 0],
	[2, 3, 4, 2],
	[3, 5, 6, 4, 3]
];

// ── islands (H⁰): three components ─────────────────────────────────────────

export const islands: Layout & { heights: number[] } = {
	n: 8,
	names: ['', '', '', '', '', '', '', ''],
	pos: [
		[70, 120],
		[150, 70],
		[160, 170],
		[250, 250],
		[300, 160],
		[380, 80],
		[420, 180],
		[350, 270]
	],
	edges: [
		[0, 1],
		[1, 2],
		[0, 2],
		[3, 4],
		[5, 6],
		[6, 7]
	],
	heights: [300, 300, 300, 120, 120, 450, 450, 450]
};

// ── "find the potential" puzzles ───────────────────────────────────────────

export interface Puzzle extends Layout {
	id: string;
	label: string;
	psi: number[];
	note: string;
}

export const puzzles: Puzzle[] = [
	{
		id: 'tree',
		label: 'A tree',
		n: 6,
		pos: [
			[80, 230],
			[190, 160],
			[180, 280],
			[310, 110],
			[320, 220],
			[420, 170]
		],
		edges: [
			[0, 1],
			[0, 2],
			[1, 3],
			[1, 4],
			[4, 5]
		],
		psi: [2, -1, 3, 1, -2],
		note: 'A tree has no loops, so nothing can go wrong.'
	},
	{
		id: 'closes',
		label: 'A loop that closes',
		n: 4,
		pos: [
			[120, 270],
			[340, 270],
			[340, 70],
			[120, 70]
		],
		edges: [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 0]
		],
		psi: [2, 3, -1, -4],
		note: 'Around the loop: 2 + 3 − 1 − 4 = 0.'
	},
	{
		id: 'staircase',
		label: 'A loop that does not',
		n: 4,
		pos: [
			[120, 270],
			[340, 270],
			[340, 70],
			[120, 70]
		],
		edges: [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 0]
		],
		psi: [1, 1, 1, 1],
		note: 'Every step is +1, so the loop sum is 4: an impossible staircase.'
	},
	{
		id: 'two-loops',
		label: 'Two loops',
		n: 5,
		pos: [
			[70, 180],
			[200, 70],
			[200, 290],
			[330, 180],
			[440, 180]
		],
		edges: [
			[0, 1],
			[0, 2],
			[1, 3],
			[2, 3],
			[1, 2],
			[3, 4]
		],
		psi: [3, 1, 2, 5, -2, 1],
		note: 'Two independent loops to check. Does each of them close?'
	}
];

// ── the triangulated annulus (local vs global) ─────────────────────────────

/**
 * Inner triangle a0 a1 a2 (ids 0,1,2), outer triangle b0 b1 b2 (ids 3,4,5).
 * Circumferential edges go around counter-clockwise, rungs go aᵢ → bᵢ,
 * diagonals go aᵢ → bᵢ₊₁. Triangles [aᵢ, aᵢ₊₁, bᵢ₊₁] and [aᵢ, bᵢ, bᵢ₊₁].
 */
export function annulus(cx = 240, cy = 226, r = 70, R = 198): Layout & { psi: number[]; harmonic: number[] } {
	// outer vertices: b0 at the top, then counter-clockwise on screen; each inner
	// vertex aᵢ faces the middle of the outer edge bᵢ bᵢ₊₁ (inner triangle turned by 60°)
	const ang = (i: number) => -Math.PI / 2 - (2 * Math.PI * i) / 3;
	const pos: Pt[] = [];
	for (let i = 0; i < 3; i++) pos.push([cx + r * Math.cos(ang(i) - Math.PI / 3), cy + r * Math.sin(ang(i) - Math.PI / 3)]);
	for (let i = 0; i < 3; i++) pos.push([cx + R * Math.cos(ang(i)), cy + R * Math.sin(ang(i))]);
	const a = (i: number) => i % 3;
	const b = (i: number) => 3 + (i % 3);
	const edges: [number, number][] = [];
	for (let i = 0; i < 3; i++) edges.push([a(i), a(i + 1)]); // 0,1,2: inner
	for (let i = 0; i < 3; i++) edges.push([b(i), b(i + 1)]); // 3,4,5: outer
	for (let i = 0; i < 3; i++) edges.push([a(i), b(i)]); // 6,7,8: rungs
	for (let i = 0; i < 3; i++) edges.push([a(i), b(i + 1)]); // 9,10,11: diagonals
	const tris: [number, number, number][] = [];
	for (let i = 0; i < 3; i++) {
		tris.push([a(i), a(i + 1), b(i + 1)]);
		tris.push([a(i), b(i), b(i + 1)]);
	}
	// ψ = 1 on a0→a1, a0→b1, b0→b1 (a radial "fence" between sectors 0 and 1)
	const psi = edges.map(([t, h]) => ((t === 0 && h === 1) || (t === 0 && h === 4) || (t === 3 && h === 4) ? 1 : 0));
	const harmonic = [1 / 3, 1 / 3, 1 / 3, 1 / 3, 1 / 3, 1 / 3, -1 / 6, -1 / 6, -1 / 6, 1 / 6, 1 / 6, 1 / 6];
	return {
		n: 6,
		pos,
		edges,
		tris: ccwTris(pos, tris),
		names: ['a₀', 'a₁', 'a₂', 'b₀', 'b₁', 'b₂'],
		psi,
		harmonic
	};
}

// ── Hodge decomposition example (research §4.4) ────────────────────────────

/** Vertices 1,2,3,4 → ids 0,1,2,3. Triangle {1,2,3} is filled; {1,3,4} is a hole. */
export const hodgeGraph: Layout & { flow: number[] } = {
	n: 4,
	names: ['1', '2', '3', '4'],
	pos: [
		[44, 128],
		[150, 34],
		[256, 128],
		[150, 222]
	],
	edges: [
		[0, 1], // 1→2
		[1, 2], // 2→3
		[0, 2], // 1→3
		[2, 3], // 3→4
		[0, 3] // 1→4
	],
	tris: [[0, 2, 1]],
	flow: [3, 3, 3, 2, -2]
};

// ── a small currency market ────────────────────────────────────────────────

export const currencies = ['USD', 'EUR', 'GBP', 'JPY'];
export const currencySymbols = ['$', '€', '£', '¥'];

/** Exchange rates (units of head currency per unit of tail currency). £→¥ is the fair 200. */
export const market = {
	n: 4,
	pos: [
		[110, 80],
		[370, 80],
		[370, 270],
		[110, 270]
	] as Pt[],
	edges: [
		[0, 1],
		[1, 2],
		[2, 3],
		[3, 0]
	] as [number, number][],
	rates: [0.9, 0.85, 200, 1 / 153]
};
