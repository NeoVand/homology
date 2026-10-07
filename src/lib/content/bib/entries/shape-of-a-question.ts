// Works cited in 0.1 The Shape of a Question. Each DOI was checked against
// Crossref and each url opened; quotations were checked against the source.
import type { Work } from '../index';

export const works: Work[] = [
	{
		key: 'richeson2021',
		authors: ['David S. Richeson'],
		year: 2021,
		title: 'Topology 101: The Hole Truth',
		venue: 'Quanta Magazine, 26 January 2021',
		url: 'https://www.quantamagazine.org/topology-101-how-mathematicians-study-holes-20210126/',
		free: true,
		kind: 'web'
	},
	{
		key: 'weisstein-hole',
		authors: ['Eric W. Weisstein'],
		year: 2026,
		title: 'Hole',
		venue: 'MathWorld — A Wolfram Resource (accessed October 2026)',
		url: 'https://mathworld.wolfram.com/Hole.html',
		free: true,
		kind: 'web'
	},
	{
		key: 'tubbenhauer2021',
		authors: ['Daniel Tubbenhauer'],
		year: 2021,
		title: 'What is…homology intuitively?',
		venue: 'VisualMath, YouTube (slides at dtubbenhauer.com)',
		url: 'https://www.youtube.com/watch?v=QanLUNiqZW0',
		free: true,
		kind: 'video'
	},
	{
		key: 'federico1982',
		authors: ['P. J. Federico'],
		year: 1982,
		title: 'Descartes on Polyhedra: A Study of the De Solidorum Elementis',
		venue: 'Springer, Sources in the History of Mathematics and Physical Sciences 4',
		doi: '10.1007/978-1-4612-5759-2',
		kind: 'book'
	},
	{
		key: 'lhuilier1813',
		authors: ['Simon Lhuilier'],
		year: 1813,
		title:
			'Mémoire sur la polyèdrométrie ; contenant une démonstration directe du théorème d’Euler sur les polyèdres, et un examen des diverses exceptions auxquelles ce théorème est assujetti',
		venue: 'Annales de mathématiques pures et appliquées 3 (1812–1813), 169–189',
		url: 'https://www.numdam.org/item/AMPA_1812-1813__3__169_0/',
		free: true,
		kind: 'paper'
	},
	{
		key: 'nash1951',
		authors: ['John Nash'],
		year: 1951,
		title: 'Non-cooperative games',
		venue: 'Annals of Mathematics 54(2), 286–295',
		doi: '10.2307/1969529',
		kind: 'paper'
	}
];
