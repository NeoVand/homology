// Capital letters drawn as thin strokes in one fixed sans-serif "font", stored as
// graphs: nodes (junctions, corners, ends) joined by polyline edges. Which
// letters are homeomorphic depends on the font (in some fonts K looks like X, in
// others like H; Q's tail may cross the O), so we fix this font and say so.
//
// Coordinates: x ∈ [0, 100], y ∈ [0, 140], y pointing down.

export type Pt = [number, number];
export interface Letter {
	ch: string;
	nodes: Pt[];
	/** each edge: [from node, to node, interior points of the polyline] */
	edges: [number, number, Pt[]][];
}

function arc(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, n = 16): Pt[] {
	const out: Pt[] = [];
	for (let i = 1; i < n; i++) {
		const a = a0 + ((a1 - a0) * i) / n;
		out.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
	}
	return out;
}
const D = Math.PI / 180;

const L: Letter[] = [
	{
		ch: 'A',
		nodes: [
			[25.4, 85],
			[74.6, 85],
			[10, 135],
			[90, 135]
		],
		edges: [
			[0, 1, [[50, 5]]],
			[0, 1, []],
			[0, 2, []],
			[1, 3, []]
		]
	},
	{
		// two bowls share a short middle bar: a θ-shaped graph
		ch: 'B',
		nodes: [
			[12, 70],
			[52, 70]
		],
		edges: [
			[0, 1, []],
			[0, 1, [[12, 5], [50, 5], ...arc(50, 37.5, 30, 32.5, -90 * D, 90 * D, 10)]],
			[0, 1, [[12, 135], [54, 135], ...arc(54, 102.5, 34, 32.5, 90 * D, -90 * D, 10)]]
		]
	},
	{
		ch: 'C',
		nodes: [
			[55 + 44 * Math.cos(-42 * D), 70 + 64 * Math.sin(-42 * D)],
			[55 + 44 * Math.cos(-318 * D), 70 + 64 * Math.sin(-318 * D)]
		],
		edges: [[0, 1, arc(55, 70, 44, 64, -42 * D, -318 * D, 22)]]
	},
	{
		ch: 'D',
		nodes: [[12, 5]],
		edges: [[0, 0, [[12, 135], [42, 135], ...arc(42, 70, 46, 65, 90 * D, -90 * D, 18), [42, 5]]]]
	},
	{
		ch: 'E',
		nodes: [
			[86, 5],
			[12, 70],
			[74, 70],
			[86, 135]
		],
		edges: [
			[0, 1, [[12, 5]]],
			[1, 2, []],
			[1, 3, [[12, 135]]]
		]
	},
	{
		ch: 'F',
		nodes: [
			[86, 5],
			[12, 70],
			[72, 70],
			[12, 135]
		],
		edges: [
			[0, 1, [[12, 5]]],
			[1, 2, []],
			[1, 3, []]
		]
	},
	{
		ch: 'G',
		nodes: [
			[55 + 44 * Math.cos(-42 * D), 70 + 64 * Math.sin(-42 * D)],
			[60, 75]
		],
		edges: [[0, 1, [...arc(55, 70, 44, 64, -42 * D, -360 * D, 24), [92, 75]]]]
	},
	{
		ch: 'H',
		nodes: [
			[12, 5],
			[12, 135],
			[88, 5],
			[88, 135],
			[12, 70],
			[88, 70]
		],
		edges: [
			[0, 4, []],
			[4, 1, []],
			[2, 5, []],
			[5, 3, []],
			[4, 5, []]
		]
	},
	{
		ch: 'I',
		nodes: [
			[50, 5],
			[50, 135]
		],
		edges: [[0, 1, []]]
	},
	{
		ch: 'J',
		nodes: [
			[72, 5],
			[10, 100]
		],
		edges: [[0, 1, [[72, 100], ...arc(41, 100, 31, 35, 0, 180 * D, 12)]]]
	},
	{
		// both arms meet the stem at one point: a 4-pointed star, like X
		ch: 'K',
		nodes: [
			[12, 5],
			[12, 135],
			[12, 82],
			[88, 5],
			[88, 135]
		],
		edges: [
			[0, 2, []],
			[2, 1, []],
			[2, 3, []],
			[2, 4, []]
		]
	},
	{
		ch: 'L',
		nodes: [
			[12, 5],
			[84, 135]
		],
		edges: [[0, 1, [[12, 135]]]]
	},
	{
		ch: 'M',
		nodes: [
			[8, 135],
			[92, 135]
		],
		edges: [
			[
				0,
				1,
				[
					[8, 5],
					[50, 95],
					[92, 5]
				]
			]
		]
	},
	{
		ch: 'N',
		nodes: [
			[12, 135],
			[88, 5]
		],
		edges: [
			[
				0,
				1,
				[
					[12, 5],
					[88, 135]
				]
			]
		]
	},
	{
		ch: 'O',
		nodes: [[50, 5]],
		edges: [[0, 0, arc(50, 70, 44, 65, -90 * D, 270 * D, 36)]]
	},
	{
		ch: 'P',
		nodes: [
			[12, 78],
			[12, 135]
		],
		edges: [
			[0, 1, []],
			[0, 0, [[12, 5], [48, 5], ...arc(48, 41.5, 36, 36.5, -90 * D, 90 * D, 12), [48, 78]]]
		]
	},
	{
		// the tail starts on the O and goes outward without crossing it
		ch: 'Q',
		nodes: [
			[50 + 44 * Math.cos(48 * D), 70 + 65 * Math.sin(48 * D)],
			[96, 140]
		],
		edges: [
			[0, 0, arc(50, 70, 44, 65, 48 * D, 408 * D, 36)],
			[0, 1, []]
		]
	},
	{
		// the leg leaves the bowl, not the stem: like A (a loop with two tails)
		ch: 'R',
		nodes: [
			[12, 76],
			[46, 76],
			[12, 135],
			[90, 135]
		],
		edges: [
			[0, 2, []],
			[0, 1, []],
			[1, 0, [...arc(46, 40.5, 36, 35.5, 90 * D, -90 * D, 12), [12, 5]]],
			[1, 3, []]
		]
	},
	{
		ch: 'S',
		nodes: [
			[50 + 37 * Math.cos(-30 * D), 37 + 32 * Math.sin(-30 * D)],
			[50 + 39 * Math.cos(150 * D), 101 + 34 * Math.sin(150 * D)]
		],
		edges: [[0, 1, [...arc(50, 37, 37, 32, -30 * D, -270 * D, 12), ...arc(50, 101, 39, 34, -90 * D, 150 * D, 14)]]]
	},
	{
		ch: 'T',
		nodes: [
			[6, 5],
			[94, 5],
			[50, 5],
			[50, 135]
		],
		edges: [
			[0, 2, []],
			[2, 1, []],
			[2, 3, []]
		]
	},
	{
		ch: 'U',
		nodes: [
			[12, 5],
			[88, 5]
		],
		edges: [[0, 1, [[12, 95], ...arc(50, 95, 38, 40, 180 * D, 0, 14), [88, 95]]]]
	},
	{
		ch: 'V',
		nodes: [
			[8, 5],
			[92, 5]
		],
		edges: [[0, 1, [[50, 135]]]]
	},
	{
		ch: 'W',
		nodes: [
			[4, 5],
			[96, 5]
		],
		edges: [
			[
				0,
				1,
				[
					[26, 135],
					[50, 40],
					[74, 135]
				]
			]
		]
	},
	{
		ch: 'X',
		nodes: [
			[10, 5],
			[90, 5],
			[50, 70],
			[10, 135],
			[90, 135]
		],
		edges: [
			[0, 2, []],
			[1, 2, []],
			[2, 3, []],
			[2, 4, []]
		]
	},
	{
		ch: 'Y',
		nodes: [
			[8, 5],
			[92, 5],
			[50, 68],
			[50, 135]
		],
		edges: [
			[0, 2, []],
			[1, 2, []],
			[2, 3, []]
		]
	},
	{
		ch: 'Z',
		nodes: [
			[10, 5],
			[90, 135]
		],
		edges: [
			[
				0,
				1,
				[
					[90, 5],
					[10, 135]
				]
			]
		]
	}
];

