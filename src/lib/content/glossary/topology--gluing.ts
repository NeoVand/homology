import type { GlossaryEntry } from './types';

const chapter = 'topology/gluing';

export const entries: GlossaryEntry[] = [
	{
		key: 'quotient-topology',
		term: 'Quotient topology',
		def: 'The topology on a glued set \\(X/{\\sim}\\) in which \\(U\\) is open exactly when its preimage \\(q^{-1}(U)\\) is open in \\(X\\): look back before the glue.',
		chapter,
		anchor: 'def-quotient',
		see: ['quotient-space', 'quotient-set', 'quotient-projection']
	},
	{
		key: 'quotient-space',
		term: 'Quotient space',
		def: 'A quotient set \\(X/{\\sim}\\) with the quotient topology — the space obtained from \\(X\\) by gluing equivalent points together.',
		chapter,
		anchor: 'def-quotient',
		see: ['quotient-topology']
	},
	{
		key: 'gluing-diagram',
		term: 'Gluing diagram',
		def: 'A polygon whose edges carry letters and arrows; edges with the same letter are glued so that their arrows match. Unlabelled edges stay free and form the boundary.',
		chapter,
		anchor: 'gluing-diagrams',
		see: ['edge-word', 'corner-class']
	},
	{
		key: 'edge-word',
		term: 'Edge word',
		def: 'The letters read once around a gluing diagram (here anticlockwise from the bottom-left corner), written \\(x\\) along an arrow and \\(x^{-1}\\) against it; e.g. \\(aba^{-1}b^{-1}\\) for the torus.',
		chapter,
		see: ['gluing-diagram']
	},
	{
		key: 'corner-class',
		term: 'Corner class',
		def: 'A set of corners of a gluing diagram that end up as one point of the glued surface. The torus square has one corner class, the sphere square three.',
		chapter,
		see: ['gluing-diagram']
	},
	{
		key: 'cylinder',
		term: 'Cylinder',
		def: 'The square with one pair of opposite edges glued straight across, \\((0,y)\\sim(1,y)\\); also the product \\(S^1 \\times [0,1]\\). It has two boundary circles.',
		chapter,
		see: ['mobius-band']
	},
	{
		key: 'mobius-band',
		term: 'Möbius band',
		def: 'The square with one pair of opposite edges glued with a flip, \\((0,y)\\sim(1,1-y)\\). It has a single boundary circle and only one side.',
		chapter,
		see: ['cylinder', 'klein-bottle']
	},
	{
		key: 'torus',
		term: 'Torus',
		def: 'The surface of a doughnut, \\(T^2 = S^1 \\times S^1\\): the square with both pairs of opposite edges glued straight across, word \\(aba^{-1}b^{-1}\\).',
		chapter,
		see: ['klein-bottle', 'gluing-diagram']
	},
	{
		key: 'klein-bottle',
		term: 'Klein bottle',
		def: 'The square with one pair of edges glued straight and the other with a flip, word \\(abab^{-1}\\). A closed one-sided surface that can be drawn in 3D only by letting it pass through itself.',
		chapter,
		see: ['torus', 'immersion']
	},
	{
		key: 'real-projective-plane',
		term: 'Real projective plane',
		def: '\\(\\RP^2\\): a disk with each rim point glued to the opposite one, or the square with word \\(abab\\); also the space of lines through a point of \\(\\R^3\\). One-sided; it immerses in \\(\\R^3\\) (e.g. as Boy’s surface) but does not embed.',
		chapter,
		see: ['boys-surface', 'cross-cap']
	},
	{
		key: 'sphere',
		term: 'Sphere',
		def: '\\(S^n\\): the points at distance \\(1\\) from the origin in \\(\\R^{n+1}\\). \\(S^1\\) is the circle and \\(S^2\\) the ordinary sphere, which is also \\(D^2/\\partial D^2\\) and the square with word \\(abb^{-1}a^{-1}\\).',
		chapter,
		see: ['disk', 'collapse']
	},
	{
		key: 'disk',
		term: 'Disk (ball)',
		def: '\\(D^n\\): the points at distance at most \\(1\\) from the origin in \\(\\R^n\\). Its boundary \\(\\partial D^n\\) is the sphere \\(S^{n-1}\\).',
		chapter,
		see: ['sphere']
	},
	{
		key: 'embedding',
		term: 'Embedding',
		def: 'A one-to-one continuous map that is a homeomorphism onto its image: a faithful copy of one space inside another.',
		chapter,
		anchor: 'def-embedding',
		see: ['immersion']
	},
	{
		key: 'immersion',
		term: 'Immersion',
		def: 'A smooth map of a surface into space whose derivative is one-to-one at every point: near each point it is a faithful embedding, but different sheets may pass through each other along a double curve.',
		chapter,
		anchor: 'def-embedding',
		see: ['embedding', 'double-curve']
	},
	{
		key: 'double-curve',
		term: 'Double curve',
		def: 'The set where an immersed surface passes through itself — drawn in rose on the Klein bottle and Boy’s surface.',
		chapter,
		anchor: 'def-embedding',
		see: ['immersion']
	},
	{
		key: 'boys-surface',
		term: 'Boy’s surface',
		def: 'A smooth immersion of the projective plane in \\(\\R^3\\), found by Werner Boy in 1901, with three-fold symmetry and a single triple point.',
		chapter,
		see: ['real-projective-plane', 'cross-cap']
	},
	{
		key: 'cross-cap',
		term: 'Cross-cap',
		def: 'A model of the projective plane in \\(\\R^3\\): a hemisphere whose opposite rim points are zipped together along a segment ending in two pinch points.',
		chapter,
		see: ['real-projective-plane', 'boys-surface']
	},
	{
		key: 'disjoint-union',
		term: 'Disjoint union',
		def: 'Two spaces side by side, not touching: \\(X \\sqcup Y\\).',
		chapter,
		anchor: 'def-wedge',
		see: ['wedge-sum']
	},
	{
		key: 'wedge-sum',
		term: 'Wedge sum',
		def: '\\(X \\vee Y\\): the disjoint union with one chosen point of \\(X\\) glued to one chosen point of \\(Y\\). The wedge of two circles is the figure eight.',
		chapter,
		anchor: 'def-wedge',
		see: ['disjoint-union']
	},
	{
		key: 'collapse',
		term: 'Collapsing a subspace',
		def: '\\(X/A\\): the quotient of \\(X\\) in which all points of \\(A\\) are glued to a single point. For example \\(D^2/\\partial D^2 \\cong S^2\\).',
		chapter,
		anchor: 'def-collapse',
		see: ['cone', 'suspension']
	},
	{
		key: 'cone',
		term: 'Cone',
		def: '\\(CX = (X \\times [0,1])/(X \\times \\{1\\})\\): the cylinder over \\(X\\) with its top collapsed to a point. The cone on a circle is a disk.',
		chapter,
		anchor: 'def-cone',
		see: ['suspension', 'collapse']
	},
	{
		key: 'suspension',
		term: 'Suspension',
		def: '\\(\\Sigma X\\) (also \\(SX\\)): the cylinder over \\(X\\) with its top collapsed to one point and its bottom to another. \\(\\Sigma S^n \\cong S^{n+1}\\).',
		chapter,
		anchor: 'def-cone',
		see: ['cone']
	},
	{
		key: 'genus-g-surface',
		term: 'Surface with g handles',
		def: '\\(\\Sigma_g\\): the closed surface glued from a \\(4g\\)-gon with word \\(a_1b_1a_1^{-1}b_1^{-1}\\cdots a_gb_ga_g^{-1}b_g^{-1}\\) — a doughnut with \\(g\\) holes. Corners − edges + faces \\(= 2 - 2g\\).',
		chapter,
		see: ['torus', 'gluing-diagram']
	}
];
