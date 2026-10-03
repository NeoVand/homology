// HodgeRank (Jiang–Lim–Yao–Ye): rank teams from pairwise results by splitting
// the "who beat whom by how much" edge flow into gradient + curl + harmonic.
import { SimplicialComplex } from '$lib/math/complex';
import { hodgeDecompose, type HodgeParts } from '$lib/math/hodge';

export interface Game {
	/** team indices */
	a: number;
	b: number;
	/** points scored by a and by b */
	sa: number;
	sb: number;
}

export interface Ranking {
	K: SimplicialComplex;
	/** the observed flow on each edge [i, j] (i < j): how much better j did than i */
	flow: number[];
	parts: HodgeParts;
	/** ratings (mean zero); bigger is better */
	ratings: number[];
	energy: { total: number; gradient: number; curl: number; harmonic: number };
}

const sq = (v: number[]) => v.reduce((a, x) => a + x * x, 0);

/** The clique complex of the comparison graph: every triangle of played pairs is filled. */
export function comparisonComplex(nTeams: number, games: Game[]): SimplicialComplex {
	const pairs = new Set<string>();
	for (const g of games) {
		const [i, j] = g.a < g.b ? [g.a, g.b] : [g.b, g.a];
		if (i !== j) pairs.add(`${i},${j}`);
	}
	const has = (i: number, j: number) => pairs.has(i < j ? `${i},${j}` : `${j},${i}`);
	const gens: number[][] = [];
	for (let v = 0; v < nTeams; v++) gens.push([v]);
	for (const p of pairs) gens.push(p.split(',').map(Number));
	for (let i = 0; i < nTeams; i++)
		for (let j = i + 1; j < nTeams; j++)
			for (let k = j + 1; k < nTeams; k++) if (has(i, j) && has(j, k) && has(i, k)) gens.push([i, j, k]);
	return new SimplicialComplex(gens);
}

export function hodgeRank(nTeams: number, games: Game[]): Ranking {
	const K = comparisonComplex(nTeams, games);
	const sums = new Array<number>(K.count(1)).fill(0);
	const counts = new Array<number>(K.count(1)).fill(0);
	for (const g of games) {
		if (g.a === g.b) continue;
		const [i, j, si, sj] = g.a < g.b ? [g.a, g.b, g.sa, g.sb] : [g.b, g.a, g.sb, g.sa];
		const e = K.indexOf([i, j]);
		sums[e] += sj - si;
		counts[e] += 1;
	}
	const flow = sums.map((s, e) => (counts[e] ? s / counts[e] : 0));
	const parts = hodgeDecompose(K, flow);
	return {
		K,
		flow,
		parts,
		ratings: parts.potential,
		energy: {
			total: sq(flow),
			gradient: sq(parts.gradient),
			curl: sq(parts.curl),
			harmonic: sq(parts.harmonic)
		}
	};
}
