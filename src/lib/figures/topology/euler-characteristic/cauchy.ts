// The cube, flattened (a Schlegel diagram), for Cauchy's proof and for the
// "two trees" proof of Euler's formula in §2.6.
export type P2 = [number, number];

/** Vertices 0–3: the front face (to be removed); 4–7: the back face. Math coords, y up. */
export const cubeLayouts: { box: P2[]; flat: P2[] } = {
	// a cube drawn in a three-quarter view (the back face shifted up and right)
	box: [
		[-0.95, -0.9],
		[0.45, -0.9],
		[0.45, 0.5],
		[-0.95, 0.5],
		[-0.45, -0.4],
		[0.95, -0.4],
		[0.95, 1.0],
		[-0.45, 1.0]
	],
	// looking at the cube from very close to the front face: the front face fills the
	// view and the back face shrinks to a small square in the middle
	flat: [
		[-1, -1],
		[1, -1],
		[1, 1],
		[-1, 1],
		[-0.4, -0.4],
		[0.4, -0.4],
		[0.4, 0.4],
		[-0.4, 0.4]
	]
};

/** The removed (front) face and the five that remain. */
export const removedFace = [0, 1, 2, 3];
export const cubeFaces = [
	[4, 5, 6, 7],
	[0, 1, 5, 4],
	[1, 2, 6, 5],
	[2, 3, 7, 6],
	[3, 0, 4, 7]
];
export const cubeEdges: [number, number][] = [
	[0, 1],
	[1, 2],
	[2, 3],
	[0, 3],
	[4, 5],
	[5, 6],
	[6, 7],
	[4, 7],
	[0, 4],
	[1, 5],
	[2, 6],
	[3, 7]
];

/** One diagonal in each remaining face (a pinwheel). */
export const diagonals: [number, number][] = [
	[4, 6],
	[0, 5],
	[1, 6],
	[2, 7],
	[3, 4]
];

/** The ten triangles of the triangulated flat network. */
export const triangles: number[][] = [
	[4, 5, 6],
	[4, 6, 7],
	[0, 1, 5],
	[0, 5, 4],
	[1, 2, 6],
	[1, 6, 5],
	[2, 3, 7],
	[2, 7, 6],
	[3, 0, 4],
	[3, 4, 7]
];

const ek = (a: number, b: number) => (a < b ? `${a},${b}` : `${b},${a}`);

function triEdges(t: number[]): string[] {
	return [ek(t[0], t[1]), ek(t[1], t[2]), ek(t[0], t[2])];
}

export interface Removal {
	/** index into `triangles` */
	tri: number;
	/** 'one': one outer edge (lose 1 E, 1 F); 'two': two outer edges and their corner (lose 1 V, 2 E, 1 F) */
	kind: 'one' | 'two';
	/** the outer edges removed with it */
	edges: [number, number][];
	/** the corner removed with it (kind 'two') */
	vertex?: number;
}

/** Edges lying on the outside of a set of triangles (used by exactly one of them). */
export function outerEdges(tris: number[][]): Set<string> {
	const c = new Map<string, number>();
	for (const t of tris) for (const e of triEdges(t)) c.set(e, (c.get(e) ?? 0) + 1);
	return new Set([...c].filter(([, n]) => n === 1).map(([e]) => e));
}

/**
 * Remove triangles from the outside, one at a time, so that what is left is
 * always a triangulated disk (never pinched, never split). Greedy, preferring
 * to alternate between the two kinds of removal; deterministic.
 */
export function removalOrder(): Removal[] {
	const left = triangles.map((_, i) => i);
	const out: Removal[] = [];
	let want: 'one' | 'two' = 'one';
	while (left.length > 1) {
		const tris = left.map((i) => triangles[i]);
		const outer = outerEdges(tris);
		const outerVerts = new Set([...outer].flatMap((e) => e.split(',').map(Number)));
		const candidates: Removal[] = [];
		for (const i of left) {
			const t = triangles[i];
			const es = triEdges(t).filter((e) => outer.has(e));
			if (es.length === 1) {
				const [a, b] = es[0].split(',').map(Number);
				const apex = t.find((v) => v !== a && v !== b)!;
				if (!outerVerts.has(apex)) candidates.push({ tri: i, kind: 'one', edges: [[a, b]] });
			} else if (es.length === 2) {
				const pairs = es.map((e) => e.split(',').map(Number) as [number, number]);
				const corner = pairs[0].find((v) => pairs[1].includes(v))!;
				candidates.push({ tri: i, kind: 'two', edges: pairs, vertex: corner });
			}
		}
		const pick = candidates.find((c) => c.kind === want) ?? candidates[0];
		out.push(pick);
		left.splice(left.indexOf(pick.tri), 1);
		want = pick.kind === 'one' ? 'two' : 'one';
	}
	return out;
}

/** The faces of the flat cube network, including the outside region (index 5). */
export const planarFaces = [...cubeFaces, removedFace];

/** For each cube edge, the two faces (indices into planarFaces) on either side. */
export function edgeFaces(): [number, number][] {
	return cubeEdges.map(([a, b]) => {
		const fs = planarFaces
			.map((f, i) => {
				for (let k = 0; k < f.length; k++) {
					const x = f[k];
					const y = f[(k + 1) % f.length];
					if ((x === a && y === b) || (x === b && y === a)) return i;
				}
				return -1;
			})
			.filter((i) => i >= 0);
		return [fs[0], fs[1]] as [number, number];
	});
}
