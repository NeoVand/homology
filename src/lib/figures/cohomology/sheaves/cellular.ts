// Cellular sheaves on graphs with one-dimensional stalks (every vertex and
// every edge carries a copy of ℝ), the simplest case of Curry's and
// Hansen–Ghrist's cellular sheaves.
//
// For an edge e = (u → v) the restriction maps are multiplication by numbers
// F_{u⊴e}, F_{v⊴e}. A 0-cochain x assigns a number to each vertex; its
// coboundary on e is the disagreement seen on the edge:
//     (δx)_e = F_{v⊴e} x_v − F_{u⊴e} x_u.
// H⁰ = ker δ (global sections), H¹ = C¹ / im δ (unexplainable edge data).
import { leastSquares, matMul, matVec, rankReal, transpose, type Mat } from './reals';

export interface SheafEdge {
	u: number;
	v: number;
	/** restriction map from the stalk at u to the stalk on the edge */
	fu: number;
	/** restriction map from the stalk at v to the stalk on the edge */
	fv: number;
}

export interface GraphSheaf {
	vertices: number;
	edges: SheafEdge[];
}

export function coboundaryMatrix(S: GraphSheaf): Mat {
	return S.edges.map((e) => {
		const row = new Array<number>(S.vertices).fill(0);
		row[e.u] -= e.fu;
		row[e.v] += e.fv;
		return row;
	});
}

export function delta(S: GraphSheaf, x: number[]): number[] {
	return S.edges.map((e) => e.fv * x[e.v] - e.fu * x[e.u]);
}

export function sheafDims(S: GraphSheaf) {
	const D = coboundaryMatrix(S);
	const r = S.edges.length ? rankReal(D) : 0;
	return { c0: S.vertices, c1: S.edges.length, rank: r, h0: S.vertices - r, h1: S.edges.length - r };
}

/** One explicit Euler step of the sheaf heat equation dx/dt = −δᵀδ x. */
export function diffuse(S: GraphSheaf, x: number[], h: number): number[] {
	const D = coboundaryMatrix(S);
	const g = matVec(transpose(D), matVec(D, x));
	return x.map((v, i) => v - h * g[i]);
}

/** The sheaf Laplacian L = δᵀδ (a vertices × vertices matrix). */
export function laplacian(S: GraphSheaf): Mat {
	const D = coboundaryMatrix(S);
	return matMul(transpose(D), D);
}

/** A safe step for explicit diffusion: h < 2 / λ_max, using Gershgorin's bound on λ_max. */
export function safeStep(S: GraphSheaf): number {
	const L = laplacian(S);
	const bound = L.reduce((m, row) => Math.max(m, row.reduce((s, a) => s + Math.abs(a), 0)), 0);
	return bound > 0 ? 1.6 / bound : 0.5;
}

/**
 * Best vertex data for given edge data y: minimise ‖δx − y‖. The residual
 * y − δx is the part of y that no vertex data can explain; it is zero exactly
 * when y is a coboundary, i.e. when [y] = 0 in H¹.
 */
export function explain(S: GraphSheaf, y: number[]) {
	const { x, residual } = leastSquares(coboundaryMatrix(S), y);
	return { x, residual };
}

/** Product of the "conversion factors" fu/fv around a cycle of edges (traversed u → v). */
export function loopFactor(S: GraphSheaf, cycle: { edge: number; forward: boolean }[]): number {
	let p = 1;
	for (const { edge, forward } of cycle) {
		const e = S.edges[edge];
		p *= forward ? e.fu / e.fv : e.fv / e.fu;
	}
	return p;
}
