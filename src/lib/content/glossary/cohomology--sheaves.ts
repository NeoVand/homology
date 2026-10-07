import type { GlossaryEntry } from './types';

const chapter = 'cohomology/sheaves';

export const entries: GlossaryEntry[] = [
	{
		key: 'open-cover',
		term: 'Open cover',
		def: 'A family of open sets \\(\\{U_i\\}\\) whose union is the whole space. The pieces may overlap; their overlaps are written \\(U_{ij} = U_i\\cap U_j\\), \\(U_{ijk}\\), and so on.',
		chapter,
		anchor: 'def-open-cover',
		see: ['nerve', 'good-cover']
	},
	{
		key: 'nerve',
		term: 'Nerve of a cover',
		def: 'The simplicial complex \\(N(\\mathcal U)\\) with a vertex for each piece of a cover and a simplex for each collection of pieces that have a point in common.',
		chapter,
		anchor: 'def-nerve',
		see: ['open-cover', 'nerve-theorem']
	},
	{
		key: 'good-cover',
		term: 'Good cover',
		def: 'An open cover in which every nonempty finite intersection of pieces is contractible (for instance, a cover by convex sets).',
		chapter,
		anchor: 'def-good-cover',
		see: ['nerve-theorem']
	},
	{
		key: 'nerve-theorem',
		term: 'Nerve theorem',
		def: 'For a good cover of a reasonable (paracompact) space — any manifold, simplicial complex or subset of \\(\\R^n\\) — the nerve is homotopy equivalent to the space, so it has the same homology and cohomology.',
		chapter,
		anchor: 'thm-nerve',
		see: ['nerve', 'good-cover']
	},
	{
		key: 'refinement',
		term: 'Refinement of a cover',
		def: 'A cover each of whose pieces lies inside some piece of a given cover. The Čech cohomology of a space is defined by passing to finer and finer covers.',
		chapter
	},
	{
		key: 'cech-cochain',
		term: 'Čech cochain',
		def: 'Data attached to the pieces of a cover (\\(0\\)-cochains), to their pairwise overlaps (\\(1\\)-cochains), to triple overlaps (\\(2\\)-cochains), and so on, with indices in increasing order.',
		chapter,
		anchor: 'def-cech',
		see: ['cech-coboundary', 'cech-cohomology']
	},
	{
		key: 'cech-coboundary',
		term: 'Čech coboundary',
		def: 'The map \\(\\delta\\) on Čech cochains, \\((\\delta f)_{ij} = f_j - f_i\\), \\((\\delta c)_{ijk} = c_{jk}-c_{ik}+c_{ij}\\), and in general an alternating sum of restrictions. It satisfies \\(\\delta\\circ\\delta = 0\\).',
		chapter,
		anchor: 'def-cech'
	},
	{
		key: 'cech-cohomology',
		term: 'Čech cohomology',
		def: '\\(\\check H^p(\\mathcal U;F)\\): Čech cocycles modulo Čech coboundaries for a cover \\(\\mathcal U\\). For a good cover of a nice space with constant coefficients it is the ordinary cohomology of the space.',
		chapter,
		anchor: 'def-cech',
		see: ['cech-cochain', 'leray-cover']
	},
	{
		key: 'holonomy',
		term: 'Holonomy (loop test)',
		def: 'What you accumulate by going once around a loop of overlaps — for three arcs on a circle, \\(c_{01}+c_{12}-c_{02}\\) (or a product, for multiplicative groups). It vanishes exactly for coboundaries.',
		chapter
	},
	{
		key: 'presheaf',
		term: 'Presheaf',
		def: 'An assignment of data \\(F(U)\\) to every open set \\(U\\), with restriction maps \\(F(U)\\to F(V)\\) for \\(V\\subseteq U\\) that compose correctly. The arrows run opposite to the inclusions.',
		chapter,
		anchor: 'def-presheaf',
		see: ['sheaf', 'restriction-map']
	},
	{
		key: 'restriction-map',
		term: 'Restriction map',
		def: 'For open sets \\(V\\subseteq U\\), the map \\(F(U)\\to F(V)\\), \\(s\\mapsto s|_V\\), that cuts data on \\(U\\) down to \\(V\\).',
		chapter,
		anchor: 'def-presheaf'
	},
	{
		key: 'section',
		term: 'Section',
		def: 'An element of \\(F(U)\\): one piece of data of a presheaf over the open set \\(U\\), such as a continuous function on \\(U\\).',
		chapter,
		anchor: 'def-presheaf',
		see: ['global-section']
	},
	{
		key: 'global-section',
		term: 'Global section',
		def: 'A section over the whole space; the global sections form \\(F(X) = \\Gamma(X;F)\\). For a sheaf, \\(\\check H^0(X;F) = F(X)\\).',
		chapter
	},
	{
		key: 'sheaf',
		term: 'Sheaf',
		def: 'A presheaf satisfying *locality* (sections that agree on every piece of a cover are equal) and *gluing* (sections on the pieces that agree on overlaps come from a section on the union).',
		chapter,
		anchor: 'def-sheaf',
		see: ['presheaf', 'gluing-axiom']
	},
	{
		key: 'locality-axiom',
		term: 'Locality axiom',
		def: 'The first sheaf axiom: if two sections over \\(U\\) restrict to the same section on every piece of a cover of \\(U\\), they are equal.',
		chapter,
		anchor: 'def-sheaf'
	},
	{
		key: 'gluing-axiom',
		term: 'Gluing axiom',
		def: 'The second sheaf axiom: sections \\(s_i\\) on the pieces of a cover that agree on every overlap glue to a section on the union.',
		chapter,
		anchor: 'def-sheaf'
	},
	{
		key: 'monodromy',
		term: 'Monodromy',
		def: 'The change in a local solution after following it continuously around a loop — for example, a branch of \\(\\sqrt z\\) comes back as its negative after one turn around \\(0\\).',
		chapter
	},
	{
		key: 'riemann-surface',
		term: 'Riemann surface of a function',
		def: 'The surface made by gluing together all the local branches of a many-valued function such as \\(\\sqrt z\\) or \\(\\log z\\); on it the function becomes single-valued.',
		chapter
	},
	{
		key: 'orientation-sheaf',
		term: 'Orientation sheaf',
		def: 'The sheaf whose sections over an open set are its orientations. It has a global section exactly when the surface is orientable; on the Möbius band its Čech class is nonzero.',
		chapter
	},
	{
		key: 'sheaf-cohomology',
		term: 'Sheaf cohomology',
		def: 'The groups \\(H^p(X;F)\\): global sections for \\(p = 0\\), and obstructions to gluing local data for \\(p \\ge 1\\). They can be computed with Čech cochains on a Leray cover.',
		chapter,
		see: ['cech-cohomology', 'leray-cover']
	},
	{
		key: 'leray-cover',
		term: 'Leray cover (Leray’s theorem)',
		def: 'A cover on whose finite intersections the sheaf has no higher cohomology. Leray’s theorem: the Čech cohomology of such a cover is the true sheaf cohomology.',
		chapter,
		anchor: 'thm-leray'
	},
	{
		key: 'cellular-sheaf',
		term: 'Cellular sheaf',
		def: 'Vector spaces (stalks) on the vertices and edges of a graph — or the cells of a complex — with a linear restriction map from each vertex to each edge at it. \\(H^0\\) is the space of global sections.',
		chapter,
		anchor: 'def-cellular-sheaf',
		see: ['sheaf-laplacian']
	},
	{
		key: 'stalk',
		term: 'Stalk',
		def: 'The data a sheaf attaches at a single place: in a cellular sheaf, the vector space on one vertex or edge.',
		chapter,
		anchor: 'def-cellular-sheaf'
	},
	{
		key: 'sheaf-laplacian',
		term: 'Sheaf Laplacian',
		def: '\\(L = \\delta^{\\mathsf T}\\delta\\) for a cellular sheaf. The heat flow \\(dx/dt = -Lx\\) settles on the global section nearest to the starting data.',
		chapter,
		see: ['cellular-sheaf']
	}
];
