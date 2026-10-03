import type { GlossaryEntry } from './types';

const chapter = 'topology/euler-characteristic';

export const entries: GlossaryEntry[] = [
	{
		key: 'euler-characteristic',
		term: 'Euler characteristic (χ)',
		def: 'The alternating count \\(\\chi = n_0 - n_1 + n_2 - \\cdots\\) of the vertices, edges, faces, … of a complex — for a polyhedron, \\(V - E + F\\). It depends only on the space, not on how it is cut up: \\(\\chi(S^2) = 2\\), \\(\\chi(T^2) = 0\\), \\(\\chi(\\RP^2) = 1\\).',
		chapter,
		anchor: 'def-euler-characteristic',
		see: ['eulers-polyhedron-formula', 'classification-by-euler-characteristic']
	},
	{
		key: 'eulers-polyhedron-formula',
		term: 'Euler’s polyhedron formula',
		def: '\\(V - E + F = 2\\) for every polyhedron whose surface is a sphere in disguise (for instance every convex polyhedron). Announced by Euler in 1750, published in 1758.',
		chapter,
		anchor: 'thm-euler',
		see: ['euler-characteristic', 'polyhedron']
	},
	{
		key: 'polyhedron',
		term: 'Polyhedron',
		def: 'A solid whose surface is made of flat polygons (faces) joined along straight edges, which meet at corners (vertices). For counting, every face should be a disk, and every edge should border exactly two faces.',
		chapter,
		anchor: 'a-curious-count',
		see: ['convex', 'platonic-solids']
	},
	{
		key: 'convex',
		term: 'Convex',
		def: 'A solid is convex if the straight segment between any two of its points stays inside it — it has no dents or tunnels. Every convex polyhedron has \\(V - E + F = 2\\).',
		chapter,
		anchor: 'eulers-formula',
		see: ['polyhedron']
	},
	{
		key: 'platonic-solids',
		term: 'Platonic solids',
		def: 'The five convex polyhedra whose faces are identical regular polygons with the same number at each corner: tetrahedron, cube, octahedron, dodecahedron and icosahedron.',
		chapter,
		anchor: 'a-curious-count',
		see: ['polyhedron']
	},
	{
		key: 'angle-defect',
		term: 'Angle defect',
		def: 'At a corner of a polyhedron, the amount by which the angles of the faces meeting there fall short of a full turn of \\(360°\\). A cube has defect \\(90°\\) at each corner; a corner can also have negative defect.',
		chapter,
		anchor: 'eulers-formula',
		see: ['descartes-theorem']
	},
	{
		key: 'descartes-theorem',
		term: 'Descartes’s theorem (total angle defect)',
		def: 'The angle defects of a convex polyhedron add up to exactly \\(720°\\). More generally, for any closed polyhedral surface they add up to \\(360° \\times \\chi\\) — a discrete version of the Gauss–Bonnet theorem.',
		chapter,
		anchor: 'eulers-formula',
		see: ['angle-defect', 'euler-characteristic']
	},
	{
		key: 'schlegel-diagram',
		term: 'Flattened polyhedron (Schlegel diagram)',
		def: 'The flat network obtained by removing one face of a polyhedron and stretching the rest out on the plane; the removed face becomes the outside region. Used in Cauchy’s proof of Euler’s formula.',
		chapter,
		anchor: 'cauchys-proof',
		see: ['eulers-polyhedron-formula']
	},
	{
		key: 'planar-graph',
		term: 'Planar graph',
		def: 'A graph that can be drawn in the plane without any crossing edges. A connected planar drawing has \\(V - E + F = 2\\) (counting the outside as a face), which shows that \\(K_5\\) is not planar.',
		chapter,
		anchor: 'exercises',
		see: ['dual-graph']
	},
	{
		key: 'dual-graph',
		term: 'Dual graph',
		def: 'For a network drawn on a sphere or in the plane: the graph with one vertex in each face, and one edge crossing each edge of the original. Used in the "two trees" proof of Euler’s formula.',
		chapter,
		anchor: 'two-trees',
		see: ['planar-graph']
	},
	{
		key: 'subdivision-moves',
		term: 'Subdivision moves',
		def: 'Three ways to cut a surface more finely: split an edge (\\(+1\\) vertex, \\(+1\\) edge), cut a face with a new edge (\\(+1\\) edge, \\(+1\\) face), or put a vertex in a \\(k\\)-sided face (\\(+1\\), \\(+k\\), \\(+(k-1)\\)). None of them changes \\(V - E + F\\).',
		chapter,
		anchor: 'invariance',
		see: ['euler-characteristic']
	},
	{
		key: 'toroidal-polyhedron',
		term: 'Polyhedron with tunnels (Lhuilier’s frame)',
		def: 'A polyhedron with holes through it, like a square picture frame (\\(16 - 32 + 16 = 0\\)), pointed out by Lhuilier in 1813. Each tunnel lowers \\(V - E + F\\) by 2, so \\(g\\) tunnels give \\(2 - 2g\\).',
		chapter,
		anchor: 'tunnels',
		see: ['euler-characteristic']
	},
	{
		key: 'connected-sum-formula',
		term: 'Euler characteristic of a connected sum',
		def: '\\(\\chi(A \\# B) = \\chi(A) + \\chi(B) - 2\\) for closed surfaces: cutting out a disk lowers each \\(\\chi\\) by 1, and gluing along the circles changes nothing. Adding a handle lowers \\(\\chi\\) by 2.',
		chapter,
		anchor: 'every-surface',
		see: ['euler-characteristic']
	},
	{
		key: 'euler-characteristic-of-surfaces',
		term: 'χ of the closed surfaces',
		def: 'The orientable surface of genus \\(g\\) has \\(\\chi = 2 - 2g\\); the connected sum of \\(k\\) projective planes has \\(\\chi = 2 - k\\). A sphere with \\(b\\) holes cut out has \\(\\chi = 2 - b\\).',
		chapter,
		anchor: 'every-surface',
		see: ['euler-characteristic', 'classification-by-euler-characteristic']
	},
	{
		key: 'classification-by-euler-characteristic',
		term: 'Classification by χ and orientability',
		def: 'Two closed connected surfaces are homeomorphic exactly when both are orientable or both are not, and they have the same Euler characteristic.',
		chapter,
		anchor: 'thm-classification',
		see: ['euler-characteristic-of-surfaces']
	},
	{
		key: 'euler-characteristic-of-a-graph',
		term: 'Euler characteristic of a graph',
		def: '\\(\\chi = V - E\\), which equals the number of connected pieces minus the number of independent loops. A tree has \\(\\chi = 1\\); a circle has \\(\\chi = 0\\).',
		chapter,
		anchor: 'graphs',
		see: ['euler-characteristic']
	},
	{
		key: 'heawood-bound',
		term: 'Vertex bound for triangulated surfaces',
		def: 'A triangulated closed surface has \\(E = 3(V - \\chi)\\) edges, and at most \\(\\binom{V}{2}\\) are possible; so a torus needs at least 7 vertices, a projective plane 6, a sphere 4.',
		chapter,
		anchor: 'classification',
		see: ['euler-characteristic']
	},
	{
		key: 'topological-invariant-chi',
		term: 'Invariance of χ',
		def: 'Homeomorphic finite complexes have the same Euler characteristic, so \\(\\chi(X)\\) is a number attached to the space \\(X\\) itself. The general proof uses homology: \\(\\chi = b_0 - b_1 + b_2 - \\cdots\\).',
		chapter,
		anchor: 'thm-invariance',
		see: ['euler-characteristic']
	}
];
