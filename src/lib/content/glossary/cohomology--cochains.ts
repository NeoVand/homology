import type { GlossaryEntry } from './types';

const chapter = 'cohomology/cochains';

export const entries: GlossaryEntry[] = [
	{
		key: 'potential',
		term: 'Potential',
		def: 'A function \\(f\\) that assigns a number to every vertex of a graph or simplicial complex, such as a height or a voltage. Also called a height function; it is the same thing as a 0-cochain.',
		chapter,
		anchor: 'def-potential',
		see: ['discrete-gradient', 'cochain']
	},
	{
		key: 'discrete-gradient',
		term: 'Discrete gradient',
		def: 'The edge labelling \\(\\delta f\\) made from a potential \\(f\\): on an edge from \\(u\\) to \\(v\\), \\((\\delta f)(u \\to v) = f(v) - f(u)\\), “head minus tail”. Edge labellings of this form are called gradients.',
		chapter,
		anchor: 'def-potential',
		see: ['potential', 'gradient-test', 'coboundary-operator']
	},
	{
		key: 'edge-labelling',
		term: 'Edge labelling',
		def: 'A choice of a number (or of an element of a group) on every oriented edge — the same thing as a 1-cochain. Reversing the arrow on an edge changes the sign of its number. Also called an edge flow.',
		chapter,
		anchor: 'the-gradient-puzzle',
		see: ['cochain', 'loop-sum']
	},
	{
		key: 'loop-sum',
		term: 'Loop sum',
		def: 'The sum of an edge labelling around a closed walk, where edges walked against their arrows count with a minus sign. It is the pairing of the labelling with the loop, and the certificate that a labelling is not a gradient when it is not zero.',
		chapter,
		anchor: 'the-gradient-puzzle',
		see: ['gradient-test', 'pairing']
	},
	{
		key: 'telescoping-sum',
		term: 'Telescoping sum',
		def: 'A sum in which neighbouring terms cancel, leaving only the first and the last. The climbs along a path telescope: they add up to \\(f(\\text{end}) - f(\\text{start})\\), whatever the route.',
		chapter,
		anchor: 'places-and-measurements'
	},
	{
		key: 'kirchhoffs-voltage-law',
		term: 'Kirchhoff’s voltage law',
		def: 'In an electrical circuit, the voltages around any closed loop add up to zero. It holds because voltages across components are differences of potentials, which telescope.',
		chapter,
		anchor: 'places-and-measurements',
		see: ['loop-sum', 'discrete-gradient']
	},
	{
		key: 'gradient-test',
		term: 'Gradient test',
		def: 'An edge labelling is a gradient (a difference of potentials) if and only if its sum around every closed loop is zero. It is enough to check the \\(E - V + c = b_1\\) fundamental loops of a spanning tree.',
		chapter,
		anchor: 'gradient-test',
		see: ['loop-sum', 'discrete-gradient']
	},
	{
		key: 'locally-constant-function',
		term: 'Locally constant function',
		def: 'A function that is constant on each connected piece of a space but may take different values on different pieces. On a graph these are exactly the potentials with \\(\\delta f = 0\\).',
		chapter,
		anchor: 'what-never-changes',
		see: ['zeroth-cohomology']
	},
	{
		key: 'zeroth-cohomology',
		term: 'H⁰ (zeroth cohomology)',
		def: 'The locally constant functions on a space: the 0-cochains \\(f\\) with \\(\\delta f = 0\\). Its dimension is the number of connected components, \\(b_0\\).',
		chapter,
		anchor: 'what-never-changes',
		see: ['locally-constant-function', 'cohomology-group']
	},
	{
		key: 'discrete-curl',
		term: 'Discrete curl (circulation)',
		def: 'The sum of an edge labelling around the boundary of a filled triangle \\([a,b,c]\\): \\(\\psi(ab) + \\psi(bc) - \\psi(ac)\\). It is the coboundary \\(\\delta\\psi\\) evaluated on the triangle, and the curl of a gradient is always zero.',
		chapter,
		anchor: 'local-and-global',
		see: ['local-obstruction', 'coboundary-operator']
	},
	{
		key: 'local-obstruction',
		term: 'Local obstruction',
		def: 'A failure that can be detected by looking at one small piece at a time — for an edge labelling, a nonzero curl on a single filled triangle.',
		chapter,
		anchor: 'local-and-global',
		see: ['global-obstruction', 'discrete-curl']
	},
	{
		key: 'global-obstruction',
		term: 'Global obstruction',
		def: 'A failure that passes every local test but shows up around a loop that bounds nothing, such as the loop sum around the hole of an annulus. It is a nonzero cohomology class.',
		chapter,
		anchor: 'local-and-global',
		see: ['local-obstruction', 'cocycle', 'coboundary']
	},
	{
		key: 'cochain',
		term: 'Cochain',
		def: 'A \\(k\\)-cochain assigns a number (or an element of a group \\(G\\)) to every \\(k\\)-simplex, and is extended to chains by adding up. Chains are places; cochains are measurements.',
		chapter,
		anchor: 'def-cochains',
		see: ['pairing', 'coboundary-operator', 'cochain-group']
	},
	{
		key: 'pairing',
		term: 'Pairing',
		def: '\\(\\langle \\varphi, c \\rangle = \\varphi(c) = \\sum_i c_i\\, \\varphi(\\sigma_i)\\) for a cochain \\(\\varphi\\) and a chain \\(c = \\sum_i c_i \\sigma_i\\): measuring \\(\\varphi\\) over the place \\(c\\), like integrating.',
		chapter,
		anchor: 'def-cochains',
		see: ['cochain', 'discrete-stokes-theorem']
	},
	{
		key: 'coboundary-operator',
		term: 'Coboundary operator',
		def: 'The map \\(\\delta\\colon C^k \\to C^{k+1}\\) given by \\((\\delta\\varphi)(\\sigma) = \\varphi(\\partial\\sigma)\\): the discrete gradient in degree 0, the discrete curl in degree 1. It satisfies \\(\\delta\\delta = 0\\), and its matrix is the transpose of a boundary matrix, \\(\\delta_k = \\partial_{k+1}^{\\mathsf T}\\).',
		chapter,
		anchor: 'def-coboundary',
		see: ['cochain', 'discrete-stokes-theorem']
	},
	{
		key: 'discrete-stokes-theorem',
		term: 'Discrete Stokes theorem',
		def: '\\(\\langle \\delta\\varphi, c \\rangle = \\langle \\varphi, \\partial c \\rangle\\) for every cochain \\(\\varphi\\) and chain \\(c\\): measuring the change of \\(\\varphi\\) over a region equals measuring \\(\\varphi\\) on the region’s boundary. In degree 0 it is telescoping.',
		chapter,
		anchor: 'the-coboundary',
		see: ['coboundary-operator', 'pairing', 'telescoping-sum']
	},
	{
		key: 'cocycle',
		term: 'Cocycle (closed cochain)',
		def: 'A cochain \\(\\varphi\\) with \\(\\delta\\varphi = 0\\). For an edge labelling: its curl is zero on every filled triangle, so it passes every local test.',
		chapter,
		anchor: 'def-cocycles',
		see: ['coboundary', 'global-obstruction']
	},
	{
		key: 'coboundary',
		term: 'Coboundary (exact cochain)',
		def: 'A cochain of the form \\(\\delta g\\) for some cochain \\(g\\) one degree lower — for an edge labelling, a gradient. Every coboundary is a cocycle because \\(\\delta\\delta = 0\\); the converse can fail around holes.',
		chapter,
		anchor: 'def-cocycles',
		see: ['cocycle', 'discrete-gradient']
	},
	{
		key: 'penrose-staircase',
		term: 'Penrose staircase',
		def: 'An impossible staircase that climbs at every step yet returns to where it started. Labelling each step \\(+1\\) gives a loop sum equal to the number of steps, so no height function exists; a real model must hide a cliff.',
		chapter,
		anchor: 'impossible-figures',
		see: ['global-obstruction', 'penrose-triangle']
	},
	{
		key: 'penrose-triangle',
		term: 'Penrose triangle (tribar)',
		def: 'Three square beams joined at right angles into an impossible triangle. Roger Penrose (1991) explained it as a nonzero cohomology class whose coefficients are scale factors, combined by multiplication.',
		chapter,
		anchor: 'impossible-figures',
		see: ['penrose-staircase']
	},
	{
		key: 'arbitrage',
		term: 'Arbitrage',
		def: 'A loop of currency trades that ends with more money than it began with. Using logarithms of exchange rates as an edge labelling, a market is free of arbitrage exactly when the labelling is a gradient.',
		chapter,
		anchor: 'impossible-figures',
		see: ['gradient-test', 'loop-sum']
	},
	{
		key: 'hodge-decomposition',
		term: 'Hodge decomposition',
		def: 'Every edge flow splits in exactly one way into a gradient, a curl part (swirls around filled triangles) and a harmonic part, the three being mutually perpendicular. The harmonic part represents the global obstruction.',
		chapter,
		anchor: 'hodge-decomposition',
		see: ['harmonic-flow', 'hodgerank']
	},
	{
		key: 'harmonic-flow',
		term: 'Harmonic flow',
		def: 'An edge flow with zero curl on every filled triangle and zero net flow at every vertex. Harmonic flows live around the holes; each cohomology class (over \\(\\mathbb{R}\\)) contains exactly one, its most spread-out representative.',
		chapter,
		anchor: 'hodge-decomposition',
		see: ['hodge-decomposition']
	},
	{
		key: 'hodgerank',
		term: 'HodgeRank',
		def: 'A method of Jiang, Lim, Yao and Ye (2011) that ranks items from pairwise comparisons with the Hodge decomposition: the gradient part gives the ranking, the curl and harmonic parts measure local and global inconsistencies.',
		chapter,
		anchor: 'hodge-decomposition',
		see: ['hodge-decomposition']
	}
];
