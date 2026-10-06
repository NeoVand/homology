import type { GlossaryEntry } from './types';

const chapter = 'topology/manifolds';

export const entries: GlossaryEntry[] = [
	{
		key: 'manifold',
		term: 'Manifold',
		def: 'A space that looks like \\(\\R^n\\) near every point: a Hausdorff, second countable topological space in which every point has an open neighbourhood homeomorphic to an open subset of \\(\\R^n\\). The number \\(n\\) is its dimension.',
		chapter,
		anchor: 'def-manifold',
		see: ['locally-euclidean', 'chart', 'surface']
	},
	{
		key: 'locally-euclidean',
		term: 'Locally Euclidean',
		def: 'A space is locally Euclidean of dimension \\(n\\) if every point has an open neighbourhood homeomorphic to an open subset of \\(\\R^n\\) — equivalently, to an open ball, or to all of \\(\\R^n\\). The first and main condition in the definition of a manifold.',
		chapter,
		anchor: 'def-manifold',
		see: ['manifold']
	},
	{
		key: 'surface',
		term: 'Surface',
		def: 'A 2-dimensional manifold: a space in which every point has a neighbourhood that looks like a piece of the plane. Examples: the sphere, the torus, the Klein bottle.',
		chapter,
		anchor: 'def-manifold',
		see: ['manifold', 'classification-of-surfaces']
	},
	{
		key: 'second-countable',
		term: 'Second countable',
		def: 'A space is second countable if it has a countable collection of open sets from which every open set is a union. For a locally Euclidean space this means it can be covered by countably many chart domains. The condition rules out monsters such as the long line.',
		chapter,
		anchor: 'def-manifold',
		see: ['manifold']
	},
	{
		key: 'line-with-two-origins',
		term: 'Line with two origins',
		def: 'Two copies of \\(\\R\\) glued at every point except \\(0\\). It is locally Euclidean but not Hausdorff: the two origins cannot be separated by disjoint open sets, so it is not a manifold.',
		chapter,
		anchor: 'definition',
		see: ['hausdorff', 'manifold']
	},
	{
		key: 'small-sphere-test',
		term: 'Small-sphere test',
		def: 'To see whether a point of a space in \\(\\R^3\\) is a manifold point, look at where a small sphere around it meets the space: two points for a point of a curve, one circle for a point of a surface, an arc for a boundary point. Anything else, however small the sphere, signals a non-manifold point.',
		chapter,
		anchor: 'small-sphere-test',
		see: ['manifold', 'cut-point']
	},
	{
		key: 'chart',
		term: 'Chart',
		def: 'A pair \\((U, \\varphi)\\) where \\(U\\) is an open subset of a manifold and \\(\\varphi\\) is a homeomorphism from \\(U\\) onto an open subset of \\(\\R^n\\). It gives each point of \\(U\\) a list of \\(n\\) coordinates, like one page of an atlas of the Earth.',
		chapter,
		anchor: 'def-chart',
		see: ['atlas', 'transition-map']
	},
	{
		key: 'atlas',
		term: 'Atlas',
		def: 'A collection of charts whose domains cover the whole manifold. The sphere needs at least two charts; the six hemispheres, or the two stereographic projections, form atlases.',
		chapter,
		anchor: 'def-chart',
		see: ['chart', 'transition-map']
	},
	{
		key: 'transition-map',
		term: 'Transition map',
		def: 'For two overlapping charts \\((U, \\varphi)\\) and \\((V, \\psi)\\), the map \\(\\psi \\circ \\varphi^{-1}\\colon \\varphi(U \\cap V) \\to \\psi(U \\cap V)\\), which converts the coordinates of a point in the first chart into its coordinates in the second.',
		chapter,
		anchor: 'def-transition-map',
		see: ['chart', 'smooth-manifold']
	},
	{
		key: 'stereographic-projection',
		term: 'Stereographic projection',
		def: 'Projecting a sphere from its north pole onto a plane through its equator: each point \\(P \\neq N\\) goes to where the ray from \\(N\\) through \\(P\\) meets the plane. It shows that a sphere minus one point is homeomorphic to \\(\\R^n\\); for the circle it is \\((x, y) \\mapsto x/(1-y)\\).',
		chapter,
		anchor: 'stereographic',
		see: ['chart', 'atlas']
	},
	{
		key: 'half-space',
		term: 'Half-space',
		def: 'The set \\(\\mathbb H^n\\) of points of \\(\\R^n\\) whose last coordinate is \\(\\ge 0\\). Its edge, the hyperplane \\(x_n = 0\\), is written \\(\\partial \\mathbb H^n\\). It is the local model for manifolds with boundary.',
		chapter,
		anchor: 'def-manifold-with-boundary',
		see: ['manifold-with-boundary']
	},
	{
		key: 'manifold-with-boundary',
		term: 'Manifold with boundary',
		def: 'A Hausdorff, second countable space in which every point has a neighbourhood homeomorphic to an open subset of the half-space \\(\\mathbb H^n\\). Examples: the closed disk, the cylinder, the Möbius band.',
		chapter,
		anchor: 'def-manifold-with-boundary',
		see: ['boundary-of-a-manifold', 'half-space']
	},
	{
		key: 'boundary-of-a-manifold',
		term: 'Boundary (of a manifold)',
		def: 'The set \\(\\partial M\\) of points that a chart sends to the edge of the half-space. It is a manifold of one dimension less, with no boundary of its own: \\(\\partial(\\partial M) = \\varnothing\\). For example \\(\\partial D^2 = S^1\\).',
		chapter,
		anchor: 'def-manifold-with-boundary',
		see: ['manifold-with-boundary', 'closed-manifold']
	},
	{
		key: 'closed-manifold',
		term: 'Closed manifold',
		def: 'A compact manifold with empty boundary, such as a sphere, a torus or a Klein bottle. Not to be confused with a closed set: the plane is not a closed manifold, and neither is the closed disk.',
		chapter,
		anchor: 'def-closed-manifold',
		see: ['boundary-of-a-manifold', 'compact']
	},
	{
		key: 'smooth-manifold',
		term: 'Smooth manifold',
		def: 'A manifold with an atlas whose transition maps are all smooth (infinitely differentiable). Smooth structure is what makes calculus possible: a function is smooth if it is smooth in every chart.',
		chapter,
		anchor: 'def-smooth-manifold',
		see: ['transition-map', 'tangent-space']
	},
	{
		key: 'regular-level-set',
		term: 'Regular level set',
		def: 'A solution set \\(F = c\\) of a smooth function \\(F\\colon \\R^{n+1} \\to \\R\\) on which the gradient \\(\\nabla F\\) never vanishes. By the implicit function theorem it is a smooth \\(n\\)-manifold; the sphere \\(x^2 + y^2 + z^2 = 1\\) is an example.',
		chapter,
		anchor: 'thm-level-sets',
		see: ['smooth-manifold']
	},
	{
		key: 'tangent-space',
		term: 'Tangent space',
		def: 'The vector space \\(T_pM\\) of velocities \\(\\gamma\'(0)\\) of smooth curves \\(\\gamma\\) in \\(M\\) passing through \\(p\\) at time \\(0\\). For an \\(n\\)-manifold it has dimension \\(n\\); for a surface in \\(\\R^3\\) it is the tangent plane at \\(p\\).',
		chapter,
		anchor: 'def-tangent-space',
		see: ['tangent-vector', 'differential-of-a-map']
	},
	{
		key: 'tangent-vector',
		term: 'Tangent vector',
		def: 'An element of a tangent space \\(T_pM\\): the velocity of some curve in \\(M\\) as it passes through \\(p\\). It is attached to the point \\(p\\) and does not lie in the manifold itself.',
		chapter,
		anchor: 'def-tangent-space',
		see: ['tangent-space']
	},
	{
		key: 'differential-of-a-map',
		term: 'Differential (of a smooth map)',
		def: 'For a smooth map \\(f\\colon M \\to N\\), the linear map \\(df_p\\colon T_pM \\to T_{f(p)}N\\) that sends the velocity of a curve \\(\\gamma\\) to the velocity of \\(f \\circ \\gamma\\): the best linear approximation to \\(f\\) near \\(p\\). It pushes vectors forward and is also written \\(f_*\\).',
		chapter,
		anchor: 'tangent-spaces',
		see: ['tangent-space']
	},
	{
		key: 'orientation',
		term: 'Orientation',
		def: 'For a vector space: a choice of one of the two classes of ordered bases, where two bases are equivalent if the change-of-basis matrix has positive determinant ("anticlockwise" or "clockwise" in the plane). For a manifold: a choice of orientation of every tangent space, varying continuously.',
		chapter,
		anchor: 'def-orientation',
		see: ['orientable', 'determinant']
	},
	{
		key: 'orientable',
		term: 'Orientable',
		def: 'A manifold is orientable if a sense of "anticlockwise" can be chosen at every point, continuously. The sphere and the torus are orientable; the Möbius band, the Klein bottle and the projective plane are not. A surface is orientable exactly when it contains no Möbius band.',
		chapter,
		anchor: 'def-orientable',
		see: ['orientation', 'non-orientable', 'orientation-reversing-loop']
	},
	{
		key: 'non-orientable',
		term: 'Non-orientable',
		def: 'Not orientable: no continuous choice of orientation exists, because some loop brings a traveller home as its own mirror image. Examples: the Möbius band, the Klein bottle, \\(\\RP^2\\).',
		chapter,
		anchor: 'def-orientable',
		see: ['orientable', 'orientation-reversing-loop']
	},
	{
		key: 'oriented-atlas',
		term: 'Oriented atlas',
		def: 'A smooth atlas all of whose transition maps have positive Jacobian determinant, so that "anticlockwise" means the same thing in every chart. A smooth manifold is orientable exactly when it has an oriented atlas.',
		chapter,
		anchor: 'orienting-surfaces',
		see: ['orientation', 'transition-map']
	},
	{
		key: 'orientation-reversing-loop',
		term: 'Orientation-reversing loop',
		def: 'A loop in a manifold along which a traveller carrying an orientation comes home mirror-reversed, like the core circle of a Möbius band. A surface is non-orientable exactly when it has one.',
		chapter,
		anchor: 'prop-mobius-test',
		see: ['non-orientable', 'mobius-band']
	},
	{
		key: 'one-sided',
		term: 'One-sided surface',
		def: 'A surface sitting in a space on which an ant can walk from one side to the other without crossing an edge, like the Möbius band in \\(\\R^3\\). One-sidedness depends on the surrounding space; for surfaces in \\(\\R^3\\) it is the same as non-orientability.',
		chapter,
		anchor: 'sides',
		see: ['non-orientable']
	},
	{
		key: 'jordan-brouwer-separation',
		term: 'Jordan–Brouwer separation theorem',
		def: 'A closed connected surface embedded in \\(\\R^3\\) separates space into a bounded inside and an unbounded outside. Hence closed surfaces in \\(\\R^3\\) are two-sided and orientable, and the Klein bottle and \\(\\RP^2\\) cannot be embedded there.',
		chapter,
		anchor: 'thm-jordan-brouwer',
		see: ['orientable', 'immersion']
	},
	{
		key: 'whitney-embedding-theorem',
		term: 'Whitney embedding theorem',
		def: 'Every smooth \\(n\\)-manifold can be embedded in \\(\\R^{2n}\\) (Whitney, 1944), and immersed in \\(\\R^{2n-1}\\) when \\(n \\ge 2\\). So every surface fits without self-crossings in \\(\\R^4\\).',
		chapter,
		anchor: 'sides',
		see: ['embedding', 'immersion']
	},
	{
		key: 'connected-sum',
		term: 'Connected sum',
		def: 'The surface \\(M \\mathbin{\\#} N\\) made by cutting a small open disk out of each of \\(M\\) and \\(N\\) and gluing the two boundary circles together. The sphere acts as zero: \\(S^2 \\mathbin{\\#} M \\cong M\\).',
		chapter,
		anchor: 'def-connected-sum',
		see: ['handle', 'cross-cap', 'connected-sum-formula']
	},
	{
		key: 'handle',
		term: 'Handle',
		def: 'What connected sum with a torus adds to a surface: \\(M \\mathbin{\\#} T^2\\) is \\(M\\) with a handle attached. The surface of genus \\(g\\) is a sphere with \\(g\\) handles.',
		chapter,
		anchor: 'connected-sum',
		see: ['connected-sum', 'genus']
	},
	{
		key: 'dycks-theorem',
		term: 'Dyck’s theorem',
		def: '\\(T^2 \\mathbin{\\#} \\RP^2 \\cong \\RP^2 \\mathbin{\\#} \\RP^2 \\mathbin{\\#} \\RP^2\\) (Walther von Dyck, 1888): in the presence of a cross-cap, a handle can be traded for two cross-caps. So mixing handles and cross-caps produces nothing new.',
		chapter,
		anchor: 'thm-dyck',
		see: ['connected-sum', 'cross-cap']
	},
	{
		key: 'classification-of-surfaces',
		term: 'Classification of closed surfaces',
		def: 'Every closed connected surface is homeomorphic to exactly one of: the sphere; a connected sum \\(\\Sigma_g\\) of \\(g \\ge 1\\) tori (orientable, \\(\\chi = 2 - 2g\\)); or a connected sum \\(N_k\\) of \\(k \\ge 1\\) projective planes (non-orientable, \\(\\chi = 2 - k\\)).',
		chapter,
		anchor: 'thm-classification',
		see: ['genus', 'connected-sum', 'classification-by-euler-characteristic']
	},
	{
		key: 'genus',
		term: 'Genus',
		def: 'The number \\(g\\) of handles of a closed orientable surface: \\(0\\) for the sphere, \\(1\\) for the torus. For the non-orientable surface \\(N_k\\), the number \\(k\\) of cross-caps is called its non-orientable genus.',
		chapter,
		anchor: 'classification',
		see: ['genus-g-surface', 'handle', 'classification-of-surfaces']
	}
];
