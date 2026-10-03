// A polygonal surface that can be subdivided — the engine of the "subdivision
// playground" in §2.6. Faces are vertex loops with a consistent orientation.
import type { V3 } from './polyhedra';

export interface PolyMesh {
	pos: V3[];
	faces: number[][];
}

export type Move = 'split-edge' | 'diagonal' | 'star';

const mid = (a: V3, b: V3): V3 => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: V3) => Math.hypot(a[0], a[1], a[2]);

export function meshEdges(m: PolyMesh): [number, number][] {
	const s = new Map<string, [number, number]>();
	for (const f of m.faces)
		for (let i = 0; i < f.length; i++) {
			const a = f[i];
			const b = f[(i + 1) % f.length];
			const e: [number, number] = a < b ? [a, b] : [b, a];
			s.set(e.join(','), e);
		}
	return [...s.values()];
}

export function meshCounts(m: PolyMesh) {
	const V = m.pos.length;
	const E = meshEdges(m).length;
	const F = m.faces.length;
	return { V, E, F, chi: V - E + F };
}

/** Add a new vertex in the middle of edge {a, b}. */
export function splitEdge(m: PolyMesh, a: number, b: number): PolyMesh {
	const w = m.pos.length;
	const pos = [...m.pos, mid(m.pos[a], m.pos[b])];
	const faces = m.faces.map((f) => {
		const out: number[] = [];
		for (let i = 0; i < f.length; i++) {
			const x = f[i];
			const y = f[(i + 1) % f.length];
			out.push(x);
			if ((x === a && y === b) || (x === b && y === a)) out.push(w);
		}
		return out;
	});
	return { pos, faces };
}

/** Add a vertex at the centre of face fi and join it to every corner. */
export function starFace(m: PolyMesh, fi: number): PolyMesh {
	const f = m.faces[fi];
	const c: V3 = [0, 0, 0];
	for (const v of f) for (let k = 0; k < 3; k++) c[k] += m.pos[v][k] / f.length;
	const w = m.pos.length;
	const fan = f.map((v, i) => [w, v, f[(i + 1) % f.length]]);
	return { pos: [...m.pos, c], faces: [...m.faces.slice(0, fi), ...fan, ...m.faces.slice(fi + 1)] };
}

function polyArea(pos: V3[], loop: number[]) {
	const s: V3 = [0, 0, 0];
	for (let i = 0; i < loop.length; i++) {
		const c = cross(pos[loop[i]], pos[loop[(i + 1) % loop.length]]);
		s[0] += c[0];
		s[1] += c[1];
		s[2] += c[2];
	}
	return norm(s) / 2;
}

/**
 * The best diagonal of face fi: two corners that are not neighbours and do not
 * lie on a common side, splitting the face as evenly as possible.
 * Returns null if the face has no diagonal (a triangle, or all corners on 3 sides).
 */
export function bestDiagonal(m: PolyMesh, fi: number): [number, number] | null {
	const f = m.faces[fi];
	const k = f.length;
	if (k < 4) return null;
	const existing = new Set(meshEdges(m).map((e) => e.join(',')));
	let best: [number, number] | null = null;
	let bestScore = -1;
	for (let i = 0; i < k; i++)
		for (let j = i + 2; j < k; j++) {
			if (i === 0 && j === k - 1) continue;
			const a = f[i];
			const b = f[j];
			if (existing.has((a < b ? [a, b] : [b, a]).join(','))) continue;
			const A1 = polyArea(m.pos, f.slice(i, j + 1));
			const A2 = polyArea(m.pos, [...f.slice(j), ...f.slice(0, i + 1)]);
			const total = A1 + A2;
			if (A1 < total * 1e-3 || A2 < total * 1e-3) continue; // runs along a side
			const score = Math.min(A1, A2) * norm(sub(m.pos[a], m.pos[b]));
			if (score > bestScore) {
				bestScore = score;
				best = [i, j];
			}
		}
	return best ? [f[best[0]], f[best[1]]] : null;
}

/** Cut face fi in two along its best diagonal (no change if there is none). */
export function addDiagonal(m: PolyMesh, fi: number): PolyMesh | null {
	const d = bestDiagonal(m, fi);
	if (!d) return null;
	const f = m.faces[fi];
	const i = f.indexOf(d[0]);
	const j = f.indexOf(d[1]);
	const f1 = f.slice(i, j + 1);
	const f2 = [...f.slice(j), ...f.slice(0, i + 1)];
	return { pos: m.pos, faces: [...m.faces.slice(0, fi), f1, f2, ...m.faces.slice(fi + 1)] };
}

/** Every edge is used by exactly two faces, once in each direction. */
export function isClosedOrientedSurface(m: PolyMesh): boolean {
	const dir = new Map<string, number>();
	for (const f of m.faces)
		for (let i = 0; i < f.length; i++) {
			const k = `${f[i]}>${f[(i + 1) % f.length]}`;
			dir.set(k, (dir.get(k) ?? 0) + 1);
		}
	for (const [k, n] of dir) {
		if (n !== 1) return false;
		const [a, b] = k.split('>');
		if (dir.get(`${b}>${a}`) !== 1) return false;
	}
	return true;
}
