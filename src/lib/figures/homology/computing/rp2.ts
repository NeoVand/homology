// The torsion witness in the 6-vertex projective plane: orient all ten
// triangles counterclockwise in the hexagon picture; their sum has boundary
// 2c, where c = 4→5→6→4 is half of the rim; and c itself bounds nothing.
import { projectivePlane } from '../homology-groups/complexes';
import { counterclockwise } from '../homology-groups/flat';
import { loopChain } from '../homology-groups/chains';
import { boundaryZ2 } from '$lib/math/homology';

export function rp2Witness() {
	const ex = projectivePlane();
	const K = ex.K;
	const eps = counterclockwise(ex.L);
	const c = loopChain(K, [4, 5, 6]);
	const dSum = K.boundary(2, eps);
	const rimEdges = new Set(c.flatMap((x, i) => (x ? [i] : [])));
	const interiorEdges = K.simplices[1].map((_, i) => i).filter((i) => !rimEdges.has(i));
	return { ex, K, eps, c, dSum, rimEdges, interiorEdges };
}

/** How many sets of triangles have mod-2 boundary equal to the given edge set? (brute force) */
export function countMod2Fillings(target: number[]): number {
	const { K } = rp2Witness();
	const n = K.count(2);
	const want = [...target].sort((a, b) => a - b).join();
	let found = 0;
	for (let mask = 0; mask < 1 << n; mask++) {
		const S: number[] = [];
		for (let t = 0; t < n; t++) if (mask & (1 << t)) S.push(t);
		if (boundaryZ2(K, 2, S).join() === want) found++;
	}
	return found;
}
