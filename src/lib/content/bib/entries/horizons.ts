// Works cited in §5.3 Horizons. DOIs checked against Crossref, urls opened,
// YouTube links checked with the oEmbed endpoint.
import type { Work } from '../index';

export const works: Work[] = [
	{
		key: 'warner1983',
		authors: ['Frank W. Warner'],
		year: 1983,
		title: 'Foundations of Differentiable Manifolds and Lie Groups',
		venue: 'Springer, Graduate Texts in Mathematics 94',
		doi: '10.1007/978-1-4757-1799-0',
		kind: 'book'
	},
	{
		key: 'atiyah-hirzebruch1961',
		authors: ['Michael F. Atiyah', 'Friedrich Hirzebruch'],
		year: 1961,
		title: 'Vector bundles and homogeneous spaces',
		venue: 'Proceedings of Symposia in Pure Mathematics 3, 7–38',
		doi: '10.1090/pspum/003/0139181',
		kind: 'paper'
	},
	{
		key: 'bott1959',
		authors: ['Raoul Bott'],
		year: 1959,
		title: 'The stable homotopy of the classical groups',
		venue: 'Annals of Mathematics 70(2), 313–337',
		doi: '10.2307/1970106',
		kind: 'paper'
	},
	{
		key: 'adams-atiyah1966',
		authors: ['J. Frank Adams', 'Michael F. Atiyah'],
		year: 1966,
		title: 'K-theory and the Hopf invariant',
		venue: 'Quarterly Journal of Mathematics 17(1), 31–38',
		doi: '10.1093/qmath/17.1.31',
		kind: 'paper'
	},
	{
		key: 'thom1954',
		authors: ['René Thom'],
		year: 1954,
		title: 'Quelques propriétés globales des variétés différentiables',
		venue: 'Commentarii Mathematici Helvetici 28, 17–86',
		doi: '10.1007/BF02566923',
		kind: 'paper'
	},
	{
		key: 'brown1962',
		authors: ['Edgar H. Brown'],
		year: 1962,
		title: 'Cohomology theories',
		venue: 'Annals of Mathematics 75(3), 467–484',
		doi: '10.2307/1970209',
		kind: 'paper'
	},
	{
		key: 'serre1953b',
		authors: ['Jean-Pierre Serre'],
		year: '1953b',
		title: 'Cohomologie modulo 2 des complexes d’Eilenberg–MacLane',
		venue: 'Commentarii Mathematici Helvetici 27, 198–232',
		doi: '10.1007/BF02564562',
		kind: 'paper'
	},
	{
		key: 'isaksen-wang-xu2023',
		authors: ['Daniel C. Isaksen', 'Guozhen Wang', 'Zhouli Xu'],
		year: 2023,
		title: 'Stable homotopy groups of spheres: from dimension 0 to 90',
		venue: 'Publications Mathématiques de l’IHÉS 137, 107–243',
		doi: '10.1007/s10240-023-00139-1',
		arxiv: '2001.04511',
		url: 'https://arxiv.org/abs/2001.04511',
		free: true,
		kind: 'paper'
	},
	{
		key: 'deligne1974',
		authors: ['Pierre Deligne'],
		year: 1974,
		title: 'La conjecture de Weil. I',
		venue: 'Publications Mathématiques de l’IHÉS 43, 273–307',
		doi: '10.1007/BF02684373',
		url: 'https://www.numdam.org/item/PMIHES_1974__43__273_0/',
		free: true,
		kind: 'paper'
	},
	{
		key: 'kitaev2009',
		authors: ['Alexei Kitaev'],
		year: 2009,
		title: 'Periodic table for topological insulators and superconductors',
		venue: 'AIP Conference Proceedings 1134, 22–30',
		doi: '10.1063/1.3149495',
		arxiv: '0901.2686',
		url: 'https://arxiv.org/abs/0901.2686',
		free: true,
		kind: 'paper'
	},
	{
		key: 'atiyah1988',
		authors: ['Michael F. Atiyah'],
		year: 1988,
		title: 'Topological quantum field theory',
		venue: 'Publications Mathématiques de l’IHÉS 68, 175–186',
		doi: '10.1007/BF02698547',
		url: 'https://www.numdam.org/item/PMIHES_1988__68__175_0/',
		free: true,
		kind: 'paper'
	},
	{
		key: 'farber2003',
		authors: ['Michael Farber'],
		year: 2003,
		title: 'Topological complexity of motion planning',
		venue: 'Discrete & Computational Geometry 29, 211–221',
		doi: '10.1007/s00454-002-0760-9',
		arxiv: 'math/0111197',
		url: 'https://arxiv.org/abs/math/0111197',
		free: true,
		kind: 'paper'
	},
	{
		key: 'kronheimer-mrowka2011',
		authors: ['Peter B. Kronheimer', 'Tomasz S. Mrowka'],
		year: 2011,
		title: 'Khovanov homology is an unknot-detector',
		venue: 'Publications Mathématiques de l’IHÉS 113, 97–208',
		doi: '10.1007/s10240-010-0030-y',
		arxiv: '1005.4346',
		url: 'https://arxiv.org/abs/1005.4346',
		free: true,
		kind: 'paper'
	}
];
