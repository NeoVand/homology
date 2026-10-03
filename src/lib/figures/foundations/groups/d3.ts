// The six symmetries of an equilateral triangle (the dihedral group D₃).
//
// Positions are fixed in space: 0 = top (90°), 1 = bottom-left (210°),
// 2 = bottom-right (330°). A symmetry is recorded as a permutation of the
// positions: perm[i] is the position where the corner sitting at position i
// ends up. Mirror axes are fixed in space too: f₁ is the reflection in the
// axis through position 0 (the vertical axis), f₂ through position 1, f₃
// through position 2. The rotation r turns the triangle 120° anticlockwise.
//
// Composition follows the book's convention for functions: g∘h ("g after h")
// means "first do h, then do g", so (g∘h)[i] = g[h[i]].

export type Perm = readonly [number, number, number];

export type D3Key = 'e' | 'r' | 'r2' | 'f1' | 'f2' | 'f3';

export interface D3Element {
	id: number;
	key: D3Key;
	/** TeX name */
	tex: string;
	/** plain-text name (for aria labels) */
	label: string;
	perm: Perm;
	kind: 'rotation' | 'flip';
	/** rotation angle (degrees, anticlockwise) or the angle of the mirror axis (degrees) */
	angle: number;
	/** display colour (each element gets its own) */
	color: string;
	/** a short description in words */
	words: string;
}

export const D3: D3Element[] = [
	{ id: 0, key: 'e', tex: 'e', label: 'e', perm: [0, 1, 2], kind: 'rotation', angle: 0, color: '#ebe5d5', words: 'do nothing' },
	{ id: 1, key: 'r', tex: 'r', label: 'r', perm: [1, 2, 0], kind: 'rotation', angle: 120, color: '#f2d08f', words: 'rotate 120° anticlockwise' },
	{ id: 2, key: 'r2', tex: 'r^2', label: 'r²', perm: [2, 0, 1], kind: 'rotation', angle: 240, color: '#f4b55f', words: 'rotate 240° anticlockwise' },
	{ id: 3, key: 'f1', tex: 'f_1', label: 'f₁', perm: [0, 2, 1], kind: 'flip', angle: 90, color: '#5fd6cf', words: 'flip in the vertical axis' },
	{ id: 4, key: 'f2', tex: 'f_2', label: 'f₂', perm: [2, 1, 0], kind: 'flip', angle: 210, color: '#a493ff', words: 'flip in the axis through the bottom-left corner' },
	{ id: 5, key: 'f3', tex: 'f_3', label: 'f₃', perm: [1, 0, 2], kind: 'flip', angle: 330, color: '#f28db6', words: 'flip in the axis through the bottom-right corner' }
];

export const byKey = Object.fromEntries(D3.map((g) => [g.key, g])) as Record<D3Key, D3Element>;

function permId(p: readonly number[]): number {
	const i = D3.findIndex((g) => g.perm[0] === p[0] && g.perm[1] === p[1] && g.perm[2] === p[2]);
	if (i < 0) throw new Error('not a symmetry: ' + p.join(','));
	return i;
}

/** id of g∘h: first h, then g. */
export function compose(g: number, h: number): number {
	const G = D3[g].perm;
	const H = D3[h].perm;
	return permId([G[H[0]], G[H[1]], G[H[2]]]);
}

/** id of the inverse of g. */
export function inverse(g: number): number {
	for (let h = 0; h < 6; h++) if (compose(g, h) === 0) return h;
	throw new Error('no inverse');
}

/** The full Cayley table: table[g][h] = g∘h (row g, column h). */
export function cayleyTable(): number[][] {
	return D3.map((_, g) => D3.map((__, h) => compose(g, h)));
}

/** +1 for rotations (the triangle stays face up), −1 for flips (it is turned over). */
export function sign(g: number): 1 | -1 {
	return D3[g].kind === 'rotation' ? 1 : -1;
}

export type Mat2 = [number, number, number, number]; // [a, b, c, d] = [[a, b], [c, d]]

const rad = (deg: number) => (deg * Math.PI) / 180;

/** The 2×2 orthogonal matrix of a symmetry (standard axes, y pointing up). */
export function matrixOf(g: number): Mat2 {
	const el = D3[g];
	if (el.kind === 'rotation') {
		const c = Math.cos(rad(el.angle));
		const s = Math.sin(rad(el.angle));
		return [c, -s, s, c];
	}
	const c2 = Math.cos(rad(2 * el.angle));
	const s2 = Math.sin(rad(2 * el.angle));
	return [c2, s2, s2, -c2];
}

/**
 * The matrix of a move "part of the way through", t ∈ [0, 1].
 * Rotations turn smoothly; flips squash the direction across the mirror
 * axis through zero and out the other side, which reads as the triangle
 * turning over like a card.
 */
export function partialMove(g: number, t: number): Mat2 {
	const el = D3[g];
	if (el.kind === 'rotation') {
		const a = rad(el.angle * t);
		return [Math.cos(a), -Math.sin(a), Math.sin(a), Math.cos(a)];
	}
	const a = rad(el.angle);
	const u = [Math.cos(a), Math.sin(a)]; // along the axis
	const v = [-Math.sin(a), Math.cos(a)]; // across the axis
	const s = Math.cos(Math.PI * t); // 1 → −1
	// M = u uᵀ + s v vᵀ
	return [u[0] * u[0] + s * v[0] * v[0], u[0] * u[1] + s * v[0] * v[1], u[1] * u[0] + s * v[1] * v[0], u[1] * u[1] + s * v[1] * v[1]];
}

export function mul(A: Mat2, B: Mat2): Mat2 {
	return [A[0] * B[0] + A[1] * B[2], A[0] * B[1] + A[1] * B[3], A[2] * B[0] + A[3] * B[2], A[2] * B[1] + A[3] * B[3]];
}

export function apply(A: Mat2, p: [number, number]): [number, number] {
	return [A[0] * p[0] + A[1] * p[1], A[2] * p[0] + A[3] * p[1]];
}

export const det = (A: Mat2) => A[0] * A[3] - A[1] * A[2];

/** Position i of the triangle's slot, radius R (standard axes, y up). */
export function slot(i: number, R = 1): [number, number] {
	const a = rad(90 + 120 * i);
	return [R * Math.cos(a), R * Math.sin(a)];
}