export const letters: Letter[] = L;
export const letterByChar = new Map(L.map((l) => [l.ch, l]));

/** full polyline of an edge, end points included */
export function edgePoints(l: Letter, e: number): Pt[] {
	const [a, b, mid] = l.edges[e];
	return [l.nodes[a], ...mid, l.nodes[b]];
}

/** degree of every node (a loop edge counts twice) */
export function degrees(l: Letter): number[] {
	const d = l.nodes.map(() => 0);
	for (const [a, b] of l.edges) {
		d[a]++;
		d[b]++;
	}
	return d;
}

/** The topological fingerprint: free ends, branch points by degree, and independent loops. */
export function signature(l: Letter) {
	const d = degrees(l);
	const ends = d.filter((x) => x === 1).length;
	const b3 = d.filter((x) => x === 3).length;
	const b4 = d.filter((x) => x === 4).length;
	// independent loops (first Betti number) = E − V + components (the letters are connected)
	const loops = l.edges.length - l.nodes.length + 1;
	return { ends, b3, b4, loops };
}

export type Cut = { kind: 'node'; node: number } | { kind: 'edge'; edge: number; seg: number; t: number };

/**
 * Remove one point from the letter and label the pieces that are left.
 * Returns the number of pieces, the component of every node (−1 for a removed
 * node), and for every edge the components of its two halves [start side, end side]
 * (equal unless this edge was cut).
 */
