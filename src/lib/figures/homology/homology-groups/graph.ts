// Tiny graph helpers: connected components and shortest edge paths.

/** For each vertex 0…n−1, the smallest vertex of its connected component. */
export function componentsOf(n: number, edges: number[][]): number[] {
	const parent = Array.from({ length: n }, (_, i) => i);
	const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])));
	for (const [a, b] of edges) {
		const ra = find(a);
		const rb = find(b);
		if (ra !== rb) parent[Math.max(ra, rb)] = Math.min(ra, rb);
	}
	return Array.from({ length: n }, (_, i) => find(i));
}

/** A shortest path of vertices from u to w using the given edges, or null. */
export function pathBetween(n: number, edges: number[][], u: number, w: number): number[] | null {
	const adj: number[][] = Array.from({ length: n }, () => []);
	for (const [a, b] of edges) {
		adj[a].push(b);
		adj[b].push(a);
	}
	const prev = new Array<number>(n).fill(-1);
	const seen = new Array<boolean>(n).fill(false);
	seen[u] = true;
	const q = [u];
	while (q.length) {
		const x = q.shift()!;
		if (x === w) break;
		for (const y of adj[x].sort((p, r) => p - r))
			if (!seen[y]) {
				seen[y] = true;
				prev[y] = x;
				q.push(y);
			}
	}
	if (!seen[w]) return null;
	const path = [w];
	while (path[0] !== u) path.unshift(prev[path[0]]);
	return path;
}
