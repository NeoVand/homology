import { describe, expect, it } from 'vitest';
import { checkDrawing, closeUnderFaces, type Drawing, type Pt } from './builder';

const D = (pts: Record<number, Pt>, simplices: number[][]): Drawing => ({
	verts: new Map(Object.entries(pts).map(([k, v]) => [Number(k), v])),
	simplices: simplices.map((s) => [...s].sort((a, b) => a - b))
});
const kinds = (d: Drawing) => checkDrawing(d).map((p) => p.kind).sort();

describe('complex builder rules', () => {
	it('accepts good complexes', () => {
		// two triangles sharing an edge
		const two = D(
			{ 0: [0, 0], 1: [100, 0], 2: [50, 80], 3: [150, 80] },
			closeUnderFaces([
				[0, 1, 2],
				[1, 2, 3]
			])
		);
		expect(kinds(two)).toEqual([]);
		// a bow-tie: two triangles sharing one vertex
		const bow = D(
			{ 0: [0, 0], 1: [0, 100], 2: [100, 50], 3: [200, 0], 4: [200, 100] },
			closeUnderFaces([
				[0, 1, 2],
				[2, 3, 4]
			])
		);
		expect(kinds(bow)).toEqual([]);
		// a hollow triangle
		const hollow = D({ 0: [0, 0], 1: [100, 0], 2: [50, 80] }, [
			[0, 1],
			[1, 2],
			[0, 2]
		]);
		expect(kinds(hollow)).toEqual([]);
	});
	it('rule 1: a triangle without its edges', () => {
		expect(kinds(D({ 0: [0, 0], 1: [100, 0], 2: [50, 80] }, [[0, 1, 2], [0, 1]]))).toEqual(['missing-face', 'missing-face']);
		expect(closeUnderFaces([[0, 1, 2]]).length).toBe(4);
	});
	it('rule 2: a vertex in the middle of an edge (T-junction)', () => {
		const t = D(
			{ 0: [0, 0], 1: [200, 0], 2: [100, 80], 3: [100, 0], 4: [100, -80] },
			closeUnderFaces([
				[0, 1, 2],
				[3, 4]
			])
		);
		expect(kinds(t)).toContain('vertex-on-edge');
	});
	it('rule 2: crossing edges, overlapping triangles, edge through a triangle', () => {
		const x = D({ 0: [0, 0], 1: [100, 100], 2: [0, 100], 3: [100, 0] }, [
			[0, 1],
			[2, 3]
		]);
		expect(kinds(x)).toEqual(['edges-cross']);
		const ov = D(
			{ 0: [0, 0], 1: [100, 0], 2: [50, 90], 3: [40, 30], 4: [150, 30], 5: [90, 120] },
			closeUnderFaces([
				[0, 1, 2],
				[3, 4, 5]
			])
		);
		expect(kinds(ov)).toContain('triangles-overlap');
		const through = D(
			{ 0: [0, 0], 1: [100, 0], 2: [50, 90], 3: [-20, 40], 4: [130, 40] },
			[...closeUnderFaces([[0, 1, 2]]), [3, 4]]
		);
		expect(kinds(through)).toContain('edge-through-triangle');
	});
	it('rule 2: folded triangles sharing an edge overlap', () => {
		const fold = D(
			{ 0: [0, 0], 1: [100, 0], 2: [50, 80], 3: [60, 40] },
			closeUnderFaces([
				[0, 1, 2],
				[0, 1, 3]
			])
		);
		expect(kinds(fold)).toContain('triangles-overlap');
	});
	it('flat triangles and stacked vertices are flagged', () => {
		expect(kinds(D({ 0: [0, 0], 1: [50, 0], 2: [100, 0] }, closeUnderFaces([[0, 1, 2]])))).toContain('flat-triangle');
		expect(kinds(D({ 0: [0, 0], 1: [1, 1] }, []))).toEqual(['same-point']);
	});
	it('collinear edges sharing a vertex overlap', () => {
		const d = D({ 0: [0, 0], 1: [100, 0], 2: [200, 0] }, [
			[0, 1],
			[0, 2]
		]);
		expect(kinds(d)).toContain('edges-overlap');
	});
});
