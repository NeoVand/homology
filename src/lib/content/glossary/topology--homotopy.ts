import type { GlossaryEntry } from './types';

const chapter = 'topology/homotopy';

export const entries: GlossaryEntry[] = [
	{
		key: 'path',
		term: 'Path',
		def: 'A continuous map \\(\\gamma\\colon [0,1] \\to X\\): a journey through the space \\(X\\) from \\(\\gamma(0)\\) to \\(\\gamma(1)\\), timing included. It may cross itself, double back or stand still.',
		chapter,
		anchor: 'def-path',
		see: ['path-connected', 'loop']
	},
	{
		key: 'reparametrization',
		term: 'Reparametrization',
		def: 'Re-timing a path without changing the trail it traces, for example running it twice as fast. Reparametrized paths are homotopic.',
		chapter,
		see: ['path', 'homotopy']
	},
	{
		key: 'homotopy',
		term: 'Homotopy',
		def: 'A continuous deformation of one map into another: a continuous \\(H\\colon X \\times [0,1] \\to Y\\) with \\(H(x,0) = f(x)\\) and \\(H(x,1) = g(x)\\). Think of it as a film whose frame at time \\(t\\) is the map \\(x \\mapsto H(x,t)\\).',
		chapter,
		anchor: 'def-homotopy',
		see: ['homotopic', 'path-homotopy']
	},
	{
		key: 'homotopic',
		term: 'Homotopic',
		def: 'Two maps \\(f, g\\colon X \\to Y\\) are homotopic, written \\(f \\simeq g\\), if there is a homotopy from one to the other. This is an equivalence relation.',
		chapter,
		anchor: 'def-homotopy',
		see: ['homotopy', 'homotopy-class']
	},
	{
		key: 'path-homotopy',
		term: 'Path homotopy',
		def: 'A homotopy between two paths with the same ends that keeps both ends fixed throughout ("relative to the endpoints").',
		chapter,
		anchor: 'def-path-homotopy',
		see: ['homotopy', 'fundamental-group']
	},
	{
		key: 'homotopy-class',
		term: 'Homotopy class',
		def: 'The equivalence class \\([f]\\) of a map (or of a path, with ends fixed) under the relation "is homotopic to".',
		chapter,
		see: ['homotopic']
	},
	{
		key: 'straight-line-homotopy',
		term: 'Straight-line homotopy',
		def: 'The homotopy \\(H(x,t) = (1-t)\\,f(x) + t\\,g(x)\\) between two maps into a convex subset of \\(\\R^n\\): every point slides along a straight segment.',
		chapter,
		see: ['homotopy', 'convex-set']
	},
	{
		key: 'convex-set',
		term: 'Convex set',
		def: 'A subset of \\(\\R^n\\) that contains the straight segment between any two of its points, like a disk or a ball. Convex sets are contractible.',
		chapter,
		see: ['contractible']
	},
	{
		key: 'homotopy-equivalence',
		term: 'Homotopy equivalence',
		def: 'A map \\(f\\colon X \\to Y\\) with a map \\(g\\colon Y \\to X\\) back such that \\(g \\circ f \\simeq \\id_X\\) and \\(f \\circ g \\simeq \\id_Y\\). Spaces joined by one are **homotopy equivalent**, written \\(X \\simeq Y\\): "the same shape in a broader sense".',
		chapter,
		anchor: 'def-homotopy-equivalence',
		see: ['homotopy-type', 'deformation-retraction']
	},
	{
		key: 'homotopy-type',
		term: 'Homotopy type',
		def: 'Two spaces have the same homotopy type when they are homotopy equivalent. A disk has the homotopy type of a point; an annulus, of a circle.',
		chapter,
		anchor: 'def-homotopy-equivalence',
		see: ['homotopy-equivalence']
	},
	{
		key: 'retraction',
		term: 'Retraction',
		def: 'A continuous map \\(r\\colon X \\to A\\) onto a subspace \\(A\\) that fixes every point of \\(A\\).',
		chapter,
		see: ['deformation-retraction']
	},
	{
		key: 'deformation-retraction',
		term: 'Deformation retraction',
		def: 'A homotopy that starts at the identity of \\(X\\), ends with everything inside a subspace \\(A\\), and never moves the points of \\(A\\). Then \\(A \\simeq X\\). Example: the punctured plane onto a circle.',
		chapter,
		anchor: 'def-deformation-retraction',
		see: ['homotopy-equivalence', 'retraction']
	},
	{
		key: 'contractible',
		term: 'Contractible',
		def: 'A space homotopy equivalent to a point; equivalently, its identity map is homotopic to a constant map. \\(\\R^n\\), disks and trees are contractible; circles and spheres are not.',
		chapter,
		anchor: 'def-contractible',
		see: ['homotopy-equivalence', 'simply-connected']
	},
	{
		key: 'null-homotopic',
		term: 'Null-homotopic',
		def: 'Homotopic to a constant map. A loop is null-homotopic when it can be shrunk to its basepoint within the space — equivalently, when it is the rim of a disk mapped into the space.',
		chapter,
		anchor: 'prop-shrink-fill',
		see: ['loop', 'simply-connected']
	},
	{
		key: 'loop',
		term: 'Loop',
		def: 'A path that starts and ends at the same point \\(x_0\\), the basepoint.',
		chapter,
		anchor: 'def-loop',
		see: ['path', 'fundamental-group']
	},
	{
		key: 'basepoint',
		term: 'Basepoint',
		def: 'A chosen point \\(x_0\\) of a space at which all loops start and end, needed to define the fundamental group \\(\\pi_1(X, x_0)\\).',
		chapter,
		see: ['loop', 'fundamental-group']
	},
	{
		key: 'concatenation',
		term: 'Concatenation of paths',
		def: 'Doing one path and then another, each at double speed: \\((\\alpha\\cdot\\beta)(s) = \\alpha(2s)\\) for \\(s \\le \\tfrac12\\) and \\(\\beta(2s-1)\\) for \\(s \\ge \\tfrac12\\). It is the multiplication of the fundamental group.',
		chapter,
		anchor: 'def-concatenation',
		see: ['fundamental-group', 'inverse-path']
	},
	{
		key: 'inverse-path',
		term: 'Inverse (reverse) path',
		def: 'The same journey run backwards: \\(\\bar\\alpha(s) = \\alpha(1-s)\\). A loop followed by its reverse is homotopic to the constant loop.',
		chapter,
		anchor: 'def-concatenation',
		see: ['concatenation']
	},
	{
		key: 'fundamental-group',
		term: 'Fundamental group',
		def: 'The group \\(\\pi_1(X, x_0)\\) of homotopy classes of loops at \\(x_0\\), multiplied by concatenation. It records the one-dimensional holes of \\(X\\); for example \\(\\pi_1(S^1) \\cong \\Z\\).',
		chapter,
		anchor: 'def-fundamental-group',
		see: ['loop', 'simply-connected', 'abelianization']
	},
	{
		key: 'simply-connected',
		term: 'Simply connected',
		def: 'Path-connected with trivial fundamental group: every loop can be shrunk to a point. The sphere \\(S^2\\) is simply connected but not contractible.',
		chapter,
		anchor: 'def-simply-connected',
		see: ['fundamental-group', 'contractible']
	},
	{
		key: 'winding-number',
		term: 'Winding number',
		def: 'The net number of times a loop in the punctured plane (or the circle) goes round, counter-clockwise counted positive. It gives the isomorphism \\(\\pi_1(S^1) \\cong \\Z\\).',
		chapter,
		anchor: 'def-winding-number',
		see: ['lift', 'fundamental-group']
	},
	{
		key: 'lift',
		term: 'Lift (of a path)',
		def: 'For a path in the circle, the continuous choice of its angle as a real number, as if walking a spiral staircase above the circle. The total climb of a loop’s lift is its winding number.',
		chapter,
		anchor: 'def-winding-number',
		see: ['winding-number']
	},
	{
		key: 'free-group',
		term: 'Free group',
		def: 'The group of reduced words in some letters and their inverses, multiplied by joining words and cancelling. The fundamental group of the figure eight is the free group on two letters \\(a, b\\); it is not abelian.',
		chapter,
		see: ['reduced-word', 'commutator']
	},
	{
		key: 'reduced-word',
		term: 'Reduced word',
		def: 'A word in letters and their inverses with no adjacent pair like \\(a\\,a^{-1}\\) left to cancel.',
		chapter,
		see: ['free-group']
	},
	{
		key: 'commutator',
		term: 'Commutator',
		def: 'The element \\(aba^{-1}b^{-1}\\) of a group; it is the identity exactly when \\(a\\) and \\(b\\) commute. On the figure eight it is a loop that cannot be shrunk although it goes round each circle zero times net.',
		chapter,
		see: ['free-group', 'abelianization']
	},
	{
		key: 'abelianization',
		term: 'Abelianization',
		def: 'Making a group commutative in the most economical way (dividing by the subgroup generated by commutators). For a free group it keeps only the exponent sum of each letter. \\(H_1(X)\\) is the abelianized \\(\\pi_1(X)\\) (Hurewicz).',
		chapter,
		see: ['fundamental-group', 'commutator']
	},
	{
		key: 'homotopy-invariant',
		term: 'Homotopy invariant',
		def: 'A quantity attached to spaces that is the same for homotopy-equivalent spaces, such as the fundamental group or, later, homology. It may be computed on the simplest space of a homotopy type.',
		chapter,
		see: ['homotopy-equivalence', 'fundamental-group']
	}
];
