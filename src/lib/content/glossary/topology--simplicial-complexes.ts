import type { GlossaryEntry } from './types';

const chapter = 'topology/simplicial-complexes';

export const entries: GlossaryEntry[] = [
	{
		key: 'simplex',
		term: 'Simplex',
		def: 'The simplest solid shape of a given dimension: an \\(n\\)-simplex is the filled-in shape spanned by \\(n+1\\) points in general position — a point (\\(n=0\\)), an edge, a triangle, a tetrahedron, …. Plural: simplices.',
		chapter,
		anchor: 'def-simplex',
		see: ['face', 'standard-simplex', 'simplicial-complex']
	},
	{
		key: 'general-position',
		term: 'General position (affinely independent)',
		def: 'Points \\(v_0, \\dots, v_n\\) are in general position if none of them lies on the line, plane or flat space through the others; then they span an honest \\(n\\)-simplex. Three points in a row are not in general position.',
		chapter,
		anchor: 'def-simplex',
		see: ['simplex']
	},
	{
		key: 'face',
		term: 'Face (of a simplex)',
		def: 'A simplex spanned by some (at least one) of the vertices of a given simplex. An \\(n\\)-simplex has \\(\\binom{n+1}{k+1}\\) faces of dimension \\(k\\) — row \\(n+1\\) of Pascal’s triangle — and \\(2^{n+1}-1\\) faces in all.',
		chapter,
		anchor: 'def-face',
		see: ['simplex']
	},
	{
		key: 'barycentric-coordinates',
		term: 'Barycentric coordinates',
		def: 'Numbers \\(t_0, \\dots, t_n \\ge 0\\) with \\(t_0 + \\dots + t_n = 1\\) describing the point \\(t_0 v_0 + \\dots + t_n v_n\\) of a simplex: the balance point of weights \\(t_i\\) hung at the corners. The non-zero coordinates name the face the point lies in.',
		chapter,
		anchor: 'barycentric-coordinates',
		see: ['barycentre', 'standard-simplex']
	},
	{
		key: 'barycentre',
		term: 'Barycentre',
		def: 'The centre of a simplex: the point whose barycentric coordinates are all equal, \\(\\tfrac{1}{n+1}\\). The barycentre of an edge is its midpoint.',
		chapter,
		anchor: 'barycentric-coordinates',
		see: ['barycentric-coordinates', 'barycentric-subdivision']
	},
	{
		key: 'standard-simplex',
		term: 'Standard simplex Δⁿ',
		def: 'The set of all lists \\((t_0, \\dots, t_n)\\) of real numbers with every \\(t_i \\ge 0\\) and \\(t_0 + \\dots + t_n = 1\\); the simplex in \\(\\R^{n+1}\\) spanned by the \\(n+1\\) unit coordinate points. Every \\(n\\)-simplex is a copy of it.',
		chapter,
		anchor: 'barycentric-coordinates',
		see: ['simplex', 'barycentric-coordinates']
	},
	{
		key: 'simplicial-complex',
		term: 'Simplicial complex',
		def: 'A finite collection of simplices such that every face of a simplex in it is also in it (rule 1), and any two of its simplices meet in a common face or not at all (rule 2).',
		chapter,
		anchor: 'def-simplicial-complex',
		see: ['simplex', 'abstract-simplicial-complex', 'triangulation']
	},
	{
		key: 'f-vector',
		term: 'f-vector',
		def: 'The list \\((n_0, n_1, n_2, \\dots)\\) of the numbers of vertices, edges, triangles, … of a simplicial (or cell) complex. The hollow tetrahedron has f-vector \\((4, 6, 4)\\).',
		chapter,
		anchor: 'simplicial-complexes',
		see: ['simplicial-complex']
	},
	{
		key: 'underlying-space',
		term: 'Underlying space |K|',
		def: 'The union of all the simplices of a simplicial complex \\(K\\): the actual set of points in space that the complex describes.',
		chapter,
		anchor: 'simplicial-complexes',
		see: ['simplicial-complex', 'triangulation']
	},
	{
		key: 'subcomplex',
		term: 'Subcomplex',
		def: 'A sub-collection of the simplices of a simplicial complex that is itself a simplicial complex (it contains all faces of its simplices).',
		chapter,
		anchor: 'simplicial-complexes',
		see: ['skeleton']
	},
	{
		key: 'skeleton',
		term: 'Skeleton (k-skeleton)',
		def: 'The part of a complex made of all its cells or simplices of dimension at most \\(k\\), written \\(K^{(k)}\\). The 1-skeleton of a hollow tetrahedron is a graph with 4 vertices and 6 edges.',
		chapter,
		anchor: 'simplicial-complexes',
		see: ['subcomplex', 'cw-complex']
	},
	{
		key: 'abstract-simplicial-complex',
		term: 'Abstract simplicial complex',
		def: 'A finite set of vertices with a collection of non-empty subsets (the simplices) that contains every single vertex and every non-empty subset of each of its sets. A shape stored as a list of vertex sets.',
		chapter,
		anchor: 'def-abstract',
		see: ['simplicial-complex', 'geometric-realisation', 'facet']
	},
	{
		key: 'facet',
		term: 'Facet (maximal simplex)',
		def: 'A simplex of a complex that is not a face of any larger simplex in it. Listing the facets describes the whole complex: the hollow triangle has facets \\(\\{0,1\\}, \\{0,2\\}, \\{1,2\\}\\).',
		chapter,
		anchor: 'abstract-complexes',
		see: ['abstract-simplicial-complex']
	},
	{
		key: 'geometric-realisation',
		term: 'Geometric realisation',
		def: 'A simplicial complex in space whose simplices correspond to the sets of a given abstract simplicial complex. Every finite abstract complex has one, and any two are homeomorphic.',
		chapter,
		anchor: 'abstract-complexes',
		see: ['abstract-simplicial-complex']
	},
	{
		key: 'triangulation',
		term: 'Triangulation',
		def: 'A simplicial complex \\(K\\) together with a homeomorphism from its underlying space \\(|K|\\) to a given space \\(X\\). The hollow tetrahedron is a triangulation of the sphere.',
		chapter,
		anchor: 'def-triangulation',
		see: ['simplicial-complex', 'mobius-torus']
	},
	{
		key: 'mobius-torus',
		term: 'Seven-vertex (Möbius) torus',
		def: 'The smallest triangulation of the torus: 7 vertices, 21 edges, 14 triangles \\(\\{i, i+1, i+3\\}\\), \\(\\{i, i+2, i+3\\}\\) (labels mod 7). Every pair of vertices is joined by an edge. Described by A. F. Möbius.',
		chapter,
		anchor: 'seven-vertex-torus',
		see: ['csaszar-polyhedron', 'triangulation']
	},
	{
		key: 'csaszar-polyhedron',
		term: 'Császár polyhedron',
		def: 'A polyhedron with 7 vertices, 21 edges and 14 flat triangular faces, found by Ákos Császár in 1949: the seven-vertex torus built in space without self-crossings. It has no diagonals — every pair of corners is an edge.',
		chapter,
		anchor: 'seven-vertex-torus',
		see: ['mobius-torus']
	},
	{
		key: 'hemi-icosahedron',
		term: 'Six-vertex projective plane (hemi-icosahedron)',
		def: 'The smallest triangulation of the real projective plane: 6 vertices, 15 edges, 10 triangles, obtained by gluing opposite points of an icosahedron. Every pair of vertices is joined by an edge.',
		chapter,
		anchor: 'projective-plane',
		see: ['triangulation']
	},
	{
		key: 'orientation-of-a-simplex',
		term: 'Orientation (of a simplex)',
		def: 'A choice of ordering of the vertices, where two orderings count as the same if they differ by an even number of swaps. Each simplex of dimension at least 1 has exactly two orientations: \\([v_1, v_0] = -[v_0, v_1]\\).',
		chapter,
		anchor: 'def-orientation',
		see: ['even-and-odd-orderings', 'coherent-orientation']
	},
	{
		key: 'even-and-odd-orderings',
		term: 'Even and odd orderings',
		def: 'An ordering of labels is even or odd according to whether it takes an even or odd number of swaps to reach it from the increasing order — equivalently, whether the number of pairs out of order is even or odd. \\([1,2,0]\\) is even; \\([1,0,2]\\) is odd.',
		chapter,
		anchor: 'orientation',
		see: ['orientation-of-a-simplex']
	},
	{
		key: 'coherent-orientation',
		term: 'Coherent orientation',
		def: 'An orientation of every triangle of a triangulated surface such that any two triangles sharing an edge run along it in opposite directions. Possible exactly when the surface is orientable.',
		chapter,
		anchor: 'orientation',
		see: ['orientation-of-a-simplex']
	},
	{
		key: 'simplicial-map',
		term: 'Simplicial map',
		def: 'A map between simplicial complexes that sends vertices to vertices so that the images of the vertices of any simplex span a simplex (possibly a smaller one). Extended using barycentric coordinates, it is continuous.',
		chapter,
		anchor: 'def-simplicial-map',
		see: ['simplicial-complex']
	},
	{
		key: 'barycentric-subdivision',
		term: 'Barycentric subdivision',
		def: 'The finer complex \\(\\operatorname{sd} K\\) with a vertex at the barycentre of every simplex of \\(K\\), and a simplex for every chain of faces \\(\\sigma_0 \\subset \\sigma_1 \\subset \\dots\\). A triangle becomes 6 triangles; an \\(n\\)-simplex becomes \\((n+1)!\\) pieces.',
		chapter,
		anchor: 'barycentric-subdivision',
		see: ['barycentre']
	},
	{
		key: 'delta-complex',
		term: 'Δ-complex',
		def: 'A space glued from simplices more freely than a simplicial complex allows: faces of one simplex may be glued together, and several simplices may share the same vertices. The torus is a Δ-complex with 1 vertex, 3 edges and 2 triangles.',
		chapter,
		anchor: 'delta-complexes',
		see: ['simplicial-complex', 'cw-complex']
	},
	{
		key: 'cell',
		term: 'Cell (n-cell)',
		def: 'An open \\(n\\)-dimensional disk used as a building block: a 0-cell is a point, a 1-cell an open arc, a 2-cell an open disk, a 3-cell an open ball.',
		chapter,
		anchor: 'cw-complexes',
		see: ['cw-complex', 'attaching-map']
	},
	{
		key: 'attaching-map',
		term: 'Attaching map',
		def: 'The continuous map that says where the boundary of a new \\(n\\)-cell is glued onto the part of a CW complex already built. The torus’s 2-cell is attached along the loop \\(aba^{-1}b^{-1}\\).',
		chapter,
		anchor: 'cw-complexes',
		see: ['cw-complex', 'cell']
	},
	{
		key: 'cw-complex',
		term: 'CW complex',
		def: 'A space built in stages: first some points (0-cells), then arcs glued at their ends (1-cells), then disks glued along their boundary circles (2-cells), and so on. The sphere is one point plus one disk; the torus is one point, two loops and one disk.',
		chapter,
		anchor: 'cw-complexes',
		see: ['cell', 'attaching-map', 'delta-complex']
	}
];
