import type { GlossaryEntry } from './types';

const chapter = 'homology/invariance';

export const entries: GlossaryEntry[] = [
	{
		key: 'chain-map',
		term: 'Chain map',
		def: 'A family of homomorphisms \\(\\varphi_k\\colon C_k\\to C\'_k\\) between two chain complexes that commutes with the boundary: \\(\\partial\\circ\\varphi = \\varphi\\circ\\partial\\). It sends cycles to cycles and boundaries to boundaries, so it induces maps on homology.',
		chapter,
		anchor: 'def-chain-map',
		see: ['induced-map', 'chain-homotopy']
	},
	{
		key: 'induced-chain-map',
		term: 'Induced chain map',
		def: 'For a simplicial map \\(f\\), the chain map that sends an oriented simplex \\([v_0,\\dots,v_k]\\) to \\([f(v_0),\\dots,f(v_k)]\\) (re-sorted, with a sign), or to \\(0\\) if two vertices land on the same point. For singular chains it is simply composition, \\(\\sigma\\mapsto f\\circ\\sigma\\).',
		chapter,
		anchor: 'maps-push-cycles',
		see: ['chain-map']
	},
	{
		key: 'induced-map',
		term: 'Induced homomorphism',
		def: 'The homomorphism on homology defined by a map \\(f\\): \\(f_*[z] = [f_\\#z]\\). Read “\\(f\\) lower star”. Wrapping a circle twice around another induces multiplication by \\(2\\) on \\(H_1\\).',
		chapter,
		anchor: 'def-induced-map',
		see: ['chain-map', 'functoriality']
	},
	{
		key: 'functoriality',
		term: 'Functoriality',
		def: 'The rules \\((g\\circ f)_* = g_*\\circ f_*\\) and \\((\\mathrm{id})_* = \\mathrm{id}\\): homology turns spaces into groups and maps into homomorphisms, respecting composition. This is what it means for homology to be a *functor*.',
		chapter,
		anchor: 'thm-functoriality',
		see: ['induced-map']
	},
	{
		key: 'singular-simplex',
		term: 'Singular simplex',
		def: 'Any continuous map \\(\\sigma\\colon\\Delta^n\\to X\\) from the standard \\(n\\)-simplex into a space. “Singular” because it need not be a nice embedding: it may crumple or collapse the simplex.',
		chapter,
		anchor: 'def-singular',
		see: ['singular-homology']
	},
	{
		key: 'singular-homology',
		term: 'Singular homology',
		def: 'Homology built from singular chains (formal sums of singular simplices). It is defined for every space, every continuous map induces homomorphisms on it, and it agrees with simplicial homology on triangulated spaces.',
		chapter,
		anchor: 'def-singular',
		see: ['singular-simplex', 'homotopy-invariance']
	},
	{
		key: 'homotopy-invariance',
		term: 'Homotopy invariance',
		def: 'Homotopic maps induce the same homomorphisms on homology. Consequently homotopy equivalent spaces — in particular homeomorphic ones — have isomorphic homology groups.',
		chapter,
		anchor: 'thm-homotopy-invariance',
		see: ['chain-homotopy', 'prism-operator']
	},
	{
		key: 'prism-operator',
		term: 'Prism operator',
		def: 'The chain homotopy \\(P\\) built from a homotopy \\(H\\): it sends a simplex \\(\\sigma\\) to the prism swept out by \\(\\sigma\\), cut into simplices. Its boundary is top minus bottom minus sides: \\(\\partial P(\\sigma) = g_\\#\\sigma - f_\\#\\sigma - P(\\partial\\sigma)\\).',
		chapter,
		anchor: 'homotopy-invariance',
		see: ['chain-homotopy']
	},
	{
		key: 'chain-homotopy',
		term: 'Chain homotopy',
		def: 'Homomorphisms \\(P\\colon C_n\\to C\'_{n+1}\\) with \\(\\partial P + P\\partial = \\psi - \\varphi\\) for two chain maps \\(\\varphi,\\psi\\). Chain homotopic maps induce the same map on homology.',
		chapter,
		anchor: 'def-chain-homotopy',
		see: ['chain-map', 'prism-operator']
	},
	{
		key: 'retraction',
		term: 'Retraction',
		def: 'A continuous map \\(r\\colon X\\to A\\) onto a subspace that fixes every point of \\(A\\). There is no retraction of the disk \\(D^n\\) onto its boundary sphere.',
		chapter,
		anchor: 'def-retraction',
		see: ['no-retraction-theorem']
	},
	{
		key: 'no-retraction-theorem',
		term: 'No-retraction theorem',
		def: 'There is no retraction \\(D^n\\to S^{n-1}\\): it would make the identity of \\(\\tilde H_{n-1}(S^{n-1})\\cong\\mathbb Z\\) factor through \\(\\tilde H_{n-1}(D^n) = 0\\). A drumskin cannot be pulled onto its rim without tearing.',
		chapter,
		anchor: 'thm-no-retraction',
		see: ['retraction', 'brouwer-fixed-point-theorem']
	},
	{
		key: 'fixed-point',
		term: 'Fixed point',
		def: 'A point \\(x\\) with \\(f(x) = x\\): a point the map does not move.',
		chapter,
		anchor: 'thm-brouwer',
		see: ['brouwer-fixed-point-theorem', 'lefschetz-fixed-point-theorem']
	},
	{
		key: 'brouwer-fixed-point-theorem',
		term: 'Brouwer fixed point theorem',
		def: 'Every continuous map from the closed disk \\(D^n\\) to itself has a fixed point. Proof: otherwise the rays from \\(f(x)\\) through \\(x\\) would define a retraction of the disk onto its boundary.',
		chapter,
		anchor: 'thm-brouwer',
		see: ['no-retraction-theorem', 'fixed-point']
	},
	{
		key: 'fixed-point-index',
		term: 'Fixed-point index',
		def: 'A sign (or integer) attached to an isolated fixed point, measuring how the map turns around it; for a nondegenerate fixed point it is the sign of \\(\\det(I - Df)\\). The indices of all fixed points add up to the Lefschetz number.',
		chapter,
		anchor: 'brouwer',
		see: ['lefschetz-number']
	},
	{
		key: 'invariance-of-dimension',
		term: 'Invariance of dimension',
		def: 'If \\(\\mathbb R^m\\) and \\(\\mathbb R^n\\) are homeomorphic then \\(m = n\\). Proof: removing a point leaves spaces homotopy equivalent to \\(S^{m-1}\\) and \\(S^{n-1}\\), which homology tells apart.',
		chapter,
		anchor: 'thm-invariance-dimension',
		see: ['invariance-of-domain']
	},
	{
		key: 'invariance-of-domain',
		term: 'Invariance of domain',
		def: 'Brouwer’s theorem that a continuous one-to-one map from an open subset of \\(\\mathbb R^n\\) to \\(\\mathbb R^n\\) has open image. In particular a continuous bijection \\(\\mathbb R^n\\to\\mathbb R^n\\) is a homeomorphism.',
		chapter,
		anchor: 'dimension-and-jordan',
		see: ['invariance-of-dimension']
	},
	{
		key: 'jordan-curve-theorem',
		term: 'Jordan curve theorem',
		def: 'A simple closed curve in the plane separates it into exactly two connected pieces, a bounded inside and an unbounded outside. In homology: \\(\\tilde H_0(S^2\\setminus C)\\cong\\mathbb Z\\).',
		chapter,
		anchor: 'thm-jordan',
		see: ['winding-number']
	},
	{
		key: 'degree',
		term: 'Degree of a map',
		def: 'For \\(f\\colon S^n\\to S^n\\), the integer \\(d\\) such that \\(f_*\\colon H_n(S^n)\\to H_n(S^n)\\) is multiplication by \\(d\\). It counts preimages of a point with signs; for \\(n = 1\\) it is the winding number.',
		chapter,
		anchor: 'def-degree',
		see: ['antipodal-map', 'winding-number']
	},
	{
		key: 'antipodal-map',
		term: 'Antipodal map',
		def: 'The map \\(x\\mapsto -x\\) of a sphere, sending each point to the opposite point. On \\(S^n\\) it has degree \\((-1)^{n+1}\\): orientation-preserving on odd spheres, reversing on even ones.',
		chapter,
		anchor: 'prop-degree',
		see: ['degree', 'hairy-ball-theorem']
	},
	{
		key: 'tangent-vector-field',
		term: 'Tangent vector field (on a sphere)',
		def: 'A continuous choice of a vector \\(v(x)\\) tangent to the sphere at each point \\(x\\), i.e. with \\(x\\cdot v(x) = 0\\). Picture hair lying flat; a zero is a cowlick.',
		chapter,
		anchor: 'hairy-ball',
		see: ['hairy-ball-theorem']
	},
	{
		key: 'hairy-ball-theorem',
		term: 'Hairy ball theorem',
		def: '\\(S^n\\) has a nowhere-zero continuous tangent vector field exactly when \\(n\\) is odd. So every tangent field on the ordinary sphere \\(S^2\\) vanishes somewhere, while a torus can be combed flat.',
		chapter,
		anchor: 'thm-hairy-ball',
		see: ['tangent-vector-field', 'antipodal-map', 'degree']
	},
	{
		key: 'lefschetz-number',
		term: 'Lefschetz number',
		def: '\\(\\tau(f) = \\sum_n(-1)^n\\operatorname{tr}\\bigl(f_*\\text{ on } H_n(X;\\mathbb Q)\\bigr)\\): an alternating sum of traces of the induced maps. For the identity it is the Euler characteristic.',
		chapter,
		anchor: 'thm-lefschetz',
		see: ['lefschetz-fixed-point-theorem']
	},
	{
		key: 'lefschetz-fixed-point-theorem',
		term: 'Lefschetz fixed point theorem',
		def: 'If \\(X\\) is a finite simplicial complex (or a retract of one, such as a compact manifold) and \\(\\tau(f)\\neq 0\\), then \\(f\\colon X\\to X\\) has a fixed point. It generalizes Brouwer’s theorem.',
		chapter,
		anchor: 'thm-lefschetz',
		see: ['lefschetz-number', 'brouwer-fixed-point-theorem']
	},
	{
		key: 'commutator',
		term: 'Commutator',
		def: 'In a group, \\([g,h] = ghg^{-1}h^{-1}\\). It is the identity exactly when \\(g\\) and \\(h\\) commute. On a punctured torus the loop \\(aba^{-1}b^{-1}\\) runs around the hole.',
		chapter,
		anchor: 'def-abelianization',
		see: ['abelianization']
	},
	{
		key: 'abelianization',
		term: 'Abelianization',
		def: 'The quotient \\(G^{\\mathrm{ab}} = G/[G,G]\\) of a group by the subgroup generated by its commutators: the group with every pair of elements forced to commute.',
		chapter,
		anchor: 'def-abelianization',
		see: ['commutator', 'hurewicz-theorem']
	},
	{
		key: 'hurewicz-theorem',
		term: 'Hurewicz theorem (dimension 1)',
		def: 'For a path-connected space, \\(H_1(X)\\cong\\pi_1(X)^{\\mathrm{ab}}\\): first homology is the fundamental group made abelian. Loops become cycles, without a chosen basepoint.',
		chapter,
		anchor: 'thm-hurewicz',
		see: ['abelianization', 'fundamental-group']
	},
	{
		key: 'topological-invariance',
		term: 'Topological invariance of homology',
		def: 'Homeomorphic spaces have isomorphic homology groups, so Betti numbers and torsion belong to the space, not to the chosen triangulation.',
		chapter,
		anchor: 'homotopy-invariance',
		see: ['homotopy-invariance', 'singular-homology']
	}
];
