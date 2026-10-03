// Discrete Hodge decomposition of edge flows on a 2-complex:
//   f = δ₀ s  +  δ₁ᵀ φ  +  h
// gradient part (comes from a potential s on vertices), curl part (comes from
// circulation φ on triangles), and the harmonic remainder h, which is exactly
// what cohomology "sees": dim(harmonic flows) = b₁.
import { SimplicialComplex } from './complex';
import { conjugateGradient, matmul, mulVec, transpose, type Matrix } from './linalg';

export interface HodgeParts {
	potential: number[]; // s on vertices (mean zero)
	gradient: number[]; // δ₀ s on edges
	curl: number[]; // δ₁ᵀ φ on edges
	harmonic: number[]; // remainder
	circulation: number[]; // φ on triangles
}

/** Coboundary matrices: δ₀ = ∂₁ᵀ (edges × vertices), δ₁ = ∂₂ᵀ (triangles × edges). */
export function coboundaryMatrices(K: SimplicialComplex): { d0: Matrix; d1: Matrix } {
	return { d0: transpose(K.boundaryMatrix(1)), d1: K.count(2) ? transpose(K.boundaryMatrix(2)) : [] };
}

export function hodgeDecompose(K: SimplicialComplex, f: number[]): HodgeParts {
	const { d0, d1 } = coboundaryMatrices(K);
	const nV = K.count(0);
	const nE = K.count(1);
	const nT = K.count(2);

	// gradient part: minimise ‖δ₀ s − f‖ ⇒ (δ₀ᵀ δ₀) s = δ₀ᵀ f  (graph Laplacian)
	const d0T = transpose(d0);
	const L0 = matmul(d0T, d0);
	const s = conjugateGradient(L0, mulVec(d0T, f));
	const mean = s.reduce((a, b) => a + b, 0) / Math.max(1, nV);
	for (let i = 0; i < nV; i++) s[i] -= mean;
	const gradient = mulVec(d0, s);

	// curl part: minimise ‖δ₁ᵀ φ − f‖ ⇒ (δ₁ δ₁ᵀ) φ = δ₁ f
	let phi = new Array<number>(nT).fill(0);
	let curl = new Array<number>(nE).fill(0);
	if (nT) {
		const d1T = transpose(d1);
		const L2 = matmul(d1, d1T);
		phi = conjugateGradient(L2, mulVec(d1, f));
		curl = mulVec(d1T, phi);
	}
	const harmonic = f.map((x, i) => x - gradient[i] - curl[i]);
	return { potential: s, gradient, curl, harmonic, circulation: phi };
}
