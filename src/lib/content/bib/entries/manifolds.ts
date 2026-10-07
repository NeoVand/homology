// Works cited in §2.4 Manifolds and Surfaces (peano1890, brouwer1911dim and
// poincare1904 live in invariance.ts). Each DOI was checked against Crossref and
// each url opened (October 2026).
import type { Work } from '../index';

export const works: Work[] = [
	{
		key: 'riemann1854',
		authors: ['Bernhard Riemann'],
		year: 1854,
		title: 'On the Hypotheses which lie at the Bases of Geometry',
		venue: 'Habilitation lecture, Göttingen, 1854, published 1868; English translation by W. K. Clifford, Nature 8 (1873)',
		url: 'https://www.emis.de/classics/Riemann/WKCGeom.pdf',
		doi: '10.1038/008014a0',
		free: true,
		kind: 'paper'
	},
	{
		key: 'weyl1913',
		authors: ['Hermann Weyl'],
		year: 1913,
		title: 'Die Idee der Riemannschen Fläche',
		venue: 'Teubner, Leipzig',
		url: 'https://archive.org/details/dieideederrieman00weyluoft',
		free: true,
		kind: 'book'
	},
	{
		key: 'lee2011',
		authors: ['John M. Lee'],
		year: 2011,
		title: 'Introduction to Topological Manifolds (2nd edition)',
		venue: 'Springer, Graduate Texts in Mathematics 202',
		doi: '10.1007/978-1-4419-7940-7',
		kind: 'book'
	},
	{
		key: 'milnor1956',
		authors: ['John Milnor'],
		year: 1956,
		title: 'On manifolds homeomorphic to the 7-sphere',
		venue: 'Annals of Mathematics 64(2), 399–405',
		doi: '10.2307/1969983',
		kind: 'paper'
	},
	{
		key: 'whitney1944a',
		authors: ['Hassler Whitney'],
		year: '1944a',
		title: 'The self-intersections of a smooth n-manifold in 2n-space',
		venue: 'Annals of Mathematics 45(2), 220–246',
		doi: '10.2307/1969265',
		kind: 'paper'
	},
	{
		key: 'whitney1944b',
		authors: ['Hassler Whitney'],
		year: '1944b',
		title: 'The singularities of a smooth n-manifold in (2n − 1)-space',
		venue: 'Annals of Mathematics 45(2), 247–293',
		doi: '10.2307/1969266',
		kind: 'paper'
	},
	{
		key: 'dyck1888',
		authors: ['Walther von Dyck'],
		label: 'Dyck',
		year: 1888,
		title: 'Beiträge zur Analysis situs',
		venue: 'Mathematische Annalen 32, 457–512',
		doi: '10.1007/BF01443580',
		kind: 'paper'
	},
	{
		key: 'francis-weeks1999',
		authors: ['George K. Francis', 'Jeffrey R. Weeks'],
		year: 1999,
		title: 'Conway’s ZIP proof',
		venue: 'The American Mathematical Monthly 106(5), 393–399',
		doi: '10.2307/2589143',
		url: 'https://webhomes.maths.ed.ac.uk/~v1ranick/papers/francisweeks.pdf',
		free: true,
		kind: 'paper'
	},
	{
		key: 'gallier-xu2013',
		authors: ['Jean Gallier', 'Dianna Xu'],
		year: 2013,
		title: 'A Guide to the Classification Theorem for Compact Surfaces',
		venue: 'Springer, Geometry and Computing',
		doi: '10.1007/978-3-642-34364-3',
		kind: 'book'
	},
	{
		key: 'perelman2002',
		authors: ['Grisha Perelman'],
		year: 2002,
		title: 'The entropy formula for the Ricci flow and its geometric applications',
		venue: 'preprint',
		arxiv: 'math/0211159',
		free: true,
		kind: 'paper'
	},
	{
		key: 'perelman2003',
		authors: ['Grisha Perelman'],
		year: 2003,
		title: 'Ricci flow with surgery on three-manifolds',
		venue: 'preprint',
		arxiv: 'math/0303109',
		free: true,
		kind: 'paper'
	},
	{
		key: 'markov1958',
		authors: ['A. A. Markov'],
		year: 1958,
		title: 'The insolubility of the problem of homeomorphy',
		venue: 'Doklady Akademii Nauk SSSR 121(2), 218–220 (in Russian)',
		kind: 'paper'
	}
];
