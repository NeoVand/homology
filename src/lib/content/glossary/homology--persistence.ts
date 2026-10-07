import type { GlossaryEntry } from './types';

const chapter = 'homology/persistence';

export const entries: GlossaryEntry[] = [
	{
		key: 'point-cloud',
		term: 'Point cloud',
		def: 'A finite set of points \\(P = \\set{p_1, \\dots, p_n}\\) in some space \\(\\R^d\\), together with the distances between them — the typical shape of data in topological data analysis.',
		chapter,
		anchor: 'point-clouds',
		see: ['union-of-balls', 'vietoris-rips-complex']
	},
	{
		key: 'union-of-balls',
		term: 'Union of balls',
		def: 'For a point cloud \\(P\\) and a radius \\(r\\), the set \\(U_r\\) of all points within distance \\(r\\) of some point of \\(P\\): the cloud *thickened* by \\(r\\). Two balls of radius \\(r\\) meet exactly when their centres are at distance at most \\(2r\\).',
		chapter,
		anchor: 'thickening',
		see: ['cech-complex', 'nerve-theorem']
	},
	{
		key: 'nerve',
		term: 'Nerve',
		def: 'The nerve of a family of sets \\(U_1, \\dots, U_n\\) is the abstract simplicial complex with one vertex per set, in which a group of vertices spans a simplex exactly when the corresponding sets have a point in common.',
		chapter,
		anchor: 'def-nerve',
		see: ['nerve-theorem', 'cech-complex']
	},
	{
		key: 'good-cover',
		term: 'Good cover',
		def: 'A family of sets in which every nonempty intersection of some of the sets is contractible — for example, any finite family of convex sets in \\(\\R^d\\), such as balls. The nerve theorem applies to good covers by open sets, and to finite families of closed convex sets.',
		chapter,
		anchor: 'thm-nerve',
		see: ['nerve-theorem']
	},
	{
		key: 'nerve-theorem',
		term: 'Nerve theorem',
		def: 'For a good cover (for instance by finitely many balls in \\(\\R^d\\)), the nerve has the same homotopy type as the union of the sets, and hence the same homology. It is why the Čech complex captures the union of balls.',
		chapter,
		anchor: 'thm-nerve',
		see: ['nerve', 'good-cover', 'cech-complex']
	},
	{
		key: 'cech-complex',
		term: 'Čech complex',
		def: 'The nerve \\(\\check C_r(P)\\) of the balls of radius \\(r\\) around the points of a cloud: points span a simplex when their balls share a point, that is, when they fit in one ball of radius \\(r\\).',
		chapter,
		anchor: 'def-cech',
		see: ['nerve-theorem', 'vietoris-rips-complex']
	},
	{
		key: 'vietoris-rips-complex',
		term: 'Vietoris–Rips complex',
		def: 'The complex \\(\\mathrm{VR}_r(P)\\) in which points span a simplex when every two of them are within distance \\(2r\\) (radius convention; many sources write \\(\\varepsilon = 2r\\)). It is a flag complex, and \\(\\check C_r \\subseteq \\mathrm{VR}_r \\subseteq \\check C_{\\sqrt2 r}\\).',
		chapter,
		anchor: 'def-rips',
		see: ['cech-complex', 'flag-complex']
	},
	{
		key: 'flag-complex',
		term: 'Flag complex',
		def: 'A simplicial complex determined by its edges: a set of vertices spans a simplex exactly when every two of them are joined by an edge. Also called a clique complex.',
		chapter,
		anchor: 'def-rips',
		see: ['vietoris-rips-complex']
	},
	{
		key: 'filtration',
		term: 'Filtration',
		def: 'A nested family of subcomplexes \\(K_r \\subseteq K_s\\) (for \\(r \\le s\\)) of a simplicial complex — a “film” of growing complexes, such as the Vietoris–Rips complexes of a point cloud as the radius grows.',
		chapter,
		anchor: 'def-filtration',
		see: ['entrance-time', 'persistent-homology']
	},
	{
		key: 'entrance-time',
		term: 'Entrance time',
		def: 'The parameter value \\(f(\\sigma)\\) at which a simplex enters a filtration; a face never enters after the simplices containing it. For Vietoris–Rips it is half the largest distance between the simplex’s points.',
		chapter,
		anchor: 'def-filtration',
		see: ['filtration']
	},
	{
		key: 'positive-simplex',
		term: 'Positive simplex',
		def: 'A simplex whose arrival in a filtration creates a new homology class (it raises \\(b_k\\) by one, where \\(k\\) is its dimension). Every vertex is positive, and so is an edge that closes a loop.',
		chapter,
		anchor: 'filtrations',
		see: ['negative-simplex']
	},
	{
		key: 'negative-simplex',
		term: 'Negative simplex',
		def: 'A \\(k\\)-simplex whose arrival in a filtration destroys a \\((k-1)\\)-dimensional class, lowering \\(b_{k-1}\\) by one — for example an edge joining two pieces, or a triangle filling a loop.',
		chapter,
		anchor: 'filtrations',
		see: ['positive-simplex']
	},
	{
		key: 'birth-death',
		term: 'Birth and death',
		def: 'In a filtration, a homology class is *born* at the first parameter value where it exists without coming from an earlier class, and *dies* when it becomes zero or merges into an older class.',
		chapter,
		anchor: 'def-birth-death',
		see: ['elder-rule', 'persistence', 'barcode']
	},
	{
		key: 'persistence',
		term: 'Persistence (lifetime)',
		def: 'The length \\(d - b\\) of the interval during which a homology class is alive in a filtration. Long-lived classes are candidates for real structure, short-lived ones for noise.',
		chapter,
		anchor: 'def-birth-death',
		see: ['birth-death', 'barcode']
	},
	{
		key: 'elder-rule',
		term: 'Elder rule',
		def: 'When two classes merge in a filtration, the older one (born earlier) survives and the younger one dies. In a Rips filtration all points are born at once, and ties are broken by labels.',
		chapter,
		anchor: 'birth-and-death',
		see: ['birth-death']
	},
	{
		key: 'barcode',
		term: 'Barcode',
		def: 'The collection of intervals \\([b, d)\\), one for each class in a suitable basis, recording when the homology classes of a filtration are born and die, drawn as horizontal bars. The number of \\(k\\)-bars containing \\(r\\) is \\(b_k\\) at \\(r\\).',
		chapter,
		anchor: 'def-barcode',
		see: ['persistence-diagram', 'persistent-homology']
	},
	{
		key: 'persistence-diagram',
		term: 'Persistence diagram',
		def: 'The barcode drawn as points \\((b, d)\\) in the plane — birth across, death up. All points lie above the diagonal; points far from it are long-lived, points near it short-lived.',
		chapter,
		anchor: 'def-barcode',
		see: ['barcode', 'bottleneck-distance']
	},
	{
		key: 'essential-class',
		term: 'Essential class',
		def: 'A homology class that never dies in a filtration, giving an infinite bar \\([b, \\infty)\\). In the full Rips filtration of a point cloud there is exactly one: the class of the single final piece in \\(H_0\\).',
		chapter,
		anchor: 'def-barcode',
		see: ['barcode']
	},
	{
		key: 'persistent-betti-number',
		term: 'Persistent Betti number',
		def: 'The number \\(b_k^{r,s}\\) of independent \\(k\\)-dimensional classes alive at \\(r\\) that are still alive at \\(s\\): the rank of \\(H_k(K_r) \\to H_k(K_s)\\), equal to the number of bars containing \\([r, s]\\).',
		chapter,
		anchor: 'barcodes',
		see: ['barcode']
	},
	{
		key: 'persistent-homology',
		term: 'Persistent homology',
		def: 'The homology of a filtration followed across all parameter values at once: which classes are born, how long they live and when they die, summarised by a barcode or persistence diagram.',
		chapter,
		anchor: 'barcodes',
		see: ['filtration', 'barcode']
	},
	{
		key: 'sublevel-set',
		term: 'Sublevel set',
		def: 'For a function \\(f\\) and a level \\(t\\), the set \\(\\setb{x}{f(x) \\le t}\\). As \\(t\\) rises these sets grow, forming a filtration; picture water rising in a landscape.',
		chapter,
		anchor: 'fig-elder',
		see: ['filtration', 'elder-rule']
	},
	{
		key: 'reduction-algorithm',
		term: 'Reduction algorithm',
		def: 'The standard way to compute persistence: in the filtration boundary matrix over \\(\\Z/2\\), add earlier columns to later ones until no two nonzero columns have the same low; then each nonzero column \\(j\\) pairs \\(\\mathrm{low}(j)\\) (a birth) with \\(j\\) (a death).',
		chapter,
		anchor: 'def-reduction',
		see: ['low-of-a-column', 'barcode']
	},
	{
		key: 'low-of-a-column',
		term: 'Low of a column',
		def: '\\(\\mathrm{low}(j)\\) is the row index of the lowest nonzero entry of column \\(j\\) of a matrix; for a filtration boundary matrix, the most recently added face in the boundary of the \\(j\\)-th simplex.',
		chapter,
		anchor: 'def-reduction',
		see: ['reduction-algorithm']
	},
	{
		key: 'bottleneck-distance',
		term: 'Bottleneck distance',
		def: 'The distance between two persistence diagrams: the smallest \\(\\delta\\) such that their points can be matched one-to-one, each moving at most \\(\\delta\\) in each coordinate, where a point may also be matched to the diagonal at cost \\((d - b)/2\\).',
		chapter,
		anchor: 'def-bottleneck',
		see: ['stability-theorem', 'persistence-diagram']
	},
	{
		key: 'stability-theorem',
		term: 'Stability theorem',
		def: 'Moving every point of a cloud by at most \\(\\delta\\) moves its Rips or Čech persistence diagrams by at most \\(\\delta\\) in bottleneck distance (radius convention). Bars longer than \\(2\\delta\\) therefore survive.',
		chapter,
		anchor: 'thm-stability',
		see: ['bottleneck-distance']
	}
];
