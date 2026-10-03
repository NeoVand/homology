// The two squares of §5.1: evaluation V → V** (natural) versus the
// "dual basis" map β: V → V* (it depends on a choice, and is not natural).
// Everything is 2 × 2, with V = W = ℝ² and the standard basis.

export type M2 = [[number, number], [number, number]];
export type V2 = [number, number];

export const apply = (T: M2, v: V2): V2 => [T[0][0] * v[0] + T[0][1] * v[1], T[1][0] * v[0] + T[1][1] * v[1]];
export const transpose2 = (T: M2): M2 => [
	[T[0][0], T[1][0]],
	[T[0][1], T[1][1]]
];
export const det2 = (T: M2) => T[0][0] * T[1][1] - T[0][1] * T[1][0];
export function inverse2(T: M2): M2 | null {
	const d = det2(T);
	if (Math.abs(d) < 1e-12) return null;
	return [
		[T[1][1] / d, -T[0][1] / d],
		[-T[1][0] / d, T[0][0] / d]
	];
}

/**
 * The evaluation square, in coordinates. ev(v) ∈ V** has coordinates v in the
 * double-dual basis, and T** has matrix (Tᵀ)ᵀ = T. So
 *   right-then-down:  T**(ev v) = T v,     down-then-right:  ev(T v) = T v.
 */
export function evSquare(T: M2, v: V2): { across: V2; down: V2 } {
	return { across: apply(transpose2(transpose2(T)), v), down: apply(T, v) };
}

/**
 * The basis square for an invertible T (a change of perspective V → V).
 * β(v) = "dot with v" has coordinates v in the dual basis. The right-hand edge
 * must be covariant, so it is (T⁻¹)* with matrix (T⁻¹)ᵀ. So
 *   right-then-down:  (T⁻¹)* β(v) = (T⁻¹)ᵀ v,    down-then-right:  β(T v) = T v.
 * They agree for every v exactly when TᵀT = I (T is a rotation or a reflection).
 */
export function betaSquare(T: M2, v: V2): { across: V2; down: V2 } | null {
	const Ti = inverse2(T);
	if (!Ti) return null;
	return { across: apply(transpose2(Ti), v), down: apply(T, v) };
}

export function isOrthogonal(T: M2, eps = 1e-9): boolean {
	const a = T[0][0] * T[0][0] + T[1][0] * T[1][0];
	const b = T[0][0] * T[0][1] + T[1][0] * T[1][1];
	const c = T[0][1] * T[0][1] + T[1][1] * T[1][1];
	return Math.abs(a - 1) < eps && Math.abs(b) < eps && Math.abs(c - 1) < eps;
}

export const presetsT: { id: string; label: string; T: M2; tex: string }[] = [
	{ id: 'id', label: 'Do nothing', T: [[1, 0], [0, 1]], tex: '\\begin{pmatrix}1&0\\\\0&1\\end{pmatrix}' },
	{ id: 'rot', label: 'Rotate 90°', T: [[0, -1], [1, 0]], tex: '\\begin{pmatrix}0&-1\\\\1&0\\end{pmatrix}' },
	{ id: 'flip', label: 'Reflect', T: [[1, 0], [0, -1]], tex: '\\begin{pmatrix}1&0\\\\0&-1\\end{pmatrix}' },
	{ id: 'double', label: 'Double', T: [[2, 0], [0, 2]], tex: '\\begin{pmatrix}2&0\\\\0&2\\end{pmatrix}' },
	{ id: 'shear', label: 'Shear', T: [[1, 1], [0, 1]], tex: '\\begin{pmatrix}1&1\\\\0&1\\end{pmatrix}' },
	{ id: 'stretch', label: 'Stretch x', T: [[3, 0], [0, 1]], tex: '\\begin{pmatrix}3&0\\\\0&1\\end{pmatrix}' }
];
