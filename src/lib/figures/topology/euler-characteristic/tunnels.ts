// Polyhedra with tunnels (§2.6): Lhuilier's picture frame, and a slab of
// cubes with g square tunnels, whose surface has χ = 2 − 2g.
import type { V3 } from './polyhedra';

export interface QuadSurface {
	pos: V3[];
	/** faces as vertex loops, consistently oriented (each edge is run once each way) */
	faces: number[][];
}

/**
 * The classic "picture frame": a square frame with a square hole.
 * 16 vertices, 32 edges, 16 faces (8 trapezoids on top and bottom, 8 walls).
 */
export function pictureFrame(outer = 3, inner = 1, height = 1): QuadSurface {
	const o = outer / 2;
	const i = inner / 2;
	const h = height / 2;
	const sq = (r: number, y: number): V3[] => [
		[-r, y, -r],
		[r, y, -r],
		[r, y, r],
		[-r, y, r]
	];
	// 0–3 outer top, 4–7 inner top, 8–11 outer bottom, 12–15 inner bottom
	const pos = [...sq(o, h), ...sq(i, h), ...sq(o, -h), ...sq(i, -h)];
	const faces: number[][] = [];
	for (let k = 0; k < 4; k++) {
		const n = (k + 1) % 4;
		faces.push([k, 4 + k, 4 + n, n]); // top trapezoid (seen from above)
		faces.push([8 + k, 8 + n, 12 + n, 12 + k]); // bottom trapezoid
		faces.push([k, n, 8 + n, 8 + k]); // outer wall
		faces.push([4 + k, 12 + k, 12 + n, 4 + n]); // inner wall (tunnel)
	}
	return { pos, faces };
}

/**
 * A slab made of unit cubes, W × 3 cells, with g square holes punched through
 * (W = max(3, 2g + 1); the holes sit at cells (1,1), (3,1), …). Its surface is
 * cut into unit squares; it is a closed surface of genus g.
 */
export function tunnelSlab(g: number): QuadSurface & { cells: [number, number][]; W: number; H: number } {
	const W = Math.max(3, 2 * g + 1);
	return slab(W, 3, Array.from({ length: g }, (_, i) => [2 * i + 1, 1] as [number, number]));
}

/** A W × H slab of unit cubes with the given cells drilled out (holes must not touch). */
export function slab(W: number, H: number, holes: [number, number][]): QuadSurface & { cells: [number, number][]; W: number; H: number } {
	const holeSet = new Set(holes.map(([x, y]) => `${x},${y}`));
	const hole = (x: number, y: number) => holeSet.has(`${x},${y}`);
	const solid = (x: number, y: number, z: number) => x >= 0 && x < W && y >= 0 && y < H && z === 0 && !hole(x, y);
	const vid = new Map<string, number>();
	const pos: V3[] = [];
	const V = (x: number, y: number, z: number) => {
		const k = `${x},${y},${z}`;
		if (!vid.has(k)) {
			vid.set(k, pos.length);
			pos.push([x, z, y]); // y is "up" in the 3D figure: slab lies flat
		}
		return vid.get(k)!;
	};
	const faces: number[][] = [];
	const cells: [number, number][] = [];
	for (let x = 0; x < W; x++)
		for (let y = 0; y < H; y++) {
			if (!solid(x, y, 0)) continue;
			cells.push([x, y]);
			// six neighbours: add the shared square when the neighbour is empty.
			// Loops are listed so the outward normal follows the right-hand rule in (x, y, z).
			if (!solid(x, y, 1)) faces.push([V(x, y, 1), V(x + 1, y, 1), V(x + 1, y + 1, 1), V(x, y + 1, 1)]);
			if (!solid(x, y, -1)) faces.push([V(x, y, 0), V(x, y + 1, 0), V(x + 1, y + 1, 0), V(x + 1, y, 0)]);
			if (!solid(x + 1, y, 0)) faces.push([V(x + 1, y, 0), V(x + 1, y + 1, 0), V(x + 1, y + 1, 1), V(x + 1, y, 1)]);
			if (!solid(x - 1, y, 0)) faces.push([V(x, y, 0), V(x, y, 1), V(x, y + 1, 1), V(x, y + 1, 0)]);
			if (!solid(x, y + 1, 0)) faces.push([V(x, y + 1, 0), V(x, y + 1, 1), V(x + 1, y + 1, 1), V(x + 1, y + 1, 0)]);
			if (!solid(x, y - 1, 0)) faces.push([V(x, y, 0), V(x + 1, y, 0), V(x + 1, y, 1), V(x, y, 1)]);
		}
	return { pos, faces, cells, W, H };
}