export function cutLetter(l: Letter, cut: Cut) {
	const n = l.nodes.length;
	// union–find over nodes plus two extra "loose ends"
	const parent = Array.from({ length: n + 2 }, (_, i) => i);
	const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])));
	const union = (a: number, b: number) => {
		parent[find(a)] = find(b);
	};
	const removedNode = cut.kind === 'node' ? cut.node : -1;
	const looseA = n;
	const looseB = n + 1;
	let usedLoose = false;
	// end points of each edge after the cut: an end at the removed node becomes its own loose end
	const ends: [number, number][] = [];
	let looseCounter = 0;
	const extra: number[] = [];
	l.edges.forEach(([a, b], i) => {
		if (cut.kind === 'edge' && cut.edge === i) {
			ends.push([a === removedNode ? -1 : a, b === removedNode ? -1 : b]);
			usedLoose = true;
			return;
		}
		let x = a;
		let y = b;
		if (a === removedNode) {
			x = n + 2 + looseCounter++;
			extra.push(x);
		}
		if (b === removedNode) {
			y = n + 2 + looseCounter++;
			extra.push(y);
		}
		ends.push([x, y]);
	});
	for (const x of extra) parent[x] = x;
	l.edges.forEach((_, i) => {
		const [x, y] = ends[i];
		if (cut.kind === 'edge' && cut.edge === i) {
			// the cut edge becomes two dangling halves: start side and end side
			union(x, looseA);
			union(y, looseB);
		} else union(x, y);
	});
	const comps = new Set<number>();
	for (let v = 0; v < n; v++) if (v !== removedNode) comps.add(find(v));
	for (const x of extra) comps.add(find(x));
	if (usedLoose) {
		comps.add(find(looseA));
		comps.add(find(looseB));
	}
	const ids = new Map<number, number>();
	let next = 0;
	const id = (root: number) => {
		if (!ids.has(root)) ids.set(root, next++);
		return ids.get(root)!;
	};
	const nodeComp = l.nodes.map((_, v) => (v === removedNode ? -1 : id(find(v))));
	const edgeComp = l.edges.map((_, i): [number, number] => {
		const [x, y] = ends[i];
		if (cut.kind === 'edge' && cut.edge === i) return [id(find(looseA)), id(find(looseB))];
		return [id(find(x)), id(find(y))];
	});
	for (const r of comps) id(r);
	return { pieces: comps.size, nodeComp, edgeComp };
}

/** How many arms meet at the cut point (2 inside an edge, the degree at a node). */
export function armsAt(l: Letter, cut: Cut) {
	return cut.kind === 'node' ? degrees(l)[cut.node] : 2;
}

export const classes: { name: string; members: string; tex: string }[] = [
	{ name: 'a single stroke', members: 'CGIJLMNSUVWZ', tex: '\\text{like }\\mathsf{I}' },
	{ name: 'a loop', members: 'DO', tex: '\\text{like }\\mathsf{O}' },
	{ name: 'a loop with one tail', members: 'PQ', tex: '\\text{like }\\mathsf{P}' },
	{ name: 'a loop with two tails', members: 'AR', tex: '\\text{like }\\mathsf{A}' },
	{ name: 'two loops sharing a bar', members: 'B', tex: '\\text{like }\\mathsf{B}' },
	{ name: 'three arms from one point', members: 'EFTY', tex: '\\text{like }\\mathsf{T}' },
	{ name: 'four arms from one point', members: 'KX', tex: '\\text{like }\\mathsf{X}' },
	{ name: 'two branch points, four ends', members: 'H', tex: '\\text{like }\\mathsf{H}' }
];
