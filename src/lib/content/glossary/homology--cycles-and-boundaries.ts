import type { GlossaryEntry } from './types';

const chapter = 'homology/cycles-and-boundaries';

export const entries: GlossaryEntry[] = [
	{
		key: 'hole',
		term: 'Hole',
		def: 'Informally, an empty place surrounded by a shape. Precisely, a *k*-dimensional hole is detected by a *k*-cycle that is not a boundary: a loop (or closed surface) that is not the rim of anything in the space. Holes are counted by classes of homologous cycles.',
		chapter,
		anchor: 'what-is-a-hole',
		see: ['cycle', 'boundary', 'homologous']
	},
	{
		key: 'graph',
		term: 'Graph',
		def: 'A collection of points called vertices together with edges, each joining two different vertices. A graph is a simplicial complex with no triangles.',
		chapter,
		anchor: 'loops-in-a-graph'
	},
	{
		key: 'vertex-degree',
		term: 'Degree (of a vertex in a set of edges)',
		def: 'The number of edges of the set that touch the vertex.',
		chapter,
		anchor: 'def-cycle',
		see: ['loose-end', 'cycle']
	},
	{
		key: 'loose-end',
		term: 'Loose end',
		def: 'A vertex of odd degree in a set of edges. A path has loose ends at its two endpoints; a cycle has none. Mod 2, the loose ends of a set of edges are exactly its boundary.',
		chapter,
		anchor: 'def-cycle'
	},
	{
		key: 'closed-walk',
		term: 'Closed walk',
		def: 'A route along the edges of a graph that ends where it started. Forgetting the start and the direction, and recording only which edges are used, turns a closed walk into a cycle.',
		chapter,
		anchor: 'loops-in-a-graph'
	},
	{
		key: 'cycle',
		term: 'Cycle',
		def: 'In a graph (mod 2): a set of edges in which every vertex has even degree — no loose ends. More generally, a *k*-cycle is a collection of *k*-dimensional pieces with no loose \\((k-1)\\)-dimensional pieces; in symbols, a chain with zero boundary.',
		chapter,
		anchor: 'def-cycle',
		see: ['boundary', 'hole']
	},
	{
		key: 'zero-cycle',
		term: 'Zero cycle',
		def: 'The empty set of edges (or simplices). Every vertex has degree 0, which is even, so it is a cycle; it plays the role of the number 0 when cycles are added.',
		chapter,
		anchor: 'def-cycle'
	},
	{
		key: 'symmetric-difference',
		term: 'Symmetric difference',
		def: 'For sets \\(A\\) and \\(B\\), the set \\(A \\mathbin{\\triangle} B\\) of elements in exactly one of them. It is the addition of edge sets (and of chains) mod 2: whatever is shared cancels.',
		chapter,
		anchor: 'def-symmetric-difference'
	},
	{
		key: 'cycle-space',
		term: 'Cycle space',
		def: 'The set of all cycles of a graph, added by symmetric difference. It is a vector space over \\(\\Z/2\\) whose dimension is \\(b_1 = E - V + c\\).',
		chapter,
		anchor: 'def-cycle-space',
		see: ['cycle-rank']
	},
	{
		key: 'tree',
		term: 'Tree',
		def: 'A connected graph with no nonempty cycles. A tree with \\(V\\) vertices has \\(V - 1\\) edges, and any two of its vertices are joined by exactly one path.',
		chapter,
		anchor: 'def-tree'
	},
	{
		key: 'spanning-tree',
		term: 'Spanning tree',
		def: 'A tree made of some of the edges of a connected graph that reaches every vertex. Every connected graph has one.',
		chapter,
		anchor: 'def-tree',
		see: ['fundamental-cycle']
	},
	{
		key: 'fundamental-cycle',
		term: 'Fundamental cycle',
		def: 'For a spanning tree and an edge \\(e\\) outside it: the cycle formed by \\(e\\) and the tree path joining its ends. The fundamental cycles of a spanning tree form a basis of the cycle space.',
		chapter,
		anchor: 'def-fundamental-cycle'
	},
	{
		key: 'kirchhoff-formula',
		term: 'Kirchhoff’s formula',
		def: 'A graph with \\(V\\) vertices, \\(E\\) edges and \\(c\\) connected pieces has \\(b_1 = E - V + c\\) independent cycles (Kirchhoff, 1847). Rearranged: \\(V - E = b_0 - b_1\\).',
		chapter,
		anchor: 'thm-kirchhoff'
	},
	{
		key: 'cycle-rank',
		term: 'Cycle rank (b₁ of a graph)',
		def: 'The number \\(b_1 = E - V + c\\) of independent cycles of a graph, also called its cyclomatic number or first Betti number.',
		chapter,
		anchor: 'thm-kirchhoff',
		see: ['kirchhoff-formula']
	},
	{
		key: 'rim',
		term: 'Rim (of a region)',
		def: 'For a set of filled triangles: the edges that are sides of an odd number of them. Shared inner sides cancel. The rim of any region is a cycle.',
		chapter,
		anchor: 'def-boundary'
	},
	{
		key: 'boundary',
		term: 'Boundary',
		def: 'A cycle that is the rim of something filled in: in dimension 1, the rim of a set of filled triangles; in dimension *k*, the rim of a collection of \\((k+1)\\)-dimensional pieces. Every boundary is a cycle; the converse fails exactly where there are holes.',
		chapter,
		anchor: 'def-boundary',
		see: ['cycle', 'hole', 'homologous']
	},
	{
		key: 'homologous',
		term: 'Homologous cycles',
		def: 'Two cycles \\(z, z\'\\) are homologous, \\(z \\sim z\'\\), if together they bound: \\(z + z\'\\) (with integers, \\(z - z\'\\)) is a boundary. Picture: they sweep out a surface between them.',
		chapter,
		anchor: 'def-homologous'
	},
	{
		key: 'null-homologous',
		term: 'Null-homologous',
		def: 'Homologous to the zero cycle — that is, a boundary.',
		chapter,
		anchor: 'def-homologous'
	},
	{
		key: 'meridian',
		term: 'Meridian (of a torus)',
		def: 'A loop going once around the tube of a torus. It bounds nothing on the hollow torus, but on a solid torus it bounds a disk-shaped slice.',
		chapter,
		anchor: 'sphere-and-torus',
		see: ['longitude']
	},
	{
		key: 'longitude',
		term: 'Longitude (of a torus)',
		def: 'A loop going once around the central hole of a torus. Together with the meridian it gives the two independent holes of the torus surface: \\(b_1(T^2) = 2\\).',
		chapter,
		anchor: 'sphere-and-torus',
		see: ['meridian']
	},
	{
		key: 'two-cycle',
		term: '2-cycle',
		def: 'A set of triangles in which every edge is a side of an even number of them — a closed surface, such as the four faces of a hollow tetrahedron.',
		chapter,
		anchor: 'def-k-cycle'
	},
	{
		key: 'void',
		term: 'Void',
		def: 'A 2-dimensional hole: a cavity enclosed by a 2-cycle that is not the rim of anything in the space. The hollow sphere has one void; filling in the solid ball removes it.',
		chapter,
		anchor: 'def-k-cycle'
	},
	{
		key: 'k-cycle',
		term: 'k-cycle and k-boundary',
		def: 'A *k*-cycle is a collection of *k*-dimensional pieces with no loose \\((k-1)\\)-dimensional pieces; a *k*-boundary is the rim of a collection of filled \\((k+1)\\)-dimensional pieces. A *k*-dimensional hole is a *k*-cycle that is not a *k*-boundary.',
		chapter,
		anchor: 'def-k-cycle'
	},
	{
		key: 'konigsberg',
		term: 'Bridges of Königsberg',
		def: 'Euler’s 1736 puzzle: a round trip crossing each of seven bridges once is impossible, because a closed walk must touch every land mass an even number of times. The first instance of the parity test for cycles.',
		chapter,
		anchor: 'loops-in-a-graph'
	}
];
