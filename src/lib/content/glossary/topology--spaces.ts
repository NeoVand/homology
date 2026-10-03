import type { GlossaryEntry } from './types';

const chapter = 'topology/spaces';

export const entries: GlossaryEntry[] = [
	{
		key: 'metric',
		term: 'Metric',
		def: 'A rule \\(d\\) giving a distance \\(d(x, y) \\ge 0\\) between any two points, which is zero only when \\(x = y\\), is symmetric, and obeys the triangle inequality \\(d(x, z) \\le d(x, y) + d(y, z)\\).',
		chapter,
		anchor: 'def-metric',
		see: ['metric-space', 'open-ball']
	},
	{
		key: 'metric-space',
		term: 'Metric space',
		def: 'A set together with a metric. Examples: the line, the plane and \\(\\R^n\\) with straight-line distance; the plane with taxicab distance; any set with the discrete metric.',
		chapter,
		anchor: 'def-metric',
		see: ['metric']
	},
	{
		key: 'taxicab-distance',
		term: 'Taxicab distance',
		def: 'The distance \\(d_1(x, y) = \\abs{x_1 - y_1} + \\abs{x_2 - y_2}\\) in the plane: how far a taxi drives on a grid of streets. Its balls are diamonds, but it has the same open sets as straight-line distance.',
		chapter,
		anchor: 'def-metric',
		see: ['metric']
	},
	{
		key: 'open-ball',
		term: 'Open ball',
		def: 'The set \\(B(x, r)\\) of all points at distance less than \\(r\\) from \\(x\\). In the plane with straight-line distance it is a disk without its rim.',
		chapter,
		anchor: 'def-open',
		see: ['open-set']
	},
	{
		key: 'open-set',
		term: 'Open set',
		def: 'In a metric space: a set in which every point has some wiggle room — a ball around it inside the set. In a topological space: any member of the chosen collection of open sets.',
		chapter,
		anchor: 'def-open',
		see: ['closed-set', 'topology']
	},
	{
		key: 'closed-set',
		term: 'Closed set',
		def: 'A set whose complement is open; intuitively, a set that contains its whole boundary. A set can be open, closed, both or neither.',
		chapter,
		anchor: 'def-closed',
		see: ['open-set', 'clopen']
	},
	{
		key: 'clopen',
		term: 'Clopen set',
		def: 'A set that is both open and closed, such as \\(\\varnothing\\) and the whole space. A connected space has no other clopen sets.',
		chapter,
		anchor: 'def-closed',
		see: ['closed-set', 'connected']
	},
	{
		key: 'topology',
		term: 'Topology (on a set)',
		def: 'A collection of subsets of \\(X\\), called open sets, that contains \\(\\varnothing\\) and \\(X\\) and is closed under arbitrary unions and finite intersections. (The subject is also called topology.)',
		chapter,
		anchor: 'def-topology',
		see: ['topological-space', 'open-set']
	},
	{
		key: 'topological-space',
		term: 'Topological space',
		def: 'A set together with a topology: points plus a precise notion of nearness, with no distances, angles or sizes.',
		chapter,
		anchor: 'def-topology',
		see: ['topology']
	},
	{
		key: 'neighbourhood',
		term: 'Neighbourhood',
		def: 'An open set containing a given point — a region that gives the point some room.',
		chapter,
		anchor: 'def-topology',
		see: ['open-set']
	},
	{
		key: 'discrete-topology',
		term: 'Discrete topology',
		def: 'The topology in which every subset is open: each point is isolated from all the others. It comes from the discrete metric.',
		chapter,
		anchor: 'def-topology',
		see: ['indiscrete-topology']
	},
	{
		key: 'indiscrete-topology',
		term: 'Indiscrete topology',
		def: 'The topology whose only open sets are \\(\\varnothing\\) and the whole space: no open set can tell two points apart.',
		chapter,
		anchor: 'def-topology',
		see: ['discrete-topology']
	},
	{
		key: 'subspace-topology',
		term: 'Subspace topology',
		def: 'The topology on a subset \\(A \\subseteq X\\) whose open sets are the intersections \\(U \\cap A\\) with open sets \\(U\\) of \\(X\\). It is how the circle and the sphere get their open sets.',
		chapter,
		anchor: 'def-subspace',
		see: ['topology']
	},
	{
		key: 'product-topology',
		term: 'Product topology',
		def: 'The topology on \\(X \\times Y\\) whose open sets are unions of open rectangles \\(U \\times V\\). The torus is the product \\(S^1 \\times S^1\\).',
		chapter,
		anchor: 'def-subspace',
		see: ['subspace-topology']
	},
	{
		key: 'continuous-map',
		term: 'Continuous map',
		def: 'A function \\(f \\colon X \\to Y\\) such that the preimage \\(f^{-1}(V)\\) of every open set \\(V\\) is open. It may glue points together but never tears.',
		chapter,
		anchor: 'def-continuous',
		see: ['epsilon-delta', 'homeomorphism', 'preimage']
	},
	{
		key: 'epsilon-delta',
		term: 'ε–δ continuity',
		def: '\\(f\\) is continuous at \\(a\\) if for every \\(\\varepsilon > 0\\) there is a \\(\\delta > 0\\) such that \\(\\abs{x - a} < \\delta\\) implies \\(\\abs{f(x) - f(a)} < \\varepsilon\\): close enough inputs give close outputs.',
		chapter,
		anchor: 'def-continuity-epsilon',
		see: ['continuous-map']
	},
	{
		key: 'homeomorphism',
		term: 'Homeomorphism',
		def: 'A bijection \\(f \\colon X \\to Y\\) with \\(f\\) and \\(f^{-1}\\) both continuous: a stretching that can be perfectly undone. If one exists, \\(X\\) and \\(Y\\) are homeomorphic, \\(X \\cong Y\\).',
		chapter,
		anchor: 'def-homeomorphism',
		see: ['continuous-map', 'topological-invariant']
	},
	{
		key: 'topological-invariant',
		term: 'Topological invariant',
		def: 'A property or quantity that homeomorphic spaces always share, such as connectedness, compactness or the number of cut points. Different invariants prove spaces are not homeomorphic.',
		chapter,
		anchor: 'def-connected',
		see: ['homeomorphism']
	},
	{
		key: 'connected',
		term: 'Connected',
		def: 'A space is connected if it cannot be split into two disjoint, non-empty open sets. The maximal connected pieces of a space are its connected components.',
		chapter,
		anchor: 'def-connected',
		see: ['path-connected']
	},
	{
		key: 'path',
		term: 'Path',
		def: 'A continuous map \\(\\gamma \\colon [0, 1] \\to X\\): a journey through \\(X\\) from \\(\\gamma(0)\\) to \\(\\gamma(1)\\).',
		chapter,
		anchor: 'def-connected',
		see: ['path-connected']
	},
	{
		key: 'path-connected',
		term: 'Path-connected',
		def: 'Any two points can be joined by a path. Path-connected spaces are connected; for all the spaces in this book the two notions agree.',
		chapter,
		anchor: 'def-connected',
		see: ['connected', 'path']
	},
	{
		key: 'open-cover',
		term: 'Open cover',
		def: 'A collection of open sets whose union is the whole space.',
		chapter,
		anchor: 'def-compact',
		see: ['compact']
	},
	{
		key: 'compact',
		term: 'Compact',
		def: 'Every open cover has a finite subcover. In \\(\\R^n\\), compact means closed and bounded (Heine–Borel): no escape routes, to infinity or to a missing edge.',
		chapter,
		anchor: 'def-compact',
		see: ['open-cover']
	},
	{
		key: 'cut-point',
		term: 'Cut point',
		def: 'A point whose removal disconnects a connected space. Homeomorphisms send cut points to cut points, which tells a circle from an interval and T from X.',
		chapter,
		anchor: 'def-cut-point',
		see: ['connected', 'topological-invariant']
	},
	{
		key: 'hausdorff',
		term: 'Hausdorff space',
		def: 'A space in which any two different points have disjoint neighbourhoods. Every metric space is Hausdorff; gluing can destroy the property.',
		chapter,
		anchor: 'def-hausdorff',
		see: ['neighbourhood']
	}
];
