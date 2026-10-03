// The Penrose tribar, built the way Penrose analysed it: three overlapping
// pieces, each a perfectly real 3D corner made of unit cubes.
//
// The real (open) object: three beams of unit cubes along +x, +y, +z,
//   beam A: cubes (i, 0, 0),  i = 0 … N
//   beam B: cubes (N, j, 0),  j = 0 … N
//   beam C: cubes (N, N, k),  k = 0 … N
// Seen along the diagonal (1, 1, 1), the end of beam C (cube (N,N,N)) sits
// exactly in front of the start of beam A (cube (0,0,0)), so the open chain
// looks closed. Piece 1 is the corner at (N,0,0); pieces 2 and 3 are its images
// under the coordinate cycle σ(x, y, z) = (z, x, y), which acts on the picture
// as a rotation by 120°.

export type Vec3 = [number, number, number];
export type Axis = 'x' | 'y' | 'z';

export const N = 7;

export interface Face3 {
	piece: 0 | 1 | 2;
	normal: Axis;
	pts: Vec3[];
}

/** Piece 1 relative to its corner cube at the origin: arriving along +x, leaving along +y. */
function pieceOneFaces(): { normal: Axis; pts: Vec3[] }[] {
	const a0 = -4; // beam A portion: cubes x = −4 … −1, then the corner cube x = 0
	const b1 = 5; // beam B portion: cubes y = 1 … 4
	return [
		// +y face of the incoming beam (the part not glued to the outgoing beam)
		{
			normal: 'y',
			pts: [
				[a0, 1, 0],
				[0, 1, 0],
				[0, 1, 1],
				[a0, 1, 1]
			]
		},
		// the L-shaped top (+z)
		{
			normal: 'z',
			pts: [
				[a0, 0, 1],
				[1, 0, 1],
				[1, b1, 1],
				[0, b1, 1],
				[0, 1, 1],
				[a0, 1, 1]
			]
		},
		// the outer side (+x), shared by the corner cube and the outgoing beam
		{
			normal: 'x',
			pts: [
				[1, 0, 0],
				[1, b1, 0],
				[1, b1, 1],
				[1, 0, 1]
			]
		}
	];
}

const sigma = (p: Vec3): Vec3 => [p[2], p[0], p[1]];
const sigmaAxis: Record<Axis, Axis> = { x: 'y', y: 'z', z: 'x' };

/** Corner cube origins of the three pieces in the real open chain. */
export const corners: Vec3[] = [
	[N, 0, 0],
	[N, N, 0],
	[N, N, N]
];

/** All visible faces of the three pieces, in 3D, in drawing order within each piece. */
export function tribarFaces(): Face3[] {
	const out: Face3[] = [];
	const base = pieceOneFaces();
	for (const k of [0, 1, 2] as const) {
		for (const f of base) {
			let pts = f.pts.map((p) => p.slice() as Vec3);
			let normal = f.normal;
			for (let s = 0; s < k; s++) {
				pts = pts.map(sigma);
				normal = sigmaAxis[normal];
			}
			const c = corners[k];
			out.push({ piece: k, normal, pts: pts.map((p) => [p[0] + c[0], p[1] + c[1], p[2] + c[2]] as Vec3) });
		}
	}
	return out;
}

/** Orthographic projection along (1,1,1) to screen coordinates (y down), rotated so beam B is horizontal. */
export function project(p: Vec3): [number, number] {
	const u = (-p[0] + p[1]) / Math.SQRT2;
	const v = (-p[0] - p[1] + 2 * p[2]) / Math.sqrt(6);
	// beam B (+y) projects to direction (1/√2, −1/√6) in (u, v): rotate it to +x
	const ang = Math.atan2(-1 / Math.sqrt(6), 1 / Math.SQRT2);
	const c = Math.cos(-ang);
	const s = Math.sin(-ang);
	const x = u * c - v * s;
	const y = u * s + v * c;
	return [x, -y];
}

// ── Penrose's cocycle ───────────────────────────────────────────────────────

/**
 * Distances are only determined by a perspective drawing up to scaling about
 * the eye E. In the real open chain seen from an eye E on the line through the
 * start of beam A and the end of beam C, pieces 1 and 2 agree on beam B and
 * pieces 2 and 3 agree on beam C, but piece 3 — read as a genuine corner —
 * puts the start of beam A at the end of beam C, i.e. scaled about E by
 *     μ = |E P₃| / |E P₀| < 1.
 */
export function eyeModel(eyeBeyond = 30) {
	const P0: Vec3 = [0.5, 0.5, 0.5];
	const P3: Vec3 = [N + 0.5, N + 0.5, N + 0.5];
	const dir: Vec3 = [1 / Math.sqrt(3), 1 / Math.sqrt(3), 1 / Math.sqrt(3)];
	const E: Vec3 = [P3[0] + eyeBeyond * dir[0], P3[1] + eyeBeyond * dir[1], P3[2] + eyeBeyond * dir[2]];
	const dist = (a: Vec3, b: Vec3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
	const mu = dist(E, P3) / dist(E, P0);
	return { E, P0, P3, mu };
}

/**
 * The cochain d on the three overlaps when piece i is rescaled (about the eye)
 * by λ_i: d_ij = (distance of the shared part according to piece i) /
 * (according to piece j).
 */
export function ratios(lam: [number, number, number], mu: number) {
	const [l1, l2, l3] = lam;
	const d12 = l1 / l2;
	const d23 = l2 / l3;
	const d31 = (l3 * mu) / l1;
	return { d12, d23, d31, product: d12 * d23 * d31 };
}
