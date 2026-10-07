// Works cited in §3.6 Exact sequences and Mayer–Vietoris. DOIs checked against
// Crossref; urls opened.
import type { Work } from '../index';

export const works: Work[] = [
	{
		key: 'kelley-pitcher1947',
		authors: ['J. L. Kelley', 'Everett Pitcher'],
		year: 1947,
		title: 'Exact homomorphism sequences in homology theory',
		venue: 'Annals of Mathematics 48(3), 682–709',
		doi: '10.2307/1969135',
		kind: 'paper'
	},
	{
		key: 'reitberger2002',
		authors: ['Heinrich Reitberger'],
		year: 2002,
		title: 'Leopold Vietoris (1891–2002)',
		venue: 'Notices of the American Mathematical Society 49(10), 1232–1236',
		url: 'https://www.ams.org/notices/200210/fea-vietoris.pdf',
		free: true,
		kind: 'paper'
	},
	{
		key: 'lessel2023',
		authors: ['Bernadette Lessel'],
		year: 2023,
		title: 'Walther Mayer – more than “Einstein’s calculator”',
		venue: 'Bits of History, Institute for Quantum Optics and Quantum Information (IQOQI) Vienna, 22 March 2023',
		url: 'https://www.iqoqi-vienna.at/blogs/blog/walther-mayer-more-than-einsteins-calculator',
		free: true,
		kind: 'web'
	},
	{
		key: 'whitehead1949',
		authors: ['J. H. C. Whitehead'],
		year: 1949,
		title: 'Combinatorial homotopy. I',
		venue: 'Bulletin of the American Mathematical Society 55(3), 213–245',
		doi: '10.1090/S0002-9904-1949-09175-9',
		free: true,
		kind: 'paper'
	},
	{
		key: 'zeeman1963',
		authors: ['E. C. Zeeman'],
		year: 1963,
		title: 'On the dunce hat',
		venue: 'Topology 2(4), 341–358',
		doi: '10.1016/0040-9383(63)90014-4',
		kind: 'paper'
	}
];
