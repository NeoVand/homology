import { describe, expect, it } from 'vitest';
import { smith, rankZ2 } from '$lib/math/linalg';
import { rowReduceSteps, smithSteps, rankOfSteps } from './matrixSteps';
import { hollowTetrahedron, projectivePlane, kleinGrid, torusGrid } from '../homology-groups/complexes';

const mats = {
	sphere: hollowTetrahedron().K.boundaryMatrix(2),
	rp2: projectivePlane().K.boundaryMatrix(2),
	klein: kleinGrid().K.boundaryMatrix(2),
	torus: torusGrid().K.boundaryMatrix(2)
};

describe('row reduction steps', () => {
	it('ranks over ℤ/2 and ℚ match the engine', () => {
		for (const M of Object.values(mats)) {
			expect(rankOfSteps(rowReduceSteps(M, 'Z2'))).toBe(rankZ2(M));
			expect(rankOfSteps(rowReduceSteps(M, 'Q'))).toBe(smith(M).rank);
		}
		expect(rankOfSteps(rowReduceSteps(mats.rp2, 'Z2'))).toBe(9);
		expect(rankOfSteps(rowReduceSteps(mats.rp2, 'Q'))).toBe(10);
		expect(rankOfSteps(rowReduceSteps(mats.klein, 'Z2'))).toBe(17);
		expect(rankOfSteps(rowReduceSteps(mats.klein, 'Q'))).toBe(18);
		expect(rankOfSteps(rowReduceSteps(mats.sphere, 'Q'))).toBe(3);
	});
	it('over ℚ the boundary matrices stay integral, with a last pivot 2 for ℝP² and the Klein bottle', () => {
		for (const key of ['rp2', 'klein'] as const) {
			const s = rowReduceSteps(mats[key], 'Q');
			const last = s[s.length - 1];
			expect(last.cells.flat().every((c) => !c.includes('/'))).toBe(true);
			const [r, c] = last.done[last.done.length - 1];
			expect(Math.abs(last.values[r][c])).toBe(2);
		}
	});
});

describe('Smith normal form steps', () => {
	it('final diagonal equals smith() for every matrix', () => {
		for (const M of Object.values(mats)) {
			const { diagonal, steps } = smithSteps(M);
			expect(diagonal).toEqual(smith(M).diagonal);
			const last = steps[steps.length - 1];
			// the final matrix is diagonal
			last.values.forEach((row, i) => row.forEach((x, j) => (i !== j ? expect(x).toBe(0) : null)));
		}
		expect(smithSteps(mats.rp2).diagonal).toEqual([1, 1, 1, 1, 1, 1, 1, 1, 1, 2]);
		expect(smithSteps(mats.klein).diagonal.filter((d) => d === 2).length).toBe(1);
		expect(smithSteps(mats.torus).diagonal.every((d) => d === 1)).toBe(true);
		expect(smithSteps(mats.sphere).diagonal).toEqual([1, 1, 1]);
	});
	it('small examples', () => {
		expect(smithSteps([[2, 4], [6, 8]]).diagonal).toEqual([2, 4]);
		expect(smithSteps([[2], [0]]).diagonal).toEqual([2]);
	});
	it('report sizes', () => {
		console.log('rp2 smith steps', smithSteps(mats.rp2).steps.length, 'klein', smithSteps(mats.klein).steps.length);
		console.log('rp2 row steps', rowReduceSteps(mats.rp2, 'Z2').length, rowReduceSteps(mats.rp2, 'Q').length);
	});
});
