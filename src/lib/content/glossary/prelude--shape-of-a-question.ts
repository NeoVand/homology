import type { GlossaryEntry } from './types';

export const entries: GlossaryEntry[] = [
	{
		key: 'topology',
		term: 'Topology',
		def: 'The study of the properties of shapes that survive stretching, bending and squeezing — but not tearing or gluing.',
		chapter: 'prelude/shape-of-a-question'
	},
	{
		key: 'invariant',
		term: 'Topological invariant',
		def: 'A quantity or property of a shape that no allowed deformation can change, such as the number of pieces or the Euler characteristic. If two shapes have different invariants, they are not the same shape.',
		chapter: 'prelude/shape-of-a-question',
		see: ['topology']
	},
	{
		key: 'cohomology',
		term: 'Cohomology',
		def: 'The “dual” of homology: instead of collecting pieces of a shape, it attaches measurements to them, and its groups \\(H^n(X)\\) record the obstructions to fitting local measurements together into global ones.',
		chapter: 'prelude/shape-of-a-question'
	}
];
